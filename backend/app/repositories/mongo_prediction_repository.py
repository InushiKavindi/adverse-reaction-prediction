from typing import Optional, List
from datetime import datetime, timezone
from pymongo.database import Database
from pymongo import DESCENDING

from backend.app.models.prediction import PredictionRecord
from backend.app.interfaces.repositories import IPredictionRepository
from backend.app.mongodb import get_next_sequence_value

def doc_to_prediction(doc: dict) -> PredictionRecord:
    """Helper to convert a MongoDB document into a domain PredictionRecord model."""
    created = doc.get("created_at")
    if isinstance(created, datetime) and created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)

    record = PredictionRecord(
        user_id=doc.get("user_id"),
        patient_identifier=doc.get("patient_identifier"),
        age_months=float(doc.get("age_months", 0.0)),
        sex=doc.get("sex", ""),
        vaccine_type=doc.get("vaccine_type", ""),
        previous_reaction=doc.get("previous_reaction", "No"),
        allergy=doc.get("allergy", "No"),
        current_illness=doc.get("current_illness", "No"),
        medication=doc.get("medication", "No"),
        has_reaction=bool(doc.get("has_reaction", False)),
        risk_level=doc.get("risk_level", "Low"),
        predicted_symptoms=doc.get("predicted_symptoms", []),
        probabilities=doc.get("probabilities", {}),
        onset_times=doc.get("onset_times", {}),
        summary=doc.get("summary", ""),
        notes=doc.get("notes"),
        created_at=created or datetime.now(timezone.utc)
    )
    record.id = doc.get("id")
    return record

class MongoPredictionRepository(IPredictionRepository):
    """
    MongoDB implementation of IPredictionRepository (SRP, LSP, DIP).
    Provides persistent prediction history storage on MongoDB collections.
    """

    def __init__(self, db: Database):
        self.db = db
        self.collection = db["predictions"]

    def get_by_id(self, prediction_id: int) -> Optional[PredictionRecord]:
        doc = self.collection.find_one({"id": prediction_id})
        return doc_to_prediction(doc) if doc else None

    def list(self, user_id: Optional[int] = None, skip: int = 0, limit: int = 50) -> List[PredictionRecord]:
        query = {}
        if user_id is not None:
            query["user_id"] = user_id

        cursor = self.collection.find(query).sort("created_at", DESCENDING).skip(skip).limit(limit)
        return [doc_to_prediction(doc) for doc in cursor]

    def create(self, record: PredictionRecord) -> PredictionRecord:
        next_id = get_next_sequence_value(self.db, "predictions")
        record.id = next_id
        
        now = datetime.now(timezone.utc)
        if not getattr(record, "created_at", None):
            record.created_at = now

        doc = {
            "id": record.id,
            "user_id": record.user_id,
            "patient_identifier": record.patient_identifier,
            "age_months": record.age_months,
            "sex": record.sex,
            "vaccine_type": record.vaccine_type,
            "previous_reaction": record.previous_reaction,
            "allergy": record.allergy,
            "current_illness": record.current_illness,
            "medication": record.medication,
            "has_reaction": record.has_reaction,
            "risk_level": record.risk_level,
            "predicted_symptoms": record.predicted_symptoms,
            "probabilities": record.probabilities,
            "onset_times": record.onset_times,
            "summary": record.summary,
            "notes": record.notes,
            "created_at": record.created_at
        }
        self.collection.insert_one(doc)
        return record

    def delete(self, record: PredictionRecord) -> None:
        self.collection.delete_one({"id": record.id})
