#clean_data.py
"""
Clean raw cricket datasets and save them into datasets/cleaned/
Handles:
- International (ODI, T20, TEST) batting/bowling/allround
- IPL matches & deliveries
- Performance data (bat, ball, match)
"""

import os
import pandas as pd
import numpy as np

# ---------- Utility Functions ----------

def to_numeric(s, allow_negative=False):
    """Convert values to numeric safely."""
    val = pd.to_numeric(s, errors="coerce")
    if not allow_negative:
        val[val < 0] = np.nan
    return val

def strip_star(x):
    """Remove * from high scores."""
    if pd.isna(x):
        return np.nan
    return str(x).replace("*", "")

def overs_to_balls(overs):
    """Convert overs (like 10.2) to balls."""
    if pd.isna(overs):
        return np.nan
    try:
        overs = float(overs)
        whole = int(overs)
        frac = round((overs - whole) * 10)
        return whole * 6 + frac
    except:
        return np.nan

def drop_impossible_negatives(df, cols):
    """Replace negatives with NaN in selected columns."""
    for c in cols:
        if c in df.columns:
            try:
                df.loc[df[c] < 0, c] = np.nan
            except Exception:
                continue
    return df

def finalize_clean(df):
    """Final cleaning: drop full-empty rows and duplicates, replace blanks with NaN."""
    df = df.replace(r'^\s*$', np.nan, regex=True)   # turn blanks into NaN
    df = df.dropna(how="all")
    df = df.drop_duplicates()
    return df

# ---------- Cleaning Functions ----------

def clean_batting(path, out_path):
    df = pd.read_csv(path)

    # Clean high_score column
    if "high_score" in df.columns or "hs" in df.columns:
        hs_col = "high_score" if "high_score" in df.columns else "hs"
        df[hs_col] = to_numeric(df[hs_col].apply(strip_star))  # overwrite cleaned
        df.rename(columns={hs_col: "high_score"}, inplace=True)

    # Coerce numeric for known batting stats
    for c in ["average", "average_s", "avg", "strike_rate", "sr", "runs",
              "matches", "innings", "not_out", "100s", "50s", "4s", "6s", "ball_faced"]:
        if c in df.columns:
            df[c] = to_numeric(df[c])

    df = drop_impossible_negatives(df, df.columns)
    df = finalize_clean(df)
    df.to_csv(out_path, index=False)

def clean_bowling(path, out_path):
    df = pd.read_csv(path)

    # Convert overs → balls
    if "ov" in df.columns:
        df["balls_from_overs"] = df["ov"].apply(overs_to_balls)
    if "balls" in df.columns:
        df["balls"] = to_numeric(df["balls"])
        df["balls"] = df["balls"].fillna(df.get("balls_from_overs"))

    df = drop_impossible_negatives(df, df.columns)
    df = finalize_clean(df)
    df.to_csv(out_path, index=False)

def clean_allround(path, out_path):
    df = pd.read_csv(path)

    # Coerce numeric except player info
    for c in df.columns:
        if c.lower() not in ["player", "name", "country", "span"]:
            if c.lower() == "hs":
                df[c] = to_numeric(df[c].apply(strip_star))
            else:
                df[c] = to_numeric(df[c], allow_negative=False)

    df = drop_impossible_negatives(df, df.columns)
    df = finalize_clean(df)
    df.to_csv(out_path, index=False)

def clean_generic(path, out_path):
    """Generic cleaner for IPL & performance data."""
    df = pd.read_csv(path, low_memory=False)
    for c in df.columns:
        try:
            df[c] = pd.to_numeric(df[c], errors="coerce")
        except Exception:
            pass
    df = finalize_clean(df)
    df.to_csv(out_path, index=False)

# ---------- Main Runner ----------

def main():
    # Project root → CricStat/
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    BASE = os.path.join(ROOT, "datasets")

    RAW_INTL = os.path.join(BASE, "international")
    RAW_IPL = os.path.join(BASE, "ipl")
    RAW_PERF = os.path.join(BASE, "performance")
    OUT = os.path.join(BASE, "cleaned")
    os.makedirs(OUT, exist_ok=True)

    # International
    intl_files = {
        "odi_batting": ("ODI_batting.csv", clean_batting),
        "odi_bowling": ("ODI_bowling.csv", clean_bowling),
        "odi_allround": ("ODI_all_round.csv", clean_allround),
        "t20_batting": ("t20_batting.csv", clean_batting),
        "t20_bowling": ("t20_bowling.csv", clean_bowling),
        "t20_allround": ("t20_all_round.csv", clean_allround),
        "test_batting": ("TEST_batting.csv", clean_batting),
        "test_bowling": ("TEST_bowling.csv", clean_bowling),
        "test_allround": ("TEST_all_round.csv", clean_allround),
    }
    for key, (fname, func) in intl_files.items():
        fpath = os.path.join(RAW_INTL, fname)
        if os.path.exists(fpath):
            func(fpath, os.path.join(OUT, f"{key}_cleaned.csv"))
            print(f"[OK] Cleaned {fname}")

    # IPL
    ipl_files = {
        "ipl_matches": "matches.csv",
        "ipl_deliveries": "deliveries.csv"
    }
    for key, fname in ipl_files.items():
        fpath = os.path.join(RAW_IPL, fname)
        if os.path.exists(fpath):
            clean_generic(fpath, os.path.join(OUT, f"{key}_cleaned.csv"))
            print(f"[OK] Cleaned {fname}")

    # Performance
    perf_files = {
        "perf_bat": "bat.csv",
        "perf_ball": "ball.csv",
        "perf_match": "match.csv"
    }
    for key, fname in perf_files.items():
        fpath = os.path.join(RAW_PERF, fname)
        if os.path.exists(fpath):
            clean_generic(fpath, os.path.join(OUT, f"{key}_cleaned.csv"))
            print(f"[OK] Cleaned {fname}")

if __name__ == "__main__":
    main()
