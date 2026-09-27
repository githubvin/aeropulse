# AeroPulse BRICS: Mathematical Formulations & AI Models

This document specifies the scientific and mathematical models powering the **AeroPulse BRICS** physics simulation, source attribution, and artificial intelligence pipelines.

---

## 1. AeroTrace: Lagrangian Back-Trajectory Formulation

To identify where a detected smoke plume or sensor spike originated, we invert the Lagrangian advection equation of an air parcel.

### 1.1 Parcel Position Inversion
Given an observation location $\vec{x}_{\text{obs}} = (x_0, y_0)$ at timestamp $t_0$, the air parcel trajectory backward in time $t \le t_0$ is governed by:
$$\frac{d\vec{x}(t)}{dt} = \vec{v}(\vec{x}(t), t)$$

Integrating backward by a lookback duration $\tau \ge 0$:
$$\vec{x}_{\text{source}}(t_0 - \tau) = \vec{x}_{\text{obs}} - \int_{0}^{\tau} \vec{v}(\vec{x}(t_0 - t'), t_0 - t') \, dt'$$

For discrete meteorological wind field grids with spatial velocity vectors $\vec{v} = (u, v)$, we apply a second-order Runge-Kutta (RK2) predictor-corrector numerical integration:
$$\vec{x}^* = \vec{x}_k - \Delta t \cdot \vec{v}(\vec{x}_k, t_k)$$
$$\vec{x}_{k+1} = \vec{x}_k - \frac{\Delta t}{2} \cdot \left[ \vec{v}(\vec{x}_k, t_k) + \vec{v}(\vec{x}^*, t_k - \Delta t) \right]$$

### 1.2 Plausible Travel Distance and Transit Time
The total curvilinear distance $d_{\text{travel}}$ travelled by the plume from candidate source to the observer is computed by accumulating path differentials:
$$d_{\text{travel}} = \sum_{k=0}^{N-1} \sqrt{(x_{k+1} - x_k)^2 + (y_{k+1} - y_k)^2}$$

The estimated transit time $\tau_{\text{transit}}$ is:
$$\tau_{\text{transit}} = \sum_{k=0}^{N-1} \frac{\Delta s_k}{\|\vec{v}_k\|} = \frac{d_{\text{travel}}}{\bar{v}_{\text{mean}}}$$

---

## 2. Upwind Search Cone & Plume Expansion Geometry

Atmospheric turbulence causes lateral and vertical plume spreading. To ensure we capture all potential factories within the plume envelope, we compute the lateral dispersion standard deviation $\sigma_y(x)$ using Pasquill-Gifford dispersion parameters:

$$\sigma_y(x) = c \cdot x^d$$

where $x$ is the downwind distance along the mean plume axis, and $c, d$ depend on the atmospheric Pasquill stability class (Classes A through F).

### 2.1 Upwind Sector Angle
Under neutral to moderately unstable daytime conditions (Class C/D), the effective half-angle $\theta_{\text{cone}}$ of the upstream search sector is:
$$\theta_{\text{cone}} = \arctan\left(\frac{2.15 \cdot \sigma_y(x)}{x}\right) \approx 15^\circ \text{ to } 22.5^\circ$$

### 2.2 Spatial Cone Filter
A registered factory at coordinate $\vec{x}_{\text{fac}}$ is accepted as a candidate source if:
1. **Distance Condition**: $\|\vec{x}_{\text{fac}} - \vec{x}_{\text{obs}}\| \le R_{\text{max}}$ (typically $50\text{ km}$).
2. **Angular Alignment Condition**:
   $$\cos(\phi) = \frac{(\vec{x}_{\text{fac}} - \vec{x}_{\text{obs}}) \cdot (-\vec{v}_{\text{wind}})}{\|\vec{x}_{\text{fac}} - \vec{x}_{\text{obs}}\| \cdot \|\vec{v}_{\text{wind}}\|} \ge \cos(\theta_{\text{cone}})$$
   Any facility outside this angular cone is physically incapable of transporting emissions to the observer under the current wind regime.

---

## 3. Forward 2D Advection-Diffusion Dispersion Forecaster

For forward corridor forecasting ($t \in [0, 48]\text{ hours}$), the mass conservation equation for particulate concentration $C(x, y, t)$ $[\mu\text{g/m}^3]$ is:

$$\frac{\partial C}{\partial t} = - \underbrace{\left( u \frac{\partial C}{\partial x} + v \frac{\partial C}{\partial y} \right)}_{\text{Advection by Wind}} + \underbrace{\left( K_x \frac{\partial^2 C}{\partial x^2} + K_y \frac{\partial^2 C}{\partial y^2} \right)}_{\text{Turbulent Diffusion}} - \underbrace{\lambda C}_{\text{Deposition}} + \underbrace{\sum_{i} S_i(x, y, t)}_{\text{Active Emission Sources}}$$

- $u(x, y, t), v(x, y, t)$: Horizontal wind components from meteorological forecasts.
- $K_x, K_y$: Eddy diffusion coefficients ($10 \text{ to } 50\text{ m}^2/\text{s}$).
- $\lambda$: Atmospheric decay and ground dry deposition rate ($\approx 10^{-5}\text{ s}^{-1}$).
- $S_i$: Emission rate from source $i$ (e.g., $150\text{ g/s}$ from a thermal stack, or $500\text{ g/s}$ from agricultural burning clusters).

---

## 4. Cross-Border Mass Transport Flux Integral

To establish objective trans-boundary evidence, we compute the instantaneous line-integral flux $\Phi(t)$ $[\text{kg/hour}]$ crossing a virtual boundary segment $L$:

$$\Phi(t) = \int_{L} H_{\text{PBL}}(s) \cdot C(s, t) \cdot \left[ \vec{v}(s, t) \cdot \vec{n}(s) \right] \, ds$$

- $L$: Geometric polyline representing the provincial or international border segment.
- $\vec{n}(s)$: Outward unit normal vector to the boundary.
- $H_{\text{PBL}}(s)$: Planetary boundary layer mixing height ($\approx 300\text{ to } 1200\text{ m}$).
- $\vec{v}(s, t) \cdot \vec{n}(s)$: Normal component of wind velocity crossing the border.

If $\Phi(t) > 0$, net mass is entering the downwind jurisdiction; if $\Phi(t) < 0$, net mass is exiting.

---

## 5. Sovereign Federated Learning: FedAvg Protocol

To train predictive models across BRICS nodes without violating national data sovereignty:

### 5.1 Local Node Optimization
Each sovereign node $k \in \{ \text{Node}_{\text{IN}}, \text{Node}_{\text{ZA}}, \text{Node}_{\text{BR}}, \text{Node}_{\text{CN}}, \text{Node}_{\text{RU}} \}$ trains on its local private dataset $\mathcal{D}_k$ of size $n_k$:
$$w_k^{(t+1)} = w^{(t)} - \eta \nabla \mathcal{L}_k(w^{(t)}; \mathcal{D}_k)$$

### 5.2 Central Aggregation
The central coordinator collects only weight parameter vectors $w_k^{(t+1)}$ (never raw data $\mathcal{D}_k$) and updates the global model via weighted averaging:
$$w_{\text{global}}^{(t+1)} = \sum_{k=1}^{K} \frac{n_k}{N} w_k^{(t+1)}, \quad \text{where } N = \sum_{k=1}^{K} n_k$$

---

## 6. Google Gemini 2.0 Multimodal Vision & Reasoning Prompts

The system leverages **Google Gemini 2.0 Flash** via the `google-genai` SDK for two complementary inference tasks:

### 6.1 Multimodal Photo Smoke Classification Prompt
```json
{
  "system_instruction": "You are AeroPulse Vision AI, an atmospheric and industrial emissions expert. Analyze the provided image of ambient sky/plumes. Identify the dominant pollution signature, estimate optical opacity, and classify the likely source.",
  "expected_json_schema": {
    "smoke_detected": "boolean",
    "smoke_type": "string (Industrial Coal/Soot | Agricultural Stubble/Biomass | Chemical/Sulfur Plume | Construction Dust | Clean/Fog)",
    "visual_opacity_pct": "integer (0 to 100)",
    "plume_color_signature": "string (Dark Gray/Black | White/Steam | Orange/Brown | Hazy Blue)",
    "estimated_optical_depth": "float",
    "visual_confidence_pct": "integer (0 to 100)",
    "features_identified": ["string"]
  }
}
```

### 6.2 Contextual Source Attribution & Culprit Ranking Prompt
```json
{
  "system_instruction": "You are AeroPulse Attribution Engine. Given: (1) Gemini visual smoke classification, (2) Back-trajectory distance and transit time, (3) Current wind speed/direction, and (4) Upwind candidate facilities from the industrial registry. Provide an objective, evidence-based ranking of the most probable culprit sources.",
  "expected_json_schema": {
    "primary_culprit_id": "string",
    "attribution_confidence_pct": "integer (0 to 100)",
    "estimated_travel_distance_km": "float",
    "estimated_transit_time_hours": "float",
    "ranked_sources": [
      {
        "facility_id": "string",
        "facility_name": "string",
        "category": "string",
        "distance_km": "float",
        "transit_time_hrs": "float",
        "match_score_pct": "integer",
        "reasoning": "string"
      }
    ],
    "regulatory_recommendation": "string"
  }
}
```
