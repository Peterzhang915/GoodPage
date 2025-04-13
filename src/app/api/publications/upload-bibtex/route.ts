    // src/app/api/publications/upload-bibtex/route.ts
    import { NextResponse } from 'next/server';
    import { PrismaClient, Publication } from '@prisma/client';
    import bibtexParse from '@orcid/bibtex-parse-js';

    const prisma = new PrismaClient();

    // Helper function to extract DOI from various BibTeX fields
    function extractDoi(entry: any): string | null {
        const doiValue = entry.entryTags?.DOI || entry.entryTags?.doi;
        if (doiValue) {
            // Basic cleanup: remove potential "https://" or "doi.org/" prefixes
            return doiValue.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, '').trim();
        }
        return null;
    }

    // Helper function to extract year, handling potential string/number issues
    function extractYear(entry: any): number | null {
        const yearValue = entry.entryTags?.YEAR || entry.entryTags?.year;
        if (yearValue) {
            const yearNum = parseInt(yearValue, 10);
            return isNaN(yearNum) ? null : yearNum;
        }
        return null;
    }

    // Helper function to extract PDF URL (might be in 'url' or 'pdf' field)
    function extractPdfUrl(entry: any): string | null {
        return entry.entryTags?.PDF || entry.entryTags?.pdf || entry.entryTags?.URL || entry.entryTags?.url || null;
    }

    // Helper function to get venue (preference order: journal, booktitle, series)
    function extractVenue(entry: any): string | null {
        return entry.entryTags?.JOURNAL || entry.entryTags?.journal ||
               entry.entryTags?.BOOKTITLE || entry.entryTags?.booktitle ||
               entry.entryTags?.SERIES || entry.entryTags?.series || null;
    }

    export async function POST(request: Request) {
      console.log('Received request to /api/publications/upload-bibtex');
      let processedForReview = 0;
      let skippedOrExisting = 0;
      let parseErrorOccurred = false;

      try {
        const formData = await request.formData();
        const file = formData.get('bibtexFile') as File | null;

        if (!file) {
          console.error('No file uploaded');
          return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (file.type !== 'application/x-bibtex' && !file.name.endsWith('.bib')) {
            console.error('Invalid file type:', file.type, file.name);
            return NextResponse.json({ error: 'Invalid file type. Please upload a .bib file.' }, { status: 400 });
        }

        console.log(`Processing file: ${file.name}, Size: ${file.size}`);

        const fileContent = await file.text();

        // --- 解析 BibTeX ---
        let parsedEntries: any[] = [];
        try {
          parsedEntries = bibtexParse.toJSON(fileContent);
          console.log(`Successfully parsed ${parsedEntries.length} entries from BibTeX file.`);
        } catch (parseError) {
          console.error('Error parsing BibTeX file:', parseError);
          parseErrorOccurred = true; // Mark that a parsing error happened
          // Continue processing entries that might have parsed successfully before the error
          if (!Array.isArray(parsedEntries)) parsedEntries = [];
           // Optionally return error immediately, or try processing successfully parsed entries
           // return NextResponse.json({ error: 'Failed to parse BibTeX file. Check format.' }, { status: 400 });
           console.warn('Parsing error encountered, attempting to process successfully parsed entries before error.')
        }

        if (!Array.isArray(parsedEntries)) {
             console.error('Parsed data is not an array:', parsedEntries);
             return NextResponse.json({ error: 'Parsed BibTeX data is not in the expected format (array).' }, { status: 500 });
        }


        // --- 数据库比对与存储逻辑 ---
        if (parsedEntries.length > 0) {
            // 1. 从数据库获取现有出版物的 DOI 和 标题+年份 组合，用于快速查找
            //    （仅选择必要的字段以提高效率）
            const existingPublications = await prisma.publication.findMany({
                select: {
                    doi_url: true,
                    title: true,
                    year: true
                }
            });
            // 创建一个 Set 用于快速检查 DOI 是否存在 (忽略大小写和 http 前缀)
            const existingDois = new Set(
                existingPublications
                    .map(p => p.doi_url?.toLowerCase().replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, '').trim())
                    .filter((doi): doi is string => !!doi) // Filter out null/undefined DOIs
            );
             // 创建一个 Set 用于快速检查 Title+Year 是否存在 (忽略大小写和空格)
             const existingTitleYears = new Set(
                 existingPublications
                     .map(p => `${p.title?.toLowerCase().trim()}|${p.year}`)
                     .filter(ty => ty && ty !== '|null') // Filter out entries without title or year
             );


            console.log(`Found ${existingDois.size} existing DOIs and ${existingTitleYears.size} existing Title+Years in the database.`);

            // 2. 遍历解析出的 BibTeX 条目
            for (const entry of parsedEntries) {
                if (!entry || !entry.entryTags) {
                   console.warn('Skipping invalid or empty BibTeX entry:', entry);
                   skippedOrExisting++;
                   continue;
               }

                const entryTags = entry.entryTags;
                const title = entryTags.TITLE || entryTags.title;
                const year = extractYear(entry);
                const doi = extractDoi(entry);
                const rawAuthors = entryTags.AUTHOR || entryTags.author; // Store raw author string

                // 3. 检查是否已存在
                let exists = false;
                const normalizedDoi = doi?.toLowerCase().trim();
                const normalizedTitleYear = title ? `${title.toLowerCase().trim()}|${year}` : null;


                if (normalizedDoi && existingDois.has(normalizedDoi)) {
                    exists = true;
                    // console.log(`DOI match found, skipping: ${normalizedDoi}`);
                } else if (normalizedTitleYear && existingTitleYears.has(normalizedTitleYear)) {
                    // Fallback check using title and year if DOI is missing or didn't match
                    exists = true;
                     // console.log(`Title+Year match found, skipping: ${normalizedTitleYear}`);
                }

                if (exists) {
                    skippedOrExisting++;
                    continue; // 跳过已存在的条目
                }

                // 4. 对新条目：准备数据并存入数据库
                try {
                    const newPublicationData = {
                        title: title || 'Title Missing', // 提供默认值以防万一
                        venue: extractVenue(entry),
                        year: year,
                        // ccf_rank: null, // CCF Rank 在审核阶段处理
                        abstract: entryTags.ABSTRACT || entryTags.abstract,
                        keywords: entryTags.KEYWORDS || entryTags.keywords,
                        doi_url: doi, // 存储清理后的 DOI
                        pdf_url: extractPdfUrl(entry),
                        bibtex_entry: JSON.stringify(entry), // 存储原始解析的 JSON 条目
                        source: 'bibtex_import',
                        status: 'pending_review', // 设置状态为待审核
                        raw_authors: rawAuthors, // 存储原始作者字符串
                        // 'authors' 关联将在审核阶段处理
                    };

                    // 确保 year 是数字或 null
                    if (newPublicationData.year !== null && typeof newPublicationData.year !== 'undefined' && isNaN(newPublicationData.year)) {
                       console.warn(`Invalid year format for title "${title}", setting to null.`);
                       newPublicationData.year = null;
                    }


                    await prisma.publication.create({
                        data: newPublicationData as any, // Use 'as any' carefully, or define a proper type/interface matching the data shape
                    });

                    processedForReview++;
                    // 将新添加的标识符也加入 Set，避免同一文件中重复添加
                    if (normalizedDoi) existingDois.add(normalizedDoi);
                    if (normalizedTitleYear) existingTitleYears.add(normalizedTitleYear);

                } catch (dbError) {
                    console.error(`Error saving publication "${title}" to database:`, dbError);
                    skippedOrExisting++; // 保存失败也算跳过
                }
            }
        }

        console.log(`BibTeX processing complete. Added: ${processedForReview}, Skipped/Existing: ${skippedOrExisting}`);

        let message = `File processed successfully. Found ${parsedEntries.length} entries. ${processedForReview} new entries added for review. ${skippedOrExisting} entries were skipped (already exist or error).`;
        if (parseErrorOccurred) {
            message += " Warning: Errors occurred during BibTeX parsing, some entries might have been missed.";
        }


        return NextResponse.json({
            message: message,
            totalParsed: parsedEntries.length,
            processedForReview: processedForReview,
            skippedOrExisting: skippedOrExisting,
        }, { status: 200 });

      } catch (error) {
        console.error('Error processing BibTeX upload:', error);
        if (error instanceof Error) {
             return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
        }
        return NextResponse.json({ error: 'Internal server error during file upload.' }, { status: 500 });
      } finally {
        // 确保 Prisma Client 连接被断开 (在 serverless 环境中可能不是必须的，但良好实践)
        // await prisma.$disconnect(); // 在 serverless/edge 中可能不需要手动断开
      }
    }