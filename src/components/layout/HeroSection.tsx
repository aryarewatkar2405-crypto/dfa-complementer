import React from 'react';
import type { DFA } from '../../types/dfa';
import { DFAVisualizer } from '../visualizer/DFAVisualizer';
import { ArrowRight, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onBuildClick: () => void;
  onTryExampleClick: () => void;
  onOpenTheoryClick: () => void;
  teaserDFA: DFA;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBuildClick,
  onTryExampleClick,
  onOpenTheoryClick,
  teaserDFA,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-14 pb-10 sm:pb-14 lg:pb-16 border-b border-white/[0.08] bg-gradient-to-b from-[#0c0d14] via-[#090a10] to-[#07080b]">
      {/* Subtle background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] max-w-full h-[300px] bg-brand-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-14 items-center">
          {/* Left Hero Copy */}
          <div className="space-y-4 sm:space-y-5 text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-800/60 shadow-sm max-w-full overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider text-brand-300 uppercase truncate">
                AUTOMATA TOOLKIT · DAA / TOC PROJECT
              </span>
            </div>

            {/* Main Heading with fluid sizing */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.2] sm:leading-[1.15]">
              Complement a DFA.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400">
                Instantly.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
              Validate your automaton structure, auto-fill missing transitions with trap states, generate its mathematical complement{' '}
              <span className="font-mono text-cyan-300 font-semibold inline-block">L(Mᶜ) = Σ* − L(M)</span>, and test strings with real-time step traversal.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={onBuildClick}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-brand-900/50 hover:shadow-brand-700/50 transition-all min-h-[44px]"
              >
                <span>Build a DFA</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onTryExampleClick}
                className="px-4 py-3 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 border border-white/[0.1] font-semibold flex items-center justify-center gap-2 transition min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Try Example</span>
              </button>

              <button
                type="button"
                onClick={onOpenTheoryClick}
                className="px-4 py-3 rounded-xl bg-transparent hover:bg-white/[0.04] text-slate-400 hover:text-slate-200 font-medium flex items-center justify-center gap-1.5 transition min-h-[44px]"
              >
                <BookOpen className="w-4 h-4 text-brand-400" />
                <span>Theory & Proof</span>
              </button>
            </div>

            {/* Key Feature Badges */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Auto Trap State</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>State Inversion (Fᶜ)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Step Animator</span>
              </div>
            </div>
          </div>

          {/* Right: Interactive Mini Visualizer Teaser */}
          <div className="h-[260px] sm:h-[300px] lg:h-[320px] w-full bg-dark-900/90 rounded-2xl border border-white/[0.1] shadow-2xl flex flex-col overflow-hidden">
            {/* Clean Non-Overlapping Header */}
            <div className="px-3 sm:px-4 py-2 bg-dark-850/90 border-b border-white/[0.08] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-cyan-300 truncate">
                  Interactive Live Preview
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 truncate">
                Prefix "01" with Trap
              </span>
            </div>

            {/* Visualizer Canvas Area */}
            <div className="flex-1 w-full relative touch-pan-pinch">
              <DFAVisualizer
                dfa={teaserDFA}
                viewMode="completed"
                isMiniPreview={true}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

