# Fasal Rakshak (फसल रक्षक)
### Smart India Hackathon (SIH) Problem Statement ID: 26131
**Title**: Early detection and management of crop diseases and pest infestations  
**Organization**: Department of Agriculture  
**Theme**: Agriculture, FoodTech & Rural Development  

---

## 🌟 Key Architecture & Completed User Requirements

### 1. 🏡 Farmer / Farm / Crop Profile
- Stores complete agricultural context:
  - Location (GPS Lat/Lng, Village, Taluka, District in Maharashtra e.g. Yavatmal, Nashik, Ahmednagar, Solapur).
  - Crop & Variety (e.g. Bt-Cotton RCH-659, Soybean JS-335, Thompson Seedless Grapes, Bhima Super Onion).
  - Sowing Date & Exact Phenological Stage (Germination, Vegetative, Flowering, Pod/Boll Development, Maturity, Harvesting).
  - Soil Characteristics (Black Cotton/Regur, Alluvial, Red, Laterite, pH, Drainage, Irrigation type).
- **Dual Context Integration**: Feeds context directly into **both** Current Diagnosis priors and Future Risk Forecasting models.

### 2. ⚡ Explicit Separation: Diagnosis vs Future Risk Engines
- **1. Current Diagnosis Engine**:
  - Image / Computer Vision symptom localization with bounding box overlays.
  - Multi-crop pathogen identification (Cotton Pink Bollworm, Soybean Rust, Tomato Late Blight, Grapes Downy Mildew, Pomegranate Bacterial Blight/Telya, Onion Purple Blotch, Sugarcane Red Rot).
  - Severity level assessment (`MILD`, `MODERATE`, `SEVERE`) and confidence scoring.
- **2. Future Epidemiological Risk Forecasting Engine**:
  - Predicts outbreak probability 7 days in advance **before symptoms manifest**.
  - Formula: $\text{Risk} = f(\text{Agromet Microclimate}, \text{Crop Stage}, \text{Soil Vector}, \text{Trap Surge ETL}, \text{Endemicity History})$.

### 3. 🛡️ Unified Data Ingestion Layer (`DataIngestionService`)
- Central ingestion gateway with validation pipelines:
  - Ingests & validates Agromet weather (Temp, RH, Rainfall, Leaf Wetness Duration).
  - Ingests & validates IoT soil & canopy telemetry with battery & stale sensor checks.
  - Normalizes pheromone & sticky trap counts and triggers Economic Threshold Level (ETL) breach alerts.
  - Integrates historical district endemicity matrices.

### 4. 📚 Authoritative IPM Knowledge Base (CIBRC / ICAR / MPKV Certified)
- Deterministic, authoritative rule repository — **Zero Hallucination** for chemical dosages:
  - 4-Tier IPM Plan: Cultural -> Mechanical -> Biological/Botanical -> Chemical.
  - Exact CIBRC registered dosages (ml/gm per 15L backpack pump and per acre).
  - Pre-Harvest Interval (PHI in days) and harvest countdown safety timer.
  - Toxicity label color coding (Red, Yellow, Blue, Green triangle).
  - Interactive Chemical Dilution & Knapsack Pump Calculator.

### 5. 🔐 5-Tier RBAC & Immutable Audit Trail
- 5 Distinct Roles:
  1. `FARMER`: Image scan, voice advisory, profile management, treatment logging.
  2. `KRISHI_SEVAK`: Field triage, verify farmer cases, inspect traps.
  3. `AGRI_EXPERT`: High-priority diagnostic queue, modify/confirm diagnoses, active learning approval.
  4. `DIAGNOSTIC_LAB`: Sample intake with QR verification, pathology test records.
  5. `GOVT_ADMIN`: Maharashtra-wide 36-district GIS surveillance, public SMS/WhatsApp epidemic broadcast dispatcher.
- **Immutable Audit Trail**: SHA-256 cryptographically hashed audit log for every mutation (who diagnosed, modified, or confirmed).

### 6. 📊 Production System Observability & Monitoring
- Live telemetry dashboard tracking:
  - API Health, throughput, p50/p95 latency percentiles.
  - AI Model confidence distribution & drift metrics.
  - Active IoT sensor nodes & stale sensor alert panel.
  - Public SMS/WhatsApp broadcast delivery queues.

---

## 🚀 Quick Start Instructions

### Prerequisites
- Python 3.11+
- Node.js v18+ & npm

### One-Click Launch (Windows)
Double-click `start_system.bat` or run:

```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

### URLs
- **Frontend App**: [http://localhost:5180](http://localhost:5180)
- **FastAPI Backend Docs (Swagger UI)**: [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)
- **Automated Test Suite**: `python backend/tests/test_all_features.py`
