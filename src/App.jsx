import React from "react";
import Layout from "./components/Layout";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast"; // Import toast as well if triggering from here
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa"; // Example icons
import { Spinner } from "@chakra-ui/react";

// Theme Constants
const accentColor = "#FFEC44"; // Yellow
const baseTextColor = "#E2E8F0"; // Light text for dark background
const baseBg = "rgba(40, 40, 50, 0.95)"; // Darker base for better contrast
const headingFont = "'Courier New', monospace";
const shadowColor = "rgba(0,0,0,0.8)"; // Slightly darker shadow

// Define icons for each type
const typeIcons = {
  success: <FaCheckCircle color="#86efac" size="20px" />, // Lighter green icon
  error: <FaTimesCircle color="#fca5a5" size="20px" />, // Lighter red icon
  loading: (
    <Spinner size="sm" color={accentColor} thickness="2px" speed="0.7s" />
  ),
  info: <FaInfoCircle color="#93c5fd" size="20px" />, // Lighter blue icon
  warning: <FaExclamationTriangle color="#fde047" size="20px" />, // Lighter yellow icon
  default: <FaInfoCircle color="#a1a1aa" size="20px" />, // Muted default icon
};

function App() {
  const location = useLocation();
  const isTestRoute = location.pathname === "/login";

  return (
    <>
      <Toaster
        position="bottom-right"
        gutter={12}
        toastOptions={{
          duration: 4000,
          // --- Default Styles ---
          style: {
            background: baseBg,
            color: baseTextColor,
            fontFamily: headingFont,
            fontSize: "14px",
            fontWeight: "medium", // Courier looks better medium/bold
            borderRadius: "0px", // SQUARE
            border: `1px solid black`, // Base sketch border
            padding: "10px 15px", // Adjusted padding
            boxShadow: `4px 4px 0px 0px ${shadowColor}`, // ENHANCED Shadow
            maxWidth: "400px",
            // Add default icon style wrapper (Flex)
            display: "flex",
            alignItems: "center",
            gap: "10px", // Space between icon and text
          },

          // --- Styles & Icons for Specific Types ---
          success: {
            icon: typeIcons.success, // Directly use the component
            style: {
              background: "rgba(34, 197, 94, 0.7)", 
              border: `1px solid #166534`, 
              boxShadow: `4px 4px 0px 0px #14532d`, 
            },
          },
          error: {
            icon: typeIcons.error,
            style: {
              background: "rgba(239, 68, 68, 0.5)",
              border: `1px solid #991b1b`,
              boxShadow: `4px 4px 0px 0px #7f1d1d`,
            },
          },
          // --- Loading Type ---
          loading: {
            icon: typeIcons.loading,
          },
          // --- Custom Info/Warning --- (Example)
          info: {
            icon: typeIcons.info,
            style: { 
              background: "rgba(59, 130, 246, 0.5)",
              border: `1px solid #1e40af`,
              boxShadow: `4px 4px 0px 0px #1e3a8a`,
            },
          },
          warning: {
            icon: typeIcons.warning,
            style: {
              background: "rgba(255, 230, 68, 0.5)",
              border: `1px solid #eab308`,
              boxShadow: `4px 4px 0px 0px #eab308`,
            },
          },
        }}
      />

      {isTestRoute ? (
        <Outlet />
      ) : (
        <Layout>
          <Outlet />
        </Layout>
      )}
    </>
  );
}

export default App;
