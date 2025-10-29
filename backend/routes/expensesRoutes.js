// backend/routes/expensesRoutes.js
import express from "express";
import Expense from "../models/Expenses.js";

const router = express.Router();

// === READ ALL ===
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === INITIALIZE DEFAULT CATEGORIES ===
router.post("/init", async (req, res) => {
  try {
    const count = await Expense.countDocuments();
    if (count > 0) {
      return res.status(200).json({ message: "Already initialized" });
    }

    const defaultExpenses = [
      { category: "Transport", budget: 0, actual: 0 },
      { category: "Accommodation", budget: 0, actual: 0 },
      { category: "Food", budget: 0, actual: 0 },
      { category: "Activities", budget: 0, actual: 0 },
      { category: "Miscellaneous", budget: 0, actual: 0 },
    ];

    const saved = await Expense.insertMany(defaultExpenses);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === CREATE/UPDATE (SAVE ALL) ===
router.post("/", async (req, res) => {
  try {
    const expenses = req.body;
    await Expense.deleteMany({});
    const saved = await Expense.insertMany(expenses);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === DELETE ONE EXPENSE BY ID ===
router.delete("/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === TEST ROUTE (Optional) ===
router.get("/test", (req, res) => {
  res.json({ ok: true, message: "Expenses routes are working!" });
});

export default router;
