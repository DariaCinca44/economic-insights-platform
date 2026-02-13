from flask import Blueprint, jsonify, request, g

from backend.app.core.config import DOMAIN_CONFIG
from backend.app.core.db import get_session
from backend.app.core.models import User
from backend.app.core.security import hash_password, verify_password, create_access_token, require_auth

auth_bp= Blueprint('auth', __name__)

@auth_bp.post('/signup')
def signup():
    data= request.get_json()
    email= data.get('email')
    password=data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    with get_session() as session:
        user_exists= session.query(User).filter_by(email=email).first()
        if user_exists:
            return jsonify({'error': 'Email deja existent!'}), 409

        new_user= User(email=email, password_hash= hash_password(password), selected_domain=None)

        session.add(new_user)
        session.commit()

    return jsonify({'message': 'User created'}), 201

@auth_bp.post('/login')
def login():
    data= request.get_json()
    user_email, password = data.get('email'), data.get('password')

    with get_session() as session:
        user= session.query(User).filter_by(email=user_email).first()
        if not user or not verify_password(password, user.password_hash):
            return jsonify({'error': 'Credentiale invalide!'}), 401

        token = create_access_token(user.id)
        return jsonify({
            'token': token,
            'user': {'email': user.email, 'domain': user.selected_domain}
        })

@auth_bp.post('/profile/update-domain')
@require_auth
def update_domain():
    data= request.get_json()
    new_domain= data.get('domain')

    with get_session() as session:
        user= session.get(User, g.user_id)
        if user and new_domain in DOMAIN_CONFIG:
            user.selected_domain = new_domain
            session.commit()
            return jsonify({'message': 'Domeniu actualizat!'}), 200
    return jsonify({'error': 'Eroare la actualizare'}), 400