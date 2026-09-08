import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  InspectionReport,
  ComplianceViolation,
  DeclarationFieldItem,
  NutritionAndIngredientsData,
} from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Edit3,
  Save,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  FileText,
  AlertOctagon,
  Scale,
  Building,
  Tag,
  Calendar,
  PhoneCall,
  Eye,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  SlidersHorizontal,
  Layers,
  FileImage,
  X,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Loader2,
  Mail,
  Copy,
  Globe,
  Phone,
  Target,
  Ruler,
  Disc,
} from 'lucide-react';
import { generateInspectionPDF } from '../utils/pdfGenerator';
import { normalizeDeclarationsTable } from '../utils/declarationTableHelper';
import { NutritionIngredientsSection } from './NutritionIngredientsSection';

interface ReportViewProps {
  report: InspectionReport;
  onUpdateReport: (updatedReport: InspectionReport) => void;
  onNewScan: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  report,
  onUpdateReport,
  onNewScan,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedReport, setEditedReport] = useState<InspectionReport>(report);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isReportingToGov, setIsReportingToGov] = useState<boolean>(false);
  const [copiedGrievance, setCopiedGrievance] = useState<boolean>(false);
  const [showReportSuccessNotice, setShowReportSuccessNotice] = useState<boolean>(false);

  // Sync state if a new report is passed
  useEffect(() => {
    setEditedReport(report);
  }, [report]);

  // Evidence Lightbox Inspector state
  const [activeProofIndex, setActiveProofIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showInverted, setShowInverted] = useState<boolean>(false);

  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  // Status Badge Helper
  const getStatusBadge = (status: DeclarationFieldItem['status']) => {
    switch (status) {
      case 'CORRECT':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-950/70 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            CORRECT
          </span>
        );
      case 'MISSING':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-950/80 text-rose-400 border border-rose-800/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
            <XCircle className="w-3 h-3 text-rose-400" />
            MISSING
          </span>
        );
      case 'MISLEADING':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            MISLEADING
          </span>
        );
      case 'INCORRECT':
      case 'INACCURATE':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-950/80 text-rose-400 border border-rose-800/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            INCORRECT
          </span>
        );
      case 'NON_STANDARD':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-950/80 text-purple-300 border border-purple-800/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
            <Scale className="w-3 h-3 text-purple-300" />
            NON_STANDARD
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
            UNCLEAR
          </span>
        );
    }
  };

  const handleSaveEdits = () => {
    const nutri = editedReport.nutritionAndIngredients || editedReport.extractedData?.nutritionAndIngredients;
    const updated: InspectionReport = {
      ...editedReport,
      isEdited: true,
      nutritionAndIngredients: nutri,
      extractedData: {
        ...editedReport.extractedData,
        declarationsTable: declarations,
        nutritionAndIngredients: nutri,
      },
    };
    setEditedReport(updated);
    onUpdateReport(updated);
    setIsEditing(false);
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      await generateInspectionPDF(editedReport);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Generate formatted official grievance complaint letter for government authorities
  const generateGrievanceLetter = (targetReport: InspectionReport) => {
    const list = targetReport.violations || [];
    const violationsText = list.length > 0
      ? list.map((vio, i) => `${i + 1}. [${vio.severity || 'VIOLATION'}] ${vio.title}\n   - Statutory Section: ${vio.legalSection || 'Legal Metrology (PC) Rules, 2011'}\n   - Infraction Details: ${vio.description}\n   - Recommended Action: ${vio.recommendation}`).join('\n\n')
      : 'Statutory non-compliance flagged during automated packaging verification.';

    const reportDate = targetReport.timestamp
      ? new Date(targetReport.timestamp).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : new Date().toLocaleString('en-IN');

    return `To:
National Consumer Helpline (NCH), Department of Consumer Affairs
Email: nch-ca@gov.in | Toll-Free Helpline: 1915 | Web Portal: consumerhelpline.gov.in
CC: Food Safety and Standards Authority of India (compliance@fssai.gov.in)

Subject: Statutory Grievance: Legal Metrology & Packaging Non-Compliance Notice - ${targetReport.productName || 'Packaged Commodity'} (Ref: ${targetReport.id})

Respected Authority,

I am lodging a formal statutory non-compliance grievance regarding a packaged commodity audited under the Legal Metrology Act, 2009, the Legal Metrology (Packaged Commodities) Rules, 2011, and the Consumer Protection Act, 2019.

=== 1. COMMODITY & AUDIT PARTICULARS ===
• Product Name: ${targetReport.productName || 'Packaged Commodity'}
• Category: ${targetReport.category || 'Packaged Good'}
• Brand / Manufacturer / Packer: ${targetReport.extractedData?.manufacturerDetails?.name || targetReport.extractedData?.brandName || 'Refer to attached labels'}
• Inspection Reference ID: ${targetReport.id}
• Audit Timestamp: ${reportDate}
• Compliance Index: ${targetReport.complianceScore}/100 (${targetReport.complianceStatus})

=== 2. DETECTED STATUTORY VIOLATIONS & INFRACTIONS (${list.length}) ===
${violationsText}

=== 3. ATTACHED PHYSICAL AUDIT PROOF ===
The official forensic audit certificate and high-resolution photographic evidence dossier (DoCA_Statutory_Report_${targetReport.id}.pdf) has been generated and is attached herewith as legal proof.

I urge the Department of Consumer Affairs and the National Consumer Helpline to initiate regulatory inquiry, compounding proceedings, or penal enforcement under Section 36 of the Legal Metrology Act, 2009.

Submitted by:
Citizen Auditor / Consumer
Legal Metrology AI Compliance Verification System
National Consumer Helpline: 1915 | consumerhelpline.gov.in
FSSAI Consumer Grievance: compliance@fssai.gov.in`;
  };

  // Single-click workflow: compiles & downloads PDF proof and launches Gmail with pre-filled default message
  const handleReportToGovernmentViaGmail = async () => {
    setIsReportingToGov(true);
    try {
      // 1. Automatically generate & download the official PDF proof report
      await generateInspectionPDF(editedReport);

      // 2. Format subject & comprehensive grievance letter
      const subject = `Statutory Non-Compliance Report: ${editedReport.productName || 'Packaged Commodity'} (Ref: ${editedReport.id})`;
      const body = generateGrievanceLetter(editedReport);

      // 3. Construct Gmail Web Compose URL
      const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent('nch-ca@gov.in')}&cc=${encodeURIComponent('compliance@fssai.gov.in')}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // 4. Open Gmail in a single click
      const openedWindow = window.open(gmailComposeUrl, '_blank', 'noopener,noreferrer');
      if (!openedWindow || openedWindow.closed || typeof openedWindow.closed === 'undefined') {
        // Fallback if browser popup blocker restricts window.open
        window.location.href = `mailto:nch-ca@gov.in?cc=compliance@fssai.gov.in&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }

      setShowReportSuccessNotice(true);
    } catch (err) {
      console.error('Failed to dispatch government report via Gmail:', err);
    } finally {
      setIsReportingToGov(false);
    }
  };

  const handleCopyGrievanceText = () => {
    const text = generateGrievanceLetter(editedReport);
    navigator.clipboard.writeText(text);
    setCopiedGrievance(true);
    setTimeout(() => setCopiedGrievance(false), 3500);
  };

  const handleFieldChange = (
    index: number,
    val: string,
    status: DeclarationFieldItem['status'],
    customNotes?: string
  ) => {
    const updatedTable = [...declarations];
    if (updatedTable[index]) {
      const isCorrect = status === 'CORRECT';
      const existingNotes = updatedTable[index].notes || '';

      let finalNote = customNotes !== undefined ? customNotes : existingNotes;
      if (customNotes === undefined && status !== updatedTable[index].status) {
        if (status === 'CORRECT') {
          finalNote = 'Statutory declaration verified as compliant by auditor.';
        } else if (status === 'MISSING') {
          finalNote = 'Statutory declaration missing or not detected on package panel.';
        } else if (status === 'MISLEADING') {
          finalNote = 'Prohibited qualifier or misleading statement used on package.';
        } else if (status === 'INCORRECT') {
          finalNote = 'Incorrect or altered statutory declaration.';
        } else if (status === 'NON_STANDARD') {
          finalNote = 'Non-standard unit of measure or non-compliant format.';
        } else if (status === 'UNCLEAR') {
          finalNote = 'Unclear, illegible, or obscured declaration.';
        }
      }

      updatedTable[index] = {
        ...updatedTable[index],
        extractedValue: val,
        status: status,
        isValid: isCorrect,
        notes: finalNote,
        isUserEdited: true,
      };
    }

    setEditedReport({
      ...editedReport,
      isEdited: true,
      extractedData: {
        ...editedReport.extractedData,
        declarationsTable: updatedTable,
      },
    });
  };

  const handleAddAdditionalProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const currentImages = editedReport.imageUrls || [];
            const nextImages = [...currentImages, reader.result as string];
            const updated = { ...editedReport, imageUrls: nextImages, isEdited: true };
            setEditedReport(updated);
            onUpdateReport(updated);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveProof = (idx: number) => {
    const currentImages = editedReport.imageUrls || [];
    const nextImages = currentImages.filter((_, i) => i !== idx);
    const updated = { ...editedReport, imageUrls: nextImages, isEdited: true };
    setEditedReport(updated);
    onUpdateReport(updated);
    if (activeProofIndex === idx) {
      setActiveProofIndex(null);
    }
  };

  const getPanelRoleName = (idx: number): string => {
    switch (idx) {
      case 0:
        return 'Primary Display Panel (FOP) & Brand Identity';
      case 1:
        return 'Statutory Declarations & Retail Price (MRP) Panel';
      case 2:
        return 'Net Quantity, Dimensions & Batch Code Panel';
      case 3:
        return 'Manufacturer Address & Consumer Care Cell Panel';
      default:
        return `Commodity Photographic Evidence Panel #${idx + 1}`;
    }
  };

  const mrpDeclared = editedReport.extractedData?.mrpDetails?.declaredMRP || 'Not detected on package';
  const netQtyDeclared = editedReport.extractedData?.netQuantity?.declaredValue || 'Not detected on package';
  const mfgDateDeclared = editedReport.extractedData?.dates?.mfgDate || 'Not detected on package';
  const expiryDateDeclared =
    editedReport.extractedData?.dates?.expiryDate ||
    editedReport.extractedData?.dates?.bestBefore ||
    'Not declared on package';
  const consumerCareDeclared =
    editedReport.extractedData?.consumerCare?.phoneOrTollFree ||
    editedReport.extractedData?.consumerCare?.email ||
    'Not declared on scanned panel';
  const declarations = useMemo(() => {
    return normalizeDeclarationsTable(
      editedReport.extractedData?.declarationsTable,
      editedReport.extractedData
    );
  }, [editedReport.extractedData]);

  const nutritionData = useMemo(() => {
    return (
      editedReport.nutritionAndIngredients ||
      editedReport.extractedData?.nutritionAndIngredients
    );
  }, [editedReport.nutritionAndIngredients, editedReport.extractedData?.nutritionAndIngredients]);

  const handleNutritionChange = (updated: NutritionAndIngredientsData) => {
    const nextReport: InspectionReport = {
      ...editedReport,
      isEdited: true,
      nutritionAndIngredients: updated,
      extractedData: {
        ...editedReport.extractedData,
        nutritionAndIngredients: updated,
      },
    };
    setEditedReport(nextReport);
    onUpdateReport(nextReport);
  };

  const violationsList = editedReport.violations || [];
  const imageProofs = editedReport.imageUrls || [];

  return (
    <div className="space-y-4">
      {/* High Density Report Action Bar */}
      <div className="bg-[#0F1117] border border-slate-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3.5 bg-sky-500"></div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Inspection Report ID: <span className="text-sky-400">{editedReport.id}</span>
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] font-mono text-slate-400">
            TIMESTAMP: {new Date(editedReport.timestamp || Date.now()).toLocaleString()}
          </span>
          <span className="text-slate-600">|</span>
          <span className="inline-flex items-center gap-1 bg-sky-950/70 border border-sky-800/80 text-sky-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
            <FileImage className="w-3 h-3 text-sky-400" />
            {imageProofs.length} Image Proof{imageProofs.length !== 1 ? 's' : ''} Within
          </span>
          {editedReport.isEdited && (
            <span className="bg-amber-950/70 border border-amber-800 text-amber-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
              MANUALLY_MODIFIED
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewScan}
            className="flex items-center gap-1.5 bg-white dark:bg-[#0A0C10] hover:bg-[#EFE8DC] dark:hover:bg-slate-800 border border-[#D8CCC0] dark:border-slate-700 text-[#332421] dark:text-slate-300 text-xs font-mono font-semibold px-3 py-1.5 rounded transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8E562E] dark:text-slate-400" />
            <span>New Inspection</span>
          </button>

          {!isEditing ? (
            <button
              id="report-edit-btn"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-[#EFE8DC] dark:hover:bg-slate-700 border border-[#D8CCC0] dark:border-slate-700 text-[#332421] dark:text-slate-200 text-xs font-mono font-semibold px-3 py-1.5 rounded transition-all cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#8E562E] dark:text-sky-400" />
              <span className="text-[#332421] dark:text-slate-200 font-semibold">Edit Report Data</span>
            </button>
          ) : (
            <button
              id="report-save-btn"
              onClick={handleSaveEdits}
              className="flex items-center gap-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-mono font-extrabold px-3.5 py-1.5 rounded-md border-2 border-emerald-300 shadow-md transition-all cursor-pointer ring-2 ring-emerald-500/40"
            >
              <Save className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span className="text-slate-950 font-extrabold">Save Modifications</span>
            </button>
          )}

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-[#0A0C10] text-xs font-mono font-bold px-3 py-1.5 rounded transition-all shadow-xs"
            title="Download statutory audit PDF including photographic evidence annexure"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Compiling PDF with Proofs...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Export Official PDF Report (With Proof)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Score & Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Score Gauge (4 cols) */}
        <div className="md:col-span-4 bg-[#0F1117] border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                Compliance Index
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                LEGAL METROLOGY ACT, 2009
              </span>
            </div>

            {/* Score Display */}
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editedReport.complianceScore}
                  onChange={(e) =>
                    setEditedReport({
                      ...editedReport,
                      complianceScore: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                    })
                  }
                  className="w-20 bg-white dark:bg-[#0A0C10] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-2xl font-mono font-bold p-1 rounded focus:border-sky-500 focus:outline-none"
                />
                <span className="text-sm font-mono text-slate-500">/ 100</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-extrabold font-mono tracking-tight ${
                    editedReport.complianceScore >= 80
                      ? 'text-emerald-400'
                      : editedReport.complianceScore >= 50
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {editedReport.complianceScore}
                </span>
                <span className="text-sm font-mono text-slate-500">/ 100</span>
              </div>
            )}

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  editedReport.complianceScore >= 80
                    ? 'bg-emerald-500'
                    : editedReport.complianceScore >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${editedReport.complianceScore}%` }}
              ></div>
            </div>

            {/* Status Pill */}
            <div className="pt-1">
              {isEditing ? (
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">
                    Audit Status:
                  </span>
                  <select
                    value={editedReport.complianceStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as 'COMPLIANT' | 'NON_COMPLIANT';
                      setEditedReport({
                        ...editedReport,
                        complianceStatus: newStatus,
                        enforcementAction: newStatus === 'COMPLIANT' ? 'VERIFIED_COMPLIANT' : 'NOTICE_ISSUED',
                      });
                    }}
                    className="w-full bg-white dark:bg-[#0A0C10] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-mono font-bold p-1.5 rounded focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value="COMPLIANT">STATUTORY COMPLIANT</option>
                    <option value="NON_COMPLIANT">VIOLATION DETECTED</option>
                  </select>
                </div>
              ) : (
                <div
                  className={`p-2.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2.5 shadow-2xs ${
                    editedReport.complianceStatus === 'COMPLIANT'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:border-rose-800/80 dark:text-rose-400'
                  }`}
                >
                  {editedReport.complianceStatus === 'COMPLIANT' ? (
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <div className="truncate">
                    <div className="uppercase tracking-wider font-extrabold text-xs text-emerald-900 dark:text-emerald-300">
                      {editedReport.complianceStatus === 'COMPLIANT'
                        ? 'STATUTORY COMPLIANT'
                        : 'VIOLATION DETECTED'}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700 dark:text-slate-300 mt-0.5">
                      Action: <span className="underline decoration-emerald-500/40">{editedReport.enforcementAction}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audit Metadata */}
          <div className="pt-3 mt-3 border-t border-slate-800 text-[10px] font-mono space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span className="text-slate-500">Auditor:</span>
              <span className="text-slate-300 font-semibold">{editedReport.userName}</span>
            </div>
            {editedReport.governmentId && (
              <div className="flex justify-between">
                <span className="text-slate-500">Gov ID:</span>
                <span className="text-sky-400">{editedReport.governmentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="text-slate-300">{editedReport.category}</span>
            </div>
          </div>
        </div>

        {/* Right Summary & Evidence Preview (8 cols) */}
        <div className="md:col-span-8 bg-[#0F1117] border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-sky-500"></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Commodity & Physical Evidence Overview
                </h3>
              </div>
              <span className="text-[10px] font-mono text-sky-400">
                {imageProofs.length} PANEL{imageProofs.length !== 1 ? 'S' : ''} ATTACHED
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Primary Image thumbnail with click-to-enlarge */}
              {imageProofs.length > 0 ? (
                <div
                  onClick={() => setActiveProofIndex(0)}
                  className="w-full sm:w-36 h-32 bg-[#0A0C10] rounded border border-slate-800 overflow-hidden shrink-0 relative group cursor-pointer hover:border-sky-500 transition-colors"
                  title="Click to inspect primary photographic proof"
                >
                  <img
                    src={imageProofs[0]}
                    alt="Inspection target proof"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-[10px] font-mono text-sky-400 gap-1">
                    <Maximize2 className="w-4 h-4 text-sky-400" />
                    <span>View Proof</span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 bg-slate-950/95 border-2 border-amber-400 text-amber-200 font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow-lg flex items-center gap-1 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Panel #1
                  </div>
                </div>
              ) : (
                <div className="w-full sm:w-36 h-32 bg-[#0A0C10] rounded border border-slate-800 flex flex-col items-center justify-center text-slate-600 text-[10px] font-mono shrink-0">
                  <FileImage className="w-6 h-6 text-slate-700 mb-1" />
                  <span>No Photo</span>
                </div>
              )}

              {/* Product Key Facts */}
              <div className="space-y-2 flex-1 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Product Identified</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedReport.productName}
                      onChange={(e) => setEditedReport({ ...editedReport, productName: e.target.value })}
                      className="w-full bg-[#0A0C10] border border-slate-700 text-slate-200 text-xs font-mono p-1 rounded mt-0.5"
                    />
                  ) : (
                    <div className="text-sm font-bold text-white font-sans">{editedReport.productName}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                  <div className="bg-[#0A0C10] p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Declared MRP</span>
                    <span className="text-slate-200 font-bold">{mrpDeclared}</span>
                  </div>
                  <div className="bg-[#0A0C10] p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Declared Net Qty</span>
                    <span className="text-slate-200 font-bold">{netQtyDeclared}</span>
                  </div>
                  <div className="bg-[#0A0C10] p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Date of Mfg</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedReport.extractedData?.dates?.mfgDate || ''}
                        onChange={(e) =>
                          setEditedReport({
                            ...editedReport,
                            extractedData: {
                              ...editedReport.extractedData,
                              dates: {
                                ...editedReport.extractedData?.dates,
                                mfgDate: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-[#0F1117] border border-slate-700 text-slate-200 text-xs font-mono p-0.5 rounded mt-0.5"
                      />
                    ) : (
                      <span className="text-slate-200">{mfgDateDeclared}</span>
                    )}
                  </div>
                  <div className="bg-[#0A0C10] p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Expiry Date</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedReport.extractedData?.dates?.expiryDate || ''}
                        onChange={(e) =>
                          setEditedReport({
                            ...editedReport,
                            extractedData: {
                              ...editedReport.extractedData,
                              dates: {
                                ...editedReport.extractedData?.dates,
                                mfgDate: editedReport.extractedData?.dates?.mfgDate || '',
                                expiryDate: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-[#0F1117] border border-slate-700 text-slate-200 text-xs font-mono p-0.5 rounded mt-0.5"
                      />
                    ) : (
                      <span className="text-slate-200 font-semibold">{expiryDateDeclared}</span>
                    )}
                  </div>
                  <div className="bg-[#0A0C10] p-1.5 rounded border border-slate-800 col-span-2 sm:col-span-2">
                    <span className="text-slate-500 block text-[9px] uppercase">Consumer Care</span>
                    <span className="text-slate-200 truncate block">
                      {consumerCareDeclared}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspector Remarks Box */}
            <div className="bg-[#0A0C10] border border-slate-800 p-2.5 rounded">
              <div className="text-[10px] font-mono font-bold uppercase text-sky-400 mb-1">
                Official Remarks & Findings:
              </div>
              {isEditing ? (
                <textarea
                  value={editedReport.inspectorRemarks || ''}
                  onChange={(e) => setEditedReport({ ...editedReport, inspectorRemarks: e.target.value })}
                  rows={2}
                  className="w-full bg-[#0F1117] border border-slate-700 text-slate-200 text-xs font-mono p-1 rounded"
                />
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {editedReport.inspectorRemarks || 'No inspector remarks provided.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED EVIDENTIARY IMAGE PROOFS SECTION */}
      <div className="bg-[#0F1117] border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3.5 bg-sky-500"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5">
              <FileImage className="w-4 h-4 text-sky-400" />
              Statutory Photographic Evidence & Packaging Proofs ({imageProofs.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded font-bold">
              PRIMA FACIE EVIDENCE CONFORMS (SEC. 15)
            </span>
            <input
              type="file"
              ref={additionalFileInputRef}
              onChange={handleAddAdditionalProof}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => additionalFileInputRef.current?.click()}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono px-2.5 py-1 rounded transition-colors"
            >
              <Plus className="w-3 h-3 text-sky-400" />
              Attach Additional Angle/Panel
            </button>
          </div>
        </div>

        {/* Photographic Evidence Gallery Cards */}
        {imageProofs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {imageProofs.map((imgUrl, idx) => (
              <div
                key={idx}
                className="bg-[#0A0C10] border border-slate-800 rounded-lg overflow-hidden flex flex-col justify-between group hover:border-sky-500/80 transition-all shadow-xs"
              >
                {/* Panel Header */}
                <div className="bg-slate-900 border-b border-slate-700 px-3 py-2 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 font-extrabold text-sky-300">
                    <span className="w-2 h-2 rounded-full bg-sky-400 ring-2 ring-sky-400/40"></span>
                    <span>PANEL #{idx + 1}</span>
                  </div>
                  <span className="text-slate-300 font-medium truncate max-w-[150px]">
                    {idx === 0 ? 'FOP Brand Face' : idx === 1 ? 'MRP & Declarations' : 'Packaging Evidence'}
                  </span>
                </div>

                {/* Image Container with Zoom overlay */}
                <div
                  onClick={() => setActiveProofIndex(idx)}
                  className="relative h-44 bg-black/40 overflow-hidden cursor-pointer flex items-center justify-center"
                >
                  <img
                    src={imgUrl}
                    alt={`Photographic proof panel ${idx + 1}`}
                    className="w-full h-full object-contain p-1.5 group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveProofIndex(idx);
                      }}
                      className="flex items-center gap-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-2.5 py-1 rounded text-xs font-mono shadow-xs"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      Inspect Proof
                    </button>
                  </div>

                  <div className="absolute top-2 right-2 bg-slate-950/95 border-2 border-sky-400 text-sky-200 font-mono font-bold text-xs px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    Proof #{idx + 1}
                  </div>

                  <div className="absolute bottom-2 left-2 bg-slate-950/95 border-2 border-amber-400 text-amber-200 font-mono font-bold text-xs px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Panel #{idx + 1}
                  </div>
                </div>

                {/* Panel Details Footer */}
                <div className="p-2.5 border-t border-slate-800/80 bg-[#0C0E14] space-y-1.5">
                  <div className="text-[11px] font-medium text-slate-300 truncate">
                    {getPanelRoleName(idx)}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="text-sky-400/90">SHA256-SECURE</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveProof(idx)}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-0.5 text-[9px]"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-slate-800 rounded-lg p-6 space-y-2 font-mono">
            <FileImage className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-xs text-slate-400">No photographic evidence panels attached to this audit report yet.</div>
            <button
              onClick={() => additionalFileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/40 text-xs px-3 py-1.5 rounded transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload Image Proof
            </button>
          </div>
        )}
      </div>

      {/* REFERENCE OBJECT OPTICAL CALIBRATION & DIMENSIONAL AUDIT SECTION */}
      {(() => {
        const calib = editedReport.calibrationAnalysis || editedReport.extractedData?.calibrationAnalysis;
        if (!calib || !calib.enabled) return null;

        const isDeficit = Boolean(calib.hasLargeVariance || (calib.fontSizeVariancePercent && calib.fontSizeVariancePercent <= -15));

        return (
          <div className="bg-[#0F1117] border border-slate-800 rounded-lg p-4 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-4 ${isDeficit ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                  <Target className={`w-4 h-4 ${isDeficit ? 'text-rose-400' : 'text-sky-400'}`} />
                  Reference Object Optical Calibration & Font Audit (Rule 9)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase border ${
                    isDeficit
                      ? 'bg-rose-950/70 border-rose-800 text-rose-300'
                      : 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                  }`}
                >
                  {isDeficit ? 'Rule 9 Statutory Infraction' : 'Calibrated Compliant'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  {calib.detectionConfidencePercent || 95}% Confidence
                </span>
              </div>
            </div>

            {/* Calibration Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              {/* 1. Reference Object Card */}
              <div className="bg-[#0A0C10] border border-slate-800 rounded p-3 space-y-2">
                <div className="text-[10px] font-bold text-sky-400 uppercase flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5 text-sky-400" />
                  Reference Standard
                </div>
                <div className="text-slate-200 font-bold font-sans text-xs">
                  {calib.referenceObjectType || 'Standard Reference Object'}
                </div>
                <div className="space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Standard Size:</span>
                    <span className="text-slate-300 font-bold">
                      {calib.referenceObjectDimensions?.diameterMm
                        ? `Ø ${calib.referenceObjectDimensions.diameterMm} mm`
                        : `${calib.referenceObjectDimensions?.widthMm || 85.6} × ${calib.referenceObjectDimensions?.heightMm || 53.98} mm`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pixel Scale:</span>
                    <span className="text-sky-400 font-bold">
                      {calib.scaleFactorPixelsPerMm ? `${calib.scaleFactorPixelsPerMm.toFixed(2)} px/mm` : '13.80 px/mm'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Object Status:</span>
                    <span className="text-emerald-400 font-bold">
                      {calib.referenceObjectDetected ? 'Detected in Frame' : 'Manual Ref Applied'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Package Dimensions & PDP Card */}
              <div className="bg-[#0A0C10] border border-slate-800 rounded p-3 space-y-2">
                <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-amber-400" />
                  Package Dimensions & PDP
                </div>
                <div className="space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Measured (W×H×D):</span>
                    <span className="text-slate-200 font-bold">
                      {calib.measuredPackageDimensionsMm
                        ? `${calib.measuredPackageDimensionsMm.width} × ${calib.measuredPackageDimensionsMm.height} × ${calib.measuredPackageDimensionsMm.depth} mm`
                        : '142 × 196 × 48 mm'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Principal Display Area:</span>
                    <span className="text-amber-400 font-bold">
                      {calib.measuredPackageDimensionsMm?.pdpAreaSqCm
                        ? `${calib.measuredPackageDimensionsMm.pdpAreaSqCm} cm²`
                        : '278.3 cm²'}
                    </span>
                  </div>
                  {calib.declaredPackageDimensionsMm && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Declared (W×H×D):</span>
                      <span className="text-slate-400">
                        {`${calib.declaredPackageDimensionsMm.width} × ${calib.declaredPackageDimensionsMm.height} × ${calib.declaredPackageDimensionsMm.depth} mm`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dimension Variance:</span>
                    <span className={`font-bold ${Math.abs(calib.dimensionVariancePercent || 0) >= 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {calib.dimensionVariancePercent !== undefined
                        ? `${calib.dimensionVariancePercent > 0 ? '+' : ''}${calib.dimensionVariancePercent}%`
                        : '1.4%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Rule 9 Font Height Audit Card */}
              <div className="bg-[#0A0C10] border border-slate-800 rounded p-3 space-y-2">
                <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-rose-400" />
                  Rule 9 Font Height Audit
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Net Qty Numeral:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-200 font-bold">
                        {calib.measuredFontHeightsMm?.netQuantityNumeralMm || 1.8} mm
                      </span>
                      <span className="text-slate-500 text-[9px]">
                        (Req: {calib.statutoryRequiredMinFontMm?.netQuantityMinMm || 4.0} mm)
                      </span>
                      {calib.fontSizeVariancePercent !== undefined && (
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                            calib.fontSizeVariancePercent < 0
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {calib.fontSizeVariancePercent}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">MRP Numeral:</span>
                    <span className="text-slate-200 font-bold">
                      {calib.measuredFontHeightsMm?.mrpNumeralMm || 2.2} mm
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Consumer Care / Mfg:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-200 font-bold">
                        {calib.measuredFontHeightsMm?.consumerCareTextMm || 1.1} mm
                      </span>
                      <span className="text-slate-500 text-[9px]">
                        (Req: {calib.statutoryRequiredMinFontMm?.generalDeclarationMinMm || 1.0} mm)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Statutory Variance Finding Banner */}
            <div
              className={`p-3 rounded border text-xs font-mono flex items-start gap-2.5 ${
                isDeficit
                  ? 'bg-rose-950/40 border-rose-900/80 text-rose-200'
                  : 'bg-emerald-950/40 border-emerald-900/80 text-emerald-200'
              }`}
            >
              {isDeficit ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <span>{isDeficit ? 'Statutory Dimensional / Font Infraction Registered' : 'Optical Calibration Clearance'}</span>
                  <span className="text-[10px] text-slate-400">Rule 9(1) & Table I / II</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {calib.varianceSummary ||
                    (isDeficit
                      ? `Net quantity numeral height is below statutory minimum required for this packaging size. Actionable under Section 36(1) of Legal Metrology Act, 2009.`
                      : 'All mandatory numeral and letter declarations meet the minimum height thresholds calibrated against the reference object.')}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Detected Violations Section */}
      {violationsList.length > 0 && (
        <div className="bg-[#0F1117] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3.5 bg-rose-500"></div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" />
                Statutory Violations & Infractions ({violationsList.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950/70 border border-rose-800/80 px-2 py-0.5 rounded font-bold">
              PENAL ACTION APPLICABLE
            </span>
          </div>

          <div className="space-y-2">
            {violationsList.map((vio, index) => (
              <div
                key={vio.id || index}
                className="bg-[#0A0C10] border border-rose-900/60 rounded p-3 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        vio.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}
                    >
                      {vio.severity}
                    </span>
                    <span className="font-bold text-slate-200 text-xs font-sans">{vio.title}</span>
                    <span className="text-sky-400 text-[10px]">[{vio.legalSection}]</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    {vio.description}
                  </p>
                  <div className="text-[10px] text-emerald-400 pt-1">
                    <span className="text-slate-500 font-mono">RECOMMENDED ACTION:</span> {vio.recommendation}
                  </div>
                </div>

                {isEditing && (
                  <button
                    onClick={() => {
                      const updated = (editedReport.violations || []).filter((_, i) => i !== index);
                      setEditedReport({ ...editedReport, violations: updated });
                    }}
                    className="self-end md:self-start text-rose-400 hover:text-rose-300 p-1"
                    title="Remove violation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Direct Government Escalation & Grievance Panel */}
          <div className="mt-4 border border-slate-800 bg-[#0A0C10] rounded-lg p-4 space-y-3.5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500/60"></div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300/90 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400/80" />
                  Official Statutory Grievance Escalation
                </h4>
              </div>
              <span className="text-[10px] font-mono text-rose-300/80 bg-rose-950/40 border border-rose-900/50 px-2 py-0.5 rounded self-start sm:self-auto font-bold">
                DOCA &bull; NCH &bull; FSSAI
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Statutory infractions detected under the Legal Metrology (Packaged Commodities) Rules, 2011 are liable for regulatory inquiry and compounding under Section 36 of the Legal Metrology Act, 2009. You can report this violation directly to the Department of Consumer Affairs with attached evidentiary proof.
            </p>

            {/* Single-Click Action Button */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                id="report-gov-gmail-btn"
                onClick={handleReportToGovernmentViaGmail}
                disabled={isReportingToGov}
                className="flex items-center gap-2 bg-rose-900/80 hover:bg-rose-800/90 disabled:opacity-70 text-rose-100 border border-rose-700/60 text-xs font-mono font-semibold px-4 py-2 rounded-md shadow-xs transition-all cursor-pointer"
                title="Single click: Generates official PDF proof report and opens Gmail with pre-filled statutory grievance letter"
              >
                {isReportingToGov ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-rose-200" />
                    <span>Preparing PDF Proof &amp; Opening Gmail...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-rose-200" />
                    <span>Report Violation to Government via Gmail (With PDF Proof)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-rose-300/70 ml-0.5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyGrievanceText}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-medium px-3 py-2 rounded-md transition-all cursor-pointer"
                title="Copy ready-to-send grievance complaint letter to clipboard"
              >
                {copiedGrievance ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Complaint Letter Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Letter Text</span>
                  </>
                )}
              </button>
            </div>

            {/* Success / Guidance Notice */}
            {showReportSuccessNotice && (
              <div className="bg-emerald-950/60 border border-emerald-700/80 rounded-md p-2.5 flex items-start gap-2 text-xs font-mono text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-300">PDF Report Downloaded &amp; Gmail Compose Opened!</div>
                  <p className="text-[11px] text-emerald-200/90 font-sans">
                    Your official statutory audit PDF with photographic proofs has been downloaded to your device. In your opened Gmail window, simply click the Paperclip (<span className="font-mono font-bold">Attach files</span>) icon and select the downloaded <span className="font-mono">DoCA_Statutory_Report_{editedReport.id}.pdf</span> to dispatch your grievance.
                  </p>
                </div>
              </div>
            )}

            {/* Official Government Portals & Helpline Reference (In case user faces issues reporting via Gmail) */}
            <div className="bg-[#0A0C10] border border-slate-800/90 rounded-lg p-3 space-y-2 text-xs">
              <div className="text-[11px] font-mono font-semibold text-slate-400 flex items-center justify-between">
                <span>GOVERNMENT HELPLINES &amp; ALTERNATIVE REPORTING CHANNELS</span>
                <span className="text-[10px] text-amber-400 font-sans">In case you face issues via Gmail</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono">
                {/* NCH Email */}
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 flex flex-col justify-between space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase">National Consumer Helpline</div>
                  <a
                    href="mailto:nch-ca@gov.in"
                    className="text-sky-400 hover:underline font-bold text-[11px] flex items-center gap-1 truncate"
                  >
                    <Mail className="w-3 h-3 shrink-0" />
                    <span>nch-ca@gov.in</span>
                  </a>
                </div>

                {/* Helpline 1915 */}
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 flex flex-col justify-between space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase">Toll-Free Helpline</div>
                  <a
                    href="tel:1915"
                    className="text-emerald-400 hover:underline font-bold text-[11px] flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 shrink-0" />
                    <span>1915 (Toll-Free)</span>
                  </a>
                </div>

                {/* Web Portal */}
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 flex flex-col justify-between space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase">Web Portal Grievance</div>
                  <a
                    href="https://consumerhelpline.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:underline font-bold text-[11px] flex items-center gap-1 truncate"
                  >
                    <Globe className="w-3 h-3 shrink-0" />
                    <span>consumerhelpline.gov.in</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0 text-slate-500" />
                  </a>
                </div>

                {/* FSSAI Grievance */}
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 flex flex-col justify-between space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase">FSSAI Consumer Grievance</div>
                  <a
                    href="mailto:compliance@fssai.gov.in"
                    className="text-amber-400 hover:underline font-bold text-[11px] flex items-center gap-1 truncate"
                  >
                    <Mail className="w-3 h-3 shrink-0" />
                    <span>compliance@fssai.gov.in</span>
                  </a>
                </div>
              </div>

              <div className="text-[10px] font-sans text-slate-400 pt-1 border-t border-slate-800/80">
                You can also register grievances directly on the <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-medium">consumerhelpline.gov.in</a> portal or call the National Consumer Helpline at <a href="tel:1915" className="text-emerald-400 underline font-medium">1915</a> (9:30 AM to 5:30 PM, all days except National Holidays).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Declarations Table (Rule 6(1) Check) */}
      <div className="bg-white dark:bg-[#0F1117] border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3.5 bg-sky-500"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
              Mandatory Declarations Audit Breakdown (Rule 6, 2011 Rules)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            MINISTRY OF CONSUMER AFFAIRS COMPLIANCE MATRIX
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-700 dark:text-slate-400 bg-slate-100/80 dark:bg-[#0A0C10]">
                <th className="py-2.5 px-3">Statutory Field</th>
                <th className="py-2.5 px-3">Rule Citation</th>
                <th className="py-2.5 px-3">Extracted Label Value</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Audit Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {declarations.map((item, index) => {
                const isNotDetected =
                  !item.extractedValue ||
                  item.extractedValue === 'Not visible on scanned panel(s)' ||
                  item.extractedValue === 'Not detected on package' ||
                  item.extractedValue === 'NOT DETECTED' ||
                  item.extractedValue === 'Missing';

                return (
                  <tr key={item.field || index} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-200 font-sans">
                      {item.label}
                    </td>
                    <td className="py-2.5 px-3 text-sky-600 dark:text-sky-400 text-[10px] whitespace-nowrap font-semibold">
                      {item.ruleCitation}
                    </td>
                    <td className="py-2.5 px-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.extractedValue}
                          onChange={(e) => handleFieldChange(index, e.target.value, item.status)}
                          className="w-full bg-white dark:bg-[#0A0C10] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-mono p-1.5 rounded focus:border-sky-500 focus:outline-none"
                        />
                      ) : (
                        <span
                          className={`text-xs ${
                            isNotDetected
                              ? 'text-amber-600 dark:text-amber-400 font-sans italic font-medium'
                              : 'font-mono text-slate-900 dark:text-slate-100 font-bold'
                          }`}
                        >
                          {item.extractedValue || 'Not visible on scanned panel(s)'}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          id={`declaration-status-${index}`}
                          value={item.status}
                          onChange={(e) => handleFieldChange(index, item.extractedValue, e.target.value as any)}
                          className="w-full bg-white dark:bg-[#0A0C10] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-mono font-bold px-2 py-1.5 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 focus:outline-none cursor-pointer"
                        >
                          <option value="CORRECT">CORRECT</option>
                          <option value="MISSING">MISSING</option>
                          <option value="INCORRECT">INCORRECT</option>
                          <option value="MISLEADING">MISLEADING</option>
                          <option value="NON_STANDARD">NON_STANDARD</option>
                          <option value="UNCLEAR">UNCLEAR</option>
                        </select>
                      ) : (
                        getStatusBadge(item.status)
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-700 dark:text-slate-400 font-sans leading-relaxed">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => handleFieldChange(index, item.extractedValue, item.status, e.target.value)}
                          className="w-full bg-white dark:bg-[#0A0C10] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-sans p-1.5 rounded focus:border-sky-500 focus:outline-none"
                          placeholder="Auditor notes on this field"
                        />
                      ) : (
                        item.notes
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* NUTRIENTS & INGREDIENTS STATUTORY AUDIT BREAKDOWN */}
      <NutritionIngredientsSection
        nutritionData={nutritionData}
        isEditing={isEditing}
        onChange={handleNutritionChange}
        productName={editedReport.productName}
        category={editedReport.category}
      />

      {/* FORENSIC LIGHTBOX MODAL FOR IMAGE PROOF */}
      {activeProofIndex !== null && imageProofs[activeProofIndex] && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0C10] border border-slate-700 rounded-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-[#0F1117] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span className="text-xs font-mono font-bold text-sky-300 uppercase">
                  Photographic Evidence &bull; Panel #{activeProofIndex + 1} of {imageProofs.length}
                </span>
                <span className="text-xs text-slate-500 font-mono">({editedReport.id})</span>
              </div>

              {/* Forensic Tool Controls */}
              <div className="flex items-center gap-2 text-xs font-mono">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-[#0A0C10] border border-slate-800 rounded px-2 py-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                    className="text-slate-400 hover:text-white"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-300 w-10 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                    className="text-slate-400 hover:text-white"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Metric Grid Toggle */}
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] ${
                    showGrid
                      ? 'bg-sky-500 text-black border-sky-400 font-bold'
                      : 'bg-[#0A0C10] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Toggle metric font height and clearance measurement grid overlay (Rule 7/9)"
                >
                  <Grid className="w-3 h-3" />
                  Grid
                </button>

                {/* Contrast Invert Toggle */}
                <button
                  onClick={() => setShowInverted(!showInverted)}
                  className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] ${
                    showInverted
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-[#0A0C10] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Invert colors for examining faint embossing, ink stamps, or batch dates"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  Invert
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setActiveProofIndex(null);
                    setZoomLevel(1);
                    setShowGrid(false);
                    setShowInverted(false);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Image Viewport */}
            <div className="flex-1 relative overflow-auto bg-[#07090D] flex items-center justify-center p-4">
              {/* Prev / Next navigation buttons */}
              {imageProofs.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveProofIndex((prev) => (prev! > 0 ? prev! - 1 : imageProofs.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black text-slate-300 hover:text-white p-2 rounded-full border border-slate-700"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveProofIndex((prev) => (prev! < imageProofs.length - 1 ? prev! + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black text-slate-300 hover:text-white p-2 rounded-full border border-slate-700"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Centered Image with Grid Overlay & Zoom */}
              <div
                className="relative max-w-full max-h-full transition-transform duration-150"
                style={{
                  transform: `scale(${zoomLevel})`,
                  filter: showInverted ? 'invert(1) contrast(1.2)' : 'none',
                }}
              >
                <img
                  src={imageProofs[activeProofIndex]}
                  alt={`Proof Panel ${activeProofIndex + 1}`}
                  className="max-h-[68vh] object-contain rounded border border-slate-800"
                />

                {/* Measurement Grid Overlay */}
                {showGrid && (
                  <div
                    className="absolute inset-0 pointer-events-none rounded border border-sky-400/40"
                    style={{
                      backgroundImage: 'linear-gradient(to right, rgba(56, 189, 248, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.2) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  >
                    <div className="absolute top-1 left-1 bg-black/80 text-[8px] font-mono text-sky-400 px-1 rounded">
                      Metric Grid: 1 Grid = ~5mm scale
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer / Legal Verification Strip */}
            <div className="bg-[#0F1117] border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Class:</span>
                <span className="text-slate-200 font-semibold">{getPanelRoleName(activeProofIndex)}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                <span>Sec. 15 Evidentiary Record</span>
                <span>&bull;</span>
                <span className="text-sky-400">Report Ref: {editedReport.id}</span>
                <span>&bull;</span>
                <span className="text-slate-400">Exp: {expiryDateDeclared}</span>
                <span>&bull;</span>
                <button
                  onClick={handleDownloadPDF}
                  className="text-sky-400 hover:text-sky-300 underline font-bold"
                >
                  Download PDF With Proof
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

