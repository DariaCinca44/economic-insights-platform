import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv(dotenv_path="backend/.env")

def get_engine():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError("DATABASE_URL is missing. Create backend/.env")
    return create_engine(db_url, pool_pre_ping=True)

def db_ping():
    engine = get_engine()
    db_url= os.getenv("DATABASE_URL")
    print("DB_URL:", db_url)
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))

