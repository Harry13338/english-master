import React, { useState, useEffect } from 'react';
import {
  User,
  Lesson,
  LessonVideo,
  Vocabulary,
  Quiz,
  CEFRLevel,
  VideoProvider,
  QuizQuestionType,
  SubtitleMode,
} from '../types';
import { CEFR_LEVELS } from '../seedData';
import {
  isStrictAuthorizedAdmin,
  isAdminPinUnlockedForSession,
  verifyAndUnlockAdminPin,
  lockAdminPinSession,
  SECRET_ADMIN_ROUTE,
} from '../utils/adminSecurity';
import {
  ShieldCheck,
  BookOpen,
  Video,
  Layers,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Upload,
  FileJson,
  Lock,
  Eye,
  AlertTriangle,
} from 'lucide-react';

interface AdminDashboardPageProps {
  user: User;
  lessons: Lesson[];
  lessonVideos: LessonVideo[];
  vocabularies: Vocabulary[];
  quizzes: Quiz[];
  onSaveLesson: (lesson: Lesson, isEdit: boolean) => void;
  onReorderLesson: (lessonId: string, direction: 'up' | 'down') => void;
  onDeleteLesson: (lessonId: string) => void;
  onSaveVideo: (video: LessonVideo, isEdit: boolean) => void;
  onDeleteVideo: (videoId: string) => void;
  onSaveVocabulary: (vocab: Vocabulary, isEdit: boolean) => void;
  onDeleteVocabulary: (vocabId: string) => void;
  onSaveQuiz: (quiz: Quiz, isEdit: boolean) => void;
  onDeleteQuiz: (quizId: string) => void;
  onBulkImport: (payload: {
    lessons?: Lesson[];
    lessonVideos?: LessonVideo[];
    vocabularies?: Vocabulary[];
    quizzes?: Quiz[];
  }) => void;
  onUnauthorizedRedirect: () => void;
}

interface VttCue {
  start: number;
  end: number;
  text: string;
}

function parseVttTime(t: string): number {
  const parts = t.trim().split(':');
  if (parts.length === 3) {
    return (
      parseInt(parts[0], 10) * 3600 +
      parseInt(parts[1], 10) * 60 +
      parseFloat(parts[2].replace(',', '.'))
    );
  }
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseFloat(parts[1].replace(',', '.'));
  }
  return 0;
}

function parseVttCues(raw?: string): VttCue[] {
  if (!raw || !raw.trim()) return [];
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const cues: VttCue[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.includes('-->')) {
      const [startStr, endStr] = line.split('-->');
      const start = parseVttTime(startStr);
      const end = parseVttTime(endStr);
      const textLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        textLines.push(lines[i].trim());
        i++;
      }
      if (textLines.length > 0) {
        cues.push({ start, end, text: textLines.join(' ') });
      }
    }
    i++;
  }
  return cues;
}

function extractYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) return url;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return null;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  user,
  lessons,
  lessonVideos,
  vocabularies,
  quizzes,
  onSaveLesson,
  onReorderLesson,
  onDeleteLesson,
  onSaveVideo,
  onDeleteVideo,
  onSaveVocabulary,
  onDeleteVocabulary,
  onSaveQuiz,
  onDeleteQuiz,
  onBulkImport,
  onUnauthorizedRedirect,
}) => {
  const [subTab, setSubTab] = useState<'lessons' | 'videos' | 'vocab_quiz'>('lessons');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('A1');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessons[0]?.id || 'les-a1-1');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [pinUnlocked, setPinUnlocked] = useState<boolean>(() => isAdminPinUnlockedForSession());
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'lesson' | 'video' | 'vocab' | 'quiz';
    id: string;
    label: string;
  } | null>(null);

  // Lesson Form State
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonLevel, setLessonLevel] = useState<CEFRLevel>('A1');
  const [unitNumber, setUnitNumber] = useState<number>(3);
  const [orderIndex, setOrderIndex] = useState<number>(3);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonTitleMm, setLessonTitleMm] = useState('');
  const [grammarNoteMm, setGrammarNoteMm] = useState('');
  const [isPublished, setIsPublished] = useState<boolean>(true);

  // Video & Subtitle Form State + Inline Preview Player State
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoProvider, setVideoProvider] = useState<VideoProvider>('mp4_url');
  const [videoUrl, setVideoUrl] = useState(
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  );
  const [durationSec, setDurationSec] = useState<number>(15);
  const [videoOrderIndex, setVideoOrderIndex] = useState<number>(1);
  const [subtitleEnVtt, setSubtitleEnVtt] = useState(
    `WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nHello everyone! Welcome to our lesson.\n\n00:00:05.000 --> 00:00:15.000\nLet's practice English and Myanmar subtitles together.`
  );
  const [subtitleMmVtt, setSubtitleMmVtt] = useState(
    `WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nမင်္ဂလာပါ အားလုံးပဲ! သင်ခန်းစာမှ ကြိုဆိုပါတယ်။\n\n00:00:05.000 --> 00:00:15.000\nအင်္ဂလိပ်နှင့် မြန်မာ စာတန်းထိုးများကို အတူတကွ လေ့ကျင့်ကြပါစို့။`
  );
  const [previewTimeSec, setPreviewTimeSec] = useState<number>(0);
  const [previewSubMode, setPreviewSubMode] = useState<SubtitleMode>('both');

  // Vocabulary Form State
  const [editingVocabId, setEditingVocabId] = useState<string | null>(null);
  const [wordEn, setWordEn] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [meaningMm, setMeaningMm] = useState('');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleMm, setExampleMm] = useState('');

  // Quiz Form State
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<QuizQuestionType>('mcq');
  const [questionText, setQuestionText] = useState('');
  const [optionsRaw, setOptionsRaw] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanationMm, setExplanationMm] = useState('');

  // Bulk JSON Import State
  const [bulkJsonText, setBulkJsonText] = useState('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!isStrictAuthorizedAdmin(user)) {
      onUnauthorizedRedirect();
    }
  }, [user, onUnauthorizedRedirect]);

  if (!isStrictAuthorizedAdmin(user)) {
    return null;
  }

  // Session 6-Digit ADMIN_PIN Gate
  if (!pinUnlocked) {
    const handlePinGateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (verifyAndUnlockAdminPin(pinInput, user)) {
        setPinUnlocked(true);
        setPinError('');
      } else {
        setPinError('Invalid 6-digit ADMIN_PIN. Access denied.');
      }
    };

    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 sm:p-8 shadow-xl space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            ADMIN_PIN Session Verification
          </span>
          <h1 className="text-xl font-extrabold">Enter 6-Digit Admin PIN</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authenticated as <strong className="text-slate-800 dark:text-slate-200">{user.email}</strong>. Enter your 6-digit <code className="font-mono">ADMIN_PIN</code> to unlock <code className="font-mono">{SECRET_ADMIN_ROUTE}</code> for this session.
          </p>
        </div>

        {pinError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold text-center">
            {pinError}
          </div>
        )}

        <form onSubmit={handlePinGateSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            pattern="\d{6}"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="••••••"
            required
            autoFocus
            className="w-full text-center tracking-[0.5em] text-xl font-mono font-extrabold px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm shadow-lg transition"
          >
            Unlock Studio Management
          </button>
        </form>
      </div>
    );
  }

  const levelLessons = lessons
    .filter((l) => l.cefr_level === selectedLevel)
    .sort((a, b) => a.order_index - b.order_index);

  const editingLessonObj = editingLessonId
    ? lessons.find((l) => l.id === editingLessonId) || null
    : null;

  const activeLesson =
    editingLessonObj || lessons.find((l) => l.id === selectedLessonId) || lessons[0];

  const unitVideos = activeLesson
    ? lessonVideos
        .filter((v) => v.lesson_id === activeLesson.id)
        .sort((a, b) => a.order_index - b.order_index)
    : [];
  const unitVocabs = activeLesson
    ? vocabularies.filter((v) => v.lesson_id === activeLesson.id)
    : [];
  const unitQuizzes = activeLesson
    ? quizzes.filter((q) => q.lesson_id === activeLesson.id)
    : [];

  const handleConfirmDelete = () => {
    if (!confirmDialog) return;
    const { type, id, label } = confirmDialog;
    setConfirmDialog(null);
    if (type === 'lesson') {
      onDeleteLesson(id);
      if (editingLessonId === id) setEditingLessonId(null);
      showToast(`🗑️ Deleted Lesson "${label}" & Synced with Student View`);
    } else if (type === 'video') {
      onDeleteVideo(id);
      if (editingVideoId === id) setEditingVideoId(null);
      showToast(`🗑️ Deleted Video "${label}" & Synced with Student View`);
    } else if (type === 'vocab') {
      onDeleteVocabulary(id);
      if (editingVocabId === id) setEditingVocabId(null);
      showToast(`🗑️ Deleted Vocabulary "${label}" & Synced with Student View`);
    } else if (type === 'quiz') {
      onDeleteQuiz(id);
      if (editingQuizId === id) setEditingQuizId(null);
      showToast(`🗑️ Deleted Quiz "${label}" & Synced with Student View`);
    }
  };

  const handleVttFileRead = (e: React.ChangeEvent<HTMLInputElement>, lang: 'en' | 'mm') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '');
      if (lang === 'en') setSubtitleEnVtt(text);
      else setSubtitleMmVtt(text);
      showToast(`✓ Loaded ${file.name} into ${lang.toUpperCase()} VTT Subtitle Editor`);
    };
    reader.readAsText(file);
  };

  const handleLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !grammarNoteMm.trim()) {
      showToast('⚠️ Lesson Title and Myanmar Grammar Note are required.', 'error');
      return;
    }
    const payload: Lesson = {
      id: editingLessonId || `les-${lessonLevel.toLowerCase()}-${Date.now()}`,
      cefr_level: lessonLevel,
      unit_number: Number(unitNumber) || 1,
      order_index: Number(orderIndex) || 1,
      title: lessonTitle.trim(),
      title_mm: lessonTitleMm.trim() || undefined,
      grammar_note_mm: grammarNoteMm.trim(),
      is_published: isPublished,
    };
    onSaveLesson(payload, !!editingLessonId);
    showToast(
      editingLessonId
        ? `✓ Auto-saved & Synced Lesson "${payload.title}" (${isPublished ? 'Published' : 'Draft'})`
        : `✓ Created Lesson "${payload.title}" (${payload.cefr_level} • ${
            isPublished ? 'Published' : 'Draft'
          })`
    );
    if (!editingLessonId) {
      setLessonTitle('');
      setLessonTitleMm('');
      setGrammarNoteMm('');
    }
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson || !videoTitle.trim() || !videoUrl.trim()) {
      showToast('⚠️ Video Title and Video URL are required.', 'error');
      return;
    }
    const payload: LessonVideo = {
      id: editingVideoId || `vid-${Date.now()}`,
      lesson_id: activeLesson.id,
      title: videoTitle.trim(),
      video_provider: videoProvider,
      video_url: videoUrl.trim(),
      duration_sec: Math.max(5, Number(durationSec) || 15),
      order_index: Number(videoOrderIndex) || unitVideos.length + 1,
      subtitle_en_vtt:
        subtitleEnVtt.trim() ||
        `WEBVTT\n\n00:00:00.000 --> 00:00:08.000\nWelcome to ${videoTitle.trim()}.`,
      subtitle_mm_vtt:
        subtitleMmVtt.trim() ||
        `WEBVTT\n\n00:00:00.000 --> 00:00:08.000\n${videoTitle.trim()} သင်ခန်းစာမှ ကြိုဆိုပါတယ်။`,
    };
    onSaveVideo(payload, !!editingVideoId);
    showToast(
      editingVideoId
        ? `✓ Auto-saved & Synced Video "${payload.title}" + Dual VTT Subtitles`
        : `✓ Added & Synced Video "${payload.title}" to Unit`
    );
    setEditingVideoId(null);
    setVideoTitle('');
  };

  const handleVocabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson || !wordEn.trim() || !meaningMm.trim()) {
      showToast('⚠️ English word and Myanmar meaning are required.', 'error');
      return;
    }
    const payload: Vocabulary = {
      id: editingVocabId || `voc-${Date.now()}`,
      lesson_id: activeLesson.id,
      word_en: wordEn.trim(),
      phonetic: phonetic.trim() || `/${wordEn.trim().toLowerCase()}/`,
      meaning_mm: meaningMm.trim(),
      example_en: exampleEn.trim() || `Example sentence with ${wordEn.trim()}.`,
      example_mm: exampleMm.trim() || `${meaningMm.trim()} ပါဝင်သော နမူနာဝါကျ။`,
    };
    onSaveVocabulary(payload, !!editingVocabId);
    showToast(
      editingVocabId
        ? `✓ Updated & Synced Vocabulary "${payload.word_en}"`
        : `✓ Added & Synced Vocabulary "${payload.word_en}"`
    );
    setEditingVocabId(null);
    setWordEn('');
    setPhonetic('');
    setMeaningMm('');
    setExampleEn('');
    setExampleMm('');
  };

  const handleStartEditVocab = (v: Vocabulary) => {
    setEditingVocabId(v.id);
    setWordEn(v.word_en);
    setPhonetic(v.phonetic);
    setMeaningMm(v.meaning_mm);
    setExampleEn(v.example_en);
    setExampleMm(v.example_mm);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson || !questionText.trim() || !correctAnswer.trim()) {
      showToast('⚠️ Question text and correct answer are required.', 'error');
      return;
    }
    let parsedOpts: string[] = [];
    if (optionsRaw.trim().startsWith('[')) {
      try {
        parsedOpts = JSON.parse(optionsRaw.trim());
      } catch {
        parsedOpts = optionsRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } else {
      parsedOpts = optionsRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const payload: Quiz = {
      id: editingQuizId || `qz-${Date.now()}`,
      lesson_id: activeLesson.id,
      question_type: questionType,
      question_text: questionText.trim(),
      options_json: JSON.stringify(parsedOpts),
      correct_answer: correctAnswer.trim(),
      explanation_mm:
        explanationMm.trim() || `အဖြေမှန်မှာ "${correctAnswer.trim()}" ဖြစ်ပါသည်။`,
    };
    onSaveQuiz(payload, !!editingQuizId);
    showToast(
      editingQuizId
        ? `✓ Updated & Synced ${questionType.toUpperCase()} Quiz Question`
        : `✓ Added & Synced ${questionType.toUpperCase()} Quiz Question`
    );
    setEditingQuizId(null);
    setQuestionText('');
    setOptionsRaw('');
    setCorrectAnswer('');
    setExplanationMm('');
  };

  const handleStartEditQuiz = (q: Quiz) => {
    setEditingQuizId(q.id);
    setQuestionType(q.question_type);
    setQuestionText(q.question_text);
    try {
      setOptionsRaw(JSON.parse(q.options_json).join(', '));
    } catch {
      setOptionsRaw(q.options_json);
    }
    setCorrectAnswer(q.correct_answer);
    setExplanationMm(q.explanation_mm);
  };

  const handleLoadSampleJson = () => {
    const targetLessonId = activeLesson?.id || 'les-a1-1';
    const sample = {
      lesson_id: targetLessonId,
      vocabulary: [
        {
          word_en: 'Confidence',
          meaning_mm: 'မိမိကိုယ်ကို ယုံကြည်မှု',
          phonetic: '/ˈkɒn.fɪ.dəns/',
          example_en: 'Speaking every day builds your confidence.',
          example_mm: 'နေ့တိုင်း စကားပြောခြင်းက သင့်ယုံကြည်မှုကို တည်ဆောက်ပေးပါတယ်။',
        },
      ],
      quizzes: [
        {
          question_type: 'mcq',
          question_text: 'Speaking every day builds your ___.',
          options: ['confidence', 'neighbor', 'departure'],
          correct_answer: 'confidence',
          explanation_mm: 'Confidence သည် မိမိကိုယ်ကို ယုံကြည်မှုဟု အဓိပ္ပာယ်ရပါသည်။',
        },
      ],
    };
    setBulkJsonText(JSON.stringify(sample, null, 2));
  };

  const handleRunBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkJsonText.trim()) return;
    try {
      const data = JSON.parse(bulkJsonText.trim());
      const fallbackLessonId = data.lesson_id || activeLesson?.id || 'les-a1-1';

      const newVocabs: Vocabulary[] = (data.vocabulary || data.vocabularies || []).map(
        (v: Partial<Vocabulary>, idx: number) => ({
          id: v.id || `voc-bulk-${Date.now()}-${idx}`,
          lesson_id: v.lesson_id || fallbackLessonId,
          word_en: v.word_en || 'Word',
          meaning_mm: v.meaning_mm || '',
          phonetic: v.phonetic || `/${(v.word_en || 'word').toLowerCase()}/`,
          example_en: v.example_en || '',
          example_mm: v.example_mm || '',
        })
      );

      const newQuizzes: Quiz[] = (data.quizzes || []).map(
        (q: Partial<Quiz> & { options?: string[] }, idx: number) => ({
          id: q.id || `qz-bulk-${Date.now()}-${idx}`,
          lesson_id: q.lesson_id || fallbackLessonId,
          question_type: (q.question_type as QuizQuestionType) || 'mcq',
          question_text: q.question_text || '',
          options_json: Array.isArray(q.options)
            ? JSON.stringify(q.options)
            : q.options_json || '[]',
          correct_answer: q.correct_answer || '',
          explanation_mm: q.explanation_mm || '',
        })
      );

      onBulkImport({
        vocabularies: newVocabs,
        quizzes: newQuizzes,
      });
      setBulkJsonText('');
      showToast(
        `✓ Bulk JSON Imported: +${newVocabs.length} Vocabulary Words & +${newQuizzes.length} Quizzes!`
      );
    } catch (err) {
      showToast(`⚠️ Invalid JSON: ${(err as Error).message}`, 'error');
    }
  };

  // Inline Video & Dual-Subtitle Preview Computations
  const previewEnCues = parseVttCues(subtitleEnVtt);
  const previewMmCues = parseVttCues(subtitleMmVtt);
  const activePreviewEn =
    previewEnCues.find((c) => previewTimeSec >= c.start && previewTimeSec <= c.end) ||
    previewEnCues[0];
  const activePreviewMm =
    previewMmCues.find((c) => previewTimeSec >= c.start && previewTimeSec <= c.end) ||
    previewMmCues[0];
  const ytEmbedPreview =
    videoProvider === 'youtube_unlisted' ? extractYouTubeEmbedUrl(videoUrl) : null;

  return (
    <div className="space-y-6 pb-8">
      {/* Admin Hero Header */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-extrabold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                Secret Route: {SECRET_ADMIN_ROUTE} • {user.email} (PIN Verified)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Admin Content Management Studio
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 font-mm">
              ကုဒ်ပြင်ဆင်ရန်မလိုဘဲ A1–C1 သင်ခန်းစာများ၊ ဗီဒီယိုနှင့် .vtt စာတန်းထိုးများ၊ ဝေါဟာရနှင့် ဉာဏ်စမ်းမေးခွန်းများကို စီမံခန့်ခွဲပါ။
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => {
                lockAdminPinSession();
                setPinUnlocked(false);
                onUnauthorizedRedirect();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-extrabold transition"
            >
              Lock PIN Session & Exit
            </button>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10">
                <div className="text-base sm:text-lg font-extrabold">{lessons.length}</div>
                <div className="text-[10px] uppercase text-indigo-200 font-bold">Lessons</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10">
                <div className="text-base sm:text-lg font-extrabold">{lessonVideos.length}</div>
                <div className="text-[10px] uppercase text-indigo-200 font-bold">Videos</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10">
                <div className="text-base sm:text-lg font-extrabold">{vocabularies.length}</div>
                <div className="text-[10px] uppercase text-indigo-200 font-bold">Vocab</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10">
                <div className="text-base sm:text-lg font-extrabold">{quizzes.length}</div>
                <div className="text-[10px] uppercase text-indigo-200 font-bold">Quizzes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-white/15">
          <button
            onClick={() => setSubTab('lessons')}
            className={`p-3 rounded-2xl text-left transition flex items-center justify-between ${
              subTab === 'lessons'
                ? 'bg-white text-slate-900 font-extrabold shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white font-bold'
            }`}
          >
            <div>
              <div className="text-xs sm:text-sm">1. Lessons Manager</div>
              <div className="text-[11px] opacity-75">Create, Edit, Reorder & Delete (A1–C1)</div>
            </div>
            <BookOpen className="w-4 h-4 shrink-0" />
          </button>

          <button
            onClick={() => setSubTab('videos')}
            className={`p-3 rounded-2xl text-left transition flex items-center justify-between ${
              subTab === 'videos'
                ? 'bg-white text-slate-900 font-extrabold shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white font-bold'
            }`}
          >
            <div>
              <div className="text-xs sm:text-sm">2. Video & Subtitle Manager</div>
              <div className="text-[11px] opacity-75">YouTube/MP4/R2 + .vtt EN & MM Preview</div>
            </div>
            <Video className="w-4 h-4 shrink-0" />
          </button>

          <button
            onClick={() => setSubTab('vocab_quiz')}
            className={`p-3 rounded-2xl text-left transition flex items-center justify-between ${
              subTab === 'vocab_quiz'
                ? 'bg-white text-slate-900 font-extrabold shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white font-bold'
            }`}
          >
            <div>
              <div className="text-xs sm:text-sm">3. Vocabulary & Quiz Builder</div>
              <div className="text-[11px] opacity-75">Words, MCQ/Blank/Reorder + Bulk JSON</div>
            </div>
            <Layers className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* Toast Notification (Success / Error) */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl text-white text-xs sm:text-sm font-extrabold text-center shadow-lg ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">Confirm Permanent Deletion</h3>
                <p className="text-xs text-slate-500 font-mm">
                  ဖျက်ပစ်ရန် သေချာပါသလား? ဤလုပ်ဆောင်ချက်ကို ပြန်ပြင်၍မရပါ။
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="text-slate-400 uppercase font-extrabold text-[10px]">
                Target {confirmDialog.type.toUpperCase()}
              </div>
              <div className="font-extrabold text-sm">{confirmDialog.label}</div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-extrabold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: LESSONS MANAGER + LIVE MARKDOWN PREVIEW + DRAFT/PUBLISHED TOGGLE + INLINE VOCAB/QUIZ EDITOR */}
      {subTab === 'lessons' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <form
              onSubmit={handleLessonSubmit}
              className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3.5 h-fit"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-extrabold text-base">
                  {editingLessonId ? `Edit Lesson (${editingLessonId})` : 'Create New Lesson Unit'}
                </h2>
                {editingLessonId && (
                  <button
                    type="button"
                    onClick={() => setEditingLessonId(null)}
                    className="text-xs font-bold text-rose-500"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block font-bold mb-1">CEFR Level</label>
                  <select
                    value={lessonLevel}
                    onChange={(e) => setLessonLevel(e.target.value as CEFRLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    {CEFR_LEVELS.map((l) => (
                      <option key={l.level} value={l.level}>
                        {l.level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Unit #</label>
                  <input
                    type="number"
                    min={1}
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">order_index</label>
                  <input
                    type="number"
                    min={1}
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Draft vs Published Toggle */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-extrabold">Status (is_published)</div>
                  <div className="text-[11px] text-slate-500 font-mm">
                    Draft သင်ခန်းစာများကို ကျောင်းသားများ မမြင်ရပါ
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold border transition ${
                    isPublished
                      ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                  }`}
                >
                  {isPublished ? '🟢 Published (Live)' : '📝 Draft (Hidden)'}
                </button>
              </div>

              <div className="text-xs">
                <label className="block font-bold mb-1">Title (English)</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Ordering at a Cafe"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="text-xs">
                <label className="block font-bold mb-1 font-mm">မြန်မာခေါင်းစဉ် (title_mm)</label>
                <input
                  type="text"
                  value={lessonTitleMm}
                  onChange={(e) => setLessonTitleMm(e.target.value)}
                  placeholder="ဥပမာ - ကော်ဖီဆိုင်တွင် မှာယူခြင်း"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mm"
                />
              </div>

              <div className="text-xs">
                <label className="block font-bold mb-1 font-mm">
                  Myanmar Grammar Explanation (`grammar_note_mm`)
                </label>
                <textarea
                  rows={5}
                  required
                  value={grammarNoteMm}
                  onChange={(e) => setGrammarNoteMm(e.target.value)}
                  placeholder="မြန်မာဘာသာဖြင့် သဒ္ဒါရှင်းလင်းချက် ရေးသားပါ..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mm"
                />
              </div>

              {/* Live Markdown / Text Preview */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/50 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-extrabold text-indigo-600 dark:text-indigo-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Grammar Note Preview</span>
                </div>
                <div className="font-mm whitespace-pre-line text-slate-700 dark:text-slate-200 max-h-40 overflow-y-auto">
                  {grammarNoteMm || 'သဒ္ဒါရှင်းလင်းချက် ရေးသားသည့်အခါ ဤနေရာတွင် တိုက်ရိုက်မြင်ရပါမည်...'}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition"
              >
                {editingLessonId ? 'Save Lesson Changes & Sync' : 'Create Lesson Unit'}
              </button>
            </form>

            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-extrabold text-base">
                  Manage & Reorder Lessons ({selectedLevel})
                </h2>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {CEFR_LEVELS.map((l) => (
                    <button
                      key={l.level}
                      onClick={() => setSelectedLevel(l.level)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                        selectedLevel === l.level
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {l.level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {levelLessons.map((les, idx) => {
                  const isPub = les.is_published !== false;
                  return (
                    <div
                      key={les.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-extrabold">
                            {les.cefr_level} • Unit {les.unit_number}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onSaveLesson({ ...les, is_published: !isPub }, true);
                              showToast(
                                `✓ Lesson "${les.title}" switched to ${
                                  !isPub ? 'Published' : 'Draft'
                                }`
                              );
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${
                              isPub
                                ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                            }`}
                          >
                            {isPub ? '🟢 Published' : '📝 Draft'}
                          </button>
                          <span className="text-xs font-mono text-slate-400">
                            order: #{les.order_index}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-sm sm:text-base mt-1">{les.title}</h3>
                        {les.title_mm && (
                          <p className="text-xs font-mm text-indigo-600 dark:text-indigo-400">
                            {les.title_mm}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onReorderLesson(les.id, 'up');
                            showToast(`✓ Reordered "${les.title}" UP`);
                          }}
                          disabled={idx === 0}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-35"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            onReorderLesson(les.id, 'down');
                            showToast(`✓ Reordered "${les.title}" DOWN`);
                          }}
                          disabled={idx === levelLessons.length - 1}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-35"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingLessonId(les.id);
                            setSelectedLessonId(les.id);
                            setLessonLevel(les.cefr_level);
                            setUnitNumber(les.unit_number);
                            setOrderIndex(les.order_index);
                            setLessonTitle(les.title);
                            setLessonTitleMm(les.title_mm || '');
                            setGrammarNoteMm(les.grammar_note_mm);
                            setIsPublished(les.is_published !== false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              type: 'lesson',
                              id: les.id,
                              label: `${les.cefr_level} Unit ${les.unit_number}: ${les.title}`,
                            })
                          }
                          className="p-2 rounded-xl bg-rose-500/15 text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Inline Vocabulary & Quiz Editor inside Lesson's Edit View */}
          {editingLessonObj && (
            <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[11px] font-extrabold uppercase">
                  Inline Unit Content Editor
                </span>
                <h3 className="text-base sm:text-lg font-extrabold mt-1">
                  Vocabulary ({unitVocabs.length}) & Quiz Questions ({unitQuizzes.length}) inside "
                  {editingLessonObj.title}"
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inline Vocabulary List & Editor */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm">Lesson Vocabulary Words</h4>
                  <form
                    onSubmit={handleVocabSubmit}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="English word"
                        value={wordEn}
                        onChange={(e) => setWordEn(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Phonetic"
                        value={phonetic}
                        onChange={(e) => setPhonetic(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Myanmar meaning"
                      value={meaningMm}
                      onChange={(e) => setMeaningMm(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mm"
                    />
                    <input
                      type="text"
                      required
                      placeholder="English example"
                      value={exampleEn}
                      onChange={(e) => setExampleEn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Myanmar example"
                      value={exampleMm}
                      onChange={(e) => setExampleMm(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mm"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-emerald-600 text-white font-extrabold"
                    >
                      {editingVocabId ? 'Save Vocabulary Changes' : 'Add Word to Lesson'}
                    </button>
                  </form>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {unitVocabs.map((v) => (
                      <div
                        key={v.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-extrabold">
                            {v.word_en} <span className="font-mono text-indigo-500">{v.phonetic}</span>
                          </div>
                          <div className="font-mm text-emerald-600 font-bold">{v.meaning_mm}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditVocab(v)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-600 font-extrabold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDialog({
                                type: 'vocab',
                                id: v.id,
                                label: `${v.word_en} (${v.meaning_mm})`,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-500 font-extrabold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inline Quiz Questions List & Editor */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm">Lesson Quiz Questions</h4>
                  <form
                    onSubmit={handleQuizSubmit}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value as QuizQuestionType)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      >
                        <option value="mcq">mcq</option>
                        <option value="fill_blank">fill_blank</option>
                        <option value="reorder">reorder</option>
                      </select>
                      <input
                        type="text"
                        required
                        placeholder="Correct answer"
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Question text"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Options comma-separated"
                      value={optionsRaw}
                      onChange={(e) => setOptionsRaw(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Myanmar explanation (explanation_mm)"
                      value={explanationMm}
                      onChange={(e) => setExplanationMm(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mm"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-indigo-600 text-white font-extrabold"
                    >
                      {editingQuizId ? 'Save Quiz Question Changes' : 'Add Quiz to Lesson'}
                    </button>
                  </form>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {unitQuizzes.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-extrabold uppercase text-indigo-500">
                            [{q.question_type}]
                          </span>{' '}
                          <span className="font-bold">{q.question_text}</span>
                          <div className="text-emerald-600 font-bold">Ans: {q.correct_answer}</div>
                          <div className="font-mm text-slate-500">{q.explanation_mm}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditQuiz(q)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-600 font-extrabold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDialog({
                                type: 'quiz',
                                id: q.id,
                                label: q.question_text,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-500 font-extrabold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: VIDEO & DUAL-SUBTITLE EDITOR WITH INLINE LIVE PREVIEW PLAYER */}
      {subTab === 'videos' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-extrabold uppercase text-indigo-500">
              Select Target Lesson Unit:
            </span>
            <select
              value={activeLesson?.id || ''}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  [{l.cefr_level} • Unit {l.unit_number}] {l.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <form
              onSubmit={handleVideoSubmit}
              className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3.5 text-xs"
            >
              <h2 className="font-extrabold text-base">
                {editingVideoId
                  ? `Edit Video & Dual Subtitles (${editingVideoId})`
                  : 'Add Lesson Video & .VTT Subtitles'}
              </h2>

              <div>
                <label className="block font-bold mb-1">Video Title</label>
                <input
                  type="text"
                  required
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. Dialogue & Pronunciation"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold mb-1">Provider</label>
                  <select
                    value={videoProvider}
                    onChange={(e) => setVideoProvider(e.target.value as VideoProvider)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="mp4_url">mp4_url (MP4/R2)</option>
                    <option value="youtube_unlisted">youtube_unlisted</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">duration_sec</label>
                  <input
                    type="number"
                    min={5}
                    value={durationSec}
                    onChange={(e) => setDurationSec(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">order_index</label>
                  <input
                    type="number"
                    min={1}
                    value={videoOrderIndex}
                    onChange={(e) => setVideoOrderIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">
                  Video URL (YouTube Unlisted or Direct MP4 / R2)
                </label>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://pub-xxx.r2.dev/video.mp4 or https://youtu.be/xxx"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                    🇺🇸 English Subtitles (.vtt) • {previewEnCues.length} cues
                  </span>
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-bold">
                    <Upload className="w-3 h-3" />
                    <span>Upload .vtt</span>
                    <input
                      type="file"
                      accept=".vtt,text/vtt,text/plain"
                      onChange={(e) => handleVttFileRead(e, 'en')}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  rows={4}
                  value={subtitleEnVtt}
                  onChange={(e) => setSubtitleEnVtt(e.target.value)}
                  placeholder="WEBVTT..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    🇲🇲 Myanmar Subtitles (.vtt) • {previewMmCues.length} cues
                  </span>
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-bold">
                    <Upload className="w-3 h-3" />
                    <span>Upload .vtt</span>
                    <input
                      type="file"
                      accept=".vtt,text/vtt,text/plain"
                      onChange={(e) => handleVttFileRead(e, 'mm')}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  rows={4}
                  value={subtitleMmVtt}
                  onChange={(e) => setSubtitleMmVtt(e.target.value)}
                  placeholder="WEBVTT..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mm"
                />
              </div>

              {/* Inline Video & Dual-Subtitle Preview Player before saving */}
              <div className="rounded-2xl border-2 border-indigo-500/30 bg-slate-950 text-white p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-extrabold">
                    ▶ Inline Video & Dual-Subtitle Preview Player
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl">
                    {(['off', 'en', 'mm', 'both'] as SubtitleMode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPreviewSubMode(m)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                          previewSubMode === m ? 'bg-indigo-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  {videoProvider === 'youtube_unlisted' && ytEmbedPreview ? (
                    <iframe
                      className="w-full h-full"
                      src={ytEmbedPreview}
                      title="Admin Inline Video Preview"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      className="w-full h-full object-cover"
                      src={videoUrl}
                      controls
                      playsInline
                      onTimeUpdate={(e) => setPreviewTimeSec(e.currentTarget.currentTime)}
                    />
                  )}

                  {previewSubMode !== 'off' && (
                    <div className="absolute inset-x-3 bottom-10 pointer-events-none flex flex-col items-center justify-center z-20">
                      <div className="inline-block max-w-xl px-3.5 py-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/15 text-center shadow-lg space-y-0.5">
                        {(previewSubMode === 'en' || previewSubMode === 'both') && (
                          <div className="text-xs font-bold text-white">
                            {activePreviewEn
                              ? activePreviewEn.text
                              : '(No EN cue at this timestamp)'}
                          </div>
                        )}
                        {(previewSubMode === 'mm' || previewSubMode === 'both') && (
                          <div className="text-xs font-mm font-bold text-amber-300">
                            {activePreviewMm
                              ? activePreviewMm.text
                              : '(No MM cue at this timestamp)'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-indigo-300 shrink-0">
                    Scrub Timestamp: {previewTimeSec.toFixed(1)}s
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(15, durationSec)}
                    step={0.5}
                    value={previewTimeSec}
                    onChange={(e) => setPreviewTimeSec(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm"
              >
                {editingVideoId ? 'Save Video & Subtitle Updates' : 'Add Video to Lesson'}
              </button>
            </form>

            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3 h-fit">
              <h2 className="font-extrabold text-base">Unit Videos ({unitVideos.length})</h2>
              {unitVideos.map((vid) => (
                <div
                  key={vid.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-extrabold">
                      #{vid.order_index} {vid.title} ({vid.video_provider})
                    </div>
                    <div className="text-slate-400 font-mono truncate max-w-xs">{vid.video_url}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingVideoId(vid.id);
                        setVideoTitle(vid.title);
                        setVideoProvider(vid.video_provider);
                        setVideoUrl(vid.video_url);
                        setDurationSec(vid.duration_sec);
                        setVideoOrderIndex(vid.order_index);
                        setSubtitleEnVtt(vid.subtitle_en_vtt || '');
                        setSubtitleMmVtt(vid.subtitle_mm_vtt || '');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-600 font-extrabold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setConfirmDialog({
                          type: 'video',
                          id: vid.id,
                          label: vid.title,
                        })
                      }
                      className="p-2 rounded-xl bg-rose-500/15 text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: VOCABULARY & QUIZ BUILDER + BULK JSON IMPORT */}
      {subTab === 'vocab_quiz' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-extrabold uppercase text-indigo-500">
              Select Target Lesson Unit:
            </span>
            <select
              value={activeLesson?.id || ''}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  [{l.cefr_level} • Unit {l.unit_number}] {l.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Vocabulary Builder */}
            <form
              onSubmit={handleVocabSubmit}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-base flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  <span>{editingVocabId ? 'Edit Vocabulary Word' : 'Vocabulary Builder'}</span>
                </h2>
                {editingVocabId && (
                  <button
                    type="button"
                    onClick={() => setEditingVocabId(null)}
                    className="text-xs font-bold text-rose-500"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  placeholder="English Word (word_en)"
                  value={wordEn}
                  onChange={(e) => setWordEn(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
                <input
                  type="text"
                  placeholder="Phonetic (/.../)"
                  value={phonetic}
                  onChange={(e) => setPhonetic(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Myanmar Meaning (meaning_mm)"
                value={meaningMm}
                onChange={(e) => setMeaningMm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mm"
              />
              <input
                type="text"
                required
                placeholder="Example Sentence (example_en)"
                value={exampleEn}
                onChange={(e) => setExampleEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <input
                type="text"
                required
                placeholder="Example Translation (example_mm)"
                value={exampleMm}
                onChange={(e) => setExampleMm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mm"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold"
              >
                {editingVocabId ? 'Update Vocabulary' : 'Add Vocabulary to Unit'}
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 max-h-52 overflow-y-auto">
                {unitVocabs.map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-extrabold">{v.word_en}</span>{' '}
                      <span className="font-mm text-emerald-600">({v.meaning_mm})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditVocab(v)}
                        className="px-2 py-1 rounded-lg bg-indigo-500/15 text-indigo-600 font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDialog({
                            type: 'vocab',
                            id: v.id,
                            label: `${v.word_en} (${v.meaning_mm})`,
                          })
                        }
                        className="text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </form>

            {/* Quiz Builder */}
            <form
              onSubmit={handleQuizSubmit}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-base flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-500" />
                  <span>
                    {editingQuizId
                      ? 'Edit Quiz Question'
                      : 'Quiz Builder (MCQ / Fill-Blank / Reorder)'}
                  </span>
                </h2>
                {editingQuizId && (
                  <button
                    type="button"
                    onClick={() => setEditingQuizId(null)}
                    className="text-xs font-bold text-rose-500"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuizQuestionType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <option value="mcq">mcq (Multiple Choice)</option>
                <option value="fill_blank">fill_blank (Fill in the Blank)</option>
                <option value="reorder">reorder (Sentence Token Reorder)</option>
              </select>
              <input
                type="text"
                required
                placeholder="Question Text (question_text)"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <input
                type="text"
                required
                placeholder="Options or Reorder Tokens (comma-separated)"
                value={optionsRaw}
                onChange={(e) => setOptionsRaw(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
              <input
                type="text"
                required
                placeholder="Correct Answer (correct_answer)"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
              <textarea
                rows={2}
                required
                placeholder="Myanmar Explanation (explanation_mm)"
                value={explanationMm}
                onChange={(e) => setExplanationMm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mm"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold"
              >
                {editingQuizId ? 'Update Quiz Question' : 'Add Quiz Question to Unit'}
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 max-h-52 overflow-y-auto">
                {unitQuizzes.map((q) => (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <span className="font-extrabold uppercase text-indigo-500">
                        [{q.question_type}]
                      </span>{' '}
                      <span>{q.question_text}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditQuiz(q)}
                        className="px-2 py-1 rounded-lg bg-indigo-500/15 text-indigo-600 font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDialog({
                            type: 'quiz',
                            id: q.id,
                            label: q.question_text,
                          })
                        }
                        className="text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </div>

          {/* Bulk JSON Importer */}
          <form
            onSubmit={handleRunBulkImport}
            className="bg-white dark:bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-indigo-500" />
                <h2 className="font-extrabold text-base">Bulk JSON Content Importer</h2>
              </div>
              <button
                type="button"
                onClick={handleLoadSampleJson}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold"
              >
                Load Sample JSON Template
              </button>
            </div>
            <textarea
              rows={7}
              value={bulkJsonText}
              onChange={(e) => setBulkJsonText(e.target.value)}
              placeholder='{"lesson_id": "les-a1-1", "vocabulary": [...], "quizzes": [...]}'
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm"
              >
                Run Bulk JSON Import
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
