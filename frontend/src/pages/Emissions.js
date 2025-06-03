import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Card, Row, Col } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../config";
import DynamicSelect from "../components/DynamicSelect";
import { isRecordEditable, formatDecimal } from "../utils/dateUtils";
import { authenticatedFetch } from "../utils/axiosConfig";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle } from "react-icons/fa";
import { Line, Pie, Bar } from "react-chartjs-2";
import EmployeeSelect from "../components/EmployeeSelect";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const EmissionsPage = () => {
  const [emissionRecords, setEmissionRecords] = useState([]);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [emissionRecord, setEmissionRecord] = useState({
    emissionType: "",
    date: "",
    quantity: "",
    co2Equivalent: "",
    employee: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [employeesState, setEmployeesState] = useState([]);
  const [emissionTypes, setEmissionTypes] = useState([]);
  const navigate = useNavigate();

  // Add Sidebar state variables
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // New state variables for analytics
  const [emissionsByMonth, setEmissionsByMonth] = useState({});
  const [emissionsByType, setEmissionsByType] = useState({});
  const [totalEmissions, setTotalEmissions] = useState(0);

  // Add filter state
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    employees: [],
    emissionTypes: [],
  });

  const [filteredRecords, setFilteredRecords] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found in Emissions page, redirecting to login");
          navigate("/");
          return;
        }

        try {
          // Validate token
          const response = await authenticatedFetch(
            `${REACT_APP_API_URL}/auth/validate-token`,
            {
              method: "GET",
            }
          );
          if (!response.ok) {
            // Failed validation, redirect to login
            localStorage.removeItem("token");
            localStorage.removeItem("userObj");
            localStorage.removeItem("userData");
            navigate("/");
          } else {
            // Set the user data
            const userObj = JSON.parse(localStorage.getItem("userObj"));
            setUserData(userObj);
          }
        } catch (validationError) {
          console.error("Token validation error:", validationError);
          localStorage.removeItem("token");
          localStorage.removeItem("userObj");
          localStorage.removeItem("userData");
          navigate("/");
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        setError("Authentication failed. Please log in again.");
        navigate("/");
      }
    };

    checkAuth();
    // Apply theme from localStorage
    document.body.className = `${theme}-theme`;
  }, [navigate, theme]);

  // Fetch all emission records, employees, and emission types
  useEffect(() => {
    const fetchEmissions = async () => {
      try {
        console.log("Fetching emissions data...");
        // Store JWT_ADMIN_SECRET in localStorage for axiosConfig to use
        localStorage.setItem("JWT_ADMIN_SECRET", JWT_ADMIN_SECRET);

        // Use Promise.all to fetch data from multiple endpoints simultaneously
        const [emissionsRes, employeesRes, typesRes] = await Promise.all([
          authenticatedFetch(
            `${REACT_APP_API_URL}/general-emissions?global=true`,
            {
              method: "GET",
            }
          ),
          authenticatedFetch(`${REACT_APP_API_URL}/employees`, {
            method: "GET",
          }),
          authenticatedFetch(`${REACT_APP_API_URL}/emission-types`, {
            method: "GET",
          }),
        ]);

        // Check if responses are successful
        if (!emissionsRes.ok || !employeesRes.ok || !typesRes.ok) {
          throw new Error("One or more API requests failed");
        }

        // Parse the JSON responses
        const [emissionsData, employeesData, typesData] = await Promise.all([
          emissionsRes.json(),
          employeesRes.json(),
          typesRes.json(),
        ]);

        console.log("Emissions data:", emissionsData);
        console.log("Employees data:", employeesData);
        console.log("Emission types data:", typesData);

        // Update state with the fetched data
        setEmissionRecords(emissionsData);
        setEmployeesState(employeesData);
        setEmissionTypes(typesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Failed to fetch data: ${error.message}`);
      }
    };
    fetchEmissions();
  }, []);

  const handleInputChange = (e, field) => {
    setEmissionRecord({
      ...emissionRecord,
      [field]: e.target.value,
    });
  };

  const handleAdd = () => {
    setEmissionRecord({
      emissionType: "",
      date: "",
      quantity: "",
      co2Equivalent: "",
      employee: "",
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);

  const closeEditModal = () => setShowEditModal(false);

  // Submit form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the data to match the backend API expectations
      const formattedData = {
        date: emissionRecord.date,
        emissionType: emissionRecord.emissionType,
        employee: emissionRecord.employee,
        quantity: parseFloat(emissionRecord.quantity || 0),
        co2Equivalent: parseFloat(emissionRecord.co2Equivalent || 0),
      };

      // Log the data being sent
      console.log(
        "Sending emission data:",
        JSON.stringify(formattedData, null, 2)
      );

      // Send data to the backend API
      const response = await authenticatedFetch(
        `${REACT_APP_API_URL}/general-emissions`,
        {
          method: "POST",
          body: JSON.stringify(formattedData),
        }
      );

      if (!response.ok) {
        // Try to get more detailed error information
        let errorDetail = "";
        try {
          const errorResponse = await response.json();
          errorDetail = JSON.stringify(errorResponse);
        } catch (e) {
          errorDetail = await response.text();
        }

        throw new Error(
          `Error ${response.status}: ${response.statusText}. Details: ${errorDetail}`
        );
      }

      const newEmission = await response.json();
      console.log("Emission record created successfully:", newEmission);

      // Add the new record to state instead of reloading
      setEmissionRecords([newEmission.emissionRecord, ...emissionRecords]);
      setFilteredRecords([newEmission.emissionRecord, ...filteredRecords]);

      // Close the modal
      setShowAddModal(false);

      // Show success message
      setError(null);
    } catch (error) {
      console.error("Error submitting record:", error);
      setError(`Failed to submit emission record: ${error.message}`);
    }
  };

  // Edit modal handler
  const handleEdit = (record) => {
    setEmissionRecord({
      emissionType: record.emissionType._id,
      date: new Date(record?.date).toISOString().split("T")[0],
      quantity: record.quantity,
      co2Equivalent: record.co2Equivalent,
      employee: record.employee?._id,
      _id: record?._id,
    });
    setShowEditModal(true);
  };

  // Update record
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the data to match the backend API expectations
      const formattedData = {
        date: emissionRecord.date,
        emissionType: emissionRecord.emissionType,
        employee: emissionRecord.employee,
        quantity: parseFloat(emissionRecord.quantity || 0),
        co2Equivalent: parseFloat(emissionRecord.co2Equivalent || 0),
      };

      console.log("Updating emission record:", emissionRecord._id);
      console.log("With data:", JSON.stringify(formattedData, null, 2));

      // Send updated data to the backend API
      const response = await authenticatedFetch(
        `${REACT_APP_API_URL}/general-emissions/${emissionRecord._id}`,
        {
          method: "PUT",
          body: JSON.stringify(formattedData),
        }
      );

      if (!response.ok) {
        // Try to get more detailed error information
        let errorDetail = "";
        try {
          const errorResponse = await response.json();
          errorDetail = JSON.stringify(errorResponse);
        } catch (e) {
          errorDetail = await response.text();
        }

        throw new Error(
          `Error ${response.status}: ${response.statusText}. Details: ${errorDetail}`
        );
      }

      const updatedEmission = await response.json();
      console.log("Emission record updated successfully:", updatedEmission);

      // Update the record in state instead of reloading
      const updatedRecords = emissionRecords.map((record) =>
        record._id === emissionRecord._id
          ? updatedEmission.emissionRecord
          : record
      );
      setEmissionRecords(updatedRecords);
      setFilteredRecords(updatedRecords);

      // Close the modal
      setShowEditModal(false);

      // Show success message
      setError(null);
    } catch (error) {
      console.error("Error updating record:", error);
      setError(`Failed to update emission record: ${error.message}`);
    }
  };

  // Confirm delete
  const confirmDelete = (data) => {
    setDeleteRecordId(data?._id);
    setShowDeleteConfirm(true);
  };

  // Delete the emission record
  const handleDelete = async () => {
    try {
      // Send delete request to the backend API
      const response = await authenticatedFetch(
        `${REACT_APP_API_URL}/general-emissions/${deleteRecordId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log("Emission record deleted successfully");
      setShowDeleteConfirm(false);

      // Remove the deleted record from the state
      setEmissionRecords(
        emissionRecords.filter((record) => record._id !== deleteRecordId)
      );
    } catch (error) {
      console.error("Error deleting record:", error);
      setError(`Failed to delete emission record: ${error.message}`);
    }
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

  // Process emissions data for charts
  useEffect(() => {
    if (emissionRecords.length > 0) {
      // Process monthly data
      const monthlyData = emissionRecords.reduce((acc, record) => {
        const month = new Date(record.date).toLocaleString("default", {
          month: "long",
        });
        acc[month] = (acc[month] || 0) + parseFloat(record.co2Equivalent);
        return acc;
      }, {});

      // Process type data - using name instead of category
      const typeData = emissionRecords.reduce((acc, record) => {
        const type = record.emissionType?.name || "Other";
        acc[type] = (acc[type] || 0) + parseFloat(record.co2Equivalent);
        return acc;
      }, {});

      // Calculate total emissions
      const total = emissionRecords.reduce(
        (sum, record) => sum + parseFloat(record.co2Equivalent),
        0
      );

      setEmissionsByMonth(monthlyData);
      setEmissionsByType(typeData);
      setTotalEmissions(total);
    }
  }, [emissionRecords]);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...emissionRecords];
    console.log("Manual filter application triggered");
    console.log("Initial records count:", filtered.length);

    if (filters.startDate) {
      filtered = filtered.filter(
        (record) => new Date(record.date) >= new Date(filters.startDate)
      );
      console.log("After startDate filter:", filtered.length);
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (record) => new Date(record.date) <= new Date(filters.endDate)
      );
      console.log("After endDate filter:", filtered.length);
    }

    if (filters.employees && filters.employees.length > 0) {
      console.log("Selected employees:", filters.employees);
      filtered = filtered.filter((record) =>
        filters.employees.some((emp) => emp.value === record.employee?._id)
      );
      console.log("After employees filter:", filtered.length);
    }

    if (filters.emissionTypes && filters.emissionTypes.length > 0) {
      console.log("Selected emission types:", filters.emissionTypes);
      filtered = filtered.filter((record) =>
        filters.emissionTypes.some(
          (type) => type.value === record.emissionType?._id
        )
      );
      console.log("After emission types filter:", filtered.length);
    }

    setFilteredRecords(filtered);
    console.log("Final filtered records:", filtered.length);
  };

  // Initialize filtered records when emission records change
  useEffect(() => {
    setFilteredRecords(emissionRecords);
  }, [emissionRecords]);

  // Chart configurations
  const monthlyChartData = {
    labels: Object.keys(emissionsByMonth),
    datasets: [
      {
        label: "Monthly CO₂ Emissions (kg)",
        data: Object.values(emissionsByMonth),
        backgroundColor:
          theme === "dark"
            ? "rgba(75, 192, 192, 0.3)"
            : "rgba(75, 192, 192, 0.2)",
        borderColor:
          theme === "dark" ? "rgba(75, 192, 192, 1)" : "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor:
          theme === "dark" ? "rgba(75, 192, 192, 1)" : "rgba(54, 162, 235, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor:
          theme === "dark" ? "rgba(75, 192, 192, 1)" : "rgba(54, 162, 235, 1)",
      },
    ],
  };

  const typeChartData = {
    labels: Object.keys(emissionsByType),
    datasets: [
      {
        label: "Emissions by Category",
        data: Object.values(emissionsByType),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Emission by source (for bar chart) - update to use name instead of category
  const emissionsBySource = {
    labels: emissionRecords.map(
      (record) => record.emissionType?.name || "Unknown"
    ),
    datasets: [
      {
        label: "CO₂ Emissions by Source (kg)",
        data: emissionRecords.map((record) => record.co2Equivalent),
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
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
        <div className="container-fluid mt-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <h1>Emissions</h1>
            <div>
              <Button
                variant="outline-primary"
                className="me-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="fas fa-filter me-2"></i>{" "}
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button variant="outline-success" onClick={handleAdd}>
                <FaPlusCircle className="me-2" /> Add New Emission
              </Button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Filters Section */}
          {showFilters && (
            <Card className={`bg-${theme} mb-4 m-0 z-3 position-relative`}>
              <Card.Body>
                <Card.Title className="mb-3">Filter Records</Card.Title>
                <Row>
                  <Col xl={3} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                          setFilters({ ...filters, startDate: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col xl={3} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                          setFilters({ ...filters, endDate: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col xl={3} md={6}>
                    <EmployeeSelect
                      modalData={{ employees: filters.employees }}
                      employeesState={employeesState}
                      handleEmployeeChange={(selectedOptions) => {
                        console.log(
                          "Emissions: Employee selection changed to:",
                          selectedOptions
                        );
                        setFilters({
                          ...filters,
                          employees: selectedOptions,
                        });
                      }}
                      theme={theme}
                    />
                  </Col>
                  <Col xl={3} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Emission Type</Form.Label>
                      <DynamicSelect
                        modalData={{ emissionTypes: filters.emissionTypes }}
                        stateData={emissionTypes}
                        handleChange={(selectedOptions) => {
                          console.log(
                            "Emissions: Type selection changed to:",
                            selectedOptions
                          );
                          setFilters({
                            ...filters,
                            emissionTypes: selectedOptions,
                          });
                        }}
                        formatData={(type) => ({
                          value: type._id,
                          label: type.name,
                          key: type._id,
                        })}
                        isMulti={true}
                        id="emissionTypeFilter"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    className="me-2"
                    onClick={() => {
                      setFilters({
                        startDate: "",
                        endDate: "",
                        employees: [],
                        emissionTypes: [],
                      });
                      setFilteredRecords(emissionRecords);
                    }}
                  >
                    Reset
                  </Button>
                  <Button variant="primary" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Analytics Cards */}
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-3 mb-lg-0">
              <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="icon-container mb-3 text-primary">
                    <i className="fas fa-cloud fa-3x"></i>
                  </div>
                  <Card.Title className="text-center mb-3">
                    Total CO₂ Emissions
                  </Card.Title>
                  <h3 className="text-center mb-0">
                    {formatDecimal(totalEmissions)} kg
                  </h3>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-3 mb-lg-0">
              <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="icon-container mb-3 text-success">
                    <i className="fas fa-list fa-3x"></i>
                  </div>
                  <Card.Title className="text-center mb-3">
                    Total Records
                  </Card.Title>
                  <h3 className="text-center mb-0">{filteredRecords.length}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-3 mb-lg-0">
              <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="icon-container mb-3 text-warning">
                    <i className="fas fa-calculator fa-3x"></i>
                  </div>
                  <Card.Title className="text-center mb-3">
                    Average per Record
                  </Card.Title>
                  <h3 className="text-center mb-0">
                    {filteredRecords.length > 0
                      ? formatDecimal(totalEmissions / filteredRecords.length)
                      : 0}{" "}
                    kg
                  </h3>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-3 mb-lg-0">
              <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="icon-container mb-3 text-info">
                    <i className="fas fa-tags fa-3x"></i>
                  </div>
                  <Card.Title className="text-center mb-3">
                    Emission Types
                  </Card.Title>
                  <h3 className="text-center mb-0">
                    {Object.keys(emissionsByType).length}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row className="mb-4">
            <Col md={12} lg={6}>
              <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
                <Card.Body>
                  <Card.Title className="mb-4">
                    Monthly Emissions Trend
                  </Card.Title>
                  <div style={{ height: "300px", padding: "10px" }}>
                    <Line
                      data={monthlyChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color:
                                theme === "dark"
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "rgba(0, 0, 0, 0.1)",
                            },
                            ticks: {
                              color: theme === "dark" ? "#fff" : "#666",
                              font: {
                                size: 11,
                              },
                            },
                            title: {
                              display: true,
                              text: "CO₂ Emissions (kg)",
                              color: theme === "dark" ? "#fff" : "#666",
                              font: {
                                weight: "bold",
                                size: 12,
                              },
                            },
                          },
                          x: {
                            grid: {
                              color:
                                theme === "dark"
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "rgba(0, 0, 0, 0.1)",
                            },
                            ticks: {
                              color: theme === "dark" ? "#fff" : "#666",
                              font: {
                                size: 11,
                              },
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            labels: {
                              color: theme === "dark" ? "#fff" : "#666",
                              font: {
                                size: 12,
                              },
                            },
                          },
                          tooltip: {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(0, 0, 0, 0.8)"
                                : "rgba(255, 255, 255, 0.8)",
                            titleColor: theme === "dark" ? "#fff" : "#000",
                            bodyColor: theme === "dark" ? "#fff" : "#000",
                            borderColor:
                              theme === "dark"
                                ? "rgba(255, 255, 255, 0.2)"
                                : "rgba(0, 0, 0, 0.2)",
                            borderWidth: 1,
                          },
                        },
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={12} lg={6}>
              <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
                <Card.Body>
                  <Card.Title className="mb-4">Emissions by Type</Card.Title>
                  <div style={{ height: "300px", padding: "10px" }}>
                    <Pie
                      data={typeChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                            labels: {
                              color: theme === "dark" ? "#fff" : "#666",
                              padding: 15,
                              font: {
                                size: 11,
                              },
                            },
                            display: Object.keys(emissionsByType).length <= 8,
                          },
                          tooltip: {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(0, 0, 0, 0.8)"
                                : "rgba(255, 255, 255, 0.8)",
                            titleColor: theme === "dark" ? "#fff" : "#000",
                            bodyColor: theme === "dark" ? "#fff" : "#000",
                            borderColor:
                              theme === "dark"
                                ? "rgba(255, 255, 255, 0.2)"
                                : "rgba(0, 0, 0, 0.2)",
                            borderWidth: 1,
                          },
                        },
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Additional Bar Chart */}
          <Row className="mb-4">
            <Col md={12}>
              <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
                <Card.Body>
                  <Card.Title className="mb-4">Emissions by Source</Card.Title>
                  <div style={{ height: "300px", padding: "10px" }}>
                    <Bar
                      data={emissionsBySource}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color:
                                theme === "dark"
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "rgba(0, 0, 0, 0.1)",
                            },
                            ticks: {
                              color: theme === "dark" ? "#fff" : "#666",
                            },
                            title: {
                              display: true,
                              text: "CO₂ Emissions (kg)",
                              color: theme === "dark" ? "#fff" : "#666",
                              font: {
                                weight: "bold",
                              },
                            },
                          },
                          x: {
                            grid: {
                              color:
                                theme === "dark"
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "rgba(0, 0, 0, 0.1)",
                            },
                            ticks: {
                              color: theme === "dark" ? "#fff" : "#666",
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            labels: {
                              color: theme === "dark" ? "#fff" : "#666",
                            },
                          },
                          tooltip: {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(0, 0, 0, 0.8)"
                                : "rgba(255, 255, 255, 0.8)",
                            titleColor: theme === "dark" ? "#fff" : "#000",
                            bodyColor: theme === "dark" ? "#fff" : "#000",
                          },
                        },
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Records Table */}
          <Card className={`bg-${theme} shadow-sm m-0`}>
            <Card.Body>
              <Card.Title className="mb-3">Emission Records</Card.Title>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Emission Type</th>
                      <th>Quantity</th>
                      <th>CO₂ Equivalent (kg)</th>
                      <th>Employee</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record, index) => (
                        <tr key={record._id}>
                          <td>{index + 1}</td>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>{record.emissionType?.name || "N/A"}</td>
                          <td>{formatDecimal(record.quantity)}</td>
                          <td>{formatDecimal(record.co2Equivalent)}</td>
                          <td>
                            {record.employee?.firstName}{" "}
                            {record.employee?.lastName}
                          </td>
                          <td>
                            <div className="d-flex gap-2 justify-content-center">
                              {isRecordEditable(record) ? (
                                <>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleEdit(record)}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => confirmDelete(record)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </Button>
                                </>
                              ) : (
                                <span className="text-muted small">
                                  Locked (previous year)
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>

          {/* Add Modal */}
          <Modal
            show={showAddModal}
            onHide={closeAddModal}
            className="custom-scrollbar"
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Add New Emission Record</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleAddSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group controlId="emissionType" className="mb-3">
                      <Form.Label>Emission Type</Form.Label>
                      <Form.Select
                        value={emissionRecord.emissionType}
                        onChange={(e) => handleInputChange(e, "emissionType")}
                        required
                      >
                        <option value="">Select Emission Type</option>
                        {emissionTypes.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.name} (GWP: {type.gwp})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group controlId="date" className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={emissionRecord.date}
                        onChange={(e) => handleInputChange(e, "date")}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group controlId="quantity" className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        value={emissionRecord.quantity}
                        onChange={(e) => handleInputChange(e, "quantity")}
                        placeholder="Enter quantity"
                        required
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group controlId="co2Equivalent" className="mb-3">
                      <Form.Label>CO₂ Equivalent (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        value={emissionRecord.co2Equivalent}
                        onChange={(e) => handleInputChange(e, "co2Equivalent")}
                        placeholder="Enter CO₂ equivalent"
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <Form.Group controlId="employee" className="mb-3">
                      <Form.Label>Employee</Form.Label>
                      <Form.Select
                        value={emissionRecord.employee}
                        onChange={(e) => handleInputChange(e, "employee")}
                        required
                      >
                        <option value="">Select Employee</option>
                        {employeesState.map((employee) => (
                          <option key={employee._id} value={employee._id}>
                            {employee.firstName} {employee.lastName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    className="me-2"
                    onClick={closeAddModal}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Record
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Edit Modal */}
          <Modal
            show={showEditModal}
            onHide={closeEditModal}
            className="custom-scrollbar"
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Update Emission Record</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleUpdateSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group controlId="emissionType" className="mb-3">
                      <Form.Label>Emission Type</Form.Label>
                      <Form.Select
                        value={emissionRecord.emissionType}
                        onChange={(e) => handleInputChange(e, "emissionType")}
                        required
                      >
                        <option value="">Select Emission Type</option>
                        {emissionTypes.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.name} (GWP: {type.gwp})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group controlId="date" className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={emissionRecord.date}
                        onChange={(e) => handleInputChange(e, "date")}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group controlId="quantity" className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        value={emissionRecord.quantity}
                        onChange={(e) => handleInputChange(e, "quantity")}
                        placeholder="Enter quantity"
                        required
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group controlId="co2Equivalent" className="mb-3">
                      <Form.Label>CO₂ Equivalent (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        value={emissionRecord.co2Equivalent}
                        onChange={(e) => handleInputChange(e, "co2Equivalent")}
                        placeholder="Enter CO₂ equivalent"
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <Form.Group controlId="employee" className="mb-3">
                      <Form.Label>Employee</Form.Label>
                      <Form.Select
                        value={emissionRecord.employee}
                        onChange={(e) => handleInputChange(e, "employee")}
                        required
                      >
                        <option value="">Select Employee</option>
                        {employeesState.map((employee) => (
                          <option key={employee._id} value={employee._id}>
                            {employee.firstName} {employee.lastName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    className="me-2"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Update Record
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            show={showDeleteConfirm}
            onHide={() => setShowDeleteConfirm(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete this emission record?
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default EmissionsPage;
