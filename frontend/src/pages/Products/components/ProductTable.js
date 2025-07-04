import React from "react";
import { FaCopy, FaCheck } from "react-icons/fa";

const ProductTable = ({ products, openEditModal, handleDeleteProduct }) => {
  const [copiedId, setCopiedId] = React.useState(null);

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Category</th>
            <th>CO₂ Value</th>
            <th>Manufacturer</th>
            <th>Origin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>
                {product.size} {product.unit}
              </td>
              <td>{product.category}</td>
              <td>{product.co2Value} kg CO₂</td>
              <td>{product.manufacturer}</td>
              <td>{product.origin}</td>
              <td className="text-center">
                <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => openEditModal(product)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await navigator.clipboard.writeText(
                        JSON.stringify(product, null, 2)
                      );
                      setCopiedId(product._id);
                      setTimeout(() => setCopiedId(null), 1000);
                    }}
                    title={copiedId === product._id ? "Copied!" : "Copy"}
                  >
                    {copiedId === product._id ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
