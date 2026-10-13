from typing import Optional, List
from sqlalchemy.orm import Session
from backend.app.models.prediction import PredictionRecord
from backend.app.interfaces.repositories import IPredictionRepository

class SQLAlchemyPredictionRepository(IPredictionRepository):
    """SQLAlchemy implementation of IPredictionRepository (SRP, LSP, DIP)."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, prediction_id: int) -> Optional[PredictionRecord]:
        return self.db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()

    def list(self, user_id: Optional[int] = None, skip: int = 0, limit: int = 50) -> List[PredictionRecord]:
        query = self.db.query(PredictionRecord)
        if user_id is not None:
            query = query.filter(PredictionRecord.user_id == user_id)
        return query.order_by(PredictionRecord.created_at.desc()).offset(skip).limit(limit).all()

    def create(self, record: PredictionRecord) -> PredictionRecord:
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def delete(self, record: PredictionRecord) -> None:
        self.db.delete(record)
        self.db.commit()
