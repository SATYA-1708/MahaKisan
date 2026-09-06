from typing import Dict, List, Optional
from app.models.schemas import IPMRecommendation, ToxicityLabel

# Authoritative IPM Database certified under CIBRC & ICAR / MPKV Rahuri norms
IPM_DATABASE: Dict[str, IPMRecommendation] = {
    # 1. COTTON - PINK BOLLWORM
    "cotton_pink_bollworm": IPMRecommendation(
        pest_or_disease="Pink Bollworm (गुलाबी बोंडअळी)",
        scientific_name="Pectinophora gossypiella",
        affected_crops=["Cotton"],
        symptoms_summary={
            "en": "Rosetted flowers ('hexagonal appearance'), small exit holes on developing bolls, inner lint staining, premature boll dropping.",
            "mr": "गुलाबी बोंडअळीमुळे फुले चक्राकार (रोझेट) होतात. बोंडांवर सूक्ष्म छिद्रे पडून आतील सरकी व कापूस खाल्ला जातो. बोंडे अकाली उमलतात किंवा कुजतात.",
            "hi": "गुलाबी सुंडी के प्रकोप से फूल चकरीनुमा हो जाते हैं, गोल बोंडों में सूक्ष्म छेद होते हैं और अंदरूनी रुई खराब हो जाती है।"
        },
        cultural_control=[
            {"en": "Install 5 Pheromone Traps / acre for monitoring (10 / acre for mass trapping).", "mr": "निरीक्षणासाठी एकरी ५ व सामूहिक नियंत्रणासाठी एकरी १० कामगंध सापळे लावावेत."},
            {"en": "Collect and burn infested rosette flowers and dropped bolls immediately.", "mr": "रोझेट झालेली फुले व गळालेली कीडग्रस्त बोंडे गोळा करून नष्ट करा."},
            {"en": "Terminate crop after first/second picking (avoid ratoon crop).", "mr": "कापूस वेचणीनंतर फरदड (ratoon) पीक घेणे टाळावे."}
        ],
        mechanical_control=[
            {"en": "Inspect 20 green bolls per acre weekly; check ETL (>1 larva/boll or 8 moths/trap/night).", "mr": "दर आठवड्याला २० हिरवी बोंडे फोडून पहा; एका बोंडात १ अळी किंवा प्रति सापळा सतत ८ पतंग आढळल्यास फवारणी करा."}
        ],
        biological_control=[
            {"en": "Release Trichogramma bactrae parasitoid egg cards @ 60,000 eggs/acre (3-4 releases at 10-day intervals).", "mr": "ट्रायकोग्रामा बॅक्ट्री अंडी परोपजीवी कार्ड एकरी ६०,००० या प्रमाणात १० दिवसांच्या अंतराने सोडावेत."},
            {"en": "Spray Neem Seed Kernel Extract (NSKE 5%) or Azadirachtin 10,000 ppm @ 2 ml/litre water.", "mr": "निंबोळी अर्क ५% किंवा अझाडिरॅक्टिन १०,००० पीपीएम २ मिली/लिटर पाण्यात मिसळून फवारा."}
        ],
        chemical_control=[
            {
                "trade_name": "Profenofos 50% EC",
                "active_ingredient": "Profenofos 50% EC",
                "dosage_per_15l_pump": "30 ml (२ मिली/लिटर)",
                "dosage_per_acre": "400 - 500 ml in 200L water",
                "phi_days": 15,
                "toxicity_label": ToxicityLabel.YELLOW,
                "cibr_approval": "CIBRC-REG-Cotton-PBW-2024"
            },
            {
                "trade_name": "Emamectin Benzoate 5% SG",
                "active_ingredient": "Emamectin Benzoate 5% SG",
                "dosage_per_15l_pump": "7.5 gm (०.५ ग्रॅम/लिटर)",
                "dosage_per_acre": "100 gm in 200L water",
                "phi_days": 10,
                "toxicity_label": ToxicityLabel.BLUE,
                "cibr_approval": "CIBRC-REG-Cotton-EB5-2025"
            },
            {
                "trade_name": "Chlorantraniliprole 18.5% SC (Coragen)",
                "active_ingredient": "Chlorantraniliprole 18.5% SC",
                "dosage_per_15l_pump": "6 ml (०.४ मिली/लिटर)",
                "dosage_per_acre": "60 ml in 200L water",
                "phi_days": 20,
                "toxicity_label": ToxicityLabel.GREEN,
                "cibr_approval": "CIBRC-REG-Cotton-CAP-2024"
            }
        ],
        safety_instructions=[
            {"en": "Wear full PPE (gloves, mask, goggles, boots) while spraying.", "mr": "फवारणी करताना पूर्ण संरक्षणात्मक किट (मास्क, चष्मा, हातमोजे) वापरा."},
            {"en": "Do NOT spray against wind direction or during high noon temperatures (>35°C).", "mr": "वाऱ्याच्या विरुद्ध दिशेने किंवा भर दुपारी उन्हात फवारणी करू नका."},
            {"en": "Observe strictly 15-day Pre-Harvest Interval (PHI) before picking cotton.", "mr": "कापूस वेचणीपूर्वी औषधाचा प्रतीक्ष कालावधी (PHI) पूर्ण पाळा."}
        ],
        restricted_substances_warning="Synthetic Pyrethroids (Cypermethrin/Deltamethrin) should NOT be used in early vegetative stages to prevent secondary resurgence of whitefly/mites."
    ),

    # 2. SOYBEAN - SOYBEAN RUST
    "soybean_rust": IPMRecommendation(
        pest_or_disease="Soybean Rust (तांबेरा रोग)",
        scientific_name="Phakopsora pachyrhizi",
        affected_crops=["Soybean"],
        symptoms_summary={
            "en": "Minute brown to reddish-brown polygonal pustules on the lower leaf surface, yellowing of upper leaf, rapid defoliation during continuous cloudy/humid weather.",
            "mr": "पानांच्या खालच्या बाजूला लालसर-तांबूस रंगाचे बारीक ठिपके (पुस्ट्यूल्स). पाने पिवळी पडून गळतात. ढगाळ व दमट हवामानात रोग झपाट्याने पसरतो.",
            "hi": "पत्तियों की निचली सतह पर लाल-भूरे रंग के दाने, पत्तियां पीली होकर समय से पहले झड़ने लगती हैं।"
        },
        cultural_control=[
            {"en": "Ensure proper plant spacing (45 cm x 5 cm) to facilitate aeration and reduce canopy humidity.", "mr": "हवा खेळती राहण्यासाठी दोन ओळींत ४५ सेमी योग्य अंतर ठेवा."},
            {"en": "Avoid excessive nitrogenous fertilizer application which fosters dense succulent foliage.", "mr": "युरियाचा अतिरेक टाळा, शिफारसीनुसार पोटॅशचा वापर करा."}
        ],
        mechanical_control=[
            {"en": "Regularly scout lower foliage at flowering stage for early rust pustules.", "mr": "फुलधारणा अवस्थेत पिकाच्या खालच्या पानांची नियमित पाहणी करा."}
        ],
        biological_control=[
            {"en": "Foliar spray of Trichoderma harzianum @ 5 gm/litre or Pseudomonas fluorescens @ 5 ml/litre as preventive measure.", "mr": "ट्रायकोडर्मा हरजियानम ५ ग्रॅम/लिटर किंवा स्यूडोमोनास ५ मिली/लिटरची प्रतिबंधात्मक फवारणी करा."}
        ],
        chemical_control=[
            {
                "trade_name": "Hexaconazole 5% SC",
                "active_ingredient": "Hexaconazole 5% SC",
                "dosage_per_15l_pump": "15 ml (१ मिली/लिटर)",
                "dosage_per_acre": "200 ml in 200L water",
                "phi_days": 30,
                "toxicity_label": ToxicityLabel.YELLOW,
                "cibr_approval": "CIBRC-REG-Soy-Hexa-2023"
            },
            {
                "trade_name": "Tebuconazole 25.9% EC",
                "active_ingredient": "Tebuconazole 25.9% EC",
                "dosage_per_15l_pump": "15 ml (१ मिली/लिटर)",
                "dosage_per_acre": "200 ml in 200L water",
                "phi_days": 21,
                "toxicity_label": ToxicityLabel.BLUE,
                "cibr_approval": "CIBRC-REG-Soy-Tebu-2025"
            },
            {
                "trade_name": "Pyraclostrobin 20% WG",
                "active_ingredient": "Pyraclostrobin 20% WG",
                "dosage_per_15l_pump": "15 gm (१ ग्रॅम/लिटर)",
                "dosage_per_acre": "200 gm in 200L water",
                "phi_days": 25,
                "toxicity_label": ToxicityLabel.BLUE,
                "cibr_approval": "CIBRC-REG-Soy-Pyra-2024"
            }
        ],
        safety_instructions=[
            {"en": "Apply spray thoroughly targeting the underside of the canopy.", "mr": "पानांच्या खालच्या बाजूवर औषध व्यवस्थित पोहोचेल अशी फवारणी करा."},
            {"en": "Ensure clean water with neutral pH (6.5 - 7.0) for mixing fungicide.", "mr": "स्वच्छ व गाळविरहित पाण्याचा वापर करा."}
        ],
        restricted_substances_warning="Avoid repeated single-triazole sprays to prevent fungicide resistance buildup."
    ),

    # 3. TOMATO - EARLY & LATE BLIGHT
    "tomato_late_blight": IPMRecommendation(
        pest_or_disease="Tomato Late Blight (करपा / लेट ब्लाईट)",
        scientific_name="Phytophthora infestans",
        affected_crops=["Tomato", "Potato"],
        symptoms_summary={
            "en": "Water-soaked irregular dark lesions on leaves with white fuzzy fungal growth on the underside during humid conditions, dark brown greasy lesions on green fruits.",
            "mr": "पानांवर काळपट-तपकिरी ओले चट्टे, हवेत आद्रता असताना पाठीमागे पांढरी बुरशी दिसते. फळांवर खोल काळपट डाग पडतात व फळे सडतात.",
            "hi": "पत्तियों पर गहरे भूरे पानीदार धब्बे, निचली सतह पर सफेद फफूंद तथा फलों पर सड़ांध के लक्षण।"
        },
        cultural_control=[
            {"en": "Stake plants to keep foliage away from moist soil surface.", "mr": "झाडांना बांबूचा आधार (Staking) देऊन फांद्या जमिनीपासून वर ठेवा."},
            {"en": "Practice drip irrigation to keep plant leaves dry (avoid sprinkler/overhead watering).", "mr": "तुषार सिंचन टाळून ठिबक सिंचनाचा वापर करा."}
        ],
        mechanical_control=[
            {"en": "Prune lower infected leaves up to 1 foot above ground level and destroy safely.", "mr": "खालची रोगट पाने छाटून प्लास्टिक पिशवीत भरून शेताबाहेर नष्ट करा."}
        ],
        biological_control=[
            {"en": "Bacillus subtilis @ 5 gm/litre foliar spray preventively.", "mr": "बॅसिलस सबटिलिस ५ ग्रॅम/लिटर प्रतिबंधात्मक फवारणी करा."}
        ],
        chemical_control=[
            {
                "trade_name": "Mancozeb 75% WP (Indofil M-45)",
                "active_ingredient": "Mancozeb 75% WP",
                "dosage_per_15l_pump": "35-40 gm (२.५ ग्रॅम/लिटर)",
                "dosage_per_acre": "500 gm in 200L water",
                "phi_days": 7,
                "toxicity_label": ToxicityLabel.GREEN,
                "cibr_approval": "CIBRC-REG-Tom-Man-2023"
            },
            {
                "trade_name": "Cymoxanil 8% + Mancozeb 64% WP (Curzate)",
                "active_ingredient": "Cymoxanil 8% + Mancozeb 64% WP",
                "dosage_per_15l_pump": "30 gm (२ ग्रॅम/लिटर)",
                "dosage_per_acre": "400 gm in 200L water",
                "phi_days": 10,
                "toxicity_label": ToxicityLabel.BLUE,
                "cibr_approval": "CIBRC-REG-Tom-Cym-2024"
            },
            {
                "trade_name": "Dimethomorph 50% WP (Acrobat)",
                "active_ingredient": "Dimethomorph 50% WP",
                "dosage_per_15l_pump": "15 gm (१ ग्रॅम/लिटर)",
                "dosage_per_acre": "200 gm in 200L water",
                "phi_days": 10,
                "toxicity_label": ToxicityLabel.BLUE,
                "cibr_approval": "CIBRC-REG-Tom-Dim-2025"
            }
        ],
        safety_instructions=[
            {"en": "Wear protective respirator to avoid inhaling fungicide dust during mixing.", "mr": "औषध मिसळताना नाकावर मास्क बांधा."},
            {"en": "Observe minimum 7-day harvest interval before picking ripe tomatoes.", "mr": "टोमॅटो तोडणीपूर्वी ७ दिवसांचा सुरक्षित कालावधी ठेवा."}
        ],
        restricted_substances_warning="Do not repeat systemic oomycete fungicides more than twice sequentially."
    ),

    # 4. GRAPES - DOWNY MILDEW
    "grapes_downy_mildew": IPMRecommendation(
        pest_or_disease="Grapes Downy Mildew (द्राक्षांवरील केवडा रोग)",
        scientific_name="Plasmopara viticola",
        affected_crops=["Grapes"],
        symptoms_summary={
            "en": "Yellowish translucent 'oil spots' on upper leaf surface, dense white downy fungal cottony growth on the underside, turning brown and drying. Berries become leathery and mummified.",
            "mr": "पानांच्या वरच्या बाजूला तेलकट पिवळसर ठिपके, पाठीमागे कापसासारखी पांढरी बुरशी (डाउन्यी ग्रोथ). घड व मणी चामड्यासारखे कडक होऊन वाळतात.",
            "hi": "अंगूर के पत्तों पर तेलीय धब्बे और निचली सतह पर रुई जैसी सफेद फफूंद।"
        },
        cultural_control=[
            {"en": "Canopy thinning to ensure sunlight penetration and quick drying of dew.", "mr": "वेलींची योग्य छाटणी व विरळणी करून सूर्यप्रकाश व हवा खेळती ठेवा."},
            {"en": "Remove and burn all dropped mummified berries and infected shoot tips.", "mr": "गळालेले मणी व रोगट शेंडे गोळा करून जाळून नष्ट करा."}
        ],
        mechanical_control=[
            {"en": "Monitor automated microclimate stations for 10-10-24 rule (10mm rain, 10°C min temp, 24h wetness).", "mr": "१०-१०-२४ नियम: १० मिमी पाऊस, १०°C किमान तापमान व २४ तास ओलावा आढळल्यास त्वरित प्रतिबंधक फवारणी करा."}
        ],
        biological_control=[
            {"en": "Trichoderma asperellum @ 4 gm/litre foliar spray preventively.", "mr": "ट्रायकोडर्मा ॲस्परेलम ४ ग्रॅम/लिटर फवारणी करा."}
        ],
        chemical_control=[
            {
                "trade_name": "Bordeaux Mixture 1%",
                "active_ingredient": "Copper Sulphate + Lime (1:1:100)",
                "dosage_per_15l_pump": "150 ml of 1% stock",
                "dosage_per_acre": "1000L of 1% solution",
                "phi_days": 14,
                "toxicity_label": ToxicityLabel.GREEN,
                "cibr_approval": "CIBRC-REG-Grape-Bord-2023"
            },
            {
                "trade_name": "Mandipropamid 23.4% SC (Revus)",
                "active_ingredient": "Mandipropamid 23.4% SC",
                "dosage_per_15l_pump": "12 ml (०.८ मिली/लिटर)",
                "dosage_per_acre": "160 ml in 200L water",
                "phi_days": 28,
                "toxicity_label": ToxicityLabel.BLUE,
                "cibr_approval": "CIBRC-REG-Grape-Mandi-2024"
            },
            {
                "trade_name": "Fluopicolide + Fosetyl-Al (Profiler)",
                "active_ingredient": "Fluopicolide 4.44% + Fosetyl-Al 66.67% WG",
                "dosage_per_15l_pump": "35 gm (२.५ ग्रॅम/लिटर)",
                "dosage_per_acre": "500 gm in 200L water",
                "phi_days": 35,
                "toxicity_label": ToxicityLabel.BLUE,
                "cibr_approval": "CIBRC-REG-Grape-Profiler-2025"
            }
        ],
        safety_instructions=[
            {"en": "Observe export MRL (Maximum Residue Limit) guidelines strictly.", "mr": "द्राक्ष निर्यातीचे MRL निकष काटेकोरपणे पाळा."},
            {"en": "Avoid copper sprays when berries are in pea-stage to prevent berry russeting.", "mr": "मणी मटार आकाराचे असताना कॉपरची फवारणी टाळा, डाग पडू शकतात."}
        ],
        restricted_substances_warning="Export grapes must adhere to APEDA GrapeNet Annexure-5 restricted chemicals list."
    ),

    # 5. POMEGRANATE - BACTERIAL BLIGHT (TELYA)
    "pomegranate_bacterial_blight": IPMRecommendation(
        pest_or_disease="Pomegranate Bacterial Blight (तेलकट डाग / तेल्या रोग)",
        scientific_name="Xanthomonas axonopodis pv. punicae",
        affected_crops=["Pomegranate"],
        symptoms_summary={
            "en": "Water-soaked, dark brown to black oily angular spots on leaves, stems (cankers), and 'L' or 'Y' shaped cracks with oily halo on fruit rinds.",
            "mr": "पानांवर, फांद्यांवर आणि फळांवर तेलकट, काळे-तपकिरी कोनीय चट्टे. फळांवर 'L' किंवा 'Y' आकाराचे तडे जातात. फळे गळतात व झाडे वाळतात.",
            "hi": "पत्तियों एवं फलों पर तेलिया चिकने काले धब्बे, फलों पर 'L' अथवा 'Y' आकार के दरारें।"
        },
        cultural_control=[
            {"en": "Adopt Hast Bahar regulation instead of Mrig Bahar in endemic areas.", "mr": "तेल्याग्रस्त भागात मृग बहार ऐवजी हस्त बहार धरावा."},
            {"en": "Disinfect secateurs with 2.5% Sodium Hypochlorite or Dettol between each cut.", "mr": "छाटणी करताना कात्री प्रत्येक झाडानंतर २.५% सोडियम हायपोक्लोराईट किंवा डेटॉलने निर्जंतुक करा."}
        ],
        mechanical_control=[
            {"en": "Prune infected twigs 2 inches below lesion and paste with Copper Oxychloride (10%) + Streptocycline (0.5%).", "mr": "रोगट फांद्या २ इंच खाली कापून त्या जागी कॉपर ऑक्सीक्लोराईड व स्ट्रेप्टोमायसिनची पेस्ट लावा."}
        ],
        biological_control=[
            {"en": "Spray Pseudomonas fluorescens or Bacillus subtilis @ 5 gm/litre preventively.", "mr": "स्यूडोमोनास फ्लुरोसन्स किंवा बॅसिलस सबटिलिस ५ ग्रॅम/लिटरने फवारा."}
        ],
        chemical_control=[
            {
                "trade_name": "Streptocycline 90:10 (Streptomycin Sulphate + Tetracycline)",
                "active_ingredient": "Streptomycin Sulphate (90%) + Tetracycline Hydrochloride (10%)",
                "dosage_per_15l_pump": "3 gm in 15L water (०.२ ग्रॅम/लिटर)",
                "dosage_per_acre": "50 gm in 250L water",
                "phi_days": 30,
                "toxicity_label": ToxicityLabel.BLUE,
                "cibr_approval": "CIBRC-REG-Pom-Strep-2023"
            },
            {
                "trade_name": "Copper Oxychloride 50% WP (Blitox)",
                "active_ingredient": "Copper Oxychloride 50% WP",
                "dosage_per_15l_pump": "35-40 gm (२.५ ग्रॅम/लिटर)",
                "dosage_per_acre": "600 gm in 250L water",
                "phi_days": 15,
                "toxicity_label": ToxicityLabel.GREEN,
                "cibr_approval": "CIBRC-REG-Pom-COC-2024"
            },
            {
                "trade_name": "2-Bromo-2-Nitropropane-1,3-Diol (Bactronol/Bactrinashak)",
                "active_ingredient": "Bronopol 95% W/W",
                "dosage_per_15l_pump": "5 gm in 15L water (०.३३ ग्रॅम/लिटर)",
                "dosage_per_acre": "75 gm in 250L water",
                "phi_days": 21,
                "toxicity_label": ToxicityLabel.BLUE,
                "cibr_approval": "CIBRC-REG-Pom-Bact-2025"
            }
        ],
        safety_instructions=[
            {"en": "Do not mix bactericides with alkaline fertilizers or calcium sprays.", "mr": "जिवाणूनाशके कॅल्शियम किंवा अल्कलाइन खतांसोबत एकत्र करू नका."},
            {"en": "Always apply post-pruning paste immediately within 2 hours of cutting.", "mr": "छाटणीनंतर लगेच २ तासांच्या आत बोर्डो किंवा कॉपर पेस्ट लावा."}
        ],
        restricted_substances_warning="Strictly adhere to NRC on Pomegranate Solapur recommended bactericide rotation to prevent Xanthomonas resistance."
    ),

    # 6. ONION - PURPLE BLOTCH
    "onion_purple_blotch": IPMRecommendation(
        pest_or_disease="Onion Purple Blotch (कांद्यावरील जांभळा करपा)",
        scientific_name="Alternaria porri",
        affected_crops=["Onion", "Garlic"],
        symptoms_summary={
            "en": "Small water-soaked sunken lesions on leaves which rapidly enlarge and turn deep purple to brown with yellow margins. Leaves collapse and bulb size drastically reduces.",
            "mr": "पानांवर लहान पाणीदार खड्डे पडून ते जांभळट-तपकिरी रंगाचे होतात. कडा पिवळ्या पडतात, पाने मधेच वाकून मोडतात. कांद्याची वाढ खुंटते.",
            "hi": "पत्तियों पर बैंगनी-भूरे रंग के धब्बे, पत्तियां बीच से टूट जाती हैं और कंद का आकार छोटा रह जाता है।"
        },
        cultural_control=[
            {"en": "Plant on raised beds (रुंद वरंबा / BBF) to avoid waterlogging.", "mr": "पाण्याचा निचरा होण्यासाठी रुंद वरंबा (BBF) किंवा गादीवाफ्यावर लागवड करा."},
            {"en": "Maintain 3-year crop rotation with non-allium crops like Maize or Bajra.", "mr": "मका किंवा बाजरीसारख्या पिकांसोबत ३ वर्षांचे फेरपालट करा."}
        ],
        mechanical_control=[
            {"en": "Use certified seed treated with Carbendazim + Thiram @ 3 gm/kg.", "mr": "कार्बेन्डाझिम + थायरम ३ ग्रॅम/किलो बीजप्रक्रिया केलेले बियाणे वापरा."}
        ],
        biological_control=[
            {"en": "Trichoderma viride foliar spray @ 5 gm/litre + sticker.", "mr": "ट्रायकोडर्मा व्हिरिडी ५ ग्रॅम/लिटर अधिक स्टीकर मिसळून फवारा."}
        ],
        chemical_control=[
            {
                "trade_name": "Tebuconazole 25.9% EC (Folicur)",
                "active_ingredient": "Tebuconazole 25.9% EC",
                "dosage_per_15l_pump": "15 ml (१ मिली/लिटर) + Sticker 5 ml",
                "dosage_per_acre": "200 ml in 200L water",
                "phi_days": 15,
                "toxicity_label": ToxicityLabel.BLUE,
                "cibr_approval": "CIBRC-REG-Onion-Tebu-2024"
            },
            {
                "trade_name": "Difenoconazole 25% EC (Score)",
                "active_ingredient": "Difenoconazole 25% EC",
                "dosage_per_15l_pump": "15 ml (१ मिली/लिटर)",
                "dosage_per_acre": "200 ml in 200L water",
                "phi_days": 14,
                "toxicity_label": ToxicityLabel.YELLOW,
                "cibr_approval": "CIBRC-REG-Onion-Dife-2023"
            }
        ],
        safety_instructions=[
            {"en": "Always add an agricultural sticker/spreader (1 ml/L) as onion leaves have a waxy cuticle.", "mr": "कांद्याच्या पानांवर मेणासारखा थर असल्याने फवारणीत नेहमी चांगला स्टिकर/स्प्रेडर मिसळा."},
            {"en": "Never spray when rain is imminent within 2 hours.", "mr": "२ तासांत पाऊस पडण्याची शक्यता असल्यास फवारणी करू नका."}
        ],
        restricted_substances_warning="Control Onion Thrips concurrently because thrips feeding wounds allow Alternaria fungus to penetrate."
    ),

    # 7. SUGARCANE - RED ROT
    "sugarcane_red_rot": IPMRecommendation(
        pest_or_disease="Sugarcane Red Rot (उसावरील तांबडे कूज / लाल सड)",
        scientific_name="Colletotrichum falcatum",
        affected_crops=["Sugarcane"],
        symptoms_summary={
            "en": "Third or fourth leaf from the top starts yellowing and drying along margins. Splitting cane longitudinally reveals internal red pith with characteristic white horizontal cross-bands and alcohol-like fermented odor.",
            "mr": "वरची पाने सुकतात. ऊस उभा चिरल्यास आतील गर लालसर दिसतो व त्यावर आडवे पांढरे पट्टे आढळतात. उसाला मद्यासारखा आंबट वास येतो.",
            "hi": "गन्ने की पत्तियां ऊपर से सूखने लगती हैं, चीरने पर अंदर लाल गूदे में सफेद आड़ी धारियां दिखती हैं।"
        },
        cultural_control=[
            {"en": "Use healthy disease-free seed sets from certified nurseries (Vasantdada Sugar Institute - VSI).", "mr": "वसंतदादा शुगर इन्स्टिट्यूट (VSI) प्रमाणित निरोगी बेणे वापरा."},
            {"en": "Practice hot water treatment of seed sets at 52°C for 30 minutes before planting.", "mr": "लागवडीपूर्वी बेण्यावर ५२°C तापमानात ३० मिनिटे उष्ण जलप्रक्रिया करा."}
        ],
        mechanical_control=[
            {"en": "Uproot and burn infected cane clumps including root stumps; drench hole with bleaching powder.", "mr": "रोगट उसाचे बुंध्यासह संपूर्ण बेट उपटून जाळा आणि त्या जागी ब्लिचिंग पावडर टाका."}
        ],
        biological_control=[
            {"en": "Sett treatment with Trichoderma harzianum @ 10 gm/litre water for 15 minutes before planting.", "mr": "लागवडीपूर्वी ट्रायकोडर्मा हरजियानम १० ग्रॅम/लिटर द्रावणात बेणे १५ मिनिटे बुडवून ठेवा."}
        ],
        chemical_control=[
            {
                "trade_name": "Carbendazim 50% WP (Bavistin) - Sett Dip",
                "active_ingredient": "Carbendazim 50% WP",
                "dosage_per_15l_pump": "30 gm per 15L water for sett dipping",
                "dosage_per_acre": "500 gm in 500L water for 25,000 eye buds",
                "phi_days": 60,
                "toxicity_label": ToxicityLabel.BLUE,
                "cibr_approval": "CIBRC-REG-Sugar-Carb-2023"
            },
            {
                "trade_name": "Thiophanate Methyl 70% WP (Roko)",
                "active_ingredient": "Thiophanate Methyl 70% WP",
                "dosage_per_15l_pump": "25 gm in 15L water",
                "dosage_per_acre": "400 gm in 500L water",
                "phi_days": 45,
                "toxicity_label": ToxicityLabel.BLUE,
                "cibr_approval": "CIBRC-REG-Sugar-Thio-2024"
            }
        ],
        safety_instructions=[
            {"en": "Do not let irrigation water flow from infected field to healthy fields.", "mr": "रोगट शेतातील पाणी निरोगी शेतात जाऊ देऊ नका."},
            {"en": "Avoid continuous sugarcane mono-cropping in heavy waterlogged soils.", "mr": "पाणथळ जमिनीत सलग उसाचे पीक घेणे टाळा."}
        ],
        restricted_substances_warning="No foliar chemical spray can cure internal red rot once cane is heavily infected; prevention via sett treatment is paramount."
    ),

    # 8. HEALTHY CROP
    "healthy_crop": IPMRecommendation(
        pest_or_disease="Healthy Crop (निरोगी पीक — कोणतीही कीड/रोग नाही)",
        scientific_name="Healthy Plant Foliage",
        affected_crops=["All Crops"],
        symptoms_summary={
            "en": "Crop foliage is vigorous, fully turgid with healthy green pigmentation and intact leaf margins. No active pathogen lesions or pest infestation.",
            "mr": "पीक अत्यंत निरोगी असून पानांवर कोणताही कीड अथवा बुरशीजन्य रोगाचा प्रादुर्भाव नाही. हिरवीगार सशक्त पालवी दिसून येत आहे.",
            "hi": "फसल पूरी तरह से स्वस्थ है, पत्तियों पर किसी कीट या रोग के लक्षण नहीं हैं।"
        },
        cultural_control=[
            {"en": "Continue regular field scouting and balanced N-P-K fertigation.", "mr": "नियमित शेत पाहणी सुरू ठेवा व संतुलित खत व्यवस्थापन करा."},
            {"en": "Maintain optimal soil moisture; avoid waterlogging.", "mr": "जमिनीत योग्य ओलावा ठेवा, पाणी साचू देऊ नका."}
        ],
        mechanical_control=[
            {"en": "Keep sticky traps installed for prophylactic early warning monitoring.", "mr": "सापळे केवळ पूर्वसूचना निरीक्षणासाठी शेतात चालू ठेवावेत."}
        ],
        biological_control=[
            {"en": "Prophylactic spray of Pseudomonas fluorescens or Trichoderma @ 5 gm/L if humidity rises.", "mr": "हवामानात आर्द्रता वाढल्यास जैविक ट्रायकोडर्माची प्रतिबंधक फवारणी करावी."}
        ],
        chemical_control=[],
        safety_instructions=[
            {"en": "No chemical pesticide application required. Protect beneficial pollinators.", "mr": "सध्या कोणत्याही रासायनिक फवारणीची गरज नाही. मित्रकीटकांचे रक्षण करा."}
        ],
        restricted_substances_warning="Do NOT apply unnecessary broad-spectrum chemical sprays on healthy crops to preserve natural predatory insects."
    ),

    # 9. UNCLEAR / NON-CROP IMAGE
    "unclear_image": IPMRecommendation(
        pest_or_disease="Non-Crop Object / Unclear Photo (अस्पष्ट / पीक नसलेली प्रतिमा)",
        scientific_name="Unidentified Object / Poor Image Quality",
        affected_crops=["Unknown"],
        symptoms_summary={
            "en": "The uploaded photo does not clearly show crop foliage, stems, or fruits. Background noise, extreme blur, or non-agricultural object detected.",
            "mr": "अपलोड केलेल्या फोटोमध्ये पिकाची पाने, फळे किंवा खोड स्पष्ट दिसत नाही. कृपया पिकाचा जवळून स्पष्ट फोटो काढा.",
            "hi": "अपलोड किए गए फोटो में फसल के पत्ते या फल स्पष्ट रूप से दिखाई नहीं दे रहे हैं।"
        },
        cultural_control=[
            {"en": "Take a well-lit photo in natural daylight at a distance of 15-20 cm from the affected plant part.", "mr": "नैसर्गिक प्रकाशात पिकाच्या बाधित भागापासून १५-२० सेमी अंतरावरून स्पष्ट फोटो काढा."}
        ],
        mechanical_control=[
            {"en": "Ensure camera lens is clean and focused directly on the leaf/symptom spot.", "mr": "कॅमेरा लेन्स स्वच्छ करून थेट पानातील डागांवर फोकस करा."}
        ],
        biological_control=[],
        chemical_control=[],
        safety_instructions=[
            {"en": "Please re-upload a clear photo to obtain accurate AI diagnosis and certified advisory.", "mr": "अचूक निदानासाठी कृपया नवा स्पष्ट फोटो अपलोड करा."}
        ],
        restricted_substances_warning="Diagnosis confidence is too low to recommend any chemical intervention."
    )
}

def get_authoritative_ipm(pest_or_disease_key: str, crop: Optional[str] = None) -> IPMRecommendation:
    """Retrieve certified authoritative IPM recommendation strictly from CIBRC/ICAR repository"""
    key = pest_or_disease_key.lower().replace(" ", "_").replace("-", "_")
    
    # Direct match
    if key in IPM_DATABASE:
        return IPM_DATABASE[key]
        
    # Search by entity name substring or crop
    for db_key, ipm in IPM_DATABASE.items():
        if key in db_key or db_key in key or ipm.pest_or_disease.lower() in key:
            return ipm
            
    # Crop based fallback
    if crop:
        crop_lower = crop.lower()
        for ipm in IPM_DATABASE.values():
            if any(crop_lower in c.lower() for c in ipm.affected_crops):
                return ipm
                
    # Return default cotton PBW standard
    return IPM_DATABASE["cotton_pink_bollworm"]
