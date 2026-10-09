from typing import Any, Dict, List, Optional, Union
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, f1_score, precision_score, recall_score, accuracy_score


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
    accuracy = accuracy_score(y_true, y_pred)
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
        "accuracy": float(accuracy),
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
        print(f"Overall Exact Match Accuracy: {accuracy * 100:.2f}%")
        print("-" * 60)
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


def compare_predictions(
    data: pd.DataFrame,
    y_true: Union[pd.DataFrame, np.ndarray],
    y_pred: Union[pd.DataFrame, np.ndarray],
    target_names: Optional[List[str]] = None,
) -> pd.DataFrame:
    """
    Combine original CSV data with ground truth and model predictions to identify
    exact correct vs. incorrect predictions for each test sample.

    Parameters:
        data (pd.DataFrame): Original DataFrame (or X_test) with indices corresponding to original CSV rows.
        y_true (pd.DataFrame | np.ndarray): Ground truth binary labels.
        y_pred (pd.DataFrame | np.ndarray): Predicted binary labels.
        target_names (List[str], optional): List of target column names. Inferred if y_true is a DataFrame.

    Returns:
        pd.DataFrame: Comparison DataFrame with columns:
            - csv_line_number: Line number in the original CSV file (index + 2)
            - Original feature columns
            - actual_symptoms: List of symptoms actually present
            - predicted_symptoms: List of symptoms predicted by model
            - is_exact_match: True if all target predictions match ground truth
            - false_positives: Symptoms falsely predicted
            - false_negatives: Symptoms missed by the model
            - pred_<target>: Individual binary predictions for each target
    """
    if target_names is None:
        if isinstance(y_true, pd.DataFrame):
            target_names = list(y_true.columns)
        else:
            raise ValueError("target_names must be provided if y_true is not a DataFrame")

    index = y_true.index if isinstance(y_true, pd.DataFrame) else data.index
    y_true_df = pd.DataFrame(y_true, columns=target_names, index=index) if not isinstance(y_true, pd.DataFrame) else y_true
    y_pred_df = pd.DataFrame(y_pred, columns=target_names, index=index)

    # Base features from the provided DataFrame for the matching indices
    matched_data = data.loc[index].copy()

    records = []
    for idx in index:
        actual = [col for col in target_names if y_true_df.loc[idx, col] == 1]
        predicted = [col for col in target_names if y_pred_df.loc[idx, col] == 1]

        fp = [col for col in predicted if col not in actual]  # Overpredicted
        fn = [col for col in actual if col not in predicted]  # Missed
        is_exact = (actual == predicted)

        # CSV line number (0-indexed index + 2 for header)
        csv_line = int(idx) + 2 if isinstance(idx, (int, np.integer)) else idx

        row_dict = {
            "csv_row_index": idx,
            "csv_line_number": csv_line,
            "actual_symptoms": actual if actual else ["no_symptoms"],
            "predicted_symptoms": predicted if predicted else ["no_symptoms"],
            "is_exact_match": is_exact,
            "false_positives": fp,
            "false_negatives": fn,
        }

        # Add individual pred_<target> columns
        for col in target_names:
            row_dict[f"pred_{col}"] = int(y_pred_df.loc[idx, col])

        records.append(row_dict)

    comparison_details = pd.DataFrame(records, index=index)
    result_df = pd.concat([matched_data, comparison_details], axis=1)

    return result_df
