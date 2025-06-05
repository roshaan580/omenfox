import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { IoMdClose } from "react-icons/io";

const EditEnergyEmissionModal = ({
  showEditModal,
  closeEditModal,
  emissionRecord,
  handleInputChange,
  handleEnergySourceChange,
  addEnergySource,
  removeEnergySource,
  handleUpdateSubmit,
  employeesState,
  formatDate,
}) => {
  return (
    <Modal
      className="custom-scrollbar"
      show={showEditModal}
      onHide={closeEditModal}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Update Energy Emission Record</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => handleUpdateSubmit(e, true)}>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={
                    formatDate
                      ? formatDate(emissionRecord.startDate)
                      : emissionRecord.startDate
                  }
                  onChange={(e) => handleInputChange(e, "startDate")}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={
                    formatDate
                      ? formatDate(emissionRecord.endDate)
                      : emissionRecord.endDate
                  }
                  onChange={(e) => handleInputChange(e, "endDate")}
                  required
                />
              </Form.Group>
            </div>
          </div>

          {/* Energy Sources */}
          <div className="mb-3">
            <label className="form-label">Energy Sources</label>
            {emissionRecord.energySources.map((source, index) => (
              <div key={index} className="d-flex align-items-center mb-2 gap-2">
                <div className="row flex-grow-1">
                  <div className="col-md-6 mb-2 mb-md-0">
                    <Form.Control
                      type="text"
                      placeholder="Energy Type (e.g., Electricity, Gas)"
                      value={source.type}
                      onChange={(e) =>
                        handleEnergySourceChange(e, index, "type")
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <Form.Control
                      type="number"
                      placeholder="CO₂ Emission (kg)"
                      value={source.emission}
                      onChange={(e) =>
                        handleEnergySourceChange(e, index, "emission")
                      }
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeEnergySource(index)}
                  disabled={emissionRecord.energySources.length <= 1}
                >
                  <IoMdClose />
                </Button>
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
                    value={emissionRecord.employee}
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
        <Button variant="secondary" onClick={closeEditModal}>
          Cancel
        </Button>
        <Button variant="success" onClick={(e) => handleUpdateSubmit(e, true)}>
          Update Record
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditEnergyEmissionModal;
