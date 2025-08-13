import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { REACT_APP_API_URL } from "../config";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LogoWhite from "../assets/logo-white.png";
import LogoBlack from "../assets/logo-black.png";

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [employeeData, setEmployeeData] = useState(null);
  const [tokenValid, setTokenValid] = useState(null);

  // Get theme from localStorage or use light as default
  const theme = localStorage.getItem("theme") || "light";

  const verifyToken = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${REACT_APP_API_URL}/employees/verify-token/${token}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setTokenValid(true);
        setEmployeeData(data.employee);
      } else {
        setTokenValid(false);
        setError(data.message || "Invalid or expired activation token.");
      }
    } catch (err) {
      setTokenValid(false);
      setError("Failed to verify activation token. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Apply theme
    document.body.className = `${theme}-theme`;
    
    if (!token) {
      setError("Invalid activation link. No token provided.");
      return;
    }

    // Verify token on component mount
    verifyToken();
  }, [token, theme, verifyToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${REACT_APP_API_URL}/employees/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password set successfully! Your account has been activated.");
        setTimeout(() => {
          navigate("/", { 
            state: { 
              message: "Account activated successfully! You can now log in.",
              email: employeeData?.email 
            } 
          });
        }, 2000);
      } else {
        setError(data.message || "Failed to set password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="container py-5 px-0 px-md-4 min-vh-100 d-flex flex-column justify-content-center">
        <div className="row justify-content-center">
          <div className="col-xl-4 col-lg-5 col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Verifying activation link...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="container py-5 px-0 px-md-4 min-vh-100 d-flex flex-column justify-content-center">
        <div className="row justify-content-center">
          <div className="col-xl-4 col-lg-5 col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <img
                  src={theme === "dark" ? LogoWhite : LogoBlack}
                  alt="Logo"
                  width={120}
                  height={67}
                  className="mb-3"
                />
                <h3 className="card-title text-danger">Invalid Link</h3>
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
                <p className="text-muted">
                  The activation link may have expired or is invalid. Please contact your administrator for a new activation link.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/")}
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 px-0 px-md-4 min-vh-100 d-flex flex-column justify-content-center">
      <div className="row justify-content-center">
        <div className="col-xl-4 col-lg-5 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="text-center mb-4">
                <img
                  src={theme === "dark" ? LogoWhite : LogoBlack}
                  alt="Logo"
                  width={120}
                  height={67}
                  className="mb-3"
                />
                <h2 className="card-title">Set Your Password</h2>
                {employeeData && (
                  <p className="text-muted">
                    Welcome, {employeeData.firstName} {employeeData.lastName}!
                    <br />
                    <small>{employeeData.email}</small>
                  </p>
                )}
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter your password"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="position-absolute"
                    style={{
                      top: "50%",
                      right: "15px",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                  </div>
                </div>

                <div className="mb-3 position-relative">
                  <label className="form-label">Confirm Password</label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Confirm your password"
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="position-absolute"
                      style={{
                        top: "50%",
                        right: "15px",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                      }}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Password must be at least 6 characters long.
                  </small>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Setting Password...
                      </>
                    ) : (
                      "Set Password & Activate Account"
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Need help? Contact your administrator.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;