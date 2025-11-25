// backend/services/predictionService.js
const { computeSimpleAnalytics } = require('./analytics');

/**
 * Simple projection:
 * - next7Days: use avgWeekly/7 as daily and multiply
 * - risk: basic rule-based
 */
async function simplePrediction(userId) {
  const analytics = await computeSimpleAnalytics(userId, 30);
  const avgWeekly = analytics.avgWeekly || 0;
  const dailyAvg = (avgWeekly/7) || ((analytics.totals || 0) / 30);
  const next7 = Math.round(dailyAvg * 7);

  // risk: if totals in last 30 > threshold relative to income (we don't have incomeHistory here)
  let risk = 'low';
  if ((analytics.totals || 0) > 5000) risk = 'medium';
  if ((analytics.totals || 0) > 15000) risk = 'high';

  return {
    userId,
    predictedNext7Days: next7,
    dailyAvg: Math.round(dailyAvg),
    risk,
    reasoning: `Based on avgWeekly ${Math.round(avgWeekly)} from last 30 days.`
  };
}

module.exports = { simplePrediction };
