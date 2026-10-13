from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    patient_identifier = Column(String(100), nullable=True, index=True)

    # Input patient clinical features
    age_months = Column(Float, nullable=False)
    sex = Column(String(10), nullable=False)
    vaccine_type = Column(String(100), nullable=False)
    previous_reaction = Column(String(10), nullable=False)
    allergy = Column(String(10), nullable=False)
    current_illness = Column(String(10), nullable=False)
    medication = Column(String(10), nullable=False)

    # Output predictions
    has_reaction = Column(Boolean, nullable=False)
    risk_level = Column(String(20), nullable=False)  # "Low", "Medium", "High"
    predicted_symptoms = Column(JSON, nullable=False)  # List of symptom names predicted positive
    probabilities = Column(JSON, nullable=False)       # Dict of symptom -> float probability
    onset_times = Column(JSON, nullable=False)         # Dict of symptom -> onset in hours
    summary = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship to user
    user = relationship("User", back_populates="predictions")

    def __repr__(self) -> str:
        return f"<PredictionRecord(id={self.id}, patient='{self.patient_identifier}', risk='{self.risk_level}')>"
