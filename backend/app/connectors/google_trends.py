import pandas as pd
import logging
import time
import random
from pytrends.request import TrendReq

log = logging.getLogger(__name__)


def fetch_trends_data(keywords: list[str], timeframe: str = 'today 5-y') -> list[dict]:
    try:
        pytrend = TrendReq(hl='ro-RO', tz=-120)

        kw_list = keywords[:5]

        pytrend.build_payload(kw_list=kw_list, geo='RO', timeframe=timeframe)
        df = pytrend.interest_over_time()

        if df.empty:
            log.warning(f'Nu s-au gasit date Google Trends pentru keyword-ul: {kw_list}')
            return []

        if 'isPartial' in df.columns:
            df = df.drop(columns=['isPartial'])

        df_monthly = df.resample('MS').mean().dropna()

        df_monthly['agregated_interest'] = df_monthly[kw_list].mean(axis=1)

        points = []
        for date, row in df_monthly.iterrows():
            points.append({
                "date": date.strftime('%Y-%m-%d'),
                "value": round(float(row['agregated_interest']), 2)
            })

        return points

    except Exception as e:
        log.error(f'Eroare la prelucrarea Google Trends pentru {keywords}: {e}')
        return []

def fetch_all_trends(domain_config : dict) -> dict:
    all_trends_data= {}

    for domain_code, config_data in domain_config.items():
        keywords = config_data.get("trends", {}).get("keywords", [])

        if not keywords:
            log.warning(f"Nu s-au gasit keyword-uri pentru domeniul {domain_code}")
            continue

        log.info(f"Preluare Google Trends pentru domeniul {domain_code} cu keyword-urile: {keywords}")
        points = fetch_trends_data(keywords)

        if points:
            all_trends_data[domain_code] = points
            log.info(f"Am extras {len(points)} luni pentru domeniul {domain_code}")
        else:
            log.error(f"Esec, nu am putut extrage date pentru domeniul {domain_code}")
        
        if domain_code !=  list(domain_config.keys())[-1]:
            sleep_time = random.uniform(15,25)
            log.info(f"Sleeping for {sleep_time:.2f} seconds to avoid rate limits...")
            time.sleep(sleep_time)
    
    return all_trends_data