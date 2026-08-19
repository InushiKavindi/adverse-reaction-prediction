from typing import List, Optional, Union
import numpy as np
import pandas as pd
from catboost import CatBoostClassifier
from sklearn.multioutput import MultiOutputClassifier

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
    iterations: int = 100,
    learning_rate: float = 0.05,
    depth: int = 4,
    random_seed: int = 42,
) -> MultiOutputClassifier:
    """
    Train a multi-label CatBoost classification model for adverse reaction prediction.

    Wraps CatBoostClassifier in scikit-learn's MultiOutputClassifier to train an
    independent binary classifier for each adverse symptom target.

    Parameters:
        X_train (pd.DataFrame): Training feature matrix.
        y_train (pd.DataFrame): Multi-label binary target DataFrame.
        categorical_features (List[str], optional): List of categorical column names.
            Defaults to ['sex', 'vaccine_type', 'previous_reaction'].
        iterations (int): Number of boosting trees per target. Defaults to 100.
        learning_rate (float): Step size shrinkage used during training. Defaults to 0.05.
        depth (int): Depth of the boosting trees. Defaults to 4.
        random_seed (int): Random seed for reproducibility. Defaults to 42.

    Returns:
        MultiOutputClassifier: Fitted multi-label CatBoost classifier.
    """
    if categorical_features is None:
        categorical_features = [
            col for col in DEFAULT_CATEGORICAL_FEATURES if col in X_train.columns
        ]

    # Base CatBoost estimator configured for small datasets and reproducibility
    base_estimator = CatBoostClassifier(
        iterations=iterations,
        learning_rate=learning_rate,
        depth=depth,
        random_seed=random_seed,
        cat_features=categorical_features,
        verbose=0,
    )

    # MultiOutputClassifier fits one estimator per target column
    multi_target_model = MultiOutputClassifier(estimator=base_estimator)
    multi_target_model.fit(X_train, y_train)

    return multi_target_model


def predict(
    model: MultiOutputClassifier,
    X_test: pd.DataFrame,
) -> np.ndarray:
    """
    Generate multi-label binary symptom predictions for test data.

    Parameters:
        model (MultiOutputClassifier): Trained multi-label model.
        X_test (pd.DataFrame): Feature matrix for test/evaluation samples.

    Returns:
        np.ndarray: Predicted binary indicator matrix (shape: [n_samples, n_targets]).
    """
    return model.predict(X_test)
