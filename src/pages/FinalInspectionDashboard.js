import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FinalInspectionDashboard.css";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const FinalInspectionDashboard = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [inspectionStartedVehicles, setInspectionStartedVehicles] = useState([]);

  useEffect(() => {
    fetchOngoingInspections();
  }, []);

  const fetchOngoingInspections = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/vehicles/final-inspection-in-progress`);
      if (response.data.success) {
        setInspectionStartedVehicles(response.data.vehicles);
      }
    } catch (error) {
      console.error("Error fetching ongoing Final Inspections:", error);
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
          setMessage("Vehicle not found in Final Inspection.");
        }
      } else {
        setMessage("Error fetching Final Inspection vehicles.");
      }
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleStartInspection = async () => {
    if (!vehicleData) return;

    setLoading(true);
    const requestData = {
      vehicleNumber: vehicleData.vehicleNumber,
      role: "Final Inspector",
      stageName: "Final Inspection Started",
      eventType: "Start",
    };

    try {
      console.log("Starting Final Inspection:", requestData);
      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, requestData);

      if (response.data.success) {
        setMessage("Final Inspection started successfully.");
        fetchOngoingInspections();
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error starting Final Inspection:", error);
      setMessage("Error processing Final Inspection start.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishInspection = async (vehicleNumber) => {
    setLoading(true);
    const requestData = {
      vehicleNumber: vehicleNumber,
      role: "Final Inspector",
      stageName: "Final Inspection Finished",
      eventType: "Finish",
    };

    try {
      console.log("Finishing Final Inspection:", requestData);
      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, requestData);

      if (response.data.success) {
        setMessage("Final Inspection finished successfully.");
        setInspectionStartedVehicles((prevVehicles) =>
          prevVehicles.map((vehicle) =>
            vehicle.vehicleNumber === vehicleNumber
              ? {
                  ...vehicle,
                  stages: [
                    ...vehicle.stages,
                    {
                      stageName: "Final Inspection Finished",
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
      console.error("Error finishing Final Inspection:", error);
      setMessage("Error processing Final Inspection finish.");
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
      <h2>🛠️ Final Inspection Dashboard</h2>

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

          {!vehicleData.stages.some((s) => s.stageName === "Final Inspection Started") && (
            <button className="btn-start" onClick={handleStartInspection} disabled={loading}>
              Start Final Inspection
            </button>
          )}
        </>
      )}

      {inspectionStartedVehicles.length > 0 && (
        <div>
          <h3>🚗 Vehicles in Final Inspection</h3>
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Start Time</th>
                <th>Finish</th>
              </tr>
            </thead>
            <tbody>
              {inspectionStartedVehicles.map((vehicle, index) => {
                const inspectionStage = vehicle.stages.find((s) => s.stageName === "Final Inspection Started");
                return (
                  <tr key={index} className="clickable-row">
                    <td>{vehicle.vehicleNumber}</td>
                    <td>{inspectionStage ? new Date(inspectionStage.timestamp).toLocaleString() : "N/A"}</td>
                    <td>
                      {vehicle.stages.some((s) => s.stageName === "Final Inspection Finished") ? (
                        new Date(
                          vehicle.stages.find((s) => s.stageName === "Final Inspection Finished").timestamp
                        ).toLocaleString()
                      ) : (
                        <button
                          className="btn-finish"
                          onClick={() => handleFinishInspection(vehicle.vehicleNumber)}
                          disabled={loading}
                        >
                          Finish Inspection
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

export default FinalInspectionDashboard;
