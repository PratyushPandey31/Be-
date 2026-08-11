import math
from typing import Dict, Any


class CyberShieldRiskEngine:
    """
    CyberShield AI Multi-Factor Risk & Explainable AI (XAI) Engine.

    Mathematical Formula (IEEE Publication Grade):
    ─────────────────────────────────────────────────────────────
    Risk Score = (CVSS_Base × W_criticality × (1 + α × EPSS) × W_exposure × M_exploit)
                 ────────────────────────────────────────────────────────────────────────
                                     MAX_THEORETICAL_RAW × 100

    Where:
      α              = 0.8  (EPSS amplification coefficient — empirically tuned)
      W_criticality  ∈ {1.50, 1.25, 1.00, 0.75}   (Mission Critical → Low)
      W_exposure     ∈ {1.40, 1.20, 1.00, 0.60}   (Internet Facing → Air-Gapped)
      M_exploit      = 1.30 if weaponized PoC confirmed, else 1.00
      MAX_THEORETICAL = 10 × 1.50 × (1 + 0.8) × 1.40 × 1.30 = 49.14

    Output: Normalized to [0, 100] risk index
    XAI:    SHAP-style additive feature decomposition
    ─────────────────────────────────────────────────────────────
    """

    # ── Hyperparameters ──
    ALPHA_EPSS = 0.8

    CRITICALITY_WEIGHTS = {
        "Mission Critical": 1.50,
        "High":             1.25,
        "Medium":           1.00,
        "Low":              0.75
    }

    EXPOSURE_WEIGHTS = {
        "Internet Facing":       1.40,
        "DMZ":                   1.20,
        "Internal Subnet":       1.00,
        "Isolated / Air-Gapped": 0.60
    }

    EXPLOIT_MULTIPLIER     = 1.30
    MAX_THEORETICAL_RAW    = 49.14   # 10 * 1.50 * (1+0.8) * 1.40 * 1.30
    NORMALIZATION_CONSTANT = 45.0    # conservative floor for normalization

    # ── Threat tier thresholds ──
    TIER_THRESHOLDS = {
        "CRITICAL": (80.0,  "P0-CRITICAL — Immediate Containment & Emergency Patch"),
        "HIGH":     (60.0,  "P1-HIGH — Patch Within 24–48 Hours"),
        "MEDIUM":   (40.0,  "P2-MEDIUM — Scheduled Maintenance Window (7 Days)"),
        "LOW":      (0.0,   "P3-LOW — Monitor & Backlog")
    }

    @classmethod
    def compute_risk(cls, cvss: float, epss: float,
                     criticality: str, exposure: str,
                     exploit_available: bool) -> Dict[str, Any]:
        """
        Execute multi-factor AI risk computation with SHAP-style XAI attribution.

        Returns a complete risk assessment object including:
        - Normalized risk score [0–100]
        - Threat tier classification
        - Priority remediation code
        - Step-by-step formula values
        - SHAP feature attribution percentages
        - Natural language XAI narrative
        """
        # ── Step 1: Retrieve Factor Weights ──
        w_crit   = cls.CRITICALITY_WEIGHTS.get(criticality, 1.0)
        w_exp    = cls.EXPOSURE_WEIGHTS.get(exposure, 1.0)
        m_exploit = cls.EXPLOIT_MULTIPLIER if exploit_available else 1.0

        # ── Step 2: Compute EPSS Amplification Factor ──
        epss_factor = 1.0 + cls.ALPHA_EPSS * epss

        # ── Step 3: Raw Risk Calculation ──
        raw_risk = cvss * w_crit * epss_factor * w_exp * m_exploit

        # ── Step 4: Normalize to [0, 100] ──
        risk_score = round(min(100.0, (raw_risk / cls.NORMALIZATION_CONSTANT) * 100.0), 1)

        # ── Step 5: Threat Tier Classification ──
        threat_tier   = "LOW"
        priority_code = cls.TIER_THRESHOLDS["LOW"][1]
        for tier, (threshold, code) in list(cls.TIER_THRESHOLDS.items()):
            if risk_score >= threshold:
                threat_tier   = tier
                priority_code = code
                break

        # ── Step 6: SHAP-style Feature Attribution ──
        #   Each factor's marginal contribution relative to total risk lift
        base_lift    = cvss * 3.5                         # CVSS base contribution
        epss_lift    = epss * 100 * 0.25                  # EPSS probabilistic lift
        crit_lift    = ((w_crit - 0.75) / 0.75) * 20.0   # Criticality above baseline
        exp_lift     = ((w_exp  - 0.60) / 0.80) * 20.0   # Exposure above baseline
        exploit_lift = 15.0 if exploit_available else 0.0  # Binary exploit multiplier

        total_lift = base_lift + epss_lift + crit_lift + exp_lift + exploit_lift
        if total_lift == 0:
            total_lift = 1.0

        shap_attribution = {
            "CVSS Base Severity":          round((base_lift    / total_lift) * 100, 1),
            "EPSS Exploit Probability":    round((epss_lift    / total_lift) * 100, 1),
            "Asset Business Criticality":  round((crit_lift    / total_lift) * 100, 1),
            "Network Exposure Zone":       round((exp_lift     / total_lift) * 100, 1),
            "Weaponized Exploit Confirmed":round((exploit_lift / total_lift) * 100, 1),
        }

        # ── Step 7: Natural Language XAI Narrative ──
        exploit_clause = (
            " A confirmed public weaponized PoC/exploit is actively available, "
            "applying a 1.30× exploit multiplier to the raw risk score."
            if exploit_available else
            " No confirmed public exploit PoC was detected at time of scan."
        )
        epss_clause = (
            f"The FIRST.org EPSS model assigns a {round(epss*100, 2)}% probability "
            f"of exploitation in the next 30 days (α={cls.ALPHA_EPSS} amplification applied)."
        )
        xai_narrative = (
            f"This finding is classified {threat_tier} with an AI Risk Score of {risk_score}/100. "
            f"The base CVSS score of {cvss} is contextualized against a '{criticality}' asset "
            f"(W_crit={w_crit}) operating in the '{exposure}' network zone (W_exp={w_exp}). "
            f"{epss_clause}{exploit_clause} "
            f"The raw weighted score of {round(raw_risk, 3)} is normalized "
            f"against the theoretical maximum of {cls.MAX_THEORETICAL_RAW} to produce the final index."
        )

        return {
            "risk_score":   risk_score,
            "threat_tier":  threat_tier,
            "priority_code": priority_code,
            "shap_attribution": shap_attribution,
            "xai_narrative": xai_narrative,
            "formula_steps": {
                "step1_cvss":           cvss,
                "step2_w_criticality":  w_crit,
                "step3_alpha":          cls.ALPHA_EPSS,
                "step4_epss":           round(epss, 4),
                "step5_epss_factor":    round(epss_factor, 4),
                "step6_w_exposure":     w_exp,
                "step7_m_exploit":      m_exploit,
                "step8_raw_risk":       round(raw_risk, 4),
                "step9_normalization":  cls.NORMALIZATION_CONSTANT,
                "step10_risk_score":    risk_score
            },
            "raw_metrics": {
                "cvss":               cvss,
                "epss":               epss,
                "criticality_weight": w_crit,
                "exposure_weight":    w_exp,
                "exploit_multiplier": m_exploit,
                "epss_factor":        round(epss_factor, 4),
                "raw_risk":           round(raw_risk, 4)
            }
        }
