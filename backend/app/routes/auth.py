from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from backend.app.models.user import User
from backend.app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from backend.app.services.user_service import UserService
from backend.app.services.auth_service import AuthService
from backend.app.services.dependencies import (
    get_user_service,
    get_auth_service,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserCreate, 
    user_service: UserService = Depends(get_user_service)
):
    """
    Register a new healthcare professional or user.
    """
    return user_service.register_user(user_in)

@router.post("/login", response_model=Token)
def login(
    login_data: UserLogin, 
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Authenticate with JSON credentials and receive a JWT Bearer token.
    """
    return auth_service.authenticate(login_data.username, login_data.password)

@router.post("/token", response_model=Token, include_in_schema=False)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    OAuth2 standard password request form endpoint for Swagger UI authorization.
    """
    return auth_service.authenticate(form_data.username, form_data.password)

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieve details of the currently authenticated user.
    """
    return current_user
