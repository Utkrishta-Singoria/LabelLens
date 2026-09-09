import React, { useState, useEffect } from 'react';
import { User, InspectionReport, ReferenceObjectType } from './types';
import { Navbar } from './components/Navbar';
import { ScannerSection } from './components/ScannerSection';
import { ReportView } from './components/ReportView';
import { DashboardView } from './components/DashboardView';
import { RulesReferenceView } from './components/RulesReferenceView';
import { AuthModal } from './components/AuthModal';
import { SAMPLE_PRODUCTS, executeClientSideComplianceCheck } from './data/legalMetrologyRules';
import { normalizeDeclarationsTable } from './utils/declarationTableHelper';
import { sanitizeNutritionData } from './utils/nutritionHelper';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LabelLens ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#0F1117] border border-rose-800/80 rounded-lg p-6 max-w-2xl mx-auto my-8 text-slate-300 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>CRITICAL RENDERING EXCEPTION PREVENTED</span>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            An unexpected parsing or render state occurred while generating the inspection view. The system has safely isolated the error.
          </p>
          <div className="bg-[#0A0C10] p-3 rounded border border-slate-800 text-[11px] font-mono text-rose-300 break-all">
            {this.state.error?.message || 'Unknown render exception'}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onReset();
              }}
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-[#0A0C10] px-4 py-2 rounded text-xs font-mono font-bold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset & Return to Scanner
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'scanner' | 'dashboard' | 'rules'>('scanner');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('labellens_theme') || localStorage.getItem('packcheck_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('labellens_theme', theme);
      localStorage.setItem('packcheck_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('labellens_user') || localStorage.getItem('packcheck_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('labellens_user', JSON.stringify(currentUser));
        localStorage.setItem('packcheck_user', JSON.stringify(currentUser));
      } catch {}
    } else {
      try {
        localStorage.removeItem('labellens_user');
        localStorage.removeItem('packcheck_user');
      } catch {}
    }
  }, [currentUser]);

  // Verify active session on startup with backend
  useEffect(() => {
    const token = localStorage.getItem('labellens_token') || localStorage.getItem('packcheck_token');
    const saved = localStorage.getItem('labellens_user') || localStorage.getItem('packcheck_user');
    if (token || saved) {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (saved) {
        try {
          const u = JSON.parse(saved);
          if (u?.id) headers['x-user-id'] = u.id;
        } catch {}
      }

      fetch('/api/auth/me', { headers })
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data?.success && data?.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, []);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [inspections, setInspections] = useState<InspectionReport[]>([]);
  const [activeReport, setActiveReport] = useState<InspectionReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Load inspections strictly scoped to the authenticated user
  useEffect(() => {
    if (!currentUser) {
      setInspections([]);
      return;
    }

    // 1. Immediately hydrate from user-specific local storage cache
    try {
      const userCached = localStorage.getItem(`labellens_inspections_${currentUser.id}`) || localStorage.getItem(`packcheck_inspections_${currentUser.id}`);
      if (userCached) {
        const parsed = JSON.parse(userCached);
        if (Array.isArray(parsed)) {
          const userOnlyCached = parsed.filter((i: any) => i.userId === currentUser.id);
          setInspections(userOnlyCached);
        }
      }
    } catch {}

    // 2. Fetch fresh user-isolated inspection history from database API
    const token = localStorage.getItem('labellens_token') || localStorage.getItem('packcheck_token') || '';
    fetch(`/api/inspections?userId=${encodeURIComponent(currentUser.id)}`, {
      headers: {
        'x-user-id': currentUser.id,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.success && Array.isArray(data.inspections)) {
          // Strictly verify every record belongs to this user
          const userOnly = data.inspections.filter((i: InspectionReport) => i.userId === currentUser.id);
          setInspections(userOnly);
          try {
            localStorage.setItem(`labellens_inspections_${currentUser.id}`, JSON.stringify(userOnly));
            localStorage.setItem(`packcheck_inspections_${currentUser.id}`, JSON.stringify(userOnly));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Backend inspections API unavailable, keeping cached user records', err);
      });
  }, [currentUser]);

  const normalizeInspectionReport = (raw: any, fallbackImages: string[], manualCategory: string): InspectionReport => {
    const reportData = raw?.report || raw?.data || raw;
    const reportId = reportData?.id || `INS-${Date.now().toString().slice(-6)}`;
    
    const prodName = reportData?.productName || reportData?.extractedData?.productName || `${manualCategory || 'Packaged Commodity'} Sample`;
    const brand = reportData?.extractedData?.brandName || 'Detected on Package';
    const genericName = reportData?.extractedData?.genericCommodityName || manualCategory || 'Packaged Commodity';

    const mfg = reportData?.extractedData?.manufacturerDetails || {
      name: 'Not visible on scanned panel(s)',
      address: 'Not visible on scanned panel(s)',
      isSpecified: false,
      isMarketerDifferent: false,
      countryOfOrigin: 'India',
    };

    const netQty = reportData?.extractedData?.netQuantity || {
      declaredValue: 'Not detected on package',
      numericValue: undefined,
      unit: '',
      isUnitValid: false,
      standardPackMatch: true,
      misleadingTermsUsed: [],
      clearSpaceCompliant: true,
    };

    const mrp = reportData?.extractedData?.mrpDetails || {
      declaredMRP: 'Not detected on package',
      numericMRP: undefined,
      hasInclAllTaxes: false,
      unitSalePrice: 'Not declared on scanned panel',
      isStickerPasted: false,
      isAltered: false,
    };

    const dates = reportData?.extractedData?.dates || {
      mfgDate: 'Not detected on package',
      expiryDate: reportData?.extractedData?.dates?.expiryDate || 'Not detected on package',
      bestBefore: 'Declared',
    };

    const care = reportData?.extractedData?.consumerCare || {
      hasConsumerCare: false,
      nameOrDesignation: 'Not specified',
      phoneOrTollFree: 'Not declared',
      email: 'Not declared',
      postalAddress: 'Not declared',
      completeness: 'MISSING',
    };

    const lang = reportData?.extractedData?.languageAndVisibility || {
      isHindiOrEnglish: true,
      languagesDetected: ['English'],
      isColorContrasting: true,
      fontSizeEstimatedPt: 10,
      isFontSizeAdequate: true,
      isMoldedOrBlown: false,
    };

    const rawTable = reportData?.extractedData?.declarationsTable;
    const declarationsTable = normalizeDeclarationsTable(rawTable, {
      productName: prodName,
      brandName: brand,
      genericCommodityName: genericName,
      manufacturerDetails: mfg,
      netQuantity: netQty,
      mrpDetails: mrp,
      dates: dates,
      consumerCare: care,
      languageAndVisibility: lang,
    });

    const calibrationAnalysis = reportData?.extractedData?.calibrationAnalysis || reportData?.calibrationAnalysis;
    const rawNutri = reportData?.extractedData?.nutritionAndIngredients || reportData?.nutritionAndIngredients;
    const nutritionAndIngredients = sanitizeNutritionData(
      rawNutri,
      reportData?.category || manualCategory,
      reportData?.inspectorRemarks || prodName,
      prodName
    );

    return {
      id: reportId,
      timestamp: reportData?.timestamp || new Date().toISOString(),
      userId: reportData?.userId || currentUser?.id || 'guest',
      userName: reportData?.userName || currentUser?.name || (currentUser ? 'Auditor' : 'Guest Auditor'),
      userRole: reportData?.userRole || currentUser?.role || 'consumer',
      governmentId: reportData?.governmentId || currentUser?.governmentId,
      productName: prodName,
      category: (reportData?.category || manualCategory || 'Snacks & Confectionery') as any,
      complianceScore: typeof reportData?.complianceScore === 'number' ? reportData.complianceScore : 85,
      complianceStatus: reportData?.complianceStatus || (reportData?.violations?.length > 0 ? 'NON_COMPLIANT' : 'COMPLIANT'),
      enforcementAction: reportData?.enforcementAction || (reportData?.violations?.length > 0 ? 'NOTICE_ISSUED' : 'VERIFIED_COMPLIANT'),
      inspectorRemarks: reportData?.inspectorRemarks || 'Statutory declarations extracted and verified under Rule 6 of the Legal Metrology (Packaged Commodities) Rules, 2011.',
      imageUrls: (reportData?.imageUrls && reportData.imageUrls.length > 0) ? reportData.imageUrls : fallbackImages,
      calibrationAnalysis,
      nutritionAndIngredients,
      extractedData: {
        productName: prodName,
        brandName: brand,
        genericCommodityName: genericName,
        category: (reportData?.extractedData?.category || manualCategory || 'Snacks & Confectionery') as any,
        manufacturerDetails: mfg,
        netQuantity: netQty,
        mrpDetails: mrp,
        dates: dates,
        consumerCare: care,
        languageAndVisibility: lang,
        declarationsTable: declarationsTable,
        calibrationAnalysis,
        nutritionAndIngredients,
      },
      violations: reportData?.violations || [],
      isEdited: false,
    };
  };

  const handleAnalyzeImages = async (
    images: string[],
    manualCategory: string,
    inspectorNotes: string,
    calibrationConfig?: { enabled: boolean; referenceObjectType: ReferenceObjectType }
  ) => {
    setIsAnalyzing(true);
    const token = localStorage.getItem('labellens_token') || localStorage.getItem('packcheck_token') || '';
    try {
      const response = await fetch('/api/scan/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'guest',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          images,
          manualCategory,
          textContext: inspectorNotes,
          inspectorNotes,
          user: currentUser,
          calibrationConfig,
        }),
      });

      if (response.ok) {
        const rawJson = await response.json();
        const normalized = normalizeInspectionReport(rawJson, images, manualCategory);
        if (currentUser) {
          normalized.userId = currentUser.id;
          normalized.userName = currentUser.name;
          normalized.userRole = currentUser.role;
          normalized.governmentId = currentUser.governmentId;
        }
        setActiveReport(normalized);
        if (currentUser) {
          setInspections((prev) => {
            const next = [normalized, ...prev.filter((i) => i.id !== normalized.id)];
            try {
              localStorage.setItem(`labellens_inspections_${currentUser.id}`, JSON.stringify(next));
              localStorage.setItem(`packcheck_inspections_${currentUser.id}`, JSON.stringify(next));
            } catch {}
            return next;
          });

          // Explicitly persist to server database store
          fetch('/api/inspections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': currentUser.id,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ inspection: normalized, user: currentUser }),
          }).catch((err) => console.warn('Database save warning:', err));
        }
        setCurrentTab('scanner');
      } else {
        // Fallback to client-side rule evaluation engine
        console.warn('Server analyze returned non-OK, performing local engine verification');
        const fallbackResult = executeClientSideComplianceCheck(images, manualCategory, inspectorNotes, currentUser, calibrationConfig);
        const normalized = normalizeInspectionReport(fallbackResult, images, manualCategory);
        setActiveReport(normalized);
        if (currentUser) {
          setInspections((prev) => {
            const next = [normalized, ...prev.filter((i) => i.id !== normalized.id)];
            try {
              localStorage.setItem(`labellens_inspections_${currentUser.id}`, JSON.stringify(next));
              localStorage.setItem(`packcheck_inspections_${currentUser.id}`, JSON.stringify(next));
            } catch {}
            return next;
          });

          fetch('/api/inspections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': currentUser.id,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ inspection: normalized, user: currentUser }),
          }).catch(() => {});
        }
        setCurrentTab('scanner');
      }
    } catch (error) {
      console.warn('Network error calling /api/scan/analyze, utilizing built-in rule checker', error);
      const fallbackResult = executeClientSideComplianceCheck(images, manualCategory, inspectorNotes, currentUser);
      const normalized = normalizeInspectionReport(fallbackResult, images, manualCategory);
      setActiveReport(normalized);
      if (currentUser) {
        setInspections((prev) => {
          const next = [normalized, ...prev.filter((i) => i.id !== normalized.id)];
          try {
            localStorage.setItem(`labellens_inspections_${currentUser.id}`, JSON.stringify(next));
            localStorage.setItem(`packcheck_inspections_${currentUser.id}`, JSON.stringify(next));
          } catch {}
          return next;
        });

        fetch('/api/inspections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ inspection: normalized, user: currentUser }),
        }).catch(() => {});
      }
      setCurrentTab('scanner');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = (sample: InspectionReport) => {
    const normalized = normalizeInspectionReport(sample, sample.imageUrls || [], sample.category || 'Snacks & Confectionery');
    setActiveReport(normalized);
    setCurrentTab('scanner');
  };

  const handleUpdateReport = (updated: InspectionReport) => {
    const withEditFlag = { ...updated, isEdited: true };
    setActiveReport(withEditFlag);
    if (currentUser) {
      setInspections((prev) => {
        const next = prev.map((i) => (i.id === withEditFlag.id ? withEditFlag : i));
        try {
          localStorage.setItem(`labellens_inspections_${currentUser.id}`, JSON.stringify(next));
          localStorage.setItem(`packcheck_inspections_${currentUser.id}`, JSON.stringify(next));
        } catch {}
        return next;
      });

      const token = localStorage.getItem('labellens_token') || localStorage.getItem('packcheck_token') || '';
      fetch(`/api/inspections/${withEditFlag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ updates: withEditFlag }),
      }).catch(() => {});
    }
  };

  const handleDeleteReport = (id: string) => {
    if (!currentUser) return;
    setInspections((prev) => {
      const next = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem(`labellens_inspections_${currentUser.id}`, JSON.stringify(next));
        localStorage.setItem(`packcheck_inspections_${currentUser.id}`, JSON.stringify(next));
      } catch {}
      return next;
    });

    if (activeReport?.id === id) {
      setActiveReport(null);
    }

    const token = localStorage.getItem('labellens_token') || localStorage.getItem('packcheck_token') || '';
    fetch(`/api/inspections/${id}?userId=${encodeURIComponent(currentUser.id)}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': currentUser.id,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).catch(() => {});
  };

  const handleNewScan = () => {
    setActiveReport(null);
    setCurrentTab('scanner');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setInspections([]);
    setActiveReport(null);
    setIsAuthModalOpen(false);
    try {
      localStorage.removeItem('labellens_user');
      localStorage.removeItem('labellens_token');
      localStorage.removeItem('packcheck_user');
      localStorage.removeItem('packcheck_token');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#F7F2EA] text-[#332421] dark:bg-[#0A0C10] dark:text-slate-300 flex flex-col font-sans selection:bg-[#8E562E] selection:text-white transition-colors duration-150">
      {/* Top High Density Navigation */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'scanner') {
            setActiveReport(null);
          }
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        activeAuditCount={inspections.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main High Density Command Center Viewport wrapped in ErrorBoundary */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5">
        <ErrorBoundary onReset={handleNewScan}>
          {currentTab === 'scanner' && (
            <div>
              {activeReport ? (
                <ReportView
                  report={activeReport}
                  onUpdateReport={handleUpdateReport}
                  onNewScan={handleNewScan}
                />
              ) : (
                <ScannerSection
                  onAnalyze={handleAnalyzeImages}
                  isLoading={isAnalyzing}
                  onLoadSample={handleLoadSample}
                />
              )}
            </div>
          )}

          {currentTab === 'dashboard' && (
            <DashboardView
              inspections={inspections}
              currentUser={currentUser}
              onViewReport={(rep) => {
                setActiveReport(rep);
                setCurrentTab('scanner');
              }}
              onDeleteReport={handleDeleteReport}
              onNewScan={handleNewScan}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}

          {currentTab === 'rules' && <RulesReferenceView />}
        </ErrorBoundary>
      </main>

      {/* High Density Footer Bar */}
      <footer className="bg-[#EFE8DC] dark:bg-[#0F1117] border-t border-[#E2D7C7] dark:border-slate-800/80 py-3 px-4 text-[#332421]/75 dark:text-slate-500 text-[10px] font-mono select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="packcheck-heading labellens-heading text-[#D4AF37] font-bold">LabelLens AI</span>
            <span>&bull;</span>
            <span>DoCA Legal Metrology Enforcement Portal</span>
            <span>&bull;</span>
            <span className="text-[#8E562E] dark:text-sky-400 font-semibold">Problem Statement ID: 26034</span>
            <span>&bull;</span>
            <span className="font-bold text-[#8E562E] dark:text-sky-400 tracking-wide">BUILD BY TEAM STRAW HATS</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Act Penalty Code: Sec 36(1)</span>
            <span>Schedule II Standard Metrics</span>
            <span className="text-slate-600">SYSTEM_REV: 4.2.0-STABLE</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
