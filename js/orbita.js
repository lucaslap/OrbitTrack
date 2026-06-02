/* =================================================================
   OrbitTrack — orbita.js  (Visualizador Orbital 3D — versão premium)
   =================================================================
   Módulo ES. Mantém intactos: dados, filtros, tooltip, seleção,
   lista lateral, relógio UTC e leitura de câmera. Reescreve apenas
   o ACABAMENTO da cena 3D:
     1) Bloom (EffectComposer + UnrealBloomPass)
     2) Atmosfera com Fresnel (ShaderMaterial, 2 camadas)
     3) Iluminação com volume (terminador dia/noite + rim cyan)
     4) Satélites como pontos de luz (sprites aditivos + ping de risco)
     5) Órbitas como rastro (cauda com alpha decrescente)
     6) Fundo com profundidade (estrelas em camadas + nebulosa + fog)
   ================================================================= */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass }      from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass }      from 'three/addons/postprocessing/OutputPass.js';

/* Camada dedicada ao bloom: apenas satélites, rastros, pings e o halo
   sutil entram nela. A Terra (camada 0) NÃO floresce → mapa nítido. */
const BLOOM_LAYER = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_LAYER);

/* Respeita a preferência por menos movimento */
const REDUZIR_MOV = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =================================================================
   PALETA (espelha os tokens do CSS)
   ================================================================= */
const COR = {
  cyan: 0x00d4ff, green: 0x00ff88, amber: 0xffd34a,
  orange: 0xff9c4a, red: 0xff4444, navy: 0x0a1530, grid: 0x1a3a5c
};
const COR_CAT = {
  satelite: COR.green, constelacao: COR.cyan, detrito: COR.amber, risco: COR.red
};

/* =================================================================
   1) DADOS — objetos orbitais nomeados (inalterado)
   ================================================================= */
const OBJETOS = [
  { nome: 'ISS (Estação Espacial)', tipo: 'Estação',  categoria: 'constelacao', alt: 418,   inc: 51.6, periodo: 92.9,  risco: 'Baixo',   raan: 20,  fase: 0   },
  { nome: 'CBERS-4A',               tipo: 'Satélite', categoria: 'satelite',    alt: 628,   inc: 97.9, periodo: 97.0,  risco: 'Baixo',   raan: 80,  fase: 40  },
  { nome: 'Amazônia-1',             tipo: 'Satélite', categoria: 'satelite',    alt: 752,   inc: 98.4, periodo: 100.0, risco: 'Baixo',   raan: 120, fase: 90  },
  { nome: 'Starlink-2891',          tipo: 'Satélite', categoria: 'constelacao', alt: 550,   inc: 53.0, periodo: 95.6,  risco: 'Baixo',   raan: 200, fase: 150 },
  { nome: 'Starlink-1340',          tipo: 'Satélite', categoria: 'constelacao', alt: 550,   inc: 53.0, periodo: 95.6,  risco: 'Baixo',   raan: 230, fase: 60  },
  { nome: 'Sentinel-2B',            tipo: 'Satélite', categoria: 'satelite',    alt: 786,   inc: 98.6, periodo: 100.4, risco: 'Baixo',   raan: 310, fase: 200 },
  { nome: 'Hubble (HST)',           tipo: 'Satélite', categoria: 'satelite',    alt: 535,   inc: 28.5, periodo: 95.4,  risco: 'Baixo',   raan: 150, fase: 280 },
  { nome: 'Terra (EOS AM-1)',       tipo: 'Satélite', categoria: 'satelite',    alt: 705,   inc: 98.2, periodo: 99.0,  risco: 'Baixo',   raan: 60,  fase: 320 },
  { nome: 'NOAA-20',                tipo: 'Satélite', categoria: 'satelite',    alt: 824,   inc: 98.7, periodo: 101.4, risco: 'Baixo',   raan: 270, fase: 110 },
  { nome: 'GOES-16',                tipo: 'Satélite', categoria: 'satelite',    alt: 35786, inc: 0.1,  periodo: 1436,  risco: 'Baixo',   raan: 0,   fase: 30  },
  { nome: 'GSAT-30',                tipo: 'Satélite', categoria: 'satelite',    alt: 35786, inc: 0.05, periodo: 1436,  risco: 'Baixo',   raan: 0,   fase: 210 },
  { nome: 'Cosmos-1408 frag.',      tipo: 'Detrito',  categoria: 'detrito',     alt: 480,   inc: 82.6, periodo: 94.0,  risco: 'Médio',   raan: 100, fase: 175 },
  { nome: 'Fengyun-1C frag.',       tipo: 'Detrito',  categoria: 'detrito',     alt: 850,   inc: 98.7, periodo: 102.0, risco: 'Médio',   raan: 340, fase: 250 },
  { nome: 'DEB-112 · Painel Mir',   tipo: 'Detrito',  categoria: 'risco',       alt: 410,   inc: 51.6, periodo: 92.8,  risco: 'Crítico', raan: 25,  fase: 8   },
  { nome: 'ROC-009 · Longa Marcha 5B', tipo: 'Foguete', categoria: 'risco',     alt: 220,   inc: 41.0, periodo: 88.5,  risco: 'Alto',    raan: 190, fase: 300 },
  { nome: 'Iridium-33 frag.',       tipo: 'Detrito',  categoria: 'risco',       alt: 780,   inc: 86.4, periodo: 100.3, risco: 'Alto',    raan: 290, fase: 130 }
];

/* =================================================================
   ESCALA E TEMPO
   ================================================================= */
const R_TERRA = 6371, UNI_TERRA = 1, VEL_TEMPO = 11, DEG = Math.PI / 180;

OBJETOS.forEach(function (o) {
  o._a     = (R_TERRA + o.alt) / R_TERRA * UNI_TERRA;
  o._inc   = o.inc  * DEG;
  o._raan  = o.raan * DEG;
  o._fase  = o.fase * DEG;
  o._omega = VEL_TEMPO / o.periodo;
  o._cor   = COR_CAT[o.categoria];
});

/* =================================================================
   MECÂNICA ORBITAL (inalterada)
   ================================================================= */
function transformar(a, inc, raan, theta) {
  let x = a * Math.cos(theta), y = 0, z = a * Math.sin(theta);
  const ci = Math.cos(inc), si = Math.sin(inc);
  let y2 = y * ci - z * si, z2 = y * si + z * ci; y = y2; z = z2;
  const cr = Math.cos(raan), sr = Math.sin(raan);
  return new THREE.Vector3(x * cr + z * sr, y, -x * sr + z * cr);
}
function posicaoOrbital(o, theta) { return transformar(o._a, o._inc, o._raan, theta); }

/* =================================================================
   2) CENA / CÂMERA / RENDERER / COMPOSER (bloom)
   ================================================================= */
const canvas   = document.getElementById('globe');
const viewport = canvas.parentElement;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050510, 16, 52); // 6) fog sutil (profundidade)

const camera = new THREE.PerspectiveCamera(
  48, viewport.clientWidth / viewport.clientHeight, 0.01, 200
);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // capa DPR p/ 60fps
renderer.setSize(viewport.clientWidth, viewport.clientHeight, false);

/* --- Pós-processamento: BLOOM SELETIVO (duas passagens) ----------
   bloomComposer: renderiza SÓ a camada de bloom (satélites/rastros/
     pings/halo) e aplica UnrealBloomPass → textura de brilho.
   finalComposer: renderiza a cena completa (Terra nítida) e SOMA a
     textura de bloom por cima (composição aditiva via ShaderPass).
   Assim o mapa real não "lava" e só os pontos de luz florescem.    */
const renderScene = new RenderPass(scene, camera);

const bloom = new UnrealBloomPass(
  new THREE.Vector2(viewport.clientWidth, viewport.clientHeight),
  0.9,   // strength
  0.45,  // radius
  0.0    // threshold (0: deixa o próprio UnrealBloom decidir; só a camada entra)
);

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloom);

const mixPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture:  { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D baseTexture;
      uniform sampler2D bloomTexture;
      varying vec2 vUv;
      void main() {
        gl_FragColor = texture2D(baseTexture, vUv) + texture2D(bloomTexture, vUv);
      }`,
    defines: {}
  }), 'baseTexture'
);
mixPass.needsSwap = true;

const finalComposer = new EffectComposer(renderer);
finalComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
finalComposer.addPass(renderScene);
finalComposer.addPass(mixPass);
// OutputPass faz tone-mapping + conversão sRGB (sem ele a cena fica escura)
finalComposer.addPass(new OutputPass());

/* Renderiza em duas etapas: escurece o que não é bloom, gera o brilho,
   restaura os materiais e compõe a cena final. */
const _materiaisEscuros = {};
const _matPreto = new THREE.MeshBasicMaterial({ color: 0x000000 });

function escurecerNaoBloom(obj) {
  // Só Mesh/Points/Line (sprites de bloom não são escurecidos)
  if (obj.isMesh || obj.isPoints || obj.isLine) {
    if (!bloomLayer.test(obj.layers)) {
      _materiaisEscuros[obj.uuid] = obj.material;
      obj.material = _matPreto;
    }
  }
}
function restaurarMaterial(obj) {
  if (_materiaisEscuros[obj.uuid]) {
    obj.material = _materiaisEscuros[obj.uuid];
    delete _materiaisEscuros[obj.uuid];
  }
}
function renderizar() {
  // 1) gera brilho só dos objetos da camada de bloom
  scene.traverse(escurecerNaoBloom);
  const fogAntiga = scene.fog; scene.fog = null; // fog não deve interferir no bloom
  bloomComposer.render();
  scene.fog = fogAntiga;
  scene.traverse(restaurarMaterial);
  // 2) cena final (Terra nítida) + soma do brilho
  finalComposer.render();
}

/* --- Câmera orbital manual (inalterada) --- */
const CAM = { az: 0.6, pol: 1.15, r: 3.6 };
const CAM_R_MIN = 1.55, CAM_R_MAX = 16, CAM_R_DEFAULT = 3.6;
function aplicarCamera() {
  const sp = Math.sin(CAM.pol), cp = Math.cos(CAM.pol);
  camera.position.set(CAM.r * sp * Math.sin(CAM.az), CAM.r * cp, CAM.r * sp * Math.cos(CAM.az));
  camera.lookAt(0, 0, 0);
}
aplicarCamera();

/* =================================================================
   3) ILUMINAÇÃO COM VOLUME (terminador dia/noite + rim cyan)
   ================================================================= */
scene.add(new THREE.AmbientLight(0x14233f, 0.45));     // ambiente baixo → preserva contraste
const sol = new THREE.DirectionalLight(0xdCEBff, 2.6); // luz principal lateral
sol.position.set(5, 1.5, 3);
scene.add(sol);
const rim = new THREE.DirectionalLight(0x00d4ff, 1.1); // rim light cyan atrás do globo
rim.position.set(-4, -1, -5);
scene.add(rim);

/* =================================================================
   TERRA — globo escuro liso
   -----------------------------------------------------------------
   Sem mapa, sem continentes, sem grade e sem aro de atmosfera. Apenas
   uma esfera escura (navy) com leve sombreado da luz direcional. Todo
   o "brilho" da cena vem dos satélites, rastros e do halo sutil.
   ================================================================= */
const grupoTerra = new THREE.Group();
scene.add(grupoTerra);

// Esfera escura lisa (fora da camada de bloom — não floresce).
// Leve sombreado da luz direcional dá volume sem mapa/continentes.
const terra = new THREE.Mesh(
  new THREE.SphereGeometry(UNI_TERRA, 64, 64),
  new THREE.MeshStandardMaterial({ color: 0x0a1426, roughness: 1.0, metalness: 0.0 })
);
grupoTerra.add(terra);

/* =================================================================
   HALO EXTERNO — único, bem sutil e difuso (não-Fresnel, sem borda)
   Dá leve profundidade ao contorno; entra na camada de bloom.
   ================================================================= */
const halo = new THREE.Sprite(new THREE.SpriteMaterial({
  map: (function () {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 30, 64, 64, 64);
    g.addColorStop(0,    'rgba(0,150,220,0.0)');
    g.addColorStop(0.70, 'rgba(0,150,220,0.0)');
    g.addColorStop(0.84, 'rgba(0,150,210,0.16)');
    g.addColorStop(1,    'rgba(0,110,180,0.0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })(),
  color: 0x1c6fb0, transparent: true, opacity: 0.28,
  blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false
}));
halo.scale.set(2.45, 2.45, 1);
halo.layers.enable(BLOOM_LAYER);
scene.add(halo);

/* =================================================================
   6) FUNDO COM PROFUNDIDADE — nebulosa + estrelas em camadas
   ================================================================= */
(function criarNebulosa() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, 1024, 512);
  // Manchas suaves de nebulosa (indigo / cyan / leve magenta)
  const blobs = [
    { x: 230, y: 180, r: 260, c: 'rgba(20,30,70,0.55)' },
    { x: 760, y: 320, r: 300, c: 'rgba(10,40,60,0.5)' },
    { x: 540, y: 120, r: 200, c: 'rgba(40,20,55,0.4)' },
    { x: 880, y: 90,  r: 180, c: 'rgba(0,60,90,0.35)' }
  ];
  blobs.forEach(function (b) {
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    g.addColorStop(0, b.c); g.addColorStop(1, 'rgba(5,5,16,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 512);
  });
  const tex = new THREE.CanvasTexture(c);
  const neb = new THREE.Mesh(
    new THREE.SphereGeometry(90, 32, 32),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false })
  );
  scene.add(neb);
})();

function camadaEstrelas(n, rMin, rMax, size, opacity, color) {
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = rMin + Math.random() * (rMax - rMin);
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos[i*3]   = r * Math.sin(p) * Math.cos(t);
    pos[i*3+1] = r * Math.cos(p);
    pos[i*3+2] = r * Math.sin(p) * Math.sin(t);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({
    color: color, size: size, sizeAttenuation: true,
    transparent: true, opacity: opacity, fog: false, depthWrite: false
  });
  scene.add(new THREE.Points(g, m));
}
camadaEstrelas(1200, 60, 95, 0.12, 0.5,  0x8aa0c8); // longe, fracas
camadaEstrelas(520,  55, 90, 0.24, 0.8,  0xcfe0ff); // médias
camadaEstrelas(70,   50, 85, 0.5,  1.0,  0xffffff); // poucas e intensas (brilham no bloom)

/* =================================================================
   TEXTURAS GERADAS EM RUNTIME (glow, núcleo, anel de ping)
   ================================================================= */
function texGradiente(stops) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const TEX_GLOW = texGradiente([
  [0, 'rgba(255,255,255,1)'], [0.22, 'rgba(255,255,255,0.65)'], [1, 'rgba(255,255,255,0)']
]);
const TEX_CORE = texGradiente([
  [0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.95)'], [0.6, 'rgba(255,255,255,0.2)'], [1, 'rgba(255,255,255,0)']
]);
function texAnel() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0,    'rgba(255,255,255,0)');
  g.addColorStop(0.70, 'rgba(255,255,255,0)');
  g.addColorStop(0.82, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.90, 'rgba(255,255,255,0.5)');
  g.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const TEX_ANEL = texAnel();

function corClara(hex) { return new THREE.Color(hex).lerp(new THREE.Color(0xffffff), 0.55); }

/* =================================================================
   4) SATÉLITES COMO PONTOS DE LUZ  +  5) CAUDA DE ÓRBITA
   ================================================================= */
const grupoObjetos = new THREE.Group();
scene.add(grupoObjetos);
const alvosRaycast = [];

const N_CAUDA = 52;            // pontos da cauda
const PASSO_CAUDA = 1.5 / N_CAUDA; // span angular da cauda (~86°)

function criarCauda(o) {
  // Geometria atualizada a cada quadro; cor (RGB) fixa, fade até preto.
  const pos = new Float32Array(N_CAUDA * 3);
  const col = new Float32Array(N_CAUDA * 3);
  const base = new THREE.Color(o._cor);
  for (let i = 0; i < N_CAUDA; i++) {
    const k = 1 - i / (N_CAUDA - 1);      // 1 na cabeça → 0 na ponta
    col[i*3] = base.r * k; col[i*3+1] = base.g * k; col[i*3+2] = base.b * k;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false
  });
  const linha = new THREE.Line(g, m);
  linha.layers.enable(BLOOM_LAYER); // rastros entram no bloom
  return linha;
}

OBJETOS.forEach(function (o) {
  // Halo (sprite suave grande)
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: TEX_GLOW, color: o._cor, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false
  }));
  glow.scale.set(0.10, 0.10, 0.10);
  glow.layers.enable(BLOOM_LAYER);

  // Núcleo (sprite pequeno e intenso, quase branco)
  const core = new THREE.Sprite(new THREE.SpriteMaterial({
    map: TEX_CORE, color: corClara(o._cor), transparent: true, opacity: 1,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false
  }));
  core.scale.set(0.038, 0.038, 0.038);
  core.layers.enable(BLOOM_LAYER);

  // Hitbox invisível (raycast)
  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.userData.obj = o;

  const grupo = new THREE.Group();
  grupo.add(glow); grupo.add(core); grupo.add(hit);

  // Ping de risco (anel que expande) — só p/ categoria "risco"
  let ping = null;
  if (o.categoria === 'risco') {
    ping = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX_ANEL, color: COR.red, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false
    }));
    ping.scale.set(0.05, 0.05, 0.05);
    ping.layers.enable(BLOOM_LAYER);
    grupo.add(ping);
  }

  grupoObjetos.add(grupo);

  const cauda = criarCauda(o);
  grupoObjetos.add(cauda);

  o._mesh = grupo; o._glow = glow; o._core = core; o._ping = ping; o._cauda = cauda;
  o._glowBase = 0.10;
  alvosRaycast.push(hit);
});

/* =================================================================
   POPULAÇÃO DE FUNDO (~180 pontos) — densidade (atrelada a "detrito")
   ================================================================= */
const grupoFundo = new THREE.Group();
scene.add(grupoFundo);
const N_FUNDO = 180;
(function criarFundo() {
  const pos = new Float32Array(N_FUNDO * 3);
  const col = new Float32Array(N_FUNDO * 3);
  const cA = new THREE.Color(COR.amber), cO = new THREE.Color(COR.orange), cD = new THREE.Color(0x4a6fa5);
  for (let i = 0; i < N_FUNDO; i++) {
    const a = 1.04 + Math.random() * (Math.random() < 0.85 ? 0.28 : 1.6);
    const v = transformar(a, (Math.random() * 110) * DEG, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    pos[i*3] = v.x; pos[i*3+1] = v.y; pos[i*3+2] = v.z;
    const c = Math.random() < 0.5 ? cD : (Math.random() < 0.5 ? cA : cO);
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  grupoFundo.add(new THREE.Points(g, new THREE.PointsMaterial({
    size: 0.02, sizeAttenuation: true, vertexColors: true,
    transparent: true, opacity: 0.7, fog: false, depthWrite: false
  })));
})();

/* =================================================================
   INTERAÇÃO — arrastar / zoom / clique / hover (inalterada)
   ================================================================= */
const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();
let arrastando = false, autoRotacao = !REDUZIR_MOV;
let pDown = null, moveu = 0;
let selecionado = null, hover = null;

function ndc(ev) {
  const r = canvas.getBoundingClientRect();
  mouseNDC.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
  mouseNDC.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
}
canvas.addEventListener('pointerdown', function (ev) {
  arrastando = true; autoRotacao = false;
  pDown = { x: ev.clientX, y: ev.clientY }; moveu = 0;
  canvas.setPointerCapture(ev.pointerId);
});
canvas.addEventListener('pointermove', function (ev) {
  if (arrastando && pDown) {
    const dx = ev.clientX - pDown.x, dy = ev.clientY - pDown.y;
    moveu += Math.abs(dx) + Math.abs(dy);
    CAM.az -= dx * 0.005;
    CAM.pol = Math.max(0.12, Math.min(Math.PI - 0.12, CAM.pol - dy * 0.005));
    pDown = { x: ev.clientX, y: ev.clientY };
    aplicarCamera(); esconderTooltip();
  } else {
    ndc(ev);
    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(alvosRaycast, false);
    const obj = hits.length ? hits[0].object.userData.obj : null;
    if (obj && obj._mesh.visible) { hover = obj; canvas.style.cursor = 'pointer'; mostrarTooltip(obj); }
    else { hover = null; canvas.style.cursor = 'grab'; esconderTooltip(); }
  }
});
function fimArraste(ev) {
  if (!arrastando) return;
  arrastando = false;
  if (moveu < 6) {
    ndc(ev);
    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(alvosRaycast, false);
    const obj = hits.length ? hits[0].object.userData.obj : null;
    selecionar(obj && obj._mesh.visible ? obj : null);
  }
}
canvas.addEventListener('pointerup', fimArraste);
canvas.addEventListener('pointercancel', function () { arrastando = false; });
canvas.addEventListener('wheel', function (ev) {
  ev.preventDefault();
  CAM.r = Math.max(CAM_R_MIN, Math.min(CAM_R_MAX, CAM.r * (1 + ev.deltaY * 0.0012)));
  aplicarCamera();
}, { passive: false });

/* =================================================================
   TOOLTIP (inalterado)
   ================================================================= */
const tooltip = document.getElementById('tooltip');
const ttDot = tooltip.querySelector('.tt-dot'), ttName = tooltip.querySelector('.tt-name');
const ttTipo = tooltip.querySelector('.tt-tipo'), ttAlt = tooltip.querySelector('.tt-alt');
const ttInc = tooltip.querySelector('.tt-inc'), ttPer = tooltip.querySelector('.tt-per');
const ttRisco = tooltip.querySelector('.tt-risco');
const nf = new Intl.NumberFormat('pt-BR');
const HEX = { satelite:'#00ff88', constelacao:'#00d4ff', detrito:'#ffd34a', risco:'#ff4444' };
const HEX_RISCO = { 'Baixo':'#00ff88', 'Médio':'#ffd34a', 'Alto':'#ff9c4a', 'Crítico':'#ff4444' };

function mostrarTooltip(o) {
  const cor = HEX[o.categoria];
  ttDot.style.background = cor; ttDot.style.boxShadow = '0 0 8px ' + cor;
  ttName.textContent = o.nome; ttTipo.textContent = o.tipo;
  ttAlt.textContent = nf.format(o.alt) + ' km'; ttInc.textContent = o.inc + '°';
  ttPer.textContent = o.periodo >= 600 ? (o.periodo / 60).toFixed(1) + ' h' : o.periodo + ' min';
  ttRisco.textContent = o.risco; ttRisco.style.color = HEX_RISCO[o.risco] || '#cfd8e6';
  tooltip.classList.add('show'); posicionarTooltip(o);
}
function esconderTooltip() { tooltip.classList.remove('show'); }
function posicionarTooltip(o) {
  const v = o._mesh.position.clone().project(camera);
  const r = canvas.getBoundingClientRect();
  tooltip.style.left = ((v.x * 0.5 + 0.5) * r.width) + 'px';
  tooltip.style.top  = ((-v.y * 0.5 + 0.5) * r.height) + 'px';
}

/* =================================================================
   5) SELEÇÃO — destaca a órbita do objeto e ESCURECE as demais
   ================================================================= */
function selecionar(o) {
  selecionado = o;
  const algo = !!o;
  OBJETOS.forEach(function (x) {
    const sel = (x === o);
    // Cauda: selecionada forte; demais bem fracas quando há seleção
    x._cauda.material.opacity = sel ? 1.0 : (algo ? 0.10 : 0.9);
    // Halos: demais levemente apagados quando há seleção (limpa a cena)
    x._glow.material.opacity = sel ? 1.0 : (algo ? 0.45 : 0.85);
  });
  document.querySelectorAll('.obj-row').forEach(function (row) {
    row.classList.toggle('selected', row.dataset.nome === (o ? o.nome : '__none'));
  });
}

/* =================================================================
   LISTA LATERAL DIREITA (inalterada)
   ================================================================= */
const objList = document.getElementById('objList');
function montarLista() {
  const ordenados = OBJETOS.slice().sort(function (a, b) { return a.alt - b.alt; });
  objList.innerHTML = ordenados.map(function (o) {
    const cor = HEX[o.categoria];
    return (
      '<li class="obj-row" data-nome="' + o.nome.replace(/"/g, '&quot;') + '" tabindex="0">' +
        '<span class="o-dot" style="--c:' + cor + '"></span>' +
        '<div class="o-main">' +
          '<div class="o-name">' + o.nome + '</div>' +
          '<div class="o-meta">' + o.tipo.toUpperCase() + ' · INC ' + o.inc + '° · ' + o.risco.toUpperCase() + '</div>' +
        '</div>' +
        '<div class="o-alt">' + nf.format(o.alt) + '<small>KM</small></div>' +
      '</li>'
    );
  }).join('');
  objList.querySelectorAll('.obj-row').forEach(function (row) {
    function go() {
      const o = OBJETOS.find(function (x) { return x.nome === row.dataset.nome; });
      if (!o || !o._mesh.visible) return;
      selecionar(o); focarObjeto(o);
    }
    row.addEventListener('click', go);
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });
}
function focarObjeto(o) {
  const p = o._mesh.position;
  CAM.az = Math.atan2(p.x, p.z); autoRotacao = false; aplicarCamera();
}

/* =================================================================
   FILTROS POR CAMADA (inalterado)
   ================================================================= */
const ativos = { satelite: true, constelacao: true, detrito: true, risco: true };
function aplicarFiltros() {
  OBJETOS.forEach(function (o) {
    const vis = ativos[o.categoria];
    o._mesh.visible = vis; o._cauda.visible = vis;
  });
  grupoFundo.visible = ativos.detrito;
  atualizarContadores();
  if (selecionado && !ativos[selecionado.categoria]) selecionar(null);
}
document.getElementById('filterList').addEventListener('click', function (e) {
  const btn = e.target.closest('.filter'); if (!btn) return;
  const cat = btn.dataset.cat; ativos[cat] = !ativos[cat];
  btn.setAttribute('aria-pressed', ativos[cat] ? 'true' : 'false');
  btn.classList.toggle('active', ativos[cat]);
  aplicarFiltros();
});

/* =================================================================
   CONTADORES (inalterado)
   ================================================================= */
function atualizarContadores() {
  const cont = { satelite: 0, constelacao: 0, detrito: 0, risco: 0 };
  OBJETOS.forEach(function (o) { cont[o.categoria]++; });
  document.querySelectorAll('.f-count').forEach(function (el) {
    el.textContent = cont[el.dataset.count] || 0;
  });
  let visiveis = 0;
  OBJETOS.forEach(function (o) { if (o._mesh.visible) visiveis++; });
  document.getElementById('sceneCount').textContent =
    nf.format(visiveis + (grupoFundo.visible ? N_FUNDO : 0));
}

/* =================================================================
   RELÓGIO UTC + LEITURA DE CÂMERA/ZOOM (inalterado)
   ================================================================= */
const elUtc = document.getElementById('utcClock'), elLat = document.getElementById('camLat');
const elLon = document.getElementById('camLon'), elZoom = document.getElementById('camZoom');
function atualizarRelogio() {
  const d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
  elUtc.textContent = p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds());
}
setInterval(atualizarRelogio, 1000); atualizarRelogio();
function atualizarLeituraCamera() {
  const latDeg = 90 - (CAM.pol / Math.PI * 180);
  let lonDeg = (CAM.az / Math.PI * 180) % 360;
  if (lonDeg > 180) lonDeg -= 360; if (lonDeg < -180) lonDeg += 360;
  elLat.textContent = latDeg.toFixed(1); elLon.textContent = lonDeg.toFixed(1);
  elZoom.textContent = (CAM_R_DEFAULT / CAM.r).toFixed(2);
}

/* =================================================================
   RESIZE (atualiza renderer + composer)
   ================================================================= */
function aoRedimensionar() {
  const w = viewport.clientWidth, h = viewport.clientHeight;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  bloomComposer.setSize(w, h);
  finalComposer.setSize(w, h);
  bloom.setSize(w, h);
}
window.addEventListener('resize', aoRedimensionar);

/* =================================================================
   LAÇO DE ANIMAÇÃO
   ================================================================= */
const clock = new THREE.Clock();
const _tmp = new THREE.Vector3();
const _sun = new THREE.Vector3();

function animar() {
  requestAnimationFrame(animar);
  const t = clock.getElapsedTime();

  if (autoRotacao && !arrastando) { CAM.az += 0.0009; aplicarCamera(); }
  if (!REDUZIR_MOV) {
    grupoTerra.rotation.y += 0.0006;
    grupoFundo.rotation.y += 0.00035;
  }

  for (let i = 0; i < OBJETOS.length; i++) {
    const o = OBJETOS[i];
    if (!o._mesh.visible) continue;
    const theta = o._fase + o._omega * t;
    o._mesh.position.copy(posicaoOrbital(o, theta));

    // 5) Atualiza a cauda (pontos atrás da posição atual)
    const arr = o._cauda.geometry.attributes.position.array;
    for (let k = 0; k < N_CAUDA; k++) {
      _tmp.copy(posicaoOrbital(o, theta - k * PASSO_CAUDA));
      arr[k*3] = _tmp.x; arr[k*3+1] = _tmp.y; arr[k*3+2] = _tmp.z;
    }
    o._cauda.geometry.attributes.position.needsUpdate = true;

    // 4) Risco: pulso do halo + ping (anel expandindo)
    if (o.categoria === 'risco' && !REDUZIR_MOV) {
      const k = 0.5 + 0.5 * Math.sin(t * 4 + i);
      const s = o._glowBase * (1 + k * 0.6);
      o._glow.scale.set(s, s, s);
      const ph = (t * 0.55 + i * 0.27) % 1;            // 0..1 em loop
      const ps = 0.05 + ph * 0.42;
      o._ping.scale.set(ps, ps, ps);
      o._ping.material.opacity = (1 - ph) * 0.9;
    }

    // Seleção: halo maior no objeto escolhido
    if (o === selecionado) {
      const s = o._glowBase * 1.9;
      o._glow.scale.set(s, s, s);
    } else if (o.categoria !== 'risco') {
      o._glow.scale.set(o._glowBase, o._glowBase, o._glowBase);
    }
  }

  if (hover && hover._mesh.visible && tooltip.classList.contains('show')) {
    posicionarTooltip(hover);
  }

  atualizarLeituraCamera();
  renderizar();
}

/* =================================================================
   INICIALIZAÇÃO
   ================================================================= */
function iniciar() {
  montarLista();
  aplicarFiltros();
  aoRedimensionar();
  animar();
  const ov = document.getElementById('globeLoading');
  if (ov) { ov.classList.add('hidden'); setTimeout(function () { ov.remove(); }, 500); }
  window.__orbitaOK = true; // sinaliza ao fallback do HTML que tudo carregou
}
iniciar();
