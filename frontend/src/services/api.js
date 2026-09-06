const API_BASE = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api` 
  : '/api';


export const api = {
  // 1. Profiles
  getProfiles: async (role = 'FARMER', userId = 'farmer_101') => {
    const res = await fetch(`${API_BASE}/profiles`, {
      headers: { 'x-user-role': role, 'x-user-id': userId }
    });
    return res.json();
  },

  getProfile: async (farmId, role = 'FARMER', userId = 'farmer_101') => {
    const res = await fetch(`${API_BASE}/profile/${farmId}`, {
      headers: { 'x-user-role': role, 'x-user-id': userId }
    });
    return res.json();
  },

  saveProfile: async (profile, role = 'FARMER', userId = 'farmer_101') => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
        'x-user-id': userId
      },
      body: JSON.stringify(profile)
    });
    return res.json();
  },

  // 2. Data Ingestion
  ingestWeather: async (data, role = 'GOVT_ADMIN', userId = 'admin_505') => {
    const res = await fetch(`${API_BASE}/ingest/weather`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
        'x-user-id': userId
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  ingestSensor: async (data, role = 'GOVT_ADMIN', userId = 'admin_505') => {
    const res = await fetch(`${API_BASE}/ingest/sensor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
        'x-user-id': userId
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  ingestTrap: async (data, role = 'KRISHI_SEVAK', userId = 'ksevak_202') => {
    const res = await fetch(`${API_BASE}/ingest/trap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
        'x-user-id': userId
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getAllTraps: async () => {
    const res = await fetch(`${API_BASE}/ingest/all-traps`);
    return res.json();
  },

  getAllSensors: async () => {
    const res = await fetch(`${API_BASE}/ingest/all-sensors`);
    return res.json();
  },

  // 3. Current Diagnosis (CV)
  diagnoseImage: async (formData, role = 'FARMER', userId = 'farmer_101') => {
    const res = await fetch(`${API_BASE}/diagnose/image`, {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId },
      body: formData
    });
    return res.json();
  },

  // 4. Future Risk Forecast
  forecastRisk: async (district, cropName, farmId, role = 'FARMER', userId = 'farmer_101') => {
    const url = new URL(`${window.location.origin}${API_BASE}/forecast/risk`);
    url.searchParams.append('district', district);
    url.searchParams.append('crop_name', cropName);
    if (farmId) url.searchParams.append('farm_id', farmId);

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId }
    });
    return res.json();
  },

  // 5. IPM
  getIPM: async (pestOrDisease, crop) => {
    const res = await fetch(`${API_BASE}/ipm/lookup?pest_or_disease=${encodeURIComponent(pestOrDisease)}&crop=${encodeURIComponent(crop || '')}`);
    return res.json();
  },

  getAllIPM: async () => {
    const res = await fetch(`${API_BASE}/ipm/all`);
    return res.json();
  },

  // 6. Case Lifecycle
  getCases: async (role = 'FARMER', userId = 'farmer_101') => {
    const res = await fetch(`${API_BASE}/cases`, {
      headers: { 'x-user-role': role, 'x-user-id': userId }
    });
    return res.json();
  },

  createCase: async (formData, role = 'FARMER', userId = 'farmer_101') => {
    const res = await fetch(`${API_BASE}/cases/create`, {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId },
      body: formData
    });
    return res.json();
  },

  startFieldInspection: async (caseId, role = 'KRISHI_SEVAK', userId = 'ksevak_202') => {
    const res = await fetch(`${API_BASE}/cases/${caseId}/field-inspection/start`, {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId }
    });
    return res.json();
  },

  completeFieldInspection: async (caseId, formData, role = 'KRISHI_SEVAK', userId = 'ksevak_202') => {
    const res = await fetch(`${API_BASE}/cases/${caseId}/field-inspection/complete`, {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId },
      body: formData
    });
    return res.json();
  },

  generateLabReferral: async (caseId, formData, role = 'KRISHI_SEVAK', userId = 'ksevak_202') => {
    const res = await fetch(`${API_BASE}/cases/${caseId}/lab-referral`, {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId },
      body: formData
    });
    return res.json();
  },

  checkFollowUpOutcome: async (caseId, formData, role = 'KRISHI_SEVAK', userId = 'ksevak_202') => {
    const res = await fetch(`${API_BASE}/cases/${caseId}/follow-up/check`, {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId },
      body: formData
    });
    return res.json();
  },

  expertTriageCase: async (caseId, formData, role = 'AGRI_EXPERT', userId = 'expert_303') => {
    const res = await fetch(`${API_BASE}/cases/${caseId}/expert-triage`, {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId },
      body: formData
    });
    return res.json();
  },

  getActiveLearningPool: async (role = 'AGRI_EXPERT', userId = 'expert_303') => {
    const res = await fetch(`${API_BASE}/expert/active-learning-pool`, {
      headers: { 'x-user-role': role, 'x-user-id': userId }
    });
    return res.json();
  },

  curateActiveLearningCandidate: async (caseId, status, role = 'AGRI_EXPERT', userId = 'expert_303') => {
    const formData = new FormData();
    formData.append('status', status);
    const res = await fetch(`${API_BASE}/expert/active-learning/${caseId}/curate`, {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId },
      body: formData
    });
    return res.json();
  },

  logTreatment: async (caseId, formData, role = 'FARMER', userId = 'farmer_101') => {
    const res = await fetch(`${API_BASE}/cases/${caseId}/log-treatment`, {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId },
      body: formData
    });
    return res.json();
  },

  getLabSamples: async (role = 'DIAGNOSTIC_LAB', userId = 'lab_404') => {
    const res = await fetch(`${API_BASE}/lab/samples`, {
      headers: { 'x-user-role': role, 'x-user-id': userId }
    });
    return res.json();
  },

  intakeLabSample: async (sampleId, formData, role = 'DIAGNOSTIC_LAB', userId = 'lab_404') => {
    const res = await fetch(`${API_BASE}/lab/samples/${sampleId}/intake`, {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId },
      body: formData
    });
    return res.json();
  },

  recordLabTest: async (sampleId, formData, role = 'DIAGNOSTIC_LAB', userId = 'lab_404') => {
    const res = await fetch(`${API_BASE}/lab/samples/${sampleId}/tests`, {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId },
      body: formData
    });
    return res.json();
  },

  publishLabReport: async (sampleId, formData, role = 'DIAGNOSTIC_LAB', userId = 'lab_404') => {
    const res = await fetch(`${API_BASE}/lab/samples/${sampleId}/publish`, {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId },
      body: formData
    });
    return res.json();
  },

  recollectLabSample: async (sampleId, reason, role = 'DIAGNOSTIC_LAB', userId = 'lab_404') => {
    const formData = new FormData();
    formData.append('reason', reason);
    const res = await fetch(`${API_BASE}/lab/samples/${sampleId}/recollect`, {
      method: 'POST',
      headers: { 'x-user-role': role, 'x-user-id': userId },
      body: formData
    });
    return res.json();
  },

  // 7. Surveillance & GIS
  getHotspots: async () => {
    const res = await fetch(`${API_BASE}/surveillance/hotspots`);
    return res.json();
  },

  getSurveillanceSummary: async () => {
    const res = await fetch(`${API_BASE}/surveillance/summary`);
    return res.json();
  },

  sendBroadcast: async (payload, role = 'GOVT_ADMIN', userId = 'admin_505') => {
    const res = await fetch(`${API_BASE}/surveillance/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
        'x-user-id': userId
      },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  getBroadcasts: async () => {
    const res = await fetch(`${API_BASE}/surveillance/broadcasts`);
    return res.json();
  },

  // 8. Audit Trail
  getAuditLogs: async (limit = 50, entityId = null, role = 'GOVT_ADMIN', userId = 'admin_505') => {
    let url = `${API_BASE}/audit/logs?limit=${limit}`;
    if (entityId) url += `&entity_id=${entityId}`;
    const res = await fetch(url, {
      headers: { 'x-user-role': role, 'x-user-id': userId }
    });
    return res.json();
  },

  // 9. System Observability
  getSystemHealth: async () => {
    const res = await fetch(`${API_BASE}/system/metrics`);
    return res.json();
  },

  getSystemTelemetry: async () => {
    const res = await fetch(`${API_BASE}/system/telemetry`);
    return res.json();
  },

  // 10. Auth Users
  getUsers: async () => {
    const res = await fetch(`${API_BASE}/auth/users`);
    return res.json();
  }
};
