import React from "react";
import { Card, Button } from "react-bootstrap";
import { formatDecimal } from "../../../utils/dateUtils";
import { isRecordEditable } from "../../../utils/dateUtils";
import { useNavigate } from "react-router-dom";
import TablePagination from "../../../components/TablePagination";
import usePagination from "../../../hooks/usePagination";

const EmissionsTable = ({
  theme,
  filteredRecords,
  handleEdit,
  confirmDelete,
}) => {
  const navigate = useNavigate();

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
  } = usePagination(filteredRecords);

  // Helper function to get formatted employee name
  const getEmployeeName = (record) => {
    if (record.transportRecord) {
      return "Transport User";
    }
    if (record.energyEmission) {
      return record.employee?.firstName
        ? `${record.employee.firstName} ${record.employee.lastName}`
        : "Energy User";
    }
    return record.employee?.firstName
      ? `${record.employee.firstName} ${record.employee.lastName}`
      : "Unknown";
  };

  // Helper function to get emission source
  const getEmissionSource = (record) => {
    if (record.transportEmission) {
      return "Transport";
    }
    if (record.energyEmission) {
      return "Energy";
    }
    if (record.transportRecord) {
      return record.emissionType?.name || "Transport";
    }
    return record.emissionType?.name || "Unknown";
  };

  // Function to format date consistently
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    return date.toLocaleDateString();
  };

  // Function to navigate to the specific module
  const navigateTo = (record) => {
    if (record.transportEmission) {
      navigate("/transport-emissions");
    } else if (record.energyEmission) {
      navigate("/energy-emissions");
    } else if (record.transportRecord) {
      navigate("/transport-emissions");
    }
  };

  return (
    <Card className={`bg-${theme} shadow-sm m-0`}>
      <Card.Body>
        <Card.Title className="mb-3">All Emission Records</Card.Title>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Emission Type</th>
                <th>Source</th>
                <th>CO₂ Equivalent (kg)</th>
                <th>Employee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map((record, index) => (
                  <tr key={record._id || `emission-${index}`}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{formatDate(record.date)}</td>
                    <td>{getEmissionSource(record)}</td>
                    <td>
                      {record.transportEmission
                        ? "Transport Travel"
                        : record.energyEmission
                        ? "Energy Consumption"
                        : record.transportRecord
                        ? "Transport Shipping"
                        : record.quantity
                        ? `${formatDecimal(record.quantity)} units`
                        : "General"}
                    </td>
                    <td>{formatDecimal(record.co2Equivalent)}</td>
                    <td>{getEmployeeName(record)}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        {record.transportEmission ||
                        record.energyEmission ||
                        record.transportRecord ? (
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => navigateTo(record)}
                            title="Go to specific module"
                          >
                            <i className="fas fa-external-link-alt"></i> View
                            Details
                          </Button>
                        ) : isRecordEditable(record) ? (
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
                  <td colSpan="7" className="text-center text-muted">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {filteredRecords.length > 0 && (
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

export default EmissionsTable;
