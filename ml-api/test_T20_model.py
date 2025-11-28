import joblib
import pandas as pd

# -------------------------------
# Load the trained model
# -------------------------------
model_file = "models/t20_allround_xgb_model.pkl"
model = joblib.load(model_file)
print("T20 all-rounder model loaded successfully!")

# -------------------------------
# Define sample input for testing
# -------------------------------
# Replace values with your test player stats
sample_input = {
    'bat_matches': 50,
    'bat_innings': 48,
    'bat_not_out': 10,
    'bat_runs': 1200,
    'bat_high_score': 120,
    'bat_ballsFaced': 1300,
    'bat_strike_rate': 180.4,
    'bat_100s': 5,
    'bat_50': 10,
    'bat_0s': 2,
    'bat_4s': 110,
    'bat_6s': 25,
    'bowl_matches': 50,
    'bowl_innings': 48,
    'bowl_maidens': 15,
    'bowl_economy': 7.5,
    'bowl_strike_rate': 22.0,
    'bowl_wickets': 25,
    'bowl_balls_from_overs': 300
}

# Convert to DataFrame
X_test = pd.DataFrame([sample_input])

# -------------------------------
# Make prediction
# -------------------------------
y_pred = model.predict(X_test)[0]

# Round predictions and handle small values
runs_pred = int(round(y_pred[0])) if y_pred[0] > 1 else 0
strike_rate_pred = round(y_pred[1], 2)
wickets_pred = int(round(y_pred[2])) if y_pred[2] > 0.5 else 0
economy_pred = round(y_pred[3], 2)

# Batting average calculation
innings = sample_input['bat_innings']
not_outs = sample_input['bat_not_out']
times_out = max(innings - not_outs, 1)
average_pred = round(runs_pred / times_out, 2)

# Print results
print("Predicted Results:")
print(f"Runs Projection      : {runs_pred}")
print(f"Batting Average      : {average_pred}")
print(f"Strike Rate Projection: {strike_rate_pred}")
print(f"Wickets Projection   : {wickets_pred}")
print(f"Economy Projection   : {economy_pred}")
