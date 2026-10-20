export interface QuestionOption {
  key: string;
  text: string;
}

export interface Question {
  id: number;
  title: string;
  prompt: string;
  options: QuestionOption[];
  is_multiselect: boolean;
  expected_count: number;
  domain: string;
  answer: string[];
  explanation: string;
}

export type PracticeMode = 'practice' | 'exam' | 'review';

export type FilterStatus = 'all' | 'unanswered' | 'correct' | 'incorrect' | 'bookmarked';

export type SyncStatus = 'synced' | 'saving' | 'offline' | 'error';

export interface PersistentProgress {
  lastQuestionId: number;
  lastUpdated: string;
  userAnswers: Record<number, string[]>;
  submitted: Record<number, boolean>;
  bookmarks: number[];
}

export interface UserProgress {
  answers: Record<number, string[]>;
  submitted: Record<number, boolean>;
  bookmarks: number[];
}

export interface ExamSession {
  active: boolean;
  questionIds: number[];
  currentIndex: number;
  timeRemainingSeconds: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
  score?: number;
  correctCount?: number;
}
