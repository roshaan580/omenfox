import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import LocationPicker from "../../../components/LocationPicker";
import DynamicSelect from "../../../components/DynamicSelect";

const AddTransportEmissionModal = ({
  showAddModal,
  closeAddModal,
  emissionRecord,
  handleInputChange,
  handleStartLocationChange,
  handleEndLocationChange,
  handleAddSubmit,
  employeesState,
  carsState,
  setEmissionRecord,
}) => {
  return (
    <Modal
      show={showAddModal}
      onHide={closeAddModal}
      className="custom-scrollbar"
      size="lg"
      onEntered={() => {
        console.log("Add modal fully shown - triggering map refresh");
        // Trigger a window resize event to force the map to render correctly
        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, 100);
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>Add New Emission Record</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleAddSubmit}>
          <Form.Group controlId="startLocation" className="mb-4">
            <LocationPicker
              label="Start Location"
              value={emissionRecord.startLocation}
              onChange={handleStartLocationChange}
              required
              mapHeight="200px"
              placeholder="Enter or select start location"
            />
          </Form.Group>

          <Form.Group controlId="endLocation" className="mb-4">
            <LocationPicker
              label="End Location"
              value={emissionRecord.endLocation}
              onChange={handleEndLocationChange}
              required
              mapHeight="200px"
              placeholder="Enter or select end location"
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-4">
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

            <div className="col-md-4">
              <Form.Group controlId="distance" className="mb-3">
                <Form.Label>Distance (km)</Form.Label>
                <Form.Control
                  type="number"
                  disabled
                  value={emissionRecord.distance}
                  placeholder="Calculated automatically"
                />
                <small className="text-muted">
                  Calculated automatically from locations
                </small>
              </Form.Group>
            </div>

            <div className="col-md-4">
              <Form.Group controlId="licensePlate" className="mb-3">
                <Form.Label>License Plate</Form.Label>
                <Form.Control
                  type="text"
                  value={emissionRecord.licensePlate || ""}
                  onChange={(e) => handleInputChange(e, "licensePlate")}
                  placeholder="Enter license plate (e.g. JJ447K)"
                />
                <small className="text-muted">
                  Enter a Dutch license plate to auto-fill CO₂ emissions if
                  available.
                </small>
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <Form.Group controlId="co2Used" className="mb-3">
                <Form.Label>CO2 Used (kg)</Form.Label>
                <Form.Control
                  type="number"
                  value={emissionRecord.co2Used}
                  onChange={(e) => handleInputChange(e, "co2Used")}
                  placeholder="Enter CO2 used"
                  required
                />
                {emissionRecord.licensePlate && emissionRecord.co2Used && (
                  <small className="text-success">
                    Auto-filled from license plate lookup. You can override this
                    value.
                  </small>
                )}
              </Form.Group>
            </div>

            <div className="col-md-4">
              <Form.Group controlId="employee" className="mb-3">
                <DynamicSelect
                  label="Employee"
                  id="employee"
                  className="form-select"
                  modalData={emissionRecord}
                  stateData={employeesState}
                  handleChange={(selected) =>
                    setEmissionRecord({
                      ...emissionRecord,
                      employee: selected ? selected.value : "",
                    })
                  }
                  formatData={(employee) => ({
                    value: employee._id,
                    label: `${employee.firstName} ${employee.lastName}`,
                    key: employee._id,
                  })}
                  isMulti={false}
                />
              </Form.Group>
            </div>

            <div className="col-md-4">
              <Form.Group controlId="transportation" className="mb-3">
                <DynamicSelect
                  label="Transportation"
                  id="transportation"
                  modalData={emissionRecord}
                  stateData={carsState}
                  handleChange={(selected) =>
                    setEmissionRecord({
                      ...emissionRecord,
                      transportation: selected ? selected.value : "",
                    })
                  }
                  formatData={(car) => ({
                    value: car._id,
                    label: `${car.name}`,
                    key: car._id,
                  })}
                  isMulti={false}
                />
              </Form.Group>
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <Button
              variant="secondary"
              className="me-2"
              onClick={closeAddModal}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Record
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddTransportEmissionModal;
