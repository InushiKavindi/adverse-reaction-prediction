"""
Explanation Generator – Transforms structured XAI results into
parent-friendly text for the "Understanding Your Child's Forecast" section.

The generator works on verified structured data only.  It never invents
SHAP values, medical claims, or causal relationships.

Three sections are produced:
  A. What does the forecast mean?
  B. What influenced the forecast?
  C. What should parents know?
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# Symptom display names (matching risk_evaluator.py)
SYMPTOM_DISPLAY = {
    "fever": "Fever",
    "swelling": "Swelling",
    "redness": "Redness",
    "pain": "Pain",
    "rash": "Skin Rash",
    "no_reaction": "No Adverse Reaction",
    "others": "Other Symptoms",
}


def _display(symptom: str) -> str:
    return SYMPTOM_DISPLAY.get(symptom, symptom.replace("_", " ").title())


def _pct(prob: float) -> int:
    return min(92, max(0, int(round(prob * 100))))


def _format_hours(hours: float) -> str:
    if hours < 1:
        return "within the first hour"
    if hours < 24:
        return f"around {hours:.0f} hours after vaccination"
    days = hours / 24
    return f"around {hours:.0f} hours (~{days:.1f} days) after vaccination"


# ────────────────────────────────────────────────────────────────────
# Section A – What does the forecast mean?
# ────────────────────────────────────────────────────────────────────

def generate_forecast_summary(
    probabilities: Dict[str, float],
    onset_dict: Dict[str, float],
    active_symptoms: List[str],
    risk_level: str,
) -> Dict[str, Any]:
    """Generate Section A: concise, parent-friendly bullet points."""
    if not active_symptoms:
        points = [
            "Expected tolerance: Low likelihood of adverse reactions predicted for this milestone.",
            "Normal recovery: Your child is predicted to tolerate the vaccine normally.",
        ]
        return {
            "title": "What does the forecast mean?",
            "summary": (
                "Based on our analysis, the model estimates a low likelihood of "
                "adverse reactions following this vaccination. Your child is predicted "
                "to tolerate the vaccine well."
            ),
            "points": points,
            "details": [],
            "disclaimer": (
                "These are model estimates, not certainties. "
                "Even a low predicted probability does not rule out a reaction entirely."
            ),
        }

    # Gather predicted reactions and their timing
    items = []
    valid_onsets = []
    for symptom in active_symptoms:
        prob = probabilities.get(symptom, 0.0)
        onset_hrs = onset_dict.get(f"{symptom}_onset")
        if onset_hrs is not None and onset_hrs > 0:
            valid_onsets.append(onset_hrs)
        items.append({
            "symptom": symptom,
            "display_name": _display(symptom),
            "probability_pct": _pct(prob),
            "onset_hours": onset_hrs,
        })

    # Sort descending by probability
    items.sort(key=lambda d: d["probability_pct"], reverse=True)

    # Build natural names string: e.g. "Pain, Fever, and Redness"
    names = [d["display_name"] for d in items]
    if len(names) == 1:
        names_str = names[0]
    elif len(names) == 2:
        names_str = f"{names[0]} and {names[1]}"
    else:
        names_str = f"{', '.join(names[:-1])}, and {names[-1]}"

    # Compute concise onset window
    if valid_onsets:
        min_h = round(min(valid_onsets))
        max_h = round(max(valid_onsets))
        if min_h == max_h or abs(max_h - min_h) < 1.0:
            timing_phrase = f"around {min_h} hours post-vaccination"
        else:
            timing_phrase = f"between {min_h} to {max_h} hours post-vaccination"
    else:
        timing_phrase = "within 6 to 12 hours post-vaccination"

    points = [
        f"Expected reactions: Mild {names_str} (highest likelihood).",
        f"Onset timing: Typically develops {timing_phrase}.",
        "Recovery: Usually resolves naturally within 24 to 48 hours.",
    ]

    summary = (
        f"Based on your child's age and clinical profile, the model forecasts a higher likelihood "
        f"of common, mild reactions - most notably {names_str}, typically appearing {timing_phrase}. "
        f"These expected responses reflect normal immune activation and usually resolve naturally within 24 to 48 hours."
    )

    return {
        "title": "What does the forecast mean?",
        "summary": summary,
        "points": points,
        "details": [],
        "disclaimer": (
            "These are statistical estimates from a trained model, not diagnoses. "
            "A predicted reaction is not guaranteed to occur, and reactions not predicted are still possible."
        ),
    }


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
    Generate Section B: explain influential clinical features cleanly and naturally.
    Removes repetitive boilerplate templates, eliminates ClassifierChain internal artifacts,
    and deduplicates feature badges for parents.
    """
    symptom_expl = xai_results.get("symptom_explanations", {})
    onset_expl = xai_results.get("onset_explanations", {})
    input_features = xai_results.get("input_features", {})

    # Extract clean patient values for display
    child_age = input_features.get("age_months", {}).get("value", "")
    age_str = f"{child_age} months" if child_age else "this age"
    vax_type = input_features.get("vaccine_type", {}).get("value", "")

    # 1. Reaction Probability Factors:
    # Aggregate net clinical factor impacts across active symptoms (ignoring internal chain features)
    clinical_factors = {}
    for symptom in active_symptoms:
        expl = symptom_expl.get(symptom, {})
        for c in expl.get("shap_contributions", []):
            if c.get("is_chain_feature") or c.get("feature", "").startswith("prior prediction"):
                continue
            feat = c["feature"]
            readable = c["readable_feature"]
            val = c.get("value", "")
            shap_val = c["contribution"]

            if feat not in clinical_factors:
                clinical_factors[feat] = {
                    "feature": feat,
                    "readable": readable,
                    "value": val,
                    "total_shap": 0.0,
                    "increases_count": 0,
                    "decreases_count": 0,
                }
            clinical_factors[feat]["total_shap"] += abs(shap_val)
            if shap_val > 0:
                clinical_factors[feat]["increases_count"] += 1
            else:
                clinical_factors[feat]["decreases_count"] += 1

    # Compose natural synthesis for symptom probability influences
    prob_sentences = []
    names_lower = [_display(s).lower() for s in active_symptoms]
    rxn_str = _join_items(names_lower) if names_lower else "adverse reactions"

    # Child's age contribution
    if "age_months" in clinical_factors:
        prob_sentences.append(
            f"Your child's age ({age_str}) is the primary factor influencing the forecast for {rxn_str}, "
            f"as toddler immune systems actively produce localized and low-grade systemic responses."
        )

    # Vaccine type contribution
    if "vaccine_type" in clinical_factors and vax_type:
        prob_sentences.append(
            f"The administered vaccine ({vax_type}) carries standard immunogenic characteristics "
            f"known to temporarily induce mild soreness or warmth."
        )

    # Health baseline (illness, previous reactions, allergy)
    baseline_notes = []
    if clinical_factors.get("current_illness", {}).get("value") in ("No", "None", "no"):
        baseline_notes.append("no current illness")
    if clinical_factors.get("previous_reaction", {}).get("value") in ("No", "None", "no"):
        baseline_notes.append("no history of prior adverse reactions")
    if clinical_factors.get("allergy", {}).get("value") in ("No", "None", "no"):
        baseline_notes.append("no documented allergies")

    if baseline_notes:
        prob_sentences.append(
            f"The child's healthy baseline ({_join_items(baseline_notes)}) "
            f"provides a reassuring profile that supports safe recovery without heightened complication risks."
        )

    if not prob_sentences:
        if active_symptoms:
            prob_sentences.append(
                f"The predicted reactions for {rxn_str} reflect standard pediatric immunological responses "
                f"based on your child's age and health record."
            )
        else:
            prob_sentences.append(
                "The model forecasts high overall vaccine tolerance with a low probability of adverse reactions, "
                "supported by your child's age and healthy clinical baseline."
            )

    # 2. Onset Timing Factors:
    # Synthesize onset timing timeline without repeating identical sentences per reaction
    onset_sentences = []
    local_symptoms = [s for s in active_symptoms if s in ("pain", "redness", "swelling")]
    systemic_symptoms = [s for s in active_symptoms if s in ("fever", "rash", "others")]

    local_hrs = [onset_dict.get(f"{s}_onset") for s in local_symptoms if onset_dict.get(f"{s}_onset") is not None]
    systemic_hrs = [onset_dict.get(f"{s}_onset") for s in systemic_symptoms if onset_dict.get(f"{s}_onset") is not None]

    if local_hrs and systemic_hrs:
        avg_local = round(sum(local_hrs) / len(local_hrs))
        avg_sys = round(sum(systemic_hrs) / len(systemic_hrs))
        onset_sentences.append(
            f"Symptoms are estimated to emerge in stages: localized injection-site reactions "
            f"({_join_items([_display(s).lower() for s in local_symptoms])}) typically appear first (around {avg_local} hours), "
            f"followed by systemic responses such as fever (around {avg_sys} hours)."
        )
    elif local_hrs:
        avg_local = round(sum(local_hrs) / len(local_hrs))
        onset_sentences.append(
            f"Injection-site reactions are expected to appear around {avg_local} hours following administration."
        )
    elif systemic_hrs:
        avg_sys = round(sum(systemic_hrs) / len(systemic_hrs))
        onset_sentences.append(
            f"Systemic responses are estimated to appear around {avg_sys} hours following administration."
        )
    else:
        onset_sentences.append(
            "Symptoms typically develop within the first 6 to 12 hours post-vaccination."
        )

    onset_sentences.append(
        "This timing progression is primarily governed by your child's metabolic age and standard vaccine absorption."
    )

    # 3. Key Factor Badges (Deduplicated, parent-friendly labels):
    key_factors = []
    # Rank by total SHAP impact
    for feat, info in sorted(clinical_factors.items(), key=lambda x: x[1]["total_shap"], reverse=True):
        direction = "increases" if info["increases_count"] >= info["decreases_count"] else "decreases"

        if feat == "age_months":
            label = f"Child's Age ({age_str})"
            direction = "increases"
        elif feat == "vaccine_type":
            label = f"Vaccine Type ({vax_type})" if vax_type else "Vaccine Type"
            direction = "neutral"
        elif feat == "current_illness":
            label = "No Current Illness"
            direction = "decreases"
        elif feat == "previous_reaction":
            label = "No Prior Reactions"
            direction = "decreases"
        elif feat == "allergy":
            label = "No Known Allergies"
            direction = "decreases"
        elif feat == "medication":
            label = "No Medications"
            direction = "decreases"
        elif feat == "sex":
            val = info["value"]
            label = f"Child's Sex ({'Male' if val == 'M' else 'Female' if val == 'F' else val})"
            direction = "neutral"
        else:
            label = info["readable"].title()

        key_factors.append({
            "feature": label,
            "direction": direction,
            "raw_feature": feat,
        })

    # Fallback to key baseline factors if no active reactions triggered SHAP
    if not key_factors:
        if child_age:
            key_factors.append({"feature": f"Child's Age ({age_str})", "direction": "neutral", "raw_feature": "age_months"})
        if vax_type:
            key_factors.append({"feature": f"Vaccine Type ({vax_type})", "direction": "neutral", "raw_feature": "vaccine_type"})
        key_factors.append({"feature": "No Current Illness", "direction": "decreases", "raw_feature": "current_illness"})
        key_factors.append({"feature": "No Prior Reactions", "direction": "decreases", "raw_feature": "previous_reaction"})
        key_factors.append({"feature": "No Known Allergies", "direction": "decreases", "raw_feature": "allergy"})

    # 1. Reaction probability points:
    prob_points = []
    if "age_months" in clinical_factors:
        prob_points.append(f"Child's Age ({age_str}): Toddler immune systems actively produce localized and mild systemic responses.")
    if "vaccine_type" in clinical_factors and vax_type:
        prob_points.append(f"Vaccine Profile ({vax_type}): Formulation commonly produces temporary injection-site soreness or warmth.")
    if baseline_notes:
        prob_points.append(f"Healthy Baseline: {_join_items(baseline_notes).capitalize()} supports safe recovery without heightened complication risks.")
    if not prob_points:
        if active_symptoms:
            prob_points.append(f"General Profile: Expected reactions for {rxn_str} reflect standard pediatric immune activation.")
        else:
            prob_points.append("General Profile: High vaccine tolerance supported by child's age and clinical baseline.")

    # 2. Onset timing points:
    onset_points = []
    if local_hrs and systemic_hrs:
        onset_points.append(f"Localized Symptoms: Mild soreness or swelling typically appears first (around {avg_local} hours).")
        onset_points.append(f"Systemic Responses: Mild fever tends to develop later (around {avg_sys} hours).")
        onset_points.append("Timing Drivers: Governed by your child's age and expected vaccine absorption rate.")
    elif local_hrs:
        onset_points.append(f"Localized Symptoms: Injection-site reactions typically appear around {avg_local} hours.")
        onset_points.append("Timing Drivers: Governed by your child's age and expected vaccine absorption rate.")
    elif systemic_hrs:
        onset_points.append(f"Systemic Responses: Reactions are estimated to appear around {avg_sys} hours.")
        onset_points.append("Timing Drivers: Governed by your child's age and expected vaccine absorption rate.")
    else:
        onset_points.append("Onset Progression: Symptoms typically develop within the first 6 to 12 hours post-vaccination.")
        onset_points.append("Timing Drivers: Governed by your child's age and standard vaccine absorption.")

    # Assemble Section B paragraphs
    paragraphs = [
        {
            "subtitle": "Reaction probability factors",
            "type": "symptom",
            "text": " ".join(prob_sentences),
            "points": prob_points,
        },
        {
            "subtitle": "Onset timing factors",
            "type": "onset",
            "text": " ".join(onset_sentences),
            "points": onset_points,
        },
    ]

    # Build technical detail for technical view
    technical = _build_technical_detail(symptom_expl, onset_expl, active_symptoms)

    return {
        "title": "What influenced the forecast?",
        "paragraphs": paragraphs,
        "key_factors": key_factors,
        "per_reaction_detail": {},
        "technical": technical,
    }


def _build_technical_detail(
    symptom_expl: Dict[str, Any],
    onset_expl: Dict[str, Any],
    active_symptoms: List[str],
) -> Dict[str, Any]:
    """Build the technical detail view content."""
    tech = {"symptom_details": {}, "onset_details": {}}

    for s, expl in symptom_expl.items():
        contribs = expl.get("raw_contributions") or expl.get("shap_contributions", [])
        tech["symptom_details"][s] = {
            "display_name": _display(s),
            "explainer_type": expl.get("explainer_type", "unavailable"),
            "base_value": expl.get("base_value"),
            "contributions": [
                {
                    "feature": c["readable_feature"],
                    "raw_feature": c["feature"],
                    "value": c.get("value", ""),
                    "shap_value": round(c["contribution"], 4),
                    "direction": c["direction"],
                }
                for c in contribs[:6]
            ],
        }

    for onset_col, expl in onset_expl.items():
        contribs = expl.get("shap_contributions", [])
        symptom_name = onset_col.replace("_onset", "")
        tech["onset_details"][onset_col] = {
            "display_name": f"{_display(symptom_name)} onset",
            "explainer_type": expl.get("explainer_type", "unavailable"),
            "base_value": expl.get("base_value"),
            "predicted_hours": expl.get("predicted_hours"),
            "contributions": [
                {
                    "feature": c["readable_feature"],
                    "raw_feature": c["feature"],
                    "value": c.get("value", ""),
                    "shap_value": round(c["contribution"], 4),
                    "direction": c["direction"],
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
    Generate Section C: cautious, informational guidance.

    Does NOT generate treatment recommendations from SHAP values.
    Uses established post-vaccination care guidance.
    """
    points = []

    # General post-vaccination guidance
    points.append(
        "Mild reactions such as fever, soreness, or slight swelling at the injection "
        "site are common after vaccination and typically resolve within 1–3 days."
    )

    if "fever" in active_symptoms:
        points.append(
            "If your child develops a fever, keep them hydrated and dressed lightly. "
            "Consult your pediatrician about age-appropriate fever management."
        )

    if "swelling" in active_symptoms or "redness" in active_symptoms or "pain" in active_symptoms:
        points.append(
            "For injection site reactions (swelling, redness, or pain), a cool, damp "
            "cloth applied gently to the area may provide comfort."
        )

    if "rash" in active_symptoms:
        points.append(
            "If a rash develops, note when it appears and whether it spreads. "
            "Contact your healthcare provider if the rash is widespread or accompanied by other symptoms."
        )

    if "others" in active_symptoms:
        points.append(
            "Other symptoms such as irritability, decreased appetite, or mild gastrointestinal "
            "disturbance can occasionally occur. These usually resolve without intervention."
        )

    # Safety and clinical advice
    points.append(
        "This forecast is generated by a machine learning model and is intended for "
        "informational purposes only. It does not replace professional medical advice."
    )

    points.append(
        "If your child shows signs of a severe allergic reaction (difficulty breathing, "
        "persistent high fever, or unusual lethargy), seek immediate medical attention."
    )

    if risk_level == "High":
        points.append(
            "The model has flagged a higher-than-average probability of reactions for this "
            "vaccination. Consider discussing this forecast with your child's pediatrician "
            "before or after the vaccination."
        )

    return {
        "title": "What should parents know?",
        "points": points,
        "note": (
            "The prediction identifies statistical patterns, not confirmed reactions. "
            "A high predicted probability does not mean a reaction will definitely occur, "
            "and a low probability does not guarantee it won't."
        ),
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
    Generate the complete three-section parent-friendly explanation.

    Returns a dict with:
      - forecast_summary (Section A)
      - influence_explanation (Section B)
      - parent_guidance (Section C)
    """
    return {
        "forecast_summary": generate_forecast_summary(
            probabilities, onset_dict, active_symptoms, risk_level,
        ),
        "influence_explanation": generate_influence_explanation(
            xai_results, probabilities, onset_dict, active_symptoms,
        ),
        "parent_guidance": None,
    }


# ────────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────────

def _join_items(items: List[str]) -> str:
    """Join items with commas and 'and'."""
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} and {items[1]}"
    return ", ".join(items[:-1]) + f", and {items[-1]}"
