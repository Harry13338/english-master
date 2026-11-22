import React from 'react';
import {
  User,
  CEFRLevel,
  UserRole,
  AccentLocale,
  UserProgress,
  FlashcardReview,
  Lesson,
  Vocabulary,
} from '../types';
import { CEFR_LEVELS } from '../seedData';
import {
  User as UserIcon,
  Mail,
  Shield,
  Award,
  Trophy,
  Flame,
  Calendar,
  LogOut,
  Globe,
  Moon,
  Sun,
} from 'lucide-react';

interface ProfilePageProps {
  user: User;
  lessons?: Lesson[];
  vocabularies?: Vocabulary[];
  userProgress?: UserProgress[];
  flashcardReviews?: FlashcardReview[];
  onUpdateUser: (updated: Partial<User>) => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  accent: AccentLocale;
  onToggleAccent: (accent: AccentLocale) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  lessons = [],
  vocabularies = [],
  userProgress = [],
  flashcardReviews = [],
  onUpdateUser,
  onLogout,
  isDark,
  onToggleTheme,
  accent,
  onToggleAccent,
}) => {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          User Profile • <span className="font-mm text-xl">ကိုယ်ရေးအချက်အလက်</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mm">
          သင်၏ အဆင့် (CEFR Level)၊ XP အမှတ်များနှင့် အကောင့်အချက်အလက်များ။
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold">{user.name}</h2>
                <span
                  className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    user.role === 'admin'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out (ထွက်ရန်)</span>
          </button>
        </div>

        {/* User Schema Fields Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            User Model Attributes
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <Award className="w-4 h-4 text-indigo-500" />
                <span>current_level</span>
              </div>
              <div className="text-xl font-extrabold mt-1 text-indigo-600 dark:text-indigo-400">
                {user.current_level}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <Trophy className="w-4 h-4 text-emerald-500" />
                <span>xp_points</span>
              </div>
              <div className="text-xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">
                {user.xp_points} XP
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>streak_count</span>
              </div>
              <div className="text-xl font-extrabold mt-1 text-orange-600 dark:text-orange-400">
                {user.streak_count} Days
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <Calendar className="w-4 h-4 text-sky-500" />
                <span>last_active_date</span>
              </div>
              <div className="text-sm font-extrabold mt-2 text-slate-800 dark:text-slate-200">
                {user.last_active_date}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive CEFR Level Controls (Self-assigning Admin Role is Disabled) */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Change Current CEFR Level (`current_level`)
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {CEFR_LEVELS.map((l) => (
              <button
                key={l.level}
                type="button"
                onClick={() => onUpdateUser({ current_level: l.level as CEFRLevel })}
                className={`py-2 rounded-xl text-xs font-extrabold border transition ${
                  user.current_level === l.level
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                {l.level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lesson & Quiz Progress Records (user_progress model) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
        <h3 className="font-extrabold text-base">
          Lesson & Quiz Progress (<code className="text-xs text-indigo-500">user_progress</code>)
        </h3>
        <div className="space-y-2">
          {userProgress.length > 0 ? (
            userProgress.map((lp) => {
              const les = lessons.find((l) => l.id === lp.lesson_id);
              return (
                <div
                  key={lp.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-extrabold">
                      {les ? `${les.cefr_level} Unit ${les.unit_number}: ${les.title}` : lp.lesson_id}
                    </div>
                    <div className="text-slate-400">
                      lesson_id: {lp.lesson_id} • completed_at:{' '}
                      {lp.completed_at ? new Date(lp.completed_at).toLocaleString() : 'null'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                      score: {lp.score}%
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold ${
                        lp.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      status: {lp.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-400">No lesson progress recorded yet.</div>
          )}
        </div>
      </div>

      {/* SRS Flashcard Review Records (flashcard_reviews model) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
        <h3 className="font-extrabold text-base">
          SRS Flashcard Reviews (<code className="text-xs text-indigo-500">flashcard_reviews</code>)
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {flashcardReviews.length > 0 ? (
            flashcardReviews.map((r) => {
              const voc = vocabularies.find((v) => v.id === r.vocab_id);
              return (
                <div
                  key={r.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-extrabold">
                      {voc ? `${voc.word_en} (${voc.meaning_mm})` : r.vocab_id}
                    </div>
                    <div className="text-slate-400">
                      vocab_id: {r.vocab_id} • next_review_at:{' '}
                      {new Date(r.next_review_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-700 font-mono">
                      ease_factor: {r.ease_factor}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono">
                      interval_days: {r.interval_days}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg font-bold ${
                        r.is_bookmarked
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      is_bookmarked: {String(r.is_bookmarked)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-400">No SRS reviews recorded yet.</div>
          )}
        </div>
      </div>

      {/* App Preferences Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base">
          App Preferences • <span className="font-mm text-sm">အက်ပ် အပြင်အဆင်များ</span>
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <div>
              <div className="text-sm font-bold">Appearance (Dark / Light UI)</div>
              <div className="text-xs text-slate-500 font-mm">
                အမှောင် နှင့် အလင်း ဒီဇိုင်း ပြောင်းလဲရန်
              </div>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
          >
            {isDark ? 'Switch to Light ☀️' : 'Switch to Dark 🌙'}
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-indigo-500" />
            <div>
              <div className="text-sm font-bold">Default Pronunciation Accent</div>
              <div className="text-xs text-slate-500 font-mm">
                Web Speech API အသံထွက် ရွေးချယ်ရန် (en-US / en-GB)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => onToggleAccent('en-US')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                accent === 'en-US' ? 'bg-indigo-600 text-white' : 'text-slate-500'
              }`}
            >
              🇺🇸 en-US
            </button>
            <button
              onClick={() => onToggleAccent('en-GB')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                accent === 'en-GB' ? 'bg-indigo-600 text-white' : 'text-slate-500'
              }`}
            >
              🇬🇧 en-GB
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
