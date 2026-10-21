import os
import sys
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import joblib
import numpy as np
import pandas as pd

from backend.app.config import settings, PROJECT_ROOT
from backend.app.interfaces.ml import (
    IModelLoader,
    IInferenceEngine,
    IRiskEvaluator,
    IPredictionService
)
from backend.app.interfaces.repositories import IPredictionRepository
from backend.app.schemas.prediction import (
    PatientInput,
    PredictionResponse,
    SymptomPredictionItem
)
from backend.app.models.prediction import PredictionRecord
from backend.app.services.risk_evaluator import StandardClinicalRiskEvaluator, SYMPTOM_DISPLAY_NAMES

# Ensure root and src are on sys.path
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(PROJECT_ROOT / "src") not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT / "src"))

try:
    import src.symptom_model as symptom_model_mod
    sys.modules["symptom_model"] = symptom_model_mod
except ImportError:
    pass

from src.preprocessor import TARGET_COLS, ONSET_COLS
from src.symptom_model import predict as predict_symptoms, predict_proba
from src.onset_model import predict_onset

class JoblibModelLoader(IModelLoader):
    """
    Model loader responsible exclusively for loading and caching models from disk (SRP).
    """

    def __init__(
        self, 
        primary_symptom_path: Path = settings.PRIMARY_SYMPTOM_MODEL_PATH,
        fallback_symptom_path: Path = settings.FALLBACK_SYMPTOM_MODEL_PATH,
        onset_path: Path = settings.ONSET_MODEL_PATH
    ):
        self.primary_symptom_path = primary_symptom_path
        self.fallback_symptom_path = fallback_symptom_path
        self.onset_path = onset_path
        self._symptom_model = None
        self._onset_model = None

    def load_models(self) -> Tuple[Any, Any]:
        if self._symptom_model is None:
            if self.primary_symptom_path.exists():
                self._symptom_model = joblib.load(self.primary_symptom_path)
            elif self.fallback_symptom_path.exists():
                self._symptom_model = joblib.load(self.fallback_symptom_path)
            else:
                raise FileNotFoundError(f"No symptom model found at {self.primary_symptom_path}")

        if self._onset_model is None:
            if self.onset_path.exists():
                self._onset_model = joblib.load(self.onset_path)
            else:
                raise FileNotFoundError(f"No onset model found at {self.onset_path}")

        return self._symptom_model, self._onset_model

    def get_raw_models(self) -> Tuple[Any, Any]:
        """Return the loaded model objects for XAI inspection."""
        return self.load_models()

    def is_ready(self) -> bool:
        try:
            m1, m2 = self.load_models()
            return m1 is not None and m2 is not None
        except Exception:
            return False


class TrainedModelInferenceEngine(IInferenceEngine):
    """
    Inference engine responsible exclusively for executing mathematical model inference (SRP, LSP).
    """

    def __init__(self, model_loader: IModelLoader):
        self.model_loader = model_loader

    def predict_symptoms(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        symptom_model, _ = self.model_loader.load_models()
        y_pred_binary = predict_symptoms(symptom_model, df)[0]
        y_pred_proba = predict_proba(symptom_model, df)[0]
        return y_pred_binary, y_pred_proba

    def predict_onsets(self, df: pd.DataFrame) -> np.ndarray:
        _, onset_model = self.model_loader.load_models()
        y_pred_onset = predict_onset(onset_model, df, target_columns=ONSET_COLS)[0]
        return y_pred_onset


def normalize_binary(val: Any) -> str:
    s = str(val or "").strip().lower()
    if s in ["", "no", "none", "none reported", "nil", "false", "0", "n/a", "no allergies", "negative"]:
        return "No"
    return "Yes"

def normalize_vaccine_type(val: Any) -> str:
    s = str(val or "").strip()
    known = [
        "BCG1", "BCG2", "Pentavalent1,OPV1", "Pentavalent2,OPV2,IPV",
        "Pentavalent3,OPV3", "MMR1", "JE", "DPT,OPV4", "DT,OPV5", "MMR2"
    ]
    if s in known:
        return s
    low = s.lower()
    if "bcg" in low:
        return "BCG2" if "2" in low else "BCG1"
    if "pentavalent" in low or "penta" in low:
        if "3" in low:
            return "Pentavalent3,OPV3"
        if "2" in low:
            return "Pentavalent2,OPV2,IPV"
        return "Pentavalent1,OPV1"
    if "mmr" in low:
        return "MMR2" if "2" in low else "MMR1"
    if "je" in low:
        return "JE"
    if "dpt" in low:
        return "DPT,OPV4"
    if "dt" in low:
        return "DT,OPV5"
    return s

class PredictionService(IPredictionService):
    """
    High-level prediction service orchestrating inference, risk assessment, and persistence.
    Adheres to DIP (depends on abstractions), SRP (orchestration only), and OCP (swappable evaluators).
    """

    def __init__(
        self,
        inference_engine: IInferenceEngine,
        risk_evaluator: IRiskEvaluator,
        prediction_repo: Optional[IPredictionRepository] = None
    ):
        self.inference_engine = inference_engine
        self.risk_evaluator = risk_evaluator
        self.prediction_repo = prediction_repo

    def predict_and_record(
        self, 
        patient: PatientInput, 
        user_id: Optional[int] = None,
        save_record: bool = True,
        include_explanation: bool = False,
        model_loader: Optional[IModelLoader] = None,
    ) -> PredictionResponse:
        # 1. Format input DataFrame with clinical normalization
        vax_type = normalize_vaccine_type(patient.vaccine_type)
        prev_rxn = normalize_binary(patient.previous_reaction)
        allergy_val = normalize_binary(patient.allergy)
        illness_val = normalize_binary(patient.current_illness)
        med_val = normalize_binary(patient.medication)
        sex_val = "M" if str(patient.sex).strip().upper().startswith("M") else "F"

        input_dict = {
            "age_months": float(patient.age_months),
            "sex": sex_val,
            "vaccine_type": vax_type,
            "previous_reaction": prev_rxn,
            "allergy": allergy_val,
            "current_illness": illness_val,
            "medication": med_val,
        }
        df_input = pd.DataFrame([input_dict])

        # 2. Run model predictions via InferenceEngine
        y_pred_binary, y_pred_proba = self.inference_engine.predict_symptoms(df_input)
        y_pred_onset = self.inference_engine.predict_onsets(df_input)

        # 3. Format scores
        probabilities_dict: Dict[str, float] = {}
        for idx, col in enumerate(TARGET_COLS):
            val = float(y_pred_proba[idx]) if idx < len(y_pred_proba) else 0.0
            # Cap probability at 0.92 so no probability ever reaches 100%
            probabilities_dict[col] = round(max(0.0, min(0.92, val)), 4)

        onset_dict: Dict[str, float] = {}
        for idx, col in enumerate(ONSET_COLS):
            val = float(y_pred_onset[idx]) if idx < len(y_pred_onset) else 0.0
            onset_dict[col] = round(max(0.0, val), 2)

        items: List[SymptomPredictionItem] = []
        active_positive_symptoms: List[str] = []

        for idx, col in enumerate(TARGET_COLS):
            is_pred_positive = bool(y_pred_binary[idx] == 1)
            prob = probabilities_dict.get(col, 0.0)
            onset_col = f"{col}_onset"
            onset_val = onset_dict.get(onset_col, None)

            onset_desc = None
            if onset_val is not None and col != "no_reaction":
                if onset_val < 24:
                    onset_desc = f"~{onset_val:.1f} hours post-vaccination"
                else:
                    days = onset_val / 24.0
                    onset_desc = f"~{onset_val:.1f} hours (~{days:.1f} days) post-vaccination"

            display_name = SYMPTOM_DISPLAY_NAMES.get(col, col.capitalize())
            if col != "no_reaction" and is_pred_positive:
                active_positive_symptoms.append(col)

            items.append(
                SymptomPredictionItem(
                    symptom=col,
                    display_name=display_name,
                    predicted=is_pred_positive,
                    probability=prob,
                    onset_hours=onset_val if col != "no_reaction" else None,
                    onset_description=onset_desc if col != "no_reaction" else None
                )
            )

        # 4. Evaluate risk & generate summary using RiskEvaluator (OCP)
        has_reaction = len(active_positive_symptoms) > 0
        risk_level = self.risk_evaluator.evaluate_risk(active_positive_symptoms, probabilities_dict)
        summary = self.risk_evaluator.generate_summary(
            risk_level, active_positive_symptoms, probabilities_dict, onset_dict
        )

        # 5. Persist prediction if repository is provided and save_record is True
        created_id = None
        created_at = None
        if self.prediction_repo and save_record:
            record = PredictionRecord(
                user_id=user_id,
                patient_identifier=patient.patient_identifier,
                age_months=patient.age_months,
                sex=patient.sex,
                vaccine_type=patient.vaccine_type,
                previous_reaction=patient.previous_reaction,
                allergy=patient.allergy,
                current_illness=patient.current_illness,
                medication=patient.medication,
                has_reaction=has_reaction,
                risk_level=risk_level,
                predicted_symptoms=active_positive_symptoms,
                probabilities=probabilities_dict,
                onset_times=onset_dict,
                summary=summary,
                notes=patient.notes
            )
            saved = self.prediction_repo.create(record)
            created_id = saved.id
            created_at = saved.created_at

        # 6. Generate XAI explanation if requested
        explanation = None
        if include_explanation:
            explanation = self._generate_explanation(
                model_loader, df_input, probabilities_dict, onset_dict,
                active_positive_symptoms, risk_level
            )

        return PredictionResponse(
            id=created_id,
            patient_identifier=patient.patient_identifier,
            has_reaction=has_reaction,
            risk_level=risk_level,
            summary=summary,
            symptoms=items,
            raw_probabilities=probabilities_dict,
            raw_onsets=onset_dict,
            created_at=created_at,
            explanation=explanation,
        )

    def _generate_explanation(
        self,
        model_loader: Optional[IModelLoader],
        df_input: pd.DataFrame,
        probabilities_dict: Dict[str, float],
        onset_dict: Dict[str, float],
        active_symptoms: List[str],
        risk_level: str,
    ) -> Optional[Dict[str, Any]]:
        """Generate unified XAI explanation from both models."""
        xai_logger = logging.getLogger(__name__)
        try:
            from backend.app.services.xai_service import generate_unified_explanation
            from backend.app.services.explanation_generator import generate_full_explanation

            if model_loader is None:
                xai_logger.warning("No model_loader provided for XAI explanation")
                return None

            symptom_model, onset_model = model_loader.get_raw_models()

            # Generate raw XAI results
            xai_results = generate_unified_explanation(
                symptom_model=symptom_model,
                onset_models=onset_model if isinstance(onset_model, dict) else {},
                input_df=df_input,
                probabilities=probabilities_dict,
                onset_dict=onset_dict,
                target_cols=TARGET_COLS,
                active_symptoms=active_symptoms,
            )

            # Transform into parent-friendly explanation
            explanation = generate_full_explanation(
                xai_results=xai_results,
                probabilities=probabilities_dict,
                onset_dict=onset_dict,
                active_symptoms=active_symptoms,
                risk_level=risk_level,
            )

            return explanation

        except Exception as e:
            xai_logger.error(f"XAI explanation generation failed: {e}")
            return None

# Default global instances for convenience / backward compatibility
default_model_loader = JoblibModelLoader()
default_inference_engine = TrainedModelInferenceEngine(default_model_loader)
default_risk_evaluator = StandardClinicalRiskEvaluator()
ml_service = default_model_loader  # for health check checks
