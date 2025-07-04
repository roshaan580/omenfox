import React from "react";
import TablePagination from "../../../components/TablePagination";
import usePagination from "../../../hooks/usePagination";
import { FaCopy, FaCheck } from "react-icons/fa";

/**
 * Table component for displaying vehicles
 */
const VehiclesTable = ({
  vehicles = [],
  onToggleFavorite,
  theme = "light",
}) => {
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

  const [copiedId, setCopiedId] = React.useState(null);

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
        <table className="table table-striped table-hover table-bordered mb-0">
          <thead>
            <tr>
              <th width="5%">#</th>
              <th>Vehicle Name</th>
              <th>License Plate</th>
              <th>Vehicle Type</th>
              <th>Engine Number</th>
              <th>Vehicle Use</th>
              <th>Vehicle Model</th>
              <th width="15%">Actions</th>
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
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      <button
                        className={`btn btn-sm btn-outline-secondary`}
                        onClick={async (e) => {
                          e.stopPropagation();
                          const toCopy = deepOmitFields(vehicle, [
                            "_id",
                            "createdAt",
                            "updatedAt",
                            "__v",
                          ]);
                          await navigator.clipboard.writeText(
                            JSON.stringify(toCopy, null, 2)
                          );
                          setCopiedId(vehicle._id);
                          setTimeout(() => setCopiedId(null), 1000);
                        }}
                        title={copiedId === vehicle._id ? "Copied!" : "Copy"}
                      >
                        {copiedId === vehicle._id ? <FaCheck /> : <FaCopy />}
                      </button>
                      <button
                        className={`btn w-100 p-2 ${
                          vehicle.isFavorite
                            ? "btn-warning"
                            : "btn-outline-success"
                        }`}
                        onClick={() => onToggleFavorite(vehicle._id, index)}
                      >
                        {vehicle.isFavorite
                          ? "★ Favorite"
                          : "☆ Mark as Favorite"}
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
    </>
  );
};

export default VehiclesTable;
