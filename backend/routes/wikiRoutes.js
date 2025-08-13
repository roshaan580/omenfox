const express = require("express");
const router = express.Router();
const {
  getAllWikis,
  getWikiById,
  createWiki,
  updateWiki,
  deleteWiki,
} = require("../controllers/wikiController");
const { authenticateToken } = require("../middleware/auth");

// Public routes (no authentication required)
router.get("/", getAllWikis);
router.get("/:id", getWikiById);

// Protected routes (authentication required)
router.post("/", authenticateToken, createWiki);
router.put("/:id", authenticateToken, updateWiki);
router.delete("/:id", authenticateToken, deleteWiki);

module.exports = router;