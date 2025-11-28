// server/controllers/playerController.js
const Player = require('../models/Player');

exports.createPlayer = async (req, res) => {
    try {
        const p = new Player(req.body);
        const saved = await p.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: 'Error creating player', error: err.message });
    }
};

exports.getPlayers = async (req, res) => {
    try {
        const players = await Player.find().lean();
        res.json(players);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching players', error: err.message });
    }
};
