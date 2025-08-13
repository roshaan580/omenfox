import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Badge,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaBook, FaTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { REACT_APP_API_URL } from "../../config";
import { authenticatedFetch } from "../../utils/axiosConfig";
import Sidebar from "../../components/Sidebar";
import TablePagination from "../../components/TablePagination";
import WikiEditor from "./WikiEditor";
import WikiViewer from "./WikiViewer";
import "./Wiki.css";

const Wiki = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [wikis, setWikis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [availableTags, setAvailableTags] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedWiki, setSelectedWiki] = useState(null);
  const [editingWiki, setEditingWiki] = useState(null);

  const API_BASE_URL = REACT_APP_API_URL || "http://localhost:5000/api";

  // Fetch wikis with improved search
  const fetchWikis = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
      });

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const response = await fetch(`${API_BASE_URL}/wiki?${params}`);
      const data = await response.json();

      if (data.success) {
        setWikis(data.data);
        setTotalPages(data.pagination.pages);
        setTotalRecords(data.pagination.total);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch wiki articles");
      console.error("Error fetching wikis:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, API_BASE_URL]);

  // Fetch all tags for the filter dropdown
  const fetchAllTags = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/wiki?limit=1000`);
      const data = await response.json();
      
      if (data.success) {
        const allTags = data.data.reduce((tags, wiki) => {
          if (wiki.tags && wiki.tags.length > 0) {
            wiki.tags.forEach(tag => {
              if (!tags.includes(tag)) {
                tags.push(tag);
              }
            });
          }
          return tags;
        }, []);
        setAvailableTags(["All", ...allTags.sort()]);
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  }, [API_BASE_URL]);

  // Authentication and initialization
  useEffect(() => {
    document.body.className = `${theme}-theme`;

    const fetchUserData = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
          console.log("No token found, redirecting to login");
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

        if (storedToken && userObj) {
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
              setToken(storedToken);
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

    fetchUserData();
  }, [navigate, theme]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchWikis();
    }, 300); // 300ms delay for debouncing

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentPage, itemsPerPage, fetchWikis]);

  // Initial load and tag fetching
  useEffect(() => {
    fetchAllTags();
  }, [fetchAllTags]);

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

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle search form submit (for Enter key)
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchWikis();
  };

  // Handle tag filter
  const handleTagFilter = (tag) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  // Filter wikis by selected tag
  const filteredWikis = selectedTag === "All" 
    ? wikis 
    : wikis.filter(wiki => wiki.tags && wiki.tags.includes(selectedTag));

  // Calculate pagination values for filtered results
  const filteredTotal = filteredWikis.length;
  const startIndex = 0; // Since we're showing all filtered results
  const endIndex = filteredTotal - 1;

  // Handle view wiki
  const handleViewWiki = async (wikiId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/wiki/${wikiId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedWiki(data.data);
        setShowViewer(true);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch wiki article");
      console.error("Error fetching wiki:", err);
    }
  };

  // Handle edit wiki
  const handleEditWiki = (wiki) => {
    setEditingWiki(wiki);
    setShowEditor(true);
  };

  // Handle delete wiki
  const handleDeleteWiki = async (wikiId) => {
    if (!window.confirm("Are you sure you want to delete this wiki article?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/wiki/${wikiId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchWikis();
        fetchAllTags(); // Refresh tags after deletion
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to delete wiki article");
      console.error("Error deleting wiki:", err);
    }
  };

  // Handle wiki save
  const handleWikiSave = () => {
    setShowEditor(false);
    setEditingWiki(null);
    fetchWikis();
    fetchAllTags(); // Refresh tags after save
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Truncate content
  const truncateContent = (content, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
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
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-1 mb-4">
            <h1>
              Wiki Knowledge Base
            </h1>
            {userData && (
              <Button
                variant="outline-success"
                className="d-flex align-items-center gap-2"
                onClick={() => {
                  setEditingWiki(null);
                  setShowEditor(true);
                }}
              >
                <FaPlus />
                New Article
              </Button>
            )}
          </div>

          {/* Search and Tag Filter */}
          <Card className={`bg-${theme} m-0 mb-4`}>
            <Card.Body className="p-3">
              <Form onSubmit={handleSearch}>
                <Row className="g-2">
                  <Col md={8}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search wiki articles... (type to search instantly)"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                      <Button variant="outline-secondary" style={{ transform: "none" }} type="submit">
                        <FaSearch />
                      </Button>
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      value={selectedTag}
                      onChange={(e) => handleTagFilter(e.target.value)}
                      style={{ cursor: "pointer"}}
                    >
                      {availableTags.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag === "All" ? "All Tags" : tag}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Wiki Articles Cards */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : filteredWikis.length === 0 ? (
            <Card className={`bg-${theme} m-0`}>
              <Card.Body className="text-center py-5">
                <FaBook size={48} className="text-muted mb-3" />
                <h5>No wiki articles found</h5>
                <p className="text-muted">
                  {searchTerm || selectedTag !== "All"
                    ? "Try adjusting your search or filter criteria"
                    : "Be the first to create a wiki article!"}
                </p>
              </Card.Body>
            </Card>
          ) : (
            <>
              <Row>
                {filteredWikis.map((wiki) => (
                  <Col key={wiki._id} lg={6} xl={4} className="mb-4">
                    <Card className={`bg-${theme} h-100 m-0 wiki-card`}>
                      <Card.Body className="d-flex flex-column">
                        <div className="flex-grow-1">
                          <Card.Title 
                            className="wiki-title mb-3"
                            onClick={() => handleViewWiki(wiki._id)}
                            style={{ cursor: "pointer" }}
                          >
                            {wiki.title}
                          </Card.Title>
                          
                          <Card.Text className="text-muted mb-3">
                            {truncateContent(wiki.content)}
                          </Card.Text>

                          <div className="mb-3">
                            <small className="text-muted">
                              <strong>By:</strong> {wiki.author?.name || wiki.author?.username || "Unknown Author"}
                            </small>
                            <br />
                            <small className="text-muted">
                              <strong>Created:</strong> {formatDate(wiki.createdAt)}
                            </small>
                          </div>

                          {wiki.tags && wiki.tags.length > 0 && (
                            <div className="mb-3">
                              <FaTag className="me-2 text-muted" />
                              {wiki.tags.slice(0, 3).map((tag, index) => (
                                <Badge
                                  key={index}
                                  bg="light"
                                  text="dark"
                                  className="me-1 mb-1"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleTagFilter(tag)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {wiki.tags.length > 3 && (
                                <Badge bg="light" text="dark" className="me-1">
                                  +{wiki.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mt-auto">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="d-flex align-items-center justify-content-center gap-1 m-0"
                            onClick={() => handleViewWiki(wiki._id)}
                            style={{ padding: "6px 8px" }}
                          >
                            <FaEye />
                            Read
                          </Button>
                          
                          {userData &&
                            (userData.role === "admin" ||
                              wiki.author?._id === userData.id) && (
                              <div className="d-flex flex-wrap gap-2">
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="m-0"
                                  style={{ padding: "6px" }}
                                  onClick={() => handleEditWiki(wiki)}
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="m-0"
                                  style={{ padding: "6px" }}
                                  onClick={() => handleDeleteWiki(wiki._id)}
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Custom Table Pagination */}
              <TablePagination
                currentPage={currentPage}
                onPageChange={handlePageChange}
                totalPages={totalPages}
                recordsPerPage={itemsPerPage}
                onRecordsPerPageChange={handleItemsPerPageChange}
                totalRecords={selectedTag === "All" ? totalRecords : filteredTotal}
                startIndex={selectedTag === "All" ? (currentPage - 1) * itemsPerPage : startIndex}
                endIndex={selectedTag === "All" ? Math.min(currentPage * itemsPerPage - 1, totalRecords - 1) : endIndex}
                theme={theme}
                pageSizeOptions={[5, 10, 15, 25, 50]}
              />
            </>
          )}
        </div>

        {/* Wiki Editor Modal */}
        <Modal
          show={showEditor}
          onHide={() => {
            setShowEditor(false);
            setEditingWiki(null);
          }}
          size="xl"
          centered
        >
          <WikiEditor
            wiki={editingWiki}
            onSave={handleWikiSave}
            onCancel={() => {
              setShowEditor(false);
              setEditingWiki(null);
            }}
            token={token}
          />
        </Modal>

        {/* Wiki Viewer Modal */}
        <Modal
          show={showViewer}
          onHide={() => {
            setShowViewer(false);
            setSelectedWiki(null);
          }}
          size="xl"
          centered
        >
          <WikiViewer
            wiki={selectedWiki}
            onClose={() => {
              setShowViewer(false);
              setSelectedWiki(null);
            }}
            onEdit={
              userData &&
              selectedWiki &&
              (userData.role === "admin" ||
                selectedWiki.author?._id === userData.id)
                ? () => {
                    setShowViewer(false);
                    handleEditWiki(selectedWiki);
                  }
                : null
            }
          />
        </Modal>
      </div>
    </div>
  );
};

export default Wiki;