from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    FARMER = "FARMER"
    KRISHI_SEVAK = "KRISHI_SEVAK"
    AGRI_EXPERT = "AGRI_EXPERT"
    DIAGNOSTIC_LAB = "DIAGNOSTIC_LAB"
    GOVT_ADMIN = "GOVT_ADMIN"

class CropStage(str, Enum):
    GERMINATION = "Germination / रुजवण"
    VEGETATIVE = "Vegetative / शाकीय वाढ"
    FLOWERING = "Flowering / फुले येणे"
    POD_FRUIT_DEV = "Pod / Fruit Development / फळ-बोंड धारणा"
    MATURITY = "Maturity / पक्वता"
    HARVESTING = "Harvesting / काढणी"

class SoilType(str, Enum):
    BLACK_COTTON = "Black Cotton (काळी / रेगूर)"
    ALLUVIAL = "Alluvial (गाळाची जमीन)"
    RED_LOAM = "Red Loamy (तांबडी जमीन)"
    LATERITE = "Laterite (जांभी जमीन)"
    MEDIUM_BLACK = "Medium Black (मध्यम काळी)"
    SANDY_LOAM = "Sandy Loam (वालुकामय)"

class SeverityLevel(str, Enum):
    NONE = "None / निरोगी"
    MILD = "Mild (सौम्य - <15%)"
    MODERATE = "Moderate (मध्यम - 15-40%)"
    SEVERE = "Severe (तीव्र - >40%)"

class RiskLevel(str, Enum):
    LOW = "Low (कमी धोका)"
    GUARDED = "Guarded (सावधान)"
    MODERATE = "Moderate (मध्यम धोका)"
    HIGH = "High (उच्च धोका)"
    CRITICAL = "Critical (अति-गंभीर)"

class ToxicityLabel(str, Enum):
    GREEN = "Green (Slightly Toxic / हिरवा त्रिकोण)"
    BLUE = "Blue (Moderately Toxic / निळा त्रिकोण)"
    YELLOW = "Yellow (Highly Toxic / पिवळा त्रिकोण)"
    RED = "Red (Extremely Toxic / लाल त्रिकोण - Use Caution)"

# 1. Farmer / Farm / Crop Profile Schema
class FarmProfile(BaseModel):
    id: str
    farmer_name: str
    farmer_id: str
    contact: str
    district: str
    taluka: str
    village: str
    latitude: float
    longitude: float
    farm_size_acres: float
    crop_name: str
    crop_variety: str
    sowing_date: str
    days_after_sowing: int = 82
    crop_stage: CropStage
    soil_type: SoilType
    soil_ph: float = 7.2
    soil_drainage: str = "Good"
    irrigation_type: str = "Rainfed"
    created_at: str

# 2. Ingested Data Schemas
class WeatherData(BaseModel):
    station_id: str
    district: str
    temperature_c: float
    relative_humidity_pct: float
    rainfall_mm_24h: float
    leaf_wetness_hours: float
    wind_speed_kmh: float
    forecast_rain_prob_pct: float
    timestamp: str

class SensorTelemetry(BaseModel):
    sensor_id: str
    farm_id: str
    soil_moisture_pct: float
    canopy_temperature_c: float
    leaf_wetness_duration_hrs: float
    soil_ec: float
    solar_radiation_w_m2: float
    battery_level_pct: float = 95.0
    status: str = "ACTIVE" # ACTIVE, STALE, ERROR
    timestamp: str

class TrapData(BaseModel):
    trap_id: str
    farm_id: str
    trap_type: str # Pheromone, Sticky Yellow, Sticky Blue, Light Trap
    target_pest: str # Pink Bollworm, Fall Armyworm, Whitefly, Thrips, Helicoverpa
    count: int
    etl_threshold: int
    is_etl_breached: bool
    photo_url: Optional[str] = None
    date_recorded: str

# 3. Authoritative IPM Schema
class IPMRecommendation(BaseModel):
    pest_or_disease: str
    scientific_name: str
    affected_crops: List[str]
    symptoms_summary: Dict[str, str] # en, mr, hi
    cultural_control: List[Dict[str, str]]
    mechanical_control: List[Dict[str, str]]
    biological_control: List[Dict[str, str]]
    chemical_control: List[Dict[str, Any]] # trade_name, active_ingredient, dosage_per_15l_pump, dosage_per_acre, phi_days, toxicity_label, cibr_approval
    safety_instructions: List[Dict[str, str]]
    restricted_substances_warning: Optional[str] = None

# 4. Current Diagnosis Output
class SymptomDetection(BaseModel):
    detected_entity: str
    scientific_name: str
    crop: str
    confidence_score: float # 0.0 - 1.0
    severity: SeverityLevel
    affected_plant_part: str # Leaf, Stem, Boll/Fruit, Root
    bounding_box: Optional[Dict[str, float]] = None # x, y, width, height
    visual_symptoms: List[str]
    symptom_heatmap_url: Optional[str] = None
    authoritative_ipm: IPMRecommendation
    farmer_profile_matched: bool = True
    top_alternatives: List[Dict[str, Any]] = []

# 5. Future Epidemiological Risk Forecast
class DailyRiskForecast(BaseModel):
    day_index: int  # 1-7
    date: str  # e.g. "06 Sep"
    temperature_c: float
    relative_humidity_pct: float
    rainfall_mm: float
    risk_level: RiskLevel
    risk_pct: float
    agronomy_advice: str

class FutureRiskForecast(BaseModel):
    crop: str
    district: str
    risk_level: RiskLevel
    risk_score_pct: float # 0-100%
    primary_threat: str
    driving_factors: List[str]
    agro_climatic_indices: Dict[str, Any] # GDD, Wallin Index, Trap Surge, Soil Susceptibility
    daily_forecast: List[DailyRiskForecast] = []
    forecast_window_days: int = 7
    preventive_actions: List[Dict[str, str]]
    etl_breach_active: bool = False

class FieldInspectionRecord(BaseModel):
    status: str = "PENDING" # PENDING, IN_PROGRESS, COMPLETED
    officer_id: Optional[str] = "ksevak_202"
    officer_name: Optional[str] = "Anil S. Deshmukh (Ward-4, Yavatmal)"
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    latitude: Optional[float] = 20.4285
    longitude: Optional[float] = 78.5392
    distance_km: float = 4.2
    field_photos: List[str] = [] # Plant-level, Leaf, Stem, Boll/Fruit, Whole plant
    observed_symptoms: List[str] = [] # Leaf discoloration, Boll damage, Larvae observed, Fungal growth, Stem lesions
    affected_plants_pct: int = 25
    pest_observed: bool = True
    trap_inspected: bool = True
    trap_count: int = 14
    is_etl_breached: bool = True
    officer_observation: str = "Field inspection verified severe pink bollworm rosetted flowers & entrance boreholes."
    officer_assessment: str = "VERIFIED" # VERIFIED, UNCERTAIN, HIGH_RISK_ESCALATION
    inspection_notes: Optional[str] = "Confirmed ETL breach. Physical evidence consistent with AI vision prior. Recommended prompt CIBRC bio-chemical schedule."
    advisory_dispatched: bool = True

# 6. Full Case Record
class CaseRecord(BaseModel):
    case_id: str
    farmer_profile: FarmProfile
    image_url: str
    diagnosis: SymptomDetection
    future_risk: FutureRiskForecast
    status: str # NEW, PENDING_FIELD_VERIFICATION, FIELD_VERIFIED, EXPERT_TRIAGED, LAB_REFERRED, MORE_EVIDENCE_REQUESTED, TREATMENT_APPLIED, VERIFIED_RESOLVED
    created_at: str
    priority: str = "HIGH" # CRITICAL, HIGH, MEDIUM, LOW
    priority_score: float = 78.5
    distance_km: float = 4.2
    assigned_krishi_sevak: Optional[str] = "Anil S. Deshmukh (Ward-4)"
    field_inspection: Optional[FieldInspectionRecord] = None
    triage_reason: Optional[str] = "AI/Field Disagreement & High Epidemiological Risk"
    expert_notes: Optional[str] = None
    expert_decision: Optional[Dict[str, Any]] = None
    active_learning: Optional[Dict[str, Any]] = None
    evidence_requests: List[str] = []
    ground_truth_status: Optional[str] = "PENDING_EXPERT_REVIEW" # CONFIRMED_GROUND_TRUTH, AI_DISAGREEMENT_EDGE_CASE, PENDING_EXPERT_REVIEW
    lab_referral_id: Optional[str] = None
    treatment_logs: List[Dict[str, Any]] = []
    follow_up_scheduled_at: Optional[str] = None
    follow_up_due: bool = False
    recovery_status: Optional[str] = None
    treatment_outcome: str = "NORMAL" # NORMAL, IMPROVING, DETERIORATING_ALERT

# 7. Audit Log Entry
class AuditLogEntry(BaseModel):
    log_id: str
    timestamp: str
    user_id: str
    user_name: str
    user_role: UserRole
    action: str
    entity_type: str # CASE, PROFILE, SENSOR, LAB_SAMPLE, BROADCAST, IPM
    entity_id: str
    details: Dict[str, Any]
    ip_address: str = "127.0.0.1"
    verification_hash: str

# 8. Lab Sample Tracking & Scientific Confirmation
class LabSampleRecord(BaseModel):
    sample_id: str
    referral_id: Optional[str] = None
    case_id: str
    farmer_name: str
    district: str
    taluka: Optional[str] = "Darwha"
    village: Optional[str] = "Zadgaon"
    crop: str
    plant_part: Optional[str] = "Boll / Leaf Tissue"
    suspected_pathogen: str
    referral_reason: Optional[str] = "Visual diagnosis inconclusive; molecular confirmation required"
    specimen_type: str # Leaf Sample, Stem Cut, Soil Core, Insect Specimen
    priority: str = "HIGH" # URGENT, HIGH, ROUTINE
    dispatch_date: str
    lab_name: str
    status: str = "AWAITING_INTAKE" # AWAITING_INTAKE, RECEIVED, TESTING_IN_PROGRESS, REPORT_ISSUED, REJECTED
    collected_by: Optional[str] = "Anil S. Deshmukh (Krishi Sevak, ID: 4832)"
    collection_time: Optional[str] = "05 Sept 2026 — 10:42 AM"
    intake_condition: Optional[Dict[str, str]] = None
    rejection_reason: Optional[str] = None
    chain_of_custody: List[Dict[str, Any]] = []
    tests_performed: List[Dict[str, Any]] = []
    test_method: Optional[str] = None
    findings: Optional[str] = None
    certified_by: Optional[str] = None
    report_url: Optional[str] = None
    issued_at: Optional[str] = None
    final_report: Optional[Dict[str, Any]] = None
    report_version: int = 1
    revision_history: List[Dict[str, Any]] = []
    case_image_url: Optional[str] = None
    field_photos: Optional[List[str]] = []
    officer_observation: Optional[str] = None
    trap_count: Optional[int] = None

# 9. System Monitoring Metrics
class SystemHealthMetrics(BaseModel):
    uptime_seconds: float
    api_request_count: int
    avg_latency_ms: float
    active_sensors_count: int
    stale_sensor_alerts: int
    model_inference_count: int
    avg_model_confidence_pct: float
    low_confidence_triage_rate_pct: float
    active_outbreak_clusters: int
    alert_delivery_rate_pct: float
    total_audit_events: int
    system_status: str # HEALTHY, DEGRADED, CRITICAL

# 10. Government Surveillance Broadcast Request
class BroadcastRequest(BaseModel):
    districts: List[str]
    crop: str
    threat: str
    message_mr: str
    severity: Optional[str] = "CRITICAL"
    channels: Optional[List[str]] = ["SMS", "WhatsApp", "In-App"]
    languages: Optional[List[str]] = ["Marathi (मराठी)", "English"]
    target_roles: Optional[List[str]] = ["Farmers", "Krishi Sevaks"]
