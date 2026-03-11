import numpy as np
from sklearn.linear_model import LinearRegression


def predict_crop_yield():
    X = np.array(
        [
            [22.1, 40.0, 4.2],
            [23.0, 45.2, 4.5],
            [24.2, 48.0, 4.8],
            [25.0, 50.5, 5.0],
            [26.1, 53.1, 5.3],
        ]
    )
    y = np.array([3.2, 3.5, 3.7, 4.0, 4.2])

    model = LinearRegression()
    model.fit(X, y)

    future_inputs = np.array(
        [
            [26.5, 54.0, 5.4],
            [27.0, 55.0, 5.6],
            [27.3, 56.5, 5.8],
        ]
    )
    predictions = model.predict(future_inputs)
    return [{"scenario": i + 1, "predicted_yield": float(val)} for i, val in enumerate(predictions)]
