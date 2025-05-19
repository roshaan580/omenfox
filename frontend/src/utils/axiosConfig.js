import axios from "axios";
import { REACT_APP_API_URL } from "../config";

// Create a custom axios instance
const api = axios.create({
  baseURL: REACT_APP_API_URL,
});

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      (error.response && error.response.status === 401) ||
      (error.response &&
        error.response.data &&
        (error.response.data.message === "jwt expired" ||
          error.response.data.message === "Invalid token" ||
          error.response.data.message ===
            "Token verification failed: jwt expired"))
    ) {
      console.log("Authentication error detected");
      localStorage.setItem("auth_error", "true");
      localStorage.removeItem("token");

      if (!error.config._isRetry) {
        setTimeout(() => {
          if (localStorage.getItem("auth_error") === "true") {
            localStorage.removeItem("userObj");
            localStorage.removeItem("userData");
            localStorage.removeItem("auth_error");
            window.location.href = "/";
          }
        }, 300);
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Function to set auth token for all requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const authenticatedFetch = async (url, options = {}) => {
  try {
    const token = localStorage.getItem("token");
    const JWT_ADMIN_SECRET = localStorage.getItem("JWT_ADMIN_SECRET") || null;

    const isEmissionsEndpoint = url.includes("/emissions");
    const authToken = isEmissionsEndpoint
      ? JWT_ADMIN_SECRET || token
      : token || JWT_ADMIN_SECRET;

    const headers = {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      let isTokenExpired = false;

      try {
        const data = await response.json();
        if (
          data.message === "jwt expired" ||
          data.message === "Invalid token" ||
          data.message === "Token verification failed: jwt expired"
        ) {
          isTokenExpired = true;

          if (token && JWT_ADMIN_SECRET && token !== JWT_ADMIN_SECRET) {
            console.log("Retrying with admin secret");
            const adminHeaders = {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
              ...options.headers,
            };

            const adminResponse = await fetch(url, {
              ...options,
              headers: adminHeaders,
            });

            if (adminResponse.ok) {
              return adminResponse;
            }
          }

          const authError = new Error("Authentication token expired");
          authError.isAuthError = true;
          throw authError;
        }
      } catch (jsonError) {
        if (isTokenExpired) {
          localStorage.removeItem("token");
          const authError = new Error("Authentication token expired");
          authError.isAuthError = true;
          throw authError;
        }
      }
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    if (error.isAuthError) {
      throw error;
    }

    console.error("Request failed:", error);
    throw error;
  }
};

export default api;
