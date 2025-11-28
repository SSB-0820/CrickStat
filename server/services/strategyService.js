// server/services/strategyService.js
const fetch = require('node-fetch');
require('dotenv').config();

// -----------------------------
// Helper: Random advice picker
// -----------------------------
function getRandomAdvices(pool, count = 2) {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// -----------------------------
// AI-based dynamic strategy generator using OpenRouter
// -----------------------------
async function getAIAdvice(playerStats, prediction) {
    try {
        const { player, format } = playerStats;
        const role = player?.role || 'Batsman';

        const prompt = `
You are an expert cricket analyst.
Generate 3 highly specific and personalized cricket strategy insights based on:
1️⃣ Player's Role: ${role}
2️⃣ Match Format: ${format}
3️⃣ Comparison between actual and predicted stats.

⚙️ Rules:
- Do not sound like AI.
- The answer should contain only the strategy part not anything extra like an ai answer.
- Use actuall player numbers while giving strategies, so it feels more player specific.
- Use clear bullet points (•).
- Keep tone: professional, direct, and analytical but at the same time it should be concise & player friendly.
- Focus strategies relevant to BOTH role (${role}) and format (${format}).
- Avoid generic advice, tailor it for this combination (e.g., T20 Batsman vs Test Bowler).
- Maintain formatting with proper line breaks.
- Output should be clean text only, no markdown or extra symbols.

📊 Player Performance:
Actual:
  Runs: ${playerStats.runs}
  Strike Rate: ${playerStats.strikeRate}
  Wickets: ${playerStats.wickets}
  Economy: ${playerStats.economy}
Predicted:
  Runs: ${prediction.runs}
  Strike Rate: ${prediction.strike_rate}
  Wickets: ${prediction.wickets}
  Economy: ${prediction.economy}
`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": process.env.SITE_URL || "https://localhost",
                "X-Title": process.env.SITE_TITLE || "CrickStat",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openai/gpt-4o-mini",
                "messages": [
                    { "role": "system", "content": "You are a professional cricket performance strategist." },
                    { "role": "user", "content": prompt }
                ],
                "max_tokens": 180
            })
        });

        if (!response.ok) {
            console.error("OpenRouter API error:", await response.text());
            return null;
        }

        const data = await response.json();
        const adviceText = data?.choices?.[0]?.message?.content || null;

        if (adviceText) {
            // Use double newlines and bullets with clearer structure
            return adviceText
                .replace(/\*\*/g, '') // remove markdown bolds
                .replace(/-\s*/g, '\n• ') // bullet formatting
                .replace(/•\s*/g, '\n• ') // ensure line break before bullet
                .replace(/\n{2,}/g, '\n') // remove excessive line breaks
                .replace(/\r/g, '') // clean carriage returns
                .trim();
        }

        return null;
    } catch (err) {
        console.error("AI strategy generation failed:", err.message);
        return null;
    }
}

// -----------------------------
// Main Strategy Generator (AI + Original Rule-based restored)
// -----------------------------
async function generateStrategy(playerStats, prediction) {
    const role = playerStats.player?.role || 'Batsman';
    const format = playerStats.format || 'ODI';

    // -------------------
    // Extract and round values
    // -------------------
    const round = (val, decimals = 2) => Number(val || 0).toFixed(decimals);

    const runsPred = round(prediction.runs);
    const srPred = round(prediction.strike_rate);
    const wkPred = round(prediction.wickets);
    const econPred = round(prediction.economy);

    const runsActual = round(playerStats.runs);
    const srActual = round(playerStats.strikeRate);
    const wkActual = round(playerStats.wickets);
    const econActual = round(playerStats.economy);

    // -------------------
    // Relative difference calculations
    // -------------------
    const relDiff = (pred, actual) => actual == 0 ? 1 : (pred - actual) / actual;

    const runDiff = relDiff(runsPred, runsActual);
    const srDiff = relDiff(srPred, srActual);
    const wkDiff = relDiff(wkPred, wkActual);
    const econDiff = relDiff(econPred, econActual);

    // -------------------
    // Advice pools
    // -------------------
    const batAdvices = [
        'Focus on strike rotation and placement.',
        'Work on shot selection to increase scoring rate.',
        'Convert starts into 50s and 100s.',
        'Adapt batting style according to match situation.',
        'Practice running between wickets for quick singles.',
        'Maintain composure under pressure.',
        'Enhance timing and footwork for aggressive shots.',
        'Target gaps in field for easy boundaries.',
        'Play risk-free shots early in innings.',
        'Work on improving backfoot play against short balls.'
    ];

    const bowlAdvices = [
        'Practice wicket-taking variations: slower balls, bouncers, cutters.',
        'Focus on hitting the right length consistently.',
        'Analyze batsmen weaknesses and target accordingly.',
        'Improve yorkers and slower deliveries.',
        'Work on consistent line and length under pressure.',
        'Mix up pace to disrupt batsman rhythm.',
        'Focus on economy in powerplay overs.',
        'Develop new variations for surprise deliveries.',
        'Practice bowling long spells without losing accuracy.',
        'Use field placements effectively to support bowling plan.'
    ];

    const formatTips = {
        T20: {
            batting: [
                'Focus on power-hitting and high strike rate.',
                'Aggressive running between wickets is essential.',
                'Fielding and agility are very important in T20.',
                'Practice finishing matches under pressure.',
                'Use innovative shots like scoops and ramps.',
                'Exploit powerplays with aggressive batting.',
                'Keep fitness high for fast-paced matches.',
                'Adapt to small boundaries and short pitches.'
            ],
            bowling: [
                'Bowling in death overs is crucial.',
                'Work on yorkers and slower balls for death overs.',
                'Focus on economy in powerplay overs.',
                'Use variations to outsmart batters.'
            ]
        },
        ODI: {
            batting: [
                'Build innings with balance of aggression and stability.',
                'Rotate strike regularly to keep scoreboard ticking.',
                'Pace the innings according to match situation.',
                'Adapt to powerplays and death overs effectively.',
                'Practice partnerships to anchor innings.'
            ],
            bowling: [
                'Bowling accuracy over longer spells is important.',
                'Focus on field placement strategies.',
                'Work on maintaining focus for 50 overs.',
                'Develop stamina for long bowling spells.'
            ]
        },
        Test: {
            batting: [
                'Focus on patience and long innings.',
                'Concentration and mental toughness are crucial.',
                'Play each session with clear plan and shot selection.',
                'Focus on defensive technique to survive spells.',
                'Build partnerships to stabilize innings.'
            ],
            bowling: [
                'Bowling consistency and stamina are key.',
                'Set small session targets for wickets.',
                'Plan bowling changes to exploit fatigue.',
                'Analyze pitch conditions deeply.',
                'Work on endurance for multi-day performance.'
            ]
        }
    };

    // -------------------
    // Dynamic suggestions based on differences
    // -------------------
    let dynamicAdvice = [];

    if (role === 'Batsman' || role === 'All-rounder') {
        if (srDiff < -0.1) {
            dynamicAdvice.push(`Your strike rate (${srActual}) is projected to drop to ${srPred}. Focus on aggressive shot selection and quicker singles.`);
        } else if (srDiff === 0) {
            dynamicAdvice.push(`Your strike rate is expected to remain steady at ${srActual}. Maintain consistency with current approach.`);
        }

        if (runDiff < -0.1) {
            dynamicAdvice.push(`Your runs are predicted to fall from ${runsActual} to ${runsPred}. Work on converting starts into big scores.`);
        } else if (runDiff === 0) {
            dynamicAdvice.push(`Your run tally is projected to remain stable at ${runsActual}. Keep building innings the same way.`);
        }

        if (dynamicAdvice.length === 0) {
            dynamicAdvice.push(...getRandomAdvices(batAdvices, 2));
        }
    }

    if (role === 'Bowler' || role === 'All-rounder') {
        if (wkDiff < -0.1) {
            dynamicAdvice.push(`Your wicket count (${wkActual}) is predicted to decline to ${wkPred}. Focus on wicket-taking variations.`);
        } else if (wkDiff === 0) {
            dynamicAdvice.push(`Your wicket-taking ability is consistent at ${wkActual}. Keep focusing on line and length.`);
        }

        if (econDiff > 0.1) {
            dynamicAdvice.push(`Your economy rate is expected to rise from ${econActual} to ${econPred}. Focus on accuracy and line.`);
        } else if (econDiff === 0) {
            dynamicAdvice.push(`Your economy is stable at ${econActual}. Maintain this disciplined bowling.`);
        }

        if (dynamicAdvice.length === 0) {
            dynamicAdvice.push(...getRandomAdvices(bowlAdvices, 2));
        }
    }

    // -------------------
    // Format-specific tips filtered by role
    // -------------------
    let selectedFormatTips = [];
    if (role === 'Batsman') {
        selectedFormatTips = formatTips[format]?.batting || [];
    } else if (role === 'Bowler') {
        selectedFormatTips = formatTips[format]?.bowling || [];
    } else {
        selectedFormatTips = [
            ...(formatTips[format]?.batting || []),
            ...(formatTips[format]?.bowling || [])
        ];
    }

    // 🧠 Get AI-enhanced strategy
    const aiAdvice = await getAIAdvice(playerStats, prediction);

    // -------------------
    // Assemble final strategy with better formatting
    // -------------------
    const strategy = [
        `Performance Summary:\nRuns: ${runsActual} → ${runsPred}\nStrike Rate: ${srActual} → ${srPred}\nWickets: ${wkActual} → ${wkPred}\nEconomy: ${econActual} → ${econPred}`,
        `\n🧠 AI-Generated Dynamic Strategy:\n${aiAdvice || dynamicAdvice.map(a => `• ${a}`).join('\n')}`
    ];

    if (playerStats.matches < 10) {
        strategy.push('\n⚠️ Warning: Predictions are low-confidence; gather at least 10 matches for reliable advice.');
    }

    return strategy;
}

module.exports = { generateStrategy };
