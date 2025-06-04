import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const EditEmissionModal = ({
  showEditModal,
  closeEditModal,
  emissionRecord,
  handleInputChange,
  handleUpdateSubmit,
  emissionTypes,
  employeesState,
}) => {
  return (
    <Modal
      show={showEditModal}
      onHide={closeEditModal}
      className="custom-scrollbar"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Update Emission Record</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleUpdateSubmit}>
          <div className="row">
            <div className="col-md-6">
              <Form.Group controlId="emissionType" className="mb-3">
                <Form.Label>Emission Type</Form.Label>
                <Form.Select
                  value={emissionRecord.emissionType}
                  onChange={(e) => handleInputChange(e, "emissionType")}
                  required
                >
                  <option value="">Select Emission Type</option>
                  {emissionTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name} (GWP: {type.gwp})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group controlId="date" className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={emissionRecord.date}
                  onChange={(e) => handleInputChange(e, "date")}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group controlId="quantity" className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={emissionRecord.quantity}
                  onChange={(e) => handleInputChange(e, "quantity")}
                  placeholder="Enter quantity"
                  required
                />
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group controlId="co2Equivalent" className="mb-3">
                <Form.Label>CO₂ Equivalent (kg)</Form.Label>
                <Form.Control
                  type="number"
                  value={emissionRecord.co2Equivalent}
                  onChange={(e) => handleInputChange(e, "co2Equivalent")}
                  placeholder="Enter CO₂ equivalent"
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <Form.Group controlId="employee" className="mb-3">
                <Form.Label>Employee</Form.Label>
                <Form.Select
                  value={emissionRecord.employee}
                  onChange={(e) => handleInputChange(e, "employee")}
                  required
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

          <div className="d-flex justify-content-end">
            <Button
              variant="secondary"
              className="me-2"
              onClick={closeEditModal}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Record
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditEmissionModal;
