/* Nium: lê a cor da página para a moldura acompanhar a aba (ver NiumTintParent). MPL-2.0
 *
 * Usa a cor que o site declara (<meta name="theme-color">) ou, se não houver, a cor de fundo da
 * página. Só lê; nada sai do computador. Desligado em "Seu Nium" (nium.tint.enabled).
 */

export class NiumTintChild extends JSWindowActorChild {
  handleEvent() {
    if (!Services.prefs.getBoolPref("nium.tint.enabled", true)) return;
    const win = this.contentWindow;
    const doc = this.document;
    if (!win || !doc || this.browsingContext !== this.browsingContext.top) return;
    let color = null;
    try {
      for (const meta of doc.querySelectorAll('meta[name="theme-color" i]')) {
        const media = meta.getAttribute("media");
        if (media && !win.matchMedia(media).matches) continue;
        if (meta.content) {
          color = meta.content;
          break;
        }
      }
      if (!color) {
        for (const el of [doc.body, doc.documentElement]) {
          if (!el) continue;
          const bg = win.getComputedStyle(el).backgroundColor;
          if (bg && bg !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(bg)) {
            color = bg;
            break;
          }
        }
      }
    } catch (e) {}
    this.sendAsyncMessage("Nium:Tint", { color: color ? String(color).slice(0, 64) : null });
  }
}
