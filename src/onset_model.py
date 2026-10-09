from typing import List, Optional, Union
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from src.symptom_model import DEFAULT_CATEGORICAL_FEATURES


def train_onset_model(
    X_train: pd.DataFrame,
    y_train: pd.DataFrame,
    categorical_features: Optional[List[str]] = None,
    n_estimators: int = 100,
    max_depth: Optional[int] = None,
    random_seed: int = 42,
    **kwargs,
) -> Pipeline:
    """
    Train a multi-output Random Forest regression model for predicting onset times.
    """
    if categorical_features is None:
        categorical_features = [
            col for col in DEFAULT_CATEGORICAL_FEATURES if col in X_train.columns
        ]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                categorical_features,
            )
        ],
        remainder="passthrough",
    )

    base_estimator = RandomForestRegressor(
        n_estimators=n_estimators,
        max_depth=max_depth,
        random_state=random_seed,
        **kwargs,
    )

    # MultiOutputRegressor for multiple onset columns
    multi_target_model = MultiOutputRegressor(base_estimator, n_jobs=-1)

    model_pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", multi_target_model),
        ]
    )

    model_pipeline.fit(X_train, y_train)

    return model_pipeline


def predict_onset(
    model: Union[Pipeline, MultiOutputRegressor],
    X_test: pd.DataFrame,
) -> np.ndarray:
    """
    Predict onset times.
    Returns:
        np.ndarray: Predicted numerical onset times matrix.
    """
    return np.asarray(model.predict(X_test))
