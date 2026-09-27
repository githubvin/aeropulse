from app.models.schemas import CAPAlertRequest
from app.models.cap_protocol import generate_cap_alert

def test_generate_cap_alert():
    req = CAPAlertRequest(
        corridor_id="indo-gangetic",
        event_type="Trans-Boundary Hazardous Smog Influx",
        severity="Severe",
        urgency="Immediate",
        headline="Severe Industrial Smog Influx Alert",
        primary_source_id="FAC-IN-001",
        recipient_jurisdictions=["National Capital Region"]
    )
    alert = generate_cap_alert(req)
    assert alert.status == "DISPATCHED_BILATERAL"
    assert "urn:oasis:names:tc:emergency:cap:1.2" in alert.cap_alert_id
    assert "<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">" in alert.cap_xml
    assert "Severe Industrial Smog Influx Alert" in alert.cap_xml
    assert len(alert.sha256_hash) == 64
    assert "hi" in alert.multilingual_advisories
    assert "zh" in alert.multilingual_advisories
