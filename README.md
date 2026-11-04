<p align="center"><img src="nium/branding/nium/default128.png" width="96" alt=""></p>
<h1 align="center">Nium</h1>
<p align="center"><b>The internet, at your pace.</b><br>A quiet browser for Windows, built on Firefox.</p>
<p align="center"><a href="https://niumbrowser.web.app">Website</a> · <a href="https://niumbrowser.web.app/privacy.html">Privacy</a> · <a href="https://niumbrowser.web.app/terms.html">Terms</a></p>

---

> Nium is being rebuilt on **Firefox** (it was previously on Electron, then Chromium). Work in progress — not released yet.

## Desenvolver (Windows)

1. Instale o [MozillaBuild](https://ftp.mozilla.org/pub/mozilla/libraries/win32/MozillaBuildSetup-Latest.exe) e baixe o código do Firefox com o `bootstrap.py`, escolhendo **Firefox for Desktop Artifact Mode** (veja a [documentação da Mozilla](https://firefox-source-docs.mozilla.org/setup/windows_build.html)).
2. Ao lado da pasta `firefox`, clone este repositório:
   ```
   cd /e/mozilla-source
   git clone https://github.com/nium-browser/nium-browser
   ```
3. Aplique o Nium e rode:
   ```
   cd firefox
   python3 ../nium-browser/nium/scripts/apply.py
   ./mach build
   ./mach run
   ```

No Artifact Mode o C++ vem pronto da Mozilla: mudanças de interface (JS/CSS/HTML) levam segundos (`./mach build faster`).

## O que fica aqui

| Pasta | O que é |
|---|---|
| `nium/branding/nium` | Marca Nium (nome, ícones, instalador), copiada para `browser/branding/nium` |
| `nium/branding/source` | Origem dos ícones (SVG) e o gerador |
| `nium/themes/nium` | Tema Nium embutido (claro/escuro, verde do Nium), ativado por padrão |
| `nium/prefs/nium-prefs.js` | Padrões do Nium: abas na lateral, sem telemetria, nova aba sem patrocínio |
| `nium/mozconfig` | Configuração de compilação (Artifact Mode + marca Nium) |
| `nium/scripts/apply.py` | Aplica tudo ao código do Firefox (`--revert` desfaz) |

## Licença
Mozilla Public License 2.0, como o Firefox. O nome e o logotipo **Nium** não fazem parte da licença. Firefox é marca da Mozilla Foundation; o Nium não é afiliado à Mozilla.
