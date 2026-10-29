from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date

def calculate_age_in_months(birth_date_str: str) -> float:
    """Accurately calculates age in months from DOB string."""
    try:
        dob = None
        for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d"):
            try:
                dob = datetime.strptime(birth_date_str.strip(), fmt).date()
                break
            except Exception:
                pass
        if not dob:
            return 0.0
        today = date.today()
        months = (today.year - dob.year) * 12 + (today.month - dob.month)
        if today.day < dob.day:
            months -= 1
        return max(0.0, float(months))
    except Exception:
        return 0.0

class ChildCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, example="Child Ben")
    birth_date: str = Field(..., example="2024-04-14")
    sex: str = Field(..., example="M")
    allergies: Optional[str] = Field("None reported", example="None reported")
    current_illness: Optional[str] = Field("", example="None")
    current_medication: Optional[str] = Field("", example="None")
    age_months: Optional[float] = None
    blood_group: Optional[str] = "O+"
    pediatrician: Optional[str] = "Dr. K. Perera"
    emergency_contact: Optional[str] = None

class ChildUpdate(BaseModel):
    name: Optional[str] = None
    birth_date: Optional[str] = None
    sex: Optional[str] = None
    age_months: Optional[float] = None
    allergies: Optional[str] = None
    current_illness: Optional[str] = None
    current_medication: Optional[str] = None
    blood_group: Optional[str] = None
    pediatrician: Optional[str] = None
    emergency_contact: Optional[str] = None

class ChildResponse(BaseModel):
    id: int
    user_id: int
    name: str
    birth_date: str
    sex: str
    age_months: float
    allergies: str
    current_illness: Optional[str] = ""
    current_medication: Optional[str] = ""
    blood_group: Optional[str] = "O+"
    pediatrician: Optional[str] = None
    emergency_contact: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class VaccineScheduleItem(BaseModel):
    id: str
    milestone: str
    ageRange: str
    targetAgeMonths: float
    vaccineName: str
    route: str
    diseases: str
    status: str  # "completed" | "due" | "upcoming"
    dueDate: str
    scheduledDateDob: Optional[str] = None
    customScheduledDate: Optional[str] = None
    dateCompleted: Optional[str] = None
    expectedReactions: str
    severityLevel: str
    batchNumber: str
    dosage: Optional[str] = None
    isClickable: bool = False
    reaction: Optional[Dict[str, Any]] = None
    vaccines: Optional[List[Dict[str, Any]]] = None

class VaccineStatusUpdate(BaseModel):
    status: str = Field(..., example="completed")  # "completed" | "due" | "upcoming"
    date_completed: Optional[str] = None
    reaction: Optional[Dict[str, Any]] = None

