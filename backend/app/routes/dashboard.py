from flask import Blueprint, jsonify, request, g
from backend.app.core.config import DOMAIN_CONFIG
from backend.app.core.db import get_session
from backend.app.core.models import User
from backend.app.core.security import require_auth
from backend.app.services.dashboard_data import get_points_for_series

dashboard_bp= Blueprint('dashboard', __name__)

@dashboard_bp.get("/dashboard")
@require_auth
def dashboard():
    domain=request.args.get("domain")

    if not domain:
        with get_session() as session:
            user= session.get(User, g.user_id)
            if user and user.selected_domain:
                domain= user.selected_domain
            else:
                domain= 'food'

    domain= domain.lower()

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