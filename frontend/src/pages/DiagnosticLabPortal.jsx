import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, QrCode, FileText, CheckCircle2, AlertCircle, 
  Search, ShieldCheck, Microscope, PlusCircle, Check, X, 
  Layers, Clock, AlertTriangle, ArrowRight, ShieldAlert, Cpu, 
  Award, HelpCircle, ChevronRight, Database, Download, Bell, 
  Activity, Sliders, ChevronDown, Radio, ThumbsUp, RefreshCw,
  Camera, Eye, Lock, ArrowUpRight, CheckCircle, Printer, Scan,
  TestTube, Truck, FileCheck, ZoomIn, Maximize2, Image, ChevronLeft
} from 'lucide-react';
import { api } from '../services/api';
import { translations } from '../services/i18n';
import { SeverityBadge } from '../components/SeverityBadge';

export const DiagnosticLabPortal = ({ currentLang = 'en' }) => {
  const isEn = currentLang === 'en';

  const formatEntityName = (entity) => {
    if (!entity) return '';
    if (isEn) return entity.split('(')[0].trim();
    return entity;
  };

  // State
  const [labSamples, setLabSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'workbench', 'chain_of_custody', 'archive'
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'URGENT', 'AWAITING_INTAKE', 'TESTING', 'PUBLISHED', 'REJECTED'
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
  const [expandedPhoto, setExpandedPhoto] = useState(null); // { url, title, angle, desc, index }

  // Scanner Simulator Modal
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannedInput, setScannedInput] = useState('');

  // Intake Checklist State
  const [intakePackaging, setIntakePackaging] = useState('INTACT');
  const [intakeLabel, setIntakeLabel] = useState('CORRECT');
  const [intakeQuantity, setIntakeQuantity] = useState('SUFFICIENT');
  const [intakeContamination, setIntakeContamination] = useState('NONE');
  const [intakeCondition, setIntakeCondition] = useState('ACCEPTABLE');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessingIntake, setIsProcessingIntake] = useState(false);

  // Testing Studio State
  const [activeAssayType, setActiveAssayType] = useState('Microscopy'); // 'Microscopy', 'Molecular/PCR', 'Culture'
  const [testTarget, setTestTarget] = useState('Pectinophora gossypiella Larval Morphology');
  const [testResult, setTestResult] = useState('POSITIVE');
  const [testObservation, setTestObservation] = useState('Distinct larval mouthparts, dorsal pink banding, and spiracular rings verified under 400x magnification.');
  const [ctValue, setCtValue] = useState(22.4);
  const [magnification, setMagnification] = useState('400x Brightfield');
  const [testReference, setTestReference] = useState('PCR-MH-2026-981');
  const [micrographUrl, setMicrographUrl] = useState('');
  const [isRecordingTest, setIsRecordingTest] = useState(false);

  // Publishing Report State
  const [reportFinding, setReportFinding] = useState('CONFIRMED');
  const [confirmedEntity, setConfirmedEntity] = useState('');
  const [testSummary, setTestSummary] = useState('');
  const [pathologistRemarks, setPathologistRemarks] = useState('');
  const [certifyingScientist, setCertifyingScientist] = useState('Dr. Anant Deshpande (Lead Pathologist, ICAR-CICR / ISO-17025)');
  const [isPublishingReport, setIsPublishingReport] = useState(false);

  useEffect(() => {
    loadLabData();
  }, []);

  const loadLabData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLabSamples('DIAGNOSTIC_LAB', 'lab_404');
      setLabSamples(data || []);
      if (data && data.length > 0) {
        if (!selectedSample) {
          setSelectedSample(data[0]);
          initializeFormFields(data[0]);
        } else {
          const current = data.find(s => s.sample_id === selectedSample.sample_id) || data[0];
          setSelectedSample(current);
          initializeFormFields(current);
        }
      }
    } catch (err) {
      console.error("Lab data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSampleFieldPhotos = (sample) => {
    if (!sample) return [];
    const photos = [];
    
    // 1. Farmer's Initial Submission Photo
    const farmerPhotoUrl = sample.case_image_url || (
      sample.crop?.toLowerCase().includes('cotton')
        ? 'https://images.unsplash.com/photo-1599818434736-2311f6c770c3?auto=format&fit=crop&w=800&q=80'
        : sample.crop?.toLowerCase().includes('soybean')
        ? 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80'
    );
    
    photos.push({
      url: farmerPhotoUrl,
      title: isEn ? '1. Farmer Initial Submission' : '१. शेतकऱ्याचे मूळ छायाचित्र',
      angle: isEn ? 'Symptom Overview' : 'प्रादुर्भाव दृश्य',
      tag: 'FARMER_PORTAL',
      badgeColor: 'bg-amber-900/80 text-amber-200 border-amber-700',
      desc: isEn ? `Initial symptom capture by ${sample.farmer_name} at ${sample.village || 'Farm'}` : `शेतकरी ${sample.farmer_name} यांनी नोंदवलेले छायाचित्र`
    });

    // 2. Krishi Sevak 4-Angle Ground Verification Photos
    const fieldPhotoUrls = (sample.field_photos && sample.field_photos.length > 0)
      ? sample.field_photos
      : [
          sample.crop?.toLowerCase().includes('cotton') 
            ? 'https://images.unsplash.com/photo-1599818434736-2311f6c770c3?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80'
        ];

    const angleMeta = isEn ? [
      { title: '2. Leaf Surface (Abaxial / Adaxial)', angle: 'Leaf Macro', desc: 'Foliage lesion & pustule distribution' },
      { title: '3. Stem & Node Dissection', angle: 'Stem Anatomy', desc: 'Vascular discolouration & entrance holes' },
      { title: '4. Fruit / Boll Core Dissection', angle: 'Boll Dissection', desc: 'Internal larval feeding, frass & seed damage' },
      { title: '5. Whole Crop Canopy Context', angle: 'Canopy Scope', desc: 'Field-scale wilt, chlorosis & spatial cluster' }
    ] : [
      { title: '२. पानाची वरची/खालची बाजू', angle: 'पान मॅक्रो', desc: 'पानावरील डाग व बुरशी बीजाणू' },
      { title: '३. खोड व फांदी छेद', angle: 'खोड तपासणी', desc: 'खोडातील अंतर्गत कीड व सुरळी' },
      { title: '४. बोंड/फळ अंतर्गत छेद', angle: 'बोंड अंतर्गत तपासणी', desc: 'बोंडातील अळीची विष्ठा व बियांचे नुकसान' },
      { title: '५. संपूर्ण पीक परिसर', angle: 'संपूर्ण पीक', desc: 'शेतातील रोगाचा एकूण प्रसार व तीव्रता' }
    ];

    fieldPhotoUrls.forEach((url, idx) => {
      const meta = angleMeta[idx] || {
        title: isEn ? `Field Photo #${idx + 2}` : `क्षेत्रीय छायाचित्र #${idx + 2}`,
        angle: isEn ? `Angle #${idx + 2}` : `कोण #${idx + 2}`,
        desc: isEn ? 'Macro field ground inspection photo' : 'क्षेत्रीय तपासणी छायाचित्र'
      };
      photos.push({
        url,
        title: meta.title,
        angle: meta.angle,
        tag: 'KRISHI_SEVAK_4_ANGLE',
        badgeColor: 'bg-emerald-900/80 text-emerald-200 border-emerald-700',
        desc: `${meta.desc} (${sample.collected_by || 'Krishi Sevak'})`
      });
    });

    return photos;
  };

  const getCandidateEntities = (sample) => {
    if (!sample) return [];
    const text = sample.suspected_pathogen || '';
    if (text.includes('vs')) {
      return text.split('vs').map(item => item.trim());
    }
    if (sample.crop?.toLowerCase().includes('cotton')) {
      return ['Cotton Pink Bollworm (गुलाबी बोंडअळी)', 'American Bollworm (अमेरिकन बोंडअळी)', 'Spotted Bollworm (ठिपकेवाली बोंडअळी)'];
    }
    if (sample.crop?.toLowerCase().includes('soybean')) {
      return ['Soybean Rust (तांबेरा रोग)', 'Cercospora Leaf Spot (करपा)', 'Anthracnose Pod Blight (अँथ्रॅक्नोज)'];
    }
    if (sample.crop?.toLowerCase().includes('tomato')) {
      return ['Tomato Late Blight (करपा)', 'Early Blight (अल्टरनेरिया)', 'Bacterial Canker (जिवाणू रोग)'];
    }
    return [sample.suspected_pathogen];
  };

  const initializeFormFields = (spl) => {
    if (!spl) return;
    const candidates = getCandidateEntities(spl);
    const primaryChoice = candidates.length > 0 ? candidates[0] : formatEntityName(spl.suspected_pathogen);
    setConfirmedEntity(primaryChoice);
    setTestTarget(`${primaryChoice} Specific Markers`);
    setTestSummary(`Microscopy (400x) and Molecular PCR assay performed against standard ISO-17025 protocol.`);
    setPathologistRemarks(`Microbiological and morphological diagnostic assay verified presence of ${primaryChoice}. Ground truth confirmed under ISO-17025.`);
  };

  const handleSelectSample = (spl) => {
    setSelectedSample(spl);
    initializeFormFields(spl);
    setActionSuccessMsg(null);
  };

  // 1. Submit Sample Intake (Accept / Reject)
  const handleIntakeSubmit = async (action) => {
    if (!selectedSample) return;
    setIsProcessingIntake(true);
    setActionSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('packaging', intakePackaging);
      formData.append('label', intakeLabel);
      formData.append('quantity', intakeQuantity);
      formData.append('contamination', intakeContamination);
      formData.append('condition', intakeCondition);
      formData.append('action', action);
      if (action === 'REJECT') {
        formData.append('rejection_reason', rejectionReason || 'Sample degraded/damaged upon intake.');
      }

      await api.intakeLabSample(selectedSample.sample_id, formData);
      setActionSuccessMsg(
        action === 'ACCEPT'
          ? (isEn ? `✓ Sample #${selectedSample.sample_id} Accepted & Intake Logged into Chain of Custody!` : `✓ नमुना #${selectedSample.sample_id} स्वीकारला व चाचणी कक्षेत घेतला!`)
          : (isEn ? `⚠️ Sample #${selectedSample.sample_id} Rejected. Physical recollection dispatched to Krishi Sevak.` : `⚠️ नमुना नाकारला. कृषी सेवकास पुनर्संकलनाची मागणी पाठवली.`)
      );
      await loadLabData();
    } catch (err) {
      console.error("Intake error:", err);
      alert(isEn ? "Failed to process sample intake." : "नमुना नोंदणीत त्रुटी आली.");
    } finally {
      setIsProcessingIntake(false);
    }
  };

  // 2. Submit Physical Test Record (Microscopy / PCR / Culture)
  const handleRecordTest = async (e) => {
    if (e) e.preventDefault();
    if (!selectedSample) return;
    setIsRecordingTest(true);
    setActionSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('test_type', activeAssayType);
      formData.append('target_organism', testTarget);
      formData.append('result', testResult);
      formData.append('observation', testObservation);
      if (activeAssayType === 'Molecular/PCR') {
        formData.append('ct_value', ctValue.toString());
        formData.append('test_reference', testReference);
      } else if (activeAssayType === 'Microscopy') {
        formData.append('magnification', magnification);
        formData.append('micrograph_url', micrographUrl);
      }

      await api.recordLabTest(selectedSample.sample_id, formData);
      setActionSuccessMsg(
        isEn 
          ? `✓ ${activeAssayType} Assay (${testResult}) recorded for Sample #${selectedSample.sample_id}!` 
          : `✓ ${activeAssayType} चाचणी निकाल यशस्वीरीत्या नोंदवला!`
      );
      await loadLabData();
    } catch (err) {
      console.error("Record test error:", err);
      alert(isEn ? "Failed to record lab test." : "चाचणी निकाल नोंदवण्यात त्रुटी आली.");
    } finally {
      setIsRecordingTest(false);
    }
  };

  // 3. Publish & Lock Official Pathology Report
  const handlePublishReport = async (e) => {
    if (e) e.preventDefault();
    if (!selectedSample) return;
    setIsPublishingReport(true);
    setActionSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('finding', reportFinding);
      formData.append('confirmed_entity', confirmedEntity);
      formData.append('test_summary', testSummary);
      formData.append('pathologist_remarks', pathologistRemarks);
      formData.append('certifying_scientist', certifyingScientist);

      await api.publishLabReport(selectedSample.sample_id, formData);
      setActionSuccessMsg(
        isEn 
          ? `🔒 Official Pathology Report Published & Locked (V${(selectedSample.report_version || 0) + 1}) for Sample #${selectedSample.sample_id}! Synced with Agri Expert & State Surveillance.` 
          : `🔒 अधिकृत पॅथॉलॉजी अहवाल प्रमाणित करून लॉक केला! तज्ज्ञ व शासन प्रणालीशी जोडला गेला.`
      );
      await loadLabData();
      setActiveTab('archive');
    } catch (err) {
      console.error("Publish report error:", err);
      alert(isEn ? "Failed to publish lab report." : "अहवाल प्रमाणित करण्यात त्रुटी आली.");
    } finally {
      setIsPublishingReport(false);
    }
  };

  // Simulate Scanning QR
  const handleScanSample = (sampleId) => {
    const target = labSamples.find(s => s.sample_id === sampleId || s.referral_id === sampleId);
    if (target) {
      setSelectedSample(target);
      initializeFormFields(target);
      setShowScannerModal(false);
      setActiveTab('workbench');
      setActionSuccessMsg(isEn ? `📷 QR Scan Verified: Sample #${target.sample_id} retrieved!` : `📷 QR स्कॅन यशस्वी: नमुना #${target.sample_id} लोड झाला!`);
    } else {
      alert(isEn ? `Sample with ID ${sampleId} not found in lab manifest.` : `नमुना आढळला नाही.`);
    }
  };

  // Filter Samples Queue
  const filteredSamples = labSamples.filter(s => {
    if (filterStatus === 'URGENT') return s.priority === 'URGENT';
    if (filterStatus === 'AWAITING_INTAKE') return s.status === 'AWAITING_INTAKE' || s.status === 'DISPATCHED';
    if (filterStatus === 'TESTING') return s.status === 'RECEIVED' || s.status === 'TESTING_IN_PROGRESS';
    if (filterStatus === 'PUBLISHED') return s.status === 'REPORT_ISSUED';
    if (filterStatus === 'REJECTED') return s.status === 'REJECTED';
    return true;
  });

  // Calculate Header Metrics
  const pendingCount = labSamples.filter(s => s.status !== 'REPORT_ISSUED' && s.status !== 'REJECTED').length || 12;
  const receivedTodayCount = labSamples.filter(s => s.status === 'RECEIVED' || s.status === 'TESTING_IN_PROGRESS').length || 8;
  const inTestingCount = labSamples.filter(s => s.status === 'TESTING_IN_PROGRESS').length || 5;
  const reportsPendingCount = labSamples.filter(s => s.status === 'TESTING_IN_PROGRESS' || s.tests_performed?.length > 0).length || 7;
  const urgentCount = labSamples.filter(s => s.priority === 'URGENT').length || 2;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* 1. TOP SCIENTIFIC LABORATORY HERO BANNER */}
      <section className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-purple-500/20 relative overflow-hidden space-y-4">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-purple-600/30 text-purple-300 rounded-2xl border border-purple-400/30 shadow-inner">
              <FlaskConical className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-purple-500/30 text-purple-200 border border-purple-400/40 px-2.5 py-0.5 rounded-full">
                  {isEn ? 'ROLE 4 — DIAGNOSTIC LABORATORY (वैज्ञानिक रोगनिदान प्रयोगशाळा)' : 'भूमिका 4 — रोग निदान प्रयोगशाला'}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {isEn ? 'ISO-17025 & NABL Accredited' : 'ISO-17025 व NABL प्रमाणित'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                {isEn ? 'Regional Plant Pathology & Molecular Diagnostic Laboratory' : 'क्षेत्रीय पादप रोग निदान व आण्विक प्रयोगशाला'}
              </h1>
              <p className="text-xs text-purple-200/90 font-medium">
                {isEn ? 'ICAR-CICR Nagpur & Central Vidarbha Reference Centre • Specimen Intake, PCR Assays, ELISA & Immutable Pathology Records' : 'ICAR-CICR नागपूर व मध्य विदर्भ संदर्भ केंद्र • नमुना ग्रहण, PCR परीक्षण, ELISA व रोग निदान अभिलेख'}
              </p>
            </div>
          </div>

          {/* Quick Action Button: Scan QR */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowScannerModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black px-4 py-2.5 rounded-2xl shadow-lg border border-purple-400/40 text-xs flex items-center gap-2 transition"
            >
              <Scan className="w-4 h-4" />
              <span>{isEn ? '📷 Scan Physical Sample QR' : '📷 नमुना QR स्कॅन करा'}</span>
            </button>
          </div>
        </div>

        {/* RBAC Access & Scientific Mandate */}
        <div className="bg-purple-950/70 border border-purple-500/30 p-3 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 text-purple-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>{isEn ? 'Scientific Confirmation Layer:' : 'वैज्ञानिक पुष्टि स्तर:'}</strong> {isEn ? 'Authorized to scan QR codes, verify specimen condition, execute Microscopy / PCR / Culture assays, and publish immutable certified pathology reports.' : 'QR कोड स्कैन करने, नमूने की स्थिति जाँचने, सूक्ष्मदर्शी / PCR / संवर्धन परीक्षण करने तथा प्रमाणित रोग निदान रिपोर्ट जारी करने की अनुमति है।'}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">
            {isEn ? 'Facility: MH-LAB-NAGPUR-01 • Auth: DIAGNOSTIC_LAB' : 'केंद्र: MH-LAB-NAGPUR-01 • अनुमति: DIAGNOSTIC_LAB'}
          </div>
        </div>
      </section>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'queue' 
              ? 'bg-purple-700 text-white shadow-sm' 
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isEn ? '1. Sample Queue & QR Intake' : '१. प्राप्त नमुने व QR नोंदणी'}</span>
          <span className="bg-purple-100 text-purple-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
            {labSamples.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('workbench')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'workbench' 
              ? 'bg-purple-700 text-white shadow-sm' 
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Microscope className="w-4 h-4 text-purple-300" />
          <span>{isEn ? '2. Scientific Testing & Pathology Workbench' : '२. प्रयोगशाळा चाचण्या व विश्लेषण'}</span>
        </button>

        <button
          onClick={() => setActiveTab('chain_of_custody')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'chain_of_custody' 
              ? 'bg-purple-700 text-white shadow-sm' 
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4 text-amber-500" />
          <span>{isEn ? '3. Immutable Chain of Custody & QR Studio' : '३. नमुना हस्तांतरण साखळी व QR'}</span>
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'archive' 
              ? 'bg-purple-700 text-white shadow-sm' 
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>{isEn ? '4. Certified Pathology Archive & Version Locking' : '४. प्रमाणित अहवाल व आवृत्ती लॉकिंग'}</span>
        </button>
      </div>

      {/* 5 LIVE METRICS COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border-2 border-purple-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-purple-700 block tracking-wider">
              {isEn ? '📥 Pending Samples' : '📥 लंबित नमूने'}
            </span>
            <span className="text-xl font-black text-purple-950 mt-0.5 block">{pendingCount}</span>
            <span className="text-[10px] text-slate-500">{isEn ? 'Awaiting Lab Queue' : 'प्रयोगशाला लाइन में प्रतीक्षा'}</span>
          </div>
          <Layers className="w-6 h-6 text-purple-500 opacity-80" />
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-indigo-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-indigo-700 block tracking-wider">
              {isEn ? '📦 Received Today' : '📦 आज प्राप्त नमूने'}
            </span>
            <span className="text-xl font-black text-indigo-950 mt-0.5 block">{receivedTodayCount}</span>
            <span className="text-[10px] text-slate-500">{isEn ? 'QR Intakes Logged' : 'QR नमूना ग्रहण दर्ज'}</span>
          </div>
          <CheckCircle className="w-6 h-6 text-indigo-500 opacity-80" />
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-amber-700 block tracking-wider">
{isEn ? '🔬 In Testing' : '🔬 परीक्षण में'}
            </span>
            <span className="text-xl font-black text-amber-950 mt-0.5 block">{inTestingCount}</span>
            <span className="text-[10px] text-slate-500">{isEn ? 'Microscopy / PCR' : 'सूक्ष्मदर्शी / PCR'}</span>
          </div>
          <FlaskConical className="w-6 h-6 text-amber-500 opacity-80" />
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-blue-700 block tracking-wider">
              {isEn ? '📄 Reports Pending' : '📄 लंबित रिपोर्ट'}
            </span>
            <span className="text-xl font-black text-blue-950 mt-0.5 block">{reportsPendingCount}</span>
            <span className="text-[10px] text-slate-500">{isEn ? 'Awaiting Certification' : 'प्रमाणपत्र की प्रतीक्षा'}</span>
          </div>
          <FileText className="w-6 h-6 text-blue-500 opacity-80" />
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-rose-700 block tracking-wider">
              {isEn ? '🚨 Urgent Outbreak' : '🚨 त्वरित प्रकोप'}
            </span>
            <span className="text-xl font-black text-rose-950 mt-0.5 block">{urgentCount}</span>
            <span className="text-[10px] text-slate-500">{isEn ? 'Turnaround < 12h' : 'रिपोर्ट समय < 12h'}</span>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-500 opacity-80" />
        </div>
      </div>

      {/* SUCCESS ACTION BANNER */}
      {actionSuccessMsg && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-md text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-bold">{actionSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setActionSuccessMsg(null)}
            className="text-white hover:text-emerald-100 font-bold px-2 py-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: SAMPLE QUEUE & QR INTAKE */}
      {/* ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: SAMPLE MANIFEST QUEUE (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  {isEn ? 'Diagnostic Sample Manifest' : 'प्राप्त नमुना सूची'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isEn ? 'Filter by urgency, testing phase, and intake status' : 'प्राधान्य व टप्प्यानुसार फिल्टर'}
                </p>
              </div>
              <button
                onClick={() => setShowScannerModal(true)}
                className="bg-purple-100 text-purple-900 font-bold px-2.5 py-1 rounded-xl text-xs hover:bg-purple-200 transition flex items-center gap-1"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>{isEn ? 'QR Scan' : 'QR स्कैन'}</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                { id: 'ALL', label: isEn ? 'All' : 'सर्व' },
                { id: 'URGENT', label: isEn ? '🔴 Urgent (2)' : '🔴 त्वरित (2)' },
                { id: 'AWAITING_INTAKE', label: isEn ? '📦 Awaiting' : '📦 प्रतीक्षा में' },
                { id: 'TESTING', label: isEn ? '🔬 In Testing' : '🔬 परीक्षण में' },
                { id: 'PUBLISHED', label: isEn ? '✓ Certified' : '✓ प्रमाणित' },
                { id: 'REJECTED', label: isEn ? '❌ Rejected' : '❌ अस्वीकृत' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    filterStatus === tab.id 
                      ? 'bg-purple-700 text-white shadow-sm' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Samples List */}
            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
              {filteredSamples.map(spl => {
                const isSelected = selectedSample?.sample_id === spl.sample_id;
                const isUrgent = spl.priority === 'URGENT';

                return (
                  <div
                    key={spl.sample_id}
                    onClick={() => handleSelectSample(spl)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition text-xs space-y-2.5 relative ${
                      isSelected 
                        ? 'border-purple-600 ring-2 ring-purple-500/40 bg-purple-50/50 shadow-md' 
                        : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-purple-950 text-xs">#{spl.sample_id}</span>
                          {isUrgent && (
                            <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                              {isEn ? 'URGENT' : 'त्वरित'}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">({spl.referral_id})</span>
                        </div>
                        <span className="text-slate-700 font-bold block text-xs mt-0.5">
                          {isEn ? spl.farmer_name?.split('(')[0]?.trim() : spl.farmer_name} • {spl.taluka || 'Darwha'}, {spl.district}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        spl.status === 'REPORT_ISSUED' ? 'bg-emerald-100 text-emerald-800' :
                        spl.status === 'TESTING_IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                        spl.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {spl.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{isEn ? 'Crop / Plant Part:' : 'फसल / पौधा भाग:'}</span>
                        <strong className="text-slate-900">{spl.crop} — {spl.plant_part || 'Boll/Leaf'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{isEn ? 'Suspected:' : 'संदिग्ध:'}</span>
                        <strong className="text-purple-900 truncate max-w-[190px]">{formatEntityName(spl.suspected_pathogen)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>{isEn ? 'Collected by: ' : 'संग्रहकर्ता: '}<strong>{spl.collected_by?.split('(')[0]?.trim() || (isEn ? 'Krishi Sevak' : 'कृषि सेवक')}</strong></span>
                      <span className="font-mono">{spl.dispatch_date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: SAMPLE INTAKE VERIFICATION & DETAILS (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {selectedSample ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">
                        {isEn ? 'SAMPLE INTAKE INSPECTION' : 'नमूना ग्रहण निरीक्षण'}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {isEn ? 'Case: #' : 'मामला: #'}{selectedSample.case_id}
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-slate-900 mt-1">
                      {isEn ? 'Sample #' : 'नमुना #'}{selectedSample.sample_id} ({selectedSample.crop} — {formatEntityName(selectedSample.suspected_pathogen)})
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isEn ? 'Referral ID: ' : 'संदर्भ आईडी: '}<strong>{selectedSample.referral_id || 'LR-MH-2026-000183'}</strong>{isEn ? ' • Destination: ' : ' • गंतव्य: '}<strong>{selectedSample.lab_name}</strong>
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    selectedSample.status === 'REPORT_ISSUED' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    selectedSample.status === 'TESTING_IN_PROGRESS' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                    'bg-purple-50 text-purple-800 border-purple-300'
                  }`}>
                    {selectedSample.status}
                  </span>
                </div>

                {/* Agronomic & Origin Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{isEn ? 'Farmer' : 'किसान'}</span>
                    <strong className="text-slate-900 block mt-0.5">{isEn ? selectedSample.farmer_name?.split('(')[0]?.trim() : selectedSample.farmer_name}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{isEn ? 'Location' : 'स्थान'}</span>
                    <strong className="text-slate-900 block mt-0.5">{selectedSample.village || 'Zadgaon'}, {selectedSample.district}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{isEn ? 'Collected On' : 'संग्रह तिथि'}</span>
                    <strong className="text-slate-900 block mt-0.5">{selectedSample.collection_time || '05 Sept 2026 — 10:42 AM'}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{isEn ? 'Priority' : 'प्राथमिकता'}</span>
                    <strong className={`block mt-0.5 ${selectedSample.priority === 'URGENT' ? 'text-rose-700' : 'text-indigo-900'}`}>
                      {selectedSample.priority} ({selectedSample.priority === 'URGENT' ? (isEn ? '<12h Turnaround' : '12 घंटे से कम रिपोर्ट') : (isEn ? '24h Standard' : '24 घंटे मानक')})
                    </strong>
                  </div>
                </div>

                {/* Reason for Referral */}
                <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-xs space-y-1">
                  <span className="font-extrabold text-amber-900 uppercase text-[10px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    {isEn ? 'Specialist Referral Justification (Dr. Sunita Kulkarni)' : 'विशेषज्ञ संदर्भ का कारण (Dr. Sunita Kulkarni)'}
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    "{selectedSample.referral_reason || (isEn ? 'Visual field diagnosis inconclusive. Requires molecular PCR testing & larval dissection to confirm Pink Bollworm vs American Bollworm.' : 'खेत में दृश्य निदान स्पष्ट नहीं। Pink Bollworm तथा American Bollworm की पुष्टि हेतु PCR परीक्षण व अळी विच्छेदन आवश्यक।')}"
                  </p>
                </div>

                {/* CASE FIELD DIGITAL EVIDENCE & 4-ANGLE MACRO PHOTOS */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3 border border-slate-800 shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-amber-200 block">
                          {isEn ? 'Case Field Macro Evidence & 4-Angle Ground Photos' : 'केस क्षेत्रीय छायाचित्रे व ४-कोन पुरावे'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {isEn ? 'Cross-reference digital field photos with received physical specimen' : 'प्रत्यक्ष नमुन्यासोबत क्षेत्रीय छायाचित्रांची पडताळणी करा'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-950 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-800 flex items-center gap-1">
                        <Image className="w-3 h-3 text-amber-400" />
                        {getSampleFieldPhotos(selectedSample).length} {isEn ? 'Photos' : 'छायाचित्रे'}
                      </span>
                      <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-full">
                        #{selectedSample.case_id}
                      </span>
                    </div>
                  </div>

                  {/* Field Officer Ground Observation Note */}
                  {selectedSample.officer_observation && (
                    <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                      <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 font-bold">
                          {isEn ? 'Field Officer Observation:' : 'कृषी सेवक प्रत्यक्ष पाहणी नोंद:'}
                        </strong>{' '}
                        <span>"{selectedSample.officer_observation}"</span>
                        {selectedSample.trap_count && (
                          <span className="ml-2 font-mono text-rose-300 font-bold">
                            {isEn ? '(Pheromone Trap: ' : '(फेरोमोन जाल: '}{selectedSample.trap_count}{isEn ? ' moths/night)' : ' पतंग/रात)'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Photos Grid with Click-to-Zoom */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {getSampleFieldPhotos(selectedSample).map((photo, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setExpandedPhoto({ ...photo, index: pIdx, allPhotos: getSampleFieldPhotos(selectedSample) })}
                        className="group bg-slate-950 rounded-xl overflow-hidden border border-slate-800 hover:border-amber-400/80 transition-all cursor-pointer relative shadow-sm flex flex-col justify-between"
                      >
                        <div className="aspect-square w-full relative overflow-hidden bg-slate-900">
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white font-bold text-[10px]">
                            <ZoomIn className="w-4 h-4 text-amber-300" />
                            <span>{isEn ? 'Inspect' : 'मोठे करा'}</span>
                          </div>
                          <span className={`absolute top-1 left-1 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${photo.badgeColor}`}>
                            {photo.angle}
                          </span>
                        </div>
                        <div className="p-2 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-200 truncate group-hover:text-amber-300 transition-colors">
                            {photo.title}
                          </div>
                          <div className="text-[9px] text-slate-400 line-clamp-1">
                            {photo.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PHYSICAL SPECIMEN LOGISTICS & CHAIN-OF-CUSTODY MANIFEST */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3.5 border border-slate-800 shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-purple-200">
                        {isEn ? 'Physical Specimen Receipt & Cold-Chain Manifest' : 'प्रत्यक्ष नमुना पावती व शीतसाखळी तपशील'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {isEn ? 'Seal: #SEAL-9842 (Intact)' : 'सील: #SEAL-9842 (अखंड)'}
                      </span>
                      <span className="bg-blue-950 text-blue-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-blue-700">
                        {isEn ? 'Cold-Chain: 4.2°C (PASS)' : 'शीत श्रृंखला: 4.2°C (पास)'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                        {isEn ? 'Excised Botanical Material' : 'काढलेला वनस्पती नमुना'}
                      </span>
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <TestTube className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{selectedSample.plant_part || (isEn ? 'Excised Boll & Floral Tissue' : 'निकाला गया बोंड व पुष्प ऊतक')}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {isEn ? 'Qty: 5 specimen units in sterile buffer vial' : 'मात्रा: कीटाणुरहित बफर शीशी में 5 नमूना इकाइयाँ'}
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                        {isEn ? 'Logistics & Dispatch Box' : 'वाहतूक व शीतपेटी क्र.'}
                      </span>
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{isEn ? 'Cold-Box Unit #CC-409' : 'शीतपेटी इकाई #CC-409'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {isEn ? 'Temp Range: 2.0°C – 8.0°C (Datalogger Verified)' : 'तापमान सीमा: 2.0°C – 8.0°C (डाटालॉगर सत्यापित)'}
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                        {isEn ? 'Harvesting Field Officer' : 'नमुना संकलक कृषी सेवक'}
                      </span>
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{isEn ? 'Anil S. Deshmukh (KS-4832)' : 'Anil S. Deshmukh (KS-4832)'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {isEn ? 'Darwha Agronomic Circle, Yavatmal' : 'Darwha कृषि क्षेत्र, Yavatmal'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-900/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-purple-200 font-medium flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                      {isEn ? 'Physical Chain of Custody Tag: ' : 'प्रत्यक्ष हस्तांतरण टैग: '}<strong className="text-white font-mono">{selectedSample.sample_id}</strong>
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {isEn ? 'Storage Location: Cryo-Rack B4 (-20°C / Sample Vault #2)' : 'संग्रह स्थान: Cryo-Rack B4 (-20°C / नमूना कक्ष #2)'}
                    </span>
                  </div>
                </div>

                {/* 8. SAMPLE INTAKE CONDITION CHECKLIST */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-black text-slate-900 text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      {isEn ? 'Sample Physical Intake & Condition Protocol' : 'नमुना प्रत्यक्ष तपासणी व स्वीकृती'}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">ISO-17025 Section 7.4</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Packaging */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">{isEn ? 'Packaging (पॅकेजिंग):' : 'पॅकेजिंग:'}</label>
                      <select
                        value={intakePackaging}
                        onChange={(e) => setIntakePackaging(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                      >
                        <option value="INTACT">{isEn ? '✓ Intact & Sealed (अखंड व सील)' : '✓ अखंड व सीलयुक्त'}</option>
                        <option value="DAMAGED">{isEn ? '❌ Damaged / Leaking (खराब/गळती)' : '❌ खराब / गळती'}</option>
                      </select>
                    </div>

                    {/* Label */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">{isEn ? 'Label / QR (लेबल/QR):' : 'लेबल / QR:'}</label>
                      <select
                        value={intakeLabel}
                        onChange={(e) => setIntakeLabel(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                      >
                        <option value="CORRECT">{isEn ? '✓ Correct & Legible (योग्य)' : '✓ योग्य व स्पष्ट'}</option>
                        <option value="MISMATCHED">{isEn ? '❌ Mismatched / Illegible (अयोग्य)' : '❌ अयोग्य / अस्पष्ट'}</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">{isEn ? 'Quantity (प्रमाण):' : 'प्रमाण:'}</label>
                      <select
                        value={intakeQuantity}
                        onChange={(e) => setIntakeQuantity(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                      >
                        <option value="SUFFICIENT">{isEn ? '✓ Sufficient for Assays (पुरेसे)' : '✓ परीक्षण के लिए पर्याप्त'}</option>
                        <option value="INSUFFICIENT">{isEn ? '❌ Insufficient (अपुरे)' : '❌ अपर्याप्त'}</option>
                      </select>
                    </div>

                    {/* Contamination */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">{isEn ? 'Contamination (दूषितीकरण):' : 'दूषितीकरण:'}</label>
                      <select
                        value={intakeContamination}
                        onChange={(e) => setIntakeContamination(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                      >
                        <option value="NONE">{isEn ? '✓ No Contamination (नाही)' : '✓ कोई दूषितीकरण नहीं'}</option>
                        <option value="VISIBLE_DECAY">{isEn ? '❌ Severe Saprophytic Decay (बुरशी)' : '❌ गंभीर बुरशी दूषण'}</option>
                      </select>
                    </div>

                    {/* Overall Condition */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">{isEn ? 'Overall Condition (स्थिती):' : 'एकूण स्थिती:'}</label>
                      <select
                        value={intakeCondition}
                        onChange={(e) => setIntakeCondition(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                      >
                        <option value="ACCEPTABLE">{isEn ? '✓ Acceptable for Pathology & Molecular Assay' : '✓ रोग निदान व आण्विक परीक्षण हेतु योग्य'}</option>
                        <option value="DEGRADED">{isEn ? '❌ Degraded / Sub-standard (Recollection Needed)' : '❌ खराब / निम्न स्तर (पुनः संग्रह आवश्यक)'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Intake Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleIntakeSubmit('ACCEPT')}
                      disabled={isProcessingIntake}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-xl shadow transition flex items-center gap-1.5 text-xs disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{isProcessingIntake ? (isEn ? 'Processing...' : 'प्रक्रिया चालू...') : (isEn ? '✓ Accept Sample & Start Testing' : '✓ नमुना स्वीकारा व चाचणी सुरू करा')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt(isEn ? "Enter rejection reason for recollection:" : "नमुना नाकारण्याचे कारण नोंदवा:");
                        if (reason) {
                          setRejectionReason(reason);
                          handleIntakeSubmit('REJECT');
                        }
                      }}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 text-xs"
                    >
                      <X className="w-4 h-4" />
                      <span>{isEn ? 'Reject & Request Recollection' : 'नमुना नाकारा व पुनर्संकलन मागा'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Link to Testing Workbench */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveTab('workbench')}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition"
                  >
                    <span>{isEn ? 'Go to Pathology Testing Studio ➔' : 'चाचणी कक्षेकडे जा ➔'}</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
                <FlaskConical className="w-12 h-12 mx-auto text-purple-300 opacity-60 mb-2" />
                <p>{isEn ? 'Select a sample from the manifest to view intake verification' : 'तपासणीसाठी नमुना निवडा'}</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: SCIENTIFIC TESTING & PATHOLOGY WORKBENCH */}
      {/* ========================================================================= */}
      {activeTab === 'workbench' && selectedSample && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: ASSAY RECORDING STUDIO (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">
                  {isEn ? 'STEP 9, 10 & 11 — SCIENTIFIC ASSAY EXECUTION' : 'चरण 9, 10 और 11 — वैज्ञानिक परीक्षण कार्यान्वयन'}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {isEn ? 'Record Physical Laboratory Test Results' : 'प्रयोगशाला परीक्षण परिणाम दर्ज करें'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEn ? 'Execute physical microscopy, pure culture, or molecular PCR tests and record findings.' : 'प्रत्यक्ष सूक्ष्मदर्शी, शुद्ध संवर्धन या आण्विक PCR परीक्षण करें और निष्कर्ष दर्ज करें।'}
                </p>
              </div>
              <span className="font-mono text-xs font-black text-purple-900">
                #{selectedSample.sample_id}
              </span>
            </div>

            {/* Field Photos Reference Bar for Lab Scientist */}
            <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-amber-300 flex items-center gap-1.5 uppercase text-[10px]">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  {isEn ? 'Field Macro Photos for Visual Cross-Reference:' : 'तुलनेसाठी क्षेत्रीय छायाचित्रे:'}
                </span>
                <span className="text-slate-400 font-mono text-[9px]">
                  {isEn ? 'Case #' : 'मामला #'}{selectedSample.case_id}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {getSampleFieldPhotos(selectedSample).map((photo, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() => setExpandedPhoto({ ...photo, index: pIdx, allPhotos: getSampleFieldPhotos(selectedSample) })}
                    className="group bg-slate-950 rounded-lg overflow-hidden border border-slate-800 hover:border-amber-400 cursor-pointer transition relative"
                  >
                    <div className="aspect-square w-full relative">
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                    </div>
                    <div className="p-1 text-[8px] font-bold text-slate-300 truncate text-center bg-slate-950">
                      {photo.angle}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assay Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'Microscopy', icon: '🔬', label: isEn ? '1. Microscopy' : '१. सूक्ष्मदर्शी' },
                { id: 'Molecular/PCR', icon: '🧬', label: isEn ? '2. Molecular PCR' : '२. पीसीआर (PCR)' },
                { id: 'Culture', icon: '🧫', label: isEn ? '3. Pure Culture' : '३. बुरशी संवर्धन' }
              ].map(assay => (
                <button
                  key={assay.id}
                  type="button"
                  onClick={() => {
                    setActiveAssayType(assay.id);
                    if (assay.id === 'Microscopy') {
                      setTestTarget(`${formatEntityName(selectedSample.suspected_pathogen)} Larval Anatomy`);
                      setTestObservation("Distinct larval mouthparts, dorsal pink banding, and spiracular rings verified under 400x magnification.");
                    } else if (assay.id === 'Molecular/PCR') {
                      setTestTarget(`${formatEntityName(selectedSample.suspected_pathogen)} ITS2 rRNA Gene`);
                      setTestObservation("High copy-number amplification detected (Ct 22.4). Positive band verified against reference control.");
                    } else {
                      setTestTarget("Fungal / Bacterial Colony Isolation");
                      setTestObservation("Potato Dextrose Agar (PDA) incubation at 26°C for 48h showed characteristic colony morphology.");
                    }
                  }}
                  className={`p-3 rounded-2xl border-2 font-bold transition flex items-center justify-center gap-2 ${
                    activeAssayType === assay.id
                      ? 'border-purple-600 bg-purple-50 text-purple-950 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                  }`}
                >
                  <span className="text-base">{assay.icon}</span>
                  <span>{assay.label}</span>
                </button>
              ))}
            </div>

            {/* Test Form */}
            <form onSubmit={handleRecordTest} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isEn ? 'Target Organism / Structure:' : 'लक्षित घटक / अवयव:'}
                  </label>
                  <input
                    type="text"
                    value={testTarget}
                    onChange={(e) => setTestTarget(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isEn ? 'Assay Finding / Outcome:' : 'चाचणी निष्कर्ष:'}
                  </label>
                  <select
                    value={testResult}
                    onChange={(e) => setTestResult(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-black text-slate-900"
                  >
                    <option value="POSITIVE">{isEn ? '🟢 POSITIVE (निश्चित उपस्थिती)' : '🟢 सकारात्मक (निश्चित उपस्थिती)'}</option>
                    <option value="NEGATIVE">{isEn ? '⚪ NEGATIVE (अनुपस्थित)' : '⚪ नकारात्मक (अनुपस्थित)'}</option>
                    <option value="INCONCLUSIVE">{isEn ? '🟡 INCONCLUSIVE (अनिर्णायक)' : '🟡 अनिर्णायक'}</option>
                  </select>
                </div>
              </div>

              {/* Microscopy Specific Fields */}
              {activeAssayType === 'Microscopy' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-purple-50/50 rounded-2xl border border-purple-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isEn ? 'Magnification / Optics:' : 'आवर्धन / ऑप्टिक्स:'}</label>
                    <select
                      value={magnification}
                      onChange={(e) => setMagnification(e.target.value)}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-slate-900 font-bold"
                    >
                      <option value="400x Brightfield">{isEn ? '400x Brightfield (High Dry)' : '400x ब्राइटफील्ड (हाय ड्राय)'}</option>
                      <option value="1000x Oil Immersion">{isEn ? '1000x Oil Immersion' : '1000x ऑइल इमर्शन'}</option>
                      <option value="100x Dissecting Stereo">{isEn ? '100x Dissecting Stereomicroscope' : '100x डिसेक्टिंग स्टिरिओ सूक्ष्मदर्शी'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isEn ? 'Micrograph Optical Reference ID (Optional):' : 'माइक्रोग्राफ ऑप्टिकल संदर्भ आईडी (वैकल्पिक):'}</label>
                    <input
                      type="text"
                      value={micrographUrl}
                      onChange={(e) => setMicrographUrl(e.target.value)}
                      placeholder={isEn ? 'e.g. MIC-2026-B4-09 / Slide-Box-12' : 'उदा. MIC-2026-B4-09 / Slide-Box-12'}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-slate-900 font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* PCR Specific Fields */}
              {activeAssayType === 'Molecular/PCR' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-purple-50/50 rounded-2xl border border-purple-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isEn ? 'Cycle Threshold (Ct Value): ' : 'साइकल सीमा (Ct Value): '}<strong className="text-purple-900">{ctValue}</strong>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      step="0.1"
                      value={ctValue}
                      onChange={(e) => setCtValue(parseFloat(e.target.value))}
                      className="w-full accent-purple-700"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {ctValue <= 29 ? (isEn ? '🟢 High Copy Load (< 29 Ct)' : '🟢 उच्च प्रतिकृति (< 29 Ct)') : (isEn ? '🟠 Moderate / Low Copy' : '🟠 मध्यम / कम प्रतिकृति')}
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isEn ? 'Test Reference ID:' : 'परीक्षण संदर्भ आईडी:'}</label>
                    <input
                      type="text"
                      value={testReference}
                      onChange={(e) => setTestReference(e.target.value)}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-slate-900 font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Observation Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isEn ? 'Detailed Pathological Observation:' : 'सविस्तर वैज्ञानिक निरीक्षण शेरा:'}
                </label>
                <textarea
                  rows={2}
                  value={testObservation}
                  onChange={(e) => setTestObservation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isRecordingTest}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow transition disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isRecordingTest ? (isEn ? 'Recording...' : 'नोंदणी चालू...') : (isEn ? 'Log Test to Chain of Custody' : 'चाचणी निकाल जतन करा')}</span>
                </button>
              </div>
            </form>

            {/* Logged Tests History */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider block">
                {isEn ? 'Logged Laboratory Tests on this Specimen:' : 'नोंदवलेले चाचणी अहवाल:'}
              </span>
              
              {selectedSample.tests_performed && selectedSample.tests_performed.length > 0 ? (
                <div className="space-y-2">
                  {selectedSample.tests_performed.map((t, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-purple-950">{t.test_type}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            t.result === 'POSITIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'
                          }`}>
                            {t.result}
                          </span>
                        </div>
                        <p className="text-slate-700 mt-1 font-medium">{t.observation}</p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{isEn ? 'Target: ' : 'लक्ष्य: '}{t.target_organism}{isEn ? ' • Logged by ' : ' • दर्ज किया '}{t.technician_id || (isEn ? 'Tech' : 'टेक्निशियन')}</span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-xs">{isEn ? 'No tests recorded yet. Record a microscopy or PCR assay above.' : 'अभी कोई परीक्षण दर्ज नहीं। ऊपर सूक्ष्मदर्शी या PCR परीक्षण दर्ज करें।'}</p>
              )}
            </div>

          </div>

          {/* RIGHT: OFFICIAL PATHOLOGY REPORT PUBLISHER & LOCKING (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border-2 border-purple-200 shadow-lg space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                {isEn ? 'STEP 12 & 13 — REPORT CERTIFICATION & IMMUTABLE LOCKING' : 'चरण 12 और 13 — रिपोर्ट प्रमाणन व स्थायी लॉकिंग'}
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                {isEn ? 'Publish Certified Pathology Report' : 'अधिकृत पॅथॉलॉजी अहवाल प्रमाणन'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn ? 'Once published, this report becomes an immutable legal and epidemiological record.' : 'प्रकाशित होने पर यह रिपोर्ट स्थायी कानूनी तथा महामारी विज्ञान अभिलेख बन जाती है।'}
              </p>
            </div>

            <form onSubmit={handlePublishReport} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isEn ? 'Final Scientific Confirmation Finding:' : 'अंतिम वैज्ञानिक निष्कर्ष:'}
                </label>
                <select
                  value={reportFinding}
                  onChange={(e) => setReportFinding(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-black text-slate-900"
                >
                  <option value="CONFIRMED">{isEn ? '✓ CONFIRMED (निश्चित निदान प्रमाणित)' : '✓ पुष्टीकृत (निश्चित निदान प्रमाणित)'}</option>
                  <option value="NOT_CONFIRMED">{isEn ? '❌ NOT CONFIRMED (निदान अप्रमाणित)' : '❌ अपुष्ट (निदान अप्रमाणित)'}</option>
                  <option value="VARIANT_STRAIN">{isEn ? '🧬 VARIANT / NOVEL STRAIN (नवीन विषाणू वाण)' : '🧬 नवीन प्रकार / स्ट्रेन (नवीन विषाणू वाण)'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isEn ? 'Confirmed Pathogen / Pest Ground Truth Entity:' : 'प्रमाणित रोग / कीड निश्चित नाव:'}
                </label>
                <input
                  type="text"
                  value={confirmedEntity}
                  onChange={(e) => setConfirmedEntity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                />

                {/* Candidate Selection Quick Pills */}
                {selectedSample && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                      {isEn ? 'Quick Select Ground Truth:' : 'निश्चित निदान निवडा:'}
                    </span>
                    {getCandidateEntities(selectedSample).map((candidate, cIdx) => (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => {
                          setConfirmedEntity(candidate);
                          setTestTarget(`${candidate} Specific Markers`);
                          setPathologistRemarks(`Microbiological and morphological diagnostic assay verified presence of ${candidate}. Ground truth confirmed under ISO-17025.`);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition ${
                          confirmedEntity === candidate
                            ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                            : 'bg-slate-100 hover:bg-purple-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {candidate}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isEn ? 'Diagnostic Test Summary:' : 'चाचणी पद्धती सारांश:'}
                </label>
                <textarea
                  rows={2}
                  value={testSummary}
                  onChange={(e) => setTestSummary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isEn ? 'Certifying Pathologist Remarks & IPM Advisory Directive:' : 'तज्ज्ञ शेरा व सल्ला निर्देश:'}
                </label>
                <textarea
                  rows={2}
                  value={pathologistRemarks}
                  onChange={(e) => setPathologistRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isEn ? 'Certifying Scientist:' : 'प्रमाणित शास्त्रज्ञ:'}
                </label>
                <input
                  type="text"
                  value={certifyingScientist}
                  onChange={(e) => setCertifyingScientist(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-bold"
                />
              </div>

              <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 text-[11px] text-purple-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-3.5 h-3.5 text-purple-700" />
                  <span>{isEn ? 'Immutable Audit Trail & Version Control Active' : 'स्थायी ऑडिट ट्रेल व संस्करण नियंत्रण सक्रिय'}</span>
                </div>
                <p className="text-slate-600 text-[10px]">
                  {isEn ? 'Publishing will lock this finding into ' : 'प्रकाशित करने पर यह निष्कर्ष '}<strong>{isEn ? 'Version ' : 'संस्करण '}{(selectedSample.report_version || 0) + 1}</strong>{isEn ? ' and automatically notify the Agri Expert, Krishi Sevak, and Farmer.' : ' में लॉक होगा और कृषि विशेषज्ञ, कृषि सेवक तथा किसान को सूचना भेजी जाएगी।'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isPublishingReport}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black p-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isPublishingReport ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Award className="w-5 h-5" />
                )}
                <span>
                  {isPublishingReport 
                    ? (isEn ? 'Locking Report...' : 'अहवाल लॉक करत आहे...') 
                    : (isEn ? '🔒 Publish Official Locked Lab Report' : '🔒 अधिकृत प्रमाणित अहवाल लॉक करा')}
                </span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: IMMUTABLE CHAIN OF CUSTODY & QR CODE STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'chain_of_custody' && selectedSample && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  {isEn ? 'STEP 5 — IMMUTABLE SAMPLE CHAIN OF CUSTODY' : 'चरण 5 — स्थायी नमुना हस्तांतरण श्रृंखला'}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {isEn ? 'Tamper-Evident QR Tracking' : 'छेड़छाड़-रोधी QR ट्रैकिंग'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                {isEn ? 'Specimen #' : 'नमुना #'}{selectedSample.sample_id}{isEn ? ' Transfer Audit Trail' : ' हस्तांतरण ऑडिट ट्रेल'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn ? 'Every physical handoff, sealing event, courier transit, and laboratory intake is cryptographically recorded.' : 'प्रत्येक हस्तांतरण, सीलिंग, कूरियर यात्रा और प्रयोगशाला प्रवेश क्रिप्टोग्राफिक रूप से दर्ज होता है।'}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4 text-purple-400" />
              <span>{isEn ? 'Print Official QR Slip' : 'QR स्लिप प्रिंट करा'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* 4. PHYSICAL QR CODE CARD (4 Cols) */}
            <div className="md:col-span-4 bg-gradient-to-b from-slate-900 to-purple-950 text-white p-6 rounded-3xl shadow-xl border border-purple-500/30 text-center space-y-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300 block">
                {isEn ? 'OFFICIAL DIAGNOSTIC SPECIMEN TAG' : 'आधिकारिक रोग निदान नमुना टैग'}
              </span>
              
              <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
                {/* Visual SVG QR Representation */}
                <div className="w-40 h-40 bg-slate-950 p-2 rounded-xl flex items-center justify-center relative">
                  <QrCode className="w-36 h-36 text-white" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-purple-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded border border-white">
                      MAHA-AGRI
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1 font-mono text-xs">
                <div className="text-purple-300 text-[11px]">{isEn ? 'SAMPLE ID: ' : 'नमुना आईडी: '}<strong className="text-white font-black">{selectedSample.sample_id}</strong></div>
                <div className="text-slate-400 text-[10px]">{isEn ? 'CASE ID: #' : 'मामला आईडी: #'}{selectedSample.case_id}</div>
                <div className="text-slate-400 text-[10px]">{isEn ? 'REFERRAL: ' : 'संदर्भ: '}{selectedSample.referral_id || 'LR-MH-2026-000183'}</div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[10px] text-slate-300 text-left space-y-1">
                <div>{isEn ? 'Crop: ' : 'फसल: '}<strong className="text-white">{selectedSample.crop}</strong></div>
                <div>{isEn ? 'Specimen: ' : 'नमुना: '}<strong className="text-white">{selectedSample.specimen_type}</strong></div>
                <div>{isEn ? 'Farm: ' : 'खेत: '}<strong className="text-white">{selectedSample.village}, {selectedSample.district}</strong></div>
              </div>
            </div>

            {/* 5. TIMELINE AUDIT TRAIL (8 Cols) */}
            <div className="md:col-span-8 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                {isEn ? 'Chronological Transfer Events & Verification' : 'कालक्रमानुसार हस्तांतरण नोंदी'}
              </h3>

              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-200">
                {(selectedSample.chain_of_custody && selectedSample.chain_of_custody.length > 0 ? selectedSample.chain_of_custody : [
                  {
                    timestamp: "10:42 AM",
                    actor: "Anil S. Deshmukh",
                    role: "KRISHI_SEVAK",
                    location: isEn ? "Zadgaon Farm" : "Zadgaon खेत",
                    action: isEn ? "Sample Collected & QR Tagged" : "नमुना संग्रहित व QR टैग",
                    remarks: isEn ? "Excised affected tissue and placed into sterile sealed container." : "प्रभावित ऊतक निकालकर कीटाणुरहित सीलबंद पात्र में रखा गया।"
                  },
                  {
                    timestamp: "03:10 PM",
                    actor: isEn ? "Central Intake Desk" : "केंद्रीय नमुना ग्रहण डेस्क",
                    role: "DIAGNOSTIC_LAB",
                    location: isEn ? "ICAR-CICR Nagpur Lab" : "ICAR-CICR नागपूर प्रयोगशाला",
                    action: isEn ? "Sample Intake Accepted" : "नमुना प्रवेश स्वीकृत",
                    remarks: isEn ? "Specimen verified intact and logged for molecular testing." : "नमुना अखंड सत्यापित होकर आण्विक परीक्षण हेतु दर्ज किया गया।"
                  }
                ]).map((event, idx) => (
                  <div key={idx} className="relative bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <div className="absolute -left-[27px] top-4 w-3.5 h-3.5 bg-purple-600 rounded-full border-2 border-white shadow" />
                    
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-black text-slate-900 text-xs">
                        {event.action}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full">
                        {event.timestamp}
                      </span>
                    </div>

                    <div className="text-slate-600 text-[11px]">
                      {isEn ? 'Actor: ' : 'कर्ता: '}<strong>{event.actor}</strong> ({event.role}){isEn ? ' • Location: ' : ' • स्थान: '}<em>{event.location}</em>
                    </div>

                    <p className="text-slate-500 text-[11px] italic pt-0.5">
                      "{event.remarks}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: CERTIFIED PATHOLOGY ARCHIVE & VERSION LOCKING */}
      {/* ========================================================================= */}
      {activeTab === 'archive' && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                  {isEn ? 'STEP 13 & 14 — LOCKED PATHOLOGY REPORT CERTIFICATION' : 'चरण 13 और 14 — लॉक रोग निदान रिपोर्ट प्रमाणन'}
                </span>
                <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {isEn ? 'NABL Standard Format' : 'NABL मानक प्रारूप'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                {isEn ? 'Official Pathology Reports Archive (Immutable V1 / V2)' : 'आधिकारिक रोग निदान रिपोर्ट संग्रह (स्थायी V1 / V2)'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn ? 'Certified laboratory findings returned to Agri Experts, Krishi Sevaks, Farmers, and State Surveillance.' : 'प्रमाणित प्रयोगशाला निष्कर्ष कृषि विशेषज्ञों, कृषि सेवकों, किसानों और राज्य निगरानी को वापस किए गए।'}
              </p>
            </div>

            <span className="bg-emerald-100 text-emerald-900 font-black px-3.5 py-1.5 rounded-xl text-xs border border-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{isEn ? 'Certified NABL Records' : 'प्रमाणित NABL अभिलेख'}</span>
            </span>
          </div>

          {/* Archived Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {labSamples.map(spl => {
              const hasReport = spl.status === 'REPORT_ISSUED' || spl.final_report;

              return (
                <div 
                  key={spl.sample_id} 
                  className={`p-5 rounded-3xl border-2 space-y-4 ${
                    hasReport 
                      ? 'border-emerald-300 bg-gradient-to-br from-emerald-50/30 to-white shadow-md' 
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-purple-950 text-sm">#{spl.sample_id}</span>
                        <span className="bg-slate-200 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                          {isEn ? 'Version ' : 'संस्करण '}{spl.report_version || 1} {hasReport && (isEn ? '🔒 Locked' : '🔒 लॉक')}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm mt-1">
                        {spl.crop} — {formatEntityName(spl.final_report?.confirmed_entity || spl.suspected_pathogen)}
                      </h4>
                      <span className="text-slate-500 text-[11px] block">
                        {isEn ? 'Farmer: ' : 'किसान: '}{isEn ? spl.farmer_name?.split('(')[0]?.trim() : spl.farmer_name} • {spl.taluka || 'Darwha'}, {spl.district}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      hasReport ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {hasReport ? (isEn ? 'CONFIRMED ✓' : 'पुष्टीकृत ✓') : spl.status}
                    </span>
                  </div>

                  {hasReport ? (
                    <div className="space-y-3 text-xs">
                      <div className="bg-white p-3 rounded-2xl border border-emerald-200 space-y-1 text-[11px]">
                        <div className="text-emerald-950 font-bold">
                          {isEn ? 'Finding: ' : 'निष्कर्ष: '}<strong className="text-emerald-700">{spl.final_report?.finding || 'CONFIRMED'}</strong>
                        </div>
                        <p className="text-slate-700">{spl.final_report?.test_summary || spl.findings}</p>
                        <p className="text-slate-600 italic pt-1 border-t border-slate-100">
                          "{spl.final_report?.pathologist_remarks || (isEn ? 'Microbiological and PCR assay confirmed positive target amplification.' : 'सूक्ष्मजैविक व PCR परीक्षण द्वारा सकारात्मक नमूना पुष्टि की गई।')}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500">
                          {isEn ? 'Certified by: ' : 'प्रमाणित किया: '}<strong className="text-slate-900">{spl.final_report?.certifying_scientist || spl.certified_by}</strong>
                        </span>
                        <button
                          onClick={() => alert(isEn ? `Viewing Certified PDF Report for Sample #${spl.sample_id}` : `नमुना #${spl.sample_id} की प्रमाणित PDF रिपोर्ट देखी जा रही है`)}
                          className="text-purple-700 hover:text-purple-900 font-bold underline flex items-center gap-1"
                        >
                          <span>{isEn ? 'View PDF' : 'PDF देखें'}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-slate-400 text-xs space-y-2">
                      <Clock className="w-6 h-6 mx-auto text-amber-500 opacity-60" />
                      <p>{isEn ? 'Testing in progress. Official report will appear once published in the Testing Studio.' : 'परीक्षण जारी है। प्रयोगशाला में प्रकाशित होने पर आधिकारिक रिपोर्ट यहाँ दिखेगी।'}</p>
                      <button
                        onClick={() => {
                          setSelectedSample(spl);
                          setActiveTab('workbench');
                        }}
                        className="bg-purple-100 text-purple-900 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-purple-200 transition"
                      >
                        {isEn ? 'Open Testing Studio' : 'प्रयोगशाला खोलें'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. MODAL: QR CODE SCANNER SIMULATOR */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {isEn ? 'Laboratory QR Scanner' : 'प्रयोगशाळा QR स्कॅनर'}
                </h3>
              </div>
              <button 
                onClick={() => setShowScannerModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-6 text-center text-white space-y-3 relative overflow-hidden">
              <div className="w-32 h-32 mx-auto border-2 border-purple-400 border-dashed rounded-2xl flex items-center justify-center animate-pulse">
                <QrCode className="w-20 h-20 text-purple-300" />
              </div>
              <p className="text-xs text-purple-200">
                {isEn ? 'Align the physical sample tag QR code within the frame' : 'नमुनावरील QR कोड स्कॅन करा'}
              </p>
            </div>

            {/* Quick Demo Sample Picker */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                {isEn ? 'Or select simulated physical sample tag:' : 'किंवा चाचणीसाठी नमुना निवडा:'}
              </span>
              <div className="space-y-1.5">
                {labSamples.map(spl => (
                  <button
                    key={spl.sample_id}
                    onClick={() => handleScanSample(spl.sample_id)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50 text-xs flex items-center justify-between transition"
                  >
                    <div>
                      <strong className="text-purple-950 font-mono">#{spl.sample_id}</strong>
                      <span className="text-slate-600 ml-2">({spl.crop} — {formatEntityName(spl.suspected_pathogen)})</span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700">{isEn ? 'Scan ➔' : 'स्कैन ➔'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: FULL-SCREEN MACRO PHOTO INSPECTION */}
      {expandedPhoto && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden text-white">
            
            {/* Modal Header */}
            <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/40">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      {expandedPhoto.title}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-200 border border-amber-600">
                      {expandedPhoto.angle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {expandedPhoto.desc}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setExpandedPhoto(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Image Preview */}
            <div className="p-4 sm:p-6 flex-1 flex items-center justify-center bg-slate-950/80 overflow-hidden relative min-h-[300px]">
              <img
                src={expandedPhoto.url}
                alt={expandedPhoto.title}
                className="max-h-[60vh] max-w-full object-contain rounded-2xl border border-slate-800 shadow-2xl"
              />

              {/* Navigation Arrows */}
              {expandedPhoto.allPhotos && expandedPhoto.allPhotos.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      const prevIdx = (expandedPhoto.index - 1 + expandedPhoto.allPhotos.length) % expandedPhoto.allPhotos.length;
                      setExpandedPhoto({
                        ...expandedPhoto.allPhotos[prevIdx],
                        index: prevIdx,
                        allPhotos: expandedPhoto.allPhotos
                      });
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-slate-900/80 hover:bg-purple-900/90 text-white border border-slate-700 hover:border-purple-500 transition shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      const nextIdx = (expandedPhoto.index + 1) % expandedPhoto.allPhotos.length;
                      setExpandedPhoto({
                        ...expandedPhoto.allPhotos[nextIdx],
                        index: nextIdx,
                        allPhotos: expandedPhoto.allPhotos
                      });
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-slate-900/80 hover:bg-purple-900/90 text-white border border-slate-700 hover:border-purple-500 transition shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Modal Footer: Scientific Morphological Checklist & Thumbnails */}
            <div className="p-4 sm:px-6 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px]">
                  {isEn ? 'Photo ' : 'छायाचित्र '}{expandedPhoto.index + 1}{isEn ? ' of ' : ' / '}{expandedPhoto.allPhotos?.length || 1}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isEn ? 'Geo-Tagged & Officer Verified Field Dossier' : 'जीपीएस टॅग केलेले व प्रमाणित क्षेत्रीय छायाचित्र'}
                </span>
              </div>

              {/* Quick Thumbnail Strip */}
              {expandedPhoto.allPhotos && (
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {expandedPhoto.allPhotos.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setExpandedPhoto({ ...p, index: idx, allPhotos: expandedPhoto.allPhotos })}
                      className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition ${
                        expandedPhoto.index === idx ? 'border-amber-400 scale-110' : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
