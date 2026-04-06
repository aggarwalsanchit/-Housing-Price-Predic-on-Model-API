# Housing Price Prediction System

A complete full-stack application for predicting housing prices using machine learning, featuring a FastAPI backend and Next.js frontend portal.

## Overview

### Task 1: ML Model API
- Single property price prediction
- Batch property predictions
- Model information endpoint (coefficients, metrics)
- Health check endpoint
- Swagger/OpenAPI documentation
- Docker containerization
- CORS enabled for frontend integration

### Task 2: Next.js Portal

#### App 1: Property Value Estimator
- Interactive form with client-side validation
- Visual price charts (Bar charts, Line charts)
- History tracking (localStorage)
- Batch prediction mode
- Side-by-side property comparison
- Fully responsive design

#### App 2: Property Market Analysis
- Interactive market visualizations
- What-if analysis tool
- Price vs Square Footage correlation
- School rating impact analysis
- Market trends (2000-2024)
- CSV export functionality
- Responsive data tables

### Task 1

# Navigate to ML API directory
cd ml-api

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the model
python train_model.py

# Run the API server
python main.py

### Task 2

# Navigate to Next.js directory
cd nextjs-portal

# Install dependencies
npm install

# Run development server
npm run dev
