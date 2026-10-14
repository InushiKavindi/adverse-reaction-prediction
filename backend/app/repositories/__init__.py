from backend.app.repositories.user_repository import SQLAlchemyUserRepository
from backend.app.repositories.prediction_repository import SQLAlchemyPredictionRepository
from backend.app.repositories.mongo_user_repository import MongoUserRepository
from backend.app.repositories.mongo_prediction_repository import MongoPredictionRepository

__all__ = [
    "SQLAlchemyUserRepository",
    "SQLAlchemyPredictionRepository",
    "MongoUserRepository",
    "MongoPredictionRepository"
]
