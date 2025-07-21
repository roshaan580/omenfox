import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import TablePagination from "../../../components/TablePagination";
import usePagination from "../../../hooks/usePagination";

const FreightTransportTable = ({
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
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        if (yearA !== yearB) return yearB - yearA;
        
        // If years are the same, compare months
        const monthIndexA = a.month ? new Date(Date.parse(`1 ${a.month} 2000`)).getMonth() : 0;
        const monthIndexB = b.month ? new Date(Date.parse(`1 ${b.month} 2000`)).getMonth() : 0;
        return monthIndexB - monthIndexA;
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
    <div className={`card bg-${theme} m-0 shadow-sm`}>
      <div className="card-body">
        <h5 className="card-title">Freight Transport Records</h5>
        
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
                  <th>Month/Year</th>
                  <th>Transport Mode</th>
                  <th>Distance (km)</th>
                  <th>Weight (tons)</th>
                  <th>Emission Factor</th>
                  <th>Total Emissions (kg CO₂e)</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((record, index) => (
                    <tr key={record._id || index}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{record.month} {record.year}</td>
                      <td>{record.transportMode}</td>
                      <td>{record.distance}</td>
                      <td>{record.weight}</td>
                      <td>{record.emissionFactor} kg CO₂e/ton-km</td>
                      <td>
                        <span className="badge bg-success">
                          {record.totalEmissions?.toFixed(2) || 'N/A'}
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
                      No freight transport records found. 
                      <br />
                      <small>Add records for third-party logistics and freight services.</small>
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

export default FreightTransportTable; 