from typing import List, Dict
from backend.app.interfaces.ml import IRiskEvaluator

SYMPTOM_DISPLAY_NAMES = {
    "fever": "Fever",
    "swelling": "Swelling",
    "redness": "Redness",
    "pain": "Pain",
    "rash": "Skin Rash",
    "no_reaction": "No Adverse Reaction",
    "others": "Other Symptoms (e.g. Irritability, Vomiting)"
}

class StandardClinicalRiskEvaluator(IRiskEvaluator):
    """
    Standard clinical risk stratification strategy.
    Adheres to Open/Closed Principle (OCP) - easy to extend or swap
    with alternate evaluators (e.g. PediatricRiskEvaluator) without modifying callers.
    """

    def evaluate_risk(
        self, 
        active_symptoms: List[str], 
        probabilities: Dict[str, float]
    ) -> str:
        if not active_symptoms:
            return "Low"

        severe_symptoms = [s for s in active_symptoms if s in ["fever", "rash", "others"]]
        highest_prob = max([probabilities.get(s, 0.0) for s in active_symptoms], default=0.0)

        if len(severe_symptoms) >= 2 or highest_prob >= 0.85:
            return "High"
        elif len(active_symptoms) >= 2 or highest_prob >= 0.65:
            return "Medium"
        else:
            return "Low"

    def generate_summary(
        self,
        risk_level: str,
        active_symptoms: List[str],
        probabilities: Dict[str, float],
        onsets: Dict[str, float]
    ) -> str:
        if not active_symptoms:
            return "No adverse reactions predicted. Patient is likely to tolerate the vaccination well."

        symptom_phrases = []
        for s in active_symptoms:
            p_pct = int(round(probabilities.get(s, 0.0) * 100))
            o_hr = onsets.get(f"{s}_onset")
            o_str = f" within ~{o_hr:.1f} hrs" if o_hr is not None else ""
            display_name = SYMPTOM_DISPLAY_NAMES.get(s, s.capitalize())
            symptom_phrases.append(f"{display_name} ({p_pct}% chance{o_str})")

        return f"Adverse reaction risk detected ({risk_level} Risk). Expected symptoms: {', '.join(symptom_phrases)}."
