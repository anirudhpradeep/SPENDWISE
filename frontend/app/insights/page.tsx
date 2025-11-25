"use client";

import { motion } from "framer-motion";

export default function InsightsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <h1 className="text-3xl font-bold mb-6">Insights</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Spending Trends</h2>
          <p className="text-gray-600 dark:text-gray-400">No data available yet.</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
          <p className="text-gray-600 dark:text-gray-400">No data available yet.</p>
        </div>
      </div>
    </motion.div>
  );
}

