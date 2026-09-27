from fastapi import APIRouter
from typing import List
from ..models.schemas import CAPAlertRequest, CAPAlertResponse
from ..models.cap_protocol import generate_cap_alert

router = APIRouter(prefix="/alerts", tags=["Alerts"])

_ACTIVE_ALERTS: List[CAPAlertResponse] = []

@router.post("/dispatch", response_model=CAPAlertResponse)
def dispatch_cap_alert(req: CAPAlertRequest):
    """Generates and dispatches an OASIS CAP v1.2 Bilateral Alert."""
    alert_resp = generate_cap_alert(req)
    _ACTIVE_ALERTS.insert(0, alert_resp)
    return alert_resp

@router.get("/active", response_model=List[CAPAlertResponse])
def get_active_alerts():
    """Returns active cross-border alerts."""
    if not _ACTIVE_ALERTS:
        # Pre-populate with default active alert for showcase
        sample = generate_cap_alert(CAPAlertRequest(
            corridor_id="indo-gangetic",
            event_type="Trans-Boundary Hazardous Smog Influx",
            severity="Severe",
            urgency="Immediate",
            headline="Severe Trans-Boundary Industrial Smog Influx Expected Within 14 Hours",
            primary_source_id="FAC-IN-001",
            recipient_jurisdictions=["National Capital Region", "Downwind Border Districts"]
        ))
        _ACTIVE_ALERTS.append(sample)
    return _ACTIVE_ALERTS
