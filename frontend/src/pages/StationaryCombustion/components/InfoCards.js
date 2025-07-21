import React from "react";

const InfoCards = ({ theme }) => {
  return (
    <div className="row mb-4">
      <div className="col-md-6">
        <div className={`card bg-${theme} m-0 p-md-3 shadow-sm h-100`}>
          <div className="card-body">
            <h5 className="card-title">
              <i className="fas fa-fire text-danger me-2"></i>
              Combustion Emissions
            </h5>
            <p>Direct emissions from burning fossil fuels in stationary sources:</p>
            <ul className="small">
              <li>Boilers and furnaces</li>
              <li>Emergency generators</li>
              <li>Combined heat and power (CHP) plants</li>
              <li>Industrial process heating</li>
            </ul>
            <div className="mt-3">
              <strong>Formula:</strong><br />
              <small>Activity Data × Energy Content × Emission Factor</small>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className={`card bg-${theme} m-0 p-md-3 shadow-sm h-100`}>
          <div className="card-body">
            <h5 className="card-title">
              <i className="fas fa-wind text-warning me-2"></i>
              Fugitive Emissions
            </h5>
            <p>Unintentional releases of greenhouse gases:</p>
            <ul className="small">
              <li>HVAC refrigerant leaks</li>
              <li>Industrial process leaks</li>
              <li>Equipment maintenance releases</li>
              <li>Storage tank emissions</li>
            </ul>
            <div className="mt-3">
              <strong>Formula:</strong><br />
              <small>Activity Data × Global Warming Potential (GWP)</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCards; 