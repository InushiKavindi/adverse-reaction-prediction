import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.data_loader import load_data
from src.preprocessor import prepare_data, prepare_regression_data, split_data, TARGET_COLS, ONSET_COLS
from src.symptom_model import train_cb_model, predict as predict_symptoms, predict_proba
from src.onset_model import train_hybrid_onset_model, predict_onset
from sklearn.metrics import mean_absolute_error, mean_squared_error, accuracy_score
import numpy as np

def main():
    print("=" * 70)
    print("COMBINED PIPELINE: CatBoost (Symptoms) + Hybrid Stacking (Onset)")
    print("=" * 70)

    # 1. Load Data
    data_path = PROJECT_ROOT / "data" / "real-data.csv"
    print(f"\n[1/5] Loading data from {data_path}...")
    df = load_data(data_path)
    print(f"Loaded {len(df)} records with {len(df.columns)} columns.")
    
    # 2. Preprocess Data for Both Models
    print("\n[2/5] Preparing features for Classification and Regression...")
    X_cls, y_cls = prepare_data(df)
    X_reg, y_reg = prepare_regression_data(df)
    
    # Use the exact same random state to keep train/test splits perfectly aligned
    X_train, X_test, y_cls_train, y_cls_test = split_data(X_cls, y_cls, test_size=0.2, random_state=42)
    _, _, y_reg_train, y_reg_test = split_data(X_reg, y_reg, test_size=0.2, random_state=42)
    print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
    
    # 3. Train Classification Model (CatBoost)
    print("\n[3/5] Training CatBoost Classification Model (Symptom Occurrence)...")
    clf_model = train_cb_model(
        X_train, y_cls_train, 
        random_seed=42, 
        iterations=500,
        learning_rate=0.01,
        depth=3,
        l2_leaf_reg=9
    )
    
    # 4. Train Regression Model (Hybrid Stacking)
    print("\n[4/5] Training Hybrid Stacking Regression Model (Symptom Onset Times)...")
    reg_model = train_hybrid_onset_model(X_train, y_reg_train, random_seed=42)
    
    print("\n[5/5] Generating Combined Predictions...")
    
    # Generate predictions from both models
    y_pred_cls = predict_symptoms(clf_model, X_test)
    y_pred_proba = predict_proba(clf_model, X_test)
    y_pred_reg = predict_onset(reg_model, X_test)
    
    # Evaluation Metrics
    acc = accuracy_score(y_cls_test, y_pred_cls)
    valid_mask = ~np.isnan(y_reg_test.values)
    mae = mean_absolute_error(y_reg_test.values[valid_mask], y_pred_reg[valid_mask])
    rmse = np.sqrt(mean_squared_error(y_reg_test.values[valid_mask], y_pred_reg[valid_mask]))
    
    print("\n" + "=" * 70)
    print("COMBINED PIPELINE EVALUATION METRICS")
    print("=" * 70)
    print(f"  Symptom Classification Exact Match Accuracy: {acc * 100:.2f}% ({int(acc * len(y_cls_test))}/{len(y_cls_test)})")
    print(f"  Onset Regression Mean Absolute Error (MAE):   {mae:.2f} hours")
    print(f"  Onset Regression Root Mean Squared Error (RMSE): {rmse:.2f} hours")
    
    print("\n" + "=" * 70)
    print("SAMPLE COMBINED PREDICTIONS DISPLAY (With Probabilities & Onset)")
    print("=" * 70)
    
    num_samples_to_display = 10
    no_reaction_idx = TARGET_COLS.index("no_reaction")
    
    for i in range(num_samples_to_display):
        print(f"\nPatient {i+1} Features:")
        feature_dict = X_test.iloc[i].to_dict()
        print(f"  {feature_dict}")
        
        print("  Predicted Result:")
        
        # Check if classification model predicts "no_reaction"
        predicted_no_reaction = y_pred_cls[i, no_reaction_idx] == 1
        no_rxn_prob = y_pred_proba[i, no_reaction_idx] * 100
        
        if predicted_no_reaction:
            print(f"    -> No Reaction ({no_rxn_prob:.0f}% confidence)")
        else:
            symptoms_predicted = False
            patient_predictions = []
            
            for j, col_name in enumerate(TARGET_COLS):
                if col_name == "no_reaction":
                    continue
                
                prob = y_pred_proba[i, j] * 100
                
                # Check if this specific symptom was predicted to occur (Binary 1)
                if y_pred_cls[i, j] == 1:
                    symptoms_predicted = True
                    onset_col_name = f"{col_name}_onset"
                    reg_idx = ONSET_COLS.index(onset_col_name)
                    
                    predicted_onset_time = y_pred_reg[i, reg_idx]
                    symptom_display_name = col_name.title()
                    
                    patient_predictions.append({
                        "name": symptom_display_name,
                        "prob": prob,
                        "onset": predicted_onset_time
                    })
            
            # Sort by probability descending
            patient_predictions.sort(key=lambda x: x["prob"], reverse=True)
            
            for pred in patient_predictions:
                print(f"    - {pred['name']} ({pred['prob']:.0f}%): predicted to start in {pred['onset']:.1f} hours")
            
            # Fallback if no specific symptom was flagged
            if not symptoms_predicted:
                print(f"    -> No Reaction predicted (No specific symptoms above threshold)")

    print("\n" + "=" * 70)
    print("COMBINED PIPELINE RUN COMPLETED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    main()
