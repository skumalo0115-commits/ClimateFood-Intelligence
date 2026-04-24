# 🌍 ClimateFood Intelligence

**ClimateFood Intelligence** is a modern dashboard for understanding how climate, air quality, crops, and emissions change over time. It connects live APIs, transforms the data into clean visual stories, and lets you switch countries or coordinates from the Admin panel without redeploying.

![Home hero preview](https://github.com/skumalo0115-commits/ClimateFood-Intelligence/blob/main/docs/screenshots/Screenshot%202026-03-14%20022416.png)

---

## 🌍 Live Websites

- **Website:** https://climate-food-intelligence.vercel.app/
- **Alternative Website:** https://climatefood-intelligence.up.railway.app/
- **Vercel-ready:** This repo now includes `vercel.json` plus a Vercel build step.

---

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
- `NEXT_PUBLIC_BACKEND_URL` (recommended Vercel variable for the backend Vercel project URL)
- Optional aliases also supported: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_BASE_URL`, `BACKEND_URL`

Backend:
- Air quality: `OPENAQ_API_KEY`, `OPENAQ_BASE_URL`, `OPENAQ_LAT`, `OPENAQ_LON`, `OPENAQ_RADIUS`
- Climate: `METEOSTAT_API_KEY`, `METEOSTAT_HOST`, `METEOSTAT_BASE_URL`, `METEOSTAT_LAT`, `METEOSTAT_LON`
- Open-Meteo fallback overrides: `OPEN_METEO_ARCHIVE_URL`, `OPEN_METEO_AIR_QUALITY_URL`
- CO2: `CO2_JSON_URL`, `CO2_COUNTRIES`
- Crops: `CROPS_COUNTRY`, `CROPS_INDICATOR`, `CROPS_JSON_URL`
- Initial defaults: `DEFAULT_COUNTRY`, `DEFAULT_COUNTRY_CODE`, `DEFAULT_LAT`, `DEFAULT_LON`, `DEFAULT_AQ_RADIUS`
- Durable Admin persistence on Vercel: `KV_REST_API_URL`, `KV_REST_API_TOKEN`, optional `KV_REST_API_READ_ONLY_TOKEN`
- Advanced: `PORT`, `RUNTIME_CONFIG_PATH`, `RUNTIME_CONFIG_KV_KEY`

## 🔌 API Endpoints (Backend)
- `GET /api/climate`
- `GET /api/air-quality`
- `GET /api/co2`
- `GET /api/crops`
- `GET /api/predict`
- `GET /api/config`
- `POST /api/config`

## 📦 Deployment
- Recommended: **frontend on Vercel** + **backend on Vercel**
- Full step-by-step guide: [docs/deployment/vercel-fullstack.md](/C:/Users/Sbahle%20Kumalo/OneDrive/Documents/GitHub/ClimateFood-Intelligence/docs/deployment/vercel-fullstack.md:1)

## 🛠️ Troubleshooting
- **Backend returns 502:** Check backend logs and ensure it starts (`start.py` must be in the container)
- **Admin save fails:** Verify backend `/api/config` is responding and that the backend project has the Upstash Redis integration connected on Vercel
- **Charts not updating:** Clear dashboard cache and refresh after admin update

---

Made for climate & food intelligence with clarity, motion, and real data.
