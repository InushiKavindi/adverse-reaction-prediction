"""
XAI Service – Genuine SHAP-based explanations for the symptom classifier
and hybrid stacking onset regressor.

Architecture
────────────
Symptom model: sklearn Pipeline → ColumnTransformer → ClassifierChain(CatBoostClassifier)
  • Each estimator inside the chain is a CatBoostClassifier.
  • We use shap.TreeExplainer on each fitted estimator individually.
  • SHAP values are per-reaction, not averaged across reactions.

Onset model: sklearn Pipeline → ColumnTransformer → StackingRegressor(RF, GB, ET → RidgeCV)
  • The StackingRegressor is a single fitted object with passthrough=False.
  • We use shap.KernelSHAP (model-agnostic) on the *full pipeline's predict*
    method so the explanation captures the complete stacking transformation.
  • A small background sample is taken from the training data.

All explanations are returned as structured dicts – never as raw SHAP values
embedded in parent-facing text.
"""

from __future__ import annotations

import logging
import traceback
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Feature metadata for human-readable labels
# ---------------------------------------------------------------------------

FEATURE_DISPLAY_NAMES: Dict[str, str] = {
    "age_months": "child's age",
    "sex": "child's sex",
    "vaccine_type": "vaccine type",
    "previous_reaction": "history of previous reactions",
    "allergy": "allergy status",
    "current_illness": "current illness",
    "medication": "current medication",
}

# One-hot encoded feature prefix → readable label
_OHE_PREFIXES = {
    "sex_": "sex",
    "vaccine_type_": "vaccine type",
    "previous_reaction_": "previous reaction history",
    "allergy_": "allergy status",
    "current_illness_": "current illness",
    "medication_": "current medication",
}


def _readable_feature_name(raw_name: str) -> str:
    """Convert a raw/OHE feature name to a readable label."""
    if raw_name in FEATURE_DISPLAY_NAMES:
        return FEATURE_DISPLAY_NAMES[raw_name]
    for prefix, label in _OHE_PREFIXES.items():
        if raw_name.startswith(prefix):
            val = raw_name[len(prefix):]
            return f"{label} ({val})"
    # Fallback: strip underscores
    return raw_name.replace("_", " ")


def _readable_feature_value(feature_name: str, value: Any) -> str:
    """Format a feature value for display."""
    if isinstance(value, float):
        if value == int(value):
            return str(int(value))
        return f"{value:.1f}"
    return str(value)


# ---------------------------------------------------------------------------
# Symptom classifier explanation (per-reaction SHAP via TreeExplainer)
# ---------------------------------------------------------------------------

def explain_symptom_predictions(
    symptom_model: Any,
    input_df: pd.DataFrame,
    probabilities: Dict[str, float],
    target_cols: List[str],
) -> Dict[str, Any]:
    """
    Explain the CatBoost symptom classifier for a single patient input.

    Returns a dict mapping each reaction name to:
      - shap_values: list of {feature, value, contribution, direction}
      - base_value: the expected value (baseline probability)
      - predicted_probability: from the model output

    The ClassifierChain wraps individual CatBoostClassifiers.
    Each gets its own TreeExplainer.
    """
    result: Dict[str, Any] = {}

    try:
        import shap

        pipeline = symptom_model
        preprocessor = pipeline.named_steps.get("preprocessor")
        classifier_chain = pipeline.named_steps.get("classifier")

        if preprocessor is None or classifier_chain is None:
            logger.warning("Symptom model missing preprocessor or classifier step")
            return _fallback_symptom_explanation(target_cols, probabilities)

        # Transform input through preprocessor
        X_transformed = preprocessor.transform(input_df)

        # Get feature names after OHE
        try:
            feature_names = preprocessor.get_feature_names_out().tolist()
        except Exception:
            feature_names = [f"feature_{i}" for i in range(X_transformed.shape[1])]

        # Clean up feature names (remove 'cat__', 'remainder__' prefixes)
        cleaned_names = []
        for fn in feature_names:
            for prefix in ("cat__", "remainder__", "num__"):
                if fn.startswith(prefix):
                    fn = fn[len(prefix):]
                    break
            cleaned_names.append(fn)
        feature_names = cleaned_names

        # The ClassifierChain stores fitted estimators in estimators_
        estimators = getattr(classifier_chain, "estimators_", [])

        if not estimators:
            logger.warning("No fitted estimators in ClassifierChain")
            return _fallback_symptom_explanation(target_cols, probabilities)

        # The ClassifierChain augments features with prior predictions.
        # For the first estimator, input is X_transformed.
        # For subsequent ones, prior predictions are appended.
        # We explain each estimator with its own TreeExplainer.

        # Get the chain's ordering
        order = getattr(classifier_chain, "order_", list(range(len(estimators))))

        # Build predictions for chaining
        chain_predictions = []

        for chain_idx, (estimator, target_idx) in enumerate(zip(estimators, order)):
            target_name = target_cols[target_idx] if target_idx < len(target_cols) else f"target_{target_idx}"

            try:
                # Build input for this estimator in the chain
                if chain_idx == 0:
                    X_est = X_transformed
                    est_feature_names = feature_names.copy()
                else:
                    # Append prior chain predictions
                    prior_preds = np.array(chain_predictions).reshape(1, -1)
                    X_est = np.hstack([X_transformed, prior_preds])
                    prior_names = [
                        target_cols[order[j]] if order[j] < len(target_cols) else f"prior_{j}"
                        for j in range(chain_idx)
                    ]
                    est_feature_names = feature_names + [f"prior prediction: {n}" for n in prior_names]

                # Ensure X_est is 2D
                if X_est.ndim == 1:
                    X_est = X_est.reshape(1, -1)

                # Create TreeExplainer for this CatBoost estimator
                explainer = shap.TreeExplainer(estimator)
                shap_values_raw = explainer.shap_values(X_est)

                # shap_values_raw shape depends on the model:
                # For binary classification, could be (n_samples, n_features) or
                # list of two arrays. We want the class-1 SHAP values.
                if isinstance(shap_values_raw, list):
                    # Multi-class output: [class_0_shap, class_1_shap]
                    sv = shap_values_raw[1][0] if len(shap_values_raw) > 1 else shap_values_raw[0][0]
                else:
                    sv = shap_values_raw[0]

                base_val = explainer.expected_value
                if isinstance(base_val, (list, np.ndarray)):
                    base_val = base_val[1] if len(base_val) > 1 else base_val[0]

                # Map one-hot feature indices to parent clinical features
                col_to_parent = {}
                for i, fn in enumerate(feature_names):
                    for parent in input_df.columns:
                        if fn == parent or fn.startswith(f"{parent}_"):
                            col_to_parent[i] = parent
                            break

                # Sum SHAP values across one-hot dummies for each clinical parent feature
                parent_shap = {col: 0.0 for col in input_df.columns}
                for fi in range(min(len(feature_names), len(sv))):
                    parent = col_to_parent.get(fi)
                    if parent in parent_shap:
                        parent_shap[parent] += float(sv[fi])

                # Build clean clinical contributions for parent-facing explanation
                clinical_contributions = []
                for parent, total_shap in parent_shap.items():
                    raw_val = input_df[parent].iloc[0] if parent in input_df.columns else ""
                    clinical_contributions.append({
                        "feature": parent,
                        "readable_feature": _readable_feature_name(parent),
                        "value": _readable_feature_value(parent, raw_val),
                        "contribution": float(total_shap),
                        "direction": "increases" if total_shap > 0 else "decreases",
                        "is_chain_feature": False,
                    })
                clinical_contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)

                # Collect all raw contributions (including chain features) for technical view
                raw_contributions = []
                for fi, (fname, shap_v) in enumerate(zip(est_feature_names, sv)):
                    if abs(shap_v) < 1e-6:
                        continue
                    raw_val = X_transformed[0, fi] if (fi < len(feature_names) and fi < X_transformed.shape[1]) else None
                    raw_contributions.append({
                        "feature": fname,
                        "readable_feature": _readable_feature_name(fname),
                        "value": raw_val if raw_val is not None else "",
                        "contribution": float(shap_v),
                        "direction": "increases" if shap_v > 0 else "decreases",
                        "is_chain_feature": fname.startswith("prior prediction:"),
                    })
                raw_contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)

                # Store this estimator's prediction for chain propagation
                pred = estimator.predict(X_est)[0]
                chain_predictions.append(pred)

                result[target_name] = {
                    "shap_contributions": clinical_contributions,  # Parent-facing clinical features
                    "raw_contributions": raw_contributions,        # Full technical features
                    "base_value": float(base_val),
                    "predicted_probability": probabilities.get(target_name, 0.0),
                    "explainer_type": "TreeExplainer",
                }

            except Exception as e:
                logger.warning(f"TreeExplainer failed for {target_name}: {e}")
                # Still record the chain prediction
                try:
                    if chain_idx == 0:
                        pred = estimator.predict(X_transformed)[0]
                    else:
                        prior_preds = np.array(chain_predictions).reshape(1, -1)
                        X_est = np.hstack([X_transformed, prior_preds])
                        pred = estimator.predict(X_est)[0]
                    chain_predictions.append(pred)
                except Exception:
                    chain_predictions.append(0)

                result[target_name] = {
                    "shap_contributions": [],
                    "base_value": None,
                    "predicted_probability": probabilities.get(target_name, 0.0),
                    "explainer_type": "unavailable",
                    "error": str(e),
                }

    except Exception as e:
        logger.error(f"Symptom explanation failed: {e}\n{traceback.format_exc()}")
        return _fallback_symptom_explanation(target_cols, probabilities)

    return result


def _fallback_symptom_explanation(
    target_cols: List[str], probabilities: Dict[str, float]
) -> Dict[str, Any]:
    """Return a minimal explanation when SHAP is unavailable."""
    return {
        col: {
            "shap_contributions": [],
            "base_value": None,
            "predicted_probability": probabilities.get(col, 0.0),
            "explainer_type": "unavailable",
        }
        for col in target_cols
    }


# ---------------------------------------------------------------------------
# Onset regressor explanation (KernelSHAP on full stacking pipeline)
# ---------------------------------------------------------------------------

def explain_onset_predictions(
    onset_models: Dict[str, Any],
    input_df: pd.DataFrame,
    onset_dict: Dict[str, float],
    background_df: Optional[pd.DataFrame] = None,
) -> Dict[str, Any]:
    """
    Explain the hybrid stacking onset regressor predictions.

    Each onset model is a Pipeline: preprocessor → StackingRegressor.
    We use shap.KernelExplainer on the full pipeline.predict method
    with a small background dataset for the expectation.

    This ensures the explanation accounts for the complete pipeline
    including base model → RidgeCV meta-model combination.
    """
    result: Dict[str, Any] = {}

    try:
        import shap

        for onset_col, onset_value in onset_dict.items():
            # Map onset_col (e.g. "fever_onset") to its model key
            # The onset_models dict is keyed by onset column name
            model = onset_models.get(onset_col)
            if model is None:
                result[onset_col] = {
                    "shap_contributions": [],
                    "base_value": None,
                    "predicted_hours": onset_value,
                    "explainer_type": "unavailable",
                }
                continue

            try:
                # Create a predict function wrapper for KernelExplainer
                # We need raw feature input → final stacking prediction
                def predict_fn(X_input):
                    df = pd.DataFrame(X_input, columns=input_df.columns)
                    return model.predict(df)

                # Background data: use a small sample or the input itself
                if background_df is not None and len(background_df) >= 5:
                    bg_sample = shap.sample(background_df, min(10, len(background_df)))
                else:
                    # Use the input itself as minimal background
                    bg_sample = input_df

                explainer = shap.KernelExplainer(predict_fn, bg_sample)
                shap_values = explainer.shap_values(input_df, nsamples=35)

                if shap_values.ndim > 1:
                    sv = shap_values[0]
                else:
                    sv = shap_values

                base_val = float(explainer.expected_value)
                if isinstance(explainer.expected_value, (list, np.ndarray)):
                    base_val = float(explainer.expected_value[0])

                contributions = []
                for fi, (fname, shap_v) in enumerate(zip(input_df.columns, sv)):
                    if abs(shap_v) < 1e-4:
                        continue

                    raw_val = input_df.iloc[0, fi]

                    contributions.append({
                        "feature": fname,
                        "readable_feature": _readable_feature_name(fname),
                        "value": _readable_feature_value(fname, raw_val),
                        "contribution": float(shap_v),
                        "direction": "later" if shap_v > 0 else "earlier",
                    })

                contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)

                result[onset_col] = {
                    "shap_contributions": contributions[:8],
                    "base_value": base_val,
                    "predicted_hours": onset_value,
                    "explainer_type": "KernelExplainer",
                }

            except Exception as e:
                logger.warning(f"KernelExplainer failed for {onset_col}: {e}")
                result[onset_col] = {
                    "shap_contributions": [],
                    "base_value": None,
                    "predicted_hours": onset_value,
                    "explainer_type": "unavailable",
                    "error": str(e),
                }

    except Exception as e:
        logger.error(f"Onset explanation failed: {e}\n{traceback.format_exc()}")
        for onset_col, onset_value in onset_dict.items():
            result[onset_col] = {
                "shap_contributions": [],
                "base_value": None,
                "predicted_hours": onset_value,
                "explainer_type": "unavailable",
            }

    return result


# ---------------------------------------------------------------------------
# Background data loader (for KernelSHAP)
# ---------------------------------------------------------------------------

_background_cache: Optional[pd.DataFrame] = None


def _load_background_data() -> Optional[pd.DataFrame]:
    """Load a small background sample from training data for KernelSHAP."""
    global _background_cache
    if _background_cache is not None:
        return _background_cache

    try:
        from pathlib import Path
        from backend.app.config import PROJECT_ROOT
        from src.preprocessor import FEATURE_COLS

        data_path = PROJECT_ROOT / "data" / "real-data.csv"
        if data_path.exists():
            df = pd.read_csv(data_path)
            # Select only feature columns
            available_cols = [c for c in FEATURE_COLS if c in df.columns]
            if available_cols:
                bg = df[available_cols].dropna().head(100)
                # Normalize categorical values to match runtime format
                for col in ["previous_reaction", "allergy", "current_illness", "medication"]:
                    if col in bg.columns:
                        bg[col] = bg[col].apply(
                            lambda v: "No" if str(v).strip().lower() in
                            ["", "no", "none", "none reported", "nil", "false", "0", "n/a", "no allergies", "negative"]
                            else "Yes"
                        )
                for col in ["sex"]:
                    if col in bg.columns:
                        bg[col] = bg[col].apply(
                            lambda v: "M" if str(v).strip().upper().startswith("M") else "F"
                        )
                _background_cache = bg
                return bg
    except Exception as e:
        logger.warning(f"Failed to load background data: {e}")

    return None


# ---------------------------------------------------------------------------
# Unified explanation builder
# ---------------------------------------------------------------------------

def generate_unified_explanation(
    symptom_model: Any,
    onset_models: Dict[str, Any],
    input_df: pd.DataFrame,
    probabilities: Dict[str, float],
    onset_dict: Dict[str, float],
    target_cols: List[str],
    active_symptoms: List[str],
) -> Dict[str, Any]:
    """
    Generate a unified XAI explanation for both models.

    Returns a structured dict containing raw XAI results for:
    - symptom_explanations: per-reaction SHAP from CatBoost TreeExplainer
    - onset_explanations: per-onset SHAP from KernelExplainer
    - metadata about the explanation
    """
    # 1. Explain symptom predictions
    symptom_explanations = explain_symptom_predictions(
        symptom_model, input_df, probabilities, target_cols
    )

    # 2. Explain onset predictions
    background_df = _load_background_data()
    onset_explanations = explain_onset_predictions(
        onset_models, input_df, onset_dict, background_df
    )

    # 3. Assemble the unified explanation
    return {
        "symptom_explanations": symptom_explanations,
        "onset_explanations": onset_explanations,
        "input_features": {
            col: {
                "value": _readable_feature_value(col, input_df.iloc[0][col]) if col in input_df.columns else "N/A",
                "readable_name": _readable_feature_name(col),
            }
            for col in input_df.columns
        },
        "active_symptoms": active_symptoms,
        "xai_methods": {
            "symptom": "SHAP TreeExplainer (CatBoost-native)",
            "onset": "SHAP KernelExplainer (model-agnostic, full stacking pipeline)",
        },
    }
