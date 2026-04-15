import pandas as pd
import os
import glob
from backend.app.core.config import DOMAIN_CONFIG
from backend.app.services.series_cache import get_or_create_series, upsert_points, mark_fetched

def import_csv_to_db():
    base_path = "backend/data/raw_trends/" 
    
    for code, config in DOMAIN_CONFIG.items():
        if "trends" not in config: continue

        search_pattern = os.path.join(base_path, f"*{code}*.csv")
        matching_files = glob.glob(search_pattern)
        
        if not matching_files:
            print(f"--- [!] Lipsește fișierul pentru {code} (căutat: {code})")
            continue

        file_path = matching_files[0]
        keywords = config["trends"]["keywords"]
        title = config["trends"]["title"]
        ck = f'gtrends:{"_".join(keywords)}'
        
        print(f"--- Procesare Import {code}: {title} ---")
        
        try:

            df = pd.read_csv(file_path)

            df.rename(columns={df.columns[0]: 'date'}, inplace=True)

            kw_cols = [c for c in df.columns if c != 'date']
            for col in kw_cols:
                df[col] = pd.to_numeric(df[col].astype(str).str.replace('<', ''), errors='coerce').fillna(0)
                
            df['avg_value'] = df[kw_cols].mean(axis=1)
            
            df['date'] = pd.to_datetime(df['date'])
            df.set_index('date', inplace=True)
            df_monthly = df['avg_value'].resample('MS').mean().dropna()

            series_id = get_or_create_series(cache_key=ck, source="google_trends", title=title, ttl_hours=8760)
            
            points = []
            for timestamp, val in df_monthly.items():
                points.append({
                    "date": timestamp.strftime('%Y-%m-%d'),
                    "value": round(float(val), 2)
                })
            
            upsert_points(series_id, points)
            mark_fetched(ck) 
            print(f"   [OK] {len(points)} luni salvate în Baza de Date.")
            
        except Exception as e:
            print(f"   [EROARE] Fișierul {file_path}: {e}")

if __name__ == "__main__":
    import_csv_to_db()