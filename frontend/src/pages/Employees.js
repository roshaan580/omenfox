import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../config";
import "bootstrap/dist/css/bootstrap.min.css";
import Registration from "./Registration";
import { FaUserPlus } from "react-icons/fa"; // Import FaPlusCircle here
import Sidebar from "../components/Sidebar";
import { authenticatedFetch } from "../utils/axiosConfig";
import TablePagination from "../components/TablePagination";
import usePagination from "../hooks/usePagination";
import ProfileModal from "./UserDashboard/components/modals/ProfileModal";
import { Modal } from "react-bootstrap";

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegModel, setIsRegModel] = useState(false);
  const [isModalVisible, setModalVisible] = useState(null); // Store the employee to be edited
  const [successMessage, setSuccessMessage] = useState(""); // For showing success messages
  const navigate = useNavigate();

  // Add Sidebar state variables
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Use pagination hook
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    paginate,
    changeItemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
    totalItems,
  } = usePagination(employees);

  // Function to fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${REACT_APP_API_URL}/employees`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // UseEffect to fetch employees data
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Delete employee function
  const deleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(`${REACT_APP_API_URL}/employees/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        });

        if (response.ok) {
          setEmployees(employees.filter((employee) => employee._id !== id));
        } else {
          throw new Error("Failed to delete employee");
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };
  const employeeDetails = async (id) => {
    navigate(`/employee-details/${id}`);
  };

  // Edit employee function
  const editEmployee = (user) => {
    console.log("Edit employee", user);
    setModalVisible(user); // Set the selected employee to be edited
  };

  // Register employee function
  const regEmployee = (e) => {
    console.log("Reg employee");
    setIsRegModel(e);
  };

  // Close the modal
  const closeModal = () => {
    setModalVisible(false); // Close the modal by resetting the state
    setIsRegModel(false);
  };

  // Check authentication on load and set user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        try {
          const response = await authenticatedFetch(
            `${REACT_APP_API_URL}/auth/validate-token`,
            {
              method: "GET",
            }
          );
          if (response.ok) {
            // Set the user data
            const userObj = JSON.parse(localStorage.getItem("userObj"));
            setUserData(userObj);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("userObj");
            localStorage.removeItem("userData");
            navigate("/");
          }
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("userObj");
          localStorage.removeItem("userData");
          navigate("/");
        }
      } catch (error) {
        navigate("/");
      }
    };

    checkAuth();
    // Apply theme from localStorage
    document.body.className = `${theme}-theme`;
  }, [navigate, theme]);

  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="alert alert-info" role="alert">
          Loading employees...
        </div>
      </div>
    );
  }

  const handleProfileUpdate = (updatedData) => {
    // Update the employees list instead of reloading the page
    setEmployees(
      employees.map((emp) => (emp._id === updatedData._id ? updatedData : emp))
    );

    // Close the modal
    setModalVisible(false);

    // Show success message with auto-dismiss after 3 seconds
    setSuccessMessage("Employee updated successfully!");
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`;
  };

  return (
    <div className={`dashboard-container bg-${theme}`}>
      <Sidebar
        userData={userData}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className={`main-content ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
        <div className="container mt-4">
          <h1 className="mb-4">Employees</h1>

          {/* Success Message Alert */}
          {successMessage && (
            <div
              className="alert alert-success alert-dismissible fade show"
              role="alert"
            >
              {successMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessMessage("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Error Message Alert */}
          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
            <p className="mb-0">Total: {employees.length}</p>
            <button
              className="btn btn-outline-success d-flex align-items-center px-4 py-1 rounded-3 shadow-sm hover-shadow mb-0"
              onClick={() => regEmployee(true)}
              style={{ marginBottom: "13px" }}
            >
              <FaUserPlus className="me-2" />
              Register Employee
            </button>
          </div>

          {/* Employee Listing Table */}
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Home Address</th>
                  <th>Company Address</th>
                  <th>Transportation Mode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((employee, index) => (
                    <tr key={employee._id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>
                        {employee.firstName} {employee.lastName}
                      </td>
                      <td>{employee.homeAddress}</td>
                      <td>{employee.companyAddress}</td>
                      <td>{employee.transportation}</td>
                      <td>
                        <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => editEmployee(employee)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteEmployee(employee._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => employeeDetails(employee._id)}
                          >
                            <i className="fas fa-info-circle"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination component */}
          <TablePagination
            currentPage={currentPage}
            onPageChange={paginate}
            totalPages={totalPages}
            recordsPerPage={itemsPerPage}
            onRecordsPerPageChange={changeItemsPerPage}
            totalRecords={totalItems}
            startIndex={indexOfFirstItem}
            endIndex={indexOfLastItem}
            theme={theme}
          />

          {/* Update Employee Modal */}
          {isModalVisible && (
            <ProfileModal
              visible={!!isModalVisible}
              onClose={closeModal}
              userData={isModalVisible}
              onUpdate={handleProfileUpdate}
            />
          )}

          {/* Registration Modal */}
          {isRegModel && (
            <Modal
              show={isRegModel}
              onHide={closeModal}
              size="lg"
              backdrop="static"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Register Employee</Modal.Title>
              </Modal.Header>
              <Modal.Body className="p-0">
                <Registration
                  show={isRegModel}
                  onHide={closeModal}
                  onProfileUpdate={() => {
                    fetchEmployees(); // Refresh employee list
                    closeModal(); // Close modal after registration
                  }}
                  isAdmin={true}
                />
              </Modal.Body>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePage;
