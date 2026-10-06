import { describe, it, expect } from 'vitest';
import {
  completeDFA,
  complementDFA,
  simulateDFA,
  validateDFA,
} from '../dfaOperations';
import type { DFA } from '../../types/dfa';

/**
 * Executes comprehensive mathematical verification of DFA complementation and simulation.
 */
export function runSanityTests(): boolean {
  // Test 1: Incomplete DFA
  const incompleteDFA: DFA = {
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

  const val1 = validateDFA(incompleteDFA);
  if (!val1.isValid || val1.isComplete || val1.missingTransitions.length !== 2) {
    console.error('Validation test failed');
    return false;
  }

  const { completedDFA, addedTrap, trapStateName } = completeDFA(incompleteDFA);
  if (
    !addedTrap ||
    trapStateName !== 'qTrap' ||
    !completedDFA.states.includes('qTrap') ||
    completedDFA.acceptStates.includes('qTrap')
  ) {
    console.error('Completion test failed');
    return false;
  }

  // Test 2: Complement Operation
  const complement = complementDFA(completedDFA);
  if (
    !complement.acceptStates.includes('qTrap') ||
    !complement.acceptStates.includes('q0') ||
    !complement.acceptStates.includes('q1') ||
    complement.acceptStates.includes('q2')
  ) {
    console.error('Complement test failed');
    return false;
  }

  // Test 3: Simulation Verification
  const simOriginal01 = simulateDFA(completedDFA, '01');
  const simComp01 = simulateDFA(complement, '01');
  if (!simOriginal01.isAccepted || simComp01.isAccepted) {
    console.error('Simulation "01" test failed');
    return false;
  }

  const simOriginal10 = simulateDFA(completedDFA, '10');
  const simComp10 = simulateDFA(complement, '10');
  if (simOriginal10.isAccepted || !simComp10.isAccepted) {
    console.error('Simulation "10" test failed');
    return false;
  }

  return true;
}

describe('DFA Mathematical Core Verification', () => {
  const incompleteDFA: DFA = {
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

  it('validates incomplete DFA and detects missing transitions', () => {
    const val = validateDFA(incompleteDFA);
    expect(val.isValid).toBe(true);
    expect(val.isComplete).toBe(false);
    expect(val.missingTransitions.length).toBe(2);
  });

  it('completes DFA by adding a trap state', () => {
    const { completedDFA, addedTrap, trapStateName } = completeDFA(incompleteDFA);
    expect(addedTrap).toBe(true);
    expect(trapStateName).toBe('qTrap');
    expect(completedDFA.states).toContain('qTrap');
    expect(completedDFA.transitions['qTrap']['0']).toBe('qTrap');
    expect(completedDFA.transitions['qTrap']['1']).toBe('qTrap');
    expect(completedDFA.acceptStates).not.toContain('qTrap');
  });

  it('complements the completed DFA by inverting accept states', () => {
    const { completedDFA } = completeDFA(incompleteDFA);
    const complement = complementDFA(completedDFA);

    expect(complement.acceptStates).toContain('qTrap');
    expect(complement.acceptStates).toContain('q0');
    expect(complement.acceptStates).toContain('q1');
    expect(complement.acceptStates).not.toContain('q2');
  });

  it('simulates string traversal correctly on original and complement DFAs', () => {
    const { completedDFA } = completeDFA(incompleteDFA);
    const complement = complementDFA(completedDFA);

    expect(simulateDFA(completedDFA, '01').isAccepted).toBe(true);
    expect(simulateDFA(complement, '01').isAccepted).toBe(false);

    expect(simulateDFA(completedDFA, '10').isAccepted).toBe(false);
    expect(simulateDFA(completedDFA, '10').finalState).toBe('qTrap');
    expect(simulateDFA(complement, '10').isAccepted).toBe(true);
    expect(simulateDFA(complement, '10').finalState).toBe('qTrap');

    expect(simulateDFA(completedDFA, 'ε').isAccepted).toBe(false);
    expect(simulateDFA(complement, 'ε').isAccepted).toBe(true);
  });
});



