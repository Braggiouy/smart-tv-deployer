export interface CommandLogs {
  output?: string;
  error?: string;
}

export interface DeploymentLogs {
  connect?: CommandLogs;
  install?: CommandLogs;
  launch?: CommandLogs;
}

export interface DeploymentData {
  ipAddress: string;
  fileName: string;
  filePath: string;
}

export interface DeploymentResponse {
  success: boolean;
  message: string;
  data?: DeploymentData;
  logs?: DeploymentLogs;
}
