import React from "react";
import { useNavigate } from "react-router-dom";


const DiagnosisEngineerDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <h2>Diagnosis Engineer Dashboard</h2>
    
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default DiagnosisEngineerDashboard;
