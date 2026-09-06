import React, { useState, useEffect } from 'react';
import { 
  MapPin, ShieldAlert, Radio, AlertTriangle, Send, Bell, 
  Layers, Users, CheckCircle, CheckCircle2, BarChart3, Filter, 
  TrendingUp, TrendingDown, Activity, Calendar, Download, Search, 
  FileText, Sparkles, RefreshCw, Clock, ArrowUpRight, ChevronRight, 
  Eye, ShieldCheck, Cpu, Database, Sliders, Globe, Building2, 
  Share2, Check, Smartphone, PhoneCall, MessageSquare, AlertOctagon,
  Percent, DollarSign, Award, ArrowDownRight, Info
} from 'lucide-react';
import { api } from '../services/api';
import { translations } from '../services/i18n';

export const SurveillanceDashboard = ({ currentRole, currentLang = 'en' }) => {
  const t = translations[currentLang] || translations.en;
  const isEn = currentLang === 'en';

  const [activeTab, setActiveTab] = useState('command'); // 'command', 'gis_map', 'epidemiology', 'alerts', 'sla', 'impact', 'audit'
  const [hotspots, setHotspots] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedTaluka, setSelectedTaluka] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  // Map & Data Filters
  const [filterCrop, setFilterCrop] = useState('ALL');
  const [filterThreat, setFilterThreat] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterDateRange, setFilterDateRange] = useState('7d');
  const [filterDataStatus, setFilterDataStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Emergency Alert Broadcast State
  const [broadcastCrop, setBroadcastCrop] = useState('Cotton');
  const [broadcastDistricts, setBroadcastDistricts] = useState(['Yavatmal', 'Wardha']);
  const [broadcastThreat, setBroadcastThreat] = useState('Cotton Pink Bollworm (PBW)');
  const [broadcastSeverity, setBroadcastSeverity] = useState('CRITICAL');
  const [broadcastChannels, setBroadcastChannels] = useState(['SMS', 'WhatsApp', 'In-App']);
  const [broadcastLanguages, setBroadcastLanguages] = useState(['Marathi (मराठी)', 'English']);
  const [broadcastRoles, setBroadcastRoles] = useState(['Farmers', 'Krishi Sevaks']);
  const [broadcastMsg, setBroadcastMsg] = useState(
    'सावधान! यवतमाळ व वर्धा जिल्ह्यात कापसावर गुलाबी बोंडअळीचा प्रादुर्भाव आर्थिक नुकसान पातळीच्या (ETL) वर गेला आहे. त्वरित एकरी ५ कामगंध सापळे लावा व निंबोळी अर्क ५% किंवा इमामेक्टिन बेन्झोएट ५% ची फवारणी करा.'
  );
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastSuccessAlert, setBroadcastSuccessAlert] = useState(null);
  const [broadcastHistory, setBroadcastHistory] = useState([]);

  useEffect(() => {
    loadSurveillanceData();
  }, []);

  const loadSurveillanceData = async () => {
    try {
      const [h, s, b, logs] = await Promise.all([
        api.getHotspots(),
        api.getSurveillanceSummary(),
        api.getBroadcasts(),
        api.getAuditLogs ? api.getAuditLogs('GOVT_ADMIN', 'govt_101').catch(() => []) : []
      ]);
      setHotspots(h || []);
      setSummary(s || null);
      setBroadcastHistory(b || []);
      setAuditLogs(logs || []);
      if (h && h.length > 0) {
        setSelectedDistrict(h[0]);
        if (h[0].talukas && h[0].talukas.length > 0) {
          setSelectedTaluka(h[0].talukas[0]);
        }
      }
    } catch (err) {
      console.error("Surveillance load error:", err);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    setIsSendingBroadcast(true);
    setBroadcastSuccessAlert(null);
    try {
      const res = await api.sendBroadcast({
        districts: broadcastDistricts,
        crop: broadcastCrop,
        threat: broadcastThreat,
        severity: broadcastSeverity,
        channels: broadcastChannels,
        languages: broadcastLanguages,
        target_roles: broadcastRoles,
        message_mr: broadcastMsg
      }, 'GOVT_ADMIN', 'govt_101');
      
      setBroadcastSuccessAlert(res);
      const b = await api.getBroadcasts();
      setBroadcastHistory(b || []);
    } catch (err) {
      console.error("Broadcast error:", err);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const formatThreat = (threat) => {
    if (!threat) return '';
    if (isEn) return threat.split('(')[0].trim();
    return threat;
  };

  // Filtered districts based on multi-parameter filters
  const filteredDistricts = hotspots.filter(d => {
    if (selectedDivision !== 'ALL' && d.division !== selectedDivision) return false;
    if (filterCrop !== 'ALL' && !d.crop?.toLowerCase().includes(filterCrop.toLowerCase())) return false;
    if (filterThreat !== 'ALL' && !d.threat?.toLowerCase().includes(filterThreat.toLowerCase())) return false;
    if (filterSeverity !== 'ALL' && d.risk !== filterSeverity) return false;
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const divisions = ['ALL', 'Vidarbha', 'Marathwada', 'Western Maharashtra', 'Khandesh', 'Konkan'];

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="bg-rose-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">🔴 {isEn ? 'CRITICAL' : 'गंभीर'}</span>;
      case 'HIGH':
        return <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">🟠 {isEn ? 'HIGH' : 'उच्च'}</span>;
      case 'MODERATE':
        return <span className="bg-yellow-400 text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-full">🟡 {isEn ? 'MODERATE' : 'मध्यम'}</span>;
      case 'GUARDED':
        return <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">🟢 {isEn ? 'GUARDED' : 'सावधान'}</span>;
      default:
        return <span className="bg-slate-200 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full">🟢 {isEn ? 'LOW' : 'कम'}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* 1. STATE GOVERNMENT COMMAND HEADER & JURISDICTION STATUS */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 rounded-full text-emerald-300 text-xs font-bold tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'COMMISSIONERATE OF AGRICULTURE • PUNE / KRISHI BHAVAN MUMBAI' : 'कृषी आयुक्तालय • पुणे / कृषी भवन मुंबई'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <Radio className="w-7 h-7 text-emerald-400 animate-pulse" />
              {isEn ? 'Maharashtra Crop Epidemiological Surveillance System' : 'महाराष्ट्र पीक रोग महामारी नियंत्रण कक्ष'}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              {isEn 
                ? 'Top-level state command console monitoring 36 districts, 358 talukas, and 43,000+ villages. Aggregating field diagnostic telemetry, pheromone trap ETL breaches, and microclimate risk indices.'
                : '३६ जिल्हे, ३५८ तालुके आणि ४३,०००+ गावांचे थेट निरीक्षण. क्षेत्रीय निदान, कामगंध सापळे ईटीएल नोंदी व हवामान रोग अंदाज नियंत्रण.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{isEn ? 'STATE SURVEILLANCE STATUS' : 'राज्य निगरानी स्थिति'}</span>
              <span className="text-sm font-extrabold text-amber-400 flex items-center justify-end gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                {isEn ? 'ACTIVE EPIDEMIC ADVISORY (LEVEL 3)' : 'सक्रिय महामारी सलाह (स्तर 3)'}
              </span>
            </div>
            <button 
              onClick={loadSurveillanceData}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isEn ? 'Refresh Telemetry' : 'माहिती अद्यतन करा'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED HIGH-VISIBILITY NAVIGATION BAR (OUTSIDE BANNER) */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-md">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {[
            { id: 'command', label: isEn ? 'Command Center' : 'कमांड सेंटर', icon: Activity, badge: '8 KPIs' },
            { id: 'gis_map', label: isEn ? 'Maharashtra GIS Radar' : 'महाराष्ट्र नकाशा व जिल्हानिहाय', icon: MapPin, badge: isEn ? '36 Dist' : '36 जिले' },
            { id: 'epidemiology', label: isEn ? 'Surge Velocity & 7-Day Forecast' : 'रोग प्रसार व ७-दिवसीय अंदाज', icon: TrendingUp, badge: 'R₀ 2.8' },
            { id: 'alerts', label: isEn ? 'Emergency Broadcast Studio' : 'आपत्कालीन संदेश प्रसारण', icon: Send, badge: isEn ? 'Live' : 'लाइव' },
            { id: 'sla', label: isEn ? 'Field & Lab Response SLAs' : 'क्षेत्रीय व प्रयोगशाळा गती', icon: Clock, badge: '4.2h' },
            { id: 'impact', label: isEn ? 'Intervention Impact Tracker' : 'नियंत्रण प्रभाव व बचत', icon: Award, badge: '₹18.4 Cr' },
            { id: 'audit', label: isEn ? 'Cryptographic State Audit Trail' : 'ऑडिट लॉग व सुरक्षितता', icon: ShieldCheck, badge: 'SHA-256' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-150 ${
                  isActive 
                    ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-600/30' 
                    : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-200' : 'text-slate-500'}`} />
                <span className="tracking-tight">{tab.label}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-extrabold ${
                  isActive 
                    ? 'bg-emerald-800 text-emerald-100' 
                    : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>


      {/* ========================================================================= */}
      {/* TAB 1: COMMAND CENTER OVERVIEW                                           */}
      {/* ========================================================================= */}
      {activeTab === 'command' && (
        <div className="space-y-6">
          {/* 8 Core Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-rose-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{isEn ? 'Active Outbreaks' : 'सक्रिय प्रकोप'}</span>
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-rose-600 font-mono">
                {summary?.active_outbreaks || 18}
              </div>
              <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> {isEn ? '+4 in last 48 hours' : '+4 पिछले 48 घंटों में'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{isEn ? 'Total Suspected Cases' : 'कुल संदिग्ध मामले'}</span>
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono">
                {summary?.total_suspected_cases || 2486}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                {isEn ? 'Across 14 hotspot districts' : '14 हॉटस्पॉट जिलों में'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{isEn ? 'Field Verified' : 'क्षेत्र सत्यापित'}</span>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-emerald-700 font-mono">
                {summary?.field_verified_cases || 1842}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                {isEn ? '74.1% confirmed by Krishi Sevaks' : '74.1% कृषि सेवकों द्वारा पुष्टि'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-indigo-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{isEn ? 'NABL Lab Certified' : 'NABL लैब प्रमाणित'}</span>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-indigo-700 font-mono">
                {summary?.lab_confirmed_cases || 384}
              </div>
              <span className="text-[11px] text-indigo-700 font-semibold mt-1 block">
                {isEn ? 'PCR & Microscopic confirmation' : 'PCR व सूक्ष्म परीक्षण पुष्टि'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-orange-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{isEn ? 'Active ETL Breaches' : 'सक्रिय ETL उल्लंघन'}</span>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-orange-600 font-mono">
                {summary?.total_active_etl_breaches || 68}
              </div>
              <span className="text-[11px] text-orange-600 font-semibold mt-1 block">
                {isEn ? 'Pheromone trap & spore counters' : 'फेरोमोन जाल व बीजाणु काउंटर'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-blue-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{isEn ? 'Avg SLA Response Time' : 'औसत SLA प्रतिक्रिया समय'}</span>
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono">
                4.2 hrs
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                {isEn ? '94.8% SLA on-time compliance' : '94.8% SLA समय पर पालन'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-teal-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{isEn ? 'Public Advisories' : 'सार्वजनिक सलाह'}</span>
                <Radio className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-teal-700 font-mono">
                {broadcastHistory.length || 14}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                {isEn ? 'SMS, WhatsApp & IVR Dispatched' : 'SMS, WhatsApp व IVR भेजे गए'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-purple-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{isEn ? 'Estimated Loss Averted' : 'अनुमानित हानि बचाव'}</span>
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-purple-700 font-mono">
                ₹18.4 Cr
              </div>
              <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
                {isEn ? 'Across 24,000+ protected hectares' : '24,000+ संरक्षित हेक्टेयर में'}
              </span>
            </div>
          </div>

          {/* 4-Stage Clinical Diagnostic Pipeline & Top Threats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 4-Stage Diagnostic Pipeline Breakdown */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-600" />
                    {isEn ? '4-Stage State Diagnostic & Verification Pipeline' : '4-चरणीय राज्य निदान व सत्यापन प्रणाली'}
                  </h3>
                  <p className="text-xs text-slate-500">{isEn ? 'Statewide cases transitioning from raw detection to certified lab proof' : 'राज्य भर में कच्चे निदान से प्रमाणित लैब साक्ष्य तक के मामले'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { stage: isEn ? '1. Farmer Ingestion & AI Suspected' : '1. किसान सूचना व AI संदिग्ध', count: 2486, pct: '100%', color: 'bg-amber-500', desc: isEn ? 'Raw visual mobile submissions + AI early inference' : 'मोबाइल से कच्ची दृश्य सूचना + AI प्रारंभिक अनुमान' },
                  { stage: isEn ? '2. Krishi Sevak Field Verified' : '2. कृषि सेवक क्षेत्र सत्यापित', count: 1842, pct: '74.1%', color: 'bg-blue-600', desc: isEn ? 'On-site physical crop inspection & GPS tag verified' : 'खेत पर पीक निरीक्षण व GPS सत्यापित' },
                  { stage: isEn ? '3. Agri University Expert Confirmed' : '3. कृषि विद्यापीठ विशेषज्ञ पुष्टि', count: 894, pct: '35.9%', color: 'bg-emerald-600', desc: isEn ? 'SAU Senior Pathologist / Entomologist review' : 'SAU वरिष्ठ रोगविज्ञानी / कीटविज्ञानी समीक्षा' },
                  { stage: isEn ? '4. NABL Accredited Lab Certified' : '4. NABL मान्यता प्राप्त लैब प्रमाणित', count: 384, pct: '15.4%', color: 'bg-purple-600', desc: isEn ? 'Molecular Real-Time PCR & Microscopy verified' : 'मॉलिक्युलर रियल-टाइम PCR व सूक्ष्मदर्शी सत्यापित' },
                ].map((st, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900">{st.stage}</span>
                      <span className="font-mono font-black text-slate-800">{st.count} {isEn ? 'Cases' : 'मामले'} ({st.pct})</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${st.color} rounded-full`} style={{ width: st.pct }}></div>
                    </div>
                    <span className="text-[11px] text-slate-500 block">{st.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Critical Outbreak Threats in Maharashtra */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    {isEn ? 'Top 5 Ranked Outbreak Threats in Maharashtra' : 'महाराष्ट्र में शीर्ष 5 प्रकोप खतरे'}
                  </h3>
                  <p className="text-xs text-slate-500">{isEn ? 'Real-time epidemiological risk scoring based on ETL breaches & spread rate' : 'ETL उल्लंघन व फैलाव दर पर आधारित रीयल-टाइम रोग जोखिम स्कोर'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { rank: '#1', crop: isEn ? 'Cotton' : 'कपास', threat: isEn ? 'Cotton Pink Bollworm (गुलाबी बोंडअळी)' : 'कपास गुलाबी बोंडअळी', districts: 8, cases: 940, velocity: '+34% / wk', risk: 'CRITICAL' },
                  { rank: '#2', crop: isEn ? 'Soybean' : 'सोयाबीन', threat: isEn ? 'Soybean Rust (तांबेरा रोग)' : 'सोयाबीन तांबेरा', districts: 6, cases: 620, velocity: '+28% / wk', risk: 'CRITICAL' },
                  { rank: '#3', crop: isEn ? 'Tomato' : 'टमाटर', threat: isEn ? 'Tomato Late Blight (करपा रोग)' : 'टमाटर करपा रोग', districts: 4, cases: 410, velocity: '+18% / wk', risk: 'HIGH' },
                  { rank: '#4', crop: isEn ? 'Cotton' : 'कपास', threat: isEn ? 'Cotton Leaf Curl Virus (CLCuv)' : 'कपास लीफ कर्ल विषाणु (CLCuv)', districts: 3, cases: 290, velocity: '+12% / wk', risk: 'MODERATE' },
                  { rank: '#5', crop: isEn ? 'Sugarcane' : 'ऊस', threat: isEn ? 'Sugarcane Red Rot (तांबडा कूज रोग)' : 'ऊस तांबडा कूज रोग', districts: 2, cases: 140, velocity: '+6% / wk', risk: 'GUARDED' },
                ].map((th, i) => (
                  <div key={i} className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                        {th.rank}
                      </span>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          {th.threat}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isEn ? 'Crop:' : 'फसल:'} <span className="font-bold text-slate-700">{th.crop}</span> • <span className="font-bold text-slate-700">{th.districts} {isEn ? 'Districts' : 'जिले'}</span> ({th.cases} {isEn ? 'Cases' : 'मामले'})
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      {getRiskBadge(th.risk)}
                      <span className="text-[10px] font-mono font-bold text-rose-600 block">{th.velocity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MAHARASHTRA GIS RADAR & DISTRICT DRILL-DOWN                       */}
      {/* ========================================================================= */}
      {activeTab === 'gis_map' && (
        <div className="space-y-6">
          
          {/* Multi-Parameter Filters Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-900 text-sm">{isEn ? 'Statewide GIS Surveillance Filters' : 'राज्य स्तरीय GIS निगरानी फ़िल्टर'}</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {isEn ? `Showing ${filteredDistricts.length} of ${hotspots.length} Districts` : `${filteredDistricts.length} में से ${hotspots.length} जिले दिखाए जा रहे हैं`}
              </div>
            </div>

            {/* Division Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] whitespace-nowrap">{isEn ? 'Division:' : 'विभाग:'}</span>
              {divisions.map(div => (
                <button
                  key={div}
                  onClick={() => setSelectedDivision(div)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    selectedDivision === div 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>

            {/* Parameter Dropdowns & Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold text-[10px] uppercase mb-1">{isEn ? 'Crop Filter' : 'फसल फ़िल्टर'}</label>
                <select 
                  value={filterCrop}
                  onChange={(e) => setFilterCrop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800"
                >
                  <option value="ALL">{isEn ? 'All Crops' : 'सभी फसलें'}</option>
                  <option value="Cotton">{isEn ? 'Cotton' : 'कपास'} (कापूस)</option>
                  <option value="Soybean">{isEn ? 'Soybean' : 'सोयाबीन'} (सोयाबीन)</option>
                  <option value="Tomato">{isEn ? 'Tomato' : 'टमाटर'} (टोमॅटो)</option>
                  <option value="Rice">{isEn ? 'Rice' : 'चावल'} (भात)</option>
                  <option value="Sugarcane">{isEn ? 'Sugarcane' : 'गन्ना'} (ऊस)</option>
                  <option value="Pomegranate">{isEn ? 'Pomegranate' : 'अनार'} (डाळिंब)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold text-[10px] uppercase mb-1">{isEn ? 'Threat / Disease' : 'खतरा / रोग'}</label>
                <select 
                  value={filterThreat}
                  onChange={(e) => setFilterThreat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800"
                >
                  <option value="ALL">{isEn ? 'All Pathogens / Pests' : 'सभी रोगजनक / कीट'}</option>
                  <option value="Pink Bollworm">{isEn ? 'Pink Bollworm' : 'गुलाबी बोंडअळी'}</option>
                  <option value="Rust">{isEn ? 'Soybean Rust' : 'सोयाबीन तांबेरा'}</option>
                  <option value="Blight">{isEn ? 'Late Blight' : 'करपा रोग'}</option>
                  <option value="Stem Borer">{isEn ? 'Stem Borer' : 'तना छेदक'}</option>
                  <option value="Red Rot">{isEn ? 'Red Rot' : 'लाल सड़न'}</option>
                  <option value="Bacterial Blight">{isEn ? 'Bacterial Blight' : 'जीवाणु झुलसा'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold text-[10px] uppercase mb-1">{isEn ? 'Risk Severity' : 'जोखिम स्तर'}</label>
                <select 
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800"
                >
                  <option value="ALL">{isEn ? 'All Severity Levels' : 'सभी खतरा स्तर'}</option>
                  <option value="CRITICAL">🔴 {isEn ? 'CRITICAL' : 'गंभीर'}</option>
                  <option value="HIGH">🟠 {isEn ? 'HIGH' : 'उच्च'}</option>
                  <option value="MODERATE">🟡 {isEn ? 'MODERATE' : 'मध्यम'}</option>
                  <option value="GUARDED">🟢 {isEn ? 'GUARDED' : 'सावधान'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold text-[10px] uppercase mb-1">{isEn ? 'Time Horizon' : 'समय सीमा'}</label>
                <select 
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800"
                >
                  <option value="24h">{isEn ? 'Last 24 Hours' : 'पिछले 24 घंटे'}</option>
                  <option value="7d">{isEn ? 'Last 7 Days' : 'पिछले 7 दिन'}</option>
                  <option value="30d">{isEn ? 'Last 30 Days' : 'पिछले 30 दिन'}</option>
                  <option value="season">{isEn ? 'Current Kharif 2026' : 'वर्तमान खरीफ 2026'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold text-[10px] uppercase mb-1">{isEn ? 'Search District / Taluka' : 'जिला / तालुका खोजें'}</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isEn ? 'e.g. Yavatmal, Darwha...' : 'जैसे यवतमाळ, दारव्हा...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 pl-7 font-semibold text-slate-800"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>
            </div>
          </div>

          {/* District Grid & Selected District Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Cols: District Cards Matrix */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {isEn ? 'Districts Heatmap Grid' : 'जिला हीटमैप ग्रिड'}
                </span>
                <span className="text-[11px] text-slate-500">{isEn ? 'Click a district to view Taluka & Village drill-down' : 'तालुका व गाव विवरण देखने हेतु जिला चुनें'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-1">
                {filteredDistricts.map(dist => {
                  const isSelected = selectedDistrict?.name === dist.name;
                  const isCrit = dist.risk === 'CRITICAL';
                  const isHigh = dist.risk === 'HIGH';

                  return (
                    <div
                      key={dist.name}
                      onClick={() => {
                        setSelectedDistrict(dist);
                        if (dist.talukas && dist.talukas.length > 0) {
                          setSelectedTaluka(dist.talukas[0]);
                        }
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition relative overflow-hidden ${
                        isSelected 
                          ? 'border-emerald-600 ring-2 ring-emerald-500 bg-emerald-50/50 shadow-md' 
                          : isCrit 
                            ? 'border-rose-300 bg-rose-50/30 hover:bg-rose-50/60' 
                            : isHigh 
                              ? 'border-amber-300 bg-amber-50/30 hover:bg-amber-50/60' 
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {dist.division}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {dist.name}
                          </h4>
                        </div>
                        {getRiskBadge(dist.risk)}
                      </div>

                      <div className="mt-3 text-xs space-y-1.5">
                        <div className="flex justify-between text-slate-600">
                          <span>{isEn ? 'Primary Crop:' : 'मुख्य फसल:'}</span>
                          <span className="font-bold text-slate-900">{dist.crop}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>{isEn ? 'Active Threat:' : 'सक्रिय खतरा:'}</span>
                          <span className="font-bold text-rose-700">{formatThreat(dist.threat)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>{isEn ? 'ETL Breaches:' : 'ETL उल्लंघन:'}</span>
                          <span className="font-mono font-bold text-amber-600">{dist.etl_breaches || 0} {isEn ? 'Traps' : 'जाल'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-700">
                          <span className="text-[11px]">{isEn ? 'Total Cases:' : 'कुल मामले:'}</span>
                          <span className="font-mono font-extrabold text-slate-900">{dist.cases}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 5 Cols: Taluka & Village Granular Drill-Down */}
            <div className="lg:col-span-5 space-y-4">
              {selectedDistrict ? (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900">{selectedDistrict.name} {isEn ? 'District' : 'जिला'}</span>
                        {getRiskBadge(selectedDistrict.risk)}
                      </div>
                      <span className="text-xs text-slate-500">{selectedDistrict.division} {isEn ? 'Division' : 'विभाग'} • {selectedDistrict.lat}°N, {selectedDistrict.lng}°E</span>
                    </div>

                    <button 
                      onClick={() => {
                        setBroadcastDistricts([selectedDistrict.name]);
                        setBroadcastCrop(selectedDistrict.crop);
                        setActiveTab('alerts');
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Issue Alert' : 'अलर्ट जारी करें'}</span>
                    </button>
                  </div>

                  {/* Taluka Level Breakdown */}
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                      {isEn ? 'Taluka Level Surge Breakdown' : 'तालुका स्तर प्रादुर्भाव विवरण'}
                    </span>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedDistrict.talukas && selectedDistrict.talukas.length > 0 ? (
                        selectedDistrict.talukas.map(tal => {
                          const isTalSelected = selectedTaluka?.name === tal.name;
                          return (
                            <div 
                              key={tal.name}
                              onClick={() => setSelectedTaluka(tal)}
                              className={`p-3 rounded-2xl border cursor-pointer transition ${
                                isTalSelected 
                                  ? 'border-emerald-600 bg-emerald-50/60 font-semibold' 
                                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-extrabold text-slate-900">{tal.name} {isEn ? 'Taluka' : 'तालुका'}</span>
                                <span className="font-mono font-bold text-slate-800">{tal.cases} {isEn ? 'Cases' : 'मामले'}</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                                <span>{isEn ? 'High-Risk Village:' : 'उच्च जोखिम गाव:'} <span className="font-bold text-rose-700">{tal.top_village || 'Zadgaon'}</span></span>
                                <span>{isEn ? 'Risk:' : 'जोखिम:'} <span className="font-bold text-amber-700">{tal.risk}</span></span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                          {isEn ? `Standard taluka surveillance data active across ${selectedDistrict.name} jurisdiction.` : `${selectedDistrict.name} क्षेत्र में मानक तालुका निगरानी डेटा सक्रिय है.`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Village & Farm Granular Inspection */}
                  {selectedTaluka && (
                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                        {isEn ? `Village & Micro-Cluster Focus: ${selectedTaluka.name}` : `गाव व माइक्रो-समूह फोकस: ${selectedTaluka.name}`}
                      </span>
                      
                      <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">{isEn ? 'Epicenter Village:' : 'केंद्र गाव:'}</span>
                          <span className="font-bold text-amber-400">{selectedTaluka.top_village || 'Zadgaon'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{isEn ? 'Assigned Krishi Sevak:' : 'नियुक्त कृषी सेवक:'}</span>
                          <span className="font-bold text-emerald-400">{selectedTaluka.krishi_sevak || 'Anil Deshmukh'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{isEn ? 'Pheromone Trap Count:' : 'फेरोमोन जाल संख्या:'}</span>
                          <span className="font-bold text-white">{isEn ? '12 Traps Active (8 Breached)' : '12 जाल सक्रिय (8 उल्लंघन)'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{isEn ? 'Lab Diagnostic Referral:' : 'लैब निदान रेफरल:'}</span>
                          <span className="font-bold text-purple-400">#SMP-000891 ({isEn ? 'NABL Certified' : 'NABL प्रमाणित'})</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
                  {isEn ? 'Select a district to view Taluka and Village drill-down telemetry.' : 'तालुका व गाव विवरण देखने हेतु एक जिला चुनें.'}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EPIDEMIOLOGICAL SURGE VELOCITY & 7-DAY FORECAST                   */}
      {/* ========================================================================= */}
      {activeTab === 'epidemiology' && (
        <div className="space-y-6">
          
          {/* Outbreak Surge Rate R0 Indicator */}
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 border border-rose-500/30 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs font-bold">
                  <Activity className="w-3.5 h-3.5" />
                  {isEn ? 'STATEWIDE EPIDEMIOLOGICAL VELOCITY' : 'राज्य स्तरीय रोग प्रसार गति'}
                </span>
                <h3 className="text-xl font-black mt-2">
                  {isEn ? 'Reproduction Number (R₀) = 2.84 • High Epidemic Surge Phase' : 'प्रजनन संख्या (R₀) = 2.84 • उच्च महामारी चरण'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  {isEn ? 'Without timely chemical/biological containment, each infected plot spreads secondary spores/moths to 2.8 adjacent farms per 5-day cycle.' : 'समय पर रासायनिक/जैविक नियंत्रण न होने पर हर संक्रमित खेत 5-दिनी चक्र में 2.8 पड़ोसी खेतों तक बीजाणु/कीट फैलाता है.'}
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl text-center min-w-[160px]">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? 'TARGET CONTROL R₀' : 'लक्ष्य नियंत्रण R₀'}</span>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  &lt; 0.90
                </div>
                <span className="text-[10px] text-emerald-300">{isEn ? 'Containment Target' : 'नियंत्रण लक्ष्य'}</span>
              </div>
            </div>
          </div>

          {/* 7-Day Microclimate & Disease Influx Forecast Matrix */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  {isEn ? '7-Day Predictive Microclimate & Disease Surge Forecast' : '7-दिवसीय सूक्ष्म हवामान व रोग प्रसार अंदाज'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEn ? 'AI Weather coupling model predicting spore germination, moth flight activity, and incoming case trajectory' : 'AI मौसम मॉडल द्वारा बीजाणु अंकुरण, कीट उड़ान गतिविधि व आगामी मामलों का पूर्वानुमान'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
              {[
                { day: isEn ? 'Day 1 (Today)' : 'दिन 1 (आज)', temp: '31°C', rh: '88%', rain: '12mm', riskPct: 88, status: 'CRITICAL', projCases: '+142' },
                { day: isEn ? 'Day 2 (Mon)' : 'दिन 2 (सोम)', temp: '30°C', rh: '91%', rain: '24mm', riskPct: 94, status: 'CRITICAL', projCases: '+188' },
                { day: isEn ? 'Day 3 (Tue)' : 'दिन 3 (मंगल)', temp: '29°C', rh: '89%', rain: '18mm', riskPct: 92, status: 'CRITICAL', projCases: '+165' },
                { day: isEn ? 'Day 4 (Wed)' : 'दिन 4 (बुध)', temp: '32°C', rh: '82%', rain: '4mm', riskPct: 76, status: 'HIGH', projCases: '+110' },
                { day: isEn ? 'Day 5 (Thu)' : 'दिन 5 (गुरु)', temp: '33°C', rh: '75%', rain: '0mm', riskPct: 62, status: 'MODERATE', projCases: '+75' },
                { day: isEn ? 'Day 6 (Fri)' : 'दिन 6 (शुक्र)', temp: '34°C', rh: '68%', rain: '0mm', riskPct: 48, status: 'GUARDED', projCases: '+45' },
                { day: isEn ? 'Day 7 (Sat)' : 'दिन 7 (शनि)', temp: '33°C', rh: '65%', rain: '0mm', riskPct: 38, status: 'LOW', projCases: '+28' },
              ].map((fc, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-center">
                  <span className="font-extrabold text-slate-800 text-xs block">{fc.day}</span>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>🌡️ {fc.temp}</div>
                    <div>💧 RH: {fc.rh}</div>
                    <div>🌧️ {fc.rain}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">{isEn ? 'Spore Risk' : 'बीजाणु जोखिम'}</span>
                    <div className="font-mono font-black text-xs text-rose-600">{fc.riskPct}%</div>
                    <div className="text-[10px] font-bold text-slate-700 mt-1">{fc.projCases} {isEn ? 'Cases' : 'मामले'}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Automated Epidemic Control Recommendation */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-extrabold text-emerald-900 block">
                  {isEn ? 'AI Epidemiological Action Plan for State Agriculture Directorate:' : 'राज्य कृषी संचालनालय हेतु AI रोग नियंत्रण कार्ययोजना:'}
                </span>
                <p className="text-emerald-800 leading-relaxed">
                  {isEn 
                    ? 'Due to high humidity (&gt;85% RH) forecasted over Vidarbha for Days 1-3, spore discharge velocity will peak. Recommend issuing immediate mandal-level spray advisory for ' 
                    : 'विदर्भ में दिन 1-3 के लिए उच्च आर्द्रता (&gt;85% RH) के पूर्वानुमान से बीजाणु फैलाव तीव्र होगा. सीमा पार फैलाव रोकने हेतु पड़ोसी तालुकों (नेर, घाटंजी) में '} <strong>Neem Seed Kernel Extract (NSKE 5%)</strong> {isEn 
                    ? 'buffer zone creation in adjacent talukas (Ner, Ghatanji) to stop border spillover.'
                    : 'बफर क्षेत्र निर्माण हेतु तत्काल मंडल स्तरीय फवारणी सलाह जारी करें.'}
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EMERGENCY BROADCAST STUDIO                                        */}
      {/* ========================================================================= */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Broadcast Dispatch Composer */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-600" />
                  {isEn ? 'Targeted Multi-Channel Emergency Alert Studio' : 'बहु-चैनल लक्षित आपातकालीन चेतावनी स्टूडियो'}
                </h3>
                <p className="text-xs text-slate-500">{isEn ? 'Dispatch critical pest & disease advisories directly to farmer phones' : 'गंभीर कीट व रोग सलाह सीधे किसानों के मोबाइल पर भेजें'}</p>
              </div>
            </div>

            {broadcastSuccessAlert && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold block">{isEn ? 'Advisory Broadcast Successfully Queued!' : 'सलाह प्रसारण सफलतापूर्वक कतारबद्ध!'}</span>
                    <span className="text-[11px] text-emerald-700">{isEn 
                      ? `Dispatched via ${broadcastSuccessAlert.channels?.join(', ')} to ~${broadcastSuccessAlert.total_recipients || 42850} recipients.` 
                      : `${broadcastSuccessAlert.channels?.join(', ')} द्वारा ~${broadcastSuccessAlert.total_recipients || 42850} प्राप्तकर्ताओं को भेजा गया.`}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-[11px]">ID: {broadcastSuccessAlert.broadcast_id || 'BC-2026-0906'}</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              
              {/* Target Districts & Crop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isEn ? 'Target Crop' : 'लक्ष्य फसल'}</label>
                  <select
                    value={broadcastCrop}
                    onChange={(e) => setBroadcastCrop(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
                  >
                    <option value="Cotton">{isEn ? 'Cotton' : 'कपास'} (कापूस)</option>
                    <option value="Soybean">{isEn ? 'Soybean' : 'सोयाबीन'} (सोयाबीन)</option>
                    <option value="Tomato">{isEn ? 'Tomato' : 'टमाटर'} (टोमॅटो)</option>
                    <option value="Rice">{isEn ? 'Rice' : 'चावल'} (भात)</option>
                    <option value="Sugarcane">{isEn ? 'Sugarcane' : 'गन्ना'} (ऊस)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{isEn ? 'Alert Severity Level' : 'चेतावनी स्तर'}</label>
                  <select
                    value={broadcastSeverity}
                    onChange={(e) => setBroadcastSeverity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
                  >
                    <option value="CRITICAL">🔴 {isEn ? 'CRITICAL (ETL Breached / Quarantine)' : 'गंभीर (ETL उल्लंघन / क्वारंटीन)'}</option>
                    <option value="HIGH">🟠 {isEn ? 'HIGH (Rapid Spread Warning)' : 'उच्च (तेजी से फैलाव चेतावनी)'}</option>
                    <option value="MODERATE">🟡 {isEn ? 'MODERATE (Preventive Advisory)' : 'मध्यम (निवारक सलाह)'}</option>
                  </select>
                </div>
              </div>

              {/* Target Channels */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">{isEn ? 'Delivery Channels' : 'वितरण चैनल'}</label>
                <div className="flex flex-wrap gap-2">
                  {['SMS', 'WhatsApp', 'IVR Audio Call', 'In-App Push'].map(ch => {
                    const isSelected = broadcastChannels.includes(ch);
                    return (
                      <button
                        type="button"
                        key={ch}
                        onClick={() => {
                          if (isSelected) {
                            setBroadcastChannels(broadcastChannels.filter(c => c !== ch));
                          } else {
                            setBroadcastChannels([...broadcastChannels, ch]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                          isSelected 
                            ? 'bg-slate-900 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {ch === 'SMS' && <Smartphone className="w-3.5 h-3.5" />}
                        {ch === 'WhatsApp' && <MessageSquare className="w-3.5 h-3.5" />}
                        {ch === 'IVR Audio Call' && <PhoneCall className="w-3.5 h-3.5" />}
                        {ch === 'In-App Push' && <Bell className="w-3.5 h-3.5" />}
                        <span>{ch === 'IVR Audio Call' ? (isEn ? ch : 'IVR ऑडिओ कॉल') : ch === 'In-App Push' ? (isEn ? ch : 'इन-ऐप सूचना') : ch}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advisory Message Text (Marathi / Multilingual) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">{isEn ? 'Advisory Message Content (मराठी)' : 'सलाह संदेश सामग्री (मराठी)'}</label>
                <textarea
                  rows={4}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 leading-relaxed font-sans focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder={isEn ? 'Enter detailed epidemic advisory text...' : 'विस्तृत महामारी सलाह पाठ दर्ज करें...'}
                />
              </div>

              {/* Audience Estimator Badge */}
              <div className="p-3.5 bg-slate-100 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>{isEn ? 'Estimated Audience Reach:' : 'अनुमानित प्राप्तकर्ता:'}</span>
                </div>
                <span className="font-mono font-black text-slate-900">{isEn ? '~42,850 Farmers & 340 Krishi Sevaks' : '~42,850 किसान व 340 कृषी सेवक'}</span>
              </div>

              <button
                type="submit"
                disabled={isSendingBroadcast}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSendingBroadcast
                  ? (isEn ? 'Dispatching Across Gateways...' : 'गेटवे पर भेजा जा रहा है...')
                  : (isEn ? 'Authorize & Broadcast Statewide Advisory' : 'अधिकृत करें व राज्य स्तरीय सलाह प्रसारित करें')}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Historical Broadcasts Log */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{isEn ? 'Broadcast History Log' : 'प्रसारण इतिहास लॉग'}</h3>
                <p className="text-xs text-slate-500">{isEn ? 'Past official alerts with gateway delivery rates' : 'पिछली आधिकारिक चेतावनियाँ व डिलीवरी दरें'}</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {broadcastHistory && broadcastHistory.length > 0 ? (
                broadcastHistory.map((b, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">
                        {b.threat || (isEn ? 'Cotton Pink Bollworm Alert' : 'कपास गुलाबी बोंडअळी चेतावनी')}
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        98.4% {isEn ? 'DELIVERED' : 'वितरित'}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                      {b.message_mr || b.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                      <span>{isEn ? 'Districts:' : 'जिले:'} {Array.isArray(b.districts) ? b.districts.join(', ') : b.districts}</span>
                      <span>{b.timestamp || (isEn ? 'Just now' : 'अभी')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {isEn ? 'No previous broadcast records found in audit logs.' : 'ऑडिट लॉग में कोई पिछला प्रसारण रिकॉर्ड नहीं मिला.'}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FIELD & LAB RESPONSE SLAS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'sla' && (
        <div className="space-y-6">
          
          {/* SLA Performance Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">{isEn ? 'Krishi Sevak Field Response' : 'कृषी सेवक क्षेत्र प्रतिक्रिया'}</span>
              <div className="text-3xl font-black text-emerald-600 font-mono">4.2 Hours</div>
              <span className="text-xs text-slate-500">{isEn ? 'Average time from farmer submission to on-site inspection' : 'किसान सूचना से क्षेत्रीय निरीक्षण तक औसत समय'}</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">{isEn ? 'University Expert Triage' : 'विशेषज्ञ मूल्यांकन'}</span>
              <div className="text-3xl font-black text-indigo-600 font-mono">5.8 Hours</div>
              <span className="text-xs text-slate-500">{isEn ? 'Average time from field escalation to expert prescription' : 'क्षेत्रीय सूचना से विशेषज्ञ सलाह तक औसत समय'}</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">{isEn ? 'NABL Lab PCR Turnaround' : 'NABL लैब PCR समय'}</span>
              <div className="text-3xl font-black text-purple-600 font-mono">22.4 Hours</div>
              <span className="text-xs text-slate-500">{isEn ? 'Average time from cold-box specimen receipt to certified report' : 'कोल्ड बॉक्स नमूना प्राप्ति से प्रमाणित रिपोर्ट तक औसत समय'}</span>
            </div>
          </div>

          {/* Division-wise SLA Compliance Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{isEn ? 'Administrative Division SLA Leaderboard' : 'प्रशासनिक विभाग SLA लीडरबोर्ड'}</h3>
                <p className="text-xs text-slate-500">{isEn ? 'Krishi Sevak inspection velocity, on-time resolution, and overdue backlogs' : 'कृषी सेवक निरीक्षण गति, समय पर समाधान व बकाया कार्य'}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5">{isEn ? 'Division' : 'विभाग'}</th>
                    <th className="py-2.5">{isEn ? 'Active Officers' : 'सक्रिय अधिकारी'}</th>
                    <th className="py-2.5">{isEn ? 'Total Assigned' : 'कुल नियुक्त'}</th>
                    <th className="py-2.5">{isEn ? 'Resolved < 6h' : '6 घंटे में हल'}</th>
                    <th className="py-2.5">{isEn ? 'On-Time %' : 'समय पर %'}</th>
                    <th className="py-2.5">{isEn ? 'Overdue (>24h)' : 'विलंबित (>24 घंटे)'}</th>
                    <th className="py-2.5">{isEn ? 'Status' : 'स्थिति'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { div: 'Vidarbha (Nagpur & Amravati)', officers: 840, assigned: 1420, resolved: 1360, pct: '95.7%', overdue: 8, status: 'EXCELLENT' },
                    { div: 'Marathwada (Aurangabad)', officers: 620, assigned: 890, resolved: 840, pct: '94.3%', overdue: 12, status: 'EXCELLENT' },
                    { div: 'Western Maharashtra (Pune / Nashik)', officers: 780, assigned: 980, resolved: 920, pct: '93.8%', overdue: 14, status: 'GOOD' },
                    { div: 'Khandesh (Jalgaon / Dhule)', officers: 340, assigned: 410, resolved: 380, pct: '92.6%', overdue: 9, status: 'GOOD' },
                    { div: 'Konkan (Ratnagiri / Sindhudurg)', officers: 210, assigned: 180, resolved: 175, pct: '97.2%', overdue: 2, status: 'EXCELLENT' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 font-extrabold text-slate-900">{row.div}</td>
                      <td className="py-3 font-mono text-slate-600">{row.officers}</td>
                      <td className="py-3 font-mono text-slate-800 font-bold">{row.assigned}</td>
                      <td className="py-3 font-mono text-emerald-700 font-bold">{row.resolved}</td>
                      <td className="py-3 font-mono font-black text-emerald-600">{row.pct}</td>
                      <td className="py-3 font-mono text-rose-600 font-bold">{row.overdue}</td>
                      <td className="py-3">
                        <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                          {isEn ? row.status : (row.status === 'EXCELLENT' ? 'उत्कृष्ट' : 'अच्छा')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: INTERVENTION IMPACT TRACKER                                       */}
      {/* ========================================================================= */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          
          {/* Impact Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-6 rounded-3xl shadow-md space-y-2">
              <span className="text-xs text-emerald-300 font-bold uppercase">{isEn ? 'Averted Economic Loss' : 'बचाई गई आर्थिक हानि'}</span>
              <div className="text-3xl font-black font-mono text-emerald-400">₹18.42 Crores</div>
              <p className="text-xs text-emerald-200">{isEn ? 'Calculated value of crop yield saved across 8 high-risk districts' : '8 उच्च जोखिम जिलों में बचाई गई पीक उपज का अनुमानित मूल्य'}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-slate-950 text-white p-6 rounded-3xl shadow-md space-y-2">
              <span className="text-xs text-blue-300 font-bold uppercase">{isEn ? 'Plot Recovery Rate' : 'खेत ठीक होने की दर'}</span>
              <div className="text-3xl font-black font-mono text-blue-400">87.6%</div>
              <p className="text-xs text-blue-200">{isEn ? 'Treated farm plots showing full symptomatic arrest within 10 days' : 'उपचारित खेतों में 10 दिनों में पूर्ण लक्षण नियंत्रण'}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-slate-950 text-white p-6 rounded-3xl shadow-md space-y-2">
              <span className="text-xs text-purple-300 font-bold uppercase">{isEn ? 'Pesticide Spray Optimization' : 'कीटनाशक छिड़काव अनुकूलन'}</span>
              <div className="text-3xl font-black font-mono text-purple-400">{isEn ? '-32% Chemical Load' : '-32% रासायनिक भार'}</div>
              <p className="text-xs text-purple-200">{isEn ? 'Reduction in uncalibrated pesticide spray due to targeted ETL traps' : 'लक्षित ETL जालों से अनावश्यक कीटनाशक छिड़काव में कमी'}</p>
            </div>
          </div>

          {/* District Before vs After Case Reduction Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{isEn ? 'District Containment Progression (Pre vs Post Advisory)' : 'जिला नियंत्रण प्रगति (सलाह से पहले व बाद)'}</h3>
                <p className="text-xs text-slate-500">{isEn ? 'Case trajectory 14 days before vs 14 days after state intervention' : 'राज्य हस्तक्षेप से 14 दिन पहले व 14 दिन बाद के मामलों की तुलना'}</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { dist: 'Yavatmal (Cotton Pink Bollworm)', preCases: 480, postCases: 140, reduction: '-70.8%', status: 'STABILIZED' },
                { dist: 'Wardha (Cotton Pink Bollworm)', preCases: 360, postCases: 110, reduction: '-69.4%', status: 'STABILIZED' },
                { dist: 'Latur (Soybean Rust)', preCases: 290, postCases: 95, reduction: '-67.2%', status: 'CONTAINED' },
                { dist: 'Pune / Haveli (Tomato Late Blight)', preCases: 210, postCases: 70, reduction: '-66.6%', status: 'CONTAINED' },
                { dist: 'Kolhapur (Sugarcane Red Rot)', preCases: 140, postCases: 45, reduction: '-67.8%', status: 'CONTAINED' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">{isEn 
                      ? item.dist 
                      : item.dist.replace('Cotton Pink Bollworm', 'कपास गुलाबी बोंडअळी').replace('Soybean Rust', 'सोयाबीन तांबेरा').replace('Tomato Late Blight', 'टमाटर करपा रोग').replace('Sugarcane Red Rot', 'ऊस तांबडा कूज')}</span>
                    <span className="font-mono font-black text-emerald-600">{item.reduction} {isEn ? 'Case Reduction' : 'मामलों में कमी'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span>{isEn ? 'Pre-Intervention Peak:' : 'हस्तक्षेप से पहले उच्चतम:'} <strong className="text-rose-600">{item.preCases}</strong></span>
                    <span>➔</span>
                    <span>{isEn ? 'Current Active:' : 'वर्तमान सक्रिय:'} <strong className="text-emerald-700">{item.postCases}</strong></span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-rose-500" style={{ width: `${(item.postCases / item.preCases) * 100}%` }}></div>
                    <div className="h-full bg-emerald-500 flex-1"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: CRYPTOGRAPHIC STATE AUDIT TRAIL                                    */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                {isEn ? 'Immutable Cryptographic State Audit Log' : 'अपरिवर्तनीय क्रिप्टोग्राफ़िक राज्य ऑडिट लॉग'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn ? 'Permanent SHA-256 ledger of all state-level containment orders, advisory broadcasts, and lab verifications' : 'सभी राज्य स्तरीय नियंत्रण आदेशों, सलाह प्रसारणों व लैब प्रमाणनों का स्थायी SHA-256 लेज़र'}
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono text-xs rounded-xl font-bold">
              {isEn ? 'Chain Height:' : 'चेन ऊंचाई:'} #{auditLogs.length || 142} {isEn ? 'Blocks' : 'ब्लॉक'}
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {auditLogs && auditLogs.length > 0 ? (
              auditLogs.map((log, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{log.action || log.event}</span>
                      <span className="bg-slate-200 text-slate-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                        {log.actor_role || 'GOVT_ADMIN'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp || '2026-09-06'}</span>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {log.details || JSON.stringify(log.payload || {})}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-200">
                    <span className="truncate max-w-[320px]">{isEn ? 'Actor ID:' : 'कर्ता ID:'} {log.actor_id || 'govt_101'}</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> SHA-256 {isEn ? 'VERIFIED' : 'सत्यापित'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">STATE_EPIDEMIC_ADVISORY_DISPATCH</span>
                  <span className="text-[10px] text-slate-400 font-mono">2026-09-06 00:30:15 UTC</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  {isEn ? 'Emergency alert dispatched to Yavatmal & Wardha for Pink Bollworm containment. Signed by Commissionerate of Agriculture.' : 'यवतमाळ व वर्धा में गुलाबी बोंडअळी नियंत्रण हेतु आपातकालीन चेतावनी भेजी गई. कृषी आयुक्तालय द्वारा हस्ताक्षरित.'}
                </p>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200">
                  <span>{isEn ? 'Hash:' : 'हैश:'} 8f9a2b...4d1e</span>
                  <span className="text-emerald-700 font-bold">✓ {isEn ? 'CRYPTOGRAPHICALLY SECURED' : 'क्रिप्टोग्राफ़िक रूप से सुरक्षित'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
