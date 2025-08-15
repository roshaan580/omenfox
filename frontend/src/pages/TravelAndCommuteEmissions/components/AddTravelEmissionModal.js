import React, { useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import LocationPicker from "../../../components/LocationPicker";
import DynamicSelect from "../../../components/DynamicSelect";

const AddTravelEmissionModal = ({
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
  // Filter out company vehicles - only show personal vehicles in dropdown
  const filteredCars = useMemo(() => {
    return carsState.filter(car => car.vehicleUseFor !== "Company");
  }, [carsState]);

  return (
    <Modal
      show={showAddModal}
      onHide={closeAddModal}
      className="custom-scrollbar"
      size="lg"
      onEntered={() => {
        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, 100);
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>Add New Travel & Commute Record</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleAddSubmit}>
          <div className="alert alert-info mb-3">
            <i className="fas fa-info-circle me-2"></i>
            This section is for personal and public transportation only. Company vehicle emissions should be tracked under Mobile Combustion.
          </div>

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
                  label="Transportation (Personal Only)"
                  id="transportation"
                  modalData={emissionRecord}
                  stateData={filteredCars}
                  handleChange={(selected) =>
                    setEmissionRecord({
                      ...emissionRecord,
                      transportation: selected ? selected.value : "",
                    })
                  }
                  formatData={(car) => ({
                    value: car._id,
                    label: `${car.name}${car.vehicleUseFor ? ` (${car.vehicleUseFor})` : ''}`,
                    key: car._id,
                  })}
                  isMulti={false}
                />
                <small className="text-muted">
                  Only personal vehicles are shown. Company vehicles should be recorded under Mobile Combustion.
                </small>
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

export default AddTravelEmissionModal;
