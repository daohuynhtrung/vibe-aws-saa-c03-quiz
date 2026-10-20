import React from 'react';
import { 
  Cloud, 
  Award, 
  BookOpen, 
  Bookmark, 
  Clock, 
  RotateCcw, 
  HelpCircle, 
  Menu,
  Sun,
  Moon,
  CheckCircle2,
  Download,
  Upload
} from 'lucide-react';
import { PracticeMode, SyncStatus } from '../types';

interface NavbarProps {
  mode: PracticeMode;
  setMode: (mode: PracticeMode) => void;
  syncStatus: SyncStatus;
  examActive: boolean;
  timeRemaining: number;
  onFinishExam: () => void;
  onResetProgress: () => void;
  onExportProgress: () => void;
  onImportProgress: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleDrawer: () => void;
  onOpenHelp: () => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  totalAnswered: number;
  totalCorrect: number;
  totalQuestions: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  setMode,
  syncStatus,
  examActive,
  timeRemaining,
  onFinishExam,
  onResetProgress,
  onExportProgress,
  onImportProgress,
  onToggleDrawer,
  onOpenHelp,
  isDark,
  setIsDark,
  totalAnswered,
  totalCorrect,
  totalQuestions,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Logo & Drawer trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDrawer}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Toggle Question Navigator (Press Q)"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMode('practice')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white leading-none">
                AWS SAA-C03
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Exam Prep
                </span>
              </div>
              <p className="text-xs text-slate-400">Solutions Architect Associate</p>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs sm:text-sm">
          <button
            onClick={() => setMode('practice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'practice'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Practice Mode</span>
            <span className="md:hidden">Practice</span>
          </button>

          <button
            onClick={() => setMode('exam')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'exam'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span className="hidden md:inline">Exam Simulation</span>
            <span className="md:hidden">Exam</span>
          </button>

          <button
            onClick={() => setMode('review')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'review'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden md:inline">Review & Saved</span>
            <span className="md:hidden">Review</span>
          </button>
        </div>

        {/* Exam Timer & Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {mode === 'exam' && examActive && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg text-amber-400 font-mono text-xs sm:text-sm font-semibold">
              <Clock className="w-4 h-4 animate-pulse text-amber-400" />
              <span>{formatTime(timeRemaining)}</span>
              <button
                onClick={onFinishExam}
                className="ml-2 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-bold transition-colors"
              >
                Submit
              </button>
            </div>
          )}

          {mode !== 'exam' && (
            <div className="hidden lg:flex items-center gap-3 text-xs bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-lg text-slate-300">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {totalCorrect}/{totalAnswered} ({accuracy}%)
                </span>
              </div>
              <div className="text-slate-500">|</div>
              <div>Bank: {totalQuestions} Qs</div>
            </div>
          )}

          {/* Real-time Repo Sync Status */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
              syncStatus === 'synced'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : syncStatus === 'saving'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Auto-synced with data/user_progress.json in your local repository"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : syncStatus === 'saving'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            <span className="hidden md:inline">
              {syncStatus === 'synced'
                ? 'Repo Synced'
                : syncStatus === 'saving'
                ? 'Saving...'
                : 'Local'}
            </span>
          </div>

          {/* Export / Backup Progress */}
          <button
            onClick={onExportProgress}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Export / Download Progress JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import / Restore Progress */}
          <label
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Import / Restore Progress JSON"
          >
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              onChange={onImportProgress}
              className="hidden"
            />
          </label>

          {/* Quick Help & Settings */}
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onResetProgress}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 transition-colors"
            title="Reset All Progress"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
