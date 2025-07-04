import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard/Dashboard.js";
import UserDashboard from "./pages/UserDashboard/UserDashboard.js";
import Employees from "./pages/Employees";
import Companies from "./pages/Companies";
import TransportEmissions from "./pages/TransportEmissions/TransportEmissions.js";
import TravelAndCommuteEmissions from "./pages/TravelAndCommuteEmissions/TravelAndCommuteEmissions.js";
import Emissions from "./pages/Emissions/Emissions.js";
import Registration from "./pages/Registration";
import EmissionTypesPage from "./pages/EmissionTypes";
import EnergyEmissions from "./pages/EnergyEmissions/EnergyEmissions.js";
import VehiclePage from "./pages/Vehicles";
import VehicleRegisterPage from "./pages/VehicleRegister";
import YearlyReportsPage from "./pages/YearlyReports";
import InvoicesPage from "./pages/Invoices";
import ProductsPage from "./pages/Products";
import LicensePlatePage from "./pages/LicensePlate";
import ScenariosPage from "./pages/Scenarios";
import TargetsPage from "./pages/Targets/Targets.js";
import AnalyticsPage from "./pages/Analytics";
import AdminTransport from "./pages/AdminTransport/AdminTransport.js";
import AdminTransportEmissions from "./pages/AdminTransportEmissions/AdminTransportEmissions.js";
import AdminUserTransport from "./pages/AdminUserTransport/AdminUserTransport.js";
import { AdminRoute, EmployeeRoute } from "./utils/RouteProtection";
import "./assets/style.css";

const App = () => {
  // Initialize theme from localStorage on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.className = `${savedTheme}-theme`;
  }, []);

  return (
    <div className="app-container">
      <Routes>
        {/* Public routes - no authentication required */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />

        {/* Admin-only routes */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <AdminRoute>
              <Employees />
            </AdminRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <AdminRoute>
              <Companies />
            </AdminRoute>
          }
        />
        <Route
          path="/emissions"
          element={
            <AdminRoute>
              <Emissions />
            </AdminRoute>
          }
        />
        <Route
          path="/transport-emissions"
          element={
            <AdminRoute>
              <TransportEmissions />
            </AdminRoute>
          }
        />
        <Route
          path="/travel-and-commute"
          element={
            <AdminRoute>
              <TravelAndCommuteEmissions />
            </AdminRoute>
          }
        />
        <Route
          path="/emission-types"
          element={
            <AdminRoute>
              <EmissionTypesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/energy-emissions"
          element={
            <AdminRoute>
              <EnergyEmissions />
            </AdminRoute>
          }
        />
        <Route
          path="/vehicles"
          element={
            <AdminRoute>
              <VehiclePage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-transport"
          element={
            <AdminRoute>
              <AdminTransport />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-transport-emissions"
          element={
            <AdminRoute>
              <AdminTransportEmissions />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-user-transport"
          element={
            <AdminRoute>
              <AdminUserTransport />
            </AdminRoute>
          }
        />
        <Route
          path="/yearly-reports"
          element={
            <AdminRoute>
              <YearlyReportsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <AdminRoute>
              <InvoicesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/products"
          element={
            <AdminRoute>
              <ProductsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/license-plate"
          element={
            <AdminRoute>
              <LicensePlatePage />
            </AdminRoute>
          }
        />
        <Route
          path="/scenarios"
          element={
            <AdminRoute>
              <ScenariosPage />
            </AdminRoute>
          }
        />
        <Route
          path="/targets"
          element={
            <AdminRoute>
              <TargetsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <AdminRoute>
              <AnalyticsPage />
            </AdminRoute>
          }
        />

        {/* Employee-only routes */}
        <Route
          path="/user-dashboard"
          element={
            <EmployeeRoute>
              <UserDashboard />
            </EmployeeRoute>
          }
        />
        <Route
          path="/vehicle-register"
          element={
            <EmployeeRoute>
              <VehicleRegisterPage />
            </EmployeeRoute>
          }
        />

        {/* Special case - admin viewing employee details */}
        <Route
          path="/employee-details/:id"
          element={
            <AdminRoute>
              <UserDashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
