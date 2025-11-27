
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Load env vars explicitly from .env file in the same directory
load_dotenv()

uri = os.getenv('MONGODB_URI')
print(f"Testing connection to: {uri}")

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("✓ Connection successful!")
    
    db_name = os.getenv('MONGODB_DB_NAME', 'test_db')
    db = client[db_name]
    print(f"✓ Database '{db_name}' is accessible.")
    
    # List collections to verify read access
    print("Collections:", db.list_collection_names())
    
except ConnectionFailure as e:
    print("✗ Connection failed")
    print(e)
except Exception as e:
    print("✗ An error occurred")
    print(e)
