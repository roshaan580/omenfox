const mongoose = require("mongoose");

const generalEmissionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    emissionType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmissionType",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    quantity: { type: Number, required: true },
    co2Equivalent: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GeneralEmission", generalEmissionSchema);
