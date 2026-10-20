import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Bookmark, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Filter,
  ArrowRight
} from 'lucide-react';
import { Question, FilterStatus } from '../types';

interface QuestionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  currentQuestionId: number;
  onSelectQuestion: (id: number) => void;
  userAnswers: Record<number, string[]>;
  submitted: Record<number, boolean>;
  bookmarks: number[];
}

export const QuestionDrawer: React.FC<QuestionDrawerProps> = ({
  isOpen,
  onClose,
  questions,
  currentQuestionId,
  onSelectQuestion,
  userAnswers,
  submitted,
  bookmarks,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [jumpInput, setJumpInput] = useState('');

  if (!isOpen) return null;

  // Calculate status counts
  const totalCount = questions.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  questions.forEach(q => {
    if (!submitted[q.id]) {
      unansweredCount++;
    } else {
      const userSel = userAnswers[q.id] || [];
      const isRight = userSel.length === q.answer.length && userSel.every(k => q.answer.includes(k));
      if (isRight) correctCount++;
      else incorrectCount++;
    }
  });

  const bookmarkCount = bookmarks.length;

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    // Domain filter
    if (domainFilter !== 'all' && q.domain !== domainFilter) return false;

    // Status filter
    const isSub = !!submitted[q.id];
    const isBookmarked = bookmarks.includes(q.id);
    const userSel = userAnswers[q.id] || [];
    const isRight = isSub && userSel.length === q.answer.length && userSel.every(k => q.answer.includes(k));

    if (statusFilter === 'unanswered' && isSub) return false;
    if (statusFilter === 'correct' && (!isSub || !isRight)) return false;
    if (statusFilter === 'incorrect' && (!isSub || isRight)) return false;
    if (statusFilter === 'bookmarked' && !isBookmarked) return false;

    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchPrompt = q.prompt.toLowerCase().includes(term);
      const matchId = q.id.toString() === term;
      const matchOpts = q.options.some(o => o.text.toLowerCase().includes(term));
      if (!matchPrompt && !matchId && !matchOpts) return false;
    }

    return true;
  });

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpInput, 10);
    if (!isNaN(num) && num >= 1 && num <= questions.length) {
      onSelectQuestion(num);
      onClose();
    }
  };

  const domains = Array.from(new Set(questions.map(q => q.domain))).sort();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Question Navigator</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {filteredQuestions.length}/{totalCount}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Click any question to jump directly</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Jump & Search Form */}
          <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/50">
            {/* Quick jump */}
            <form onSubmit={handleJump} className="flex gap-2">
              <input
                type="number"
                min="1"
                max={questions.length}
                placeholder={`Jump to Q# (1-${questions.length})...`}
                value={jumpInput}
                onChange={e => setJumpInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
              >
                <span>Go</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Keyword Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search keywords, services (e.g. S3, RDS, Aurora)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Domain Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={domainFilter}
                onChange={e => setDomainFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Domains ({totalCount})</option>
                {domains.map(d => (
                  <option key={d} value={d}>
                    {d} ({questions.filter(q => q.domain === d).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-100 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('correct')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  statusFilter === 'correct'
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{correctCount}</span>
              </button>
              <button
                onClick={() => setStatusFilter('incorrect')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  statusFilter === 'incorrect'
                    ? 'bg-rose-500 text-white font-semibold'
                    : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                }`}
              >
                <XCircle className="w-3 h-3" />
                <span>{incorrectCount}</span>
              </button>
              <button
                onClick={() => setStatusFilter('unanswered')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'unanswered'
                    ? 'bg-slate-400 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Unanswered ({unansweredCount})
              </button>
              <button
                onClick={() => setStatusFilter('bookmarked')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  statusFilter === 'bookmarked'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>{bookmarkCount}</span>
              </button>
            </div>
          </div>

          {/* Grid of Question Pills */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No questions match your current filter.
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {filteredQuestions.map(q => {
                  const isCurrent = q.id === currentQuestionId;
                  const isSub = !!submitted[q.id];
                  const userSel = userAnswers[q.id] || [];
                  const isRight = isSub && userSel.length === q.answer.length && userSel.every(k => q.answer.includes(k));
                  const isMarked = bookmarks.includes(q.id);

                  let bgStyle = 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700';

                  if (isSub) {
                    if (isRight) {
                      bgStyle = 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 font-semibold hover:bg-emerald-900/70';
                    } else {
                      bgStyle = 'bg-rose-950/70 border-rose-500/50 text-rose-300 font-semibold hover:bg-rose-900/70';
                    }
                  }

                  if (isCurrent) {
                    bgStyle += ' ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        onSelectQuestion(q.id);
                        onClose();
                      }}
                      className={`relative h-10 rounded-lg border text-xs font-mono font-medium flex items-center justify-center transition-all ${bgStyle}`}
                    >
                      <span>{q.id}</span>
                      {isMarked && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Legend */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/90 text-[11px] text-slate-400 flex items-center justify-around">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Incorrect</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
