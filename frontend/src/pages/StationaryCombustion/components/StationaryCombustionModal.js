import React from "react";
import { Modal, Form, Tab, Tabs, Button } from "react-bootstrap";

const StationaryCombustionModal = ({
  showAddModal,
  showEditModal,
  activeTab,
  currentRecord,
  combustionFuels,
  fugitiveGases,
  handleInputChange,
  calculateEmissions,
  handleSubmit,
  closeModals,
  setActiveTab
}) => {
  return (
    <Modal 
      show={showAddModal || showEditModal} 
      onHide={closeModals} 
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {showAddModal ? 'Add New' : 'Edit'} Stationary Combustion Record
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="combustion" title="Combustion Emissions" className="bg-transparent">
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={currentRecord.date ?? ""}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Fuel Type</Form.Label>
                    <Form.Select
                      name="fuelType"
                      value={currentRecord.fuelType ?? ""}
                      onChange={(e) => {
                        handleInputChange({
                          ...e,
                          target: {
                            ...e.target,
                            type: e.target.type,
                            name: e.target.name,
                            value: e.target.value
                          }
                        });
                      }}
                    >
                      <option value="">Select fuel type...</option>
                      {combustionFuels.map(fuel => (
                        <option key={fuel.name} value={fuel.name}>
                          {fuel.name} ({fuel.energyContent} GJ, {fuel.emissionFactor} kg CO₂e/GJ)
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Activity Data (Volume/Amount)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="activityData"
                      value={currentRecord.activityData ?? ""}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Energy Content (GJ)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="energyContent"
                      value={currentRecord.energyContent ?? ""}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Emission Factor (kg CO₂e/GJ)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="emissionFactor"
                      value={currentRecord.emissionFactor ?? ""}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
              </div>
            </Tab>

            <Tab eventKey="fugitive" title="Fugitive Emissions" className="bg-transparent">
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={currentRecord.date ?? ""}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Gas Type</Form.Label>
                    <Form.Select
                      name="fuelType"
                      value={currentRecord.fuelType ?? ""}
                      onChange={(e) => {
                        handleInputChange({
                          ...e,
                          target: {
                            ...e.target,
                            type: e.target.type,
                            name: e.target.name,
                            value: e.target.value
                          }
                        });
                      }}
                    >
                      <option value="">Select gas type...</option>
                      {fugitiveGases.map(gas => (
                        <option key={gas.name} value={gas.name}>
                          {gas.name} (GWP: {gas.gwp})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Activity Data (kg of gas released)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.001"
                      name="activityData"
                      value={currentRecord.activityData ?? ""}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Global Warming Potential (GWP)</Form.Label>
                    <Form.Control
                      type="number"
                      name="gwp"
                      value={currentRecord.gwp ?? ""}
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
              placeholder="Describe the emission source or incident"
            />
          </Form.Group>

          <div className="alert alert-info">
            <strong>Calculated CO₂ Equivalent:</strong> {calculateEmissions().toFixed(2)} kg CO₂e
            <div className="mt-2">
              <strong>Scope:</strong> Scope 1 (Direct emissions)
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

export default StationaryCombustionModal; 