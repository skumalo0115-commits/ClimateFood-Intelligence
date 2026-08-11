import numpy as np
from sklearn.linear_model import LinearRegression

from app.services.data_service import get_runtime_config, load_crop_data


def _normalize_country_name(value: object) -> str:
    return str(value or '').strip().lower()


def _country_matches(row: dict, country_names: list[str]) -> bool:
    item_label = str(row.get('item') or row.get('country') or '').lower()
    if not item_label:
        return False
    return any(name in item_label for name in country_names if name)


def _prepare_country_crop_series(country_filter: str | None = None):
    grouped: dict[int, list[float]] = {}
    country_names: list[str] = []
    if country_filter:
        country_names = [country_filter.strip().lower(), country_filter.strip().upper()]

    for row in load_crop_data():
        try:
            year = int(row.get('year'))
            value = float(row.get('value'))
        except (TypeError, ValueError):
            continue

        if country_names and not _country_matches(row, country_names):
            continue

        grouped.setdefault(year, []).append(value)

    series = sorted((year, float(np.mean(values))) for year, values in grouped.items() if values)
    if country_filter and len(series) >= 3:
        return series
    if country_filter and len(series) < 3:
        return _prepare_country_crop_series(None)
    return series


def predict_crop_yield(country_filter: str | None = None):
    if country_filter is None:
        config = get_runtime_config()
        country_filter = str(config.get('country') or config.get('crops_country') or '').strip() or None

    series = _prepare_country_crop_series(country_filter)
    if len(series) < 3:
        return []

    years = np.array([[year] for year, _ in series], dtype=float)
    yields = np.array([value for _, value in series], dtype=float)

    model = LinearRegression()
    model.fit(years, yields)

    next_year = max(year for year, _ in series) + 1
    baseline_prediction = float(model.predict(np.array([[next_year]], dtype=float))[0])
    residuals = yields - model.predict(years)

    if residuals.size >= 3:
        downside = float(np.percentile(residuals, 25))
        upside = float(np.percentile(residuals, 75))
    else:
        spread = max(float(np.std(residuals)), abs(baseline_prediction) * 0.05)
        downside = -spread
        upside = spread

    minimum_spread = max(abs(baseline_prediction) * 0.02, 1.0)
    scenario_values = [
        max(baseline_prediction + min(downside, -minimum_spread), 0.0),
        max(baseline_prediction, 0.0),
        max(baseline_prediction + max(upside, minimum_spread), 0.0),
    ]

    return [{"scenario": index + 1, "predicted_yield": round(value, 2)} for index, value in enumerate(scenario_values)]
