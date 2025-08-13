const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Define the User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "company_owner"],
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
      required: function() {
        return this.role === "company_owner";
      }
    },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    position: {
      type: String,
      required: false,
    },
    jwtToken: {
      type: String, // Field to store JWT token
      default: function () {
        return jwt.sign(
          { userId: this._id, role: this.role },
          process.env.JWT_ADMIN_SECRET,
          { expiresIn: "15d" }
        );
      },
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// userSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { userId: this._id, role: this.role },
    process.env.JWT_ADMIN_SECRET,
    { expiresIn: "15d" }
  );
  return token;
};

module.exports = mongoose.model("User", userSchema);
