from pathlib import Path

import pandas as pd
import requests

NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m"
OPEN_METEO_ARCHIVE = "https://archive-api.open-meteo.com/v1/archive?latitude=52.52&longitude=13.41&start_date=2026-02-23&end_date=2026-03-09&hourly=temperature_2m"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=52.52&longitude=13.41&hourly=pm10,pm2_5"

REPO_DIR = Path(__file__).resolve().parents[3]
BACKEND_DIR = Path(__file__).resolve().parents[2]
CROPS_CSV = REPO_DIR / "data" / "faostat_sample.csv"
CO2_CSV = REPO_DIR / "data" / "co2_emissions.csv"
if not CROPS_CSV.exists():
    CROPS_CSV = BACKEND_DIR / "data" / "faostat_sample.csv"
if not CO2_CSV.exists():
    CO2_CSV = BACKEND_DIR / "data" / "co2_emissions.csv"


def fetch_climate_data():
    params = {
        "parameters": "T2M,PRECTOTCORR",
        "community": "RE",
        "longitude": 13.41,
        "latitude": 52.52,
        "start": "20260101",
        "end": "20260301",
        "format": "JSON",
    }
    response = requests.get(NASA_POWER_URL, params=params, timeout=20)
    response.raise_for_status()
    data = response.json()["properties"]["parameter"]

    dates = list(data["T2M"].keys())[:30]
    return [
        {
            "date": d,
            "temperature": float(data["T2M"].get(d, 0)),
            "precipitation": float(data["PRECTOTCORR"].get(d, 0)),
        }
        for d in dates
    ]


def fetch_weather_data():
    forecast = requests.get(OPEN_METEO_FORECAST, timeout=20).json()
    historical = requests.get(OPEN_METEO_ARCHIVE, timeout=20).json()
    return {"forecast": forecast.get("hourly", {}), "historical": historical.get("hourly", {})}


def fetch_air_quality_data():
    response = requests.get(AIR_QUALITY_URL, timeout=20)
    response.raise_for_status()
    hourly = response.json().get("hourly", {})

    time = hourly.get("time", [])[:72]
    pm10 = hourly.get("pm10", [])[:72]
    pm25 = hourly.get("pm2_5", [])[:72]

    return [{"date": t, "pm10": p10, "pm2_5": p25} for t, p10, p25 in zip(time, pm10, pm25)]


def load_crop_data():
    if not CROPS_CSV.exists():
        return []
    df = pd.read_csv(CROPS_CSV)
    cols = [c for c in ["Year", "Item", "Value"] if c in df.columns]
    if len(cols) < 3:
        return []
    return (
        df[cols]
        .dropna()
        .rename(columns={"Year": "year", "Item": "item", "Value": "value"})
        .head(200)
        .to_dict(orient="records")
    )


def load_co2_data():
    if not CO2_CSV.exists():
        return []
    df = pd.read_csv(CO2_CSV)
    return df.head(500).to_dict(orient="records")
