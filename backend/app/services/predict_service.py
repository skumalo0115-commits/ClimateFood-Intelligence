import numpy as np
from sklearn.linear_model import LinearRegression

from app.services.data_service import load_crop_data


def _prepare_country_crop_series():
    grouped: dict[int, list[float]] = {}
    for row in load_crop_data():
        try:
            year = int(row.get('year'))
            value = float(row.get('value'))
        except (TypeError, ValueError):
            continue
        grouped.setdefault(year, []).append(value)

    return sorted((year, float(np.mean(values))) for year, values in grouped.items() if values)


def predict_crop_yield():
    series = _prepare_country_crop_series()
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
