import React from 'react';
import { AlertTriangle, CheckCircle, Flame, ShieldAlert } from 'lucide-react';

export const SeverityBadge = ({ severity, lang = 'en' }) => {
  const str = String(severity || '');
  
  if (str.includes('Severe') || str.includes('तीव्र')) {
    const text = lang === 'en' ? 'Severe (>40% leaf area)' : lang === 'hi' ? 'गंभीर (>40%)' : 'तीव्र (Severe >40%)';
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
        <Flame className="w-3.5 h-3.5 text-rose-600" />
        {text}
      </span>
    );
  }
  
  if (str.includes('Moderate') || str.includes('मध्यम')) {
    const text = lang === 'en' ? 'Moderate (15-40% area)' : lang === 'hi' ? 'मध्यम (15-40%)' : 'मध्यम (Moderate 15-40%)';
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        {text}
      </span>
    );
  }

  if (str.includes('Mild') || str.includes('सौम्य')) {
    const text = lang === 'en' ? 'Mild (<15% area)' : lang === 'hi' ? 'हल्का (<15%)' : 'सौम्य (Mild <15%)';
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
        <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
        {text}
      </span>
    );
  }

  const text = lang === 'en' ? 'Healthy / No Infestation' : lang === 'hi' ? 'स्वस्थ फसल' : 'निरोगी / प्रादुर्भाव नाही';
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
      {text}
    </span>
  );
};

export const ToxicityTriangle = ({ label, lang = 'en' }) => {
  const str = String(label || '');
  let color = 'bg-emerald-500';
  let text = lang === 'en' ? 'Green Label (Slightly Toxic)' : 'Green Label (Slightly Toxic / हिरवा त्रिकोण)';
  
  if (str.includes('Red') || str.includes('लाल')) {
    color = 'bg-red-600';
    text = lang === 'en' ? 'Red Label (Extremely Toxic - Caution)' : 'Red Label (Extremely Toxic / लाल त्रिकोण - Caution)';
  } else if (str.includes('Yellow') || str.includes('पिवळा')) {
    color = 'bg-amber-500';
    text = lang === 'en' ? 'Yellow Label (Highly Toxic)' : 'Yellow Label (Highly Toxic / पिवळा त्रिकोण)';
  } else if (str.includes('Blue') || str.includes('निळा')) {
    color = 'bg-blue-600';
    text = lang === 'en' ? 'Blue Label (Moderately Toxic)' : 'Blue Label (Moderately Toxic / निळा त्रिकोण)';
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-3.5 h-3.5 rotate-45 rounded-sm ${color} shadow-sm border border-slate-700/20`}></div>
      <span className="font-medium text-slate-700">{text}</span>
    </div>
  );
};
