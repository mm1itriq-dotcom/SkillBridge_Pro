import os
from sqlalchemy import create_engine, MetaData
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:YOUR_PASSWORD@localhost/skillbridge")

engine = create_engine(DATABASE_URL, echo=True)
metadata = MetaData()
