// backend/app.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const expenseRoutes = require('./routes/expenses');
const insightRoutes = require('./routes/insights');
const aiRoutes = require('./routes/ai');

// add cron starter
// ensure this file exists: ./services/agentCron.js (we prepared it earlier)
const { startAgentCron } = require('./services/agentCron');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spendwise';

app.use(cors());
app.use(express.json());

app.use('/api/expenses', expenseRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'SpendWise backend up' });
});

let server = null;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[backend] MongoDB connected');
    server = app.listen(PORT, () => {
      console.log(`[backend] Server listening on port ${PORT}`);

      // Start cron AFTER server is listening. For demo set runOnInit: true
      // Change to runOnInit: false for normal background runs.
      try {
        startAgentCron({ runOnInit: true });
        console.log('[app] Agent cron started (runOnInit: true for demo)');
      } catch (err) {
        console.error('[app] Failed to start agent cron:', err);
      }
    });
  })
  .catch((error) => {
    console.error('[backend] Mongo connection failed', error);
    process.exit(1);
  });

// graceful shutdown
function shutdown(signal) {
  console.log(`[app] Received ${signal}. Shutting down server...`);
  if (server) server.close(() => {
    console.log('[app] HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('[app] Mongo connection closed');
      process.exit(0);
    });
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
