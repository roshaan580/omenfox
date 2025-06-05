import React from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import Select from "react-select";

const FilterPanel = ({
  showFilters,
  filters,
  setFilters,
  theme,
  employeesState,
  applyFilters,
  resetFilters,
}) => {
  // Convert employees to options format for react-select
  const employeeOptions = employeesState.map((employee) => ({
    value: employee._id,
    label: `${employee.firstName} ${employee.lastName}`,
  }));

  // List of common energy types for dropdown
  const energyTypeOptions = [
    { value: "Electricity", label: "Electricity" },
    { value: "Natural Gas", label: "Natural Gas" },
    { value: "Heating Oil", label: "Heating Oil" },
    { value: "Coal", label: "Coal" },
    { value: "Propane", label: "Propane" },
    { value: "Diesel", label: "Diesel" },
    { value: "Renewable", label: "Renewable" },
    { value: "Other", label: "Other" },
  ];

  // Customize select styles based on theme
  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: theme === "dark" ? "#343a40" : "white",
      borderColor: theme === "dark" ? "#6c757d" : "#ced4da",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: theme === "dark" ? "#343a40" : "white",
      zIndex: 9999,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected
        ? theme === "dark"
          ? "#0d6efd"
          : "#0d6efd"
        : isFocused
        ? theme === "dark"
          ? "#495057"
          : "#f8f9fa"
        : theme === "dark"
        ? "#343a40"
        : "white",
      color: isSelected ? "white" : theme === "dark" ? "#f8f9fa" : "#212529",
    }),
    singleValue: (base) => ({
      ...base,
      color: theme === "dark" ? "#f8f9fa" : "#212529",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: theme === "dark" ? "#495057" : "#e9ecef",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: theme === "dark" ? "#f8f9fa" : "#212529",
    }),
    input: (base) => ({
      ...base,
      color: theme === "dark" ? "#f8f9fa" : "#212529",
    }),
  };

  // Reset filter function
  const handleResetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      employees: [],
      energyTypes: [],
    });
    resetFilters();
  };

  return (
    <Card
      className={`bg-${theme} shadow-sm mb-4 ${!showFilters ? "d-none" : ""}`}
    >
      <Card.Body>
        <Card.Title className="mb-3">Filter Energy Emissions</Card.Title>
        <Row>
          <Col md={6} lg={3} className="mb-3">
            <Form.Group controlId="startDate">
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
          <Col md={6} lg={3} className="mb-3">
            <Form.Group controlId="endDate">
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
          <Col md={6} lg={3} className="mb-3">
            <Form.Group controlId="employees">
              <Form.Label>Employees</Form.Label>
              <Select
                isMulti
                options={employeeOptions}
                value={filters.employees}
                onChange={(selected) =>
                  setFilters({ ...filters, employees: selected || [] })
                }
                placeholder="Select employees..."
                styles={selectStyles}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </Form.Group>
          </Col>
          <Col md={6} lg={3} className="mb-3">
            <Form.Group controlId="energyTypes">
              <Form.Label>Energy Types</Form.Label>
              <Select
                isMulti
                options={energyTypeOptions}
                value={filters.energyTypes}
                onChange={(selected) =>
                  setFilters({ ...filters, energyTypes: selected || [] })
                }
                placeholder="Select energy types..."
                styles={selectStyles}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={handleResetFilters}>
            Reset Filters
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
