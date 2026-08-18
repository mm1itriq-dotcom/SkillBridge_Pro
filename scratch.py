from db import engine, metadata
import models # Ensure all tables are registered to metadata

print("Dropping old tables...")
metadata.drop_all(engine)
print("Creating new tables with UUID schema...")
metadata.create_all(engine)
print("Database schema successfully synced!")
