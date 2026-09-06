import React, { useState, useEffect } from 'react';
import { 
  Radio, CloudSun, Droplets, Bug, History, 
  CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, Cpu 
} from 'lucide-react';
import { api } from '../services/api';
import { translations } from '../services/i18n';

export const DataIngestionPage = ({ currentRole, currentLang = 'en' }) => {
  const t = translations[currentLang] || translations.en;
  const isEn = currentLang === 'en';

  const [traps, setTraps] = useState([]);
  const [sensors, setSensors] = useState([]);
  
  // Weather ingestion form
  const [wDistrict, setWDistrict] = useState('Yavatmal');
  const [wTemp, setWTemp] = useState(31.5);
  const [wRh, setWRh] = useState(84.0);
  const [wRain, setWRain] = useState(18.5);
  const [wLeafWetness, setWLeafWetness] = useState(8.5);
  const [ingestStatus, setIngestStatus] = useState(null);

  // Trap count form
  const [trapId, setTrapId] = useState('TRP-YVT-09');
  const [trapPest, setTrapPest] = useState('Pink Bollworm');
  const [trapCount, setTrapCount] = useState(12);
  const [trapEtl, setTrapEtl] = useState(8);

  useEffect(() => {
    loadIngestedData();
  }, []);

  const loadIngestedData = async () => {
    try {
      const [tData, sData] = await Promise.all([
        api.getAllTraps(),
        api.getAllSensors()
      ]);
      setTraps(tData);
      setSensors(sData);
    } catch (err) {
      console.error("Ingestion load error:", err);
    }
  };

  const handleIngestWeather = async (e) => {
    e.preventDefault();
    try {
      const res = await api.ingestWeather({
        station_id: `AGROMET-MH-${wDistrict.toUpperCase().slice(0,3)}`,
        district: wDistrict,
        temperature_c: parseFloat(wTemp),
        relative_humidity_pct: parseFloat(wRh),
        rainfall_mm_24h: parseFloat(wRain),
        leaf_wetness_hours: parseFloat(wLeafWetness),
        wind_speed_kmh: 12.0,
        forecast_rain_prob_pct: 75.0,
        timestamp: new Date().toISOString()
      });
      setIngestStatus(res.message);
      setTimeout(() => setIngestStatus(null), 4000);
    } catch (err) {
      console.error("Weather ingest error:", err);
    }
  };

  const handleIngestTrap = async (e) => {
    e.preventDefault();
    try {
      const res = await api.ingestTrap({
        trap_id: trapId,
        farm_id: 'farm_101',
        trap_type: 'Pheromone Trap (Sex Lure)',
        target_pest: trapPest,
        count: parseInt(trapCount),
        etl_threshold: parseInt(trapEtl),
        is_etl_breached: parseInt(trapCount) >= parseInt(trapEtl),
        date_recorded: new Date().toISOString()
      });
      alert(isEn ? `✅ ${trapPest} trap count (${trapCount}) ingested successfully! ETL Breached: ${parseInt(trapCount) >= parseInt(trapEtl)}` : `✅ ${res.message}`);
      loadIngestedData();
    } catch (err) {
      console.error("Trap ingest error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* 1. DATA INGESTION GATEWAY OVERVIEW */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white p-6 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg sm:text-xl">
                {t.ingestion.title}
              </h2>
              <p className="text-xs text-teal-200">
                {t.ingestion.subtitle}
              </p>
            </div>
          </div>

<div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-slate-300 block text-[10px]">{t.ingestion.qualityIndex}</span>
                <span className="font-mono font-bold text-white text-sm">{t.ingestion.dataValidated} 99.4%</span>
              </div>
            </div>
        </div>
      </div>

      {/* 2. THREE INGESTION PIPELINES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline 1: Agromet Weather Feeds */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CloudSun className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t.ingestion.weatherTitle}</h3>
              <p className="text-[11px] text-slate-500">{isEn ? 'Range & Outlier Validated' : 'रेंज आणि आउटलायर सत्यापित'}</p>
            </div>
          </div>

          <form onSubmit={handleIngestWeather} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">{t.profile.district}:</label>
              <select
                value={wDistrict}
                onChange={(e) => setWDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                <option value="Yavatmal">Yavatmal</option>
                <option value="Nashik">Nashik</option>
                <option value="Ahmednagar">Ahmednagar</option>
                <option value="Solapur">Solapur</option>
                <option value="Wardha">Wardha</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t.ingestion.temp}</label>
                <input
                  type="number"
                  step="0.5"
                  value={wTemp}
                  onChange={(e) => setWTemp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t.ingestion.humidity}</label>
                <input
                  type="number"
                  step="1"
                  value={wRh}
                  onChange={(e) => setWRh(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t.ingestion.rain}</label>
                <input
                  type="number"
                  step="0.5"
                  value={wRain}
                  onChange={(e) => setWRain(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t.ingestion.leafWetness}</label>
                <input
                  type="number"
                  step="0.5"
                  value={wLeafWetness}
                  onChange={(e) => setWLeafWetness(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                />
              </div>
            </div>

            {ingestStatus && (
              <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{ingestStatus}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-xl shadow-sm transition"
            >
              {t.ingestion.sendWeatherBtn}
            </button>
          </form>
        </div>

        {/* Pipeline 2: Pheromone & Sticky Traps */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bug className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t.ingestion.trapTitle}</h3>
              <p className="text-[11px] text-slate-500">{isEn ? 'ETL Threshold Monitoring' : 'ETL थ्रेशहोल्ड मॉनिटरिंग'}</p>
            </div>
          </div>

          <form onSubmit={handleIngestTrap} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">{t.ingestion.trapId}</label>
              <input
                type="text"
                value={trapId}
                onChange={(e) => setTrapId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">{t.ingestion.targetPest}</label>
              <select
                value={trapPest}
                onChange={(e) => setTrapPest(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                <option value="Pink Bollworm">{isEn ? 'Pink Bollworm' : 'Pink Bollworm (गुलाबी बोंडअळी)'}</option>
                <option value="Fall Armyworm">{isEn ? 'Fall Armyworm' : 'Fall Armyworm (लष्करी अळी)'}</option>
                <option value="Thrips / Whitefly">{isEn ? 'Thrips / Whitefly' : 'Thrips / Whitefly (रसशोषक किडी)'}</option>
                <option value="Helicoverpa">{isEn ? 'Helicoverpa armigera' : 'Helicoverpa armigera (घाटे अळी)'}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t.ingestion.trapCount}</label>
                <input
                  type="number"
                  value={trapCount}
                  onChange={(e) => setTrapCount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-rose-600"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t.ingestion.etlThreshold}</label>
                <input
                  type="number"
                  value={trapEtl}
                  onChange={(e) => setTrapEtl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl shadow-sm transition"
            >
              {t.ingestion.ingestTrapBtn}
            </button>
          </form>

          {/* Active Ingested Traps Feed */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block">{t.ingestion.activeTraps}</span>
            {traps.slice(0, 2).map(item => (
              <div key={item.trap_id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-slate-800">{item.trap_id}</span>
                  <span className="text-slate-500 block text-[10px]">{item.target_pest}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-rose-600 text-sm">{item.count} {t.ingestion.pests}</span>
                  <span className="text-[10px] text-slate-400 block">ETL: {item.etl_threshold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline 3: IoT Sensor Mesh */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t.ingestion.sensorTitle}</h3>
              <p className="text-[11px] text-slate-500">{isEn ? 'Live Microclimate Telemetry' : 'लाइव्ह मायक्रोक्लायमेट टेलिमेट्री'}</p>
            </div>
          </div>

          <div className="space-y-3">
            {sensors.map(s => (
              <div key={s.sensor_id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-800">{s.sensor_id}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ● {s.status} (Battery: {s.battery_level_pct}%)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">{t.ingestion.soilMoisture}</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{s.soil_moisture_pct}%</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">{t.ingestion.canopyTemp}</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{s.canopy_temperature_c}°C</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">{t.ingestion.leafWetness}</span>
                    <span className="font-mono font-bold text-amber-700 text-sm">{s.leaf_wetness_duration_hrs} hrs</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">{t.ingestion.solarRadiation}</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{s.solar_radiation_w_m2} W/m²</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
