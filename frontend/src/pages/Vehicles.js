import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../config";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaPlusCircle } from "react-icons/fa";
import UpdateVehicle from "./UpdateVehicle";
import Sidebar from "../components/Sidebar";
import { authenticatedFetch } from "../utils/axiosConfig";
import TablePagination from "../components/TablePagination";
import usePagination from "../hooks/usePagination";
import VehicleModal from "./UserDashboard/components/modals/VehicleModal";
import { Modal } from "react-bootstrap";

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegModel, setIsRegModel] = useState(false);
  const [isModalVisible, setModalVisible] = useState(null);
  const navigate = useNavigate();

  // Add Sidebar state variables
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Use pagination hook
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    paginate,
    changeItemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
    totalItems,
  } = usePagination(vehicles);

  // Check authentication on load and set user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        try {
          const response = await authenticatedFetch(
            `${REACT_APP_API_URL}/auth/validate-token`,
            {
              method: "GET",
            }
          );
          if (response.ok) {
            // Set the user data
            const userObj = JSON.parse(localStorage.getItem("userObj"));
            setUserData(userObj);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("userObj");
            localStorage.removeItem("userData");
            navigate("/");
          }
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("userObj");
          localStorage.removeItem("userData");
          navigate("/");
        }
      } catch (error) {
        navigate("/");
      }
    };

    checkAuth();
    // Apply theme from localStorage
    document.body.className = `${theme}-theme`;
  }, [navigate, theme]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${REACT_APP_API_URL}/vehicles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const deleteVehicle = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const response = await fetch(`${REACT_APP_API_URL}/vehicles/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        });

        if (response.ok) {
          setVehicles(vehicles.filter((vehicle) => vehicle._id !== id));
        } else {
          throw new Error("Failed to delete vehicle");
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const editVehicle = (vehicle) => {
    setModalVisible(vehicle);
  };

  const regVehicle = (e) => {
    setIsRegModel(e);
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsRegModel(false);
    fetchVehicles();
  };

  // Add handleLogout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    localStorage.removeItem("userData");
    navigate("/");
  };

  // Add toggleTheme function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`;
  };

  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="alert alert-info" role="alert">
          Loading Vehicles...
        </div>
      </div>
    );
  }

  const handleProfileUpdate = (updatedData) => {
    // Update the vehicle in the vehicles array
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) =>
        vehicle._id === updatedData._id ? updatedData : vehicle
      )
    );
    // Close the modal
    setModalVisible(false);
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
        <div className="container mt-4">
          <h1 className="mb-4">Vehicles</h1>

          {/* Add error message display */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Vehicle Listing Table */}
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
            <p className="mb-0">Total: {vehicles.length}</p>
            <button
              className="btn btn-outline-success d-flex align-items-center px-4 py-1 rounded-3 shadow-sm hover-shadow"
              onClick={() => regVehicle(true)}
            >
              <FaPlusCircle className="me-2" />
              Register Vehicle
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vehicle Name</th>
                  <th>License Plate</th>
                  <th>Vehicle Type</th>
                  <th>Engine Number</th>
                  <th>Vehicle Use</th>
                  <th>Vehicle Model</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((vehicle, index) => (
                    <tr key={vehicle._id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{vehicle.vehicleName || "N/A"}</td>
                      <td>{vehicle.licensePlate || "N/A"}</td>
                      <td>{vehicle.vehicleType || "N/A"}</td>
                      <td>{vehicle.engineNumber || "N/A"}</td>
                      <td>{vehicle.vehicleUseFor || "N/A"}</td>
                      <td>{vehicle.vehicleModel || "N/A"}</td>
                      <td className="text-center">
                        <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => editVehicle(vehicle)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteVehicle(vehicle._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      No vehicles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination component */}
          <TablePagination
            currentPage={currentPage}
            onPageChange={paginate}
            totalPages={totalPages}
            recordsPerPage={itemsPerPage}
            onRecordsPerPageChange={changeItemsPerPage}
            totalRecords={totalItems}
            startIndex={indexOfFirstItem}
            endIndex={indexOfLastItem}
            theme={theme}
          />

          {/* Vehicle Update Modal */}
          {isModalVisible && (
            <Modal
              show={!!isModalVisible}
              onHide={closeModal}
              size="lg"
              backdrop="static"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Edit Vehicle</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <UpdateVehicle
                  userData={isModalVisible}
                  isModelVisible={!!isModalVisible}
                  onUpdate={handleProfileUpdate}
                />
              </Modal.Body>
            </Modal>
          )}

          {/* Vehicle Registration Modal */}
          {isRegModel && (
            <VehicleModal visible={isRegModel} onClose={closeModal} />
          )}
        </div>
      </div>
    </div>
  );
};

export default VehiclePage;
