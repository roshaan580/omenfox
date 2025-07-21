const express = require("express");
const router = express.Router();
const MobileCombustion = require("../models/MobileCombustion");
const Employee = require("../models/Employee");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

// Get all mobile combustion records
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { global } = req.query;
    let query = {};
    
    // If not global request, filter by user
    if (!global) {
      query.userId = req.user.id || req.user.userId;
    }

    const records = await MobileCombustion.find(query)
      .populate("employee", "firstName lastName")
      .populate("vehicleId", "name licensePlate")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    console.error("Error fetching mobile combustion records:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get mobile combustion records by user ID
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const records = await MobileCombustion.find({ userId })
      .populate("employee", "firstName lastName")
      .populate("vehicleId", "name licensePlate")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    console.error("Error fetching user mobile combustion records:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create new mobile combustion record
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      date,
      type,
      vehicleId,
      startLocation,
      endLocation,
      distance,
      fuelConsumption,
      fuelType,
      emissionFactor,
      co2Equivalent,
      isElectric,
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

    // Determine scope based on fuel type
    const scope = isElectric ? 2 : 1;

    const newRecord = new MobileCombustion({
      userId: userId,
      employee: employee._id,
      date,
      type,
      vehicleId: vehicleId || null,
      startLocation,
      endLocation,
      distance,
      fuelConsumption,
      fuelType,
      emissionFactor,
      co2Equivalent,
      isElectric,
      scope,
      description,
      isCompanyVehicle: true,
    });

    const savedRecord = await newRecord.save();
    
    // Populate the saved record before returning
    const populatedRecord = await MobileCombustion.findById(savedRecord._id)
      .populate("employee", "firstName lastName")
      .populate("vehicleId", "name licensePlate");

    res.status(201).json({
      message: "Mobile combustion record created successfully",
      record: populatedRecord,
    });
  } catch (error) {
    console.error("Error creating mobile combustion record:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update mobile combustion record
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Determine scope based on fuel type
    if (updateData.isElectric !== undefined) {
      updateData.scope = updateData.isElectric ? 2 : 1;
    }

    const updatedRecord = await MobileCombustion.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("employee", "firstName lastName")
      .populate("vehicleId", "name licensePlate");

    if (!updatedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({
      message: "Mobile combustion record updated successfully",
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating mobile combustion record:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete mobile combustion record
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecord = await MobileCombustion.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ message: "Mobile combustion record deleted successfully" });
  } catch (error) {
    console.error("Error deleting mobile combustion record:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;