/* Nium: gestos do mouse (como no Nium Electron). MPL-2.0
 *
 * Roda no processo da página. Segure o botão direito, arraste numa direção e solte:
 * esquerda = voltar, direita = avançar, cima = nova aba, baixo = recarregar,
 * baixo+direita = fechar aba, cima+direita = próxima aba, cima+esquerda = aba anterior.
 * Clique direito sem arrastar continua abrindo o menu normal. Desligado por padrão
 * (nium.gestures.enabled), ligado em "Seu espaço".
 */

const THRESHOLD = 60; // pixels por direção, o padrão do Electron
const MAX_TIME = 5000;
const BINDINGS = {
  L: "back",
  R: "forward",
  U: "newTab",
  D: "reload",
  DR: "closeTab",
  UR: "nextTab",
  UL: "previousTab",
};

// Diagnóstico temporário: escreve no Console do navegador (Ctrl+Shift+J) o que o gesto viu.
const log = (...args) => console.log("Nium gestos:", ...args);

export class NiumGesturesChild extends JSWindowActorChild {
  stroke = null;
  suppressUntil = 0;

  handleEvent(event) {
    switch (event.type) {
      case "mousedown":
        this.stroke = null;
        if (
          event.button === 2 &&
          !event.ctrlKey &&
          !event.altKey &&
          !event.shiftKey &&
          !event.metaKey &&
          Services.prefs.getBoolPref("nium.gestures.enabled", false)
        ) {
          this.stroke = { x: event.screenX, y: event.screenY, path: "", invalid: false, start: Date.now() };
          log("começou", event.screenX, event.screenY);
        } else if (event.button === 2) {
          log("clique direito ignorado (gestos desligados ou com Ctrl/Alt/Shift)");
        }
        break;
      case "mousemove":
        if (this.stroke && event.buttons & 2) this.track(event.screenX, event.screenY);
        break;
      case "mouseup":
        if (event.button === 2 && this.stroke) this.finish(event);
        break;
      case "contextmenu":
        log("menu", this.stroke ? this.stroke.path || "(sem gesto)" : "(sem traço)");
        // O menu do clique direito some só quando houve um gesto.
        if (Date.now() < this.suppressUntil || this.stroke?.path) {
          event.preventDefault();
          event.stopPropagation();
        }
        break;
      case "keydown":
        if (event.key === "Escape") this.stroke = null;
        break;
    }
  }

  track(x, y) {
    const s = this.stroke;
    if (Date.now() - s.start > MAX_TIME) {
      s.invalid = true;
      return;
    }
    const dx = x - s.x;
    const dy = y - s.y;
    const big = Math.max(Math.abs(dx), Math.abs(dy));
    const small = Math.min(Math.abs(dx), Math.abs(dy));
    if (big < THRESHOLD || big < small * 1.4) return; // pouco ou na diagonal
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "R" : "L") : dy > 0 ? "D" : "U";
    if (s.path.at(-1) !== dir) s.path += dir;
    s.x = x;
    s.y = y;
    if (s.path.length > 2) s.invalid = true;
  }

  finish(event) {
    const s = this.stroke;
    this.track(event.screenX, event.screenY);
    if (!s.path) {
      this.stroke = null;
      return; // não arrastou: menu normal
    }
    this.suppressUntil = Date.now() + 600;
    const action = !s.invalid && BINDINGS[s.path];
    // Mantém o traço até o "contextmenu" (que vem depois do mouseup no Windows).
    setTimeout(() => (this.stroke = null), 0);
    log("gesto", s.path, s.invalid ? "(inválido)" : "", action || "(sem ação)");
    if (action) this.sendAsyncMessage("Nium:Gesture", { action });
  }
}
