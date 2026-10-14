from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.models.child import Child
from backend.app.interfaces.repositories import IChildRepository

class SQLAlchemyChildRepository(IChildRepository):
    """SQLAlchemy implementation of IChildRepository for SQLite / RDBMS."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, child_id: int) -> Optional[Child]:
        return self.db.query(Child).filter(Child.id == child_id).first()

    def list_by_user(self, user_id: int) -> List[Child]:
        return self.db.query(Child).filter(Child.user_id == user_id).order_by(Child.id.asc()).all()

    def create(self, child: Child) -> Child:
        self.db.add(child)
        self.db.commit()
        self.db.refresh(child)
        return child

    def update(self, child: Child) -> Child:
        child.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(child)
        return child

    def update_vaccine_status(self, child_id: int, vax_id: str, status: str, date_completed: Optional[str] = None, reaction: Optional[Dict[str, Any]] = None) -> Optional[Child]:
        child = self.get_by_id(child_id)
        if not child:
            return None
        records = dict(child.vaccine_records or {})
        rec = {
            "status": status,
            "dateCompleted": date_completed
        }
        if reaction is not None:
            rec["reaction"] = reaction
        records[vax_id] = rec
        child.vaccine_records = records
        child.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(child)
        return child

    def delete(self, child: Child) -> None:
        self.db.delete(child)
        self.db.commit()
