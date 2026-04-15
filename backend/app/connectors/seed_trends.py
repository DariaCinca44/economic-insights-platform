import time
import random
import pandas as pd
from pytrends.request import TrendReq
from backend.app.core.config import DOMAIN_CONFIG
from backend.app.services.series_cache import get_or_create_series, upsert_points, mark_fetched

def seed_all_trends():
    pytrends = TrendReq(hl='ro-RO', tz=360, timeout=(10, 25), retries=3, backoff_factor=0.5)
    
    for code, config in DOMAIN_CONFIG.items():
        if "trends" not in config:
            continue
            
        keywords = config["trends"]["keywords"]
        title = config["trends"]["title"]
        joined_keys = "_".join(keywords)
        ck = f'gtrends:{joined_keys}'
        
        print(f"--- Procesare {code}: {title} ---")
        
        series_id = get_or_create_series(cache_key=ck, source="google_trends", title=title, ttl_hours=8760)

        try:
            print(f"Descarc datele pentru {keywords}...")
            pytrends.build_payload(keywords, timeframe='today 5-y', geo='RO')
            df = pytrends.interest_over_time()
            
            if not df.empty:
                if 'isPartial' in df.columns:
                    df = df.drop(columns=['isPartial'])

                df['avg_value'] = df[keywords].mean(axis=1)
                
                df_monthly = df['avg_value'].resample('MS').mean().dropna()
                
                points = []
                for timestamp, val in df_monthly.items():
                    points.append({
                        "date": timestamp.strftime('%Y-%m-%d'),
                        "value": round(float(val), 2)
                    })
                
                upsert_points(series_id, points)
                mark_fetched(series_id)
                print(f"Succes! {len(points)} luni salvate în DB.")
            
            wait = random.uniform(60, 90)
            print(f"Aștept {wait:.2f} secunde...")
            time.sleep(wait) 
            
        except Exception as e:
            print(f"Eroare la {code}: {e}")
            time.sleep(60) 

if __name__ == "__main__":
    seed_all_trends()