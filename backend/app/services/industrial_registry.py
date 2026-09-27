import math
from typing import List, Dict, Any
from shapely.geometry import Point, Polygon
from ..models.schemas import CandidateFacility

CORRIDOR_FACILITIES: Dict[str, List[Dict[str, Any]]] = {
    "indo-gangetic": [
        {
            "facility_id": "FAC-IN-001",
            "name": "Panipat Thermal Power Station (Stack A & B)",
            "category": "Thermal Power Plant",
            "fuel_type": "Bituminous Coal",
            "coordinates": [76.9650, 29.3880],  # [lon, lat]
            "capacity": "1360 MW",
            "primary_pollutants": ["SO2", "NOx", "PM2.5", "Fly Ash"],
            "base_emission_rate_g_s": 420.0
        },
        {
            "facility_id": "FAC-IN-002",
            "name": "Guru Gobind Singh Super Thermal Plant (Ropar)",
            "category": "Thermal Power Plant",
            "fuel_type": "Sub-bituminous Coal",
            "coordinates": [76.5320, 31.0250],
            "capacity": "1260 MW",
            "primary_pollutants": ["SO2", "PM2.5", "Heavy Soot"],
            "base_emission_rate_g_s": 380.0
        },
        {
            "facility_id": "FAC-IN-003",
            "name": "Sonipat-Kundli Industrial Brick Kiln Cluster",
            "category": "Brick Kilns & Clay Ceramics",
            "fuel_type": "Petcoke & Biomass Briquettes",
            "coordinates": [77.0850, 28.9100],
            "capacity": "120 Zigzag Kilns",
            "primary_pollutants": ["Black Carbon", "PM10", "PM2.5", "CO"],
            "base_emission_rate_g_s": 290.0
        },
        {
            "facility_id": "FAC-IN-004",
            "name": "Sangrur-Patiala Active Stubble Burning Cluster",
            "category": "Agricultural Biomass Burning",
            "fuel_type": "Paddy Straw Residue",
            "coordinates": [76.1200, 30.2500],
            "capacity": "45 VIIRS Hotspot Anomaly Pixels",
            "primary_pollutants": ["Dense Biomass Smoke", "PM2.5", "VOCs", "CO"],
            "base_emission_rate_g_s": 750.0
        },
        {
            "facility_id": "FAC-IN-005",
            "name": "Ghaziabad-Sahibabad Metallurgical & Chemical Zone",
            "category": "Industrial Smelters & Chemical Processors",
            "fuel_type": "Furnace Oil & Scrap Coal",
            "coordinates": [77.3750, 28.6700],
            "capacity": "85 Medium Rolling Mills",
            "primary_pollutants": ["Heavy Metals", "PM2.5", "Acid Mist"],
            "base_emission_rate_g_s": 240.0
        }
    ],
    "highveld-basin": [
        {
            "facility_id": "FAC-ZA-001",
            "name": "Kendal Power Station (Eskom)",
            "category": "Thermal Power Plant",
            "fuel_type": "Low-grade Coal (Dry-cooled)",
            "coordinates": [28.9680, -26.0900],
            "capacity": "4116 MW",
            "primary_pollutants": ["SO2", "PM2.5", "NO2"],
            "base_emission_rate_g_s": 650.0
        },
        {
            "facility_id": "FAC-ZA-002",
            "name": "Kriel Power Station",
            "category": "Thermal Power Plant",
            "fuel_type": "Sub-bituminous Coal",
            "coordinates": [29.1790, -26.2520],
            "capacity": "3000 MW",
            "primary_pollutants": ["SO2", "Fly Ash", "NOx"],
            "base_emission_rate_g_s": 510.0
        },
        {
            "facility_id": "FAC-ZA-003",
            "name": "Sasol Secunda Synfuels Complex",
            "category": "Petrochemical Coal-to-Liquid Refinery",
            "fuel_type": "Coal Gasification & Syngas",
            "coordinates": [29.1760, -26.5490],
            "capacity": "World's Largest Single-point Emitter",
            "primary_pollutants": ["CO2", "SO2", "VOCs", "H2S"],
            "base_emission_rate_g_s": 890.0
        },
        {
            "facility_id": "FAC-ZA-004",
            "name": "Witbank / Emalahleni Open-Cast Coal Basin",
            "category": "Coal Mining & Spontaneous Combustion",
            "fuel_type": "Exposed Coal Seam Smoldering",
            "coordinates": [29.2300, -25.8700],
            "capacity": "18 Surface Mines",
            "primary_pollutants": ["Fugitive Dust", "PM10", "PM2.5", "SO2"],
            "base_emission_rate_g_s": 360.0
        }
    ],
    "pan-amazonian": [
        {
            "facility_id": "FAC-BR-001",
            "name": "Sinop-Sorriso Agricultural Deforestation Arc",
            "category": "Forest Biomass Clearing",
            "fuel_type": "Tropical Hardwood & Slash",
            "coordinates": [-55.5100, -11.8600],
            "capacity": "78 VIIRS Active Fire Anomalies",
            "primary_pollutants": ["Dense Biomass Smoke", "PM2.5", "Black Carbon"],
            "base_emission_rate_g_s": 920.0
        },
        {
            "facility_id": "FAC-BR-002",
            "name": "Pantanal Corumbá Wetland Fire Cluster",
            "category": "Peat & Grassland Wildfire",
            "fuel_type": "Dry Biomass & Peat",
            "coordinates": [-57.6500, -19.0100],
            "capacity": "52 Hotspots",
            "primary_pollutants": ["Organic Aerosols", "CO", "PM2.5"],
            "base_emission_rate_g_s": 680.0
        }
    ],
    "jing-jin-ji": [
        {
            "facility_id": "FAC-CN-001",
            "name": "Tangshan Steel Smelting Hub",
            "category": "Heavy Metallurgy & Blast Furnaces",
            "fuel_type": "Metallurgical Coke",
            "coordinates": [118.1800, 39.6300],
            "capacity": "Primary Global Steel Basin",
            "primary_pollutants": ["Heavy PM2.5", "SO2", "NOx"],
            "base_emission_rate_g_s": 780.0
        },
        {
            "facility_id": "FAC-CN-002",
            "name": "Tianjin Binhai Petrochemical Complex",
            "category": "Chemical & Petrochemical Refinery",
            "fuel_type": "Crude Distillation & Crackers",
            "coordinates": [117.7200, 38.9900],
            "capacity": "Heavy Coastal Refinery",
            "primary_pollutants": ["VOCs", "SO2", "Chemical Haze"],
            "base_emission_rate_g_s": 490.0
        }
    ],
    "eurasian-boreal": [
        {
            "facility_id": "FAC-RU-001",
            "name": "Krasnoyarsk Heavy Aluminum & Smelter Complex",
            "category": "Heavy Non-Ferrous Metallurgy",
            "fuel_type": "Anode Carbon & Lignite Power",
            "coordinates": [92.9300, 56.0800],
            "capacity": "RUSAL Krasnoyarsk Smelter",
            "primary_pollutants": ["Fluorides", "Tar Pitch Volatiles", "PM2.5"],
            "base_emission_rate_g_s": 460.0
        },
        {
            "facility_id": "FAC-RU-002",
            "name": "Angara Taiga Boreal Wildfire Corridor",
            "category": "Boreal Forest Peat Fire",
            "fuel_type": "Siberian Conifer & Deep Peat",
            "coordinates": [98.5000, 57.8000],
            "capacity": "110 VIIRS Fire Pixels",
            "primary_pollutants": ["Pyrocumulonimbus Smoke", "CO", "PM2.5"],
            "base_emission_rate_g_s": 850.0
        }
    ]
}

def haversine_distance_km(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_corridor_facilities(corridor_id: str) -> List[Dict[str, Any]]:
    return CORRIDOR_FACILITIES.get(corridor_id, CORRIDOR_FACILITIES["indo-gangetic"])

def filter_facilities_in_cone(
    corridor_id: str,
    obs_lon: float,
    obs_lat: float,
    upwind_cone_polygon_coords: List[List[float]],
    mean_wind_speed_kmh: float,
    max_search_radius_km: float = 60.0
) -> List[Dict[str, Any]]:
    facilities = get_corridor_facilities(corridor_id)
    polygon = Polygon(upwind_cone_polygon_coords) if len(upwind_cone_polygon_coords) >= 3 else None
    
    candidates = []
    for fac in facilities:
        flon, flat = fac["coordinates"]
        dist_km = haversine_distance_km(obs_lon, obs_lat, flon, flat)
        
        # Check radial distance constraint
        if dist_km > max_search_radius_km:
            continue
            
        point = Point(flon, flat)
        in_cone = polygon.contains(point) if polygon else True
        
        # Also include if very close (< 20km) even if slightly at edge of discretized polygon
        if in_cone or dist_km <= 20.0:
            transit_hours = round(dist_km / max(mean_wind_speed_kmh, 5.0), 2)
            fac_result = dict(fac)
            fac_result["distance_km"] = round(dist_km, 1)
            fac_result["transit_time_hrs"] = transit_hours
            candidates.append(fac_result)
            
    # Sort candidates by distance from observation point
    candidates.sort(key=lambda x: x["distance_km"])
    return candidates
