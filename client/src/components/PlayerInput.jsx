//PlayerInput.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUserCircle,
    FaBaseballBall,
    FaUsers,
    FaSignOutAlt,
    FaQuestionCircle,
    FaRunning,
    FaHandPaper,
    FaMedal,
    FaFutbol,
    FaBowlingBall,
    FaSortNumericUp,
    FaTrophy
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import "./PlayerInput.css";
import logoImg from "./cric_logo.png"; // put your dashboard logo in assets

function PlayerInput() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        format: "ODI",
        matches: "",
        innings: "",
        notOut: "",
        runs: "",
        ballsFaced: "",
        highScore: "",
        hundreds: "",
        fifties: "",
        ducks: "",
        fours: "",
        sixes: "",
        overs: "",
        runsConceded: "",
        wickets: "",
        maidens: "",
    });

    // const [profileOpen, setProfileOpen] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) navigate("/"); // redirect to login if not logged in
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const playerId = localStorage.getItem("playerId")
            await axios.post("http://localhost:8000/api/player-stats", { ...formData, player: playerId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // ✅ Save selected format for Predictions page
            localStorage.setItem("format", formData.format);


            Swal.fire({
                icon: "success",
                title: "Stats Submitted!",
                text: "You can now view predictions.",
                confirmButtonColor: "#00b4d8",
            });

            setFormData({
                format: "ODI",
                matches: "",
                innings: "",
                notOut: "",
                runs: "",
                ballsFaced: "",
                highScore: "",
                hundreds: "",
                fifties: "",
                ducks: "",
                fours: "",
                sixes: "",
                overs: "",
                runsConceded: "",
                wickets: "",
                maidens: "",
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: err.response?.data?.message || "Something went wrong",
                confirmButtonColor: "#d33",
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="player-input-page">
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


            {/* Player Input Form */}
            <div className="input-container">
                <h2 className="input-title">Player Input</h2>
                <form className="player-form" onSubmit={handleSubmit}>

                    {/* Format (select) */}
                    <div className="form-group">
                        <FaUsers />
                        <select
                            name="format"
                            value={formData.format}
                            onChange={handleChange}
                            required
                        >
                            <option value="ODI">ODI</option>
                            <option value="T20">T20</option>
                            <option value="Test">Test</option>
                        </select>
                    </div>

                    {/* Remaining fields */}
                    {[
                        { name: "matches", placeholder: "Matches", icon: <FaBaseballBall /> },
                        { name: "innings", placeholder: "Innings", icon: <FaHandPaper /> },
                        { name: "notOut", placeholder: "Not Out", icon: <FaRunning /> },
                        { name: "runs", placeholder: "Runs", icon: <FaMedal /> },
                        { name: "ballsFaced", placeholder: "Balls Faced", icon: <FaFutbol /> },
                        { name: "highScore", placeholder: "High Score", icon: <FaTrophy /> },
                        { name: "hundreds", placeholder: "Hundreds", icon: <FaSortNumericUp /> },
                        { name: "fifties", placeholder: "Fifties", icon: <FaSortNumericUp /> },
                        { name: "ducks", placeholder: "Ducks", icon: <FaBowlingBall /> },
                        { name: "fours", placeholder: "Fours", icon: <FaBaseballBall /> },
                        { name: "sixes", placeholder: "Sixes", icon: <FaBaseballBall /> },
                        { name: "overs", placeholder: "Overs", icon: <FaBowlingBall /> },
                        { name: "runsConceded", placeholder: "Runs Conceded", icon: <FaBowlingBall /> },
                        { name: "wickets", placeholder: "Wickets", icon: <FaBowlingBall /> },
                        { name: "maidens", placeholder: "Maidens", icon: <FaBowlingBall /> },
                    ].map((field) => (
                        <div className="form-group" key={field.name}>
                            {field.icon}
                            <input
                                type="number"
                                name={field.name}
                                placeholder={field.placeholder}
                                value={formData[field.name]}
                                onChange={handleChange}
                                required={false}
                            />
                        </div>
                    ))}

                    <button type="submit" className="btn">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default PlayerInput;
