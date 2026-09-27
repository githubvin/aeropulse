import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List
from xml.sax.saxutils import escape
from .schemas import CAPAlertRequest, CAPAlertResponse
from ..services.gemini_service import generate_multilingual_advisories

def build_oasis_cap_xml(
    alert_id: str,
    sent_iso: str,
    headline: str,
    event_type: str,
    severity: str,
    urgency: str,
    sender: str,
    description: str,
    instruction: str,
    corridor_name: str
) -> str:
    """Builds standard OASIS CAP v1.2 compliant XML."""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>{escape(alert_id)}</identifier>
  <sender>{escape(sender)}</sender>
  <sent>{escape(sent_iso)}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <code>BRICS-TRANSBOUNDARY-ENVIRONMENTAL-ACTION</code>
  <info>
    <category>Env</category>
    <event>{escape(event_type)}</event>
    <urgency>{escape(urgency)}</urgency>
    <severity>{escape(severity)}</severity>
    <certainty>Observed</certainty>
    <eventCode>
      <valueName>AeroPulseCode</valueName>
      <value>TRANSBOUNDARY-HAZARDOUS-SMOG</value>
    </eventCode>
    <headline>{escape(headline)}</headline>
    <description>{escape(description)}</description>
    <instruction>{escape(instruction)}</instruction>
    <area>
      <areaDesc>{escape(corridor_name)}</areaDesc>
    </area>
  </info>
</alert>"""

def generate_cap_alert(req: CAPAlertRequest) -> CAPAlertResponse:
    now = datetime.now(timezone.utc)
    date_str = now.strftime("%Y%m%d")
    short_uuid = hashlib.md5(f"{req.corridor_id}-{now.isoformat()}".encode()).hexdigest()[:8].upper()
    alert_id = f"urn:oasis:names:tc:emergency:cap:1.2:AEROPULSE-{date_str}-{short_uuid}"
    sent_iso = now.isoformat()
    
    sender = "operations@aeropulse-brics.org"
    desc = (
        f"AeroPulse automated detection flagged trans-boundary plume advection across {req.corridor_id}. "
        f"Culprit source identification: {req.primary_source_id or 'Cluster Originating Upstream'}. "
        f"Urgent bilateral intervention required to curtail emissions at source and initiate downstream protection."
    )
    instruction = (
        "Upwind Authority: Issue immediate emergency inspection notice and curtail stack firing rate. "
        "Downwind Health Authority: Alert hospitals, trigger smog cannons, and restrict outdoor school activities."
    )
    
    xml_content = build_oasis_cap_xml(
        alert_id=alert_id,
        sent_iso=sent_iso,
        headline=req.headline,
        event_type=req.event_type,
        severity=req.severity,
        urgency=req.urgency,
        sender=sender,
        description=desc,
        instruction=instruction,
        corridor_name=req.corridor_id.upper()
    )
    
    sha256 = hashlib.sha256(xml_content.encode()).hexdigest()
    multilingual = generate_multilingual_advisories(req.headline, req.corridor_id.replace("-", " ").title())
    
    return CAPAlertResponse(
        status="DISPATCHED_BILATERAL",
        cap_alert_id=alert_id,
        dispatched_at=sent_iso,
        upwind_action_endpoint=f"https://env-regulator.gov/api/v1/interventions/{req.corridor_id}/ack",
        downwind_health_endpoint=f"https://disaster-response.gov/api/v1/alerts/{req.corridor_id}/ack",
        cap_xml=xml_content,
        sha256_hash=sha256,
        multilingual_advisories=multilingual
    )
