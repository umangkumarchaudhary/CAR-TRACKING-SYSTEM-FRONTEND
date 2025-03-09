import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.jpg"; // Import the logo
import "./userAuth.css"; // Import the CSS file

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const UserAuth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    role: "",
  });

  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = [
    "Admin",
    "Security Guard",
    "Active Reception Technician",
    "Service Advisor",
    "Job Controller",
    "Bay Technician",
    "Final Inspection Technician",
    "Diagnosis Engineer",
    "Washing Boy",
  ];

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.name && parsedUser.role) {
          setUser(parsedUser);
          navigate("/dashboard");
        } else {
          throw new Error("Invalid user data found in localStorage");
        }
      }
    } catch (error) {
      console.error("Invalid localStorage data. Clearing storage...");
      localStorage.removeItem("user");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        // Register User
        const response = await axios.post(`${API_BASE_URL}/api/register`, formData, { withCredentials: true });
        if (response.data.success) {
          alert("Registration successful! Please log in.");
          setIsRegister(false);
        } else {
          setError(response.data.message);
        }
      } else {
        // Login User
        const response = await axios.post(
          `${API_BASE_URL}/api/login`,
          { mobile: formData.mobile, role: formData.role },
          { withCredentials: true }
        );

        if (response.data.success) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          setUser(response.data.user);

          // Redirect based on role
          switch (response.data.user.role) {
            case "Admin":
              navigate("/admin-dashboard");
              break;
            case "Security Guard":
              navigate("/security-guard-dashboard");
              break;
            case "Active Reception Technician":
              navigate("/active-reception-dashboard");
              break;
            case "Service Advisor":
              navigate("/service-advisor-dashboard");
              break;
            case "Job Controller":
              navigate("/job-controller-dashboard");
              break;
            case "Bay Technician":
              navigate("/bay-technician-dashboard");
              break;
            case "Final Inspection Technician":
              navigate("/final-inspection-dashboard");
              break;
            case "Diagnosis Engineer":
              navigate("/diagnosis-engineer-dashboard");
              break;
            case "Washing Boy":
              navigate("/washing-dashboard");
              break;
            default:
              navigate("/dashboard");
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await axios.post(`${API_BASE_URL}/api/logout`, {}, { withCredentials: true });
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-background"></div>
      <div className="auth-card">
        {/* Logo and Text */}
        <div className="branding">
          <img src={logo} alt="Mercedes-Benz Logo" className="logo" />
          <div className="silver-star-text">
            <span className="mercedes-text">Mercedes-Benz</span>
            <span className="silver-star-text">Silver Star</span>
          </div>
        </div>

        {!user ? (
          <form onSubmit={handleSubmit}>
            <h2>{isRegister ? "Register" : "Login"}</h2>
            {error && <p className="error">{error}</p>}

            {isRegister && (
              <>
                <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
              </>
            )}

            <input type="text" name="mobile" placeholder="Enter Mobile Number" value={formData.mobile} onChange={handleChange} required />

            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : isRegister ? "Register" : "Login"}
            </button>

            <button
              type="button"
              className="toggle-button"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Already have an account? Login" : "New user? Register here"}
            </button>
          </form>
        ) : (
          <div className="dashboard">
            <h2>Welcome, {user.name} ({user.role})</h2>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAuth;