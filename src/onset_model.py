from typing import List, Optional, Union, Dict, Any
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor, StackingRegressor
from sklearn.linear_model import RidgeCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from catboost import CatBoostRegressor

from src.symptom_model import DEFAULT_CATEGORICAL_FEATURES


def train_onset_model(
    X_train: pd.DataFrame,
    y_train: pd.DataFrame,
    categorical_features: Optional[List[str]] = None,
    n_estimators: int = 100,
    max_depth: Optional[int] = None,
    random_seed: int = 42,
    **kwargs,
) -> Dict[str, Pipeline]:
    """
    Train a Random Forest regression model for predicting onset times for each symptom.
    """
    if categorical_features is None:
        categorical_features = [col for col in DEFAULT_CATEGORICAL_FEATURES if col in X_train.columns]

    models = {}
    for target in y_train.columns:
        valid_idx = y_train[target].notna()
        if not valid_idx.any():
            continue
            
        X_valid = X_train[valid_idx]
        y_valid = y_train.loc[valid_idx, target]

        preprocessor = ColumnTransformer(
            transformers=[
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
            ],
            remainder="passthrough",
        )

        base_estimator = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=random_seed,
            **kwargs,
        )

        model_pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("regressor", base_estimator)])
        model_pipeline.fit(X_valid, y_valid)
        models[target] = model_pipeline

    return models


def train_gb_onset_model(
    X_train: pd.DataFrame,
    y_train: pd.DataFrame,
    categorical_features: Optional[List[str]] = None,
    n_estimators: int = 100,
    learning_rate: float = 0.1,
    max_depth: int = 3,
    random_seed: int = 42,
    **kwargs,
) -> Dict[str, Pipeline]:
    """
    Train a Gradient Boosting regression model for predicting onset times for each symptom.
    """
    if categorical_features is None:
        categorical_features = [col for col in DEFAULT_CATEGORICAL_FEATURES if col in X_train.columns]

    models = {}
    for target in y_train.columns:
        valid_idx = y_train[target].notna()
        if not valid_idx.any():
            continue
            
        X_valid = X_train[valid_idx]
        y_valid = y_train.loc[valid_idx, target]

        preprocessor = ColumnTransformer(
            transformers=[
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
            ],
            remainder="passthrough",
        )

        base_estimator = GradientBoostingRegressor(
            n_estimators=n_estimators,
            learning_rate=learning_rate,
            max_depth=max_depth,
            random_state=random_seed,
            **kwargs,
        )

        model_pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("regressor", base_estimator)])
        model_pipeline.fit(X_valid, y_valid)
        models[target] = model_pipeline

    return models


def train_cb_onset_model(
    X_train: pd.DataFrame,
    y_train: pd.DataFrame,
    categorical_features: Optional[List[str]] = None,
    iterations: int = 100,
    learning_rate: float = 0.1,
    depth: int = 6,
    random_seed: int = 42,
    **kwargs,
) -> Dict[str, Pipeline]:
    """
    Train a CatBoost regression model for predicting onset times for each symptom.
    """
    if categorical_features is None:
        categorical_features = [col for col in DEFAULT_CATEGORICAL_FEATURES if col in X_train.columns]

    models = {}
    for target in y_train.columns:
        valid_idx = y_train[target].notna()
        if not valid_idx.any():
            continue
            
        X_valid = X_train[valid_idx]
        y_valid = y_train.loc[valid_idx, target]

        preprocessor = ColumnTransformer(
            transformers=[
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
            ],
            remainder="passthrough",
        )

        base_estimator = CatBoostRegressor(
            iterations=iterations,
            learning_rate=learning_rate,
            depth=depth,
            random_seed=random_seed,
            verbose=0,
            **kwargs,
        )

        model_pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("regressor", base_estimator)])
        model_pipeline.fit(X_valid, y_valid)
        models[target] = model_pipeline

    return models


def train_hybrid_onset_model(
    X_train: pd.DataFrame,
    y_train: pd.DataFrame,
    categorical_features: Optional[List[str]] = None,
    random_seed: int = 42,
    **kwargs,
) -> Dict[str, Pipeline]:
    """
    Train a Hybrid Stacking regression model for predicting onset times for each symptom.
    Base models: Random Forest, Gradient Boosting, Extra Trees.
    Meta-model: RidgeCV.
    """
    if categorical_features is None:
        categorical_features = [col for col in DEFAULT_CATEGORICAL_FEATURES if col in X_train.columns]

    models = {}
    for target in y_train.columns:
        valid_idx = y_train[target].notna()
        if not valid_idx.any():
            continue
            
        X_valid = X_train[valid_idx]
        y_valid = y_train.loc[valid_idx, target]
        
        # Determine number of CV folds based on valid data size
        n_samples = len(y_valid)
        if n_samples < 10:
            cv = 2
        elif n_samples < 30:
            cv = 3
        else:
            cv = 5

        numeric_features = [col for col in X_valid.columns if col not in categorical_features]
        
        # We need scaling for RidgeCV. We can put it in the preprocessor.
        preprocessor = ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), numeric_features),
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
            ],
            remainder="passthrough",
        )

        estimators = [
            ('rf', RandomForestRegressor(n_estimators=100, max_depth=5, random_state=random_seed)),
            ('gb', GradientBoostingRegressor(n_estimators=100, max_depth=3, random_state=random_seed)),
            ('et', ExtraTreesRegressor(n_estimators=100, max_depth=5, random_state=random_seed))
        ]

        # Use passthrough=False so meta-model is trained only on predictions (helps combat overfitting on small datasets)
        stacking_regressor = StackingRegressor(
            estimators=estimators,
            final_estimator=RidgeCV(),
            cv=cv,
            passthrough=False,
            n_jobs=-1
        )

        model_pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("regressor", stacking_regressor)])
        model_pipeline.fit(X_valid, y_valid)
        models[target] = model_pipeline

    return models


def predict_onset(
    model: Union[Dict[str, Pipeline], Pipeline, Any],
    X_test: pd.DataFrame,
    target_columns: Optional[List[str]] = None,
) -> np.ndarray:
    """
    Predict onset times.
    Returns:
        np.ndarray: Predicted numerical onset times matrix.
    """
    if isinstance(model, dict):
        if target_columns is None:
            target_columns = list(model.keys())
        preds = []
        for col in target_columns:
            if col in model:
                pred = model[col].predict(X_test)
                # Ensure sensible predictions (onset >= 0)
                pred = np.maximum(pred, 0)
                preds.append(pred)
            else:
                preds.append(np.zeros(len(X_test)))
        return np.column_stack(preds)
    else:
        pred = np.asarray(model.predict(X_test))
        pred = np.maximum(pred, 0)
        return pred
