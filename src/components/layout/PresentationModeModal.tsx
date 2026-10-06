import React, { useState } from 'react';
import type { DFA } from '../../types/dfa';
import { DFAVisualizer } from '../visualizer/DFAVisualizer';
import {
  Presentation,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';

interface PresentationModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToWorkspace: (dfa: DFA) => void;
}

export const PresentationModeModal: React.FC<PresentationModeModalProps> = ({
  isOpen,
  onClose,
  onApplyToWorkspace,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  // Demo DFA definitions
  const rawDFA: DFA = {
    name: 'Prefix "01" (Incomplete)',
    states: ['q0', 'q1', 'q2'],
    alphabet: ['0', '1'],
    startState: 'q0',
    acceptStates: ['q2'],
    transitions: {
      q0: { '0': 'q1' },
      q1: { '1': 'q2' },
      q2: { '0': 'q2', '1': 'q2' },
    },
  };

  const completedDFA: DFA = {
    name: 'Prefix "01" (Auto-Completed)',
    states: ['q0', 'q1', 'q2', 'qTrap'],
    alphabet: ['0', '1'],
    startState: 'q0',
    acceptStates: ['q2'],
    trapStates: ['qTrap'],
    transitions: {
      q0: { '0': 'q1', '1': 'qTrap' },
      q1: { '0': 'qTrap', '1': 'q2' },
      q2: { '0': 'q2', '1': 'q2' },
      qTrap: { '0': 'qTrap', '1': 'qTrap' },
    },
  };

  const complementDFA: DFA = {
    name: 'Complement DFA (Mᶜ)',
    states: ['q0', 'q1', 'q2', 'qTrap'],
    alphabet: ['0', '1'],
    startState: 'q0',
    acceptStates: ['q0', 'q1', 'qTrap'],
    trapStates: ['qTrap'],
    transitions: completedDFA.transitions,
  };

  const steps = [
    {
      title: 'Step 1: Load Sample Automaton',
      subtitle: 'Language L = { w ∈ {0,1}* | w begins with "01" }',
      badge: 'Specification',
      dfa: rawDFA,
      explanation:
        'We define a 3-state DFA designed to accept binary strings starting with "01". State q0 advances to q1 on \'0\', and q1 advances to accepting state q2 on \'1\'.',
    },
    {
      title: 'Step 2: Formal Structural Validation',
      subtitle: 'Validating 5-tuple M = (Q, Σ, δ, q₀, F)',
      badge: 'Validation Engine',
      dfa: rawDFA,
      explanation:
        'The validation engine verifies Q = {q0, q1, q2}, Σ = {0, 1}, start state q0 ∈ Q, and final state q2 ∈ Q. All identifiers are syntactically sound.',
    },
    {
      title: 'Step 3: Missing Transitions Detected',
      subtitle: '2 undefined transitions found: δ(q0, 1) and δ(q1, 0)',
      badge: 'Incompleteness Warning',
      dfa: rawDFA,
      explanation:
        'Automata theory stipulates that complementation L(Mᶜ) = Σ* \\ L(M) is ONLY valid on complete DFAs. Without completion, undefined transitions would produce incorrect rejection in Mᶜ.',
    },
    {
      title: 'Step 4: Automatic Trap State Creation (qTrap)',
      subtitle: 'Complete DFA Construction with Dead State',
      badge: 'Auto-Completed DFA',
      dfa: completedDFA,
      explanation:
        'A trap state "qTrap" is instantiated with self-loops on all symbols: δ(qTrap, 0) = qTrap and δ(qTrap, 1) = qTrap. Missing transitions from q0 and q1 now route to qTrap. qTrap is non-accepting in M.',
    },
    {
      title: 'Step 5: Mathematical Complement Inversion',
      subtitle: 'Accepting Set Inversion: Fᶜ = Q \\ F',
      badge: 'Complement DFA (Mᶜ)',
      dfa: complementDFA,
      explanation:
        'Every accepting state becomes non-accepting, and every non-accepting state becomes accepting! New final set: Fᶜ = {q0, q1, qTrap}. Note that qTrap is now ACCEPTING in Mᶜ, correctly capturing all strings not starting with "01"!',
    },
    {
      title: 'Step 6: Empirical Verification & String Testing',
      subtitle: 'Verifying L(Mᶜ) = Σ* \\ L(M)',
      badge: 'Simulation Proof',
      dfa: complementDFA,
      explanation:
        '• String "01" -> Accepted in Original M (reaches q2 ∈ F), Rejected in Mᶜ (q2 ∉ Fᶜ).\n• String "10" -> Enters qTrap. Rejected in Original M, Accepted in Mᶜ (qTrap ∈ Fᶜ).\n• Empty string ε -> Stopped in q0. Rejected in M, Accepted in Mᶜ (q0 ∈ Fᶜ).',
    },
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-dark-900 border border-white/[0.1] rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 sm:pb-4 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-700/60 text-indigo-400 shrink-0">
              <Presentation className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-100 font-mono">
                  Presentation & Demonstration Mode
                </h2>
                <span className="text-[9px] sm:text-[10px] bg-brand-950 text-brand-300 px-2 py-0.5 rounded border border-brand-800 font-mono font-bold shrink-0">
                  {currentStep + 1}/{steps.length}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono hidden sm:block">
                Interactive walk-through for Academic Evaluation & Viva
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close Presentation Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all min-h-[8px] ${
                currentStep === idx
                  ? 'bg-brand-500 ring-2 ring-brand-400 shadow-md shadow-brand-500/30'
                  : currentStep > idx
                  ? 'bg-emerald-500'
                  : 'bg-dark-750'
              }`}
              title={`Jump to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Active Step Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-center">
          {/* Left: Step Info & Explanation */}
          <div className="md:col-span-5 space-y-2.5 sm:space-y-3 font-mono">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-950/80 px-2.5 py-1 rounded border border-brand-800/60">
              {current.badge}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              {current.title}
            </h3>
            <p className="text-xs text-cyan-400 font-semibold">
              {current.subtitle}
            </p>
            <div className="bg-dark-850 p-3 sm:p-3.5 rounded-xl border border-white/[0.06] text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {current.explanation}
            </div>
          </div>

          {/* Right: Live Interactive Graph Preview */}
          <div className="md:col-span-7 h-[220px] sm:h-[260px] md:h-[280px] touch-pan-pinch">
            <DFAVisualizer
              dfa={current.dfa}
              title={current.dfa.name}
              viewMode={
                currentStep === 4 || currentStep === 5
                  ? 'complement'
                  : currentStep === 3
                  ? 'completed'
                  : 'original'
              }
              isMiniPreview={true}
            />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-white/[0.08] font-mono text-xs">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-dark-800 text-slate-300 hover:text-white disabled:opacity-30 transition min-h-[38px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous Step
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onApplyToWorkspace(current.dfa);
                onClose();
              }}
              className="px-3 py-2 rounded-lg bg-dark-750 hover:bg-dark-700 text-slate-200 border border-white/[0.08] text-center transition min-h-[38px]"
            >
              Apply to Workspace
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold transition shadow-lg shadow-brand-900/40 min-h-[38px]"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition min-h-[38px]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish Demo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

