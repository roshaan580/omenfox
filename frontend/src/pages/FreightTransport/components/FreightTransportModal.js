import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

const FreightTransportModal = ({
  showAddModal,
  showEditModal,
  currentRecord,
  transportModes,
  months,
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
          {showAddModal ? 'Add New' : 'Edit'} Freight Transport Record
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Month</Form.Label>
                <Form.Select
                  name="month"
                  value={currentRecord.month}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select month...</option>
                  {months.map(month => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="number"
                  name="year"
                  value={currentRecord.year}
                  onChange={handleInputChange}
                  min="2020"
                  max="2030"
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Transport Mode</Form.Label>
            <Form.Select
              name="transportMode"
              value={currentRecord.transportMode}
              onChange={handleInputChange}
              required
            >
              <option value="">Select transport mode...</option>
              {transportModes.map(mode => (
                <option key={mode.name} value={mode.name}>
                  {mode.name} ({mode.factor} kg CO₂e/ton-km) - {mode.description}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="row">
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Distance (km)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="distance"
                  value={currentRecord.distance}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Weight (tons)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="weight"
                  value={currentRecord.weight}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Emission Factor (kg CO₂e/ton-km)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.001"
                  name="emissionFactor"
                  value={currentRecord.emissionFactor}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={currentRecord.description}
              onChange={handleInputChange}
              placeholder="Describe the freight transport (e.g., supplier, route, cargo type)"
            />
          </Form.Group>

          <div className="alert alert-info">
            <strong>Calculated Total Emissions:</strong> {calculateEmissions().toFixed(2)} kg CO₂e
            <div className="mt-2">
              <strong>Scope:</strong> Scope 3 (Third-party freight transport)
            </div>
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

export default FreightTransportModal; 