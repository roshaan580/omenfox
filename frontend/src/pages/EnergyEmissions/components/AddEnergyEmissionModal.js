import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { IoMdClose } from "react-icons/io";

const AddEnergyEmissionModal = ({
  showAddModal,
  closeAddModal,
  emissionRecord,
  handleInputChange,
  handleEnergySourceChange,
  addEnergySource,
  removeEnergySource,
  handleAddSubmit,
  employeesState,
}) => {
  // Ensure we have a safe version of energySources to map over
  const energySources = Array.isArray(emissionRecord?.energySources) 
    ? emissionRecord.energySources 
    : [{ type: "", emission: "0" }];

  return (
    <Modal
      className="custom-scrollbar"
      show={showAddModal}
      onHide={closeAddModal}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Add New Energy Emission Record</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleAddSubmit}>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={emissionRecord?.startDate || ""}
                  onChange={(e) => handleInputChange(e, "startDate")}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={emissionRecord?.endDate || ""}
                  onChange={(e) => handleInputChange(e, "endDate")}
                />
              </Form.Group>
            </div>
          </div>

          {/* Energy Sources */}
          <div className="mb-3">
            <label className="form-label">Energy Sources</label>
            {energySources.map((source, index) => (
              <div key={index} className="d-flex align-items-center mb-2 gap-2">
                <div className="row flex-grow-1">
                  <div className="col-md-6 mb-2 mb-md-0">
                    <Form.Control
                      type="text"
                      placeholder="Energy Type (e.g., Electricity, Gas)"
                      value={source?.type || ""}
                      onChange={(e) =>
                        handleEnergySourceChange(e, index, "type")
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <Form.Control
                      type="number"
                      placeholder="CO₂ Emission (kg)"
                      value={source?.emission || "0"}
                      onChange={(e) =>
                        handleEnergySourceChange(e, index, "emission")
                      }
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                {index > 0 && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeEnergySource(index)}
                  >
                    <IoMdClose />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline-primary"
              className="mt-2"
              onClick={addEnergySource}
              type="button"
            >
              + Add Another Energy Source
            </Button>
          </div>

          {/* Employees - if needed */}
          {employeesState && employeesState.length > 0 && (
            <div className="row">
              <div className="col-md-12">
                <Form.Group className="mb-3">
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    value={emissionRecord?.employee || ""}
                    onChange={(e) => handleInputChange(e, "employee")}
                  >
                    <option value="">Select Employee</option>
                    {employeesState.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeAddModal}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleAddSubmit}>
          Save Record
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddEnergyEmissionModal;
