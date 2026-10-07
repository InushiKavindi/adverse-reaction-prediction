import sys
from pathlib import Path
import numpy as np
import pandas as pd

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.data_loader import load_data
from src.preprocessor import TARGET_COLS, prepare_data, split_data
from src.symptom_model import predict, train_model
from src.evaluation import compare_predictions, evaluate_model


def run_pipeline() -> None:
    print("=" * 60)
    print("Running Adverse Reaction Multi-Label Prediction Pipeline")
    print("=" * 60)

    # 1. Load Data
    data_path = PROJECT_ROOT / "data" / "combined_schedule_data.csv"
    print(f"\n[1/5] Loading data from {data_path}...")
    df = load_data(data_path)
    print(f"Loaded {len(df)} records with {len(df.columns)} columns.")

    # 2. Preprocess Data
    print("\n[2/5] Preparing features and targets...")
    X, y = prepare_data(df)
    assert len(X) == len(y), "Features and targets must have same length"
    assert list(y.columns) == TARGET_COLS, f"Target columns must match {TARGET_COLS}"
    print(f"Features shape: {X.shape}, Targets shape: {y.shape}")

    # 3. Train/Test Split
    print("\n[3/5] Splitting data into train/test sets...")
    X_train, X_test, y_train, y_test = split_data(X, y, test_size=0.2, random_state=42)
    print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")

    # 4. Train Model
    print("\n[4/5] Training Random Forest multi-label symptom classification model...")
    model = train_model(
        X_train, y_train, 
        random_seed=42,
        max_depth=5,
        min_samples_leaf=3
    )
    print("Random Forest model training completed successfully.")

    # 5. Predict & Evaluate
    print("\n[5/5] Generating predictions and evaluating performance...")
    y_pred = predict(model, X_test)

    # Assertions
    assert isinstance(y_pred, np.ndarray), "Predictions should be a numpy ndarray"
    assert y_pred.shape == (len(X_test), len(TARGET_COLS)), (
        f"Expected prediction shape {(len(X_test), len(TARGET_COLS))}, got {y_pred.shape}"
    )
    assert np.all(np.isin(y_pred, [0, 1])), "Predictions must be binary (0 or 1)"

    metrics = evaluate_model(y_test, y_pred, target_names=TARGET_COLS, verbose=True)
    assert "f1_macro" in metrics, "Evaluation metrics must include f1_macro"
    assert "precision_macro" in metrics, "Evaluation metrics must include precision_macro"
    assert "recall_macro" in metrics, "Evaluation metrics must include recall_macro"

    # Detailed CSV vs Prediction comparison (Method 2)
    print("\n" + "=" * 60)
    print("TEST DATA CSV ROW PREDICTION ANALYSIS")
    print("=" * 60)
    comparison_df = compare_predictions(df, y_test, y_pred, target_names=TARGET_COLS)
    
    exact_matches = comparison_df[comparison_df["is_exact_match"]]
    wrong_cases = comparison_df[~comparison_df["is_exact_match"]]

    print(f"Total Test Samples: {len(comparison_df)}")
    print(f"Exact Matches (All 8 symptoms correct): {len(exact_matches)}")
    print(f"Misclassified Cases: {len(wrong_cases)}")

    print("\nSample Detailed Predictions vs Actual CSV Rows:")
    display_cols = ["csv_line_number", "vaccine_type", "actual_symptoms", "predicted_symptoms", "is_exact_match"]
    print(comparison_df[display_cols].to_string(index=False))

    # Demonstrate probability scoring for the first test sample
    print("\n" + "=" * 60)
    print("PROBABILITY SCORE DEMONSTRATION")
    print("=" * 60)
    
    from src.symptom_model import predict_proba
    y_proba = predict_proba(model, X_test)
    
    sample_idx = 0
    print(f"Sample features: {X_test.iloc[sample_idx].to_dict()}")
    print("Possible reactions predicted as scores:")
    
    sample_probs = y_proba[sample_idx]
    
    # Sort by probability descending
    scored_symptoms = [(TARGET_COLS[i].replace('_', ' ').title(), sample_probs[i]) for i in range(len(TARGET_COLS))]
    scored_symptoms.sort(key=lambda x: x[1], reverse=True)
    
    for symptom_name, prob in scored_symptoms:
        print(f"{symptom_name} ({prob * 100:.0f}%)")


    print("\n" + "=" * 60)
    print("PIPELINE TEST PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_pipeline()
