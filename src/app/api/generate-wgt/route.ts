import { NextResponse } from "next/server";
import { join } from "path";
import { runCommand, validateTizenProject } from "../../utils";

export async function POST(request: Request) {
  try {
    const { projectPath, tizenPath } = await request.json();

    if (!projectPath || !tizenPath) {
      return NextResponse.json(
        {
          success: false,
          message: "Project path and Tizen path are required",
        },
        { status: 400 }
      );
    }

    console.log("Received project path:", projectPath);
    console.log("Received tizen path:", tizenPath);

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

    // Build the application
    console.log("Building application...");
    const buildResult = await runCommand(
      tizenPath,
      ["build-web", "--output", "dist", "--", projectPath],
      projectPath
    );

    if (!buildResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to build application",
          logs: {
            build: {
              output: buildResult.output,
              error: buildResult.error,
            },
          },
        },
        { status: 500 }
      );
    }

    // Package the application
    console.log("Packaging application...");
    const packageResult = await runCommand(
      tizenPath,
      ["package", "--type", "wgt", "--", join(projectPath, "dist")],
      projectPath
    );

    if (!packageResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to package application",
          logs: {
            build: {
              output: buildResult.output,
            },
            package: {
              output: packageResult.output,
              error: packageResult.error,
            },
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application packaged successfully",
      logs: {
        build: {
          output: buildResult.output,
        },
        package: {
          output: packageResult.output,
        },
      },
    });
  } catch (error) {
    console.error("Error packaging application:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error packaging application",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
