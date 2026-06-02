# 🛰️ OrbitTrack

> **Observatório de Detritos Orbitais — SDO**  
> Global Solution 2026/1 — FIAP Engenharia de Software · 2º Ano · Turmas de Fevereiro

---

## 🌍 Sobre o Projeto

**OrbitTrack** é uma plataforma web de monitoramento e catalogação de detritos espaciais desenvolvida como solução para o desafio da **Indústria Espacial** proposto na Global Solution 2026/1 da FIAP.

Mais de **1,2 milhão de fragmentos** circulam ao redor da Terra a velocidades superiores a 28.000 km/h. Cada um representa um risco real para satélites operacionais. O OrbitTrack cataloga, monitora e exibe alertas de conjunção para apoiar a segurança operacional em órbita.

---

## 🚀 Funcionalidades

- 📡 **Rastreamento em Tempo Real** — Monitoramento contínuo de objetos em órbita LEO, MEO e GEO com telemetria a cada 90 segundos
- ⚠️ **Alertas de Colisão** — Cálculo preditivo de conjunções com janela de aviso de 72 horas
- 📋 **Catalogação Orbital** — Registro de objetos com altitude, inclinação, agência de origem e nível de risco
- 🗂️ **Centro de Controle** — Dashboard com métricas, tabela filtrável e status em tempo real
- 🌐 **Mapa Orbital 3D** — Visualizador interativo com globo Three.js, rastros de órbita, filtros por camada e tooltips de telemetria

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 + CSS3 + JavaScript** (vanilla, sem frameworks ou dependências)
- **Google Fonts** — Exo 2 e Share Tech Mono (via CDN)
- **Bootstrap Icons 1.11.3** (via CDN)
- **Three.js 0.160.0** (via CDN, ES modules) — renderização 3D do mapa orbital com bloom seletivo por `EffectComposer`

Não há backend, banco de dados, bundler ou gerenciador de pacotes. O projeto roda diretamente no navegador.

---

## 📁 Estrutura do Projeto

```
OrbitTrack/
├── index.html          # Landing page — contador animado, hero, cards de capacidades
├── dashboard.html      # Centro de Controle — métricas, tabela filtrável, relógio UTC
├── cadastro.html       # Formulário de registro — validação, lista da sessão, toast
├── orbita.html         # Mapa Orbital 3D — globo Three.js, filtros, tooltips, alertas
├── css/
│   ├── shared.css      # Reset e estilos base comuns
│   ├── index.css       # Estilos da landing page
│   ├── dashboard.css   # Estilos do centro de controle
│   ├── cadastro.css    # Estilos do formulário de cadastro
│   └── orbita.css      # Estilos do mapa orbital 3D
└── js/
    ├── index.js        # Contador animado e relógio de telemetria
    ├── dashboard.js    # Dados orbitais, filtros e relógio UTC
    ├── cadastro.js     # Validação, geração de ID e lista de sessão
    └── orbita.js       # Cena Three.js, mecânica orbital, bloom, interação
```

---

## 🌐 Como Executar

> **Importante:** a página `orbita.html` usa ES modules e import maps. Abrir via `file://` bloqueia o carregamento do Three.js — use um servidor local.

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Acesse `http://localhost:8080` e navegue pelas quatro páginas.

---

## 🗂️ Páginas

| Página | Descrição |
|---|---|
| `index.html` | Landing page com contador de detritos e apresentação dos módulos |
| `dashboard.html` | Centro de controle com tabela de objetos orbitais e filtros por tipo, status e busca |
| `cadastro.html` | Formulário para registrar novos objetos com validação e log da sessão atual |
| `orbita.html` | Mapa orbital 3D interativo — arraste para rotacionar, scroll para zoom, clique para rastrear |

---

## 🎬 Vídeo Pitch

> 📹 [Assistir ao Vídeo Pitch](#)  
> *(Substituir pelo link após upload)*

---
