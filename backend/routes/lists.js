import express from "express";
import Visited from "../models/Visited.js";
import Wishlist from "../models/Wishlist.js";

const router = express.Router();

/**
 * GET /api/visited?userId=guest
 * GET /api/wishlist?userId=guest
 * POST /api/visited     body: { userId, countryCode, countryName, region, flagUrl }
 * DELETE /api/visited/:countryCode?userId=guest
 * PUT /api/visited/:id  body: { ...fieldsToUpdate }
 * DELETE /api/visited/:id
 * Same for wishlist under /api/wishlist
 */

// ===== Generic helpers =====

async function listHandler(Model, req, res) {
  const userId = req.query.userId || req.body.userId;
  if (!userId) return res.status(400).json({ error: "userId required" });

  const items = await Model.find({ userId }).sort({ updatedAt: -1 }).lean();
  res.json(items);
}

async function createHandler(Model, req, res) {
  const { userId, countryCode, countryName, region, flagUrl } = req.body;
  if (!userId || !countryCode)
    return res.status(400).json({ error: "userId and countryCode required" });

  try {
    const item = await Model.findOneAndUpdate(
      { userId, countryCode },
      {
        userId,
        countryCode,
        countryName,
        region,
        flagUrl,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(item);
  } catch (err) {
    console.error("createHandler err", err);
    res.status(500).json({ error: "Failed to create item" });
  }
}

async function deleteHandler(Model, req, res) {
  const countryCode = req.params.countryCode;
  const userId = req.query.userId || req.body.userId;
  if (!userId || !countryCode)
    return res.status(400).json({ error: "userId and countryCode required" });

  try {
    const r = await Model.findOneAndDelete({ userId, countryCode });
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, deleted: r });
  } catch (err) {
    console.error("deleteHandler err", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
}

// ===== NEW: Update by ID =====
async function updateHandler(Model, req, res) {
  try {
    const { id } = req.params;
    const updated = await Model.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Item not found" });
    res.json(updated);
  } catch (err) {
    console.error("updateHandler err", err);
    res.status(500).json({ error: "Failed to update item" });
  }
}

// ===== NEW: Delete by ID =====
async function deleteByIdHandler(Model, req, res) {
  try {
    const { id } = req.params;
    const deleted = await Model.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true, deleted });
  } catch (err) {
    console.error("deleteByIdHandler err", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
}

// ===== ROUTES =====

/* Visited */
router.get("/visited", (req, res) => listHandler(Visited, req, res));
router.post("/visited", (req, res) => createHandler(Visited, req, res));
router.delete("/visited/:countryCode", (req, res) =>
  deleteHandler(Visited, req, res)
);
router.put("/visited/:id", (req, res) => updateHandler(Visited, req, res));
router.delete("/visited/id/:id", (req, res) =>
  deleteByIdHandler(Visited, req, res)
);

/* Wishlist */
router.get("/wishlist", (req, res) => listHandler(Wishlist, req, res));
router.post("/wishlist", (req, res) => createHandler(Wishlist, req, res));
router.delete("/wishlist/:countryCode", (req, res) =>
  deleteHandler(Wishlist, req, res)
);
router.put("/wishlist/:id", (req, res) => updateHandler(Wishlist, req, res));
router.delete("/wishlist/id/:id", (req, res) =>
  deleteByIdHandler(Wishlist, req, res)
);

export default router;
