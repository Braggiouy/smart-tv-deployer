import { NextResponse } from "next/server";
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

    return NextResponse.json({
      success: true,
      message: "Application packaged successfully",
      logs: {
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
