import math
from typing import List, Tuple
from ..models.schemas import ReverseTrajectoryResult

def destination_point(lon: float, lat: float, distance_km: float, bearing_deg: float) -> Tuple[float, float]:
    """Calculate destination point given start point, distance in km, and bearing in degrees."""
    R = 6371.0  # Earth radius in km
    bearing_rad = math.radians(bearing_deg)
    lat_rad = math.radians(lat)
    lon_rad = math.radians(lon)

    dest_lat_rad = math.asin(
        math.sin(lat_rad) * math.cos(distance_km / R) +
        math.cos(lat_rad) * math.sin(distance_km / R) * math.cos(bearing_rad)
    )
    dest_lon_rad = lon_rad + math.atan2(
        math.sin(bearing_rad) * math.sin(distance_km / R) * math.cos(lat_rad),
        math.cos(distance_km / R) - math.sin(lat_rad) * math.sin(dest_lat_rad)
    )
    return round(math.degrees(dest_lon_rad), 5), round(math.degrees(dest_lat_rad), 5)

def compute_back_trajectory(
    obs_lon: float,
    obs_lat: float,
    lookback_hours: float = 3.0,
    wind_speed_kmh: float = 15.0,
    wind_direction_deg: float = 315.0,  # Meteorological wind direction: coming FROM this angle
    cone_half_angle_deg: float = 18.0
) -> ReverseTrajectoryResult:
    """
    Computes reverse air-parcel trajectory and upstream dispersion cone.
    In meteorology, wind direction 315° (NW) means air is flowing FROM 315° TO 135°.
    To trace backwards to the source, we step along the direction the wind CAME FROM (315°).
    """
    upwind_bearing = wind_direction_deg % 360.0
    total_travel_distance_km = round(wind_speed_kmh * lookback_hours, 1)
    
    # 1. Compute discrete trajectory points backwards in time (steps of 15 mins)
    steps = max(int(lookback_hours * 4), 4)
    step_distance_km = total_travel_distance_km / steps
    
    trajectory_points: List[List[float]] = [[obs_lon, obs_lat]]
    cur_lon, cur_lat = obs_lon, obs_lat
    
    for i in range(1, steps + 1):
        dist = i * step_distance_km
        # Small turbulent perturbation to simulate realistic wind field curve
        curv_bearing = upwind_bearing + 3.0 * math.sin(i * 0.8)
        p_lon, p_lat = destination_point(obs_lon, obs_lat, dist, curv_bearing)
        trajectory_points.append([p_lon, p_lat])

    # 2. Build upstream dispersion cone polygon
    # Left edge of cone
    left_bearing = (upwind_bearing - cone_half_angle_deg) % 360.0
    left_tip_lon, left_tip_lat = destination_point(obs_lon, obs_lat, total_travel_distance_km * 1.1, left_bearing)
    
    # Center apex
    center_tip_lon, center_tip_lat = destination_point(obs_lon, obs_lat, total_travel_distance_km * 1.15, upwind_bearing)
    
    # Right edge of cone
    right_bearing = (upwind_bearing + cone_half_angle_deg) % 360.0
    right_tip_lon, right_tip_lat = destination_point(obs_lon, obs_lat, total_travel_distance_km * 1.1, right_bearing)
    
    cone_polygon = [
        [obs_lon, obs_lat],
        [left_tip_lon, left_tip_lat],
        [center_tip_lon, center_tip_lat],
        [right_tip_lon, right_tip_lat],
        [obs_lon, obs_lat]
    ]

    return ReverseTrajectoryResult(
        curvilinear_distance_km=total_travel_distance_km,
        transit_time_hours=round(lookback_hours, 2),
        mean_wind_speed_kmh=wind_speed_kmh,
        mean_wind_direction_deg=wind_direction_deg,
        trajectory_path=trajectory_points,
        upwind_cone_polygon=cone_polygon
    )
