import React from "react";
import { useNavigate } from "react-router-dom";


const FinalInspectionDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <h2>Final Inspection Technician Dashboard</h2>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default FinalInspectionDashboard;
