import type { DFAPreset } from '../types/dfa';

export const DFA_PRESETS: DFAPreset[] = [
  {
    id: 'incomplete-starts-01',
    title: 'Starts with "01" (Incomplete DFA)',
    category: 'incomplete',
    description: 'DFA accepting all binary strings with prefix "01". Missing transitions from q0 on "1" and q1 on "0" demonstrate trap state generation.',
    mathematicalSpec: 'L = { w ∈ {0,1}* | w begins with "01" }',
    dfa: {
      name: 'Prefix "01" DFA (Incomplete)',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: ['q2'],
      transitions: {
        q0: { '0': 'q1' }, // Missing: q0 with '1'
        q1: { '1': 'q2' }, // Missing: q1 with '0'
        q2: { '0': 'q2', '1': 'q2' },
      },
    },
    sampleTestCases: ['01', '0101', '0111', '00', '10', '1', '0', 'ε'],
  },
  {
    id: 'odd-ones',
    title: 'Odd Number of 1s (Complete Binary)',
    category: 'complete',
    description: 'Standard 2-state parity checker. Accept state q1 represents an odd count of symbol 1.',
    mathematicalSpec: 'L = { w ∈ {0,1}* | |w|₁ ≡ 1 (mod 2) }',
    dfa: {
      name: 'Odd Parity 1s DFA',
      states: ['q_even', 'q_odd'],
      alphabet: ['0', '1'],
      startState: 'q_even',
      acceptStates: ['q_odd'],
      transitions: {
        q_even: { '0': 'q_even', '1': 'q_odd' },
        q_odd: { '0': 'q_odd', '1': 'q_even' },
      },
    },
    sampleTestCases: ['1', '010', '111', '101', '00', '1100', 'ε'],
  },
  {
    id: 'ends-with-10',
    title: 'Ends with "10" (Suffix Recognizer)',
    category: 'complete',
    description: 'Tracks recent bits and accepts whenever the last two processed symbols are "10".',
    mathematicalSpec: 'L = { w ∈ {0,1}* | w = x10 for some x ∈ {0,1}* }',
    dfa: {
      name: 'Ends with "10" DFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: ['q2'],
      transitions: {
        q0: { '0': 'q0', '1': 'q1' },
        q1: { '0': 'q2', '1': 'q1' },
        q2: { '0': 'q0', '1': 'q1' },
      },
    },
    sampleTestCases: ['10', '0110', '1010', '001', '111', '0', 'ε'],
  },
  {
    id: 'divisible-by-3',
    title: 'Binary Number Divisible by 3 (Modulo 3)',
    category: 'academic',
    description: 'Interprets input as a binary integer and verifies if the value modulo 3 equals 0.',
    mathematicalSpec: 'L = { w ∈ {0,1}* | (value(w))₂ ≡ 0 (mod 3) }',
    dfa: {
      name: 'Modulo 3 Binary DFA',
      states: ['rem_0', 'rem_1', 'rem_2'],
      alphabet: ['0', '1'],
      startState: 'rem_0',
      acceptStates: ['rem_0'],
      transitions: {
        rem_0: { '0': 'rem_0', '1': 'rem_1' },
        rem_1: { '0': 'rem_2', '1': 'rem_0' },
        rem_2: { '0': 'rem_1', '1': 'rem_2' },
      },
    },
    sampleTestCases: ['0', '11', '110', '1001', '1', '10', '100', 'ε'],
  },
  {
    id: 'contains-aba',
    title: 'Contains Substring "aba" (Alphabet {a, b})',
    category: 'academic',
    description: 'Searches for contiguous pattern "aba" over alphabet {a, b}. Demonstrates non-numeric alphabets.',
    mathematicalSpec: 'L = { w ∈ {a, b}* | w contains "aba" }',
    dfa: {
      name: 'Substring "aba" DFA',
      states: ['q0', 'q_a', 'q_ab', 'q_aba'],
      alphabet: ['a', 'b'],
      startState: 'q0',
      acceptStates: ['q_aba'],
      transitions: {
        q0: { 'a': 'q_a', 'b': 'q0' },
        q_a: { 'a': 'q_a', 'b': 'q_ab' },
        q_ab: { 'a': 'q_aba', 'b': 'q0' },
        q_aba: { 'a': 'q_aba', 'b': 'q_aba' },
      },
    },
    sampleTestCases: ['aba', 'aababa', 'baba', 'ab', 'aabba', 'bba', 'ε'],
  },
  {
    id: 'invalid-guardrail-demo',
    title: 'Invalid DFA (Validation Error Demo)',
    category: 'invalid',
    description: 'Demonstrates real-time error handling with invalid start state, unknown target states, and duplicate symbols.',
    mathematicalSpec: 'Demonstration of validation guardrails & error reporting',
    dfa: {
      name: 'Invalid Test DFA',
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      startState: 'q_invalid_start',
      acceptStates: ['q1', 'q_nonexistent'],
      transitions: {
        q0: { '0': 'q1', '1': 'q_ghost' },
        q1: { '0': 'q0' },
      },
    },
    sampleTestCases: ['01', '0', '1'],
  },
];
