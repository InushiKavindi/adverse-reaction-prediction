from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Child(Base):
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    birth_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    sex = Column(String(10), nullable=False)         # M or F
    age_months = Column(Float, nullable=False, default=0.0)
    allergies = Column(String(255), default="None reported")
    blood_group = Column(String(10), default="O+")
    pediatrician = Column(String(100), default="Dr. K. Perera")
    emergency_contact = Column(String(50), nullable=True)
    vaccine_records = Column(JSON, default=dict)     # { vax_id: { status: "completed", dateCompleted: "..." } }
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="children")

    def __repr__(self) -> str:
        return f"<Child(id={self.id}, name='{self.name}', birth_date='{self.birth_date}')>"
