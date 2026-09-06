from datetime import datetime, date, timedelta
from typing import Optional, Dict, Any, List
from app.models.schemas import (
    FutureRiskForecast, DailyRiskForecast, RiskLevel, FarmProfile, CropStage, SoilType
)
from app.services.data_ingestion import data_ingestion_service

class FutureRiskEngine:
    """Explicit Epidemiological Risk Forecasting Engine based on Agromet, Soil, Crop Stage, Traps, and History"""

    def forecast_crop_risk(
        self,
        district: str,
        crop_name: str = "Cotton",
        profile: Optional[FarmProfile] = None
    ) -> FutureRiskForecast:
        # 1. Fetch ingested validated inputs
        weather = data_ingestion_service.get_district_weather(district)
        farm_id = profile.id if profile else "farm_default"
        sensor_data = data_ingestion_service.get_farm_sensor_data(farm_id)
        traps = data_ingestion_service.get_farm_trap_data(farm_id)

        # 2. Extract context parameters
        crop_lower = crop_name.lower()
        pest_threat = "Pink Bollworm & Sucking Pests"
        pest_key = "cotton_pink_bollworm"

        if "soybean" in crop_lower:
            pest_threat = "Soybean Rust (तांबेरा) & Girdle Beetle"
            pest_key = "soybean_rust"
        elif "tomato" in crop_lower:
            pest_threat = "Tomato Late Blight & Pinworm (Tuta)"
            pest_key = "tomato_late_blight"
        elif "grapes" in crop_lower:
            pest_threat = "Downy Mildew & Powdery Mildew"
            pest_key = "grapes_downy_mildew"
        elif "pomegranate" in crop_lower:
            pest_threat = "Bacterial Blight (Telya) & Fruit Borer"
            pest_key = "pomegranate_bacterial_blight"
        elif "onion" in crop_lower:
            pest_threat = "Purple Blotch & Thrips"
            pest_key = "onion_purple_blotch"
        elif "sugarcane" in crop_lower:
            pest_threat = "Early Shoot Borer & Red Rot"
            pest_key = "sugarcane_red_rot"

        # 3. Factor 1: Agromet Biophysical Index (0-35 points)
        rh = weather.relative_humidity_pct
        lw = weather.leaf_wetness_hours
        rf = weather.rainfall_mm_24h
        temp = weather.temperature_c

        agromet_score = 0.0
        # Humidity + Leaf wetness favors spores & insect hatch
        if rh >= 85.0:
            agromet_score += 15.0
        elif rh >= 75.0:
            agromet_score += 10.0
        else:
            agromet_score += 5.0

        if lw >= 8.0:
            agromet_score += 12.0
        elif lw >= 5.0:
            agromet_score += 7.0

        if rf > 15.0 or weather.forecast_rain_prob_pct > 60.0:
            agromet_score += 8.0

        # 4. Factor 2: Crop Stage & Phenology Vulnerability (0-25 points)
        stage_score = 10.0
        stage_desc = "Vegetative Stage"
        if profile and profile.crop_stage:
            stage_str = str(profile.crop_stage)
            if "Flowering" in stage_str or "Pod / Fruit" in stage_str:
                stage_score = 25.0
                stage_desc = "Peak Flowering / Fruit Development (High Susceptibility Window)"
            elif "Maturity" in stage_str:
                stage_score = 15.0
                stage_desc = "Maturity Stage"
            else:
                stage_score = 8.0
                stage_desc = "Early Vegetative Stage"

        # 5. Factor 3: Soil Condition & Drainage Vulnerability (0-15 points)
        soil_score = 5.0
        soil_desc = "Medium Drainage"
        if profile and profile.soil_type:
            soil_str = str(profile.soil_type)
            if "Black Cotton" in soil_str and profile.soil_drainage != "Excellent":
                soil_score = 15.0
                soil_desc = "Heavy Black Cotton Soil with high water retention"
            elif "Laterite" in soil_str or "Red" in soil_str:
                soil_score = 8.0
                soil_desc = "Red / Laterite well-drained soil"

        # 6. Factor 4: Field Trap & IoT Sensor Telemetry (0-15 points)
        trap_score = 0.0
        etl_breached = False
        trap_reason = "Traps below threshold"
        if traps:
            for t in traps:
                if t.is_etl_breached:
                    trap_score = 15.0
                    etl_breached = True
                    trap_reason = f"Trap {t.trap_id} breached ETL ({t.count} pests/night > threshold {t.etl_threshold})"
                    break
        elif sensor_data and sensor_data.leaf_wetness_duration_hrs > 9.0:
            trap_score = 10.0
            trap_reason = f"IoT Sensor {sensor_data.sensor_id} reports prolonged canopy wetness ({sensor_data.leaf_wetness_duration_hrs} hrs)"

        # 7. Factor 5: Historical Endemicity (0-10 points)
        endemic_val = data_ingestion_service.get_historical_endemicity(district, pest_key)
        endemic_score = endemic_val * 10.0

        # Calculate Total Composite Risk Score (0-100%)
        total_risk_pct = round(agromet_score + stage_score + soil_score + trap_score + endemic_score, 1)
        total_risk_pct = min(100.0, max(10.0, total_risk_pct))

        # Risk Classification
        if total_risk_pct >= 80.0 or etl_breached:
            risk_level = RiskLevel.CRITICAL
        elif total_risk_pct >= 65.0:
            risk_level = RiskLevel.HIGH
        elif total_risk_pct >= 45.0:
            risk_level = RiskLevel.MODERATE
        elif total_risk_pct >= 30.0:
            risk_level = RiskLevel.GUARDED
        else:
            risk_level = RiskLevel.LOW

        # Driving factors explanation
        driving_factors = [
            f"Agromet Micro-climate: RH {rh}%, Leaf Wetness {lw}h, Rain Prob {weather.forecast_rain_prob_pct}% (+{int(agromet_score)}%)",
            f"Phenology: {stage_desc} (+{int(stage_score)}%)",
            f"Soil Vector: {soil_desc} (+{int(soil_score)}%)",
            f"Surveillance Feeds: {trap_reason} (+{int(trap_score)}%)",
            f"District Endemic Baseline: {district} Historical Pressure Index {round(endemic_val*100)}% (+{int(endemic_score)}%)"
        ]

        # Preventive Action Checklist
        preventive_actions = [
            {
                "en": "Install 5 Pheromone Traps / sticky sheets per acre to track pest emergence early.",
                "mr": "प्रादुर्भाव रोखण्यासाठी एकरी ५ कामगंध किंवा पिवळे चिकट सापळे शेतात लावा."
            },
            {
                "en": "Spray preventive Neem Oil / NSKE 5% (5 ml/L) within next 48-72 hours before rain.",
                "mr": "पाऊस पडण्यापूर्वी पुढील ४८ ते ७२ तासांत ५% निंबोळी अर्काची प्रतिबंधात्मक फवारणी करा."
            },
            {
                "en": "Ensure field drainage channels are cleared to prevent root-zone water stagnation.",
                "mr": "शेतातील पाण्याचा निचरा व्यवस्थित होईल याची खात्री करा."
            }
        ]

        # 8. Build 7-Day Daily Farm Weather & Disease Surge Forecast
        # Progressive drying/warming weather window; risk decays as spore windows close.
        daily_forecast = []
        today = date.today()
        advice_pool = {
            RiskLevel.CRITICAL.value: [
                "Avoid spray in rain; scout traps twice daily",
                "Emergency spray Emamectin / NSKE 5% before rains",
            ],
            RiskLevel.HIGH.value: [
                "Spray NSKE 5% within 48-72 hrs pre-rain",
                "Deepen field drains & clear stagnation",
            ],
            RiskLevel.MODERATE.value: [
                "Apply preventive neem oil at safe window",
                "Increase pheromone trap monitoring",
            ],
            RiskLevel.GUARDED.value: [
                "Routine field walk; strip leaves to monitor",
                "Keep dosages ready for next surge window",
            ],
            RiskLevel.LOW.value: [
                "Monitor recovery & maintain spray diary",
                "Regular irrigation; watch pest egg lay",
            ],
        }
        for d in range(7):
            day_temp = round(temp + d * 0.6, 1)
            day_rh = round(max(40.0, rh - d * 4.5), 1)
            day_rain = round(max(0.0, rf - d * 4.5), 1)
            day_risk = round(min(100.0, max(8.0, total_risk_pct - d * 8.0)), 1)
            if day_risk >= 80.0 or etl_breached:
                day_level = RiskLevel.CRITICAL
            elif day_risk >= 65.0:
                day_level = RiskLevel.HIGH
            elif day_risk >= 45.0:
                day_level = RiskLevel.MODERATE
            elif day_risk >= 30.0:
                day_level = RiskLevel.GUARDED
            else:
                day_level = RiskLevel.LOW
            pool = advice_pool.get(day_level.value, advice_pool[RiskLevel.LOW.value])
            daily_forecast.append(DailyRiskForecast(
                day_index=d + 1,
                date=(today + timedelta(days=d)).strftime("%d %b"),
                temperature_c=day_temp,
                relative_humidity_pct=day_rh,
                rainfall_mm=day_rain,
                risk_level=day_level,
                risk_pct=day_risk,
                agronomy_advice=pool[d % 2],
            ))

        return FutureRiskForecast(
            crop=crop_name,
            district=district,
            risk_level=risk_level,
            risk_score_pct=total_risk_pct,
            primary_threat=pest_threat,
            driving_factors=driving_factors,
            agro_climatic_indices={
                "relative_humidity_pct": rh,
                "leaf_wetness_hours": lw,
                "temperature_c": temp,
                "rainfall_mm": rf,
                "endemicity_index": endemic_val,
                "gdd_accumulated": 420.5,
                "wallin_risk_rating": "MODERATE_HIGH" if lw > 7 else "LOW"
            },
            daily_forecast=daily_forecast,
            forecast_window_days=7,
            preventive_actions=preventive_actions,
            etl_breach_active=etl_breached
        )

future_risk_engine = FutureRiskEngine()
