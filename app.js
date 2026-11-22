// ============================================================================
// ENGLISH MASTER - BILINGUAL (ENGLISH & MYANMAR/BURMESE) WEB APP
// Includes:
// 1. Auth & User Model (name, email, role, current_level, xp_points, streak_count, last_active_date)
// 2. CEFR Lessons (A1-C1) & Vocabulary with Web Speech API (en-US / en-GB)
// 3. Video Lesson Module (lesson_videos & user_video_progress models, YouTube Unlisted + MP4/R2 support,
//    0.75x-1.5x speed controls, Dual VTT Subtitle toggle Off/EN/MM/Both, 5s auto-save resume & 90% +20 XP)
// ============================================================================

const CEFR_LEVELS = [
  {
    level: 'A1',
    label_en: 'Beginner',
    label_mm: 'အခြေခံအဆင့် (၁)',
    color: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  {
    level: 'A2',
    label_en: 'Elementary',
    label_mm: 'အခြေခံအဆင့် (၂)',
    color: 'from-sky-500 to-blue-600',
    badgeBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  },
  {
    level: 'B1',
    label_en: 'Intermediate',
    label_mm: 'အလယ်အလတ်အဆင့် (၁)',
    color: 'from-indigo-500 to-violet-600',
    badgeBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  },
  {
    level: 'B2',
    label_en: 'Upper-Intermediate',
    label_mm: 'အလယ်အလတ်အဆင့် (၂)',
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  {
    level: 'C1',
    label_en: 'Advanced',
    label_mm: 'အဆင့်မြင့်',
    order: 5,
    color: 'from-rose-500 to-pink-600',
    badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
];

const SEED_USERS = [
  {
    id: 'usr-student-1',
    name: 'Aung Kyaw (အောင်ကျော်)',
    email: 'aungkyaw@englishmaster.mm',
    role: 'student',
    current_level: 'A1',
    xp_points: 120,
    streak_count: 4,
    last_active_date: new Date().toISOString().split('T')[0],
    auth_provider: 'email',
  },
  {
    id: 'usr-admin-1',
    name: 'Master Admin',
    email: 'aingdy924@gmail.com',
    role: 'admin',
    current_level: 'C1',
    xp_points: 1850,
    streak_count: 21,
    last_active_date: new Date().toISOString().split('T')[0],
    auth_provider: 'google',
  },
];

// ============================================================================
// STRICT SINGLE-ADMIN & SECRET ROUTE SECURITY CONFIGURATION
// ============================================================================
const SECRET_ADMIN_ROUTE = '/studio-manage-9x2k';
const AUTHORIZED_ADMIN_EMAIL = (
  (typeof window !== 'undefined' && window.ENV && window.ENV.ADMIN_EMAIL) ||
  'aingdy924@gmail.com'
)
  .trim()
  .toLowerCase();

const ADMIN_PIN_ENV = String(
  (typeof window !== 'undefined' && window.ENV && window.ENV.ADMIN_PIN) ||
    localStorage.getItem('em_env_admin_pin') ||
    '246810'
).trim();

function isStrictAuthorizedAdmin(user) {
  if (!user) return false;
  return (
    user.role === 'admin' &&
    typeof user.email === 'string' &&
    user.email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL
  );
}

function isAdminPinUnlockedForSession() {
  return sessionStorage.getItem('em_admin_pin_unlocked') === 'true';
}

function assertStrictAdminMutationAuth() {
  if (!isStrictAuthorizedAdmin(state.user)) {
    throw new Error('403 Forbidden: Strict single-admin email & role verification failed.');
  }
  if (!isAdminPinUnlockedForSession()) {
    throw new Error('403 Forbidden: 6-digit ADMIN_PIN session gate is locked.');
  }
  return true;
}

function silentRedirectToRoot() {
  state.activeTab = 'home';
  try {
    if (
      window.location.hash &&
      (window.location.hash.includes('studio-manage-9x2k') ||
        window.location.hash.includes('admin'))
    ) {
      history.replaceState(null, '', window.location.pathname || '/');
    } else if (
      window.location.pathname &&
      window.location.pathname.includes('studio-manage-9x2k')
    ) {
      history.replaceState(null, '', '/');
    }
  } catch {}
}

const SEED_LESSONS = [
  {
    id: 'les-a1-1',
    cefr_level: 'A1',
    unit_number: 1,
    title: 'Greetings & Self-Introductions',
    title_mm: 'နှုတ်ဆက်ခြင်းနှင့် မိမိကိုယ်ကို မိတ်ဆက်ခြင်း',
    order_index: 1,
    grammar_note_mm: `【 Verb to Be (am / is / are) အသုံးပြုပုံ 】

အင်္ဂလိပ်စာတွင် မိမိကိုယ်ကို မိတ်ဆက်ရာ၌ဖြစ်စေ၊ လူတစ်ဦး သို့မဟုတ် အရာဝတ္ထုတစ်ခု၏ အခြေအနေကို ဖော်ပြရာ၌ဖြစ်စေ "Verb to Be" (am, is, are) ကို အဓိက အသုံးပြုပါသည်။ မြန်မာလို "ဖြစ်သည် / ရှိသည်" ဟု အဓိပ္ပာယ်ရပါသည်။

၁။ I + am (ကျွန်တော်/ကျွန်မ ... ဖြစ်ပါသည်)
• I am Aung Kyaw. (ကျွန်တော် အောင်ကျော် ဖြစ်ပါတယ်။)
• I'm from Myanmar. (ကျွန်တော် မြန်မာနိုင်ငံက ဖြစ်ပါတယ်။)

၂။ He / She / It / တစ်ဦးတည်း + is
• She is a teacher. (သူမသည် ဆရာမတစ်ဦး ဖြစ်ပါသည်။)
• It is a nice day. (သာယာသော နေ့တစ်နေ့ ဖြစ်ပါသည်။)

၃။ You / We / They / အများကိန်း + are
• You are very kind. (သင်သည် အလွန်ကြင်နာတတ်သူ ဖြစ်ပါသည်။)
• They are my friends. (သူတို့သည် ကျွန်တော့်သူငယ်ချင်းများ ဖြစ်ကြပါသည်။)

💡 အတိုကောက်ပုံစံများ (Contractions):
I am → I'm | He is → He's | She is → She's | You are → You're | We are → We're`,
  },
  {
    id: 'les-a1-2',
    cefr_level: 'A1',
    unit_number: 2,
    title: 'Daily Routines & Present Simple',
    title_mm: 'နေ့စဉ်လုပ်ငန်းဆောင်တာများနှင့် ပစ္စုပ္ပန်ကာလ',
    order_index: 2,
    grammar_note_mm: `【 Present Simple Tense (နေ့စဉ်ပုံမှန် လုပ်ဆောင်ချက်များ) 】

နေ့စဉ်ပုံမှန် လုပ်လေ့လုပ်ထရှိသော အလေ့အထများ (Habits & Daily Routines) နှင့် အမြဲမှန်ကန်သော အချက်အလက်များကို ပြောဆိုရာတွင် Present Simple Tense (Verb နဂိုမူရင်းပုံစံ - V1) ကို အသုံးပြုပါသည်။

၁။ I / You / We / They + Verb (မူရင်းပုံစံ V1)
• I wake up at 6 AM every day. (ကျွန်တော် နေ့တိုင်း မနက် ၆ နာရီမှာ အိပ်ရာထပါတယ်။)
• We drink coffee in the morning. (ကျွန်တော်တို့ မနက်ခင်းမှာ ကော်ဖီသောက်ကြတယ်။)

၂။ He / She / It (တစ်ဦးတည်း Subject) + Verb (-s / -es ပေါင်းထည့်ရန်)
• She works at an office. (သူမ ရုံးတစ်ခုမှာ အလုပ်လုပ်ပါတယ်။)
• He goes to school by bus. (သူ ဘတ်စ်ကားဖြင့် ကျောင်းသွားပါတယ်။)

၃။ အငြင်းဝါကျနှင့် မေးခွန်းဝါကျ (Do / Does):
• I do not (don't) eat spicy food. (ကျွန်တော် အစပ်မစားပါ။)
• Does she speak English? (သူမ အင်္ဂလိပ်စကား ပြောတတ်သလား။)`,
  },
  {
    id: 'les-a2-1',
    cefr_level: 'A2',
    unit_number: 1,
    title: 'Travel, Airport & Directions',
    title_mm: 'ခရီးသွားလာခြင်း၊ လေဆိပ်နှင့် လမ်းညွှန်မေးမြန်းခြင်း',
    order_index: 1,
    grammar_note_mm: `【 ယဉ်ကျေးစွာ မေးမြန်းခြင်း (Could you... / Would you mind...) 】

ခရီးသွားရာတွင် လမ်းမေးခြင်း သို့မဟုတ် အကူအညီတောင်းခံရာတွင် ရိုးရိုးမေးခွန်းထက် "Could you please...?" သို့မဟုတ် "Excuse me, how do I get to...?" ကို သုံးခြင်းဖြင့် ပိုမိုယဉ်ကျေးသိမ်မွေ့စေပါသည်။

• Excuse me, where is the boarding gate? (တစ်ဆိတ်လောက်ခင်ဗျာ၊ လေယာဉ်ပေါ်တက်ရမည့်ဂိတ် ဘယ်မှာလဲ။)
• Could you show me on the map? (မြေပုံပေါ်မှာ ပြပေးနိုင်မလားခင်ဗျာ။)`,
  },
  {
    id: 'les-b1-1',
    cefr_level: 'B1',
    unit_number: 1,
    title: 'Work Experiences & Present Perfect',
    title_mm: 'လုပ်ငန်းအတွေ့အကြုံများနှင့် Present Perfect သဒ္ဒါ',
    order_index: 1,
    grammar_note_mm: `【 Present Perfect Tense (have / has + V3) 】

အတိတ်က စတင်ခဲ့ပြီး ယခုအချိန်ထိ ဆက်လက်ဖြစ်ပေါ်နေသော ကိစ္စရပ်များ သို့မဟုတ် ဘဝအတွေ့အကြုံများကို ဖော်ပြရာတွင် "have / has + Past Participle (V3)" ကို သုံးပါသည်။

• I have worked here for three years. (ကျွန်တော် ဒီမှာ အလုပ်လုပ်ခဲ့တာ ၃ နှစ်ရှိပါပြီ။)
• She has already finished the report. (သူမ အစီရင်ခံစာကို အပြီးသတ်ပြီးပါပြီ။)`,
  },
  {
    id: 'les-b2-1',
    cefr_level: 'B2',
    unit_number: 1,
    title: 'Business Negotiations & Conditionals',
    title_mm: 'စီးပွားရေးညှိနှိုင်းဆွေးနွေးခြင်းနှင့် အခြေအနေပြဝါကျများ',
    order_index: 1,
    grammar_note_mm: `【 First & Second Conditionals (If ဝါကျများ) 】

စီးပွားရေးဆွေးနွေးပွဲများတွင် အပေးအယူညှိနှိုင်းရာ၌ Conditional ဝါကျများကို အသုံးပြုပါသည်။

• First Conditional (ဖြစ်နိုင်ခြေများသောအရာ): If + Present Simple, will + Verb
  "If we sign the contract today, we will offer a 10% discount."
• Second Conditional (စိတ်ကူး/ယဉ်ကျေးသော အဆိုပြုချက်): If + Past Simple, would + Verb
  "If you extended the deadline, we would deliver higher quality results."`,
  },
  {
    id: 'les-c1-1',
    cefr_level: 'C1',
    unit_number: 1,
    title: 'Academic Discourse & Inversion',
    title_mm: 'ပညာရပ်ဆိုင်ရာ အရေးအသားနှင့် Inversion သဒ္ဒါ',
    order_index: 1,
    grammar_note_mm: `【 Negative Inversion for Emphasis (အလေးအနက်ထား ဖော်ပြခြင်း) 】

C1 အဆင့် အဆင့်မြင့် အင်္ဂလိပ်စာတွင် ဝါကျတစ်ကြောင်းကို ပိုမိုအားကောင်းစေရန် Negative Adverb (Never, Rarely, Seldom, Not only) တို့ကို ဝါကျရှေ့ဆုံးသို့ ပို့ပြီး မေးခွန်းပုံစံ (Auxiliary + Subject + Verb) ဖြင့် ရေးသားပြောဆိုလေ့ရှိပါသည်။

• Not only did the research confirm our hypothesis, but it also revealed new insights.
• Seldom have we witnessed such rapid technological transformation.`,
  },
];

// ============================================================================
// LESSON VIDEOS SEED DATA (lesson_videos model)
// Fields: id, lesson_id, title, video_provider ('youtube_unlisted' | 'mp4_url'),
//         video_url, subtitle_en_vtt, subtitle_mm_vtt, duration_sec, order_index
// ============================================================================
const SEED_LESSON_VIDEOS = [
  // A1 Unit 1 - Video 1: Direct MP4 / Cloudflare R2 style URL with synced Dual VTT Subtitles
  {
    id: 'vid-a1-1-1',
    lesson_id: 'les-a1-1',
    title: 'Part 1: Natural Greetings & Introducing Yourself (MP4 / Cloudflare R2)',
    video_provider: 'mp4_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration_sec: 15,
    order_index: 1,
    subtitle_en_vtt: `WEBVTT

00:00:00.000 --> 00:00:03.500
Hello everyone! Welcome to English Master A1 Unit 1.

00:00:03.500 --> 00:00:07.000
Today we will learn how to give a warm greeting in English.

00:00:07.000 --> 00:00:11.000
"Allow me to introduce myself. My hometown is Mandalay."

00:00:11.000 --> 00:00:15.000
"It is a pleasure to meet our new neighbor today!"`,
    subtitle_mm_vtt: `WEBVTT

00:00:00.000 --> 00:00:03.500
မင်္ဂလာပါ အားလုံးပဲ! English Master A1 ယူနစ် (၁) မှ ကြိုဆိုပါတယ်။

00:00:03.500 --> 00:00:07.000
ဒီနေ့မှာတော့ အင်္ဂလိပ်လို နွေးထွေးစွာ နှုတ်ဆက်ပုံကို လေ့လာကြပါမယ်။

00:00:07.000 --> 00:00:11.000
"ကျွန်တော့်ကိုယ်ကျွန်တော် မိတ်ဆက်ခွင့်ပြုပါ။ ကျွန်တော့်ဇာတိမြို့က မန္တလေးပါ။"

00:00:11.000 --> 00:00:15.000
"ဒီနေ့ အိမ်နီးနားချင်းအသစ်နဲ့ တွေ့ဆုံရတာ ဝမ်းမြောက်ဂုဏ်ယူမိပါတယ်!"`,
  },
  // A1 Unit 1 - Video 2: YouTube Unlisted Embed with Dual VTT Subtitles
  {
    id: 'vid-a1-1-2',
    lesson_id: 'les-a1-1',
    title: 'Part 2: Verb to Be (am / is / are) Conversation Practice (YouTube Unlisted)',
    video_provider: 'youtube_unlisted',
    video_url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    duration_sec: 20,
    order_index: 2,
    subtitle_en_vtt: `WEBVTT

00:00:00.000 --> 00:00:05.000
Using "I am", "She is", and "They are" in real conversations.

00:00:05.000 --> 00:00:10.000
Notice how native speakers use contractions like "I'm" and "You're".

00:00:10.000 --> 00:00:15.000
"She gave us a warm greeting at the door."

00:00:15.000 --> 00:00:20.000
Practice repeating each sentence aloud for clear pronunciation.`,
    subtitle_mm_vtt: `WEBVTT

00:00:00.000 --> 00:00:05.000
"I am", "She is" နှင့် "They are" တို့ကို လက်တွေ့စကားပြောတွင် အသုံးပြုပုံ။

00:00:05.000 --> 00:00:10.000
"I'm" နှင့် "You're" ကဲ့သို့ အတိုကောက်အသံထွက်များကို သတိပြုနားထောင်ပါ။

00:00:10.000 --> 00:00:15.000
"သူမက တံခါးဝမှာ ကျွန်တော်တို့ကို နွေးထွေးစွာ နှုတ်ဆက်ခဲ့ပါတယ်။"

00:00:15.000 --> 00:00:20.000
အသံထွက်ပီသစေရန် ဝါကျတစ်ကြောင်းချင်းစီကို အသံထွက်၍ လိုက်ဆိုလေ့ကျင့်ပါ။`,
  },
  // A1 Unit 2 - Video 1: Direct MP4 / Cloudflare R2
  {
    id: 'vid-a1-2-1',
    lesson_id: 'les-a1-2',
    title: 'Talking About Your Daily Routine & Schedule (MP4 / R2)',
    video_provider: 'mp4_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration_sec: 15,
    order_index: 1,
    subtitle_en_vtt: `WEBVTT

00:00:00.000 --> 00:00:04.000
Let's talk about our daily routine using Present Simple Tense.

00:00:04.000 --> 00:00:08.000
"We usually eat mohinga for breakfast on Sundays."

00:00:08.000 --> 00:00:12.000
"He commutes to his office by train every morning."

00:00:12.000 --> 00:00:15.000
"I like to relax and read a book before bed."`,
    subtitle_mm_vtt: `WEBVTT

00:00:00.000 --> 00:00:04.000
Present Simple Tense ကိုသုံးပြီး နေ့စဉ်လုပ်ငန်းဆောင်တာများအကြောင်း ပြောကြရအောင်။

00:00:04.000 --> 00:00:08.000
"ကျွန်တော်တို့ တနင်္ဂနွေနေ့တိုင်း မနက်စာအဖြစ် မုန့်ဟင်းခါး စားလေ့ရှိပါတယ်။"

00:00:08.000 --> 00:00:12.000
"သူ မနက်တိုင်း ရထားဖြင့် ရုံးသို့ သွားလာပါတယ်။"

00:00:12.000 --> 00:00:15.000
"အိပ်ရာမဝင်ခင် စာအုပ်ဖတ်ပြီး အနားယူအပန်းဖြေရတာကို ကျွန်တော် နှစ်သက်ပါတယ်။"`,
  },
  // A2 Unit 1 - Video 1
  {
    id: 'vid-a2-1-1',
    lesson_id: 'les-a2-1',
    title: 'Airport Check-In & Asking for Directions Politely',
    video_provider: 'mp4_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    duration_sec: 15,
    order_index: 1,
    subtitle_en_vtt: `WEBVTT

00:00:00.000 --> 00:00:05.000
"Excuse me, could you tell me where the departure gate is?"

00:00:05.000 --> 00:00:10.000
"Please check the departure time on your boarding pass."

00:00:10.000 --> 00:00:15.000
"Bagan is a popular tourist destination in Myanmar."`,
    subtitle_mm_vtt: `WEBVTT

00:00:00.000 --> 00:00:05.000
"တစ်ဆိတ်လောက်ခင်ဗျာ၊ ထွက်ခွာမည့်ဂိတ် ဘယ်မှာလဲဆိုတာ ပြောပြပေးနိုင်မလား။"

00:00:05.000 --> 00:00:10.000
"သင်၏ လေယာဉ်လက်မှတ်ပေါ်တွင် ထွက်ခွာမည့်အချိန်ကို စစ်ဆေးပေးပါ။"

00:00:10.000 --> 00:00:15.000
"ပုဂံသည် မြန်မာနိုင်ငံတွင် လူကြိုက်များသော ခရီးသွားနေရာတစ်ခု ဖြစ်ပါသည်။"`,
  },
];

// Seed initial user_video_progress record so user can see resume functionality right away
const SEED_VIDEO_PROGRESS = [
  {
    id: 'prog-seed-1',
    user_id: 'usr-student-1',
    video_id: 'vid-a1-1-1',
    watched_seconds: 5,
    is_completed: false,
    updated_at: new Date().toISOString(),
  },
];

const SEED_VOCABULARY = [
  // ================= A1 - Lesson 1 (5 Vocabulary Words) =================
  {
    id: 'voc-a1-1-1',
    lesson_id: 'les-a1-1',
    word_en: 'Greeting',
    meaning_mm: 'နှုတ်ဆက်စကား / နှုတ်ခွန်းဆက်သခြင်း',
    phonetic: '/ˈɡriː.tɪŋ/',
    example_en: 'She gave us a warm greeting at the door.',
    example_mm: 'သူမက တံခါးဝမှာ ကျွန်တော်တို့ကို နွေးထွေးစွာ နှုတ်ဆက်ခဲ့ပါတယ်။',
  },
  {
    id: 'voc-a1-1-2',
    lesson_id: 'les-a1-1',
    word_en: 'Introduce',
    meaning_mm: 'မိတ်ဆက်ပေးသည်',
    phonetic: '/ˌɪn.trəˈdjuːs/',
    example_en: 'Allow me to introduce myself to the class.',
    example_mm: 'အတန်းကို ကျွန်တော့်ကိုယ်ကျွန်တော် မိတ်ဆက်ခွင့်ပြုပါ။',
  },
  {
    id: 'voc-a1-1-3',
    lesson_id: 'les-a1-1',
    word_en: 'Pleasure',
    meaning_mm: 'ဝမ်းမြောက်ပျော်ရွှင်မှု / ဂုဏ်ယူဝမ်းသာခြင်း',
    phonetic: '/ˈpleʒ.ər/',
    example_en: 'It is a pleasure to meet you today.',
    example_mm: 'ဒီနေ့ သင်နှင့်တွေ့ဆုံရတာ ဝမ်းသာဂုဏ်ယူမိပါတယ်။',
  },
  {
    id: 'voc-a1-1-4',
    lesson_id: 'les-a1-1',
    word_en: 'Hometown',
    meaning_mm: 'မွေးရပ်မြေ / ဇာတိမြို့',
    phonetic: '/ˈhoʊm.taʊn/',
    example_en: 'My hometown is Mandalay in central Myanmar.',
    example_mm: 'ကျွန်တော့်ရဲ့ မွေးရပ်ဇာတိမြို့ကတော့ မြန်မာပြည်အလယ်ပိုင်းက မန္တလေးမြို့ ဖြစ်ပါတယ်။',
  },
  {
    id: 'voc-a1-1-5',
    lesson_id: 'les-a1-1',
    word_en: 'Neighbor',
    meaning_mm: 'အိမ်နီးနားချင်း',
    phonetic: '/ˈneɪ.bər/',
    example_en: 'Our new neighbor is very friendly and helpful.',
    example_mm: 'ကျွန်တော်တို့ရဲ့ အိမ်နီးနားချင်းအသစ်က အရမ်းဖော်ရွေပြီး ကူညီတတ်ပါတယ်။',
  },

  // ================= A1 - Lesson 2 (5 Vocabulary Words) =================
  {
    id: 'voc-a1-2-1',
    lesson_id: 'les-a1-2',
    word_en: 'Schedule',
    meaning_mm: 'အချိန်ဇယား / အစီအစဉ်',
    phonetic: '/ˈskedʒ.uːl/',
    example_en: 'I have a busy study schedule every weekday.',
    example_mm: 'ကြားရက်တိုင်းမှာ ကျွန်တော့်မှာ မအားလပ်တဲ့ စာကြည့်အချိန်ဇယားတစ်ခု ရှိပါတယ်။',
  },
  {
    id: 'voc-a1-2-2',
    lesson_id: 'les-a1-2',
    word_en: 'Breakfast',
    meaning_mm: 'မနက်စာ',
    phonetic: '/ˈbrek.fəst/',
    example_en: 'We usually eat mohinga for breakfast on Sundays.',
    example_mm: 'ကျွန်တော်တို့ တနင်္ဂနွေနေ့တိုင်း မနက်စာအဖြစ် မုန့်ဟင်းခါး စားလေ့ရှိပါတယ်။',
  },
  {
    id: 'voc-a1-2-3',
    lesson_id: 'les-a1-2',
    word_en: 'Commute',
    meaning_mm: 'အိမ်မှ အလုပ်/ကျောင်းသို့ နေ့စဉ်သွားလာသည်',
    phonetic: '/kəˈmjuːt/',
    example_en: 'He commutes to his office by train every morning.',
    example_mm: 'သူ မနက်တိုင်း ရထားဖြင့် ရုံးသို့ သွားလာပါတယ်။',
  },
  {
    id: 'voc-a1-2-4',
    lesson_id: 'les-a1-2',
    word_en: 'Exercise',
    meaning_mm: 'ကိုယ်လက်လှုပ်ရှား အားကစားလုပ်သည်',
    phonetic: '/ˈek.sɚ.saɪz/',
    example_en: 'She exercises for thirty minutes in the park.',
    example_mm: 'သူမ ပန်းခြံထဲမှာ မိနစ်သုံးဆယ်ကြာ ကိုယ်လက်လှုပ်ရှား လေ့ကျင့်ခန်းလုပ်ပါတယ်။',
  },
  {
    id: 'voc-a1-2-5',
    lesson_id: 'les-a1-2',
    word_en: 'Relax',
    meaning_mm: 'အနားယူအပန်းဖြေသည်',
    phonetic: '/rɪˈlæks/',
    example_en: 'I like to relax and read a book before bed.',
    example_mm: 'အိပ်ရာမဝင်ခင် စာအုပ်ဖတ်ပြီး အနားယူအပန်းဖြေရတာကို ကျွန်တော် နှစ်သက်ပါတယ်။',
  },

  // ================= A2 - Lesson 1 =================
  {
    id: 'voc-a2-1-1',
    lesson_id: 'les-a2-1',
    word_en: 'Departure',
    meaning_mm: 'ထွက်ခွာခြင်း (လေယာဉ်/ရထား)',
    phonetic: '/dɪˈpɑːr.tʃər/',
    example_en: 'Please check the departure time on your boarding pass.',
    example_mm: 'သင်၏ လေယာဉ်လက်မှတ်ပေါ်တွင် ထွက်ခွာမည့်အချိန်ကို စစ်ဆေးပေးပါ။',
  },
  {
    id: 'voc-a2-1-2',
    lesson_id: 'les-a2-1',
    word_en: 'Destination',
    meaning_mm: 'ခရီးဆုံးပန်းတိုင် / သွားရောက်မည့်နေရာ',
    phonetic: '/ˌdes.tɪˈneɪ.ʃən/',
    example_en: 'Bagan is a popular tourist destination in Myanmar.',
    example_mm: 'ပုဂံသည် မြန်မာနိုင်ငံတွင် လူကြိုက်များသော ခရီးသွားနေရာတစ်ခု ဖြစ်ပါသည်။',
  },

  // ================= B1 - Lesson 1 =================
  {
    id: 'voc-b1-1-1',
    lesson_id: 'les-b1-1',
    word_en: 'Collaborate',
    meaning_mm: 'ပူးပေါင်းဆောင်ရွက်သည်',
    phonetic: '/kəˈlæb.ə.reɪt/',
    example_en: 'Our team collaborated closely on the new mobile project.',
    example_mm: 'ကျွန်တော်တို့အဖွဲ့သည် မိုဘိုင်းပရောဂျက်အသစ်တွင် အနီးကပ် ပူးပေါင်းဆောင်ရွက်ခဲ့ကြသည်။',
  },
  {
    id: 'voc-b1-1-2',
    lesson_id: 'les-b1-1',
    word_en: 'Achievement',
    meaning_mm: 'အောင်မြင်မှု / စွမ်းဆောင်နိုင်မှု',
    phonetic: '/əˈtʃiːv.mənt/',
    example_en: 'Passing the B1 exam is a great achievement.',
    example_mm: 'B1 စာမေးပွဲ အောင်မြင်ခြင်းသည် ကြီးမားသော အောင်မြင်မှုတစ်ခု ဖြစ်ပါသည်။',
  },

  // ================= B2 - Lesson 1 =================
  {
    id: 'voc-b2-1-1',
    lesson_id: 'les-b2-1',
    word_en: 'Compromise',
    meaning_mm: 'အလျှော့အတင်းလုပ်၍ ညှိနှိုင်းသဘောတူသည်',
    phonetic: '/ˈkɒm.prə.maɪz/',
    example_en: 'Both companies reached a compromise after two hours.',
    example_mm: 'နှစ်နာရီကြာ ဆွေးနွေးပြီးနောက် ကုမ္ပဏီနှစ်ခုလုံး သဘောတူညီမှု ရရှိခဲ့ကြသည်။',
  },

  // ================= C1 - Lesson 1 =================
  {
    id: 'voc-c1-1-1',
    lesson_id: 'les-c1-1',
    word_en: 'Paradigm',
    meaning_mm: 'စံနမူနာပုံစံ / အတွေးအခေါ်မူဘောင်',
    phonetic: '/ˈpær.ə.daɪm/',
    example_en: 'Artificial intelligence has created a new paradigm in education.',
    example_mm: 'ဉာဏ်ရည်တုနည်းပညာသည် ပညာရေးနယ်ပယ်တွင် စံနမူနာမူဘောင်အသစ်တစ်ခုကို ဖန်တီးပေးခဲ့သည်။',
  },
];

// ============================================================================
// QUIZZES SEED DATA (quizzes model)
// Fields: id, lesson_id, question_type ('mcq' | 'fill_blank' | 'reorder'),
//         question_text, options_json, correct_answer, explanation_mm
// ============================================================================
const SEED_QUIZZES = [
  // A1 Unit 1 Quizzes (mcq, fill_blank, reorder)
  {
    id: 'qz-a1-1-1',
    lesson_id: 'les-a1-1',
    question_type: 'mcq',
    question_text: 'Choose the correct Verb to Be: "She ___ our new neighbor from Mandalay."',
    options_json: JSON.stringify(['am', 'is', 'are', 'be']),
    correct_answer: 'is',
    explanation_mm:
      'She (သူမ - တစ်ဦးတည်း Subject) ဖြစ်သောကြောင့် Verb to Be တွင် "is" ကို အသုံးပြုရပါမည်။ (I + am, He/She/It + is, You/We/They + are)',
  },
  {
    id: 'qz-a1-1-2',
    lesson_id: 'les-a1-1',
    question_type: 'fill_blank',
    question_text:
      'Complete the polite greeting: "It is a ___ to meet you today." (ဝမ်းမြောက်ဂုဏ်ယူခြင်း)',
    options_json: JSON.stringify(['pleasure', 'hometown', 'neighbor', 'greeting']),
    correct_answer: 'pleasure',
    explanation_mm:
      '"It is a pleasure to meet you" သည် တစ်ဦးနှင့်တစ်ဦး စတင်တွေ့ဆုံချိန်တွင် ဝမ်းမြောက်ဂုဏ်ယူကြောင်း ယဉ်ကျေးစွာ ပြောဆိုသည့် နှုတ်ဆက်စကား ဖြစ်ပါသည်။',
  },
  {
    id: 'qz-a1-1-3',
    lesson_id: 'les-a1-1',
    question_type: 'reorder',
    question_text: 'Reorder the words to form a natural self-introduction:',
    options_json: JSON.stringify(['myself', 'introduce', 'Allow', 'to', 'me']),
    correct_answer: 'Allow me to introduce myself',
    explanation_mm:
      '"Allow me to introduce myself" (ကျွန်တော့်ကိုယ်ကျွန်တော် မိတ်ဆက်ခွင့်ပြုပါ) ဟူသော အစီအစဉ်အတိုင်း စီပေးရပါမည်။',
  },
  // A1 Unit 2 Quizzes (mcq, fill_blank, reorder)
  {
    id: 'qz-a1-2-1',
    lesson_id: 'les-a1-2',
    question_type: 'mcq',
    question_text: 'Which sentence is grammatically correct in Present Simple Tense?',
    options_json: JSON.stringify([
      'He commute to his office by train.',
      'He commutes to his office by train.',
      'He commuting to his office by train.',
      'He are commute to his office.',
    ]),
    correct_answer: 'He commutes to his office by train.',
    explanation_mm:
      'Present Simple Tense တွင် Subject သည် He/She/It (တစ်ဦးတည်း) ဖြစ်ပါက Verb တွင် -s/-es ပေါင်းထည့်ရပါမည် (commute → commutes)။',
  },
  {
    id: 'qz-a1-2-2',
    lesson_id: 'les-a1-2',
    question_type: 'fill_blank',
    question_text:
      'Type or select the missing word: "We usually eat mohinga for ___ on Sundays." (မနက်စာ)',
    options_json: JSON.stringify(['breakfast', 'schedule', 'exercise', 'relax']),
    correct_answer: 'breakfast',
    explanation_mm:
      'မနက်စာကို အင်္ဂလိပ်လို "breakfast" ဟုခေါ်ပြီး "eat mohinga for breakfast" (မနက်စာအဖြစ် မုန့်ဟင်းခါးစားသည်) ဟု သုံးပါသည်။',
  },
  {
    id: 'qz-a1-2-3',
    lesson_id: 'les-a1-2',
    question_type: 'reorder',
    question_text: 'Reorder the words to describe an evening habit:',
    options_json: JSON.stringify(['relax', 'to', 'I', 'bed', 'like', 'before']),
    correct_answer: 'I like to relax before bed',
    explanation_mm:
      '"I like to relax before bed" (အိပ်ရာမဝင်ခင် အနားယူအပန်းဖြေရတာကို နှစ်သက်ပါသည်) ဟု Subject + Verb + Infinitive ပုံစံအတိုင်း စီရပါမည်။',
  },
  // A2 Unit 1 Quizzes
  {
    id: 'qz-a2-1-1',
    lesson_id: 'les-a2-1',
    question_type: 'mcq',
    question_text: 'Which phrase is the most polite way to ask for directions at an airport?',
    options_json: JSON.stringify([
      'Where is boarding gate?',
      'Could you please tell me where the boarding gate is?',
      'Tell me the boarding gate now.',
      'You show me boarding gate.',
    ]),
    correct_answer: 'Could you please tell me where the boarding gate is?',
    explanation_mm:
      'ခရီးသွားရာတွင် လမ်းမေးမြန်းရာ၌ "Could you please..." ကို သုံးခြင်းသည် အယဉ်ကျေးဆုံးနှင့် အသင့်တော်ဆုံး ဖြစ်ပါသည်။',
  },
  {
    id: 'qz-a2-1-2',
    lesson_id: 'les-a2-1',
    question_type: 'fill_blank',
    question_text: 'Complete the sentence: "Please check the ___ time on your boarding pass." (ထွက်ခွာမည့်အချိန်)',
    options_json: JSON.stringify(['departure', 'destination', 'neighbor']),
    correct_answer: 'departure',
    explanation_mm:
      'လေယာဉ် သို့မဟုတ် ရထား ထွက်ခွာချိန်ကို "departure time" ဟု ခေါ်ဆိုပါသည်။',
  },
  // B1 Unit 1 Quiz
  {
    id: 'qz-b1-1-1',
    lesson_id: 'les-b1-1',
    question_type: 'mcq',
    question_text: 'Complete with Present Perfect Tense: "She ___ already finished the project report."',
    options_json: JSON.stringify(['have', 'has', 'having', 'had']),
    correct_answer: 'has',
    explanation_mm:
      'Present Perfect Tense (have/has + V3) တွင် Subject သည် She (တစ်ဦးတည်း) ဖြစ်သောကြောင့် "has" ကို သုံးရပါမည်။',
  },
  // B2 Unit 1 Quiz
  {
    id: 'qz-b2-1-1',
    lesson_id: 'les-b2-1',
    question_type: 'mcq',
    question_text: 'First Conditional: "If we sign the contract today, we ___ offer a 10% discount."',
    options_json: JSON.stringify(['will', 'would', 'had', 'were']),
    correct_answer: 'will',
    explanation_mm:
      'First Conditional ဝါကျတွင် If + Present Simple နောက်၌ "will + Verb (V1)" ကို အသုံးပြုရပါသည်။',
  },
  // C1 Unit 1 Quiz
  {
    id: 'qz-c1-1-1',
    lesson_id: 'les-c1-1',
    question_type: 'reorder',
    question_text: 'Reorder the words to form a C1 Negative Inversion clause:',
    options_json: JSON.stringify(['witnessed', 'we', 'Seldom', 'have', 'such', 'change']),
    correct_answer: 'Seldom have we witnessed such change',
    explanation_mm:
      'Negative Inversion တွင် "Seldom" ကဲ့သို့ Negative Adverb ကို ရှေ့ဆုံးပို့ပြီးနောက် Auxiliary Verb + Subject + V3 ("Seldom have we witnessed...") အစီအစဉ်အတိုင်း ရေးသားရပါသည်။',
  },
];

// ============================================================================
// USER LESSON PROGRESS SEED DATA (user_progress model)
// Fields: id, user_id, lesson_id, status ('not_started' | 'completed'), score, completed_at
// ============================================================================
const SEED_USER_PROGRESS = [
  {
    id: 'up-seed-1',
    user_id: 'usr-student-1',
    lesson_id: 'les-a1-1',
    status: 'completed',
    score: 100,
    completed_at: new Date(Date.now() - 86400 * 1000).toISOString(),
  },
  {
    id: 'up-seed-2',
    user_id: 'usr-student-1',
    lesson_id: 'les-a1-2',
    status: 'not_started',
    score: 0,
    completed_at: null,
  },
];

// ============================================================================
// SRS FLASHCARD REVIEWS SEED DATA (flashcard_reviews model)
// Fields: id, user_id, vocab_id, ease_factor (default 2.5), interval_days (default 1),
//         next_review_at, is_bookmarked
// ============================================================================
const SEED_FLASHCARD_REVIEWS = [
  {
    id: 'rev-seed-1',
    user_id: 'usr-student-1',
    vocab_id: 'voc-a1-1-1',
    ease_factor: 2.5,
    interval_days: 1,
    next_review_at: new Date(Date.now() - 3600 * 1000).toISOString(),
    is_bookmarked: false,
  },
  {
    id: 'rev-seed-2',
    user_id: 'usr-student-1',
    vocab_id: 'voc-a1-1-2',
    ease_factor: 2.5,
    interval_days: 1,
    next_review_at: new Date(Date.now() - 1800 * 1000).toISOString(),
    is_bookmarked: true,
  },
  {
    id: 'rev-seed-3',
    user_id: 'usr-student-1',
    vocab_id: 'voc-a1-2-3',
    ease_factor: 2.3,
    interval_days: 1,
    next_review_at: new Date(Date.now() - 900 * 1000).toISOString(),
    is_bookmarked: true,
  },
];

// ============================================================================
// STATE MANAGEMENT
// ============================================================================
const state = {
  isDark: localStorage.getItem('em_theme') ? localStorage.getItem('em_theme') === 'dark' : true,
  user: JSON.parse(localStorage.getItem('em_user') || 'null') || SEED_USERS[0],
  lessons: JSON.parse(localStorage.getItem('em_lessons') || 'null') || SEED_LESSONS,
  vocabularies: JSON.parse(localStorage.getItem('em_vocabularies') || 'null') || SEED_VOCABULARY,
  lessonVideos: JSON.parse(localStorage.getItem('em_lesson_videos') || 'null') || SEED_LESSON_VIDEOS,
  userVideoProgress:
    JSON.parse(localStorage.getItem('em_user_video_progress') || 'null') || SEED_VIDEO_PROGRESS,
  quizzes: JSON.parse(localStorage.getItem('em_quizzes') || 'null') || SEED_QUIZZES,
  userProgress:
    JSON.parse(localStorage.getItem('em_user_progress') || 'null') || SEED_USER_PROGRESS,
  flashcardReviews:
    JSON.parse(localStorage.getItem('em_flashcard_reviews') || 'null') || SEED_FLASHCARD_REVIEWS,
  activeTab: 'home',    // 'home' | 'lessons' | 'flashcards' | 'profile'
  selectedLevel: 'A1',  // 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  activeLessonId: null, // null or lesson.id
  activeVideoId: null,  // currently selected video inside Lesson Detail
  playbackSpeed: 1.0,   // 0.75 | 1.0 | 1.25 | 1.5
  subtitleMode: 'both', // 'off' | 'en' | 'mm' | 'both'
  captionPlacement: 'both_areas', // 'overlay' | 'below' | 'both_areas'
  currentPlaybackTime: 0,
  isPlayingSimulated: false,
  showAddVideoForm: false,
  xpToastMessage: null,
  accent: 'en-US',      // 'en-US' | 'en-GB'
  completedLessonIds: ['les-a1-1'],
  speakingId: null,
  authMode: 'login',    // 'login' | 'register'
  authError: '',
  // Interactive Quiz Runner State
  quizIndex: 0,
  quizUserAnswer: '',
  quizReorderTokens: [],
  quizFeedback: null,   // null | { isCorrect: boolean, correctAns: string, explanationMm: string }
  quizAnswersLog: {},   // { [quizId]: boolean }
  quizFinished: false,
  // SRS Flashcard Deck State
  flashcardDeckMode: 'all', // 'all' | 'due' | 'bookmarked'
  flashcardLevel: 'ALL',
  flashcardIndex: 0,
  flashcardFlipped: false,
  srsToastMessage: null,
  // Protected Admin Dashboard State (/studio-manage-9x2k)
  adminSubTab: 'lessons', // 'lessons' | 'videos' | 'vocab_quiz'
  adminSelectedLevel: 'A1',
  adminSelectedLessonId: 'les-a1-1',
  editingLessonId: null,
  editingVideoId: null,
  editingVocabId: null,
  editingQuizId: null,
  adminDraftGrammarMm: '',
  adminDraftIsPublished: true,
  adminDraftVideoTitle: '',
  adminDraftVideoProvider: 'mp4_url',
  adminDraftVideoUrl: '',
  adminDraftDurationSec: 15,
  adminDraftVideoOrder: 1,
  adminDraftEnVtt: '',
  adminDraftMmVtt: '',
  adminPreviewTimeSec: 0,
  adminPreviewSubMode: 'both',
  adminQuizType: 'mcq',
  adminToastMessage: null,
  adminToastType: 'success', // 'success' | 'error'
  adminConfirmDialog: null,  // null | { type: 'lesson'|'video'|'vocab'|'quiz', id: string, title: string }
  serverConnected: false,
  lastServerSyncAt: null,
};

let videoSaveInterval = null;
let ytTimerInterval = null;
let touchStartX = 0;
let touchEndX = 0;

async function syncStateToBackendServer() {
  try {
    if (isStrictAuthorizedAdmin(state.user) && isAdminPinUnlockedForSession()) {
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': state.user.email,
          'x-admin-role': state.user.role,
          'x-admin-pin': ADMIN_PIN_ENV,
        },
        body: JSON.stringify({
          lessons: state.lessons,
          lessonVideos: state.lessonVideos,
          vocabularies: state.vocabularies,
          quizzes: state.quizzes,
          userProgress: state.userProgress,
          userVideoProgress: state.userVideoProgress,
          flashcardReviews: state.flashcardReviews,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        state.serverConnected = true;
        state.lastServerSyncAt = data.updatedAt || new Date().toISOString();
      }
    } else if (state.user) {
      const res = await fetch('/api/student/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: state.user,
          userProgress: state.userProgress,
          userVideoProgress: state.userVideoProgress,
          flashcardReviews: state.flashcardReviews,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        state.serverConnected = true;
        state.lastServerSyncAt = data.updatedAt || new Date().toISOString();
      }
    }
  } catch {
    // Fallback to localStorage when offline or running via file://
  }
}

async function bootstrapFromFullStackServer() {
  try {
    const res = await fetch('/api/db', { cache: 'no-store' });
    if (!res.ok) return;
    const payload = await res.json();
    if (payload.initialized && payload.db) {
      const db = payload.db;
      if (Array.isArray(db.lessons) && db.lessons.length > 0) state.lessons = db.lessons;
      if (Array.isArray(db.lessonVideos)) state.lessonVideos = db.lessonVideos;
      if (Array.isArray(db.vocabularies)) state.vocabularies = db.vocabularies;
      if (Array.isArray(db.quizzes)) state.quizzes = db.quizzes;
      if (Array.isArray(db.userProgress)) state.userProgress = db.userProgress;
      if (Array.isArray(db.userVideoProgress)) state.userVideoProgress = db.userVideoProgress;
      if (Array.isArray(db.flashcardReviews)) state.flashcardReviews = db.flashcardReviews;
      state.serverConnected = true;
      state.lastServerSyncAt = db.updatedAt || new Date().toISOString();
      render();
    } else {
      // Seed server database on first boot
      const seedRes = await fetch('/api/seed-if-empty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: SEED_USERS,
          lessons: state.lessons,
          lessonVideos: state.lessonVideos,
          vocabularies: state.vocabularies,
          quizzes: state.quizzes,
          userProgress: state.userProgress,
          userVideoProgress: state.userVideoProgress,
          flashcardReviews: state.flashcardReviews,
        }),
      });
      if (seedRes.ok) {
        const seeded = await seedRes.json();
        state.serverConnected = true;
        state.lastServerSyncAt = (seeded.db && seeded.db.updatedAt) || new Date().toISOString();
        render();
      }
    }
  } catch {
    // Offline or opened via file://
  }
}

function saveState() {
  localStorage.setItem('em_theme', state.isDark ? 'dark' : 'light');
  if (state.user) {
    localStorage.setItem('em_user', JSON.stringify(state.user));
  } else {
    localStorage.removeItem('em_user');
  }
  localStorage.setItem('em_lessons', JSON.stringify(state.lessons));
  localStorage.setItem('em_vocabularies', JSON.stringify(state.vocabularies));
  localStorage.setItem('em_lesson_videos', JSON.stringify(state.lessonVideos));
  localStorage.setItem('em_user_video_progress', JSON.stringify(state.userVideoProgress));
  localStorage.setItem('em_quizzes', JSON.stringify(state.quizzes));
  localStorage.setItem('em_user_progress', JSON.stringify(state.userProgress));
  localStorage.setItem('em_flashcard_reviews', JSON.stringify(state.flashcardReviews));
  syncStateToBackendServer();
}

function applyTheme() {
  const root = document.documentElement;
  if (state.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

function showXpToast(msg) {
  state.xpToastMessage = msg;
  const toastEl = document.getElementById('xp-toast-banner');
  if (toastEl) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
  }
  setTimeout(() => {
    state.xpToastMessage = null;
    const el = document.getElementById('xp-toast-banner');
    if (el) el.classList.add('hidden');
  }, 4500);
}

// ============================================================================
// WEBVTT (.vtt) PARSER & DUAL SUBTITLE ENGINE
// ============================================================================
function parseTimeVtt(timeStr) {
  if (!timeStr) return 0;
  const clean = timeStr.trim().replace(',', '.');
  const parts = clean.split(':');
  if (parts.length === 3) {
    return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
  } else if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(clean) || 0;
}

function parseVttCues(vttInput) {
  if (!vttInput || typeof vttInput !== 'string') return [];
  const lines = vttInput
    .replace(/\r\n/g, '\n')
    .replace(/^WEBVTT[^\n]*\n+/i, '')
    .trim()
    .split('\n');

  const cues = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }
    // Check if this line or next line has "-->"
    let timingLine = line;
    if (!timingLine.includes('-->') && i + 1 < lines.length && lines[i + 1].includes('-->')) {
      i++;
      timingLine = lines[i].trim();
    }
    if (timingLine.includes('-->')) {
      const [startStr, endStr] = timingLine.split('-->');
      const start = parseTimeVtt(startStr);
      const end = parseTimeVtt(endStr.split(' ')[0]);
      i++;
      const textLines = [];
      while (i < lines.length && lines[i].trim() !== '') {
        textLines.push(lines[i].trim());
        i++;
      }
      cues.push({
        start,
        end,
        text: textLines.join(' '),
      });
    } else {
      i++;
    }
  }
  return cues;
}

function formatDuration(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function extractYouTubeId(url) {
  if (!url) return 'M7lc1UVf-VE';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : url;
}

// ============================================================================
// USER VIDEO PROGRESS & 5-SECOND AUTO-SAVE ENGINE
// ============================================================================
function getUserProgressForVideo(videoId) {
  if (!state.user || !videoId) return null;
  let rec = state.userVideoProgress.find(
    (p) => p.user_id === state.user.id && p.video_id === videoId
  );
  if (!rec) {
    rec = {
      id: 'prog-' + state.user.id + '-' + videoId,
      user_id: state.user.id,
      video_id: videoId,
      watched_seconds: 0,
      is_completed: false,
      updated_at: new Date().toISOString(),
    };
    state.userVideoProgress.push(rec);
    saveState();
  }
  return rec;
}

function saveVideoProgress(videoId, currentSeconds, forceSave = false) {
  if (!state.user || !videoId) return;
  const video = state.lessonVideos.find((v) => v.id === videoId);
  if (!video) return;

  const rec = getUserProgressForVideo(videoId);
  const roundedSec = Math.min(video.duration_sec, Math.max(0, Math.floor(currentSeconds)));
  rec.watched_seconds = roundedSec;
  rec.updated_at = new Date().toISOString();

  // Check 90% completion rule -> mark is_completed = true & award +20 XP
  const threshold = Math.max(1, video.duration_sec * 0.9);
  let newlyCompleted = false;
  if (currentSeconds >= threshold && !rec.is_completed) {
    rec.is_completed = true;
    newlyCompleted = true;
    state.user.xp_points += 20;
    state.user.streak_count = Math.max(1, state.user.streak_count);
    state.user.last_active_date = new Date().toISOString().split('T')[0];
  }

  saveState();

  // Live DOM updates so we don't interrupt playing video
  updateVideoProgressDOM(video, rec, forceSave);

  if (newlyCompleted) {
    showXpToast(`🎉 Video 90% Watched! Marked Completed & Earned +20 XP!`);
    // Update top header XP pill without re-mounting video player
    const headerXp = document.getElementById('header-xp-badge');
    if (headerXp) headerXp.textContent = `🏆 ${state.user.xp_points} XP`;
  }
}

function updateVideoProgressDOM(video, rec, showSavedBadge = false) {
  const pct = Math.min(100, Math.round((rec.watched_seconds / Math.max(1, video.duration_sec)) * 100));
  const barEl = document.getElementById('video-progress-bar-fill');
  if (barEl) barEl.style.width = `${pct}%`;

  const timeLabel = document.getElementById('video-watched-label');
  if (timeLabel) {
    timeLabel.textContent = `Watched: ${formatDuration(rec.watched_seconds)} / ${formatDuration(video.duration_sec)} (${pct}%)`;
  }

  const statusBadge = document.getElementById('video-completion-badge');
  if (statusBadge) {
    if (rec.is_completed) {
      statusBadge.className =
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
      statusBadge.innerHTML = '✅ Completed (+20 XP Earned)';
    } else {
      statusBadge.className =
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
      statusBadge.innerHTML = `⏳ Reach 90% (${formatDuration(Math.ceil(video.duration_sec * 0.9))}) for +20 XP`;
    }
  }

  if (showSavedBadge) {
    const saveIndicator = document.getElementById('autosave-indicator');
    if (saveIndicator) {
      saveIndicator.textContent = `✓ Auto-saved at ${formatDuration(rec.watched_seconds)} (${new Date(rec.updated_at).toLocaleTimeString()})`;
    }
  }
}

function updateLiveSubtitlesDOM(video, currentTimeSec) {
  state.currentPlaybackTime = currentTimeSec;
  const enCues = parseVttCues(video.subtitle_en_vtt);
  const mmCues = parseVttCues(video.subtitle_mm_vtt);

  const activeEn = enCues.find((c) => currentTimeSec >= c.start && currentTimeSec <= c.end) || enCues[0];
  const activeMm = mmCues.find((c) => currentTimeSec >= c.start && currentTimeSec <= c.end) || mmCues[0];

  const showEn = state.subtitleMode === 'en' || state.subtitleMode === 'both';
  const showMm = state.subtitleMode === 'mm' || state.subtitleMode === 'both';

  const overlayBox = document.getElementById('video-subtitle-overlay');
  const belowBox = document.getElementById('video-subtitle-below');

  const overlayHtml =
    state.subtitleMode === 'off'
      ? ''
      : `
      <div class="inline-block max-w-2xl px-4 py-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/15 text-center shadow-lg space-y-0.5">
        ${showEn && activeEn ? `<div class="text-xs sm:text-sm font-bold text-white leading-snug">${activeEn.text}</div>` : ''}
        ${showMm && activeMm ? `<div class="text-xs sm:text-sm font-mm font-bold text-amber-300 leading-relaxed">${activeMm.text}</div>` : ''}
      </div>
    `;

  if (overlayBox) {
    overlayBox.innerHTML = overlayHtml;
    overlayBox.style.display = state.subtitleMode === 'off' ? 'none' : 'flex';
  }

  if (belowBox) {
    if (state.subtitleMode === 'off') {
      belowBox.innerHTML = `<div class="text-xs text-slate-400 italic text-center py-2">Subtitles are turned Off. Select English, Myanmar, or Both above.</div>`;
    } else {
      belowBox.innerHTML = `
        <div class="space-y-1.5">
          ${
            showEn
              ? `<div class="flex items-start gap-2">
                  <span class="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">EN</span>
                  <p class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">${activeEn ? activeEn.text : '...'}</p>
                </div>`
              : ''
          }
          ${
            showMm
              ? `<div class="flex items-start gap-2">
                  <span class="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">MM</span>
                  <p class="text-sm sm:text-base font-mm font-bold text-emerald-600 dark:text-emerald-400">${activeMm ? activeMm.text : '...'}</p>
                </div>`
              : ''
          }
        </div>
      `;
    }
  }

  // Highlight active cue row in interactive transcript list
  document.querySelectorAll('[data-cue-index]').forEach((el) => {
    const start = parseFloat(el.getAttribute('data-cue-start') || '0');
    const end = parseFloat(el.getAttribute('data-cue-end') || '0');
    if (currentTimeSec >= start && currentTimeSec <= end) {
      el.classList.add('border-indigo-500', 'bg-indigo-500/10');
    } else {
      el.classList.remove('border-indigo-500', 'bg-indigo-500/10');
    }
  });
}

function clearVideoIntervals() {
  if (videoSaveInterval) {
    clearInterval(videoSaveInterval);
    videoSaveInterval = null;
  }
  if (ytTimerInterval) {
    clearInterval(ytTimerInterval);
    ytTimerInterval = null;
  }
}

function attachVideoPlayerLifecycle() {
  clearVideoIntervals();
  if (!state.activeLessonId) return;

  const lessonVideos = state.lessonVideos
    .filter((v) => v.lesson_id === state.activeLessonId)
    .sort((a, b) => a.order_index - b.order_index);

  if (lessonVideos.length === 0) return;

  const activeVideo =
    lessonVideos.find((v) => v.id === state.activeVideoId) || lessonVideos[0];
  state.activeVideoId = activeVideo.id;

  const progressRec = getUserProgressForVideo(activeVideo.id);
  state.currentPlaybackTime = progressRec ? progressRec.watched_seconds : 0;

  updateLiveSubtitlesDOM(activeVideo, state.currentPlaybackTime);
  updateVideoProgressDOM(activeVideo, progressRec, false);

  const html5Video = document.getElementById('em-html5-video');
  if (html5Video) {
    html5Video.playbackRate = state.playbackSpeed;

    html5Video.addEventListener('loadedmetadata', () => {
      if (html5Video.duration && !isNaN(html5Video.duration)) {
        activeVideo.duration_sec = Math.round(html5Video.duration);
      }
      if (progressRec && progressRec.watched_seconds > 0 && progressRec.watched_seconds < activeVideo.duration_sec - 1) {
        html5Video.currentTime = progressRec.watched_seconds;
      }
      html5Video.playbackRate = state.playbackSpeed;
    });

    html5Video.addEventListener('timeupdate', () => {
      const cur = html5Video.currentTime || 0;
      updateLiveSubtitlesDOM(activeVideo, cur);
      // Real-time check for 90% completion
      const threshold = Math.max(1, activeVideo.duration_sec * 0.9);
      if (cur >= threshold && !progressRec.is_completed) {
        saveVideoProgress(activeVideo.id, cur, true);
      } else {
        updateVideoProgressDOM(
          activeVideo,
          { ...progressRec, watched_seconds: Math.floor(cur) },
          false
        );
      }
    });

    html5Video.addEventListener('pause', () => {
      saveVideoProgress(activeVideo.id, html5Video.currentTime || 0, true);
    });

    html5Video.addEventListener('ended', () => {
      saveVideoProgress(activeVideo.id, activeVideo.duration_sec, true);
    });

    // Auto-save watched_seconds every 5 seconds while playing
    videoSaveInterval = setInterval(() => {
      const vidEl = document.getElementById('em-html5-video');
      if (vidEl && !vidEl.paused) {
        saveVideoProgress(activeVideo.id, vidEl.currentTime || 0, true);
      }
    }, 5000);
  } else if (activeVideo.video_provider === 'youtube_unlisted') {
    // For YouTube Unlisted embeds, provide synchronized timer & 5-second auto-save
    if (state.isPlayingSimulated) {
      ytTimerInterval = setInterval(() => {
        state.currentPlaybackTime = Math.min(
          activeVideo.duration_sec,
          state.currentPlaybackTime + 0.5 * state.playbackSpeed
        );
        updateLiveSubtitlesDOM(activeVideo, state.currentPlaybackTime);
        updateVideoProgressDOM(
          activeVideo,
          { ...progressRec, watched_seconds: Math.floor(state.currentPlaybackTime) },
          false
        );
        if (state.currentPlaybackTime >= activeVideo.duration_sec * 0.9 && !progressRec.is_completed) {
          saveVideoProgress(activeVideo.id, state.currentPlaybackTime, true);
        }
        if (state.currentPlaybackTime >= activeVideo.duration_sec) {
          state.isPlayingSimulated = false;
          saveVideoProgress(activeVideo.id, activeVideo.duration_sec, true);
          clearInterval(ytTimerInterval);
        }
      }, 500);

      videoSaveInterval = setInterval(() => {
        if (state.isPlayingSimulated) {
          saveVideoProgress(activeVideo.id, state.currentPlaybackTime, true);
        }
      }, 5000);
    }
  }
}

// ============================================================================
// VIDEO PLAYER CONTROLS & HANDLERS
// ============================================================================
window.selectLessonVideo = function (videoId) {
  state.activeVideoId = videoId;
  state.isPlayingSimulated = false;
  render();
};

window.setPlaybackSpeed = function (speed) {
  state.playbackSpeed = speed;
  const html5Video = document.getElementById('em-html5-video');
  if (html5Video) {
    html5Video.playbackRate = speed;
  }
  // Update speed button styles
  document.querySelectorAll('[data-speed-btn]').forEach((btn) => {
    const s = parseFloat(btn.getAttribute('data-speed-btn'));
    if (s === speed) {
      btn.className = 'px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-600 text-white shadow-sm transition';
    } else {
      btn.className = 'px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition';
    }
  });
};

window.setSubtitleMode = function (mode) {
  state.subtitleMode = mode;
  const activeVideo = state.lessonVideos.find((v) => v.id === state.activeVideoId);
  if (activeVideo) {
    updateLiveSubtitlesDOM(activeVideo, state.currentPlaybackTime);
  }
  document.querySelectorAll('[data-sub-btn]').forEach((btn) => {
    const m = btn.getAttribute('data-sub-btn');
    if (m === mode) {
      btn.className = 'px-3 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 text-white shadow-sm transition';
    } else {
      btn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition';
    }
  });
};

window.seekVideoTo = function (seconds) {
  const activeVideo = state.lessonVideos.find((v) => v.id === state.activeVideoId);
  if (!activeVideo) return;
  const target = Math.min(activeVideo.duration_sec, Math.max(0, seconds));
  state.currentPlaybackTime = target;

  const html5Video = document.getElementById('em-html5-video');
  if (html5Video) {
    html5Video.currentTime = target;
    html5Video.play().catch(() => {});
  }
  saveVideoProgress(activeVideo.id, target, true);
  updateLiveSubtitlesDOM(activeVideo, target);
};

window.toggleYouTubeTimerSync = function () {
  state.isPlayingSimulated = !state.isPlayingSimulated;
  render();
};

// ============================================================================
// WEB SPEECH API PRONUNCIATION (en-US / en-GB)
// ============================================================================
window.speakText = function (text, id = null) {
  if (!('speechSynthesis' in window)) {
    alert('Web Speech API is not supported in this browser.');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.accent;
  utterance.rate = 0.92;

  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find(
      (v) =>
        v.lang.replace('_', '-') === state.accent &&
        (v.name.includes('Google') || v.name.includes('Natural'))
    ) ||
    voices.find((v) => v.lang.replace('_', '-') === state.accent) ||
    voices.find((v) => v.lang.startsWith('en'));

  if (preferred) utterance.voice = preferred;

  state.speakingId = id;
  render();

  utterance.onend = () => {
    state.speakingId = null;
    render();
  };
  utterance.onerror = () => {
    state.speakingId = null;
    render();
  };

  window.speechSynthesis.speak(utterance);
};

// ============================================================================
// GLOBAL ACTIONS
// ============================================================================
window.toggleTheme = function () {
  state.isDark = !state.isDark;
  applyTheme();
  saveState();
  render();
};

window.setAccent = function (accent) {
  state.accent = accent;
  render();
};

window.setTab = function (tab) {
  clearVideoIntervals();
  state.activeTab = tab;
  if (tab !== 'lessons') state.activeLessonId = null;
  render();
};

window.selectLevel = function (level) {
  clearVideoIntervals();
  state.selectedLevel = level;
  state.activeLessonId = null;
  render();
};

window.openLesson = function (lessonId, level = null) {
  clearVideoIntervals();
  if (level) state.selectedLevel = level;
  state.activeLessonId = lessonId;
  state.activeVideoId = null;
  state.isPlayingSimulated = false;
  // Reset Interactive Quiz Runner state for newly opened lesson
  state.quizIndex = 0;
  state.quizUserAnswer = '';
  state.quizReorderTokens = [];
  state.quizFeedback = null;
  state.quizAnswersLog = {};
  state.quizFinished = false;
  state.activeTab = 'lessons';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
};

function getLessonUserProgress(lessonId) {
  if (!state.user || !lessonId) return null;
  let rec = state.userProgress.find(
    (p) => p.user_id === state.user.id && p.lesson_id === lessonId
  );
  if (!rec) {
    rec = {
      id: 'up-' + state.user.id + '-' + lessonId,
      user_id: state.user.id,
      lesson_id: lessonId,
      status: state.completedLessonIds.includes(lessonId) ? 'completed' : 'not_started',
      score: state.completedLessonIds.includes(lessonId) ? 100 : 0,
      completed_at: state.completedLessonIds.includes(lessonId)
        ? new Date().toISOString()
        : null,
    };
    state.userProgress.push(rec);
    saveState();
  }
  return rec;
}

window.completeLesson = function (lessonId) {
  if (!state.completedLessonIds.includes(lessonId)) {
    state.completedLessonIds.push(lessonId);
  }
  const prog = getLessonUserProgress(lessonId);
  if (prog && prog.status !== 'completed') {
    prog.status = 'completed';
    prog.score = Math.max(prog.score, 100);
    prog.completed_at = new Date().toISOString();
  }
  if (state.user) {
    state.user.xp_points += 25;
    state.user.streak_count = Math.max(1, state.user.streak_count);
    state.user.last_active_date = new Date().toISOString().split('T')[0];
    saveState();
  }
  render();
};

// ============================================================================
// INTERACTIVE QUIZ RUNNER ACTIONS (mcq, fill_blank, reorder + +30 XP on pass)
// ============================================================================
window.selectQuizOption = function (val) {
  if (state.quizFeedback) return;
  state.quizUserAnswer = val;
  render();
};

window.handleFillBlankInput = function (val) {
  if (state.quizFeedback) return;
  state.quizUserAnswer = val;
};

window.toggleReorderToken = function (token) {
  if (state.quizFeedback) return;
  const idx = state.quizReorderTokens.indexOf(token);
  if (idx >= 0) {
    state.quizReorderTokens.splice(idx, 1);
  } else {
    state.quizReorderTokens.push(token);
  }
  state.quizUserAnswer = state.quizReorderTokens.join(' ');
  render();
};

window.clearReorderTokens = function () {
  if (state.quizFeedback) return;
  state.quizReorderTokens = [];
  state.quizUserAnswer = '';
  render();
};

window.submitQuizQuestion = function (quizId) {
  if (state.quizFeedback) return;
  const quiz = state.quizzes.find((q) => q.id === quizId);
  if (!quiz) return;

  const inputEl = document.getElementById('quiz-fill-blank-input');
  if (inputEl && quiz.question_type === 'fill_blank') {
    state.quizUserAnswer = inputEl.value.trim();
  }

  const given = (state.quizUserAnswer || '').trim();
  if (!given) return;

  const isCorrect =
    given.toLowerCase().replace(/\s+/g, ' ') ===
    quiz.correct_answer.trim().toLowerCase().replace(/\s+/g, ' ');

  state.quizAnswersLog[quiz.id] = isCorrect;
  state.quizFeedback = {
    isCorrect,
    givenAnswer: given,
    correctAnswer: quiz.correct_answer,
    explanationMm: quiz.explanation_mm,
  };
  render();
};

window.nextQuizQuestion = function (lessonId) {
  const lessonQuizzes = state.quizzes.filter((q) => q.lesson_id === lessonId);
  if (state.quizIndex + 1 < lessonQuizzes.length) {
    state.quizIndex += 1;
    state.quizUserAnswer = '';
    state.quizReorderTokens = [];
    state.quizFeedback = null;
    render();
  } else {
    // Finish Quiz & Calculate Score + Update user_progress + Award +30 XP on Pass (>= 60%)
    state.quizFinished = true;
    const total = Math.max(1, lessonQuizzes.length);
    const correctCount = lessonQuizzes.filter((q) => state.quizAnswersLog[q.id]).length;
    const scorePct = Math.round((correctCount / total) * 100);
    const passed = scorePct >= 60;

    const prog = getLessonUserProgress(lessonId);
    if (prog) {
      prog.score = Math.max(prog.score || 0, scorePct);
      if (passed) {
        const wasAlreadyCompleted = prog.status === 'completed' && prog.rewarded_quiz_xp;
        prog.status = 'completed';
        prog.completed_at = new Date().toISOString();
        if (!state.completedLessonIds.includes(lessonId)) {
          state.completedLessonIds.push(lessonId);
        }
        if (state.user && !wasAlreadyCompleted) {
          prog.rewarded_quiz_xp = true;
          state.user.xp_points += 30;
          state.user.streak_count = Math.max(1, state.user.streak_count);
          state.user.last_active_date = new Date().toISOString().split('T')[0];
          showXpToast(`🎉 Quiz Passed (${scorePct}%)! Earned +30 XP & Lesson Completed!`);
        }
      }
    }
    saveState();
    render();
  }
};

window.restartLessonQuiz = function () {
  state.quizIndex = 0;
  state.quizUserAnswer = '';
  state.quizReorderTokens = [];
  state.quizFeedback = null;
  state.quizAnswersLog = {};
  state.quizFinished = false;
  render();
};

window.loginDemo = function (index) {
  state.user = {
    ...SEED_USERS[index],
    last_active_date: new Date().toISOString().split('T')[0],
  };
  saveState();
  render();
};

window.loginGoogle = function () {
  state.user = {
    id: 'usr-google-1',
    name: 'May Thu (မေသူ)',
    email: 'maythu.google@gmail.com',
    role: 'student',
    current_level: 'A1',
    xp_points: 60,
    streak_count: 3,
    last_active_date: new Date().toISOString().split('T')[0],
    auth_provider: 'google',
  };
  saveState();
  render();
};

window.handleAuthSubmit = function (e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value.trim();
  const password = form.password.value.trim();
  const today = new Date().toISOString().split('T')[0];

  if (!email || !password) {
    state.authError = 'ကျေးဇူးပြု၍ အီးမေးလ်နှင့် စကားဝှက် ထည့်သွင်းပါ။';
    render();
    return;
  }

  const normalizedEmail = email.toLowerCase();

  if (state.authMode === 'login') {
    if (normalizedEmail === AUTHORIZED_ADMIN_EMAIL) {
      // Only the single authorized admin email is granted role: 'admin'
      state.user = {
        ...SEED_USERS[1],
        email: AUTHORIZED_ADMIN_EMAIL,
        role: 'admin',
        last_active_date: today,
      };
    } else {
      const found = SEED_USERS.find(
        (u) => u.email.toLowerCase() === normalizedEmail && u.role === 'student'
      );
      state.user = found
        ? { ...found, role: 'student', last_active_date: today }
        : {
            id: 'usr-' + Date.now(),
            name: email.split('@')[0],
            email,
            role: 'student',
            current_level: 'A1',
            xp_points: 0,
            streak_count: 0,
            last_active_date: today,
            auth_provider: 'email',
          };
    }
  } else {
    // Strict Single-Admin Rule: ALL new signups default strictly to role: "student"
    const name = form.name.value.trim() || email.split('@')[0];
    const level = form.level ? form.level.value || 'A1' : 'A1';
    state.user = {
      id: 'usr-' + Date.now(),
      name,
      email,
      role: 'student',
      current_level: level,
      xp_points: 0,
      streak_count: 0,
      last_active_date: today,
      auth_provider: 'email',
    };
  }
  state.authError = '';
  saveState();
  render();
};

window.logoutUser = function () {
  clearVideoIntervals();
  sessionStorage.removeItem('em_admin_pin_unlocked');
  state.user = null;
  if (state.activeTab === 'admin') {
    silentRedirectToRoot();
  }
  saveState();
  render();
};

window.updateUserField = function (field, value) {
  if (!state.user) return;
  // Block any attempt to self-assign or mutate role via student profile
  if (field === 'role' || field === 'email') return;
  state.user[field] = value;
  state.user.last_active_date = new Date().toISOString().split('T')[0];
  saveState();
  render();
};

// ============================================================================
// SPACED REPETITION (SRS) FLASHCARD ENGINE (flashcard_reviews model)
// Fields: id, user_id, vocab_id, ease_factor (default 2.5), interval_days (default 1),
//         next_review_at, is_bookmarked
// ============================================================================
function getFlashcardReviewRecord(vocabId) {
  if (!state.user || !vocabId) return null;
  let rec = state.flashcardReviews.find(
    (r) => r.user_id === state.user.id && r.vocab_id === vocabId
  );
  if (!rec) {
    rec = {
      id: 'rev-' + state.user.id + '-' + vocabId,
      user_id: state.user.id,
      vocab_id: vocabId,
      ease_factor: 2.5,
      interval_days: 1,
      next_review_at: new Date().toISOString(),
      is_bookmarked: false,
    };
    state.flashcardReviews.push(rec);
    saveState();
  }
  return rec;
}

window.setFlashcardDeckMode = function (mode) {
  state.flashcardDeckMode = mode;
  state.flashcardIndex = 0;
  state.flashcardFlipped = false;
  render();
};

window.setFlashcardLevel = function (lvl) {
  state.flashcardLevel = lvl;
  state.flashcardIndex = 0;
  state.flashcardFlipped = false;
  render();
};

window.flipFlashcard = function () {
  state.flashcardFlipped = !state.flashcardFlipped;
  render();
};

window.nextFlashcard = function (total) {
  if (!total || total <= 0) return;
  state.flashcardFlipped = false;
  state.flashcardIndex = (state.flashcardIndex + 1) % total;
  render();
};

window.prevFlashcard = function (total) {
  if (!total || total <= 0) return;
  state.flashcardFlipped = false;
  state.flashcardIndex = (state.flashcardIndex - 1 + total) % total;
  render();
};

window.toggleBookmarkVocab = function (vocabId) {
  const rec = getFlashcardReviewRecord(vocabId);
  if (!rec) return;
  rec.is_bookmarked = !rec.is_bookmarked;
  saveState();
  render();
};

window.rateFlashcardSRS = function (vocabId, rating, totalCards) {
  const rec = getFlashcardReviewRecord(vocabId);
  if (!rec) return;

  const now = Date.now();
  let nextEase = Number(rec.ease_factor || 2.5);
  let nextInterval = Number(rec.interval_days || 1);
  let nextReviewDate = new Date();
  let label = '';

  if (rating === 'again') {
    nextEase = Math.max(1.3, Number((nextEase - 0.2).toFixed(2)));
    nextInterval = 1;
    // Schedule 10 minutes from now for quick re-study while setting interval_days = 1
    nextReviewDate = new Date(now + 10 * 60 * 1000);
    label = 'Again • Reset to 1d (10m review)';
  } else if (rating === 'good') {
    nextInterval = nextInterval <= 1 ? 3 : Math.max(2, Math.round(nextInterval * nextEase));
    nextReviewDate = new Date(now + nextInterval * 86400 * 1000);
    label = `Good • Next review in ${nextInterval} days`;
  } else if (rating === 'easy') {
    nextEase = Number((nextEase + 0.15).toFixed(2));
    nextInterval = nextInterval <= 1 ? 4 : Math.max(4, Math.round(nextInterval * nextEase * 1.3));
    nextReviewDate = new Date(now + nextInterval * 86400 * 1000);
    label = `Easy • Next review in ${nextInterval} days`;
  }

  rec.ease_factor = nextEase;
  rec.interval_days = nextInterval;
  rec.next_review_at = nextReviewDate.toISOString();

  if (state.user) {
    const xpGain = rating === 'easy' ? 10 : rating === 'good' ? 5 : 2;
    state.user.xp_points += xpGain;
    state.user.last_active_date = new Date().toISOString().split('T')[0];
    state.srsToastMessage = `✓ SRS Updated (${label}) • +${xpGain} XP`;
  }

  saveState();
  state.flashcardFlipped = false;
  if (totalCards > 0) {
    state.flashcardIndex = (state.flashcardIndex + 1) % totalCards;
  }
  render();
};

window.handleCardTouchStart = function (e) {
  if (e.changedTouches && e.changedTouches.length > 0) {
    touchStartX = e.changedTouches[0].screenX;
  }
};

window.handleCardTouchEnd = function (e, total) {
  if (e.changedTouches && e.changedTouches.length > 0) {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 55) {
      if (diff < 0) {
        window.nextFlashcard(total);
      } else {
        window.prevFlashcard(total);
      }
    }
  }
};

// ============================================================================
// PROTECTED ADMIN DASHBOARD (/studio-manage-9x2k) ACTIONS & CONTROLLERS
// Accessible ONLY when isStrictAuthorizedAdmin(state.user) && isAdminPinUnlockedForSession()
// ============================================================================
function showAdminToast(msg, type = 'success') {
  state.adminToastMessage = msg;
  state.adminToastType = type;
  render();
  setTimeout(() => {
    state.adminToastMessage = null;
    const el = document.getElementById('admin-toast-banner');
    if (el) el.classList.add('hidden');
  }, 4200);
}

function formatMarkdownPreview(rawText) {
  if (!rawText) {
    return '<span class="text-slate-400 italic">Type Myanmar grammar notes on the left to see a live Markdown & formatted preview here...</span>';
  }
  const escaped = String(rawText)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '<div class="h-2"></div>';
      if (trimmed.startsWith('【') || trimmed.startsWith('#')) {
        return `<div class="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm sm:text-base mt-1">${trimmed.replace(/^#+\s*/, '')}</div>`;
      }
      if (trimmed.startsWith('•') || trimmed.startsWith('- ')) {
        const formattedLine = trimmed
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-mono text-xs">$1</code>');
        return `<div class="pl-3 border-l-2 border-indigo-500/40 py-0.5">${formattedLine}</div>`;
      }
      return `<div>${trimmed
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-mono text-xs">$1</code>')}</div>`;
    })
    .join('');
}

window.handleGrammarNoteLiveInput = function (val) {
  state.adminDraftGrammarMm = val;
  const previewBox = document.getElementById('admin-grammar-live-preview');
  if (previewBox) {
    previewBox.innerHTML = formatMarkdownPreview(val);
  }
};

window.toggleAdminDraftPublished = function () {
  state.adminDraftIsPublished = !state.adminDraftIsPublished;
  const btn = document.getElementById('admin-draft-pub-btn');
  const hiddenInput = document.getElementById('admin-is-published-input');
  if (hiddenInput) hiddenInput.value = state.adminDraftIsPublished ? 'true' : 'false';
  if (btn) {
    btn.className = `px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition ${
      state.adminDraftIsPublished
        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
    }`;
    btn.textContent = state.adminDraftIsPublished ? '● Published (Live to Students)' : '○ Draft (Hidden from Students)';
  }
};

window.toggleLessonPublishedDirect = function (lessonId) {
  try {
    assertStrictAdminMutationAuth();
  } catch {
    silentRedirectToRoot();
    render();
    return;
  }
  const les = state.lessons.find((l) => l.id === lessonId);
  if (!les) return;
  les.is_published = les.is_published === false ? true : false;
  saveState();
  showAdminToast(
    `✓ "${les.title}" marked as ${les.is_published ? 'Published (Live in Student View)' : 'Draft (Hidden from Student View)'}`
  );
};

// Confirmation Dialog System for Safe Deletions
window.askAdminDeleteConfirm = function (type, id, label) {
  if (!isStrictAuthorizedAdmin(state.user) || !isAdminPinUnlockedForSession()) return;
  state.adminConfirmDialog = { type, id, label };
  render();
};

window.cancelAdminDeleteConfirm = function () {
  state.adminConfirmDialog = null;
  render();
};

window.confirmAdminDeleteAction = function () {
  if (!state.adminConfirmDialog) return;
  const { type, id } = state.adminConfirmDialog;
  state.adminConfirmDialog = null;
  if (type === 'lesson') window.deleteAdminLesson(id, true);
  else if (type === 'video') window.deleteAdminVideo(id, true);
  else if (type === 'vocab') window.deleteAdminVocab(id, true);
  else if (type === 'quiz') window.deleteAdminQuiz(id, true);
};

window.handleAdminPinSubmit = function (e) {
  e.preventDefault();
  if (!isStrictAuthorizedAdmin(state.user)) {
    silentRedirectToRoot();
    render();
    return;
  }
  const input = document.getElementById('admin-pin-input');
  const enteredPin = input ? input.value.trim() : '';
  if (enteredPin === ADMIN_PIN_ENV && /^\d{6}$/.test(enteredPin)) {
    sessionStorage.setItem('em_admin_pin_unlocked', 'true');
    state.adminPinError = '';
    showAdminToast('🔓 6-Digit ADMIN_PIN Verified! Studio Management Unlocked.');
  } else {
    state.adminPinError = 'Invalid 6-digit ADMIN_PIN. Access denied.';
    render();
  }
};

window.lockAdminPinSession = function () {
  sessionStorage.removeItem('em_admin_pin_unlocked');
  silentRedirectToRoot();
  render();
};

window.autoUnlockAdminPin = function () {
  if (!isStrictAuthorizedAdmin(state.user)) {
    silentRedirectToRoot();
    render();
    return;
  }
  sessionStorage.setItem('em_admin_pin_unlocked', 'true');
  state.adminPinError = '';
  showAdminToast('🔓 Studio Unlocked! ယခု သင်ခန်းစာများအားလုံး စိတ်ကြိုက်ပြင်ဆင်နိုင်ပါပြီ။');
};

window.openQuickAdminStudio = function (targetLessonId = null, targetSubTab = 'lessons') {
  // Strictly allow ONLY the authorized Admin account (aingdy924@gmail.com + role === 'admin')
  if (!isStrictAuthorizedAdmin(state.user)) {
    silentRedirectToRoot();
    render();
    return;
  }
  sessionStorage.setItem('em_admin_pin_unlocked', 'true');
  state.adminPinError = '';
  state.activeTab = 'admin';
  state.adminSubTab = targetSubTab || 'lessons';

  if (targetLessonId) {
    const les = state.lessons.find((l) => l.id === targetLessonId);
    if (les) {
      state.adminSelectedLevel = les.cefr_level;
      state.adminSelectedLessonId = les.id;
      if (state.adminSubTab === 'lessons') {
        state.editingLessonId = les.id;
        state.adminDraftGrammarMm = les.grammar_note_mm || '';
        state.adminDraftIsPublished = les.is_published !== false;
      }
    }
  }

  try {
    window.history.replaceState(null, '', '#' + SECRET_ADMIN_ROUTE);
  } catch {
    window.location.hash = '#' + SECRET_ADMIN_ROUTE;
  }
  saveState();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.setAdminSubTab = function (subTab) {
  if (!isStrictAuthorizedAdmin(state.user)) {
    silentRedirectToRoot();
    render();
    return;
  }
  state.adminSubTab = subTab;
  state.editingLessonId = null;
  state.editingVideoId = null;
  state.editingVocabId = null;
  state.editingQuizId = null;
  render();
};

window.setAdminLevelFilter = function (lvl) {
  if (!isStrictAuthorizedAdmin(state.user)) return;
  state.adminSelectedLevel = lvl;
  const firstInLevel = state.lessons
    .filter((l) => l.cefr_level === lvl)
    .sort((a, b) => a.order_index - b.order_index)[0];
  if (firstInLevel) {
    state.adminSelectedLessonId = firstInLevel.id;
  }
  state.editingLessonId = null;
  render();
};

window.setAdminSelectedLesson = function (lessonId) {
  if (!isStrictAuthorizedAdmin(state.user)) return;
  state.adminSelectedLessonId = lessonId;
  state.editingVideoId = null;
  state.editingVocabId = null;
  state.editingQuizId = null;
  render();
};

// --- 1. LESSON & UNIT EDITOR (Edit cefr_level, unit_number, title, grammar_note_mm with live preview, is_published, Up/Down reorder, Delete with confirm) ---
window.startEditLesson = function (lessonId) {
  if (!isStrictAuthorizedAdmin(state.user) || !isAdminPinUnlockedForSession()) return;
  const les = state.lessons.find((l) => l.id === lessonId);
  if (!les) return;
  state.editingLessonId = lessonId;
  state.adminSelectedLessonId = lessonId;
  state.adminSelectedLevel = les.cefr_level;
  state.adminDraftGrammarMm = les.grammar_note_mm || '';
  state.adminDraftIsPublished = les.is_published !== false;
  state.editingVocabId = null;
  state.editingQuizId = null;
  render();
};

window.cancelEditLesson = function () {
  state.editingLessonId = null;
  state.adminDraftGrammarMm = '';
  state.adminDraftIsPublished = true;
  state.editingVocabId = null;
  state.editingQuizId = null;
  render();
};

window.handleAdminLessonSubmit = function (e) {
  e.preventDefault();
  try {
    assertStrictAdminMutationAuth();
  } catch {
    silentRedirectToRoot();
    render();
    return;
  }
  const form = e.target;
  const cefr_level = form.cefr_level.value;
  const unit_number = parseInt(form.unit_number.value, 10) || 1;
  const order_index = parseInt(form.order_index.value, 10) || unit_number;
  const title = form.title.value.trim();
  const title_mm = form.title_mm.value.trim();
  const grammar_note_mm = form.grammar_note_mm.value.trim();
  const is_published = form.is_published
    ? form.is_published.value === 'true'
    : state.adminDraftIsPublished;

  if (!title || !grammar_note_mm) {
    showAdminToast('⚠️ Please provide both Lesson Title and Myanmar Grammar Note.', 'error');
    return;
  }

  if (state.editingLessonId) {
    const idx = state.lessons.findIndex((l) => l.id === state.editingLessonId);
    if (idx >= 0) {
      state.lessons[idx] = {
        ...state.lessons[idx],
        cefr_level,
        unit_number,
        order_index,
        title,
        title_mm,
        grammar_note_mm,
        is_published,
      };
    }
    state.adminSelectedLevel = cefr_level;
    state.adminSelectedLessonId = state.editingLessonId;
    saveState();
    showAdminToast(
      `✓ Auto-saved & Synced Lesson "${title}" (${cefr_level} Unit ${unit_number} • ${
        is_published ? 'Published' : 'Draft'
      })`
    );
  } else {
    const newLesson = {
      id: 'les-' + cefr_level.toLowerCase() + '-' + Date.now(),
      cefr_level,
      unit_number,
      order_index,
      title,
      title_mm,
      grammar_note_mm,
      is_published,
    };
    state.lessons.push(newLesson);
    state.adminSelectedLevel = cefr_level;
    state.adminSelectedLessonId = newLesson.id;
    state.adminDraftGrammarMm = '';
    saveState();
    showAdminToast(
      `✓ Created & Synced New Lesson "${title}" in ${cefr_level} (${
        is_published ? 'Published' : 'Draft'
      })`
    );
  }
};

window.reorderAdminLesson = function (lessonId, direction) {
  try {
    assertStrictAdminMutationAuth();
  } catch {
    silentRedirectToRoot();
    render();
    return;
  }
  const target = state.lessons.find((l) => l.id === lessonId);
  if (!target) return;

  const sameLevel = state.lessons
    .filter((l) => l.cefr_level === target.cefr_level)
    .sort((a, b) => a.order_index - b.order_index);

  const pos = sameLevel.findIndex((l) => l.id === lessonId);
  const swapIdx = direction === 'up' ? pos - 1 : pos + 1;
  if (swapIdx < 0 || swapIdx >= sameLevel.length) return;

  const neighbor = sameLevel[swapIdx];
  const tempOrder = target.order_index;
  target.order_index = neighbor.order_index;
  neighbor.order_index = tempOrder;

  sameLevel
    .sort((a, b) => a.order_index - b.order_index)
    .forEach((item, index) => {
      item.order_index = index + 1;
    });

  saveState();
  showAdminToast(`✓ Reordered "${target.title}" (${direction.toUpperCase()}) & Synced with Student View`);
};

window.deleteAdminLesson = function (lessonId, confirmed = false) {
  try {
    assertStrictAdminMutationAuth();
  } catch {
    silentRedirectToRoot();
    render();
    return;
  }
  const target = state.lessons.find((l) => l.id === lessonId);
  if (!target) return;

  if (!confirmed) {
    window.askAdminDeleteConfirm(
      'lesson',
      lessonId,
      `${target.cefr_level} Unit ${target.unit_number}: ${target.title}`
    );
    return;
  }

  state.lessons = state.lessons.filter((l) => l.id !== lessonId);
  state.lessonVideos = state.lessonVideos.filter((v) => v.lesson_id !== lessonId);
  state.vocabularies = state.vocabularies.filter((v) => v.lesson_id !== lessonId);
  state.quizzes = state.quizzes.filter((q) => q.lesson_id !== lessonId);

  if (state.editingLessonId === lessonId) state.editingLessonId = null;
  if (state.adminSelectedLessonId === lessonId) {
    state.adminSelectedLessonId = state.lessons[0] ? state.lessons[0].id : null;
  }
  saveState();
  showAdminToast(`🗑️ Deleted Lesson "${target.title}" and synced with Student View`);
};

// --- 2. VIDEO & DUAL-SUBTITLE EDITOR WITH INLINE LIVE PREVIEW PLAYER ---
window.startEditVideo = function (videoId) {
  if (!isStrictAuthorizedAdmin(state.user) || !isAdminPinUnlockedForSession()) return;
  const vid = state.lessonVideos.find((v) => v.id === videoId);
  if (!vid) return;
  state.editingVideoId = videoId;
  state.adminSelectedLessonId = vid.lesson_id;
  state.adminDraftVideoTitle = vid.title || '';
  state.adminDraftVideoProvider = vid.video_provider || 'mp4_url';
  state.adminDraftVideoUrl = vid.video_url || '';
  state.adminDraftDurationSec = vid.duration_sec || 15;
  state.adminDraftVideoOrder = vid.order_index || 1;
  state.adminDraftEnVtt = vid.subtitle_en_vtt || '';
  state.adminDraftMmVtt = vid.subtitle_mm_vtt || '';
  state.adminPreviewTimeSec = 0;
  render();
};

window.cancelEditVideo = function () {
  state.editingVideoId = null;
  state.adminDraftVideoTitle = '';
  state.adminDraftVideoProvider = 'mp4_url';
  state.adminDraftVideoUrl = '';
  state.adminDraftDurationSec = 15;
  state.adminDraftEnVtt = '';
  state.adminDraftMmVtt = '';
  state.adminPreviewTimeSec = 0;
  render();
};

window.syncAdminVideoDraftField = function (field, value) {
  state[field] = value;
  if (
    field === 'adminDraftVideoProvider' ||
    field === 'adminDraftVideoUrl'
  ) {
    render();
  } else {
    updateAdminInlinePreviewCaptionsDOM(state.adminPreviewTimeSec);
  }
};

window.setAdminPreviewSubMode = function (mode) {
  state.adminPreviewSubMode = mode;
  updateAdminInlinePreviewCaptionsDOM(state.adminPreviewTimeSec);
  document.querySelectorAll('[data-admin-prev-sub]').forEach((btn) => {
    const m = btn.getAttribute('data-admin-prev-sub');
    btn.className =
      m === mode
        ? 'px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-indigo-600 text-white'
        : 'px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800';
  });
};

window.seekAdminPreviewTime = function (sec) {
  const numSec = Math.max(0, parseFloat(sec) || 0);
  state.adminPreviewTimeSec = numSec;
  const vidEl = document.getElementById('admin-inline-preview-video');
  if (vidEl) {
    vidEl.currentTime = numSec;
  }
  const sliderEl = document.getElementById('admin-preview-scrubber');
  if (sliderEl) sliderEl.value = numSec;
  const labelEl = document.getElementById('admin-preview-time-label');
  if (labelEl) labelEl.textContent = formatDuration(numSec);
  updateAdminInlinePreviewCaptionsDOM(numSec);
};

function updateAdminInlinePreviewCaptionsDOM(currentTimeSec) {
  state.adminPreviewTimeSec = currentTimeSec;
  const enTa = document.getElementById('admin-en-vtt-textarea');
  const mmTa = document.getElementById('admin-mm-vtt-textarea');
  const rawEn = enTa ? enTa.value : state.adminDraftEnVtt;
  const rawMm = mmTa ? mmTa.value : state.adminDraftMmVtt;

  const enCues = parseVttCues(rawEn);
  const mmCues = parseVttCues(rawMm);

  const activeEn =
    enCues.find((c) => currentTimeSec >= c.start && currentTimeSec <= c.end) || enCues[0];
  const activeMm =
    mmCues.find((c) => currentTimeSec >= c.start && currentTimeSec <= c.end) || mmCues[0];

  const showEn = state.adminPreviewSubMode === 'en' || state.adminPreviewSubMode === 'both';
  const showMm = state.adminPreviewSubMode === 'mm' || state.adminPreviewSubMode === 'both';

  const overlayEl = document.getElementById('admin-inline-preview-overlay');
  if (overlayEl) {
    if (state.adminPreviewSubMode === 'off') {
      overlayEl.innerHTML = '';
      overlayEl.style.display = 'none';
    } else {
      overlayEl.style.display = 'flex';
      overlayEl.innerHTML = `
        <div class="inline-block max-w-xl px-3.5 py-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/15 text-center shadow-lg space-y-0.5">
          ${
            showEn
              ? `<div class="text-xs font-bold text-white">${
                  activeEn ? activeEn.text : '(No EN cue at this timestamp)'
                }</div>`
              : ''
          }
          ${
            showMm
              ? `<div class="text-xs font-mm font-bold text-amber-300">${
                  activeMm ? activeMm.text : '(No MM cue at this timestamp)'
                }</div>`
              : ''
          }
        </div>
      `;
    }
  }
}

window.handleVttFileUpload = function (inputEl, lang) {
  try {
    assertStrictAdminMutationAuth();
  } catch {
    return;
  }
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    const content = String(evt.target.result || '');
    if (lang === 'en') {
      state.adminDraftEnVtt = content;
      const ta = document.getElementById('admin-en-vtt-textarea');
      if (ta) ta.value = content;
    } else {
      state.adminDraftMmVtt = content;
      const ta = document.getElementById('admin-mm-vtt-textarea');
      if (ta) ta.value = content;
    }
    updateAdminInlinePreviewCaptionsDOM(state.adminPreviewTimeSec);
    showAdminToast(`✓ Uploaded & Synced ${file.name} into ${lang.toUpperCase()} VTT Subtitle Editor`);
  };
  reader.readAsText(file);
};

window.handleAdminVideoSubmit = function (e) {
  e.preventDefault();
  try {
    assertStrictAdminMutationAuth();
  } catch {
    silentRedirectToRoot();
    render();
    return;
  }
  const form = e.target;
  const lesson_id = form.lesson_id.value;
  const title = form.title.value.trim();
  const video_provider = form.video_provider.value;
  const video_url = form.video_url.value.trim();
  const duration_sec = Math.max(5, parseInt(form.duration_sec.value, 10) || 15);
  const order_index = parseInt(form.order_index.value, 10) || 1;
  const subtitle_en_vtt = form.subtitle_en_vtt.value.trim();
  const subtitle_mm_vtt = form.subtitle_mm_vtt.value.trim();

  if (!lesson_id || !title || !video_url) {
    showAdminToast('⚠️ Video Title and URL are required.', 'error');
    return;
  }

  if (state.editingVideoId) {
    const idx = state.lessonVideos.findIndex((v) => v.id === state.editingVideoId);
    if (idx >= 0) {
      state.lessonVideos[idx] = {
        ...state.lessonVideos[idx],
        lesson_id,
        title,
        video_provider,
        video_url,
        duration_sec,
        order_index,
        subtitle_en_vtt,
        subtitle_mm_vtt,
      };
    }
    state.editingVideoId = null;
    state.adminDraftVideoTitle = '';
    state.adminDraftVideoUrl = '';
    state.adminDraftEnVtt = '';
    state.adminDraftMmVtt = '';
    saveState();
    showAdminToast(`✓ Auto-saved & Synced Video "${title}" + Dual VTT Subtitles`);
  } else {
    const created = {
      id: 'vid-' + Date.now(),
      lesson_id,
      title,
      video_provider,
      video_url,
      duration_sec,
      order_index,
      subtitle_en_vtt:
        subtitle_en_vtt ||
        `WEBVTT\n\n00:00:00.000 --> 00:00:08.000\nWelcome to ${title}.`,
      subtitle_mm_vtt:
        subtitle_mm_vtt ||
        `WEBVTT\n\n00:00:00.000 --> 00:00:08.000\n${title} သင်ခန်းစာမှ ကြိုဆိုပါတယ်။`,
    };
    state.lessonVideos.push(created);
    state.adminDraftVideoTitle = '';
    state.adminDraftVideoUrl = '';
    state.adminDraftEnVtt = '';
    state.adminDraftMmVtt = '';
    saveState();
    showAdminToast(`✓ Added & Synced Video "${title}" (${video_provider}) to Unit`);
  }
};

window.deleteAdminVideo = function (videoId, confirmed = false) {
  try {
    assertStrictAdminMutationAuth();
  } catch {
    silentRedirectToRoot();
    render();
    return;
  }
  const vid = state.lessonVideos.find((v) => v.id === videoId);
  if (!vid) return;
  if (!confirmed) {
    window.askAdminDeleteConfirm('video', videoId, vid.title);
    return;
  }
  state.lessonVideos = state.lessonVideos.filter((v) => v.id !== videoId);
  if (state.editingVideoId === videoId) state.editingVideoId = null;
  saveState();
  showAdminToast(`🗑️ Deleted Video "${vid.title}" & Synced with Student View`);
};

// --- 3. VOCABULARY & QUIZ INLINE EDITOR + BULK JSON IMPORT ---
window.handleAdminVocabSubmit = function (e) {
  e.preventDefault();
  try {
    assertStrictAdminMutationAuth();
  } catch {
    silentRedirectToRoot();
    render();
    return;
  }
  const form = e.target;
  const lesson_id = form.lesson_id.value;
  const word_en = form.word_en.value.trim();
  const phonetic = form.phonetic.value.trim() || `/${word_en.toLowerCase()}/`;
  const meaning_mm = form.meaning_mm.value.trim();
  const example_en = form.example_en.value.trim();
  const example_mm = form.example_mm.value.trim();

  if (!lesson_id || !word_en || !meaning_mm) {
    showAdminToast('⚠️ English word and Myanmar meaning are required.', 'error');
    return;
  }

  if (state.editingVocabId) {
    const idx = state.vocabularies.findIndex((v) => v.id === state.editingVocabId);
    if (idx >= 0) {
      state.vocabularies[idx] = {
        ...state.vocabularies[idx],
        lesson_id,
        word_en,
        phonetic,
        meaning_mm,
        example_en,
        example_mm,
      };
    }
    state.editingVocabId = null;
    saveState();
    showAdminToast(`✓ Updated & Synced Vocabulary "${word_en}" (${meaning_mm})`);
  } else {
    state.vocabularies.push({
      id: 'voc-' + Date.now(),
      lesson_id,
      word_en,
      phonetic,
      meaning_mm,
      example_en: example_en || `Example sentence with ${word_en}.`,
      example_mm: example_mm || `${meaning_mm} ပါဝင်သော နမူနာဝါကျ။`,
    });
    saveState();
    showAdminToast(`✓ Added & Synced Vocabulary "${word_en}" (${meaning_mm})`);
  }
};

window.startEditVocab = function (vocabId) {
  if (!isStrictAuthorizedAdmin(state.user) || !isAdminPinUnlockedForSession()) return;
  const voc = state.vocabularies.find((v) => v.id === vocabId);
  if (!voc) return;
  state.editingVocabId = vocabId;
  state.adminSelectedLessonId = voc.lesson_id;
  render();
};

window.deleteAdminVocab = function (vocabId, confirmed = false) {
  try {
    assertStrictAdminMutationAuth();
  } catch {
    silentRedirectToRoot();
    render();
    return;
  }
  const voc = state.vocabularies.find((v) => v.id === vocabId);
  if (!voc) return;
  if (!confirmed) {
    window.askAdminDeleteConfirm('vocab', vocabId, `${voc.word_en} (${voc.meaning_mm})`);
    return;
  }
  state.vocabularies = state.vocabularies.filter((v) => v.id !== vocabId);
  if (state.editingVocabId === vocabId) state.editingVocabId = null;
  saveState();
  showAdminToast(`🗑️ Deleted Vocabulary "${voc.word_en}" & Synced with Student View`);
};

window.setAdminQuizType = function (qType) {
  state.adminQuizType = qType;
  render();
};

window.handleAdminQuizSubmit = function (e) {
  e.preventDefault();
  try {
    assertStrictAdminMutationAuth();
  } catch {
    silentRedirectToRoot();
    render();
    return;
  }
  const form = e.target;
  const lesson_id = form.lesson_id.value;
  const question_type = form.question_type.value;
  const question_text = form.question_text.value.trim();
  const rawOptions = form.options_raw.value.trim();
  const correct_answer = form.correct_answer.value.trim();
  const explanation_mm = form.explanation_mm.value.trim();

  if (!lesson_id || !question_text || !correct_answer) {
    showAdminToast('⚠️ Question text and correct answer are required.', 'error');
    return;
  }

  let optionsArray = [];
  if (rawOptions.startsWith('[')) {
    try {
      optionsArray = JSON.parse(rawOptions);
    } catch {
      optionsArray = rawOptions.split(',').map((s) => s.trim()).filter(Boolean);
    }
  } else {
    optionsArray = rawOptions.split(',').map((s) => s.trim()).filter(Boolean);
  }

  const options_json = JSON.stringify(optionsArray);

  if (state.editingQuizId) {
    const idx = state.quizzes.findIndex((q) => q.id === state.editingQuizId);
    if (idx >= 0) {
      state.quizzes[idx] = {
        ...state.quizzes[idx],
        lesson_id,
        question_type,
        question_text,
        options_json,
        correct_answer,
        explanation_mm,
      };
    }
    state.editingQuizId = null;
    saveState();
    showAdminToast(`✓ Updated & Synced Quiz Question (${question_type.toUpperCase()})`);
  } else {
    state.quizzes.push({
      id: 'qz-' + Date.now(),
      lesson_id,
      question_type,
      question_text,
      options_json,
      correct_answer,
      explanation_mm:
        explanation_mm || `အဖြေမှန်မှာ "${correct_answer}" ဖြစ်ပါသည်။`,
    });
    saveState();
    showAdminToast(`✓ Added & Synced ${question_type.toUpperCase()} Quiz Question`);
  }
};

window.startEditQuiz = function (quizId) {
  if (!isStrictAuthorizedAdmin(state.user) || !isAdminPinUnlockedForSession()) return;
  const q = state.quizzes.find((item) => item.id === quizId);
  if (!q) return;
  state.editingQuizId = quizId;
  state.adminQuizType = q.question_type;
  state.adminSelectedLessonId = q.lesson_id;
  render();
};

window.deleteAdminQuiz = function (quizId, confirmed = false) {
  try {
    assertStrictAdminMutationAuth();
  } catch {
    silentRedirectToRoot();
    render();
    return;
  }
  const q = state.quizzes.find((item) => item.id === quizId);
  if (!q) return;
  if (!confirmed) {
    window.askAdminDeleteConfirm('quiz', quizId, q.question_text);
    return;
  }
  state.quizzes = state.quizzes.filter((item) => item.id !== quizId);
  if (state.editingQuizId === quizId) state.editingQuizId = null;
  saveState();
  showAdminToast(`🗑️ Deleted Quiz Question & Synced with Student View`);
};

window.loadSampleBulkJson = function () {
  const ta = document.getElementById('admin-bulk-json-textarea');
  if (!ta) return;
  const targetLessonId = state.adminSelectedLessonId || 'les-a1-1';
  const samplePayload = {
    lesson_id: targetLessonId,
    vocabulary: [
      {
        word_en: 'Confidence',
        meaning_mm: 'မိမိကိုယ်ကို ယုံကြည်မှု',
        phonetic: '/ˈkɒn.fɪ.dəns/',
        example_en: 'Speaking every day builds your confidence.',
        example_mm: 'နေ့တိုင်း စကားပြောခြင်းက သင့်ယုံကြည်မှုကို တည်ဆောက်ပေးပါတယ်။',
      },
      {
        word_en: 'Fluency',
        meaning_mm: 'သွက်လက်ချောမွေ့စွာ ပြောဆိုနိုင်မှု',
        phonetic: '/ˈfluː.ən.si/',
        example_en: 'Practice listening to improve your English fluency.',
        example_mm: 'အင်္ဂလိပ်စကား သွက်လက်စေရန် နားထောင်မှုကို လေ့ကျင့်ပါ။',
      },
    ],
    quizzes: [
      {
        question_type: 'mcq',
        question_text: 'Speaking every day builds your ___.',
        options: ['confidence', 'neighbor', 'departure', 'breakfast'],
        correct_answer: 'confidence',
        explanation_mm: 'Confidence သည် မိမိကိုယ်ကို ယုံကြည်မှုဟု အဓိပ္ပာယ်ရပါသည်။',
      },
      {
        question_type: 'reorder',
        question_text: 'Reorder the words to form a study tip:',
        options: ['Practice', 'listening', 'every', 'day'],
        correct_answer: 'Practice listening every day',
        explanation_mm: '"Practice listening every day" (နေ့တိုင်း နားထောင်မှုကို လေ့ကျင့်ပါ) ဟု စီရပါမည်။',
      },
    ],
  };
  ta.value = JSON.stringify(samplePayload, null, 2);
};

window.handleBulkJsonImport = function (e) {
  e.preventDefault();
  try {
    assertStrictAdminMutationAuth();
  } catch {
    silentRedirectToRoot();
    render();
    return;
  }
  const ta = document.getElementById('admin-bulk-json-textarea');
  if (!ta || !ta.value.trim()) return;

  try {
    const data = JSON.parse(ta.value.trim());
    const fallbackLessonId = data.lesson_id || state.adminSelectedLessonId || state.lessons[0]?.id;
    let addedLessons = 0;
    let addedVideos = 0;
    let addedVocabs = 0;
    let addedQuizzes = 0;

    if (Array.isArray(data.lessons)) {
      data.lessons.forEach((l, i) => {
        if (l.title && l.grammar_note_mm) {
          state.lessons.push({
            id: l.id || `les-bulk-${Date.now()}-${i}`,
            cefr_level: l.cefr_level || state.adminSelectedLevel || 'A1',
            unit_number: Number(l.unit_number) || state.lessons.length + 1,
            order_index: Number(l.order_index) || state.lessons.length + 1,
            title: l.title,
            title_mm: l.title_mm || '',
            grammar_note_mm: l.grammar_note_mm,
          });
          addedLessons++;
        }
      });
    }

    if (Array.isArray(data.lesson_videos)) {
      data.lesson_videos.forEach((v, i) => {
        if (v.title && v.video_url) {
          state.lessonVideos.push({
            id: v.id || `vid-bulk-${Date.now()}-${i}`,
            lesson_id: v.lesson_id || fallbackLessonId,
            title: v.title,
            video_provider: v.video_provider || 'mp4_url',
            video_url: v.video_url,
            duration_sec: Number(v.duration_sec) || 30,
            order_index: Number(v.order_index) || i + 1,
            subtitle_en_vtt: v.subtitle_en_vtt || '',
            subtitle_mm_vtt: v.subtitle_mm_vtt || '',
          });
          addedVideos++;
        }
      });
    }

    const vocabList = Array.isArray(data.vocabulary)
      ? data.vocabulary
      : Array.isArray(data.vocabularies)
      ? data.vocabularies
      : [];
    vocabList.forEach((v, i) => {
      if (v.word_en && v.meaning_mm) {
        state.vocabularies.push({
          id: v.id || `voc-bulk-${Date.now()}-${i}`,
          lesson_id: v.lesson_id || fallbackLessonId,
          word_en: v.word_en,
          meaning_mm: v.meaning_mm,
          phonetic: v.phonetic || `/${v.word_en.toLowerCase()}/`,
          example_en: v.example_en || `Example with ${v.word_en}.`,
          example_mm: v.example_mm || `${v.meaning_mm} နမူနာဝါကျ။`,
        });
        addedVocabs++;
      }
    });

    if (Array.isArray(data.quizzes)) {
      data.quizzes.forEach((q, i) => {
        if (q.question_text && q.correct_answer) {
          const opts = Array.isArray(q.options)
            ? JSON.stringify(q.options)
            : q.options_json || '[]';
          state.quizzes.push({
            id: q.id || `qz-bulk-${Date.now()}-${i}`,
            lesson_id: q.lesson_id || fallbackLessonId,
            question_type: q.question_type || 'mcq',
            question_text: q.question_text,
            options_json: opts,
            correct_answer: q.correct_answer,
            explanation_mm:
              q.explanation_mm || `အဖြေမှန်မှာ "${q.correct_answer}" ဖြစ်ပါသည်။`,
          });
          addedQuizzes++;
        }
      });
    }

    saveState();
    ta.value = '';
    showAdminToast(
      `🎉 Bulk JSON Imported: +${addedVocabs} Vocab, +${addedQuizzes} Quizzes, +${addedLessons} Lessons, +${addedVideos} Videos!`
    );
  } catch (err) {
    showAdminToast(`❌ Invalid JSON format: ${err.message}`);
  }
};

// ============================================================================
// UI VIEWS
// ============================================================================

function renderAuthScreen() {
  return `
    <div class="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-6 sm:px-6">
      <div class="max-w-md w-full mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-500/25">
            EM
          </div>
          <div>
            <span class="font-extrabold text-lg tracking-tight block leading-none">English Master</span>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-mm">အင်္ဂလိပ်စာ လေ့လာရေး</span>
          </div>
        </div>
        <button onclick="toggleTheme()" class="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          ${state.isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <div class="max-w-md w-full mx-auto my-6">
        <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3">
            ✨ CEFR A1–C1 Bilingual Platform
          </div>
          <h1 class="text-2xl font-extrabold tracking-tight">
            ${state.authMode === 'login' ? 'Welcome Back!' : 'Create Free Account'}
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 font-mm mt-1">
            ${state.authMode === 'login' ? 'သင်၏ အင်္ဂလိပ်စာ လေ့လာမှုခရီးစဉ်ကို ပြန်လည်စတင်လိုက်ပါ။' : 'အကောင့်အသစ်ဖွင့်ပြီး A1 မှ C1 အထိ စနစ်တကျ လေ့လာပါ။'}
          </p>

          <div class="grid grid-cols-2 gap-1.5 p-1 mt-5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button onclick="state.authMode='login'; render()" class="py-2 text-xs font-bold rounded-xl transition ${state.authMode === 'login' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'}">
              Sign In (ဝင်ရန်)
            </button>
            <button onclick="state.authMode='register'; render()" class="py-2 text-xs font-bold rounded-xl transition ${state.authMode === 'register' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'}">
              Sign Up (အကောင့်သစ်)
            </button>
          </div>

          ${state.authError ? `<div class="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-mm">${state.authError}</div>` : ''}

          <form onsubmit="handleAuthSubmit(event)" class="mt-5 space-y-4">
            ${state.authMode === 'register' ? `
              <div>
                <label class="block text-xs font-semibold mb-1.5">Full Name • <span class="font-mm">အမည်</span></label>
                <input name="name" type="text" placeholder="e.g. Kyaw Swar (ကျော်စွာ)" required class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60" />
              </div>
            ` : ''}

            <div>
              <label class="block text-xs font-semibold mb-1.5">Email Address • <span class="font-mm">အီးမေးလ်</span></label>
              <input name="email" type="email" value="${state.authMode === 'login' ? 'aungkyaw@englishmaster.mm' : ''}" placeholder="you@example.com" required class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60" />
            </div>

            <div>
              <label class="block text-xs font-semibold mb-1.5">Password • <span class="font-mm">စကားဝှက်</span></label>
              <input name="password" type="password" value="${state.authMode === 'login' ? 'password123' : ''}" placeholder="••••••••" required class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60" />
            </div>

            ${state.authMode === 'register' ? `
              <div>
                <label class="block text-xs font-semibold mb-1.5">Starting CEFR Level</label>
                <select name="level" class="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                  ${CEFR_LEVELS.map((l) => `<option value="${l.level}">${l.level} - ${l.label_en}</option>`).join('')}
                </select>
                <p class="text-[11px] text-slate-400 mt-1">All new accounts are created strictly as Student role (0 XP, 0 Streak).</p>
              </div>
            ` : ''}

            <button type="submit" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
              ${state.authMode === 'login' ? 'Sign In with Email →' : 'Create Student Account (0 XP / 0 Streak) →'}
            </button>
          </form>

          <div class="relative my-5 flex items-center justify-center">
            <div class="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span class="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold uppercase text-slate-400">OR</span>
            <div class="border-t border-slate-200 dark:border-slate-800 w-full"></div>
          </div>

          <button onclick="loginGoogle()" class="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-sm font-semibold flex items-center justify-center gap-2.5 shadow-sm">
            <span class="font-extrabold text-blue-500">G</span>
            <span>Continue with Google</span>
          </button>

          <div class="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">Quick Student Demo</p>
            <button onclick="loginDemo(0)" class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-left flex items-center justify-between">
              <div class="text-xs font-bold">Aung Kyaw (aungkyaw@englishmaster.mm)</div>
              <div class="text-[11px] text-emerald-500 font-semibold">Student • Level A1</div>
            </button>
          </div>
        </div>
      </div>
      <p class="text-center text-xs text-slate-400 font-mm">English Master • Bilingual English-Myanmar Learning App</p>
    </div>
  `;
}

function renderHomeView() {
  const user = state.user;
  const publishedLessons = state.lessons.filter((l) => l.is_published !== false);
  const a1Lessons = publishedLessons.filter((l) => l.cefr_level === 'A1');
  const wordOfDay = state.vocabularies[2] || state.vocabularies[0];

  // Determine next incomplete lesson for "Continue Learning" card
  const isLessonDone = (lesId) => {
    const up = state.userProgress.find((p) => p.user_id === user.id && p.lesson_id === lesId);
    return (up && up.status === 'completed') || state.completedLessonIds.includes(lesId);
  };

  const userLevelLessons = publishedLessons
    .filter((l) => l.cefr_level === user.current_level)
    .sort((a, b) => a.order_index - b.order_index);

  const nextLesson =
    userLevelLessons.find((l) => !isLessonDone(l.id)) ||
    publishedLessons.find((l) => !isLessonDone(l.id)) ||
    publishedLessons[0];

  const completedCount = publishedLessons.filter((l) => isLessonDone(l.id)).length;
  const dueReviewsCount = state.flashcardReviews.filter(
    (r) => r.user_id === user.id && new Date(r.next_review_at).getTime() <= Date.now()
  ).length;
  const bookmarkedCount = state.flashcardReviews.filter(
    (r) => r.user_id === user.id && r.is_bookmarked
  ).length;

  return `
    <div class="space-y-6 pb-8">
      <!-- Progress Dashboard Hero (CEFR Level, Daily Streak Counter, Total XP) -->
      <div class="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white p-6 sm:p-7 shadow-xl shadow-indigo-500/20">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div class="space-y-1.5">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold">
              ✨ မင်္ဂလာပါ • Progress Dashboard
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">${user.name}</h1>
            <p class="text-xs sm:text-sm text-indigo-100 font-mm">
              ယနေ့ အင်္ဂလိပ်စာ သင်ခန်းစာ၊ ဉာဏ်စမ်းမေးခွန်းများနှင့် SRS ကတ်ပြားများကို ဆက်လက်လေ့လာပါ။
            </p>
          </div>

          <div class="grid grid-cols-3 gap-2.5 sm:min-w-[290px]">
            <div class="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center">
              <div class="text-xs text-amber-300 font-bold">🎓 CEFR</div>
              <div class="text-xl sm:text-2xl font-extrabold mt-0.5">${user.current_level}</div>
              <div class="text-[10px] uppercase tracking-wider text-indigo-100 font-semibold">Current Level</div>
            </div>
            <div class="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center">
              <div class="text-xs text-orange-300 font-bold">🔥 Streak</div>
              <div class="text-xl sm:text-2xl font-extrabold mt-0.5">${user.streak_count}d</div>
              <div class="text-[10px] uppercase tracking-wider text-indigo-100 font-semibold">Daily Streak</div>
            </div>
            <div class="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center">
              <div class="text-xs text-emerald-300 font-bold">🏆 Total XP</div>
              <div class="text-xl sm:text-2xl font-extrabold mt-0.5">${user.xp_points}</div>
              <div class="text-[10px] uppercase tracking-wider text-indigo-100 font-semibold">XP Points</div>
            </div>
          </div>
        </div>

        <!-- Mini Course Progress Bar -->
        <div class="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 font-bold text-indigo-100">
            <span>📈 Overall Lesson Completion: ${completedCount} / ${state.lessons.length} Units</span>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="setFlashcardDeckMode('due'); setTab('flashcards')" class="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 font-bold transition">
              🗂️ ${dueReviewsCount} SRS Cards Due
            </button>
            <button onclick="setFlashcardDeckMode('bookmarked'); setTab('flashcards')" class="px-3 py-1 rounded-xl bg-amber-400/20 text-amber-200 hover:bg-amber-400/30 font-bold transition">
              ⭐ ${bookmarkedCount} Word Bank
            </button>
          </div>
        </div>
      </div>

      <!-- Continue Learning Card (Next Incomplete Lesson) -->
      ${
        nextLesson
          ? `
        <div class="bg-white dark:bg-slate-900 border-2 border-indigo-500/40 dark:border-indigo-500/50 rounded-3xl p-5 sm:p-6 shadow-md">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white">
                  🚀 Continue Learning • ဆက်လက်လေ့လာရန်
                </span>
                <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  CEFR ${nextLesson.cefr_level} • Unit ${nextLesson.unit_number}
                </span>
                <span class="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Status: ${isLessonDone(nextLesson.id) ? 'Completed' : 'Not Started / Next Up'}
                </span>
              </div>
              <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                ${nextLesson.title}
              </h2>
              ${
                nextLesson.title_mm
                  ? `<p class="text-sm font-mm font-semibold text-indigo-600 dark:text-indigo-400">${nextLesson.title_mm}</p>`
                  : ''
              }
              <p class="text-xs text-slate-500 dark:text-slate-400 font-mm">
                သဒ္ဒါရှင်းလင်းချက်၊ ဝေါဟာရအသံထွက်နှင့် Interactive Quiz ဖြေဆိုပြီး +30 XP ရယူပါ။
              </p>
            </div>

            <button
              onclick="openLesson('${nextLesson.id}', '${nextLesson.cefr_level}')"
              class="shrink-0 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition"
            >
              <span>Resume Unit ${nextLesson.unit_number} & Quiz</span>
              <span>→</span>
            </button>
          </div>
        </div>
      `
          : ''
      }

      <!-- Seeded A1 Units -->
      <div class="space-y-3.5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-extrabold">A1 Starter Units & Quizzes • <span class="font-mm text-base">အခြေခံ သင်ခန်းစာ ၂ ခု</span></h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-mm">ဗီဒီယို၊ သဒ္ဒါ၊ ဝေါဟာရ ၅ လုံးစီနှင့် Interactive Quiz (+30 XP) ပါဝင်ပါသည်</p>
          </div>
          <button onclick="setTab('lessons')" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            View All Levels →
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${a1Lessons
            .map((les) => {
              const count = state.vocabularies.filter((v) => v.lesson_id === les.id).length;
              const quizCount = state.quizzes.filter((q) => q.lesson_id === les.id).length;
              const prog = getLessonUserProgress(les.id);
              const done = prog && prog.status === 'completed';
              return `
              <div onclick="openLesson('${les.id}', 'A1')" class="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 rounded-3xl p-5 shadow-sm transition cursor-pointer flex flex-col justify-between gap-4">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      ${les.cefr_level} • Unit ${les.unit_number}
                    </span>
                    <span class="text-xs font-semibold ${done ? 'text-emerald-500' : 'text-slate-400'}">
                      ${done ? `✓ Score: ${prog.score}%` : `📚 ${count} Words • 🧠 ${quizCount} Quizzes`}
                    </span>
                  </div>
                  <h3 class="text-base sm:text-lg font-extrabold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">${les.title}</h3>
                  <p class="text-xs sm:text-sm font-mm text-slate-500 dark:text-slate-400">${les.title_mm || ''}</p>
                </div>
                <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Study Grammar, Audio & Quiz (+30 XP)</span>
                  <span>→</span>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>

      <!-- Word of the Day -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            📖 Word of the Day • နေ့စဉ်ဝေါဟာရ
          </span>
          <button onclick="speakText('${wordOfDay.word_en}', 'wod')" class="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold">
            🔊 Listen (${state.accent})
          </button>
        </div>
        <div class="flex flex-wrap items-baseline gap-2.5">
          <h3 class="text-2xl font-extrabold">${wordOfDay.word_en}</h3>
          <span class="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">${wordOfDay.phonetic}</span>
        </div>
        <p class="font-mm text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">${wordOfDay.meaning_mm}</p>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
          “${wordOfDay.example_en}” — <span class="font-mm text-slate-500">${wordOfDay.example_mm}</span>
        </p>
      </div>
    </div>
  `;
}

// ============================================================================
// VIDEO LESSON MODULE RENDERER (inside Lesson Detail)
// ============================================================================
function renderVideoLessonSection(lesson) {
  const lessonVideos = state.lessonVideos
    .filter((v) => v.lesson_id === lesson.id)
    .sort((a, b) => a.order_index - b.order_index);

  const activeVideo =
    lessonVideos.find((v) => v.id === state.activeVideoId) || lessonVideos[0] || null;

  if (activeVideo && !state.activeVideoId) {
    state.activeVideoId = activeVideo.id;
  }

  const progressRec = activeVideo ? getUserProgressForVideo(activeVideo.id) : null;
  const watchedSec = progressRec ? progressRec.watched_seconds : 0;
  const pct = activeVideo
    ? Math.min(100, Math.round((watchedSec / Math.max(1, activeVideo.duration_sec)) * 100))
    : 0;

  const enCues = activeVideo ? parseVttCues(activeVideo.subtitle_en_vtt) : [];
  const mmCues = activeVideo ? parseVttCues(activeVideo.subtitle_mm_vtt) : [];

  const speeds = [0.75, 1.0, 1.25, 1.5];
  const subModes = [
    { id: 'off', label: 'Off' },
    { id: 'en', label: 'English' },
    { id: 'mm', label: 'Myanmar (မြန်မာ)' },
    { id: 'both', label: 'Both (နှစ်ဘာသာ)' },
  ];

  return `
    <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
      <!-- Video Module Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-bold">
            🎬
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-extrabold text-base sm:text-lg">Video Lesson Module (ဗီဒီယို သင်ခန်းစာ)</h2>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                ${lessonVideos.length} ${lessonVideos.length === 1 ? 'Video' : 'Videos'}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-mm">
              YouTube Unlisted နှင့် MP4/Cloudflare R2 ဗီဒီယိုများ • ၅ စက္ကန့်တိုင်း အလိုအလျောက် မှတ်သားပေးပြီး 90% ကြည့်ပြီးပါက +20 XP ရရှိမည်။
            </p>
          </div>
        </div>
      </div>

      <!-- XP Notification Toast -->
      <div id="xp-toast-banner" class="${state.xpToastMessage ? '' : 'hidden'} p-3.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs sm:text-sm text-center shadow-lg">
        ${state.xpToastMessage || ''}
      </div>

      ${
        lessonVideos.length > 1
          ? `
        <!-- Video Selector Tabs (when unit has multiple videos) -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          ${lessonVideos
            .map((v) => {
              const isSelected = activeVideo && activeVideo.id === v.id;
              const p = getUserProgressForVideo(v.id);
              return `
              <button onclick="selectLessonVideo('${v.id}')" class="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }">
                <span>#${v.order_index}</span>
                <span class="truncate max-w-[200px]">${v.title}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-black/20">${
                  v.video_provider === 'youtube_unlisted' ? 'YouTube' : 'MP4/R2'
                }</span>
                ${p && p.is_completed ? '<span class="text-emerald-300">✓</span>' : ''}
              </button>
            `;
            })
            .join('')}
        </div>
      `
          : ''
      }

      ${
        activeVideo
          ? `
        <!-- Active Video Player Wrapper -->
        <div class="space-y-4">
          <!-- Video Title & Provider Meta Bar -->
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                  activeVideo.video_provider === 'youtube_unlisted'
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    : 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                }">
                  ${activeVideo.video_provider === 'youtube_unlisted' ? '▶ YouTube Unlisted' : '☁️ Direct MP4 / Cloudflare R2'}
                </span>
                <h3 class="text-base sm:text-lg font-extrabold">${activeVideo.title}</h3>
              </div>
            </div>

            <div id="video-completion-badge" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"></div>
          </div>

          <!-- Responsive 16:9 Video Viewport with Overlaid Dual VTT Captions -->
          <div class="relative w-full overflow-hidden rounded-2xl bg-slate-950 aspect-video shadow-xl border border-slate-800">
            ${
              activeVideo.video_provider === 'mp4_url'
                ? `
              <video
                id="em-html5-video"
                src="${activeVideo.video_url}"
                controls
                playsinline
                preload="metadata"
                class="w-full h-full object-contain bg-black"
              ></video>
            `
                : `
              <iframe
                id="em-youtube-iframe"
                class="w-full h-full"
                src="https://www.youtube.com/embed/${extractYouTubeId(activeVideo.video_url)}?start=${watchedSec}&rel=0&modestbranding=1"
                title="${activeVideo.title}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            `
            }

            <!-- Live Subtitle Overlay over bottom of video -->
            <div
              id="video-subtitle-overlay"
              class="pointer-events-none absolute inset-x-4 bottom-12 z-20 flex justify-center transition-all"
            ></div>
          </div>

          ${
            activeVideo.video_provider === 'youtube_unlisted'
              ? `
            <!-- YouTube Unlisted Companion Sync Bar (for VTT Subtitles & 5s Auto-Save tracking) -->
            <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <div class="flex items-center gap-2">
                <button
                  onclick="toggleYouTubeTimerSync()"
                  class="px-3.5 py-1.5 rounded-xl font-extrabold text-white shadow-sm transition ${
                    state.isPlayingSimulated ? 'bg-rose-600 hover:bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-500'
                  }"
                >
                  ${state.isPlayingSimulated ? '⏸ Pause VTT & Progress Sync' : '▶ Start VTT & 5s Auto-Save Sync'}
                </button>
                <span class="text-slate-500 dark:text-slate-400 font-mm">
                  YouTube Unlisted အတွက် စာတန်းထိုးနှင့် 5s Auto-save ချိတ်ဆက်ရန်
                </span>
              </div>
              <button
                onclick="seekVideoTo(${Math.ceil(activeVideo.duration_sec * 0.92)})"
                class="px-3 py-1.5 rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-600/25"
              >
                ⚡ Simulate 90% Watched (+20 XP)
              </button>
            </div>
          `
              : ''
          }

          <!-- Controls Toolbar: Playback Speed (0.75x, 1.0x, 1.25x, 1.5x) & Dual Subtitle Toggle (Off / English / Myanmar / Both) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <!-- Playback Speed Controls -->
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                ⚡ Speed:
              </span>
              <div class="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                ${speeds
                  .map(
                    (s) => `
                  <button
                    type="button"
                    data-speed-btn="${s}"
                    onclick="setPlaybackSpeed(${s})"
                    class="px-2.5 py-1 rounded-lg text-xs transition ${
                      state.playbackSpeed === s
                        ? 'font-extrabold bg-indigo-600 text-white shadow-sm'
                        : 'font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }"
                  >
                    ${s}x
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>

            <!-- Dual Subtitle Toggle (Off / English / Myanmar / Both) -->
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                💬 Subtitles (.vtt):
              </span>
              <div class="flex flex-wrap items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                ${subModes
                  .map(
                    (m) => `
                  <button
                    type="button"
                    data-sub-btn="${m.id}"
                    onclick="setSubtitleMode('${m.id}')"
                    class="px-2.5 py-1 rounded-lg text-xs transition ${
                      state.subtitleMode === m.id
                        ? 'font-extrabold bg-indigo-600 text-white shadow-sm'
                        : 'font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }"
                  >
                    ${m.label}
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>

          <!-- Dedicated Below-Video Dual Subtitle Stage -->
          <div class="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800">
            <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span>Live Dual Subtitles (.VTT Caption Track)</span>
              <span>Mode: ${state.subtitleMode.toUpperCase()}</span>
            </div>
            <div id="video-subtitle-below" class="min-h-[48px] flex flex-col justify-center"></div>
          </div>

          <!-- Progress Bar, Auto-Save Resume Status & Quick Seek Controls -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
            <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-2 font-bold">
                <span id="video-watched-label">
                  Watched: ${formatDuration(watchedSec)} / ${formatDuration(activeVideo.duration_sec)} (${pct}%)
                </span>
                ${
                  watchedSec > 0
                    ? `<button onclick="seekVideoTo(${watchedSec})" class="px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold hover:bg-indigo-500/25">
                        ↺ Resume at ${formatDuration(watchedSec)}
                      </button>`
                    : ''
                }
              </div>

              <div class="flex items-center gap-3">
                <span id="autosave-indicator" class="text-[11px] text-slate-400 font-medium">
                  Auto-saves every 5s • Last saved: ${formatDuration(watchedSec)}
                </span>
                ${
                  activeVideo.video_provider === 'mp4_url'
                    ? `<button onclick="seekVideoTo(${Math.ceil(activeVideo.duration_sec * 0.92)})" class="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25">
                        Test 90% (+20 XP)
                      </button>`
                    : ''
                }
              </div>
            </div>

            <!-- Visual Progress Bar with 90% Completion Marker -->
            <div class="relative h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                id="video-progress-bar-fill"
                class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                style="width: ${pct}%"
              ></div>
              <div
                class="absolute top-0 bottom-0 w-0.5 bg-amber-400"
                style="left: 90%"
                title="90% Completion Threshold (+20 XP)"
              ></div>
            </div>

            <!-- Interactive VTT Cue Timeline (Click any line to jump to that timestamp) -->
            ${
              enCues.length > 0
                ? `
              <details class="pt-2">
                <summary class="text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer select-none">
                  📜 Interactive Dual Transcript (${enCues.length} VTT Cues — Click any line to jump)
                </summary>
                <div class="mt-2.5 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  ${enCues
                    .map((cue, idx) => {
                      const mmCue = mmCues[idx];
                      return `
                      <div
                        data-cue-index="${idx}"
                        data-cue-start="${cue.start}"
                        data-cue-end="${cue.end}"
                        onclick="seekVideoTo(${cue.start})"
                        class="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-indigo-500/50 cursor-pointer transition flex items-start justify-between gap-3 text-xs"
                      >
                        <div class="space-y-0.5">
                          <div class="font-bold text-slate-800 dark:text-slate-200">${cue.text}</div>
                          ${mmCue ? `<div class="font-mm text-emerald-600 dark:text-emerald-400">${mmCue.text}</div>` : ''}
                        </div>
                        <span class="font-mono text-[11px] text-slate-400 shrink-0">${formatDuration(cue.start)}</span>
                      </div>
                    `;
                    })
                    .join('')}
                </div>
              </details>
            `
                : ''
            }
          </div>
        </div>
      `
          : `<div class="text-center py-8 text-sm text-slate-400">No videos added for this lesson yet. Click "+ Host / Add Video" above to add a YouTube Unlisted or MP4/Cloudflare R2 video.</div>`
      }
    </div>
  `;
}

function renderQuizRunnerSection(lesson) {
  const lessonQuizzes = state.quizzes.filter((q) => q.lesson_id === lesson.id);
  const prog = getLessonUserProgress(lesson.id);

  if (lessonQuizzes.length === 0) {
    return '';
  }

  if (state.quizFinished) {
    const total = lessonQuizzes.length;
    const correctCount = lessonQuizzes.filter((q) => state.quizAnswersLog[q.id]).length;
    const scorePct = Math.round((correctCount / Math.max(1, total)) * 100);
    const passed = scorePct >= 60;

    return `
      <div class="bg-white dark:bg-slate-900 border-2 ${
        passed ? 'border-emerald-500/50' : 'border-rose-500/50'
      } rounded-3xl p-6 sm:p-7 shadow-md space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
              passed
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            }">
              ${passed ? '🎉 Quiz Passed! (+30 XP Reward)' : '⚠️ Try Again to Pass (60% Required)'}
            </span>
            <h2 class="text-2xl font-extrabold">
              Your Score: ${scorePct}% (${correctCount} / ${total} Correct)
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mm">
              ${
                passed
                  ? 'ဂုဏ်ယူပါတယ်! ဉာဏ်စမ်းမေးခွန်း အောင်မြင်သဖြင့် +30 XP ရရှိပြီး သင်ခန်းစာ Completed ဖြစ်သွားပါပြီ။'
                  : 'အမှတ် ၆၀% အထက် ရရှိပါက +30 XP ရရှိမည်ဖြစ်ပါသည်။ ပြန်လည်ကြိုးစားကြည့်ပါ။'
              }
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              onclick="restartLessonQuiz()"
              class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition"
            >
              ↺ Retake Quiz
            </button>
          </div>
        </div>

        <!-- user_progress Model Record Summary -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span class="font-bold text-slate-500">user_progress record:</span>
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
              status: ${prog ? prog.status : 'not_started'}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              best score: ${prog ? prog.score : scorePct}%
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
              completed_at: ${prog && prog.completed_at ? new Date(prog.completed_at).toLocaleTimeString() : 'null'}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  const safeIdx = Math.min(state.quizIndex, lessonQuizzes.length - 1);
  const currentQuiz = lessonQuizzes[safeIdx];
  let parsedOptions = [];
  try {
    parsedOptions = JSON.parse(currentQuiz.options_json || '[]');
  } catch {
    parsedOptions = [];
  }

  const qTypeBadges = {
    mcq: { label: 'Multiple Choice (MCQ)', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' },
    fill_blank: { label: 'Fill in the Blank', color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400' },
    reorder: { label: 'Sentence Reorder', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  };
  const qBadge = qTypeBadges[currentQuiz.question_type] || qTypeBadges.mcq;

  let questionBodyHtml = '';
  if (currentQuiz.question_type === 'mcq') {
    questionBodyHtml = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        ${parsedOptions
          .map((opt) => {
            const safeOpt = String(opt).replace(/'/g, "\\'");
            const isSelected = state.quizUserAnswer === opt;
            let btnStyle =
              'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-500/50';
            if (state.quizFeedback) {
              if (opt.toLowerCase() === currentQuiz.correct_answer.toLowerCase()) {
                btnStyle =
                  'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold';
              } else if (isSelected && !state.quizFeedback.isCorrect) {
                btnStyle = 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-300';
              }
            } else if (isSelected) {
              btnStyle =
                'border-indigo-600 bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-500/20';
            }
            return `
              <button
                type="button"
                onclick="selectQuizOption('${safeOpt}')"
                class="p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm font-bold transition ${btnStyle}"
              >
                ${opt}
              </button>
            `;
          })
          .join('')}
      </div>
    `;
  } else if (currentQuiz.question_type === 'fill_blank') {
    questionBodyHtml = `
      <div class="space-y-3">
        <div>
          <input
            id="quiz-fill-blank-input"
            type="text"
            value="${state.quizUserAnswer.replace(/"/g, '&quot;')}"
            oninput="handleFillBlankInput(this.value)"
            ${state.quizFeedback ? 'disabled' : ''}
            placeholder="Type missing word here or tap a hint chip below..."
            class="w-full px-4 py-3 text-sm font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:outline-none focus:border-indigo-500"
          />
        </div>
        ${
          parsedOptions.length > 0
            ? `
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-bold text-slate-400">Word Bank Hints:</span>
            ${parsedOptions
              .map((opt) => {
                const safeOpt = String(opt).replace(/'/g, "\\'");
                const isSelected = state.quizUserAnswer.toLowerCase() === String(opt).toLowerCase();
                return `
                  <button
                    type="button"
                    onclick="selectQuizOption('${safeOpt}')"
                    class="px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500'
                    }"
                  >
                    ${opt}
                  </button>
                `;
              })
              .join('')}
          </div>
        `
            : ''
        }
      </div>
    `;
  } else if (currentQuiz.question_type === 'reorder') {
    questionBodyHtml = `
      <div class="space-y-3">
        <!-- Constructed Sentence Stage -->
        <div class="min-h-[54px] p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-1.5">
            ${
              state.quizReorderTokens.length > 0
                ? state.quizReorderTokens
                    .map((tok) => {
                      const safeTok = String(tok).replace(/'/g, "\\'");
                      return `
                        <button
                          type="button"
                          onclick="toggleReorderToken('${safeTok}')"
                          class="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-extrabold shadow-sm"
                        >
                          ${tok}
                        </button>
                      `;
                    })
                    .join('')
                : `<span class="text-xs text-slate-400 font-mm">အောက်ပါ စကားလုံးများကို အစီအစဉ်အတိုင်း တစ်ခုချင်းနှိပ်၍ ဝါကျတည်ဆောက်ပါ...</span>`
            }
          </div>
          ${
            state.quizReorderTokens.length > 0 && !state.quizFeedback
              ? `<button type="button" onclick="clearReorderTokens()" class="text-xs font-bold text-rose-500 hover:underline px-2">Clear</button>`
              : ''
          }
        </div>

        <!-- Available Word Tokens -->
        <div class="flex flex-wrap items-center gap-2">
          ${parsedOptions
            .map((tok) => {
              const safeTok = String(tok).replace(/'/g, "\\'");
              const isUsed = state.quizReorderTokens.includes(tok);
              return `
                <button
                  type="button"
                  onclick="toggleReorderToken('${safeTok}')"
                  class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition ${
                    isUsed
                      ? 'opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-500 shadow-sm'
                  }"
                >
                  ${tok}
                </button>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
      <!-- Quiz Runner Header -->
      <div class="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-extrabold text-base sm:text-lg">🧠 Interactive Lesson Quiz Runner</h2>
            <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              +30 XP on Pass
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-mm">
            သင်ခန်းစာ ဉာဏ်စမ်းမေးခွန်းများ (MCQ, Fill-in-the-blank, Reorder) • မှားယွင်းပါက မြန်မာဘာသာဖြင့် ရှင်းလင်းချက် ပြသပေးပါသည်။
          </p>
        </div>

        <div class="flex items-center gap-2 text-xs font-extrabold">
          <span class="px-2.5 py-1 rounded-xl ${qBadge.color}">
            ${qBadge.label}
          </span>
          <span class="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Q ${safeIdx + 1} / ${lessonQuizzes.length}
          </span>
        </div>
      </div>

      <!-- Question Prompt -->
      <div class="space-y-4">
        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
          ${currentQuiz.question_text}
        </h3>

        ${questionBodyHtml}
      </div>

      <!-- Instant Feedback & Myanmar Explanation Banner -->
      ${
        state.quizFeedback
          ? `
        <div class="p-4 sm:p-5 rounded-2xl border-2 ${
          state.quizFeedback.isCorrect
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
            : 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-200'
        } space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-extrabold">
              ${
                state.quizFeedback.isCorrect
                  ? '✅ Correct Answer! (အဖြေမှန်ကန်ပါသည်)'
                  : `❌ Incorrect • Correct Answer: "${state.quizFeedback.correctAnswer}"`
              }
            </span>
          </div>
          <div class="text-xs sm:text-sm font-mm leading-relaxed pt-1 border-t border-current/10">
            <strong class="font-bold">💡 မြန်မာရှင်းလင်းချက် (explanation_mm):</strong> ${
              state.quizFeedback.explanationMm
            }
          </div>
        </div>
      `
          : ''
      }

      <!-- Quiz Action Footer -->
      <div class="flex items-center justify-between pt-2">
        <div class="text-xs text-slate-400 font-semibold">
          ${
            prog && prog.status === 'completed'
              ? `✓ Best Score: ${prog.score}% (Completed)`
              : 'Pass with 60%+ to complete unit & earn +30 XP'
          }
        </div>

        ${
          !state.quizFeedback
            ? `
          <button
            type="button"
            onclick="submitQuizQuestion('${currentQuiz.id}')"
            class="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition"
          >
            Check Answer (အဖြေစစ်ရန်)
          </button>
        `
            : `
          <button
            type="button"
            onclick="nextQuizQuestion('${lesson.id}')"
            class="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition"
          >
            ${
              safeIdx + 1 < lessonQuizzes.length
                ? 'Next Question (နောက်တစ်ပုဒ်) →'
                : 'Finish Quiz & Claim +30 XP →'
            }
          </button>
        `
        }
      </div>
    </div>
  `;
}

function renderLessonDetailView(lesson) {
  const vocabs = state.vocabularies.filter((v) => v.lesson_id === lesson.id);
  const levelMeta = CEFR_LEVELS.find((l) => l.level === lesson.cefr_level) || CEFR_LEVELS[0];
  const prog = getLessonUserProgress(lesson.id);
  const isCompleted =
    (prog && prog.status === 'completed') || state.completedLessonIds.includes(lesson.id);

  return `
    <div class="space-y-6 pb-8">
      <!-- Top Bar with Back & Web Speech API Accent Toggle -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button onclick="openLesson(null)" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold shadow-sm">
          ← All Lessons (သင်ခန်းစာများ)
        </button>

        <div class="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span class="px-2 text-xs text-slate-500 font-semibold">Accent:</span>
          <button onclick="setAccent('en-US')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${state.accent === 'en-US' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}">
            🇺🇸 en-US
          </button>
          <button onclick="setAccent('en-GB')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${state.accent === 'en-GB' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}">
            🇬🇧 en-GB
          </button>
        </div>
      </div>

      <!-- Lesson Header -->
      <div class="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-white/15 text-white border border-white/20">
              CEFR ${lesson.cefr_level} • ${levelMeta.label_en}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Unit ${lesson.unit_number} (Order #${lesson.order_index})
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-extrabold ${
              isCompleted
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                : 'bg-amber-500/30 text-amber-200 border border-amber-400/30'
            }">
              ${isCompleted ? `✓ Completed (Score: ${prog ? prog.score : 100}%)` : 'Status: not_started'}
            </span>
          </div>

          ${
            isStrictAuthorizedAdmin(state.user)
              ? `
            <!-- 1-Click Quick Edit Buttons (Visible ONLY to Admin Account) -->
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onclick="openQuickAdminStudio('${lesson.id}', 'lessons')"
                class="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-md transition font-mm"
              >
                ✏️ သင်ခန်းစာ/သဒ္ဒါ ပြင်ရန်
              </button>
              <button
                type="button"
                onclick="openQuickAdminStudio('${lesson.id}', 'videos')"
                class="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-extrabold transition font-mm"
              >
                🎬 ဗီဒီယို/VTT ပြင်ရန်
              </button>
              <button
                type="button"
                onclick="openQuickAdminStudio('${lesson.id}', 'vocab_quiz')"
                class="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-extrabold transition font-mm"
              >
                📚 ဝေါဟာရ/Quiz ပြင်ရန်
              </button>
            </div>
          `
              : ''
          }
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">${lesson.title}</h1>
          ${lesson.title_mm ? `<p class="text-indigo-200 font-mm text-base sm:text-lg mt-1.5">${lesson.title_mm}</p>` : ''}
        </div>
      </div>

      <!-- Video Lesson Player Section (YouTube Unlisted & MP4/R2, Speed 0.75x-1.5x, Dual VTT Subtitles, 5s Auto-save & 90% +20 XP) -->
      ${renderVideoLessonSection(lesson)}

      <!-- Myanmar Grammar Notes -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
        <div class="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 class="font-bold text-base sm:text-lg">📖 Grammar Note (သဒ္ဒါရှင်းလင်းချက်)</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-mm">မြန်မာဘာသာဖြင့် အသေးစိတ် ရှင်းလင်းချက် (grammar_note_mm)</p>
          </div>
          <span class="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">MM Explanation</span>
        </div>
        <div class="font-mm text-sm sm:text-base text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed bg-slate-50/80 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">${lesson.grammar_note_mm}</div>
      </div>

      <!-- Vocabulary Cards with Web Speech API Listen Button & Personal Word Bank Bookmark -->
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="text-lg sm:text-xl font-extrabold flex items-center gap-2">
              <span>Lesson Vocabulary</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold">${vocabs.length} Words</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-mm">
              ဝေါဟာရများနှင့် အသံထွက်လေ့ကျင့်ရန် Listen ခလုတ်ကို နှိပ်ပါ (${state.accent}) • ⭐ နှိပ်၍ Word Bank သို့ သိမ်းဆည်းပါ
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3.5">
          ${vocabs
            .map((vocab, idx) => {
              const isSpeaking = state.speakingId === vocab.id;
              const revRec = getFlashcardReviewRecord(vocab.id);
              const isBookmarked = revRec && revRec.is_bookmarked;
              const safeWord = vocab.word_en.replace(/'/g, "\\'");
              const safeEx = vocab.example_en.replace(/'/g, "\\'");
              return `
              <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-sm transition">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="flex flex-wrap items-baseline gap-2.5">
                      <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">#${idx + 1}</span>
                      <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">${vocab.word_en}</h3>
                      <span class="text-xs sm:text-sm font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">${vocab.phonetic}</span>
                    </div>
                    <p class="font-mm text-base font-bold text-emerald-700 dark:text-emerald-400 pt-0.5">${vocab.meaning_mm}</p>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0">
                    <button
                      onclick="toggleBookmarkVocab('${vocab.id}')"
                      title="Bookmark to Personal Word Bank"
                      class="px-2.5 py-2 rounded-xl text-xs font-bold border transition ${
                        isBookmarked
                          ? 'bg-amber-500/15 text-amber-500 border-amber-500/40'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                      }"
                    >
                      ${isBookmarked ? '⭐ Saved' : '☆ Save'}
                    </button>

                    <button onclick="speakText('${safeWord}', '${vocab.id}')" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${isSpeaking ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/25' : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20'}">
                      🔊 <span>Listen</span>
                    </button>
                  </div>
                </div>

                <div class="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-3">
                  <div class="space-y-1 text-xs sm:text-sm">
                    <div class="text-slate-800 dark:text-slate-200 font-medium">“${vocab.example_en}”</div>
                    <p class="font-mm text-slate-500 dark:text-slate-400">${vocab.example_mm}</p>
                  </div>
                  <button onclick="speakText('${safeEx}', 'ex-${vocab.id}')" class="shrink-0 p-2 rounded-xl text-xs text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Listen to example">
                    🔊
                  </button>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>

      <!-- Interactive Quiz Runner Section (mcq, fill_blank, reorder + +30 XP on Pass) -->
      ${renderQuizRunnerSection(lesson)}

      <!-- Complete Lesson Card -->
      <div class="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <h3 class="font-extrabold text-base sm:text-lg">
            ${isCompleted ? '✅ Lesson Completed! (သင်ခန်းစာ ပြီးမြောက်ပါပြီ)' : '✨ Pass the Quiz Above (+30 XP) or Mark Unit Completed'}
          </h3>
          <p class="text-xs text-indigo-100 font-mm">သဒ္ဒါ၊ ဝေါဟာရ ${vocabs.length} လုံးနှင့် ဉာဏ်စမ်းမေးခွန်းများကို လေ့လာပြီးပါက XP ရယူပါ။</p>
        </div>
        <button onclick="completeLesson('${lesson.id}')" class="w-full sm:w-auto px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition shadow-md ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-700 hover:bg-indigo-50'}">
          ${isCompleted ? 'Completed' : 'Mark Completed (+25 XP)'}
        </button>
      </div>
    </div>
  `;
}

function renderLessonsView() {
  if (state.activeLessonId) {
    const lesson = state.lessons.find((l) => l.id === state.activeLessonId);
    if (lesson) return renderLessonDetailView(lesson);
  }

  const publishedLessons = state.lessons.filter((l) => l.is_published !== false);

  const filteredLessons = publishedLessons
    .filter((l) => l.cefr_level === state.selectedLevel)
    .sort((a, b) => a.order_index - b.order_index);
  const currentLevelMeta = CEFR_LEVELS.find((l) => l.level === state.selectedLevel) || CEFR_LEVELS[0];

  return `
    <div class="space-y-6 pb-8">
      <!-- Header & Accent Switcher -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight">
            CEFR Lessons • <span class="font-mm text-xl">သင်ခန်းစာများ</span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mm mt-0.5">
            A1 မှ C1 အဆင့်အလိုက် ဗီဒီယို၊ သဒ္ဒါနှင့် ဝေါဟာရယူနစ်များကို ရွေးချယ်လေ့လာပါ။
          </p>
        </div>

        <div class="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span class="text-xs text-slate-400 pl-2">🔊</span>
          <button onclick="setAccent('en-US')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${state.accent === 'en-US' ? 'bg-indigo-600 text-white' : 'text-slate-500'}">
            🇺🇸 en-US
          </button>
          <button onclick="setAccent('en-GB')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${state.accent === 'en-GB' ? 'bg-indigo-600 text-white' : 'text-slate-500'}">
            🇬🇧 en-GB
          </button>
        </div>
      </div>

      <!-- CEFR Level Filter Tabs (A1, A2, B1, B2, C1) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        ${CEFR_LEVELS.map((item) => {
          const isActive = item.level === state.selectedLevel;
          const count = publishedLessons.filter((l) => l.cefr_level === item.level).length;
          return `
            <button onclick="selectLevel('${item.level}')" class="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm border transition-all ${isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40'}">
              <span class="text-base font-extrabold">${item.level}</span>
              <div class="text-left leading-tight">
                <div class="text-[11px] font-semibold opacity-90">${item.label_en}</div>
                <div class="text-[10px] font-mm ${isActive ? 'text-indigo-100' : 'text-slate-400'}">${count} ${count === 1 ? 'Unit' : 'Units'}</div>
              </div>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Level Info Banner -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-br ${currentLevelMeta.color} text-white font-extrabold text-base flex items-center justify-center shadow-md">
            ${state.selectedLevel}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-extrabold text-base">Level ${state.selectedLevel}: ${currentLevelMeta.label_en}</h2>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-md border ${currentLevelMeta.badgeBg}">${filteredLessons.length} Units</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-mm">${currentLevelMeta.label_mm} • ဗီဒီယို၊ သဒ္ဒါနှင့် ဝေါဟာရ သင်ခန်းစာများ</p>
          </div>
        </div>

        ${
          isStrictAuthorizedAdmin(state.user)
            ? `
          <button
            type="button"
            onclick="openQuickAdminStudio(null, 'lessons')"
            class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold shadow-md transition flex items-center gap-1.5 font-mm"
          >
            <span>🛠️ သင်ခန်းစာအသစ်ထည့်ရန် / ပြင်ဆင်ရန်</span>
          </button>
        `
            : ''
        }
      </div>

      <!-- Unit Cards List -->
      <div class="grid grid-cols-1 gap-4">
        ${filteredLessons
          .map((lesson) => {
            const lessonVocabs = state.vocabularies.filter((v) => v.lesson_id === lesson.id);
            const lessonVids = state.lessonVideos.filter((v) => v.lesson_id === lesson.id);
            const isCompleted = state.completedLessonIds.includes(lesson.id);

            return `
            <div onclick="openLesson('${lesson.id}')" class="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/60 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-3.5 sm:gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${currentLevelMeta.color} text-white flex flex-col items-center justify-center shrink-0 shadow-md">
                    <span class="text-[10px] font-bold uppercase tracking-wider opacity-85">Unit</span>
                    <span class="text-lg font-extrabold leading-none">${lesson.unit_number}</span>
                  </div>

                  <div class="space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${currentLevelMeta.badgeBg}">
                        ${lesson.cefr_level} • Unit ${lesson.unit_number}
                      </span>
                      <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        🎬 ${lessonVids.length} ${lessonVids.length === 1 ? 'Video' : 'Videos'}
                      </span>
                      <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        📚 ${lessonVocabs.length} Vocabulary Words
                      </span>
                      ${isCompleted ? `<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">✓ Completed</span>` : ''}
                    </div>

                    <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      ${lesson.title}
                    </h3>

                    ${lesson.title_mm ? `<p class="text-sm font-mm font-semibold text-indigo-600 dark:text-indigo-400">${lesson.title_mm}</p>` : ''}

                    <p class="text-xs sm:text-sm font-mm text-slate-500 dark:text-slate-400 line-clamp-2 pt-1">
                      ${lesson.grammar_note_mm.replace(/\n+/g, ' ').slice(0, 140)}...
                    </p>
                  </div>
                </div>

                <div class="shrink-0 self-center flex items-center gap-2">
                  ${
                    isStrictAuthorizedAdmin(state.user)
                      ? `
                    <button
                      type="button"
                      onclick="event.stopPropagation(); openQuickAdminStudio('${lesson.id}', 'lessons')"
                      class="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-extrabold transition font-mm"
                    >
                      ✏️ ပြင်ဆင်ရန်
                    </button>
                  `
                      : ''
                  }
                  <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition font-bold">
                    →
                  </div>
                </div>
              </div>

              <div class="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div class="flex flex-wrap items-center gap-1.5">
                  ${lessonVocabs
                    .slice(0, 5)
                    .map(
                      (v) => `
                    <span class="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-medium">
                      ${v.word_en} <span class="text-slate-400 font-mm">(${v.meaning_mm.split('/')[0].trim()})</span>
                    </span>
                  `
                    )
                    .join('')}
                </div>
                <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">🎬 Watch Video & Grammar →</span>
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    </div>
  `;
}

function renderFlashcardsView() {
  const user = state.user;
  const now = Date.now();

  const dueCount = state.vocabularies.filter((v) => {
    const rec = getFlashcardReviewRecord(v.id);
    return rec && new Date(rec.next_review_at).getTime() <= now;
  }).length;

  const bookmarkedVocabs = state.vocabularies.filter((v) => {
    const rec = getFlashcardReviewRecord(v.id);
    return rec && rec.is_bookmarked;
  });

  const filteredVocabs = state.vocabularies.filter((v) => {
    const les = state.lessons.find((l) => l.id === v.lesson_id);
    const levelMatch =
      state.flashcardLevel === 'ALL' || (les && les.cefr_level === state.flashcardLevel);
    if (!levelMatch) return false;

    const rec = getFlashcardReviewRecord(v.id);
    if (state.flashcardDeckMode === 'due') {
      return rec && new Date(rec.next_review_at).getTime() <= now;
    }
    if (state.flashcardDeckMode === 'bookmarked') {
      return rec && rec.is_bookmarked;
    }
    return true;
  });

  const safeIdx =
    filteredVocabs.length > 0 ? Math.min(state.flashcardIndex, filteredVocabs.length - 1) : 0;
  const card = filteredVocabs[safeIdx];
  const cardLesson = card ? state.lessons.find((l) => l.id === card.lesson_id) : null;
  const cardReview = card ? getFlashcardReviewRecord(card.id) : null;

  // Compute preview intervals for rating buttons
  const curEase = cardReview ? Number(cardReview.ease_factor || 2.5) : 2.5;
  const curInt = cardReview ? Number(cardReview.interval_days || 1) : 1;
  const goodInt = curInt <= 1 ? 3 : Math.max(2, Math.round(curInt * curEase));
  const easyInt = curInt <= 1 ? 4 : Math.max(4, Math.round(curInt * (curEase + 0.15) * 1.3));

  return `
    <div class="space-y-6 pb-8">
      <!-- Header & Accent Switcher -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight">
            SRS Flashcards • <span class="font-mm text-xl">ဝေါဟာရ ကတ်ပြားများ</span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mm">
            Spaced Repetition (Again / Good / Easy) စနစ်ဖြင့် ဝေါဟာရများကို ရေရှည်မှတ်မိအောင် လေ့ကျင့်ပါ။
          </p>
        </div>

        <div class="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button onclick="setAccent('en-US')" class="px-2.5 py-1 rounded-lg text-xs font-bold ${
            state.accent === 'en-US' ? 'bg-indigo-600 text-white' : 'text-slate-500'
          }">🇺🇸 en-US</button>
          <button onclick="setAccent('en-GB')" class="px-2.5 py-1 rounded-lg text-xs font-bold ${
            state.accent === 'en-GB' ? 'bg-indigo-600 text-white' : 'text-slate-500'
          }">🇬🇧 en-GB</button>
        </div>
      </div>

      <!-- SRS Deck Mode Tabs (All Deck / Due for Review / Personal Word Bank) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onclick="setFlashcardDeckMode('all')"
          class="p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
            state.flashcardDeckMode === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }"
        >
          <div>
            <div class="text-xs font-extrabold">🗂️ All Flashcards</div>
            <div class="text-[11px] font-mm opacity-80">ဝေါဟာရအားလုံး လေ့ကျင့်ရန်</div>
          </div>
          <span class="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-black/15">
            ${state.vocabularies.length}
          </span>
        </button>

        <button
          onclick="setFlashcardDeckMode('due')"
          class="p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
            state.flashcardDeckMode === 'due'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }"
        >
          <div>
            <div class="text-xs font-extrabold">⏰ Due for SRS Review</div>
            <div class="text-[11px] font-mm opacity-80">ပြန်လည်လေ့ကျင့်ရမည့် ကတ်များ</div>
          </div>
          <span class="px-2.5 py-1 rounded-xl text-xs font-extrabold ${
            state.flashcardDeckMode === 'due'
              ? 'bg-white/20 text-white'
              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          }">
            ${dueCount}
          </span>
        </button>

        <button
          onclick="setFlashcardDeckMode('bookmarked')"
          class="p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
            state.flashcardDeckMode === 'bookmarked'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }"
        >
          <div>
            <div class="text-xs font-extrabold">⭐ Personal Word Bank</div>
            <div class="text-[11px] font-mm opacity-80">မှတ်သားထားသော ခက်ခဲဝေါဟာရများ</div>
          </div>
          <span class="px-2.5 py-1 rounded-xl text-xs font-extrabold ${
            state.flashcardDeckMode === 'bookmarked'
              ? 'bg-white/20 text-white'
              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
          }">
            ${bookmarkedVocabs.length}
          </span>
        </button>
      </div>

      <!-- CEFR Level Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button onclick="setFlashcardLevel('ALL')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold border ${
          state.flashcardLevel === 'ALL'
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }">
          All Levels
        </button>
        ${CEFR_LEVELS.map(
          (l) => `
          <button onclick="setFlashcardLevel('${l.level}')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold border ${
            state.flashcardLevel === l.level
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }">
            ${l.level}
          </button>
        `
        ).join('')}
      </div>

      ${
        state.srsToastMessage
          ? `<div class="max-w-lg mx-auto p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold text-center">
              ${state.srsToastMessage}
            </div>`
          : ''
      }

      ${
        card
          ? `
        <div class="max-w-lg mx-auto space-y-5">
          <!-- Card Meta & SRS Parameters Bar -->
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500">
            <span>Card ${safeIdx + 1} of ${filteredVocabs.length} (Swipe or Tap to Flip)</span>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                ease: ${curEase}
              </span>
              <span class="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono">
                interval: ${curInt}d
              </span>
            </div>
          </div>

          <!-- Swipe / Tap Interactive Flashcard -->
          <div
            onclick="flipFlashcard()"
            ontouchstart="handleCardTouchStart(event)"
            ontouchend="handleCardTouchEnd(event, ${filteredVocabs.length})"
            class="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/60 rounded-3xl p-7 sm:p-10 min-h-[320px] flex flex-col justify-between shadow-xl cursor-pointer select-none transition"
          >
            <!-- Top Row: Unit Badge, Audio Listen & Bookmark Toggle -->
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                ${cardLesson ? `${cardLesson.cefr_level} • Unit ${cardLesson.unit_number}` : ''}
              </span>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onclick="event.stopPropagation(); toggleBookmarkVocab('${card.id}')"
                  title="Bookmark to Personal Word Bank"
                  class="px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                    cardReview && cardReview.is_bookmarked
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }"
                >
                  ${cardReview && cardReview.is_bookmarked ? '⭐ Bookmarked' : '☆ Bookmark'}
                </button>

                <button
                  type="button"
                  onclick="event.stopPropagation(); speakText('${card.word_en.replace(/'/g, "\\'")}', '${card.id}')"
                  class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                >
                  🔊 Listen (${state.accent})
                </button>
              </div>
            </div>

            <!-- Card Body: Front (English word + phonetic + audio) vs Back (Myanmar meaning + example sentence) -->
            ${
              !state.flashcardFlipped
                ? `
              <div class="my-8 text-center space-y-2.5">
                <span class="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">FRONT • ENGLISH</span>
                <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">${card.word_en}</h2>
                <p class="text-base sm:text-lg font-mono text-indigo-600 dark:text-indigo-400">${card.phonetic}</p>
                <p class="text-xs text-slate-400 pt-4 font-mm">
                  မြန်မာအဓိပ္ပာယ်နှင့် နမူနာဝါကျ ကြည့်ရန် ကတ်ကို နှိပ်ပါ (သို့) ဘေးသို့ပွတ်ဆွဲပါ
                </p>
              </div>
            `
                : `
              <div class="my-5 text-center space-y-4">
                <div>
                  <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">BACK • MYANMAR MEANING & EXAMPLE</span>
                  <div class="text-xs font-bold text-slate-400 mt-0.5">${card.word_en} (${card.phonetic})</div>
                  <h3 class="text-2xl sm:text-3xl font-extrabold font-mm text-emerald-600 dark:text-emerald-400 mt-1">
                    ${card.meaning_mm}
                  </h3>
                </div>
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 text-left space-y-1.5 border border-slate-200/60 dark:border-slate-700/60">
                  <div class="flex items-start justify-between gap-2">
                    <p class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">“${card.example_en}”</p>
                    <button
                      type="button"
                      onclick="event.stopPropagation(); speakText('${card.example_en.replace(/'/g, "\\'")}', 'ex-${card.id}')"
                      class="shrink-0 px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold"
                    >
                      🔊
                    </button>
                  </div>
                  <p class="text-xs sm:text-sm font-mm text-slate-600 dark:text-slate-300">${card.example_mm}</p>
                </div>
              </div>
            `
            }

            <div class="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span>🔄 Tap to flip (English ⇄ မြန်မာ)</span>
              <span>Next review: ${
                cardReview ? new Date(cardReview.next_review_at).toLocaleDateString() : 'Today'
              }</span>
            </div>
          </div>

          <!-- SRS Rating Buttons: "Again", "Good", "Easy" -->
          <div class="space-y-2">
            <div class="text-center text-xs font-bold text-slate-500 dark:text-slate-400 font-mm">
              ဤစကားလုံးကို မည်မျှမှတ်မိသနည်း။ (Rate to schedule next_review_at):
            </div>
            <div class="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onclick="rateFlashcardSRS('${card.id}', 'again', ${filteredVocabs.length})"
                class="p-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-center transition shadow-sm"
              >
                <div class="text-xs sm:text-sm font-extrabold">Again (ပြန်လေ့ကျင့်)</div>
                <div class="text-[11px] opacity-80 font-mono">1d • ease ${Math.max(1.3, Number((curEase - 0.2).toFixed(2)))}</div>
              </button>

              <button
                type="button"
                onclick="rateFlashcardSRS('${card.id}', 'good', ${filteredVocabs.length})"
                class="p-3 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-center transition shadow-sm"
              >
                <div class="text-xs sm:text-sm font-extrabold">Good (မှတ်မိသည်)</div>
                <div class="text-[11px] opacity-80 font-mono">${goodInt}d • +5 XP</div>
              </button>

              <button
                type="button"
                onclick="rateFlashcardSRS('${card.id}', 'easy', ${filteredVocabs.length})"
                class="p-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center transition shadow-sm"
              >
                <div class="text-xs sm:text-sm font-extrabold">Easy (လွယ်ကူသည်)</div>
                <div class="text-[11px] opacity-80 font-mono">${easyInt}d • +10 XP</div>
              </button>
            </div>
          </div>

          <!-- Previous / Next Navigation Controls -->
          <div class="flex items-center justify-between gap-3 pt-1">
            <button onclick="prevFlashcard(${filteredVocabs.length})" class="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold">
              ← Previous Card
            </button>
            <button onclick="nextFlashcard(${filteredVocabs.length})" class="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold">
              Next Card →
            </button>
          </div>
        </div>
      `
          : `
        <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <div class="text-2xl">🎉</div>
          <h3 class="text-base font-extrabold">No flashcards match this filter right now!</h3>
          <p class="text-xs text-slate-500 font-mm">
            ရွေးချယ်ထားသော အမျိုးအစားတွင် ကတ်ပြားမရှိသေးပါ။ All Flashcards သို့ ပြောင်းကြည့်ပါ။
          </p>
          <button onclick="setFlashcardDeckMode('all'); setFlashcardLevel('ALL')" class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
            Show All Flashcards
          </button>
        </div>
      `
      }

      <!-- Personal Word Bank Section (Bookmarked Hard Words) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="text-base sm:text-lg font-extrabold flex items-center gap-2">
              <span>⭐ Personal Word Bank (မှတ်သားထားသော ဝေါဟာရများ)</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                ${bookmarkedVocabs.length} Saved
              </span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-mm">
              Bookmark (⭐) နှိပ်၍ သိမ်းဆည်းထားသော ခက်ခဲသည့် ဝေါဟာရများ (` + '`flashcard_reviews.is_bookmarked`' + `)
            </p>
          </div>
        </div>

        ${
          bookmarkedVocabs.length > 0
            ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${bookmarkedVocabs
              .map((v) => {
                const rev = getFlashcardReviewRecord(v.id);
                const safeWord = v.word_en.replace(/'/g, "\\'");
                return `
                  <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-start justify-between gap-3">
                    <div class="space-y-0.5">
                      <div class="flex items-baseline gap-2">
                        <span class="font-extrabold text-sm">${v.word_en}</span>
                        <span class="text-xs font-mono text-indigo-500">${v.phonetic}</span>
                      </div>
                      <div class="text-xs font-mm font-bold text-emerald-600 dark:text-emerald-400">${v.meaning_mm}</div>
                      <div class="text-[11px] text-slate-400 font-mono">
                        ease: ${rev.ease_factor} • interval: ${rev.interval_days}d • next: ${new Date(rev.next_review_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div class="flex items-center gap-1 shrink-0">
                      <button
                        onclick="speakText('${safeWord}', 'wb-${v.id}')"
                        class="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold"
                        title="Listen"
                      >
                        🔊
                      </button>
                      <button
                        onclick="toggleBookmarkVocab('${v.id}')"
                        class="p-2 rounded-xl bg-amber-500/15 text-amber-500 text-xs font-bold"
                        title="Remove from Word Bank"
                      >
                        ⭐
                      </button>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        `
            : `<div class="text-xs text-slate-400 font-mm">သိမ်းဆည်းထားသော ဝေါဟာရ မရှိသေးပါ။ ကတ်ပြားပေါ်ရှိ ☆ Bookmark ခလုတ်ကို နှိပ်၍ သိမ်းဆည်းနိုင်ပါသည်။</div>`
        }
      </div>
    </div>
  `;
}

function renderProfileView() {
  const user = state.user;
  const userProgressList = state.userVideoProgress.filter((p) => p.user_id === user.id);
  const lessonProgressList = state.userProgress.filter((p) => p.user_id === user.id);
  const srsReviewsList = state.flashcardReviews.filter((r) => r.user_id === user.id);

  return `
    <div class="space-y-6 pb-8">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight">
          User Profile • <span class="font-mm text-xl">ကိုယ်ရေးအချက်အလက်</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mm">
          သင်၏ အဆင့် (CEFR Level)၊ XP အမှတ်များနှင့် ဗီဒီယိုကြည့်ရှုမှု မှတ်တမ်းများ။
        </p>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-extrabold">${user.name}</h2>
                <span class="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">${user.role}</span>
              </div>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">${user.email}</p>
            </div>
          </div>

          <button onclick="logoutUser()" class="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
            Sign Out (ထွက်ရန်)
          </button>
        </div>

        <!-- User Model Schema Fields -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">User Model Attributes</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div class="text-xs text-slate-500 font-semibold">current_level</div>
              <div class="text-xl font-extrabold mt-1 text-indigo-600 dark:text-indigo-400">${user.current_level}</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div class="text-xs text-slate-500 font-semibold">xp_points</div>
              <div class="text-xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">${user.xp_points} XP</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div class="text-xs text-slate-500 font-semibold">streak_count</div>
              <div class="text-xl font-extrabold mt-1 text-orange-600 dark:text-orange-400">${user.streak_count} Days</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div class="text-xs text-slate-500 font-semibold">last_active_date</div>
              <div class="text-sm font-extrabold mt-2">${user.last_active_date}</div>
            </div>
          </div>
        </div>

        <!-- CEFR Level Switcher (Self-Assigning Admin is Disabled) -->
        <div class="pt-2">
          <label class="block text-xs font-bold mb-1.5">Change Current CEFR Level (current_level)</label>
          <div class="grid grid-cols-5 gap-1.5">
            ${CEFR_LEVELS.map(
              (l) => `
              <button onclick="updateUserField('current_level', '${l.level}')" class="py-2 rounded-xl text-xs font-extrabold border ${user.current_level === l.level ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}">
                ${l.level}
              </button>
            `
            ).join('')}
          </div>
        </div>
      </div>

      <!-- User Lesson & Quiz Progress Table (user_progress model) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
        <h3 class="font-extrabold text-base">
          Lesson & Quiz Progress (<code class="text-xs text-indigo-500">user_progress</code>)
        </h3>
        <div class="space-y-2">
          ${
            lessonProgressList.length > 0
              ? lessonProgressList
                  .map((lp) => {
                    const les = state.lessons.find((l) => l.id === lp.lesson_id);
                    return `
                    <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <div class="font-extrabold">${les ? `${les.cefr_level} Unit ${les.unit_number}: ${les.title}` : lp.lesson_id}</div>
                        <div class="text-slate-400">lesson_id: ${lp.lesson_id} • completed_at: ${
                          lp.completed_at ? new Date(lp.completed_at).toLocaleString() : 'null'
                        }</div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                          score: ${lp.score}%
                        </span>
                        <span class="px-2.5 py-1 rounded-lg font-bold ${
                          lp.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }">
                          status: ${lp.status}
                        </span>
                      </div>
                    </div>
                  `;
                  })
                  .join('')
              : `<div class="text-xs text-slate-400">No lesson progress recorded yet.</div>`
          }
        </div>
      </div>

      <!-- SRS Flashcard Reviews Table (flashcard_reviews model) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
        <h3 class="font-extrabold text-base">
          SRS Flashcard Reviews (<code class="text-xs text-indigo-500">flashcard_reviews</code>)
        </h3>
        <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
          ${
            srsReviewsList.length > 0
              ? srsReviewsList
                  .map((r) => {
                    const voc = state.vocabularies.find((v) => v.id === r.vocab_id);
                    return `
                    <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <div class="font-extrabold">${voc ? `${voc.word_en} (${voc.meaning_mm})` : r.vocab_id}</div>
                        <div class="text-slate-400">vocab_id: ${r.vocab_id} • next_review_at: ${new Date(r.next_review_at).toLocaleString()}</div>
                      </div>
                      <div class="flex flex-wrap items-center gap-1.5">
                        <span class="px-2 py-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-700 font-mono">
                          ease_factor: ${r.ease_factor}
                        </span>
                        <span class="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono">
                          interval_days: ${r.interval_days}
                        </span>
                        <span class="px-2 py-0.5 rounded-lg font-bold ${
                          r.is_bookmarked
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }">
                          is_bookmarked: ${r.is_bookmarked}
                        </span>
                      </div>
                    </div>
                  `;
                  })
                  .join('')
              : `<div class="text-xs text-slate-400">No SRS reviews recorded yet.</div>`
          }
        </div>
      </div>

      <!-- User Video Progress Table (user_video_progress model) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
        <h3 class="font-extrabold text-base">
          Saved Video Progress (<code class="text-xs text-indigo-500">user_video_progress</code>)
        </h3>
        <div class="space-y-2">
          ${
            userProgressList.length > 0
              ? userProgressList
                  .map((p) => {
                    const vid = state.lessonVideos.find((v) => v.id === p.video_id);
                    return `
                    <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <div class="font-extrabold">${vid ? vid.title : p.video_id}</div>
                        <div class="text-slate-400">video_id: ${p.video_id} • updated_at: ${new Date(p.updated_at).toLocaleTimeString()}</div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                          watched_seconds: ${p.watched_seconds}s
                        </span>
                        <span class="px-2.5 py-1 rounded-lg font-bold ${
                          p.is_completed
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }">
                          is_completed: ${p.is_completed}
                        </span>
                      </div>
                    </div>
                  `;
                  })
                  .join('')
              : `<div class="text-xs text-slate-400">No video progress recorded yet.</div>`
          }
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// PROTECTED ADMIN DASHBOARD VIEW (/studio-manage-9x2k)
// 1. Accessible ONLY via secret route /studio-manage-9x2k (no links anywhere in UI)
// 2. Requires user.email === 'aingdy924@gmail.com' AND user.role === 'admin'
// 3. Unauthorized visitors are immediately & silently redirected to /
// 4. Requires 6-digit ADMIN_PIN once per session before unlocking
// ============================================================================
function renderAdminDashboardView() {
  const user = state.user;

  // Strict Single-Admin Route Guard: Immediately redirect unauthorized visitors to /
  // without showing any admin UI or error details
  if (!isStrictAuthorizedAdmin(user)) {
    silentRedirectToRoot();
    return renderHomeView();
  }

  // Session 6-digit ADMIN_PIN Gate (even after logging in with aingdy924@gmail.com)
  if (!isAdminPinUnlockedForSession()) {
    return `
      <div class="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 sm:p-8 shadow-xl space-y-5">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl mx-auto font-extrabold">
            🔐
          </div>
          <span class="px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            ADMIN_PIN Session Verification
          </span>
          <h1 class="text-xl font-extrabold">Enter 6-Digit Admin PIN</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Authenticated as <strong class="text-slate-800 dark:text-slate-200">${user.email}</strong>. Enter your 6-digit <code class="font-mono">ADMIN_PIN</code> to unlock <code class="font-mono">/studio-manage-9x2k</code> for this session.
          </p>
        </div>

        ${
          state.adminPinError
            ? `<div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold text-center">
                ${state.adminPinError}
              </div>`
            : ''
        }

        <form onsubmit="handleAdminPinSubmit(event)" class="space-y-4">
          <div>
            <input
              id="admin-pin-input"
              type="password"
              inputmode="numeric"
              maxlength="6"
              pattern="\\d{6}"
              placeholder="••••••"
              required
              autofocus
              class="w-full text-center tracking-[0.5em] text-xl font-mono font-extrabold px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            class="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm shadow-lg transition"
          >
            Unlock Studio Management
          </button>
        </form>
      </div>
    `;
  }

  const editingLesson = state.editingLessonId
    ? state.lessons.find((l) => l.id === state.editingLessonId)
    : null;

  const levelLessons = state.lessons
    .filter((l) => l.cefr_level === state.adminSelectedLevel)
    .sort((a, b) => a.order_index - b.order_index);

  const selectedLesson =
    state.lessons.find((l) => l.id === state.adminSelectedLessonId) || state.lessons[0] || null;

  const editingVideo = state.editingVideoId
    ? state.lessonVideos.find((v) => v.id === state.editingVideoId)
    : null;

  const editingVocab = state.editingVocabId
    ? state.vocabularies.find((v) => v.id === state.editingVocabId)
    : null;

  const editingQuiz = state.editingQuizId
    ? state.quizzes.find((q) => q.id === state.editingQuizId)
    : null;

  const lessonVideosForUnit = selectedLesson
    ? state.lessonVideos
        .filter((v) => v.lesson_id === selectedLesson.id)
        .sort((a, b) => a.order_index - b.order_index)
    : [];

  const vocabsForUnit = selectedLesson
    ? state.vocabularies.filter((v) => v.lesson_id === selectedLesson.id)
    : [];

  const quizzesForUnit = selectedLesson
    ? state.quizzes.filter((q) => q.lesson_id === selectedLesson.id)
    : [];

  let subTabContent = '';

  // --------------------------------------------------------------------------
  // SUB-TAB 1: LESSONS MANAGER (Create, Edit, Reorder, Delete across A1-C1 + Live Grammar Preview + Draft/Published Toggle + Inline Vocab/Quiz Editor)
  // --------------------------------------------------------------------------
  if (state.adminSubTab === 'lessons') {
    const activeGrammarVal = editingLesson
      ? state.adminDraftGrammarMm || editingLesson.grammar_note_mm || ''
      : state.adminDraftGrammarMm || '';
    const isDraftPublished = editingLesson
      ? state.adminDraftIsPublished !== false
      : state.adminDraftIsPublished !== false;

    const inlineLessonVocabs = editingLesson
      ? state.vocabularies.filter((v) => v.lesson_id === editingLesson.id)
      : [];
    const inlineLessonQuizzes = editingLesson
      ? state.quizzes.filter((q) => q.lesson_id === editingLesson.id)
      : [];

    let inlineEditQuizOptsRaw = '';
    if (editingQuiz) {
      try {
        inlineEditQuizOptsRaw = JSON.parse(editingQuiz.options_json).join(', ');
      } catch {
        inlineEditQuizOptsRaw = editingQuiz.options_json;
      }
    }

    subTabContent = `
      <div class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <!-- Create / Edit Lesson Form -->
          <div class="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 h-fit">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 class="font-extrabold text-base">
                  ${editingLesson ? `✏️ Edit Lesson (${editingLesson.id})` : '➕ Create New Lesson'}
                </h2>
                <p class="text-xs text-slate-500 font-mm">A1 မှ C1 သင်ခန်းစာအသစ် ထည့်သွင်းရန် / ပြင်ဆင်ရန်</p>
              </div>
              ${
                editingLesson
                  ? `<button onclick="cancelEditLesson()" class="text-xs font-bold text-rose-500 hover:underline">Cancel Edit</button>`
                  : ''
              }
            </div>

            <form onsubmit="handleAdminLessonSubmit(event)" class="space-y-3.5 text-xs sm:text-sm">
              <div class="grid grid-cols-3 gap-2.5">
                <div>
                  <label class="block text-xs font-bold mb-1">CEFR Level</label>
                  <select name="cefr_level" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold">
                    ${CEFR_LEVELS.map(
                      (l) => `
                      <option value="${l.level}" ${
                        (editingLesson ? editingLesson.cefr_level : state.adminSelectedLevel) ===
                        l.level
                          ? 'selected'
                          : ''
                      }>${l.level}</option>
                    `
                    ).join('')}
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold mb-1">Unit #</label>
                  <input
                    name="unit_number"
                    type="number"
                    min="1"
                    value="${editingLesson ? editingLesson.unit_number : levelLessons.length + 1}"
                    required
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold mb-1">order_index</label>
                  <input
                    name="order_index"
                    type="number"
                    min="1"
                    value="${editingLesson ? editingLesson.order_index : levelLessons.length + 1}"
                    required
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <!-- Draft vs Published Status Toggle -->
              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div class="text-xs font-extrabold">Visibility Status (<code class="font-mono">is_published</code>)</div>
                  <div class="text-[11px] text-slate-500 font-mm">Published သင်ခန်းစာများကိုသာ ကျောင်းသားများ မြင်တွေ့နိုင်သည်</div>
                </div>
                <input
                  id="admin-is-published-input"
                  type="hidden"
                  name="is_published"
                  value="${isDraftPublished ? 'true' : 'false'}"
                />
                <button
                  id="admin-draft-pub-btn"
                  type="button"
                  onclick="toggleAdminDraftPublished()"
                  class="px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition flex items-center gap-1.5 ${
                    isDraftPublished
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }"
                >
                  <span>${isDraftPublished ? '🟢 Published (Live)' : '📝 Draft (Hidden)'}</span>
                </button>
              </div>

              <div>
                <label class="block text-xs font-bold mb-1">Lesson Title (English)</label>
                <input
                  name="title"
                  type="text"
                  value="${editingLesson ? editingLesson.title.replace(/"/g, '&quot;') : ''}"
                  placeholder="e.g. Ordering at a Restaurant"
                  required
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label class="block text-xs font-bold mb-1 font-mm">မြန်မာခေါင်းစဉ် (title_mm)</label>
                <input
                  name="title_mm"
                  type="text"
                  value="${editingLesson && editingLesson.title_mm ? editingLesson.title_mm.replace(/"/g, '&quot;') : ''}"
                  placeholder="ဥပမာ - စားသောက်ဆိုင်တွင် အစားအသောက်မှာယူခြင်း"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mm"
                />
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-bold font-mm">
                    Myanmar Grammar Explanation (<code class="font-mono">grammar_note_mm</code>)
                  </label>
                  <span class="text-[10px] font-bold text-indigo-500">Supports **bold**, \`code\`, • bullets</span>
                </div>
                <textarea
                  name="grammar_note_mm"
                  rows="5"
                  required
                  oninput="handleGrammarNoteLiveInput(this.value)"
                  placeholder="မြန်မာဘာသာဖြင့် သဒ္ဒါရှင်းလင်းချက်နှင့် ဥပမာဝါကျများကို ရေးသားပါ..."
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mm"
                >${activeGrammarVal}</textarea>
              </div>

              <!-- Live Markdown / Text Preview for grammar_note_mm -->
              <div class="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/50 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    👁️ Live Markdown / Text Preview (Student View)
                  </span>
                  <span class="text-[10px] text-slate-400">Real-time sync</span>
                </div>
                <div
                  id="admin-grammar-live-preview"
                  class="text-xs sm:text-sm font-mm leading-relaxed text-slate-700 dark:text-slate-200 max-h-48 overflow-y-auto pr-1"
                >
                  ${formatMarkdownPreview(activeGrammarVal)}
                </div>
              </div>

              <button
                type="submit"
                class="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition"
              >
                ${editingLesson ? '💾 Save Lesson Changes & Sync' : '➕ Create Lesson Unit'}
              </button>
            </form>
          </div>

          <!-- Existing Lessons List (Filter by A1-C1, Reorder Up/Down, Draft/Published Toggle, Edit, Delete) -->
          <div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 class="font-extrabold text-base">
                  📚 Manage & Reorder Lessons (${state.adminSelectedLevel})
                </h2>
                <p class="text-xs text-slate-500 font-mm">
                  အဆင့်အလိုက် သင်ခန်းစာများကို အပေါ်/အောက် စီရန်၊ Draft/Published ပြောင်းရန်၊ ပြင်ဆင်ရန် နှင့် ဖျက်ရန်
                </p>
              </div>

              <!-- CEFR Level Switcher -->
              <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                ${CEFR_LEVELS.map(
                  (l) => `
                  <button
                    onclick="setAdminLevelFilter('${l.level}')"
                    class="px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                      state.adminSelectedLevel === l.level
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }"
                  >
                    ${l.level}
                  </button>
                `
                ).join('')}
              </div>
            </div>

            <div class="space-y-3">
              ${
                levelLessons.length > 0
                  ? levelLessons
                      .map((les, idx) => {
                        const vCount = state.lessonVideos.filter((v) => v.lesson_id === les.id).length;
                        const wCount = state.vocabularies.filter((v) => v.lesson_id === les.id).length;
                        const qCount = state.quizzes.filter((q) => q.lesson_id === les.id).length;
                        const isPub = les.is_published !== false;
                        return `
                          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border ${
                            state.editingLessonId === les.id
                              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                              : 'border-slate-200/80 dark:border-slate-800'
                          } flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div class="space-y-1">
                              <div class="flex flex-wrap items-center gap-2">
                                <span class="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[11px] font-extrabold">
                                  ${les.cefr_level} • Unit ${les.unit_number}
                                </span>
                                <button
                                  type="button"
                                  onclick="toggleLessonPublishedDirect('${les.id}')"
                                  title="Click to toggle Published vs Draft"
                                  class="px-2 py-0.5 rounded-md text-[11px] font-extrabold border transition ${
                                    isPub
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                  }"
                                >
                                  ${isPub ? '🟢 Published' : '📝 Draft'}
                                </button>
                                <span class="text-[11px] font-mono text-slate-400">
                                  order: #${les.order_index}
                                </span>
                                <span class="text-[11px] font-semibold text-slate-500">
                                  🎬 ${vCount} • 📚 ${wCount} • 🧠 ${qCount}
                                </span>
                              </div>
                              <h3 class="font-extrabold text-sm sm:text-base">${les.title}</h3>
                              ${
                                les.title_mm
                                  ? `<p class="text-xs font-mm text-indigo-600 dark:text-indigo-400">${les.title_mm}</p>`
                                  : ''
                              }
                            </div>

                            <div class="flex flex-wrap items-center gap-1.5 shrink-0">
                              <button
                                onclick="reorderAdminLesson('${les.id}', 'up')"
                                ${idx === 0 ? 'disabled' : ''}
                                title="Move Up"
                                class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-extrabold disabled:opacity-35 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                ↑
                              </button>
                              <button
                                onclick="reorderAdminLesson('${les.id}', 'down')"
                                ${idx === levelLessons.length - 1 ? 'disabled' : ''}
                                title="Move Down"
                                class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-extrabold disabled:opacity-35 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                ↓
                              </button>
                              <button
                                onclick="startEditLesson('${les.id}')"
                                class="px-3 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold hover:bg-indigo-500/25"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onclick="setAdminSelectedLesson('${les.id}'); setAdminSubTab('videos')"
                                class="px-2.5 py-1.5 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 text-xs font-extrabold hover:bg-sky-500/25"
                              >
                                Videos
                              </button>
                              <button
                                onclick="deleteAdminLesson('${les.id}')"
                                class="px-2.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-extrabold hover:bg-rose-500/25"
                                title="Delete Lesson (with Confirmation)"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        `;
                      })
                      .join('')
                  : `<div class="text-center py-8 text-xs text-slate-400">No lessons in level ${state.adminSelectedLevel} yet. Create one using the form on the left.</div>`
              }
            </div>
          </div>
        </div>

        ${
          editingLesson
            ? `
          <!-- INLINE VOCABULARY & QUIZ EDITOR INSIDE LESSON'S EDIT VIEW -->
          <div class="bg-white dark:bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[11px] font-extrabold uppercase">
                  Inline Unit Content Editor
                </span>
                <h3 class="text-base sm:text-lg font-extrabold mt-1">
                  📚 Vocabulary (${inlineLessonVocabs.length}) & 🧠 Quiz Questions (${inlineLessonQuizzes.length}) inside "${editingLesson.title}"
                </h3>
                <p class="text-xs text-slate-500 font-mm">
                  ဤသင်ခန်းစာအတွင်းရှိ ဝေါဟာရများနှင့် ဉာဏ်စမ်းမေးခွန်းများကို တိုက်ရိုက် ပြင်ဆင်ခြင်း (Edit) သို့မဟုတ် ဖျက်ခြင်း (Delete) ပြုလုပ်နိုင်ပါသည်
                </p>
              </div>
              <button
                type="button"
                onclick="setAdminSelectedLesson('${editingLesson.id}'); setAdminSubTab('vocab_quiz')"
                class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/15"
              >
                📦 Open Bulk JSON Importer →
              </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Left Column: Inline Vocabulary List & Quick Edit/Add Form -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h4 class="font-extrabold text-sm flex items-center gap-2">
                    <span>📚 Lesson Vocabulary Words</span>
                    <span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs">${inlineLessonVocabs.length}</span>
                  </h4>
                  ${
                    editingVocab
                      ? `<button onclick="state.editingVocabId=null; render()" class="text-xs font-bold text-rose-500 hover:underline">Cancel Word Edit</button>`
                      : ''
                  }
                </div>

                <!-- Inline Vocab Edit / Add Form -->
                <form onsubmit="handleAdminVocabSubmit(event)" class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                  <div class="font-extrabold text-indigo-600 dark:text-indigo-400">
                    ${editingVocab ? `✏️ Editing Word: "${editingVocab.word_en}"` : '➕ Quick Add / Edit Vocabulary Word'}
                  </div>
                  <input type="hidden" name="lesson_id" value="${editingLesson.id}" />
                  <div class="grid grid-cols-2 gap-2">
                    <input
                      name="word_en"
                      type="text"
                      required
                      value="${editingVocab ? editingVocab.word_en.replace(/"/g, '&quot;') : ''}"
                      placeholder="English word (word_en)"
                      class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                    <input
                      name="phonetic"
                      type="text"
                      value="${editingVocab ? editingVocab.phonetic.replace(/"/g, '&quot;') : ''}"
                      placeholder="Phonetic e.g. /həˈləʊ/"
                      class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <input
                    name="meaning_mm"
                    type="text"
                    required
                    value="${editingVocab ? editingVocab.meaning_mm.replace(/"/g, '&quot;') : ''}"
                    placeholder="မြန်မာအဓိပ္ပာယ် (meaning_mm)"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mm"
                  />
                  <input
                    name="example_en"
                    type="text"
                    required
                    value="${editingVocab ? editingVocab.example_en.replace(/"/g, '&quot;') : ''}"
                    placeholder="English example sentence (example_en)"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <input
                    name="example_mm"
                    type="text"
                    required
                    value="${editingVocab ? editingVocab.example_mm.replace(/"/g, '&quot;') : ''}"
                    placeholder="မြန်မာ နမူနာဝါကျ (example_mm)"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mm"
                  />
                  <button
                    type="submit"
                    class="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition"
                  >
                    ${editingVocab ? '💾 Save Vocabulary Changes' : '➕ Add Word to This Lesson'}
                  </button>
                </form>

                <!-- Inline Vocab Items List -->
                <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                  ${
                    inlineLessonVocabs.length > 0
                      ? inlineLessonVocabs
                          .map(
                            (v) => `
                          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border ${
                            state.editingVocabId === v.id
                              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                              : 'border-slate-200/70 dark:border-slate-800'
                          } flex items-start justify-between gap-2 text-xs">
                            <div class="space-y-0.5">
                              <div>
                                <span class="font-extrabold text-sm">${v.word_en}</span>
                                <span class="text-indigo-500 font-mono ml-1">${v.phonetic}</span>
                              </div>
                              <div class="font-mm font-bold text-emerald-600 dark:text-emerald-400">${v.meaning_mm}</div>
                              <div class="text-slate-500">${v.example_en}</div>
                              <div class="text-slate-400 font-mm">${v.example_mm}</div>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onclick="startEditVocab('${v.id}')"
                                class="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold hover:bg-indigo-500/25"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onclick="deleteAdminVocab('${v.id}')"
                                class="px-2.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-500 font-extrabold hover:bg-rose-500/25"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        `
                          )
                          .join('')
                      : `<div class="text-center py-6 text-xs text-slate-400">No vocabulary words in this lesson yet.</div>`
                  }
                </div>
              </div>

              <!-- Right Column: Inline Quiz Questions List & Quick Edit/Add Form -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h4 class="font-extrabold text-sm flex items-center gap-2">
                    <span>🧠 Lesson Quiz Questions</span>
                    <span class="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs">${inlineLessonQuizzes.length}</span>
                  </h4>
                  ${
                    editingQuiz
                      ? `<button onclick="state.editingQuizId=null; render()" class="text-xs font-bold text-rose-500 hover:underline">Cancel Quiz Edit</button>`
                      : ''
                  }
                </div>

                <!-- Inline Quiz Edit / Add Form -->
                <form onsubmit="handleAdminQuizSubmit(event)" class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                  <div class="font-extrabold text-indigo-600 dark:text-indigo-400">
                    ${editingQuiz ? `✏️ Editing Quiz Question (${editingQuiz.id})` : '➕ Quick Add / Edit Quiz Question'}
                  </div>
                  <input type="hidden" name="lesson_id" value="${editingLesson.id}" />
                  <div class="grid grid-cols-2 gap-2">
                    <select
                      name="question_type"
                      onchange="setAdminQuizType(this.value)"
                      class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    >
                      <option value="mcq" ${state.adminQuizType === 'mcq' ? 'selected' : ''}>mcq (Multiple Choice)</option>
                      <option value="fill_blank" ${state.adminQuizType === 'fill_blank' ? 'selected' : ''}>fill_blank</option>
                      <option value="reorder" ${state.adminQuizType === 'reorder' ? 'selected' : ''}>reorder</option>
                    </select>
                    <input
                      name="correct_answer"
                      type="text"
                      required
                      value="${editingQuiz ? editingQuiz.correct_answer.replace(/"/g, '&quot;') : ''}"
                      placeholder="Correct answer"
                      class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                  <input
                    name="question_text"
                    type="text"
                    required
                    value="${editingQuiz ? editingQuiz.question_text.replace(/"/g, '&quot;') : ''}"
                    placeholder="Question text (question_text)"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <input
                    name="options_raw"
                    type="text"
                    required
                    value="${editingQuiz ? inlineEditQuizOptsRaw.replace(/"/g, '&quot;') : ''}"
                    placeholder="Options comma-separated (e.g. am, is, are, be)"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                  <input
                    name="explanation_mm"
                    type="text"
                    required
                    value="${editingQuiz ? editingQuiz.explanation_mm.replace(/"/g, '&quot;') : ''}"
                    placeholder="မြန်မာရှင်းလင်းချက် (explanation_mm)"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mm"
                  />
                  <button
                    type="submit"
                    class="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold transition"
                  >
                    ${editingQuiz ? '💾 Save Quiz Question Changes' : '➕ Add Quiz to This Lesson'}
                  </button>
                </form>

                <!-- Inline Quiz Items List -->
                <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                  ${
                    inlineLessonQuizzes.length > 0
                      ? inlineLessonQuizzes
                          .map((q) => {
                            let optsDisplay = '';
                            try {
                              optsDisplay = JSON.parse(q.options_json).join(' | ');
                            } catch {
                              optsDisplay = q.options_json;
                            }
                            return `
                              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border ${
                                state.editingQuizId === q.id
                                  ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                  : 'border-slate-200/70 dark:border-slate-800'
                              } flex items-start justify-between gap-2 text-xs">
                                <div class="space-y-1">
                                  <span class="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase">
                                    ${q.question_type}
                                  </span>
                                  <div class="font-extrabold">${q.question_text}</div>
                                  <div class="text-[11px] font-mono text-slate-500">Options: [${optsDisplay}]</div>
                                  <div class="text-emerald-600 dark:text-emerald-400 font-bold">✓ Answer: ${q.correct_answer}</div>
                                  <div class="text-slate-500 font-mm">💡 ${q.explanation_mm}</div>
                                </div>
                                <div class="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onclick="startEditQuiz('${q.id}')"
                                    class="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold hover:bg-indigo-500/25"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onclick="deleteAdminQuiz('${q.id}')"
                                    class="px-2.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-500 font-extrabold hover:bg-rose-500/25"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            `;
                          })
                          .join('')
                      : `<div class="text-center py-6 text-xs text-slate-400">No quiz questions in this lesson yet.</div>`
                  }
                </div>
              </div>
            </div>
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // SUB-TAB 2: VIDEO & SUBTITLE MANAGER (YouTube Unlisted / MP4 / R2 + .vtt Upload/Paste + INLINE VIDEO & SUBTITLE PREVIEW PLAYER)
  // --------------------------------------------------------------------------
  if (state.adminSubTab === 'videos') {
    const draftTitle = editingVideo
      ? state.adminDraftVideoTitle || editingVideo.title
      : state.adminDraftVideoTitle || '';
    const draftProvider = editingVideo
      ? state.adminDraftVideoProvider || editingVideo.video_provider
      : state.adminDraftVideoProvider || 'mp4_url';
    const draftUrl = editingVideo
      ? state.adminDraftVideoUrl || editingVideo.video_url
      : state.adminDraftVideoUrl || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    const draftDuration = editingVideo
      ? state.adminDraftDurationSec || editingVideo.duration_sec
      : state.adminDraftDurationSec || 15;
    const draftOrder = editingVideo
      ? state.adminDraftVideoOrder || editingVideo.order_index
      : lessonVideosForUnit.length + 1;

    const enVttVal = editingVideo
      ? state.adminDraftEnVtt || editingVideo.subtitle_en_vtt || ''
      : state.adminDraftEnVtt ||
        `WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nHello everyone! Welcome to our lesson.\n\n00:00:05.000 --> 00:00:15.000\nLet's practice English and Myanmar subtitles together.`;
    const mmVttVal = editingVideo
      ? state.adminDraftMmVtt || editingVideo.subtitle_mm_vtt || ''
      : state.adminDraftMmVtt ||
        `WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nမင်္ဂလာပါ အားလုံးပဲ! သင်ခန်းစာမှ ကြိုဆိုပါတယ်။\n\n00:00:05.000 --> 00:00:15.000\nအင်္ဂလိပ်နှင့် မြန်မာ စာတန်းထိုးများကို အတူတကွ လေ့ကျင့်ကြပါစို့။`;

    const previewEnCues = parseVttCues(enVttVal);
    const previewMmCues = parseVttCues(mmVttVal);
    const previewTime = state.adminPreviewTimeSec || 0;
    const activePreviewEn =
      previewEnCues.find((c) => previewTime >= c.start && previewTime <= c.end) || previewEnCues[0];
    const activePreviewMm =
      previewMmCues.find((c) => previewTime >= c.start && previewTime <= c.end) || previewMmCues[0];

    const showPrevEn = state.adminPreviewSubMode === 'en' || state.adminPreviewSubMode === 'both';
    const showPrevMm = state.adminPreviewSubMode === 'mm' || state.adminPreviewSubMode === 'both';
    const ytEmbedForPreview =
      draftProvider === 'youtube_unlisted' ? extractYouTubeEmbedUrl(draftUrl) : null;

    subTabContent = `
      <div class="space-y-5">
        <!-- Target Lesson Unit Selector Bar -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span class="text-xs font-extrabold uppercase tracking-wider text-indigo-500">Target Unit for Videos & Subtitles</span>
            <h3 class="text-base font-extrabold">
              ${
                selectedLesson
                  ? `${selectedLesson.cefr_level} Unit ${selectedLesson.unit_number}: ${selectedLesson.title}`
                  : 'Select a Lesson'
              }
            </h3>
          </div>
          <select
            onchange="setAdminSelectedLesson(this.value)"
            class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold"
          >
            ${state.lessons
              .map(
                (l) => `
              <option value="${l.id}" ${
                  selectedLesson && selectedLesson.id === l.id ? 'selected' : ''
                }>
                [${l.cefr_level} • Unit ${l.unit_number}] ${l.title}
              </option>
            `
              )
              .join('')}
          </select>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <!-- Add / Update Video & VTT Subtitles Form + Inline Preview Modal/Box -->
          <div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 class="font-extrabold text-base">
                  ${editingVideo ? `✏️ Edit Video & Dual Subtitles (${editingVideo.id})` : '🎬 Add Lesson Video & .VTT Subtitles'}
                </h2>
                <p class="text-xs text-slate-500 font-mm">
                  YouTube Unlisted သို့မဟုတ် MP4/R2 URL နှင့် EN/MM .vtt စာတန်းထိုးများကို မသိမ်းမီ တိုက်ရိုက်စမ်းသပ်ကြည့်ရှုနိုင်သည်
                </p>
              </div>
              ${
                editingVideo
                  ? `<button onclick="cancelEditVideo()" class="text-xs font-bold text-rose-500 hover:underline">Cancel Edit</button>`
                  : ''
              }
            </div>

            <form onsubmit="handleAdminVideoSubmit(event)" class="space-y-3.5 text-xs sm:text-sm">
              <input type="hidden" name="lesson_id" value="${selectedLesson ? selectedLesson.id : ''}" />

              <div>
                <label class="block text-xs font-bold mb-1">Video Title (title)</label>
                <input
                  name="title"
                  type="text"
                  required
                  oninput="state.adminDraftVideoTitle = this.value"
                  value="${draftTitle.replace(/"/g, '&quot;')}"
                  placeholder="e.g. Part 1: Dialogue & Pronunciation Practice"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div class="grid grid-cols-3 gap-2.5">
                <div>
                  <label class="block text-xs font-bold mb-1">Provider</label>
                  <select
                    name="video_provider"
                    onchange="syncAdminVideoDraftField('adminDraftVideoProvider', this.value)"
                    class="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs"
                  >
                    <option value="mp4_url" ${draftProvider === 'mp4_url' ? 'selected' : ''}>mp4_url (MP4 / R2)</option>
                    <option value="youtube_unlisted" ${draftProvider === 'youtube_unlisted' ? 'selected' : ''}>youtube_unlisted</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold mb-1">duration_sec</label>
                  <input
                    name="duration_sec"
                    type="number"
                    min="5"
                    required
                    oninput="state.adminDraftDurationSec = parseInt(this.value, 10) || 15"
                    value="${draftDuration}"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold mb-1">order_index</label>
                  <input
                    name="order_index"
                    type="number"
                    min="1"
                    required
                    oninput="state.adminDraftVideoOrder = parseInt(this.value, 10) || 1"
                    value="${draftOrder}"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-bold">Video URL (YouTube Unlisted or Direct MP4 / Cloudflare R2)</label>
                  <button
                    type="button"
                    onclick="render()"
                    class="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    🔄 Refresh Player URL
                  </button>
                </div>
                <input
                  name="video_url"
                  type="url"
                  required
                  oninput="state.adminDraftVideoUrl = this.value"
                  onchange="syncAdminVideoDraftField('adminDraftVideoUrl', this.value)"
                  value="${draftUrl.replace(/"/g, '&quot;')}"
                  placeholder="https://pub-xxx.r2.dev/unit1.mp4 or https://youtu.be/M7lc1UVf-VE"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                />
              </div>

              <!-- English VTT Subtitle Paste or Upload .vtt File -->
              <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <label class="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    🇺🇸 English Subtitles (subtitle_en_vtt) • ${previewEnCues.length} cues parsed
                  </label>
                  <label class="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-[11px] font-extrabold hover:bg-indigo-500/25">
                    <span>📂 Re-upload / Load .vtt file</span>
                    <input type="file" accept=".vtt,text/vtt,text/plain" onchange="handleVttFileUpload(this, 'en')" class="hidden" />
                  </label>
                </div>
                <textarea
                  id="admin-en-vtt-textarea"
                  name="subtitle_en_vtt"
                  rows="4"
                  oninput="syncAdminVideoDraftField('adminDraftEnVtt', this.value)"
                  placeholder="WEBVTT&#10;&#10;00:00:00.000 --> 00:00:05.000&#10;Hello everyone! Welcome to our lesson."
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
                >${enVttVal}</textarea>
              </div>

              <!-- Myanmar VTT Subtitle Paste or Upload .vtt File -->
              <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <label class="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    🇲🇲 Myanmar Subtitles (subtitle_mm_vtt) • ${previewMmCues.length} cues parsed
                  </label>
                  <label class="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-[11px] font-extrabold hover:bg-emerald-500/25">
                    <span>📂 Re-upload / Load .vtt file</span>
                    <input type="file" accept=".vtt,text/vtt,text/plain" onchange="handleVttFileUpload(this, 'mm')" class="hidden" />
                  </label>
                </div>
                <textarea
                  id="admin-mm-vtt-textarea"
                  name="subtitle_mm_vtt"
                  rows="4"
                  oninput="syncAdminVideoDraftField('adminDraftMmVtt', this.value)"
                  placeholder="WEBVTT&#10;&#10;00:00:00.000 --> 00:00:05.000&#10;မင်္ဂလာပါ အားလုံးပဲ! သင်ခန်းစာမှ ကြိုဆိုပါတယ်။"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mm text-xs"
                >${mmVttVal}</textarea>
              </div>

              <!-- INLINE VIDEO & DUAL-SUBTITLE PREVIEW PLAYER (Test immediately before saving!) -->
              <div class="rounded-2xl border-2 border-indigo-500/30 bg-slate-950 text-white overflow-hidden shadow-lg space-y-3 p-3.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[11px] font-extrabold">
                      ▶ Inline Video & Dual-Subtitle Preview
                    </span>
                    <span class="text-[11px] text-slate-400">Test EN/MM .vtt before saving</span>
                  </div>
                  <div class="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    ${['off', 'en', 'mm', 'both']
                      .map(
                        (m) => `
                      <button
                        type="button"
                        data-admin-prev-sub="${m}"
                        onclick="setAdminPreviewSubMode('${m}')"
                        class="${
                          state.adminPreviewSubMode === m
                            ? 'px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-indigo-600 text-white'
                            : 'px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-400 hover:bg-slate-800'
                        }"
                      >
                        ${m.toUpperCase()}
                      </button>
                    `
                      )
                      .join('')}
                  </div>
                </div>

                <!-- Video Viewport + Dual Subtitle Overlay -->
                <div class="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800">
                  ${
                    draftProvider === 'youtube_unlisted' && ytEmbedForPreview
                      ? `<iframe
                          class="w-full h-full"
                          src="${ytEmbedForPreview}"
                          title="Admin Inline YouTube Preview"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen
                        ></iframe>`
                      : `<video
                          id="admin-inline-preview-video"
                          class="w-full h-full object-cover"
                          src="${draftUrl.replace(/"/g, '&quot;')}"
                          controls
                          playsinline
                          ontimeupdate="seekAdminPreviewTime(this.currentTime)"
                        ></video>`
                  }

                  <div
                    id="admin-inline-preview-overlay"
                    style="display: ${state.adminPreviewSubMode === 'off' ? 'none' : 'flex'}"
                    class="absolute inset-x-3 bottom-10 pointer-events-none flex-col items-center justify-center z-20"
                  >
                    <div class="inline-block max-w-xl px-3.5 py-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/15 text-center shadow-lg space-y-0.5">
                      ${
                        showPrevEn
                          ? `<div class="text-xs font-bold text-white">${
                              activePreviewEn
                                ? activePreviewEn.text
                                : '(No EN cue at this timestamp)'
                            }</div>`
                          : ''
                      }
                      ${
                        showPrevMm
                          ? `<div class="text-xs font-mm font-bold text-amber-300">${
                              activePreviewMm
                                ? activePreviewMm.text
                                : '(No MM cue at this timestamp)'
                            }</div>`
                          : ''
                      }
                    </div>
                  </div>
                </div>

                <!-- Timestamp Scrubber for testing VTT cues at any second -->
                <div class="flex items-center gap-3 px-1">
                  <span class="text-[11px] font-mono text-indigo-300 shrink-0">
                    Scrub Timestamp: <strong id="admin-preview-time-label">${formatDuration(previewTime)}</strong>
                  </span>
                  <input
                    id="admin-preview-scrubber"
                    type="range"
                    min="0"
                    max="${Math.max(15, draftDuration)}"
                    step="0.5"
                    value="${previewTime}"
                    oninput="seekAdminPreviewTime(this.value)"
                    class="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                class="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition"
              >
                ${editingVideo ? '💾 Save Video & Subtitle Updates' : '🎬 Add Video to Unit'}
              </button>
            </form>
          </div>

          <!-- Videos List for Selected Unit -->
          <div class="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 h-fit">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 class="font-extrabold text-base">
                  Unit Videos (${lessonVideosForUnit.length})
                </h2>
                <p class="text-xs text-slate-500 font-mm">
                  ဤသင်ခန်းစာရှိ ဗီဒီယိုများနှင့် VTT စာတန်းထိုးများ
                </p>
              </div>
              ${
                selectedLesson
                  ? `<button onclick="openLesson('${selectedLesson.id}', '${selectedLesson.cefr_level}')" class="px-3 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold">
                      ▶ Open in Student Player
                    </button>`
                  : ''
              }
            </div>

            <div class="space-y-3">
              ${
                lessonVideosForUnit.length > 0
                  ? lessonVideosForUnit
                      .map((vid) => {
                        const enCues = parseVttCues(vid.subtitle_en_vtt);
                        const mmCues = parseVttCues(vid.subtitle_mm_vtt);
                        return `
                          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border ${
                            state.editingVideoId === vid.id
                              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                              : 'border-slate-200/80 dark:border-slate-800'
                          } space-y-2">
                            <div class="flex items-start justify-between gap-2">
                              <div>
                                <div class="flex flex-wrap items-center gap-1.5">
                                  <span class="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-extrabold">
                                    #${vid.order_index}
                                  </span>
                                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                    vid.video_provider === 'youtube_unlisted'
                                      ? 'bg-rose-500/15 text-rose-500'
                                      : 'bg-sky-500/15 text-sky-500'
                                  }">
                                    ${vid.video_provider}
                                  </span>
                                  <span class="text-[11px] font-mono text-slate-400">${vid.duration_sec}s</span>
                                </div>
                                <h4 class="font-extrabold text-sm mt-1">${vid.title}</h4>
                                <p class="text-[11px] font-mono text-slate-400 truncate max-w-xs">${vid.video_url}</p>
                              </div>

                              <div class="flex items-center gap-1.5 shrink-0">
                                <button
                                  onclick="startEditVideo('${vid.id}')"
                                  class="px-3 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold hover:bg-indigo-500/25"
                                >
                                  ✏️ Edit & Preview
                                </button>
                                <button
                                  onclick="deleteAdminVideo('${vid.id}')"
                                  class="px-2.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-extrabold hover:bg-rose-500/25"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>

                            <div class="flex items-center gap-2 text-[11px] font-semibold text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                              <span>🇺🇸 EN VTT: ${enCues.length} cues</span>
                              <span>•</span>
                              <span>🇲🇲 MM VTT: ${mmCues.length} cues</span>
                            </div>
                          </div>
                        `;
                      })
                      .join('')
                  : `<div class="text-center py-8 text-xs text-slate-400">No videos attached to this unit yet. Use the form to add a YouTube Unlisted or MP4/R2 video.</div>`
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // SUB-TAB 3: VOCABULARY & QUIZ BUILDER + BULK JSON IMPORT
  // --------------------------------------------------------------------------
  if (state.adminSubTab === 'vocab_quiz') {
    let editQuizOptsRaw = '';
    if (editingQuiz) {
      try {
        editQuizOptsRaw = JSON.parse(editingQuiz.options_json).join(', ');
      } catch {
        editQuizOptsRaw = editingQuiz.options_json;
      }
    }

    subTabContent = `
      <div class="space-y-6">
        <!-- Target Lesson Unit Selector Bar -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span class="text-xs font-extrabold uppercase tracking-wider text-indigo-500">Target Unit for Vocabulary & Quizzes</span>
            <h3 class="text-base font-extrabold">
              ${
                selectedLesson
                  ? `${selectedLesson.cefr_level} Unit ${selectedLesson.unit_number}: ${selectedLesson.title}`
                  : 'Select a Lesson'
              }
            </h3>
          </div>
          <select
            onchange="setAdminSelectedLesson(this.value)"
            class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold"
          >
            ${state.lessons
              .map(
                (l) => `
              <option value="${l.id}" ${
                  selectedLesson && selectedLesson.id === l.id ? 'selected' : ''
                }>
                [${l.cefr_level} • Unit ${l.unit_number}] ${l.title}
              </option>
            `
              )
              .join('')}
          </select>
        </div>

        <!-- Two-Column Builders: Vocabulary Builder & Quiz Builder -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- Vocabulary Builder Card -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 class="font-extrabold text-base">
                  ${editingVocab ? `✏️ Edit Vocabulary (${editingVocab.word_en})` : '📚 Vocabulary Builder'}
                </h2>
                <p class="text-xs text-slate-500 font-mm">ဝေါဟာရ၊ အသံထွက်သင်္ကေတနှင့် နှစ်ဘာသာ နမူနာဝါကျ ထည့်ရန်</p>
              </div>
              ${
                editingVocab
                  ? `<button onclick="state.editingVocabId=null; render()" class="text-xs font-bold text-rose-500">Cancel</button>`
                  : ''
              }
            </div>

            <form onsubmit="handleAdminVocabSubmit(event)" class="space-y-3 text-xs sm:text-sm">
              <input type="hidden" name="lesson_id" value="${selectedLesson ? selectedLesson.id : ''}" />
              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-xs font-bold mb-1">English Word (word_en)</label>
                  <input
                    name="word_en"
                    type="text"
                    required
                    value="${editingVocab ? editingVocab.word_en.replace(/"/g, '&quot;') : ''}"
                    placeholder="e.g. Opportunity"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold mb-1">Phonetic (phonetic)</label>
                  <input
                    name="phonetic"
                    type="text"
                    value="${editingVocab ? editingVocab.phonetic.replace(/"/g, '&quot;') : ''}"
                    placeholder="e.g. /ˌɒp.əˈtjuː.nə.ti/"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold mb-1 font-mm">Myanmar Meaning (meaning_mm)</label>
                <input
                  name="meaning_mm"
                  type="text"
                  required
                  value="${editingVocab ? editingVocab.meaning_mm.replace(/"/g, '&quot;') : ''}"
                  placeholder="ဥပမာ - အခွင့်အလမ်း"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mm"
                />
              </div>

              <div>
                <label class="block text-xs font-bold mb-1">Example Sentence (example_en)</label>
                <input
                  name="example_en"
                  type="text"
                  required
                  value="${editingVocab ? editingVocab.example_en.replace(/"/g, '&quot;') : ''}"
                  placeholder="e.g. This course is a great opportunity to learn English."
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label class="block text-xs font-bold mb-1 font-mm">Example Translation (example_mm)</label>
                <input
                  name="example_mm"
                  type="text"
                  required
                  value="${editingVocab ? editingVocab.example_mm.replace(/"/g, '&quot;') : ''}"
                  placeholder="ဥပမာ - ဤသင်တန်းသည် အင်္ဂလိပ်စာလေ့လာရန် ကောင်းမွန်သော အခွင့်အလမ်းဖြစ်သည်။"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mm"
                />
              </div>

              <button
                type="submit"
                class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition"
              >
                ${editingVocab ? '💾 Update Vocabulary Word' : '➕ Add Vocabulary to Unit'}
              </button>
            </form>

            <!-- Unit Vocabulary List -->
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 max-h-60 overflow-y-auto pr-1">
              <div class="text-xs font-extrabold text-slate-400 uppercase">
                Unit Vocabulary (${vocabsForUnit.length} Words)
              </div>
              ${vocabsForUnit
                .map(
                  (v) => `
                <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span class="font-extrabold">${v.word_en}</span>
                    <span class="text-indigo-500 font-mono ml-1">${v.phonetic}</span>
                    <div class="font-mm text-emerald-600 dark:text-emerald-400">${v.meaning_mm}</div>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button onclick="startEditVocab('${v.id}')" class="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold">Edit</button>
                    <button onclick="deleteAdminVocab('${v.id}')" class="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-500 font-bold">🗑️</button>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- Quiz Builder Card (MCQ, Fill-in-the-blank, Reorder) -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 class="font-extrabold text-base">
                  ${editingQuiz ? `✏️ Edit Quiz (${editingQuiz.id})` : '🧠 Quiz Question Builder'}
                </h2>
                <p class="text-xs text-slate-500 font-mm">MCQ, Fill-in-the-blank နှင့် Reorder မေးခွန်းများ တည်ဆောက်ရန်</p>
              </div>
              ${
                editingQuiz
                  ? `<button onclick="state.editingQuizId=null; render()" class="text-xs font-bold text-rose-500">Cancel</button>`
                  : ''
              }
            </div>

            <form onsubmit="handleAdminQuizSubmit(event)" class="space-y-3 text-xs sm:text-sm">
              <input type="hidden" name="lesson_id" value="${selectedLesson ? selectedLesson.id : ''}" />

              <div>
                <label class="block text-xs font-bold mb-1">Question Type (question_type)</label>
                <select
                  name="question_type"
                  onchange="setAdminQuizType(this.value)"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="mcq" ${state.adminQuizType === 'mcq' ? 'selected' : ''}>mcq (Multiple Choice)</option>
                  <option value="fill_blank" ${state.adminQuizType === 'fill_blank' ? 'selected' : ''}>fill_blank (Fill in the Blank)</option>
                  <option value="reorder" ${state.adminQuizType === 'reorder' ? 'selected' : ''}>reorder (Sentence Token Reorder)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold mb-1">Question Text (question_text)</label>
                <input
                  name="question_text"
                  type="text"
                  required
                  value="${editingQuiz ? editingQuiz.question_text.replace(/"/g, '&quot;') : ''}"
                  placeholder="${
                    state.adminQuizType === 'reorder'
                      ? 'e.g. Reorder the words to form a natural greeting:'
                      : 'e.g. Choose the correct verb: She ___ from Myanmar.'
                  }"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label class="block text-xs font-bold mb-1">
                  ${
                    state.adminQuizType === 'reorder'
                      ? 'Scrambled Word Tokens (comma-separated or JSON array)'
                      : 'Options / Word Bank Hints (comma-separated or JSON array)'
                  }
                </label>
                <input
                  name="options_raw"
                  type="text"
                  required
                  value="${editingQuiz ? editQuizOptsRaw.replace(/"/g, '&quot;') : ''}"
                  placeholder="${
                    state.adminQuizType === 'reorder'
                      ? 'e.g. meet, to, Pleasure, you'
                      : 'e.g. am, is, are, be'
                  }"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                />
              </div>

              <div>
                <label class="block text-xs font-bold mb-1">Correct Answer (correct_answer)</label>
                <input
                  name="correct_answer"
                  type="text"
                  required
                  value="${editingQuiz ? editingQuiz.correct_answer.replace(/"/g, '&quot;') : ''}"
                  placeholder="${
                    state.adminQuizType === 'reorder'
                      ? 'e.g. Pleasure to meet you'
                      : 'e.g. is'
                  }"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label class="block text-xs font-bold mb-1 font-mm">Myanmar Explanation (explanation_mm)</label>
                <textarea
                  name="explanation_mm"
                  rows="2"
                  required
                  placeholder="အဖြေမှားသွားသည့်အခါ ကျောင်းသားနားလည်စေရန် မြန်မာဘာသာဖြင့် ရှင်းလင်းချက်..."
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mm"
                >${editingQuiz ? editingQuiz.explanation_mm : ''}</textarea>
              </div>

              <button
                type="submit"
                class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition"
              >
                ${editingQuiz ? '💾 Update Quiz Question' : '➕ Add Quiz Question to Unit'}
              </button>
            </form>

            <!-- Unit Quizzes List -->
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 max-h-60 overflow-y-auto pr-1">
              <div class="text-xs font-extrabold text-slate-400 uppercase">
                Unit Quizzes (${quizzesForUnit.length} Questions)
              </div>
              ${quizzesForUnit
                .map(
                  (q) => `
                <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-start justify-between gap-2 text-xs">
                  <div class="space-y-0.5">
                    <span class="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase">
                      ${q.question_type}
                    </span>
                    <div class="font-bold">${q.question_text}</div>
                    <div class="text-emerald-600 dark:text-emerald-400 font-bold">Ans: ${q.correct_answer}</div>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button onclick="startEditQuiz('${q.id}')" class="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold">Edit</button>
                    <button onclick="deleteAdminQuiz('${q.id}')" class="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-500 font-bold">🗑️</button>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>

        <!-- Bulk JSON Import Section -->
        <div class="bg-white dark:bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="font-extrabold text-base sm:text-lg flex items-center gap-2">
                <span>📦 Bulk JSON Content Importer</span>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold">
                  Vocabulary, Quizzes, Videos & Lessons
                </span>
              </h2>
              <p class="text-xs text-slate-500 font-mm">
                JSON ဖরমတ်ဖြင့် ဝေါဟာရများ၊ ဉာဏ်စမ်းမေးခွန်းများနှင့် သင်ခန်းစာအများအပြားကို တစ်ပြိုင်နက်တည်း ထည့်သွင်းနိုင်ပါသည်။
              </p>
            </div>

            <button
              type="button"
              onclick="loadSampleBulkJson()"
              class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold transition"
            >
              📋 Load Sample JSON Template
            </button>
          </div>

          <form onsubmit="handleBulkJsonImport(event)" class="space-y-3">
            <textarea
              id="admin-bulk-json-textarea"
              rows="8"
              placeholder='{"lesson_id": "les-a1-1", "vocabulary": [{"word_en": "Fluent", "meaning_mm": "သွက်လက်သော", "phonetic": "/ˈfluː.ənt/", "example_en": "She is fluent in English.", "example_mm": "သူမ အင်္ဂလိပ်စကား သွက်လက်သည်။"}], "quizzes": [{"question_type": "mcq", "question_text": "She is ___ in English.", "options": ["fluent", "neighbor"], "correct_answer": "fluent", "explanation_mm": "fluent = သွက်လက်သော"}]}'
              class="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs"
            ></textarea>
            <div class="flex justify-end">
              <button
                type="submit"
                class="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm shadow-lg transition"
              >
                🚀 Run Bulk JSON Import
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  return `
    <div class="space-y-6 pb-8">
      <!-- Admin Top Banner -->
      <div class="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-extrabold">
                <span>🛡️ Secret Route: /studio-manage-9x2k</span>
                <span>•</span>
                <span>${user.email} (PIN Verified)</span>
              </div>
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
                state.serverConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-slate-500/20 text-slate-300 border border-slate-400/30'
              } text-xs font-extrabold">
                <span>${state.serverConnected ? '🟢 Full-Stack Server DB Connected (data/database.json)' : '⚪ Local Cache Mode'}</span>
              </div>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Admin Content Management Studio
            </h1>
            <p class="text-xs sm:text-sm text-indigo-200 font-mm">
              ကုဒ်ပြင်ဆင်ရန်မလိုဘဲ A1–C1 သင်ခန်းစာများ၊ ဗီဒီယိုနှင့် .vtt စာတန်းထိုးများ၊ ဝေါဟာရနှင့် ဉာဏ်စမ်းမေးခွန်းများကို စီမံခန့်ခွဲပါ။
            </p>
          </div>

          <div class="flex flex-col items-end gap-2">
            <button
              onclick="lockAdminPinSession()"
              class="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-extrabold transition"
            >
              🔒 Lock PIN Session & Exit
            </button>
            <div class="grid grid-cols-4 gap-2 text-center">
              <div class="p-2.5 rounded-2xl bg-white/10 border border-white/10">
                <div class="text-base sm:text-lg font-extrabold">${state.lessons.length}</div>
                <div class="text-[10px] uppercase text-indigo-200 font-bold">Lessons</div>
              </div>
              <div class="p-2.5 rounded-2xl bg-white/10 border border-white/10">
                <div class="text-base sm:text-lg font-extrabold">${state.lessonVideos.length}</div>
                <div class="text-[10px] uppercase text-indigo-200 font-bold">Videos</div>
              </div>
              <div class="p-2.5 rounded-2xl bg-white/10 border border-white/10">
                <div class="text-base sm:text-lg font-extrabold">${state.vocabularies.length}</div>
                <div class="text-[10px] uppercase text-indigo-200 font-bold">Vocab</div>
              </div>
              <div class="p-2.5 rounded-2xl bg-white/10 border border-white/10">
                <div class="text-base sm:text-lg font-extrabold">${state.quizzes.length}</div>
                <div class="text-[10px] uppercase text-indigo-200 font-bold">Quizzes</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Sub-Navigation Tabs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-white/15">
          <button
            onclick="setAdminSubTab('lessons')"
            class="p-3 rounded-2xl text-left transition flex items-center justify-between ${
              state.adminSubTab === 'lessons'
                ? 'bg-white text-slate-900 font-extrabold shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white font-bold'
            }"
          >
            <div>
              <div class="text-xs sm:text-sm">1. Lessons Manager</div>
              <div class="text-[11px] opacity-75 font-mm">Create, Edit, Reorder & Delete (A1–C1)</div>
            </div>
            <span>📖</span>
          </button>

          <button
            onclick="setAdminSubTab('videos')"
            class="p-3 rounded-2xl text-left transition flex items-center justify-between ${
              state.adminSubTab === 'videos'
                ? 'bg-white text-slate-900 font-extrabold shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white font-bold'
            }"
          >
            <div>
              <div class="text-xs sm:text-sm">2. Video & Subtitle Manager</div>
              <div class="text-[11px] opacity-75 font-mm">YouTube/MP4/R2 + .vtt EN & MM Upload</div>
            </div>
            <span>🎬</span>
          </button>

          <button
            onclick="setAdminSubTab('vocab_quiz')"
            class="p-3 rounded-2xl text-left transition flex items-center justify-between ${
              state.adminSubTab === 'vocab_quiz'
                ? 'bg-white text-slate-900 font-extrabold shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white font-bold'
            }"
          >
            <div>
              <div class="text-xs sm:text-sm">3. Vocabulary & Quiz Builder</div>
              <div class="text-[11px] opacity-75 font-mm">Add Words, MCQ/Blank/Reorder + Bulk JSON</div>
            </div>
            <span>🧠</span>
          </button>
        </div>
      </div>

      <!-- Toast Notification Banner (Success / Error Feedback) -->
      <div
        id="admin-toast-banner"
        class="${state.adminToastMessage ? '' : 'hidden'} p-3.5 rounded-2xl ${
          state.adminToastType === 'error'
            ? 'bg-rose-600 text-white border border-rose-400/40'
            : 'bg-emerald-600 text-white border border-emerald-400/40'
        } text-xs sm:text-sm font-extrabold text-center shadow-lg transition-all"
      >
        ${state.adminToastMessage || ''}
      </div>

      ${
        state.adminConfirmDialog
          ? `
        <!-- Confirmation Dialog Modal for Deleting Lesson, Video, Vocabulary, or Quiz -->
        <div class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-xl font-extrabold shrink-0">
                ⚠️
              </div>
              <div>
                <h3 class="text-base font-extrabold">Confirm Permanent Deletion</h3>
                <p class="text-xs text-slate-500 font-mm">ဖျက်ပစ်ရန် သေချာပါသလား? ဤလုပ်ဆောင်ချက်ကို ပြန်ပြင်၍မရပါ။</p>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
              <div class="text-slate-400 uppercase font-extrabold text-[10px]">
                Target ${state.adminConfirmDialog.type.toUpperCase()}
              </div>
              <div class="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                ${state.adminConfirmDialog.label}
              </div>
              ${
                state.adminConfirmDialog.type === 'lesson'
                  ? `<div class="text-[11px] text-rose-500 font-semibold pt-1">
                      Note: Deleting a lesson will also remove all attached videos, vocabulary words, and quiz questions for this unit.
                    </div>`
                  : ''
              }
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onclick="cancelAdminDeleteConfirm()"
                class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-extrabold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onclick="confirmAdminDeleteAction()"
                class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-md transition"
              >
                🗑️ Confirm Delete
              </button>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- Active Admin Manager Workspace -->
      ${subTabContent}
    </div>
  `;
}

function render() {
  const root = document.getElementById('app');
  if (!root) return;

  // Enforce secret route guard BEFORE rendering: if someone visits /studio-manage-9x2k
  // while not logged in as the single authorized admin (aingdy924@gmail.com + role === 'admin'),
  // immediately redirect them to / without showing any admin UI or error details.
  if (state.activeTab === 'admin' && !isStrictAuthorizedAdmin(state.user)) {
    silentRedirectToRoot();
  }

  if (!state.user) {
    clearVideoIntervals();
    root.innerHTML = renderAuthScreen();
    return;
  }

  // Strictly NO link, button, or menu item to /studio-manage-9x2k anywhere in Navbar, Footer, Profile, or Student UI
  const navItems = [
    { id: 'home', labelEn: 'Home', labelMm: 'ပင်မ', icon: '🏠' },
    { id: 'lessons', labelEn: 'Lessons', labelMm: 'သင်ခန်းစာ', icon: '📖' },
    { id: 'flashcards', labelEn: 'Flashcards', labelMm: 'ကတ်ပြား', icon: '🗂️' },
    { id: 'profile', labelEn: 'Profile', labelMm: 'ပရိုဖိုင်', icon: '👤' },
  ];

  let mainContent = '';
  if (state.activeTab === 'home') mainContent = renderHomeView();
  else if (state.activeTab === 'lessons') mainContent = renderLessonsView();
  else if (state.activeTab === 'flashcards') mainContent = renderFlashcardsView();
  else if (state.activeTab === 'profile') mainContent = renderProfileView();
  else if (state.activeTab === 'admin') mainContent = renderAdminDashboardView();

  root.innerHTML = `
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <!-- Sticky Header -->
      <header class="sticky top-0 z-30 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800">
        <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <button onclick="setTab('home')" class="flex items-center gap-2.5 text-left">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold shadow-md">
              EM
            </div>
            <div>
              <span class="font-extrabold text-base sm:text-lg tracking-tight block leading-none">English Master</span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mm">အင်္ဂလိပ်စာ လေ့လာရေး</span>
            </div>
          </button>

          <!-- Desktop Nav (Only Home, Lessons, Flashcards, Profile) -->
          <nav class="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl">
            ${navItems
              .map(
                (item) => `
              <button onclick="setTab('${item.id}')" class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${state.activeTab === item.id ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}">
                <span>${item.icon}</span>
                <span>${item.labelEn}</span>
              </button>
            `
              )
              .join('')}
          </nav>

          <!-- Status, Quick Edit Button (Admin Only) & Theme Toggle -->
          <div class="flex items-center gap-2">
            ${
              isStrictAuthorizedAdmin(state.user)
                ? `
              <button
                type="button"
                onclick="openQuickAdminStudio(null, 'lessons')"
                class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm font-mm ${
                  state.activeTab === 'admin'
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-500/30'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }"
              >
                <span>🛠️</span>
                <span>ပြင်ဆင်ရန်</span>
              </button>
            `
                : ''
            }
            <div class="px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold">
              🔥 ${state.user.streak_count}
            </div>
            <div id="header-xp-badge" class="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
              🏆 ${state.user.xp_points} XP
            </div>
            <button onclick="toggleTheme()" class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold">
              ${state.isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <!-- Main View -->
      <main class="flex-1 max-w-4xl w-full mx-auto px-4 pt-5 pb-24 md:pb-10">
        ${mainContent}
      </main>

      <!-- Mobile Bottom Navigation -->
      <nav aria-label="Mobile Bottom Navigation" class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5">
        <div class="grid ${isStrictAuthorizedAdmin(state.user) ? 'grid-cols-5' : 'grid-cols-4'} gap-1 max-w-md mx-auto">
          ${navItems
            .map(
              (item) => `
            <button onclick="setTab('${item.id}')" class="flex flex-col items-center justify-center py-1.5 rounded-2xl transition ${state.activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 font-extrabold' : 'text-slate-500 dark:text-slate-400 font-medium'}">
              <span class="text-base">${item.icon}</span>
              <span class="text-[11px] leading-tight mt-0.5">${item.labelEn}</span>
              <span class="text-[9px] font-mm opacity-80 leading-none">${item.labelMm}</span>
            </button>
          `
            )
            .join('')}
          ${
            isStrictAuthorizedAdmin(state.user)
              ? `
            <button onclick="openQuickAdminStudio(null, 'lessons')" class="flex flex-col items-center justify-center py-1.5 rounded-2xl transition ${state.activeTab === 'admin' ? 'text-amber-600 dark:text-amber-400 bg-amber-500/15 font-extrabold' : 'text-amber-600 dark:text-amber-400 font-bold'}">
              <span class="text-base">🛠️</span>
              <span class="text-[10px] font-mm leading-tight mt-0.5">ပြင်ဆင်ရန်</span>
            </button>
          `
              : ''
          }
        </div>
      </nav>
    </div>
  `;

  if (state.activeTab === 'lessons' && state.activeLessonId) {
    attachVideoPlayerLifecycle();
  }
}

function checkRouteHash() {
  const path = window.location.pathname || '';
  const hash = window.location.hash || '';
  const isSecretRoute =
    path.endsWith(SECRET_ADMIN_ROUTE) ||
    hash === `#${SECRET_ADMIN_ROUTE}` ||
    hash === '#studio-manage-9x2k';

  const isLegacyAdminAttempt =
    path.endsWith('/admin') || hash === '#/admin' || hash === '#admin';

  if (isLegacyAdminAttempt) {
    // /admin is completely disabled; redirect immediately to /
    silentRedirectToRoot();
    return;
  }

  if (isSecretRoute) {
    if (isStrictAuthorizedAdmin(state.user)) {
      state.activeTab = 'admin';
    } else {
      // Immediately redirect unauthorized user to / without showing any admin UI or error details
      silentRedirectToRoot();
    }
  }
}

window.addEventListener('hashchange', () => {
  checkRouteHash();
  render();
});

window.addEventListener('popstate', () => {
  checkRouteHash();
  render();
});

// Initialize
checkRouteHash();
applyTheme();
render();
bootstrapFromFullStackServer();
