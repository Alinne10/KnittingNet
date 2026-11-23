/* Telas do funcionário (Portal do Colaborador). */
'use strict';
const TZ_BR = 'America/Sao_Paulo';
const V = VIEWS.funcionario;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const head = (titulo, sub, extra = '') => `<div class="pagehead"><div><div class="eyebrow">Portal do Colaborador</div><h1>${titulo}</h1><div class="sub">${sub}</div></div>${extra}</div>`;
const tabsHTML = (lista, atual) => `<div class="tabs" role="tablist">${lista.map(([k, ico, t]) => `<button data-tab="${k}" class="${k === atual ? 'on' : ''}" role="tab">${ic(ico)}${t}</button>`).join('')}</div>`;

/* ================= Ponto Eletrônico ================= */
V['/ponto'] = async el => {
  let tab = 'hoje', mes = hojeISO().slice(0, 7), sel = hojeISO();
  const dataLonga = d => cap(d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ_BR }));
  const ROTULOS = { entrada: 'Entrada', saida_almoco: 'Saída Almoço', volta_almoco: 'Volta Almoço', saida: 'Saída' };

  async function draw() {
    const chrome = `<div class="pagehead"><div><div class="eyebrow">Portal do Colaborador</div><h1>Ponto Eletrônico</h1></div><b id="hoje"></b></div>
      <h2 style="font-size:17px">Olá, ${esc(ME.nome.split(' ')[0])}</h2><div class="sub">Acompanhe e registre sua jornada de trabalho.</div>
      ${tabsHTML([['hoje', 'clock', 'Registrar Ponto (Hoje)'], ['hist', 'cal', 'Histórico e Calendário']], tab)}<div id="tabbody"></div>`;
    el.innerHTML = chrome;
    $$('[data-tab]', el).forEach(b => b.onclick = () => { tab = b.dataset.tab; clearInterval(window.__tick); draw(); });
    (tab === 'hoje' ? drawHoje : drawHist)($('#tabbody', el));
  }

  async function drawHoje(box) {
    const d = await api('/ponto/hoje');
    const off = new Date(d.agora) - Date.now();
    const agora = () => new Date(Date.now() + off);
    $('#hoje', el).textContent = dataLonga(agora());
    const n = d.proximas;
    const prim = n.includes('entrada') ? ['entrada', 'Registrar Entrada', 'in'] : n.includes('saida_almoco') ? ['saida_almoco', 'Saída para Almoço', 'out'] : n.includes('volta_almoco') ? ['volta_almoco', 'Volta do Almoço', 'in'] : [null, 'Registrar Entrada', 'in'];
    const pct = Math.min(100, Math.round(100 * d.trabalhado_min / (d.turno.horas * 60)));
    box.innerHTML = `<div class="grid g21">
      <div class="card"><div class="hd"><div><h2>Registro de Ponto</h2><div class="sub">${dataLonga(agora()).split(',')[0]}, ${agora().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: TZ_BR })}</div></div>
        <span class="pill ${d.em_andamento ? 'green' : 'gray'}">${d.em_andamento ? 'Em Turno' : (n.length ? 'Fora do turno' : 'Jornada encerrada')}</span></div>
        <div class="bd" style="padding:28px 20px;text-align:center"><div class="eyebrow">Horário atual</div><div class="clock" id="clk">--:--:--</div><div class="sub">Horário de Brasília · UTC-03:00</div>
          <div style="display:flex;gap:14px;justify-content:center;margin:26px 0 14px;flex-wrap:wrap">
            <button class="btn" id="b1" ${prim[0] ? '' : 'disabled'}>${ic(prim[2])} ${prim[1]}</button>
            <button class="btn red" id="b2" ${n.includes('saida') ? '' : 'disabled'}>${ic('out')} Registrar Saída</button></div>
          <div class="hint">O registro usa o horário do servidor e não pode ser alterado depois.</div></div></div>
      <div class="card"><div class="hd"><div><h2>Marcações de Hoje</h2><div class="sub">Sua jornada do dia</div></div></div>
        <div class="bd">${Object.entries(ROTULOS).map(([k, t]) => `<div class="mark"><span class="l"><span class="dot ${d.marcas[k] ? 'green' : ''}" style="${d.marcas[k] ? 'background:var(--green)' : ''}"></span>${t}</span>${d.marcas[k] ? `<b>${d.marcas[k]}</b>` : '<span class="sub" style="color:#d97706">Pendente</span>'}</div>`).join('')}
          <div class="total" style="background:#eef1fb;color:var(--ink)"><span class="sub">Total trabalhado hoje</span><b id="tot">${d.trabalhado}</b><div class="bar" style="margin-top:8px"><i style="width:${pct}%"></i></div></div></div></div></div>`;
    const tick = () => { $('#clk', el) && ($('#clk', el).textContent = agora().toLocaleTimeString('pt-BR', { timeZone: TZ_BR })); };
    tick(); window.__tick = setInterval(tick, 1000);
    const marcar = async tipo => { if (await tryDo(() => api('/ponto', { method: 'POST', body: { tipo } }))) { ok(ROTULOS[tipo] + ' registrada.'); await loadMe(); const sp = $('.sidecard .pill'); if (sp) { sp.textContent = ME.em_turno ? 'Em turno' : 'Ativo'; sp.classList.toggle('amber', ME.em_turno); } draw(); } };
    $('#b1', el).onclick = () => marcar(prim[0]); $('#b2', el).onclick = () => marcar('saida');
  }

  async function drawHist(box) {
    const [cal, dia] = await Promise.all([api('/ponto/calendario?mes=' + mes), api('/ponto/dia?data=' + sel)]);
    const [y, m] = mes.split('-').map(Number);
    const first = new Date(y, m - 1, 1).getDay(), tot = new Date(y, m, 0).getDate();
    const P = { completo: ['green', 'Completo'], atencao: ['amber', 'Atenção'], falta: ['red', 'Falta'], folga: ['gray', 'Folga'], andamento: ['blue', 'Em andamento'], pendente: ['amber', 'Pendente'] };
    const mapa = Object.fromEntries(cal.dias.map(d => [d.dia, d.status]));
    let cells = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(t => `<div class="h">${t}</div>`).join('') + '<div class="d blank"></div>'.repeat(first);
    for (let i = 1; i <= tot; i++) { const iso = `${mes}-${String(i).padStart(2, '0')}`, st = mapa[iso]; cells += `<button class="d ${iso === sel ? 'on' : ''}" data-d="${iso}">${i}${st ? `<br><span class="pill ${P[st][0]}">${P[st][1]}</span>` : ''}</button>`; }
    const nomeMes = cap(new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
    const sp = P[mapa[sel]] || ['gray', '—'];
    box.innerHTML = `<div class="grid" style="grid-template-columns:2.4fr 1fr;align-items:start">
      <div class="card"><div class="hd"><div><h2>${nomeMes}</h2><div class="sub">Selecione um dia para ver os detalhes.</div></div>
        <div style="display:flex;gap:8px;align-items:center"><button class="btn ghost sm" id="pm">‹</button><button class="btn ghost sm" id="nm">›</button></div></div>
        <div class="bd"><div class="legend" style="margin-bottom:12px"><span><i class="dot" style="background:var(--green)"></i>Ponto Completo</span><span><i class="dot" style="background:#f59e0b"></i>Esquecimento / Atraso</span><span><i class="dot" style="background:var(--red)"></i>Falta</span><span><i class="dot"></i>Folga</span></div><div class="cal">${cells}</div></div></div>
      <div class="card"><div class="hd"><div><h2>Detalhes do Dia Selecionado</h2><div class="sub">${fmtData(sel)}</div></div><span class="pill ${sp[0]}">${sp[1]}</span></div>
        <div class="bd"><div style="background:var(--gray-bg);border-radius:8px;padding:10px 12px;margin-bottom:8px"><span class="eyebrow">Turno atribuído</span><br><b>${esc(dia.turno.nome)}: ${dia.turno.inicio} – ${dia.turno.fim}</b></div>
          ${Object.entries(ROTULOS).map(([k, t]) => `<div class="mark"><span>${t}</span>${dia.marcas[k] ? `<b>${dia.marcas[k]}</b>` : '<span style="color:#d97706">Pendente</span>'}</div>`).join('')}
          <div class="total"><span class="sub" style="color:#cfd6f7">Total de horas trabalhadas</span><b>${dia.trabalhado}</b></div></div></div></div>`;
    const mover = k => { const d = new Date(y, m - 1 + k, 1); mes = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); sel = mes + '-01'; drawHist(box); };
    $('#pm', box).onclick = () => mover(-1); $('#nm', box).onclick = () => mover(1);
    $$('[data-d]', box).forEach(b => b.onclick = () => { sel = b.dataset.d; drawHist(box); });
  }
  await draw();
};

/* ================= Preferência de turnos ================= */
V['/turnos'] = async el => {
  const d = await api('/turnos');
  let escolhido = null;
  const IC = { sunrise: 'sunrise', sun: 'sun', moon: 'moon' };
  const corRot = r => r === 'Turno Atual' ? 'blue' : r === 'Vagas Abertas' ? 'green' : r === 'Poucas Vagas' ? 'amber' : 'red';
  const atual = d.turnos.find(t => t.id === d.atual);
  const ST = { aprovado: ['green', 'Aprovado'], em_analise: ['amber', 'Em Análise'], recusado: ['red', 'Recusado'] };
  const emAnalise = d.historico.some(h => h.status === 'em_analise');
  el.innerHTML = `<div class="eyebrow">Portal do Colaborador</div><h1 style="margin-bottom:14px">Visão Geral</h1>
    <div class="card" style="margin-bottom:22px"><div class="bd" style="display:flex;gap:14px;align-items:center;justify-content:space-between"><div style="display:flex;gap:14px;align-items:center"><div class="ico">${ic('clock')}</div><div><div class="eyebrow">Turno atual</div><b style="font-size:17px">${atual.nome} • ${atual.inicio} – ${atual.fim}</b><div class="sub">As solicitações são revisadas pelo supervisor e, quando aprovadas, aplicadas à próxima escala semanal.</div></div></div><span class="pill green">• Escala ativa</span></div></div>
    <h2 style="font-size:16px">Turnos disponíveis</h2><div class="sub" style="margin-bottom:12px">Selecione uma opção para registrar sua preferência.</div>
    <div class="grid g3" id="cards" style="margin-bottom:22px">${d.turnos.map(t => `<button class="sel" data-t="${t.id}" style="padding:22px"><span class="chk">${ic('check')}</span><div class="ico" style="margin-bottom:26px">${ic(IC[t.icone])}</div>
      <b style="font-size:16px">${t.nome}</b> <span class="pill ${corRot(t.rotulo)}">${t.rotulo}</span><div style="font-size:19px;font-weight:700;margin:14px 0 4px">${t.inicio} – ${t.fim}</div><div class="sub">${t.horas}h diárias${t.id !== d.atual ? ` · ${t.vagas} vaga(s)` : ''}</div></button>`).join('')}</div>
    <div class="grid" style="grid-template-columns:1fr 1.6fr;align-items:start">
      <div class="card"><div class="hd"><div><h2>Solicitar alteração de turno</h2><div class="sub">A solicitação será encaminhada ao seu supervisor.</div></div></div><form class="bd" id="f">
        <div class="field"><label>A partir de qual data deseja trocar?</label><input type="date" name="a_partir_de" min="${hojeISO()}" required></div>
        <div class="field"><label>Observação ou justificativa para o supervisor</label><textarea name="observacao" maxlength="300" placeholder="Ex.: necessidade de conciliar com curso técnico."></textarea></div>
        <div class="hint" id="aviso" style="background:var(--gray-bg);padding:10px;border-radius:8px;margin-bottom:12px">Selecione um turno acima.</div>
        <button class="btn block" ${emAnalise ? 'disabled' : ''}>${ic('check')} Salvar Preferência de Turno</button>${emAnalise ? '<div class="hint">Você já tem uma solicitação em análise.</div>' : ''}</form></div>
      <div class="card"><div class="hd"><div><h2>Histórico de Solicitações</h2><div class="sub">Acompanhe as suas últimas solicitações de troca.</div></div></div><div class="tw"><table><thead><tr><th>Data do pedido</th><th>Turno solicitado</th><th>Início previsto</th><th style="text-align:right">Status</th></tr></thead><tbody>
        ${d.historico.map(h => `<tr><td>${fmtData(h.criado_em)}</td><td>${h.turno_nome}</td><td>${fmtData(h.inicio_previsto)}</td><td style="text-align:right"><span class="pill ${ST[h.status][0]}">${ST[h.status][1]}</span></td></tr>`).join('') || '<tr><td colspan="4" class="empty">Nenhuma solicitação ainda.</td></tr>'}</tbody></table></div></div></div>`;
  $$('#cards .sel', el).forEach(b => b.onclick = () => {
    if (b.dataset.t === d.atual) return toast('Este já é o seu turno atual.');
    escolhido = b.dataset.t; $$('#cards .sel', el).forEach(x => x.classList.toggle('on', x === b));
    const t = d.turnos.find(x => x.id === escolhido); $('#aviso', el).innerHTML = `${ic('clock')} Você está solicitando o turno da <b>${t.nome}</b>, das ${t.inicio} às ${t.fim}.`;
  });
  $('#f', el).onsubmit = async e => {
    e.preventDefault(); if (!escolhido) return toast('Escolha um turno acima.', 'err');
    const f = Object.fromEntries(new FormData(e.target));
    if (await tryDo(() => api('/turnos/solicitar', { method: 'POST', body: { ...f, turno: escolhido } }))) { ok('Solicitação enviada ao supervisor.'); V['/turnos'](el); }
  };
};

/* ================= Máquinas (apontamento) ================= */
function dropzone(onDone) {
  const box = document.createElement('div');
  box.innerHTML = `<input type="file" accept=".csv,.txt" hidden><div class="drop"><div><div class="ico" style="margin:0 auto 12px">${ic('upload')}</div><b>Importação Rápida de Arquivo (Máquinas SVR / Stoll)</b>
    <div class="sub" style="margin:6px 0 16px">Arraste e solte arquivos .CSV / .TXT da Shima Seiki SVR via USB ou rede local.</div><button type="button" class="btn ghost">${ic('upload')} Selecionar Arquivo de Log</button>
    <div class="hint" style="margin-top:14px">Colunas: máquina; OP; produção; defeitos. Última sincronização: <span data-sync>${ME.ultima_sync ? new Date(ME.ultima_sync).toLocaleString('pt-BR') : 'nunca'}</span></div></div></div>`;
  const inp = $('input', box), z = $('.drop', box);
  const enviar = async f => {
    if (!f) return; const fd = new FormData(); fd.append('arquivo', f);
    const r = await tryDo(() => api('/importar-log', { method: 'POST', form: fd })); if (!r) return;
    ok(`${r.atualizadas} ordem(ns) atualizada(s)` + (r.ignoradas ? `, ${r.ignoradas} linha(s) ignorada(s).` : '.')); ME.ultima_sync = new Date().toISOString(); $('[data-sync]', box).textContent = new Date().toLocaleString('pt-BR'); onDone && onDone();
  };
  $('button', box).onclick = () => inp.click(); inp.onchange = () => { enviar(inp.files[0]); inp.value = ''; };
  z.ondragover = e => { e.preventDefault(); z.classList.add('over'); }; z.ondragleave = () => z.classList.remove('over');
  z.ondrop = e => { e.preventDefault(); z.classList.remove('over'); enviar(e.dataTransfer.files[0]); };
  return box;
}

V['/maquinas'] = async el => {
  let tab = 'rapido', selId = null, motivo = null;
  const REASON_ICO = { fio_arrebentado: 'scissors', agulha_quebrada: 'wrench', falha_costura: 'list', falta_materia_prima: 'box', troca_cor: 'gear', manutencao_urgente: 'alert' };

  async function draw() {
    const head2 = `<div class="pagehead"><div><div class="eyebrow">Portal do Colaborador</div><h1>Apontamento de Máquinas</h1><div class="sub">Registre a produção e comunique ocorrências do turno em poucos toques.</div></div>
      <div class="seg"><button data-tab="rapido" class="${tab === 'rapido' ? 'on' : ''}">Apontamento Rápido (Operador)</button><button data-tab="log" class="${tab === 'log' ? 'on' : ''}">Importar Log SVR / CSV</button></div></div><div id="tb"></div>`;
    el.innerHTML = head2;
    $$('[data-tab]', el).forEach(b => b.onclick = () => { tab = b.dataset.tab; draw(); });
    if (tab === 'log') { const c = document.createElement('div'); c.className = 'card'; c.style.padding = '14px'; c.append(dropzone()); return $('#tb', el).append(c); }
    const { maquinas, motivos } = await api('/operador/maquinas');
    if (!selId || !maquinas.find(m => m.id === selId)) selId = (maquinas.find(m => m.pedido) || maquinas[0] || {}).id;
    const m = maquinas.find(x => x.id === selId), p = m && m.pedido;
    const pct = p ? Math.round(100 * p.produzido / p.meta) : 0;
    $('#tb', el).innerHTML = `<div class="grid g12" style="align-items:start">
      <div class="card"><div class="hd"><div><h2><span class="pill gray" style="margin-right:6px">1</span>Selecione sua Máquina e OP</h2><div class="sub">Escolha a posto em que está operando agora.</div></div></div>
        <div class="bd" style="display:flex;flex-direction:column;gap:12px">${maquinas.map(x => `<button class="sel ${x.id === selId ? 'on' : ''}" data-m="${x.id}"><span class="chk">${ic('check')}</span><b>${esc(x.apelido)} • ${esc(x.marca || '')} ${esc(x.modelo || '')}</b><div style="margin:6px 0">${mpill(x.status)}</div>
          <div class="sub">Galga ${esc(x.galga || '-')}</div><div class="sub" style="margin-top:6px">${x.pedido ? `${esc(x.pedido.codigo)} · ${esc(x.pedido.modelo)} (${esc(x.pedido.cor || '')})` : esc(x.aviso || 'Aguardando operador / OP')}</div></button>`).join('') || '<div class="empty">Nenhuma máquina cadastrada.</div>'}</div></div>
      <div class="card"><div class="hd"><div><h2><span class="pill gray" style="margin-right:6px">2</span>Controle de Produção &amp; Ocorrências</h2><div class="sub">${m ? `${esc(m.apelido)} • ${esc(m.marca || '')} ${esc(m.modelo || '')}${p ? ` • ${esc(p.codigo)} · ${esc(p.modelo)} (${esc(p.cor || '')})` : ''}` : ''}</div></div></div>
        ${!m ? '' : !p ? '<div class="empty">Esta máquina não tem ordem de produção atribuída. Peça ao supervisor para criar uma OP.</div>' : `
        <div class="bd" style="display:grid;grid-template-columns:1fr auto auto;gap:14px;align-items:center"><div><div class="eyebrow">Produção do turno</div><div style="font-size:30px;font-weight:700">${p.produzido} <span class="sub" style="font-size:15px;font-weight:400">/${p.meta} peças</span></div>
          <div class="bar" style="margin:8px 0"><i style="width:${pct}%"></i></div><div class="sub">${pct}% · ${mpill(m.status)}</div></div>
          <button class="btn green" id="ini">${ic('play')} ${p.status === 'pausado' ? 'Retomar' : 'Iniciar'} Produção</button><button class="btn ghost" id="pau" ${m.status === 'operando' ? '' : 'disabled'}>${ic('pause')} Pausar</button></div>
        <div class="bd" style="border-top:1px solid var(--line);display:flex;gap:10px;align-items:center"><label style="margin:0;white-space:nowrap">Lançar peças produzidas</label><input type="number" id="qtd" min="1" placeholder="Ex.: 10" style="width:110px"><button class="btn sm" id="lan">${ic('plus')} Lançar</button></div>
        <div class="bd" style="border-top:1px solid var(--line)"><h3 style="font-size:15px">Registrar Parada ou Problema</h3><div class="sub" style="margin-bottom:12px">Toque no motivo para comunicar imediatamente.</div>
          <div class="reasons">${motivos.map(r => `<button class="sel ${r.id === 'manutencao_urgente' ? 'danger' : ''} ${motivo === r.id ? 'on' : ''}" data-r="${r.id}">${ic(REASON_ICO[r.id], '')}<span>${r.nome}</span></button>`).join('')}</div>
          <div style="display:grid;grid-template-columns:170px 1fr;gap:12px;align-items:end;margin-top:16px"><div><label>Peças avariadas</label><input type="number" id="av" min="0" value="0"></div><div><label>Observação <small>(opcional)</small></label><input id="ob" maxlength="300" placeholder="Adicione um detalhe curto…"></div></div><button class="btn block" id="env" style="margin-top:12px">${ic('check')} Enviar Relatório ao Supervisor</button></div>`}</div></div>
      <div class="card" id="imp" style="margin-top:18px;padding:14px"></div>`;
    $$('[data-m]', el).forEach(b => b.onclick = () => { selId = +b.dataset.m; motivo = null; draw(); });
    $$('[data-r]', el).forEach(b => b.onclick = () => { motivo = b.dataset.r; $$('[data-r]', el).forEach(x => x.classList.toggle('on', x === b)); });
    const acao = async (a, extra = {}) => { if (await tryDo(() => api('/operador/producao', { method: 'POST', body: { maquina_id: selId, acao: a, ...extra } }))) draw(); };
    if (p) {
      $('#ini', el).onclick = () => acao('iniciar'); $('#pau', el).onclick = () => acao('pausar');
      $('#lan', el).onclick = () => acao('lancar', { quantidade: $('#qtd', el).value });
      $('#env', el).onclick = async () => {
        if (!motivo) return toast('Toque em um motivo primeiro.', 'err');
        if (await tryDo(() => api('/operador/ocorrencia', { method: 'POST', body: { maquina_id: selId, motivo, pecas_avariadas: $('#av', el).value, observacao: $('#ob', el).value } }))) { ok('Relatório enviado ao supervisor.'); motivo = null; draw(); }
      };
    }
    const mini = dropzone(draw); $('.drop', mini).style.minHeight = '0'; $('.drop', mini).style.padding = '16px'; $('#imp', el).append(mini);
  }
  await draw();
};

/* ================= Terceirização (funcionário) ================= */
V['/terceirizacao'] = async el => {
  let tab = 'cand', funcao = 'costureira', destino = null; const equip = new Set();
  const op = await api('/terceirizacao/opcoes');
  const ST = { vinculo_ativo: ['green', '● Vínculo Ativo'], em_analise: ['amber', '● Em Análise'], aprovado: ['blue', '● Aprovado'], recusado: ['red', '● Recusado'] };
  const RST = { conferido: ['green', '● Conferido'], aguardando: ['amber', '● Aguardando Conferência'] };
  const FIC = { costureira: 'scissors', passadeira: 'gear', malharia_parceira: 'file' };

  async function draw() {
    el.innerHTML = head('Terceirização e Parcerias', 'Gerencie vínculos com malharias e acompanhe suas entregas terceirizadas.') + tabsHTML([['cand', 'list', 'Candidatura e Malharias'], ['rel', 'file', 'Enviar Relatório de Produção']], tab) + '<div id="tb"></div>';
    $$('[data-tab]', el).forEach(b => b.onclick = () => { tab = b.dataset.tab; draw(); });
    await (tab === 'cand' ? drawCand : drawRel)($('#tb', el));
  }

  async function drawCand(box) {
    const mine = await api('/candidaturas/minhas');
    box.innerHTML = `<div class="grid g2" style="align-items:start">
      <form class="card" id="f"><div class="hd"><div><h2>Nova Candidatura / Vínculo</h2><div class="sub">Apresente sua capacidade de produção para uma malharia.</div></div></div><div class="bd">
        <div class="field"><label>Buscar Malharia por Nome ou CNPJ</label><input id="bq" autocomplete="off" placeholder="Digite ao menos 2 letras…" value="${destino ? esc(destino.nome_fantasia + ' — ' + destino.cidade + '/' + destino.uf) : ''}"><div id="sug"></div></div>
        <div class="field"><label>Função ou tipo de parceria</label><div class="grid g3" style="gap:10px">${op.funcoes.map(f => `<button type="button" class="sel ${f.id === funcao ? 'on' : ''}" data-f="${f.id}" style="text-align:center"><div class="ico" style="margin:0 auto 6px">${ic(FIC[f.id])}</div><b style="font-size:12.5px">${f.nome}</b></button>`).join('')}</div></div>
        <div class="row r2"><div class="field"><label>Capacidade Diária (peças/dia)</label><input type="number" name="capacidade" min="1" required placeholder="120"></div><div class="field"><label>Valor Médio por Peça (R$)</label><input name="valor_peca" required placeholder="3,50" inputmode="decimal"></div></div>
        <div class="field"><label>Equipamentos e especialidades</label><div class="chips">${op.equipamentos.map(e => `<button type="button" class="chip ${equip.has(e) ? 'on' : ''}" data-e="${e}">${equip.has(e) ? '✓ ' : ''}${e}</button>`).join('')}</div></div>
        <div class="field"><label>Observações ou experiência <small>(opcional)</small></label><textarea name="observacao" maxlength="500" id="obs" placeholder="Conte brevemente sobre sua experiência, prazos e tipos de peças…"></textarea><div class="count"><span id="cnt">0</span>/500</div></div>
        <button class="btn block">${ic('check')} Enviar Candidatura</button></div></form>
      <div class="card"><div class="hd"><div><h2>Minhas Malharias e Solicitações</h2><div class="sub">Acompanhe seus vínculos ativos e candidaturas em análise.</div></div><span class="pill gray">${mine.length} vínculo(s)</span></div>
        ${mine.map(c => `<div class="listrow" style="cursor:default"><div class="ico">${ic('file')}</div><div class="grow"><b>${esc(c.nome_fantasia)}</b><small>${esc(c.cidade || '')}${c.uf ? '/' + c.uf : ''}</small><small>Função: ${c.funcao_nome}</small></div>
          <div style="text-align:right"><span class="pill ${ST[c.status][0]}">${ST[c.status][1]}</span>${['aprovado', 'vinculo_ativo'].includes(c.status) ? `<br><a href="#/terceirizacao" data-rel="${c.malharia_id}" style="font-size:12px;color:var(--navy)">Enviar Relatório →</a>` : ''}</div></div>`).join('') || '<div class="empty">Você ainda não tem candidaturas.</div>'}
        <div class="hint" style="padding:12px 18px">${ic('alert')} As malharias recebem seus dados de capacidade apenas após o envio da candidatura.</div></div></div>`;
    let t; $('#bq', box).oninput = e => { destino = null; clearTimeout(t); const q = e.target.value.trim(); if (q.length < 2) return $('#sug', box).innerHTML = '';
      t = setTimeout(async () => { const r = await tryDo(() => api('/malharias/buscar?q=' + encodeURIComponent(q))) || [];
        $('#sug', box).innerHTML = r.length ? `<div class="suggest">${r.map(m => `<button type="button" data-id="${m.id}">${esc(m.nome_fantasia)} <span class="sub">— ${esc(m.cidade || '')}/${esc(m.uf || '')}</span></button>`).join('')}</div>` : '<div class="hint">Nenhuma malharia verificada encontrada.</div>';
        $$('#sug button', box).forEach(b => b.onclick = () => { destino = r.find(x => x.id === +b.dataset.id); $('#bq', box).value = `${destino.nome_fantasia} — ${destino.cidade}/${destino.uf}`; $('#sug', box).innerHTML = ''; }); }, 250); };
    $$('[data-f]', box).forEach(b => b.onclick = () => { funcao = b.dataset.f; $$('[data-f]', box).forEach(x => x.classList.toggle('on', x === b)); });
    $$('[data-e]', box).forEach(b => b.onclick = () => { const e = b.dataset.e; equip.has(e) ? equip.delete(e) : equip.add(e); b.classList.toggle('on'); b.textContent = (equip.has(e) ? '✓ ' : '') + e; });
    $('#obs', box).oninput = e => $('#cnt', box).textContent = e.target.value.length;
    $$('[data-rel]', box).forEach(a => a.onclick = ev => { ev.preventDefault(); destino = { id: +a.dataset.rel }; tab = 'rel'; draw(); });
    $('#f', box).onsubmit = async e => {
      e.preventDefault(); if (!destino || !destino.id) return toast('Selecione uma malharia da lista de resultados.', 'err');
      const f = Object.fromEntries(new FormData(e.target));
      if (await tryDo(() => api('/candidaturas', { method: 'POST', body: { ...f, malharia_id: destino.id, funcao, equipamentos: [...equip] } }))) { ok('Candidatura enviada!'); destino = null; equip.clear(); draw(); }
    };
  }

  async function drawRel(box) {
    const [mine, rels] = await Promise.all([api('/candidaturas/minhas'), api('/relatorios/meus')]);
    const aptas = mine.filter(c => ['aprovado', 'vinculo_ativo'].includes(c.status));
    const uniq = [...new Map(aptas.map(c => [c.malharia_id, c])).values()];
    const pre = destino && destino.id && uniq.find(u => u.malharia_id === destino.id) ? destino.id : (uniq[0] || {}).malharia_id;
    box.innerHTML = `<div class="card" style="margin-bottom:20px"><div class="hd"><div><h2>Novo Relatório de Entrega / Ocorrência</h2><div class="sub">Informe a produção concluída para conferência da malharia contratante.</div></div></div>
      ${!uniq.length ? '<div class="empty">Você ainda não tem vínculo aprovado com nenhuma malharia. Envie uma candidatura primeiro.</div>' : `<form class="bd" id="f"><div class="row r2"><div class="field"><label>Malharia Destino</label><select name="malharia_id" id="md">${uniq.map(u => `<option value="${u.malharia_id}" ${u.malharia_id === pre ? 'selected' : ''}>${esc(u.nome_fantasia)}</option>`).join('')}</select></div>
        <div class="field"><label>Lote / Ordem de Serviço</label><input name="lote" id="lote" list="lotes" required placeholder="Ex.: OP #2841"><datalist id="lotes"></datalist></div></div>
        <div class="row r3"><div class="field"><label>Peças Concluídas</label><input type="number" name="pecas" min="1" required></div><div class="field"><label>Peças Avariadas / Defeito</label><input type="number" name="avariadas" min="0" value="0"></div><div class="field"><label>Previsão de Entrega</label><input type="date" name="previsao"></div></div>
        <div class="field"><label>Observações técnicas ou problemas na costura/tecelagem</label><textarea name="observacao" maxlength="500" placeholder="Descreva ajustes, divergências de material ou ocorrências do lote…"></textarea></div>
        <button class="btn">${ic('upload')} Enviar Relatório para Malharia</button></form>`}</div>
      <div class="card"><div class="hd"><div><h2>Relatórios Enviados Recentemente</h2><div class="sub">Acompanhe o recebimento e a conferência das suas entregas.</div></div></div><div class="tw"><table><thead><tr><th>Data</th><th>Malharia</th><th>Lote</th><th>Qtd. entregue</th><th>Avarias</th><th style="text-align:right">Status</th></tr></thead><tbody>
        ${rels.map(r => `<tr><td>${fmtData(r.criado_em)}</td><td><b>${esc(r.nome_fantasia)}</b></td><td>${esc(r.lote)}</td><td><b>${r.pecas} peças</b></td><td>${r.avariadas}</td><td style="text-align:right"><span class="pill ${RST[r.status][0]}">${RST[r.status][1]}</span></td></tr>`).join('') || '<tr><td colspan="6" class="empty">Nenhum relatório enviado.</td></tr>'}</tbody></table></div></div>`;
    if (!uniq.length) return;
    const carregaLotes = async () => { const l = await api('/lotes?malharia_id=' + $('#md', box).value).catch(() => []); $('#lotes', box).innerHTML = l.map(x => `<option value="${esc(x.codigo)}">${esc(x.modelo)} ${esc(x.cor || '')}</option>`).join(''); };
    $('#md', box).onchange = carregaLotes; carregaLotes();
    $('#f', box).onsubmit = async e => { e.preventDefault(); if (await tryDo(() => api('/relatorios', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) }))) { ok('Relatório enviado para a malharia.'); draw(); } };
  }
  await draw();
};
