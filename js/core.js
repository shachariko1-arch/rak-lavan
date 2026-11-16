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
    settings: { sound: true, tts: true, rate: 1, theme: 'auto' }
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

  Y.applyTheme = () => {
    const t = Y.state.settings.theme;
    if (t === 'auto') { if (Y._themeSet) document.documentElement.removeAttribute('data-theme'); }
    else { document.documentElement.setAttribute('data-theme', t); Y._themeSet = true; }
  };

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
  Y.totalLessons = () => Y.COURSE.reduce((n, u) => n + u.lessons.length, 0);
  Y.doneCount = () => Object.keys(Y.state.done).length;
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
    const fresh = [];
    Y.ACHS.forEach((a) => { if (!Y.state.ach[a.id] && a.ok(Y.state)) { Y.state.ach[a.id] = Y.dayKey(); fresh.push(a); } });
    return fresh;
  };

  /* ───────── sound ───────── */
  let actx = null;
  const tone = (freq, start, dur, type, vol) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, actx.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol || 0.16, actx.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + start + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(actx.currentTime + start); o.stop(actx.currentTime + start + dur + 0.05);
  };
  Y.sfx = (name) => {
    if (!Y.state.settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      if (name === 'ok') { tone(660, 0, 0.12, 'triangle'); tone(990, 0.1, 0.2, 'triangle'); }
      else if (name === 'bad') { tone(220, 0, 0.16, 'sawtooth', 0.09); tone(165, 0.14, 0.24, 'sawtooth', 0.09); }
      else if (name === 'tap') { tone(520, 0, 0.05, 'triangle', 0.07); }
      else if (name === 'win') { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle')); }
    } catch (e) { /* no audio */ }
  };

  /* ───────── speech ───────── */
  Y.canSpeak = () => 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  Y.canListen = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  let voice = null;
  const pickVoice = () => {
    if (!Y.canSpeak()) return;
    const vs = speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
    const pref = ['Samantha', 'Google US English', 'Aria', 'Jenny', 'Google UK English Female', 'Karen', 'Daniel'];
    voice = null;
    for (const p of pref) { voice = vs.find((v) => v.name.indexOf(p) >= 0); if (voice) break; }
    voice = voice || vs.find((v) => /en[-_]US/i.test(v.lang)) || vs[0] || null;
  };
  if (Y.canSpeak()) { pickVoice(); try { speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) { /* older browsers */ } }
  Y.speak = (text, slow) => {
    if (!Y.canSpeak() || !Y.state.settings.tts) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      if (voice) u.voice = voice;
      u.rate = (slow ? 0.6 : 0.95) * Y.state.settings.rate;
      speechSynthesis.speak(u);
    } catch (e) { /* speech unavailable */ }
  };

  /* ───────── Sabi the mascot (a sabra cactus in a detective hat) ───────── */
  Y.mascot = (mood, size) => {
    mood = mood || 'happy'; size = size || 120;
    const up = mood === 'cheer';
    const eyes = {
      happy: '<circle cx="84" cy="130" r="5.5" fill="#1B2340"/><circle cx="120" cy="130" r="5.5" fill="#1B2340"/><circle cx="86" cy="128" r="1.8" fill="#fff"/><circle cx="122" cy="128" r="1.8" fill="#fff"/>',
      cheer: '<path d="M75 131 Q83 121 91 131" fill="none" stroke="#1B2340" stroke-width="4" stroke-linecap="round"/><path d="M111 131 Q119 121 127 131" fill="none" stroke="#1B2340" stroke-width="4" stroke-linecap="round"/>',
      sad: '<circle cx="83" cy="133" r="5.5" fill="#1B2340"/><circle cx="119" cy="133" r="5.5" fill="#1B2340"/><path d="M72 116 L92 121" stroke="#1F7A45" stroke-width="4" stroke-linecap="round"/><path d="M130 116 L110 121" stroke="#1F7A45" stroke-width="4" stroke-linecap="round"/>',
      think: '<circle cx="80" cy="127" r="5.5" fill="#1B2340"/><circle cx="116" cy="127" r="5.5" fill="#1B2340"/><path d="M108 112 L130 108" stroke="#1F7A45" stroke-width="4" stroke-linecap="round"/>'
    };
    const mouths = {
      happy: '<path d="M88 150 Q101 163 114 150" fill="none" stroke="#1B2340" stroke-width="4" stroke-linecap="round"/>',
      cheer: '<path d="M85 148 Q101 174 117 148 Z" fill="#7A1F2B" stroke="#1B2340" stroke-width="3" stroke-linejoin="round"/><path d="M93 160 Q101 168 109 160 Q101 155 93 160Z" fill="#F0717F"/>',
      sad: '<path d="M90 158 Q101 148 112 158" fill="none" stroke="#1B2340" stroke-width="4" stroke-linecap="round"/>',
      think: '<path d="M94 154 Q102 150 110 155" fill="none" stroke="#1B2340" stroke-width="4" stroke-linecap="round"/>'
    };
    const key = mood === 'wave' ? 'happy' : mood;
    const whiteEyes = key === 'cheer' ? '' : '<circle cx="83" cy="130" r="11" fill="#fff"/><circle cx="119" cy="130" r="11" fill="#fff"/>';
    const armL = up
      ? '<ellipse cx="38" cy="112" rx="14" ry="24" transform="rotate(-38 38 112)" fill="#44C27A" stroke="#2A9457" stroke-width="4"/>'
      : '<ellipse cx="38" cy="146" rx="14" ry="22" transform="rotate(28 38 146)" fill="#44C27A" stroke="#2A9457" stroke-width="4"/>';
    const armR = (up || mood === 'wave')
      ? '<g class="sabi-wave"><ellipse cx="164" cy="112" rx="14" ry="24" transform="rotate(38 164 112)" fill="#44C27A" stroke="#2A9457" stroke-width="4"/></g>'
      : '<ellipse cx="164" cy="146" rx="14" ry="22" transform="rotate(-28 164 146)" fill="#44C27A" stroke="#2A9457" stroke-width="4"/>';
    const glass = mood === 'think'
      ? '<g transform="rotate(-18 168 150)"><rect x="165" y="158" width="7" height="26" rx="3.5" fill="#7A4A1E"/><circle cx="168" cy="142" r="17" fill="#CFEFFF" fill-opacity=".75" stroke="#F8B62B" stroke-width="5"/><path d="M159 136 Q164 130 171 131" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>'
      : '';
    const flower = up ? '' : '<g transform="translate(26 126)"><circle r="5" cx="0" cy="-6" fill="#F56BA6"/><circle r="5" cx="6" cy="0" fill="#F56BA6"/><circle r="5" cx="0" cy="6" fill="#F56BA6"/><circle r="5" cx="-6" cy="0" fill="#F56BA6"/><circle r="4" fill="#FFD84A"/></g>';
    const sparks = up ? '<g fill="#F8B62B"><path d="M22 60 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path d="M178 54 l2.5 7 7 2.5 -7 2.5 -2.5 7 -2.5 -7 -7 -2.5 7 -2.5z"/><circle cx="16" cy="96" r="3"/><circle cx="186" cy="92" r="3"/></g>' : '';
    return '<svg class="sabi sabi-' + mood + '" width="' + size + '" height="' + Math.round(size * 1.05) + '" viewBox="0 0 200 210" role="img" aria-label="סאבי הצבר">' +
      '<defs><clipPath id="hatclip"><path d="M57 88 Q58 40 100 38 Q142 40 143 88 Z"/></clipPath></defs>' +
      '<ellipse cx="100" cy="204" rx="52" ry="5" fill="#000" opacity=".12"/>' +
      '<ellipse cx="82" cy="200" rx="15" ry="7" fill="#2A9457"/><ellipse cx="120" cy="200" rx="15" ry="7" fill="#2A9457"/>' +
      armL + armR + flower +
      '<ellipse cx="101" cy="138" rx="56" ry="64" fill="#44C27A" stroke="#2A9457" stroke-width="4"/>' +
      '<ellipse cx="80" cy="120" rx="28" ry="36" fill="#6FDB9B" opacity=".45"/>' +
      '<g stroke="#1F7A45" stroke-width="2.4" stroke-linecap="round"><path d="M58 168 l-4 4M58 168 l4 4"/><path d="M146 172 l-4 4M146 172 l4 4"/><path d="M101 184 l-4 4M101 184 l4 4"/><path d="M134 104 l-3 4M134 104 l4 3"/><path d="M70 186 l-3 4M70 186 l4 3"/><path d="M132 190 l-3 4M132 190 l4 3"/></g>' +
      '<circle cx="68" cy="150" r="8" fill="#F78FA7" opacity=".7"/><circle cx="134" cy="150" r="8" fill="#F78FA7" opacity=".7"/>' +
      '<g class="sabi-eyes">' + whiteEyes + eyes[key] + '</g>' + mouths[key] +
      /* deerstalker hat */
      '<path d="M57 88 Q58 40 100 38 Q142 40 143 88 Z" fill="#B98545" stroke="#7A4A1E" stroke-width="4" stroke-linejoin="round"/>' +
      '<g clip-path="url(#hatclip)" stroke="#8A5A26" stroke-width="2" opacity=".6"><path d="M70 30 V92M85 30 V92M100 30 V92M115 30 V92M130 30 V92"/><path d="M50 52 H150M50 66 H150M50 80 H150"/></g>' +
      '<path d="M60 86 Q34 88 30 102 Q52 100 76 90 Z" fill="#A87437" stroke="#7A4A1E" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M140 86 Q166 88 170 102 Q148 100 124 90 Z" fill="#A87437" stroke="#7A4A1E" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M56 88 H144" stroke="#7A4A1E" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M100 38 Q84 22 82 34 Q84 44 100 38 Q116 22 118 34 Q116 44 100 38Z" fill="#7A4A1E"/><circle cx="100" cy="38" r="4.5" fill="#5C3613"/>' +
      glass + sparks + '</svg>';
  };

  Y.bubble = (mood, text, size) =>
    '<div class="sabi-row">' + Y.mascot(mood, size || 96) + '<div class="bubble">' + text + '</div></div>';

  /* ───────── animated lesson scene ───────── */
  Y.scene = (key, who, emoji) => {
    const sc = Y.SCENES[key] || Y.SCENES.city;
    return '<div class="scene sky-' + sc.sky + '" aria-hidden="true">' +
      '<div class="scene-orb"></div><div class="scene-cloud c1"></div><div class="scene-cloud c2"></div>' +
      '<div class="scene-far">' + sc.far.map((f) => '<span>' + f + '</span>').join('') + '</div>' +
      '<div class="scene-mover ' + sc.dir + '">' + sc.mover + '</div>' +
      '<div class="scene-ground"></div>' +
      '<div class="scene-actors"><span class="actor actor-who">' + (who || '🧑') + '</span>' +
      '<span class="actor-prop">' + (emoji || '') + '</span>' +
      '<span class="actor actor-sabi">' + Y.mascot('wave', 84) + '</span></div></div>';
  };

  /* ───────── toast, sheet, confetti ───────── */
  let toastT = null;
  Y.toast = (msg) => {
    let el = Y.$('#toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.className = 'show';
    clearTimeout(toastT); toastT = setTimeout(() => { el.className = ''; }, 2800);
  };
  Y.sheet = (html, opts) => {
    Y.closeSheet();
    const wrap = document.createElement('div');
    wrap.id = 'sheet'; wrap.className = 'sheet-wrap';
    wrap.innerHTML = '<div class="sheet-back" data-act="' + ((opts && opts.sticky) ? '' : 'sheet-close') + '"></div>' +
      '<div class="sheet" role="dialog" aria-modal="true">' + html + '</div>';
    Y.$('#shell').appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('open'));
    const f = wrap.querySelector('button, input'); if (f && !(opts && opts.nofocus)) f.focus({ preventScroll: true });
  };
  Y.closeSheet = () => { const s = Y.$('#sheet'); if (s) s.remove(); };

  Y.confetti = () => {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const shell = Y.$('#shell'); if (!shell) return;
    const cv = document.createElement('canvas'); cv.className = 'confetti';
    shell.appendChild(cv);
    const w = cv.width = shell.clientWidth, h = cv.height = shell.clientHeight, ctx = cv.getContext('2d');
    const colors = ['#2B5BF0', '#F8B62B', '#E5484D', '#44C27A', '#ffffff', '#7A4FE0'];
    const parts = Array.from({ length: 110 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 80, y: h * 0.38, vx: (Math.random() - 0.5) * 13, vy: -Math.random() * 13 - 4,
      s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: Y.pick(colors)
    }));
    let t = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h); t++;
      parts.forEach((p) => {
        p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.max(0, 1 - t / 130);
        ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66); ctx.restore();
      });
      if (t < 130) requestAnimationFrame(tick); else cv.remove();
    };
    requestAnimationFrame(tick);
  };

  /* ───────── icons ───────── */
  const ico = (d) => '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  Y.ICON = {
    home: ico('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>'),
    practice: ico('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
    league: ico('<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5A3.5 3.5 0 0 1 16.500 11"/><path d="M12 14v4M8.500 20h7"/>'),
    plus: ico('<path d="M4 18h16l1.200-9.500-5.200 4L12 5l-4 7.500-5.200-4z"/>'),
    profile: ico('<circle cx="12" cy="8.500" r="4"/><path d="M4.500 20a7.500 7.500 0 0 1 15 0"/>'),
    speaker: ico('<path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500z" fill="currentColor"/><path d="M15.500 9a4 4 0 0 1 0 6M18 6.500a7.500 7.500 0 0 1 0 11"/>'),
    close: ico('<path d="M6 6l12 12M18 6 6 18"/>'),
    lock: ico('<rect x="5.500" y="10.500" width="13" height="9.500" rx="2.500"/><path d="M8.500 10.500V8a3.500 3.500 0 0 1 7 0v2.500"/>'),
    check: ico('<path d="M5 12.500l4.500 4.500L19 7.500"/>'),
    back: ico('<path d="M9 6l6 6-6 6"/>'),
    mic: ico('<rect x="9" y="3.500" width="6" height="11" rx="3"/><path d="M5.500 11.500a6.500 6.500 0 0 0 13 0M12 18v3"/>'),
    gear: ico('<circle cx="12" cy="12" r="3"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M5.600 18.400l1.800-1.800M16.600 7.400l1.800-1.800"/>')
  };
  Y.speakBtn = (text, big) =>
    '<button class="spk' + (big ? ' spk-big' : '') + '" data-act="say" data-say="' + Y.esc(text) + '" aria-label="השמע">' + Y.ICON.speaker + '</button>';

  Y.praise = () => Y.pick(['מעולה!', Y.g('אלוף!', 'אלופה!'), 'וואלה, מושלם!', Y.g('תותח!', 'תותחית!'), 'יפה מאוד!', 'בול!', 'חבל על הזמן!', 'אש! 🔥', 'כל הכבוד!']);
  Y.comfort = () => Y.pick(['לא נורא, ממשיכים', 'כמעט! ככה לומדים', 'קורה לכולם', 'עוד רגע זה יישב']);
})();
