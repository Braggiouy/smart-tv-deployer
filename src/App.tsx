import { useState, useEffect } from "react";

function App() {
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

  const handleDeploy = () => {
    if (!ipAddress) {
      setLogs((prev) => [...prev, "Error: Please enter a TV IP address"]);
      return;
    }
    if (!selectedFile) {
      setLogs((prev) => [...prev, "Error: Please select a .wgt file"]);
      return;
    }
    setLogs((prev) => [
      ...prev,
      "Deployment functionality will be implemented in the next step",
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
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
                    placeholder="Enter TV IP address"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="file-upload"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Upload .wgt File
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    accept=".wgt"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                </div>

                <button
                  onClick={handleDeploy}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Deploy
                </button>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deployment Logs
                  </label>
                  <div className="bg-gray-50 rounded-md p-4 h-48 overflow-y-auto">
                    {logs.map((log, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
