// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Player = require('../models/Player');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header missing or malformed' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const player = await Player.findById(decoded.id).select('-password');
        if (!player) return res.status(401).json({ message: 'Player not found' });

        req.player = player; // attach player info to request
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: 'Unauthorized', error: err.message });
    }
};

module.exports = authMiddleware;
