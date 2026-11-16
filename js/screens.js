/* Yalla English – onboarding and the main tabs */
(function () {
  const Y = window.Y, esc = Y.esc, C = Y.CONFIG;
  const A = Y.actions = Y.actions || {};
  const S = Y.screens = {};
  const go = (label) => label + Y.ICON.arrow;

  /* ═════════ ONBOARDING ═════════ */
  const Q = [
    { key: 'who', mood: 'wave', say: 'מי לומד איתי?', opts: [
      ['soldier', '🎖️', 'חייל/ת משוחרר/ת', 'הטיול הגדול כבר מחכה'], ['kid', '🧒', 'ילד/ה', 'לומדים במשחק'],
      ['student', '🎓', 'תלמיד/ה או סטודנט/ית', 'בגרות, פסיכומטרי, תואר'], ['adult', '💼', 'מבוגר/ת', 'עבודה, נסיעות, חיים']] },
    { key: 'gender', mood: 'happy', say: 'איך לפנות אליך?', opts: [
      ['m', '🙋‍♂️', 'בלשון זכר', 'אתה מוכן?'], ['f', '🙋‍♀️', 'בלשון נקבה', 'את מוכנה?']] },
    { key: 'goal', mood: 'think', say: 'בשביל מה האנגלית?', opts: [
      ['travel', '✈️', 'טיולים בחו"ל', 'להסתדר בכל מקום בעולם'], ['work', '💼', 'עבודה', 'ראיונות, מיילים, ישיבות'],
      ['study', '🎓', 'לימודים', 'לבסס את האנגלית'], ['general', '💬', 'לדבר בביטחון', 'בלי לחפש מילים'],
      ['fun', '🎬', 'סרטים ויוטיוב', 'להבין בלי כתוביות']] },
    { key: 'level', mood: 'think', say: 'מה רמת האנגלית שלך?', opts: [
      ['zero', 1, 'מתחיל מאפס', 'אני לא יודע כמעט כלום'], ['some', 2, 'יודע קצת', 'יש לי בסיס, רוצה להשתפר'],
      ['ok', 3, 'מבין אבל קשה לי לדבר', 'אני מבין, אבל מתבייש לדבר'], ['good', '👑', 'די טוב', 'אני רוצה לשפר את השטף'],
      ['pro', '🏆', 'רוצה להשתפר ממש', 'להגיע לרמה גבוהה']] },
    { key: 'daily', mood: 'happy', say: 'כמה זמן ביום נוח לך?', opts: [
      [5, '☕', '5 דקות', 'קליל'], [10, '🚌', '10 דקות', 'רגיל'], [15, '💪', '15 דקות', 'רציני'], [20, '🚀', '20 דקות', 'אינטנסיבי']] }
  ];
  const bars = (n) => '<svg class="bars" viewBox="0 0 30 26" width="30" height="26" aria-hidden="true">' + [0, 1, 2].map((i) => '<rect x="' + (2 + i * 10) + '" y="' + (16 - i * 7) + '" width="7" height="' + (9 + i * 7) + '" rx="2" fill="' + (i < n ? '#3C9BFF' : 'rgba(140,165,255,.3)') + '"/>').join('') + '</svg>';
  // a three-question level check shown after the self-rating (skipped for complete beginners)
  const QUIZ = [
    { q: 'איך אומרים "תודה" באנגלית?', o: ['Please', 'Thank you', 'Sorry'], a: 1 },
    { q: 'השלימו: I ___ from Israel.', o: ['am', 'is', 'are'], a: 0, ltr: true },
    { q: 'השלימו: Yesterday I ___ to the beach.', o: ['go', 'gone', 'went'], a: 2, ltr: true }
  ];
  const RESULT = [['נתחיל מהבסיס, ונתקדם מהר', 'think', 'אין מה להתבייש. כל אחד מתחיל איפשהו, ואני איתך.'], ['יש לך בסיס!', 'happy', 'סבבה, נחזק את מה שיש ונוסיף ביטחון בדיבור.'], ['אחלה רמה!', 'happy', 'יש על מה לבנות. נתמקד בשיחה ובמשפטים.'], ['וואלה, תותח!', 'cheer', 'שלוש מתוך שלוש. נרוץ ישר לשיחות אמיתיות.']];
  let O = { step: -1, data: {} };
  const obHead = (pct) => '<div class="ob-head"><button class="icon-btn" data-act="ob-back" aria-label="חזרה">' + Y.ICON.back + '</button><div class="pbar"><i style="width:' + pct + '%"></i></div></div>';

  S.onboarding = () => {
    if (O.quiz) {
      const z = O.quiz;
      if (z.i >= QUIZ.length) {
        const r = RESULT[z.score];
        return '<div class="ob">' + obHead(70) + '<div class="ob-body quiz-res">' + Y.mascot(r[1], 170) + '<h2>' + r[0] + '</h2><p class="auth-sub">' + r[2] + '</p>' +
          '<div class="quiz-score">' + QUIZ.map((x, i) => '<i class="' + (z.hits[i] ? 'on' : '') + '">' + (z.hits[i] ? '✓' : '✕') + '</i>').join('') + '</div></div>' +
          '<div class="ob-foot"><button class="btn btn-gold btn-block btn-xl" data-act="quiz-done">' + go('המשך') + '</button></div></div>';
      }
      const q = QUIZ[z.i];
      return '<div class="ob">' + obHead(60 + z.i * 4) + '<div class="ob-body"><p class="eyebrow">בדיקת רמה קצרה · שאלה ' + (z.i + 1) + ' מתוך ' + QUIZ.length + '</p>' +
        '<div class="ob-title">' + Y.mascot('think', 84) + '<h2 dir="auto">' + esc(q.q) + '</h2></div><div class="opts opts-list">' +
        q.o.map((o, i) => '<button class="opt" data-act="quiz-pick" data-i="' + i + '"><span class="opt-lbl" dir="ltr">' + o + '</span></button>').join('') + '</div></div></div>';
    }
    if (O.step === -1) {
      return '<div class="welcome"><span class="welcome-plane" aria-hidden="true">✈️</span>' +
        '<div class="welcome-top">' + Y.wordmark() + '<h1>אנגלית לישראלים,<br>לחיים האמיתיים.</h1></div>' +
        '<div class="welcome-art">' + Y.art('hero', 'hero-img', 'סאבי על הטיילת בתל אביב') + '</div>' +
        '<ul class="welcome-points"><li>🇮🇱 בעברית, בגובה העיניים</li><li>🤖 שיחות עם AI</li><li>⏱️ 5 דקות ביום</li></ul>' +
        '<div class="welcome-cta"><button class="btn btn-gold btn-block btn-xl" data-act="ob-start">' + go('בואו נתחיל') + '</button>' +
        '<button class="btn btn-glass btn-block" data-act="ob-login">כבר יש לי חשבון</button></div></div>';
    }
    if (O.step === Q.length) {
      return '<div class="ob"><div class="ob-plan">' + Y.mascot('think', 150) + '<h2>שנייה, בונה לך מסלול אישי...</h2>' +
        '<ul class="plan-list"><li>בודק את הרמה</li><li>בוחר נושאים שמתאימים למטרה</li><li>מסדר שיעורים ליעד היומי</li></ul></div></div>';
    }
    if (O.step > Q.length) {
      const login = !!O.login, g = O.data.gender === 'f';
      const pw = '<label class="field"><span>סיסמה</span><span class="pw-wrap"><input id="ob-pass" type="password" dir="ltr" minlength="6" maxlength="64" autocomplete="' + (login ? 'current-password' : 'new-password') + '" placeholder="לפחות 6 תווים"><button type="button" class="pw-eye" data-act="pw-toggle" aria-label="הצגת הסיסמה">👁️</button></span></label>';
      return '<div class="ob">' + obHead(100) +
        '<form class="ob-body auth" id="auth-form" novalidate><div class="ob-title">' + Y.mascot(login ? 'wave' : 'cheer', 92) + '<h2>' + (login ? 'טוב לראות אותך שוב!' : 'המסלול שלך מוכן!') + '</h2></div>' +
        '<p class="auth-sub">' + (login ? 'התחברות לחשבון שלך' : 'יוצרים חשבון ושומרים את ההתקדמות') + '</p>' +
        (login ? '' : '<label class="field"><span>שם פרטי</span><input id="ob-name" type="text" maxlength="24" autocomplete="given-name" placeholder="איך קוראים לך?" value="' + esc(O.data.name || '') + '"></label>') +
        '<label class="field"><span>אימייל</span><input id="ob-email" type="email" dir="ltr" maxlength="80" autocomplete="email" placeholder="name@example.com"></label>' + pw +
        (login ? '' : '<label class="check"><input id="ob-terms" type="checkbox"><span>קראתי ואני ' + (g ? 'מסכימה' : 'מסכים') + ' לתנאי השימוש ולמדיניות הפרטיות</span></label>') +
        '<p class="auth-err" id="auth-err" role="alert" hidden></p>' +
        '<button class="btn btn-gold btn-block btn-xl">' + go(login ? 'התחברות' : 'יצירת חשבון') + '</button>' +
        '<div class="or"><span>או</span></div><div id="gsi-slot"></div>' +
        '<button class="btn btn-google btn-block" type="button" data-act="ob-google"><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" style="stroke:none"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.800 2.400 30.300 0 24 0 14.600 0 6.500 5.400 2.600 13.200l7.900 6.100C12.400 13.600 17.700 9.500 24 9.500z"/><path fill="#4285F4" d="M46.500 24.500c0-1.600-.1-3.100-.4-4.500H24v9h12.700c-.6 3-2.300 5.500-4.800 7.200l7.700 6c4.500-4.200 6.900-10.300 6.900-17.700z"/><path fill="#FBBC05" d="M10.500 28.700c-.5-1.500-.8-3.100-.8-4.700s.3-3.200.8-4.700l-7.900-6.100C1 16.500 0 20.100 0 24s1 7.500 2.600 10.800l7.900-6.100z"/><path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.700-6c-2.200 1.500-4.900 2.300-8.200 2.300-6.300 0-11.600-4.200-13.500-9.900l-7.900 6.100C6.500 42.600 14.600 48 24 48z"/></svg>המשך עם Google</button>' +
        (login ? '<button type="button" class="link-btn" data-act="ob-to-signup">אין לי חשבון עדיין</button>' : '<button type="button" class="link-btn" data-act="ob-guest">להמשיך בלי חשבון</button>') +
        '<p class="fine">בגרסה הזו החשבון וההתקדמות נשמרים במכשיר הזה בלבד.</p></form></div>';
    }
    const q = Q[O.step], has = O.data[q.key] != null;
    return '<div class="ob">' + obHead(Math.round(((O.step + 1) / (Q.length + 1)) * 100)) +
      '<div class="ob-body"><div class="ob-title">' + Y.mascot(q.mood, 84) + '<h2>' + q.say + '</h2></div><div class="ob-opts">' +
      q.opts.map((o) => '<button class="ob-opt' + (O.data[q.key] === o[0] ? ' sel' : '') + '" data-act="ob-pick" data-v="' + o[0] + '"><span class="ob-em">' + (typeof o[1] === 'number' && q.key === 'level' ? bars(o[1]) : o[1]) + '</span><span class="ob-t"><b>' + o[2] + '</b><small>' + o[3] + '</small></span></button>').join('') +
      '</div></div><div class="ob-foot"><button class="btn btn-gold btn-block btn-xl" id="ob-next" data-act="ob-next"' + (has ? '' : ' disabled') + '>' + go('המשך') + '</button></div></div>';
  };
  const obRender = () => { const app = Y.$('#app'); app.innerHTML = S.onboarding(); app.style.animation = 'none'; void app.offsetWidth; app.style.animation = ''; if (O.step > Q.length) { setupGoogle(); const f = Y.$('#auth-form'); if (f) f.addEventListener('submit', (e) => { e.preventDefault(); authSubmit(); }); } };
  A['ob-start'] = () => { O.step = 0; Y.sfx('whoosh'); obRender(); };
  A['ob-login'] = () => { O.login = true; O.step = Q.length + 1; Y.sfx('whoosh'); obRender(); };
  A['ob-back'] = () => { if (O.quiz) { O.quiz = null; Y.sfx('tap'); return obRender(); } O.step = O.login ? -1 : (O.step > Q.length ? Q.length - 1 : O.step - 1); O.login = false; Y.sfx('tap'); obRender(); };
  A['ob-pick'] = (el) => {
    const q = Q[O.step]; let v = el.dataset.v; if (q.key === 'daily') v = +v;
    O.data[q.key] = v; Y.sfx('select');
    if (q.key === 'gender') Y.state.user.gender = v;
    Y.$$('.ob-opt').forEach((o) => o.classList.remove('sel'));
    el.classList.add('sel');
    Y.$('#ob-next').disabled = false;
  };
  A['quiz-pick'] = (el) => {
    const z = O.quiz, q = QUIZ[z.i], i = +el.dataset.i, ok = i === q.a;
    if (z.lock) return; z.lock = true;
    z.hits[z.i] = ok; if (ok) z.score++;
    Y.sfx(ok ? 'ok' : 'bad'); el.classList.add(ok ? 'right' : 'wrong');
    if (!ok) Y.$$('.opt')[q.a].classList.add('right');
    setTimeout(() => { z.i++; z.lock = false; if (z.i >= QUIZ.length) Y.sfx('unlock'); obRender(); }, 850);
  };
  A['quiz-done'] = () => { O.data.placement = O.quiz.score; O.quiz = null; O.quizDone = true; Y.sfx('whoosh'); O.step++; obRender(); if (O.step === Q.length) planThenAuth(); };
  const planThenAuth = () => setTimeout(() => { if (O.step === Q.length) { O.step++; Y.sfx('unlock'); obRender(); } }, 2300);
  A['ob-next'] = () => {
    if (Q[O.step].key === 'level' && O.data.level !== 'zero' && !O.quizDone) { O.quiz = { i: 0, score: 0, hits: [] }; Y.sfx('whoosh'); return obRender(); }
    Y.sfx('whoosh'); O.step++; obRender();
    if (O.step === Q.length) planThenAuth();
  };
  const obFinish = (extra) => {
    const name = (Y.$('#ob-name') ? Y.$('#ob-name').value : '').trim() || (extra && extra.name) || '';
    if (!name) { Y.toast('רק שם קטן וממשיכים'); const i = Y.$('#ob-name'); if (i) i.focus(); return false; }
    Y.state.session = true;
    Object.assign(Y.state.user, O.data, extra || {}, { name: name });
    if (!Y.state.user.goal) Y.state.user.goal = 'general';
    Y.state.onboarded = true; Y.save();
    Y.sfx('win'); Y.go('home'); Y.confetti();
    return true;
  };
  /* accounts live on this device: the password is stored only as a salted SHA-256 hash */
  const hashPw = (salt, pw) => {
    const txt = salt + ':' + pw;
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt)).then((b) => Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, '0')).join(''));
    }
    let h = 5381; for (let i = 0; i < txt.length; i++) h = ((h << 5) + h + txt.charCodeAt(i)) | 0;
    return Promise.resolve('w' + h);
  };
  const authErr = (msg, id) => { const e = Y.$('#auth-err'); e.textContent = msg; e.hidden = false; Y.sfx('bad'); const i = id && Y.$(id); if (i) i.focus(); };
  function authSubmit() {
    const login = !!O.login, email = Y.$('#ob-email').value.trim().toLowerCase(), pass = Y.$('#ob-pass').value;
    if (!login && !Y.$('#ob-name').value.trim()) return authErr('חסר שם פרטי', '#ob-name');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return authErr('כתובת האימייל לא נראית תקינה', '#ob-email');
    if (pass.length < 6) return authErr('הסיסמה צריכה לפחות 6 תווים', '#ob-pass');
    if (!login && !Y.$('#ob-terms').checked) return authErr('צריך לאשר את תנאי השימוש כדי להמשיך');
    const acc = Y.state.account;
    if (login) {
      if (!acc || acc.email !== email) return authErr('לא מצאנו במכשיר הזה חשבון עם האימייל הזה', '#ob-email');
      return hashPw(acc.salt, pass).then((h) => {
        if (h !== acc.hash) return authErr('הסיסמה לא נכונה', '#ob-pass');
        Y.state.session = true; Y.save(); Y.sfx('win'); Y.go('home'); Y.toast('ברוך שובך, ' + (Y.state.user.name || '') + '!');
      });
    }
    const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
    hashPw(salt, pass).then((h) => { Y.state.account = { email: email, salt: salt, hash: h }; Y.state.session = true; obFinish(); });
  }
  A['pw-toggle'] = (el) => { const i = Y.$('#ob-pass'); i.type = i.type === 'password' ? 'text' : 'password'; el.textContent = i.type === 'password' ? '👁️' : '🙈'; };
  A['ob-to-signup'] = () => { O.login = false; O.step = Y.state.onboarded ? Q.length + 1 : 0; Y.sfx('whoosh'); obRender(); };
  A['ob-guest'] = () => { const n = Y.$('#ob-name'); if (n && !n.value.trim()) return authErr('רק שם פרטי וממשיכים', '#ob-name'); Y.state.session = true; obFinish(); };
  A['ob-google'] = () => {
    if (C.GOOGLE_CLIENT_ID) { Y.toast('בחרו חשבון בחלון של Google'); try { google.accounts.id.prompt(); } catch (e) { Y.toast('Google לא זמין כרגע'); } return; }
    Y.toast('ההתחברות עם Google עדיין לא מחוברת. אפשר להירשם עם אימייל.');
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

  /* ═════════ SPLASH ═════════ */
  S.splash = () => '<div class="splash"><div class="splash-logo"><span class="splash-ring"></span><span class="splash-ring r2"></span><img src="assets/logo.jpg" alt="יאללה English" width="150" height="150"></div>' +
    '<div class="splash-sabi">' + Y.mascot('wave', 96) + '</div><p class="splash-tag">אנגלית בכיף. בעברית.</p><div class="splash-bar"><i></i></div></div>';
  Y.boot = () => {
    Y.go('splash');
    setTimeout(() => {
      const st = Y.state;
      if (st.onboarded && st.session !== false) return Y.go('home');
      if (st.onboarded) { O = { step: Q.length + 1, data: {}, login: true }; Y.go('onboarding'); if (O.step > Q.length) { setupGoogle(); const f = Y.$('#auth-form'); if (f) f.addEventListener('submit', (e) => { e.preventDefault(); authSubmit(); }); } return; }
      Y.go('onboarding');
    }, 2100);
  };

  /* ═════════ shared chrome ═════════ */
  const TABS = [['home', 'בית', 'home'], ['path', 'מסלול', 'path'], ['practice', 'חזרה', 'review'], ['profile', 'פרופיל', 'profile']];
  const TAB_OF = { league: 'home', plus: 'profile', ai: 'home' };
  const nav = (cur) => '<nav class="tabs" aria-label="ניווט ראשי">' + TABS.map((t) =>
    '<button class="tab' + (t[0] === cur ? ' on' : '') + '" data-act="tab" data-tab="' + t[0] + '"' + (t[0] === cur ? ' aria-current="page"' : '') + '>' + Y.ICON[t[2]] + '<span>' + t[1] + '</span></button>').join('') + '</nav>';
  const page = (cur, inner, cls) => '<main class="page ' + (cls || '') + '" id="page">' + inner + '</main>' + nav(TAB_OF[cur] || cur);
  const backRow = (to) => '<div class="back-row"><button class="icon-btn" data-act="tab" data-tab="' + to + '" aria-label="חזרה">' + Y.ICON.back + '</button></div>';
  const avatar = (xl) => { const u = Y.state.user; return u.pic ? '<img class="avatar' + (xl ? ' avatar-xl' : '') + '" src="' + esc(u.pic) + '" alt="" referrerpolicy="no-referrer">' : '<div class="avatar' + (xl ? ' avatar-xl' : '') + '">' + esc((u.name || '?').charAt(0)) + '</div>'; };
  A['tab'] = (el) => { Y.sfx('tap'); Y.go(el.dataset.tab); };
  A['hearts-info'] = () => {
    if (Y.isPlus()) return Y.sheet('<div class="sheet-c"><div class="big-em">❤️</div><h3>לבבות ללא הגבלה</h3><p>עם פרימיום טועים בלי לחשוב פעמיים.</p><button class="btn btn-gold btn-block" data-act="sheet-close">מעולה</button></div>');
    const h = Y.hearts();
    Y.sheet('<div class="sheet-c"><div class="hearts-row">' + '❤️'.repeat(h) + '🤍'.repeat(C.MAX_HEARTS - h) + '</div><h3>' + h + ' מתוך ' + C.MAX_HEARTS + ' לבבות</h3>' +
      '<p>כל טעות בשיעור עולה לב. ' + (h < C.MAX_HEARTS ? 'הלב הבא יתמלא בעוד ' + Y.nextHeartMin() + ' דקות.' : 'כרגע הכול מלא.') + ' יש לך ' + Y.state.gems + ' 💎.</p>' +
      '<button class="btn btn-gold btn-block" data-act="go-plus-from-sheet">👑 לבבות ללא הגבלה</button>' +
      (h < C.MAX_HEARTS ? '<button class="btn btn-block" data-act="practice-heart">תרגול קצר ומקבלים לב</button>' : '') +
      '<button class="btn btn-ghost btn-block" data-act="sheet-close">סגירה</button></div>');
  };

  /* ═════════ HOME ═════════ */
  const leagueInfo = () => {
    const st = Y.state, wk = Y.weekKey(), now = new Date();
    const mine = st.week.key === wk ? st.week.xp : 0;
    const frac = (now.getDay() + now.getHours() / 24) / 7;
    let seed = wk.split('-').reduce((n, x) => n * 31 + +x, 7);
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const rows = BOTS.filter((b) => b[0] !== st.user.name).map((b) => ({ name: b[0], av: b[1], xp: Math.round((60 + rnd() * 380) * frac) }));
    rows.push({ name: st.user.name || 'אני', av: '🌵', xp: mine, me: true });
    rows.sort((a, b) => b.xp - a.xp);
    const tier = st.xp >= 1500 ? ['ליגת הזהב', '🥇'] : st.xp >= 500 ? ['ליגת הכסף', '🥈'] : ['ליגת הברונזה', '🥉'];
    return { rows: rows, rank: rows.findIndex((r) => r.me) + 1, mine: mine, tier: tier, left: 7 - now.getDay() };
  };
  const BOTS = [['נועה', '🦊'], ['איתי', '🐼'], ['מאיה', '🦄'], ['יונתן', '🐯'], ['שירה', '🐬'], ['עומר', '🦉'], ['תמר', '🐨'], ['דניאל', '🦁'], ['ליאור', '🐙']];

  const sabiLine = (st, today, goal) => {
    const n = esc(st.user.name || '');
    if (today >= goal) return 'אלוף העולם, ' + n + '! היעד של היום בכיס 🎯';
    if (!Y.doneCount()) return 'אהלן ' + n + '! יאללה, שיעור ראשון? 5 דקות וסיימנו.';
    if (Y.liveStreak() >= 2) return Y.liveStreak() + ' ימים ברצף, ' + n + '. לא שוברים רצף כזה!';
    return Y.pick(['מה קורה ' + n + '? יאללה, חמש דקות ואנחנו שם.', 'סבבה ' + n + ', ממשיכים מאיפה שעצרנו?', n + ', הקפה מוכן? בוא נלמד משהו.']);
  };
  S.home = () => {
    const st = Y.state, goal = Y.dailyGoalXp(), today = Y.todayXp(), nx = Y.nextLesson(), lg = leagueInfo();
    const mission = nx
      ? '<button class="mission" data-act="node" data-u="' + nx.unit.id + '" data-i="' + nx.i + '"><h2>המשימה שלך להיום</h2>' +
        '<div class="mission-row">' + (nx.unit.scene === 'cafe' ? Y.art('coffee', 'mission-img') : '<span class="mission-em">' + nx.unit.lessons[nx.i].e + '</span>') + '<span class="mission-txt"><b>' + esc(nx.unit.lessons[nx.i].t) + '</b><small>שיעור · 5 דקות · ' + esc(nx.unit.title) + '</small></span><span class="play-btn">' + Y.ICON.play + '</span></div>' +
        '<div class="goalbar"><div class="pbar pbar-gold"><i style="width:' + Math.max(4, Math.min(100, Math.round((today / goal) * 100))) + '%"></i></div><small>' + (today >= goal ? 'היעד היומי הושלם. כל שיעור נוסף הוא בונוס.' : 'עוד ' + Y.xpTxt(goal - today) + ' ליעד של היום') + '</small></div></button>'
      : '<button class="mission" data-act="tab" data-tab="plus"><h2>סיימת את כל השיעורים הפתוחים</h2><div class="mission-row"><span class="mission-em">👑</span><span class="mission-txt"><b>פרימיום פותח את כל המסלולים</b><small>' + Y.totalLessons() + ' שיעורים מחכים</small></span><span class="play-btn">' + Y.ICON.play + '</span></div></button>';
    const nRev = st.mistakes.length || Math.min(Object.keys(st.words).length, 10);
    return page('home',
      '<header class="hello">' + avatar() + '<h1>שלום, ' + esc(st.user.name || 'אורח') + ' 👋</h1><button class="heart-chip" data-act="hearts-info" aria-label="לבבות">❤️ <b>' + (Y.isPlus() ? '∞' : Y.hearts()) + '</b></button></header>' +
      '<div class="stats"><div class="stat"><b>🔥 <span data-count="' + Y.liveStreak() + '">0</span></b><small>ימי רצף</small></div><div class="stat"><b class="gold">⭐ <span data-count="' + st.xp + '">0</span></b><small>XP</small></div><div class="stat"><b dir="ltr">' + Y.level() + '</b><small>הרמה שלך</small></div></div>' +
      Y.sabiSay(today >= goal ? 'cheer' : 'wave', sabiLine(st, today, goal)) + mission +
      '<button class="mini-card is-ai" data-act="tab" data-tab="ai"><span class="mini-em">🤖</span><span class="mini-txt"><b>שיחה עם סאבי AI</b><small>סימולציה חיה: בית קפה, שדה תעופה, ראיון</small></span><span class="chev">' + Y.ICON.back + '</span></button>' +
      '<button class="mini-card" data-act="quick-review"><span class="mini-em">🏋️</span><span class="mini-txt"><b>' + (nRev ? nRev + ' מילים לחזרה' : 'חזרה על מילים') + '</b><small>' + (st.mistakes.length ? 'חיזוק מילים שהתבלבלת בהן' : 'חיזוק מילים שלמדת') + '</small></span><span class="chev">' + Y.ICON.back + '</span></button>' +
      '<button class="mini-card" data-act="tab" data-tab="league"><span class="mini-em">' + lg.tier[1] + '</span><span class="mini-txt"><b>' + lg.tier[0] + ' · מקום ' + lg.rank + '</b><small>' + Y.xpTxt(lg.mine) + ' השבוע</small></span><span class="chev">' + Y.ICON.back + '</span></button>' +
      (Y.isPlus() ? '' : '<button class="mini-card is-gold" data-act="tab" data-tab="plus"><span class="mini-em">👑</span><span class="mini-txt"><b>יאללה פרימיום</b><small>כל השיעורים, לבבות ללא הגבלה</small></span><span class="pill pill-gold">' + C.PRICE_ILS + ' ₪</span></button>') +
      '<div class="sky-wrap">' + Y.art('skyline', 'sky-img') + '</div>', 'page-home');
  };
  A['quick-review'] = () => Y.startLesson(Y.buildPractice(Y.state.mistakes.length && Y.isPlus() ? 'mistakes' : 'mix'));

  /* ═════════ PATH (timeline) ═════════ */
  S.path = () => {
    const st = Y.state, units = Y.unitOrder(), nx = Y.nextLesson();
    const current = nx ? Y.lid(nx.unit, nx.i) : '';
    let lastTrack = '';
    const html = units.map((u) => {
      const doneN = u.lessons.filter((l, i) => st.done[Y.lid(u, i)]).length;
      let h = '';
      if (u.track !== lastTrack) { lastTrack = u.track; h += '<div class="track-label"><span>' + Y.TRACKS[u.track] + '</span></div>'; }
      h += '<div class="unit-head" style="--u:' + u.color[0] + ';--ud:' + u.color[1] + '"><span class="unit-head-em">' + u.emoji + '</span><div class="unit-head-txt"><h2>' + esc(u.title) + '</h2><p>' + esc(u.sub) + '</p></div><span class="pill">' + doneN + '/' + u.lessons.length + '</span></div>' +
        '<div class="tl">' + u.lessons.map((l, i) => {
          const s = Y.status(u, i), id = Y.lid(u, i), cur = id === current;
          const icon = s === 'done' ? Y.ICON.check : s === 'open' ? Y.ICON.play : s === 'plus' ? Y.ICON.crown : Y.ICON.lock;
          return '<button class="tl-row is-' + s + (cur ? ' cur' : '') + '" data-act="node" data-u="' + u.id + '" data-i="' + i + '">' + (cur ? '<span class="tl-sabi">' + Y.mascot('wave', 58) + '</span>' : '') + '<span class="tl-em">' + l.e + '</span><span class="tl-t">' + esc(l.t) + '</span><span class="tl-s">' + icon + '</span></button>';
        }).join('') + '</div>';
      return h;
    }).join('');
    return page('path', '<h1 class="page-title">מסלול הלמידה</h1>' + html + '<div class="sky-wrap">' + Y.art('skyline', 'sky-img') + '</div>');
  };
  const findUnit = (id) => Y.COURSE.find((u) => u.id === id);
  A['node'] = (el) => {
    const u = findUnit(el.dataset.u), i = +el.dataset.i, l = u.lessons[i], s = Y.status(u, i);
    Y.sfx('tap');
    if (s === 'locked') { Y.toast('קודם מסיימים את השיעור שלפניו'); return; }
    if (s === 'plus') {
      return Y.sheet('<div class="sheet-c"><div class="big-em">👑</div><h3>' + esc(l.t) + '</h3><p>השיעור הזה פתוח למנויי פרימיום, יחד עם כל ' + Y.totalLessons() + ' השיעורים ולבבות ללא הגבלה.</p>' +
        '<button class="btn btn-gold btn-block" data-act="go-plus-from-sheet">' + go('לפרטים על פרימיום') + '</button><button class="btn btn-ghost btn-block" data-act="sheet-close">לא עכשיו</button></div>');
    }
    const words = l.w.map(Y.parseW);
    Y.sheet('<div class="sheet-c"><div class="sl-em">' + l.e + '</div><p class="eyebrow">' + esc(u.title) + '</p><h3>' + esc(l.t) + '</h3>' +
      '<div class="sl-words" dir="ltr">' + words.map((w) => '<span>' + w.em + ' ' + esc(w.en) + '</span>').join('') + '</div>' +
      '<p class="sl-meta">' + (s === 'done' ? 'הושלם · חזרה נותנת ' + Y.xpTxt(5) : '6 מילים · סימולציית שיחה · ' + Y.xpTxt(10)) + '</p>' +
      '<button class="btn btn-gold btn-block btn-xl" data-act="start" data-u="' + u.id + '" data-i="' + i + '">' + go(s === 'done' ? 'תרגול חוזר' : 'מתחילים') + '</button></div>');
  };
  A['start'] = (el) => Y.startLesson(Y.buildLesson(findUnit(el.dataset.u), +el.dataset.i));

  /* ═════════ REVIEW ═════════ */
  S.practice = () => {
    const st = Y.state, plus = Y.isPlus(), words = Object.keys(st.words);
    const card = (act, em, t, d, lock) => '<button class="pcard" data-act="' + (lock ? 'need-plus' : 'practice') + '" data-mode="' + act + '"><span class="pcard-em">' + em + '</span><span class="pcard-t"><b>' + t + '</b><small>' + d + '</small></span>' + (lock ? '<span class="pill pill-gold">פרימיום</span>' : '<span class="chev">' + Y.ICON.back + '</span>') + '</button>';
    const dict = words.length
      ? '<div class="dict">' + words.slice().reverse().slice(0, 60).map((en) => { const w = st.words[en]; return '<button class="dict-row" data-act="say" data-say="' + esc(en) + '"><span class="dict-em">' + (w.em || '•') + '</span><b dir="ltr">' + esc(en) + '</b><span class="dict-he">' + esc(w.he) + '</span><span class="dots" aria-label="חוזק ' + w.n + ' מתוך 5">' + [0, 1, 2, 3, 4].map((i) => '<i class="' + (i < w.n ? 'on' : '') + '"></i>').join('') + '</span></button>'; }).join('') + '</div>'
      : '<div class="empty">' + Y.mascot('think', 96) + '<p>המילים שתלמדו יחכו כאן, עם מד חוזק לכל מילה.</p></div>';
    return page('practice',
      '<h1 class="page-title">חזרה ותרגול</h1><p class="page-sub">תרגול לא עולה לבבות, ובסופו מקבלים לב.</p>' +
      '<div class="pcards">' + card('mix', '⚡', 'תרגול מהיר', 'עשרה תרגילים מהחומר שלמדת') + card('match', '🧩', 'משחק זוגות', 'התאמת מילים לפירוש') +
      card('mistakes', '🩹', 'חזרה על טעויות', st.mistakes.length ? st.mistakes.length + ' פריטים מחכים לתיקון' : 'אין טעויות פתוחות כרגע', !plus) +
      card('listen', '🎧', 'אימון הקשבה', 'מבינים אנגלית מדוברת', !plus) + '</div>' +
      '<h2 class="sec-title">המילון שלי <span>' + words.length + ' מילים · לחיצה משמיעה</span></h2>' + dict);
  };
  A['practice'] = (el) => {
    const mode = el.dataset.mode;
    if (mode === 'mistakes' && !Y.state.mistakes.length) { Y.toast('אין טעויות לתקן. יפה!'); return; }
    Y.startLesson(Y.buildPractice(mode));
  };
  A['need-plus'] = () => Y.sheet('<div class="sheet-c"><div class="big-em">👑</div><h3>תרגול למנויי פרימיום</h3><p>חזרה על טעויות ואימון הקשבה פתוחים למנויי פרימיום.</p><button class="btn btn-gold btn-block" data-act="go-plus-from-sheet">' + go('לפרטים על פרימיום') + '</button><button class="btn btn-ghost btn-block" data-act="sheet-close">לא עכשיו</button></div>');

  /* ═════════ LEAGUE ═════════ */
  S.league = () => {
    const lg = leagueInfo();
    return page('league', backRow('home') +
      '<section class="league-hero"><div class="league-cup">' + lg.tier[1] + '</div><h1>' + lg.tier[0] + '</h1><p>שלושת הראשונים עולים ליגה. נשארו ' + lg.left + (lg.left === 1 ? ' יום' : ' ימים') + ' עד סוף השבוע.</p>' +
      '<div class="league-me">המקום שלך: <b>' + lg.rank + '</b> · ' + Y.xpTxt(lg.mine) + ' השבוע</div></section>' +
      '<ol class="board">' + lg.rows.map((r, i) => '<li class="' + (r.me ? 'me ' : '') + (i < 3 ? 'top' : '') + '"><span class="rank">' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</span><span class="av">' + r.av + '</span><b>' + esc(r.name) + (r.me ? ' (אני)' : '') + '</b><span class="xp" dir="ltr">' + r.xp + ' XP</span></li>' + (i === 2 ? '<li class="cut"><span>אזור העלייה</span></li>' : '')).join('') + '</ol>' +
      '<p class="fine">בגרסה הזו המתחרים בליגה מדומים. ליגות אמיתיות דורשות חיבור לשרת.</p>');
  };

  /* ═════════ PREMIUM ═════════ */
  S.plus = () => {
    const st = Y.state, price = C.PRICE_ILS, trial = C.TRIAL_DAYS;
    const perks = [['כל ' + Y.totalLessons() + ' השיעורים והמסלולים', 'טיולים, עבודה, יומיום וילדים'], ['שיחות AI ללא הגבלה', 'מדברים עם סאבי כמה שרוצים'], ['לבבות ללא הגבלה', 'טועים, לומדים וממשיכים בלי לחכות'], ['חזרה חכמה על מילים', 'התרגול מתמקד במה שקשה לך'], ['אימון הקשבה', 'מבינים אנגלית מדוברת'], ['תוכן חדש בכל חודש', 'המסלולים ממשיכים לגדול']];
    const list = '<ul class="perks">' + perks.map((p) => '<li><span>✓</span><div><b>' + p[0] + '</b><small>' + p[1] + '</small></div></li>').join('') + '</ul>';
    const hero = Y.art('london', 'plus-art') + '<section class="plus-hero"><div class="plus-crown">👑</div>' + '<div class="wordmark wordmark-s" dir="ltr"><span>YALLA <b style="padding:0">English</b></span><i>Premium</i></div>';
    if (Y.isPlus()) {
      return page('plus', backRow('profile') + hero + '<p>הפרימיום שלך פעיל. כל התוכן פתוח והלבבות ללא הגבלה.</p></section>' + list +
        '<div class="card-plain"><b>המנוי שלך</b><p>' + price + ' ₪ לחודש · פעיל מאז ' + esc(st.plus.since.split('-').reverse().join('.')) + '</p><button class="btn btn-ghost btn-block" data-act="plus-cancel">ביטול המנוי</button></div>');
    }
    return page('plus', backRow('profile') + hero + '</section>' + list +
      '<button class="btn btn-gold btn-block price-btn" data-act="plus-buy"><b>' + price + '</b> ₪ לחודש</button>' +
      '<p class="fine">' + (trial ? trial + ' ימי ניסיון חינם · ' : '') + 'ביטול בכל עת · ללא התחייבות</p>' +
      '<table class="cmp"><thead><tr><th></th><th>חינם</th><th>פרימיום</th></tr></thead><tbody>' +
      [['יחידות הבסיס ושיעור טעימה מכל יחידה', 1, 1], ['כל ' + Y.totalLessons() + ' השיעורים', 0, 1], ['שיחות AI עם סאבי', '6 ביום', 1], ['לבבות ללא הגבלה', 0, 1], ['חזרה על טעויות ואימון הקשבה', 0, 1], ['מילון אישי וליגה שבועית', 1, 1]].map((r) => '<tr><td>' + r[0] + '</td><td>' + (typeof r[1] === 'string' ? r[1] : r[1] ? '✓' : '–') + '</td><td class="yes">' + (r[2] ? '✓' : '–') + '</td></tr>').join('') + '</tbody></table>' +
      '<div class="sky-wrap">' + Y.art('skyline', 'sky-img') + '</div>');
  };
  A['plus-buy'] = () => {
    if (C.PAYMENT_URL) { window.open(C.PAYMENT_URL, '_blank', 'noopener'); return; }
    Y.state.plus = { active: true, since: Y.dayKey() }; Y.save();
    Y.go('plus'); Y.confetti(); Y.sfx('win');
    Y.toast('גרסת הדגמה: פרימיום הופעל במכשיר הזה ללא חיוב.');
  };
  A['plus-cancel'] = () => Y.sheet('<div class="sheet-c">' + Y.mascot('sad', 110) + '<h3>לבטל את הפרימיום?</h3><p>השיעורים הנעולים ייסגרו והלבבות יחזרו להיות מוגבלים.</p><button class="btn btn-gold btn-block" data-act="sheet-close">נשארים בפרימיום</button><button class="btn btn-ghost btn-block" data-act="plus-cancel-yes">ביטול המנוי</button></div>');
  A['plus-cancel-yes'] = () => { Y.state.plus = { active: false, since: '' }; Y.save(); Y.closeSheet(); Y.go('plus'); Y.toast('המנוי בוטל'); };

  /* ═════════ PROFILE ═════════ */
  const WHO = { soldier: 'אחרי צבא', kid: 'לומדים במשחק', student: 'לימודים', adult: 'לומדים בכל גיל' };
  S.profile = () => {
    const st = Y.state, u = st.user;
    const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'], now = new Date();
    const week = [0, 1, 2, 3, 4, 5, 6].map((i) => { const d = Y.addDays(now, i - now.getDay()); return { l: days[i], xp: st.days[Y.dayKey(d)] || 0, today: i === now.getDay() }; });
    const max = Math.max(Y.dailyGoalXp(), Math.max.apply(null, week.map((w) => w.xp)));
    return page('profile',
      '<section class="me">' + avatar(true) + '<div><h1>' + esc(u.name || 'אורח') + '</h1><p>' + (st.account ? '<span dir="ltr">' + esc(st.account.email) + '</span><br>' : '') + (WHO[u.who] || 'לומדים אנגלית') + ' · מאז ' + esc(u.joined.split('-').reverse().join('.')) + '</p></div>' +
      '<button class="icon-btn" data-act="settings" aria-label="הגדרות">' + Y.ICON.gear + '</button></section>' +
      '<button class="mini-card is-gold" data-act="tab" data-tab="plus"><span class="mini-em">👑</span><span class="mini-txt"><b>' + (Y.isPlus() ? 'פרימיום פעיל' : 'יאללה פרימיום') + '</b><small>' + (Y.isPlus() ? 'ניהול המנוי' : 'כל השיעורים ב-' + C.PRICE_ILS + ' ₪ לחודש') + '</small></span><span class="chev">' + Y.ICON.back + '</span></button>' +
      '<div class="stats stats-4"><div class="stat"><b>🔥 ' + Y.liveStreak() + '</b><small>ימים ברצף</small></div><div class="stat"><b class="gold">⭐ ' + st.xp + '</b><small>סך הכול XP</small></div>' +
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
      '<div class="set-row"><span>אפקטים קוליים</span>' + seg('sound', s.sound, [[true, 'פועל'], [false, 'כבוי']]) + '</div>' +
      '<div class="set-row"><span>הקראה באנגלית</span>' + seg('tts', s.tts, [[true, 'פועל'], [false, 'כבוי']]) + '</div>' +
      '<div class="set-row"><span>מהירות דיבור</span>' + seg('rate', s.rate, [[0.8, 'איטי'], [1, 'רגיל'], [1.15, 'מהיר']]) + '</div>' +
      '<div class="set-row"><span>יעד יומי</span>' + seg('daily', u.daily, [[5, '5 דק׳'], [10, '10'], [15, '15'], [20, '20']]) + '</div>' +
      '<div class="set-row"><span>פנייה</span>' + seg('gender', u.gender, [['m', 'זכר'], ['f', 'נקבה']]) + '</div>' +
      '<button class="btn btn-block" data-act="say" data-say="Hello, my friend">' + Y.ICON.speaker + 'בדיקת קול</button>' +
      '<button class="btn btn-gold btn-block" data-act="settings-done">סיום</button>' +
      '<button class="btn btn-ghost btn-block" data-act="logout">התנתקות</button>' +
      '<button class="btn btn-ghost btn-block danger" data-act="reset-ask">מחיקת החשבון וההתקדמות</button></div>';
  };
  A['settings'] = () => Y.sheet(settingsHtml(), { nofocus: true });
  A['set'] = (el) => {
    const k = el.dataset.k; let v = el.dataset.v;
    if (v === 'true') v = true; else if (v === 'false') v = false; else if (!isNaN(+v)) v = +v;
    if (k === 'daily' || k === 'gender') Y.state.user[k] = v; else Y.state.settings[k] = v;
    Y.save(); Y.sfx('select');
    Y.$('#sheet .sheet').innerHTML = settingsHtml();
    if (k === 'rate' || k === 'tts') Y.speak('Hello, my friend');
  };
  A['settings-done'] = () => { Y.closeSheet(); Y.go('profile'); };
  A['logout'] = () => { Y.state.session = false; Y.save(); Y.closeSheet(); Y.boot(); };
  A['reset-ask'] = () => Y.sheet('<div class="sheet-c">' + Y.mascot('sad', 110) + '<h3>למחוק את כל ההתקדמות?</h3><p>הרצף, הנקודות והמילון יימחקו מהמכשיר. אי אפשר לשחזר.</p><button class="btn btn-gold btn-block" data-act="sheet-close">ביטול</button><button class="btn btn-ghost btn-block danger" data-act="reset-yes">מחיקה ויציאה</button></div>');
  A['reset-yes'] = () => { Y.reset(); Y.closeSheet(); O = { step: -1, data: {} }; Y.go('onboarding'); };

  /* ═════════ router ═════════ */
  Y.go = (name) => {
    if (name !== 'onboarding' && name !== 'splash') Y.lastTab = name;
    const app = Y.$('#app');
    Y.$$('.confetti').forEach((c) => c.remove());
    Y.stopSpeech();
    app.innerHTML = S[name]() + (name === 'ai' ? nav('home') : '');
    app.className = 'app app-' + name;
    app.style.animation = 'none'; void app.offsetWidth; app.style.animation = '';
    const p = Y.$('#page'); if (p) p.scrollTop = 0;
    Y.$$('[data-count]', app).forEach((el) => Y.countUp(el, +el.dataset.count, 900));
    if (name === 'path') { const cur = Y.$('.tl-row.cur'); if (cur && Y.doneCount()) cur.scrollIntoView({ block: 'center' }); }
  };
})();
