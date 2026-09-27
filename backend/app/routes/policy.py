from fastapi import APIRouter
from ..models.schemas import PolicySimulationRequest, PolicySimulationResponse

router = APIRouter(prefix="/policy", tags=["Policy"])

@router.post("/simulate", response_model=PolicySimulationResponse)
def simulate_policy_intervention(req: PolicySimulationRequest):
    """
    Evaluates cross-border 'What-If' emission curtailment scenarios.
    Recalculates downwind peak PM2.5 and boundary mass flux reduction.
    """
    base_pm25 = 385.0
    
    # Weighted contribution of sectors to total downwind loading
    agri_weight = 0.42
    ind_weight = 0.38
    traffic_weight = 0.20
    
    agri_reduction = (req.agricultural_curtailment_pct / 100.0) * agri_weight
    ind_reduction = (req.industrial_curtailment_pct / 100.0) * ind_weight
    traffic_reduction = (req.traffic_restriction_pct / 100.0) * traffic_weight
    
    total_reduction_ratio = agri_reduction + ind_reduction + traffic_reduction
    net_pct = round(total_reduction_ratio * 100.0, 1)
    
    projected_pm25 = round(base_pm25 * (1.0 - total_reduction_ratio), 1)
    flux_reduced_kg_hr = round(1420.5 * total_reduction_ratio, 1)
    hosp_prevented = int(total_reduction_ratio * 2400)
    
    summary = (
        f"Implementing a {req.agricultural_curtailment_pct}% agricultural burning pause, "
        f"{req.industrial_curtailment_pct}% industrial stack curtailment, and "
        f"{req.traffic_restriction_pct}% traffic corridor diversion achieves a {net_pct}% "
        f"net reduction in peak PM2.5 and removes {flux_reduced_kg_hr} kg/hr of toxic mass from the border transport corridor."
    )
    
    return PolicySimulationResponse(
        corridor_id=req.corridor_id,
        baseline_peak_pm25=base_pm25,
        projected_peak_pm25=projected_pm25,
        net_reduction_pct=net_pct,
        cross_border_flux_reduced_kg_hr=flux_reduced_kg_hr,
        estimated_hospital_admissions_prevented=hosp_prevented,
        curtailment_plan_summary=summary
    )
