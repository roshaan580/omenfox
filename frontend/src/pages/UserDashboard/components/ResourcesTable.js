import React from "react";
import { formatDecimal } from "../../../utils/dateUtils";
import { isRecordEditable } from "../../../utils/dateUtils";
import { Button } from "react-bootstrap";
import TablePagination from "../../../components/TablePagination";
import usePagination from "../../../hooks/usePagination";
import { FaCopy, FaCheck } from "react-icons/fa";

/**
 * Table component for displaying resource records
 */
const ResourcesTable = ({
  resources = [],
  onEdit,
  onDelete,
  theme = "light",
}) => {
  // Use pagination hook
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
  } = usePagination(resources);

  const [copiedId, setCopiedId] = React.useState(null);

  const deepOmitFields = (obj, fields) => {
    if (Array.isArray(obj)) {
      return obj.map((item) => deepOmitFields(item, fields));
    } else if (obj && typeof obj === "object") {
      const newObj = {};
      Object.keys(obj).forEach((key) => {
        if (!fields.includes(key)) {
          newObj[key] = deepOmitFields(obj[key], fields);
        }
      });
      return newObj;
    }
    return obj;
  };

  return (
    <>
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-striped table-hover mb-0">
          <thead>
            <tr>
              <th scope="col" width="5%">
                #
              </th>
              <th scope="col">Resource Type</th>
              <th scope="col">Quantity</th>
              <th scope="col">CO₂ Equivalent</th>
              <th scope="col">Date</th>
              <th scope="col" width="15%">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems?.length > 0 ? (
              paginatedItems?.map((resource, index) => (
                <tr key={resource?._id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{resource?.emissionType?.name}</td>
                  <td>{formatDecimal(resource?.quantity)}</td>
                  <td>{formatDecimal(resource?.co2Equivalent)}</td>
                  <td>{new Date(resource?.date).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex gap-2">
                      {isRecordEditable(resource) ? (
                        <>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onEdit(resource)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => onDelete(resource._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </>
                      ) : (
                        <span className="text-muted small">
                          Locked (previous year)
                        </span>
                      )}
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const toCopy = deepOmitFields(resource, [
                            "_id",
                            "createdAt",
                            "updatedAt",
                            "__v",
                          ]);
                          await navigator.clipboard.writeText(
                            JSON.stringify(toCopy, null, 2)
                          );
                          setCopiedId(resource._id);
                          setTimeout(() => setCopiedId(null), 1000);
                        }}
                        title={copiedId === resource._id ? "Copied!" : "Copy"}
                      >
                        {copiedId === resource._id ? <FaCheck /> : <FaCopy />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No resources found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination component */}
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
    </>
  );
};

export default ResourcesTable;
