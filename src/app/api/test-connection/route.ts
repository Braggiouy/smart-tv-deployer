import { NextResponse } from "next/server";
import { spawn } from "child_process";

const SDB_PATH = "/Users/baggierni/tizen-studio/tools/sdb";

interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
}

async function runCommand(
  command: string,
  args: string[]
): Promise<CommandResult> {
  return new Promise((resolve) => {
    console.log(`Executing command: ${command} ${args.join(" ")}`);
    const process = spawn(command, args);
    let output = "";
    let error = "";

    process.stdout.on("data", (data) => {
      const dataStr = data.toString();
      console.log(`Command stdout: ${dataStr}`);
      output += dataStr;
    });

    process.stderr.on("data", (data) => {
      const dataStr = data.toString();
      console.log(`Command stderr: ${dataStr}`);
      error += dataStr;
    });

    process.on("close", (code) => {
      console.log(`Command exited with code: ${code}`);
      resolve({
        success: code === 0,
        output: output.trim(),
        error: error.trim(),
      });
    });

    process.on("error", (err) => {
      console.error(`Command error: ${err.message}`);
      resolve({
        success: false,
        output: output.trim(),
        error: err.message,
      });
    });
  });
}

export async function POST(request: Request) {
  try {
    const { ipAddress } = await request.json();

    if (!ipAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "IP address is required",
        },
        { status: 400 }
      );
    }

    // Execute sdb connect command
    const connectResult = await runCommand(SDB_PATH, ["connect", ipAddress]);

    // Check if the connection was successful
    if (
      !connectResult.success ||
      connectResult.error ||
      !connectResult.output.includes("connected") ||
      connectResult.output.includes("failed to connect")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to TV",
          logs: {
            connect: {
              output: connectResult.output,
              error: connectResult.error || "Connection failed",
            },
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully connected to TV",
      logs: {
        connect: {
          output: connectResult.output,
          error: connectResult.error,
        },
      },
    });
  } catch (error) {
    console.error("Error testing connection:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error testing connection",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
