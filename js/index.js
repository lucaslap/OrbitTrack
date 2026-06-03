/* =========================================================
   CONTADOR ANIMADO
   Anima de 0 até o valor alvo (1.200.000) usando
   requestAnimationFrame, com easing "easeOutCubic" para
   desacelerar suavemente no fim. Formato pt-BR.
   ========================================================= */
(function initCounter() {
  const target = 1200000;
  const duration = 2400; // ms
  const el = document.getElementById('counterValue');
  const fmt = new Intl.NumberFormat('pt-BR');
  const start = performance.now();

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function frame(now) {
    const p = Math.min(1, (now - start) / duration);
    const value = Math.floor(target * easeOutCubic(p));
    el.textContent = fmt.format(value) + (p === 1 ? '+' : '');
    if (p < 1) requestAnimationFrame(frame);
  }
  // Pequeno atraso para dar a sensação de "iniciando uplink"
  setTimeout(() => requestAnimationFrame(frame), 350);
})();

/* =========================================================
   RELÓGIO DE TELEMETRIA
   Atualiza o campo "ATUAL." com a hora corrente em formato
   HH:MM:SS UTC-3, simulando uma marca temporal de console.
   ========================================================= */
(function initClock() {
  const el = document.getElementById('updatedAt');
  function tick() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    el.textContent = `${hh}:${mm}:${ss}`;
  }
  tick();
  setInterval(tick, 1000);
})();
