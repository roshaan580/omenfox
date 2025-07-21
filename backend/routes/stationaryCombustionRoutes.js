const express = require("express");
const router = express.Router();
const StationaryCombustion = require("../models/StationaryCombustion");
const Employee = require("../models/Employee");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

// Get all stationary combustion records
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { global } = req.query;
    let query = {};
    
    // If not global request, filter by user
    if (!global) {
      query.userId = req.user.id || req.user.userId;
    }

    const records = await StationaryCombustion.find(query)
      .populate("employee", "firstName lastName")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    console.error("Error fetching stationary combustion records:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create new stationary combustion record
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      date,
      type,
      fuelType,
      activityData,
      energyContent,
      emissionFactor,
      gwp,
      co2Equivalent,
      description,
    } = req.body;

    const userId = req.user.id || req.user.userId;

    // Get user's employee record or use the user as employee if they have the right structure
    let employee = await Employee.findOne({ userId: userId });
    
    // If no employee record found, check if the user itself can be used as employee
    if (!employee) {
      // Try to find employee by user ID directly
      employee = await Employee.findById(userId);
      
      // If still not found, create a basic employee reference for admin users
      if (!employee) {
        // Check if it's an admin user
        const user = await User.findById(userId);
        if (user && user.role === 'admin') {
          // For admin users, we'll use their user ID directly
          employee = { _id: userId };
        } else {
          return res.status(404).json({ message: "Employee record not found. Please ensure you have a valid employee profile." });
        }
      }
    }

    const newRecord = new StationaryCombustion({
      userId: userId,
      employee: employee._id,
      date,
      type,
      fuelType,
      activityData,
      energyContent,
      emissionFactor,
      gwp,
      co2Equivalent,
      description,
      scope: 1, // Always Scope 1
    });

    const savedRecord = await newRecord.save();
    
    // Populate the saved record before returning
    const populatedRecord = await StationaryCombustion.findById(savedRecord._id)
      .populate("employee", "firstName lastName");

    res.status(201).json({
      message: "Stationary combustion record created successfully",
      record: populatedRecord,
    });
  } catch (error) {
    console.error("Error creating stationary combustion record:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update stationary combustion record
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedRecord = await StationaryCombustion.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("employee", "firstName lastName");

    if (!updatedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({
      message: "Stationary combustion record updated successfully",
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating stationary combustion record:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete stationary combustion record
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecord = await StationaryCombustion.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ message: "Stationary combustion record deleted successfully" });
  } catch (error) {
    console.error("Error deleting stationary combustion record:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;