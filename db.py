from sqlalchemy import create_engine, MetaData

DATABASE_URL = "postgresql://postgres:123456@localhost/skillbridge"

engine = create_engine(DATABASE_URL, echo=True)
metadata = MetaData()
