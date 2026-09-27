# AeroPulse BRICS: System Architecture & Data Flow

This document details the multi-layered system architecture, component interactions, and sequence workflows for the **AeroPulse BRICS** platform.

---

## 1. High-Level Architectural Topology

```mermaid
flowchart TB
    subgraph Layer_Edge ["Layer 1: Multi-Modal Ingestion & Edge Verification"]
        CIT[Citizen Mobile PWA\nCamera Capture & EXIF Tagging]
        IOT[Low-Cost IoT Sensors\nPM2.5, PM10, SO2, CO Stream]
        SAT[Earth Observation Connectors\nSentinel-5P TROPOMI & NASA VIIRS]
        MET[Meteorological Feeds\nGFS & ECMWF Wind / Temp Vectors]
    end

    subgraph Layer_AI ["Layer 2: Google Gemini Multimodal Engine"]
        GEMINI[Gemini 2.0 Flash Multimodal API\nVision Inspection & Prompt Reasoning]
        SPEC[Spectral & Opacity Profiler\nSoot vs. Biomass vs. Dust]
        CIT --> GEMINI
        GEMINI --> SPEC
    end

    subgraph Layer_Physics ["Layer 3: Atmospheric Physics & Spatial Registry"]
        BT[AeroTrace Lagrangian Back-Trajectory\nReverse Wind Integration & Travel Distance]
        DISP[Forward 2D Advection-Diffusion Solver\n48h Predictive Plume Isopleths]
        FLUX[Cross-Border Virtual Flux Gate\nLine Integral Transport Rate kg/hr]
        REG[(Cross-Border Industrial Directory\nThermal Power, Kilns, Refineries, Smelters)]
        
        MET --> BT
        MET --> DISP
        MET --> FLUX
        SPEC --> BT
        IOT --> BT
        BT <--> REG
    end

    subgraph Layer_Fed ["Layer 4: Sovereign Federated Intelligence Mesh"]
        NODE_IN[Node India - CPCB]
        NODE_ZA[Node South Africa - SAAQIS]
        NODE_BR[Node Brazil - INPE]
        NODE_CN[Node China - CNEMC]
        NODE_RU[Node Russia - Roshydromet]
        AGG[Federated Consensus & FedAvg Aggregator\nZero Raw Data Sharing]

        NODE_IN & NODE_ZA & NODE_BR & NODE_CN & NODE_RU <==> AGG
    end

    subgraph Layer_Action ["Layer 5: Unified Command Center & Rapid Action"]
        MAP[Cyber-Geospatial Digital Twin\n60 FPS WebGL Wind Streamlines & 3D Plume]
        TRACE_UI[AeroTrace Culprit Inspector\nReverse Trajectory Cone & Factory Cards]
        SCRUB[Forward 48h Predictive Scrubber\nHourly Timeline Playback]
        CAP_DISP[OASIS CAP v1.2 Bilateral Dispatcher\nUpwind & Downwind Simultaneous Alerts]
        SANDBOX['What-If' Cross-Border Policy Sandbox\nDynamic Curtailment Sliders]
    end

    BT --> TRACE_UI
    DISP --> SCRUB
    DISP --> MAP
    FLUX --> MAP
    AGG --> MAP
    TRACE_UI --> CAP_DISP
    DISP --> SANDBOX
```

---

## 2. Component Descriptions

### 2.1 Layer 1: Ingestion & Edge Privacy
- **Citizen Camera Ingestion**: Collects geolocated smartphone images of smoke plumes or haze.
- **Privacy Shield (Geohash Truncation)**: Fuzzes citizen coordinates to Level 6 geohash precision ($\sim 1.2\text{ km}^2$) to preserve civilian privacy and protect against surveillance.
- **Sensor Adapters**: Standardized REST/MQTT endpoints receiving particulate readings ($\mu\text{g/m}^3$) from low-cost optical particle counters (e.g., Plantower PMS5003, Sensirion SPS30).
- **Satellite & Weather Adapters**: Ingests active fire thermal points from NASA FIRMS (VIIRS 375m) and wind vector fields $(u, v)$ at 10m and 850 hPa isobaric levels.

### 2.2 Layer 2: Google Gemini Multimodal Engine
- **Model**: `gemini-2.0-flash` accessed via the `google-genai` Python SDK.
- **Role**: 
  1. Inspects the uploaded image for optical extinction, plume color profile (dark gray/black indicating incomplete combustion of heavy fuel/coal; yellowish/white indicating moisture or chemical acid mist; orange/brown indicating biomass/stubble fire).
  2. Estimates plume boundary geometry, stack elevation angle, and visual opacity percentage.
  3. Synthesizes physical evidence to produce structured JSON attribution reasoning.

### 2.3 Layer 3: Atmospheric Physics & Spatial Registry
- **AeroTrace Back-Trajectory Engine**:
  - Computes the backward particle trajectory from observation point $\vec{x}_{\text{obs}}$ against the wind flow.
  - Integrates total transit distance ($d_{\text{travel}}$ in km) and transit time ($\tau$ in hours).
  - Generates a Gaussian dispersion cone angle $\theta = \pm 15^\circ$ expanding upstream to account for turbulent eddy diffusivity.
- **Cross-Border Industrial Directory**:
  - Spatial catalog with verified coordinates, fuel type (coal, petcoke, furnace oil, biomass), stack height, and operating schedules.
  - Executes spatial containment queries (`ST_DWithin` & angular sector checks) within the back-trajectory cone.
- **Forward Advection-Diffusion Solver**:
  - Solves the transport differential equation for the entire corridor over $t \in [0, 48]\text{ hours}$.
- **Cross-Border Flux Gate**:
  - Calculates line integrals across national/provincial border segments to quantify cross-border transport in $\text{kg/hour}$.

### 2.4 Layer 4: Sovereign Federated Intelligence Mesh
- **Sovereign Isolation**: Raw training datasets (sensitive industrial monitoring, high-resolution satellite passes, residential air data) never leave the sovereign boundary.
- **Parameter Aggregation**: Local model gradients are trained on national nodes and transmitted via TLS to the BRICS Aggregator.
- **FedAvg Protocol**: Evaluates round convergence, applies differential privacy noise, and broadcasts the improved global weights back to all nodes.

### 2.5 Layer 5: Command Center & Rapid Intervention
- **Geospatial Digital Twin**: MapLibre/Leaflet WebGL container with high-performance Canvas wind particle animation (2,500+ particles).
- **AeroTrace Inspector**: Displays the observation point, back-trajectory flight path, and interactive culprit factory cards ranked by attribution confidence.
- **OASIS CAP v1.2 Dispatcher**: Generates standard international emergency XML/JSON alerts with coordinated bi-lateral protocols for both upwind and downwind authorities.

---

## 3. Detailed Sequence Workflows

### Sequence 1: AeroTrace Reverse Plume Source Attribution

```mermaid
sequenceDiagram
    autonumber
    actor User as Citizen / Border Inspector
    participant App as AeroPulse Frontend
    participant API as FastAPI Backend
    participant Gemini as Google Gemini 2.0 Flash
    participant Physics as Back-Trajectory Engine
    participant Registry as Industrial Spatial DB

    User->>App: Upload photo of smoke plume + GPS tag
    App->>API: POST /api/v1/attribution/trace (photo, lat, lon, timestamp)
    
    par Multimodal Inspection & Physics Calculation
        API->>Gemini: Send image + Multimodal Prompt
        Gemini-->>API: {smoke_type: "Industrial Coal Soot", opacity: 0.82, confidence: 0.91}
        
        API->>Physics: Calculate Back-Trajectory(lat, lon, wind_u, wind_v)
        Physics-->>API: {trajectory_points, travel_distance_km: 16.4, transit_time_hrs: 1.1, cone_polygon}
    end

    API->>Registry: Query facilities within cone_polygon
    Registry-->>API: [Candidate Factories: Power Plant Alpha, Brick Kiln Cluster Beta]

    API->>Gemini: Reason over (Gemini features + Candidates + Wind alignment)
    Gemini-->>API: {ranked_culprits: [{name: "Power Plant Alpha", rank: 1, confidence: 88%, distance_km: 16.4, reasoning: "..."}]}

    API-->>App: Return complete attribution payload (GeoJSON vector + ranked culprits)
    App->>User: Render Reverse Trajectory on 3D Map + Display Culprit Cards
```

---

### Sequence 2: Bilateral OASIS CAP v1.2 Cross-Border Alert Dispatch

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Command Center Operator
    participant API as FastAPI Backend
    participant CAP as CAP v1.2 Alert Engine
    participant Upwind as Upwind Regulatory Agency
    participant Downwind as Downwind Health Authority

    Operator->>API: POST /api/v1/alerts/dispatch (incident_id, severity: "Severe")
    API->>CAP: Build OASIS CAP v1.2 XML & JSON Payload
    Note over CAP: Embeds corridor geometry, culprit facility info, and estimated ETA

    par Bilateral Coordinated Delivery
        CAP->>Upwind: Dispatch Upwind Action Notice (Trigger Stack Inspection & Curtailment)
        CAP->>Downwind: Dispatch Downwind Advisory (Alert Hospitals, Schools & Air Defence)
    end

    CAP-->>API: Dispatch Status: Confirmed Delivery to Both Endpoints
    API-->>Operator: Display Verified Alert Hash & Incident Log
```

---

### Sequence 3: Sovereign Federated Learning Model Update Round

```mermaid
sequenceDiagram
    autonumber
    participant Aggregator as BRICS Central Aggregator
    participant NodeIN as Node India
    participant NodeZA as Node South Africa
    participant NodeBR as Node Brazil

    Aggregator->>NodeIN: Broadcast Global Model Weights W_global(t)
    Aggregator->>NodeZA: Broadcast Global Model Weights W_global(t)
    Aggregator->>NodeBR: Broadcast Global Model Weights W_global(t)

    Note over NodeIN,NodeBR: Local Training on Private Sovereign Telemetry (Zero Raw Data Leaves Border)

    NodeIN->>Aggregator: Send Local Gradient Delta ΔW_IN (Signed SHA-256)
    NodeZA->>Aggregator: Send Local Gradient Delta ΔW_ZA (Signed SHA-256)
    NodeBR->>Aggregator: Send Local Gradient Delta ΔW_BR (Signed SHA-256)

    Note over Aggregator: Compute FedAvg: W_global(t+1) = Σ (n_k / N) * W_k
    Aggregator->>Aggregator: Evaluate Convergence Loss & Update Metrics
    Aggregator-->>NodeIN: Broadcast Round (t+1) Completed
```
