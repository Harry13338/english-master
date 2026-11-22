import React, { useState } from 'react';
import { User, CEFRLevel } from '../types';
import { SEED_USERS, CEFR_LEVELS, AUTHORIZED_ADMIN_EMAIL } from '../seedData';
import { BookOpen, Sparkles, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, isDark, onToggleTheme }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState<CEFRLevel>('A1');
  const [error, setError] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('ကျေးဇူးပြု၍ အီးမေးလ်နှင့် စကားဝှက် ထည့်သွင်းပါ။ (Please enter email and password)');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const cleanEmail = email.trim().toLowerCase();

    if (mode === 'login') {
      if (cleanEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        onLogin({
          ...SEED_USERS[1],
          email: AUTHORIZED_ADMIN_EMAIL,
          role: 'admin',
          last_active_date: today,
        });
        return;
      }

      const existing = SEED_USERS.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.role === 'student'
      );
      if (existing) {
        onLogin({
          ...existing,
          role: 'student',
          last_active_date: today,
        });
      } else {
        onLogin({
          id: 'usr-' + Date.now(),
          name: email.split('@')[0],
          email: email.trim(),
          role: 'student',
          current_level: 'A1',
          xp_points: 0,
          streak_count: 1,
          last_active_date: today,
          auth_provider: 'email',
        });
      }
    } else {
      if (!name.trim()) {
        setError('သင်၏ အမည်ကို ထည့်သွင်းပေးပါ။ (Please enter your name)');
        return;
      }
      // Strict Single-Admin Rule: All new signups default strictly to role: "student"
      onLogin({
        id: 'usr-' + Date.now(),
        name: name.trim(),
        email: email.trim(),
        role: 'student',
        current_level: level,
        xp_points: 0,
        streak_count: 0,
        last_active_date: today,
        auth_provider: 'email',
      });
    }
  };

  const handleGoogleLogin = () => {
    const today = new Date().toISOString().split('T')[0];
    onLogin({
      id: 'usr-google-1',
      name: 'May Thu (မေသူ)',
      email: 'maythu.google@gmail.com',
      role: 'student',
      current_level: 'A1',
      xp_points: 60,
      streak_count: 3,
      last_active_date: today,
      auth_provider: 'google',
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-6 sm:px-6">
      {/* Top Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight block leading-none">
              English Master
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mm">
              အင်္ဂလိပ်စာ လေ့လာရေး
            </span>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CEFR A1–C1 Bilingual Platform</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight">
            {mode === 'login' ? 'Welcome Back!' : 'Create Free Account'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-mm mt-1">
            {mode === 'login'
              ? 'သင်၏ အင်္ဂလိပ်စာ လေ့လာမှုခရီးစဉ်ကို ပြန်လည်စတင်လိုက်ပါ။'
              : 'အကောင့်အသစ်ဖွင့်ပြီး A1 မှ C1 အထိ စနစ်တကျ လေ့လာပါ။'}
          </p>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 mt-5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign In (ဝင်ရန်)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setEmail('');
                setPassword('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign Up (အကောင့်သစ်)
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="mt-5 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name • <span className="font-mm">အမည်</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kyaw Swar (ကျော်စွာ)"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address • <span className="font-mm">အီးမေးလ်</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password • <span className="font-mm">စကားဝှက်</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Starting CEFR Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as CEFRLevel)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CEFR_LEVELS.map((l) => (
                    <option key={l.level} value={l.level}>
                      {l.level} - {l.label_en}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  All new signups default strictly to Student role (0 XP, 0 Streak).
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition"
            >
              <span>{mode === 'login' ? 'Sign In with Email' : 'Create Student Account (0 XP / 0 Streak)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              OR
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-sm font-semibold flex items-center justify-center gap-2.5 transition shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.74-.06-1.47-.19-2.18H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.06Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Demo Student Account */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Instant Student Demo (အမြန်စမ်းသပ်ရန်)
            </p>
            <button
              type="button"
              onClick={() => onLogin(SEED_USERS[0])}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-indigo-500/40 flex items-center justify-between transition"
            >
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                Aung Kyaw (aungkyaw@englishmaster.mm)
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Student • Level A1
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-400 font-mm">
        English Master • Bilingual English-Myanmar Learning App
      </p>
    </div>
  );
};
