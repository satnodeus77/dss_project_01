import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Optional: For global styles

// Ensure API URL is set dynamically
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL || "https://dss-project-server.herokuapp.com"
    : "http://localhost:5000"; // Local development fallback

// Save API URL globally
window.API_BASE_URL = API_BASE_URL;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("API Base URL:", API_BASE_URL); // Debugging
