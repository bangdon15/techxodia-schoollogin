# Launches the Web Admin Portal development server
Set-Location -Path "$PSScriptRoot\apps\web-admin"
Write-Host "Starting Techxodia Web Admin Portal on http://localhost:3000..." -ForegroundColor Cyan
npm run dev
