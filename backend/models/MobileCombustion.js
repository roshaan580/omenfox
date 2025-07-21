const mongoose = require("mongoose");

const mobileCombustionSchema = new mongoose.Schema(
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
      enum: ["vehicle", "direct"],
      required: true,
    },
    // Vehicle-based input
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    startLocation: {
      address: String,
      lat: Number,
      lon: Number,
    },
    endLocation: {
      address: String,
      lat: Number,
      lon: Number,
    },
    distance: {
      type: Number, // km
    },
    // Direct energy input
    fuelConsumption: {
      type: Number, // L or kWh
    },
    // Common fields
    fuelType: {
      type: String,
      required: true,
    },
    emissionFactor: {
      type: Number,
      required: true,
    },
    co2Equivalent: {
      type: Number,
      required: true,
    },
    isElectric: {
      type: Boolean,
      default: false,
    },
    scope: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    description: String,
    isCompanyVehicle: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MobileCombustion", mobileCombustionSchema);