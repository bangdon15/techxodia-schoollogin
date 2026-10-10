# Launches the Techxodia Web Admin Portal on Vercel Production
param (
    [switch]$Local
)

$vercelUrl = "https://web-admin-tau-three.vercel.app"

if ($Local) {
    Set-Location -Path "$PSScriptRoot\apps\web-admin"
    Write-Host "Starting local development server on http://localhost:3000..." -ForegroundColor Cyan
    npm run dev
} else {
    Write-Host "Opening Techxodia Web Admin Portal on Vercel..." -ForegroundColor Green
    Write-Host "URL: $vercelUrl" -ForegroundColor Cyan
    Start-Process $vercelUrl
}
