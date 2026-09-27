from app.services.industrial_registry import filter_facilities_in_cone, get_corridor_facilities
from app.services.back_trajectory import compute_back_trajectory
from app.services.gemini_service import inspect_smoke_image, rank_culprit_sources_with_reasoning

def test_cone_filtering():
    # Observation near Delhi
    obs_lon, obs_lat = 77.2090, 28.6139
    reverse_res = compute_back_trajectory(
        obs_lon=obs_lon,
        obs_lat=obs_lat,
        lookback_hours=3.0,
        wind_speed_kmh=15.0,
        wind_direction_deg=315.0
    )
    candidates = filter_facilities_in_cone(
        corridor_id="indo-gangetic",
        obs_lon=obs_lon,
        obs_lat=obs_lat,
        upwind_cone_polygon_coords=reverse_res.upwind_cone_polygon,
        mean_wind_speed_kmh=15.0,
        max_search_radius_km=150.0
    )
    assert len(candidates) > 0
    # Candidate should have distance and transit time calculated
    assert "distance_km" in candidates[0]
    assert "transit_time_hrs" in candidates[0]

def test_attribution_ranking():
    inspection = inspect_smoke_image(None)
    assert inspection.smoke_detected is True
    
    candidates = get_corridor_facilities("indo-gangetic")
    for c in candidates:
        c["distance_km"] = 18.4
        c["transit_time_hrs"] = 1.2
        
    ranked = rank_culprit_sources_with_reasoning(
        inspection=inspection,
        candidates=candidates,
        mean_wind_speed_kmh=15.0,
        mean_wind_direction_deg=315.0
    )
    assert len(ranked) > 0
    assert ranked[0].match_score_pct > 0
    assert len(ranked[0].reasoning) > 10
