import React from 'react';
import { User } from '../types';
import { ShieldCheck, Scale, LayoutDashboard, LogIn, LogOut, BookOpen, Activity, Terminal, ShieldAlert, Lock, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentTab: 'scanner' | 'dashboard' | 'rules';
  onSelectTab: (tab: 'scanner' | 'dashboard' | 'rules') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeAuditCount?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  onSelectTab,
  onOpenAuth,
  onLogout,
  activeAuditCount = 0,
  theme = 'light',
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F7F2EA]/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-b-2 border-[#D4AF37]/40 dark:border-sky-500/30 text-[#332421] dark:text-slate-200 select-none shadow-md transition-colors duration-150">
      {/* Top Center Masthead / Brand Header */}
      <div className="bg-[#EFE8DC] dark:bg-[#07090E] border-b border-[#E2D7C7] dark:border-slate-800/80 px-4 sm:px-6 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center relative">
          
          {/* Official DoCA Status Pill - Positioned left on desktop */}
          <div className="hidden lg:flex items-center gap-2 absolute left-0 text-xs text-[#332421]/80 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#2D5D4F] dark:bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-[#332421] dark:text-slate-300">DoCA Legal Metrology</span>
            <span className="text-[#332421]/40 dark:text-slate-600">•</span>
            <span className="text-[11px] text-[#332421]/70 dark:text-slate-400">PCR Rules, 2011</span>
          </div>

          {/* Centered Brand Title & Subtitle */}
          <div
            onClick={() => onSelectTab('scanner')}
            className="cursor-pointer group flex flex-col items-center justify-center"
          >
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 dark:bg-sky-500/20 border border-[#D4AF37]/40 dark:border-sky-500/40 flex items-center justify-center text-[#D4AF37] dark:text-sky-400 group-hover:scale-105 transition-transform shadow-xs">
                <Scale className="w-4.5 h-4.5 text-[#D4AF37] dark:text-sky-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight font-sans flex items-center gap-1.5">
                <span className="packcheck-heading labellens-heading text-[#D4AF37]">LabelLens</span>
                <span className="text-[#8E562E] dark:text-sky-400 font-mono text-lg sm:text-xl font-bold bg-[#D4AF37]/15 dark:bg-sky-500/20 px-1.5 py-0.5 rounded border border-[#D4AF37]/30 dark:border-sky-500/20">AI</span>
              </h1>
              <span className="hidden sm:inline-flex text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#EFE8DC] dark:bg-sky-950/70 text-[#8E562E] dark:text-sky-300 border border-[#E2D7C7] dark:border-sky-800/60 px-2 py-0.5 rounded-full">
                Official Portal
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#332421]/75 dark:text-slate-400 font-medium tracking-normal mt-0.5 truncate max-w-[90vw] sm:max-w-xl text-center">
              Statutory Label & Metric Compliance Verifier
            </p>
          </div>

          {/* System Telemetry - Positioned right on desktop */}
          <div className="hidden lg:flex items-center gap-3 absolute right-0 text-[11px]">
            <span className="text-[#2D5D4F] dark:text-emerald-400 flex items-center gap-1 font-medium bg-[#E7F0EB] dark:bg-emerald-950/40 border border-[#A3C6B9] dark:border-emerald-800/50 px-2.5 py-1 rounded-md">
              <Activity className="w-3 h-3" />
              <span>System Online</span>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation & Control Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-2">
          
          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 text-xs overflow-x-auto no-scrollbar py-1">
            <button
              id="nav-scanner-btn"
              onClick={() => onSelectTab('scanner')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all font-semibold cursor-pointer shrink-0 ${
                currentTab === 'scanner'
                  ? 'bg-[#8E562E] dark:bg-sky-500 text-white shadow-sm ring-2 ring-[#8E562E]/20 dark:ring-sky-500/20'
                  : 'text-[#332421] dark:text-slate-300 hover:text-[#8E562E] dark:hover:text-white hover:bg-[#EFE8DC] dark:hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Inspection & Scan</span>
              {activeAuditCount > 0 && (
                <span
                  id="nav-scanner-count-badge"
                  className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-all shrink-0 ${
                    currentTab === 'scanner' ? 'nav-badge-active' : 'nav-badge-inactive'
                  }`}
                >
                  {activeAuditCount}
                </span>
              )}
            </button>

            <button
              id="nav-dashboard-btn"
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all font-semibold cursor-pointer shrink-0 ${
                currentTab === 'dashboard'
                  ? 'bg-[#8E562E] dark:bg-sky-500 text-white shadow-sm ring-2 ring-[#8E562E]/20 dark:ring-sky-500/20'
                  : 'text-[#332421] dark:text-slate-300 hover:text-[#8E562E] dark:hover:text-white hover:bg-[#EFE8DC] dark:hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Enforcement Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
              {!currentUser && (
                <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  currentTab === 'dashboard' 
                    ? 'bg-[#794723] dark:bg-sky-600 text-white' 
                    : 'text-[#9E6B15] dark:text-amber-400 bg-[#FDF6E2] dark:bg-amber-950/60 border border-[#EBD28B] dark:border-amber-800/50'
                }`}>
                  <Lock className="w-2.5 h-2.5" />
                  <span className="hidden md:inline">Sign In</span>
                </span>
              )}
            </button>

            <button
              id="nav-rules-btn"
              onClick={() => onSelectTab('rules')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all font-semibold cursor-pointer shrink-0 ${
                currentTab === 'rules'
                  ? 'bg-[#8E562E] dark:bg-sky-500 text-white shadow-sm ring-2 ring-[#8E562E]/20 dark:ring-sky-500/20'
                  : 'text-[#332421] dark:text-slate-300 hover:text-[#8E562E] dark:hover:text-white hover:bg-[#EFE8DC] dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Rules & Standards</span>
              <span className="sm:hidden">Rules</span>
            </button>
          </nav>

          {/* User Status, Theme Switcher & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                id="theme-toggle-btn"
                onClick={onToggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2D7C7] dark:border-slate-700/80 hover:border-[#8E562E] dark:hover:border-sky-500 bg-[#EFE8DC] dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 text-[#332421] dark:text-slate-300 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-semibold hidden md:inline">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-[#332421] shrink-0" />
                    <span className="text-xs font-semibold text-[#332421] hidden md:inline">Dark Mode</span>
                  </>
                )}
              </button>
            )}

            {/* User Profile or Sign In CTA */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-[#EFE8DC] dark:bg-slate-900/90 border border-[#E2D7C7] dark:border-slate-800 rounded-lg px-2.5 py-1.5 shadow-2xs max-w-[180px] sm:max-w-[280px]">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  currentUser.role === 'official' ? 'bg-[#2D5D4F] dark:bg-emerald-500 ring-2 ring-[#2D5D4F]/20 dark:ring-emerald-500/20' : 'bg-[#8E562E] dark:bg-sky-500 ring-2 ring-[#8E562E]/20 dark:ring-sky-500/20'
                }`}></div>
                
                <div className="text-left min-w-0 flex-1 overflow-hidden">
                  <div className="text-xs font-bold text-[#332421] dark:text-slate-200 leading-tight truncate flex items-center gap-1">
                    <span className="truncate" title={currentUser.name}>{currentUser.name}</span>
                    {currentUser.role === 'official' && (
                      <span className="text-[9px] bg-[#E7F0EB] dark:bg-emerald-950/80 text-[#2D5D4F] dark:text-emerald-400 border border-[#A3C6B9] dark:border-emerald-800/60 px-1 py-0.2 rounded font-mono shrink-0">
                        {currentUser.governmentId || 'OFFICER'}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#332421]/70 dark:text-slate-400 uppercase tracking-wide truncate">
                    {currentUser.role === 'official' ? 'DoCA Officer' : 'Citizen Inspector'}
                  </div>
                </div>

                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  title="Sign out"
                  className="text-[#332421]/60 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1 rounded-md hover:bg-[#E5DACB] dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <button
                  id="nav-login-btn"
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 bg-[#8E562E] hover:bg-[#794723] dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm cursor-pointer active:scale-95 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
