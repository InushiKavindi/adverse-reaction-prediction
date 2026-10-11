import sys
from pathlib import Path
import pandas as pd

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.data_loader import load_data
from src.preprocessor import prepare_regression_data, split_data, ONSET_COLS
from src.onset_model import train_onset_model, predict_onset


from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np

def main():
    print("=" * 60)
    print("Running Onset Time Prediction for Symptoms (Random Forest Regressor)")
    print("=" * 60)

    # 1. Load Data
    data_path = PROJECT_ROOT / "data" / "real-data.csv"
    print(f"\n[1/4] Loading data from {data_path}...")
    df = load_data(data_path)
    
    # 2. Preprocess Data for Regression
    print("\n[2/4] Preparing features and onset targets...")
    X, y = prepare_regression_data(df)
    
    # 3. Train/Test Split
    print("\n[3/4] Splitting data into train/test sets...")
    X_train, X_test, y_train, y_test = split_data(X, y, test_size=0.2, random_state=42)
    
    # 4. Train Model
    print("\n[4/4] Training Random Forest Regressor for multiple onset targets...")
    model = train_onset_model(
        X_train, y_train, 
        random_seed=42,
        n_estimators=100
    )
    print("Model training completed.")
    
    # Predict
    print("\n" + "=" * 60)
    print("PREDICTION DISPLAY & METRICS")
    print("=" * 60)
    y_pred = predict_onset(model, X_test)
    
    # Calculate Overall Metrics
    valid_mask = ~np.isnan(y_test.values)
    mae = mean_absolute_error(y_test.values[valid_mask], y_pred[valid_mask])
    rmse = np.sqrt(mean_squared_error(y_test.values[valid_mask], y_pred[valid_mask]))
    
    print("\n--- Model Performance (Error Metrics) ---")
    print(f"Mean Absolute Error (MAE): {mae:.2f} hours")
    print(f"Root Mean Squared Error (RMSE): {rmse:.2f} hours")
    print("(Note: Since this is predicting time, we use Error metrics instead of percentage 'Accuracy'.")
    print(" Lower error means higher precision.)")
    print("-----------------------------------------")
    
    # Display individual onset time for each predicted symptom
    # For a clear display, we will take a few samples and show
    # the predicted onset times for symptoms that were expected or have >0 onset.
    
    num_samples_to_display = 10
    
    for i in range(num_samples_to_display):
        print(f"\nPatient {i+1} Features:")
        feature_dict = X_test.iloc[i].to_dict()
        print(f"  {feature_dict}")
        
        print("  Predicted Onset Times:")
        has_prediction = False
        for j, col_name in enumerate(ONSET_COLS):
            pred_val = y_pred[i, j]
            actual_val = y_test.iloc[i, j]
            
            # We display it if there is a predicted value > 0.5 hours or if it actually occurred.
            # To show all, we can just print them.
            symptom_name = col_name.replace('_onset', '').title()
            # formatting predicted value
            if pred_val >= 0.5:
                has_prediction = True
                print(f"    - {symptom_name}: {pred_val:.1f} hours (Actual: {actual_val:.1f} hours)")
        
        if not has_prediction:
            print("    - No significant symptom onset predicted (>0.5 hours).")

if __name__ == "__main__":
    main()
