/* Yalla English – course content.
   Lesson format:
   t  title (Hebrew)      e  emoji
   w  words     "english|עברית|emoji"
   s  sentences "English sentence|תרגום"
   who  emoji of the character Sabi talks to
   d  dialogue  "a|English|עברית" (a = the character, b = you)
   tip  Sabi's tip (Hebrew)
*/
window.Y = window.Y || {};

Y.TRACKS = {
  base: 'הבסיס',
  travel: 'הטיול הגדול',
  life: 'חיי היומיום',
  work: 'עבודה וקריירה',
  kids: 'ילדים',
  pro: 'לדבר כמו מקומי'
};

Y.COURSE = [
  /* ───────────── BASE ───────────── */
  {
    id: 'u1', track: 'base', title: 'יאללה, מתחילים!', sub: 'ברכות, היכרות ומספרים', emoji: '👋',
    color: ['#2B5BF0', '#1C40BD'], scene: 'city', free: true,
    lessons: [
      { t: 'שלום ולהתראות', e: '👋', who: '👩',
        w: ['hello|שלום|👋', 'goodbye|להתראות|🙋', 'please|בבקשה|🙏', 'thank you|תודה|💙', 'yes|כן|✅', 'no|לא|❌'],
        s: ['Hello, my friend|שלום, חבר שלי', 'Yes, please|כן, בבקשה', 'No, thank you|לא, תודה', 'Goodbye, see you soon|להתראות, נתראה בקרוב'],
        d: ['a|Hello! Welcome!|שלום! ברוך הבא!', 'b|Hello! Thank you.|שלום! תודה.', 'a|Would you like some coffee?|תרצה קפה?', 'b|Yes, please!|כן, בבקשה!'],
        tip: 'באנגלית אומרים please כמעט על כל בקשה. בלי זה זה נשמע חצוף, גם אם בעברית זה לגמרי בסדר.' },
      { t: 'נעים מאוד', e: '🤝', who: '🧑',
        w: ['name|שם|🏷️', 'I|אני|🙋', 'you|אתה / את|🫵', 'my|שלי|👜', 'friend|חבר|🤝', 'Israel|ישראל|🇮🇱'],
        s: ['My name is Dan|השם שלי דן', 'I am from Israel|אני מישראל', 'Nice to meet you|נעים להכיר', 'What is your name?|מה השם שלך?'],
        d: ['a|Hi! What is your name?|היי! מה השם שלך?', 'b|My name is Noa.|השם שלי נועה.', 'a|Where are you from?|מאיפה את?', 'b|I am from Israel.|אני מישראל.'],
        tip: 'את I (אני) כותבים תמיד באות גדולה, גם באמצע המשפט.' },
      { t: 'מה נשמע?', e: '😊', who: '👱‍♀️',
        w: ['good|טוב|👍', 'bad|רע|👎', 'tired|עייף|😴', 'happy|שמח|😊', 'hungry|רעב|🤤', 'great|מעולה|🤩'],
        s: ['How are you?|מה שלומך?', 'I am good, thanks|אני בסדר, תודה', 'I am very tired|אני מאוד עייף', 'I am so hungry|אני כל כך רעב'],
        d: ['a|Hi! How are you?|היי! מה שלומך?', 'b|I am great, and you?|אני מעולה, ואת?', 'a|I am a little tired.|אני קצת עייפה.', 'b|Let\'s get some coffee!|בואי נשתה קפה!'],
        tip: 'כששואלים How are you? לא באמת מצפים לסיפור חיים. עונים Good, thanks וממשיכים.' },
      { t: 'מספרים 1 עד 10', e: '🔢', who: '🧑‍💼',
        w: ['one|אחת|1️⃣', 'two|שתיים|2️⃣', 'three|שלוש|3️⃣', 'five|חמש|5️⃣', 'seven|שבע|7️⃣', 'ten|עשר|🔟'],
        s: ['I have two brothers|יש לי שני אחים', 'Three coffees, please|שלושה קפה, בבקשה', 'One ticket, please|כרטיס אחד, בבקשה', 'Five minutes, please|חמש דקות, בבקשה'],
        d: ['a|How many tickets?|כמה כרטיסים?', 'b|Two tickets, please.|שני כרטיסים, בבקשה.', 'a|That is ten dollars.|זה עשרה דולר.', 'b|Here you go. Thank you!|בבקשה. תודה!'],
        tip: 'three מתחיל ב־th: מוציאים טיפה את הלשון בין השיניים. זה לא "טרי" וגם לא "סרי".' }
    ]
  },
  {
    id: 'u2', track: 'base', title: 'אני והמשפחה', sub: 'משפחה, גיל ותיאורים', emoji: '👨‍👩‍👧',
    color: ['#E0892B', '#B56A16'], scene: 'home', free: true,
    lessons: [
      { t: 'המשפחה שלי', e: '👨‍👩‍👧', who: '👵',
        w: ['mother|אמא|👩', 'father|אבא|👨', 'brother|אח|👦', 'sister|אחות|👧', 'family|משפחה|👨‍👩‍👧', 'baby|תינוק|👶'],
        s: ['This is my mother|זאת אמא שלי', 'I have one sister|יש לי אחות אחת', 'My family is big|המשפחה שלי גדולה', 'My brother is a soldier|אח שלי חייל'],
        d: ['a|Is this your family?|זאת המשפחה שלך?', 'b|Yes, this is my mother.|כן, זאת אמא שלי.', 'a|Do you have brothers?|יש לך אחים?', 'b|I have one brother and one sister.|יש לי אח אחד ואחות אחת.'],
        tip: 'בעברית אומרים "יש לי", באנגלית אומרים I have. אין מילה נפרדת ל"יש".' },
      { t: 'בן כמה אתה?', e: '🎂', who: '👨‍🏫',
        w: ['old|זקן / בן (גיל)|🧓', 'young|צעיר|🧒', 'year|שנה|📅', 'birthday|יום הולדת|🎂', 'twenty|עשרים|🎈', 'age|גיל|🔢'],
        s: ['How old are you?|בן כמה אתה?', 'I am twenty years old|אני בן עשרים', 'Today is my birthday|היום יום ההולדת שלי', 'She is very young|היא מאוד צעירה'],
        d: ['a|How old are you?|בן כמה אתה?', 'b|I am twenty years old.|אני בן עשרים.', 'a|When is your birthday?|מתי יום ההולדת שלך?', 'b|Today is my birthday!|היום יום ההולדת שלי!'],
        tip: 'טעות ישראלית קלאסית: I have 20 years. באנגלית גיל זה "להיות": I am 20.' },
      { t: 'הוא, היא, אנחנו', e: '🧑‍🤝‍🧑', who: '🧔',
        w: ['he|הוא|👦', 'she|היא|👧', 'we|אנחנו|👫', 'they|הם|👥', 'tall|גבוה|🦒', 'funny|מצחיק|😂'],
        s: ['He is my friend|הוא חבר שלי', 'She is very funny|היא מאוד מצחיקה', 'We are from Tel Aviv|אנחנו מתל אביב', 'They are tall|הם גבוהים'],
        d: ['a|Who is she?|מי היא?', 'b|She is my sister.|היא אחות שלי.', 'a|And who are they?|ומי הם?', 'b|They are my friends.|הם החברים שלי.'],
        tip: 'I am, he is, she is, we are, they are. הפועל "להיות" משתנה, ובעברית הוא פשוט לא קיים בהווה.' },
      { t: 'הבית שלי', e: '🏠', who: '👩‍🦰',
        w: ['house|בית|🏠', 'room|חדר|🚪', 'kitchen|מטבח|🍳', 'bed|מיטה|🛏️', 'door|דלת|🚪', 'window|חלון|🪟'],
        s: ['This is my house|זה הבית שלי', 'My room is small|החדר שלי קטן', 'The kitchen is big|המטבח גדול', 'Please open the window|בבקשה תפתח את החלון'],
        d: ['a|Welcome to my house!|ברוך הבא לבית שלי!', 'b|Wow, it is very big!|וואו, הוא מאוד גדול!', 'a|This is the kitchen.|זה המטבח.', 'b|I love your kitchen.|אני אוהב את המטבח שלך.'],
        tip: 'באנגלית התואר בא לפני שם העצם: a big house, ולא house big.' }
    ]
  },
  {
    id: 'u3', track: 'base', title: 'אוכל ושתייה', sub: 'להזמין, לבקש ולשלם', emoji: '🍔',
    color: ['#E5484D', '#B93237'], scene: 'cafe',
    lessons: [
      { t: 'מה אוכלים?', e: '🍕', who: '👨‍🍳',
        w: ['water|מים|💧', 'bread|לחם|🍞', 'chicken|עוף|🍗', 'rice|אורז|🍚', 'salad|סלט|🥗', 'cheese|גבינה|🧀'],
        s: ['I want water, please|אני רוצה מים, בבקשה', 'I love chicken and rice|אני אוהב עוף ואורז', 'The salad is very good|הסלט מאוד טוב', 'Bread and cheese, please|לחם וגבינה, בבקשה'],
        d: ['a|What would you like to eat?|מה תרצה לאכול?', 'b|Chicken and rice, please.|עוף ואורז, בבקשה.', 'a|And to drink?|ולשתות?', 'b|Just water, thank you.|רק מים, תודה.'],
        tip: 'במקום I want (אני רוצה) נשמע הרבה יותר מנומס לומר I would like או Can I have.' },
      { t: 'בבית הקפה', e: '☕', who: '👩‍🍳',
        w: ['coffee|קפה|☕', 'tea|תה|🍵', 'milk|חלב|🥛', 'sugar|סוכר|🍬', 'cake|עוגה|🍰', 'juice|מיץ|🧃'],
        s: ['Can I have a coffee?|אפשר לקבל קפה?', 'Coffee with milk, please|קפה עם חלב, בבקשה', 'No sugar, thank you|בלי סוכר, תודה', 'I would like some cake|אני רוצה עוגה'],
        d: ['a|Hi! What can I get you?|היי! מה להביא לך?', 'b|Can I have a coffee with milk?|אפשר קפה עם חלב?', 'a|Sure. Anything else?|בטח. עוד משהו?', 'b|A piece of cake, please.|חתיכת עוגה, בבקשה.'],
        tip: 'אין "קפה הפוך" בחו"ל. הכי קרוב זה latte או cappuccino.' },
      { t: 'במסעדה', e: '🍽️', who: '🤵',
        w: ['menu|תפריט|📋', 'table|שולחן|🪑', 'waiter|מלצר|🤵', 'bill|חשבון|🧾', 'spicy|חריף|🌶️', 'delicious|טעים מאוד|😋'],
        s: ['A table for two, please|שולחן לשניים, בבקשה', 'Can I see the menu?|אפשר לראות את התפריט?', 'The food is delicious|האוכל טעים מאוד', 'Can we have the bill?|אפשר לקבל את החשבון?'],
        d: ['a|Good evening. A table for two?|ערב טוב. שולחן לשניים?', 'b|Yes, please. Can I see the menu?|כן, בבקשה. אפשר לראות את התפריט?', 'a|Of course. Is spicy food okay?|כמובן. אוכל חריף זה בסדר?', 'b|Not too spicy, please.|לא חריף מדי, בבקשה.'],
        tip: 'בארה"ב קוראים לחשבון check, בבריטניה bill. ובארה"ב משאירים טיפ של 18 עד 20 אחוז.' },
      { t: 'אני אוהב, אני לא אוהב', e: '❤️', who: '👩‍🦱',
        w: ['like|אוהב (מחבב)|👍', 'love|אוהב מאוד|❤️', 'hate|שונא|😖', 'sweet|מתוק|🍭', 'hot|חם|🔥', 'cold|קר|🧊'],
        s: ['I like sweet food|אני אוהב אוכל מתוק', 'I do not like fish|אני לא אוהב דגים', 'The soup is too hot|המרק חם מדי', 'Do you like pizza?|אתה אוהב פיצה?'],
        d: ['a|Do you like spicy food?|את אוהבת אוכל חריף?', 'b|No, I do not like spicy food.|לא, אני לא אוהבת אוכל חריף.', 'a|What do you love?|מה את ממש אוהבת?', 'b|I love ice cream!|אני מתה על גלידה!'],
        tip: 'שלילה בהווה: I do not like (או בקיצור I don\'t like). לא אומרים I not like.' }
    ]
  },

  /* ───────────── TRAVEL ───────────── */
  {
    id: 'u4', track: 'travel', title: 'בשדה התעופה', sub: 'צ׳ק אין, ביקורת דרכונים וטיסה', emoji: '✈️',
    color: ['#1390A8', '#0C6C7F'], scene: 'airport',
    lessons: [
      { t: 'צ׳ק אין', e: '🛄', who: '👩‍✈️',
        w: ['passport|דרכון|🛂', 'ticket|כרטיס|🎫', 'flight|טיסה|✈️', 'bag|תיק|🎒', 'suitcase|מזוודה|🧳', 'gate|שער|🚪'],
        s: ['Here is my passport|הנה הדרכון שלי', 'I have one suitcase|יש לי מזוודה אחת', 'Where is gate seven?|איפה שער שבע?', 'My flight is at ten|הטיסה שלי בעשר'],
        d: ['a|Good morning. Passport, please.|בוקר טוב. דרכון, בבקשה.', 'b|Here is my passport.|הנה הדרכון שלי.', 'a|How many bags do you have?|כמה תיקים יש לך?', 'b|One suitcase and one bag.|מזוודה אחת ותיק אחד.'],
        tip: 'carry-on זה תיק שעולה איתך למטוס. checked bag זו המזוודה שנשלחת לבטן המטוס.' },
      { t: 'ביקורת דרכונים', e: '🛂', who: '👮',
        w: ['visit|ביקור|🧭', 'vacation|חופשה|🏖️', 'week|שבוע|🗓️', 'month|חודש|📆', 'hotel|מלון|🏨', 'alone|לבד|🧍'],
        s: ['I am here on vacation|אני פה בחופשה', 'I will stay for two weeks|אני אשאר שבועיים', 'I am staying at a hotel|אני מתארח במלון', 'I am traveling alone|אני מטייל לבד'],
        d: ['a|What is the purpose of your visit?|מה מטרת הביקור שלך?', 'b|I am here on vacation.|אני פה בחופשה.', 'a|How long will you stay?|כמה זמן תישאר?', 'b|I will stay for two weeks.|אני אשאר שבועיים.'],
        tip: 'בביקורת דרכונים עונים קצר ולעניין. Vacation, two weeks, וזהו. בלי בדיחות.' },
      { t: 'במטוס', e: '💺', who: '👨‍✈️',
        w: ['seat|מושב|💺', 'window|חלון|🪟', 'aisle|מעבר|↔️', 'blanket|שמיכה|🛌', 'seat belt|חגורת בטיחות|🔒', 'landing|נחיתה|🛬'],
        s: ['Excuse me, this is my seat|סליחה, זה המושב שלי', 'Can I have a blanket?|אפשר לקבל שמיכה?', 'I want a window seat|אני רוצה מושב ליד החלון', 'Please fasten your seat belt|נא להדק את חגורת הבטיחות'],
        d: ['a|Chicken or pasta?|עוף או פסטה?', 'b|Chicken, please.|עוף, בבקשה.', 'a|Anything to drink?|משהו לשתות?', 'b|Can I have some water?|אפשר קצת מים?'],
        tip: 'aisle (מעבר) נשמע כמו "אַייל". ה־s שקטה לגמרי.' },
      { t: 'אבדה לי המזוודה', e: '🧳', who: '👩‍💼',
        w: ['lost|אבוד|❓', 'help|עזרה|🆘', 'color|צבע|🎨', 'black|שחור|⚫', 'address|כתובת|📍', 'phone|טלפון|📱'],
        s: ['I lost my suitcase|איבדתי את המזוודה שלי', 'Can you help me?|אתה יכול לעזור לי?', 'My bag is black|התיק שלי שחור', 'This is my phone number|זה מספר הטלפון שלי'],
        d: ['a|Hello, how can I help you?|שלום, איך אפשר לעזור?', 'b|I lost my suitcase.|איבדתי את המזוודה שלי.', 'a|What color is it?|באיזה צבע היא?', 'b|It is black and very big.|היא שחורה ומאוד גדולה.'],
        tip: 'Can you help me? היא אולי המשפט הכי שימושי בטיול. שווה לשנן.' }
    ]
  },
  {
    id: 'u5', track: 'travel', title: 'מלון והוסטל', sub: 'הזמנה, חדר ובעיות קטנות', emoji: '🏨',
    color: ['#7A4FE0', '#5B36B8'], scene: 'hotel',
    lessons: [
      { t: 'צ׳ק אין במלון', e: '🛎️', who: '🧑‍💼',
        w: ['reservation|הזמנה|📒', 'night|לילה|🌙', 'key|מפתח|🔑', 'floor|קומה|🏢', 'breakfast|ארוחת בוקר|🥐', 'single|יחיד|1️⃣'],
        s: ['I have a reservation|יש לי הזמנה', 'I am staying three nights|אני נשאר שלושה לילות', 'Is breakfast included?|ארוחת הבוקר כלולה?', 'Here is your key|הנה המפתח שלך'],
        d: ['a|Welcome! Do you have a reservation?|ברוך הבא! יש לך הזמנה?', 'b|Yes, my name is Cohen.|כן, השם שלי כהן.', 'a|Three nights, right?|שלושה לילות, נכון?', 'b|Yes. Is breakfast included?|כן. ארוחת הבוקר כלולה?'],
        tip: 'first floor בארה"ב זו קומת הקרקע. בבריטניה זו הקומה שמעל.' },
      { t: 'בהוסטל', e: '🛏️', who: '🧑‍🎤',
        w: ['dorm|חדר משותף|🛏️', 'locker|לוקר|🗄️', 'towel|מגבת|🧺', 'shower|מקלחת|🚿', 'cheap|זול|🪙', 'shared|משותף|🤝'],
        s: ['Do you have a cheap room?|יש לכם חדר זול?', 'I need a towel|אני צריך מגבת', 'Where is the shower?|איפה המקלחת?', 'Is the kitchen shared?|המטבח משותף?'],
        d: ['a|Hey! Looking for a bed?|היי! מחפש מיטה?', 'b|Yes, do you have a cheap dorm?|כן, יש לכם חדר משותף זול?', 'a|Sure, fifteen dollars a night.|בטח, חמישה עשר דולר ללילה.', 'b|Great. Is there a locker?|מעולה. יש לוקר?'],
        tip: 'בהוסטלים שואלים תמיד Is there a locker? ומביאים מנעול מהבית.' },
      { t: 'משהו לא עובד', e: '🔧', who: '👨‍🔧',
        w: ['broken|שבור|💔', 'dirty|מלוכלך|🧹', 'noisy|רועש|🔊', 'clean|נקי|✨', 'problem|בעיה|⚠️', 'air conditioner|מזגן|❄️'],
        s: ['The shower is broken|המקלחת שבורה', 'The room is dirty|החדר מלוכלך', 'There is a problem|יש בעיה', 'Can I change rooms?|אפשר להחליף חדר?'],
        d: ['a|Reception, how can I help?|קבלה, איך אפשר לעזור?', 'b|The air conditioner is broken.|המזגן שבור.', 'a|I am sorry. I will send someone.|אני מצטער. אשלח מישהו.', 'b|Thank you. Can I change rooms?|תודה. אפשר להחליף חדר?'],
        tip: 'There is a problem with... היא פתיחה מנומסת לכל תלונה. עובדת יותר טוב מצעקות.' },
      { t: 'צ׳ק אאוט', e: '🧾', who: '👩‍💼',
        w: ['check out|צ׳ק אאוט|🚶', 'late|מאוחר|🕙', 'early|מוקדם|🌅', 'pay|לשלם|💳', 'cash|מזומן|💵', 'receipt|קבלה|🧾'],
        s: ['I would like to check out|אני רוצה לעשות צ׳ק אאוט', 'Can I pay by card?|אפשר לשלם בכרטיס?', 'Can I leave my bag here?|אפשר להשאיר פה את התיק?', 'Can I have a receipt?|אפשר לקבל קבלה?'],
        d: ['a|Good morning! Checking out?|בוקר טוב! עושה צ׳ק אאוט?', 'b|Yes. Can I pay by card?|כן. אפשר לשלם בכרטיס?', 'a|Of course. Here is your receipt.|כמובן. הנה הקבלה שלך.', 'b|Can I leave my bag here?|אפשר להשאיר פה את התיק?'],
        tip: 'receipt נשמע "ריסיט". ה־p שקטה.' }
    ]
  },
  {
    id: 'u6', track: 'travel', title: 'להסתדר בעיר', sub: 'כיוונים, תחבורה ומוניות', emoji: '🗺️',
    color: ['#1E9E6A', '#157A50'], scene: 'street',
    lessons: [
      { t: 'איפה זה?', e: '📍', who: '👮‍♀️',
        w: ['left|שמאל|⬅️', 'right|ימין|➡️', 'straight|ישר|⬆️', 'near|קרוב|📍', 'far|רחוק|🛣️', 'street|רחוב|🏙️'],
        s: ['Where is the bank?|איפה הבנק?', 'Turn left at the corner|תפנה שמאלה בפינה', 'Go straight ahead|לך ישר', 'Is it far from here?|זה רחוק מכאן?'],
        d: ['a|Can I help you?|אפשר לעזור לך?', 'b|Yes, where is the train station?|כן, איפה תחנת הרכבת?', 'a|Go straight and turn right.|לך ישר ותפנה ימינה.', 'b|Is it far from here?|זה רחוק מכאן?'],
        tip: 'פותחים תמיד ב־Excuse me לפני שעוצרים מישהו ברחוב.' },
      { t: 'אוטובוס ורכבת', e: '🚆', who: '🧑‍✈️',
        w: ['bus|אוטובוס|🚌', 'train|רכבת|🚆', 'station|תחנה|🚉', 'stop|תחנה (עצירה)|🚏', 'next|הבא|⏭️', 'platform|רציף|🛤️'],
        s: ['Where is the bus stop?|איפה תחנת האוטובוס?', 'One ticket to London, please|כרטיס אחד ללונדון, בבקשה', 'When is the next train?|מתי הרכבת הבאה?', 'Which platform is it?|איזה רציף זה?'],
        d: ['a|Next, please!|הבא בתור, בבקשה!', 'b|One ticket to London, please.|כרטיס אחד ללונדון, בבקשה.', 'a|One way or return?|כיוון אחד או הלוך ושוב?', 'b|Return, please. Which platform?|הלוך ושוב, בבקשה. איזה רציף?'],
        tip: 'הלוך ושוב: return בבריטניה, round trip בארה"ב. כיוון אחד: one way.' },
      { t: 'במונית', e: '🚕', who: '🧑‍🦲',
        w: ['taxi|מונית|🚕', 'driver|נהג|🧑‍✈️', 'airport|שדה תעופה|🛫', 'meter|מונה|⏱️', 'here|כאן|📌', 'change|עודף|🪙'],
        s: ['To the airport, please|לשדה התעופה, בבקשה', 'How much is it?|כמה זה עולה?', 'Please use the meter|תפעיל מונה, בבקשה', 'Stop here, please|תעצור כאן, בבקשה'],
        d: ['a|Where to?|לאן?', 'b|To the airport, please.|לשדה התעופה, בבקשה.', 'a|No problem. Any bags?|אין בעיה. יש תיקים?', 'b|Just one. How much is it?|רק אחד. כמה זה עולה?'],
        tip: 'Keep the change פירושו "שמור את העודף". ככה משאירים טיפ לנהג.' },
      { t: 'הלכתי לאיבוד', e: '🧭', who: '👴',
        w: ['map|מפה|🗺️', 'lost|אבוד|😵', 'corner|פינה|↪️', 'bridge|גשר|🌉', 'museum|מוזיאון|🏛️', 'beach|חוף|🏖️'],
        s: ['I am lost|הלכתי לאיבוד', 'Can you show me on the map?|אתה יכול להראות לי במפה?', 'How do I get to the beach?|איך מגיעים לחוף?', 'It is next to the museum|זה ליד המוזיאון'],
        d: ['a|Are you okay?|אתה בסדר?', 'b|I am lost. Where is the museum?|הלכתי לאיבוד. איפה המוזיאון?', 'a|It is next to the bridge.|זה ליד הגשר.', 'b|Can you show me on the map?|אתה יכול להראות לי במפה?'],
        tip: 'How do I get to...? עובד לכל יעד: חוף, מלון, שדה תעופה.' }
    ]
  },
  {
    id: 'u7', track: 'travel', title: 'קניות וכסף', sub: 'מחירים, מידות והתמקחות', emoji: '🛍️',
    color: ['#D6408F', '#A82C6D'], scene: 'shop',
    lessons: [
      { t: 'כמה זה עולה?', e: '💵', who: '👩‍💼',
        w: ['price|מחיר|🏷️', 'money|כסף|💵', 'expensive|יקר|💎', 'cheap|זול|🪙', 'buy|לקנות|🛒', 'free|חינם|🎁'],
        s: ['How much is this?|כמה זה עולה?', 'It is too expensive|זה יקר מדי', 'I want to buy this|אני רוצה לקנות את זה', 'Is it free?|זה בחינם?'],
        d: ['a|Hi! Can I help you?|היי! אפשר לעזור?', 'b|How much is this?|כמה זה עולה?', 'a|It is fifty dollars.|זה חמישים דולר.', 'b|Wow, it is too expensive.|וואו, זה יקר מדי.'],
        tip: 'free זה גם "חינם" וגם "חופשי". Are you free tonight? פירושו "אתה פנוי הערב?"' },
      { t: 'בגדים ומידות', e: '👕', who: '🧑‍🎨',
        w: ['shirt|חולצה|👕', 'pants|מכנסיים|👖', 'shoes|נעליים|👟', 'size|מידה|📏', 'small|קטן|🐜', 'large|גדול|🐘'],
        s: ['Do you have this in large?|יש לכם את זה בגדול?', 'Can I try it on?|אפשר למדוד?', 'What size are you?|איזו מידה אתה?', 'These shoes are too small|הנעליים האלה קטנות מדי'],
        d: ['a|That shirt looks great!|החולצה הזאת נראית מעולה!', 'b|Do you have this in large?|יש לכם את זה בגדול?', 'a|Yes, here you go.|כן, בבקשה.', 'b|Thanks. Can I try it on?|תודה. אפשר למדוד?'],
        tip: 'בבריטניה pants זה תחתונים. מכנסיים שם הם trousers. שווה לזכור לפני שמחמיאים למישהו.' },
      { t: 'בשוק', e: '🧺', who: '🧑‍🌾',
        w: ['market|שוק|🧺', 'discount|הנחה|🔖', 'deal|עסקה|🤝', 'best|הכי טוב|🥇', 'half|חצי|➗', 'fresh|טרי|🌿'],
        s: ['Can I get a discount?|אפשר לקבל הנחה?', 'What is your best price?|מה המחיר הכי טוב שלך?', 'That is a good deal|זאת עסקה טובה', 'I will take two|אני אקח שניים'],
        d: ['a|Fresh mangoes! Five dollars!|מנגו טרי! חמישה דולר!', 'b|What is your best price?|מה המחיר הכי טוב שלך?', 'a|For you, four dollars.|בשבילך, ארבעה דולר.', 'b|Okay, I will take two.|אוקיי, אני אקח שניים.'],
        tip: 'להתמקח זה to bargain. בשווקים באסיה ובדרום אמריקה זה חלק מהמשחק, בחנויות באירופה פחות.' },
      { t: 'בקופה', e: '💳', who: '👩‍🦰',
        w: ['card|כרטיס אשראי|💳', 'cash|מזומן|💵', 'bag|שקית|🛍️', 'receipt|קבלה|🧾', 'return|להחזיר|↩️', 'line|תור|🚶'],
        s: ['Can I pay by card?|אפשר לשלם בכרטיס?', 'I do not need a bag|אני לא צריך שקית', 'Can I return this?|אפשר להחזיר את זה?', 'Is this the line?|זה התור?'],
        d: ['a|Cash or card?|מזומן או כרטיס?', 'b|Card, please.|כרטיס, בבקשה.', 'a|Do you need a bag?|צריך שקית?', 'b|No, thanks. Can I have the receipt?|לא, תודה. אפשר את הקבלה?'],
        tip: 'בחו"ל עומדים בתור. באמת. line בארה"ב, queue בבריטניה.' }
    ]
  },

  /* ───────────── LIFE ───────────── */
  {
    id: 'u8', track: 'life', title: 'זמן ושגרה', sub: 'ימים, שעות ומזג אוויר', emoji: '⏰',
    color: ['#2B5BF0', '#1C40BD'], scene: 'home',
    lessons: [
      { t: 'ימי השבוע', e: '📅', who: '👩‍🏫',
        w: ['Sunday|יום ראשון|☀️', 'Monday|יום שני|🌙', 'Friday|יום שישי|🕯️', 'today|היום|📌', 'tomorrow|מחר|➡️', 'yesterday|אתמול|⬅️'],
        s: ['Today is Sunday|היום יום ראשון', 'See you tomorrow|נתראה מחר', 'I work on Monday|אני עובד ביום שני', 'Friday is my favorite day|שישי הוא היום האהוב עליי'],
        d: ['a|What day is it today?|איזה יום היום?', 'b|Today is Sunday.|היום יום ראשון.', 'a|Are you free tomorrow?|אתה פנוי מחר?', 'b|No, I work on Monday.|לא, אני עובד ביום שני.'],
        tip: 'בחו"ל שבוע העבודה מתחיל ביום שני. Sunday זה סוף שבוע, ולכן the weekend זה שבת וראשון.' },
      { t: 'מה השעה?', e: '🕒', who: '🧑‍💼',
        w: ['time|זמן / שעה|⏰', 'hour|שעה|🕐', 'minute|דקה|⏱️', 'morning|בוקר|🌅', 'evening|ערב|🌆', 'now|עכשיו|⚡'],
        s: ['What time is it?|מה השעה?', 'It is five o\'clock|השעה חמש', 'I wake up in the morning|אני קם בבוקר', 'I am busy right now|אני עסוק עכשיו'],
        d: ['a|Excuse me, what time is it?|סליחה, מה השעה?', 'b|It is five o\'clock.|השעה חמש.', 'a|Oh no, I am late!|אוי לא, אני מאחר!', 'b|Run! Good luck!|רוץ! בהצלחה!'],
        tip: 'AM זה לפני הצהריים, PM זה אחרי. 7 PM זה שבע בערב. שעון של 24 שעות כמעט לא בשימוש בארה"ב.' },
      { t: 'היום שלי', e: '🌅', who: '👩',
        w: ['wake up|להתעורר|⏰', 'work|לעבוד|💼', 'eat|לאכול|🍽️', 'sleep|לישון|😴', 'study|ללמוד|📚', 'always|תמיד|♾️'],
        s: ['I wake up at seven|אני מתעורר בשבע', 'I work every day|אני עובד כל יום', 'I always eat breakfast|אני תמיד אוכל ארוחת בוקר', 'I study English at night|אני לומד אנגלית בלילה'],
        d: ['a|When do you wake up?|מתי אתה קם?', 'b|I wake up at seven.|אני קם בשבע.', 'a|And when do you study?|ומתי אתה לומד?', 'b|I study English at night.|אני לומד אנגלית בלילה.'],
        tip: 'אחרי he, she ו־it מוסיפים s לפועל: I work, אבל he works.' },
      { t: 'מזג האוויר', e: '🌤️', who: '🧑‍🌾',
        w: ['sun|שמש|☀️', 'rain|גשם|🌧️', 'wind|רוח|💨', 'snow|שלג|❄️', 'warm|חמים|🌡️', 'cloudy|מעונן|☁️'],
        s: ['It is hot today|חם היום', 'It is raining now|יורד גשם עכשיו', 'I love the snow|אני אוהב שלג', 'Tomorrow will be cloudy|מחר יהיה מעונן'],
        d: ['a|Nice weather today!|מזג אוויר יפה היום!', 'b|Yes, it is warm and sunny.|כן, חמים ושמשי.', 'a|But tomorrow it will rain.|אבל מחר ירד גשם.', 'b|Oh no, I love the sun!|אוי לא, אני אוהב שמש!'],
        tip: 'מזג אוויר הוא נושא השיחה הבטוח ביותר עם בריטים. It is hot today תמיד עובד.' }
    ]
  },
  {
    id: 'u9', track: 'life', title: 'חברים ובילויים', sub: 'תחביבים, הזמנות ורגשות', emoji: '🎉',
    color: ['#E0892B', '#B56A16'], scene: 'party',
    lessons: [
      { t: 'תחביבים', e: '🎸', who: '🧑‍🎤',
        w: ['music|מוזיקה|🎵', 'movie|סרט|🎬', 'sport|ספורט|⚽', 'read|לקרוא|📖', 'play|לשחק / לנגן|🎮', 'dance|לרקוד|💃'],
        s: ['I love music|אני אוהב מוזיקה', 'I play the guitar|אני מנגן בגיטרה', 'Do you like sports?|אתה אוהב ספורט?', 'We watch movies together|אנחנו רואים סרטים ביחד'],
        d: ['a|What do you do for fun?|מה אתה עושה בשביל הכיף?', 'b|I play the guitar.|אני מנגן בגיטרה.', 'a|Cool! Do you like movies?|מגניב! אתה אוהב סרטים?', 'b|Yes, I love action movies.|כן, אני מת על סרטי אקשן.'],
        tip: 'play משמש גם למשחק וגם לנגינה: play football, play the guitar.' },
      { t: 'יוצאים הערב?', e: '🍻', who: '👩‍🎤',
        w: ['tonight|הערב|🌃', 'party|מסיבה|🎉', 'bar|בר|🍸', 'together|ביחד|👫', 'maybe|אולי|🤔', 'sure|בטח|👌'],
        s: ['Are you free tonight?|אתה פנוי הערב?', 'Let\'s go to a party|בוא נלך למסיבה', 'Do you want to come?|אתה רוצה לבוא?', 'Maybe next time|אולי בפעם הבאה'],
        d: ['a|Are you free tonight?|אתה פנוי הערב?', 'b|Sure! What is the plan?|בטח! מה התוכנית?', 'a|Let\'s go to a bar.|בוא נלך לבר.', 'b|Sounds good. See you at nine!|נשמע טוב. נתראה בתשע!'],
        tip: 'Let\'s (בוא נ...) ואחריו פועל בלי to: Let\'s go, Let\'s eat.' },
      { t: 'איך אתה מרגיש?', e: '🥰', who: '🧑‍⚕️',
        w: ['sad|עצוב|😢', 'angry|כועס|😠', 'excited|נרגש|🤩', 'scared|מפחד|😱', 'bored|משועמם|🥱', 'proud|גאה|🦁'],
        s: ['I am so excited|אני כל כך נרגש', 'Why are you sad?|למה אתה עצוב?', 'I am bored at home|משעמם לי בבית', 'I am proud of you|אני גאה בך'],
        d: ['a|You look happy today!|אתה נראה שמח היום!', 'b|Yes, I am so excited.|כן, אני כל כך נרגש.', 'a|Why? What happened?|למה? מה קרה?', 'b|I am flying to Thailand tomorrow!|אני טס מחר לתאילנד!'],
        tip: 'I am bored זה "משעמם לי". I am boring זה "אני משעמם". לא להתבלבל.' },
      { t: 'שיחת חולין', e: '💬', who: '👨‍🦰',
        w: ['weekend|סוף שבוע|🛋️', 'weather|מזג אוויר|🌤️', 'job|עבודה|💼', 'trip|טיול|🎒', 'really|באמת|❗', 'amazing|מדהים|🤯'],
        s: ['How was your weekend?|איך היה סוף השבוע שלך?', 'What do you do?|במה אתה עובד?', 'That sounds amazing|זה נשמע מדהים', 'Really? Tell me more|באמת? ספר לי עוד'],
        d: ['a|How was your weekend?|איך היה סוף השבוע שלך?', 'b|It was amazing. I went on a trip.|היה מדהים. יצאתי לטיול.', 'a|Really? Where?|באמת? לאן?', 'b|To the north. And you?|לצפון. ואתה?'],
        tip: 'What do you do? זו לא שאלה על מה אתה עושה כרגע, אלא "במה אתה עובד?"' }
    ]
  },

  /* ───────────── WORK ───────────── */
  {
    id: 'u10', track: 'work', title: 'עבודה וקריירה', sub: 'ראיון, משרד, מיילים וישיבות', emoji: '💼',
    color: ['#33479E', '#22317A'], scene: 'office',
    lessons: [
      { t: 'ראיון עבודה', e: '🤝', who: '👩‍💼',
        w: ['interview|ראיון|🎤', 'experience|ניסיון|🏅', 'team|צוות|👥', 'skill|כישור|🧠', 'salary|משכורת|💰', 'manager|מנהל|🧑‍💼'],
        s: ['Tell me about yourself|ספר לי על עצמך', 'I have three years of experience|יש לי שלוש שנות ניסיון', 'I work well in a team|אני עובד טוב בצוות', 'I learn very fast|אני לומד מהר מאוד'],
        d: ['a|Tell me about yourself.|ספר לי על עצמך.', 'b|I was a team leader in the army.|הייתי מפקד צוות בצבא.', 'a|What are your skills?|מה הכישורים שלך?', 'b|I learn fast and I work well in a team.|אני לומד מהר ועובד טוב בצוות.'],
        tip: 'שירות צבאי מתרגמים לשפה אזרחית: I led a team of ten people נשמע מצוין בראיון.' },
      { t: 'במשרד', e: '🖥️', who: '🧑‍💻',
        w: ['meeting|ישיבה|📊', 'deadline|דדליין|⏳', 'project|פרויקט|📁', 'email|מייל|📧', 'busy|עסוק|🏃', 'break|הפסקה|☕'],
        s: ['I have a meeting at ten|יש לי ישיבה בעשר', 'The deadline is tomorrow|הדדליין מחר', 'I am busy right now|אני עסוק עכשיו', 'Let\'s take a break|בוא נצא להפסקה'],
        d: ['a|Do you have a minute?|יש לך דקה?', 'b|Sorry, I have a meeting at ten.|סליחה, יש לי ישיבה בעשר.', 'a|No problem. After lunch?|אין בעיה. אחרי הצהריים?', 'b|Perfect. See you then.|מושלם. נתראה אז.'],
        tip: 'Do you have a minute? היא הדרך המנומסת להפריע למישהו בעבודה.' },
      { t: 'מיילים', e: '📧', who: '👨‍💼',
        w: ['send|לשלוח|📤', 'attach|לצרף|📎', 'reply|להשיב|↩️', 'update|עדכון|🔄', 'question|שאלה|❓', 'regards|בברכה|✍️'],
        s: ['I will send you an email|אני אשלח לך מייל', 'Please see the attached file|ראה את הקובץ המצורף', 'Thanks for the update|תודה על העדכון', 'I have a quick question|יש לי שאלה קצרה'],
        d: ['a|Did you get my email?|קיבלת את המייל שלי?', 'b|Yes, thanks for the update.|כן, תודה על העדכון.', 'a|Can you send me the file?|אתה יכול לשלוח לי את הקובץ?', 'b|Sure, I will send it now.|בטח, אני שולח אותו עכשיו.'],
        tip: 'מייל באנגלית פותחים ב־Hi + שם וסוגרים ב־Best regards. בלי "שלום רב".' },
      { t: 'ישיבות', e: '📊', who: '🧑‍🏫',
        w: ['agree|להסכים|👍', 'idea|רעיון|💡', 'plan|תוכנית|🗺️', 'explain|להסביר|🗣️', 'understand|להבין|🧩', 'point|נקודה|📌'],
        s: ['I agree with you|אני מסכים איתך', 'I have an idea|יש לי רעיון', 'Can you explain that?|אתה יכול להסביר את זה?', 'That is a good point|זאת נקודה טובה'],
        d: ['a|What do you think about the plan?|מה אתה חושב על התוכנית?', 'b|I agree, but I have an idea.|אני מסכים, אבל יש לי רעיון.', 'a|Great, tell us.|מעולה, ספר לנו.', 'b|Sorry, can you explain the first part?|סליחה, אתה יכול להסביר את החלק הראשון?'],
        tip: 'במקום You are wrong אומרים I see your point, but... ישירות ישראלית נשמעת באנגלית כמו עלבון.' }
    ]
  },
  {
    id: 'u11', track: 'life', title: 'בריאות וחירום', sub: 'רופא, בית מרקחת ומצבי חירום', emoji: '🩺',
    color: ['#E5484D', '#B93237'], scene: 'clinic',
    lessons: [
      { t: 'הגוף', e: '🧍', who: '🧑‍⚕️',
        w: ['head|ראש|🗣️', 'hand|יד|✋', 'leg|רגל|🦵', 'stomach|בטן|🫃', 'back|גב|🔙', 'tooth|שן|🦷'],
        s: ['My head hurts|כואב לי הראש', 'I hurt my leg|נפצעתי ברגל', 'My stomach hurts|כואבת לי הבטן', 'Wash your hands|תשטוף ידיים'],
        d: ['a|What is the problem?|מה הבעיה?', 'b|My stomach hurts.|כואבת לי הבטן.', 'a|Since when?|ממתי?', 'b|Since yesterday.|מאתמול.'],
        tip: 'My head hurts. בעברית "כואב לי", באנגלית החלק בגוף הוא שכואב.' },
      { t: 'אצל הרופא', e: '🩺', who: '👨‍⚕️',
        w: ['doctor|רופא|👨‍⚕️', 'sick|חולה|🤒', 'fever|חום|🌡️', 'pain|כאב|😣', 'medicine|תרופה|💊', 'rest|לנוח|🛌'],
        s: ['I need a doctor|אני צריך רופא', 'I feel sick|אני מרגיש חולה', 'I have a fever|יש לי חום', 'Take this medicine|קח את התרופה הזאת'],
        d: ['a|How do you feel?|איך אתה מרגיש?', 'b|I feel sick and I have a fever.|אני מרגיש חולה ויש לי חום.', 'a|Take this medicine and rest.|קח את התרופה הזאת ותנוח.', 'b|Thank you, doctor.|תודה, דוקטור.'],
        tip: 'לפני טיול כדאי לדעת לומר I have travel insurance, כלומר יש לי ביטוח נסיעות.' },
      { t: 'בבית המרקחת', e: '💊', who: '👩‍⚕️',
        w: ['pharmacy|בית מרקחת|🏥', 'pill|כדור|💊', 'allergy|אלרגיה|🤧', 'cough|שיעול|😷', 'sunscreen|קרם הגנה|🧴', 'bandage|תחבושת|🩹'],
        s: ['Where is the pharmacy?|איפה בית המרקחת?', 'I have an allergy|יש לי אלרגיה', 'I need something for a cough|אני צריך משהו לשיעול', 'Do you have sunscreen?|יש לכם קרם הגנה?'],
        d: ['a|Hello, can I help you?|שלום, אפשר לעזור?', 'b|I need something for a cough.|אני צריך משהו לשיעול.', 'a|Do you have any allergies?|יש לך אלרגיות?', 'b|No, I do not.|לא, אין לי.'],
        tip: 'אקמול בחו"ל נקרא paracetamol, ובארה"ב Tylenol.' },
      { t: 'מצב חירום', e: '🚨', who: '👮',
        w: ['emergency|מצב חירום|🚨', 'police|משטרה|🚓', 'ambulance|אמבולנס|🚑', 'fire|שריפה|🔥', 'danger|סכנה|⚠️', 'stolen|גנוב|🕵️'],
        s: ['Call the police|תתקשר למשטרה', 'I need an ambulance|אני צריך אמבולנס', 'My phone was stolen|גנבו לי את הטלפון', 'It is an emergency|זה מצב חירום'],
        d: ['a|Emergency services. What happened?|שירותי חירום. מה קרה?', 'b|My bag was stolen.|גנבו לי את התיק.', 'a|Where are you now?|איפה אתה עכשיו?', 'b|I am next to the train station.|אני ליד תחנת הרכבת.'],
        tip: 'מספר החירום בארה"ב הוא 911, ברוב אירופה 112 ובבריטניה 999.' }
    ]
  },

  /* ───────────── KIDS ───────────── */
  {
    id: 'u12', track: 'kids', title: 'עולם הילדים', sub: 'חיות, צבעים, בית ספר ומשחקים', emoji: '🦁',
    color: ['#1E9E6A', '#157A50'], scene: 'kids',
    lessons: [
      { t: 'חיות', e: '🐶', who: '🧑‍🌾',
        w: ['dog|כלב|🐶', 'cat|חתול|🐱', 'bird|ציפור|🐦', 'fish|דג|🐟', 'lion|אריה|🦁', 'horse|סוס|🐴'],
        s: ['I have a dog|יש לי כלב', 'The cat is small|החתול קטן', 'The lion is big|האריה גדול', 'I love my horse|אני אוהב את הסוס שלי'],
        d: ['a|Do you have a pet?|יש לך חיית מחמד?', 'b|Yes, I have a dog.|כן, יש לי כלב.', 'a|What is his name?|איך קוראים לו?', 'b|His name is Lucky.|קוראים לו לאקי.'],
        tip: 'חיית מחמד זה pet. כלב אומר woof, לא "הב הב".' },
      { t: 'צבעים', e: '🎨', who: '👩‍🎨',
        w: ['red|אדום|🔴', 'blue|כחול|🔵', 'green|ירוק|🟢', 'yellow|צהוב|🟡', 'white|לבן|⚪', 'black|שחור|⚫'],
        s: ['The sky is blue|השמיים כחולים', 'I like red apples|אני אוהב תפוחים אדומים', 'The cat is black and white|החתול שחור ולבן', 'My ball is yellow|הכדור שלי צהוב'],
        d: ['a|What is your favorite color?|מה הצבע האהוב עליך?', 'b|My favorite color is blue.|הצבע האהוב עליי הוא כחול.', 'a|And what color is your bag?|ובאיזה צבע התיק שלך?', 'b|My bag is green.|התיק שלי ירוק.'],
        tip: 'הצבע בא לפני הדבר: a red apple, ולא apple red.' },
      { t: 'בבית הספר', e: '🏫', who: '👩‍🏫',
        w: ['school|בית ספר|🏫', 'teacher|מורה|👩‍🏫', 'book|ספר|📕', 'pencil|עיפרון|✏️', 'class|כיתה|🧑‍🎓', 'homework|שיעורי בית|📝'],
        s: ['I go to school|אני הולך לבית הספר', 'My teacher is nice|המורה שלי נחמדה', 'Open your book|תפתחו את הספר', 'I did my homework|עשיתי שיעורי בית'],
        d: ['a|Good morning, class!|בוקר טוב, כיתה!', 'b|Good morning, teacher!|בוקר טוב, המורה!', 'a|Did you do your homework?|עשית שיעורי בית?', 'b|Yes, here is my book.|כן, הנה הספר שלי.'],
        tip: 'שיעורי בית זה homework, תמיד ביחיד. לא אומרים homeworks.' },
      { t: 'משחקים', e: '⚽', who: '🧒',
        w: ['ball|כדור|⚽', 'game|משחק|🎲', 'run|לרוץ|🏃', 'jump|לקפוץ|🤸', 'win|לנצח|🏆', 'fun|כיף|🎈'],
        s: ['Let\'s play a game|בוא נשחק משחק', 'I can run fast|אני יכול לרוץ מהר', 'This is so much fun|זה כל כך כיף', 'I want to win|אני רוצה לנצח'],
        d: ['a|Do you want to play?|רוצה לשחק?', 'b|Yes! Let\'s play with the ball.|כן! בוא נשחק בכדור.', 'a|Can you run fast?|אתה יכול לרוץ מהר?', 'b|I can run very fast!|אני יכול לרוץ מהר מאוד!'],
        tip: 'I can פירושו "אני יכול". אחריו בא פועל רגיל בלי to: I can run.' }
    ]
  },

  /* ───────────── PRO ───────────── */
  {
    id: 'u13', track: 'pro', title: 'לדבר כמו מקומי', sub: 'סלנג, נימוסים וטעויות של ישראלים', emoji: '😎',
    color: ['#7A4FE0', '#5B36B8'], scene: 'chat',
    lessons: [
      { t: 'טעויות של ישראלים', e: '🙈', who: '👩‍🏫',
        w: ['actually|למעשה|☝️', 'eventually|בסופו של דבר|🏁', 'sympathetic|מגלה הבנה|🫂', 'nice|נחמד|🙂', 'ride|טרמפ / נסיעה|🚗', 'turn off|לכבות|💡'],
        s: ['I am twenty years old|אני בן עשרים', 'Turn off the light|תכבה את האור', 'I agree with you|אני מסכים איתך', 'Can you give me a ride?|אתה יכול לתת לי טרמפ?'],
        d: ['a|How old are you?|בן כמה אתה?', 'b|I am twenty years old.|אני בן עשרים.', 'a|Can you turn off the light?|אתה יכול לכבות את האור?', 'b|Sure, no problem.|בטח, אין בעיה.'],
        tip: 'לא I am agree אלא I agree. לא close the light אלא turn off the light. ו־actually זה לא "אקטואלי".' },
      { t: 'סלנג יומיומי', e: '🤙', who: '🧑‍🎤',
        w: ['cool|מגניב|😎', 'awesome|אדיר|🔥', 'dude|אחי|🤙', 'chill|רגוע / לזרום|🧊', 'no way|אין מצב|🙅', 'my bad|טעות שלי|🙏'],
        s: ['That is so cool|זה כל כך מגניב', 'No way, really?|אין מצב, באמת?', 'Sorry, my bad|סליחה, טעות שלי', 'Let\'s just chill tonight|בוא פשוט נירגע הערב'],
        d: ['a|Dude, I got the job!|אחי, קיבלתי את העבודה!', 'b|No way! That is awesome!|אין מצב! זה אדיר!', 'a|Want to celebrate tonight?|רוצה לחגוג הערב?', 'b|Sure, let\'s do it!|בטח, יאללה!'],
        tip: 'אין תרגום מדויק ל"יאללה". הכי קרוב: Let\'s go או Come on.' },
      { t: 'נימוסים בסטייל', e: '🎩', who: '🧑‍💼',
        w: ['excuse me|סליחה (לפנייה)|🙋', 'sorry|סליחה (התנצלות)|😔', 'could|האם אפשר|🙏', 'welcome|בבקשה (על לא דבר)|🤗', 'pardon|סליחה? (לא שמעתי)|👂', 'cheers|לחיים / תודה|🥂'],
        s: ['Excuse me, where is the toilet?|סליחה, איפה השירותים?', 'Could you help me, please?|תוכל לעזור לי, בבקשה?', 'You are welcome|על לא דבר', 'Sorry, I am late|סליחה שאיחרתי'],
        d: ['a|Thank you so much!|תודה רבה!', 'b|You are welcome.|על לא דבר.', 'a|Sorry, could you repeat that?|סליחה, תוכל לחזור על זה?', 'b|Of course, no problem.|כמובן, אין בעיה.'],
        tip: 'Excuse me לפני שמפריעים, Sorry אחרי שטעינו. ובבריטניה cheers זה גם "תודה".' },
      { t: 'ביטויים שכדאי להכיר', e: '🗝️', who: '👨‍🦳',
        w: ['hang out|לבלות ביחד|🛋️', 'pick up|לאסוף|🚙', 'give up|לוותר|🏳️', 'find out|לגלות|🔍', 'look for|לחפש|🔦', 'figure out|להבין איך|🧩'],
        s: ['Let\'s hang out tomorrow|בוא נבלה מחר', 'I will pick you up at eight|אני אאסוף אותך בשמונה', 'Never give up|לעולם אל תוותר', 'I am looking for my keys|אני מחפש את המפתחות שלי'],
        d: ['a|Want to hang out tonight?|רוצה לבלות הערב?', 'b|Sure, can you pick me up?|בטח, אתה יכול לאסוף אותי?', 'a|Yes, at eight. What are you doing?|כן, בשמונה. מה אתה עושה?', 'b|I am looking for my keys.|אני מחפש את המפתחות שלי.'],
        tip: 'פועל ועוד מילה קטנה (up, out, for) יוצרים משמעות חדשה לגמרי. אלה phrasal verbs, והם בכל שיחה.' }
    ]
  }
];

/* Emoji scenes shown at the start of a lesson */
Y.SCENES = {
  city:    { sky: 'day',    far: ['🏙️', '🎡', '🗽'],      mover: '🚕', dir: 'drive' },
  home:    { sky: 'sunset', far: ['🏡', '🌳', '🏠'],      mover: '🚲', dir: 'drive' },
  cafe:    { sky: 'day',    far: ['🏪', '⛱️', '🌴'],      mover: '🛵', dir: 'drive' },
  airport: { sky: 'day',    far: ['🏢', '🗼', '📡'],      mover: '✈️', dir: 'fly' },
  hotel:   { sky: 'night',  far: ['🏨', '🌴', '🏩'],      mover: '🚖', dir: 'drive' },
  street:  { sky: 'day',    far: ['🏛️', '🌉', '🏬'],      mover: '🚌', dir: 'drive' },
  shop:    { sky: 'sunset', far: ['🏬', '🛍️', '🏪'],      mover: '🛒', dir: 'drive' },
  party:   { sky: 'night',  far: ['🎆', '🏙️', '🎇'],      mover: '🎈', dir: 'fly' },
  office:  { sky: 'day',    far: ['🏢', '🏦', '🏢'],      mover: '🚇', dir: 'drive' },
  clinic:  { sky: 'day',    far: ['🏥', '🌳', '🏪'],      mover: '🚑', dir: 'drive' },
  kids:    { sky: 'day',    far: ['🎪', '🌈', '🎠'],      mover: '🪁', dir: 'fly' },
  chat:    { sky: 'sunset', far: ['🌆', '🎡', '🌉'],      mover: '🛹', dir: 'drive' }
};
