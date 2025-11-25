"use client";

import { motion } from "framer-motion";

export default function GoalsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <h1 className="text-3xl font-bold mb-6">Goals</h1>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Monthly Budget</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Set your monthly spending limit</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              Set Goal
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

