// backend/services/behaviorService.js
const { computeSimpleAnalytics } = require('./analytics');

/**
 * Classify user behavior into categories:
 *  - Saver, Spender, Impulse Buyer, Weekend Spender, Balanced
 */
async function classifyBehavior(userId) {
  const analytics = await computeSimpleAnalytics(userId, 30);
  const totals = analytics.totals || 0;
  const byCategory = analytics.byCategory || {};
  const raw = analytics.rawExpenses || [];

  // percent to top category
  const categories = Object.entries(byCategory).sort((a,b) => b[1]-a[1]);
  const top = categories[0] || [null,0];
  const topPct = totals > 0 ? (top[1]/totals)*100 : 0;

  // weekend spending heuristic
  let weekendCount = 0;
  raw.forEach(e => {
    try {
      const d = new Date(e.date);
      const day = d.getDay(); // 0 Sun, 6 Sat
      if (day === 0 || day === 6) weekendCount++;
    } catch(_) {}
  });

  // impulse purchases: many small transactions (< ₹50)
  const smallCount = raw.filter(e => (e.amount || 0) > 0 && e.amount <= 50).length;

  // week-to-week volatility (rough)
  // group by week number (ISO-like)
  const byWeek = {};
  raw.forEach(e => {
    const d = new Date(e.date);
    const w = Math.floor((d - new Date(d.getFullYear(),0,1)) / (7*24*3600*1000));
    byWeek[w] = (byWeek[w] || 0) + (e.amount || 0);
  });
  const weekVals = Object.values(byWeek);
  const avgWeek = weekVals.length ? weekVals.reduce((a,b)=>a+b,0)/weekVals.length : 0;
  const volatility = weekVals.length > 1 ? (Math.max(...weekVals) - Math.min(...weekVals)) / (avgWeek || 1) : 0;

  // classification rules (simple, tweakable)
  let classification = 'Balanced';
  if (topPct >= 50 && totals > 0) classification = 'Spender';
  if (smallCount >= 5 && (smallCount / (raw.length || 1)) > 0.4) classification = 'Impulse Buyer';
  if (weekendCount >= (raw.length/2) && raw.length >= 4) classification = 'Weekend Spender';
  if ((byCategory['Savings'] && byCategory['Savings'] / totals >= 0.3) || (avgWeek > 0 && totals / (raw.length || 1) < 50)) classification = 'Saver';

  // short rationale
  const rationale = [];
  if (top[0]) rationale.push(`Top category: ${top[0]} (${Math.round(topPct)}%)`);
  if (smallCount) rationale.push(`${smallCount} small purchases`);
  if (weekendCount) rationale.push(`${weekendCount} weekend purchases`);
  if (volatility > 0.8) rationale.push('High week-to-week volatility');

  return {
    userId,
    classification,
    rationale,
    totals,
    byCategory,
    avgWeekly: analytics.avgWeekly,
    count: analytics.count
  };
}

module.exports = { classifyBehavior };
