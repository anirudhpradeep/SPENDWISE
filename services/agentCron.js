// backend/services/agentCron.js
const cron = require('node-cron');
const User = require('../models/User');
const { generateInsightForUser } = require('./agentService');

function startAgentCron({ runOnInit = false } = {}) {
  // Run hourly at minute 0. For demo, set runOnInit: true to run once at startup.
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[agentCron] Scheduled run: generating insights...');
      const users = await User.find({}).limit(100).lean();
      if (!users || users.length === 0) {
        const defaultUser = process.env.DEFAULT_USER_ID || 'test-user-1';
        await generateInsightForUser(defaultUser);
        console.log('[agentCron] Generated insight for default user:', defaultUser);
        return;
      }
      for (const u of users) {
        try {
          await generateInsightForUser(u.userId);
          console.log('[agentCron] Generated insight for:', u.userId);
        } catch (err) {
          console.error('[agentCron] Error generating for user', u.userId, err && err.message);
        }
      }
    } catch (err) {
      console.error('[agentCron] Top-level cron error:', err && err.stack || err);
    }
  }, { scheduled: true, runOnInit });
}

module.exports = { startAgentCron };
