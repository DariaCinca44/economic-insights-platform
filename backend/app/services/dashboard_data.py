import logging
from requests import RequestException

from backend.app.services.series_cache import (get_or_create_series, is_series_fresh, load_points, upsert_points, mark_fetched)
from backend.app.connectors.eurostat import fetch_timeseries
from backend.app.connectors.google_trends import fetch_trends_data

log = logging.getLogger(__name__)


def get_points_for_series(source: str, dataset: str, key: str | list, title: str, ttl_hours: int) -> dict:
    if source == 'eurostat':
        ck = f"eurostat:{dataset}:{key}"
    elif source == 'google_trends':
        joined_keys = "_".join(key) if isinstance(key, list) else key
        ck = f'gtrends:{joined_keys}'
    else:
        ck = f'unknown: {key}'

    series_id = get_or_create_series(cache_key=ck, source=source, title=title, ttl_hours=ttl_hours)

    if is_series_fresh(ck):
        return {"title": title, "cache_key": ck, "is_stale": False, "points": load_points(series_id)}

    try:
        if source == 'eurostat':
            points = fetch_timeseries(dataset, key)
        elif source == 'google_trends':
            points = fetch_trends_data(keywords=key)
        else:
            points = []

        if points:
            upsert_points(series_id, points)
            mark_fetched(series_id)

        return {"points": load_points(series_id)}

    except Exception as e:
        log.error(f"Eroare la preluarea datelor pentru {ck}: {e}")
        return {"points": load_points(series_id)}