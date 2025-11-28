// server/routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const playerStatsController = require('../controllers/playerStatsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, playerStatsController.createOrUpdateStats);
router.get('/player/:playerId', authMiddleware, playerStatsController.getStatsByPlayer);

module.exports = router;
