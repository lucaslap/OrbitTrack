/* =========================================================
   DADOS ESTÁTICOS
   Array com 8 objetos orbitais simulados. Cada item segue o
   contrato:
     id          string  ex.: "SAT-001"
     nome        string
     tipo        "Satélite" | "Detrito" | "Foguete"
     altitude    número em km
     inclinacao  número em graus
     status      "Ativo" | "Inativo" | "Crítico"
     risco       "Baixo" | "Médio" | "Alto" | "Crítico"
   ========================================================= */
const objetos = [
  { id: "SAT-001", nome: "Starlink-2891",      tipo: "Satélite", altitude: 550,   inclinacao: 53,  status: "Ativo",    risco: "Baixo"   },
  { id: "DEB-047", nome: "Fragmento Fengyun",  tipo: "Detrito",  altitude: 850,   inclinacao: 98,  status: "Inativo",  risco: "Crítico" },
  { id: "SAT-014", nome: "Amazonas-Nexus 1",   tipo: "Satélite", altitude: 35786, inclinacao: 0,   status: "Ativo",    risco: "Baixo"   },
  { id: "DEB-112", nome: "Painel Solar Mir",   tipo: "Detrito",  altitude: 410,   inclinacao: 51,  status: "Crítico",  risco: "Crítico" },
  { id: "ROC-009", nome: "Estágio Longa Marcha 5B", tipo: "Foguete", altitude: 220, inclinacao: 41, status: "Crítico", risco: "Alto"    },
  { id: "SAT-203", nome: "CBERS-04A",          tipo: "Satélite", altitude: 628,   inclinacao: 97.9, status: "Ativo",   risco: "Baixo"   },
  { id: "DEB-088", nome: "Cosmos-1408 frag.",  tipo: "Detrito",  altitude: 480,   inclinacao: 82.6, status: "Inativo", risco: "Médio"   },
  { id: "SAT-077", nome: "Sentinel-2B",        tipo: "Satélite", altitude: 786,   inclinacao: 98.6, status: "Ativo",   risco: "Baixo"   }
];

/* =========================================================
   RENDERIZAÇÃO DA TABELA
   Recebe a lista filtrada e desenha as linhas. Mantém uma
   linha de "estado vazio" quando o filtro não retorna nada.
   ========================================================= */
const tbody       = document.getElementById('tbody');
const filterType  = document.getElementById('filterType');
const filterStat  = document.getElementById('filterStatus');
const filterText  = document.getElementById('filterSearch');
const rowCount    = document.getElementById('rowCount');
const totalCount  = document.getElementById('totalCount');

const nf = new Intl.NumberFormat('pt-BR');

function statusClass(s) {
  if (s === 'Ativo')    return 'ativo';
  if (s === 'Inativo')  return 'inativo';
  if (s === 'Crítico')  return 'critico';
  return 'inativo';
}
function riskClass(r) {
  return ({ 'Baixo':'baixo', 'Médio':'medio', 'Alto':'alto', 'Crítico':'critico' })[r] || 'baixo';
}

function renderRows(list) {
  if (!list.length) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">// Nenhum objeto corresponde aos filtros aplicados</td>
      </tr>`;
  } else {
    tbody.innerHTML = list.map(o => `
      <tr>
        <td class="id">${o.id}</td>
        <td class="name">${o.nome}</td>
        <td>${o.tipo}</td>
        <td class="num">${nf.format(o.altitude)}</td>
        <td class="num">${o.inclinacao}°</td>
        <td><span class="tag ${statusClass(o.status)}">${o.status}</span></td>
        <td><span class="risk ${riskClass(o.risco)}"><span class="dot"></span>${o.risco}</span></td>
      </tr>
    `).join('');
  }
  rowCount.textContent  = list.length;
  totalCount.textContent = objetos.length;
}

/* =========================================================
   FILTROS
   Combina tipo + status + busca textual (id ou nome).
   "all" significa "qualquer valor".
   ========================================================= */
function applyFilters() {
  const t = filterType.value;
  const s = filterStat.value;
  const q = filterText.value.trim().toLowerCase();

  const out = objetos.filter(o => {
    const okT = (t === 'all') || (o.tipo === t);
    const okS = (s === 'all') || (o.status === s);
    const okQ = !q || o.id.toLowerCase().includes(q) || o.nome.toLowerCase().includes(q);
    return okT && okS && okQ;
  });
  renderRows(out);
}

filterType.addEventListener('change', applyFilters);
filterStat.addEventListener('change', applyFilters);
filterText.addEventListener('input', applyFilters);

renderRows(objetos);

/* =========================================================
   RELÓGIO UTC + MARCA DE ATUALIZAÇÃO
   ========================================================= */
(function clock() {
  const el = document.getElementById('utcClock');
  const upd = document.getElementById('updatedAt');
  function tick() {
    const d = new Date();
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    const ss = String(d.getUTCSeconds()).padStart(2, '0');
    el.textContent = `${hh}:${mm}:${ss}`;
    upd.textContent = `${hh}:${mm}:${ss} UTC`;
  }
  tick();
  setInterval(tick, 1000);
})();
