/* Nium: lê a cor da página para a moldura acompanhar a aba (ver NiumTintParent). MPL-2.0
 *
 * Usa a cor que o site declara (<meta name="theme-color">) ou, se não houver, a cor de fundo da
 * página. Só lê; nada sai do computador. Desligado em "Seu Nium" (nium.tint.enabled).
 */

const opaque = c => c && c !== "transparent" && !/rgba\([^)]*,\s*0(\.0+)?\)$/.test(c);

// A cor que aparece no topo da página (onde ela encosta na barra): sobe a partir do que está
// no topo até achar um fundo pintado. Sem nenhum, é o fundo do próprio navegador (branco, ou
// escuro se a página pede tema escuro).
function topColor(win, doc) {
  const w = win.innerWidth || 0;
  for (const x of [w / 2, 12, w - 24]) {
    let el = doc.elementFromPoint?.(Math.max(0, x), 4);
    while (el && el.nodeType === 1) {
      const bg = win.getComputedStyle(el).backgroundColor;
      if (opaque(bg)) return bg;
      el = el.parentElement;
    }
  }
  const scheme = win.getComputedStyle(doc.documentElement).colorScheme || "";
  const dark = /dark/.test(scheme) && (!/light/.test(scheme) || win.matchMedia("(prefers-color-scheme: dark)").matches);
  return dark ? "#1c1b22" : "#ffffff";
}

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
      if (!color) color = topColor(win, doc);
    } catch (e) {}
    this.sendAsyncMessage("Nium:Tint", { color: color ? String(color).slice(0, 64) : null });
  }
}
