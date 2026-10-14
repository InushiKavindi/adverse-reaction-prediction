import os
from pathlib import Path
from typing import List, Optional
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Root of the whole adverse-reaction-prediction project
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# Load environment variables:
# Prioritize root .env so user edits in the workspace root take immediate effect,
# and fallback to backend/.env if root .env does not specify a variable.
if (PROJECT_ROOT / ".env").exists():
    load_dotenv(PROJECT_ROOT / ".env", override=True)
if (PROJECT_ROOT / "backend" / ".env").exists():
    load_dotenv(PROJECT_ROOT / "backend" / ".env", override=False)

class Settings:
    PROJECT_NAME: str = "Adverse Reaction Prediction API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Security & JWT settings
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "adverse-reaction-secret-key-super-secure-production-ready-2026-xyz"
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))  # 24 hours
    
    # Database Settings
    @property
    def DB_TYPE(self) -> str:
        return os.getenv("DB_TYPE", "mongodb").lower()

    @property
    def MONGODB_URI(self) -> str:
        return os.getenv(
            "MONGODB_URI",
            "mongodb+srv://pdikavindi_db_user:<db_password>@cluster0.krivlpg.mongodb.net/?appName=Cluster0"
        )

    @property
    def MONGODB_DB_NAME(self) -> str:
        return os.getenv("MONGODB_DB_NAME", "adverse_reaction_prediction")

    @property
    def MONGODB_PASSWORD(self) -> Optional[str]:
        return os.getenv("MONGODB_PASSWORD", None)

    # SQLite Database (fallback when DB_TYPE=sqlite)
    @property
    def DATABASE_URL(self) -> str:
        return os.getenv(
            "DATABASE_URL", 
            f"sqlite:///{PROJECT_ROOT / 'data' / 'adverse_reactions.db'}"
        )

    def get_effective_mongodb_uri(self) -> str:
        """Returns MONGODB_URI with URL-encoded password substituted if MONGODB_PASSWORD is set."""
        uri = self.MONGODB_URI
        if self.MONGODB_PASSWORD and "<db_password>" in uri:
            encoded_pwd = quote_plus(self.MONGODB_PASSWORD)
            uri = uri.replace("<db_password>", encoded_pwd)
        return uri
    
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

