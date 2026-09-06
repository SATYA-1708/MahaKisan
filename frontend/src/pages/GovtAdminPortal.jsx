import React, { useState } from 'react';
import { MapPin, Activity, Radio, ShieldCheck, Lock } from 'lucide-react';
import { SurveillanceDashboard } from './SurveillanceDashboard';
import { SystemObservabilityPage } from './SystemObservabilityPage';
import { translations } from '../services/i18n';

export const GovtAdminPortal = ({ currentLang = 'en' }) => {
  const isEn = currentLang === 'en';
  const [activeAdminSubTab, setActiveAdminSubTab] = useState('surveillance');

  return (
    <div className="space-y-4">
      {/* Admin Sub-navigation */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl text-lg font-bold">
              🏛️
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
                {isEn ? 'Maharashtra Department of Agriculture — Command & Surveillance' : 'महाराष्ट्र शासन कृषी विभाग — नियंत्रण व निगराणी कक्ष'}
              </h2>
              <span className="text-xs text-slate-500">
                {isEn ? 'Shri. V. K. Jadhav, IAS • State Command Clearance' : 'श्री. व्ही. के. जाधव, IAS • राज्यस्तरीय प्रशासकीय अधिकार'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveAdminSubTab('surveillance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeAdminSubTab === 'surveillance'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isEn ? 'GIS Hotspots & Broadcast' : 'GIS हॉटस्पॉट व चेतावणी'}</span>
            </button>

            <button
              onClick={() => setActiveAdminSubTab('monitoring')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeAdminSubTab === 'monitoring'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isEn ? 'System Telemetry & Audit' : 'सिस्टीम मॉनिटरिंग व ऑडिट'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      {activeAdminSubTab === 'surveillance' ? (
        <SurveillanceDashboard currentRole="GOVT_ADMIN" currentLang={currentLang} />
      ) : (
        <SystemObservabilityPage currentRole="GOVT_ADMIN" currentLang={currentLang} />
      )}
    </div>
  );
};
