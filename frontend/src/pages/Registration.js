import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { JWT_EMPLOYEE_SECRET, REACT_APP_API_URL } from "../config";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importing the eye icons
import LocationPicker from "../components/LocationPicker"; // Import LocationPicker
import LogoWhite from "../assets/logo-white.png";
import LogoBlack from "../assets/logo-black.png";

const RegisterPage = ({
  userData,
  isModelVisible,
  isAdmin,
  onProfileUpdate,
  companies = [],
}) => {
  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [homeAddress, setHomeAddress] = useState({
    address: userData?.homeAddress || "",
    lat: userData?.homeLocation?.lat || 0,
    lon: userData?.homeLocation?.lon || 0,
  });
  const [companyAddress, setCompanyAddress] = useState({
    address: userData?.companyAddress || "",
    lat: userData?.companyLocation?.lat || 0,
    lon: userData?.companyLocation?.lon || 0,
  });
  const [carName, setCarName] = useState(userData?.car?.name || ""); // Car name input
  const [licensePlate, setLicensePlate] = useState(
    userData?.car?.licensePlate || ""
  ); // License plate for the car
  const [carType, setCarType] = useState(userData?.car?.companyCar); // Whether the car is personal or company-owned
  const [email, setEmail] = useState(userData?.email || ""); // Email input
  const [password, setPassword] = useState(userData?.password || ""); // Password input (optional for editing)
  const [phone, setPhone] = useState(userData?.phone || ""); // Phone input
  const [company, setCompany] = useState(userData?.company?._id || ""); // Company selection
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [isLoading, setIsLoading] = useState(false); // State for toggling password visibility
  const [error, setError] = useState(null);

  // Get theme from localStorage or use light as default
  const theme = localStorage.getItem("theme") || "light";

  useEffect(() => {
    if (isModelVisible) {
      setFirstName(userData?.firstName || "");
      setLastName(userData?.lastName || "");
      setHomeAddress({
        address: userData?.homeAddress || "",
        lat: userData?.homeLocation?.lat || 0,
        lon: userData?.homeLocation?.lon || 0,
      });
      setCompanyAddress({
        address: userData?.companyAddress || "",
        lat: userData?.companyLocation?.lat || 0,
        lon: userData?.companyLocation?.lon || 0,
      });
      setCarName(userData?.car?.name || "");
      setLicensePlate(userData?.car?.licensePlate || "");
      setCarType(userData?.car?.companyCar);
      setEmail(userData?.email || "");
      setPhone(userData?.phone || "");
      setCompany(userData?.company?._id || "");
    }
  }, [userData, isModelVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    /* ---------- build payload ---------- */
    const payload = {
      firstName,
      lastName,
      homeAddress: homeAddress.address,
      homeLocation: { lat: homeAddress.lat, lon: homeAddress.lon },
      companyAddress: companyAddress.address,
      companyLocation: { lat: companyAddress.lat, lon: companyAddress.lon },
      car: {
        name: carName,
        licensePlate,
        type: "car",
        companyCar: carType,
      },
      email,
      password,
      phone,
      company: company || undefined,
    };

    try {
      setIsLoading(true);

      const url = isModelVisible
        ? `${REACT_APP_API_URL}/employees/${userData?._id}` // edit
        : `${REACT_APP_API_URL}/employees`; // new

      const response = await fetch(url, {
        method: isModelVisible ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_EMPLOYEE_SECRET}`,
        },
        body: JSON.stringify(payload),
      });

      /* ---------- error branch ---------- */
      if (!response.ok) {
        const errJSON = await response.json().catch(() => ({}));
        setError(
          errJSON?.message ||
            (isModelVisible ? "Profile update failed!" : "Registration failed!")
        );
        return;
      }

      /* ---------- success branch ---------- */
      await response.json(); // parsed once – ignore body for this flow

      /* === ADMIN FLOW ===================================== */
      if (isAdmin) {
        onProfileUpdate?.(); // refresh table
        return; // keep admin session intact
      }

      /* === NON‑ADMIN FLOW ================================= */
      localStorage.removeItem("token");
      localStorage.removeItem("userObj");
      localStorage.removeItem("userData");

      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Determine container classes based on whether it's a modal or page
  const containerClasses = isAdmin
    ? "d-flex flex-column justify-content-center"
    : "container py-5 px-0 px-md-4 min-vh-100 d-flex flex-column  justify-content-center";

  const cardClasses = isAdmin ? "w-100" : "col-xl-6 col-lg-8 col-md-10";

  const cardStyles = isAdmin ? { margin: 0 } : {};

  return (
    <div className={containerClasses}>
      <div className="row justify-content-center">
        <div className={cardClasses}>
          <div
            className={`${isAdmin ? "p-4 registeration-card" : "card"}`}
            style={cardStyles}
          >
            <div className="card-body">
              <div className={`text-center mb-4 ${isAdmin && "d-none"}`}>
                <img
                  src={theme === "dark" ? LogoWhite : LogoBlack}
                  alt="Logo"
                  width={150}
                  height={84}
                  className="mb-3"
                />
                <h2 className="card-title">
                  {isModelVisible ? "Edit Profile" : "Employee Registration"}
                </h2>
              </div>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
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
                  <div className="col-sm-6 col-12 mb-3 position-relative">
                    <label className="form-label">Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="cursorPointer position-absolute top-62 end-0 translate-middle-y me-3"
                    >
                      {showPassword ? (
                        <FaEyeSlash size={15} />
                      ) : (
                        <FaEye size={15} />
                      )}
                    </span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-6 col-12 mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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
                    onChange={(e) => setCarType(e.target.value)}
                    required
                  >
                    <option value={false}>Personal</option>
                    <option value={true}>Company</option>
                  </select>
                </div>
                {!isModelVisible && !isAdmin && (
                  <div className="text-center mt-3">
                    <p>
                      Already have an account?{" "}
                      <Link to="/" className="regButton">
                        Login
                      </Link>
                    </p>
                  </div>
                )}
                <div className="d-flex justify-content-center mt-3 mb-3">
                  <button
                    className="btn btn-success w-50"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div
                        className="spinner-border spinner-border-sm text-light"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : isModelVisible ? (
                      "Update Profile"
                    ) : (
                      "Register"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
