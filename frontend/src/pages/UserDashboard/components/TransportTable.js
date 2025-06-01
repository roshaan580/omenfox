import React from "react";
import MapComponent from "../../../components/MapComponent";

/**
 * Table component for displaying transportation records
 */
const TransportTable = ({ records = [] }) => {
  return (
    <div className="table-responsive shadow-sm rounded">
      <table className="table table-striped table-hover mb-0">
        <thead>
          <tr>
            <th scope="col" width="5%">
              #
            </th>
            <th scope="col">Transportation Mode</th>
            <th scope="col" width="30%">
              Begin Location
            </th>
            <th scope="col" width="30%">
              End Location
            </th>
            <th scope="col">Date</th>
            <th scope="col" width="10%">
              Recurring
            </th>
          </tr>
        </thead>
        <tbody>
          {records?.length > 0 ? (
            records?.map((record, index) => (
              <tr key={record?._id}>
                <td>{index + 1}</td>
                <td>{record?.transportationMode}</td>
                <td>
                  <div className="location-cell">
                    <div className="mb-2">{record?.beginLocation}</div>
                    <div className="map-container">
                      <MapComponent
                        location={{
                          lat: parseFloat(record?.beginLocationLat) || 0,
                          lon: parseFloat(record?.beginLocationLon) || 0,
                          address: record?.beginLocation || "",
                        }}
                        height="150px"
                        width="100%"
                        showMarker={true}
                        onLocationSelected={null}
                        defaultZoom={15}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="location-cell">
                    <div className="mb-2">{record?.endLocation}</div>
                    <div className="map-container">
                      <MapComponent
                        location={{
                          lat: parseFloat(record?.endLocationLat) || 0,
                          lon: parseFloat(record?.endLocationLon) || 0,
                          address: record?.endLocation || "",
                        }}
                        height="150px"
                        width="100%"
                        showMarker={true}
                        onLocationSelected={null}
                        defaultZoom={15}
                      />
                    </div>
                  </div>
                </td>
                <td>{new Date(record?.date).toLocaleDateString()}</td>
                <td>{record?.recurring ? "Yes" : "No"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <style jsx="true">{`
        .location-cell {
          min-width: 300px;
          padding: 10px;
        }
        .map-container {
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #dee2e6;
          height: 150px;
          width: 100%;
        }
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default TransportTable;
