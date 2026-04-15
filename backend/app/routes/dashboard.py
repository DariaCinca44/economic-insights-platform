from flask import Blueprint, jsonify, request, g
from backend.app.core.config import DOMAIN_CONFIG
from backend.app.core.db import get_session
from backend.app.core.models import User
from backend.app.core.security import require_auth
from backend.app.services.dashboard_data import get_points_for_series

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.get("/user-domains")
@require_auth
def get_user_domains():
    with get_session() as session:
        user = session.get(User, g.user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        domains_to_fetch = []
        if user.is_all_domains:
            domains_to_fetch = list(DOMAIN_CONFIG.keys())
        else:
            if user.primary_domain:
                domains_to_fetch.append(user.primary_domain)
            if user.secondary_domains:
                domains_to_fetch.extend(user.secondary_domains)

        if not domains_to_fetch:
            domains_to_fetch = ['CP01']

    unique_domains = list(dict.fromkeys(domains_to_fetch))
    results = []

    for domain in unique_domains:
        domain = domain.upper()
        if domain in DOMAIN_CONFIG:
            results.append({
                "id": domain,
                "label": DOMAIN_CONFIG[domain].get("label")
            })
    
    return jsonify({"domains": results})


@dashboard_bp.get("/domain-data")
@require_auth
def get_domain_data():
    domain = request.args.get("domain")
    if not domain or domain.upper() not in DOMAIN_CONFIG:
        return jsonify({"error": "Domeniu invalid sau lipsa"}), 400

    domain = domain.upper()
    config = DOMAIN_CONFIG[domain]

    inflation = config.get("inflation")
    consumption = config.get("consumption")
    trends = config.get("trends")

    inflation_res = get_points_for_series(
        source=inflation["source"],
        dataset=inflation["dataset"],
        key=inflation["key"],
        title=inflation["title"],
        ttl_hours=inflation.get("ttl_hours", 8760)
    ) if inflation else {}

    consumption_res = get_points_for_series(
        source=consumption["source"],
        dataset=consumption["dataset"],
        key=consumption["key"],
        title=consumption["title"],
        ttl_hours=consumption.get("ttl_hours", 8760)
    ) if consumption else {}

    trends_res = get_points_for_series(
        source="google_trends",
        dataset="trends",
        key=trends["keywords"],
        title=trends["title"],
        ttl_hours=8760
    ) if trends else {}

    return jsonify({
        "domain": domain,
        "label": config.get("label"),
        "charts": {
            "inflation": inflation_res.get("points", []),
            "consumption": consumption_res.get("points", []),
            "trends": trends_res.get("points", []),
            "prices": [],
            "correlation": []
        }
    })