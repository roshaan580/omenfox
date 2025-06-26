const express = require("express");
const router = express.Router();
const {
  createTransportEmission,
  getAll,
  getAllForAdmin,
  getTransportEmission,
  updateTransportEmission,
  deleteTransportEmission,
} = require("../controllers/transportEmissionController");

// ✅ Routes
router.get("/admin/all", getAllForAdmin);
router.get("/:userId", getAll);
router.post("/", createTransportEmission);
router.get("/:userId/:year/:month", getTransportEmission);
router.put("/:id", updateTransportEmission);
router.delete("/:id", deleteTransportEmission);

module.exports = router;
