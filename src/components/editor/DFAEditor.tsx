import React, { useState } from 'react';
import type { DFA } from '../../types/dfa';
import { DFA_PRESETS } from '../../core/dfaPresets';
import {
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
  Layers,
  Binary,
  Flag,
  CheckSquare,
} from 'lucide-react';

interface DFAEditorProps {
  dfa: DFA;
  onChange: (newDFA: DFA) => void;
  onReset: () => void;
  onLoadPreset: (presetId: string) => void;
}

export const DFAEditor: React.FC<DFAEditorProps> = ({
  dfa,
  onChange,
  onReset,
  onLoadPreset,
}) => {
  const [newStateInput, setNewStateInput] = useState('');
  const [newSymbolInput, setNewSymbolInput] = useState('');
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Add state
  const handleAddState = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newStateInput.trim();
    if (!clean) return;
    if (dfa.states.includes(clean)) return;

    const newStates = [...dfa.states, clean];
    const newTransitions = { ...dfa.transitions, [clean]: {} };

    onChange({
      ...dfa,
      states: newStates,
      startState: dfa.startState || clean,
      transitions: newTransitions,
    });
    setNewStateInput('');
  };

  // Remove state
  const handleRemoveState = (stateToRemove: string) => {
    const newStates = dfa.states.filter((s) => s !== stateToRemove);
    const newAccept = dfa.acceptStates.filter((s) => s !== stateToRemove);
    const newStart =
      dfa.startState === stateToRemove ? newStates[0] || '' : dfa.startState;

    const newTransitions: Record<string, Record<string, string>> = {};
    for (const [s, symMap] of Object.entries(dfa.transitions)) {
      if (s === stateToRemove) continue;
      newTransitions[s] = {};
      for (const [sym, target] of Object.entries(symMap)) {
        if (target !== stateToRemove) {
          newTransitions[s][sym] = target;
        }
      }
    }

    onChange({
      ...dfa,
      states: newStates,
      startState: newStart,
      acceptStates: newAccept,
      transitions: newTransitions,
    });
  };

  // Add alphabet symbol
  const handleAddSymbol = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newSymbolInput.trim();
    if (!clean) return;
    if (dfa.alphabet.includes(clean)) return;

    onChange({
      ...dfa,
      alphabet: [...dfa.alphabet, clean],
    });
    setNewSymbolInput('');
  };

  // Remove alphabet symbol
  const handleRemoveSymbol = (symbolToRemove: string) => {
    const newAlphabet = dfa.alphabet.filter((sym) => sym !== symbolToRemove);
    const newTransitions: Record<string, Record<string, string>> = {};

    for (const [s, symMap] of Object.entries(dfa.transitions)) {
      newTransitions[s] = {};
      for (const [sym, target] of Object.entries(symMap)) {
        if (sym !== symbolToRemove) {
          newTransitions[s][sym] = target;
        }
      }
    }

    onChange({
      ...dfa,
      alphabet: newAlphabet,
      transitions: newTransitions,
    });
  };

  // Toggle accept state
  const handleToggleAcceptState = (state: string) => {
    const isAccepting = dfa.acceptStates.includes(state);
    const newAccept = isAccepting
      ? dfa.acceptStates.filter((s) => s !== state)
      : [...dfa.acceptStates, state];

    onChange({
      ...dfa,
      acceptStates: newAccept,
    });
  };

  // Update transition cell
  const handleTransitionChange = (
    fromState: string,
    symbol: string,
    targetState: string
  ) => {
    const newTransitions = { ...dfa.transitions };
    if (!newTransitions[fromState]) {
      newTransitions[fromState] = {};
    }

    if (!targetState) {
      delete newTransitions[fromState][symbol];
    } else {
      newTransitions[fromState][symbol] = targetState;
    }

    onChange({
      ...dfa,
      transitions: newTransitions,
    });
  };

  // Export JSON
  const handleOpenExport = () => {
    setJsonText(JSON.stringify(dfa, null, 2));
    setJsonError(null);
    setShowJsonModal(true);
  };

  // Import JSON
  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.states || !parsed.alphabet || !parsed.transitions) {
        throw new Error('JSON must contain "states", "alphabet", and "transitions".');
      }
      onChange(parsed);
      setShowJsonModal(false);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON format');
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 border border-white/[0.08] rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-dark-850">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-brand-400" />
            DFA Definition Editor
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure 5-tuple: M = (Q, Σ, δ, q0, F)
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleOpenExport}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] rounded-md transition"
            title="Import / Export JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/[0.06] rounded-md transition"
            title="Reset DFA to default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Preset Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Quick Presets
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) onLoadPreset(e.target.value);
            }}
            defaultValue=""
            className="w-full bg-dark-800 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
          >
            <option value="" disabled>
              Select an educational preset...
            </option>
            {DFA_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* 1. States Q */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              States Q = {'{' + dfa.states.join(', ') + '}'}
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              {dfa.states.length} state{dfa.states.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* State Chips */}
          <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-dark-850 rounded-lg border border-white/[0.06]">
            {dfa.states.map((st) => (
              <span
                key={st}
                className="inline-flex items-center gap-1.5 bg-dark-750 text-slate-200 border border-white/[0.08] px-2.5 py-1 rounded-md text-xs font-mono font-medium"
              >
                {st}
                {dfa.startState === st && (
                  <span className="text-[9px] text-cyan-400 font-bold bg-cyan-950/60 px-1 rounded">
                    START
                  </span>
                )}
                {dfa.acceptStates.includes(st) && (
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/60 px-1 rounded">
                    FINAL
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveState(st)}
                  className="text-slate-400 hover:text-rose-400 transition"
                  title={`Remove ${st}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add State Input */}
          <form onSubmit={handleAddState} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. q3"
              value={newStateInput}
              onChange={(e) => setNewStateInput(e.target.value)}
              className="flex-1 bg-dark-800 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium font-mono flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>
        </div>

        {/* 2. Alphabet Σ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
              <Binary className="w-3.5 h-3.5 text-cyan-400" />
              Alphabet Σ = {'{' + dfa.alphabet.join(', ') + '}'}
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              {dfa.alphabet.length} symbol{dfa.alphabet.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Alphabet Chips */}
          <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-dark-850 rounded-lg border border-white/[0.06]">
            {dfa.alphabet.map((sym) => (
              <span
                key={sym}
                className="inline-flex items-center gap-1.5 bg-dark-750 text-cyan-300 border border-cyan-500/20 px-2.5 py-1 rounded-md text-xs font-mono font-bold"
              >
                '{sym}'
                <button
                  type="button"
                  onClick={() => handleRemoveSymbol(sym)}
                  className="text-slate-400 hover:text-rose-400 transition ml-0.5"
                  title={`Remove symbol ${sym}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Symbol Input */}
          <form onSubmit={handleAddSymbol} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 0, 1, a, b"
              value={newSymbolInput}
              onChange={(e) => setNewSymbolInput(e.target.value)}
              className="flex-1 bg-dark-800 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium font-mono flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>
        </div>

        {/* 3. Start State q0 and Accepting States F */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Start State */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 font-mono mb-1.5 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-cyan-400" />
              Start State (q0)
            </label>
            <select
              value={dfa.startState}
              onChange={(e) => onChange({ ...dfa, startState: e.target.value })}
              className="w-full bg-dark-800 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
            >
              {dfa.states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Accepting States Multi-Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 font-mono mb-1.5 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              Accepting States (F)
            </label>
            <div className="flex flex-wrap gap-1 bg-dark-800 p-1.5 rounded-lg border border-white/[0.08] max-h-24 overflow-y-auto">
              {dfa.states.map((s) => {
                const isAccept = dfa.acceptStates.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleToggleAcceptState(s)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition ${
                      isAccept
                        ? 'bg-emerald-600 text-white font-bold ring-1 ring-emerald-400'
                        : 'bg-dark-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Transition Matrix Table δ */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
              Transition Function Matrix δ: Q × Σ → Q
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              Leave blank for incomplete
            </span>
          </div>

          <div className="overflow-x-auto border border-white/[0.08] rounded-lg bg-dark-850">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-dark-800 text-slate-400">
                  <th className="py-2 px-3">State</th>
                  {dfa.alphabet.map((sym) => (
                    <th key={sym} className="py-2 px-3 text-cyan-300 font-bold">
                      '{sym}'
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {dfa.states.map((st) => (
                  <tr key={st} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 font-bold text-slate-200 bg-dark-800/50">
                      {st}
                    </td>
                    {dfa.alphabet.map((sym) => {
                      const currentTarget = dfa.transitions[st]?.[sym] || '';
                      return (
                        <td key={sym} className="py-1.5 px-2">
                          <select
                            value={currentTarget}
                            onChange={(e) =>
                              handleTransitionChange(st, sym, e.target.value)
                            }
                            className={`w-full bg-dark-900 border rounded px-2 py-1 text-xs font-mono focus:outline-none ${
                              currentTarget
                                ? 'border-white/[0.1] text-slate-100'
                                : 'border-amber-500/40 text-amber-300/80 bg-amber-950/10'
                            }`}
                          >
                            <option value="">(missing)</option>
                            {dfa.states.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Import / Export JSON Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-white/[0.1] rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-400" />
                Import / Export DFA JSON
              </h3>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={10}
                className="w-full bg-dark-950 border border-white/[0.08] rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500"
              />
              {jsonError && (
                <p className="text-xs text-rose-400 font-mono">{jsonError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyJson}
                className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold font-mono rounded-lg transition shadow"
              >
                Apply JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
