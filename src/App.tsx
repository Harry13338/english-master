import React, { useState, useEffect } from 'react';
import {
  User,
  Lesson,
  LessonVideo,
  Vocabulary,
  CEFRLevel,
  AccentLocale,
  NavTab,
  Quiz,
  UserProgress,
  FlashcardReview,
  SRSRating,
} from './types';
import {
  SEED_USERS,
  SEED_LESSONS,
  SEED_LESSON_VIDEOS,
  SEED_VOCABULARY,
  SEED_QUIZZES,
  SEED_USER_PROGRESS,
  SEED_FLASHCARD_REVIEWS,
} from './seedData';
import { AuthScreen } from './components/AuthScreen';
import { HomePage } from './components/HomePage';
import { LessonsPage } from './components/LessonsPage';
import { FlashcardsPage } from './components/FlashcardsPage';
import { ProfilePage } from './components/ProfilePage';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import {
  isStrictAuthorizedAdmin,
  assertStrictAdminMutationAuth,
  SECRET_ADMIN_ROUTE,
  lockAdminPinSession,
} from './utils/adminSecurity';
import {
  Home,
  BookOpen,
  Layers,
  User as UserIcon,
  Sun,
  Moon,
  Flame,
  Trophy,
} from 'lucide-react';

export function App() {
  // Theme State (Dark/Light responsive UI)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('em_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('em_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('em_theme', 'light');
    }
  }, [isDark]);

  // Authenticated User State (starts at null so visitors begin on Sign In / Sign Up screen)
  const [user, setUser] = useState<User | null>(() => {
    try {
      localStorage.removeItem('em_user');
      localStorage.removeItem('em_auth_user');
      const saved = sessionStorage.getItem('em_session_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('em_session_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('em_session_user');
      localStorage.removeItem('em_auth_user');
      localStorage.removeItem('em_user');
    }
  }, [user]);

  // Lessons, Vocabulary, Quizzes, UserProgress & FlashcardReviews State
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('em_lessons');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_LESSONS;
      }
    }
    return SEED_LESSONS;
  });

  const [vocabularies, setVocabularies] = useState<Vocabulary[]>(() => {
    const saved = localStorage.getItem('em_vocabularies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_VOCABULARY;
      }
    }
    return SEED_VOCABULARY;
  });

  const [lessonVideos, setLessonVideos] = useState<LessonVideo[]>(() => {
    const saved = localStorage.getItem('em_lesson_videos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_LESSON_VIDEOS;
      }
    }
    return SEED_LESSON_VIDEOS;
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('em_quizzes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_QUIZZES;
      }
    }
    return SEED_QUIZZES;
  });

  const [userProgress, setUserProgress] = useState<UserProgress[]>(() => {
    const saved = localStorage.getItem('em_user_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_USER_PROGRESS;
      }
    }
    return SEED_USER_PROGRESS;
  });

  const [flashcardReviews, setFlashcardReviews] = useState<FlashcardReview[]>(() => {
    const saved = localStorage.getItem('em_flashcard_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_FLASHCARD_REVIEWS;
      }
    }
    return SEED_FLASHCARD_REVIEWS;
  });

  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('A1');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [accent, setAccent] = useState<AccentLocale>('en-US');
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(['les-a1-1']);

  const handleUpdateUser = (updated: Partial<User>) => {
    if (!user) return;
    // Block self-assigning role or changing email
    const safeUpdate = { ...updated };
    delete safeUpdate.role;
    delete safeUpdate.email;
    const today = new Date().toISOString().split('T')[0];
    setUser({
      ...user,
      ...safeUpdate,
      last_active_date: today,
    });
  };

  const handleCompleteLesson = (lessonId: string) => {
    if (!completedLessonIds.includes(lessonId)) {
      setCompletedLessonIds((prev) => [...prev, lessonId]);
    }
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      setUser({
        ...user,
        xp_points: user.xp_points + 25,
        streak_count: Math.max(1, user.streak_count),
        last_active_date: today,
      });

      const existing = userProgress.find(
        (p) => p.user_id === user.id && p.lesson_id === lessonId
      );
      let nextProg: UserProgress[];
      if (existing) {
        nextProg = userProgress.map((p) =>
          p.id === existing.id
            ? {
                ...p,
                status: 'completed',
                score: Math.max(p.score, 100),
                completed_at: new Date().toISOString(),
              }
            : p
        );
      } else {
        nextProg = [
          ...userProgress,
          {
            id: `up-${Date.now()}`,
            user_id: user.id,
            lesson_id: lessonId,
            status: 'completed',
            score: 100,
            completed_at: new Date().toISOString(),
          },
        ];
      }
      setUserProgress(nextProg);
      localStorage.setItem('em_user_progress', JSON.stringify(nextProg));
    }
  };

  const handlePassQuiz = (lessonId: string, score: number) => {
    if (!user) return;
    const passed = score >= 60;
    const existing = userProgress.find(
      (p) => p.user_id === user.id && p.lesson_id === lessonId
    );

    let nextProg: UserProgress[];
    if (existing) {
      nextProg = userProgress.map((p) =>
        p.id === existing.id
          ? {
              ...p,
              status: passed ? 'completed' : p.status,
              score: Math.max(p.score, score),
              completed_at: passed ? new Date().toISOString() : p.completed_at,
            }
          : p
      );
    } else {
      nextProg = [
        ...userProgress,
        {
          id: `up-${Date.now()}`,
          user_id: user.id,
          lesson_id: lessonId,
          status: passed ? 'completed' : 'not_started',
          score,
          completed_at: passed ? new Date().toISOString() : null,
        },
      ];
    }
    setUserProgress(nextProg);
    localStorage.setItem('em_user_progress', JSON.stringify(nextProg));

    if (passed) {
      if (!completedLessonIds.includes(lessonId)) {
        setCompletedLessonIds((prev) => [...prev, lessonId]);
      }
      const today = new Date().toISOString().split('T')[0];
      setUser({
        ...user,
        xp_points: user.xp_points + 30,
        streak_count: Math.max(1, user.streak_count),
        last_active_date: today,
      });
    }
  };

  const handleToggleBookmark = (vocabId: string) => {
    if (!user) return;
    const existing = flashcardReviews.find(
      (r) => r.user_id === user.id && r.vocab_id === vocabId
    );
    let next: FlashcardReview[];
    if (existing) {
      next = flashcardReviews.map((r) =>
        r.id === existing.id ? { ...r, is_bookmarked: !r.is_bookmarked } : r
      );
    } else {
      next = [
        ...flashcardReviews,
        {
          id: `rev-${Date.now()}`,
          user_id: user.id,
          vocab_id: vocabId,
          ease_factor: 2.5,
          interval_days: 1,
          next_review_at: new Date().toISOString(),
          is_bookmarked: true,
        },
      ];
    }
    setFlashcardReviews(next);
    localStorage.setItem('em_flashcard_reviews', JSON.stringify(next));
  };

  const handleRateFlashcard = (vocabId: string, rating: SRSRating) => {
    if (!user) return;
    const existing = flashcardReviews.find(
      (r) => r.user_id === user.id && r.vocab_id === vocabId
    );
    const curEase = existing ? existing.ease_factor : 2.5;
    const curInt = existing ? existing.interval_days : 1;

    let nextEase = curEase;
    let nextInt = curInt;
    let nextReviewAt = new Date();

    if (rating === 'again') {
      nextEase = Math.max(1.3, Number((curEase - 0.2).toFixed(2)));
      nextInt = 1;
      nextReviewAt = new Date(Date.now() + 10 * 60 * 1000);
    } else if (rating === 'good') {
      nextInt = curInt <= 1 ? 3 : Math.max(2, Math.round(curInt * curEase));
      nextReviewAt = new Date(Date.now() + nextInt * 86400 * 1000);
    } else if (rating === 'easy') {
      nextEase = Number((curEase + 0.15).toFixed(2));
      nextInt = curInt <= 1 ? 4 : Math.max(4, Math.round(curInt * nextEase * 1.3));
      nextReviewAt = new Date(Date.now() + nextInt * 86400 * 1000);
    }

    let next: FlashcardReview[];
    if (existing) {
      next = flashcardReviews.map((r) =>
        r.id === existing.id
          ? {
              ...r,
              ease_factor: nextEase,
              interval_days: nextInt,
              next_review_at: nextReviewAt.toISOString(),
            }
          : r
      );
    } else {
      next = [
        ...flashcardReviews,
        {
          id: `rev-${Date.now()}`,
          user_id: user.id,
          vocab_id: vocabId,
          ease_factor: nextEase,
          interval_days: nextInt,
          next_review_at: nextReviewAt.toISOString(),
          is_bookmarked: false,
        },
      ];
    }

    setFlashcardReviews(next);
    localStorage.setItem('em_flashcard_reviews', JSON.stringify(next));

    const xpReward = rating === 'easy' ? 10 : rating === 'good' ? 5 : 2;
    const today = new Date().toISOString().split('T')[0];
    setUser({
      ...user,
      xp_points: user.xp_points + xpReward,
      last_active_date: today,
    });
  };

  const handleAddLesson = (newLesson: Omit<Lesson, 'id'>) => {
    const created: Lesson = {
      ...newLesson,
      id: 'les-' + Date.now(),
    };
    const next = [...lessons, created];
    setLessons(next);
    localStorage.setItem('em_lessons', JSON.stringify(next));
  };

  const handleAddVocabulary = (newVocab: Omit<Vocabulary, 'id'>) => {
    const created: Vocabulary = {
      ...newVocab,
      id: 'voc-' + Date.now(),
    };
    const next = [...vocabularies, created];
    setVocabularies(next);
    localStorage.setItem('em_vocabularies', JSON.stringify(next));
  };

  const handleOpenLessonFromHome = (level: CEFRLevel, lessonId: string) => {
    setSelectedLevel(level);
    setActiveLessonId(lessonId);
    setActiveTab('lessons');
  };

  const handleUnauthorizedRedirect = () => {
    setActiveTab('home');
    try {
      if (window.location.hash || window.location.pathname.includes('studio-manage-9x2k')) {
        window.history.replaceState(null, '', '/');
      }
    } catch {}
  };

  // Listen for direct navigation to the secret unlinked route: /studio-manage-9x2k
  useEffect(() => {
    const evaluateSecretRoute = () => {
      const path = window.location.pathname || '';
      const hash = window.location.hash || '';
      const isSecret =
        path.endsWith(SECRET_ADMIN_ROUTE) ||
        hash === `#${SECRET_ADMIN_ROUTE}` ||
        hash === '#studio-manage-9x2k';
      const isOldAdmin =
        path.endsWith('/admin') || hash === '#/admin' || hash === '#admin';

      if (isOldAdmin) {
        handleUnauthorizedRedirect();
        return;
      }

      if (isSecret) {
        if (isStrictAuthorizedAdmin(user)) {
          setActiveTab('admin');
        } else {
          handleUnauthorizedRedirect();
        }
      }
    };

    evaluateSecretRoute();
    window.addEventListener('hashchange', evaluateSecretRoute);
    window.addEventListener('popstate', evaluateSecretRoute);
    return () => {
      window.removeEventListener('hashchange', evaluateSecretRoute);
      window.removeEventListener('popstate', evaluateSecretRoute);
    };
  }, [user]);

  // Admin Dashboard Handlers (/studio-manage-9x2k) with Strict Backend/DB Guard
  const handleSaveLesson = (lesson: Lesson, isEdit: boolean) => {
    assertStrictAdminMutationAuth(user);
    const next = isEdit
      ? lessons.map((l) => (l.id === lesson.id ? lesson : l))
      : [...lessons, lesson];
    setLessons(next);
    localStorage.setItem('em_lessons', JSON.stringify(next));
  };

  const handleReorderLesson = (lessonId: string, direction: 'up' | 'down') => {
    assertStrictAdminMutationAuth(user);
    const target = lessons.find((l) => l.id === lessonId);
    if (!target) return;
    const sameLevel = lessons
      .filter((l) => l.cefr_level === target.cefr_level)
      .sort((a, b) => a.order_index - b.order_index);
    const idx = sameLevel.findIndex((l) => l.id === lessonId);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sameLevel.length) return;
    const neighbor = sameLevel[swapIdx];
    const next = lessons.map((l) => {
      if (l.id === target.id) return { ...l, order_index: neighbor.order_index };
      if (l.id === neighbor.id) return { ...l, order_index: target.order_index };
      return l;
    });
    setLessons(next);
    localStorage.setItem('em_lessons', JSON.stringify(next));
  };

  const handleDeleteLesson = (lessonId: string) => {
    assertStrictAdminMutationAuth(user);
    const nextLessons = lessons.filter((l) => l.id !== lessonId);
    setLessons(nextLessons);
    localStorage.setItem('em_lessons', JSON.stringify(nextLessons));
  };

  const handleSaveVideo = (video: LessonVideo, isEdit: boolean) => {
    assertStrictAdminMutationAuth(user);
    const next = isEdit
      ? lessonVideos.map((v) => (v.id === video.id ? video : v))
      : [...lessonVideos, video];
    setLessonVideos(next);
    localStorage.setItem('em_lesson_videos', JSON.stringify(next));
  };

  const handleDeleteVideo = (videoId: string) => {
    assertStrictAdminMutationAuth(user);
    const next = lessonVideos.filter((v) => v.id !== videoId);
    setLessonVideos(next);
    localStorage.setItem('em_lesson_videos', JSON.stringify(next));
  };

  const handleSaveVocabulary = (vocab: Vocabulary, isEdit: boolean) => {
    assertStrictAdminMutationAuth(user);
    const next = isEdit
      ? vocabularies.map((v) => (v.id === vocab.id ? vocab : v))
      : [...vocabularies, vocab];
    setVocabularies(next);
    localStorage.setItem('em_vocabularies', JSON.stringify(next));
  };

  const handleDeleteVocabulary = (vocabId: string) => {
    assertStrictAdminMutationAuth(user);
    const next = vocabularies.filter((v) => v.id !== vocabId);
    setVocabularies(next);
    localStorage.setItem('em_vocabularies', JSON.stringify(next));
  };

  const handleSaveQuiz = (quiz: Quiz, isEdit: boolean) => {
    assertStrictAdminMutationAuth(user);
    const next = isEdit
      ? quizzes.map((q) => (q.id === quiz.id ? quiz : q))
      : [...quizzes, quiz];
    setQuizzes(next);
    localStorage.setItem('em_quizzes', JSON.stringify(next));
  };

  const handleDeleteQuiz = (quizId: string) => {
    assertStrictAdminMutationAuth(user);
    const next = quizzes.filter((q) => q.id !== quizId);
    setQuizzes(next);
    localStorage.setItem('em_quizzes', JSON.stringify(next));
  };

  const handleBulkImport = (payload: {
    lessons?: Lesson[];
    lessonVideos?: LessonVideo[];
    vocabularies?: Vocabulary[];
    quizzes?: Quiz[];
  }) => {
    assertStrictAdminMutationAuth(user);
    if (payload.vocabularies && payload.vocabularies.length > 0) {
      const nextVocabs = [...vocabularies, ...payload.vocabularies];
      setVocabularies(nextVocabs);
      localStorage.setItem('em_vocabularies', JSON.stringify(nextVocabs));
    }
    if (payload.quizzes && payload.quizzes.length > 0) {
      const nextQuizzes = [...quizzes, ...payload.quizzes];
      setQuizzes(nextQuizzes);
      localStorage.setItem('em_quizzes', JSON.stringify(nextQuizzes));
    }
  };

  if (!user) {
    return (
      <AuthScreen
        onLogin={(loggedInUser) => setUser(loggedInUser)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />
    );
  }

  const bookmarkedVocabIds = flashcardReviews
    .filter((r) => r.user_id === user.id && r.is_bookmarked)
    .map((r) => r.vocab_id);

  // Strictly NO link, button, or menu item to /studio-manage-9x2k anywhere in Navbar, Footer, Profile, or Student UI
  const navItems: { id: NavTab; labelEn: string; labelMm: string; icon: React.ReactNode }[] = [
    { id: 'home', labelEn: 'Home', labelMm: 'ပင်မ', icon: <Home className="w-5 h-5" /> },
    { id: 'lessons', labelEn: 'Lessons', labelMm: 'သင်ခန်းစာ', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'flashcards', labelEn: 'Flashcards', labelMm: 'ကတ်ပြား', icon: <Layers className="w-5 h-5" /> },
    { id: 'profile', labelEn: 'Profile', labelMm: 'ပရိုဖိုင်', icon: <UserIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <button
            onClick={() => {
              setActiveTab('home');
              setActiveLessonId(null);
            }}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight block leading-none">
                English Master
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mm">
                အင်္ဂလိပ်စာ လေ့လာရေး
              </span>
            </div>
          </button>

          {/* Desktop Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id !== 'lessons') setActiveLessonId(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.labelEn}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Status & Theme Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{user.streak_count}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
              <Trophy className="w-3.5 h-3.5" />
              <span>{user.xp_points} XP</span>
            </div>

            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle Dark/Light Theme"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-5 pb-24 md:pb-10">
        {activeTab === 'home' && (
          <HomePage
            user={user}
            lessons={lessons}
            vocabularies={vocabularies}
            quizzes={quizzes}
            userProgress={userProgress.filter((p) => p.user_id === user.id)}
            flashcardReviews={flashcardReviews.filter((r) => r.user_id === user.id)}
            accent={accent}
            onOpenLesson={handleOpenLessonFromHome}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setActiveLessonId(null);
            }}
          />
        )}

        {activeTab === 'lessons' && (
          <LessonsPage
            lessons={lessons}
            vocabularies={vocabularies}
            quizzes={quizzes}
            userProgress={userProgress.filter((p) => p.user_id === user.id)}
            bookmarkedVocabIds={bookmarkedVocabIds}
            onToggleBookmark={handleToggleBookmark}
            selectedLevel={selectedLevel}
            onSelectLevel={(lvl) => {
              setSelectedLevel(lvl);
              setActiveLessonId(null);
            }}
            activeLessonId={activeLessonId}
            onSelectLesson={(id) => setActiveLessonId(id)}
            accent={accent}
            onToggleAccent={(newAccent) => setAccent(newAccent)}
            completedLessonIds={completedLessonIds}
            onCompleteLesson={handleCompleteLesson}
            onPassQuiz={handlePassQuiz}
            isAdmin={false}
            onAddLesson={handleAddLesson}
            onAddVocabulary={handleAddVocabulary}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsPage
            userId={user.id}
            lessons={lessons}
            vocabularies={vocabularies}
            flashcardReviews={flashcardReviews}
            accent={accent}
            onToggleAccent={(newAccent) => setAccent(newAccent)}
            onRateFlashcard={handleRateFlashcard}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            user={user}
            lessons={lessons}
            vocabularies={vocabularies}
            userProgress={userProgress.filter((p) => p.user_id === user.id)}
            flashcardReviews={flashcardReviews.filter((r) => r.user_id === user.id)}
            onUpdateUser={handleUpdateUser}
            onLogout={() => {
              lockAdminPinSession();
              setUser(null);
              handleUnauthorizedRedirect();
            }}
            isDark={isDark}
            onToggleTheme={() => setIsDark(!isDark)}
            accent={accent}
            onToggleAccent={(newAccent) => setAccent(newAccent)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardPage
            user={user}
            lessons={lessons}
            lessonVideos={lessonVideos}
            vocabularies={vocabularies}
            quizzes={quizzes}
            onSaveLesson={handleSaveLesson}
            onReorderLesson={handleReorderLesson}
            onDeleteLesson={handleDeleteLesson}
            onSaveVideo={handleSaveVideo}
            onDeleteVideo={handleDeleteVideo}
            onSaveVocabulary={handleSaveVocabulary}
            onDeleteVocabulary={handleDeleteVocabulary}
            onSaveQuiz={handleSaveQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onBulkImport={handleBulkImport}
            onUnauthorizedRedirect={handleUnauthorizedRedirect}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Home, Lessons, Flashcards, Profile) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5"
      >
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== 'lessons') setActiveLessonId(null);
                }}
                className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                {item.icon}
                <span className="text-[11px] leading-tight mt-0.5">{item.labelEn}</span>
                <span className="text-[9px] font-mm opacity-80 leading-none">{item.labelMm}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
export default App;
