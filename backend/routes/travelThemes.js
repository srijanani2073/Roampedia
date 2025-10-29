import express from "express";
import TravelTheme from "../models/TravelTheme.js";

const router = express.Router();

// ✅ Create a new theme (MASTER form)
router.post("/add", async (req, res) => {
  try {
    const theme = new TravelTheme(req.body);
    await theme.save();
    res.status(201).json(theme);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get all themes
router.get("/", async (req, res) => {
  try {
    const themes = await TravelTheme.find();
    res.json(themes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
