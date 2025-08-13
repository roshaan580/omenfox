import React from "react";
import { Pagination } from "react-bootstrap";
const TablePagination = ({
  currentPage,
  onPageChange,
  totalPages,
  recordsPerPage,
  onRecordsPerPageChange,
  totalRecords,
  startIndex,
  endIndex,
  theme = "light",
  pageSizeOptions = [5, 10, 25, 50, 100],
}) => {
  // Don't show pagination if there's only one page or fewer records than items per page
  if (totalPages <= 1 || totalRecords <= recordsPerPage) {
    return null;
  }

  // Create pagination items
  const renderPaginationItems = () => {
    const items = [];

    // Always show first page
    items.push(
      <Pagination.Item
        key={1}
        active={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        1
      </Pagination.Item>
    );

    // If there are many pages, add ellipsis after first page
    if (currentPage > 3) {
      items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
    }

    // Show pages around current page
    for (
      let number = Math.max(2, currentPage - 1);
      number <= Math.min(totalPages - 1, currentPage + 1);
      number++
    ) {
      if (number === 1 || number === totalPages) continue; // Skip first and last pages as they're always shown
      items.push(
        <Pagination.Item
          key={number}
          active={currentPage === number}
          onClick={() => onPageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // If there are many pages, add ellipsis before last page
    if (currentPage < totalPages - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  // Handle records per page change
  const handleRecordsPerPageChange = (e) => {
    onRecordsPerPageChange(Number(e.target.value));
  };

  return (
    <div
      className={`d-flex justify-content-between align-items-center gap-1 mt-3 flex-wrap ${
        theme === "dark" ? "text-light" : ""
      }`}
    >
      <div className="d-flex align-items-center">
        <span className="me-2">Show</span>
        <select
          className={`form-select form-select-sm me-2 ${
            theme === "dark" ? "bg-dark text-light border-secondary" : ""
          }`}
          style={{ width: "auto" }}
          value={recordsPerPage}
          onChange={handleRecordsPerPageChange}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>records per page</span>
      </div>

      <div className="d-flex align-items-center mt-2 mt-sm-0">
        <span className="me-3">
          Showing {startIndex + 1} to {Math.min(endIndex + 1, totalRecords)} of{" "}
          {totalRecords} records
        </span>
        <Pagination className="mb-0">
          <Pagination.Prev
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />

          {renderPaginationItems()}

          <Pagination.Next
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          />
        </Pagination>
      </div>
    </div>
  );
};

export default TablePagination;
