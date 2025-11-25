// backend/services/dailySummaryService.js
const { computeSimpleAnalytics } = require('./analytics');
const { pickMicroTip } = require('./microtipService');

async function dailySummary(userId) {
  const analytics = await computeSimpleAnalytics(userId, 30);
  const totals = analytics.totals || 0;
  const avgDaily = totals / 30;
  const topCategory = Object.entries(analytics.byCategory || {}).sort((a,b)=>b[1]-a[1])[0];
  const dangerCategories = Object.entries(analytics.byCategory || {})
    .filter(([k,v]) => totals > 0 && (v / totals) >= 0.25)
    .map(([k,v]) => ({ category: k, amount: v, pct: Math.round((v/totals)*100) }));

  return {
    userId,
    yesterday: {
      // rough: pick recent expense sums from rawExpenses if available
      recentCount: analytics.rawExpenses.slice(-5).length,
      note: `Recent ${analytics.rawExpenses.slice(-5).length} expenses logged.`
    },
    summary: {
      totalsLast30Days: totals,
      avgDaily: Math.round(avgDaily),
      topCategory: topCategory ? { category: topCategory[0], amount: topCategory[1] } : null,
      dangerCategories
    },
    microTip: pickMicroTip(analytics)
  };
}

module.exports = { dailySummary };
