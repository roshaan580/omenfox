/**
 * Pagination Implementation Guide
 *
 * This file provides examples of how to implement pagination in various tables
 * throughout the application using the usePagination hook and TablePagination component.
 */

// Example 1: Basic implementation in a table component
/**
 * Import these at the top of your file:
 * import React from "react";
 * import { Card, Table } from "react-bootstrap";
 * import TablePagination from "../../components/TablePagination";
 * import usePagination from "../../hooks/usePagination";
 *
 * Then in your component:
 */

// YourTableComponent.js
const ExampleTableComponent = ({ data, theme }) => {
  // Use the pagination hook with your data array
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems, // This contains the current page's items
    paginate,
    changeItemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
    totalItems,
  } = usePagination(data);

  return (
    <Card className={`bg-${theme} shadow-sm m-0`}>
      <Card.Body>
        <Card.Title>Your Data Table</Card.Title>
        <div className="table-responsive">
          <Table striped hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Column 1</th>
                <th>Column 2</th>
                {/* Add your column headers */}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{item.field1}</td>
                    <td>{item.field2}</td>
                    {/* Add your row data */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination controls */}
        {data.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            onPageChange={paginate}
            totalPages={totalPages}
            recordsPerPage={itemsPerPage}
            onRecordsPerPageChange={changeItemsPerPage}
            totalRecords={totalItems}
            startIndex={indexOfFirstItem}
            endIndex={indexOfLastItem}
            theme={theme}
          />
        )}
      </Card.Body>
    </Card>
  );
};

// Example 2: Using pagination with filtered data
/**
 * If your table includes filtering functionality:
 */
const ExampleFilteredTableComponent = ({ allData, theme }) => {
  // State for filters
  const [filters, setFilters] = React.useState({
    // Your filter properties
    startDate: "",
    endDate: "",
    category: "",
  });

  // Apply filters to get filtered data
  const filteredData = React.useMemo(() => {
    return allData.filter((item) => {
      // Apply your filter logic here
      return (
        (!filters.startDate ||
          new Date(item.date) >= new Date(filters.startDate)) &&
        (!filters.endDate ||
          new Date(item.date) <= new Date(filters.endDate)) &&
        (!filters.category || item.category === filters.category)
      );
    });
  }, [allData, filters]);

  // Apply pagination to filtered data
  const pagination = usePagination(filteredData);

  // When filters change, it will automatically update the paginated data

  return (
    <div>
      {/* Your filter controls */}
      <div className="filters mb-3">{/* Filter inputs */}</div>

      {/* Table with paginated data */}
      <Table striped hover>
        {/* Table headers */}
        <tbody>
          {pagination.paginatedItems.map((item, index) => (
            <tr key={item.id || index}>{/* Table row data */}</tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination component */}
      <TablePagination
        currentPage={pagination.currentPage}
        onPageChange={pagination.paginate}
        totalPages={pagination.totalPages}
        recordsPerPage={pagination.itemsPerPage}
        onRecordsPerPageChange={pagination.changeItemsPerPage}
        totalRecords={pagination.totalItems}
        startIndex={pagination.indexOfFirstItem}
        endIndex={pagination.indexOfLastItem}
        theme={theme}
      />
    </div>
  );
};

// Example 3: Using pagination with search/sort functionality
/**
 * If your table includes search and sorting:
 */
const ExampleSearchSortTableComponent = ({ data, theme }) => {
  // Search state
  const [searchTerm, setSearchTerm] = React.useState("");
  // Sort state
  const [sortConfig, setSortConfig] = React.useState({
    key: "name",
    direction: "ascending",
  });

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Sort the filtered data
  const sortedData = React.useMemo(() => {
    const sortableData = [...filteredData];
    sortableData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    return sortableData;
  }, [filteredData, sortConfig]);

  // Apply pagination to sorted data
  const pagination = usePagination(sortedData);

  return (
    <div>
      {/* Search input */}
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="form-control mb-3"
      />

      {/* Table with sortable headers */}
      <Table striped hover>
        <thead>
          <tr>
            <th>#</th>
            <th
              onClick={() =>
                setSortConfig({
                  key: "name",
                  direction:
                    sortConfig.key === "name" &&
                    sortConfig.direction === "ascending"
                      ? "descending"
                      : "ascending",
                })
              }
            >
              Name{" "}
              {sortConfig.key === "name" &&
                (sortConfig.direction === "ascending" ? "↑" : "↓")}
            </th>
            {/* More sortable headers */}
          </tr>
        </thead>
        <tbody>
          {pagination.paginatedItems.map((item, index) => (
            <tr key={item.id || index}>
              <td>{pagination.indexOfFirstItem + index + 1}</td>
              <td>{item.name}</td>
              {/* More data */}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination component */}
      <TablePagination
        currentPage={pagination.currentPage}
        onPageChange={pagination.paginate}
        totalPages={pagination.totalPages}
        recordsPerPage={pagination.itemsPerPage}
        onRecordsPerPageChange={pagination.changeItemsPerPage}
        totalRecords={pagination.totalItems}
        startIndex={pagination.indexOfFirstItem}
        endIndex={pagination.indexOfLastItem}
        theme={theme}
      />
    </div>
  );
};

/**
 * To implement pagination in an existing table component:
 *
 * 1. Import the usePagination hook and TablePagination component
 * 2. Replace any existing pagination logic with the usePagination hook
 * 3. Replace your table's data array with the paginatedItems from the hook
 * 4. Add the TablePagination component below your table
 * 5. Pass all required props to TablePagination from the usePagination hook
 *
 * This approach provides consistent pagination across all tables in the application
 * and makes it easy to maintain or update pagination functionality in the future.
 */

export {
  ExampleTableComponent,
  ExampleFilteredTableComponent,
  ExampleSearchSortTableComponent,
};
