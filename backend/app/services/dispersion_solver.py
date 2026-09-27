import math
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from .industrial_registry import get_corridor_facilities
from ..models.schemas import CorridorForecastResponse, ForecastSnapshot

CORRIDOR_METADATA: Dict[str, Dict[str, Any]] = {
    "indo-gangetic": {
        "name": "Indo-Gangetic & Trans-boundary Plains",
        "center": [29.20, 76.85],
        "default_wind_speed": 14.8,
        "default_wind_dir": 315.0,  # From NW
        "pbl_height": 420.0,
        "inversion_risk": "Critical / High"
    },
    "highveld-basin": {
        "name": "Southern African Highveld Basin",
        "center": [-26.25, 29.10],
        "default_wind_speed": 18.2,
        "default_wind_dir": 290.0,  # From WNW
        "pbl_height": 650.0,
        "inversion_risk": "Moderate"
    },
    "pan-amazonian": {
        "name": "Pan-Amazonian & Cerrado Biomass Arc",
        "center": [-12.50, -56.00],
        "default_wind_speed": 12.0,
        "default_wind_dir": 60.0,   # From ENE
        "pbl_height": 900.0,
        "inversion_risk": "Low"
    },
    "jing-jin-ji": {
        "name": "Jing-Jin-Ji / Bohai Rim Industrial Corridor",
        "center": [39.30, 117.80],
        "default_wind_speed": 16.5,
        "default_wind_dir": 330.0,  # From NNW
        "pbl_height": 380.0,
        "inversion_risk": "High"
    },
    "eurasian-boreal": {
        "name": "Eurasian Boreal Wildfire Belt",
        "center": [56.80, 95.00],
        "default_wind_speed": 22.0,
        "default_wind_dir": 270.0,  # From W
        "pbl_height": 720.0,
        "inversion_risk": "Moderate"
    }
}

def generate_plume_polygon(
    source_lon: float,
    source_lat: float,
    wind_dir_deg: float,
    wind_speed_kmh: float,
    hour_offset: int,
    intensity_scale: float = 1.0
) -> Dict[str, Any]:
    """Generates an expanding Gaussian plume polygon for an emission source at a given hour."""
    # Air parcel downwind travel distance
    downwind_bearing = (wind_dir_deg + 180.0) % 360.0
    travel_dist_km = max(8.0, wind_speed_kmh * max(hour_offset, 1) * 0.75)
    
    # Plume lateral spread (Pasquill-Gifford sigma_y)
    spread_km = max(4.0, 0.22 * math.pow(travel_dist_km, 0.85) * intensity_scale)
    
    # Simple projection
    rad = math.radians(downwind_bearing)
    R = 6371.0
    
    # Apex (Source)
    p0 = [source_lon, source_lat]
    
    # Downwind center tip
    tip_lat = source_lat + (travel_dist_km / R) * (180.0 / math.pi) * math.cos(rad)
    tip_lon = source_lon + (travel_dist_km / R) * (180.0 / math.pi) * math.sin(rad) / math.cos(math.radians(source_lat))
    
    # Lateral points
    perp_rad = rad + math.pi / 2
    left_lat = tip_lat + (spread_km / R) * (180.0 / math.pi) * math.cos(perp_rad)
    left_lon = tip_lon + (spread_km / R) * (180.0 / math.pi) * math.sin(perp_rad) / math.cos(math.radians(tip_lat))
    
    right_lat = tip_lat - (spread_km / R) * (180.0 / math.pi) * math.cos(perp_rad)
    right_lon = tip_lon - (spread_km / R) * (180.0 / math.pi) * math.sin(perp_rad) / math.cos(math.radians(tip_lat))
    
    return {
        "type": "Polygon",
        "coordinates": [[
            p0,
            [round(left_lon, 5), round(left_lat, 5)],
            [round(tip_lon, 5), round(tip_lat, 5)],
            [round(right_lon, 5), round(right_lat, 5)],
            p0
        ]]
    }

def solve_forward_dispersion_48h(corridor_id: str) -> CorridorForecastResponse:
    meta = CORRIDOR_METADATA.get(corridor_id, CORRIDOR_METADATA["indo-gangetic"])
    facilities = get_corridor_facilities(corridor_id)
    
    wind_spd = meta["default_wind_speed"]
    wind_dir = meta["default_wind_dir"]
    time_steps = [0, 6, 12, 18, 24, 30, 36, 42, 48]
    now = datetime.now(timezone.utc)
    
    snapshots: List[ForecastSnapshot] = []
    
    for h in time_steps:
        snap_time = (now + timedelta(hours=h)).isoformat()
        
        # Build composite GeoJSON features for this hour
        features = []
        max_aqi = 280
        
        for fac in facilities:
            flon, flat = fac["coordinates"]
            rate = fac.get("base_emission_rate_g_s", 400.0)
            
            # Severity scales with emission rate & stagnation
            aqi_val = min(480, int(200 + (rate / 3.0) + (h * 2.2)))
            max_aqi = max(max_aqi, aqi_val)
            
            geom = generate_plume_polygon(flon, flat, wind_dir, wind_spd, h, intensity_scale=rate / 400.0)
            
            features.append({
                "type": "Feature",
                "geometry": geom,
                "properties": {
                    "source_id": fac["facility_id"],
                    "source_name": fac["name"],
                    "category": fac["category"],
                    "hour_offset": h,
                    "estimated_aqi": aqi_val,
                    "aqi_color": "#7c2d12" if aqi_val > 350 else "#ef4444" if aqi_val > 250 else "#f59e0b"
                }
            })
            
        snapshots.append(ForecastSnapshot(
            hour_offset=h,
            timestamp_iso=snap_time,
            max_aqi=max_aqi,
            mean_pm25=round(max_aqi * 0.72, 1),
            plume_geojson={
                "type": "FeatureCollection",
                "features": features
            }
        ))
        
    return CorridorForecastResponse(
        corridor_id=corridor_id,
        generated_at=now.isoformat(),
        time_steps_hours=time_steps,
        meteorological_conditions={
            "wind_speed_kmh": wind_spd,
            "wind_direction_deg": wind_dir,
            "pbl_height_m": meta["pbl_height"],
            "inversion_risk": meta["inversion_risk"]
        },
        forecast_snapshots=snapshots
    )
