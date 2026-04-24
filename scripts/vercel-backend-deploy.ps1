param(
    [switch]$Production
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Error "Vercel CLI is not installed. Install it first: npm i -g vercel"
}

Push-Location "$repoRoot\backend"
Write-Host "Deploying backend from the backend directory with Vercel."
Write-Host "Make sure the backend environment variables are already set in your Vercel backend project settings."

if ($Production) {
    vercel --prod
} else {
    vercel
}

Pop-Location
