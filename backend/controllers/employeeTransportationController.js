const EmployeeTransportation = require("../models/EmployeeTransportation"); // Import the model
const mongoose = require("mongoose");

// Get transportation records - either global or for a specific employee
exports.getTransportationRecords = async (req, res) => {
  try {
    // Fetch transportation records from the database
    const records = await EmployeeTransportation.find({});

    res.status(200).json({
      message: "Transportation records retrieved successfully!",
      data: records,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching transportation records" });
  }
};

// Create a new transportation record
exports.createTransportationRecord = async (req, res) => {
  try {
    console.log("Received data:", req.body); // Log received data

    const {
      transportationMode,
      beginLocation,
      beginLocationLat,
      beginLocationLon,
      endLocation,
      endLocationLat,
      endLocationLon,
      date,
      recurring,
      employeeId,
      vehicleId,
      carType,
      co2Emission,
      usageType,
      workFromHomeDays,
      recurrenceDays,
    } = req.body;

    // Validation
    if (
      !transportationMode ||
      !beginLocation ||
      !endLocation ||
      !date ||
      !employeeId
    ) {
      return res.status(400).json({
        message: "Required fields missing",
        required: [
          "transportationMode",
          "beginLocation",
          "endLocation",
          "date",
          "employeeId",
        ],
        received: req.body,
      });
    }

    // Create new record
    const transportationRecord = new EmployeeTransportation({
      transportationMode,
      beginLocation,
      beginLocationLat,
      beginLocationLon,
      endLocation,
      endLocationLat,
      endLocationLon,
      date,
      recurring: recurring || false,
      employeeId,
      vehicleId,
      carType,
      co2Emission: parseFloat(co2Emission),
      usageType,
      workFromHomeDays: parseInt(workFromHomeDays) || 0,
      recurrenceDays: parseInt(recurrenceDays) || 0,
    });

    // Save the record
    const savedRecord = await transportationRecord.save();
    console.log("Saved record:", savedRecord);

    res.status(201).json({
      message: "Transportation record added successfully!",
      data: savedRecord,
    });
  } catch (error) {
    console.error("Error in createTransportationRecord:", error);
    res.status(500).json({
      message: "Error saving transportation record",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Update an existing transportation record
exports.updateTransportationRecord = async (req, res) => {
  try {
    const { id } = req.params; // Get the record ID from the URL
    const { transportationMode, beginLocation, endLocation, date, recurring } =
      req.body;

    // Find the transportation record by ID
    const transportationRecord = await EmployeeTransportation.findById(id);

    if (!transportationRecord) {
      return res
        .status(404)
        .json({ message: "Transportation record not found" });
    }

    // Update the transportation record
    transportationRecord.transportationMode =
      transportationMode || transportationRecord.transportationMode;
    transportationRecord.beginLocation =
      beginLocation || transportationRecord.beginLocation;
    transportationRecord.endLocation =
      endLocation || transportationRecord.endLocation;
    transportationRecord.date = date || transportationRecord.date;
    transportationRecord.recurring =
      recurring !== undefined ? recurring : transportationRecord.recurring;

    await transportationRecord.save();

    res.status(200).json({
      message: "Transportation record updated successfully!",
      data: transportationRecord,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating transportation record" });
  }
};

// Delete a transportation record
exports.deleteTransportationRecord = async (req, res) => {
  try {
    const { id } = req.params; // Get the record ID from the URL

    // Find the transportation record by ID
    const transportationRecord = await EmployeeTransportation.findById(id);

    if (!transportationRecord) {
      return res
        .status(404)
        .json({ message: "Transportation record not found" });
    }

    // Delete the transportation record
    await EmployeeTransportation.destroy();

    res.status(200).json({
      message: "Transportation record deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting transportation record" });
  }
};
