// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// -------------------------------
// MongoDB Connection
// -------------------------------
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cricstat';
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// -------------------------------
// Routes
// -------------------------------
const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const playerStatsRoutes = require('./routes/playerStatsRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/player-stats', playerStatsRoutes);
app.use('/api/predictions', predictionRoutes);

// -------------------------------
// Default route
// -------------------------------
app.get('/', (req, res) => {
    res.send('CricStat API is running...');
});

// -------------------------------
// Error handling
// -------------------------------
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// -------------------------------
// Start server
// -------------------------------
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
