/* Yalla English – live conversations with Sabi (AI) */
(function () {
  const Y = window.Y, esc = Y.esc, C = Y.CONFIG;
  const A = Y.actions = Y.actions || {};
  const FREE_PER_DAY = 6;

  const SCENES = [
    { id: 'free', e: '💬', t: 'שיחה חופשית', d: 'מדברים על מה שבא לך', role: 'a friendly chat about the learner\'s day, hobbies and plans', open: 'Hi! I am Sabi. How are you today?', he: 'היי! אני סאבי. מה שלומך היום?', hints: ['I am good, thanks!', 'I am a little tired.'] },
    { id: 'cafe', e: '☕', t: 'בבית קפה', d: 'מזמינים קפה ומשהו לאכול', role: 'you are a barista in a cafe and the learner is a customer ordering', open: 'Hi! Welcome to our cafe. What can I get you?', he: 'היי! ברוך הבא לבית הקפה שלנו. מה להביא לך?', hints: ['Can I have a coffee, please?', 'A tea with milk, please.'] },
    { id: 'airport', e: '🛂', t: 'ביקורת דרכונים', d: 'נוחתים בחו"ל ועונים לשאלות', role: 'you are a polite passport control officer and the learner has just landed', open: 'Good morning. Passport, please. What is the purpose of your visit?', he: 'בוקר טוב. דרכון, בבקשה. מה מטרת הביקור שלך?', hints: ['I am here on vacation.', 'Here is my passport.'] },
    { id: 'hostel', e: '🛏️', t: 'צ׳ק אין בהוסטל', d: 'מחפשים מיטה ללילה', role: 'you are a hostel receptionist and the learner is a backpacker checking in', open: 'Hey! Welcome. Are you looking for a bed tonight?', he: 'היי! ברוך הבא. מחפש מיטה ללילה?', hints: ['Yes, do you have a cheap room?', 'How much is one night?'] },
    { id: 'job', e: '💼', t: 'ראיון עבודה', d: 'מציגים את עצמך באנגלית', role: 'you are a kind interviewer at a tech company interviewing the learner for a first job', open: 'Nice to meet you! Please tell me a little about yourself.', he: 'נעים להכיר! ספר לי קצת על עצמך.', hints: ['My name is ... and I am from Israel.', 'I learn fast and I work well in a team.'] }
  ];
  let T = null; // current talk: { sc, msgs: [{who:'ai'|'me', en, he, fix}], hints, busy }

  const prompt = (sc) => 'You are Sabi, a warm, funny cactus mascot and English tutor inside the app "Yalla English" for Hebrew speakers.\n' +
    'Role-play: ' + sc.role + '.\nLearner level (CEFR): ' + Y.level() + '. The learner is ' + (Y.state.user.who === 'kid' ? 'a child, keep it playful and very simple' : 'a teen or adult') + '.\n' +
    'Rules: stay in the role-play. Use simple English that fits the level, at most two short sentences, and end with a question so the talk continues. Be encouraging.\n' +
    'Reply with ONLY a JSON object, no other text: {"reply": "your English reply", "he": "Hebrew translation of your reply", "fix": "if the learner\'s last message had an English mistake or was written in Hebrew: one short Hebrew sentence that shows the correct English; otherwise an empty string", "hints": ["two short English sentences the learner could say next"]}';

  Y.aiReady = () => !!(Y.cap.sample || C.AI_ENDPOINT);
  const parse = (text) => {
    try { const m = String(text).match(/\{[\s\S]*\}/); const j = JSON.parse(m ? m[0] : text); if (j && j.reply) return j; } catch (e) { /* fall through */ }
    return { reply: String(text).replace(/[{}"]/g, '').slice(0, 300), he: '', fix: '', hints: [] };
  };
  const ask = (sc, msgs) => {
    const turns = msgs.map((m) => ({ role: m.who === 'ai' ? 'assistant' : 'user', content: m.en }));
    if (Y.cap.sample) {
      // the page cannot set a system prompt, so the instructions ride in the first turn
      const input = [{ role: 'user', content: prompt(sc) + '\n\nStart the role-play now.' }].concat(turns);
      return Y.cap.sample(input, { modelTier: 'quick', cache: false }).then((r) => parse(r.text));
    }
    return fetch(C.AI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system: prompt(sc), messages: [{ role: 'user', content: 'Start the role-play now.' }].concat(turns) }) })
      .then((r) => { if (!r.ok) throw new Error('http'); return r.json(); }).then((j) => parse(j.text));
  };

  const usedToday = () => { const a = Y.state.ai || {}; return a.day === Y.dayKey() ? a.n : 0; };
  const leftToday = () => (Y.isPlus() ? Infinity : Math.max(0, FREE_PER_DAY - usedToday()));

  Y.screens.ai = () => {
    const left = leftToday();
    return '<main class="page" id="page"><div class="back-row"><button class="icon-btn" data-act="tab" data-tab="home" aria-label="חזרה">' + Y.ICON.back + '</button></div>' +
      '<section class="league-hero">' + Y.art('sabi-headphones', 'ai-art', 'סאבי עם אוזניות') + '<h1>שיחה עם סאבי</h1><p>סימולציה חיה באנגלית. סאבי עונה, מתרגם ומתקן בעדינות.</p>' +
      (Y.isPlus() ? '' : '<div class="league-me">נשארו היום <b>' + left + '</b> הודעות בחינם</div>') + '</section>' +
      '<div class="pcards">' + SCENES.map((s) => '<button class="pcard" data-act="ai-open" data-id="' + s.id + '"><span class="pcard-em">' + s.e + '</span><span class="pcard-t"><b>' + s.t + '</b><small>' + s.d + '</small></span><span class="chev">' + Y.ICON.back + '</span></button>').join('') + '</div>' +
      '<p class="fine">התשובות נכתבות על ידי בינה מלאכותית ועלולות לטעות.</p></main>';
  };

  const bubble = (m, i) => m.who === 'ai'
    ? '<div class="dline them"><span class="dline-av">🌵</span><div class="ai-b"><button class="dline-b" data-act="say" data-say="' + esc(m.en) + '"><b dir="ltr">' + esc(m.en) + '</b>' + (m.he ? '<small>' + esc(m.he) + '</small>' : '') + '</button></div></div>'
    : '<div class="dline me"><div class="ai-b"><div class="dline-b"><b dir="auto">' + esc(m.en) + '</b></div>' + (m.fix ? '<p class="ai-fix" dir="auto">💡 ' + esc(m.fix) + '</p>' : '') + '</div></div>';
  const render = () => {
    const box = Y.$('#ai-log'); if (!box) return;
    box.innerHTML = T.msgs.map(bubble).join('') + (T.busy ? '<div class="dline them"><span class="dline-av">🌵</span><div class="dline-b typing"><i></i><i></i><i></i></div></div>' : '');
    Y.$('#ai-hints').innerHTML = T.busy ? '' : (T.hints || []).slice(0, 2).map((h) => '<button class="tile" data-act="ai-hint" dir="ltr">' + esc(h) + '</button>').join('');
    box.scrollTop = box.scrollHeight;
  };
  A['ai-open'] = (el) => {
    if (!Y.aiReady()) {
      return Y.sheet('<div class="sheet-c">' + Y.mascot('think', 110) + '<h3>שיחות AI עוד לא מחוברות</h3><p>כדי לדבר עם סאבי צריך לחבר את האפליקציה לשרת בינה מלאכותית. ההסבר נמצא בקובץ README.</p><button class="btn btn-gold btn-block" data-act="sheet-close">הבנתי</button></div>');
    }
    const sc = SCENES.find((s) => s.id === el.dataset.id);
    T = { sc: sc, msgs: [{ who: 'ai', en: sc.open, he: sc.he }], hints: sc.hints, busy: false };
    Y.sfx('whoosh');
    const app = Y.$('#app'); app.className = 'app app-lesson';
    app.innerHTML = '<div class="lesson"><header class="lesson-head"><button class="icon-btn" data-act="ai-close" aria-label="סגירה">' + Y.ICON.close + '</button><b class="ai-title">' + sc.e + ' ' + sc.t + '</b><span class="lh-hearts">🤖</span></header>' +
      '<main class="lesson-body ai-log" id="ai-log" aria-live="polite"></main>' +
      '<footer class="lesson-foot"><div class="tiles ai-hints" id="ai-hints"></div><form class="ai-form" id="ai-form"><button type="button" class="spk ai-mic" id="ai-mic" data-act="ai-mic" aria-label="דיבור">' + Y.ICON.mic + '</button>' +
      '<input class="type-in" id="ai-in" dir="auto" type="text" autocomplete="off" maxlength="200" placeholder="Type in English..." aria-label="ההודעה שלך"><button class="spk ai-send" aria-label="שליחה">' + Y.ICON.arrow + '</button></form></footer></div>';
    Y.$('#ai-form').addEventListener('submit', (e) => { e.preventDefault(); send(Y.$('#ai-in').value); });
    render();
    setTimeout(() => Y.speak(sc.open), 400);
  };
  A['ai-close'] = () => { stopMic(); T = null; Y.go('ai'); };
  A['ai-hint'] = (el) => send(el.textContent);

  function send(text) {
    text = String(text || '').trim();
    if (!T || T.busy || !text) return;
    if (leftToday() <= 0) {
      return Y.sheet('<div class="sheet-c"><div class="big-em">👑</div><h3>נגמרו ההודעות להיום</h3><p>בחינם יש ' + FREE_PER_DAY + ' הודעות ביום. עם פרימיום מדברים עם סאבי בלי הגבלה.</p><button class="btn btn-gold btn-block" data-act="go-plus-from-sheet">לפרטים על פרימיום</button><button class="btn btn-ghost btn-block" data-act="sheet-close">לא עכשיו</button></div>');
    }
    const mine = { who: 'me', en: text };
    T.msgs.push(mine); T.busy = true; Y.$('#ai-in').value = ''; Y.sfx('pop'); render();
    const talk = T;
    ask(T.sc, T.msgs.slice(-12)).then((j) => {
      if (T !== talk) return;
      Y.state.ai = { day: Y.dayKey(), n: usedToday() + 1 }; Y.addXp(1); Y.save();
      mine.fix = j.fix || '';
      T.msgs.push({ who: 'ai', en: j.reply, he: j.he || '' }); T.hints = Array.isArray(j.hints) ? j.hints : []; T.busy = false;
      Y.sfx('select'); render(); Y.speak(j.reply);
    }).catch((e) => {
      if (T !== talk) return;
      T.busy = false; T.msgs.pop(); render(); Y.$('#ai-in').value = text;
      Y.toast(e && e.code === 'not_granted' ? 'צריך לאשר את השימוש ב-Claude כדי לשוחח' : e && e.code === 'rate_limited' ? 'יותר מדי הודעות. נסו שוב בעוד רגע' : 'סאבי לא הצליח לענות. נסו שוב');
    });
  }

  /* voice input: platform dictation when offered, else the browser's speech recognition */
  let rec = null, dict = false;
  const stopMic = () => { try { if (rec) rec.abort(); if (dict && Y.cap.dictation) Y.cap.dictation.stop().catch(() => {}); } catch (e) { /* ignore */ } rec = null; dict = false; const b = Y.$('#ai-mic'); if (b) b.classList.remove('live'); };
  A['ai-mic'] = () => {
    const btn = Y.$('#ai-mic'), inp = Y.$('#ai-in');
    if (btn.classList.contains('live')) return stopMic();
    const d = Y.cap.dictation;
    if (d) {
      dict = true; btn.classList.add('live');
      d.onFinal((r) => { inp.value = (inp.value + ' ' + r.text).trim(); });
      d.onState((s) => { if (s.state === 'idle') { btn.classList.remove('live'); dict = false; } });
      d.start({ language: 'en' }).catch(() => { btn.classList.remove('live'); dict = false; Y.toast('המיקרופון לא זמין כאן. אפשר להקליד'); });
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { Y.toast('המיקרופון לא זמין בדפדפן הזה. אפשר להקליד'); return; }
    try {
      rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false;
      btn.classList.add('live');
      rec.onresult = (e) => { inp.value = e.results[0][0].transcript; btn.classList.remove('live'); };
      rec.onerror = () => { btn.classList.remove('live'); Y.toast('לא הצלחנו לשמוע. נסו שוב או הקלידו'); };
      rec.onend = () => btn.classList.remove('live');
      rec.start();
    } catch (e) { btn.classList.remove('live'); }
  };
})();
