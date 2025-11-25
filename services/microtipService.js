// backend/services/microtipService.js
const tips = [
    "Try the 24-hour rule: pause 24 hours before non-essential purchases.",
    "Save ₹100/week and you'll have over ₹5,000 in a year.",
    "Batch errands to cut transport costs.",
    "Cook twice a week instead of ordering to save on food delivery.",
    "Round up small purchases to save change into a 'jar'.",
    "Automate a small weekly transfer to savings — consistency beats size."
  ];
  
  const categoryTips = {
    Food: "Try meal-prep for 2 days to reduce food delivery frequency.",
    Transport: "Consider weekly passes or pooled rides where possible.",
    Shopping: "Make a wishlist and wait 7 days before buying non-essentials."
  };
  
  function pickMicroTip(analytics) {
    // prefer category specific tips if overspendAreas exist
    try {
      const top = Object.keys(analytics.byCategory || {})[0];
      if (top && categoryTips[top]) return categoryTips[top];
    } catch(_) {}
    // fallback: pick tip based on simple heuristics
    if ((analytics.totals || 0) === 0) return "No spending data yet — start logging daily expenses for better insights.";
    // random-ish stable pick
    const idx = (Math.round(analytics.totals || 0) % tips.length);
    return tips[idx];
  }
  
  module.exports = { pickMicroTip, tips };
  