/* Nium: boas-vindas na primeira vez, com a cara do site do Nium. MPL-2.0
 *
 * O jardim do site (areia viva, ondas e a lente de vidro) no começo e no fim; no meio, o "tour" do
 * site: os passos à esquerda e as escolhas num palco de vidro à direita (aparência, pesquisa,
 * privacidade, IA, acessibilidade). No fim, importar de outro navegador. Cada escolha vale na hora e
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
      heroSoon: "Welcome to Nium",
      heroTitle: "The internet, at your pace.",
      tourTitle: "Make it yours.",
      tourLead: "Five quick choices. You can change all of them later in Your Nium.",
      doneSoon: "All set",
      doneTitle2: "Your Nium is ready.",
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
      heroSoon: "Boas-vindas ao Nium",
      heroTitle: "A internet, no seu ritmo.",
      tourTitle: "Do seu jeito.",
      tourLead: "Cinco escolhas rápidas. Tudo pode ser mudado depois em Seu Nium.",
      doneSoon: "Tudo pronto",
      doneTitle2: "Seu Nium está pronto.",
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

  // ---- quando aparece ----
  maybeShow() {
    if (Services.prefs.getBoolPref("nium.welcome.done", false)) return;
    if (PrivateBrowsingUtils.isWindowPrivate(window)) return;
    // Só na primeira janela.
    const wins = [...Services.wm.getEnumerator("navigator:browser")];
    if (wins.some(w => w !== window && w.NiumWelcome?.root)) return;
    setTimeout(() => this.show(), 600);
  },

  // A tela é o site do Nium: o jardim com a lente no primeiro e no último passo, e o "tour"
  // (lista à esquerda, palco de vidro à direita) nos passos de escolha.
  show() {
    if (this.root) return;
    this.step = 0;
    const el = NiumSidebar.el.bind(NiumSidebar);
    if (!window.NiumGarden) {
      try {
        Services.scriptloader.loadSubScript("chrome://browser/content/nium/nium-garden.js", window);
      } catch (e) {}
    }
    this.gardenEl = el("div", { class: "nw-garden" });
    this.skipBtn = el("button", { class: "nw-ghost nw-skip", onclick: () => this.finish() });
    const mark = el("img", { class: "nw-brand-mark", src: "chrome://browser/content/nium/assets/img/mark.svg", alt: "" });
    // O jardim: a pedra com as ondas saindo e a lente de vidro
    this.soon = el("p", { class: "nw-soon" });
    this.title = el("h1", { tabindex: "-1" });
    this.lens = el("div", { class: "nw-lens" }, [this.soon, this.title]);
    this.heroBody = el("div", { class: "nw-hero-body" });
    const ripples = [0, 1, 2].map(() => el("span", { class: "nw-ripple", "aria-hidden": "true" }));
    this.hero = el("section", { class: "nw-hero" }, [el("div", { class: "nw-stone" }, [...ripples, this.lens]), this.heroBody]);
    // O tour: lista dos passos e o palco de vidro
    this.tourTitle = el("h2");
    this.tourLead = el("p", { class: "nw-tour-lead" });
    this.tourList = el("div", { class: "nw-tour-list", role: "tablist" });
    this.body = el("div", { class: "nw-body", "aria-live": "polite" });
    this.backBtn = el("button", { class: "nw-ghost", onclick: () => this.go(-1) });
    this.nextBtn = el("button", { class: "nw-primary", onclick: () => this.go(1) });
    this.tour = el("section", { class: "nw-tour" }, [
      el("div", { class: "nw-tour-side" }, [this.tourTitle, this.tourLead, this.tourList]),
      el("div", { class: "nw-stage" }, [
        el("div", { class: "nw-plate" }, [this.body, el("footer", { class: "nw-footer" }, [el("span", { class: "nw-spacer" }), this.backBtn, this.nextBtn])]),
      ]),
    ]);
    this.root = el("div", { id: "nium-welcome", role: "dialog", "aria-modal": "true" }, [
      this.gardenEl,
      el("header", { class: "nw-top" }, [el("div", { class: "nw-brand" }, [mark, el("span", { text: "nium" })]), this.skipBtn]),
      this.hero,
      this.tour,
    ]);
    this.root.addEventListener("keydown", e => {
      if (e.key === "Escape") this.finish();
    });
    (document.body || document.documentElement).appendChild(this.root);
    try {
      this.garden = window.NiumGarden?.mount(this.gardenEl, { lens: this.lens });
    } catch (e) {
      console.warn("Nium: ondas", e);
    }
    this.paint();
  },

  go(dir) {
    if (this.step === this.STEPS.length - 1 && dir > 0) {
      this.finish();
      return;
    }
    this.dir = dir;
    this.step = Math.max(0, Math.min(this.STEPS.length - 1, this.step + dir));
    this.paint();
  },

  finish() {
    Services.prefs.setBoolPref("nium.welcome.done", true);
    const root = this.root;
    this.root = null;
    if (!root) return;
    root.classList.add("nw-leaving");
    setTimeout(() => {
      this.garden?.stop();
      this.garden = null;
      root.remove();
    }, 420);
  },

  // O título se escreve sozinho e o ponto fica piscando, como no site.
  type(node, text) {
    const el = NiumSidebar.el.bind(NiumSidebar);
    const chars = [...text];
    const shown = el("span", { "aria-hidden": "true" }, chars.map((c, i) => {
      const span = el("span", { class: i === chars.length - 1 ? "nw-ch nw-dot" : "nw-ch", text: c });
      span.style.setProperty("--i", i);
      return span;
    }));
    node.classList.remove("nw-go");
    node.replaceChildren(el("span", { class: "nw-sr", text }), shown);
    node.setAttribute("aria-label", text);
    requestAnimationFrame(() => requestAnimationFrame(() => node.classList.add("nw-go")));
  },

  async paint() {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const name = this.STEPS[this.step];
    const last = this.step === this.STEPS.length - 1;
    const heroMode = this.step === 0 || last;
    const was = this.root.dataset.mode;
    this.root.dataset.mode = heroMode ? "hero" : "tour";
    this.skipBtn.textContent = t.skip;
    this.skipBtn.hidden = last;
    if (heroMode) {
      if (was !== "hero" || this.lastHero !== this.step) {
        this.soon.textContent = this.step === 0 ? t.heroSoon : t.doneSoon;
        this.type(this.title, this.step === 0 ? t.heroTitle : t.doneTitle2);
        this.lastHero = this.step;
      }
      const go = el("button", { class: "nw-primary nw-pill", text: this.step === 0 ? t.start : t.finish, onclick: () => this.go(1) });
      const parts = await (this.step === 0 ? this.step_welcome() : this.step_done());
      this.heroBody.replaceChildren(go, ...parts);
      this.garden?.setLens(this.lens);
      return;
    }
    this.garden?.setLens(null);
    this.tourTitle.textContent = t.tourTitle;
    this.tourLead.textContent = t.tourLead;
    const leads = { look: t.lookText, search: t.searchText, privacy: t.privacyText, ai: t.aiText, access: t.accessText };
    const items = this.STEPS.slice(1, -1).map((stepName, k) => {
      const index = k + 1;
      const on = index === this.step;
      const tab = el("button", { class: "nw-tour-tab", role: "tab", "aria-selected": String(on) }, [
        el("strong", { text: t.titles[index] }),
        el("span", { class: "nw-tour-more" }, [el("span", { text: leads[stepName] })]),
      ]);
      tab.addEventListener("click", () => {
        this.dir = index > this.step ? 1 : -1;
        this.step = index;
        this.paint();
      });
      return tab;
    });
    this.tourList.replaceChildren(...items);
    this.backBtn.textContent = t.back;
    this.nextBtn.textContent = t.next;
    this.body.classList.remove("nw-in-next", "nw-in-back");
    this.body.replaceChildren(...(await this[`step_${name}`]()));
    void this.body.offsetWidth;
    this.body.classList.add(this.dir < 0 ? "nw-in-back" : "nw-in-next");
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

  head() {
    // O título e o texto de cada passo ficam na lista do tour, à esquerda.
    return [];
  },

  // ---- passos ----
  async step_welcome() {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const names = { "pt-BR": "Português", "en-US": "English", "es-ES": "Español", es: "Español" };
    const available = Services.locale.availableLocales.filter(l => names[l]);
    if (available.length < 2) return [];
    const current = Services.locale.appLocaleAsBCP47;
    // Idiomas em texto, embaixo do botão, como os links do site.
    return [
      el(
        "div",
        { class: "nw-langs", role: "group", "aria-label": t.language },
        available.map(l => {
          const b = el("button", { class: "nw-lang" + (current === l ? " on" : ""), "aria-pressed": String(current === l), text: names[l] });
          b.addEventListener("click", () => {
            Services.locale.requestedLocales = [l];
            this.lastHero = null;
            this.paint();
          });
          return b;
        })
      ),
    ];
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
    const importBtn = el("button", { class: "nw-secondary nw-pill", text: t.import });
    importBtn.addEventListener("click", () => {
      try {
        const { MigrationUtils } = ChromeUtils.importESModule("resource:///modules/MigrationUtils.sys.mjs");
        MigrationUtils.showMigrationWizard(window, {});
      } catch (e) {
        console.error("Nium: importar", e);
      }
    });
    return [importBtn, el("p", { class: "nw-hint", text: t.tip })];
  },
};
