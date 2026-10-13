from abc import ABC, abstractmethod
from typing import Optional, List
from backend.app.models.user import User
from backend.app.models.prediction import PredictionRecord

class IUserRepository(ABC):
    """Interface for User persistence operations."""

    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[User]:
        pass

    @abstractmethod
    def get_by_username(self, username: str) -> Optional[User]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    def count(self) -> int:
        pass

    @abstractmethod
    def list(self, skip: int = 0, limit: int = 50) -> List[User]:
        pass

    @abstractmethod
    def create(self, user: User) -> User:
        pass

    @abstractmethod
    def update(self, user: User) -> User:
        pass

    @abstractmethod
    def delete(self, user: User) -> None:
        pass


class IPredictionRepository(ABC):
    """Interface for PredictionRecord persistence operations."""

    @abstractmethod
    def get_by_id(self, prediction_id: int) -> Optional[PredictionRecord]:
        pass

    @abstractmethod
    def list(self, user_id: Optional[int] = None, skip: int = 0, limit: int = 50) -> List[PredictionRecord]:
        pass

    @abstractmethod
    def create(self, record: PredictionRecord) -> PredictionRecord:
        pass

    @abstractmethod
    def delete(self, record: PredictionRecord) -> None:
        pass
