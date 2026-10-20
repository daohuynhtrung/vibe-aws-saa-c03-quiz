import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Bookmark, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedOptions: string[];
  isSubmitted: boolean;
  isBookmarked: boolean;
  onSelectOption: (key: string) => void;
  onSubmitAnswer: () => void;
  onClearSelection: () => void;
  onToggleBookmark: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOptions,
  isSubmitted,
  isBookmarked,
  onSelectOption,
  onSubmitAnswer,
  onClearSelection,
  onToggleBookmark,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
}) => {
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  const isMulti = question.is_multiselect;
  const expected = question.expected_count;
  const isCorrect = isSubmitted && 
    selectedOptions.length === question.answer.length &&
    selectedOptions.every(k => question.answer.includes(k));

  const canSubmit = selectedOptions.length > 0;

  // Domain badge colors
  const domainColor = (domain: string) => {
    switch (domain) {
      case 'Storage': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Database': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Compute': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Networking & Content Delivery': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Security, Identity & Compliance': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Application Integration & Serverless': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Management & Governance': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all">
      {/* Question Header */}
      <div className="border-b border-slate-800/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-slate-900/50">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-sm font-bold bg-amber-500 text-slate-950 px-2.5 py-1 rounded-md shadow-sm">
            #{question.id}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            ({currentIndex + 1} of {totalQuestions})
          </span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${domainColor(question.domain)}`}>
            {question.domain}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {isMulti ? `Choose ${expected} options` : 'Single Choice'}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-medium ${
              isBookmarked
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Bookmark this question (Press B or F)"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="px-6 py-6 border-b border-slate-800/60">
        <div className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed whitespace-pre-line select-text">
          {question.prompt}
        </div>
      </div>

      {/* Answer Options List */}
      <div className="p-6 space-y-3">
        {question.options.map((opt) => {
          const isSelected = selectedOptions.includes(opt.key);
          const isCorrectAnswer = question.answer.includes(opt.key);

          // Determine styles
          let itemStyle = 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700 text-slate-200';
          let badgeStyle = 'bg-slate-800 border-slate-700 text-slate-300';

          if (isSubmitted) {
            if (isCorrectAnswer) {
              itemStyle = 'border-emerald-500/60 bg-emerald-950/25 text-emerald-100 ring-1 ring-emerald-500/30';
              badgeStyle = 'bg-emerald-500 text-slate-950 font-bold border-emerald-400';
            } else if (isSelected && !isCorrectAnswer) {
              itemStyle = 'border-rose-500/60 bg-rose-950/25 text-rose-200 ring-1 ring-rose-500/30';
              badgeStyle = 'bg-rose-500 text-white font-bold border-rose-400';
            } else {
              itemStyle = 'border-slate-800/80 bg-slate-900/30 opacity-60 text-slate-400';
              badgeStyle = 'bg-slate-800/80 border-slate-700 text-slate-500';
            }
          } else if (isSelected) {
            itemStyle = 'border-amber-500/60 bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/40';
            badgeStyle = 'bg-amber-500 text-slate-950 font-bold border-amber-400';
          }

          return (
            <div
              key={opt.key}
              onClick={() => onSelectOption(opt.key)}
              className={`group flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer select-none ${itemStyle}`}
            >
              {/* Option Key Letter / Checkbox */}
              <div className="flex-shrink-0 pt-0.5">
                <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-mono font-semibold transition-all ${badgeStyle}`}>
                  {opt.key}
                </span>
              </div>

              {/* Option Text */}
              <div className="flex-1 text-sm sm:text-base leading-relaxed pt-0.5">
                {opt.text}
              </div>

              {/* Status Indicator Icon */}
              {isSubmitted && (
                <div className="flex-shrink-0 pt-0.5">
                  {isCorrectAnswer ? (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                      <CheckCircle className="w-4 h-4" />
                      <span className="hidden md:inline">Correct</span>
                    </div>
                  ) : isSelected ? (
                    <div className="flex items-center gap-1 text-rose-400 text-xs font-semibold bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                      <XCircle className="w-4 h-4" />
                      <span className="hidden md:inline">Incorrect</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Card Actions Footer */}
      <div className="border-t border-slate-800/80 bg-slate-900/60 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        {/* Left actions: Nav & Clear */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-all border border-slate-700"
            title="Previous Question (Arrow Left)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-all border border-slate-700"
            title="Next Question (Arrow Right)"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isSubmitted && selectedOptions.length > 0 && (
            <button
              onClick={onClearSelection}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition-colors"
            >
              Clear
            </button>
          )}

          {isSubmitted && (
            <button
              onClick={onClearSelection}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 px-2 py-1 rounded transition-colors"
              title="Reset choice and re-attempt"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>

        {/* Right actions: Submit Button */}
        <div>
          {!isSubmitted ? (
            <button
              onClick={onSubmitAnswer}
              disabled={!canSubmit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 disabled:cursor-not-allowed text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <span>Check Answer</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-950/20 text-slate-950">
                ↵ Enter
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
                isCorrect 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Incorrect (Correct: {question.answer.join(', ')})</span>
                  </>
                )}
              </div>

              {hasNext && (
                <button
                  onClick={onNext}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-semibold text-white border border-slate-700 transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Solution & Explanation Panel */}
      {isSubmitted && (
        <div className="border-t border-slate-800 bg-slate-950/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Explanation & Architectural Breakdown</span>
            </div>
            <div className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Answer: {question.answer.join(', ')}
            </div>
          </div>

          <div className="text-sm text-slate-300 leading-relaxed space-y-2 whitespace-pre-line bg-slate-900/60 p-4 rounded-xl border border-slate-800 font-normal">
            {question.explanation}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>AWS SAA-C03 Domains: Focus on high availability, decoupled architectures, and cost-effective storage.</span>
          </div>
        </div>
      )}
    </div>
  );
};
