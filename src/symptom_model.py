from typing import List, Optional, Union
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.multioutput import ClassifierChain, MultiOutputClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

# Default categorical feature column names
DEFAULT_CATEGORICAL_FEATURES: List[str] = [
    "sex",
    "vaccine_type",
    "previous_reaction",
    "allergy",
    "current_illness",
]


def train_model(
    X_train: pd.DataFrame,
    y_train: pd.DataFrame,
    categorical_features: Optional[List[str]] = None,
    n_estimators: int = 200,
    max_depth: Optional[int] = None,
    random_seed: int = 42,
    **kwargs,
) -> Pipeline:
    """
    Train a multi-label Random Forest classification model for adverse reaction prediction.

    Uses a scikit-learn Pipeline containing a ColumnTransformer with OneHotEncoder
    for categorical features, followed by a ClassifierChain wrapping
    RandomForestClassifier to capture label dependencies for each adverse symptom target.

    Parameters:
        X_train (pd.DataFrame): Training feature matrix.
        y_train (pd.DataFrame): Multi-label binary target DataFrame.
        categorical_features (List[str], optional): List of categorical column names.
            Defaults to ['sex', 'vaccine_type', 'previous_reaction'].
        n_estimators (int): Number of trees in the forest. Defaults to 100.
        max_depth (int, optional): Maximum depth of the tree. Defaults to None.
        random_seed (int): Random seed for reproducibility. Defaults to 42.

    Returns:
        Pipeline: Fitted scikit-learn Pipeline containing preprocessor and ClassifierChain.
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

    # MultiOutputClassifier trains independent models for each symptom label
    multi_target_model = MultiOutputClassifier(base_estimator, n_jobs=-1)

    # Complete pipeline with preprocessing and multi-label classifier
    model_pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", multi_target_model),
        ]
    )

    model_pipeline.fit(X_train, y_train)

    return model_pipeline


def train_gb_model(
    X_train: pd.DataFrame,
    y_train: pd.DataFrame,
    categorical_features: Optional[List[str]] = None,
    n_estimators: int = 100,
    random_seed: int = 42,
    **kwargs,
) -> Pipeline:
    """
    Train a multi-label Gradient Boosting classification model for adverse reaction prediction.
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

    base_estimator = GradientBoostingClassifier(
        n_estimators=n_estimators,
        random_state=random_seed,
        **kwargs,
    )

    multi_target_model = ClassifierChain(base_estimator, order='random', random_state=random_seed)

    model_pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", multi_target_model),
        ]
    )

    model_pipeline.fit(X_train, y_train)

    return model_pipeline


def predict(
    model: Union[Pipeline, ClassifierChain, MultiOutputClassifier],
    X_test: pd.DataFrame,
) -> np.ndarray:
    """
    Generate multi-label binary symptom predictions for test data with logical post-processing.

    Parameters:
        model (Pipeline | ClassifierChain | MultiOutputClassifier): Trained multi-label model pipeline.
        X_test (pd.DataFrame): Feature matrix for test/evaluation samples.

    Returns:
        np.ndarray: Predicted binary indicator matrix (shape: [n_samples, n_targets]).
    """
    y_pred = np.asarray(model.predict(X_test))

    # Logical Post-Processing
    # TARGET_COLS = ["fever", "swelling", "pain", "irritability", "rash", "vomiting", "no_reaction", "others"]
    # 'no_reaction' is at index 6.
    if y_pred.shape[1] == 8:
        no_reaction_idx = 6
        # Find if any active symptom (indices 0-5, 7) is predicted as 1
        active_symptoms_mask = (np.delete(y_pred, no_reaction_idx, axis=1) == 1).any(axis=1)
        
        # Rule 1: If any active symptom is present, no_reaction must be 0
        y_pred[active_symptoms_mask, no_reaction_idx] = 0
        
        # Rule 2: If no active symptoms are present, no_reaction must be 1
        y_pred[~active_symptoms_mask, no_reaction_idx] = 1

    return y_pred


def predict_proba(
    model: Union[Pipeline, ClassifierChain, MultiOutputClassifier],
    X_test: pd.DataFrame,
) -> np.ndarray:
    """
    Generate probability scores for each symptom.

    Parameters:
        model (Pipeline | ClassifierChain | MultiOutputClassifier): Trained model pipeline.
        X_test (pd.DataFrame): Feature matrix.

    Returns:
        np.ndarray: Predicted probability matrix (shape: [n_samples, n_targets]).
    """
    if hasattr(model, "predict_proba"):
        # ClassifierChain predict_proba returns an array of shape (n_samples, n_targets)
        proba = model.predict_proba(X_test)
        if isinstance(proba, list):
            # For MultiOutputClassifier, predict_proba returns a list of arrays for each target
            # Each array is shape (n_samples, 2), we want the probability of class 1
            proba = np.column_stack([p[:, 1] for p in proba])
        return proba
    
    # Fallback if model doesn't support probabilities directly
    return np.asarray(model.predict(X_test), dtype=float)
