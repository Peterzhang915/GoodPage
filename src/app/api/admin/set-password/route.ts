import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
// import { checkAdminPermission } from '@/lib/auth'; // TODO: Implement and uncomment for security

interface SetPasswordRequestBody {
  username: string;
  password?: string; // Make password optional here, validation happens below
}

export async function POST(request: Request): Promise<NextResponse> {
  console.log("[API Set Password TS] Received request.");

  // 1. --- Permission Check (CRITICAL!) ---
  // const isAdmin = await checkAdminPermission();
  // if (!isAdmin) {
  //   console.warn('[API Set Password TS] Permission denied.');
  //   return NextResponse.json(
  //     { success: false, error: 'Permission denied. Admin role required.' },
  //     { status: 403 },
  //   );
  // }
  // console.log('[API Set Password TS] Admin permission verified.');
  console.warn(
    "[API Set Password TS] TODO: Permission check is currently disabled!"
  );

  // 2. --- Parse Request Body ---
  let body: SetPasswordRequestBody;
  try {
    body = await request.json();
  } catch (e) {
    console.error("[API Set Password TS] Error parsing request body:", e);
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  // 3. --- Validate Input ---
  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: "Username and password are required." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { success: false, error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  // --- Define path to the TypeScript script ---
  // Adjust path relative to project root (process.cwd())
  const scriptRelativePath = path.join("scripts", "set-password.ts");
  const scriptPath = path.join(process.cwd(), scriptRelativePath);
  console.log(
    `[API Set Password TS] Attempting to execute script via ts-node: ${scriptPath}`
  );

  // 4. --- Execute TypeScript Script using spawn with npx ts-node ---
  return new Promise((resolve) => {
    // Use 'npx' to run ts-node, passing the script path and arguments
    const tsNodeProcess = spawn(
      "npx",
      ["ts-node", scriptPath, username, password],
      {
        // Ensure the environment variables (like DATABASE_URL from .env) are available
        // This might be necessary if the script relies on process.env
        env: { ...process.env },
        // Set the current working directory if needed, though process.cwd() in script should work
        // cwd: process.cwd(),
      }
    );

    let stdout = "";
    let stderr = "";

    tsNodeProcess.stdout.on("data", (data) => {
      const output = data.toString();
      stdout += output;
      console.log(`[TS Script STDOUT] ${output.trim()}`);
    });

    tsNodeProcess.stderr.on("data", (data) => {
      const errorOutput = data.toString();
      stderr += errorOutput;
      console.error(`[TS Script STDERR] ${errorOutput.trim()}`);
    });

    tsNodeProcess.on("close", (code) => {
      console.log(`[TS Script] Exited with code ${code}`);
      // Check for ts-node specific errors in stderr as well as script logic errors
      if (
        code === 0 &&
        !stderr.toLowerCase().includes("error") &&
        stdout.includes("Successfully updated password hash")
      ) {
        resolve(
          NextResponse.json({
            success: true,
            message: `Password set successfully for ${username} via TS script.`,
            scriptOutput: stdout.trim(),
          })
        );
      } else {
        let errorMessage = `Failed to set password for ${username}. TS script process exited with code ${code}.`;
        if (stderr.trim()) {
          errorMessage += ` Error output: ${stderr.trim()}`;
        } else if (stdout.trim()) {
          errorMessage += ` Script output: ${stdout.trim()}`;
        } else {
          errorMessage += ` No output received from script. Check script path, ts-node installation, and execution permissions.`;
        }
        console.error(
          `[API Set Password TS] Script execution failed: ${errorMessage}`
        );
        resolve(
          NextResponse.json(
            {
              success: false,
              error: errorMessage,
              scriptOutput: stdout.trim(),
              scriptError: stderr.trim(),
            },
            { status: 500 }
          )
        );
      }
    });

    tsNodeProcess.on("error", (err) => {
      // Error spawning the npx process itself
      console.error("[API Set Password TS] Error spawning npx process:", err);
      resolve(
        NextResponse.json(
          {
            success: false,
            error: `Failed to execute password script via npx. Is Node/npm installed? Error: ${err.message}`,
          },
          { status: 500 }
        )
      );
    });
  });
}
