import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";
import { FaPlusCircle } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import { authenticatedFetch } from "../utils/axiosConfig";

const EmissionTypesPage = () => {
  const [emissionTypes, setEmissionTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEmissionType, setCurrentEmissionType] = useState({
    name: "",
    conversionFactor: "",
  });
  const [editEmissionTypeId, setEditEmissionTypeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Add Sidebar state variables
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  useEffect(() => {
    const fetchEmissionTypes = async () => {
      setLoading(true);
      try {
        console.log("Fetching emission types...");
        console.log("API URL:", `${REACT_APP_API_URL}/emission-types`);

        const response = await fetch(`${REACT_APP_API_URL}/emission-types`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        });

        if (!response.ok) {
          console.error(
            "Error response:",
            response.status,
            response.statusText
          );
          throw new Error(`Failed to fetch emission types: ${response.status}`);
        }

        const data = await response.json();
        console.log("Emission types data:", data);
        setEmissionTypes(data);
      } catch (error) {
        console.error("Error fetching emission types:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmissionTypes();
  }, []);

  const handleAddEmissionType = () => {
    setCurrentEmissionType({ name: "", conversionFactor: "" });
    setShowAddModal(true);
  };

  const handleEditEmissionType = (emissionType) => {
    setCurrentEmissionType(emissionType);
    setEditEmissionTypeId(emissionType._id);
    setShowEditModal(true);
  };

  const handleDeleteEmissionType = async (id) => {
    try {
      await axios.delete(`${REACT_APP_API_URL}/emission-types/${id}`, {
        headers: {
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
      });
      setEmissionTypes(emissionTypes.filter((type) => type._id !== id));
    } catch (error) {
      console.error("Error deleting emission type:", error);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${REACT_APP_API_URL}/emission-types`,
        currentEmissionType,
        {
          headers: {
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );
      setEmissionTypes([...emissionTypes, response.data]);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding emission type:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${REACT_APP_API_URL}/emission-types/${editEmissionTypeId}`,
        currentEmissionType,
        {
          headers: {
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );
      setEmissionTypes(
        emissionTypes.map((type) =>
          type._id === editEmissionTypeId ? response.data : type
        )
      );
      setShowEditModal(false);
    } catch (error) {
      console.error("Error editing emission type:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmissionType((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
          <h1 className="mb-4">Emission Types</h1>

          <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
            <p className="mb-0">Total Emission Types: {emissionTypes.length}</p>
            <button
              className="btn btn-outline-success"
              onClick={handleAddEmissionType}
            >
              <FaPlusCircle className="me-2" /> Add New Emission Type
            </button>
          </div>

          {loading && (
            <div className="alert alert-info">Loading emission types...</div>
          )}
          {error && (
            <div className="alert alert-danger">
              Error: {error}. Please check console for details.
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Conversion Factor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emissionTypes.length > 0
                  ? emissionTypes.map((type, index) => (
                      <tr key={type._id}>
                        <td>{index + 1}</td>
                        <td>{type.name}</td>
                        <td>{type.conversionFactor}</td>
                        <td className="text-center">
                          <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleEditEmissionType(type)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteEmissionType(type._id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : !loading && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No emission types found
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>

          {/* Add Modal */}
          <Modal
            className="custom-scrollbar"
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Add New Emission Type</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleAddSubmit}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={currentEmissionType.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="conversionFactor" className="mb-3">
                  <Form.Label>Conversion Factor</Form.Label>
                  <Form.Control
                    type="number"
                    name="conversionFactor"
                    value={currentEmissionType.conversionFactor}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button variant="primary" type="submit">
                    Save Emission Type
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Edit Modal */}
          <Modal
            className="custom-scrollbar"
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Emission Type</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleEditSubmit}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={currentEmissionType.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="conversionFactor" className="mb-3">
                  <Form.Label>Conversion Factor</Form.Label>
                  <Form.Control
                    type="number"
                    name="conversionFactor"
                    value={currentEmissionType.conversionFactor}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button variant="primary" type="submit">
                    Update Emission Type
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default EmissionTypesPage;
