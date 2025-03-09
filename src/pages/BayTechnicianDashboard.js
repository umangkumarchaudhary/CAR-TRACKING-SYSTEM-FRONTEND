import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BayTechnicianDashboard.css";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const BayTechnicianDashboard = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [jobStartedVehicles, setJobStartedVehicles] = useState([]);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  useEffect(() => {
    fetchOngoingJobs();
  }, []);

  const fetchOngoingJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/vehicles/bay-in-progress`);
      if (response.data.success) {
        setJobStartedVehicles(response.data.vehicles);
      }
    } catch (error) {
      console.error("Error fetching ongoing Bay Work jobs:", error);
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
        role: "Bay Technician",
        stageName: "Bay Work Started",
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

  const handleStartJob = async () => {
    if (!vehicleData) return;

    setLoading(true);
    const requestData = {
      vehicleNumber: vehicleData.vehicleNumber,
      role: "Bay Technician",
      stageName: "Bay Work Started",
      eventType: "Start",
    };
    console.log("Sending Bay Work Start request:", requestData);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, requestData);
      if (response.data.success) {
        setMessage("Bay Work started successfully.");
        fetchOngoingJobs();
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error starting bay work:", error);
      setMessage("Error processing bay work start.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishJob = async (vehicleNumber) => {
    setLoading(true);
    const requestData = {
      vehicleNumber: vehicleNumber,
      role: "Bay Technician",
      stageName: "Bay Work Finished",
      eventType: "Finish",
    };
  
    console.log("Sending Bay Work Finish request:", requestData);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, requestData);
      if (response.data.success) {
        setMessage("Bay Work finished successfully.");
  
        // Update the UI: Add finish timestamp
        setJobStartedVehicles((prevVehicles) =>
          prevVehicles.map((vehicle) =>
            vehicle.vehicleNumber === vehicleNumber
              ? {
                  ...vehicle,
                  stages: [
                    ...vehicle.stages,
                    {
                      stageName: "Bay Work Finished",
                      eventType: "Finish",
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : vehicle
          )
        );
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error finishing bay work:", error);
      setMessage("Error processing bay work finish.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleLogout = () => {
    axios.post(`${API_BASE_URL}/api/logout`).then(() => {
      window.location.href = "/login";
    });
  };

  return (
    <div className="dashboard-container">
      <h2>🔧 Bay Technician Dashboard</h2>

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
          <h3>📌 Vehicle Details for {vehicleData.vehicleNumber}</h3>
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

          {!vehicleData.stages.some((s) => s.stageName === "Bay Work Started") && (
            <button className="btn-start" onClick={handleStartJob} disabled={loading}>
              Start Bay Work
            </button>
          )}
        </>
      )}

      {jobStartedVehicles.length > 0 && (
        <div>
          <h3>🚗 Vehicles with Bay Work Started</h3>
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Start Time</th>
                <th>Finish</th>
              </tr>
            </thead>
            <tbody>
              {jobStartedVehicles.map((vehicle, index) => {
                const bayWorkStage = vehicle.stages.find((s) => s.stageName === "Bay Work Started");
                return (
<tr key={index} className="clickable-row">
  <td>{vehicle.vehicleNumber}</td>
  <td>{bayWorkStage ? new Date(bayWorkStage.timestamp).toLocaleString() : "N/A"}</td>
  <td>
    {vehicle.stages.some((s) => s.stageName === "Bay Work Finished") ? (
      // Show the finish time instead of the button
      new Date(
        vehicle.stages.find((s) => s.stageName === "Bay Work Finished").timestamp
      ).toLocaleString()
    ) : (
      <button
        className="btn-finish"
        onClick={() => handleFinishJob(vehicle.vehicleNumber)}
        disabled={loading}
      >
        Finish Job
      </button>
    )}
  </td>
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
            <p>Would you like to add this vehicle and start Bay Work?</p>
            <button className="btn-confirm" onClick={handleAddVehicle}>
              Yes, Add Vehicle
            </button>
            <button className="btn-cancel" onClick={() => setShowAddVehicleModal(false)}>
              No, Cancel
            </button>
          </div>
        </div>
      )}

      <button className="btn-logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default BayTechnicianDashboard;
