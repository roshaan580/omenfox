const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication token is required" });
  }

  try {
    // Try to verify with user token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
        return next();
      }
      // If user token fails, try admin token
      jwt.verify(token, process.env.JWT_ADMIN_SECRET, (adminErr, admin) => {
        if (adminErr) {
          return res
            .status(403)
            .json({ message: "Invalid token", error: adminErr.message });
        }
        req.user = admin;
        next();
      });
    });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid token", error: error.message });
  }
};

module.exports = {
  authenticateToken,
};
