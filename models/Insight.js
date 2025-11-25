const mongoose = require('mongoose');

// Schema for overspend areas
const OverspendAreaSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  why: { 
    type: String, 
    default: '' 
  }
}, { _id: false });

const InsightSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  overview: { 
    type: String, 
    default: '' 
  },
  overspendAreas: { 
    type: [OverspendAreaSchema], 
    default: [] 
  },
  savingsPlan: { 
    type: String, 
    default: '' 
  },
  microTip: { 
    type: String, 
    default: '' 
  },
  prediction: { 
    type: String, 
    default: '' 
  },
  raw: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  }
}, { timestamps: true });

// Safe export pattern: return existing model if it already exists
if (mongoose.models.Insight) {
  module.exports = mongoose.models.Insight;
} else {
  module.exports = mongoose.model('Insight', InsightSchema);
}