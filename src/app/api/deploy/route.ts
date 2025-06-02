import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
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

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const ipAddress = formData.get("ipAddress");
    const file = formData.get("wgtFile") as File;
    const sdbPath = formData.get("sdbPath") as string;
    const tizenPath = formData.get("tizenPath") as string;

    if (!ipAddress || !file || !sdbPath || !tizenPath) {
      return NextResponse.json(
        {
          success: false,
          message: "IP address, .wgt file, and Tizen paths are required",
        },
        { status: 400 }
      );
    }

    // Validate file extension
    if (!file.name.endsWith(".wgt")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only .wgt files are allowed",
        },
        { status: 400 }
      );
    }

    // Create a temporary directory
    const tmpDir = join(tmpdir(), "smart-tv-deployer");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueFilename = `${Date.now()}-${file.name}`;
    const filePath = join(tmpDir, uniqueFilename);

    // Save the file
    await writeFile(filePath, buffer);

    // Execute sdb connect command
    const connectResult = await runCommand(sdbPath, [
      "connect",
      ipAddress as string,
    ]);

    if (!connectResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to TV",
          logs: {
            connect: {
              output: connectResult.output,
              error: connectResult.error,
            },
          },
        },
        { status: 500 }
      );
    }

    // Execute tizen install command
    const installResult = await runCommand(tizenPath, [
      "install",
      "-n",
      filePath,
    ]);

    if (!installResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to install app",
          logs: {
            connect: {
              output: connectResult.output,
              error: connectResult.error,
            },
            install: {
              output: installResult.output,
              error: installResult.error,
            },
          },
        },
        { status: 500 }
      );
    }

    // Extract package ID from installation logs
    const packageIdMatch = installResult.output.match(
      /Installed the package: Id\(([^)]+)\)/
    );
    const packageId = packageIdMatch ? packageIdMatch[1] : null;

    if (!packageId) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to extract package ID from installation logs",
          logs: {
            connect: {
              output: connectResult.output,
              error: connectResult.error,
            },
            install: {
              output: installResult.output,
              error: installResult.error,
            },
          },
        },
        { status: 500 }
      );
    }

    // Launch the app after successful installation
    const launchResult = await runCommand(tizenPath, ["run", "-p", packageId]);

    return NextResponse.json({
      success: true,
      message: "Deployment successful",
      data: {
        ipAddress,
        fileName: file.name,
        filePath,
      },
      logs: {
        connect: {
          output: connectResult.output,
          error: connectResult.error,
        },
        install: {
          output: installResult.output,
          error: installResult.error,
        },
        launch: {
          output: launchResult.output,
          error: launchResult.error,
        },
      },
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing upload",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
