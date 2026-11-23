-- Cole este código no SQL Editor do seu projeto Supabase e clique em RUN

CREATE TABLE IF NOT EXISTS malharias (
    id SERIAL PRIMARY KEY,
    cnpj TEXT NOT NULL UNIQUE,
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT NOT NULL,
    cep TEXT,
    logradouro TEXT,
    numero TEXT,
    bairro TEXT,
    uf TEXT,
    cidade TEXT,
    cnpj_status TEXT NOT NULL DEFAULT 'pendente',
    cnpj_situacao TEXT,
    cnpj_verificado_em TIMESTAMPTZ,
    vagas_por_turno INTEGER NOT NULL DEFAULT 10,
    meta_perda REAL NOT NULL DEFAULT 3.0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    auth_uid UUID UNIQUE,
    email TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    papel TEXT NOT NULL CHECK (papel IN ('funcionario','supervisor')),
    malharia_id INTEGER NOT NULL REFERENCES malharias(id),
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','pendente','bloqueado')),
    turno TEXT NOT NULL DEFAULT 'manha' CHECK (turno IN ('manha','tarde','noite')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ponto (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dia TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada','saida_almoco','volta_almoco','saida')),
    ts TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS solicitacoes_turno (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    turno TEXT NOT NULL CHECK (turno IN ('manha','tarde','noite')),
    a_partir_de TEXT NOT NULL,
    inicio_previsto TEXT NOT NULL,
    observacao TEXT,
    status TEXT NOT NULL DEFAULT 'em_analise' CHECK (status IN ('em_analise','aprovado','recusado')),
    aplicado INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maquinas (
    id SERIAL PRIMARY KEY,
    malharia_id INTEGER NOT NULL REFERENCES malharias(id),
    apelido TEXT NOT NULL,
    marca TEXT,
    modelo TEXT,
    galga TEXT,
    ano INTEGER,
    ultima_manutencao TEXT,
    setor TEXT NOT NULL DEFAULT 'A',
    status TEXT NOT NULL DEFAULT 'disponivel',
    aviso TEXT
);

CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    malharia_id INTEGER NOT NULL REFERENCES malharias(id),
    codigo TEXT NOT NULL,
    maquina_id INTEGER REFERENCES maquinas(id),
    operador_id INTEGER REFERENCES users(id),
    modelo TEXT NOT NULL,
    cor TEXT,
    cor_hex TEXT,
    meta INTEGER NOT NULL,
    produzido INTEGER NOT NULL DEFAULT 0,
    avariadas INTEGER NOT NULL DEFAULT 0,
    prazo TEXT,
    iniciado_em TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto','andamento','pausado','finalizado')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ocorrencias (
    id SERIAL PRIMARY KEY,
    malharia_id INTEGER NOT NULL REFERENCES malharias(id),
    maquina_id INTEGER NOT NULL REFERENCES maquinas(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    motivo TEXT NOT NULL,
    pecas_avariadas INTEGER NOT NULL DEFAULT 0,
    observacao TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manutencoes (
    id SERIAL PRIMARY KEY,
    maquina_id INTEGER NOT NULL REFERENCES maquinas(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS estoque (
    id SERIAL PRIMARY KEY,
    malharia_id INTEGER NOT NULL REFERENCES malharias(id),
    marca TEXT,
    modelo TEXT,
    cor TEXT,
    cor_hex TEXT,
    codigo_cor TEXT,
    lote TEXT,
    fornecedor TEXT,
    saldo_kg REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'recebido' CHECK (status IN ('recebido','em_andamento','atrasado')),
    registrado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS candidaturas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    malharia_destino_id INTEGER NOT NULL REFERENCES malharias(id),
    funcao TEXT NOT NULL CHECK (funcao IN ('costureira','passadeira','malharia_parceira')),
    capacidade_diaria INTEGER NOT NULL,
    valor_peca REAL NOT NULL,
    equipamentos TEXT NOT NULL DEFAULT '',
    observacao TEXT,
    status TEXT NOT NULL DEFAULT 'em_analise' CHECK (status IN ('em_analise','aprovado','vinculo_ativo','recusado')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, malharia_destino_id, funcao)
);

CREATE TABLE IF NOT EXISTS relatorios_entrega (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    malharia_destino_id INTEGER NOT NULL REFERENCES malharias(id),
    lote TEXT NOT NULL,
    pecas INTEGER NOT NULL,
    avariadas INTEGER NOT NULL DEFAULT 0,
    previsao TEXT,
    observacao TEXT,
    status TEXT NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando','conferido')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    lida INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_log (
    malharia_id INTEGER PRIMARY KEY REFERENCES malharias(id),
    ultima_em TIMESTAMPTZ NOT NULL,
    detalhe TEXT
);

-- Desativa RLS temporariamente para facilitar acesso direto do front-end
ALTER TABLE malharias DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE ponto DISABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_turno DISABLE ROW LEVEL SECURITY;
ALTER TABLE maquinas DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias DISABLE ROW LEVEL SECURITY;
ALTER TABLE manutencoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE estoque DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidaturas DISABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_entrega DISABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log DISABLE ROW LEVEL SECURITY;
