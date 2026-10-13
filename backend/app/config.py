import os
from pathlib import Path
from typing import List

# Root of the whole adverse-reaction-prediction project
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

class Settings:
    PROJECT_NAME: str = "Adverse Reaction Prediction API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Security & JWT settings
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "adverse-reaction-secret-key-super-secure-production-ready-2026-xyz"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{PROJECT_ROOT / 'data' / 'adverse_reactions.db'}"
    )
    
    # Machine Learning Models
    PRIMARY_SYMPTOM_MODEL_PATH: Path = PROJECT_ROOT / "models" / "catboost_symptom_model.joblib"
    FALLBACK_SYMPTOM_MODEL_PATH: Path = PROJECT_ROOT / "models" / "hybrid_stacking_model.joblib"
    ONSET_MODEL_PATH: Path = PROJECT_ROOT / "models" / "hybrid_onset_model.joblib"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

settings = Settings()
