from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
import requests

NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,precipitation_probability"
OPEN_METEO_ARCHIVE = "https://archive-api.open-meteo.com/v1/archive?latitude=52.52&longitude=13.41&start_date=2024-01-01&end_date=2024-01-30&hourly=temperature_2m,precipitation"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=52.52&longitude=13.41&hourly=pm10,pm2_5"

REPO_DIR = Path(__file__).resolve().parents[3]
BACKEND_DIR = Path(__file__).resolve().parents[2]
CROPS_CSV = REPO_DIR / "data" / "faostat_sample.csv"
CO2_CSV = REPO_DIR / "data" / "co2_emissions.csv"
if not CROPS_CSV.exists():
    CROPS_CSV = BACKEND_DIR / "data" / "faostat_sample.csv"
if not CO2_CSV.exists():
    CO2_CSV = BACKEND_DIR / "data" / "co2_emissions.csv"


def _safe_get_json(url: str, **kwargs):
    try:
        response = requests.get(url, timeout=20, **kwargs)
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return None


def _fallback_climate_data():
    today = datetime.utcnow().date()
    return [
        {
            "date": (today - timedelta(days=idx)).isoformat(),
            "temperature": round(17 + (idx % 8) * 0.9, 2),
            "precipitation": round((idx % 6) * 1.4, 2),
        }
        for idx in range(30, 0, -1)
    ]


def fetch_climate_data():
    params = {
        "parameters": "T2M,PRECTOTCORR",
        "community": "RE",
        "longitude": 13.41,
        "latitude": 52.52,
        "start": "20240101",
        "end": "20240131",
        "format": "JSON",
    }
    payload = _safe_get_json(NASA_POWER_URL, params=params)
    if not payload:
        return _fallback_climate_data()

    data = payload.get("properties", {}).get("parameter", {})
    t2m = data.get("T2M", {})
    rain = data.get("PRECTOTCORR", {})
    dates = list(t2m.keys())[:30]
    if not dates:
        return _fallback_climate_data()

    return [
        {
            "date": d,
            "temperature": float(t2m.get(d, 0)),
            "precipitation": float(rain.get(d, 0)),
        }
        for d in dates
    ]


def fetch_weather_data():
    forecast = _safe_get_json(OPEN_METEO_FORECAST) or {}
    historical = _safe_get_json(OPEN_METEO_ARCHIVE) or {}
    return {
        "forecast": forecast.get("hourly", {}),
        "historical": historical.get("hourly", {}),
    }


def fetch_air_quality_data():
    payload = _safe_get_json(AIR_QUALITY_URL)
    if not payload:
        today = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
        return [
            {
                "date": (today - timedelta(hours=idx)).isoformat(),
                "pm10": round(18 + (idx % 7) * 1.8, 2),
                "pm2_5": round(8 + (idx % 5) * 1.1, 2),
            }
            for idx in range(72, 0, -1)
        ]

    hourly = payload.get("hourly", {})
    time = hourly.get("time", [])[:72]
    pm10 = hourly.get("pm10", [])[:72]
    pm25 = hourly.get("pm2_5", [])[:72]

    return [
        {"date": t, "pm10": float(p10 or 0), "pm2_5": float(p25 or 0)}
        for t, p10, p25 in zip(time, pm10, pm25)
    ]


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
        .head(500)
        .to_dict(orient="records")
    )


def load_co2_data():
    if not CO2_CSV.exists():
        return []
    df = pd.read_csv(CO2_CSV)
    return df.head(500).to_dict(orient="records")
