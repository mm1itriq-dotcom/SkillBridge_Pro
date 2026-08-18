from db import engine, metadata
import models  

def init_db():
    """Creates all tables in the database."""
    metadata.create_all(engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
