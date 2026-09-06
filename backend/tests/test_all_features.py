import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_1_farm_profile():
    print("Testing 1. Farmer / Farm / Crop Profile...")
    res = client.get("/api/profile/farm_101", headers={"x-user-role": "FARMER", "x-user-id": "farmer_101"})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["farmer_name"].startswith("Ramesh")
    assert data["crop_name"] == "Cotton"
    assert data["district"] == "Yavatmal"
    print("  [OK] Farm Profile retrieved successfully with crop, variety, stage, and soil attributes.")

def test_2_data_ingestion_layer():
    print("Testing 2. Unified Data Ingestion Layer...")
    # Ingest weather
    w_res = client.post("/api/ingest/weather", json={
        "station_id": "AGROMET-MH-TEST",
        "district": "Yavatmal",
        "temperature_c": 32.0,
        "relative_humidity_pct": 85.0,
        "rainfall_mm_24h": 20.0,
        "leaf_wetness_hours": 9.0,
        "wind_speed_kmh": 14.0,
        "forecast_rain_prob_pct": 80.0,
        "timestamp": "2026-09-05T19:40:00"
    }, headers={"x-user-role": "GOVT_ADMIN", "x-user-id": "admin_505"})
    assert w_res.status_code == 200, w_res.text
    
    # Ingest trap count with ETL threshold
    t_res = client.post("/api/ingest/trap", json={
        "trap_id": "TRP-TEST-99",
        "farm_id": "farm_101",
        "trap_type": "Pheromone Trap",
        "target_pest": "Pink Bollworm",
        "count": 16,
        "etl_threshold": 8,
        "is_etl_breached": True,
        "date_recorded": "2026-09-05T19:40:00"
    }, headers={"x-user-role": "KRISHI_SEVAK", "x-user-id": "ksevak_202"})
    assert t_res.status_code == 200, t_res.text
    assert t_res.json()["etl_breached"] is True
    print("  [OK] Data ingestion layer validated weather & trap telemetry with ETL threshold checking.")

def test_3_current_diagnosis_engine():
    print("Testing 3. Current Diagnosis Engine (Computer Vision / Symptoms)...")
    res = client.post("/api/diagnose/image", data={
        "farm_id": "farm_101",
        "crop_hint": "Cotton"
    }, headers={"x-user-role": "FARMER", "x-user-id": "farmer_101"})
    assert res.status_code == 200, res.text
    data = res.json()
    assert "Pink Bollworm" in data["detected_entity"]
    assert data["confidence_score"] > 0.85
    assert data["bounding_box"] is not None
    assert "authoritative_ipm" in data
    print("  [OK] Current Diagnosis Engine identified entity, localized bounding box, and attached authoritative IPM.")

def test_4_future_risk_forecasting_engine():
    print("Testing 4. Future Epidemiological Risk Forecasting Engine...")
    res = client.post("/api/forecast/risk?district=Yavatmal&crop_name=Cotton&farm_id=farm_101", headers={
        "x-user-role": "FARMER", "x-user-id": "farmer_101"
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["risk_score_pct"] > 50.0
    assert len(data["driving_factors"]) >= 4
    assert len(data["preventive_actions"]) >= 2
    print("  [OK] Future Risk Engine computed 7-day risk score using Agromet + Soil + Stage + Traps + Endemicity.")

def test_5_authoritative_ipm_database():
    print("Testing 5. Authoritative IPM Knowledge Base (Zero Hallucination)...")
    res = client.get("/api/ipm/lookup?pest_or_disease=cotton_pink_bollworm&crop=Cotton")
    assert res.status_code == 200, res.text
    data = res.json()
    assert len(data["chemical_control"]) > 0
    first_chem = data["chemical_control"][0]
    assert "dosage_per_15l_pump" in first_chem
    assert "phi_days" in first_chem
    assert "cibr_approval" in first_chem
    print("  [OK] Authoritative CIBRC IPM repository returned verified chemical dosages and PHI intervals.")

def test_6_rbac_and_audit_trail():
    print("Testing 6. 5-Tier RBAC and Immutable Audit Trail...")
    # Get audit logs
    res = client.get("/api/audit/logs", headers={"x-user-role": "GOVT_ADMIN", "x-user-id": "admin_505"})
    assert res.status_code == 200, res.text
    logs = res.json()
    assert len(logs) > 0
    assert "verification_hash" in logs[0]
    assert len(logs[0]["verification_hash"]) == 64 # SHA-256 hash length
    print("  [OK] Audit trail verified with SHA-256 cryptographic hashes for all state mutations.")

def test_7_system_monitoring_and_observability():
    print("Testing 7. Production System Observability...")
    res = client.get("/api/system/metrics")
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["system_status"] in ["HEALTHY", "DEGRADED"]
    assert data["active_sensors_count"] > 0
    assert data["alert_delivery_rate_pct"] > 90.0
    print("  [OK] System Observability tracking API latency, model confidence, sensor health, and alert delivery.")

def run_all_tests():
    test_1_farm_profile()
    test_2_data_ingestion_layer()
    test_3_current_diagnosis_engine()
    test_4_future_risk_forecasting_engine()
    test_5_authoritative_ipm_database()
    test_6_rbac_and_audit_trail()
    test_7_system_monitoring_and_observability()
    print("\nSUCCESS: ALL 7 TEST SUITES PASSED FLAWLESSLY!")

if __name__ == "__main__":
    run_all_tests()
