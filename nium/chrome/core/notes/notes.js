'use strict';
// Nium Notes — notas guardadas no perfil do Nium (ou no navegador, para testar).
// Dados: { version, notes: [...], folders: [...] } na chave "notes" do NiumStore.
(() => {
  const KEY = 'notes';
  const $ = (s) => document.querySelector(s);
  const el = { app: $('#app'), sections: $('#sections'), cards: $('#cards'), listTitle: $('#list-title'),
    search: $('#search'), empty: $('#empty'), doc: $('#doc'), title: $('#title'), body: $('#body'),
    source: $('#source'), words: $('#words'), saved: $('#saved'), folder: $('#folder-select'),
    pin: $('#pin-btn'), trash: $('#trash-btn'), trashBar: $('#trash-bar'), theme: $('#theme-btn'), toast: $('#toast') };

  const ICON = {
    all: '<svg viewBox="0 0 16 16"><rect x="3" y="2" width="10" height="12" rx="2.5"/><path d="M5.8 6h4.4M5.8 9h4.4"/></svg>',
    pinned: '<svg viewBox="0 0 16 16"><path d="M8 1.8 9.8 5.6l4.1.5-3 2.9.8 4.1L8 11.1 4.3 13.1l.8-4.1-3-2.9 4.1-.5Z"/></svg>',
    web: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.8"/><path d="M2.4 8h11.2M8 2.2c1.7 1.6 2.5 3.5 2.5 5.8S9.7 12.2 8 13.8C6.3 12.2 5.5 10.3 5.5 8S6.3 3.8 8 2.2Z"/></svg>',
    folder: '<svg viewBox="0 0 16 16"><path d="M2 4.6c0-.9.7-1.6 1.6-1.6h2.6l1.5 1.6h4.7c.9 0 1.6.7 1.6 1.6v5.2c0 .9-.7 1.6-1.6 1.6H3.6c-.9 0-1.6-.7-1.6-1.6Z"/></svg>',
    trash: '<svg viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.3c0 .7.6 1.2 1.3 1.2h3.2c.7 0 1.3-.5 1.3-1.2l.6-8.3"/></svg>',
    plus: '<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',
    sun: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"/></svg>',
    moon: '<svg viewBox="0 0 16 16"><path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z"/></svg>',
    auto: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.8"/><path d="M8 2.2v11.6a5.8 5.8 0 0 0 0-11.6Z" fill="currentColor"/></svg>',
  };

  let data = { version: 1, notes: [], folders: [] };
  let view = 'all';          // all | pinned | web | trash | <folder id>
  let currentId = null;
  let query = '';
  let saveTimer = null;
  let renameFolder = null;

  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const now = () => Date.now();
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const host = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };
  const current = () => data.notes.find((n) => n.id === currentId) || null;

  // ---------- HTML seguro: só as tags e atributos que o editor usa ----------
  const ALLOWED = new Set(['P', 'BR', 'H1', 'H2', 'H3', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'CODE', 'PRE', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'A', 'HR', 'DIV', 'SPAN']);
  function sanitize(html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html || '';
    const walk = (node) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === Node.TEXT_NODE) continue;
        if (child.nodeType !== Node.ELEMENT_NODE || !ALLOWED.has(child.tagName)) {
          if (child.nodeType === Node.ELEMENT_NODE && !['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'TEMPLATE'].includes(child.tagName)) {
            walk(child);
            child.replaceWith(...child.childNodes);
          } else child.remove();
          continue;
        }
        for (const attr of [...child.attributes]) {
          const keep = (attr.name === 'href' && child.tagName === 'A' && /^(https?:|mailto:)/i.test(attr.value)) ||
            (attr.name === 'class' && attr.value === 'checklist' && child.tagName === 'UL') ||
            (attr.name === 'data-checked' && child.tagName === 'LI');
          if (!keep) child.removeAttribute(attr.name);
        }
        if (child.tagName === 'A') { child.setAttribute('target', '_blank'); child.setAttribute('rel', 'noopener'); }
        walk(child);
      }
    };
    walk(tpl.content);
    return tpl.innerHTML;
  }
  const plain = (html) => { const d = document.createElement('div'); d.innerHTML = html || ''; d.querySelectorAll('li,p,h1,h2,h3,blockquote,pre,div,br').forEach((n) => n.append(' ')); return d.textContent.replace(/\s+/g, ' ').trim(); };

  // ---------- Armazenamento ----------
  async function load() {
    try {
      const saved = await NiumStore.get(KEY);
      if (saved && Array.isArray(saved.notes)) data = { version: 1, folders: [], ...saved };
    } catch (error) { toast('Não foi possível abrir as notas: ' + error.message); }
    if (!data.notes.length && !(await NiumStore.get(KEY + '-welcomed'))) {
      data.notes.push(welcomeNote());
      NiumStore.set(KEY + '-welcomed', true).catch(() => {});
      persist();
    }
  }
  function persist() {
    el.saved.textContent = 'Salvando…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await NiumStore.set(KEY, data); el.saved.textContent = 'Salvo'; }
      catch (error) { el.saved.textContent = 'Não salvo'; toast('Erro ao salvar: ' + error.message); }
    }, 400);
  }
  function welcomeNote() {
    return { id: uid(), title: 'Bem-vindo ao Nium Notes', pinned: true, folder: null, trashed: false,
      createdAt: now(), updatedAt: now(), source: null,
      html: '<p>Suas notas ficam no seu computador e salvam sozinhas enquanto você escreve.</p>' +
        '<h2>Atalhos de escrita</h2><ul><li><code>#</code> + espaço vira título, <code>##</code> subtítulo</li>' +
        '<li><code>-</code> + espaço começa uma lista, <code>1.</code> uma lista numerada</li>' +
        '<li><code>[]</code> + espaço cria uma lista de tarefas</li><li><code>&gt;</code> + espaço vira citação</li></ul>' +
        '<ul class="checklist"><li data-checked="">Abrir o Nium Notes</li><li>Criar a primeira nota</li><li>Organizar em pastas</li></ul>' +
        '<blockquote>Dica: Ctrl+Alt+N cria uma nota nova de qualquer lugar do app.</blockquote>' };
  }

  // ---------- Lista lateral (pastas) ----------
  function counts() {
    const live = data.notes.filter((n) => !n.trashed);
    const c = { all: live.length, pinned: live.filter((n) => n.pinned).length, web: live.filter((n) => n.source).length, trash: data.notes.length - live.length };
    for (const f of data.folders) c[f.id] = live.filter((n) => n.folder === f.id).length;
    return c;
  }
  function renderSections() {
    const c = counts();
    const item = (id, name, icon) => `<button type="button" class="sec ${view === id ? 'active' : ''}" data-view="${esc(id)}">${icon}<span class="name">${esc(name)}</span><span class="count">${c[id] || ''}</span></button>`;
    let html = item('all', 'Todas as notas', ICON.all) + item('pinned', 'Fixadas', ICON.pinned) + item('web', 'Da web', ICON.web);
    html += `<div class="sec-label"><span>Pastas</span><button type="button" data-action="new-folder" title="Nova pasta">${ICON.plus}</button></div>`;
    for (const f of data.folders) {
      html += renameFolder === f.id
        ? `<div class="sec active">${ICON.folder}<input data-rename="${esc(f.id)}" value="${esc(f.name)}" maxlength="60" aria-label="Nome da pasta"></div>`
        : item(f.id, f.name, ICON.folder).replace('<button ', `<button title="Clique duas vezes para renomear" `);
    }
    html += '<div class="sec-label"><span></span></div>' + item('trash', 'Lixeira', ICON.trash);
    el.sections.innerHTML = html;
    const input = el.sections.querySelector('[data-rename]');
    if (input) { input.focus(); input.select(); }
  }
  function viewName() {
    return { all: 'Todas as notas', pinned: 'Fixadas', web: 'Da web', trash: 'Lixeira' }[view] || data.folders.find((f) => f.id === view)?.name || 'Notas';
  }

  // ---------- Lista de notas ----------
  function visibleNotes() {
    const q = query.toLowerCase();
    return data.notes.filter((n) => {
      if (view === 'trash' ? !n.trashed : n.trashed) return false;
      if (view === 'pinned' && !n.pinned) return false;
      if (view === 'web' && !n.source) return false;
      if (!['all', 'pinned', 'web', 'trash'].includes(view) && n.folder !== view) return false;
      return !q || (n.title + ' ' + plain(n.html) + ' ' + (n.source?.url || '')).toLowerCase().includes(q);
    }).sort((a, b) => (view !== 'trash' && b.pinned - a.pinned) || b.updatedAt - a.updatedAt);
  }
  function highlight(text) {
    const safe = esc(text);
    if (!query) return safe;
    const q = esc(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return safe.replace(new RegExp(q, 'gi'), (m) => `<mark>${m}</mark>`);
  }
  function when(ts) {
    const d = new Date(ts), today = new Date();
    if (d.toDateString() === today.toDateString()) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const diff = (today - d) / 86400000;
    if (diff < 6) return d.toLocaleDateString('pt-BR', { weekday: 'long' });
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
  }
  function renderCards() {
    el.listTitle.textContent = viewName();
    const notes = visibleNotes();
    if (!notes.length) {
      el.cards.innerHTML = `<p class="list-empty">${query ? 'Nenhuma nota encontrada.' : view === 'trash' ? 'A lixeira está vazia.' : 'Nenhuma nota aqui ainda.'}</p>`;
      return;
    }
    el.cards.innerHTML = notes.map((n) => {
      const text = plain(n.html);
      const folder = data.folders.find((f) => f.id === n.folder);
      const meta = [when(n.updatedAt), n.source ? host(n.source.url) : '', folder && view !== n.folder ? folder.name : ''].filter(Boolean);
      return `<button type="button" class="card ${n.id === currentId ? 'active' : ''}" data-id="${esc(n.id)}" role="option" aria-selected="${n.id === currentId}">
        <div class="card-title">${n.pinned && !n.trashed ? ICON.pinned : ''}<span>${highlight(n.title || 'Sem título')}</span></div>
        <div class="card-snip">${highlight(text.slice(0, 180)) || '<span style="opacity:.6">Nota vazia</span>'}</div>
        <div class="card-meta">${meta.map((m, i) => `<span class="${i === 1 && n.source ? 'host' : ''}">${esc(m)}</span>`).join('<span>·</span>')}</div></button>`;
    }).join('');
  }

  // ---------- Editor ----------
  function renderEditor() {
    const note = current();
    el.empty.hidden = !!note;
    el.doc.hidden = !note;
    if (!note) return;
    if (document.activeElement !== el.title) el.title.value = note.title;
    if (el.body.dataset.id !== note.id) {
      el.body.innerHTML = sanitize(note.html);
      el.body.dataset.id = note.id;
    }
    const editable = !note.trashed;
    el.body.contentEditable = String(editable);
    el.title.readOnly = !editable;
    el.trashBar.hidden = !note.trashed;
    el.source.hidden = !note.source;
    if (note.source) { el.source.href = note.source.url; el.source.textContent = '↗ ' + (note.source.title || host(note.source.url)); }
    el.folder.innerHTML = '<option value="">Sem pasta</option>' + data.folders.map((f) => `<option value="${esc(f.id)}" ${f.id === note.folder ? 'selected' : ''}>${esc(f.name)}</option>`).join('');
    el.folder.disabled = !editable;
    el.pin.innerHTML = ICON.pinned;
    el.pin.classList.toggle('on', !!note.pinned);
    el.pin.title = note.pinned ? 'Desafixar' : 'Fixar';
    el.trash.innerHTML = ICON.trash;
    el.trash.hidden = note.trashed;
    updateWords();
  }
  function updateWords() {
    const note = current();
    if (!note) return;
    const words = plain(el.body.innerHTML).split(' ').filter(Boolean).length;
    el.words.textContent = `${words} ${words === 1 ? 'palavra' : 'palavras'} · editada ${when(note.updatedAt)}`;
  }
  function render() { renderSections(); renderCards(); renderEditor(); }

  function open(id) {
    currentId = id;
    render();
  }
  function touch(note) { note.updatedAt = now(); persist(); renderSections(); renderCards(); updateWords(); }

  function newNote(extra = {}) {
    if (view === 'trash') view = 'all';
    const note = { id: uid(), title: '', html: '', pinned: view === 'pinned', trashed: false,
      folder: data.folders.some((f) => f.id === view) ? view : null, createdAt: now(), updatedAt: now(), source: null, ...extra };
    data.notes.unshift(note);
    persist();
    open(note.id);
    (note.html ? el.body : el.title).focus();
    return note;
  }

  // ---------- Formatação ----------
  function exec(cmd, value = null) { el.body.focus(); document.execCommand(cmd, false, value); onBodyInput(); }
  function currentBlock() {
    const sel = getSelection();
    if (!sel.rangeCount) return null;
    let n = sel.anchorNode;
    while (n && n !== el.body) {
      if (n.nodeType === 1 && /^(P|DIV|H1|H2|H3|LI|BLOCKQUOTE|PRE)$/.test(n.tagName)) return n;
      n = n.parentNode;
    }
    return null;
  }
  function placeCaret(node) {
    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(false);
    const sel = getSelection();
    sel.removeAllRanges(); sel.addRange(range);
  }
  // Listas feitas à mão: o execCommand do navegador junta listas vizinhas de tipos diferentes.
  function makeList(kind) {
    el.body.focus();
    let block = currentBlock();
    if (!block) { document.execCommand('formatBlock', false, 'P'); block = currentBlock(); }
    if (!block) return;
    const li = block.closest('li');
    const fresh = () => { const n = document.createElement(kind === 'ol' ? 'ol' : 'ul'); if (kind === 'check') n.className = 'checklist'; return n; };
    if (li) {
      const list = li.parentElement;
      const isCheck = list.classList.contains('checklist');
      const same = kind === 'check' ? isCheck : kind === 'ol' ? list.tagName === 'OL' : list.tagName === 'UL' && !isCheck;
      if (same) document.execCommand(list.tagName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');
      else {
        const n = fresh();
        n.append(...list.childNodes);
        if (kind !== 'check') n.querySelectorAll('[data-checked]').forEach((x) => x.removeAttribute('data-checked'));
        list.replaceWith(n);
        placeCaret(li);
      }
    } else {
      const n = fresh();
      const item = document.createElement('li');
      item.append(...block.childNodes);
      if (!item.textContent) item.replaceChildren(document.createElement('br'));
      n.append(item);
      block.replaceWith(n);
      placeCaret(item);
    }
    onBodyInput();
  }
  const toggleChecklist = () => makeList('check');
  function formatBlock(tag) {
    const block = currentBlock();
    exec('formatBlock', block && block.tagName === tag.toUpperCase() ? 'P' : tag);
  }
  const COMMANDS = {
    h1: () => formatBlock('H1'), h2: () => formatBlock('H2'),
    bold: () => exec('bold'), italic: () => exec('italic'), underline: () => exec('underline'), strikeThrough: () => exec('strikeThrough'),
    ul: () => makeList('ul'), ol: () => makeList('ol'), check: toggleChecklist,
    quote: () => formatBlock('BLOCKQUOTE'), code: () => formatBlock('PRE'),
    link: () => {
      const sel = getSelection();
      const existing = sel.anchorNode?.parentElement?.closest('a');
      const url = prompt('Endereço do link (https://…)', existing?.href || 'https://');
      if (url === null) return;
      if (!url.trim() || url.trim() === 'https://') { exec('unlink'); return; }
      if (!/^(https?:|mailto:)/i.test(url.trim())) { toast('Use um endereço que comece com https://'); return; }
      if (sel.isCollapsed && !existing) exec('insertHTML', `<a href="${esc(url.trim())}">${esc(url.trim())}</a>`);
      else exec('createLink', url.trim());
    },
  };
  function updateToolbar() {
    const block = currentBlock();
    const state = { h1: block?.tagName === 'H1', h2: block?.tagName === 'H2', quote: !!block?.closest?.('blockquote'), code: !!block?.closest?.('pre'),
      ul: !!block?.closest?.('ul:not(.checklist)'), ol: !!block?.closest?.('ol'), check: !!block?.closest?.('ul.checklist') };
    for (const b of document.querySelectorAll('[data-cmd]')) {
      const cmd = b.dataset.cmd;
      let on = state[cmd];
      if (['bold', 'italic', 'underline', 'strikeThrough'].includes(cmd)) { try { on = document.queryCommandState(cmd); } catch { on = false; } }
      b.classList.toggle('on', !!on);
    }
  }

  // Atalhos markdown no começo da linha: "# ", "## ", "- ", "1. ", "[] ", "> ", "```"
  const SHORTCUTS = [
    [/^#$/, () => exec('formatBlock', 'H1')], [/^##$/, () => exec('formatBlock', 'H2')],
    [/^[-*]$/, () => makeList('ul')], [/^1[.)]$/, () => makeList('ol')],
    [/^\[ ?\]$/, toggleChecklist], [/^>$/, () => exec('formatBlock', 'BLOCKQUOTE')], [/^```$/, () => exec('formatBlock', 'PRE')],
  ];
  function tryShortcut(event) {
    const sel = getSelection();
    if (!sel.isCollapsed || sel.anchorNode?.nodeType !== Node.TEXT_NODE) return;
    const block = currentBlock();
    if (block && /^(LI|H1|H2|PRE)$/.test(block.tagName)) return;
    const text = sel.anchorNode.textContent.slice(0, sel.anchorOffset);
    const before = block ? block.textContent : text;
    if (before !== text) return; // só no começo da linha
    const hit = SHORTCUTS.find(([re]) => re.test(text));
    if (!hit) return;
    event.preventDefault();
    const range = document.createRange();
    range.setStart(sel.anchorNode, 0);
    range.setEnd(sel.anchorNode, sel.anchorOffset);
    sel.removeAllRanges(); sel.addRange(range);
    document.execCommand('delete');
    hit[1]();
  }

  function onBodyInput() {
    const note = current();
    if (!note || note.trashed) return;
    note.html = sanitize(el.body.innerHTML);
    touch(note);
    updateToolbar();
  }

  // ---------- Exportar ----------
  function toMarkdown(note) {
    const d = document.createElement('div');
    d.innerHTML = note.html;
    const inline = (node) => [...node.childNodes].map((c) => {
      if (c.nodeType === 3) return c.textContent;
      const t = inline(c);
      switch (c.tagName) {
        case 'B': case 'STRONG': return `**${t}**`;
        case 'I': case 'EM': return `*${t}*`;
        case 'S': case 'STRIKE': return `~~${t}~~`;
        case 'CODE': return '`' + t + '`';
        case 'A': return `[${t}](${c.getAttribute('href')})`;
        case 'BR': return '\n';
        default: return t;
      }
    }).join('');
    const out = [];
    for (const b of d.childNodes) {
      if (b.nodeType === 3) { if (b.textContent.trim()) out.push(b.textContent.trim()); continue; }
      switch (b.tagName) {
        case 'H1': out.push('## ' + inline(b)); break;
        case 'H2': case 'H3': out.push('### ' + inline(b)); break;
        case 'BLOCKQUOTE': out.push(inline(b).split('\n').map((l) => '> ' + l).join('\n')); break;
        case 'PRE': out.push('```\n' + b.textContent + '\n```'); break;
        case 'HR': out.push('---'); break;
        case 'UL': case 'OL': out.push([...b.children].map((li, i) => (b.classList.contains('checklist') ? `- [${li.hasAttribute('data-checked') ? 'x' : ' '}] ` : b.tagName === 'OL' ? `${i + 1}. ` : '- ') + inline(li)).join('\n')); break;
        default: out.push(inline(b));
      }
    }
    const head = `# ${note.title || 'Sem título'}\n` + (note.source ? `\nFonte: [${note.source.title || host(note.source.url)}](${note.source.url})\n` : '');
    return head + '\n' + out.filter((s) => s.trim()).join('\n\n') + '\n';
  }
  function download(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    a.download = name.replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 80) + '.md';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ---------- Recorte vindo do navegador: index.html?clip=1&url=…&title=…&quote=… ----------
  function handleClip() {
    const p = new URLSearchParams(location.search);
    if (!p.has('clip')) return;
    const url = p.get('url') || '';
    const title = p.get('title') || '';
    const quote = p.get('quote') || '';
    if (!/^https?:/i.test(url)) return;
    newNote({ title, source: { url, title }, html: quote ? `<blockquote>${esc(quote)}</blockquote><p><br></p>` : '' });
    history.replaceState(null, '', location.pathname);
  }

  // ---------- Tema ----------
  const THEMES = ['auto', 'light', 'dark'];
  function applyTheme(t) {
    if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
    el.theme.innerHTML = ICON[t === 'auto' ? 'auto' : t === 'light' ? 'sun' : 'moon'];
    el.theme.title = 'Tema: ' + { auto: 'automático', light: 'claro', dark: 'escuro' }[t];
    try { localStorage.setItem('nium-notes-theme', t); } catch {}
  }

  function toast(text) {
    el.toast.textContent = text;
    el.toast.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.toast.classList.remove('show'), 2600);
  }

  // ---------- Eventos ----------
  document.addEventListener('click', (event) => {
    const t = event.target.closest('[data-action],[data-view],[data-id],[data-cmd]');
    if (!t) return;
    if (t.dataset.cmd) { COMMANDS[t.dataset.cmd]?.(); return; }
    if (t.dataset.view) { view = t.dataset.view; renameFolder = null; render(); return; }
    if (t.dataset.id && t.classList.contains('card')) { open(t.dataset.id); return; }
    const note = current();
    switch (t.dataset.action) {
      case 'new': newNote(); break;
      case 'new-folder': {
        const f = { id: uid(), name: 'Nova pasta' };
        data.folders.push(f); renameFolder = f.id; view = f.id; persist(); render(); break;
      }
      case 'pin': if (note) { note.pinned = !note.pinned; touch(note); renderEditor(); } break;
      case 'trash': if (note) { note.trashed = true; note.trashedAt = now(); persist(); currentId = null; render(); toast('Nota movida para a lixeira.'); } break;
      case 'restore': if (note) { note.trashed = false; delete note.trashedAt; persist(); view = 'all'; render(); toast('Nota restaurada.'); } break;
      case 'destroy':
        if (note && confirm('Excluir esta nota para sempre? Isso não pode ser desfeito.')) {
          data.notes = data.notes.filter((n) => n.id !== note.id); currentId = null; persist(); render();
        }
        break;
      case 'export': if (note) download(note.title || 'Nota', toMarkdown(note)); break;
      case 'export-all': {
        const live = data.notes.filter((n) => !n.trashed);
        if (!live.length) { toast('Não há notas para exportar.'); break; }
        download('Nium Notes', live.map(toMarkdown).join('\n---\n\n'));
        break;
      }
      case 'theme': {
        let cur = 'auto'; try { cur = localStorage.getItem('nium-notes-theme') || 'auto'; } catch {}
        applyTheme(THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length]);
        break;
      }
    }
  });
  el.sections.addEventListener('dblclick', (event) => {
    const b = event.target.closest('[data-view]');
    if (b && data.folders.some((f) => f.id === b.dataset.view)) { renameFolder = b.dataset.view; renderSections(); }
  });
  el.sections.addEventListener('contextmenu', (event) => {
    const b = event.target.closest('[data-view]');
    const f = b && data.folders.find((x) => x.id === b.dataset.view);
    if (!f) return;
    event.preventDefault();
    if (confirm(`Apagar a pasta "${f.name}"? As notas dela continuam em "Todas as notas".`)) {
      data.folders = data.folders.filter((x) => x.id !== f.id);
      data.notes.forEach((n) => { if (n.folder === f.id) n.folder = null; });
      if (view === f.id) view = 'all';
      persist(); render();
    }
  });
  const finishRename = (input, keep) => {
    const f = data.folders.find((x) => x.id === input.dataset.rename);
    if (f && keep && input.value.trim()) f.name = input.value.trim();
    renameFolder = null; persist(); render();
  };
  el.sections.addEventListener('keydown', (event) => {
    const input = event.target.closest('[data-rename]');
    if (!input) return;
    if (event.key === 'Enter') finishRename(input, true);
    if (event.key === 'Escape') finishRename(input, false);
  });
  el.sections.addEventListener('focusout', (event) => { const input = event.target.closest('[data-rename]'); if (input) finishRename(input, true); });

  el.search.addEventListener('input', () => { query = el.search.value.trim(); renderCards(); });
  el.title.addEventListener('input', () => { const n = current(); if (n) { n.title = el.title.value; touch(n); } });
  el.title.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); el.body.focus(); } });
  el.folder.addEventListener('change', () => { const n = current(); if (n) { n.folder = el.folder.value || null; touch(n); } });
  el.body.addEventListener('input', onBodyInput);
  el.body.addEventListener('keydown', (event) => {
    if (event.key === ' ') tryShortcut(event);
    if (event.key === 'Enter') setTimeout(() => {
      // Uma tarefa nova nasce desmarcada (o navegador copia o atributo da linha anterior).
      const li = currentBlock()?.closest?.('ul.checklist > li');
      if (li && !li.textContent.trim() && li.hasAttribute('data-checked')) { li.removeAttribute('data-checked'); onBodyInput(); }
    }, 0);
    if (event.key === 'Tab') { event.preventDefault(); exec(event.shiftKey ? 'outdent' : 'indent'); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); COMMANDS.link(); }
  });
  // Clique na caixinha de uma tarefa marca/desmarca.
  el.body.addEventListener('mousedown', (event) => {
    const li = event.target.closest('ul.checklist > li');
    if (!li || el.body.contentEditable !== 'true') return;
    if (event.clientX - li.getBoundingClientRect().left > 22) return;
    event.preventDefault();
    li.toggleAttribute('data-checked');
    onBodyInput();
  });
  // Colar: só texto e formatação simples.
  el.body.addEventListener('paste', (event) => {
    const html = event.clipboardData.getData('text/html');
    event.preventDefault();
    if (html) document.execCommand('insertHTML', false, sanitize(html));
    else document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
  });
  document.addEventListener('selectionchange', () => { if (el.body.contains(getSelection().anchorNode)) updateToolbar(); });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'n') { event.preventDefault(); newNote(); }
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'f' && !el.body.contains(document.activeElement)) { event.preventDefault(); el.search.focus(); }
  });
  window.addEventListener('beforeunload', () => { if (saveTimer) NiumStore.set(KEY, data); });

  // ---------- Início ----------
  (async () => {
    let theme = 'auto'; try { theme = localStorage.getItem('nium-notes-theme') || 'auto'; } catch {}
    applyTheme(theme);
    document.execCommand('defaultParagraphSeparator', false, 'p');
    await load();
    const first = visibleNotes()[0];
    currentId = first ? first.id : null;
    render();
    handleClip();
    el.saved.textContent = NiumStore.inNium ? 'Salvo no Nium' : 'Salvo neste navegador';
  })();
})();
