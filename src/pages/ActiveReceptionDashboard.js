import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ActiveReceptionDashboard.css"; // Updated CSS file
import { FaCar, FaPlay, FaCheck, FaSpinner, FaChartLine, FaList, FaHistory } from "react-icons/fa"; // Icons for better visuals

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const ActiveReceptionDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [activeTab, setActiveTab] = useState("in-progress"); // Tracks active tab

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/vehicles`);
      if (response.data.success) {
        const sortedVehicles = response.data.vehicles.sort(
          (a, b) => new Date(b.entryTime) - new Date(a.entryTime)
        );
        setVehicles(sortedVehicles);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setMessage("Error loading vehicle data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleVehicleEntry = async () => {
    if (!vehicleNumber) {
      setMessage("Please enter a vehicle number.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, {
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        role: "Security",
        stageName: "Security Gate",
        eventType: "Entry",
      });

      if (response.data.success) {
        setMessage("Vehicle entered successfully.");
        setVehicleNumber("");
        fetchVehicles();
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error entering vehicle:", error);
      setMessage("Error processing vehicle entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (vehicleId) => {
    setLoading(true);
    try {
      const vehicle = vehicles.find((v) => v._id === vehicleId);
      if (!vehicle) return;

      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, {
        vehicleNumber: vehicle.vehicleNumber,
        role: "Inspection Technician",
        stageName: "Interactive Bay",
        eventType: "Start",
      });

      if (response.data.success) {
        setMessage("Vehicle has started work.");
        fetchVehicles();
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error starting vehicle:", error);
      setMessage("Error processing vehicle start.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (vehicleId) => {
    setLoading(true);
    try {
      const vehicle = vehicles.find((v) => v._id === vehicleId);
      if (!vehicle) return;

      const response = await axios.post(`${API_BASE_URL}/api/vehicle-check`, {
        vehicleNumber: vehicle.vehicleNumber,
        role: "Inspection Technician",
        stageName: "Interactive Bay",
        eventType: "Finish",
      });

      if (response.data.success) {
        setMessage("Vehicle has finished work.");
        fetchVehicles();
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error finishing vehicle:", error);
      setMessage("Error processing vehicle finish.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate Dashboard Metrics
  const calculateMetrics = () => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    const todayVehicles = vehicles.filter((vehicle) =>
      new Date(vehicle.entryTime).toISOString().split("T")[0] === today
    );

    const finishedToday = todayVehicles.filter((vehicle) =>
      vehicle.stages.some((stage) => stage.eventType === "Finish")
    );

    const totalCarsToday = finishedToday.length;

    const averageTimeToday =
      totalCarsToday > 0
        ? finishedToday.reduce((sum, vehicle) => {
            const startStage = vehicle.stages.find((stage) => stage.eventType === "Start");
            const finishStage = vehicle.stages.find((stage) => stage.eventType === "Finish");
            if (startStage && finishStage) {
              const startTime = new Date(startStage.timestamp);
              const finishTime = new Date(finishStage.timestamp);
              return sum + (finishTime - startTime);
            }
            return sum;
          }, 0) / (totalCarsToday * 60000) // Convert milliseconds to minutes
        : 0;

    const averageTimeOverall =
      vehicles.length > 0
        ? vehicles.reduce((sum, vehicle) => {
            const startStage = vehicle.stages.find((stage) => stage.eventType === "Start");
            const finishStage = vehicle.stages.find((stage) => stage.eventType === "Finish");
            if (startStage && finishStage) {
              const startTime = new Date(startStage.timestamp);
              const finishTime = new Date(finishStage.timestamp);
              return sum + (finishTime - startTime);
            }
            return sum;
          }, 0) / (vehicles.length * 60000) // Convert milliseconds to minutes
        : 0;

    return {
      totalCarsToday,
      averageTimeToday: averageTimeToday.toFixed(2),
      averageTimeOverall: averageTimeOverall.toFixed(2),
      totalCars: vehicles.length,
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">
        <FaCar className="icon" /> Active Reception Dashboard
      </h2>

      {loading && (
        <div className="loading-overlay">
          <FaSpinner className="spinner" /> Loading, please wait...
        </div>
      )}

      <div className="vehicle-entry">
        <input
          type="text"
          placeholder="Enter Vehicle Number"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          disabled={loading}
        />
        <button className="btn-enter" onClick={handleVehicleEntry} disabled={loading}>
          {loading ? <FaSpinner className="spinner" /> : "Enter Vehicle"}
        </button>
      </div>

      {/* Tab Buttons */}
      <div className="tab-buttons">
        <button
          className={`tab-button ${activeTab === "in-progress" ? "active" : ""}`}
          onClick={() => setActiveTab("in-progress")}
        >
          <FaList /> Vehicles in Progress
        </button>
        <button
          className={`tab-button ${activeTab === "finished" ? "active" : ""}`}
          onClick={() => setActiveTab("finished")}
        >
          <FaHistory /> Finished Vehicles
        </button>
        <button
          className={`tab-button ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <FaChartLine /> Dashboard
        </button>
      </div>

      {/* Vehicles in Progress Table */}
      {activeTab === "in-progress" && (
        <>
          <h3 className="section-title">
            <FaPlay className="icon" /> Vehicles in Progress (Interactive Bay)
          </h3>
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle Number</th>
                <th>Entry Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles
                .filter((vehicle) => !vehicle.stages.some((stage) => stage.eventType === "Finish"))
                .map((vehicle) => (
                  <tr key={vehicle._id}>
                    <td>{new Date(vehicle.entryTime).toLocaleDateString()}</td>
                    <td>{vehicle.vehicleNumber}</td>
                    <td>{new Date(vehicle.entryTime).toLocaleTimeString()}</td>
                    <td className={vehicle.stages.some((stage) => stage.eventType === "Start") ? "in-progress" : "pending"}>
                      {vehicle.stages.some((stage) => stage.eventType === "Start") ? "Work in Progress" : "Pending"}
                    </td>
                    <td>
                      {!vehicle.stages.some((stage) => stage.eventType === "Start") ? (
                        <button className="btn-start" onClick={() => handleStart(vehicle._id)} disabled={loading}>
                          {loading ? <FaSpinner className="spinner" /> : "Start"}
                        </button>
                      ) : (
                        <button className="btn-disabled" disabled>
                          Work in Progress
                        </button>
                      )}

                      {vehicle.stages.some((stage) => stage.eventType === "Start") &&
                        !vehicle.stages.some((stage) => stage.eventType === "Finish") && (
                          <button className="btn-finish" onClick={() => handleFinish(vehicle._id)} disabled={loading}>
                            {loading ? <FaSpinner className="spinner" /> : "Finish"}
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}

      {/* Finished Vehicles Table */}
      {activeTab === "finished" && (
        <>
          <h3 className="section-title">
            <FaCheck className="icon" /> Finished Vehicles (Interactive Bay)
          </h3>
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle Number</th>
                <th>Start Time</th>
                <th>Finish Time</th>
              </tr>
            </thead>
            <tbody>
              {vehicles
                .filter((vehicle) => vehicle.stages.some((stage) => stage.eventType === "Finish"))
                .map((vehicle) => {
                  const startStage = vehicle.stages.find((stage) => stage.eventType === "Start");
                  const finishStage = vehicle.stages.find((stage) => stage.eventType === "Finish");

                  return (
                    <tr key={vehicle._id}>
                      <td>{new Date(vehicle.entryTime).toLocaleDateString()}</td>
                      <td>{vehicle.vehicleNumber}</td>
                      <td>{startStage ? new Date(startStage.timestamp).toLocaleTimeString() : "N/A"}</td>
                      <td>{finishStage ? new Date(finishStage.timestamp).toLocaleTimeString() : "N/A"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </>
      )}

      {/* Dashboard Section */}
      {activeTab === "dashboard" && (
        <div className="dashboard-metrics">
          <div className="metric-card">
            <h3>Average Time in Interactive Bay Today</h3>
            <p>{metrics.averageTimeToday} minutes</p>
          </div>
          <div className="metric-card">
            <h3>Total Cars Done Today</h3>
            <p>{metrics.totalCarsToday}</p>
          </div>
          <div className="metric-card">
            <h3>Average Time Overall</h3>
            <p>{metrics.averageTimeOverall} minutes</p>
          </div>
          <div className="metric-card">
            <h3>Total Cars as of Now</h3>
            <p>{metrics.totalCars}</p>
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ActiveReceptionDashboard;