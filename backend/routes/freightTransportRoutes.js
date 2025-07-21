const express = require("express");
const router = express.Router();
const FreightTransport = require("../models/FreightTransport");
const Employee = require("../models/Employee");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

// Get all freight transport records
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { global } = req.query;
    let query = {};
    
    // If not global request, filter by user
    if (!global) {
      query.userId = req.user.id || req.user.userId;
    }

    const records = await FreightTransport.find(query)
      .populate("employee", "firstName lastName")
      .sort({ year: -1, month: -1 });

    res.json(records);
  } catch (error) {
    console.error("Error fetching freight transport records:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get freight transport records by user ID
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const records = await FreightTransport.find({ userId })
      .populate("employee", "firstName lastName")
      .sort({ year: -1, month: -1 });

    res.json(records);
  } catch (error) {
    console.error("Error fetching user freight transport records:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create new freight transport record
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      month,
      year,
      transportMode,
      distance,
      weight,
      emissionFactor,
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

    // Calculate total emissions: distance × weight × emissionFactor
    const totalEmissions = distance * weight * emissionFactor;

    const newRecord = new FreightTransport({
      userId: userId,
      employee: employee._id,
      month,
      year,
      transportMode,
      distance,
      weight,
      emissionFactor,
      totalEmissions,
      description,
      scope: 3, // Always Scope 3
      isThirdParty: true,
    });

    const savedRecord = await newRecord.save();
    
    // Populate the saved record before returning
    const populatedRecord = await FreightTransport.findById(savedRecord._id)
      .populate("employee", "firstName lastName");

    res.status(201).json({
      message: "Freight transport record created successfully",
      record: populatedRecord,
    });
  } catch (error) {
    console.error("Error creating freight transport record:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update freight transport record
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Recalculate total emissions if relevant fields are updated
    if (updateData.distance || updateData.weight || updateData.emissionFactor) {
      const record = await FreightTransport.findById(id);
      if (record) {
        const distance = updateData.distance || record.distance;
        const weight = updateData.weight || record.weight;
        const emissionFactor = updateData.emissionFactor || record.emissionFactor;
        updateData.totalEmissions = distance * weight * emissionFactor;
      }
    }

    const updatedRecord = await FreightTransport.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("employee", "firstName lastName");

    if (!updatedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({
      message: "Freight transport record updated successfully",
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating freight transport record:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete freight transport record
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecord = await FreightTransport.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ message: "Freight transport record deleted successfully" });
  } catch (error) {
    console.error("Error deleting freight transport record:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;