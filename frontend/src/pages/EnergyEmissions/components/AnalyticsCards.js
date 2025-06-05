import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { formatDecimal } from "../../../utils/dateUtils";

const AnalyticsCards = ({
  theme,
  totalEmissions,
  filteredRecords,
  emissionsByType,
}) => {
  // Calculate total CO2 from filtered records
  const totalFilteredEmissions = filteredRecords.reduce((total, record) => {
    let recordTotal = 0;
    if (record.energySources && Array.isArray(record.energySources)) {
      recordTotal = record.energySources.reduce((sum, source) => {
        return sum + parseFloat(source.emission || 0);
      }, 0);
    }
    return total + recordTotal;
  }, 0);

  // Calculate average emissions per record
  const averageEmissions =
    filteredRecords.length > 0
      ? totalFilteredEmissions / filteredRecords.length
      : 0;

  // Find most common energy type
  const energyTypeCounts = {};
  filteredRecords.forEach((record) => {
    if (record.energySources && Array.isArray(record.energySources)) {
      record.energySources.forEach((source) => {
        if (source.type) {
          energyTypeCounts[source.type] =
            (energyTypeCounts[source.type] || 0) + 1;
        }
      });
    }
  });

  let mostCommonType = "None";
  let highestCount = 0;
  Object.entries(energyTypeCounts).forEach(([type, count]) => {
    if (count > highestCount) {
      mostCommonType = type;
      highestCount = count;
    }
  });

  // Calculate emissions by energy type
  const emissionsByEnergyType = {};
  filteredRecords.forEach((record) => {
    if (record.energySources && Array.isArray(record.energySources)) {
      record.energySources.forEach((source) => {
        if (source.type && source.emission) {
          emissionsByEnergyType[source.type] =
            (emissionsByEnergyType[source.type] || 0) +
            parseFloat(source.emission || 0);
        }
      });
    }
  });

  // Find highest emission source
  let highestEmissionType = "None";
  let highestEmission = 0;
  Object.entries(emissionsByEnergyType).forEach(([type, emission]) => {
    if (emission > highestEmission) {
      highestEmissionType = type;
      highestEmission = emission;
    }
  });

  return (
    <Row className="mb-4">
      <Col xs={12} sm={6} lg={3} className="mb-3">
        <Card className={`bg-${theme} shadow-sm h-100`}>
          <Card.Body className="d-flex flex-column align-items-center text-center p-3">
            <div className="icon-wrapper mb-2">
              <i className="fas fa-bolt text-warning fa-2x"></i>
            </div>
            <Card.Title as="h5">Total Energy Emissions</Card.Title>
            <Card.Text className="fs-2 fw-bold text-success">
              {formatDecimal(totalFilteredEmissions)} kg
            </Card.Text>
            <Card.Text className="text-muted small">
              CO₂ equivalent from all energy sources
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} sm={6} lg={3} className="mb-3">
        <Card className={`bg-${theme} shadow-sm h-100`}>
          <Card.Body className="d-flex flex-column align-items-center text-center p-3">
            <div className="icon-wrapper mb-2">
              <i className="fas fa-plug text-primary fa-2x"></i>
            </div>
            <Card.Title as="h5">Average Per Record</Card.Title>
            <Card.Text className="fs-2 fw-bold text-primary">
              {formatDecimal(averageEmissions)} kg
            </Card.Text>
            <Card.Text className="text-muted small">
              Average CO₂ per emission record
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} sm={6} lg={3} className="mb-3">
        <Card className={`bg-${theme} shadow-sm h-100`}>
          <Card.Body className="d-flex flex-column align-items-center text-center p-3">
            <div className="icon-wrapper mb-2">
              <i className="fas fa-fire text-danger fa-2x"></i>
            </div>
            <Card.Title as="h5">Highest Source</Card.Title>
            <Card.Text className="fs-2 fw-bold text-danger">
              {highestEmissionType}
            </Card.Text>
            <Card.Text className="text-muted small">
              {formatDecimal(highestEmission)} kg CO₂
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} sm={6} lg={3} className="mb-3">
        <Card className={`bg-${theme} shadow-sm h-100`}>
          <Card.Body className="d-flex flex-column align-items-center text-center p-3">
            <div className="icon-wrapper mb-2">
              <i className="fas fa-lightbulb text-info fa-2x"></i>
            </div>
            <Card.Title as="h5">Most Common Type</Card.Title>
            <Card.Text className="fs-2 fw-bold text-info">
              {mostCommonType}
            </Card.Text>
            <Card.Text className="text-muted small">
              Used in {highestCount} records
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AnalyticsCards;
