import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../../config";
import { formatDecimal } from "../../utils/dateUtils";
import Sidebar from "../../components/Sidebar";
import TablePagination from "../../components/TablePagination";
import usePagination from "../../hooks/usePagination";

const AdminTransportEmissions = () => {
  const [transportEmissions, setTransportEmissions] = useState([]);
  const [sortedRecords, setSortedRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Sidebar state
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sort records
  useEffect(() => {
    if (transportEmissions.length > 0) {
      // Create a sortable date using year and month
      const sorted = [...transportEmissions].sort((a, b) => {
        // Create date objects using year and month (set day to 1)
        const dateA = new Date(`${a.year}-${getMonthNumber(a.month)}-01`);
        const dateB = new Date(`${b.year}-${getMonthNumber(b.month)}-01`);

        // Sort descending (newest first)
        return dateB - dateA;
      });

      setSortedRecords(sorted);
    } else {
      setSortedRecords([]);
    }
  }, [transportEmissions]);

  // Helper to convert month name to number
  const getMonthNumber = (monthName) => {
    const months = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };
    return months[monthName] || "01";
  };

  // Use pagination hook with sorted records
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
  } = usePagination(sortedRecords);

  // Check authentication
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, redirecting to login");
          navigate("/");
          return;
        }

        const userObj = JSON.parse(localStorage.getItem("userObj"));
        if (userObj && userObj.role !== "admin") {
          navigate("/"); // Redirect non-admin users
          return;
        }

        setUserData(userObj);

        // Apply theme
        document.body.className = `${theme}-theme`;
      } catch (error) {
        console.error("Error fetching user data", error);
        navigate("/");
      }
    };

    fetchUserData();
  }, [navigate, theme]);

  // Fetch emissions data
  useEffect(() => {
    const fetchEmissions = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching admin transport emissions data...");

        const response = await fetch(
          `${REACT_APP_API_URL}/transport-emissions/admin/all`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Admin Transport Emissions:", data);
        setTransportEmissions(data);
      } catch (error) {
        console.error("Error fetching admin transport emissions:", error);
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmissions();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    localStorage.removeItem("userData");
    navigate("/");
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`;
  };

  // Helper to format loading state
  const renderLoading = () => (
    <div className="d-flex justify-content-center my-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  // Helper to format error state
  const renderError = () => (
    <div className="alert alert-danger" role="alert">
      <strong>Error:</strong> {error}
      <button
        className="btn btn-outline-danger btn-sm float-end"
        onClick={() => setError("")}
      >
        Dismiss
      </button>
    </div>
  );

  useEffect(() => {
    const handleOpenAddModal = (e) => {
      if (e.detail && e.detail.category === "freight") {
        // Implement your logic to open the add modal for freight transport here
        // For example, setShowAddModal(true) if you have such a state
      }
    };
    window.addEventListener("openAddModal", handleOpenAddModal);
    return () => window.removeEventListener("openAddModal", handleOpenAddModal);
  }, []);

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
        <div className="container py-5">
          {error && renderError()}

          <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
            <h4 className="text-left text-success mb-0">
              User Freight Transport Records
            </h4>
          </div>

          {isLoading ? (
            renderLoading()
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Company</th>
                      <th>Month</th>
                      <th>Year</th>
                      <th>Transport Mode</th>
                      <th>Distance (km)</th>
                      <th>Weight (tons)</th>
                      <th>Emission Factor (kg CO₂/ton-km)</th>
                      <th>Total Emissions (kg CO₂)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.length > 0 ? (
                      paginatedItems.map((record, index) => (
                        <tr key={record._id || index}>
                          <td>{indexOfFirstItem + index + 1}</td>
                          <td>
                            {record.userId
                              ? record.userId.username ||
                                record.userId.email ||
                                "Unknown User"
                              : "Unknown User"}
                          </td>
                          <td>
                            {record.userId && record.userId.company
                              ? record.userId.company.name
                              : "N/A"}
                          </td>
                          <td>{record.month}</td>
                          <td>{record.year}</td>
                          <td>{record.transportMode}</td>
                          <td>{formatDecimal(record.distance)}</td>
                          <td>{formatDecimal(record.weight)}</td>
                          <td>{formatDecimal(record.emissionFactor)}</td>
                          <td>{formatDecimal(record.totalEmissions)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center text-muted">
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination component */}
              {totalItems > 0 && (
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTransportEmissions;
