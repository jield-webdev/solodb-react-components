import React from "react";

interface LoadingComponentProps {
  message?: string;
}

/**
 * A reusable loading component that displays a spinner and optional message
 * @param message - Optional custom message to display (defaults to translated "Loading...")
 */
const LoadingComponent: React.FC<LoadingComponentProps> = ({ message }) => {
  const displayMessage = message || "Loading...";

  return (
    <div className="d-flex flex-column justify-content-center align-items-center w-100 h-100">
      <div className="spinner-border" role="status" aria-label="Loading"></div>
      <p className="mt-3 mb-0">{displayMessage}</p>
    </div>
  );
};

export default LoadingComponent;
