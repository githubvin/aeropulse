from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from ..models.schemas import AttributionResponse
from ..services.gemini_service import inspect_smoke_image, rank_culprit_sources_with_reasoning
from ..services.back_trajectory import compute_back_trajectory
from ..services.industrial_registry import filter_facilities_in_cone
from ..services.dispersion_solver import CORRIDOR_METADATA

router = APIRouter(prefix="/attribution", tags=["Attribution"])

@router.post("/trace", response_model=AttributionResponse)
async def trace_pollution_source(
    photo: Optional[UploadFile] = File(None),
    lat: float = Form(28.6139),
    lon: float = Form(77.2090),
    corridor_id: str = Form("indo-gangetic"),
    search_radius_km: float = Form(50.0),
    observed_aqi: float = Form(342.0)
):
    """
    Executes AeroTrace Multimodal Reverse Plume Attribution:
    1. Gemini 2.0 Flash visual photo inspection.
    2. Lagrangian reverse wind back-trajectory calculation.
    3. Upwind industrial candidate querying.
    4. AI explainable culprit ranking.
    """
    photo_bytes = await photo.read() if photo else None
    
    # 1. Visual Inspection
    inspection = inspect_smoke_image(photo_bytes, filename=photo.filename if photo else None)
    
    # 2. Get corridor meteorological conditions
    meta = CORRIDOR_METADATA.get(corridor_id, CORRIDOR_METADATA["indo-gangetic"])
    wind_spd = meta["default_wind_speed"]
    wind_dir = meta["default_wind_dir"]
    
    # 3. Calculate Back-Trajectory & Dispersion Cone
    lookback_hrs = round(min(search_radius_km / wind_spd, 4.0), 2)
    reverse_res = compute_back_trajectory(
        obs_lon=lon,
        obs_lat=lat,
        lookback_hours=lookback_hrs,
        wind_speed_kmh=wind_spd,
        wind_direction_deg=wind_dir
    )
    
    # 4. Filter upstream facilities in cone
    candidates = filter_facilities_in_cone(
        corridor_id=corridor_id,
        obs_lon=lon,
        obs_lat=lat,
        upwind_cone_polygon_coords=reverse_res.upwind_cone_polygon,
        mean_wind_speed_kmh=wind_spd,
        max_search_radius_km=search_radius_km
    )
    
    # 5. Rank culprits with Gemini reasoning
    ranked_culprits = rank_culprit_sources_with_reasoning(
        inspection=inspection,
        candidates=candidates,
        mean_wind_speed_kmh=wind_spd,
        mean_wind_direction_deg=wind_dir,
        observed_aqi=observed_aqi
    )
    
    # Build recommended action
    top_culprit_name = ranked_culprits[0].name if ranked_culprits else "Diffuse Upstream Cluster"
    recommended_action = (
        f"Issue immediate Bilateral Emergency Verification Order for '{top_culprit_name}' "
        f"and initiate downstream health buffer protocols across the border line."
    )
    
    return AttributionResponse(
        status="success",
        corridor_id=corridor_id,
        observation={
            "lat": lat,
            "lon": lon,
            "fuzzed_geohash": f"geo-{round(lat, 2)}-{round(lon, 2)}"
        },
        visual_inspection=inspection,
        reverse_trajectory=reverse_res,
        candidate_sources_found=len(candidates),
        ranked_culprits=ranked_culprits,
        cross_border_jurisdiction_flag=True,
        recommended_action=recommended_action
    )
