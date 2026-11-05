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
      notes: "Notes",
      expand: "Expand",
      splitView: "Split view",
      youTitle: "Your space",
      youIntro: "Quick Nium options. Everything else is in Settings.",
      citeLabel: "Cite the source when copying",
      citeHelp: "Copying text from a site adds its title, address and date below.",
      citeStyle: "Citation style",
      citeSimple: "Simple",
      citeAbnt: "ABNT",
      citeMarkdown: "Markdown",
      restoreLabel: "Reopen my tabs when Nium starts",
      bookmarksLabel: "Show the bookmarks bar",
      openSettings: "All settings",
      openShortcuts: "Keyboard shortcuts",
      openAddons: "Extensions and themes",
      gesturesLabel: "Mouse gestures",
      gesturesHelp: "Hold the right button, drag and release: ← back, → forward, ↑ new tab, ↓ reload, ↓→ close tab, ↑→ next tab, ↑← previous tab.",
      readingList: "Reading list",
      readingIntro: "Pages saved to read later. Saved only on this device.",
      readingSave: "Save this page",
      readingSaved: "This page is already in the list.",
      readingNoPage: "Open a website to save it here.",
      readingFull: "Limit of 500 pages in the reading list.",
      readingSearch: "Search the list",
      readingAll: "All",
      readingUnread: "To read",
      readingRead: "Read",
      readingEmptyTitle: "Nothing to read later yet.",
      readingEmptyText: "Open an article you want to finish later and save it here.",
      readingNone: "Nothing here with this filter.",
      markRead: "Mark as read",
      markUnread: "Mark as unread",
      removeItem: "Remove from list",
      shrink: "Back to the side",
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
      notes: "Anotações",
      expand: "Expandir",
      splitView: "Tela dividida",
      youTitle: "Seu espaço",
      youIntro: "Opções rápidas do Nium. O resto fica nas Configurações.",
      citeLabel: "Citar a fonte ao copiar",
      citeHelp: "Ao copiar um texto de um site, o título, o endereço e a data vão junto embaixo.",
      citeStyle: "Estilo da citação",
      citeSimple: "Simples",
      citeAbnt: "ABNT",
      citeMarkdown: "Markdown",
      restoreLabel: "Reabrir minhas abas quando o Nium abrir",
      bookmarksLabel: "Mostrar a barra de favoritos",
      openSettings: "Todas as configurações",
      openShortcuts: "Atalhos de teclado",
      openAddons: "Extensões e temas",
      gesturesLabel: "Gestos do mouse",
      gesturesHelp: "Segure o botão direito, arraste e solte: ← voltar, → avançar, ↑ nova aba, ↓ recarregar, ↓→ fechar aba, ↑→ próxima aba, ↑← aba anterior.",
      readingList: "Lista de leitura",
      readingIntro: "Páginas guardadas para ler depois. Salvo só neste dispositivo.",
      readingSave: "Salvar esta página",
      readingSaved: "Esta página já está na lista.",
      readingNoPage: "Abra um site para salvar aqui.",
      readingFull: "Limite de 500 páginas na lista de leitura.",
      readingSearch: "Buscar na lista",
      readingAll: "Todas",
      readingUnread: "Para ler",
      readingRead: "Lidas",
      readingEmptyTitle: "Nada para ler depois ainda.",
      readingEmptyText: "Abra um artigo que você quer terminar depois e salve aqui.",
      readingNone: "Nada aqui com este filtro.",
      markRead: "Marcar como lida",
      markUnread: "Marcar como não lida",
      removeItem: "Tirar da lista",
      shrink: "Voltar para o lado",
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
    this.registerActors();
    this.createSplitButton();
    this.updateShieldDot();
    // O uBlock pode terminar de ligar depois da janela abrir.
    setTimeout(() => this.updateShieldDot(), 3000);
    try {
      const { AddonManager } = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs");
      const refresh = () => setTimeout(() => this.updateShieldDot(), 500);
      AddonManager.addAddonListener({ onEnabled: refresh, onDisabled: refresh, onInstalled: refresh, onUninstalled: refresh });
    } catch (e) {}
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
    const SVG = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", "M4.5 11.5v-7l7 7v-7");
    svg.append(path);
    mark.append(svg);
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
        (this.shieldDot = this.el("span", { class: "nium-shield-dot" })),
      ]
    );
    const you = (this.youButton = this.el(
      "button",
      { class: "nium-sb-row", title: t.youTitle, onclick: () => this.togglePanel("you") },
      [
        this.el("span", { class: "nium-avatar", text: "N" }),
        this.el("span", { class: "nium-sb-text", text: t.yourSpace }),
        this.icon("chrome://global/skin/icons/settings.svg"),
      ]
    ));
    const notes = this.el(
      "button",
      { class: "nium-sb-row", title: t.notes, onclick: () => this.togglePanel("notes") },
      [this.icon("chrome://global/skin/icons/edit-outline.svg"), this.el("span", { class: "nium-sb-text", text: t.notes })]
    );
    this.notesButton = notes;
    const reading = (this.readingButton = this.el(
      "button",
      { class: "nium-sb-row", title: t.readingList, onclick: () => this.togglePanel("reading") },
      [this.icon("chrome://browser/skin/reader-mode.svg"), this.el("span", { class: "nium-sb-text", text: t.readingList })]
    ));
    return this.el("div", { id: "nium-sidebar-bottom", class: "nium-sb-block" }, [reading, notes, shield, you]);
  },

  // Nium Shield = uBlock Origin. O botão abre o painel do uBlock; sem ele, o painel de
  // proteção contra rastreadores do Firefox.
  UBO_ID: "uBlock0@raymondhill.net",

  ublockAction() {
    try {
      const extension = WebExtensionPolicy.getByID(this.UBO_ID)?.extension;
      if (!extension) return null;
      const { ExtensionParent } = ChromeUtils.importESModule("resource://gre/modules/ExtensionParent.sys.mjs");
      return ExtensionParent.apiManager.global.browserActionFor?.(extension) || null;
    } catch (e) {
      return null;
    }
  },

  openShield() {
    const action = this.ublockAction();
    if (action) {
      action.triggerAction(window);
      return;
    }
    try {
      gProtectionsHandler.showProtectionsPopup({});
    } catch (e) {
      openTrustedLinkIn("about:protections", "tab");
    }
  },

  // Bolinha do Shield: verde com o uBlock ligado, amarela sem ele.
  updateShieldDot() {
    this.shieldDot?.toggleAttribute("on", !!WebExtensionPolicy.getByID(this.UBO_ID));
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
    this.openFullButton = this.el(
      "button",
      { class: "nium-icon-button", title: this.t.expand, hidden: "true", onclick: () => this.setNotesWide(!this.notesWide) },
      [this.icon("chrome://browser/skin/fullscreen.svg")]
    );
    this.panel = this.el("div", { id: "nium-panel", hidden: "true" }, [
      this.el("div", { class: "nium-panel-header" }, [this.panelIcon, this.panelTitle, this.openFullButton, close]),
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
    this.panel.setAttribute("kind", name);
    this.spacesButton?.toggleAttribute("open", name === "spaces");
    this.notesButton?.toggleAttribute("open", name === "notes");
    this.youButton?.toggleAttribute("open", name === "you");
    this.readingButton?.toggleAttribute("open", name === "reading");
    this.openFullButton.hidden = name !== "notes";
    if (this.notesFrame && name !== "notes") this.notesFrame.hidden = true;
    if (name !== "notes") this.panel.removeAttribute("wide");
    this.panelBody.hidden = name === "notes";
    if (name === "spaces") {
      this.panelIcon.src = "chrome://global/skin/icons/folder.svg";
      this.panelTitle.textContent = this.t.mySpaces;
      this.renderSpaces();
    } else if (name === "reading") {
      this.panelIcon.src = "chrome://browser/skin/reader-mode.svg";
      this.panelTitle.textContent = this.t.readingList;
      this.renderReading();
    } else if (name === "you") {
      this.panelIcon.src = "chrome://global/skin/icons/settings.svg";
      this.panelTitle.textContent = this.t.youTitle;
      this.renderYou();
    } else if (name === "notes") {
      this.panelIcon.src = "chrome://global/skin/icons/edit-outline.svg";
      this.panelTitle.textContent = this.t.notes;
      this.showNotes();
      this.applyNotesWide();
    }
  },

  closePanel() {
    if (!this.panel) return;
    this.panel.hidden = true;
    this.panelWasClosed = true;
    this.panel.removeAttribute("wide");
    this.openPanelName = null;
    this.spacesButton?.removeAttribute("open");
    this.notesButton?.removeAttribute("open");
    this.youButton?.removeAttribute("open");
    this.readingButton?.removeAttribute("open");
  },

  // ---- anotações: o Nium Notes (Nium Core) no painel ----
  NOTES_URL: "chrome://browser/content/nium/core/notes/index.html",

  showNotes() {
    if (!this.notesFrame) {
      const frame = this.el("iframe", { class: "nium-notes-frame", src: this.NOTES_URL + "?panel" });
      frame.addEventListener("load", () => {
        this.guardNotesLinks(frame);
        this.applyNotesWide();
      });
      this.panel.appendChild(frame);
      this.notesFrame = frame;
    } else if (this.notesFrame.hidden || this.panelWasClosed) {
      // Relê as notas do disco ao reabrir (outra janela pode ter mudado alguma).
      this.notesFrame.contentWindow?.location.reload();
    }
    this.panelWasClosed = false;
    this.notesFrame.hidden = false;
  },

  // Expandir: o painel de anotações cobre a página, com o layout completo do Nium Notes.
  setNotesWide(wide) {
    this.notesWide = wide;
    this.applyNotesWide();
  },

  applyNotesWide() {
    const wide = !!this.notesWide && this.openPanelName === "notes";
    this.panel?.toggleAttribute("wide", wide);
    const img = this.openFullButton?.querySelector("img");
    if (img) img.src = wide ? "chrome://browser/skin/fullscreen-exit.svg" : "chrome://browser/skin/fullscreen.svg";
    if (this.openFullButton) this.openFullButton.title = wide ? this.t.shrink : this.t.expand;
    const root = this.notesFrame?.contentDocument?.documentElement;
    if (root) root.toggleAttribute("data-panel", !wide);
  },

  // Links dentro das notas abrem numa aba nova, nunca dentro do painel.
  guardNotesLinks(frame) {
    const doc = frame.contentDocument;
    doc?.addEventListener(
      "click",
      e => {
        const a = e.target.closest?.("a[href]");
        if (!a || a.hasAttribute("download") || a.href.startsWith("blob:")) return;
        e.preventDefault();
        if (/^https?:/i.test(a.href)) openTrustedLinkIn(a.href, "tab");
      },
      true
    );
  },

  // ---- "citar ao copiar": o ator roda no processo das páginas (NiumCiteChild.sys.mjs) ----
  registerActors() {
    try {
      ChromeUtils.registerWindowActor("NiumCite", {
        child: {
          esModuleURI: "chrome://browser/content/nium/NiumCiteChild.sys.mjs",
          events: { copy: { capture: true } },
        },
        matches: ["http://*/*", "https://*/*"],
        allFrames: true,
      });
    } catch (e) {
      // "NotSupportedError" = já registrado por outra janela; qualquer outro erro aparece no console.
      if (e.name !== "NotSupportedError") console.error("Nium: registro de ator", e);
    }
    try {
      ChromeUtils.registerWindowActor("NiumGestures", {
        parent: { esModuleURI: "chrome://browser/content/nium/NiumGesturesParent.sys.mjs" },
        child: {
          esModuleURI: "chrome://browser/content/nium/NiumGesturesChild.sys.mjs",
          events: {
            mousedown: { capture: true, mozSystemGroup: true },
            mousemove: { capture: true, mozSystemGroup: true },
            mouseup: { capture: true, mozSystemGroup: true },
            contextmenu: { capture: true },
            keydown: { capture: true, mozSystemGroup: true },
          },
        },
        matches: ["http://*/*", "https://*/*", "file:///*"],
        allFrames: true,
      });
    } catch (e) {
      // "NotSupportedError" = já registrado por outra janela; qualquer outro erro aparece no console.
      if (e.name !== "NotSupportedError") console.error("Nium: registro de ator", e);
    }
  },

  // ---- botão de tela dividida na barra de cima (como no Electron) ----
  createSplitButton() {
    if (CustomizableUI.getWidget("nium-split-button")?.provider === CustomizableUI.PROVIDER_API) return;
    const t = this.t;
    try {
      CustomizableUI.createWidget({
        id: "nium-split-button",
        type: "button",
        label: t.splitView,
        tooltiptext: t.splitView,
        defaultArea: CustomizableUI.AREA_NAVBAR,
        onCommand(event) {
          const win = event.target.ownerGlobal;
          const tab = win.gBrowser.selectedTab;
          if (tab.closest?.("tab-split-view-wrapper")) {
            win.BrowserCommands.separateTabSplitView();
          } else {
            win.BrowserCommands.addTabSplitView();
          }
        },
      });
    } catch (e) {
      console.error("Nium: botão de tela dividida", e);
    }
  },

  // ---- painel "Seu espaço": opções rápidas do Nium ----
  renderYou() {
    const t = this.t;
    const body = this.panelBody;
    body.textContent = "";
    body.append(this.el("p", { class: "nium-panel-description", text: t.youIntro }));

    const toggle = (label, help, checked, onchange) => {
      const input = this.el("input", { type: "checkbox", class: "nium-switch" });
      input.checked = checked;
      input.addEventListener("change", () => onchange(input.checked));
      const row = this.el("label", { class: "nium-option" }, [
        this.el("span", { class: "nium-option-text" }, [
          this.el("span", { class: "nium-option-label", text: label }),
          ...(help ? [this.el("span", { class: "nium-option-help", text: help })] : []),
        ]),
        input,
      ]);
      body.append(row);
      return input;
    };

    const prefs = Services.prefs;
    toggle(t.citeLabel, t.citeHelp, prefs.getBoolPref("nium.copy.cite", false), v => {
      prefs.setBoolPref("nium.copy.cite", v);
      styleRow.hidden = !v;
    });
    const select = this.el("select", { class: "nium-select", "aria-label": t.citeStyle });
    for (const [value, label] of [["simple", t.citeSimple], ["abnt", t.citeAbnt], ["markdown", t.citeMarkdown]]) {
      const option = this.el("option", { value, text: label });
      select.append(option);
    }
    select.value = prefs.getStringPref("nium.copy.citeStyle", "simple");
    select.addEventListener("change", () => prefs.setStringPref("nium.copy.citeStyle", select.value));
    const styleRow = this.el("div", { class: "nium-option nium-option-sub" }, [
      this.el("span", { class: "nium-option-label", text: t.citeStyle }),
      select,
    ]);
    styleRow.hidden = !prefs.getBoolPref("nium.copy.cite", false);
    body.append(styleRow);

    toggle(t.gesturesLabel, t.gesturesHelp, prefs.getBoolPref("nium.gestures.enabled", false), v =>
      prefs.setBoolPref("nium.gestures.enabled", v)
    );
    toggle(t.restoreLabel, "", prefs.getIntPref("browser.startup.page", 1) === 3, v =>
      prefs.setIntPref("browser.startup.page", v ? 3 : 1)
    );
    toggle(t.bookmarksLabel, "", prefs.getCharPref("browser.toolbars.bookmarks.visibility", "never") === "always", v =>
      prefs.setCharPref("browser.toolbars.bookmarks.visibility", v ? "always" : "never")
    );

    const link = (label, icon, action) =>
      this.el("button", { class: "nium-link-row", onclick: action }, [this.icon(icon), this.el("span", { text: label })]);
    body.append(
      this.el("div", { class: "nium-subheading", text: "" }),
      link(t.openSettings, "chrome://global/skin/icons/settings.svg", () => openPreferences()),
      link(t.openShortcuts, "chrome://global/skin/icons/search-glass.svg", () => openTrustedLinkIn("about:keyboard", "tab")),
      link(t.openAddons, "chrome://mozapps/skin/extensions/extension.svg", () => BrowserAddonUI.openAddonsMgr("addons://list/extension"))
    );
  },

  // ---- lista de leitura (como no Nium Electron) ----
  READING_FILE: "nium-reading.json",
  READING_LIMIT: 500,
  readingFilter: "all",
  readingQuery: "",

  get readingPath() {
    return PathUtils.join(PathUtils.profileDir, this.READING_FILE);
  },

  webURL(spec) {
    try {
      const u = new URL(spec);
      return ["http:", "https:"].includes(u.protocol) && !u.username && !u.password && u.href.length <= 8192 ? u.href : null;
    } catch (e) {
      return null;
    }
  },

  async readReading() {
    try {
      const data = await IOUtils.readJSON(this.readingPath);
      const seen = new Set();
      return (Array.isArray(data) ? data : []).filter(item => {
        const url = this.webURL(item?.url);
        if (!url || typeof item.id !== "string" || seen.has(url)) return false;
        seen.add(url);
        return true;
      });
    } catch (e) {
      return [];
    }
  },

  async writeReading(list) {
    await IOUtils.writeJSON(this.readingPath, list.slice(0, this.READING_LIMIT), { tmpPath: this.readingPath + ".tmp" });
    for (const win of Services.wm.getEnumerator("navigator:browser")) {
      if (win !== window && win.NiumSidebar?.openPanelName === "reading") win.NiumSidebar.renderReading();
    }
  },

  async saveForLater() {
    const t = this.t;
    const browser = gBrowser.selectedBrowser;
    const url = this.webURL(browser.currentURI?.spec);
    if (!url) return this.renderReading(t.readingNoPage);
    const list = await this.readReading();
    if (list.some(item => item.url === url)) return this.renderReading(t.readingSaved);
    if (list.length >= this.READING_LIMIT) return this.renderReading(t.readingFull);
    const title = String(gBrowser.selectedTab.label || url).replace(/\s+/g, " ").slice(0, 200);
    list.unshift({ id: Services.uuid.generateUUID().toString(), url, title, read: false, createdAt: new Date().toISOString() });
    await this.writeReading(list);
    this.renderReading();
  },

  async renderReading(message = "") {
    const t = this.t;
    const all = await this.readReading();
    const body = this.panelBody;
    body.textContent = "";
    body.append(this.el("p", { class: "nium-panel-description", text: t.readingIntro }));
    const save = this.el("button", { class: "nium-primary-button", onclick: () => this.saveForLater() }, [
      this.icon("chrome://global/skin/icons/plus.svg"),
      this.el("span", { text: t.readingSave }),
    ]);
    if (!this.webURL(gBrowser.selectedBrowser.currentURI?.spec)) save.disabled = true;
    body.append(save);
    if (message) body.append(this.el("p", { class: "nium-panel-message", role: "alert", text: message }));
    if (!all.length) {
      body.append(
        this.el("div", { class: "nium-empty-state" }, [
          this.el("span", { class: "nium-empty-icon" }, [this.icon("chrome://browser/skin/reader-mode.svg")]),
          this.el("h3", { text: t.readingEmptyTitle }),
          this.el("p", { text: t.readingEmptyText }),
        ])
      );
      return;
    }

    // Busca e filtro
    const norm = text => String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const search = this.el("input", { class: "nium-input nium-reading-search", type: "search", placeholder: t.readingSearch, "aria-label": t.readingSearch });
    search.value = this.readingQuery;
    const tabs = this.el("div", { class: "nium-segmented", role: "tablist" });
    const counts = { all: all.length, unread: all.filter(i => !i.read).length, read: all.filter(i => i.read).length };
    for (const [key, label] of [["all", t.readingAll], ["unread", t.readingUnread], ["read", t.readingRead]]) {
      tabs.append(
        this.el(
          "button",
          { role: "tab", "aria-selected": String(this.readingFilter === key), onclick: () => { this.readingFilter = key; this.renderReading(); } },
          [this.el("span", { text: label }), this.el("span", { class: "nium-count", text: String(counts[key]) })]
        )
      );
    }
    const listBox = this.el("div", { class: "nium-reading-list" });
    const fill = () => {
      listBox.textContent = "";
      const q = norm(this.readingQuery);
      const rows = all.filter(
        item =>
          (this.readingFilter === "all" || item.read === (this.readingFilter === "read")) &&
          norm(item.title + " " + item.url).includes(q)
      );
      if (!rows.length) {
        listBox.append(this.el("p", { class: "nium-panel-message", text: t.readingNone }));
        return;
      }
      for (const item of rows) listBox.append(this.readingRow(item));
    };
    search.addEventListener("input", () => {
      this.readingQuery = search.value;
      fill();
    });
    body.append(this.el("div", { class: "nium-reading-tools" }, [search, tabs]), listBox);
    fill();
  },

  readingRow(item) {
    const t = this.t;
    let host = "";
    try {
      host = new URL(item.url).hostname.replace(/^www\./, "");
    } catch (e) {}
    const update = async change => {
      const list = await this.readReading();
      const index = list.findIndex(x => x.id === item.id);
      if (index < 0) return;
      if (change === "remove") list.splice(index, 1);
      else list[index].read = !list[index].read;
      await this.writeReading(list);
      this.renderReading();
    };
    const open = this.el(
      "button",
      {
        class: "nium-reading-open",
        title: item.url,
        onclick: e => {
          openTrustedLinkIn(item.url, e.ctrlKey || e.button === 1 ? "tabshifted" : "tab");
        },
      },
      [
        this.el("img", { class: "nium-reading-favicon", src: "page-icon:" + item.url, alt: "" }),
        this.el("span", { class: "nium-reading-text" }, [
          this.el("strong", { text: item.title }),
          this.el("span", { text: host }),
        ]),
      ]
    );
    return this.el("article", { class: "nium-reading-item", read: item.read ? "true" : "false" }, [
      open,
      this.el("span", { class: "nium-card-actions" }, [
        this.el("button", { class: "nium-icon-button", title: item.read ? t.markUnread : t.markRead, onclick: () => update("read") }, [
          this.icon(item.read ? "chrome://global/skin/icons/undo.svg" : "chrome://global/skin/icons/check.svg"),
        ]),
        this.el("button", { class: "nium-icon-button", title: t.removeItem, onclick: () => update("remove") }, [
          this.icon("chrome://global/skin/icons/delete.svg"),
        ]),
      ]),
    ]);
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
