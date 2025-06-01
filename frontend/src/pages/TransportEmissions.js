import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../config";
import { isYearlyRecordEditable, formatDecimal } from "../utils/dateUtils";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../utils/axiosConfig";

const TransportEmissions = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Safely get and parse user data
  const userObj = localStorage.getItem("userObj");
  let user = null;
  let userId = "";

  try {
    if (userObj) {
      user = JSON.parse(userObj);
      // For admin users, use the id field, for other users use _id
      userId = user.id || user._id || "";
    }
  } catch (error) {
    console.error("Error parsing user data:", error);
  }

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transportRecords, setTransportRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState({
    userId: userId,
    month: "",
    year: "",
    transportMode: "",
    distance: "",
    weight: "",
    emissionFactor: "",
  });
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and set user data
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

  const handleAdd = () => {
    if (!userId) {
      setError("User information not found. Please log in again.");
      return;
    }

    setCurrentRecord({
      userId: userId,
      month: "",
      year: "",
      transportMode: "",
      distance: "",
      weight: "",
      emissionFactor: "",
    });
    setShowModal(true);
    setError("");
  };

  useEffect(() => {
    const fetchTransportEmissions = async () => {
      setIsLoading(true);

      // Skip fetch if no userId
      if (!userId) {
        setError("User information not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching transport emissions for user ID:", userId);

        const response = await fetch(
          `${REACT_APP_API_URL}/transport-emissions/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setTransportRecords(data);
        console.log("Transport Emission Records:", data);
      } catch (error) {
        console.error("Error fetching transport emissions:", error);
        setError(`Failed to load transport emissions: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransportEmissions();
  }, [userId]);

  const handleEdit = (record) => {
    if (!userId) {
      setError("User information not found. Please log in again.");
      return;
    }

    setCurrentRecord({
      ...record,
      userId: userId,
    });
    setIsEdit(true);
    setShowModal(true);
    setError("");
  };

  // Confirm delete
  const confirmDelete = (data) => {
    if (!data._id) {
      setError("Cannot delete: Record ID not found.");
      return;
    }

    setDeleteRecordId(data._id);
    setShowDeleteConfirm(true);
    setError("");
  };

  // Delete the emission record
  const handleDelete = async () => {
    if (!deleteRecordId) {
      setError("Cannot delete: Record ID not found.");
      return;
    }

    try {
      console.log("Deleting record ID:", deleteRecordId);
      setIsLoading(true);

      const response = await fetch(
        `${REACT_APP_API_URL}/transport-emissions/${deleteRecordId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to delete record");

      console.log("Transport Emission record deleted successfully!");
      setShowDeleteConfirm(false);

      // Remove the deleted record from state instead of reloading
      setTransportRecords((prev) =>
        prev.filter((record) => record._id !== deleteRecordId)
      );
    } catch (error) {
      console.error("Error deleting record:", error);
      setError(`Failed to delete record: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e, field) => {
    setCurrentRecord((prev) => ({
      ...prev,
      [field]: e.target.value,
      userId: userId,
    }));
  };

  // Submit new or updated record
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("User information not found. Please log in again.");
      return;
    }

    console.log(
      isEdit ? "Updating record..." : "Adding new record...",
      currentRecord
    );

    try {
      setIsLoading(true);

      const url = isEdit
        ? `${REACT_APP_API_URL}/transport-emissions/${currentRecord._id}`
        : `${REACT_APP_API_URL}/transport-emissions`;

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
        body: JSON.stringify({
          ...currentRecord,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error: ${response.status} - ${response.statusText}`
        );
      }

      const responseData = await response.json();
      console.log(
        `Transport Records record ${
          isEdit ? "updated" : "added"
        } successfully!`,
        responseData
      );

      // Update state with the new/updated record from the response
      if (isEdit) {
        setTransportRecords((prev) =>
          prev.map((record) =>
            record._id === currentRecord._id
              ? responseData.transportEmission
              : record
          )
        );
      } else {
        // For new records, add the new record from the response to the beginning of the array
        setTransportRecords((prev) => [
          responseData.transportEmission,
          ...prev,
        ]);
      }

      setShowModal(false);
      setError("");
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "adding"} record:`, error);
      setError(
        `Failed to ${isEdit ? "update" : "add"} record: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format loading state
  const renderLoading = () => (
    <div className="d-flex justify-content-center my-5">
      <div className="spinner-border text-success" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  // Helper to format error state
  const renderError = () => (
    <div className="alert alert-danger" role="alert">
      <strong>Error:</strong> {error}
      <button
        className="btn btn-outline-danger btn-sm float-end"
        onClick={() => setError("")}
      >
        Dismiss
      </button>
    </div>
  );

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
          <h1 className="mb-4">Transport Emissions</h1>

          {error && renderError()}

          <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
            <p className="mb-0">Total: {transportRecords.length}</p>
            <button
              className="btn btn-outline-success d-flex align-items-center px-4 py-1 rounded-3 shadow-sm hover-shadow"
              onClick={handleAdd}
              disabled={!userId || isLoading}
            >
              <FaPlus className="me-2" /> Add New Record
            </button>
          </div>

          {isLoading ? (
            renderLoading()
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Transport Mode</th>
                    <th>Distance (km)</th>
                    <th>Weight (tons)</th>
                    <th>Emission Factor (kg CO₂/ton-km)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transportRecords.length > 0 ? (
                    transportRecords.map((record, index) => (
                      <tr key={record._id || index}>
                        <td>{index + 1}</td>
                        <td>{record.month}</td>
                        <td>{record.year}</td>
                        <td>{record.transportMode}</td>
                        <td>{formatDecimal(record.distance)}</td>
                        <td>{formatDecimal(record.weight)}</td>
                        <td>{formatDecimal(record.emissionFactor)}</td>
                        <td>
                          <div className="d-flex gap-2 justify-content-center">
                            {isYearlyRecordEditable(record) ? (
                              <>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleEdit(record)}
                                  disabled={isLoading}
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => confirmDelete(record)}
                                  disabled={isLoading}
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </>
                            ) : (
                              <span className="text-muted small">
                                Locked (previous year)
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted">
                        {userId
                          ? "No records found"
                          : "Please log in to view your records"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Add/Edit Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>
                {isEdit ? "Edit" : "Add"} Transport Emission Record
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                {error && renderError()}

                <Form.Group className="mb-3">
                  <Form.Label>Month</Form.Label>
                  <Form.Control
                    as="select"
                    value={currentRecord.month}
                    onChange={(e) => handleInputChange(e, "month")}
                    required
                  >
                    <option value="">Select Month</option>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month, index) => (
                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    value={currentRecord.year}
                    onChange={(e) => handleInputChange(e, "year")}
                    placeholder="Enter Year"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Transport Mode</Form.Label>
                  <Form.Control
                    as="select"
                    value={currentRecord.transportMode}
                    onChange={(e) => handleInputChange(e, "transportMode")}
                    required
                  >
                    <option value="">Select Mode</option>
                    {["Truck", "Train", "Ship", "Airplane"].map(
                      (mode, index) => (
                        <option key={index} value={mode}>
                          {mode}
                        </option>
                      )
                    )}
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Distance (km)</Form.Label>
                  <Form.Control
                    type="number"
                    value={currentRecord.distance}
                    onChange={(e) => handleInputChange(e, "distance")}
                    placeholder="Enter Distance"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Weight (tons)</Form.Label>
                  <Form.Control
                    type="number"
                    value={currentRecord.weight}
                    onChange={(e) => handleInputChange(e, "weight")}
                    placeholder="Enter Weight"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Emission Factor (kg CO₂/ton-km)</Form.Label>
                  <Form.Control
                    type="number"
                    value={currentRecord.emissionFactor}
                    onChange={(e) => handleInputChange(e, "emissionFactor")}
                    placeholder="Enter Emission Factor"
                    required
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="success" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      {isEdit ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>{isEdit ? "Update" : "Save"}</>
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            show={showDeleteConfirm}
            onHide={() => setShowDeleteConfirm(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete this Transport Emission record?
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default TransportEmissions;
