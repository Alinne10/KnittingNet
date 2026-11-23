/* Telas do supervisor (Painel de Produção) — 100% internacionalizado (i18n). */
'use strict';
const S = VIEWS.supervisor;
const PH = (eyebrow, titulo, extra = '') => `<div class="pagehead"><div><div class="eyebrow">${eyebrow}</div><h1>${titulo}</h1></div><div style="display:flex;gap:14px;align-items:center">${extra}<span class="sync">${t('dados_sync')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></div></div>`;
const tableCard = (titulo, tb, corpo) => `<div class="card" id="tc"><div class="hd"><div><h2>${titulo}</h2><div class="sub">${esc(ME.malharia.nome)}</div></div>${tb}</div><div class="tw" id="tbl">${corpo || ''}</div></div>`;
const corDot = hex => `<span class="dot" style="background:${esc(hex || '#9ca3af')}"></span>`;

/* ================= Início ================= */
S['/inicio'] = async el => {
  const est = { q: '', f: 'todos' };
  const d = await api('/supervisor/inicio');
  const dif = +(d.perdas - d.meta_perda).toFixed(1);
  el.innerHTML = PH(t('portal_sup'), t('visao_geral'), `<button class="btn" id="novaop">${ic('plus')} ${t('nova_op')}</button>`) + `
    <div class="grid g3" style="margin-bottom:20px">
      <div class="card stat"><div class="sub" style="font-weight:600">${t('ped_em_prod')}</div><div class="ic">${ic('chart')}</div><div class="big">${d.pedidos_em_producao}</div><div class="good">${t('abertos_hoje', { n: d.criados_hoje })}</div><hr><a class="btn ghost sm" href="#/inicio/pedidos">${t('ver_mais')} ${ic('right')}</a></div>
      <div class="card stat"><div class="sub" style="font-weight:600">${t('perdas')}</div><div class="ic">${ic('trend')}</div><div class="big">${String(d.perdas).replace('.', ',')}%</div><div class="good" style="color:${dif > 0 ? 'var(--red)' : 'var(--green)'}">${Math.abs(dif).toFixed(1).replace('.', ',')} p.p. ${dif > 0 ? t('acima_meta') : t('abaixo_meta')} ${t('da_meta')} (${String(d.meta_perda).replace('.', ',')}%)</div><hr><a class="btn ghost sm" href="#/inicio/perdas">${t('ver_mais')} ${ic('right')}</a></div>
      <div class="card stat"><div class="sub" style="font-weight:600">${t('ops_ativas')}</div><div class="ic">${ic('gear')}</div><div class="big">${d.operacoes_ativas}</div><div class="sub" style="display:flex;justify-content:space-between"><span>${t('da_meta_turno', { n: d.pct_meta })}</span><span>${d.pct_meta}%</span></div><div class="bar" style="margin-top:6px"><i style="width:${d.pct_meta}%"></i></div><hr><a class="btn ghost sm" href="#/inicio/producao-meta">${t('prod_meta')} ${ic('right')}</a></div></div>
    <div class="grid" style="grid-template-columns:1fr 2fr;align-items:start"><div class="card"><div class="hd"><div><h2>${t('status')}</h2><div class="sub">${t('maquinas_fabrica')}</div></div><span class="sub">${t('qtd_maquinas', { n: d.maquinas.length })}</span></div>
      ${d.maquinas.map(m => `<div class="listrow" style="cursor:default"><span class="dot ${m.status}"></span><div class="grow"><b>${esc(m.apelido)}</b><small>${esc(m.detalhe)}</small></div>${mpill(m.status)}</div>`).join('') || `<div class="empty">${t('nenhuma_maq')}</div>`}
      <a class="listrow" href="#/maquinas" style="justify-content:center;color:var(--muted);text-decoration:none">${t('ver_todas_maqs')} ${ic('right')}</a></div>
    <div id="ped"></div></div>`;
  $('#novaop', el).onclick = () => novaOP(() => S['/inicio'](el));

  const box = $('#ped', el);
  async function pedidos() {
    const r = await tryDo(() => api(`/supervisor/inicio?q=${encodeURIComponent(est.q)}&filtro=${est.f}`)); if (!r) return;
    $('#tbl', box).innerHTML = `<table><thead><tr><th>${t('th_maquina')}</th><th>${t('th_modelo')}</th><th>${t('th_cor')}</th><th>${t('th_operador')}</th><th>${t('th_meta')}</th><th>${t('th_producao')}</th><th>${t('th_progresso')}</th><th>${t('th_tempo')}</th></tr></thead><tbody>
      ${r.pedidos.map(p => `<tr><td><b>${esc(p.maquina || '—')}</b></td><td>${esc(p.modelo)}</td><td>${corDot(p.cor_hex)}${esc(p.cor || '')}</td><td>${esc(p.operador || '—')}</td><td>${p.meta}</td><td>${p.produzido}</td>
        <td style="min-width:130px"><div style="display:flex;gap:8px;align-items:center"><div class="bar ${p.progresso < 60 || p.atrasado ? 'warn' : ''}" style="flex:1"><i style="width:${p.progresso}%"></i></div>${p.progresso}%</div></td><td>${p.atrasado ? `<span class="pill red">${t('st_atrasado')}</span>` : esc(p.tempo)}</td></tr>`).join('') || `<tr><td colspan="8" class="empty">${t('nenhum_ped')}</td></tr>`}</tbody></table>
      <div class="hint" style="padding:10px 18px">${t('exibindo_peds', { n: r.pedidos.length })}</div>`;
  }
  box.innerHTML = tableCard(t('ped_em_prod'), toolbarHTML({
    busca: t('busca_maq_mod'), buscaKey: 'busca_maq_mod',
    filtros: [['todos', t('flt_todos'), 'flt_todos'], ['andamento', t('flt_andamento'), 'flt_andamento'], ['atrasados', t('flt_atrasados'), 'flt_atrasados']],
    atual: 'todos'
  }));
  ligarToolbar($('#tc', box), est, pedidos); await pedidos();
};

function novaOP(depois) {
  api('/maquinas').then(ms => modal(`<h2>${t('nova_op')}</h2><form id="f"><div class="row r2"><div class="field"><label>${t('th_modelo')}</label><input name="modelo" required placeholder="Gola V"></div><div class="field"><label>${t('th_cor')}</label><input name="cor" placeholder="Azul-marinho"></div></div>
    <div class="row r3"><div class="field"><label>${t('th_meta')}</label><input type="number" name="meta" min="1" required></div><div class="field"><label>${t('th_maquina')}</label><select name="maquina_id"><option value="">—</option>${ms.map(m => `<option value="${m.id}">${esc(m.apelido)}</option>`).join('')}</select></div><div class="field"><label>${t('th_cod_cor')}</label><input type="color" name="cor_hex" value="#3f4b86" style="padding:3px;height:38px"></div></div>
    <div class="row r2"><div class="field"><label>${t('th_tempo')}</label><input type="datetime-local" name="prazo"></div><div class="field"><label>Código</label><input name="codigo" maxlength="20" placeholder="OP #2900"></div></div>
    <div class="acts"><button type="button" class="btn ghost" data-close>${t('btn_cancelar')}</button><button class="btn">${t('nova_op')}</button></div></form>`,
    (m, close) => $('#f', m).onsubmit = async e => { e.preventDefault(); const r = await tryDo(() => api('/supervisor/pedidos', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) })); if (r) { ok(r.codigo + ' OK'); close(); depois(); } })).catch(bad);
}

/* ================= Produção ================= */
S['/producao'] = async el => {
  const [p, tData] = await Promise.all([api('/supervisor/producao'), api('/supervisor/turnos')]);
  const abertos = new Set();
  const SOL_ST = (s) => `<div class="listrow" style="cursor:default;flex-wrap:wrap"><div class="grow"><b>${esc(s.nome)}</b><small>${t('turno_' + s.turno)} · ${fmtData(s.inicio_previsto)}${s.observacao ? ' · ' + esc(s.observacao) : ''}</small></div><button class="btn sm" data-s="${s.id}" data-a="aprovar">${t('aprovar')}</button><button class="btn ghost sm" data-s="${s.id}" data-a="recusar">${t('recusar')}</button></div>`;
  const cont = m => m.contagem && m.contagem !== '-' ? { operando: 'amber', parada: 'red', disponivel: 'blue', finalizada: 'green' }[m.status] || 'gray' : 'gray';
  function turnosHTML() {
    return tData.turnos.map(x => `<button class="listrow" data-t="${x.id}"><div class="grow"><b>${t('turno_da', { t: t('turno_' + x.id) })} · ${x.inicio} - ${x.fim}</b><small>${t('funcs_atribuidos', { n: x.funcionarios.length })}</small></div>${ic('right')}</button>
      ${abertos.has(x.id) ? `<div style="padding:8px 18px 12px 30px;background:rgba(148,163,184,0.08);border-bottom:1px solid var(--line)">${x.funcionarios.map(f => esc(f.nome)).join('<br>') || `<span class="sub">${t('ninguem_atribuido')}</span>`}</div>` : ''}`).join('');
  }
  el.innerHTML = PH(t('portal_sup'), t('nav_producao')) + `<div class="grid" style="grid-template-columns:1fr 1.5fr 1fr;align-items:start">
    <div class="card"><div class="hd"><div><h2>${t('status')}</h2><div class="sub">${t('prod_atuando')}</div></div><span class="sub">${t('qtd_funcs', { n: p.atuando.length })}</span></div>
      ${p.atuando.map(f => `<div class="listrow" style="cursor:default"><div class="avatar">${esc(iniciais(f.nome))}</div><div class="grow"><b>${esc(f.nome)}</b><small>${t('role_func')}</small></div></div>`).join('') || `<div class="empty">${t('ninguem_ponto')}</div>`}
      <a class="listrow" href="#/funcionarios" style="justify-content:center;color:var(--muted);text-decoration:none">${t('ver_todos_funcs')} ${ic('right')}</a></div>
    <div class="card"><div class="hd"><div><h2>${t('maqs_usadas')}</h2><div class="sub">${[...new Set(p.maquinas.map(m => t('setor') + ' ' + m.setor))].join(' · ')}</div></div><span class="sub">${t('qtd_maquinas', { n: p.maquinas.length })}</span></div>
      ${p.maquinas.map(m => `<div class="listrow" style="cursor:default"><span class="dot ${m.status}"></span><div class="grow"><b>${esc(m.apelido)}</b><small>${esc(m.detalhe)} · ${t('setor')} ${m.setor}</small></div><span class="pill ${cont(m)}">${esc(m.contagem)}</span></div>`).join('') || `<div class="empty">${t('nenhuma_maq')}</div>`}
      <a class="listrow" href="#/maquinas" style="justify-content:center;color:var(--muted);text-decoration:none">${t('ver_todas_maqs')} ${ic('right')}</a></div>
    <div class="card"><div class="hd"><div><h2>${t('turnos')}</h2><div class="sub">${t('turnos_sub')}</div></div></div><div id="tn">${turnosHTML()}</div>
      ${tData.solicitacoes.length ? `<div style="padding:12px 18px 4px;font-weight:600;font-size:13px">${t('sol_troca', { n: tData.solicitacoes.length })}</div>${tData.solicitacoes.map(SOL_ST).join('')}` : ''}</div></div>`;
  $('#tn', el).onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; abertos.has(b.dataset.t) ? abertos.delete(b.dataset.t) : abertos.add(b.dataset.t); $('#tn', el).innerHTML = turnosHTML(); };
  $$('[data-s]', el).forEach(b => b.onclick = async () => { if (await tryDo(() => api('/supervisor/turnos/' + b.dataset.s, { method: 'POST', body: { acao: b.dataset.a } }))) { ok(t('toast_salvo')); S['/producao'](el); } });
};

/* ================= Funcionários ================= */
S['/funcionarios'] = async el => {
  const fs = await api('/supervisor/funcionarios');
  const ST = { ativo: ['green', 'st_ativo'], pendente: ['amber', 'st_pendente'], bloqueado: ['red', 'st_bloqueado'] };
  el.innerHTML = PH(t('portal_sup'), t('funcionarios')) + tableCard(t('funcionarios'), '', `<table><thead><tr><th>${t('th_nome')}</th><th>${t('th_email')}</th><th>${t('th_turno')}</th><th>${t('th_status')}</th><th style="text-align:right">${t('th_acoes')}</th></tr></thead><tbody>
    ${fs.map(f => `<tr><td><b>${esc(f.nome)}</b></td><td>${esc(f.email)}</td><td>${t('turno_' + f.turno)}</td><td><span class="pill ${ST[f.status][0]}">${t(ST[f.status][1])}</span></td><td style="text-align:right">
      ${f.status === 'pendente' ? `<button class="btn sm" data-i="${f.id}" data-a="aprovar">${t('aprovar')}</button> ` : ''}${f.status === 'bloqueado' ? `<button class="btn ghost sm" data-i="${f.id}" data-a="reativar">${t('reativar')}</button>` : `<button class="btn ghost sm" data-i="${f.id}" data-a="bloquear">${t('bloquear')}</button>`}</td></tr>`).join('') || `<tr><td colspan="5" class="empty">${t('nenhum_func')}</td></tr>`}</tbody></table>`);
  $$('[data-i]', el).forEach(b => b.onclick = async () => { if (await tryDo(() => api('/supervisor/funcionarios/' + b.dataset.i, { method: 'POST', body: { acao: b.dataset.a } }))) S['/funcionarios'](el); });
};

/* ================= Estoque ================= */
S['/estoque'] = async el => {
  const est = { q: '', f: 'todos' };
  const ST = { recebido: '', em_andamento: '', atrasado: `<span class="pill red">${t('st_atrasado')}</span>` };
  el.innerHTML = PH(t('nav_estoque'), t('visao_geral'), `<button class="btn" id="novo">${ic('plus')} ${t('novo_lote')}</button>`) + tableCard(t('nav_estoque'), toolbarHTML({
    busca: t('busca_lote'), buscaKey: 'busca_lote',
    filtros: [['todos', t('flt_todos'), 'flt_todos'], ['andamento', t('flt_andamento'), 'flt_andamento'], ['atrasados', t('flt_atrasados'), 'flt_atrasados']],
    atual: 'todos'
  }));
  async function lista() {
    const r = await tryDo(() => api(`/estoque?q=${encodeURIComponent(est.q)}&filtro=${est.f}`)); if (!r) return;
    $('#tbl', el).innerHTML = `<table class="tc"><thead><tr><th>${t('th_marca')}</th><th>${t('th_modelo')}</th><th>${t('th_cor')}</th><th>${t('th_cod_cor')}</th><th>${t('th_lote')}</th><th>${t('th_fornecedor')}</th><th>${t('th_saldo')}</th><th>${t('th_data_reg')}</th><th></th></tr></thead><tbody>
      ${r.map(x => `<tr><td><b>${esc(x.marca)}</b></td><td>${esc(x.modelo)}</td><td style="text-align:left">${corDot(x.cor_hex)}${esc(x.cor)}</td><td>${esc(x.codigo_cor)}</td><td>${esc(x.lote)}</td><td>${esc(x.fornecedor)}</td><td><b>${String(x.saldo_kg).replace('.', ',')}kg</b> ${ST[x.status]}</td><td>${fmtData(x.registrado_em)}</td><td><button class="iconbtn" data-del="${x.id}" title="${t('cfg_remover')}">${ic('x')}</button></td></tr>`).join('') || `<tr><td colspan="9" class="empty">${t('nada_encontrado')}</td></tr>`}</tbody></table>`;
    $$('[data-del]', el).forEach(b => b.onclick = async () => { if (await tryDo(() => api('/estoque/' + b.dataset.del, { method: 'DELETE' }))) lista(); });
  }
  ligarToolbar($('#tc', el), est, lista); await lista();
  $('#novo', el).onclick = () => modal(`<h2>${t('novo_lote')}</h2><form id="f"><div class="row r2"><div class="field"><label>${t('th_marca')}</label><input name="marca" required></div><div class="field"><label>${t('th_modelo')}</label><input name="modelo"></div></div>
    <div class="row r3"><div class="field"><label>${t('th_cor')}</label><input name="cor"></div><div class="field"><label>${t('th_cod_cor')}</label><input name="codigo_cor" placeholder="#934155"></div><div class="field"><label>${t('th_cor')}</label><input type="color" name="cor_hex" value="#3f4b86" style="padding:3px;height:38px"></div></div>
    <div class="row r3"><div class="field"><label>${t('th_lote')}</label><input name="lote"></div><div class="field"><label>${t('th_fornecedor')}</label><input name="fornecedor"></div><div class="field"><label>${t('th_saldo')} (kg)</label><input name="saldo_kg" required inputmode="decimal"></div></div>
    <div class="row r2"><div class="field"><label>${t('th_data_reg')}</label><input type="date" name="registrado_em" value="${hojeISO()}"></div><div class="field"><label>${t('th_status')}</label><select name="status"><option value="recebido">OK</option><option value="em_andamento">${t('flt_andamento')}</option><option value="atrasado">${t('st_atrasado')}</option></select></div></div>
    <div class="acts"><button type="button" class="btn ghost" data-close>${t('btn_cancelar')}</button><button class="btn">${t('btn_salvar')}</button></div></form>`,
    (m, close) => $('#f', m).onsubmit = async e => { e.preventDefault(); if (await tryDo(() => api('/estoque', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) }))) { ok(t('toast_salvo')); close(); lista(); } });
};

/* ================= Máquinas ================= */
S['/maquinas'] = async el => {
  const est = { q: '', f: 'todos' };
  el.innerHTML = PH(t('portal_sup'), t('visao_geral'), `<button class="btn" id="nova">${ic('plus')} ${t('nova_maq')}</button>`) + tableCard(t('nav_maquinas'), toolbarHTML({
    busca: t('busca_maq_mod'), buscaKey: 'busca_maq_mod',
    filtros: [['todos', t('flt_todos'), 'flt_todos'], ['A', `${t('setor')} A`], ['B', `${t('setor')} B`], ['C', `${t('setor')} C`]],
    atual: 'todos'
  }));
  async function lista() {
    const r = await tryDo(() => api(`/maquinas?q=${encodeURIComponent(est.q)}${est.f !== 'todos' ? '&setor=' + est.f : ''}`)); if (!r) return;
    $('#tbl', el).innerHTML = `<table class="tc"><thead><tr><th>${t('th_apelidos')}</th><th>${t('th_marca')}</th><th>${t('th_modelo')}</th><th>${t('th_galga')}</th><th>${t('th_ano')}</th><th>${t('th_ult_manut')}</th><th>${t('th_historico')}</th></tr></thead><tbody>
      ${r.map(m => `<tr><td><b>${esc(m.apelido)}</b></td><td>${esc(m.marca)}</td><td>${esc(m.modelo)}</td><td>${esc(m.galga)}</td><td>${m.ano || '-'}</td><td>${fmtData(m.ultima_manutencao)}</td><td><button class="btn ghost sm" data-h="${m.id}">${ic('right')}</button></td></tr>`).join('') || `<tr><td colspan="7" class="empty">${t('nenhuma_maq_enc')}</td></tr>`}</tbody></table>`;
    $$('[data-h]', el).forEach(b => b.onclick = () => historico(+b.dataset.h, lista));
  }
  ligarToolbar($('#tc', el), est, lista); await lista();
  $('#nova', el).onclick = () => modal(`<h2>${t('nova_maq')}</h2><form id="f"><div class="row r2"><div class="field"><label>${t('th_apelidos')}</label><input name="apelido" required placeholder="Máquina 07"></div><div class="field"><label>${t('setor')}</label><select name="setor"><option>A</option><option>B</option><option>C</option></select></div></div>
    <div class="row r2"><div class="field"><label>${t('th_marca')}</label><input name="marca" placeholder="Shima Seiki"></div><div class="field"><label>${t('th_modelo')}</label><input name="modelo" placeholder="SSR"></div></div>
    <div class="row r3"><div class="field"><label>${t('th_galga')}</label><input name="galga"></div><div class="field"><label>${t('th_ano')}</label><input type="number" name="ano" min="1950" max="2100"></div><div class="field"><label>${t('th_ult_manut')}</label><input type="date" name="ultima_manutencao"></div></div>
    <div class="acts"><button type="button" class="btn ghost" data-close>${t('btn_cancelar')}</button><button class="btn">${t('btn_salvar')}</button></div></form>`,
    (m, close) => $('#f', m).onsubmit = async e => { e.preventDefault(); if (await tryDo(() => api('/maquinas', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) }))) { ok(t('toast_salvo')); close(); lista(); } });
};

async function historico(id, depois) {
  const h = await tryDo(() => api(`/maquinas/${id}/historico`)); if (!h) return;
  modal(`<h2>${esc(h.maquina.apelido)} <span class="sub">· ${esc(h.maquina.marca || '')} ${esc(h.maquina.modelo || '')}</span></h2>
    <div style="margin-bottom:10px">${mpill(h.maquina.status)}${h.maquina.aviso ? ` <span class="sub">${esc(h.maquina.aviso)}</span>` : ''}</div>
    <h3 style="font-size:14px;margin:14px 0 6px">${t('th_ult_manut')}</h3>${h.manutencoes.map(m => `<div class="mark"><span>${esc(m.descricao || 'OK')}</span><b>${fmtData(m.data)}</b></div>`).join('') || `<div class="sub">${t('nada_encontrado')}</div>`}
    <form id="f" style="display:grid;grid-template-columns:140px 1fr auto;gap:8px;margin-top:10px"><input type="date" name="data" value="${hojeISO()}" required><input name="descricao" maxlength="300"><button class="btn sm">${t('btn_salvar')}</button></form>
    <div class="acts"><button class="btn ghost" data-close>${t('btn_cancelar')}</button></div>`,
    (m, close) => $('#f', m).onsubmit = async e => { e.preventDefault(); if (await tryDo(() => api(`/maquinas/${id}/manutencao`, { method: 'POST', body: Object.fromEntries(new FormData(e.target)) }))) { ok(t('toast_salvo')); close(); depois(); } });
}

/* ================= Terceirização (supervisor) ================= */
S['/terceirizacao'] = async el => {
  const est = { q: '', f: 'costureira' };
  const NOMES = { costureira: 'costureira', passadeira: 'passadeira', malharia_parceira: 'malharia_parceira' };
  el.innerHTML = PH(t('terc_titulo'), t('visao_geral')) + `<div class="card" id="tc"><div class="hd"><div><h2 id="ttl">${t(NOMES[est.f])}</h2><div class="sub">${esc(ME.malharia.nome)}</div></div>
    ${toolbarHTML({
      busca: t('busca_terc'), buscaKey: 'busca_terc',
      filtros: Object.entries(NOMES).map(([k, v]) => [k, t(v), v]),
      atual: 'costureira'
    })}</div><div class="tw" id="tbl"></div></div><div id="pend" style="margin-top:22px"></div>`;
  async function lista() {
    const r = await tryDo(() => api(`/supervisor/terceirizacao?funcao=${est.f}&q=${encodeURIComponent(est.q)}`)); if (!r) return;
    $('#ttl', el).textContent = t(NOMES[est.f]);
    $('#tbl', el).innerHTML = `<table><thead><tr><th>${t('th_nome')}</th><th>${t('th_qtd_env')}</th><th>${t('th_val_un')}</th></tr></thead><tbody>
      ${r.itens.map(i => `<tr><td><b>${esc(i.nome)}</b></td><td>${i.enviadas}</td><td>${brl(i.valor_peca)}</td></tr>`).join('') || `<tr><td colspan="3" class="empty">${t('nenhum_vinculo')}</td></tr>`}</tbody></table>`;
  }
  async function pend() {
    const r = await tryDo(() => api('/supervisor/terceirizacao/pendencias')); if (!r) return;
    const A = { em_analise: [['aprovar', t('aprovar'), ''], ['recusar', t('recusar'), 'ghost']], aprovado: [['ativar', t('st_ativo'), ''], ['recusar', t('recusar'), 'ghost']] };
    $('#pend', el).innerHTML = `<div class="grid g2" style="align-items:start"><div class="card"><div class="hd"><div><h2>${t('cand_pendentes')}</h2><div class="sub">${t('cand_sub')}</div></div><span class="pill gray">${r.candidaturas.length}</span></div>
      ${r.candidaturas.map(c => `<div class="listrow" style="cursor:default;flex-wrap:wrap"><div class="grow"><b>${esc(c.nome)}</b> · ${t(c.funcao)}<small>${c.capacidade_diaria} · ${brl(c.valor_peca)}</small></div>
        ${A[c.status].map(([a, txt, cl]) => `<button class="btn ${cl} sm" data-c="${c.id}" data-a="${a}">${txt}</button>`).join('')}</div>`).join('') || `<div class="empty">${t('nenhuma_cand')}</div>`}</div>
      <div class="card"><div class="hd"><div><h2>${t('rel_conferir')}</h2><div class="sub">${t('rel_sub')}</div></div><span class="pill gray">${r.relatorios.length}</span></div>
      ${r.relatorios.map(x => `<div class="listrow" style="cursor:default;flex-wrap:wrap"><div class="grow"><b>${esc(x.nome)}</b> · ${esc(x.lote)}<small>${x.pecas} · ${fmtData(x.criado_em)}</small></div><button class="btn sm" data-r="${x.id}">${ic('check')} ${t('conferir')}</button></div>`).join('') || `<div class="empty">${t('nenhum_rel')}</div>`}</div></div>`;
    $$('[data-c]', el).forEach(b => b.onclick = async () => { if (await tryDo(() => api('/supervisor/candidaturas/' + b.dataset.c, { method: 'POST', body: { acao: b.dataset.a } }))) { pend(); lista(); } });
    $$('[data-r]', el).forEach(b => b.onclick = async () => { if (await tryDo(() => api(`/supervisor/relatorios/${b.dataset.r}/conferir`, { method: 'POST' }))) { ok(t('toast_salvo')); pend(); lista(); } });
  }
  ligarToolbar($('#tc', el), est, lista); await Promise.all([lista(), pend()]);
};

/* ==========================================================================
   TELAS ANALÍTICAS (ACIONADAS PELOS CARDS DA VISÃO GERAL)
   ========================================================================== */

/* ---------- TELA 1: Pedidos em produção ---------- */
S['/inicio/pedidos'] = async el => {
  const d = await api('/supervisor/analise/pedidos');
  const maxVal = Math.max(1, ...d.maquinas.map(m => Math.max(m.meta, m.produzido)));
  const abaixoPct = d.meta_acumulada ? Math.max(0, 100 - d.pct_atingida).toFixed(1).replace('.', ',') : '0,0';

  el.innerHTML = `
    <div class="pagehead">
      <div style="display:flex;align-items:center;gap:14px">
        <a href="#/inicio" class="btn ghost sm" style="text-decoration:none">‹ ${t('voltar')}</a>
        <div>
          <div class="eyebrow">${t('analise_desemp')}</div>
          <h1>${t('ped_em_prod')}</h1>
        </div>
      </div>
      <div class="sync">${t('dados_sync')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>

    <div class="grid g4" style="margin-bottom:18px">
      <div class="card kpi-accent"><span class="lbl">${t('meta_acum')}</span><div class="val">${d.meta_acumulada.toLocaleString('pt-BR')} un.</div><span class="foot">${t('periodo_atual')}</span></div>
      <div class="card kpi-accent blue"><span class="lbl">${t('prod_realizada')}</span><div class="val">${d.producao_realizada.toLocaleString('pt-BR')} un.</div><span class="foot">${String(d.pct_atingida).replace('.', ',')}% ${t('da_meta')}</span></div>
      <div class="card kpi-accent green"><span class="lbl">${t('efic_media')}</span><div class="val">${String(d.eficiencia_media).replace('.', ',')}%</div><span class="foot good">${t('media_maqs_ativas')}</span></div>
      <div class="card kpi-accent amber"><span class="lbl">${t('deficit_atual')}</span><div class="val">${d.deficit.toLocaleString('pt-BR')} un.</div><span class="foot">${t('abaixo_da_meta', { n: abaixoPct })}</span></div>
    </div>

    <div class="grid g21">
      <div class="card">
        <div class="hd">
          <div><h2>${t('meta_x_prod')}</h2><div class="sub">${t('comp_diario')}</div></div>
          <div class="chart-legend"><span><i style="background:#333C56"></i> ${t('th_meta')}</span><span><i style="background:#1D63ED"></i> ${t('prod_realizada')}</span></div>
        </div>
        <div class="bd">
          ${d.maquinas.length ? `
            <div class="barchart-wrap"><div class="barchart-grid">
              ${d.maquinas.map(m => {
                const hMeta = Math.max(4, Math.round((m.meta / maxVal) * 195));
                const hReal = Math.max(4, Math.round((m.produzido / maxVal) * 195));
                return `<div class="bar-group"><div class="bar-pair"><div class="bar-col meta" style="height:${hMeta}px"></div><div class="bar-col real" style="height:${hReal}px"></div></div><span class="bar-lbl">${esc(m.dia)} · ${esc(m.apelido)}</span></div>`;
              }).join('')}
            </div><div style="height:24px"></div></div>
          ` : `<div class="empty">${t('nenhum_ped')}</div>`}
        </div>
      </div>

      <div class="card">
        <div class="hd"><div><h2>${t('desemp_maq')}</h2><div class="sub">${t('resumo_periodo')}</div></div></div>
        <div class="bd" style="padding:0">
          ${d.maquinas.length ? d.maquinas.map(m => `
            <div style="padding:14px 20px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:14px">
              <b style="min-width:56px">${esc(m.apelido)}</b>
              <div style="flex:1"><div class="bar lg"><i style="width:${Math.min(100, m.pct)}%;background:#1D63ED"></i></div><small style="color:var(--muted);font-size:11.5px;display:block;margin-top:4px">${m.produzido} / ${m.meta} un.</small></div>
              <b style="min-width:38px;text-align:right">${m.pct}%</b>
            </div>`).join('') : `<div class="empty">${t('nenhuma_maq')}</div>`}
        </div>
      </div>
    </div>
  `;
};

/* ---------- TELA 2: Análise de Perdas ---------- */
S['/inicio/perdas'] = async el => {
  const d = await api('/supervisor/analise/perdas');
  const maxKg = Math.max(1, ...d.itens.map(i => i.kg));

  el.innerHTML = `
    <div class="pagehead">
      <div style="display:flex;align-items:center;gap:14px">
        <a href="#/inicio" class="btn ghost sm" style="text-decoration:none">‹ ${t('voltar')}</a>
        <div>
          <div class="eyebrow">${t('qualidade_desp')}</div>
          <h1>${t('analise_perdas')}</h1>
        </div>
      </div>
      <div class="sync">${t('dados_sync')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>

    <div class="grid g4" style="margin-bottom:18px">
      <div class="card kpi-accent red"><span class="lbl">${t('perda_total')}</span><div class="val">${String(d.perda_kg).replace('.', ',')} kg</div><span class="foot">${t('reg_producao')}</span></div>
      <div class="card kpi-accent amber"><span class="lbl">${t('indice_avaria')}</span><div class="val">${String(d.indice_avaria).replace('.', ',')}%</div><span class="foot">${t('meta_max', { n: String(d.meta_maxima).replace('.', ',') })}</span></div>
      <div class="card kpi-accent red"><span class="lbl">${t('maqs_afetadas')}</span><div class="val">${d.maquinas_afetadas}</div><span class="foot">${t('req_acao', { n: d.criticas })}</span></div>
      <div class="card kpi-accent"><span class="lbl">${t('custo_est')}</span><div class="val">${brl(d.custo_estimado)}</div><span class="foot">${t('no_periodo')}</span></div>
    </div>

    <div class="card" style="margin-bottom:18px">
      <div class="hd">
        <div><h2>${t('perdas_maq_mot')}</h2><div class="sub">${t('kg_perdidos_pct')}</div></div>
        <div style="display:flex;gap:8px"><span class="pill red">${t('criticas_lbl', { n: d.criticas })}</span><span class="pill amber">${t('em_atencao_lbl', { n: d.atencao })}</span></div>
      </div>
      <div class="bd">
        ${d.itens.length ? `
          <div class="loss-grid">
            ${d.itens.map(it => {
              const h = Math.max(18, Math.round((it.kg / maxKg) * 95));
              const cls = it.classificacao === 'Crítica' ? 'critica' : 'atencao';
              return `<div class="loss-card"><div class="top-row"><span>${esc(it.maquina)}</span><span class="pct">${String(it.pct).replace('.', ',')}%</span></div><div class="loss-bar-area"><div class="loss-bar ${cls}" style="height:${h}px"></div></div><div><div class="kg">${String(it.kg).replace('.', ',')} kg</div><div class="mot">${esc(it.motivo)}</div></div></div>`;
            }).join('')}
          </div>
        ` : `<div class="empty">${t('nada_encontrado')}</div>`}
      </div>
    </div>

    <div class="card">
      <div class="hd"><div><h2>${t('det_ocorrencias')}</h2><div class="sub">${t('ord_volume')}</div></div></div>
      <div class="tw">
        <table>
          <thead><tr><th>${t('th_maquina')}</th><th>Motivo</th><th style="text-align:right">KG</th><th style="text-align:right">%</th><th style="text-align:right">${t('th_status')}</th></tr></thead>
          <tbody>
            ${d.itens.length ? d.itens.map(it => `<tr><td><b>${esc(it.maquina)}</b></td><td>${esc(it.motivo)}</td><td style="text-align:right"><b>${String(it.kg).replace('.', ',')} kg</b></td><td style="text-align:right">${String(it.pct).replace('.', ',')}%</td><td style="text-align:right"><span class="pill ${it.classificacao === 'Crítica' ? 'red' : 'amber'}">${it.classificacao === 'Crítica' ? t('st_critica') : t('st_atencao')}</span></td></tr>`).join('') : `<tr><td colspan="5" class="empty">${t('nada_encontrado')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

/* ---------- TELA 3: Produção / Meta ---------- */
S['/inicio/producao-meta'] = async el => {
  let turnoSel = turnoPorHora();

  const carregar = async () => {
    const d = await api(`/supervisor/analise/producao-meta?turno=${turnoSel}`);

    el.innerHTML = `
      <div class="pagehead">
        <div style="display:flex;align-items:center;gap:14px">
          <a href="#/inicio" class="btn ghost sm" style="text-decoration:none">‹ ${t('voltar')}</a>
          <div>
            <div class="eyebrow">${t('acomp_desemp')}</div>
            <h1>${t('prod_meta')}</h1>
            <div class="sub">${t('prod_meta_sub')}</div>
          </div>
        </div>
        <div style="min-width:220px">
          <select id="sel-turno">
            <option value="manha" ${turnoSel === 'manha' ? 'selected' : ''}>${t('turno_lbl')} - ${t('turno_manha')}</option>
            <option value="tarde" ${turnoSel === 'tarde' ? 'selected' : ''}>${t('turno_lbl')} - ${t('turno_tarde')}</option>
            <option value="noite" ${turnoSel === 'noite' ? 'selected' : ''}>${t('turno_lbl')} - ${t('turno_noite')}</option>
            <option value="todos" ${turnoSel === 'todos' ? 'selected' : ''}>${t('flt_todos')}</option>
          </select>
        </div>
      </div>

      <div class="grid g3" style="margin-bottom:22px">
        <div class="card stat">
          <span class="sub">${t('meta_geral_turno')}</span>
          <div class="ic">${ic('chart')}</div>
          <div class="big">${d.meta_geral_pct}%</div>
          <div class="bar lg navy" style="margin:10px 0"><i style="width:${Math.min(100, d.meta_geral_pct)}%"></i></div>
          <div class="sub"><b>${d.total_produzido.toLocaleString('pt-BR')} / ${d.total_meta.toLocaleString('pt-BR')}</b> ${t('pecas_prod')}</div>
        </div>

        <div class="card stat">
          <span class="sub">${t('efic_media_maqs')}</span>
          <div class="ic" style="color:var(--green);background:var(--green-bg)">${ic('trend')}</div>
          <div class="big">${String(d.eficiencia_media).replace('.', ',')}%</div>
          <div style="margin-top:12px"><span class="pill green">${t('tempo_real')}</span> <span class="sub">${t('turno_sel')}</span></div>
        </div>

        <div class="card stat">
          <span class="sub">${t('maqs_na_meta')}</span>
          <div class="ic">${ic('cpu')}</div>
          <div class="big">${d.na_meta} <span style="font-size:18px;color:var(--muted);font-weight:500">/ ${d.total_maquinas}</span></div>
          <div class="sub" style="margin-top:12px"><span class="dot pausada"></span><b style="color:#b45309">${t('maqs_em_atencao', { n: d.em_atencao })}</b></div>
        </div>
      </div>

      <div class="pagehead" style="margin-bottom:14px">
        <div><h2 style="font-size:16px">${t('resumo_por_maq')}</h2><div class="sub">${t('resumo_maq_sub')}</div></div>
        <div class="sync">${t('dados_sync')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>

      ${d.maquinas.length ? `
        <div class="grid g2">
          ${d.maquinas.map(m => {
            const bKey = m.badgeCls === 'red' ? 'st_parada' : m.badgeCls === 'amber' ? 'st_atencao' : m.badgeCls === 'blue' ? 'st_disponivel' : 'st_produzindo';
            return `
            <div class="card maq-perf-card">
              <div class="maq-perf-head">
                <div class="maq-perf-title">
                  <div class="ico">${ic('cpu')}</div>
                  <div><b style="font-size:15px">${esc(m.apelido)}</b><div class="sub">${esc(m.op_desc)}</div></div>
                </div>
                <span class="pill ${m.badgeCls}"><span class="dot ${m.badgeCls === 'red' ? 'parada' : m.badgeCls === 'amber' ? 'pausada' : 'finalizada'}" style="width:7px;height:7px"></span>${t(bKey)}</span>
              </div>
              <div>
                <div class="eyebrow" style="font-size:10.5px">${t('produzido_vs_meta')}</div>
                <div class="maq-perf-nums">
                  <div class="big-num">${m.produzido} <span>/ ${m.meta} un.</span></div>
                  <div class="pct-num" style="color:${m.badgeCls === 'red' ? '#EF4444' : m.badgeCls === 'amber' ? '#b45309' : 'var(--ink)'}">${m.pct}%</div>
                </div>
                <div class="bar lg ${m.barCls}" style="margin-top:8px"><i style="width:${Math.min(100, m.pct)}%"></i></div>
              </div>
              <div class="maq-perf-foot">
                <span>${t('th_operador')}: <b>${esc(m.operador)}</b></span>
                <span>${ic('clock')} ${t('ritmo')}: <b>${m.ritmo} pç/h</b></span>
              </div>
            </div>`;
          }).join('')}
        </div>
      ` : `<div class="card empty">${t('nenhuma_maq')}</div>`}
    `;

    $('#sel-turno', el).onchange = e => { turnoSel = e.target.value; carregar(); };
  };

  await carregar();
};

/* ==========================================================================
   TELA DE CONFIGURAÇÕES (i18n COMPLETO + OLHO DA SENHA + SYNC COM POPOVER)
   ========================================================================== */
S['/configuracoes'] = async el => {
  let draft = getPrefs();

  const EYE_OPEN = `<svg class="i" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>`;
  const EYE_OFF = `<svg class="i" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  const GLOBE_SVG = `<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>`;
  const CAM_SVG = `<svg class="i" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`;

  const mascTel = v => {
    v = v.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 10) return v.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    return v.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  };

  const renderAvatarLg = (nome, foto) => foto
    ? `<img src="${foto}" alt="${esc(nome)}">`
    : esc(iniciais(nome || 'AI'));

  el.innerHTML = `
    <div class="pagehead">
      <div>
        <div class="eyebrow">${t('cfg_eyebrow')}</div>
        <h1>${t('cfg_titulo')}</h1>
        <div class="sub">${t('cfg_sub')}</div>
      </div>
    </div>

    <div class="cfg-grid">
      <div class="cfg-col">
        <div class="card">
          <div class="hd">
            <div><h2>${t('cfg_perfil')}</h2><div class="sub">${t('cfg_perfil_sub')}</div></div>
          </div>
          <div class="bd">
            <div class="cfg-avatar-row">
              <div class="cfg-avatar-lg" id="cfg-av-preview">${renderAvatarLg(draft.nome, draft.fotoBase64)}</div>
              <div>
                <div class="cfg-photo-btns">
                  <input type="file" id="cfg-file-foto" accept="image/png, image/jpeg" hidden>
                  <button type="button" class="btn ghost sm" id="btn-alterar-foto">${CAM_SVG} ${t('cfg_alterar_foto')}</button>
                  <button type="button" class="cfg-link-btn" id="btn-remover-foto">${t('cfg_remover')}</button>
                </div>
                <div class="sub">${t('cfg_foto_hint')}</div>
              </div>
            </div>

            <div class="row r2">
              <div class="field"><label>${t('cfg_nome')}</label><input type="text" id="cfg-nome" value="${esc(draft.nome)}"></div>
              <div class="field">
                <div class="cfg-label-row"><label style="margin:0">${t('cfg_cargo')}</label><span class="cfg-rh-badge">${t('cfg_rh')}</span></div>
                <input type="text" value="${t('role_sup')}" disabled>
              </div>
            </div>

            <div class="row r2">
              <div class="field"><label>${t('cfg_email')}</label><input type="email" id="cfg-email" value="${esc(draft.email)}"></div>
              <div class="field"><label>${t('cfg_tel')}</label><input type="text" id="cfg-tel" value="${esc(draft.telefone)}" placeholder="(11) 99842-1100"></div>
            </div>

            <div class="row r2">
              <div class="field" style="margin-bottom:0">
                <label>${t('cfg_setor')}</label>
                <select id="cfg-setor">
                  <option value="Setor A - Malharia Circular" ${draft.setor === 'Setor A - Malharia Circular' ? 'selected' : ''}>${t('setor')} A - Malharia Circular</option>
                  <option value="Setor B - Retilínea" ${draft.setor === 'Setor B - Retilínea' ? 'selected' : ''}>${t('setor')} B - Retilínea</option>
                  <option value="Setor C - Acabamento e Revisão" ${draft.setor === 'Setor C - Acabamento e Revisão' ? 'selected' : ''}>${t('setor')} C - Acabamento</option>
                </select>
              </div>
              <div class="field" style="margin-bottom:0">
                <label>${t('cfg_turno')}</label>
                <select id="cfg-turno">
                  <option value="manha" ${draft.turno === 'manha' ? 'selected' : ''}>${t('turno_lbl')} - ${t('turno_manha')} (06:00 - 12:00)</option>
                  <option value="tarde" ${draft.turno === 'tarde' ? 'selected' : ''}>${t('turno_lbl')} - ${t('turno_tarde')} (12:00 - 18:00)</option>
                  <option value="noite" ${draft.turno === 'noite' ? 'selected' : ''}>${t('turno_lbl')} - ${t('turno_noite')} (18:00 - 00:00)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="hd">
            <div><h2>${t('cfg_seguranca')}</h2><div class="sub">${t('cfg_seguranca_sub')}</div></div>
          </div>
          <div class="bd">
            <div class="row r3">
              <div class="field">
                <label>${t('cfg_senha_atual')}</label>
                <div class="pwd-wrap">
                  <input type="password" id="pwd-atual" placeholder="••••••••" autocomplete="current-password">
                  <button type="button" class="pwd-eye" data-eye="pwd-atual" aria-label="Toggle password">${EYE_OPEN}</button>
                </div>
              </div>
              <div class="field">
                <label>${t('cfg_nova_senha')}</label>
                <div class="pwd-wrap">
                  <input type="password" id="pwd-nova" placeholder="${t('cfg_senha_min')}" autocomplete="new-password">
                  <button type="button" class="pwd-eye" data-eye="pwd-nova" aria-label="Toggle password">${EYE_OPEN}</button>
                </div>
                <div class="pwd-strength"><i id="pwd-bar"></i></div>
                <span class="pwd-strength-txt" id="pwd-txt">${t('cfg_senha_min')}</span>
              </div>
              <div class="field">
                <label>${t('cfg_conf_senha')}</label>
                <div class="pwd-wrap">
                  <input type="password" id="pwd-conf" placeholder="••••••••" autocomplete="new-password">
                  <button type="button" class="pwd-eye" data-eye="pwd-conf" aria-label="Toggle password">${EYE_OPEN}</button>
                </div>
              </div>
            </div>
            <div style="display:flex;justify-content:flex-end;margin-top:6px">
              <button type="button" class="btn ghost sm" id="btn-upd-senha">${t('cfg_upd_senha')}</button>
            </div>
          </div>
        </div>
      </div>

      <div class="cfg-col">
        <div class="card">
          <div class="hd">
            <div><h2>${t('cfg_aparencia')}</h2><div class="sub">${t('cfg_aparencia_sub')}</div></div>
          </div>
          <div class="bd">
            <div class="field">
              <label>${t('cfg_tema_lbl')}</label>
              <div class="theme-cards">
                <button type="button" class="theme-opt ${draft.tema === 'claro' ? 'active' : ''}" data-tema="claro">
                  <div class="theme-preview light"><div class="tp-row"><div class="tp-box"></div><div class="tp-lines"><div class="tp-line" style="width:75%"></div><div class="tp-line" style="width:50%"></div></div></div><div class="tp-line" style="width:90%"></div></div>
                  <div class="theme-opt-foot"><span>${ic('sun')} ${t('cfg_tema_claro')}</span><i class="theme-check">✓</i></div>
                </button>
                <button type="button" class="theme-opt ${draft.tema === 'escuro' ? 'active' : ''}" data-tema="escuro">
                  <div class="theme-preview dark"><div class="tp-row"><div class="tp-box"></div><div class="tp-lines"><div class="tp-line" style="width:75%"></div><div class="tp-line" style="width:50%"></div></div></div><div class="tp-line" style="width:90%"></div></div>
                  <div class="theme-opt-foot"><span>${ic('moon')} ${t('cfg_tema_escuro')}</span><i class="theme-check">✓</i></div>
                </button>
              </div>
            </div>

            <div class="field" style="margin-bottom:0">
              <label>${t('cfg_idioma_lbl')}</label>
              <div class="lang-select-wrap">
                <span class="globe-ic">${GLOBE_SVG}</span>
                <select id="cfg-idioma">
                  <option value="pt" ${draft.idioma === 'pt' ? 'selected' : ''}>Português (Brasil)</option>
                  <option value="en" ${draft.idioma === 'en' ? 'selected' : ''}>English (US)</option>
                  <option value="es" ${draft.idioma === 'es' ? 'selected' : ''}>Español</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="hd">
            <div><h2>${t('cfg_notif')}</h2><div class="sub">${t('cfg_notif_sub')}</div></div>
          </div>
          <div class="bd" style="padding-top:6px;padding-bottom:6px">
            <div class="switch-row">
              <div class="switch-info"><b>${t('cfg_notif_parada')}</b><small>${t('cfg_notif_parada_sub')}</small></div>
              <label class="kn-switch"><input type="checkbox" id="cfg-notif-parada" ${draft.notifParada ? 'checked' : ''}><span class="kn-slider"></span></label>
            </div>
            <div class="switch-row">
              <div class="switch-info"><b>${t('cfg_notif_meta')}</b><small>${t('cfg_notif_meta_sub')}</small></div>
              <label class="kn-switch"><input type="checkbox" id="cfg-notif-meta" ${draft.notifMeta ? 'checked' : ''}><span class="kn-slider"></span></label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card cfg-footer-bar">
      <button type="button" class="btn ghost" id="cfg-cancelar">${t('btn_cancelar')}</button>
      <button type="button" class="btn" id="cfg-salvar">${t('btn_salvar')}</button>
    </div>
  `;

  const sincronizarPreviewTopbar = () => {
    const htmlAv = renderAvatarLg(draft.nome, draft.fotoBase64);
    const nomeAtual = draft.nome || 'Alinne Ionafa';
    $('#cfg-av-preview', el).innerHTML = htmlAv;
    if ($('#top-user-name')) $('#top-user-name').textContent = nomeAtual;
    if ($('#top-user-avatar')) $('#top-user-avatar').innerHTML = htmlAv;
    if ($('#pp-name')) $('#pp-name').textContent = nomeAtual;
    if ($('#pp-avatar-lg')) $('#pp-avatar-lg').innerHTML = htmlAv;
  };

  const fileInput = $('#cfg-file-foto', el);
  $('#btn-alterar-foto', el).onclick = () => fileInput.click();
  fileInput.onchange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) return bad('JPG / PNG.');
    if (file.size > 2 * 1024 * 1024) return bad('Max 2MB.');
    const reader = new FileReader();
    reader.onload = () => { draft.fotoBase64 = reader.result; sincronizarPreviewTopbar(); };
    reader.readAsDataURL(file);
  };
  $('#btn-remover-foto', el).onclick = () => { draft.fotoBase64 = ''; fileInput.value = ''; sincronizarPreviewTopbar(); };

  $('#cfg-nome', el).oninput = e => { draft.nome = e.target.value; sincronizarPreviewTopbar(); };
  $('#cfg-tel', el).oninput = e => { e.target.value = mascTel(e.target.value); draft.telefone = e.target.value; };
  $('#cfg-email', el).oninput = e => draft.email = e.target.value;
  $('#cfg-setor', el).onchange = e => draft.setor = e.target.value;
  $('#cfg-turno', el).onchange = e => draft.turno = e.target.value;
  $('#cfg-notif-parada', el).onchange = e => draft.notifParada = e.target.checked;
  $('#cfg-notif-meta', el).onchange = e => draft.notifMeta = e.target.checked;

  $$('.theme-opt', el).forEach(btn => {
    btn.onclick = () => {
      draft.tema = btn.dataset.tema;
      $$('.theme-opt', el).forEach(b => b.classList.toggle('active', b === btn));
      document.body.classList.toggle('dark-theme', draft.tema === 'escuro');
    };
  });

  $('#cfg-idioma', el).onchange = async e => {
    draft.idioma = e.target.value;
    savePrefs(draft);
    await render();
  };

  // Delegação de eventos para o botão de olho da senha
  el.addEventListener('click', e => {
    const eyeBtn = e.target.closest('.pwd-eye');
    if (!eyeBtn) return;
    e.preventDefault();
    const inp = document.getElementById(eyeBtn.dataset.eye);
    if (!inp) return;
    const isHidden = inp.type === 'password';
    inp.type = isHidden ? 'text' : 'password';
    eyeBtn.innerHTML = isHidden ? EYE_OFF : EYE_OPEN;
  });

  $('#pwd-nova', el).oninput = e => {
    const v = e.target.value;
    const bar = $('#pwd-bar', el);
    const txt = $('#pwd-txt', el);
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) && /[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v) && v.length >= 10) score++;
    const levels = [
      ['0%', 'transparent', t('cfg_senha_min')],
      ['35%', '#EF4444', t('cfg_senha_fraca')],
      ['70%', '#F59E0B', t('cfg_senha_media')],
      ['100%', '#10B981', t('cfg_senha_forte')],
    ];
    const [w, cor, label] = v.length === 0 ? levels[0] : levels[Math.max(1, score)];
    bar.style.width = w;
    bar.style.background = cor;
    txt.textContent = label;
  };

  $('#btn-upd-senha', el).onclick = async () => {
    const atual = $('#pwd-atual', el).value.trim();
    const nova = $('#pwd-nova', el).value;
    const conf = $('#pwd-conf', el).value;

    if (!atual) return bad(t('cfg_senha_atual'));
    if (nova.length < 8) return bad(t('cfg_senha_min'));
    if (nova !== conf) return bad(t('cfg_conf_senha'));

    await tryDo(() => api('/auth/senha', { method: 'POST', body: { nova } }));
    $('#pwd-atual', el).value = '';
    $('#pwd-nova', el).value = '';
    $('#pwd-conf', el).value = '';
    $('#pwd-bar', el).style.width = '0%';
    $('#pwd-txt', el).textContent = t('cfg_senha_min');
    ok(t('toast_senha_ok'));
  };

  $('#cfg-cancelar', el).onclick = async () => {
    aplicarPreferenciasGlobais(getPrefs());
    await render();
    toast(t('toast_descartado'));
  };

  $('#cfg-salvar', el).onclick = async () => {
    if (!draft.nome.trim()) return bad(t('cfg_nome'));
    if (typeof syncSavedAccount === 'function') syncSavedAccount(draft);
    savePrefs(draft);
    await render();
    ok(t('toast_salvo'));
  };
};

VIEWS.funcionario['/configuracoes'] = el => S['/configuracoes'](el);