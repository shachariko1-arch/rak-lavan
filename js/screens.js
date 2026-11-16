/* Yalla English – onboarding and the five main tabs */
(function () {
  const Y = window.Y, esc = Y.esc, C = Y.CONFIG;
  const A = Y.actions = Y.actions || {};
  const S = Y.screens = {};
  const LOGO = 'assets/logo.jpg';

  /* ═════════ ONBOARDING ═════════ */
  const Q = [
    { key: 'who', mood: 'wave', say: 'נעים מאוד, אני סאבי! צבר ישראלי עם כובע בלש. מי לומד איתי?', opts: [
      ['soldier', '🎖️', 'חייל/ת משוחרר/ת', 'הטיול הגדול כבר מחכה'], ['kid', '🧒', 'ילד/ה', 'לומדים במשחק'],
      ['student', '🎓', 'תלמיד/ה או סטודנט/ית', 'בגרות, פסיכומטרי, תואר'], ['adult', '💼', 'מבוגר/ת', 'עבודה, נסיעות, חיים']] },
    { key: 'gender', mood: 'happy', say: 'כדי שאדבר נכון בעברית: איך לפנות אליך?', opts: [
      ['m', '🙋‍♂️', 'בלשון זכר', 'אתה מוכן?'], ['f', '🙋‍♀️', 'בלשון נקבה', 'את מוכנה?']] },
    { key: 'goal', mood: 'think', say: 'חקירה קצרה: בשביל מה האנגלית?', opts: [
      ['travel', '✈️', 'טיולים וחו"ל', 'להסתדר בכל מקום בעולם'], ['work', '💼', 'עבודה וקריירה', 'ראיונות, מיילים, ישיבות'],
      ['study', '🎓', 'לימודים ומבחנים', 'לבסס את האנגלית'], ['fun', '🎬', 'סדרות, משחקים ורשתות', 'להבין בלי כתוביות'],
      ['general', '💬', 'פשוט לדבר טוב יותר', 'ביטחון בשיחה']] },
    { key: 'level', mood: 'think', say: 'ומה הרמה היום? בלי בושה, כולם מתחילים איפשהו.', opts: [
      ['zero', '🌱', 'מתחילים מאפס', 'בקושי hello'], ['some', '🙂', 'יודעים קצת', 'מילים ומשפטים בסיסיים'],
      ['ok', '😎', 'מסתדרים', 'רוצים לדבר שוטף ובטוח']] },
    { key: 'daily', mood: 'happy', say: 'כמה זמן ביום נוח לך? גם חמש דקות עושות את העבודה.', opts: [
      [5, '☕', '5 דקות', 'קליל'], [10, '🚌', '10 דקות', 'רגיל'], [15, '💪', '15 דקות', 'רציני'], [20, '🚀', '20 דקות', 'אינטנסיבי']] }
  ];
  let O = { step: -1, data: {} };

  S.onboarding = () => {
    if (O.step === -1) {
      return '<div class="welcome"><div class="welcome-art"><img class="logo-xl" src="' + LOGO + '" alt="יאללה English" width="168" height="168">' +
        '<div class="welcome-sabi">' + Y.mascot('wave', 132) + '</div></div>' +
        '<h1>אנגלית בכיף.<br>בעברית. בקצב שלך.</h1>' +
        '<p>שיעורים קצרים, סימולציות של מצבים אמיתיים וסאבי אחד שלא נותן לוותר.</p>' +
        '<div class="welcome-cta"><button class="btn btn-gold btn-block btn-xl" data-act="ob-start">יאללה, מתחילים!</button>' +
        '<button class="btn btn-ghost-light btn-block" data-act="ob-login">כבר יש לי חשבון</button></div></div>';
    }
    if (O.step === Q.length) {
      return '<div class="ob"><div class="ob-plan">' + Y.mascot('think', 130) + '<h2>בונה לך מסלול אישי...</h2>' +
        '<ul class="plan-list"><li>בודק את הרמה</li><li>בוחר נושאים שמתאימים למטרה</li><li>מסדר שיעורים ליעד היומי</li></ul></div></div>';
    }
    if (O.step > Q.length) {
      const g = O.data.gender === 'f';
      return '<div class="ob"><div class="ob-head"><button class="icon-btn" data-act="ob-back" aria-label="חזרה">' + Y.ICON.back + '</button><div class="pbar"><i style="width:100%"></i></div></div>' +
        '<div class="ob-body">' + Y.bubble('cheer', O.login ? 'טוב לראות אותך שוב!' : 'המסלול שלך מוכן! נשאר רק לשמור את ההתקדמות.', 92) +
        '<label class="field"><span>איך קוראים לך?</span><input id="ob-name" type="text" maxlength="24" autocomplete="given-name" placeholder="השם שלך" value="' + esc(O.data.name || '') + '"></label>' +
        '<div id="gsi-slot"></div>' +
        '<button class="btn btn-google btn-block" data-act="ob-google"><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.500c3.500 0 6.600 1.200 9.100 3.600l6.800-6.800C35.800 2.400 30.300 0 24 0 14.600 0 6.500 5.400 2.600 13.200l7.900 6.100C12.400 13.600 17.700 9.500 24 9.500z"/><path fill="#4285F4" d="M46.500 24.500c0-1.600-.1-3.100-.4-4.500H24v9h12.700c-.6 3-2.300 5.500-4.800 7.200l7.700 6c4.500-4.200 6.900-10.300 6.900-17.700z"/><path fill="#FBBC05" d="M10.500 28.700c-.5-1.500-.8-3.100-.8-4.700s.3-3.200.8-4.700l-7.900-6.100C1 16.500 0 20.100 0 24s1 7.500 2.600 10.800l7.900-6.100z"/><path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.700-6c-2.200 1.500-4.900 2.300-8.200 2.300-6.300 0-11.600-4.200-13.500-9.900l-7.900 6.100C6.500 42.600 14.600 48 24 48z"/></svg>המשך עם Google</button>' +
        '<button class="btn btn-primary btn-block" data-act="ob-guest">' + (g ? 'ממשיכה בלי חשבון' : 'ממשיך בלי חשבון') + '</button>' +
        '<p class="fine">ההתקדמות נשמרת במכשיר הזה.</p></div></div>';
    }
    const q = Q[O.step];
    return '<div class="ob"><div class="ob-head"><button class="icon-btn" data-act="ob-back" aria-label="חזרה">' + Y.ICON.back + '</button>' +
      '<div class="pbar"><i style="width:' + Math.round(((O.step + 1) / (Q.length + 1)) * 100) + '%"></i></div></div>' +
      '<div class="ob-body">' + Y.bubble(q.mood, q.say, 92) + '<div class="ob-opts">' +
      q.opts.map((o) => '<button class="ob-opt' + (O.data[q.key] === o[0] ? ' sel' : '') + '" data-act="ob-pick" data-v="' + o[0] + '"><span class="ob-em">' + o[1] + '</span><span class="ob-t"><b>' + o[2] + '</b><small>' + o[3] + '</small></span></button>').join('') +
      '</div></div></div>';
  };
  const obRender = () => { Y.$('#app').innerHTML = S.onboarding(); if (O.step > Q.length) setupGoogle(); };
  A['ob-start'] = () => { O.step = 0; obRender(); };
  A['ob-login'] = () => { O.login = true; O.step = Q.length + 1; obRender(); };
  A['ob-back'] = () => { O.step = O.login ? -1 : (O.step > Q.length ? Q.length - 1 : O.step - 1); O.login = false; obRender(); };
  A['ob-pick'] = (el) => {
    const q = Q[O.step]; let v = el.dataset.v; if (q.key === 'daily') v = +v;
    O.data[q.key] = v; Y.sfx('tap');
    if (q.key === 'gender') Y.state.user.gender = v;
    el.classList.add('sel');
    setTimeout(() => {
      O.step++; obRender();
      if (O.step === Q.length) setTimeout(() => { O.step++; obRender(); }, 2300);
    }, 180);
  };
  const obFinish = (extra) => {
    const name = (Y.$('#ob-name') ? Y.$('#ob-name').value : '').trim() || (extra && extra.name) || '';
    if (!name) { Y.toast('רק שם קטן וממשיכים'); const i = Y.$('#ob-name'); if (i) i.focus(); return; }
    Object.assign(Y.state.user, O.data, extra || {}, { name: name });
    if (!Y.state.user.goal) Y.state.user.goal = 'general';
    Y.state.onboarded = true; Y.save();
    Y.go('home');
    Y.toast('ברוכים הבאים, ' + name + '!');
  };
  A['ob-guest'] = () => obFinish();
  A['ob-google'] = () => {
    if (C.GOOGLE_CLIENT_ID) { Y.toast('בחרו חשבון בחלון של Google'); try { google.accounts.id.prompt(); } catch (e) { Y.toast('Google לא זמין כרגע'); } return; }
    const i = Y.$('#ob-name');
    if (!i.value.trim()) { Y.toast('רק שם קטן וממשיכים'); i.focus(); return; }
    obFinish({ google: false });
    Y.toast('גרסת הדגמה: החיבור ל-Google יופעל בהמשך. נשמר במכשיר.');
  };
  function setupGoogle() {
    if (!C.GOOGLE_CLIENT_ID) return;
    const init = () => {
      try {
        google.accounts.id.initialize({ client_id: C.GOOGLE_CLIENT_ID, callback: (r) => {
          const p = JSON.parse(decodeURIComponent(escape(atob(r.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))));
          obFinish({ name: p.given_name || p.name, google: true, pic: p.picture || '' });
        } });
        const slot = Y.$('#gsi-slot');
        if (slot) { google.accounts.id.renderButton(slot, { theme: 'outline', size: 'large', shape: 'pill', width: 320, locale: 'he' }); const b = Y.$('[data-act="ob-google"]'); if (b) b.hidden = true; }
      } catch (e) { /* keep the fallback button */ }
    };
    if (window.google && google.accounts) return init();
    const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = init; document.head.appendChild(s);
  }

  /* ═════════ shared chrome ═════════ */
  const TABS = [['home', 'לימוד', 'home'], ['practice', 'תרגול', 'practice'], ['league', 'ליגה', 'league'], ['plus', 'פלוס', 'plus'], ['profile', 'פרופיל', 'profile']];
  const nav = (cur) => '<nav class="tabs" aria-label="ניווט ראשי">' + TABS.map((t) =>
    '<button class="tab' + (t[0] === cur ? ' on' : '') + '" data-act="tab" data-tab="' + t[0] + '"' + (t[0] === cur ? ' aria-current="page"' : '') + '>' + Y.ICON[t[2]] + '<span>' + t[1] + '</span></button>').join('') + '</nav>';
  const topbar = () => '<header class="topbar"><img class="logo-s" src="' + LOGO + '" alt="יאללה English" width="40" height="40">' +
    '<div class="chips"><button class="chip chip-fire" data-act="tab" data-tab="profile" aria-label="רצף ימים">🔥 <b>' + Y.liveStreak() + '</b></button>' +
    '<button class="chip chip-gem" data-act="gems-info" aria-label="יהלומים">💎 <b>' + Y.state.gems + '</b></button>' +
    '<button class="chip chip-heart" data-act="hearts-info" aria-label="לבבות">❤️ <b>' + (Y.isPlus() ? '∞' : Y.hearts()) + '</b></button></div></header>';
  const page = (cur, inner, cls) => topbar() + '<main class="page ' + (cls || '') + '" id="page">' + inner + '</main>' + nav(cur);
  A['tab'] = (el) => Y.go(el.dataset.tab);
  A['gems-info'] = () => Y.sheet('<div class="sheet-c"><div class="big-em">💎</div><h3>' + Y.state.gems + ' יהלומים</h3><p>מקבלים 5 יהלומים על כל שיעור חדש. ב-30 יהלומים אפשר למלא את כל הלבבות.</p><button class="btn btn-primary btn-block" data-act="sheet-close">הבנתי</button></div>');
  A['hearts-info'] = () => {
    if (Y.isPlus()) return Y.sheet('<div class="sheet-c"><div class="big-em">❤️</div><h3>לבבות ללא הגבלה</h3><p>עם יאללה פלוס טועים בלי לחשוב פעמיים.</p><button class="btn btn-primary btn-block" data-act="sheet-close">מעולה</button></div>');
    const h = Y.hearts();
    Y.sheet('<div class="sheet-c"><div class="hearts-row">' + '❤️'.repeat(h) + '<span class="dim">' + '🤍'.repeat(C.MAX_HEARTS - h) + '</span></div><h3>' + h + ' מתוך ' + C.MAX_HEARTS + ' לבבות</h3>' +
      '<p>כל טעות בשיעור עולה לב. ' + (h < C.MAX_HEARTS ? 'הלב הבא יתמלא בעוד ' + Y.nextHeartMin() + ' דקות.' : 'כרגע הכול מלא.') + '</p>' +
      '<button class="btn btn-gold btn-block" data-act="go-plus-from-sheet">👑 לבבות ללא הגבלה</button>' +
      (h < C.MAX_HEARTS ? '<button class="btn btn-primary btn-block" data-act="practice-heart">תרגול קצר ומקבלים לב</button>' : '') +
      '<button class="btn btn-ghost btn-block" data-act="sheet-close">סגירה</button></div>');
  };

  /* ═════════ HOME (the path) ═════════ */
  const greet = () => { const h = new Date().getHours(); return h < 5 ? 'לילה טוב' : h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : h < 21 ? 'ערב טוב' : 'לילה טוב'; };
  const ring = (pct, label) => { const r = 24, c = 2 * Math.PI * r; return '<svg class="ring" width="60" height="60" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="' + r + '" class="ring-bg"/><circle cx="30" cy="30" r="' + r + '" class="ring-fg" stroke-dasharray="' + c + '" stroke-dashoffset="' + (c * (1 - Math.min(1, pct))) + '" transform="rotate(-90 30 30)"/><text x="30" y="35" text-anchor="middle">' + label + '</text></svg>'; };

  S.home = () => {
    const st = Y.state, units = Y.unitOrder();
    const goal = Y.dailyGoalXp(), today = Y.todayXp();
    let current = null; // first open lesson = where the mascot stands
    units.forEach((u) => u.lessons.forEach((l, i) => { if (!current && Y.status(u, i) === 'open') current = Y.lid(u, i); }));
    const off = [0, 46, 0, -46];
    let lastTrack = '';
    const path = units.map((u) => {
      const doneN = u.lessons.filter((l, i) => st.done[Y.lid(u, i)]).length;
      let h = '';
      if (u.track !== lastTrack) { lastTrack = u.track; h += '<div class="track-label"><span>' + Y.TRACKS[u.track] + '</span></div>'; }
      h += '<section class="unit" style="--u:' + u.color[0] + ';--ud:' + u.color[1] + '">' +
        '<div class="unit-card"><div class="unit-txt"><h2>' + esc(u.title) + '</h2><p>' + esc(u.sub) + '</p>' +
        '<div class="unit-prog"><i style="width:' + (doneN / u.lessons.length) * 100 + '%"></i></div><small>' + doneN + ' מתוך ' + u.lessons.length + ' שיעורים</small></div><span class="unit-em">' + u.emoji + '</span></div>' +
        '<div class="nodes">' + u.lessons.map((l, i) => {
          const s = Y.status(u, i), id = Y.lid(u, i), cur = id === current;
          const inner = s === 'done' ? Y.ICON.check : s === 'locked' ? Y.ICON.lock : '<span class="node-em">' + l.e + '</span>';
          return '<div class="node-row" style="--x:' + off[i % 4] + 'px">' +
            (cur ? '<div class="node-sabi">' + Y.mascot('wave', 78) + '</div><div class="node-tip">' + (Y.doneCount() ? 'ממשיכים!' : 'מתחילים כאן') + '</div>' : '') +
            '<button class="node node-' + s + (cur ? ' node-cur' : '') + '" data-act="node" data-u="' + u.id + '" data-i="' + i + '" aria-label="' + esc(l.t) + '">' + inner +
            (s === 'plus' ? '<span class="node-badge">👑</span>' : '') + '</button><span class="node-name">' + esc(l.t) + '</span></div>';
        }).join('') + '</div></section>';
      return h;
    }).join('');
    return page('home',
      '<section class="hello"><div class="hello-txt"><p>' + greet() + ',</p><h1>' + esc(st.user.name || 'אורח') + '</h1>' +
      '<small>' + (today >= goal ? 'היעד היומי הושלם. כל שיעור נוסף הוא בונוס.' : 'עוד ' + Y.xpTxt(goal - today) + ' ליעד של היום') + '</small></div>' + ring(today / goal, today >= goal ? '✓' : today + '') + '</section>' +
      path + '<p class="path-end">עוד יחידות בדרך. סאבי כבר חוקר.</p>', 'page-home');
  };
  const findUnit = (id) => Y.COURSE.find((u) => u.id === id);
  A['node'] = (el) => {
    const u = findUnit(el.dataset.u), i = +el.dataset.i, l = u.lessons[i], s = Y.status(u, i);
    Y.sfx('tap');
    if (s === 'locked') { Y.toast('קודם מסיימים את השיעור שלפניו'); return; }
    if (s === 'plus') {
      return Y.sheet('<div class="sheet-c"><div class="big-em">👑</div><h3>' + esc(l.t) + '</h3><p>השיעור הזה פתוח למנויי יאללה פלוס, יחד עם כל ' + Y.totalLessons() + ' השיעורים ולבבות ללא הגבלה.</p>' +
        '<button class="btn btn-gold btn-block" data-act="go-plus-from-sheet">לפרטים על פלוס</button><button class="btn btn-ghost btn-block" data-act="sheet-close">לא עכשיו</button></div>');
    }
    const words = l.w.map(Y.parseW);
    Y.sheet('<div class="sheet-c sheet-lesson" style="--u:' + u.color[0] + ';--ud:' + u.color[1] + '"><div class="sl-em">' + l.e + '</div><p class="eyebrow">' + esc(u.title) + '</p><h3>' + esc(l.t) + '</h3>' +
      '<div class="sl-words" dir="ltr">' + words.map((w) => '<span>' + w.em + ' ' + esc(w.en) + '</span>').join('') + '</div>' +
      '<p class="sl-meta">' + (s === 'done' ? 'הושלם · חזרה נותנת ' + Y.xpTxt(5) : '6 מילים · סימולציית שיחה · ' + Y.xpTxt(10)) + '</p>' +
      '<button class="btn btn-unit btn-block btn-xl" data-act="start" data-u="' + u.id + '" data-i="' + i + '">' + (s === 'done' ? 'תרגול חוזר' : 'התחלת השיעור') + '</button></div>');
  };
  A['start'] = (el) => Y.startLesson(Y.buildLesson(findUnit(el.dataset.u), +el.dataset.i));

  /* ═════════ PRACTICE ═════════ */
  S.practice = () => {
    const st = Y.state, plus = Y.isPlus(), words = Object.keys(st.words);
    const card = (act, em, t, d, lock) => '<button class="pcard" data-act="' + (lock ? 'need-plus' : 'practice') + '" data-mode="' + act + '"><span class="pcard-em">' + em + '</span><span class="pcard-t"><b>' + t + '</b><small>' + d + '</small></span>' + (lock ? '<span class="pill pill-gold">פלוס</span>' : '<span class="pcard-go">' + Y.ICON.back + '</span>') + '</button>';
    const dict = words.length
      ? '<div class="dict">' + words.slice().reverse().slice(0, 60).map((en) => { const w = st.words[en]; return '<button class="dict-row" data-act="say" data-say="' + esc(en) + '"><span class="dict-em">' + (w.em || '•') + '</span><b dir="ltr">' + esc(en) + '</b><span class="dict-he">' + esc(w.he) + '</span><span class="dots" aria-label="חוזק ' + w.n + ' מתוך 5">' + [0, 1, 2, 3, 4].map((i) => '<i class="' + (i < w.n ? 'on' : '') + '"></i>').join('') + '</span></button>'; }).join('') + '</div>'
      : '<div class="empty">' + Y.mascot('think', 90) + '<p>המילים שתלמדו יחכו כאן, עם מד חוזק לכל מילה.</p></div>';
    return page('practice',
      '<h1 class="page-title">תרגול</h1><p class="page-sub">תרגול לא עולה לבבות, ובסופו מקבלים לב.</p>' +
      '<div class="pcards">' + card('mix', '⚡', 'תרגול מהיר', 'עשרה תרגילים מהחומר שלמדת') + card('match', '🧩', 'משחק זוגות', 'התאמת מילים על זמן') +
      card('mistakes', '🩹', 'חזרה על טעויות', st.mistakes.length ? st.mistakes.length + ' פריטים מחכים לתיקון' : 'אין טעויות פתוחות כרגע', !plus) +
      card('listen', '🎧', 'אימון הקשבה', 'מבינים אנגלית מדוברת', !plus) + '</div>' +
      '<h2 class="sec-title">המילון שלי <span>' + words.length + ' מילים</span></h2>' + dict);
  };
  A['practice'] = (el) => {
    const mode = el.dataset.mode;
    if (mode === 'mistakes' && !Y.state.mistakes.length) { Y.toast('אין טעויות לתקן. יפה!'); return; }
    if (mode === 'listen' && !Y.canSpeak()) { Y.toast('הדפדפן הזה לא תומך בהשמעת קול'); return; }
    Y.startLesson(Y.buildPractice(mode));
  };
  A['need-plus'] = () => Y.sheet('<div class="sheet-c"><div class="big-em">👑</div><h3>תרגול למנויי פלוס</h3><p>חזרה על טעויות ואימון הקשבה פתוחים למנויי יאללה פלוס.</p><button class="btn btn-gold btn-block" data-act="go-plus-from-sheet">לפרטים על פלוס</button><button class="btn btn-ghost btn-block" data-act="sheet-close">לא עכשיו</button></div>');

  /* ═════════ LEAGUE ═════════ */
  const BOTS = [['נועה', '🦊'], ['איתי', '🐼'], ['מאיה', '🦄'], ['יונתן', '🐯'], ['שירה', '🐬'], ['עומר', '🦉'], ['תמר', '🐨'], ['דניאל', '🦁'], ['ליאור', '🐙']];
  S.league = () => {
    const st = Y.state, wk = Y.weekKey(), now = new Date();
    const mine = st.week.key === wk ? st.week.xp : 0;
    const frac = (now.getDay() + now.getHours() / 24) / 7;
    let seed = wk.split('-').reduce((n, x) => n * 31 + +x, 7);
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const rows = BOTS.filter((b) => b[0] !== st.user.name).map((b) => ({ name: b[0], av: b[1], xp: Math.round((60 + rnd() * 380) * frac) }));
    rows.push({ name: st.user.name || 'אני', av: '🌵', xp: mine, me: true });
    rows.sort((a, b) => b.xp - a.xp);
    const rank = rows.findIndex((r) => r.me) + 1;
    const tier = st.xp >= 1500 ? ['ליגת הזהב', '🥇'] : st.xp >= 500 ? ['ליגת הכסף', '🥈'] : ['ליגת הברונזה', '🥉'];
    const left = 7 - now.getDay();
    return page('league',
      '<section class="league-hero"><div class="league-cup">' + tier[1] + '</div><h1>' + tier[0] + '</h1><p>שלושת הראשונים עולים ליגה. נשארו ' + left + (left === 1 ? ' יום' : ' ימים') + ' עד סוף השבוע.</p>' +
      '<div class="league-me">המקום שלך: <b>' + rank + '</b> · ' + Y.xpTxt(mine) + ' השבוע</div></section>' +
      '<ol class="board">' + rows.map((r, i) => '<li class="' + (r.me ? 'me ' : '') + (i < 3 ? 'top' : '') + '"><span class="rank">' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</span><span class="av">' + r.av + '</span><b>' + esc(r.name) + (r.me ? ' (אני)' : '') + '</b><span class="xp" dir="ltr">' + r.xp + ' XP</span></li>' + (i === 2 ? '<li class="cut"><span>אזור העלייה</span></li>' : '')).join('') + '</ol>' +
      '<p class="fine">בגרסה הזו המתחרים בליגה מדומים. ליגות אמיתיות דורשות חיבור לשרת.</p>');
  };

  /* ═════════ PLUS ═════════ */
  S.plus = () => {
    const st = Y.state, price = C.PRICE_ILS, trial = C.TRIAL_DAYS;
    const perks = [['📚', 'כל ' + Y.totalLessons() + ' השיעורים פתוחים', 'כל המסלולים: טיולים, עבודה, יומיום וילדים'], ['❤️', 'לבבות ללא הגבלה', 'טועים, לומדים וממשיכים בלי לחכות'], ['🩹', 'חזרה חכמה על טעויות', 'התרגול מתמקד בדיוק במה שקשה'], ['🎧', 'אימון הקשבה', 'מבינים אנגלית מדוברת בקצב אמיתי'], ['🆕', 'שיעורים חדשים כל חודש', 'התוכן ממשיך לגדול']];
    if (Y.isPlus()) {
      return page('plus', '<section class="plus-hero is-on">' + Y.mascot('cheer', 120) + '<h1>יאללה פלוס פעיל</h1><p>כל התוכן פתוח והלבבות ללא הגבלה. תהנו!</p></section>' +
        '<ul class="perks">' + perks.map((p) => '<li><span>' + p[0] + '</span><div><b>' + p[1] + '</b><small>' + p[2] + '</small></div></li>').join('') + '</ul>' +
        '<div class="card-plain"><b>המנוי שלך</b><p>' + price + ' ₪ לחודש · פעיל מאז ' + esc(st.plus.since.split('-').reverse().join('.')) + '</p><button class="btn btn-ghost btn-block" data-act="plus-cancel">ביטול המנוי</button></div>', 'page-plus');
    }
    return page('plus',
      '<section class="plus-hero"><span class="pill pill-gold">יאללה פלוס</span>' + Y.mascot('cheer', 120) + '<h1>כל האנגלית. בלי עצירות.</h1><p>מנוי אחד שפותח את כל השיעורים והתרגולים.</p></section>' +
      '<ul class="perks">' + perks.map((p) => '<li><span>' + p[0] + '</span><div><b>' + p[1] + '</b><small>' + p[2] + '</small></div></li>').join('') + '</ul>' +
      '<div class="price-card"><div class="price"><b>' + price + '</b><span>₪<small>לחודש</small></span></div>' +
      '<p>' + (trial ? trial + ' ימי ניסיון חינם · ' : '') + 'ביטול בכל רגע</p>' +
      '<button class="btn btn-gold btn-block btn-xl" data-act="plus-buy">' + (trial ? Y.g('מתחיל ' + trial + ' ימים בחינם', 'מתחילה ' + trial + ' ימים בחינם') : 'הצטרפות לפלוס') + '</button>' +
      '<small class="fine">פחות משני שקלים ליום. פחות מקפה בתחנת דלק.</small></div>' +
      '<table class="cmp"><thead><tr><th></th><th>חינם</th><th>פלוס</th></tr></thead><tbody>' +
      [['יחידות הבסיס ושיעור טעימה מכל יחידה', 1, 1], ['כל ' + Y.totalLessons() + ' השיעורים', 0, 1], ['לבבות ללא הגבלה', 0, 1], ['חזרה על טעויות ואימון הקשבה', 0, 1], ['מילון אישי וליגה שבועית', 1, 1]].map((r) => '<tr><td>' + r[0] + '</td><td>' + (r[1] ? '✓' : '–') + '</td><td class="yes">' + (r[2] ? '✓' : '–') + '</td></tr>').join('') + '</tbody></table>', 'page-plus');
  };
  A['plus-buy'] = () => {
    if (C.PAYMENT_URL) { window.open(C.PAYMENT_URL, '_blank', 'noopener'); return; }
    Y.state.plus = { active: true, since: Y.dayKey() }; Y.save();
    Y.go('plus'); Y.confetti(); Y.sfx('win');
    Y.toast('גרסת הדגמה: פלוס הופעל במכשיר הזה ללא חיוב.');
  };
  A['plus-cancel'] = () => Y.sheet('<div class="sheet-c">' + Y.mascot('sad', 96) + '<h3>לבטל את פלוס?</h3><p>השיעורים הנעולים ייסגרו והלבבות יחזרו להיות מוגבלים.</p><button class="btn btn-primary btn-block" data-act="sheet-close">נשארים בפלוס</button><button class="btn btn-ghost btn-block" data-act="plus-cancel-yes">ביטול המנוי</button></div>');
  A['plus-cancel-yes'] = () => { Y.state.plus = { active: false, since: '' }; Y.save(); Y.closeSheet(); Y.go('plus'); Y.toast('המנוי בוטל'); };

  /* ═════════ PROFILE ═════════ */
  const WHO = { soldier: 'אחרי צבא', kid: 'לומדים במשחק', student: 'לימודים', adult: 'לומדים בכל גיל' };
  S.profile = () => {
    const st = Y.state, u = st.user;
    const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'], now = new Date();
    const week = [0, 1, 2, 3, 4, 5, 6].map((i) => { const d = Y.addDays(now, i - now.getDay()); return { l: days[i], xp: st.days[Y.dayKey(d)] || 0, today: i === now.getDay(), future: i > now.getDay() }; });
    const max = Math.max(Y.dailyGoalXp(), Math.max.apply(null, week.map((w) => w.xp)));
    const avatar = u.pic ? '<img class="avatar" src="' + esc(u.pic) + '" alt="" referrerpolicy="no-referrer">' : '<div class="avatar">' + esc((u.name || '?').charAt(0)) + '</div>';
    return page('profile',
      '<section class="me">' + avatar + '<div><h1>' + esc(u.name || 'אורח') + (Y.isPlus() ? ' <span class="pill pill-gold">פלוס</span>' : '') + '</h1><p>' + (WHO[u.who] || 'לומדים אנגלית') + ' · מאז ' + esc(u.joined.split('-').reverse().join('.')) + '</p></div>' +
      '<button class="icon-btn" data-act="settings" aria-label="הגדרות">' + Y.ICON.gear + '</button></section>' +
      '<div class="stats"><div class="stat"><b>🔥 ' + Y.liveStreak() + '</b><small>ימים ברצף</small></div><div class="stat"><b>⚡ ' + st.xp + '</b><small>סך הכול XP</small></div>' +
      '<div class="stat"><b>📘 ' + Y.doneCount() + '<i>/' + Y.totalLessons() + '</i></b><small>שיעורים</small></div><div class="stat"><b>🧠 ' + Object.keys(st.words).length + '</b><small>מילים</small></div></div>' +
      '<h2 class="sec-title">השבוע שלי <span>יעד יומי: ' + Y.xpTxt(Y.dailyGoalXp()) + '</span></h2>' +
      '<div class="weekbars">' + week.map((w) => '<div class="wb' + (w.today ? ' today' : '') + '"><span class="wb-v">' + (w.xp || '') + '</span><div class="wb-bar"><i style="height:' + Math.round((w.xp / max) * 100) + '%"></i></div><small>' + w.l + '</small></div>').join('') + '</div>' +
      '<h2 class="sec-title">הישגים <span>' + Object.keys(st.ach).length + ' מתוך ' + Y.ACHS.length + '</span></h2>' +
      '<div class="achs">' + Y.ACHS.map((a) => '<div class="ach' + (st.ach[a.id] ? ' on' : '') + '"><span>' + a.e + '</span><b>' + a.t + '</b><small>' + a.d + '</small></div>').join('') + '</div>');
  };
  const seg = (name, cur, opts) => '<div class="seg" role="radiogroup">' + opts.map((o) => '<button role="radio" aria-checked="' + (String(cur) === String(o[0])) + '" class="' + (String(cur) === String(o[0]) ? 'on' : '') + '" data-act="set" data-k="' + name + '" data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div>';
  const settingsHtml = () => {
    const s = Y.state.settings, u = Y.state.user;
    return '<div class="sheet-c sheet-settings"><h3>הגדרות</h3>' +
      '<div class="set-row"><span>צלילים</span>' + seg('sound', s.sound, [[true, 'פועל'], [false, 'כבוי']]) + '</div>' +
      '<div class="set-row"><span>הקראה באנגלית</span>' + seg('tts', s.tts, [[true, 'פועל'], [false, 'כבוי']]) + '</div>' +
      '<div class="set-row"><span>מהירות דיבור</span>' + seg('rate', s.rate, [[0.8, 'איטי'], [1, 'רגיל'], [1.15, 'מהיר']]) + '</div>' +
      '<div class="set-row"><span>מראה</span>' + seg('theme', s.theme, [['auto', 'אוטומטי'], ['light', 'בהיר'], ['dark', 'כהה']]) + '</div>' +
      '<div class="set-row"><span>יעד יומי</span>' + seg('daily', u.daily, [[5, '5 דק׳'], [10, '10'], [15, '15'], [20, '20']]) + '</div>' +
      '<div class="set-row"><span>פנייה</span>' + seg('gender', u.gender, [['m', 'זכר'], ['f', 'נקבה']]) + '</div>' +
      '<button class="btn btn-primary btn-block" data-act="settings-done">סיום</button>' +
      '<button class="btn btn-ghost btn-block danger" data-act="reset-ask">איפוס התקדמות ויציאה</button></div>';
  };
  A['settings'] = () => Y.sheet(settingsHtml(), { nofocus: true });
  A['set'] = (el) => {
    const k = el.dataset.k; let v = el.dataset.v;
    if (v === 'true') v = true; else if (v === 'false') v = false; else if (!isNaN(+v)) v = +v;
    if (k === 'daily' || k === 'gender') Y.state.user[k] = v; else Y.state.settings[k] = v;
    Y.save(); Y.applyTheme();
    Y.$('#sheet .sheet').innerHTML = settingsHtml();
    if (k === 'rate' || k === 'tts') Y.speak('Yalla, let\'s go!');
  };
  A['settings-done'] = () => { Y.closeSheet(); Y.go('profile'); };
  A['reset-ask'] = () => Y.sheet('<div class="sheet-c">' + Y.mascot('sad', 96) + '<h3>למחוק את כל ההתקדמות?</h3><p>הרצף, הנקודות והמילון יימחקו מהמכשיר. אי אפשר לשחזר.</p><button class="btn btn-primary btn-block" data-act="sheet-close">ביטול</button><button class="btn btn-ghost btn-block danger" data-act="reset-yes">מחיקה ויציאה</button></div>');
  A['reset-yes'] = () => { Y.reset(); Y.closeSheet(); O = { step: -1, data: {} }; Y.applyTheme(); Y.go('onboarding'); };

  /* ═════════ router ═════════ */
  Y.go = (name) => {
    if (name !== 'onboarding') Y.lastTab = name;
    const app = Y.$('#app');
    Y.$$('.confetti').forEach((c) => c.remove());
    app.innerHTML = S[name]();
    app.className = 'app app-' + name;
    const p = Y.$('#page'); if (p) p.scrollTop = 0;
    if (name === 'home') { const cur = Y.$('.node-cur'); if (cur && Y.doneCount()) cur.scrollIntoView({ block: 'center' }); }
  };
})();
