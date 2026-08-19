from typing import Any, Dict, List, Optional, Union
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, f1_score, precision_score, recall_score


def evaluate_model(
    y_true: Union[pd.DataFrame, np.ndarray],
    y_pred: Union[pd.DataFrame, np.ndarray],
    target_names: Optional[List[str]] = None,
    verbose: bool = True,
) -> Dict[str, Any]:
    """
    Evaluate multi-label symptom classification predictions using precision, recall, and F1-score.

    Parameters:
        y_true (pd.DataFrame | np.ndarray): Ground truth binary labels.
        y_pred (pd.DataFrame | np.ndarray): Predicted binary labels.
        target_names (List[str], optional): List of symptom/target names. Inferred if y_true is a DataFrame.
        verbose (bool): Whether to print a formatted evaluation summary. Defaults to True.

    Returns:
        Dict[str, Any]: Dictionary containing summary metrics and per-label evaluation results.
    """
    # Infer target names if available from DataFrame columns
    if target_names is None and isinstance(y_true, pd.DataFrame):
        target_names = list(y_true.columns)

    # Compute overall multi-label metrics
    precision_macro = precision_score(y_true, y_pred, average="macro", zero_division=0)
    recall_macro = recall_score(y_true, y_pred, average="macro", zero_division=0)
    f1_macro = f1_score(y_true, y_pred, average="macro", zero_division=0)

    precision_micro = precision_score(y_true, y_pred, average="micro", zero_division=0)
    recall_micro = recall_score(y_true, y_pred, average="micro", zero_division=0)
    f1_micro = f1_score(y_true, y_pred, average="micro", zero_division=0)

    precision_weighted = precision_score(y_true, y_pred, average="weighted", zero_division=0)
    recall_weighted = recall_score(y_true, y_pred, average="weighted", zero_division=0)
    f1_weighted = f1_score(y_true, y_pred, average="weighted", zero_division=0)

    report_dict = classification_report(
        y_true,
        y_pred,
        target_names=target_names,
        zero_division=0,
        output_dict=True,
    )

    metrics: Dict[str, Any] = {
        "precision_macro": float(precision_macro),
        "recall_macro": float(recall_macro),
        "f1_macro": float(f1_macro),
        "precision_micro": float(precision_micro),
        "recall_micro": float(recall_micro),
        "f1_micro": float(f1_micro),
        "precision_weighted": float(precision_weighted),
        "recall_weighted": float(recall_weighted),
        "f1_weighted": float(f1_weighted),
        "per_label_report": report_dict,
    }

    if verbose:
        print("=" * 60)
        print("MULTI-LABEL SYMPTOM MODEL EVALUATION SUMMARY")
        print("=" * 60)
        print(f"Precision (Macro):   {precision_macro:.4f}")
        print(f"Recall (Macro):      {recall_macro:.4f}")
        print(f"F1-Score (Macro):    {f1_macro:.4f}")
        print("-" * 60)
        print(f"Precision (Weighted): {precision_weighted:.4f}")
        print(f"Recall (Weighted):    {recall_weighted:.4f}")
        print(f"F1-Score (Weighted):  {f1_weighted:.4f}")
        print("=" * 60)
        print("\nDetailed Per-Label Classification Report:")
        print(
            classification_report(
                y_true,
                y_pred,
                target_names=target_names,
                zero_division=0,
            )
        )

    return metrics
