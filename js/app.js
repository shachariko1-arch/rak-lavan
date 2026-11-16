/* Yalla English – boot */
(function () {
  const Y = window.Y;
  Y.load();
  ['pointerdown', 'touchstart', 'keydown'].forEach((ev) => document.addEventListener(ev, Y.unlockAudio, { capture: true, passive: true }));

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = Y.actions[el.dataset.act];
    if (fn) fn(el, e);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { const s = Y.$('#sheet .sheet-back[data-act="sheet-dismiss"]'); if (s) Y.dismissSheet(); }
    if (e.key === 'Enter' && !e.target.closest('button, input, a')) { const b = Y.$('#mainbtn'); if (b && !b.disabled) b.click(); }
  });

  Y.boot();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
  }
})();
