import React, { useState, useEffect } from "react";
import { JWT_EMPLOYEE_SECRET, REACT_APP_API_URL } from "../config";
import LocationPicker from "../components/LocationPicker"; // Import LocationPicker

const UpdateEmployee = ({ userData, isModelVisible, onUpdate, companies = [] }) => {
  // Initialize state with properly structured location data
  const [homeAddress, setHomeAddress] = useState({
    address: userData?.homeAddress || "",
    lat: parseFloat(userData?.homeLocation?.lat) || 0,
    lon: parseFloat(userData?.homeLocation?.lon) || 0,
  });

  const [companyAddress, setCompanyAddress] = useState({
    address: userData?.companyAddress || "",
    lat: parseFloat(userData?.companyLocation?.lat) || 0,
    lon: parseFloat(userData?.companyLocation?.lon) || 0,
  });

  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [carName, setCarName] = useState(userData?.car?.name || ""); // Car name input
  const [licensePlate, setLicensePlate] = useState(
    userData?.car?.licensePlate || ""
  ); // License plate for the car
  const [carType, setCarType] = useState(userData?.car?.companyCar); // Whether the car is personal or company-owned
  const [email, setEmail] = useState(userData?.email || ""); // Email input
  const [company, setCompany] = useState(userData?.company?._id || ""); // Company selection
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [updateSuccess, setUpdateSuccess] = useState(false); // State for showing success message
  const [updateError, setUpdateError] = useState(""); // State for showing error message

  // Update state when modal becomes visible or userData changes
  useEffect(() => {
    if (isModelVisible && userData) {
      setFirstName(userData?.firstName || "");
      setLastName(userData?.lastName || "");
      setHomeAddress({
        address: userData?.homeAddress || "",
        lat: parseFloat(userData?.homeLocation?.lat) || 0,
        lon: parseFloat(userData?.homeLocation?.lon) || 0,
      });
      setCompanyAddress({
        address: userData?.companyAddress || "",
        lat: parseFloat(userData?.companyLocation?.lat) || 0,
        lon: parseFloat(userData?.companyLocation?.lon) || 0,
      });
      setCarName(userData?.car?.name || "");
      setLicensePlate(userData?.car?.licensePlate || "");
      setCarType(userData?.car?.companyCar);
      setEmail(userData?.email || "");
      setCompany(userData?.company?._id || "");
      setUpdateSuccess(false);
      setUpdateError("");
    }
  }, [userData, isModelVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError("");

    const data = {
      firstName,
      lastName,
      homeAddress: homeAddress.address,
      homeLocation: {
        lat: parseFloat(homeAddress.lat),
        lon: parseFloat(homeAddress.lon),
      },
      companyAddress: companyAddress.address,
      companyLocation: {
        lat: parseFloat(companyAddress.lat),
        lon: parseFloat(companyAddress.lon),
      },
      car: {
        name: carName,
        licensePlate,
        type: "car",
        companyCar: carType,
      },
      email,
      company: company || undefined,
    };

    try {
      setIsLoading(true);
      const url = `${REACT_APP_API_URL}/employees/${userData?._id}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_EMPLOYEE_SECRET}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (onUpdate && typeof onUpdate === "function") {
          onUpdate(responseData?.employee);
        }
        setUpdateSuccess(true);
        console.log("Profile updated successfully!");
      } else {
        const errorData = await response.json();
        console.error("Profile update failed!", errorData);
        setUpdateError(
          errorData.message || "Failed to update profile. Please try again."
        );
      }
    } catch (error) {
      console.error("Error during update", error);
      setUpdateError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      {updateSuccess && (
        <div className="alert alert-success mb-3" role="alert">
          Profile updated successfully!
        </div>
      )}

      {updateError && (
        <div className="alert alert-danger mb-3" role="alert">
          {updateError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-sm-6 col-12 mb-3">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="col-sm-6 col-12 mb-3">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-6 col-12 mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="col-sm-6 col-12 mb-3">
            <label className="form-label">Company</label>
            <select
              className="form-select"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <option value="">Select Company</option>
              {companies.map((comp) => (
                <option key={comp._id} value={comp._id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-6 col-12 mb-4">
            <LocationPicker
              label="Home Address"
              value={homeAddress}
              onChange={setHomeAddress}
              required
              mapHeight="200px"
              placeholder="Enter your home address"
            />
          </div>
          <div className="col-sm-6 col-12 mb-4">
            <LocationPicker
              label="Company Address"
              value={companyAddress}
              onChange={setCompanyAddress}
              required
              mapHeight="200px"
              placeholder="Enter company address"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-6 col-12 mb-3">
            <label className="form-label">Car Name</label>
            <input
              type="text"
              className="form-control"
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
              required
            />
          </div>
          <div className="col-sm-6 col-12 mb-3">
            <label className="form-label">License Plate</label>
            <input
              type="text"
              className="form-control"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Car Type</label>
          <select
            className="form-select"
            value={carType}
            onChange={(e) => setCarType(e.target.value === "true")}
            required
          >
            <option value="false">Personal</option>
            <option value="true">Company</option>
          </select>
        </div>
        <div className="d-flex justify-content-end">
          <button
            type="submit"
            className="btn btn-success"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateEmployee;
