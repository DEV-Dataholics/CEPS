# Compuerta de Calidad Integral - CEPS
$Raiz = $PSScriptRoot
$Web = Join-Path $Raiz "apps\web"
$Api = Join-Path $Raiz "apps\api"
$Fallas = 0

Write-Host ""
Write-Host "=================================================="
Write-Host ">>> 1. Frontend: Typecheck (tsc --noEmit)"
Write-Host "=================================================="
Set-Location $Web
npx tsc --noEmit -p tsconfig.app.json
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Frontend Typecheck fallo" -ForegroundColor Red
    $Fallas++
} else {
    Write-Host "[OK] Frontend Typecheck paso" -ForegroundColor Green
}

Write-Host ""
Write-Host "=================================================="
Write-Host ">>> 2. Frontend: Lint (oxlint)"
Write-Host "=================================================="
Set-Location $Web
npx oxlint
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Frontend Lint fallo" -ForegroundColor Red
    $Fallas++
} else {
    Write-Host "[OK] Frontend Lint paso" -ForegroundColor Green
}

Write-Host ""
Write-Host "=================================================="
Write-Host ">>> 3. Backend: Rutas CodeIgniter 4"
Write-Host "=================================================="
Set-Location $Api
php spark routes
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Backend Rutas fallo" -ForegroundColor Red
    $Fallas++
} else {
    Write-Host "[OK] Backend Rutas paso" -ForegroundColor Green
}

Set-Location $Raiz

Write-Host ""
Write-Host "=================================================="
if ($Fallas -eq 0) {
    Write-Host "[OK] COMPUERTA EN VERDE - Todos los chequeos pasaron correctamente." -ForegroundColor Green
    exit 0
} else {
    Write-Host "[FAIL] COMPUERTA ROJA - $Fallas chequeos fallaron." -ForegroundColor Red
    exit 1
}
