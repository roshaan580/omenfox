const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all employees
router.get("/", authMiddleware.required, employeeController.getEmployees);

// Get an employee by ID
router.get("/:id", authMiddleware.required, employeeController.getEmployeeById);

// Public registration endpoint (no authentication required)
router.post("/register", employeeController.createEmployee);

// Create a new employee (admin only - requires authentication)
router.post("/", authMiddleware.required, employeeController.createEmployee);

// Update an employee
router.put("/:id", authMiddleware.required, employeeController.updateEmployee);

// Delete an employee
router.delete("/:id", authMiddleware.required, employeeController.deleteEmployee);

// Verify activation token
router.get("/verify-token/:token", employeeController.verifyActivationToken);

// Set password during activation
router.post("/set-password", employeeController.setPassword);

module.exports = router;
