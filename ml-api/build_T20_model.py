#build_T20_model.py
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputRegressor
from xgboost import XGBRegressor
import joblib
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import numpy as np

# -------------------------------
# Paths
# -------------------------------
data_path = os.path.join("..", "datasets", "cleaned")  # cleaned datasets
output_path = os.path.join("models")  # folder to save models
os.makedirs(output_path, exist_ok=True)

# -------------------------------
# Load datasets
# -------------------------------
batting_df = pd.read_csv(os.path.join(data_path, "t20_batting_cleaned.csv"))
bowling_df = pd.read_csv(os.path.join(data_path, "t20_bowling_cleaned.csv"))

# -------------------------------
# Rename batting columns with prefix
# -------------------------------
batting_df = batting_df.rename(columns={
    'matches': 'bat_matches',
    'innings': 'bat_innings',
    'not_out': 'bat_not_out',
    'runs': 'bat_runs',
    'high_score': 'bat_high_score',
    'ball_faced': 'bat_ballsFaced',
    'strike_rate': 'bat_strike_rate',
    '100s': 'bat_100s',
    '50': 'bat_50',
    '0s': 'bat_0s',
    '4s': 'bat_4s',
    '6s': 'bat_6s'
})

# -------------------------------
# Rename bowling columns with prefix
# -------------------------------
bowling_df = bowling_df.rename(columns={
    'mt': 'bowl_matches',
    'in': 'bowl_innings',
    'md': 'bowl_maidens',
    'bwe': 'bowl_economy',
    'bwsr': 'bowl_strike_rate',
    'wk': 'bowl_wickets',
    'balls_from_overs': 'bowl_balls_from_overs'
})

# -------------------------------
# Merge datasets on 'id'
# -------------------------------
player_df = pd.merge(batting_df, bowling_df, on='id', how='outer')

# -------------------------------
# Fill NaN with 0 for numeric columns
# -------------------------------
from sklearn.impute import SimpleImputer
numeric_cols = player_df.select_dtypes(include=['float64', 'int64']).columns
fully_nan_cols = [col for col in numeric_cols if player_df[col].isna().all()]
cols_for_imputation = [col for col in numeric_cols if col not in fully_nan_cols]
imputer = SimpleImputer(strategy='median')
player_df[cols_for_imputation] = imputer.fit_transform(player_df[cols_for_imputation])
player_df[fully_nan_cols] = player_df[fully_nan_cols].fillna(0)
print(f"Median imputation appliead. {len(fully_nan_cols)} columns were fully NaN & filled 0")

# -------------------------------
# Features for all-rounder model
# -------------------------------
allround_features = [
    # Batting
    'bat_matches', 'bat_innings', 'bat_not_out', 'bat_runs', 'bat_high_score', 
    'bat_ballsFaced', 'bat_strike_rate', 'bat_100s', 'bat_50', 'bat_0s', 'bat_4s', 'bat_6s',
    # Bowling
    'bowl_matches', 'bowl_innings', 'bowl_maidens', 'bowl_economy', 'bowl_strike_rate', 
    'bowl_wickets', 'bowl_balls_from_overs'
]

# -------------------------------
# Targets
# -------------------------------
targets = ['bat_runs', 'bat_strike_rate', 'bowl_wickets', 'bowl_economy']

X = player_df[allround_features]
y = player_df[targets]

# -------------------------------
# Train-test split
# -------------------------------
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# -------------------------------
# Train multi-output XGBoost model
# -------------------------------
xgb_model = MultiOutputRegressor(
    XGBRegressor(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )
)

xgb_model.fit(X_train, y_train)
print("XGBoost all-rounder model trained successfully!")

# -------------------------------
# Evaluate model
# -------------------------------
y_pred = xgb_model.predict(X_test)
print("R² Score:", r2_score(y_test, y_pred, multioutput='raw_values'))
print("MAE:", mean_absolute_error(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))

# -------------------------------
# Save model
# -------------------------------
model_file = os.path.join(output_path, "t20_allround_xgb_model.pkl")
joblib.dump(xgb_model, model_file)
print(f"All-rounder model saved at: {model_file}")
