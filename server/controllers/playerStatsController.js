const PlayerStats = require('../models/PlayerStats');
const Player = require('../models/Player');
const { calculateDerivedStats } = require('../services/featureService');

exports.createOrUpdateStats = async (req, res) => {
    try {
        const { player: playerId, format, matches, innings, notOut, runs, ballsFaced, highScore, hundreds, fifties, ducks, fours, sixes, overs, runsConceded, wickets, maidens } = req.body;

        const player = await Player.findById(playerId);
        if (!player) return res.status(404).json({ message: 'Player not found' });

        const input = {
            player: playerId,
            format,
            matches: matches || 0,
            innings: innings || 0,
            notOut: notOut || 0,
            runs: runs || 0,
            ballsFaced: ballsFaced || 0,
            highScore: highScore || 0,
            hundreds: hundreds || 0,
            fifties: fifties || 0,
            ducks: ducks || 0,
            fours: fours || 0,
            sixes: sixes || 0,
            overs: overs || 0,
            runsConceded: runsConceded || 0,
            wickets: wickets || 0,
            maidens: maidens || 0,
            // bowlingStrikeRate: bowlingStrikeRate || 0
        };

        const derived = calculateDerivedStats(input);
        input.strikeRate = derived.strikeRate;
        input.ballsFromOvers = derived.ballsFromOvers;
        input.economy = derived.economy;
        input.bowlingStrikeRate = derived.bowlingStrikeRate;

        const stats = await PlayerStats.findOneAndUpdate(
            { player: playerId, format },
            input,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Error saving stats', error: err.message });
    }
};

exports.getStatsByPlayer = async (req, res) => {
    try {
        const stats = await PlayerStats.find({ player: req.params.playerId }).populate('player', 'name role').lean();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats', error: err.message });
    }
};
