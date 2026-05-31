# MarketLens: B2B Economic Insights & Forecasting Platform 📈

MarketLens is a comprehensive, full-stack Market Intelligence platform designed to help B2B organizations make data-driven decisions. By aggregating macroeconomic hard data (Eurostat) with microeconomic soft data (Google Trends), the platform provides real-time analytics, dynamic multivariate forecasting, and AI-generated strategic business insights.

## 🌟 Key Features

* **Advanced Economic Dashboard:** Track real-time inflation rates, consumption volumes, and public interest across 12 distinct economic sectors.
* **Multivariate ML Forecasting:** Dynamically evaluates and compares **Prophet** and **ARIMA (SARIMAX)** models using Out-of-Sample (Train/Test) validation and MAE (Mean Absolute Error) to predict market trends up to 12 months in advance.
* **Generative AI Business Insights:** Integrates **Groq API (Llama-3.1-8b)** with strict Prompt Engineering to generate concise, highly specific, and actionable B2B strategies based on live chart data.
* **Cross-Sector Comparison:** Side-by-side graphical comparison of different markets, enhanced by AI to recommend CapEx/OpEx reallocations.
* **Robust Data Pipeline (ETL):** Automated data cleaning, temporal alignment (Inner Joins for missing data), and caching mechanisms for optimal performance.
* **Modern, Responsive UI:** Built with React & Vite, featuring Glassmorphism design, Dark/Light mode support, pinned graphs, and one-click CSV data exports.

## 🛠️ Tech Stack

**Frontend:**
* React 19 + TypeScript + Vite
* CSS Modules & Radix UI (for accessible components)
* Recharts (for complex, interactive time-series visualizations)
* Framer Motion (for fluid animations)

**Backend & Data Science:**
* Python 3 + Flask (RESTful API architecture)
* SQLAlchemy + PostgreSQL (Relational database managed via Docker)
* Pandas & Statsmodels (Data manipulation and ARIMA modeling)
* Prophet (Time-series forecasting)
* Groq API (High-speed LLM inference)

## 🚀 Getting Started

### Prerequisites
* Docker & Docker Compose
* Python 3.10+ (using `uv` or `venv`)
* Node.js 18+ & npm

### 1. Database Setup
```bash
cd backend
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Environment Variables Configuration
# Create a .env file in the backend folder and add:

# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=your_secret_password
# POSTGRES_DB=econ_db
# DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5433/${POSTGRES_DB}

# SECRET_KEY=a_very_long_and_secret_key
# JWT_ALGORITHM=HS256
# API_KEY=your_groq_api_key

# Initialize the database schema
python -m app.init_db

# Run the Flask server
python -m app.main
```

### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```
Navigate to http://localhost:5173 to access the platform.

## 🧠 Architecture & Data Flow

The platform bridges the gap between raw statistical data and actionable business logic:
 1. ETL Pipeline: Extracts data from Eurostat API and Google Trends, performs strict Inner Joins to drop missing historical points, and loads clean data into PostgreSQL.

 2. Security: Securely authenticates users (JWT), stores encrypted credentials (bcrypt), and personalizes the UI based on B2B/B2C profiles.

 3. Forecasting Engine: Aligns distinct time-series arrays to ensure valid predictive features before passing them to the machine learning algorithms (Prophet vs. ARIMA competition).

 4. AI Strategy: The Groq LLM analyzes the output dynamically, using strict prompt engineering rules to deliver concise business intelligence.

## 🎓 About

Designed and developed as a Bachelor's Degree Project in Economic Informatics.