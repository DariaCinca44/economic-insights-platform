from flask import Blueprint, jsonify, request, abort
from backend.app.connectors.eurostat_dsd import fetch_dsd_xml, extract_dimensions_order_from_xml
from backend.app.connectors.eurostat import fetch_timeseries

eurostat_bp= Blueprint('eurostat', __name__)

@eurostat_bp.get("/dsd")
def eurostat_dsd():
    dataset= request.args.get("dataset")
    if not dataset:
        abort(400, description="Missing dataset param")
    xml_text= fetch_dsd_xml(dataset)
    dims= extract_dimensions_order_from_xml(xml_text)

    return jsonify({
        "dataset": dataset,
        "dimensions_order": dims
    })

@eurostat_bp.get("/test")
def eurostat_test():
    dataset= request.args.get("dataset")
    key= request.args.get("key")
    if not dataset or not key:
        abort(400, description= "Use ?dataset=...&key=...")

    pts= fetch_timeseries(dataset, key, start_period="2020-01", end_period="2026-02")
    return jsonify({"count": len(pts), "sample": pts[:5]})