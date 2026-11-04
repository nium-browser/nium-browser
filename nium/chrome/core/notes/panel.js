// Nium (Firefox): Nium Notes no painel estreito à direita da janela.
// ?panel liga o modo painel: tela inicial com a lista de notas; ao abrir ou criar uma nota,
// ela ocupa o painel inteiro, com "voltar" para a lista. Sem data-panel (painel expandido
// ou aba própria) fica o layout completo de sempre.
"use strict";
(() => {
  const root = document.documentElement;
  if (new URLSearchParams(location.search).has("panel")) {
    root.dataset.panel = "";
  }
  root.dataset.screen = "list";
  const show = screen => {
    root.dataset.screen = screen;
  };
  const inPanel = () => root.hasAttribute("data-panel");

  document.addEventListener(
    "click",
    e => {
      if (!inPanel()) return;
      if (e.target.closest(".card") || e.target.closest(".new-note")) {
        const isNew = !!e.target.closest(".new-note");
        setTimeout(() => {
          show("note");
          // A nota estava escondida quando o app tentou dar foco; dá de novo.
          const title = document.getElementById("title");
          if (isNew && title) title.focus();
        }, 0);
      } else if (e.target.closest(".panel-back")) {
        show("list");
      }
    },
    true
  );
  // Nota nova pelo atalho (Ctrl+Alt+N) também abre a nota.
  document.addEventListener(
    "keydown",
    e => {
      if (inPanel() && e.ctrlKey && e.altKey && e.key.toLowerCase() === "n") {
        setTimeout(() => show("note"), 0);
      }
    },
    true
  );

  document.addEventListener("DOMContentLoaded", () => {
    const editor = document.getElementById("editor");
    if (!editor) return;
    const back = document.createElement("button");
    back.type = "button";
    back.className = "panel-back";
    back.innerHTML =
      '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Notas</span>';
    editor.prepend(back);
    // Nota apagada (ou nenhuma aberta): volta para a lista.
    const empty = document.getElementById("empty");
    if (empty) {
      new MutationObserver(() => {
        if (inPanel() && !empty.hidden && root.dataset.screen === "note") show("list");
      }).observe(empty, { attributes: true, attributeFilter: ["hidden"] });
    }
  });
})();
