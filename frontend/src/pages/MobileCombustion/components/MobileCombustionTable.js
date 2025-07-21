import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import TablePagination from "../../../components/TablePagination";
import usePagination from "../../../hooks/usePagination";

const MobileCombustionTable = ({
  records,
  loading,
  theme,
  handleEdit,
  handleDelete,
  getScopeColor,
  getScopeLabel
}) => {
  const [sortedRecords, setSortedRecords] = useState([]);

  // Sort records by date (latest first)
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

  return (
    <div className={`card bg-${theme} m-0 p-md-3 shadow-sm`}>
      <div className="card-body">
        <h5 className="card-title">Mobile Combustion Records</h5>
        
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Vehicle/Equipment</th>
                  <th>Fuel Type</th>
                  <th>Distance/Consumption</th>
                  <th>CO₂ Equivalent (kg)</th>
                  <th>Scope</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((record, index) => (
                    <tr key={record._id || index}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.vehicleId?.name || record.vehicle?.name || 'Direct Input'}</td>
                      <td>{record.fuelType}</td>
                      <td>
                        {record.distance ? `${record.distance} km` : 
                         record.fuelConsumption ? `${record.fuelConsumption} L` : 'N/A'}
                      </td>
                      <td>{record.co2Equivalent?.toFixed(2) || 'N/A'}</td>
                      <td>
                        <span className={`badge bg-${getScopeColor(record)}`}>
                          {getScopeLabel(record)}
                        </span>
                      </td>
                      <td>{record.description}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(record)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(record._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">
                      No mobile combustion records found. 
                      <br />
                      <small>Add records for company vehicles and mobile equipment.</small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination component */}
        {sortedRecords.length > 0 && (
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
      </div>
    </div>
  );
};

export default MobileCombustionTable; 