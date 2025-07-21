import React from "react";
import { Modal, Form, Tab, Tabs, Button } from "react-bootstrap";

const MobileCombustionModal = ({
  showAddModal,
  showEditModal,
  currentRecord,
  vehicles,
  fuelTypes,
  activeTab,
  handleTabChange,
  handleInputChange,
  calculateEmissions,
  handleSubmit,
  closeModals,
}) => {
  return (
    <Modal
      show={showAddModal || showEditModal}
      onHide={closeModals}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {showAddModal ? 'Add New' : 'Edit'} Mobile Combustion Record
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabChange}
            className="mb-3"
          >
            <Tab eventKey="vehicle-input" title="Vehicle-Based Input" className="bg-transparent p-0">
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={currentRecord.date}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Vehicle</Form.Label>
                    <Form.Select
                      name="vehicleId"
                      value={currentRecord.vehicleId ?? ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select vehicle...</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.name} ({vehicle.licensePlate})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Fuel Type *</Form.Label>
                    <Form.Select
                      name="fuelType"
                      value={currentRecord.fuelType ?? ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select fuel type...</option>
                      {fuelTypes.map(fuel => (
                        <option key={fuel.name} value={fuel.name}>
                          {fuel.name} ({fuel.factor} {fuel.unit})
                          {fuel.scope === 2 && ' - Scope 2'}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Distance (km) *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="distance"
                      value={currentRecord.distance ?? ""}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Emission Factor (kg CO₂/km) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.001"
                  name="emissionFactor"
                  value={currentRecord.emissionFactor ?? ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Tab>

            <Tab eventKey="direct-input" title="Direct Energy Input" className="bg-transparent">
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={currentRecord.date}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Fuel Type *</Form.Label>
                    <Form.Select
                      name="fuelType"
                      value={currentRecord.fuelType ?? ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select fuel type...</option>
                      {fuelTypes.map(fuel => (
                        <option key={fuel.name} value={fuel.name}>
                          {fuel.name} ({fuel.factor} {fuel.unit})
                          {fuel.scope === 2 && ' - Scope 2'}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Fuel Consumption (L or kWh) *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="fuelConsumption"
                      value={currentRecord.fuelConsumption ?? ""}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Emission Factor *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.001"
                      name="emissionFactor"
                      value={currentRecord.emissionFactor ?? ""}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
              </div>
            </Tab>
          </Tabs>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={currentRecord.description ?? ""}
              onChange={handleInputChange}
              placeholder="Describe the vehicle usage or trip details"
            />
          </Form.Group>

          <div className="alert alert-info">
            <strong>Calculated CO₂ Equivalent:</strong> {calculateEmissions().toFixed(2)} kg CO₂e
            {currentRecord.isElectric && (
              <div className="mt-2">
                <strong>Note:</strong> This electric vehicle will be classified as <strong>Scope 2</strong> emissions.
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModals}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {showAddModal ? 'Add Record' : 'Update Record'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MobileCombustionModal; 