import React, { useState, useEffect } from "react";
import axios from "axios";
import "./WashingDashboard.css";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const WashingDashboard = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [washingStartedVehicles, setWashingStartedVehicles] = useState([]);

  useEffect(() => {
    fetchOngoingWashing();
  }, []);

  const fetchOngoingWashing = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/vehicles/washing-in-progress`);
      if (response.data.success) {
        setWashingStartedVehicles(response.data.vehicles);
      }
    } catch (error) {
      console.error("Error fetching ongoing Washing:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleDetails = async () => {
    if (!vehicleNumber.trim()) {
      setMessage("Please enter a vehicle number.");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching vehicle details for:", vehicleNumber);
      const response = await axios.get(`${API_BASE_URL}/api/vehicles`);

      if (response.data.success) {
        const foundVehicle = response.data.vehicles.find(
          (v) => v.vehicleNumber.toUpperCase() === vehicleNumber.toUpperCase()
        );

        if (foundVehicle) {
          setVehicleData(foundVehicle);
          setMessage("");
        } else {
          setVehicleData(null);
          setMessage("Vehicle not found in Washing.");
        }
      } else {
        setMessage("Error fetching Washing vehicles.");
      }
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartWashing = async () => {
    if (!vehicleData) return;

    setLoading(true);
    const requestData = {
      vehicleNumber: vehicleData.vehicleNumber,
      role: "Washing Staff",
      stageName: "Washing Started",
      eventType: "Start",
    };

    try {
      console.log("Starting Washing:", requestData);
      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, requestData);

      if (response.data.success) {
        setMessage("Washing started successfully.");
        fetchOngoingWashing();
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error starting Washing:", error);
      setMessage("Error processing Washing start.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishWashing = async (vehicleNumber) => {
    setLoading(true);
    const requestData = {
      vehicleNumber: vehicleNumber,
      role: "Washing Staff",
      stageName: "Washing Finished",
      eventType: "Finish",
    };

    try {
      console.log("Finishing Washing:", requestData);
      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, requestData);

      if (response.data.success) {
        setMessage("Washing finished successfully.");
        setWashingStartedVehicles((prevVehicles) =>
          prevVehicles.map((vehicle) =>
            vehicle.vehicleNumber === vehicleNumber
              ? {
                  ...vehicle,
                  stages: [
                    ...vehicle.stages,
                    {
                      stageName: "Washing Finished",
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
      console.error("Error finishing Washing:", error);
      setMessage("Error processing Washing finish.");
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
      <h2>🧼 Washing Dashboard</h2>

      <div className="vehicle-entry">
        <input
          type="text"
          placeholder="Enter Vehicle Number"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          disabled={loading}
        />
        <button className="btn-fetch" onClick={fetchVehicleDetails} disabled={loading}>
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

          {!vehicleData.stages.some((s) => s.stageName === "Washing Started") && (
            <button className="btn-start" onClick={handleStartWashing} disabled={loading}>
              Start Washing
            </button>
          )}
        </>
      )}

      {washingStartedVehicles.length > 0 && (
        <div>
          <h3>🚗 Vehicles in Washing</h3>
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Start Time</th>
                <th>Finish</th>
              </tr>
            </thead>
            <tbody>
              {washingStartedVehicles.map((vehicle, index) => {
                const washingStage = vehicle.stages.find((s) => s.stageName === "Washing Started");
                return (
                  <tr key={index} className="clickable-row">
                    <td>{vehicle.vehicleNumber}</td>
                    <td>{washingStage ? new Date(washingStage.timestamp).toLocaleString() : "N/A"}</td>
                    <td>
                      {vehicle.stages.some((s) => s.stageName === "Washing Finished") ? (
                        new Date(
                          vehicle.stages.find((s) => s.stageName === "Washing Finished").timestamp
                        ).toLocaleString()
                      ) : (
                        <button
                          className="btn-finish"
                          onClick={() => handleFinishWashing(vehicle.vehicleNumber)}
                          disabled={loading}
                        >
                          Finish Washing
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

      <button className="btn-logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default WashingDashboard;
