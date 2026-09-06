import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Trash2,
  FileSearch,
  Zap,
  Info,
  Layers,
  ShieldCheck,
  Cpu,
  CornerDownRight,
  Maximize2,
  Ruler,
  Coins,
  CreditCard,
} from 'lucide-react';
import { PackagedCommodityCategory, ReferenceObjectType } from '../types';
import { STANDARD_PACK_RULES, SAMPLE_PRODUCTS } from '../data/legalMetrologyRules';

export interface CalibrationConfig {
  enabled: boolean;
  referenceObjectType: ReferenceObjectType;
}

interface ScannerSectionProps {
  onAnalyze: (
    images: string[],
    manualCategory: string,
    textContext: string,
    calibrationConfig?: CalibrationConfig
  ) => Promise<void>;
  isLoading: boolean;
  onLoadSample: (sample: any) => void;
}

const COMMODITY_CATEGORIES: PackagedCommodityCategory[] = [
  'Snacks & Confectionery',
  'Biscuits',
  'Baby food / Weaning food',
  'Bread',
  'Butter / Margarine',
  'Cereals & Pulses',
  'Coffee',
  'Tea',
  'Beverage mixes',
  'Edible oils / Vanaspati / Ghee',
  'Milk Powder',
  'Detergent powder',
  'Rice / Flour / Atta / Rawa / Suji',
  'Salt',
  'Toilet / Bath Soap',
  'Laundry Soap',
  'Detergent cakes / bars',
  'Aerated drinks / beverages',
  'Mineral / Drinking water',
  'Cement (bags)',
  'Paint / Varnish (liquid)',
  'General Packaged Commodity',
];

export const ScannerSection: React.FC<ScannerSectionProps> = ({
  onAnalyze,
  isLoading,
  onLoadSample,
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Snacks & Confectionery');
  const [inspectorNotes, setInspectorNotes] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');

  // Calibration Mode state (Rule 9 Reference Object scale)
  const [useCalibration, setUseCalibration] = useState<boolean>(false);
  const [referenceObjectType, setReferenceObjectType] = useState<ReferenceObjectType>('one_rupee_coin');

  // Image Processing state
  const [filterMode, setFilterMode] = useState<'normal' | 'contrast' | 'grayscale' | 'sharpness'>('normal');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setSelectedImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const constraints: MediaStreamConstraints = {
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access camera device. Please grant camera permission.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setSelectedImages((prev) => [...prev, dataUrl]);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRunAudit = () => {
    if (selectedImages.length === 0) {
      alert('Please upload or capture at least one package panel image (Front / MRP / Back).');
      return;
    }
    onAnalyze(selectedImages, activeCategory, inspectorNotes, {
      enabled: useCalibration,
      referenceObjectType,
    });
  };

  const getFilterStyle = () => {
    switch (filterMode) {
      case 'contrast':
        return 'contrast(160%) brightness(95%)';
      case 'grayscale':
        return 'grayscale(100%) contrast(140%)';
      case 'sharpness':
        return 'contrast(130%) saturate(120%) drop-shadow(0 0 1px rgba(0,0,0,0.8))';
      default:
        return 'none';
    }
  };

  return (
    <div className="space-y-6">
      {/* Clean, Welcoming Overview Banner */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 sm:p-6 text-slate-300 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                Legal Metrology Rules, 2011 • Department of Consumer Affairs
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
              Package Compliance Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Upload package photos or choose a benchmark sample below to automatically audit mandatory statutory declarations under Rule 6, MRP sticker compliance under Rule 18, and Schedule II standard metric pack sizes.
            </p>
          </div>

          {/* 3 Step Visual Orientation for New Users */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs font-medium text-slate-400 bg-slate-950/60 border border-slate-800 p-2 sm:p-3 rounded-xl">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 text-slate-300">
              <span className="w-4 h-4 rounded-full bg-sky-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">1</span>
              <span>Upload / Sample</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">&rarr;</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 text-slate-300">
              <span className="w-4 h-4 rounded-full bg-sky-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">2</span>
              <span>Pick Category</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">&rarr;</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 text-sky-400 font-semibold">
              <span className="w-4 h-4 rounded-full bg-sky-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">3</span>
              <span>Run Audit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Test Benchmark Scenarios - Inviting for New Users */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-200">
              Quick Demo Samples
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Click any sample to load real package evidence and test the verification flow:
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_PRODUCTS.map((sample, idx) => (
            <div
              key={sample.id || idx}
              onClick={() => onLoadSample(sample)}
              className="group cursor-pointer bg-slate-950/70 hover:bg-slate-900 border border-slate-800/90 hover:border-sky-500/50 p-4 rounded-xl transition-all flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-bold text-slate-200 group-hover:text-sky-300 line-clamp-1 font-sans">
                    {sample.productName}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${
                      sample.complianceStatus === 'COMPLIANT'
                        ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60'
                        : 'bg-rose-950/70 text-rose-400 border border-rose-800/60'
                    }`}
                  >
                    {sample.complianceStatus === 'COMPLIANT' ? '100% Pass' : 'Violation'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {sample.inspectorRemarks}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <span className="text-slate-500 truncate max-w-[150px]">{sample.category}</span>
                <span className="text-sky-400 group-hover:text-sky-300 flex items-center gap-1 font-medium">
                  Test Sample &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Scanner Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Preprocessing & Image Workspace */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Package Images & Panels
                </h3>
                <p className="text-xs text-slate-400">
                  Upload photos of Front Display, Net Quantity, MRP stamp, or Mfg/Expiry date
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!isCameraActive ? (
                  <button
                    id="scanner-camera-btn"
                    onClick={startCamera}
                    className="flex items-center gap-1.5 bg-white dark:bg-slate-950 hover:bg-[#EFE8DC] dark:hover:bg-slate-800 border border-[#D8CCC0] dark:border-slate-700 text-[#332421] dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    <Camera className="w-4 h-4 text-[#8E562E] dark:text-sky-400 shrink-0" />
                    <span className="font-semibold text-[#332421] dark:text-slate-200">Camera Scan</span>
                  </button>
                ) : (
                  <button
                    id="scanner-stop-camera-btn"
                    onClick={stopCamera}
                    className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    <span>Close Camera</span>
                  </button>
                )}
                <button
                  id="scanner-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photos</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Live Camera Viewport */}
            {isCameraActive && (
              <div className="relative mb-4 bg-slate-950 rounded-xl border border-sky-500/50 overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-72 object-cover"
                />
                {/* Visual Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                  <div className="w-full h-full max-w-md max-h-48 border-2 border-dashed border-sky-400/80 rounded-xl flex flex-col justify-between p-3">
                    <div className="text-[10px] font-mono text-sky-400 bg-black/80 px-2 py-0.5 rounded w-fit">
                      ALIGN MRP / NET QTY / DATE / MFG PANEL
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 bg-black/80 px-2 py-0.5 rounded self-center">
                      Rule 6(1) Principal Display Area
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    onClick={capturePhoto}
                    className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs px-4 py-2 rounded-lg shadow-lg transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Photo</span>
                  </button>
                  <button
                    onClick={() => {
                      setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
                      stopCamera();
                      setTimeout(startCamera, 200);
                    }}
                    className="bg-slate-900 border border-slate-700 text-slate-300 p-2 rounded-lg hover:bg-slate-800 cursor-pointer"
                    title="Flip Camera"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Empty Upload State */}
            {selectedImages.length === 0 && !isCameraActive && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-sky-500/60 rounded-xl bg-slate-950/50 hover:bg-slate-950/80 p-10 text-center cursor-pointer transition-all space-y-3"
              >
                <div className="w-12 h-12 bg-slate-900 border border-slate-800 text-sky-400 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-200">
                  Click to browse photos or drag and drop files here
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Support for multi-panel product packaging photos: Front panel, MRP Stamp, Net Quantity, Mfg Date, and Consumer Care details.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
                  JPG, PNG, WebP supported
                </div>
              </div>
            )}

            {/* Loaded Image Grid with Filters */}
            {selectedImages.length > 0 && (
              <div className="space-y-4">
                {/* Image Preprocessing Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Sliders className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-slate-300">Image Enhancement:</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(['normal', 'contrast', 'grayscale', 'sharpness'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setFilterMode(mode)}
                        className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                          filterMode === mode
                            ? 'bg-sky-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {mode === 'normal' ? 'Normal' : mode === 'contrast' ? 'High Contrast' : mode === 'grayscale' ? 'Grayscale' : 'Edge Sharp'}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBoundingBoxes}
                      onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>OCR Box Overlay</span>
                  </label>
                </div>

                {/* Grid of Images */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {selectedImages.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="relative group rounded-xl border border-slate-800 bg-slate-950 aspect-square overflow-hidden shadow-xs"
                    >
                      <img
                        src={imgUrl}
                        alt={`Panel ${index + 1}`}
                        style={{ filter: getFilterStyle() }}
                        className="w-full h-full object-cover"
                      />

                      {/* Bounding box mock overlay */}
                      {showBoundingBoxes && (
                        <div className="absolute inset-0 pointer-events-none p-2 flex flex-col justify-between">
                          <div className="border border-emerald-400/80 bg-emerald-500/20 text-[9px] font-mono text-emerald-300 px-1.5 py-0.5 rounded w-fit">
                            MRP & Net Qty
                          </div>
                          <div className="border border-sky-400/80 bg-sky-500/20 text-[9px] font-mono text-sky-300 px-1.5 py-0.5 rounded w-fit self-end">
                            Mfg / Packer
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-rose-950/90 border border-rose-800 text-rose-300 p-1.5 rounded-lg hover:bg-rose-900 transition-colors cursor-pointer"
                        title="Delete panel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="absolute bottom-2 left-2 bg-slate-950/95 border-2 border-amber-400 text-amber-200 font-mono font-bold text-xs px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        Panel {index + 1}
                      </div>
                    </div>
                  ))}

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-800 hover:border-sky-500/60 rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer bg-slate-950 aspect-square transition-all"
                  >
                    <Upload className="w-5 h-5 text-sky-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-300">+ Add Panel</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Configuration & Execution */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Audit Parameters
              </h3>
              <p className="text-xs text-slate-400">
                Configure commodity classification and audit notes
              </p>
            </div>

            {/* Prescribed Commodity Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Commodity Classification (Schedule II):
              </label>
              <select
                id="scanner-category-select"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 focus:border-sky-500 focus:outline-none cursor-pointer"
              >
                {COMMODITY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Rule Details Box */}
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Schedule II Standard Pack Sizes:</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {STANDARD_PACK_RULES.find((r) => r.commodity === activeCategory)?.standardSizes ||
                  'General packaged commodity provisions under Chapter II, Rule 6 apply.'}
              </p>
            </div>

            {/* Reference Object Calibration Mode (Rule 9 Scale Verification) */}
            <div
              className={`border rounded-xl p-3.5 space-y-3 transition-all ${
                useCalibration
                  ? 'bg-sky-950/25 border-sky-500/60 shadow-xs ring-1 ring-sky-500/20'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="scanner-calibration-checkbox"
                  checked={useCalibration}
                  onChange={(e) => setUseCalibration(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500/30 cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-sky-400" />
                      Reference Object Calibration Mode
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded">
                      Rule 9 Scale
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Place a standard reference object (1-Rupee coin or standardized ID card) beside the commodity package. Software uses this reference to accurately calculate exact dimensions and font sizes under Legal Metrology Rule 9.
                  </p>
                </div>
              </label>

              {useCalibration && (
                <div className="space-y-2.5 border-t border-slate-800/80 pt-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      Standard Reference Object Placed:
                    </label>
                    <select
                      id="scanner-reference-object-select"
                      value={referenceObjectType}
                      onChange={(e) => setReferenceObjectType(e.target.value as ReferenceObjectType)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:border-sky-500 focus:outline-none cursor-pointer"
                    >
                      <option value="one_rupee_coin">
                        Standard 1-Rupee Coin (Diameter: 21.93 mm • Ferritic Stainless Steel)
                      </option>
                      <option value="standard_id_card">
                        Standardized ID / Debit Card (ISO 7810: 85.60 mm × 53.98 mm)
                      </option>
                      <option value="five_rupee_coin">
                        Standard 5-Rupee Coin (Diameter: 23.00 mm • Nickel-Brass)
                      </option>
                      <option value="two_rupee_coin">
                        Standard 2-Rupee Coin (Diameter: 25.00 mm • Stainless Steel)
                      </option>
                    </select>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-sky-300">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>Calibration Guidance:</span>
                    </div>
                    <p className="leading-relaxed">
                      Keep the reference object flat on the same plane as the statutory declaration text. Any large variance detected in mandatory numeral heights or packaging dimensions will be flagged as a statutory infraction in the report.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Inspector Observations Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Inspector Observations / Evidence Notes (Optional):
              </label>
              <textarea
                id="scanner-inspector-notes"
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                placeholder="E.g. Suspected pasted MRP sticker over original print; Net quantity has prohibited 'approx' term..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Execute Audit Button */}
            <button
              id="scanner-execute-audit-btn"
              onClick={handleRunAudit}
              disabled={isLoading || selectedImages.length === 0}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                isLoading || selectedImages.length === 0
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md active:scale-98'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Compliance...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Compliance Audit</span>
                </>
              )}
            </button>

            {selectedImages.length === 0 && (
              <div className="text-center text-xs text-amber-400">
                Select images or click a sample to start
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
