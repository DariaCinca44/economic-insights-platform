from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from backend.app.db import get_session
from backend.app.models import Series, DataPoint

def _is_fresh(series: Series) ->bool:
    if not series.last_fetched_at:
        return False
    return datetime.utcnow()<series.last_fetched_at+ timedelta(hours=series.ttl_hours)

def get_or_create_series(cache_key: str, source: str, title: str |None, ttl_hours: int)->int:
    with get_session() as session:
        s= session.execute(select(Series).where(Series.cache_key == cache_key)).scalar_one_or_none()
        if s:
            if title and s.title != title:
                s.title= title
            if ttl_hours and s.ttl_hours != ttl_hours:
                s.ttl_hours = ttl_hours
            session.commit()
            return s.id

        s= Series(source= source, cache_key= cache_key, title=title, ttl_hours= ttl_hours )
        session.add(s)
        session.commit()
        session.refresh(s)
        return s.id

def upsert_points(series_id: int, points: list[dict]):
    with get_session() as session:
        for p in points:
            dp= DataPoint(series_id= series_id, date=p["date"], value=p["value"])
            session.add(dp)
            try:
                session.flush()
            except IntegrityError:
                session.rollback()
        session.commit()

def load_points(series_id: int) ->list[dict]:
    with get_session() as session:
        rows= session.execute(select(DataPoint).where(DataPoint.series_id == series_id).order_by(DataPoint.date.asc())).scalars().all()
    return [{"date": r.date.isoformat(), "value": r.value} for r in rows]

def mark_fetched(series_id: int):
    with get_session() as session:
        s= session.get(Series, series_id)
        s.last_fetched_at = datetime.utcnow()
        session.commit()

def get_series_by_key(cache_key: str)-> Series| None:
    with get_session() as session:
        return session.execute(select(Series).where(Series.cache_key == cache_key)).scalar_one_or_none()

def is_series_fresh(cache_key: str)-> bool:
    s= get_series_by_key(cache_key)
    return bool(s and _is_fresh(s))