import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelpModal: React.FC<KeyboardHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1, 2, 3, 4, 5', desc: 'Select or toggle option choice (or A, B, C, D, E)' },
    { key: 'Enter', desc: 'Submit and reveal answer / Check answer' },
    { key: '→ or K', desc: 'Go to next question' },
    { key: '← or J', desc: 'Go to previous question' },
    { key: 'B or F', desc: 'Toggle bookmark / flag current question' },
    { key: 'Q', desc: 'Open / close Question Navigator drawer' },
    { key: '?', desc: 'Toggle this keyboard shortcuts dialog' },
    { key: 'Esc', desc: 'Close open dialogs or drawers' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0">
              <span className="text-slate-300 font-medium">{s.desc}</span>
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md font-mono text-amber-400 font-semibold shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors border border-slate-700"
          >
            Got it, back to quiz
          </button>
        </div>
      </div>
    </div>
  );
};
