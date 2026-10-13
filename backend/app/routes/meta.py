from fastapi import APIRouter
from datetime import datetime, timezone

from backend.app.config import settings
from backend.app.schemas.prediction import MetadataOptionsResponse
from backend.app.services.ml_service import ml_service
from src.preprocessor import TARGET_COLS, ONSET_COLS

router = APIRouter(tags=["Metadata & System"])

@router.get("/health")
def health_check():
    """
    Service health check and model loading status.
    """
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "models_loaded": ml_service.is_ready(),
        "primary_symptom_model": str(settings.PRIMARY_SYMPTOM_MODEL_PATH.name),
        "onset_model": str(settings.ONSET_MODEL_PATH.name),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/metadata/options", response_model=MetadataOptionsResponse)
def get_metadata_options():
    """
    Get allowed values and options for form inputs and dropdowns.
    """
    return MetadataOptionsResponse(
        sex_options=["F", "M"],
        vaccine_type_options=[
            "BCG1",
            "BCG2",
            "DPT,OPV4",
            "DT,OPV5",
            "JE",
            "MMR1",
            "MMR2",
            "Pentavalent1,OPV1",
            "Pentavalent2,OPV2,IPV",
            "Pentavalent3,OPV3"
        ],
        binary_options=["No", "Yes"],
        symptoms_list=TARGET_COLS,
        onset_symptoms_list=ONSET_COLS
    )
