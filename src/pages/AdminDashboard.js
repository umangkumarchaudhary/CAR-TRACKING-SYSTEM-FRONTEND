import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
      const response = await axios.get("api/vehicles"); // Fetch all vehicle records
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

  // Format data for the bar chart
  const chartData = Object.entries(stageCounts).map(([stage, count]) => ({
    stage,
    vehicles: count,
    avgTime: parseFloat(avgStageTimes[stage] || 0),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <h2 className="text-4xl font-bold mb-8 text-center">Mercedes-Benz Workshop Admin Dashboard</h2>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Total Vehicles Inside</h3>
          <p className="text-3xl font-bold text-blue-400">{uniqueVehicleCount}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Stages in Progress</h3>
          <p className="text-3xl font-bold text-green-400">{Object.keys(stageCounts).length}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Average Time per Stage</h3>
          <p className="text-3xl font-bold text-purple-400">
            {Object.values(avgStageTimes).reduce((a, b) => a + parseFloat(b), 0).toFixed(2)} min
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Vehicles at Each Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="stage" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: "#374151", border: "none" }} />
              <Legend />
              <Bar dataKey="vehicles" fill="#3b82f6" name="Vehicles" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Average Time Spent at Each Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="stage" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: "#374151", border: "none" }} />
              <Legend />
              <Bar dataKey="avgTime" fill="#8b5cf6" name="Average Time (min)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle History Section */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">All Vehicle History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-900">
                <th className="px-6 py-3 text-left text-sm font-semibold">Vehicle Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Entry Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Exit Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Stages</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle, index) => (
                <tr key={index} className="hover:bg-gray-600 transition-colors">
                  <td className="px-6 py-4">{vehicle.vehicleNumber}</td>
                  <td className="px-6 py-4">{new Date(vehicle.entryTime).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {vehicle.exitTime ? new Date(vehicle.exitTime).toLocaleString() : "In Workshop"}
                  </td>
                  <td className="px-6 py-4">
                    {vehicle.stages.map((stage, idx) => (
                      <div key={idx} className="mb-2">
                        <strong className="text-blue-400">{stage.stageName}</strong> -{" "}
                        {new Date(stage.timestamp).toLocaleString()}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;