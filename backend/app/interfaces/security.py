from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from datetime import timedelta

class IPasswordHasher(ABC):
    """Interface for password hashing and verification (Single Responsibility & Interface Segregation)."""
    
    @abstractmethod
    def hash(self, plain_password: str) -> str:
        """Hash a plain text password."""
        pass

    @abstractmethod
    def verify(self, plain_password: str, hashed_password: str) -> bool:
        """Verify plain password against hashed password."""
        pass


class ITokenService(ABC):
    """Interface for token creation and validation."""
    
    @abstractmethod
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a signed access token."""
        pass

    @abstractmethod
    def decode_access_token(self, token: str) -> Dict[str, Any]:
        """Decode and validate an access token payload."""
        pass
