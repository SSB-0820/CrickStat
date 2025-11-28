// server/controllers/predictionController.js
const PlayerStats = require('../models/PlayerStats');
const Prediction = require('../models/Prediction');
const Player = require('../models/Player');
const { generateStrategy } = require('../services/strategyService');
const fetch = require('node-fetch');

const MIN_MATCHES = { ODI: 10, T20: 15, Test: 10 };

exports.predictForPlayer = async (req, res) => {
    try {
        const { playerId, format } = req.params;

        // Fetch player stats
        const stats = await PlayerStats.findOne({ player: playerId, format })
            .populate('player', 'name role')
            .lean();
        if (!stats) return res.status(404).json({ message: 'Stats not found. Please add player stats first.' });
        console.log("Predict request:", { playerId, format });

        // Minimum matches check
        if (stats.matches < MIN_MATCHES[format]) {
            return res.status(400).json({ message: `Not enough matches. Need at least ${MIN_MATCHES[format]}`, matches: stats.matches });
        }

        // Prepare payload for ML model
        const payload = {
            // Batting features
            bat_matches: stats.matches,
            bat_innings: stats.innings,
            bat_not_out: stats.notOut,
            bat_runs: stats.runs,
            bat_high_score: stats.highScore,
            bat_ballFaced: stats.ballsFaced,
            bat_strike_rate: stats.strikeRate,
            bat_100s: stats.hundreds || 0,
            bat_50: stats.fifties || 0,
            bat_0s: stats.ducks || 0,
            bat_4s: stats.fours || 0,
            bat_6s: stats.sixes || 0,

            // Bowling features
            bowl_matches: stats.matches,
            bowl_innings: stats.innings,
            bowl_maidens: stats.maidens || 0,
            bowl_economy: stats.economy || 0,
            bowl_strike_rate: stats.bowlingStrikeRate || 0,
            bowl_wickets: stats.wickets || 0,
            bowl_balls_from_overs: stats.ballsFromOvers || 0,
        };

        // Determine Python API URL based on format
        // const PY_URL_ODI = process.env.PY_PREDICT_ODI || 'http://127.0.0.1:5000/predict';
        // const PY_URL_TEST = process.env.PY_PREDICT_TEST || 'http://127.0.0.1:5001/predict_test';
        // const PY_URL = format === 'Test' ? PY_URL_TEST : PY_URL_ODI;
        // Determine Python API URL based on format
        const PY_URL_ODI = process.env.PY_PREDICT_ODI || 'http://127.0.0.1:5000/predict';
        const PY_URL_TEST = process.env.PY_PREDICT_TEST || 'http://127.0.0.1:5001/predict_test';
        const PY_URL_T20 = process.env.PY_PREDICT_T20 || 'http://127.0.0.1:5002/predict_t20';

        let PY_URL;
        if (format === 'ODI') PY_URL = PY_URL_ODI;
        else if (format === 'Test') PY_URL = PY_URL_TEST;
        else if (format === 'T20') PY_URL = PY_URL_T20;
        else return res.status(400).json({ message: 'Invalid format' });

        // Call Python prediction service
        const r = await fetch(PY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!r.ok) {
            return res.status(500).json({ message: 'Prediction service error', error: await r.text() });
        }

        const pred = await r.json();

        // Generate strategy
        const strategy = await generateStrategy(stats, pred);

        // Save prediction
        const savedPrediction = await Prediction.create({ player: playerId, format, prediction: pred, strategy });

        // Update lastPredictedAt
        await PlayerStats.findByIdAndUpdate(stats._id, { lastPredictedAt: new Date() });

        // Return response
        return res.json({ player: stats.player, stats, prediction: pred, strategy, savedPrediction });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error generating prediction', error: err.message });
    }
};


// New controller for fetching all predictions
exports.getPredictionsHistory = async (req, res) => {
    try {
        const { playerId, format } = req.params;
        const predictions = await Prediction.find({ player: playerId, format })
            .sort({ createdAt: -1 }); // latest first
        return res.json(predictions);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching prediction history', error: err.message });
    }
};
