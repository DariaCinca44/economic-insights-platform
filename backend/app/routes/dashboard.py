import os
import json
from groq import Groq
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

@dashboard_bp.post("/insights")
@require_auth
def get_chart_insights():
    api_key = os.getenv("API_KEY")
    if not api_key:
        return jsonify({"error": "API key not configured"}), 500
    
    client= Groq(api_key=api_key)

    data= request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    title= data.get("title", "Grafic")
    points = data.get("points", [])

    if not points or len(points) < 2:
        return jsonify({"error": "Not enough data points to generate insights"}), 400
    
    try:
        compact_points = [{"date" : p.get("date"), "value": round(float(p.get("value")),2)} for p in points]
        data_str = json.dumps(compact_points)
    except Exception as e:
        return jsonify({"error": "Invalid data points format"}), 400

    prompt = (
        f"Ești un consultant de business B2B care sfătuiește un antreprenor sau directorul unei firme. Graficul: '{title}'. Datele: {data_str}\n\n"
        f"REGULI STRICTE DE GÂNDIRE:\n"
        f"1. EȘTI INTERZIS SĂ DAI SFATURI PENTRU PERSOANE FIZICE! Nu folosi expresii ca 'oamenii să își gestioneze bugetul'. Gândește EXCLUSIV din perspectiva unei FIRME (costuri operaționale, marje de profit, furnizori, clienți B2B/B2C).\n"
        f"2. Gândește contextual la titlu! Dacă e 'Inflație - Comunicații', înseamnă că abonamentele IT, internetul, curieratul și telefonia se scumpesc pentru firmă. Sfatul tău trebuie să fie despre securizarea contractelor B2B pe termen lung sau ajustarea bugetelor IT.\n"
        f"3. Începe direct (fără saluturi, fără roleplay). Folosește persoana I plural ('observăm', 'recomandarea noastră strategică pentru companie').\n"
        f"4. Structură: O frază despre trendul datelor (când e vârful absolut) + o acțiune tactică specifică de business. Maxim 4 propoziții, într-un singur paragraf fluid, fără cacofonii."
    )

    try:
       chat_completion = client.chat.completions.create(
           messages=[{"role": "user", "content": prompt}],
           model="llama-3.1-8b-instant",
           temperature=0.5
       )
       return jsonify({"insight": chat_completion.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": "Failed to generate insights", "details": str(e)}), 500