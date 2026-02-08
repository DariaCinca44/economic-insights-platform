import logging
from requests import RequestException

from backend.app.services.series_cache import (get_or_create_series, is_series_fresh, load_points, upsert_points, mark_fetched)
from backend.app.connectors.eurostat import fetch_timeseries

log = logging.getLogger(__name__)

def get_points_for_series(dataset: str, key: str, title: str, ttl_hours: int) -> dict:
    ck= f"eurostat:{dataset}:{key}"
    series_id= get_or_create_series(cache_key=ck, source="eurostat", title=title, ttl_hours=ttl_hours)

    if is_series_fresh(ck):
        return{"title": title,"cache_key": ck,"is_stale": False, "points": load_points(series_id)}

    try:
        points = fetch_timeseries(dataset, key)
        upsert_points(series_id, points)
        mark_fetched(series_id)

        return{"title": title, "cache_key": ck, "is_stale": False, "points": load_points(series_id)}
    except RequestException as e:
        log.exception("Eurostat fetch failed for %s: %s", title,e)

        cached_points= load_points(series_id)
        if cached_points:
            return {"title": title, "cache_key": ck, "is_stale": True, "points": cached_points}

        raise