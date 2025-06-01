const mongoose = require("mongoose");

const employee_transportationSchema = new mongoose.Schema(
  {
    transportationMode: {
      type: String,
      required: true,
      enum: ["bike", "walking", "public_transport", "car", "plane"], // Enum validation for the allowed modes
    },
    beginLocation: {
      type: String,
      required: true,
    },
    beginLocationLat: {
      type: Number,
      required: true,
    },
    beginLocationLon: {
      type: Number,
      required: true,
    },
    endLocation: {
      type: String,
      required: true,
    },
    endLocationLat: {
      type: Number,
      required: true,
    },
    endLocationLon: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Assuming the Employee model is named "Employee"
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    carType: {
      type: String,
      enum: ["personal", "company"],
    },
    co2Emission: {
      type: Number,
      required: true,
    },
    usageType: {
      type: String,
      required: true,
      enum: ["company car", "business travel", "commuting"],
    },
    workFromHomeDays: {
      type: Number,
      min: 0,
      max: 7,
    },
    recurrenceDays: {
      type: Number,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true } // To auto-generate createdAt and updatedAt fields
);

// Model export
module.exports = mongoose.model(
  "Employee_Transportation",
  employee_transportationSchema
);
