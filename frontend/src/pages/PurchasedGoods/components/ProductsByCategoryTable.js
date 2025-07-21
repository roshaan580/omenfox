import { useState, useEffect } from "react";
import TablePagination from "../../../components/TablePagination";
import usePagination from "../../../hooks/usePagination";

const ProductsByCategoryTable = ({
  theme,
  categoryProducts,
  category,
  categoryEmissions,
}) => {
  const [sortedProducts, setSortedProducts] = useState([]);

  // Sort products by name
  useEffect(() => {
    if (categoryProducts && categoryProducts.length > 0) {
      const sorted = [...categoryProducts].sort((a, b) => {
        return (a.name || "").localeCompare(b.name || "");
      });
      setSortedProducts(sorted);
    } else {
      setSortedProducts([]);
    }
  }, [categoryProducts]);

  // Use pagination hook with sorted products
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    paginate,
    changeItemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
    totalItems,
  } = usePagination(sortedProducts);

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="text-primary mb-0">
          <i className="fas fa-folder me-2"></i>
          {category}
        </h6>
        <span className="badge bg-success">
          {categoryEmissions.toFixed(2)} kg CO₂
        </span>
      </div>
      
      <div className="table-responsive">
        <table className="table table-sm table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Product Name</th>
              <th>Size</th>
              <th>CO₂ Value (kg)</th>
              <th>Manufacturer</th>
              <th>Origin</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((product, index) => (
              <tr key={product._id || index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>{product.name}</td>
                <td>{product.size} {product.unit}</td>
                <td>
                  <span className="badge bg-secondary">
                    {product.co2Value} kg CO₂
                  </span>
                </td>
                <td>{product.manufacturer}</td>
                <td>{product.origin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination component */}
      {sortedProducts.length > itemsPerPage && (
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
    </div>
  );
};

export default ProductsByCategoryTable; 