param(
    [switch]$Production
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Error "Vercel CLI is not installed. Install it first: npm i -g vercel"
}

Push-Location "$repoRoot\frontend"
Write-Host "Deploying frontend from the frontend directory with Vercel."
Write-Host "Make sure NEXT_PUBLIC_BACKEND_URL is already set in your Vercel project settings and points to your Vercel backend project."

if ($Production) {
    vercel --prod
} else {
    vercel
}

Pop-Location
