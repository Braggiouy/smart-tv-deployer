import { NextResponse } from "next/server";
import { runCommand, validateTizenProject } from "../../utils";

export async function POST(request: Request) {
  try {
    const { projectPath, tizenPath, sdbPath, ipAddress } = await request.json();

    if (!projectPath || !tizenPath || !sdbPath || !ipAddress) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Project path, Tizen path, SDB path, and IP address are required",
        },
        { status: 400 }
      );
    }

    console.log("Received project path:", projectPath);
    console.log("Received tizen path:", tizenPath);
    console.log("Received sdb path:", sdbPath);
    console.log("Received IP address:", ipAddress);

    // Validate project structure
    const validation = validateTizenProject(projectPath);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Tizen project structure",
          details: `Missing required files: ${validation.missingFiles.join(
            ", "
          )}`,
          projectPath: projectPath,
        },
        { status: 400 }
      );
    }

    // Package the application
    console.log("Packaging application...");
    const packageResult = await runCommand(
      tizenPath,
      ["package", "--type", "wgt", "--", projectPath],
      projectPath
    );

    if (!packageResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to package application",
          logs: {
            package: {
              output: packageResult.output,
              error: packageResult.error,
            },
          },
        },
        { status: 500 }
      );
    }

    // Extract WGT file path from package output
    const wgtPathMatch = packageResult.output.match(
      /Package File Location: (.+\.wgt)/
    );
    const wgtPath = wgtPathMatch ? wgtPathMatch[1] : null;

    if (!wgtPath) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to extract WGT file path from package output",
          logs: {
            package: {
              output: packageResult.output,
              error: packageResult.error,
            },
          },
        },
        { status: 500 }
      );
    }

    // Connect to TV
    console.log("Connecting to TV...");
    const connectResult = await runCommand(sdbPath, ["connect", ipAddress]);

    if (!connectResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to TV",
          logs: {
            package: {
              output: packageResult.output,
            },
            connect: {
              output: connectResult.output,
              error: connectResult.error,
            },
          },
        },
        { status: 500 }
      );
    }

    // Install the application
    console.log("Installing application...");
    const installResult = await runCommand(tizenPath, [
      "install",
      "-n",
      wgtPath,
    ]);

    if (!installResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to install application",
          logs: {
            package: {
              output: packageResult.output,
            },
            connect: {
              output: connectResult.output,
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
            package: {
              output: packageResult.output,
            },
            connect: {
              output: connectResult.output,
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

    // Run the application
    console.log("Running application...");
    const runResult = await runCommand(tizenPath, ["run", "-p", packageId]);

    if (!runResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to run application",
          logs: {
            package: {
              output: packageResult.output,
            },
            connect: {
              output: connectResult.output,
            },
            install: {
              output: installResult.output,
            },
            run: {
              output: runResult.output,
              error: runResult.error,
            },
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application running successfully",
      logs: {
        package: {
          output: packageResult.output,
        },
        connect: {
          output: connectResult.output,
        },
        install: {
          output: installResult.output,
        },
        run: {
          output: runResult.output,
        },
      },
    });
  } catch (error) {
    console.error("Error running application:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error running application",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
