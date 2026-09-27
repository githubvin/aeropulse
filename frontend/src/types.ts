export interface CorridorInfo {
  id: string;
  name: string;
  brics_nations: string[];
  description: string;
  center: [number, number]; // [lat, lon]
  default_zoom: number;
  bounds: [[number, number], [number, number]];
  cross_border_line: [number, number][]; // [[lon, lat], ...]
  wind_profile: {
    speed_kmh: number;
    direction_deg: number;
    compass: string;
  };
  facilities_count: number;
}

export interface VisualInspectionResult {
  smoke_detected: boolean;
  smoke_type: string;
  visual_opacity_pct: number;
  plume_color_signature: string;
  visual_confidence_pct: number;
  features_identified: string[];
}

export interface ReverseTrajectoryResult {
  curvilinear_distance_km: number;
  transit_time_hours: number;
  mean_wind_speed_kmh: number;
  mean_wind_direction_deg: number;
  trajectory_path: [number, number][]; // [[lon, lat], ...]
  upwind_cone_polygon: [number, number][]; // [[lon, lat], ...]
}

export interface CandidateFacility {
  facility_id: string;
  name: string;
  category: string;
  fuel_type: string;
  coordinates: [number, number]; // [lon, lat]
  distance_km: number;
  transit_time_hrs: number;
  match_score_pct: number;
  reasoning: string;
  active_status: string;
  rank?: number;
}

export interface AttributionResponse {
  status: string;
  corridor_id: string;
  observation: {
    lat: number;
    lon: number;
    fuzzed_geohash: string;
  };
  visual_inspection: VisualInspectionResult;
  reverse_trajectory: ReverseTrajectoryResult;
  candidate_sources_found: number;
  ranked_culprits: CandidateFacility[];
  cross_border_jurisdiction_flag: boolean;
  recommended_action: string;
}

export interface ForecastSnapshot {
  hour_offset: number;
  timestamp_iso: string;
  max_aqi: number;
  mean_pm25: number;
  plume_geojson: any;
}

export interface CorridorForecastResponse {
  corridor_id: string;
  generated_at: string;
  time_steps_hours: number[];
  meteorological_conditions: {
    wind_speed_kmh: number;
    wind_direction_deg: number;
    pbl_height_m: number;
    inversion_risk: string;
  };
  forecast_snapshots: ForecastSnapshot[];
}

export interface FluxResponse {
  corridor_id: string;
  timestamp: string;
  boundary_name: string;
  transport_rate_kg_hr: number;
  net_accumulation_tons_24h: number;
  direction_arrow: string;
  wind_speed_kmh: number;
  wind_direction_deg: number;
}

export interface FederatedNodeStatus {
  node_id: string;
  country: string;
  flag: string;
  agency: string;
  status: string;
  local_samples_count: number;
  model_version: string;
  sha256_hash: string;
  latency_ms: number;
}

export interface FederatedMeshResponse {
  round_number: number;
  total_rounds: number;
  global_convergence_loss: number;
  privacy_budget_epsilon: number;
  nodes: FederatedNodeStatus[];
  is_aggregating: boolean;
}

export interface PolicySimulationResponse {
  corridor_id: string;
  baseline_peak_pm25: number;
  projected_peak_pm25: number;
  net_reduction_pct: number;
  cross_border_flux_reduced_kg_hr: number;
  estimated_hospital_admissions_prevented: number;
  curtailment_plan_summary: string;
}

export interface CAPAlertResponse {
  status: string;
  cap_alert_id: string;
  dispatched_at: string;
  upwind_action_endpoint: string;
  downwind_health_endpoint: string;
  cap_xml: string;
  sha256_hash: string;
  multilingual_advisories: Record<string, string>;
}
