import { useState, useMemo, useRef, useCallback } from 'react';
import type { DFA, DFAViewMode } from './types/dfa';
import { DFA_PRESETS } from './core/dfaPresets';
import {
  validateDFA,
  completeDFA,
  complementDFA,
} from './core/dfaOperations';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/layout/HeroSection';
import { DFAEditor } from './components/editor/DFAEditor';
import { ValidationPanel } from './components/editor/ValidationPanel';
import { DFAVisualizer } from './components/visualizer/DFAVisualizer';
import { CompareView } from './components/visualizer/CompareView';
import { StringTester } from './components/simulator/StringTester';
import { MathModal } from './components/explanation/MathModal';
import { PresentationModeModal } from './components/layout/PresentationModeModal';
import { ArrowLeftRight } from 'lucide-react';

export function App() {
  // Default Initial DFA: Incomplete "Starts with 01" to showcase auto-trap completion
  const [currentDFA, setCurrentDFA] = useState<DFA>(DFA_PRESETS[0].dfa);
  const [viewMode, setViewMode] = useState<DFAViewMode>('original');

  // Modals state
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Active step traversal state for animation
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeStateId, setActiveStateId] = useState<string | null>(null);
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null);

  const workspaceRef = useRef<HTMLDivElement>(null);

  // Live Validation
  const validationResult = useMemo(() => {
    return validateDFA(currentDFA);
  }, [currentDFA]);

  // Completed DFA Calculation
  const { completedDFA } = useMemo(() => {
    return completeDFA(currentDFA);
  }, [currentDFA]);

  // Complement DFA Calculation
  const complementResultDFA = useMemo(() => {
    return complementDFA(completedDFA);
  }, [completedDFA]);

  // Handle auto-complete action from validation panel
  const handleAutoComplete = () => {
    setCurrentDFA(completedDFA);
    setViewMode('completed');
  };

  // Handle complement generation
  const handleGenerateComplement = () => {
    if (!validationResult.isComplete) {
      setCurrentDFA(completedDFA);
    }
    setViewMode('complement');
  };

  // Handle preset loading
  const handleLoadPreset = (presetId: string) => {
    const preset = DFA_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setCurrentDFA(preset.dfa);
      setViewMode('original');
      setActiveStepIndex(0);
      setActiveStateId(null);
      setActiveEdgeId(null);
    }
  };

  // Reset to empty default
  const handleReset = () => {
    setCurrentDFA({
      name: 'Custom DFA',
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: ['q1'],
      transitions: {
        q0: { '0': 'q1' },
      },
    });
    setViewMode('original');
    setActiveStepIndex(0);
    setActiveStateId(null);
    setActiveEdgeId(null);
  };

  // Step change callback from StringTester
  const handleStepChange = useCallback(
    (stepIdx: number, stateId: string | null, edgeId: string | null) => {
      setActiveStepIndex(stepIdx);
      setActiveStateId(stateId);
      setActiveEdgeId(edgeId);
    },
    []
  );

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Active DFA to display in center visualizer
  const activeDisplayDFA =
    viewMode === 'complement'
      ? complementResultDFA
      : viewMode === 'completed'
      ? completedDFA
      : currentDFA;

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 flex flex-col selection:bg-brand-500/30 selection:text-brand-200">
      {/* Top Navbar */}
      <Navbar
        onOpenMathModal={() => setIsMathModalOpen(true)}
        onOpenDemoMode={() => setIsDemoModalOpen(true)}
        onScrollToWorkspace={scrollToWorkspace}
        onLoadExample={() => handleLoadPreset(DFA_PRESETS[1].id)}
      />

      {/* Hero Section */}
      <HeroSection
        onBuildClick={scrollToWorkspace}
        onTryExampleClick={() => {
          handleLoadPreset(DFA_PRESETS[0].id);
          scrollToWorkspace();
        }}
        onOpenTheoryClick={() => setIsMathModalOpen(true)}
        teaserDFA={completedDFA}
      />

      {/* Main Workspace Section inside Unified Page Container */}
      <main ref={workspaceRef} className="flex-1 w-full py-10">
        <div className="page-container">
          {/* Workspace Mode Switcher & Title Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-400">
                  Workspace Canvas
                </span>
                <span className="text-slate-600 font-mono">/</span>
                <span className="text-xs font-mono text-slate-300">
                  {currentDFA.name || 'DFA Complementer Engine'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mt-1 font-mono">
                Deterministic Finite Automaton Transformation
              </h2>
            </div>

            {/* View Mode Segmented Control */}
            <div className="flex items-center bg-dark-900 p-1 rounded-xl border border-white/[0.08] shadow-inner font-mono text-xs shrink-0">
              <button
                onClick={() => setViewMode('original')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  viewMode === 'original'
                    ? 'bg-dark-750 text-slate-100 shadow border border-white/[0.08]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Original DFA
              </button>
              <button
                onClick={() => setViewMode('completed')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  viewMode === 'completed'
                    ? 'bg-cyan-950 text-cyan-300 shadow border border-cyan-800/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Completed DFA
              </button>
              <button
                onClick={() => setViewMode('complement')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  viewMode === 'complement'
                    ? 'bg-brand-950 text-brand-300 shadow border border-brand-800/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Complement DFA (Mᶜ)
              </button>
              <button
                onClick={() => setViewMode('compare')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  viewMode === 'compare'
                    ? 'bg-indigo-900 text-indigo-200 shadow border border-indigo-700/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Compare
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          {viewMode === 'compare' ? (
            <div className="w-full">
              <CompareView
                originalDFA={currentDFA}
                completedDFA={completedDFA}
                complementDFA={complementResultDFA}
              />
            </div>
          ) : (
            /* 3-Column Desktop Grid Layout */
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,0.95fr)_minmax(400px,1.4fr)_minmax(290px,0.95fr)] gap-6 items-start">
              {/* LEFT COLUMN: DFA Input Editor */}
              <section className="h-[720px] flex flex-col">
                <DFAEditor
                  dfa={currentDFA}
                  onChange={(newDFA) => {
                    setCurrentDFA(newDFA);
                    setActiveStepIndex(0);
                    setActiveStateId(null);
                    setActiveEdgeId(null);
                  }}
                  onReset={handleReset}
                  onLoadPreset={handleLoadPreset}
                />
              </section>

              {/* CENTER COLUMN: Interactive Visualizer */}
              <section className="h-[720px] flex flex-col">
                <div className="flex flex-col h-full bg-dark-900 border border-white/[0.08] rounded-xl overflow-hidden shadow-xl">
                  {/* Visualizer Header */}
                  <div className="p-3 border-b border-white/[0.08] bg-dark-850 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          viewMode === 'complement'
                            ? 'bg-brand-500'
                            : viewMode === 'completed'
                            ? 'bg-cyan-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                        {viewMode === 'complement'
                          ? 'Complement Automaton Mᶜ = (Q, Σ, δ, q₀, Q \\ F)'
                          : viewMode === 'completed'
                          ? 'Completed Automaton (Trap State Connected)'
                          : 'Original Input Automaton'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Accepting: {'{' + activeDisplayDFA.acceptStates.join(', ') + '}'}
                    </span>
                  </div>

                  {/* Graph Visualizer */}
                  <div className="flex-1 w-full h-full relative">
                    <DFAVisualizer
                      dfa={activeDisplayDFA}
                      viewMode={viewMode}
                      activeStateId={activeStateId}
                      activeEdgeId={activeEdgeId}
                      onStateSelect={(id) => {
                        if (id) setActiveStateId(id);
                      }}
                    />
                  </div>
                </div>
              </section>

              {/* RIGHT COLUMN: Validation & String Simulation Engine */}
              <section className="flex flex-col space-y-4">
                {/* 1. Validation & Trap State Completion Panel */}
                <ValidationPanel
                  dfa={currentDFA}
                  validationResult={validationResult}
                  onAutoComplete={handleAutoComplete}
                  onGenerateComplement={handleGenerateComplement}
                />

                {/* 2. String Simulation Engine & Test Suite */}
                <StringTester
                  originalDFA={currentDFA}
                  completedDFA={completedDFA}
                  complementDFA={complementResultDFA}
                  currentStepIndex={activeStepIndex}
                  onStepChange={handleStepChange}
                  sampleTestCases={
                    DFA_PRESETS.find((p) => p.title === currentDFA.name)
                      ?.sampleTestCases
                  }
                />
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Footer in Global Page Container */}
      <footer className="mt-12 py-8 border-t border-white/[0.08] bg-[#090a10] text-slate-400 text-xs font-mono">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">DFA Complementer</span>
            <span>—</span>
            <span>Interactive DFA Complement Automaton Tool</span>
          </div>
          <p className="text-slate-500 text-center sm:text-right text-[11px]">
            Academic Project · Design & Analysis of Algorithms / Theory of Computation
          </p>
        </div>
      </footer>

      {/* Mathematical Theory & Proof Modal */}
      <MathModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
      />

      {/* Viva / Professor Demonstration Mode Modal */}
      <PresentationModeModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onApplyToWorkspace={(dfa) => {
          setCurrentDFA(dfa);
          setViewMode('completed');
          scrollToWorkspace();
        }}
      />
    </div>
  );
}

export default App;
