import os
from pathlib import Path
from typing import Union
import pandas as pd


def load_data(file_path: Union[str, Path] = "data/sample_data.csv") -> pd.DataFrame:
    """
    Load adverse reaction dataset from a CSV file into a pandas DataFrame.

    Also enforces the clinical consistency rule that a child recorded as having
    no current illness cannot be on medication: rows with current_illness == 'No'
    and medication == 'Yes' are corrected to medication == 'No'.

    Parameters:
        file_path (str | Path): Path to the CSV dataset file. Defaults to 'data/sample_data.csv'.

    Returns:
        pd.DataFrame: Loaded dataset as a pandas DataFrame.

    Raises:
        FileNotFoundError: If the specified file does not exist.
    """
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"Dataset file not found at: {file_path}")

    df = pd.read_csv(path)

    if "current_illness" in df.columns and "medication" in df.columns:
        inconsistent = (df["current_illness"].astype(str).str.strip() == "No") & (
            df["medication"].astype(str).str.strip() == "Yes"
        )
        df.loc[inconsistent, "medication"] = "No"

    return df
