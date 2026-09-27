from fastapi import APIRouter
from ..models.schemas import FederatedMeshResponse
from ..services.federated_simulator import get_federated_mesh_status, trigger_federated_round

router = APIRouter(prefix="/federated", tags=["Federated"])

@router.get("/status", response_model=FederatedMeshResponse)
def get_status():
    """Returns current status of sovereign nodes and global federated model convergence."""
    return get_federated_mesh_status()

@router.post("/trigger-round", response_model=FederatedMeshResponse)
def run_training_round():
    """Simulates a new federated parameter aggregation round across BRICS nodes."""
    return trigger_federated_round()
