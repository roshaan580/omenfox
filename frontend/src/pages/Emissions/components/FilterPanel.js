import React from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import EmployeeSelect from "../../../components/EmployeeSelect";
import DynamicSelect from "../../../components/DynamicSelect";

const FilterPanel = ({
  showFilters,
  filters,
  setFilters,
  theme,
  employeesState,
  emissionTypes,
  applyFilters,
  emissionRecords,
  setFilteredRecords,
}) => {
  if (!showFilters) return null;

  return (
    <Card className={`bg-${theme} mb-4 m-0 z-3 position-relative`}>
      <Card.Body>
        <Card.Title className="mb-3">Filter Records</Card.Title>
        <Row>
          <Col xl={3} md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </Form.Group>
          </Col>
          <Col xl={3} md={6}>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </Form.Group>
          </Col>
          <Col xl={3} md={6}>
            <EmployeeSelect
              modalData={{ employees: filters.employees }}
              employeesState={employeesState}
              handleEmployeeChange={(selectedOptions) => {
                setFilters({
                  ...filters,
                  employees: selectedOptions,
                });
              }}
              theme={theme}
            />
          </Col>
          <Col xl={3} md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Emission Type</Form.Label>
              <DynamicSelect
                modalData={{ emissionTypes: filters.emissionTypes }}
                stateData={emissionTypes}
                handleChange={(selectedOptions) => {
                  setFilters({
                    ...filters,
                    emissionTypes: selectedOptions,
                  });
                }}
                formatData={(type) => ({
                  value: type._id,
                  label: type.name,
                  key: type._id,
                })}
                isMulti={true}
                id="emissionTypeFilter"
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex justify-content-end">
          <Button
            variant="secondary"
            className="me-2"
            onClick={() => {
              setFilters({
                startDate: "",
                endDate: "",
                employees: [],
                emissionTypes: [],
              });
              setFilteredRecords(emissionRecords);
            }}
          >
            Reset
          </Button>
          <Button variant="primary" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FilterPanel;
