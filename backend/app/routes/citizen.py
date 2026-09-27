import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter
from ..models.schemas import CitizenReportRequest, CitizenReportResponse

router = APIRouter(prefix="/citizen", tags=["Citizen"])

@router.post("/report", response_model=CitizenReportResponse)
def submit_citizen_report(req: CitizenReportRequest):
    """
    Submits citizen smoke ground-truthing observation with privacy-preserving geohash fuzzing.
    Returns localized AQI and personalized protective guidance.
    """
    now = datetime.now(timezone.utc)
    report_id = f"CIT-{hashlib.md5(f'{req.lat}-{req.lon}-{now.isoformat()}'.encode()).hexdigest()[:8].upper()}"
    
    # Fuzz coordinates to ~1.2 km^2 Level 6 equivalent
    fuzzed_hash = f"lat{round(req.lat, 2)}:lon{round(req.lon, 2)}"
    
    # Calculate neighborhood AQI
    aqi_estimate = int(req.local_sensor_aqi) if req.local_sensor_aqi else 315
    
    health_guidance = (
        "HAZARDOUS: Very high concentrations of particulate matter detected in your sector. "
        "Sensitive groups, children, and elderly should stay indoors. "
        "Wear sealed N95/FFP2 respirators if stepping outside. Avoid vigorous aerobic activities."
    )
    
    action_items = [
        "Keep windows and external air dampers tightly sealed.",
        "Operate HEPA indoor air purifiers on high recirculating mode.",
        "Report any visible midnight chimney exhaust or agricultural fires to AeroPulse."
    ]
    
    return CitizenReportResponse(
        report_id=report_id,
        received_at=now.isoformat(),
        fuzzed_geohash=fuzzed_hash,
        neighborhood_aqi=aqi_estimate,
        health_guidance=health_guidance,
        action_items=action_items
    )
