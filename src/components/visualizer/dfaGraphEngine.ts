import cytoscape, { type Core, type ElementDefinition } from 'cytoscape';
import type { DFA } from '../../types/dfa';

export interface TopologyNodeInfo {
  id: string;
  isStart: boolean;
  isAccept: boolean;
  isTrap: boolean;
  layer: number;
  orderInLayer: number;
  inDegree: number;
  outDegree: number;
  hasSelfLoop: boolean;
  hasBidi: boolean;
}

/**
 * Calculates adaptive node dimensions based on state name length
 * to ensure text never overflows the node boundary while keeping circular proportions.
 */
export function calculateNodeDimensions(
  stateName: string,
  isAccept: boolean
): { width: number; height: number } {
  const charWidth = 9.5;
  const baseSize = isAccept ? 68 : 60;
  const textWidth = stateName.length * charWidth + (isAccept ? 28 : 20);
  const width = Math.min(Math.max(textWidth, baseSize), 140);
  const height = baseSize;
  return { width, height };
}

/**
 * Groups and merges transitions between matching state pairs
 * into clean comma-separated badges (e.g. "0, 1").
 */
export function groupDFATransitions(dfa: DFA): {
  key: string;
  source: string;
  target: string;
  symbols: string[];
  label: string;
  isSelfLoop: boolean;
  isBidi: boolean;
  isForward: boolean;
  isTrap: boolean;
}[] {
  const states = dfa.states || [];
  const trapSet = new Set(dfa.trapStates || []);
  const edgeMap: Record<string, string[]> = {};

  for (const state of states) {
    const stateTransitions = dfa.transitions[state] || {};
    for (const [sym, target] of Object.entries(stateTransitions)) {
      if (!target || !states.includes(target)) continue;
      const key = `${state}->${target}`;
      if (!edgeMap[key]) {
        edgeMap[key] = [];
      }
      if (!edgeMap[key].includes(sym)) {
        edgeMap[key].push(sym);
      }
    }
  }

  const groupedEdges = [];
  const stateIndexMap = new Map(states.map((s, idx) => [s, idx]));

  for (const [key, symbols] of Object.entries(edgeMap)) {
    const [source, target] = key.split('->');
    const isSelfLoop = source === target;
    const reverseKey = `${target}->${source}`;
    const isBidi = !isSelfLoop && !!edgeMap[reverseKey];
    const isTrap = trapSet.has(source) || trapSet.has(target);

    // Determine forward vs backward direction for curve routing
    const srcIdx = stateIndexMap.get(source) ?? 0;
    const tgtIdx = stateIndexMap.get(target) ?? 0;
    const isForward = srcIdx <= tgtIdx;

    groupedEdges.push({
      key,
      source,
      target,
      symbols: symbols.sort(),
      label: symbols.sort().join(', '),
      isSelfLoop,
      isBidi,
      isForward,
      isTrap,
    });
  }

  return groupedEdges;
}

/**
 * Topology-Aware Layout Engine for Automata:
 * Analyzes graph structure (start state, BFS layers, branches, cycles, trap states)
 * and calculates aesthetically balanced, spacious 2D coordinates.
 */
export function computeTopologyPositions(
  dfa: DFA,
  canvasWidth: number = 700,
  canvasHeight: number = 460
): Record<string, { x: number; y: number }> {
  const states = dfa.states || [];
  if (states.length === 0) return {};

  const startState = dfa.startState || states[0];
  const trapSet = new Set(dfa.trapStates || []);
  const nonTrapStates = states.filter((s) => !trapSet.has(s));
  const trapStates = states.filter((s) => trapSet.has(s));

  const positions: Record<string, { x: number; y: number }> = {};

  // 1. Assign BFS Layers from Start State for non-trap states
  const layerMap = new Map<string, number>();
  const visited = new Set<string>();
  const queue: { state: string; layer: number }[] = [{ state: startState, layer: 0 }];
  visited.add(startState);
  layerMap.set(startState, 0);

  while (queue.length > 0) {
    const { state, layer } = queue.shift()!;
    const transitions = dfa.transitions[state] || {};

    for (const target of Object.values(transitions)) {
      if (!target || trapSet.has(target) || !states.includes(target)) continue;
      if (!visited.has(target)) {
        visited.add(target);
        layerMap.set(target, layer + 1);
        queue.push({ state: target, layer: layer + 1 });
      }
    }
  }

  // Handle any disconnected / unvisited non-trap states
  let maxLayer = 0;
  for (const layer of layerMap.values()) {
    if (layer > maxLayer) maxLayer = layer;
  }
  for (const st of nonTrapStates) {
    if (!layerMap.has(st)) {
      maxLayer++;
      layerMap.set(st, maxLayer);
    }
  }

  // Group non-trap states by layer
  const layers: string[][] = [];
  for (const [st, l] of layerMap.entries()) {
    while (layers.length <= l) layers.push([]);
    layers[l].push(st);
  }

  // 2. Compute Natural Center-Balanced Coordinates
  const numLayers = Math.max(layers.length, 1);
  const targetWidth = Math.max(canvasWidth, 600);
  const targetHeight = Math.max(canvasHeight, 400);

  // Proportional layer horizontal spacing
  const xSpacing =
    numLayers <= 2
      ? Math.min(targetWidth * 0.42, 280)
      : numLayers === 3
        ? Math.min(targetWidth * 0.32, 240)
        : Math.min(targetWidth * 0.25, 200);

  const startX = 140;
  const centerY = targetHeight * 0.44;

  // Place layered non-trap states
  layers.forEach((layerStates, lIdx) => {
    const x = startX + lIdx * xSpacing;
    const count = layerStates.length;
    const ySpacing = Math.min(150, (targetHeight * 0.5) / Math.max(count - 1, 1));

    layerStates.forEach((st, sIdx) => {
      let y = centerY;
      if (count > 1) {
        y = centerY + (sIdx - (count - 1) / 2) * ySpacing;
      }
      positions[st] = { x, y };
    });
  });

  // 3. Place Trap States Elegantly Beneath the Automaton
  if (trapStates.length > 0) {
    // Center under the middle layer of non-trap states
    const minX = Math.min(...nonTrapStates.map((s) => positions[s]?.x || startX));
    const maxX = Math.max(...nonTrapStates.map((s) => positions[s]?.x || startX));
    const midX = (minX + maxX) / 2;
    const trapY = centerY + Math.min(targetHeight * 0.36, 150);

    trapStates.forEach((st, idx) => {
      positions[st] = {
        x: midX + (idx - (trapStates.length - 1) / 2) * 140,
        y: trapY,
      };
    });
  }

  // 4. Attach Clean START Indicator Node Directly to the Left of Start State
  const startPos = positions[startState] || { x: startX, y: centerY };
  positions['__start_indicator__'] = {
    x: startPos.x - 62, // Compact, natural distance
    y: startPos.y,
  };

  return positions;
}

/**
 * Builds complete Cytoscape element definitions with dynamic sizing,
 * preset topology positions, and bidirectional curves.
 */
export function buildCytoscapeElements(
  dfa: DFA,
  activeStateId: string | null = null,
  activeEdgeId: string | null = null,
  canvasWidth: number = 700,
  canvasHeight: number = 460
): ElementDefinition[] {
  const elements: ElementDefinition[] = [];
  const acceptSet = new Set(dfa.acceptStates || []);
  const trapSet = new Set(dfa.trapStates || []);
  const startState = dfa.startState;

  const positions = computeTopologyPositions(dfa, canvasWidth, canvasHeight);

  // 1. Virtual START Indicator Node & Edge
  if (startState && dfa.states.includes(startState)) {
    elements.push({
      data: {
        id: '__start_indicator__',
        label: 'START',
      },
      position: positions['__start_indicator__'],
      classes: 'start-indicator-node',
    });

    elements.push({
      data: {
        id: '__start_edge__',
        source: '__start_indicator__',
        target: startState,
        label: '',
      },
      classes: 'start-indicator-edge',
    });
  }

  // 2. DFA State Nodes
  for (const state of dfa.states || []) {
    const isStart = state === startState;
    const isAccept = acceptSet.has(state);
    const isTrap = trapSet.has(state);
    const isActive = activeStateId === state;

    const { width, height } = calculateNodeDimensions(state, isAccept);

    const classes: string[] = ['dfa-node'];
    if (isStart) classes.push('start-node');
    if (isAccept) classes.push('accept-node');
    if (isTrap) classes.push('trap-node');
    if (isActive) classes.push('active-node');

    elements.push({
      data: {
        id: state,
        label: isTrap ? `${state}\n(TRAP)` : state,
        rawId: state,
        isStart,
        isAccept,
        isTrap,
        width,
        height,
      },
      position: positions[state] || { x: 150, y: 150 },
      classes: classes.join(' '),
    });
  }

  // 3. Merged DFA Transitions
  const groupedEdges = groupDFATransitions(dfa);
  for (const edge of groupedEdges) {
    const isActive = activeEdgeId === edge.key;

    const classes: string[] = ['dfa-edge'];
    if (edge.isSelfLoop) classes.push('self-edge');
    else if (edge.isBidi) {
      classes.push(edge.isForward ? 'bidi-forward-edge' : 'bidi-backward-edge');
    }
    if (edge.isTrap) classes.push('trap-edge');
    if (isActive) classes.push('active-edge');

    elements.push({
      data: {
        id: edge.key,
        source: edge.source,
        target: edge.target,
        label: edge.label,
      },
      classes: classes.join(' '),
    });
  }

  return elements;
}

/**
 * Returns clean, balanced Cytoscape stylesheet for automata theory diagrams.
 */
export function getCytoscapeStylesheet(): cytoscape.StylesheetStyle[] {
  return [
    // Base DFA State Node (Balanced 60px–68px)
    {
      selector: 'node.dfa-node',
      style: {
        label: 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-family': 'JetBrains Mono, monospace',
        'font-size': '13px',
        'font-weight': 'bold',
        color: '#F8FAFC',
        'background-color': '#151B2E',
        'border-width': 2.5,
        'border-color': '#475569',
        'border-style': 'solid',
        width: 'data(width)',
        height: 'data(height)',
        'text-wrap': 'wrap',
        'text-max-width': '120px',
        'transition-property':
          'background-color, border-color, border-width, color',
        'transition-duration': 0.15,
        'overlay-opacity': 0,
      },
    },
    // Start State Node
    {
      selector: 'node.start-node',
      style: {
        'border-color': '#6366F1',
        'border-width': 2.5,
      },
    },
    // Accepting State Node (Crisp Double-Circle Ring)
    {
      selector: 'node.accept-node',
      style: {
        'border-style': 'double',
        'border-width': 6.5,
        'border-color': '#34D399',
        color: '#34D399',
      },
    },
    // Trap State Node (Soft Violet, Dashed)
    {
      selector: 'node.trap-node',
      style: {
        'border-style': 'dashed',
        'border-color': '#A78BFA',
        color: '#DDD6FE',
        'font-size': '11.5px',
      },
    },
    // Active Simulation Node Highlight
    {
      selector: 'node.active-node',
      style: {
        'background-color': '#1E1B4B',
        'border-color': '#818CF8',
        'border-width': 3.5,
        color: '#FFFFFF',
      },
    },
    // START Dummy Node
    {
      selector: 'node.start-indicator-node',
      style: {
        label: 'START',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-family': 'JetBrains Mono, monospace',
        'font-size': '10.5px',
        'font-weight': 'bold',
        color: '#818CF8',
        'background-opacity': 0,
        'border-width': 0,
        width: 36,
        height: 20,
        events: 'no',
      },
    },
    // START Arrow Line
    {
      selector: 'edge.start-indicator-edge',
      style: {
        width: 2.2,
        'line-color': '#6366F1',
        'target-arrow-color': '#6366F1',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.95,
        'curve-style': 'straight',
        events: 'no',
      },
    },
    // Standard Transition Edge
    {
      selector: 'edge.dfa-edge',
      style: {
        label: 'data(label)',
        'font-family': 'JetBrains Mono, monospace',
        'font-size': '12px',
        'font-weight': 'bold',
        color: '#E2E8F0',
        'text-background-color': '#111827',
        'text-background-opacity': 1,
        'text-background-padding': '4px',
        'text-background-shape': 'roundrectangle',
        'text-border-color': '#334155',
        'text-border-width': 1,
        'text-border-opacity': 1,
        width: 2,
        'line-color': '#475569',
        'target-arrow-color': '#475569',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.85,
        'curve-style': 'bezier',
        'control-point-step-size': 32,
        'transition-property': 'line-color, target-arrow-color, width',
        'transition-duration': 0.15,
      },
    },
    // Bidirectional Curves Separation
    {
      selector: 'edge.bidi-edge',
      style: {
        'curve-style': 'bezier',
        'control-point-step-size': 38,
      },
    },
    // Self-loop Edges
    {
      selector: 'edge.self-edge',
      style: {
        'curve-style': 'bezier',
        'loop-direction': 'data(loopDirection)',
        'loop-sweep': '48deg',
        'control-point-step-size': 44,
      },
    },
    // Trap State Transition (Secondary dashed line)
    {
      selector: 'edge.trap-edge',
      style: {
        'line-color': '#7C3AED',
        'target-arrow-color': '#7C3AED',
        'line-style': 'dashed',
        'line-dash-pattern': [4, 3],
      },
    },
    // Highlighted Simulation Edge
    {
      selector: 'edge.active-edge',
      style: {
        width: 3,
        'line-color': '#818CF8',
        'target-arrow-color': '#818CF8',
        'text-border-color': '#818CF8',
      },
    },
    // Selected Node State
    {
      selector: 'node:selected',
      style: {
        'border-color': '#818CF8',
        'border-width': 3,
      },
    },
  ];
}

/**
 * Visual Balance & Framing Pass:
 * Centers the calculated automata diagram within the canvas viewport,
 * ensuring it comfortably occupies 55–75% of the usable canvas area
 * with natural whitespace.
 */
export function applyVisualBalancePass(cy: Core): void {
  if (!cy || cy.elements().length === 0) return;

  const container = cy.container();
  if (!container) return;

  const width = container.clientWidth || 700;
  const height = container.clientHeight || 460;

  // First center and fit with generous 55px margin
  cy.fit(undefined, 55);

  const bb = cy.elements().boundingBox();
  const currentZoom = cy.zoom();

  // Compute bounding box dimensions on screen
  const renderedW = bb.w * currentZoom;
  const renderedH = bb.h * currentZoom;

  const wRatio = renderedW / width;
  const hRatio = renderedH / height;
  const maxRatio = Math.max(wRatio, hRatio);

  // If the graph is occupying less than 52% or more than 78% of the canvas, adjust gently
  if (maxRatio < 0.52 && maxRatio > 0) {
    const scale = Math.min(0.65 / maxRatio, 1.35);
    cy.zoom(currentZoom * scale);
    cy.center();
  } else if (maxRatio > 0.78) {
    const scale = 0.72 / maxRatio;
    cy.zoom(currentZoom * scale);
    cy.center();
  } else {
    cy.center();
  }
}

