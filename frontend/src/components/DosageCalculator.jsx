import React, { useState } from 'react';
import { Calculator, Clock, AlertCircle, Droplets, CheckCircle2 } from 'lucide-react';
import { translations } from '../services/i18n';

export const DosageCalculator = ({ currentChemical, currentLang = 'en' }) => {
  const t = translations[currentLang] || translations.en;
  
  const [farmAcres, setFarmAcres] = useState(1.0);
  const [pumpVolumeLiters, setPumpVolumeLiters] = useState(15);
  const [waterPerAcreLiters, setWaterPerAcreLiters] = useState(150);
  const [selectedChemicalIdx, setSelectedChemicalIdx] = useState(0);

  // Determine unit and dose per liter from dosage text
  let dosePerLiter = 2.0;
  let unit = 'ml';
  let selectedChemical = currentChemical?.chemical_control?.[0] || currentChemical;

  if (selectedChemical?.dosage_per_15l_pump) {
    const text = String(selectedChemical.dosage_per_15l_pump);
    if (text.toLowerCase().includes('gm') || text.includes('ग्रॅम')) unit = 'gm';
    
    // Extract numeric dose value more robustly
    const doseMatch = text.match(/[\d.]+/);
    const doseValue = doseMatch ? parseFloat(doseMatch[0]) : null;
    
    if (doseValue !== null) {
      // Map common dosage values for Maharashtra crops
      const dosageMap = {
        0.5: 0.5, 7.5: 0.5, 5: 0.5,
        0.4: 0.4, 6: 0.4,
        1.0: 1.0, 15: 1.0,
        2.5: 2.5, 35: 2.5, 40: 2.5, 30: 2.5,
        2.0: 2.0, 60: 2.0
      };
      dosePerLiter = dosageMap[doseValue] || 2.0;
    }
  }

  const pumpsPerAcre = Math.ceil(waterPerAcreLiters / pumpVolumeLiters);
  const dosePerPump = (dosePerLiter * pumpVolumeLiters).toFixed(1);
  const totalChemicalForFarm = (dosePerLiter * waterPerAcreLiters * farmAcres).toFixed(1);
  const totalWater = (waterPerAcreLiters * farmAcres).toFixed(0);
  const phiDays = selectedChemical?.phi_days || currentChemical?.phi_days || 14;

  const isEn = currentLang === 'en';

  // chemical control options
  const chemicalControlOptions = selectedChemical?.chemical_control 
    ? selectedChemical.chemical_control.map((chem, idx) => ({
        ...chem,
        index: idx
      }))
    : [];

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-emerald-200/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              {t.calc.title}
            </h4>
            <p className="text-xs text-slate-600">
              {selectedChemical?.trade_name || currentChemical?.trade_name || 'Emamectin Benzoate 5% SG'}
            </p>
          </div>
        </div>

        {/* PHI Badge */}
        <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
          <Clock className="w-4 h-4 text-amber-700 animate-spin-slow" />
          <span>PHI: {phiDays} {t.calc.phiBadge}</span>
        </div>
      </div>

      {/* Chemical Selection */}
      {chemicalControlOptions.length > 1 && (
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            {t.calc.selectChemical}
          </label>
          <select
            value={selectedChemicalIdx}
            onChange={(e) => setSelectedChemicalIdx(parseInt(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value={0}>{isEn ? '-- Select Chemical --' : '-- कीटकनाशक निवडा --'}</option>
            {chemicalControlOptions.map((chem, idx) => (
              <option key={idx} value={idx}>
                {chem.trade_name || chem.active_ingredient || (isEn ? `Chemical ${idx + 1}` : `रसायन ${idx + 1}`)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Input controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            {t.calc.farmAcres}
          </label>
          <input 
            type="number" 
            min="0.25" 
            step="0.25" 
            max="100"
            value={farmAcres}
            onChange={(e) => setFarmAcres(parseFloat(e.target.value) || 1)}
            className="w-full font-bold text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          <div className="mt-3 pt-3 border-t border-emerald-200/60">
            <small className="text-[10px] text-slate-500">
              {isEn ? 'Typical range: 0.5-5 acres' : 'आम परास: 0.5-5 एकर'}
            </small>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            {t.calc.pumpCapacity}
          </label>
          <select
            value={pumpVolumeLiters}
            onChange={(e) => setPumpVolumeLiters(parseInt(e.target.value))}
            className="w-full font-bold text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value={15}>{isEn ? '15 Litres (Knapsack Backpack)' : '15 Litres (नॅपसॅक बॅकपॅक)'}</option>
            <option value={16}>{isEn ? '16 Litres (Battery Sprayer)' : '16 Litres (बॅटरी स्प्रेअर)'}</option>
            <option value={20}>{isEn ? '20 Litres (Power Sprayer)' : '20 Litres (पॉवर स्प्रेअर)'}</option>
            <option value={200}>{isEn ? '200 Litres (Tractor Tank)' : '200 Litres (ट्रॅक्टर बॅरल)'}</option>
          </select>
        </div>

        <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            {t.calc.waterPerAcre}
          </label>
          <select
            value={waterPerAcreLiters}
            onChange={(e) => setWaterPerAcreLiters(parseInt(e.target.value))}
            className="w-full font-bold text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value={150}>{isEn ? '150 Litres (Standard Field Crops)' : '150 Litres (सर्वसाधारण पिके)'}</option>
            <option value={200}>{isEn ? '200 Litres (Cotton / Vegetables)' : '200 Litres (कापूस / भाजीपाला)'}</option>
            <option value={300}>{isEn ? '300 Litres (Orchards & Vineyards)' : '300 Litres (द्राक्ष / डाळिंब बागा)'}</option>
          </select>
        </div>
      </div>

      {/* Calculated Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-700 text-white p-3.5 rounded-xl shadow-md">
          <span className="text-[11px] font-medium text-emerald-100 block">
            {t.calc.dosePerPump}
          </span>
          <div className="text-xl font-extrabold mt-1">
            {dosePerPump} {unit}
          </div>
          <span className="text-[10px] text-emerald-200 block mt-0.5">
            ({dosePerLiter} {unit} / {isEn ? 'litre of water' : 'लिटर पाणी'})
          </span>
        </div>

        <div className="bg-teal-700 text-white p-3.5 rounded-xl shadow-md">
          <span className="text-[11px] font-medium text-teal-100 block">
            {t.calc.totalChemical} ({farmAcres} {isEn ? 'Acres' : 'एकर'}):
          </span>
          <div className="text-xl font-extrabold mt-1">
            {totalChemicalForFarm} {unit}
          </div>
          <span className="text-[10px] text-teal-200 block mt-0.5">
            ({isEn ? `mix in ${totalWater}L total water` : `एकूण ${totalWater} लिटर पाण्यात मिसळावे`})
          </span>
        </div>

        <div className="bg-slate-800 text-white p-3.5 rounded-xl shadow-md">
          <span className="text-[11px] font-medium text-slate-300 block">
            {t.calc.pumpsRequired}
          </span>
          <div className="text-xl font-extrabold mt-1">
            {(pumpsPerAcre * farmAcres).toFixed(0)} {isEn ? 'Pumps' : 'पंप'}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            ({isEn ? `${pumpsPerAcre} pumps per acre` : `प्रति एकर ${pumpsPerAcre} पंप`})
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs text-slate-600 bg-white/70 p-2.5 rounded-lg border border-emerald-100">
        <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <span>{t.ipm.safetyRules}</span>
      </div>
    </div>
  );
};