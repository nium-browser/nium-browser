/* Nium: nova aba (a mesma do Nium Electron). MPL-2.0 */
"use strict";

(function () {
  const ICONS = {
    globe: '<circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.5" ry="8.5"/><path d="M4 12h16"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 7 9-7"/>',
    youtube: '<rect x="2" y="5" width="20" height="14" rx="5"/><path d="m10 9 5 3-5 3V9Z"/>',
    github: '<path d="M8 21v-3c-4 1-4-2-5-3M16 21v-4c0-1-1-2-1-2 4 0 6-2 6-6 0-2-1-3-2-4 0-1 0-3-1-3l-4 2h-4L6 2C5 2 5 4 5 5 4 6 3 7 3 9c0 4 2 6 6 6 0 0-1 1-1 3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
  };
  // Os mesmos atalhos de fábrica do Nium Electron, com as mesmas cores.
  const DEFAULTS = [
    { title: "YouTube", url: "https://www.youtube.com/", icon: "youtube" },
    { title: "Gmail", url: "https://mail.google.com/", icon: "mail" },
    { title: "GitHub", url: "https://github.com/", icon: "github" },
    { title: "Wikipedia", url: "https://www.wikipedia.org/", icon: "globe" },
  ];
  const KEY = "nium.shortcuts";
  const MAX = 10;
  const $ = s => document.querySelector(s);
  const svg = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.globe}</svg>`;

  // ---- dados: guardados no IndexedDB da nova aba (o localStorage não sobrevive aqui) ----
  let memory = null;
  const clean = list =>
    Array.isArray(list) ? list.filter(x => x && typeof x.url === "string").slice(0, MAX) : null;

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("nium-newtab", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("kv");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function readStored() {
    try {
      const db = await openDB();
      const value = await new Promise((resolve, reject) => {
        const req = db.transaction("kv").objectStore("kv").get(KEY);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      db.close();
      if (clean(value)) return clean(value);
    } catch (e) {
      console.warn("Nium: não consegui ler os atalhos", e);
    }
    return null;
  }
  async function writeStored(list) {
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction("kv", "readwrite");
        tx.objectStore("kv").put(list, KEY);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch (e) {
      console.warn("Nium: não consegui guardar os atalhos", e);
    }
  }
  function load() {
    return (memory || DEFAULTS).slice();
  }
  function save(list) {
    memory = list.slice();
    writeStored(memory);
  }
  async function refresh() {
    const stored = await readStored();
    if (stored) memory = stored;
    if (!editing) render();
  }

  function normalizeUrl(text) {
    text = text.trim();
    if (!text) return null;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(text)) text = "https://" + text;
    try {
      const u = new URL(text);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
    } catch (e) {
      return null;
    }
  }

  // ---- atalhos ----
  let editing = false;
  function render() {
    const box = $("#shortcuts");
    box.classList.toggle("editing", editing);
    box.textContent = "";
    load().forEach((item, index) => {
      const a = document.createElement("a");
      a.className = "shortcut";
      a.href = item.url;
      a.title = item.url;
      const icon = document.createElement("span");
      icon.className = "shortcut-icon";
      if (item.icon && ICONS[item.icon]) {
        icon.innerHTML = svg(item.icon);
        if (item.color) icon.style.color = item.color;
      } else {
        // Ícone do site guardado pelo navegador; se não houver, o globo.
        const img = document.createElement("img");
        img.alt = "";
        img.src = "page-icon:" + item.url;
        img.addEventListener("error", () => { icon.innerHTML = svg("globe"); }, { once: true });
        icon.appendChild(img);
      }
      const label = document.createElement("span");
      label.textContent = item.title || new URL(item.url).hostname;
      const remove = document.createElement("button");
      remove.className = "remove";
      remove.type = "button";
      remove.title = "Remove";
      remove.textContent = "×";
      remove.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        const list = load();
        list.splice(index, 1);
        save(list);
        render();
      });
      a.addEventListener("click", e => { if (editing) e.preventDefault(); });
      a.append(remove, icon, label);
      box.appendChild(a);
    });
    if (load().length < MAX) {
      const add = document.createElement("button");
      add.type = "button";
      add.className = "shortcut add";
      add.innerHTML = `<span class="shortcut-icon">${svg("plus")}</span><span>Add</span>`;
      add.addEventListener("click", openAdd);
      box.appendChild(add);
    }
  }

  const dialog = $("#add-dialog");
  const form = $("#add-form");
  function openAdd() {
    form.reset();
    dialog.showModal();
  }
  $("#add-cancel").addEventListener("click", () => dialog.close());
  form.addEventListener("submit", e => {
    const url = normalizeUrl(form.url.value);
    if (!url) {
      e.preventDefault();
      form.url.setCustomValidity("Type a web address, like example.com");
      form.url.reportValidity();
      return;
    }
    const list = load();
    list.push({ title: form.title.value.trim().slice(0, 40), url });
    save(list);
    render();
  });
  form.url.addEventListener("input", () => form.url.setCustomValidity(""));

  $("#customize").addEventListener("click", () => {
    editing = !editing;
    $("#customize").setAttribute("aria-pressed", String(editing));
    $("#customize-label").textContent = editing ? "Done" : "Customize";
    render();
  });

  // ---- data ----
  $("#date-label").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });

  // ---- pesquisa: usa o buscador padrão do Nium (o mesmo da barra de endereço) ----
  let engineName = null;
  window.addEventListener("ContentSearchService", e => {
    const { type, data } = e.detail || {};
    if (type === "State" && data && data.currentEngine) engineName = data.currentEngine.name;
    if (type === "CurrentEngine" && data) engineName = data.name;
  });
  const ask = (type, data) =>
    window.dispatchEvent(new CustomEvent("ContentSearchClient", { detail: { type, data } }));
  ask("GetState");

  function looksLikeAddress(text) {
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(text) || /^[^\s/]+\.[a-z]{2,}(\/\S*)?$/i.test(text) || /^localhost(:\d+)?(\/\S*)?$/i.test(text);
  }

  $("#home-search-form").addEventListener("submit", e => {
    e.preventDefault();
    const text = $("#home-search").value.trim();
    if (!text) return;
    if (looksLikeAddress(text)) {
      const url = normalizeUrl(text);
      if (url) { location.href = url; return; }
    }
    if (engineName) {
      ask("Search", {
        engineName,
        searchString: text,
        healthReportKey: "newtab",
        searchPurpose: "newtab",
        originalEvent: { shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, button: 0 },
      });
    } else {
      // Fora do Nium (prévia), não há buscador: abre uma pesquisa comum.
      location.href = "https://duckduckgo.com/?q=" + encodeURIComponent(text);
    }
  });

  render();
  refresh();
  // Outra aba pode ter mudado os atalhos: relê ao voltar para esta.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refresh();
  });
  // Foco na pesquisa ao abrir, como no Electron (a barra de endereço continua com Ctrl+L).
  $("#home-search").focus();
})();
