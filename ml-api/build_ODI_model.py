#build_ODI_model.py
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
batting_df = pd.read_csv(os.path.join(data_path, "odi_batting_cleaned.csv"))
bowling_df = pd.read_csv(os.path.join(data_path, "odi_bowling_cleaned.csv"))

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
# Extended Evaluation for Research Paper (Corrected MAPE + Better Display)
# -------------------------------
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import mean_absolute_percentage_error

# Safe MAPE calculation (avoids division by zero)
def safe_mape(y_true, y_pred):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    non_zero_mask = y_true != 0
    if np.any(non_zero_mask):
        return np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask]))
    else:
        return np.nan  # in case all are zero

metrics_data = []

# Evaluate each target separately
for i, target in enumerate(targets):
    r2 = r2_score(y_test.iloc[:, i], y_pred[:, i])
    mae = mean_absolute_error(y_test.iloc[:, i], y_pred[:, i])
    mse = mean_squared_error(y_test.iloc[:, i], y_pred[:, i])
    rmse = np.sqrt(mse)
    mape = safe_mape(y_test.iloc[:, i], y_pred[:, i]) * 100  # % form

    metrics_data.append({
        "Target": target,
        "R² Score": round(r2, 4),
        "MAE": round(mae, 4),
        "MSE": round(mse, 4),
        "RMSE": round(rmse, 4),
        "MAPE (%)": round(mape, 3)
    })

metrics_df = pd.DataFrame(metrics_data)
print("\n================ Model Performance Metrics Table ================\n")
print(metrics_df.to_string(index=False))

# -------------------------------
# Visualization: Actual vs Predicted Scatter Plots
# -------------------------------
plt.figure(figsize=(12, 8))
for i, target in enumerate(targets):
    plt.subplot(2, 2, i + 1)
    plt.scatter(y_test.iloc[:, i], y_pred[:, i], alpha=0.7, color='royalblue')
    plt.plot([y_test.iloc[:, i].min(), y_test.iloc[:, i].max()],
             [y_test.iloc[:, i].min(), y_test.iloc[:, i].max()], 'r--', lw=2)
    plt.title(f"Actual vs Predicted: {target}")
    plt.xlabel("Actual Values")
    plt.ylabel("Predicted Values")

plt.tight_layout()
plt.show()

# ===========================================================
# 🔍 Visualization: Per-Target Feature Importance & SHAP Analysis
# ===========================================================
import shap
import matplotlib.pyplot as plt
import seaborn as sns

print("\nGenerating detailed Feature Importance & SHAP explainability plots for each target...")

# Loop through each sub-model and target
for i, target in enumerate(targets):
    model = xgb_model.estimators_[i]
    print(f"\n===== {target.upper()} =====")

    # ----------------------------------
    # 🎯 Feature Importance (Per Target)
    # ----------------------------------
    plt.figure(figsize=(10, 6))
    importance = model.feature_importances_
    sns.barplot(x=importance, y=allround_features, palette="viridis")
    plt.title(f"Feature Importance - {target}")
    plt.xlabel("Importance Score")
    plt.ylabel("Feature")
    plt.tight_layout()
    plt.show()

    # ----------------------------------
    # 🤖 SHAP Explainability (Per Target)
    # ----------------------------------
    explainer = shap.Explainer(model, X_train, feature_names=allround_features)
    shap_values = explainer(X_test)

    # 1️⃣ SHAP Summary Plot (dot)
    shap.summary_plot(shap_values, X_test, plot_type="dot", show=True)
    # 2️⃣ SHAP Bar Plot (mean absolute)
    shap.summary_plot(shap_values, X_test, plot_type="bar", show=True)

    # 3️⃣ SHAP Dependence Plot (Top Feature)
    top_feature = X_train.columns[np.argmax(np.abs(shap_values.values).mean(axis=0))]
    print(f"Top contributing feature for {target}: {top_feature}")
    shap.dependence_plot(top_feature, shap_values.values, X_test, show=True)

print("✅ Per-target Feature Importance & SHAP visualizations generated successfully!")

# ===========================================================
# 🧩 Combined Feature Importance (Average Across All Targets)
# ===========================================================
avg_importance = np.mean([est.feature_importances_ for est in xgb_model.estimators_], axis=0)
plt.figure(figsize=(10, 6))
sns.barplot(x=avg_importance, y=allround_features, palette="mako")
plt.title("Average Feature Importance Across All Targets")
plt.xlabel("Average Importance Score")
plt.ylabel("Feature")
plt.tight_layout()
plt.show()


# -------------------------------
# Visualization: Correlation Heatmap between Targets
# -------------------------------
combined = pd.DataFrame(y_test, columns=targets)
combined_pred = pd.DataFrame(y_pred, columns=[f"{t}_pred" for t in targets])
merged_results = pd.concat([combined, combined_pred], axis=1)

plt.figure(figsize=(10, 6))
sns.heatmap(merged_results.corr(), annot=True, cmap="coolwarm", fmt=".2f")
plt.title("Correlation Heatmap between Actual & Predicted Metrics")
plt.tight_layout()
plt.show()


# -------------------------------
# Save model
# -------------------------------
# model_file = os.path.join(output_path, "odi_allround_xgb_model.pkl")
# joblib.dump(xgb_model, model_file)
# print(f"All-rounder model saved at: {model_file}")
