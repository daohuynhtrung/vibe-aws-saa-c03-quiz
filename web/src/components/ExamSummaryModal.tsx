import React, { useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question } from '../types';

interface ExamSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  examQuestions: Question[];
  userAnswers: Record<number, string[]>;
  onRetake: () => void;
  onReviewExam: () => void;
  timeSpentSeconds: number;
}

export const ExamSummaryModal: React.FC<ExamSummaryModalProps> = ({
  isOpen,
  onClose,
  examQuestions,
  userAnswers,
  onRetake,
  onReviewExam,
  timeSpentSeconds,
}) => {
  if (!isOpen) return null;

  const total = examQuestions.length;
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  // Domain score stats
  const domainStats: Record<string, { total: number; correct: number }> = {};

  examQuestions.forEach(q => {
    if (!domainStats[q.domain]) {
      domainStats[q.domain] = { total: 0, correct: 0 };
    }
    domainStats[q.domain].total++;

    const userSel = userAnswers[q.id];
    if (!userSel || userSel.length === 0) {
      unanswered++;
    } else {
      const isRight = userSel.length === q.answer.length && userSel.every(k => q.answer.includes(k));
      if (isRight) {
        correct++;
        domainStats[q.domain].correct++;
      } else {
        incorrect++;
      }
    }
  });

  // Scaled score formula (AWS 100-1000 scale)
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const scaledScore = Math.round(100 + (correct / total) * 900);
  const passed = scaledScore >= 720;

  useEffect(() => {
    if (passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [passed]);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className={`p-8 text-center border-b ${
          passed 
            ? 'bg-gradient-to-b from-emerald-950/50 to-slate-900 border-emerald-500/30' 
            : 'bg-gradient-to-b from-rose-950/50 to-slate-900 border-rose-500/30'
        }`}>
          <div className="inline-flex p-3 rounded-2xl mb-4 bg-slate-800/80 border border-slate-700 shadow-xl">
            <Award className={`w-10 h-10 ${passed ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {passed ? 'Congratulations! You Passed!' : 'Exam Completed'}
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            AWS Certified Solutions Architect – Associate (SAA-C03) Mock Simulation
          </p>

          {/* Scaled Score Card */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Scaled Score</div>
              <div className={`text-4xl sm:text-5xl font-mono font-black mt-1 ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {scaledScore}
                <span className="text-xs text-slate-500 font-sans font-normal ml-1">/ 1000</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Passing Score: 720</div>
            </div>

            <div className="h-12 w-px bg-slate-800 hidden sm:block" />

            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Accuracy</div>
              <div className="text-3xl sm:text-4xl font-mono font-black text-white mt-1">
                {percentage}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{correct} of {total} correct</div>
            </div>

            <div className="h-12 w-px bg-slate-800 hidden sm:block" />

            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Time Taken</div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-300 mt-1">
                {formatDuration(timeSpentSeconds)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Limit: 130 mins</div>
            </div>
          </div>
        </div>

        {/* Breakdown Body */}
        <div className="p-6 space-y-6">
          {/* Quick Stat Pill Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Correct</div>
                <div className="text-lg font-bold text-emerald-400">{correct}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Incorrect</div>
                <div className="text-lg font-bold text-rose-400">{incorrect}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Skipped</div>
                <div className="text-lg font-bold text-slate-300">{unanswered}</div>
              </div>
            </div>
          </div>

          {/* Domain Performance Breakdown */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Domain Performance Analysis</span>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {Object.entries(domainStats).map(([domain, stats]) => {
                const domPct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                return (
                  <div key={domain} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-200">{domain}</span>
                      <span className="font-mono text-slate-400">
                        {stats.correct}/{stats.total} ({domPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          domPct >= 72 ? 'bg-emerald-500' : domPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${domPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onRetake}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake New Mock Exam</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onReviewExam}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-colors"
            >
              <span>Review Exam Answers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
