@echo off
echo ========================================
echo PostgreSQL Connection Test
echo ========================================

cd /d C:\Users\Vansh\Downloads\hotelmanagementsoftware1

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    pause
    exit /b 1
)

echo.
echo Checking if dependencies are installed...
if not exist "node_modules\pg" (
    echo Installing dependencies...
    npm install pg dotenv
)

echo.
echo Testing PostgreSQL connection...
node scripts/postgres_connection.js

echo.
echo Press any key to exit...
pause > nul