// src/app/publications/page.tsx
import React from 'react';
// 【修改】从正确的文件导入类型和函数
import { getAllPublicationsFormatted } from '@/lib/publications';
import type { PublicationInfo, AuthorInfo } from '@/lib/types'; // 导入 PublicationInfo 和 AuthorInfo
import Link from 'next/link';
import { BookOpen, Link as LinkIcon, FileText, Calendar, Users, Copy } from 'lucide-react';
import { themeColors } from '@/styles/theme';

// --- 单个论文条目组件 ---
// 修改: pub 的类型变为 PublicationInfo (来自 types.ts)
function PublicationItem({ pub }: { pub: PublicationInfo }) {
    const pdfHref = pub.pdf_url
        ? pub.pdf_url.startsWith('http') ? pub.pdf_url : `/pdfs/${pub.pdf_url}`
        : undefined;

    // ... handleCopyBibtex (如果需要作为 Client Component) ...

    return (
        <li id={`pub-${pub.id}`} className={`mb-6 md:mb-8 p-4 md:p-6 ${themeColors.backgroundWhite ?? 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border ${themeColors.borderLight ?? 'border-gray-200 dark:border-gray-700'} scroll-mt-20`}>
            <h3 className={`text-base md:text-lg font-semibold ${themeColors.textColorPrimary ?? ''} mb-2 leading-tight flex items-start`}>
                <BookOpen className={`w-5 h-5 mr-2 mt-0.5 ${themeColors.primary ?? 'text-blue-600'} flex-shrink-0`} />
                <span className="flex-grow">{pub.title}</span>
            </h3>

            {pub.authors && pub.authors.length > 0 && (
                <div className={`text-sm ${themeColors.textColorSecondary ?? ''} mb-2 pl-7 flex items-center flex-wrap gap-x-1.5 gap-y-1`}>
                    <Users className={`w-4 h-4 mr-1 ${themeColors.textColorTertiary ?? 'text-gray-500'} flex-shrink-0`} />
                    {/* 【修复 TS7006】: 为 author 和 index 添加显式类型 */}
                    {pub.authors.map((author: AuthorInfo, index: number) => (
                        <span key={author.id} className="inline-block">
                            <Link
                               href={`/members/${author.id}`}
                               className={`${themeColors.linkColor ?? 'text-blue-600'} hover:underline transition-colors`}
                             >
                                {author.name_zh || author.name_en}
                            </Link>
                            {index < pub.authors.length - 1 ? <span className="ml-0.5 mr-0.5">,</span> : ''}
                        </span>
                    ))}
                </div>
            )}

            {/* ... 其他部分 (Venue, Year, CCF, Abstract, Keywords, Links) 保持不变 ... */}
            <div className={`text-xs sm:text-sm ${themeColors.textColorTertiary ?? 'text-gray-500'} mb-3 pl-7 flex flex-wrap items-center gap-x-4 gap-y-1`}>
                {pub.venue && (<span className="flex items-center"><i>{pub.venue}</i></span>)}
                {pub.year && (<span className="flex items-center"><Calendar className={`w-4 h-4 mr-1 flex-shrink-0`} /> {pub.year}</span>)}
                {pub.ccf_rank && (<span className={`px-2 py-0.5 rounded-md text-xs font-medium ${ pub.ccf_rank === 'A' ? `${themeColors.ccfAText ?? 'text-blue-900'} ${themeColors.ccfABg ?? 'bg-blue-200'}` : pub.ccf_rank === 'B' ? `${themeColors.ccfBText ?? 'text-blue-700'} ${themeColors.ccfBBg ?? 'bg-blue-100'}` : pub.ccf_rank === 'C' ? `${themeColors.ccfCText ?? 'text-blue-600'} ${themeColors.ccfCBg ?? 'bg-blue-50'}` : 'bg-gray-100 text-gray-600' }`}> CCF {pub.ccf_rank} </span>)}
                {pub.type && pub.type !== 'CONFERENCE' && pub.type !== 'JOURNAL' && (<span className={`px-2 py-0.5 rounded-md text-xs font-medium bg-opacity-15 ${themeColors.backgroundDark ?? 'bg-gray-500'} ${themeColors.textColorSecondary ?? 'text-gray-700'}`}>{pub.type}</span>)}
            </div>
            {pub.abstract && (<details className={`text-sm ${themeColors.textColorSecondary ?? ''} mt-3 group pl-7`}><summary className={`cursor-pointer ${themeColors.linkColor ?? 'text-blue-600'} hover:underline font-medium list-none group-open:mb-2 text-xs sm:text-sm`}>Show Abstract</summary><p className={`italic ${themeColors.textColorTertiary ?? 'text-gray-600'} border-l-2 ${themeColors.borderLight ?? 'border-gray-300'} pl-3 text-xs sm:text-sm leading-relaxed`}>{pub.abstract}</p></details>)}
            {pub.keywords && (<div className={`mt-3 text-xs sm:text-sm ${themeColors.textColorTertiary ?? 'text-gray-500'} pl-7`}><span className="font-semibold mr-1">Keywords:</span> {pub.keywords}</div>)}
            {(pub.doi_url || pdfHref || pub.slides_url || pub.video_url || pub.code_repository_url || pub.project_page_url || pub.bibtex) && (
                <div className="mt-4 pl-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    {pub.doi_url && (<a href={`https://doi.org/${pub.doi_url}`} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor ?? 'text-blue-600'} hover:underline transition-colors font-medium flex items-center`}><LinkIcon className="w-4 h-4 mr-1" /> DOI</a>)}
                    {pdfHref && pdfHref !== '#' && (<a href={pdfHref} target="_blank" rel="noopener noreferrer" className={`${themeColors.primary ?? 'text-red-600'} hover:underline transition-colors font-medium flex items-center`}><FileText className="w-4 h-4 mr-1" /> PDF</a>)}
                    {/* 其他链接占位符 */}
                </div>
             )}
        </li>
    );
}

// --- 主页面组件 (Server Component) ---
export default async function PublicationsPage() {
  // 调用正确的函数
  let publications: PublicationInfo[] = [];
  let error: string | null = null;

  try {
      publications = await getAllPublicationsFormatted();
  } catch (err) {
      console.error("Failed to load publications:", err);
      error = err instanceof Error ? err.message : "无法加载出版物列表";
  }

  // 按年份分组逻辑 (使用 PublicationInfo 类型)
  const groupedPublications: Record<string, PublicationInfo[]> = {};
  publications.forEach(pub => {
    const year = pub.year.toString();
    if (!groupedPublications[year]) groupedPublications[year] = [];
    groupedPublications[year].push(pub);
  });
  const sortedYears = Object.keys(groupedPublications).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className={`text-3xl sm:text-4xl font-bold text-center ${themeColors.textColorPrimary ?? ''} mb-12 md:mb-16`}>Publications</h1>

      {/* 错误处理 */}
      {error && (<p className={`text-center text-red-600 dark:text-red-400 ${themeColors.footerBackground ?? 'bg-red-50'} p-4 rounded-lg`}>Error: {error}</p>)}

      {/* 主内容区域 */}
      {!error && publications.length > 0 ? (
        sortedYears.map(year => (
          <section key={year} className="mb-12 md:mb-16">
            <h2 id={`year-${year}`} className={`text-2xl sm:text-3xl font-semibold ${themeColors.textColorPrimary ?? ''} border-b ${themeColors.footerBorder ?? 'border-gray-300'} pb-3 mb-8 scroll-mt-20`}>{year}</h2>
            <ul className="list-none p-0">
              {groupedPublications[year].map((pub) => (
                // 传递 PublicationInfo 类型的 pub
                <PublicationItem key={pub.id ?? pub.doi_url ?? pub.title} pub={pub} />
              ))}
            </ul>
          </section>
        ))
      ) : (
        !error && <p className={`text-center ${themeColors.textColorTertiary ?? 'text-gray-500'} text-lg mt-8`}>No publications found.</p>
      )}
    </div>
  );
}