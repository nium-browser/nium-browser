// Nium (Firefox): ?panel = aberto no painel à direita da janela (layout estreito).
"use strict";
if (new URLSearchParams(location.search).has("panel")) {
  document.documentElement.dataset.panel = "";
}
