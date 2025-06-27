import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { formatDecimal, isRecordEditable } from "../../../utils/dateUtils";
import TablePagination from "../../../components/TablePagination";
import usePagination from "../../../hooks/usePagination";
import { FaCopy, FaCheck } from "react-icons/fa";

const EnergyEmissionsTable = ({
  theme,
  filteredRecords,
  handleEdit,
  confirmDelete,
}) => {
  const [sortedRecords, setSortedRecords] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // Sort records by date (latest first)
  useEffect(() => {
    if (filteredRecords && filteredRecords.length > 0) {
      const sorted = [...filteredRecords].sort((a, b) => {
        const dateA = new Date(a.startDate || a.date || 0);
        const dateB = new Date(b.startDate || b.date || 0);
        return dateB - dateA; // Sort descending (newest first)
      });
      setSortedRecords(sorted);
    } else {
      setSortedRecords([]);
    }
  }, [filteredRecords]);

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

  // Calculate total emissions for a record
  const calculateTotalEmissions = (record) => {
    if (!record.energySources || !Array.isArray(record.energySources)) {
      return 0;
    }

    return record.energySources.reduce((total, source) => {
      return total + parseFloat(source.emission || 0);
    }, 0);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className={`bg-${theme} shadow-sm m-0`}>
      <Card.Body>
        <Card.Title className="mb-3">Energy Emission Records</Card.Title>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Energy Sources</th>
                <th>Total CO₂ (kg)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map((record, index) => (
                  <tr key={record._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{formatDate(record.startDate)}</td>
                    <td>{formatDate(record.endDate)}</td>
                    <td>
                      <ul className="list-unstyled mb-0">
                        {record.energySources &&
                          Array.isArray(record.energySources) &&
                          record.energySources.map((source, idx) => (
                            <li key={idx}>
                              {source.type}: {formatDecimal(source.emission)} kg
                            </li>
                          ))}
                      </ul>
                    </td>
                    <td>{formatDecimal(calculateTotalEmissions(record))}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center align-items-center">
                        {isRecordEditable(record, "startDate") && (
                          <>
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
                              onClick={() => confirmDelete(record)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          style={{ minWidth: "30px" }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            await navigator.clipboard.writeText(
                              JSON.stringify(record, null, 2)
                            );
                            setCopiedId(record._id);
                            setTimeout(() => setCopiedId(null), 1000);
                          }}
                          title={copiedId === record._id ? "Copied!" : "Copy"}
                        >
                          {copiedId === record._id ? <FaCheck /> : <FaCopy />}
                        </Button>
                        {!isRecordEditable(record, "startDate") && (
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
                  <td colSpan="6" className="text-center text-muted">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
      </Card.Body>
    </Card>
  );
};

export default EnergyEmissionsTable;
