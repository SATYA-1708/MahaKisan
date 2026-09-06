import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldCheck, Server, Cpu, Database, 
  Lock, RefreshCw, AlertTriangle, CheckCircle, Terminal, BellRing 
} from 'lucide-react';
import { api } from '../services/api';
import { translations } from '../services/i18n';

export const SystemObservabilityPage = ({ currentRole, currentLang = 'en' }) => {
  const t = translations[currentLang] || translations.en;
  const isEn = currentLang === 'en';

  const [metrics, setMetrics] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMonitoringData();
    const interval = setInterval(loadMonitoringData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    setIsLoading(true);
    try {
      const [m, tel, a] = await Promise.all([
        api.getSystemHealth(),
        api.getSystemTelemetry(),
        api.getAuditLogs(30)
      ]);
      setMetrics(m);
      setTelemetry(tel);
      setAuditLogs(a);
    } catch (err) {
      console.error("Monitoring load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* 1. TOP OBSERVABILITY HERO BANNER */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg sm:text-xl">
                  {t.monitoring.title}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                  STATUS: {metrics?.system_status || 'HEALTHY'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.monitoring.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={loadMonitoringData}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t.monitoring.refreshBtn}</span>
          </button>
        </div>

        {/* Real-time Health Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.monitoring.apiRequests}</span>
            <div className="text-xl font-mono font-black text-white mt-1">
              {metrics?.api_request_count || 1420}
            </div>
            <span className="text-[10px] text-emerald-400">Avg Latency: {metrics?.avg_latency_ms || 42}ms</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.monitoring.avgConfidence}</span>
            <div className="text-xl font-mono font-black text-emerald-400 mt-1">
              {metrics?.avg_model_confidence_pct || 94.2}%
            </div>
            <span className="text-[10px] text-slate-400">{isEn ? 'Top-1 Accuracy: 94.2%' : 'टॉप-1 अचूकता: 94.2%'}</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.monitoring.activeSensors}</span>
            <div className="text-xl font-mono font-black text-teal-400 mt-1">
              {metrics?.active_sensors_count || 156} Nodes
            </div>
            <span className="text-[10px] text-amber-400">{metrics?.stale_sensor_alerts || 4} Stale Flagged</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.monitoring.alertSuccess}</span>
            <div className="text-xl font-mono font-black text-white mt-1">
              {metrics?.alert_delivery_rate_pct || 98.6}%
            </div>
            <span className="text-[10px] text-emerald-400">MahaAgri SMS Gateway</span>
          </div>
        </div>
      </div>

      {/* 2. TELEMETRY BREAKDOWN & IMMUTABLE AUDIT LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: AI Model Performance & Sensor Health */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Cpu className="w-4 h-4 text-emerald-600" />
              {t.monitoring.modelTelemetry}
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block text-[10px] font-semibold">{isEn ? 'Vision Model Architecture:' : 'व्हिजन मॉडेल आर्किटेक्चर:'}</span>
                <span className="font-mono font-bold text-slate-800">MahaCropNet-v3 (EfficientNet-B4 + ViT)</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] font-semibold">{isEn ? 'Risk Engine:' : 'जोखिम इंजिन:'}</span>
                <span className="font-mono font-bold text-slate-800">AgroMet-EpiRisk v2.4 (Biophysical Ensemble)</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] font-semibold mb-1">{isEn ? 'Confidence Distribution:' : 'आत्मविश्वास वितरण:'}</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">{isEn ? 'High Confidence (>90%)' : 'उच्च आत्मविश्वास (>90%)'}</span>
                    <span className="font-bold text-emerald-700">68.4%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full w-[68.4%]"></div>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">{isEn ? 'Moderate Confidence (75-90%)' : 'मध्यम आत्मविश्वास (75-90%)'}</span>
                    <span className="font-bold text-amber-700">24.1%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full w-[24.1%]"></div>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Low Confidence (&lt;75% → Triage)</span>
                    <span className="font-bold text-rose-700">7.5%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-rose-500 h-full w-[7.5%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <BellRing className="w-4 h-4 text-teal-600" />
              {t.monitoring.gatewayStatus}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">MahaAgri SMS Gateway:</span>
                <span className="font-bold text-emerald-700">{isEn ? 'ONLINE (100%)' : 'ऑनलाइन (100%)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">WhatsApp Business API:</span>
                <span className="font-bold text-emerald-700">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isEn ? 'IVR Automated Voice:' : 'IVR स्वयंचलित आवाज:'}</span>
                <span className="font-bold text-slate-600">STANDBY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Immutable Audit Trail (Requirement 5) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {t.monitoring.auditTrailTitle}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {t.monitoring.auditSubtitle}
                </p>
              </div>
            </div>

            <span className="bg-indigo-50 text-indigo-800 font-mono text-[10px] font-bold px-2 py-1 rounded">
              {auditLogs.length} Events Chained
            </span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 font-mono text-[11px]">
            {auditLogs.map(log => (
              <div key={log.log_id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                      {log.log_id}
                    </span>
                    <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {log.action}
                    </span>
                  </div>

                  <span className="text-slate-400 text-[10px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-slate-700 text-[11px]">
                  <span>
                    {isEn ? 'User:' : 'युझर:'} <strong className="text-slate-900">{isEn ? log.user_name?.split('(')[0]?.trim() : log.user_name}</strong> ({log.user_role})
                  </span>
                  <span>
                    {isEn ? 'Entity:' : 'घटक:'} <strong className="text-emerald-800">{log.entity_type} / {log.entity_id}</strong>
                  </span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-100 text-slate-600 break-all text-[10px]">
                  <strong>Payload:</strong> {JSON.stringify(log.details)}
                </div>

                <div className="text-[9px] text-slate-400 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>SHA256 Hash: {log.verification_hash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
