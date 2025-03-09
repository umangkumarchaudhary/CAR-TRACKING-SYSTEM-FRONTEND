import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ServiceAdvisorDashboard.css"; // Updated CSS for luxury design

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const ServiceAdvisorDashboard = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [jobCardStartedVehicles, setJobCardStartedVehicles] = useState([]);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchOngoingVehicles();
  }, []);

  const fetchOngoingVehicles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/vehicles/in-progress`);
      if (response.data.success) {
        setJobCardStartedVehicles(response.data.vehicles);
      }
    } catch (error) {
      console.error("Error fetching ongoing vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleDetails = async (selectedVehicleNumber = null) => {
    const searchNumber = selectedVehicleNumber || vehicleNumber.trim();
    if (!searchNumber) {
      setMessage("Please enter a vehicle number.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/vehicles`);
      if (response.data.success) {
        const foundVehicle = response.data.vehicles.find(
          (v) => v.vehicleNumber.toUpperCase() === searchNumber.toUpperCase()
        );

        if (foundVehicle) {
          setVehicleData(foundVehicle);
          setVehicleNumber(foundVehicle.vehicleNumber);
          setMessage("");
        } else {
          setVehicleData(null);
          setMessage("Vehicle not found.");
          setShowAddVehicleModal(true);
        }
      } else {
        setMessage("Error fetching vehicles.");
      }
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!vehicleNumber.trim()) return;

    setLoading(true);
    try {
      const requestData = {
        vehicleNumber: vehicleNumber.toUpperCase(),
        role: "Service Advisor",
        stageName: "Job Card Creation + Customer Approval",
        eventType: "Start",
      };
      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, requestData);
      if (response.data.success) {
        setMessage("Vehicle added successfully.");
        setShowAddVehicleModal(false);
        fetchVehicleDetails(vehicleNumber);
      } else {
        setMessage("Error adding vehicle.");
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartJobCard = async () => {
    if (!vehicleData) return;

    setLoading(true);
    const requestData = {
      vehicleNumber: vehicleData.vehicleNumber,
      role: "Service Advisor",
      stageName: "Job Card Creation + Customer Approval",
      eventType: "Start",
    };
    try {
      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, requestData);
      if (response.data.success) {
        setMessage("Job Card Creation started successfully.");
        fetchOngoingVehicles();
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

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📋 Service Advisor Dashboard</h2>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Enter Vehicle Number"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          disabled={loading}
        />
        <button className="btn-fetch" onClick={() => fetchVehicleDetails()} disabled={loading}>
          {loading ? "Checking..." : "Fetch Vehicle"}
        </button>
      </div>

      {message && <p className="message">{message}</p>}

      {vehicleData && (
        <div className="vehicle-details">
          <h3>📌 Vehicle History for {vehicleData.vehicleNumber}</h3>
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Event</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {vehicleData.stages.map((stage, index) => (
                <tr key={index}>
                  <td>{stage.stageName}</td>
                  <td>{stage.eventType}</td>
                  <td>{new Date(stage.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!vehicleData.stages.some((s) => s.stageName === "Job Card Creation + Customer Approval") && (
            <button className="btn-start" onClick={handleStartJobCard} disabled={loading}>
              Start Job Card Creation + Customer Approval
            </button>
          )}
        </div>
      )}

      {jobCardStartedVehicles.length > 0 && (
        <div className="job-card-history">
          <h3>🚗 Vehicles with Job Card Started</h3>
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Job Card Start Time</th>
              </tr>
            </thead>
            <tbody>
              {jobCardStartedVehicles.map((vehicle, index) => {
                const jobCardStage = vehicle.stages.find(
                  (s) => s.stageName === "Job Card Creation + Customer Approval"
                );
                return (
                  <tr
                    key={index}
                    className="clickable-row"
                    onClick={() => fetchVehicleDetails(vehicle.vehicleNumber)}
                  >
                    <td>{vehicle.vehicleNumber}</td>
                    <td>{jobCardStage ? new Date(jobCardStage.timestamp).toLocaleString() : "N/A"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddVehicleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Vehicle Not Found</h3>
            <p>Would you like to add this vehicle and start Job Card Preparation?</p>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={handleAddVehicle}>
                Yes, Add Vehicle
              </button>
              <button className="btn-cancel" onClick={() => setShowAddVehicleModal(false)}>
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceAdvisorDashboard;