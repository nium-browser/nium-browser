/* Nium: boas-vindas na primeira vez (como no Nium Electron). MPL-2.0
 *
 * Um cartão por cima da janela, em passos: idioma, aparência, pesquisa, privacidade, IA,
 * acessibilidade e "tudo pronto" (com importar de outro navegador). Cada escolha vale na hora e
 * pode ser mudada depois. Aparece uma vez (nium.welcome.done); "Seu espaço" tem "Rever as boas-vindas".
 */
"use strict";

var NiumWelcome = {
  STEPS: ["welcome", "look", "search", "privacy", "ai", "access", "done"],
  step: 0,
  root: null,
  UBO_ID: "uBlock0@raymondhill.net",

  STRINGS: {
    en: {
      titles: ["Welcome", "Appearance", "Search", "Privacy", "Nium AI", "Accessibility", "All set"],
      welcomeTitle: "Welcome to Nium",
      welcomeText: "Let's make the browser yours. It takes less than a minute, and you can change everything later.",
      language: "Language",
      lookTitle: "Appearance",
      lookText: "Pick the look. Changes show right away.",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      auto: "Automatic",
      autoHelp: "Follows Windows",
      tabs: "Where the tabs go",
      tabsSide: "On the side",
      tabsSideHelp: "Vertical list, great for many tabs",
      tabsTop: "On top",
      tabsTopHelp: "Classic strip, like Chrome",
      searchTitle: "Search",
      searchText: "The engine used when you type in the address bar.",
      suggestHistory: "Suggest pages from history",
      suggestHistoryHelp: "Shows sites you've visited while you type.",
      privacyTitle: "Privacy",
      privacyText: "Recommended protections are already on.",
      shield: "Block ads and trackers (Nium Shield)",
      shieldHelp: "Lighter pages and less tracking.",
      popups: "Block pop-ups",
      popupsHelp: "Stops windows opened without your click.",
      https: "Always use a secure connection (HTTPS)",
      httpsHelp: "Warns before opening sites without encryption.",
      gpc: "Ask sites not to sell or share my data",
      gpcHelp: "Sends the Global Privacy Control signal. Some sites ignore it.",
      aiTitle: "Nium AI",
      aiText: "Summarize pages, ask about them, explain and translate. It runs on this computer: what you read never leaves it.",
      aiLight: "Light · ~400 MB",
      aiLightHelp: "Fast, simpler answers. Good for older computers.",
      aiStandard: "Standard · ~1 GB",
      aiStandardHelp: "Better answers. Needs more memory.",
      aiOllama: "Advanced: Ollama",
      aiOllamaHelp: "Larger models you install in the free Ollama app.",
      aiLater: "Decide later",
      aiLaterHelp: "You can choose when you open Nium AI.",
      aiNote: "The model downloads only the first time you use it.",
      accessTitle: "Accessibility",
      accessText: "Adjust how Nium reads.",
      textSize: "Text size",
      sizes: ["Small", "Default", "Large", "Very large"],
      smooth: "Smooth scrolling",
      smoothHelp: "Turn it off if motion on screen bothers you.",
      bookmarksBar: "Show the bookmarks bar",
      bookmarksBarHelp: "One-click access to your sites.",
      doneTitle: "All set",
      doneText: "Your Nium is ready. Want to bring your bookmarks, passwords and history from another browser?",
      import: "Import from another browser",
      tip: "Tip: Ctrl + K searches all your tabs, and Ctrl + T opens a new one.",
      skip: "Skip",
      back: "Back",
      next: "Continue",
      start: "Get started",
      finish: "Open Nium",
    },
    pt: {
      titles: ["Boas-vindas", "Aparência", "Pesquisa", "Privacidade", "Nium AI", "Acessibilidade", "Tudo pronto"],
      welcomeTitle: "Bem-vindo ao Nium",
      welcomeText: "Vamos deixar o navegador do seu jeito. Leva menos de um minuto, e tudo pode ser mudado depois.",
      language: "Idioma",
      lookTitle: "Aparência",
      lookText: "Escolha o visual. As mudanças aparecem na hora.",
      theme: "Tema",
      light: "Claro",
      dark: "Escuro",
      auto: "Automático",
      autoHelp: "Segue o Windows",
      tabs: "Posição das abas",
      tabsSide: "Na lateral",
      tabsSideHelp: "Lista vertical, ótima para muitas abas",
      tabsTop: "No topo",
      tabsTopHelp: "Faixa clássica, como no Chrome",
      searchTitle: "Pesquisa",
      searchText: "O mecanismo usado quando você digita na barra de endereços.",
      suggestHistory: "Sugerir páginas do histórico",
      suggestHistoryHelp: "Mostra sites que você já visitou enquanto digita.",
      privacyTitle: "Privacidade",
      privacyText: "Proteções recomendadas já vêm ligadas.",
      shield: "Bloquear anúncios e rastreadores (Nium Shield)",
      shieldHelp: "Páginas mais leves e menos rastreamento.",
      popups: "Bloquear pop-ups",
      popupsHelp: "Impede janelas abertas sem o seu clique.",
      https: "Sempre usar conexão segura (HTTPS)",
      httpsHelp: "Avisa antes de abrir sites sem criptografia.",
      gpc: "Pedir aos sites para não vender nem compartilhar meus dados",
      gpcHelp: "Envia o sinal Global Privacy Control. Alguns sites ignoram.",
      aiTitle: "Nium AI",
      aiText: "Resuma páginas, pergunte sobre elas, explique e traduza. Roda neste computador: o que você lê não sai dele.",
      aiLight: "Leve · ~400 MB",
      aiLightHelp: "Rápida, respostas mais simples. Boa para computadores mais antigos.",
      aiStandard: "Padrão · ~1 GB",
      aiStandardHelp: "Respostas melhores. Precisa de mais memória.",
      aiOllama: "Avançado: Ollama",
      aiOllamaHelp: "Modelos maiores que você instala no app gratuito Ollama.",
      aiLater: "Decidir depois",
      aiLaterHelp: "Você pode escolher quando abrir o Nium AI.",
      aiNote: "O modelo só é baixado na primeira vez que você usar.",
      accessTitle: "Acessibilidade",
      accessText: "Ajuste a leitura do Nium.",
      textSize: "Tamanho do texto",
      sizes: ["Pequeno", "Padrão", "Grande", "Muito grande"],
      smooth: "Rolagem suave",
      smoothHelp: "Desative se movimentos na tela incomodam.",
      bookmarksBar: "Mostrar barra de favoritos",
      bookmarksBarHelp: "Acesso com um clique aos seus sites.",
      doneTitle: "Tudo pronto",
      doneText: "Seu Nium está configurado. Quer trazer favoritos, senhas e histórico de outro navegador?",
      import: "Importar de outro navegador",
      tip: "Dica: Ctrl + K busca em todas as abas, e Ctrl + T abre uma nova.",
      skip: "Pular",
      back: "Voltar",
      next: "Continuar",
      start: "Começar",
      finish: "Abrir o Nium",
    },
  },

  get t() {
    let pt = false;
    try {
      pt = Services.locale.appLocaleAsBCP47.startsWith("pt");
    } catch (e) {}
    return pt ? this.STRINGS.pt : this.STRINGS.en;
  },

  // Desenhos de cada passo (do Nium Electron).
  ART: {
    welcome: '<circle class="nw-ring" cx="60" cy="60" r="52"/><circle class="nw-ring" cx="60" cy="60" r="40"/><rect class="nw-tile" x="34" y="34" width="52" height="52" rx="14"/><path class="nw-draw" d="M48 74V46l24 28V46"/>',
    look: '<rect class="nw-draw" x="18" y="26" width="84" height="66" rx="9"/><path class="nw-draw" d="M44 26v66"/><rect class="nw-bar" x="24" y="38" width="14" height="5" rx="2.5"/><rect class="nw-bar" x="24" y="49" width="14" height="5" rx="2.5"/><rect class="nw-bar" x="24" y="60" width="14" height="5" rx="2.5"/><rect class="nw-bar" x="52" y="38" width="42" height="24" rx="5"/>',
    search: '<rect class="nw-draw" x="16" y="44" width="88" height="26" rx="13"/><circle class="nw-draw" cx="34" cy="57" r="6"/><path class="nw-draw" d="m38.5 61.5 4 4"/><rect class="nw-bar" x="50" y="54" width="40" height="6" rx="3"/><rect class="nw-bar" x="22" y="80" width="52" height="5" rx="2.5"/><rect class="nw-bar" x="22" y="90" width="36" height="5" rx="2.5"/>',
    privacy: '<circle class="nw-ring" cx="60" cy="60" r="50"/><path class="nw-draw" d="M60 22l30 11v22c0 20-14 34-30 41-16-7-30-21-30-41V33z"/><path class="nw-draw" d="m47 59 9 9 18-19"/>',
    ai: '<circle class="nw-ring" cx="60" cy="60" r="50"/><path class="nw-draw" d="M60 30l7 17 17 7-17 7-7 17-7-17-17-7 17-7z"/><circle class="nw-dot" cx="88" cy="32" r="3"/><circle class="nw-dot" cx="30" cy="88" r="2.5"/>',
    access: '<text class="nw-aa" x="60" y="70" text-anchor="middle">Aa</text><rect class="nw-bar" x="26" y="88" width="68" height="4" rx="2"/><circle class="nw-tile" cx="44" cy="90" r="6"/>',
    done: '<circle class="nw-dot" cx="60" cy="14" r="3"/><circle class="nw-dot" cx="100" cy="36" r="2.5"/><circle class="nw-dot" cx="104" cy="80" r="3"/><circle class="nw-dot" cx="60" cy="106" r="2.5"/><circle class="nw-dot" cx="16" cy="80" r="3"/><circle class="nw-dot" cx="20" cy="36" r="2.5"/><circle class="nw-draw" cx="60" cy="60" r="32"/><path class="nw-draw" d="m45 61 10 10 21-22"/>',
  },

  // ---- quando aparece ----
  maybeShow() {
    if (Services.prefs.getBoolPref("nium.welcome.done", false)) return;
    if (PrivateBrowsingUtils.isWindowPrivate(window)) return;
    // Só na primeira janela.
    const wins = [...Services.wm.getEnumerator("navigator:browser")];
    if (wins.some(w => w !== window && w.NiumWelcome?.root)) return;
    setTimeout(() => this.show(), 600);
  },

  show() {
    if (this.root) return;
    this.step = 0;
    const el = NiumSidebar.el.bind(NiumSidebar);
    this.art = el("div", { class: "nw-art" });
    this.stepsList = el("ol", { class: "nw-steps" });
    this.body = el("div", { class: "nw-body", "aria-live": "polite" });
    this.progress = el("span");
    this.skipBtn = el("button", { class: "nw-ghost", onclick: () => this.finish() });
    this.backBtn = el("button", { class: "nw-ghost", onclick: () => this.go(-1) });
    this.nextBtn = el("button", { class: "nw-primary", onclick: () => (this.step === this.STEPS.length - 1 ? this.finish() : this.go(1)) });
    const mark = el("span", { class: "nw-brand-mark" });
    mark.append(this.svg('<path d="M8 23V9l16 14V9"/>', "0 0 32 32"));
    this.root = el("div", { id: "nium-welcome", role: "dialog", "aria-modal": "true" }, [
      el("div", { class: "nw-card" }, [
        el("aside", { class: "nw-aside" }, [el("div", { class: "nw-brand" }, [mark, el("span", { text: "nium" })]), this.art, this.stepsList]),
        el("div", { class: "nw-main" }, [
          el("div", { class: "nw-progress" }, [this.progress]),
          this.body,
          el("footer", { class: "nw-footer" }, [this.skipBtn, el("span", { class: "nw-spacer" }), this.backBtn, this.nextBtn]),
        ]),
      ]),
    ]);
    this.root.addEventListener("keydown", e => {
      if (e.key === "Escape") this.finish();
    });
    (document.body || document.documentElement).appendChild(this.root);
    this.paint();
    this.nextBtn.focus();
  },

  svg(inner, viewBox = "0 0 120 120") {
    // Monta o SVG com DOMParser (o innerHTML da janela tira atributos de SVG).
    const doc = new DOMParser().parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${inner}</svg>`,
      "image/svg+xml"
    );
    return document.importNode(doc.documentElement, true);
  },

  go(dir) {
    this.step = Math.max(0, Math.min(this.STEPS.length - 1, this.step + dir));
    this.paint();
  },

  async finish() {
    Services.prefs.setBoolPref("nium.welcome.done", true);
    const root = this.root;
    this.root = null;
    root?.classList.add("nw-leaving");
    setTimeout(() => root?.remove(), 200);
  },

  async paint() {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const name = this.STEPS[this.step];
    const last = this.step === this.STEPS.length - 1;
    this.art.replaceChildren(this.svg(this.ART[name]));
    this.stepsList.replaceChildren(
      ...t.titles.map((title, i) =>
        el("li", { class: i === this.step ? "on" : i < this.step ? "past" : "" }, [el("span", { class: "nw-step-dot" }), el("span", { text: title })])
      )
    );
    this.progress.style.width = `${(this.step / (this.STEPS.length - 1)) * 100}%`;
    this.skipBtn.textContent = t.skip;
    this.skipBtn.hidden = last;
    this.backBtn.textContent = t.back;
    this.backBtn.hidden = this.step === 0 || last;
    this.nextBtn.textContent = this.step === 0 ? t.start : last ? t.finish : t.next;
    this.body.replaceChildren(...(await this[`step_${name}`]()));
  },

  // ---- peças ----
  choice(title, help, on, onclick, preview) {
    const el = NiumSidebar.el.bind(NiumSidebar);
    const b = el("button", { class: "nw-choice" + (on ? " on" : ""), "aria-pressed": String(!!on) }, [
      ...(preview ? [preview] : []),
      el("span", { class: "nw-choice-text" }, [el("strong", { text: title }), ...(help ? [el("small", { text: help })] : [])]),
    ]);
    b.addEventListener("click", async () => {
      await onclick();
      this.paint();
    });
    return b;
  },

  toggle(title, help, checked, onchange) {
    const el = NiumSidebar.el.bind(NiumSidebar);
    const input = el("input", { type: "checkbox", class: "nium-switch" });
    input.checked = checked;
    input.addEventListener("change", () => onchange(input.checked));
    return el("label", { class: "nium-option" }, [
      el("span", { class: "nium-option-text" }, [el("span", { class: "nium-option-label", text: title }), el("span", { class: "nium-option-help", text: help })]),
      input,
    ]);
  },

  head(title, text) {
    const el = NiumSidebar.el.bind(NiumSidebar);
    return [el("h2", { text: title, tabindex: "-1" }), el("p", { class: "nw-lead", text })];
  },

  // ---- passos ----
  async step_welcome() {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const names = { "pt-BR": "Português", "en-US": "English", "es-ES": "Español", es: "Español" };
    const available = Services.locale.availableLocales.filter(l => names[l]);
    const current = Services.locale.appLocaleAsBCP47;
    const langs = available.length > 1
      ? [
          el("p", { class: "nw-label", text: t.language }),
          el(
            "div",
            { class: "nw-langs" },
            available.map(l =>
              this.choice(names[l], "", current === l, () => {
                Services.locale.requestedLocales = [l];
              })
            )
          ),
        ]
      : [];
    return [el("h1", { text: t.welcomeTitle, tabindex: "-1" }), el("p", { class: "nw-lead", text: t.welcomeText }), ...langs];
  },

  async step_look() {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const prefs = Services.prefs;
    const forced = prefs.prefHasUserValue("ui.systemUsesDarkTheme") ? prefs.getIntPref("ui.systemUsesDarkTheme") : -1;
    const setTheme = v => {
      if (v < 0) prefs.clearUserPref("ui.systemUsesDarkTheme");
      else prefs.setIntPref("ui.systemUsesDarkTheme", v);
    };
    const thumb = cls => el("span", { class: "nw-thumb " + cls });
    const vertical = prefs.getBoolPref("sidebar.verticalTabs", true);
    return [
      ...this.head(t.lookTitle, t.lookText),
      el("p", { class: "nw-label", text: t.theme }),
      el("div", { class: "nw-grid nw-3" }, [
        this.choice(t.light, "", forced === 0, () => setTheme(0), thumb("nw-thumb-light")),
        this.choice(t.dark, "", forced === 1, () => setTheme(1), thumb("nw-thumb-dark")),
        this.choice(t.auto, t.autoHelp, forced === -1, () => setTheme(-1), thumb("nw-thumb-auto")),
      ]),
      el("p", { class: "nw-label", text: t.tabs }),
      el("div", { class: "nw-grid nw-2" }, [
        this.choice(t.tabsSide, t.tabsSideHelp, vertical, () => prefs.setBoolPref("sidebar.verticalTabs", true)),
        this.choice(t.tabsTop, t.tabsTopHelp, !vertical, () => prefs.setBoolPref("sidebar.verticalTabs", false)),
      ]),
    ];
  },

  async step_search() {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const engines = (await Services.search.getVisibleEngines()).slice(0, 6);
    const current = await Services.search.getDefault();
    const rows = [];
    for (const engine of engines) {
      let iconURL = "";
      try {
        iconURL = (await engine.getIconURL()) || "";
      } catch (e) {}
      const preview = iconURL ? el("img", { class: "nw-engine-icon", src: iconURL, alt: "" }) : el("span", { class: "nw-letter", text: engine.name[0] });
      rows.push(
        this.choice(engine.name, "", engine.name === current?.name, () =>
          Services.search.setDefault(engine, Ci.nsISearchService.CHANGE_REASON_USER)
        , preview)
      );
    }
    return [
      ...this.head(t.searchTitle, t.searchText),
      el("div", { class: "nw-list" }, rows),
      this.toggle(t.suggestHistory, t.suggestHistoryHelp, Services.prefs.getBoolPref("browser.urlbar.suggest.history", true), v =>
        Services.prefs.setBoolPref("browser.urlbar.suggest.history", v)
      ),
    ];
  },

  async step_privacy() {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const prefs = Services.prefs;
    const { AddonManager } = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs");
    const ubo = await AddonManager.getAddonByID(this.UBO_ID);
    const rows = [];
    if (ubo) {
      rows.push(
        this.toggle(t.shield, t.shieldHelp, !ubo.userDisabled, v => (v ? ubo.enable() : ubo.disable()))
      );
    }
    rows.push(
      this.toggle(t.popups, t.popupsHelp, prefs.getBoolPref("dom.disable_open_during_load", true), v =>
        prefs.setBoolPref("dom.disable_open_during_load", v)
      ),
      this.toggle(t.https, t.httpsHelp, prefs.getBoolPref("dom.security.https_only_mode", false), v =>
        prefs.setBoolPref("dom.security.https_only_mode", v)
      ),
      this.toggle(t.gpc, t.gpcHelp, prefs.getBoolPref("privacy.globalprivacycontrol.enabled", false), v =>
        prefs.setBoolPref("privacy.globalprivacycontrol.enabled", v)
      )
    );
    return [...this.head(t.privacyTitle, t.privacyText), el("div", { class: "nw-switches" }, rows)];
  },

  async step_ai() {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const prefs = Services.prefs;
    const engine = prefs.getStringPref("nium.ai.engine", "");
    const set = v => (v ? prefs.setStringPref("nium.ai.engine", v) : prefs.clearUserPref("nium.ai.engine"));
    return [
      ...this.head(t.aiTitle, t.aiText),
      el("div", { class: "nw-list" }, [
        this.choice(t.aiLight, t.aiLightHelp, engine === "local:light", () => set("local:light")),
        this.choice(t.aiStandard, t.aiStandardHelp, engine === "local:standard", () => set("local:standard")),
        this.choice(t.aiOllama, t.aiOllamaHelp, engine === "ollama", () => set("ollama")),
        this.choice(t.aiLater, t.aiLaterHelp, !engine, () => set("")),
      ]),
      el("p", { class: "nw-hint", text: t.aiNote }),
    ];
  },

  async step_access() {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const prefs = Services.prefs;
    const scale = prefs.getIntPref("ui.textScaleFactor", 100);
    const sizes = [90, 100, 115, 130];
    return [
      ...this.head(t.accessTitle, t.accessText),
      el("p", { class: "nw-label", text: t.textSize }),
      el(
        "div",
        { class: "nw-grid nw-4" },
        sizes.map((size, i) => {
          const b = el("button", { class: "nw-size" + (scale === size ? " on" : "") }, [
            el("span", { text: "Aa", style: `font-size:${Math.round(13 * (size / 100)) + 6}px` }),
            el("small", { text: t.sizes[i] }),
          ]);
          b.addEventListener("click", () => {
            if (size === 100) prefs.clearUserPref("ui.textScaleFactor");
            else prefs.setIntPref("ui.textScaleFactor", size);
            this.paint();
          });
          return b;
        })
      ),
      el("div", { class: "nw-switches" }, [
        this.toggle(t.smooth, t.smoothHelp, prefs.getBoolPref("general.smoothScroll", true), v => prefs.setBoolPref("general.smoothScroll", v)),
        this.toggle(t.bookmarksBar, t.bookmarksBarHelp, prefs.getCharPref("browser.toolbars.bookmarks.visibility", "never") === "always", v =>
          prefs.setCharPref("browser.toolbars.bookmarks.visibility", v ? "always" : "never")
        ),
      ]),
    ];
  },

  async step_done() {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const importBtn = el("button", { class: "nw-secondary" }, [el("span", { text: t.import })]);
    importBtn.addEventListener("click", () => {
      try {
        const { MigrationUtils } = ChromeUtils.importESModule("resource:///modules/MigrationUtils.sys.mjs");
        MigrationUtils.showMigrationWizard(window, {});
      } catch (e) {
        console.error("Nium: importar", e);
      }
    });
    return [el("h1", { text: t.doneTitle, tabindex: "-1" }), el("p", { class: "nw-lead", text: t.doneText }), importBtn, el("p", { class: "nw-hint", text: t.tip })];
  },
};
