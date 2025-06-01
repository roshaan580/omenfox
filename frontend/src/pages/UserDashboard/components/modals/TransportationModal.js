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

  // Reset step and form data when modal is opened/closed
  useEffect(() => {
    if (visible) {
      setCurrentStep(1);
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
      console.log("Transportation record saved successfully!");
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
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = (e) => {
    e.preventDefault(); // Prevent form submission
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
          if (e.target.value === "car") {
            setCurrentStep(2);
          } else {
            setCurrentStep(3);
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
      <label htmlFor="carType" className="form-label">
        Car Type*
      </label>
      <select
        id="carType"
        className="form-select mb-3"
        name="carType"
        value={formData.carType || ""}
        onChange={(e) => {
          onChange(e);
        }}
        required
      >
        <option value="">Select Type</option>
        <option value="personal">Personal Car</option>
        <option value="company">Company Car</option>
      </select>

      {vehicles.length > 0 && (
        <div className="mt-3">
          <label htmlFor="ownVehicle" className="form-label">
            Select Your Vehicle
          </label>
          <select
            id="ownVehicle"
            className="form-select"
            value={selectedVehicle?._id || ""}
            onChange={(e) => {
              const vehicle = vehicles.find((v) => v._id === e.target.value);
              setSelectedVehicle(vehicle);
            }}
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.vehicleName} ({vehicle.licensePlate})
              </option>
            ))}
          </select>
        </div>
      )}
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
          value={formData.co2Emission}
          onChange={(e) =>
            onChange({
              target: {
                name: "co2Emission",
                value: e.target.value,
              },
            })
          }
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="usageType" className="form-label">
          Usage Type*
        </label>
        <select
          id="usageType"
          className="form-select"
          name="usageType"
          value={formData.usageType}
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
          <option value="">Select...</option>
          <option value="company car">Company Car</option>
          <option value="business travel">Business Travel</option>
          <option value="commuting">Commuting</option>
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="workFromHomeDays" className="form-label">
          Work from Home Days (Per Week)
        </label>
        <input
          type="number"
          id="workFromHomeDays"
          className="form-control"
          name="workFromHomeDays"
          value={formData.workFromHomeDays}
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
      </div>

      <div className="mb-3">
        <label htmlFor="recurrenceDays" className="form-label">
          Recurring Days
        </label>
        <select
          id="recurrenceDays"
          className="form-select"
          name="recurrenceDays"
          value={formData.recurrenceDays}
          onChange={(e) =>
            onChange({
              target: {
                name: "recurrenceDays",
                value: e.target.value,
              },
            })
          }
        >
          <option value="">Select...</option>
          <option value="1">1 Day</option>
          <option value="2">2 Days</option>
          <option value="3">3 Days</option>
          <option value="4">4 Days</option>
          <option value="5">5 Days</option>
        </select>
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
          value={formData.date}
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
