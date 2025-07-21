import React from "react";

const InfoCards = ({ theme, getTotalEmissions }) => {
  return (
    <div className="row mb-4 gap-lg-0 gap-4">
      <div className="col-lg-8">
        <div className={`card bg-${theme} m-0 shadow-sm h-100`}>
          <div className="card-body">
            <h5 className="card-title">
              <i className="fas fa-truck text-primary me-2"></i>
              About Freight Transport Emissions (Scope 3)
            </h5>
            <p>
              Freight transport emissions include all upstream and downstream transportation 
              of goods in your value chain by third-party logistics providers:
            </p>
            <div className="row">
              <div className="col-md-6">
                <ul className="small">
                  <li>Inbound logistics (supplier to you)</li>
                  <li>Outbound logistics (you to customer)</li>
                  <li>Third-party distribution</li>
                  <li>Courier and express services</li>
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="small">
                  <li>Road freight (trucks)</li>
                  <li>Rail freight</li>
                  <li>Sea freight (ships)</li>
                  <li>Air freight</li>
                </ul>
              </div>
            </div>
            <div className="mt-3">
              <strong>Formula:</strong><br />
              <small>Distance (km) × Weight (tons) × Emission Factor (kg CO₂e/ton-km)</small>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        <div className={`card bg-${theme} m-0 shadow-sm h-100`}>
          <div className="card-body text-center">
            <h5 className="card-title">Total Emissions</h5>
            <div className="icon-container mb-3 text-success">
              <i className="fas fa-leaf fa-3x"></i>
            </div>
            <h3 className="text-success">{getTotalEmissions().toFixed(2)}</h3>
            <p className="mb-0">kg CO₂e</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCards; 