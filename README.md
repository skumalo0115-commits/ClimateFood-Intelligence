# 🌍 ClimateFood Intelligence

**ClimateFood Intelligence** is a modern dashboard for understanding how climate, air quality, crops, and emissions change over time. It connects live APIs, transforms the data into clean visual stories, and lets you switch countries or coordinates from the Admin panel without redeploying.



## ✨ Highlights
- Live climate, air‑quality, crop, emissions, and AI prediction signals
- Admin controls to switch country, coordinates, and indicators
- Smart chart insights that react to the selected data range
- Interactive map with geospatial context
- Responsive UI with motion and modern styling

## 🧠 What This Platform Does
This platform helps non‑technical users see **what is happening**, **where it is happening**, and **how it is changing**. You can explore a country’s climate trends, crop performance, pollution levels, and emissions — all in one place — and use AI scenarios to compare possible outcomes.

## 🧭 Main Pages
- **Home** – Overview and entry points
- **Dashboard** – All signals together
- **Climate** – Temperature + precipitation trends
- **Air Quality** – PM10 / PM2.5 patterns
- **Crops** – Yield and production trends
- **Emissions** – CO2 per‑capita insights
- **Predictions** – AI scenario outcomes
- **Map** – Spatial view of the focus area
- **Admin** – Change country/coordinates/indicator

## ⚙️ Tech Stack
- **Frontend:** Next.js, React, TypeScript, TailwindCSS, Framer Motion, Chart.js, Leaflet
- **Backend:** FastAPI, Pandas, Requests, Scikit‑learn
- **Data Sources:** NASA POWER, Open‑Meteo, OpenAQ, World Bank/FAOSTAT, OWID CO2

## 🚀 Quick Start
### Backend
1. Install dependencies
2. Start the API server

```bash
cd backend
pip install -r requirements.txt
python start.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Environment Variables
Frontend:
- `NEXT_PUBLIC_BACKEND_URL` (backend base URL)

Backend:
- `OPENAQ_API_KEY`
- `METEOSTAT_API_KEY`
- `METEOSTAT_HOST`
- `CO2_JSON_URL`
- `CROPS_JSON_URL`
- Optional: `CO2_COUNTRIES`, `CROPS_COUNTRY`, `CROPS_INDICATOR`
- Optional location: `OPENAQ_LAT`, `OPENAQ_LON`, `METEOSTAT_LAT`, `METEOSTAT_LON`

## 🔌 API Endpoints (Backend)
- `GET /api/climate`
- `GET /api/air-quality`
- `GET /api/co2`
- `GET /api/crops`
- `GET /api/predict`
- `GET /api/config`
- `POST /api/config`

## 📦 Deployment (Railway)
1. Deploy backend first
2. Set backend env vars
3. Deploy frontend and set `NEXT_PUBLIC_BACKEND_URL`

## 🛠️ Troubleshooting
- **Backend returns 502:** Check backend logs and ensure it starts (`start.py` must be in the container)
- **Admin save fails:** Verify backend `/api/config` is responding and writable
- **Charts not updating:** Clear dashboard cache and refresh after admin update

---

Made for climate & food intelligence with clarity, motion, and real data.
