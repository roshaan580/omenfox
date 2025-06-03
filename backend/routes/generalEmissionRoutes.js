const express = require("express");
const router = express.Router();
const generalEmissionController = require("../controllers/generalEmissionController");
const authMiddleware = require("../middleware/authMiddleware");

// Use the non-strict auth middleware for all routes
// This allows the JWT_ADMIN_SECRET to work for all endpoints
router.use(authMiddleware);

// Create a new general emission record
router.post("/", generalEmissionController.createGeneralEmission);

// Get all general emission records
router.get("/", generalEmissionController.getGeneralEmissions);

// Get a general emission record by ID
router.get("/:id", generalEmissionController.getGeneralEmissionById);

// Update a general emission record
router.put("/:id", generalEmissionController.updateGeneralEmission);

// Delete a general emission record
router.delete("/:id", generalEmissionController.deleteGeneralEmission);

module.exports = router;
