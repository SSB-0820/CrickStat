const Player = require('../models/Player');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRE = '7d'; // token validity

// Generate JWT
const generateToken = (playerId) => {
    return jwt.sign({ id: playerId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Signup
exports.signup = async (req, res) => {
    try {
        const { name, password, age, team, role } = req.body;

        const existing = await Player.findOne({ name });
        if (existing) return res.status(400).json({ message: 'Player already exists' });

        const player = await Player.create({ name, password, age, team, role });
        const token = generateToken(player._id);

        res.status(201).json({ player: { id: player._id, name: player.name, team: player.team, role: player.role }, token });
    } catch (err) {
        res.status(500).json({ message: 'Signup failed', error: err.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { name, password } = req.body;

        const player = await Player.findOne({ name });
        if (!player) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await player.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = generateToken(player._id);
        res.json({ player: { id: player._id, name: player.name, team: player.team, role: player.role }, token });
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
};
