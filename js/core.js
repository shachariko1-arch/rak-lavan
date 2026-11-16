/* Yalla English – state, storage, sound, speech, mascot and shared UI helpers */
(function () {
  const Y = window.Y;
  const KEY = 'yalla-english-v1';
  const C = Y.CONFIG;

  /* ───────── helpers ───────── */
  Y.$ = (sel, root) => (root || document).querySelector(sel);
  Y.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  Y.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  Y.shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  Y.sample = (arr, n) => Y.shuffle(arr).slice(0, n);
  Y.xpTxt = (n) => '<span dir="ltr">' + n + ' XP</span>';
  Y.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  Y.dayKey = (d) => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  Y.addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  Y.weekKey = () => { const d = new Date(); return Y.dayKey(Y.addDays(d, -d.getDay())); }; // week starts on Sunday

  /* ───────── state ───────── */
  const fresh = () => ({
    v: 1, onboarded: false,
    user: { name: '', gender: 'm', who: '', goal: '', level: '', daily: 10, google: false, pic: '', joined: Y.dayKey() },
    xp: 0, gems: 20, hearts: C.MAX_HEARTS, heartsAt: Date.now(),
    streak: 0, lastDay: '', days: {}, week: { key: '', xp: 0 },
    done: {}, perfect: 0, words: {}, mistakes: [], ach: {},
    plus: { active: false, since: '' },
    settings: { sound: true, tts: true, rate: 1 }
  });

  Y.load = () => {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { s = null; }
    const f = fresh();
    if (s && s.v === 1) {
      Y.state = Object.assign(f, s);
      Y.state.user = Object.assign(fresh().user, s.user);
      Y.state.settings = Object.assign(fresh().settings, s.settings);
    } else Y.state = f;
  };
  Y.save = () => { try { localStorage.setItem(KEY, JSON.stringify(Y.state)); } catch (e) { /* storage unavailable */ } };
  Y.reset = () => { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } Y.state = fresh(); };

  /* gendered Hebrew: Y.g('מוכן', 'מוכנה') */
  Y.g = (m, f) => (Y.state.user.gender === 'f' ? f : m);

  /* ───────── course helpers ───────── */
  const ORDER = {
    travel: ['base', 'travel', 'life', 'pro', 'work', 'kids'],
    work: ['base', 'work', 'life', 'pro', 'travel', 'kids'],
    study: ['base', 'life', 'pro', 'work', 'travel', 'kids'],
    fun: ['base', 'life', 'pro', 'travel', 'work', 'kids'],
    general: ['base', 'life', 'travel', 'work', 'pro', 'kids'],
    kid: ['kids', 'base', 'life', 'travel', 'pro', 'work']
  };
  Y.unitOrder = () => {
    const u = Y.state.user;
    const order = u.who === 'kid' ? ORDER.kid : (ORDER[u.goal] || ORDER.general);
    return Y.COURSE.slice().sort((a, b) => order.indexOf(a.track) - order.indexOf(b.track));
  };
  Y.lid = (unit, i) => unit.id + '-' + i;
  Y.isPlus = () => !!Y.state.plus.active;
  Y.isFree = (unit, i) => C.FREE_UNITS.indexOf(unit.id) >= 0 || i === 0;
  // 'done' | 'open' | 'locked' (finish the previous lesson) | 'plus' (subscription needed)
  Y.status = (unit, i) => {
    if (Y.state.done[Y.lid(unit, i)]) return 'done';
    if (!Y.isPlus() && !Y.isFree(unit, i)) return 'plus';
    if (i === 0 || Y.state.done[Y.lid(unit, i - 1)]) return 'open';
    return 'locked';
  };
  Y.nextLesson = () => {
    const units = Y.unitOrder();
    for (const u of units) for (let i = 0; i < u.lessons.length; i++) if (Y.status(u, i) === 'open') return { unit: u, i: i };
    return null;
  };
  Y.totalLessons = () => Y.COURSE.reduce((n, u) => n + u.lessons.length, 0);
  Y.doneCount = () => Object.keys(Y.state.done).length;
  Y.level = () => { const n = Y.doneCount(); return n < 12 ? 'A1' : n < 28 ? 'A2' : n < 44 ? 'B1' : 'B2'; };
  Y.parseW = (s) => { const p = s.split('|'); return { en: p[0], he: p[1], em: p[2] || '' }; };
  Y.parseS = (s) => { const p = s.split('|'); return { en: p[0], he: p[1] }; };
  Y.parseD = (s) => { const p = s.split('|'); return { who: p[0], en: p[1], he: p[2] }; };

  /* ───────── hearts, xp, streak ───────── */
  Y.hearts = () => {
    const s = Y.state;
    if (Y.isPlus()) return C.MAX_HEARTS;
    if (s.hearts >= C.MAX_HEARTS) { s.heartsAt = Date.now(); return s.hearts; }
    const step = C.HEART_MINUTES * 60000;
    const gained = Math.floor((Date.now() - s.heartsAt) / step);
    if (gained > 0) {
      s.hearts = Math.min(C.MAX_HEARTS, s.hearts + gained);
      s.heartsAt = s.hearts >= C.MAX_HEARTS ? Date.now() : s.heartsAt + gained * step;
      Y.save();
    }
    return s.hearts;
  };
  Y.nextHeartMin = () => Math.max(1, Math.ceil((C.HEART_MINUTES * 60000 - (Date.now() - Y.state.heartsAt)) / 60000));
  Y.loseHeart = () => {
    if (Y.isPlus()) return;
    const h = Y.hearts();
    if (h >= C.MAX_HEARTS) Y.state.heartsAt = Date.now();
    Y.state.hearts = Math.max(0, h - 1);
    Y.save();
  };
  Y.addHeart = (n) => { Y.state.hearts = Math.min(C.MAX_HEARTS, Y.hearts() + (n || 1)); Y.save(); };

  Y.addXp = (n) => {
    const s = Y.state, today = Y.dayKey(), wk = Y.weekKey();
    s.xp += n;
    s.days[today] = (s.days[today] || 0) + n;
    if (s.week.key !== wk) s.week = { key: wk, xp: 0 };
    s.week.xp += n;
  };
  Y.todayXp = () => Y.state.days[Y.dayKey()] || 0;
  Y.dailyGoalXp = () => Y.state.user.daily * 2; // roughly 2 XP per minute of study
  // returns true when the streak grew today
  Y.touchStreak = () => {
    const s = Y.state, today = Y.dayKey();
    if (s.lastDay === today) return false;
    s.streak = s.lastDay === Y.dayKey(Y.addDays(new Date(), -1)) ? s.streak + 1 : 1;
    s.lastDay = today;
    return true;
  };
  Y.liveStreak = () => {
    const s = Y.state;
    if (s.lastDay === Y.dayKey() || s.lastDay === Y.dayKey(Y.addDays(new Date(), -1))) return s.streak;
    return 0;
  };

  Y.noteWord = (w, ok) => {
    const rec = Y.state.words[w.en] || { he: w.he, em: w.em, n: 0 };
    if (ok) rec.n = Math.min(5, rec.n + 1);
    Y.state.words[w.en] = rec;
  };
  Y.noteMistake = (item) => {
    const m = Y.state.mistakes;
    if (!m.some((x) => x.en === item.en)) m.unshift(item);
    if (m.length > 40) m.length = 40;
  };
  Y.clearMistake = (en) => { Y.state.mistakes = Y.state.mistakes.filter((x) => x.en !== en); };

  /* ───────── achievements ───────── */
  Y.ACHS = [
    { id: 'first', e: '🚀', t: 'יצאנו לדרך', d: 'סיימת שיעור ראשון', ok: (s) => Y.doneCount() >= 1 },
    { id: 'five', e: '📚', t: 'חמישייה', d: 'חמישה שיעורים מאחוריך', ok: (s) => Y.doneCount() >= 5 },
    { id: 'unit', e: '🏅', t: 'יחידה שלמה', d: 'סיימת יחידה מלאה', ok: (s) => Y.COURSE.some((u) => u.lessons.every((l, i) => s.done[Y.lid(u, i)])) },
    { id: 'perfect', e: '💯', t: 'בלי טעות אחת', d: 'שיעור מושלם', ok: (s) => s.perfect >= 1 },
    { id: 'streak3', e: '🔥', t: 'שלושה ימים ברצף', d: 'רצף של 3 ימים', ok: (s) => s.streak >= 3 },
    { id: 'streak7', e: '🗓️', t: 'שבוע שלם', d: 'רצף של 7 ימים', ok: (s) => s.streak >= 7 },
    { id: 'xp200', e: '⚡', t: 'צובר נקודות', d: '200 נקודות XP', ok: (s) => s.xp >= 200 },
    { id: 'words40', e: '🧠', t: 'אוצר מילים', d: '40 מילים במילון האישי', ok: (s) => Object.keys(s.words).length >= 40 }
  ];
  Y.checkAchs = () => {
    const got = [];
    Y.ACHS.forEach((a) => { if (!Y.state.ach[a.id] && a.ok(Y.state)) { Y.state.ach[a.id] = Y.dayKey(); got.push(a); } });
    return got;
  };

  /* ───────── sound effects (synthesised, no files) ───────── */
  let actx = null;
  const ctx = () => {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    return actx;
  };
  const tone = (freq, start, dur, type, vol, slideTo) => {
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + start;
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  };
  const noise = (start, dur, vol, from, to) => {
    const len = Math.floor(actx.sampleRate * dur), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain(), t = actx.currentTime + start;
    src.buffer = buf; f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(actx.destination); src.start(t);
  };
  const SFX = {
    tap: () => tone(620, 0, 0.06, 'triangle', 0.08, 880),
    select: () => { tone(520, 0, 0.07, 'triangle', 0.1); tone(780, 0.05, 0.1, 'triangle', 0.1); },
    pop: () => tone(300, 0, 0.09, 'sine', 0.14, 900),
    whoosh: () => noise(0, 0.28, 0.07, 400, 2600),
    ok: () => { tone(659, 0, 0.12, 'triangle', 0.16); tone(880, 0.09, 0.12, 'triangle', 0.16); tone(1319, 0.18, 0.28, 'triangle', 0.14); },
    bad: () => { tone(240, 0, 0.18, 'square', 0.06, 180); tone(170, 0.16, 0.26, 'square', 0.06, 120); },
    heart: () => tone(500, 0, 0.3, 'sine', 0.12, 140),
    coin: () => { tone(988, 0, 0.08, 'square', 0.06); tone(1319, 0.07, 0.25, 'square', 0.06); },
    unlock: () => { tone(392, 0, 0.1, 'triangle', 0.12); tone(523, 0.08, 0.1, 'triangle', 0.12); tone(784, 0.16, 0.3, 'triangle', 0.12); },
    win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.1, 0.24, 'triangle', 0.16)); tone(1047, 0.55, 0.5, 'sine', 0.12); tone(1568, 0.55, 0.5, 'sine', 0.08); noise(0.5, 0.5, 0.03, 3000, 9000); },
    streak: () => { noise(0, 0.5, 0.05, 300, 3000); [440, 554, 659, 880].forEach((f, i) => tone(f, 0.1 + i * 0.08, 0.2, 'sawtooth', 0.05)); }
  };
  Y.sfx = (name) => {
    if (!Y.state.settings.sound) return;
    try { ctx(); (SFX[name] || SFX.tap)(); } catch (e) { /* no audio */ }
    try { if (navigator.vibrate && (name === 'ok' || name === 'bad' || name === 'win')) navigator.vibrate(name === 'ok' ? 12 : name === 'bad' ? [30, 40, 30] : [15, 40, 15, 40, 30]); } catch (e) { /* no haptics */ }
  };

  /* ───────── speech: recorded clips first, browser voice as fallback ───────── */
  const clips = {}, packs = {}, unitOf = {};
  Y.COURSE.forEach((u) => u.lessons.forEach((l) => {
    l.w.forEach((w) => { unitOf[w.split('|')[0]] = unitOf[w.split('|')[0]] || u.id; });
    l.s.forEach((s) => { unitOf[s.split('|')[0]] = unitOf[s.split('|')[0]] || u.id; });
    l.d.forEach((d) => { unitOf[d.split('|')[1]] = unitOf[d.split('|')[1]] || u.id; });
  }));
  Y.loadPack = (id) => {
    if (!packs[id]) {
      packs[id] = fetch('audio/' + id + '.json').then((r) => (r.ok ? r.json() : {})).then((j) => { Object.assign(clips, j); return true; })
        .catch(() => { delete packs[id]; return false; });
    }
    return packs[id];
  };
  let player = null, unlocked = false;
  const getPlayer = () => { if (!player) { player = new Audio(); player.preload = 'auto'; } return player; };
  // phones only let a page play audio after a touch, so the first touch "unlocks" the player and the sound engine
  Y.unlockAudio = () => {
    if (unlocked) return; unlocked = true;
    try { ctx(); } catch (e) { /* ignore */ }
    try {
      const p = getPlayer();
      p.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      const pr = p.play(); if (pr && pr.catch) pr.catch(() => {});
    } catch (e) { /* ignore */ }
    try { if ('speechSynthesis' in window) speechSynthesis.getVoices(); } catch (e) { /* ignore */ }
  };

  /* optional abilities offered when the app runs as a Claude artifact */
  Y.cap = {};
  if (window.claude && typeof window.claude.use === 'function') {
    ['sample', 'tts', 'dictation'].forEach((n) => { try { window.claude.use(n).then((ns) => { Y.cap[n] = ns; }).catch(() => {}); } catch (e) { /* not offered */ } });
  }

  const hasTts = () => 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  Y.canSpeak = () => true; // recorded clips ship with the app
  Y.canListen = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  let voice = null;
  const pickVoice = () => {
    if (!hasTts()) return;
    const vs = speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
    const pref = ['Samantha', 'Google US English', 'Aria', 'Jenny', 'Google UK English Female', 'Karen', 'Daniel'];
    voice = null;
    for (const p of pref) { voice = vs.find((v) => v.name.indexOf(p) >= 0); if (voice) break; }
    voice = voice || vs.find((v) => /en[-_]US/i.test(v.lang)) || vs[0] || null;
  };
  if (hasTts()) { pickVoice(); try { speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) { /* older browsers */ } }
  const tts = (text, slow, lang) => {
    if (Y.cap.tts) { Y.cap.tts.speak(text, { language: lang || 'en', rate: slow ? 0.75 : 1 }).catch(() => browserTts(text, slow, lang)); return; }
    browserTts(text, slow, lang);
  };
  const browserTts = (text, slow, lang) => {
    if (!hasTts()) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'he' ? 'he-IL' : 'en-US';
      if (lang === 'he') { const hv = speechSynthesis.getVoices().find((v) => /^he|^iw/i.test(v.lang)); if (hv) u.voice = hv; }
      else if (voice) u.voice = voice;
      u.rate = (slow ? 0.6 : 0.95) * Y.state.settings.rate;
      // speaking right after cancel() is silently dropped by some browsers
      setTimeout(() => { try { speechSynthesis.resume(); speechSynthesis.speak(u); } catch (e) { /* ignore */ } }, 70);
    } catch (e) { /* speech unavailable */ }
  };
  let speakSeq = 0;
  Y.speak = (text, slow) => {
    if (!Y.state.settings.tts || !text) return;
    const seq = ++speakSeq;
    const play = () => {
      if (seq !== speakSeq) return;
      const clip = clips[text] || clips[text.replace(/[.,!?]$/, '')] || clips[text.toLowerCase()] || clips[text.charAt(0).toUpperCase() + text.slice(1)];
      if (!clip) return tts(text, slow);
      try {
        if (hasTts()) speechSynthesis.cancel();
        const p = getPlayer();
        p.pause();
        p.src = 'data:audio/mpeg;base64,' + clip;
        p.playbackRate = (slow ? 0.7 : 1) * Y.state.settings.rate;
        const pr = p.play();
        if (pr && pr.catch) pr.catch(() => tts(text, slow));
      } catch (e) { tts(text, slow); }
    };
    if (clips[text]) return play();
    const id = unitOf[text] || 'words';
    Y.loadPack(id).then(play);
  };
  // Hebrew is read by the device's own Hebrew voice (or the Claude voice inside an artifact)
  Y.canSpeakHe = () => !!Y.cap.tts || (hasTts() && speechSynthesis.getVoices().some((v) => /^he|^iw/i.test(v.lang)));
  Y.speakHe = (text) => { if (!Y.state.settings.tts || !text) return; speakSeq++; try { if (player) player.pause(); } catch (e) { /* ignore */ } tts(text.replace(/\s*\/\s*/g, ', ').replace(/[()]/g, ' '), false, 'he'); };
  Y.heBtn = (text) => '<button class="spk spk-he" data-act="say-he" data-say="' + Y.esc(text) + '" aria-label="השמע בעברית">ע</button>';
  Y.stopSpeech = () => { speakSeq++; try { if (player) player.pause(); if (hasTts()) speechSynthesis.cancel(); if (Y.cap.tts) Y.cap.tts.stop(); } catch (e) { /* ignore */ } };

  /* ───────── Sabi the mascot: a sabra cactus with a detective hat and a backpack ───────── */
  const DEFS = '<defs>' +
    '<radialGradient id="sb-body" cx="34%" cy="26%" r="85%"><stop offset="0" stop-color="#DDF57A"/><stop offset=".45" stop-color="#9FD63C"/><stop offset="1" stop-color="#5C9D1E"/></radialGradient>' +
    '<linearGradient id="sb-hat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0B274"/><stop offset="1" stop-color="#A9743A"/></linearGradient>' +
    '<linearGradient id="sb-pack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C98A4B"/><stop offset="1" stop-color="#7A4A1E"/></linearGradient>' +
    '<clipPath id="sb-hatclip"><path d="M54 78 Q54 26 100 24 Q146 26 146 78 Z"/></clipPath></defs>';
  Y.mascot = (mood, size) => {
    mood = mood || 'happy'; size = size || 120;
    const up = mood === 'cheer';
    const key = mood === 'wave' ? 'happy' : mood;
    const eyes = {
      happy: '<ellipse cx="82" cy="118" rx="12" ry="14" fill="#fff"/><ellipse cx="118" cy="118" rx="12" ry="14" fill="#fff"/><circle cx="84" cy="120" r="7" fill="#1B2340"/><circle cx="120" cy="120" r="7" fill="#1B2340"/><circle cx="87" cy="116" r="2.6" fill="#fff"/><circle cx="123" cy="116" r="2.6" fill="#fff"/>',
      cheer: '<path d="M71 121 Q82 106 93 121" fill="none" stroke="#1B2340" stroke-width="5" stroke-linecap="round"/><path d="M107 121 Q118 106 129 121" fill="none" stroke="#1B2340" stroke-width="5" stroke-linecap="round"/>',
      sad: '<ellipse cx="82" cy="120" rx="12" ry="13" fill="#fff"/><ellipse cx="118" cy="120" rx="12" ry="13" fill="#fff"/><circle cx="82" cy="124" r="6.5" fill="#1B2340"/><circle cx="118" cy="124" r="6.5" fill="#1B2340"/><path d="M68 102 L92 108" stroke="#3F7513" stroke-width="5" stroke-linecap="round"/><path d="M132 102 L108 108" stroke="#3F7513" stroke-width="5" stroke-linecap="round"/>',
      think: '<ellipse cx="82" cy="118" rx="12" ry="14" fill="#fff"/><ellipse cx="118" cy="118" rx="12" ry="14" fill="#fff"/><circle cx="79" cy="115" r="7" fill="#1B2340"/><circle cx="115" cy="115" r="7" fill="#1B2340"/><path d="M106 98 L132 93" stroke="#3F7513" stroke-width="5" stroke-linecap="round"/>'
    };
    const mouths = {
      happy: '<path d="M82 140 Q100 162 118 140 Z" fill="#7A1F2B" stroke="#1B2340" stroke-width="3" stroke-linejoin="round"/><path d="M90 150 Q100 158 110 150 Q100 146 90 150Z" fill="#FF7E8E"/>',
      cheer: '<path d="M78 138 Q100 172 122 138 Z" fill="#7A1F2B" stroke="#1B2340" stroke-width="3" stroke-linejoin="round"/><path d="M88 152 Q100 164 112 152 Q100 146 88 152Z" fill="#FF7E8E"/>',
      sad: '<path d="M86 152 Q100 140 114 152" fill="none" stroke="#1B2340" stroke-width="4.500" stroke-linecap="round"/>',
      think: '<path d="M90 146 Q101 141 112 148" fill="none" stroke="#1B2340" stroke-width="4.500" stroke-linecap="round"/>'
    };
    const arm = 'fill="url(#sb-body)" stroke="#4A8517" stroke-width="3.500"';
    const armL = up
      ? '<g><rect x="18" y="96" width="44" height="26" rx="13" ' + arm + '/><rect x="18" y="62" width="26" height="58" rx="13" ' + arm + '/></g>'
      : '<g><rect x="20" y="132" width="42" height="26" rx="13" ' + arm + '/><rect x="20" y="108" width="26" height="48" rx="13" ' + arm + '/></g>';
    const armR = (up || mood === 'wave')
      ? '<g class="sabi-wave"><rect x="138" y="96" width="44" height="26" rx="13" ' + arm + '/><rect x="156" y="60" width="26" height="60" rx="13" ' + arm + '/></g>'
      : '<g><rect x="138" y="132" width="42" height="26" rx="13" ' + arm + '/><rect x="154" y="108" width="26" height="48" rx="13" ' + arm + '/></g>';
    const glass = mood === 'think'
      ? '<g transform="rotate(-16 170 110)"><rect x="166" y="112" width="8" height="30" rx="4" fill="#7A4A1E"/><circle cx="170" cy="94" r="19" fill="#CFEFFF" fill-opacity=".8" stroke="#FFC83D" stroke-width="6"/><path d="M160 88 Q165 80 174 82" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>'
      : '';
    const sparks = up ? '<g fill="#FFC83D"><path d="M14 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path d="M186 32 l2.500 7 7 2.500 -7 2.500 -2.500 7 -2.500 -7 -7 -2.500 7 -2.500z"/><circle cx="8" cy="84" r="3"/><circle cx="194" cy="76" r="3"/></g>' : '';
    return '<svg class="sabi sabi-' + mood + '" width="' + size + '" height="' + Math.round(size * 1.1) + '" viewBox="0 0 200 220" role="img" aria-label="סאבי הצבר">' + DEFS +
      '<ellipse cx="100" cy="212" rx="56" ry="6" fill="#000" opacity=".25"/>' +
      '<rect x="44" y="108" width="112" height="90" rx="28" fill="url(#sb-pack)" stroke="#5C3613" stroke-width="3.500"/>' +
      armL + armR +
      '<rect x="52" y="60" width="96" height="150" rx="48" fill="url(#sb-body)" stroke="#4A8517" stroke-width="3.500"/>' +
      '<g fill="none" stroke="#4A8517" stroke-width="2.500" opacity=".35" stroke-linecap="round"><path d="M74 168 Q70 190 76 204"/><path d="M100 172 V208"/><path d="M126 168 Q130 190 124 204"/></g>' +
      '<g stroke="#F4FFD0" stroke-width="2.400" stroke-linecap="round" opacity=".9"><path d="M64 176 l-4 3M64 176 l-1 5"/><path d="M138 180 l4 3M138 180 l1 5"/><path d="M100 190 l-3 4M100 190 l3 4"/><path d="M86 200 l-3 3"/><path d="M116 198 l3 3"/></g>' +
      '<path d="M66 84 Q52 130 60 186" fill="none" stroke="url(#sb-pack)" stroke-width="11" stroke-linecap="round"/><path d="M134 84 Q148 130 140 186" fill="none" stroke="url(#sb-pack)" stroke-width="11" stroke-linecap="round"/>' +
      '<g transform="rotate(6 58 156)"><rect x="49" y="148" width="19" height="14" rx="2" fill="#fff" stroke="#2B5BF0" stroke-width="1"/><path d="M49 151 h19M49 159 h19" stroke="#2B5BF0" stroke-width="2"/><path d="M58.500 152.500 l2.600 4.500 h-5.200z M58.500 158.500 l-2.600 -4.500 h5.200z" fill="none" stroke="#2B5BF0" stroke-width=".9"/></g>' +
      '<circle cx="66" cy="136" r="9" fill="#FF8FA3" opacity=".65"/><circle cx="134" cy="136" r="9" fill="#FF8FA3" opacity=".65"/>' +
      '<g class="sabi-eyes">' + eyes[key] + '</g>' + mouths[key] +
      '<path d="M54 78 Q54 26 100 24 Q146 26 146 78 Z" fill="url(#sb-hat)" stroke="#6B3F16" stroke-width="3.500" stroke-linejoin="round"/>' +
      '<g clip-path="url(#sb-hatclip)" stroke="#7A4A1E" stroke-width="1.800" opacity=".5"><path d="M66 20 V82M80 20 V82M94 20 V82M108 20 V82M122 20 V82M136 20 V82"/><path d="M48 40 H152M48 54 H152M48 68 H152"/></g>' +
      '<path d="M58 76 Q28 78 22 96 Q50 94 80 80 Z" fill="#B98545" stroke="#6B3F16" stroke-width="3.500" stroke-linejoin="round"/>' +
      '<path d="M142 76 Q172 78 178 96 Q150 94 120 80 Z" fill="#B98545" stroke="#6B3F16" stroke-width="3.500" stroke-linejoin="round"/>' +
      '<path d="M54 78 H146" stroke="#6B3F16" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M100 24 Q82 8 80 20 Q82 32 100 24 Q118 8 120 20 Q118 32 100 24Z" fill="#7A4A1E"/><circle cx="100" cy="24" r="5" fill="#5C3613"/>' +
      glass + sparks + '</svg>';
  };

  /* ───────── Tel Aviv style skyline, drawn once ───────── */
  Y.skyline = () => {
    const b = [[0, 46, 30], [34, 30, 52], [68, 22, 38], [94, 34, 70], [132, 26, 44], [162, 40, 86], [206, 24, 54], [234, 30, 34], [268, 36, 64], [308, 22, 46], [334, 30, 78], [368, 32, 40]];
    let rects = '', win = '';
    b.forEach((x, i) => {
      rects += '<rect x="' + x[0] + '" y="' + (120 - x[2]) + '" width="' + x[1] + '" height="' + x[2] + '" rx="2" fill="' + (i % 2 ? '#13278A' : '#0F1F73') + '"/>';
      for (let yy = 120 - x[2] + 6; yy < 112; yy += 9) for (let xx = x[0] + 4; xx < x[0] + x[1] - 4; xx += 7) if ((xx * 7 + yy * 13 + i) % 5 < 2) win += '<rect x="' + xx + '" y="' + yy + '" width="3" height="4" fill="#FFD97A" opacity="' + (((xx + yy) % 3) * 0.25 + 0.4) + '"/>';
    });
    const palm = (x, s) => '<g transform="translate(' + x + ' 120) scale(' + s + ')"><path d="M0 0 Q-3 -26 2 -46" stroke="#081350" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M2 -46 Q-18 -54 -26 -40 M2 -46 Q-12 -64 -24 -60 M2 -46 Q8 -66 22 -62 M2 -46 Q22 -54 28 -40 M2 -46 Q2 -64 -4 -70" stroke="#081350" stroke-width="5" fill="none" stroke-linecap="round"/></g>';
    return '<svg class="skyline" viewBox="0 0 400 130" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + rects + win + palm(24, 1) + palm(388, .9) + palm(300, .6) +
      '<rect x="0" y="118" width="400" height="12" fill="#081350"/><path d="M0 121 H400" stroke="#3C6BFF" stroke-width="1.500" opacity=".5" stroke-dasharray="14 10"/></svg>';
  };

  /* ───────── animated lesson scene ───────── */
  Y.PLACES = { city: 'ברחוב בעיר', home: 'בבית', cafe: 'בבית קפה בתל אביב', airport: 'בשדה התעופה', hotel: 'בקבלה של המלון', street: 'באמצע העיר', shop: 'בחנות', party: 'בערב עם חברים', office: 'במשרד', clinic: 'במרפאה', kids: 'בגן השעשועים', chat: 'בשיחה עם מקומיים' };
  Y.scene = (key, who, emoji) => {
    const sc = Y.SCENES[key] || Y.SCENES.city;
    return '<div class="scene sky-' + sc.sky + '" aria-hidden="true">' +
      '<div class="scene-orb"></div><div class="scene-cloud c1"></div><div class="scene-cloud c2"></div>' +
      '<div class="scene-far">' + sc.far.map((f) => '<span>' + f + '</span>').join('') + '</div>' +
      '<div class="scene-mover ' + sc.dir + '">' + sc.mover + '</div>' +
      '<div class="scene-ground"></div>' +
      '<div class="scene-actors"><span class="actor actor-who">' + (who || '🧑') + '</span>' +
      '<span class="actor-prop">' + (emoji || '') + '</span>' +
      '<span class="actor actor-sabi">' + Y.mascot('wave', 92) + '</span></div></div>';
  };

  /* ───────── toast, sheet, confetti ───────── */
  let toastT = null;
  Y.toast = (msg) => {
    let el = Y.$('#toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.className = 'show';
    clearTimeout(toastT); toastT = setTimeout(() => { el.className = ''; }, 2600);
  };
  Y.sheet = (html, opts) => {
    Y.closeSheet();
    const wrap = document.createElement('div');
    wrap.id = 'sheet'; wrap.className = 'sheet-wrap';
    wrap.innerHTML = '<div class="sheet-back" data-act="' + ((opts && opts.sticky) ? '' : 'sheet-dismiss') + '"></div>' +
      '<div class="sheet" role="dialog" aria-modal="true"><div class="sheet-grab" aria-hidden="true"></div>' + html + '</div>';
    if (!(opts && opts.sticky)) dragToClose(wrap);
    Y.$('#shell').appendChild(wrap);
    Y.sfx('whoosh');
    const sh = wrap.querySelector('.sheet'); sh._y = sh.offsetHeight + 40; sh.style.transform = 'translateY(' + sh._y + 'px)';
    requestAnimationFrame(() => { wrap.classList.add('open'); springY(sh, 0, 0, 1, 0.35); });
    const f = wrap.querySelector('button, input'); if (f && !(opts && opts.nofocus)) f.focus({ preventScroll: true });
  };
  /* A small spring (Apple-style damping ratio + response). It always starts from the element's
     live position and accepts a starting velocity, so a drag can hand off to it without a seam
     and a new touch can interrupt it at any frame. */
  const still = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function springY(el, to, v0, damping, response, done) {
    cancelAnimationFrame(el._raf);
    if (still()) { el._y = to; el.style.transform = to ? 'translateY(' + to + 'px)' : ''; if (done) done(); return; }
    const w = (2 * Math.PI) / response; let x = (el._y || 0) - to, v = v0 || 0, last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.032, (now - last) / 1000); last = now;
      v += (-w * w * x - 2 * damping * w * v) * dt; x += v * dt;
      el._y = to + x; el.style.transform = 'translateY(' + el._y + 'px)';
      if (Math.abs(x) < 0.5 && Math.abs(v) < 8) { el._y = to; el.style.transform = to ? 'translateY(' + to + 'px)' : ''; if (done) done(); }
      else el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }
  const project = (v, rate) => (v / 1000) * rate / (1 - rate);            // where a flick would come to rest
  const rubber = (over, dim) => (over * dim * 0.55) / (dim + 0.55 * Math.abs(over)); // soft resistance past the edge
  function dismissSheet(wrap, v) {
    const sheet = wrap.querySelector('.sheet');
    wrap.classList.remove('open'); wrap.style.pointerEvents = 'none';
    const gone = () => { if (wrap.isConnected) wrap.remove(); };
    springY(sheet, sheet.offsetHeight + 40, v || 0, 1, 0.3, gone); setTimeout(gone, 320); // off-screen well before the spring fully settles
  }
  // the sheet tracks the finger 1:1, resists when pulled up, and on release goes where the flick was heading
  function dragToClose(wrap) {
    const sheet = wrap.querySelector('.sheet'); let start = null, base = 0, moved = false, hist = [];
    sheet.addEventListener('pointerdown', (e) => {
      if (sheet.scrollTop > 0 || e.target.closest('input, .seg')) return;
      start = e.clientY; base = sheet._y || 0; moved = false; hist = [[e.clientY, performance.now()]];
    });
    sheet.addEventListener('pointermove', (e) => {
      if (start == null) return;
      const dy = e.clientY - start;
      if (!moved) { if (Math.abs(dy) < 10) return; moved = true; cancelAnimationFrame(sheet._raf); try { sheet.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
      let y = base + dy; if (y < 0) y = -rubber(-y, sheet.offsetHeight);
      sheet._y = y; sheet.style.transform = 'translateY(' + y + 'px)';
      hist.push([e.clientY, performance.now()]); if (hist.length > 5) hist.shift();
    });
    const end = () => {
      if (start == null) return; start = null;
      if (!moved) return;
      const a = hist[0], z = hist[hist.length - 1], v = z[1] > a[1] ? ((z[0] - a[0]) / (z[1] - a[1])) * 1000 : 0;
      // a drag must not also count as a tap on whatever was under the finger
      const eat = (ev) => { ev.stopPropagation(); ev.preventDefault(); }; document.addEventListener('click', eat, { capture: true, once: true }); setTimeout(() => document.removeEventListener('click', eat, true), 80);
      if ((sheet._y || 0) + project(v, 0.99) > sheet.offsetHeight * 0.5) dismissSheet(wrap, v);
      else springY(sheet, 0, v, 0.8, 0.3);
    };
    sheet.addEventListener('pointerup', end); sheet.addEventListener('pointercancel', end);
  }
  Y.dismissSheet = () => { const w = Y.$('#sheet'); if (w) dismissSheet(w, 0); };
  Y.closeSheet = () => { const s = Y.$('#sheet'); if (s) s.remove(); };

  Y.confetti = (small) => {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const shell = Y.$('#shell'); if (!shell) return;
    const cv = document.createElement('canvas'); cv.className = 'confetti';
    shell.appendChild(cv);
    const w = cv.width = shell.clientWidth, h = cv.height = shell.clientHeight, c2 = cv.getContext('2d');
    const colors = ['#3C6BFF', '#FFC83D', '#FF6B74', '#3DDC84', '#ffffff', '#A99BFF'];
    const parts = Array.from({ length: small ? 28 : 130 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * (small ? 200 : 80), y: small ? h - 110 : h * 0.36, vx: (Math.random() - 0.5) * (small ? 8 : 14), vy: -Math.random() * (small ? 8 : 14) - 4,
      s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: Y.pick(colors)
    }));
    const life = small ? 60 : 140;
    let t = 0;
    const tick = () => {
      c2.clearRect(0, 0, w, h); t++;
      parts.forEach((p) => {
        p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr;
        c2.save(); c2.translate(p.x, p.y); c2.rotate(p.r); c2.fillStyle = p.c;
        c2.globalAlpha = Math.max(0, 1 - t / life);
        c2.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66); c2.restore();
      });
      if (t < life && cv.isConnected) requestAnimationFrame(tick); else cv.remove();
    };
    requestAnimationFrame(tick);
  };

  // count a number up inside an element
  Y.countUp = (el, to, ms) => {
    if (!el) return; const t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / (ms || 800)); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1 && el.isConnected) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };

  /* ───────── icons ───────── */
  const ico = (d) => '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  Y.ICON = {
    home: ico('<path d="M3 11.500 12 4l9 7.500"/><path d="M5.500 10v9.500h13V10"/><path d="M10 19.500v-5h4v5"/>'),
    path: ico('<path d="M4 5.500c2.500-1.500 5.500-1.500 8 0v14c-2.500-1.500-5.500-1.500-8 0z"/><path d="M12 5.500c2.500-1.500 5.500-1.500 8 0v14c-2.500-1.500-5.500-1.500-8 0"/>'),
    review: ico('<path d="M4.500 12a7.500 7.500 0 1 0 2.300-5.400"/><path d="M4 4.500v3.500h3.500"/><path d="M12 8.500V12l2.500 1.500"/>'),
    profile: ico('<circle cx="12" cy="8.500" r="4"/><path d="M4.500 20a7.500 7.500 0 0 1 15 0"/>'),
    crown: ico('<path d="M4 18h16l1.200-9.500-5.200 4L12 5l-4 7.500-5.200-4z"/>'),
    speaker: ico('<path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500z" fill="currentColor"/><path d="M15.500 9a4 4 0 0 1 0 6M18 6.500a7.500 7.500 0 0 1 0 11"/>'),
    close: ico('<path d="M6 6l12 12M18 6 6 18"/>'),
    lock: ico('<rect x="5.500" y="10.500" width="13" height="9.500" rx="2.500"/><path d="M8.500 10.500V8a3.500 3.500 0 0 1 7 0v2.500"/>'),
    check: ico('<path d="M5 12.500l4.500 4.500L19 7.500"/>'),
    back: ico('<path d="M9 6l6 6-6 6"/>'),
    arrow: ico('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    play: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5.500v13l11-6.500z" fill="currentColor"/></svg>',
    mic: ico('<rect x="9" y="3.500" width="6" height="11" rx="3"/><path d="M5.500 11.500a6.500 6.500 0 0 0 13 0M12 18v3"/>'),
    gear: ico('<circle cx="12" cy="12" r="3"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M5.600 18.400l1.800-1.800M16.600 7.400l1.800-1.800"/>')
  };
  Y.speakBtn = (text, big) =>
    '<button class="spk' + (big ? ' spk-big' : '') + '" data-act="say" data-say="' + Y.esc(text) + '" aria-label="השמע">' + Y.ICON.speaker + '</button>';
  Y.wordmark = (sub) => '<div class="wordmark" dir="ltr" aria-label="Yalla English"><span>YALLA</span><b>English</b>' + (sub ? '<i>' + sub + '</i>' : '') + '</div>';

  Y.praise = () => Y.pick(['מעולה!', Y.g('אלוף!', 'אלופה!'), 'וואלה, מושלם!', Y.g('תותח!', 'תותחית!'), 'יפה מאוד!', 'בול!', 'חבל על הזמן!', 'אש! 🔥', 'כל הכבוד!']);
  Y.comfort = () => Y.pick(['לא נורא, ממשיכים', 'כמעט! ככה לומדים', 'קורה לכולם', 'עוד רגע זה יישב']);
})();
