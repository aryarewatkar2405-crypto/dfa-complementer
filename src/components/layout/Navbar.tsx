import React, { useState } from 'react';
import {
  Layers,
  BookOpen,
  Sparkles,
  Presentation,
  Menu,
  X,
  ArrowRight,
  Download,
} from 'lucide-react';

interface NavbarProps {
  onOpenMathModal: () => void;
  onOpenDemoMode: () => void;
  onScrollToWorkspace: () => void;
  onLoadExample: () => void;
  isInstallable?: boolean;
  onInstallClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMathModal,
  onOpenDemoMode,
  onScrollToWorkspace,
  onLoadExample,
  isInstallable,
  onInstallClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07080b]/90 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="page-container h-16 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-brand-500/20 shrink-0">
            <div className="w-full h-full bg-[#090a10] rounded-[11px] flex items-center justify-center text-brand-400">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white font-mono">
                DFA Complementer
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-950/90 text-brand-300 border border-brand-800/50">
                v2.0
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono hidden md:block">
              Validate · Complete · Complement · Verify
            </p>
          </div>
        </div>

        {/* Desktop Navigation Actions (lg and up) */}
        <div className="hidden lg:flex items-center gap-2 sm:gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={onOpenMathModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition min-h-[38px]"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-400" />
            <span>How It Works</span>
          </button>

          <button
            type="button"
            onClick={onLoadExample}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition min-h-[38px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Examples</span>
          </button>

          <button
            type="button"
            onClick={onOpenDemoMode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 transition shadow min-h-[38px]"
            title="Interactive Step-by-Step Viva Presentation Mode"
          >
            <Presentation className="w-3.5 h-3.5 text-indigo-400" />
            <span>Presentation Mode</span>
          </button>

          {isInstallable && onInstallClick && (
            <button
              type="button"
              onClick={onInstallClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 transition shadow min-h-[38px]"
              title="Install DFA Complementer as App"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Install App</span>
            </button>
          )}

          <button
            type="button"
            onClick={onScrollToWorkspace}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold transition shadow-lg shadow-brand-900/40 min-h-[38px]"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile & Tablet Action Bar (< lg) */}
        <div className="flex lg:hidden items-center gap-2 font-mono text-xs">
          {isInstallable && onInstallClick && (
            <button
              type="button"
              onClick={onInstallClick}
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-semibold text-[11px] transition shadow"
              title="Install DFA Complementer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Install</span>
            </button>
          )}

          <button
            type="button"
            onClick={onScrollToWorkspace}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-[11px] transition shadow"
          >
            <span>Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-dark-800 border border-white/[0.1] text-slate-200 hover:text-white transition min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#090a10]/95 backdrop-blur-2xl px-4 py-3 space-y-2 font-mono text-xs shadow-2xl animate-in slide-in-from-top-2 duration-150">
          {isInstallable && onInstallClick && (
            <button
              type="button"
              onClick={() => {
                onInstallClick();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-emerald-950/80 text-emerald-200 border border-emerald-700/50 text-left transition min-h-[44px]"
            >
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Install DFA Complementer App</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onOpenMathModal();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-white/[0.06] text-left transition min-h-[44px]"
          >
            <BookOpen className="w-4 h-4 text-brand-400 shrink-0" />
            <span>How It Works (Theory & Proof)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onLoadExample();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-white/[0.06] text-left transition min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Load Educational Examples</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenDemoMode();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-indigo-950/80 text-indigo-200 border border-indigo-700/50 text-left transition min-h-[44px]"
          >
            <Presentation className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Viva Presentation Mode (6 Steps)</span>
          </button>
        </div>
      )}
    </header>
  );
};


