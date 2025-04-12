import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// 定义历史文件路径
const HISTORY_FILE_PATH = path.join(process.cwd(), 'data', 'news_history.json');

// --- Interface for History Entry ---
// Ensure this matches the structure used in POST /api/news
interface HistoryEntry {
  timestamp: string;
  title: string;
  news: string[];
}

// Default empty history
const defaultHistory: HistoryEntry[] = [];

export async function GET() {
  try {
    const historyJsonData = await fs.promises.readFile(HISTORY_FILE_PATH, 'utf-8');
    try {
      const historyData = JSON.parse(historyJsonData);

      // Validate the overall structure (must be an array)
      if (!Array.isArray(historyData)) {
        console.warn('Invalid data format in news_history.json. Expected an array, returning default.');
        return NextResponse.json(defaultHistory, { status: 200 });
      }

      // Optional: Validate each entry more thoroughly if needed
      // For now, we assume the POST ensures correct structure
      // Example validation (could be stricter):
      const isValid = historyData.every((entry: any) =>
        typeof entry === 'object' && entry !== null &&
        typeof entry.timestamp === 'string' &&
        typeof entry.title === 'string' && // Check for title
        Array.isArray(entry.news) &&
        entry.news.every((item: unknown) => typeof item === 'string')
      );

      if (!isValid) {
         console.warn('Some entries in news_history.json have invalid format, returning parsed data but be cautious.');
         // Decide whether to filter invalid entries or return as is with warning
         // Returning as is for now, assuming POST handles creation correctly
      }

      // Return the validated (or assumed valid) history data
      return NextResponse.json(historyData, { status: 200 });

    } catch (parseError) {
      console.error('Error parsing news_history.json:', parseError);
      // Return empty array if parsing fails
      return NextResponse.json(defaultHistory, { status: 500, statusText: 'Failed to parse history data' });
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.log('news_history.json not found, returning empty history.');
      return NextResponse.json(defaultHistory, { status: 200 });
    } else {
      console.error('API GET /api/news/history Error reading file:', error);
      // Return empty array on other read errors
      return NextResponse.json(defaultHistory, { status: 500, statusText: 'Failed to read history data' });
    }
  }
}

export async function DELETE(request: NextRequest) {
  // 1. Get timestamp from query parameters
  const url = new URL(request.url);
  const timestampToDelete = url.searchParams.get('timestamp');

  if (!timestampToDelete) {
    return NextResponse.json({ error: 'Missing timestamp query parameter.' }, { status: 400 });
  }

  try {
    // 2. Read the history file
    let history: HistoryEntry[] = [];
    try {
      const historyJsonData = await fs.promises.readFile(HISTORY_FILE_PATH, 'utf-8');
      const parsedHistory = JSON.parse(historyJsonData);
      if (Array.isArray(parsedHistory)) {
        history = parsedHistory;
      } else {
        console.warn('news_history.json format is invalid during delete, assuming empty.');
        // Proceeding with empty history means the item won't be found
      }
    } catch (readError) {
      if (readError instanceof Error && 'code' in readError && readError.code === 'ENOENT') {
        console.log('news_history.json not found during delete.');
        // File doesn't exist, so the item to delete doesn't exist
        return NextResponse.json({ message: 'History item not found (file does not exist).' }, { status: 404 });
      } else {
        console.error('Error reading or parsing news_history.json during delete:', readError);
        throw new Error('Failed to read history data.'); // Throw to be caught by outer catch
      }
    }

    // 3. Filter out the entry to delete
    const initialLength = history.length;
    const updatedHistory = history.filter(entry => entry.timestamp !== timestampToDelete);

    // 4. Check if anything was actually deleted
    if (updatedHistory.length === initialLength) {
      return NextResponse.json({ message: 'History item with the specified timestamp not found.' }, { status: 404 });
    }

    // 5. Write the updated history back to the file
    await fs.promises.writeFile(HISTORY_FILE_PATH, JSON.stringify(updatedHistory, null, 2), 'utf-8');
    console.log(`Deleted history entry with timestamp: ${timestampToDelete}`);

    // 6. Return success response
    return NextResponse.json({ message: 'History entry deleted successfully.' }, { status: 200 });

  } catch (error) {
    console.error('API DELETE /api/news/history Error:', error);
    return NextResponse.json({ error: 'Failed to delete history entry due to an internal error.' }, { status: 500 });
  }
}