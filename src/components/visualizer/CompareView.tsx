import React from 'react';
import type { DFA } from '../../types/dfa';
import { DFAVisualizer } from './DFAVisualizer';
import { ArrowRight, ArrowLeftRight, Check, X, Sparkles } from 'lucide-react';

interface CompareViewProps {
  originalDFA?: DFA;
  completedDFA: DFA;
  complementDFA: DFA;
}

export const CompareView: React.FC<CompareViewProps> = ({
  completedDFA,
  complementDFA,
}) => {
  const allStates = completedDFA.states;
  const originalAcceptSet = new Set(completedDFA.acceptStates);
  const complementAcceptSet = new Set(complementDFA.acceptStates);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Mathematical Inversion Banner */}
      <div className="p-4 bg-gradient-to-r from-dark-850 via-dark-800 to-dark-850 border border-white/[0.08] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-xs uppercase tracking-wider text-brand-300 font-semibold font-mono">
              Mathematical State Inversion
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-200 mt-1">
            Accepting State Transformation: <span className="font-mono text-emerald-400 font-bold">Fᶜ = Q \ F</span>
          </h3>
        </div>

        {/* Quick Formal Summary */}
        <div className="flex items-center gap-4 text-xs font-mono bg-dark-900/90 px-3 py-2 rounded-lg border border-white/[0.06]">
          <div>
            <span className="text-slate-400 block text-[10px]">ORIGINAL F:</span>
            <span className="text-emerald-400 font-semibold">
              {'{' + completedDFA.acceptStates.join(', ') + '}'}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <div>
            <span className="text-slate-400 block text-[10px]">COMPLEMENT Fᶜ:</span>
            <span className="text-brand-400 font-semibold">
              {'{' + complementDFA.acceptStates.join(', ') + '}'}
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[420px]">
        {/* Left: Completed DFA */}
        <div className="flex flex-col bg-dark-900 border border-white/[0.08] rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <span className="text-xs font-bold text-slate-200 tracking-wide font-mono">
                COMPLETED DFA (M)
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              Accepting: {completedDFA.acceptStates.length} / {completedDFA.states.length}
            </span>
          </div>
          <div className="flex-1 min-h-[340px]">
            <DFAVisualizer
              dfa={completedDFA}
              title="Complete Original DFA (M)"
              viewMode="completed"
              isMiniPreview={false}
            />
          </div>
        </div>

        {/* Right: Complement DFA */}
        <div className="flex flex-col bg-dark-900 border border-white/[0.08] rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 ring-2 ring-brand-500/20" />
              <span className="text-xs font-bold text-slate-200 tracking-wide font-mono">
                COMPLEMENT DFA (Mᶜ)
              </span>
            </div>
            <span className="text-[11px] text-brand-400 font-mono bg-brand-950/60 px-2 py-0.5 rounded border border-brand-800/50">
              Accepting: {complementDFA.acceptStates.length} / {complementDFA.states.length}
            </span>
          </div>
          <div className="flex-1 min-h-[340px]">
            <DFAVisualizer
              dfa={complementDFA}
              title="Complement DFA (Mᶜ)"
              viewMode="complement"
              isMiniPreview={false}
            />
          </div>
        </div>
      </div>

      {/* State Inversion Diff Table */}
      <div className="bg-dark-900 border border-white/[0.08] rounded-xl p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-3 flex items-center gap-2">
          <ArrowLeftRight className="w-3.5 h-3.5 text-brand-400" />
          State Status Comparison Table
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 bg-white/[0.02]">
                <th className="py-2 px-3">State q ∈ Q</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3 text-center">Complete DFA (M)</th>
                <th className="py-2 px-3 text-center">Inverted Status</th>
                <th className="py-2 px-3 text-center">Complement DFA (Mᶜ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {allStates.map((state) => {
                const wasAccepting = originalAcceptSet.has(state);
                const isNowAccepting = complementAcceptSet.has(state);
                const isTrap = completedDFA.trapStates?.includes(state);
                const isStart = completedDFA.startState === state;

                return (
                  <tr key={state} className="hover:bg-white/[0.02] transition">
                    <td className="py-2.5 px-3 font-bold text-slate-200 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isTrap ? 'bg-purple-500' : isStart ? 'bg-cyan-400' : 'bg-slate-400'
                        }`}
                      />
                      {state}
                      {isStart && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                          START
                        </span>
                      )}
                      {isTrap && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                          TRAP
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {isTrap
                        ? 'Dead state (Self-loops)'
                        : isStart
                        ? 'Initial state'
                        : 'Standard state'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {wasAccepting ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                          <Check className="w-3 h-3" /> ACCEPTING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/40">
                          <X className="w-3 h-3" /> NON-ACCEPTING
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500">
                      <ArrowRight className="w-3.5 h-3.5 mx-auto text-brand-400" />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isNowAccepting ? (
                        <span className="inline-flex items-center gap-1 text-brand-300 bg-brand-950/80 px-2 py-0.5 rounded border border-brand-700/60 font-semibold shadow-sm">
                          <Check className="w-3 h-3" /> ACCEPTING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                          <X className="w-3 h-3" /> NON-ACCEPTING
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
