import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import os

from src.preprocessor import prepare_regression_data, split_data, ONSET_COLS
from src.onset_model import (
    train_onset_model,
    train_gb_onset_model,
    train_cb_onset_model,
    train_hybrid_onset_model,
    predict_onset
)

def evaluate_models():
    print("Loading and preparing data...")
    df = pd.read_csv('data/real-data.csv')
    X, y = prepare_regression_data(df)

    print("Splitting data into train/test sets...")
    X_train, X_test, y_train, y_test = split_data(X, y, test_size=0.2, random_state=42)

    print("\nTraining Random Forest model...")
    rf_models = train_onset_model(X_train, y_train, random_seed=42)
    
    print("Training Gradient Boosting model...")
    gb_models = train_gb_onset_model(X_train, y_train, random_seed=42)
    
    print("Training CatBoost model...")
    cb_models = train_cb_onset_model(X_train, y_train, random_seed=42)
    
    print("Training Hybrid Stacking model...")
    hybrid_models = train_hybrid_onset_model(X_train, y_train, random_seed=42)

    # Save hybrid models
    print("Saving Hybrid Stacking models...")
    os.makedirs('models', exist_ok=True)
    joblib.dump(hybrid_models, 'models/hybrid_onset_model.joblib')

    # Predict
    print("\nEvaluating models on test set...")
    models_dict = {
        'Random Forest': rf_models,
        'Gradient Boosting': gb_models,
        'CatBoost': cb_models,
        'Hybrid': hybrid_models
    }

    results = []
    
    for target in ONSET_COLS:
        valid_train_idx = y_train[target].notna()
        n_train = valid_train_idx.sum()
        
        valid_test_idx = y_test[target].notna()
        n_test = valid_test_idx.sum()
        
        if n_test == 0:
            print(f"Skipping {target}: No valid records in the test set.")
            continue
            
        X_test_valid = X_test[valid_test_idx]
        y_test_valid = y_test.loc[valid_test_idx, target]
        
        target_results = {
            'Symptom': target.replace('_onset', ''),
            'Valid Train Records': n_train,
            'Valid Test Records': n_test,
        }
        
        for name, models in models_dict.items():
            if target in models:
                preds = models[target].predict(X_test_valid)
                preds = np.maximum(preds, 0) # Ensure onset >= 0
                mae = mean_absolute_error(y_test_valid, preds)
                rmse = np.sqrt(mean_squared_error(y_test_valid, preds))
            else:
                mae = np.nan
                rmse = np.nan
                
            target_results[f'{name} MAE'] = mae
            target_results[f'{name} RMSE'] = rmse
            
        results.append(target_results)

    results_df = pd.DataFrame(results)
    
    # Print the table nicely
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', 1000)
    print("\n--- Model Comparison Table ---")
    print(results_df.to_string(index=False))
    
    print("\n--- Notes ---")
    print("Some symptoms (e.g., redness) may have very few valid records.")
    print("For these, cross-validation inside StackingRegressor uses fewer folds, and evaluation metrics may not be highly reliable.")

if __name__ == '__main__':
    evaluate_models()
