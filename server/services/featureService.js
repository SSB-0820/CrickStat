// server/services/featureService.js
function calculateDerivedStats(stats) {
    const ballsFaced = Number(stats.ballsFaced || 0);
    const runs = Number(stats.runs || 0);
    const innings = Number(stats.innings || 0);
    const notOut = Number(stats.notOut || 0);
    const overs = Number(stats.overs || 0);
    const runsConceded = Number(stats.runsConceded || 0);

    const strikeRate = ballsFaced > 0 ? (runs / ballsFaced) * 100 : 0;
    const ballsFromOvers = overs > 0 ? Math.round(overs * 6) : 0;
    const economy = overs > 0 ? (runsConceded / overs) : 0;
    // Bowling strike rate = balls bowled / wickets (avoid divide by 0)
    const bowlingStrikeRate = stats.wickets > 0 ? ballsFromOvers / stats.wickets : 0;


    return {
        strikeRate: Number(strikeRate.toFixed(2)),
        ballsFromOvers,
        economy: Number(economy.toFixed(2)),
        bowlingStrikeRate: Number(bowlingStrikeRate.toFixed(2))
    };
}

module.exports = { calculateDerivedStats };
