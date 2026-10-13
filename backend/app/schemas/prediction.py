from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class PatientInput(BaseModel):
    patient_identifier: Optional[str] = Field(None, example="PAT-2026-001", description="Optional patient reference code or name")
    age_months: float = Field(..., ge=0, le=240, example=4.0, description="Age in months (0-240)")
    sex: str = Field(..., example="F", description="'F' or 'M'")
    vaccine_type: str = Field(..., example="Pentavalent2,OPV2,IPV", description="Vaccine name / combination administered")
    previous_reaction: str = Field(..., example="No", description="'Yes' or 'No'")
    allergy: str = Field(..., example="No", description="'Yes' or 'No'")
    current_illness: str = Field(..., example="No", description="'Yes' or 'No'")
    medication: str = Field(..., example="No", description="'Yes' or 'No'")
    notes: Optional[str] = Field(None, example="Routine 4-month vaccination visit.")

class SymptomPredictionItem(BaseModel):
    symptom: str
    display_name: str
    predicted: bool
    probability: float
    onset_hours: Optional[float] = None
    onset_description: Optional[str] = None

class PredictionResponse(BaseModel):
    id: Optional[int] = None
    patient_identifier: Optional[str] = None
    has_reaction: bool
    risk_level: str  # "Low", "Medium", "High"
    summary: str
    symptoms: List[SymptomPredictionItem]
    raw_probabilities: Dict[str, float]
    raw_onsets: Dict[str, float]
    created_at: Optional[datetime] = None

class PredictionRecordResponse(PredictionResponse):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    age_months: float
    sex: str
    vaccine_type: str
    previous_reaction: str
    allergy: str
    current_illness: str
    medication: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class MetadataOptionsResponse(BaseModel):
    sex_options: List[str]
    vaccine_type_options: List[str]
    binary_options: List[str]
    symptoms_list: List[str]
    onset_symptoms_list: List[str]
