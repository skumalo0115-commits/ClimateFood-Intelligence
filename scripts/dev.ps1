param(
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 3000
)

$repoRoot = Split-Path -Parent $PSScriptRoot

# Backend
$backendCmd = @'
if (!(Test-Path .venv)) {
  if (Get-Command py -ErrorAction SilentlyContinue) { py -3 -m venv .venv }
  elseif (Get-Command python -ErrorAction SilentlyContinue) { python -m venv .venv }
  else { Write-Error 'Python not found. Install Python 3.x or enable the py launcher.'; exit 1 }
}
$py = Join-Path (Resolve-Path .\.venv) "Scripts\\python.exe"
if (!(Test-Path $py)) { Write-Error 'Virtual environment is missing python.exe. Delete .venv and rerun.'; exit 1 }
if (!(Test-Path .env)) { Copy-Item .env.example .env }
& $py -m pip install -r requirements.txt
& $py -m uvicorn app.main:app --reload --port __BACKEND_PORT__
'@
$backendCmd = $backendCmd.Replace('__BACKEND_PORT__', $BackendPort)

Start-Process powershell -WorkingDirectory "$repoRoot\\backend" -ArgumentList @(
    "-NoExit",
    "-Command",
    $backendCmd
)

# Frontend
$frontendCmd = @'
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm install
npm run dev -- --port __FRONTEND_PORT__
'@
$frontendCmd = $frontendCmd.Replace('__FRONTEND_PORT__', $FrontendPort)

Start-Process powershell -WorkingDirectory "$repoRoot\\frontend" -ArgumentList @(
    "-NoExit",
    "-Command",
    $frontendCmd
)
