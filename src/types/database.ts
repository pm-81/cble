// Custom type definitions for the CBLE Exam Prep application
// These extend/complement the auto-generated Supabase types

export type AppRole = 'admin' | 'user';

export type SessionType = 'quick_drill' | 'flashcards' | 'case_scenarios' | 'mixed_review' | 'exam_simulation';

export type AnswerChoice = 'A' | 'B' | 'C' | 'D' | 'E';

export interface DomainInfo {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  questionCount?: number;
  masteryLevel?: number;
}

export interface QuestionWithDomain {
  id: string;
  domain_id: string | null;
  topic_id: string | null;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: AnswerChoice;
  rationale: string | null;
  reference_cue: string | null;
  difficulty: number | null;
  tags: string[] | null;
  domain?: {
    id: string;
    name: string;
    color: string | null;
  };
}

export interface UserProgress {
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracyRate: number;
  averageConfidence: number;
  currentStreak: number;
  longestStreak: number;
  masteryByDomain: Record<string, number>;
  dueReviews: number;
}

export interface StudySession {
  id: string;
  sessionType: SessionType;
  scheduledDate: Date;
  targetDuration: number;
  actualDuration?: number;
  questionsAttempted: number;
  questionsCorrect: number;
  completedAt?: Date;
}

export interface OnboardingData {
  examDate: Date | null;
  weeklyStudyMinutes: number;
  preferredSessionLength: number;
  domainConfidence: Record<string, number>;
}

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: Date;
}

// Domain color mapping
export const DOMAIN_COLORS: Record<string, string> = {
  'Entry / Entry Summary / Release': 'domain-entry',
  'Classification (HTSUS / GRIs / Notes)': 'domain-classification',
  'Valuation (19 CFR 152)': 'domain-valuation',
  'Trade Programs / Origin': 'domain-programs',
  'Broker Duties / POA / Records / Bonds': 'domain-broker',
  'Marking / COO (19 CFR 134)': 'domain-marking',
  'Protests / Liquidation': 'domain-protests',
  'Other (FTZ / Drawback / In-bond / AD/CVD / PGA)': 'domain-other',
};

export const DOMAIN_ICONS: Record<string, string> = {
  'Entry / Entry Summary / Release': 'FileInput',
  'Classification (HTSUS / GRIs / Notes)': 'FolderTree',
  'Valuation (19 CFR 152)': 'DollarSign',
  'Trade Programs / Origin': 'Globe',
  'Broker Duties / POA / Records / Bonds': 'Shield',
  'Marking / COO (19 CFR 134)': 'Tag',
  'Protests / Liquidation': 'Scale',
  'Other (FTZ / Drawback / In-bond / AD/CVD / PGA)': 'MoreHorizontal',
};
