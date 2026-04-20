from flask import Blueprint, jsonify, request, g
from backend.app.core.config import DOMAIN_CONFIG
from backend.app.core.db import get_session
from backend.app.core.models import User
from backend.app.core.security import hash_password, verify_password, create_access_token, require_auth
import re

auth_bp = Blueprint('auth', __name__)


@auth_bp.post('/signup')
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    account_type = data.get('accountType', 'fizic')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    if not re.match(email_regex, email):
        return jsonify({'error': 'Te rugăm să introduci o adresă de email validă!'}), 400
    
    if len(password) < 8:
        return jsonify({'error': 'Parola trebuie sa aiba minim 8 caractere (o litera mare si o cifra)'}), 400
    
    if not re.search(r'[A-Z]', password):
        return jsonify({'error': 'Parola trebuie sa contina o litera mare!'}), 400
    
    if not re.search(r"\d", password):
        return jsonify({'error': 'Parola trebuie sa contina o cifra!'}), 400

    with get_session() as session:
        user_exists = session.query(User).filter_by(email=email).first()
        if user_exists:
            return jsonify({'error': 'Email deja existent!'}), 409

        new_user = User(email=email, password_hash=hash_password(password), account_type = account_type, primary_domain = None, secondary_domains= [], is_all_domains = False)

        session.add(new_user)
        session.commit()

    return jsonify({'message': 'User created'}), 201


@auth_bp.post('/login')
def login():
    data = request.get_json()
    user_email, password = data.get('email'), data.get('password')

    with get_session() as session:
        user = session.query(User).filter_by(email=user_email).first()
        if not user or not verify_password(password, user.password_hash):
            return jsonify({'error': 'Credentiale invalide!'}), 401

        token = create_access_token(user.id)
        return jsonify({
            'token': token,
            'user': {'email': user.email, 'domain': user.primary_domain, 'accountType': user.account_type, 'primaryDomain' : user.primary_domain, 'secondaryDomains': user.secondary_domains, 'isAllDomains': user.is_all_domains}
        })


@auth_bp.put('/profile')
@require_auth
def update_domain():
    data = request.get_json()
    primary_domain = data.get('primaryDomain')
    secondary_domains = data.get('secondaryDomains', [])
    is_all_domains = data.get('isAllDomains', False)

    with get_session() as session:
        user = session.get(User, g.user_id)
        if user:
            user.primary_domain = primary_domain
            user.secondary_domains = secondary_domains
            user.is_all_domains = is_all_domains
            session.commit()
            return jsonify({'message': 'Profil actualizat!'}), 200
    return jsonify({'error': 'Eroare la actualizare'}), 400
