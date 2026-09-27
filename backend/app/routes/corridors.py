from fastapi import APIRouter, HTTPException
from typing import List
from ..models.schemas import CorridorInfo
from ..services.industrial_registry import CORRIDOR_FACILITIES
from ..services.dispersion_solver import CORRIDOR_METADATA
from ..services.flux_calculator import BOUNDARY_LINES

router = APIRouter(prefix="/corridors", tags=["Corridors"])

CORRIDOR_DATA = [
    {
        "id": "indo-gangetic",
        "name": "Indo-Gangetic & Trans-boundary Plains",
        "brics_nations": ["India", "Regional Trans-boundary Basin"],
        "description": "Post-harvest crop stubble fires and coal-fired thermal stacks advecting dense winter aerosol plumes across interstate and international plains.",
        "center": [29.20, 76.85],
        "default_zoom": 8,
        "bounds": [[27.50, 74.80], [31.50, 78.50]],
        "cross_border_line": BOUNDARY_LINES["indo-gangetic"]["coordinates"],
        "wind_profile": {
            "speed_kmh": 14.8,
            "direction_deg": 315.0,
            "compass": "NW (Northwest)"
        },
        "facilities_count": len(CORRIDOR_FACILITIES["indo-gangetic"])
    },
    {
        "id": "highveld-basin",
        "name": "Southern African Highveld Basin",
        "brics_nations": ["South Africa", "Mozambique", "Eswatini"],
        "description": "Massive cluster of coal-fired mega-power stations (Kendal, Kriel) and synthetic fuels refining transporting high SO2 and PM2.5 across regional borders.",
        "center": [-26.25, 29.10],
        "default_zoom": 8,
        "bounds": [[-27.50, 27.50], [-25.00, 31.50]],
        "cross_border_line": BOUNDARY_LINES["highveld-basin"]["coordinates"],
        "wind_profile": {
            "speed_kmh": 18.2,
            "direction_deg": 290.0,
            "compass": "WNW (West-Northwest)"
        },
        "facilities_count": len(CORRIDOR_FACILITIES["highveld-basin"])
    },
    {
        "id": "pan-amazonian",
        "name": "Pan-Amazonian & Cerrado Biomass Arc",
        "brics_nations": ["Brazil", "Bolivia", "Paraguay"],
        "description": "Dense biomass combustion smoke clouds travelling across international borders into southern metropolitan centers.",
        "center": [-14.50, -56.50],
        "default_zoom": 6,
        "bounds": [[-21.00, -62.00], [-10.00, -50.00]],
        "cross_border_line": BOUNDARY_LINES["pan-amazonian"]["coordinates"],
        "wind_profile": {
            "speed_kmh": 12.0,
            "direction_deg": 60.0,
            "compass": "ENE (East-Northeast)"
        },
        "facilities_count": len(CORRIDOR_FACILITIES["pan-amazonian"])
    },
    {
        "id": "jing-jin-ji",
        "name": "Jing-Jin-Ji / Bohai Rim Industrial Corridor",
        "brics_nations": ["China", "Bohai Maritime Rim"],
        "description": "Heavy metallurgical steel mills and petrochemical complexes generating persistent chemical haze plumes across coastal maritime boundaries.",
        "center": [39.30, 117.80],
        "default_zoom": 8,
        "bounds": [[37.50, 115.50], [41.00, 120.50]],
        "cross_border_line": BOUNDARY_LINES["jing-jin-ji"]["coordinates"],
        "wind_profile": {
            "speed_kmh": 16.5,
            "direction_deg": 330.0,
            "compass": "NNW (North-Northwest)"
        },
        "facilities_count": len(CORRIDOR_FACILITIES["jing-jin-ji"])
    },
    {
        "id": "eurasian-boreal",
        "name": "Eurasian Boreal Wildfire Belt",
        "brics_nations": ["Russia", "Central Asian Boundary"],
        "description": "Siberian taiga peat fires and heavy metallurgical smelting basins emitting massive trans-continental pyrocumulonimbus aerosols.",
        "center": [56.80, 95.00],
        "default_zoom": 6,
        "bounds": [[53.00, 88.00], [60.00, 104.00]],
        "cross_border_line": BOUNDARY_LINES["eurasian-boreal"]["coordinates"],
        "wind_profile": {
            "speed_kmh": 22.0,
            "direction_deg": 270.0,
            "compass": "W (West)"
        },
        "facilities_count": len(CORRIDOR_FACILITIES["eurasian-boreal"])
    }
]

@router.get("", response_model=List[CorridorInfo])
def list_corridors():
    return [CorridorInfo(**c) for c in CORRIDOR_DATA]

@router.get("/{corridor_id}", response_model=CorridorInfo)
def get_corridor(corridor_id: str):
    for c in CORRIDOR_DATA:
        if c["id"] == corridor_id:
            return CorridorInfo(**c)
    raise HTTPException(status_code=404, detail="Corridor not found")
