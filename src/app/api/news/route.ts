    // src/app/api/news/route.ts
    import { NextResponse } from 'next/server';
    import fs from 'fs';
    import path from 'path';

    // 定义 news.json 文件路径
    const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json');
    const HISTORY_FILE_PATH = path.join(process.cwd(), 'data', 'news_history.json');
    const MAX_HISTORY_LENGTH = 10; // 最多保留 10 条历史记录

    // --- Default news structure ---
    const defaultNews = { title: "(No News Available)", news: [] };

    // --- Interface for News Data ---
    interface NewsData {
      title: string;
      news: string[];
    }

    // --- Interface for History Entry ---
    interface HistoryEntry {
      timestamp: string;
      title: string;
      news: string[];
    }

    // --- GET Handler (Modified for new data structure and standard response) ---
    export async function GET() {
      try {
        const jsonData = await fs.promises.readFile(NEWS_FILE_PATH, 'utf-8');
        try {
          const data = JSON.parse(jsonData);
          if (typeof data === 'object' && data !== null && Array.isArray(data.news) && typeof data.title === 'string') {
            if (data.news.every((item: unknown) => typeof item === 'string')) {
              // Standard success response
              return NextResponse.json({ success: true, data: data }, { status: 200 });
            } else {
               console.warn('Invalid news array items in news.json, returning default.');
               // Standard success response with default data
               return NextResponse.json({ success: true, data: defaultNews }, { status: 200 });
            }
          } else {
             if (Array.isArray(data) && data.every(item => typeof item === 'string')) {
                console.log('Found legacy news format (string array), wrapping with default title.');
                // Standard success response wrapping legacy data
                return NextResponse.json({ success: true, data: { title: "(Untitled Legacy News)", news: data } }, { status: 200 });
             } else {
                 console.warn('Invalid data format in news.json (neither object nor string array), returning default.');
                 // Standard success response with default data
                return NextResponse.json({ success: true, data: defaultNews }, { status: 200 });
             }
          }
        } catch (parseError) {
          console.error('Error parsing news.json:', parseError);
          // Standard error response
          return NextResponse.json({ success: false, error: { code: 'PARSE_ERROR', message: 'Failed to parse news data' } }, { status: 500 });
        }
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          console.log('news.json not found, returning default news.');
          // Standard success response with default data (treating not found as default success)
          return NextResponse.json({ success: true, data: defaultNews }, { status: 200 });
        } else {
          console.error('API GET /api/news Error reading file:', error);
          // Standard error response
          return NextResponse.json({ success: false, error: { code: 'READ_ERROR', message: 'Failed to read news data' } }, { status: 500 });
        }
      }
    }

    // --- POST Handler (Modified for new data structure, history, and standard response) ---
    export async function POST(req: Request) {
      try {
        // 1. Parse and validate the incoming request body
        let newNewsData: NewsData;
        try {
          const rawData = await req.json();
          // Validate incoming data structure
          if (
            typeof rawData !== 'object' || rawData === null ||
            typeof rawData.title !== 'string' || !Array.isArray(rawData.news) ||
            !rawData.news.every((item: unknown) => typeof item === 'string')
          ) {
            throw new Error('Invalid data format. Expected { title: string, news: string[] }.');
          }
          newNewsData = rawData;
        } catch (parseError) {
          // Standard error response for invalid input
          return NextResponse.json({ success: false, error: { code: 'INVALID_INPUT', message: 'Invalid JSON or data format in request body.' } }, { status: 400 });
        }

        // 2. Read current news data (to be saved as history)
        let currentNewsData: NewsData = { title: "(Previously Untitled)", news: [] }; // Default if file not found or invalid
        try {
          const currentJsonData = await fs.promises.readFile(NEWS_FILE_PATH, 'utf-8');
          try {
            const parsedCurrent = JSON.parse(currentJsonData);
            // Try parsing as new format { title, news }
            if (typeof parsedCurrent === 'object' && parsedCurrent !== null && typeof parsedCurrent.title === 'string' && Array.isArray(parsedCurrent.news) && parsedCurrent.news.every((i:unknown) => typeof i === 'string')) {
              currentNewsData = parsedCurrent;
            // Try parsing as old format string[]
            } else if (Array.isArray(parsedCurrent) && parsedCurrent.every(i => typeof i === 'string')) {
              console.log('Found legacy format in news.json while saving history.');
              currentNewsData = { title: "(Untitled Legacy News)", news: parsedCurrent };
            } else {
              console.warn('Could not parse current news.json into known format for history.');
            }
          } catch (parseError) {
            console.warn('Error parsing current news.json for history:', parseError);
          }
        } catch (error) {
          if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            console.log('news.json not found when saving history, starting fresh.');
          } else {
            console.warn('Error reading current news.json for history:', error);
          }
          // Proceed with default currentNewsData
        }

        // 3. Update history file (only if new data differs from current)
        // Compare both title and news content
        const isDifferent = JSON.stringify(currentNewsData.news) !== JSON.stringify(newNewsData.news) || currentNewsData.title !== newNewsData.title;

        if (isDifferent) {
          try {
            let history: HistoryEntry[] = [];
            try {
              const historyJsonData = await fs.promises.readFile(HISTORY_FILE_PATH, 'utf-8');
              const parsedHistory = JSON.parse(historyJsonData);
              // Basic validation of history format
              if (Array.isArray(parsedHistory)) {
                 // Further check if items match HistoryEntry structure if needed
                 history = parsedHistory;
              } else {
                 console.warn('news_history.json format is invalid, starting fresh history.');
              }
            } catch (histError) {
              if (histError instanceof Error && 'code' in histError && histError.code === 'ENOENT') {
                console.log('news_history.json not found, creating new history file.');
              } else {
                console.warn('Error reading or parsing news_history.json:', histError);
              }
              // Initialize history as empty array if file not found or parse error
              history = [];
            }

            // Create the new history entry using the *current* data
            const newHistoryEntry: HistoryEntry = {
              timestamp: new Date().toISOString(),
              title: currentNewsData.title, // Use the title from the current data
              news: currentNewsData.news,  // Use the news from the current data
            };

            // Add to history and limit size
            history.unshift(newHistoryEntry);
            if (history.length > MAX_HISTORY_LENGTH) {
              history = history.slice(0, MAX_HISTORY_LENGTH);
            }

            // Write updated history back to file
            await fs.promises.writeFile(HISTORY_FILE_PATH, JSON.stringify(history, null, 2), 'utf-8');
            console.log('News history updated.');

          } catch (histUpdateError) {
            console.error('Error updating news history:', histUpdateError);
            // Log error but don't block saving the main news file - consider if this should return an error?
            // For now, proceeding as before.
          }
        } else {
          console.log('New news data is identical to current version. Skipping history update.');
        }

        // 4. Write the *new* news data to news.json
        const jsonToWrite = JSON.stringify(newNewsData, null, 2);
        await fs.promises.writeFile(NEWS_FILE_PATH, jsonToWrite, 'utf-8');
        console.log('News data updated successfully.');

        // 5. Return the newly saved data in standard success format
        return NextResponse.json({ success: true, data: newNewsData }, { status: 200 });

      } catch (error) {
        // Catch unexpected errors during the process
        console.error('Unexpected API POST /api/news Error:', error);
        // Standard error response for internal error
        return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update news data due to an internal error.' } }, { status: 500 });
      }
    }

    // 可选：添加 OPTIONS handler 以支持 CORS (如果从不同域调用 API)
    // export async function OPTIONS() {
    //   return new NextResponse(null, {
    //     status: 204,
    //     headers: {
    //       'Allow': 'GET, POST, OPTIONS',
    //       // Add CORS headers if needed
    //     },
    //   });
    // }