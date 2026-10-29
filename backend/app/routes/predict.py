from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from backend.app.models.user import User
from backend.app.schemas.prediction import (
    PatientInput,
    PredictionResponse,
    PredictionRecordResponse
)
from backend.app.interfaces.repositories import IPredictionRepository
from backend.app.services.ml_service import PredictionService
from backend.app.services.dependencies import (
    get_prediction_service,
    get_prediction_repository,
    get_current_user,
    get_optional_current_user,
    get_model_loader
)

router = APIRouter(prefix="/predict", tags=["Predictions"])

@router.post("", response_model=PredictionResponse)
def predict_reaction(
    patient: PatientInput,
    save_record: bool = True,
    include_explanation: bool = False,
    prediction_service: PredictionService = Depends(get_prediction_service),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Generate an adverse reaction prediction for a patient based on clinical features.
    
    If an authenticated user submits the request, the record is automatically saved
    to their clinical prediction history (unless save_record=False).
    
    Set include_explanation=true to generate a parent-friendly XAI explanation.
    """
    from backend.app.services.ml_service import default_model_loader
    user_id = current_user.id if current_user else None
    return prediction_service.predict_and_record(
        patient=patient,
        user_id=user_id,
        save_record=save_record,
        include_explanation=include_explanation,
        model_loader=default_model_loader if include_explanation else None,
    )

@router.get("/history", response_model=List[PredictionRecordResponse])
def get_prediction_history(
    skip: int = 0,
    limit: int = 50,
    prediction_repo: IPredictionRepository = Depends(get_prediction_repository),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve clinical prediction history. 
    Admins see all records; healthcare users see their own logged predictions.
    """
    user_filter = None if current_user.role == "admin" else current_user.id
    records = prediction_repo.list(user_id=user_filter, skip=skip, limit=limit)
    
    responses = []
    for r in records:
        items = []
        for s, prob in (r.probabilities or {}).items():
            is_pred = s in (r.predicted_symptoms or [])
            onset = (r.onset_times or {}).get(f"{s}_onset", None)
            items.append({
                "symptom": s,
                "display_name": s.capitalize(),
                "predicted": is_pred,
                "probability": prob,
                "onset_hours": onset
            })
            
        responses.append(
            PredictionRecordResponse(
                id=r.id,
                user_id=r.user_id,
                patient_identifier=r.patient_identifier,
                has_reaction=r.has_reaction,
                risk_level=r.risk_level,
                summary=r.summary or "",
                symptoms=items,
                raw_probabilities=r.probabilities or {},
                raw_onsets=r.onset_times or {},
                created_at=r.created_at,
                age_months=r.age_months,
                sex=r.sex,
                vaccine_type=r.vaccine_type,
                previous_reaction=r.previous_reaction,
                allergy=r.allergy,
                current_illness=r.current_illness,
                medication=r.medication,
                notes=r.notes
            )
        )
    return responses

@router.get("/{prediction_id}", response_model=PredictionRecordResponse)
def get_prediction_by_id(
    prediction_id: int,
    prediction_repo: IPredictionRepository = Depends(get_prediction_repository),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a specific prediction record by ID.
    """
    record = prediction_repo.get_by_id(prediction_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction record not found")

    if current_user.role != "admin" and record.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this record")

    items = []
    for s, prob in (record.probabilities or {}).items():
        is_pred = s in (record.predicted_symptoms or [])
        onset = (record.onset_times or {}).get(f"{s}_onset", None)
        items.append({
            "symptom": s,
            "display_name": s.capitalize(),
            "predicted": is_pred,
            "probability": prob,
            "onset_hours": onset
        })

    return PredictionRecordResponse(
        id=record.id,
        user_id=record.user_id,
        patient_identifier=record.patient_identifier,
        has_reaction=record.has_reaction,
        risk_level=record.risk_level,
        summary=record.summary or "",
        symptoms=items,
        raw_probabilities=record.probabilities or {},
        raw_onsets=record.onset_times or {},
        created_at=record.created_at,
        age_months=record.age_months,
        sex=record.sex,
        vaccine_type=record.vaccine_type,
        previous_reaction=record.previous_reaction,
        allergy=record.allergy,
        current_illness=record.current_illness,
        medication=record.medication,
        notes=record.notes
    )

@router.delete("/{prediction_id}", status_code=status.HTTP_200_OK)
def delete_prediction(
    prediction_id: int,
    prediction_repo: IPredictionRepository = Depends(get_prediction_repository),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a saved prediction record.
    """
    record = prediction_repo.get_by_id(prediction_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction record not found")

    if current_user.role != "admin" and record.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    prediction_repo.delete(record)
    return {"message": f"Prediction record #{prediction_id} deleted"}
