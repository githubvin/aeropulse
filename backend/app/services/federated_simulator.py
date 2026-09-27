import hashlib
import time
from typing import List
from ..models.schemas import FederatedNodeStatus, FederatedMeshResponse

# In-memory federated learning state
_FL_STATE = {
    "round_number": 14,
    "total_rounds": 20,
    "global_convergence_loss": 0.0842,
    "privacy_budget_epsilon": 1.25,
    "is_aggregating": False,
    "last_aggregated_at": time.time()
}

def get_federated_nodes() -> List[FederatedNodeStatus]:
    return [
        FederatedNodeStatus(
            node_id="NODE-IN",
            country="India",
            flag="🇮🇳",
            agency="CPCB / IIT Delhi Climate Cluster",
            status="Synchronized (Local Training Complete)",
            local_samples_count=184500,
            model_version="v2.4-AeroNet",
            sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            latency_ms=24
        ),
        FederatedNodeStatus(
            node_id="NODE-ZA",
            country="South Africa",
            flag="🇿🇦",
            agency="SAAQIS / CSIR Atmospheric Hub",
            status="Synchronized (Local Training Complete)",
            local_samples_count=112000,
            model_version="v2.4-AeroNet",
            sha256_hash="8f4b23a9d701e82b3c4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
            latency_ms=185
        ),
        FederatedNodeStatus(
            node_id="NODE-BR",
            country="Brazil",
            flag="🇧🇷",
            agency="INPE / CPTEC Amazonian Fire Registry",
            status="Synchronized (Local Training Complete)",
            local_samples_count=145800,
            model_version="v2.4-AeroNet",
            sha256_hash="4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
            latency_ms=210
        ),
        FederatedNodeStatus(
            node_id="NODE-CN",
            country="China",
            flag="🇨🇳",
            agency="CNEMC / Chinese Academy of Meteorological Sciences",
            status="Synchronized (Local Training Complete)",
            local_samples_count=290400,
            model_version="v2.4-AeroNet",
            sha256_hash="7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d",
            latency_ms=92
        ),
        FederatedNodeStatus(
            node_id="NODE-RU",
            country="Russia",
            flag="🇷🇺",
            agency="Roshydromet / Siberian Climate Research Center",
            status="Synchronized (Local Training Complete)",
            local_samples_count=98200,
            model_version="v2.4-AeroNet",
            sha256_hash="1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
            latency_ms=145
        )
    ]

def get_federated_mesh_status() -> FederatedMeshResponse:
    nodes = get_federated_nodes()
    return FederatedMeshResponse(
        round_number=_FL_STATE["round_number"],
        total_rounds=_FL_STATE["total_rounds"],
        global_convergence_loss=_FL_STATE["global_convergence_loss"],
        privacy_budget_epsilon=_FL_STATE["privacy_budget_epsilon"],
        nodes=nodes,
        is_aggregating=_FL_STATE["is_aggregating"]
    )

def trigger_federated_round() -> FederatedMeshResponse:
    """Simulates a FedAvg aggregation round across sovereign nodes."""
    _FL_STATE["is_aggregating"] = True
    time.sleep(0.5)  # brief simulation
    
    if _FL_STATE["round_number"] < _FL_STATE["total_rounds"]:
        _FL_STATE["round_number"] += 1
        # Loss decreases monotonically with noise
        _FL_STATE["global_convergence_loss"] = round(max(0.0210, _FL_STATE["global_convergence_loss"] * 0.94), 4)
        _FL_STATE["privacy_budget_epsilon"] = round(_FL_STATE["privacy_budget_epsilon"] + 0.05, 2)
        
    _FL_STATE["is_aggregating"] = False
    _FL_STATE["last_aggregated_at"] = time.time()
    
    return get_federated_mesh_status()
