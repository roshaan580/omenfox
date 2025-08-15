import { REACT_APP_API_URL } from "../../../config";

export const fetchTransportationRecords = async (employeeId) => {
  try {
    // Parse user object from localStorage
    const userObj = JSON.parse(localStorage.getItem("userObj"));
    if (!userObj || !userObj._id) {
      console.error("User object not found or invalid in localStorage");
      return [];
    }

    // Fetch transportation records
    const response = await fetch(
      `${REACT_APP_API_URL}/employeeTransportations`
    );

    if (!response.ok) {
      throw new Error(`Error fetching records: ${response.statusText}`);
    }

    const records = await response.json();
    // Filter records for the logged-in user
    const filteredRecords = records.data.filter((record) => {
      const recEmpId =
        typeof record.employeeId === "object" && record.employeeId !== null
          ? record.employeeId._id
          : record.employeeId;
      return employeeId ? recEmpId === employeeId : recEmpId === userObj._id;
    });

    return {
      filteredRecords,
      allRecords: records.data,
    };
  } catch (error) {
    console.error("Error in fetching transportation records:", error);
    return { filteredRecords: [], allRecords: [] };
  }
};

/**
 * Fetches work transportation records for the logged-in user
 * @param {string} employeeId - Optional ID to filter by specific employee
 * @returns {Promise<Array>} Array of work transportation records
 */
export const fetchWorkTransportationRecords = async (employeeId) => {
  try {
    const userObj = JSON.parse(localStorage.getItem("userObj"));
    if (!userObj || !userObj._id) {
      console.error("User object not found or invalid in localStorage");
      return [];
    }

    const response = await fetch(
      `${REACT_APP_API_URL}/employeeWorkTransportations`
    );
    if (!response.ok) {
      throw new Error(`Error fetching records: ${response.statusText}`);
    }

    const records = await response.json();
    const filteredRecords = records.data.filter((record) =>
      employeeId
        ? record?.employeeId === employeeId
        : record?.employeeId === userObj._id
    );

    return {
      filteredRecords,
      allRecords: records.data,
    };
  } catch (error) {
    console.error("Error in fetching work transportation records:", error);
    return { filteredRecords: [], allRecords: [] };
  }
};

/**
 * Fetches available transportation modes
 * @returns {Promise<Array>} Array of transportation options
 */
export const fetchTransportationModes = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${REACT_APP_API_URL}/transportations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching transport data:", error);
    return [];
  }
};

/**
 * Saves a new transportation record
 * @param {Object} formData - Transportation data to save
 * @returns {Promise<Object>} Response data or error
 */
export const saveTransportationRecord = async (formData) => {
  try {
    // Validate required fields
    const requiredFields = [
      "transportationMode",
      "beginLocation",
      "endLocation",
      "date",
      "co2Emission",
      "usageType",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
    }

    // Clean up and format the data before sending
    const cleanedData = {
      ...formData,
      // Clean up location strings by removing any extra quotes
      beginLocation: formData.beginLocation.replace(/"/g, ""),
      endLocation: formData.endLocation.replace(/"/g, ""),
      // Ensure location coordinates are numbers
      beginLocationLat: parseFloat(formData.beginLocationLat) || 0,
      beginLocationLon: parseFloat(formData.beginLocationLon) || 0,
      endLocationLat: parseFloat(formData.endLocationLat) || 0,
      endLocationLon: parseFloat(formData.endLocationLon) || 0,
      // Format date
      date: new Date(formData.date).toISOString(),
      // Convert numeric fields
      co2Emission: parseFloat(formData.co2Emission) || 0,
      workFromHomeDays: parseInt(formData.workFromHomeDays) || 0,
      recurrenceDays: parseInt(formData.recurrenceDays) || 0,
      // Ensure employeeId is set
      employeeId:
        formData.employeeId || JSON.parse(localStorage.getItem("userObj"))?._id,
      // Set default values for optional fields
      isFavorite: formData.isFavorite || false,
      recurring: formData.recurring || false,
    };

    const token = localStorage.getItem("token");
    const response = await fetch(
      `${REACT_APP_API_URL}/employeeTransportations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedData),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Server error response:", responseData);
      throw new Error(
        responseData.message || "Failed to save transportation record"
      );
    }

    return responseData;
  } catch (error) {
    console.error("Error saving transportation record:", error);
    throw error;
  }
};

export const saveWorkTransportationRecord = async (formData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${REACT_APP_API_URL}/employeeWorkTransportations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save work transportation record.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving work transportation record:", error);
    throw error;
  }
};
