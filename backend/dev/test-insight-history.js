require('dotenv').config();
const mongoose = require('mongoose');
const { getInsightHistory } = require('../services/insightService');

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing MONGO_URI in environment');
  }

  await mongoose.connect(uri);
  console.log('[test-insight-history] Connected to MongoDB');

  const userId = process.argv[2] || process.env.TEST_USER_ID || 'sample-user-1';
  const history = await getInsightHistory(userId, 10);

  console.log(`[test-insight-history] Found ${history.length} insights for ${userId}`);
  history.forEach((insight, idx) => {
    console.log(
      `${idx + 1}. ${insight._id?.toString()} | ${insight.createdAt?.toISOString()} | ${insight.overview}`
    );
  });
}

run()
  .catch((err) => {
    console.error('[test-insight-history] Error:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
    console.log('[test-insight-history] Connection closed');
  });


