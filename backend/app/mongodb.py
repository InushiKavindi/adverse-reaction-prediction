import logging
from typing import Optional
from pymongo import MongoClient, ASCENDING, DESCENDING, ReturnDocument
from pymongo.database import Database
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError, OperationFailure

from backend.app.config import settings

logger = logging.getLogger("backend.mongodb")

_mongo_client: Optional[MongoClient] = None
_mongo_db: Optional[Database] = None

def get_mongo_client() -> MongoClient:
    """
    Returns the singleton MongoClient instance, creating and configuring it if necessary.
    Uses connection pooling and a reasonable server selection timeout.
    """
    global _mongo_client
    if _mongo_client is None:
        effective_uri = settings.get_effective_mongodb_uri()
        _mongo_client = MongoClient(
            effective_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            retryWrites=True,
            appname="Cluster0"
        )
    return _mongo_client

def get_mongo_db() -> Database:
    """
    Returns the target MongoDB database instance.
    """
    global _mongo_db
    if _mongo_db is None:
        client = get_mongo_client()
        db_name = settings.MONGODB_DB_NAME or "adverse_reaction_prediction"
        _mongo_db = client[db_name]
    return _mongo_db

def set_mongo_db(db: Database) -> None:
    """
    Allows injecting a database instance (useful for testing or mongomock).
    """
    global _mongo_db
    _mongo_db = db

def close_mongo_client() -> None:
    """
    Closes the MongoDB connection client cleanly.
    """
    global _mongo_client, _mongo_db
    if _mongo_client is not None:
        try:
            _mongo_client.close()
            logger.info("[MongoDB] Connection client successfully closed.")
        except Exception as e:
            logger.warning(f"[MongoDB] Error while closing client: {e}")
        finally:
            _mongo_client = None
            _mongo_db = None

def get_next_sequence_value(db: Database, sequence_name: str) -> int:
    """
    Atomically increments and returns the next integer sequence value from the counters collection.
    Guarantees incremental integer IDs (1, 2, 3...) compatible with client schemas.
    """
    counters = db["counters"]
    counter = counters.find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    return counter["seq"]

def init_mongo_db() -> bool:
    """
    Initializes MongoDB collections, indexes, and verifies connectivity.
    Handles configuration errors gracefully with helpful messages.
    """
    uri = settings.get_effective_mongodb_uri()
    
    # 1. Check for unreplaced password placeholder
    if "<db_password>" in uri:
        msg = (
            "\n" + "=" * 70 + "\n"
            "[MongoDB] [NOTICE] '<db_password>' placeholder detected in MONGODB_URI.\n"
            "Please open your .env file and replace '<db_password>' with your\n"
            "actual MongoDB Atlas user password.\n"
            "Example in .env:\n"
            "  MONGODB_URI=mongodb+srv://pdikavindi_db_user:YourPass@cluster0.krivlpg.mongodb.net/?appName=Cluster0\n"
            + "=" * 70
        )
        print(msg)
        logger.warning(msg)
        return False

    # 2. Test ping & create indexes
    try:
        client = get_mongo_client()
        db = get_mongo_db()

        # Ping the cluster to ensure credentials and connectivity are valid
        client.admin.command("ping")
        print(f"[{settings.PROJECT_NAME}] Successfully connected to MongoDB Atlas database: '{db.name}'")

        # Configure users collection indexes
        users = db["users"]
        users.create_index([("id", ASCENDING)], unique=True)
        users.create_index([("username", ASCENDING)], unique=True)
        users.create_index([("email", ASCENDING)], unique=True)

        # Configure predictions collection indexes
        predictions = db["predictions"]
        predictions.create_index([("id", ASCENDING)], unique=True)
        predictions.create_index([("user_id", ASCENDING)])
        predictions.create_index([("patient_identifier", ASCENDING)])
        predictions.create_index([("created_at", DESCENDING)])

        # Note: 'counters' collection uses default automatic unique index on '_id'

        print(f"[{settings.PROJECT_NAME}] MongoDB collections and indexes verified.")
        return True

    except OperationFailure as op_err:
        err_msg = str(op_err.details if hasattr(op_err, 'details') else op_err)
        print(f"[{settings.PROJECT_NAME}] [ERROR] MongoDB Operation Error: {err_msg}")
        return False
    except ServerSelectionTimeoutError as timeout_err:
        print(f"[{settings.PROJECT_NAME}] [ERROR] MongoDB Server Connection Timeout: {timeout_err}")
        print("Please verify your internet connection and MongoDB Atlas IP Access List.")
        return False
    except PyMongoError as pe:
        print(f"[{settings.PROJECT_NAME}] [ERROR] MongoDB Error: {pe}")
        return False
