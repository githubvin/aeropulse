from app.services.back_trajectory import compute_back_trajectory, destination_point

def test_destination_point():
    lon, lat = 77.2090, 28.6139
    # Step 10 km North (bearing 0)
    d_lon, d_lat = destination_point(lon, lat, distance_km=10.0, bearing_deg=0.0)
    assert d_lat > lat
    assert round(d_lon, 2) == round(lon, 2)

def test_back_trajectory_nw_wind():
    # If wind is coming FROM 315° (NW) at 15 km/h over 3 hours:
    # Plume travelled ~45 km from NW to SE.
    # Reverse trajectory must step backwards towards the NW!
    res = compute_back_trajectory(
        obs_lon=77.2090,
        obs_lat=28.6139,
        lookback_hours=3.0,
        wind_speed_kmh=15.0,
        wind_direction_deg=315.0
    )
    assert res.curvilinear_distance_km == 45.0
    assert len(res.trajectory_path) >= 5
    
    # Final point of trajectory should be NW of origin (lat increased, lon decreased)
    final_lon, final_lat = res.trajectory_path[-1]
    assert final_lat > 28.6139
    assert final_lon < 77.2090
    assert len(res.upwind_cone_polygon) == 5
