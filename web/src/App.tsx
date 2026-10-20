import React, { useState, useEffect, useCallback, useMemo } from 'react';
import questionsData from './data/questions.json';
import { Question, PracticeMode } from './types';
import { Navbar } from './components/Navbar';
import { QuestionCard } from './components/QuestionCard';
import { QuestionDrawer } from './components/QuestionDrawer';
import { ExamSummaryModal } from './components/ExamSummaryModal';
import { KeyboardHelpModal } from './components/KeyboardHelpModal';
import { 
  Sparkles, 
  Award, 
  BookOpen, 
  Bookmark, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';

const STORAGE_ANSWERS = 'aws_saa_c03_user_answers';
const STORAGE_SUBMITTED = 'aws_saa_c03_submitted';
const STORAGE_BOOKMARKS = 'aws_saa_c03_bookmarks';
const STORAGE_DARK = 'aws_saa_c03_dark';
const EXAM_TOTAL_TIME = 130 * 60; // 130 minutes in seconds

export const App: React.FC = () => {
  const allQuestions = questionsData as Question[];

  // App & Theme states
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_DARK);
    return saved !== null ? saved === 'true' : true;
  });

  const [mode, setMode] = useState<PracticeMode>('practice');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // User persistent state
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ANSWERS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [submitted, setSubmitted] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SUBMITTED);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BOOKMARKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Exam state
  const [examActive, setExamActive] = useState<boolean>(false);
  const [examQuestionIds, setExamQuestionIds] = useState<number[]>([]);
  const [examTimeRemaining, setExamTimeRemaining] = useState<number>(EXAM_TOTAL_TIME);
  const [examTimeSpent, setExamTimeSpent] = useState<number>(0);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_DARK, String(isDark));
  }, [isDark]);

  // Sync progress
  useEffect(() => {
    localStorage.setItem(STORAGE_ANSWERS, JSON.stringify(userAnswers));
  }, [userAnswers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_SUBMITTED, JSON.stringify(submitted));
  }, [submitted]);

  useEffect(() => {
    localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Exam timer ticker
  useEffect(() => {
    let interval: any = null;
    if (mode === 'exam' && examActive && examTimeRemaining > 0) {
      interval = setInterval(() => {
        setExamTimeRemaining(prev => {
          if (prev <= 1) {
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
        setExamTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, examActive, examTimeRemaining]);

  // Determine active questions list based on Mode
  const activeQuestions: Question[] = useMemo(() => {
    if (mode === 'practice') {
      return allQuestions;
    } else if (mode === 'exam') {
      if (examQuestionIds.length === 0) return [];
      return examQuestionIds.map(id => allQuestions.find(q => q.id === id)!).filter(Boolean);
    } else if (mode === 'review') {
      // Questions that are either bookmarked or answered incorrectly
      const reviewSet = allQuestions.filter(q => {
        const isMarked = bookmarks.includes(q.id);
        const isSub = !!submitted[q.id];
        const userSel = userAnswers[q.id] || [];
        const isWrong = isSub && !(userSel.length === q.answer.length && userSel.every(k => q.answer.includes(k)));
        return isMarked || isWrong;
      });
      return reviewSet.length > 0 ? reviewSet : allQuestions;
    }
    return allQuestions;
  }, [mode, allQuestions, examQuestionIds, bookmarks, submitted, userAnswers]);

  // Keep currentIndex bounded
  useEffect(() => {
    if (currentIndex >= activeQuestions.length && activeQuestions.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeQuestions.length, currentIndex]);

  const currentQuestion: Question | undefined = activeQuestions[currentIndex];

  // Start new mock exam
  const handleStartNewExam = useCallback(() => {
    // Randomly pick 65 unique questions
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selected65 = shuffled.slice(0, 65).map(q => q.id);
    setExamQuestionIds(selected65);
    setExamTimeRemaining(EXAM_TOTAL_TIME);
    setExamTimeSpent(0);
    setExamActive(true);
    setCurrentIndex(0);
    setIsSummaryOpen(false);
  }, [allQuestions]);

  // Finish exam
  const handleFinishExam = useCallback(() => {
    setExamActive(false);
    // Mark all exam questions as submitted for scoring
    setSubmitted(prev => {
      const next = { ...prev };
      examQuestionIds.forEach(id => {
        next[id] = true;
      });
      return next;
    });
    setIsSummaryOpen(true);
  }, [examQuestionIds]);

  // Selection handler
  const handleSelectOption = useCallback((key: string) => {
    if (!currentQuestion) return;
    const qid = currentQuestion.id;
    const isSub = !!submitted[qid];

    // If already submitted in practice mode, selecting retry clears it
    if (isSub && mode === 'practice') {
      return;
    }

    const currentSelected = userAnswers[qid] || [];
    let updated: string[];

    if (currentQuestion.is_multiselect) {
      if (currentSelected.includes(key)) {
        updated = currentSelected.filter(k => k !== key);
      } else {
        // Multi-select: cap at expected count
        if (currentSelected.length < currentQuestion.expected_count) {
          updated = [...currentSelected, key];
        } else {
          // Replace oldest selection
          updated = [...currentSelected.slice(1), key];
        }
      }
    } else {
      // Single select: replace
      updated = [key];
    }

    setUserAnswers(prev => ({ ...prev, [qid]: updated }));
  }, [currentQuestion, submitted, mode, userAnswers]);

  // Submit answer handler
  const handleSubmitAnswer = useCallback(() => {
    if (!currentQuestion) return;
    const qid = currentQuestion.id;
    const sel = userAnswers[qid] || [];
    if (sel.length === 0) return;

    setSubmitted(prev => ({ ...prev, [qid]: true }));
  }, [currentQuestion, userAnswers]);

  // Clear answer
  const handleClearSelection = useCallback(() => {
    if (!currentQuestion) return;
    const qid = currentQuestion.id;
    setUserAnswers(prev => {
      const next = { ...prev };
      delete next[qid];
      return next;
    });
    setSubmitted(prev => {
      const next = { ...prev };
      delete next[qid];
      return next;
    });
  }, [currentQuestion]);

  // Bookmark toggle
  const handleToggleBookmark = useCallback(() => {
    if (!currentQuestion) return;
    const qid = currentQuestion.id;
    setBookmarks(prev => 
      prev.includes(qid) ? prev.filter(id => id !== qid) : [...prev, qid]
    );
  }, [currentQuestion]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, activeQuestions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleSelectQuestionById = useCallback((id: number) => {
    const idx = activeQuestions.findIndex(q => q.id === id);
    if (idx !== -1) {
      setCurrentIndex(idx);
    } else {
      // If question is not in active list (e.g. In review mode), switch to practice mode and jump
      setMode('practice');
      const allIdx = allQuestions.findIndex(q => q.id === id);
      if (allIdx !== -1) {
        setCurrentIndex(allIdx);
      }
    }
  }, [activeQuestions, allQuestions]);

  // Reset all progress
  const handleResetProgress = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all answers and progress? This cannot be undone.')) {
      setUserAnswers({});
      setSubmitted({});
      setBookmarks([]);
      localStorage.removeItem(STORAGE_ANSWERS);
      localStorage.removeItem(STORAGE_SUBMITTED);
      localStorage.removeItem(STORAGE_BOOKMARKS);
    }
  }, []);

  // Export progress to a JSON file download
  const handleExportProgress = useCallback(() => {
    const data = {
      userAnswers,
      submitted,
      bookmarks,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aws-saa-c03-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [userAnswers, submitted, bookmarks]);

  // Import progress from a JSON file
  const handleImportProgress = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.userAnswers && typeof parsed.userAnswers === 'object') {
          setUserAnswers(parsed.userAnswers);
        }
        if (parsed.submitted && typeof parsed.submitted === 'object') {
          setSubmitted(parsed.submitted);
        }
        if (Array.isArray(parsed.bookmarks)) {
          setBookmarks(parsed.bookmarks);
        }
        alert('Progress successfully imported! Your study session is restored.');
      } catch (err) {
        alert('Invalid progress file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  // Global Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        if (e.key === 'Escape') {
          setIsDrawerOpen(false);
          setIsHelpOpen(false);
          setIsSummaryOpen(false);
        }
        return;
      }

      const key = e.key.toUpperCase();

      // Remap 1, 2, 3, 4, 5 to A, B, C, D, E
      const numToOptionMap: Record<string, string> = {
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D',
        '5': 'E',
      };

      const mappedKey = numToOptionMap[e.key] || key;

      if (['A', 'B', 'C', 'D', 'E'].includes(mappedKey) && !e.ctrlKey && !e.metaKey) {
        handleSelectOption(mappedKey);
      } else if (e.key === 'Enter') {
        handleSubmitAnswer();
      } else if (e.key === 'ArrowRight' || key === 'K') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || key === 'J') {
        handlePrev();
      } else if (key === 'F') {
        handleToggleBookmark();
      } else if (key === 'Q') {
        setIsDrawerOpen(prev => !prev);
      } else if (e.key === '?') {
        setIsHelpOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsHelpOpen(false);
        setIsSummaryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectOption, handleSubmitAnswer, handleNext, handlePrev, handleToggleBookmark]);

  // Overall Statistics
  const totalAnswered = Object.keys(submitted).length;
  let totalCorrect = 0;
  Object.keys(submitted).forEach(idStr => {
    const id = parseInt(idStr, 10);
    const q = allQuestions.find(item => item.id === id);
    if (q) {
      const userSel = userAnswers[id] || [];
      if (userSel.length === q.answer.length && userSel.every(k => q.answer.includes(k))) {
        totalCorrect++;
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        mode={mode}
        setMode={newMode => {
          setMode(newMode);
          if (newMode === 'exam' && !examActive && examQuestionIds.length === 0) {
            handleStartNewExam();
          }
        }}
        examActive={examActive}
        timeRemaining={examTimeRemaining}
        onFinishExam={handleFinishExam}
        onResetProgress={handleResetProgress}
        onExportProgress={handleExportProgress}
        onImportProgress={handleImportProgress}
        onToggleDrawer={() => setIsDrawerOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        isDark={isDark}
        setIsDark={setIsDark}
        totalAnswered={totalAnswered}
        totalCorrect={totalCorrect}
        totalQuestions={allQuestions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Exam Mode Banner */}
        {mode === 'exam' && !examActive && examQuestionIds.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-5 my-8 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">AWS SAA-C03 Exam Simulation</h2>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                Test your knowledge with 65 timed questions randomly sampled from the question bank. Simulates the official AWS exam environment with a 130-minute timer and 720/1000 passing scale.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>65 Questions</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>130 Minutes</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Pass: 720 / 1000</span>
              </div>
            </div>
            <button
              onClick={handleStartNewExam}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 mx-auto transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Begin Exam Simulation</span>
            </button>
          </div>
        )}

        {/* Review Mode Banner */}
        {mode === 'review' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>
                Reviewing <strong>{activeQuestions.length}</strong> questions (Bookmarked or Incorrect).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Total Bookmarks: {bookmarks.length}</span>
            </div>
          </div>
        )}

        {/* Question View */}
        {currentQuestion && (mode !== 'exam' || examActive || examQuestionIds.length > 0) && (
          <div className="space-y-6">
            <QuestionCard
              question={currentQuestion}
              currentIndex={currentIndex}
              totalQuestions={activeQuestions.length}
              selectedOptions={userAnswers[currentQuestion.id] || []}
              isSubmitted={!!submitted[currentQuestion.id]}
              isBookmarked={bookmarks.includes(currentQuestion.id)}
              onSelectOption={handleSelectOption}
              onSubmitAnswer={handleSubmitAnswer}
              onClearSelection={handleClearSelection}
              onToggleBookmark={handleToggleBookmark}
              onNext={handleNext}
              onPrev={handlePrev}
              hasPrev={currentIndex > 0}
              hasNext={currentIndex < activeQuestions.length - 1}
            />

            {/* Quick Tips */}
            <div className="hidden sm:flex items-center justify-between text-[11px] text-slate-500 px-2">
              <div className="flex items-center gap-4">
                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">1-5</kbd> (or <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">A-E</kbd>) to select</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Enter</kbd> to check</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">← / →</kbd> to navigate</span>
              </div>
              <div>
                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Q</kbd> for Question Drawer</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Slide-over Question Navigator Drawer */}
      <QuestionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        questions={allQuestions}
        currentQuestionId={currentQuestion ? currentQuestion.id : 1}
        onSelectQuestion={handleSelectQuestionById}
        userAnswers={userAnswers}
        submitted={submitted}
        bookmarks={bookmarks}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Exam Score Summary Modal */}
      <ExamSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        examQuestions={examQuestionIds.map(id => allQuestions.find(q => q.id === id)!).filter(Boolean)}
        userAnswers={userAnswers}
        onRetake={handleStartNewExam}
        onReviewExam={() => {
          setIsSummaryOpen(false);
          setCurrentIndex(0);
        }}
        timeSpentSeconds={examTimeSpent}
      />
    </div>
  );
};
