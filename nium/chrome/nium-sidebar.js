/* Nium: barra lateral e painel do Nium Electron. MPL-2.0
 *
 * Roda em cada janela do navegador:
 *  - blocos do Nium na barra lateral (logo, espaço, buscar abas, "Suas abas", Nium Shield,
 *    Seu espaço), em slots próprios da lateral (ver sidebar-main.mjs);
 *  - a lateral sobe até o topo da janela, com a barra de endereço à direita dela;
 *  - painel à direita (como no Electron), começando por "Meus espaços".
 */
"use strict";

var NiumSidebar = {
  HTML: "http://www.w3.org/1999/xhtml",
  SPACES_FILE: "nium-spaces.json",
  MAX_SPACES: 100,
  MAX_TABS: 50,
  currentSpace: null,

  // ---- textos (português se o Nium estiver em português; senão inglês) ----
  STRINGS: {
    en: {
      personalSpace: "Personal space",
      searchTabs: "Search tabs",
      yourTabs: "Your tabs",
      shield: "Nium Shield",
      shieldTitle: "Tracker and pop-up protection",
      yourSpace: "Your space",
      settings: "Settings",
      mySpaces: "My spaces",
      close: "Close",
      spacesIntro: "A set of tabs for each project. Saved only on this device.",
      saveCurrent: "Save current tabs",
      savedCount: n => `${n} saved spaces`,
      spaceName: "Space name",
      save: "Save",
      cancel: "Cancel",
      emptyTitle: "Your ideas deserve a space.",
      emptyText: "Open a project's pages and save the set here.",
      tabsCount: n => (n === 1 ? "1 tab" : `${n} tabs`),
      restore: "Restore tabs",
      rename: "Rename",
      update: "Update with open tabs",
      remove: "Delete space",
      confirmDelete: name => `Delete "${name}"? Your open tabs stay open.`,
      noTabs: "Open some websites first, then save them as a space.",
      tooMany: n => `${n}-tab limit per space. Close some tabs before saving.`,
      privateWindow: "Spaces aren't saved from private windows.",
      defaultName: n => `Space ${n}`,
    },
    pt: {
      personalSpace: "Espaço pessoal",
      searchTabs: "Buscar nas abas",
      yourTabs: "Suas abas",
      shield: "Nium Shield",
      shieldTitle: "Proteção contra rastreadores e pop-ups",
      yourSpace: "Seu espaço",
      settings: "Configurações",
      mySpaces: "Meus espaços",
      close: "Fechar",
      spacesIntro: "Um conjunto de abas para cada projeto. Salvo só neste dispositivo.",
      saveCurrent: "Salvar abas atuais",
      savedCount: n => `${n} espaços salvos`,
      spaceName: "Nome do espaço",
      save: "Salvar",
      cancel: "Cancelar",
      emptyTitle: "Suas ideias merecem um espaço.",
      emptyText: "Abra as páginas de um projeto e salve o conjunto aqui.",
      tabsCount: n => (n === 1 ? "1 aba" : `${n} abas`),
      restore: "Restaurar abas",
      rename: "Renomear",
      update: "Atualizar com as abas abertas",
      remove: "Excluir espaço",
      confirmDelete: name => `Excluir "${name}"? Suas abas abertas continuam abertas.`,
      noTabs: "Abra alguns sites primeiro e depois salve como espaço.",
      tooMany: n => `Limite de ${n} abas por espaço. Feche algumas abas antes de salvar.`,
      privateWindow: "Espaços não são salvos de janelas anônimas.",
      defaultName: n => `Espaço ${n}`,
    },
  },

  get t() {
    let lang = "en";
    try {
      lang = Services.locale.appLocaleAsBCP47.startsWith("pt") ? "pt" : "en";
    } catch (e) {}
    return this.STRINGS[lang];
  },

  init() {
    if (!window.toolbar.visible) {
      return; // janelas de pop-up não têm barra lateral
    }
    const main = document.querySelector("sidebar-main");
    if (!main || document.getElementById("nium-sidebar-top")) {
      return;
    }
    const top = this.buildTop();
    top.setAttribute("slot", "nium-top");
    const bottom = this.buildBottom();
    bottom.setAttribute("slot", "nium-bottom");
    main.append(top, bottom);
    this.buildPanel();
    this.watchLayout();
    this.watchLoading();
    this.takeOverSearchKey();
  },

  // ---- buscar abas na própria lateral (como no Electron) ----
  // Ctrl+K (ou a tecla escolhida em about:keyboard) filtra a lista de abas da lateral quando
  // ela está aberta; com a lateral recolhida ou escondida, usa a busca de abas do Firefox.
  takeOverSearchKey() {
    const key = document.getElementById("key_searchTabs");
    const set = document.getElementById("mainCommandSet");
    if (!key || !set || document.getElementById("nium-cmd-searchtabs")) return;
    const cmd = document.createXULElement("command");
    cmd.id = "nium-cmd-searchtabs";
    cmd.addEventListener("command", () => this.startSearch());
    set.appendChild(cmd);
    key.setAttribute("command", cmd.id);
  },

  sidebarOpen() {
    const main = document.querySelector("sidebar-main");
    const container = document.getElementById("sidebar-container");
    return !!(main?.expanded && container && !container.hidden && Services.prefs.getBoolPref("sidebar.verticalTabs", false));
  },

  startSearch() {
    if (!this.sidebarOpen() || !this.searchBox) {
      document.getElementById("Browser:SearchTabs")?.doCommand();
      return;
    }
    this.searchBox.toggleAttribute("searching", true);
    this.searchInput.focus();
    this.searchInput.select();
  },

  filterTabs(text) {
    const q = text.trim().toLowerCase();
    let first = null;
    for (const tab of gBrowser.tabs) {
      const url = tab.linkedBrowser?.currentURI?.spec || "";
      const match = !q || `${tab.label} ${url}`.toLowerCase().includes(q);
      tab.toggleAttribute("nium-filtered", !match);
      if (match && q && !first && !tab.hidden) first = tab;
    }
    return first;
  },

  endSearch() {
    this.searchInput.value = "";
    this.filterTabs("");
    this.searchBox.removeAttribute("searching");
  },

  buildSearch() {
    const t = this.t;
    const kbd = this.el("kbd", { text: this.shortcutText("key_searchTabs") });
    const button = this.el(
      "button",
      { class: "nium-sb-search", title: t.searchTabs, onclick: () => this.startSearch() },
      [this.icon("chrome://global/skin/icons/search-glass.svg"), this.el("span", { class: "nium-sb-text", text: t.searchTabs }), kbd]
    );
    // O atalho pode mudar em about:keyboard: atualiza ao passar o mouse.
    button.addEventListener("mouseenter", () => (kbd.textContent = this.shortcutText("key_searchTabs")));
    const input = this.el("input", { class: "nium-sb-search-input", type: "search", placeholder: t.searchTabs, "aria-label": t.searchTabs });
    input.addEventListener("input", () => this.filterTabs(input.value));
    input.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        e.preventDefault();
        this.endSearch();
        gBrowser.selectedBrowser.focus();
      } else if (e.key === "Enter") {
        e.preventDefault();
        const first = this.filterTabs(input.value);
        this.endSearch();
        if (first) gBrowser.selectedTab = first;
        gBrowser.selectedBrowser.focus();
      }
    });
    input.addEventListener("blur", () => {
      if (!input.value) this.endSearch();
    });
    // Aba nova ou fechada durante a busca: refiltra.
    for (const type of ["TabOpen", "TabAttrModified"]) {
      gBrowser.tabContainer.addEventListener(type, () => {
        if (input.value) this.filterTabs(input.value);
      });
    }
    this.searchInput = input;
    this.searchBox = this.el("div", { class: "nium-sb-search-box" }, [
      button,
      this.el("div", { class: "nium-sb-search-field" }, [this.icon("chrome://global/skin/icons/search-glass.svg"), input]),
    ]);
    return this.searchBox;
  },

  // Marca a caixa de endereço enquanto a aba atual carrega (a linha que gira é CSS).
  watchLoading() {
    const urlbar = document.getElementById("urlbar");
    if (!urlbar) return;
    const update = () => urlbar.toggleAttribute("nium-loading", !!gBrowser.selectedTab?.hasAttribute("busy"));
    gBrowser.tabContainer.addEventListener("TabSelect", update);
    new MutationObserver(update).observe(gBrowser.tabContainer, {
      subtree: true,
      attributes: true,
      attributeFilter: ["busy"],
    });
    update();
  },

  // ---- ajudantes de DOM ----
  el(tag, props = {}, children = []) {
    const node = document.createElementNS(this.HTML, tag);
    for (const [key, value] of Object.entries(props)) {
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value);
    }
    for (const child of children) node.append(child);
    return node;
  },

  icon(src) {
    return this.el("img", { class: "nium-sb-icon", src, alt: "" });
  },

  shortcutText(keyId) {
    try {
      const key = document.getElementById(keyId);
      return key ? ShortcutUtils.prettifyShortcut(key) : "";
    } catch (e) {
      return "";
    }
  },

  // ---- a lateral vai até o topo da janela ----
  // Mede a lateral e a barra de cima e passa para o CSS (nium-chrome.css), que encosta a
  // barra de endereço à direita da lateral e sobe a lateral até o topo, como no Electron.
  watchLayout() {
    const root = document.documentElement;
    const container = document.getElementById("sidebar-container");
    const toolbox = document.getElementById("navigator-toolbox");
    if (!container || !toolbox) return;
    const update = () => {
      const on =
        !container.hidden &&
        container.getBoundingClientRect().width > 0 &&
        !container.hasAttribute("sidebar-positionend") &&
        Services.prefs.getBoolPref("sidebar.verticalTabs", false);
      root.toggleAttribute("nium-sidebar-top", on);
      if (on) {
        root.style.setProperty("--nium-sidebar-width", `${Math.round(container.getBoundingClientRect().width)}px`);
      }
      // A altura da barra de cima já com a lateral ao lado (sem a margem que ela ganha).
      root.style.setProperty("--nium-toolbox-height", `${Math.round(toolbox.getBoundingClientRect().height)}px`);
    };
    const observer = new ResizeObserver(() => update());
    observer.observe(container);
    observer.observe(toolbox);
    new MutationObserver(update).observe(container, {
      attributes: true,
      attributeFilter: ["hidden", "sidebar-positionend"],
    });
    update();
  },

  // ---- topo: logo, espaço atual, buscar abas, "Suas abas" ----
  buildTop() {
    const t = this.t;
    const mark = this.el("span", { class: "nium-mark" });
    mark.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4.5 11.5v-7l7 7v-7"/></svg>';
    const brand = this.el("div", { class: "nium-brand" }, [
      mark,
      this.el("span", { class: "nium-wordmark", text: "nium." }),
    ]);
    this.spaceName = this.el("span", { class: "nium-sb-text", text: t.personalSpace });
    const picker = this.el(
      "button",
      { class: "nium-space-picker", title: t.mySpaces, onclick: () => this.togglePanel("spaces") },
      [this.el("span", { class: "nium-space-icon" }, [this.icon("chrome://global/skin/icons/folder.svg")]), this.spaceName]
    );
    this.spacesButton = picker;
    const search = this.buildSearch();
    const label = this.el("div", { class: "nium-section-label", text: t.yourTabs });
    return this.el("div", { id: "nium-sidebar-top", class: "nium-sb-block" }, [brand, picker, search, label]);
  },

  // ---- rodapé: Nium Shield e Seu espaço ----
  buildBottom() {
    const t = this.t;
    const shield = this.el(
      "button",
      { class: "nium-sb-row", title: t.shieldTitle, onclick: () => this.openShield() },
      [
        this.icon("chrome://browser/skin/tracking-protection.svg"),
        this.el("span", { class: "nium-sb-text", text: t.shield }),
        this.el("span", { class: "nium-shield-dot" }),
      ]
    );
    const you = this.el(
      "button",
      { class: "nium-sb-row", title: t.settings, onclick: () => openPreferences() },
      [
        this.el("span", { class: "nium-avatar", text: "N" }),
        this.el("span", { class: "nium-sb-text", text: t.yourSpace }),
        this.icon("chrome://global/skin/icons/settings.svg"),
      ]
    );
    return this.el("div", { id: "nium-sidebar-bottom", class: "nium-sb-block" }, [shield, you]);
  },

  openShield() {
    try {
      gProtectionsHandler.showProtectionsPopup({});
    } catch (e) {
      openTrustedLinkIn("about:protections", "tab");
    }
  },

  // ---- painel à direita (como no Nium Electron) ----
  buildPanel() {
    const browser = document.getElementById("browser");
    if (!browser || document.getElementById("nium-panel")) return;
    this.panelTitle = this.el("span", { class: "nium-panel-title" });
    this.panelIcon = this.icon("chrome://global/skin/icons/folder.svg");
    this.panelBody = this.el("div", { class: "nium-panel-body" });
    const close = this.el("button", { class: "nium-icon-button", title: this.t.close, onclick: () => this.closePanel() }, [
      this.icon("chrome://global/skin/icons/close.svg"),
    ]);
    this.panel = this.el("div", { id: "nium-panel", hidden: "true" }, [
      this.el("div", { class: "nium-panel-header" }, [this.panelIcon, this.panelTitle, close]),
      this.panelBody,
    ]);
    browser.appendChild(this.panel);
    this.panel.addEventListener("keydown", e => {
      if (e.key === "Escape") this.closePanel();
    });
  },

  togglePanel(name) {
    if (!this.panel) return;
    if (!this.panel.hidden && this.openPanelName === name) {
      this.closePanel();
      return;
    }
    this.openPanelName = name;
    this.panel.hidden = false;
    this.spacesButton?.toggleAttribute("open", name === "spaces");
    if (name === "spaces") {
      this.panelTitle.textContent = this.t.mySpaces;
      this.renderSpaces();
    }
  },

  closePanel() {
    if (!this.panel) return;
    this.panel.hidden = true;
    this.openPanelName = null;
    this.spacesButton?.removeAttribute("open");
  },

  // ---- espaços: conjuntos de abas guardados ----
  get spacesPath() {
    return PathUtils.join(PathUtils.profileDir, this.SPACES_FILE);
  },

  async readSpaces() {
    try {
      const data = await IOUtils.readJSON(this.spacesPath);
      return Array.isArray(data) ? data.filter(s => s && typeof s.name === "string" && Array.isArray(s.tabs)) : [];
    } catch (e) {
      return [];
    }
  },

  async writeSpaces(spaces) {
    await IOUtils.writeJSON(this.spacesPath, spaces.slice(0, this.MAX_SPACES), {
      tmpPath: this.spacesPath + ".tmp",
    });
    // Outras janelas abertas atualizam o painel delas.
    for (const win of Services.wm.getEnumerator("navigator:browser")) {
      if (win !== window && win.NiumSidebar?.openPanelName === "spaces") {
        win.NiumSidebar.renderSpaces();
      }
    }
  },

  captureTabs() {
    const out = [];
    for (const tab of gBrowser.visibleTabs) {
      const uri = tab.linkedBrowser.currentURI;
      if (!uri || !["http", "https"].includes(uri.scheme)) {
        continue; // páginas internas e abas vazias não entram
      }
      out.push({ url: uri.spec, title: String(tab.label || uri.spec).slice(0, 200) });
    }
    return out;
  },

  async renderSpaces(message = "") {
    const t = this.t;
    const spaces = await this.readSpaces();
    const body = this.panelBody;
    body.textContent = "";
    body.append(this.el("p", { class: "nium-panel-description", text: t.spacesIntro }));

    const isPrivate = PrivateBrowsingUtils.isWindowPrivate(window);
    const saveButton = this.el("button", { class: "nium-primary-button", onclick: () => showForm() }, [
      this.icon("chrome://global/skin/icons/plus.svg"),
      this.el("span", { text: t.saveCurrent }),
    ]);
    if (isPrivate) saveButton.disabled = true;

    // Formulário de nome (no lugar do botão, como no Electron).
    const input = this.el("input", { class: "nium-input", maxlength: "60", "aria-label": t.spaceName });
    const form = this.el("form", { class: "nium-space-form", hidden: "true" }, [
      this.el("label", { class: "nium-field-label", text: t.spaceName }),
      input,
      this.el("div", { class: "nium-button-row" }, [
        this.el("button", { type: "button", class: "nium-secondary-button", text: t.cancel, onclick: () => hideForm() }),
        this.el("button", { type: "submit", class: "nium-primary-button", text: t.save }),
      ]),
    ]);
    const showForm = () => {
      saveButton.hidden = true;
      form.hidden = false;
      input.value = t.defaultName(spaces.length + 1);
      input.focus();
      input.select();
    };
    const hideForm = () => {
      form.hidden = true;
      saveButton.hidden = false;
    };
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const name = input.value.trim().slice(0, 60);
      if (!name) return;
      const tabs = this.captureTabs();
      if (!tabs.length) return this.renderSpaces(t.noTabs);
      if (tabs.length > this.MAX_TABS) return this.renderSpaces(t.tooMany(this.MAX_TABS));
      spaces.push({ id: Services.uuid.generateUUID().toString(), name, createdAt: new Date().toISOString(), tabs });
      await this.writeSpaces(spaces);
      this.setCurrent(name);
      this.renderSpaces();
    });
    body.append(saveButton, form);
    if (message || isPrivate) {
      body.append(this.el("p", { class: "nium-panel-message", role: "alert", text: message || t.privateWindow }));
    }

    body.append(this.el("div", { class: "nium-subheading", text: t.savedCount(spaces.length) }));

    if (!spaces.length) {
      body.append(
        this.el("div", { class: "nium-empty-state" }, [
          this.el("span", { class: "nium-empty-icon" }, [this.icon("chrome://global/skin/icons/folder.svg")]),
          this.el("h3", { text: t.emptyTitle }),
          this.el("p", { text: t.emptyText }),
        ])
      );
      return;
    }

    const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "short" });
    spaces.forEach((space, index) => {
      const date = space.createdAt ? dateFormat.format(new Date(space.createdAt)) : "";
      const actions = this.el("span", { class: "nium-card-actions" }, [
        this.el("button", { class: "nium-icon-button", title: t.rename, onclick: () => this.renameSpace(index) }, [
          this.icon("chrome://global/skin/icons/edit.svg"),
        ]),
        this.el("button", { class: "nium-icon-button", title: t.update, onclick: () => this.updateSpace(index) }, [
          this.icon("chrome://global/skin/icons/reload.svg"),
        ]),
        this.el("button", { class: "nium-icon-button", title: t.remove, onclick: () => this.deleteSpace(index) }, [
          this.icon("chrome://global/skin/icons/delete.svg"),
        ]),
      ]);
      if (isPrivate) actions.children[1].disabled = true;
      const card = this.el("article", { class: "nium-card" }, [
        this.el("div", { class: "nium-card-top" }, [
          this.el("strong", { text: (space.name === this.currentSpace ? "✓ " : "") + space.name }),
          actions,
        ]),
        this.el("p", { text: [t.tabsCount(space.tabs.length), date].filter(Boolean).join(" · ") }),
        this.el("p", { class: "nium-card-tabs", text: space.tabs.slice(0, 3).map(x => x.title).join(" · ") }),
        this.el("button", { class: "nium-secondary-button nium-full-width", onclick: () => this.openSpace(space) }, [
          this.icon("chrome://global/skin/icons/folder.svg"),
          this.el("span", { text: t.restore }),
        ]),
      ]);
      body.append(card);
    });
  },

  async updateSpace(index) {
    const spaces = await this.readSpaces();
    const tabs = this.captureTabs();
    if (!spaces[index]) return;
    if (!tabs.length) return this.renderSpaces(this.t.noTabs);
    spaces[index].tabs = tabs.slice(0, this.MAX_TABS);
    await this.writeSpaces(spaces);
    this.setCurrent(spaces[index].name);
    this.renderSpaces();
  },

  async renameSpace(index) {
    const spaces = await this.readSpaces();
    if (!spaces[index]) return;
    const result = { value: spaces[index].name };
    if (!Services.prompt.prompt(window, this.t.rename, this.t.spaceName, result, null, {})) return;
    const name = String(result.value || "").trim().slice(0, 60);
    if (!name) return;
    if (this.currentSpace === spaces[index].name) this.setCurrent(name);
    spaces[index].name = name;
    await this.writeSpaces(spaces);
    this.renderSpaces();
  },

  async deleteSpace(index) {
    const spaces = await this.readSpaces();
    if (!spaces[index]) return;
    if (!Services.prompt.confirm(window, this.t.remove, this.t.confirmDelete(spaces[index].name))) return;
    if (this.currentSpace === spaces[index].name) this.setCurrent(null);
    spaces.splice(index, 1);
    await this.writeSpaces(spaces);
    this.renderSpaces();
  },

  openSpace(space) {
    // Abre as abas do espaço em abas novas, como no Nium Electron.
    let first = null;
    for (const { url } of space.tabs) {
      try {
        const uri = Services.io.newURI(url);
        if (!["http", "https"].includes(uri.scheme)) continue;
        const tab = gBrowser.addTrustedTab(uri.spec, { inBackground: true });
        first ||= tab;
      } catch (e) {}
    }
    if (first) gBrowser.selectedTab = first;
    this.setCurrent(space.name);
    this.renderSpaces();
  },

  setCurrent(name) {
    this.currentSpace = name;
    if (this.spaceName) this.spaceName.textContent = name || this.t.personalSpace;
  },
};

window.addEventListener(
  "load",
  () => {
    const start = () => {
      try {
        NiumSidebar.init();
      } catch (e) {
        console.error("Nium: barra lateral", e);
      }
    };
    setTimeout(start, 0);
    // Garantia: tenta de novo depois da inicialização atrasada da janela (init não repete).
    Services.obs.addObserver(function obs(subject) {
      if (subject === window) {
        Services.obs.removeObserver(obs, "browser-delayed-startup-finished");
        start();
      }
    }, "browser-delayed-startup-finished");
  },
  { once: true }
);
