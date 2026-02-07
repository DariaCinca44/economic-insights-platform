from backend.app.db import get_engine
from backend.app.models import Base

def main():
    engine = get_engine()
    Base.metadata.create_all(engine)
    print("DB created")

if __name__ == "__main__":
    main()