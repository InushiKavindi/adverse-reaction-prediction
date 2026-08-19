from typing import List, Tuple
import pandas as pd
from sklearn.model_selection import train_test_split

# Standard column definitions
FEATURE_COLS: List[str] = [
    "age_months",
    "sex",
    "vaccine_type",
    "dose_number",
    "previous_reaction",
]

TARGET_COLS: List[str] = [
    "fever",
    "swelling",
    "pain",
    "irritability",
    "rash",
    "vomiting",
    "no_reaction",
    "others",
]

CATEGORICAL_COLS: List[str] = [
    "sex",
    "vaccine_type",
    "previous_reaction",
]

NUMERIC_COLS: List[str] = [
    "age_months",
    "dose_number",
]


def prepare_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Preprocess the adverse reaction dataset for machine learning experiments.

    Steps performed:
    1. Validates presence of expected feature and target columns.
    2. Handles missing values (imputes numerical columns with median, fills missing categoricals with 'Missing').
    3. Formats categorical columns as strings for seamless CatBoost handling.
    4. Separates dataset into feature matrix X and target DataFrame y.

    Parameters:
        df (pd.DataFrame): Raw input DataFrame.

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame]: (X, y)
            - X: DataFrame containing input features.
            - y: DataFrame containing symptom target variables (0/1).

    Raises:
        ValueError: If required columns are missing in the DataFrame.
    """
    # Validate required columns
    missing_features = [col for col in FEATURE_COLS if col not in df.columns]
    missing_targets = [col for col in TARGET_COLS if col not in df.columns]

    if missing_features or missing_targets:
        raise ValueError(
            f"Missing required columns in input DataFrame. "
            f"Features missing: {missing_features}; Targets missing: {missing_targets}"
        )

    # Work on a copy to prevent in-place modifications
    data = df.copy()

    # Handle missing values for numerical features
    for col in NUMERIC_COLS:
        if data[col].isnull().any():
            median_val = data[col].median()
            data[col] = data[col].fillna(median_val)

    # Handle categorical features and format as string for CatBoost
    for col in CATEGORICAL_COLS:
        data[col] = data[col].fillna("Missing").astype(str)

    # Handle any missing target values by dropping incomplete target rows
    if data[TARGET_COLS].isnull().any().any():
        data = data.dropna(subset=TARGET_COLS)

    X = data[FEATURE_COLS].copy()
    y = data[TARGET_COLS].copy().astype(int)

    return X, y


def split_data(
    X: pd.DataFrame,
    y: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Split feature matrix X and target DataFrame y into train and test sets.

    Parameters:
        X (pd.DataFrame): Feature matrix.
        y (pd.DataFrame): Target variables DataFrame.
        test_size (float): Proportion of dataset to include in test split. Defaults to 0.2.
        random_state (int): Random seed for reproducibility. Defaults to 42.

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
            (X_train, X_test, y_train, y_test)
    """
    return train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
    )

