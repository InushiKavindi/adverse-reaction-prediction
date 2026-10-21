from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from pymongo.database import Database
from pymongo import ASCENDING

from backend.app.models.child import Child
from backend.app.interfaces.repositories import IChildRepository
from backend.app.mongodb import get_next_sequence_value

def doc_to_child(doc: dict) -> Child:
    """Helper to convert a MongoDB document into a domain Child model."""
    created = doc.get("created_at")
    if isinstance(created, datetime) and created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    updated = doc.get("updated_at")
    if isinstance(updated, datetime) and updated.tzinfo is None:
        updated = updated.replace(tzinfo=timezone.utc)

    child = Child(
        user_id=doc.get("user_id"),
        name=doc.get("name", ""),
        birth_date=doc.get("birth_date", ""),
        sex=doc.get("sex", "M"),
        age_months=float(doc.get("age_months", 0.0)),
        allergies=doc.get("allergies", "None reported"),
        current_illness=doc.get("current_illness", ""),
        current_medication=doc.get("current_medication", ""),
        blood_group=doc.get("blood_group", "O+"),
        pediatrician=doc.get("pediatrician", "Dr. K. Perera"),
        emergency_contact=doc.get("emergency_contact"),
        vaccine_records=doc.get("vaccine_records", {}),
        created_at=created or datetime.now(timezone.utc),
        updated_at=updated or datetime.now(timezone.utc)
    )
    child.id = doc.get("id")
    return child

class MongoChildRepository(IChildRepository):
    """
    MongoDB implementation of IChildRepository.
    Persists child profiles and vaccination records in MongoDB 'children' collection.
    """

    def __init__(self, db: Database):
        self.db = db
        self.collection = db["children"]

    def get_by_id(self, child_id: int) -> Optional[Child]:
        doc = self.collection.find_one({"id": child_id})
        return doc_to_child(doc) if doc else None

    def list_by_user(self, user_id: int) -> List[Child]:
        cursor = self.collection.find({"user_id": user_id}).sort("id", ASCENDING)
        return [doc_to_child(doc) for doc in cursor]

    def create(self, child: Child) -> Child:
        next_id = get_next_sequence_value(self.db, "children")
        child.id = next_id

        now = datetime.now(timezone.utc)
        if not getattr(child, "created_at", None):
            child.created_at = now
        child.updated_at = now

        doc = {
            "id": child.id,
            "user_id": child.user_id,
            "name": child.name,
            "birth_date": child.birth_date,
            "sex": child.sex,
            "age_months": child.age_months,
            "allergies": child.allergies,
            "current_illness": getattr(child, "current_illness", "") or "",
            "current_medication": getattr(child, "current_medication", "") or "",
            "blood_group": child.blood_group,
            "pediatrician": child.pediatrician,
            "emergency_contact": child.emergency_contact,
            "vaccine_records": child.vaccine_records or {},
            "created_at": child.created_at,
            "updated_at": child.updated_at
        }
        self.collection.insert_one(doc)
        return child

    def update(self, child: Child) -> Child:
        now = datetime.now(timezone.utc)
        child.updated_at = now
        update_data = {
            "name": child.name,
            "birth_date": child.birth_date,
            "sex": child.sex,
            "age_months": child.age_months,
            "allergies": child.allergies,
            "current_illness": getattr(child, "current_illness", "") if getattr(child, "current_illness", None) is not None else "",
            "current_medication": getattr(child, "current_medication", "") if getattr(child, "current_medication", None) is not None else "",
            "blood_group": child.blood_group,
            "pediatrician": child.pediatrician,
            "emergency_contact": child.emergency_contact,
            "vaccine_records": child.vaccine_records or {},
            "updated_at": child.updated_at
        }
        self.collection.update_one({"id": child.id}, {"$set": update_data})
        return child

    def update_vaccine_status(self, child_id: int, vax_id: str, status: str, date_completed: Optional[str] = None, reaction: Optional[Dict[str, Any]] = None) -> Optional[Child]:
        child = self.get_by_id(child_id)
        existing_rec = ((child.vaccine_records or {}) if child else {}).get(vax_id, {})
        existing_batch = (existing_rec.get("reaction") or {}).get("batchNumber") or existing_rec.get("batchNumber")

        key = f"vaccine_records.{vax_id}"
        update_doc = {
            f"{key}.status": status,
            f"{key}.dateCompleted": date_completed,
            "updated_at": datetime.now(timezone.utc)
        }
        if reaction is not None:
            if "batchNumber" not in reaction and existing_batch:
                reaction["batchNumber"] = existing_batch
            update_doc[f"{key}.reaction"] = reaction
            if "batchNumber" in reaction:
                update_doc[f"{key}.batchNumber"] = reaction["batchNumber"]
            if "scheduledDate" in reaction:
                update_doc[f"{key}.dueDate"] = reaction["scheduledDate"]
        elif existing_batch:
            update_doc[f"{key}.batchNumber"] = existing_batch

        self.collection.update_one({"id": child_id}, {"$set": update_doc})
        return self.get_by_id(child_id)

    def delete(self, child: Child) -> None:
        self.collection.delete_one({"id": child.id})
