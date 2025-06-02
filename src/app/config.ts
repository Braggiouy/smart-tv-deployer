import { TizenConfig } from "./types/config.types";

export interface TizenConfig {
  sdbPath: string;
  tizenPath: string;
}

export const DEFAULT_CONFIG: TizenConfig = {
  sdbPath: "/Users/baggierni/tizen-studio/tools/sdb",
  tizenPath: "/Users/baggierni/tizen-studio/tools/ide/bin/tizen",
};

export function getConfig(): TizenConfig {
  if (typeof window === "undefined") {
    return DEFAULT_CONFIG;
  }

  const savedConfig = localStorage.getItem("tizenConfig");
  return savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG;
}

export function saveConfig(config: TizenConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("tizenConfig", JSON.stringify(config));
}
