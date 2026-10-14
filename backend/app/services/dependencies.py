from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.mongodb import get_mongo_db
from backend.app.models.user import User

# Interfaces & Core
from backend.app.interfaces.security import IPasswordHasher, ITokenService
from backend.app.interfaces.repositories import IUserRepository, IPredictionRepository
from backend.app.core.security import BcryptPasswordHasher, JwtTokenService
from backend.app.repositories.user_repository import SQLAlchemyUserRepository
from backend.app.repositories.prediction_repository import SQLAlchemyPredictionRepository
from backend.app.repositories.mongo_user_repository import MongoUserRepository
from backend.app.repositories.mongo_prediction_repository import MongoPredictionRepository

# Domain Services
from backend.app.services.user_service import UserService
from backend.app.services.auth_service import AuthService
from backend.app.services.ml_service import (
    PredictionService,
    default_inference_engine,
    default_risk_evaluator
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/token", 
    auto_error=False
)

# Shared Singletons for stateless security services
_password_hasher = BcryptPasswordHasher()
_token_service = JwtTokenService()

def get_password_hasher() -> IPasswordHasher:
    return _password_hasher

def get_token_service() -> ITokenService:
    return _token_service

def get_user_repository(db: Optional[Session] = Depends(get_db)) -> IUserRepository:
    if settings.DB_TYPE == "mongodb":
        return MongoUserRepository(get_mongo_db())
    if db is None:
        from backend.app.database import SessionLocal
        db = SessionLocal()
    return SQLAlchemyUserRepository(db)

def get_prediction_repository(db: Optional[Session] = Depends(get_db)) -> IPredictionRepository:
    if settings.DB_TYPE == "mongodb":
        return MongoPredictionRepository(get_mongo_db())
    if db is None:
        from backend.app.database import SessionLocal
        db = SessionLocal()
    return SQLAlchemyPredictionRepository(db)

def get_user_service(
    repo: IUserRepository = Depends(get_user_repository),
    hasher: IPasswordHasher = Depends(get_password_hasher)
) -> UserService:
    return UserService(user_repo=repo, password_hasher=hasher)

def get_auth_service(
    repo: IUserRepository = Depends(get_user_repository),
    hasher: IPasswordHasher = Depends(get_password_hasher),
    token_service: ITokenService = Depends(get_token_service)
) -> AuthService:
    return AuthService(user_repo=repo, password_hasher=hasher, token_service=token_service)

def get_prediction_service(
    repo: IPredictionRepository = Depends(get_prediction_repository)
) -> PredictionService:
    return PredictionService(
        inference_engine=default_inference_engine,
        risk_evaluator=default_risk_evaluator,
        prediction_repo=repo
    )

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service)
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_service.get_user_from_token(token)

def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service)
) -> Optional[User]:
    if not token:
        return None
    try:
        return auth_service.get_user_from_token(token)
    except Exception:
        return None

def get_current_active_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required"
        )
    return current_user
