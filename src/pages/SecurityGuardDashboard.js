import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SecurityGuardDashboard.css";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const SecurityGuardDashboard = () => {
  const [message, setMessage] = useState("");
  const [scannedVehicles, setScannedVehicles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanType, setScanType] = useState("Entry"); // Entry or Exit
  const [vehicleNumber, setVehicleNumber] = useState(""); // Manual input for vehicle number

  // ✅ Handle vehicle scan (manual input)
  const handleScan = async () => {
    if (!vehicleNumber.trim() || isProcessing) {
      setMessage("Please enter a valid vehicle number.");
      return;
    }

    const requestData = {
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      role: "Security Guard",
      stageName: "Security Gate",
      eventType: scanType, // ✅ "Entry" or "Exit"
    };

    console.log("📤 Sending Data:", requestData); // ✅ Debugging

    setIsProcessing(true);
    setMessage("Processing...");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, requestData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Response Data:", response.data);

      if (response.data.success) {
        setMessage(response.data.message);
        setScannedVehicles((prevVehicles) => {
          const updatedVehicles = prevVehicles.map((vehicle) =>
            vehicle.vehicleNumber === response.data.vehicle.vehicleNumber ? response.data.vehicle : vehicle
          );

          return response.data.newVehicle ? [response.data.vehicle, ...updatedVehicles] : updatedVehicles;
        });
      } else {
        setMessage(response.data.message || "Failed to log vehicle entry.");
      }
    } catch (error) {
      console.error("❌ Error:", error.response ? error.response.data : error.message);
      setMessage(error.response?.data?.message || "Error: Unable to process request.");
    } finally {
      setIsProcessing(false);
      setVehicleNumber(""); // Reset input field after processing
    }
  };

  // ✅ Fetch all scanned vehicles
  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/vehicles`);
      if (response.data.success) {
        setScannedVehicles(response.data.vehicles);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>🚔 Security Guard Dashboard</h2>

      {/* ✅ Entry or Exit Selection */}
      <div className="scan-type">
        <label>Scan Type:</label>
        <select value={scanType} onChange={(e) => setScanType(e.target.value)}>
          <option value="Entry">Entry</option>
          <option value="Exit">Exit</option>
        </select>
      </div>

      {/* ✅ Manual Vehicle Number Input */}
      <div className="manual-input">
        <label>Enter Vehicle Number:</label>
        <input
          type="text"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          placeholder="Enter vehicle registration number"
        />
        <button className="btn-scan" onClick={handleScan} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Confirm"}
        </button>
      </div>

      {/* ✅ Vehicle List Table */}
      <table className="vehicle-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Vehicle Number</th>
            <th>Entry Time</th>
            <th>Exit Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {scannedVehicles.map((vehicle) => (
            <tr key={vehicle._id}>
              <td>{new Date(vehicle.entryTime).toLocaleDateString()}</td>
              <td>{vehicle.vehicleNumber}</td>
              <td>{new Date(vehicle.entryTime).toLocaleTimeString()}</td>
              <td>{vehicle.exitTime ? new Date(vehicle.exitTime).toLocaleTimeString() : "-"}</td>
              <td className={vehicle.exitTime ? "closed" : "open"}>
                {vehicle.exitTime ? "Closed" : "Open"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {message && <p className="message">{message}</p>}

      {/* ✅ Logout Button */}
      <button className="logout-btn" onClick={() => {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }}>
        Logout
      </button>
    </div>
  );
};

export default SecurityGuardDashboard;
