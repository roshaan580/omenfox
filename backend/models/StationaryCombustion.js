const mongoose = require("mongoose");

const stationaryCombustionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["combustion", "fugitive"],
      required: true,
    },
    // Fuel/Gas type
    fuelType: {
      type: String,
      required: true,
    },
    // Activity Data (Volume/Amount)
    activityData: {
      type: Number,
      required: true,
    },
    // For combustion emissions
    energyContent: {
      type: Number, // GJ
    },
    emissionFactor: {
      type: Number, // CO₂e/GJ
    },
    // For fugitive emissions
    gwp: {
      type: Number, // Global Warming Potential
      default: 1,
    },
    // Calculated result
    co2Equivalent: {
      type: Number,
      required: true,
    },
    description: String,
    scope: {
      type: Number,
      default: 1, // Always Scope 1 for stationary combustion
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StationaryCombustion", stationaryCombustionSchema);