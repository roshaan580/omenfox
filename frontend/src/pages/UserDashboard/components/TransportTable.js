import React, { useState, useEffect } from "react";
import MapComponent from "../../../components/MapComponent";
import TablePagination from "../../../components/TablePagination";
import usePagination from "../../../hooks/usePagination";
import { FaCopy, FaCheck } from "react-icons/fa";

/**
 * Table component for displaying transportation records
 */
const TransportTable = ({ records = [], theme = "light" }) => {
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [sortedRecords, setSortedRecords] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // Sort records by date (newest first)
  useEffect(() => {
    if (records && records.length > 0) {
      const sorted = [...records].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA; // Sort descending (newest first)
      });
      setSortedRecords(sorted);
    } else {
      setSortedRecords([]);
    }
  }, [records]);

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

  // Calculate distance between two points (using Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    return distance.toFixed(2);
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Format recurring days
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

  // Calculate total CO2 impact
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

    // If recurring, multiply by recurrence days
    if (record.recurrenceDays) {
      // Assuming recurrenceDays is per week, multiply by 52 weeks for annual impact
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

  // Toggle expanded view for a record
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
    <>
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-striped table-hover mb-0">
          <thead>
            <tr>
              <th scope="col" width="3%"></th>
              <th scope="col" width="4%">
                #
              </th>
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
              paginatedItems?.map((record, index) => {
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
                        <div className="d-flex align-items-center">
                          <i
                            className={`fas fa-${
                              record?.transportationMode === "car"
                                ? "car"
                                : record?.transportationMode === "bike"
                                ? "bicycle"
                                : record?.transportationMode === "walking"
                                ? "walking"
                                : record?.transportationMode ===
                                  "public_transport"
                                ? "bus"
                                : record?.transportationMode === "plane"
                                ? "plane"
                                : "question"
                            } me-2`}
                          ></i>
                          {formatTransportMode(record?.transportationMode)}
                          {record?.vehicleType && (
                            <span className="badge bg-info ms-2">
                              {formatVehicleType(record?.vehicleType)}
                            </span>
                          )}
                        </div>
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
                          <span className="text-muted">Not calculated</span>
                        )}
                      </td>
                      <td>{new Date(record?.date).toLocaleDateString()}</td>
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
                            title={copiedId === record._id ? "Copied!" : "Copy"}
                          >
                            {copiedId === record._id ? <FaCheck /> : <FaCopy />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="expanded-details">
                        <td colSpan="8">
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
                                      ({formatVehicleType(record?.vehicleType)})
                                    </span>
                                  )}
                                </div>
                                <div className="mb-3">
                                  <strong>Purpose:</strong>{" "}
                                  {formatPurpose(record?.usageType)}
                                </div>
                                <div className="mb-3">
                                  <strong>Date:</strong>{" "}
                                  {new Date(record?.date).toLocaleDateString()}
                                </div>
                                <div className="mb-3">
                                  <strong>Recurring:</strong>{" "}
                                  {formatRecurring(record?.recurrenceDays)}
                                </div>
                                {record?.workFromHomeDays && (
                                  <div className="mb-3">
                                    <strong>Work from Home Days:</strong>{" "}
                                    {record.workFromHomeDays} days/week
                                  </div>
                                )}
                                <div className="mb-3">
                                  <strong>CO₂ Emission Rate:</strong>{" "}
                                  {record?.co2Emission} kg/km
                                </div>
                                {distance && (
                                  <div className="mb-3">
                                    <strong>Distance:</strong> {distance} km
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
                                          address: record?.beginLocation || "",
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
                                          address: record?.endLocation || "",
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
                <td colSpan="8" className="text-center">
                  No records found.
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
    </>
  );
};

export default TransportTable;
