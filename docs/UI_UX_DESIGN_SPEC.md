# AeroPulse BRICS: UI/UX & Design System Specification

**Design Theme**: *Cyber-Geospatial Dark Mode (Tactical Environmental Command Center)*  
**Visual Style**: High-contrast, glassmorphic HUD, neon vector streamlines, telemetry cards, and zero-distraction spatial focus.

---

## 1. Visual Identity & Color Palette

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AeroPulse Color Tokens                             │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ Canvas Deep Space │ Surface Container │ Border / Wireframe│ Text Primary    │
│ #080C14           │ #0F172A (Opacity) │ #1E293B           │ #F8FAFC         │
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ Cyan Streamline   │ Hazard Crimson    │ Caution Amber     │ Verified Safe   │
│ #06B6D4           │ #EF4444           │ #F59E0B           │ #10B981         │
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ Sovereign Violet  │ Wind Vector Glow  │ Hotspot Fire Glow │ Border Fence    │
│ #8B5CF6           │ rgba(6,182,212,.3)│ rgba(239,68,68,.4)│ #EC4899         │
└───────────────────┴───────────────────┴───────────────────┴─────────────────┘
```

- **Canvas Background**: `#080c14` (Deep space tactical navy, maximizes contrast with luminous layers).
- **Glassmorphic Surface**: `rgba(15, 23, 42, 0.75)` with `backdrop-filter: blur(12px)` and subtle `1px solid rgba(255, 255, 255, 0.08)`.
- **Streamline Particle Flow**: Gradient cyan-to-teal `#06b6d4` $\rightarrow$ `#14b8a6` with dynamic alpha scaling based on particle velocity.
- **Plume Hazard Contours**:
  - *Moderate (50–100)*: `#10b981` (Emerald)
  - *Unhealthy (101–200)*: `#f59e0b` (Amber)
  - *Severe (201–300)*: `#ef4444` (Crimson)
  - *Hazardous (301–500+)*: `#7c2d12` (Maroon/Dark Violet)

---

## 2. Typography & Iconography

- **Display & Telemetry Font**: Monospace (`JetBrains Mono`, `Fira Code`) for all numeric readouts, coordinates, distances, timestamps, and flux rates.
- **Interface Font**: Modern sans-serif (`Inter`, `system-ui`) for body copy, descriptions, and policy dialogues.
- **Iconography**: `lucide-react` (Airplay, Wind, Flame, Factory, Compass, ShieldAlert, Cpu, Share2, Activity, Play, Pause).

---

## 3. Screen Layout & Wireframe Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO] AeroPulse BRICS   [Corridor Selector ▼]   [Node Status: 5/5 Active]   [17:15 UTC]│
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   [Floating Left Bar]                                            [Telemetry HUD Pod]    │
│   ┌───────────────────────┐                                     ┌─────────────────────┐ │
│   │ ⚡ Quick Actions      │                                     │ AQI Index: 342 ⚠️    │ │
│   │ 🔍 Inspect (AeroTrace)│                                     │ Wind: 14.8 km/h NW  │ │
│   │ 🌐 BRICS Fed Mesh     │                                     │ Boundary Flux:      │ │
│   │ 🧪 Policy Sandbox     │                                     │   1,420 kg/hr ──>   │ │
│   │ 🚨 Dispatch CAP Alert │                                     └─────────────────────┘ │
│   └───────────────────────┘                                                             │
│                                                                                         │
│                                                                                         │
│                         3D GEOSPATIAL DIGITAL TWIN CANVAS                               │
│                   (Animated Wind Streamlines + Plume Contours)                          │
│                                                                                         │
│                                                                                         │
│                                                                                         │
│   [Bottom Center: 48-Hour Predictive Scrubber]                                          │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │ [▶ Play]  |--●---------------------------------------|  [+18h: Tomorrow 11:00]  │   │
│   │  Now       +6h        +12h       +18h       +24h       +36h       +48h          │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Interactive Components

### 4.1 AeroTrace Inspector Modal
- **Photo Upload Dropzone**: Supports drag-and-drop or instant camera snapshot with EXIF preview.
- **Dual-Pane Inspection Layout**:
  - *Left Pane*: Uploaded photo with AI bounding box overlays, Gemini optical opacity bar, and classified smoke signature tag (`Industrial Coal / Soot`).
  - *Right Pane*: Ranked Culprit Cards:
    - Facility Name & Type (e.g. `Panipat Thermal Power Station Stack B`)
    - Plausible Travel Distance (e.g. `18.4 km upwind`)
    - Transit Time (e.g. `1 hour 15 min`)
    - Attribution Match Confidence (e.g. `92% Match`)
    - "Dispatch Formal Notice" CTA button.

### 4.2 60 FPS Wind Particle Canvas
- Renders 2,500+ particles on an HTML5 2D Canvas layered on top of MapLibre/Leaflet.
- Particle trails have an exponential alpha decay (`ctx.fillStyle = 'rgba(8, 12, 20, 0.92)'`) producing fluid, organic motion without UI lag.
- Wind direction angles translate smoothly when zooming or panning the camera.

### 4.3 Virtual Cross-Border Flux Gate
- Displayed as a glowing dashed boundary line across the border between two administrative territories.
- Floating badge attached to the midpoint shows:
  - Transport arrow pointing in the direction of the wind component.
  - Live flux rate (e.g., `1,420 kg/hr`).
  - Net accumulation since $00:00\text{ UTC}$ (e.g., `24.8 Metric Tons Transferred`).

### 4.4 Federated Mesh Status Modal
- Visual network graph connecting 5 BRICS nodes:
  - 🇮🇳 `Node-IN` (CPCB, Delhi)
  - 🇿🇦 `Node-ZA` (SAAQIS, Pretoria)
  - 🇧🇷 `Node-BR` (INPE, São José dos Campos)
  - 🇨🇳 `Node-CN` (CNEMC, Beijing)
  - 🇷🇺 `Node-RU` (Roshydromet, Moscow)
- Round Progress bar (e.g., `Round 14/20: Local Training Complete, Aggregating Gradients`).
- Cryptographic SHA-256 weight hash verify badge (`Verified Sovereign Data Shield`).
