require('dotenv').config();
const mongoose = require('mongoose');
const { getLatestInsight } = require('../services/insightService');

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing MONGO_URI in environment');
  }

  await mongoose.connect(uri);
  console.log('[test-insight-latest] Connected to MongoDB');

  const userId = process.argv[2] || process.env.TEST_USER_ID || 'sample-user-1';
  const latest = await getLatestInsight(userId);

  if (!latest) {
    console.log(`[test-insight-latest] No insight found for ${userId}`);
  } else {
    console.log('[test-insight-latest] Latest insight:', {
      id: latest._id?.toString(),
      createdAt: latest.createdAt,
      overview: latest.overview,
    });
  }
}

run()
  .catch((err) => {
    console.error('[test-insight-latest] Error:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
    console.log('[test-insight-latest] Connection closed');
  });


