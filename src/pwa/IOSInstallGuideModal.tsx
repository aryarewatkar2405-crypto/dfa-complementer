import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';

interface IOSInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallGuideModal: React.FC<IOSInstallGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
    >
      <div
        className="w-full max-w-md bg-[#0c0e17] border border-white/[0.12] rounded-2xl shadow-2xl p-6 text-slate-200 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-950/80 border border-brand-800/60 text-brand-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 id="ios-install-title" className="text-sm font-bold font-mono text-white">
                Install DFA Complementer
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                iOS / iPadOS Home Screen App
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions Steps */}
        <div className="space-y-3 font-mono text-xs">
          <p className="text-slate-300 text-[12px] leading-relaxed">
            Safari on iOS does not support one-click installation prompts, but you can add it directly to your Home Screen in 3 easy steps:
          </p>

          <div className="space-y-2.5 pt-1">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-900/90 border border-white/[0.06]">
              <div className="w-6 h-6 rounded-full bg-brand-600/30 border border-brand-500/50 text-brand-300 flex items-center justify-center font-bold shrink-0 text-[11px]">
                1
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <span>Tap the</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-dark-750 text-cyan-300 border border-white/[0.1]">
                    <Share className="w-3.5 h-3.5" /> Share
                  </span>
                  <span>button</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Located in the Safari toolbar (bottom on iPhone, top on iPad).
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-900/90 border border-white/[0.06]">
              <div className="w-6 h-6 rounded-full bg-brand-600/30 border border-brand-500/50 text-brand-300 flex items-center justify-center font-bold shrink-0 text-[11px]">
                2
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <span>Select</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-dark-750 text-brand-300 border border-white/[0.1]">
                    <PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Scroll down the share sheet menu to find this action.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-900/90 border border-white/[0.06]">
              <div className="w-6 h-6 rounded-full bg-brand-600/30 border border-brand-500/50 text-brand-300 flex items-center justify-center font-bold shrink-0 text-[11px]">
                3
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <span>Tap</span>
                  <span className="px-1.5 py-0.5 rounded bg-brand-600 text-white font-bold">
                    Add
                  </span>
                  <span>in the top right</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  DFA Complementer will appear on your Home Screen as a standalone app with offline support.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits badge */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-[11px] font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Full offline calculation & zero browser address bar.</span>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-mono font-semibold text-xs transition shadow-lg shadow-brand-900/30"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
