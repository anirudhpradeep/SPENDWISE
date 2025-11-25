// backend/routes/ai.js
const express = require('express');
const router = express.Router();

const { generateInsightForUser } = require('../services/agentService');
const { computeWhatIf } = require('../services/whatif');
const { classifyBehavior } = require('../services/behaviorService');
const { pickMicroTip } = require('../services/microtipService');
const { dailySummary } = require('../services/dailySummaryService');
const { simplePrediction } = require('../services/predictionService');

// --- Generate Insight ---
router.post('/generate', async (req, res) => {
  try {
    const userId = req.body.userId || process.env.DEFAULT_USER_ID;
    const insight = await generateInsightForUser(userId);
    return res.status(200).json({ success: true, insight });
  } catch (err) {
    console.error("[AI Route] Error generating insight:", err);
    return res.status(500).json({ success:false, error: "Failed to generate insight" });
  }
});

// --- What-If ---
router.post('/whatif', async (req, res) => {
  try {
    const userId = req.body.userId || process.env.DEFAULT_USER_ID;
    const options = req.body.options || {};
    const result = await computeWhatIf(userId, options);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("[AI WhatIf] Error:", err);
    return res.status(500).json({ success:false, error: "Failed to compute what-if" });
  }
});

// --- Behavior Classification ---
router.get('/behavior', async (req, res) => {
  try {
    const userId = req.query.userId || process.env.DEFAULT_USER_ID;
    const result = await classifyBehavior(userId);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("[AI Behavior] Error:", err);
    return res.status(500).json({ success:false, error: "Failed to classify behavior" });
  }
});

// --- Microtip ---
router.get('/microtip', async (req, res) => {
  try {
    const userId = req.query.userId || process.env.DEFAULT_USER_ID;
    const analytics = await require('../services/analytics').computeSimpleAnalytics(userId, 30);
    const tip = pickMicroTip(analytics);
    return res.status(200).json({ success: true, tip });
  } catch (err) {
    console.error("[AI MicroTip] Error:", err);
    return res.status(500).json({ success:false, error: "Failed to fetch micro tip" });
  }
});

// --- Daily Summary ---
router.get('/daily-summary', async (req, res) => {
  try {
    const userId = req.query.userId || process.env.DEFAULT_USER_ID;
    const summary = await dailySummary(userId);
    return res.status(200).json({ success: true, summary });
  } catch (err) {
    console.error("[AI DailySummary] Error:", err);
    return res.status(500).json({ success:false, error: "Failed to get daily summary" });
  }
});

// --- Prediction ---
router.get('/prediction', async (req, res) => {
  try {
    const userId = req.query.userId || process.env.DEFAULT_USER_ID;
    const pred = await simplePrediction(userId);
    return res.status(200).json({ success: true, pred });
  } catch (err) {
    console.error("[AI Prediction] Error:", err);
    return res.status(500).json({ success:false, error: "Failed to compute prediction" });
  }
});

module.exports = router;

