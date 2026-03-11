# ClimateFood Intelligence

ClimateFood Intelligence is a modern full-stack analytics platform that combines climate indicators, CO₂ emissions, air-quality metrics, and agricultural production data into one interactive dashboard.

## Project Structure

```
frontend/     # Next.js + React + TailwindCSS + Framer Motion + Chart.js + Leaflet
backend/      # FastAPI + Pandas + Scikit-learn APIs and modeling
services/     # Reserved for shared service integrations
models/       # Reserved for model artifacts and experiment outputs
data/         # CSV datasets (FAOSTAT sample + CO₂ emissions)
design/       # Figma-ready homepage design brief
README.md
```

## Features

- Sticky transparent navbar that becomes solid on scroll
- Fullscreen hero with animated headline and fading background image slider
- Smooth section reveal animations using Framer Motion
- Theme toggle: dark / light / gradient
- Dashboard charts for:
  - Temperature trends
  - Precipitation trends
  - PM10 and PM2.5 air quality
  - Crop production trends
- Leaflet map with climate and crop region markers
- FastAPI endpoints for climate, weather, air quality, crops, CO₂ data, and ML predictions

## APIs and Datasets

### External APIs
- NASA POWER API (`/api/climate`)
- Open-Meteo Forecast + Archive (`/api/weather`)
- Open-Meteo Air Quality (`/api/air-quality`)

### CSV Datasets
- `data/faostat_sample.csv` (placeholder structure for FAOSTAT crop data ingestion)
- `data/co2_emissions.csv` (sample based on OWID CO₂ emissions per capita schema)

> To use your full FAOSTAT export (`FAOSTAT_data_en_3-11-2026 1.csv`), copy it into `data/` and update the filename/path in `backend/app/services/data_service.py` if needed.

## Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

## Frontend Setup (Next.js)

```bash
cd frontend
npm install
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000 npm run dev
```

Frontend app runs at `http://localhost:3000`.

## Machine Learning Endpoint

`/api/predict` runs a simple linear regression model that predicts crop yield scenarios from temperature, precipitation, and CO₂-like feature inputs.

## Screenshots

Add your screenshots here after running the app locally:

- `docs/screenshots/home.png`
- `docs/screenshots/dashboard.png`

## Technologies Used

- **Frontend:** Next.js, React, TypeScript, TailwindCSS, Framer Motion, Chart.js, Leaflet
- **Backend:** FastAPI, Pandas, Scikit-learn, Requests
- **Data:** NASA POWER, Open-Meteo APIs, FAOSTAT CSV workflow, OWID CO₂ CSV workflow

## Figma

A Figma-ready homepage brief is included at:

- `design/homepage-figma-brief.md`

If you have Figma MCP configured in your IDE, use this brief to generate the actual `.fig` design file.
