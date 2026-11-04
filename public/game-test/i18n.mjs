import { LAMPS, INTRO_DIALOGUE } from './game.mjs';

const english = {
  title: 'After hours', pageTitle: 'After Hours Test — Fasthaus',
  subtitle: 'Four lamps. Three stories to find. A little light detective work.',
  home: 'Fasthaus home', back: 'Back to the collection',
  findLight: 'Find the light.', unlock: 'Unlock 10% off.', gameLabel: 'Fasthaus lamp guessing game',
  studio: 'THE STUDIO', afterHours: '/ AFTER HOURS',
  progress: '{found} / {total} lit', progressLabel: '{found} of {total} lamps lit',
  chooseGroup: 'Choose a lamp from the shelves', chooseLamp: 'Choose lamp {number}: {description}', chooseLabel: 'Choose lamp {number}',
  keeper: 'The studio keeper', portrait: '8-bit portrait of the studio keeper', fullText: 'Show full text', you: 'You',
  startTitle: 'Ready to find the light?', startDescription: 'Four lamps. Three stories to find. A little curiosity goes a long way.',
  start: 'Start game', duration: 'About a minute. No rush.',
  introRoom: 'A little conversation before the lights come on.', completeRoom: 'The studio looks better with you in it.',
  revealRoom: 'A bright idea, found.', guessRoom: 'Which lamp am I describing?',
  replyTip: 'Choose your reply to continue', completeTip: 'All three stories discovered', guessTip: 'Click or tap to choose a lamp',
  story: 'Story {number} of {total}', guessDetail: 'Choose the lamp on the shelf. Follow your eye.',
  hint: 'Another clue', hintsFree: 'Hints are on the house.', hintCount: '{count} / {total}',
  wrong: 'That one has a different story. Try another lamp, or ask for a clue.',
  reveal: 'That’s {name}.', next: 'Next story', openReward: 'Open my reward',
  remainingTwo: '2 more stories to discover.', remainingOne: '1 more story to discover.', perfect: 'Three for three. Nicely spotted.',
  soundOn: 'Sound on', soundOff: 'Sound off', soundUnavailable: 'Sound is unavailable in this browser. You can keep playing.',
  restart: 'Start over', replay: 'Play again',
  rewardTitle: 'You’ve got an eye for this.', rewardDetail: 'Three bright ideas, found. A little thank-you for your curiosity.',
  discount: '10%', off: 'off', demoReward: 'YOUR DEMO REWARD', copy: 'Copy code', copied: 'Copied',
  copyIdle: 'Demo code — not active at checkout yet.', copySuccess: 'Copied. This demo code is not active at checkout yet.',
  copyManual: 'Select and copy AFTERHOURS10. It is a demo code, not active at checkout.',
  explore: 'Explore the collection', productAlt: '{name} table lamp', footer: 'A small game by Fasthaus. Made for curious minds.',
  prototype: 'Test page · discount not active', noScript: 'This game needs JavaScript. You can still explore the lamp collection.',
  switchLabel: 'Switch to Arabic', switchText: 'العربية',
};

const arabic = {
  title: 'بعد ساعات العمل', pageTitle: 'بعد ساعات العمل | فاستهاوس',
  subtitle: 'أربعة مصابيح، وثلاث حكايات تنتظر من يكتشفها. قليلٌ من الفضول يبلغ بك بعيداً.',
  home: 'فاستهاوس، الصفحة الرئيسية', back: 'العودة إلى المجموعة',
  findLight: 'اعثر على النور.', unlock: 'افتح خصماً بنسبة ١٠٪.', gameLabel: 'لعبة فاستهاوس لتخمين المصابيح',
  studio: 'الاستوديو', afterHours: '/ بعد ساعات العمل',
  progress: '{found} / {total} مضاءة', progressLabel: '{found} من {total} مصابيح مضاءة',
  chooseGroup: 'اختر مصباحاً من الرفوف', chooseLamp: 'اختر المصباح {number}: {description}', chooseLabel: 'اختر المصباح {number}',
  keeper: 'حارس الاستوديو', portrait: 'صورة بكسلية لحارس الاستوديو', fullText: 'أظهر النص كاملاً', you: 'أنت',
  startTitle: 'هل أنت مستعد لتجد النور؟', startDescription: 'أربعة مصابيح، وثلاث حكايات تنتظر من يكتشفها. قليلٌ من الفضول يبلغ بك بعيداً.',
  start: 'ابدأ اللعبة', duration: 'دقيقة واحدة تقريباً، بلا استعجال.',
  introRoom: 'حديثٌ صغير قبل أن تُضاء المصابيح.', completeRoom: 'الاستوديو أجمل بوجودك فيه.',
  revealRoom: 'فكرةٌ مضيئة، وقد وجدتَها.', guessRoom: 'أيُّ مصباحٍ أصف؟',
  replyTip: 'اختر ردّك للمتابعة', completeTip: 'اكتشفتَ الحكايات الثلاث', guessTip: 'انقر أو المس لاختيار المصباح',
  story: 'القصة {number} من {total}', guessDetail: 'اختر المصباح الموجود على الرف. اتبع عينيك.',
  hint: 'تلميح آخر', hintsFree: 'التلميحات على حساب البيت.', hintCount: '{count} / {total}',
  wrong: 'لهذا المصباح حكايةٌ أخرى. جرّب مصباحاً آخر، أو اطلب تلميحاً.',
  reveal: 'هذا هو «{name}».', next: 'القصة التالية', openReward: 'افتح مكافأتي',
  remainingTwo: 'بقيت قصتان لاكتشافهما.', remainingOne: 'بقيت قصةٌ واحدة لاكتشافها.', perfect: 'ثلاثة من ثلاثة. عينٌ ثاقبة.',
  soundOn: 'الصوت يعمل', soundOff: 'الصوت متوقف', soundUnavailable: 'الصوت غير متاح في هذا المتصفّح. يمكنك متابعة اللعب.',
  restart: 'ابدأ من جديد', replay: 'العب من جديد',
  rewardTitle: 'لديك عينٌ خبيرة بهذا الأمر.', rewardDetail: 'ثلاث أفكار مضيئة، وقد وجدتَها. شكرٌ صغير على فضولك.',
  discount: '١٠٪', off: 'خصم', demoReward: 'مكافأتك التجريبية', copy: 'انسخ الرمز', copied: 'تم النسخ',
  copyIdle: 'رمز تجريبي، غير مفعّل عند الدفع بعد.', copySuccess: 'تم النسخ. هذا الرمز التجريبي غير مفعّل عند الدفع بعد.',
  copyManual: 'حدّد الرمز AFTERHOURS10 وانسخه. هو رمز تجريبي غير مفعّل عند الدفع.',
  explore: 'استكشف المجموعة', productAlt: 'مصباح الطاولة «{name}»', footer: 'لعبة صغيرة من فاستهاوس. صُنعت لأصحاب العقول الفضولية.',
  prototype: 'صفحة تجريبية · الخصم غير مفعّل', noScript: 'تحتاج هذه اللعبة إلى جافاسكربت. لا يزال بإمكانك استكشاف مجموعة المصابيح.',
  switchLabel: 'Switch to English', switchText: 'English',
};

const arabicIntro = [
  {label: 'ترحيب', line: 'أهلاً بك. أدركتني بعد ساعات العمل.', detail: 'تفضّل بالدخول. هناك دائماً متّسعٌ لعقلٍ فضولي آخر.', reply: 'أهلاً! ما هذا المكان؟'},
  {label: 'دردشة قصيرة', line: 'أهلاً بك في فاستهاوس. لكل مصباحٍ هنا حكاية.', detail: 'بعضها يبدأ بلؤلؤة، وبعضها بتموّجة، وبعضها بشكلٍ يتكرر. ما رأيك بلعبة تخمين صغيرة؟', reply: 'كيف تعمل اللعبة؟'},
  {label: 'طريقة اللعب', line: 'سأعطيك تلميحاً، وعليك أن تختار المصباح.', detail: 'انقر أو المس أحد المصابيح على الرف. إن أصبتَ أضاء المصباح. اعثر على ثلاثة مصابيح لتفتح مكافأة الخصم بنسبة ١٠٪.', reply: 'ماذا لو أخطأت؟'},
  {label: 'جاهز متى شئت', line: 'نحاول من جديد. بلا مؤقّت، وبلا خسارة محاولات.', detail: 'يمكنك طلب تلميحٍ آخر متى شعرتَ بالحيرة. هل أنت مستعد للعثور على أول مصباح مُضاء؟', reply: 'هيا نجرّب.'},
];

const arabicLamps = {
  hamrah: {
    name: 'حمراء', description: 'غطاء أبيض مستدير فوق قاعدة حمراء',
    clue: 'قبل أن تعلو ناطحات السحاب، كان الناس هنا يفتّشون البحر عن شيءٍ ثمين. فأيُّ مصباحٍ يحمل تلك الحكاية؟',
    hints: ['فكّر في تراث الغوص على اللؤلؤ في دولة الإمارات.', 'غطاءٌ فاتح مستدير، كأنّه لؤلؤةٌ فوق البحر.', 'ابحث عن الغطاء الأبيض المستدير فوق القاعدة الحمراء.'],
    story: 'فكرةٌ كاللؤلؤة. يستلهم «حمراء» روحه من تراث الغوص على اللؤلؤ في دولة الإمارات.',
    note: 'تراث الغوص على اللؤلؤ، برؤيةٍ جديدة في الضوء.',
  },
  nujaj: {
    name: 'نُجاج', description: 'غطاء مخروطي بتجاويف طولية فوق قاعدة خضراء',
    clue: 'أبحث عن المصباح الذي يلعب بما يمكنك رؤيته من خلاله. فيه شيءٌ من الزجاج، وشيءٌ من الغموض.',
    hints: ['فكّر في الأسطح شبه الشفّافة ونعومة الزجاج المصنفر.', 'ابحث عن تجاويف طولية دقيقة في غطاءٍ مخروطي.', 'إنّه الغطاء ذو التجاويف الطولية فوق القاعدة الخضراء.'],
    story: 'من الواضح أن لديك عيناً خبيرة. يجمع «نُجاج» بين غطاءٍ شبه شفّاف بتجاويف طولية، وقاعدةٍ نحتية الطابع.',
    note: 'شفافيةٌ وملمسٌ وتجاويف طولية.',
  },
  kasane: {
    name: 'كاسانِه', description: 'غطاء واسع متموّج فوق قاعدة برتقالية',
    clue: 'تخيّل تموّجاً في رمال الصحراء قرّر أن يسكن في مكانه. ثم تخيّله وقد صار مصباحاً.',
    hints: ['فكّر في الرمل والخطوط المتدفقة والسطح المتكرر.', 'لغطائه الواسع حافةٌ متموّجة برفق.', 'ابحث عن الغطاء المتموّج فوق القاعدة البرتقالية.'],
    story: 'شيءٌ من الحركة، وقد سكن. يترجم «كاسانِه» تموّجات رمال الصحراء إلى إضاءةٍ نحتية.',
    note: 'تموّجات الصحراء، وقد صارت إضاءةً نحتية.',
  },
  nasaq: {
    name: 'نسق', description: 'ثلاث طبقات مستديرة متراصّة فوق قاعدة زرقاء',
    clue: 'شكلٌ واحد كان بدايةً جميلة. ثم جاء آخر، ثم آخر. فأيُّ مصباحٍ وجد إيقاعه في التكرار؟',
    hints: ['فكّر في التجريد والأشكال المستديرة المتكررة في مطلع العقد الثاني من الألفية.', 'ثلاث طبقات ناعمة، تتراصّ الواحدة فوق الأخرى.', 'ابحث عن الغطاء الأبيض المتراصّ فوق القاعدة الزرقاء.'],
    story: 'للأفكار الجميلة طبقات. يستكشف «نسق» الأشكال المستديرة المتراصّة والتجريد في مطلع العقد الثاني من الألفية.',
    note: 'تكرارٌ مستدير، بإيقاعٍ خاص.',
  },
};

export const TRANSLATIONS = {
  en: {ui: english, intro: INTRO_DIALOGUE, lamps: LAMPS},
  ar: {ui: arabic, intro: arabicIntro, lamps: LAMPS.map(lamp => ({...lamp, ...arabicLamps[lamp.id]}))},
};

const numbers = {en: new Intl.NumberFormat('en', {useGrouping:false}), ar: new Intl.NumberFormat('ar-AE-u-nu-arab', {useGrouping:false})};

export function translate(language, key, values = {}) {
  const locale = language === 'ar' ? 'ar' : 'en';
  return TRANSLATIONS[locale].ui[key].replace(/\{(\w+)\}/g, (_, name) => typeof values[name] === 'number' ? numbers[locale].format(values[name]) : String(values[name]));
}
