🏏 CrickStat – ML-Based Performance Analyzer & Predictor for Local Cricket Players
CrickStat is a full-stack web platform that allows players and coaches to input match data, analyze performance trends, and get AI-powered predictions for future batting and bowling performance.
The system uses MERN stack + Python ML (XGBoost) to deliver personalized cricket analytics.

🚀 Features
Player match data input through a clean web UI

ML predictions for:

Batting Runs

Strike Rate

Bowling Wickets

Economy Rate

Interactive dashboards & visualizations

Automatic data cleaning and preprocessing

SHAP-based explainability for ML decisions

Role-wise performance insights

Modular backend API (Node.js + Express)

Separate ML API (Python FastAPI/Flask)

🏗 Tech Stack
Frontend
React.js

Chart.js / Recharts

Tailwind / CSS

Backend
Node.js

Express.js

Machine Learning
Python

XGBoost

Scikit-learn

Pandas, NumPy

SHAP for explainability

Database
MongoDB (Player records, match inputs)

📁 Project Structure
CRICKSTAT/
│
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│
├── server/                 # Node.js backend API
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── .env (ignored)
│
├── ml-api/                 # Python Machine Learning API
│   ├── build_ODI_model.py
│   ├── build_T20_model.py
│   ├── build_Test_model.py
│   ├── clean_data.py
│   ├── app.py
│   ├── venv/ (ignored)
│
├── datasets/               # Raw & cleaned data (ignored)
│   ├── cleaned/
│   ├── international/
│   ├── ipl/
│   ├── performance/
│
├── models/                 # Trained ML models (ignored)
│
├── .gitignore
├── README.md
└── package.json
⚙️ How to Run the Project
1️⃣ Clone the Repository
git clone https://github.com/<your-username>/CrickStat.git
cd CrickStat
2️⃣ Setup Frontend (React)
cd client
npm install
npm start
App will run on:
👉 http://localhost:3000

3️⃣ Setup Backend (Node.js API)
cd server
npm install
npm start
API Runs on:
👉 http://localhost:5000

4️⃣ Setup ML API (Python)
cd ml-api
pip install -r requirements.txt
python app.py
ML API Runs on:
👉 http://localhost:8000 (or whichever port you use)

📊 Machine Learning Workflow
Clean raw datasets (ODI, T20, Test, IPL)

Perform missing value imputation (median)

Convert overs → balls

Merge batting & bowling stats

Feature extraction

Train XGBoost multi-output regression model

Evaluate using:

R²

MAE

RMSE

MAPE

Generate SHAP explainability plots

Serve predictions through ML API

📦 Important Note
Large or sensitive folders are intentionally not included in this repository:

node_modules/

datasets/

models/

ml-api/venv/

.env files

These are excluded using .gitignore.

🧪 Sample ML Training Command
python ml-api/build_ODI_model.py
This script:

Loads cleaned ODI data

Applies median imputation

Builds an XGBoost multi-output model

Generates evaluation metrics

Shows graphs

Saves the model (if enabled)

🧠 Why XGBoost?
Handles missing values

Learns complex cricket performance patterns

High accuracy for tabular sports stats

Performs better than RandomForest, KNN, and CNN for this type of data

Provides explainability through SHAP

📜 License
MIT License (recommended)

🙌 Contributors
Susmit Borala
B-Tech IT, GHRCEM Pune
Project Lead – CrickStat

⭐ Support
If you like this project, consider starring ⭐ it on GitHub.
