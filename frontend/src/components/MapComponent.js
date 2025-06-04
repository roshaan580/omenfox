import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { REACT_APP_API_URL } from "../config";

// Fix for default marker icon issue in React with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to update the map view when location changes
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, map, zoom]);

  return null;
};

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelected }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      if (onLocationSelected) {
        try {
          // Use our proxy to avoid CORS issues
          const response = await fetch(
            `${REACT_APP_API_URL}/rdw/reverse-geocode?lat=${lat}&lon=${lng}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch location data");
          }

          const data = await response.json();

          onLocationSelected({
            lat: parseFloat(lat),
            lon: parseFloat(lng),
            address: data.display_name,
            placeId: data.place_id,
            addressComponents: data.address,
          });
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          onLocationSelected({
            lat: parseFloat(lat),
            lon: parseFloat(lng),
            address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
          });
        }
      }
    },
  });

  return null;
};

/**
 * A reusable map component with marker
 */
const MapComponent = ({
  location,
  onLocationSelected,
  height = "300px",
  width = "100%",
  defaultZoom = 13,
  showMarker = true,
  className = "",
  popupContent = null,
}) => {
  // Initialize position with location data or default to London
  const [position, setPosition] = useState(() => {
    if (location?.lat && location?.lon) {
      return [parseFloat(location.lat), parseFloat(location.lon)];
    }
    return [51.505, -0.09]; // Default to London
  });

  // Update position when location changes
  useEffect(() => {
    if (location?.lat && location?.lon) {
      const newPosition = [parseFloat(location.lat), parseFloat(location.lon)];
      setPosition(newPosition);
    }
  }, [location]);

  return (
    <div className={className} style={{ height, width }}>
      <MapContainer
        center={position}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapUpdater center={position} zoom={defaultZoom} />

        {showMarker && location && (
          <Marker position={position}>
            {popupContent ? (
              <Popup>{popupContent}</Popup>
            ) : location?.address ? (
              <Popup>{location.address}</Popup>
            ) : null}
          </Marker>
        )}

        {onLocationSelected && (
          <MapClickHandler onLocationSelected={onLocationSelected} />
        )}
      </MapContainer>
    </div>
  );
};

MapComponent.propTypes = {
  location: PropTypes.shape({
    lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    lon: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    address: PropTypes.string,
  }),
  onLocationSelected: PropTypes.func,
  height: PropTypes.string,
  width: PropTypes.string,
  defaultZoom: PropTypes.number,
  showMarker: PropTypes.bool,
  className: PropTypes.string,
  popupContent: PropTypes.node,
};

export default MapComponent;
