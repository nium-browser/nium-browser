/* Nium: "citar a fonte ao copiar" (como no Nium Electron). MPL-2.0
 *
 * Roda no processo da página. Ao copiar um trecho de texto de um site, junta embaixo dele
 * o título, o endereço e a data, no estilo escolhido em "Seu espaço" (nium.copy.citeStyle).
 * Desligado por padrão (nium.copy.cite). Campos de texto e cópias curtas ficam como estão.
 */

const MIN_LENGTH = 20;

function webURL(spec) {
  try {
    const url = new URL(spec);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch (e) {
    return null;
  }
}

function citation({ title, url, author }, style, now = new Date()) {
  title = String(title || "Untitled page").replace(/\s+/g, " ").slice(0, 500);
  author = String(author || "").replace(/\s+/g, " ").slice(0, 160);
  const pt = Services.locale.appLocaleAsBCP47.startsWith("pt");
  const date = now.toLocaleDateString(Services.locale.appLocaleAsBCP47);
  if (style === "markdown") {
    const safeUrl = url.replace(/[()]/g, c => (c === "(" ? "%28" : "%29"));
    return `[${title.replace(/[[\]]/g, "")}](${safeUrl}) — ${pt ? "acesso em" : "accessed"} ${date}.`;
  }
  if (style === "abnt") {
    // Parecido com ABNT; não garante todos os dados de uma referência acadêmica.
    return `${author ? author.toUpperCase() + ". " : ""}${title}. ${pt ? "Disponível em" : "Available at"}: ${url}. ${pt ? "Acesso em" : "Accessed"}: ${date}.`;
  }
  return `${author ? author + " — " : ""}${title}\n${url}\n${pt ? "Acessado em" : "Accessed"} ${date}.`;
}

export class NiumCiteChild extends JSWindowActorChild {
  handleEvent(event) {
    if (event.type !== "copy" || event.defaultPrevented || !event.clipboardData) {
      return;
    }
    if (!Services.prefs.getBoolPref("nium.copy.cite", false)) {
      return;
    }
    const win = this.contentWindow;
    const doc = win?.document;
    if (!doc) return;
    const active = doc.activeElement;
    if (active && (active.isContentEditable || /^(input|textarea|select)$/i.test(active.localName))) {
      return; // copiando de um campo: não mexe
    }
    const text = win.getSelection()?.toString() || "";
    if (text.trim().length < MIN_LENGTH) return;
    const url = webURL(win.location.href);
    if (!url) return;
    const author = doc.querySelector('meta[name="author"]')?.getAttribute("content") || "";
    const style = Services.prefs.getStringPref("nium.copy.citeStyle", "simple");
    const cite = citation({ title: doc.title, url, author }, style);
    event.clipboardData.setData("text/plain", `${text}\n\n${cite}`);
    event.preventDefault();
  }
}
