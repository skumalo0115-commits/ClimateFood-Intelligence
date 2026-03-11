from fastapi import APIRouter

from app.services.data_service import (
    fetch_air_quality_data,
    fetch_climate_data,
    fetch_weather_data,
    load_co2_data,
    load_crop_data,
)
from app.services.predict_service import predict_crop_yield

router = APIRouter(prefix="/api")


@router.get("/climate")
def climate():
    return {"data": fetch_climate_data()}


@router.get("/weather")
def weather():
    return {"data": fetch_weather_data()}


@router.get("/air-quality")
def air_quality():
    return {"data": fetch_air_quality_data()}


@router.get("/crops")
def crops():
    return {"data": load_crop_data()}


@router.get("/co2")
def co2():
    return {"data": load_co2_data()}


@router.get("/predict")
def predict():
    return {"data": predict_crop_yield()}
