export const translations = {
  mr: {
    appTitle: "महाकिसान रक्षक",
    appSubtitle: "महाराष्ट्र शासन — पिकांवरील रोग व कीड पूर्वसूचना आणि एकात्मिक व्यवस्थापन प्रणाली",
    tagline: "अचूक रोग निदान • हवामान आधारित पूर्व चेतावणी • प्रमाणित कीडनाशक शिफारसी",
    
    // Roles
    roles: {
      FARMER: "शेतकरी (Farmer)",
      KRISHI_SEVAK: "कृषी सेवक (Field Extension)",
      AGRI_EXPERT: "कृषी तज्ज्ञ (Agri Scientist)",
      DIAGNOSTIC_LAB: "रोगनिदान प्रयोगशाळा (Lab)",
      GOVT_ADMIN: "शासकीय अधिकारी (Govt Admin)"
    },

    roleDescriptions: {
      FARMER: {
        en: 'Crop scan, 7-day risk, CIBRC IPM & dosage calculator',
        mr: 'पीक स्कॅन, ७-दिवसीय धोका अंदाज व IPM शिफारसी',
        hi: 'फसल स्कैन, 7-दिवेशीय जोखिम, CIBRC IPM एवं खुराक कैलकुलेटर'
      },
      KRISHI_SEVAK: {
        en: 'Trap counts, field inspections & local alerts',
        mr: 'सापळा नोंद, शेतकरी पडताळणी व स्थानिक चेतावणी',
        hi: 'ट्रैप गिनती, खेत निरीक्षण एवं स्थानीय चेतावनी'
      },
      AGRI_EXPERT: {
        en: 'Clinical triage queue, BBox diagnosis & lab referral',
        mr: 'उच्च प्राधान्य पडताळणी व लॅब रेफरल',
        hi: 'नैदानिक त्रिक्वी कतार, बीओक्स निदान एवं लैब रेफरल'
      },
      DIAGNOSTIC_LAB: {
        en: 'QR sample intake, microscopy, PCR assays & reports',
        mr: 'QR नमुना तपासणी व पॅथॉलॉजी अहवाल',
        hi: 'QR नमूना संग्रह, माइक्रोस्कोपी, पीसीआर परीक्षण एवं रिपोर्ट'
      },
      GOVT_ADMIN: {
        en: '36-District GIS hotspots, public broadcasts & audit',
        mr: '३६ जिल्हे GIS हॉटस्पॉट व SMS/WhatsApp प्रसारण',
        hi: '36-जिला GIS हॉटस्पॉट, सार्वजनिक प्रसारण एवं लेखा परीक्षण'
      }
    },

    // Navigation Tabs
    nav: {
      farmerPortal: "🌾 शेतकरी कक्ष (Farmer Portal)",
      surveillance: "🗺️ महाराष्ट्र GIS हॉटस्पॉट (GIS Surveillance)",
      ingestion: "📡 डेटा संकलन व सेन्सर्स (Data Ingestion)",
      expertTriage: "🧑🔬 तज्ज्ञ पडताळणी व लॅब (Expert & Lab)",
      monitoring: "📊 सिस्टीम हेल्थ व ऑडिट (System Health)"
    },

    // Profile Section
    profile: {
      title: "शेतकरी व शेत माहिती (Farm & Crop Profile)",
      desc: "ही माहिती अचूक रोग निदान व भविष्यातील धोक्याच्या अंदाजासाठी वापरली जाते.",
      farmerName: "शेतकऱ्याचे नाव",
      contact: "संपर्क क्रमांक",
      district: "जिल्हा",
      taluka: "तालुका",
      village: "गाव",
      farmSize: "शेताचे क्षेत्र (एकर)",
      cropName: "सध्याचे पीक",
      variety: "वाण (Variety)",
      sowingDate: "पेरणीची तारीख",
      cropStage: "पिकाची अवस्था",
      soilType: "जमिनीचा प्रकार",
      soilDrainage: "पाण्याचा निचरा",
      irrigation: "सिंचन पद्धती",
      editBtn: "✏️ शेत प्रोफाइल बदला",
      cancelBtn: "रद्द करा",
      saveBtn: "माहिती जतन करा",
      savedSuccess: "शेत माहिती यशस्वीरीत्या जतन केली!"
    },

    // Diagnosis Section
    diagnosis: {
      title: "१. पिकावरील रोगाचे त्वरित निदान (Current AI Diagnosis)",
      desc: "रोगाचे किंवा किडीचे छायाचित्र अपलोड करा किंवा कॅमेरा वापरा.",
      uploadTitle: "पिकाचा फोटो स्कॅन करा (Upload Symptom Photo)",
      uploadPlaceholder: "फोटो अपलोड करण्यासाठी येथे क्लिक करा किंवा ड्रॉप करा",
      samplePresetsTitle: "नमुना फोटो निवडा (Maharashtra Test Cases):",
      scanBtn: "📸 रोग निदान करा (AI Vision Scan)",
      scanning: "पिकाचे विश्लेषण सुरू आहे...",
      detectedDisease: "शोधलेला रोग / कीड:",
      scientificName: "शास्त्रीय नाव:",
      confidence: "अचूकता विश्वासार्हता (Confidence):",
      severity: "तीव्रता पातळी (Severity):",
      affectedPart: "प्रभावित भाग:",
      symptomsTitle: "दृष्यमान लक्षणे (Visual Symptoms):",
      listenVoice: "🔊 मराठीत ऐका (Voice Advisory)",
      stopVoice: "थांबवा"
    },

    // Risk Forecasting Section
    risk: {
      title: "२. ७ दिवसांचा भविष्यातील रोग धोका अंदाज (Future Epidemiological Risk)",
      desc: "हवामान + पिकाची अवस्था + माती + कामगंध सापळे + ऐतिहासिक नोंदींवर आधारित पूर्वसूचना.",
      riskLevel: "धोका पातळी:",
      riskScore: "एकूण धोका निर्देशांक:",
      drivingFactors: "धोका वाढवणारे घटक (Key Driving Factors):",
      preventiveActions: "प्रतिबंधात्मक उपाययोजना (Preventive Actions):",
      etlAlert: "⚠️ कामगंध सापळ्यामध्ये आर्थिक नुकसान पातळी (ETL) ओलांडली आहे!"
    },

    // Authoritative IPM
    ipm: {
      title: "प्रमाणित एकात्मिक कीड व्यवस्थापन (Authoritative IPM Advisory)",
      subtitle: "केंद्रीय कीटकनाशक मंडळ (CIBRC) व वसंतराव नाईक / राहुरी कृषी विद्यापीठ शिफारशीत",
      cultural: "🌱 मशागतीय नियंत्रण (Cultural Practices)",
      mechanical: "⚙️ यांत्रिक व सापळे (Mechanical Controls)",
      biological: "🐛 जैविक व सेंद्रिय नियंत्रण (Biological)",
      chemical: "🧪 प्रमाणित रासायनिक फवारणी (Chemical Options)",
      tradeName: "औषधाचे नाव:",
      activeIngredient: "घटक:",
      pumpDosage: "१५ लिटर पंपासाठी प्रमाण:",
      acreDosage: "एकरी प्रमाण:",
      phi: "प्रतीक्षा कालावधी (PHI):",
      toxicityLabel: "विषारीपणा खूण:",
      safety: "🛡️ फवारणी सुरक्षा व खबरदारी (PPE Checklist)",
      warning: "⚠️ महत्त्वाची सूचना:",
      safetyRules: "सुरक्षितता नियम: फवारणीनंतर सुरक्षित प्रतीक्षा कालावधी (PHI) पूर्ण पाळा. नेहमी हातमोजे व मास्क वापरा."
    },

    // Dosage Calculator
    calc: {
      title: "🧮 सुरक्षित औषध प्रमाण कॅल्क्युलेटर (Dosage Calculator)",
      farmAcres: "शेताचे क्षेत्र (एकर):",
      pumpCapacity: "पंपाची क्षमता (लिटर):",
      waterPerAcre: "एकरी पाण्याचे प्रमाण (लिटर):",
      dosePerPump: "प्रति पंप औषधाचे प्रमाण:",
      totalChemical: "एकूण लागणारे औषध:",
      pumpsRequired: "लागणारे पंप संख्या (प्रति एकर):",
      phiBadge: "दिवस (Pre-Harvest Interval)"
    },

    // Cases
    cases: {
      title: "मागील प्रकरणे व पाठपुरावा (Follow-up Tracking)",
      subtitle: "फवारणीच्या नोंदी आणि कृषी सेवकाची पडताळणी स्थिती",
      caseId: "प्रकरण क्रमांक:",
      status: "स्थिती:",
      logTreatmentBtn: "➕ फवारणी औषधाची नोंद करा",
      treatmentApplied: "केलेली फवारणी:",
      moleculePlaceholder: "औषधाचे नाव (उदा. Emamectin Benzoate 5% SG)",
      dosagePlaceholder: "वापरलेले प्रमाण (उदा. 7.5 gm / 15L पंप)",
      saveTreatment: "जतन करा",
      recoveryCheck: "पुनरुज्जीवन तपासणी (Recovery Status):",
      expertAdvice: "कृषी तज्ज्ञ शेरा (Expert Advice):"
    },

    // Surveillance
    surveillance: {
      monitoredDistricts: "निगराणीखालील जिल्हे",
      criticalDistricts: "अति-गंभीर जिल्हे (Critical)",
      activeEtlBreaches: "सक्रिय कीड उद्रेक (ETL Breaches)",
      dispatchedAlerts: "प्रसारित चेतावणी (Alerts)",
      gridTitle: "महाराष्ट्र राज्य कीड व रोग हॉटस्पॉट नकाशा (GIS Surveillance Grid)",
      gridSubtitle: "३६ जिल्ह्यांचे रिअल-टाइम प्रादुर्भाव निर्देशांक व कीड सापळा विश्लेषण",
      districtDetails: "जिल्हा तपशील",
      division: "विभाग",
      crop: "प्रमुख पीक",
      threat: "सक्रिय धोका",
      cases: "नोंदवलेली प्रकरणे",
      affectedEst: "एकूण बाधित शेतकरी अंदाज",
      broadcastTitle: "सार्वजनिक चेतावणी प्रसारण (Public Alert Broadcast)",
      targetDistricts: "लक्ष्य जिल्हे:",
      messageLabel: "संदेश:",
      broadcastBtn: "📢 शेतकऱ्यांना चेतावणी पाठवा (Broadcast Now)"
    },

    // Ingestion
    ingestion: {
      title: "एकात्मिक डेटा संकलन व पडताळणी गेटवे (Data Ingestion Gateway)",
      subtitle: "AgroMet Weather APIs • IoT Field Sensors • Pheromone Traps • Historical Endemicity",
      qualityIndex: "डेटा गुणवत्ता निर्देशांक",
      weatherTitle: "१. हवामान डेटा संकलन (Agromet Ingest)",
      trapTitle: "२. कीड सापळा डेटा (Trap Counts)",
      sensorTitle: "३. IoT शेत सेन्सर मेश (Sensor Mesh)",
      temp: "तापमान (°C):",
      humidity: "आद्रता (RH %):",
      rain: "पाऊस २४ तास (mm):",
      leafWetness: "पानावरील ओलावा (LWD hrs):",
      sendWeatherBtn: "📥 हवामान डेटा गेटवेवर पाठवा",
      trapId: "सापळा क्रमांक:",
      targetPest: "लक्ष्य कीड:",
      trapCount: "सापळ्यात सापडलेले पतंग:",
      etlThreshold: "नुकसान मर्यादा (ETL):",
      ingestTrapBtn: "🪤 सापळा नोंदणी करा (Ingest Trap)",
      activeTraps: "सक्रिय सापळे नोंद:",
      soilMoisture: "मातीचा ओलावा",
      canopyTemp: "कॅनॉपी तापमान",
      solarRadiation: "सौर विकिरण",
      pests: "पests कीटक"
    },

    // Expert
    expert: {
      title: "कृषी शास्त्रज्ञ पडताळणी व लॅब रेफरल पोर्टल (Expert Triage & Lab)",
      queueTitle: "पडताळणी प्रलंबित प्रकरणे (Triage Queue)",
      deepDiveTitle: "तपशीलवार तपासणी",
      confirmModifyLabel: "तज्ज्ञ निदान दुरुस्ती / पुष्टी:",
      clinicalNotesLabel: "शास्त्रज्ञ शेरा व विशेष सल्ला:",
      labCheckLabel: "🧪 प्रयोगशाळा तपासणीसाठी पाठवा (Generate QR-coded Lab Slip)",
      approveBtn: "✅ निदान प्रमाणित करा (Approve & Sync Active Learning)",
      labTrackingTitle: "निदान प्रयोगशाळा नमुना ट्रॅकिंग (Lab Samples Chain of Custody)",
      labSpecimen: {
        en: 'Leaf Sample (पानाचा नमुना)',
        mr: 'पानाचा नमुना',
        hi: 'पान का नमूना'
      }
    },

    // Monitoring
    monitoring: {
      title: "सिस्टीम मॉनिटरिंग व ऑडिट ट्रेल (Production Observability & Audit)",
      subtitle: "Real-time API Latency • Model Drift • Sensor Failures • SHA-256 Verified Immutable Audit Trail",
      refreshBtn: "रिफ्रेश (Live Stream)",
      apiRequests: "API Requests Handled",
      avgConfidence: "Model Avg Confidence",
      activeSensors: "Active Sensor Nodes",
      alertSuccess: "Alert Delivery Success",
      modelTelemetry: "AI मॉडेल कार्यक्षमता (Model Telemetry)",
      gatewayStatus: "गेटवे व अलर्ट वितरण स्थिती",
      auditTrailTitle: "अपरिवर्तनीय ऑडिट ट्रेल (Immutable RBAC Audit Trail)",
      auditSubtitle: "Cryptographically chained SHA-256 logs recording who diagnosed, modified, and confirmed every action."
    }
  },

  hi: {
    appTitle: "महाकिसान रक्षक",
    appSubtitle: "महाराष्ट्र सरकार — फसल रोग एवं कीट पूर्व चेतावनी व एकीकृत प्रबंधन प्रणाली",
    tagline: "सटीक रोग पहचान • मौसम आधारित जोखिम पूर्वानुमान • प्रमाणित कीटनाशक सिफारिशें",

    roles: {
      FARMER: "किसान (Farmer)",
      KRISHI_SEVAK: "कृषि सेवक (Extension)",
      AGRI_EXPERT: "कृषि विशेषज्ञ (Expert)",
      DIAGNOSTIC_LAB: "निदान प्रयोगशाला (Lab)",
      GOVT_ADMIN: "प्रशासक (Govt Admin)"
    },

    // Role Descriptions for Navbar
    roleDescriptions: {
      FARMER: {
        en: 'Crop scan, 7-day risk, CIBRC IPM & dosage calculator',
        mr: 'पीक स्कॅन, ७-दिवसीय धोका अंदाज व IPM शिफारसी',
        hi: 'फसल स्कैन, 7-दिवेशीय जोखिम, CIBRC IPM एवं खुराक कैलकुलेटर'
      },
      KRISHI_SEVAK: {
        en: 'Trap counts, field inspections & local alerts',
        mr: 'सापळा नोंद, शेतकरी पडताळणी व स्थानिक चेतावणी',
        hi: 'ट्रैप गिनती, खेत निरीक्षण एवं स्थानीय चेतावनी'
      },
      AGRI_EXPERT: {
        en: 'Clinical triage queue, BBox diagnosis & lab referral',
        mr: 'उच्च प्राधान्य पडताळणी व लॅब रेफरल',
        hi: 'नैदानिक त्रिक्वी कतार, बीओक्स निदान एवं लैब रेफरल'
      },
      DIAGNOSTIC_LAB: {
        en: 'QR sample intake, microscopy, PCR assays & reports',
        mr: 'QR नमुना तपासणी व पॅथॉलॉजी अहवाल',
        hi: 'QR नमूना संग्रह, माइक्रोस्कोपी, पीसीआर परीक्षण एवं रिपोर्ट'
      },
      GOVT_ADMIN: {
        en: '36-District GIS hotspots, public broadcasts & audit',
        mr: '३६ जिल्हे GIS हॉटस्पॉट व SMS/WhatsApp प्रसारण',
        hi: '36-जिला GIS हॉटस्पॉट, सार्वजनिक प्रसारण एवं लेखा परीक्षण'
      }
    },

    nav: {
      farmerPortal: "🌾 किसान पोर्टल",
      surveillance: "🗺️ महाराष्ट्र GIS हॉटस्पॉट",
      ingestion: "📡 डेटा संकलन व सेंसर्स",
      expertTriage: "🧑🔬 विशेषज्ञ सत्यापन व लैब",
      monitoring: "📊 सिस्टम स्वास्थ्य व ऑडिट"
    },

    profile: {
      title: "किसान एवं खेत का विवरण (Farm & Crop Profile)",
      desc: "यह डेटा रोग पहचान और भविष्य के जोखिम पूर्वानुमान में उपयोग होता है।",
      farmerName: "किसान का नाम",
      contact: "संपर्क नंबर",
      district: "ज़िला",
      taluka: "तहसील / तालुका",
      village: "गाँव",
      farmSize: "खेत का आकार (एकड़)",
      cropName: "मुख्य फसल",
      variety: "किस्म (Variety)",
      sowingDate: "बुवाई की तारीख",
      cropStage: "फसल की अवस्था",
      soilType: "मिट्टी का प्रकार",
      soilDrainage: "जल निकासी",
      irrigation: "सिंचाई प्रकार",
      editBtn: "✏️ खेत विवरण बदलें",
      cancelBtn: "रद्द करें",
      saveBtn: "विवरण सहेजें",
      savedSuccess: "खेत का विवरण सफलतापूर्वक सहेजा गया!"
    },

    diagnosis: {
      title: "१. फसल रोग की तत्काल पहचान (Current AI Diagnosis)",
      desc: "रोगग्रस्त पौधे का फोटो अपलोड करें या कैमरे से लें।",
      uploadTitle: "फसल का फोटो स्कैन करें (Upload Photo)",
      uploadPlaceholder: "फोटो अपलोड करने के लिए क्लिक करें",
      samplePresetsTitle: "नमूना फसल चुनें:",
      scanBtn: "📸 रोग पहचानें (AI Vision Scan)",
      scanning: "विश्लेषण जारी है...",
      detectedDisease: "पहचाना गया रोग / कीट:",
      scientificName: "वैज्ञानिक नाम:",
      confidence: "सटीकता (Confidence):",
      severity: "गंभीरता (Severity):",
      affectedPart: "प्रभावित हिस्सा:",
      symptomsTitle: "दिखने वाले लक्षण:",
      listenVoice: "🔊 हिंदी में सुनें",
      stopVoice: "रोकें"
    },

    risk: {
      title: "२. आगामी ७ दिनों का रोग जोखिम पूर्वानुमान (Future Risk)",
      desc: "मौसम + फसल अवस्था + मिट्टी + फेरोमोन ट्रैप + स्थानीय इतिहास पर आधारित।",
      riskLevel: "जोखिम स्तर:",
      riskScore: "कुल जोखिम सूचकांक:",
      drivingFactors: "जोखिम बढ़ाने वाले कारक:",
      preventiveActions: "निवारक उपाय (Preventive Actions):",
      etlAlert: "⚠️ ट्रैप में कीट संख्या आर्थिक नुकसान सीमा (ETL) पार कर चुकी है!"
    },

    ipm: {
      title: "प्रमाणित एकीकृत कीट प्रबंधन (Authoritative IPM Advisory)",
      subtitle: "केंद्रीय कीटनाशक बोर्ड (CIBRC) एवं कृषि विश्वविद्यालयों द्वारा अनुशंसित",
      cultural: "🌱 कृषि पद्धतियां (Cultural)",
      mechanical: "⚙️ यांत्रिक एवं ट्रैप (Mechanical)",
      biological: "🐛 जैविक उपाय (Biological)",
      chemical: "🧪 रासायनिक छिड़काव (Chemical)",
      tradeName: "दवा का नाम:",
      activeIngredient: "सक्रिय तत्व:",
      pumpDosage: "१५ लीटर पंप के लिए मात्रा:",
      acreDosage: "प्रति एकड़ मात्रा:",
      phi: "प्रतीक्षा अवधि (PHI):",
      toxicityLabel: "विषाक्तता लेबल:",
      safety: "🛡️ छिड़काव सुरक्षा सावधानियां",
      warning: "⚠️ आवश्यक चेतावनी:",
      safetyRules: "सुरक्षा नियम: छिड़काव के बाद सुरक्षित प्रतीक्षा अवधि (PHI) का पालन करें। हमेशा दस्ताने और मास्क पहनें।"
    },

    calc: {
      title: "🧮 सुरक्षित खुराक कैलकुलेटर (Dosage Calculator)",
      farmAcres: "खेत का आकार (एकड़):",
      pumpCapacity: "पंप क्षमता (लीटर):",
      waterPerAcre: "प्रति एकड़ पानी (लीटर):",
      dosePerPump: "प्रति पंप आवश्यक दवा:",
      totalChemical: "कुल आवश्यक दवा:",
      pumpsRequired: "आवश्यक पंप संख्या:",
      phiBadge: "दिन (Pre-Harvest Interval)"
    },

    cases: {
      title: "मामले और फॉलो-अप ट्रैकिंग",
      subtitle: "उपचार का रिकॉर्ड एवं कृषि सेवक सत्यापन",
      caseId: "केस आईडी:",
      status: "स्थिति:",
      logTreatmentBtn: "➕ छिड़काव दवा दर्ज करें",
      treatmentApplied: "किया गया उपचार:",
      moleculePlaceholder: "दवा का नाम (उदा. Emamectin Benzoate 5% SG)",
      dosagePlaceholder: "मात्रा (उदा. 7.5 gm / 15L पंप)",
      saveTreatment: "सहेजें",
      recoveryCheck: "सुधार स्थिति (Recovery Status):",
      expertAdvice: "विशेषज्ञ राय (Expert Advice):"
    },

    surveillance: {
      monitoredDistricts: "निगरानी के अंतर्गत ज़िले",
      criticalDistricts: "अति-गंभीर ज़िले (Critical)",
      activeEtlBreaches: "सक्रिय कीट प्रकोप (ETL Breaches)",
      dispatchedAlerts: "प्रेषित चेतावनियां (Alerts)",
      gridTitle: "महाराष्ट्र राज्य कीट एवं रोग हॉटस्पॉट ग्रिड (GIS Grid)",
      gridSubtitle: "३६ ज़िलों का रियल-टाइम प्रकोप सूचकांक",
      districtDetails: "ज़िला विवरण",
      division: "संभाग / विभाग",
      crop: "मुख्य फसल",
      threat: "सक्रिय खतरा",
      cases: "दर्ज मामले",
      affectedEst: "प्रभावित किसान अनुमान",
      broadcastTitle: "सार्वजनिक चेतावनी प्रसारण (Public Broadcast)",
      targetDistricts: "लक्ष्य ज़िले:",
      messageLabel: "संदेश:",
      broadcastBtn: "📢 किसानों को चेतावनी भेजें"
    },

ingestion: {
      title: "एकीकृत डेटा अंतर्ग्रहण गेटवे (Data Ingestion Gateway)",
      subtitle: "AgroMet Weather APIs • IoT Field Sensors • Pheromone Traps",
      qualityIndex: "डेटा गुणवत्ता सूचकांक",
      weatherTitle: "१. मौसम डेटा अंतर्ग्रहण (Agromet Ingest)",
      trapTitle: "२. कीट ट्रैप डेटा (Trap Counts)",
      sensorTitle: "३. IoT खेत सेंसर मेश (Sensor Mesh)",
      temp: "तापमान (°C):",
      humidity: "आर्द्रता (RH %):",
      rain: "वर्षा २४ घंटे (mm):",
      leafWetness: "पत्तियों की नमी (LWD hrs):",
      sendWeatherBtn: "📥 मौसम डेटा भेजें",
      trapId: "ट्रैप आईडी:",
      targetPest: "लक्ष्य कीट:",
      trapCount: "पाए गए कीट:",
      etlThreshold: "नुकसान सीमा (ETL):",
      ingestTrapBtn: "🪤 ट्रैप डेटा दर्ज करें",
      activeTraps: "सक्रिय ट्रैप सूची:",
      soilMoisture: "मिट्टी की नमी",
      solarRadiation: "सौर विकिरण",
      pests: "पड़ैती कीटक"
    },

    expert: {
      title: "कृषि वैज्ञानिक सत्यापन एवं लैब रेफरल पोर्टल",
      queueTitle: "सत्यापन हेतु लंबित मामले (Triage Queue)",
      deepDiveTitle: "विस्तृत निरीक्षण",
      confirmModifyLabel: "निदान पुष्टि / संशोधन:",
      clinicalNotesLabel: "वैज्ञानिक टिप्पणी एवं सलाह:",
      labCheckLabel: "🧪 प्रयोगशाला परीक्षण हेतु भेजें (QR Lab Slip)",
      approveBtn: "✅ निदान प्रमाणित करें (Approve & Sync)",
      labTrackingTitle: "निदान प्रयोगशाला नमूना ट्रैकिंग",
      labSpecimen: {
        en: 'Leaf Sample (पानाचा नमुना)',
        mr: 'पानाचा नमुना',
        hi: 'पान का नमूना'
      }
    },

    monitoring: {
      title: "सिस्टम मॉनिटरिंग एवं ऑडिट ट्रेल (Production Observability)",
      subtitle: "Real-time API Latency • Model Drift • Sensor Failures • SHA-256 Audit Trail",
      refreshBtn: "रिफ्रेश (Live Stream)",
      apiRequests: "API अनुरोध निष्पादित",
      avgConfidence: "मॉडल औसत सटीकता",
      activeSensors: "सक्रिय सेंसर नोड्स",
      alertSuccess: "अलर्ट वितरण सफलता",
      modelTelemetry: "AI मॉडल प्रदर्शन",
      gatewayStatus: "गेटवे एवं अलर्ट स्थिति",
      auditTrailTitle: "अपरिवर्तनीय ऑडिट ट्रेल (Immutable Audit Trail)",
      auditSubtitle: "SHA-256 क्रिप्टोग्राफिक रूप से सुरक्षित लॉग"
    },

    farmerPortal: {
      title: "महाकिसान रक्षक - किसान सलाह एवं स्कैन",
      subtitle: "तत्काल AI विज़न निदान • 7-दिवसीय महामारी जोखिम • प्रमाणित CIBRC IPM सलाह",
      farmerPassportTitle: "फार्म एवं फसल प्रोफाइल",
      farmerPassportSubtitle: "यह संदर्भ कंप्यूटर विज़न और महामारी जोखिम दोनों मॉडलों को शक्ति देता है।",
      quickStats: "त्वरित टेलीमेट्री संकेतक",
      cropStagePipeline: "5-चरण फिनोलॉजी पाइपलाइन",
      navigationTabs: "नेविगेशन टैब",
      aiDiagnosis: "AI फसल डॉक्टर एवं स्कैन स्टूडियो",
      riskAnalysis: "7-दिवसीय प्रकोप जोखिम",
      myCases: "मेरे मामले एवं खेत दौरे",
      dosageCalculator: "खुराक कैलकुलेटर एवं छिड़काव",
      recoveryEvaluation: "पुनर्प्राप्ति मूल्यांकन (दिन 0-7)",
      scanOrUpload: "कृषि नमूना फोटो लें या अपलोड करें",
      sampleLibrary: "1-क्लिक नमूना लाइब्रेरी",
      sampleImagesLibrary: "सत्यापित परीक्षण फोटो (1-क्लिक):",
      runDiagnosis: "AI तुरंत कीट, कवक, बैक्टीरिया और पोषण की कमी की पहचान करता है।",
      diagnosisResult: "लाइव क्लिनिकल निदान परिणाम",
      confidenceMeter: "AI मिलान विश्वास स्तर",
      trapStatus: "फेरोमोन ट्रैप स्थिति",
      recommendedMeasures: "अनुशंसित नियंत्रण उपाय (CIBRC मानक)",
      biologicalControl: "जैविक / जैव-नियंत्रण",
      culturalControl: "कृषि विधि",
      submitCase: "खेत दौरे एवं विश्वविद्यालयीय समीक्षा हेतु कृषि सेवक को भेजें",
      treatmentLog: "📝 लगाया गया उपचार / छिड़काव लॉग करें",
      followUpEvaluation: "उपचार के बाद पुनर्प्राप्ति सत्यापन (दिन 0 बनाम दिन 7)",
      day0Initial: "दिन 0: प्रारंभिक संक्रमण (छिड़काव से पहले)",
      day7Healing: "दिन 7: उपचार के बाद उपचारित",
      noDiagnosis: "निदान परिणाम और खुराक निर्देश देखने के लिए फोटो अपलोड या चुनें।",
      caseSubmitted: "मामला सफलतापूर्वक सबमिट हुआ!",
      errorLoading: "डेटा लोड करने में त्रुटि",
      cropStage: "फसल अवस्था",
      liveWeather: "लाइव मौसम",
      trapTelemetry: "ट्रैप टेलीमेट्री",
      etlSurge: "ETL वृद्धि",
      rain: "वर्षा:",
      mothsNight: "कीट/रात",
      phenology: "फिनोलॉजी",
      germination: "1. अंकुरण",
      vegetative: "2. वानस्पतिक",
      flowering: "3. पुष्पन",
      bollDevelopment: "4. आंवल विकास (अभी)",
      maturity: "5. परिपक्वता",
    },

    ingestion: {
      title: "एकीकृत डेटा संग्रह एवं सत्यापन गेटवे",
      subtitle: "AgroMet मौसम API • IoT फील्ड सेंसर • फेरोमोन ट्रैप • एंडेमिसिटी रिकॉर्ड",
      qualityIndex: "डेटा गुणवत्ता स्कोर",
      weatherTitle: "1. एग्रोमेट मौसम डेटा संग्रह",
      trapTitle: "2. कीट ट्रैप टेलीमेट्री संग्रह",
      sensorTitle: "3. IoT फील्ड सेंसर नेटवर्क",
      temp: "तापमान (°C):",
      humidity: "सापेक्ष आर्द्रता (%):",
      rain: "24 घंटे की वर्षा (mm):",
      leafWetness: "पत्ती गीली अवधि (घंटे):",
      sendWeatherBtn: "📥 सत्यापित मौसम डेटा संग्रह करें",
      trapId: "ट्रैप ID:",
      targetPest: "लक्षित कीट:",
      trapCount: "पकड़े गए कीट / कीड़े:",
      etlThreshold: "ETL थ्रेशोल्ड:",
      ingestTrapBtn: "🪤 कीट ट्रैप गिनती संग्रह करें",
      activeTraps: "सक्रिय ट्रैप रिकॉर्ड:",
      soilMoisture: "मृदा आर्द्रता",
      canopyTemp: "कैनोपी तापमान",
      solarRadiation: "सौर विकिरण",
      dataValidated: "डेटा मान्य:",
      etlTitle: "ETL थ्रेशोल्ड निगरानी",
      liveTitle: "लाइव माइक्रोक्लाइमेट टेलीमेट्री",
      rangeValidated: "रेंज एवं आउटलायर मान्य",
      telemetry: "फसल कैनोपी IoT टेलीमेट्री",
      traps: "फेरोमोन ट्रैप गिनती (ईटीएल)",
      pests: {
        Ah: "अहमदनगर",
        Ak: "अकोला",
        Au: "औरंगाबाद",
        Bd: "बीड",
        Bh: "भंडारा",
        Bw: "बुलढाणा",
        Ch: "चंद्रपुर",
        Dh: "धुले",
        Gc: "गडचिरोली",
        Go: "गोंदिया",
        Hi: "हिंगोली",
        Jg: "जलगाँव",
        Jn: "जालना",
        Ka: "कलबुर्गी",
        Ko: "कोल्हापुर",
        Lt: "लातूर",
        Ng: "नागपुर",
        Nb: "नांदेड़",
        Nd: "नंदुरबार",
        Nm: "नाशिक",
        Os: "उस्मानाबाद",
        Pa: "पालघर",
        Pm: "परभणी",
        Pu: "पुणे",
        Ra: "रायगढ़",
        Rt: "रत्नागिरी",
        Sa: "सांगली",
        Sn: "सतारा",
        Si: "सिंधुदुर्ग",
        So: "सोलापुर",
        Th: "ठाणे",
        Wr: "वर्धा",
        Wt: "वाशिम",
        Yv: "यवतमाळ"
      }
    }
  },

  en: {
    appTitle: "MahaKisan Rakshak",
    appSubtitle: "Government of Maharashtra — Crop Disease Early Warning, Detection & IPM System",
    tagline: "Instant AI Vision Diagnosis • 7-Day Epidemiological Risk • Authoritative CIBRC IPM Advisory",

    roles: {
      FARMER: "Farmer",
      KRISHI_SEVAK: "Field Extension Worker (Krishi Sevak)",
      AGRI_EXPERT: "Agri Scientist / Expert",
      DIAGNOSTIC_LAB: "Diagnostic Laboratory",
      GOVT_ADMIN: "Government Administrator"
    },

    // Role Descriptions for Navbar
    roleDescriptions: {
      FARMER: {
        en: 'Crop scan, 7-day risk, CIBRC IPM & dosage calculator',
        mr: 'पीक स्कॅन, ७-दिवसीय धोका अंदाज व IPM शिफारसी',
        hi: 'फसल स्कैन, 7-दिवेशीय जोखिम, CIBRC IPM एवं खुराक कैलकुलेटर'
      },
      KRISHI_SEVAK: {
        en: 'Trap counts, field inspections & local alerts',
        mr: 'सापळा नोंद, शेतकरी पडताळणी व स्थानिक चेतावणी',
        hi: 'ट्रैप गिनती, खेत निरीक्षण एवं स्थानीय चेतावनी'
      },
      AGRI_EXPERT: {
        en: 'Clinical triage queue, BBox diagnosis & lab referral',
        mr: 'उच्च प्राधान्य पडताळणी व लॅब रेफरल',
        hi: 'नैदानिक त्रिक्वी कतार, बीओक्स निदान एवं लैब रेफरल'
      },
      DIAGNOSTIC_LAB: {
        en: 'QR sample intake, microscopy, PCR assays & reports',
        mr: 'QR नमुना तपासणी व पॅथॉलॉजी अहवाल',
        hi: 'QR नमूना संग्रह, माइक्रोस्कोपी, पीसीआर परीक्षण एवं रिपोर्ट'
      },
      GOVT_ADMIN: {
        en: '36-District GIS hotspots, public broadcasts & audit',
        mr: '३६ जिल्हे GIS हॉटस्पॉट व SMS/WhatsApp प्रसारण',
        hi: '36-जिला GIS हॉटस्पॉट, सार्वजनिक प्रसारण एवं लेखा परीक्षण'
      }
    },

    nav: {
      farmerPortal: "🌾 Farmer Advisory & Scan",
      surveillance: "🗺️ Maharashtra GIS Hotspots",
      ingestion: "📡 Data Ingestion & Sensors",
      expertTriage: "🧑🔬 Expert Triage & Lab",
      monitoring: "📊 System Health & Audits"
    },

    // Farmer Portal Specific Translations
    farmerPortal: {
      title: "MahaKisan Rakshak - Farmer Advisory & Scan",
      subtitle: "Instant AI Vision Diagnosis • 7-Day Epidemiological Risk • Authoritative CIBRC IPM Advisory",
      farmerPassportTitle: "Farm & Crop Profile",
      farmerPassportSubtitle: "Context powers both Computer Vision priors and Epidemiological Risk models.",
      quickStats: "Quick Telemetry Indicators",
      cropStagePipeline: "5-Stage Phenology Pipeline",
      navigationTabs: "Navigation Tabs",
      aiDiagnosis: "AI Crop Doctor & Scan Studio",
      riskAnalysis: "7-Day Outbreak Risk",
      myCases: "My Cases & Field Visits",
      dosageCalculator: "Dosage Calculator & Spray",
      recoveryEvaluation: "Recovery Evaluation (Day 0-7)",
      scanOrUpload: "Capture or Upload Crop Specimen Photo",
      sampleLibrary: "1-Click Sample Library",
      sampleImagesLibrary: "Verified test photos (1-Click):",
      runDiagnosis: "AI instantly identifies pests, fungi, bacteria, and nutritional deficiencies.",
      diagnosisResult: "Live Clinical Diagnosis Result",
      confidenceMeter: "AI Match Confidence",
      trapStatus: "Pheromone Trap Status",
      recommendedMeasures: "Recommended Control Measures (CIBRC Standard)",
      biologicalControl: "Biological / Organic Control",
      culturalControl: "Cultural Practice",
      submitCase: "Submit to Krishi Sevak for Field Visit & University Review",
      treatmentLog: "📝 Log Applied Treatment / Spray",
      followUpEvaluation: "Post-Treatment Recovery Verification (Day 0 vs Day 7)",
      day0Initial: "Day 0: Initial Infestation (Pre-Spray)",
      day7Healing: "Day 7: Post-Treatment Healing",
      noDiagnosis: "Upload or select a photo to view diagnostic results and dosage instructions.",
      caseSubmitted: "Case submitted successfully!",
      errorLoading: "Error loading data",
      cropStage: "Crop Stage",
      liveWeather: "Live Weather",
      trapTelemetry: "Trap Telemetry",
      etlSurge: "ETL SURGE",
      rain: "Rain:",
      mothsNight: "Moths/Night",
      phenology: "Phenology",
      germination: "1. Germination",
      vegetative: "2. Vegetative",
      flowering: "3. Flowering",
      bollDevelopment: "4. Boll Development (Now)",
      maturity: "5. Maturity",
    },

    profile: {
      title: "Farm & Crop Profile Context",
      desc: "This context directly powers both Computer Vision priors and Epidemiological Risk models.",
      farmerName: "Farmer Name",
      contact: "Contact Number",
      district: "District",
      taluka: "Taluka",
      village: "Village",
      farmSize: "Farm Size (Acres)",
      cropName: "Current Crop",
      variety: "Crop Variety",
      sowingDate: "Sowing Date",
      cropStage: "Growth Stage",
      soilType: "Soil Type",
      soilDrainage: "Soil Drainage",
      irrigation: "Irrigation Type",
      editBtn: "✏️ Edit Farm Context",
      cancelBtn: "Cancel",
      saveBtn: "Save Profile Context",
      savedSuccess: "Farm profile updated successfully!"
    },

    diagnosis: {
      title: "1. Current Symptom AI Diagnosis (Computer Vision)",
      desc: "Instant multi-crop symptom localization, severity assessment, and visual explainability.",
      uploadTitle: "Scan Crop Symptom Photo",
      uploadPlaceholder: "Click to upload crop symptom photo or use camera",
      samplePresetsTitle: "Select Benchmark Sample Case:",
      scanBtn: "📸 Run AI Vision Diagnosis",
      scanning: "MahaCropNet-v3 AI Analyzing...",
      detectedDisease: "Detected Pathogen / Pest:",
      scientificName: "Scientific Name:",
      confidence: "Prediction Confidence:",
      severity: "Severity Level:",
      affectedPart: "Affected Plant Part:",
      symptomsTitle: "Diagnostic Visual Symptoms:",
      listenVoice: "🔊 Listen to Voice Advisory",
      stopVoice: "Stop Audio"
    },

    risk: {
      title: "2. 7-Day Future Epidemiological Risk Forecasting",
      desc: "Pre-symptom risk prediction combining Agromet, Phenology, Soil, Traps, and Endemicity.",
      riskLevel: "Outbreak Risk Level:",
      riskScore: "Composite Risk Index:",
      drivingFactors: "Key Driving Factors:",
      preventiveActions: "Preventive Interventions:",
      etlAlert: "⚠️ Pheromone trap breached Economic Threshold Level (ETL)!"
    },

    ipm: {
      title: "Authoritative IPM Knowledge Base Advisory",
      subtitle: "Directly retrieved from CIBRC & ICAR / MPKV certified database (Zero Hallucination)",
      cultural: "🌱 Cultural Practices",
      mechanical: "⚙️ Mechanical & Trapping",
      biological: "🐛 Biological & Botanicals",
      chemical: "🧪 Certified Chemical Options",
      tradeName: "Formulation:",
      activeIngredient: "Active Molecule:",
      pumpDosage: "Dose per 15L Backpack Pump:",
      acreDosage: "Dose per Acre:",
      phi: "Pre-Harvest Interval (PHI):",
      toxicityLabel: "Toxicity Triangle:",
      safety: "🛡️ Farmer PPE & Safety Checklist",
      warning: "⚠️ Regulatory Caution:",
      safetyRules: "Safety Protocol: Strictly observe the Pre-Harvest Interval (PHI) before picking. Always wear protective PPE kit (gloves, mask, goggles)."
    },

    calc: {
      title: "🧮 Chemical Dilution & Dosage Calculator",
      farmAcres: "Farm Size (Acres):",
      pumpCapacity: "Pump Capacity (Litres):",
      waterPerAcre: "Water Volume per Acre (Litres):",
      dosePerPump: "Dose per Backpack Pump:",
      totalChemical: "Total Quantity Needed:",
      pumpsRequired: "Total Pumps Required:",
      phiBadge: "Days (Pre-Harvest Interval)"
    },

    cases: {
      title: "Case History & Follow-Up Lifecycle",
      subtitle: "Treatment logs and field extension worker verification status",
      caseId: "Case ID:",
      status: "Lifecycle Status:",
      logTreatmentBtn: "➕ Log Applied Treatment",
      treatmentApplied: "Applied Treatment:",
      moleculePlaceholder: "Chemical / Biological Formulation (e.g. Emamectin Benzoate 5% SG)",
      dosagePlaceholder: "Dosage used (e.g. 7.5 gm / 15L pump)",
      saveTreatment: "Save Treatment Log",
      recoveryCheck: "Recovery Monitoring Status:",
      expertAdvice: "Agri Expert Clinical Notes:"
    },

    surveillance: {
      monitoredDistricts: "Monitored Districts",
      criticalDistricts: "Critical Outbreak Zones",
      activeEtlBreaches: "Active Trap ETL Breaches",
      dispatchedAlerts: "Public Alerts Dispatched",
      gridTitle: "Maharashtra Geospatial Hotspot Grid (GIS Surveillance)",
      gridSubtitle: "36 districts real-time outbreak pressure index & pest trap monitoring",
      districtDetails: "District Deep Dive",
      division: "Division",
      crop: "Major Crop",
      threat: "Active Threat",
      cases: "Reported Cases",
      affectedEst: "Estimated Affected Farmers",
      broadcastTitle: "Public Alert Broadcast Dispatcher",
      targetDistricts: "Target Districts:",
      messageLabel: "Advisory Message:",
      broadcastBtn: "📢 Dispatch Public Broadcast (SMS & WhatsApp)"
    },

    ingestion: {
      title: "Unified Data Ingestion & Validation Gateway",
      subtitle: "AgroMet Weather APIs • IoT Field Sensors • Pheromone Traps • Endemicity Records",
      qualityIndex: "Data Quality Score",
      weatherTitle: "1. Agromet Weather Ingestion",
      trapTitle: "2. Pest Trap Telemetry Ingestion",
      sensorTitle: "3. IoT Field Sensor Mesh",
      temp: "Temperature (°C):",
      humidity: "Relative Humidity (%):",
      rain: "24h Rainfall (mm):",
      leafWetness: "Leaf Wetness Duration (hrs):",
      sendWeatherBtn: "📥 Ingest Validated Weather Data",
      trapId: "Trap ID:",
      targetPest: "Target Pest:",
      trapCount: "Moths / Insects Caught:",
      etlThreshold: "ETL Threshold:",
      ingestTrapBtn: "🪤 Ingest Pest Trap Count",
      activeTraps: "Active Trap Records:",
      soilMoisture: "Soil Moisture",
      canopyTemp: "Canopy Temperature",
      solarRadiation: "Solar Radiation"
    },

    expert: {
      title: "Agriculture Scientist Triage & Diagnostic Lab Portal",
      queueTitle: "High-Priority Triage Queue",
      deepDiveTitle: "Case Deep Dive & Pathology Inspector",
      confirmModifyLabel: "Confirm or Modify Pathogen Diagnosis:",
      clinicalNotesLabel: "Scientist Clinical Notes & Prescription:",
      labCheckLabel: "🧪 Refer to Pathology Lab (Generate QR Digital Sample Slip)",
      approveBtn: "✅ Validate Diagnosis & Sync Active Learning",
      labTrackingTitle: "Diagnostic Laboratory Sample Chain of Custody",
      labSpecimen: {
        en: 'Leaf Sample (पानाचा नमुना)',
        mr: 'पानाचा नमुना',
        hi: 'पान का नमूना'
      }
    },

    monitoring: {
      title: "Production System Observability & Audit Trail",
      subtitle: "Real-time API Latency • Model Drift • Sensor Failures • SHA-256 Verified Immutable Audit Trail",
      refreshBtn: "Refresh (Live Stream)",
      apiRequests: "API Requests Handled",
      avgConfidence: "Model Avg Confidence",
      activeSensors: "Active Sensor Nodes",
      alertSuccess: "Alert Delivery Success",
      modelTelemetry: "AI Model Telemetry & Drift",
      gatewayStatus: "Gateway & Dispatcher Health",
      auditTrailTitle: "Immutable RBAC Audit Trail",
      auditSubtitle: "Cryptographically chained SHA-256 logs recording who diagnosed, modified, and confirmed every action."
    }
  }
};

export const makeT = (currentLang) => {
  const obj = translations[currentLang] || translations.en;
  const t = (path) => {
    if (typeof path !== 'string') return undefined;
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  };
  Object.assign(t, obj);
  return t;
};
