import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

load_dotenv(dotenv_path="backend/.env")

_ENGINE= None
_SessionLocal= None

def get_engine():
    global _ENGINE, _SessionLocal
    if _ENGINE is None:
        db_url= os.getenv("DATABASE_URL")
        if not db_url:
            raise RuntimeError("DATABASE_URL is missing in .env")
        _ENGINE= create_engine(db_url, pool_pre_ping=True)
        _SessionLocal= sessionmaker(bind=_ENGINE, autoflush=False, autocommit= False, expire_on_commit=False)
    return _ENGINE

def get_session():
    global _SessionLocal
    if _SessionLocal is None:
        get_engine()
    return _SessionLocal()

def db_ping():
    engine= get_engine()
    with engine.connect() as conn:
        conn.execute(text("SELECT 1")).scalar()