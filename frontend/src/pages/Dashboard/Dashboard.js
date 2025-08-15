import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { REACT_APP_API_URL, JWT_ADMIN_SECRET } from "../../config";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Sidebar from "../../components/Sidebar";
import Leaderboard from "../../components/Leaderboard";
import { authenticatedFetch } from "../../utils/axiosConfig";
import { formatDecimal } from "../../utils/dateUtils";
import { Card, Row, Col } from "react-bootstrap";

// Import chart configurations
import {
  getCO2ReductionConfig,
  getCO2EmissionsByDateConfig,
  getCO2EmissionsByCategoryConfig,
  getCO2EmissionsTrendConfig,
} from "./utils/chartConfigs";

// Import chart components
import ChartSection from "./components/ChartSection";

const DashboardPage = () => {
  const co2ReductionRef = useRef(null);
  const co2EmissionsByDateRef = useRef(null);
  const co2EmissionsByCategoryRef = useRef(null);
  const co2EmissionsTrendRef = useRef(null);

  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [emissionsCount, setEmissionsCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [totalEmissions, setTotalEmissions] = useState(0);

  // Chart states with initial configurations
  const [co2Reduction, setco2Reduction] = useState(
    getCO2ReductionConfig(theme)
  );
  const [co2EmissionsByDate, setCo2EmissionsByDate] = useState(
    getCO2EmissionsByDateConfig(theme)
  );
  const [co2EmissionsByDateSeries, setCo2EmissionsByDateSeries] = useState([]);
  const [co2EmissionsByCategory, setco2EmissionsByCategory] = useState(
    getCO2EmissionsByCategoryConfig(theme)
  );
  const [co2EmissionsByCategorySeries, setco2EmissionsByCategorySeries] =
    useState([]);
  const [co2EmissionsTrend, setCo2EmissionsTrend] = useState(
    getCO2EmissionsTrendConfig(theme)
  );

  // Update chart colors when theme changes
  useEffect(() => {
    // Update all charts with the new theme
    setco2Reduction(getCO2ReductionConfig(theme));
    setCo2EmissionsByDate(getCO2EmissionsByDateConfig(theme));
    setco2EmissionsByCategory(getCO2EmissionsByCategoryConfig(theme));
    setCo2EmissionsTrend(getCO2EmissionsTrendConfig(theme));
  }, [theme]);

  useEffect(() => {
    document.body.className = `${theme}-theme`;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        let userObj;
        try {
          userObj = JSON.parse(localStorage.getItem("userObj"));
        } catch (parseError) {
          console.error("Error parsing user object:", parseError);
          localStorage.removeItem("userObj");
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        if (token && userObj) {
          // Validate token with a small API call
          try {
            const response = await authenticatedFetch(
              `${REACT_APP_API_URL}/auth/validate-token`,
              {
                method: "GET",
              }
            );
            if (response.ok) {
              setUserData(userObj);
            } else {
              // Token validation failed
              localStorage.removeItem("token");
              localStorage.removeItem("userObj");
              localStorage.removeItem("userData");
              navigate("/");
            }
          } catch (validationError) {
            console.error("Token validation error:", validationError);
            localStorage.removeItem("token");
            localStorage.removeItem("userObj");
            localStorage.removeItem("userData");
            navigate("/");
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user data", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userObj");
        localStorage.removeItem("userData");
        navigate("/");
      }
    };

    const fetchStats = async () => {
      localStorage.setItem("JWT_ADMIN_SECRET", JWT_ADMIN_SECRET);

      const token = localStorage.getItem("token");

      const fetchData = async (url, errorMessage) => {
        try {
          const response = await authenticatedFetch(url, {
            method: "GET",
            headers: {
              ...(JWT_ADMIN_SECRET && !token
                ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
                : {}),
            },
          });
          const data = await response.json();
          return data;
        } catch (error) {
          console.error(`${errorMessage}:`, error);
          return null;
        }
      };

      try {
        // Using array destructuring with array indexes instead of named variables
        const responses = await Promise.all([
          fetchData(
            `${REACT_APP_API_URL}/employees`,
            "Failed to fetch employees"
          ),
          fetchData(
            `${REACT_APP_API_URL}/companies`,
            "Failed to fetch companies"
          ),
          fetchData(
            `${REACT_APP_API_URL}/emissions?global=true`,
            "Failed to fetch emissions"
          ),
          fetchData(
            `${REACT_APP_API_URL}/vehicles`,
            "Failed to fetch vehicles"
          ),
          fetchData(
            `${REACT_APP_API_URL}/dashboard/reduction-over-time`,
            "Failed to fetch reduction-over-time"
          ),
          fetchData(
            `${REACT_APP_API_URL}/dashboard/emissions-by-date`,
            "Failed to fetch emissions-by-date"
          ),
          fetchData(
            `${REACT_APP_API_URL}/dashboard/emissions-by-category`,
            "Failed to fetch emissions-by-category"
          ),
          fetchData(
            `${REACT_APP_API_URL}/dashboard/emissions-trend`,
            "Failed to fetch emissions-trend"
          ),
        ]);

        const emissionsData = responses[2];
        const redutionOverTime = responses[4];
        const emissionsByDate = responses[5];
        const emissionsByCategory = responses[6];
        const emissionsTrend = responses[7];

        if (Array.isArray(emissionsData)) {
          setEmissionsCount(emissionsData.length);
          const totalEmissions = emissionsData.reduce(
            (sum, record) => sum + parseFloat(record.co2Used || 0),
            0
          );
          setTotalEmissions(totalEmissions);
        } else {
          console.warn("Emissions data is not an array:", emissionsData);
          setEmissionsCount(0);
        }

        // Handle CO2 Reduction Over Time data
        if (redutionOverTime && Array.isArray(redutionOverTime)) {
          const dateArray = redutionOverTime.map((item) => {
            if (!item?.date) return "";
            const [year, month] = item.date.split("-");
            return new Date(year, month - 1)
              .toLocaleString("en-US", { month: "short", year: "numeric" })
              .replace(" ", "-");
          });

          const recordsArray = redutionOverTime.map(
            (item) => item.total_emission || 0
          );

          setco2Reduction((prev) => ({
            ...prev,
            xaxis: { ...prev.xaxis, categories: dateArray },
            series: [{ name: "CO₂ Reduction", data: recordsArray }],
          }));
        }

        // Handle Emissions By Date data
        if (emissionsByDate && Array.isArray(emissionsByDate)) {
          const dateByArray = emissionsByDate.map((item) => ({
            x: dateFormat(item?.date || ""),
            y: item?.total_emissions || 0,
          }));

          setCo2EmissionsByDateSeries([
            {
              name: "CO₂ Emissions",
              data: dateByArray,
            },
          ]);
        }

        // Handle Emissions By Category data
        if (emissionsByCategory && Array.isArray(emissionsByCategory)) {
          const categoryLabels = emissionsByCategory.map(
            (item) => item?.categoryTitle || ""
          );
          const categoryValues = emissionsByCategory.map(
            (item) => item?.totalEmissions || 0
          );

          setco2EmissionsByCategory((prev) => ({
            ...prev,
            labels: categoryLabels,
          }));

          setco2EmissionsByCategorySeries(categoryValues);
        }

        // Handle Emissions Trend data
        if (emissionsTrend && Array.isArray(emissionsTrend)) {
          const years = emissionsTrend.map((item) => item.year || "");
          const emissions = emissionsTrend.map(
            (item) => item.totalEmissions || 0
          );

          setCo2EmissionsTrend((prevState) => ({
            ...prevState,
            xaxis: {
              ...prevState.xaxis,
              categories: years,
            },
            series: [
              {
                name: "CO₂ Emissions",
                data: emissions,
              },
            ],
          }));
        }
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };

    fetchUserData();
    fetchStats();
  }, [navigate, theme]);

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

  const downloadAllPDFs = async () => {
    if (isGeneratingPDF) return; // Prevent multiple clicks

    setIsGeneratingPDF(true);
    const pdf = new jsPDF("portrait", "mm", "a4");
    const charts = [
      { ref: co2ReductionRef, title: "CO₂ Reduction Over Time" },
      { ref: co2EmissionsByDateRef, title: "CO₂ Emissions By Date" },
      { ref: co2EmissionsByCategoryRef, title: "CO₂ Emissions By Category" },
      { ref: co2EmissionsTrendRef, title: "CO₂ Emissions Trend" },
    ];

    try {
      // Temporarily hide toolbars for clean capture without changing chart styles
      const toolbars = document.querySelectorAll(".apexcharts-toolbar");
      toolbars.forEach((toolbar) => {
        toolbar.style.display = "none";
      });

      for (let i = 0; i < charts.length; i++) {
        const { ref, title } = charts[i];
        if (!ref.current) continue;

        // Direct capture without modifying chart styles
        const canvas = await html2canvas(ref.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: theme === "dark" ? "#212529" : "#ffffff",
          removeContainer: false,
        });

        const imgData = canvas.toDataURL("image/png", 1.0);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (i !== 0) pdf.addPage();

        // Add title
        pdf.setFontSize(16);
        pdf.setTextColor(theme === "dark" ? 255 : 0);
        pdf.text(title, 10, 20);

        // Add date
        pdf.setFontSize(10);
        pdf.setTextColor(theme === "dark" ? 220 : 60);
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 28);

        // Add image
        pdf.addImage(imgData, "PNG", 10, 35, pdfWidth - 20, pdfHeight - 20);
      }

      // Restore toolbars
      toolbars.forEach((toolbar) => {
        toolbar.style.display = "flex";
      });

      pdf.save("All_CO2_Emissions_Charts.pdf");
    } catch (error) {
      console.error("Error generating PDFs:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const dateFormat = (date) => {
    const fullDate = new Date(date);
    const day = String(fullDate.getDate()).padStart(2, "0"); // Ensure two digits
    const month = String(fullDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = fullDate.getFullYear();

    return `${day}-${month}-${year}`;
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
        <div className="container text-center">
          {/* Dashboard Analytics Cards */}
          <Row className="mt-2">
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
                  <h3 className="text-center mb-0">{emissionsCount}</h3>
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
                    {emissionsCount > 0
                      ? formatDecimal(totalEmissions / emissionsCount)
                      : 0}{" "}
                    kg
                  </h3>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-3 mb-lg-0">
              <Card
                className={`bg-${theme} shadow-sm h-100 m-0 cursor-pointer`}
                onClick={() => navigate("/yearly-reports")}
                style={{ cursor: "pointer" }}
              >
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="icon-container mb-3 text-info">
                    <i className="fas fa-file-alt fa-3x"></i>
                  </div>
                  <Card.Title className="text-center mb-3">
                    Yearly Reports
                  </Card.Title>
                  <h3 className="text-center mb-0">
                    <i className="fas fa-external-link-alt"></i>
                  </h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Section */}
          <ChartSection
            theme={theme}
            co2ReductionRef={co2ReductionRef}
            co2EmissionsByDateRef={co2EmissionsByDateRef}
            co2EmissionsByCategoryRef={co2EmissionsByCategoryRef}
            co2EmissionsTrendRef={co2EmissionsTrendRef}
            co2Reduction={co2Reduction}
            co2EmissionsByDate={co2EmissionsByDate}
            co2EmissionsByDateSeries={co2EmissionsByDateSeries}
            co2EmissionsByCategory={co2EmissionsByCategory}
            co2EmissionsByCategorySeries={co2EmissionsByCategorySeries}
            co2EmissionsTrend={co2EmissionsTrend}
            isGeneratingPDF={isGeneratingPDF}
            downloadAllPDFs={downloadAllPDFs}
          />

          {/* Energy Leaderboard */}
          <div className="col-xl-12 col-lg-12 col-md-12 mb-4">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
