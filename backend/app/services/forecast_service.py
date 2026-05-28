import os
import pandas as pd
from dotenv import load_dotenv
from groq import Groq
from prophet import Prophet
import logging
from statsmodels.tsa.statespace.sarimax import SARIMAX
import warnings
warnings.filterwarnings("ignore")

from backend.app.core.config import DOMAIN_CONFIG
from backend.app.services.dashboard_data import get_points_for_series

load_dotenv()

GROQ_API_KEY = os.getenv('API_KEY')
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

log = logging.getLogger(__name__)

def get_ai_insights(title, last_hist: float, prophet_fore: float, arima_fore: float, months: int, best_model: str, mae_prophet: float, mae_arima: float):
    if not groq_client:
        return {
            "business_insight": "Analiza AI momentan indisponibilă. (Lipsă API Key Groq)",
            "automl_insight": "Explicația Auto-ML indisponibilă."
        }

    try:
        prompt_biz = (
            f"Ești un strateg de business B2B. Analizăm predicția pentru '{title}' pe următoarele {months} luni.\n"
            f"Valoarea actuală este {last_hist:.2f}, iar modelul nostru estimează că va ajunge la {prophet_fore if best_model == 'Prophet' else arima_fore:.2f}.\n\n"
            f"REGULI STRICTE:\n"
            f"1. FĂRĂ saluturi.\n"
            f"2. Explică scurt cum ar trebui ajustat bugetul sau stocurile firmei bazat pe această evoluție a pieței.\n"
            f"3. Folosește persoana I plural.\n"
            f"4. Maxim 3 propoziții scurte."
        )

        prompt_automl = (
            f"Ești un Data Scientist. Am folosit validare Train/Test Out-of-Sample pentru '{title}'.\n"
            f"Prophet a avut MAE = {mae_prophet:.2f}. ARIMA a avut MAE = {mae_arima:.2f}.\n"
            f"Modelul câștigător este: {best_model}.\n\n"
            f"REGULI STRICTE:\n"
            f"1. FĂRĂ saluturi. Începe DIRECT explicația.\n"
            f"2. Explică logic unui manager de ce ne bazăm pe {best_model} (argumentând prin marja de eroare MAE raportată comparativ cu celălalt model).\n"
            f"3. Maxim 3 propoziții scurte."
        )

        resp_biz = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt_biz}],
            model="llama-3.1-8b-instant",
            temperature=0.4
        )
        
        resp_automl = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt_automl}],
            model="llama-3.1-8b-instant",
            temperature=0.4
        )

        return {
            "business_insight": resp_biz.choices[0].message.content.strip(),
            "automl_insight": resp_automl.choices[0].message.content.strip()
        }
    except Exception as e:
        log.error(f'Eroare Groq: {e}')
        return {
            "business_insight": "A apărut o eroare la generarea strategiei de business.",
            "automl_insight": "A apărut o eroare la generarea explicației Auto-ML."
        }
    
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

    arima_forecast_values = []
    arima_lower_values = []
    arima_upper_values = []

    try:
        df_arima = df.reset_index(drop = True)
        model_arima = SARIMAX(df_arima['y'], exog = df_arima[['inflation', 'trends']], order=(1,1,1))
        res_arima= model_arima.fit(disp=False)

        future_exog = future_main.tail(months)[['inflation', 'trends']]
        arima_pred = res_arima.get_forecast(steps=months, exog=future_exog)

        arima_forecast_values = arima_pred.predicted_mean.tolist()
        arima_conf = arima_pred.conf_int(alpha=0.05)
        arima_lower_values = arima_conf.iloc[:, 0].tolist()
        arima_upper_values = arima_conf.iloc[:, 1].tolist()
    except Exception as e:
        log.error(f"Eroare ARIMA: {e}")
        arima_forecast_values = [None] * months
        arima_lower_values = [None] * months
        arima_upper_values = [None] * months

    test_size = 6
    if len(df) > test_size + 12: 
        train_df = df.iloc[:-test_size]
        test_df = df.iloc[-test_size:]

        m_test_prophet = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
        m_test_prophet.add_regressor('inflation')
        m_test_prophet.add_regressor('trends')
        m_test_prophet.fit(train_df)
        pred_prophet_test = m_test_prophet.predict(test_df)
        
        y_actual_test = test_df['y'].tolist()
        mae_prophet = sum(abs(a - p) for a, p in zip(y_actual_test, pred_prophet_test['yhat'].tolist())) / test_size
        
        try:
            model_test_arima = SARIMAX(train_df['y'], exog=train_df[['inflation', 'trends']], order=(1,1,1))
            res_test_arima = model_test_arima.fit(disp=False)
            pred_arima_test = res_test_arima.get_forecast(steps=test_size, exog=test_df[['inflation', 'trends']])
            mae_arima = sum(abs(a - p) for a, p in zip(y_actual_test, pred_arima_test.predicted_mean.tolist())) / test_size
        except Exception as e:
            log.warning(f"ARIMA a eșuat la evaluarea Train/Test: {e}")
            mae_arima = float('inf') 
            
        best_model = "Prophet" if mae_prophet <= mae_arima else "ARIMA"
    else:
        best_model = "Prophet"
        mae_prophet = 0.0
        mae_arima = 0.0

    results= []
    historical_points = []
    future_points = []
    arima_index = 0

    for i, row in forecast.iterrows():
        is_prediction = row['ds'] > df['ds'].max()
        points_data = {
            "date" : row['ds'].isoformat(),
            "yhat": round(row['yhat'], 2),
            "yhat_lower": round(row['yhat_lower'], 2),
            "yhat_upper": round(row['yhat_upper'], 2),
            "is_future": is_prediction,
            "yhat_arima" : None
        }

        if is_prediction and arima_index < len(arima_forecast_values):
            val = arima_forecast_values[arima_index]
            points_data["yhat_arima"] = round(val, 2) if val is not None else None

            val_lower = arima_lower_values[arima_index]
            points_data["yhat_arima_lower"] = round(val_lower, 2) if val_lower is not None else None

            val_upper = arima_upper_values[arima_index]
            points_data["yhat_arima_upper"] = round(val_upper, 2) if val_upper is not None else None

            arima_index += 1
        elif not is_prediction:
            points_data["yhat_arima"] = round(df.iloc[i]['y'], 2) if i < len(df) else None
            points_data["yhat_arima_lower"] = None
            points_data["yhat_arima_upper"] = None

        results.append(points_data)

        if is_prediction:
            future_points.append(points_data)
        else:
            historical_points.append(points_data)
        
    domain_label = DOMAIN_CONFIG[domain_code]["label"]
    last_historical = historical_points[-1]['yhat'] if historical_points else 0
    last_forecast = future_points[-1]['yhat'] if future_points else 0
    last_forecast_arima = future_points[-1]['yhat_arima'] if future_points and future_points[-1]['yhat_arima'] else 0

    insights = get_ai_insights(domain_label, last_historical, last_forecast, last_forecast_arima, months, best_model, mae_prophet, mae_arima)

    return {
        "domain": domain_code,
        "forecast_months": months,
        "data": results,
        "ai_insight": insights["business_insight"],
        "ai_automl_insight": insights["automl_insight"],
        "best_model": best_model
    }
    