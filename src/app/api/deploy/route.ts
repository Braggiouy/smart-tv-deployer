import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

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

    if (!ipAddress || !file) {
      return NextResponse.json(
        {
          success: false,
          message: "IP address and .wgt file are required",
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

    // Return success response
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        ipAddress,
        fileName: file.name,
        filePath,
      },
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing upload",
      },
      { status: 500 }
    );
  }
}
