import React, { useState } from 'react';
import { User, Lesson, Vocabulary, CEFRLevel, AccentLocale, UserProgress, FlashcardReview, Quiz } from '../types';
import { CEFR_LEVELS } from '../seedData';
import { speakText } from '../utils/speech';
import {
  Flame,
  Trophy,
  BookOpen,
  ArrowRight,
  Volume2,
  Sparkles,
  Layers,
  Award,
  PlayCircle,
  Bookmark,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface HomePageProps {
  user: User;
  lessons: Lesson[];
  vocabularies: Vocabulary[];
  quizzes: Quiz[];
  userProgress: UserProgress[];
  flashcardReviews: FlashcardReview[];
  accent: AccentLocale;
  onOpenLesson: (level: CEFRLevel, lessonId: string) => void;
  onNavigateTab: (tab: 'lessons' | 'flashcards' | 'profile') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  user,
  lessons,
  vocabularies,
  quizzes,
  userProgress,
  flashcardReviews,
  accent,
  onOpenLesson,
  onNavigateTab,
}) => {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const isLessonCompleted = (lessonId: string) => {
    const up = userProgress.find((p) => p.user_id === user.id && p.lesson_id === lessonId);
    return up?.status === 'completed';
  };

  const publishedLessons = lessons.filter((l) => l.is_published !== false);

  // Next incomplete lesson for "Continue Learning" card (prioritizing user's current CEFR level)
  const currentLevelLessons = publishedLessons
    .filter((l) => l.cefr_level === user.current_level)
    .sort((a, b) => a.order_index - b.order_index);

  const nextIncompleteLesson =
    currentLevelLessons.find((l) => !isLessonCompleted(l.id)) ||
    publishedLessons.find((l) => !isLessonCompleted(l.id)) ||
    publishedLessons[0];

  const completedUnitsCount = publishedLessons.filter((l) => isLessonCompleted(l.id)).length;
  const dueSrsCount = flashcardReviews.filter(
    (r) => r.user_id === user.id && new Date(r.next_review_at).getTime() <= Date.now()
  ).length;
  const bookmarkedCount = flashcardReviews.filter(
    (r) => r.user_id === user.id && r.is_bookmarked
  ).length;

  const a1Lessons = publishedLessons.filter((l) => l.cefr_level === 'A1');
  const wordOfTheDay = vocabularies[2] || vocabularies[0];

  return (
    <div className="space-y-6 pb-8">
      {/* Progress Dashboard Hero: CEFR Level, Daily Streak Counter, Total XP */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white p-6 sm:p-7 shadow-xl shadow-indigo-500/20">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>မင်္ဂလာပါ • Progress Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{user.name}</h1>
            <p className="text-xs sm:text-sm text-indigo-100 font-mm">
              ယနေ့ အင်္ဂလိပ်စာ သင်ခန်းစာ၊ ဉာဏ်စမ်းမေးခွန်းများနှင့် SRS ကတ်ပြားများကို ဆက်လက်လေ့လာပါ။
            </p>
          </div>

          {/* Gamified Stats Pills */}
          <div className="grid grid-cols-3 gap-2.5 sm:min-w-[290px]">
            <div className="bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center text-amber-300 mb-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold">{user.current_level}</div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-100 font-semibold">
                CEFR Level
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center text-orange-300 mb-0.5">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold">{user.streak_count}d</div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-100 font-semibold">
                Daily Streak
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center text-emerald-300 mb-0.5">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold">{user.xp_points}</div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-100 font-semibold">
                Total XP
              </div>
            </div>
          </div>
        </div>

        {/* Sub-bar with SRS & Completion summary */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="font-bold text-indigo-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>
              Course Progress: {completedUnitsCount} / {lessons.length} Units Completed
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('flashcards')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 font-bold transition"
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{dueSrsCount} SRS Cards Due</span>
            </button>
            <button
              onClick={() => onNavigateTab('flashcards')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/20 text-amber-200 hover:bg-amber-400/30 font-bold transition"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>{bookmarkedCount} Word Bank</span>
            </button>
          </div>
        </div>
      </div>

      {/* "Continue Learning" Card for Next Incomplete Lesson */}
      {nextIncompleteLesson && (
        <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/40 dark:border-indigo-500/50 rounded-3xl p-5 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white">
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Continue Learning • ဆက်လက်လေ့လာရန်</span>
                </span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  CEFR {nextIncompleteLesson.cefr_level} • Unit {nextIncompleteLesson.unit_number}
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {isLessonCompleted(nextIncompleteLesson.id)
                    ? 'Review Completed Unit'
                    : 'Next Incomplete Lesson'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {nextIncompleteLesson.title}
              </h2>
              {nextIncompleteLesson.title_mm && (
                <p className="text-sm font-mm font-semibold text-indigo-600 dark:text-indigo-400">
                  {nextIncompleteLesson.title_mm}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mm">
                သဒ္ဒါရှင်းလင်းချက်၊ ဝေါဟာရအသံထွက်နှင့် Interactive Quiz ဖြေဆိုပြီး +30 XP ရယူပါ။
              </p>
            </div>

            <button
              onClick={() =>
                onOpenLesson(nextIncompleteLesson.cefr_level, nextIncompleteLesson.id)
              }
              className="shrink-0 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition"
            >
              <span>Resume Unit {nextIncompleteLesson.unit_number} & Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Featured A1 Sample Lessons Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold">
              Recommended A1 Units • <span className="font-mm text-base">အခြေခံ သင်ခန်းစာများ</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mm">
              ဝေါဟာရ ၅ လုံးစီ၊ မြန်မာသဒ္ဒါရှင်းလင်းချက်နှင့် Interactive Quiz (+30 XP) ပါဝင်သော A1 သင်ခန်းစာ ၂ ခု
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('lessons')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>All Levels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {a1Lessons.map((lesson) => {
            const count = vocabularies.filter((v) => v.lesson_id === lesson.id).length;
            const quizCount = quizzes.filter((q) => q.lesson_id === lesson.id).length;
            const prog = userProgress.find(
              (p) => p.user_id === user.id && p.lesson_id === lesson.id
            );
            const isDone = prog?.status === 'completed';

            return (
              <div
                key={lesson.id}
                onClick={() => onOpenLesson(lesson.cefr_level, lesson.id)}
                className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {lesson.cefr_level} • Unit {lesson.unit_number}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        {count} Words • {quizCount} Quizzes
                      </span>
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {lesson.title}
                  </h3>
                  {lesson.title_mm && (
                    <p className="text-xs sm:text-sm font-mm text-slate-500 dark:text-slate-400">
                      {lesson.title_mm}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>
                    {isDone
                      ? `✓ Completed (Score: ${prog?.score}%)`
                      : 'Study Grammar, Audio & Quiz (+30 XP)'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Word of the Day Card */}
      {wordOfTheDay && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Word of the Day • နေ့စဉ်ဝေါဟာရ</span>
            </span>

            <button
              onClick={() =>
                speakText(
                  wordOfTheDay.word_en,
                  accent,
                  () => setSpeakingId(wordOfTheDay.id),
                  () => setSpeakingId(null)
                )
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                speakingId === wordOfTheDay.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen ({accent})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-baseline gap-2.5">
            <h3 className="text-2xl font-extrabold">{wordOfTheDay.word_en}</h3>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
              {wordOfTheDay.phonetic}
            </span>
          </div>
          <p className="font-mm text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {wordOfTheDay.meaning_mm}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
            “{wordOfTheDay.example_en}” —{' '}
            <span className="font-mm text-slate-500">{wordOfTheDay.example_mm}</span>
          </p>
        </div>
      )}

      {/* CEFR Roadmap Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
        <h3 className="font-extrabold text-base">
          CEFR Level Path (A1 → C1) • <span className="font-mm text-sm">အဆင့်သတ်မှတ်ချက်များ</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {CEFR_LEVELS.map((l) => (
            <button
              key={l.level}
              onClick={() => {
                const firstLesson = lessons.find((les) => les.cefr_level === l.level);
                if (firstLesson) {
                  onOpenLesson(l.level, firstLesson.id);
                } else {
                  onNavigateTab('lessons');
                }
              }}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 text-left transition bg-slate-50/60 dark:bg-slate-800/40"
            >
              <div className="font-extrabold text-base text-indigo-600 dark:text-indigo-400">
                {l.level}
              </div>
              <div className="text-xs font-bold truncate">{l.label_en}</div>
              <div className="text-[11px] font-mm text-slate-500 dark:text-slate-400 truncate">
                {l.label_mm}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
