import sys
from pathlib import Path
import numpy as np
import pandas as pd

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.data_loader import load_data
from src.preprocessor import TARGET_COLS, prepare_data, split_data
from src.symptom_model import predict, train_gb_model
from src.evaluation import compare_predictions, evaluate_model


def run_pipeline() -> None:
    print("=" * 60)
    print("Running Adverse Reaction Multi-Label Prediction Pipeline (Gradient Boosting)")
    print("=" * 60)

    # 1. Load Data
    data_path = PROJECT_ROOT / "data" / "real-data.csv"
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
    X_train, X_test, y_train, y_test = split_data(X, y, test_size=0.19, random_state=42)
    print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")

    # 4. Train Model
    print("\n[4/5] Training Gradient Boosting multi-label symptom classification model...")
    gb_model = train_gb_model(
        X_train, y_train, 
        random_seed=42,
        n_estimators=300,
        learning_rate=0.01,
        max_depth=1,
        subsample=0.8,
        min_samples_leaf=5
    )
    print("Gradient Boosting model training completed successfully.")

    # 5. Predict & Evaluate
    print("\n[5/5] Generating predictions and evaluating performance (Gradient Boosting)...")
    gb_y_pred = predict(gb_model, X_test)

    # Assertions on model for safety
    assert isinstance(gb_y_pred, np.ndarray), "Predictions should be a numpy ndarray"
    assert gb_y_pred.shape == (len(X_test), len(TARGET_COLS)), (
        f"Expected prediction shape {(len(X_test), len(TARGET_COLS))}, got {gb_y_pred.shape}"
    )
    assert np.all(np.isin(gb_y_pred, [0, 1])), "Predictions must be binary (0 or 1)"

    print("\n--- Gradient Boosting Metrics ---")
    metrics_gb = evaluate_model(y_test, gb_y_pred, target_names=TARGET_COLS, verbose=True)
    
    assert "f1_macro" in metrics_gb, "Evaluation metrics must include f1_macro"
    assert "precision_macro" in metrics_gb, "Evaluation metrics must include precision_macro"
    assert "recall_macro" in metrics_gb, "Evaluation metrics must include recall_macro"

    # Detailed CSV vs Prediction comparison (Method 2)
    print("\n" + "=" * 60)
    print("TEST DATA CSV ROW PREDICTION ANALYSIS (Gradient Boosting)")
    print("=" * 60)
    comparison_df = compare_predictions(df, y_test, gb_y_pred, target_names=TARGET_COLS)
    
    exact_matches = comparison_df[comparison_df["is_exact_match"]]
    wrong_cases = comparison_df[~comparison_df["is_exact_match"]]

    print(f"Total Test Samples: {len(comparison_df)}")
    print(f"Exact Matches (All {len(TARGET_COLS)} symptoms correct): {len(exact_matches)}")
    print(f"Misclassified Cases: {len(wrong_cases)}")

    print("\nSample Detailed Predictions vs Actual CSV Rows:")
    display_cols = ["csv_line_number", "vaccine_type", "actual_symptoms", "predicted_symptoms", "is_exact_match"]
    print(comparison_df[display_cols].to_string(index=False))

    # Demonstrate probability scoring for random test samples
    print("\n" + "=" * 60)
    print("PROBABILITY SCORE DEMONSTRATION (Gradient Boosting)")
    print("=" * 60)
    
    from src.symptom_model import predict_proba
    import random
    y_proba = predict_proba(gb_model, X_test)
    
    # Pick 3 random samples to show variety
    random_indices = random.sample(range(len(X_test)), 3)
    
    for i, sample_idx in enumerate(random_indices, 1):
        print(f"\n--- Random Test Sample {i} ---")
        print(f"Features: {X_test.iloc[sample_idx].to_dict()}")
        
        sample_probs = y_proba[sample_idx]
        
        # Sort by probability descending
        scored_symptoms = [(TARGET_COLS[j].replace('_', ' ').title(), sample_probs[j]) for j in range(len(TARGET_COLS))]
        scored_symptoms.sort(key=lambda x: x[1], reverse=True)
        
        print("Predicted reactions:")
        for symptom_name, prob in scored_symptoms:
            if prob >= 0.01: # Show if 1% or higher
                print(f"  {symptom_name} ({prob * 100:.0f}%)")

    # ----- CUSTOM CASE PREDICTION -----
    print("\n" + "=" * 60)
    print("CUSTOM CASE PREDICTION DEMONSTRATION")
    print("=" * 60)
    
    # You can change these values to test different cases!
    custom_patient = {
        'age_months': 0, 
        'sex': 'F', 
        'vaccine_type': 'BCG1', 
        'previous_reaction': 'No', 
        'allergy': 'No', 
        'current_illness': 'Yes',
        'medication': 'No'
    }
    
    # Convert to DataFrame
    custom_df = pd.DataFrame([custom_patient])
    
    custom_probs = predict_proba(gb_model, custom_df)[0]
    
    print(f"Custom features: {custom_patient}")
    print("Predicted reactions for this custom case:")
    
    custom_scored_symptoms = [(TARGET_COLS[i].replace('_', ' ').title(), custom_probs[i]) for i in range(len(TARGET_COLS))]
    custom_scored_symptoms.sort(key=lambda x: x[1], reverse=True)
    
    for symptom_name, prob in custom_scored_symptoms:
        print(f"{symptom_name} ({prob * 100:.0f}%)")


    print("\n" + "=" * 60)
    print("PIPELINE TEST PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_pipeline()
