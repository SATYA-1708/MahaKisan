import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FarmerPortal } from './pages/FarmerPortal';
import { KrishiSevakPortal } from './pages/KrishiSevakPortal';
import { ExpertTriagePage } from './pages/ExpertTriagePage';
import { DiagnosticLabPortal } from './pages/DiagnosticLabPortal';
import { GovtAdminPortal } from './pages/GovtAdminPortal';
import { api } from './services/api';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  const [currentRole, setCurrentRole] = useState('FARMER');
  const [currentLang, setCurrentLang] = useState('en'); // Default to English as requested
  const [systemMetrics, setSystemMetrics] = useState(null);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      const metrics = await api.getSystemHealth();
      setSystemMetrics(metrics);
    } catch (err) {
      console.warn("Backend poll:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Universal Top Navigation with Prominent Role Dropdown */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        systemMetrics={systemMetrics}
      />

      {/* STRICT ROLE-ISOLATED WORKSPACE (Only Selected Role's Features Render) */}
      <main className="flex-1 pb-16">
        <ErrorBoundary>
          {currentRole === 'FARMER' && (
            <FarmerPortal currentRole="FARMER" currentLang={currentLang} />
          )}

          {currentRole === 'KRISHI_SEVAK' && (
            <KrishiSevakPortal currentLang={currentLang} />
          )}

          {currentRole === 'AGRI_EXPERT' && (
            <ExpertTriagePage currentRole="AGRI_EXPERT" currentLang={currentLang} />
          )}

          {currentRole === 'DIAGNOSTIC_LAB' && (
            <DiagnosticLabPortal currentLang={currentLang} />
          )}

          {currentRole === 'GOVT_ADMIN' && (
            <GovtAdminPortal currentLang={currentLang} />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">
              {currentLang === 'en' ? 'Fasal Rakshak' : 'फसल रक्षक (Fasal Rakshak)'}
            </span>
            <span>• SIH Problem Statement 26131</span>
          </div>
          <div className="text-slate-400">
            Government of Maharashtra • Department of Agriculture • MPKV Rahuri & VNMKV Parbhani Advisory Protocol
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
