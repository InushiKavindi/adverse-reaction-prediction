from typing import Optional
from fastapi import HTTPException, status
from backend.app.models.user import User
from backend.app.schemas.user import Token, UserResponse
from backend.app.interfaces.repositories import IUserRepository
from backend.app.interfaces.security import IPasswordHasher, ITokenService

class AuthService:
    """
    Authentication domain service.
    Adheres to Single Responsibility Principle (SRP) and Dependency Inversion Principle (DIP).
    """

    def __init__(
        self,
        user_repo: IUserRepository,
        password_hasher: IPasswordHasher,
        token_service: ITokenService
    ):
        self.user_repo = user_repo
        self.password_hasher = password_hasher
        self.token_service = token_service

    def authenticate(self, username: str, plain_password: str) -> Token:
        user = None
        if "@" in username:
            user = self.user_repo.get_by_email(username)
        if not user:
            user = self.user_repo.get_by_username(username)
        if not user:
            user = self.user_repo.get_by_email(username)

        if not user or not self.password_hasher.verify(plain_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )

        token_str = self.token_service.create_access_token(
            data={"sub": user.username, "role": user.role, "user_id": user.id}
        )

        return Token(
            access_token=token_str,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    def get_user_from_token(self, token: str) -> User:
        payload = self.token_service.decode_access_token(token)
        username: Optional[str] = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = self.user_repo.get_by_username(username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user account"
            )
        return user
