import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises'; // Use promises API
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // For unique filenames

// Constants for validation (inspired by avatar upload)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // Example: 10MB limit for project images
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml' // Allow SVG for project images? Optional.
];

// Define the target directory relative to the public folder
const UPLOAD_DIR_RELATIVE = path.join('uploads', 'projects');
// Construct the full absolute path to the target directory
const UPLOAD_DIR_ABSOLUTE = path.join(process.cwd(), 'GoodPage', 'public', UPLOAD_DIR_RELATIVE);

export async function POST(request: NextRequest) {
    try {
        // Ensure the upload directory exists
        try {
            await mkdir(UPLOAD_DIR_ABSOLUTE, { recursive: true });
        } catch (mkdirError: any) {
            // Ignore EEXIST error (directory already exists), re-throw others
            if (mkdirError.code !== 'EEXIST') {
                console.error('Failed to create upload directory:', mkdirError);
                throw new Error('Server configuration error: Could not create upload directory.');
            }
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ success: false, error: { message: 'No file provided.' } }, { status: 400 });
        }

        // --- Start Validation ---
        // Validate file type against allowed list
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
             console.log(`Validation failed: Invalid file type: ${file.type}`);
             return NextResponse.json({ success: false, error: { message: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` } }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            console.log(`Validation failed: File size too large: ${file.size} bytes`);
            return NextResponse.json({ success: false, error: { message: `File size exceeds limit (${MAX_FILE_SIZE / 1024 / 1024}MB).` } }, { status: 400 });
        }
        // --- End Validation ---

        // Generate a unique filename
        const fileExtension = path.extname(file.name) || '.png'; // Default extension if needed
        const uniqueFilename = `${uuidv4()}${fileExtension}`;
        const filePathAbsolute = path.join(UPLOAD_DIR_ABSOLUTE, uniqueFilename);
        const fileUrlRelative = `/${path.join(UPLOAD_DIR_RELATIVE, uniqueFilename).replace(/\\/g, '/')}`; // Create URL path, ensure forward slashes

        // Read file buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Write the file to the filesystem
        await writeFile(filePathAbsolute, buffer);

        console.log(`Uploaded file saved to: ${filePathAbsolute}`);
        console.log(`File accessible at URL: ${fileUrlRelative}`);

        // Return the public URL
        return NextResponse.json({ success: true, data: { url: fileUrlRelative } });

    } catch (error: any) {
        console.error('Image upload failed:', error);
        // Determine if it's a file system error (permissions etc.) or other
        let errorMessage = 'Could not process image upload.';
        if (error.code === 'EACCES') {
             errorMessage = 'Server error: Insufficient permissions to write file.';
        } else if (error.message.includes('upload directory')) { // Check for our custom dir error
             errorMessage = error.message;
        }

        return NextResponse.json({ success: false, error: { message: errorMessage } }, { status: 500 });
    }
} 