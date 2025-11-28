//Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaQuestionCircle } from "react-icons/fa";
import axios from "axios";
import logoImg from "./cric_logo.png";
import "./Dashboard.css";

// Recharts imports (you said you have recharts)
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

function Dashboard() {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const [format, setFormat] = useState("ODI");
    const [history, setHistory] = useState([]);

    // Token check
    useEffect(() => {
        const token = localStorage.getItem("token");
        const playerId = localStorage.getItem("playerId");
        if (!token || !playerId) {
            navigate("/login");
        } else {
            fetchHistory(playerId, format, token);
        }
    }, [navigate, format]);

    const fetchHistory = async (playerId, format, token) => {
        try {
            const res = await axios.get(`http://localhost:8000/api/predictions/history/${playerId}/${format}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // backend may return single or multiple predictions
            const allPredictions = Array.isArray(res.data) ? res.data : [res.data];
            setHistory(allPredictions);
        } catch (err) {
            console.error(err);
            setHistory([]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Prepare chart data (last 10 items, oldest -> newest order for chart)
    const chartData = (() => {
        if (!history || history.length === 0) return [];
        const items = history.slice().reverse().slice(0, 10).reverse(); // keep chronological for x-axis
        return items.map((h, idx) => ({
            name: `M${idx + 1}`,
            runs: h.prediction?.runs ?? 0,
            wickets: h.prediction?.wickets ?? 0,
            strike_rate: h.prediction?.strike_rate ?? 0,
        }));
    })();

    const latest = history && history.length > 0 ? history[0] : null;

    return (
        <div className="dashboard-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="logo-container" onClick={() => navigate("/dashboard")}>
                    <img src={logoImg} alt="CricStat Logo" className="navbar-logo" />
                </div>
                <div className="nav-links">
                    <Link to="/player-input" className="nav-link">Player Input</Link>
                    <Link to="/predictions" className="nav-link">Predictions</Link>
                </div>
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
                            <li>Step 3: Check your history here in Dashboard</li>
                        </ol>
                        <button className="btn-close" onClick={() => setShowHelp(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="dashboard-content">
                <h1>Welcome to CricStat Dashboard</h1>
                <p>Select "Player Input" or "Predictions" from the navbar.</p>

                {/* PLAYER SUMMARY (keeps structure and theme) */}
                {latest && (
                    <div className="player-summary">
                        <div className="player-summary-left">
                            <h2 className="player-name">{latest.playerName || "Player"}</h2>
                            <p className="player-meta">Last prediction: {latest.format || format} — {new Date(latest.createdAt || latest.date || Date.now()).toLocaleDateString()}</p>
                        </div>
                        <div className="summary-stats">
                            <div className="summary-box">
                                <h4>Total Matches</h4>
                                <p>{latest.total_matches ?? latest.meta?.total_matches ?? "--"}</p>
                            </div>
                            <div className="summary-box">
                                <h4>Avg Runs</h4>
                                <p>{(latest.meta?.avg_runs ?? latest.avg_runs ?? latest.prediction?.average ?? "--")}</p>
                            </div>
                            <div className="summary-box">
                                <h4>Recent Strike Rate</h4>
                                <p>{latest.prediction?.strike_rate ?? "--"}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Format Selector */}
                <div className="format-selector">
                    <label>View History for: </label>
                    <select value={format} onChange={(e) => setFormat(e.target.value)}>
                        <option value="ODI">ODI</option>
                        <option value="T20">T20</option>
                        <option value="Test">Test</option>
                    </select>
                </div>

                {/* History Container */}
                <div className="history-container">
                    {history.length > 0 ? (
                        <>
                            <div className="history-grid">
                                {history.map((item, idx) => (
                                    <div key={idx} className="history-card">
                                        <div className="history-card-header">
                                            <h3>Prediction {idx + 1}</h3>
                                            <span className="history-date">{item.date ? new Date(item.date).toLocaleDateString() : ""}</span>
                                        </div>
                                        <p><strong>Runs:</strong> {item.prediction?.runs}</p>
                                        <p><strong>Strike Rate:</strong> {item.prediction?.strike_rate}</p>
                                        <p><strong>Wickets:</strong> {item.prediction?.wickets}</p>
                                        <p><strong>Economy:</strong> {item.prediction?.economy}</p>
                                        <p><strong>Average:</strong> {item.prediction?.average}</p>
                                        {item.strategy?.length > 0 && (
                                            <div className="strategy-list">
                                                <strong>Strategies:</strong>
                                                <ul>
                                                    {item.strategy.map((s, i) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Performance Trends (Recharts) */}
                            <div className="performance-chart">
                                <h3>Recent Performance Trends</h3>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="name" tick={{ fill: "#90e0ef" }} />
                                            <YAxis tick={{ fill: "#90e0ef" }} />
                                            <Tooltip wrapperStyle={{ backgroundColor: "rgba(10,25,47,0.95)", color: "#fff", borderRadius: 6 }} />
                                            <Legend wrapperStyle={{ color: "#90e0ef" }} />
                                            <Line type="monotone" dataKey="runs" stroke="#00b4d8" strokeWidth={2} dot={{ r: 3 }} />
                                            <Line type="monotone" dataKey="wickets" stroke="#90e0ef" strokeWidth={2} dot={{ r: 3 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="no-data">Not enough data to render trends.</p>
                                )}
                            </div>

                            {/* Player Insights */}
                            <div className="player-insights">
                                <h3>Insights</h3>
                                <p>
                                    {latest
                                        ? `Latest prediction suggests ${latest.playerName || "the player"} is likely to score ${latest.prediction?.runs ?? "--"} runs and take ${latest.prediction?.wickets ?? "--"} wickets in ${format}.`
                                        : "No insights available."}
                                </p>
                                <p>
                                    Suggested focus:{" "}
                                    {latest && (latest.prediction?.runs ?? 0) > 50
                                        ? "Maintain batting form and focus on converting starts to big scores."
                                        : "Work on strike rate and middle-overs stability."}
                                </p>
                            </div>
                        </>
                    ) : (
                        <p>No predictions found for {format}.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
