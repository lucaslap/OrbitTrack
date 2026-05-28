# 🛰️ OrbitTrack

> **Conectando a Economia Espacial aos Desafios da Terra**  
> Global Solution 2026/1 — FIAP Engenharia de Software · 2º Ano · Turmas de Fevereiro

---

## 🌍 Sobre o Projeto

**OrbitTrack** é uma plataforma de monitoramento e análise de dados satelitais desenvolvida como solução para o desafio da **Indústria Espacial** proposto na Global Solution 2026/1 da FIAP.

A solução conecta infraestrutura espacial com problemas reais da sociedade, utilizando dados orbitais para apoiar decisões em áreas como **agronegócio**, **prevenção de desastres**, **monitoramento ambiental** e **conectividade em regiões remotas**.

---

## 🚀 Funcionalidades

- 📡 **Rastreamento de Satélites** — Monitoramento em tempo real de órbitas e cobertura
- 🌾 **Módulo Agro** — Análise de índices vegetativos e produtividade agrícola via imagens satelitais
- ⚠️ **Alerta de Desastres** — Sistema de detecção e notificação precoce de eventos climáticos extremos
- 🌿 **Monitoramento Ambiental** — Rastreamento de desmatamento e emissões de carbono
- 📊 **Dashboard de Dados** — Visualização de dados orbitais em larga escala

---

## 🛠️ Tecnologias Utilizadas

### Back-end
- **Java** com Programação Orientada a Objetos (POO)
- Arquitetura em camadas: Entidades · Serviços · Menu/Console

### Banco de Dados
- Modelagem Relacional (Diagrama ER)
- Scripts SQL com `CREATE TABLE`

### Front-end
- **HTML5 + CSS3 + JavaScript** (vanilla)
- Interface responsiva · Dados simulados via arrays JS

---

## 📁 Estrutura do Projeto

```
OrbitTrack/
├── java/
│   ├── src/
│   │   ├── model/          # Entidades (Satellite, Alert, Region...)
│   │   ├── service/        # Lógica de negócio
│   │   └── Main.java       # Menu console
│   └── diagrama-classes.png
│
├── database/
│   ├── schema.sql          # Scripts CREATE TABLE
│   └── diagrama-er.png     # Diagrama Entidade-Relacionamento
│
├── web/
│   ├── index.html          # Página inicial / Dashboard
│   ├── monitoramento.html  # Tela de monitoramento satelital
│   ├── alertas.html        # Central de alertas
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
│
└── README.md
```

---

## 🗄️ Banco de Dados

O modelo relacional conta com no mínimo **3 tabelas com relacionamentos**, representando as entidades centrais da plataforma:

| Tabela | Descrição |
|---|---|
| `SATELITE` | Dados dos satélites monitorados |
| `REGIAO` | Regiões geográficas cobertas |
| `ALERTA` | Ocorrências e alertas gerados |
| `LEITURA` | Dados coletados por satélite/região |

---

## ☕ Java — Sistema Console (POO)

O sistema Java simula o back-end da plataforma via console interativo com as seguintes operações:

- ✅ Cadastro de satélites e regiões
- 🔍 Busca por ID ou nome
- 📋 Listagem completa
- ✏️ Atualização de registros
- 📤 Geração de alertas simulados

### Diagrama de Classes (UML)

> Ver arquivo `java/diagrama-classes.png`

---

## 🌐 Front-end Web

O protótipo web conta com **3 páginas/telas** responsivas:

1. **`index.html`** — Dashboard principal com visão geral dos dados
2. **`monitoramento.html`** — Mapa de cobertura e rastreamento de satélites
3. **`alertas.html`** — Central de alertas com histórico e filtros

> Dados simulados com arrays JavaScript para demonstrar a interatividade da interface.

---

## 🎬 Vídeo Pitch

> 📹 [Assistir ao Vídeo Pitch](#)  
> *(Substituir pelo link do YouTube / Google Drive / Vimeo após upload)*

---

## 👥 Equipe

| Nome | RM |
|---|---|
| Integrante 1 | RM000000 |
| Integrante 2 | RM000000 |
| Integrante 3 | RM000000 |
| Integrante 4 | RM000000 |
| Integrante 5 | RM000000 |

---

## 📅 Cronograma

| Data | Evento |
|---|---|
| 25/05/2026 | Live de Abertura |
| 25/05/2026 | Conteúdo disponibilizado |
| 09/06/2026 até 23h55 | **Prazo de entrega na plataforma** |

---

## 🌐 Conexão com os ODS da ONU

Este projeto contribui diretamente para os seguintes Objetivos de Desenvolvimento Sustentável:

- 🟠 **ODS 9** — Indústria, Inovação e Infraestrutura
- 🟡 **ODS 11** — Cidades e Comunidades Sustentáveis
- 🟢 **ODS 13** — Ação Contra a Mudança Global do Clima
- 🟡 **ODS 2** — Fome Zero e Agricultura Sustentável
- 🔴 **ODS 8** — Trabalho Decente e Crescimento Econômico

---

## 📦 Como Executar

### Java (Console)

```bash
# Compilar
javac -d bin src/**/*.java

# Executar
java -cp bin Main
```

### Web

```bash
# Abrir diretamente no navegador
open web/index.html

# Ou com live-server (se instalado)
npx live-server web/
```

### Banco de Dados

```bash
# Oracle / MySQL — executar o script de criação
@database/schema.sql
```

---

## 📌 Observações

- O projeto foi desenvolvido utilizando **apenas conteúdos ministrados até a Fase 4**.
- A integração entre Java, banco de dados e front-end é **simulada** — cada parte funciona de forma independente para demonstrar a lógica e a interface.
- O arquivo `.zip` de entrega contém este README, o arquivo `integrantes.txt` com RM e nomes, e todos os artefatos do projeto.

---

> *"Quando ideias ganham propósito, elas têm o poder de transformar realidades."*  
> — FIAP Global Solution 2026/1
