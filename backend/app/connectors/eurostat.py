import requests
from datetime import datetime, timezone
from urllib.parse import quote

BASE = "https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data"


def _build_url(dataset: str, key: str, start_period: str, end_period: str) -> str:
    safe_key = quote(key)
    return (
        f"{BASE}/{dataset}/{safe_key}"
        f"?format=JSON"
        f"&startPeriod={start_period}"
        f"&endPeriod={end_period}"
    )


def _parse_time_str(t: str) -> datetime:
    if "-" in t:
        dt = datetime.strptime(t, "%Y-%m")
    elif "M" in t and len(t) >= 6:
        dt = datetime.strptime(t.replace("M", "-"), "%Y-%m")
    else:
        dt = datetime.strptime(t, "%Y")
    return dt.replace(tzinfo=timezone.utc)


def parse_json_to_points(payload: dict) -> list[dict]:
    dim_order = payload.get("id", [])
    dims = payload.get("dimension", {})
    values = payload.get("value", {})

    if not dim_order or not dims or values is None:
        raise RuntimeError(f"Unexpected JSON-stat payload keys={list(payload.keys())}")

    time_dim = None
    for d in dim_order:
        if d in ("TIME_PERIOD", "time", "TIME"):
            time_dim = d
            break
    if time_dim is None:
        time_dim = dim_order[-1]

    time_index = dims[time_dim]["category"]["index"]
    if isinstance(time_index, dict):
        time_vals = list(time_index.keys())
    else:
        time_vals = list(time_index)

    points = []
    if isinstance(values, dict):
        for i in range(len(time_vals)):
            v = values.get(str(i))
            if v is None:
                continue
            points.append({"date": _parse_time_str(time_vals[i]), "value": float(v)})
    else:
        for i, v in enumerate(values):
            if v is None:
                continue
            points.append({"date": _parse_time_str(time_vals[i]), "value": float(v)})
    points.sort(key=lambda x: x["date"])
    return points


def fetch_timeseries(dataset: str, key: str, start_period="2019-01", end_period="2026-02") -> list[dict]:
    url = _build_url(dataset, key, start_period, end_period)
    r = requests.get(url, timeout=30, headers={"Accept": "application/json"})

    r.raise_for_status()

    payload = r.json()

    if payload.get("class") == "dataset" and payload.get("version") == "2.0":
        return parse_json_to_points(payload)

    raise RuntimeError(f"Unknown response format keys={list(payload.keys())} body_start={str(payload)[:500]}")
