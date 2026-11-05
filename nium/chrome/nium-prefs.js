/* Nium: página "Seu Nium" nas configurações (about:preferences#nium). MPL-2.0
 *
 * Reúne o que é do Nium (como a página "Seu Nium" do Electron): aparência, atalhos, gestos do
 * mouse, leitura e cópia, Nium AI, Nium Shield, seus dados e sobre. O resto continua nas
 * páginas do Firefox. Tudo vale na hora, como no resto das configurações.
 */
"use strict";

var gNiumPane = {
  UBO_ID: "uBlock0@raymondhill.net",
  GESTURE_PATTERNS: ["L", "R", "U", "D", "DR", "DL", "UR", "UL"],
  GESTURE_DEFAULTS: { L: "back", R: "forward", U: "newTab", D: "reload", DR: "closeTab", DL: "none", UR: "nextTab", UL: "previousTab" },
  // Os atalhos do Nium, pela id da tecla na janela do navegador.
  KEYS: [
    ["key_newNavigatorTab", "newTab"],
    ["key_privatebrowsing", "privateWindow"],
    ["key_close", "closeTab"],
    ["key_undoCloseTab", "reopenTab"],
    ["key_searchTabs", "searchTabs"],
    ["toggleSidebarKb", "sidebar"],
    ["viewGenaiChatSidebarKb", "ai"],
    ["focusURLBar", "address"],
    ["key_find", "find"],
    ["key_reload", "reload"],
  ],

  STRINGS: {
    en: {
      nav: "Your Nium",
      title: "Your Nium",
      subtitle: "What makes Nium, Nium. Everything else is in the other pages.",
      look: "Appearance",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      auto: "Automatic (follows Windows)",
      tabs: "Where the tabs go",
      tabsSide: "On the side",
      tabsTop: "On top",
      bookmarksBar: "Show the bookmarks bar",
      bookmarksBarHelp: "Your sites right below the address bar.",
      welcome: "Show the welcome again",
      shortcuts: "Keyboard shortcuts",
      shortcutsHelp: "Change any shortcut in the editor. Changes are saved for this profile.",
      editShortcuts: "Edit shortcuts…",
      keyNames: {
        newTab: "New tab",
        privateWindow: "New private window",
        closeTab: "Close tab",
        reopenTab: "Reopen closed tab",
        searchTabs: "Search tabs",
        sidebar: "Show or hide the sidebar",
        ai: "Nium AI",
        address: "Go to the address bar",
        find: "Find in page",
        reload: "Reload",
      },
      noKey: "No key",
      gestures: "Mouse gestures",
      gesturesHelp: "Hold the right button on a page, draw the move and let go. A click without dragging keeps the menu. Esc cancels.",
      gesturesOn: "Turn on mouse gestures",
      distance: "Minimum distance for each direction (pixels)",
      directions: { L: "Left", R: "Right", U: "Up", D: "Down", DR: "Down → right", DL: "Down → left", UR: "Up → right", UL: "Up → left" },
      actions: { none: "Nothing", back: "Back", forward: "Forward", reload: "Reload", newTab: "New tab", closeTab: "Close tab", nextTab: "Next tab", previousTab: "Previous tab" },
      resetGestures: "Restore default gestures",
      reading: "Reading and copying",
      cite: "Cite when copying",
      citeHelp: "When you copy text, Nium adds the page title, link and date.",
      citeStyle: "Citation style",
      citeSimple: "Simple",
      citeAbnt: "ABNT",
      citeMarkdown: "Markdown",
      restore: "Open the tabs from last time",
      restoreHelp: "When Nium starts, your tabs come back.",
      ai: "Nium AI",
      aiHelp: "Summaries, explanations, translations and questions about pages, made by an AI that runs on this computer.",
      engine: "Model",
      engineNone: "Not chosen yet",
      engineLight: "Light · ~400 MB",
      engineStandard: "Standard · ~1 GB",
      engineOllama: "Advanced: Ollama",
      answerLang: "Answer language",
      langAuto: "Same as Nium",
      shield: "Nium Shield",
      shieldOn: "Block ads and trackers",
      shieldHelp: "Lighter pages and less tracking. Uses uBlock Origin.",
      shieldMissing: "Nium Shield is not installed in this profile.",
      shieldSettings: "Shield settings and lists…",
      data: "Your data",
      dataHelp: "Notes, spaces and the reading list stay on this computer, in your profile.",
      import: "Import from another browser…",
      about: "About Nium",
      aboutBase: "Built on Firefox",
    },
    pt: {
      nav: "Seu Nium",
      title: "Seu Nium",
      subtitle: "O que faz o Nium ser o Nium. O resto fica nas outras páginas.",
      look: "Aparência",
      theme: "Tema",
      light: "Claro",
      dark: "Escuro",
      auto: "Automático (segue o Windows)",
      tabs: "Posição das abas",
      tabsSide: "Na lateral",
      tabsTop: "No topo",
      bookmarksBar: "Mostrar barra de favoritos",
      bookmarksBarHelp: "Seus sites logo abaixo da barra de endereços.",
      welcome: "Rever a tela de boas-vindas",
      shortcuts: "Atalhos de teclado",
      shortcutsHelp: "Mude qualquer atalho no editor. As mudanças ficam salvas neste perfil.",
      editShortcuts: "Editar atalhos…",
      keyNames: {
        newTab: "Nova aba",
        privateWindow: "Nova janela anônima",
        closeTab: "Fechar aba",
        reopenTab: "Reabrir aba fechada",
        searchTabs: "Buscar nas abas",
        sidebar: "Mostrar ou esconder a lateral",
        ai: "Nium AI",
        address: "Ir para a barra de endereços",
        find: "Procurar na página",
        reload: "Recarregar",
      },
      noKey: "Sem tecla",
      gestures: "Gestos do mouse",
      gesturesHelp: "Segure o botão direito sobre um site, desenhe o movimento e solte. Um clique sem arrastar mantém o menu. Esc cancela.",
      gesturesOn: "Ativar gestos do mouse",
      distance: "Distância mínima por direção (pixels)",
      directions: { L: "Esquerda", R: "Direita", U: "Cima", D: "Baixo", DR: "Baixo → direita", DL: "Baixo → esquerda", UR: "Cima → direita", UL: "Cima → esquerda" },
      actions: { none: "Nenhuma", back: "Voltar", forward: "Avançar", reload: "Recarregar", newTab: "Nova aba", closeTab: "Fechar aba", nextTab: "Próxima aba", previousTab: "Aba anterior" },
      resetGestures: "Restaurar gestos padrão",
      reading: "Leitura e cópia",
      cite: "Citar ao copiar",
      citeHelp: "Ao copiar um texto, o Nium inclui o título, o link e a data da página.",
      citeStyle: "Estilo da citação",
      citeSimple: "Simples",
      citeAbnt: "ABNT",
      citeMarkdown: "Markdown",
      restore: "Abrir as abas da última vez",
      restoreHelp: "Quando o Nium abre, suas abas voltam.",
      ai: "Nium AI",
      aiHelp: "Resumos, explicações, traduções e perguntas sobre as páginas, feitos por uma IA que roda neste computador.",
      engine: "Modelo",
      engineNone: "Ainda não escolhido",
      engineLight: "Leve · ~400 MB",
      engineStandard: "Padrão · ~1 GB",
      engineOllama: "Avançado: Ollama",
      answerLang: "Idioma das respostas",
      langAuto: "O mesmo do Nium",
      shield: "Nium Shield",
      shieldOn: "Bloquear anúncios e rastreadores",
      shieldHelp: "Páginas mais leves e menos rastreamento. Usa o uBlock Origin.",
      shieldMissing: "O Nium Shield não está instalado neste perfil.",
      shieldSettings: "Ajustes e listas do Shield…",
      data: "Seus dados",
      dataHelp: "Notas, espaços e a lista de leitura ficam neste computador, no seu perfil.",
      import: "Importar de outro navegador…",
      about: "Sobre o Nium",
      aboutBase: "Feito sobre o Firefox",
    },
  },

  get t() {
    let pt = false;
    try {
      pt = Services.locale.appLocaleAsBCP47.startsWith("pt");
    } catch (e) {}
    return pt ? this.STRINGS.pt : this.STRINGS.en;
  },

  get topWin() {
    return window.browsingContext.topChromeWindow;
  },

  // O nome no menu da esquerda aparece assim que a página abre.
  label() {
    const button = document.getElementById("category-nium");
    if (button) button.textContent = this.t.nav;
  },

  init() {
    this.label();
    const root = document.createElement("div");
    root.id = "niumPane";
    // Sem "data-hidden-from-search": com ele, a troca de página do Firefox esconde este bloco.
    root.setAttribute("data-category", "paneNium");
    root.hidden = true;
    document.getElementById("mainPrefPane").append(root);
    this.root = root;
    this.render();
    // Mudanças feitas fora daqui (pela lateral, pelas boas-vindas) aparecem ao voltar.
    document.addEventListener("paneshown", e => {
      if (e.detail?.category === "paneNium") this.render();
    });
  },

  // ---- peças ----
  el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value);
    }
    for (const child of children) if (child) node.append(child);
    return node;
  },

  section(title, help, children) {
    return this.el("section", { class: "nium-pref-group" }, [
      this.el("h2", { text: title }),
      help ? this.el("p", { class: "description-deemphasized", text: help }) : null,
      ...children,
    ]);
  },

  toggle(label, description, pressed, onchange) {
    const toggle = this.el("moz-toggle", { label });
    if (description) toggle.setAttribute("description", description);
    toggle.pressed = pressed;
    toggle.addEventListener("toggle", () => onchange(toggle.pressed));
    return this.el("div", { class: "nium-pref-row" }, [toggle]);
  },

  select(label, options, value, onchange) {
    const id = "nium-" + Math.random().toString(36).slice(2, 9);
    const select = this.el("select", { id });
    for (const [v, text] of options) select.append(this.el("option", { value: v, text }));
    select.value = value;
    select.addEventListener("change", () => onchange(select.value));
    return this.el("div", { class: "nium-pref-field" }, [this.el("label", { for: id, text: label }), select]);
  },

  button(label, onclick) {
    return this.el("button", { type: "button", class: "nium-pref-button", text: label, onclick });
  },

  // ---- página ----
  async render() {
    const t = this.t;
    this.label();
    const prefs = Services.prefs;
    const parts = [
      this.el("div", { class: "subcategory nium-pref-header" }, [
        this.el("h1", { class: "title", text: t.title }),
        this.el("p", { class: "subtitle description-deemphasized", text: t.subtitle }),
      ]),
      this.lookSection(prefs),
      this.shortcutsSection(),
      this.gesturesSection(prefs),
      this.readingSection(prefs),
      this.aiSection(prefs),
      await this.shieldSection(),
      this.section(t.data, t.dataHelp, [
        this.el("div", { class: "nium-pref-buttons" }, [
          this.button(t.import, () => {
            const { MigrationUtils } = ChromeUtils.importESModule("resource:///modules/MigrationUtils.sys.mjs");
            MigrationUtils.showMigrationWizard(this.topWin, {});
          }),
        ]),
      ]),
      this.section(t.about, "", [
        this.el("div", { class: "nium-pref-about" }, [
          this.el("img", { src: "chrome://branding/content/about-logo.svg", alt: "" }),
          this.el("div", {}, [
            this.el("strong", { text: `Nium ${Services.appinfo.version}` }),
            this.el("small", { text: `${t.aboutBase} ${Services.appinfo.platformVersion}` }),
          ]),
        ]),
      ]),
    ];
    this.root.replaceChildren(...parts);
  },

  lookSection(prefs) {
    const t = this.t;
    const theme = prefs.prefHasUserValue("ui.systemUsesDarkTheme") ? String(prefs.getIntPref("ui.systemUsesDarkTheme")) : "auto";
    return this.section(t.look, "", [
      this.select(t.theme, [["0", t.light], ["1", t.dark], ["auto", t.auto]], theme, v => {
        if (v === "auto") prefs.clearUserPref("ui.systemUsesDarkTheme");
        else prefs.setIntPref("ui.systemUsesDarkTheme", Number(v));
      }),
      this.select(t.tabs, [["side", t.tabsSide], ["top", t.tabsTop]], prefs.getBoolPref("sidebar.verticalTabs", true) ? "side" : "top", v =>
        prefs.setBoolPref("sidebar.verticalTabs", v === "side")
      ),
      this.toggle(t.bookmarksBar, t.bookmarksBarHelp, prefs.getCharPref("browser.toolbars.bookmarks.visibility", "never") === "always", v =>
        prefs.setCharPref("browser.toolbars.bookmarks.visibility", v ? "always" : "never")
      ),
      this.el("div", { class: "nium-pref-buttons" }, [
        this.button(t.welcome, () => {
          this.topWin.focus();
          this.topWin.NiumWelcome?.show();
        }),
      ]),
    ]);
  },

  shortcutsSection() {
    const t = this.t;
    const win = this.topWin;
    let prettify = () => "";
    try {
      const { ShortcutUtils } = ChromeUtils.importESModule("resource://gre/modules/ShortcutUtils.sys.mjs");
      prettify = key => ShortcutUtils.prettifyShortcut(key);
    } catch (e) {}
    const rows = [];
    for (const [id, name] of this.KEYS) {
      const key = win?.document.getElementById(id);
      if (!key) continue;
      let text = "";
      try {
        text = key.hasAttribute("disabled") ? "" : prettify(key);
      } catch (e) {}
      rows.push(
        this.el("li", {}, [
          this.el("span", { text: t.keyNames[name] }),
          text ? this.el("kbd", { text }) : this.el("span", { class: "description-deemphasized", text: t.noKey }),
        ])
      );
    }
    return this.section(t.shortcuts, t.shortcutsHelp, [
      this.el("ul", { class: "nium-pref-keys" }, rows),
      this.el("div", { class: "nium-pref-buttons" }, [
        this.button(t.editShortcuts, () => win.openTrustedLinkIn("about:keyboard", "tab")),
      ]),
    ]);
  },

  gestureBindings(prefs) {
    let saved = {};
    try {
      saved = JSON.parse(prefs.getStringPref("nium.gestures.bindings", "{}")) || {};
    } catch (e) {}
    const out = { ...this.GESTURE_DEFAULTS };
    for (const p of this.GESTURE_PATTERNS) if (Object.hasOwn(this.t.actions, saved[p])) out[p] = saved[p];
    return out;
  },

  gesturesSection(prefs) {
    const t = this.t;
    const bindings = this.gestureBindings(prefs);
    const distance = this.el("input", {
      type: "number",
      id: "nium-gesture-distance",
      min: "30",
      max: "160",
      step: "1",
      value: String(prefs.getIntPref("nium.gestures.threshold", 60)),
    });
    distance.addEventListener("change", () => {
      const n = Math.min(160, Math.max(30, Math.round(Number(distance.value) || 60)));
      distance.value = String(n);
      if (n === 60) prefs.clearUserPref("nium.gestures.threshold");
      else prefs.setIntPref("nium.gestures.threshold", n);
    });
    const actions = Object.entries(t.actions);
    const grid = this.el(
      "div",
      { class: "nium-pref-grid" },
      this.GESTURE_PATTERNS.map(p =>
        this.select(t.directions[p], actions, bindings[p], v => {
          const next = this.gestureBindings(prefs);
          next[p] = v;
          prefs.setStringPref("nium.gestures.bindings", JSON.stringify(next));
        })
      )
    );
    return this.section(t.gestures, t.gesturesHelp, [
      this.toggle(t.gesturesOn, "", prefs.getBoolPref("nium.gestures.enabled", false), v => prefs.setBoolPref("nium.gestures.enabled", v)),
      this.el("div", { class: "nium-pref-field" }, [this.el("label", { for: distance.id, text: t.distance }), distance]),
      grid,
      this.el("div", { class: "nium-pref-buttons" }, [
        this.button(t.resetGestures, () => {
          prefs.clearUserPref("nium.gestures.bindings");
          prefs.clearUserPref("nium.gestures.threshold");
          this.render();
        }),
      ]),
    ]);
  },

  readingSection(prefs) {
    const t = this.t;
    const style = this.select(
      t.citeStyle,
      [["simple", t.citeSimple], ["abnt", t.citeAbnt], ["markdown", t.citeMarkdown]],
      prefs.getStringPref("nium.copy.citeStyle", "simple"),
      v => prefs.setStringPref("nium.copy.citeStyle", v)
    );
    style.classList.add("nium-pref-sub");
    style.hidden = !prefs.getBoolPref("nium.copy.cite", false);
    return this.section(t.reading, "", [
      this.toggle(t.cite, t.citeHelp, prefs.getBoolPref("nium.copy.cite", false), v => {
        prefs.setBoolPref("nium.copy.cite", v);
        style.hidden = !v;
      }),
      style,
      this.toggle(t.restore, t.restoreHelp, prefs.getIntPref("browser.startup.page", 1) === 3, v =>
        prefs.setIntPref("browser.startup.page", v ? 3 : 1)
      ),
    ]);
  },

  aiSection(prefs) {
    const t = this.t;
    return this.section(t.ai, t.aiHelp, [
      this.select(
        t.engine,
        [["", t.engineNone], ["local:light", t.engineLight], ["local:standard", t.engineStandard], ["ollama", t.engineOllama]],
        prefs.getStringPref("nium.ai.engine", ""),
        v => (v ? prefs.setStringPref("nium.ai.engine", v) : prefs.clearUserPref("nium.ai.engine"))
      ),
      this.select(
        t.answerLang,
        [["", t.langAuto], ["pt-BR", "Português"], ["en", "English"], ["es", "Español"]],
        prefs.getStringPref("nium.ai.lang", ""),
        v => (v ? prefs.setStringPref("nium.ai.lang", v) : prefs.clearUserPref("nium.ai.lang"))
      ),
    ]);
  },

  async shieldSection() {
    const t = this.t;
    let ubo = null;
    try {
      const { AddonManager } = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs");
      ubo = await AddonManager.getAddonByID(this.UBO_ID);
    } catch (e) {}
    if (!ubo) return this.section(t.shield, t.shieldMissing, []);
    return this.section(t.shield, "", [
      this.toggle(t.shieldOn, t.shieldHelp, !ubo.userDisabled, v => (v ? ubo.enable() : ubo.disable())),
      this.el("div", { class: "nium-pref-buttons" }, [
        this.button(t.shieldSettings, () =>
          this.topWin.BrowserAddonUI.openAddonsMgr("addons://detail/" + encodeURIComponent(this.UBO_ID) + "/preferences")
        ),
      ]),
    ]);
  },
};

document.addEventListener("DOMContentLoaded", () => gNiumPane.label(), { once: true });
