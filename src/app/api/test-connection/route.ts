import { NextResponse } from "next/server";
import { spawn } from "child_process";

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
    const process = spawn(command, args);
    let output = "";
    let error = "";

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      error += data.toString();
    });

    process.on("close", (code) => {
      resolve({
        success: code === 0,
        output: output.trim(),
        error: error.trim(),
      });
    });
  });
}

export async function POST(request: Request) {
  try {
    const { ipAddress, sdbPath, tizenPath } = await request.json();

    if (!ipAddress || !sdbPath || !tizenPath) {
      return NextResponse.json(
        { message: "IP address, SDB path, and Tizen path are required" },
        { status: 400 }
      );
    }

    // First, try to connect to the TV
    const connectResult = await runCommand(sdbPath, ["connect", ipAddress]);

    if (!connectResult.success) {
      return NextResponse.json(
        {
          message: "Failed to connect to TV",
          logs: {
            connect: {
              error: connectResult.error,
              output: connectResult.output,
            },
          },
        },
        { status: 500 }
      );
    }

    // Then, verify the connection by listing devices
    const devicesResult = await runCommand(sdbPath, ["devices"]);

    if (!devicesResult.success) {
      return NextResponse.json(
        {
          message: "Failed to verify connection",
          logs: {
            connect: {
              output: connectResult.output,
            },
            devices: {
              error: devicesResult.error,
              output: devicesResult.output,
            },
          },
        },
        { status: 500 }
      );
    }

    // Check if our IP address is in the devices list
    const isConnected = devicesResult.output.includes(ipAddress);

    if (!isConnected) {
      return NextResponse.json(
        {
          message: "Failed to connect to TV",
          logs: {
            connect: {
              output: connectResult.output,
            },
            devices: {
              output: devicesResult.output,
              error: "TV not found in connected devices",
            },
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Successfully connected to TV",
      logs: {
        connect: {
          output: connectResult.output,
        },
        devices: {
          output: devicesResult.output,
        },
      },
    });
  } catch (error) {
    console.error("Error in test-connection:", error);
    return NextResponse.json(
      {
        message: "An error occurred while testing the connection",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
