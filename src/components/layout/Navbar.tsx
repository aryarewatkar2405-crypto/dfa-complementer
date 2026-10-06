import React from 'react';
import {
  Layers,
  BookOpen,
  Sparkles,
  Presentation,
} from 'lucide-react';

interface NavbarProps {
  onOpenMathModal: () => void;
  onOpenDemoMode: () => void;
  onScrollToWorkspace: () => void;
  onLoadExample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMathModal,
  onOpenDemoMode,
  onScrollToWorkspace,
  onLoadExample,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#07080b]/80 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="page-container h-16 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-brand-500/20 shrink-0">
            <div className="w-full h-full bg-[#090a10] rounded-[11px] flex items-center justify-center text-brand-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-white font-mono">
                DFA Complementer
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-950/90 text-brand-300 border border-brand-800/50">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden md:block">
              Validate · Complete · Complement · Verify
            </p>
          </div>
        </div>

        {/* Center / Right Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={onOpenMathModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-400" />
            <span className="hidden sm:inline">How It Works</span>
          </button>

          <button
            type="button"
            onClick={onLoadExample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Examples</span>
          </button>

          <button
            type="button"
            onClick={onOpenDemoMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 transition shadow"
            title="Interactive Step-by-Step Viva Presentation Mode"
          >
            <Presentation className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Presentation Mode</span>
          </button>

          <button
            type="button"
            onClick={onScrollToWorkspace}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold transition shadow-lg shadow-brand-900/40"
          >
            <span>Launch App</span>
            <span className="text-xs">→</span>
          </button>
        </div>
      </div>
    </header>
  );
};
