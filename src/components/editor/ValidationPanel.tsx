import React, { useState } from 'react';
import type { DFA, DFAValidationResult } from '../../types/dfa';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wand2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ValidationPanelProps {
  dfa?: DFA;
  validationResult: DFAValidationResult;
  onAutoComplete: () => void;
  onGenerateComplement: () => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validationResult,
  onAutoComplete,
  onGenerateComplement,
}) => {
  const [showMissingDetails, setShowMissingDetails] = useState(true);

  const { isValid, isComplete, errors, warnings, missingTransitions } =
    validationResult;

  return (
    <div className="bg-dark-900 border border-white/[0.08] rounded-xl p-4 shadow-xl space-y-4">
      {/* Validation Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isValid && isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : isValid && !isComplete ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}

          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-100 flex items-center gap-2">
              Automata Validation Status
            </h3>
            <p
              className={`text-xs font-semibold font-mono ${
                isValid && isComplete
                  ? 'text-emerald-400'
                  : isValid && !isComplete
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {validationResult.summary}
            </p>
          </div>
        </div>

        {/* Status Pill Badge */}
        <span
          className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full border ${
            isValid && isComplete
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
              : isValid && !isComplete
              ? 'bg-amber-950/70 text-amber-300 border-amber-700/60 animate-pulse'
              : 'bg-rose-950/70 text-rose-300 border-rose-700/60'
          }`}
        >
          {isValid && isComplete
            ? 'Complete'
            : isValid && !isComplete
            ? 'Needs Trap State'
            : 'Invalid'}
        </span>
      </div>

      {/* Errors Display */}
      {errors.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-800/40 rounded-lg p-3 space-y-2">
          <span className="text-xs font-bold text-rose-300 font-mono flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            Structural Errors ({errors.length}):
          </span>
          <ul className="text-xs font-mono text-rose-200/90 space-y-1 pl-4 list-disc">
            {errors.map((err, idx) => (
              <li key={idx}>
                <span className="font-semibold text-rose-300 uppercase text-[10px] mr-1">
                  [{err.field}]
                </span>
                {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-2.5 text-xs font-mono text-amber-300/90">
          <ul className="list-disc pl-4 space-y-0.5">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Incomplete DFA Banner + Missing Transitions Breakdown */}
      {isValid && !isComplete && (
        <div className="bg-gradient-to-b from-dark-850 to-dark-800 border border-amber-500/30 rounded-xl p-4 space-y-3 shadow-inner">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                {missingTransitions.length} Missing Transition{missingTransitions.length > 1 ? 's' : ''} Detected
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Complementation requires a complete DFA. Unspecified transitions must route to a non-accepting trap/dead state.
              </p>
            </div>
            <button
              onClick={() => setShowMissingDetails(!showMissingDetails)}
              className="text-slate-400 hover:text-slate-200 text-xs p-1"
            >
              {showMissingDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Missing items list */}
          {showMissingDetails && (
            <div className="grid grid-cols-2 gap-2 bg-dark-900/80 p-2.5 rounded-lg border border-white/[0.06] text-xs font-mono">
              {missingTransitions.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-dark-800/90 px-2.5 py-1.5 rounded border border-amber-500/20 text-slate-200"
                >
                  <span>
                    δ(<strong className="text-amber-300">{m.fromState}</strong>, '{m.symbol}')
                  </span>
                  <span className="text-slate-400 text-[10px]">→ undefined</span>
                </div>
              ))}
            </div>
          )}

          {/* Auto-Complete Action Button */}
          <button
            type="button"
            onClick={onAutoComplete}
            className="w-full bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white py-2.5 px-4 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 transition shadow-lg shadow-brand-900/40"
          >
            <Wand2 className="w-4 h-4" />
            Auto-Complete with Trap State (qTrap)
          </button>
        </div>
      )}

      {/* Complement Generation CTA */}
      {isValid && (
        <div className="pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onGenerateComplement}
            className="w-full bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white py-3 px-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-900/50 hover:shadow-brand-700/50"
          >
            <Sparkles className="w-4 h-4 text-brand-200" />
            Generate Mathematical Complement
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
