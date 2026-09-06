from typing import Dict, List, Optional
from fastapi import Header, HTTPException, status
from app.models.schemas import UserRole

# Define Granular RBAC Permissions
ROLE_PERMISSIONS: Dict[UserRole, List[str]] = {
    UserRole.FARMER: [
        "profile:view_own",
        "profile:update_own",
        "diagnosis:create",
        "diagnosis:view_own",
        "advisory:read_multilingual",
        "traps:view_own",
        "cases:create",
        "cases:view_own",
        "cases:log_treatment",
        "alerts:receive"
    ],
    UserRole.KRISHI_SEVAK: [
        "profile:view_assigned",
        "diagnosis:create_field",
        "diagnosis:view_district",
        "traps:inspect_field",
        "traps:record_count",
        "cases:verify_field",
        "cases:update_status",
        "lab:collect_sample",
        "lab:dispatch_sample",
        "alerts:broadcast_local"
    ],
    UserRole.AGRI_EXPERT: [
        "diagnosis:triage_queue",
        "diagnosis:review_ai",
        "diagnosis:modify_override",
        "diagnosis:active_learning_confirm",
        "prescriptions:create_custom",
        "lab:refer_sample",
        "lab:view_reports",
        "ipm:suggest_revision",
        "surveillance:view_state"
    ],
    UserRole.DIAGNOSTIC_LAB: [
        "lab:view_intake_queue",
        "lab:verify_qr",
        "lab:intake",
        "lab:run_tests",
        "lab:record_pathology_test",
        "lab:publish_report",
        "lab:publish_certified_report",
        "cases:view_referred"
    ],
    UserRole.GOVT_ADMIN: [
        "surveillance:full_state_view",
        "surveillance:gis_hotspots",
        "surveillance:export_reports",
        "alerts:broadcast_statewide",
        "alerts:manage_epidemic_declaration",
        "audit:view_immutable_trail",
        "monitoring:system_health",
        "users:manage_rbac",
        "sensors:manage_telemetry"
    ]
}

# Mock authenticated personas for testing & role simulation
AUTHENTICATED_USERS = {
    "farmer_101": {
        "user_id": "farmer_101",
        "user_name": "Ramesh Tukaram Patil (रमेश तुकाराम पाटील)",
        "role": UserRole.FARMER,
        "district": "Yavatmal",
        "taluka": "Ralegaon",
        "village": "Zadgaon"
    },
    "ksevak_202": {
        "user_id": "ksevak_202",
        "user_name": "Anil S. Deshmukh (अनिल देशमुख - कृषी सेवक)",
        "role": UserRole.KRISHI_SEVAK,
        "district": "Yavatmal",
        "taluka": "Ralegaon",
        "jurisdiction": "Ward-4"
    },
    "expert_303": {
        "user_id": "expert_303",
        "user_name": "Dr. Sunita Kulkarni (डॉ. सुनिता कुलकर्णी - मुख्य कीटकशास्त्रज्ञ)",
        "role": UserRole.AGRI_EXPERT,
        "institution": "MPKV Rahuri / KVK Yavatmal",
        "specialization": "Entomology & Cotton IPM"
    },
    "lab_404": {
        "user_id": "lab_404",
        "user_name": "MahaAgri Central Diagnostic Lab, Pune (पुणे वनस्पती रोग निदान प्रयोगशाळा)",
        "role": UserRole.DIAGNOSTIC_LAB,
        "lab_code": "MH-LAB-PUNE-01",
        "accreditation": "NABL Accredited Agri-Pathology"
    },
    "admin_505": {
        "user_id": "admin_505",
        "user_name": "Shri. V. K. Jadhav, IAS (विभागीय कृषी संचालक, महाराष्ट्र शासन)",
        "role": UserRole.GOVT_ADMIN,
        "department": "Department of Agriculture, Govt of Maharashtra",
        "clearance": "STATE_ADMIN"
    }
}

def get_current_user_context(x_user_role: Optional[str] = Header(default="FARMER"), x_user_id: Optional[str] = Header(default=None)) -> Dict:
    """Resolve current user context and verify RBAC role"""
    if x_user_id and x_user_id in AUTHENTICATED_USERS:
        return AUTHENTICATED_USERS[x_user_id]
    
    # Match role default
    for user in AUTHENTICATED_USERS.values():
        if user["role"].value == x_user_role:
            return user
            
    # Default fallback to Farmer
    return AUTHENTICATED_USERS["farmer_101"]

def verify_permission(required_permission: str, user_role: UserRole):
    """Enforce permission check"""
    allowed_permissions = ROLE_PERMISSIONS.get(user_role, [])
    if required_permission not in allowed_permissions and user_role != UserRole.GOVT_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: Role '{user_role}' lacks required permission '{required_permission}'"
        )
