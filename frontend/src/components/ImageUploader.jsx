import React, { useRef, useState } from 'react';
import { Camera, Upload, Image as ImageIcon, X, Check, RefreshCw } from 'lucide-react';

export const ImageUploader = ({
  onImageSelected,
  currentImage,
  isScanning,
  currentLang = 'en',
  title,
  subtitle,
  compact = false
}) => {
  const isEn = currentLang === 'en';
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [fileSizeStr, setFileSizeStr] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file) => {
    const previewUrl = URL.createObjectURL(file);
    const sizeKb = (file.size / 1024).toFixed(1);
    const sizeStr = file.size > 1048576 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${sizeKb} KB`;
    
    setSelectedFileName(file.name);
    setFileSizeStr(sizeStr);
    onImageSelected(file, previewUrl);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    setSelectedFileName(null);
    setFileSizeStr(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition cursor-pointer flex flex-col items-center justify-center text-center group ${
          isDragging 
            ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-400' 
            : 'border-slate-300 hover:border-emerald-600 bg-slate-50/60 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-800">
              {title || (isEn ? 'Click to Browse or Drag & Drop Crop Photo' : 'पिकाचा फोटो निवडा किंवा येथे ड्रॅग करा')}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {subtitle || (isEn ? 'Supports JPG, PNG, WEBP from phone camera or gallery' : 'कॅमेरा किंवा गॅलरीतील सर्व फोटो स्वीकारले जातात')}
            </p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{isEn ? '📁 Browse Files' : '📁 फाईल निवडा'}</span>
          </button>

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isEn ? '📸 Camera / Take Photo' : '📸 कॅमेऱ्याने फोटो काढा'}</span>
          </button>
        </div>

        {/* Active Uploaded File Tag */}
        {selectedFileName && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white border border-emerald-300 px-3 py-1 rounded-full text-xs shadow-xs text-emerald-900 font-semibold">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate max-w-[200px]">{selectedFileName}</span>
            <span className="text-[10px] text-slate-400 font-mono">({fileSizeStr})</span>
            <button 
              type="button" 
              onClick={clearSelection} 
              className="text-slate-400 hover:text-rose-600 p-0.5"
              title={isEn ? 'Remove file' : 'फ़ाइल हटाएं'}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
