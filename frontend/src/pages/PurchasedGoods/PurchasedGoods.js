import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../../config";
import { authenticatedFetch } from "../../utils/axiosConfig";
import Sidebar from "../../components/Sidebar";
import { FaPlusCircle } from "react-icons/fa";

// Import components
import ProductsByCategoryTable from "./components/ProductsByCategoryTable";

const PurchasedGoodsPage = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Add Sidebar state variables
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found in Purchased Goods page, redirecting to login");
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

  // Fetch products data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching purchased goods data...");
        
        // Store JWT_ADMIN_SECRET in localStorage for axiosConfig to use
        localStorage.setItem("JWT_ADMIN_SECRET", JWT_ADMIN_SECRET);

        const response = await authenticatedFetch(`${REACT_APP_API_URL}/products`, {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }

      } catch (error) {
        console.error("Error fetching purchased goods data:", error);
        setError(`Failed to fetch data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchData();
    }
  }, [userData]);

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

  const handleManageProducts = () => {
    navigate("/products");
  };

  const calculateTotalEmissions = () => {
    return products.reduce((total, product) => {
      return total + (parseFloat(product.co2Value) || 0);
    }, 0);
  };

  const getProductsByCategory = () => {
    const categories = {};
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(product);
    });
    return categories;
  };

  const getCategoryEmissions = (categoryProducts) => {
    return categoryProducts.reduce((total, product) => {
      return total + (parseFloat(product.co2Value) || 0);
    }, 0);
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
            <div>
              <h1>Purchased Goods (Scope 3)</h1>
              <p className="text-muted mb-0">
                Indirect emissions from purchased goods and services in the supply chain
              </p>
            </div>
            <Button variant="outline-success" onClick={handleManageProducts}>
              <FaPlusCircle className="me-2" /> Manage Products
            </Button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Information Card */}
          <div className="row mb-4">
            <div className="col-12">
              <div className={`card bg-${theme} m-0 shadow-sm`}>
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fas fa-shopping-cart text-primary me-2"></i>
                    About Purchased Goods Emissions (Scope 3)
                  </h5>
                  <p>
                    Scope 3 emissions from purchased goods include all upstream emissions from the production 
                    of goods and services purchased by your organization. This includes:
                  </p>
                  <div className="row">
                    <div className="col-md-6">
                      <ul className="small">
                        <li>Raw material extraction and processing</li>
                        <li>Manufacturing and assembly</li>
                        <li>Packaging materials</li>
                        <li>Transportation to supplier</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="small">
                        <li>Office supplies and equipment</li>
                        <li>IT hardware and software</li>
                        <li>Professional services</li>
                        <li>Maintenance and repair services</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className={`card bg-${theme} m-0 shadow-sm h-100`}>
                <div className="card-body text-center">
                  <div className="icon-container mb-3 text-primary">
                    <i className="fas fa-boxes fa-3x"></i>
                  </div>
                  <h3 className="text-primary">{products.length}</h3>
                  <p className="mb-0">Total Products</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className={`card bg-${theme} m-0 shadow-sm h-100`}>
                <div className="card-body text-center">
                  <div className="icon-container mb-3 text-success">
                    <i className="fas fa-leaf fa-3x"></i>
                  </div>
                  <h3 className="text-success">{calculateTotalEmissions().toFixed(2)}</h3>
                  <p className="mb-0">Total CO₂ (kg)</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className={`card bg-${theme} m-0 shadow-sm h-100`}>
                <div className="card-body text-center">
                  <div className="icon-container mb-3 text-warning">
                    <i className="fas fa-tags fa-3x"></i>
                  </div>
                  <h3 className="text-warning">{Object.keys(getProductsByCategory()).length}</h3>
                  <p className="mb-0">Categories</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products by Category */}
          <div className="row">
            <div className="col-12">
              <div className={`card bg-${theme} m-0 shadow-sm`}>
                <div className="card-body">
                  <h5 className="card-title">Purchased Goods by Category</h5>
                  
                  {loading ? (
                    <div className="d-flex justify-content-center my-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {Object.keys(getProductsByCategory()).length > 0 ? (
                        Object.entries(getProductsByCategory()).map(([category, categoryProducts]) => (
                          <ProductsByCategoryTable
                            key={category}
                            theme={theme}
                            category={category}
                            categoryProducts={categoryProducts}
                            categoryEmissions={getCategoryEmissions(categoryProducts)}
                          />
                        ))
                      ) : (
                        <div className="text-center text-muted py-5">
                          <i className="fas fa-shopping-cart fa-3x mb-3"></i>
                          <h5>No purchased goods found</h5>
                          <p>Add products to track your Scope 3 emissions from purchased goods.</p>
                          <Button variant="primary" onClick={handleManageProducts}>
                            <FaPlusCircle className="me-2" /> Add Products
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasedGoodsPage;