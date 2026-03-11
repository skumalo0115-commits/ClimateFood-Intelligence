param(
    [string]$BackendServiceName = "backend",
    [string]$FrontendServiceName = "frontend",
    [string]$BackendPublicDomain = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Error "Railway CLI is not installed. Install it first: npm i -g @railway/cli"
}

if (-not $env:RAILWAY_TOKEN) {
    Write-Error "RAILWAY_TOKEN is not set. Create one from Railway Account Settings and set it before running this script."
}

Push-Location "$repoRoot\backend"
Write-Host "Deploying backend service: $BackendServiceName"
railway up --service "$BackendServiceName" --ci
Pop-Location

if ([string]::IsNullOrWhiteSpace($BackendPublicDomain)) {
    Write-Error "BackendPublicDomain is required for frontend deployment. Example: -BackendPublicDomain https://climatefood-backend.up.railway.app"
}

Push-Location "$repoRoot\frontend"
Write-Host "Deploying frontend service: $FrontendServiceName"
railway variables --set "NEXT_PUBLIC_BACKEND_URL=$BackendPublicDomain" --service "$FrontendServiceName"
railway up --service "$FrontendServiceName" --ci
Pop-Location

Write-Host "Deployments submitted successfully."
