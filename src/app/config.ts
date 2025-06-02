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
  if (savedConfig) {
    return JSON.parse(savedConfig);
  }

  return DEFAULT_CONFIG;
}

export function saveConfig(config: TizenConfig) {
  if (typeof window !== "undefined") {
    localStorage.setItem("tizenConfig", JSON.stringify(config));
  }
}
