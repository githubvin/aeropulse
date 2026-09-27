# AeroPulse BRICS: REST API & Protocol Specification

Base URL: `http://localhost:8000/api/v1`  
Protocol: HTTP/1.1 & WebSocket  
Content-Type: `application/json` (or `multipart/form-data` for photo uploads)

---

## 1. Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/attribution/trace` | Upload photo/coordinates $\rightarrow$ run Gemini inspection $\rightarrow$ compute back-trajectory $\rightarrow$ rank culprit factories |
| `GET` | `/corridors` | Retrieve all 5 pre-configured BRICS cross-border corridors |
| `GET` | `/corridors/{id}` | Retrieve detailed corridor metadata, bounds, and registered facilities |
| `GET` | `/corridors/{id}/forecast` | Retrieve 48h forward plume dispersion isopleths and wind vectors |
| `GET` | `/corridors/{id}/flux` | Retrieve real-time cross-border pollutant mass flux ($\text{kg/hour}$) |
| `GET` | `/federated/status` | Retrieve sovereign node statuses (India, SA, Brazil, China, Russia) & FedAvg metrics |
| `POST` | `/federated/trigger-round` | Trigger a new federated model aggregation round |
| `POST` | `/alerts/dispatch` | Generate and dispatch an OASIS CAP v1.2 bilateral alert |
| `GET` | `/alerts/active` | Retrieve current active cross-border alerts |
| `POST` | `/policy/simulate` | Interactive 'What-If' policy sandbox recalculating downstream air quality |
| `POST` | `/citizen/report` | Citizen photo submission with privacy fuzzing & localized health advisory |

---

## 2. Detailed Endpoint Specifications

### 2.1 `POST /attribution/trace`
Executes the **AeroTrace Multimodal Reverse Plume Attribution** pipeline.

#### Request (Multipart Form Data):
- `photo`: File (optional, JPEG/PNG image)
- `lat`: float (e.g. `28.6139`)
- `lon`: float (e.g. `77.2090`)
- `corridor_id`: string (e.g. `"indo-gangetic"`)
- `search_radius_km`: float (optional, default `50.0`)
- `observed_aqi`: float (optional, e.g. `342.0`)

#### Response (200 OK):
```json
{
  "status": "success",
  "observation": {
    "lat": 28.6139,
    "lon": 77.2090,
    "timestamp": "2026-09-27T17:15:00Z",
    "fuzzed_geohash": "ttnfv2"
  },
  "visual_inspection": {
    "smoke_detected": true,
    "smoke_type": "Industrial Coal/Soot",
    "visual_opacity_pct": 78,
    "plume_color_signature": "Dark Gray/Black",
    "visual_confidence_pct": 89,
    "features_identified": ["Tall vertical stack discharge", "Dense dark particulate column", "High optical extinction"]
  },
  "reverse_trajectory": {
    "curvilinear_distance_km": 18.4,
    "transit_time_hours": 1.25,
    "mean_wind_speed_kmh": 14.7,
    "mean_wind_direction_deg": 315,
    "trajectory_path": [
      [77.2090, 28.6139],
      [77.1520, 28.6650],
      [77.0850, 28.7210],
      [77.0210, 28.7750]
    ],
    "upwind_cone_polygon": [
      [77.2090, 28.6139],
      [77.0100, 28.8200],
      [76.9500, 28.7300],
      [77.2090, 28.6139]
    ]
  },
  "candidate_sources_found": 4,
  "ranked_culprits": [
    {
      "rank": 1,
      "facility_id": "FAC-IN-002",
      "name": "Panipat Thermal Power Station Stack B",
      "category": "Thermal Power Plant",
      "distance_km": 18.4,
      "transit_time_hrs": 1.25,
      "match_score_pct": 92,
      "coordinates": [76.9800, 28.7900],
      "reasoning": "Located directly along the 315° upwind trajectory vector. Active coal boiler signature matches the dark soot profile identified in the visual inspection."
    },
    {
      "rank": 2,
      "facility_id": "FAC-IN-005",
      "name": "Sonipat Industrial Brick Kiln Cluster",
      "category": "Brick Kilns",
      "distance_km": 14.1,
      "transit_time_hrs": 0.95,
      "match_score_pct": 68,
      "coordinates": [77.0300, 28.7100],
      "reasoning": "Within the upwind dispersion cone (+11° off axis). Emits heavy particulate matter, but lower stack height makes it secondary to the thermal stack."
    }
  ],
  "cross_border_jurisdiction_flag": true,
  "recommended_action": "Issue Stage 2 Curtailment Notice to Facility FAC-IN-002 and alert downstream public health centers."
}
```

---

### 2.2 `GET /corridors/{id}/forecast`
Returns the forward 48-hour advection-diffusion dispersion forecast.

#### Response (200 OK):
```json
{
  "corridor_id": "indo-gangetic",
  "generated_at": "2026-09-27T17:15:00Z",
  "time_steps_hours": [0, 6, 12, 18, 24, 30, 36, 42, 48],
  "meteorological_conditions": {
    "wind_speed_kmh": 15.2,
    "wind_direction_deg": 310,
    "pbl_height_m": 420,
    "inversion_risk": "High"
  },
  "forecast_snapshots": [
    {
      "hour_offset": 0,
      "max_aqi": 340,
      "plume_geojson": { "type": "FeatureCollection", "features": [] }
    },
    {
      "hour_offset": 24,
      "max_aqi": 410,
      "plume_geojson": { "type": "FeatureCollection", "features": [] }
    }
  ]
}
```

---

### 2.3 `POST /alerts/dispatch`
Generates and transmits an **OASIS CAP v1.2** cross-border alert.

#### Request:
```json
{
  "corridor_id": "indo-gangetic",
  "event_type": "Trans-Boundary Hazardous Smog Transport",
  "severity": "Severe",
  "urgency": "Immediate",
  "headline": "Severe Trans-Boundary Industrial Smog Influx Expected Within 14 Hours",
  "primary_source_id": "FAC-IN-002",
  "recipient_jurisdictions": ["National Capital Region", "Downwind Border Districts"]
}
```

#### Response (200 OK):
```json
{
  "status": "dispatched",
  "cap_alert_id": "urn:oasis:names:tc:emergency:cap:1.2:AEROPULSE-2026-09-27-001",
  "dispatched_at": "2026-09-27T17:15:05Z",
  "upwind_action_endpoint": "https://cpcb.gov.in/api/v1/interventions/ack",
  "downwind_health_endpoint": "https://health.delhi.gov.in/api/v1/alerts/ack",
  "cap_xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">...</alert>",
  "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

---

### 2.4 `POST /policy/simulate`
Interactive 'What-If' simulation sandbox.

#### Request:
```json
{
  "corridor_id": "indo-gangetic",
  "agricultural_curtailment_pct": 50,
  "industrial_curtailment_pct": 30,
  "traffic_restriction_pct": 20
}
```

#### Response (200 OK):
```json
{
  "corridor_id": "indo-gangetic",
  "baseline_peak_pm25": 385.0,
  "projected_peak_pm25": 218.4,
  "net_reduction_pct": 43.3,
  "cross_border_flux_reduced_kg_hr": 1420.5,
  "estimated_hospital_admissions_prevented": 1280
}
```
