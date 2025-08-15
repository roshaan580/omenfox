const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Employee = require("../models/Employee");
require("dotenv").config();
const dotEnv = process.env;

// Register new user
exports.register = async (req, res) => {
  const { username, email, password, role, company, firstName, lastName, phone, position } = req.body;
  console.log(req.body);
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      username,
      email,
      password: hashedPassword,
      role,
    };

    // Add optional fields if provided
    if (company) userData.company = company;
    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    if (phone) userData.phone = phone;
    if (position) userData.position = position;

    const user = new User(userData);

    // Save user to database
    await user.save();

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      dotEnv.JWT_ADMIN_SECRET,
      { expiresIn: "15d" }
    );

    res.status(201).json({
      message: "User created successfully",
      jwtToken,
      role: user.role,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        company: user.company,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        position: user.position,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email);

  try {
    // First check admin users
    const user = await User.findOne({ email }).populate("company");

    if (user) {
      // Compare plain text password with stored plain text password (for now)
      // In a production environment, you should use bcrypt to compare hashed passwords
      const passwordMatch = user.password === password;

      if (!passwordMatch) {
        console.log("Password does not match for admin");
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const jwtToken = jwt.sign(
        { id: user._id, role: user.role },
        dotEnv.JWT_ADMIN_SECRET,
        { expiresIn: "15d" }
      );

      console.log("Admin login successful:", user.email);
      return res.status(200).json({
        message: "Logged in successfully",
        jwtToken,
        role: user.role,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          company: user.company,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          position: user.position,
        },
      });
    }

    // If no admin user found, check Employee collection
    const employee = await Employee.findOne({ email }).populate("car").populate("company");

    if (employee) {
      // Check if account is activated
      if (!employee.isActivated) {
        return res.status(400).json({ 
          message: "Account not activated. Please check your email for activation instructions." 
        });
      }

      // Check if password exists (should exist for activated accounts)
      if (!employee.password) {
        return res.status(400).json({ 
          message: "Account setup incomplete. Please check your email for activation instructions." 
        });
      }

      // Use bcrypt to compare password
      const passwordMatch = await employee.matchPassword(password);

      if (!passwordMatch) {
        console.log("Password does not match for employee");
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Use the same secret for consistency
      const jwtToken = jwt.sign(
        { id: employee._id, role: "employee" },
        dotEnv.JWT_ADMIN_SECRET,
        { expiresIn: "15d" }
      );

      console.log("Employee login successful:", employee.email);
      return res.status(200).json({
        message: "Logged in successfully",
        jwtToken,
        role: "employee",
        user: employee,
      });
    }

    // If no user or employee found
    console.log("No user found with email:", email);
    return res.status(400).json({ message: "Invalid credentials" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login using password bycrypt
// // Login user
// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // const testHash = await bcrypt.hash(password, 10);
//     // console.log("Test Hash:", testHash);
//     // console.log(
//     //   "Does it match stored hash?",
//     //   await bcrypt.compare("randomPassword123!", user.password)
//     // );

//     const isMatch = await bcrypt.compare(password, user.password);

//     console.log(isMatch);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       dotEnv.JWT_ADMIN_SECRET,
//       { expiresIn: "15d" }
//     );

//     res.status(200).json({
//       message: "Logged in successfully",
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// Add new validateToken endpoint
exports.validateToken = async (req, res) => {
  // The authMiddleware.required has already verified the token
  // If execution reaches here, token is valid
  try {
    // Return the decoded user from the token
    return res.status(200).json({
      valid: true,
      user: {
        id: req.user._id,
        role: req.user.role,
      },
    });
  } catch (err) {
    console.error("Token validation error:", err);
    return res.status(401).json({
      valid: false,
      message: "Token validation failed",
    });
  }
};
