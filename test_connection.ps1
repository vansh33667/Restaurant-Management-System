# PostgreSQL Connection Test Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Connection Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Change to project directory
Set-Location "C:\Users\Vansh\Downloads\hotelmanagementsoftware1"

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check and install dependencies
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules\pg")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install pg dotenv
}

Write-Host ""

# Test connection
Write-Host "Testing PostgreSQL connection..." -ForegroundColor Yellow
try {
    node scripts/postgres_connection.js
    Write-Host "Connection test completed!" -ForegroundColor Green
} catch {
    Write-Host "Connection test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"