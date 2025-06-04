const express = require("express");
const router = express.Router();
const axios = require("axios");

// Proxy endpoint for vehicle data
router.get("/vehicle/:licensePlate", async (req, res) => {
  try {
    const { licensePlate } = req.params;
    const response = await axios.get(
      `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${licensePlate}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error proxying vehicle data request:", error);
    res.status(500).json({
      error: "Failed to fetch vehicle data",
      details: error.message,
    });
  }
});

// Proxy endpoint for CO2 data
router.get("/co2/:licensePlate", async (req, res) => {
  try {
    const { licensePlate } = req.params;
    const response = await axios.get(
      `https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=${licensePlate}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error proxying CO2 data request:", error);
    res.status(500).json({
      error: "Failed to fetch CO2 data",
      details: error.message,
    });
  }
});

// Proxy for reverse geocoding (convert coordinates to address)
router.get("/reverse-geocode", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon,
          format: "json",
          addressdetails: 1,
          zoom: 18,
        },
        headers: {
          "User-Agent": "OmenFox Location Service",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Reverse geocoding proxy error:", error.message);
    res.status(500).json({ error: "Failed to fetch location data" });
  }
});

// Proxy for geocoding (convert search query to locations)
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q,
          format: "json",
          addressdetails: 1,
          limit: 5,
        },
        headers: {
          "User-Agent": "OmenFox Location Service",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Geocoding search proxy error:", error.message);
    res.status(500).json({ error: "Failed to fetch location suggestions" });
  }
});

module.exports = router;
