from typing import List, Optional, Union
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

# Default categorical feature column names
DEFAULT_CATEGORICAL_FEATURES: List[str] = [
    "sex",
    "vaccine_type",
    "previous_reaction",
]


def train_model(
    X_train: pd.DataFrame,
    y_train: pd.DataFrame,
    categorical_features: Optional[List[str]] = None,
    n_estimators: int = 100,
    max_depth: Optional[int] = None,
    random_seed: int = 42,
    **kwargs,
) -> Pipeline:
    """
    Train a multi-label Random Forest classification model for adverse reaction prediction.

    Uses a scikit-learn Pipeline containing a ColumnTransformer with OneHotEncoder
    for categorical features, followed by a MultiOutputClassifier wrapping
    RandomForestClassifier to train independent binary classifiers for each adverse symptom target.

    Parameters:
        X_train (pd.DataFrame): Training feature matrix.
        y_train (pd.DataFrame): Multi-label binary target DataFrame.
        categorical_features (List[str], optional): List of categorical column names.
            Defaults to ['sex', 'vaccine_type', 'previous_reaction'].
        n_estimators (int): Number of trees in the forest. Defaults to 100.
        max_depth (int, optional): Maximum depth of the tree. Defaults to None.
        random_seed (int): Random seed for reproducibility. Defaults to 42.

    Returns:
        Pipeline: Fitted scikit-learn Pipeline containing preprocessor and MultiOutputClassifier.
    """
    if categorical_features is None:
        categorical_features = [
            col for col in DEFAULT_CATEGORICAL_FEATURES if col in X_train.columns
        ]

    # Preprocessing pipeline for encoding categorical features
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

    # Base Random Forest estimator
    base_estimator = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        random_state=random_seed,
        **kwargs,
    )

    # MultiOutputClassifier fits one estimator per target column
    multi_target_model = MultiOutputClassifier(estimator=base_estimator)

    # Complete pipeline with preprocessing and multi-label classifier
    model_pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", multi_target_model),
        ]
    )

    model_pipeline.fit(X_train, y_train)

    return model_pipeline


def predict(
    model: Union[Pipeline, MultiOutputClassifier],
    X_test: pd.DataFrame,
) -> np.ndarray:
    """
    Generate multi-label binary symptom predictions for test data.

    Parameters:
        model (Pipeline | MultiOutputClassifier): Trained multi-label model pipeline.
        X_test (pd.DataFrame): Feature matrix for test/evaluation samples.

    Returns:
        np.ndarray: Predicted binary indicator matrix (shape: [n_samples, n_targets]).
    """
    return np.asarray(model.predict(X_test))
