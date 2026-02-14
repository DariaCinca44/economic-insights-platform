import os
import pandas as pd
from dotenv import load_dotenv
import google.generativeai as genai
from prophet import Prophet
from sqlalchemy import select
from sqlalchemy.orm import Session


from backend.app.core.models import DataPoint

load_dotenv()
API_KEY= os.getenv('API_KEY')

if API_KEY:
    genai.configure(api_key=API_KEY)

def get_ai_insight(title, history_points, forecast_points):
    if not API_KEY:
        return 'Analiza AI momentan indisponibila'

    try:
        model = genai.GenerativeModel(model_name='gemini-2.5-flash')

        last_hist= history_points[-1]['value'] if history_points else 0
        last_fore = forecast_points[-1]['value'] if forecast_points else 0
        trend= 'crestere' if last_fore > last_hist else 'scadere'

        prompt= f'''
        Esti un analist economic. Analizeaza datele pentru: {title}. Valoarea actuala este {last_hist}, iar prognoza indica o {trend} pana la {last_fore}. Explica scurt (maxim 3 propozitii) ce inseamna asta pentru un om obisnuit.
        '''

        response= model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f'Eroare Gemini: {e}')
        return 'Eroare la generarea explicatiei AI.'

def generate_forecast(series_id: int, session: Session, months: int=6):
    points= session.execute(select(DataPoint).where(DataPoint.series_id == series_id).order_by(DataPoint.date.asc())).scalars().all()

    if len(points) < 12:
        print('Nu sunt suficiente puncte pentru serie: ', series_id)
        return None

    df= pd.DataFrame([ {'ds': p.date.replace(tzinfo= None), 'y': p.value} for p in points])

    df.dropna(inplace= True)

    try:
        model= Prophet(yearly_seasonality= True, weekly_seasonality= False, daily_seasonality= False)
        model.fit(df)
    except Exception as e:
        print(f'Eroare Prophet: ', e)
        return None

    future= model.make_future_dataframe(periods= months, freq= 'MS')
    forecast= model.predict(future)

    last_hist_date= df['ds'].max()

    results=[]
    for _, row in forecast.iterrows():
        is_forecast= row['ds'] > last_hist_date
        results.append({
            'date': row['ds'].isoformat(),
            'value': round(row['yhat'], 2),
            'lower': round(row['yhat_lower'], 2),
            'upper': round(row['yhat_upper'], 2),
            'is_forecast': is_forecast
        })
    return results