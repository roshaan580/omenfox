import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../../config";
import { authenticatedFetch } from "../../utils/axiosConfig";
import Sidebar from "../../components/Sidebar";
import { FaPlusCircle } from "react-icons/fa";

// Import components
import FreightTransportModal from "./components/FreightTransportModal";
import FreightTransportTable from "./components/FreightTransportTable";
import InfoCards from "./components/InfoCards";
import EmissionsByMode from "./components/EmissionsByMode";

const FreightTransportPage = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({
    month: "",
    year: new Date().getFullYear(),
    transportMode: "",
    distance: "",
    weight: "",
    emissionFactor: "",
    description: "",
  });
  const navigate = useNavigate();

  // Add Sidebar state variables
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Transport modes with typical emission factors (kg CO₂e/ton-km)
  const transportModes = [
    { name: "Road Freight (Truck)", factor: 0.062, description: "Heavy-duty trucks, long-haul" },
    { name: "Rail Freight", factor: 0.022, description: "Freight trains" },
    { name: "Sea Freight (Container)", factor: 0.011, description: "Container ships" },
    { name: "Air Freight", factor: 0.602, description: "Cargo aircraft" },
    { name: "Inland Waterway", factor: 0.031, description: "Barges, river transport" },
    { name: "Pipeline", factor: 0.002, description: "Oil, gas pipelines" },
    { name: "Courier/Express", factor: 0.678, description: "Express delivery services" },
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found in Freight Transport page, redirecting to login");
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

  // Fetch freight transport records
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching freight transport data...");
        
        // Store JWT_ADMIN_SECRET in localStorage for axiosConfig to use
        localStorage.setItem("JWT_ADMIN_SECRET", JWT_ADMIN_SECRET);

        const response = await authenticatedFetch(`${REACT_APP_API_URL}/freight-transport?global=true`, {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setRecords(data);
        }

      } catch (error) {
        console.error("Error fetching freight transport data:", error);
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
      month: "",
      year: new Date().getFullYear(),
      transportMode: "",
      distance: "",
      weight: "",
      emissionFactor: "",
      description: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRecord(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill emission factor when transport mode is selected
    if (name === "transportMode") {
      const selectedMode = transportModes.find(mode => mode.name === value);
      if (selectedMode) {
        setCurrentRecord(prev => ({
          ...prev,
          emissionFactor: selectedMode.factor
        }));
      }
    }
  };

  const calculateEmissions = () => {
    const { distance, weight, emissionFactor } = currentRecord;
    const dist = parseFloat(distance) || 0;
    const wt = parseFloat(weight) || 0;
    const factor = parseFloat(emissionFactor) || 0;
    return dist * wt * factor;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const totalEmissions = calculateEmissions();
    const recordToSave = {
      ...currentRecord,
      totalEmissions,
      scope: 3, // Always Scope 3 for freight transport
      isThirdParty: true,
    };

    try {
      if (showAddModal) {
        // Create new record via API
        const response = await authenticatedFetch(`${REACT_APP_API_URL}/freight-transport`, {
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
        const response = await authenticatedFetch(`${REACT_APP_API_URL}/freight-transport/${currentRecord._id}`, {
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
        const response = await authenticatedFetch(`${REACT_APP_API_URL}/freight-transport/${recordId}`, {
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

  const getTotalEmissions = () => {
    return records.reduce((total, record) => total + (record.totalEmissions || 0), 0);
  };

  const getEmissionsByMode = () => {
    const modeEmissions = {};
    records.forEach(record => {
      const mode = record.transportMode || 'Unknown';
      modeEmissions[mode] = (modeEmissions[mode] || 0) + (record.totalEmissions || 0);
    });
    return modeEmissions;
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
              <h1>Freight Transport (Scope 3)</h1>
              <p className="text-muted mb-0">
                Indirect emissions from third-party freight and logistics services
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
          <InfoCards theme={theme} getTotalEmissions={getTotalEmissions} />

          {/* Records Table */}
          <div className="row">
            <div className="col-12">
              <FreightTransportTable
                records={records}
                loading={loading}
                theme={theme}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            </div>
          </div>

          {/* Emissions by Transport Mode */}
          <EmissionsByMode theme={theme} emissionsByMode={getEmissionsByMode()} />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <FreightTransportModal
        showAddModal={showAddModal}
        showEditModal={showEditModal}
        currentRecord={currentRecord}
        transportModes={transportModes}
        months={months}
        handleInputChange={handleInputChange}
        calculateEmissions={calculateEmissions}
        handleSubmit={handleSubmit}
        closeModals={closeModals}
      />
    </div>
  );
};

export default FreightTransportPage;
