import type { DFA } from '../../types/dfa';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  isStart: boolean;
  isAccept: boolean;
  isTrap: boolean;
  incomingEdges: number;
  outgoingEdges: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  symbols: string[];
  label: string;
  isSelfLoop: boolean;
  isBidirectional: boolean;
  curvature: number;
  controlPoint?: { x: number; y: number };
  isTrapEdge: boolean;
}

/**
 * Computes an optimized layout for DFA nodes and edges in SVG space with left-to-right flow.
 */
export function computeGraphLayout(
  dfa: DFA,
  width: number = 600,
  height: number = 400,
  customPositions?: Record<string, { x: number; y: number }>
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const states = dfa.states || [];
  const startState = dfa.startState;
  const acceptSet = new Set(dfa.acceptStates || []);
  const trapSet = new Set(dfa.trapStates || []);
  const nodeRadius = 24;

  // Group transitions by source -> target
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

  // Usable area
  const cx = width / 2;
  const cy = height / 2;
  const usableWidth = Math.max(width - 120, 240);
  const usableHeight = Math.max(height - 100, 200);

  const nodes: GraphNode[] = [];
  const n = states.length;

  states.forEach((stateId, index) => {
    let x = cx;
    let y = cy;

    if (customPositions && customPositions[stateId]) {
      x = customPositions[stateId].x;
      y = customPositions[stateId].y;
    } else {
      // 1 State
      if (n === 1) {
        x = cx;
        y = cy;
      }
      // 2 States: Start on left, other on right
      else if (n === 2) {
        const isSt = stateId === startState;
        x = cx + (isSt ? -usableWidth * 0.28 : usableWidth * 0.28);
        y = cy;
      }
      // 3 States: Left-to-right chain if start -> other -> other
      else if (n === 3) {
        if (stateId === startState) {
          x = cx - usableWidth * 0.32;
          y = cy;
        } else {
          const nonStart = states.filter((s) => s !== startState);
          const idx = nonStart.indexOf(stateId);
          x = cx + (idx === 0 ? 0 : usableWidth * 0.32);
          y = cy;
        }
      }
      // 4 States (especially with a Trap state)
      else if (n === 4) {
        if (trapSet.has(stateId)) {
          // Trap state placed neatly at bottom center
          x = cx;
          y = cy + usableHeight * 0.34;
        } else if (stateId === startState) {
          x = cx - usableWidth * 0.34;
          y = cy - usableHeight * 0.12;
        } else {
          const normalNonStart = states.filter((s) => s !== startState && !trapSet.has(s));
          const idx = normalNonStart.indexOf(stateId);
          if (idx === 0) {
            x = cx;
            y = cy - usableHeight * 0.22;
          } else {
            x = cx + usableWidth * 0.34;
            y = cy - usableHeight * 0.12;
          }
        }
      }
      // 5+ States: Elliptical layout with start on far left
      else {
        const startIdx = states.indexOf(startState);
        const relativeIdx = (index - (startIdx !== -1 ? startIdx : 0) + n) % n;
        const angle = Math.PI + (2 * Math.PI * relativeIdx) / n;
        const rx = usableWidth * 0.38;
        const ry = usableHeight * 0.34;
        x = cx + rx * Math.cos(angle);
        y = cy + ry * Math.sin(angle);
      }
    }

    nodes.push({
      id: stateId,
      x,
      y,
      radius: nodeRadius,
      isStart: stateId === startState,
      isAccept: acceptSet.has(stateId),
      isTrap: trapSet.has(stateId),
      incomingEdges: 0,
      outgoingEdges: 0,
    });
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Build edges
  const edges: GraphEdge[] = [];

  for (const [key, symbols] of Object.entries(edgeMap)) {
    const [sourceId, targetId] = key.split('->');
    const sourceNode = nodeMap.get(sourceId);
    const targetNode = nodeMap.get(targetId);

    if (!sourceNode || !targetNode) continue;

    const isSelfLoop = sourceId === targetId;
    const reverseKey = `${targetId}->${sourceId}`;
    const isBidirectional = !isSelfLoop && !!edgeMap[reverseKey];
    const isTrapEdge = trapSet.has(targetId) || trapSet.has(sourceId);

    let curvature = 0;
    let controlPoint: { x: number; y: number } | undefined;

    if (isSelfLoop) {
      curvature = 1;
    } else if (isBidirectional) {
      // Curve outward to prevent overlap
      curvature = 0.25;
      const dx = targetNode.x - sourceNode.x;
      const dy = targetNode.y - sourceNode.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const midX = (sourceNode.x + targetNode.x) / 2;
      const midY = (sourceNode.y + targetNode.y) / 2;

      // Perpendicular normal vector
      const nx = -dy / dist;
      const ny = dx / dist;
      const offset = 32;
      controlPoint = {
        x: midX + nx * offset,
        y: midY + ny * offset,
      };
    }

    edges.push({
      id: key,
      source: sourceId,
      target: targetId,
      symbols: symbols.sort(),
      label: symbols.sort().join(', '),
      isSelfLoop,
      isBidirectional,
      curvature,
      controlPoint,
      isTrapEdge,
    });
  }

  return { nodes, edges };
}
