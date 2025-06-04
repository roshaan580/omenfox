import React from "react";
import { Card, Button } from "react-bootstrap";
import { formatDecimal, isRecordEditable } from "../../../utils/dateUtils";

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
                <th>Start Location</th>
                <th>End Location</th>
                <th>Date</th>
                <th>Distance (km)</th>
                <th>CO₂ Used (kg)</th>
                <th>Employee</th>
                <th>Transportation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr key={record._id}>
                    <td>{index + 1}</td>
                    <td className="f10">
                      <div className="scrollable-address">
                        {record.startLocation.address}
                      </div>
                    </td>
                    <td className="f10">
                      <div className="scrollable-address">
                        {record.endLocation.address}
                      </div>
                    </td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{formatDecimal(record.distance)}</td>
                    <td>{record.co2Used}</td>
                    <td>
                      {record.employee?.firstName} {record.employee?.lastName}
                    </td>
                    <td>{record.transportation?.name || "N/A"}</td>
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
                  <td colSpan="9" className="text-center text-muted">
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
