import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

/**
 * 运行 DBLP 爬虫脚本
 */
export async function POST(request: NextRequest) {
  try {
    console.log("Starting DBLP crawler...");

    // 脚本路径
    const scriptPath = path.join(process.cwd(), 'scripts', 'dblp_crawler.py');
    
    return new Promise((resolve) => {
      // 使用 spawn 运行 Python 脚本
      const pythonProcess = spawn('python', [scriptPath], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('DBLP Crawler stdout:', data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('DBLP Crawler stderr:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        console.log(`DBLP crawler process exited with code ${code}`);
        
        if (code === 0) {
          resolve(NextResponse.json({
            success: true,
            message: "DBLP crawler completed successfully",
            data: {
              stdout: stdout,
              outputFile: "output.txt"
            }
          }));
        } else {
          resolve(NextResponse.json(
            { 
              error: `DBLP crawler failed with exit code ${code}`,
              stderr: stderr,
              stdout: stdout
            },
            { status: 500 }
          ));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to start DBLP crawler:', error);
        resolve(NextResponse.json(
          { error: `Failed to start DBLP crawler: ${error.message}` },
          { status: 500 }
        ));
      });
    });

  } catch (error) {
    console.error("DBLP crawler error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `DBLP crawler failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
