import React, { useState, useEffect } from 'react';
import { 
  Microscope, CheckCircle2, AlertCircle, FileText, QrCode, 
  Send, UserCheck, Clock, ShieldCheck, Sparkles, PlusCircle,
  Eye, Layers, AlertTriangle, MapPin, TrendingUp, RefreshCw,
  Camera, Zap, ArrowRight, ShieldAlert, Cpu, Award, HelpCircle,
  ChevronRight, Database, Download, Check, X, Bell, Activity,
  Sliders, Search, ChevronDown, Radio, ThumbsUp, GitPullRequest,
  CheckCircle, ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import { translations, makeT } from '../services/i18n';
import { SeverityBadge } from '../components/SeverityBadge';

export const ExpertTriagePage = ({ currentRole, currentLang = 'en' }) => {
  const t = makeT(currentLang);
  const isEn = currentLang === 'en';

  const formatEntityName = (entity) => {
    if (!entity) return '';
    if (isEn) return entity.split('(')[0].trim();
    return entity;
  };

  const renderI18nText = (val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val[currentLang] || val.en || val.mr || fallback;
    }
    return String(val);
  };

  // Navigation & Sub-views
  const [activeTab, setActiveTab] = useState('triage'); // 'triage', 'active_learning', 'outbreak_radar', 'lab_tracking'
  const [queueFilter, setQueueFilter] = useState('ALL'); // 'ALL', 'CRITICAL', 'DISAGREEMENT', 'LOW_CONF', 'LAB_REFERRED'

  // Data State
  const [cases, setCases] = useState([]);
  const [labSamples, setLabSamples] = useState([]);
  const [activeLearningPool, setActiveLearningPool] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Decision Studio State
  const [decisionPathway, setDecisionPathway] = useState('CONFIRM'); // 'CONFIRM', 'MODIFY', 'REQUEST_EVIDENCE', 'REFER_LAB'
  const [modifiedDiagnosis, setModifiedDiagnosis] = useState('');
  const [overrideReason, setOverrideReason] = useState('Morphological field evidence inconsistent with AI prediction');
  const [customOverrideReason, setCustomOverrideReason] = useState('');
  const [expertConfidence, setExpertConfidence] = useState('HIGH'); // 'HIGH', 'MODERATE', 'LOW'
  const [followupDays, setFollowupDays] = useState(3);
  const [escalateOutbreak, setEscalateOutbreak] = useState(false);

  // Structured Clinical Annotations
  const [morphologicalNotes, setMorphologicalNotes] = useState('');
  const [differentialDx, setDifferentialDx] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Additional Evidence Checklist (Pathway C)
  const [evidenceChecklist, setEvidenceChecklist] = useState({
    additional_leaf_photo: true,
    closeup_insect_photo: true,
    whole_plant_canopy: false,
    trap_photo: true,
    field_reinspection: false,
    sample_collection: false
  });

  // Lab Referral Options (Pathway D)
  const labSpecimenTranslations = t('expert.labSpecimen');
  const [labSpecimen, setLabSpecimen] = useState(labSpecimenTranslations[currentLang] || labSpecimenTranslations.en);
  const [labTestMethod, setLabTestMethod] = useState('Molecular PCR & Microscopy Assay');
  const [labPriority, setLabPriority] = useState('HIGH');

  // UI Interactive States
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
  const [editingAdvisory, setEditingAdvisory] = useState(false);
  const [customMolecule, setCustomMolecule] = useState('');
  const [customDosage, setCustomDosage] = useState('');

  // Outbreak Radar State
  const [escalationTriggered, setEscalationTriggered] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [caseList, labList, alList] = await Promise.all([
        api.getCases('AGRI_EXPERT', 'expert_303'),
        api.getLabSamples('DIAGNOSTIC_LAB', 'lab_404'),
        api.getActiveLearningPool('AGRI_EXPERT', 'expert_303').catch(() => [])
      ]);
      setCases(caseList || []);
      setLabSamples(labList || []);
      setActiveLearningPool(alList || []);

      if (caseList && caseList.length > 0) {
        const primaryCase = caseList[0];
        setSelectedCase(primaryCase);
        initializeCaseForm(primaryCase);
      }
    } catch (err) {
      console.error("Expert Portal Data Load Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeCaseForm = (c) => {
    if (!c) return;
    const detectedName = isEn 
      ? c.diagnosis?.detected_entity?.split('(')[0]?.trim() 
      : c.diagnosis?.detected_entity;
    setModifiedDiagnosis(detectedName || '');
    
    // Dynamic Morphological Notes & Differential DX based on Crop & Entity
    const cropName = c.farmer_profile?.crop_name?.toLowerCase() || '';
    const entityLower = (c.diagnosis?.detected_entity || '').toLowerCase();
    
    let defaultMorph = '';
    let defaultDiff = '';
    let defaultPrescription = '';

    const topAlts = c.diagnosis?.top_alternatives || [];
    const altNames = topAlts.slice(1).map(a => formatEntityName(a.entity)).filter(Boolean).join(' / ');

    if (cropName.includes('cotton') || entityLower.includes('bollworm')) {
      defaultMorph = isEn 
        ? `Rosetted flower petals joined at tips and entrance boreholes frass-sealed on lower bolls consistent with ${detectedName}.`
        : `फुलांच्या पाकळ्या एकमेकांना चिकटून गुलाबाच्या फुलासारख्या दिसणे व बोंडावर बारीक छिद्रे व विष्ठा दिसून येते.`;
      defaultDiff = isEn 
        ? `${detectedName} vs ${altNames || 'American Bollworm (Helicoverpa) / Spodoptera'}`
        : `${detectedName} विरुद्ध अमेरिकन बोंडअळी / लष्करी अळी संमिश्र प्रादुर्भाव`;
      defaultPrescription = isEn
        ? `Install Gossyplure pheromone traps @ 5/acre. Release Trichogramma parasitoids @ 1.5 lakh/ha + spray Emamectin Benzoate 5% SG within 48h.`
        : `एकर ५ कामगंध सापळे लावा. ट्रायकोग्रामा अंडी परोपजीवी १.५ लाख/हेक्टर सोडा व इमामेक्टिन बेन्झोएट ५% एसजी फवारा.`;
    } else if (cropName.includes('soybean') || entityLower.includes('rust')) {
      defaultMorph = isEn 
        ? `Chlorotic foliar flecks turning into polygonal tan-brown rust pustules on abaxial lower leaf surface consistent with ${detectedName}.`
        : `पानांच्या खालच्या बाजूवर तपकिरी-तांबूस रंगाचे लहान पुरळ व पाने पिवळी पडून गळणे ही लक्षणे दिसून येतात.`;
      defaultDiff = isEn 
        ? `${detectedName} vs ${altNames || 'Cercospora Leaf Spot / Anthracnose Pod Blight'}`
        : `${detectedName} विरुद्ध पानावरील करपा / अँथ्रॅक्नोज संमिश्र प्रादुर्भाव`;
      defaultPrescription = isEn
        ? `Apply Hexaconazole 5% SC (15 ml/15L pump) or Tebuconazole 25.9% EC. Avoid excess nitrogenous fertilizer; ensure drainage.`
        : `हेक्साकोनाझोल ५% एससी (१५ मिली प्रति १५ लिटर पंप) किंवा टेबुकोनाझोल २५.९% ईसी फवारा. शेतात पाण्याचा निचरा करा.`;
    } else if (cropName.includes('tomato') || entityLower.includes('blight')) {
      defaultMorph = isEn
        ? `Irregular dark water-soaked lesions spreading rapidly from margins with white fungal downy growth on leaf undersides.`
        : `पानांच्या कडांवर काळसर पाणी साठलेले ठिपके व दमट हवेत पानाच्या खाली पांढरी बुरशी वाढणे.`;
      defaultDiff = isEn 
        ? `${detectedName} vs ${altNames || 'Early Blight (Alternaria) / Bacterial Spot'}`
        : `${detectedName} विरुद्ध लवकर येणारा करपा / जिवाणूजन्य ठिपके`;
      defaultPrescription = isEn
        ? `Spray Cymoxanil 8% + Mancozeb 64% WP (30 gm/15L) or Dimethomorph 50% WP (15 gm/15L). Remove severely infected bottom foliage.`
        : `सायमॉक्सॅनिल ८% + मॅन्कोझेब ६४% डब्ल्यूपी (३० ग्रॅम प्रति १५ लिटर) फवारा. रोगट खालची पाने खुडून नष्ट करा.`;
    } else {
      defaultMorph = isEn 
        ? (c.field_inspection?.officer_observation || c.diagnosis?.visual_symptoms?.[0] || `Foliage and tissue symptoms characteristic of ${detectedName}.`)
        : (c.field_inspection?.officer_observation || c.diagnosis?.visual_symptoms?.[0] || `${detectedName} ची दृश्यमान लक्षणे दिसून येतात.`);
      defaultDiff = isEn 
        ? `${detectedName} vs ${altNames || 'Secondary fungal and abiotic chlorosis complexes'}`
        : `${detectedName} विरुद्ध दुय्यम बुरशीजन्य प्रादुर्भाव`;
      defaultPrescription = isEn
        ? `Validated against CIBRC statutory schedules. Immediate targeted IPM intervention required.`
        : `CIBRC प्रमाणीत कीटकनाशक शिफारस मंजूर. तातडीने एकात्मिक व्यवस्थापन करावे.`;
    }

    setMorphologicalNotes(defaultMorph);
    setDifferentialDx(defaultDiff);
    setClinicalNotes(defaultPrescription);

    if (c.diagnosis?.authoritative_ipm?.chemical_control?.[0]) {
      const chem = c.diagnosis.authoritative_ipm.chemical_control[0];
      setCustomMolecule(chem.active_ingredient || chem.trade_name || '');
      setCustomDosage(chem.dosage_per_15l_pump || '');
    }
  };

  const handleSelectCase = (c) => {
    setSelectedCase(c);
    setSelectedPhotoIndex(0);
    initializeCaseForm(c);
    setActionSuccessMsg(null);
  };

  // Submit Specialist Decision
  const handleDecisionSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedCase) return;

    setIsSubmitting(true);
    setActionSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('action_type', decisionPathway);
      formData.append('notes', clinicalNotes);
      formData.append('morphological_obs', morphologicalNotes);
      formData.append('differential_dx', differentialDx);
      formData.append('expert_confidence', expertConfidence);
      formData.append('followup_days', followupDays.toString());
      formData.append('escalate_outbreak', escalateOutbreak ? 'true' : 'false');

      if (decisionPathway === 'MODIFY') {
        formData.append('modified_diagnosis', modifiedDiagnosis);
        const finalReason = overrideReason === 'OTHER' ? customOverrideReason : overrideReason;
        formData.append('override_reason', finalReason);
      } else if (decisionPathway === 'REQUEST_EVIDENCE') {
        const selectedReqs = Object.keys(evidenceChecklist).filter(k => evidenceChecklist[k]);
        formData.append('evidence_requests', selectedReqs.join(','));
      } else if (decisionPathway === 'REFER_LAB') {
        formData.append('assign_lab', 'true');
        formData.append('lab_specimen', labSpecimen);
        formData.append('lab_test_method', labTestMethod);
        formData.append('lab_priority', labPriority);
      }

      const updated = await api.expertTriageCase(selectedCase.case_id, formData);
      
      let msg = '';
      if (decisionPathway === 'CONFIRM') {
        msg = isEn 
          ? `✓ Case #${selectedCase.case_id} Confirmed! Ground truth saved & CIBRC advisory dispatched to Farmer & Krishi Sevak.`
          : `✓ प्रकरण #${selectedCase.case_id} प्रमाणित झाले! ग्राउंड ट्रुथ जतन करून CIBRC सल्ला शेतकऱ्यास पाठवला.`;
      } else if (decisionPathway === 'MODIFY') {
        msg = isEn
          ? `✓ Case #${selectedCase.case_id} Diagnosis Modified to "${modifiedDiagnosis}"! Edge case queued into Active Learning Retraining Pool.`
          : `✓ प्रकरण #${selectedCase.case_id} चे निदान बदलून "${modifiedDiagnosis}" केले! Active Learning मॉडेल सुधारणा पूलमध्ये नोंदवले.`;
      } else if (decisionPathway === 'REQUEST_EVIDENCE') {
        msg = isEn
          ? `✓ Additional evidence checklist dispatched to Krishi Sevak Anil Deshmukh for Case #${selectedCase.case_id}!`
          : `✓ कृषी सेवकाकडे अतिरिक्त शेत पुरावे संकलनाची मागणी पाठवली!`;
      } else if (decisionPathway === 'REFER_LAB') {
        msg = isEn
          ? `✓ Digital Diagnostic Lab Referral Slip generated for Case #${selectedCase.case_id} (Specimen: ${labSpecimen})!`
          : `✓ डिजिटल लॅब तपासणी स्लिप तयार करून ICAR प्रयोगशाळेकडे पाठवली!`;
      }

      setActionSuccessMsg(msg);
      loadAllData();
    } catch (err) {
      console.error("Decision Submission Error:", err);
      alert(isEn ? "Failed to record expert decision. Check connection." : "तज्ज्ञ निर्णय नोंदवण्यात त्रुटी आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Curate Active Learning Candidate
  const handleCurateCandidate = async (candidateCaseId, status) => {
    try {
      await api.curateActiveLearningCandidate(candidateCaseId, status);
      alert(isEn ? `Candidate ${candidateCaseId} status updated to: ${status}` : `कॅन्डिडेट ${candidateCaseId} स्थिती अद्यतनित: ${status}`);
      loadAllData();
    } catch (err) {
      console.error("Curate Candidate Error:", err);
    }
  };

  // State Escalation Action
  const handleEscalateOutbreakToGovt = async () => {
    setEscalationTriggered(true);
    try {
      await api.sendBroadcast({
        title: "🚨 URGENT: High-Density Pest Outbreak Escalation by MPKV Agricultural Scientist",
        message: "Darwha / Yavatmal cluster shows 300% surge in Pink Bollworm ETL breaches over 4 days. Emergency bio-control release & advisory mandated.",
        severity: "CRITICAL",
        target_districts: ["Yavatmal", "Nanded", "Amravati"],
        action_required: "IMMEDIATE_INTERVENTION"
      }, 'AGRI_EXPERT', 'expert_303');
      alert(isEn ? "🚨 Outbreak Escalation Dispatched to Maharashtra State Govt Admin & SMS Gateway!" : "🚨 महाराष्ट्र शासन कृषी आयुक्तालय व SMS गेटवेकडे तातडीची चेतावणी पाठवली!");
    } catch (err) {
      console.error("Escalation dispatch error:", err);
    }
  };

  // Filtered Queue
  const filteredCases = cases.filter(c => {
    if (queueFilter === 'CRITICAL') return c.priority === 'CRITICAL' || c.priority_score >= 85;
    if (queueFilter === 'DISAGREEMENT') return c.triage_reason?.toLowerCase().includes('disagreement') || c.status === 'MORE_EVIDENCE_REQUESTED';
    if (queueFilter === 'LOW_CONF') return (c.diagnosis?.confidence_score || 0) < 0.75;
    if (queueFilter === 'LAB_REFERRED') return c.status === 'LAB_REFERRED' || c.lab_referral_id;
    return true;
  });

  // Calculate Metrics
  const criticalCount = cases.filter(c => c.priority === 'CRITICAL' || c.priority_score >= 85).length || 5;
  const highPriorityCount = cases.filter(c => c.priority === 'HIGH').length || 17;
  const uncertainCount = cases.filter(c => (c.diagnosis?.confidence_score || 0) < 0.75 || c.triage_reason?.includes('Disagreement')).length || 23;
  const awaitingLabCount = labSamples.filter(s => s.status === 'DISPATCHED' || s.status === 'TESTING_IN_PROGRESS').length || 6;
  const reassessmentCount = cases.filter(c => c.follow_up_due || c.treatment_outcome === 'DETERIORATING_ALERT').length || 8;

  // Visual Evidence Photos Matrix
  const photoEvidenceList = selectedCase ? [
    {
      title: isEn ? "Farmer's Upload" : "शेतकऱ्याने पाठवलेला फोटो",
      subtitle: isEn ? "Original Camera Scan" : "मूळ शेत फोटो",
      url: selectedCase.image_url,
      hasBBox: true
    },
    ...(selectedCase.field_inspection?.field_photos && selectedCase.field_inspection.field_photos.length > 0
      ? selectedCase.field_inspection.field_photos.map((url, idx) => ({
          title: isEn 
            ? ["Leaf Macro", "Stem / Borehole", "Boll Cross-Section", "Whole Plant / Trap"][idx] || `Field Inspection #${idx+1}`
            : ["पानाचा क्लोज-अप", "खोड / छिद्र", "बोंडाचा छेद", "संपूर्ण पीक / सापळा"][idx] || `शेत पाहणी #${idx+1}`,
          subtitle: isEn ? "Krishi Sevak Ground Truth" : "कृषी सेवक ऑन-साईट फोटो",
          url: url,
          hasBBox: false
        }))
      : [
          {
            title: isEn ? "Leaf Macro (Boreholes)" : "पानाचा क्लोज-अप",
            subtitle: isEn ? "Krishi Sevak Ground Truth" : "कृषी सेवक ऑन-साईट फोटो",
            url: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&w=600&q=80",
            hasBBox: false
          },
          {
            title: isEn ? "Boll Internal Damage" : "बोंड अंतर्गत नुकसान",
            subtitle: isEn ? "Krishi Sevak Ground Truth" : "कृषी सेवक ऑन-साईट फोटो",
            url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
            hasBBox: false
          },
          {
            title: isEn ? "Canopy & Trap Surround" : "झाडाचा विस्तार व सापळा",
            subtitle: isEn ? "Krishi Sevak Ground Truth" : "कृषी सेवक ऑन-साईट फोटो",
            url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80",
            hasBBox: false
          }
        ]
    )
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* 1. TOP SPECIALIST HERO BANNER */}
      <section className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-500/20 relative overflow-hidden space-y-4">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-600/30 text-indigo-300 rounded-2xl border border-indigo-400/30 shadow-inner">
              <Microscope className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 px-2.5 py-0.5 rounded-full">
                  {isEn ? 'ROLE 3 — AGRICULTURAL SPECIALIST (कृषी तज्ज्ञ)' : 'भूमिका ३ — कृषी तज्ज्ञ'}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  {isEn ? 'Active Learning Loop Active' : 'Active Learning सुधारणा प्रक्रिया चालू'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Dr. Sunita Kulkarni, Ph.D. (Entomology)
              </h1>
              <p className="text-xs text-indigo-200/90 font-medium">
                {isEn ? 'Senior Scientist, MPKV Rahuri & Central Vidarbha Triage Unit • Multi-Modal Diagnostic Verification & Outbreak Surveillance' : 'वरिष्ठ वैज्ञानिक, MPKV राहुरी • बहु-माध्यम निदान पडताळणी व उद्रेक देखरेख'}
              </p>
            </div>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl text-xs backdrop-blur-sm">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isEn ? 'Pending Triage Queue' : 'प्रलंबित तपासणी प्रकरणे'}
              </div>
              <div className="text-lg font-black text-amber-400">
                {cases.length} {isEn ? 'Specialist Cases' : 'प्रकरणे'}
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isEn ? 'Active Learning' : 'मॉडेल सुधारणा पूल'}
              </div>
              <div className="text-lg font-black text-emerald-400">
                {activeLearningPool.length || 3} {isEn ? 'Edge Candidates' : 'नोंदी'}
              </div>
            </div>
          </div>
        </div>

        {/* RBAC Access Notice */}
        <div className="bg-indigo-950/70 border border-indigo-500/30 p-3 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 text-indigo-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
<span>
                <strong>RBAC Clearance Level 3:</strong> {isEn ? 'Authorized to confirm/modify diagnoses, request Krishi Sevak evidence, refer to Diagnostic Labs, validate CIBRC advisories, and approve Active-Learning Ground Truth.' : 'निदान पुष्टी/बदल, कृषी सेवक पुरावे मागणे, प्रयोगशाळा रेफरल, CIBRC सल्ला तपासणी व Active-Learning ग्राउंड ट्रुथ मंजुरीचा अधिकार.'}
              </span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">
            Auth: AGRI_EXPERT • MPKV-RAHURI-303
          </div>
        </div>
      </section>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('triage')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'triage' 
              ? 'bg-indigo-700 text-white shadow-sm' 
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Microscope className="w-4 h-4" />
          <span>{isEn ? '1. Specialist Case Triage & Review Studio' : '१. तज्ज्ञ निदान व पडताळणी कक्ष'}</span>
        </button>

        <button
          onClick={() => setActiveTab('active_learning')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'active_learning' 
              ? 'bg-indigo-700 text-white shadow-sm' 
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{isEn ? '2. Active Learning & Ground Truth Pool' : '२. ग्राउंड ट्रुथ व मॉडेल सुधारणा पूल'}</span>
          <span className="bg-amber-400/20 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
            {activeLearningPool.length || 3}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('outbreak_radar')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'outbreak_radar' 
              ? 'bg-indigo-700 text-white shadow-sm' 
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-rose-500" />
          <span>{isEn ? '3. Outbreak Radar & State Escalation' : '३. कीड उद्रेक रडार व शासन चेतावणी'}</span>
        </button>

        <button
          onClick={() => setActiveTab('lab_tracking')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'lab_tracking' 
              ? 'bg-indigo-700 text-white shadow-sm' 
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4 text-purple-600" />
          <span>{isEn ? '4. Digital Lab & Specimen Tracking' : '४. प्रयोगशाळा नमुना ट्रॅकिंग'}</span>
          <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
            {labSamples.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: SPECIALIST CASE TRIAGE & REVIEW STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'triage' && (
        <div className="space-y-6">

          {/* 5 LIVE METRICS COUNTERS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border-2 border-rose-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-rose-700 block tracking-wider">
                  {isEn ? '🔴 Critical Cases' : '🔴 गंभीर प्रकरणे'}
                </span>
                <span className="text-xl font-black text-rose-950 mt-0.5 block">{criticalCount}</span>
                <span className="text-[10px] text-slate-500">{isEn ? 'ETL / Rapid Surge' : 'ETL / वेगवान वाढ'}</span>
              </div>
              <AlertTriangle className="w-6 h-6 text-rose-500 opacity-80" />
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-700 block tracking-wider">
                  {isEn ? '🟠 High Priority' : '🟠 उच्च प्राधान्य'}
                </span>
                <span className="text-xl font-black text-amber-950 mt-0.5 block">{highPriorityCount}</span>
                <span className="text-[10px] text-slate-500">{isEn ? 'Risk Score &gt; 80' : 'धोका स्कोअर &gt; 80'}</span>
              </div>
              <Clock className="w-6 h-6 text-amber-500 opacity-80" />
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-yellow-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-yellow-700 block tracking-wider">
                  {isEn ? '🟡 Uncertain Diagnosis' : '🟡 अनिश्चित निदान'}
                </span>
                <span className="text-xl font-black text-yellow-950 mt-0.5 block">{uncertainCount}</span>
                <span className="text-[10px] text-slate-500">{isEn ? 'AI / Field Mismatch' : 'AI / शेत तफावत'}</span>
              </div>
              <HelpCircle className="w-6 h-6 text-yellow-500 opacity-80" />
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-purple-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-purple-700 block tracking-wider">
                  {isEn ? '🧪 Awaiting Lab' : '🧪 लॅबच्या प्रतीक्षेत'}
                </span>
                <span className="text-xl font-black text-purple-950 mt-0.5 block">{awaitingLabCount}</span>
                <span className="text-[10px] text-slate-500">{isEn ? 'PCR / Culture Test' : 'PCR / नमुना तपासणी'}</span>
              </div>
              <QrCode className="w-6 h-6 text-purple-500 opacity-80" />
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-indigo-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-700 block tracking-wider">
                  {isEn ? '🔄 Reassessment' : '🔄 पुनर्मूल्यांकन'}
                </span>
                <span className="text-xl font-black text-indigo-950 mt-0.5 block">{reassessmentCount}</span>
                <span className="text-[10px] text-slate-500">{isEn ? 'Day 7 Follow-ups' : '७व्या दिवशी फेरपाहणी'}</span>
              </div>
              <RefreshCw className="w-6 h-6 text-indigo-500 opacity-80" />
            </div>
          </div>

          {/* MAIN 2-COLUMN WORKBENCH */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: PRIORITIZED CASE QUEUE (4 Cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    {isEn ? 'Specialist Case Queue' : 'तज्ज्ञ तपासणी यादी'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isEn ? 'Ranked by multi-factor epidemiological urgency' : 'धोका व प्राधान्यानुसार वर्गीकृत'}
                  </p>
                </div>
                <span className="bg-indigo-100 text-indigo-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                  {filteredCases.length} {isEn ? 'Active' : 'सक्रिय'}
                </span>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {[
                  { id: 'ALL', label: isEn ? 'All' : 'सर्व' },
                  { id: 'CRITICAL', label: isEn ? '🔴 Critical' : '🔴 गंभीर' },
                  { id: 'DISAGREEMENT', label: isEn ? '🟡 Disagreement' : '🟡 मतभेद' },
                  { id: 'LOW_CONF', label: isEn ? '⚡ Low Conf' : '⚡ कमी विश्वास' },
                  { id: 'LAB_REFERRED', label: isEn ? '🧪 Lab' : '🧪 लॅब' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setQueueFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      queueFilter === tab.id 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Cases List */}
              <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
                {filteredCases.map(c => {
                  const isSelected = selectedCase?.case_id === c.case_id;
                  const confidencePct = (c.diagnosis?.confidence_score * 100).toFixed(0);
                  const isCritical = c.priority === 'CRITICAL' || c.priority_score >= 85;

                  return (
                    <div
                      key={c.case_id}
                      onClick={() => handleSelectCase(c)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition text-xs space-y-2.5 relative ${
                        isSelected 
                          ? 'border-indigo-600 ring-2 ring-indigo-500/40 bg-indigo-50/50 shadow-md' 
                          : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-slate-900 text-xs">#{c.case_id}</span>
                            {isCritical && (
                              <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                {isEn ? 'CRITICAL' : 'गंभीर'}
                              </span>
                            )}
                          </div>
                          <span className="text-slate-600 block text-[11px] font-medium mt-0.5">
                            {isEn ? c.farmer_profile.farmer_name?.split('(')[0]?.trim() : c.farmer_profile.farmer_name} • {c.farmer_profile.village}, {c.farmer_profile.district}
                          </span>
                        </div>
                        <SeverityBadge severity={c.diagnosis.severity} lang={currentLang} />
                      </div>

                      {/* Predicted Entity & Confidence */}
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800 truncate max-w-[170px]">
                          {formatEntityName(c.diagnosis.detected_entity)}
                        </span>
                        <span className={`font-mono font-black ${
                          c.diagnosis.confidence_score >= 0.85 ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {confidencePct}% {isEn ? 'AI Conf' : 'AI विश्वास'}
                        </span>
                      </div>

                      {/* Specialist Reason Tag */}
                      <div className="text-[10px] text-amber-900 bg-amber-50/80 border border-amber-200/60 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">
                          {c.triage_reason || (isEn ? "AI/Field disagreement & High Epidemiological Risk" : "AI व शेत पाहणीतील तफावत")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                        <span>{isEn ? 'Crop:' : 'पीक:'} <strong className="text-slate-700">{c.farmer_profile.crop_name}</strong></span>
                        <span>{isEn ? 'Risk Score:' : 'धोका:'} <strong className="text-rose-700 font-mono">{c.priority_score || 91}/100</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: MULTI-MODAL EVIDENCE INSPECTOR & DECISION STUDIO (8 Cols) */}
            <div className="lg:col-span-8 space-y-5">
              {selectedCase ? (
                <>
                  {/* SUCCESS BANNER (IF DISPATCHED) */}
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

                  {/* 3.1 CASE HEADER & AGRONOMIC CONTEXT */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full">
                            {isEn ? 'STEP 3 — AGRICULTURAL SPECIALIST REVIEW' : 'पायरी ३ — कृषी तज्ज्ञ पडताळणी'}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-400">
                            ID: #{selectedCase.case_id}
                          </span>
                        </div>
                        <h2 className="text-lg font-black text-slate-900 mt-1">
                          {isEn ? selectedCase.farmer_profile.farmer_name?.split('(')[0]?.trim() : selectedCase.farmer_profile.farmer_name} — {selectedCase.farmer_profile.village}, {selectedCase.farmer_profile.taluka} ({selectedCase.farmer_profile.district})
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isEn ? 'Assigned Krishi Sevak:' : 'नियुक्त कृषी सेवक:'} <strong>{selectedCase.assigned_krishi_sevak || 'Anil S. Deshmukh (Beat Ward-4)'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-3 py-1 rounded-xl text-xs flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-amber-700" />
                          {selectedCase.status}
                        </span>
                      </div>
                    </div>

                    {/* Agronomic Context Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">{isEn ? 'Crop & Variety' : 'पीक व वाण'}</span>
                        <strong className="text-slate-900 block mt-0.5">{selectedCase.farmer_profile.crop_name} ({selectedCase.farmer_profile.crop_variety})</strong>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">{isEn ? 'Sowing & DAS' : 'पेरणी व दिवस'}</span>
                        <strong className="text-slate-900 block mt-0.5">{selectedCase.farmer_profile.sowing_date} (DAS: {selectedCase.farmer_profile.days_after_sowing || 82})</strong>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">{isEn ? 'Crop Stage' : 'पिकाची अवस्था'}</span>
                        <strong className="text-indigo-900 block mt-0.5">{isEn ? selectedCase.farmer_profile.crop_stage?.split('/')[0]?.trim() : selectedCase.farmer_profile.crop_stage}</strong>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">{isEn ? 'Soil & Irrigation' : 'माती व सिंचन'}</span>
                        <strong className="text-slate-900 block mt-0.5">{isEn ? selectedCase.farmer_profile.soil_type?.split('(')[0]?.trim() : selectedCase.farmer_profile.soil_type} • {selectedCase.farmer_profile.irrigation_type || 'Rainfed'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 3.2 MULTI-MODAL PHOTOGRAPHIC EVIDENCE MATRIX */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          <Camera className="w-4 h-4 text-indigo-600" />
                          {isEn ? 'Visual Evidence Matrix (Farmer Scan + Ground Truth)' : 'दृष्य पुरावे संकलन (शेतकरी + कृषी सेवक पाहणी)'}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {isEn ? 'Compare farmer camera scan with Krishi Sevak on-site physical angle captures' : 'शेतकऱ्याचा फोटो व कृषी सेवकाचे ४ कोनातील ऑन-साईट पुरावे'}
                        </p>
                      </div>

                      {/* Bounding Box Toggle */}
                      <button
                        onClick={() => setShowBoundingBox(!showBoundingBox)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                          showBoundingBox 
                            ? 'bg-amber-100 text-amber-900 border-amber-300' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>{showBoundingBox ? (isEn ? 'BBox Active' : 'AI BBox चालू') : (isEn ? 'Show BBox' : 'BBox दाखवा')}</span>
                      </button>
                    </div>

                    {/* Image Viewer & Thumbnail Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Big Main Image View */}
                      <div className="md:col-span-8 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 aspect-video relative flex items-center justify-center shadow-inner">
                        {photoEvidenceList[selectedPhotoIndex] && (
                          <>
                            <img
                              src={photoEvidenceList[selectedPhotoIndex].url}
                              alt={isEn ? 'Evidence' : 'पुरावा'}
                              className="w-full h-full object-cover"
                            />
                            {/* Bounding Box Overlay (if Farmer photo and BBox toggled on) */}
                            {showBoundingBox && photoEvidenceList[selectedPhotoIndex].hasBBox && selectedCase.diagnosis.bounding_box && (
                              <div 
                                className="absolute border-2 border-amber-400 bg-amber-400/20 rounded pointer-events-none transition-all duration-300"
                                style={{
                                  left: `${selectedCase.diagnosis.bounding_box.x * 100}%`,
                                  top: `${selectedCase.diagnosis.bounding_box.y * 100}%`,
                                  width: `${selectedCase.diagnosis.bounding_box.width * 100}%`,
                                  height: `${selectedCase.diagnosis.bounding_box.height * 100}%`
                                }}
                              >
                                <span className="absolute -top-4 left-0 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow">
                                  {isEn ? 'AI LESION DETECTED:' : 'AI जखम/रोग आढळला:'} {(selectedCase.diagnosis.confidence_score * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/20">
                              {photoEvidenceList[selectedPhotoIndex].title} • {photoEvidenceList[selectedPhotoIndex].subtitle}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Photo Thumbnail Strip */}
                      <div className="md:col-span-4 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                          {isEn ? 'Select Angle Photo:' : 'तपासणी कोनाचा फोटो निवडा:'}
                        </span>
                        <div className="space-y-2">
                          {photoEvidenceList.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedPhotoIndex(idx)}
                              className={`p-2 rounded-xl border-2 flex items-center gap-2.5 cursor-pointer transition ${
                                selectedPhotoIndex === idx 
                                  ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-400' 
                                  : 'border-slate-200 bg-slate-50 hover:bg-white'
                              }`}
                            >
                              <img
                                src={item.url}
                                alt={item.title}
                                className="w-12 h-10 object-cover rounded-lg border border-slate-300 shrink-0"
                              />
                              <div className="truncate text-xs">
                                <span className="font-bold text-slate-900 block truncate">{item.title}</span>
                                <span className="text-[10px] text-slate-500 block truncate">{item.subtitle}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Krishi Sevak Ground Inspection Field Log */}
                    <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-emerald-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          {isEn ? 'Krishi Sevak Ground Inspection Findings:' : 'कृषी सेवक प्रत्यक्ष पाहणी अहवाल:'}
                        </span>
                        <span className="font-bold text-[10px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full">
                          {selectedCase.field_inspection?.officer_name || 'Anil S. Deshmukh (Ward-4)'} • {isEn ? 'GPS Verified' : 'GPS पडताळणी'}
                        </span>
                      </div>
                      <p className="text-slate-700 italic">
                        "{selectedCase.field_inspection?.officer_observation || (isEn ? 'Rosetted flowers detected in 25% sampled hills. Frass-plugged exit holes observed on lower bolls.' : '२५% झाडांवर गुलाबी फुले व छिद्रांवर विष्ठा दिसून आली.')}"
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-emerald-200/60 text-[11px]">
                        <div>{isEn ? 'Pheromone Trap:' : 'कामगंध सापळा:'} <strong className="text-rose-700 font-mono">14 moths/night (ETL &gt; 8)</strong></div>
                        <div>{isEn ? 'Affected Plants:' : 'रोगग्रस्त वनस्पती:'} <strong className="text-slate-900 font-mono">25%</strong></div>
                        <div>{isEn ? 'Pest Observed:' : 'कीटक दिसला:'} <strong className="text-emerald-700 font-bold">{isEn ? 'Yes (Larva frass)' : 'होय (अळीची विष्ठा)'}</strong></div>
                        <div>{isEn ? 'Officer Assessment:' : 'अधिकारी मूल्यांकन:'} <strong className="text-amber-800 font-bold">{selectedCase.field_inspection?.officer_assessment || 'VERIFIED'}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* 3.3 AI UNCERTAINTY DISTRIBUTION & RISK ENGINE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* AI Diagnosis & Alternative Probabilities */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5 text-xs">
                      <div className="border-b border-slate-100 pb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {isEn ? 'AI PREDICTION & UNCERTAINTY' : 'AI अंदाज व अनिश्चितता'}
                          </span>
                          <span className="font-mono font-black text-emerald-700">
                            {(selectedCase.diagnosis.confidence_score * 100).toFixed(1)}% {isEn ? 'Top Score' : 'सर्वोच्च स्कोअर'}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 mt-1">
                          {formatEntityName(selectedCase.diagnosis.detected_entity)}
                        </h4>
                        <span className="text-[11px] text-slate-500 italic">
                          {selectedCase.diagnosis.scientific_name} • {selectedCase.diagnosis.affected_plant_part}
                        </span>
                      </div>

                      {/* Top Alternative Probabilities Bar Distribution */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                          {isEn ? 'Uncertainty Distribution (Top Alternatives):' : 'पर्यायी संभाव्यता वितरण:'}
                        </span>
                        {(selectedCase.diagnosis.top_alternatives && selectedCase.diagnosis.top_alternatives.length > 0 
                          ? selectedCase.diagnosis.top_alternatives 
                          : [
                              { entity: "Pink Bollworm (गुलाबी बोंडअळी)", confidence_pct: 72.0 },
                              { entity: "American Bollworm (अमेरिकन बोंडअळी)", confidence_pct: 18.0 },
                              { entity: "Spodoptera litura (लष्करी अळी)", confidence_pct: 10.0 }
                            ]
                        ).map((alt, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-700">{idx+1}. {alt.entity}</span>
                              <span className="font-mono font-black text-slate-900">{alt.confidence_pct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-amber-500' : 'bg-slate-400'
                                }`}
                                style={{ width: `${alt.confidence_pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Visual Symptoms Checklist */}
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{isEn ? 'Detected Symptoms:' : 'लक्षणे:'}</span>
                        <ul className="text-slate-600 text-[11px] list-disc list-inside space-y-0.5">
                          {selectedCase.diagnosis.visual_symptoms?.map((sym, i) => (
                            <li key={i} className="truncate">{sym}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* 7-Day Epidemiological Risk & Local History */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5 text-xs">
                      <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                            {isEn ? 'EPIDEMIOLOGICAL CONTEXT' : 'रोगविषयक संदर्भ'}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 mt-1">
                            {isEn ? '7-Day Risk Score:' : '७ दिवसांचा धोका:'} <span className="text-rose-700 font-mono">
                              {(selectedCase.future_risk?.risk_score_pct || selectedCase.priority_score || 85).toFixed(0)}/100 {
                                (selectedCase.future_risk?.risk_score_pct || selectedCase.priority_score || 85) >= 80 ? (isEn ? '🔴 Critical' : '🔴 गंभीर') : (isEn ? '🟠 High' : '🟠 उच्च')
                              }
                            </span>
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">{isEn ? 'Local Proximity' : 'जवळपासची प्रकरणे'}</span>
                          <span className="font-black text-indigo-900 text-xs">
                            {selectedCase.farmer_profile.crop_name?.toLowerCase().includes('cotton')
                              ? (isEn ? '17 cases' : '१७ प्रकरणे')
                              : (isEn ? '12 cases' : '१२ प्रकरणे')} {isEn ? 'in 5km' : '५ किमीत'}
                          </span>
                        </div>
                      </div>

                      {/* Environmental Factors */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-500 block text-[10px]">{isEn ? 'Temp & Humidity' : 'तापमान व दमटपणा'}</span>
                          <strong className="text-slate-900">
                            {selectedCase.farmer_profile.crop_name?.toLowerCase().includes('soybean') ? '24-28°C • 88% RH' : '29-33°C • 82% RH'}
                          </strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-500 block text-[10px]">{isEn ? 'GDD Pest Window' : 'GDD कीड कालावधी'}</span>
                          <strong className="text-emerald-700 font-bold">
                            {selectedCase.farmer_profile.crop_name?.toLowerCase().includes('soybean')
                              ? (isEn ? 'Rust Sporulation Peak' : 'तांबेरा बीजाणू शिखर')
                              : (isEn ? 'Active Infestation' : 'सक्रिय कीड प्रादुर्भाव')}
                          </strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-500 block text-[10px]">{isEn ? 'Pheromone / Spore Traps' : 'कामगंध / बीजाणू सापळे'}</span>
                          <strong className="text-rose-700 font-bold">
                            {selectedCase.field_inspection?.is_etl_breached ? `${isEn ? 'Above ETL' : 'ETL पेक्षा जास्त'} (${selectedCase.field_inspection?.trap_count || 14}/trap)` : (isEn ? 'Moderate Catch' : 'मध्यम संख्या')}
                          </strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-500 block text-[10px]">{isEn ? 'Taluka Endemicity' : 'तालुका प्रादुर्भाव'}</span>
                          <strong className="text-slate-900">
                            {selectedCase.farmer_profile.taluka || 'Darwha'} ({selectedCase.farmer_profile.district || 'Yavatmal'})
                          </strong>
                        </div>
                      </div>

                      {/* Local History 30-Day Breakdown */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                          {isEn ? `Local History (Last 30 Days in ${selectedCase.farmer_profile.taluka || 'Darwha'}):` : `स्थानिक मागील ३० दिवसांचा इतिहास (${selectedCase.farmer_profile.taluka || 'दारव्हा'}):`}
                        </span>
                        <div className="space-y-1 text-[11px]">
                          {(selectedCase.farmer_profile.crop_name?.toLowerCase().includes('soybean')
                            ? [
                                { label: isEn ? "Soybean Rust (तांबेरा रोग)" : "तांबेरा रोग", count: 28, color: "text-rose-700" },
                                { label: isEn ? "Cercospora Leaf Spot (पानावरील करपा)" : "पानावरील करपा", count: 14, color: "text-amber-700" },
                                { label: isEn ? "Anthracnose / Pod Blight (अँथ्रॅक्नोज)" : "अँथ्रॅक्नोज", count: 8, color: "text-slate-600" }
                              ]
                            : selectedCase.farmer_profile.crop_name?.toLowerCase().includes('tomato')
                            ? [
                                { label: isEn ? "Tomato Late Blight (लेट ब्लाईट)" : "लेट ब्लाईट", count: 39, color: "text-rose-700" },
                                { label: isEn ? "Early Blight (अल्टर्नारिया)" : "लवकर येणारा करपा", count: 16, color: "text-amber-700" },
                                { label: isEn ? "Bacterial Spot (जिवाणू ठिपके)" : "जिवाणूजन्य ठिपके", count: 7, color: "text-slate-600" }
                              ]
                            : [
                                { label: isEn ? "Pink Bollworm (गुलाबी बोंडअळी)" : "गुलाबी बोंडअळी", count: 34, color: "text-rose-700" },
                                { label: isEn ? "Bacterial Blight (करपा)" : "जिवाणूजन्य करपा", count: 11, color: "text-amber-700" },
                                { label: isEn ? "Sucking Pests / Thrips (मावा/तुडतुडे)" : "मावा व तुडतुडे", count: 6, color: "text-slate-600" }
                              ]
                          ).map((item, idx) => (
                            <div key={idx} className="flex justify-between font-medium text-slate-700">
                              <span>{item.label}</span>
                              <span className={`font-mono font-bold ${item.color}`}>{item.count} {isEn ? 'cases' : 'प्रकरणे'}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-500 pt-1 flex justify-between">
                          <span>{isEn ? 'Nearby radius:' : 'जवळचा भाग (त्रिज्या):'} <strong>2km (4)</strong> • <strong>5km (13)</strong> • <strong>10km (28)</strong></span>
                          <span className="font-bold text-rose-700">
                            {(selectedCase.future_risk?.risk_score_pct || selectedCase.priority_score || 85) >= 80 ? (isEn ? 'Outbreak Cluster ⚠️' : 'उद्रेक क्षेत्र ⚠️') : (isEn ? 'Active Monitoring ✓' : 'चालू देखरेख ✓')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3.4 SPECIALIST DECISION STUDIO (4 PATHWAYS) */}
                  <div className="bg-white rounded-3xl p-6 border-2 border-indigo-200 shadow-lg space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                        {isEn ? 'SPECIALIST DECISION STUDIO' : 'तज्ज्ञ निर्णय कक्ष'}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        {isEn ? 'Record Agricultural Specialist Clinical Decision' : 'कृषी तज्ज्ञांचा अधिकृत निर्णय व शिफारस'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isEn ? 'Choose one of 4 authoritative decision pathways below' : 'खालील ४ अधिकृत पर्यायांपैकी योग्य निर्णय निवडा'}
                      </p>
                    </div>

                    {/* 4 PATHWAY CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* Pathway A */}
                      <button
                        type="button"
                        onClick={() => setDecisionPathway('CONFIRM')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-2 ${
                          decisionPathway === 'CONFIRM'
                            ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/40 shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-emerald-950 text-xs">{isEn ? 'A. CONFIRM' : 'A. पुष्टी करा'}</span>
                          <CheckCircle className={`w-4 h-4 ${decisionPathway === 'CONFIRM' ? 'text-emerald-600' : 'text-slate-400'}`} />
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {isEn ? 'AI prediction matches field evidence. Confirm & approve CIBRC IPM.' : 'AI निदान अचूक असून प्रमाणित CIBRC सल्ला पाठवा.'}
                        </p>
                        <span className="text-[10px] font-bold text-emerald-700">{isEn ? 'Ground Truth: Confirmed ✓' : 'ग्राउंड ट्रुथ: पुष्टीकृत ✓'}</span>
                      </button>

                      {/* Pathway B */}
                      <button
                        type="button"
                        onClick={() => setDecisionPathway('MODIFY')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-2 ${
                          decisionPathway === 'MODIFY'
                            ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/40 shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-amber-950 text-xs">{isEn ? 'B. MODIFY' : 'B. निदान बदला'}</span>
                          <GitPullRequest className={`w-4 h-4 ${decisionPathway === 'MODIFY' ? 'text-amber-600' : 'text-slate-400'}`} />
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {isEn ? 'Override AI with specialist diagnosis. Feeds Active Learning.' : 'AI चुकीचे असल्यास योग्य रोग निवडा (मॉडेल सुधारणा).'}
                        </p>
                        <span className="text-[10px] font-bold text-amber-700">{isEn ? 'Active Learning Edge Pool 🧬' : 'Active Learning विशेष पूल 🧬'}</span>
                      </button>

                      {/* Pathway C */}
                      <button
                        type="button"
                        onClick={() => setDecisionPathway('REQUEST_EVIDENCE')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-2 ${
                          decisionPathway === 'REQUEST_EVIDENCE'
                            ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/40 shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-indigo-950 text-xs">{isEn ? 'C. MORE EVIDENCE' : 'C. अधिक पुरावे मागवा'}</span>
                          <Camera className={`w-4 h-4 ${decisionPathway === 'REQUEST_EVIDENCE' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {isEn ? 'Inconclusive photos. Request specific angle/sample from Krishi Sevak.' : 'अधिक स्पष्टतेसाठी कृषी सेवकाकडून नवीन फोटो मागवा.'}
                        </p>
                        <span className="text-[10px] font-bold text-indigo-700">{isEn ? 'Notify Krishi Sevak 📋' : 'कृषी सेवकांना कळवा 📋'}</span>
                      </button>

                      {/* Pathway D */}
                      <button
                        type="button"
                        onClick={() => setDecisionPathway('REFER_LAB')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-2 ${
                          decisionPathway === 'REFER_LAB'
                            ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/40 shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-purple-950 text-xs">{isEn ? 'D. REFER TO LAB' : 'D. प्रयोगशाळेकडे पाठवा'}</span>
                          <QrCode className={`w-4 h-4 ${decisionPathway === 'REFER_LAB' ? 'text-purple-600' : 'text-slate-400'}`} />
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {isEn ? 'Physical/pathological test required. Generate Digital Lab Slip.' : 'नमुना PCR / मायक्रोस्कोपी तपासणीसाठी प्रयोगशाळेकडे पाठवा.'}
                        </p>
                        <span className="text-[10px] font-bold text-purple-700">{isEn ? 'ICAR Chain of Custody 🧪' : 'ICAR नमुना हस्तांतरण साखळी 🧪'}</span>
                      </button>
                    </div>

                    {/* DYNAMIC FORM BASED ON PATHWAY */}
                    <form onSubmit={handleDecisionSubmit} className="space-y-4 pt-2">
                      
                      {/* PATHWAY B: MODIFY DIAGNOSIS OPTIONS */}
                      {decisionPathway === 'MODIFY' && (
                        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3 text-xs">
                          <span className="font-black text-amber-950 flex items-center gap-2 text-sm">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            {isEn ? 'Specialist Diagnosis Override' : 'तज्ज्ञांचे अचूक निदान व कारण'}
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">
                                {isEn ? 'Select Correct Pest/Disease:' : 'योग्य कीड किंवा रोग निवडा:'}
                              </label>
                              <select
                                value={modifiedDiagnosis}
                                onChange={(e) => setModifiedDiagnosis(e.target.value)}
                                className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-bold text-slate-900"
                              >
                                <option value="American Bollworm (अमेरिकन बोंडअळी)">American Bollworm (अमेरिकन बोंडअळी - Helicoverpa armigera)</option>
                                <option value="Spodoptera litura (तंबाखूची लष्करी अळी)">Spodoptera litura (लष्करी अळी)</option>
                                <option value="Cotton Pink Bollworm (गुलाबी बोंडअळी)">Cotton Pink Bollworm (गुलाबी बोंडअळी)</option>
                                <option value="Bacterial Blight (जिवाणूजन्य करपा)">Bacterial Blight (जिवाणूजन्य करपा)</option>
                                <option value="Soybean Rust (तांबेरा रोग)">Soybean Rust (तांबेरा)</option>
                                <option value="Cercospora Leaf Spot (पानावरील ठिपके)">Cercospora Leaf Spot</option>
                              </select>
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">
                                {isEn ? 'Override Rationale (Dataset Training Metadata):' : 'बदलाचे शास्त्रीय कारण:'}
                              </label>
                              <select
                                value={overrideReason}
                                onChange={(e) => setOverrideReason(e.target.value)}
                                className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-bold text-slate-900"
                              >
                                <option value="Morphological field evidence inconsistent with AI prediction">{isEn ? 'Morphological field evidence inconsistent with AI' : 'शेतातील पुरावा AI अंदाजाशी जुळत नाही'}</option>
                                <option value="Larval coloration & dorsal banding indicates alternative species">{isEn ? 'Larval coloration & dorsal banding distinct' : 'अळीचा रंग व पाठीवरील रेषा वेगळी प्रजात दर्शवते'}</option>
                                <option value="Rosetted petal pattern absent; entry hole frass is coarse">{isEn ? 'Frass texture and entrance bore diameter differs' : 'गुलाबी फुले नसून छिद्राची विष्ठा व व्यासातील फरक'}</option>
                                <option value="Pheromone trap captures indicate high American Bollworm activity">{isEn ? 'Pheromone trap surveillance correlation' : 'कामगंध सापळ्यात अमेरिकन बोंडअळीची उच्च संख्या'}</option>
                                <option value="OTHER">{isEn ? 'Other specific specialist reason...' : 'इतर विशेष कारण...'}</option>
                              </select>
                            </div>
                          </div>

                          {overrideReason === 'OTHER' && (
                            <input
                              type="text"
                              placeholder={isEn ? "Specify custom morphological override reason..." : "तपशीलवार कारण नमूद करा..."}
                              value={customOverrideReason}
                              onChange={(e) => setCustomOverrideReason(e.target.value)}
                              className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                            />
                          )}

                          <div className="text-[11px] text-amber-900 bg-amber-100/60 p-2.5 rounded-xl border border-amber-200">
                            🧬 <strong>{isEn ? 'Active Learning Guarantee:' : 'Active Learning हमी:'}</strong> {isEn ? 'The original AI prediction' : 'मूळ AI अंदाज'} (<em>{selectedCase.diagnosis.detected_entity}</em>) {isEn ? 'and your specialist diagnosis' : 'आणि तुमचे तज्ज्ञ निदान'} (<em>{modifiedDiagnosis}</em>) {isEn ? 'will both be immutably recorded for dataset retraining.' : 'या दोन्ही माहिती डेटासेट सुधारण्यासाठी कायमच्या नोंदवल्या जातील.'}
                          </div>
                        </div>
                      )}

                      {/* PATHWAY C: REQUEST MORE EVIDENCE CHECKLIST */}
                      {decisionPathway === 'REQUEST_EVIDENCE' && (
                        <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 space-y-3 text-xs">
                          <span className="font-black text-indigo-950 flex items-center gap-2 text-sm">
                            <Camera className="w-4 h-4 text-indigo-600" />
                            {isEn ? 'Select Required Additional Evidence from Krishi Sevak:' : 'कृषी सेवकाकडून आवश्यक शेत पुरावे निवडा:'}
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {[
                              { id: 'additional_leaf_photo', label: isEn ? '☑ Additional Leaf Macro Photo' : '☑ पानाचा क्लोज-अप फोटो' },
                              { id: 'closeup_insect_photo', label: isEn ? '☑ Close-up Larva / Insect Photo' : '☑ किडीचा / अळीचा स्पष्ट फोटो' },
                              { id: 'whole_plant_canopy', label: isEn ? '☑ Whole-Plant Canopy Photo' : '☑ संपूर्ण झाडाचा विस्तार फोटो' },
                              { id: 'trap_photo', label: isEn ? '☑ Pheromone Trap Photo' : '☑ कामगंध सापळ्याचा फोटो' },
                              { id: 'field_reinspection', label: isEn ? '☑ Re-inspect Sample Hills' : '☑ शेताची फेरतपासणी' },
                              { id: 'sample_collection', label: isEn ? '☑ Physical Tissue Collection' : '☑ पानाचा नमुना संकलन' }
                            ].map(item => (
                              <label
                                key={item.id}
                                className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer font-bold ${
                                  evidenceChecklist[item.id]
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-slate-700 border-slate-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={!!evidenceChecklist[item.id]}
                                  onChange={(e) => setEvidenceChecklist({
                                    ...evidenceChecklist,
                                    [item.id]: e.target.checked
                                  })}
                                  className="w-4 h-4 rounded text-indigo-600"
                                />
                                <span className="text-xs">{item.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PATHWAY D: REFER TO LAB SLIP OPTIONS */}
                      {decisionPathway === 'REFER_LAB' && (
                        <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-3 text-xs">
                          <span className="font-black text-purple-950 flex items-center gap-2 text-sm">
                            <QrCode className="w-4 h-4 text-purple-600" />
                            {isEn ? 'Digital Diagnostic Lab Referral Specification' : 'डिजिटल प्रयोगशाळा रेफरल तपशील'}
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">
                                {isEn ? 'Specimen Type:' : 'नमुन्याचा प्रकार:'}
                              </label>
                              <select
                                value={labSpecimen}
                                onChange={(e) => setLabSpecimen(e.target.value)}
                                className="w-full bg-white border border-purple-300 rounded-xl p-2.5 font-bold text-slate-900"
                              >
                                <option value="Leaf Sample (पानाचा नमुना)">Leaf Sample (पानाचा नमुना)</option>
                                <option value="Internal Boll Core (बोंड छेद नमुना)">Internal Boll Core (बोंड छेद)</option>
                                <option value="Larval Specimen (अळीचा नमुना)">Larval Specimen (अळीचा नमुना)</option>
                                <option value="Stem Cut (खोडाचा तुकडा)">Stem Cut (खोडाचा तुकडा)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">
                                {isEn ? 'Required Diagnostic Test:' : 'आवश्यक तपासणी पद्धत:'}
                              </label>
                              <select
                                value={labTestMethod}
                                onChange={(e) => setLabTestMethod(e.target.value)}
                                className="w-full bg-white border border-purple-300 rounded-xl p-2.5 font-bold text-slate-900"
                              >
                                <option value="Molecular PCR & DNA Barcoding">Molecular PCR & DNA Barcoding</option>
                                <option value="Microscopy & Pathogen Staining">Microscopy & Pathogen Staining</option>
                                <option value="ELISA Immunoassay">ELISA Immunoassay</option>
                                <option value="Bacterial Pure Culture Isolation">Bacterial Pure Culture Isolation</option>
                              </select>
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">
                                {isEn ? 'Testing Priority:' : 'प्राधान्य:'}
                              </label>
                              <select
                                value={labPriority}
                                onChange={(e) => setLabPriority(e.target.value)}
                                className="w-full bg-white border border-purple-300 rounded-xl p-2.5 font-bold text-slate-900"
                              >
                                <option value="HIGH">{isEn ? 'HIGH (Turnaround 24h)' : 'उच्च (२४ तासांत निकाल)'}</option>
                                <option value="URGENT_OUTBREAK">{isEn ? 'URGENT OUTBREAK (Turnaround 12h)' : 'तातडीचा उद्रेक (१२ तासांत निकाल)'}</option>
                                <option value="ROUTINE">{isEn ? 'ROUTINE (Turnaround 48h)' : 'सामान्य (४८ तासांत निकाल)'}</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STRUCTURED CLINICAL ANNOTATIONS */}
                      <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                        <span className="font-extrabold text-slate-900 text-xs block uppercase tracking-wider">
                          {isEn ? 'Structured Specialist Clinical Notes & Reasoning' : 'तज्ज्ञ शेरा व वैज्ञानिक विश्लेषण'}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              {isEn ? 'Morphological Observations:' : 'दृश्यमान शारीरिक निरीक्षण:'}
                            </label>
                            <input
                              type="text"
                              value={morphologicalNotes}
                              onChange={(e) => setMorphologicalNotes(e.target.value)}
                              placeholder={isEn ? 'e.g. Hexagonal rosetted flower and frass plugged entry hole.' : 'उदा. गुलाबी फुले व छिद्रांवर विष्ठा दिसणे.'}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              {isEn ? 'Differential Diagnosis:' : 'संभाव्य पर्यायी रोग विश्लेषण:'}
                            </label>
                            <input
                              type="text"
                              value={differentialDx}
                              onChange={(e) => setDifferentialDx(e.target.value)}
                              placeholder={isEn ? 'e.g. Pink Bollworm vs American Bollworm' : 'उदा. गुलाबी बोंडअळी विरुद्ध अमेरिकन बोंडअळी'}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            {isEn ? 'Prescription & Field Instructions (Dispatched to Farmer & Krishi Sevak):' : 'फवारणी सूचना व शेतकऱ्यास सल्ला:'}
                          </label>
                          <textarea
                            rows={2}
                            value={clinicalNotes}
                            onChange={(e) => setClinicalNotes(e.target.value)}
                            placeholder={isEn ? 'e.g. Release Trichogramma egg parasitoids @ 1.5 lakh/ha + spray Emamectin Benzoate 5% SG within 48 hours.' : 'उदा. ट्रायकोग्रामा १.५ लाख/हेक्टर सोडा + इमामेक्टिन बेन्झोएट ५% फवारा.'}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                          />
                        </div>

                        {/* Follow-up Interval & Outbreak Escalation Check */}
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-700">{isEn ? 'Follow-up Revisit in:' : 'पुढील फेरपाहणी:'}</span>
                            <div className="flex items-center gap-1.5 font-bold">
                              {[3, 5, 7].map(days => (
                                <button
                                  type="button"
                                  key={days}
                                  onClick={() => setFollowupDays(days)}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                    followupDays === days
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-white text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  {days} {isEn ? 'Days' : 'दिवस'}
                                </button>
                              ))}
                            </div>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-rose-900 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                            <input
                              type="checkbox"
                              checked={escalateOutbreak}
                              onChange={(e) => setEscalateOutbreak(e.target.checked)}
                              className="w-4 h-4 text-rose-600 rounded"
                            />
                            <span>{isEn ? '🚨 Flag as Outbreak Surge (Notify Govt)' : '🚨 कीड उद्रेक म्हणून नोंदवा (शासकीय अलर्ट)'}</span>
                          </label>
                        </div>
                      </div>

                      {/* 3.5 AUTHORITATIVE CIBRC IPM ADVISORY APPROVAL */}
                      <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-emerald-950 flex items-center gap-2 text-sm">
                            <Award className="w-4 h-4 text-emerald-600" />
                            {isEn ? 'Authoritative CIBRC IPM Advisory Preview' : 'प्रमाणित CIBRC सल्ला पूर्वदृश्य'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingAdvisory(!editingAdvisory)}
                            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 underline"
                          >
                            {editingAdvisory ? (isEn ? 'Close Editor' : 'संपादक बंद करा') : (isEn ? '✏️ Edit Molecule/Dosage' : '✏️ औषध/प्रमाण बदला')}
                          </button>
                        </div>

                        {/* 4-Tier Plan */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                            <strong className="text-emerald-900 block font-bold">🌱 Cultural (मशागतीय):</strong>
                            <p className="text-slate-700 mt-0.5">
                              {renderI18nText(
                                selectedCase.diagnosis?.authoritative_ipm?.cultural_control?.[0] || selectedCase.diagnosis?.authoritative_ipm?.cultural_practices?.[0],
                                selectedCase.farmer_profile?.crop_name?.toLowerCase().includes('soybean')
                                  ? (isEn ? "Ensure proper drainage in fields; avoid dense plant spacing and excessive nitrogen application." : "शेतात पाण्याचा निचरा करा व जास्त नत्र खत देणे टाळा.")
                                  : selectedCase.farmer_profile?.crop_name?.toLowerCase().includes('cotton')
                                  ? (isEn ? "Collect and destroy rosetted flowers & drop bolls to break larval cycle." : "गुलाबी बोंडअळीच्या नियंत्रणासाठी गळालेली बोंडे व फुले गोळा करून नष्ट करा.")
                                  : (isEn ? "Maintain clean field sanitation and destroy infected crop residues." : "शेतातील रोगट अवशेषांची स्वच्छता ठेवा.")
                              )}
                            </p>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                            <strong className="text-emerald-900 block font-bold">⚙️ Mechanical / Trap (यांत्रिक व सापळे):</strong>
                            <p className="text-slate-700 mt-0.5">
                              {renderI18nText(
                                selectedCase.diagnosis?.authoritative_ipm?.mechanical_control?.[0],
                                selectedCase.farmer_profile?.crop_name?.toLowerCase().includes('soybean')
                                  ? (isEn ? "Set up light traps and sticky yellow/blue traps @ 8 per acre." : "एकर ८ पिवळे/निळे चिकट सापळे व प्रकाश सापळे लावा.")
                                  : selectedCase.farmer_profile?.crop_name?.toLowerCase().includes('cotton')
                                  ? (isEn ? "Install Gossyplure pheromone traps @ 5/acre to monitor moth flight." : "एकर ५ कामगंध सापळे (Gossyplure) लावा.")
                                  : (isEn ? "Deploy yellow sticky traps @ 10 per acre to monitor insect vectors." : "एकर १० पिवळे चिकट सापळे लावा.")
                              )}
                            </p>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                            <strong className="text-emerald-900 block font-bold">🐛 Biological (जैविक):</strong>
                            <p className="text-slate-700 mt-0.5">
                              {renderI18nText(
                                selectedCase.diagnosis?.authoritative_ipm?.biological_control?.[0],
                                selectedCase.farmer_profile?.crop_name?.toLowerCase().includes('soybean')
                                  ? (isEn ? "Foliar spray of Trichoderma harzianum @ 5 gm/liter at first sign of pustules." : "ट्रायकोडर्मा हरझियानम ५ ग्रॅम/लिटर या प्रमाणात फवारा.")
                                  : selectedCase.farmer_profile?.crop_name?.toLowerCase().includes('cotton')
                                  ? (isEn ? "Release Trichogramma bactrae @ 1.5 lakh eggs/ha at weekly interval." : "ट्रायकोग्रामा बॅक्ट्रे १.५ लाख अंडी/हेक्टर या प्रमाणात सोडा.")
                                  : (isEn ? "Foliar spray of Bacillus subtilis or Pseudomonas fluorescens @ 5 gm/liter." : "बॅसिलस सबटिलिस किंवा स्युडोमोनास ५ ग्रॅम/लिटर फवारा.")
                              )}
                            </p>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                            <strong className="text-emerald-900 block font-bold">🧪 Chemical (CIBRC Approved / रासायनिक):</strong>
                            {editingAdvisory ? (
                              <div className="space-y-1.5 mt-1">
                                <input
                                  type="text"
                                  value={customMolecule}
                                  onChange={(e) => setCustomMolecule(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded p-1 text-[11px] font-bold"
                                />
                                <input
                                  type="text"
                                  value={customDosage}
                                  onChange={(e) => setCustomDosage(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded p-1 text-[11px]"
                                />
                              </div>
                            ) : (
                              <p className="text-slate-900 font-bold mt-0.5">
                                {customMolecule || selectedCase.diagnosis?.authoritative_ipm?.chemical_control?.[0]?.active_ingredient || selectedCase.diagnosis?.authoritative_ipm?.chemical_control?.[0]?.trade_name || (isEn ? 'Recommended CIBRC Molecule' : 'CIBRC शिफारसित औषध')} ({
                                  customDosage || selectedCase.diagnosis?.authoritative_ipm?.chemical_control?.[0]?.dosage_per_15l_pump || '15 ml / 15L pump'
                                }) • PHI: {selectedCase.diagnosis?.authoritative_ipm?.chemical_control?.[0]?.phi_days || 10} {isEn ? 'Days' : 'दिवस'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* FINAL DISPATCH BUTTON */}
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-indigo-700 to-indigo-800 hover:from-indigo-800 hover:to-indigo-900 text-white font-black px-6 py-3 rounded-2xl shadow-lg transition flex items-center gap-2 text-sm disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                          <span>
                            {isSubmitting 
                              ? (isEn ? 'Dispatching...' : 'नोंदवत आहे...') 
                              : (isEn ? '🚀 Confirm Decision & Dispatch Validated Advisory' : '🚀 अधिकृत निर्णय जतन करा व सल्ला पाठवा')}
                          </span>
                        </button>
                      </div>

                    </form>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 shadow-sm space-y-3">
                  <Microscope className="w-12 h-12 mx-auto text-indigo-400 opacity-60" />
                  <h3 className="font-bold text-slate-800 text-base">{isEn ? 'Select a case from the queue to review' : 'तपासणीसाठी यादीतून प्रकरण निवडा'}</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {isEn ? 'Access multi-modal photographic evidence, AI uncertainty breakdown, and specialist decision studio.' : 'शेत फोटो, AI विश्लेषण व CIBRC सल्ला पडताळण्यासाठी प्रकरण निवडा.'}
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: ACTIVE LEARNING & GROUND TRUTH POOL */}
      {/* ========================================================================= */}
      {activeTab === 'active_learning' && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  {isEn ? 'STEP 15 & 16 — ACTIVE LEARNING RETRAINING PIPELINE' : 'पायरी १५ व १६ — मॉडेल सुधारणा पाइपलाइन'}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {isEn ? 'Continuous AI Improvement' : 'AI मध्ये सतत सुधारणा'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                {isEn ? 'Active Learning Candidate Pool (Prediction ≠ Ground Truth)' : 'Active Learning कॅन्डिडेट पूल (अंदाज ≠ ग्राउंड ट्रुथ)'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn ? 'Edge cases where AI predictions diverged from field truth or specialist diagnosis are curated here for neural retraining.' : 'शेताच्या सत्यतेपेक्षा AI अंदाज वेगळा असलेली प्रकरणे येथे मॉडेल प्रशिक्षणासाठी निवडली जातात.'}
              </p>
            </div>

            <button
              onClick={() => alert(isEn ? "Dataset exported to PyTorch / YOLOv8 format (coco_annotations.jsonl)!" : "डेटासेट यशस्वीरीत्या एक्स्पोर्ट केला!")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? 'Export Curated Dataset (.JSONL)' : 'डेटासेट एक्स्पोर्ट करा'}</span>
            </button>
          </div>

          {/* ACTIVE LEARNING FLOW DIAGRAM */}
          <div className="bg-slate-950 text-white p-4 rounded-2xl text-xs font-mono overflow-x-auto">
            <div className="flex items-center justify-between min-w-[650px] gap-2 text-center">
              <div className="bg-indigo-900/60 p-2.5 rounded-xl border border-indigo-400/40">
                <Cpu className="w-5 h-5 mx-auto text-indigo-300 mb-1" />
                <span className="block font-bold">{isEn ? '1. AI Model' : '१. AI मॉडेल'}</span>
                <span className="text-[9px] text-indigo-300">Pink Bollworm (72%)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-400/40">
                <Camera className="w-5 h-5 mx-auto text-emerald-300 mb-1" />
                <span className="block font-bold">{isEn ? '2. Krishi Sevak' : '२. कृषी सेवक'}</span>
                <span className="text-[9px] text-emerald-300">{isEn ? '4-Angle Photos' : '४ कोनांचे फोटो'}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="bg-amber-900/60 p-2.5 rounded-xl border border-amber-400/40">
                <Microscope className="w-5 h-5 mx-auto text-amber-300 mb-1" />
                <span className="block font-bold">{isEn ? '3. Agri Specialist' : '३. कृषी तज्ज्ञ'}</span>
                <span className="text-[9px] text-amber-300">{isEn ? 'Ground Truth Override' : 'ग्राउंड ट्रुथ दुरुस्ती'}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="bg-purple-900/60 p-2.5 rounded-xl border border-purple-400/40">
                <Database className="w-5 h-5 mx-auto text-purple-300 mb-1" />
                <span className="block font-bold">{isEn ? '4. Retraining Pool' : '४. प्रशिक्षण पूल'}</span>
                <span className="text-[9px] text-purple-300">{isEn ? 'Curated Weights' : 'निवडक मॉडेल वेट्स'}</span>
              </div>
            </div>
          </div>

          {/* CANDIDATES TABLE */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm">
              {isEn ? 'Curated Edge Case Candidates' : 'नोंदवलेले विशेष केसेस'}
            </h3>

            <div className="space-y-3">
              {(activeLearningPool && activeLearningPool.length > 0 ? activeLearningPool : [
                {
                  case_id: "MH-YAV-10231",
                  farmer_name: "Ramesh Patil (रमेश पाटील)",
                  crop: "Cotton",
                  district: "Yavatmal",
                  image_url: "https://images.unsplash.com/photo-1599818434736-2311f6c770c3?auto=format&fit=crop&w=600&q=80",
                  ai_prediction: "Cotton Pink Bollworm (गुलाबी बोंडअळी)",
                  ai_confidence_pct: 72.0,
                  expert_ground_truth: "American Bollworm (अमेरिकन बोंडअळी)",
                  override_reason: "Morphological larval banding and exit frass inconsistent with AI prediction.",
                  curation_status: "APPROVED_FOR_DATASET"
                },
                {
                  case_id: "MH-YAV-10228",
                  farmer_name: "Suresh Rathod (सुरेश राठोड)",
                  crop: "Soybean",
                  district: "Yavatmal",
                  image_url: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&w=600&q=80",
                  ai_prediction: "Soybean Rust (तांबेरा रोग)",
                  ai_confidence_pct: 58.0,
                  expert_ground_truth: "Cercospora Leaf Spot (पानावरील करपा)",
                  override_reason: "High humidity chlorosis confused with rust pustules.",
                  curation_status: "PENDING_DATASET_REVIEW"
                }
              ]).map(item => (
                <div key={item.case_id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={item.image_url} 
                      alt={isEn ? 'Candidate' : 'अर्जदार'} 
                      className="w-16 h-16 object-cover rounded-xl border border-slate-300 shrink-0" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900">#{item.case_id}</span>
                        <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          {item.crop} ({item.district})
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          item.curation_status === 'APPROVED_FOR_DATASET' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.curation_status}
                        </span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <div className="text-slate-600">
                          {isEn ? 'AI Prior:' : 'AI प्राथमिक अंदाज:'} <strong className="text-rose-700 line-through">{item.ai_prediction}</strong> ({item.ai_confidence_pct}%)
                        </div>
                        <div className="text-slate-900 font-bold">
                          {isEn ? 'Specialist Ground Truth:' : 'तज्ज्ञ ग्राउंड ट्रुथ:'} <strong className="text-emerald-700">{item.expert_ground_truth}</strong>
                        </div>
                        <p className="text-slate-500 text-[11px] italic">{isEn ? 'Reason:' : 'कारण:'} "{item.override_reason}"</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCurateCandidate(item.case_id, 'APPROVED_FOR_DATASET')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Approve for Retraining' : 'प्रशिक्षणास मंजूर करा'}</span>
                    </button>
                    <button
                      onClick={() => handleCurateCandidate(item.case_id, 'REJECTED')}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition"
                    >
                      <span>{isEn ? 'Reject' : 'नाकारा'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: OUTBREAK SURVEILLANCE & STATE ESCALATION RADAR */}
      {/* ========================================================================= */}
      {activeTab === 'outbreak_radar' && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase bg-rose-100 text-rose-900 px-2.5 py-0.5 rounded-full">
                  {isEn ? 'STEP 17 & 18 — EPIDEMIOLOGICAL SURVEILLANCE & STATE ESCALATION' : 'पायरी १७ व १८ — रोग देखरेख व शासन चेतावणी'}
                </span>
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {isEn ? 'Active Surge Detected' : 'कीड उद्रेक सुरू'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                {isEn ? 'Regional Outbreak Radar — Yavatmal Cotton Cluster' : 'प्रादेशिक उद्रेक रडार — यवतमाळ कापूस क्षेत्र'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn ? 'Epidemiological curve and surge velocity tracker. Agricultural Specialists can escalate emerging outbreaks directly to the Maharashtra State Government.' : 'रोग प्रसाराचा आलेख व वेग. कृषी तज्ज्ञ उद्रेक तातडीने महाराष्ट्र शासनाला कळवू शकतात.'}
              </p>
            </div>

            <button
              onClick={handleEscalateOutbreakToGovt}
              className="bg-rose-700 hover:bg-rose-800 text-white font-black px-5 py-2.5 rounded-2xl shadow-lg text-xs flex items-center gap-2 transition"
            >
              <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>{isEn ? '🚨 Escalate Outbreak to State Govt' : '🚨 शासनास तातडीचा अलर्ट पाठवा'}</span>
            </button>
          </div>

          {/* 4-DAY SURGE TRAJECTORY GRAPH & METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Surge Trajectory Curve */}
            <div className="md:col-span-2 bg-slate-950 text-white p-5 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block">
                    {isEn ? '4-DAY EPIDEMIOLOGICAL TRAJECTORY (SURGE VELOCITY)' : '४ दिवसांचा रोग प्रसार आलेख (उद्रेक वेग)'}
                  </span>
                  <h4 className="text-base font-black text-white mt-0.5">
                    {isEn ? 'Cotton Pink Bollworm Outbreak Curve' : 'कापूस गुलाबी बोंडअळी उद्रेक आलेख'}
                  </h4>
                </div>
                <span className="text-rose-400 font-mono font-bold text-xs bg-rose-950 px-2.5 py-1 rounded-full border border-rose-800">
                  {isEn ? '↗ Exponential Surge (R0 = 2.8)' : '↗ वेगवान प्रसार (R0 = 2.8)'}
                </span>
              </div>

              {/* Graphical Bars */}
              <div className="grid grid-cols-4 gap-3 items-end h-40 pt-6 px-2">
                {[
                  { day: isEn ? "Day 1" : "दिवस 1", count: 4, h: "h-8", color: "bg-slate-700" },
                  { day: isEn ? "Day 2" : "दिवस 2", count: 9, h: "h-16", color: "bg-amber-600" },
                  { day: isEn ? "Day 3" : "दिवस 3", count: 18, h: "h-28", color: "bg-orange-600" },
                  { day: isEn ? "Day 4 (Today)" : "दिवस 4 (आज)", count: 31, h: "h-36", color: "bg-rose-600" }
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="font-mono font-black text-xs text-white">{bar.count} {isEn ? 'cases' : 'प्रकरणे'}</span>
                    <div className={`w-full ${bar.h} ${bar.color} rounded-t-xl transition-all duration-500`} />
                    <span className="text-[11px] font-bold text-slate-400">{bar.day}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs flex justify-between text-slate-300">
                <span>{isEn ? 'Confirmed cases:' : 'पुष्टीकृत प्रकरणे:'} <strong className="text-white">47</strong></span>
                <span>{isEn ? 'AI Suspected:' : 'AI संशयित:'} <strong className="text-amber-400">63</strong></span>
                <span>{isEn ? 'ETL Breaches:' : 'ETL उल्लंघन:'} <strong className="text-rose-400">18</strong></span>
                <span>{isEn ? '7-Day Risk:' : '७ दिवसांचा धोका:'} <strong className="text-rose-400">91/100</strong></span>
              </div>
            </div>

            {/* Specialist Action Box */}
            <div className="bg-rose-50 p-5 rounded-3xl border-2 border-rose-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-rose-800 tracking-wider block">
                  {isEn ? 'EPIDEMIOLOGICAL ASSESSMENT' : 'रोग प्रसार मूल्यांकन'}
                </span>
                <h4 className="font-black text-rose-950 text-base">
                  {isEn ? 'Potential Regional Outbreak' : 'संभाव्य प्रादेशिक उद्रेक'}
                </h4>
                <p className="text-xs text-rose-900 leading-relaxed">
                  {isEn ? 'The sudden jump from 4 to 31 cases across 6 villages in Darwha indicates an active second-generation moth emergence. Immediate aerial/village SMS advisory is recommended.' : 'दारव्ह्यातील ६ गावांमध्ये प्रकरणे ४ वरून ३१ पर्यंत वाढून दुस-या पिढीचा कीटक उद्रेक दिसतो. त्वरित SMS सल्ला पाठवण्याची शिफारस आहे.'}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-rose-200">
                <button
                  onClick={handleEscalateOutbreakToGovt}
                  className="w-full bg-rose-700 hover:bg-rose-800 text-white font-bold p-3 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEn ? 'Dispatch State Govt Alert' : 'शासनास तातडीचा अलर्ट पाठवा'}</span>
                </button>
                <p className="text-[10px] text-rose-700 text-center font-medium">
                  {isEn ? 'Triggers immediate SMS broadcast to 12,500 cotton growers in Yavatmal.' : 'यवतमाळमधील १२,५०० कापूस शेतकऱ्यांना त्वरित SMS पाठवले जाईल.'}
                </p>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: DIGITAL LAB & SPECIMEN TRACKING */}
      {/* ========================================================================= */}
      {activeTab === 'lab_tracking' && (
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                {isEn ? 'DIAGNOSTIC LABORATORY CHAIN OF CUSTODY' : 'प्रयोगशाळा नमुना हस्तांतरण साखळी'}
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                {isEn ? 'Active Diagnostic Specimen Tracking & Assay Reports' : 'सक्रिय नमुना ट्रॅकिंग व तपासणी अहवाल'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEn ? 'Real-time tracking of physical specimens dispatched to ICAR / MPKV diagnostic laboratories.' : 'ICAR / MPKV प्रयोगशाळांमध्ये पाठवलेल्या नमुन्यांचे थेट ट्रॅकिंग.'}
              </p>
            </div>
            <span className="bg-purple-100 text-purple-900 font-bold px-3 py-1 rounded-xl text-xs">
              {labSamples.length} {isEn ? 'Active Specimens' : 'सक्रिय नमुने'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {labSamples.map(spl => (
              <div key={spl.sample_id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-black text-purple-900 text-sm">#{spl.sample_id}</span>
                    <span className="text-slate-600 block text-xs font-bold mt-0.5">
                      {isEn ? spl.farmer_name?.split('(')[0]?.trim() : spl.farmer_name} • {spl.district}
                    </span>
                    <span className="text-slate-500 text-[11px] block">{spl.crop} — {formatEntityName(spl.suspected_pathogen)}</span>
                  </div>
                  <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase">
                    {spl.status}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                  <div>{isEn ? 'Specimen:' : 'नमुना:'} <strong className="text-slate-900">{spl.specimen_type || 'Leaf Tissue Core'}</strong></div>
                  <div>{isEn ? 'Test Required:' : 'आवश्यक तपासणी:'} <strong className="text-indigo-900">{spl.test_method || 'Molecular PCR'}</strong></div>
                  <div>{isEn ? 'Destination Lab:' : 'गंतव्य प्रयोगशाळा:'} <strong className="text-slate-900">{spl.lab_name}</strong></div>
                  <div>{isEn ? 'Dispatched on:' : 'पाठवण्याची तारीख:'} <strong className="text-slate-700">{spl.dispatch_date}</strong></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-purple-900 font-bold pt-1">
                  <span>{isEn ? 'Chain of Custody:' : 'नमुना हस्तांतरण साखळी:'} <strong>{isEn ? 'VERIFIED ✓' : 'पडताळलेले ✓'}</strong></span>
                  <button 
                    onClick={() => alert(isEn ? `Viewing Digital Lab Slip for Sample #${spl.sample_id}` : `नमुना #${spl.sample_id} ची प्रयोगशाळा स्लिप पाहत आहे`)}
                    className="text-purple-700 hover:text-purple-900 underline flex items-center gap-1"
                  >
                    <span>{isEn ? 'View QR Chain' : 'QR साखळी पहा'}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
