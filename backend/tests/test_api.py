from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Gemini 2.0" in data["google_ai_integration"]

def test_list_corridors():
    response = client.get("/api/v1/corridors")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    ids = [c["id"] for c in data]
    assert "indo-gangetic" in ids
    assert "highveld-basin" in ids

def test_corridor_forecast():
    response = client.get("/api/v1/simulation/forecast/indo-gangetic")
    assert response.status_code == 200
    data = response.json()
    assert data["corridor_id"] == "indo-gangetic"
    assert len(data["forecast_snapshots"]) == 9

def test_corridor_flux():
    response = client.get("/api/v1/simulation/flux/indo-gangetic")
    assert response.status_code == 200
    data = response.json()
    assert data["transport_rate_kg_hr"] > 0
    assert "NW" in data["direction_arrow"]

def test_federated_status():
    response = client.get("/api/v1/federated/status")
    assert response.status_code == 200
    data = response.json()
    assert len(data["nodes"]) == 5
    assert data["round_number"] >= 14

def test_policy_simulation():
    payload = {
        "corridor_id": "indo-gangetic",
        "agricultural_curtailment_pct": 50,
        "industrial_curtailment_pct": 30,
        "traffic_restriction_pct": 20
    }
    response = client.post("/api/v1/policy/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["net_reduction_pct"] > 0
    assert data["projected_peak_pm25"] < data["baseline_peak_pm25"]

def test_attribution_trace_endpoint():
    response = client.post(
        "/api/v1/attribution/trace",
        data={
            "lat": "28.6139",
            "lon": "77.2090",
            "corridor_id": "indo-gangetic",
            "search_radius_km": "60.0",
            "observed_aqi": "342.0"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["reverse_trajectory"]["curvilinear_distance_km"] > 0
    assert len(data["ranked_culprits"]) > 0
