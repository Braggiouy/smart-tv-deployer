"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [ipAddress, setIpAddress] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

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
      setLogs((prev) => [...prev, "Starting deployment..."]);

      const formData = new FormData();
      formData.append("ipAddress", ipAddress);
      formData.append("wgtFile", selectedFile);

      const response = await fetch("/api/deploy", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setLogs((prev) => [...prev, `Success: ${data.message}`]);
        setLogs((prev) => [...prev, `File saved at: ${data.data.filePath}`]);
      } else {
        setLogs((prev) => [...prev, `Error: ${data.message}`]);
      }
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        `Error: ${
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        }`,
      ]);
    }
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
                  <input
                    type="text"
                    id="ip-address"
                    value={ipAddress}
                    onChange={handleIpChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., 192.168.1.100"
                  />
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
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Deploy to TV
                </button>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deployment Status
                  </label>
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
