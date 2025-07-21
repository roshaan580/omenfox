import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Components
import Sidebar from "../../components/Sidebar";
import TransportTable from "./components/TransportTable";
import ResourcesTable from "./components/ResourcesTable";
import VehiclesTable from "./components/VehiclesTable";
import TransportEmissions from "./components/TransportEmissions";

// Modals
import TransportationModal from "./components/modals/TransportationModal";
import ResourceModal from "./components/modals/ResourceModal";
import UpdateResourceModal from "./components/modals/UpdateResourceModal";
import ProfileModal from "./components/modals/ProfileModal";
import VehicleModal from "./components/modals/VehicleModal";

// Hooks
import useTransportData from "./utils/hooks/useTransportData";
import useResourceData from "./utils/hooks/useResourceData";
import useVehicleData from "./utils/hooks/useVehicleData";
import useUIState from "./utils/hooks/useUIState";

const DashboardPage = () => {
  const { id } = useParams(); // Extract ID from URL
  const navigate = useNavigate();
  const [employeeId] = useState(id ?? null);
  const [userData, setUserData] = useState(null);

  // Initialize hooks
  const transportData = useTransportData(employeeId);
  const resourceData = useResourceData(employeeId);
  const vehicleData = useVehicleData();

  // Initialize UI state with callbacks
  const uiState = useUIState(
    transportData.initializeTransportationData,
    transportData.initializeWorkTransportationData,
    () => {}, // No initialization needed for resources
    (show) => setIsRegModel(show),
    () => {} // No initialization needed for profile
  );

  // Destructure state from hooks for convenience
  const {
    employeeTransListing,
    employeeTransportationData,
    setEmployeeTransportationData,
    filterTransportationData,
  } = transportData;

  const {
    otherResources,
    loadOtherResources,
    handleNewResourceChange,
    handleEmissionTypeChange,
    handleAddResource,
    handleUpdateResourceChange,
    initEditResource,
    handleUpdateResource,
    handleDeleteResource,
    emissionTypes,
    newResourceData,
    updateResourceData,
  } = resourceData;

  const { vehicles, handleToggleFavorite } = vehicleData;

  const {
    theme,
    activeTab,
    filterType,
    isSidebarOpen,
    isTransportationModalVisible,
    isOtherResourcesModalVisible,
    isUpdateResourceModalVisible,
    isProfileModalVisible,
    isRegModel,
    setActiveTab,
    setFilterType,
    setIsSidebarOpen,
    setIsTransportationModalVisible,
    setIsOtherResourcesModalVisible,
    setIsUpdateResourceModalVisible,
    setIsProfileModalVisible,
    setIsRegModel,
    handleThemeToggle,
    closeModal,
  } = uiState;

  // Load additional resources when tab changes
  useEffect(() => {
    if (
      activeTab === "otherResources" &&
      !resourceData.isLoading &&
      otherResources.length === 0
    ) {
      loadOtherResources();
    }
  }, [
    activeTab,
    loadOtherResources,
    resourceData.isLoading,
    otherResources.length,
  ]);

  // Apply filter when filter type or tab changes, but only for transport and workTransport tabs
  useEffect(() => {
    // Only apply filtering for transport-related tabs, not for TransportEmissions
    if (activeTab === "transport" || activeTab === "workTransport") {
      filterTransportationData(filterType, activeTab);
    }
  }, [filterType, activeTab, filterTransportationData]);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        let userObj = null;

        try {
          const userObjStr = localStorage.getItem("userObj");
          if (userObjStr) {
            userObj = JSON.parse(userObjStr);
          }
        } catch (parseError) {
          console.error("Error parsing user object:", parseError);
        }

        if (token && userObj) {
          setUserData(userObj);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle transportation form changes
  const handleTransportationChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setEmployeeTransportationData((prevData) => {
        if (type === "checkbox") {
          return { ...prevData, [name]: checked };
        }
        return { ...prevData, [name]: value };
      });
    },
    [setEmployeeTransportationData]
  );

  // Handle profile update
  const handleProfileUpdate = useCallback((updatedData) => {
    localStorage.setItem("userObj", JSON.stringify(updatedData));
    window.location.reload();
  }, []);

  // Handle logout with stable identity
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    navigate("/");
  }, [navigate]);

  // Don't re-render TransportEmissions unnecessarily
  const renderTransportEmissions = useCallback(() => {
    return <TransportEmissions activeTab={activeTab} />;
  }, [activeTab]);

  return (
    <div className={`dashboard-container bg-${theme}`}>
      <Sidebar
        userData={userData}
        theme={theme}
        toggleTheme={handleThemeToggle}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className={`main-content ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
        <div className="mt-2 mt-md-0">
          <div className="container-fluid px-0">
            <ul className="nav nav-tabs py-2">
              <li className="nav-item tab-item">
                <button
                  className={`nav-link ${
                    activeTab === "transport" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("transport")}
                >
                  <i className="fas fa-car me-1"></i> Transport
                </button>
              </li>
              <li className="nav-item tab-item">
                <button
                  className={`nav-link ${
                    activeTab === "TransportEmissions" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("TransportEmissions")}
                >
                  <i className="fas fa-chart-line me-1"></i> Freight Transport
                </button>
              </li>
              <li className="nav-item tab-item">
                <button
                  className={`nav-link ${
                    activeTab === "otherResources" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("otherResources")}
                >
                  <i className="fas fa-leaf me-1"></i> Energy & Gases
                </button>
              </li>
              <li className="nav-item tab-item">
                <button
                  className={`nav-link ${
                    activeTab === "Manage Vehicles" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("Manage Vehicles")}
                >
                  <i className="fas fa-car-alt me-1"></i> Manage Vehicles
                </button>
              </li>
            </ul>
          </div>

          {/* Transport Tab */}
          {activeTab === "transport" && (
            <div className="container-fluid mt-4 px-3">
              <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
                <h4 className="text-success mb-0">Travel & Commute Records (Scope 3)</h4>
                <div>
                  <select
                    className="form-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    aria-label="Filter records"
                  >
                    <option value="self">Show My Records</option>
                    <option value="global">Show All Records (Global)</option>
                  </select>
                </div>
              </div>

              <TransportTable records={employeeTransListing} />
            </div>
          )}

          {/* Other Resources Tab */}
          {activeTab === "otherResources" && (
            <div className="container-fluid mt-4 px-3">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h4 className="text-success mb-0">Energy & Gases</h4>
                <div>
                  <select
                    className="form-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    aria-label="Filter resources"
                  >
                    <option value="self">Show My Records</option>
                    <option value="global">Show All Records (Global)</option>
                  </select>
                </div>
              </div>

              <ResourcesTable
                resources={otherResources}
                onEdit={initEditResource}
                onDelete={handleDeleteResource}
              />
            </div>
          )}

          {/* Manage Vehicles Tab */}
          {activeTab === "Manage Vehicles" && (
            <div className="container-fluid py-4 px-3">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h4 className="text-success mb-0">Manage Vehicles</h4>
                <p className="mb-0">Total Vehicles: {vehicles.length}</p>
              </div>

              <VehiclesTable
                vehicles={vehicles}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          )}

          {/* Transport Emissions Tab - Use memoized rendering */}
          {activeTab === "TransportEmissions" && renderTransportEmissions()}

          {/* Modals */}
          <TransportationModal
            visible={isTransportationModalVisible}
            onClose={() => setIsTransportationModalVisible(false)}
            formData={employeeTransportationData}
            onChange={handleTransportationChange}
            vehicles={vehicles}
            onSubmitSuccess={async () => {
              // First close the modal
              setIsTransportationModalVisible(false);

              // Then reload the data from the server to get the latest records
              await transportData.loadTransportationData();

              // Finally apply the filter to update the UI
              filterTransportationData(filterType, "transport");
            }}
          />

          <ResourceModal
            visible={isOtherResourcesModalVisible}
            onClose={() => setIsOtherResourcesModalVisible(false)}
            formData={newResourceData}
            emissionTypes={emissionTypes}
            onChange={handleNewResourceChange}
            onEmissionTypeChange={handleEmissionTypeChange}
            onSubmit={async () => {
              const success = await handleAddResource();
              if (success) {
                setIsOtherResourcesModalVisible(false);
                await loadOtherResources();
              }
            }}
            theme={theme}
          />

          <UpdateResourceModal
            visible={isUpdateResourceModalVisible}
            onClose={() => setIsUpdateResourceModalVisible(false)}
            formData={updateResourceData}
            emissionTypes={emissionTypes}
            onChange={handleUpdateResourceChange}
            onSubmit={async () => {
              const success = await handleUpdateResource();
              if (success) {
                setIsUpdateResourceModalVisible(false);
                await loadOtherResources();
              }
            }}
          />

          <VehicleModal
            visible={isRegModel}
            onClose={() => {
              closeModal();
              vehicleData.refreshVehicles();
            }}
          />

          <ProfileModal
            visible={isProfileModalVisible}
            onClose={() => setIsProfileModalVisible(false)}
            userData={userData}
            onUpdate={handleProfileUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
