const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const dotEnv = process.env;

// Import routes
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const employeeRoutes = require("./routes/employee");
const vehicleRoutes = require("./routes/Vehicle");
const companyRoutes = require("./routes/company");
const emissionRoutes = require("./routes/emission");
const employeeTransportation = require("./routes/employeeTransportation");
const employeeWorkTransportation = require("./routes/employeeWorkTransportation");
const transportationRoutes = require("./routes/transportation");
const workingHoursRoutes = require("./routes/workingHours");
const emissionTypeRoutes = require("./routes/emissionTypeRoutes");
const userEmissionRoutes = require("./routes/userEmissionRoutes");
const productRoutes = require("./routes/productRoutes");
const yearlyReportRoutes = require("./routes/yearlyReportRoutes");
const locationRoutes = require("./routes/locationRoutes");
const invoiceRoutes = require("./routes/InvoiceRoutes");
const rdwProxyRoutes = require("./routes/rdwProxy");
const scenarioRoutes = require("./routes/scenarioRoutes");
const targetRoutes = require("./routes/targetRoutes");
const taskRoutes = require("./routes/taskRoutes");

const energyEmissionRoutes = require("./routes/energyEmissions");
const transportEmissionRoutes = require("./routes/transportEmission");

// Middleware
// Setup CORS properly for credentials
app.use(
  cors({
    origin: dotEnv.CORS_ORIGIN || "http://localhost:3001", // Use the configured origin or default to localhost:3001
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // Allow cookies and authentication headers
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/emissions", emissionRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/employeeTransportations", employeeTransportation);
app.use("/api/employeeWorkTransportations", employeeWorkTransportation);
app.use("/api/transportations", transportationRoutes);
app.use("/api/workinghours", workingHoursRoutes);
app.use("/api/user-emissions", userEmissionRoutes);
app.use("/api/emission-types", emissionTypeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/yearly-reports", yearlyReportRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/rdw", rdwProxyRoutes);
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/tasks", taskRoutes);

app.use("/api/energy-emissions", energyEmissionRoutes);
app.use("/api/transport-emissions", transportEmissionRoutes);

mongoose.connection.on("error", (err) => {
  console.error("MongoDB Connection Error:", err);
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

mongoose
  .connect(dotEnv.MONGO_URI)
  .then(() => {
    console.log("Database connected");
    // Start the server only after successful connection
    app.listen(dotEnv.PORT || 5000, () => {
      console.log(`Server is running on port ${dotEnv.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1); // Exit the process if connection fails
  });
