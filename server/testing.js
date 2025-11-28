require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Player = require('./models/Player');
const PlayerStats = require('./models/PlayerStats');
const Prediction = require('./models/Prediction');

const run = async () => {
    try {
        // Connect to MongoDB Atlas
        await connectDB(process.env.MONGO_URI);

        // Step 1: Insert Player
        const newPlayer = new Player({
            name: 'Virat Kohli',
            age: 35,
            team: 'India',
            role: 'Batsman'
        });
        const savedPlayer = await newPlayer.save();
        console.log('Player saved:', savedPlayer);

        // Step 2: Insert Player Stats
        const stats = new PlayerStats({
            playerId: savedPlayer._id,
            format: 'ODI',
            matches: 250,
            runs: 12000,
            wickets: 0,
            catches: 120,
            strikeRate: 93.2,
            average: 59.5,
            highScore: 183
        });
        const savedStats = await stats.save();
        console.log('Player stats saved:', savedStats);

        // Step 3: Insert Prediction
        const prediction = new Prediction({
            playerId: savedPlayer._id,
            format: 'ODI',
            predictedRuns: 85,
            predictedWickets: 0
        });
        const savedPrediction = await prediction.save();
        console.log('Prediction saved:', savedPrediction);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

// Call the async function
run();
