const mongoose = require("mongoose");

const freightTransportSchema = new mongoose.Schema(
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
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    transportMode: {
      type: String,
      required: true, // Road freight, Rail freight, Air freight, Sea freight, etc.
    },
    distance: {
      type: Number,
      required: true, // km
    },
    weight: {
      type: Number,
      required: true, // tons
    },
    emissionFactor: {
      type: Number,
      required: true, // kg CO₂e/ton-km
    },
    totalEmissions: {
      type: Number,
      required: true, // Calculated: distance × weight × emissionFactor
    },
    description: String,
    scope: {
      type: Number,
      default: 3, // Always Scope 3 for freight transport
    },
    isThirdParty: {
      type: Boolean,
      default: true, // Third-party logistics
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FreightTransport", freightTransportSchema);