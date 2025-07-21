import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../../config";
import { authenticatedFetch } from "../../utils/axiosConfig";
import Sidebar from "../../components/Sidebar";
import { FaPlusCircle } from "react-icons/fa";

// Import components
import MobileCombustionModal from "./components/MobileCombustionModal";
import MobileCombustionTable from "./components/MobileCombustionTable";
import InfoCards from "./components/InfoCards";

const MobileCombustionPage = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("vehicle-input");
  const [currentRecord, setCurrentRecord] = useState({
    type: "vehicle", // vehicle or direct
    vehicleId: "",
    startLocation: { address: "", lat: 0, lon: 0 },
    endLocation: { address: "", lat: 0, lon: 0 },
    distance: "",
    fuelType: "",
    fuelConsumption: "",
    emissionFactor: "",
    co2Equivalent: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    isElectric: false, // Track if it's an electric vehicle (Scope 2)
  });
  const [vehicles, setVehicles] = useState([]);
  const navigate = useNavigate();

  // Add Sidebar state variables
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fuel types and their typical emission factors
  const fuelTypes = [
    { name: "Petrol/Gasoline", factor: 2.31, unit: "kg CO₂/L" },
    { name: "Diesel", factor: 2.68, unit: "kg CO₂/L" },
    { name: "LPG (Liquified Petroleum Gas)", factor: 1.51, unit: "kg CO₂/L" },
    { name: "CNG (Compressed Natural Gas)", factor: 2.75, unit: "kg CO₂/kg" },
    { name: "Biodiesel", factor: 2.52, unit: "kg CO₂/L" },
    { name: "Ethanol", factor: 1.51, unit: "kg CO₂/L" },
    { name: "Electric", factor: 0, unit: "kg CO₂/kWh", scope: 2 }, // Scope 2
  ];

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found in Mobile Combustion page, redirecting to login");
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

  // Fetch mobile combustion records and vehicles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching mobile combustion data...");
        
        // Store JWT_ADMIN_SECRET in localStorage for axiosConfig to use
        localStorage.setItem("JWT_ADMIN_SECRET", JWT_ADMIN_SECRET);

        // Fetch vehicles and mobile combustion records
        const [vehiclesRes, mobileCombustionRes] = await Promise.all([
          authenticatedFetch(`${REACT_APP_API_URL}/vehicles`, {
            method: "GET",
            headers: {
              ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
                ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
                : {}),
            },
          }),
          authenticatedFetch(`${REACT_APP_API_URL}/mobile-combustion?global=true`, {
            method: "GET",
            headers: {
              ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
                ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
                : {}),
            },
          })
        ]);

        if (vehiclesRes.ok) {
          const vehiclesData = await vehiclesRes.json();
          setVehicles(vehiclesData);
        }

        if (mobileCombustionRes.ok) {
          const mobileCombustionData = await mobileCombustionRes.json();
          setRecords(mobileCombustionData);
        }

      } catch (error) {
        console.error("Error fetching mobile combustion data:", error);
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
      type: "vehicle",
      vehicleId: "",
      startLocation: { address: "", lat: 0, lon: 0 },
      endLocation: { address: "", lat: 0, lon: 0 },
      distance: "",
      fuelType: "", // Initialize as empty string
      fuelConsumption: "", // Initialize as empty string
      emissionFactor: "", // Initialize as empty string
      co2Equivalent: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
      isElectric: false,
    });
    setActiveTab("vehicle-input");
    setShowAddModal(true);
    setError(null); // Clear any previous errors
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setActiveTab(record.type === "direct" ? "direct-input" : "vehicle-input");
    setShowEditModal(true);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Ensure we're not passing undefined values to controlled form components
    setCurrentRecord(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-fill emission factor when fuel type is selected
    if (name === "fuelType") {
      const selectedFuel = fuelTypes.find(fuel => fuel.name === value);
      if (selectedFuel) {
        setCurrentRecord(prev => ({
          ...prev,
          emissionFactor: selectedFuel.factor,
          isElectric: selectedFuel.name === "Electric"
        }));
      }
    }
  };

  const calculateEmissions = () => {
    const { distance, fuelConsumption, emissionFactor } = currentRecord;
    
    if (activeTab === "vehicle-input") {
      // Formula: Distance (km) × Emission Factor (kg CO₂/km)
      const dist = parseFloat(distance) || 0;
      const factor = parseFloat(emissionFactor) || 0;
      return dist * factor;
    } else {
      // Direct input: Fuel Consumption × Emission Factor
      const consumption = parseFloat(fuelConsumption) || 0;
      const factor = parseFloat(emissionFactor) || 0;
      return consumption * factor;
    }
  };

  const validateForm = () => {
    if (!currentRecord.date) {
      setError("Date is required.");
      return false;
    }
    
    if (!currentRecord.fuelType) {
      setError("Fuel type is required.");
      return false;
    }

    if (activeTab === "vehicle-input") {
      if (!currentRecord.distance) {
        setError("Distance is required for vehicle input.");
        return false;
      }
      if (!currentRecord.emissionFactor) {
        setError("Emission factor is required.");
        return false;
      }
    } else if (activeTab === "direct-input") {
      if (!currentRecord.fuelConsumption) {
        setError("Fuel consumption is required for direct input.");
        return false;
      }
      if (!currentRecord.emissionFactor) {
        setError("Emission factor is required.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const co2Equivalent = calculateEmissions();
    const recordToSave = {
      ...currentRecord,
      type: activeTab === "vehicle-input" ? "vehicle" : "direct",
      co2Equivalent,
      isCompanyVehicle: true, // Mark as company vehicle for Scope 1
      scope: currentRecord.isElectric ? 2 : 1, // Electric vehicles are Scope 2
    };

    try {
      if (showAddModal) {
        // Create new record via API
        const response = await authenticatedFetch(`${REACT_APP_API_URL}/mobile-combustion`, {
          method: "POST",
          body: JSON.stringify(recordToSave),
          headers: {
            ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
              ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
              : {}),
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setRecords(prev => [result.record, ...prev]);
        setShowAddModal(false);
        setError(null);
      } else {
        // Update existing record via API
        const response = await authenticatedFetch(`${REACT_APP_API_URL}/mobile-combustion/${currentRecord._id}`, {
          method: "PUT",
          body: JSON.stringify(recordToSave),
          headers: {
            ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
              ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
              : {}),
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setRecords(prev => prev.map(record => 
          record._id === currentRecord._id ? result.record : record
        ));
        setShowEditModal(false);
        setError(null);
      }
    } catch (error) {
      console.error("Error saving record:", error);
      setError(`Failed to save record: ${error.message}`);
    }
  };

  const handleDelete = async (recordId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await authenticatedFetch(`${REACT_APP_API_URL}/mobile-combustion/${recordId}`, {
          method: "DELETE",
          headers: {
            ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
              ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
              : {}),
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        setRecords(prev => prev.filter(record => record._id !== recordId));
        setError(null);
      } catch (error) {
        console.error("Error deleting record:", error);
        setError(`Failed to delete record: ${error.message}`);
      }
    }
  };

  const getScopeColor = (record) => {
    return record.isElectric || record.scope === 2 ? 'info' : 'success';
  };

  const getScopeLabel = (record) => {
    return record.isElectric || record.scope === 2 ? 'Scope 2' : 'Scope 1';
  };

  // Handle tab change and update record type
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset fields that are specific to each tab type to avoid validation errors
    if (tab === "vehicle-input") {
      setCurrentRecord(prev => ({
        ...prev,
        type: "vehicle",
        distance: prev.distance || "",
        fuelConsumption: "" // Clear the fuelConsumption field from direct input
      }));
    } else {
    setCurrentRecord(prev => ({
      ...prev,
        type: "direct",
        distance: "", // Clear the distance field from vehicle input
        fuelConsumption: prev.fuelConsumption || ""
    }));
    }
    // Clear any validation errors
    setError(null);
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
              <h1>Mobile Combustion (Scope 1 & 2)</h1>
              <p className="text-muted mb-0">
                Direct emissions from company-owned vehicles and equipment
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
              <MobileCombustionTable 
                records={records}
                loading={loading}
                theme={theme}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                getScopeColor={getScopeColor}
                getScopeLabel={getScopeLabel}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <MobileCombustionModal
        showAddModal={showAddModal}
        showEditModal={showEditModal}
        currentRecord={currentRecord}
        vehicles={vehicles}
        fuelTypes={fuelTypes}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        handleInputChange={handleInputChange}
        calculateEmissions={calculateEmissions}
        handleSubmit={handleSubmit}
        closeModals={closeModals}
      />
    </div>
  );
};

export default MobileCombustionPage;