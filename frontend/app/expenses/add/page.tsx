"use client";

import { motion } from "framer-motion";

export default function AddExpensePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <h1 className="text-3xl font-bold mb-6">Add Expense</h1>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Food</option>
              <option>Transport</option>
              <option>Entertainment</option>
              <option>Bills</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add a description..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Add Expense
          </button>
        </form>
      </div>
    </motion.div>
  );
}

