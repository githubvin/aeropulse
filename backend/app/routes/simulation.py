from fastapi import APIRouter, Query
from ..models.schemas import CorridorForecastResponse, FluxResponse
from ..services.dispersion_solver import solve_forward_dispersion_48h
from ..services.flux_calculator import calculate_cross_border_flux

router = APIRouter(prefix="/simulation", tags=["Simulation"])

@router.get("/forecast/{corridor_id}", response_model=CorridorForecastResponse)
def get_corridor_forecast(corridor_id: str):
    """Returns 48-hour forward advection-diffusion plume dispersion snapshots."""
    return solve_forward_dispersion_48h(corridor_id)

@router.get("/flux/{corridor_id}", response_model=FluxResponse)
def get_corridor_flux(corridor_id: str, curtailment: float = Query(1.0, ge=0.1, le=1.0)):
    """Returns real-time cross-border pollutant mass transport flux."""
    return calculate_cross_border_flux(corridor_id, curtailment_factor=curtailment)
