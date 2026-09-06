import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, Globe, User, ChevronDown, Check, Sparkles, 
  Sprout, MapPin, Radio, Microscope, Activity, FlaskConical, Users, Lock, LogOut
} from 'lucide-react';
import { translations, makeT } from '../services/i18n';

export const Navbar = ({ 
  currentRole, 
  onRoleChange, 
  currentLang, 
  onLangChange, 
  systemMetrics 
}) => {
  const t = makeT(currentLang);
  const isEn = currentLang === 'en';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roleConfigs = [
    { 
      id: 'FARMER', 
      label: t('roles').FARMER, 
      user: isEn ? 'Ramesh Tukaram Patil' : 'रमेश तुकाराम पाटील',
      designation: isEn ? 'Registered Farmer (Yavatmal)' : 'नोंदणीकृत शेतकरी (यवतमाळ)',
      icon: '👨🌾',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: t('roleDescriptions').FARMER.en
    },
    { 
      id: 'KRISHI_SEVAK', 
      label: t('roles').KRISHI_SEVAK, 
      user: isEn ? 'Anil S. Deshmukh' : 'अनिल देशमुख (कृषी सेवक)',
      designation: isEn ? 'Extension Officer (Ward-4, Ralegaon)' : 'क्षेत्रीय विस्तार अधिकारी (राळेगाव)',
      icon: '🧑🌾',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
      description: t('roleDescriptions').KRISHI_SEVAK.en
    },
    { 
      id: 'AGRI_EXPERT', 
      label: t('roles').AGRI_EXPERT, 
      user: isEn ? 'Dr. Sunita Kulkarni' : 'डॉ. सुनिता कुलकर्णी',
      designation: isEn ? 'Principal Entomologist (MPKV Rahuri)' : 'मुख्य कीटकशास्त्रज्ञ (राहुरी कृषी विद्यापीठ)',
      icon: '🧑🔬',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      description: t('roleDescriptions').AGRI_EXPERT.en
    },
    { 
      id: 'DIAGNOSTIC_LAB', 
      label: t('roles').DIAGNOSTIC_LAB, 
      user: isEn ? 'MahaAgri Central Pathology Lab, Pune' : 'पुणे मध्यवर्ती वनस्पती रोगनिदान प्रयोगशाळा',
      designation: isEn ? 'NABL Accredited Facility' : 'NABL प्रमाणित कृषी पॅथॉलॉजी लॅब',
      icon: '🧪',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      description: t('roleDescriptions').DIAGNOSTIC_LAB.en
    },
    { 
      id: 'GOVT_ADMIN', 
      label: t('roles').GOVT_ADMIN, 
      user: isEn ? 'Shri. V. K. Jadhav, IAS' : 'श्री. व्ही. के. जाधव, IAS',
      designation: isEn ? 'Director of Agriculture, Govt of Maharashtra' : 'विभागीय कृषी संचालक, महाराष्ट्र शासन',
      icon: '🏛️',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      description: t('roleDescriptions').GOVT_ADMIN.en
    },
  ];

  const currentConfig = roleConfigs.find(r => r.id === currentRole) || roleConfigs[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      {/* 1. TOP OFFICIAL GOVERNMENT HEADER */}
      <div className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-950 text-white px-4 py-2 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded text-[11px] shadow-xs tracking-wide">
              {isEn ? 'GOVT OF MAHARASHTRA' : 'महाराष्ट्र शासन'}
            </span>
            <span className="hidden md:inline font-medium text-emerald-100">
              {isEn ? 'Department of Agriculture • Maharashtra State Innovation Society • SIH PS 26131' : 'कृषी विभाग • महाराष्ट्र राज्य नवोपक्रम संस्था • SIH PS 26131'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* System Status */}
            <div className="flex items-center gap-1.5 bg-black/30 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-200 text-[11px] font-mono">
                {systemMetrics?.system_status || (isEn ? 'HEALTHY' : 'सुदृढ')} ({systemMetrics?.avg_latency_ms || 42}{isEn ? 'ms' : 'मि.से.'})
              </span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/20 text-xs">
              <Globe className="w-3.5 h-3.5 text-emerald-200 mx-1.5" />
              <button 
                onClick={() => onLangChange('mr')}
                className={`px-2 py-0.5 rounded font-semibold transition ${currentLang === 'mr' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-emerald-100 hover:text-white'}`}
              >
                मराठी
              </button>
              <button 
                onClick={() => onLangChange('hi')}
                className={`px-2 py-0.5 rounded font-semibold transition ${currentLang === 'hi' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-emerald-100 hover:text-white'}`}
              >
                हिंदी
              </button>
              <button 
                onClick={() => onLangChange('en')}
                className={`px-2 py-0.5 rounded font-semibold transition ${currentLang === 'en' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-emerald-100 hover:text-white'}`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER WITH PROMINENT ROLE DROPDOWN */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  {t.appTitle}
                </h1>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                  v2.4 {isEn ? 'Production' : 'उत्पादन'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* PROMINENT ROLE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>{isEn ? 'Active Role & Permissions:' : 'सक्रिय भूमिका व अधिकार:'}</span>
              <span className="text-emerald-700 font-semibold">{isEn ? 'Strict RBAC Active' : 'RBAC सुरक्षा सक्रिय'}</span>
            </div>

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-80 bg-white hover:bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-sm transition text-left"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="text-2xl p-1 bg-slate-100 rounded-lg">{currentConfig.icon}</span>
                <div className="overflow-hidden">
                  <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                    {currentConfig.label}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-medium">
                    {currentConfig.user}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180 text-emerald-700' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isEn ? 'Select Persona to Access Workspace:' : 'कार्यक्षेत्रात प्रवेश करण्यासाठी भूमिका निवडा:'}
                </div>

                <div className="p-1 space-y-1">
                  {roleConfigs.map(cfg => {
                    const isSelected = currentRole === cfg.id;
                    return (
                      <button
                        key={cfg.id}
                        onClick={() => {
                          onRoleChange(cfg.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left transition flex items-start justify-between gap-2.5 ${
                          isSelected 
                            ? 'bg-emerald-50 border border-emerald-300 shadow-2xs' 
                            : 'hover:bg-slate-100/80 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-2xl mt-0.5">{cfg.icon}</span>
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                              <span>{cfg.label}</span>
                              {isSelected && (
                                <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                                  {isEn ? 'ACTIVE' : 'सक्रिय'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-semibold text-emerald-800">
                              {cfg.user}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                              {cfg.description}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
