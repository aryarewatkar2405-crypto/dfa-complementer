import type {
  DFA,
  DFAValidationError,
  DFAValidationResult,
  MissingTransition,
  SimulationResult,
  SimulationStep,
} from '../types/dfa';

/**
 * Validates a DFA definition according to formal automata rules.
 */
export function validateDFA(dfa: DFA): DFAValidationResult {
  const errors: DFAValidationError[] = [];
  const warnings: string[] = [];
  const missingTransitions: MissingTransition[] = [];

  // 1. Validate States (Q)
  if (!dfa.states || dfa.states.length === 0) {
    errors.push({
      field: 'states',
      message: 'State set Q cannot be empty. At least one state is required.',
    });
  }

  const uniqueStates = new Set<string>();
  for (const s of dfa.states || []) {
    const trimmed = s.trim();
    if (!trimmed) {
      errors.push({
        field: 'states',
        message: 'State names cannot be blank or empty whitespace.',
      });
    } else if (uniqueStates.has(trimmed)) {
      errors.push({
        field: 'states',
        message: `Duplicate state '${trimmed}' detected in state set Q.`,
      });
    }
    uniqueStates.add(trimmed);
  }

  // 2. Validate Alphabet (Σ)
  if (!dfa.alphabet || dfa.alphabet.length === 0) {
    errors.push({
      field: 'alphabet',
      message: 'Alphabet Σ cannot be empty. At least one input symbol is required.',
    });
  }

  const uniqueAlphabet = new Set<string>();
  for (const sym of dfa.alphabet || []) {
    const trimmed = sym.trim();
    if (!trimmed) {
      errors.push({
        field: 'alphabet',
        message: 'Alphabet symbols cannot be blank.',
      });
    } else if (trimmed.length > 3) {
      warnings.push(`Symbol '${trimmed}' is long. Single character symbols (e.g., '0', '1', 'a', 'b') are recommended.`);
    } else if (uniqueAlphabet.has(trimmed)) {
      errors.push({
        field: 'alphabet',
        message: `Duplicate symbol '${trimmed}' detected in alphabet Σ.`,
      });
    }
    uniqueAlphabet.add(trimmed);
  }

  // 3. Validate Start State (q0 ∈ Q)
  if (!dfa.startState || !dfa.startState.trim()) {
    errors.push({
      field: 'startState',
      message: 'Initial start state q0 must be specified.',
    });
  } else if (!uniqueStates.has(dfa.startState.trim())) {
    errors.push({
      field: 'startState',
      message: `Start state '${dfa.startState}' is not defined in state set Q = {${dfa.states.join(', ')}}.`,
    });
  }

  // 4. Validate Accepting States (F ⊆ Q)
  for (const f of dfa.acceptStates || []) {
    const trimmed = f.trim();
    if (!uniqueStates.has(trimmed)) {
      errors.push({
        field: 'acceptStates',
        message: `Accepting state '${trimmed}' does not exist in state set Q.`,
      });
    }
  }

  // 5. Validate Transitions δ: Q × Σ → Q
  const transitions = dfa.transitions || {};
  for (const state of dfa.states || []) {
    for (const sym of dfa.alphabet || []) {
      const targetState = transitions[state]?.[sym];

      if (targetState === undefined || targetState === null || targetState.trim() === '') {
        missingTransitions.push({ fromState: state, symbol: sym });
      } else {
        const trimmedTarget = targetState.trim();
        if (!uniqueStates.has(trimmedTarget)) {
          errors.push({
            field: 'transitions',
            message: `Transition δ(${state}, '${sym}') points to unknown state '${trimmedTarget}'.`,
          });
        }
      }
    }
  }

  const isValid = errors.length === 0;
  const isComplete = isValid && missingTransitions.length === 0;

  let summary = 'Valid & Complete DFA';
  if (!isValid) {
    summary = `Invalid DFA (${errors.length} error${errors.length > 1 ? 's' : ''})`;
  } else if (!isComplete) {
    summary = `Incomplete DFA (${missingTransitions.length} missing transition${missingTransitions.length > 1 ? 's' : ''})`;
  }

  return {
    isValid,
    isComplete,
    errors,
    warnings,
    missingTransitions,
    summary,
  };
}

/**
 * Finds all missing transitions in the DFA.
 */
export function findMissingTransitions(dfa: DFA): MissingTransition[] {
  const missing: MissingTransition[] = [];
  const stateSet = new Set(dfa.states);

  for (const state of dfa.states) {
    for (const sym of dfa.alphabet) {
      const target = dfa.transitions[state]?.[sym];
      if (!target || !stateSet.has(target.trim())) {
        missing.push({ fromState: state, symbol: sym });
      }
    }
  }
  return missing;
}

/**
 * Generates an unused, elegant trap state identifier (e.g. qTrap, qTrap_1)
 */
export function getUniqueTrapStateName(existingStates: string[]): string {
  const stateSet = new Set(existingStates.map((s) => s.toLowerCase()));
  if (!stateSet.has('qtrap')) return 'qTrap';
  if (!stateSet.has('qdead')) return 'qDead';
  if (!stateSet.has('qt')) return 'qT';

  let idx = 1;
  while (stateSet.has(`qtrap_${idx}`) || stateSet.has(`qtrap${idx}`)) {
    idx++;
  }
  return `qTrap_${idx}`;
}

/**
 * Completes a DFA by adding a trap/dead state and filling all missing transitions.
 */
export function completeDFA(dfa: DFA): {
  completedDFA: DFA;
  addedTrap: boolean;
  trapStateName: string | null;
  missingCount: number;
} {
  const missing = findMissingTransitions(dfa);

  // If already complete, return a cloned copy
  if (missing.length === 0) {
    return {
      completedDFA: {
        states: [...dfa.states],
        alphabet: [...dfa.alphabet],
        startState: dfa.startState,
        acceptStates: [...dfa.acceptStates],
        transitions: JSON.parse(JSON.stringify(dfa.transitions)),
        trapStates: dfa.trapStates ? [...dfa.trapStates] : [],
        name: dfa.name ? `${dfa.name} (Complete)` : undefined,
        description: dfa.description,
      },
      addedTrap: false,
      trapStateName: null,
      missingCount: 0,
    };
  }

  const trapState = getUniqueTrapStateName(dfa.states);
  const newStates = [...dfa.states, trapState];
  const newTransitions: Record<string, Record<string, string>> = JSON.parse(
    JSON.stringify(dfa.transitions)
  );

  // Initialize transition maps for all states if missing
  for (const state of newStates) {
    if (!newTransitions[state]) {
      newTransitions[state] = {};
    }
  }

  // Fill in missing transitions with the trap state
  for (const m of missing) {
    if (!newTransitions[m.fromState]) {
      newTransitions[m.fromState] = {};
    }
    newTransitions[m.fromState][m.symbol] = trapState;
  }

  // Trap state self-loops on every symbol in alphabet Σ: δ(qTrap, a) = qTrap
  for (const sym of dfa.alphabet) {
    newTransitions[trapState][sym] = trapState;
  }

  const completedDFA: DFA = {
    states: newStates,
    alphabet: [...dfa.alphabet],
    startState: dfa.startState,
    acceptStates: [...dfa.acceptStates], // Trap state is NON-accepting in complete DFA
    transitions: newTransitions,
    trapStates: [trapState],
    name: dfa.name ? `${dfa.name} (Auto-Completed)` : 'Completed DFA',
    description: `Auto-completed DFA with trap state '${trapState}' for ${missing.length} missing transition(s).`,
  };

  return {
    completedDFA,
    addedTrap: true,
    trapStateName: trapState,
    missingCount: missing.length,
  };
}

/**
 * Computes the Mathematical Complement of a DFA:
 * Mᶜ = (Q, Σ, δ, q0, Q \ F)
 * Precondition: The DFA MUST be complete first.
 */
export function complementDFA(completedDFA: DFA): DFA {
  const originalAcceptSet = new Set(completedDFA.acceptStates);

  // Fᶜ = Q \ F
  const complementAcceptStates = completedDFA.states.filter(
    (state) => !originalAcceptSet.has(state)
  );

  return {
    states: [...completedDFA.states],
    alphabet: [...completedDFA.alphabet],
    startState: completedDFA.startState,
    acceptStates: complementAcceptStates,
    transitions: JSON.parse(JSON.stringify(completedDFA.transitions)),
    trapStates: completedDFA.trapStates ? [...completedDFA.trapStates] : [],
    name: completedDFA.name ? `Complement of ${completedDFA.name}` : 'Complement DFA',
    description: `Mathematical complement DFA: L(Mᶜ) = Σ* \\ L(M). Accepting states inverted: {${complementAcceptStates.join(', ')}}.`,
  };
}

/**
 * Normalizes input string (e.g. converting "ε", "eps", "lambda", "" into empty string)
 */
export function normalizeInputString(rawInput: string): {
  normalized: string;
  isEpsilon: boolean;
  display: string;
} {
  const trimmed = rawInput.trim();
  if (
    trimmed === '' ||
    trimmed === 'ε' ||
    trimmed === '\u03B5' ||
    trimmed.toLowerCase() === 'eps' ||
    trimmed.toLowerCase() === 'epsilon' ||
    trimmed.toLowerCase() === 'lambda' ||
    trimmed === 'λ'
  ) {
    return { normalized: '', isEpsilon: true, display: 'ε' };
  }
  return { normalized: trimmed, isEpsilon: false, display: trimmed };
}

/**
 * Validates whether string contains only symbols in the alphabet.
 */
export function validateInputString(
  rawInput: string,
  alphabet: string[]
): {
  isValid: boolean;
  invalidSymbol?: string;
  cleanInput: string;
  displayString: string;
} {
  const { normalized, display } = normalizeInputString(rawInput);
  if (normalized === '') {
    return { isValid: true, cleanInput: '', displayString: 'ε' };
  }

  const alphabetSet = new Set(alphabet);

  // If alphabet has single character symbols:
  const isSingleCharAlphabet = alphabet.every((s) => s.length === 1);

  if (isSingleCharAlphabet) {
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      if (!alphabetSet.has(char)) {
        return {
          isValid: false,
          invalidSymbol: char,
          cleanInput: normalized,
          displayString: display,
        };
      }
    }
    return { isValid: true, cleanInput: normalized, displayString: display };
  }

  // Multi-character symbol parsing (greedy longest match)
  let remaining = normalized;
  while (remaining.length > 0) {
    const matchingSymbol = alphabet
      .slice()
      .sort((a, b) => b.length - a.length)
      .find((sym) => remaining.startsWith(sym));

    if (!matchingSymbol) {
      return {
        isValid: false,
        invalidSymbol: remaining[0],
        cleanInput: normalized,
        displayString: display,
      };
    }
    remaining = remaining.slice(matchingSymbol.length);
  }

  return { isValid: true, cleanInput: normalized, displayString: display };
}

/**
 * Simulates a DFA on a given input string.
 */
export function simulateDFA(dfa: DFA, rawInput: string): SimulationResult {
  const { normalized, display } = normalizeInputString(rawInput);
  const inputValidation = validateInputString(rawInput, dfa.alphabet);

  if (!inputValidation.isValid) {
    return {
      inputString: normalized,
      displayString: display,
      isValidInput: false,
      invalidSymbol: inputValidation.invalidSymbol,
      isAccepted: false,
      finalState: null,
      isCompletePath: false,
      path: [],
      steps: [],
      reason: `Symbol '${inputValidation.invalidSymbol}' is not in the alphabet Σ = {${dfa.alphabet.join(', ')}}.`,
    };
  }

  if (!dfa.startState || !dfa.states.includes(dfa.startState)) {
    return {
      inputString: normalized,
      displayString: display,
      isValidInput: false,
      isAccepted: false,
      finalState: null,
      isCompletePath: false,
      path: [],
      steps: [],
      reason: `DFA start state '${dfa.startState}' is invalid or undefined.`,
    };
  }

  const isSingleCharAlphabet = dfa.alphabet.every((s) => s.length === 1);
  const symbols: string[] = [];

  if (normalized.length > 0) {
    if (isSingleCharAlphabet) {
      for (const char of normalized) {
        symbols.push(char);
      }
    } else {
      let rem = normalized;
      while (rem.length > 0) {
        const matchingSymbol = dfa.alphabet
          .slice()
          .sort((a, b) => b.length - a.length)
          .find((sym) => rem.startsWith(sym))!;
        symbols.push(matchingSymbol);
        rem = rem.slice(matchingSymbol.length);
      }
    }
  }

  let currentState = dfa.startState;
  const path: string[] = [currentState];
  const steps: SimulationStep[] = [];
  const trapSet = new Set(dfa.trapStates || []);

  // Initial step at state 0
  steps.push({
    stepIndex: 0,
    currentState,
    symbolConsumed: null,
    nextState: null,
    remainingInput: normalized,
    isTrapTransition: trapSet.has(currentState),
  });

  let isCompletePath = true;
  let remainingInput = normalized;

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    const nextState = dfa.transitions[currentState]?.[sym];

    if (!nextState || !dfa.states.includes(nextState)) {
      // Incomplete DFA halted prematurely
      isCompletePath = false;
      const reason = `DFA halted unexpectedly: State '${currentState}' has no defined transition for symbol '${sym}'.`;
      return {
        inputString: normalized,
        displayString: display,
        isValidInput: true,
        isAccepted: false,
        finalState: currentState,
        isCompletePath: false,
        path,
        steps,
        reason,
      };
    }

    remainingInput = remainingInput.slice(sym.length);
    const isTrap = trapSet.has(nextState);

    steps.push({
      stepIndex: i + 1,
      currentState,
      symbolConsumed: sym,
      nextState,
      remainingInput,
      isTrapTransition: isTrap,
    });

    currentState = nextState;
    path.push(currentState);
  }

  const isAccepted = dfa.acceptStates.includes(currentState);
  const isFinalTrap = trapSet.has(currentState);

  let reason = '';
  if (normalized === '') {
    reason = isAccepted
      ? `Empty string ε evaluated at start state '${currentState}' ∈ F (Accepting).`
      : `Empty string ε evaluated at start state '${currentState}' ∉ F (Non-accepting).`;
  } else if (isFinalTrap) {
    reason = isAccepted
      ? `String consumed and halted in trap state '${currentState}' ∈ F (Accepting in Complement DFA).`
      : `String entered trap state '${currentState}' ∉ F (Non-accepting Dead State).`;
  } else {
    reason = isAccepted
      ? `String fully consumed and halted in state '${currentState}' ∈ F (Accepting).`
      : `String fully consumed and halted in state '${currentState}' ∉ F (Non-accepting).`;
  }

  return {
    inputString: normalized,
    displayString: display,
    isValidInput: true,
    isAccepted,
    finalState: currentState,
    isCompletePath,
    path,
    steps,
    reason,
  };
}
