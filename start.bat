@echo off
REM Summit Security Questionnaire - Development Startup Script (Windows)
REM This script sets up and starts both backend and frontend applications

echo 🚀 Starting Summit Security Questionnaire...
echo ================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 3 is not installed. Please install Python 3.9+ and try again.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install concurrently if not already installed
npm list concurrently >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing concurrently...
    npm install
)

REM Check if environment files exist
if not exist "backend\.env" (
    echo ⚙️  Setting up backend environment file...
    copy "backend\env_template.txt" "backend\.env"
    echo ⚠️  Please update backend\.env with your actual credentials
)

if not exist "frontend\.env.local" (
    echo ⚙️  Setting up frontend environment file...
    copy "frontend\env-template.txt" "frontend\.env.local"
    echo ⚠️  Please update frontend\.env.local with your configuration
)

echo 🏃‍♂️ Starting development servers...
echo 📍 Frontend will be available at: http://localhost:3000
echo 📍 Backend API will be available at: http://localhost:8000
echo 📍 API Documentation will be available at: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop both servers
echo ================================================

REM Start both applications
npm run dev

pause
