const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Expense = require('../models/Expense');
const Insight = require('../models/Insight');
const { computeSimpleAnalytics } = require('../services/analytics');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

router.post('/generate', async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId || process.env.DEFAULT_USER_ID;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: "Missing userId" });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error("[AI Route] GOOGLE_AI_API_KEY not configured");
      return res.status(500).json({ success: false, error: "AI service not configured" });
    }

    console.log(`[AI Route] Generating insight for user: ${userId}`);

    // Fetch last 30 days expenses
    const analytics = await computeSimpleAnalytics(userId, 30);
    const expenses = analytics.rawExpenses || [];

    if (expenses.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "No expenses found in the last 30 days" 
      });
    }

    // Build expense summary
    const totalSpent = analytics.totals || 0;
    const categoryBreakdown = Object.entries(analytics.byCategory || {})
      .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
      .join(', ');

    // Find spending spikes (expenses significantly above average)
    const avgExpense = totalSpent / expenses.length;
    const spikes = expenses
      .filter(exp => exp.amount > avgExpense * 1.5)
      .map(exp => ({
        date: exp.date.toISOString().split('T')[0],
        category: exp.category,
        amount: exp.amount,
      }))
      .slice(0, 5); // Top 5 spikes

    // Build prompt for Gemini
    const prompt = `You are a financial advisor analyzing spending data. Generate personalized insights.

User's spending data (last 30 days):
- Total spent: $${totalSpent.toFixed(2)}
- Number of expenses: ${expenses.length}
- Category breakdown: ${categoryBreakdown}
- Spending spikes: ${JSON.stringify(spikes)}

Generate a JSON response with the following structure:
{
  "overview": "A brief 2-3 sentence summary of their spending patterns",
  "overspendAreas": [
    {
      "category": "category name",
      "amount": number,
      "why": "brief explanation of why this is an overspend area"
    }
  ],
  "prediction": "A prediction about their future spending based on current patterns",
  "savingsPlan": "A practical savings plan recommendation",
  "microTip": "A small, actionable tip to save money"
}

Rules:
- overspendAreas should only include categories where spending is unusually high
- Be specific and actionable
- Keep responses concise but helpful
- Return ONLY valid JSON, no markdown or code blocks`;

    console.log(`[AI Route] Calling Gemini API with ${expenses.length} expenses`);

    // Call Google Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    console.log('[AI Route] Gemini response received');

    // Parse JSON response (handle markdown code blocks if present)
    let insightData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;
      insightData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('[AI Route] Failed to parse Gemini response:', parseError);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to parse AI response" 
      });
    }

    // Validate response structure
    if (!insightData.overview || typeof insightData.overview !== 'string') {
      return res.status(500).json({ 
        success: false, 
        error: "Invalid AI response: missing overview" 
      });
    }

    // Validate and normalize overspendAreas
    let overspendAreas = [];
    if (Array.isArray(insightData.overspendAreas)) {
      overspendAreas = insightData.overspendAreas
        .filter(area => area && area.category && typeof area.amount === 'number')
        .map(area => ({
          category: String(area.category),
          amount: Number(area.amount),
          why: String(area.why || ''),
        }));
    }

    // Create insight document
    const insight = await Insight.create({
      userId,
      overview: String(insightData.overview || ''),
      overspendAreas,
      savingsPlan: String(insightData.savingsPlan || ''),
      microTip: String(insightData.microTip || ''),
      prediction: String(insightData.prediction || ''),
      raw: insightData,
    });

    console.log(`[AI Route] Insight saved: ${insight._id}`);

    return res.status(200).json({ success: true, insight });
  } catch (err) {
    console.error("[AI Route] Error generating insight:", err.message);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to generate insight",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;


