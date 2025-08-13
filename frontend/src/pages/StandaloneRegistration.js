import React, { useState, useEffect } from "react";
import { REACT_APP_API_URL } from "../config";
import Registration from "./Registration";
import { Toaster } from "react-hot-toast";

const StandaloneRegistration = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${REACT_APP_API_URL}/companies`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const companiesData = await response.json();
          setCompanies(companiesData);
        } else {
          console.error("Failed to fetch companies");
          // Don't show error to user, just use empty array
          setCompanies([]);
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
        // Don't show error to user, just use empty array
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-5 min-vh-100 d-flex flex-column justify-content-center">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading registration form...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get theme for toaster
  const theme = localStorage.getItem("theme") || "light";

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: '',
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
            border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
          },
        }}
      />
      <Registration
        userData={null}
        isModelVisible={false}
        isAdmin={false}
        onProfileUpdate={null}
        companies={companies}
      />
    </>
  );
};

export default StandaloneRegistration;