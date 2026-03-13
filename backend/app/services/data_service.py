import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
import requests

CO2_JSON_URL = os.getenv('CO2_JSON_URL', 'https://owid-public.owid.io/data/co2/owid-co2-data.json')
CO2_COUNTRIES = [
    c.strip() for c in os.getenv('CO2_COUNTRIES', 'South Africa,Kenya,India,Germany').split(',') if c.strip()
]

CROPS_INDICATOR = os.getenv('CROPS_INDICATOR', 'AG.YLD.MAIZ.KG')
CROPS_COUNTRY = os.getenv('CROPS_COUNTRY', 'ZAF')

OPENAQ_BASE_URL = os.getenv('OPENAQ_BASE_URL', 'https://api.openaq.org/v3')
OPENAQ_API_KEY = os.getenv('OPENAQ_API_KEY', '')
OPENAQ_LAT = float(os.getenv('OPENAQ_LAT', '-26.2041'))
OPENAQ_LON = float(os.getenv('OPENAQ_LON', '28.0473'))
OPENAQ_RADIUS = int(os.getenv('OPENAQ_RADIUS', '15000'))

METEOSTAT_BASE_URL = os.getenv('METEOSTAT_BASE_URL', 'https://meteostat.p.rapidapi.com')
METEOSTAT_API_KEY = os.getenv('METEOSTAT_API_KEY', '')
METEOSTAT_HOST = os.getenv('METEOSTAT_HOST', 'meteostat.p.rapidapi.com')
METEOSTAT_LAT = float(os.getenv('METEOSTAT_LAT', '-26.2041'))
METEOSTAT_LON = float(os.getenv('METEOSTAT_LON', '28.0473'))

REPO_DIR = Path(__file__).resolve().parents[3]
BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_CROPS_CSV = BACKEND_DIR / 'data' / 'faostat_data.csv'
FALLBACK_CROPS_CSV = BACKEND_DIR / 'data' / 'faostat_sample.csv'
FALLBACK_CO2_CSV = BACKEND_DIR / 'data' / 'co2_emissions.csv'
DEFAULT_RUNTIME_CONFIG_PATH = Path(os.getenv('RUNTIME_CONFIG_PATH', str(BACKEND_DIR / 'data' / 'runtime_config.json')))
FALLBACK_RUNTIME_CONFIG_PATH = Path('/tmp/runtime_config.json')
_ACTIVE_RUNTIME_CONFIG_PATH: Path | None = None

_CACHE: dict[str, dict[str, object]] = {}


def _cache_get(key: str, ttl: int):
    entry = _CACHE.get(key)
    if not entry:
        return None
    if time.time() - entry['time'] > ttl:
        return None
    return entry['data']


def _cache_set(key: str, data: object):
    _CACHE[key] = {'time': time.time(), 'data': data}


def _default_runtime_config():
    return {
        'country': os.getenv('DEFAULT_COUNTRY', 'South Africa'),
        'country_code': os.getenv('DEFAULT_COUNTRY_CODE', 'ZAF'),
        'lat': float(os.getenv('DEFAULT_LAT', str(OPENAQ_LAT))),
        'lon': float(os.getenv('DEFAULT_LON', str(OPENAQ_LON))),
        'aq_radius': int(os.getenv('DEFAULT_AQ_RADIUS', str(OPENAQ_RADIUS))),
        'crops_indicator': CROPS_INDICATOR,
        'crops_country': CROPS_COUNTRY,
        'co2_countries': CO2_COUNTRIES,
    }


def _sanitize_runtime_config(payload: object):
    base = _default_runtime_config()
    if not isinstance(payload, dict):
        return base

    if isinstance(payload.get('country'), str) and payload['country'].strip():
        base['country'] = payload['country'].strip()
    if isinstance(payload.get('country_code'), str) and payload['country_code'].strip():
        base['country_code'] = payload['country_code'].strip().upper()

    for key in ('lat', 'lon'):
        if payload.get(key) is not None:
            try:
                base[key] = float(payload[key])
            except (TypeError, ValueError):
                pass

    if payload.get('aq_radius') is not None:
        try:
            base['aq_radius'] = int(payload['aq_radius'])
        except (TypeError, ValueError):
            pass

    if isinstance(payload.get('crops_indicator'), str) and payload['crops_indicator'].strip():
        base['crops_indicator'] = payload['crops_indicator'].strip()
    if isinstance(payload.get('crops_country'), str) and payload['crops_country'].strip():
        base['crops_country'] = payload['crops_country'].strip().upper()

    co2_raw = payload.get('co2_countries')
    if isinstance(co2_raw, str):
        co2_list = [c.strip() for c in co2_raw.split(',') if c.strip()]
        if co2_list:
            base['co2_countries'] = co2_list
    elif isinstance(co2_raw, list):
        co2_list = [str(c).strip() for c in co2_raw if str(c).strip()]
        if co2_list:
            base['co2_countries'] = co2_list

    return base


def _select_runtime_config_path():
    global _ACTIVE_RUNTIME_CONFIG_PATH
    if _ACTIVE_RUNTIME_CONFIG_PATH is not None:
        return _ACTIVE_RUNTIME_CONFIG_PATH

    for candidate in (DEFAULT_RUNTIME_CONFIG_PATH, FALLBACK_RUNTIME_CONFIG_PATH):
        try:
            candidate.parent.mkdir(parents=True, exist_ok=True)
            candidate.touch(exist_ok=True)
            _ACTIVE_RUNTIME_CONFIG_PATH = candidate
            return candidate
        except OSError:
            continue

    _ACTIVE_RUNTIME_CONFIG_PATH = FALLBACK_RUNTIME_CONFIG_PATH
    return _ACTIVE_RUNTIME_CONFIG_PATH


def _write_runtime_config(config: dict[str, object]):
    path = _select_runtime_config_path()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(config, indent=2), encoding='utf-8')
        return True
    except OSError:
        fallback = FALLBACK_RUNTIME_CONFIG_PATH
        try:
            fallback.parent.mkdir(parents=True, exist_ok=True)
            fallback.write_text(json.dumps(config, indent=2), encoding='utf-8')
            global _ACTIVE_RUNTIME_CONFIG_PATH
            _ACTIVE_RUNTIME_CONFIG_PATH = fallback
            return True
        except OSError:
            return False


def get_runtime_config():
    cached = _cache_get('runtime_config', 10)
    if cached is not None:
        return cached

    raw = None
    path = _select_runtime_config_path()
    if path.exists():
        try:
            raw = json.loads(path.read_text(encoding='utf-8'))
        except (OSError, json.JSONDecodeError):
            raw = None

    config = _sanitize_runtime_config(raw)
    if not path.exists() or raw is None:
        _write_runtime_config(config)

    _cache_set('runtime_config', config)
    return config


def _clear_cache(keys: list[str]):
    for key in keys:
        _CACHE.pop(key, None)


def set_runtime_config(payload: object):
    current = get_runtime_config()
    merged = _sanitize_runtime_config({**current, **(payload if isinstance(payload, dict) else {})})
    _write_runtime_config(merged)
    _cache_set('runtime_config', merged)
    _clear_cache(['climate', 'weather', 'air_quality', 'crops', 'co2'])
    return merged


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
    return {'X-API-Key': OPENAQ_API_KEY}


def _meteostat_headers():
    if not METEOSTAT_API_KEY:
        return {}
    return {'X-RapidAPI-Key': METEOSTAT_API_KEY, 'X-RapidAPI-Host': METEOSTAT_HOST}


def _fallback_climate_data():
    today = datetime.utcnow().date()
    return [
        {
            'date': (today - timedelta(days=idx)).isoformat(),
            'temperature': round(17 + (idx % 8) * 0.9, 2),
            'precipitation': round((idx % 6) * 1.4, 2),
        }
        for idx in range(30, 0, -1)
    ]


def _fallback_air_quality():
    today = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    return [
        {
            'date': (today - timedelta(hours=idx)).isoformat(),
            'pm10': round(18 + (idx % 7) * 1.8, 2),
            'pm2_5': round(8 + (idx % 5) * 1.1, 2),
        }
        for idx in range(72, 0, -1)
    ]


def _normalize_datetime(value: object):
    if isinstance(value, dict):
        return value.get('utc') or value.get('local')
    if isinstance(value, str):
        return value
    return None


def fetch_climate_data():
    cached = _cache_get('climate', 1800)
    if cached is not None:
        return cached

    config = get_runtime_config()
    lat = float(config.get('lat', METEOSTAT_LAT))
    lon = float(config.get('lon', METEOSTAT_LON))

    if not METEOSTAT_API_KEY:
        data = _fallback_climate_data()
        _cache_set('climate', data)
        return data

    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=30)
    params = {
        'lat': lat,
        'lon': lon,
        'start': start_date.isoformat(),
        'end': end_date.isoformat(),
    }
    payload = _safe_get_json(f'{METEOSTAT_BASE_URL}/point/daily', params=params, headers=_meteostat_headers())
    rows = payload.get('data', []) if isinstance(payload, dict) else []
    if not rows:
        data = _fallback_climate_data()
        _cache_set('climate', data)
        return data

    result: list[dict[str, object]] = []
    for row in rows:
        date_value = row.get('date')
        tavg = row.get('tavg')
        if tavg is None:
            tmin = row.get('tmin')
            tmax = row.get('tmax')
            if tmin is not None and tmax is not None:
                tavg = (tmin + tmax) / 2
        if date_value is None or tavg is None:
            continue
        prcp = row.get('prcp') or 0
        result.append(
            {
                'date': str(date_value),
                'temperature': float(tavg),
                'precipitation': float(prcp),
            }
        )

    result = sorted(result, key=lambda entry: entry['date'])[-30:]
    _cache_set('climate', result)
    return result


def fetch_weather_data():
    cached = _cache_get('weather', 1800)
    if cached is not None:
        return cached

    config = get_runtime_config()
    lat = float(config.get('lat', METEOSTAT_LAT))
    lon = float(config.get('lon', METEOSTAT_LON))

    if not METEOSTAT_API_KEY:
        data = {'forecast': {}, 'historical': {}}
        _cache_set('weather', data)
        return data

    end_dt = datetime.utcnow()
    start_dt = end_dt - timedelta(days=3)
    params = {
        'lat': lat,
        'lon': lon,
        'start': start_dt.strftime('%Y-%m-%d'),
        'end': end_dt.strftime('%Y-%m-%d'),
    }
    payload = _safe_get_json(f'{METEOSTAT_BASE_URL}/point/hourly', params=params, headers=_meteostat_headers())
    rows = payload.get('data', []) if isinstance(payload, dict) else []
    if not rows:
        data = {'forecast': {}, 'historical': {}}
        _cache_set('weather', data)
        return data

    time_values = [row.get('time') or row.get('date') for row in rows]
    temps = [row.get('temp') or row.get('tavg') for row in rows]
    prcp = [row.get('prcp') for row in rows]

    split_index = max(len(time_values) - 24, 0)
    data = {
        'historical': {
            'time': time_values[:split_index],
            'temperature_2m': temps[:split_index],
            'precipitation': prcp[:split_index],
        },
        'forecast': {
            'time': time_values[split_index:],
            'temperature_2m': temps[split_index:],
            'precipitation': prcp[split_index:],
        },
    }
    _cache_set('weather', data)
    return data


def _fetch_openaq_series(sensor_id: int | None, start_dt: datetime, end_dt: datetime):
    if not sensor_id:
        return []
    params = {
        'date_from': start_dt.isoformat(),
        'date_to': end_dt.isoformat(),
        'limit': 2000,
        'page': 1,
    }
    payload = _safe_get_json(
        f'{OPENAQ_BASE_URL}/sensors/{sensor_id}/hours',
        params=params,
        headers=_openaq_headers(),
    )
    results = payload.get('results', []) if isinstance(payload, dict) else []
    series = []
    for entry in results:
        value = entry.get('value')
        period = entry.get('period', {})
        dt_value = _normalize_datetime(period.get('datetimeTo')) or _normalize_datetime(period.get('datetimeFrom'))
        if dt_value is None or value is None:
            continue
        series.append({'date': str(dt_value), 'value': float(value)})
    series.sort(key=lambda item: item['date'])
    return series[-72:]


def fetch_air_quality_data():
    cached = _cache_get('air_quality', 1800)
    if cached is not None:
        return cached

    config = get_runtime_config()
    lat = float(config.get('lat', OPENAQ_LAT))
    lon = float(config.get('lon', OPENAQ_LON))
    radius = int(config.get('aq_radius', OPENAQ_RADIUS))

    if not OPENAQ_API_KEY:
        data = _fallback_air_quality()
        _cache_set('air_quality', data)
        return data

    params = {
        'coordinates': f'{lat},{lon}',
        'radius': radius,
        'limit': 10,
        'page': 1,
    }
    locations_payload = _safe_get_json(
        f'{OPENAQ_BASE_URL}/locations',
        params=params,
        headers=_openaq_headers(),
    )
    locations = locations_payload.get('results', []) if isinstance(locations_payload, dict) else []

    pm10_sensor = None
    pm25_sensor = None
    for location in locations:
        for sensor in location.get('sensors', []) or []:
            param = sensor.get('parameter', {}) or {}
            name = str(param.get('name', '')).lower()
            if name in {'pm10'} and pm10_sensor is None:
                pm10_sensor = sensor.get('id')
            if name in {'pm25', 'pm2.5', 'pm2_5'} and pm25_sensor is None:
                pm25_sensor = sensor.get('id')
        if pm10_sensor and pm25_sensor:
            break

    end_dt = datetime.utcnow()
    start_dt = end_dt - timedelta(days=3)
    pm10_series = _fetch_openaq_series(pm10_sensor, start_dt, end_dt)
    pm25_series = _fetch_openaq_series(pm25_sensor, start_dt, end_dt)

    if not pm10_series and not pm25_series:
        data = _fallback_air_quality()
        _cache_set('air_quality', data)
        return data

    combined: dict[str, dict[str, object]] = {}
    for entry in pm10_series:
        slot = combined.setdefault(entry['date'], {'date': entry['date'], 'pm10': 0.0, 'pm2_5': 0.0})
        slot['pm10'] = entry['value']
    for entry in pm25_series:
        slot = combined.setdefault(entry['date'], {'date': entry['date'], 'pm10': 0.0, 'pm2_5': 0.0})
        slot['pm2_5'] = entry['value']

    data = sorted(combined.values(), key=lambda item: item['date'])[-72:]
    _cache_set('air_quality', data)
    return data


def load_crop_data():
    cached = _cache_get('crops', 3600)
    if cached is not None:
        return cached

    config = get_runtime_config()
    indicator = str(config.get('crops_indicator', CROPS_INDICATOR))
    country = str(config.get('crops_country', CROPS_COUNTRY))
    override_url = os.getenv('CROPS_JSON_URL')
    crops_url = override_url or (
        f'https://api.worldbank.org/v2/country/{country}/indicator/{indicator}?format=json&per_page=20000'
    )

    payload = _safe_get_json(crops_url)
    if isinstance(payload, list) and len(payload) > 1:
        rows = payload[1] or []
        data: list[dict[str, object]] = []
        for row in rows:
            value = row.get('value')
            year = row.get('date')
            country_name = (row.get('country') or {}).get('value')
            indicator_name = (row.get('indicator') or {}).get('value')
            if value is None or year is None or country_name is None:
                continue
            try:
                year_value = int(year)
            except (TypeError, ValueError):
                continue
            item_label = f'{country_name} - {indicator_name}' if indicator_name else country_name
            data.append({'year': year_value, 'item': item_label, 'value': float(value)})
        if data:
            data = sorted(data, key=lambda item: item['year'])[-500:]
            _cache_set('crops', data)
            return data

    path = DEFAULT_CROPS_CSV if DEFAULT_CROPS_CSV.exists() else FALLBACK_CROPS_CSV
    if not path.exists():
        return []

    df = pd.read_csv(path)
    cols = [c for c in ['Year', 'Item', 'Value'] if c in df.columns]
    if len(cols) < 3:
        return []
    data = (
        df[cols]
        .dropna()
        .rename(columns={'Year': 'year', 'Item': 'item', 'Value': 'value'})
        .head(500)
        .to_dict(orient='records')
    )
    _cache_set('crops', data)
    return data


def load_co2_data():
    cached = _cache_get('co2', 3600)
    if cached is not None:
        return cached

    payload = _safe_get_json(CO2_JSON_URL)
    if isinstance(payload, dict):
        data: list[dict[str, object]] = []
        index = {name.lower(): name for name in payload.keys()}
        config = get_runtime_config()
        countries = config.get('co2_countries') or CO2_COUNTRIES
        for country in countries:
            key = index.get(country.lower())
            if not key:
                continue
            entries = (payload.get(key) or {}).get('data', [])
            for entry in entries:
                value = entry.get('co2_per_capita')
                year = entry.get('year')
                if value is None or year is None:
                    continue
                data.append(
                    {
                        'country': key,
                        'year': int(year),
                        'co_emissions_per_capita': float(value),
                    }
                )
        if data:
            data = sorted(data, key=lambda item: (item['country'], item['year']))[-500:]
            _cache_set('co2', data)
            return data

    if FALLBACK_CO2_CSV.exists():
        df = pd.read_csv(FALLBACK_CO2_CSV)
        data = df.head(500).to_dict(orient='records')
        _cache_set('co2', data)
        return data

    return []
