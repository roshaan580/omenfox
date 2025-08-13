import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  Alert,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { MdClose } from "react-icons/md";

const WikiEditor = ({ wiki, onSave, onCancel, token }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [],
  });
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (wiki) {
      setFormData({
        title: wiki.title || "",
        content: wiki.content || "",
        tags: wiki.tags || [],
      });
    } else {
      setFormData({
        title: "",
        content: "",
        tags: [],
      });
    }
  }, [wiki]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      // Capitalize the first letter of each word in the tag
      const capitalizedTag = newTag.trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Check if the capitalized tag already exists (case-insensitive)
      const tagExists = formData.tags.some(tag => 
        tag.toLowerCase() === capitalizedTag.toLowerCase()
      );
      
      if (!tagExists) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, capitalizedTag],
        }));
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = wiki
        ? `${API_BASE_URL}/wiki/${wiki._id}`
        : `${API_BASE_URL}/wiki`;
      const method = wiki ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSave();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to save wiki article");
      console.error("Error saving wiki:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          {wiki ? "Edit Wiki Article" : "Create New Wiki Article"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter article title"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Content *</Form.Label>
            <Form.Control
              as="textarea"
              rows={12}
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your article content here..."
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tags</Form.Label>
            <InputGroup className="mb-2">
              <Form.Control
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
              />
              <Button variant="outline-secondary" className="m-0" style={{ transform: "none" }} onClick={handleAddTag}>
                <FaPlus />
              </Button>
            </InputGroup>
            <div>
              {formData.tags.map((tag, index) => (
                <Badge
                  key={index}
                  bg="success"
                  className="me-2 mb-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} <MdClose/>
                </Badge>
              ))}
            </div>
            <Form.Text className="text-muted">
              Click on a tag to remove it. Press Enter to add a tag. Tags will be automatically capitalized.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || !formData.title.trim() || !formData.content.trim()}
        >
          {loading ? "Saving..." : wiki ? "Update" : "Create"}
        </Button>
      </Modal.Footer>
    </>
  );
};

export default WikiEditor;