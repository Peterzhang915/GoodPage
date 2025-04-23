import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises'; // Use promises version of fs
import { mkdir } from 'fs/promises'; // Import mkdir, removed stat
import { fileURLToPath } from 'url'; // Needed to convert import.meta.url

// Maximum file size (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Allowed image MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];

// Helper function to sanitize filename based on username
function sanitizeFilename(username: string): string {
  // Remove potentially dangerous characters, replace spaces, keep it simple
  return username.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
}

export async function POST(request: NextRequest) {
  console.log("Received avatar upload request...");
  let UPLOAD_DIR : string;

  try {
    // --- Determine Upload Directory relative to this file --- 
    // Get the directory of the current module file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // Construct the path: Go up 5 levels from /src/app/api/avatar/upload to /GoodPage, then into public/avatars
    UPLOAD_DIR = path.resolve(__dirname, '../../../../../public/avatars');
    console.log("Current file directory (__dirname):", __dirname);
    console.log("Calculated Upload Directory (relative to file - corrected):", UPLOAD_DIR);
    // --- End Directory Calculation ---

    // --- Ensure upload directory exists ---
    try {
        await mkdir(UPLOAD_DIR, { recursive: true });
        console.log(`Ensured directory exists: ${UPLOAD_DIR}`);
    } catch (dirError: any) {
        // Ignore EEXIST error (directory already exists), re-throw others
        if (dirError.code !== 'EEXIST') {
            console.error("Error creating upload directory:", dirError);
            throw new Error("Server configuration error creating upload directory.");
        }
    }

    // --- Parse FormData ---
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const username = formData.get('username') as string | null;

    // --- Validation ---
    if (!file) {
      console.log("Validation failed: No file provided.");
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }
    if (!username) {
       console.log("Validation failed: No username provided.");
       return NextResponse.json({ success: false, error: 'Username is required for naming.' }, { status: 400 });
     }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
       console.log(`Validation failed: Invalid file type: ${file.type}`);
       return NextResponse.json({ success: false, error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
        console.log(`Validation failed: File size too large: ${file.size} bytes`);
        return NextResponse.json({ success: false, error: `File size exceeds limit (${MAX_FILE_SIZE / 1024 / 1024}MB).` }, { status: 400 });
    }

    console.log(`Validation passed for user: ${username}, file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // --- Prepare Filename and Path ---
    const sanitizedUser = sanitizeFilename(username);
    const originalExtension = path.extname(file.name).toLowerCase();
    const safeExtension = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(originalExtension) ? originalExtension : '.jpg';
    const filename = `${sanitizedUser}${safeExtension}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    const publicUrl = `/avatars/${filename}`;

    console.log(`Prepared filename: ${filename}, Saving to path: ${filepath}`);

    // --- Save File ---
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    console.log(`File saved successfully: ${filepath}`);

    // --- Return Success Response ---
    return NextResponse.json({
        success: true,
        message: 'Avatar uploaded successfully.',
        url: publicUrl,
        filename: filename
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error during avatar upload processing:", error);
    return NextResponse.json({
        success: false,
        error: `Failed to upload avatar: ${error.message || 'Unknown server error.'}`
    }, { status: 500 });
  }
}

// Optional: Add GET or other methods if needed
// ... (isValidHttpUrl function if used elsewhere, otherwise can be removed if only avatar_url validation was using it)

// Optional: Add GET or other methods if needed, otherwise they default to 405 Method Not Allowed
// export async function GET(request: NextRequest) {
//   return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
// } 