# KnittingNet — Sistema de Gestão para Malharias

Plataforma web (ERP) desenvolvida para conectar precificação, pedidos, chão de fábrica, estoque de insumos e terceirização em malharias.

## Funcionalidades Principais
- Landing Page Institucional: Apresentação do sistema e fluxo de onboarding.
- Autenticação & Validação: Cadastro de malharias com consulta automática de CNPJ (Receita Federal / BrasilAPI) e CEP (ViaCEP).
- Painel da Supervisão: Visão geral de KPIs, monitoramento de máquinas em tempo real, análise de perdas/avarias, controle de estoque de fios e gestão de terceirizados.
- Portal do Colaborador: Ponto eletrônico digital, calendário de frequência, preferência/troca de turnos e apontamento de produção por máquina.
- Personalização: Suporte a Tema Claro/Escuro e internacionalização (PT, EN, ES).

## Tecnologias Utilizadas
- Front-End:HTML5, CSS3 (Grid, Flexbox, Variáveis CSS) e JavaScript Vanilla (SPA baseada em Hash Routing).
- Back-End / Banco de Dados: Supabase (Auth e PostgreSQL).
- APIs Externas:BrasilAPI / CNPJ.ws e ViaCEP.
