import React, { useState, useEffect } from "react";
import axios from "axios";
import "./JobControllerDashboard.css";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const JobControllerDashboard = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [bayAllocatedVehicles, setBayAllocatedVehicles] = useState([]);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  useEffect(() => {
    fetchOngoingBayAllocations();
  }, []);

  const fetchOngoingBayAllocations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/vehicles/in-progress`);
      if (response.data.success) {
        setBayAllocatedVehicles(response.data.vehicles);
      }
    } catch (error) {
      console.error("Error fetching bay allocated vehicles:", error);
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
      console.log("Fetching vehicle details for:", searchNumber);
      const response = await axios.get(`${API_BASE_URL}/api/vehicles`);

      if (response.data.success) {
        const foundVehicle = response.data.vehicles.find(
          (v) => v.vehicleNumber.toUpperCase() === searchNumber.toUpperCase()
        );

        if (foundVehicle) {
          setVehicleData({
            vehicleNumber: foundVehicle.vehicleNumber,
            bayAllocationTime: foundVehicle.stages.find(
              (stage) => stage.stageName === "Start Bay Allocation + Job Card Received"
            )?.timestamp || null,
          });
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
        role: "Job Controller",
        stageName: "Start Bay Allocation + Job Card Received",
        eventType: "Start",
      };
      console.log("Adding new vehicle:", requestData);

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

  const handleStartBayAllocation = async () => {
    if (!vehicleData) return;

    setLoading(true);
    const requestData = {
      vehicleNumber: vehicleData.vehicleNumber,
      role: "Job Controller",
      stageName: "Start Bay Allocation + Job Card Received",
      eventType: "Start",
    };
    console.log("Starting Bay Allocation:", requestData);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, requestData);
      if (response.data.success) {
        setMessage("Bay Allocation started successfully.");
        fetchOngoingBayAllocations();
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error starting bay allocation:", error);
      setMessage("Error processing bay allocation.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    axios.post(`${API_BASE_URL}/api/logout`)
      .then(() => {
        window.location.href = "/login";
      })
      .catch((error) => {
        console.error("Logout failed:", error);
        setMessage("Logout failed.");
      });
  };

  return (
    <div className="dashboard-container">
      <h2>🔧 Job Controller Dashboard</h2>
      <button className="btn-logout" onClick={handleLogout}>Logout</button>

      <div className="vehicle-entry">
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
        <>
          <h3>📌 Bay Allocation Details for {vehicleData.vehicleNumber}</h3>
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Start Bay Allocation + Job Card Received</td>
                <td>{vehicleData.bayAllocationTime ? new Date(vehicleData.bayAllocationTime).toLocaleString() : "Not Started"}</td>
              </tr>
            </tbody>
          </table>

          {!vehicleData.bayAllocationTime && (
            <button className="btn-start" onClick={handleStartBayAllocation} disabled={loading}>
              Start Bay Allocation
            </button>
          )}
        </>
      )}

      {bayAllocatedVehicles.length > 0 && (
        <div>
          <h3>🚗 Vehicles with Bay Allocation Started</h3>
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Bay Allocation Start Time</th>
              </tr>
            </thead>
            <tbody>
              {bayAllocatedVehicles.map((vehicle, index) => {
                const bayStage = vehicle.stages.find(
                  (s) => s.stageName === "Start Bay Allocation + Job Card Received"
                );
                return (
                  <tr 
                    key={index} 
                    className="clickable-row" 
                    onClick={() => fetchVehicleDetails(vehicle.vehicleNumber)}
                  >
                    <td>{vehicle.vehicleNumber}</td>
                    <td>{bayStage ? new Date(bayStage.timestamp).toLocaleString() : "N/A"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddVehicleModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Vehicle Not Found</h3>
            <p>Would you like to add this vehicle and start Bay Allocation?</p>
            <button className="btn-confirm" onClick={handleAddVehicle}>
              Yes, Add Vehicle
            </button>
            <button className="btn-cancel" onClick={() => setShowAddVehicleModal(false)}>
              No, Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobControllerDashboard;
