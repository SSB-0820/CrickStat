// // server/routes/playerStatsRoutes.js
const express = require('express');
const router = express.Router();
const playerStatsController = require('../controllers/playerStatsController');

// Route to create or update player stats
router.post('/', playerStatsController.createOrUpdateStats);

// Route to get stats by player ID
router.get('/player/:playerId', playerStatsController.getStatsByPlayer);

module.exports = router;
