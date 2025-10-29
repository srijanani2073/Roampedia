import express from "express";
import UserExperience from "../models/UserExperience.js";

const router = express.Router();

// Add new experience
router.post("/add", async (req, res) => {
  try {
    const { userId, country, experience, themes, rating, fromDate, toDate } = req.body;

    if (!country || !experience || !themes || !rating || !fromDate || !toDate) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newExperience = new UserExperience({
      userId,
      country,
      experience,
      themes,
      rating,
      fromDate,
      toDate,
    });

    await newExperience.save();
    res.status(201).json({ message: "Experience saved successfully!" });
  } catch (error) {
    console.error("Error saving experience:", error);
    res.status(500).json({ error: "Failed to save experience." });
  }
});
// Get experiences for a specific country
router.get("/", async (req, res) => {
  try {
    const { country } = req.query;
    const filter = country ? { country } : {};
    const experiences = await UserExperience.find(filter).sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    console.error("Error fetching experiences:", error);
    res.status(500).json({ error: "Failed to fetch experiences." });
  }
});


// Get all experiences (optional - for analytics or user viewing)
router.get("/", async (req, res) => {
  try {
    const experiences = await UserExperience.find().sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch experiences." });
  }
});

export default router;
