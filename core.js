/* KnittingNet — núcleo: utilidades, API (Supabase + Receita Federal), roteador, páginas públicas e estrutura (shell). */
'use strict';

/* ---------- Atualização Dinâmica do Favicon (Cache Busting + Contraste) ---------- */
(function atualizarFavicon() {
  const FAVICON_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='11' fill='%23FFFFFF'/%3E%3Cg fill='none' stroke='%231e2749' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='24' cy='24' r='11.5'/%3E%3Cpath d='M15.5 17.5c5.5-2.5 12-1 16.5 3.5'/%3E%3Cpath d='M13.5 22.5c6.5-2.5 14-0.5 19.5 4.5'/%3E%3Cpath d='M14.5 28c6-2 12.5-0.5 17.5 3.5'/%3E%3Cpath d='M21 13c-3 5.5-3 12 0 18'/%3E%3Cpath d='M27.5 13.5c-3 5.5-3 12 0 18'/%3E%3Cellipse cx='24' cy='24' rx='20.5' ry='7.2' transform='rotate(-32 24 24)' stroke-width='2.4'/%3E%3Cpath d='M35 31.5c3.5 1.5 6.5 1 8.5-1.2' stroke-width='2.3'/%3E%3C/g%3E%3C/svg%3E?v=2";
  const existentes = document.querySelectorAll("link[rel*='icon']");
  if (existentes.length) {
    existentes.forEach(el => {
      if (el.type === 'image/svg+xml' || !el.type) {
        el.type = 'image/svg+xml';
        el.href = FAVICON_SVG;
      }
    });
  } else {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = FAVICON_SVG;
    document.head.appendChild(link);
  }
})();

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>', chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>', cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6M17 4a3.5 3.5 0 010 7M22 20c0-3-2-5-5-5.7"/>', bell: '<path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 004 0"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h0a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v0a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', cal: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  check: '<path d="M5 12l5 5 10-11"/>', upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>', file: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', in: '<path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>', out: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>', sunrise: '<path d="M17 18a5 5 0 00-10 0M12 2v7M4 11l1.5 1.5M20 11l-1.5 1.5M1 18h22M8 6l4-4 4 4"/>', moon: '<path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z"/>',
  alert: '<path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01"/>', wrench: '<path d="M14.7 6.3a4 4 0 005 5L21 13l-8 8-3-3 8-8zM3 21l5-5"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>', expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', right: '<path d="M9 6l6 6-6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', gauge: '<path d="M12 14l4-5"/><path d="M3 18a9 9 0 1118 0"/>', eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  tag: '<path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/>', pause: '<path d="M8 5v14M16 5v14"/>', play: '<path d="M6 4l14 8-14 8z"/>', trend: '<path d="M3 3v18h18M7 14l4-4 3 3 5-6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
};
const ic = (n, extra = '') => `<svg class="i ${extra}" viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;

/* Nova Logo Oficial KnittingNet (Novelo de lã circular + anel orbital diagonal em container branco 36x36) */
const LOGO = `
<span class="logo-mark" aria-hidden="true">
  <svg viewBox="0 0 48 48" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="24" cy="24" r="11.5"/>
    <path d="M15.5 17.5c5.5-2.5 12-1 16.5 3.5"/>
    <path d="M13.5 22.5c6.5-2.5 14-0.5 19.5 4.5"/>
    <path d="M14.5 28c6-2 12.5-0.5 17.5 3.5"/>
    <path d="M21 13c-3 5.5-3 12 0 18"/>
    <path d="M27.5 13.5c-3 5.5-3 12 0 18"/>
    <ellipse cx="24" cy="24" rx="20.5" ry="7.2" transform="rotate(-32 24 24)" stroke-width="2.3"/>
    <path d="M35 31.5c3.5 1.5 6.5 1 8.5-1.2" stroke-width="2.2"/>
  </svg>
</span>`;

/* ---------- Preferências do Usuário, Tema Escuro e Idioma (i18n Global) ---------- */
const PREFS_KEY = 'kn_user_prefs';
const ACCOUNTS_KEY = 'kn_saved_accounts';

const I18N_DICT = {
  pt: {
    nav_inicio: 'Início', nav_producao: 'Produção', nav_estoque: 'Estoque',
    nav_maquinas: 'Máquinas', nav_terceirizacao: 'Terceirização',
    nav_ponto: 'Ponto Eletrônico', nav_turnos: 'Preferência de turnos',
    portal_sup: 'Painel de Produção', portal_func: 'Portal do Colaborador',
    role_sup: 'Supervisora', role_func: 'Funcionário(a)',
    turno_lbl: 'Turno', turno_manha: 'manhã', turno_tarde: 'tarde', turno_noite: 'noite',
    atualizado_agora: 'Atualizado agora', sincronizado_em: 'Sincronizado',
    dados_sync: 'Dados sincronizados às',
    st_ativo: 'Ativo', st_em_turno: 'Em turno', st_produzindo: 'Produzindo',
    st_disponivel: 'Disponível', st_pausada: 'Pausada', st_erro: 'Erro',
    st_parada: 'Parada', st_finalizada: 'Finalizada', st_atrasado: 'Atrasado',
    st_pendente: 'Aguardando aprovação', st_bloqueado: 'Bloqueado',
    st_critica: 'Crítica', st_atencao: 'Atenção',

    pp_alterar_perfil: 'Alterar perfil',
    pp_trocar_conta: 'Trocar de conta',
    pp_add_conta: 'Adicionar outra conta / Voltar para o login',
    pp_sair_perfil: 'Sair do perfil',
    pp_trocado_ok: 'Conta alternada para {nome}',
    pp_sessao_encerrada: 'Sessão encerrada com segurança.',

    visao_geral: 'Visão Geral', nova_op: 'Nova OP', ver_mais: 'Ver mais',
    ped_em_prod: 'Pedidos em produção', abertos_hoje: '+{n} abertos hoje',
    perdas: 'Perdas', acima_meta: 'acima', abaixo_meta: 'abaixo', da_meta: 'da meta',
    ops_ativas: 'Operações Ativas', da_meta_turno: '{n}% da meta do turno', prod_meta: 'Produção/Meta',
    status: 'Status', maquinas_fabrica: 'Máquinas da fábrica', qtd_maquinas: '{n} máquinas',
    ver_todas_maqs: 'Ver todas as máquinas', nenhuma_maq: 'Nenhuma máquina.',
    nenhum_ped: 'Nenhum pedido encontrado.', exibindo_peds: 'Exibindo {n} pedido(s) · atualize a página para recarregar',
    busca_maq_mod: 'Buscar máquina, modelo…', flt_todos: 'Todos', flt_andamento: 'Em andamento', flt_atrasados: 'Atrasados',

    th_maquina: 'Máquina', th_modelo: 'Modelo', th_cor: 'Cor', th_operador: 'Operador',
    th_meta: 'Meta', th_producao: 'Produção', th_progresso: 'Progresso', th_tempo: 'Tempo',
    th_nome: 'Nome', th_email: 'E-mail', th_turno: 'Turno', th_status: 'Status', th_acoes: 'Ações',
    th_marca: 'Marca', th_cod_cor: 'Código da cor', th_lote: 'Lote', th_fornecedor: 'Fornecedor',
    th_saldo: 'Saldo', th_data_reg: 'Data/Registro', th_apelidos: 'Apelidos', th_galga: 'Galga',
    th_ano: 'Ano', th_ult_manut: 'Última manutenção', th_historico: 'Histórico',
    th_qtd_env: 'Quantidade de peças enviadas', th_val_un: 'Valor por unidade',

    prod_atuando: 'Produtor atuando', qtd_funcs: '{n} funcionário(s)', ninguem_ponto: 'Ninguém com ponto aberto agora.',
    ver_todos_funcs: 'Ver todos os funcionários', maqs_usadas: 'Máquinas sendo usadas',
    turnos: 'Turnos', turnos_sub: 'Manhã · Tarde · Noite', turno_da: 'Turno da {t}',
    funcs_atribuidos: '{n} funcionário(s) atribuído(s)', ninguem_atribuido: 'Ninguém atribuído.',
    sol_troca: 'Solicitações de troca ({n})', aprovar: 'Aprovar', recusar: 'Recusar',
    funcionarios: 'Funcionários', reativar: 'Reativar', bloquear: 'Bloquear',
    nenhum_func: 'Nenhum funcionário cadastrado ainda.',
    novo_lote: 'Novo lote', busca_lote: 'Buscar marca, lote, cor…', nada_encontrado: 'Nada encontrado.',
    nova_maq: 'Nova máquina', setor: 'Setor', nenhuma_maq_enc: 'Nenhuma máquina encontrada.',
    terc_titulo: 'Terceirização de serviços', costureira: 'Costureira', passadeira: 'Passadeira',
    malharia_parceira: 'Malharia Parceira', busca_terc: 'Buscar nome, quantidade…',
    nenhum_vinculo: 'Nenhum vínculo ativo nesta categoria.',
    cand_pendentes: 'Candidaturas pendentes', cand_sub: 'Funcionários que querem prestar serviço para a sua malharia.',
    nenhuma_cand: 'Nenhuma candidatura pendente.', rel_conferir: 'Relatórios para conferir',
    rel_sub: 'Entregas informadas pelos terceirizados.', nenhum_rel: 'Nenhum relatório aguardando.', conferir: 'Conferir',

    voltar: 'Voltar', analise_desemp: 'ANÁLISE DE DESEMPENHO',
    meta_acum: 'Meta acumulada', periodo_atual: 'Período atual', prod_realizada: 'Produção realizada',
    efic_media: 'Eficiência média', media_maqs_ativas: 'Média das máquinas ativas',
    deficit_atual: 'Déficit atual', abaixo_da_meta: '{n}% abaixo da meta',
    meta_x_prod: 'Meta x Produção realizada', comp_diario: 'Comparativo diário por máquina',
    desemp_maq: 'Desempenho por máquina', resumo_periodo: 'Resumo do período selecionado',
    qualidade_desp: 'QUALIDADE E DESPERDÍCIO', analise_perdas: 'Análise de Perdas',
    perda_total: 'Perda total', reg_producao: 'Registrado na produção',
    indice_avaria: 'Índice de avaria', meta_max: 'Meta máxima de {n}%',
    maqs_afetadas: 'Máquinas afetadas', req_acao: '{n} requerem ação imediata',
    custo_est: 'Custo estimado', no_periodo: 'No período atual',
    perdas_maq_mot: 'Perdas por máquina e motivo', kg_perdidos_pct: 'Quilos perdidos e percentual de avaria',
    criticas_lbl: '{n} críticas', em_atencao_lbl: '{n} em atenção',
    det_ocorrencias: 'Detalhamento das ocorrências', ord_volume: 'Ordenado pelo maior volume de perda',
    acomp_desemp: 'ACOMPANHAMENTO DE DESEMPENHO',
    prod_meta_sub: 'Visão consolidada do desempenho das máquinas no turno selecionado.',
    meta_geral_turno: 'Meta Geral do Turno', pecas_prod: 'peças produzidas',
    efic_media_maqs: 'Eficiência Média das Máquinas', tempo_real: 'Tempo real', turno_sel: 'turno selecionado',
    maqs_na_meta: 'Máquinas na Meta', maqs_em_atencao: '{n} máquinas em atenção',
    resumo_por_maq: 'Resumo por máquina', resumo_maq_sub: 'Produção realizada, meta e ritmo operacional em tempo real.',
    produzido_vs_meta: 'PRODUZIDO VS. META', ritmo: 'Ritmo',

    cfg_eyebrow: 'PREFERÊNCIAS DA CONTA E SISTEMA', cfg_titulo: 'Configurações',
    cfg_sub: 'Atualize seus dados profissionais e personalize sua experiência no KnittingNet.',
    cfg_perfil: 'Perfil Profissional', cfg_perfil_sub: 'Informações utilizadas na operação e nos relatórios internos.',
    cfg_alterar_foto: 'Alterar foto', cfg_remover: 'Remover', cfg_foto_hint: 'JPG ou PNG. Tamanho máximo de 2MB.',
    cfg_nome: 'Nome completo', cfg_cargo: 'Cargo / Função', cfg_rh: 'Gerenciado pelo RH',
    cfg_email: 'E-mail corporativo', cfg_tel: 'Telefone / Ramal',
    cfg_setor: 'Setor responsável', cfg_turno: 'Turno padrão',
    cfg_seguranca: 'Segurança e Senha', cfg_seguranca_sub: 'Gerencie sua senha de acesso ao sistema.',
    cfg_senha_atual: 'Senha atual', cfg_nova_senha: 'Nova senha', cfg_conf_senha: 'Confirmar nova senha',
    cfg_senha_min: 'Mínimo de 8 caracteres', cfg_senha_fraca: 'Senha fraca',
    cfg_senha_media: 'Senha média', cfg_senha_forte: 'Senha forte', cfg_upd_senha: 'Atualizar senha',
    cfg_aparencia: 'Aparência e Idioma', cfg_aparencia_sub: 'Escolha como o sistema será exibido.',
    cfg_tema_lbl: 'Tema da Interface', cfg_tema_claro: 'Tema Claro', cfg_tema_escuro: 'Tema Escuro',
    cfg_idioma_lbl: 'Idioma do Sistema',
    cfg_notif: 'Notificações do Turno', cfg_notif_sub: 'Defina os alertas operacionais que deseja receber.',
    cfg_notif_parada: 'Alertas de parada de máquina', cfg_notif_parada_sub: 'Receba avisos imediatos sobre interrupções.',
    cfg_notif_meta: 'Resumo de meta atingida por turno', cfg_notif_meta_sub: 'Resumo ao final de cada turno de produção.',
    btn_cancelar: 'Cancelar', btn_salvar: 'Salvar alterações',
    toast_salvo: 'Alterações salvas com sucesso!', toast_descartado: 'Alterações descartadas.',
    toast_senha_ok: 'Senha atualizada com sucesso!',
  },
  en: {
    nav_inicio: 'Home', nav_producao: 'Production', nav_estoque: 'Inventory',
    nav_maquinas: 'Machines', nav_terceirizacao: 'Outsourcing',
    nav_ponto: 'Time Clock', nav_turnos: 'Shift Preferences',
    portal_sup: 'Production Panel', portal_func: 'Employee Portal',
    role_sup: 'Supervisor', role_func: 'Employee',
    turno_lbl: 'Shift', turno_manha: 'morning', turno_tarde: 'afternoon', turno_noite: 'night',
    atualizado_agora: 'Updated just now', sincronizado_em: 'Synced',
    dados_sync: 'Data synced at',
    st_ativo: 'Active', st_em_turno: 'On shift', st_produzindo: 'Producing',
    st_disponivel: 'Available', st_pausada: 'Paused', st_erro: 'Error',
    st_parada: 'Stopped', st_finalizada: 'Finished', st_atrasado: 'Delayed',
    st_pendente: 'Pending approval', st_bloqueado: 'Blocked',
    st_critica: 'Critical', st_atencao: 'Warning',

    pp_alterar_perfil: 'Edit profile',
    pp_trocar_conta: 'Switch account',
    pp_add_conta: 'Add another account / Back to login',
    pp_sair_perfil: 'Sign out of profile',
    pp_trocado_ok: 'Switched account to {nome}',
    pp_sessao_encerrada: 'Signed out safely.',

    visao_geral: 'Overview', nova_op: 'New PO', ver_mais: 'See more',
    ped_em_prod: 'Orders in production', abertos_hoje: '+{n} opened today',
    perdas: 'Losses', acima_meta: 'above', abaixo_meta: 'below', da_meta: 'target',
    ops_ativas: 'Active Operations', da_meta_turno: '{n}% of shift target', prod_meta: 'Production/Target',
    status: 'Status', maquinas_fabrica: 'Factory machines', qtd_maquinas: '{n} machines',
    ver_todas_maqs: 'View all machines', nenhuma_maq: 'No machines.',
    nenhum_ped: 'No orders found.', exibindo_peds: 'Showing {n} order(s) · refresh page to reload',
    busca_maq_mod: 'Search machine, model…', flt_todos: 'All', flt_andamento: 'In progress', flt_atrasados: 'Delayed',

    th_maquina: 'Machine', th_modelo: 'Model', th_cor: 'Color', th_operador: 'Operator',
    th_meta: 'Target', th_producao: 'Output', th_progresso: 'Progress', th_tempo: 'Time',
    th_nome: 'Name', th_email: 'Email', th_turno: 'Shift', th_status: 'Status', th_acoes: 'Actions',
    th_marca: 'Brand', th_cod_cor: 'Color code', th_lote: 'Batch', th_fornecedor: 'Supplier',
    th_saldo: 'Balance', th_data_reg: 'Date/Record', th_apelidos: 'Aliases', th_galga: 'Gauge',
    th_ano: 'Year', th_ult_manut: 'Last maintenance', th_historico: 'History',
    th_qtd_env: 'Pieces sent', th_val_un: 'Unit price',

    prod_atuando: 'Active operators', qtd_funcs: '{n} employee(s)', ninguem_ponto: 'No one clocked in right now.',
    ver_todos_funcs: 'View all employees', maqs_usadas: 'Machines in use',
    turnos: 'Shifts', turnos_sub: 'Morning · Afternoon · Night', turno_da: '{t} shift',
    funcs_atribuidos: '{n} assigned employee(s)', ninguem_atribuido: 'No one assigned.',
    sol_troca: 'Shift swap requests ({n})', aprovar: 'Approve', recusar: 'Decline',
    funcionarios: 'Employees', reativar: 'Reactivate', bloquear: 'Block',
    nenhum_func: 'No employees registered yet.',
    novo_lote: 'New batch', busca_lote: 'Search brand, batch, color…', nada_encontrado: 'Nothing found.',
    nova_maq: 'New machine', setor: 'Sector', nenhuma_maq_enc: 'No machines found.',
    terc_titulo: 'Service Outsourcing', costureira: 'Seamstress', passadeira: 'Presser',
    malharia_parceira: 'Partner Knitting Mill', busca_terc: 'Search name, quantity…',
    nenhum_vinculo: 'No active contracts in this category.',
    cand_pendentes: 'Pending applications', cand_sub: 'Workers applying to provide services for your mill.',
    nenhuma_cand: 'No pending applications.', rel_conferir: 'Reports to review',
    rel_sub: 'Deliveries reported by contractors.', nenhum_rel: 'No reports waiting.', conferir: 'Verify',

    voltar: 'Back', analise_desemp: 'PERFORMANCE ANALYSIS',
    meta_acum: 'Accumulated target', periodo_atual: 'Current period', prod_realizada: 'Actual production',
    efic_media: 'Average efficiency', media_maqs_ativas: 'Active machines average',
    deficit_atual: 'Current deficit', abaixo_da_meta: '{n}% below target',
    meta_x_prod: 'Target vs. Actual Production', comp_diario: 'Daily comparison by machine',
    desemp_maq: 'Performance by machine', resumo_periodo: 'Selected period summary',
    qualidade_desp: 'QUALITY & WASTE', analise_perdas: 'Loss Analysis',
    perda_total: 'Total loss', reg_producao: 'Recorded in production',
    indice_avaria: 'Defect rate', meta_max: 'Max target of {n}%',
    maqs_afetadas: 'Affected machines', req_acao: '{n} require immediate action',
    custo_est: 'Estimated cost', no_periodo: 'In current period',
    perdas_maq_mot: 'Losses by machine and reason', kg_perdidos_pct: 'Lost kg and defect percentage',
    criticas_lbl: '{n} critical', em_atencao_lbl: '{n} warning',
    det_ocorrencias: 'Incident breakdown', ord_volume: 'Sorted by highest loss volume',
    acomp_desemp: 'PERFORMANCE TRACKING',
    prod_meta_sub: 'Consolidated overview of machine performance in the selected shift.',
    meta_geral_turno: 'Overall Shift Target', pecas_prod: 'pieces produced',
    efic_media_maqs: 'Average Machine Efficiency', tempo_real: 'Real-time', turno_sel: 'selected shift',
    maqs_na_meta: 'Machines on Target', maqs_em_atencao: '{n} machines in warning',
    resumo_por_maq: 'Summary by machine', resumo_maq_sub: 'Actual output, target and real-time operational pace.',
    produzido_vs_meta: 'PRODUCED VS. TARGET', ritmo: 'Pace',

    cfg_eyebrow: 'ACCOUNT & SYSTEM PREFERENCES', cfg_titulo: 'Settings',
    cfg_sub: 'Update your professional details and customize your KnittingNet experience.',
    cfg_perfil: 'Professional Profile', cfg_perfil_sub: 'Information used in floor operations and internal reports.',
    cfg_alterar_foto: 'Change photo', cfg_remover: 'Remove', cfg_foto_hint: 'JPG or PNG. Max size 2MB.',
    cfg_nome: 'Full name', cfg_cargo: 'Role / Position', cfg_rh: 'Managed by HR',
    cfg_email: 'Corporate email', cfg_tel: 'Phone / Extension',
    cfg_setor: 'Responsible sector', cfg_turno: 'Default shift',
    cfg_seguranca: 'Security & Password', cfg_seguranca_sub: 'Manage your system login password.',
    cfg_senha_atual: 'Current password', cfg_nova_senha: 'New password', cfg_conf_senha: 'Confirm new password',
    cfg_senha_min: 'Minimum 8 characters', cfg_senha_fraca: 'Weak password',
    cfg_senha_media: 'Medium password', cfg_senha_forte: 'Strong password', cfg_upd_senha: 'Update password',
    cfg_aparencia: 'Appearance & Language', cfg_aparencia_sub: 'Choose how the interface is displayed.',
    cfg_tema_lbl: 'Interface Theme', cfg_tema_claro: 'Light Theme', cfg_tema_escuro: 'Dark Theme',
    cfg_idioma_lbl: 'System Language',
    cfg_notif: 'Shift Notifications', cfg_notif_sub: 'Configure the operational alerts you want to receive.',
    cfg_notif_parada: 'Machine downtime alerts', cfg_notif_parada_sub: 'Receive immediate warnings about interruptions.',
    cfg_notif_meta: 'Shift target achievement summary', cfg_notif_meta_sub: 'Summary at the end of each production shift.',
    btn_cancelar: 'Cancel', btn_salvar: 'Save changes',
    toast_salvo: 'Changes saved successfully!', toast_descartado: 'Changes discarded.',
    toast_senha_ok: 'Password updated successfully!',
  },
  es: {
    nav_inicio: 'Inicio', nav_producao: 'Producción', nav_estoque: 'Inventario',
    nav_maquinas: 'Máquinas', nav_terceirizacao: 'Tercerización',
    nav_ponto: 'Control Horario', nav_turnos: 'Preferencia de Turnos',
    portal_sup: 'Panel de Producción', portal_func: 'Portal del Colaborador',
    role_sup: 'Supervisora', role_func: 'Empleado(a)',
    turno_lbl: 'Turno', turno_manha: 'mañana', turno_tarde: 'tarde', turno_noite: 'noche',
    atualizado_agora: 'Actualizado ahora', sincronizado_em: 'Sincronizado',
    dados_sync: 'Datos sincronizados a las',
    st_ativo: 'Activo', st_em_turno: 'En turno', st_produzindo: 'Produciendo',
    st_disponivel: 'Disponible', st_pausada: 'Pausada', st_erro: 'Error',
    st_parada: 'Detenida', st_finalizada: 'Finalizada', st_atrasado: 'Atrasado',
    st_pendente: 'Pendiente de aprobación', st_bloqueado: 'Bloqueado',
    st_critica: 'Crítica', st_atencao: 'Atención',

    pp_alterar_perfil: 'Editar perfil',
    pp_trocar_conta: 'Cambiar de cuenta',
    pp_add_conta: 'Añadir otra cuenta / Volver al inicio de sesión',
    pp_sair_perfil: 'Cerrar sesión del perfil',
    pp_trocado_ok: 'Cuenta cambiada a {nome}',
    pp_sessao_encerrada: 'Sesión cerrada correctamente.',

    visao_geral: 'Vista General', nova_op: 'Nueva OP', ver_mais: 'Ver más',
    ped_em_prod: 'Pedidos en producción', abertos_hoje: '+{n} abiertos hoy',
    perdas: 'Pérdidas', acima_meta: 'por encima', abaixo_meta: 'por debajo', da_meta: 'de la meta',
    ops_ativas: 'Operaciones Activas', da_meta_turno: '{n}% de la meta del turno', prod_meta: 'Producción/Meta',
    status: 'Estado', maquinas_fabrica: 'Máquinas de la fábrica', qtd_maquinas: '{n} máquinas',
    ver_todas_maqs: 'Ver todas las máquinas', nenhuma_maq: 'Ninguna máquina.',
    nenhum_ped: 'Ningún pedido encontrado.', exibindo_peds: 'Mostrando {n} pedido(s) · actualice para recargar',
    busca_maq_mod: 'Buscar máquina, modelo…', flt_todos: 'Todos', flt_andamento: 'En curso', flt_atrasados: 'Atrasados',

    th_maquina: 'Máquina', th_modelo: 'Modelo', th_cor: 'Color', th_operador: 'Operador',
    th_meta: 'Meta', th_producao: 'Producción', th_progresso: 'Progreso', th_tempo: 'Tiempo',
    th_nome: 'Nombre', th_email: 'Correo', th_turno: 'Turno', th_status: 'Estado', th_acoes: 'Acciones',
    th_marca: 'Marca', th_cod_cor: 'Código de color', th_lote: 'Lote', th_fornecedor: 'Proveedor',
    th_saldo: 'Saldo', th_data_reg: 'Fecha/Registro', th_apelidos: 'Alias', th_galga: 'Galga',
    th_ano: 'Año', th_ult_manut: 'Último mantenimiento', th_historico: 'Historial',
    th_qtd_env: 'Piezas enviadas', th_val_un: 'Valor unitario',

    prod_atuando: 'Operadores activos', qtd_funcs: '{n} empleado(s)', ninguem_ponto: 'Nadie con turno abierto ahora.',
    ver_todos_funcs: 'Ver todos los empleados', maqs_usadas: 'Máquinas en uso',
    turnos: 'Turnos', turnos_sub: 'Mañana · Tarde · Noche', turno_da: 'Turno de {t}',
    funcs_atribuidos: '{n} empleado(s) asignado(s)', ninguem_atribuido: 'Nadie asignado.',
    sol_troca: 'Solicitudes de cambio ({n})', aprovar: 'Aprobar', recusar: 'Rechazar',
    funcionarios: 'Empleados', reativar: 'Reactivar', bloquear: 'Bloquear',
    nenhum_func: 'Ningún empleado registrado aún.',
    novo_lote: 'Nuevo lote', busca_lote: 'Buscar marca, lote, color…', nada_encontrado: 'Nada encontrado.',
    nova_maq: 'Nueva máquina', setor: 'Sector', nenhuma_maq_enc: 'Ninguna máquina encontrada.',
    terc_titulo: 'Tercerización de servicios', costureira: 'Costurera', passadeira: 'Planchadora',
    malharia_parceira: 'Tejeduría Asociada', busca_terc: 'Buscar nombre, cantidad…',
    nenhum_vinculo: 'Ningún vínculo activo en esta categoría.',
    cand_pendentes: 'Candidaturas pendientes', cand_sub: 'Trabajadores que desean prestar servicios a su fábrica.',
    nenhuma_cand: 'Ninguna candidatura pendiente.', rel_conferir: 'Informes por revisar',
    rel_sub: 'Entregas informadas por terceros.', nenhum_rel: 'Ningún informe pendiente.', conferir: 'Verificar',

    voltar: 'Volver', analise_desemp: 'ANÁLISIS DE RENDIMIENTO',
    meta_acum: 'Meta acumulada', periodo_atual: 'Período actual', prod_realizada: 'Producción realizada',
    efic_media: 'Eficiencia media', media_maqs_ativas: 'Promedio de máquinas activas',
    deficit_atual: 'Déficit actual', abaixo_da_meta: '{n}% por debajo de la meta',
    meta_x_prod: 'Meta vs. Producción realizada', comp_diario: 'Comparativo diario por máquina',
    desemp_maq: 'Rendimiento por máquina', resumo_periodo: 'Resumen del período seleccionado',
    qualidade_desp: 'CALIDAD Y DESPERDICIO', analise_perdas: 'Análisis de Pérdidas',
    perda_total: 'Pérdida total', reg_producao: 'Registrado en producción',
    indice_avaria: 'Índice de avería', meta_max: 'Meta máxima de {n}%',
    maqs_afetadas: 'Máquinas afectadas', req_acao: '{n} requieren acción inmediata',
    custo_est: 'Costo estimado', no_periodo: 'En el período actual',
    perdas_maq_mot: 'Pérdidas por máquina y motivo', kg_perdidos_pct: 'Kilos perdidos y porcentaje de avería',
    criticas_lbl: '{n} críticas', em_atencao_lbl: '{n} en atención',
    det_ocorrencias: 'Detalle de incidencias', ord_volume: 'Ordenado por mayor volumen de pérdida',
    acomp_desemp: 'SEGUIMIENTO DE RENDIMIENTO',
    prod_meta_sub: 'Vista consolidada del rendimiento de las máquinas en el turno seleccionado.',
    meta_geral_turno: 'Meta General del Turno', pecas_prod: 'piezas producidas',
    efic_media_maqs: 'Eficiencia Media de Máquinas', tempo_real: 'Tiempo real', turno_sel: 'turno seleccionado',
    maqs_na_meta: 'Máquinas en Meta', maqs_em_atencao: '{n} máquinas en atención',
    resumo_por_maq: 'Resumen por máquina', resumo_maq_sub: 'Producción realizada, meta y ritmo operativo en tiempo real.',
    produzido_vs_meta: 'PRODUCIDO VS. META', ritmo: 'Ritmo',

    cfg_eyebrow: 'PREFERENCIAS DE CUENTA Y SISTEMA', cfg_titulo: 'Configuración',
    cfg_sub: 'Actualice sus datos profesionales y personalice su experiencia en KnittingNet.',
    cfg_perfil: 'Perfil Profesional', cfg_perfil_sub: 'Información utilizada en la operación y en los informes internos.',
    cfg_alterar_foto: 'Cambiar foto', cfg_remover: 'Eliminar', cfg_foto_hint: 'JPG o PNG. Tamaño máximo de 2MB.',
    cfg_nome: 'Nombre completo', cfg_cargo: 'Cargo / Función', cfg_rh: 'Gestionado por RR.HH.',
    cfg_email: 'Correo corporativo', cfg_tel: 'Teléfono / Extensión',
    cfg_setor: 'Sector responsable', cfg_turno: 'Turno predeterminado',
    cfg_seguranca: 'Seguridad y Contraseña', cfg_seguranca_sub: 'Administre su contraseña de acceso al sistema.',
    cfg_senha_atual: 'Contraseña actual', cfg_nova_senha: 'Nueva contraseña', cfg_conf_senha: 'Confirmar nueva contraseña',
    cfg_senha_min: 'Mínimo de 8 caracteres', cfg_senha_fraca: 'Contraseña débil',
    cfg_senha_media: 'Contraseña media', cfg_senha_forte: 'Contraseña fuerte', cfg_upd_senha: 'Actualizar contraseña',
    cfg_aparencia: 'Apariencia e Idioma', cfg_aparencia_sub: 'Elija cómo se mostrará el sistema.',
    cfg_tema_lbl: 'Tema de la Interfaz', cfg_tema_claro: 'Tema Claro', cfg_tema_escuro: 'Tema Oscuro',
    cfg_idioma_lbl: 'Idioma del Sistema',
    cfg_notif: 'Notificaciones del Turno', cfg_notif_sub: 'Defina las alertas operativas que desea recibir.',
    cfg_notif_parada: 'Alertas de parada de máquina', cfg_notif_parada_sub: 'Reciba avisos inmediatos sobre interrupciones.',
    cfg_notif_meta: 'Resumen de meta alcanzada por turno', cfg_notif_meta_sub: 'Resumen al final de cada turno de producción.',
    btn_cancelar: 'Cancelar', btn_salvar: 'Guardar cambios',
    toast_salvo: '¡Cambios guardados con éxito!', toast_descartado: 'Cambios descartados.',
    toast_senha_ok: '¡Contraseña actualizada con éxito!',
  }
};

function getPrefs() {
  const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
  return {
    nome: saved.nome || ME?.nome || 'Alinne Ionafa',
    email: saved.email || ME?.email || 'alinne.ionafa@knittingnet.com.br',
    telefone: saved.telefone || '(11) 99842-1100',
    setor: saved.setor || 'Setor A - Malharia Circular',
    turno: saved.turno || ME?.turno || turnoPorHora(),
    fotoBase64: saved.fotoBase64 || '',
    tema: saved.tema || 'claro',
    idioma: saved.idioma || 'pt',
    notifParada: saved.notifParada !== undefined ? saved.notifParada : true,
    notifMeta: saved.notifMeta !== undefined ? saved.notifMeta : true,
  };
}

function t(key, vars = {}) {
  const lang = getPrefs().idioma || 'pt';
  const dict = I18N_DICT[lang] || I18N_DICT.pt;
  let str = dict[key] ?? I18N_DICT.pt[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replaceAll(`{${k}}`, v);
  }
  return str;
}

function savePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  aplicarPreferenciasGlobais(prefs);
}

function aplicarPreferenciasGlobais(prefs = getPrefs()) {
  document.body.classList.toggle('dark-theme', prefs.tema === 'escuro');
  const dict = I18N_DICT[prefs.idioma] || I18N_DICT.pt;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.setAttribute('placeholder', dict[key]);
  });
  const topName = $('#top-user-name');
  const topAv = $('#top-user-avatar');
  const ppName = $('#pp-name');
  const ppAv = $('#pp-avatar-lg');
  const avHtml = prefs.fotoBase64
    ? `<img src="${prefs.fotoBase64}" alt="${esc(prefs.nome)}">`
    : esc(iniciais(prefs.nome));

  if (topName) topName.textContent = prefs.nome;
  if (topAv) topAv.innerHTML = avHtml;
  if (ppName) ppName.textContent = prefs.nome;
  if (ppAv) ppAv.innerHTML = avHtml;
}

/* ---------- Gerenciamento de Contas Locais (Estilo Google Account) ---------- */
function getSavedAccounts(currentPrefs) {
  const defaults = [
    {
      id: 'acc-sup-1',
      nome: currentPrefs.nome || 'Alinne Ionafa',
      email: currentPrefs.email || 'alinne.ionafa@knittingnet.com.br',
      papel: 'supervisor',
      cargo: t('role_sup'),
      turno: currentPrefs.turno || 'manha',
      setor: currentPrefs.setor || 'Setor A - Malharia Circular',
      fotoBase64: currentPrefs.fotoBase64 || ''
    },
    {
      id: 'acc-op-a',
      nome: 'Lucas Mendes',
      email: 'lucas.mendes@knittingnet.com.br',
      papel: 'funcionario',
      cargo: 'Operador Turno A',
      turno: 'manha',
      setor: 'Setor A - Malharia Circular',
      fotoBase64: ''
    },
    {
      id: 'acc-ger-ind',
      nome: 'Mariana Costa',
      email: 'mariana.costa@knittingnet.com.br',
      papel: 'supervisor',
      cargo: 'Gerente Industrial',
      turno: 'tarde',
      setor: 'Setor B - Retilínea',
      fotoBase64: ''
    }
  ];

  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  } catch {
    list = [];
  }
  if (!Array.isArray(list) || !list.length) {
    list = defaults;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
  }

  const activeEmail = (currentPrefs.email || '').toLowerCase();
  const idx = list.findIndex(a => (a.email || '').toLowerCase() === activeEmail);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      nome: currentPrefs.nome,
      email: currentPrefs.email,
      turno: currentPrefs.turno,
      setor: currentPrefs.setor,
      fotoBase64: currentPrefs.fotoBase64 || ''
    };
  } else {
    list.unshift(defaults[0]);
  }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
  return list;
}

function syncSavedAccount(updatedPrefs) {
  getSavedAccounts(updatedPrefs);
}

async function trocarContaAtiva(conta) {
  const cur = getPrefs();
  const nextPrefs = {
    ...cur,
    nome: conta.nome,
    email: conta.email,
    turno: conta.turno || cur.turno,
    setor: conta.setor || cur.setor,
    fotoBase64: conta.fotoBase64 || ''
  };
  if (ME) {
    ME.nome = conta.nome;
    ME.email = conta.email;
    if (conta.papel) ME.papel = conta.papel;
    if (conta.turno) ME.turno = conta.turno;
  }
  localStorage.setItem('kn_user_email', conta.email);
  savePrefs(nextPrefs);
  ok(t('pp_trocado_ok', { nome: conta.nome }));
  const destino = (conta.papel || ME?.papel) === 'funcionario' ? '/ponto' : '/inicio';
  if ((location.hash.slice(1) || '/') === destino) await render();
  else go(destino);
}

async function encerrarSessaoPerfil() {
  try {
    await api('/auth/logout', { method: 'POST' });
  } catch {}
  localStorage.removeItem('kn_user_email');
  sessionStorage.removeItem('kn_email');
  ME = null;
  toast(t('pp_sessao_encerrada'), 'ok');
  go('/login');
}

/* ---------- Constantes de Negócio ---------- */
const TURNOS = {
  manha: { nome: 'Manhã', inicio: '06:00', fim: '12:00', horas: 6, icone: 'sunrise' },
  tarde: { nome: 'Tarde', inicio: '12:00', fim: '18:00', horas: 6, icone: 'sun' },
  noite: { nome: 'Noite', inicio: '18:00', fim: '00:00', horas: 6, icone: 'moon' },
};
const MOTIVOS = {
  fio_arrebentado: ['Fio Arrebentado', 'parada'],
  agulha_quebrada: ['Agulha Quebrada', 'parada'],
  falha_costura: ['Falha na Costura', null],
  falta_materia_prima: ['Falta de Matéria-Prima', 'parada'],
  troca_cor: ['Troca de Cor / Ajuste', 'pausada'],
  manutencao_urgente: ['Manutenção Urgente', 'manutencao'],
};
const STATUS_MAQ = { operando: 'Produzindo', disponivel: 'Disponível', pausada: 'Pausada', parada: 'Erro', manutencao: 'Parada', finalizada: 'Finalizada' };
const FUNCOES = { costureira: 'Costureira', passadeira: 'Passadeira', malharia_parceira: 'Malharia Parceira' };
const EQUIPAMENTOS = ['Overlock', 'Galoneira', 'Reta', 'Passadeira a Vapor', 'Botoneira'];
const SEQUENCIA_PONTO = { null: ['entrada'], entrada: ['saida_almoco', 'saida'], saida_almoco: ['volta_almoco'], volta_almoco: ['saida'], saida: [] };

/* ---------- Validação CNPJ e CEP (Receita Federal / ViaCEP / BrasilAPI) ---------- */
const soDigitos = s => String(s || '').replace(/\D/g, '');
function cnpjValidoLocal(cnpj) {
  const c = soDigitos(cnpj);
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const calc = base => {
    const pesos = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2].slice(-base.length);
    const soma = base.split('').reduce((acc, d, i) => acc + Number(d) * pesos[i], 0);
    const r = soma % 11;
    return r < 2 ? '0' : String(11 - r);
  };
  const d1 = calc(c.slice(0, 12));
  const d2 = calc(c.slice(0, 12) + d1);
  return c.slice(12) === d1 + d2;
}

async function consultarCNPJReal(cnpj) {
  const c = soDigitos(cnpj);
  if (!cnpjValidoLocal(c)) {
    return { ok: true, existe: false, ativa: false, erro: 'CNPJ inválido (dígitos verificadores não conferem).' };
  }
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${c}`);
    if (res.status === 400 || res.status === 404) {
      return { ok: true, existe: false, ativa: false, erro: 'CNPJ não encontrado na Receita Federal.' };
    }
    if (!res.ok) throw new Error('Falha na API');
    const d = await res.json();
    const sit = (d.descricao_situacao_cadastral || '').toUpperCase();
    return {
      ok: true, existe: true, ativa: sit === 'ATIVA', cnpj: c, situacao: sit || 'DESCONHECIDA',
      razao_social: d.razao_social || '',
      nome_fantasia: d.nome_fantasia || d.razao_social || '',
      cep: soDigitos(d.cep),
      logradouro: ((d.descricao_tipo_de_logradouro || '') + ' ' + (d.logradouro || '')).trim(),
      numero: d.numero || '', bairro: d.bairro || '', uf: d.uf || '', cidade: d.municipio || ''
    };
  } catch {
    try {
      const res2 = await fetch(`https://publica.cnpj.ws/cnpj/${c}`);
      if (res2.status === 400 || res2.status === 404) {
        return { ok: true, existe: false, ativa: false, erro: 'CNPJ não encontrado na Receita Federal.' };
      }
      if (!res2.ok) throw new Error('Falha na API 2');
      const d2 = await res2.json();
      const est = d2.estabelecimento || {};
      const sit = (est.situacao_cadastral || '').toUpperCase();
      return {
        ok: true, existe: true, ativa: sit === 'ATIVA', cnpj: c, situacao: sit || 'DESCONHECIDA',
        razao_social: d2.razao_social || '',
        nome_fantasia: est.nome_fantasia || d2.razao_social || '',
        cep: soDigitos(est.cep),
        logradouro: ((est.tipo_logradouro || '') + ' ' + (est.logradouro || '')).trim(),
        numero: est.numero || '', bairro: est.bairro || '', uf: d2.estado?.sigla || '', cidade: est.cidade?.nome || ''
      };
    } catch {
      return { ok: false, existe: null, ativa: null, erro: 'Não foi possível consultar a Receita Federal agora.' };
    }
  }
}

async function consultarCEPReal(cep) {
  const c = soDigitos(cep);
  if (c.length !== 8) throw new Error('CEP inválido.');
  const res = await fetch(`https://viacep.com.br/ws/${c}/json/`);
  const d = await res.json();
  if (d.erro) throw new Error('CEP não encontrado.');
  return { cep: c, logradouro: d.logradouro || '', bairro: d.bairro || '', cidade: d.localidade || '', uf: d.uf || '' };
}

/* ---------- Helpers de Banco (Supabase) ---------- */
let ME = null;
let RAW_USER = null;
let RAW_MALHARIA = null;

function throwErr(msg) { throw new Error(msg); }

async function notificar(userId, texto) {
  await sb.from('notificacoes').insert([{ user_id: userId, texto }]);
}
async function notificarSupervisores(malhariaId, texto) {
  const { data } = await sb.from('users').select('id').eq('malharia_id', malhariaId).eq('papel', 'supervisor');
  if (data && data.length) {
    await sb.from('notificacoes').insert(data.map(u => ({ user_id: u.id, texto })));
  }
}

function calcHorasTrabalhadas(marcas, ateAgora = false) {
  let totalMs = 0, ini = null;
  for (const m of marcas) {
    const t = new Date(m.ts).getTime();
    if (m.tipo === 'entrada' || m.tipo === 'volta_almoco') ini = t;
    else if (ini) { totalMs += (t - ini); ini = null; }
  }
  if (ini && ateAgora) totalMs += (Date.now() - ini);
  const mins = Math.max(0, Math.floor(totalMs / 60000));
  return { mins, texto: `${String(Math.floor(mins / 60)).padStart(2, '0')}h ${String(mins % 60).padStart(2, '0')}min` };
}

async function dadosDia(uid, dia) {
  const { data: marcas } = await sb.from('ponto').select('tipo, ts').eq('user_id', uid).eq('dia', dia).order('id');
  const lista = marcas || [];
  const ult = lista.length ? lista[lista.length - 1].tipo : null;
  const eHoje = dia === hojeISO();
  const { mins, texto } = calcHorasTrabalhadas(lista, eHoje);
  const mapa = {};
  for (const m of lista) {
    mapa[m.tipo] = new Date(m.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  }
  return {
    dia, marcas: mapa, proximas: SEQUENCIA_PONTO[String(ult)] || [],
    trabalhado_min: mins, trabalhado: texto,
    em_andamento: eHoje && ult !== null && ult !== 'saida'
  };
}

function proximaSegunda(isoDate) {
  const d = new Date(isoDate + 'T12:00:00');
  const diff = (7 - d.getDay() + 1) % 7;
  d.setDate(d.getDate() + (diff === 0 && d.getDay() !== 1 ? 7 : (d.getDay() === 1 ? 0 : (8 - d.getDay()) % 7)));
  return d.toISOString().slice(0, 10);
}

/* ---------- Camada de API Compatível com views_func.js e views_sup.js ---------- */
async function api(fullPath, { method = 'GET', body, form } = {}) {
  if (!window.sb) throwErr('Configure sua chave do Supabase no arquivo supabase-config.js.');
  const [path, queryStr] = fullPath.split('?');
  const params = new URLSearchParams(queryStr || '');

  if (path.startsWith('/cnpj/')) {
    const c = path.split('/')[2];
    const r = await consultarCNPJReal(c);
    if (r.existe) {
      const { data } = await sb.from('malharias').select('id').eq('cnpj', soDigitos(c)).maybeSingle();
      r.ja_cadastrada = !!data;
    }
    return r;
  }
  if (path.startsWith('/cep/')) {
    return await consultarCEPReal(path.split('/')[2]);
  }
  if (path.startsWith('/auth/oauth/')) {
    const prov = path.split('/')[3];
    throwErr(`Login com ${prov.charAt(0).toUpperCase() + prov.slice(1)} exige configuração OAuth no painel do Supabase. Use o cadastro por e-mail.`);
  }

  if (path === '/auth/cadastro/malharia' && method === 'POST') {
    const email = (body.email || '').trim().toLowerCase();
    const nome = (body.nome || '').trim();
    if (!email || !email.includes('@')) throwErr('E-mail inválido.');
    if (!body.senha || body.senha.length < 8) throwErr('A senha precisa ter no mínimo 8 caracteres.');
    if (nome.length < 2) throwErr('Informe o seu nome.');

    const c = soDigitos(body.cnpj);
    if (!cnpjValidoLocal(c)) throwErr('CNPJ inválido.');
    const { data: dupMal } = await sb.from('malharias').select('id').eq('cnpj', c).maybeSingle();
    if (dupMal) throwErr('Esta malharia já está cadastrada. Se você é funcionário, faça o cadastro de funcionário.');

    const info = await consultarCNPJReal(c);
    if (info.existe === false) throwErr(info.erro || 'CNPJ não encontrado na Receita Federal.');
    if (info.existe && !info.ativa) throwErr(`Este CNPJ consta como ${info.situacao} na Receita Federal. Só é possível cadastrar empresas ATIVAS.`);

    const verificado = Boolean(info.ok && info.ativa);
    const razao = info.razao_social || (body.razao_social || '').trim();
    const fantasia = (body.nome_fantasia || '').trim() || info.nome_fantasia || razao;
    if (!razao) throwErr('Informe a razão social.');

    const { data: authRes, error: authErr } = await sb.auth.signUp({ email, password: body.senha });
    if (authErr) throwErr(authErr.message);

    const { data: malRow, error: malErr } = await sb.from('malharias').insert([{
      cnpj: c, razao_social: razao, nome_fantasia: fantasia,
      cep: soDigitos(body.cep), logradouro: body.logradouro || '', numero: body.numero || '',
      bairro: body.bairro || '', uf: (body.uf || '').toUpperCase(), cidade: body.cidade || '',
      cnpj_status: verificado ? 'verificado' : 'pendente',
      cnpj_situacao: info.situacao || null,
      cnpj_verificado_em: verificado ? new Date().toISOString() : null
    }]).select().single();
    if (malErr) throwErr(malErr.message);

    const { error: usrErr } = await sb.from('users').insert([{
      auth_uid: authRes.user?.id || null, email, nome, papel: 'supervisor',
      malharia_id: malRow.id, status: 'ativo'
    }]);
    if (usrErr) throwErr(usrErr.message);

    localStorage.setItem('kn_user_email', email);
    return { ok: true, cnpj_verificado: verificado };
  }

  if (path === '/auth/cadastro/funcionario' && method === 'POST') {
    const email = (body.email || '').trim().toLowerCase();
    const nome = (body.nome || '').trim();
    if (!email || !email.includes('@')) throwErr('E-mail inválido.');
    if (!body.senha || body.senha.length < 8) throwErr('A senha precisa ter no mínimo 8 caracteres.');
    if (nome.length < 2) throwErr('Informe o seu nome.');

    const c = soDigitos(body.cnpj);
    const { data: m } = await sb.from('malharias').select('*').eq('cnpj', c).maybeSingle();
    if (!m || m.cnpj_status !== 'verificado') {
      throwErr('Malharia não encontrada. Peça ao responsável para cadastrá-la primeiro e confira o CNPJ.');
    }

    const { data: authRes, error: authErr } = await sb.auth.signUp({ email, password: body.senha });
    if (authErr) throwErr(authErr.message);

    const { error: usrErr } = await sb.from('users').insert([{
      auth_uid: authRes.user?.id || null, email, nome, papel: 'funcionario',
      malharia_id: m.id, status: 'pendente'
    }]);
    if (usrErr) throwErr(usrErr.message);

    await notificarSupervisores(m.id, `${nome} pediu acesso à ${m.nome_fantasia}. Aprove em Produção → Funcionários.`);
    return { ok: true, pendente: true };
  }

  if (path === '/auth/login' && method === 'POST') {
    const email = (body.email || '').trim().toLowerCase();
    const { data: u } = await sb.from('users').select('*').eq('email', email).maybeSingle();
    if (!u) throwErr('E-mail ou senha incorretos.');
    if (u.status === 'bloqueado') throwErr('Acesso bloqueado. Fale com o supervisor da malharia.');

    const { error } = await sb.auth.signInWithPassword({ email, password: body.senha || '' });
    if (error) throwErr('E-mail ou senha incorretos.');

    localStorage.setItem('kn_user_email', email);
    return { ok: true };
  }

  if (path === '/auth/logout' && method === 'POST') {
    await sb.auth.signOut();
    localStorage.removeItem('kn_user_email');
    return { ok: true };
  }

  if (path === '/auth/senha' && method === 'POST') {
    if (!body.nova || body.nova.length < 8) throwErr('A nova senha precisa ter no mínimo 8 caracteres.');
    const { error } = await sb.auth.updateUser({ password: body.nova });
    if (error) throwErr(error.message);
    return { ok: true };
  }

  if (path === '/me') {
    const { data: sess } = await sb.auth.getSession();
    const email = sess?.session?.user?.email || localStorage.getItem('kn_user_email');
    if (!email) throwErr('Não autenticado.');
    const { data: u } = await sb.from('users').select('*').eq('email', email).maybeSingle();
    if (!u) throwErr('Usuário não encontrado.');
    const { data: m } = await sb.from('malharias').select('*').eq('id', u.malharia_id).single();

    const { data: turnosAp } = await sb.from('solicitacoes_turno').select('*')
      .eq('user_id', u.id).eq('status', 'aprovado').eq('aplicado', 0).lte('inicio_previsto', hojeISO());
    if (turnosAp && turnosAp.length) {
      const ultT = turnosAp[turnosAp.length - 1];
      await sb.from('users').update({ turno: ultT.turno }).eq('id', u.id);
      for (const s of turnosAp) await sb.from('solicitacoes_turno').update({ aplicado: 1 }).eq('id', s.id);
      u.turno = ultT.turno;
    }

    RAW_USER = u;
    RAW_MALHARIA = m;

    let emTurno = false;
    if (u.papel === 'funcionario') {
      const { data: ultP } = await sb.from('ponto').select('tipo').eq('user_id', u.id).eq('dia', hojeISO()).order('id', { ascending: false }).limit(1);
      emTurno = Boolean(ultP && ultP.length && (ultP[0].tipo === 'entrada' || ultP[0].tipo === 'volta_almoco'));
    }
    const { count: naoLidas } = await sb.from('notificacoes').select('*', { count: 'exact', head: true }).eq('user_id', u.id).eq('lida', 0);
    const { data: sync } = await sb.from('sync_log').select('ultima_em').eq('malharia_id', m.id).maybeSingle();

    return {
      id: u.id, nome: u.nome, email: u.email, papel: u.papel, status: u.status,
      turno: u.turno, turno_info: TURNOS[u.turno], em_turno: emTurno,
      malharia: {
        id: m.id, nome: m.nome_fantasia, cnpj: mascCnpj(m.cnpj),
        cnpj_status: m.cnpj_status, cnpj_situacao: m.cnpj_situacao
      },
      nao_lidas: naoLidas || 0, ultima_sync: sync ? sync.ultima_em : null
    };
  }

  if (path === '/malharia/reverificar' && method === 'POST') {
    const info = await consultarCNPJReal(RAW_MALHARIA.cnpj);
    if (!info.ok) throwErr(info.erro);
    if (info.existe && info.ativa) {
      await sb.from('malharias').update({ cnpj_status: 'verificado', cnpj_situacao: info.situacao, cnpj_verificado_em: new Date().toISOString() }).eq('id', RAW_MALHARIA.id);
      return { ok: true, status: 'verificado' };
    }
    await sb.from('malharias').update({ cnpj_status: 'rejeitado', cnpj_situacao: info.situacao || info.erro }).eq('id', RAW_MALHARIA.id);
    return { ok: false, status: 'rejeitado' };
  }

  if (path === '/notificacoes') {
    const { data } = await sb.from('notificacoes').select('*').eq('user_id', RAW_USER.id).order('id', { ascending: false }).limit(30);
    return data || [];
  }
  if (path === '/notificacoes/lidas' && method === 'POST') {
    await sb.from('notificacoes').update({ lida: 1 }).eq('user_id', RAW_USER.id);
    return { ok: true };
  }

  if (path === '/ponto/hoje') {
    const d = await dadosDia(RAW_USER.id, hojeISO());
    d.agora = new Date().toISOString();
    d.turno = TURNOS[RAW_USER.turno];
    return d;
  }
  if (path === '/ponto' && method === 'POST') {
    const d = await dadosDia(RAW_USER.id, hojeISO());
    if (!d.proximas.includes(body.tipo)) throwErr('Essa marcação não está disponível agora.');
    await sb.from('ponto').insert([{ user_id: RAW_USER.id, dia: hojeISO(), tipo: body.tipo, ts: new Date().toISOString() }]);
    return await dadosDia(RAW_USER.id, hojeISO());
  }
  if (path === '/ponto/calendario') {
    const mes = params.get('mes') || hojeISO().slice(0, 7);
    const [ano, m] = mes.split('-').map(Number);
    const iniIso = `${mes}-01`;
    const fimDate = new Date(ano, m, 1);
    const fimIso = fimDate.toISOString().slice(0, 10);
    const { data: rs } = await sb.from('ponto').select('dia, tipo, ts').eq('user_id', RAW_USER.id).gte('dia', iniIso).lt('dia', fimIso).order('id');
    const marcas = {};
    (rs || []).forEach(r => (marcas[r.dia] = marcas[r.dia] || []).push(r));
    const iniTurno = Number(TURNOS[RAW_USER.turno].inicio.slice(0, 2));
    const criado = (RAW_USER.criado_em || '').slice(0, 10);
    const dias = [];
    const cur = new Date(ano, m - 1, 1);
    while (cur.getMonth() === m - 1) {
      const iso = cur.toISOString().slice(0, 10);
      const ms = marcas[iso];
      let st = '';
      if (ms) {
        const tipos = new Set(ms.map(x => x.tipo));
        const ent = new Date(ms[0].ts);
        const atrasou = ent.getHours() * 60 + ent.getMinutes() > iniTurno * 60 + 10 && ms[0].tipo === 'entrada';
        if (iso === hojeISO() && !tipos.has('saida')) st = 'andamento';
        else if (tipos.has('saida') && !atrasou) st = 'completo';
        else st = 'atencao';
      } else if (iso > hojeISO() || iso < criado) {
        st = '';
      } else if (cur.getDay() === 0 || cur.getDay() === 6) {
        st = 'folga';
      } else if (iso === hojeISO()) {
        st = 'pendente';
      } else {
        st = 'falta';
      }
      dias.push({ dia: iso, status: st });
      cur.setDate(cur.getDate() + 1);
    }
    return { mes, dias };
  }
  if (path === '/ponto/dia') {
    const r = await dadosDia(RAW_USER.id, params.get('data'));
    r.turno = TURNOS[RAW_USER.turno];
    return r;
  }

  if (path === '/turnos') {
    const { data: us } = await sb.from('users').select('turno').eq('malharia_id', RAW_MALHARIA.id).eq('status', 'ativo');
    const lista = Object.entries(TURNOS).map(([k, t]) => {
      const ocup = (us || []).filter(x => x.turno === k).length;
      const vagas = Math.max(RAW_MALHARIA.vagas_por_turno - ocup, 0);
      const rotulo = k === RAW_USER.turno ? 'Turno Atual' : (vagas <= 0 ? 'Lotado' : (vagas <= 3 ? 'Poucas Vagas' : 'Vagas Abertas'));
      return { id: k, ...t, vagas, rotulo };
    });
    const { data: hist } = await sb.from('solicitacoes_turno').select('*').eq('user_id', RAW_USER.id).order('id', { ascending: false }).limit(10);
    return { atual: RAW_USER.turno, turnos: lista, historico: (hist || []).map(h => ({ ...h, turno_nome: TURNOS[h.turno].nome })) };
  }
  if (path === '/turnos/solicitar' && method === 'POST') {
    if (!TURNOS[body.turno]) throwErr('Selecione um turno.');
    if (body.turno === RAW_USER.turno) throwErr('Você já está neste turno.');
    const ini = proximaSegunda(body.a_partir_de);
    await sb.from('solicitacoes_turno').insert([{
      user_id: RAW_USER.id, turno: body.turno, a_partir_de: body.a_partir_de,
      inicio_previsto: ini, observacao: body.observacao || ''
    }]);
    await notificarSupervisores(RAW_MALHARIA.id, `${RAW_USER.nome} solicitou troca para o turno da ${TURNOS[body.turno].nome}.`);
    return { ok: true };
  }

  if (path === '/operador/maquinas') {
    const { data: maqs } = await sb.from('maquinas').select('*').eq('malharia_id', RAW_MALHARIA.id).order('apelido');
    const { data: peds } = await sb.from('pedidos').select('*').eq('malharia_id', RAW_MALHARIA.id).in('status', ['aberto', 'andamento', 'pausado']);
    const out = (maqs || []).map(m => {
      const p = (peds || []).find(x => x.maquina_id === m.id) || null;
      return { ...m, status_rotulo: STATUS_MAQ[m.status] || m.status, pedido: p };
    });
    return { maquinas: out, motivos: Object.entries(MOTIVOS).map(([id, v]) => ({ id, nome: v[0] })) };
  }
  if (path === '/operador/producao' && method === 'POST') {
    const { data: p } = await sb.from('pedidos').select('*').eq('maquina_id', body.maquina_id).in('status', ['aberto', 'andamento', 'pausado']).limit(1).maybeSingle();
    if (!p) throwErr('Esta máquina não tem ordem de produção atribuída.');
    if (body.acao === 'iniciar') {
      await sb.from('pedidos').update({ status: 'andamento', operador_id: RAW_USER.id, iniciado_em: p.iniciado_em || new Date().toISOString() }).eq('id', p.id);
      await sb.from('maquinas').update({ status: 'operando', aviso: null }).eq('id', body.maquina_id);
    } else if (body.acao === 'pausar') {
      await sb.from('pedidos').update({ status: 'pausado' }).eq('id', p.id);
      await sb.from('maquinas').update({ status: 'pausada' }).eq('id', body.maquina_id);
    } else if (body.acao === 'lancar') {
      const q = Number(body.quantidade);
      if (!q || q < 1) throwErr('Informe uma quantidade válida.');
      const novo = p.produzido + q;
      if (novo >= p.meta) {
        await sb.from('pedidos').update({ produzido: p.meta, status: 'finalizado' }).eq('id', p.id);
        await sb.from('maquinas').update({ status: 'finalizada' }).eq('id', body.maquina_id);
        await notificarSupervisores(RAW_MALHARIA.id, `${p.codigo} concluída na máquina.`);
      } else {
        await sb.from('pedidos').update({ produzido: novo }).eq('id', p.id);
      }
    }
    return { ok: true };
  }
  if (path === '/operador/ocorrencia' && method === 'POST') {
    const mot = MOTIVOS[body.motivo];
    if (!mot) throwErr('Selecione o motivo.');
    const avar = Number(body.pecas_avariadas || 0);
    await sb.from('ocorrencias').insert([{
      malharia_id: RAW_MALHARIA.id, maquina_id: body.maquina_id, user_id: RAW_USER.id,
      motivo: mot[0], pecas_avariadas: avar, observacao: body.observacao || ''
    }]);
    const { data: p } = await sb.from('pedidos').select('*').eq('maquina_id', body.maquina_id).in('status', ['aberto', 'andamento', 'pausado']).limit(1).maybeSingle();
    if (p && avar) await sb.from('pedidos').update({ avariadas: p.avariadas + avar }).eq('id', p.id);
    if (mot[1]) {
      await sb.from('maquinas').update({ status: mot[1], aviso: mot[0] }).eq('id', body.maquina_id);
      if (p && (mot[1] === 'parada' || mot[1] === 'manutencao')) {
        await sb.from('pedidos').update({ status: 'pausado' }).eq('id', p.id);
      }
    }
    await notificarSupervisores(RAW_MALHARIA.id, `Ocorrência na máquina: ${mot[0]} (${RAW_USER.nome}).`);
    return { ok: true };
  }

  if (path === '/terceirizacao/opcoes') {
    return { funcoes: Object.entries(FUNCOES).map(([id, nome]) => ({ id, nome })), equipamentos: EQUIPAMENTOS };
  }
  if (path === '/malharias/buscar') {
    const q = (params.get('q') || '').trim();
    const d = soDigitos(q);
    let query = sb.from('malharias').select('id, nome_fantasia, razao_social, cnpj, cidade, uf').eq('cnpj_status', 'verificado').limit(8);
    if (d) query = query.or(`nome_fantasia.ilike.%${q}%,razao_social.ilike.%${q}%,cnpj.ilike.%${d}%`);
    else query = query.or(`nome_fantasia.ilike.%${q}%,razao_social.ilike.%${q}%`);
    const { data } = await query;
    return data || [];
  }
  if (path === '/candidaturas' && method === 'POST') {
    const cap = Number(body.capacidade);
    const val = Number(String(body.valor_peca).replace(',', '.'));
    if (!cap || !val) throwErr('Informe a capacidade diária e o valor médio por peça.');
    const { error } = await sb.from('candidaturas').insert([{
      user_id: RAW_USER.id, malharia_destino_id: body.malharia_id, funcao: body.funcao,
      capacidade_diaria: cap, valor_peca: val, equipamentos: (body.equipamentos || []).join(','),
      observacao: body.observacao || ''
    }]);
    if (error) throwErr('Você já se candidatou a esta malharia para essa função.');
    await notificarSupervisores(body.malharia_id, `Nova candidatura de ${RAW_USER.nome} (${FUNCOES[body.funcao]}).`);
    return { ok: true };
  }
  if (path === '/candidaturas/minhas') {
    const { data } = await sb.from('candidaturas').select('*, malharias(id, nome_fantasia, cidade, uf)').eq('user_id', RAW_USER.id).order('id', { ascending: false });
    return (data || []).map(c => ({
      id: c.id, funcao: c.funcao, funcao_nome: FUNCOES[c.funcao], status: c.status,
      capacidade_diaria: c.capacidade_diaria, valor_peca: c.valor_peca,
      nome_fantasia: c.malharias?.nome_fantasia, cidade: c.malharias?.cidade, uf: c.malharias?.uf, malharia_id: c.malharias?.id
    }));
  }
  if (path === '/lotes') {
    const { data } = await sb.from('pedidos').select('codigo, modelo, cor').eq('malharia_id', params.get('malharia_id')).neq('status', 'finalizado').limit(30);
    return data || [];
  }
  if (path === '/relatorios' && method === 'POST') {
    const pecas = Number(body.pecas), av = Number(body.avariadas || 0);
    if (!body.lote || !pecas) throwErr('Informe o lote e a quantidade de peças.');
    if (av > pecas) throwErr('As peças avariadas não podem passar do total concluído.');
    await sb.from('relatorios_entrega').insert([{
      user_id: RAW_USER.id, malharia_destino_id: Number(body.malharia_id), lote: body.lote,
      pecas, avariadas: av, previsao: body.previsao || null, observacao: body.observacao || ''
    }]);
    await notificarSupervisores(Number(body.malharia_id), `${RAW_USER.nome} enviou relatório de entrega (${body.lote}, ${pecas} peças).`);
    return { ok: true };
  }
  if (path === '/relatorios/meus') {
    const { data } = await sb.from('relatorios_entrega').select('*, malharias(nome_fantasia)').eq('user_id', RAW_USER.id).order('id', { ascending: false }).limit(20);
    return (data || []).map(r => ({ ...r, nome_fantasia: r.malharias?.nome_fantasia }));
  }

  if (path === '/supervisor/inicio') {
    const mid = RAW_MALHARIA.id;
    const q = (params.get('q') || '').toLowerCase();
    const filtro = params.get('filtro') || 'todos';
    const [{ data: allPeds }, { data: maqs }, { data: us }] = await Promise.all([
      sb.from('pedidos').select('*').eq('malharia_id', mid).order('id'),
      sb.from('maquinas').select('*').eq('malharia_id', mid).order('apelido'),
      sb.from('users').select('id, nome').eq('malharia_id', mid)
    ]);
    const peds = allPeds || [];
    const abertos = peds.filter(p => p.status !== 'finalizado');
    const emProd = abertos.filter(p => p.status === 'andamento' || p.status === 'pausado');
    const criadosHoje = peds.filter(p => (p.criado_em || '').slice(0, 10) === hojeISO() && p.status !== 'finalizado').length;
    const prodTotal = peds.reduce((a, b) => a + b.produzido, 0);
    const avTotal = peds.reduce((a, b) => a + b.avariadas, 0);
    const perdas = prodTotal ? Number(((100 * avTotal) / prodTotal).toFixed(1)) : 0.0;
    const opsAtivas = (maqs || []).filter(m => m.status === 'operando').length;
    const metas = emProd.reduce((a, b) => a + b.meta, 0);
    const pctMeta = metas ? Math.round((100 * emProd.reduce((a, b) => a + b.produzido, 0)) / metas) : 0;

    const tabela = [];
    for (const p of abertos) {
      const m = (maqs || []).find(x => x.id === p.maquina_id);
      const u = (us || []).find(x => x.id === p.operador_id);
      const atr = Boolean(p.prazo && p.prazo < new Date().toISOString());
      if (filtro === 'andamento' && p.status !== 'andamento') continue;
      if (filtro === 'atrasados' && !atr) continue;
      const textoBusca = `${m?.apelido || ''} ${p.modelo} ${p.cor || ''} ${u?.nome || ''}`.toLowerCase();
      if (q && !textoBusca.includes(q)) continue;
      let tempo = '-';
      if (p.iniciado_em) {
        const mins = Math.max(0, Math.floor((Date.now() - new Date(p.iniciado_em).getTime()) / 60000));
        tempo = `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}min`;
      }
      tabela.push({
        id: p.id, maquina: m?.apelido, modelo: p.modelo, cor: p.cor, cor_hex: p.cor_hex,
        operador: u?.nome, meta: p.meta, produzido: p.produzido,
        progresso: p.meta ? Math.round((100 * p.produzido) / p.meta) : 0,
        tempo, atrasado: atr, codigo: p.codigo
      });
    }

    const maqsOut = (maqs || []).map(m => {
      const p = abertos.find(x => x.maquina_id === m.id);
      return {
        id: m.id, apelido: m.apelido, status: m.status, rotulo: STATUS_MAQ[m.status],
        detalhe: p ? `${p.codigo} · ${p.modelo}` : (m.aviso || 'Aguardando nova OP'), setor: m.setor
      };
    });

    return {
      pedidos_em_producao: emProd.length, criados_hoje: criadosHoje, perdas,
      meta_perda: RAW_MALHARIA.meta_perda, operacoes_ativas: opsAtivas, pct_meta: pctMeta,
      maquinas: maqsOut, pedidos: tabela
    };
  }

  if (path === '/supervisor/pedidos' && method === 'POST') {
    const mid = RAW_MALHARIA.id;
    const { count } = await sb.from('pedidos').select('*', { count: 'exact', head: true }).eq('malharia_id', mid);
    const codigo = (body.codigo || '').trim() || `OP #${2801 + (count || 0)}`;
    const mqId = body.maquina_id ? Number(body.maquina_id) : null;
    await sb.from('pedidos').insert([{
      malharia_id: mid, codigo, maquina_id: mqId, modelo: body.modelo,
      cor: body.cor || '', cor_hex: body.cor_hex || '#3f4b86', meta: Number(body.meta),
      prazo: body.prazo ? new Date(body.prazo).toISOString() : null
    }]);
    if (mqId) await sb.from('maquinas').update({ status: 'disponivel', aviso: null }).eq('id', mqId);
    return { ok: true, codigo };
  }

  if (path === '/supervisor/producao') {
    const mid = RAW_MALHARIA.id;
    const [{ data: funcs }, { data: pontos }, { data: maqs }, { data: peds }] = await Promise.all([
      sb.from('users').select('id, nome').eq('malharia_id', mid).eq('papel', 'funcionario').eq('status', 'ativo'),
      sb.from('ponto').select('user_id, tipo').eq('dia', hojeISO()).order('id'),
      sb.from('maquinas').select('*').eq('malharia_id', mid).order('apelido'),
      sb.from('pedidos').select('*').eq('malharia_id', mid).neq('status', 'finalizado')
    ]);
    const atuando = (funcs || []).filter(f => {
      const ps = (pontos || []).filter(x => x.user_id === f.id);
      const ult = ps.length ? ps[ps.length - 1].tipo : null;
      return ult === 'entrada' || ult === 'volta_almoco';
    });
    const maqsOut = (maqs || []).map(m => {
      const p = (peds || []).find(x => x.maquina_id === m.id);
      return {
        id: m.id, apelido: m.apelido, status: m.status, setor: m.setor,
        detalhe: p ? `${p.modelo} · ${p.cor || ''}` : (m.aviso || 'Aguardando nova OP'),
        contagem: p ? `${p.produzido}/${p.meta}` : '-'
      };
    });
    return { atuando, maquinas: maqsOut };
  }

  if (path === '/supervisor/turnos') {
    const mid = RAW_MALHARIA.id;
    const { data: funcs } = await sb.from('users').select('id, nome, turno').eq('malharia_id', mid).eq('papel', 'funcionario').eq('status', 'ativo').order('nome');
    const turnosOut = Object.entries(TURNOS).map(([id, t]) => ({
      id, ...t, funcionarios: (funcs || []).filter(f => f.turno === id)
    }));
    const { data: sols } = await sb.from('solicitacoes_turno').select('*, users!inner(nome, malharia_id)').eq('users.malharia_id', mid).eq('status', 'em_analise');
    return {
      turnos: turnosOut,
      solicitacoes: (sols || []).map(s => ({ ...s, nome: s.users?.nome, turno_nome: TURNOS[s.turno].nome }))
    };
  }
  if (path.startsWith('/supervisor/turnos/') && method === 'POST') {
    const sid = Number(path.split('/')[3]);
    const novo = body.acao === 'aprovar' ? 'aprovado' : 'recusado';
    const { data: s } = await sb.from('solicitacoes_turno').update({ status: novo }).eq('id', sid).select().single();
    if (s) await notificar(s.user_id, `Sua solicitação de turno (${TURNOS[s.turno].nome}) foi ${novo}.`);
    return { ok: true };
  }

  if (path === '/supervisor/funcionarios') {
    const { data } = await sb.from('users').select('id, nome, email, turno, status, criado_em').eq('malharia_id', RAW_MALHARIA.id).eq('papel', 'funcionario').order('nome');
    return (data || []).map(f => ({ ...f, turno_nome: TURNOS[f.turno].nome }));
  }
  if (path.startsWith('/supervisor/funcionarios/') && method === 'POST') {
    const fid = Number(path.split('/')[3]);
    const novo = { aprovar: 'ativo', bloquear: 'bloqueado', reativar: 'ativo' }[body.acao];
    await sb.from('users').update({ status: novo }).eq('id', fid);
    if (body.acao === 'aprovar') await notificar(fid, 'Seu acesso foi aprovado. Bem-vindo(a)!');
    return { ok: true };
  }

  if (path === '/estoque' && method === 'GET') {
    const q = (params.get('q') || '').trim();
    const f = params.get('filtro') || 'todos';
    let query = sb.from('estoque').select('*').eq('malharia_id', RAW_MALHARIA.id).order('id', { ascending: false });
    if (f === 'andamento') query = query.eq('status', 'em_andamento');
    if (f === 'atrasados') query = query.eq('status', 'atrasado');
    if (q) query = query.or(`marca.ilike.%${q}%,modelo.ilike.%${q}%,cor.ilike.%${q}%,lote.ilike.%${q}%,fornecedor.ilike.%${q}%`);
    const { data } = await query;
    return data || [];
  }
  if (path === '/estoque' && method === 'POST') {
    await sb.from('estoque').insert([{
      malharia_id: RAW_MALHARIA.id, marca: body.marca, modelo: body.modelo || '', cor: body.cor || '',
      cor_hex: body.cor_hex || '#3f4b86', codigo_cor: body.codigo_cor || '', lote: body.lote || '',
      fornecedor: body.fornecedor || '', saldo_kg: Number(String(body.saldo_kg).replace(',', '.')),
      status: body.status || 'recebido', registrado_em: body.registrado_em || hojeISO()
    }]);
    return { ok: true };
  }
  if (path.startsWith('/estoque/') && method === 'DELETE') {
    await sb.from('estoque').delete().eq('id', Number(path.split('/')[2]));
    return { ok: true };
  }

  if (path === '/maquinas' && method === 'GET') {
    const q = (params.get('q') || '').trim();
    const setor = params.get('setor');
    let query = sb.from('maquinas').select('*').eq('malharia_id', RAW_MALHARIA.id).order('apelido');
    if (setor) query = query.eq('setor', setor);
    if (q) query = query.or(`apelido.ilike.%${q}%,marca.ilike.%${q}%,modelo.ilike.%${q}%`);
    const { data } = await query;
    return data || [];
  }
  if (path === '/maquinas' && method === 'POST') {
    await sb.from('maquinas').insert([{
      malharia_id: RAW_MALHARIA.id, apelido: body.apelido, setor: body.setor || 'A',
      marca: body.marca || '', modelo: body.modelo || '', galga: body.galga || '',
      ano: body.ano ? Number(body.ano) : null, ultima_manutencao: body.ultima_manutencao || null
    }]);
    return { ok: true };
  }
  if (path.endsWith('/historico')) {
    const mid = Number(path.split('/')[2]);
    const [{ data: maquina }, { data: manutencoes }, { data: ocs }] = await Promise.all([
      sb.from('maquinas').select('*').eq('id', mid).single(),
      sb.from('manutencoes').select('*').eq('maquina_id', mid).order('data', { ascending: false }),
      sb.from('ocorrencias').select('*, users(nome)').eq('maquina_id', mid).order('id', { ascending: false }).limit(30)
    ]);
    return { maquina, manutencoes: manutencoes || [], ocorrencias: (ocs || []).map(o => ({ ...o, nome: o.users?.nome })) };
  }
  if (path.endsWith('/manutencao') && method === 'POST') {
    const mid = Number(path.split('/')[2]);
    await sb.from('manutencoes').insert([{ maquina_id: mid, data: body.data, descricao: body.descricao || '' }]);
    await sb.from('maquinas').update({ ultima_manutencao: body.data, status: 'disponivel', aviso: null }).eq('id', mid);
    return { ok: true };
  }

  if (path === '/supervisor/terceirizacao') {
    const funcao = params.get('funcao') || 'costureira';
    const q = (params.get('q') || '').toLowerCase();
    const [{ data: cands }, { data: rels }] = await Promise.all([
      sb.from('candidaturas').select('*, users(nome)').eq('malharia_destino_id', RAW_MALHARIA.id).eq('funcao', funcao).in('status', ['aprovado', 'vinculo_ativo']),
      sb.from('relatorios_entrega').select('user_id, pecas').eq('malharia_destino_id', RAW_MALHARIA.id).eq('status', 'conferido')
    ]);
    const itens = (cands || []).filter(c => !q || (c.users?.nome || '').toLowerCase().includes(q)).map(c => {
      const enviadas = (rels || []).filter(r => r.user_id === c.user_id).reduce((a, b) => a + b.pecas, 0);
      return { id: c.id, nome: c.users?.nome, valor_peca: c.valor_peca, capacidade_diaria: c.capacidade_diaria, status: c.status, enviadas };
    });
    return { funcao, funcao_nome: FUNCOES[funcao], itens };
  }
  if (path === '/supervisor/terceirizacao/pendencias') {
    const mid = RAW_MALHARIA.id;
    const [{ data: cands }, { data: rels }] = await Promise.all([
      sb.from('candidaturas').select('*, users(nome)').eq('malharia_destino_id', mid).in('status', ['em_analise', 'aprovado']),
      sb.from('relatorios_entrega').select('*, users(nome)').eq('malharia_destino_id', mid).eq('status', 'aguardando')
    ]);
    return {
      candidaturas: (cands || []).map(c => ({ ...c, nome: c.users?.nome, funcao_nome: FUNCOES[c.funcao] })),
      relatorios: (rels || []).map(r => ({ ...r, nome: r.users?.nome }))
    };
  }
  if (path.startsWith('/supervisor/candidaturas/') && method === 'POST') {
    const cid = Number(path.split('/')[3]);
    const novo = { aprovar: 'aprovado', ativar: 'vinculo_ativo', recusar: 'recusado' }[body.acao];
    const { data: c } = await sb.from('candidaturas').update({ status: novo }).eq('id', cid).select().single();
    if (c) await notificar(c.user_id, `Sua candidatura em ${RAW_MALHARIA.nome_fantasia} (${FUNCOES[c.funcao]}): ${novo.replace('_', ' ')}.`);
    return { ok: true };
  }
  if (path.startsWith('/supervisor/relatorios/') && method === 'POST') {
    const rid = Number(path.split('/')[3]);
    const { data: r } = await sb.from('relatorios_entrega').update({ status: 'conferido' }).eq('id', rid).select().single();
    if (r) await notificar(r.user_id, `Seu relatório do lote ${r.lote} foi conferido.`);
    return { ok: true };
  }

  if (path === '/supervisor/analise/pedidos') {
    const mid = RAW_MALHARIA.id;
    const [{ data: peds }, { data: maqs }] = await Promise.all([
      sb.from('pedidos').select('*').eq('malharia_id', mid).neq('status', 'finalizado').order('id'),
      sb.from('maquinas').select('*').eq('malharia_id', mid).order('apelido')
    ]);
    const listaPeds = peds || [];
    const listaMaqs = maqs || [];

    const metaAcumulada = listaPeds.reduce((s, p) => s + (p.meta || 0), 0);
    const prodRealizada = listaPeds.reduce((s, p) => s + (p.produzido || 0), 0);
    const deficit = Math.max(0, metaAcumulada - prodRealizada);
    const pctAtingida = metaAcumulada ? Number(((100 * prodRealizada) / metaAcumulada).toFixed(1)) : 0;

    const diasSem = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const porMaquina = listaMaqs.map((m, idx) => {
      const pedsMaq = listaPeds.filter(p => p.maquina_id === m.id);
      const meta = pedsMaq.reduce((s, p) => s + (p.meta || 0), 0);
      const prod = pedsMaq.reduce((s, p) => s + (p.produzido || 0), 0);
      const pct = meta ? Math.round((100 * prod) / meta) : 0;
      return { id: m.id, apelido: m.apelido, dia: diasSem[(idx + 1) % 7], meta, produzido: prod, pct };
    });

    const ativasComMeta = porMaquina.filter(m => m.meta > 0);
    const eficienciaMedia = ativasComMeta.length
      ? Number((ativasComMeta.reduce((s, m) => s + m.pct, 0) / ativasComMeta.length).toFixed(1))
      : 0;

    return {
      meta_acumulada: metaAcumulada,
      producao_realizada: prodRealizada,
      pct_atingida: pctAtingida,
      eficiencia_media: eficienciaMedia,
      deficit,
      maquinas: porMaquina
    };
  }

  if (path === '/supervisor/analise/perdas') {
    const mid = RAW_MALHARIA.id;
    const [{ data: ocs }, { data: maqs }, { data: peds }] = await Promise.all([
      sb.from('ocorrencias').select('*').eq('malharia_id', mid).order('pecas_avariadas', { ascending: false }),
      sb.from('maquinas').select('*').eq('malharia_id', mid),
      sb.from('pedidos').select('produzido, avariadas').eq('malharia_id', mid)
    ]);
    const listaOcs = ocs || [];
    const listaMaqs = maqs || [];
    const listaPeds = peds || [];

    const totalPecasAv = listaOcs.reduce((s, o) => s + (o.pecas_avariadas || 0), 0);
    const perdaKg = Number((totalPecasAv * 0.25).toFixed(1));
    const prodTotal = listaPeds.reduce((s, p) => s + (p.produzido || 0), 0);
    const indiceAvaria = prodTotal ? Number(((100 * totalPecasAv) / prodTotal).toFixed(1)) : 0;
    const custoEstimado = Math.round(perdaKg * 35);

    const porMaqMap = new Map();
    for (const o of listaOcs) {
      if (!o.pecas_avariadas || o.pecas_avariadas <= 0) continue;
      const m = listaMaqs.find(x => x.id === o.maquina_id);
      const nomeMaq = m ? m.apelido : `Máquina #${o.maquina_id}`;
      const kg = Number((o.pecas_avariadas * 0.25).toFixed(1));
      const pct = prodTotal ? Number(((100 * o.pecas_avariadas) / prodTotal).toFixed(1)) : 0;
      const cur = porMaqMap.get(nomeMaq) || { maquina: nomeMaq, motivo: o.motivo, kg: 0, pct: 0 };
      if (kg >= cur.kg) cur.motivo = o.motivo;
      cur.kg = Number((cur.kg + kg).toFixed(1));
      cur.pct = Number((cur.pct + pct).toFixed(1));
      porMaqMap.set(nomeMaq, cur);
    }

    const itens = [...porMaqMap.values()]
      .sort((a, b) => b.kg - a.kg)
      .map(it => ({ ...it, classificacao: it.pct >= 3.0 || it.kg >= 5 ? 'Crítica' : 'Atenção' }));

    return {
      perda_kg: perdaKg,
      indice_avaria: indiceAvaria,
      meta_maxima: RAW_MALHARIA.meta_perda || 3.0,
      maquinas_afetadas: itens.length,
      criticas: itens.filter(x => x.classificacao === 'Crítica').length,
      atencao: itens.filter(x => x.classificacao === 'Atenção').length,
      custo_estimado: custoEstimado,
      itens
    };
  }

  if (path === '/supervisor/analise/producao-meta') {
    const mid = RAW_MALHARIA.id;
    const turnoFiltro = params.get('turno') || turnoPorHora();
    const [{ data: maqs }, { data: peds }, { data: us }] = await Promise.all([
      sb.from('maquinas').select('*').eq('malharia_id', mid).order('apelido'),
      sb.from('pedidos').select('*').eq('malharia_id', mid).neq('status', 'finalizado'),
      sb.from('users').select('id, nome, turno').eq('malharia_id', mid)
    ]);

    const listaMaqs = maqs || [];
    const listaPeds = peds || [];
    const listaUsers = us || [];

    const cards = listaMaqs.map(m => {
      const p = listaPeds.find(x => x.maquina_id === m.id);
      const op = p ? listaUsers.find(u => u.id === p.operador_id) : null;
      if (turnoFiltro !== 'todos' && op && op.turno !== turnoFiltro) return null;

      const meta = p ? p.meta : 0;
      const produzido = p ? p.produzido : 0;
      const pct = meta ? Math.round((100 * produzido) / meta) : 0;

      let ritmo = 0;
      if (p && p.iniciado_em && produzido > 0) {
        const horas = Math.max(0.5, (Date.now() - new Date(p.iniciado_em).getTime()) / 3600000);
        ritmo = Math.round(produzido / horas);
      }

      let badge = 'Disponível', badgeCls = 'blue', barCls = 'navy';
      if (m.status === 'parada' || m.status === 'manutencao') { badge = 'Parada'; badgeCls = 'red'; barCls = 'danger'; }
      else if (p && pct < 70) { badge = 'Atenção'; badgeCls = 'amber'; barCls = 'warn'; }
      else if (m.status === 'operando' || p) { badge = 'Produzindo'; badgeCls = 'green'; barCls = 'navy'; }

      return {
        id: m.id, apelido: m.apelido,
        op_desc: p ? `${p.codigo} • ${p.modelo}` : (m.aviso || 'Sem ordem vinculada'),
        produzido, meta, pct,
        operador: op ? op.nome : 'Não atribuído',
        ritmo, badge, badgeCls, barCls
      };
    }).filter(Boolean);

    const totalProd = cards.reduce((s, c) => s + c.produzido, 0);
    const totalMeta = cards.reduce((s, c) => s + c.meta, 0);
    const metaGeralPct = totalMeta ? Math.round((100 * totalProd) / totalMeta) : 0;
    const comMeta = cards.filter(c => c.meta > 0);
    const eficMedia = comMeta.length ? Number((comMeta.reduce((s, c) => s + c.pct, 0) / comMeta.length).toFixed(1)) : 0;
    const naMeta = comMeta.filter(c => c.pct >= 70).length;
    const emAtencao = comMeta.filter(c => c.pct < 70).length;

    return {
      turno_atual: turnoPorHora(),
      meta_geral_pct: metaGeralPct, total_produzido: totalProd, total_meta: totalMeta,
      eficiencia_media: eficMedia, na_meta: naMeta, total_maquinas: cards.length,
      em_atencao: emAtencao, maquinas: cards
    };
  }

  return { ok: true };
}

async function loadMe() { try { ME = await api('/me'); } catch { ME = null; } return ME; }

function toast(msg, tipo = '') {
  const t = document.createElement('div'); t.className = 'toast ' + tipo; t.textContent = msg;
  $('#toasts').append(t); setTimeout(() => t.remove(), 4500);
}
const ok = m => toast(m, 'ok'), bad = e => toast(e.message || String(e), 'err');
async function tryDo(fn) { try { return await fn(); } catch (e) { bad(e); } }

function modal(html, onready) {
  const bg = document.createElement('div'); bg.className = 'modalbg';
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  const close = () => bg.remove();
  bg.addEventListener('mousedown', e => { if (e.target === bg) close(); });
  bg.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
  document.body.append(bg); onready && onready(bg.firstElementChild, close);
  const f = bg.querySelector('input,select,textarea'); f && f.focus();
  return close;
}

/* ---------- formatação ---------- */
const fmtData = s => { if (!s) return '-'; const iso = s.length === 10 ? s + 'T12:00:00' : (s.includes('T') ? s : s.replace(' ', 'T') + 'Z'); const d = new Date(iso); return isNaN(d) ? s : d.toLocaleDateString('pt-BR'); };
const brl = n => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const mascCnpj = v => { v = v.replace(/\D/g, '').slice(0, 14); return v.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2'); };
const mascCep = v => v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
const iniciais = n => String(n || 'KN').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
const hojeISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const statusPillKey = {
  operando: ['amber', 'st_produzindo'], disponivel: ['blue', 'st_disponivel'],
  pausada: ['amber', 'st_pausada'], parada: ['red', 'st_erro'],
  manutencao: ['red', 'st_parada'], finalizada: ['green', 'st_finalizada']
};
const mpill = s => {
  const [c, k] = statusPillKey[s] || ['gray', s];
  return `<span class="pill ${c}">${t(k)}</span>`;
};

/* ---------- roteador ---------- */
const go = p => { if (location.hash === '#' + p) render(); else location.hash = p; };
window.addEventListener('hashchange', () => render());
const PUBLIC = new Set(['/', '/registro', '/cadastro', '/cadastro/malharia', '/cadastro/funcionario', '/login']);
const NAV = {
  funcionario: [['/ponto', 'home', 'Ponto Eletrônico'], ['/turnos', 'chart', 'Preferência de turnos'], ['/maquinas', 'cpu', 'Máquinas'], ['/terceirizacao', 'users', 'Terceirização']],
  supervisor: [['/inicio', 'home', 'Início'], ['/producao', 'chart', 'Produção'], ['/estoque', 'box', 'Estoque'], ['/maquinas', 'cpu', 'Máquinas'], ['/terceirizacao', 'users', 'Terceirização']],
};
const VIEWS = { funcionario: {}, supervisor: {} };

async function render() {
  clearInterval(window.__tick);
  const path = (location.hash.slice(1) || '/').split('?')[0];
  if (!ME) await loadMe();
  if (PUBLIC.has(path)) {
    if (ME && (path === '/login' || path === '/registro')) return go(ME.papel === 'supervisor' ? '/inicio' : '/ponto');
    return PUBLICVIEWS[path]();
  }
  if (!ME) return go('/login');
  if (ME.status === 'pendente') return telaEspera('Aguardando aprovação', 'O supervisor da malharia precisa aprovar o seu acesso. Você será avisado assim que isso acontecer.', true);
  if (ME.status === 'bloqueado') return telaEspera('Acesso bloqueado', 'Fale com o supervisor da sua malharia.', false);
  if (ME.malharia.cnpj_status !== 'verificado') return telaVerificacao();
  const v = VIEWS[ME.papel][path];
  if (!v) return go(ME.papel === 'supervisor' ? '/inicio' : '/ponto');
  await shell(path, v);
}

async function sair() { await tryDo(() => api('/auth/logout', { method: 'POST' })); ME = null; go('/'); }

/* ---------- shell (menu lateral + barra superior + Popover de Perfil) ---------- */
function turnoPorHora() { const h = new Date().getHours(); return h >= 6 && h < 12 ? 'manha' : h >= 12 && h < 18 ? 'tarde' : 'noite'; }

async function shell(path, view) {
  const nav = NAV[ME.papel];
  const prefs = getPrefs();
  const allAccounts = getSavedAccounts(prefs);
  const otherAccounts = allAccounts.filter(
    a => (a.email || '').toLowerCase() !== (prefs.email || '').toLowerCase()
  );

  const papelTxt = ME.papel === 'supervisor' ? t('role_sup') : t('role_func');
  const turno = ME.papel === 'funcionario' ? ME.turno : prefs.turno;
  const portalKey = ME.papel === 'funcionario' ? 'portal_func' : 'portal_sup';
  const NAV_KEYS = {
    '/inicio': 'nav_inicio', '/producao': 'nav_producao', '/estoque': 'nav_estoque',
    '/maquinas': 'nav_maquinas', '/terceirizacao': 'nav_terceirizacao',
    '/ponto': 'nav_ponto', '/turnos': 'nav_turnos'
  };
  const SUB_KEYS = {
    '/inicio/pedidos': 'ped_em_prod',
    '/inicio/perdas': 'analise_perdas',
    '/inicio/producao-meta': 'prod_meta',
    '/configuracoes': 'cfg_titulo',
  };
  const navItem = nav.find(n => n[0] === path);
  const label = SUB_KEYS[path] ? t(SUB_KEYS[path]) : (navItem ? t(NAV_KEYS[navItem[0]]) : t('funcionarios'));
  const isSubInicio = path.startsWith('/inicio/');
  const isCfg = path === '/configuracoes';
  const avatarInner = prefs.fotoBase64 ? `<img src="${prefs.fotoBase64}" alt="${esc(prefs.nome)}">` : esc(iniciais(prefs.nome));
  const turnoHoras = { manha: '06:00 - 12:00', tarde: '12:00 - 18:00', noite: '18:00 - 00:00' };

  $('#app').innerHTML = `
  <div class="shell">
    <aside class="side">
      <a class="logo" href="#/">${LOGO}<span>KnittingNet</span></a>
      <nav class="nav">${nav.map(([p, i, lbl]) => `<a href="#${p}" class="${p === path || (p === '/inicio' && isSubInicio) ? 'on' : ''}">${ic(i)}<span data-i18n="${NAV_KEYS[p] || ''}">${t(NAV_KEYS[p]) || lbl}</span></a>`).join('')}</nav>
      <div class="sidecard"><b>${esc(ME.malharia.nome)}</b>${t('turno_lbl')} - ${t('turno_' + turno)} · ${turnoHoras[turno] || '06:00 - 12:00'}
        <small>${ME.ultima_sync ? `${t('sincronizado_em')} ` + new Date(ME.ultima_sync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : t('atualizado_agora')}</small>
        <span class="pill ${ME.em_turno ? 'amber' : ''}">${ME.em_turno ? t('st_em_turno') : t('st_ativo')}</span></div>
    </aside>
    <div class="main">
      <header class="top">
        <div class="crumb"><span data-i18n="${portalKey}">${t(portalKey)}</span> <span>›</span> <b>${label}</b></div>
        <button class="iconbtn" id="bell" aria-label="Notificações">${ic('bell')}${ME.nao_lidas ? '<span class="dot"></span>' : ''}</button>
        <button class="iconbtn ${isCfg ? 'active' : ''}" id="gear" aria-label="${t('cfg_titulo')}" title="${t('cfg_titulo')}">${ic('gear')}</button>

        <div class="who-wrap" id="who-wrap">
          <button type="button" class="who-btn" id="who-trigger" aria-haspopup="true" aria-expanded="false">
            <div class="avatar" id="top-user-avatar">${avatarInner}</div>
            <div>
              <b id="top-user-name">${esc(prefs.nome)}</b>
              <small>${papelTxt}</small>
            </div>
            <span class="who-chevron">${ic('down')}</span>
          </button>

          <div class="profile-popover hidden" id="profile-popover" role="menu">
            <div class="pp-active">
              <div class="pp-email">${esc(prefs.email)}</div>
              <div class="pp-avatar-lg" id="pp-avatar-lg">${avatarInner}</div>
              <div class="pp-name" id="pp-name">${esc(prefs.nome)}</div>
              <span class="pp-role">${papelTxt}</span>
              <div>
                <button type="button" class="pp-manage-btn" id="pp-btn-manage">
                  ${ic('gear')}
                  <span data-i18n="pp_alterar_perfil">${t('pp_alterar_perfil')}</span>
                </button>
              </div>
            </div>

            <div class="pp-section-title" data-i18n="pp_trocar_conta">${t('pp_trocar_conta')}</div>
            <div class="pp-accounts">
              ${otherAccounts.map(acc => `
                <button type="button" class="pp-acc-item" data-switch-email="${esc(acc.email)}">
                  <div class="pp-acc-av">${acc.fotoBase64 ? `<img src="${acc.fotoBase64}" alt="${esc(acc.nome)}">` : esc(iniciais(acc.nome))}</div>
                  <div class="pp-acc-info">
                    <b>${esc(acc.nome)}</b>
                    <small>${esc(acc.cargo || acc.email)} · ${esc(acc.email)}</small>
                  </div>
                </button>
              `).join('')}

              <button type="button" class="pp-add-acc" id="pp-btn-add">
                <span class="pp-add-ic">${ic('plus')}</span>
                <span data-i18n="pp_add_conta">${t('pp_add_conta')}</span>
              </button>
            </div>

            <div class="pp-footer">
              <button type="button" class="pp-logout-btn" id="pp-btn-logout">
                ${ic('out')}
                <span data-i18n="pp_sair_perfil">${t('pp_sair_perfil')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main class="page" id="content">
        <div class="skel skel-title"></div>
        <div class="skel skel-sub"></div>
        <div class="grid g3" style="margin-bottom:18px">
          <div class="skel skel-card"></div>
          <div class="skel skel-card"></div>
          <div class="skel skel-card"></div>
        </div>
        <div class="grid g12">
          <div class="skel skel-panel"></div>
          <div class="skel skel-panel"></div>
        </div>
      </main>
    </div>
  </div>`;

  $('#bell').onclick = abrirNotificacoes;
  $('#gear').onclick = () => go('/configuracoes');

  const trigger = $('#who-trigger');
  const popover = $('#profile-popover');

  const fecharPopover = () => {
    if (!popover || popover.classList.contains('hidden')) return;
    popover.classList.add('hidden');
    trigger.setAttribute('aria-expanded', 'false');
  };

  const abrirPopover = () => {
    $('.drop-menu')?.remove();
    popover.classList.remove('hidden');
    trigger.setAttribute('aria-expanded', 'true');
  };

  trigger.onclick = e => {
    e.stopPropagation();
    const aberto = trigger.getAttribute('aria-expanded') === 'true';
    aberto ? fecharPopover() : abrirPopover();
  };

  if (window.__profileOutsideHandler) {
    document.removeEventListener('click', window.__profileOutsideHandler);
  }
  window.__profileOutsideHandler = e => {
    if (!e.target.closest('#who-wrap')) fecharPopover();
  };
  document.addEventListener('click', window.__profileOutsideHandler);

  if (window.__profileEscHandler) {
    document.removeEventListener('keydown', window.__profileEscHandler);
  }
  window.__profileEscHandler = e => {
    if (e.key === 'Escape') fecharPopover();
  };
  document.addEventListener('keydown', window.__profileEscHandler);

  $('#pp-btn-manage').onclick = async () => {
    fecharPopover();
    await go('/configuracoes');
    requestAnimationFrame(() => {
      const cardPerfil = $('#cfg-av-preview')?.closest('.card');
      cardPerfil?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      $('#btn-alterar-foto')?.focus();
    });
  };

  $$('[data-switch-email]', popover).forEach(btn => {
    btn.onclick = async () => {
      const emailAlvo = btn.dataset.switchEmail;
      const conta = otherAccounts.find(a => a.email === emailAlvo);
      fecharPopover();
      if (conta) await trocarContaAtiva(conta);
    };
  });

  $('#pp-btn-add').onclick = () => {
    fecharPopover();
    localStorage.removeItem('kn_user_email');
    ME = null;
    go('/login');
  };

  $('#pp-btn-logout').onclick = async () => {
    fecharPopover();
    await encerrarSessaoPerfil();
  };

  aplicarPreferenciasGlobais(prefs);
  try {
    await view($('#content'));
    iniciarSegLiquido($('#content'));
  } catch (e) {
    $('#content').innerHTML = `<div class="banner">${esc(e.message)}</div>`;
  }
}

async function abrirNotificacoes(e) {
  e.stopPropagation();
  $('#profile-popover')?.classList.add('hidden');
  $('#who-trigger')?.setAttribute('aria-expanded', 'false');
  const old = $('.drop-menu'); if (old) return old.remove();
  const lista = await tryDo(() => api('/notificacoes')); if (!lista) return;
  const m = document.createElement('div'); m.className = 'drop-menu';
  m.innerHTML = lista.length ? lista.map(n => `<div class="it ${n.lida ? '' : 'new'}">${esc(n.texto)}<br><small>${new Date(n.criado_em).toLocaleString('pt-BR')}</small></div>`).join('') : `<div class="empty">${t('nada_encontrado')}</div>`;
  $('.top').append(m);
  const fechar = () => { m.remove(); document.removeEventListener('click', fechar); };
  setTimeout(() => document.addEventListener('click', fechar), 0);
  if (ME.nao_lidas) { await api('/notificacoes/lidas', { method: 'POST' }); ME.nao_lidas = 0; $('#bell .dot')?.remove(); }
}

aplicarPreferenciasGlobais(getPrefs());

/* ---------- telas de espera ---------- */
function pubFrame(inner) {
  return `<div class="pub"><div class="pubbar"><a class="logo" href="#/">${LOGO}<span>KnittingNet</span></a><span></span></div>
  <div class="stage fabric">${inner}</div>
  <div class="pubfoot"><div><a class="logo" href="#/" style="padding:0 0 6px">${LOGO}<span>KnittingNet</span></a><p>ERP para malharias com foco em operação, margem e escala.</p></div><div>© ${new Date().getFullYear()}<br>KnittingNet</div></div></div>`;
}
function telaEspera(titulo, msg, podeAtualizar) {
  $('#app').innerHTML = pubFrame(`<div class="formcard"><h1>${titulo}</h1><p class="sw" style="margin-top:12px">${msg}</p>
    ${podeAtualizar ? '<button class="btn" id="re">Verificar novamente</button>' : ''}<button class="btn" style="background:transparent;border:1px solid #8b97d1" id="out">Sair</button></div>`);
  $('#out').onclick = sair; const re = $('#re'); if (re) re.onclick = async () => { ME = null; await render(); };
}
function telaVerificacao() {
  const rej = ME.malharia.cnpj_status === 'rejeitado';
  if (ME.papel !== 'supervisor') return telaEspera('Malharia em verificação', 'O CNPJ desta malharia ainda não foi confirmado. Tente novamente mais tarde.', true);
  $('#app').innerHTML = pubFrame(`<div class="formcard wide"><h1>${rej ? 'CNPJ não aprovado' : 'Confirmando o CNPJ'}</h1>
    <p class="sw" style="margin-top:12px">${rej ? `A Receita Federal informa a situação <b>${esc(ME.malharia.cnpj_situacao || 'irregular')}</b> para o CNPJ ${esc(ME.malharia.cnpj)}. Só malharias com CNPJ <b>ATIVO</b> podem usar a plataforma.`
      : `Ainda não conseguimos confirmar o CNPJ <b>${esc(ME.malharia.cnpj)}</b> na Receita Federal. Seu acesso aos módulos será liberado assim que a confirmação for concluída.`}</p>
    <div id="vm"></div><button class="btn" id="rv">Tentar confirmar agora</button><button class="btn" style="background:transparent;border:1px solid #8b97d1" id="out">Sair</button></div>`);
  $('#out').onclick = sair;
  $('#rv').onclick = async () => {
    $('#vm').innerHTML = '<div class="msg wait">Consultando a Receita Federal…</div>';
    try { const r = await api('/malharia/reverificar', { method: 'POST' }); if (r.ok) { ok('CNPJ confirmado!'); ME = null; render(); } else { ME = null; await render(); } }
    catch (e) { $('#vm').innerHTML = `<div class="msg bad">${esc(e.message)}</div>`; }
  };
}

/* ---------- páginas públicas ---------- */
const PUBLICVIEWS = {
  '/'() {
    const entrar = ME ? `<a class="btn light" href="#${ME.papel === 'supervisor' ? '/inicio' : '/ponto'}">Abrir painel</a>` : '<a class="btn light" href="#/login">Entrar</a>';
    $('#app').innerHTML = `<div class="pub"><div class="pubbar"><a class="logo" href="#/">${LOGO}<span>KnittingNet</span></a>${entrar}</div>
    <section class="hero"><span class="tag">Plataforma especializada para malharias</span>
      <h1>Venda melhor, produza com previsibilidade e tenha controle do seu chão de fábrica.</h1>
      <p>O KnittingNet conecta precificação, pedidos, produção e matérias-primas em um único fluxo para sua operação crescer com margem.</p>
      <a class="btn light" href="#/registro">Conheça por aqui</a></section>
    <section class="land"><h2>Por que escolher o KnittingNet</h2><div class="sub">&nbsp;</div>
      <div class="tiles">
        <div class="tile">${ic('gauge')}<b>Implantação rápida</b><span>Fluxo de entrada guiado para começar a operar sem um projeto longo de implantação.</span></div>
        <div class="tile">${ic('eye')}<b>Visão ponta a ponta</b><span>Do orçamento ao apontamento de produção, todos os dados fluem no mesmo contexto.</span></div>
        <div class="tile">${ic('list')}<b>Controle com rastreabilidade</b><span>Tenha histórico de lotes, resumos e desempenho por operação e por malharia.</span></div></div>
      <h2>Módulos que aceleram resultado</h2><div class="sub">Estrutura pensada para o dia a dia de malharias, com expansão por perfil e operação.</div>
      <div class="tiles">
        <div class="tile">${ic('tag')}<b>Precificação</b><span>Formação de preço com custos, margens e simulações para coleções especiais.</span></div>
        <div class="tile">${ic('gear')}<b>Produção e malharia</b><span>Acompanhamento de ordens, programação e vínculo com máquinas e lotes.</span></div>
        <div class="tile">${ic('box')}<b>Estoque e insumos</b><span>Fios, aviamentos e produtos acabados com rastreio por malharia.</span></div></div>
      <div class="cta"><div><h3>Pronto para modernizar a gestão da sua malharia?</h3><p>Crie sua conta, conclua o cadastro inicial e tenha um painel pronto para operar com o seu time.</p><a class="btn light" href="#/registro">Cadastre-se aqui</a></div><div class="pic"></div></div>
    </section>
    <div class="pubfoot"><div><a class="logo" href="#/" style="padding:0 0 6px">${LOGO}<span>KnittingNet</span></a><p>ERP para malharias com foco em operação, mapa e escala.</p></div><div>© ${new Date().getFullYear()}<br>KnittingNet</div></div></div>`;
  },

  '/registro'() {
    $('#app').innerHTML = pubFrame(`<form class="formcard" id="f"><h1>Registre-se</h1><p class="sw">Já tem uma conta? <a href="#/login">Fazer login</a></p>
      <button type="button" class="social" data-p="google"><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5H1.2v3.1C3.2 21.3 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.2 14.2c-.2-.7-.4-1.5-.4-2.2s.2-1.5.4-2.2V6.7H1.2C.4 8.3 0 10.1 0 12s.4 3.7 1.2 5.3l4-3.1z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.7l4 3.1c.9-2.9 3.6-5 6.8-5z"/></svg>Continuar com Google</button>
      <button type="button" class="social" data-p="apple"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M17.1 12.6c0-2.7 2.2-4 2.3-4.1-1.3-1.8-3.2-2.1-3.9-2.1-1.6-.2-3.2 1-4 1s-2.1-1-3.5-.9c-1.8 0-3.4 1-4.3 2.6-1.9 3.2-.5 7.9 1.3 10.5.9 1.3 1.9 2.7 3.3 2.6 1.3-.1 1.8-.8 3.4-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.2-2.5 1-1.5 1.4-2.9 1.4-3-.1-.1-2.6-1-2.6-4.1zM14.5 4.7c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.6.7-1.2 2-1.1 3.1 1.2.1 2.3-.6 3-1.4z"/></svg>Continuar com Apple</button>
      <div class="or">ou</div>
      <div class="field"><label>E-mail</label><input name="email" type="email" required placeholder="seu@email.com"></div>
      <div class="field"><label>Senha</label><input name="senha" type="password" minlength="8" required placeholder="••••••••"><div class="hint">Use pelo menos 8 caracteres.</div></div>
      <div class="field"><label>Confirmar Senha</label><input name="senha2" type="password" required placeholder="••••••••"></div>
      <button class="btn">Continuar</button></form>`);
    $$('[data-p]').forEach(b => b.onclick = async () => { const r = await tryDo(() => api('/auth/oauth/' + b.dataset.p)); if (r) toast(r.aviso); });
    $('#f').onsubmit = e => {
      e.preventDefault(); const fd = new FormData(e.target);
      if (fd.get('senha') !== fd.get('senha2')) return bad('As senhas não coincidem.');
      sessionStorage.setItem('kn_email', fd.get('email')); sessionStorage.setItem('kn_senha', fd.get('senha')); go('/cadastro');
    };
  },

  '/cadastro'() {
    if (!sessionStorage.getItem('kn_email')) return go('/registro');
    $('#app').innerHTML = pubFrame(`<div class="formcard"><h1>Cadastro</h1><p class="sw">Já tem uma conta? <a href="#/login">Fazer login</a></p>
      <a class="btn" href="#/cadastro/malharia" style="display:flex;text-decoration:none;margin-bottom:12px">Sou responsável pela malharia</a>
      <a class="btn" href="#/cadastro/funcionario" style="display:flex;text-decoration:none">Sou funcionário</a></div>`);
  },

  '/cadastro/malharia'() {
    const email = sessionStorage.getItem('kn_email'); if (!email) return go('/registro');
    $('#app').innerHTML = pubFrame(`<form class="formcard wide" id="f"><h1>Cadastro da Malharia</h1><p class="sw">Preencha os dados da sua empresa.</p>
      <div class="step"><p><b>1º passo</b> — Informe o CNPJ para buscar os dados na Receita Federal.</p>
        <div class="inline"><input name="cnpj" id="cnpj" placeholder="00.000.000/0001-00" required><button type="button" class="btn" id="bcnpj">Consultar CNPJ</button></div><div id="mcnpj"></div></div>
      <div class="field"><label>Seu nome</label><input name="nome" required placeholder="Responsável / Supervisor"></div>
      <div class="row r2"><div class="field"><label>Razão Social</label><input name="razao_social" id="rz" required></div>
        <div class="field"><label>Nome Fantasia</label><input name="nome_fantasia" id="nf"></div></div>
      <div class="step"><p><b>2º passo</b> — O CEP completa o endereço.</p>
        <div class="inline"><input name="cep" id="cep" placeholder="00000-000"><button type="button" class="btn" id="bcep">Buscar CEP</button></div><div id="mcep"></div></div>
      <div class="row" style="grid-template-columns:2fr 1fr"><div class="field"><label>Logradouro</label><input name="logradouro" id="log"></div><div class="field"><label>Número</label><input name="numero" id="num"></div></div>
      <div class="row" style="grid-template-columns:1.2fr .6fr 1.2fr"><div class="field"><label>Bairro</label><input name="bairro" id="bai"></div><div class="field"><label>UF</label><input name="uf" id="uf" maxlength="2"></div><div class="field"><label>Cidade</label><input name="cidade" id="cid"></div></div>
      <button class="btn">Finalizar cadastro</button></form>`);
    $('#cnpj').oninput = e => e.target.value = mascCnpj(e.target.value);
    $('#cep').oninput = e => e.target.value = mascCep(e.target.value);
    const setMsg = (id, cls, txt) => $(id).innerHTML = `<div class="msg ${cls}">${txt}</div>`;
    $('#bcnpj').onclick = async () => {
      const c = $('#cnpj').value.replace(/\D/g, ''); if (c.length !== 14) return setMsg('#mcnpj', 'bad', 'Digite os 14 números do CNPJ.');
      setMsg('#mcnpj', 'wait', 'Consultando a Receita Federal…');
      try {
        const d = await api('/cnpj/' + c);
        if (d.existe === false) return setMsg('#mcnpj', 'bad', esc(d.erro));
        if (d.ja_cadastrada) return setMsg('#mcnpj', 'bad', 'Esta malharia já está cadastrada. Faça o cadastro de funcionário.');
        if (d.existe && !d.ativa) return setMsg('#mcnpj', 'bad', `CNPJ encontrado, mas a situação na Receita Federal é <b>${esc(d.situacao)}</b>.`);
        if (d.existe) {
          $('#rz').value = d.razao_social; $('#nf').value = d.nome_fantasia; $('#cep').value = mascCep(d.cep);
          $('#log').value = d.logradouro; $('#num').value = d.numero; $('#bai').value = d.bairro; $('#uf').value = d.uf; $('#cid').value = d.cidade;
          return setMsg('#mcnpj', 'ok', `CNPJ verificado — situação <b>ATIVA</b> na Receita Federal.`);
        }
        setMsg('#mcnpj', 'wait', esc(d.erro) + ' Preencha os dados manualmente; a confirmação automática será tentada depois.');
      } catch (e) { setMsg('#mcnpj', 'bad', esc(e.message)); }
    };
    $('#bcep').onclick = async () => {
      const c = $('#cep').value.replace(/\D/g, ''); if (c.length !== 8) return setMsg('#mcep', 'bad', 'Digite os 8 números do CEP.');
      setMsg('#mcep', 'wait', 'Buscando CEP…');
      try { const d = await api('/cep/' + c); $('#log').value = d.logradouro; $('#bai').value = d.bairro; $('#uf').value = d.uf; $('#cid').value = d.cidade; setMsg('#mcep', 'ok', 'Endereço preenchido.'); }
      catch (e) { setMsg('#mcep', 'bad', esc(e.message)); }
    };
    $('#f').onsubmit = async e => {
      e.preventDefault(); const body = Object.fromEntries(new FormData(e.target));
      body.email = email; body.senha = sessionStorage.getItem('kn_senha');
      const r = await tryDo(() => api('/auth/cadastro/malharia', { method: 'POST', body }));
      if (r) { sessionStorage.clear(); await loadMe(); go('/inicio'); }
    };
  },

  '/cadastro/funcionario'() {
    const email = sessionStorage.getItem('kn_email'); if (!email) return go('/registro');
    $('#app').innerHTML = pubFrame(`<form class="formcard" id="f"><h1>Cadastro de Funcionário</h1><p class="sw">Informe o CNPJ da malharia em que você trabalha.</p>
      <div class="field"><label>Seu nome</label><input name="nome" required placeholder="Nome completo"></div>
      <div class="field"><label>CNPJ da malharia</label><input name="cnpj" id="cnpj" required placeholder="00.000.000/0001-00"></div>
      <button class="btn">Solicitar acesso</button></form>`);
    $('#cnpj').oninput = e => e.target.value = mascCnpj(e.target.value);
    $('#f').onsubmit = async e => {
      e.preventDefault(); const body = Object.fromEntries(new FormData(e.target));
      body.email = email; body.senha = sessionStorage.getItem('kn_senha');
      const r = await tryDo(() => api('/auth/cadastro/funcionario', { method: 'POST', body }));
      if (r) { sessionStorage.clear(); await loadMe(); go('/ponto'); }
    };
  },

  '/login'() {
    $('#app').innerHTML = pubFrame(`<form class="formcard" id="f"><h1>Entrar</h1><p class="sw">Não tem uma conta? <a href="#/registro">Registre-se</a></p>
      <div class="field"><label>E-mail</label><input name="email" type="email" required placeholder="seu@email.com"></div>
      <div class="field"><label>Senha</label><input name="senha" type="password" required placeholder="••••••••"></div>
      <button class="btn">Entrar</button></form>`);
    $('#f').onsubmit = async e => {
      e.preventDefault();
      const body = Object.fromEntries(new FormData(e.target));
      if (await tryDo(() => api('/auth/login', { method: 'POST', body }))) {
        await loadMe();
        go(ME.papel === 'supervisor' ? '/inicio' : '/ponto');
      }
    };
  },
};

/* ---------- helpers compartilhados pelas views ---------- */
function toolbarHTML({ busca, buscaKey = '', filtros, atual }) {
  return `<div class="toolbar"><input type="search" id="tb-q" placeholder="${esc(busca)}" ${buscaKey ? `data-i18n-placeholder="${buscaKey}"` : ''}>
    <div class="seg" id="tb-f">${filtros.map(([k, l, iKey]) => `<button type="button" data-f="${k}" ${iKey ? `data-i18n="${iKey}"` : ''} class="${k === atual ? 'on' : ''}">${esc(l)}</button>`).join('')}</div>
    <button type="button" class="iconbtn" id="tb-fs" title="Tela cheia">${ic('expand')}</button></div>`;
}
function iniciarSegLiquido(root = document) {
  $$('.seg', root).forEach(seg => {
    if (seg.dataset.liquidReady) return;
    seg.dataset.liquidReady = '1';
    seg.classList.add('has-liquid');

    const pill = document.createElement('span');
    pill.className = 'seg-pill';
    seg.prepend(pill);

    const movePill = () => {
      const on = seg.querySelector('button.on');
      if (!on) return;
      pill.style.width = `${on.offsetWidth}px`;
      pill.style.transform = `translateX(${on.offsetLeft - 3}px)`;
    };

    requestAnimationFrame(movePill);
    new ResizeObserver(movePill).observe(seg);

    seg.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn || !seg.contains(btn)) return;

      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'water-ripple';
      ripple.style.left = `${(e.clientX || rect.left + rect.width / 2) - rect.left}px`;
      ripple.style.top = `${(e.clientY || rect.top + rect.height / 2) - rect.top}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      requestAnimationFrame(movePill);
    });
  });
}

function ligarToolbar(card, estado, onChange) {
  let tm; $('#tb-q', card).oninput = e => { clearTimeout(tm); tm = setTimeout(() => { estado.q = e.target.value; onChange(); }, 200); };
  iniciarSegLiquido(card);
  $('#tb-f', card).onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; $$('#tb-f button', card).forEach(x => x.classList.toggle('on', x === b)); estado.f = b.dataset.f; onChange(); };
  $('#tb-fs', card).onclick = () => card.classList.toggle('fs');
}

render();
