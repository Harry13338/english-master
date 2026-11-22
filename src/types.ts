export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  current_level: CEFRLevel;
  xp_points: number;
  streak_count: number;
  last_active_date: string; // YYYY-MM-DD
  auth_provider?: 'email' | 'google';
  avatar_url?: string;
}

export interface Lesson {
  id: string;
  cefr_level: CEFRLevel;
  unit_number: number;
  title: string;
  title_mm?: string;
  grammar_note_mm: string;
  order_index: number;
  is_published?: boolean;
}

export interface Vocabulary {
  id: string;
  lesson_id: string;
  word_en: string;
  meaning_mm: string;
  phonetic: string;
  example_en: string;
  example_mm: string;
}

export type VideoProvider = 'youtube_unlisted' | 'mp4_url';

export interface LessonVideo {
  id: string;
  lesson_id: string;
  title: string;
  video_provider: VideoProvider;
  video_url: string;
  subtitle_en_vtt?: string;
  subtitle_mm_vtt?: string;
  duration_sec: number;
  order_index: number;
}

export interface UserVideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  watched_seconds: number;
  is_completed: boolean;
  updated_at: string;
}

export type QuizQuestionType = 'mcq' | 'fill_blank' | 'reorder';

export interface Quiz {
  id: string;
  lesson_id: string;
  question_type: QuizQuestionType;
  question_text: string;
  options_json: string; // JSON string array of options or tokens
  correct_answer: string;
  explanation_mm: string;
}

export type LessonProgressStatus = 'not_started' | 'completed';

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: LessonProgressStatus;
  score: number; // Percentage 0-100
  completed_at: string | null;
}

export interface FlashcardReview {
  id: string;
  user_id: string;
  vocab_id: string;
  ease_factor: number; // default 2.5
  interval_days: number; // default 1
  next_review_at: string; // ISO timestamp
  is_bookmarked: boolean;
}

export type SRSRating = 'again' | 'good' | 'easy';

export type SubtitleMode = 'off' | 'en' | 'mm' | 'both';

export type PlaybackSpeed = 0.75 | 1.0 | 1.25 | 1.5;

export type AccentLocale = 'en-US' | 'en-GB';

export type NavTab = 'home' | 'lessons' | 'flashcards' | 'profile' | 'admin';
