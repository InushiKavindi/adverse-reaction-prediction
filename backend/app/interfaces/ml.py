from abc import ABC, abstractmethod
from typing import Dict, List, Tuple, Any, Optional
import pandas as pd
import numpy as np
from backend.app.schemas.prediction import PatientInput, PredictionResponse

class IModelLoader(ABC):
    """Interface for loading machine learning models into memory."""

    @abstractmethod
    def load_models(self) -> Tuple[Any, Any]:
        """Returns (symptom_classification_model, onset_regression_model)."""
        pass

    @abstractmethod
    def is_ready(self) -> bool:
        """Returns True if models are loaded and ready for inference."""
        pass


class IInferenceEngine(ABC):
    """Interface for model inference calculation."""

    @abstractmethod
    def predict_symptoms(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Returns (binary_predictions, probability_scores)."""
        pass

    @abstractmethod
    def predict_onsets(self, df: pd.DataFrame) -> np.ndarray:
        """Returns continuous onset predictions matrix."""
        pass


class IRiskEvaluator(ABC):
    """
    Interface for evaluating clinical risk and summarizing reaction findings.
    Open for extension with new clinical evaluation strategies (Open/Closed Principle).
    """

    @abstractmethod
    def evaluate_risk(
        self, 
        active_symptoms: List[str], 
        probabilities: Dict[str, float]
    ) -> str:
        """Returns 'Low', 'Medium', or 'High'."""
        pass

    @abstractmethod
    def generate_summary(
        self,
        risk_level: str,
        active_symptoms: List[str],
        probabilities: Dict[str, float],
        onsets: Dict[str, float]
    ) -> str:
        """Generates clinical summary text."""
        pass


class IPredictionService(ABC):
    """Interface for high-level prediction execution and persistence coordination."""

    @abstractmethod
    def predict_and_record(
        self, 
        patient: PatientInput, 
        user_id: Optional[int] = None,
        save_record: bool = True
    ) -> PredictionResponse:
        pass
