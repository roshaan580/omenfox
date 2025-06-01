import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import LocationAutocomplete from "./LocationAutocomplete";
import MapComponent from "./MapComponent";

const LocationPicker = ({
  value,
  onChange,
  label,
  required = false,
  placeholder = "Search for a location",
  mapHeight = "250px",
  className = "",
  error = "",
  disabled = false,
}) => {
  const [location, setLocation] = useState(() => {
    // Initialize with properly parsed coordinates
    if (value) {
      return {
        address: value.address || "",
        lat: parseFloat(value.lat) || 0,
        lon: parseFloat(value.lon) || 0,
      };
    }
    return null;
  });

  // Update local state when prop changes
  useEffect(() => {
    if (value) {
      setLocation({
        address: value.address || "",
        lat: parseFloat(value.lat) || 0,
        lon: parseFloat(value.lon) || 0,
      });
    }
  }, [value]);

  // Memoize the location update handler
  const handleLocationUpdate = useCallback(
    (newLocation) => {
      if (newLocation) {
        const parsedLocation = {
          address: newLocation.address || "",
          lat: parseFloat(newLocation.lat) || 0,
          lon: parseFloat(newLocation.lon) || 0,
        };
        setLocation(parsedLocation);
        if (onChange) {
          onChange(parsedLocation);
        }
      }
    },
    [onChange]
  );

  return (
    <div className={`location-picker ${className}`}>
      <LocationAutocomplete
        value={location}
        onSelect={handleLocationUpdate}
        placeholder={placeholder}
        label={label}
        required={required}
        disabled={disabled}
        errorMessage={error}
      />

      <div className="mt-2">
        <MapComponent
          location={location}
          onLocationSelected={handleLocationUpdate}
          height={mapHeight}
          className="rounded border"
          showMarker={true}
          defaultZoom={13}
        />
        {location && (
          <small className="form-text text-muted mt-1">
            Click anywhere on the map to change the location
          </small>
        )}
      </div>
    </div>
  );
};

LocationPicker.propTypes = {
  value: PropTypes.shape({
    address: PropTypes.string,
    lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    lon: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  onChange: PropTypes.func,
  label: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  mapHeight: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

export default LocationPicker;
