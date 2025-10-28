import express from "express";
import TravelNote from "../models/TravelNote.js";

const router = express.Router();

// CREATE note
// CREATE note
router.post("/", async (req, res) => {
  try {
    console.log("📩 Received travel note data:", req.body); // debug incoming data

    const note = new TravelNote(req.body);
    await note.save();

    console.log("✅ Saved note successfully:", note);
    res.status(201).json(note);
  } catch (err) {
    console.error("❌ Error creating travel note:", err);
    res.status(500).json({ error: err.message });
  }
});


// GET all notes (or filter by userId)
router.get("/", async (req, res) => {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    const notes = await TravelNote.find(filter);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE note
router.put("/:id", async (req, res) => {
  try {
    const updated = await TravelNote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE note
router.delete("/:id", async (req, res) => {
  try {
    await TravelNote.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
