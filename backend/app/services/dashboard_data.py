from backend.app.services.series_cache import (get_or_create_series, is_series_fresh, load_points, upsert_points, mark_fetched)
from backend.app.connectors.eurostat import fetch_timeseries

def cache_key(dataset: str, key:str) ->str:
    return f"eurostat:{dataset}:{key}"

def get_points_for_series(dataset: str, key: str, title: str, ttl_hours: int):
    ck= cache_key(dataset,key)
    s= get_or_create_series(cache_key=ck, source="eurostat", title=title,ttl_hours=ttl_hours)

    if is_series_fresh(ck):
        return{"series_id": s, "dataset": dataset, "key": key, "title": title, "points": load_points(s)}

    pts= fetch_timeseries(dataset,key, start_period="2020-01", end_period="2026-02")
    upsert_points(s, pts)
    mark_fetched(s)

    return {"series_id": s, "dataset": dataset, "key": key, "title": title, "points": load_points(s)}