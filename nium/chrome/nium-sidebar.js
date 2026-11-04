/* Nium: barra lateral do Nium Electron (espaços, buscar abas, Nium Shield, seu espaço). MPL-2.0
 *
 * Roda em cada janela do navegador. Coloca os blocos do Nium em volta da lista de abas
 * da barra lateral do Firefox; quando a lateral está recolhida, eles somem (CSS).
 */
"use strict";

var NiumSidebar = {
  HTML: "http://www.w3.org/1999/xhtml",
  SPACES_FILE: "nium-spaces.json",
  MAX_SPACES: 100,
  MAX_TABS: 50,
  currentSpace: null,

  init() {
    if (!window.toolbar.visible) {
      return; // janelas de pop-up não têm barra lateral
    }
    const main = document.querySelector("sidebar-main");
    if (!main || document.getElementById("nium-sidebar-top")) {
      return;
    }
    // Slots próprios do Nium dentro da barra lateral (ver sidebar-main.mjs): ficam fora da
    // área personalizável das abas, então o Firefox não os remove ao reabrir.
    const top = this.buildTop();
    top.setAttribute("slot", "nium-top");
    const bottom = this.buildBottom();
    bottom.setAttribute("slot", "nium-bottom");
    main.append(top, bottom);
  },

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

  // ---- topo: logo, espaço atual, buscar abas, "Your tabs" ----
  buildTop() {
    const mark = this.el("span", { class: "nium-mark" });
    mark.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4.5 11.5v-7l7 7v-7"/></svg>';
    const brand = this.el("div", { class: "nium-brand" }, [
      mark,
      this.el("span", { class: "nium-wordmark", text: "nium." }),
    ]);
    this.spaceName = this.el("span", { class: "nium-sb-text", text: "Personal space" });
    const picker = this.el(
      "button",
      { class: "nium-space-picker", title: "Spaces", onclick: e => this.openSpacesMenu(e.currentTarget) },
      [this.el("span", { class: "nium-space-icon" }, [this.icon("chrome://global/skin/icons/folder.svg")]), this.spaceName]
    );
    const kbd = this.el("kbd", { text: this.shortcutText("key_searchTabs") });
    const search = this.el(
      "button",
      {
        class: "nium-sb-search",
        title: "Search tabs",
        onclick: () => document.getElementById("Browser:SearchTabs")?.doCommand(),
      },
      [this.icon("chrome://global/skin/icons/search-glass.svg"), this.el("span", { class: "nium-sb-text", text: "Search tabs" }), kbd]
    );
    // O atalho pode mudar em about:keyboard: atualiza ao passar o mouse.
    search.addEventListener("mouseenter", () => (kbd.textContent = this.shortcutText("key_searchTabs")));
    const label = this.el("div", { class: "nium-section-label", text: "Your tabs" });
    return this.el("div", { id: "nium-sidebar-top", class: "nium-sb-block" }, [brand, picker, search, label]);
  },

  // ---- rodapé: Nium Shield e Seu espaço ----
  buildBottom() {
    const shield = this.el(
      "button",
      { class: "nium-sb-row", title: "Tracker and pop-up protection", onclick: () => this.openShield() },
      [
        this.icon("chrome://browser/skin/tracking-protection.svg"),
        this.el("span", { class: "nium-sb-text", text: "Nium Shield" }),
        this.el("span", { class: "nium-shield-dot" }),
      ]
    );
    const you = this.el(
      "button",
      { class: "nium-sb-row", title: "Settings", onclick: () => openPreferences() },
      [
        this.el("span", { class: "nium-avatar", text: "N" }),
        this.el("span", { class: "nium-sb-text", text: "Your space" }),
        this.icon("chrome://global/skin/icons/settings.svg"),
      ]
    );
    return this.el("div", { id: "nium-sidebar-bottom", class: "nium-sb-block" }, [shield, you]);
  },

  openShield() {
    // O painel de proteção do site atual; se não der, o painel completo de proteções.
    try {
      gProtectionsHandler.showProtectionsPopup({});
    } catch (e) {
      openTrustedLinkIn("about:protections", "tab");
    }
  },

  // ---- espaços: conjuntos de abas guardados (como no Nium Electron) ----
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

  async openSpacesMenu(anchor) {
    const spaces = await this.readSpaces();
    const popup = document.createXULElement("menupopup");
    popup.id = "nium-spaces-popup";
    const add = (parent, label, oncommand, opts = {}) => {
      const item = document.createXULElement("menuitem");
      item.setAttribute("label", label);
      if (opts.disabled) item.setAttribute("disabled", "true");
      if (opts.checked) {
        item.setAttribute("type", "checkbox");
        item.setAttribute("checked", "true");
      }
      item.addEventListener("command", oncommand);
      parent.appendChild(item);
      return item;
    };
    const isPrivate = PrivateBrowsingUtils.isWindowPrivate(window);
    add(popup, "Save open tabs as a space…", () => this.saveSpace(), { disabled: isPrivate });
    if (spaces.length) {
      popup.appendChild(document.createXULElement("menuseparator"));
    }
    spaces.forEach((space, index) => {
      const menu = document.createXULElement("menu");
      menu.setAttribute("label", `${space.name}  ·  ${space.tabs.length}`);
      if (space.name === this.currentSpace) {
        menu.setAttribute("label", `✓ ${space.name}  ·  ${space.tabs.length}`);
      }
      const sub = document.createXULElement("menupopup");
      add(sub, "Open", () => this.openSpace(space));
      add(sub, "Update with open tabs", () => this.updateSpace(index), { disabled: isPrivate });
      add(sub, "Rename…", () => this.renameSpace(index));
      sub.appendChild(document.createXULElement("menuseparator"));
      add(sub, "Delete", () => this.deleteSpace(index));
      menu.appendChild(sub);
      popup.appendChild(menu);
    });
    popup.addEventListener("popuphidden", e => {
      if (e.target === popup) popup.remove();
    });
    document.getElementById("mainPopupSet").appendChild(popup);
    popup.openPopup(anchor, "after_start", 0, 4);
  },

  askName(title, value) {
    const result = { value };
    const ok = Services.prompt.prompt(window, title, "Name:", result, null, {});
    const name = ok ? String(result.value || "").trim().slice(0, 60) : "";
    return name || null;
  },

  async saveSpace() {
    const tabs = this.captureTabs();
    if (!tabs.length) {
      Services.prompt.alert(window, "Spaces", "Open some websites first, then save them as a space.");
      return;
    }
    if (tabs.length > this.MAX_TABS) {
      Services.prompt.alert(window, "Spaces", `A space holds up to ${this.MAX_TABS} tabs. Close some tabs first.`);
      return;
    }
    const spaces = await this.readSpaces();
    const name = this.askName("Save as a space", `Space ${spaces.length + 1}`);
    if (!name) return;
    spaces.push({ id: Services.uuid.generateUUID().toString(), name, createdAt: new Date().toISOString(), tabs });
    await this.writeSpaces(spaces);
    this.setCurrent(name);
  },

  async updateSpace(index) {
    const spaces = await this.readSpaces();
    const tabs = this.captureTabs();
    if (!spaces[index] || !tabs.length) return;
    spaces[index].tabs = tabs.slice(0, this.MAX_TABS);
    await this.writeSpaces(spaces);
    this.setCurrent(spaces[index].name);
  },

  async renameSpace(index) {
    const spaces = await this.readSpaces();
    if (!spaces[index]) return;
    const name = this.askName("Rename space", spaces[index].name);
    if (!name) return;
    if (this.currentSpace === spaces[index].name) this.setCurrent(name);
    spaces[index].name = name;
    await this.writeSpaces(spaces);
  },

  async deleteSpace(index) {
    const spaces = await this.readSpaces();
    if (!spaces[index]) return;
    if (!Services.prompt.confirm(window, "Delete space", `Delete "${spaces[index].name}"? Your open tabs stay open.`)) return;
    if (this.currentSpace === spaces[index].name) this.setCurrent(null);
    spaces.splice(index, 1);
    await this.writeSpaces(spaces);
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
  },

  setCurrent(name) {
    this.currentSpace = name;
    if (this.spaceName) this.spaceName.textContent = name || "Personal space";
  },
};

window.addEventListener(
  "load",
  () => {
    // Espera a barra lateral do Firefox montar a lista de abas.
    const start = () => {
      try {
        NiumSidebar.init();
      } catch (e) {
        console.error("Nium: barra lateral", e);
      }
    };
    if (window.SidebarController?.uiReady) {
      start();
    } else {
      setTimeout(start, 0);
      // Garantia: tenta de novo depois da inicialização atrasada da janela.
      Services.obs.addObserver(function obs(subject) {
        if (subject === window) {
          Services.obs.removeObserver(obs, "browser-delayed-startup-finished");
          start();
        }
      }, "browser-delayed-startup-finished");
    }
  },
  { once: true }
);
