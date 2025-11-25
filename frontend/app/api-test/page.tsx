"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { testApi } from "@/lib/testApi";

export default function ApiTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTest = async () => {
      setLoading(true);
      const response = await testApi();
      setResult(response);
      setLoading(false);
    };

    runTest();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <h1 className="text-3xl font-bold mb-6">API Test (Debug)</h1>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        {loading ? (
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Testing API...
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                {result?.success ? (
                  <span className="text-green-600 dark:text-green-400">Success</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">Error</span>
                )}
              </h2>
            </div>
            <pre className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  );
}

