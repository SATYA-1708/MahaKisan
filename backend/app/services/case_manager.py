import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from app.models.schemas import (
    CaseRecord, FarmProfile, CropStage, SoilType, SymptomDetection,
    FutureRiskForecast, UserRole, LabSampleRecord, FieldInspectionRecord
)
from app.core.audit_logger import audit_logger
from app.services.current_diagnosis_engine import current_diagnosis_engine
from app.services.future_risk_engine import future_risk_engine

def calculate_crop_stage_from_das(sowing_date_str: str) -> tuple[int, CropStage]:
    try:
        sow_dt = datetime.strptime(sowing_date_str, "%Y-%m-%d")
        current_dt = datetime(2026, 9, 5)
        das = max(1, (current_dt - sow_dt).days)
        
        if das <= 15:
            stage = CropStage.GERMINATION
        elif das <= 45:
            stage = CropStage.VEGETATIVE
        elif das <= 75:
            stage = CropStage.FLOWERING
        elif das <= 115:
            stage = CropStage.POD_FRUIT_DEV
        else:
            stage = CropStage.MATURITY
        return das, stage
    except Exception:
        return 82, CropStage.POD_FRUIT_DEV

def compute_case_priority(diagnosis: SymptomDetection, future_risk: FutureRiskForecast) -> tuple[str, float]:
    """Calculates multi-factor priority score:
    Priority Score = Severity (35%) + AI Uncertainty (25%) + Epidemiological Risk (30%) + ETL Surge (10%)
    """
    sev_str = str(diagnosis.severity).upper()
    sev_score = 35.0 if "SEVERE" in sev_str else (20.0 if "MODERATE" in sev_str else 10.0)
    uncert_score = max(0.0, (1.0 - diagnosis.confidence_score) * 25.0)
    risk_score = (future_risk.risk_score_pct / 100.0) * 30.0
    etl_score = 10.0 if getattr(future_risk, 'etl_breach_active', False) else 0.0

    total_score = round(sev_score + uncert_score + risk_score + etl_score, 1)
    if total_score >= 75.0 or (future_risk.risk_score_pct >= 85 and "SEVERE" in sev_str):
        priority = "CRITICAL"
    elif total_score >= 50.0:
        priority = "HIGH"
    elif total_score >= 30.0:
        priority = "MEDIUM"
    else:
        priority = "LOW"
    return priority, total_score

class CaseManager:
    """Manages Farm Profiles, Case Queue, Krishi Sevak Triage, Field Visits, Follow-ups, and Lab Referrals"""
    
    _profiles: Dict[str, FarmProfile] = {}
    _cases: Dict[str, CaseRecord] = {}
    _lab_samples: Dict[str, LabSampleRecord] = {}

    def __init__(self):
        self._seed_default_profiles_and_cases()

    def _seed_default_profiles_and_cases(self):
        now_iso = datetime.now().isoformat()
        
        das1, stage1 = calculate_crop_stage_from_das("2026-06-15")
        # 1. Yavatmal Cotton Farm Profile (Ramesh Patil)
        p1 = FarmProfile(
            id="farm_101",
            farmer_name="Ramesh Patil (रमेश पाटील)",
            farmer_id="MH-YAV-2026-001245",
            contact="+91 98223 45678",
            district="Yavatmal",
            taluka="Darwha",
            village="Zadgaon",
            latitude=20.4285,
            longitude=78.5392,
            farm_size_acres=2.5,
            crop_name="Cotton",
            crop_variety="Bt-Cotton RCH-659",
            sowing_date="2026-06-15",
            days_after_sowing=das1,
            crop_stage=stage1,
            soil_type=SoilType.BLACK_COTTON,
            soil_ph=7.4,
            soil_drainage="Moderate",
            irrigation_type="Rainfed",
            created_at=now_iso
        )
        self._profiles[p1.id] = p1

        # 2. Yavatmal Soybean Farm Profile (Suresh Rathod)
        p2 = FarmProfile(
            id="farm_102",
            farmer_name="Suresh B. Rathod (सुरेश राठोड)",
            farmer_id="MH-YAV-2026-001228",
            contact="+91 98901 23456",
            district="Yavatmal",
            taluka="Darwha",
            village="Ralegaon",
            latitude=20.4350,
            longitude=78.5420,
            farm_size_acres=3.5,
            crop_name="Soybean",
            crop_variety="JS-335",
            sowing_date="2026-06-20",
            days_after_sowing=77,
            crop_stage=CropStage.POD_FRUIT_DEV,
            soil_type=SoilType.MEDIUM_BLACK,
            soil_ph=7.1,
            soil_drainage="Good",
            irrigation_type="Rainfed",
            created_at=now_iso
        )
        self._profiles[p2.id] = p2

        # 3. Yavatmal Cotton Farm #2 (Gajanan Deshmukh)
        p3 = FarmProfile(
            id="farm_103",
            farmer_name="Gajanan V. Deshmukh (गजानन देशमुख)",
            farmer_id="MH-YAV-2026-001245",
            contact="+91 97654 32109",
            district="Yavatmal",
            taluka="Darwha",
            village="Zadgaon",
            latitude=20.4210,
            longitude=78.5310,
            farm_size_acres=4.0,
            crop_name="Cotton",
            crop_variety="Ajeet-155",
            sowing_date="2026-06-12",
            days_after_sowing=85,
            crop_stage=CropStage.POD_FRUIT_DEV,
            soil_type=SoilType.BLACK_COTTON,
            soil_ph=7.5,
            soil_drainage="Moderate",
            irrigation_type="Drip",
            created_at=now_iso
        )
        self._profiles[p3.id] = p3

        # Seed Urgent Cases in Krishi Sevak Queue
        diag1 = current_diagnosis_engine.analyze_symptom_image(
            image_name="cotton_pbw.jpg",
            profile=p1
        )
        diag1.confidence_score = 0.72
        diag1.top_alternatives = [
            {"entity": "Pink Bollworm (गुलाबी बोंडअळी)", "confidence_pct": 72.0, "scientific_name": "Pectinophora gossypiella"},
            {"entity": "American Bollworm (अमेरिकन बोंडअळी)", "confidence_pct": 18.0, "scientific_name": "Helicoverpa armigera"},
            {"entity": "Spodoptera / Tobacco Caterpillar (लष्करी अळी)", "confidence_pct": 10.0, "scientific_name": "Spodoptera litura"}
        ]
        risk1 = future_risk_engine.forecast_crop_risk("Yavatmal", "Cotton", p1)
        prio1, pscore1 = compute_case_priority(diag1, risk1)

        case1 = CaseRecord(
            case_id="MH-YAV-10231",
            farmer_profile=p1,
            image_url="https://images.unsplash.com/photo-1599818434736-2311f6c770c3?auto=format&fit=crop&w=600&q=80",
            diagnosis=diag1,
            future_risk=risk1,
            status="PENDING_FIELD_VERIFICATION",
            created_at=now_iso,
            priority="CRITICAL",
            priority_score=91.0,
            distance_km=4.2,
            assigned_krishi_sevak="Anil S. Deshmukh (Ward-4, Yavatmal)",
            triage_reason="AI/Field Disagreement & ETL Breach (14 moths/trap)",
            field_inspection=FieldInspectionRecord(
                status="COMPLETED",
                officer_id="ksevak_202",
                officer_name="Anil S. Deshmukh (Ward-4, Yavatmal)",
                completed_at=(datetime.now() - timedelta(hours=2)).isoformat(),
                distance_km=4.2,
                trap_count=14,
                is_etl_breached=True,
                affected_plants_pct=25,
                officer_observation="Rosetted flowers detected in 25% sampled hills. Frass-plugged exit holes observed on lower bolls.",
                officer_assessment="VERIFIED",
                inspection_notes="Trap count is 14 moths/night exceeding ETL of 8. Suspected Pink Bollworm vs Early American Bollworm crossover.",
                field_photos=[
                    "https://images.unsplash.com/photo-1599818434736-2311f6c770c3?auto=format&fit=crop&w=600&q=80",
                    "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&w=600&q=80",
                    "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
                    "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80"
                ]
            ),
            follow_up_scheduled_at=(datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
            recovery_status="PENDING_EXPERT_TRIAGE"
        )
        self._cases[case1.case_id] = case1

        diag2 = current_diagnosis_engine.analyze_symptom_image(
            image_name="soybean_rust.jpg",
            profile=p2
        )
        diag2.confidence_score = 0.58
        diag2.top_alternatives = [
            {"entity": "Soybean Rust (तांबेरा रोग)", "confidence_pct": 58.0, "scientific_name": "Phakopsora pachyrhizi"},
            {"entity": "Cercospora Leaf Spot (पानावरील करपा)", "confidence_pct": 28.0, "scientific_name": "Cercospora sojina"},
            {"entity": "Anthracnose Pod Blight (अँथ्रॅक्नोज)", "confidence_pct": 14.0, "scientific_name": "Colletotrichum truncatum"}
        ]
        risk2 = future_risk_engine.forecast_crop_risk("Yavatmal", "Soybean", p2)
        prio2, pscore2 = compute_case_priority(diag2, risk2)

        case2 = CaseRecord(
            case_id="MH-YAV-10228",
            farmer_profile=p2,
            image_url="https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&w=600&q=80",
            diagnosis=diag2,
            future_risk=risk2,
            status="PENDING_FIELD_VERIFICATION",
            created_at=(datetime.now() - timedelta(hours=3)).isoformat(),
            priority="HIGH",
            priority_score=87.0,
            distance_km=2.8,
            assigned_krishi_sevak="Anil S. Deshmukh (Ward-4, Yavatmal)",
            triage_reason="Low AI Confidence (58%) & Rapid Humidity Surge (88%)",
            field_inspection=FieldInspectionRecord(
                status="COMPLETED",
                officer_id="ksevak_202",
                officer_name="Anil S. Deshmukh (Ward-4, Yavatmal)",
                completed_at=(datetime.now() - timedelta(hours=1)).isoformat(),
                distance_km=2.8,
                trap_count=9,
                is_etl_breached=True,
                affected_plants_pct=30,
                officer_observation="Foliage chlorosis with scattered tan pustules on leaf underside.",
                officer_assessment="UNCERTAIN",
                inspection_notes="Symptoms resemble both early soybean rust and Cercospora leaf spot. Requires specialist pathology review.",
                field_photos=[
                    "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&w=600&q=80",
                    "https://images.unsplash.com/photo-1599818434736-2311f6c770c3?auto=format&fit=crop&w=600&q=80",
                    "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80"
                ]
            ),
            follow_up_scheduled_at=(datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            recovery_status="PENDING_EXPERT_TRIAGE"
        )
        self._cases[case2.case_id] = case2

        # Seed Follow-Up Due Case
        case3 = CaseRecord(
            case_id="MH-YAV-10195",
            farmer_profile=p3,
            image_url="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
            diagnosis=diag1,
            future_risk=risk1,
            status="TREATMENT_APPLIED",
            created_at=(datetime.now() - timedelta(days=7)).isoformat(),
            priority="MEDIUM",
            priority_score=48.0,
            distance_km=5.6,
            assigned_krishi_sevak="Anil S. Deshmukh (Ward-4, Yavatmal)",
            field_inspection=FieldInspectionRecord(
                status="COMPLETED",
                officer_id="ksevak_202",
                officer_name="Anil S. Deshmukh",
                completed_at=(datetime.now() - timedelta(days=6)).isoformat(),
                distance_km=5.6,
                officer_assessment="VERIFIED",
                officer_observation="Foliage chlorosis and water-soaked lesions observed on lower leaves.",
                field_photos=[
                    "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
                    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
                    "https://images.unsplash.com/photo-1599818434736-2311f6c770c3?auto=format&fit=crop&w=600&q=80"
                ]
            ),
            treatment_logs=[{
                "timestamp": (datetime.now() - timedelta(days=6)).isoformat(),
                "molecule": "Emamectin Benzoate 5% SG",
                "dosage": "7.5 gm / 15L pump"
            }],
            follow_up_scheduled_at=datetime.now().strftime("%Y-%m-%d"),
            follow_up_due=True,
            recovery_status="FOLLOW_UP_DUE_TODAY"
        )
        self._cases[case3.case_id] = case3

        # Seed Diagnostic Laboratory Samples for Scientific Confirmation Layer (Role 4)
        spl1 = LabSampleRecord(
            sample_id="SMP-000891",
            referral_id="LR-MH-2026-000183",
            case_id="MH-YAV-10231",
            farmer_name="Ramesh Patil (रमेश पाटील)",
            district="Yavatmal",
            taluka="Darwha",
            village="Zadgaon",
            crop="Cotton",
            plant_part="Boll Tissue & Rosetted Flowers",
            suspected_pathogen="Cotton Pink Bollworm vs Early American Bollworm",
            referral_reason="Visual field inspection inconclusive; trap catch ETL surge (14 moths/night). Requires molecular larval identification.",
            specimen_type="Lower Boll Tissue Core & Rosetted Petals",
            priority="URGENT",
            dispatch_date="2026-09-05",
            lab_name="Regional Plant Pathology Laboratory, Nagpur (ICAR-CICR)",
            status="AWAITING_INTAKE",
            collected_by="Anil S. Deshmukh (Krishi Sevak, ID: 4832)",
            collection_time="05 Sept 2026 — 10:42 AM",
            chain_of_custody=[
                {
                    "timestamp": "10:42 AM",
                    "actor": "Anil S. Deshmukh",
                    "role": "KRISHI_SEVAK",
                    "location": "Zadgaon Farm (MH-YAV-2026-001245)",
                    "action": "Sample Collected & QR Tagged",
                    "remarks": "4 lower bolls with entrance boreholes excised and placed into sterile container."
                },
                {
                    "timestamp": "11:05 AM",
                    "actor": "Anil S. Deshmukh",
                    "role": "KRISHI_SEVAK",
                    "location": "Darwha Beat Office",
                    "action": "Sample Sealed & Cold-Box Packed",
                    "remarks": "Tamper-evident seal #SEAL-9842 applied; logged temperature 4°C."
                },
                {
                    "timestamp": "01:20 PM",
                    "actor": "MahaAgri Logistics Courier",
                    "role": "TRANSIT_OFFICER",
                    "location": "Yavatmal Hub",
                    "action": "Received at Collection Center",
                    "remarks": "Barcoded scan matched manifest LR-MH-2026-000183."
                },
                {
                    "timestamp": "03:10 PM",
                    "actor": "Central Intake Desk",
                    "role": "DIAGNOSTIC_LAB",
                    "location": "ICAR-CICR Nagpur Lab Intake",
                    "action": "Arrived at Diagnostic Lab",
                    "remarks": "Specimen placed in Sample Intake Queue (Awaiting QR Scan)."
                }
            ],
            tests_performed=[]
        )
        self._lab_samples[spl1.sample_id] = spl1

        spl2 = LabSampleRecord(
            sample_id="SMP-000892",
            referral_id="LR-MH-2026-000184",
            case_id="MH-YAV-10228",
            farmer_name="Suresh Rathod (सुरेश राठोड)",
            district="Yavatmal",
            taluka="Darwha",
            village="Ralegaon",
            crop="Soybean",
            plant_part="Lower Foliage",
            suspected_pathogen="Soybean Rust (Phakopsora pachyrhizi) vs Cercospora Leaf Spot",
            referral_reason="AI confidence only 58%; rapid humidity surge (88% RH) creating diagnostic ambiguity between rust pustules and abiotic chlorosis.",
            specimen_type="Abaxial Leaf Surface Pustule Scraping",
            priority="HIGH",
            dispatch_date="2026-09-04",
            lab_name="MahaAgri Central Diagnostic & Culture Lab, Pune (MPKV)",
            status="TESTING_IN_PROGRESS",
            collected_by="Anil S. Deshmukh (Krishi Sevak, ID: 4832)",
            collection_time="04 Sept 2026 — 02:15 PM",
            intake_condition={
                "packaging": "INTACT",
                "label": "CORRECT",
                "quantity": "SUFFICIENT",
                "contamination": "NONE",
                "condition": "ACCEPTABLE"
            },
            chain_of_custody=[
                {
                    "timestamp": "02:15 PM",
                    "actor": "Anil S. Deshmukh",
                    "role": "KRISHI_SEVAK",
                    "location": "Ralegaon Farm",
                    "action": "Sample Collected & QR Tagged",
                    "remarks": "12 affected leaf samples harvested."
                },
                {
                    "timestamp": "05:30 PM",
                    "actor": "MahaAgri Courier",
                    "role": "TRANSIT_OFFICER",
                    "location": "Pune Transit Hub",
                    "action": "Delivered to Lab",
                    "remarks": "Received intact."
                },
                {
                    "timestamp": "09:00 AM (Today)",
                    "actor": "Dr. Vikas Shinde",
                    "role": "DIAGNOSTIC_LAB",
                    "location": "Pune Pathology Bench #3",
                    "action": "Sample Accepted & Intake Logged",
                    "remarks": "Specimen verified acceptable for fungal spore culture & ELISA assay."
                },
                {
                    "timestamp": "10:30 AM (Today)",
                    "actor": "Dr. Vikas Shinde",
                    "role": "DIAGNOSTIC_LAB",
                    "location": "Pune Pathology Bench #3",
                    "action": "Microscopic Examination Performed",
                    "remarks": "Identified characteristic clavate urediniospores under 400x magnification."
                }
            ],
            tests_performed=[
                {
                    "test_type": "Microscopy",
                    "target_organism": "Urediniospores of Phakopsora pachyrhizi",
                    "magnification": "400x Brightfield",
                    "result": "POSITIVE",
                    "technician_id": "TECH-409",
                    "observation": "Hyaline to light-brown echinulate urediniospores with equatorial germ pores observed on leaf abaxial scraping.",
                    "micrograph_url": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&w=600&q=80",
                    "completed_at": "2026-09-05T10:30:00"
                }
            ]
        )
        self._lab_samples[spl2.sample_id] = spl2

        spl3 = LabSampleRecord(
            sample_id="SMP-000893",
            referral_id="LR-MH-2026-000185",
            case_id="MH-YAV-10195",
            farmer_name="Ganesh K. Jadhav (गणेश जाधव)",
            district="Pune",
            taluka="Haveli",
            village="Manjari",
            crop="Tomato",
            plant_part="Leaf & Fruit Stem",
            suspected_pathogen="Tomato Late Blight (Phytophthora infestans)",
            referral_reason="Suspected high-virulence oomycete strain in greenhouse cluster.",
            specimen_type="Water-Soaked Stem & Foliage Core",
            priority="HIGH",
            dispatch_date="2026-09-03",
            lab_name="MahaAgri Central Diagnostic & Culture Lab, Pune (MPKV)",
            status="REPORT_ISSUED",
            collected_by="Sunil Patil (Krishi Sevak, ID: 4890)",
            collection_time="03 Sept 2026 — 09:30 AM",
            intake_condition={
                "packaging": "INTACT",
                "label": "CORRECT",
                "quantity": "SUFFICIENT",
                "contamination": "NONE",
                "condition": "ACCEPTABLE"
            },
            chain_of_custody=[
                {
                    "timestamp": "09:30 AM",
                    "actor": "Sunil Patil",
                    "role": "KRISHI_SEVAK",
                    "location": "Manjari Greenhouse",
                    "action": "Sample Collected & Sealed",
                    "remarks": "Foliage and petiole tissue tagged."
                },
                {
                    "timestamp": "01:00 PM",
                    "actor": "Dr. Anant Deshpande",
                    "role": "DIAGNOSTIC_LAB",
                    "location": "Pune Molecular Virology Lab",
                    "action": "PCR Amplification & Gel Assay Run",
                    "remarks": "Positive band confirmed at 480bp ITS region."
                },
                {
                    "timestamp": "04:30 PM",
                    "actor": "Dr. Anant Deshpande",
                    "role": "DIAGNOSTIC_LAB",
                    "location": "Pune Pathology Office",
                    "action": "Official Pathology Report Published & Locked (V1)",
                    "remarks": "Certified report issued and synced to state epidemiological registry."
                }
            ],
            tests_performed=[
                {
                    "test_type": "Molecular/PCR",
                    "target_organism": "Phytophthora infestans ITS1/ITS2 rRNA Gene",
                    "ct_value": 21.4,
                    "result": "POSITIVE",
                    "test_reference": "PCR-MH-2026-904",
                    "technician_id": "MOL-TECH-101",
                    "observation": "High copy-number amplification detected (Ct 21.4). Verified virulent A2 mating type.",
                    "completed_at": "2026-09-04T13:00:00"
                }
            ],
            final_report={
                "finding": "CONFIRMED",
                "confirmed_entity": "Tomato Late Blight (Phytophthora infestans)",
                "test_summary": "Multiplex Real-Time PCR (Ct 21.4) and Brightfield Microscopy verified active sporulation.",
                "pathologist_remarks": "Infection confirmed at critical sporulating phase. Recommend immediate Cymoxanil + Mancozeb application within 24h.",
                "certifying_scientist": "Dr. Anant Deshpande (Lead Pathologist, ICAR-CICR / ISO-17025)",
                "version": 1,
                "published_at": "2026-09-04T16:30:00"
            },
            findings="Confirmed high-density Phytophthora infestans oomycete infection (A2 mating type).",
            certified_by="Dr. Anant Deshpande (Lead Pathologist, ICAR-CICR / ISO-17025)",
            issued_at="2026-09-04T16:30:00",
            report_version=1
        )
        self._lab_samples[spl3.sample_id] = spl3

    def get_profile(self, farm_id: str) -> Optional[FarmProfile]:
        return self._profiles.get(farm_id)

    def get_all_cases(self) -> List[CaseRecord]:
        return list(self._cases.values())

    def get_case(self, case_id: str) -> Optional[CaseRecord]:
        return self._cases.get(case_id)

    def create_case(
        self,
        farm_id: str,
        image_url: str = "https://images.unsplash.com/photo-1599818434736-2311f6c770c3?auto=format&fit=crop&w=600&q=80",
        user_id: str = "farmer_101",
        user_name: str = "Ramesh Tukaram Patil",
        crop_hint: Optional[str] = None
    ) -> CaseRecord:
        profile = self._profiles.get(farm_id) or self._profiles["farm_101"]

        diagnosis = current_diagnosis_engine.analyze_symptom_image(
            image_name="farmer_upload.jpg",
            profile=profile,
            target_crop_hint=crop_hint
        )

        future_risk = future_risk_engine.forecast_crop_risk(
            district=profile.district,
            crop_name=profile.crop_name,
            profile=profile
        )

        priority, priority_score = compute_case_priority(diagnosis, future_risk)
        case_id = f"MH-{profile.district[:3].upper()}-{10200 + len(self._cases) + 1}"

        case = CaseRecord(
            case_id=case_id,
            farmer_profile=profile,
            image_url=image_url,
            diagnosis=diagnosis,
            future_risk=future_risk,
            status="PENDING_FIELD_VERIFICATION",
            created_at=datetime.now().isoformat(),
            priority=priority,
            priority_score=priority_score,
            distance_km=4.2,
            assigned_krishi_sevak="Anil S. Deshmukh (Ward-4, Yavatmal)",
            field_inspection=FieldInspectionRecord(
                status="PENDING",
                officer_id="ksevak_202",
                officer_name="Anil S. Deshmukh (Ward-4, Yavatmal)",
                distance_km=4.2,
                trap_count=14,
                is_etl_breached=True,
                affected_plants_pct=25
            ),
            follow_up_scheduled_at=(datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
            recovery_status="PENDING_FIELD_VISIT"
        )
        self._cases[case_id] = case

        audit_logger.record(
            user_id=user_id,
            user_name=user_name,
            user_role=UserRole.FARMER,
            action="CASE_CREATED",
            entity_type="CASE",
            entity_id=case_id,
            details={
                "crop": profile.crop_name,
                "detected": diagnosis.detected_entity,
                "priority": priority,
                "risk_score": future_risk.risk_score_pct
            }
        )
        return case

    # 1. Start Field Visit
    def start_field_visit(self, case_id: str, officer_id: str, officer_name: str) -> CaseRecord:
        case = self._cases.get(case_id)
        if not case:
            raise KeyError(f"Case {case_id} not found")

        if not case.field_inspection:
            case.field_inspection = FieldInspectionRecord()

        case.field_inspection.status = "IN_PROGRESS"
        case.field_inspection.officer_id = officer_id
        case.field_inspection.officer_name = officer_name
        case.field_inspection.started_at = datetime.now().isoformat()
        case.status = "FIELD_INSPECTION_IN_PROGRESS"

        audit_logger.record(
            user_id=officer_id,
            user_name=officer_name,
            user_role=UserRole.KRISHI_SEVAK,
            action="FIELD_INSPECTION_STARTED",
            entity_type="CASE",
            entity_id=case_id,
            details={"arrival_time": case.field_inspection.started_at, "distance_km": case.distance_km}
        )
        return case

    # 2. Complete Field Inspection with 3 Direct Resolution Pathways
    def complete_field_inspection(
        self,
        case_id: str,
        officer_id: str,
        officer_name: str,
        observed_symptoms: List[str],
        officer_observation: str,
        officer_assessment: str, # 'VERIFIED', 'UNCERTAIN', 'HIGH_RISK_ESCALATION'
        inspection_notes: str,
        modified_diagnosis: Optional[str] = None,
        field_photos: Optional[List[str]] = None
    ) -> CaseRecord:
        case = self._cases.get(case_id)
        if not case:
            raise KeyError(f"Case {case_id} not found")

        now_iso = datetime.now().isoformat()
        if not case.field_inspection:
            case.field_inspection = FieldInspectionRecord()

        # If officer corrects the diagnosis
        if modified_diagnosis and modified_diagnosis.strip():
            case.diagnosis.detected_entity = modified_diagnosis.strip()
            from app.services.ipm_knowledge_base import get_authoritative_ipm
            case.diagnosis.authoritative_ipm = get_authoritative_ipm(
                modified_diagnosis.strip(), 
                crop=case.farmer_profile.crop_name
            )

        case.field_inspection.status = "COMPLETED"
        case.field_inspection.completed_at = now_iso
        case.field_inspection.observed_symptoms = observed_symptoms
        case.field_inspection.affected_plants_pct = affected_plants_pct
        case.field_inspection.pest_observed = pest_observed
        case.field_inspection.trap_count = trap_count
        case.field_inspection.is_etl_breached = trap_count >= 8
        case.field_inspection.officer_observation = officer_observation
        case.field_inspection.officer_assessment = officer_assessment
        case.field_inspection.inspection_notes = inspection_notes
        if field_photos:
            case.field_inspection.field_photos = field_photos

        # Route outcome pathway
        if officer_assessment == "VERIFIED":
            case.status = "FIELD_VERIFIED"
            case.field_inspection.advisory_dispatched = True
            case.recovery_status = "ADVISORY_DISPATCHED_7_DAY_MONITORING"
        elif officer_assessment == "UNCERTAIN":
            case.status = "EXPERT_REVIEW_REQUIRED"
            case.recovery_status = "AWAITING_EXPERT_TRIAGE"
        elif officer_assessment == "HIGH_RISK_ESCALATION":
            case.status = "EXPERT_REVIEW_REQUIRED"
            case.priority = "CRITICAL"
            case.recovery_status = "ESCALATED_HIGH_SEVERITY_OUTBREAK"

        audit_logger.record(
            user_id=officer_id,
            user_name=officer_name,
            user_role=UserRole.KRISHI_SEVAK,
            action="FIELD_INSPECTION_COMPLETED",
            entity_type="CASE",
            entity_id=case_id,
            details={
                "assessment": officer_assessment,
                "observed_symptoms": observed_symptoms,
                "affected_pct": affected_plants_pct,
                "etl_breach": case.field_inspection.is_etl_breached,
                "status": case.status
            }
        )
        return case

    # 3. Generate Digital Lab Referral
    def generate_lab_referral(
        self,
        case_id: str,
        officer_id: str,
        officer_name: str,
        sample_type: str = "Cotton Boll & Leaf Tissue",
        requested_test: str = "PCR DNA Pathogen Assay & Larval Microscopy",
        destination_lab: str = "MahaAgri Central Diagnostic Lab, Pune"
    ) -> LabSampleRecord:
        case = self._cases.get(case_id)
        if not case:
            raise KeyError(f"Case {case_id} not found")

        sample_id = f"LAB-SPL-{datetime.now().strftime('%y%m%d')}-{len(self._lab_samples)+101:03d}"
        sample = LabSampleRecord(
            sample_id=sample_id,
            case_id=case_id,
            farmer_name=case.farmer_profile.farmer_name,
            district=case.farmer_profile.district,
            crop=case.farmer_profile.crop_name,
            suspected_pathogen=case.diagnosis.detected_entity,
            specimen_type=sample_type,
            dispatch_date=datetime.now().strftime("%Y-%m-%d"),
            lab_name=destination_lab,
            status="DISPATCHED",
            test_method=requested_test
        )
        self._lab_samples[sample_id] = sample
        case.lab_referral_id = sample_id
        case.status = "LAB_REFERRED"

        audit_logger.record(
            user_id=officer_id,
            user_name=officer_name,
            user_role=UserRole.KRISHI_SEVAK,
            action="LAB_REFERRAL_GENERATED",
            entity_type="LAB_SAMPLE",
            entity_id=sample_id,
            details={
                "case_id": case_id,
                "sample_type": sample_type,
                "destination_lab": destination_lab,
                "chain_of_custody": "ACTIVE"
            }
        )
        return sample

    # 4. Expert Triage (Specialist Decision Studio)
    def expert_triage_case(
        self,
        case_id: str,
        expert_id: str,
        expert_name: str,
        action_type: str = "CONFIRM", # CONFIRM, MODIFY, REQUEST_EVIDENCE, REFER_LAB
        notes: str = "",
        morphological_obs: Optional[str] = None,
        differential_dx: Optional[str] = None,
        expert_confidence: str = "HIGH", # HIGH, MODERATE, LOW
        modified_diagnosis: Optional[str] = None,
        override_reason: Optional[str] = None,
        evidence_requests: Optional[List[str]] = None,
        assign_lab: bool = False,
        lab_specimen: Optional[str] = None,
        lab_test_method: Optional[str] = None,
        lab_priority: str = "HIGH",
        followup_days: int = 3,
        escalate_outbreak: bool = False
    ) -> CaseRecord:
        case = self._cases.get(case_id)
        if not case:
            raise KeyError(f"Case {case_id} not found")

        now_iso = datetime.now().isoformat()
        original_ai_entity = case.diagnosis.detected_entity

        decision_data = {
            "action_type": action_type,
            "expert_id": expert_id,
            "expert_name": expert_name,
            "expert_designation": "Dr. Sunita Kulkarni (Senior Entomologist, MPKV Rahuri)",
            "timestamp": now_iso,
            "original_ai_prediction": original_ai_entity,
            "expert_diagnosis": modified_diagnosis if (action_type == "MODIFY" and modified_diagnosis) else original_ai_entity,
            "morphological_obs": morphological_obs or "Observed physical field patterns & lesion morphology reviewed against multi-modal evidence.",
            "differential_dx": differential_dx or f"{original_ai_entity} vs alternative pests/pathogens",
            "expert_confidence": expert_confidence,
            "notes": notes,
            "followup_days": followup_days,
            "escalated_outbreak": escalate_outbreak
        }

        if action_type == "CONFIRM":
            case.status = "EXPERT_TRIAGED"
            case.ground_truth_status = "CONFIRMED_GROUND_TRUTH"
            case.recovery_status = f"EXPERT_CONFIRMED_FOLLOWUP_{followup_days}_DAYS"
            case.follow_up_scheduled_at = (datetime.now() + timedelta(days=followup_days)).strftime("%Y-%m-%d")
            case.expert_decision = decision_data
            case.expert_notes = notes or "AI diagnosis confirmed. Authoritative CIBRC IPM advisory validated and approved for farmer."

        elif action_type == "MODIFY":
            case.status = "EXPERT_TRIAGED"
            case.ground_truth_status = "AI_DISAGREEMENT_EDGE_CASE"
            if modified_diagnosis:
                case.diagnosis.detected_entity = modified_diagnosis
            case.expert_decision = decision_data
            decision_data["override_reason"] = override_reason or "Morphological field evidence inconsistent with AI prediction."
            case.expert_notes = f"[MODIFIED DIAGNOSIS: {modified_diagnosis}] Reason: {override_reason}. Notes: {notes}"
            case.recovery_status = f"EXPERT_MODIFIED_FOLLOWUP_{followup_days}_DAYS"
            case.follow_up_scheduled_at = (datetime.now() + timedelta(days=followup_days)).strftime("%Y-%m-%d")
            
            # Add to Active Learning Pool automatically as an edge case candidate
            case.active_learning = {
                "candidate_id": f"AL-{case_id}",
                "original_ai_prediction": original_ai_entity,
                "ai_confidence_pct": round(case.diagnosis.confidence_score * 100, 1),
                "expert_ground_truth": modified_diagnosis or original_ai_entity,
                "curation_status": "PENDING_DATASET_REVIEW",
                "override_reason": override_reason or "Expert disagreement",
                "tagged_at": now_iso
            }

        elif action_type == "REQUEST_EVIDENCE":
            case.status = "MORE_EVIDENCE_REQUESTED"
            reqs = evidence_requests or ["additional_leaf_photo", "closeup_insect_photo", "whole_plant_canopy"]
            case.evidence_requests = reqs
            case.expert_decision = decision_data
            case.expert_notes = f"[ADDITIONAL EVIDENCE REQUESTED] Items: {', '.join(reqs)}. Notes: {notes}"
            case.recovery_status = "AWAITING_FIELD_EVIDENCE_FROM_KRISHI_SEVAK"

        elif action_type == "REFER_LAB" or assign_lab:
            case.status = "LAB_REFERRED"
            specimen = lab_specimen or "Leaf Sample (पानाचा नमुना)"
            test = lab_test_method or "Microscopy & Molecular PCR"
            sample = self.generate_lab_referral(
                case_id=case_id,
                officer_id=expert_id,
                officer_name=expert_name,
                sample_type=specimen,
                destination_lab="Regional Plant Pathology Laboratory, Nagpur (ICAR-CICR)",
                requested_test=test
            )
            decision_data["lab_sample_id"] = sample.sample_id
            case.expert_decision = decision_data
            case.expert_notes = f"[LAB REFERRAL DISPATCHED] Sample {sample.sample_id} sent for {test}. Notes: {notes}"
            case.recovery_status = "LAB_TESTING_IN_PROGRESS"

        if escalate_outbreak:
            case.priority = "CRITICAL"
            case.priority_score = 99.0

        audit_logger.record(
            user_id=expert_id,
            user_name=expert_name,
            user_role=UserRole.AGRI_EXPERT,
            action=f"EXPERT_DECISION_{action_type}",
            entity_type="CASE",
            entity_id=case_id,
            details={
                "action_type": action_type,
                "ground_truth_status": case.ground_truth_status,
                "modified_diagnosis": modified_diagnosis,
                "override_reason": override_reason,
                "evidence_requests": case.evidence_requests,
                "notes": notes
            }
        )
        return case

    def get_active_learning_pool(self) -> List[Dict[str, Any]]:
        """Returns cases flagged for the Active Learning retraining pipeline"""
        pool = []
        for case in self._cases.values():
            if case.active_learning:
                pool.append({
                    "case_id": case.case_id,
                    "farmer_name": case.farmer_profile.farmer_name,
                    "crop": case.farmer_profile.crop_name,
                    "district": case.farmer_profile.district,
                    "image_url": case.image_url,
                    "ai_prediction": case.active_learning.get("original_ai_prediction"),
                    "ai_confidence_pct": case.active_learning.get("ai_confidence_pct"),
                    "expert_ground_truth": case.active_learning.get("expert_ground_truth"),
                    "override_reason": case.active_learning.get("override_reason"),
                    "curation_status": case.active_learning.get("curation_status"),
                    "tagged_at": case.active_learning.get("tagged_at")
                })
        # If pool is empty, provide initial realistic seed candidates
        if not pool:
            pool.append({
                "case_id": "MH-YAV-10231",
                "farmer_name": "Ramesh Patil (रमेश पाटील)",
                "crop": "Cotton",
                "district": "Yavatmal",
                "image_url": "https://images.unsplash.com/photo-1599818434736-2311f6c770c3?auto=format&fit=crop&w=600&q=80",
                "ai_prediction": "Cotton Pink Bollworm (गुलाबी बोंडअळी)",
                "ai_confidence_pct": 72.0,
                "expert_ground_truth": "American Bollworm (अमेरिकन बोंडअळी)",
                "override_reason": "Morphological larval banding and exit frass inconsistent with AI prediction.",
                "curation_status": "PENDING_DATASET_REVIEW",
                "tagged_at": datetime.now().isoformat()
            })
        return pool

    def curate_active_learning_candidate(self, case_id: str, new_status: str, expert_id: str, expert_name: str) -> Dict[str, Any]:
        case = self._cases.get(case_id)
        if case and case.active_learning:
            case.active_learning["curation_status"] = new_status
            audit_logger.record(
                user_id=expert_id,
                user_name=expert_name,
                user_role=UserRole.AGRI_EXPERT,
                action="ACTIVE_LEARNING_CURATED",
                entity_type="CASE",
                entity_id=case_id,
                details={"status": new_status}
            )
            return case.active_learning
        return {"status": new_status, "case_id": case_id}

    # 5. Farmer Treatment Log & 7-Day Follow-up Verification
    def log_farmer_treatment(self, case_id: str, molecule: str, dosage: str, user_id: str, user_name: str) -> CaseRecord:
        case = self._cases.get(case_id)
        if not case:
            raise KeyError(f"Case {case_id} not found")

        now_iso = datetime.now().isoformat()
        case.treatment_logs.append({
            "timestamp": now_iso,
            "applied_by": user_name,
            "molecule": molecule,
            "dosage_used": dosage,
            "phi_expiry_date": (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        })
        case.status = "TREATMENT_APPLIED"
        case.follow_up_scheduled_at = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        case.recovery_status = "TREATMENT_APPLIED_7_DAY_RECOVERY_TRACKING"

        audit_logger.record(
            user_id=user_id,
            user_name=user_name,
            user_role=UserRole.FARMER,
            action="TREATMENT_APPLIED_RECORDED",
            entity_type="CASE",
            entity_id=case_id,
            details={"molecule": molecule, "dosage": dosage}
        )
        return case

    # 6. Check Follow-Up Outcome & Flag Deterioration Alerts
    def check_follow_up_outcome(self, case_id: str, day0_sev: int, day7_sev: int, officer_id: str, officer_name: str) -> CaseRecord:
        case = self._cases.get(case_id)
        if not case:
            raise KeyError(f"Case {case_id} not found")

        if day7_sev < day0_sev:
            case.treatment_outcome = "IMPROVING"
            case.status = "VERIFIED_RESOLVED"
            case.recovery_status = "RECOVERY_CONFIRMED_HEALING"
        else:
            case.treatment_outcome = "DETERIORATING_ALERT"
            case.status = "EXPERT_REVIEW_REQUIRED"
            case.priority = "CRITICAL"
            case.recovery_status = "DETERIORATION_ALERT_EXPERT_REASSESSMENT_REQUIRED"

        audit_logger.record(
            user_id=officer_id,
            user_name=officer_name,
            user_role=UserRole.KRISHI_SEVAK,
            action="FOLLOW_UP_EVALUATED",
            entity_type="CASE",
            entity_id=case_id,
            details={
                "day0_severity": day0_sev,
                "day7_severity": day7_sev,
                "outcome": case.treatment_outcome,
                "status": case.status
            }
        )
        return case

    def _enrich_sample(self, sample: LabSampleRecord) -> LabSampleRecord:
        if sample and sample.case_id in self._cases:
            case = self._cases[sample.case_id]
            sample.case_image_url = case.image_url
            if case.field_inspection and case.field_inspection.field_photos:
                sample.field_photos = case.field_inspection.field_photos
            if case.field_inspection:
                sample.officer_observation = case.field_inspection.officer_observation
                sample.trap_count = case.field_inspection.trap_count
        return sample

    def get_lab_samples(self) -> List[LabSampleRecord]:
        return [self._enrich_sample(s) for s in self._lab_samples.values()]

    def get_lab_sample(self, sample_id: str) -> Optional[LabSampleRecord]:
        sample = self._lab_samples.get(sample_id)
        if sample:
            return self._enrich_sample(sample)
        return None

    # 7. Diagnostic Lab Intake Workflow
    def intake_lab_sample(
        self,
        sample_id: str,
        packaging: str = "INTACT",
        label: str = "CORRECT",
        quantity: str = "SUFFICIENT",
        contamination: str = "NONE",
        condition: str = "ACCEPTABLE",
        action: str = "ACCEPT", # ACCEPT, REJECT
        rejection_reason: Optional[str] = None,
        tech_id: str = "lab_tech_404",
        tech_name: str = "Dr. Vikas Shinde (Pathology Officer)"
    ) -> LabSampleRecord:
        sample = self._lab_samples.get(sample_id)
        if not sample:
            raise KeyError(f"Lab Sample {sample_id} not found")

        now_str = datetime.now().strftime("%I:%M %p (Today)")
        sample.intake_condition = {
            "packaging": packaging,
            "label": label,
            "quantity": quantity,
            "contamination": contamination,
            "condition": condition
        }

        if action == "ACCEPT":
            sample.status = "RECEIVED"
            sample.chain_of_custody.append({
                "timestamp": now_str,
                "actor": tech_name,
                "role": "DIAGNOSTIC_LAB",
                "location": f"{sample.lab_name} — Intake Desk",
                "action": "Sample Accepted & Intake Logged",
                "remarks": f"Packaging: {packaging} | Label: {label} | Quantity: {quantity} | Condition: {condition}"
            })
            # Update associated case if present
            case = self._cases.get(sample.case_id)
            if case:
                case.recovery_status = "LAB_SAMPLE_RECEIVED_TESTING_QUEUED"
        else:
            sample.status = "REJECTED"
            sample.rejection_reason = rejection_reason or "Sample packaging damaged/degraded upon receipt."
            sample.chain_of_custody.append({
                "timestamp": now_str,
                "actor": tech_name,
                "role": "DIAGNOSTIC_LAB",
                "location": f"{sample.lab_name} — Intake Desk",
                "action": "Sample Rejected (Recollection Required)",
                "remarks": f"Rejection Reason: {sample.rejection_reason}"
            })
            case = self._cases.get(sample.case_id)
            if case:
                case.status = "MORE_EVIDENCE_REQUESTED"
                case.recovery_status = "PHYSICAL_SAMPLE_RECOLLECTION_DISPATCHED"

        audit_logger.record(
            user_id=tech_id,
            user_name=tech_name,
            user_role=UserRole.DIAGNOSTIC_LAB,
            action=f"LAB_INTAKE_{action}",
            entity_type="LAB_SAMPLE",
            entity_id=sample_id,
            details={"condition": sample.intake_condition, "action": action, "rejection_reason": rejection_reason}
        )
        return sample

    # 8. Record Diagnostic Lab Test Result (Microscopy, Molecular PCR, Culture)
    def record_lab_test(
        self,
        sample_id: str,
        test_type: str, # Microscopy, Molecular/PCR, Pure Culture Isolation
        target_organism: str,
        result: str, # POSITIVE, NEGATIVE, INCONCLUSIVE
        observation: str,
        ct_value: Optional[float] = None,
        magnification: Optional[str] = None,
        test_reference: Optional[str] = None,
        micrograph_url: Optional[str] = None,
        tech_id: str = "lab_tech_404",
        tech_name: str = "Dr. Vikas Shinde"
    ) -> LabSampleRecord:
        sample = self._lab_samples.get(sample_id)
        if not sample:
            raise KeyError(f"Lab Sample {sample_id} not found")

        now_iso = datetime.now().isoformat()
        now_str = datetime.now().strftime("%I:%M %p (Today)")

        test_entry = {
            "test_type": test_type,
            "target_organism": target_organism,
            "result": result,
            "observation": observation,
            "technician_id": tech_id,
            "technician_name": tech_name,
            "completed_at": now_iso
        }
        if ct_value is not None:
            test_entry["ct_value"] = ct_value
        if magnification:
            test_entry["magnification"] = magnification
        if test_reference:
            test_entry["test_reference"] = test_reference
        if micrograph_url:
            test_entry["micrograph_url"] = micrograph_url

        sample.tests_performed.append(test_entry)
        sample.status = "TESTING_IN_PROGRESS"
        sample.test_method = f"{test_type} ({result})"

        sample.chain_of_custody.append({
            "timestamp": now_str,
            "actor": tech_name,
            "role": "DIAGNOSTIC_LAB",
            "location": f"{sample.lab_name} — Diagnostic Unit",
            "action": f"{test_type} Assay Performed ({result})",
            "remarks": observation[:120] + ("..." if len(observation) > 120 else "")
        })

        case = self._cases.get(sample.case_id)
        if case:
            case.recovery_status = f"LAB_ASSAY_{test_type.upper()}_COMPLETED"

        audit_logger.record(
            user_id=tech_id,
            user_name=tech_name,
            user_role=UserRole.DIAGNOSTIC_LAB,
            action="LAB_TEST_RECORDED",
            entity_type="LAB_SAMPLE",
            entity_id=sample_id,
            details=test_entry
        )
        return sample

    # 9. Publish & Lock Official Pathology Report (Immutable V1 -> V2)
    def publish_lab_report(
        self,
        sample_id: str,
        finding: str, # CONFIRMED, NOT_CONFIRMED, VARIANT_STRAIN
        confirmed_entity: str,
        test_summary: str,
        pathologist_remarks: str,
        certifying_scientist: str = "Dr. Anant Deshpande (Lead Pathologist, ICAR-CICR / ISO-17025)",
        tech_id: str = "lab_chief_404",
        tech_name: str = "Dr. Anant Deshpande"
    ) -> LabSampleRecord:
        sample = self._lab_samples.get(sample_id)
        if not sample:
            raise KeyError(f"Lab Sample {sample_id} not found")

        now_iso = datetime.now().isoformat()
        now_str = datetime.now().strftime("%I:%M %p (Today)")

        if sample.final_report:
            # Increment version for audit tracking
            new_version = sample.report_version + 1
            sample.revision_history.append({
                "previous_version": sample.report_version,
                "previous_report": sample.final_report,
                "revised_by": tech_name,
                "revised_at": now_iso
            })
            sample.report_version = new_version
        else:
            sample.report_version = 1

        sample.final_report = {
            "finding": finding,
            "confirmed_entity": confirmed_entity,
            "test_summary": test_summary,
            "pathologist_remarks": pathologist_remarks,
            "certifying_scientist": certifying_scientist,
            "version": sample.report_version,
            "published_at": now_iso
        }
        sample.status = "REPORT_ISSUED"
        sample.findings = f"[{finding}] {confirmed_entity}. {pathologist_remarks}"
        sample.certified_by = certifying_scientist
        sample.issued_at = now_iso
        sample.report_url = f"/api/lab/samples/{sample_id}/report.pdf"

        sample.chain_of_custody.append({
            "timestamp": now_str,
            "actor": certifying_scientist,
            "role": "DIAGNOSTIC_LAB",
            "location": f"{sample.lab_name} — Certification Chamber",
            "action": f"Official Pathology Report Published & Locked (V{sample.report_version})",
            "remarks": f"Final Diagnosis: {confirmed_entity} | Finding: {finding}"
        })

        # Update associated case to reflect scientific confirmation
        case = self._cases.get(sample.case_id)
        if case:
            case.status = "LAB_TESTED"
            case.ground_truth_status = "LAB_CONFIRMED_GROUND_TRUTH"
            case.recovery_status = "LAB_REPORT_AVAILABLE_EXPERT_DECISION_READY"
            case.expert_notes = f"[LABORATORY CONFIRMATION V{sample.report_version}] {confirmed_entity} ({finding}). Certified by {certifying_scientist}."
            
            # Sync into Active Learning Pool with Gold-Standard tag
            if case.diagnosis.detected_entity != confirmed_entity or case.active_learning:
                case.active_learning = {
                    "original_ai_prediction": case.diagnosis.detected_entity,
                    "ai_confidence_pct": round(case.diagnosis.confidence_score * 100, 1),
                    "expert_ground_truth": confirmed_entity,
                    "override_reason": f"NABL Diagnostic Lab Molecular / Microscopy Confirmation V{sample.report_version}",
                    "curation_status": "APPROVED_FOR_DATASET",
                    "gold_standard": True,
                    "tagged_at": now_iso
                }

        audit_logger.record(
            user_id=tech_id,
            user_name=tech_name,
            user_role=UserRole.DIAGNOSTIC_LAB,
            action="LAB_REPORT_PUBLISHED_LOCKED",
            entity_type="LAB_SAMPLE",
            entity_id=sample_id,
            details=sample.final_report
        )
        return sample

    # 10. Request Sample Physical Recollection
    def recollect_lab_sample(
        self,
        sample_id: str,
        reason: str,
        tech_id: str = "lab_tech_404",
        tech_name: str = "Dr. Vikas Shinde"
    ) -> LabSampleRecord:
        sample = self._lab_samples.get(sample_id)
        if not sample:
            raise KeyError(f"Lab Sample {sample_id} not found")

        now_str = datetime.now().strftime("%I:%M %p (Today)")
        sample.status = "REJECTED"
        sample.rejection_reason = reason
        sample.chain_of_custody.append({
            "timestamp": now_str,
            "actor": tech_name,
            "role": "DIAGNOSTIC_LAB",
            "location": sample.lab_name,
            "action": "Physical Recollection Mandated",
            "remarks": f"Reason: {reason}"
        })

        case = self._cases.get(sample.case_id)
        if case:
            case.status = "MORE_EVIDENCE_REQUESTED"
            case.recovery_status = "RECOLLECTION_DISPATCHED_TO_KRISHI_SEVAK"

        audit_logger.record(
            user_id=tech_id,
            user_name=tech_name,
            user_role=UserRole.DIAGNOSTIC_LAB,
            action="LAB_RECOLLECTION_REQUESTED",
            entity_type="LAB_SAMPLE",
            entity_id=sample_id,
            details={"reason": reason}
        )
        return sample

    def get_all_profiles(self) -> List[FarmProfile]:
        return list(self._profiles.values())

    def get_profile(self, farm_id: str) -> Optional[FarmProfile]:
        return self._profiles.get(farm_id)

    def update_profile(self, profile: FarmProfile, user_id: str = "farmer_101") -> FarmProfile:
        self._profiles[profile.id] = profile
        return profile

case_manager = CaseManager()

