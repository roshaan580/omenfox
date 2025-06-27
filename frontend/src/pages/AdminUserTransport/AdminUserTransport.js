import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../../config";
import Sidebar from "../../components/Sidebar";
import TablePagination from "../../components/TablePagination";
import usePagination from "../../hooks/usePagination";
import MapComponent from "../../components/MapComponent";
import { FaCopy, FaCheck } from "react-icons/fa";

const AdminUserTransport = () => {
  const [transportData, setTransportData] = useState([]);
  const [sortedRecords, setSortedRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Sidebar state
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sort records by date (newest first)
  useEffect(() => {
    if (transportData && transportData.length > 0) {
      const sorted = [...transportData].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA; // Sort descending (newest first)
      });
      setSortedRecords(sorted);
    } else {
      setSortedRecords([]);
    }
  }, [transportData]);

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
          console.log("No token found, redirecting to login");
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
        console.log("Fetching admin user transport data...");

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
        console.log("Admin User Transport Data:", data);

        // Make sure we get the records from the correct property
        const records = data.data || data;

        setTransportData(records);
      } catch (error) {
        console.error("Error fetching user transport records:", error);
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

  // Helper functions for expandable row design
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
  const formatPurpose = (purpose) => {
    if (!purpose) return "Not specified";
    return purpose
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const formatVehicleType = (type) => {
    if (!type) return "Not specified";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2);
  };
  const deg2rad = (deg) => deg * (Math.PI / 180);
  const formatRecurring = (days) => {
    if (!days) return "No";
    const daysMap = {
      1: "Weekly (1 day)",
      2: "2 days/week",
      3: "3 days/week",
      4: "4 days/week",
      5: "Weekdays",
      7: "Daily",
    };
    return daysMap[days] || `${days} days/week`;
  };
  const calculateTotalImpact = (record) => {
    if (!record?.co2Emission) return null;
    const distance = calculateDistance(
      record.beginLocationLat,
      record.beginLocationLon,
      record.endLocationLat,
      record.endLocationLon
    );
    if (!distance) return null;
    const dailyEmission = parseFloat(record.co2Emission) * parseFloat(distance);
    if (record.recurrenceDays) {
      const annualEmission =
        dailyEmission * parseInt(record.recurrenceDays) * 52;
      return {
        daily: dailyEmission.toFixed(2),
        annual: annualEmission.toFixed(2),
      };
    }
    return {
      daily: dailyEmission.toFixed(2),
      annual: null,
    };
  };
  const toggleExpand = (id) => {
    if (expandedRecord === id) {
      setExpandedRecord(null);
    } else {
      setExpandedRecord(id);
    }
  };

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
        <div className="container py-5">
          {error && renderError()}

          <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
            <h4 className="text-left text-success mb-0">
              User Transport Records
            </h4>
          </div>

          {isLoading ? (
            renderLoading()
          ) : (
            <>
              <div className="table-responsive shadow-sm rounded">
                <table className="table table-striped table-hover mb-0">
                  <thead>
                    <tr>
                      <th scope="col" width="3%"></th>
                      <th scope="col" width="4%">
                        #
                      </th>
                      <th scope="col">User</th>
                      <th scope="col">Mode</th>
                      <th scope="col">Purpose</th>
                      <th scope="col">Distance</th>
                      <th scope="col">CO₂ Impact</th>
                      <th scope="col">Date</th>
                      <th scope="col">Recurring</th>
                      <th scope="col">Actions</th>
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
                              <td>
                                {record?.employeeId?.firstName || ""}{" "}
                                {record?.employeeId?.lastName || ""}
                              </td>
                              <td>
                                {formatTransportMode(
                                  record?.transportationMode
                                )}
                              </td>
                              <td>{formatPurpose(record?.usageType)}</td>
                              <td>
                                {distance ? (
                                  <span>{distance} km</span>
                                ) : (
                                  <span className="text-muted">Unknown</span>
                                )}
                              </td>
                              <td>
                                {impact?.daily ? (
                                  <div>
                                    <span
                                      className={
                                        parseFloat(impact.daily) === 0
                                          ? "text-success"
                                          : ""
                                      }
                                    >
                                      {parseFloat(impact.daily) === 0
                                        ? "Zero Emission"
                                        : `${impact.daily} kg CO₂`}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted">
                                    Not calculated
                                  </span>
                                )}
                              </td>
                              <td>
                                {new Date(record?.date).toLocaleDateString()}
                              </td>
                              <td>{formatRecurring(record?.recurrenceDays)}</td>
                              <td>
                                <div className="d-flex gap-2 justify-content-center">
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
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
                                      copiedId === record._id
                                        ? "Copied!"
                                        : "Copy"
                                    }
                                  >
                                    {copiedId === record._id ? (
                                      <FaCheck />
                                    ) : (
                                      <FaCopy />
                                    )}
                                  </button>
                                </div>
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
                                          <strong>Transportation Mode:</strong>{" "}
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
                                          {new Date(
                                            record?.date
                                          ).toLocaleDateString()}
                                        </div>
                                        <div className="mb-3">
                                          <strong>Recurring:</strong>{" "}
                                          {formatRecurring(
                                            record?.recurrenceDays
                                          )}
                                        </div>
                                        {record?.workFromHomeDays && (
                                          <div className="mb-3">
                                            <strong>
                                              Work from Home Days:
                                            </strong>{" "}
                                            {record.workFromHomeDays} days/week
                                          </div>
                                        )}
                                        <div className="mb-3">
                                          <strong>CO₂ Emission Rate:</strong>{" "}
                                          {record?.co2Emission} kg/km
                                        </div>
                                        {distance && (
                                          <div className="mb-3">
                                            <strong>Distance:</strong>{" "}
                                            {distance} km
                                          </div>
                                        )}
                                        {impact?.daily && (
                                          <div className="mb-3">
                                            <strong>Daily CO₂ Impact:</strong>{" "}
                                            {impact.daily} kg
                                          </div>
                                        )}
                                        {impact?.annual && (
                                          <div className="mb-3">
                                            <strong>Annual CO₂ Impact:</strong>{" "}
                                            {impact.annual} kg
                                          </div>
                                        )}
                                      </div>
                                      <div className="col-md-6">
                                        <div className="row">
                                          <div className="col-md-6">
                                            <h5>Begin Location</h5>
                                            <div className="mb-2">
                                              {record?.beginLocation}
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
                                              {record?.endLocation}
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
                        <td colSpan="9" className="text-center text-muted">
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination component */}
              {totalItems > 0 && (
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
              )}
            </>
          )}
        </div>
      </div>
      <style jsx="true">{`
        .location-cell {
          min-width: 300px;
          padding: 10px;
        }
        .map-container {
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #dee2e6;
          height: 150px;
          width: 100%;
        }
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
        }
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
      `}</style>
    </div>
  );
};

export default AdminUserTransport;
