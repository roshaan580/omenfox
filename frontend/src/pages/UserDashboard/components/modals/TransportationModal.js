import React, { useState, useEffect } from "react";
import { saveTransportationRecord } from "../../utils/transportUtils";
import LocationPicker from "../../../../components/LocationPicker";

/**
 * Modal for adding a new transportation record
 */
const TransportationModal = ({
  visible,
  onClose,
  formData,
  onChange,
  onSubmitSuccess,
  vehicles = [], // Add vehicles prop
}) => {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [stepHistory, setStepHistory] = useState([1]); // Track step history for proper back navigation

  // Reset step and form data when modal is opened/closed
  useEffect(() => {
    if (visible) {
      setCurrentStep(1);
      setStepHistory([1]);
      setSelectedVehicle(null);
      // Reset form data to initial state
      if (onChange) {
        onChange({
          target: {
            name: "transportationMode",
            value: "",
          },
        });
      }
    }
  }, [visible, onChange]);

  // Set default CO2 emission values based on transportation mode
  useEffect(() => {
    if (formData.transportationMode && !formData.co2Emission) {
      let defaultEmission = "";

      switch (formData.transportationMode) {
        case "bike":
          defaultEmission = "0"; // Zero emissions for bike
          break;
        case "walking":
          defaultEmission = "0"; // Zero emissions for walking
          break;
        case "public_transport":
          defaultEmission = "60"; // Average for public transport
          break;
        case "car":
          if (formData.vehicleType === "electric") {
            defaultEmission = "30"; // Lower for electric
          } else if (formData.vehicleType === "hybrid") {
            defaultEmission = "100"; // Medium for hybrid
          } else {
            defaultEmission = "150"; // Higher for conventional
          }
          break;
        case "plane":
          defaultEmission = "250"; // High for plane
          break;
        default:
          defaultEmission = "";
      }

      if (defaultEmission) {
        onChange({
          target: {
            name: "co2Emission",
            value: defaultEmission,
          },
        });
      }
    }
  }, [
    formData.transportationMode,
    formData.vehicleType,
    formData.co2Emission,
    onChange,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.transportationMode) {
        throw new Error("Please select a transportation mode");
      }

      if (!formData.date) {
        throw new Error("Please select a date");
      }

      if (!formData.co2Emission) {
        throw new Error("Please enter CO₂ emission value");
      }

      if (!formData.usageType) {
        throw new Error("Please select a usage type");
      }

      // Submit the record
      await saveTransportationRecord({
        ...formData,
        vehicleId: selectedVehicle?._id,
      });

      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      console.error("Error saving transportation record:", error);
      setError(
        error.message ||
          "Failed to save transportation record. Please try again."
      );
      const modalBody = document.querySelector(".modal-body");
      if (modalBody) modalBody.scrollTop = 0;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleNextStep = (e) => {
    e.preventDefault(); // Prevent form submission

    // Determine the next step based on current step and transportation mode
    let nextStep;
    if (currentStep === 1) {
      // If on step 1, go to step 2 only for car, otherwise go to step 3
      nextStep = formData.transportationMode === "car" ? 2 : 3;
    } else {
      // For other steps, just increment
      nextStep = currentStep + 1;
    }

    // Don't exceed step 3
    if (nextStep <= 3) {
      // Add current step to history before changing
      setStepHistory((prev) => [...prev, nextStep]);
      setCurrentStep(nextStep);
    }
  };

  const handlePrevStep = (e) => {
    e.preventDefault(); // Prevent form submission

    if (stepHistory.length > 1) {
      // Remove current step from history
      const newHistory = [...stepHistory];
      newHistory.pop();
      // Get the previous step from history
      const prevStep = newHistory[newHistory.length - 1];
      setStepHistory(newHistory);
      setCurrentStep(prevStep);
    }
  };

  const renderStep1 = () => (
    <div className="mb-3">
      <label htmlFor="transportationMode" className="form-label">
        Transportation Mode*
      </label>
      <select
        id="transportationMode"
        className="form-select"
        name="transportationMode"
        value={formData.transportationMode || ""}
        onChange={(e) => {
          onChange(e);

          // Update step based on selection
          const mode = e.target.value;
          if (mode === "car") {
            // For car, go to step 2
            setStepHistory([1, 2]);
            setCurrentStep(2);
          } else if (mode) {
            // For any other valid selection, go to step 3
            setStepHistory([1, 3]);
            setCurrentStep(3);

            // Also reset any car-specific fields
            if (onChange) {
              onChange({
                target: {
                  name: "vehicleType",
                  value: "",
                },
              });
            }
          }
        }}
        required
      >
        <option value="">Select Mode</option>
        <option value="bike">Bike</option>
        <option value="walking">Walking</option>
        <option value="public_transport">Public Transport</option>
        <option value="car">Car</option>
        <option value="plane">Plane</option>
      </select>
    </div>
  );

  const renderStep2 = () => (
    <div className="mb-3">
      <label htmlFor="vehicleType" className="form-label">
        Select Vehicle Type*
      </label>
      <select
        id="vehicleType"
        className="form-select mb-3"
        name="vehicleType"
        value={formData.vehicleType || ""}
        onChange={(e) => {
          onChange(e);
          // If a predefined type is selected
          if (
            ["electric", "hybrid", "petrol", "diesel", "average"].includes(
              e.target.value
            )
          ) {
            setSelectedVehicle({ vehicleType: e.target.value });
          } else {
            // For user vehicles
            const vehicle = vehicles.find((v) => v._id === e.target.value);
            if (vehicle) {
              setSelectedVehicle(vehicle);
            }
          }
        }}
        required
      >
        <option value="">Select Type</option>
        <option value="electric">Electric</option>
        <option value="hybrid">Hybrid</option>
        <option value="petrol">Petrol</option>
        <option value="diesel">Diesel</option>
        <option value="average">Average</option>
        {vehicles.length > 0 && (
          <optgroup label="Your Vehicles">
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.vehicleName} ({vehicle.licensePlate})
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );

  const renderStep3 = () => (
    <>
      <div className="mb-4">
        <LocationPicker
          label="Begin Location*"
          value={{
            address: formData.beginLocation,
            lat: formData.beginLocationLat,
            lon: formData.beginLocationLon,
          }}
          onChange={(location) => {
            onChange({
              target: {
                name: "beginLocation",
                value: location.address,
              },
            });
            onChange({
              target: {
                name: "beginLocationLat",
                value: location.lat,
              },
            });
            onChange({
              target: {
                name: "beginLocationLon",
                value: location.lon,
              },
            });
          }}
          required
          mapHeight="200px"
        />
      </div>

      <div className="mb-4">
        <LocationPicker
          label="End Location*"
          value={{
            address: formData.endLocation,
            lat: formData.endLocationLat,
            lon: formData.endLocationLon,
          }}
          onChange={(location) => {
            onChange({
              target: {
                name: "endLocation",
                value: location.address,
              },
            });
            onChange({
              target: {
                name: "endLocationLat",
                value: location.lat,
              },
            });
            onChange({
              target: {
                name: "endLocationLon",
                value: location.lon,
              },
            });
          }}
          required
          mapHeight="200px"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="co2Emission" className="form-label">
          CO₂ Emission per km*
        </label>
        <input
          type="number"
          id="co2Emission"
          className="form-control"
          name="co2Emission"
          value={formData.co2Emission || ""}
          onChange={(e) =>
            onChange({
              target: {
                name: "co2Emission",
                value: e.target.value,
              },
            })
          }
          required
          min="0"
          step="0.01"
        />
        {(formData.transportationMode === "bike" ||
          formData.transportationMode === "walking") && (
          <small className="form-text text-muted">
            Zero emissions for{" "}
            {formData.transportationMode === "bike" ? "cycling" : "walking"}.
          </small>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="usageType" className="form-label">
          Purpose of Journey*
        </label>
        <select
          id="usageType"
          className="form-select"
          name="usageType"
          value={formData.usageType || ""}
          onChange={(e) =>
            onChange({
              target: {
                name: "usageType",
                value: e.target.value,
              },
            })
          }
          required
        >
          <option value="">Select Purpose...</option>

          {/* Car-specific options */}
          {formData.transportationMode === "car" && (
            <>
              <option value="commuting">Commuting to Work</option>
              <option value="business">Business Travel</option>
              <option value="personal_errands">Personal Errands</option>
              <option value="leisure">Leisure Activities</option>
              <option value="school">School/Education</option>
              <option value="shopping">Shopping</option>
              <option value="medical">Medical Appointments</option>
              {formData.vehicleType === "electric" && (
                <option value="zero_emission">Zero Emission Journey</option>
              )}
            </>
          )}

          {/* Public transport options */}
          {formData.transportationMode === "public_transport" && (
            <>
              <option value="commuting">Commuting to Work</option>
              <option value="business">Business Travel</option>
              <option value="personal_errands">Personal Errands</option>
              <option value="leisure">Leisure Activities</option>
              <option value="school">School/Education</option>
              <option value="shopping">Shopping</option>
              <option value="medical">Medical Appointments</option>
            </>
          )}

          {/* Bike options */}
          {formData.transportationMode === "bike" && (
            <>
              <option value="commuting">Commuting to Work</option>
              <option value="exercise">Exercise & Fitness</option>
              <option value="leisure">Leisure Cycling</option>
              <option value="errands">Local Errands</option>
              <option value="school">School/Education</option>
              <option value="zero_emission">Zero Emission Journey</option>
            </>
          )}

          {/* Walking options */}
          {formData.transportationMode === "walking" && (
            <>
              <option value="commuting">Commuting to Work</option>
              <option value="exercise">Exercise & Fitness</option>
              <option value="leisure">Leisure Walking</option>
              <option value="errands">Local Errands</option>
              <option value="school">School/Education</option>
              <option value="dog_walking">Dog Walking</option>
              <option value="zero_emission">Zero Emission Journey</option>
            </>
          )}

          {/* Plane options */}
          {formData.transportationMode === "plane" && (
            <>
              <option value="business">Business Travel</option>
              <option value="vacation">Vacation/Holiday</option>
              <option value="relocation">Relocation</option>
              <option value="family_visit">Family Visit</option>
              <option value="conference">Conference/Event</option>
            </>
          )}

          {/* Default options for any other mode */}
          {!["car", "public_transport", "bike", "walking", "plane"].includes(
            formData.transportationMode
          ) && (
            <>
              <option value="commuting">Commuting</option>
              <option value="business">Business</option>
              <option value="personal">Personal</option>
              <option value="leisure">Leisure</option>
            </>
          )}
        </select>
      </div>

      {(formData.transportationMode === "car" ||
        formData.transportationMode === "public_transport") &&
        formData.usageType === "commuting" && (
          <div className="mb-3">
            <label htmlFor="workFromHomeDays" className="form-label">
              Work from Home Days (Per Week)
            </label>
            <input
              type="number"
              id="workFromHomeDays"
              className="form-control"
              name="workFromHomeDays"
              value={formData.workFromHomeDays || ""}
              onChange={(e) =>
                onChange({
                  target: {
                    name: "workFromHomeDays",
                    value: e.target.value,
                  },
                })
              }
              min="0"
              max="7"
            />
            <small className="form-text text-muted">
              This helps calculate your reduced carbon footprint from remote
              work.
            </small>
          </div>
        )}

      <div className="mb-3">
        <label htmlFor="recurrenceDays" className="form-label">
          Recurring Journey
        </label>
        <select
          id="recurrenceDays"
          className="form-select"
          name="recurrenceDays"
          value={formData.recurrenceDays || ""}
          onChange={(e) =>
            onChange({
              target: {
                name: "recurrenceDays",
                value: e.target.value,
              },
            })
          }
        >
          <option value="">One-time Journey</option>
          <option value="1">Weekly (1 day per week)</option>
          <option value="2">2 days per week</option>
          <option value="3">3 days per week</option>
          <option value="4">4 days per week</option>
          <option value="5">5 days per week (Weekdays)</option>
          <option value="7">Daily (7 days per week)</option>
        </select>
        <small className="form-text text-muted">
          For regular journeys, select how often this trip occurs.
        </small>
      </div>

      <div className="mb-3">
        <label htmlFor="date" className="form-label">
          Date*
        </label>
        <input
          type="date"
          id="date"
          className="form-control"
          name="date"
          value={formData.date || ""}
          onChange={(e) =>
            onChange({
              target: {
                name: "date",
                value: e.target.value,
              },
            })
          }
          required
        />
        <small className="form-text text-muted">
          {formData.recurrenceDays
            ? "First date of recurring journey"
            : "Date of journey"}
        </small>
      </div>
    </>
  );

  if (!visible) return null;

  const modalBackdrop = (
    <div
      className="modal-backdrop fade show"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1040,
      }}
      onClick={handleClose}
    ></div>
  );

  return (
    <>
      {modalBackdrop}
      <div
        className="modal fade show custom-scrollbar"
        tabIndex="-1"
        style={{ display: "block", zIndex: 1050 }}
        aria-labelledby="transportationModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="transportationModalLabel">
                Add New Transportation Record - Step {currentStep} of 3
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}

                <div className="d-flex justify-content-between">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        className="btn btn-secondary me-2"
                        onClick={handlePrevStep}
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                  </div>
                  {currentStep === 3 ? (
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        "Save Transportation Record"
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNextStep}
                    >
                      Next
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransportationModal;
