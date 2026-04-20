import os
import re
import json
from groq import Groq
from flask import Blueprint, jsonify, request, g
from backend.app.core.config import DOMAIN_CONFIG
from backend.app.core.db import get_session
from backend.app.core.models import User
from backend.app.core.security import require_auth
from backend.app.services.dashboard_data import get_points_for_series
from sqlalchemy.orm.attributes import flag_modified
import bcrypt

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
        f"Ești un expert strategic B2B și analist de piață, specializat STRICT în industria: '{title}'.\n"
        f"Datele analizate: {data_str}\n\n"
        f"REGULI STRICTE DE GÂNDIRE:\n"
        f"1. EȘTI INTERZIS SĂ DAI SFATURI PENTRU PERSOANE FIZICE! Gândește EXCLUSIV din perspectiva unei FIRME (costuri operaționale, marje de profit, furnizori B2B).\n"
        f"2. ANCOREAZĂ SFATUL ÎN DOMENIU: Este obligatoriu să folosești termeni specifici industriei din titlu ('{title}'). Dacă e 'Sănătate', vorbește despre clinici, consumabile medicale sau asigurări. Dacă e 'Transport', vorbește despre flote auto, carburant, logistică. Nu da sfaturi generice precum 'reduceți costurile'.\n"
        f"3. Începe direct (fără saluturi, fără introduceri). Folosește persoana I plural ('observăm', 'recomandarea noastră').\n"
        f"4. Structură: O frază despre trendul datelor + o acțiune tactică de business ultra-specifică domeniului. Maxim 4 propoziții, un singur paragraf."
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
    
@dashboard_bp.get("/pinned-graphs")
@require_auth
def get_pinned_graphs():
    with get_session() as session:
        user = session.get(User, g.user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({"pinned_graphs": user.pinned_graphs or []})

@dashboard_bp.post("/pinned-graphs")
@require_auth
def save_pinned_graphs():
    with get_session() as session:
        user = session.get(User, g.user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json() or {}
        user.pinned_graphs = data.get("pinned_graphs", [])
        flag_modified(user, "pinned_graphs")
        session.commit()
        return jsonify({"message": "Grafice salvate cu succes"})
    
@dashboard_bp.post("/compare-insights")
@require_auth
def get_comparison_insights():
    api_key = os.getenv("API_KEY")
    if not api_key:
        return jsonify({"error": "API key not configured"}), 500
    
    client= Groq(api_key=api_key)
    data= request.get_json()

    if not data:
        return jsonify({"error": "Invalid request body"}), 400
    
    domain_left = data.get("domain_left", "Domeniu A")
    domain_right = data.get("domain_right", "Domeniu B")

    prompt = (
        f"Ești un consultant strategic B2B de top. Sarcina ta este să analizezi și să compari oportunitățile de business între două sectoare diferite: '{domain_left}' și '{domain_right}'.\n\n"
        f"REGULI STRICTE DE GENERARE:\n"
        f"1. Folosește EXACT numele '{domain_left}' și '{domain_right}' în analiză.\n"
        f"2. FĂRĂ SFATURI GENERICE! Oferă sfaturi bazate pe realitatea fizică a fiecărui domeniu. Folosește vocabular specific (ex: pentru 'Alimente' vorbește despre lanțuri de aprovizionare, materii prime; pentru 'Educație' vorbește despre training-uri, digitalizare, retenție personal).\n"
        f"3. FĂRĂ SFATURI PENTRU PERSOANE FIZICE! Adresează-te unui CEO care trebuie să decidă unde să își aloce bugetele (Capex/Opex) între cele două piețe.\n"
        f"4. Fără introduceri sau concluzii banale. Începe direct analiza.\n"
        f"5. Structură: O frază care evidențiază diferența de risc/oportunitate dintre '{domain_left}' și '{domain_right}' + o recomandare tactică clară de migrare a resurselor. Maxim 4 propoziții."
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
    
@dashboard_bp.post("/user/preferences")
@require_auth
def update_preferences():
    with get_session() as session:
        user = session.get(User, g.user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json() or {}

        primary_domain = data.get("primary_domain") or data.get("primaryDomain")
        secondary_domains = data.get("secondary_domains", []) or data.get("secondaryDomains")

        if not primary_domain:
            return jsonify({"error": "Domeniul principal este obligatoriu!"}), 400
        
        try:
            user.primary_domain = primary_domain
            user.secondary_domains = secondary_domains

            user.pinned_graphs = []

            flag_modified(user, "secondary_domains")
            flag_modified(user, "pinned_graphs")

            session.commit()
            return jsonify({"message": "Preferințe actualizate cu succes!"})
        
        except Exception as e:
            session.rollback()
            return jsonify({"error": "Eroare la actualizarea preferințelor", "details": str(e)}), 500

@dashboard_bp.post("/user/password")
@require_auth
def update_password():
    with get_session() as session:
        user = session.get(User, g.user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json() or {}
        current_password = data.get("current_password") or data.get("currentPassword")
        new_password = data.get("new_password") or data.get("newPassword")

        if not current_password or not new_password:
            return jsonify({"error": "Ambele câmpuri sunt obligatorii!"}), 400
        
        if current_password == new_password:
            return jsonify({"error": "Noua parolă trebuie să fie diferită de cea curentă!"}), 400
        
        if len(new_password) < 8:
            return jsonify({"error": "Parola nouă trebuie să aibă cel puțin 8 caractere!"}), 400
        
        if not re.search(r'[A-Z]', new_password):
            return jsonify({"error": "Parola nouă trebuie să conțină cel puțin o literă mare!"}), 400
            
        if not re.search(r'\d', new_password):
            return jsonify({"error": "Parola nouă trebuie să conțină cel puțin o cifră!"}), 400
        
        if not user.password_hash:
            return jsonify({"error": "Parola curentă nu este setată. Contactați suportul pentru resetare."}), 400
        
        try:
            is_valid = bcrypt.checkpw(current_password.encode('utf-8'), user.password_hash.encode('utf-8'))
        except ValueError:
            is_valid = False

        if not is_valid:
            return jsonify({"error": "Parola curentă este incorectă!"}), 400
        
        try:
            hased = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            user.password_hash = hased.decode('utf-8')

            flag_modified(user, "password_hash")
            session.commit()
            return jsonify({"message": "Parolă actualizată cu succes!"})
        
        except Exception as e:
            session.rollback()
            return jsonify({"error": "Eroare la actualizarea parolei", "details": str(e)}), 500
        
@dashboard_bp.get("/user/preferences")
@require_auth
def get_preferences():
    with get_session() as session:
        user = session.get(User, g.user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "primary_domain": user.primary_domain,
            "secondary_domains": user.secondary_domains or []
        })