import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { JWT_EMPLOYEE_SECRET, REACT_APP_API_URL } from "../config";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaEnvelope, FaSpinner } from "react-icons/fa"; // Importing the icons
import LocationPicker from "../components/LocationPicker"; // Import LocationPicker
import LogoWhite from "../assets/logo-white.png";
import LogoBlack from "../assets/logo-black.png";
import toast from "react-hot-toast";

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
  const [company, setCompany] = useState(userData?.company?._id || ""); // Company selection
  const [isLoading, setIsLoading] = useState(false); // State for toggling password visibility
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Get theme from localStorage or use light as default
  const theme = localStorage.getItem("theme") || "light";

  // Custom toast component with react-icons
  const CustomToast = ({ type, message, icon: IconComponent }) => {
    const getToastStyles = () => {
      const baseStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '500',
        boxShadow: theme === 'dark' 
          ? '0 10px 25px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
        border: 'none',
        minWidth: '320px',
        maxWidth: '450px',
      };

      if (theme === 'dark') {
        const darkStyles = {
          success: { background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#ecfdf5' },
          error: { background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)', color: '#fef2f2' },
          info: { background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', color: '#eff6ff' },
          loading: { background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)', color: '#f9fafb' },
          email: { background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#ecfdf5' },
        };
        return { ...baseStyles, ...darkStyles[type] };
      } else {
        const lightStyles = {
          success: { background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', color: '#065f46', border: '1px solid #a7f3d0' },
          error: { background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)', color: '#991b1b', border: '1px solid #fca5a5' },
          info: { background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: '#1e40af', border: '1px solid #93c5fd' },
          loading: { background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', color: '#374151', border: '1px solid #d1d5db' },
          email: { background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', color: '#065f46', border: '1px solid #a7f3d0' },
        };
        return { ...baseStyles, ...lightStyles[type] };
      }
    };

    return (
      <div style={getToastStyles()}>
        <IconComponent size={20} style={{ flexShrink: 0 }} />
        <span style={{ lineHeight: '1.4' }}>{message}</span>
      </div>
    );
  };

  // Show custom toast
  const showCustomToast = (type, message, duration = 4000) => {
    const iconMap = {
      success: FaCheckCircle,
      error: FaTimesCircle,
      info: FaInfoCircle,
      loading: FaSpinner,
      email: FaEnvelope,
    };

    const IconComponent = iconMap[type] || FaInfoCircle;

    toast.custom(
      <CustomToast type={type} message={message} icon={IconComponent} />,
      { duration }
    );
  };

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
      setCompany(userData?.company?._id || "");
    }
  }, [userData, isModelVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");

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
        const errorMessage = errJSON?.message ||
          (isModelVisible ? "Profile update failed!" : "Registration failed!");
        
        // Show error toast
        showCustomToast('error', errorMessage, 4000);
        
        setError(errorMessage);
        return;
      }

      /* ---------- success branch ---------- */
      const responseData = await response.json();

      /* === ADMIN FLOW ===================================== */
      if (isAdmin) {
        const successMsg = responseData.message || "Employee registered successfully! Activation email sent.";
        
        // Show success toast for admin
        showCustomToast('success', successMsg, 5000);
        
        // Clear form after successful registration
        setFirstName("");
        setLastName("");
        setEmail("");
        setCompany("");
        setCarName("");
        setLicensePlate("");
        setCarType(false);
        setHomeAddress({ address: "", lat: 0, lon: 0 });
        setCompanyAddress({ address: "", lat: 0, lon: 0 });
        
        // Refresh table and close modal after a delay
        setTimeout(() => {
          onProfileUpdate?.();
        }, 2000);
        
        return; // keep admin session intact
      }

      /* === NON‑ADMIN FLOW ================================= */
      // Show success toast with email being sent confirmation
      showCustomToast('email', 'Registration successful! Activation email is being sent.', 5000);
      
      // Show additional info toast
      setTimeout(() => {
        showCustomToast('info', 'Please check your email in a few moments for the activation link.', 6000);
      }, 1500);
      
      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setCompany("");
      setCarName("");
      setLicensePlate("");
      setCarType(false);
      setHomeAddress({ address: "", lat: 0, lon: 0 });
      setCompanyAddress({ address: "", lat: 0, lon: 0 });
      
      // Redirect to login after showing success message
      setTimeout(() => {
        showCustomToast('loading', 'Redirecting to login page...', 2000);
        
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userObj");
          localStorage.removeItem("userData");
          navigate("/");
        }, 2000);
      }, 5000);
    } catch (err) {
      const errorMessage = "An error occurred. Please try again later.";
      
      // Show error toast
      showCustomToast('error', errorMessage, 5000);
      
      setError(errorMessage);
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
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-sm-6 col-12 mb-3">
                    <label className="form-label">First Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-sm-6 col-12 mb-3">
                    <label className="form-label">Last Name <span className="text-danger">*</span></label>
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
                    <label className="form-label">Email <span className="text-danger">*</span></label>
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
