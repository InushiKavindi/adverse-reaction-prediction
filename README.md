# Explainable AI-Driven Smart Vaccination Tracking and Personalized Post-Vaccination Adverse Reaction Prediction
Research workspace for a pediatric adverse vaccine reaction and symptom onset time prediction component.

This project is non-diagnostic. It must not diagnose adverse reactions or medical conditions, and it does not replace clinical assessment or advice by a qualified healthcare professional or pediatrician.

## Project information
- **Group ID**: J26-SE-349
- **Student name**: Inushi Kavindi
- **Student ID**: IT23234666

This repository contains an individual research component developed as part of the group project.

## Current capabilities
- Multi-label adverse symptom prediction across 7 clinical outcomes (`fever`, `swelling`, `redness`, `pain`, `rash`, `others`, and `no_reaction`).
- Continuous symptom onset time regression in hours using a hybrid stacking regressor.
- Caregiver-safe Explainable AI (XAI) feature attribution without exposing raw SHAP values.
- Deterministic clinical risk stratification into Low, Medium, and High risk tiers.
- Required-field validation and complete assessment handling for patient baseline inputs.
- Dual database support: MongoDB Atlas for persistent storage and SQLite for local research validation.
- A local FastAPI research API and React caregiver/clinician interface.
- Model predictions, deterministic safety rules, clinical advice, and data persistence remain separate boundaries.

## Privacy
Private research data, participant identifiers, and clinical patient records must not be committed, transmitted, published, logged, or placed in external LLM prompts.

## Domain-specific experiment
The adverse reaction pipeline evaluates symptom occurrence classification and symptom onset regression separately. Each model uses only information available at baseline:

- `age_months`
- `sex`
- `vaccine_type`
- `previous_reaction`
- `allergy`
- `current_illness`
- `medication`

Classification models (CatBoost, Random Forest, Gradient Boosting, and Stacking) are trained on multi-label targets with logical mutual-exclusivity post-processing (`no_reaction` vs. active symptoms). Onset models (Random Forest, Gradient Boosting, Extra Trees with RidgeCV meta-estimator) evaluate continuous onset latency. Model selection uses cross-validation, exact-match accuracy, macro/weighted F1 scoring, and MAE/RMSE error metrics.

## Local validation
Install the Python environment and run the test suite:

```bash
python -m pip install -r requirements.txt
python backend/tests/test_api.py
python evaluate_onset_models.py
```

Run the local FastAPI research API:

```bash
python run_backend.py
```

Validate and run the React frontend:

```bash
cd frontend
npm install
npm run build
npm run dev
```
