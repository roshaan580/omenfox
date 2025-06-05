import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { formatDecimal } from "../../../utils/dateUtils";

const AnalyticsCards = ({
  theme,
  totalEmissions,
  filteredRecords,
  emissionsByType,
}) => {
  // Calculate emissions by source category
  const calculateSourceEmissions = () => {
    const sources = {
      transport: 0,
      energy: 0,
      general: 0,
    };

    filteredRecords.forEach((record) => {
      if (record.transportEmission || record.transportRecord) {
        sources.transport += parseFloat(record.co2Equivalent || 0);
      } else if (record.energyEmission) {
        sources.energy += parseFloat(record.co2Equivalent || 0);
      } else {
        sources.general += parseFloat(record.co2Equivalent || 0);
      }
    });

    return sources;
  };

  const sourceEmissions = calculateSourceEmissions();

  return (
    <Row className="mb-4">
      <Col lg={3} md={6} className="mb-3 mb-lg-0">
        <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
          <Card.Body className="d-flex flex-column align-items-center">
            <div className="icon-container mb-3 text-primary">
              <i className="fas fa-cloud fa-3x"></i>
            </div>
            <Card.Title className="text-center mb-3">
              Total CO₂ Emissions
            </Card.Title>
            <h2 className="text-center mb-0">
              {formatDecimal(totalEmissions)} kg
            </h2>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3 mb-lg-0">
        <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
          <Card.Body className="d-flex flex-column align-items-center">
            <div className="icon-container mb-3 text-danger">
              <i className="fas fa-truck fa-3x"></i>
            </div>
            <Card.Title className="text-center mb-3">
              Transport Emissions
            </Card.Title>
            <h3 className="text-center mb-0">
              {formatDecimal(sourceEmissions.transport)} kg
            </h3>
            <small className="text-center text-muted mt-2">
              {totalEmissions > 0
                ? `${formatDecimal(
                    (sourceEmissions.transport / totalEmissions) * 100
                  )}%`
                : "0%"}{" "}
              of total
            </small>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3 mb-lg-0">
        <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
          <Card.Body className="d-flex flex-column align-items-center">
            <div className="icon-container mb-3 text-warning">
              <i className="fas fa-bolt fa-3x"></i>
            </div>
            <Card.Title className="text-center mb-3">
              Energy Emissions
            </Card.Title>
            <h3 className="text-center mb-0">
              {formatDecimal(sourceEmissions.energy)} kg
            </h3>
            <small className="text-center text-muted mt-2">
              {totalEmissions > 0
                ? `${formatDecimal(
                    (sourceEmissions.energy / totalEmissions) * 100
                  )}%`
                : "0%"}{" "}
              of total
            </small>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3} md={6} className="mb-3 mb-lg-0">
        <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
          <Card.Body className="d-flex flex-column align-items-center">
            <div className="icon-container mb-3 text-success">
              <i className="fas fa-leaf fa-3x"></i>
            </div>
            <Card.Title className="text-center mb-3">
              Other Emissions
            </Card.Title>
            <h3 className="text-center mb-0">
              {formatDecimal(sourceEmissions.general)} kg
            </h3>
            <small className="text-center text-muted mt-2">
              {totalEmissions > 0
                ? `${formatDecimal(
                    (sourceEmissions.general / totalEmissions) * 100
                  )}%`
                : "0%"}{" "}
              of total
            </small>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AnalyticsCards;
