import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { formatDecimal } from "../../../utils/dateUtils";

const AnalyticsCards = ({ theme, totalEmissions, filteredRecords }) => {
  return (
    <Row className="mb-4">
      <Col lg={3} md={6} className="mb-3 mb-lg-0">
        <Card className={`bg-${theme} m-0 shadow-sm h-100`}>
          <Card.Body className="d-flex flex-column align-items-center">
            <div className="icon-container mb-3 text-primary">
              <i className="fas fa-cloud fa-3x"></i>
            </div>
            <Card.Title className="text-center mb-3">
              Total CO₂ Emissions
            </Card.Title>
            <h3 className="text-center mb-0">
              {formatDecimal(totalEmissions)} kg
            </h3>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3 mb-lg-0">
        <Card className={`bg-${theme} m-0 p-md-3 shadow-sm h-100`}>
          <Card.Body className="d-flex flex-column align-items-center">
            <div className="icon-container mb-3 text-success">
              <i className="fas fa-list fa-3x"></i>
            </div>
            <Card.Title className="text-center mb-3">Total Records</Card.Title>
            <h3 className="text-center mb-0">{filteredRecords.length}</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3 mb-lg-0">
        <Card className={`bg-${theme} m-0 p-md-3 shadow-sm h-100`}>
          <Card.Body className="d-flex flex-column align-items-center">
            <div className="icon-container mb-3 text-warning">
              <i className="fas fa-calculator fa-3x"></i>
            </div>
            <Card.Title className="text-center mb-3">
              Average per Record
            </Card.Title>
            <h3 className="text-center mb-0">
              {filteredRecords.length > 0
                ? formatDecimal(totalEmissions / filteredRecords.length)
                : 0}{" "}
              kg
            </h3>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3 mb-lg-0">
        <Card className={`bg-${theme} m-0 p-md-3 shadow-sm h-100`}>
          <Card.Body className="d-flex flex-column align-items-center">
            <div className="icon-container mb-3 text-info">
              <i className="fas fa-road fa-3x"></i>
            </div>
            <Card.Title className="text-center mb-3">Total Distance</Card.Title>
            <h3 className="text-center mb-0">
              {formatDecimal(
                filteredRecords.reduce(
                  (sum, record) => sum + parseFloat(record.distance || 0),
                  0
                )
              )}{" "}
              km
            </h3>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AnalyticsCards;
