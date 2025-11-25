const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Safe export pattern: return existing model if it already exists
if (mongoose.models.Expense) {
  module.exports = mongoose.models.Expense;
} else {
  module.exports = mongoose.model('Expense', ExpenseSchema);
}