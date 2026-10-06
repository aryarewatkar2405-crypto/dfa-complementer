import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { type Core, type EventObject } from 'cytoscape';
import type { DFA, DFAViewMode } from '../../types/dfa';
import {
  buildCytoscapeElements,
  getCytoscapeStylesheet,
  applyVisualBalancePass,
} from './dfaGraphEngine';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface DFAVisualizerProps {
  dfa: DFA;
  title?: string;
  viewMode?: DFAViewMode;
  activeStateId?: string | null;
  activeEdgeId?: string | null;
  animatingProgress?: number;
  onStateSelect?: (stateId: string | null) => void;
  className?: string;
  isMiniPreview?: boolean;
}

export const DFAVisualizer: React.FC<DFAVisualizerProps> = ({
  dfa,
  title,
  activeStateId = null,
  activeEdgeId = null,
  onStateSelect,
  className = '',
  isMiniPreview = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const prevStructureKeyRef = useRef<string>('');

  const [selectedNodeInfo, setSelectedNodeInfo] = useState<{
    id: string;
    isStart: boolean;
    isAccept: boolean;
    isTrap: boolean;
  } | null>(null);

  // Compute structure signature: only changes when states, transitions, or trap states change
  const structureKey = `${dfa.states.join(',')}|${Object.entries(dfa.transitions)
    .map(([s, t]) => `${s}:${Object.entries(t).sort().join(';')}`)
    .join('|')}|${dfa.startState}|${dfa.trapStates?.join(',') || ''}`;

  // Initialize and Update Cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width || 700;
    const h = rect.height || 460;

    const elements = buildCytoscapeElements(dfa, activeStateId, activeEdgeId, w, h);
    const isStructureChanged = prevStructureKeyRef.current !== structureKey;
    prevStructureKeyRef.current = structureKey;

    if (!cyRef.current) {
      // First mount: instantiate Cytoscape with calculated topology positions
      const cy = cytoscape({
        container: containerRef.current,
        elements,
        layout: {
          name: 'preset',
        },
        style: getCytoscapeStylesheet(),
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
        minZoom: 0.35,
        maxZoom: 2.5,
        wheelSensitivity: 0.2,
      });

      // Node selection listeners
      cy.on('tap', 'node', (evt: EventObject) => {
        const node = evt.target;
        if (node.id() === '__start_indicator__') return;

        const rawId = node.data('rawId');
        setSelectedNodeInfo({
          id: rawId,
          isStart: node.data('isStart'),
          isAccept: node.data('isAccept'),
          isTrap: node.data('isTrap'),
        });
        if (onStateSelect) onStateSelect(rawId);
      });

      cy.on('tap', (evt: EventObject) => {
        if (evt.target === cy) {
          setSelectedNodeInfo(null);
          if (onStateSelect) onStateSelect(null);
        }
      });

      // Hover feedback: highlight incident edges
      cy.on('mouseover', 'node', (evt: EventObject) => {
        const node = evt.target;
        if (node.id() === '__start_indicator__') return;
        node
          .connectedEdges()
          .style({ 'line-color': '#818CF8', 'target-arrow-color': '#818CF8' });
      });

      cy.on('mouseout', 'node', (evt: EventObject) => {
        const node = evt.target;
        if (node.id() === '__start_indicator__') return;
        cy.edges('.dfa-edge:not(.trap-edge):not(.active-edge)').style({
          'line-color': '#475569',
          'target-arrow-color': '#475569',
        });
        cy.edges('.trap-edge:not(.active-edge)').style({
          'line-color': '#7C3AED',
          'target-arrow-color': '#7C3AED',
        });
      });

      cyRef.current = cy;

      // Apply initial balanced framing pass
      cy.ready(() => {
        applyVisualBalancePass(cy);
      });
    } else {
      const cy = cyRef.current;

      if (isStructureChanged) {
        // Structure changed: re-insert elements with new topology coordinates
        cy.batch(() => {
          cy.elements().remove();
          cy.add(elements);
        });
        applyVisualBalancePass(cy);
      } else {
        // Visual state only changed (e.g., F inversion or simulation step)
        // Update styling classes without touching node positions
        cy.batch(() => {
          const acceptSet = new Set(dfa.acceptStates || []);
          cy.nodes('.dfa-node').forEach((node) => {
            const rawId = node.data('rawId');
            const isAccept = acceptSet.has(rawId);
            const isActive = activeStateId === rawId;

            node.data('isAccept', isAccept);
            if (isAccept) {
              node.addClass('accept-node');
            } else {
              node.removeClass('accept-node');
            }

            if (isActive) {
              node.addClass('active-node');
            } else {
              node.removeClass('active-node');
            }
          });

          cy.edges('.dfa-edge').forEach((edge) => {
            if (edge.id() === activeEdgeId) {
              edge.addClass('active-edge');
            } else {
              edge.removeClass('active-edge');
            }
          });
        });
      }
    }
  }, [dfa, structureKey, activeStateId, activeEdgeId, onStateSelect]);

  // Window / container resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (cyRef.current) {
        const cy = cyRef.current;
        cy.resize();
        applyVisualBalancePass(cy);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []);

  // Toolbar Viewport Controls
  const handleZoomIn = () => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    cy.zoom({
      level: cy.zoom() * 1.25,
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    });
  };

  const handleZoomOut = () => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    cy.zoom({
      level: cy.zoom() * 0.8,
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    });
  };

  const handleFit = () => {
    if (!cyRef.current) return;
    applyVisualBalancePass(cyRef.current);
  };

  const handleReset = () => {
    if (!cyRef.current) return;
    applyVisualBalancePass(cyRef.current);
  };

  return (
    <div
      className={`relative w-full h-full min-h-[360px] bg-[#0B1020] overflow-hidden select-none ${className}`}
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Optional Standalone Header Banner */}
      {title && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#111827]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#334155] shadow-md">
          <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase font-mono">
            {title}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            ({dfa.states.length} states)
          </span>
        </div>
      )}

      {/* Floating Toolbar Controls */}
      {!isMiniPreview && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#111827]/90 backdrop-blur-md p-1 rounded-lg border border-[#334155] shadow-lg">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-[#1E293B] rounded transition"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-[#1E293B] rounded transition"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleFit}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-[#1E293B] rounded transition"
            title="Fit graph"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-[#1E293B] rounded transition"
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cytoscape Container Element */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* State Inspector Drawer */}
      {selectedNodeInfo && !isMiniPreview && (
        <div className="absolute bottom-3 left-3 z-10 bg-[#111827]/95 backdrop-blur-md border border-[#334155] rounded-lg p-3 text-xs shadow-2xl max-w-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-3 border-b border-[#334155] pb-1.5 mb-2">
            <span className="font-mono font-bold text-slate-100 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedNodeInfo.isAccept ? 'bg-[#34D399]' : 'bg-[#64748B]'
                }`}
              />
              State: {selectedNodeInfo.id}
            </span>
            <button
              type="button"
              onClick={() => setSelectedNodeInfo(null)}
              className="text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1 text-slate-300 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Type:</span>
              <span className="font-semibold text-slate-200">
                {selectedNodeInfo.isStart ? 'Start ' : ''}
                {selectedNodeInfo.isAccept
                  ? 'Accepting (Final)'
                  : 'Non-accepting'}
                {selectedNodeInfo.isTrap ? ' · Dead State' : ''}
              </span>
            </div>
            <div className="pt-1 border-t border-[#334155]">
              <span className="text-slate-400 block mb-0.5">
                Transitions δ({selectedNodeInfo.id}, c):
              </span>
              {Object.entries(dfa.transitions[selectedNodeInfo.id] || {}).map(
                ([sym, target]) => (
                  <div key={sym} className="flex justify-between pl-2">
                    <span className="text-[#818CF8]">on '{sym}'</span>
                    <span className="text-slate-200">→ {target}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend Badge */}
      {!isMiniPreview && (
        <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-3 bg-[#111827]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#334155] text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-[#34D399] bg-[#34D399]/20" />
            <span>Accepting (F)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-[#475569] bg-[#151B2E]" />
            <span>Non-accepting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-[#A78BFA] border-dashed bg-[#151B2E]" />
            <span>Trap State</span>
          </div>
        </div>
      )}
    </div>
  );
};
