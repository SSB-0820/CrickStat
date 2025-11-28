//Predictions.jsx
import React, { useEffect, useState } from "react";
import { FaUserCircle, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import "./Predictions.css";
import logoImg from "./cric_logo.png";

function Prediction() {
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [format, setFormat] = useState(localStorage.getItem("format") || "ODI");
    const [prediction, setPrediction] = useState(null);
    const [strategy, setStrategy] = useState([]);
    const [activeTab, setActiveTab] = useState("predictions");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const playerId = localStorage.getItem("playerId");
        if (!token || !playerId) {
            navigate("/"); // redirect if not logged in
            return;
        }
        fetchPrediction(playerId, format, token);

        // Close dropdown on click outside
        const handleClickOutside = (e) => {
            if (!e.target.closest(".profile-container")) setShowDropdown(false);
        };
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, [format, navigate]);

    const fetchPrediction = async (playerId, format, token) => {
        try {
            const res = await axios.get(`http://localhost:8000/api/predictions/${playerId}/${format}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setPlayer(res.data.player);
            setStrategy(res.data.strategy || []);

            // Normalize prediction keys (robust to different backend key names)
            const raw = res.data.prediction || {};
            const normalized = {
                runs: raw.runs ?? raw.run ?? 0,
                strike_rate: raw.strike_rate ?? raw.strikeRate ?? raw.sr ?? 0,
                wickets: raw.wickets ?? raw.wk ?? raw.wkts ?? 0,
                economy: raw.economy ?? raw.econ ?? 0,
                average: raw.average ?? raw.avg ?? 0
            };

            setPrediction(normalized);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Error fetching predictions");
        }
    };

    const getChartData = () => {
        if (!prediction || !player) return [];
        const role = player.role;
        const data = [];
        if (role === "Batsman") {
            data.push({ name: "Runs", value: prediction.runs });
            data.push({ name: "Strike Rate", value: prediction.strike_rate });
            data.push({ name: "Average", value: prediction.average });
        } else if (role === "Bowler") {
            data.push({ name: "Wickets", value: prediction.wickets });
            data.push({ name: "Economy", value: prediction.economy });
        } else if (role === "All-rounder") {
            data.push({ name: "Runs", value: prediction.runs });
            data.push({ name: "Strike Rate", value: prediction.strike_rate });
            data.push({ name: "Average", value: prediction.average });
            data.push({ name: "Wickets", value: prediction.wickets });
            data.push({ name: "Economy", value: prediction.economy });
        }
        return data;
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("playerId");
        navigate("/");
    };

    // const handleHelp = () => setShowHelp(true);

    return (
        <div className="prediction-page">
            {/* Navbar */}
            <nav className="navbar">
                {/* Logo */}
                <div className="logo-container" onClick={() => navigate("/dashboard")}>
                    <img src={logoImg} alt="CricStat Logo" className="navbar-logo" />
                </div>

                {/* Navigation Links */}
                <div className="nav-links">
                    <span onClick={() => navigate("/player-input")} className="nav-link">Player Input</span>
                    <span onClick={() => navigate("/predictions")} className="nav-link">Predictions</span>
                </div>

                {/* Profile / Help */}
                <div className="profile-container">
                    <FaUserCircle
                        className="profile-icon"
                        onClick={() => setShowDropdown(!showDropdown)}
                    />
                    {showDropdown && (
                        <div className="dropdown-menu">
                            <div className="dropdown-item" onClick={handleLogout}>
                                <FaSignOutAlt /> Logout
                            </div>
                            <div className="dropdown-item" onClick={() => setShowHelp(true)}>
                                <FaQuestionCircle /> Help
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Help Popup */}
            {showHelp && (
                <div className="help-popup">
                    <div className="help-content">
                        <h2>How to use CricStat</h2>
                        <ol>
                            <li>Step 1: Input Player Stats in Player Input page</li>
                            <li>Step 2: View Predictions in Predictions page</li>
                            <li>Step 3: Apply Strategies based on predictions</li>
                        </ol>
                        <button className="btn-close" onClick={() => setShowHelp(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}


            {/* Buttons below navbar */}
            <div className="tab-buttons">
                <button
                    className={activeTab === "predictions" ? "active-btn" : ""}
                    onClick={() => setActiveTab("predictions")}
                >
                    Predictions
                </button>
                <button
                    className={activeTab === "strategy" ? "active-btn" : ""}
                    onClick={() => setActiveTab("strategy")}
                >
                    Strategy
                </button>
            </div>

            {/* Content */}
            <div className="prediction-content">
                {activeTab === "predictions" && (
                    <div className="chart-container">
                        {prediction && player ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#00b4d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>Loading prediction...</p>
                        )}
                    </div>
                )}

                {activeTab === "strategy" && (
                    <div className="strategy-container">
                        <h3>Generated Strategy</h3>
                        {strategy.length > 0 ? (
                            <ul>
                                {strategy.map((s, idx) => (
                                    <li key={idx}>{s}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No strategy available.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Help Modal
            {showHelp && (
                <div className="help-popup" onClick={() => setShowHelp(false)}>
                    <div className="help-content" onClick={(e) => e.stopPropagation()}>
                        <h2>How to use CricStat</h2>
                        <ol>
                            <li>Go to PlayerInput tab and add player stats for selected format.</li>
                            <li>Navigate to Prediction tab to view predicted stats for that player.</li>
                            <li>Switch to Strategy tab to see the suggested strategies based on predictions.</li>
                            <li>Click on your profile for Logout or to view this Help guide.</li>
                        </ol>
                        <button className="btn-close" onClick={() => setShowHelp(false)}>Close</button>
                    </div>
                </div>
            )} */}
        </div>
    );
}

export default Prediction;
