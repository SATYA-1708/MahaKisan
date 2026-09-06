from fastapi import APIRouter, Header, HTTPException, UploadFile, File, Form, Depends
from typing import List, Optional, Dict, Any
from app.models.schemas import (
    FarmProfile, WeatherData, SensorTelemetry, TrapData,
    SymptomDetection, FutureRiskForecast, CaseRecord,
    AuditLogEntry, LabSampleRecord, SystemHealthMetrics, UserRole
)
from app.core.auth_rbac import get_current_user_context, verify_permission, AUTHENTICATED_USERS
from app.core.audit_logger import audit_logger
from app.core.system_monitor import system_monitor
from app.services.data_ingestion import data_ingestion_service
from app.services.ipm_knowledge_base import get_authoritative_ipm, IPM_DATABASE
from app.services.current_diagnosis_engine import current_diagnosis_engine
from app.services.future_risk_engine import future_risk_engine
from app.services.case_manager import case_manager
from app.services.surveillance_service import surveillance_service

router = APIRouter()

# ----------------- 1. FARMER & FARM PROFILES -----------------
@router.get("/profiles", response_model=List[FarmProfile])
def get_profiles(user=Depends(get_current_user_context)):
    return case_manager.get_all_profiles()

@router.get("/profile/{farm_id}", response_model=FarmProfile)
def get_profile(farm_id: str, user=Depends(get_current_user_context)):
    profile = case_manager.get_profile(farm_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Farm profile not found")
    return profile

@router.post("/profile", response_model=FarmProfile)
def save_profile(profile: FarmProfile, user=Depends(get_current_user_context)):
    verify_permission("profile:update_own", user["role"])
    return case_manager.update_profile(profile, user_id=user["user_id"])

# ----------------- 2. DATA INGESTION GATEWAY -----------------
@router.post("/ingest/weather")
def ingest_weather(data: WeatherData, user=Depends(get_current_user_context)):
    success, msg = data_ingestion_service.ingest_weather(data)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"status": "SUCCESS", "message": msg}

@router.post("/ingest/sensor")
def ingest_sensor(telemetry: SensorTelemetry, user=Depends(get_current_user_context)):
    success, msg = data_ingestion_service.ingest_sensor_telemetry(telemetry)
    return {"status": "SUCCESS" if success else "WARNING", "message": msg}

@router.post("/ingest/trap")
def ingest_trap(trap: TrapData, user=Depends(get_current_user_context)):
    verify_permission("traps:record_count", user["role"])
    success, msg = data_ingestion_service.ingest_trap_count(trap)
    return {"status": "SUCCESS", "message": msg, "etl_breached": trap.is_etl_breached}

@router.get("/ingest/all-traps", response_model=List[TrapData])
def get_all_traps():
    return data_ingestion_service.get_all_traps()

@router.get("/ingest/all-sensors", response_model=List[SensorTelemetry])
def get_all_sensors():
    return data_ingestion_service.get_all_sensors()

# ----------------- 3. CURRENT DIAGNOSIS ENGINE (IMAGE / CV) -----------------
@router.post("/diagnose/image", response_model=SymptomDetection)
async def diagnose_image(
    farm_id: Optional[str] = Form("farm_101"),
    crop_hint: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    user=Depends(get_current_user_context)
):
    profile = case_manager.get_profile(farm_id) if farm_id else None
    image_name = image.filename if image else "sample_leaf.jpg"
    image_bytes = None
    if image:
        image_bytes = await image.read()
    
    detection = current_diagnosis_engine.analyze_symptom_image(
        image_bytes=image_bytes,
        image_name=image_name,
        profile=profile,
        target_crop_hint=crop_hint
    )
    return detection

# ----------------- 4. FUTURE RISK FORECASTING ENGINE -----------------
@router.post("/forecast/risk", response_model=FutureRiskForecast)
def forecast_risk(
    district: str,
    crop_name: str = "Cotton",
    farm_id: Optional[str] = None,
    user=Depends(get_current_user_context)
):
    profile = case_manager.get_profile(farm_id) if farm_id else None
    return future_risk_engine.forecast_crop_risk(
        district=district,
        crop_name=crop_name,
        profile=profile
    )

# ----------------- 5. AUTHORITATIVE IPM REPOSITORY -----------------
@router.get("/ipm/lookup")
def get_ipm(pest_or_disease: str, crop: Optional[str] = None):
    return get_authoritative_ipm(pest_or_disease, crop=crop)

@router.get("/ipm/all")
def get_all_ipm():
    return list(IPM_DATABASE.values())

# ----------------- 6. CASE LIFECYCLE & TRIAGE -----------------
@router.get("/cases", response_model=List[CaseRecord])
def get_cases(user=Depends(get_current_user_context)):
    return case_manager.get_all_cases()

@router.post("/cases/create", response_model=CaseRecord)
def create_case(
    farm_id: str = Form("farm_101"),
    crop_hint: Optional[str] = Form(None),
    image_url: Optional[str] = Form("https://images.unsplash.com/photo-1599818434736-2311f6c770c3?auto=format&fit=crop&w=600&q=80"),
    user=Depends(get_current_user_context)
):
    return case_manager.create_case(
        farm_id=farm_id,
        image_url=image_url,
        user_id=user["user_id"],
        user_name=user["user_name"],
        crop_hint=crop_hint
    )

@router.post("/cases/{case_id}/field-inspection/start", response_model=CaseRecord)
def start_field_inspection(
    case_id: str,
    user=Depends(get_current_user_context)
):
    verify_permission("cases:field_inspect", user["role"])
    return case_manager.start_field_visit(
        case_id=case_id,
        officer_id=user["user_id"],
        officer_name=user["user_name"]
    )

@router.post("/cases/{case_id}/field-inspection/complete", response_model=CaseRecord)
def complete_field_inspection(
    case_id: str,
    observed_symptoms: str = Form("Leaf discoloration, Boll damage, Larvae observed"),
    affected_plants_pct: int = Form(25),
    pest_observed: bool = Form(True),
    trap_count: int = Form(14),
    officer_observation: str = Form("Verified severe pink bollworm entrance boreholes & rosette flowers."),
    officer_assessment: str = Form("VERIFIED"), # VERIFIED, UNCERTAIN, HIGH_RISK_ESCALATION
    inspection_notes: str = Form("ETL breached. Immediate CIBRC bio-chemical spray recommended."),
    modified_diagnosis: Optional[str] = Form(None),
    user=Depends(get_current_user_context)
):
    verify_permission("cases:field_inspect", user["role"])
    symptoms_list = [s.strip() for s in observed_symptoms.split(",") if s.strip()]
    return case_manager.complete_field_inspection(
        case_id=case_id,
        officer_id=user["user_id"],
        officer_name=user["user_name"],
        observed_symptoms=symptoms_list,
        affected_plants_pct=affected_plants_pct,
        pest_observed=pest_observed,
        trap_count=trap_count,
        officer_observation=officer_observation,
        officer_assessment=officer_assessment,
        inspection_notes=inspection_notes,
        modified_diagnosis=modified_diagnosis
    )

@router.post("/cases/{case_id}/lab-referral", response_model=LabSampleRecord)
def generate_lab_referral(
    case_id: str,
    sample_type: str = Form("Cotton Boll & Leaf Sample"),
    requested_test: str = Form("PCR DNA Pathogen Assay & Larval Microscopy"),
    destination_lab: str = Form("MahaAgri Central Diagnostic Lab, Pune"),
    user=Depends(get_current_user_context)
):
    verify_permission("cases:field_inspect", user["role"])
    return case_manager.generate_lab_referral(
        case_id=case_id,
        officer_id=user["user_id"],
        officer_name=user["user_name"],
        sample_type=sample_type,
        requested_test=requested_test,
        destination_lab=destination_lab
    )

@router.post("/cases/{case_id}/follow-up/check", response_model=CaseRecord)
def check_follow_up_outcome(
    case_id: str,
    day0_severity: int = Form(32),
    day7_severity: int = Form(16),
    user=Depends(get_current_user_context)
):
    verify_permission("cases:field_inspect", user["role"])
    return case_manager.check_follow_up_outcome(
        case_id=case_id,
        day0_sev=day0_severity,
        day7_sev=day7_severity,
        officer_id=user["user_id"],
        officer_name=user["user_name"]
    )

@router.post("/cases/{case_id}/expert-triage", response_model=CaseRecord)
def expert_triage_case(
    case_id: str,
    action_type: str = Form("CONFIRM"),
    notes: str = Form(""),
    morphological_obs: Optional[str] = Form(None),
    differential_dx: Optional[str] = Form(None),
    expert_confidence: str = Form("HIGH"),
    modified_diagnosis: Optional[str] = Form(None),
    override_reason: Optional[str] = Form(None),
    evidence_requests: Optional[str] = Form(None), # comma-separated list
    assign_lab: bool = Form(False),
    lab_specimen: Optional[str] = Form(None),
    lab_test_method: Optional[str] = Form(None),
    lab_priority: str = Form("HIGH"),
    followup_days: int = Form(3),
    escalate_outbreak: bool = Form(False),
    user=Depends(get_current_user_context)
):
    verify_permission("diagnosis:review_ai", user["role"])
    req_list = [r.strip() for r in evidence_requests.split(",")] if evidence_requests else None
    return case_manager.expert_triage_case(
        case_id=case_id,
        expert_id=user["user_id"],
        expert_name=user["user_name"],
        action_type=action_type,
        notes=notes,
        morphological_obs=morphological_obs,
        differential_dx=differential_dx,
        expert_confidence=expert_confidence,
        modified_diagnosis=modified_diagnosis,
        override_reason=override_reason,
        evidence_requests=req_list,
        assign_lab=assign_lab,
        lab_specimen=lab_specimen,
        lab_test_method=lab_test_method,
        lab_priority=lab_priority,
        followup_days=followup_days,
        escalate_outbreak=escalate_outbreak
    )

@router.get("/expert/active-learning-pool")
def get_active_learning_pool(user=Depends(get_current_user_context)):
    verify_permission("diagnosis:review_ai", user["role"])
    return case_manager.get_active_learning_pool()

@router.post("/expert/active-learning/{case_id}/curate")
def curate_active_learning_candidate(
    case_id: str,
    status: str = Form(...), # APPROVED_FOR_DATASET, REJECTED, PENDING_REVIEW
    user=Depends(get_current_user_context)
):
    verify_permission("diagnosis:review_ai", user["role"])
    return case_manager.curate_active_learning_candidate(
        case_id=case_id,
        new_status=status,
        expert_id=user["user_id"],
        expert_name=user["user_name"]
    )

@router.post("/cases/{case_id}/log-treatment", response_model=CaseRecord)
def log_treatment(
    case_id: str,
    molecule: str = Form(...),
    dosage: str = Form(...),
    user=Depends(get_current_user_context)
):
    return case_manager.log_farmer_treatment(
        case_id=case_id,
        molecule=molecule,
        dosage=dosage,
        user_id=user["user_id"],
        user_name=user["user_name"]
    )

@router.get("/lab/samples", response_model=List[LabSampleRecord])
def get_lab_samples(user=Depends(get_current_user_context)):
    return case_manager.get_lab_samples()

@router.post("/lab/samples/{sample_id}/intake", response_model=LabSampleRecord)
def intake_lab_sample(
    sample_id: str,
    packaging: str = Form("INTACT"),
    label: str = Form("CORRECT"),
    quantity: str = Form("SUFFICIENT"),
    contamination: str = Form("NONE"),
    condition: str = Form("ACCEPTABLE"),
    action: str = Form("ACCEPT"),
    rejection_reason: Optional[str] = Form(None),
    user=Depends(get_current_user_context)
):
    verify_permission("lab:intake", user["role"])
    return case_manager.intake_lab_sample(
        sample_id=sample_id,
        packaging=packaging,
        label=label,
        quantity=quantity,
        contamination=contamination,
        condition=condition,
        action=action,
        rejection_reason=rejection_reason,
        tech_id=user["user_id"],
        tech_name=user["user_name"]
    )

@router.post("/lab/samples/{sample_id}/tests", response_model=LabSampleRecord)
def record_lab_test(
    sample_id: str,
    test_type: str = Form("Microscopy"),
    target_organism: str = Form("Pectinophora gossypiella"),
    result: str = Form("POSITIVE"),
    observation: str = Form("Distinct larval mouthparts and dorsal banding verified under 400x magnification."),
    ct_value: Optional[float] = Form(None),
    magnification: Optional[str] = Form("400x Brightfield"),
    test_reference: Optional[str] = Form(None),
    micrograph_url: Optional[str] = Form("https://images.unsplash.com/photo-1599818434736-2311f6c770c3?auto=format&fit=crop&w=600&q=80"),
    user=Depends(get_current_user_context)
):
    verify_permission("lab:run_tests", user["role"])
    return case_manager.record_lab_test(
        sample_id=sample_id,
        test_type=test_type,
        target_organism=target_organism,
        result=result,
        observation=observation,
        ct_value=ct_value,
        magnification=magnification,
        test_reference=test_reference,
        micrograph_url=micrograph_url,
        tech_id=user["user_id"],
        tech_name=user["user_name"]
    )

@router.post("/lab/samples/{sample_id}/publish", response_model=LabSampleRecord)
def publish_lab_report(
    sample_id: str,
    finding: str = Form("CONFIRMED"),
    confirmed_entity: str = Form("Pink Bollworm (Pectinophora gossypiella)"),
    test_summary: str = Form("Microscopy and Real-Time Molecular PCR assay confirmed high copy-number DNA amplification."),
    pathologist_remarks: str = Form("Specimen positive for Pink Bollworm. Immediate targeted bio-chemical CIBRC IPM schedule confirmed."),
    certifying_scientist: str = Form("Dr. Anant Deshpande (Lead Pathologist, ICAR-CICR / ISO-17025)"),
    user=Depends(get_current_user_context)
):
    verify_permission("lab:publish_report", user["role"])
    return case_manager.publish_lab_report(
        sample_id=sample_id,
        finding=finding,
        confirmed_entity=confirmed_entity,
        test_summary=test_summary,
        pathologist_remarks=pathologist_remarks,
        certifying_scientist=certifying_scientist,
        tech_id=user["user_id"],
        tech_name=user["user_name"]
    )

@router.post("/lab/samples/{sample_id}/recollect", response_model=LabSampleRecord)
def recollect_lab_sample(
    sample_id: str,
    reason: str = Form("Physical sample degraded during transit. Recollection required."),
    user=Depends(get_current_user_context)
):
    verify_permission("lab:intake", user["role"])
    return case_manager.recollect_lab_sample(
        sample_id=sample_id,
        reason=reason,
        tech_id=user["user_id"],
        tech_name=user["user_name"]
    )

# ----------------- 7. SURVEILLANCE & GIS HOTSPOTS -----------------
@router.get("/surveillance/hotspots")
def get_hotspots():
    return surveillance_service.get_district_hotspots()

@router.get("/surveillance/summary")
def get_surveillance_summary():
    return surveillance_service.get_surveillance_summary()

@router.post("/surveillance/broadcast")
def send_broadcast(
    districts: List[str],
    crop: str,
    threat: str,
    message_mr: str,
    severity: str = "CRITICAL",
    channels: Optional[List[str]] = ["SMS", "WhatsApp", "In-App"],
    languages: Optional[List[str]] = ["Marathi (मराठी)", "English"],
    target_roles: Optional[List[str]] = ["Farmers", "Krishi Sevaks"],
    user=Depends(get_current_user_context)
):
    verify_permission("alerts:broadcast_statewide", user["role"])
    return surveillance_service.trigger_epidemic_broadcast(
        districts=districts,
        crop=crop,
        threat=threat,
        severity=severity,
        channels=channels or ["SMS", "WhatsApp", "In-App"],
        languages=languages or ["Marathi (मराठी)", "English"],
        target_roles=target_roles or ["Farmers", "Krishi Sevaks"],
        message_mr=message_mr,
        user_id=user["user_id"],
        user_name=user["user_name"]
    )

@router.get("/surveillance/broadcasts")
def get_broadcasts():
    return surveillance_service.get_broadcasts()

# ----------------- 8. IMMUTABLE AUDIT TRAIL -----------------
@router.get("/audit/logs", response_model=List[AuditLogEntry])
def get_audit_logs(limit: int = 50, entity_id: Optional[str] = None, user=Depends(get_current_user_context)):
    return audit_logger.get_logs(limit=limit, entity_id=entity_id)

# ----------------- 9. PRODUCTION SYSTEM MONITORING -----------------
@router.get("/system/metrics", response_model=SystemHealthMetrics)
def get_system_health():
    return system_monitor.get_metrics()

@router.get("/system/telemetry")
def get_system_telemetry():
    return system_monitor.get_telemetry_breakdown()

# ----------------- 10. AUTH & USERS -----------------
@router.get("/auth/users")
def get_available_users():
    return list(AUTHENTICATED_USERS.values())
