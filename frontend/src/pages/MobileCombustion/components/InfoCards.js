import React from "react";

const InfoCards = ({ theme }) => {
  return (
    <div className="row mb-4">
      <div className="col-md-6">
        <div className={`card bg-${theme} m-0 p-md-3 shadow-sm h-100`}>
          <div className="card-body">
            <h5 className="card-title">
              <i className="fas fa-car text-success me-2"></i>
              Scope 1 - Fossil Fuel Vehicles
            </h5>
            <p>Direct emissions from company-owned vehicles using fossil fuels:</p>
            <ul className="small">
              <li>Company cars, trucks, and vans</li>
              <li>Construction and agricultural equipment</li>
              <li>Forklifts and other mobile equipment</li>
              <li>Motorcycles and scooters</li>
            </ul>
            <div className="mt-3">
              <strong>Formula:</strong><br />
              <small>Distance (km) × Transport Mode Emission Factor (kg CO₂e/km)</small>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className={`card bg-${theme} m-0 p-md-3 shadow-sm h-100`}>
          <div className="card-body">
            <h5 className="card-title">
              <i className="fas fa-bolt text-info me-2"></i>
              Scope 2 - Electric Vehicles
            </h5>
            <p>Indirect emissions from company-owned electric vehicles:</p>
            <ul className="small">
              <li>Electric company cars</li>
              <li>Electric delivery vehicles</li>
              <li>Electric forklifts and equipment</li>
              <li>Plug-in hybrid vehicles (electric portion)</li>
            </ul>
            <div className="mt-3">
              <strong>Note:</strong><br />
              <small>Electric vehicles are tracked separately as Scope 2 emissions due to purchased electricity</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCards; 