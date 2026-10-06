/**
 * DFA Data Model and Core Engine Types
 */

export interface DFA {
  states: string[];
  alphabet: string[];
  startState: string;
  acceptStates: string[];
  /**
   * Transition mapping: transitions[state][symbol] = nextState
   */
  transitions: Record<string, Record<string, string>>;
  /**
   * Optional set of auto-generated trap states for UI labeling
   */
  trapStates?: string[];
  name?: string;
  description?: string;
}

export interface MissingTransition {
  fromState: string;
  symbol: string;
}

export interface DFAValidationError {
  field: 'states' | 'alphabet' | 'startState' | 'acceptStates' | 'transitions' | 'general';
  message: string;
}

export interface DFAValidationResult {
  isValid: boolean;
  isComplete: boolean;
  errors: DFAValidationError[];
  warnings: string[];
  missingTransitions: MissingTransition[];
  summary: string;
}

export interface SimulationStep {
  stepIndex: number;
  currentState: string;
  symbolConsumed: string | null;
  nextState: string | null;
  remainingInput: string;
  isTrapTransition: boolean;
}

export interface SimulationResult {
  inputString: string;
  displayString: string; // "ε" for empty string
  isValidInput: boolean;
  invalidSymbol?: string;
  isAccepted: boolean;
  finalState: string | null;
  isCompletePath: boolean;
  path: string[];
  steps: SimulationStep[];
  reason: string;
}

export interface ComparisonSimulationResult {
  inputString: string;
  displayString: string;
  originalResult: SimulationResult;
  completedResult: SimulationResult;
  complementResult: SimulationResult;
  isConsistentComplement: boolean; // original/completed accepted !== complement accepted
}

export interface TestCase {
  id: string;
  input: string;
  description?: string;
}

export interface DFAPreset {
  id: string;
  title: string;
  category: 'complete' | 'incomplete' | 'regex' | 'invalid' | 'academic';
  description: string;
  mathematicalSpec: string;
  dfa: DFA;
  sampleTestCases: string[];
}

export type DFAViewMode = 'original' | 'completed' | 'complement' | 'compare';
