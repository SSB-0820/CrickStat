#app_T20.py
from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# -------------------------------
# Load T20 model
# -------------------------------
MODEL_PATH = "models/t20_allround_xgb_model.pkl"
model = joblib.load(MODEL_PATH)
print("T20 All-rounder model loaded.")

# -------------------------------
# Features
# -------------------------------
FEATURES = [
    'bat_matches','bat_innings','bat_not_out','bat_runs','bat_high_score','bat_ballsFaced','bat_strike_rate',
    'bat_100s','bat_50','bat_0s','bat_4s','bat_6s',
    'bowl_matches','bowl_innings','bowl_maidens','bowl_economy','bowl_strike_rate','bowl_wickets','bowl_balls_from_overs'
]

# -------------------------------
# Prediction endpoint
# -------------------------------
@app.route("/predict_t20", methods=["POST"])
def predict_t20():
    data = request.get_json()
    # Fill missing keys with 0
    row = {k: data.get(k, 0) for k in FEATURES}
    X = pd.DataFrame([row], columns=FEATURES)

    try:
        y = model.predict(X)[0]

        # Round predictions
        runs_pred = int(round(y[0])) if y[0] > 1 else 0
        strike_rate_pred = float(round(y[1], 2))
        wickets_pred = int(round(y[2])) if y[2] > 0.5 else 0
        economy_pred = float(round(y[3], 2))

        # Batting average
        innings = row.get('bat_innings', 1)
        not_outs = row.get('bat_not_out', 0)
        times_out = max(innings - not_outs, 1)
        average_pred = float(round(runs_pred / times_out, 2))

        result = {
            'runs': runs_pred,
            'average': average_pred,
            'strike_rate': strike_rate_pred,
            'wickets': wickets_pred,
            'economy': economy_pred
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------------------
# Run server
# -------------------------------
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5002, debug=False)
