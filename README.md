# AeroPulse BRICS: Planetary Air Intelligence & Industrial Source Attribution Network

[![Hackathon](https://img.shields.io/badge/Hackathon-Build_with_AI:_Code_for_Communities_(Second_Edition)-4285F4?logo=google-cloud&logoColor=white)](https://hack2skill.com/event/codeforcommunities2)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini_2.0_Flash-EA4335?logo=google&logoColor=white)](https://ai.google.dev/)
[![BRICS Theme](https://img.shields.io/badge/BRICS_Pillars-Sustainability_•_Resilience_•_Innovation_•_Cooperation-0F9D58)](#)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> An AI-powered, federated climate action platform engineered for cross-border air intelligence across BRICS nations. Fuses citizen smartphone photos and low-cost IoT sensors with satellite Earth observation (Sentinel-5P, VIIRS) and meteorological wind vectors to pinpoint hidden industrial polluters, forecast 48-hour trans-boundary smog dispersion, and coordinate rapid bilateral emergency interventions.

---

## 📑 Project Documentation Index

All architectural blueprints, mathematical formulations, and engineering specifications have been compiled in the [`docs/`](./docs) directory:

| Document | Description |
|---|---|
| 📋 [**Project Charter & Strategic Plan**](./docs/PROJECT_CHARTER_AND_PLAN.md) | Executive summary, problem framing, hackathon alignment, timeline, milestones, and risk matrix. |
| 🏗️ [**System Architecture & Data Flow**](./docs/SYSTEM_ARCHITECTURE.md) | Multi-layered topology, component roles, and detailed sequence workflows (AeroTrace, CAP alerts, Federated Learning). |
| 📐 [**Mathematical & AI Models**](./docs/MATHEMATICAL_AND_AI_MODELS.md) | Lagrangian back-trajectory formulas, Gaussian plume expansion $\sigma_y(x)$, 2D advection-diffusion equations, border flux integrals $\Phi(t)$, and Gemini 2.0 prompts. |
| 🔌 [**REST API & Protocol Specification**](./docs/API_SPECIFICATION.md) | Complete OpenAPI endpoints, request/response JSON schemas, and OASIS CAP v1.2 XML protocol specifications. |
| 🎨 [**UI/UX & Design System Specification**](./docs/UI_UX_DESIGN_SPEC.md) | Cyber-Geospatial Dark Mode design tokens, HUD telemetry wireframes, 60 FPS wind canvas specs, and interactive modals. |

---

## 🌟 Key Innovations

1. **AeroTrace: Multimodal Reverse Plume Attribution**
   - Citizen or border monitor uploads a photo or triggers a sensor spike.
   - **Google Gemini 2.0 Flash** inspects the visual plume signature (soot vs. biomass vs. steam) and estimates optical opacity.
   - Lagrangian back-trajectory physics tracks the air parcel upstream against wind vectors $(u, v)$ to calculate the **exact plausible distance travelled (km)** and **transit time (hours)**.
   - An upwind dispersion cone intersects registered industrial registries to rank culprit factories and thermal power plants with explainable AI reasoning.

2. **48-Hour Predictive Plume Forecaster**
   - Solves the 2D advection-diffusion equation forward in time.
   - Provides an interactive timeline scrubber ($0\text{h}$ to $+48\text{h}$) to alert downwind cities up to 24–48 hours before hazardous smog arrives.

3. **Virtual Cross-Border Flux Gate**
   - Computes continuous line integrals across international and provincial borders, quantifying the exact net pollutant mass transport in $\text{kg/hour}$.
   - Replaces political blame games with undeniable physics-backed data.

4. **Sovereign Federated Learning Mesh**
   - Connects 5 national nodes (India, South Africa, Brazil, China, Russia).
   - Trains and refines predictive dispersion models collaboratively using `FedAvg` without exporting private domestic sensor feeds or sovereign border data.

5. **OASIS CAP v1.2 Bilateral Alert Engine**
   - Dispatches simultaneous, coordinated emergency action protocols to both upwind regulators (to curtail emissions) and downwind health centers (to prepare hospitals and schools).

---

## 🏛️ Supported BRICS Cross-Border Corridors
- **Indo-Gangetic & Trans-boundary Plains** (Punjab / Haryana stubble & thermal stacks $\rightarrow$ Delhi NCR $\rightarrow$ Trans-boundary plains)
- **Southern African Highveld Basin** (Mpumalanga mega-power stations & open-cast coal mines $\rightarrow$ Mozambique / Eswatini)
- **Pan-Amazonian & Cerrado Biomass Arc** (Brazil / Bolivia / Paraguay seasonal clearing fires $\rightarrow$ SE metropolitan centers)
- **Jing-Jin-Ji / Bohai Rim Corridor** (Hebei heavy manufacturing $\rightarrow$ Trans-Yellow-Sea transport)
- **Eurasian Boreal Wildfire Belt** (Siberian taiga peat/forest wildfire smoke advection)
