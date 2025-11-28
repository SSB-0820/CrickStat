// server/routes/predictionRoutes.js
const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:playerId/:format', authMiddleware, predictionController.predictForPlayer);

router.get('/history/:playerId/:format', authMiddleware, predictionController.getPredictionsHistory);
module.exports = router;