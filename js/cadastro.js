/* =========================================================
   CADASTRO DE OBJETOS ORBITAIS
   - Mantém um array `registros` em memória (sessão atual).
   - Valida campos obrigatórios e a faixa de altitude
     (160 km LEO → 35.786 km GEO).
   - Após validar, gera um ID sequencial baseado no tipo
     (SAT- / DEB- / ROC-) e adiciona ao array.
   - Re-renderiza a lista a cada inclusão.
   - Botão Limpar reseta o formulário e remove estados de erro.
   ========================================================= */

const registros = []; // array da sessão atual

// Contadores por tipo (para IDs sequenciais)
const seq = { 'Satélite': 0, 'Detrito': 0, 'Foguete': 0 };

const PREFIX = { 'Satélite': 'SAT', 'Detrito': 'DEB', 'Foguete': 'ROC' };
const ICON   = { 'Satélite': 'bi-broadcast-pin', 'Detrito': 'bi-asterisk', 'Foguete': 'bi-rocket-takeoff' };
const KLASS  = { 'Satélite': 'satelite',         'Detrito': 'detrito',     'Foguete': 'foguete' };

const form = document.getElementById('form');
const list = document.getElementById('list');
const emptyState = document.getElementById('emptyState');
const count = document.getElementById('count');
const countFoot = document.getElementById('countFoot');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');

// ID da sessão (apenas estético)
document.getElementById('sessionId').textContent =
  '#' + Math.random().toString(36).substring(2, 8).toUpperCase();

const fields = ['f-nome','f-tipo','f-pais','f-altitude','f-inclinacao','f-status','f-risco'];

function setError(id, on) {
  const el = document.getElementById(id);
  el.parentElement.classList.toggle('error', !!on);
}
function clearAllErrors() {
  fields.forEach(id => setError(id, false));
}

/* =========================================================
   VALIDAÇÃO
   Retorna objeto com erros ({campo: true}) ou null se ok.
   Regras:
     - Todos os campos obrigatórios.
     - Altitude: número entre 160 e 35.786 (LEO–GEO).
     - Inclinação: número entre 0 e 180.
   ========================================================= */
function validate(data) {
  const errors = {};

  if (!data.nome)        errors['f-nome'] = true;
  if (!data.tipo)        errors['f-tipo'] = true;
  if (!data.pais)        errors['f-pais'] = true;
  if (!data.status)      errors['f-status'] = true;
  if (!data.risco)       errors['f-risco'] = true;

  const alt = Number(data.altitude);
  if (!Number.isFinite(alt) || alt < 160 || alt > 35786) errors['f-altitude'] = true;

  const inc = Number(data.inclinacao);
  if (!Number.isFinite(inc) || inc < 0 || inc > 180)    errors['f-inclinacao'] = true;

  return Object.keys(errors).length ? errors : null;
}

/* =========================================================
   RENDERIZAÇÃO DA LISTA
   ========================================================= */
const nf = new Intl.NumberFormat('pt-BR');

function statusClass(s) {
  return ({ 'Ativo':'ativo', 'Inativo':'inativo', 'Desconhecido':'desconhecido' })[s] || 'inativo';
}
function riskClass(r) {
  return ({ 'Baixo':'baixo', 'Médio':'medio', 'Alto':'alto', 'Crítico':'critico' })[r] || 'baixo';
}

function render() {
  count.textContent = registros.length;
  countFoot.textContent = registros.length;

  if (!registros.length) {
    list.innerHTML = '';
    list.appendChild(emptyState);
    return;
  }

  list.innerHTML = registros.slice().reverse().map(o => `
    <div class="record ${KLASS[o.tipo] || ''}">
      <div class="badge"><i class="bi ${ICON[o.tipo] || 'bi-question'}"></i></div>
      <div class="info">
        <div class="id">${o.id} · ${o.tipo}</div>
        <div class="name">${escapeHtml(o.nome)}</div>
        <div class="meta">
          <span>ALT <b>${nf.format(o.altitude)} km</b></span>
          <span>INC <b>${o.inclinacao}°</b></span>
          <span>ORIG <b>${escapeHtml(o.pais)}</b></span>
        </div>
      </div>
      <div class="tags">
        <span class="tag ${statusClass(o.status)}">${o.status}</span>
        <span class="risk ${riskClass(o.risco)}"><span class="dot"></span>${o.risco}</span>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

/* =========================================================
   TOAST
   ========================================================= */
let toastTimer;
function showToast(text) {
  toastText.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* =========================================================
   SUBMIT
   ========================================================= */
form.addEventListener('submit', e => {
  e.preventDefault();

  const data = {
    nome:       document.getElementById('f-nome').value.trim(),
    tipo:       document.getElementById('f-tipo').value,
    pais:       document.getElementById('f-pais').value.trim(),
    altitude:   document.getElementById('f-altitude').value,
    inclinacao: document.getElementById('f-inclinacao').value,
    status:     document.getElementById('f-status').value,
    risco:      document.getElementById('f-risco').value
  };

  clearAllErrors();
  const errors = validate(data);
  if (errors) {
    Object.keys(errors).forEach(id => setError(id, true));
    // Foca primeiro campo com erro
    const firstId = Object.keys(errors)[0];
    document.getElementById(firstId).focus();
    return;
  }

  // Gera ID sequencial por tipo: SAT-001, DEB-001, ROC-001...
  seq[data.tipo] = (seq[data.tipo] || 0) + 1;
  const prefix = PREFIX[data.tipo] || 'OBJ';
  const id = `${prefix}-${String(seq[data.tipo]).padStart(3, '0')}`;

  registros.push({
    id,
    nome:       data.nome,
    tipo:       data.tipo,
    pais:       data.pais,
    altitude:   Number(data.altitude),
    inclinacao: Number(data.inclinacao),
    status:     data.status,
    risco:      data.risco
  });

  render();
  showToast(`${id} · ${data.nome}`);
  form.reset();
  clearAllErrors();
  document.getElementById('f-nome').focus();
});

/* =========================================================
   RESET (botão "Limpar")
   ========================================================= */
document.getElementById('btnReset').addEventListener('click', () => {
  // O reset nativo limpa os campos; aqui só removemos erros.
  setTimeout(clearAllErrors, 0);
});

// Render inicial
render();
