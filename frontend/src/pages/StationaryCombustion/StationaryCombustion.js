import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../../config";
import { authenticatedFetch } from "../../utils/axiosConfig";
import Sidebar from "../../components/Sidebar";
import { FaPlusCircle } from "react-icons/fa";

// Import components
import StationaryCombustionModal from "./components/StationaryCombustionModal";
import StationaryCombustionTable from "./components/StationaryCombustionTable";
import InfoCards from "./components/InfoCards";

const StationaryCombustionPage = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("combustion");
  const [currentRecord, setCurrentRecord] = useState({
    type: "combustion", // combustion or fugitive
    fuelType: "",
    activityData: "",
    energyContent: "",
    emissionFactor: "",
    gwp: 1,
    co2Equivalent: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
  });
  const navigate = useNavigate();

  // Add Sidebar state variables
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fuel types for combustion emissions
  const combustionFuels = [
    { name: "Natural Gas", energyContent: 38.7, emissionFactor: 56.1, unit: "GJ" },
    { name: "Propane", energyContent: 25.3, emissionFactor: 63.1, unit: "GJ" },
    { name: "Heating Oil", energyContent: 38.2, emissionFactor: 74.1, unit: "GJ" },
    { name: "Coal", energyContent: 24.0, emissionFactor: 94.6, unit: "GJ" },
    { name: "Wood/Biomass", energyContent: 15.0, emissionFactor: 0, unit: "GJ" }, // Biogenic
    { name: "Diesel (Generators)", energyContent: 38.6, emissionFactor: 74.1, unit: "GJ" },
  ];

  // Fugitive emission gases with GWP values
  const fugitiveGases = [
    { name: "R-134a (HFC)", gwp: 1430 },
    { name: "R-410A (HFC)", gwp: 2088 },
    { name: "R-404A (HFC)", gwp: 3922 },
    { name: "R-22 (HCFC)", gwp: 1810 },
    { name: "CO2 (Refrigerant)", gwp: 1 },
    { name: "Ammonia (NH3)", gwp: 0 },
    { name: "SF6 (Sulfur Hexafluoride)", gwp: 22800 },
    { name: "N2O (Nitrous Oxide)", gwp: 298 },
  ];

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found in Stationary Combustion page, redirecting to login");
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

  // Fetch stationary combustion records
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching stationary combustion data...");
        
        // Store JWT_ADMIN_SECRET in localStorage for axiosConfig to use
        localStorage.setItem("JWT_ADMIN_SECRET", JWT_ADMIN_SECRET);

        const response = await authenticatedFetch(`${REACT_APP_API_URL}/stationary-combustion?global=true`, {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setRecords(data);
        }

      } catch (error) {
        console.error("Error fetching stationary combustion data:", error);
        setError(`Failed to fetch data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchData();
    }
  }, [userData]);

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

  const handleAddNew = () => {
    setCurrentRecord({
      type: "combustion",
      fuelType: "", // Initialize as empty string
      activityData: "", // Initialize as empty string
      energyContent: "", // Initialize as empty string
      emissionFactor: "", // Initialize as empty string
      gwp: "1", // Initialize as string "1" instead of number 1
      co2Equivalent: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
    });
    setActiveTab("combustion");
    setShowAddModal(true);
    setError(null); // Clear any previous errors
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setActiveTab(record.type);
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentRecord(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-fill values when fuel type is selected
    if (name === "fuelType") {
      if (activeTab === "combustion") {
        const selectedFuel = combustionFuels.find(fuel => fuel.name === value);
        if (selectedFuel) {
          setCurrentRecord(prev => ({
            ...prev,
            type: "combustion",
            energyContent: selectedFuel.energyContent,
            emissionFactor: selectedFuel.emissionFactor
          }));
        }
      } else if (activeTab === "fugitive") {
        const selectedGas = fugitiveGases.find(gas => gas.name === value);
        if (selectedGas) {
          setCurrentRecord(prev => ({
            ...prev,
            type: "fugitive",
            gwp: selectedGas.gwp
          }));
        }
      }
    }
  };

  const calculateEmissions = () => {
    const { type, activityData, energyContent, emissionFactor, gwp } = currentRecord;
    
    if (type === "combustion") {
      // Formula: Activity Data × Energy Content × Emission Factor
      const activity = parseFloat(activityData) || 0;
      const energy = parseFloat(energyContent) || 0;
      const factor = parseFloat(emissionFactor) || 0;
      return activity * energy * factor;
    } else {
      // Fugitive: Activity Data × GWP
      const activity = parseFloat(activityData) || 0;
      const gwpValue = parseFloat(gwp) || 1;
      return activity * gwpValue;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form fields manually since we've removed required attributes
    if (!currentRecord.date) {
      setError("Date is required");
      return;
    }
    
    if (!currentRecord.fuelType) {
      setError("Fuel type is required");
      return;
    }
    
    if (!currentRecord.activityData) {
      setError("Activity data is required");
      return;
    }
    
    if (currentRecord.type === "combustion") {
      if (!currentRecord.energyContent) {
        setError("Energy content is required");
        return;
      }
      if (!currentRecord.emissionFactor) {
        setError("Emission factor is required");
        return;
      }
    } else if (currentRecord.type === "fugitive") {
      if (!currentRecord.gwp) {
        setError("Global Warming Potential (GWP) is required");
        return;
      }
    }
    
    const co2Equivalent = calculateEmissions();
    const recordToSave = {
      ...currentRecord,
      co2Equivalent,
      scope: 1, // Always Scope 1 for stationary combustion
    };

    try {
      if (showAddModal) {
        // Create new record via API
        const response = await authenticatedFetch(`${REACT_APP_API_URL}/stationary-combustion`, {
          method: "POST",
          body: JSON.stringify(recordToSave),
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setRecords(prev => [result.record, ...prev]);
        setShowAddModal(false);
      } else {
        // Update existing record via API
        const response = await authenticatedFetch(`${REACT_APP_API_URL}/stationary-combustion/${currentRecord._id}`, {
          method: "PUT",
          body: JSON.stringify(recordToSave),
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setRecords(prev => prev.map(record => 
          record._id === currentRecord._id ? result.record : record
        ));
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Error saving record:", error);
      setError(`Failed to save record: ${error.message}`);
    }
  };

  const handleDelete = async (recordId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await authenticatedFetch(`${REACT_APP_API_URL}/stationary-combustion/${recordId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        setRecords(prev => prev.filter(record => record._id !== recordId));
      } catch (error) {
        console.error("Error deleting record:", error);
        setError(`Failed to delete record: ${error.message}`);
      }
    }
  };

  // Handler for closing modals
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setError(null);
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
            <div>
              <h1>Stationary Combustion (Scope 1)</h1>
              <p className="text-muted mb-0">
                Direct emissions from stationary sources and fugitive emissions
              </p>
            </div>
            <Button variant="outline-success" onClick={handleAddNew}>
              <FaPlusCircle className="me-2" /> Add New Record
            </Button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Information Cards */}
          <InfoCards theme={theme} />

          {/* Records Table */}
          <div className="row">
            <div className="col-12">
              <StationaryCombustionTable
                records={records}
                loading={loading}
                theme={theme}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <StationaryCombustionModal
        showAddModal={showAddModal}
        showEditModal={showEditModal}
        activeTab={activeTab}
        currentRecord={currentRecord}
        combustionFuels={combustionFuels}
        fugitiveGases={fugitiveGases}
        handleInputChange={handleInputChange}
        calculateEmissions={calculateEmissions}
        handleSubmit={handleSubmit}
        closeModals={closeModals}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default StationaryCombustionPage;
