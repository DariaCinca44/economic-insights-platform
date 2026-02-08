from flask import Flask, jsonify
from flask_cors import CORS
from backend.app.db import db_ping
from backend.app.domain_config import DOMAIN_CONFIG
from flask import request
from backend.app.connectors.eurostat_dsd import fetch_dsd_xml, extract_dimensions_order_from_xml
from backend.app.connectors.eurostat import fetch_timeseries
from backend.app.services.dashboard_data import get_points_for_series

app= Flask(__name__)
CORS(app)

@app.get("/health")
def health():
    return jsonify({"status": "ok"})

@app.get("/db-status")
def db_status():
    db_ping()
    return jsonify({"db": "ok"})

@app.get("/api/dashboard")
def dashboard():
    domain=request.args.get("domain", "food").lower()
    if domain not in DOMAIN_CONFIG:
        return jsonify({"error": "Unknown domain", "allowed": list(DOMAIN_CONFIG.keys())}), 400

    config= DOMAIN_CONFIG[domain]

    inflation= config["inflation"]
    consumption=config["consumption"]

    inflation_data= get_points_for_series(
        dataset= inflation["dataset"],
        key= inflation["key"],
        title= inflation["title"],
        ttl_hours= inflation.get("ttl_hours", 24)
    )

    consumption_data= get_points_for_series(
        dataset= consumption["dataset"],
        key= consumption["key"],
        title= consumption["title"],
        ttl_hours= consumption.get("ttl_hours", 24)
    )

    return jsonify({
        "domain": domain,
        "label" : config["label"],
        "charts": {
            "inflation": inflation_data,
            "consumption": consumption_data
        }
    })

@app.get("/api/eurostat/dsd")
def eurostat_dsd():
    dataset= request.args.get("dataset")
    if not dataset:
        return jsonify({"error": "Missing dataset param"})
    xml_text= fetch_dsd_xml(dataset)
    dims= extract_dimensions_order_from_xml(xml_text)

    return jsonify({
        "dataset": dataset,
        "dimensions_order": dims
    })

@app.get("/api/eurostat/test")
def eurostat_test():
    dataset= request.args.get("dataset")
    key= request.args.get("key")
    if not dataset or not key:
        return jsonify({"error": "Use ?dataset=...&key=..."}),400

    pts= fetch_timeseries(dataset, key, start_period="2020-01", end_period="2026-02")
    return jsonify({"count": len(pts), "sample": pts[:5]})

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=8000)