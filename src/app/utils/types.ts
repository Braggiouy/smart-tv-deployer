export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface ProjectValidation {
  isValid: boolean;
  missingFiles: string[];
}
