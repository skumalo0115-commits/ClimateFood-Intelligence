# Vercel Full-Stack Deployment

This repository can now run as two separate Vercel projects:

- `frontend` on Vercel
- `backend` on Vercel

The frontend and backend should be imported as two different Vercel projects from the same Git repository.

## Vercel project layout

Create these two Vercel projects from the same repo:

1. **Frontend project**
   Root Directory: `frontend`
2. **Backend project**
   Root Directory: `backend`

This follows Vercel's monorepo setup, where each project points at its own root directory.

## Backend entrypoint on Vercel

The backend now exports the FastAPI app from [backend/index.py](/C:/Users/Sbahle%20Kumalo/OneDrive/Documents/GitHub/ClimateFood-Intelligence/backend/index.py:1), which is one of Vercel's supported FastAPI entrypoints.

The backend keeps a minimal [backend/vercel.json](/C:/Users/Sbahle%20Kumalo/OneDrive/Documents/GitHub/ClimateFood-Intelligence/backend/vercel.json:1), but it does not define a `functions` block anymore.

That change is important because Vercel's current Python Functions config validates `functions` patterns against files inside an `api/` directory. This backend uses Vercel's newer zero-configuration FastAPI support with a root [backend/index.py](/C:/Users/Sbahle%20Kumalo/OneDrive/Documents/GitHub/ClimateFood-Intelligence/backend/index.py:1) entrypoint, so using:

```json
"functions": {
  "index.py": { ... }
}
```

causes the build error:

```text
The pattern "index.py" defined in functions doesn't match any Serverless Functions inside the api directory.
```

Leaving the FastAPI entrypoint at `backend/index.py` preserves the current external backend URLs like `/api/config`, `/api/climate`, and `/api/co2`.

## Admin persistence on Vercel

The backend now supports durable Admin config storage on Vercel by using the Redis credentials injected by the Vercel Marketplace integration.

One important platform change:

- Vercel's Redis docs say `Vercel KV` is no longer available, and that existing stores were moved to Upstash Redis on **December 2024**
- for new projects, the Vercel-supported KV path is to install **Upstash Redis** from the **Vercel Marketplace**

In this repo, the backend uses that integration automatically when these injected environment variables are present:

```env
KV_REST_API_URL
KV_REST_API_TOKEN
KV_REST_API_READ_ONLY_TOKEN
```

When those variables exist:

- Admin saves persist across redeploys and cold starts
- the runtime config is stored as one JSON document in Redis
- the backend still mirrors the latest config to `/tmp/runtime_config.json` as a local fallback

If those Redis variables are missing on Vercel, the app still works, but Admin changes fall back to temporary `/tmp` file storage and can reset later.

## Exact Vercel frontend environment variable

In the **frontend Vercel project**, add:

```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-project.vercel.app
```

Optional aliases also supported by the frontend, though you normally do not need them:

```env
NEXT_PUBLIC_API_URL=https://your-backend-project.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://your-backend-project.vercel.app
BACKEND_URL=https://your-backend-project.vercel.app
```

## Exact Vercel backend environment variables

In the **backend Vercel project**, add the variables below.

Recommended full backend block:

```env
OPENAQ_BASE_URL=https://api.openaq.org/v3
OPENAQ_API_KEY=your_openaq_key
OPENAQ_LAT=-26.2041
OPENAQ_LON=28.0473
OPENAQ_RADIUS=15000

METEOSTAT_BASE_URL=https://meteostat.p.rapidapi.com
METEOSTAT_API_KEY=your_rapidapi_key
METEOSTAT_HOST=meteostat.p.rapidapi.com
METEOSTAT_LAT=-26.2041
METEOSTAT_LON=28.0473

OPEN_METEO_ARCHIVE_URL=https://archive-api.open-meteo.com/v1/archive
OPEN_METEO_AIR_QUALITY_URL=https://air-quality-api.open-meteo.com/v1/air-quality

CO2_JSON_URL=https://owid-public.owid.io/data/co2/owid-co2-data.json
CO2_COUNTRIES=South Africa,Kenya,India,Germany,Nigeria,Egypt,Ethiopia,Tanzania,Uganda,Brazil,Mexico,United States,Canada,France,China,Japan,Australia

CROPS_COUNTRY=ZAF
CROPS_INDICATOR=AG.YLD.MAIZ.KG
CROPS_JSON_URL=https://api.worldbank.org/v2/country/ZAF/indicator/AG.YLD.MAIZ.KG?format=json&per_page=20000

DEFAULT_COUNTRY=South Africa
DEFAULT_COUNTRY_CODE=ZAF
DEFAULT_LAT=-26.2041
DEFAULT_LON=28.0473
DEFAULT_AQ_RADIUS=15000
```

### Admin persistence variables

For durable Admin saves, do this in Vercel:

1. Open the **backend** project in Vercel
2. Open **Marketplace** or **Storage**
3. Install **Upstash for Redis**
4. Create or connect a Redis database
5. Attach it to the **backend** Vercel project

After that, Vercel injects the Redis credentials into the project automatically. The backend uses these names:

```env
KV_REST_API_URL=auto-injected-by-vercel
KV_REST_API_TOKEN=auto-injected-by-vercel
KV_REST_API_READ_ONLY_TOKEN=auto-injected-by-vercel
```

Optional advanced backend values:

```env
RUNTIME_CONFIG_KV_KEY=climatefood:runtime_config
RUNTIME_CONFIG_PATH=/tmp/runtime_config.json
```

You do not normally need to set `PORT` on Vercel.

If you want to customize function duration for this backend later, use the backend project's **Settings -> Functions** section in Vercel. The old `functions.index.py` config was removed because it conflicts with zero-config FastAPI detection.

## Exact steps to add frontend variables in Vercel

Based on Vercel's current environment variable docs:

1. Open the **frontend** Vercel project.
2. Go to **Settings**.
3. Open **Environment Variables**.
4. Click **Add New**.
5. Name: `NEXT_PUBLIC_BACKEND_URL`
6. Value: your backend Vercel URL, for example `https://your-backend-project.vercel.app`
7. Apply it to:
   `Production`, `Preview`, and `Development`
8. Save it.
9. Redeploy the frontend project.

## Exact steps to add backend variables in Vercel

1. Open the **backend** Vercel project.
2. Go to **Settings**.
3. Open **Environment Variables**.
4. Add the backend variables one by one, or use the Vercel CLI to add them.
5. Apply each one to:
   `Production`, `Preview`, and `Development`
6. Save them.
7. Redeploy the backend project.

## Exact steps to add Redis persistence in Vercel

1. Open the **backend** Vercel project.
2. Open **Marketplace** or **Storage** from the Vercel dashboard.
3. Search for **Upstash for Redis**.
4. Click **Install**.
5. Choose a plan and region.
6. Connect the new Redis resource to the **backend** project.
7. Confirm that Vercel added `KV_REST_API_URL` and `KV_REST_API_TOKEN` to the project.
8. Redeploy the backend project.
9. Open the Admin page and save a change once so the runtime config is written into Redis.

If you also run the backend locally with Vercel-linked env vars, pull them with:

```bash
cd backend
vercel env pull
```

## CLI examples

### Deploy backend

PowerShell:

```powershell
.\scripts\vercel-backend-deploy.ps1
.\scripts\vercel-backend-deploy.ps1 -Production
```

Bash:

```bash
./scripts/vercel-backend-deploy.sh
./scripts/vercel-backend-deploy.sh --prod
```

### Deploy frontend

PowerShell:

```powershell
.\scripts\vercel-frontend-deploy.ps1
.\scripts\vercel-frontend-deploy.ps1 -Production
```

Bash:

```bash
./scripts/vercel-frontend-deploy.sh
./scripts/vercel-frontend-deploy.sh --prod
```

### Add environment variables with the Vercel CLI

Frontend:

```bash
cd frontend
vercel env add NEXT_PUBLIC_BACKEND_URL production
vercel env add NEXT_PUBLIC_BACKEND_URL preview
vercel env add NEXT_PUBLIC_BACKEND_URL development
```

Backend example:

```bash
cd backend
vercel env add OPENAQ_API_KEY production
vercel env add OPENAQ_API_KEY preview
vercel env add OPENAQ_API_KEY development
```

You can pull Development variables locally with:

```bash
vercel env pull
```

## Deployment order

1. Create the backend Vercel project with root directory `backend`.
2. Connect **Upstash for Redis** to the backend project so Admin config is durable.
3. Add the rest of the backend environment variables.
4. Deploy the backend and copy its domain.
5. Create the frontend Vercel project with root directory `frontend`.
6. Add `NEXT_PUBLIC_BACKEND_URL` to the frontend project, pointing to the backend domain.
7. Deploy the frontend.

## Official references

- [FastAPI on Vercel](https://vercel.com/docs/frameworks/backend/fastapi)
- [Using the Python Runtime with Vercel Functions](https://vercel.com/docs/functions/runtimes/python)
- [Using Monorepos](https://vercel.com/docs/monorepos)
- [Environment variables](https://vercel.com/docs/environment-variables)
- [Managing environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables)
- [Redis on Vercel](https://vercel.com/docs/redis)
- [Storage on Vercel Marketplace](https://vercel.com/docs/marketplace-storage)
- [Static Configuration with vercel.json](https://vercel.com/docs/project-configuration/vercel-json)
- [Vercel Functions runtime details](https://vercel.com/docs/functions/runtimes#official-runtimes)
- [Upstash Redis REST API](https://upstash.com/docs/redis/features/restapi)
