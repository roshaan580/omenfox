import React from "react";

const EmissionsByMode = ({ theme, emissionsByMode }) => {
  if (Object.keys(emissionsByMode).length === 0) {
    return null;
  }
  
  return (
    <div className="row mt-4">
      <div className="col-12">
        <div className={`card bg-${theme} m-0 shadow-sm`}>
          <div className="card-body">
            <h5 className="card-title">Emissions by Transport Mode</h5>
            <div className="row">
              {Object.entries(emissionsByMode).map(([mode, emissions]) => (
                <div key={mode} className="col-md-4 mb-3">
                  <div className={`card bg-${theme} m-0 p-3 shadow-sm d-flex flex-row justify-content-between align-items-center flex-wrap gap-2`}>
                    <div>
                      <strong>{mode}</strong>
                    </div>
                    <div>
                      <span className="badge bg-primary">
                        {emissions.toFixed(2)} kg CO₂e
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmissionsByMode; 