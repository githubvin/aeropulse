from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Coordinates(BaseModel):
    lat: float
    lon: float

class VisualInspectionResult(BaseModel):
    smoke_detected: bool = True
    smoke_type: str = "Industrial Coal/Soot"
    visual_opacity_pct: int = Field(ge=0, le=100, default=80)
    plume_color_signature: str = "Dark Gray/Black"
    visual_confidence_pct: int = Field(ge=0, le=100, default=88)
    features_identified: List[str] = Field(default_factory=list)

class ReverseTrajectoryResult(BaseModel):
    curvilinear_distance_km: float
    transit_time_hours: float
    mean_wind_speed_kmh: float
    mean_wind_direction_deg: float
    trajectory_path: List[List[float]]  # [[lon, lat], ...]
    upwind_cone_polygon: List[List[float]]  # [[lon, lat], ...]

class CandidateFacility(BaseModel):
    facility_id: str
    name: str
    category: str  # Thermal Power, Brick Kiln, Refinery, Smelter, Biomass Cluster
    fuel_type: str
    coordinates: List[float]  # [lon, lat]
    distance_km: float
    transit_time_hrs: float
    match_score_pct: int
    reasoning: str
    active_status: str = "Active High-Emission"

class AttributionResponse(BaseModel):
    status: str = "success"
    corridor_id: str
    observation: Dict[str, Any]
    visual_inspection: VisualInspectionResult
    reverse_trajectory: ReverseTrajectoryResult
    candidate_sources_found: int
    ranked_culprits: List[CandidateFacility]
    cross_border_jurisdiction_flag: bool
    recommended_action: str

class CorridorInfo(BaseModel):
    id: str
    name: str
    brics_nations: List[str]
    description: str
    center: List[float]  # [lat, lon]
    default_zoom: int
    bounds: List[List[float]]
    cross_border_line: List[List[float]]  # [[lon, lat], [lon, lat]]
    wind_profile: Dict[str, Any]
    facilities_count: int

class ForecastSnapshot(BaseModel):
    hour_offset: int
    timestamp_iso: str
    max_aqi: int
    mean_pm25: float
    plume_geojson: Dict[str, Any]

class CorridorForecastResponse(BaseModel):
    corridor_id: str
    generated_at: str
    time_steps_hours: List[int]
    meteorological_conditions: Dict[str, Any]
    forecast_snapshots: List[ForecastSnapshot]

class FluxResponse(BaseModel):
    corridor_id: str
    timestamp: str
    boundary_name: str
    transport_rate_kg_hr: float
    net_accumulation_tons_24h: float
    direction_arrow: str
    wind_speed_kmh: float
    wind_direction_deg: float

class FederatedNodeStatus(BaseModel):
    node_id: str
    country: str
    flag: str
    agency: str
    status: str
    local_samples_count: int
    model_version: str
    sha256_hash: str
    latency_ms: int

class FederatedMeshResponse(BaseModel):
    round_number: int
    total_rounds: int
    global_convergence_loss: float
    privacy_budget_epsilon: float
    nodes: List[FederatedNodeStatus]
    is_aggregating: bool

class PolicySimulationRequest(BaseModel):
    corridor_id: str
    agricultural_curtailment_pct: float = Field(ge=0, le=100, default=0)
    industrial_curtailment_pct: float = Field(ge=0, le=100, default=0)
    traffic_restriction_pct: float = Field(ge=0, le=100, default=0)

class PolicySimulationResponse(BaseModel):
    corridor_id: str
    baseline_peak_pm25: float
    projected_peak_pm25: float
    net_reduction_pct: float
    cross_border_flux_reduced_kg_hr: float
    estimated_hospital_admissions_prevented: int
    curtailment_plan_summary: str

class CAPAlertRequest(BaseModel):
    corridor_id: str
    event_type: str = "Trans-Boundary Hazardous Smog Influx"
    severity: str = "Severe"  # Minor, Moderate, Severe, Extreme
    urgency: str = "Immediate"
    headline: str
    primary_source_id: Optional[str] = None
    recipient_jurisdictions: List[str]

class CAPAlertResponse(BaseModel):
    status: str
    cap_alert_id: str
    dispatched_at: str
    upwind_action_endpoint: str
    downwind_health_endpoint: str
    cap_xml: str
    sha256_hash: str
    multilingual_advisories: Dict[str, str]

class CitizenReportRequest(BaseModel):
    corridor_id: str
    lat: float
    lon: float
    symptom_notes: Optional[str] = None
    local_sensor_aqi: Optional[float] = None

class CitizenReportResponse(BaseModel):
    report_id: str
    received_at: str
    fuzzed_geohash: str
    neighborhood_aqi: int
    health_guidance: str
    action_items: List[str]
