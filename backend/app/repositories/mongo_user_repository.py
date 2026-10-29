from typing import Optional, List
from datetime import datetime, timezone
from pymongo.database import Database
from pymongo import ASCENDING

from backend.app.models.user import User
from backend.app.interfaces.repositories import IUserRepository
from backend.app.mongodb import get_next_sequence_value

def doc_to_user(doc: dict) -> User:
    """Helper to convert a MongoDB document into a domain User model."""
    created = doc.get("created_at")
    if isinstance(created, datetime) and created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    updated = doc.get("updated_at")
    if isinstance(updated, datetime) and updated.tzinfo is None:
        updated = updated.replace(tzinfo=timezone.utc)

    user = User(
        username=doc.get("username", ""),
        email=doc.get("email", ""),
        hashed_password=doc.get("hashed_password", ""),
        full_name=doc.get("full_name"),
        role=doc.get("role", "parent"),
        is_active=doc.get("is_active", True),
        created_at=created or datetime.now(timezone.utc),
        updated_at=updated or datetime.now(timezone.utc)
    )
    user.id = doc.get("id")
    return user

class MongoUserRepository(IUserRepository):
    """
    MongoDB implementation of IUserRepository (SRP, LSP, DIP).
    Provides persistent user management on MongoDB collections.
    """

    def __init__(self, db: Database):
        self.db = db
        self.collection = db["users"]

    def get_by_id(self, user_id: int) -> Optional[User]:
        doc = self.collection.find_one({"id": user_id})
        return doc_to_user(doc) if doc else None

    def get_by_username(self, username: str) -> Optional[User]:
        doc = self.collection.find_one({"username": username})
        return doc_to_user(doc) if doc else None

    def get_by_email(self, email: str) -> Optional[User]:
        doc = self.collection.find_one({"email": email})
        return doc_to_user(doc) if doc else None

    def count(self) -> int:
        return self.collection.count_documents({})

    def list(self, skip: int = 0, limit: int = 50) -> List[User]:
        cursor = self.collection.find().sort("id", ASCENDING).skip(skip).limit(limit)
        return [doc_to_user(doc) for doc in cursor]

    def create(self, user: User) -> User:
        next_id = get_next_sequence_value(self.db, "users")
        user.id = next_id
        
        now = datetime.now(timezone.utc)
        if not getattr(user, "created_at", None):
            user.created_at = now
        user.updated_at = now

        doc = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "hashed_password": user.hashed_password,
            "full_name": user.full_name,
            "role": user.role.value if hasattr(user.role, "value") else str(user.role),
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
        self.collection.insert_one(doc)
        return user

    def update(self, user: User) -> User:
        now = datetime.now(timezone.utc)
        user.updated_at = now
        update_data = {
            "username": user.username,
            "email": user.email,
            "hashed_password": user.hashed_password,
            "full_name": user.full_name,
            "role": user.role.value if hasattr(user.role, "value") else str(user.role),
            "is_active": user.is_active,
            "updated_at": user.updated_at
        }
        self.collection.update_one({"id": user.id}, {"$set": update_data})
        return user

    def delete(self, user: User) -> None:
        self.collection.delete_one({"id": user.id})
        # Disassociate or cascade delete associated predictions
        self.db["predictions"].delete_many({"user_id": user.id})
