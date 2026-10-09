import os
from pathlib import Path
from typing import Union
import pandas as pd


def load_data(file_path: Union[str, Path] = "data/sample_data.csv") -> pd.DataFrame:
    """
    Load adverse reaction dataset from a CSV file into a pandas DataFrame.

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

    return pd.read_csv(path)
