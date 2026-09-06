import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, Image as ImageIcon, X, Check, RefreshCw, ZoomIn, Eye } from 'lucide-react';

export const ImageUploader = ({
  onImageSelected,
  currentImage,
  isScanning = false,
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
  const [previewSrc, setPreviewSrc] = useState(currentImage || null);

  useEffect(() => {
    if (currentImage) {
      setPreviewSrc(currentImage);
    }
  }, [currentImage]);

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
    setPreviewSrc(previewUrl);
    if (onImageSelected) {
      onImageSelected(file, previewUrl);
    }
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
    if (e) e.stopPropagation();
    setSelectedFileName(null);
    setFileSizeStr(null);
    setPreviewSrc(null);
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

      {/* When an image preview exists */}
      {previewSrc ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/80 bg-slate-950 shadow-md group">
          {/* Main Preview Image */}
          <div className="relative h-64 sm:h-72 w-full overflow-hidden flex items-center justify-center bg-slate-900">
            <img
              src={previewSrc}
              alt="Uploaded specimen preview"
              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            />

            {/* Scanning Laser Line Effect when isScanning */}
            {isScanning && (
              <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 animate-pulse shadow-[0_0_15px_#10b981]" />
                <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin shadow-lg" />
                <span className="text-white font-extrabold text-xs px-3 py-1 bg-black/80 rounded-full border border-emerald-500/50 shadow-sm animate-pulse">
                  {isEn ? 'AI Deep Vision Scanning...' : 'AI न्यूरल स्कॅन सुरू आहे...'}
                </span>
              </div>
            )}

            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="inline-flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/40 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{selectedFileName ? (isEn ? 'Uploaded Photo' : 'अपलोड केलेला फोटो') : (isEn ? 'Active Specimen' : 'सक्रिय नमुना')}</span>
              </div>

              {selectedFileName && (
                <span className="bg-slate-900/85 backdrop-blur-md text-slate-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-slate-700">
                  {fileSizeStr}
                </span>
              )}
            </div>

            {/* Bottom Actions Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs backdrop-blur-md border border-slate-700 shadow-md transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isEn ? 'Change Photo' : 'फोटो बदला'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-white font-bold text-xs backdrop-blur-md border border-amber-500 shadow-md transition flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Camera' : 'कॅमेरा'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={clearSelection}
                className="p-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-white backdrop-blur-md border border-rose-700 shadow-md transition"
                title={isEn ? 'Remove image' : 'फोटो काढा'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag & Drop Upload Zone when no image is selected */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 transition cursor-pointer flex flex-col items-center justify-center text-center group ${
            isDragging 
              ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-400' 
              : 'border-slate-300 hover:border-emerald-600 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition mb-3">
            <Upload className="w-7 h-7" />
          </div>

          <div className="space-y-1 mb-4">
            <p className="text-sm font-extrabold text-slate-800">
              {title || (isEn ? 'Click to Browse or Drag & Drop Crop Photo' : 'पिकाचा फोटो निवडा किंवा येथे ड्रॅग करा')}
            </p>
            <p className="text-xs text-slate-500">
              {subtitle || (isEn ? 'Upload clear photo of leaf, boll, stem or fruit from gallery or camera' : 'गॅलरी किंवा कॅमेऱ्यातून पान, बोंड, खोड किंवा फळाचा स्पष्ट फोटो अपलोड करा')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{isEn ? '📁 Browse Gallery' : '📁 गॅलरीतून निवडा'}</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>{isEn ? '📸 Open Camera' : '📸 कॅमेरा उघडा'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
