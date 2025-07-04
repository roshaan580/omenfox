const mongoose = require("mongoose");

const EmissionTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  gwp: { type: Number, required: true, default: 1 },
});

module.exports = mongoose.model("EmissionType", EmissionTypeSchema);
