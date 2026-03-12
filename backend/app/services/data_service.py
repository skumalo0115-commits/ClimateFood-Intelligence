import os
import time
from io import StringIO
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
import requests

NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
OPEN_METEO_FORECAST = (
    "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m"
)
OPEN_METEO_ARCHIVE = (
    "https://archive-api.open-meteo.com/v1/archive?latitude=52.52&longitude=13.41"
    "&start_date=2026-02-23&end_date=2026-03-09&hourly=temperature_2m"
)
AIR_QUALITY_URL = (
    "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=52.52&longitude=13.41&hourly=pm10,pm2_5"
)
CO2_URL = "https://ourworldindata.org/grapher/co-emissions-per-capita.csv?v=1&csvType=full&useColumnShortNames=true"

NASA_API_KEY = os.getenv("NASA_POWER_API_KEY", "Hmxo5MANRISwVLcyWR0eeFi08QOUaAiZuA0N8oB3")

REPO_DIR = Path(__file__).resolve().parents[3]
BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_CROPS_CSV = BACKEND_DIR / "data" / "faostat_data.csv"
FALLBACK_CROPS_CSV = BACKEND_DIR / "data" / "faostat_sample.csv"
FALLBACK_CO2_CSV = BACKEND_DIR / "data" / "co2_emissions.csv"

_CACHE: dict[str, dict[str, object]] = {}


def _cache_get(key: str, ttl: int):
    entry = _CACHE.get(key)
    if not entry:
        return None
    if time.time() - entry["time"] > ttl:
        return None
    return entry["data"]


def _cache_set(key: str, data: object):
    _CACHE[key] = {"time": time.time(), "data": data}


def _safe_get_json(url: str, **kwargs):
    try:
        response = requests.get(url, timeout=20, **kwargs)
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return None


def _safe_get_csv(url: str):
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.text
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
    cached = _cache_get("climate", 1800)
    if cached is not None:
        return cached

    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=30)
    params = {
        "parameters": "T2M,PRECTOTCORR",
        "community": "RE",
        "longitude": 13.41,
        "latitude": 52.52,
        "start": start_date.strftime("%Y%m%d"),
        "end": end_date.strftime("%Y%m%d"),
        "format": "JSON",
        "api_key": NASA_API_KEY,
    }
    payload = _safe_get_json(NASA_POWER_URL, params=params)
    if not payload:
        data = _fallback_climate_data()
        _cache_set("climate", data)
        return data

    data = payload.get("properties", {}).get("parameter", {})
    t2m = data.get("T2M", {})
    rain = data.get("PRECTOTCORR", {})
    dates = list(t2m.keys())[:30]
    if not dates:
        data = _fallback_climate_data()
        _cache_set("climate", data)
        return data

    result = []
    for d in dates:
        date_value = d
        if isinstance(d, str) and len(d) == 8 and d.isdigit():
            date_value = f"{d[:4]}-{d[4:6]}-{d[6:]}"
        result.append(
            {
                "date": date_value,
                "temperature": float(t2m.get(d, 0)),
                "precipitation": float(rain.get(d, 0)),
            }
        )
    _cache_set("climate", result)
    return result


def fetch_weather_data():
    cached = _cache_get("weather", 1800)
    if cached is not None:
        return cached

    forecast = _safe_get_json(OPEN_METEO_FORECAST) or {}
    historical = _safe_get_json(OPEN_METEO_ARCHIVE) or {}
    result = {
        "forecast": forecast.get("hourly", {}),
        "historical": historical.get("hourly", {}),
    }
    _cache_set("weather", result)
    return result


def fetch_air_quality_data():
    cached = _cache_get("air_quality", 1800)
    if cached is not None:
        return cached

    payload = _safe_get_json(AIR_QUALITY_URL)
    if not payload:
        today = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
        data = [
            {
                "date": (today - timedelta(hours=idx)).isoformat(),
                "pm10": round(18 + (idx % 7) * 1.8, 2),
                "pm2_5": round(8 + (idx % 5) * 1.1, 2),
            }
            for idx in range(72, 0, -1)
        ]
        _cache_set("air_quality", data)
        return data

    hourly = payload.get("hourly", {})
    time_values = hourly.get("time", [])[:72]
    pm10 = hourly.get("pm10", [])[:72]
    pm25 = hourly.get("pm2_5", [])[:72]

    data = [
        {"date": t, "pm10": float(p10 or 0), "pm2_5": float(p25 or 0)}
        for t, p10, p25 in zip(time_values, pm10, pm25)
    ]
    _cache_set("air_quality", data)
    return data


def load_crop_data():
    cached = _cache_get("crops", 3600)
    if cached is not None:
        return cached

    csv_path = os.getenv("FAOSTAT_CSV_PATH", str(DEFAULT_CROPS_CSV))
    path = Path(csv_path)
    if not path.exists():
        path = DEFAULT_CROPS_CSV if DEFAULT_CROPS_CSV.exists() else FALLBACK_CROPS_CSV
    if not path.exists():
        return []

    df = pd.read_csv(path)
    cols = [c for c in ["Year", "Item", "Value"] if c in df.columns]
    if len(cols) < 3:
        return []
    data = (
        df[cols]
        .dropna()
        .rename(columns={"Year": "year", "Item": "item", "Value": "value"})
        .head(500)
        .to_dict(orient="records")
    )
    _cache_set("crops", data)
    return data


def load_co2_data():
    cached = _cache_get("co2", 3600)
    if cached is not None:
        return cached

    csv_text = _safe_get_csv(CO2_URL)
    if csv_text:
        df = pd.read_csv(StringIO(csv_text))
        rename_map = {}
        if "country" not in df.columns:
            if "Entity" in df.columns:
                rename_map["Entity"] = "country"
        if "year" not in df.columns:
            if "Year" in df.columns:
                rename_map["Year"] = "year"
        if "co_emissions_per_capita" not in df.columns:
            for col in df.columns:
                if col.lower() == "co_emissions_per_capita":
                    rename_map[col] = "co_emissions_per_capita"
        if rename_map:
            df = df.rename(columns=rename_map)
        data = df.head(500).to_dict(orient="records")
        _cache_set("co2", data)
        return data

    if FALLBACK_CO2_CSV.exists():
        df = pd.read_csv(FALLBACK_CO2_CSV)
        data = df.head(500).to_dict(orient="records")
        _cache_set("co2", data)
        return data

    return []
