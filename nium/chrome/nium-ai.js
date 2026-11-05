/* Nium AI: assistente de leitura com IA local (Ollama), como no Nium Electron. MPL-2.0
 *
 * Resumir a página, perguntar sobre ela (respostas citam os trechos de onde vieram), explicar ou
 * traduzir uma seleção (clique direito) e conversar. Tudo roda no Ollama deste computador: o texto
 * da página não sai da máquina. Abre no painel à direita (ver nium-sidebar.js), pelo botão
 * "Nium AI" na barra de cima ou por Ctrl+Alt+A.
 */
"use strict";

var NiumAI = {
  S: { status: null, checkedAt: 0, checking: null, entries: [], run: null, pull: null, draft: "", usePage: true },

  STRINGS: {
    en: {
      title: "Nium AI",
      introTitle: "Read faster. Understand better.",
      introText: "AI that runs on your computer. What you read stays with you.",
      searching: "Looking for Ollama on this computer…",
      connectTitle: "Connect the local AI",
      connectText: "Nium uses Ollama, a free app that runs AI on your computer. Nothing you read leaves your machine.",
      steps: ["Download and install Ollama.", "Open Ollama and leave it open.", "Come back here and click Check again."],
      getOllama: "Download Ollama",
      recheck: "Check again",
      needModelTitle: "Just one model to go",
      needModelText: "Ollama is open. Download a light model to start; you only do this once.",
      download: "Download",
      cancel: "Cancel",
      installed: "Installed",
      downloading: "Downloading the model",
      summarize: "Summarize this page",
      summarizeHelp: "The main points, with the passages they came from.",
      ask: "Ask about the page",
      askHelp: "Answers only with what is written on it.",
      hint: "Select text on the page and right-click to explain or translate it.",
      placeholderPage: "Ask something about this page…",
      placeholder: "Ask anything…",
      usePage: "Use the current page",
      send: "Send",
      stop: "Stop",
      model: "Local model",
      answerIn: "Answer in",
      mayErr: "Answers may contain mistakes.",
      clear: "Clear conversation",
      copy: "Copy",
      copied: "Copied",
      thinking: "Thinking…",
      tasks: { summary: "Page summary", ask: "Question about the page", explain: "Explanation of the passage", translate: "Translation of the passage", chat: "Chat" },
      noPage: "Open a website to use the page.",
      emptyPage: "This page has no text the AI can read.",
      busy: "Wait for the current answer to finish or click Stop.",
      explainMenu: "Explain with Nium AI",
      translateMenu: "Translate with Nium AI",
      chooseTitle: "Choose how the AI runs",
      chooseText: "It runs on this computer: what you read never leaves it. The model downloads once.",
      light: "Light",
      lightHelp: "Fast, simpler answers. Good for older computers.",
      standard: "Standard",
      standardHelp: "Better answers. Needs more memory.",
      advanced: "Advanced: use Ollama",
      advancedHelp: "Larger models you install yourself in the free Ollama app.",
      use: "Use",
      inBrowser: "in Nium",
      downloadingLocal: "Downloading the AI model (only the first time)",
      loadingLocal: "Starting the AI…",
      engine: "AI",
      errors: {
        OFFLINE: "Ollama is not open on this computer. Install or open Ollama and try again.",
        NO_MODEL: "Choose a local model below.",
        NO_MEMORY: "The computer doesn't have free memory for this model. Try a lighter model.",
        MODEL_ERROR: "The local model returned an error.",
        EMPTY: "The model returned an empty answer.",
        TimeoutError: "The local model took too long. Try a smaller passage or a lighter model.",
        AbortError: "Answer stopped.",
      },
    },
    pt: {
      title: "Nium AI",
      introTitle: "Leia mais rápido. Entenda melhor.",
      introText: "IA que roda no seu computador. O que você lê fica com você.",
      searching: "Procurando o Ollama neste computador…",
      connectTitle: "Conecte a IA local",
      connectText: "O Nium usa o Ollama, um app gratuito que roda a IA no seu computador. Nada do que você lê sai da sua máquina.",
      steps: ["Baixe e instale o Ollama.", "Abra o Ollama e deixe-o aberto.", "Volte aqui e clique em Verificar de novo."],
      getOllama: "Baixar o Ollama",
      recheck: "Verificar de novo",
      needModelTitle: "Falta só um modelo",
      needModelText: "O Ollama está aberto. Baixe um modelo leve para começar; isso é feito uma vez só.",
      download: "Baixar",
      cancel: "Cancelar",
      installed: "Instalado",
      downloading: "Baixando o modelo",
      summarize: "Resumir esta página",
      summarizeHelp: "Os pontos principais, com os trechos de onde vieram.",
      ask: "Perguntar sobre a página",
      askHelp: "Respostas só com o que está escrito nela.",
      hint: "Selecione um trecho na página e clique com o botão direito para explicar ou traduzir.",
      placeholderPage: "Pergunte algo sobre esta página…",
      placeholder: "Pergunte qualquer coisa…",
      usePage: "Usar a página atual",
      send: "Enviar",
      stop: "Parar",
      model: "Modelo local",
      answerIn: "Responder em",
      mayErr: "Respostas podem conter erros.",
      clear: "Limpar conversa",
      copy: "Copiar",
      copied: "Copiado",
      thinking: "Pensando…",
      tasks: { summary: "Resumo da página", ask: "Pergunta sobre a página", explain: "Explicação do trecho", translate: "Tradução do trecho", chat: "Conversa" },
      noPage: "Abra um site para usar a página.",
      emptyPage: "Esta página não tem texto que a IA consiga ler.",
      busy: "Aguarde a resposta atual terminar ou clique em Parar.",
      explainMenu: "Explicar com o Nium AI",
      translateMenu: "Traduzir com o Nium AI",
      chooseTitle: "Escolha como a IA roda",
      chooseText: "Ela roda neste computador: o que você lê não sai dele. O modelo é baixado uma vez só.",
      light: "Leve",
      lightHelp: "Rápida, respostas mais simples. Boa para computadores mais antigos.",
      standard: "Padrão",
      standardHelp: "Respostas melhores. Precisa de mais memória.",
      advanced: "Avançado: usar o Ollama",
      advancedHelp: "Modelos maiores que você instala no app gratuito Ollama.",
      use: "Usar",
      inBrowser: "no Nium",
      downloadingLocal: "Baixando o modelo de IA (só na primeira vez)",
      loadingLocal: "Iniciando a IA…",
      engine: "IA",
      errors: {
        OFFLINE: "O Ollama não está aberto neste computador. Instale ou abra o Ollama e tente de novo.",
        NO_MODEL: "Escolha um modelo local aqui embaixo.",
        NO_MEMORY: "O computador não tem memória livre para este modelo. Tente um modelo mais leve.",
        MODEL_ERROR: "O modelo local retornou um erro.",
        EMPTY: "O modelo retornou uma resposta vazia.",
        TimeoutError: "O modelo local demorou demais para responder. Tente um trecho menor ou um modelo mais leve.",
        AbortError: "Resposta interrompida.",
      },
    },
  },
  LANGS: [["pt-BR", "Português"], ["en", "English"], ["es", "Español"]],

  get t() {
    return NiumSidebar.t === NiumSidebar.STRINGS.pt ? this.STRINGS.pt : this.STRINGS.en;
  },

  init() {
    if (this.lib) return;
    this.lib = ChromeUtils.importESModule("chrome://browser/content/nium/ai/reading-ai.mjs", { global: "current" });
    this.ollama = ChromeUtils.importESModule("chrome://browser/content/nium/ai/ollama.mjs", { global: "current" });
    this.local = ChromeUtils.importESModule("chrome://browser/content/nium/ai/local.mjs", { global: "current" });
    try {
      ChromeUtils.registerWindowActor("NiumPage", {
        parent: { esModuleURI: "chrome://browser/content/nium/NiumPageParent.sys.mjs" },
        child: { esModuleURI: "chrome://browser/content/nium/NiumPageChild.sys.mjs" },
        matches: ["http://*/*", "https://*/*", "file:///*"],
        allFrames: false,
      });
    } catch (e) {
      if (e.name !== "NotSupportedError") console.error("Nium: registro de ator", e);
    }
    this.takeOverKey();
    this.createButton();
    this.addContextMenu();
  },

  // ---- preferências ----
  // nium.ai.engine: "local:light" | "local:standard" (no próprio Nium) | "ollama" (modelo em nium.ai.model)
  get engine() {
    return Services.prefs.getStringPref("nium.ai.engine", "");
  },
  set engine(v) {
    Services.prefs.setStringPref("nium.ai.engine", v);
  },
  get localSize() {
    const e = this.engine;
    return e.startsWith("local:") ? e.slice(6) : null;
  },
  get model() {
    return Services.prefs.getStringPref("nium.ai.model", "");
  },
  set model(v) {
    Services.prefs.setStringPref("nium.ai.model", v);
  },
  get lang() {
    const saved = Services.prefs.getStringPref("nium.ai.lang", "");
    if (saved) return saved;
    const sys = (Services.locale.regionalPrefsLocales[0] || Services.locale.appLocaleAsBCP47 || "en").toLowerCase();
    return sys.startsWith("pt") ? "pt-BR" : sys.startsWith("es") ? "es" : "en";
  },
  set lang(v) {
    Services.prefs.setStringPref("nium.ai.lang", v);
  },

  ready() {
    if (this.localSize && this.local.LOCAL_MODELS[this.localSize]) return true;
    if (this.engine !== "ollama") return false;
    const st = this.S.status;
    return !!(st?.reachable && st.models.length && st.models.includes(this.model));
  },

  // ---- entradas: botão, atalho, clique direito ----
  open() {
    if (NiumSidebar.openPanelName !== "ai") NiumSidebar.togglePanel("ai");
  },

  takeOverKey() {
    const key = document.getElementById("viewGenaiChatSidebarKb");
    const set = document.getElementById("mainCommandSet");
    if (!key || !set || document.getElementById("nium-cmd-ai")) return;
    const cmd = document.createXULElement("command");
    cmd.id = "nium-cmd-ai";
    cmd.addEventListener("command", () => NiumSidebar.togglePanel("ai"));
    set.appendChild(cmd);
    key.setAttribute("command", cmd.id);
    key.removeAttribute("oncommand");
  },

  createButton() {
    if (CustomizableUI.getWidget("nium-ai-button")?.provider === CustomizableUI.PROVIDER_API) return;
    try {
      CustomizableUI.createWidget({
        id: "nium-ai-button",
        type: "button",
        label: "Nium AI",
        tooltiptext: "Nium AI",
        defaultArea: CustomizableUI.AREA_NAVBAR,
        onCommand(event) {
          event.target.ownerGlobal.NiumSidebar.togglePanel("ai");
        },
      });
    } catch (e) {
      console.error("Nium: botão Nium AI", e);
    }
  },

  addContextMenu() {
    const menu = document.getElementById("contentAreaContextMenu");
    if (!menu || document.getElementById("nium-ai-explain")) return;
    const make = (id, label, task) => {
      const item = document.createXULElement("menuitem");
      item.id = id;
      item.setAttribute("label", label);
      item.addEventListener("command", () => {
        const text = (gContextMenu?.selectionInfo?.fullText || gContextMenu?.textSelected || "").trim();
        if (text) this.start(task, { selection: text.slice(0, 4000) });
      });
      return item;
    };
    const t = this.t;
    const sep = document.createXULElement("menuseparator");
    sep.id = "nium-ai-separator";
    const explain = make("nium-ai-explain", t.explainMenu, "explain");
    const translate = make("nium-ai-translate", t.translateMenu, "translate");
    const anchor = document.getElementById("context-searchselect");
    if (anchor) anchor.after(sep, explain, translate);
    else menu.append(sep, explain, translate);
    menu.addEventListener("popupshowing", e => {
      if (e.target !== menu) return;
      const show = !!gContextMenu?.isTextSelected;
      for (const el of [sep, explain, translate]) el.hidden = !show;
    });
  },

  // ---- estado do Ollama ----
  async refreshStatus(force = false) {
    const S = this.S;
    if (S.checking) return S.checking;
    if (!force && S.status && Date.now() - S.checkedAt < 15000) return S.status;
    S.checking = (async () => {
      S.status = await this.ollama.status();
      S.checkedAt = Date.now();
      S.checking = null;
      if (S.status.reachable && S.status.models.length && !S.status.models.includes(this.model)) {
        this.model = this.lib.preferredModel(S.status.models);
      }
      this.rerender();
      return S.status;
    })();
    return S.checking;
  },

  async pullModel(name) {
    const S = this.S;
    if (S.pull) return;
    const controller = new AbortController();
    S.pull = { name, percent: null, controller };
    this.rerender();
    try {
      await this.ollama.pull({
        name,
        signal: controller.signal,
        onProgress: percent => {
          if (S.pull) S.pull.percent = percent;
          this.updatePull();
        },
      });
      this.model = name;
    } catch (e) {
      if (e.name !== "AbortError") Services.prompt.alert(window, "Nium AI", String(e.message));
    } finally {
      S.pull = null;
      await this.refreshStatus(true);
    }
  },

  // ---- tarefas ----
  async pageArticle() {
    const browser = gBrowser.selectedBrowser;
    const spec = browser.currentURI?.spec || "";
    if (!/^(https?|file):/.test(spec)) return null;
    const actor = browser.browsingContext?.currentWindowGlobal?.getActor("NiumPage");
    return actor ? actor.sendQuery("Nium:Extract") : null;
  },

  async start(task, { selection = "", question = "" } = {}) {
    const S = this.S;
    const t = this.t;
    this.open();
    if (S.run) {
      this.flash(t.busy);
      return;
    }
    if (this.engine === "ollama") await this.refreshStatus();
    if (!this.ready()) {
      this.rerender();
      return;
    }
    const entry = { id: Date.now() + Math.random(), task, selection, question, lang: this.lang, answer: "", citations: [], done: false };
    S.entries.push(entry);
    const controller = new AbortController();
    S.run = { entry, controller };
    this.rerender();
    try {
      const includePage = task !== "chat" || (S.usePage && this.isWebPage());
      let article = null;
      let chosen = [];
      if (includePage) {
        article = await this.pageArticle();
        if (!article && task !== "chat") throw new Error(t.noPage);
        if (article) {
          const list = this.lib.passages(article);
          if (!list.length && task !== "chat") throw new Error(t.emptyPage);
          chosen = this.lib.choose(list, { task: task === "chat" ? "ask" : task, question, selection });
        }
      }
      const history =
        task === "chat"
          ? S.entries
              .filter(x => x.done && !x.error && x !== entry)
              .slice(-3)
              .flatMap(x => [
                { role: "user", content: x.question || t.tasks[x.task] },
                { role: "assistant", content: x.answer },
              ])
          : [];
      const messages = this.lib.messages({
        task,
        lang: entry.lang,
        target: entry.lang,
        question,
        selection,
        title: article?.title || "",
        chosen,
        history,
      });
      const onToken = text => {
        entry.progress = null;
        entry.answer = this.lib.cleanAnswer(text);
        this.updateEntry(entry);
      };
      let raw;
      if (this.localSize) {
        entry.progress = { text: t.loadingLocal };
        this.updateEntry(entry);
        raw = await this.local.chat({
          size: this.localSize,
          messages,
          signal: controller.signal,
          onToken,
          onDownload: percent => {
            entry.progress = { text: t.downloadingLocal, percent };
            this.updateEntry(entry);
          },
        });
      } else {
        raw = await this.ollama.chat({ model: this.model, messages, signal: controller.signal, onToken });
      }
      const result = this.lib.citations(raw, chosen);
      Object.assign(entry, { answer: result.answer, citations: result.citations, done: true });
    } catch (e) {
      entry.done = true;
      const key = e.offline ? "OFFLINE" : e.name === "AbortError" || e.name === "TimeoutError" ? e.name : e.message;
      entry.error = t.errors[key] || String(e.message || e);
      if (e.name === "AbortError" && entry.answer) entry.error = "";
      if (e.offline) this.S.status = null;
    } finally {
      S.run = null;
      this.rerender();
    }
  },

  isWebPage() {
    return /^(https?|file):/.test(gBrowser.selectedBrowser.currentURI?.spec || "");
  },

  stop() {
    this.S.run?.controller.abort();
  },

  flash(text) {
    if (!this.body) return;
    const p = NiumSidebar.el("p", { class: "nium-panel-message", role: "alert", text });
    this.body.prepend(p);
    setTimeout(() => p.remove(), 4000);
  },

  // ---- interface no painel ----
  render(body) {
    this.body = body;
    if (this.engine === "ollama" && (!this.S.status || Date.now() - this.S.checkedAt > 15000)) this.refreshStatus();
    this.rerender();
  },

  rerender() {
    const body = this.body;
    if (!body || NiumSidebar.openPanelName !== "ai") return;
    const field = body.querySelector(".nium-ai-prompt");
    if (field) this.S.draft = field.value;
    const focused = field && field.ownerDocument.activeElement === field;
    const atBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 40;
    body.textContent = "";
    body.append(...this.build());
    if (focused) body.querySelector(".nium-ai-prompt")?.focus();
    if (atBottom) body.scrollTop = body.scrollHeight;
  },

  build() {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const icon = NiumSidebar.icon.bind(NiumSidebar);
    const S = this.S;
    const out = [];
    const ready = this.ready();
    const busy = !!S.run;
    const page = this.isWebPage();

    if (!S.entries.length) {
      out.push(
        el("div", { class: "nium-ai-intro" }, [
          el("span", { class: "nium-ai-orb" }, [icon("chrome://global/skin/icons/highlights.svg")]),
          el("h3", { text: t.introTitle }),
          el("p", { text: t.introText }),
        ])
      );
    }

    if (!ready) out.push(this.buildSetup());

    if (ready) {
      const action = (label, help, iconUrl, onclick) => {
        const b = el("button", { class: "nium-ai-action", onclick }, [
          icon(iconUrl),
          el("span", {}, [el("strong", { text: label }), el("small", { text: help })]),
        ]);
        if (!page || busy) b.disabled = true;
        return b;
      };
      out.push(
        el("div", { class: "nium-ai-quick" }, [
          action(t.summarize, t.summarizeHelp, "chrome://browser/skin/reader-mode.svg", () => this.start("summary")),
          action(t.ask, t.askHelp, "chrome://global/skin/icons/search-glass.svg", () => {
            S.usePage = true;
            this.body?.querySelector(".nium-ai-prompt")?.focus();
          }),
        ]),
        el("p", { class: "nium-ai-hint" }, [icon("chrome://global/skin/icons/info.svg"), el("span", { text: t.hint })])
      );
    }

    out.push(el("div", { class: "nium-ai-entries" }, S.entries.map(e => this.buildEntry(e))));

    if (S.entries.length && !busy) {
      out.push(
        el("button", { class: "nium-ai-clear", onclick: () => { S.entries = []; this.rerender(); } }, [
          icon("chrome://global/skin/icons/delete.svg"),
          el("span", { text: t.clear }),
        ])
      );
    }

    if (ready) out.push(this.buildForm(page, busy));
    return out;
  },

  buildChooser() {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const option = (title, size, help, onclick, primary) =>
      el("button", { class: "nium-ai-action" + (primary ? " nium-ai-recommended" : ""), onclick }, [
        el("span", {}, [
          el("strong", { text: size ? `${title} · ${size}` : title }),
          el("small", { text: help }),
        ]),
      ]);
    const M = this.local.LOCAL_MODELS;
    return el("div", { class: "nium-ai-setup" }, [
      el("strong", { text: t.chooseTitle }),
      el("p", { text: t.chooseText }),
      option(t.light, M.light.size, t.lightHelp, () => this.choose("local:light")),
      option(t.standard, M.standard.size, t.standardHelp, () => this.choose("local:standard"), true),
      option(t.advanced, "", t.advancedHelp, () => this.choose("ollama")),
    ]);
  },

  choose(engine) {
    this.engine = engine;
    if (engine === "ollama") this.refreshStatus(true);
    else this.local.dispose();
    this.rerender();
  },

  buildSetup() {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const icon = NiumSidebar.icon.bind(NiumSidebar);
    if (!this.engine) return this.buildChooser();
    const st = this.S.status;
    if (!st) return el("div", { class: "nium-ai-setup" }, [el("p", { class: "nium-panel-message", text: t.searching })]);
    if (!st.reachable) {
      return el("div", { class: "nium-ai-setup" }, [
        el("strong", { text: t.connectTitle }),
        el("p", { text: t.connectText }),
        el("ol", {}, t.steps.map(s => el("li", { text: s }))),
        el("div", { class: "nium-button-row" }, [
          el("button", { class: "nium-secondary-button", onclick: () => openTrustedLinkIn("https://ollama.com/download", "tab") }, [
            el("span", { text: t.getOllama }),
          ]),
          el("button", { class: "nium-primary-button", onclick: () => this.refreshStatus(true) }, [el("span", { text: t.recheck })]),
        ]),
      ]);
    }
    // Ollama aberto, mas sem modelo (ou o escolhido sumiu): modelos recomendados para baixar.
    const rows = st.recommended.map(r => {
      const installed = st.models.includes(r.name);
      const pulling = this.S.pull?.name === r.name;
      const button = installed
        ? el("span", { class: "nium-ai-badge", text: t.installed })
        : pulling
          ? el("button", { class: "nium-secondary-button", onclick: () => this.S.pull?.controller.abort() }, [el("span", { text: t.cancel })])
          : el("button", { class: "nium-secondary-button", onclick: () => this.pullModel(r.name) }, [el("span", { text: t.download })]);
      if (!installed && !pulling && this.S.pull) button.disabled = true;
      const row = el("div", { class: "nium-ai-model" }, [
        el("span", { class: "nium-ai-model-text" }, [el("strong", { text: r.name }), el("small", { text: `${r.note} · ${r.size}` })]),
        button,
      ]);
      if (pulling) {
        const bar = el("span", { class: "nium-ai-bar" }, [el("span", { class: "nium-ai-bar-fill" })]);
        const label = el("small", { class: "nium-ai-pull-label", text: t.downloading });
        this.pullUI = { bar, label };
        this.updatePull();
        return el("div", {}, [row, el("div", { class: "nium-ai-pull" }, [bar, label])]);
      }
      return row;
    });
    return el("div", { class: "nium-ai-setup" }, [el("strong", { text: t.needModelTitle }), el("p", { text: t.needModelText }), ...rows]);
  },

  updatePull() {
    const p = this.S.pull;
    if (!p || !this.pullUI) return;
    this.pullUI.bar.firstChild.style.width = `${p.percent ?? 0}%`;
    this.pullUI.label.textContent = `${this.t.downloading}${p.percent == null ? "" : ` ${p.percent}%`}`;
  },

  buildForm(page, busy) {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const S = this.S;
    const area = el("textarea", {
      class: "nium-ai-prompt nium-input",
      rows: "2",
      maxlength: "6000",
      placeholder: S.usePage && page ? t.placeholderPage : t.placeholder,
      "aria-label": t.ask,
    });
    area.value = S.draft;
    const use = el("input", { type: "checkbox" });
    use.checked = S.usePage && page;
    use.disabled = !page;
    use.addEventListener("change", () => {
      S.usePage = use.checked;
      area.placeholder = use.checked ? t.placeholderPage : t.placeholder;
    });
    const send = () => {
      const q = area.value.trim();
      if (!q || S.run) return;
      S.draft = "";
      this.start(S.usePage && page ? "ask" : "chat", { question: q });
    };
    area.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
    const button = busy
      ? el("button", { class: "nium-secondary-button", onclick: () => this.stop() }, [el("span", { text: t.stop })])
      : el("button", { class: "nium-primary-button", onclick: send }, [el("span", { text: t.send })]);

    // Uma lista só: os dois modelos do Nium e, se o Ollama estiver aberto, os modelos dele.
    const modelSelect = el("select", { class: "nium-select", "aria-label": t.model });
    const M = this.local.LOCAL_MODELS;
    modelSelect.append(
      el("option", { value: "local:light", text: `${t.light} (${t.inBrowser})` }),
      el("option", { value: "local:standard", text: `${t.standard} (${t.inBrowser})` })
    );
    for (const m of this.S.status?.models || []) modelSelect.append(el("option", { value: "ollama:" + m, text: "Ollama · " + m }));
    if (this.engine === "ollama" && !(this.S.status?.models || []).includes(this.model) && this.model) {
      modelSelect.append(el("option", { value: "ollama:" + this.model, text: "Ollama · " + this.model }));
    }
    modelSelect.value = this.localSize ? this.engine : "ollama:" + this.model;
    modelSelect.addEventListener("change", () => {
      const v = modelSelect.value;
      if (v.startsWith("ollama:")) {
        this.model = v.slice(7);
        this.engine = "ollama";
      } else {
        this.engine = v;
        this.local.dispose();
      }
    });
    if (!this.S.status) this.refreshStatus(); // descobre os modelos do Ollama, se ele estiver aberto
    const langSelect = el("select", { class: "nium-select", "aria-label": t.answerIn });
    for (const [v, label] of this.LANGS) langSelect.append(el("option", { value: v, text: label }));
    langSelect.value = this.lang;
    langSelect.addEventListener("change", () => (this.lang = langSelect.value));

    return el("div", { class: "nium-ai-form" }, [
      area,
      el("div", { class: "nium-ai-form-row" }, [el("label", { class: "nium-ai-toggle" }, [use, el("span", { text: t.usePage })]), button]),
      el("div", { class: "nium-ai-foot" }, [
        el("label", {}, [el("span", { text: t.engine }), modelSelect]),
        el("label", {}, [el("span", { text: t.answerIn }), langSelect]),
      ]),
      el("p", { class: "nium-ai-small", text: t.mayErr }),
    ]);
  },

  buildEntry(entry) {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    const icon = NiumSidebar.icon.bind(NiumSidebar);
    const head = el("div", { class: "nium-ai-entry-head" }, [
      el("strong", { text: t.tasks[entry.task] || entry.task }),
    ]);
    const quote = entry.question || entry.selection;
    const body = el("div", { class: "nium-ai-answer" });
    const node = el("article", { class: "nium-ai-entry", "data-id": String(entry.id) }, [
      head,
      ...(quote ? [el("p", { class: "nium-ai-quote", text: quote.slice(0, 400) })] : []),
      body,
    ]);
    this.fillAnswer(entry, body);
    if (entry.done && !entry.error && entry.answer) {
      const copy = el("button", { class: "nium-icon-button", title: t.copy }, [icon("chrome://global/skin/icons/edit-copy.svg")]);
      copy.addEventListener("click", () => {
        const plain = entry.answer.replace(/\[(\d{1,3})\]/g, "").replace(/\*\*(.+?)\*\*/g, "$1").trim();
        Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(plain);
        copy.title = t.copied;
      });
      head.append(copy);
    }
    return node;
  },

  updateEntry(entry) {
    const body = this.body?.querySelector(`.nium-ai-entry[data-id="${CSS.escape(String(entry.id))}"] .nium-ai-answer`);
    if (body) this.fillAnswer(entry, body);
  },

  // Texto da resposta com listas, **negrito** e citações [n] que mostram o trecho da página.
  fillAnswer(entry, box) {
    const t = this.t;
    const el = NiumSidebar.el.bind(NiumSidebar);
    box.textContent = "";
    if (entry.error) {
      box.append(el("p", { class: "nium-ai-error", text: entry.error }));
      return;
    }
    if (!entry.answer) {
      const p = entry.progress;
      box.append(el("p", { class: "nium-ai-thinking", text: p ? p.text + (p.percent != null ? ` ${p.percent}%` : "") : t.thinking }));
      if (p?.percent != null) {
        const bar = el("span", { class: "nium-ai-bar" }, [el("span", { class: "nium-ai-bar-fill" })]);
        bar.firstChild.style.width = `${p.percent}%`;
        box.append(bar);
      }
      return;
    }
    const byN = new Map((entry.citations || []).map(c => [c.n, c]));
    const excerpt = el("blockquote", { class: "nium-ai-excerpt", hidden: "true" });
    const inline = text => {
      const parts = [];
      for (const piece of text.split(/(\*\*[^*]+\*\*|\[\d{1,3}\])/g)) {
        if (!piece) continue;
        const bold = piece.match(/^\*\*([^*]+)\*\*$/);
        const cite = piece.match(/^\[(\d{1,3})\]$/);
        if (bold) parts.push(el("strong", { text: bold[1] }));
        else if (cite && byN.has(Number(cite[1]))) {
          const c = byN.get(Number(cite[1]));
          const b = el("button", { class: "nium-ai-cite", title: c.text.slice(0, 300), text: cite[1] });
          b.addEventListener("click", () => {
            const same = !excerpt.hidden && excerpt.dataset.n === cite[1];
            excerpt.hidden = same;
            excerpt.dataset.n = cite[1];
            excerpt.textContent = c.text;
          });
          parts.push(b);
        } else if (cite && entry.done) {
          continue; // citação para um trecho que a IA não recebeu
        } else parts.push(document.createTextNode(piece));
      }
      return parts;
    };
    let list = null;
    for (const raw of entry.answer.split("\n")) {
      const line = raw.trim();
      if (!line) {
        list = null;
        continue;
      }
      const bullet = line.match(/^[-*•]\s+(.*)$/);
      if (bullet) {
        if (!list) box.append((list = el("ul")));
        list.append(el("li", {}, inline(bullet[1])));
      } else {
        list = null;
        box.append(el("p", {}, inline(line.replace(/^#+\s*/, ""))));
      }
    }
    box.append(excerpt);
  },
};
