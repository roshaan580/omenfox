import { Modal, Badge, Button } from "react-bootstrap";
import { FaUser, FaCalendar, FaTag } from "react-icons/fa";

const WikiViewer = ({ wiki, onClose, onEdit }) => {
  if (!wiki) return null;

  // Simple text formatting - preserve line breaks only
  const formatContent = (content) => {
    return content.replace(/\n/g, "<br>");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title className="text-truncate">
          {wiki.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Article Meta Information */}
        <div className="mb-4 p-3 rounded wiki-meta-info">
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                <FaUser style={{minWidth: "16px"}} className="me-2 text-muted" />
                <span>
                  <strong>Author:</strong> {wiki.author?.name || wiki.author?.username || "Unknown"}
                </span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <FaCalendar style={{minWidth: "16px"}} className="me-2 text-muted" />
                <span>
                  <strong>Created:</strong> {formatDate(wiki.createdAt)}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              {wiki.lastModified && wiki.lastModified !== wiki.createdAt && (
                <div className="d-flex align-items-center mb-2">
                  <FaCalendar style={{minWidth: "16px"}} className="me-2 text-muted" />
                  <span>
                    <strong>Last Modified:</strong> {formatDate(wiki.lastModified)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {wiki.tags && wiki.tags.length > 0 && (
            <div className="mt-3">
              <div className="d-flex align-items-center">
                <FaTag style={{minWidth: "16px"}} className="min-w-3 me-2 text-muted" />
                <strong className="me-2">Tags:</strong>
                <div className="d-flex flex-wrap gap-1">
                  {wiki.tags.map((tag, index) => (
                    <Badge key={index} bg="light" text="dark">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="wiki-content">
          <div
            dangerouslySetInnerHTML={{
              __html: formatContent(wiki.content),
            }}
            style={{
              lineHeight: "1.6",
              fontSize: "16px",
              whiteSpace: "pre-wrap",
            }}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        {onEdit && (
          <Button variant="success" onClick={onEdit}>
            Edit Article
          </Button>
        )}
      </Modal.Footer>
    </>
  );
};

export default WikiViewer;