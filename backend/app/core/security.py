import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, abort, g

load_dotenv()
pwd_context= CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY= os.getenv("SECRET_KEY")
ALGORITHM= os.getenv("JWT_ALGORITHM", "HS256")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not set in .env")

def hash_password(password: str) ->str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def create_access_token(user_id: int) -> str:
    payload= {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header= request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            abort(401, description= 'Token invalid')

        token= auth_header.replace('Bearer ', '')

        try:
            payload= jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            g.user_id = int(payload['sub'])
        except(JWTError, KeyError, ValueError):
            abort(401, description= 'Token expirat')
        return f(*args, **kwargs)
    return wrapper