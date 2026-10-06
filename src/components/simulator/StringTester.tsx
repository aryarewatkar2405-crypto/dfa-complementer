import React, { useState, useEffect, useRef } from 'react';
import type { DFA, TestCase } from '../../types/dfa';
import { simulateDFA } from '../../core/dfaOperations';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ListPlus,
  Trash2,
} from 'lucide-react';

interface StringTesterProps {
  originalDFA?: DFA;
  completedDFA: DFA;
  complementDFA: DFA;
  currentStepIndex: number;
  onStepChange: (
    stepIndex: number,
    stateId: string | null,
    edgeId: string | null
  ) => void;
  sampleTestCases?: string[];
}

export const StringTester: React.FC<StringTesterProps> = ({
  completedDFA,
  complementDFA,
  currentStepIndex,
  onStepChange,
}) => {
  const [inputString, setInputString] = useState('01');
  const [activeTab, setActiveTab] = useState<'single' | 'suite'>('single');

  // Interactive Animation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(800); // ms per step
  const timerRef = useRef<any>(null);

  // Test Suite List
  const [testSuite, setTestSuite] = useState<TestCase[]>([
    { id: '1', input: 'ε', description: 'Empty string (zero length)' },
    { id: '2', input: '01', description: 'Sample pattern' },
    { id: '3', input: '10', description: 'Alternative sequence' },
    { id: '4', input: '000', description: 'Prefix repetition' },
    { id: '5', input: '111', description: 'Suffix repetition' },
  ]);
  const [newTestCaseInput, setNewTestCaseInput] = useState('');

  // Run simulation on input string
  const simOriginal = simulateDFA(completedDFA, inputString);
  const simComplement = simulateDFA(complementDFA, inputString);

  // Sync step change
  useEffect(() => {
    if (!simOriginal.isValidInput || simOriginal.steps.length === 0) {
      onStepChange(0, null, null);
      return;
    }

    const currentStep = simOriginal.steps[currentStepIndex] || simOriginal.steps[0];
    let edgeId: string | null = null;

    if (currentStep.symbolConsumed && currentStep.nextState) {
      edgeId = `${currentStep.currentState}->${currentStep.nextState}`;
    }

    onStepChange(currentStepIndex, currentStep.currentState, edgeId);
  }, [currentStepIndex, simOriginal, onStepChange]);

  // Autoplay loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < simOriginal.steps.length - 1) {
          onStepChange(
            currentStepIndex + 1,
            simOriginal.steps[currentStepIndex + 1].currentState,
            null
          );
        } else {
          setIsPlaying(false);
        }
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, simOriginal.steps, playbackSpeed, onStepChange]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (currentStepIndex >= simOriginal.steps.length - 1) {
      onStepChange(0, simOriginal.steps[0]?.currentState || null, null);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < simOriginal.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      onStepChange(nextIdx, simOriginal.steps[nextIdx].currentState, null);
    }
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      onStepChange(prevIdx, simOriginal.steps[prevIdx].currentState, null);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    onStepChange(0, simOriginal.steps[0]?.currentState || null, null);
  };

  // Add test case
  const handleAddTestCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestCaseInput.trim()) return;
    setTestSuite((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        input: newTestCaseInput.trim(),
      },
    ]);
    setNewTestCaseInput('');
  };

  const handleRemoveTestCase = (id: string) => {
    setTestSuite((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="bg-dark-900 border border-white/[0.08] rounded-xl p-4 shadow-xl space-y-4">
      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
              activeTab === 'single'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            Live String Simulator
          </button>
          <button
            onClick={() => setActiveTab('suite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
              activeTab === 'suite'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            Batch Test Suite ({testSuite.length})
          </button>
        </div>

        {/* Epsilon badge helper */}
        <button
          onClick={() => {
            setInputString('ε');
            handleReset();
          }}
          className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-1 rounded border border-cyan-800/40 transition"
          title="Insert Epsilon (Empty String)"
        >
          Insert ε
        </button>
      </div>

      {activeTab === 'single' ? (
        <div className="space-y-4">
          {/* String Input Bar */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 font-mono flex items-center justify-between">
              <span>Input String (w ∈ Σ*)</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Alphabet: {'{' + completedDFA.alphabet.join(', ') + '}'}
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputString}
                onChange={(e) => {
                  setInputString(e.target.value);
                  handleReset();
                }}
                placeholder="Enter string (e.g. 0101, or ε)"
                className="flex-1 bg-dark-800 border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 tracking-wider focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 bg-dark-750 hover:bg-dark-700 text-slate-300 rounded-lg text-xs font-mono transition"
                title="Reset Traversal"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Invalid Symbol Alert */}
          {!simOriginal.isValidInput && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg flex items-center gap-2.5 text-rose-200 text-xs font-mono">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{simOriginal.reason}</span>
            </div>
          )}

          {/* Valid Simulation Results Summary */}
          {simOriginal.isValidInput && (
            <>
              {/* Acceptance Cards Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {/* Completed DFA Status */}
                <div
                  className={`p-3 rounded-lg border font-mono transition ${
                    simOriginal.isAccepted
                      ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Original DFA (M)
                    </span>
                    {simOriginal.isAccepted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="text-sm font-bold tracking-wide">
                    {simOriginal.isAccepted ? 'ACCEPTED' : 'REJECTED'}
                  </div>
                </div>

                {/* Complement DFA Status */}
                <div
                  className={`p-3 rounded-lg border font-mono transition ${
                    simComplement.isAccepted
                      ? 'bg-brand-950/50 border-brand-600/70 text-brand-200'
                      : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Complement DFA (Mᶜ)
                    </span>
                    {simComplement.isAccepted ? (
                      <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="text-sm font-bold tracking-wide">
                    {simComplement.isAccepted ? 'ACCEPTED' : 'REJECTED'}
                  </div>
                </div>
              </div>

              {/* Traversal Path Trace */}
              <div className="bg-dark-850 p-3 rounded-lg border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-semibold">State Traversal Path:</span>
                  <span className="text-[11px] text-cyan-400">
                    Step {currentStepIndex} of {simOriginal.steps.length - 1}
                  </span>
                </div>

                {/* Path Nodes Flow with horizontal scrolling */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full touch-pan-pinch">
                  {simOriginal.path.map((st, idx) => {
                    const isCurrent = currentStepIndex === idx;
                    const isTrap = completedDFA.trapStates?.includes(st);
                    const isFinal = idx === simOriginal.path.length - 1;

                    return (
                      <React.Fragment key={idx}>
                        <span
                          className={`px-2 py-1 rounded text-xs font-mono font-bold shrink-0 transition-all ${
                            isCurrent
                              ? 'bg-cyan-500 text-black ring-2 ring-cyan-400 shadow-md scale-105'
                              : isTrap
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-dark-750 text-slate-300 border border-white/[0.08]'
                          }`}
                        >
                          {st}
                          {isFinal && (
                            <span className="ml-1 text-[9px] opacity-75">
                              (final)
                            </span>
                          )}
                        </span>
                        {idx < simOriginal.path.length - 1 && (
                          <span className="text-slate-500 text-xs font-mono font-bold shrink-0">
                            →
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-400 font-mono leading-relaxed pt-1 border-t border-white/[0.04]">
                  {simOriginal.reason}
                </p>
              </div>

              {/* Traversal Step Controller */}
              <div className="bg-dark-850 p-3 rounded-lg border border-white/[0.06] flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleStepBack}
                    disabled={currentStepIndex === 0}
                    className="p-2 bg-dark-750 hover:bg-dark-700 disabled:opacity-30 rounded text-slate-300 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Step Backward"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition shadow min-h-[36px]"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Play
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleStepForward}
                    disabled={currentStepIndex >= simOriginal.steps.length - 1}
                    className="p-2 bg-dark-750 hover:bg-dark-700 disabled:opacity-30 rounded text-slate-300 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Step Forward"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed Selector */}
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <span>Speed:</span>
                  {[
                    { label: '0.5x', ms: 1200 },
                    { label: '1x', ms: 750 },
                    { label: '2x', ms: 350 },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setPlaybackSpeed(s.ms)}
                      className={`px-2 py-1 rounded transition min-h-[30px] ${
                        playbackSpeed === s.ms
                          ? 'bg-brand-600 text-white font-bold'
                          : 'bg-dark-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (

        /* Test Suite Tab */
        <div className="space-y-4">
          {/* Add custom test case form */}
          <form onSubmit={handleAddTestCase} className="flex gap-2">
            <input
              type="text"
              placeholder="Add string to test suite (e.g. 0101)..."
              value={newTestCaseInput}
              onChange={(e) => setNewTestCaseInput(e.target.value)}
              className="flex-1 bg-dark-800 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-mono font-medium rounded-lg flex items-center gap-1 transition"
            >
              <ListPlus className="w-3.5 h-3.5" />
              Add Test
            </button>
          </form>

          {/* Test Cases Table */}
          <div className="overflow-x-auto border border-white/[0.08] rounded-lg bg-dark-850">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-dark-800 text-slate-400">
                  <th className="py-2 px-3">Input (w)</th>
                  <th className="py-2 px-3 text-center">Original (M)</th>
                  <th className="py-2 px-3 text-center">Complement (Mᶜ)</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {testSuite.map((test) => {
                  const resOrig = simulateDFA(completedDFA, test.input);
                  const resComp = simulateDFA(complementDFA, test.input);

                  return (
                    <tr key={test.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-2 px-3 font-bold text-slate-200">
                        {test.input === '' || test.input === 'ε' ? (
                          <span className="text-cyan-400">ε (empty)</span>
                        ) : (
                          `"${test.input}"`
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {resOrig.isValidInput ? (
                          resOrig.isAccepted ? (
                            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 text-[10px]">
                              ACCEPT
                            </span>
                          ) : (
                            <span className="text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40 text-[10px]">
                              REJECT
                            </span>
                          )
                        ) : (
                          <span className="text-amber-400 text-[10px]">INVALID</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {resComp.isValidInput ? (
                          resComp.isAccepted ? (
                            <span className="text-brand-300 font-bold bg-brand-950/80 px-2 py-0.5 rounded border border-brand-700/60 text-[10px]">
                              ACCEPT
                            </span>
                          ) : (
                            <span className="text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40 text-[10px]">
                              REJECT
                            </span>
                          )
                        ) : (
                          <span className="text-amber-400 text-[10px]">INVALID</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setInputString(test.input);
                              setActiveTab('single');
                              handleReset();
                            }}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
                          >
                            Trace
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(test.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
