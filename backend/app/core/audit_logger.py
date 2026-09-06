import hashlib
import json
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.models.schemas import AuditLogEntry, UserRole

class AuditLogger:
    _instance = None
    _logs: List[AuditLogEntry] = []

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AuditLogger, cls).__new__(cls)
            cls._instance._init_default_logs()
        return cls._instance

    def _init_default_logs(self):
        # Pre-seed realistic audit events
        self.record(
            user_id="admin_505",
            user_name="Shri. V. K. Jadhav, IAS",
            user_role=UserRole.GOVT_ADMIN,
            action="SYSTEM_INITIALIZE",
            entity_type="SYSTEM",
            entity_id="SYS_MAHA_001",
            details={"event": "Fasal Rakshak Node Activated", "environment": "Production Cluster"}
        )
        self.record(
            user_id="expert_303",
            user_name="Dr. Sunita Kulkarni",
            user_role=UserRole.AGRI_EXPERT,
            action="IPM_DATABASE_CERTIFIED",
            entity_type="IPM",
            entity_id="IPM_CIBRC_2026",
            details={"approved_molecules": 48, "crops_covered": 10, "guidelines": "MPKV Rahuri & CIBRC 2026-27"}
        )
        self.record(
            user_id="ksevak_202",
            user_name="Anil S. Deshmukh",
            user_role=UserRole.KRISHI_SEVAK,
            action="FIELD_TRAP_VERIFIED",
            entity_type="TRAP",
            entity_id="TRP-YVT-08",
            details={"pest": "Pink Bollworm", "count": 14, "etl_breached": True, "taluka": "Ralegaon"}
        )

    def _generate_hash(self, timestamp: str, user_id: str, action: str, entity_id: str, details_str: str) -> str:
        prev_hash = self._logs[-1].verification_hash if self._logs else "GENESIS_BLOCK_MH_AGRI"
        payload = f"{timestamp}|{user_id}|{action}|{entity_id}|{details_str}|{prev_hash}"
        return hashlib.sha256(payload.encode('utf-8')).hexdigest()

    def record(self, user_id: str, user_name: str, user_role: UserRole, action: str, 
               entity_type: str, entity_id: str, details: Dict[str, Any], ip_address: str = "127.0.0.1") -> AuditLogEntry:
        timestamp = datetime.now().isoformat()
        log_id = f"AUD-{int(time.time()*1000)}-{len(self._logs)+1:04d}"
        details_json = json.dumps(details, sort_keys=True)
        verification_hash = self._generate_hash(timestamp, user_id, action, entity_id, details_json)

        entry = AuditLogEntry(
            log_id=log_id,
            timestamp=timestamp,
            user_id=user_id,
            user_name=user_name,
            user_role=user_role,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details,
            ip_address=ip_address,
            verification_hash=verification_hash
        )
        self._logs.append(entry)
        return entry

    def get_logs(self, limit: int = 50, entity_id: Optional[str] = None, role: Optional[str] = None) -> List[AuditLogEntry]:
        filtered = self._logs
        if entity_id:
            filtered = [l for l in filtered if l.entity_id == entity_id]
        if role:
            filtered = [l for l in filtered if l.user_role == role]
        return list(reversed(filtered[-limit:]))

    def count(self) -> int:
        return len(self._logs)

audit_logger = AuditLogger()
