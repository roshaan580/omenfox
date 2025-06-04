import React from "react";
import { Card, Button } from "react-bootstrap";
import { formatDecimal } from "../../../utils/dateUtils";
import { isRecordEditable } from "../../../utils/dateUtils";

const EmissionsTable = ({
  theme,
  filteredRecords,
  handleEdit,
  confirmDelete,
}) => {
  return (
    <Card className={`bg-${theme} shadow-sm m-0`}>
      <Card.Body>
        <Card.Title className="mb-3">Emission Records</Card.Title>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Emission Type</th>
                <th>Quantity</th>
                <th>CO₂ Equivalent (kg)</th>
                <th>Employee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr key={record._id}>
                    <td>{index + 1}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.emissionType?.name || "N/A"}</td>
                    <td>{formatDecimal(record.quantity)}</td>
                    <td>{formatDecimal(record.co2Equivalent)}</td>
                    <td>
                      {record.employee?.firstName} {record.employee?.lastName}
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        {isRecordEditable(record) ? (
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
      </Card.Body>
    </Card>
  );
};

export default EmissionsTable;
