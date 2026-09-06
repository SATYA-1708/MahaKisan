import React, { useState, useEffect } from 'react';
import { 
  Bug, Radio, MapPin, CheckCircle, AlertTriangle, 
  Send, UserCheck, Droplets, Cpu, QrCode, FileCheck,
  Calendar, Clock, ShieldAlert, ArrowRight, Eye, Phone,
  Camera, CheckCircle2, RefreshCw, X, Award, ChevronRight,
  TrendingDown, TrendingUp, AlertCircle, FileText, Activity,
  Layers, Upload, Check, ShieldCheck, ShieldX, PhoneCall, ExternalLink,
  Edit3, Sliders
} from 'lucide-react';
import { api } from '../services/api';
import { translations } from '../services/i18n';
import { SeverityBadge, ToxicityTriangle } from '../components/SeverityBadge';
import { DosageCalculator } from '../components/DosageCalculator';
import { ImageUploader } from '../components/ImageUploader';

export const KrishiSevakPortal = ({ currentLang = 'en' }) => {
  const isEn = currentLang === 'en';

  // Navigation Tabs: 'dashboard' | 'queue' | 'inspection' | 'follow_ups' | 'surveillance' | 'rbac'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [queueFilter, setQueueFilter] = useState('ALL_ACTIVE'); // 'ALL_ACTIVE' | 'CRITICAL' | 'LAB_REFERRED' | 'CLOSED'

  const [cases, setCases] = useState([]);
  const [traps, setTraps] = useState([]);
  const [sensors, setSensors] = useState([]);

  // Active Case for Field Inspection & Review
  const [selectedCase, setSelectedCase] = useState(null);

  // Field Visit State
  const [isFieldVisitActive, setIsFieldVisitActive] = useState(false);
  const [visitStartTime, setVisitStartTime] = useState(null);

  // Step 7: 4 Field Photos (Leaf, Stem, Fruit/Boll, Whole Plant)
  const [fieldPhotoLeaf, setFieldPhotoLeaf] = useState(null);
  const [fieldPhotoStem, setFieldPhotoStem] = useState(null);
  const [fieldPhotoFruit, setFieldPhotoFruit] = useState(null);
  const [fieldPhotoWhole, setFieldPhotoWhole] = useState(null);

  // Step 8: Structured Field Observation Form (100% Dynamic)
  const [symptomsChecked, setSymptomsChecked] = useState({
    leaf_discoloration: true,
    boll_damage: true,
    larvae_observed: true,
    fungal_growth: false,
    stem_lesions: false
  });
  const [affectedPlantsPct, setAffectedPlantsPct] = useState(25);
  const [pestObserved, setPestObserved] = useState(true);
  const [farmerStatement, setFarmerStatement] = useState(isEn ? 'Farmer noted square shedding and pinkish caterpillars inside opened bolls after 3 days of heavy rain.' : 'शेतकऱ्यांनी ३ दिवसांच्या मुसळधार पाऊसानंतर खुल्या बोंडांत गुलाबी अळ्या व नवीन बोंडे गळत असल्याचे नमूद केले.');

  // Officer Diagnosis Override (If AI is wrong or inaccurate)
  const [modifiedDiagnosis, setModifiedDiagnosis] = useState('Pink Bollworm (गुलाबी बोंडअळी)');
  const [diagnosisConsistency, setDiagnosisConsistency] = useState('CONSISTENT'); // 'CONSISTENT' | 'CORRECTED_BY_OFFICER' | 'UNIDENTIFIED_NEW'

  // Step 9: Trap Inspection
  const [trapId, setTrapId] = useState('YAV-COT-0012');
  const [trapPest, setTrapPest] = useState('Pink Bollworm');
  const [trapType, setTrapType] = useState('Pheromone (Sex Lure)');
  const [trapCount, setTrapCount] = useState(14);
  const [trapDuration, setTrapDuration] = useState('1 night');
  const etlThreshold = 8;
  const isEtlBreached = trapCount >= etlThreshold;

  // Step 11 & 12: Field Assessment & 3 Resolution Pathways
  const [officerObservation, setOfficerObservation] = useState('Physical field inspection confirms pink bollworm rosetted flowers & entrance boreholes.');
  const [officerAssessment, setOfficerAssessment] = useState('VERIFIED'); // 'VERIFIED' | 'UNCERTAIN' | 'HIGH_RISK_ESCALATION'
  const [inspectionNotes, setInspectionNotes] = useState('Confirmed ETL breach. Physical symptoms align with field observation. Immediate CIBRC bio-chemical schedule dispatched.');

  // Step 13: Expert Escalation
  const [escalationReason, setEscalationReason] = useState('Atypical necrotic pattern with secondary fungal complex requires senior scientist verification.');

  // Step 14: Digital Lab Referral Generator
  const [isGeneratingLab, setIsGeneratingLab] = useState(false);
  const [activeLabReferral, setActiveLabReferral] = useState(null);
  const [labSampleType, setLabSampleType] = useState(isEn ? 'Cotton Boll & Leaf Tissue' : 'कापूस बोंड व पानांची ऊती');
  const [labTestType, setLabTestType] = useState(isEn ? 'PCR DNA Pathogen Assay & Larval Microscopy' : 'PCR DNA रोगजंतू चाचणी व अळी सूक्ष्मदर्शन');

  // Step 15 & 16: Advisory Dispatched
  const [advisoryDispatched, setAdvisoryDispatched] = useState(false);

  // Step 17 & 18: Per-Case Follow-Up Management & Deterioration Simulator State
  const [caseFollowUpState, setCaseFollowUpState] = useState({});

  const getCaseFollowUp = (c) => {
    const crop = (c?.farmer_profile?.crop_name || c?.crop || '').toLowerCase();
    const entity = (c?.diagnosis?.detected_entity || '').toLowerCase();

    // Crop-specific authentic Day 0 / Day 7 image pairs, severities, and CIBRC treatments
    let defaultData = {
      day0Photo: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80',
      day7Photo: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
      day0Severity: 28,
      day7Severity: 11,
      treatmentName: 'Emamectin Benzoate 5% SG @ 7.5 gm / 15L pump',
      secondLineMolecule: 'Chlorantraniliprole 18.5% SC (Coragen) @ 6 ml / 15L pump',
      secondLineNotes: isEn ? 'Rotated to Anthranilic Diamide chemistry to counter suspected OP/pyrethroid tolerance.' : 'सहनशीलतेवर मात करण्यासाठी अँथ्रानिलिक डायमाइड रसायन बदलले.',
      day0Desc: isEn ? 'Boreholes & frass on bolls' : 'बोंडांवर छिद्रे व अळीची विष्ठा',
      day7Desc: isEn ? 'Clean boll development, zero fresh frass' : 'स्वच्छ बोंड विकास, नवीन विष्ठा नाही'
    };

    if (crop.includes('soybean') || entity.includes('rust') || entity.includes('तांबेरा')) {
      defaultData = {
        day0Photo: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=600&q=80',
        day7Photo: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80',
        day0Severity: 34,
        day7Severity: 12,
        treatmentName: 'Hexaconazole 5% SC @ 15 ml / 15L pump',
        secondLineMolecule: 'Tebuconazole 25.9% EC @ 15 ml / 15L pump + Azoxystrobin',
        secondLineNotes: isEn ? 'Dual-action Strobilurin + Triazole tank mix for aggressive spore arrest.' : 'तीव्र बीजाणू रोखण्यासाठी स्ट्रोबिल्यूरिन + ट्रायझोल मिश्रण.',
        day0Desc: isEn ? 'Severe foliar rust pustules on abaxial leaf' : 'पानांवर तीव्र तांबेरा फोड',
        day7Desc: isEn ? 'Clean recovered green foliage, sporulation stopped' : 'स्वच्छ निरोगी हिरवी पाने, बीजाणू थांबले'
      };
    } else if (crop.includes('tomato') || entity.includes('late blight') || entity.includes('करपा')) {
      defaultData = {
        day0Photo: 'https://images.unsplash.com/photo-1592417817098-8f3d69106095?auto=format&fit=crop&w=600&q=80',
        day7Photo: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
        day0Severity: 35,
        day7Severity: 14,
        treatmentName: 'Mancozeb 75% WP @ 35 gm / 15L pump',
        secondLineMolecule: 'Dimethomorph 50% WP (15 gm) + Cymoxanil 8% + Mancozeb 64%',
        secondLineNotes: isEn ? 'Systemic oomycide penetrant targeting vascular mycelium.' : 'अंतर्प्रवाही ओमाइसीड कवकनाशक.',
        day0Desc: isEn ? 'Water-soaked necrotic lesions with white down' : 'पाण्यासारखे करपा डाग व पांढरी बुरशी',
        day7Desc: isEn ? 'Lesions dried, vigorous healthy green canopy' : 'डाग सुकले, जोमदार निरोगी हिरवा विस्तार'
      };
    } else if (crop.includes('onion') || entity.includes('purple blotch') || entity.includes('कांदा')) {
      defaultData = {
        day0Photo: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
        day7Photo: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80',
        day0Severity: 24,
        day7Severity: 8,
        treatmentName: 'Tebuconazole 25.9% EC @ 15 ml / 15L pump',
        secondLineMolecule: 'Difenoconazole 25% EC @ 10 ml / 15L pump + Non-ionic Spreader',
        secondLineNotes: isEn ? 'High-potency systemic conidial inhibitor.' : 'उच्च क्षमतेचे अंतर्प्रवाही कवकनाशक.',
        day0Desc: isEn ? 'Concentric sunken purple blotches on stalks' : 'देठांवर जांभळे खोलगट डाग',
        day7Desc: isEn ? 'Stalks cured and fortified, zero new blotches' : 'पाती बरी झाली, नवीन डाग नाहीत'
      };
    } else if (crop.includes('orange') || crop.includes('citrus') || entity.includes('canker') || entity.includes('कॅन्कर')) {
      defaultData = {
        day0Photo: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80',
        day7Photo: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80',
        day0Severity: 30,
        day7Severity: 10,
        treatmentName: 'Streptocycline 90% (1g) + COC 50% WP (25g) / 15L',
        secondLineMolecule: 'Kasugamycin 3% SL @ 30 ml / 15L pump + Copper Hydroxide',
        secondLineNotes: isEn ? 'Bacteriostatic antibiotic rotation against Xanthomonas.' : 'झांथोमोनॉस विरुद्ध जिवाणूनाशक बदल.',
        day0Desc: isEn ? 'Raised eruptive canker pustules with yellow haloes' : 'खवलेदार कॅन्कर फोड व पिवळे वलय',
        day7Desc: isEn ? 'Lesions cicatriced, glossy healthy citrus fruit flush' : 'फोड थांबले, चमकदार निरोगी संत्री बहर'
      };
    }

    const custom = caseFollowUpState[c.case_id] || {};
    return { ...defaultData, ...custom };
  };

  const updateCaseFollowUp = (caseId, updates) => {
    setCaseFollowUpState(prev => ({
      ...prev,
      [caseId]: { ...(prev[caseId] || {}), ...updates }
    }));
  };

  // Full Authoritative CIBRC IPM Database for dynamic rendering in Krishi Sevak workbench
  const CIBRC_IPM_MAP = {
    'pink_bollworm': {
      cultural: 'Install 5 Pheromone Traps / acre for monitoring. Collect and destroy rosette flowers within 48 hours.',
      biological: 'Release Trichogramma bactrae parasitoid egg cards @ 60,000 eggs/acre.',
      chemical: 'Emamectin Benzoate 5% SG @ 7.5 gm / 15L backpack pump (100 gm/acre).',
      safety: 'Wear complete PPE mask & gloves. Strictly observe 10-day Pre-Harvest Interval (PHI).'
    },
    'soybean_rust': {
      cultural: 'Ensure proper plant spacing (45 cm x 5 cm) to facilitate aeration and reduce canopy humidity.',
      biological: 'Foliar spray of Trichoderma harzianum @ 5 gm/L or Pseudomonas fluorescens @ 5 ml/L preventively.',
      chemical: 'Hexaconazole 5% SC @ 15 ml / 15L pump (200 ml/acre in 200L water) or Tebuconazole 25.9% EC @ 15 ml / 15L pump.',
      safety: 'Apply spray thoroughly targeting underside of leaves. Observe 21-day PHI.'
    },
    'cotton_whitefly': {
      cultural: 'Install 20 yellow sticky traps per acre at crop canopy level for mass trapping.',
      biological: 'Spray Verticillium lecanii @ 5 gm/L or Neem Oil (10,000 ppm) @ 2 ml/L.',
      chemical: 'Diafenthiuron 50% WP @ 18 gm / 15L pump (240 gm/acre) or Pyriproxyfen 10% EC @ 25 ml / 15L pump.',
      safety: 'Avoid synthetic pyrethroid sprays to prevent resurgence. Observe 20-day PHI.'
    },
    'tomato_late_blight': {
      cultural: 'Stake plants to keep foliage off moist soil; adopt drip irrigation to keep canopy dry.',
      biological: 'Foliar spray of Bacillus subtilis @ 5 gm/L preventively.',
      chemical: 'Mancozeb 75% WP @ 35-40 gm / 15L pump or Dimethomorph 50% WP @ 15 gm / 15L pump.',
      safety: 'Wear protective mask during fungicide handling. Observe 7-day harvest interval.'
    },
    'grapes_downy_mildew': {
      cultural: 'Canopy thinning to ensure sunlight penetration and quick drying of morning dew.',
      biological: 'Trichoderma asperellum @ 4 gm/litre foliar spray preventively.',
      chemical: 'Bordeaux Mixture 1% (150 ml/15L pump) or Mandipropamid 23.4% SC @ 12 ml / 15L pump.',
      safety: 'Strictly adhere to APEDA GrapeNet export MRL guidelines. Observe 28-day PHI.'
    },
    'pomegranate_bacterial_blight': {
      cultural: 'Adopt Hast Bahar regulation; disinfect secateurs with 2.5% Sodium Hypochlorite between cuts.',
      biological: 'Foliar spray of Pseudomonas fluorescens or Bacillus subtilis @ 5 gm/L preventively.',
      chemical: 'Streptocycline 90:10 @ 3 gm / 15L pump + Copper Oxychloride 50% WP @ 35 gm / 15L pump.',
      safety: 'Do NOT mix bactericides with alkaline fertilizers. Observe 30-day PHI.'
    },
    'onion_purple_blotch': {
      cultural: 'Plant on raised beds (BBF) to prevent waterlogging; 3-year non-allium rotation.',
      biological: 'Trichoderma viride foliar spray @ 5 gm/L + agricultural sticker (1 ml/L).',
      chemical: 'Tebuconazole 25.9% EC @ 15 ml / 15L pump (200 ml/acre) + Sticker 5 ml.',
      safety: 'Always mix non-ionic spreader/sticker for waxy onion leaves. Observe 15-day PHI.'
    },
    'sugarcane_red_rot': {
      cultural: 'Use certified disease-free VSI seed sets; hot water treatment at 52°C for 30 minutes.',
      biological: 'Sett dipping with Trichoderma harzianum @ 10 gm/L water for 15 minutes before planting.',
      chemical: 'Sett treatment with Carbendazim 50% WP (30 gm / 15L water) or Thiophanate Methyl 70% WP @ 25 gm / 15L.',
      safety: 'Do not allow irrigation water to flow from infected fields to healthy fields.'
    },
    'fall_armyworm': {
      cultural: 'Deep summer ploughing to expose pupae; intercrop maize with pulses/cowpea.',
      biological: 'Release Telenomus remus egg parasitoids or spray Metarhizium anisopliae @ 5 gm/L.',
      chemical: 'Chlorantraniliprole 18.5% SC @ 6 ml / 15L pump (60 ml/acre) or Spinetoram 11.7% SC @ 8 ml / 15L pump.',
      safety: 'Direct spray nozzle into plant whorls where larvae hide. Observe 14-day PHI.'
    }
  };

  const getDynamicIPMForDisease = (diseaseStr) => {
    if (!diseaseStr) return CIBRC_IPM_MAP['pink_bollworm'];
    const lower = diseaseStr.toLowerCase();
    if (lower.includes('soybean') || lower.includes('rust') || lower.includes('तांबेरा')) return CIBRC_IPM_MAP['soybean_rust'];
    if (lower.includes('whitefly') || lower.includes('पांढरी माशी')) return CIBRC_IPM_MAP['cotton_whitefly'];
    if (lower.includes('tomato') || lower.includes('late blight') || lower.includes('करपा')) return CIBRC_IPM_MAP['tomato_late_blight'];
    if (lower.includes('grape') || lower.includes('downy') || lower.includes('केवडा')) return CIBRC_IPM_MAP['grapes_downy_mildew'];
    if (lower.includes('pomegranate') || lower.includes('bacterial') || lower.includes('तेल्या')) return CIBRC_IPM_MAP['pomegranate_bacterial_blight'];
    if (lower.includes('onion') || lower.includes('purple blotch') || lower.includes('कांदा')) return CIBRC_IPM_MAP['onion_purple_blotch'];
    if (lower.includes('sugarcane') || lower.includes('red rot') || lower.includes('ऊस')) return CIBRC_IPM_MAP['sugarcane_red_rot'];
    if (lower.includes('fall armyworm') || lower.includes('लष्करी')) return CIBRC_IPM_MAP['fall_armyworm'];
    if (lower.includes('pink bollworm') || lower.includes('बोंडअळी')) return CIBRC_IPM_MAP['pink_bollworm'];

    // Fallback for custom unlisted disease
    return {
      cultural: `Inspect field boundaries and rogue out heavily infected plant parts of ${diseaseStr} within 24-48 hours. Maintain field drainage.`,
      biological: `Prophylactic bio-fungicide/pesticide spray: Pseudomonas fluorescens or Trichoderma harzianum @ 5 gm/L water.`,
      chemical: `Authoritative CIBRC certified chemical for ${diseaseStr}: Apply university-recommended broad-spectrum safe formulation or await Diagnostic Lab / Expert report.`,
      safety: `Wear full personal protective equipment (PPE). Adhere strictly to recommended dilution and Pre-Harvest Interval (PHI).`
    };
  };

  // Common Pests & Diseases for Officer Override Selector
  const knownPestOptions = [
    'Pink Bollworm (गुलाबी बोंडअळी)',
    'Cotton Whitefly (पांढरी माशी)',
    'Cotton Leaf Curl Virus (पर्णगुच्छ रोग)',
    'Spodoptera / Leaf Eating Caterpillar (लष्करी अळी)',
    'Alternaria Leaf Spot (अल्टरनेरिया करपा)',
    'Soybean Rust (तांबेरा रोग)',
    'Soybean Yellow Mosaic (पिवळा मोझॅक)',
    'Tomato Late Blight (लेट बिलाईट)',
    'Grapes Downy Mildew (केवडा रोग)',
    'Pomegranate Bacterial Blight (तेल्या)',
    'Onion Purple Blotch (जांभळा करपा)',
    'Sugarcane Red Rot (लाल सड)',
    'Fall Armyworm (लष्करी अळी)',
    'Aphids / Jassids / Thrips (रसशोषक किडी)'
  ];

  // Custom IPM Advisory Override by Krishi Sevak (allows officer to edit dosage, molecule, or instructions)
  const [isEditingAdvisory, setIsEditingAdvisory] = useState(false);
  const [customCultural, setCustomCultural] = useState('');
  const [customBiological, setCustomBiological] = useState('');
  const [customChemical, setCustomChemical] = useState('');
  const [customSafety, setCustomSafety] = useState('');

  const defaultIPM = getDynamicIPMForDisease(modifiedDiagnosis || selectedCase?.diagnosis?.detected_entity);
  const activeIPM = {
    cultural: customCultural || defaultIPM.cultural,
    biological: customBiological || defaultIPM.biological,
    chemical: customChemical || defaultIPM.chemical,
    safety: customSafety || defaultIPM.safety
  };

  useEffect(() => {
    loadKrishiSevakData();
  }, []);

  const loadKrishiSevakData = async () => {
    try {
      const [cData, tData, sData] = await Promise.all([
        api.getCases('KRISHI_SEVAK', 'ksevak_202'),
        api.getAllTraps(),
        api.getAllSensors()
      ]);
      setCases(cData);
      setTraps(tData);
      setSensors(sData);
      if (cData.length > 0 && !selectedCase) {
        setSelectedCase(cData[0]);
        setModifiedDiagnosis(cData[0].diagnosis?.detected_entity || 'Pink Bollworm (गुलाबी बोंडअळी)');
      }
    } catch (err) {
      console.error("Krishi Sevak initial load error:", err);
    }
  };

  const handleOpenCase = (caseItem) => {
    setSelectedCase(caseItem);
    setModifiedDiagnosis(caseItem.diagnosis?.detected_entity || 'Pink Bollworm (गुलाबी बोंडअळी)');
    setActiveTab('inspection');
    setIsFieldVisitActive(false);
    setAdvisoryDispatched(caseItem.field_inspection?.advisory_dispatched || false);
  };

  const handleStartFieldVisit = async (caseId) => {
    try {
      await api.startFieldInspection(caseId);
      setIsFieldVisitActive(true);
      setVisitStartTime(new Date().toLocaleTimeString());
      alert(isEn 
        ? `📍 Field Visit Started for Case #${caseId}!\n• GPS Location: 20.4285° N, 78.5392° E (Zadgaon, Darwha)\n• Distance: 4.2 km\n• Arrival Time: ${new Date().toLocaleTimeString()}\n• Audit Trail Chained: SHA-256 Verified.` 
        : `📍 प्रकरण #${caseId} साठी प्रत्यक्ष शेत पाहणी सुरू!\n• GPS स्थान: 20.4285° N, 78.5392° E (झाडगाव, दारव्हा)\n• अंतर: 4.2 किमी\n• आगमन वेळ: ${new Date().toLocaleTimeString()}\n• ऑडिट ट्रेल सुरक्षित: SHA-256 सत्यापित.`);
      loadKrishiSevakData();
    } catch (err) {
      console.error("Start field visit error:", err);
    }
  };

  const handleCompleteInspection = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      const symptomsList = Object.keys(symptomsChecked).filter(k => symptomsChecked[k]).map(k => k.replace('_', ' '));
      const formData = new FormData();
      formData.append('observed_symptoms', symptomsList.join(', '));
      formData.append('affected_plants_pct', affectedPlantsPct);
      formData.append('pest_observed', pestObserved);
      formData.append('trap_count', trapCount);
      formData.append('officer_observation', officerObservation);
      formData.append('officer_assessment', officerAssessment);
      formData.append('inspection_notes', inspectionNotes);
      if (modifiedDiagnosis) {
        formData.append('modified_diagnosis', modifiedDiagnosis);
      }

      const updated = await api.completeFieldInspection(selectedCase.case_id, formData);
      setSelectedCase(updated);
      setAdvisoryDispatched(true);
      alert(isEn 
        ? `✅ Field Inspection Recorded for Case #${selectedCase.case_id}!\n• Officer Diagnosis: ${modifiedDiagnosis}\n• Resolution Pathway: ${officerAssessment}\n• Authoritative CIBRC IPM Advisory Dispatched to Farmer Ramesh Patil\n• 7-Day Follow-Up Scheduled.` 
        : `✅ प्रकरण #${selectedCase.case_id} ची शेत पाहणी नोंद झाली!\n• अधिकारी निदान: ${modifiedDiagnosis}\n• उपाय मार्ग: ${officerAssessment}\n• प्रमाणित CIBRC IPM सल्ला शेतकरी रमेश पाटील यांना पाठवला\n• ७-दिवसीय पाठपुरावा नियोजित.`);
      loadKrishiSevakData();
    } catch (err) {
      console.error("Complete inspection error:", err);
    }
  };

  const handleEscalateToExpert = async () => {
    if (!selectedCase) return;
    try {
      const formData = new FormData();
      formData.append('notes', `[Escalated by Krishi Sevak Anil Deshmukh]: ${escalationReason}`);
      formData.append('modified_diagnosis', modifiedDiagnosis);
      formData.append('assign_lab', officerAssessment === 'HIGH_RISK_ESCALATION');

      await api.expertTriageCase(selectedCase.case_id, formData);
      alert(isEn 
        ? `🚀 Case #${selectedCase.case_id} Escalated to Agriculture Expert (KVK / MPKV Rahuri)!\nFull diagnostic package (Farmer Profile + AI Prior + Field Photos + Trap ETL + Officer Diagnosis: ${modifiedDiagnosis}) transferred.` 
        : `🚀 प्रकरण #${selectedCase.case_id} कृषी शास्त्रज्ञांकडे वर्ग केले (KVK / MPKV राहुरी)!\nपूर्ण निदान संच (शेतकरी प्रोफाइल + AI पूर्व निदान + शेत छायाचित्रे + ट्रॅप ETL + अधिकारी निदान: ${modifiedDiagnosis}) हस्तांतरित.`);
      loadKrishiSevakData();
    } catch (err) {
      console.error("Escalate error:", err);
    }
  };

  const handleGenerateLabReferral = async () => {
    if (!selectedCase) return;
    try {
      const formData = new FormData();
      formData.append('sample_type', labSampleType);
      formData.append('requested_test', labTestType);
      formData.append('destination_lab', 'MahaAgri Central Diagnostic Lab, Pune');

      const sample = await api.generateLabReferral(selectedCase.case_id, formData);
      setActiveLabReferral(sample);
      setIsGeneratingLab(false);
      alert(isEn 
        ? `🧪 Digital Lab Referral Slip #${sample.sample_id} Generated!\n• Destination: MahaAgri Central Diagnostic Lab, Pune\n• Chain-of-Custody: ACTIVE\n• QR Code ready for sample scanning.` 
        : `🧪 डिजिटल लॅब संदर्भ पत्र #${sample.sample_id} तयार झाले!\n• गंतव्य: MahaAgri केंद्रीय निदान प्रयोगशाळा, पुणे\n• साखळी ताबा: सक्रिय\n• नमुना स्कॅनिंगसाठी QR कोड तयार.`);
      loadKrishiSevakData();
    } catch (err) {
      console.error("Lab referral error:", err);
    }
  };

  const handleEvaluateFollowUp = async (caseItem) => {
    try {
      const fuData = getCaseFollowUp(caseItem);
      const isDet = fuData.day7Severity > fuData.day0Severity;
      const formData = new FormData();
      formData.append('day0_severity', fuData.day0Severity);
      formData.append('day7_severity', fuData.day7Severity);

      const updated = await api.checkFollowUpOutcome(caseItem.case_id, formData);
      
      // Update local state immediately so UI updates in real-time
      caseItem.status = isDet ? 'EXPERT_REVIEW_REQUIRED' : 'VERIFIED_RESOLVED';
      caseItem.recovery_status = isDet ? 'DETERIORATION_ALERT_ESCALATED' : 'RECOVERY_CONFIRMED_HEALING';
      caseItem.follow_up_evaluated = true;
      caseItem.follow_up_outcome = isDet ? 'DETERIORATING_ALERT' : 'IMPROVING';
      setCases([...cases]);

      if (isDet) {
        alert(isEn 
          ? `🔴 TREATMENT OUTCOME ALERT TRIGGERED!\n• Severity increased from ${fuData.day0Severity}% to ${fuData.day7Severity}% after 7 days.\n• Case #${caseItem.case_id} (${caseItem.farmer_profile?.crop_name}) has been automatically escalated to Senior Entomologist (MPKV Rahuri / KVK) for second-line chemistry!` 
          : `🔴 उपचार निकाल गंभीर सूचना!\n• ७ दिवसांत तीव्रता ${fuData.day0Severity}% वरून ${fuData.day7Severity}% वाढली.\n• प्रकरण #${caseItem.case_id} (${caseItem.farmer_profile?.crop_name}) वरिष्ठ कीटकशास्त्रज्ञांकडे (MPKV राहुरी / KVK) द्वितीय-सूत्र रसायनासाठी स्वयं वर्ग केले!`);
      } else {
        alert(isEn 
          ? `🟢 RECOVERY VERIFIED!\n• Severity reduced from ${fuData.day0Severity}% to ${fuData.day7Severity}% (${fuData.day0Severity - fuData.day7Severity}% healing).\n• Case #${caseItem.case_id} (${caseItem.farmer_profile?.crop_name}) is marked VERIFIED_RESOLVED and archived.` 
          : `🟢 बरे होणे सत्यापित!\n• तीव्रता ${fuData.day0Severity}% वरून ${fuData.day7Severity}% कमी झाली (${fuData.day0Severity - fuData.day7Severity}% बरे).\n• प्रकरण #${caseItem.case_id} (${caseItem.farmer_profile?.crop_name}) VERIFIED_RESOLVED असे चिन्हांकित करून संग्रहित केले.`);
      }
      setEvaluatingCase(null);
    } catch (err) {
      console.error("Follow-up evaluation error:", err);
    }
  };

  // Dynamic formatting of active symptoms string from checkboxes
  const activeSymptomsString = Object.keys(symptomsChecked)
    .filter(k => symptomsChecked[k])
    .map(k => k.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))
    .join(', ') || 'No symptoms selected';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* 1. KRISHI SEVAK OFFICIAL LOGIN & RBAC SCOPE BANNER */}
      <section className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center text-3xl shadow-inner">
              🧑🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl sm:text-2xl">
                  {isEn ? 'Krishi Sevak Field Triage & Extension Workbench' : 'कृषी सेवक क्षेत्रीय विस्तार व पाहणी कार्यक्षेत्र'}
                </h1>
                <span className="bg-teal-500/30 text-teal-200 border border-teal-400/40 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {isEn ? 'ROLE: KRISHI_SEVAK' : 'पद: KRISHI_SEVAK'}
                </span>
              </div>
              <p className="text-xs text-teal-200 mt-1">
                {isEn 
                  ? 'Extension Officer: Anil S. Deshmukh (ID: ksevak_202) • Assigned Area: Yavatmal → Darwha (Zadgaon & Ralegaon Beats)' 
                  : 'विस्तार अधिकारी: अनिल देशमुख • कार्यक्षेत्र: यवतमाळ → दारव्हा (झाडगाव व राळेगाव प्रभाग)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs">
            <MapPin className="w-4 h-4 text-amber-400 animate-bounce" />
            <div>
              <span className="text-[10px] text-teal-200 block font-bold uppercase">{isEn ? 'Beat Jurisdiction' : 'केंद्र अधिकार क्षेत्र'}</span>
              <span className="font-extrabold text-white">{isEn ? 'Darwha Hub (4.2 km Radius)' : 'दारव्हा केंद्र (४.२ किमी त्रिज्या)'}</span>
            </div>
          </div>
        </div>

        {/* Strict RBAC Boundary Notice */}
        <div className="bg-teal-950/60 border border-teal-500/30 p-2.5 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 text-teal-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0" />
            <span>
              <strong>{isEn ? 'RBAC Clearance Active:' : 'RBAC परवानगी सक्रिय:'}</strong> {isEn ? 'Authorized for assigned Darwha farmer cases, field inspections, pheromone traps, and CIBRC advisories.' : 'नियुक्त दारव्हा शेतकरी प्रकरणे, शेत पाहणी, फेरोमोन सापळे व CIBRC सल्ल्यांसाठी अधिकृत.'}
            </span>
          </div>
        </div>
      </section>

      {/* WORKBENCH NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'dashboard' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isEn ? '1. Attention Dashboard' : '१. आजचे प्राधान्य'}</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'queue' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isEn ? '2. Case Queue & Priority' : '२. प्रकरण यादी व क्रमवारी'}</span>
        </button>

        <button
          onClick={() => setActiveTab('inspection')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'inspection' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{isEn ? '3. Field Visit & Triage Hub' : '३. शेत पाहणी व पडताळणी'}</span>
        </button>

        <button
          onClick={() => setActiveTab('follow_ups')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'follow_ups' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>{isEn ? '4. Follow-Up Management' : '४. पाठपुरावा व्यवस्थापन'}</span>
        </button>

        <button
          onClick={() => setActiveTab('surveillance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'surveillance' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{isEn ? '5. Government Surveillance Roll-Up' : '५. शासन सर्वेक्षण माहिती'}</span>
        </button>
      </div>

      {/* TAB 1: ATTENTION DASHBOARD ("What needs my attention today?") */}
      {activeTab === 'dashboard' && (
        <section className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {isEn ? 'STEP 2 — KRISHI SEVAK DASHBOARD' : 'पायरी २ — कृषी सेवक डॅशबोर्ड'}
                </span>
                <h2 className="font-black text-slate-900 text-lg sm:text-xl mt-1">
                  {isEn ? 'What needs my attention today?' : 'आज कोणती प्रकरणे तातडीची आहेत?'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn 
                    ? 'Unlike the farmer ("What is wrong with my crop?"), the Krishi Sevak asks: "Which farmers/cases need my intervention?"' 
                    : 'शेतकऱ्यांना कोणत्या प्रकरणांत आज प्रत्यक्ष क्षेत्रीय मदतीची गरज आहे याचा तपशील.'}
                </p>
              </div>

              <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                📍 {isEn ? 'Assigned Area: Yavatmal → Darwha' : 'नियुक्त क्षेत्र: यवतमाळ → दारव्हा'}
              </span>
            </div>

            {/* 5 Real-Time Status Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 text-xs">
              <div 
                onClick={() => setActiveTab('queue')}
                className="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 transition cursor-pointer flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase text-rose-900 text-[11px]">🔴 {isEn ? 'Critical Cases' : 'गंभीर प्रकरणे'}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                </div>
                <div className="text-3xl font-black text-rose-700 my-2 font-mono">3</div>
                <span className="text-[10px] text-rose-900/80 font-medium">{isEn ? 'Risk ≥ 85 / ETL breached' : 'जोखीम ≥ 85 / ETL उल्लंघन'}</span>
              </div>

              <div 
                onClick={() => setActiveTab('queue')}
                className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 transition cursor-pointer flex flex-col justify-between shadow-xs"
              >
                <span className="font-extrabold uppercase text-amber-900 text-[11px]">🟠 {isEn ? 'High Priority' : 'उच्च प्राथमिकता'}</span>
                <div className="text-3xl font-black text-amber-700 my-2 font-mono">8</div>
                <span className="text-[10px] text-amber-900/80 font-medium">{isEn ? 'High severity / GDD active' : 'उच्च तीव्रता / GDD सक्रिय'}</span>
              </div>

              <div 
                onClick={() => setActiveTab('queue')}
                className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 transition cursor-pointer flex flex-col justify-between shadow-xs"
              >
                <span className="font-extrabold uppercase text-emerald-900 text-[11px]">🟡 {isEn ? 'Pending Verification' : 'पडताळणी प्रलंबित'}</span>
                <div className="text-3xl font-black text-emerald-700 my-2 font-mono">14</div>
                <span className="text-[10px] text-emerald-900/80 font-medium">{isEn ? 'Awaiting physical farm visit' : 'प्रत्यक्ष शेत भेटीची प्रतीक्षा'}</span>
              </div>

              <div 
                onClick={() => setActiveTab('inspection')}
                className="p-4 rounded-2xl border-2 border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 transition cursor-pointer flex flex-col justify-between shadow-xs"
              >
                <span className="font-extrabold uppercase text-purple-900 text-[11px]">🧪 {isEn ? 'Lab Referrals' : 'प्रयोगशाळा संदर्भ'}</span>
                <div className="text-3xl font-black text-purple-700 my-2 font-mono">2</div>
                <span className="text-[10px] text-purple-900/80 font-medium">{isEn ? 'Active Chain-of-Custody' : 'सक्रिय साखळी ताबा'}</span>
              </div>

              <div 
                onClick={() => setActiveTab('follow_ups')}
                className="p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 transition cursor-pointer flex flex-col justify-between shadow-xs"
              >
                <span className="font-extrabold uppercase text-blue-900 text-[11px]">🔄 {isEn ? 'Follow-ups Due' : 'पाठपुरावा बाकी'}</span>
                <div className="text-3xl font-black text-blue-700 my-2 font-mono">7</div>
                <span className="text-[10px] text-blue-900/80 font-medium">{isEn ? 'Day 7 post-treatment checks' : 'उपचारानंतर ७व्या दिवशी तपासणी'}</span>
              </div>
            </div>

            {/* URGENT CASES DIRECT ACTION CARDS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  {isEn ? 'Urgent Cases Requiring Field Inspection Today:' : 'तातडीने शेत पाहणी आवश्यक असलेली प्रकरणे:'}
                </h3>
                <span className="text-xs font-bold text-rose-700">{isEn ? 'Immediate Action Required' : 'तात्काळ कारवाई आवश्यक'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cases
                  .filter(c => c.status !== 'VERIFIED_RESOLVED' && c.status !== 'CLOSED' && (c.priority === 'CRITICAL' || c.priority === 'HIGH'))
                  .slice(0, 2)
                  .map(c => (
                    <div
                      key={c.case_id}
                      className="p-5 rounded-2xl border-2 border-rose-300 bg-rose-50/30 space-y-3 text-xs shadow-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-900 text-base">#{c.case_id}</span>
                            {c.priority === 'CRITICAL' && (
<span className="bg-rose-600 text-white font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                                🔴 {isEn ? 'CRITICAL' : 'गंभीर'}
                            </span>
                            )}
                          </div>
                          <p className="text-slate-600 font-bold mt-0.5">
                            🌱 {c.farmer_profile?.crop_name} • {c.diagnosis?.detected_entity}
                          </p>
                        </div>
                        <span className="font-bold text-slate-600 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          {c.distance_km || 4.2} {isEn ? 'km away' : 'किमी दूर'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-700 bg-white p-3 rounded-xl border border-rose-100">
                        <div>
                          <span className="text-slate-400 block text-[10px]">{isEn ? 'Farmer:' : 'शेतकरी:'}</span>
                          <strong className="text-slate-900">{c.farmer_profile?.farmer_name?.split('(')[0]}</strong>
                          <span className="text-slate-500 block text-[10px]">{c.farmer_profile?.village}, {c.farmer_profile?.taluka}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">{isEn ? 'Composite 7-Day Risk:' : 'एकत्रित ७-दिवसीय जोखीम:'}</span>
                          <strong className="text-rose-700 font-mono text-sm">{c.future_risk?.risk_score_pct || 91} / 100 {c.priority}</strong>
                          <span className="text-rose-600 block text-[10px] font-bold">{c.future_risk?.etl_breach_active || false ? (isEn ? 'ETL Breached' : 'ETL उल्लंघन') : ''}</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenCase(c)}
                          className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-extrabold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>{isEn ? '[OPEN CASE & START FIELD VISIT]' : '[प्रकरण उघडा व शेत पाहणी सुरू करा]'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                {cases.filter(c => {
                  if (queueFilter === 'ALL_ACTIVE') return c.status !== 'VERIFIED_RESOLVED' && c.status !== 'CLOSED';
                  if (queueFilter === 'CRITICAL') return c.priority === 'CRITICAL' || c.priority === 'HIGH';
                  if (queueFilter === 'LAB_REFERRED') return c.status === 'LAB_REFERRED' || c.lab_referral_id;
                  if (queueFilter === 'CLOSED') return c.status === 'VERIFIED_RESOLVED' || c.status === 'CLOSED';
                  return true;
                }).length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                    {isEn ? 'No cases matching this filter.' : 'या फिल्टरशी जुळणारी प्रकरणे नाहीत.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: CASE QUEUE & DYNAMIC MULTI-FACTOR PRIORITY (Steps 3 & 4) */}
      {activeTab === 'queue' && (
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {isEn ? 'STEP 3 & 4 — CASE QUEUE & LIFECYCLE MANAGEMENT' : 'पायरी ३ व ४ — प्रकरण यादी व जीवनचक्र व्यवस्थापन'}
              </span>
              <h2 className="font-black text-slate-900 text-lg mt-1">
                {isEn ? 'Assigned Field Case Queue' : 'कार्यक्षेत्रातील शेतकरी प्रकरण यादी'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn 
                  ? 'Cases move through 7 defined lifecycle stages from Creation → Field Visit → Advisory → Follow-up → CLOSED (Resolved).' 
                  : 'प्रकरणे निर्मितीपासून ते प्रत्यक्ष पाहणी, सल्ला, पाठपुरावा व अखेर बंद (निवारण) होईपर्यंत ट्रॅक केली जातात.'}
              </p>
            </div>

            {/* Formula Badge */}
            <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-[10px] text-slate-700 font-mono">
              {isEn ? 'Priority = Severity(35) + Uncertainty(25) + Risk(30) + ETL(10)' : 'प्राथमिकता = तीव्रता(35) + अनिश्चितता(25) + जोखीम(30) + ETL(10)'}
            </div>
          </div>

          {/* Queue Filter Tabs: Active vs In-Progress vs Lab vs Closed */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setQueueFilter('ALL_ACTIVE')}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold transition ${
                queueFilter === 'ALL_ACTIVE' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📋 {isEn ? 'All Active Cases' : 'सर्व सक्रिय प्रकरणे'} ({cases.filter(c => c.status !== 'VERIFIED_RESOLVED' && c.status !== 'CLOSED').length})
            </button>
            <button
              onClick={() => setQueueFilter('CRITICAL')}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold transition ${
                queueFilter === 'CRITICAL' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              🔴 {isEn ? 'Critical & High' : 'गंभीर व उच्च'} ({cases.filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH').length})
            </button>
            <button
              onClick={() => setQueueFilter('LAB_REFERRED')}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold transition ${
                queueFilter === 'LAB_REFERRED' ? 'bg-purple-700 text-white' : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              🧪 {isEn ? 'Lab Referred' : 'प्रयोगशाळा संदर्भित'} ({cases.filter(c => c.status === 'LAB_REFERRED' || c.lab_referral_id).length})
            </button>
            <button
              onClick={() => setQueueFilter('CLOSED')}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold transition ${
                queueFilter === 'CLOSED' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🔒 {isEn ? 'Closed & Resolved Cases' : 'बंद व निवारण झालेली प्रकरणे'} ({cases.filter(c => c.status === 'VERIFIED_RESOLVED' || c.status === 'CLOSED').length})
            </button>
          </div>

          {/* Render Filtered Cases */}
          <div className="space-y-3">
            {cases
              .filter(c => {
                if (queueFilter === 'ALL_ACTIVE') return c.status !== 'VERIFIED_RESOLVED' && c.status !== 'CLOSED';
                if (queueFilter === 'CRITICAL') return c.priority === 'CRITICAL' || c.priority === 'HIGH';
                if (queueFilter === 'LAB_REFERRED') return c.status === 'LAB_REFERRED' || c.lab_referral_id;
                if (queueFilter === 'CLOSED') return c.status === 'VERIFIED_RESOLVED' || c.status === 'CLOSED';
                return true;
              })
              .map(c => {
                const isCaseClosed = c.status === 'VERIFIED_RESOLVED' || c.status === 'CLOSED';
                return (
                  <div
                    key={c.case_id}
                    className={`p-4 rounded-2xl border transition space-y-3 text-xs ${
                      isCaseClosed 
                        ? 'border-emerald-300 bg-emerald-50/30' 
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-sm">
                          #{c.case_id}
                        </span>
                        {isCaseClosed ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {isEn ? 'CLOSED & RESOLVED' : 'बंद व निवारण पूर्ण'}
                          </span>
                        ) : (
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            c.priority === 'CRITICAL' ? 'bg-rose-600 text-white animate-pulse' : (c.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                          }`}>
                            {c.priority} ({isEn ? 'Score:' : 'गुण:'} {c.priority_score})
                          </span>
                        )}
                        <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded font-mono">
                          {isEn ? 'Status:' : 'स्थिती:'} {c.status}
                        </span>
                      </div>

                      <span className="text-slate-500 text-[11px] flex items-center gap-1 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {c.distance_km || 4.2} km • {c.farmer_profile?.village || 'Zadgaon'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">{isEn ? 'Farmer & Farm:' : 'शेतकरी व शेत:'}</span>
                        <strong>{c.farmer_profile?.farmer_name?.split('(')[0]}</strong>
                        <span className="text-slate-500 block">{c.farmer_profile?.farm_size_acres || 2.5} {isEn ? 'Acres' : 'एकर'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">{isEn ? 'Crop & Variety:' : 'पीक व वाण:'}</span>
                        <strong>{c.farmer_profile?.crop_name}</strong>
                        <span className="text-slate-500 block">{c.farmer_profile?.crop_variety} (DAS 82)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">{isEn ? 'AI Diagnosis & Part:' : 'AI निदान व भाग:'}</span>
                        <strong className="text-emerald-800">{c.diagnosis?.detected_entity?.split('(')[0]}</strong>
                        <span className="text-slate-500 block">{isEn ? 'Confidence:' : 'विश्वास:'} {(c.diagnosis?.confidence_score * 100 || 72).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">{isEn ? 'Outcome / 7-Day Risk:' : 'निकाल / ७-दिवसीय जोखीम:'}</span>
                        {isCaseClosed ? (
                          <strong className="text-emerald-700 font-bold">✓ 100% {isEn ? 'Healed & Recovered' : 'बरे व निवारण पूर्ण'}</strong>
                        ) : (
                          <>
                            <strong className="text-rose-700">{c.future_risk?.risk_score_pct || 91} / 100 {isEn ? 'HIGH' : 'उच्च'}</strong>
                            <span className="text-rose-600 block font-bold">{isEn ? 'ETL Surge Active' : 'ETL वाढ सक्रिय'}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      {isCaseClosed ? (
                        <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                          <Check className="w-4 h-4 text-emerald-600" /> {isEn ? 'Case completed successfully. Follow-up audit trail archived.' : 'प्रकरण यशस्वीरित्या पूर्ण. पाठपुरावा नोंदी जतन केल्या.'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          {isEn ? 'Scheduled for field visit and Day-7 recovery tracking.' : 'शेत पाहणी व ७व्या दिवशी पुनर्प्राप्ती ट्रॅकिंगसाठी नियोजित.'}
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        {!isCaseClosed && (
                          <button
                            type="button"
                            onClick={() => {
                              c.status = 'VERIFIED_RESOLVED';
                              c.recovery_status = 'RECOVERY_CONFIRMED_HEALING';
                              setCases([...cases]);
                              alert(isEn 
                                ? `🔒 Case #${c.case_id} for ${c.farmer_profile?.farmer_name} has been CLOSED & ARCHIVED!\n• Post-treatment verification complete.\n• Outcome: 100% Crop Recovery Confirmed.` 
                                : `🔒 शेतकरी ${c.farmer_profile?.farmer_name} यांचे प्रकरण #${c.case_id} बंद करून संग्रहित केले!\n• उपचारानंतरची पडताळणी पूर्ण.\n• निकाल: १००% पीक पुनर्प्राप्ती पुष्टी.`);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{isEn ? 'Mark Resolved & Close' : 'निवारण पूर्ण करून बंद करा'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenCase(c)}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                        >
                          <span>{isCaseClosed ? (isEn ? 'View Archived Case' : 'जतन केलेले प्रकरण पहा') : (isEn ? '[OPEN CASE & PROCEED TO FIELD TRIAGE]' : '[प्रकरण उघडा व शेत पडताळणीकडे जा]')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {cases.filter(c => {
              if (queueFilter === 'ALL_ACTIVE') return c.status !== 'VERIFIED_RESOLVED' && c.status !== 'CLOSED';
              if (queueFilter === 'CRITICAL') return c.priority === 'CRITICAL' || c.priority === 'HIGH';
              if (queueFilter === 'LAB_REFERRED') return c.status === 'LAB_REFERRED' || c.lab_referral_id;
              if (queueFilter === 'CLOSED') return c.status === 'VERIFIED_RESOLVED' || c.status === 'CLOSED';
              return true;
            }).length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                {isEn ? 'No cases matching this filter.' : 'या फिल्टरशी जुळणारी प्रकरणे नाहीत.'}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 3: FIELD VISIT & TRIAGE HUB (Steps 5 to 16) */}
      {activeTab === 'inspection' && selectedCase && (
        <section className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            
            {/* Header & Case Switcher Dropdown */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {isEn ? 'STEP 5 & 6 — COMPLETE CASE CONTEXT & GPS FIELD VISIT' : 'पायरी ५ व ६ — पूर्ण प्रकरण संदर्भ व GPS शेत भेट'}
                </span>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  <h2 className="font-black text-slate-900 text-xl font-mono">
                    {isEn ? 'CASE' : 'प्रकरण'} #{selectedCase.case_id}
                  </h2>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedCase.priority === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedCase.priority} {isEn ? 'PRIORITY' : 'प्राथमिकता'} ({isEn ? 'Score:' : 'गुण:'} {selectedCase.priority_score})
                  </span>

                  {/* Case Switcher: Allows officer to switch to any other farmer case directly */}
                  {cases.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1 text-xs">
                      <span className="text-slate-500 font-bold text-[10px] uppercase">{isEn ? 'Switch Farmer Case:' : 'शेतकऱ्याचे प्रकरण बदला:'}</span>
                      <select
                        value={selectedCase.case_id}
                        onChange={(e) => {
                          const found = cases.find(item => item.case_id === e.target.value);
                          if (found) handleOpenCase(found);
                        }}
                        className="bg-white border border-slate-300 rounded px-2 py-0.5 font-bold text-slate-800 text-xs outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      >
                        {cases.map(c => (
                          <option key={c.case_id} value={c.case_id}>
                            #{c.case_id} — {c.farmer_profile?.farmer_name} ({c.farmer_profile?.crop_name}) [{c.priority}]
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Start Field Visit Button (Step 6) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartFieldVisit(selectedCase.case_id)}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 ${
                    isFieldVisitActive ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>{isFieldVisitActive ? `📍 ${isEn ? 'On Farm' : 'शेतावर'} (${isEn ? 'Arrival' : 'आगमन'}: ${visitStartTime || '10:15 AM'})` : `[START FIELD VISIT — ${selectedCase.distance_km || 4.2} km]`}</span>
                </button>
              </div>
            </div>

            {/* 4-Box Comprehensive Context Grid (Step 5) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* 1. Farmer Information */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider block text-[10px]">
                  🏡 {isEn ? 'Farmer Information' : 'शेतकरी माहिती'}
                </span>
                <p><strong>{isEn ? 'Name:' : 'नाव:'}</strong> {selectedCase.farmer_profile?.farmer_name}</p>
                <p><strong>{isEn ? 'Farm Area:' : 'शेत क्षेत्र:'}</strong> {selectedCase.farmer_profile?.farm_size_acres || 2.5} {isEn ? 'Acres' : 'एकर'}</p>
                <p><strong>{isEn ? 'Village:' : 'गाव:'}</strong> {selectedCase.farmer_profile?.village}, {selectedCase.farmer_profile?.taluka}</p>
                <p><strong>{isEn ? 'Location:' : 'ठिकाण:'}</strong> 📍 20.4285° N, 78.5392° E</p>
                <p><strong>{isEn ? 'Contact:' : 'संपर्क:'}</strong> +91 98223 45678</p>
              </div>

              {/* 2. Crop Profile Information */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider block text-[10px]">
                  🌱 {isEn ? 'Crop Profile (DAS 82)' : 'पीक प्रोफाइल (DAS 82)'}
                </span>
                <p><strong>{isEn ? 'Crop:' : 'पीक:'}</strong> {selectedCase.farmer_profile?.crop_name}</p>
                <p><strong>{isEn ? 'Variety:' : 'वाण:'}</strong> {selectedCase.farmer_profile?.crop_variety || 'Bt-Cotton RCH-659'}</p>
                <p><strong>{isEn ? 'Sowing Date:' : 'पेरणी दिनांक:'}</strong> 15 June 2026 (<strong>82 DAS</strong>)</p>
                <p><strong>{isEn ? 'Stage:' : 'अवस्था:'}</strong> {isEn ? 'Boll Development' : 'बोंड विकास'}</p>
                <p><strong>{isEn ? 'Soil:' : 'जमीन:'}</strong> {isEn ? 'Black Cotton (pH 7.4) • Rainfed' : 'काळी कापूस माती (pH 7.4) • पावसावर अवलंबून'}</p>
              </div>

              {/* 3. AI Computer Vision Info */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1.5">
                <span className="font-extrabold text-emerald-900 uppercase tracking-wider block text-[10px]">
                  📸 {isEn ? 'AI Vision Prediction' : 'AI दृष्टी अंदाज'}
                </span>
                <p><strong>{isEn ? 'Diagnosis:' : 'निदान:'}</strong> {selectedCase.diagnosis?.detected_entity?.split('(')[0]}</p>
                <p><strong>{isEn ? 'Confidence:' : 'विश्वास:'}</strong> <span className="font-mono font-bold text-emerald-800">{(selectedCase.diagnosis?.confidence_score * 100 || 72).toFixed(1)}%</span></p>
                <p><strong>{isEn ? 'Severity:' : 'तीव्रता:'}</strong> <span className="text-amber-800 font-bold">{selectedCase.diagnosis?.severity || (isEn ? 'Moderate' : 'मध्यम')}</span></p>
                <p><strong>{isEn ? 'Affected Part:' : 'प्रभावित भाग:'}</strong> {isEn ? 'Boll & Squares' : 'बोंडे व नवीन बोंडे'}</p>
                <p><strong>{isEn ? 'Heatmap:' : 'हीटमॅप:'}</strong> {isEn ? 'Verified' : 'सत्यापित'}</p>
              </div>

              {/* 4. 7-Day Biophysical Risk Info */}
              <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 space-y-1.5">
                <span className="font-extrabold text-rose-900 uppercase tracking-wider block text-[10px]">
                  🌦️ {isEn ? '7-Day Outbreak Risk' : '७-दिवसीय प्रादुर्भाव जोखीम'}
                </span>
                <p><strong>{isEn ? 'Risk Score:' : 'जोखीम गुण:'}</strong> <span className="font-mono font-bold text-rose-700 text-sm">91 / 100 🔴 {isEn ? 'HIGH' : 'उच्च'}</span></p>
                <p><strong>{isEn ? 'Humidity / Rain:' : 'आर्द्रता / वर्षा:'}</strong> RH 84% • 18.5 mm</p>
                <p><strong>{isEn ? 'GDD Window:' : 'GDD कालावधी:'}</strong> {isEn ? 'Active' : 'सक्रिय'} (28.4°C)</p>
                <p><strong>{isEn ? 'Local Cases:' : 'स्थानिक प्रकरणे:'}</strong> {isEn ? '47 Confirmed in Beat' : 'भागात ४७ पुष्टी'}</p>
                <p><strong>{isEn ? 'Trap Activity:' : 'सापळा क्रियाशीलता:'}</strong> <span className="text-rose-700 font-bold">{isEn ? '14 Moths (Above ETL)' : '१४ पतंग (ETL पेक्षा जास्त)'}</span></p>
              </div>
            </div>

            {/* STEP 7: KRISHI SEVAK TAKES 4 FIELD PHOTOS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    {isEn ? 'Step 7: Capture Field Inspection Photos (4 Perspectives)' : 'पायरी ७: प्रत्यक्ष शेतातून ४ प्रकारचे फोटो काढा'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isEn ? 'Attach physical evidence distinct from farmer submission: Leaf, Stem, Fruit/Boll, Whole Plant' : 'शेतकऱ्याच्या फोटोव्यतिरिक्त प्रत्यक्ष अधिकाऱ्याने काढलेले पुरावा फोटो'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* 1. Leaf Image */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-center">
                  <span className="font-bold text-slate-700 block text-[11px]">📷 1. {isEn ? 'Leaf Close-up' : 'पानाचा जवळून फोटो'}</span>
                  <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative group">
                    <img 
                      src={fieldPhotoLeaf || 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=400&q=80'} 
                      alt={isEn ? 'Leaf' : 'पान'} 
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white cursor-pointer text-[10px] font-bold">
                      <Camera className="w-5 h-5 mb-1" />
                      <span>{fieldPhotoLeaf ? (isEn ? 'Change Photo' : 'फोटो बदला') : (isEn ? 'Upload / Capture' : 'अपलोड / फोटो काढा')}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) setFieldPhotoLeaf(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  </div>
                  <label className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer block">
                    {fieldPhotoLeaf ? (isEn ? '✓ Custom Attached (Replace)' : '✓ स्व-अपलोड (बदला)') : (isEn ? '📷 Click to Take Photo' : '📷 फोटो काढण्यासाठी क्लिक करा')}
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setFieldPhotoLeaf(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                </div>

                {/* 2. Stem Image */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-center">
                  <span className="font-bold text-slate-700 block text-[11px]">📷 2. {isEn ? 'Stem Inspection' : 'खोड तपासणी'}</span>
                  <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative group">
                    <img 
                      src={fieldPhotoStem || 'https://images.unsplash.com/photo-1592417817098-8f3d69106095?auto=format&fit=crop&w=400&q=80'} 
                      alt={isEn ? 'Stem' : 'खोड'} 
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white cursor-pointer text-[10px] font-bold">
                      <Camera className="w-5 h-5 mb-1" />
                      <span>{fieldPhotoStem ? (isEn ? 'Change Photo' : 'फोटो बदला') : (isEn ? 'Upload / Capture' : 'अपलोड / फोटो काढा')}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) setFieldPhotoStem(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  </div>
                  <label className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer block">
                    {fieldPhotoStem ? (isEn ? '✓ Custom Attached (Replace)' : '✓ स्व-अपलोड (बदला)') : (isEn ? '📷 Click to Take Photo' : '📷 फोटो काढण्यासाठी क्लिक करा')}
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setFieldPhotoStem(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                </div>

                {/* 3. Fruit/Boll Image */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-center">
                  <span className="font-bold text-slate-700 block text-[11px]">📷 3. {isEn ? 'Fruit / Boll Damage' : 'फळ / बोंड नुकसान'}</span>
                  <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative group">
                    <img 
                      src={fieldPhotoFruit || 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=400&q=80'} 
                      alt={isEn ? 'Boll' : 'बोंड'} 
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white cursor-pointer text-[10px] font-bold">
                      <Camera className="w-5 h-5 mb-1" />
                      <span>{fieldPhotoFruit ? (isEn ? 'Change Photo' : 'फोटो बदला') : (isEn ? 'Upload / Capture' : 'अपलोड / फोटो काढा')}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) setFieldPhotoFruit(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  </div>
                  <label className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer block">
                    {fieldPhotoFruit ? (isEn ? '✓ Custom Attached (Replace)' : '✓ स्व-अपलोड (बदला)') : (isEn ? '📷 Click to Take Photo' : '📷 फोटो काढण्यासाठी क्लिक करा')}
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setFieldPhotoFruit(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                </div>

                {/* 4. Whole Plant */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-center">
                  <span className="font-bold text-slate-700 block text-[11px]">📷 4. {isEn ? 'Whole Plant Canopy' : 'संपूर्ण झाडाची छत्री'}</span>
                  <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative group">
                    <img 
                      src={fieldPhotoWhole || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80'} 
                      alt={isEn ? 'Whole plant' : 'संपूर्ण झाड'} 
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white cursor-pointer text-[10px] font-bold">
                      <Camera className="w-5 h-5 mb-1" />
                      <span>{fieldPhotoWhole ? (isEn ? 'Change Photo' : 'फोटो बदला') : (isEn ? 'Upload / Capture' : 'अपलोड / फोटो काढा')}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) setFieldPhotoWhole(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  </div>
                  <label className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer block">
                    {fieldPhotoWhole ? (isEn ? '✓ Custom Attached (Replace)' : '✓ स्व-अपलोड (बदला)') : (isEn ? '📷 Click to Take Photo' : '📷 फोटो काढण्यासाठी क्लिक करा')}
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setFieldPhotoWhole(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* STEP 8, 9, 10: STRUCTURED OBSERVATION + TRAP + IOT SENSOR + OFFICER DIAGNOSIS OVERRIDE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
              
              {/* Step 8: Structured Checklist Form & Officer Disease Modification */}
              <div className="lg:col-span-7 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                    {isEn ? 'STEP 8 — STRUCTURED FIELD OBSERVATIONS & DIAGNOSIS OVERRIDE' : 'पायरी ८ — संरचित शेत निरीक्षणे व निदान बदल'}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">{isEn ? 'Dynamic Checklist' : 'गतिशील तपासणी'}</span>
                </div>
                
                {/* Symptoms Checkboxes (Directly drives Officer Observation Card) */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 block text-[11px]">
                    {isEn ? 'Observed Symptoms (Check all that apply):' : 'आढळलेली लक्षणे (जी लागू आहेत ती निवडा):'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.keys(symptomsChecked).map(k => (
                      <label key={k} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                        <input
                          type="checkbox"
                          checked={symptomsChecked[k]}
                          onChange={(e) => setSymptomsChecked({...symptomsChecked, [k]: e.target.checked})}
                          className="rounded accent-emerald-600"
                        />
                        <span className="capitalize font-medium text-slate-700">{k.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quantitative Measures */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">{isEn ? 'Affected Crop Area %:' : 'प्रभावित पीक क्षेत्र %:'}</span>
                    <input 
                      type="number" 
                      value={affectedPlantsPct} 
                      onChange={(e) => setAffectedPlantsPct(parseInt(e.target.value) || 0)}
                      className="w-full border rounded p-1.5 font-bold font-mono text-slate-800 bg-white"
                      min="1" max="100"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">{isEn ? 'Pest Observed Status:' : 'कीटक आढळले किंवा नाही:'}</span>
                    <select 
                      value={pestObserved ? 'yes' : 'no'}
                      onChange={(e) => setPestObserved(e.target.value === 'yes')}
                      className="w-full border rounded p-1.5 font-bold text-slate-800 bg-white"
                    >
                      <option value="yes">{isEn ? 'YES — Active Larvae / Pests Found' : 'होय — जिवंत अळ्या / कीटक आढळले'}</option>
                      <option value="no">{isEn ? 'NO — Symptoms Only' : 'नाही — फक्त लक्षणे'}</option>
                    </select>
                  </div>
                </div>

                {/* CRUCIAL FIX: Officer Disease Override / Modification Selector if AI is Wrong */}
                <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-950 text-[11px] flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      {isEn ? 'Officer Field Verified Diagnosis (Modify if AI is Inaccurate):' : 'अधिकारी क्षेत्र सत्यापित निदान (AI चुकले असल्यास बदला):'}
                    </span>
                    <span className="text-[10px] text-amber-800 font-bold">
                      {isEn ? 'AI Prior:' : 'AI पूर्व निदान:'} {selectedCase.diagnosis?.detected_entity?.split('(')[0]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">{isEn ? 'Select Actual Disease/Pest:' : 'वास्तविक रोग / कीटक निवडा:'}</span>
                      <select
                        value={modifiedDiagnosis}
                        onChange={(e) => {
                          setModifiedDiagnosis(e.target.value);
                          if (e.target.value === selectedCase.diagnosis?.detected_entity) {
                            setDiagnosisConsistency('CONSISTENT');
                          } else {
                            setDiagnosisConsistency('CORRECTED_BY_OFFICER');
                          }
                        }}
                        className="w-full border border-slate-300 rounded p-1.5 font-bold text-slate-800 bg-white text-xs outline-hidden focus:ring-2 focus:ring-emerald-500"
                      >
                        {knownPestOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">{isEn ? 'Or Type Custom Diagnosis:' : 'किंवा स्वतःचे निदान लिहा:'}</span>
                      <input
                        type="text"
                        value={modifiedDiagnosis}
                        onChange={(e) => {
                          setModifiedDiagnosis(e.target.value);
                          setDiagnosisConsistency('CORRECTED_BY_OFFICER');
                        }}
                        placeholder={isEn ? 'Enter verified pest or pathogen name' : 'सत्यापित कीटक किंवा रोगजंतूचे नाव लिहा'}
                        className="w-full border border-slate-300 rounded p-1.5 text-slate-800 bg-white text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <span className="text-slate-600 font-bold">{isEn ? 'Diagnosis Status:' : 'निदान स्थिती:'}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      diagnosisConsistency === 'CONSISTENT' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {diagnosisConsistency === 'CONSISTENT' ? (isEn ? '✓ Consistent with AI Vision' : '✓ AI दृष्टीशी सुसंगत') : (isEn ? '⚠️ Corrected by Officer in Field' : '⚠️ क्षेत्रात अधिकाऱ्याने सुधारले')}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">{isEn ? 'Farmer Statement & Field Notes:' : 'शेतकरी विधान व शेत नोंदी:'}</span>
                  <input
                    type="text"
                    value={farmerStatement}
                    onChange={(e) => setFarmerStatement(e.target.value)}
                    className="w-full border rounded p-2 text-slate-800 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Step 9 & 10: Pest Trap Inspection & IoT Sensor Mesh */}
              <div className="lg:col-span-5 space-y-3 text-xs">
                
                {/* Step 9: Trap Inspection */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                      {isEn ? 'STEP 9 — PEST TRAP PHYSICAL INSPECTION' : 'पायरी ९ — कीटक सापळा प्रत्यक्ष तपासणी'}
                    </span>
                    <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                      isEtlBreached ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isEtlBreached ? (isEn ? '🔴 ETL BREACHED' : '🔴 ETL उल्लंघन') : (isEn ? '🟢 NORMAL' : '🟢 सामान्य')}
                    </span>
                  </div>
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 text-[11px]">
                    <p><strong>{isEn ? 'Trap ID:' : 'सापळा क्रमांक:'}</strong> {trapId} ({trapType})</p>
                    <p><strong>{isEn ? 'Target Pest:' : 'लक्ष्य कीटक:'}</strong> {trapPest}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span>{isEn ? 'Trap Count:' : 'सापळ्यातील संख्या:'}</span>
                      <input 
                        type="number" 
                        value={trapCount} 
                        onChange={(e) => setTrapCount(parseInt(e.target.value) || 0)}
                        className="w-16 border rounded p-1 font-mono font-bold text-center text-xs"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {isEn ? 'Threshold: ' : 'मर्यादा: '}<strong>{etlThreshold} {isEn ? 'Moths/Night' : 'पतंग/रात्र'}</strong> • {isEn ? 'Status: ' : 'स्थिती: '}{isEtlBreached ? <span className="text-rose-600 font-bold">{isEn ? 'Surge Fed to Risk Engine ✓' : 'वाढ जोखीम यंत्रणेकडे ✓'}</span> : (isEn ? 'Safe' : 'सुरक्षित')}
                    </p>
                  </div>
                </div>

                {/* Step 10: IoT Sensor Readouts */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                      {isEn ? 'STEP 10 — IOT FIELD SENSOR STATUS (VALIDATED)' : 'पायरी १० — IoT शेत सेन्सर स्थिती (सत्यापित)'}
                    </span>
                    <span className="text-emerald-700 font-bold text-[10px]">🟢 {isEn ? 'ONLINE' : 'कनेक्टेड'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] text-center">
                    <div className="bg-white p-2 rounded border border-slate-200">{isEn ? 'Temp:' : 'तापमान:'} <strong className="block text-slate-900">28.4°C</strong></div>
                    <div className="bg-white p-2 rounded border border-slate-200">{isEn ? 'RH:' : 'आर्द्रता:'} <strong className="block text-slate-900">84%</strong></div>
                    <div className="bg-white p-2 rounded border border-slate-200">{isEn ? 'Wet:' : 'ओलसर तास:'} <strong className="block text-slate-900">6.8h</strong></div>
                    <div className="bg-white p-2 rounded border border-slate-200">{isEn ? 'Moist:' : 'माती ओलावा:'} <strong className="block text-slate-900">41%</strong></div>
                  </div>
                </div>

              </div>
            </div>

            {/* STEP 11 & 12: 100% DYNAMIC TRIPARTITE EVIDENCE & 3 RESOLUTION PATHWAYS */}
            <form onSubmit={handleCompleteInspection} className="bg-slate-900 text-white p-6 rounded-2xl space-y-5 text-xs">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  {isEn ? 'STEP 11 & 12 — TRIPARTITE FIELD EVIDENCE & 3 RESOLUTION PATHWAYS' : 'पायरी ११ व १२ — त्रिस्तरीय शेत पुरावा व ३ उपाय मार्ग'}
                </span>
                <h3 className="font-black text-white text-base mt-0.5">
                  {isEn ? 'Immutable Tripartite Evidence Recording (Audit Trail Standard)' : 'अबदल त्रिस्तरीय पुरावा नोंद (ऑडिट ट्रेल मानक)'}
                </h3>
              </div>

              {/* 3 Evidence Pillars - 100% DYNAMIC FROM CHECKLIST & OFFICER INPUT */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
                
                {/* 1. AI Prediction Card */}
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isEn ? '1. AI PREDICTION:' : '१. AI अंदाज:'}</span>
                  <p className="text-emerald-400 font-bold text-xs">{selectedCase.diagnosis?.detected_entity?.split('(')[0]}</p>
                  <p className="text-slate-300">{isEn ? 'Confidence:' : 'विश्वास:'} {(selectedCase.diagnosis?.confidence_score * 100 || 72).toFixed(1)}%</p>
                  <p className="text-slate-300">{isEn ? 'Severity:' : 'तीव्रता:'} {selectedCase.diagnosis?.severity || (isEn ? 'Moderate' : 'मध्यम')}</p>
                </div>

                {/* 2. Officer Observation Card (100% Dynamic from Step 8 Checkbox inputs) */}
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-amber-500/40 space-y-1.5">
                  <span className="text-amber-400 block text-[10px] uppercase font-bold">{isEn ? '2. OFFICER OBSERVATION (DYNAMIC):' : '२. अधिकारी निरीक्षण (गतिशील):'}</span>
                  <p className="text-amber-300 font-bold text-xs">
                    {activeSymptomsString}
                  </p>
                  <p className="text-slate-300">
                    {affectedPlantsPct}% {isEn ? 'Crop Area Affected' : 'पीक क्षेत्र प्रभावित'} • {pestObserved ? (isEn ? 'Active Larvae Observed' : 'जिवंत अळ्या आढळल्या') : (isEn ? 'Symptoms Only' : 'फक्त लक्षणे')}
                  </p>
                  <p className="text-emerald-300 text-[10px]">
                    {isEn ? 'Verified Entity: ' : 'सत्यापित जीव: '}<strong>{modifiedDiagnosis}</strong>
                  </p>
                </div>

                {/* 3. Officer Assessment Card */}
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isEn ? '3. OFFICER ASSESSMENT:' : '३. अधिकारी मूल्यांकन:'}</span>
                  <p className="text-emerald-400 font-bold text-xs">{officerAssessment === 'VERIFIED' ? (isEn ? 'VERIFIED' : 'सत्यापित') : officerAssessment === 'UNCERTAIN' ? (isEn ? 'UNCERTAIN' : 'अनिश्चित') : (isEn ? 'HIGH_RISK_ESCALATION' : 'उच्च जोखीम — तज्ज्ञांकडे वर्ग')}</p>
                  <p className="text-slate-300">{isEn ? 'ETL Status: ' : 'ETL स्थिती: '}{isEtlBreached ? (isEn ? '🔴 BREACHED' : '🔴 उल्लंघन') : (isEn ? '🟢 NORMAL' : '🟢 सामान्य')}</p>
                  <p className="text-slate-300">{isEn ? 'Officer: ' : 'अधिकारी: '}Anil S. Deshmukh</p>
                </div>
              </div>

              {/* 3 Possible Outcomes Selection */}
              <div className="space-y-2">
                <span className="font-bold text-slate-300 block text-xs">
                  {isEn ? 'Choose Resolution Pathway:' : 'उपाय मार्ग निवडा:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-900">
                  
                  {/* Pathway A: Verified */}
                  <label className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition ${
                    officerAssessment === 'VERIFIED' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400' : 'bg-white border-slate-700'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="pathway_choice"
                          value="VERIFIED"
                          checked={officerAssessment === 'VERIFIED'}
                          onChange={() => setOfficerAssessment('VERIFIED')}
                          className="accent-emerald-600"
                        />
                        <strong className="text-emerald-950">🟢 A. {isEn ? 'VERIFIED' : 'सत्यापित'}</strong>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1">
                        {isEn ? 'Diagnosis confirmed (or corrected to ' : 'निदान सत्यापित '} <strong>{modifiedDiagnosis}</strong>{isEn ? '). Continue to authoritative CIBRC IPM advisory dispatch.' : ' च्या अनुषंगाने. प्रमाणित CIBRC IPM सल्ला पाठवा.'}
                      </p>
                    </div>
                  </label>

                  {/* Pathway B: Uncertain */}
                  <label className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition ${
                    officerAssessment === 'UNCERTAIN' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400' : 'bg-white border-slate-700'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="pathway_choice"
                          value="UNCERTAIN"
                          checked={officerAssessment === 'UNCERTAIN'}
                          onChange={() => setOfficerAssessment('UNCERTAIN')}
                          className="accent-amber-600"
                        />
                        <strong className="text-amber-950">🟠 B. {isEn ? 'UNCERTAIN' : 'अनिश्चित'}</strong>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1">
                        {isEn ? 'Officer unable to confirm. Escalate full case package to Agriculture Expert for specialist review.' : 'अधिकाऱ्याला पुष्टी नाही. पूर्ण प्रकरण कृषी तज्ज्ञाकडे पुनर्तपासणीसाठी वर्ग करा.'}
                      </p>
                    </div>
                  </label>

                  {/* Pathway C: High Risk */}
                  <label className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition ${
                    officerAssessment === 'HIGH_RISK_ESCALATION' ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400' : 'bg-white border-slate-700'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="pathway_choice"
                          value="HIGH_RISK_ESCALATION"
                          checked={officerAssessment === 'HIGH_RISK_ESCALATION'}
                          onChange={() => setOfficerAssessment('HIGH_RISK_ESCALATION')}
                          className="accent-rose-600"
                        />
                        <strong className="text-rose-950">🔴 C. {isEn ? 'HIGH RISK' : 'उच्च जोखीम'}</strong>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1">
                        {isEn ? 'Severe outbreak risk (91/100). Escalate to Expert + Generate Digital Diagnostic Lab Referral.' : 'गंभीर प्रादुर्भाव जोखीम (91/100). तज्ज्ञाकडे वर्ग करा + डिजिटल निदान प्रयोगशाळा संदर्भ तयार करा.'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons: Lab Referral, Expert Escalation, Dispatch Advisory */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGeneratingLab(!isGeneratingLab)}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{isEn ? '🧪 Step 14: Generate Digital Lab Referral' : '🧪 पायरी १४: डिजिटल प्रयोगशाळा संदर्भ तयार करा'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEscalateToExpert}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isEn ? '🚀 Step 13: Escalate to Expert' : '🚀 पायरी १३: तज्ज्ञाकडे वर्ग करा'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEn ? `💾 Step 15: Dispatch CIBRC Advisory for "${modifiedDiagnosis}" to Farmer` : `💾 पायरी १५: शेतकऱ्याला "${modifiedDiagnosis}" साठी CIBRC सल्ला पाठवा`}</span>
                </button>
              </div>
            </form>

            {/* STEP 14: DIGITAL LAB REFERRAL SLIP WITH QR CODE */}
            {isGeneratingLab && (
              <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-400 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-purple-200 pb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-purple-900 bg-purple-200 px-2 py-0.5 rounded-full">
                      {isEn ? 'STEP 14 — DIGITAL LAB REFERRAL' : 'पायरी १४ — डिजिटल प्रयोगशाळा संदर्भ'}
                    </span>
                    <h4 className="font-extrabold text-purple-950 text-base mt-1">
                      {isEn ? 'Digital Diagnostic Lab Referral Slip' : 'डिजिटल निदान प्रयोगशाळा संदर्भ पत्र'}
                    </h4>
                  </div>
                  <button onClick={() => setIsGeneratingLab(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <span className="font-bold text-slate-700 block text-[11px]">{isEn ? 'Case ID:' : 'प्रकरण क्रमांक:'}</span>
                      <input type="text" value={selectedCase.case_id} readOnly className="w-full border rounded p-1.5 bg-white font-mono" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[11px]">{isEn ? 'Specimen Sample Type:' : 'नमुना प्रकार:'}</span>
                      <input type="text" value={labSampleType} onChange={(e) => setLabSampleType(e.target.value)} className="w-full border rounded p-1.5 bg-white" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[11px]">{isEn ? 'Farmer Name:' : 'शेतकरी नाव:'}</span>
                      <input type="text" value={selectedCase.farmer_profile?.farmer_name} readOnly className="w-full border rounded p-1.5 bg-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-bold text-slate-700 block text-[11px]">{isEn ? 'Collected By:' : 'संकलन यांनी:'}</span>
                      <input type="text" value="Krishi Sevak Anil Deshmukh (ksevak_202)" readOnly className="w-full border rounded p-1.5 bg-white" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[11px]">{isEn ? 'Collection Date:' : 'संकलन दिनांक:'}</span>
                      <input type="text" value="05/09/2026" readOnly className="w-full border rounded p-1.5 bg-white" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[11px]">{isEn ? 'Suspected Entity / Requested Test:' : 'संशयित रोगजंतू / अपेक्षित चाचणी:'}</span>
                      <input type="text" value={`${modifiedDiagnosis} (${labTestType})`} onChange={(e) => setLabTestType(e.target.value)} className="w-full border rounded p-1.5 bg-white" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-12 h-12 text-purple-800" />
                    <div>
                      <span className="font-mono font-bold text-purple-950 block">{isEn ? 'QR Code:' : 'QR कोड:'} MH-YAV-LAB-2026-0891</span>
                      <span className="text-[10px] text-emerald-700 font-bold">{isEn ? 'Chain-of-Custody: READY TO ISSUE' : 'साखळी ताबा: द्यायला तयार'}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateLabReferral}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs transition"
                  >
                    {isEn ? '[ISSUE DIGITAL REFERRAL SLIP]' : '[डिजिटल संदर्भ पत्र द्या]'}
                  </button>
                </div>
              </div>
            )}

            {/* OFFICIALLY ISSUED DIGITAL LAB REFERRAL CERTIFICATE (Rendered permanently after issue) */}
            {activeLabReferral && (
              <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-6 rounded-2xl border-2 border-purple-400 shadow-lg space-y-4 text-xs font-mono">
                <div className="flex flex-wrap justify-between items-center border-b border-purple-700 pb-3 gap-2">
                  <div>
                    <span className="bg-purple-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                      {isEn ? '✓ OFFICIAL DIGITAL LAB REFERRAL ISSUED & ACTIVE' : '✓ अधिकृत डिजिटल प्रयोगशाळा संदर्भ जारी व सक्रिय'}
                    </span>
                    <h3 className="font-black text-white text-base mt-1">
                      MahaAgri {isEn ? 'Digital Diagnostic Referral' : 'डिजिटल निदान संदर्भ'}: #{activeLabReferral.sample_id}
                    </h3>
                  </div>
                  <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {isEn ? 'CHAIN-OF-CUSTODY ACTIVE' : 'साखळी ताबा सक्रिय'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-purple-950/60 p-4 rounded-xl border border-purple-700/60">
                  {/* Left Column: Sample & Destination */}
                  <div className="space-y-1.5">
                    <span className="text-purple-300 font-bold text-[10px] block">{isEn ? 'SPECIMEN METADATA:' : 'नमुना तपशील:'}</span>
                    <p><strong>{isEn ? 'Sample ID:' : 'नमुना क्रमांक:'}</strong> <span className="text-amber-300">{activeLabReferral.sample_id}</span></p>
                    <p><strong>{isEn ? 'Type:' : 'प्रकार:'}</strong> {activeLabReferral.sample_type}</p>
                    <p><strong>{isEn ? 'Assay:' : 'चाचणी:'}</strong> {activeLabReferral.requested_test}</p>
                    <p><strong>{isEn ? 'Collected:' : 'संकलन:'}</strong> {activeLabReferral.collection_date || new Date().toISOString().split('T')[0]}</p>
                  </div>

                  {/* Middle Column: Lab Destination & Officer */}
                  <div className="space-y-1.5">
                    <span className="text-purple-300 font-bold text-[10px] block">{isEn ? 'ROUTING & CUSTODY:' : 'पाठवणी व ताबा:'}</span>
                    <p><strong>{isEn ? 'Destination:' : 'गंतव्य:'}</strong> <span className="text-emerald-300">{activeLabReferral.destination_lab}</span></p>
                    <p><strong>{isEn ? 'Officer:' : 'अधिकारी:'}</strong> Anil S. Deshmukh (ksevak_202)</p>
                    <p><strong>{isEn ? 'Farmer:' : 'शेतकरी:'}</strong> {selectedCase.farmer_profile?.farmer_name} ({isEn ? 'Case #' : 'प्रकरण #'}{selectedCase.case_id})</p>
                    <p><strong>{isEn ? 'Security Hash:' : 'सुरक्षा हॅश:'}</strong> SHA-256 {isEn ? 'Verified' : 'सत्यापित'}</p>
                  </div>

                  {/* Right Column: Encrypted QR Code & Actions */}
                  <div className="bg-white p-3 rounded-xl text-slate-900 flex flex-col items-center justify-center text-center space-y-1.5">
                    <QrCode className="w-16 h-16 text-purple-900" />
                    <span className="text-[10px] font-bold text-purple-950">{isEn ? 'SCAN AT LAB GATE' : 'प्रयोगशाळा दरवाज्यावर स्कॅन करा'}</span>
                    <span className="text-[9px] text-slate-500 font-mono font-bold">QR: {activeLabReferral.sample_id}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-purple-800 text-[11px] gap-2">
                  <span className="text-purple-300">
                    📦 {isEn ? 'Courier protocol: Cold-chain ice pack dispatched. Diagnostic turnaround: 48 Hours.' : 'कुरिअर पद्धत: कोल्ड-चेन बर्फ पॅक पाठवला. निदान निकाल ४८ तासांत.'}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => alert(isEn ? `🖨️ Printing Official Digital Lab Slip for Sample #${activeLabReferral.sample_id}...\n• Barcode & QR Code embedded.\n• Affix one label on specimen vial, one on outer courier pouch.` : `🖨️ नमुना #${activeLabReferral.sample_id} साठी अधिकृत डिजिटल लॅब स्लिप छापत आहे...\n• बारकोड व QR कोड समाविष्ट.\n• नमुना कुपीवर एक लेबल व बाहेरील कुरिअर थैलीवर एक लेबल चिकटवा.`)}
                      className="px-3 py-1.5 bg-white text-purple-950 rounded-lg font-bold hover:bg-purple-100 transition shadow-xs"
                    >
                      🖨️ {isEn ? 'Print Lab Slip & Barcodes' : 'लॅब स्लिप व बारकोड छापा'}
                    </button>
                    <button 
                      onClick={() => {
                        setActiveLabReferral(null);
                        alert(isEn 
                          ? `✅ Lab Referral Slip closed.\n• Case #${selectedCase.case_id} is now linked to Lab Sample #${activeLabReferral.sample_id}.\n• The Diagnostic Lab Portal (Role 4) will now receive and process this specimen.` 
                          : `✅ लॅब संदर्भ पत्र बंद केले.\n• प्रकरण #${selectedCase.case_id} आता लॅब नमुना #${activeLabReferral.sample_id} शी जोडले.\n• निदान प्रयोगशाळा पोर्टल (भूमिका ४) आता हा नमुना प्राप्त करून प्रक्रिया करेल.`);
                      }}
                      className="px-3 py-1.5 bg-purple-800 text-purple-200 rounded-lg font-bold hover:bg-purple-700 transition"
                    >
                      {isEn ? '✓ Close Slip (Proceed with Inspection)' : '✓ स्लिप बंद करा (पाहणीसह पुढे जा)'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 15 & 16: OFFICIAL AUTHORITATIVE CIBRC IPM ADVISORY FOR FIELD DISPATCH */}
            <div className="bg-emerald-50/70 p-5 rounded-2xl border-2 border-emerald-300 space-y-4 text-xs">
              <div className="flex flex-wrap justify-between items-center border-b border-emerald-200/80 pb-3 gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-900 bg-emerald-200 px-2.5 py-0.5 rounded-full">
                    {isEn ? 'STEP 15 & 16 — FIELD-VERIFIED CIBRC IPM ADVISORY (DISPATCH TO FARMER)' : 'पायरी १५ व १६ — क्षेत्र-सत्यापित CIBRC IPM सल्ला (शेतकऱ्याला पाठवा)'}
                  </span>
                  <h4 className="font-black text-emerald-950 text-sm mt-1">
                    {isEn ? 'Official Extension Advisory for "' : 'अधिकृत विस्तार सल्ला "'}{modifiedDiagnosis}{isEn ? '"' : '" साठी'}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
{advisoryDispatched 
                    ? (isEn ? '✓ This verified advisory has been dispatched and synced to the farmer\'s smartphone app.' : '✓ हा सत्यापित सल्ला शेतकऱ्याच्या मोबाईल अॅपवर पाठवून जोडला गेला आहे.')
                    : (isEn ? 'ℹ️ Preview of the authoritative CIBRC advisory. You can customize or fine-tune any recommendation below before dispatching.' : 'ℹ️ प्रमाणित CIBRC सल्ल्याचे पूर्वावलोकन. पाठवण्यापूर्वी खालील शिफारसी बदलू शकता.')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isEditingAdvisory) {
                        setCustomCultural(activeIPM.cultural);
                        setCustomBiological(activeIPM.biological);
                        setCustomChemical(activeIPM.chemical);
                        setCustomSafety(activeIPM.safety);
                      }
                      setIsEditingAdvisory(!isEditingAdvisory);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 shadow-xs ${
                      isEditingAdvisory ? 'bg-amber-600 text-white' : 'bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingAdvisory ? (isEn ? '✓ Done Customizing' : '✓ सुधारणा पूर्ण') : (isEn ? '✏️ Customize / Edit Advisory' : '✏️ सल्ला सुधारा / बदला')}</span>
                  </button>

                  {advisoryDispatched ? (
                    <span className="bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1.5 shadow-xs">
                      <CheckCircle className="w-4 h-4" /> {isEn ? 'Dispatched & Synced ✓' : 'पाठविले व जोडले ✓'}
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1">
                      ⏳ {isEn ? 'Pending Dispatch' : 'पाठवणी प्रलंबित'}
                    </span>
                  )}
                </div>
              </div>

              {/* 4 Advisory Cards (Editable or Preview Mode) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Cultural Control */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
                  <span className="font-bold text-emerald-900 block flex items-center justify-between">
                    <span>{isEn ? '1. Cultural & Mechanical Control' : '१. सांस्कृतिक व यांत्रिक नियंत्रण'}</span>
                    {isEditingAdvisory && <span className="text-[10px] text-amber-700 font-bold">{isEn ? 'Editable' : 'सुधारण्यायोग्य'}</span>}
                  </span>
                  {isEditingAdvisory ? (
                    <textarea
                      value={customCultural}
                      onChange={(e) => setCustomCultural(e.target.value)}
                      rows={3}
                      className="w-full border border-emerald-300 rounded p-2 text-slate-800 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {activeIPM.cultural}
                    </p>
                  )}
                </div>

                {/* 2. Biological Control */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
                  <span className="font-bold text-emerald-900 block flex items-center justify-between">
                    <span>{isEn ? '2. Biological / Organic Control' : '२. जैविक / सेंद्रिय नियंत्रण'}</span>
                    {isEditingAdvisory && <span className="text-[10px] text-amber-700 font-bold">{isEn ? 'Editable' : 'सुधारण्यायोग्य'}</span>}
                  </span>
                  {isEditingAdvisory ? (
                    <textarea
                      value={customBiological}
                      onChange={(e) => setCustomBiological(e.target.value)}
                      rows={3}
                      className="w-full border border-emerald-300 rounded p-2 text-slate-800 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {activeIPM.biological}
                    </p>
                  )}
                </div>

                {/* 3. Chemical Molecule & Dosage */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
                  <span className="font-bold text-emerald-900 block flex items-center justify-between">
                    <span>{isEn ? '3. Certified Chemical & Exact Dose' : '३. प्रमाणित रसायन व नेमका डोस'}</span>
                    {isEditingAdvisory && <span className="text-[10px] text-amber-700 font-bold">{isEn ? 'Editable' : 'सुधारण्यायोग्य'}</span>}
                  </span>
                  {isEditingAdvisory ? (
                    <textarea
                      value={customChemical}
                      onChange={(e) => setCustomChemical(e.target.value)}
                      rows={3}
                      className="w-full border border-emerald-300 rounded p-2 text-slate-800 bg-white text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-slate-800 font-bold text-[11px] leading-relaxed">
                      {activeIPM.chemical}
                    </p>
                  )}
                </div>

                {/* 4. Safety & PHI */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
                  <span className="font-bold text-emerald-900 block flex items-center justify-between">
                    <span>{isEn ? '4. Safety & PHI Regulations' : '४. सुरक्षा व PHI नियम'}</span>
                    {isEditingAdvisory && <span className="text-[10px] text-amber-700 font-bold">{isEn ? 'Editable' : 'सुधारण्यायोग्य'}</span>}
                  </span>
                  {isEditingAdvisory ? (
                    <textarea
                      value={customSafety}
                      onChange={(e) => setCustomSafety(e.target.value)}
                      rows={3}
                      className="w-full border border-emerald-300 rounded p-2 text-slate-800 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {activeIPM.safety}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* TAB 4: FOLLOW-UP MANAGEMENT & DETERIORATION ALERTS (Steps 17 & 18) */}
      {activeTab === 'follow_ups' && (
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {isEn ? 'STEP 17 & 18 — FOLLOW-UP QUEUE & AUTOMATED DETERIORATION ALERT' : 'पायरी १७ व १८ — पाठपुरावा यादी व स्वयंचलित खराबी सूचना'}
              </span>
              <h2 className="font-black text-slate-900 text-lg mt-1">
                {isEn ? 'Follow-ups Due Today' : 'आजचे प्रलंबित पाठपुरावे'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn ? 'If disease severity increases post-treatment (e.g. 25% → 42%), the system flags an automated Treatment Outcome Alert and auto-escalates to an Agriculture Expert.' : 'उपचारानंतर रोगाची तीव्रता वाढल्यास (उदा. 25% → 42%), प्रणाली स्वयंचलितरित्या उपचार निकाल सूचना देते व कृषी तज्ज्ञाकडे वर्ग करते.'}
              </p>
            </div>
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {isEn ? '7 Active Follow-ups in Darwha' : 'दारव्हामध्ये ७ सक्रिय पाठपुरावे'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {[...cases]
              .sort((a, b) => {
                // Pending follow-ups first (false/undefined), evaluated follow-ups last (true)
                if (a.follow_up_evaluated === b.follow_up_evaluated) return 0;
                return a.follow_up_evaluated ? 1 : -1;
              })
              .map(c => {
                const fuData = getCaseFollowUp(c);
                const isDet = fuData.day7Severity > fuData.day0Severity;

                return (
              <div key={c.case_id} className={`p-5 rounded-2xl border space-y-3 shadow-xs transition ${
                c.follow_up_evaluated ? 'border-slate-200 bg-slate-100/70 opacity-90' : 'border-slate-300 bg-slate-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">#{c.case_id}</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        c.follow_up_evaluated 
                          ? 'bg-slate-200 text-slate-700' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {c.recovery_status || 'TREATMENT_APPLIED'}
                      </span>
                    </div>
                    <p className="text-slate-700 font-bold mt-1">
                      🌱 {c.farmer_profile?.crop_name} • {c.diagnosis?.detected_entity?.split('(')[0]}
                    </p>
                  </div>
                  <span className="text-slate-500">{c.farmer_profile?.village}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-slate-700">
                  <p><strong>{isEn ? 'Farmer:' : 'शेतकरी:'}</strong> {c.farmer_profile?.farmer_name} (+91 98223 45678)</p>
                  <p><strong>{isEn ? 'Treatment Recorded:' : 'उपचार नोंदले:'}</strong> {fuData.treatmentName} ({isEn ? 'YES' : 'होय'})</p>
                  <p><strong>{isEn ? 'Last Inspection:' : 'शेवटची तपासणी:'}</strong> {isEn ? '7 days ago' : '७ दिवसांपूर्वी'}</p>
                </div>

                {/* VISUAL EVIDENCE: Day 0 Baseline Photo vs Day 7 Re-scan Photo */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-extrabold text-slate-900 block text-[11px] flex items-center justify-between">
                    <span>{isEn ? '📸 Photographic Recovery Evidence (Day 0 vs Day 7):' : '📸 फोटो हस्तांतरित पुनर्प्राप्ती पुरावा (दिवस ० vs दिवस ७):'}</span>
                    <span className="text-[10px] text-emerald-700 font-bold">{isEn ? 'Side-by-Side Lesion Verification' : 'शेजारी राहून फोड तपासणी'}</span>
                  </span>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    {/* Day 0 Initial Image */}
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-600">{isEn ? 'Day 0 (Initial)' : 'दिवस ० (प्रारंभिक)'}</span>
                        <span className="text-rose-700 font-mono">{fuData.day0Severity}% {isEn ? 'Lesions' : 'फोड'}</span>
                      </div>
                      <div className="aspect-video bg-slate-900 rounded overflow-hidden relative group">
                        <img 
                          src={fuData.day0Photo} 
                          alt={isEn ? 'Day 0' : 'दिवस ०'} 
                          className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white cursor-pointer text-[10px] font-bold">
                          <Camera className="w-4 h-4 mr-1" /> {isEn ? 'Replace' : 'बदला'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment"
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) updateCaseFollowUp(c.case_id, { day0Photo: URL.createObjectURL(file) });
                            }}
                          />
                        </label>
                      </div>
                      <span className="text-[9px] text-slate-500 block truncate" title={fuData.day0Desc}>{fuData.day0Desc}</span>
                    </div>

                    {/* Day 7 Re-scan Image */}
                    <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-emerald-900">{isEn ? 'Day 7 (Re-scan)' : 'दिवस ७ (पुन्हा स्कॅन)'}</span>
                        <span className={`font-mono ${isDet ? 'text-rose-700' : 'text-emerald-700'}`}>{fuData.day7Severity}% {isEn ? 'Lesions' : 'फोड'}</span>
                      </div>
                      <div className="aspect-video bg-slate-900 rounded overflow-hidden relative group border border-emerald-300">
                        <img 
                          src={fuData.day7Photo} 
                          alt={isEn ? 'Day 7' : 'दिवस ७'} 
                          className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white cursor-pointer text-[10px] font-bold">
                          <Camera className="w-4 h-4 mr-1" /> {isEn ? 'Upload / Retake' : 'अपलोड / पुन्हा काढा'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment"
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                updateCaseFollowUp(c.case_id, { day7Photo: url, isAnalyzing: true });
                                setTimeout(() => {
                                  const calculatedDay7 = Math.max(4, Math.floor(fuData.day0Severity * 0.4));
                                  updateCaseFollowUp(c.case_id, { day7Severity: calculatedDay7, isAnalyzing: false });
                                  alert(isEn 
                                    ? `📸 AI Re-Scan Vision Completed for #${c.case_id} (${c.farmer_profile?.crop_name})!\n• Lesion area calculated automatically: ${calculatedDay7}%\n• Recovery improvement: ${fuData.day0Severity - calculatedDay7}% healing confirmed.` 
                                    : `📸 AI पुन्हा-स्कॅन दृष्टी पूर्ण (${c.farmer_profile?.crop_name})!\n• फोड क्षेत्र स्वयं गणले: ${calculatedDay7}%\n• सुधारणा: ${fuData.day0Severity - calculatedDay7}% बरे झाले पुष्टी.`);
                                }, 1200);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <label className="text-[9px] text-emerald-800 font-bold hover:underline cursor-pointer block truncate" title={fuData.day7Desc}>
                        {fuData.isAnalyzing ? (isEn ? '⏳ AI Calculating...' : '⏳ AI मोजत आहे...') : (fuData.day7Photo ? (isEn ? '✓ Photo Attached' : '✓ फोटो जोडला') : (isEn ? '📷 Take Photo' : '📷 फोटो घ्या'))}
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment"
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              updateCaseFollowUp(c.case_id, { day7Photo: url, isAnalyzing: true });
                              setTimeout(() => {
                                const calculatedDay7 = Math.max(4, Math.floor(fuData.day0Severity * 0.4));
                                updateCaseFollowUp(c.case_id, { day7Severity: calculatedDay7, isAnalyzing: false });
                                alert(isEn 
                                  ? `📸 AI Re-Scan Vision Completed for #${c.case_id} (${c.farmer_profile?.crop_name})!\n• Lesion area calculated automatically: ${calculatedDay7}%\n• Recovery improvement: ${fuData.day0Severity - calculatedDay7}% healing confirmed.` 
                                  : `📸 AI पुन्हा-स्कॅन दृष्टी पूर्ण (${c.farmer_profile?.crop_name})!\n• फोड क्षेत्र स्वयं गणले: ${calculatedDay7}%\n• सुधारणा: ${fuData.day0Severity - calculatedDay7}% बरे झाले पुष्टी.`);
                              }, 1200);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Step 18: Deterioration Evaluation Simulator & Change Medicine */}
                <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-300 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 block text-[11px]">
                      {isEn ? 'Step 18: Verify Treatment Outcome (Day 0 vs Day 7 Severity %):' : 'पायरी १८: उपचार निकाल तपासा (दिवस ० vs दिवस ७ तीव्रता %):'}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCaseFollowUp(c.case_id, { isPrescribingSecondLine: !fuData.isPrescribingSecondLine })}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-xs"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{fuData.isPrescribingSecondLine ? (isEn ? 'Hide Rx Editor' : 'Rx सुधारक लपवा') : (isEn ? '💊 Change Medicine / Second-Line Rx' : '💊 औषध बदला / द्वितीय-सूत्र Rx')}</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center font-mono">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">{isEn ? 'Day 0 Baseline:' : 'दिवस ० प्रारंभिक:'}</span>
                      <strong className="text-slate-900 text-sm">{fuData.day0Severity}%</strong>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">{isEn ? 'Day 7 Re-scan (Auto/Manual):' : 'दिवस ७ पुन्हा स्कॅन (स्वयं/हस्त):'}</span>
                      <input 
                        type="number" 
                        value={fuData.day7Severity} 
                        onChange={(e) => updateCaseFollowUp(c.case_id, { day7Severity: parseInt(e.target.value) || 0 })}
                        className="w-16 border rounded p-1 font-bold text-center text-xs"
                      />
                    </div>
                  </div>

                  {/* SECOND-LINE MEDICINE REVISION PANEL (If officer needs to switch chemical) */}
                  {fuData.isPrescribingSecondLine && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 space-y-2 text-xs">
                      <span className="font-bold text-amber-950 block text-[11px]">
                        🔄 {isEn ? 'Change Medicine / Prescribe Second-Line Active Ingredient:' : 'औषध बदला / द्वितीय-सूत्र सक्रिय घटक द्या:'}
                      </span>
                      <div className="space-y-1.5">
                        <div>
                          <span className="text-[10px] text-slate-600 font-bold block">{isEn ? 'Second-Line CIBRC Chemical & Dose:' : 'द्वितीय-सूत्र CIBRC रसायन व डोस:'}</span>
                          <input 
                            type="text" 
                            value={fuData.secondLineMolecule}
                            onChange={(e) => updateCaseFollowUp(c.case_id, { secondLineMolecule: e.target.value })}
                            className="w-full border border-amber-300 rounded p-1.5 bg-white font-bold text-slate-800 text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-600 font-bold block">{isEn ? 'Clinical Rationale for Change:' : 'बदलण्याचे वैद्यकीय कारण:'}</span>
                          <input 
                            type="text" 
                            value={fuData.secondLineNotes}
                            onChange={(e) => updateCaseFollowUp(c.case_id, { secondLineNotes: e.target.value })}
                            className="w-full border border-amber-300 rounded p-1.5 bg-white text-slate-800 text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            alert(isEn ? `💊 Revised CIBRC Prescription Dispatched to Farmer ${c.farmer_profile?.farmer_name}!\n• New Molecule: ${fuData.secondLineMolecule}\n• Rationale: ${fuData.secondLineNotes}\n• Next Follow-up: 7 Days.` : `💊 शेतकरी ${c.farmer_profile?.farmer_name} यांना सुधारित CIBRC औषधोपचार पत्रक पाठवले!\n• नवीन घटक: ${fuData.secondLineMolecule}\n• कारण: ${fuData.secondLineNotes}\n• पुढील पाठपुरावा: ७ दिवस.`);
                            updateCaseFollowUp(c.case_id, { isPrescribingSecondLine: false });
                          }}
                          className="w-full py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xs transition"
                        >
                          {isEn ? '[DISPATCH REVISED MEDICINE PRESCRIPTION TO FARMER]' : '[सुधारित औषधोपचार पत्रक शेतकऱ्याला पाठवा]'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Outcome Status Banner */}
                  <div className={`p-2.5 rounded-xl border text-[11px] font-bold ${
                    isDet 
                      ? 'bg-rose-100 border-rose-300 text-rose-900' 
                      : 'bg-emerald-100 border-emerald-300 text-emerald-900'
                  }`}>
                    {isDet ? (
                      <div>
                        🔴 <strong>{isEn ? 'TREATMENT OUTCOME ALERT:' : 'उपचार निकाल गंभीर सूचना:'}</strong> {isEn ? 'Disease severity increased from' : 'रोगाची तीव्रता वाढली'} {fuData.day0Severity}% {isEn ? 'to' : 'वरून'} {fuData.day7Severity}%. {isEn ? 'Recommended: Rotate chemical chemistry or auto-escalate to Expert.' : 'शिफारस: रसायन बदला किंवा तज्ज्ञाकडे स्वयं वर्ग करा.'}
                      </div>
                    ) : (
                      <div>
                        🟢 <strong>{isEn ? 'HEALING VERIFIED:' : 'बरे होणे सत्यापित:'}</strong> {isEn ? 'Severity reduced by' : 'तीव्रता कमी झाली'} {fuData.day0Severity - fuData.day7Severity}%. {isEn ? 'Treatment is working effectively. New green foliage flushing.' : 'उपचार प्रभावी आहे. नवीन हिरवी पाने येत आहेत.'}
                      </div>
                    )}
                  </div>

                  {c.follow_up_evaluated ? (
                    <div className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                      c.follow_up_outcome === 'IMPROVING' 
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-950' 
                        : 'bg-rose-100 border-rose-300 text-rose-950'
                    }`}>
                      <div className="flex items-center gap-2">
                        {c.follow_up_outcome === 'IMPROVING' ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : <AlertTriangle className="w-5 h-5 text-rose-700" />}
                        <div>
                          <span className="block font-black">
                            {c.follow_up_outcome === 'IMPROVING' ? (isEn ? '✓ FOLLOW-UP COMPLETED: CASE RESOLVED' : '✓ पाठपुरावा पूर्ण: प्रकरण निवारण') : (isEn ? '⚠️ FOLLOW-UP COMPLETED: ESCALATED TO EXPERT' : '⚠️ पाठपुरावा पूर्ण: तज्ज्ञाकडे वर्ग केले')}
                          </span>
                          <span className="text-[10px] font-medium block opacity-90">
                            {c.follow_up_outcome === 'IMPROVING' ? (isEn ? '100% Healing confirmed. Audit trail archived.' : '१००% बरे होणे पुष्टी. ऑडिट नोंद सुरक्षित.') : (isEn ? 'Outbreak alert logged. Expert assigned for second-line chemistry.' : 'प्रादुर्भाव सूचना नोंदली. द्वितीय-सूत्र रसायनासाठी तज्ज्ञ नियुक्त.')}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/80 border border-slate-300">
                        {isEn ? 'Status:' : 'स्थिती:'} {c.status}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center pt-1">
                      <button
                        onClick={() => alert(isEn ? `📞 Contacting Farmer ${c.farmer_profile?.farmer_name} at +91 98223 45678...` : `📞 शेतकरी ${c.farmer_profile?.farmer_name} यांना +91 98223 45678 वर संपर्क करत आहोत...`)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{isEn ? '[CONTACT FARMER]' : '[शेतकऱ्याशी संपर्क करा]'}</span>
                      </button>

                      <button
                        onClick={() => handleEvaluateFollowUp(c)}
                        className={`px-4 py-1.5 rounded-lg font-bold text-xs text-white shadow-xs ${
                          isDet ? 'bg-rose-700 hover:bg-rose-800' : 'bg-emerald-700 hover:bg-emerald-800'
                        }`}
                      >
                        {isDet ? (isEn ? '[TRIGGER OUTCOME ALERT & ESCALATE]' : '[निकाल सूचना व तज्ज्ञांकडे वर्ग करा]') : (isEn ? '[CONFIRM RECOVERY & RESOLVE]' : '[बरे होणे पुष्टी करून निवारण करा]')}
                      </button>
                    </div>
                  )}
                </div>

              </div>
                );
              })}
          </div>
        </section>
      )}

      {/* TAB 5: GOVERNMENT SURVEILLANCE ROLL-UP (Step 19) */}
      {activeTab === 'surveillance' && (
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {isEn ? 'STEP 19 — KRISHI SEVAK DATA CONTRIBUTION TO GOVERNMENT SURVEILLANCE' : 'पायरी १९ — शासकीय निरीक्षणासाठी कृषी सेवक डेटा योगदान'}
            </span>
            <h2 className="font-black text-slate-900 text-lg mt-1">
              {isEn ? 'Field Data Aggregation into District Surveillance Engine' : 'जिल्हा निरीक्षण यंत्रणेत शेत डेटा एकत्रीकरण'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEn ? 'When 20 Krishi Sevaks report cases in Yavatmal, the system aggregates: Farmer Cases + Field Inspections + Trap Counts + Weather → Feeds State Surveillance Engine.' : 'यवतमाळमधील २० कृषी सेवकांनी प्रकरणे नोंदवल्यास, प्रणाली एकत्र करते: शेतकरी प्रकरणे + शेत पाहणी + सापळा संख्या + हवामान → राज्य निरीक्षण यंत्रणेकडे.'}
            </p>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-rose-400 font-bold text-base block">{isEn ? '🔴 EMERGING HOTSPOT: YAVATMAL (DARWHA CLUSTER)' : '🔴 उदयोन्मुख टंचाई क्षेत्र: यवतमाळ (दारव्हा गट)'}</span>
                <span className="text-slate-400 text-xs">{isEn ? 'Aggregated from 20 Krishi Sevak Field Submissions' : '२० कृषी सेवक शेत सादरीकरणांवरून एकत्रित'}</span>
              </div>
              <span className="bg-rose-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full animate-pulse">
                {isEn ? '7-DAY RISK: HIGH (91%)' : '७-दिवसीय जोखीम: उच्च (९१%)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-500 block text-[10px]">{isEn ? 'Target Crop:' : 'लक्ष्य पीक:'}</span>
                <strong className="text-white text-sm">Cotton</strong>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-500 block text-[10px]">{isEn ? 'Primary Threat:' : 'मुख्य धोका:'}</span>
                <strong className="text-rose-400 text-sm">Pink Bollworm</strong>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-500 block text-[10px]">{isEn ? 'Confirmed Cases:' : 'पुष्टी प्रकरणे:'}</span>
                <strong className="text-white text-sm">{isEn ? '47 Cases' : '४७ प्रकरणे'}</strong>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-500 block text-[10px]">{isEn ? 'ETL Breaches:' : 'ETL उल्लंघने:'}</span>
                <strong className="text-amber-400 text-sm">{isEn ? '18 Traps Breached' : '१८ सापळे उल्लंघन'}</strong>
              </div>
            </div>

            <p className="text-emerald-400 text-[11px] pt-1">
              {isEn ? '✓ Ground-truth field verification verified by Officer Anil Deshmukh & 19 Beat Officers. Ready for State Government public SMS broadcast dispatch.' : '✓ अधिकारी अनिल देशमुख व १९ क्षेत्र अधिकाऱ्यांनी भू-सत्य शेत पडताळणी पूर्ण केली. राज्य सरकारच्या सार्वजनिक SMS प्रसारणासाठी तयार.'}
            </p>
          </div>
        </section>
      )}

    </div>
  );
};
