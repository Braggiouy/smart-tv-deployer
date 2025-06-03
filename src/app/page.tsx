"use client";

import { useState, useEffect, useRef } from "react";
import { TizenConfig } from "./types/config.types";
import { DEFAULT_CONFIG, getConfig, saveConfig } from "./config";

export default function Home() {
  const [ipAddress, setIpAddress] = useState("");
  const [projectPath, setProjectPath] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [config, setConfig] = useState<TizenConfig>(DEFAULT_CONFIG);
  const [currentStep, setCurrentStep] = useState<"config" | "build" | "deploy">(
    "config"
  );
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  useEffect(() => {
    // Load saved configuration
    const savedConfig = getConfig();
    setConfig(savedConfig);

    // Load IP address from localStorage
    const savedIp = localStorage.getItem("tvIpAddress");
    if (savedIp) {
      setIpAddress(savedIp);
    }
  }, []);

  const handleConfigChange = (key: keyof TizenConfig, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIp = e.target.value;
    setIpAddress(newIp);
    localStorage.setItem("tvIpAddress", newIp);
  };

  const testConnection = async () => {
    if (!ipAddress) {
      setLogs((prev) => [...prev, "Error: Please enter a TV IP address"]);
      return;
    }

    try {
      setIsTestingConnection(true);
      setLogs((prev) => [...prev, "Testing connection to TV..."]);

      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ipAddress,
          sdbPath: config.sdbPath,
          tizenPath: config.tizenPath,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLogs((prev) => [...prev, "✅ Successfully connected to TV!"]);
        if (data.logs?.connect?.output) {
          setLogs((prev) => [...prev, data.logs.connect.output]);
        }
      } else {
        setLogs((prev) => [...prev, `❌ Error: ${data.message}`]);
        if (data.logs?.connect?.error) {
          setLogs((prev) => [...prev, `⚠️ ${data.logs.connect.error}`]);
        }
      }
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        `❌ Error: ${
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        }`,
      ]);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleProjectPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectPath(e.target.value);
  };

  const handleDebug = async () => {
    if (!projectPath) {
      setLogs((prev) => [...prev, "Error: Please enter the project path"]);
      return;
    }

    try {
      setIsDeploying(true);
      setLogs((prev) => [...prev, "Starting debugging..."]);

      const response = await fetch("/api/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectPath,
          tizenPath: config.tizenPath,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLogs((prev) => [...prev, "✅ Debugging started successfully!"]);
        if (data.logs?.debug?.output) {
          setLogs((prev) => [...prev, data.logs.debug.output]);
        }
        if (data.logs?.debug?.error) {
          setLogs((prev) => [...prev, `⚠️ ${data.logs.debug.error}`]);
        }
      } else {
        setLogs((prev) => [...prev, `❌ Error: ${data.message}`]);
        if (data.logs?.debug?.error) {
          setLogs((prev) => [...prev, `⚠️ ${data.logs.debug.error}`]);
        }
      }
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        `❌ Error: ${
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        }`,
      ]);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRun = async () => {
    if (!projectPath) {
      setLogs((prev) => [...prev, "Error: Please enter the project path"]);
      return;
    }

    try {
      setIsDeploying(true);
      setLogs((prev) => [...prev, "Starting running..."]);

      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectPath,
          tizenPath: config.tizenPath,
          sdbPath: config.sdbPath,
          ipAddress,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLogs((prev) => [...prev, "✅ Running started successfully!"]);
        if (data.logs?.build?.output) {
          setLogs((prev) => [...prev, data.logs.build.output]);
        }
        if (data.logs?.package?.output) {
          setLogs((prev) => [...prev, data.logs.package.output]);
        }
        if (data.logs?.connect?.output) {
          setLogs((prev) => [...prev, data.logs.connect.output]);
        }
        if (data.logs?.install?.output) {
          setLogs((prev) => [...prev, data.logs.install.output]);
        }
        if (data.logs?.run?.output) {
          setLogs((prev) => [...prev, data.logs.run.output]);
        }
      } else {
        setLogs((prev) => [...prev, `❌ Error: ${data.message}`]);
        if (data.logs?.build?.error) {
          setLogs((prev) => [...prev, `⚠️ ${data.logs.build.error}`]);
        }
        if (data.logs?.package?.error) {
          setLogs((prev) => [...prev, `⚠️ ${data.logs.package.error}`]);
        }
        if (data.logs?.connect?.error) {
          setLogs((prev) => [...prev, `⚠️ ${data.logs.connect.error}`]);
        }
        if (data.logs?.install?.error) {
          setLogs((prev) => [...prev, `⚠️ ${data.logs.install.error}`]);
        }
        if (data.logs?.run?.error) {
          setLogs((prev) => [...prev, `⚠️ ${data.logs.run.error}`]);
        }
      }
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        `❌ Error: ${
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        }`,
      ]);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleGenerateWgt = async () => {
    if (!projectPath) {
      setLogs((prev) => [...prev, "Error: Please enter the project path"]);
      return;
    }

    try {
      setIsDeploying(true);
      setLogs((prev) => [...prev, "Generating WGT package..."]);

      const response = await fetch("/api/generate-wgt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectPath,
          tizenPath: config.tizenPath,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLogs((prev) => [...prev, "✅ WGT package generated successfully!"]);
        if (data.logs?.build?.output) {
          setLogs((prev) => [...prev, data.logs.build.output]);
        }
        if (data.logs?.package?.output) {
          setLogs((prev) => [...prev, data.logs.package.output]);
        }
        setCurrentStep("deploy");
      } else {
        setLogs((prev) => [...prev, `❌ Error: ${data.message}`]);
        if (data.logs?.build?.error) {
          setLogs((prev) => [...prev, `⚠️ ${data.logs.build.error}`]);
        }
        if (data.logs?.package?.error) {
          setLogs((prev) => [...prev, `⚠️ ${data.logs.package.error}`]);
        }
      }
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        `❌ Error: ${
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        }`,
      ]);
    } finally {
      setIsDeploying(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <main className="min-h-screen bg-gray-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-lg rounded-3xl p-4 sm:p-6 md:p-8">
          <div className="space-y-4">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "config"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-sm ${
                    currentStep === "config"
                      ? "text-indigo-600 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  Configuration
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "build"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-sm ${
                    currentStep === "build"
                      ? "text-indigo-600 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  Build
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "deploy"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-sm ${
                    currentStep === "deploy"
                      ? "text-indigo-600 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  Deploy
                </span>
              </div>
            </div>

            {/* Configuration Step */}
            <div
              className={`space-y-4 ${
                currentStep !== "config" ? "hidden" : ""
              }`}
            >
              <div className="mb-4">
                <label
                  htmlFor="sdb-path"
                  className="block text-sm font-medium text-gray-700"
                >
                  SDB Path
                </label>
                <input
                  type="text"
                  id="sdb-path"
                  value={config.sdbPath}
                  onChange={(e) =>
                    handleConfigChange("sdbPath", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  placeholder="Path to sdb executable"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="tizen-path"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tizen Path
                </label>
                <input
                  type="text"
                  id="tizen-path"
                  value={config.tizenPath}
                  onChange={(e) =>
                    handleConfigChange("tizenPath", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  placeholder="Path to tizen executable"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="ip-address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Samsung TV IP Address
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="text"
                    id="ip-address"
                    value={ipAddress}
                    onChange={handleIpChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    placeholder="e.g., 192.168.1.100"
                  />
                  <button
                    onClick={testConnection}
                    disabled={isTestingConnection}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      isTestingConnection
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    }`}
                  >
                    {isTestingConnection ? "Testing..." : "Test Connection"}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep("build")}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next: Build Application
              </button>
            </div>

            {/* Build Step */}
            <div
              className={`space-y-4 ${currentStep !== "build" ? "hidden" : ""}`}
            >
              <div className="mb-4">
                <label
                  htmlFor="project-path"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project Path
                </label>
                <input
                  type="text"
                  id="project-path"
                  value={projectPath}
                  onChange={handleProjectPathChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  placeholder="Path to your Tizen project"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep("config")}
                  className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerateWgt}
                  disabled={isDeploying}
                  className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isDeploying
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                >
                  {isDeploying ? "Generating..." : "Generate WGT Package"}
                </button>
              </div>
            </div>

            {/* Deploy Step */}
            <div
              className={`space-y-4 ${
                currentStep !== "deploy" ? "hidden" : ""
              }`}
            >
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep("build")}
                  className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
                <button
                  onClick={handleDebug}
                  disabled={isDeploying}
                  className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isDeploying
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                >
                  {isDeploying
                    ? "Debugging..."
                    : "Debug as Tizen Web Application"}
                </button>
                <button
                  onClick={handleRun}
                  disabled={isDeploying}
                  className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isDeploying
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  }`}
                >
                  {isDeploying ? "Running..." : "Run as Tizen Web Application"}
                </button>
              </div>
            </div>

            {/* Logs Section - Always visible */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                {logs.length > 0 && (
                  <button
                    onClick={clearLogs}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Clear logs
                  </button>
                )}
              </div>
              <div className="bg-gray-50 rounded-md p-4 h-32 sm:h-40 md:h-48 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-400 italic">No activity yet</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-gray-600 mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
