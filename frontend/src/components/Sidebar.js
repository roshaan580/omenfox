import { useState, useEffect, useCallback, memo } from "react";
import { CiLogout } from "react-icons/ci";
import {
  FaBars,
  FaShippingFast,
  FaCog,
  FaBuilding,
  FaGasPump,
  FaBoxOpen,
  FaRoute,
} from "react-icons/fa";
import { MdManageAccounts, MdTravelExplore, MdDashboard } from "react-icons/md";
import { BsCloudHaze2Fill } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoWhite from "../assets/logo-white.png";
import LogoBlack from "../assets/logo-black.png";
import { Button } from "react-bootstrap";
import NewMeasurementModal from "./NewMeasurementModal";

// Reusable MenuItem Component
const MenuItem = ({ icon, title, isExpanded, isSidebarOpen, onToggle }) => {
  return (
    <div
      className={`nav-item px-3 py-2 d-flex align-items-center justify-content-between ${
        isExpanded ? "active" : ""
      }`}
      onClick={onToggle}
      style={{ cursor: "pointer" }}
    >
      <div
        className={`d-flex align-items-center ${
          !isSidebarOpen && "justify-content-center w-100"
        }`}
      >
        <span className="nav-icon me-0">{icon}</span>
        {isSidebarOpen && <span className="nav-text ms-2">{title}</span>}
      </div>
      {isSidebarOpen && (
        <i className={`fas fa-chevron-${isExpanded ? "up" : "down"}`}></i>
      )}
    </div>
  );
};

// SubMenuItem Component for route navigation
const NavLinkItem = ({ to, isActive, onClick, children }) => {
  return (
    <Link
      to={to}
      className={`submenu-item px-3 py-2 d-block ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

// Button SubMenuItem Component for modal triggers - memoized to prevent unnecessary re-renders
const ButtonItem = memo(({ onClick, children }) => {
  return (
    <button
      className="submenu-item px-3 py-2 d-block w-100 text-start border-0 bg-transparent"
      onClick={(e) => {
        // Stop propagation to prevent parent elements from receiving the event
        e.stopPropagation();
        onClick(e);
      }}
    >
      {children}
    </button>
  );
});

// Standalone Dashboard Item Component
const DashboardItem = ({ isSidebarOpen, isActive, handleNavigation }) => {
  return (
    <Link
      to="/dashboard"
      className={`nav-item px-3 py-2 d-flex align-items-center ${
        isActive("/dashboard") ? "active" : ""
      }`}
      onClick={handleNavigation("/dashboard", true)}
    >
      <div
        className={`d-flex align-items-center ${
          !isSidebarOpen && "justify-content-center w-100"
        }`}
      >
        <span className="nav-icon me-0">
          <MdDashboard size={22} />
        </span>
        {isSidebarOpen && <span className="nav-text ms-2">Dashboard</span>}
      </div>
    </Link>
  );
};

// User Dashboard Item Component
const UserDashboardItem = ({ isSidebarOpen, isActive, handleNavigation }) => {
  return (
    <Link
      to="/user-dashboard"
      className={`nav-item px-3 py-2 d-flex align-items-center ${
        isActive("/user-dashboard") ? "active" : ""
      }`}
      onClick={handleNavigation("/user-dashboard", false, false)}
    >
      <div
        className={`d-flex align-items-center ${
          !isSidebarOpen && "justify-content-center w-100"
        }`}
      >
        <span className="nav-icon me-0">
          <MdDashboard size={22} />
        </span>
        {isSidebarOpen && <span className="nav-text ms-2">Dashboard</span>}
      </div>
    </Link>
  );
};

// Scope 1 Menu - Direct Emissions
const Scope1Menu = ({
  isSidebarOpen,
  expandedItem,
  toggleExpand,
  isActive,
  handleNavigation,
}) => {
  return (
    <div className="nav-group mb-1">
      <MenuItem
        icon={<BsCloudHaze2Fill size={22} />}
        title="Scope 1"
        isExpanded={expandedItem === "scope1"}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => toggleExpand("scope1")}
      />

      {isSidebarOpen && expandedItem === "scope1" && (
        <div className="submenu">
          <NavLinkItem
            to="/mobile-combustion"
            isActive={isActive("/mobile-combustion")}
            onClick={handleNavigation("/mobile-combustion", true)}
          >
            Mobile Combustion
          </NavLinkItem>
          <NavLinkItem
            to="/stationary-combustion"
            isActive={isActive("/stationary-combustion")}
            onClick={handleNavigation("/stationary-combustion", true)}
          >
            Stationary Combustion
          </NavLinkItem>
        </div>
      )}
    </div>
  );
};

// Scope 2 Menu - Indirect Emissions from Purchased Energy
const Scope2Menu = ({
  isSidebarOpen,
  expandedItem,
  toggleExpand,
  isActive,
  handleNavigation,
}) => {
  return (
    <div className="nav-group mb-1">
      <MenuItem
        icon={<FaGasPump size={22} />}
        title="Scope 2"
        isExpanded={expandedItem === "scope2"}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => toggleExpand("scope2")}
      />

      {isSidebarOpen && expandedItem === "scope2" && (
        <div className="submenu">
          <NavLinkItem
            to="/energy-emissions"
            isActive={isActive("/energy-emissions")}
            onClick={handleNavigation("/energy-emissions", true)}
          >
            Purchased Energy and Gases
          </NavLinkItem>
        </div>
      )}
    </div>
  );
};

// Scope 3 Menu - Other Indirect Emissions
const Scope3Menu = ({
  isSidebarOpen,
  expandedItem,
  toggleExpand,
  isActive,
  handleNavigation,
}) => {
  return (
    <div className="nav-group mb-1">
      <MenuItem
        icon={<MdTravelExplore size={22} />}
        title="Scope 3"
        isExpanded={expandedItem === "scope3"}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => toggleExpand("scope3")}
      />

      {isSidebarOpen && expandedItem === "scope3" && (
        <div className="submenu">
          <NavLinkItem
            to="/travel-and-commute"
            isActive={isActive("/travel-and-commute")}
            onClick={handleNavigation("/travel-and-commute", true)}
          >
            Travel & Commute
          </NavLinkItem>
          <NavLinkItem
            to="/purchased-goods"
            isActive={isActive("/purchased-goods")}
            onClick={handleNavigation("/purchased-goods", true)}
          >
            Purchased Goods
          </NavLinkItem>
          <NavLinkItem
            to="/freight-transport"
            isActive={isActive("/freight-transport")}
            onClick={handleNavigation("/freight-transport", true)}
          >
            Freight Transport
          </NavLinkItem>
        </div>
      )}
    </div>
  );
};

// Admin Greenhouse & Emissions Menu (keeping for backward compatibility)
const GreenhouseEmissionsMenu = ({
  isSidebarOpen,
  expandedItem,
  toggleExpand,
  isActive,
  handleNavigation,
}) => {
  return (
    <div className="nav-group mb-1">
      <MenuItem
        icon={<BsCloudHaze2Fill size={22} />}
        title="Greenhouse & Emissions"
        isExpanded={expandedItem === "emissions"}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => toggleExpand("emissions")}
      />

      {isSidebarOpen && expandedItem === "emissions" && (
        <div className="submenu">
          <NavLinkItem
            to="/emissions"
            isActive={isActive("/emissions")}
            onClick={handleNavigation("/emissions", true)}
          >
            Emissions
          </NavLinkItem>
          <NavLinkItem
            to="/transport-emissions"
            isActive={isActive("/transport-emissions")}
            onClick={handleNavigation("/transport-emissions", true)}
          >
            Transport Emissions
          </NavLinkItem>
        </div>
      )}
    </div>
  );
};

// Admin Purchased Goods Menu
const PurchasedGoodsMenu = ({
  isSidebarOpen,
  expandedItem,
  toggleExpand,
  isActive,
  handleNavigation,
}) => {
  return (
    <div className="nav-group mb-1">
      <MenuItem
        icon={<FaBuilding size={22} />}
        title="Purchased Goods"
        isExpanded={expandedItem === "products"}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => toggleExpand("products")}
      />

      {isSidebarOpen && expandedItem === "products" && (
        <div className="submenu">
          <NavLinkItem
            to="/products"
            isActive={isActive("/products")}
            onClick={handleNavigation("/products", true)}
          >
            Products
          </NavLinkItem>
        </div>
      )}
    </div>
  );
};

// Admin Freight Transports Menu
const FreightTransportsMenu = ({
  isSidebarOpen,
  expandedItem,
  toggleExpand,
  isActive,
  handleNavigation,
}) => {
  return (
    <div className="nav-group mb-1">
      <MenuItem
        icon={<FaShippingFast size={22} />}
        title="Freight Transports"
        isExpanded={expandedItem === "freight"}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => toggleExpand("freight")}
      />

      {isSidebarOpen && expandedItem === "freight" && (
        <div className="submenu">
          <NavLinkItem
            to="/admin-user-transport"
            isActive={isActive("/admin-user-transport")}
            onClick={handleNavigation("/admin-user-transport", true)}
          >
            User Transport Records
          </NavLinkItem>
          <NavLinkItem
            to="/admin-transport-emissions"
            isActive={isActive("/admin-transport-emissions")}
            onClick={handleNavigation("/admin-transport-emissions", true)}
          >
            User Freight Transport
          </NavLinkItem>
        </div>
      )}
    </div>
  );
};

// Admin Management Menu
const ManagementMenu = ({
  isSidebarOpen,
  expandedItem,
  toggleExpand,
  isActive,
  handleNavigation,
}) => {
  return (
    <div className="nav-group mb-1">
      <MenuItem
        icon={<MdManageAccounts size={22} />}
        title="Management"
        isExpanded={expandedItem === "management"}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => toggleExpand("management")}
      />

      {isSidebarOpen && expandedItem === "management" && (
        <div className="submenu">
          <NavLinkItem
            to="/companies"
            isActive={isActive("/companies")}
            onClick={handleNavigation("/companies", true)}
          >
            Companies
          </NavLinkItem>
          <NavLinkItem
            to="/employees"
            isActive={isActive("/employees")}
            onClick={handleNavigation("/employees", true)}
          >
            Employees & Users
          </NavLinkItem>
          <NavLinkItem
            to="/vehicles"
            isActive={isActive("/vehicles")}
            onClick={handleNavigation("/vehicles", true)}
          >
            Vehicles
          </NavLinkItem>
          <NavLinkItem
            to="/emission-types"
            isActive={isActive("/emission-types")}
            onClick={handleNavigation("/emission-types", true)}
          >
            Emission Types
          </NavLinkItem>
        </div>
      )}
    </div>
  );
};

// Admin Features Menu
const FeaturesMenu = ({
  isSidebarOpen,
  expandedItem,
  toggleExpand,
  isActive,
  handleNavigation,
}) => {
  return (
    <div className="nav-group mb-1">
      <MenuItem
        icon={<FaCog size={22} />}
        title="Features"
        isExpanded={expandedItem === "features"}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => toggleExpand("features")}
      />

      {isSidebarOpen && expandedItem === "features" && (
        <div className="submenu">
          <NavLinkItem
            to="/scenarios"
            isActive={isActive("/scenarios")}
            onClick={handleNavigation("/scenarios", true)}
          >
            Scenarios
          </NavLinkItem>
          <NavLinkItem
            to="/targets"
            isActive={isActive("/targets")}
            onClick={handleNavigation("/targets", true)}
          >
            Targets
          </NavLinkItem>
          <NavLinkItem
            to="/analytics"
            isActive={isActive("/analytics")}
            onClick={handleNavigation("/analytics", true)}
          >
            Analytics
          </NavLinkItem>
          <NavLinkItem
            to="/invoices"
            isActive={isActive("/invoices")}
            onClick={handleNavigation("/invoices", true)}
          >
            Invoices
          </NavLinkItem>
          <NavLinkItem
            to="/license-plate"
            isActive={isActive("/license-plate")}
            onClick={handleNavigation("/license-plate", true)}
          >
            License Plate CO₂
          </NavLinkItem>
          <NavLinkItem
            to="/yearly-reports"
            isActive={isActive("/yearly-reports")}
            onClick={handleNavigation("/yearly-reports", true)}
          >
            Yearly Reports
          </NavLinkItem>
          <NavLinkItem
            to="/wiki"
            isActive={isActive("/wiki")}
            onClick={handleNavigation("/wiki", true)}
          >
            Wiki
          </NavLinkItem>
        </div>
      )}
    </div>
  );
};

// Employee Menu component optimized with useCallback
const EmployeeMenu = memo(
  ({
    isSidebarOpen,
    expandedItem,
    toggleExpand,
    isActive,
    handleNavigation,
  }) => {
    // Modal openers: dispatch custom events directly
    const openTransportModal = useCallback((e) => {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent("openTransportModal"));
    }, []);

    const openVehicleModal = useCallback((e) => {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent("openVehicleModal"));
    }, []);

    const openOtherResourceModal = useCallback((e) => {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent("openOtherResourceModal"));
    }, []);

    const openProfileModal = useCallback((e) => {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent("openProfileModal"));
    }, []);

    // This toggles the travel menu - we now include toggleExpand in dependencies
    const handleToggleTravelMenu = useCallback(() => {
      toggleExpand("travel");
    }, [toggleExpand]); // Include the dependency to fix the warning

    return (
      <div className="nav-group mb-1">
        <MenuItem
          icon={<MdTravelExplore size={22} />}
          title="Travel & Commute"
          isExpanded={expandedItem === "travel"}
          isSidebarOpen={isSidebarOpen}
          onToggle={handleToggleTravelMenu}
        />

        {isSidebarOpen && expandedItem === "travel" && (
          <div className="submenu">
            <ButtonItem onClick={openTransportModal}>
              <i className="fas fa-car me-2"></i>
              Add New Transport
            </ButtonItem>
            <ButtonItem onClick={openVehicleModal}>
              <i className="fas fa-plus-circle me-2"></i>
              Register Vehicle
            </ButtonItem>
            <ButtonItem onClick={openOtherResourceModal}>
              <i className="fas fa-plus me-2"></i>
              Add Energy & Gases
            </ButtonItem>
            <ButtonItem onClick={openProfileModal}>
              <i className="fas fa-user-edit me-2"></i>
              Profile
            </ButtonItem>
          </div>
        )}
      </div>
    );
  }
);

const CATEGORY_PATHS = {
  energy: "/energy-emissions",
  travel: "/travel-and-commute",
  products: "/products",
  transport: "/transport-emissions",
};
export { CATEGORY_PATHS };
const CATEGORY_LABELS = {
  energy: "Energy & Gases",
  travel: "Travel & Commute",
  products: "Purchased Goods",
  transport: "Transport Emission",
};
export { CATEGORY_LABELS };
const CATEGORY_ICONS = {
  energy: <FaGasPump className="me-2" />,
  travel: <FaRoute className="me-2" />,
  products: <FaBoxOpen className="me-2" />,
  transport: <FaShippingFast className="me-2" />,
};
export { CATEGORY_ICONS };

// Main Sidebar Component
const Sidebar = ({
  userData,
  theme,
  toggleTheme,
  handleLogout,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState(null);
  const [unauthorizedMessage, setUnauthorizedMessage] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Determine if user is admin or employee
  const isAdmin = userData?.role === "admin";
  const isEmployee = userData?.role === "employee";

  // Check if a path is active - memoized
  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  // Toggle expanded state for menu items - memoized with stable identity
  const toggleExpand = useCallback(
    (itemName) => {
      setIsSidebarOpen(true);
      setExpandedItem((prev) => (prev === itemName ? null : itemName));
    },
    [setIsSidebarOpen]
  );

  // Enhanced link handler to prevent unauthorized navigation - memoized
  const handleNavigation = useCallback(
    (path, requiresAdmin = false, requiresEmployee = false) =>
      (e) => {
        // Clear any previous unauthorized message
        setUnauthorizedMessage(null);

        // Check access permissions
        if (requiresAdmin && !isAdmin) {
          e.preventDefault();
          setUnauthorizedMessage(
            "You don't have permission to access the admin area"
          );
          setTimeout(() => setUnauthorizedMessage(null), 3000);
          return;
        }

        if (requiresEmployee && !isEmployee) {
          e.preventDefault();
          setUnauthorizedMessage(
            "You don't have permission to access the employee area"
          );
          setTimeout(() => setUnauthorizedMessage(null), 3000);
          return;
        }

        // Navigation is allowed
        navigate(path);

        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
          setIsSidebarOpen(false);
        }
      },
    [isAdmin, isEmployee, navigate, setIsSidebarOpen]
  );

  // Close sidebar on mobile devices when the component mounts
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      }
    };

    handleResize(); // Run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

  // Memoized sidebar toggle handler
  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen, setIsSidebarOpen]);

  // Handle logout with explicit stopPropagation
  const handleLogoutClick = useCallback(
    (e) => {
      e.stopPropagation();
      handleLogout();
    },
    [handleLogout]
  );

  // Handle theme toggle with explicit stopPropagation
  const handleThemeToggle = useCallback(
    (e) => {
      e.stopPropagation();
      toggleTheme();
    },
    [toggleTheme]
  );

  // Sidebar header with logo and toggle button - memoized
  const SidebarHeader = useCallback(
    () => (
      <div className="sidebar-header d-md-flex align-items-center justify-content-between">
        <button
          className={`btn sidebar-toggle d-none d-md-flex align-items-center justify-content-center ${
            isSidebarOpen ? "" : "sidebar-toggled"
          }`}
          onClick={handleSidebarToggle}
        >
          <FaBars />
        </button>
        <div
          className={`welcome-section mt-md-0 mt-4 ${
            isSidebarOpen ? "" : "d-none"
          }`}
          style={{ cursor: "pointer" }}
          onClick={() => navigate(isAdmin ? "/dashboard" : "/user-dashboard")}
        >
          <div className="sidebar-header-logo">
            {theme === "light" ? (
              <img src={LogoBlack} alt="Logo" width={128} height={71.41} />
            ) : (
              <img src={LogoWhite} alt="Logo" width={128} height={71.41} />
            )}
          </div>
        </div>
      </div>
    ),
    [isSidebarOpen, theme, handleSidebarToggle, navigate, isAdmin]
  );

  // Sidebar footer with theme toggle and logout - memoized
  const SidebarFooter = useCallback(
    () => (
      <div
        className={`sidebar-footer flex-column ${isSidebarOpen ? "" : "p-2"}`}
      >
        <button
          className={`btn ${
            theme === "light" ? "btn-outline-success" : "btn-outline-light"
          } mb-2`}
          onClick={handleThemeToggle}
        >
          {theme === "light" ? (
            <i className="fas fa-moon"></i>
          ) : (
            <i className="fas fa-sun"></i>
          )}
          {isSidebarOpen && <span className="ms-2">Toggle Theme</span>}
        </button>
        <button
          className={`btn btn-outline-danger ${isSidebarOpen ? "" : "px-1"}`}
          onClick={handleLogoutClick}
        >
          {isSidebarOpen ? (
            <>
              <CiLogout size={24} className="me-2" /> Logout
            </>
          ) : (
            <CiLogout size={24} />
          )}
        </button>
      </div>
    ),
    [isSidebarOpen, theme, handleThemeToggle, handleLogoutClick]
  );

  // Helper to determine current category
  const getCurrentCategory = () => {
    const path = location.pathname;
    if (path.startsWith("/energy-emissions")) return "energy";
    if (path.startsWith("/travel-and-commute")) return "travel";
    if (path.startsWith("/products")) return "products";
    if (path.startsWith("/transport-emissions")) return "transport";
    return null;
  };

  // Handler for New Measurement button
  const handleNewMeasurement = () => {
    const currentCategory = getCurrentCategory();
    if (currentCategory) {
      // If already in a category, dispatch event to open add modal
      window.dispatchEvent(
        new CustomEvent("openAddModal", {
          detail: { category: currentCategory },
        })
      );
    } else {
      setShowCategoryModal(true);
    }
  };

  // Handler for category selection in modal
  const handleCategorySelect = (category) => {
    setShowCategoryModal(false);
    navigate(CATEGORY_PATHS[category]);
    // After navigation, open the add modal (with a slight delay to ensure route change)
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("openAddModal", { detail: { category } })
      );
    }, 350);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="mobile-sidebar-toggle" onClick={handleSidebarToggle}>
        <FaBars />
      </button>

      {/* Unauthorized Message Alert */}
      {unauthorizedMessage && (
        <div className="unauthorized-alert">
          <div className="alert alert-danger" role="alert">
            {unauthorizedMessage}
          </div>
        </div>
      )}

      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <SidebarHeader />

        <div className="sidebar-content custom-scrollbar p-0">
          <nav className="sidebar-nav">
            {isAdmin ? (
              <>
                {/* Admin standalone Dashboard button */}
                <DashboardItem
                  isSidebarOpen={isSidebarOpen}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
                {/* New Measurement Button */}
                <div className="d-flex justify-content-center my-2">
                  <Button
                    variant="success"
                    className="w-100 fw-bold d-flex align-items-center justify-content-center"
                    style={{ borderRadius: 8 }}
                    onClick={handleNewMeasurement}
                  >
                    <i className="fas fa-plus"></i>
                    {isSidebarOpen && (
                      <span className="ms-2">New Measurement</span>
                    )}
                  </Button>
                  </div>
                {/* SCOPE-BASED ADMIN MENU */}
                <Scope1Menu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
                <Scope2Menu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
                <Scope3Menu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
                {/* Keep legacy menu for backward compatibility */}
                <GreenhouseEmissionsMenu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
                <PurchasedGoodsMenu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
                <FreightTransportsMenu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
                <ManagementMenu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
                <FeaturesMenu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
              </>
            ) : (
              <>
                {/* Employee standalone Dashboard button */}
                <UserDashboardItem
                  isSidebarOpen={isSidebarOpen}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
                {/* EMPLOYEE MENU */}
                <EmployeeMenu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
              </>
            )}
          </nav>
        </div>

        <SidebarFooter />
      </div>

      {/* Category Selection Modal */}
      <NewMeasurementModal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        theme={theme}
        CATEGORY_LABELS={CATEGORY_LABELS}
        CATEGORY_ICONS={CATEGORY_ICONS}
        handleCategorySelect={handleCategorySelect}
      />
    </>
  );
};

export default Sidebar;
