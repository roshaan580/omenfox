const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Register a new user
router.post("/register", authController.register);

// Login an existing user
router.post("/", authController.login);

// Validate token
router.get(
  "/validate-token",
  authMiddleware.required,
  authController.validateToken
);

// Get all users (admin only)
router.get("/users", authMiddleware.required, async (req, res) => {
  try {
    const User = require("../models/User");
    const users = await User.find().populate("company").select("-password");
    return res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update user (admin only)
router.put("/users/:id", authMiddleware.required, async (req, res) => {
  try {
    const User = require("../models/User");
    const { id } = req.params;
    const updateData = req.body;

    // Hash password if provided
    if (updateData.password) {
      const bcrypt = require("bcryptjs");
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).populate("company").select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete user (admin only)
router.delete("/users/:id", authMiddleware.required, async (req, res) => {
  try {
    const User = require("../models/User");
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get current user information
router.get("/me", authMiddleware.required, async (req, res) => {
  try {
    // The user ID is available in req.user.id from the middleware
    const userId = req.user.id;
    const role = req.user.role;

    if (role === "admin") {
      const User = require("../models/User");
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } else if (role === "employee") {
      const Employee = require("../models/Employee");
      const employee = await Employee.findById(userId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      return res.status(200).json(employee);
    } else {
      return res.status(403).json({ message: "Invalid user role" });
    }
  } catch (err) {
    console.error("Error in /me endpoint:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
