const GeneralEmission = require("../models/GeneralEmission");
const mongoose = require("mongoose");

// Create a new general emission record
const createGeneralEmission = async (req, res) => {
  try {
    console.log("Request to create general emission received");
    console.log("Request headers:", req.headers);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const { date, emissionType, employee, quantity, co2Equivalent } = req.body;

    // Validate required fields and add better error messages
    const missingFields = [];
    if (!date) missingFields.push("date");
    if (!emissionType) missingFields.push("emissionType");
    if (!employee) missingFields.push("employee");
    if (!quantity) missingFields.push("quantity");
    if (!co2Equivalent) missingFields.push("co2Equivalent");

    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(", ")}`);
      return res.status(400).json({
        message: "Missing required fields",
        missingFields,
        required: [
          "date",
          "emissionType",
          "employee",
          "quantity",
          "co2Equivalent",
        ],
        received: req.body,
      });
    }

    // Create the emission record
    const emissionRecord = new GeneralEmission({
      date,
      emissionType,
      employee,
      quantity: parseFloat(quantity),
      co2Equivalent: parseFloat(co2Equivalent),
    });

    console.log(
      "Creating new general emission record:",
      JSON.stringify(emissionRecord.toObject(), null, 2)
    );

    // Save the record to the database
    await emissionRecord.save();
    console.log("Record saved successfully with ID:", emissionRecord._id);

    // Populate the references and return
    const populatedRecord = await GeneralEmission.findById(emissionRecord._id)
      .populate("emissionType")
      .populate("employee");

    // Respond with success
    res.status(201).json({
      message: "General emission record created successfully",
      emissionRecord: populatedRecord,
    });
  } catch (error) {
    console.error("Error creating general emission record:", error);
    res.status(500).json({
      message: "Error creating general emission record",
      error: error.message,
      stack: error.stack,
    });
  }
};

// Get all general emission records
const getGeneralEmissions = async (req, res) => {
  try {
    const { employeeId, global } = req.query;
    console.log("Getting general emission records. Query:", req.query);

    // Force global access if there's no authenticated user or global=true
    const forceGlobal = !req.user || global === "true";

    // Handle global parameter or when no user is authenticated
    if (forceGlobal) {
      console.log(
        "Global access granted - retrieving all general emission records"
      );

      const records = await GeneralEmission.find({})
        .populate("emissionType")
        .populate("employee")
        .sort({ date: -1 });

      console.log(
        `Found ${records.length} general emission records with global access`
      );
      return res.status(200).json(records);
    }

    // For non-global requests with authenticated user
    let query = {};

    if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
      // If specific employee ID is provided, fetch their records
      query.employee = employeeId;
    } else if (req.user && req.user._id) {
      // If no specific employee ID, default to the authenticated user
      query.employee = req.user._id;
    }

    console.log("Applying filters:", query);
    const records = await GeneralEmission.find(query)
      .populate("emissionType")
      .populate("employee")
      .sort({ date: -1 });

    console.log(
      `Found ${records.length} general emission records with filtered access`
    );
    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching general emission records:", error);
    res.status(500).json({
      message: "Error fetching general emission records",
      error: error.message,
    });
  }
};

// Get a general emission record by ID
const getGeneralEmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid record ID" });
    }

    const record = await GeneralEmission.findById(id)
      .populate("emissionType")
      .populate("employee");

    if (!record) {
      return res
        .status(404)
        .json({ message: "General emission record not found" });
    }

    res.status(200).json(record);
  } catch (error) {
    console.error("Error fetching general emission record:", error);
    res.status(500).json({
      message: "Error fetching general emission record",
      error: error.message,
    });
  }
};

// Update a general emission record
const updateGeneralEmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, emissionType, employee, quantity, co2Equivalent } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid record ID" });
    }

    // Find the existing record
    const existingRecord = await GeneralEmission.findById(id);
    if (!existingRecord) {
      return res
        .status(404)
        .json({ message: "General emission record not found" });
    }

    // Update the record
    const updatedRecord = await GeneralEmission.findByIdAndUpdate(
      id,
      {
        date: date || existingRecord.date,
        emissionType: emissionType || existingRecord.emissionType,
        employee: employee || existingRecord.employee,
        quantity: quantity ? parseFloat(quantity) : existingRecord.quantity,
        co2Equivalent: co2Equivalent
          ? parseFloat(co2Equivalent)
          : existingRecord.co2Equivalent,
      },
      { new: true }
    )
      .populate("emissionType")
      .populate("employee");

    res.status(200).json({
      message: "General emission record updated successfully",
      emissionRecord: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating general emission record:", error);
    res.status(500).json({
      message: "Error updating general emission record",
      error: error.message,
    });
  }
};

// Delete a general emission record
const deleteGeneralEmission = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid record ID" });
    }

    // Find and delete the record
    const deletedRecord = await GeneralEmission.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res
        .status(404)
        .json({ message: "General emission record not found" });
    }

    res
      .status(200)
      .json({ message: "General emission record deleted successfully" });
  } catch (error) {
    console.error("Error deleting general emission record:", error);
    res.status(500).json({
      message: "Error deleting general emission record",
      error: error.message,
    });
  }
};

module.exports = {
  createGeneralEmission,
  getGeneralEmissions,
  getGeneralEmissionById,
  updateGeneralEmission,
  deleteGeneralEmission,
};
