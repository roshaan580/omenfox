const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");


router.get("/reduction-over-time", dashboardController.reductionOverTime);
router.get("/emissions-by-date", dashboardController.emissionsByDate);
router.get("/emissions-by-category", dashboardController.emissionsByCategory);
router.get("/emissions-trend", dashboardController.emissionsTrend);

module.exports = router;
