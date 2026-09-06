from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from app.models.schemas import UserRole
from app.core.audit_logger import audit_logger
from app.core.system_monitor import system_monitor

# Maharashtra 36 Districts Geospatial Data with Talukas, Villages & Epidemiological Metrics
MAHARASHTRA_DISTRICTS = [
    {
        "name": "Yavatmal",
        "lat": 20.3888,
        "lng": 78.1204,
        "division": "Vidarbha",
        "crop": "Cotton",
        "threat": "Cotton Pink Bollworm (PBW)",
        "cases": 284,
        "confirmed": 196,
        "field_verified": 211,
        "lab_confirmed": 73,
        "suspected": 284,
        "high_severity": 43,
        "high_risk_farms": 71,
        "etl_breaches": 38,
        "risk": "CRITICAL",
        "risk_score": 92,
        "r0_velocity": 2.8,
        "trend": "INCREASING",
        "trajectory_7d": [4, 9, 18, 31, 47, 58, 72],
        "forecast_7d": [
            {"day": "Tomorrow", "risk": 78, "level": "HIGH"},
            {"day": "Day 2", "risk": 84, "level": "CRITICAL"},
            {"day": "Day 3", "risk": 89, "level": "CRITICAL"},
            {"day": "Day 4", "risk": 92, "level": "CRITICAL"},
            {"day": "Day 5", "risk": 88, "level": "HIGH"},
            {"day": "Day 6", "risk": 81, "level": "HIGH"},
            {"day": "Day 7", "risk": 74, "level": "HIGH"}
        ],
        "top_threats": [
            {"threat": "Pink Bollworm (गुलाबी बोंडअळी)", "cases": 128, "pct": 65},
            {"threat": "Bacterial Blight (करपा)", "cases": 42, "pct": 21},
            {"threat": "Spodoptera / Sucking Pests", "cases": 26, "pct": 14}
        ],
        "talukas": [
            {
                "name": "Darwha",
                "cases": 112,
                "confirmed": 84,
                "risk": "CRITICAL",
                "risk_score": 94,
                "villages": [
                    {"name": "Zadgaon", "cases": 34, "risk": "CRITICAL", "confirmed": 28, "farmers": 420},
                    {"name": "Borgaon", "cases": 26, "risk": "HIGH", "confirmed": 20, "farmers": 380},
                    {"name": "Mahagaon", "cases": 22, "risk": "HIGH", "confirmed": 17, "farmers": 310},
                    {"name": "Chikhali", "cases": 18, "risk": "MODERATE", "confirmed": 12, "farmers": 290},
                    {"name": "Hatgaon", "cases": 12, "risk": "MODERATE", "confirmed": 7, "farmers": 240}
                ]
            },
            {
                "name": "Pusad",
                "cases": 68,
                "confirmed": 47,
                "risk": "HIGH",
                "risk_score": 82,
                "villages": [
                    {"name": "Kumbhari", "cases": 24, "risk": "HIGH", "confirmed": 18, "farmers": 350},
                    {"name": "Shelu", "cases": 19, "risk": "HIGH", "confirmed": 14, "farmers": 290},
                    {"name": "Gahuli", "cases": 15, "risk": "MODERATE", "confirmed": 9, "farmers": 260},
                    {"name": "Fulsavangi", "cases": 10, "risk": "MODERATE", "confirmed": 6, "farmers": 220}
                ]
            },
            {
                "name": "Ralegaon",
                "cases": 54,
                "confirmed": 36,
                "risk": "HIGH",
                "risk_score": 79,
                "villages": [
                    {"name": "Ralegaon Rural", "cases": 22, "risk": "HIGH", "confirmed": 15, "farmers": 310},
                    {"name": "Pardi", "cases": 18, "risk": "MODERATE", "confirmed": 12, "farmers": 270},
                    {"name": "Wadki", "cases": 14, "risk": "MODERATE", "confirmed": 9, "farmers": 230}
                ]
            },
            {
                "name": "Digras",
                "cases": 32,
                "confirmed": 19,
                "risk": "MODERATE",
                "risk_score": 64,
                "villages": [
                    {"name": "Singhad", "cases": 14, "risk": "MODERATE", "confirmed": 9, "farmers": 210},
                    {"name": "Dehagaon", "cases": 10, "risk": "MODERATE", "confirmed": 6, "farmers": 180},
                    {"name": "Mandva", "cases": 8, "risk": "GUARDED", "confirmed": 4, "farmers": 150}
                ]
            },
            {
                "name": "Umarkhed",
                "cases": 18,
                "confirmed": 10,
                "risk": "GUARDED",
                "risk_score": 48,
                "villages": [
                    {"name": "Umarkhed North", "cases": 10, "risk": "GUARDED", "confirmed": 6, "farmers": 200},
                    {"name": "Danki", "cases": 8, "risk": "GUARDED", "confirmed": 4, "farmers": 170}
                ]
            }
        ],
        "ksevak_sla": {
            "cases_assigned": 284,
            "field_inspected": 211,
            "pending_inspection": 32,
            "avg_response_hours": 4.2,
            "sla_compliance_pct": 91.2,
            "overdue_cases": 7
        },
        "expert_lab_sla": {
            "expert_triage_cases": 211,
            "avg_expert_response_hours": 5.7,
            "lab_referrals": 83,
            "avg_lab_turnaround_hours": 31.0,
            "pending_lab_reports": 12
        },
        "intervention_impact": {
            "pre_intervention_cases": 284,
            "pre_intervention_risk": 92,
            "post_intervention_cases": 61,
            "post_intervention_risk": 57,
            "reduction_pct": 78.5,
            "trend": "DECREASING"
        }
    },
    {
        "name": "Wardha",
        "lat": 20.7453,
        "lng": 78.6022,
        "division": "Vidarbha",
        "crop": "Cotton & Soybean",
        "threat": "Soybean Rust & PBW",
        "cases": 215,
        "confirmed": 148,
        "field_verified": 165,
        "lab_confirmed": 42,
        "suspected": 215,
        "high_severity": 31,
        "high_risk_farms": 48,
        "etl_breaches": 18,
        "risk": "HIGH",
        "risk_score": 84,
        "r0_velocity": 2.1,
        "trend": "INCREASING",
        "trajectory_7d": [3, 7, 14, 22, 33, 44, 52],
        "forecast_7d": [
            {"day": "Tomorrow", "risk": 74, "level": "HIGH"},
            {"day": "Day 2", "risk": 80, "level": "HIGH"},
            {"day": "Day 3", "risk": 85, "level": "CRITICAL"},
            {"day": "Day 4", "risk": 87, "level": "CRITICAL"},
            {"day": "Day 5", "risk": 82, "level": "HIGH"},
            {"day": "Day 6", "risk": 76, "level": "HIGH"},
            {"day": "Day 7", "risk": 70, "level": "MODERATE"}
        ],
        "top_threats": [
            {"threat": "Soybean Rust (तांबेरा)", "cases": 110, "pct": 51},
            {"threat": "Pink Bollworm (गुलाबी बोंडअळी)", "cases": 75, "pct": 35},
            {"threat": "Cercospora Leaf Spot", "cases": 30, "pct": 14}
        ],
        "ksevak_sla": {"cases_assigned": 215, "field_inspected": 165, "pending_inspection": 24, "avg_response_hours": 4.8, "sla_compliance_pct": 89.4, "overdue_cases": 5},
        "expert_lab_sla": {"expert_triage_cases": 165, "avg_expert_response_hours": 6.2, "lab_referrals": 45, "avg_lab_turnaround_hours": 33.5, "pending_lab_reports": 8},
        "intervention_impact": {"pre_intervention_cases": 215, "pre_intervention_risk": 84, "post_intervention_cases": 72, "post_intervention_risk": 59, "reduction_pct": 66.5, "trend": "DECREASING"}
    },
    {
        "name": "Nashik",
        "lat": 19.9975,
        "lng": 73.7898,
        "division": "Khandesh",
        "crop": "Grapes & Onion",
        "threat": "Grape Downy Mildew & Onion Purple Blotch",
        "cases": 512,
        "confirmed": 380,
        "field_verified": 415,
        "lab_confirmed": 112,
        "suspected": 512,
        "high_severity": 84,
        "high_risk_farms": 115,
        "etl_breaches": 29,
        "risk": "CRITICAL",
        "risk_score": 91,
        "r0_velocity": 2.6,
        "trend": "INCREASING",
        "trajectory_7d": [8, 19, 38, 62, 95, 120, 145],
        "forecast_7d": [
            {"day": "Tomorrow", "risk": 72, "level": "HIGH"},
            {"day": "Day 2", "risk": 78, "level": "HIGH"},
            {"day": "Day 3", "risk": 84, "level": "CRITICAL"},
            {"day": "Day 4", "risk": 89, "level": "CRITICAL"},
            {"day": "Day 5", "risk": 91, "level": "CRITICAL"},
            {"day": "Day 6", "risk": 86, "level": "CRITICAL"},
            {"day": "Day 7", "risk": 79, "level": "HIGH"}
        ],
        "top_threats": [
            {"threat": "Grape Downy Mildew (केवडा)", "cases": 295, "pct": 58},
            {"threat": "Onion Purple Blotch (जांभळा करपा)", "cases": 145, "pct": 28},
            {"threat": "Powdery Mildew (भुरी)", "cases": 72, "pct": 14}
        ],
        "ksevak_sla": {"cases_assigned": 512, "field_inspected": 415, "pending_inspection": 48, "avg_response_hours": 3.9, "sla_compliance_pct": 93.1, "overdue_cases": 9},
        "expert_lab_sla": {"expert_triage_cases": 415, "avg_expert_response_hours": 4.9, "lab_referrals": 130, "avg_lab_turnaround_hours": 28.0, "pending_lab_reports": 18},
        "intervention_impact": {"pre_intervention_cases": 512, "pre_intervention_risk": 91, "post_intervention_cases": 130, "post_intervention_risk": 54, "reduction_pct": 74.6, "trend": "DECREASING"}
    },
    {
        "name": "Solapur",
        "lat": 17.6599,
        "lng": 75.9064,
        "division": "Western Maharashtra",
        "crop": "Pomegranate & Sugarcane",
        "threat": "Bacterial Blight (Telya / तेल्या)",
        "cases": 380,
        "confirmed": 265,
        "field_verified": 290,
        "lab_confirmed": 68,
        "suspected": 380,
        "high_severity": 62,
        "high_risk_farms": 88,
        "etl_breaches": 22,
        "risk": "CRITICAL",
        "risk_score": 89,
        "r0_velocity": 2.4,
        "trend": "INCREASING",
        "trajectory_7d": [5, 12, 26, 44, 68, 85, 105],
        "forecast_7d": [
            {"day": "Tomorrow", "risk": 75, "level": "HIGH"},
            {"day": "Day 2", "risk": 81, "level": "HIGH"},
            {"day": "Day 3", "risk": 86, "level": "CRITICAL"},
            {"day": "Day 4", "risk": 89, "level": "CRITICAL"},
            {"day": "Day 5", "risk": 85, "level": "HIGH"},
            {"day": "Day 6", "risk": 80, "level": "HIGH"},
            {"day": "Day 7", "risk": 73, "level": "MODERATE"}
        ],
        "top_threats": [
            {"threat": "Pomegranate Bacterial Blight (तेल्या)", "cases": 240, "pct": 63},
            {"threat": "Wilt / Root Rot", "cases": 85, "pct": 22},
            {"threat": "Sugarcane Early Shoot Borer", "cases": 55, "pct": 15}
        ],
        "ksevak_sla": {"cases_assigned": 380, "field_inspected": 290, "pending_inspection": 38, "avg_response_hours": 4.5, "sla_compliance_pct": 90.5, "overdue_cases": 6},
        "expert_lab_sla": {"expert_triage_cases": 290, "avg_expert_response_hours": 5.4, "lab_referrals": 75, "avg_lab_turnaround_hours": 29.5, "pending_lab_reports": 11},
        "intervention_impact": {"pre_intervention_cases": 380, "pre_intervention_risk": 89, "post_intervention_cases": 95, "post_intervention_risk": 52, "reduction_pct": 75.0, "trend": "DECREASING"}
    },
    {
        "name": "Pune",
        "lat": 18.5204,
        "lng": 73.8567,
        "division": "Western Maharashtra",
        "crop": "Sugarcane & Tomato",
        "threat": "Tomato Late Blight & Early Blight",
        "cases": 195,
        "confirmed": 135,
        "field_verified": 150,
        "lab_confirmed": 38,
        "suspected": 195,
        "high_severity": 25,
        "high_risk_farms": 36,
        "etl_breaches": 8,
        "risk": "MODERATE",
        "risk_score": 68,
        "r0_velocity": 1.4,
        "trend": "STABLE",
        "trajectory_7d": [4, 8, 12, 16, 20, 22, 24],
        "forecast_7d": [
            {"day": "Tomorrow", "risk": 64, "level": "MODERATE"},
            {"day": "Day 2", "risk": 66, "level": "MODERATE"},
            {"day": "Day 3", "risk": 68, "level": "MODERATE"},
            {"day": "Day 4", "risk": 67, "level": "MODERATE"},
            {"day": "Day 5", "risk": 63, "level": "MODERATE"},
            {"day": "Day 6", "risk": 60, "level": "MODERATE"},
            {"day": "Day 7", "risk": 55, "level": "GUARDED"}
        ],
        "top_threats": [
            {"threat": "Tomato Late Blight (करपा)", "cases": 115, "pct": 59},
            {"threat": "Sugarcane Red Rot", "cases": 45, "pct": 23},
            {"threat": "Tospovirus (Bud Necrosis)", "cases": 35, "pct": 18}
        ],
        "ksevak_sla": {"cases_assigned": 195, "field_inspected": 150, "pending_inspection": 18, "avg_response_hours": 3.8, "sla_compliance_pct": 94.2, "overdue_cases": 3},
        "expert_lab_sla": {"expert_triage_cases": 150, "avg_expert_response_hours": 4.5, "lab_referrals": 40, "avg_lab_turnaround_hours": 26.0, "pending_lab_reports": 6},
        "intervention_impact": {"pre_intervention_cases": 195, "pre_intervention_risk": 68, "post_intervention_cases": 58, "post_intervention_risk": 45, "reduction_pct": 70.2, "trend": "DECREASING"}
    },
    {
        "name": "Ahmednagar",
        "lat": 19.0948,
        "lng": 74.7480,
        "division": "Western Maharashtra",
        "crop": "Sugarcane & Onion",
        "threat": "Onion Purple Blotch & Sugarcane Pyrilla",
        "cases": 320,
        "confirmed": 225,
        "field_verified": 245,
        "lab_confirmed": 54,
        "suspected": 320,
        "high_severity": 48,
        "high_risk_farms": 68,
        "etl_breaches": 16,
        "risk": "HIGH",
        "risk_score": 81,
        "r0_velocity": 1.9,
        "trend": "INCREASING",
        "trajectory_7d": [6, 14, 28, 42, 60, 78, 92],
        "forecast_7d": [
            {"day": "Tomorrow", "risk": 72, "level": "HIGH"},
            {"day": "Day 2", "risk": 76, "level": "HIGH"},
            {"day": "Day 3", "risk": 81, "level": "HIGH"},
            {"day": "Day 4", "risk": 83, "level": "HIGH"},
            {"day": "Day 5", "risk": 79, "level": "HIGH"},
            {"day": "Day 6", "risk": 74, "level": "HIGH"},
            {"day": "Day 7", "risk": 68, "level": "MODERATE"}
        ],
        "top_threats": [
            {"threat": "Onion Purple Blotch (करपा)", "cases": 185, "pct": 58},
            {"threat": "Sugarcane Pyrilla", "cases": 80, "pct": 25},
            {"threat": "Gram Pod Borer", "cases": 55, "pct": 17}
        ],
        "ksevak_sla": {"cases_assigned": 320, "field_inspected": 245, "pending_inspection": 28, "avg_response_hours": 4.1, "sla_compliance_pct": 92.0, "overdue_cases": 4},
        "expert_lab_sla": {"expert_triage_cases": 245, "avg_expert_response_hours": 5.1, "lab_referrals": 60, "avg_lab_turnaround_hours": 30.0, "pending_lab_reports": 9},
        "intervention_impact": {"pre_intervention_cases": 320, "pre_intervention_risk": 81, "post_intervention_cases": 88, "post_intervention_risk": 51, "reduction_pct": 72.5, "trend": "DECREASING"}
    },
    {
        "name": "Chhatrapati Sambhajinagar",
        "lat": 19.8762,
        "lng": 75.3433,
        "division": "Marathwada",
        "crop": "Cotton & Maize",
        "threat": "Fall Armyworm & Pink Bollworm",
        "cases": 289,
        "confirmed": 198,
        "field_verified": 220,
        "lab_confirmed": 48,
        "suspected": 289,
        "high_severity": 39,
        "high_risk_farms": 56,
        "etl_breaches": 15,
        "risk": "HIGH",
        "risk_score": 83,
        "r0_velocity": 2.0,
        "trend": "INCREASING",
        "trajectory_7d": [5, 11, 24, 38, 55, 70, 84],
        "forecast_7d": [
            {"day": "Tomorrow", "risk": 74, "level": "HIGH"},
            {"day": "Day 2", "risk": 79, "level": "HIGH"},
            {"day": "Day 3", "risk": 83, "level": "HIGH"},
            {"day": "Day 4", "risk": 85, "level": "HIGH"},
            {"day": "Day 5", "risk": 81, "level": "HIGH"},
            {"day": "Day 6", "risk": 75, "level": "HIGH"},
            {"day": "Day 7", "risk": 69, "level": "MODERATE"}
        ],
        "top_threats": [
            {"threat": "Fall Armyworm on Maize (लष्करी अळी)", "cases": 155, "pct": 54},
            {"threat": "Cotton Pink Bollworm", "cases": 90, "pct": 31},
            {"threat": "Ginger Soft Rot", "cases": 44, "pct": 15}
        ],
        "ksevak_sla": {"cases_assigned": 289, "field_inspected": 220, "pending_inspection": 26, "avg_response_hours": 4.3, "sla_compliance_pct": 91.5, "overdue_cases": 5},
        "expert_lab_sla": {"expert_triage_cases": 220, "avg_expert_response_hours": 5.5, "lab_referrals": 52, "avg_lab_turnaround_hours": 32.0, "pending_lab_reports": 8},
        "intervention_impact": {"pre_intervention_cases": 289, "pre_intervention_risk": 83, "post_intervention_cases": 82, "post_intervention_risk": 53, "reduction_pct": 71.6, "trend": "DECREASING"}
    },
    {
        "name": "Nanded",
        "lat": 19.1383,
        "lng": 77.3210,
        "division": "Marathwada",
        "crop": "Cotton & Banana",
        "threat": "Banana Sigatoka & Cotton PBW",
        "cases": 310,
        "confirmed": 215,
        "field_verified": 235,
        "lab_confirmed": 52,
        "suspected": 310,
        "high_severity": 44,
        "high_risk_farms": 62,
        "etl_breaches": 17,
        "risk": "HIGH",
        "risk_score": 82,
        "r0_velocity": 1.9,
        "trend": "INCREASING",
        "trajectory_7d": [6, 13, 27, 41, 58, 74, 88],
        "forecast_7d": [
            {"day": "Tomorrow", "risk": 73, "level": "HIGH"},
            {"day": "Day 2", "risk": 78, "level": "HIGH"},
            {"day": "Day 3", "risk": 82, "level": "HIGH"},
            {"day": "Day 4", "risk": 84, "level": "HIGH"},
            {"day": "Day 5", "risk": 80, "level": "HIGH"},
            {"day": "Day 6", "risk": 74, "level": "HIGH"},
            {"day": "Day 7", "risk": 68, "level": "MODERATE"}
        ],
        "top_threats": [
            {"threat": "Banana Sigatoka Leaf Spot", "cases": 165, "pct": 53},
            {"threat": "Cotton Pink Bollworm", "cases": 95, "pct": 31},
            {"threat": "Tur Pod Borer", "cases": 50, "pct": 16}
        ],
        "ksevak_sla": {"cases_assigned": 310, "field_inspected": 235, "pending_inspection": 30, "avg_response_hours": 4.4, "sla_compliance_pct": 90.8, "overdue_cases": 6},
        "expert_lab_sla": {"expert_triage_cases": 235, "avg_expert_response_hours": 5.6, "lab_referrals": 58, "avg_lab_turnaround_hours": 31.5, "pending_lab_reports": 10},
        "intervention_impact": {"pre_intervention_cases": 310, "pre_intervention_risk": 82, "post_intervention_cases": 90, "post_intervention_risk": 54, "reduction_pct": 71.0, "trend": "DECREASING"}
    },
    {
        "name": "Jalgaon",
        "lat": 21.0077,
        "lng": 75.5626,
        "division": "Khandesh",
        "crop": "Banana & Cotton",
        "threat": "Banana Erwinia Rhizome Rot & PBW",
        "cases": 340,
        "confirmed": 230,
        "field_verified": 255,
        "lab_confirmed": 58,
        "suspected": 340,
        "high_severity": 46,
        "high_risk_farms": 65,
        "etl_breaches": 18,
        "risk": "HIGH",
        "risk_score": 84,
        "r0_velocity": 2.0,
        "trend": "INCREASING",
        "trajectory_7d": [7, 15, 30, 48, 68, 86, 102],
        "forecast_7d": [
            {"day": "Tomorrow", "risk": 75, "level": "HIGH"},
            {"day": "Day 2", "risk": 80, "level": "HIGH"},
            {"day": "Day 3", "risk": 84, "level": "HIGH"},
            {"day": "Day 4", "risk": 86, "level": "HIGH"},
            {"day": "Day 5", "risk": 82, "level": "HIGH"},
            {"day": "Day 6", "risk": 76, "level": "HIGH"},
            {"day": "Day 7", "risk": 70, "level": "MODERATE"}
        ],
        "top_threats": [
            {"threat": "Banana Erwinia Rhizome Rot (कंद कुज)", "cases": 180, "pct": 53},
            {"threat": "Cotton Pink Bollworm", "cases": 105, "pct": 31},
            {"threat": "Cotton Sucking Pests (मावा/तुडतुडे)", "cases": 55, "pct": 16}
        ],
        "ksevak_sla": {"cases_assigned": 340, "field_inspected": 255, "pending_inspection": 32, "avg_response_hours": 4.2, "sla_compliance_pct": 91.8, "overdue_cases": 5},
        "expert_lab_sla": {"expert_triage_cases": 255, "avg_expert_response_hours": 5.3, "lab_referrals": 62, "avg_lab_turnaround_hours": 30.5, "pending_lab_reports": 9},
        "intervention_impact": {"pre_intervention_cases": 340, "pre_intervention_risk": 84, "post_intervention_cases": 94, "post_intervention_risk": 52, "reduction_pct": 72.4, "trend": "DECREASING"}
    }
]

class SurveillanceService:
    """State-Level Epidemiological Surveillance & Government Command Center Engine"""

    _broadcasts: List[Dict[str, Any]] = [
        {
            "broadcast_id": "BC-MH-081",
            "timestamp": (datetime.now() - timedelta(hours=6)).isoformat(),
            "target_districts": ["Yavatmal", "Wardha", "Chandrapur"],
            "target_crop": "Cotton",
            "threat": "Cotton Pink Bollworm (PBW) ETL Surge Alert",
            "severity": "CRITICAL",
            "channels": ["SMS", "WhatsApp", "IVR Audio", "In-App"],
            "languages": ["Marathi (मराठी)", "English", "Hindi (हिंदी)"],
            "target_roles": ["Farmers", "Krishi Sevaks", "Agriculture Officers (AO)"],
            "message_mr": "सावधान! यवतमाळ व वर्धा जिल्ह्यात कापसावर गुलाबी बोंडअळीचा प्रादुर्भाव आर्थिक नुकसान पातळीच्या (ETL) वर गेला आहे. त्वरित एकरी ५ कामगंध सापळे लावा व निंबोळी अर्क ५% किंवा इमामेक्टिन बेन्झोएट ५% ची फवारणी करा.",
            "recipients_count": 12500,
            "delivery_rate_pct": 98.6,
            "status": "DELIVERED"
        },
        {
            "broadcast_id": "BC-MH-080",
            "timestamp": (datetime.now() - timedelta(days=2)).isoformat(),
            "target_districts": ["Nashik", "Ahmednagar", "Pune"],
            "target_crop": "Grapes & Tomato",
            "threat": "Downy Mildew & Late Blight Weather Warning",
            "severity": "HIGH",
            "channels": ["SMS", "WhatsApp", "In-App"],
            "languages": ["Marathi (मराठी)", "English"],
            "target_roles": ["Farmers", "Krishi Sevaks"],
            "message_mr": "हवामान इशारा: सलग ढगाळ हवामान व उच्च आर्द्रतेमुळे (८५%+) द्राक्षांवर केवडा व टोमॅटोवर करप्याचा धोका वाढला आहे. त्वरित सायमॉक्सानिल + मँकोझेब प्रतिबंधात्मक फवारणी करा.",
            "recipients_count": 8400,
            "delivery_rate_pct": 99.1,
            "status": "DELIVERED"
        }
    ]

    def get_district_hotspots(self) -> List[Dict[str, Any]]:
        return MAHARASHTRA_DISTRICTS

    def get_district_detail(self, name: str) -> Optional[Dict[str, Any]]:
        for d in MAHARASHTRA_DISTRICTS:
            if d["name"].lower() == name.lower():
                return d
        return MAHARASHTRA_DISTRICTS[0]

    def get_surveillance_summary(self) -> Dict[str, Any]:
        return {
            "state": "Maharashtra (महाराष्ट्र शासन)",
            "state_title": "State Crop Health Surveillance & Decision Support System",
            "command_metrics": {
                "active_outbreaks": 18,
                "high_risk_districts": 7,
                "active_cases": 2486,
                "confirmed_cases": 1732,
                "lab_confirmed": 384,
                "etl_breaches": 127,
                "high_risk_farms": 412,
                "cases_resolved": 1945
            },
            "top_threats_ranking": [
                {"rank": 1, "crop": "Cotton", "threat": "Pink Bollworm (गुलाबी बोंडअळी)", "risk_level": "CRITICAL", "active_districts": 8, "affected_farmers_est": 18400, "surge_r0": 2.8},
                {"rank": 2, "crop": "Soybean", "threat": "Yellow Mosaic & Rust (तांबेरा)", "risk_level": "HIGH", "active_districts": 6, "affected_farmers_est": 14200, "surge_r0": 2.2},
                {"rank": 3, "crop": "Tomato", "threat": "Late Blight (करपा)", "risk_level": "HIGH", "active_districts": 5, "affected_farmers_est": 8600, "surge_r0": 1.8},
                {"rank": 4, "crop": "Grapes", "threat": "Downy Mildew (केवडा)", "risk_level": "HIGH", "active_districts": 4, "affected_farmers_est": 9400, "surge_r0": 2.5},
                {"rank": 5, "crop": "Pomegranate", "threat": "Bacterial Blight (तेल्या)", "risk_level": "CRITICAL", "active_districts": 3, "affected_farmers_est": 4800, "surge_r0": 2.4}
            ],
            "state_pipeline_breakdown": {
                "suspected_ai": 2486,
                "field_verified_ksevak": 1940,
                "expert_confirmed": 1732,
                "lab_confirmed_nabl": 384
            },
            "sla_state_averages": {
                "ksevak_avg_response_hours": 4.2,
                "ksevak_sla_compliance_pct": 91.4,
                "expert_avg_turnaround_hours": 5.4,
                "lab_avg_turnaround_hours": 30.8,
                "overdue_inspections": 31
            },
            "active_learning_monitor": {
                "total_expert_ground_truth": 1284,
                "lab_gold_standard_confirmed": 384,
                "ai_disagreements": 143,
                "low_confidence_cases": 218,
                "curated_retraining_pool": 96
            },
            "broadcasts_dispatched": len(self._broadcasts)
        }

    def trigger_epidemic_broadcast(
        self,
        districts: List[str],
        crop: str,
        threat: str,
        severity: str = "CRITICAL",
        channels: List[str] = ["SMS", "WhatsApp", "In-App"],
        languages: List[str] = ["Marathi (मराठी)", "English"],
        target_roles: List[str] = ["Farmers", "Krishi Sevaks"],
        message_mr: str = "",
        user_id: str = "govt_101",
        user_name: str = "Shri. V. K. Jadhav, IAS (Director of Agriculture)"
    ) -> Dict[str, Any]:
        broadcast_id = f"BC-MH-{len(self._broadcasts)+101:03d}"
        recipients = len(districts) * 4200

        entry = {
            "broadcast_id": broadcast_id,
            "timestamp": datetime.now().isoformat(),
            "target_districts": districts,
            "target_crop": crop,
            "threat": threat,
            "severity": severity,
            "channels": channels,
            "languages": languages,
            "target_roles": target_roles,
            "message_mr": message_mr,
            "recipients_count": recipients,
            "delivery_rate_pct": 98.4,
            "status": "DELIVERED"
        }
        self._broadcasts.insert(0, entry)

        system_monitor.log_alert_delivery(True)
        audit_logger.record(
            user_id=user_id,
            user_name=user_name,
            user_role=UserRole.GOVT_ADMIN,
            action="STATE_EMERGENCY_BROADCAST_DISPATCHED",
            entity_type="BROADCAST",
            entity_id=broadcast_id,
            details={
                "districts": districts,
                "crop": crop,
                "threat": threat,
                "severity": severity,
                "recipients": recipients,
                "channels": channels
            }
        )
        return entry

    def get_broadcasts(self) -> List[Dict[str, Any]]:
        return self._broadcasts

surveillance_service = SurveillanceService()

