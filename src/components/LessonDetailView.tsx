import React, { useState } from 'react';
import { Lesson, Vocabulary, AccentLocale, Quiz, UserProgress } from '../types';
import { CEFR_LEVELS } from '../seedData';
import { speakText } from '../utils/speech';
import {
  ArrowLeft,
  Volume2,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Plus,
  Globe,
  MessageSquareQuote,
  Bookmark,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

interface LessonDetailViewProps {
  lesson: Lesson;
  vocabularies: Vocabulary[];
  quizzes: Quiz[];
  progress?: UserProgress;
  bookmarkedVocabIds: string[];
  onToggleBookmark: (vocabId: string) => void;
  accent: AccentLocale;
  onToggleAccent: (accent: AccentLocale) => void;
  onBack: () => void;
  onCompleteLesson: (lessonId: string) => void;
  onPassQuiz: (lessonId: string, score: number) => void;
  isCompleted: boolean;
  isAdmin: boolean;
  onAddVocabulary: (vocab: Omit<Vocabulary, 'id'>) => void;
}

export const LessonDetailView: React.FC<LessonDetailViewProps> = ({
  lesson,
  vocabularies,
  quizzes,
  progress,
  bookmarkedVocabIds,
  onToggleBookmark,
  accent,
  onToggleAccent,
  onBack,
  onCompleteLesson,
  onPassQuiz,
  isCompleted,
  isAdmin,
  onAddVocabulary,
}) => {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showAddVocab, setShowAddVocab] = useState(false);
  const [wordEn, setWordEn] = useState('');
  const [meaningMm, setMeaningMm] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleMm, setExampleMm] = useState('');

  // Interactive Quiz Runner State
  const [quizIndex, setQuizIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [reorderTokens, setReorderTokens] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    explanationMm: string;
  } | null>(null);
  const [answersLog, setAnswersLog] = useState<Record<string, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  const levelMeta = CEFR_LEVELS.find((l) => l.level === lesson.cefr_level) || CEFR_LEVELS[0];

  const handleSpeak = (text: string, id: string) => {
    setSpeakingId(id);
    speakText(
      text,
      accent,
      () => setSpeakingId(id),
      () => setSpeakingId(null)
    );
  };

  const handleCreateVocab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordEn.trim() || !meaningMm.trim()) return;
    onAddVocabulary({
      lesson_id: lesson.id,
      word_en: wordEn.trim(),
      meaning_mm: meaningMm.trim(),
      phonetic: phonetic.trim() || `/${wordEn.trim().toLowerCase()}/`,
      example_en: exampleEn.trim() || `Here is an example with ${wordEn.trim()}.`,
      example_mm: exampleMm.trim() || `${meaningMm.trim()} ပါဝင်သော နမူနာဝါကျ။`,
    });
    setWordEn('');
    setMeaningMm('');
    setPhonetic('');
    setExampleEn('');
    setExampleMm('');
    setShowAddVocab(false);
  };

  const currentQuiz = quizzes[quizIndex];
  const parsedOptions: string[] = React.useMemo(() => {
    if (!currentQuiz) return [];
    try {
      return JSON.parse(currentQuiz.options_json);
    } catch {
      return [];
    }
  }, [currentQuiz]);

  const handleToggleReorderToken = (token: string) => {
    if (feedback) return;
    const exists = reorderTokens.includes(token);
    const next = exists ? reorderTokens.filter((t) => t !== token) : [...reorderTokens, token];
    setReorderTokens(next);
    setUserAnswer(next.join(' '));
  };

  const handleCheckQuizAnswer = () => {
    if (!currentQuiz || feedback) return;
    const given = userAnswer.trim();
    if (!given) return;

    const isCorrect =
      given.toLowerCase().replace(/\s+/g, ' ') ===
      currentQuiz.correct_answer.trim().toLowerCase().replace(/\s+/g, ' ');

    setAnswersLog((prev) => ({ ...prev, [currentQuiz.id]: isCorrect }));
    setFeedback({
      isCorrect,
      correctAnswer: currentQuiz.correct_answer,
      explanationMm: currentQuiz.explanation_mm,
    });
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex + 1 < quizzes.length) {
      setQuizIndex((prev) => prev + 1);
      setUserAnswer('');
      setReorderTokens([]);
      setFeedback(null);
    } else {
      setQuizFinished(true);
      const total = Math.max(1, quizzes.length);
      const correctCount = quizzes.filter((q) => answersLog[q.id]).length;
      const scorePct = Math.round((correctCount / total) * 100);
      onPassQuiz(lesson.id, scorePct);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setUserAnswer('');
    setReorderTokens([]);
    setFeedback(null);
    setAnswersLog({});
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Navigation & Accent Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Lessons (သင်ခန်းစာများ)</span>
        </button>

        {/* Web Speech API Accent Toggle (en-US / en-GB) */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1 px-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Accent:</span>
          </div>
          <button
            type="button"
            onClick={() => onToggleAccent('en-US')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              accent === 'en-US'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🇺🇸 en-US
          </button>
          <button
            type="button"
            onClick={() => onToggleAccent('en-GB')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              accent === 'en-GB'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🇬🇧 en-GB
          </button>
        </div>
      </div>

      {/* Lesson Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/15 backdrop-blur-md text-white border border-white/20">
              CEFR {lesson.cefr_level} • {levelMeta.label_en}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Unit {lesson.unit_number} (Order #{lesson.order_index})
            </span>
            {progress && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Status: {progress.status} ({progress.score}%)
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{lesson.title}</h1>
          {lesson.title_mm && (
            <p className="text-indigo-200 font-mm text-base sm:text-lg mt-1.5">{lesson.title_mm}</p>
          )}
        </div>
      </div>

      {/* Myanmar Grammar Notes Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">
                Grammar Note (သဒ္ဒါရှင်းလင်းချက်)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mm">
                မြန်မာဘာသာဖြင့် အသေးစိတ် ရှင်းလင်းချက် (`grammar_note_mm`)
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            MM Explanation
          </span>
        </div>

        <div className="font-mm text-sm sm:text-base text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed bg-slate-50/80 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
          {lesson.grammar_note_mm}
        </div>
      </div>

      {/* Vocabulary Cards Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
              <span>Lesson Vocabulary</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold">
                {vocabularies.length} Words
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mm">
              ဝေါဟာရများနှင့် အသံထွက်လေ့ကျင့်ရန် Listen ခလုတ်ကို နှိပ်ပါ ({accent}) • Bookmark နှိပ်၍ Word Bank သို့ သိမ်းဆည်းပါ
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddVocab(!showAddVocab)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Word</span>
            </button>
          )}
        </div>

        {/* Admin Add Vocab Form */}
        {isAdmin && showAddVocab && (
          <form
            onSubmit={handleCreateVocab}
            className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-4 space-y-3"
          >
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Add Vocabulary to Unit {lesson.unit_number}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="English Word (word_en)"
                value={wordEn}
                onChange={(e) => setWordEn(e.target.value)}
                required
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                placeholder="Phonetic (e.g. /ˈwɜːd/)"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                placeholder="မြန်မာအဓိပ္ပာယ် (meaning_mm)"
                value={meaningMm}
                onChange={(e) => setMeaningMm(e.target.value)}
                required
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Example Sentence (example_en)"
                value={exampleEn}
                onChange={(e) => setExampleEn(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                placeholder="နမူနာဝါကျ မြန်မာပြန် (example_mm)"
                value={exampleMm}
                onChange={(e) => setExampleMm(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddVocab(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white"
              >
                Save Word
              </button>
            </div>
          </form>
        )}

        {/* Vocabulary List */}
        <div className="grid grid-cols-1 gap-3.5">
          {vocabularies.map((vocab, index) => {
            const isWordSpeaking = speakingId === `word-${vocab.id}`;
            const isExampleSpeaking = speakingId === `ex-${vocab.id}`;
            const isBookmarked = bookmarkedVocabIds.includes(vocab.id);

            return (
              <div
                key={vocab.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        #{index + 1}
                      </span>
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                        {vocab.word_en}
                      </h3>
                      <span className="text-xs sm:text-sm font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                        {vocab.phonetic}
                      </span>
                    </div>
                    <p className="font-mm text-base font-bold text-emerald-700 dark:text-emerald-400 pt-0.5">
                      {vocab.meaning_mm}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleBookmark(vocab.id)}
                      className={`p-2 rounded-xl border text-xs font-bold transition ${
                        isBookmarked
                          ? 'bg-amber-500/15 text-amber-500 border-amber-500/40'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                      title="Save to Personal Word Bank"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>

                    {/* Web Speech API Listen Button */}
                    <button
                      type="button"
                      onClick={() => handleSpeak(vocab.word_en, `word-${vocab.id}`)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                        isWordSpeaking
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/25 animate-pulse'
                          : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20'
                      }`}
                      title={`Listen in ${accent}`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Listen</span>
                    </button>
                  </div>
                </div>

                {/* Example Box */}
                <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-3">
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200 font-medium">
                      <MessageSquareQuote className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>“{vocab.example_en}”</span>
                    </div>
                    <p className="font-mm text-slate-500 dark:text-slate-400 pl-6">
                      {vocab.example_mm}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSpeak(vocab.example_en, `ex-${vocab.id}`)}
                    className={`shrink-0 p-2 rounded-xl text-xs transition ${
                      isExampleSpeaking
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Listen to example sentence"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Quiz Runner Section (mcq, fill_blank, reorder + +30 XP on Pass) */}
      {quizzes.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-base sm:text-lg">
                    Interactive Lesson Quiz Runner
                  </h2>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    +30 XP on Pass
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mm">
                  သင်ခန်းစာ ဉာဏ်စမ်းမေးခွန်းများ (MCQ, Fill-in-the-blank, Reorder) • မှားယွင်းပါက မြန်မာရှင်းလင်းချက် ပြသပေးသည်
                </p>
              </div>
            </div>

            {!quizFinished && currentQuiz && (
              <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                Question {quizIndex + 1} / {quizzes.length} ({currentQuiz.question_type})
              </span>
            )}
          </div>

          {quizFinished ? (
            <div className="space-y-4">
              {(() => {
                const correctCount = quizzes.filter((q) => answersLog[q.id]).length;
                const scorePct = Math.round((correctCount / Math.max(1, quizzes.length)) * 100);
                const passed = scorePct >= 60;
                return (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full ${
                          passed
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {passed
                          ? '🎉 Quiz Passed! (+30 XP Reward)'
                          : '⚠️ Score below 60% — Try Again'}
                      </span>
                      <h3 className="text-xl font-extrabold">
                        Final Score: {scorePct}% ({correctCount} / {quizzes.length} Correct)
                      </h3>
                      <p className="text-xs text-slate-500 font-mm">
                        {passed
                          ? 'ဂုဏ်ယူပါတယ်! ဉာဏ်စမ်းအောင်မြင်သဖြင့် +30 XP နှင့် Completed သတ်မှတ်ပြီးပါပြီ။'
                          : 'အမှတ် ၆၀% အထက် ရရှိပါက +30 XP ရရှိမည်ဖြစ်ပါသည်။'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRestartQuiz}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-extrabold"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake Quiz</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          ) : currentQuiz ? (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-extrabold">{currentQuiz.question_text}</h3>

              {currentQuiz.question_type === 'mcq' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {parsedOptions.map((opt) => {
                    const isSelected = userAnswer === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={!!feedback}
                        onClick={() => setUserAnswer(opt)}
                        className={`p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm font-bold transition ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuiz.question_type === 'fill_blank' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={userAnswer}
                    disabled={!!feedback}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type the missing word..."
                    className="w-full px-4 py-3 text-sm font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  {parsedOptions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Hints:</span>
                      {parsedOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          disabled={!!feedback}
                          onClick={() => setUserAnswer(opt)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentQuiz.question_type === 'reorder' && (
                <div className="space-y-3">
                  <div className="min-h-[52px] p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                    {reorderTokens.length > 0 ? (
                      reorderTokens.map((tok) => (
                        <button
                          key={tok}
                          type="button"
                          onClick={() => handleToggleReorderToken(tok)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold"
                        >
                          {tok}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-mm">
                        အောက်ပါ စကားလုံးများကို အစီအစဉ်အတိုင်း တစ်ခုချင်းနှိပ်၍ ဝါကျတည်ဆောက်ပါ...
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {parsedOptions.map((tok) => (
                      <button
                        key={tok}
                        type="button"
                        onClick={() => handleToggleReorderToken(tok)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border ${
                          reorderTokens.includes(tok)
                            ? 'opacity-40 bg-slate-100 dark:bg-slate-800'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {tok}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {feedback && (
                <div
                  className={`p-4 rounded-2xl border-2 space-y-1.5 ${
                    feedback.isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="text-sm font-extrabold">
                    {feedback.isCorrect
                      ? '✅ Correct Answer! (အဖြေမှန်ကန်ပါသည်)'
                      : `❌ Incorrect • Correct Answer: "${feedback.correctAnswer}"`}
                  </div>
                  <p className="text-xs sm:text-sm font-mm">
                    <strong>💡 မြန်မာရှင်းလင်းချက်:</strong> {feedback.explanationMm}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                {!feedback ? (
                  <button
                    type="button"
                    onClick={handleCheckQuizAnswer}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-xs sm:text-sm font-extrabold"
                  >
                    Check Answer (အဖြေစစ်ရန်)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuizQuestion}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-xs sm:text-sm font-extrabold"
                  >
                    {quizIndex + 1 < quizzes.length
                      ? 'Next Question →'
                      : 'Finish Quiz & Claim +30 XP →'}
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Complete Lesson & Earn XP Footer Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-500/20">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg">
              {isCompleted
                ? 'Lesson Completed! (သင်ခန်းစာ ပြီးမြောက်ပါပြီ)'
                : 'Pass the Quiz Above (+30 XP) or Complete Unit'}
            </h3>
            <p className="text-xs text-indigo-100 font-mm">
              သဒ္ဒါ၊ ဝေါဟာရ {vocabularies.length} လုံးနှင့် ဉာဏ်စမ်းမေးခွန်းများကို လေ့လာပြီးပါက XP ရယူပါ။
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onCompleteLesson(lesson.id)}
          className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md ${
            isCompleted
              ? 'bg-emerald-500 text-white'
              : 'bg-white text-indigo-700 hover:bg-indigo-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isCompleted ? 'Completed' : 'Complete Lesson (+25 XP)'}</span>
        </button>
      </div>
    </div>
  );
};
