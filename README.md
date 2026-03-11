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

---

## Run Locally in VS Code (Recommended)

> Use **terminal commands**, not the Live Server extension. Live Server is for static HTML and does not run Next.js/FastAPI correctly.  
> **Live Server equivalent:** run the dev servers (Next.js + FastAPI) with hot reload.

### 1) Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Backend docs: `http://localhost:8000/docs`

### 2) Frontend (Next.js)

Open a second terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend: `http://localhost:3000`

### One-command dev (optional)

Windows (PowerShell):
```powershell
.\scripts\dev.ps1
```

macOS/Linux:
```bash
./scripts/dev.sh
```

---

## Deploy on Railway (Step-by-step)

You should create **two Railway services** from this same repo:

1. **backend service** (root directory: `backend`)
2. **frontend service** (root directory: `frontend`)

### A) Backend service setup

1. In Railway, click **New Project** → **Deploy from GitHub Repo**.
2. Set **Root Directory** to `backend`.
3. Railway will detect `backend/Dockerfile`.
4. Add environment variables if needed (optional currently):
   - `NASA_POWER_API_KEY`
5. Expose the service and copy the public URL (example: `https://climatefood-backend.up.railway.app`).

### B) Frontend service setup

1. Add another service from the same repo.
2. Set **Root Directory** to `frontend`.
3. Railway will detect `frontend/Dockerfile`.
4. Add env var:
   - `NEXT_PUBLIC_BACKEND_URL=https://<your-backend-url>`
5. Deploy and open your frontend URL.

### C) Verify deployment

- Open frontend URL and check dashboard loads.
- Test backend endpoint directly:
  - `https://<backend-url>/api/climate`

---

## Figma + Animation Workflow (What to connect where)

Short answer: **Connect Figma through VS Code (or Figma plugin tooling), then use Codex for code generation and refactors.**

Why:
- Figma integrations and tokens/plugins are managed from your local dev environment and design workspace.
- Codex is best used to convert your Figma structure into React/Tailwind components and improve interactions/animations.

### Practical workflow

1. Build/clean your page design in Figma.
2. Use your Figma MCP/plugin in VS Code to pull component specs/tokens.
3. Share those extracted specs with Codex.
4. Ask Codex to implement/update specific components (hero, cards, navbar, animation timings).
5. Validate visually in `npm run dev`.

> A starter Figma brief is included in `design/homepage-figma-brief.md`.

---

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
