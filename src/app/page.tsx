"use client";

import { useState, useEffect } from "react";

interface CommandLogs {
  output?: string;
  error?: string;
}

interface DeploymentLogs {
  connect?: CommandLogs;
  install?: CommandLogs;
}

interface DeploymentData {
  ipAddress: string;
  fileName: string;
  filePath: string;
}

interface DeploymentResponse {
  success: boolean;
  message: string;
  data?: DeploymentData;
  logs?: DeploymentLogs;
}

export default function Home() {
  const [ipAddress, setIpAddress] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    // Load IP address from localStorage on component mount
    const savedIp = localStorage.getItem("tvIpAddress");
    if (savedIp) {
      setIpAddress(savedIp);
    }
  }, []);

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
        body: JSON.stringify({ ipAddress }),
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".wgt")) {
      setSelectedFile(file);
    } else {
      setLogs((prev) => [...prev, "Error: Please select a valid .wgt file"]);
    }
  };

  const handleDeploy = async () => {
    if (!ipAddress) {
      setLogs((prev) => [...prev, "Error: Please enter a TV IP address"]);
      return;
    }
    if (!selectedFile) {
      setLogs((prev) => [...prev, "Error: Please select a .wgt file"]);
      return;
    }

    try {
      setIsDeploying(true);
      setLogs((prev) => [...prev, "Starting deployment..."]);

      const formData = new FormData();
      formData.append("ipAddress", ipAddress);
      formData.append("wgtFile", selectedFile);

      const response = await fetch("/api/deploy", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as DeploymentResponse;

      if (response.ok && data.data) {
        const deploymentData = data.data;
        setLogs((prev) => [...prev, "✅ Deployment successful!"]);
        setLogs((prev) => [
          ...prev,
          `📁 File saved at: ${deploymentData.filePath}`,
        ]);

        // Display connection logs
        const connectLogs = data.logs?.connect;
        if (connectLogs) {
          setLogs((prev) => [...prev, "\n🔌 Connection Logs:"]);
          if (connectLogs.output) {
            setLogs((prev) => [...prev, connectLogs.output as string]);
          }
          if (connectLogs.error) {
            setLogs((prev) => [...prev, `⚠️ ${connectLogs.error as string}`]);
          }
        }

        // Display installation logs
        const installLogs = data.logs?.install;
        if (installLogs) {
          setLogs((prev) => [...prev, "\n📦 Installation Logs:"]);
          if (installLogs.output) {
            setLogs((prev) => [...prev, installLogs.output as string]);
          }
          if (installLogs.error) {
            setLogs((prev) => [...prev, `⚠️ ${installLogs.error as string}`]);
          }
        }
      } else {
        setLogs((prev) => [...prev, `❌ Error: ${data.message}`]);
        // Display error logs if available
        if (data.logs) {
          Object.entries(data.logs).forEach(
            ([command, logs]: [string, CommandLogs]) => {
              if (logs.error) {
                setLogs((prev) => [
                  ...prev,
                  `\n⚠️ ${command} error:`,
                  logs.error as string,
                ]);
              }
            }
          );
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
    <main className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
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
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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

                <div className="mb-4">
                  <label
                    htmlFor="file-upload"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Select .wgt Application File
                  </label>
                  <div className="mt-1 flex items-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Choose File
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".wgt"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <span className="ml-3 text-sm text-gray-500">
                      {selectedFile ? selectedFile.name : "No file chosen"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isDeploying
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                >
                  {isDeploying ? "Deploying..." : "Deploy to TV"}
                </button>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Deployment Status
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
                  <div className="bg-gray-50 rounded-md p-4 h-48 overflow-y-auto font-mono text-sm">
                    {logs.length === 0 ? (
                      <div className="text-gray-400 italic">
                        No deployment activity yet
                      </div>
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
        </div>
      </div>
    </main>
  );
}
