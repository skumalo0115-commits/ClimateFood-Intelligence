import os
import time
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
import requests

CO2_JSON_URL = os.getenv("CO2_JSON_URL", "https://owid-public.owid.io/data/co2/owid-co2-data.json")
CO2_COUNTRIES = [c.strip() for c in os.getenv("CO2_COUNTRIES", "Germany,South Africa,Kenya,India").split(",") if c.strip()]

CROPS_INDICATOR = os.getenv("CROPS_INDICATOR", "AG.YLD.CREL.KG")
CROPS_COUNTRY = os.getenv("CROPS_COUNTRY", "ZAF")
CROPS_JSON_URL = os.getenv(
    "CROPS_JSON_URL",
    f"https://api.worldbank.org/v2/country/{CROPS_COUNTRY}/indicator/{CROPS_INDICATOR}?format=json&per_page=20000",
)

OPENAQ_BASE_URL = os.getenv("OPENAQ_BASE_URL", "https://api.openaq.org/v3")
OPENAQ_API_KEY = os.getenv("OPENAQ_API_KEY", "")
OPENAQ_LAT = float(os.getenv("OPENAQ_LAT", "52.52"))
OPENAQ_LON = float(os.getenv("OPENAQ_LON", "13.41"))
OPENAQ_RADIUS = int(os.getenv("OPENAQ_RADIUS", "10000"))

METEOSTAT_BASE_URL = os.getenv("METEOSTAT_BASE_URL", "https://meteostat.p.rapidapi.com")
METEOSTAT_API_KEY = os.getenv("METEOSTAT_API_KEY", "")
METEOSTAT_HOST = os.getenv("METEOSTAT_HOST", "meteostat.p.rapidapi.com")
METEOSTAT_LAT = float(os.getenv("METEOSTAT_LAT", "52.52"))
METEOSTAT_LON = float(os.getenv("METEOSTAT_LON", "13.41"))

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
        response = requests.get(url, timeout=25, **kwargs)
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


def _openaq_headers():
    if not OPENAQ_API_KEY:
        return {}
    return {"X-API-Key": OPENAQ_API_KEY}


def _meteostat_headers():
    if not METEOSTAT_API_KEY:
        return {}
    return {"X-RapidAPI-Key": METEOSTAT_API_KEY, "X-RapidAPI-Host": METEOSTAT_HOST}


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


def _fallback_air_quality():
    today = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    return [
        {
            "date": (today - timedelta(hours=idx)).isoformat(),
            "pm10": round(18 + (idx % 7) * 1.8, 2),
            "pm2_5": round(8 + (idx % 5) * 1.1, 2),
        }
        for idx in range(72, 0, -1)
    ]


def _normalize_datetime(value: object):
    if isinstance(value, dict):
        return value.get("utc") or value.get("local")
    if isinstance(value, str):
        return value
    return None


def fetch_climate_data():
    cached = _cache_get("climate", 1800)
    if cached is not None:
        return cached

    if not METEOSTAT_API_KEY:
        data = _fallback_climate_data()
        _cache_set("climate", data)
        return data

    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=30)
    params = {
        "lat": METEOSTAT_LAT,
        "lon": METEOSTAT_LON,
        "start": start_date.isoformat(),
        "end": end_date.isoformat(),
    }
    payload = _safe_get_json(f"{METEOSTAT_BASE_URL}/point/daily", params=params, headers=_meteostat_headers())
    rows = payload.get("data", []) if isinstance(payload, dict) else []
    if not rows:
        data = _fallback_climate_data()
        _cache_set("climate", data)
        return data

    result: list[dict[str, object]] = []
    for row in rows:
        date_value = row.get("date")
        tavg = row.get("tavg")
        if tavg is None:
            tmin = row.get("tmin")
            tmax = row.get("tmax")
            if tmin is not None and tmax is not None:
                tavg = (tmin + tmax) / 2
        if date_value is None or tavg is None:
            continue
        prcp = row.get("prcp") or 0
        result.append(
            {
                "date": str(date_value),
                "temperature": float(tavg),
                "precipitation": float(prcp),
            }
        )

    result = sorted(result, key=lambda entry: entry["date"])[-30:]
    _cache_set("climate", result)
    return result


def fetch_weather_data():
    cached = _cache_get("weather", 1800)
    if cached is not None:
        return cached

    if not METEOSTAT_API_KEY:
        data = {"forecast": {}, "historical": {}}
        _cache_set("weather", data)
        return data

    end_dt = datetime.utcnow()
    start_dt = end_dt - timedelta(days=3)
    params = {
        "lat": METEOSTAT_LAT,
        "lon": METEOSTAT_LON,
        "start": start_dt.strftime("%Y-%m-%d"),
        "end": end_dt.strftime("%Y-%m-%d"),
    }
    payload = _safe_get_json(f"{METEOSTAT_BASE_URL}/point/hourly", params=params, headers=_meteostat_headers())
    rows = payload.get("data", []) if isinstance(payload, dict) else []
    if not rows:
        data = {"forecast": {}, "historical": {}}
        _cache_set("weather", data)
        return data

    time_values = [row.get("time") or row.get("date") for row in rows]
    temps = [row.get("temp") or row.get("tavg") for row in rows]
    prcp = [row.get("prcp") for row in rows]

    split_index = max(len(time_values) - 24, 0)
    data = {
        "historical": {
            "time": time_values[:split_index],
            "temperature_2m": temps[:split_index],
            "precipitation": prcp[:split_index],
        },
        "forecast": {
            "time": time_values[split_index:],
            "temperature_2m": temps[split_index:],
            "precipitation": prcp[split_index:],
        },
    }
    _cache_set("weather", data)
    return data


def _fetch_openaq_series(sensor_id: int | None, start_dt: datetime, end_dt: datetime):
    if not sensor_id:
        return []
    params = {
        "date_from": start_dt.isoformat(),
        "date_to": end_dt.isoformat(),
        "limit": 2000,
        "page": 1,
    }
    payload = _safe_get_json(
        f"{OPENAQ_BASE_URL}/sensors/{sensor_id}/hours",
        params=params,
        headers=_openaq_headers(),
    )
    results = payload.get("results", []) if isinstance(payload, dict) else []
    series = []
    for entry in results:
        value = entry.get("value")
        period = entry.get("period", {})
        dt_value = _normalize_datetime(period.get("datetimeTo")) or _normalize_datetime(period.get("datetimeFrom"))
        if dt_value is None or value is None:
            continue
        series.append({"date": str(dt_value), "value": float(value)})
    series.sort(key=lambda item: item["date"])
    return series[-72:]


def fetch_air_quality_data():
    cached = _cache_get("air_quality", 1800)
    if cached is not None:
        return cached

    if not OPENAQ_API_KEY:
        data = _fallback_air_quality()
        _cache_set("air_quality", data)
        return data

    params = {
        "coordinates": f"{OPENAQ_LAT},{OPENAQ_LON}",
        "radius": OPENAQ_RADIUS,
        "limit": 10,
        "page": 1,
    }
    locations_payload = _safe_get_json(
        f"{OPENAQ_BASE_URL}/locations",
        params=params,
        headers=_openaq_headers(),
    )
    locations = locations_payload.get("results", []) if isinstance(locations_payload, dict) else []

    pm10_sensor = None
    pm25_sensor = None
    for location in locations:
        for sensor in location.get("sensors", []) or []:
            param = sensor.get("parameter", {}) or {}
            name = str(param.get("name", "")).lower()
            if name in {"pm10"} and pm10_sensor is None:
                pm10_sensor = sensor.get("id")
            if name in {"pm25", "pm2.5", "pm2_5"} and pm25_sensor is None:
                pm25_sensor = sensor.get("id")
        if pm10_sensor and pm25_sensor:
            break

    end_dt = datetime.utcnow()
    start_dt = end_dt - timedelta(days=3)
    pm10_series = _fetch_openaq_series(pm10_sensor, start_dt, end_dt)
    pm25_series = _fetch_openaq_series(pm25_sensor, start_dt, end_dt)

    if not pm10_series and not pm25_series:
        data = _fallback_air_quality()
        _cache_set("air_quality", data)
        return data

    combined: dict[str, dict[str, object]] = {}
    for entry in pm10_series:
        slot = combined.setdefault(entry["date"], {"date": entry["date"], "pm10": 0.0, "pm2_5": 0.0})
        slot["pm10"] = entry["value"]
    for entry in pm25_series:
        slot = combined.setdefault(entry["date"], {"date": entry["date"], "pm10": 0.0, "pm2_5": 0.0})
        slot["pm2_5"] = entry["value"]

    data = sorted(combined.values(), key=lambda item: item["date"])[-72:]
    _cache_set("air_quality", data)
    return data


def load_crop_data():
    cached = _cache_get("crops", 3600)
    if cached is not None:
        return cached

    payload = _safe_get_json(CROPS_JSON_URL)
    if isinstance(payload, list) and len(payload) > 1:
        rows = payload[1] or []
        data: list[dict[str, object]] = []
        for row in rows:
            value = row.get("value")
            year = row.get("date")
            country = (row.get("country") or {}).get("value")
            indicator = (row.get("indicator") or {}).get("value")
            if value is None or year is None or country is None:
                continue
            try:
                year_value = int(year)
            except (TypeError, ValueError):
                continue
            item_label = f"{country} - {indicator}" if indicator else country
            data.append({"year": year_value, "item": item_label, "value": float(value)})
        if data:
            data = sorted(data, key=lambda item: item["year"])[-500:]
            _cache_set("crops", data)
            return data

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

    payload = _safe_get_json(CO2_JSON_URL)
    if isinstance(payload, dict):
        data: list[dict[str, object]] = []
        index = {name.lower(): name for name in payload.keys()}
        for country in CO2_COUNTRIES:
            key = index.get(country.lower())
            if not key:
                continue
            entries = (payload.get(key) or {}).get("data", [])
            for entry in entries:
                value = entry.get("co2_per_capita")
                year = entry.get("year")
                if value is None or year is None:
                    continue
                data.append(
                    {
                        "country": key,
                        "year": int(year),
                        "co_emissions_per_capita": float(value),
                    }
                )
        if data:
            data = sorted(data, key=lambda item: (item["country"], item["year"]))[-500:]
            _cache_set("co2", data)
            return data

    if FALLBACK_CO2_CSV.exists():
        df = pd.read_csv(FALLBACK_CO2_CSV)
        data = df.head(500).to_dict(orient="records")
        _cache_set("co2", data)
        return data

    return []
