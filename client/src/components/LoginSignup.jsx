//LoginSignup.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaUsers, FaChartLine, FaBaseballBall } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import "./LoginSignup.css";
import logoImg from "./cric_logo.png"; // Add your logo file here
import { useNavigate } from "react-router-dom";

function LoginSignup() {
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        password: "",
        confirmPassword: "",
        age: "",
        team: "",
        role: "",
    });

    const API = "http://localhost:8000/api/auth"; // backend URL

    const toggleForm = () => {
        setIsRegister(!isRegister);
        setFormData({ name: "", password: "", confirmPassword: "", age: "", team: "", role: "" });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!isRegister) {
                const res = await axios.post(`${API}/login`, {
                    name: formData.name,
                    password: formData.password,
                });

                Swal.fire({
                    icon: "success",
                    title: "Login Successful!",
                    text: `Welcome back, ${res.data.player.name}!`,
                    confirmButtonColor: "#00b4d8",
                }).then(() =>{
                    navigate("/dashboard")
                });

                localStorage.setItem("token", res.data.token);
                localStorage.setItem("playerId", res.data.player.id);

            } else {
                if (formData.password !== formData.confirmPassword) {
                    return Swal.fire({
                        icon: "error",
                        title: "Password Mismatch",
                        text: "Passwords do not match!",
                        confirmButtonColor: "#d33",
                    });
                }

                const res = await axios.post(`${API}/signup`, {
                    name: formData.name,
                    password: formData.password,
                    age: formData.age,
                    team: formData.team,
                    role: formData.role,
                });

                Swal.fire({
                    icon: "success",
                    title: "Registered Successfully!",
                    text: "You can now login.",
                    confirmButtonColor: "#00b4d8",
                });

                localStorage.setItem("playerId", res.data.player.id);
                toggleForm();
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Oops!",
                text: err.response?.data?.message || "Something went wrong",
                confirmButtonColor: "#d33",
            });
        }
    };

    return (
        <div className="auth-page">
            <div className="stadium-overlay"></div>

            <div className="main-horizontal-container">
                {/* Logo */}
                <motion.img
                    src={logoImg}
                    alt="CricStat Logo"
                    className="side-logo"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px #00b4d8" }}
                />

                {/* Auth Forms */}
                <motion.div
                    key={isRegister ? "register" : "login"}
                    initial={{ y: isRegister ? "-100%" : "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: isRegister ? "100%" : "-100%", opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="auth-container"
                >
                    <h2 className="auth-title">
                        {isRegister ? (
                            <>
                                <FaUsers className="icon" /> Player Registration
                            </>
                        ) : (
                            <>
                                <FaChartLine className="icon" /> Login
                            </>
                        )}
                    </h2>

                    {!isRegister ? (
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <FaUser className="input-icon" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Username"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <FaLock className="input-icon" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn">Login</button>
                            <p className="toggle-text">
                                Not registered?{" "}
                                <span onClick={toggleForm} className="toggle-link">Register</span>
                            </p>
                        </form>
                    ) : (
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <FaUser className="input-icon" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Username"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <FaLock className="input-icon" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <FaLock className="input-icon" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <FaBaseballBall className="input-icon" />
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="Age (optional)"
                                    value={formData.age}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <FaUsers className="input-icon" />
                                <input
                                    type="text"
                                    name="team"
                                    placeholder="Team (optional)"
                                    value={formData.team}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="Batsman">Batsman</option>
                                    <option value="Bowler">Bowler</option>
                                    <option value="All-rounder">All-rounder</option>
                                    <option value="Wicketkeeper">Wicketkeeper</option>
                                </select>
                            </div>
                            <button type="submit" className="btn">Register</button>
                            <p className="toggle-text">
                                Already registered?{" "}
                                <span onClick={toggleForm} className="toggle-link">Login</span>
                            </p>
                        </form>
                    )}
                </motion.div>

                {/* Welcome Section */}
                <motion.div
                    className="welcome-section"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <h1>Welcome to CricStat</h1>
                    <h3>Your Cricket Performance Analyzer</h3>
                </motion.div>
            </div>
        </div>
    );
}

export default LoginSignup;
