import React, { useState, useEffect } from 'react';
import { 
  Camera, Upload, Volume2, VolumeX, AlertTriangle, 
  CheckCircle2, RefreshCw, Calendar, MapPin, 
  Clock, ArrowRight, ArrowLeft, Shield, FileText, Sliders, 
  HelpCircle, ChevronRight, Phone, Droplet, SunMedium,
  Check, User, Info, AlertCircle, ExternalLink, Activity,
  Layers, CheckSquare, Sparkles, Sprout, Wind, Thermometer,
  ShieldCheck, ArrowUpRight, Award, PlusCircle, CheckCircle,
  PhoneCall, DollarSign, Bug, CloudSun, Landmark, TrendingUp,
  Lightbulb, ShieldAlert, Wheat, FlaskConical, CreditCard, CloudRain
} from 'lucide-react';
import { api } from '../services/api';
import { voiceService } from '../services/voiceService';
import { translations, makeT } from '../services/i18n';
import { ImageUploader } from '../components/ImageUploader';
import { DosageCalculator } from '../components/DosageCalculator';

export const FarmerPortal = ({ currentLang = 'en' }) => {
  const t = makeT(currentLang);
  const isEn = currentLang === 'en';

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('diagnose'); // 'diagnose', 'risk', 'cases', 'dosage', 'recovery', 'schemes'
  const [extraTab, setExtraTab] = useState('schemes'); // 'schemes', 'markets', 'helpline', 'tips'

  // Diagnosis State
  const [selectedCrop, setSelectedCrop] = useState('Cotton');
  const [selectedSampleImage, setSelectedSampleImage] = useState(
    'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80'
  );
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Weather & Risk State
  const [riskForecast, setRiskForecast] = useState(null);

  // Case Lifecycle State
  const [myCases, setMyCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [caseSuccessMsg, setCaseSuccessMsg] = useState(null);

  // Treatment Logging State
  const [treatmentMolecule, setTreatmentMolecule] = useState('');
  const [treatmentDosage, setTreatmentDosage] = useState('');

  // Recovery State
  const [day0Severity, setDay0Severity] = useState(32);
  const [day7Severity, setDay7Severity] = useState(14);

  // Sample Images Library
  const sampleImages = [
    {
      id: 'cotton_pbw',
      title: isEn ? 'Cotton Pink Bollworm' : 'कापूस गुलाबी बोंडअळी',
      crop: 'Cotton',
      url: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80',
      label: isEn ? 'Boll Borehole & Rosetting' : 'बोंड भोक व गुलाबी लक्षणे',
      scientific: 'Pectinophora gossypiella',
      tag: isEn ? 'Pest Infestation' : 'कीट प्रादुर्भाव'
    },
    {
      id: 'soybean_rust',
      title: isEn ? 'Soybean Leaf Rust' : 'सोयाबीन तांबेरा रोग',
      crop: 'Soybean',
      url: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80',
      label: isEn ? 'Abaxial Foliar Pustules' : 'पानावरील तांबेरी ठिपके',
      scientific: 'Phakopsora pachyrhizi',
      tag: isEn ? 'Fungal Spores' : 'बुरशी बीजाणू'
    },
    {
      id: 'tomato_blight',
      title: isEn ? 'Tomato Late Blight' : 'टोमॅटो करपा रोग',
      crop: 'Tomato',
      url: 'https://images.unsplash.com/photo-1592417817098-8f3d69106095?auto=format&fit=crop&w=800&q=80',
      label: isEn ? 'Water-Soaked Lesions' : 'पाणी भिनलेले जखमेचे ठिपके',
      scientific: 'Phytophthora infestans',
      tag: isEn ? 'Oomycete Blight' : 'ओमाइसीट रोग'
    }
  ];

  useEffect(() => {
    loadFarmerData();
  }, []);

  const loadFarmerData = async () => {
    try {
      const p = await api.getProfile('farm_101');
      setProfile(p);
      setSelectedCrop(p.crop_name || 'Cotton');

      const [risk, cases] = await Promise.all([
        api.forecastRisk(p.district || 'Yavatmal', p.crop_name || 'Cotton', p.id),
        api.getCases('FARMER', 'farmer_101')
      ]);
      setRiskForecast(risk);
      setMyCases(cases || []);
      if (cases && cases.length > 0) setActiveCase(cases[0]);

      // Pre-run diagnosis on default sample photo
      runDiagnosis(p.id, p.crop_name || 'Cotton', null, 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80');
    } catch (err) {
      console.error("Farmer load error:", err);
    }
  };

  const runDiagnosis = async (farmId, cropHint, fileToUpload, customPreviewUrl) => {
    setIsScanning(true);
    setCaseSuccessMsg(null);
    try {
      const formData = new FormData();
      formData.append('farm_id', farmId || profile?.id || 'farm_101');
      if (cropHint) formData.append('crop_hint', cropHint);
      
      const file = fileToUpload || uploadedFile;
      if (file) {
        formData.append('image', file);
      }

      const result = await api.diagnoseImage(formData);
      setDiagnosisResult(result);
      if (result?.crop) {
        setSelectedCrop(result.crop);
      }
      if (customPreviewUrl) {
        setSelectedSampleImage(customPreviewUrl);
      }
    } catch (err) {
      console.error("Diagnosis error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectSample = (sample) => {
    setSelectedCrop(sample.crop);
    setSelectedSampleImage(sample.url);
    setUploadedFile(null);
    runDiagnosis(profile?.id, sample.crop, null, sample.url);
  };

  const handleImageSelected = (file, previewUrl) => {
    setUploadedFile(file);
    setSelectedSampleImage(previewUrl);
    runDiagnosis(profile?.id, null, file, previewUrl);
  };

  const handleCreateCase = async () => {
    setIsCreatingCase(true);
    try {
      const formData = new FormData();
      formData.append('farm_id', profile?.id || 'farm_101');
      formData.append('crop_hint', selectedCrop);
      formData.append('image_url', selectedSampleImage || 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80');

      const newCase = await api.createCase(formData);
      setCaseSuccessMsg(newCase.case_id);
      const updatedCases = await api.getCases();
      setMyCases(updatedCases);
      setActiveCase(newCase);
    } catch (err) {
      console.error("Create case error:", err);
    } finally {
      setIsCreatingCase(false);
    }
  };

  const handleSpeakAdvisory = () => {
    if (isSpeaking) {
      voiceService.stop();
      setIsSpeaking(false);
      return;
    }

    if (!diagnosisResult) return;
    const ipm = diagnosisResult.authoritative_ipm;

    let speechText = '';
    if (isEn) {
      speechText = `MahaKisan Farmer Advisory for your ${selectedCrop} crop. Condition: ${diagnosisResult.detected_entity.split('(')[0]}. Current severity is ${diagnosisResult.severity.split('(')[0]}. Apply ${ipm?.chemical_control?.[0]?.trade_name || 'Emamectin Benzoate 5% SG'} at ${ipm?.chemical_control?.[0]?.dosage_per_15l_pump || '7.5 grams'} per fifteen liter pump. Observe 14 days waiting period before harvesting.`;
    } else {
      speechText = `महाकिसान सल्ला: तुमच्या ${selectedCrop} पिकावर ${diagnosisResult.detected_entity} रोगाची लक्षणे आढळली आहेत. शिफारस: ${ipm?.chemical_control?.[0]?.trade_name} ची प्रति १५ लिटर पंपासाठी ७.५ ग्रॅम फवारणी करा व १४ दिवस प्रतीक्षा कालावधी पाळा.`;
    }

    voiceService.speak(speechText, currentLang);
    setIsSpeaking(true);
  };

  const handleLogTreatment = async (e) => {
    e.preventDefault();
    if (!activeCase || !treatmentMolecule) return;

    try {
      const formData = new FormData();
      formData.append('molecule', treatmentMolecule);
      formData.append('dosage', treatmentDosage || '7.5 gm / 15L pump');

      await api.logTreatment(activeCase.case_id, formData);
      const updated = await api.getCases();
      setMyCases(updated);
      alert(isEn ? "Treatment record saved." : "फवारणी नोंद सेव्ह झाली.");
      setTreatmentMolecule('');
    } catch (err) {
      console.error("Log treatment error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* 1. TOP OFFICIAL FARMER HERO BANNER (MATCHES SYSTEM DESIGN LANGUAGE) */}
      <section className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-emerald-500/20 relative overflow-hidden space-y-4">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
              👨‍🌾
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">
                  {isEn ? 'ROLE 1 — FARMER DIRECT ADVISORY & CLINICAL AI' : 'भूमिका १ — शेतकरी थेट पीक संरक्षण व AI सल्ला'}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {isEn ? 'CIBRC Compliant & GPS Linked' : 'CIBRC प्रमाणित व GPS जोडणी'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                {isEn ? (profile?.farmer_name?.split('(')[0]?.trim() || 'Ramesh Tukaram Patil') : (profile?.farmer_name || 'रमेश तुकाराम पाटील')}
              </h1>
              <p className="text-xs text-emerald-200/90 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                <span><strong>ID:</strong> {profile?.farmer_id || 'MH-YAV-2026-001245'}</span>
                <span>•</span>
                <span><MapPin className="w-3.5 h-3.5 inline -mt-0.5" /> {profile?.village || 'Zadgaon'}, {profile?.taluka || 'Darwha'}, {profile?.district || 'Yavatmal'}</span>
                <span>•</span>
                <span>{profile?.crop_name || 'Cotton'} ({profile?.crop_variety || 'Bt-Cotton RCH-659'}) • {profile?.farm_size_acres || 2.5} {isEn ? 'Acres' : 'एकर'}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('diagnose')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl shadow-md border border-emerald-400/40 text-xs flex items-center gap-1.5 transition"
            >
              <Camera className="w-4 h-4" />
              <span>{isEn ? 'Instant AI Scan' : 'त्वरित AI स्कॅन'}</span>
            </button>
            <a
              href="tel:18001801551"
              className="bg-white/10 hover:bg-white/20 text-emerald-100 font-bold px-3 py-2 rounded-xl border border-white/10 text-xs flex items-center gap-1.5 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
              <span>1800-180-1551</span>
            </a>
          </div>
        </div>

        {/* RBAC Mandate & Scope Strip */}
        <div className="bg-emerald-950/70 border border-emerald-500/30 p-2.5 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 text-emerald-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>{isEn ? 'Authorized Farm Scope:' : 'अधिकृत शेत कार्यक्षेत्र:'}</strong> {isEn ? 'Access to real-time neural disease detection, authoritative CIBRC chemistry recommendations, 7-day microclimate telemetry, and 1-click Krishi Sevak referral.' : 'थेट न्यूरल रोग निदान, CIBRC कीटकनाशक शिफारसी, ७-दिवस हवामान जोखीम आणि कृषी सेवक थेट मदतीसाठी अधिकृत.'}
            </span>
          </div>
          <div className="text-[11px] text-emerald-300 font-mono">
            {profile?.id || 'farm_101'} • Darwha Block
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME FARM TELEMETRY STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Crop Phenology Stage */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>{isEn ? 'Crop Phenology' : 'पीक वाढ अवस्था'}</span>
            <span className="text-emerald-700 font-extrabold">{isEn ? 'Day 82' : 'दिवस ८२'}</span>
          </div>
          <div className="text-base font-extrabold text-slate-900 truncate">
            {profile?.crop_stage || t('farmerPortal.bollDevelopment')}
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-emerald-600 h-full w-[68%] rounded-full"></div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {profile?.crop_variety || 'Bt-Cotton RCH-659'}
          </div>
        </div>

        {/* Live Weather Microclimate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>{isEn ? 'Live Microclimate' : 'थेट हवामान'}</span>
            <span className="text-sky-600 font-bold">Yavatmal</span>
          </div>
          <div className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-amber-500" />
            31°C • 88% RH
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-2">
            <span><Droplet className="w-3 h-3 text-sky-500 inline" /> Rain: 12 mm</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">{isEn ? 'Optimum Spray' : 'फवारणी अनुकूल'}</span>
          </div>
        </div>

        {/* Pheromone Trap Telemetry */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>{isEn ? 'Pheromone Trap' : 'कामगंध सापळा'}</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <div className="text-base font-extrabold text-rose-600 flex items-center gap-1.5">
            <Bug className="w-4 h-4 text-rose-600" />
            14 {isEn ? 'Moths/Night' : 'पतंग/रात्र'}
          </div>
          <div className="text-[10px] font-bold text-rose-600">
            {isEn ? 'ETL Breached (>8) — Critical' : 'ETL मर्यादा ओलांडली (>८) — गंभीर'}
          </div>
        </div>

        {/* 7-Day Disease Risk */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>{isEn ? '7-Day Epidemic Risk' : '७-दिवस जोखीम अंदाज'}</span>
            <span className="text-rose-600 font-extrabold">{riskForecast ? Math.round(riskForecast.risk_score_pct) : 78}%</span>
          </div>
          <div className="text-base font-extrabold text-amber-700 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            {isEn ? 'High Risk Alert' : 'उच्च जोखीम इशारा'}
          </div>
          <div className="text-[10px] text-amber-800 font-bold">
            {isEn ? 'Pink Bollworm & Foliar Rust' : 'गुलाबी बोंडअळी व तांबेरा'}
          </div>
        </div>
      </div>

      {/* 3. WORKBENCH NAVIGATION TABS (MATCHES KRISHI SEVAK & EXPERT HUBS) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('diagnose')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'diagnose' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{isEn ? '1. Instant AI Crop Diagnosis' : '१. त्वरित AI पीक निदान'}</span>
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'risk' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <SunMedium className="w-4 h-4" />
          <span>{isEn ? '2. Weather & 7-Day Outbreak Risk' : '२. हवामान व ७-दिवस जोखीम अंदाज'}</span>
        </button>

        <button
          onClick={() => setActiveTab('cases')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'cases' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isEn ? '3. My Cases & Support History' : '३. माझे प्रकरण इतिहास व मदत'}</span>
          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
            {myCases.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dosage')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'dosage' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isEn ? '4. CIBRC Spray Dose Calculator' : '४. CIBRC फवारणी डोस गणक'}</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'recovery' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isEn ? '5. Recovery & Healing Evaluation' : '५. रोगमुक्ती व सुधारणा मूल्यमापन'}</span>
        </button>

        <button
          onClick={() => setActiveTab('schemes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'schemes' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>{isEn ? '6. Govt Schemes & Mandi Rates' : '६. सरकारी योजना व मंडी भाव'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI CROP DOCTOR & SCAN STUDIO                                      */}
      {/* ========================================================================= */}
      {activeTab === 'diagnose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Photo Uploader & 1-Click Samples */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-700" />
                  {isEn ? 'Capture or Upload Crop Specimen Photo' : 'पिकाचा नमुना फोटो घ्या किंवा अपलोड करा'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn ? 'Deep neural vision analyzes foliar lesions, pest boreholes, and fungal spores instantly.' : 'न्यूरल व्हिजन पानावरील ठिपके, किडींची छिद्रे व बुरशी बीजाणू त्वरित ओळखते.'}
                </p>
              </div>
            </div>

            {/* Drag and Drop Box */}
            <ImageUploader
              onImageSelected={handleImageSelected}
              currentImage={selectedSampleImage}
              isScanning={isScanning}
              currentLang={currentLang}
            />

            {/* 1-Click Sample Library */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-600 block">
                {isEn ? 'Or select verified test photos (1-Click):' : 'किंवा प्रमाणित चाचणी फोटो निवडा (१-क्लिक):'}
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {sampleImages.map(sample => {
                  const isSelected = selectedSampleImage === sample.url;
                  return (
                    <button
                      type="button"
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={isSelected ? 'p-2 rounded-xl border text-left transition-all border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/70 shadow-xs' : 'p-2 rounded-xl border text-left transition-all border-slate-200 bg-slate-50/70 hover:bg-slate-100'}
                    >
                      <img 
                        src={sample.url} 
                        alt={sample.title} 
                        className="w-full h-16 object-cover rounded-lg border border-slate-200 mb-1.5 shadow-2xs"
                      />
                      <div className="text-[11px] font-bold text-slate-900 truncate">{sample.title}</div>
                      <div className="text-[9px] text-slate-500 truncate">{sample.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Clinical Diagnosis Result */}
          <div className="lg:col-span-6 space-y-4">
            {isScanning ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-base">{isEn ? 'Running Deep Vision Neural Diagnostic...' : 'सखोल प्रतिमा निदान सुरू आहे...'}</h4>
                  <p className="text-xs text-slate-500">{isEn ? 'Cross-referencing 54 Maharashtra crop pathological profiles and microclimate telemetry' : '५४ महाराष्ट्र पीक रोग प्रोफाइल व सूक्ष्म हवामान डेटाशी जुळवत आहे'}</p>
                </div>
              </div>
            ) : diagnosisResult ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 text-sm">
                
                {/* Result Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {isEn ? 'AI Diagnostic Confirmation' : 'AI रोगनिदान पुष्टी'}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">
                      {diagnosisResult.detected_entity}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 italic">
                      {diagnosisResult.scientific_name || 'Pectinophora gossypiella'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSpeakAdvisory}
                      className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl text-xs font-bold text-amber-950 flex items-center gap-1.5 shadow-2xs transition"
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600 animate-pulse" /> : <Volume2 className="w-4 h-4 text-amber-800" />}
                      <span>{isSpeaking ? (isEn ? 'Stop Audio' : 'ऑडिओ थांबवा') : (isEn ? 'Listen Remedy' : 'उपाय ऐका')}</span>
                    </button>
                    <span className="px-3 py-1.5 bg-rose-100 text-rose-800 font-black text-xs rounded-xl border border-rose-200">
                      {diagnosisResult.severity || 'MODERATE'}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">{isEn ? 'AI Match Confidence' : 'AI जुळणी अचूकता'}</span>
                    <div className="text-lg font-black text-slate-900 font-mono">
                      {Math.round((diagnosisResult.confidence_score || 0.88) * 100)}%
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(diagnosisResult.confidence_score || 0.88) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">{isEn ? 'Pheromone Trap Status' : 'कामगंध सापळा स्थिती'}</span>
                    <div className="text-sm font-black text-rose-600">
                      {isEn ? '14 Moths/Night' : '१४ पतंग/रात्र'}
                    </div>
                    <span className="text-[10px] text-rose-600 font-semibold">{isEn ? 'Above ETL Threshold (8)' : 'ETL मर्यादेपेक्षा जास्त (८)'}</span>
                  </div>
                </div>

                {/* CIBRC Authoritative IPM Recommendation */}
                <div className="space-y-3 pt-1">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                    {isEn ? 'Recommended Control Measures (CIBRC Standard)' : 'शिफारस केलेले उपाय (CIBRC मानक)'}
                  </span>

                  {/* Chemical Control */}
                  {diagnosisResult.authoritative_ipm?.chemical_control?.[0] && (
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-950 text-sm">
                          {diagnosisResult.authoritative_ipm.chemical_control[0].trade_name}
                        </span>
                        <span className="bg-white border border-emerald-300 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                          PHI: {diagnosisResult.authoritative_ipm.chemical_control[0].phi_days || 14} {isEn ? 'Days' : 'दिवस'}
                        </span>
                      </div>
                      <p className="text-emerald-900 font-bold">
                        {isEn ? 'Dosage:' : 'डोस:'} {diagnosisResult.authoritative_ipm.chemical_control[0].dosage_per_15l_pump}
                      </p>
                      <p className="text-emerald-800 text-[11px] font-mono">
                        {isEn ? 'Active Molecule:' : 'सक्रिय घटक:'} {diagnosisResult.authoritative_ipm.chemical_control[0].molecule}
                      </p>
                    </div>
                  )}

                  {/* Biological & Cultural Control */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-slate-700">
                    <div>
                      <strong>{isEn ? 'Biological / Organic:' : 'जैविक / सेंद्रिय:'}</strong> {diagnosisResult.authoritative_ipm?.biological_control?.[0]?.description || (isEn ? 'Neem Oil / NSKE 5% spray to suppress egg laying.' : 'अंडी नष्ट करण्यासाठी निंबोळी अर्क ५% किंवा नीम तेल फवारा.')}
                    </div>
                    <div>
                      <strong>{isEn ? 'Cultural Practice:' : 'कृषी पद्धती:'}</strong> {diagnosisResult.authoritative_ipm?.cultural_control?.[0]?.description || (isEn ? 'Install 5 pheromone traps per acre to monitor moth activity.' : 'पतंग हालचालींवर लक्ष ठेवण्यासाठी एकरी ५ कामगंध सापळे लावा.')}
                    </div>
                  </div>
                </div>

                {/* One-Click Action: Submit Field Verification */}
                {caseSuccessMsg ? (
                  <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-950 font-bold text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      <span>{isEn ? `Case #${caseSuccessMsg} Submitted to Krishi Sevak (Anil Deshmukh).` : `प्रकरण #${caseSuccessMsg} कृषी सेवक (अनिल देशमुख) यांच्याकडे पाठवले.`}</span>
                    </div>
                    <button 
                      onClick={() => setActiveTab('cases')}
                      className="px-3 py-1 bg-emerald-800 text-white rounded-xl font-bold text-xs"
                    >
                      {isEn ? 'Track' : 'स्थिती पहा'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCreateCase}
                    disabled={isCreatingCase}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>{isCreatingCase ? (isEn ? 'Submitting to Krishi Sevak...' : 'कृषी सेवकाकडे पाठवत आहे...') : (isEn ? 'Submit to Krishi Sevak for Field Visit & University Review' : 'शेत भेट व विद्यापीठ तपासणीसाठी कृषी सेवकाकडे सादर करा')}</span>
                  </button>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center text-slate-400 text-xs">
                {isEn ? 'Upload or select a photo to view diagnostic results and dosage instructions.' : 'निदान परिणाम व औषध मात्रा पाहण्यासाठी फोटो अपलोड करा किंवा निवडा.'}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 7-DAY OUTBREAK RISK & WEATHER                                     */}
      {/* ========================================================================= */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-white rounded-2xl p-6 border border-amber-500/30 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isEn ? 'MICROCLIMATE DISEASE VULNERABILITY ALERT' : 'सूक्ष्म हवामान रोग जोखीम इशारा'}
                </span>
                <h3 className="text-xl font-black mt-2">
                  {riskForecast ? (isEn ? `High Risk (${riskForecast.risk_score_pct}% Vulnerability) for ${riskForecast.primary_threat}` : `उच्च जोखीम (${riskForecast.risk_score_pct}% धोका) ${riskForecast.primary_threat || 'कीड'}`) : (isEn ? 'High Risk (78% Vulnerability) for Pink Bollworm & Rust' : 'उच्च जोखीम (७८% धोका) गुलाबी बोंडअळी व तांबेरा रोगासाठी')}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  {riskForecast ? (isEn ? riskForecast.driving_factors?.[0] || 'Weather simulation detects optimal conditions for pathogen germination' : riskForecast.driving_factors?.[0] || 'हवामान मॉडेल कीड व बुरशी प्रसारास अनुकूल परिस्थिती दर्शवत आहे') : (isEn ? 'Coupled weather simulation detects optimal spore germination humidity (>85% RH) and night flight temperature (26-31°C) over Yavatmal.' : 'यवतमाळ भागात आर्द्रता (>८५% RH) आणि रात्रीचे उड्डाण तापमान (२६-३१°C) किडींसाठी अनुकूल आहे.')}
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl text-center min-w-[150px]">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? '7-DAY RISK SCORE' : '७-दिवस जोखीम स्कोअर'}</span>
                <div className="text-3xl font-black text-rose-500 font-mono">
                  {riskForecast ? Math.round(riskForecast.risk_score_pct) : 78}%
                </div>
                <span className="text-[10px] text-rose-300 font-bold">{riskForecast ? (isEn ? riskForecast.risk_level || 'HIGH' : 'उच्च धोका') : 'अति गंभीर जोखीम'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">{isEn ? '7-Day Farm Weather & Disease Surge Prediction' : '७-दिवस शेत हवामान व रोग प्रादुर्भाव अंदाज'}</h3>

            {riskForecast ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
                {(riskForecast.daily_forecast && riskForecast.daily_forecast.length > 0) ? (
                  riskForecast.daily_forecast.map((fc, i) => {
                    const riskBadge = (fc.risk_pct >= 80) ? 'bg-rose-600 text-white' : (fc.risk_pct >= 65) ? 'bg-orange-500 text-white' : (fc.risk_pct >= 45) ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white';
                    return (
                      <div key={i} className={`p-3.5 rounded-2xl border text-center text-xs space-y-2 ${i === 0 ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-extrabold text-slate-900 block">{fc.day_index === 1 ? (isEn ? 'Today' : 'आज') : (isEn ? `Day ${fc.day_index}` : `दिवस ${fc.day_index}`)}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{fc.date}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 space-y-0.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <Thermometer className="w-3.5 h-3.5 text-slate-400" />{fc.temperature_c}°C
                          </div>
                          <div className="flex items-center justify-center gap-1.5">
                            <Droplet className="w-3.5 h-3.5 text-slate-400" />{fc.relative_humidity_pct}% RH
                          </div>
                          <div className="flex items-center justify-center gap-1.5">
                            <CloudRain className="w-3.5 h-3.5 text-slate-400" />{fc.rainfall_mm}mm
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                          <div className="text-[10px] font-mono font-black mb-1">
                            <span className={`inline-block px-1.5 py-0.5 rounded ${riskBadge}`}>{Math.round(fc.risk_pct)}% {isEn ? 'Risk' : 'धोका'}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-700 mt-1 block">{fc.agronomy_advice}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  Object.entries(riskForecast.agro_climatic_indices || {}).map(([key, value]) => {
                    const labels = {
                      relative_humidity_pct: 'RH',
                      leaf_wetness_hours: 'LWD hrs',
                      temperature_c: isEn ? 'Temp' : 'तापमान',
                      rainfall_mm: isEn ? 'Rain mm' : 'पाऊस mm',
                      endemicity_index: isEn ? 'Endemic Index' : 'रोग निर्देशांक',
                      gdd_accumulated: 'GDD',
                      wallin_risk_rating: isEn ? 'Wallin Risk' : 'Wallin जोखीम'
                    };
                    return (
                      <div key={key} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs">
                        <span className="font-extrabold text-slate-900 block">{labels[key] || key}</span>
                        <div className="text-[11px] text-slate-600">{value}</div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
                {[
                  { day: isEn ? 'Day 1 (Today)' : 'दिवस १ (आज)', temp: '31°C', rh: '88%', rain: '12mm', risk: isEn ? 'HIGH' : 'उच्च', riskPct: 88, advice: isEn ? 'Spray NSKE 5%' : 'निंबोळी अर्क ५% फवारा' },
                  { day: isEn ? 'Day 2 (Mon)' : 'दिवस २ (सोम)', temp: '30°C', rh: '91%', rain: '24mm', risk: isEn ? 'CRITICAL' : 'गंभीर', riskPct: 94, advice: isEn ? 'Avoid spray in rain' : 'पावसात फवारणी टाळा' },
                  { day: isEn ? 'Day 3 (Tue)' : 'दिवस ३ (मंगळ)', temp: '29°C', rh: '89%', rain: '18mm', risk: isEn ? 'CRITICAL' : 'गंभीर', riskPct: 92, advice: isEn ? 'Check trap counts' : 'सापळ्यातील संख्या तपासा' },
                  { day: isEn ? 'Day 4 (Wed)' : 'दिवस ४ (बुध)', temp: '32°C', rh: '82%', rain: '4mm', risk: isEn ? 'HIGH' : 'उच्च', riskPct: 76, advice: isEn ? 'Apply Emamectin' : 'Emamectin फवारा' },
                  { day: isEn ? 'Day 5 (Thu)' : 'दिवस ५ (गुरु)', temp: '33°C', rh: '75%', rain: '0mm', risk: isEn ? 'MODERATE' : 'मध्यम', riskPct: 62, advice: isEn ? 'Field inspection' : 'शेत पाहणी करा' },
                  { day: isEn ? 'Day 6 (Fri)' : 'दिवस ६ (शुक्र)', temp: '34°C', rh: '68%', rain: '0mm', risk: isEn ? 'GUARDED' : 'सावध', riskPct: 48, advice: isEn ? 'Normal irrigation' : 'नियमित पाणी द्या' },
                  { day: isEn ? 'Day 7 (Sat)' : 'दिवस ७ (शनि)', temp: '33°C', rh: '65%', rain: '0mm', risk: isEn ? 'LOW' : 'कमी', riskPct: 38, advice: isEn ? 'Monitor recovery' : 'सुधारणा तपासा' },
                ].map((fc, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-center text-xs">
                    <span className="font-extrabold text-slate-900 block">{fc.day}</span>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-slate-400" />{fc.temp}
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <Droplet className="w-3.5 h-3.5 text-slate-400" />{fc.rh}
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <CloudRain className="w-3.5 h-3.5 text-slate-400" />{fc.rain}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-mono font-black text-rose-600 block">{fc.riskPct}% {isEn ? 'Risk' : 'धोका'}</span>
                      <span className="text-[10px] font-semibold text-slate-700 mt-1 block">{fc.advice}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY CASES & KRISHI SEVAK VISITS                                    */}
      {/* ========================================================================= */}
      {activeTab === 'cases' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Cases List */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">{isEn ? 'My Diagnostic Submissions' : 'माझी नोंदवलेली प्रकरणे'}</h3>
              <span className="font-mono text-xs text-slate-500 font-bold">{myCases.length} {isEn ? 'Cases' : 'प्रकरणे'}</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {myCases.map(c => {
                const isSelected = activeCase?.case_id === c.case_id;
                return (
                  <div
                    key={c.case_id}
                    onClick={() => setActiveCase(c)}
                    className={isSelected ? 'p-3.5 rounded-2xl border cursor-pointer transition space-y-1.5 border-emerald-600 bg-emerald-50/70 shadow-sm' : 'p-3.5 rounded-2xl border cursor-pointer transition space-y-1.5 border-slate-200 bg-slate-50 hover:bg-slate-100'}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-slate-900">{isEn ? `Case #${c.case_id}` : `प्रकरण #${c.case_id}`}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {c.status || 'VERIFIED'}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800">
                      {c.diagnosis?.detected_entity || (isEn ? 'Cotton Pink Bollworm' : 'कापूस गुलाबी बोंडअळी')}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {isEn ? 'Crop:' : 'पीक:'} {c.farmer_profile?.crop_name || 'Cotton'} • {c.created_at?.split('T')[0] || '2026-09-05'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Case Inspection Detail */}
          <div className="lg:col-span-7 space-y-4">
            {activeCase ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{isEn ? `Case #${activeCase.case_id}` : `प्रकरण #${activeCase.case_id}`}</h3>
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {activeCase.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {isEn ? 'Farmer:' : 'शेतकरी:'} {activeCase.farmer_profile?.farmer_name} • {isEn ? 'Village:' : 'गाव:'} {activeCase.farmer_profile?.village}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">{isEn ? 'Assigned Krishi Sevak' : 'नियुक्त कृषी सेवक'}</span>
                    <span className="font-bold text-emerald-800 text-xs">{activeCase.assigned_krishi_sevak || 'Anil S. Deshmukh'}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">{isEn ? 'Verification Progress Timeline:' : 'तपासणी प्रगती टप्पे:'}</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white">✓ 1. {isEn ? 'Submitted' : 'नोंदवले'}</div>
                    <div className="p-2 rounded-xl bg-emerald-600 text-white">✓ 2. {isEn ? 'Field Verified' : 'शेत पाहणी'}</div>
                    <div className="p-2 rounded-xl bg-emerald-600 text-white">✓ 3. {isEn ? 'Expert Reviewed' : 'तज्ज्ञ पुनरावलोकन'}</div>
                    <div className="p-2 rounded-xl bg-purple-600 text-white">✓ 4. {isEn ? 'Lab Tested' : 'लॅब चाचणी'}</div>
                  </div>
                </div>

                {/* Field Inspection Details by Krishi Sevak */}
                {activeCase.field_inspection && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      {isEn ? 'Krishi Sevak On-Site Inspection Report' : 'कृषी सेवक शेत तपासणी अहवाल'}
                    </span>
                    <p className="text-slate-700 italic leading-relaxed">
                      "{activeCase.field_inspection.officer_observation}"
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                      <span>{isEn ? 'Pheromone Traps:' : 'कामगंध सापळे:'} <strong>{activeCase.field_inspection.trap_count || 14} {isEn ? 'moths/night' : 'पतंग/रात्र'}</strong></span>
                      <span>{isEn ? 'ETL Status:' : 'ETL स्थिती:'} <strong className="text-rose-600">{isEn ? 'BREACHED' : 'मर्यादा ओलांडली'}</strong></span>
                    </div>
                  </div>
                )}

                {/* Treatment Logger */}
                <form onSubmit={handleLogTreatment} className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
                  <span className="font-bold text-emerald-950 text-xs block">{isEn ? 'Log Applied Treatment / Spray' : 'केलेली फवारणी नोंदवा'}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={isEn ? "e.g. Emamectin Benzoate 5% SG" : "उदा. Emamectin Benzoate 5% SG"}
                      value={treatmentMolecule}
                      onChange={(e) => setTreatmentMolecule(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 font-semibold"
                    />
                    <input
                      type="text"
                      placeholder={isEn ? "e.g. 7.5 gm per 15L pump" : "उदा. ७.५ ग्रॅम प्रति १५L पंप"}
                      value={treatmentDosage}
                      onChange={(e) => setTreatmentDosage(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow transition"
                  >
                    {isEn ? 'Save Treatment Record' : 'फवारणी नोंद सेव्ह करा'}
                  </button>
                </form>

              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
                {isEn ? 'Select a case to inspect details.' : 'तपशील पाहण्यासाठी प्रकरण निवडा.'}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DOSAGE CALCULATOR & SAFE SPRAY GUIDE                               */}
      {/* ========================================================================= */}
      {activeTab === 'dosage' && (
        <div className="space-y-6">
          <DosageCalculator 
            currentChemical={diagnosisResult?.authoritative_ipm?.chemical_control?.[0] || {
              trade_name: 'Emamectin Benzoate 5% SG',
              dosage_per_15l_pump: '7.5 gm / 15L pump',
              phi_days: 14
            }}
            currentLang={currentLang}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: POST-TREATMENT RECOVERY (DAY 0 VS DAY 7)                           */}
      {/* ========================================================================= */}
      {activeTab === 'recovery' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                {isEn ? 'Post-Treatment Recovery Verification (Day 0 vs Day 7)' : 'उपचारानंतर सुधारणा पडताळणी (दिवस ० विरुद्ध दिवस ७)'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn ? 'Visual proof of treatment efficacy and crop symptom arrest' : 'उपचार परिणामकारकता व पीक लक्षणे थांबल्याचा दृश्य पुरावा'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3.5 py-1.5 rounded-full font-bold text-xs">
            <span>{isEn ? '56% Symptom Reduction • ₹42,500 Yield Saved' : '५६% लक्षणे घट • ₹४२,५०० उत्पादन बचत'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block">{isEn ? 'Day 0: Initial Infestation (Pre-Spray)' : 'दिवस ०: सुरुवातीचा प्रादुर्भाव (फवारणीपूर्वी)'}</span>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80"
                  alt={isEn ? 'Day 0' : 'दिवस ०'}
                  className="w-full h-64 object-cover rounded-2xl border-2 border-rose-300"
                />
                <p className="text-slate-500 text-[11px]">{isEn ? 'Larval entrance boreholes on cotton bolls.' : 'कापसाच्या बोंडावर अळीच्या प्रवेशाची छिद्रे.'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 block">{isEn ? 'Day 7: Post-Treatment Healing' : 'दिवस ७: उपचारानंतर भरून येणे'}</span>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80"
                  alt={isEn ? 'Day 7' : 'दिवस ७'}
                  className="w-full h-64 object-cover rounded-2xl border-2 border-emerald-400"
                />
                <p className="text-slate-500 text-[11px]">{isEn ? 'Symptom arrested with healthy fresh boll growth.' : 'निरोगी नवीन बोंड वाढीसह लक्षणे थांबली.'}</p>
              </div>
            </div>
          </div>

          {/* Comparison Info */}
          <div className="pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <strong>{isEn ? 'Day 0 Severity:' : 'दिवस ० तीव्रता:'}</strong> 32%<br/>
                <strong>{isEn ? 'Day 7 Severity:' : 'दिवस ७ तीव्रता:'}</strong> 14%<br/>
                <strong>{isEn ? 'Improvement:' : 'सुधारणा:'}</strong> 56%
              </div>
              <div>
                <strong>{isEn ? 'Treatment Outcome:' : 'उपचार निकाल:'}</strong> {isEn ? 'IMPROVING' : 'सुधारत आहे'}<br/>
                <strong>{isEn ? 'Recovery Status:' : 'सुधारणा स्थिती:'}</strong> RECOVERY_CONFIRMED_HEALING<br/>
                <strong>{isEn ? 'Yield Impact:' : 'उत्पादन प्रभाव:'}</strong> INR 42,500 {isEn ? 'saved' : 'बचत'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: GOVT SCHEMES, MANDI RATES & 24x7 HELPLINE                           */}
      {/* ========================================================================= */}
      {activeTab === 'schemes' && (
        <div className="space-y-6">
          
          {/* Schemes Sub-Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'schemes', icon: Landmark, label: isEn ? 'Government Schemes' : 'सरकारी योजना' },
              { id: 'markets', icon: TrendingUp, label: isEn ? 'Today Mandi Rates' : 'आजचे मंडी भाव' },
              { id: 'helpline', icon: PhoneCall, label: isEn ? '24x7 Helplines' : 'हेल्पलाईन नंबर' },
              { id: 'tips', icon: Lightbulb, label: isEn ? 'Smart Spray Tips' : 'फवारणी सुरक्षा टिप्स' },
            ].map(sub => {
              const Icon = sub.icon;
              const isActive = extraTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setExtraTab(sub.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-view 1: Govt Schemes */}
          {extraTab === 'schemes' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-200">
                <span className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 border border-violet-200 flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{isEn ? 'Government Agriculture Schemes & Financial Subsidies' : 'शासकीय कृषी योजना व आर्थिक अनुदान'}</h3>
                  <p className="text-xs text-slate-500">{isEn ? 'Contact Krishi Sevak Anil Deshmukh for document submission and DBT assistance.' : 'कागदपत्रे सादर करण्यासाठी कृषी सेवक अनिल देशमुख यांच्याशी संपर्क साधा.'}</p>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { icon: Landmark, n: 'PM-KISAN Samman Nidhi', d: isEn ? '₹2,000 every 4 months (₹6,000/year) direct to bank' : 'दर ४ महिन्यांनी ₹२,००० (वर्षाला ₹६,०००) थेट बँक खात्यात' },
                  { icon: Wheat, n: 'PM Fasal Bima Yojana', d: isEn ? 'Crop insurance with just 1.5–2% farmer premium' : 'फक्त १.५-२% शेतकरी हप्त्यावर सर्वसमावेशक पीक विमा' },
                  { icon: FlaskConical, n: 'Soil Health Card Scheme', d: isEn ? 'Free soil testing every 2 years with custom nutrient advice' : 'दर २ वर्षांनी मोफत माती परीक्षण व खत मात्रा सल्ला' },
                  { icon: CreditCard, n: 'Kisan Credit Card (KCC)', d: isEn ? 'Subsidized crop production loans at 4% effective interest' : '४% सवलतीच्या व्याजदरावर पीक कर्ज सुविधा' },
                  { icon: SunMedium, n: 'PM-KUSUM Solar Pump Scheme', d: isEn ? 'Up to 60% capital subsidy on off-grid solar agri pumps' : 'कृषी सौर पंपावर ६०% पर्यंत शासकीय अनुदान' },
                  { icon: ShieldAlert, n: 'PM Kisan Maandhan Yojana', d: isEn ? 'Assured ₹3,000/month social security pension after age 60' : 'वयाची ६० वर्षे पूर्ण झाल्यावर दरमहा ₹३,००० पेन्शन' },
                ].map(s => {
                  const SIcon = s.icon;
                  return (
                    <div key={s.n} className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                        <SIcon className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{s.n}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{s.d}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-view 2: Mandi Prices */}
          {extraTab === 'markets' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-200">
                <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{isEn ? "Today's APMC Mandi Benchmark Prices (Yavatmal Market)" : 'आजचे कृषी उत्पन्न बाजार समिती भाव (यवतमाळ बाजार)'}</h3>
                  <p className="text-xs text-slate-500">{isEn ? 'Live modal rates sourced from MSAMB & Agmarknet daily price bulletin.' : 'महाराष्ट्र राज्य कृषी पणन मंडळ दैनिक भाव सूचीनुसार.'}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { n: isEn ? 'Cotton (30mm)' : 'कापूस (मध्यम)', p: '₹7,150', q: isEn ? '/ quintal' : '/ क्विंटल' },
                    { n: isEn ? 'Soybean (Yellow)' : 'सोयाबीन (पिवळा)', p: '₹4,600', q: isEn ? '/ quintal' : '/ क्विंटल' },
                    { n: isEn ? 'Tur / Pigeonpea' : 'तूर (लाल)', p: '₹12,500', q: isEn ? '/ quintal' : '/ क्विंटल' },
                    { n: isEn ? 'Groundnut' : 'भुईमूग शेंग', p: '₹6,800', q: isEn ? '/ quintal' : '/ क्विंटल' },
                    { n: isEn ? 'Maize (Feed)' : 'मका', p: '₹2,310', q: isEn ? '/ quintal' : '/ क्विंटल' },
                    { n: isEn ? 'Gram / Chana' : 'चना / हरभरा', p: '₹6,200', q: isEn ? '/ quintal' : '/ क्विंटल' },
                  ].map(m => (
                    <div key={m.n} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                      <span className="text-[11px] font-bold text-slate-600 block truncate">{m.n}</span>
                      <div className="text-base font-black text-emerald-800">{m.p}</div>
                      <span className="text-[10px] text-slate-400 font-medium">{m.q}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-view 3: Helplines */}
          {extraTab === 'helpline' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-200">
                <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{isEn ? '24x7 Government Emergency & Farmer Helplines' : '२४x७ शासकीय शेतकरी मदत व आपत्कालीन क्रमांक'}</h3>
                  <p className="text-xs text-slate-500">{isEn ? 'Free toll-free assistance for agronomy advice, insurance claims, and distress support.' : 'पीक सल्ला, विमा दावे व मदतीसाठी मोफत टोल-फ्री क्रमांक.'}</p>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { n: isEn ? 'Kisan Call Centre (Govt of India)' : 'किसान कॉल सेंटर (भारत सरकार)', p: '1800-180-1551', d: isEn ? 'Toll-free 6 AM–10 PM in all Indian languages' : 'सकाळी ६ ते रात्री १० सर्व भारतीय भाषांत' },
                  { n: isEn ? 'PM-KISAN Central Helpline' : 'पीएम-किसान केंद्रीय हेल्पलाईन', p: '1800-115-526', d: isEn ? 'Installment payment & Aadhaar seed queries' : 'हप्ता जमा व आधार नोंदणी मदत' },
                  { n: isEn ? 'National Emergency Services' : 'राष्ट्रीय आपत्कालीन सेवा', p: '112', d: isEn ? 'Police, fire, ambulance all-in-one' : 'पोलीस, अग्नीशामक, रुग्णवाहिका' },
                  { n: isEn ? 'Maharashtra Agri Helpline' : 'महाराष्ट्र कृषी हेल्पलाईन', p: '1800-233-4000', d: isEn ? 'Department of Agriculture extension' : 'कृषी विभाग थेट शेतकरी सल्ला' },
                ].map(h => (
                  <div key={h.n} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-center">
                    <span className="text-xs font-bold text-slate-800 block truncate">{h.n}</span>
                    <a href={`tel:${h.p.replace(/[^0-9]/g, '')}`} className="text-lg font-black text-emerald-800 block hover:underline">
                      {h.p}
                    </a>
                    <span className="text-[10px] text-slate-500 block">{h.d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-view 4: Smart Spray Tips */}
          {extraTab === 'tips' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-200">
                <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{isEn ? 'CIBRC Certified Safe Chemical Spraying & Stewardship Guide' : 'CIBRC प्रमाणित सुरक्षित फवारणी व शेती मार्गदर्शक'}</h3>
                  <p className="text-xs text-slate-500">{isEn ? 'Standard operating protocols developed by MPKV Rahuri & VNMKV Parbhani.' : 'राहुरी व परभणी कृषी विद्यापीठांनी प्रमाणित केलेली मार्गदर्शक तत्वे.'}</p>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { d: isEn ? 'Install 5 pheromone traps per acre at crop canopy height; inspect every 2 days and replace lure every 21 days.' : 'पीक उंचीनुसार एकरी ५ कामगंध सापळे लावा; दर २ दिवसांनी तपासा व २१ दिवसांनी ल्यूर बदला.' },
                  { d: isEn ? 'Strictly observe Pre-Harvest Interval (PHI) of 14 days before harvest to prevent export rejection and toxic residues.' : 'विषारी अवशेष टाळण्यासाठी काढणीपूर्वी १४ दिवसांचा प्रतीक्षा कालावधी (PHI) काटेकोरपणे पाळा.' },
                  { d: isEn ? 'Rotate chemical classes with organic NSKE 5% or neem oil to break insecticidal resistance cycles.' : 'कीड प्रतिकारशक्ती रोखण्यासाठी रासायनिक फवारणीसोबत निंबोळी अर्क ५% ची आलटून-पालटून फवारणी करा.' },
                  { d: isEn ? 'Spray strictly in early morning (6–9 AM) or late afternoon (4–6 PM); avoid spraying under strong wind or rain.' : 'फवारणी फक्त सकाळी (६-९) किंवा दुपारी उशिरा (४-६) करा; पाऊस किंवा जोरदार वाऱ्यात फवारणी टाळा.' },
                  { d: isEn ? 'Always wear complete Personal Protective Equipment (PPE) including mask, nitrile gloves, and eye shield.' : 'फवारणी करताना नेहमी मास्क, रबरी हातमोजे आणि डोळ्यांचा गॉगल यासारखी सुरक्षा साधने वापरा.' },
                  { d: isEn ? 'Apply light morning irrigation — avoid waterlogging which triggers rapid fungal spore germination and root rot.' : 'सकाळी हलके पाणी द्या — शेतात पाणी साचू देऊ नका, यामुळे बुरशी रोग व मूळकूज वेगाने पसरते.' },
                ].map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{tip.d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
