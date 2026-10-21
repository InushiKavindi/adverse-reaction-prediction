"""
Explanation Generator – Transforms genuine, structured XAI results into
a simple, parent-friendly explanation for the "Understanding Your Child's Forecast" section.

Strictly follows the simple, parent-friendly structure:
  A. What does the forecast mean?
     - Personalized summary of predicted possible reactions
     - Estimated onset timing window
     - Cautious estimate reminder
  B. What influenced the forecast?
     - Factors influencing the predicted reactions
     - Expected timing explanation
  C. What should parents know?
     - Post-vaccination monitoring guidance
     - Urgent medical care advice
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# Natural symptom descriptors for parent-friendly sentences
SYMPTOM_NATURAL_NAMES = {
    "fever": "fever",
    "pain": "mild pain",
    "swelling": "mild swelling",
    "redness": "redness",
    "rash": "skin rash",
    "no_reaction": "no adverse reaction",
    "others": "other mild symptoms",
}

SYMPTOM_DISPLAY = {
    "fever": "Fever",
    "pain": "Pain",
    "swelling": "Swelling",
    "redness": "Redness",
    "rash": "Skin Rash",
    "no_reaction": "No Adverse Reaction",
    "others": "Other Symptoms",
}


def _display(symptom: str) -> str:
    """Format symptom key into display name."""
    return SYMPTOM_DISPLAY.get(symptom, symptom.replace("_", " ").title())


def _natural_name(symptom: str) -> str:
    """Get clean parent-friendly natural symptom name."""
    return SYMPTOM_NATURAL_NAMES.get(symptom, symptom.replace("_", " ").lower())


def _join_items(items: List[str]) -> str:
    """Join items with commas and 'and' naturally."""
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} and {items[1]}"
    return ", ".join(items[:-1]) + f", and {items[-1]}"


def _get_onset_value(onset_dict: Dict[str, float], symptom: str) -> Optional[float]:
    """Retrieve onset hours safely for a given symptom."""
    val = onset_dict.get(f"{symptom}_onset")
    if val is None:
        val = onset_dict.get(symptom)
    if val is not None and val > 0:
        return float(val)
    return None


# ────────────────────────────────────────────────────────────────────
# Section A – What does the forecast mean?
# ────────────────────────────────────────────────────────────────────

def generate_forecast_summary(
    probabilities: Dict[str, float],
    onset_dict: Dict[str, float],
    active_symptoms: List[str],
    risk_level: str,
) -> Dict[str, Any]:
    """
    Generate Section A: simple, parent-friendly summary.
    """
    # 1. Gather all adverse reactions (excluding no_reaction) with their probabilities
    adverse_candidates = []
    for symptom, prob in probabilities.items():
        if symptom == "no_reaction":
            continue
        p_pct = min(92, max(0, int(round(prob * 100))))
        onset_val = _get_onset_value(onset_dict, symptom)
        is_active = symptom in active_symptoms

        adverse_candidates.append({
            "symptom": symptom,
            "display_name": _display(symptom),
            "natural_name": _natural_name(symptom),
            "probability_pct": p_pct,
            "raw_prob": prob,
            "onset_hours": onset_val,
            "is_active": is_active,
        })

    adverse_candidates.sort(key=lambda x: x["probability_pct"], reverse=True)

    # Relevant reactions: active in prediction, or probability >= 20%
    relevant = [c for c in adverse_candidates if c["is_active"] or c["probability_pct"] >= 20]
    if not relevant and adverse_candidates and adverse_candidates[0]["probability_pct"] >= 10:
        relevant = [adverse_candidates[0]]

    # Case 1: Low reaction likelihood
    if not relevant:
        paragraphs = [
            "Based on the information provided, the system predicts a low likelihood of adverse reactions following this vaccination.",
            "These are estimates, not guarantees. Your child may experience mild reactions or no reaction at all.",
        ]
        return {
            "title": "What does the forecast mean?",
            "paragraphs": paragraphs,
            "summary": " ".join(paragraphs),
            "relevant_reactions": [],
        }

    # Case 2: One or more relevant reactions
    rxn_names = [_natural_name(r["symptom"]) for r in relevant]
    rxn_str = _join_items(rxn_names)

    # Paragraph 1: Predicted reactions
    if len(relevant) == 1:
        p1 = f"Based on the information provided, the system predicts that {rxn_str} is a possible reaction following this vaccination."
    else:
        p1 = f"Based on the information provided, the system predicts that {rxn_str} are possible reactions following this vaccination."

    # Paragraph 2: Estimated timing window
    valid_onsets = [r["onset_hours"] for r in relevant if r["onset_hours"] is not None]
    if valid_onsets:
        min_h = max(1, round(min(valid_onsets)))
        max_h = max(1, round(max(valid_onsets)))
        if min_h == max_h:
            p2 = f"The estimated onset time is approximately {min_h} hours after vaccination, based on the current predictions."
        else:
            p2 = f"The estimated onset times are approximately {min_h}–{max_h} hours after vaccination, based on the current predictions."
    else:
        p2 = "The estimated onset times vary depending on the reaction, based on the current predictions."

    # Paragraph 3: Reminder
    p3 = "These are estimates, not guarantees. Your child may experience different reactions or no reaction at all."

    paragraphs = [p1, p2, p3]

    return {
        "title": "What does the forecast mean?",
        "paragraphs": paragraphs,
        "summary": " ".join(paragraphs),
        "relevant_reactions": [r["symptom"] for r in relevant],
    }


def _format_vaccine_display_name(vax_raw: str) -> str:
    """Format vaccine type into clean parent-friendly name."""
    vax_map = {
        "BCG1": "BCG (birth dose)",
        "BCG2": "BCG (revaccination dose)",
        "Pentavalent1,OPV1": "Pentavalent (1st dose) and OPV",
        "Pentavalent2,OPV2,IPV": "Pentavalent (2nd dose), OPV, and IPV",
        "Pentavalent3,OPV3": "Pentavalent (3rd dose) and OPV",
        "MMR1": "MMR (1st dose)",
        "MMR2": "MMR (2nd dose)",
        "JE": "Japanese Encephalitis (JE)",
        "DPT,OPV4": "DPT booster and OPV",
        "DT,OPV5": "DT booster and OPV",
    }
    return vax_map.get(vax_raw, vax_raw.replace(",", ", "))


# ────────────────────────────────────────────────────────────────────
# Section B – What influenced the forecast?
# ────────────────────────────────────────────────────────────────────

def generate_influence_explanation(
    xai_results: Dict[str, Any],
    probabilities: Dict[str, float],
    onset_dict: Dict[str, float],
    active_symptoms: List[str],
) -> Dict[str, Any]:
    """
    Generate Section B: clean, parent-friendly explanation of influences,
    tailored specifically to the given vaccine and child's profile.
    """
    symptom_expl = xai_results.get("symptom_explanations", {})
    onset_expl = xai_results.get("onset_explanations", {})
    input_features = xai_results.get("input_features", {})

    # Extract patient values
    age_raw = input_features.get("age_months", {}).get("value", 0.0)
    try:
        age_val = float(age_raw)
    except (ValueError, TypeError):
        age_val = 0.0

    vax_raw = str(input_features.get("vaccine_type", {}).get("value", "") or "")
    prev_rxn = str(input_features.get("previous_reaction", {}).get("value", "No") or "No")
    illness_val = str(input_features.get("current_illness", {}).get("value", "No") or "No")
    allergy_val = str(input_features.get("allergy", {}).get("value", "No") or "No")

    # Format vaccine display name
    vax_display = _format_vaccine_display_name(vax_raw)
    age_str = f"{int(age_val)}" if age_val == int(age_val) else f"{age_val}"

    # Calculate total importance per feature to rank factors for this specific vaccine
    feat_importance = {
        "vaccine_type": 0.0,
        "age_months": 0.0,
        "previous_reaction": 0.0,
        "other_health": 0.0,
    }

    for s, expl in symptom_expl.items():
        for c in expl.get("shap_contributions", []):
            feat = c.get("feature", "")
            contrib_abs = abs(c.get("contribution", 0.0))
            if feat in feat_importance:
                feat_importance[feat] += contrib_abs
            elif feat in ("current_illness", "allergy", "medication"):
                feat_importance["other_health"] += contrib_abs

    # 1. Vaccine type and dose description tailored to this vaccine (short and simple)
    vax_upper = vax_raw.upper()
    if "MMR" in vax_upper:
        vax_text = f"{vax_display} formulation primarily influences the likelihood of mild fever and skin rash."
    elif "BCG" in vax_upper:
        vax_text = f"{vax_display} formulation primarily influences localized redness and swelling at the injection site."
    elif "PENTA" in vax_upper:
        vax_text = f"{vax_display} formulation primarily contributed to predictions for mild fever and localized tenderness."
    elif "JE" in vax_upper:
        vax_text = f"{vax_display} formulation contributed to low-grade fever and mild localized tenderness."
    elif "DPT" in vax_upper or "DT" in vax_upper:
        vax_text = f"{vax_display} booster formulation primarily influences temporary injection-site tenderness."
    else:
        vax_text = f"{vax_display} vaccination information was a primary factor in the predicted reactions."

    # 2. Child's age description tailored to this milestone age (short and simple)
    if age_val <= 4.0:
        age_text = f"Lower likelihood of high fever with typical localized injection-site soreness at {age_str} months."
    elif age_val <= 12.0:
        age_text = f"Standard milestone responsiveness with moderate chance of mild fever at {age_str} months."
    else:
        age_text = f"Toddler age profile slightly increases the likelihood of mild fever at {age_str} months."

    # 3. Previous reaction history description tailored to patient (short and simple)
    if prev_rxn.lower() in ("yes", "y", "true", "1"):
        prev_text = "Prior reaction history slightly increases the predicted reaction probabilities."
    else:
        prev_text = "No prior reactions supports lower expected reaction probabilities across symptoms."

    # 4. Other health information description tailored to patient (short and simple)
    has_illness = illness_val.lower() in ("yes", "y", "true", "1")
    has_allergy = allergy_val.lower() in ("yes", "y", "true", "1")

    if has_illness and has_allergy:
        other_text = "Active current illness and allergy history contribute to slightly higher symptom likelihood."
    elif has_illness:
        other_text = "Active current illness slightly increases predicted fever likelihood."
    elif has_allergy:
        other_text = "Documented allergy history slightly influences skin sensitivity."
    else:
        other_text = "No current illness or known allergies supports a low baseline risk."

    # 5. Key Influencing Factor badges (matching Image 1 chips layout)
    badge_vax_map = {
        "BCG1": "BCG",
        "BCG2": "BCG Booster",
        "Pentavalent1,OPV1": "Pentavalent 1",
        "Pentavalent2,OPV2,IPV": "Pentavalent 2",
        "Pentavalent3,OPV3": "Pentavalent 3",
        "MMR1": "MMR 1",
        "MMR2": "MMR 2",
        "JE": "JE",
        "DPT,OPV4": "DPT Booster",
        "DT,OPV5": "DT Booster",
    }
    vax_badge_name = badge_vax_map.get(vax_raw, vax_raw.split(",")[0] if "," in vax_raw else vax_raw)

    has_prev_rxn = prev_rxn.lower() in ("yes", "y", "true", "1")
    med_val = str(input_features.get("medication", {}).get("value", "No") or "No")
    has_med = med_val.lower() in ("yes", "y", "true", "1")
    sex_val = str(input_features.get("sex", {}).get("value", "M") or "M")
    sex_str = "Male" if sex_val.upper().startswith("M") else "Female"

    # Age direction: if age contributes positively to fever/symptoms (like 12m or 18m) -> increases
    age_direction = "increases" if (age_val >= 9.0 or feat_importance.get("age_months", 0.0) > 0.4) else ("decreases" if age_val <= 4.0 else "neutral")

    key_factors = [
        {
            "feature": f"Vaccine Type ({vax_badge_name})",
            "direction": "neutral",
            "raw_feature": "vaccine_type",
        },
        {
            "feature": f"Child's Age ({age_str} months)",
            "direction": age_direction,
            "raw_feature": "age_months",
        },
        {
            "feature": "Active Current Illness" if has_illness else "No Current Illness",
            "direction": "increases" if has_illness else "decreases",
            "raw_feature": "current_illness",
        },
        {
            "feature": "Prior Reactions Reported" if has_prev_rxn else "No Prior Reactions",
            "direction": "increases" if has_prev_rxn else "decreases",
            "raw_feature": "previous_reaction",
        },
        {
            "feature": f"Child's Sex ({sex_str})",
            "direction": "neutral",
            "raw_feature": "sex",
        },
        {
            "feature": "Current Medications" if has_med else "No Medications",
            "direction": "increases" if has_med else "decreases",
            "raw_feature": "medication",
        },
        {
            "feature": "Known Allergies" if has_allergy else "No Known Allergies",
            "direction": "increases" if has_allergy else "decreases",
            "raw_feature": "allergy",
        },
    ]

    # Build factor candidate dictionary (Image 2 factors)
    candidate_factors = {
        "vaccine_type": {
            "label": "Vaccine type and dose",
            "text": vax_text,
        },
        "age_months": {
            "label": "Child's age",
            "text": age_text,
        },
        "previous_reaction": {
            "label": "Previous reaction history",
            "text": prev_text,
        },
        "other_health": {
            "label": "Other health information",
            "text": other_text,
        },
    }

    # Sort factors by genuine SHAP importance for this specific vaccine
    sorted_keys = sorted(
        candidate_factors.keys(),
        key=lambda k: feat_importance.get(k, 0.0),
        reverse=True,
    )

    factors = [candidate_factors[k] for k in sorted_keys]

    # Expected timing explanation
    timing_subtitle = "Expected timing"
    timing_text = (
        "The system estimates when each predicted reaction may begin. "
        "The estimated timing can differ between reactions and is not an exact time when symptoms will appear."
    )

    # Technical breakdown for optional technical toggle
    relevant_reactions = [s for s in active_symptoms if s != "no_reaction"]
    technical = _build_technical_detail(symptom_expl, onset_expl, relevant_reactions)

    return {
        "title": "What influenced the forecast?",
        "subtitle_factors": "Factors influencing the predicted reactions",
        "factors": factors,
        "key_factors": key_factors,
        "subtitle_timing": timing_subtitle,
        "timing_text": timing_text,
        "technical": technical,
    }


def _build_technical_detail(
    symptom_expl: Dict[str, Any],
    onset_expl: Dict[str, Any],
    relevant_reactions: List[str],
) -> Dict[str, Any]:
    """Build structured data for the optional technical explanation view."""
    tech = {"symptom_details": {}, "onset_details": {}}

    for s, expl in symptom_expl.items():
        contribs = expl.get("raw_contributions") or expl.get("shap_contributions", [])
        tech["symptom_details"][s] = {
            "display_name": _display(s),
            "explainer_type": expl.get("explainer_type", "TreeExplainer (CatBoost-native)"),
            "base_value": expl.get("base_value"),
            "predicted_probability": expl.get("predicted_probability"),
            "contributions": [
                {
                    "feature": c.get("readable_feature", c.get("feature")),
                    "raw_feature": c.get("feature"),
                    "value": c.get("value", ""),
                    "shap_value": round(float(c.get("contribution", 0.0)), 4),
                    "direction": c.get("direction", "neutral"),
                }
                for c in contribs[:6]
            ],
        }

    for onset_col, expl in onset_expl.items():
        contribs = expl.get("shap_contributions", [])
        symptom_name = onset_col.replace("_onset", "")
        tech["onset_details"][onset_col] = {
            "display_name": f"{_display(symptom_name)} onset",
            "explainer_type": expl.get("explainer_type", "Hybrid Stacking (TreeExplainer + RidgeCV Linear Combination)"),
            "base_value": expl.get("base_value"),
            "predicted_hours": expl.get("predicted_hours"),
            "contributions": [
                {
                    "feature": c.get("readable_feature", c.get("feature")),
                    "raw_feature": c.get("feature"),
                    "value": c.get("value", ""),
                    "shap_value": round(float(c.get("contribution", 0.0)), 4),
                    "direction": c.get("direction", "neutral"),
                }
                for c in contribs[:6]
            ],
        }

    return tech


# ────────────────────────────────────────────────────────────────────
# Section C – What should parents know?
# ────────────────────────────────────────────────────────────────────

def generate_parent_guidance(
    active_symptoms: List[str],
    risk_level: str,
) -> Dict[str, Any]:
    """
    Generate Section C: simple, cautious parent guidance.
    """
    paragraphs = [
        "Monitor your child after vaccination and follow the recommended post-vaccination care guidance. Contact a healthcare professional if you are concerned about your child's symptoms.",
        "Seek urgent medical care if your child develops serious symptoms, following the relevant medical guidance.",
    ]

    return {
        "title": "What should parents know?",
        "paragraphs": paragraphs,
        "summary": " ".join(paragraphs),
    }


# ────────────────────────────────────────────────────────────────────
# Main entry point
# ────────────────────────────────────────────────────────────────────

def generate_full_explanation(
    xai_results: Dict[str, Any],
    probabilities: Dict[str, float],
    onset_dict: Dict[str, float],
    active_symptoms: List[str],
    risk_level: str,
) -> Dict[str, Any]:
    """
    Generate the complete, simple three-section parent explanation.
    """
    return {
        "forecast_summary": generate_forecast_summary(
            probabilities, onset_dict, active_symptoms, risk_level,
        ),
        "influence_explanation": generate_influence_explanation(
            xai_results, probabilities, onset_dict, active_symptoms,
        ),
        "parent_guidance": generate_parent_guidance(
            active_symptoms, risk_level,
        ),
    }
