/* Yalla English – exercise generator and lesson player */
(function () {
  const Y = window.Y, esc = Y.esc;

  const norm = (s) => String(s).toLowerCase().replace(/[.,!?;:"]/g, '').replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim();
  const tokens = (s) => s.replace(/[.,!?;:"]/g, '').split(/\s+/).filter(Boolean);
  const lev = (a, b) => {
    const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  };
  const others = (list, item, n, key) => Y.sample(list.filter((x) => x[key] !== item[key]), n);

  /* ───────── exercise builders ───────── */
  const X = {
    pick: (w, pool) => ({ type: 'choice', layout: 'cards', title: 'איך אומרים באנגלית?', prompt: w.he, item: w, kind: 'w', say: w.en,
      options: Y.shuffle([w].concat(others(pool, w, 3, 'en'))).map((o) => ({ label: o.en, emoji: o.em, ok: o.en === w.en, ltr: true })) }),
    mcWord: (w, pool) => ({ type: 'choice', layout: 'list', title: 'מה הפירוש?', prompt: w.en, promptLtr: true, audio: w.en, item: w, kind: 'w', say: w.en,
      options: Y.shuffle([w].concat(others(pool, w, 3, 'en'))).map((o) => ({ label: o.he, ok: o.en === w.en })) }),
    hearWord: (w, pool) => ({ type: 'choice', layout: 'cards', title: 'מה שמעת?', audio: w.en, audioOnly: true, item: w, kind: 'w', say: w.en,
      options: Y.shuffle([w].concat(others(pool, w, 3, 'en'))).map((o) => ({ label: o.he, emoji: o.em, ok: o.en === w.en })) }),
    mcSent: (s, pool) => ({ type: 'choice', layout: 'list', title: 'מה פירוש המשפט?', prompt: s.en, promptLtr: true, audio: s.en, item: s, kind: 's', say: s.en,
      options: Y.shuffle([s].concat(others(pool, s, 2, 'en'))).map((o) => ({ label: o.he, ok: o.en === s.en })) }),
    fill: (s, words, pool) => {
      const tk = tokens(s.en);
      const vocab = words.map((w) => w.en.toLowerCase());
      let idx = tk.findIndex((t) => vocab.indexOf(t.toLowerCase()) >= 0);
      if (idx < 0) { idx = 0; tk.forEach((t, i) => { if (t.length > tk[idx].length) idx = i; }); }
      const answer = tk[idx];
      let bank = [];
      if (vocab.indexOf(answer.toLowerCase()) >= 0) bank = vocab.filter((v) => v !== answer.toLowerCase() && v.indexOf(' ') < 0);
      if (bank.length < 3) pool.forEach((p) => tokens(p.en).forEach((t) => { if (t.length > 2 && norm(t) !== norm(answer) && bank.indexOf(t.toLowerCase()) < 0) bank.push(t.toLowerCase()); }));
      const shown = s.en.replace(new RegExp('\\b' + answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'), '____');
      const lower = answer === 'I' || /^[A-Z]/.test(answer) && idx > 0 ? answer : answer.toLowerCase();
      return { type: 'choice', layout: 'chips', title: 'השלימו את המשפט', prompt: shown, promptLtr: true, sub: s.he, item: s, kind: 's', say: s.en,
        options: Y.shuffle([{ label: lower, ok: true, ltr: true }].concat(Y.sample(bank, 3).map((b) => ({ label: b, ok: false, ltr: true })))) };
    },
    build: (s, pool, listen) => {
      const tk = tokens(s.en);
      const extra = [];
      Y.shuffle(pool).forEach((p) => tokens(p.en).forEach((t) => {
        if (extra.length < 3 && !tk.some((x) => x.toLowerCase() === t.toLowerCase()) && extra.indexOf(t) < 0) extra.push(t);
      }));
      return { type: 'build', title: listen ? 'הקשיבו וכתבו את המשפט' : 'תרגמו לאנגלית', prompt: listen ? '' : s.he, audio: listen ? s.en : '', audioOnly: !!listen,
        answer: s.en, item: s, kind: 's', say: s.en, tiles: Y.shuffle(tk.concat(extra)) };
    },
    match: (words) => ({ type: 'match', title: 'התאימו את הזוגות', pairs: Y.sample(words, Math.min(5, words.length)) }),
    type: (w) => ({ type: 'type', title: 'כתבו באנגלית', prompt: w.he, emoji: w.em, answer: w.en, item: w, kind: 'w', say: w.en }),
    speak: (s) => ({ type: 'speak', title: 'אמרו בקול', prompt: s.en, sub: s.he, answer: s.en, item: s, kind: 's' }),
    reply: (line, answer, pool, who) => ({ type: 'choice', layout: 'list', title: 'מה עונים?', chat: { who: who, en: line.en, he: line.he }, audio: line.en, item: answer, kind: 's', say: answer.en,
      options: Y.shuffle([answer].concat(others(pool, answer, 2, 'en'))).map((o) => ({ label: o.en, ok: o.en === answer.en, ltr: true })) })
  };

  /* ───────── build a full lesson ───────── */
  Y.buildLesson = (unit, li) => {
    const L = unit.lessons[li];
    const W = L.w.map(Y.parseW), S = L.s.map(Y.parseS), D = L.d.map(Y.parseD);
    const unitS = [].concat.apply([], unit.lessons.map((l) => l.s.map(Y.parseS)));
    const unitB = [].concat.apply([], unit.lessons.map((l) => l.d.map(Y.parseD).filter((d) => d.who === 'b')));
    const tts = Y.canSpeak() && Y.state.settings.tts;
    const steps = [];
    steps.push({ type: 'scene', unit: unit, lesson: L, dialog: D });
    steps.push({ type: 'learn', words: W.slice(0, 3) });
    steps.push(X.pick(W[0], W));
    steps.push(X.mcWord(W[1], W));
    steps.push(X.pick(W[2], W));
    steps.push({ type: 'learn', words: W.slice(3, 6) });
    steps.push(X.pick(W[3], W));
    steps.push(tts ? X.hearWord(W[4], W) : X.mcWord(W[4], W));
    steps.push(X.match(W));
    steps.push(X.mcSent(S[0], unitS));
    steps.push(X.build(S[0], S));
    steps.push(X.fill(S[1], W, S));
    steps.push(X.build(S[2], S));
    const bi = D.findIndex((d, i) => d.who === 'b' && i > 0 && D[i - 1].who === 'a');
    if (bi > 0) steps.push(X.reply(D[bi - 1], D[bi], unitB, L.who));
    steps.push(tts ? X.build(S[3], S, true) : X.mcSent(S[3], unitS));
    steps.push(X.type(W[5]));
    if (Y.canListen()) steps.push(X.speak(S[1]));
    return { mode: 'lesson', unit: unit, li: li, title: L.t, tip: L.tip, steps: steps };
  };

  /* practice session from words / sentences the learner already met */
  Y.buildPractice = (mode) => {
    const allW = [], allS = [];
    Y.COURSE.forEach((u) => u.lessons.forEach((l, i) => {
      if (Y.state.done[Y.lid(u, i)]) { l.w.forEach((w) => allW.push(Y.parseW(w))); l.s.forEach((s) => allS.push(Y.parseS(s))); }
    }));
    if (allW.length < 6) { // nothing finished yet: practise the first lesson
      Y.COURSE[0].lessons[0].w.forEach((w) => allW.push(Y.parseW(w)));
      Y.COURSE[0].lessons[0].s.forEach((s) => allS.push(Y.parseS(s)));
    }
    const tts = Y.canSpeak() && Y.state.settings.tts;
    let steps = [];
    if (mode === 'mistakes') {
      Y.state.mistakes.slice(0, 10).forEach((m) => {
        if (m.kind === 'w') steps.push(Math.random() < 0.5 ? X.pick(m, allW) : X.mcWord(m, allW));
        else steps.push(Math.random() < 0.5 ? X.build(m, allS) : X.mcSent(m, allS));
      });
    } else if (mode === 'listen') {
      Y.sample(allW, 5).forEach((w) => steps.push(X.hearWord(w, allW)));
      Y.sample(allS, 4).forEach((s) => steps.push(X.build(s, allS, true)));
      steps = Y.shuffle(steps);
    } else if (mode === 'match') {
      for (let i = 0; i < 4; i++) steps.push(X.match(allW));
    } else {
      const ws = Y.sample(allW, 6), ss = Y.sample(allS, 4);
      steps = [X.pick(ws[0], allW), X.mcWord(ws[1], allW), X.match(allW), X.build(ss[0], allS), tts ? X.hearWord(ws[2], allW) : X.pick(ws[2], allW),
        X.mcSent(ss[1], allS), X.type(ws[3]), X.build(ss[2], allS), X.pick(ws[4], allW), X.fill(ss[3], allW, allS)];
    }
    const titles = { mistakes: 'חזרה על טעויות', listen: 'אימון הקשבה', match: 'משחק זוגות', mix: 'תרגול מהיר' };
    return { mode: mode, title: titles[mode] || titles.mix, steps: steps };
  };

  /* ───────── player ───────── */
  let P = null; // current session

  Y.startLesson = (session) => {
    if (!session.steps.length) { Y.toast('אין כאן עדיין מה לתרגל'); return; }
    if (session.mode === 'lesson' && Y.hearts() <= 0) { Y.noHearts(); return; }
    P = { s: session, q: session.steps.slice(), i: 0, total: session.steps.length, done: 0, mistakes: 0, graded: 0, right: 0, t0: Date.now(), cur: null, sel: null, checked: false };
    Y.closeSheet();
    renderShell();
    next(true);
  };

  const heartsHtml = () => Y.isPlus() ? '<span class="lh-hearts">❤️ <b>∞</b></span>' : '<span class="lh-hearts">❤️ <b>' + Y.hearts() + '</b></span>';

  function renderShell() {
    Y.$('#app').className = 'app app-lesson';
    Y.$('#app').innerHTML =
      '<div class="lesson">' +
      '<header class="lesson-head"><button class="icon-btn" data-act="lesson-quit" aria-label="יציאה">' + Y.ICON.close + '</button>' +
      '<div class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i id="pfill"></i></div>' +
      (P.s.mode === 'lesson' ? heartsHtml() : '<span class="lh-hearts">🎯</span>') + '</header>' +
      '<main class="lesson-body" id="lbody"></main>' +
      '<footer class="lesson-foot" id="lfoot"></footer></div>';
  }
  const setProgress = () => { const f = Y.$('#pfill'); if (f) f.style.width = Math.max(4, Math.round((P.done / P.total) * 100)) + '%'; };
  const foot = (html, cls) => { const f = Y.$('#lfoot'); f.className = 'lesson-foot ' + (cls || ''); f.innerHTML = html; };
  const mainBtn = (label, act, disabled, cls) => '<button class="btn ' + (cls || 'btn-primary') + ' btn-block" id="mainbtn" data-act="' + act + '"' + (disabled ? ' disabled' : '') + '>' + label + '</button>';
  const enable = (on) => { const b = Y.$('#mainbtn'); if (b) b.disabled = !on; };

  function next(first) {
    if (!first) P.i++;
    if (P.i >= P.q.length) return finish();
    P.cur = P.q[P.i]; P.sel = null; P.checked = false; P.lastOk = true;
    setProgress();
    const body = Y.$('#lbody');
    body.classList.remove('enter', 'locked'); void body.offsetWidth; body.classList.add('enter');
    body.scrollTop = 0;
    RENDER[P.cur.type](P.cur, body);
  }

  const promptHtml = (ex) => {
    let h = '<h2 class="ex-title">' + ex.title + '</h2>';
    if (ex.chat) {
      h += '<div class="chat-q"><span class="chat-av">' + (ex.chat.who || '🧑') + '</span><div class="chat-b" dir="ltr">' + esc(ex.chat.en) +
        Y.speakBtn(ex.chat.en) + '<small dir="rtl">' + esc(ex.chat.he) + '</small></div></div>';
    } else if (ex.audioOnly) {
      h += '<div class="hear">' + Y.speakBtn(ex.audio, true) +
        '<button class="spk spk-slow" data-act="say" data-slow="1" data-say="' + esc(ex.audio) + '" aria-label="השמע לאט">🐢</button></div>';
    } else if (ex.prompt) {
      h += '<div class="ex-prompt-row">' + Y.mascot('think', 74) + '<div class="bubble ex-prompt"' + (ex.promptLtr ? ' dir="ltr"' : '') + '>' +
        (ex.audio ? Y.speakBtn(ex.audio) : '') + '<span>' + esc(ex.prompt) + '</span>' + (ex.sub ? '<small dir="rtl">' + esc(ex.sub) + '</small>' : '') + '</div></div>';
    }
    return h;
  };

  const RENDER = {
    scene: (ex, body) => {
      const L = ex.lesson;
      body.innerHTML = '<div class="scene-step"><p class="eyebrow">' + esc(ex.unit.title) + '</p><h2 class="ex-title">' + esc(L.t) + '</h2>' +
        Y.scene(ex.unit.scene, L.who, L.e) + '<div class="dialog" id="dialog"></div></div>';
      P.dl = 0;
      foot(mainBtn('המשך', 'scene-next'));
      showLine(ex);
    },
    learn: (ex, body) => {
      body.innerHTML = '<h2 class="ex-title">מילים חדשות</h2><p class="ex-hint">לחצו על מילה כדי לשמוע אותה</p><div class="learn-list">' +
        ex.words.map((w, i) => '<button class="learn-card" style="--d:' + i * 90 + 'ms" data-act="say" data-say="' + esc(w.en) + '">' +
          '<span class="learn-em">' + w.em + '</span><span class="learn-txt"><b dir="ltr">' + esc(w.en) + '</b><span>' + esc(w.he) + '</span></span>' +
          '<span class="spk-mini">' + Y.ICON.speaker + '</span></button>').join('') + '</div>';
      ex.words.forEach((w) => Y.noteWord(w, false));
      foot(mainBtn('הבנתי, ממשיכים', 'ex-continue'));
      setTimeout(() => Y.speak(ex.words[0].en), 350);
    },
    choice: (ex, body) => {
      body.innerHTML = promptHtml(ex) + '<div class="opts opts-' + ex.layout + '" role="radiogroup">' +
        ex.options.map((o, i) => '<button class="opt" role="radio" aria-checked="false" data-act="opt" data-i="' + i + '">' +
          (o.emoji ? '<span class="opt-em">' + o.emoji + '</span>' : '') + '<span class="opt-lbl"' + (o.ltr ? ' dir="ltr"' : '') + '>' + esc(o.label) + '</span></button>').join('') + '</div>';
      foot(skipLink(ex) + mainBtn('בדיקה', 'ex-check', true));
      if (ex.audio) setTimeout(() => Y.speak(ex.audio), 350);
    },
    build: (ex, body) => {
      P.sel = [];
      body.innerHTML = promptHtml(ex) + '<div class="build-line" id="bline" dir="ltr" aria-label="התשובה שלך"></div>' +
        '<div class="tiles" id="tiles" dir="ltr">' + ex.tiles.map((t, i) => '<button class="tile" data-act="tile" data-i="' + i + '">' + esc(t) + '</button>').join('') + '</div>';
      foot(skipLink(ex) + mainBtn('בדיקה', 'ex-check', true));
      if (ex.audio) setTimeout(() => Y.speak(ex.audio), 350);
    },
    match: (ex, body) => {
      const left = Y.shuffle(ex.pairs), right = Y.shuffle(ex.pairs);
      P.m = { a: null, left: ex.pairs.length, miss: 0 };
      body.innerHTML = '<h2 class="ex-title">' + ex.title + '</h2><div class="match">' +
        '<div class="match-col">' + left.map((w) => '<button class="opt mt" data-act="mt" data-side="en" data-k="' + esc(w.en) + '" dir="ltr">' + esc(w.en) + '</button>').join('') + '</div>' +
        '<div class="match-col">' + right.map((w) => '<button class="opt mt" data-act="mt" data-side="he" data-k="' + esc(w.en) + '">' + esc(w.he) + '</button>').join('') + '</div></div>';
      foot(mainBtn('המשך', 'ex-continue', true));
    },
    type: (ex, body) => {
      body.innerHTML = '<h2 class="ex-title">' + ex.title + '</h2><div class="type-card"><span class="type-em">' + ex.emoji + '</span><b>' + esc(ex.prompt) + '</b></div>' +
        '<input class="type-in" id="typein" dir="ltr" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type in English" aria-label="התשובה באנגלית">';
      foot(mainBtn('בדיקה', 'ex-check', true));
      const inp = Y.$('#typein');
      inp.addEventListener('input', () => enable(inp.value.trim().length > 0));
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && inp.value.trim()) Y.actions[P.checked ? 'ex-continue' : 'ex-check'](); });
    },
    speak: (ex, body) => {
      body.innerHTML = '<h2 class="ex-title">' + ex.title + '</h2><div class="ex-prompt-row">' + Y.mascot('happy', 74) +
        '<div class="bubble ex-prompt" dir="ltr">' + Y.speakBtn(ex.prompt) + '<span>' + esc(ex.prompt) + '</span><small dir="rtl">' + esc(ex.sub) + '</small></div></div>' +
        '<button class="mic" id="micbtn" data-act="mic">' + Y.ICON.mic + '<span>לחצו ודברו</span></button><p class="ex-hint" id="michint">נשמע אתכם ונבדוק את ההגייה</p>';
      foot('<button class="link-btn" data-act="ex-skip">אי אפשר לדבר עכשיו</button>');
      setTimeout(() => Y.speak(ex.prompt), 350);
    }
  };
  const skipLink = (ex) => ex.audioOnly ? '<button class="link-btn" data-act="ex-skip">אי אפשר להקשיב עכשיו</button>' : '';

  /* scene dialogue: one bubble at a time */
  function showLine(ex) {
    const d = ex.dialog[P.dl], box = Y.$('#dialog');
    if (!d) return;
    const me = d.who === 'b';
    const el = document.createElement('div');
    el.className = 'dline ' + (me ? 'me' : 'them');
    el.innerHTML = '<span class="dline-av">' + (me ? '🌵' : ex.lesson.who) + '</span><button class="dline-b" data-act="say" data-say="' + esc(d.en) + '"><b dir="ltr">' + esc(d.en) + '</b><small>' + esc(d.he) + '</small></button>';
    box.appendChild(el);
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    Y.speak(d.en);
    const last = P.dl >= ex.dialog.length - 1;
    const b = Y.$('#mainbtn'); if (b) b.textContent = last ? Y.g('הבנתי, בוא נתרגל', 'הבנתי, בואי נתרגל') : 'המשך';
  }

  /* ───────── grading ───────── */
  function grade(ok, opts) {
    opts = opts || {};
    const ex = P.cur;
    P.checked = true; P.graded++; P.lastOk = ok;
    if (ok) P.right++;
    if (ex.item) {
      if (ex.kind === 'w') Y.noteWord(ex.item, ok);
      if (ok) { if (P.s.mode === 'mistakes') Y.clearMistake(ex.item.en); }
      else Y.noteMistake({ kind: ex.kind, en: ex.item.en, he: ex.item.he, em: ex.item.em || '' });
    }
    if (ok) {
      Y.sfx('ok');
      if (ex.say && !opts.quiet) setTimeout(() => Y.speak(ex.say), 250);
      foot('<div class="fb"><div class="fb-ico">' + Y.ICON.check + '</div><div class="fb-txt"><b>' + (opts.title || Y.praise()) + '</b>' + (opts.note ? '<span>' + opts.note + '</span>' : '') + '</div></div>' +
        mainBtn('המשך', 'ex-continue', false, 'btn-ok'), 'is-ok');
    } else {
      Y.sfx('bad'); P.mistakes++;
      if (P.s.mode === 'lesson') { Y.loseHeart(); const h = Y.$('.lh-hearts'); if (h) { h.outerHTML = heartsHtml(); const n = Y.$('.lh-hearts'); n.classList.add('hit'); } }
      P.q.push(Object.assign({}, ex, { retry: true })); // come back to it at the end
      foot('<div class="fb"><div class="fb-ico">' + Y.ICON.close + '</div><div class="fb-txt"><b>' + Y.comfort() + '</b><span>התשובה הנכונה: <em dir="ltr">' + esc(opts.answer || '') + '</em></span></div></div>' +
        mainBtn('הבנתי', 'ex-continue', false, 'btn-bad'), 'is-bad');
    }
    Y.save();
    const b = Y.$('#mainbtn'); if (b) b.focus({ preventScroll: true });
  }

  Y.currentExercise = () => (P ? P.cur : null);

  const A = Y.actions = Y.actions || {};
  A['say'] = (el) => { Y.speak(el.dataset.say, !!el.dataset.slow); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); };
  A['scene-next'] = () => {
    const ex = P.cur;
    if (P.dl < ex.dialog.length - 1) { P.dl++; Y.sfx('tap'); showLine(ex); }
    else { P.done++; next(); }
  };
  // the progress bar only advances once a step is passed (wrong answers come back at the end)
  A['ex-continue'] = () => {
    if (!P) return;
    if (P.lastOk) P.done = Math.min(P.total, P.done + 1);
    if (P.s.mode === 'lesson' && Y.hearts() <= 0 && P.i < P.q.length - 1) { Y.noHearts(true); return; }
    next();
  };

  A['opt'] = (el) => {
    if (P.checked) return;
    Y.sfx('tap');
    Y.$$('.opt', Y.$('#lbody')).forEach((o) => { o.classList.remove('sel'); o.setAttribute('aria-checked', 'false'); });
    el.classList.add('sel'); el.setAttribute('aria-checked', 'true');
    P.sel = +el.dataset.i; enable(true);
    const o = P.cur.options[P.sel];
    if (o.ltr && !P.cur.audioOnly) Y.speak(o.label);
  };
  A['tile'] = (el) => {
    if (P.checked) return;
    Y.sfx('tap');
    const i = +el.dataset.i, line = Y.$('#bline');
    if (el.classList.contains('used')) return;
    el.classList.add('used'); P.sel.push(i);
    const chip = document.createElement('button');
    chip.className = 'tile in'; chip.textContent = P.cur.tiles[i]; chip.dataset.act = 'untile'; chip.dataset.i = i;
    line.appendChild(chip);
    if (!P.cur.audioOnly) Y.speak(P.cur.tiles[i]);
    enable(true);
  };
  A['untile'] = (el) => {
    if (P.checked) return;
    const i = +el.dataset.i;
    P.sel = P.sel.filter((x) => x !== i); el.remove();
    const t = Y.$('#tiles .tile[data-i="' + i + '"]'); if (t) t.classList.remove('used');
    enable(P.sel.length > 0);
  };
  A['mt'] = (el) => {
    if (el.classList.contains('gone')) return;
    const m = P.m;
    if (el.dataset.side === 'en') Y.speak(el.dataset.k);
    if (!m.a || m.a.dataset.side === el.dataset.side) {
      if (m.a) m.a.classList.remove('sel');
      m.a = el; el.classList.add('sel'); Y.sfx('tap'); return;
    }
    const a = m.a; m.a = null; a.classList.remove('sel');
    if (a.dataset.k === el.dataset.k) {
      Y.sfx('ok'); [a, el].forEach((x) => { x.classList.add('gone'); x.disabled = true; });
      m.left--;
      const w = P.cur.pairs.find((p) => p.en === el.dataset.k); if (w) Y.noteWord(w, true);
      if (m.left === 0) { P.checked = true; enable(true); Y.save(); const b = Y.$('#mainbtn'); b.classList.add('btn-ok'); b.focus({ preventScroll: true }); }
    } else {
      Y.sfx('bad'); m.miss++;
      [a, el].forEach((x) => { x.classList.add('shake'); setTimeout(() => x.classList.remove('shake'), 420); });
    }
  };
  A['ex-check'] = () => {
    if (!P || P.checked) return;
    const ex = P.cur;
    Y.$('#lbody').classList.add('locked');
    if (ex.type === 'choice') {
      if (P.sel == null) return;
      const o = ex.options[P.sel], right = ex.options.find((x) => x.ok);
      const els = Y.$$('.opt', Y.$('#lbody'));
      els[P.sel].classList.add(o.ok ? 'right' : 'wrong');
      if (!o.ok) els[ex.options.indexOf(right)].classList.add('right');
      grade(o.ok, { answer: right.label });
    } else if (ex.type === 'build') {
      const said = P.sel.map((i) => ex.tiles[i]).join(' ');
      const ok = norm(said) === norm(ex.answer);
      Y.$('#bline').classList.add(ok ? 'right' : 'wrong');
      grade(ok, { answer: ex.answer, note: ok && ex.audioOnly ? esc(ex.item.he) : '' });
    } else if (ex.type === 'type') {
      const val = norm(Y.$('#typein').value), ans = norm(ex.answer);
      const d = lev(val, ans);
      const ok = d === 0 || (ans.length > 4 && d === 1);
      Y.$('#typein').classList.add(ok ? 'right' : 'wrong'); Y.$('#typein').readOnly = true;
      grade(ok, { answer: ex.answer, note: ok && d === 1 ? 'כמעט מדויק. הכתיב הנכון: <em dir="ltr">' + esc(ex.answer) + '</em>' : '' });
    }
  };
  A['ex-skip'] = () => { if (!P) return; P.done++; stopRec(); Y.$('#lbody').classList.remove('locked'); next(); };

  /* speaking */
  let rec = null;
  const stopRec = () => { try { if (rec) rec.abort(); } catch (e) { /* ignore */ } rec = null; };
  A['mic'] = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const btn = Y.$('#micbtn'), hint = Y.$('#michint');
    if (!SR || P.checked) return;
    stopRec();
    try {
      rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 4;
      btn.classList.add('live'); hint.textContent = 'מקשיב...';
      rec.onresult = (e) => {
        btn.classList.remove('live');
        const want = tokens(norm(P.cur.answer));
        let best = 0, heard = '';
        for (let i = 0; i < e.results[0].length; i++) {
          const got = tokens(norm(e.results[0][i].transcript));
          const hit = want.filter((w) => got.indexOf(w) >= 0).length / want.length;
          if (hit >= best) { best = hit; heard = e.results[0][i].transcript; }
        }
        if (best >= 0.6) grade(true, { quiet: true, note: 'שמענו: <em dir="ltr">' + esc(heard) + '</em>' });
        else { hint.innerHTML = 'שמענו: <em dir="ltr">' + esc(heard) + '</em>. נסו שוב, לאט וברור'; Y.sfx('bad'); }
      };
      rec.onerror = () => { btn.classList.remove('live'); hint.textContent = 'לא הצלחנו לשמוע. אפשר לנסות שוב או לדלג'; };
      rec.onend = () => { btn.classList.remove('live'); };
      rec.start();
    } catch (e) { hint.textContent = 'המיקרופון לא זמין כרגע. אפשר לדלג'; }
  };

  A['lesson-quit'] = () => {
    Y.sheet('<div class="sheet-c">' + Y.mascot('sad', 96) + '<h3>לצאת מהשיעור?</h3><p>ההתקדמות בשיעור הזה לא תישמר.</p>' +
      '<button class="btn btn-primary btn-block" data-act="sheet-close">' + Y.g('נשאר ללמוד', 'נשארת ללמוד') + '</button>' +
      '<button class="btn btn-ghost btn-block" data-act="lesson-leave">יציאה</button></div>');
  };
  A['lesson-leave'] = () => { stopRec(); try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } P = null; Y.closeSheet(); Y.go(Y.lastTab || 'home'); };
  A['sheet-close'] = () => Y.closeSheet();

  /* out of hearts */
  Y.noHearts = (mid) => {
    Y.sheet('<div class="sheet-c">' + Y.mascot('sad', 96) + '<h3>נגמרו הלבבות</h3><p>לב חדש יתמלא בעוד ' + Y.nextHeartMin() + ' דקות. אפשר גם להמשיך כבר עכשיו:</p>' +
      '<button class="btn btn-gold btn-block" data-act="go-plus-from-sheet">👑 לבבות ללא הגבלה עם פלוס</button>' +
      '<button class="btn btn-primary btn-block" data-act="practice-heart">תרגול קצר ומקבלים לב</button>' +
      (Y.state.gems >= 30 ? '<button class="btn btn-ghost btn-block" data-act="refill">מילוי לבבות תמורת 30 💎</button>' : '') +
      '<button class="btn btn-ghost btn-block" data-act="' + (mid ? 'lesson-leave' : 'sheet-close') + '">' + (mid ? 'חזרה למסך הבית' : 'סגירה') + '</button></div>', { sticky: !!mid });
  };
  A['go-plus-from-sheet'] = () => { P = null; Y.closeSheet(); Y.go('plus'); };
  A['practice-heart'] = () => { P = null; Y.closeSheet(); Y.startLesson(Y.buildPractice('mix')); };
  A['refill'] = () => {
    Y.state.gems -= 30; Y.state.hearts = Y.CONFIG.MAX_HEARTS; Y.save(); Y.closeSheet(); Y.toast('הלבבות התמלאו');
    if (P) { const h = Y.$('.lh-hearts'); if (h) h.outerHTML = heartsHtml(); next(); } else Y.go('home');
  };

  /* ───────── finish ───────── */
  function finish() {
    const s = P.s, st = Y.state;
    const acc = P.graded ? Math.round((P.right / P.graded) * 100) : 100;
    const secs = Math.round((Date.now() - P.t0) / 1000);
    const perfect = P.mistakes === 0;
    let xp = s.mode === 'lesson' ? 10 : 5, gems = 0, first = false;
    if (perfect) xp += 5;
    if (s.mode === 'lesson') {
      const id = Y.lid(s.unit, s.li);
      first = !st.done[id];
      st.done[id] = { n: ((st.done[id] && st.done[id].n) || 0) + 1, acc: acc };
      if (first) gems = 5; else xp = Math.max(5, xp - 5);
      if (perfect) st.perfect++;
    } else if (!Y.isPlus()) Y.addHeart(1);
    st.gems += gems;
    Y.addXp(xp);
    const grew = Y.touchStreak();
    const achs = Y.checkAchs();
    Y.save();
    P = null;
    Y.sfx('win');
    const tipBox = s.tip ? '<div class="tip"><b>הטיפ של סאבי</b><p>' + esc(s.tip) + '</p></div>' : '';
    Y.$('#app').className = 'app app-done';
    Y.$('#app').innerHTML = '<div class="done">' +
      '<div class="done-top">' + Y.mascot('cheer', 150) + '<h1>' + (perfect ? 'שיעור מושלם!' : Y.g('סיימת, כל הכבוד!', 'סיימת, כל הכבוד!')) + '</h1>' +
      '<p class="done-sub">' + esc(s.title) + '</p></div>' +
      '<div class="done-stats"><div class="stat stat-gold"><small>נקודות</small><b dir="ltr">+' + xp + ' XP</b></div>' +
      '<div class="stat stat-ok"><small>דיוק</small><b>' + acc + '%</b></div>' +
      '<div class="stat stat-blue"><small>זמן</small><b>' + Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + '</b></div></div>' +
      (grew ? '<div class="streak-card"><span class="streak-fire">🔥</span><div><b>' + st.streak + (st.streak === 1 ? ' יום ברצף' : ' ימים ברצף') + '</b><span>' + (st.streak === 1 ? 'רצף חדש יצא לדרך. נתראה מחר?' : Y.g('אתה על זה. לא שוברים את הרצף!', 'את על זה. לא שוברים את הרצף!')) + '</span></div></div>' : '') +
      (gems ? '<p class="done-gems">קיבלת ' + gems + ' 💎' + (s.mode !== 'lesson' ? '' : '') + '</p>' : '') +
      (s.mode !== 'lesson' && !Y.isPlus() ? '<p class="done-gems">קיבלת לב אחד ❤️</p>' : '') +
      achs.map((a) => '<div class="ach-pop"><span>' + a.e + '</span><div><small>הישג חדש</small><b>' + a.t + '</b></div></div>').join('') +
      tipBox +
      '<div class="done-foot"><button class="btn btn-primary btn-block" data-act="done-home">המשך</button></div></div>';
    setTimeout(Y.confetti, 150);
  }
  A['done-home'] = () => Y.go(Y.lastTab === 'practice' ? 'practice' : 'home');
})();
