import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UserAuth from "./components/userAuth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SecurityGuardDashboard from "./pages/SecurityGuardDashboard";
import ActiveReceptionDashboard from "./pages/ActiveReceptionDashboard";
import ServiceAdvisorDashboard from "./pages/ServiceAdvisorDashboard";
import JobControllerDashboard from "./pages/JobControllerDashboard";
import BayTechnicianDashboard from "./pages/BayTechnicianDashboard";
import FinalInspectionDashboard from "./pages/FinalInspectionDashboard";
import DiagnosisEngineerDashboard from "./pages/DiagnosisEngineerDashboard";
import WashingDashboard from "./pages/WashingDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route: Redirect / to /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<UserAuth />} />
        <Route path="/register" element={<UserAuth isRegisterPage={true} />} />
        <Route path="/dashboard" element={<Dashboard />} /> 

        {/* Role-Based Dashboards */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/security-guard-dashboard" element={<SecurityGuardDashboard />} />
        <Route path="/active-reception-dashboard" element={<ActiveReceptionDashboard />} />
        <Route path="/service-advisor-dashboard" element={<ServiceAdvisorDashboard />} />
        <Route path="/job-controller-dashboard" element={<JobControllerDashboard />} />
        <Route path="/bay-technician-dashboard" element={<BayTechnicianDashboard />} />
        <Route path="/final-inspection-dashboard" element={<FinalInspectionDashboard />} />
        <Route path="/diagnosis-engineer-dashboard" element={<DiagnosisEngineerDashboard />} />
        <Route path="/washing-dashboard" element={<WashingDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
