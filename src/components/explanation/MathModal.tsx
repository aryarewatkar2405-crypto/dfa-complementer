import React from 'react';
import { BookOpen, ShieldAlert, X } from 'lucide-react';

interface MathModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MathModal: React.FC<MathModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-dark-900 border border-white/[0.1] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-950 border border-brand-800/50 text-brand-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">
                Formal Automata Theory & Proof
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Design & Analysis of Algorithms / Theory of Computation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 text-xs text-slate-300 font-mono leading-relaxed max-h-[65vh] overflow-y-auto pr-2">
          {/* Section 1: Definition */}
          <div className="bg-dark-850 p-4 rounded-xl border border-white/[0.06] space-y-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              1. Formal Definition of a DFA
            </h3>
            <p className="text-slate-300">
              A Deterministic Finite Automaton is formally represented as a 5-tuple:
            </p>
            <div className="bg-dark-950 p-3 rounded-lg border border-white/[0.06] text-cyan-300 font-bold text-center text-sm">
              M = (Q, Σ, δ, q₀, F)
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong className="text-slate-200">Q</strong>: A finite set of internal states.</li>
              <li><strong className="text-slate-200">Σ</strong>: A finite set of input symbols (the alphabet).</li>
              <li><strong className="text-slate-200">δ</strong>: The transition function δ: Q × Σ → Q.</li>
              <li><strong className="text-slate-200">q₀</strong>: The initial start state (q₀ ∈ Q).</li>
              <li><strong className="text-slate-200">F</strong>: The set of final accepting states (F ⊆ Q).</li>
            </ul>
          </div>

          {/* Section 2: Mathematical Complement */}
          <div className="bg-dark-850 p-4 rounded-xl border border-white/[0.06] space-y-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              2. The Complement Operation
            </h3>
            <p>
              The language accepted by the complement automaton <strong className="text-brand-300">Mᶜ</strong> consists of all strings over Σ* that are <em className="text-slate-100">not</em> accepted by <strong className="text-slate-100">M</strong>:
            </p>
            <div className="bg-dark-950 p-3 rounded-lg border border-white/[0.06] text-brand-300 font-bold text-center text-sm">
              L(Mᶜ) = Σ* \ L(M)
            </div>
            <p>
              For a <em>complete</em> DFA, the complement automaton is constructed by swapping the accepting states:
            </p>
            <div className="bg-dark-950 p-3 rounded-lg border border-white/[0.06] text-emerald-300 font-bold text-center text-sm">
              Mᶜ = (Q, Σ, δ, q₀, Q \ F)
            </div>
            <p className="text-slate-400 text-[11px]">
              Every accepting state in M becomes non-accepting in Mᶜ, and every non-accepting state in M becomes accepting in Mᶜ.
            </p>
          </div>

          {/* Section 3: The Completeness Requirement & Trap States */}
          <div className="bg-dark-850 p-4 rounded-xl border border-white/[0.06] space-y-2">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              3. Crucial Rule: Why Incomplete DFAs Fail Without a Trap State
            </h3>
            <p className="text-slate-300">
              If an automaton has missing transitions, a string reading an undefined symbol <strong className="text-amber-300">halts immediately</strong> and is rejected by default in M.
            </p>
            <p className="text-slate-300">
              If we naively swapped F without completing the DFA, that string would <em>still</em> halt prematurely and be rejected in Mᶜ — violating <span className="text-brand-300 font-bold">L(Mᶜ) = Σ* \ L(M)</span>!
            </p>
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-3 text-[11px] space-y-1.5 text-amber-200">
              <p className="font-bold text-amber-300">Trap State Solution (qTrap):</p>
              <p>1. Create a non-accepting state <code className="text-purple-300">qTrap ∉ F</code>.</p>
              <p>2. For every missing transition δ(q, a), assign <code className="text-purple-300">δ(q, a) = qTrap</code>.</p>
              <p>3. Add self-loops for all symbols: <code className="text-purple-300">δ(qTrap, a) = qTrap, ∀ a ∈ Σ</code>.</p>
              <p>4. Upon complementation, <code className="text-purple-300">qTrap</code> becomes an <strong>accepting state</strong> in Mᶜ, correctly accepting all strings with undefined paths in M.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-mono font-semibold transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
