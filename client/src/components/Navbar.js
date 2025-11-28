import React from "react";
import { Link } from "react-router-dom";
import './Navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <h2 className="logo">CrickStat</h2>
            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/form">Input</Link>
                <Link to="/stats">Stats</Link>
                <Link to="/predict">Predict</Link>
            </div>
        </nav>
    );
}

export default Navbar;
