"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { client } from "@/lib/apiClient";
import StatCard from "@/app/components/dashboard/StatCard";
import InsightCard from "@/app/components/dashboard/InsightCard";
import ExpenseList from "@/app/components/dashboard/ExpenseList";

interface Expense {
  _id?: string;
  category?: string;
  amount?: number;
  date?: string;
  description?: string;
}

interface Insight {
  overview?: string;
  topOverspendArea?: string;
  savingsTip?: string;
  microTip?: string;
  riskPrediction?: string;
}

export default function DashboardPage() {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch latest insight
        const insightResponse = await client.get<Insight>(
          "/api/insights/latest?userId=test-user-1"
        );

        // Fetch recent expenses
        const expensesResponse = await client.get<Expense[]>(
          "/api/expenses?userId=test-user-1"
        );

        if (insightResponse.success && insightResponse.data) {
          setInsight(insightResponse.data);
        }

        if (expensesResponse.success && expensesResponse.data) {
          setExpenses(Array.isArray(expensesResponse.data) ? expensesResponse.data : []);
        }

        if (!insightResponse.success || !expensesResponse.success) {
          setError("Failed to load data");
        }
      } catch (err) {
        setError("An error occurred while loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const calculateStats = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentExpenses = expenses.filter((expense) => {
      if (!expense.date) return false;
      const expenseDate = new Date(expense.date);
      return expenseDate >= thirtyDaysAgo;
    });

    const totalSpent = recentExpenses.reduce((sum, expense) => {
      return sum + (expense.amount || 0);
    }, 0);

    // Find main category
    const categoryCounts: Record<string, number> = {};
    expenses.forEach((expense) => {
      const category = expense.category || "Uncategorized";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const mainCategory =
      Object.keys(categoryCounts).length > 0
        ? Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]
        : "N/A";

    return {
      totalSpent,
      mainCategory,
      expenseCount: expenses.length,
    };
  };

  const stats = calculateStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (error && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        Dashboard
      </h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Spent (Last 30 Days)"
          value={formatCurrency(stats.totalSpent)}
          delay={0}
        />
        <StatCard
          title="Main Category"
          value={stats.mainCategory}
          delay={0.1}
        />
        <StatCard
          title="Number of Expenses"
          value={stats.expenseCount}
          delay={0.2}
        />
      </div>

      {/* Insight Card */}
      <div className="mb-8">
        <InsightCard insight={insight} loading={loading} />
      </div>

      {/* Expense List */}
      <div>
        <ExpenseList expenses={expenses} loading={loading} />
      </div>
    </motion.div>
  );
}

