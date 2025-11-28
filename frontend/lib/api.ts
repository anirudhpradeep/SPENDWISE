const BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getLatestInsights(userId: string) {
  return fetchAPI(`/api/insights/latest?userId=${userId}`);
}

export async function getInsightsHistory(userId: string) {
  return fetchAPI(`/api/insights/history?userId=${userId}`);  // FIXED
}

export async function getExpenses(userId: string) {
  return fetchAPI(`/api/expenses?userId=${userId}`);
}

export async function addExpense(payload: any) {
  return fetchAPI('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function generateAIInsight(userId: string) {
  return fetchAPI(`/api/ai/generate?userId=${userId}`, {
    method: 'POST',
  });
}
