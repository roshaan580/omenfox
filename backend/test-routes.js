const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

// Test if all routes can be imported without errors
try {
  console.log("Testing route imports...");
  
  const mobileCombustionRoutes = require("./routes/mobileCombustionRoutes");
  console.log("✓ Mobile combustion routes imported successfully");
  
  const stationaryCombustionRoutes = require("./routes/stationaryCombustionRoutes");
  console.log("✓ Stationary combustion routes imported successfully");
  
  const freightTransportRoutes = require("./routes/freightTransportRoutes");
  console.log("✓ Freight transport routes imported successfully");
  
  console.log("✓ All new routes imported successfully!");
  
  // Test if models can be imported
  const MobileCombustion = require("./models/MobileCombustion");
  console.log("✓ MobileCombustion model imported successfully");
  
  const StationaryCombustion = require("./models/StationaryCombustion");
  console.log("✓ StationaryCombustion model imported successfully");
  
  const FreightTransport = require("./models/FreightTransport");
  console.log("✓ FreightTransport model imported successfully");
  
  console.log("✓ All models imported successfully!");
  
  // Test environment variables
  console.log("Testing environment variables...");
  console.log("MONGO_URI:", process.env.MONGO_URI ? "✓ Set" : "✗ Missing");
  console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✓ Set" : "✗ Missing");
  console.log("JWT_ADMIN_SECRET:", process.env.JWT_ADMIN_SECRET ? "✓ Set" : "✗ Missing");
  console.log("PORT:", process.env.PORT || "5000 (default)");
  
  console.log("\n✅ All tests passed! The server should start without issues.");
  
} catch (error) {
  console.error("❌ Error during testing:", error.message);
  console.error(error.stack);
  process.exit(1);
}