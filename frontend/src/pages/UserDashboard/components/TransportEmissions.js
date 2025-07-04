import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import { FaPlus, FaCopy, FaCheck } from "react-icons/fa";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../../../config";
import {
  isYearlyRecordEditable,
  formatDecimal,
} from "../../../utils/dateUtils";
import TransportEmissionsModal from "./modals/TransportEmissionsModal";
import TablePagination from "../../../components/TablePagination";
import usePagination from "../../../hooks/usePagination";

/**
 * Transport Emissions component for monthly transport emissions tracking
 * Used as a tab within the UserDashboard
 */
const TransportEmissions = ({ activeTab }) => {
  // Safely get and parse user data
  const userObj = localStorage.getItem("userObj");
  let user = null;
  let userId = "";

  try {
    if (userObj) {
      user = JSON.parse(userObj);
      userId = user._id || "";
    }
  } catch (error) {
    console.error("Error parsing user data:", error);
  }

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transportRecords, setTransportRecords] = useState([]);
  const [sortedRecords, setSortedRecords] = useState([]);
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
  const [theme] = useState(localStorage.getItem("theme") || "light");
  const [copiedId, setCopiedId] = useState(null);

  // Use pagination hook with sorted records
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
  } = usePagination(sortedRecords);

  // Sort records by date (latest first)
  useEffect(() => {
    if (transportRecords.length > 0) {
      // Create a sortable date using year and month
      const sorted = [...transportRecords].sort((a, b) => {
        // Create date objects using year and month (set day to 1)
        const dateA = new Date(`${a.year}-${getMonthNumber(a.month)}-01`);
        const dateB = new Date(`${b.year}-${getMonthNumber(b.month)}-01`);

        // Sort descending (newest first)
        return dateB - dateA;
      });

      setSortedRecords(sorted);
    } else {
      setSortedRecords([]);
    }
  }, [transportRecords]);

  // Helper to convert month name to number
  const getMonthNumber = (monthName) => {
    const months = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };
    return months[monthName] || "01";
  };

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
    setIsEdit(false);
    setShowModal(true);
    setError("");
  };

  // Move loadTransportEmissions to useCallback to prevent unnecessary rerenders
  const loadTransportEmissions = useCallback(async () => {
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
  }, [userId]);

  // Load data when tab becomes active
  useEffect(() => {
    if (activeTab === "TransportEmissions") {
      loadTransportEmissions();
    }
  }, [activeTab, loadTransportEmissions]);

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

  // Submit new or updated record - now uses the modal's callback
  const handleSubmitSuccess = (newRecord, isUpdating) => {
    // Update the local state immediately for fast UI response
    if (isUpdating) {
      setTransportRecords((prev) =>
        prev.map((record) =>
          record._id === newRecord._id ? newRecord : record
        )
      );
    } else {
      setTransportRecords((prev) => [...prev, newRecord]);
    }

    // Also refresh the data from server to ensure consistency
    loadTransportEmissions();

    // Close the modal
    setShowModal(false);
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

  const deepOmitFields = (obj, fields) => {
    if (Array.isArray(obj)) {
      return obj.map((item) => deepOmitFields(item, fields));
    } else if (obj && typeof obj === "object") {
      const newObj = {};
      Object.keys(obj).forEach((key) => {
        if (!fields.includes(key)) {
          newObj[key] = deepOmitFields(obj[key], fields);
        }
      });
      return newObj;
    }
    return obj;
  };

  return (
    <>
      {activeTab === "TransportEmissions" && (
        <div className="container py-5">
          {error && renderError()}

          <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
            <h4 className="text-left text-success mb-0">Freight Transport</h4>
            <button
              className="btn btn-success"
              onClick={handleAdd}
              disabled={!userId || isLoading}
            >
              <FaPlus className="me-2" /> Add New Record
            </button>
          </div>

          {isLoading ? (
            renderLoading()
          ) : (
            <>
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
                    {paginatedItems.length > 0 ? (
                      paginatedItems.map((record, index) => (
                        <tr key={record._id || index}>
                          <td>{indexOfFirstItem + index + 1}</td>
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
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const toCopy = deepOmitFields(record, [
                                    "_id",
                                    "createdAt",
                                    "updatedAt",
                                    "__v",
                                  ]);
                                  await navigator.clipboard.writeText(
                                    JSON.stringify(toCopy, null, 2)
                                  );
                                  setCopiedId(record._id);
                                  setTimeout(() => setCopiedId(null), 1000);
                                }}
                                title={
                                  copiedId === record._id ? "Copied!" : "Copy"
                                }
                                disabled={isLoading}
                              >
                                {copiedId === record._id ? (
                                  <FaCheck />
                                ) : (
                                  <FaCopy />
                                )}
                              </Button>
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
            </>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <TransportEmissionsModal
        showModal={showModal}
        closeModal={() => setShowModal(false)}
        currentRecord={currentRecord}
        isEdit={isEdit}
        handleInputChange={handleInputChange}
        onSubmitSuccess={handleSubmitSuccess}
      />

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
    </>
  );
};

export default TransportEmissions;
