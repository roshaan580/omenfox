import React from "react";
import { Modal, Button } from "react-bootstrap";

const DeleteConfirmationModal = ({
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleDelete,
}) => {
  return (
    <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete this travel & commute emission record?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
