import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../../config";
import { authenticatedFetch } from "../../utils/axiosConfig";
import Sidebar from "../../components/Sidebar";
import { FaPlusCircle } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Import extracted components
import AddTransportEmissionModal from "./components/AddTransportEmissionModal";
import EditTransportEmissionModal from "./components/EditTransportEmissionModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import FilterPanel from "./components/FilterPanel";
import AnalyticsCards from "./components/AnalyticsCards";
import EmissionCharts from "./components/EmissionCharts";
import EmissionsTable from "./components/EmissionsTable";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const EmissionPage = () => {
  const [emissionRecords, setEmissionRecords] = useState([]);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [emissionRecord, setEmissionRecord] = useState({
    startLocation: { address: "", lat: 0, lon: 0 },
    endLocation: { address: "", lat: 0, lon: 0 },
    date: "",
    distance: "",
    co2Used: "",
    employee: "",
    transportation: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [employeesState, setEmployeesState] = useState([]);
  const [carsState, setCarsState] = useState([]);
  const navigate = useNavigate();

  // Add Sidebar state variables
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // New state variables for analytics
  const [emissionsByMonth, setEmissionsByMonth] = useState({});
  const [emissionsByType, setEmissionsByType] = useState({});
  const [totalEmissions, setTotalEmissions] = useState(0);

  // Add filter state
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    employees: [],
    transportations: [],
  });

  const [filteredRecords, setFilteredRecords] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found in Emissions page, redirecting to login");
          navigate("/");
          return;
        }

        try {
          // Validate token
          const response = await authenticatedFetch(
            `${REACT_APP_API_URL}/auth/validate-token`,
            {
              method: "GET",
            }
          );
          if (!response.ok) {
            // Failed validation, redirect to login
            localStorage.removeItem("token");
            localStorage.removeItem("userObj");
            localStorage.removeItem("userData");
            navigate("/");
          } else {
            // Set the user data
            const userObj = JSON.parse(localStorage.getItem("userObj"));
            setUserData(userObj);
          }
        } catch (validationError) {
          console.error("Token validation error:", validationError);
          localStorage.removeItem("token");
          localStorage.removeItem("userObj");
          localStorage.removeItem("userData");
          navigate("/");
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        setError("Authentication failed. Please log in again.");
        navigate("/");
      }
    };

    checkAuth();
    // Apply theme from localStorage
    document.body.className = `${theme}-theme`;
  }, [navigate, theme]);

  // Fetch all emission records, employees, and cars
  useEffect(() => {
    const fetchEmissions = async () => {
      try {
        console.log("Fetching emissions data...");
        // Store JWT_ADMIN_SECRET in localStorage for axiosConfig to use
        localStorage.setItem("JWT_ADMIN_SECRET", JWT_ADMIN_SECRET);

        // Use Promise.all with authenticatedFetch instead
        const [emissionsRes, employeesRes, carsRes] = await Promise.all([
          authenticatedFetch(`${REACT_APP_API_URL}/emissions?global=true`, {
            method: "GET",
            headers: {
              // Include JWT_ADMIN_SECRET as a fallback
              ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
                ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
                : {}),
            },
          }),
          authenticatedFetch(`${REACT_APP_API_URL}/employees`, {
            method: "GET",
            headers: {
              ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
                ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
                : {}),
            },
          }),
          authenticatedFetch(`${REACT_APP_API_URL}/transportations`, {
            method: "GET",
            headers: {
              ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
                ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
                : {}),
            },
          }),
        ]);

        console.log("Emissions API response status:", emissionsRes.status);
        console.log("Employees API response status:", employeesRes.status);
        console.log("Transportations API response status:", carsRes.status);

        const [emissionsData, employeesData, carsData] = await Promise.all([
          emissionsRes.json(),
          employeesRes.json(),
          carsRes.json(),
        ]);

        console.log("Emissions data length:", emissionsData.length);
        console.log("Employees data length:", employeesData.length);
        console.log("Cars data length:", carsData.length);

        setEmissionRecords(emissionsData);
        setEmployeesState(employeesData);
        setCarsState(carsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Failed to fetch data: ${error.message}`);
      }
    };
    fetchEmissions();
  }, []);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (startLat, startLon, endLat, endLon) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((endLat - startLat) * Math.PI) / 180;
    const dLon = ((endLon - startLon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((startLat * Math.PI) / 180) *
        Math.cos((endLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance.toFixed(2);
  };

  // Update distance whenever start or end location changes
  useEffect(() => {
    if (
      emissionRecord.startLocation?.lat &&
      emissionRecord.startLocation?.lon &&
      emissionRecord.endLocation?.lat &&
      emissionRecord.endLocation?.lon
    ) {
      const distance = calculateDistance(
        emissionRecord.startLocation.lat,
        emissionRecord.startLocation.lon,
        emissionRecord.endLocation.lat,
        emissionRecord.endLocation.lon
      );

      setEmissionRecord((prev) => ({
        ...prev,
        distance,
      }));
    }
  }, [emissionRecord.startLocation, emissionRecord.endLocation]);

  const handleInputChange = (e, field) => {
    setEmissionRecord({
      ...emissionRecord,
      [field]: e.target.value,
    });
  };

  const handleStartLocationChange = (location) => {
    console.log("Start location changed:", location);
    // Make sure address is properly set
    if (location && !location.address && location.lat && location.lon) {
      // If we have coordinates but no address, try to fetch the address
      fetchAddressFromCoordinates(location.lat, location.lon)
        .then((address) => {
          setEmissionRecord((prev) => ({
            ...prev,
            startLocation: {
              ...location,
              address: address || `Lat: ${location.lat}, Lon: ${location.lon}`,
            },
          }));
        })
        .catch((err) => {
          console.error("Error fetching address:", err);
          setEmissionRecord((prev) => ({
            ...prev,
            startLocation: location,
          }));
        });
    } else {
      setEmissionRecord((prev) => ({
        ...prev,
        startLocation: location,
      }));
    }
  };

  const handleEndLocationChange = (location) => {
    console.log("End location changed:", location);
    // Make sure address is properly set
    if (location && !location.address && location.lat && location.lon) {
      // If we have coordinates but no address, try to fetch the address
      fetchAddressFromCoordinates(location.lat, location.lon)
        .then((address) => {
          setEmissionRecord((prev) => ({
            ...prev,
            endLocation: {
              ...location,
              address: address || `Lat: ${location.lat}, Lon: ${location.lon}`,
            },
          }));
        })
        .catch((err) => {
          console.error("Error fetching address:", err);
          setEmissionRecord((prev) => ({
            ...prev,
            endLocation: location,
          }));
        });
    } else {
      setEmissionRecord((prev) => ({
        ...prev,
        endLocation: location,
      }));
    }
  };

  // Helper function to get address from coordinates
  const fetchAddressFromCoordinates = async (lat, lon) => {
    try {
      const response = await fetch(
        `${REACT_APP_API_URL}/rdw/reverse-geocode?lat=${lat}&lon=${lon}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch address");
      }
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  const handleAdd = () => {
    const today = new Date().toISOString().split("T")[0];

    // Initialize with empty objects but with correct structure
    setEmissionRecord({
      startLocation: {
        address: "",
        lat: null,
        lon: null,
      },
      endLocation: {
        address: "",
        lat: null,
        lon: null,
      },
      date: today,
      distance: "",
      co2Used: "",
      employee: "",
      transportation: "",
    });

    console.log("Opening Add New Record modal");
    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);

  const closeEditModal = () => setShowEditModal(false);

  // Submit form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await authenticatedFetch(`${REACT_APP_API_URL}/emissions`, {
        method: "POST",
        body: JSON.stringify(emissionRecord),
        headers: {
          ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
            ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
            : {}),
        },
      });

      console.log("Emission record created successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error submitting record:", error);
      setError(`Failed to submit emission record: ${error.message}`);
    }
  };

  // Edit modal handler
  const handleEdit = (record) => {
    setEmissionRecord({
      startLocation: {
        address: record.startLocation.address,
        lat: record.startLocation.lat,
        lon: record.startLocation.lon,
      },
      endLocation: {
        address: record.endLocation.address,
        lat: record.endLocation.lat,
        lon: record.endLocation.lon,
      },
      date: new Date(record?.date).toISOString().split("T")[0],
      distance: record.distance,
      co2Used: record.co2Used,
      employee: record.employee?._id,
      transportation: record.transportation?._id,
      _id: record?._id,
    });
    setShowEditModal(true);
  };

  // Update record
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await authenticatedFetch(
        `${REACT_APP_API_URL}/emissions/${emissionRecord._id}`,
        {
          method: "PUT",
          body: JSON.stringify(emissionRecord),
          headers: {
            ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
              ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
              : {}),
          },
        }
      );

      console.log("Emission record updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error submitting updated record:", error);
      setError(`Failed to update emission record: ${error.message}`);
    }
  };

  // Confirm delete
  const confirmDelete = (data) => {
    setDeleteRecordId(data?._id);
    setShowDeleteConfirm(true);
  };

  // Delete the emission record
  const handleDelete = async () => {
    try {
      await authenticatedFetch(
        `${REACT_APP_API_URL}/emissions/${deleteRecordId}`,
        {
          method: "DELETE",
          headers: {
            ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
              ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
              : {}),
          },
        }
      );

      console.log("Emission record deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting record:", error);
      setError(`Failed to delete emission record: ${error.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`;
  };

  // Process emissions data for charts
  useEffect(() => {
    if (emissionRecords.length > 0) {
      // Process monthly data
      const monthlyData = emissionRecords.reduce((acc, record) => {
        const month = new Date(record.date).toLocaleString("default", {
          month: "long",
        });
        acc[month] = (acc[month] || 0) + parseFloat(record.co2Used);
        return acc;
      }, {});

      // Process type data
      const typeData = emissionRecords.reduce((acc, record) => {
        const type = record.transportation?.name || "Other";
        acc[type] = (acc[type] || 0) + parseFloat(record.co2Used);
        return acc;
      }, {});

      // Calculate total emissions
      const total = emissionRecords.reduce(
        (sum, record) => sum + parseFloat(record.co2Used),
        0
      );

      setEmissionsByMonth(monthlyData);
      setEmissionsByType(typeData);
      setTotalEmissions(total);
    }
  }, [emissionRecords]);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...emissionRecords];
    console.log("Manual filter application triggered");
    console.log("Initial records count:", filtered.length);

    if (filters.startDate) {
      filtered = filtered.filter(
        (record) => new Date(record.date) >= new Date(filters.startDate)
      );
      console.log("After startDate filter:", filtered.length);
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (record) => new Date(record.date) <= new Date(filters.endDate)
      );
      console.log("After endDate filter:", filtered.length);
    }

    if (filters.employees && filters.employees.length > 0) {
      console.log("Selected employees:", filters.employees);
      filtered = filtered.filter((record) =>
        filters.employees.some((emp) => emp.value === record.employee?._id)
      );
      console.log("After employees filter:", filtered.length);
    }

    if (filters.transportations && filters.transportations.length > 0) {
      console.log("Selected transportations:", filters.transportations);
      filtered = filtered.filter((record) =>
        filters.transportations.some(
          (trans) => trans.value === record.transportation?._id
        )
      );
      console.log("After transportations filter:", filtered.length);
    }

    setFilteredRecords(filtered);
    console.log("Final filtered records:", filtered.length);
  };

  // Initialize filtered records when emission records change
  useEffect(() => {
    setFilteredRecords(emissionRecords);
  }, [emissionRecords]);

  // Chart configurations
  const monthlyChartData = {
    labels: Object.keys(emissionsByMonth),
    datasets: [
      {
        label: "Monthly CO₂ Emissions (kg)",
        data: Object.values(emissionsByMonth),
        backgroundColor:
          theme === "dark"
            ? "rgba(75, 192, 192, 0.3)"
            : "rgba(75, 192, 192, 0.2)",
        borderColor:
          theme === "dark" ? "rgba(75, 192, 192, 1)" : "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor:
          theme === "dark" ? "rgba(75, 192, 192, 1)" : "rgba(54, 162, 235, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor:
          theme === "dark" ? "rgba(75, 192, 192, 1)" : "rgba(54, 162, 235, 1)",
      },
    ],
  };

  const typeChartData = {
    labels: Object.keys(emissionsByType),
    datasets: [
      {
        label: "Emissions by Type",
        data: Object.values(emissionsByType),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className={`dashboard-container bg-${theme}`}>
      <Sidebar
        userData={userData}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className={`main-content ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
        <div className="container-fluid mt-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <h1>Transport Emission Records</h1>
            <div>
              <Button
                variant="outline-primary"
                className="me-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="fas fa-filter me-2"></i>{" "}
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button variant="outline-success" onClick={handleAdd}>
                <FaPlusCircle className="me-2" /> Add New Record
              </Button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Filter Panel Component */}
          <FilterPanel
            showFilters={showFilters}
            filters={filters}
            setFilters={setFilters}
            theme={theme}
            employeesState={employeesState}
            carsState={carsState}
            applyFilters={applyFilters}
            emissionRecords={emissionRecords}
            setFilteredRecords={setFilteredRecords}
          />

          {/* Analytics Cards Component */}
          <AnalyticsCards
            theme={theme}
            totalEmissions={totalEmissions}
            filteredRecords={filteredRecords}
          />

          {/* Charts Component */}
          <EmissionCharts
            theme={theme}
            monthlyChartData={monthlyChartData}
            typeChartData={typeChartData}
            emissionsByType={emissionsByType}
          />

          {/* Records Table Component */}
          <EmissionsTable
            theme={theme}
            filteredRecords={filteredRecords}
            handleEdit={handleEdit}
            confirmDelete={confirmDelete}
          />

          {/* Add Modal Component */}
          <AddTransportEmissionModal
            showAddModal={showAddModal}
            closeAddModal={closeAddModal}
            emissionRecord={emissionRecord}
            handleInputChange={handleInputChange}
            handleStartLocationChange={handleStartLocationChange}
            handleEndLocationChange={handleEndLocationChange}
            handleAddSubmit={handleAddSubmit}
            employeesState={employeesState}
            carsState={carsState}
            setEmissionRecord={setEmissionRecord}
          />

          {/* Edit Modal Component */}
          <EditTransportEmissionModal
            showEditModal={showEditModal}
            closeEditModal={closeEditModal}
            emissionRecord={emissionRecord}
            handleInputChange={handleInputChange}
            handleStartLocationChange={handleStartLocationChange}
            handleEndLocationChange={handleEndLocationChange}
            handleUpdateSubmit={handleUpdateSubmit}
            employeesState={employeesState}
            carsState={carsState}
            setEmissionRecord={setEmissionRecord}
          />

          {/* Delete Confirmation Modal Component */}
          <DeleteConfirmationModal
            showDeleteConfirm={showDeleteConfirm}
            setShowDeleteConfirm={setShowDeleteConfirm}
            handleDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default EmissionPage;
