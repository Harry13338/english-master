import React, { useState } from 'react';
import {
  CEFRLevel,
  Lesson,
  Vocabulary,
  AccentLocale,
  FlashcardReview,
  SRSRating,
} from '../types';
import { CEFR_LEVELS } from '../seedData';
import { speakText } from '../utils/speech';
import {
  Volume2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface FlashcardsPageProps {
  userId: string;
  lessons: Lesson[];
  vocabularies: Vocabulary[];
  flashcardReviews: FlashcardReview[];
  accent: AccentLocale;
  onToggleAccent: (accent: AccentLocale) => void;
  onRateFlashcard: (vocabId: string, rating: SRSRating) => void;
  onToggleBookmark: (vocabId: string) => void;
}

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({
  userId,
  lessons,
  vocabularies,
  flashcardReviews,
  accent,
  onToggleAccent,
  onRateFlashcard,
  onToggleBookmark,
}) => {
  const [deckMode, setDeckMode] = useState<'all' | 'due' | 'bookmarked'>('all');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  const now = Date.now();

  const getReviewForVocab = (vocabId: string): FlashcardReview => {
    const existing = flashcardReviews.find(
      (r) => r.user_id === userId && r.vocab_id === vocabId
    );
    return (
      existing || {
        id: `temp-${vocabId}`,
        user_id: userId,
        vocab_id: vocabId,
        ease_factor: 2.5,
        interval_days: 1,
        next_review_at: new Date().toISOString(),
        is_bookmarked: false,
      }
    );
  };

  const dueVocabs = vocabularies.filter((v) => {
    const rev = getReviewForVocab(v.id);
    return new Date(rev.next_review_at).getTime() <= now;
  });

  const bookmarkedVocabs = vocabularies.filter((v) => {
    const rev = getReviewForVocab(v.id);
    return rev.is_bookmarked;
  });

  const filteredVocabs = vocabularies.filter((v) => {
    if (selectedLevel !== 'ALL') {
      const lesson = lessons.find((l) => l.id === v.lesson_id);
      if (lesson?.cefr_level !== selectedLevel) return false;
    }
    const rev = getReviewForVocab(v.id);
    if (deckMode === 'due') {
      return new Date(rev.next_review_at).getTime() <= now;
    }
    if (deckMode === 'bookmarked') {
      return rev.is_bookmarked;
    }
    return true;
  });

  const safeIndex =
    filteredVocabs.length > 0 ? Math.min(currentIndex, filteredVocabs.length - 1) : 0;
  const currentCard = filteredVocabs[safeIndex];
  const cardLesson = lessons.find((l) => l.id === currentCard?.lesson_id);
  const cardReview = currentCard ? getReviewForVocab(currentCard.id) : null;

  const curEase = cardReview ? Number(cardReview.ease_factor || 2.5) : 2.5;
  const curInt = cardReview ? Number(cardReview.interval_days || 1) : 1;
  const goodInt = curInt <= 1 ? 3 : Math.max(2, Math.round(curInt * curEase));
  const easyInt = curInt <= 1 ? 4 : Math.max(4, Math.round(curInt * (curEase + 0.15) * 1.3));

  const handleNext = () => {
    if (filteredVocabs.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredVocabs.length);
  };

  const handlePrev = () => {
    if (filteredVocabs.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredVocabs.length) % filteredVocabs.length);
  };

  const handleRate = (rating: SRSRating) => {
    if (!currentCard) return;
    onRateFlashcard(currentCard.id, rating);
    setIsFlipped(false);
    if (filteredVocabs.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredVocabs.length);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            SRS Flashcards • <span className="font-mm text-xl">ဝေါဟာရ ကတ်ပြားများ</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mm">
            Spaced Repetition (Again / Good / Easy) စနစ်ဖြင့် ဝေါဟာရများကို ရေရှည်မှတ်မိအောင် လေ့ကျင့်ပါ။
          </p>
        </div>

        {/* Accent Toggle */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => onToggleAccent('en-US')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              accent === 'en-US'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            🇺🇸 en-US
          </button>
          <button
            onClick={() => onToggleAccent('en-GB')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              accent === 'en-GB'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            🇬🇧 en-GB
          </button>
        </div>
      </div>

      {/* SRS Deck Mode Selector (All / Due / Personal Word Bank) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => {
            setDeckMode('all');
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
            deckMode === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 shrink-0" />
            <div>
              <div className="text-xs font-extrabold">All Flashcards</div>
              <div className="text-[11px] font-mm opacity-80">ဝေါဟာရအားလုံး</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-black/15">
            {vocabularies.length}
          </span>
        </button>

        <button
          onClick={() => {
            setDeckMode('due');
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
            deckMode === 'due'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 shrink-0" />
            <div>
              <div className="text-xs font-extrabold">Due for SRS Review</div>
              <div className="text-[11px] font-mm opacity-80">ပြန်လည်လေ့ကျင့်ရန်</div>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${
              deckMode === 'due'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {dueVocabs.length}
          </span>
        </button>

        <button
          onClick={() => {
            setDeckMode('bookmarked');
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
            deckMode === 'bookmarked'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-4 h-4 shrink-0 fill-current" />
            <div>
              <div className="text-xs font-extrabold">Personal Word Bank</div>
              <div className="text-[11px] font-mm opacity-80">ခက်ခဲသော ဝေါဟာရများ</div>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${
              deckMode === 'bookmarked'
                ? 'bg-white/20 text-white'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            }`}
          >
            {bookmarkedVocabs.length}
          </span>
        </button>
      </div>

      {/* Level Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setSelectedLevel('ALL');
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
            selectedLevel === 'ALL'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          All Levels
        </button>
        {CEFR_LEVELS.map((l) => (
          <button
            key={l.level}
            onClick={() => {
              setSelectedLevel(l.level);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
              selectedLevel === l.level
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {l.level}
          </button>
        ))}
      </div>

      {currentCard && cardReview ? (
        <div className="max-w-lg mx-auto space-y-5">
          {/* Progress & SRS Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>
              Card {safeIndex + 1} of {filteredVocabs.length} (Swipe or Tap to Flip)
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono">
                ease_factor: {curEase}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono">
                interval_days: {curInt}d
              </span>
            </div>
          </div>

          {/* Interactive Swipe / Tap Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.screenX || 0)}
            onTouchEnd={(e) => {
              const endX = e.changedTouches[0]?.screenX || 0;
              const diff = endX - touchStartX;
              if (Math.abs(diff) > 55) {
                if (diff < 0) handleNext();
                else handlePrev();
              }
            }}
            className="relative bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/60 rounded-3xl p-7 sm:p-10 min-h-[320px] flex flex-col justify-between shadow-xl cursor-pointer select-none transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                {cardLesson?.cefr_level} • Unit {cardLesson?.unit_number}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(currentCard.id);
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    cardReview.is_bookmarked
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>{cardReview.is_bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentCard.word_en, accent);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen ({accent})</span>
                </button>
              </div>
            </div>

            {!isFlipped ? (
              <div className="my-8 text-center space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">
                  FRONT • ENGLISH + PHONETIC + AUDIO
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {currentCard.word_en}
                </h2>
                <p className="text-base sm:text-lg font-mono text-indigo-600 dark:text-indigo-400">
                  {currentCard.phonetic}
                </p>
                <p className="text-xs text-slate-400 pt-4 font-mm">
                  မြန်မာအဓိပ္ပာယ်နှင့် နမူနာဝါကျ ကြည့်ရန် ကတ်ကို နှိပ်ပါ
                </p>
              </div>
            ) : (
              <div className="my-5 text-center space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">
                    BACK • MYANMAR MEANING & EXAMPLE
                  </span>
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mt-0.5">
                    {currentCard.word_en} ({currentCard.phonetic})
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-mm text-emerald-600 dark:text-emerald-400 mt-1">
                    {currentCard.meaning_mm}
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 text-left space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      “{currentCard.example_en}”
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(currentCard.example_en, accent);
                      }}
                      className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-500/10"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-mm text-slate-500 dark:text-slate-400">
                    {currentCard.example_mm}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Tap card to flip (English ⇄ မြန်မာ)</span>
              </span>
              <span>
                Next review: {new Date(cardReview.next_review_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* SRS Rating Buttons: "Again", "Good", "Easy" */}
          <div className="space-y-2">
            <div className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 font-mm">
              ဤစကားလုံးကို မည်မျှမှတ်မိသနည်း။ (Rate to calculate next_review_at):
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleRate('again')}
                className="p-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-center transition shadow-sm"
              >
                <div className="text-xs sm:text-sm font-extrabold">Again</div>
                <div className="text-[11px] opacity-80 font-mono">1d • Reset</div>
              </button>

              <button
                type="button"
                onClick={() => handleRate('good')}
                className="p-3 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-center transition shadow-sm"
              >
                <div className="text-xs sm:text-sm font-extrabold">Good</div>
                <div className="text-[11px] opacity-80 font-mono">{goodInt}d • +5 XP</div>
              </button>

              <button
                type="button"
                onClick={() => handleRate('easy')}
                className="p-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center transition shadow-sm"
              >
                <div className="text-xs sm:text-sm font-extrabold">Easy</div>
                <div className="text-[11px] opacity-80 font-mono">{easyInt}d • +10 XP</div>
              </button>
            </div>
          </div>

          {/* Prev / Next Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1 transition"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-500 mx-auto" />
          <div className="text-sm font-extrabold">No flashcards match this filter!</div>
          <button
            onClick={() => {
              setDeckMode('all');
              setSelectedLevel('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Show All Flashcards
          </button>
        </div>
      )}

      {/* Personal Word Bank Section (Bookmarked Hard Words) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500 fill-current" />
              <span>Personal Word Bank (မှတ်သားထားသော ဝေါဟာရများ)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                {bookmarkedVocabs.length} Saved
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mm">
              Bookmark နှိပ်၍ သိမ်းဆည်းထားသော ခက်ခဲသည့် ဝေါဟာရများ
            </p>
          </div>
        </div>

        {bookmarkedVocabs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookmarkedVocabs.map((v) => {
              const rev = getReviewForVocab(v.id);
              return (
                <div
                  key={v.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-sm">{v.word_en}</span>
                      <span className="text-xs font-mono text-indigo-500">{v.phonetic}</span>
                    </div>
                    <div className="text-xs font-mm font-bold text-emerald-600 dark:text-emerald-400">
                      {v.meaning_mm}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      ease: {rev.ease_factor} • interval: {rev.interval_days}d • next:{' '}
                      {new Date(rev.next_review_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => speakText(v.word_en, accent)}
                      className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleBookmark(v.id)}
                      className="p-2 rounded-xl bg-amber-500/15 text-amber-500"
                      title="Remove Bookmark"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-mm">
            သိမ်းဆည်းထားသော ဝေါဟာရ မရှိသေးပါ။ ကတ်ပြားပေါ်ရှိ Bookmark ခလုတ်ကို နှိပ်၍ သိမ်းဆည်းနိုင်ပါသည်။
          </div>
        )}
      </div>
    </div>
  );
};
