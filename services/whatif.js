// backend/services/whatif.js
const { computeSimpleAnalytics } = require('./analytics');

/**
 * options:
 *  - type: 'reduce' (reduce spending in a category by amount per month)
 *  - category: string
 *  - amount: number (monthly amount user will reduce)
 *  - goal: { targetAmount:Number, currentSaved:Number }  (optional)
 *
 * returns a simple projection object
 */
async function computeWhatIf(userId, options = {}) {
  const analytics = await computeSimpleAnalytics(userId, 30);
  const totals = analytics.totals || 0;
  const byCategory = analytics.byCategory || {};

  const result = {
    baseline: {
      totals,
      byCategory,
      avgWeekly: analytics.avgWeekly
    },
    scenario: null
  };

  if (!options || !options.type) {
    return result;
  }

  if (options.type === 'reduce') {
    const cat = options.category;
    const reduceAmount = Number(options.amount || 0);

    const currentCat = Number(byCategory[cat] || 0);
    const newCat = Math.max(0, currentCat - reduceAmount);
    const newTotals = totals - (currentCat - newCat);

    // monthly savings (assuming totals is for last 30 days)
    const monthlySavings = (totals - newTotals);

    result.scenario = {
      action: `Reduce ${cat} by ₹${reduceAmount}/month`,
      oldCategoryAmount: currentCat,
      newCategoryAmount: newCat,
      oldTotal: totals,
      newTotal: newTotals,
      monthlySavings,
      monthlySavingsPercent: totals > 0 ? Math.round((monthlySavings / totals) * 10000) / 100 : 0
    };

    // if goal provided, compute months to goal faster
    if (options.goal && typeof options.goal.targetAmount === 'number') {
      const goal = options.goal;
      const remaining = Math.max(0, (goal.targetAmount - (goal.currentSaved || 0)));
      const defaultSavePerMonth = Math.max(0, Math.round((analytics.avgWeekly || 0) * 4)); // rough baseline
      const improvedSavePerMonth = defaultSavePerMonth + monthlySavings;
      const monthsBaseline = defaultSavePerMonth > 0 ? Math.ceil(remaining / defaultSavePerMonth) : null;
      const monthsImproved = improvedSavePerMonth > 0 ? Math.ceil(remaining / improvedSavePerMonth) : null;

      result.scenario.goalProjection = {
        remaining,
        defaultSavePerMonth,
        improvedSavePerMonth,
        monthsBaseline,
        monthsImproved
      };
    }
  } else {
    result.scenario = { error: 'unsupported scenario type' };
  }

  return result;
}

module.exports = { computeWhatIf };
