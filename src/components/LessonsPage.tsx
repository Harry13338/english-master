import React, { useState } from 'react';
import { CEFRLevel, Lesson, Vocabulary, AccentLocale, Quiz, UserProgress } from '../types';
import { CEFR_LEVELS } from '../seedData';
import { LessonDetailView } from './LessonDetailView';
import {
  ChevronRight,
  CheckCircle2,
  Plus,
  Layers,
  Volume2,
  Sparkles,
} from 'lucide-react';

interface LessonsPageProps {
  lessons: Lesson[];
  vocabularies: Vocabulary[];
  quizzes: Quiz[];
  userProgress: UserProgress[];
  bookmarkedVocabIds: string[];
  onToggleBookmark: (vocabId: string) => void;
  selectedLevel: CEFRLevel;
  onSelectLevel: (level: CEFRLevel) => void;
  activeLessonId: string | null;
  onSelectLesson: (lessonId: string | null) => void;
  accent: AccentLocale;
  onToggleAccent: (accent: AccentLocale) => void;
  completedLessonIds: string[];
  onCompleteLesson: (lessonId: string) => void;
  onPassQuiz: (lessonId: string, score: number) => void;
  isAdmin: boolean;
  onAddLesson: (lesson: Omit<Lesson, 'id'>) => void;
  onAddVocabulary: (vocab: Omit<Vocabulary, 'id'>) => void;
}

export const LessonsPage: React.FC<LessonsPageProps> = ({
  lessons,
  vocabularies,
  quizzes,
  userProgress,
  bookmarkedVocabIds,
  onToggleBookmark,
  selectedLevel,
  onSelectLevel,
  activeLessonId,
  onSelectLesson,
  accent,
  onToggleAccent,
  completedLessonIds,
  onCompleteLesson,
  onPassQuiz,
  isAdmin,
  onAddLesson,
  onAddVocabulary,
}) => {
  const [showNewLessonModal, setShowNewLessonModal] = useState(false);
  const [unitNumber, setUnitNumber] = useState(3);
  const [title, setTitle] = useState('');
  const [titleMm, setTitleMm] = useState('');
  const [grammarNoteMm, setGrammarNoteMm] = useState('');

  // If a lesson card is selected, show the Lesson Detail View
  const activeLesson = lessons.find((l) => l.id === activeLessonId);
  if (activeLesson) {
    const lessonVocabs = vocabularies.filter((v) => v.lesson_id === activeLesson.id);
    const lessonQuizzes = quizzes.filter((q) => q.lesson_id === activeLesson.id);
    const prog = userProgress.find((p) => p.lesson_id === activeLesson.id);
    return (
      <LessonDetailView
        lesson={activeLesson}
        vocabularies={lessonVocabs}
        quizzes={lessonQuizzes}
        progress={prog}
        bookmarkedVocabIds={bookmarkedVocabIds}
        onToggleBookmark={onToggleBookmark}
        accent={accent}
        onToggleAccent={onToggleAccent}
        onBack={() => onSelectLesson(null)}
        onCompleteLesson={onCompleteLesson}
        onPassQuiz={onPassQuiz}
        isCompleted={
          prog?.status === 'completed' || completedLessonIds.includes(activeLesson.id)
        }
        isAdmin={isAdmin}
        onAddVocabulary={onAddVocabulary}
      />
    );
  }

  const publishedLessons = lessons.filter((l) => l.is_published !== false);

  const filteredLessons = publishedLessons
    .filter((l) => l.cefr_level === selectedLevel)
    .sort((a, b) => a.order_index - b.order_index);

  const currentLevelMeta =
    CEFR_LEVELS.find((l) => l.level === selectedLevel) || CEFR_LEVELS[0];

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !grammarNoteMm.trim()) return;
    onAddLesson({
      cefr_level: selectedLevel,
      unit_number: Number(unitNumber) || filteredLessons.length + 1,
      title: title.trim(),
      title_mm: titleMm.trim() || undefined,
      grammar_note_mm: grammarNoteMm.trim(),
      order_index: filteredLessons.length + 1,
    });
    setTitle('');
    setTitleMm('');
    setGrammarNoteMm('');
    setShowNewLessonModal(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            CEFR Lessons • <span className="font-mm text-xl">သင်ခန်းစာများ</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mm mt-0.5">
            A1 မှ C1 အဆင့်အလိုက် သဒ္ဒါနှင့် ဝေါဟာရယူနစ်များကို ရွေးချယ်လေ့လာပါ။
          </p>
        </div>

        {/* Accent Badge Indicator */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Volume2 className="w-3.5 h-3.5 text-indigo-500 ml-2" />
          <button
            type="button"
            onClick={() => onToggleAccent('en-US')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              accent === 'en-US'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            🇺🇸 US
          </button>
          <button
            type="button"
            onClick={() => onToggleAccent('en-GB')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              accent === 'en-GB'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            🇬🇧 UK
          </button>
        </div>
      </div>

      {/* CEFR Level Filter Tabs (A1, A2, B1, B2, C1) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CEFR_LEVELS.map((item) => {
          const isActive = item.level === selectedLevel;
          const count = lessons.filter((l) => l.cefr_level === item.level).length;

          return (
            <button
              key={item.level}
              onClick={() => onSelectLevel(item.level)}
              className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm border transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25 scale-[1.01]'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              <span className="text-base font-extrabold">{item.level}</span>
              <div className="text-left leading-tight">
                <div className="text-[11px] font-semibold opacity-90">{item.label_en}</div>
                <div
                  className={`text-[10px] font-mm ${
                    isActive ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {count} {count === 1 ? 'Unit' : 'Units'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Level Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${currentLevelMeta.color} text-white font-extrabold text-base flex items-center justify-center shadow-md`}
          >
            {selectedLevel}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base">
                Level {selectedLevel}: {currentLevelMeta.label_en}
              </h2>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${currentLevelMeta.badgeBg}`}
              >
                {filteredLessons.length} Units
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mm">
              {currentLevelMeta.label_mm} • သဒ္ဒါနှင့် ဝေါဟာရ သင်ခန်းစာများ
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowNewLessonModal(!showNewLessonModal)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New {selectedLevel} Unit</span>
          </button>
        )}
      </div>

      {/* Admin Add Unit Form */}
      {isAdmin && showNewLessonModal && (
        <form
          onSubmit={handleCreateLesson}
          className="bg-white dark:bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-5 space-y-4 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
              Create New Lesson Unit ({selectedLevel})
            </h3>
            <span className="text-xs text-slate-400">Admin Mode</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Unit #</label>
              <input
                type="number"
                min={1}
                value={unitNumber}
                onChange={(e) => setUnitNumber(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold mb-1">Unit Title (English)</label>
              <input
                type="text"
                placeholder="e.g. Ordering Food & Drinks"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 font-mm">
              ခေါင်းစဉ် (မြန်မာဘာသာ - Optional)
            </label>
            <input
              type="text"
              placeholder="ဥပမာ - အစားအသောက်နှင့် အအေးမှာယူခြင်း"
              value={titleMm}
              onChange={(e) => setTitleMm(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 font-mm">
              Grammar Note in Myanmar (`grammar_note_mm`)
            </label>
            <textarea
              rows={4}
              placeholder="မြန်မာဘာသာဖြင့် သဒ္ဒါရှင်းလင်းချက် ရေးသားပါ..."
              value={grammarNoteMm}
              onChange={(e) => setGrammarNoteMm(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNewLessonModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white"
            >
              Create Unit
            </button>
          </div>
        </form>
      )}

      {/* Unit Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredLessons.map((lesson) => {
          const vocabCount = vocabularies.filter((v) => v.lesson_id === lesson.id).length;
          const isCompleted = completedLessonIds.includes(lesson.id);

          return (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectLesson(lesson.id)}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 sm:gap-4">
                  {/* Unit Number Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentLevelMeta.color} text-white flex flex-col items-center justify-center shrink-0 shadow-md`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                      Unit
                    </span>
                    <span className="text-lg font-extrabold leading-none">
                      {lesson.unit_number}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${currentLevelMeta.badgeBg}`}
                      >
                        {lesson.cefr_level} • Unit {lesson.unit_number}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{vocabCount} Vocabulary Words</span>
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {lesson.title}
                    </h3>

                    {lesson.title_mm && (
                      <p className="text-sm font-mm font-semibold text-indigo-600 dark:text-indigo-400">
                        {lesson.title_mm}
                      </p>
                    )}

                    {/* Grammar preview snippet */}
                    <p className="text-xs sm:text-sm font-mm text-slate-500 dark:text-slate-400 line-clamp-2 pt-1">
                      {lesson.grammar_note_mm.replace(/\n+/g, ' ')}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-center">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Quick Preview of Vocabulary Words inside Unit Card */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {vocabularies
                    .filter((v) => v.lesson_id === lesson.id)
                    .slice(0, 5)
                    .map((v) => (
                      <span
                        key={v.id}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {v.word_en}{' '}
                        <span className="text-slate-400 dark:text-slate-500 font-mm">
                          ({v.meaning_mm.split('/')[0].trim()})
                        </span>
                      </span>
                    ))}
                </div>

                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Grammar & Audio →</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
