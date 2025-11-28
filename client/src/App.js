//App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginSignup from "./components/LoginSignup";
import Dashboard from "./components/Dashboard";
import PlayerInput from "./components/PlayerInput";
import Predictions from "./components/Predictions"

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login / Signup page */}
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/player-input" element={<PlayerInput />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="*" element={<LoginSignup />} /> {/* fallback */}
      </Routes>
    </Router>
  );
}

export default App;
