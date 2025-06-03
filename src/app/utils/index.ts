import { spawn } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { CommandResult, ProjectValidation } from "./types";

export async function runCommand(
  command: string,
  args: string[],
  cwd?: string
): Promise<CommandResult> {
  return new Promise((resolve) => {
    console.log(`Executing command: ${command} ${args.join(" ")}`);
    const process = spawn(command, args, { cwd });
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

export function validateTizenProject(projectPath: string): ProjectValidation {
  const requiredFiles = ["config.xml", "index.html", ".tproject"];

  console.log("Validating project at path:", projectPath);
  console.log("Checking for required files...");

  const missingFiles = requiredFiles.filter((file) => {
    const fullPath = join(projectPath, file);
    const exists = existsSync(fullPath);
    console.log(
      `Checking ${file} at ${fullPath}: ${exists ? "Found" : "Missing"}`
    );
    return !exists;
  });

  console.log("Missing files:", missingFiles);

  return {
    isValid: missingFiles.length === 0,
    missingFiles,
  };
}
