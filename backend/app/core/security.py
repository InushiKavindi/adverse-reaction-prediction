import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException, status

from backend.app.config import settings
from backend.app.interfaces.security import IPasswordHasher, ITokenService

class BcryptPasswordHasher(IPasswordHasher):
    """Concrete password hasher using Bcrypt algorithm (SRP & LSP)."""

    def __init__(self, rounds: int = 12):
        self.rounds = rounds

    def hash(self, plain_password: str) -> str:
        salt = bcrypt.gensalt(rounds=self.rounds)
        return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")

    def verify(self, plain_password: str, hashed_password: str) -> bool:
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            return False


class JwtTokenService(ITokenService):
    """Concrete JWT token service using PyJWT (SRP & LSP)."""

    def __init__(
        self, 
        secret_key: str = settings.SECRET_KEY, 
        algorithm: str = settings.ALGORITHM, 
        default_expire_minutes: int = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    ):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.default_expire_minutes = default_expire_minutes

    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=self.default_expire_minutes)
        
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    def decode_access_token(self, token: str) -> Dict[str, Any]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.PyJWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            ) from e
