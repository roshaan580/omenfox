import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../../config";
import Sidebar from "../../components/Sidebar";
import TablePagination from "../../components/TablePagination";
import usePagination from "../../hooks/usePagination";
import MapComponent from "../../components/MapComponent";

const AdminTransport = () => {
  const [transportRecords, setTransportRecords] = useState([]);
  const [sortedRecords, setSortedRecords] = useState([]);
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Sidebar state
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sort records by date (newest first)
  useEffect(() => {
    if (transportRecords && transportRecords.length > 0) {
      const sorted = [...transportRecords].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA; // Sort descending (newest first)
      });
      setSortedRecords(sorted);
    } else {
      setSortedRecords([]);
    }
  }, [transportRecords]);

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
  } = usePagination(sortedRecords);

  // Check authentication
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const userObj = JSON.parse(localStorage.getItem("userObj"));
        if (userObj && userObj.role !== "admin") {
          navigate("/"); // Redirect non-admin users
          return;
        }

        setUserData(userObj);

        // Apply theme
        document.body.className = `${theme}-theme`;
      } catch (error) {
        console.error("Error fetching user data", error);
        navigate("/");
      }
    };

    fetchUserData();
  }, [navigate, theme]);

  // Fetch transportation data
  useEffect(() => {
    const fetchTransportData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `${REACT_APP_API_URL}/employeeTransportations`,
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
        const records = data.data || data;

        setTransportRecords(records);
      } catch (error) {
        console.error("Error fetching transport records:", error);
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransportData();
  }, []);

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

  // Toggle expanded view for a record
  const toggleExpand = (id) => {
    if (expandedRecord === id) {
      setExpandedRecord(null);
    } else {
      setExpandedRecord(id);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (startLat, startLon, endLat, endLon) => {
    if (!startLat || !startLon || !endLat || !endLon) return null;

    try {
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
    } catch (error) {
      console.error("Error calculating distance:", error);
      return null;
    }
  };

  // Calculate total CO2 impact
  const calculateTotalImpact = (record) => {
    const distance = calculateDistance(
      record?.beginLocationLat,
      record?.beginLocationLon,
      record?.endLocationLat,
      record?.endLocationLon
    );

    if (distance && record?.co2Emission) {
      return (parseFloat(distance) * parseFloat(record.co2Emission)).toFixed(2);
    } else if (record?.co2Emission) {
      return parseFloat(record.co2Emission).toFixed(2);
    }
    return "N/A";
  };

  // Format transportation mode for display
  const formatTransportMode = (mode) => {
    if (!mode) return "Unknown";

    const modes = {
      car: "Car",
      bike: "Bicycle",
      walking: "Walking",
      public_transport: "Public Transport",
      plane: "Plane",
    };

    return modes[mode] || mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  // Format purpose/usage type for display
  const formatPurpose = (purpose) => {
    if (!purpose) return "Not specified";

    // Replace underscores with spaces and capitalize
    return purpose
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format vehicle type for display
  const formatVehicleType = (type) => {
    if (!type) return "Not specified";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Format recurring days
  const formatRecurring = (recurrenceDays) => {
    if (!recurrenceDays || recurrenceDays === 0) return "No";
    return `Yes (${recurrenceDays} days per week)`;
  };

  // Helper to format loading state
  const renderLoading = () => (
    <div className="d-flex justify-content-center my-5">
      <div className="spinner-border text-primary" role="status">
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

  // Helper to get user information
  const getUserInfo = (record) => {
    if (!record) return "Unknown User";

    // Check API response format to access user information
    const user = record.employee || record.user || {};
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (record.employeeId) {
      return `ID: ${record.employeeId}`;
    }
    return "Unknown User";
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
          <Card className={`bg-${theme} shadow-sm mb-4`}>
            <Card.Body>
              <h2 className="mb-4">User Transport Records</h2>

              {error && renderError()}

              {isLoading ? (
                renderLoading()
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th width="3%"></th>
                          <th width="4%">#</th>
                          <th>User</th>
                          <th>Mode</th>
                          <th>Purpose</th>
                          <th>Distance</th>
                          <th>CO₂ Impact</th>
                          <th>Date</th>
                          <th>Recurring</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems?.length > 0 ? (
                          paginatedItems.map((record, index) => {
                            const distance = calculateDistance(
                              record?.beginLocationLat,
                              record?.beginLocationLon,
                              record?.endLocationLat,
                              record?.endLocationLon
                            );

                            const impact = calculateTotalImpact(record);
                            const isExpanded = expandedRecord === record?._id;
                            const userInfo = getUserInfo(record);

                            return (
                              <React.Fragment key={record?._id}>
                                <tr
                                  className={isExpanded ? "expanded-row" : ""}
                                  onClick={() => toggleExpand(record?._id)}
                                  style={{ cursor: "pointer" }}
                                >
                                  <td>
                                    <i
                                      className={`fas fa-chevron-${
                                        isExpanded ? "down" : "right"
                                      }`}
                                    ></i>
                                  </td>
                                  <td>{indexOfFirstItem + index + 1}</td>
                                  <td>{userInfo}</td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <i
                                        className={`fas fa-${
                                          record?.transportationMode === "car"
                                            ? "car"
                                            : record?.transportationMode ===
                                              "bike"
                                            ? "bicycle"
                                            : record?.transportationMode ===
                                              "walking"
                                            ? "walking"
                                            : record?.transportationMode ===
                                              "public_transport"
                                            ? "bus"
                                            : record?.transportationMode ===
                                              "plane"
                                            ? "plane"
                                            : "question"
                                        } me-2`}
                                      ></i>
                                      {formatTransportMode(
                                        record?.transportationMode
                                      )}
                                      {record?.vehicleType && (
                                        <span className="badge bg-info ms-2">
                                          {formatVehicleType(
                                            record?.vehicleType
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td>{formatPurpose(record?.usageType)}</td>
                                  <td>
                                    {distance ? (
                                      <span>{distance} km</span>
                                    ) : (
                                      <span className="text-muted">
                                        Unknown
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {impact !== "N/A" ? (
                                      <span>{impact} kg CO₂</span>
                                    ) : (
                                      <span className="text-muted">N/A</span>
                                    )}
                                  </td>
                                  <td>
                                    {record?.date
                                      ? new Date(
                                          record.date
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </td>
                                  <td>
                                    {formatRecurring(record?.recurrenceDays)}
                                  </td>
                                </tr>

                                {isExpanded && (
                                  <tr className="expanded-details">
                                    <td colSpan="9">
                                      <div className="expanded-content p-3">
                                        <div className="row">
                                          <div className="col-md-6">
                                            <h5>Journey Details</h5>
                                            <div className="mb-3">
                                              <strong>
                                                Transportation Mode:
                                              </strong>{" "}
                                              {formatTransportMode(
                                                record?.transportationMode
                                              )}
                                              {record?.vehicleType && (
                                                <span>
                                                  {" "}
                                                  (
                                                  {formatVehicleType(
                                                    record?.vehicleType
                                                  )}
                                                  )
                                                </span>
                                              )}
                                            </div>
                                            <div className="mb-3">
                                              <strong>Purpose:</strong>{" "}
                                              {formatPurpose(record?.usageType)}
                                            </div>
                                            <div className="mb-3">
                                              <strong>Date:</strong>{" "}
                                              {record?.date
                                                ? new Date(
                                                    record.date
                                                  ).toLocaleDateString()
                                                : "N/A"}
                                            </div>
                                            <div className="mb-3">
                                              <strong>Recurring:</strong>{" "}
                                              {formatRecurring(
                                                record?.recurrenceDays
                                              )}
                                            </div>
                                            <div className="mb-3">
                                              <strong>CO₂ Impact:</strong>{" "}
                                              {impact !== "N/A"
                                                ? `${impact} kg CO₂`
                                                : "N/A"}
                                            </div>
                                          </div>

                                          <div className="col-md-6">
                                            <h5>User Information</h5>
                                            <div className="mb-3">
                                              <strong>User:</strong> {userInfo}
                                            </div>
                                            <div className="mb-3">
                                              <strong>Employee ID:</strong>{" "}
                                              {record?.employeeId || "N/A"}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="row mt-4">
                                          <div className="col-md-6">
                                            <h5>Start Location</h5>
                                            <div className="mb-2">
                                              {record?.beginLocation || "N/A"}
                                            </div>
                                            <div className="map-container">
                                              <MapComponent
                                                location={{
                                                  lat:
                                                    parseFloat(
                                                      record?.beginLocationLat
                                                    ) || 0,
                                                  lon:
                                                    parseFloat(
                                                      record?.beginLocationLon
                                                    ) || 0,
                                                  address:
                                                    record?.beginLocation || "",
                                                }}
                                                height="150px"
                                                width="100%"
                                                showMarker={true}
                                                onLocationSelected={null}
                                                defaultZoom={15}
                                              />
                                            </div>
                                          </div>

                                          <div className="col-md-6">
                                            <h5>End Location</h5>
                                            <div className="mb-2">
                                              {record?.endLocation || "N/A"}
                                            </div>
                                            <div className="map-container">
                                              <MapComponent
                                                location={{
                                                  lat:
                                                    parseFloat(
                                                      record?.endLocationLat
                                                    ) || 0,
                                                  lon:
                                                    parseFloat(
                                                      record?.endLocationLon
                                                    ) || 0,
                                                  address:
                                                    record?.endLocation || "",
                                                }}
                                                height="150px"
                                                width="100%"
                                                showMarker={true}
                                                onLocationSelected={null}
                                                defaultZoom={15}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="9" className="text-center">
                              No records found.
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

                  <style jsx="true">{`
                    .expanded-row {
                      background-color: rgba(0, 123, 255, 0.05) !important;
                    }
                    .expanded-details {
                      background-color: rgba(0, 123, 255, 0.05) !important;
                    }
                    .expanded-content {
                      padding: 15px;
                      border-top: 1px dashed #dee2e6;
                    }
                    .map-container {
                      border-radius: 8px;
                      overflow: hidden;
                      border: 1px solid #dee2e6;
                      height: 150px;
                      width: 100%;
                    }
                  `}</style>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminTransport;
