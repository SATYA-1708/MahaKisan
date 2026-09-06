import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from app.models.schemas import WeatherData, SensorTelemetry, TrapData, UserRole
from app.core.audit_logger import audit_logger
from app.core.system_monitor import system_monitor

class DataIngestionService:
    """Unified Ingestion & Validation Gateway for Agromet, IoT Sensors, Traps, and Field Reports"""
    
    _weather_cache: Dict[str, WeatherData] = {}
    _sensor_cache: Dict[str, SensorTelemetry] = {}
    _trap_cache: Dict[str, TrapData] = {}
    _historical_endemicity: Dict[str, Dict[str, float]] = {}

    def __init__(self):
        self._seed_default_ingestion_data()

    def _seed_default_ingestion_data(self):
        # Seed 36 Maharashtra Agro-Climatic Stations
        districts_seed = [
            ("Yavatmal", 31.5, 84.0, 18.5, 8.5, 12.0, 75.0),
            ("Wardha", 30.8, 82.0, 12.0, 7.0, 10.5, 60.0),
            ("Amravati", 32.0, 78.0, 8.0, 5.5, 14.0, 45.0),
            ("Nashik", 26.5, 91.0, 32.0, 11.0, 16.0, 85.0),
            ("Ahmednagar", 29.0, 86.0, 22.0, 9.0, 11.0, 70.0),
            ("Pune", 27.2, 88.0, 15.0, 8.0, 13.5, 65.0),
            ("Jalgaon", 33.5, 76.0, 5.0, 4.0, 15.0, 30.0),
            ("Solapur", 32.8, 74.0, 14.0, 6.0, 9.0, 50.0),
            ("Satara", 25.8, 92.0, 28.0, 10.5, 12.0, 80.0),
            ("Kolhapur", 26.0, 94.0, 40.0, 12.0, 14.0, 90.0),
            ("Chhatrapati Sambhajinagar", 30.2, 79.0, 10.0, 6.5, 11.0, 40.0),
            ("Nanded", 31.0, 81.0, 16.0, 7.5, 10.0, 55.0),
            ("Latur", 30.5, 80.0, 14.0, 7.0, 9.5, 50.0),
            ("Buldhana", 31.2, 77.0, 9.0, 5.0, 12.0, 35.0),
            ("Akola", 32.5, 75.0, 6.0, 4.5, 13.0, 30.0),
            ("Nagpur", 31.0, 83.0, 19.0, 8.0, 11.5, 65.0),
            ("Chandrapur", 32.2, 85.0, 24.0, 9.5, 10.5, 75.0),
            ("Bhandara", 30.8, 86.0, 26.0, 9.0, 9.0, 70.0),
            ("Gondia", 30.5, 87.0, 28.0, 9.5, 8.5, 75.0),
            ("Gadchiroli", 31.0, 88.0, 30.0, 10.0, 8.0, 80.0),
            ("Washim", 30.8, 78.0, 11.0, 6.0, 11.0, 45.0),
            ("Hingoli", 31.0, 80.0, 15.0, 7.0, 10.0, 50.0),
            ("Parbhani", 31.5, 79.0, 12.0, 6.5, 10.5, 45.0),
            ("Jalna", 30.4, 78.0, 9.0, 5.5, 11.0, 40.0),
            ("Beed", 30.8, 77.0, 8.0, 5.0, 11.5, 35.0),
            ("Dharashiv", 30.2, 79.0, 11.0, 6.0, 10.0, 45.0),
            ("Sangli", 28.5, 85.0, 18.0, 8.0, 11.0, 60.0),
            ("Ratnagiri", 27.5, 96.0, 55.0, 14.0, 18.0, 95.0),
            ("Sindhudurg", 27.2, 97.0, 60.0, 15.0, 19.0, 95.0),
            ("Raigad", 28.0, 94.0, 45.0, 13.0, 17.0, 90.0),
            ("Thane", 29.0, 92.0, 38.0, 11.5, 15.0, 85.0),
            ("Palghar", 28.8, 93.0, 42.0, 12.0, 16.0, 85.0),
            ("Dhule", 32.8, 74.0, 7.0, 4.5, 13.5, 35.0),
            ("Nandurbar", 32.0, 76.0, 10.0, 5.5, 12.5, 40.0)
        ]

        now_iso = datetime.now().isoformat()
        for d, t, rh, rf, lw, ws, rp in districts_seed:
            self._weather_cache[d] = WeatherData(
                station_id=f"AGROMET-MH-{d.upper()[:3]}",
                district=d,
                temperature_c=t,
                relative_humidity_pct=rh,
                rainfall_mm_24h=rf,
                leaf_wetness_hours=lw,
                wind_speed_kmh=ws,
                forecast_rain_prob_pct=rp,
                timestamp=now_iso
            )

        # Seed Traps
        self._trap_cache["TRP-YVT-08"] = TrapData(
            trap_id="TRP-YVT-08",
            farm_id="farm_101",
            trap_type="Pheromone Trap (Sex Attractant Lure)",
            target_pest="Pink Bollworm",
            count=14,
            etl_threshold=8,
            is_etl_breached=True,
            photo_url="https://images.unsplash.com/photo-1599818434736-2311f6c770c3?auto=format&fit=crop&w=400&q=80",
            date_recorded=now_iso
        )
        self._trap_cache["TRP-NSK-02"] = TrapData(
            trap_id="TRP-NSK-02",
            farm_id="farm_102",
            trap_type="Sticky Yellow Card Trap",
            target_pest="Thrips / Whitefly",
            count=38,
            etl_threshold=30,
            is_etl_breached=True,
            photo_url="https://images.unsplash.com/photo-1599818434736-2311f6c770c3?auto=format&fit=crop&w=400&q=80",
            date_recorded=now_iso
        )

        # Seed IoT Sensors
        self._sensor_cache["IOT-NODE-701"] = SensorTelemetry(
            sensor_id="IOT-NODE-701",
            farm_id="farm_101",
            soil_moisture_pct=34.5,
            canopy_temperature_c=29.2,
            leaf_wetness_duration_hrs=8.2,
            soil_ec=1.1,
            solar_radiation_w_m2=680.0,
            battery_level_pct=92.0,
            status="ACTIVE",
            timestamp=now_iso
        )
        self._sensor_cache["IOT-NODE-702"] = SensorTelemetry(
            sensor_id="IOT-NODE-702",
            farm_id="farm_102",
            soil_moisture_pct=42.0,
            canopy_temperature_c=25.8,
            leaf_wetness_duration_hrs=11.5,
            soil_ec=1.3,
            solar_radiation_w_m2=540.0,
            battery_level_pct=88.0,
            status="ACTIVE",
            timestamp=now_iso
        )

        # Historical Endemicity Matrix (0.0 to 1.0)
        self._historical_endemicity = {
            "Yavatmal": {"cotton_pink_bollworm": 0.85, "soybean_rust": 0.60, "sucking_pests": 0.75},
            "Nashik": {"grapes_downy_mildew": 0.90, "onion_purple_blotch": 0.80, "tomato_late_blight": 0.75},
            "Ahmednagar": {"sugarcane_red_rot": 0.65, "onion_purple_blotch": 0.85, "cotton_pink_bollworm": 0.70},
            "Solapur": {"pomegranate_bacterial_blight": 0.92, "sugarcane_red_rot": 0.60},
            "Kolhapur": {"sugarcane_red_rot": 0.75, "soybean_rust": 0.70},
            "Amravati": {"cotton_pink_bollworm": 0.80, "soybean_rust": 0.65}
        }

    # Ingestion Pipeline: Ingest & Validate Weather
    def ingest_weather(self, data: WeatherData) -> Tuple[bool, str]:
        # Validation checks
        if not (-10.0 <= data.temperature_c <= 55.0):
            return False, f"Invalid temperature: {data.temperature_c}°C outside valid range"
        if not (0.0 <= data.relative_humidity_pct <= 100.0):
            return False, f"Invalid humidity: {data.relative_humidity_pct}% outside 0-100%"
        if data.rainfall_mm_24h < 0.0:
            return False, "Rainfall cannot be negative"
        
        self._weather_cache[data.district] = data
        audit_logger.record(
            user_id="INGESTION_GW",
            user_name="MahaAgromet Ingestion Pipeline",
            user_role=UserRole.GOVT_ADMIN,
            action="WEATHER_DATA_INGESTED",
            entity_type="AGROMET",
            entity_id=data.station_id,
            details={"district": data.district, "temp": data.temperature_c, "rh": data.relative_humidity_pct}
        )
        return True, "Weather data ingested and validated successfully"

    # Ingestion Pipeline: Ingest & Validate Sensor Telemetry
    def ingest_sensor_telemetry(self, telemetry: SensorTelemetry) -> Tuple[bool, str]:
        # Quality check: Anomaly detection
        if not (0.0 <= telemetry.soil_moisture_pct <= 100.0):
            telemetry.status = "ERROR"
            return False, "Soil moisture out of valid percentage bounds"
            
        if telemetry.battery_level_pct < 15.0:
            telemetry.status = "STALE"
            system_monitor.stale_sensors += 1
            
        self._sensor_cache[telemetry.sensor_id] = telemetry
        return True, f"Telemetry validated for sensor {telemetry.sensor_id} (Status: {telemetry.status})"

    # Ingestion Pipeline: Ingest & Validate Trap Data
    def ingest_trap_count(self, trap: TrapData) -> Tuple[bool, str]:
        trap.is_etl_breached = trap.count >= trap.etl_threshold
        self._trap_cache[trap.trap_id] = trap
        
        if trap.is_etl_breached:
            audit_logger.record(
                user_id="TRAP_INGEST",
                user_name="Field Trap Monitor",
                user_role=UserRole.KRISHI_SEVAK,
                action="ETL_THRESHOLD_BREACHED",
                entity_type="TRAP",
                entity_id=trap.trap_id,
                details={"target_pest": trap.target_pest, "count": trap.count, "threshold": trap.etl_threshold}
            )
        return True, f"Trap count {trap.count} recorded (ETL Breached: {trap.is_etl_breached})"

    # Accessors for Intelligence Engines
    def get_district_weather(self, district: str) -> WeatherData:
        if district in self._weather_cache:
            return self._weather_cache[district]
        # Return default Maharashtra baseline
        return WeatherData(
            station_id=f"AGROMET-{district.upper()[:3]}",
            district=district,
            temperature_c=30.0,
            relative_humidity_pct=80.0,
            rainfall_mm_24h=12.0,
            leaf_wetness_hours=7.0,
            wind_speed_kmh=12.0,
            forecast_rain_prob_pct=50.0,
            timestamp=datetime.now().isoformat()
        )

    def get_farm_sensor_data(self, farm_id: str) -> Optional[SensorTelemetry]:
        for s in self._sensor_cache.values():
            if s.farm_id == farm_id:
                return s
        return None

    def get_farm_trap_data(self, farm_id: str) -> List[TrapData]:
        return [t for t in self._trap_cache.values() if t.farm_id == farm_id]

    def get_historical_endemicity(self, district: str, pest_key: str) -> float:
        dist_data = self._historical_endemicity.get(district, {})
        return dist_data.get(pest_key, 0.40) # default 40% endemic baseline

    def get_all_weather(self) -> List[WeatherData]:
        return list(self._weather_cache.values())

    def get_all_sensors(self) -> List[SensorTelemetry]:
        return list(self._sensor_cache.values())

    def get_all_traps(self) -> List[TrapData]:
        return list(self._trap_cache.values())

data_ingestion_service = DataIngestionService()
