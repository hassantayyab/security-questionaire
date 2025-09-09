#!/bin/bash

# Summit Security Questionnaire - Development Startup Script
# This script sets up and starts both backend and frontend applications

echo "🚀 Starting Summit Security Questionnaire..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install concurrently if not already installed
if ! npm list concurrently &> /dev/null; then
    echo "📦 Installing concurrently..."
    npm install
fi

# Check if environment files exist
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Setting up backend environment file..."
    cp backend/env_template.txt backend/.env
    echo "⚠️  Please update backend/.env with your actual credentials"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "⚙️  Setting up frontend environment file..."
    cp frontend/env-template.txt frontend/.env.local
    echo "⚠️  Please update frontend/.env.local with your configuration"
fi

echo "🏃‍♂️ Starting development servers..."
echo "📍 Frontend will be available at: http://localhost:3000"
echo "📍 Backend API will be available at: http://localhost:8000"
echo "📍 API Documentation will be available at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================================"

# Start both applications
npm run dev
