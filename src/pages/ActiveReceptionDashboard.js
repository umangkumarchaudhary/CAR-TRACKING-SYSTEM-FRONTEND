import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const AdminDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [stageCounts, setStageCounts] = useState({});
  const [avgStageTimes, setAvgStageTimes] = useState({});
  const [uniqueVehicleCount, setUniqueVehicleCount] = useState(0);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vehicles`); // Fetch all vehicle records
      const data = response.data.vehicles;

      setVehicles(data);

      // Extract unique vehicle numbers
      const uniqueVehicles = new Set(data.map((v) => v.vehicleNumber));
      setUniqueVehicleCount(uniqueVehicles.size);

      // Calculate total vehicles at each stage
      const stageData = {};
      const stageTimes = {};

      data.forEach((vehicle) => {
        vehicle.stages.forEach((stage, index) => {
          const { stageName, timestamp } = stage;

          // Count vehicles per stage
          stageData[stageName] = (stageData[stageName] || 0) + 1;

          // Calculate average time per stage
          if (index > 0) {
            const prevTimestamp = new Date(vehicle.stages[index - 1].timestamp);
            const currentTimestamp = new Date(timestamp);
            const timeSpent = (currentTimestamp - prevTimestamp) / 60000; // Convert to minutes

            if (!stageTimes[stageName]) {
              stageTimes[stageName] = { totalTime: 0, count: 0 };
            }
            stageTimes[stageName].totalTime += timeSpent;
            stageTimes[stageName].count += 1;
          }
        });
      });

      setStageCounts(stageData);

      // Compute average times per stage
      const avgTimes = {};
      for (const stage in stageTimes) {
        avgTimes[stage] = (stageTimes[stage].totalTime / stageTimes[stage].count).toFixed(2);
      }
      setAvgStageTimes(avgTimes);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="dashboard-stats">
        <h3>Total Vehicles Inside: {uniqueVehicleCount}</h3>
      </div>

      <div className="stage-summary">
        <h3>Vehicles at Each Stage</h3>
        <ul>
          {Object.entries(stageCounts).map(([stage, count]) => (
            <li key={stage}>{stage}: {count} vehicles</li>
          ))}
        </ul>
      </div>

      <div className="avg-times">
        <h3>Average Time Spent at Each Stage (minutes)</h3>
        <ul>
          {Object.entries(avgStageTimes).map(([stage, time]) => (
            <li key={stage}>{stage}: {time} min</li>
          ))}
        </ul>
      </div>

      <div className="vehicle-history">
        <h3>All Vehicle History</h3>
        <table>
          <thead>
            <tr>
              <th>Vehicle Number</th>
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Stages</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle, index) => (
              <tr key={index}>
                <td>{vehicle.vehicleNumber}</td>
                <td>{new Date(vehicle.entryTime).toLocaleString()}</td>
                <td>{vehicle.exitTime ? new Date(vehicle.exitTime).toLocaleString() : "In Workshop"}</td>
                <td>
                  {vehicle.stages.map((stage, idx) => (
                    <div key={idx}>
                      <strong>{stage.stageName}</strong> - {new Date(stage.timestamp).toLocaleString()}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
