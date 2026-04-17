import os
import pandas as pd
from dotenv import load_dotenv
from groq import Groq
from prophet import Prophet
import logging

from backend.app.core.config import DOMAIN_CONFIG
from backend.app.services.dashboard_data import get_points_for_series

load_dotenv()

GROQ_API_KEY = os.getenv('API_KEY')
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

log = logging.getLogger(__name__)

def get_ai_insight(title, last_hist: float, last_fore: float, months: int):
    if not groq_client:
        return 'Analiza AI momentan indisponibilă. (Lipsă API Key Groq)'

    try:
        prompt = (
            f"Ești un strateg de business B2B. Analizăm o predicție (forecast) pentru '{title}' "
            f"pe următoarele {months} luni din anul 2026.\n"
            f"Ultima valoare istorică stabilizată este {last_hist:.2f}, iar modelul nostru Prophet "
            f"estimează că va ajunge la {last_fore:.2f} la finalul perioadei.\n\n"
            f"REGULI STRICTE:\n"
            f"1. FĂRĂ saluturi sau introduceri de tip roleplay. Începe DIRECT analiza.\n"
            f"2. Gândește EXCLUSIV din perspectiva unei firme/companii. NU da sfaturi populației.\n"
            f"3. Sfatul tactic trebuie să fie ancorat în direcția trendului (cum ajustăm bugetul dacă crește/scade?).\n"
            f"4. Folosește persoana I plural ('observăm', 'estimăm', 'recomandarea noastră strategică').\n"
            f"5. LUNGIME MAXIMĂ: Un singur paragraf scurt (aprox. 3-4 propoziții)."
        )

        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.4
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        log.error(f'Eroare Groq: {e}')
        return 'A apărut o eroare la generarea strategiei AI.'

def fetch_all_domain_data(domain_code: str):
    config = DOMAIN_CONFIG[domain_code]

    inflation_data = get_points_for_series(
        source = config["inflation"]["source"],
        dataset= config["inflation"]["dataset"],
        key= config["inflation"]["key"],
        title= config["inflation"]["title"],
        ttl_hours= config["inflation"].get("ttl_hours", 8760)
    )

    consumption_data = get_points_for_series(
        source = config["consumption"]["source"],
        dataset= config["consumption"]["dataset"],
        key= config["consumption"]["key"],
        title= config["consumption"]["title"],
        ttl_hours= config["consumption"].get("ttl_hours", 8760)
    )

    trends_data = get_points_for_series(
        source = "google_trends",
        dataset= "trends",
        key= config["trends"]["keywords"],
        title= config["trends"]["title"],
        ttl_hours= 8760
    )

    return inflation_data["points"], consumption_data["points"], trends_data["points"]

def align_dataframes(inflation_points, consumption_points, trends_points):
    if not inflation_points or not consumption_points or not trends_points:
        raise ValueError("Date insuficiente pentru prognoză multivariată")
    
    df_inflation= pd.DataFrame(inflation_points).rename(columns = {'date': 'ds', 'value': 'inflation'})
    df_consumption = pd.DataFrame(consumption_points).rename(columns = {'date': 'ds', 'value': 'y'})
    df_trends = pd.DataFrame(trends_points).rename(columns = {'date': 'ds', 'value': 'trends'})

    df_inflation['ds'] = pd.to_datetime(df_inflation['ds']).dt.tz_localize(None)
    df_consumption['ds'] = pd.to_datetime(df_consumption['ds']).dt.tz_localize(None)
    df_trends['ds'] = pd.to_datetime(df_trends['ds']).dt.tz_localize(None)

    df = pd.merge(df_consumption, df_inflation, on='ds', how='inner')
    df = pd.merge(df, df_trends, on='ds', how='inner')

    df = df.sort_values('ds').dropna()
    return df

def generate_multivariate_forecast(domain_code: str, months: int = 6):
    log.info(f"Generare prognoză multivariată pentru domeniul {domain_code} pe {months} luni")

    info_pts, cons_pts, trends_pts = fetch_all_domain_data(domain_code)
    df = align_dataframes(info_pts, cons_pts, trends_pts)

    if len(df) < 12:
        raise ValueError("Date insuficiente pentru prognoză multivariată (minim 12 puncte comune)")
    
    m_inf = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
    m_inf.fit(df[['ds', 'inflation']].rename(columns={'inflation': 'y'}))
    future_dates= m_inf.make_future_dataframe(periods=months, freq='MS')
    forecast_inf = m_inf.predict(future_dates)

    m_trends = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
    m_trends.fit(df[['ds', 'trends']].rename(columns={'trends': 'y'}))
    future_dates_trends = m_trends.predict(future_dates)

    m_main = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
    m_main.add_regressor('inflation')
    m_main.add_regressor('trends')
    m_main.fit(df)

    future_main = future_dates.copy()
    future_main['inflation'] = forecast_inf['yhat']
    future_main['trends'] = future_dates_trends['yhat']

    forecast = m_main.predict(future_main)

    results= []
    historical_points = []
    future_points = []

    for _, row in forecast.iterrows():
        is_prediction = row['ds'] > df['ds'].max()
        points_data = {
            "date" : row['ds'].isoformat(),
            "yhat": round(row['yhat'], 2),
            "yhat_lower": round(row['yhat_lower'], 2),
            "yhat_upper": round(row['yhat_upper'], 2),
            "is_future": is_prediction
        }
        results.append(points_data)

        if is_prediction:
            future_points.append(points_data)
        else:
            historical_points.append(points_data)
        
    domain_label = DOMAIN_CONFIG[domain_code]["label"]
    last_historical = historical_points[-1]['yhat'] if historical_points else 0
    last_forecast = future_points[-1]['yhat'] if future_points else 0

    ai_insight_text = get_ai_insight(domain_label, last_historical, last_forecast, months)

    return{
        "domain": domain_code,
        "forecast_months": months,
        "data": results,
        "ai_insight": ai_insight_text
    }