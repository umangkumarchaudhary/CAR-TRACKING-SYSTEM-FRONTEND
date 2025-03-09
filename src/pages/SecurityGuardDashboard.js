import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ServiceAdvisorDashboard.css";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const ServiceAdvisorDashboard = () => {
  const [vehicleNumber, setVehicleNumber] = useState(""); // Manual vehicle input
  const [vehicleData, setVehicleData] = useState(null);
  const [jobCardVehicles, setJobCardVehicles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch Ongoing Vehicles on Page Load
  const fetchOngoingVehicles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/vehicles/in-progress`);
      if (response.data.success) {
        setJobCardVehicles(response.data.vehicles);
      }
    } catch (error) {
      console.error("Error fetching job card vehicles:", error);
    }
  };

  useEffect(() => {
    fetchOngoingVehicles();
  }, []);

  // ✅ Fetch Vehicle Data (When Searching by Vehicle Number)
  const handleSearchVehicle = async () => {
    if (!vehicleNumber.trim()) {
      setMessage("Please enter a valid vehicle number.");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/vehicles?vehicleNumber=${vehicleNumber.trim().toUpperCase()}`);
      if (response.data.success) {
        setVehicleData(response.data.vehicle);
        setMessage("");
      } else {
        setVehicleData(null);
        setMessage("Vehicle not found.");
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      setMessage("Error retrieving vehicle data.");
    }
  };

  // ✅ Start Job Card Creation
  const handleStartJobCard = async () => {
    if (!vehicleData) return;

    setLoading(true);
    const requestData = {
      vehicleNumber: vehicleData.vehicleNumber,
      role: "Service Advisor",
      stageName: "Job Card Creation and Customer Approval",
      eventType: "Start",
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, requestData);
      if (response.data.success) {
        setMessage("Job Card Creation started successfully.");
        fetchOngoingVehicles(); // 🔥 Update the job card list!
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error starting job card:", error);
      setMessage("Error processing job card start.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>📋 Service Advisor Dashboard</h2>

      {/* ✅ Search Vehicle by Number */}
      <div className="search-container">
        <input
          type="text"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          placeholder="Enter vehicle number"
        />
        <button onClick={handleSearchVehicle}>Search</button>
      </div>

      {/* ✅ Vehicle Details Section */}
      {vehicleData && (
        <div className="vehicle-details">
          <h3>Vehicle Details</h3>
          <p><strong>Vehicle Number:</strong> {vehicleData.vehicleNumber}</p>
          <p><strong>Last Recorded Stage:</strong> {vehicleData.stages[vehicleData.stages.length - 1]?.stageName || "N/A"}</p>
          <button className="btn-start" onClick={handleStartJobCard} disabled={loading}>
            {loading ? "Starting..." : "Start Job Card Creation"}
          </button>
        </div>
      )}

      {/* ✅ Display Ongoing Job Cards */}
      <h3>🚗 Vehicles with Active Job Cards</h3>
      <table className="vehicle-table">
        <thead>
          <tr>
            <th>Vehicle Number</th>
            <th>Last Stage</th>
            <th>Last Event</th>
          </tr>
        </thead>
        <tbody>
          {jobCardVehicles.map((vehicle, index) => (
            <tr key={index}>
              <td>{vehicle.vehicleNumber}</td>
              <td>{vehicle.stages[vehicle.stages.length - 1]?.stageName || "N/A"}</td>
              <td>{vehicle.stages[vehicle.stages.length - 1]?.eventType || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ServiceAdvisorDashboard;
