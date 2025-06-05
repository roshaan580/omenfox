import { useState, useMemo } from "react";

/**
 * Custom hook for table pagination
 *
 * @param {Array} items Array of items to paginate
 * @param {number} initialPage Initial page number (default: 1)
 * @param {number} initialItemsPerPage Initial items per page (default: 10)
 * @returns {Object} Pagination state and controls
 */
const usePagination = (
  items = [],
  initialPage = 1,
  initialItemsPerPage = 10
) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Calculate pagination indices
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Recalculate when dependencies change
  const paginatedItems = useMemo(() => {
    return items.slice(indexOfFirstItem, indexOfLastItem);
  }, [items, indexOfFirstItem, indexOfLastItem]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  // Change page
  const paginate = (pageNumber) => {
    // Make sure we don't go beyond valid page range
    if (pageNumber < 1) {
      pageNumber = 1;
    } else if (pageNumber > totalPages) {
      pageNumber = Math.max(1, totalPages);
    }

    setCurrentPage(pageNumber);
  };

  // Change items per page
  const changeItemsPerPage = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    // Reset to first page to avoid being on an invalid page
    setCurrentPage(1);
  };

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      paginate(currentPage + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      paginate(currentPage - 1);
    }
  };

  // Go to first page
  const firstPage = () => {
    paginate(1);
  };

  // Go to last page
  const lastPage = () => {
    paginate(totalPages);
  };

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    paginate,
    changeItemsPerPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    indexOfFirstItem,
    indexOfLastItem,
    totalItems: items.length,
  };
};

export default usePagination;
