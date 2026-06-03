-- ============================================================
--  OrbitTrack — Script de Criação do Banco de Dados
--  Global Solution 2026/1 · FIAP Engenharia de Software
--  SGBD: Oracle (compatível com Oracle 19c+)
--
--  Este script reflete fielmente o que o protótipo captura:
--    - cadastro.html  → formulário de objetos orbitais
--    - dashboard.js   → catálogo e métricas
--  Domínios (status, risco, tipo) seguem exatamente os valores
--  oferecidos nas telas do sistema.
-- ============================================================

-- ------------------------------------------------------------
-- Limpeza — remove as tabelas se já existirem (ordem segura)
-- ------------------------------------------------------------
BEGIN
    FOR t IN (
        SELECT table_name FROM user_tables
        WHERE table_name IN (
            'ALERTA','OBJETO_ORBITAL','SESSAO_CADASTRO',
            'OPERADOR','AGENCIA','TIPO_OBJETO'
        )
    ) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
    END LOOP;
END;
/

-- ============================================================
--  1. TIPO_OBJETO
--     Classifica o objeto orbital. Os valores correspondem
--     exatamente ao dropdown do cadastro: Satélite, Detrito,
--     Foguete.
-- ============================================================
CREATE TABLE TIPO_OBJETO (
    id_tipo     NUMBER(3)       NOT NULL,
    descricao   VARCHAR2(30)    NOT NULL,
    CONSTRAINT pk_tipo_objeto PRIMARY KEY (id_tipo),
    CONSTRAINT uq_tipo_descricao UNIQUE (descricao),
    CONSTRAINT ck_tipo_descricao CHECK (
        descricao IN ('Satélite', 'Detrito', 'Foguete')
    )
);

-- ============================================================
--  2. AGENCIA
--     Agência ou país de origem do objeto. No formulário esse
--     dado é digitado livremente (campo "País / Agência"), mas
--     normalizá-lo em tabela evita repetição e padroniza siglas
--     como NASA, ESA, INPE, CNSA.
-- ============================================================
CREATE TABLE AGENCIA (
    id_agencia  NUMBER(5)       NOT NULL,
    sigla       VARCHAR2(15)    NOT NULL,
    nome        VARCHAR2(100)   NOT NULL,
    pais        VARCHAR2(60)    NOT NULL,
    CONSTRAINT pk_agencia PRIMARY KEY (id_agencia),
    CONSTRAINT uq_agencia_sigla UNIQUE (sigla)
);

-- ============================================================
--  3. OPERADOR
--     Usuário que opera o sistema. O dashboard exibe o operador
--     logado (ex.: "C. Andrade · Operador Nível 2") e a estação
--     de controle (ex.: SP-01). nivel_acesso reflete os níveis
--     mostrados na interface.
-- ============================================================
CREATE TABLE OPERADOR (
    id_operador  NUMBER(5)      NOT NULL,
    nome         VARCHAR2(80)   NOT NULL,
    nivel_acesso NUMBER(1)      NOT NULL,   -- 1, 2 ou 3
    estacao      VARCHAR2(15)   NOT NULL,   -- ex.: SP-01, RJ-02
    CONSTRAINT pk_operador PRIMARY KEY (id_operador),
    CONSTRAINT ck_operador_nivel CHECK (nivel_acesso IN (1, 2, 3))
);

-- ============================================================
--  4. SESSAO_CADASTRO
--     Cada sessão de trabalho aberta por um operador. O cadastro
--     exibe "SESSÃO ATIVA" com um ID e agrupa os objetos
--     registrados naquela sessão (a "lista da sessão" da tela).
-- ============================================================
CREATE TABLE SESSAO_CADASTRO (
    id_sessao    NUMBER(10)     NOT NULL,
    id_operador  NUMBER(5)      NOT NULL,   -- FK -> OPERADOR
    iniciada_em  TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
    encerrada_em TIMESTAMP,                 -- NULL enquanto ativa
    CONSTRAINT pk_sessao_cadastro PRIMARY KEY (id_sessao),
    CONSTRAINT fk_sessao_operador FOREIGN KEY (id_operador)
        REFERENCES OPERADOR (id_operador),
    CONSTRAINT ck_sessao_datas CHECK (
        encerrada_em IS NULL OR encerrada_em >= iniciada_em
    )
);

-- ============================================================
--  5. OBJETO_ORBITAL
--     Catálogo central. Os campos espelham o formulário de
--     cadastro (nome, tipo, agência, altitude, inclinação,
--     status, risco) e a tabela do dashboard.
--
--     Domínios alinhados às telas:
--       status: Ativo, Inativo, Crítico, Desconhecido
--               (Crítico vem do dashboard; Desconhecido, do form)
--       risco:  Baixo, Médio, Alto, Crítico
--       altitude: 160 a 35786 km (faixa LEO->GEO validada no JS)
--       inclinação: 0 a 180 graus
-- ============================================================
CREATE TABLE OBJETO_ORBITAL (
    id_objeto         NUMBER(10)    NOT NULL,
    codigo_catalogo   VARCHAR2(12)  NOT NULL,   -- código legível: SAT-NNN / DEB-NNN / ROC-NNN
    nome              VARCHAR2(80)  NOT NULL,
    id_tipo           NUMBER(3)     NOT NULL,   -- FK -> TIPO_OBJETO
    id_agencia        NUMBER(5)     NOT NULL,   -- FK -> AGENCIA
    id_sessao         NUMBER(10)    NOT NULL,   -- FK -> SESSAO_CADASTRO
    altitude_km       NUMBER(7,2)   NOT NULL,
    inclinacao_graus  NUMBER(5,2)   NOT NULL,
    status            VARCHAR2(15)  NOT NULL,
    nivel_risco       VARCHAR2(10)  NOT NULL,
    data_cadastro     TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_objeto_orbital PRIMARY KEY (id_objeto),
    CONSTRAINT uq_objeto_codigo UNIQUE (codigo_catalogo),
    CONSTRAINT ck_objeto_codigo CHECK (
        REGEXP_LIKE(codigo_catalogo, '^(SAT|DEB|ROC)-[0-9]{3}$')
    ),
    CONSTRAINT fk_objeto_tipo FOREIGN KEY (id_tipo)
        REFERENCES TIPO_OBJETO (id_tipo),
    CONSTRAINT fk_objeto_agencia FOREIGN KEY (id_agencia)
        REFERENCES AGENCIA (id_agencia),
    CONSTRAINT fk_objeto_sessao FOREIGN KEY (id_sessao)
        REFERENCES SESSAO_CADASTRO (id_sessao),
    CONSTRAINT ck_objeto_status CHECK (
        status IN ('Ativo', 'Inativo', 'Crítico', 'Desconhecido')
    ),
    CONSTRAINT ck_objeto_risco CHECK (
        nivel_risco IN ('Baixo', 'Médio', 'Alto', 'Crítico')
    ),
    CONSTRAINT ck_objeto_altitude CHECK (
        altitude_km BETWEEN 160 AND 35786
    ),
    CONSTRAINT ck_objeto_inclinacao CHECK (
        inclinacao_graus BETWEEN 0 AND 180
    )
);

-- ============================================================
--  6. ALERTA
--     Alerta de conjunção entre dois objetos orbitais. Suporta
--     o módulo "Alertas de Colisão" e o contador de alertas
--     ativos do dashboard. As duas FKs para OBJETO_ORBITAL têm
--     constraints nomeadas distintas (primário / secundário).
--
--     probabilidade: 0 a 1 (ex.: 0.000125 = 1:8000)
--     severidade alinhada ao nível de risco das telas.
-- ============================================================
CREATE TABLE ALERTA (
    id_alerta             NUMBER(10)    NOT NULL,
    id_objeto_primario    NUMBER(10)    NOT NULL,   -- FK -> OBJETO_ORBITAL
    id_objeto_secundario  NUMBER(10)    NOT NULL,   -- FK -> OBJETO_ORBITAL
    id_operador           NUMBER(5)     NOT NULL,   -- FK -> OPERADOR (trata)
    probabilidade         NUMBER(10,8)  NOT NULL,
    janela_conjuncao      TIMESTAMP     NOT NULL,
    gerado_em             TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    severidade            VARCHAR2(10)  NOT NULL,
    situacao              VARCHAR2(15)  NOT NULL,
    CONSTRAINT pk_alerta PRIMARY KEY (id_alerta),
    CONSTRAINT fk_alerta_obj_primario FOREIGN KEY (id_objeto_primario)
        REFERENCES OBJETO_ORBITAL (id_objeto),
    CONSTRAINT fk_alerta_obj_secundario FOREIGN KEY (id_objeto_secundario)
        REFERENCES OBJETO_ORBITAL (id_objeto),
    CONSTRAINT fk_alerta_operador FOREIGN KEY (id_operador)
        REFERENCES OPERADOR (id_operador),
    CONSTRAINT ck_alerta_objetos_distintos CHECK (
        id_objeto_primario <> id_objeto_secundario
    ),
    CONSTRAINT ck_alerta_probabilidade CHECK (
        probabilidade BETWEEN 0 AND 1
    ),
    CONSTRAINT ck_alerta_severidade CHECK (
        severidade IN ('Baixo', 'Médio', 'Alto', 'Crítico')
    ),
    CONSTRAINT ck_alerta_situacao CHECK (
        situacao IN ('Aberto', 'Monitorando', 'Encerrado')
    )
);

-- ============================================================
--  Índices auxiliares — para as consultas frequentes das telas
-- ============================================================
-- Dashboard filtra por tipo, status e busca
CREATE INDEX idx_objeto_status  ON OBJETO_ORBITAL (status);
CREATE INDEX idx_objeto_risco   ON OBJETO_ORBITAL (nivel_risco);
CREATE INDEX idx_objeto_tipo    ON OBJETO_ORBITAL (id_tipo);
-- Listar objetos de uma sessão (lista da tela de cadastro)
CREATE INDEX idx_objeto_sessao  ON OBJETO_ORBITAL (id_sessao);
-- Contador de alertas ativos / das últimas 24h
CREATE INDEX idx_alerta_situacao ON ALERTA (situacao);
CREATE INDEX idx_alerta_gerado   ON ALERTA (gerado_em);

-- ============================================================
--  Dados de exemplo
--  (espelham os 8 objetos do dashboard.js)
-- ============================================================

-- Tipos de objeto (exatamente os 3 do formulário)
INSERT INTO TIPO_OBJETO (id_tipo, descricao) VALUES (1, 'Satélite');
INSERT INTO TIPO_OBJETO (id_tipo, descricao) VALUES (2, 'Detrito');
INSERT INTO TIPO_OBJETO (id_tipo, descricao) VALUES (3, 'Foguete');

-- Agências / origens
INSERT INTO AGENCIA VALUES (1, 'NASA',   'National Aeronautics and Space Administration', 'EUA');
INSERT INTO AGENCIA VALUES (2, 'ESA',    'European Space Agency',                         'Europa');
INSERT INTO AGENCIA VALUES (3, 'INPE',   'Instituto Nacional de Pesquisas Espaciais',     'Brasil');
INSERT INTO AGENCIA VALUES (4, 'CNSA',   'China National Space Administration',           'China');
INSERT INTO AGENCIA VALUES (5, 'SpaceX', 'Space Exploration Technologies Corp.',          'EUA');
INSERT INTO AGENCIA VALUES (6, 'Roscosmos', 'Agência Espacial Federal Russa',             'Rússia');

-- Operadores (como exibido no dashboard)
INSERT INTO OPERADOR VALUES (1, 'C. Andrade',  2, 'SP-01');
INSERT INTO OPERADOR VALUES (2, 'L. Ferreira', 3, 'RJ-02');
INSERT INTO OPERADOR VALUES (3, 'M. Santos',   1, 'SP-01');

-- Sessões de cadastro
INSERT INTO SESSAO_CADASTRO VALUES (1, 1, TIMESTAMP '2026-05-29 08:00:00', TIMESTAMP '2026-05-29 12:00:00');
INSERT INTO SESSAO_CADASTRO VALUES (2, 2, TIMESTAMP '2026-05-29 13:00:00', NULL);

-- Objetos orbitais (os 8 registros do dashboard.js)
INSERT INTO OBJETO_ORBITAL VALUES (1, 'SAT-001', 'Starlink-2891',         1, 5, 1,   550.00, 53.00, 'Ativo',   'Baixo',   TIMESTAMP '2026-05-01 10:00:00');
INSERT INTO OBJETO_ORBITAL VALUES (2, 'DEB-047', 'Fragmento Fengyun',     2, 4, 1,   850.00, 98.00, 'Inativo', 'Crítico', TIMESTAMP '2026-05-01 10:05:00');
INSERT INTO OBJETO_ORBITAL VALUES (3, 'SAT-014', 'Amazonas-Nexus 1',      1, 3, 1, 35786.00,  0.00, 'Ativo',   'Baixo',   TIMESTAMP '2026-05-01 10:10:00');
INSERT INTO OBJETO_ORBITAL VALUES (4, 'DEB-112', 'Painel Solar Mir',      2, 6, 1,   410.00, 51.00, 'Crítico', 'Crítico', TIMESTAMP '2026-05-01 10:15:00');
INSERT INTO OBJETO_ORBITAL VALUES (5, 'ROC-009', 'Estágio Longa Marcha 5B', 3, 4, 1, 220.00, 41.00, 'Crítico', 'Alto',   TIMESTAMP '2026-05-01 10:20:00');
INSERT INTO OBJETO_ORBITAL VALUES (6, 'SAT-203', 'CBERS-04A',             1, 3, 2,   628.00, 97.90, 'Ativo',   'Baixo',   TIMESTAMP '2026-05-02 09:00:00');
INSERT INTO OBJETO_ORBITAL VALUES (7, 'DEB-088', 'Cosmos-1408 frag.',     2, 6, 2,   480.00, 82.60, 'Inativo', 'Médio',   TIMESTAMP '2026-05-02 09:05:00');
INSERT INTO OBJETO_ORBITAL VALUES (8, 'SAT-077', 'Sentinel-2B',           1, 2, 2,   786.00, 98.60, 'Ativo',   'Baixo',   TIMESTAMP '2026-05-02 09:10:00');

-- Alertas de conjunção
INSERT INTO ALERTA VALUES (1, 2, 7, 1, 0.00012500, TIMESTAMP '2026-05-31 14:22:00', TIMESTAMP '2026-05-29 08:00:00', 'Alto',    'Monitorando');
INSERT INTO ALERTA VALUES (2, 4, 5, 1, 0.00031000, TIMESTAMP '2026-05-30 03:47:00', TIMESTAMP '2026-05-29 08:05:00', 'Crítico', 'Aberto');
INSERT INTO ALERTA VALUES (3, 2, 4, 2, 0.00008200, TIMESTAMP '2026-06-01 22:10:00', TIMESTAMP '2026-05-29 09:00:00', 'Médio',   'Aberto');

COMMIT;
