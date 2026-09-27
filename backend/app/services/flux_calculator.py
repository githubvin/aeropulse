from datetime import datetime, timezone
from typing import Dict, Any
from ..models.schemas import FluxResponse

# Pre-defined cross-border virtual monitoring fences
BOUNDARY_LINES: Dict[str, Dict[str, Any]] = {
    "indo-gangetic": {
        "name": "Punjab-Haryana to NCR Inter-State Boundary",
        "coordinates": [[76.75, 28.95], [77.35, 28.55]],
        "base_flux_kg_hr": 1420.5,
        "base_wind_speed": 14.8,
        "base_wind_dir": 315.0,
        "direction_arrow": "NW ➔ SE"
    },
    "highveld-basin": {
        "name": "Mpumalanga Highveld to Mozambique Border Fence",
        "coordinates": [[31.50, -25.80], [32.10, -26.40]],
        "base_flux_kg_hr": 1980.0,
        "base_wind_speed": 18.2,
        "base_wind_dir": 290.0,
        "direction_arrow": "WNW ➔ ESE"
    },
    "pan-amazonian": {
        "name": "Mato Grosso to Bolivia/Paraguay Trans-Boundary Arc",
        "coordinates": [[-58.20, -16.50], [-57.80, -18.90]],
        "base_flux_kg_hr": 2650.0,
        "base_wind_speed": 12.0,
        "base_wind_dir": 60.0,
        "direction_arrow": "ENE ➔ WSW"
    },
    "jing-jin-ji": {
        "name": "Hebei-Tianjin Bohai Maritime Coastal Fence",
        "coordinates": [[117.80, 39.10], [118.40, 38.60]],
        "base_flux_kg_hr": 1740.0,
        "base_wind_speed": 16.5,
        "base_wind_dir": 330.0,
        "direction_arrow": "NNW ➔ SSE"
    },
    "eurasian-boreal": {
        "name": "Central Siberian Taiga Trans-Boundary Boundary",
        "coordinates": [[94.00, 56.50], [97.50, 55.80]],
        "base_flux_kg_hr": 2100.0,
        "base_wind_speed": 22.0,
        "base_wind_dir": 270.0,
        "direction_arrow": "W ➔ E"
    }
}

def calculate_cross_border_flux(corridor_id: str, curtailment_factor: float = 1.0) -> FluxResponse:
    info = BOUNDARY_LINES.get(corridor_id, BOUNDARY_LINES["indo-gangetic"])
    now = datetime.now(timezone.utc)
    
    current_rate = round(info["base_flux_kg_hr"] * curtailment_factor, 1)
    accum_tons = round((current_rate * 24.0) / 1000.0, 2)
    
    return FluxResponse(
        corridor_id=corridor_id,
        timestamp=now.isoformat(),
        boundary_name=info["name"],
        transport_rate_kg_hr=current_rate,
        net_accumulation_tons_24h=accum_tons,
        direction_arrow=info["direction_arrow"],
        wind_speed_kmh=info["base_wind_speed"],
        wind_direction_deg=info["base_wind_dir"]
    )
