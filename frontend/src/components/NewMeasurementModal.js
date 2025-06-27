import React from "react";
import { Modal } from "react-bootstrap";

const NewMeasurementModal = ({
  show,
  onHide,
  theme,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  handleCategorySelect,
}) => (
  <Modal
    show={show}
    onHide={onHide}
    centered
    dialogClassName={`category-modal-dialog${theme === "dark" ? " dark" : ""}`}
  >
    <div
      className="modal-header border-0"
      style={{ background: theme === "dark" ? "#181a1b" : "transparent" }}
    >
      <h5
        className={`modal-title w-100 text-center fs-3 fw-bold mb-0 ${
          theme === "dark" ? "text-light" : "text-dark"
        }`}
      >
        New Measurement
      </h5>
      <button
        type="button"
        className="btn-close"
        onClick={onHide}
        aria-label="Close"
      ></button>
    </div>
    <div className="modal-body px-4 py-4" style={{ borderRadius: 0 }}>
      <div className="row g-4 justify-content-center">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <div
            key={key}
            className="col-12 col-md-6 col-lg-6 d-flex justify-content-center"
          >
            <div
              className={`card bg-${theme} m-0 p-2 shadow-sm category-card d-flex flex-column align-items-center justify-content-center p-4 w-100 h-100`}
              style={{
                borderRadius: 18,
                minHeight: 140,
                cursor: "pointer",
                transition: "box-shadow 0.2s, background 0.2s",
              }}
              onClick={() => handleCategorySelect(key)}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleCategorySelect(key);
              }}
            >
              <div
                className="category-icon mb-2"
                style={{ fontSize: 38, color: "#198754" }}
              >
                {CATEGORY_ICONS[key]}
              </div>
              <div
                className={`category-label fw-bold fs-5 text-center text-${
                  theme === "dark" ? "light" : "dark"
                }`}
              >
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <style jsx>{`
      .category-modal-dialog .modal-content {
        border-radius: 22px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        background: ${theme === "dark" ? "#181a1b" : "rgba(255,255,255,0.98)"};
        border: none;
      }
      .category-card {
        transition: box-shadow 0.2s, background 0.2s, border 0.2s;
      }
      .category-card:hover,
      .category-card:focus {
        background: #e6f9ee !important;
        box-shadow: 0 6px 24px rgba(40, 167, 69, 0.13);
        border: 1.5px solid #198754 !important;
        outline: none;
      }
      .category-card.bg-dark {
        border: 1.5px solid #23272b;
        background: #23272b !important;
        color: #f8f9fa;
        box-shadow: 0 4px 16px rgba(25, 135, 84, 0.1);
      }
      .category-card.bg-dark:hover,
      .category-card.bg-dark:focus {
        background: #1a1d1f !important;
        box-shadow: 0 6px 24px rgba(25, 135, 84, 0.18);
        border: 1.5px solid #198754 !important;
        outline: none;
      }
      @media (max-width: 600px) {
        .category-card {
          min-height: 110px;
          padding: 1.2rem;
        }
        .category-label {
          font-size: 1.1rem;
        }
      }
    `}</style>
  </Modal>
);

export default NewMeasurementModal;
