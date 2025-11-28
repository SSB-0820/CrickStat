import joblib
import pandas as pd

# Load model
model_path = "models/test_allround_xgb_model.pkl"
model = joblib.load(model_path)
print("Model loaded successfully!")

# Example input (all-rounder)
sample_input = {
    'bat_matches': 50,
    'bat_innings': 48,
    'bat_not_out': 10,
    'bat_runs': 2300,
    'bat_high_score': 150,
    'bat_ballsFaced': 2500,
    'bat_strike_rate': 43,
    'bat_100s': 15,
    'bat_50': 20,
    'bat_0s': 2,
    'bat_4s': 230,
    'bat_6s': 50,
    'bowl_matches': 50,
    'bowl_innings': 48,
    'bowl_maidens': 10,
    'bowl_economy': 4,
    'bowl_strike_rate': 30.2,
    'bowl_wickets': 20,
    'bowl_balls_from_overs': 2400
}

# Convert to DataFrame
X_test = pd.DataFrame([sample_input])

# Predict
y_pred = model.predict(X_test)[0]
print("Predicted values:")
print(f"Batting runs: {y_pred[0]:.2f}")
print(f"Batting strike rate: {y_pred[1]:.2f}")
print(f"Bowling wickets: {y_pred[2]:.2f}")
print(f"Bowling economy: {y_pred[3]:.2f}")
