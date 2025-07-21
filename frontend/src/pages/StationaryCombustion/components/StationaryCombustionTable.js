import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import TablePagination from "../../../components/TablePagination";
import usePagination from "../../../hooks/usePagination";

const StationaryCombustionTable = ({
  records,
  loading,
  theme,
  handleEdit,
  handleDelete
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
        <h5 className="card-title">Stationary Combustion Records</h5>
        
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
                  <th>Type</th>
                  <th>Fuel/Gas Type</th>
                  <th>Activity Data</th>
                  <th>Energy Content/GWP</th>
                  <th>CO₂ Equivalent (kg)</th>
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
                      <td>
                        <span className={`badge bg-${record.type === 'combustion' ? 'danger' : 'warning'}`}>
                          {record.type === 'combustion' ? 'Combustion' : 'Fugitive'}
                        </span>
                      </td>
                      <td>{record.fuelType}</td>
                      <td>{record.activityData}</td>
                      <td>
                        {record.type === 'combustion' 
                          ? `${record.energyContent} GJ` 
                          : `GWP: ${record.gwp}`}
                      </td>
                      <td>{record.co2Equivalent?.toFixed(2) || 'N/A'}</td>
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
                      No stationary combustion records found. 
                      <br />
                      <small>Add records for boilers, generators, and fugitive emissions.</small>
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

export default StationaryCombustionTable; 