import React, { useState } from 'react';
import { InspectionReport, User } from '../types';
import {
  LayoutDashboard,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Download,
  Eye,
  FileSpreadsheet,
  BarChart3,
  Calendar,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Lock,
  LogIn,
  UserCheck,
  Trash2,
  PlusCircle,
  FileImage,
  Loader2,
} from 'lucide-react';
import { generateInspectionPDF } from '../utils/pdfGenerator';

interface DashboardViewProps {
  inspections: InspectionReport[];
  currentUser: User | null;
  onViewReport: (report: InspectionReport) => void;
  onDeleteReport?: (id: string) => void;
  onNewScan: () => void;
  onOpenAuth: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  inspections,
  currentUser,
  onViewReport,
  onDeleteReport,
  onNewScan,
  onOpenAuth,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLIANT' | 'NON_COMPLIANT'>('ALL');
  const [selectedInspection, setSelectedInspection] = useState<InspectionReport | null>(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  const handleDownloadPDF = async (item: InspectionReport) => {
    setDownloadingPdfId(item.id);
    try {
      await generateInspectionPDF(item);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setDownloadingPdfId(null);
    }
  };

  // If user is not logged in, show access restricted authentication gate
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-10 text-center space-y-6 shadow-xl backdrop-blur-sm">
          {/* Top security tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Authentication Required</span>
          </div>

          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>

          {/* Headings */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
              Enforcement Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Sign in with your authorized credentials to access your saved packaging audits, prosecution logs, violation statistics, and export registries.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="dashboard-login-btn"
              onClick={onOpenAuth}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#8E562E] dark:bg-sky-500 hover:bg-[#794723] dark:hover:bg-sky-400 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span className="text-white">Sign In to Access Dashboard</span>
            </button>
            <button
              id="dashboard-return-scan-btn"
              onClick={onNewScan}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-950 hover:bg-[#EFE8DC] dark:hover:bg-slate-800 text-[#332421] dark:text-slate-200 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all border border-[#D8CCC0] dark:border-slate-700/80 cursor-pointer shadow-xs"
            >
              <span className="text-[#332421] dark:text-slate-200 font-semibold">Return to Scanner</span>
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold">
                <BarChart3 className="w-4 h-4" />
                <span>Audit Analytics</span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Live compliance pass rates, unit distribution, and commodity category breakdown.
              </p>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Infraction Logs</span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Section 36(1) prosecution notices, misleading claims, and seizure records.
              </p>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Reports</span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Download CSV inspection registries and print official PDF verification certificates.
              </p>
            </div>
          </div>

          {/* Legal Reference footer note */}
          <div className="text-xs text-slate-500 pt-1">
            Enforcement under the Legal Metrology (Packaged Commodities) Rules, 2011
          </div>
        </div>
      </div>
    );
  }

  // Helper to reliably determine if an inspection is compliant or has violations
  const isCompliantAudit = (item: InspectionReport): boolean => {
    const status = String(
      item.complianceStatus ||
      (item as any).compliance_status ||
      (item as any).status ||
      ''
    ).trim().toUpperCase();

    const hasViolations = Array.isArray(item.violations) && item.violations.length > 0;
    if (hasViolations) return false;

    return status === 'COMPLIANT' || status === 'PASS' || status === '100% PASS';
  };

  const isViolationAudit = (item: InspectionReport): boolean => {
    const status = String(
      item.complianceStatus ||
      (item as any).compliance_status ||
      (item as any).status ||
      ''
    ).trim().toUpperCase();

    const hasViolations = Array.isArray(item.violations) && item.violations.length > 0;
    if (hasViolations) return true;

    if (
      status === 'NON_COMPLIANT' ||
      status === 'VIOLATION' ||
      status === 'VIOLATIONS' ||
      status === 'PARTIAL_COMPLIANCE' ||
      status === 'FAIL' ||
      status === 'FAILED' ||
      status.includes('VIOLAT') ||
      status.includes('NON')
    ) {
      return true;
    }

    // Default: any record that is not strictly compliant is treated as a violation
    return status !== 'COMPLIANT' && status !== 'PASS' && status !== '100% PASS';
  };

  // Compute metrics
  const totalAudits = inspections.length;
  const compliantCount = inspections.filter(isCompliantAudit).length;
  const violationCount = inspections.filter(isViolationAudit).length;
  const avgCompliance = totalAudits > 0 ? Math.round(inspections.reduce((acc, i) => acc + (i.complianceScore || 0), 0) / totalAudits) : 0;

  // Filtered list
  const filteredInspections = inspections.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (item.productName && item.productName.toLowerCase().includes(term)) ||
      (item.category && item.category.toLowerCase().includes(term)) ||
      (item.id && item.id.toLowerCase().includes(term));

    let matchesStatus = true;
    if (statusFilter === 'COMPLIANT') {
      matchesStatus = isCompliantAudit(item);
    } else if (statusFilter === 'NON_COMPLIANT') {
      matchesStatus = isViolationAudit(item);
    }

    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    if (inspections.length === 0) return;
    const headers = ['ID', 'Product Name', 'Category', 'Status', 'Score', 'MRP', 'Net Quantity', 'Inspector', 'Timestamp'];
    const rows = inspections.map((i) => [
      i.id,
      `"${i.productName.replace(/"/g, '""')}"`,
      `"${i.category}"`,
      i.complianceStatus,
      i.complianceScore,
      `"${i.extractedData.mrpDetails.declaredMRP}"`,
      `"${i.extractedData.netQuantity.declaredValue}"`,
      `"${i.userName}"`,
      i.timestamp,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `doca_inspections_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Account Info & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-4 sm:p-5 rounded-xl shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold text-sm">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm sm:text-base">{currentUser.name}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                {currentUser.role === 'official' ? 'DoCA Enforcement Official' : 'Citizen Auditor'}
              </span>
              {currentUser.governmentId && (
                <span className="text-[10px] bg-sky-950/60 border border-sky-800/60 text-sky-300 px-2 py-0.5 rounded-full font-mono">
                  ID: {currentUser.governmentId}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure Ledger &bull; {inspections.length} audit{inspections.length !== 1 ? 's' : ''} saved to your cloud account
            </p>
          </div>
        </div>

        <button
          onClick={onNewScan}
          className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Inspection Scan</span>
        </button>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`text-left bg-slate-900/70 border rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm transition-all cursor-pointer ${
            statusFilter === 'ALL' ? 'border-sky-500/80 ring-1 ring-sky-500/50' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-medium text-slate-400">Total Audits</span>
            <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-full">All Time</span>
          </div>
          <div className="text-3xl font-bold text-white mt-2 font-sans">{totalAudits}</div>
          <div className="h-1.5 bg-slate-800 w-full rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-sky-500 w-full"></div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('COMPLIANT')}
          className={`text-left bg-slate-900/70 border rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm transition-all cursor-pointer ${
            statusFilter === 'COMPLIANT' ? 'border-emerald-500/80 ring-1 ring-emerald-500/50' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-medium text-slate-400">100% Compliant</span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
              {totalAudits > 0 ? Math.round((compliantCount / totalAudits) * 100) : 0}%
            </span>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mt-2 font-sans">{compliantCount}</div>
          <div className="h-1.5 bg-slate-800 w-full rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${totalAudits > 0 ? (compliantCount / totalAudits) * 100 : 0}%` }}></div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('NON_COMPLIANT')}
          className={`text-left bg-slate-900/70 border rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm transition-all cursor-pointer ${
            statusFilter === 'NON_COMPLIANT' ? 'border-rose-500/80 ring-1 ring-rose-500/50' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-medium text-slate-400">Violations Found</span>
            <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded-full">
              Sec 36(1)
            </span>
          </div>
          <div className="text-3xl font-bold text-rose-400 mt-2 font-sans">{violationCount}</div>
          <div className="h-1.5 bg-slate-800 w-full rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-rose-500" style={{ width: `${totalAudits > 0 ? (violationCount / totalAudits) * 100 : 0}%` }}></div>
          </div>
        </button>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Average Score</span>
            <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-full">Quality Index</span>
          </div>
          <div className="text-3xl font-bold text-sky-400 mt-2 font-sans">{avgCompliance}%</div>
          <div className="h-1.5 bg-slate-800 w-full rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-sky-500" style={{ width: `${avgCompliance}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Inspections Table & Inspector Queue */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Inspection Records
            </h3>
            <p className="text-xs text-slate-400">
              View, inspect evidence, download certificates, or delete records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by product or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs pl-8 pr-3 py-2 rounded-lg focus:border-sky-500 focus:outline-none w-48 sm:w-56"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({totalAudits})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('COMPLIANT')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === 'COMPLIANT' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Compliant ({compliantCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('NON_COMPLIANT')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === 'NON_COMPLIANT' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Violations ({violationCount})
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 bg-white dark:bg-slate-950 hover:bg-[#EFE8DC] dark:hover:bg-slate-800 border border-[#D8CCC0] dark:border-slate-700 text-[#332421] dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#2D5D4F] dark:text-emerald-400" />
              <span className="text-[#332421] dark:text-slate-200 font-semibold">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 bg-slate-950/60">
                <th className="py-3 px-3.5">Audit ID</th>
                <th className="py-3 px-3.5">Evidence</th>
                <th className="py-3 px-3.5">Product Name</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Score</th>
                <th className="py-3 px-3.5">Inspector</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInspections.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3.5 text-sky-400 font-mono font-medium">
                    {item.id}
                  </td>
                  <td className="py-3 px-3.5">
                    {item.imageUrls && item.imageUrls.length > 0 ? (
                      <div
                        onClick={() => onViewReport(item)}
                        className="relative group w-9 h-9 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden cursor-pointer hover:border-sky-400 transition-colors"
                        title={`${item.imageUrls.length} image proof panel(s) attached. Click to inspect.`}
                      >
                        <img
                          src={item.imageUrls[0]}
                          alt="Proof"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <span className="absolute bottom-0 right-0 bg-sky-500 text-[8px] font-mono text-black font-bold px-1 rounded-tl-sm">
                          {item.imageUrls.length}
                        </span>
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 text-[9px] font-mono">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 font-medium text-slate-200">
                    <div>{item.productName}</div>
                    {(item.extractedData?.dates?.expiryDate || item.extractedData?.dates?.mfgDate) && (
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {item.extractedData?.dates?.mfgDate ? `Mfg: ${item.extractedData.dates.mfgDate}` : ''}
                        {item.extractedData?.dates?.mfgDate && item.extractedData?.dates?.expiryDate ? ' | ' : ''}
                        {item.extractedData?.dates?.expiryDate ? `Exp: ${item.extractedData.dates.expiryDate}` : ''}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-slate-400 text-xs">
                    {item.category}
                  </td>
                  <td className="py-3 px-3.5">
                    {(() => {
                      const isCompliant = isCompliantAudit(item);
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            isCompliant
                              ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/80'
                              : 'bg-rose-950/70 text-rose-400 border border-rose-800/80'
                          }`}
                        >
                          {isCompliant ? '100% Pass' : 'Violation'}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-300">
                    {item.complianceScore}%
                  </td>
                  <td className="py-3 px-3.5 text-slate-400 text-xs">
                    {item.userName}
                  </td>
                  <td className="py-3 px-3.5 text-slate-500 text-xs">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewReport(item)}
                        className="text-sky-400 hover:text-sky-300 bg-slate-950 hover:bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(item)}
                        disabled={downloadingPdfId === item.id}
                        className="text-slate-400 hover:text-slate-200 disabled:opacity-50 bg-slate-950 hover:bg-slate-800 border border-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors"
                        title="Download PDF report with image proof"
                      >
                        {downloadingPdfId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {onDeleteReport && (
                        <button
                          onClick={() => onDeleteReport(item.id)}
                          className="text-slate-500 hover:text-rose-400 bg-slate-950 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-900/60 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Delete audit record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredInspections.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    {inspections.length === 0 ? (
                      <div className="max-w-md mx-auto space-y-3">
                        <ShieldCheck className="w-10 h-10 text-sky-400/70 mx-auto" />
                        <div className="text-sm font-semibold text-slate-200">
                          No Audits Recorded For This Account
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Items scanned while signed in as <strong className="text-slate-300">{currentUser.name}</strong> will be saved exclusively to your account.
                        </p>
                        <button
                          onClick={onNewScan}
                          className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Start New Inspection Scan</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <div className="text-xs text-slate-400">
                          No inspection records matching current search or filter criteria ({statusFilter === 'NON_COMPLIANT' ? 'Violations' : statusFilter === 'COMPLIANT' ? 'Compliant' : 'All'})
                        </div>
                        <button
                          type="button"
                          onClick={() => { setStatusFilter('ALL'); setSearchTerm(''); }}
                          className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 underline cursor-pointer"
                        >
                          Reset filter to show all ({inspections.length}) audits
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
