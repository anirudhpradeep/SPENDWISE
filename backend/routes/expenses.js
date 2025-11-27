const express = require("express");
const router = express.Router();

const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense
} = require("../controllers/expenseController");

// CREATE
router.post("/", createExpense);

// READ
router.get("/", getExpenses);

// UPDATE
router.put("/:id", updateExpense);

// DELETE
router.delete("/:id", deleteExpense);

module.exports = router;
