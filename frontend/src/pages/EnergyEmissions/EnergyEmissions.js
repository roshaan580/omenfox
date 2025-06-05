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

// Import the extracted components
import AddEnergyEmissionModal from "./components/AddEnergyEmissionModal";
import EditEnergyEmissionModal from "./components/EditEnergyEmissionModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import FilterPanel from "./components/FilterPanel";
import AnalyticsCards from "./components/AnalyticsCards";
import EmissionCharts from "./components/EmissionCharts";
import EnergyEmissionsTable from "./components/EnergyEmissionsTable";

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

// Helper function to get userId from multiple sources
const getUserId = () => {
  let userId = null;

  // First try userObj in localStorage
  try {
    const userObjStr = localStorage.getItem("userObj");
    if (userObjStr) {
      const userObj = JSON.parse(userObjStr);
      // Check for both id and _id formats
      userId = userObj._id || userObj.id;

      if (userId) return userId;
    }
  } catch (e) {
    console.error("Error getting user ID from userObj:", e);
  }

  // Then try userData in localStorage if userObj failed
  try {
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      const userDataObj = JSON.parse(userDataStr);
      // Check for both id and _id formats
      userId = userDataObj._id || userDataObj.id;

      if (userId) return userId;
    }
  } catch (e) {
    console.error("Error getting user ID from userData:", e);
  }

  return userId;
};

const EnergyEmissions = () => {
  const navigate = useNavigate();

  // Create a more reliable way to get the user ID
  const [user, setUser] = useState(null);

  // Add Sidebar state variables
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [energyRecords, setEnergyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeesState, setEmployeesState] = useState([]);

  const [emissionRecord, setEmissionRecord] = useState({
    userId: "",
    startDate: "",
    endDate: "",
    energySources: [{ type: "", emission: "" }],
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // New state variables for analytics
  const [emissionsByMonth, setEmissionsByMonth] = useState({});
  const [emissionsByType, setEmissionsByType] = useState({});
  const [totalEmissions, setTotalEmissions] = useState(0);

  // Add filter state
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    employees: [],
    energyTypes: [],
  });

  const [filteredRecords, setFilteredRecords] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log(
            "No token found in Energy Emissions page, redirecting to login"
          );
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

            // Ensure we have a valid user object with ID
            if (userObj && (userObj._id || userObj.id)) {
              setUser(userObj);

              // Update emission record with user ID
              setEmissionRecord((prev) => ({
                ...prev,
                userId: userObj._id || userObj.id,
              }));
            } else {
              // If we don't have a proper user object, try to get the ID directly
              const userId = getUserId();
              if (userId) {
                setUser({ _id: userId });
                setEmissionRecord((prev) => ({
                  ...prev,
                  userId: userId,
                }));
              }
            }
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

  // Update emission record whenever user changes
  useEffect(() => {
    // Get userId from either the user state or directly from localStorage
    const userId = user?._id || user?.id || getUserId();

    if (userId) {
      setEmissionRecord((prev) => ({
        ...prev,
        userId: userId,
      }));
    }
  }, [user]);

  // Fetch data - energy records and employees
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Fetching energy emissions data...");
        // Store JWT_ADMIN_SECRET in localStorage for axiosConfig to use
        localStorage.setItem("JWT_ADMIN_SECRET", JWT_ADMIN_SECRET);

        // Use Promise.all to fetch data from multiple endpoints simultaneously
        const [energyEmissionsRes, employeesRes] = await Promise.all([
          authenticatedFetch(`${REACT_APP_API_URL}/energy-emissions`, {
            method: "GET",
          }),
          authenticatedFetch(`${REACT_APP_API_URL}/employees`, {
            method: "GET",
          }),
        ]);

        if (!energyEmissionsRes.ok || !employeesRes.ok) {
          throw new Error("One or more API requests failed");
        }

        const [energyEmissionsData, employeesData] = await Promise.all([
          energyEmissionsRes.json(),
          employeesRes.json(),
        ]);

        console.log("Energy emissions data:", energyEmissionsData);
        console.log("Employees data:", employeesData);

        // Safely parse energySources
        const parsedData = energyEmissionsData.map((record) => {
          try {
            return {
              ...record,
              energySources: Array.isArray(record.energySources)
                ? record.energySources.map((source) => {
                    if (typeof source === "string") {
                      try {
                        return JSON.parse(source);
                      } catch (error) {
                        console.warn(
                          "Error parsing energy source:",
                          source,
                          error
                        );
                        return { type: "Unknown", emission: 0 };
                      }
                    }
                    return source;
                  })
                : [],
            };
          } catch (error) {
            console.error("Error processing record:", record, error);
            return record; // Return original record if processing fails
          }
        });

        // Sort records by date (newest first)
        const sortedData = [...parsedData].sort((a, b) => {
          // Use startDate for comparison, fallback to date if startDate is not available
          const dateA = new Date(a.startDate || a.date || 0);
          const dateB = new Date(b.startDate || b.date || 0);
          return dateB - dateA; // Sort descending (newest first)
        });

        setEnergyRecords(sortedData);
        setEmployeesState(employeesData);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Failed to fetch data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process emissions data for charts
  useEffect(() => {
    if (energyRecords.length > 0) {
      // Process monthly data
      const monthlyData = {};
      const typeData = {};
      let totalEmissionsValue = 0;

      energyRecords.forEach((record) => {
        // Get month from startDate
        const month = new Date(record.startDate || record.date).toLocaleString(
          "default",
          {
            month: "long",
          }
        );

        // Calculate total emissions for this record
        let recordTotal = 0;
        if (record.energySources && Array.isArray(record.energySources)) {
          record.energySources.forEach((source) => {
            const emission = parseFloat(source.emission || 0);
            recordTotal += emission;

            // Add to type data
            if (source.type) {
              typeData[source.type] = (typeData[source.type] || 0) + emission;
            }
          });
        }

        // Add to monthly data
        monthlyData[month] = (monthlyData[month] || 0) + recordTotal;

        // Add to total
        totalEmissionsValue += recordTotal;
      });

      setEmissionsByMonth(monthlyData);
      setEmissionsByType(typeData);
      setTotalEmissions(totalEmissionsValue);
    }
  }, [energyRecords]);

  // Add a new energy source
  const addEnergySource = () => {
    setEmissionRecord((prev) => ({
      ...prev,
      energySources: [...prev.energySources, { type: "", emission: "" }],
    }));
  };

  // Remove an energy source
  const removeEnergySource = (index) => {
    setEmissionRecord((prev) => ({
      ...prev,
      energySources: prev.energySources.filter((_, i) => i !== index),
    }));
  };

  // Initialize filtered records when emission records change
  useEffect(() => {
    setFilteredRecords(energyRecords);
  }, [energyRecords]);

  const handleAdd = () => {
    // Get the user ID directly using our helper function
    const userId = user?._id || user?.id || getUserId();

    setEmissionRecord({
      userId: userId || "",
      startDate: "",
      endDate: "",
      energySources: [{ type: "", emission: "" }],
    });

    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);
  const closeEditModal = () => setShowEditModal(false);

  // Edit modal handler
  const handleEdit = (record) => {
    console.log("Editing record:", record);

    // Get the user ID using our helper function
    const userId = user?._id || user?.id || getUserId();

    if (!userId) {
      setError("User ID is missing. Please log in again.");
      return;
    }

    setEmissionRecord({
      userId: userId,
      startDate: record.startDate
        ? new Date(record.startDate).toISOString().split("T")[0]
        : "",
      endDate: record.endDate
        ? new Date(record.endDate).toISOString().split("T")[0]
        : "",
      energySources: Array.isArray(record.energySources)
        ? record.energySources.map((source) => ({
            type: source.type || "",
            emission: source.emission || 0,
          }))
        : [{ type: "", emission: "" }],
      _id: record._id,
    });

    setShowEditModal(true);
  };

  // Handle general input changes
  const handleInputChange = (e, field) => {
    setEmissionRecord((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Handle energy source input changes
  const handleEnergySourceChange = (e, index, field) => {
    setEmissionRecord((prev) => {
      const updatedSources = [...prev.energySources];
      updatedSources[index][field] = e.target.value;
      return { ...prev, energySources: updatedSources };
    });
  };

  // Format date for input fields
  const formatDate = (isoString) => {
    if (!isoString) return ""; // Handle empty or undefined values
    return new Date(isoString).toISOString().split("T")[0];
  };

  // Submit new record
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    console.log("Adding new record...", emissionRecord);

    try {
      // Get user ID using our helper function
      const userId =
        user?._id || user?.id || getUserId() || emissionRecord.userId;

      if (!userId) {
        throw new Error(
          "User ID is missing or invalid. Please refresh and try again."
        );
      }

      // Include the user ID in the payload
      const formattedEmissionRecord = {
        ...emissionRecord,
        userId: userId,
        energySources: emissionRecord.energySources.map((source) =>
          JSON.stringify(source)
        ), // Convert each object to a string
      };

      console.log("Submission payload:", formattedEmissionRecord);

      const response = await authenticatedFetch(
        `${REACT_APP_API_URL}/energy-emissions`,
        {
          method: "POST",
          body: JSON.stringify(formattedEmissionRecord),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server response: ${errorText}`);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Energy Emission record added successfully!", result);

      // Update local state instead of reloading
      const newRecord = {
        ...result,
        energySources: result.energySources.map((source) =>
          typeof source === "string" ? JSON.parse(source) : source
        ),
      };

      setEnergyRecords([newRecord, ...energyRecords]);
      setFilteredRecords([newRecord, ...filteredRecords]);

      // Close modal
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding record:", error);
      setError(error.message);
    }
  };

  // Update record
  const handleUpdateSubmit = async (e, isUpdate = true) => {
    e.preventDefault();
    console.log("Updating record...", emissionRecord);

    try {
      // Get user ID using our helper function
      const userId =
        user?._id || user?.id || getUserId() || emissionRecord.userId;

      if (!userId) {
        throw new Error(
          "User ID is missing or invalid. Please refresh and try again."
        );
      }

      // Include the user ID in the payload
      const formattedEmissionRecord = {
        ...emissionRecord,
        userId: userId,
        energySources: emissionRecord.energySources.map((source) =>
          JSON.stringify(source)
        ), // Convert each object to a string
      };

      console.log("Update payload:", formattedEmissionRecord);

      const response = await authenticatedFetch(
        `${REACT_APP_API_URL}/energy-emissions/${emissionRecord._id}`,
        {
          method: "PUT",
          body: JSON.stringify(formattedEmissionRecord),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server response: ${errorText}`);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Energy Emission record updated successfully!", result);

      // Update local state instead of reloading
      const updatedRecord = {
        ...result,
        energySources: result.energySources.map((source) =>
          typeof source === "string" ? JSON.parse(source) : source
        ),
      };

      // Update in both record lists
      setEnergyRecords(
        energyRecords.map((record) =>
          record._id === updatedRecord._id ? updatedRecord : record
        )
      );

      setFilteredRecords(
        filteredRecords.map((record) =>
          record._id === updatedRecord._id ? updatedRecord : record
        )
      );

      // Close modal
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating record:", error);
      setError(error.message);
    }
  };

  // Confirm delete
  const confirmDelete = (data) => {
    setDeleteRecordId(data._id);
    setShowDeleteConfirm(true);
  };

  // Delete the emission record
  const handleDelete = async () => {
    try {
      console.log("Deleting record ID:", deleteRecordId);
      const response = await authenticatedFetch(
        `${REACT_APP_API_URL}/energy-emissions/${deleteRecordId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${response.statusText}. ${errorText}`
        );
      }

      console.log("Energy Emission record deleted successfully!");

      // Update local state instead of reloading
      setEnergyRecords(
        energyRecords.filter((record) => record._id !== deleteRecordId)
      );
      setFilteredRecords(
        filteredRecords.filter((record) => record._id !== deleteRecordId)
      );

      // Close modal
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting record:", error);
      setError(`Failed to delete record: ${error.message}`);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...energyRecords];
    console.log("Manual filter application triggered");
    console.log("Initial records count:", filtered.length);

    if (filters.startDate) {
      filtered = filtered.filter(
        (record) =>
          new Date(record.startDate || record.date) >=
          new Date(filters.startDate)
      );
      console.log("After startDate filter:", filtered.length);
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (record) =>
          new Date(record.startDate || record.date) <= new Date(filters.endDate)
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

    if (filters.energyTypes && filters.energyTypes.length > 0) {
      console.log("Selected energy types:", filters.energyTypes);
      filtered = filtered.filter(
        (record) =>
          record.energySources &&
          Array.isArray(record.energySources) &&
          record.energySources.some((source) =>
            filters.energyTypes.some((type) => type.value === source.type)
          )
      );
      console.log("After energy types filter:", filtered.length);
    }

    setFilteredRecords(filtered);
    console.log("Final filtered records:", filtered.length);
  };

  // Reset filters
  const resetFilters = () => {
    setFilteredRecords(energyRecords);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    localStorage.removeItem("userData");
    navigate("/");
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`;
  };

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
        label: "Emissions by Source",
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
            <h1>Energy & Gas</h1>
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
            applyFilters={applyFilters}
            resetFilters={resetFilters}
          />

          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Analytics Cards Component */}
              <AnalyticsCards
                theme={theme}
                totalEmissions={totalEmissions}
                filteredRecords={filteredRecords}
                emissionsByType={emissionsByType}
              />

              {/* Charts Component */}
              <EmissionCharts
                theme={theme}
                monthlyChartData={monthlyChartData}
                typeChartData={typeChartData}
              />

              {/* Records Table Component */}
              <EnergyEmissionsTable
                theme={theme}
                filteredRecords={filteredRecords}
                handleEdit={handleEdit}
                confirmDelete={confirmDelete}
              />
            </>
          )}

          {/* Add Modal Component */}
          <AddEnergyEmissionModal
            showAddModal={showAddModal}
            closeAddModal={closeAddModal}
            emissionRecord={emissionRecord}
            handleInputChange={handleInputChange}
            handleEnergySourceChange={handleEnergySourceChange}
            addEnergySource={addEnergySource}
            removeEnergySource={removeEnergySource}
            handleAddSubmit={handleAddSubmit}
            employeesState={employeesState}
          />

          {/* Edit Modal Component */}
          <EditEnergyEmissionModal
            showEditModal={showEditModal}
            closeEditModal={closeEditModal}
            emissionRecord={emissionRecord}
            handleInputChange={handleInputChange}
            handleEnergySourceChange={handleEnergySourceChange}
            addEnergySource={addEnergySource}
            removeEnergySource={removeEnergySource}
            handleUpdateSubmit={handleUpdateSubmit}
            employeesState={employeesState}
            formatDate={formatDate}
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

export default EnergyEmissions;
