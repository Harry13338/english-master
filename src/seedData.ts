import {
  Lesson,
  Vocabulary,
  User,
  CEFRLevel,
  LessonVideo,
  UserVideoProgress,
  Quiz,
  UserProgress,
  FlashcardReview,
} from './types';

export const CEFR_LEVELS: {
  level: CEFRLevel;
  label_en: string;
  label_mm: string;
  color: string;
  badgeBg: string;
}[] = [
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
    color: 'from-rose-500 to-pink-600',
    badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
];

export const SEED_USERS: User[] = [
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

export const SECRET_ADMIN_ROUTE = '/studio-manage-9x2k';
export const AUTHORIZED_ADMIN_EMAIL = 'aingdy924@gmail.com';

export const SEED_LESSONS: Lesson[] = [
  // A1 Sample Lesson 1
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
  // A1 Sample Lesson 2
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
  // A2 Sample Lesson
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
  // B1 Sample Lesson
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
  // B2 Sample Lesson
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
  // C1 Sample Lesson
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

export const SEED_VOCABULARY: Vocabulary[] = [
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

export const SEED_LESSON_VIDEOS: LessonVideo[] = [
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
Notice how native speakers use contractions like "I'm" and "You're".`,
    subtitle_mm_vtt: `WEBVTT

00:00:00.000 --> 00:00:05.000
"I am", "She is" နှင့် "They are" တို့ကို လက်တွေ့စကားပြောတွင် အသုံးပြုပုံ။

00:00:05.000 --> 00:00:10.000
"I'm" နှင့် "You're" ကဲ့သို့ အတိုကောက်အသံထွက်များကို သတိပြုနားထောင်ပါ။`,
  },
  {
    id: 'vid-a1-2-1',
    lesson_id: 'les-a1-2',
    title: 'Talking About Your Daily Routine & Schedule (MP4 / R2)',
    video_provider: 'mp4_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration_sec: 15,
    order_index: 1,
    subtitle_en_vtt: `WEBVTT

00:00:00.000 --> 00:00:05.000
Let's talk about our daily routine using Present Simple Tense.`,
    subtitle_mm_vtt: `WEBVTT

00:00:00.000 --> 00:00:05.000
Present Simple Tense ကိုသုံးပြီး နေ့စဉ်လုပ်ငန်းဆောင်တာများအကြောင်း ပြောကြရအောင်။`,
  },
];

export const SEED_VIDEO_PROGRESS: UserVideoProgress[] = [
  {
    id: 'prog-seed-1',
    user_id: 'usr-student-1',
    video_id: 'vid-a1-1-1',
    watched_seconds: 5,
    is_completed: false,
    updated_at: new Date().toISOString(),
  },
];

export const SEED_QUIZZES: Quiz[] = [
  // A1 Unit 1 Quizzes (mcq, fill_blank, reorder)
  {
    id: 'qz-a1-1-1',
    lesson_id: 'les-a1-1',
    question_type: 'mcq',
    question_text: 'Choose the correct Verb to Be: "She ___ our new neighbor from Mandalay."',
    options_json: JSON.stringify(['am', 'is', 'are', 'be']),
    correct_answer: 'is',
    explanation_mm: 'She (သူမ - တစ်ဦးတည်း Subject) ဖြစ်သောကြောင့် Verb to Be တွင် "is" ကို အသုံးပြုရပါမည်။ (I + am, He/She/It + is, You/We/They + are)',
  },
  {
    id: 'qz-a1-1-2',
    lesson_id: 'les-a1-1',
    question_type: 'fill_blank',
    question_text: 'Complete the polite greeting: "It is a ___ to meet you today." (ဝမ်းမြောက်ဂုဏ်ယူခြင်း)',
    options_json: JSON.stringify(['pleasure', 'hometown', 'neighbor']),
    correct_answer: 'pleasure',
    explanation_mm: '"It is a pleasure to meet you" သည် တစ်ဦးနှင့်တစ်ဦး စတင်တွေ့ဆုံချိန်တွင် ဝမ်းမြောက်ဂုဏ်ယူကြောင်း ယဉ်ကျေးစွာ ပြောဆိုသည့် နှုတ်ဆက်စကား ဖြစ်ပါသည်။',
  },
  {
    id: 'qz-a1-1-3',
    lesson_id: 'les-a1-1',
    question_type: 'reorder',
    question_text: 'Reorder the words to form a natural self-introduction:',
    options_json: JSON.stringify(['Allow', 'me', 'to', 'introduce', 'myself']),
    correct_answer: 'Allow me to introduce myself',
    explanation_mm: '"Allow me to introduce myself" (ကျွန်တော့်ကိုယ်ကျွန်တော် မိတ်ဆက်ခွင့်ပြုပါ) ဟူသော အစီအစဉ်အတိုင်း စီပေးရပါမည်။',
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
    explanation_mm: 'Present Simple Tense တွင် Subject သည် He/She/It (တစ်ဦးတည်း) ဖြစ်ပါက Verb တွင် -s/-es ပေါင်းထည့်ရပါမည် (commute → commutes)။',
  },
  {
    id: 'qz-a1-2-2',
    lesson_id: 'les-a1-2',
    question_type: 'fill_blank',
    question_text: 'Type the missing word: "We usually eat mohinga for ___ on Sundays." (မနက်စာ)',
    options_json: JSON.stringify(['breakfast', 'schedule', 'exercise']),
    correct_answer: 'breakfast',
    explanation_mm: 'မနက်စာကို အင်္ဂလိပ်လို "breakfast" ဟုခေါ်ပြီး "eat mohinga for breakfast" (မနက်စာအဖြစ် မုန့်ဟင်းခါးစားသည်) ဟု သုံးပါသည်။',
  },
  {
    id: 'qz-a1-2-3',
    lesson_id: 'les-a1-2',
    question_type: 'reorder',
    question_text: 'Reorder the words to describe an evening habit:',
    options_json: JSON.stringify(['I', 'like', 'to', 'relax', 'before', 'bed']),
    correct_answer: 'I like to relax before bed',
    explanation_mm: '"I like to relax before bed" (အိပ်ရာမဝင်ခင် အနားယူအပန်းဖြေရတာကို နှစ်သက်ပါသည်) ဟု Subject + Verb + Infinitive ပုံစံအတိုင်း စီရပါမည်။',
  },
];

export const SEED_USER_PROGRESS: UserProgress[] = [
  {
    id: 'up-seed-1',
    user_id: 'usr-student-1',
    lesson_id: 'les-a1-1',
    status: 'completed',
    score: 100,
    completed_at: new Date().toISOString(),
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

export const SEED_FLASHCARD_REVIEWS: FlashcardReview[] = [
  {
    id: 'rev-seed-1',
    user_id: 'usr-student-1',
    vocab_id: 'voc-a1-1-2', // Introduce
    ease_factor: 2.5,
    interval_days: 1,
    next_review_at: new Date(Date.now() - 3600 * 1000).toISOString(), // Due now
    is_bookmarked: true,
  },
  {
    id: 'rev-seed-2',
    user_id: 'usr-student-1',
    vocab_id: 'voc-a1-2-3', // Commute
    ease_factor: 2.5,
    interval_days: 1,
    next_review_at: new Date(Date.now() - 1800 * 1000).toISOString(), // Due now
    is_bookmarked: true,
  },
];


