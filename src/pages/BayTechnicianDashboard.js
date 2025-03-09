import React from "react";
import { useNavigate } from "react-router-dom";


const BayTechnicianDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <h2>Bay Technician Dashboard</h2>
      
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default BayTechnicianDashboard;
