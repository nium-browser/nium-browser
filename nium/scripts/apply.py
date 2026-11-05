#!/usr/bin/env python3
# Nium — aplica o Nium a um código-fonte do Firefox.
#
# No terminal do MozillaBuild, dentro da pasta do Firefox (ex.: /e/mozilla-source/firefox):
#     python3 ../nium-browser/nium/scripts/apply.py            aplica (pode rodar várias vezes)
#     python3 ../nium-browser/nium/scripts/apply.py --revert   desfaz
# Depois: ./mach build && ./mach run
import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

KIT = Path(__file__).resolve().parents[1]          # .../nium-browser/nium
FIREFOX = Path.cwd()
BEGIN, END = '// --- Nium: início ---', '// --- Nium: fim ---'


def say(msg):
  print('[nium] ' + msg)


def write_if_changed(path, text):
  # Só grava se mudou: arquivo regravado faz o mach refazer mais coisa.
  if path.exists() and path.read_text(encoding='utf-8') == text:
    return False
  path.write_text(text, encoding='utf-8', newline='\n')
  return True


def copy_tree(src, dst):
  changed = 0
  for f in src.rglob('*'):
    if f.is_dir() or f.parent.name == 'source':
      continue
    target = dst / f.relative_to(src)
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() and target.read_bytes() == f.read_bytes():
      continue
    shutil.copyfile(f, target)
    changed += 1
  return changed


def branding():
  n = copy_tree(KIT / 'branding' / 'nium', FIREFOX / 'browser' / 'branding' / 'nium')
  say(f'marca Nium em browser/branding/nium ({n} arquivos atualizados)')


THEME_ID = 'nium-theme@nium.app'
THEME_JAR = (
    '\n# Nium\n'
    '  content/builtin-themes/nium/manifest.json       (nium/manifest.json)\n'
    '  content/builtin-themes/nium/icon.svg            (nium/icon.svg)\n'
    '  content/builtin-themes/nium/preview.svg         (nium/preview.svg)\n')
THEME_CONFIG = (
    '  [\n'
    '    "%s",\n'
    '    {\n'
    '      version: "%s",\n'
    '      path: "resource://builtin-themes/nium/",\n'
    '    },\n'
    '  ], // Nium\n')


THEME_LIST_ENTRY = '''  { // Nium
    id: "{ID}",
    isBuiltIn: true,
    showInCompactLayout: true,
    themePickerColors: {
      light: { type: "gradient", value: "linear-gradient(96deg, #E9E9EB 30%, #B9D3C6 100%)" },
      dark: { type: "gradient", value: "linear-gradient(96deg, #171719 30%, #2F4A3E 100%)" },
    },
  }, // Nium
'''


def theme():
  """Tema Nium embutido (cores do Nium, claro e escuro), ativado por padrão."""
  import json
  addons = FIREFOX / 'browser' / 'themes' / 'addons'
  copy_tree(KIT / 'themes' / 'nium', addons / 'nium')
  jar = addons / 'jar.mn'
  text = jar.read_text(encoding='utf-8')
  if 'builtin-themes/nium/' not in text:
    write_if_changed(jar, text.rstrip('\n') + '\n' + THEME_JAR)
  version = json.loads((KIT / 'themes' / 'nium' / 'manifest.json').read_text(encoding='utf-8'))['version']
  cfg = FIREFOX / 'browser' / 'themes' / 'BuiltInThemeConfig.sys.mjs'
  text = cfg.read_text(encoding='utf-8')
  if THEME_ID in text:
    start = text.index('  [\n    "%s"' % THEME_ID)
    end = text.index('], // Nium\n', start) + len('], // Nium\n')
    text = text[:start] + text[end:]
  anchor = '\n]);'
  if text.count(anchor) != 1:
    sys.exit('[nium] ERRO: não achei o fim da lista em BuiltInThemeConfig.sys.mjs; me mande este erro.')
  write_if_changed(cfg, text.replace(anchor, '\n' + THEME_CONFIG % (THEME_ID, version) + ']);'))
  # Lista de temas da tela de temas (about:addons e boas-vindas): o Nium aparece primeiro.
  lst = FIREFOX / 'browser' / 'themes' / 'ThemesList.sys.mjs'
  text = lst.read_text(encoding='utf-8')
  if THEME_ID in text:
    start = text.index('  { // Nium')
    end = text.index('  }, // Nium\n', start) + len('  }, // Nium\n')
    text = text[:start] + text[end:]
  anchor = 'export const FIREFOX_THEMES_LIST = [\n'
  if text.count(anchor) != 1:
    sys.exit('[nium] ERRO: não achei FIREFOX_THEMES_LIST em ThemesList.sys.mjs; me mande este erro.')
  write_if_changed(lst, text.replace(anchor, anchor + THEME_LIST_ENTRY.replace('{ID}', THEME_ID)))
  say('tema Nium embutido')


def tokens():
  """Cores do Nium nas páginas internas (troca o violeta/azul do Firefox pelo verde do Nium)."""
  p = FIREFOX / 'toolkit' / 'themes' / 'shared' / 'design-system' / 'dist' / 'tokens-shared.css'
  text = p.read_text(encoding='utf-8')
  begin = '/* --- Nium: início ---'
  if begin in text:
    text = text[:text.index(begin)].rstrip('\n') + '\n'
  block = (KIT / 'css' / 'nium-tokens.css').read_text(encoding='utf-8').strip('\n')
  write_if_changed(p, text + '\n' + block + '\n')
  say('cores do Nium nas páginas internas')


def chrome_css():
  """Visual do Nium Electron na janela (cantos, fonte, logo na lateral, abas)."""
  p = FIREFOX / 'browser' / 'themes' / 'shared' / 'browser-shared.css'
  text = p.read_text(encoding='utf-8')
  begin = '/* --- Nium: início ---'
  if begin in text:
    text = text[:text.index(begin)].rstrip('\n') + '\n'
  block = (KIT / 'css' / 'nium-chrome.css').read_text(encoding='utf-8').strip('\n')
  write_if_changed(p, text + '\n' + block + '\n')
  say('visual do Nium na janela')


NEWTAB_JAR = '  builtin-addons/newtab/data/content/nium/ (./data/content/nium/*)\n'


def newtab():
  """Nova aba do Nium Electron no lugar da do Firefox."""
  nt = FIREFOX / 'browser' / 'extensions' / 'newtab'
  dest = nt / 'data' / 'content' / 'nium'
  dest.mkdir(parents=True, exist_ok=True)
  for name in ('newtab.css', 'newtab.js'):
    src = KIT / 'newtab' / name
    if not (dest / name).exists() or (dest / name).read_bytes() != src.read_bytes():
      shutil.copyfile(src, dest / name)
  html = (KIT / 'newtab' / 'activity-stream.html').read_text(encoding='utf-8')
  write_if_changed(nt / 'prerendered' / 'activity-stream.html', html)
  jar = nt / 'addon-jar.mn'
  text = jar.read_text(encoding='utf-8')
  if 'data/content/nium/' not in text:
    anchor = '  builtin-addons/newtab/prerendered/activity-stream.html'
    if anchor not in text:
      sys.exit('[nium] ERRO: não achei a nova aba em addon-jar.mn; me mande este erro.')
    write_if_changed(jar, text.replace(anchor, NEWTAB_JAR + anchor, 1))
  say('nova aba do Nium')


def chrome_scripts():
  """Scripts do Nium que rodam em cada janela (barra lateral do Nium Electron)."""
  dest = FIREFOX / 'browser' / 'base' / 'content' / 'nium'
  n = copy_tree(KIT / 'chrome', dest)
  say(f'scripts do Nium na janela ({n} atualizados)')


UBO_ID = 'uBlock0@raymondhill.net'
UBO_URL = 'https://addons.mozilla.org/firefox/downloads/latest/ublock-origin/latest.xpi'


def ublock():
  """Nium Shield = uBlock Origin (assinado pela Mozilla), instalado no perfil de teste."""
  import time
  import urllib.request
  cache = KIT.parent / '.cache' / 'ublock-origin.xpi'
  cache.parent.mkdir(exist_ok=True)
  if not cache.exists() or time.time() - cache.stat().st_mtime > 7 * 86400:
    try:
      req = urllib.request.Request(UBO_URL, headers={'User-Agent': 'Nium-build'})
      with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
      if data[:2] != b'PK':
        raise ValueError('o arquivo baixado não é um .xpi')
      cache.write_bytes(data)
      say(f'uBlock Origin baixado ({len(data) // 1024} KB)')
    except Exception as e:
      if not cache.exists():
        say(f'AVISO: não consegui baixar o uBlock Origin ({e}); o Nium Shield fica sem bloqueio por enquanto')
        return
      say(f'AVISO: não consegui atualizar o uBlock Origin ({e}); uso o que já estava baixado')
  profile = FIREFOX / 'obj-nium' / 'tmp' / 'profile-default'
  if not profile.exists():
    say('AVISO: rode ./mach run uma vez e depois o apply.py de novo, para instalar o uBlock Origin no perfil')
    return
  dest = profile / 'extensions' / (UBO_ID + '.xpi')
  dest.parent.mkdir(exist_ok=True)
  if not dest.exists() or dest.read_bytes() != cache.read_bytes():
    shutil.copyfile(cache, dest)
  say('Nium Shield: uBlock Origin no perfil de teste')


def prefs():
  p = FIREFOX / 'browser' / 'app' / 'profile' / 'firefox.js'
  text = p.read_text(encoding='utf-8')
  if BEGIN in text:
    text = text[:text.index(BEGIN)].rstrip('\n') + '\n'
  block = (KIT / 'prefs' / 'nium-prefs.js').read_text(encoding='utf-8').strip('\n')
  block += '\n\n// Tema Nium por padrão\npref("extensions.activeThemeID", "%s");' % THEME_ID
  write_if_changed(p, text + '\n' + BEGIN + '\n' + block + '\n' + END + '\n')
  say('preferências do Nium no firefox.js')


def mozconfig():
  p = FIREFOX / 'mozconfig'
  ours = (KIT / 'mozconfig').read_text(encoding='utf-8')
  if p.exists() and 'Nium' not in p.read_text(encoding='utf-8'):
    shutil.copyfile(p, FIREFOX / 'mozconfig.antes-do-nium')
    say('mozconfig antigo guardado em mozconfig.antes-do-nium')
  write_if_changed(p, ours)
  say('mozconfig do Nium (Artifact Mode)')


# --- Tirar o Firefox das telas internas -------------------------------------
# Mascotes (raposa "Kit") trocados pela arte do Nium. Só .svg; o resto fica.
ART = KIT / 'art'
MASCOT_SKIP = ('/test', '/docs/', 'branding/', 'devtools/', 'mobile/', 'third_party', 'testing/',
               'kit-mention')
DECORATIVE = ('fox-tail.svg',)        # enfeites: somem
LOGO_ICONS = ('browser/themes/shared/sidebar/firefox.svg',
              'browser/themes/shared/icons/window-firefox.svg',
              'browser/themes/shared/preferences/mozilla-logo.svg',
              'browser/themes/shared/preferences/mozilla-16.svg')
PRIVATE_ICONS = ('browser/themes/shared/privatebrowsing/favicon.svg',
                 'browser/themes/shared/privatebrowsing/pbm-logo.svg',
                 'toolkit/themes/shared/icons/indicator-private-browsing.svg')


def _mascots():
  import re
  out = subprocess.run(['git', 'ls-files', '*.svg'], cwd=FIREFOX, capture_output=True,
                       text=True, encoding='utf-8').stdout.split()
  found = []
  for f in out:
    if any(k in f for k in MASCOT_SKIP):
      continue
    name = os.path.basename(f).replace('firefox', '')
    if re.search(r'(^|[-_])(fox|kit)([-_.]|$)', name):
      found.append(f)
  return found


def art():
  ill = (ART / 'illustration.svg').read_bytes()
  blank = (ART / 'blank.svg').read_bytes()
  logo = (ART / 'logo-icon.svg').read_bytes()
  private = (ART / 'private-icon.svg').read_bytes()
  n = 0
  files = _mascots()
  for f in files + list(LOGO_ICONS) + list(PRIVATE_ICONS):
    p = FIREFOX / f
    if not p.exists():
      continue
    data = (logo if f in LOGO_ICONS else private if f in PRIVATE_ICONS
            else blank if p.name in DECORATIVE else ill)
    if p.read_bytes() != data:
      p.write_bytes(data)
      n += 1
  say(f'raposas e logos do Firefox trocados pelo Nium ({len(files)} ilustrações, {n} arquivos atualizados)')
  return files


# Trocas de texto: (arquivo, texto original, texto do Nium). Rodar de novo não duplica.
PATCHES = [
  # Nomes de recursos "Firefox ..." viram "Nium ..."
  ('toolkit/locales/en-US/toolkit/branding/brandings.ftl', '-firefox-suggest-brand-name = Firefox Suggest', '-firefox-suggest-brand-name = Nium Suggest'),
  ('toolkit/locales/en-US/toolkit/branding/brandings.ftl', '-firefox-home-brand-name = Firefox Home', '-firefox-home-brand-name = Nium Home'),
  ('toolkit/locales/en-US/toolkit/branding/brandings.ftl', '-firefoxview-brand-name = Firefox View', '-firefoxview-brand-name = Nium View'),
  ('toolkit/locales/en-US/toolkit/branding/brandings.ftl', '-firefoxlabs-brand-name = Firefox Labs', '-firefoxlabs-brand-name = Nium Labs'),
  ('toolkit/locales/en-US/toolkit/branding/brandings.ftl', '-screenshots-brand-name = Firefox Screenshots', '-screenshots-brand-name = Nium Screenshots'),
  ('toolkit/locales/en-US/toolkit/branding/brandings.ftl', '-translations-brand-name = Firefox Translations', '-translations-brand-name = Nium Translations'),
  # Configurações: some o bloco "Conta (Mozilla) indisponível" e o "indique o Firefox"
  ('browser/components/preferences/config/account-sync.mjs', 'hidden: accountsEnabled,', 'hidden: true, // Nium'),
  ('browser/components/preferences/config/account-sync.mjs', 'hidden: !Referrals.isEnabled,', 'hidden: true, // Nium'),
  ('browser/locales/en-US/browser/preferences/preferences.ftl', 'account-sync-section =\n    .heading = Account and sync', 'account-sync-section =\n    .heading = Essentials'),
  ('browser/locales/en-US/browser/preferences/preferences.ftl', 'pane-account-sync-title2 = Account and sync\n    .title = Account and sync', 'pane-account-sync-title2 = Essentials\n    .title = Essentials'),
  # Painel de extensões vazio: sem ilustração, só texto (como no Nium Electron)
  ('browser/themes/shared/addons/unified-extensions.css', '#unified-extensions-empty-state {\n  > img {\n', '#unified-extensions-empty-state {\n  > img {\n    display: none; /* Nium */\n'),
  ('browser/locales/en-US/browser/unifiedExtensions.ftl', 'unified-extensions-empty-reason-zero-extensions-onboarding2 = A few extensions go a long way', 'unified-extensions-empty-reason-zero-extensions-onboarding2 = No extensions yet'),
  ('browser/locales/en-US/browser/unifiedExtensions.ftl', 'unified-extensions-empty-content-explain-extensions-onboarding2 = We’ve got recommendations to help you improve focus, privacy, and more.', 'unified-extensions-empty-content-explain-extensions-onboarding2 = Add extensions to block ads, fill passwords and more. Select “{ unified-extensions-manage-extensions.label }” to get started.'),
  # Barra de cima como no Nium Electron: sem botão Início, endereço logo após o recarregar
  ('browser/components/customizableui/CustomizableUI.sys.mjs',
   '      Services.policies.isAllowed("removeHomeButtonByDefault")\n        ? null\n        : "home-button",\n      "spring",\n      "vertical-spacer",',
   '      null, // Nium: sem botão Início e sem espaço antes do endereço\n      "vertical-spacer",'),
  # Atalhos de fábrica do Nium Electron (dá para mudar tudo em about:keyboard)
  # Ctrl+Shift+N = janela anônima (o "reabrir janela" fica no Ctrl+Shift+T, que reabre aba ou janela)
  ('browser/base/content/browser-sets.inc.xhtml', '<key id="key_undoCloseWindow" command="History:UndoCloseWindow" data-l10n-id="window-new-shortcut" modifiers="accel,shift"/>', '<key id="key_undoCloseWindow" command="History:UndoCloseWindow"/>'),
  ('browser/locales/en-US/browser/browserSets.ftl', 'private-browsing-shortcut =\n    .key = P', 'private-browsing-shortcut =\n    .key = N'),
  # Ctrl+K = buscar abas (no Firefox era pesquisar na web; Ctrl+E continua pesquisando)
  ('browser/base/content/browser-sets.inc.xhtml', '<key id="key_search" data-l10n-id="search-focus-shortcut" command="Tools:Search" modifiers="accel"/>', '<key id="key_search" command="Tools:Search"/>'),
  ('browser/base/content/browser-sets.inc.xhtml', '<key id="key_searchTabs" data-l10n-id="search-tabs-shortcut" command="Browser:SearchTabs" modifiers="accel,shift"/>', '<key id="key_searchTabs" data-l10n-id="search-tabs-shortcut" command="Browser:SearchTabs" modifiers="accel"/>'),
  ('browser/locales/en-US/browser/browserSets.ftl', 'search-tabs-shortcut =\n    .key = A', 'search-tabs-shortcut =\n    .key = K'),
  # Ctrl+B = abrir/fechar a barra lateral (no Firefox era favoritos na lateral)
  # Favoritos na lateral vai para Ctrl+Alt+B
  ('browser/base/content/browser-sets.inc.xhtml',
   ('    <key id="viewBookmarksSidebarKb"\n         data-l10n-id="bookmark-show-sidebar-shortcut"\n         modifiers="accel"/>',
    '    <key id="viewBookmarksSidebarKb"/>'),
   '    <key id="viewBookmarksSidebarKb"\n         data-l10n-id="bookmark-show-sidebar-shortcut"\n         modifiers="accel,alt"/>'),
  ('browser/base/content/browser-sets.inc.xhtml',
   '    <key id="toggleSidebarKb"\n         data-l10n-id="toggle-sidebar-shortcut"\n#ifdef XP_MACOSX\n         modifiers="control"\n#else\n         modifiers="control,alt"\n#endif',
   '    <key id="toggleSidebarKb"\n         data-l10n-id="toggle-sidebar-shortcut"\n#ifdef XP_MACOSX\n         modifiers="control"\n#else\n         modifiers="accel"\n#endif'),
  ('browser/locales/en-US/browser/browserSets.ftl', 'toggle-sidebar-shortcut =\n    .key = Z', 'toggle-sidebar-shortcut =\n    .key = B'),
  # Ctrl+Alt+A = painel de IA
  ('browser/locales/en-US/browser/browserSets.ftl', 'ai-chatbot-sidebar-shortcut =\n    .key = X', 'ai-chatbot-sidebar-shortcut =\n    .key = A'),
  # Barra lateral do Nium Electron: o script nium-sidebar.js entra em cada janela
  ('browser/base/jar.mn',
   ('        content/browser/browser-main.js                     (content/browser-main.js)\n'
    '        content/browser/nium/                               (content/nium/*)\n'
    '        content/browser/nium/core/notes/                    (content/nium/core/notes/*)\n'
    '        content/browser/nium/core/shared/                   (content/nium/core/shared/*)\n',
    '        content/browser/browser-main.js                     (content/browser-main.js)\n'
    '        content/browser/nium/nium-sidebar.js                (content/nium/nium-sidebar.js)\n'
    '        content/browser/nium/NiumCiteChild.sys.mjs          (content/nium/NiumCiteChild.sys.mjs)\n'
    '        content/browser/nium/core/notes/                    (content/nium/core/notes/*)\n'
    '        content/browser/nium/core/shared/                   (content/nium/core/shared/*)\n',
    '        content/browser/browser-main.js                     (content/browser-main.js)\n'
    '        content/browser/nium/nium-sidebar.js                (content/nium/nium-sidebar.js)\n'
    '        content/browser/nium/core/notes/                    (content/nium/core/notes/*)\n'
    '        content/browser/nium/core/shared/                   (content/nium/core/shared/*)\n',
    '        content/browser/browser-main.js                     (content/browser-main.js)\n'
    '        content/browser/nium/nium-sidebar.js                (content/nium/nium-sidebar.js)\n',
    '        content/browser/browser-main.js                     (content/browser-main.js)\n'),
   # (content/nium/*) já inclui as subpastas (core/notes, core/shared)
   '        content/browser/browser-main.js                     (content/browser-main.js)\n'
   '        content/browser/nium/                               (content/nium/*)\n'),
  ('browser/base/content/browser.xhtml',
   '  <script src="chrome://browser/content/browser-main.js"></script>\n',
   '  <script src="chrome://browser/content/browser-main.js"></script>\n'
   '  <script src="chrome://browser/content/nium/nium-sidebar.js"></script>\n'),
  # Lugares do Nium na barra lateral (logo/espaço/busca em cima das abas; Shield/Seu espaço embaixo)
  ('browser/components/sidebar/sidebar-main.mjs',
   '        <slot name="tabstrip"></slot>\n',
   '        <slot name="nium-top"></slot>\n        <slot name="tabstrip"></slot>\n'),
  ('browser/components/sidebar/sidebar-main.mjs',
   '          </button-group>\n        </div>\n      </div>\n    `;\n  }\n}',
   '          </button-group>\n        </div>\n        <slot name="nium-bottom"></slot>\n      </div>\n    `;\n  }\n}'),
  # Tela dividida: fundo da escolha de aba com as cores do Nium (era o roxo do Firefox)
  ('browser/components/tabbrowser/content/opentabs.css',
   'background: no-repeat light-dark(linear-gradient(#f0ebfd, #f7ebeb), linear-gradient(#332a50, #3f2a2f));',
   'background: no-repeat light-dark(linear-gradient(#f7f7f8, #eef3f0), linear-gradient(#1f1f22, #1b2320)); /* Nium */'),
  ('browser/components/tabbrowser/content/opentabs-splitview.css',
   'background: linear-gradient(to bottom, light-dark(#f0ebfd, #332a50) 0%, light-dark(#f1ebf8, #342a47) 95%, transparent 100%);',
   'background: linear-gradient(to bottom, light-dark(#f7f7f8, #1f1f22) 0%, light-dark(#f6f7f7, #1f2121) 95%, transparent 100%); /* Nium */'),
  # Nium AI no navegador: libera só os dois modelos Leve/Padrão (Qwen2.5 Instruct GGUF) no motor de IA local
  ('toolkit/components/ml/content/Utils.sys.mjs',
   '  "https://localhost/",\n];',
   '  "https://localhost/",\n  // Nium AI: modelos Leve e Padrão (Apache-2.0)\n  "https://huggingface.co/qwen/qwen2.5-0.5b-instruct-gguf/",\n  "https://huggingface.co/qwen/qwen2.5-1.5b-instruct-gguf/",\n];'),
  # Configurações: página "Seu Nium" (about:preferences#nium), primeira do menu
  ('browser/components/preferences/preferences.xhtml',
   '  <script src="chrome://browser/content/preferences/preferences.js"/>\n',
   '  <script src="chrome://browser/content/preferences/preferences.js"/>\n  <script src="chrome://browser/content/nium/nium-prefs.js"/>\n  <link rel="stylesheet" href="chrome://browser/content/nium/nium-prefs.css" />\n'),
  ('browser/components/preferences/preferences.xhtml',
   '    <html:moz-page-nav id="categories" data-l10n-id="category-nav-heading" allownoselection="true">\n',
   '    <html:moz-page-nav id="categories" data-l10n-id="category-nav-heading" allownoselection="true">\n      <html:moz-page-nav-button id="category-nium"\n        view="paneNium"\n        iconsrc="chrome://browser/content/nium/nium-mark.svg">Nium\n      </html:moz-page-nav-button>\n'),
  ('browser/components/preferences/preferences.js',
   '  register_module("panePrivacy", gPrivacyPane);\n',
   '  register_module("panePrivacy", gPrivacyPane);\n  register_module("paneNium", gNiumPane); // Nium\n'),
  # about:logins: tira as instruções de sincronizar com conta Mozilla
  ('browser/components/aboutlogins/content/aboutLogins.html', '        <ul>\n          <li data-l10n-id="login-intro-instructions-fxa2">', '        <ul hidden>\n          <li data-l10n-id="login-intro-instructions-fxa2">'),
]


def patches():
  ok = miss = 0
  for rel, old, new in PATCHES:
    p = FIREFOX / rel
    if not p.exists():
      say(f'AVISO: {rel} não existe (pulei)'); miss += 1; continue
    text = p.read_text(encoding='utf-8')
    olds = old if isinstance(old, tuple) else (old,)   # vários: versões antigas do próprio Nium
    found = next((o for o in olds if o in text), None)
    bigger = next((o for o in olds if new in o and o in text), None)   # versão antiga que contém a nova
    if bigger:
      write_if_changed(p, text.replace(bigger, new, 1)); ok += 1
    elif new in text:
      ok += 1   # já aplicado (por isso cada texto novo tem de ser único no arquivo)
    elif found:
      write_if_changed(p, text.replace(found, new, 1)); ok += 1
    else:
      say(f'AVISO: não achei o texto em {rel} (o Firefox mudou?) — pulei: {olds[0][:50]!r}'); miss += 1
  say(f'textos do Firefox ajustados ({ok} ok, {miss} pulados)')


# --- Português (pacote de idioma pt-BR) ----------------------------------------
L10N_REPO = 'https://github.com/mozilla-l10n/firefox-l10n.git'
L10N_LOCALES = ('pt-BR',)
# As mesmas trocas de texto do Nium, nas traduções (caminhos dentro de firefox-l10n/<idioma>/)
L10N_PATCHES = {
  'pt-BR': [
    ('toolkit/toolkit/branding/brandings.ftl', '-firefox-suggest-brand-name = Sugestões Firefox', '-firefox-suggest-brand-name = Sugestões Nium'),
    ('toolkit/toolkit/branding/brandings.ftl', '-firefox-home-brand-name = Página inicial do Firefox', '-firefox-home-brand-name = Página inicial do Nium'),
    ('toolkit/toolkit/branding/brandings.ftl', '-firefoxview-brand-name = Firefox View', '-firefoxview-brand-name = Nium View'),
    ('toolkit/toolkit/branding/brandings.ftl', '-firefoxlabs-brand-name = Firefox Labs', '-firefoxlabs-brand-name = Nium Labs'),
    ('toolkit/toolkit/branding/brandings.ftl', '-screenshots-brand-name = Firefox Screenshots', '-screenshots-brand-name = Nium Screenshots'),
    ('toolkit/toolkit/branding/brandings.ftl', '-translations-brand-name = Firefox Translations', '-translations-brand-name = Nium Translations'),
    ('browser/browser/browserSets.ftl', 'private-browsing-shortcut =\n    .key = P', 'private-browsing-shortcut =\n    .key = N'),
    ('browser/browser/browserSets.ftl', 'search-tabs-shortcut =\n    .key = A', 'search-tabs-shortcut =\n    .key = K'),
    ('browser/browser/browserSets.ftl', 'toggle-sidebar-shortcut =\n    .key = Z', 'toggle-sidebar-shortcut =\n    .key = B'),
    ('browser/browser/browserSets.ftl', 'ai-chatbot-sidebar-shortcut =\n    .key = X', 'ai-chatbot-sidebar-shortcut =\n    .key = A'),
    ('browser/browser/preferences/preferences.ftl', 'account-sync-section =\n    .heading = Conta e sincronização', 'account-sync-section =\n    .heading = Essenciais'),
    ('browser/browser/preferences/preferences.ftl', 'pane-account-sync-title2 = Conta e sincronização\n    .title = Conta e sincronização', 'pane-account-sync-title2 = Essenciais\n    .title = Essenciais'),
    ('browser/browser/unifiedExtensions.ftl', 'unified-extensions-empty-reason-zero-extensions-onboarding2 = Algumas extensões fazem muita diferença', 'unified-extensions-empty-reason-zero-extensions-onboarding2 = Nenhuma extensão ainda'),
    ('browser/browser/unifiedExtensions.ftl', 'unified-extensions-empty-content-explain-extensions-onboarding2 = Temos recomendações para te ajudar a melhorar foco, privacidade e muito mais.', 'unified-extensions-empty-content-explain-extensions-onboarding2 = Adicione extensões para bloquear anúncios, preencher senhas e mais. Selecione “{ unified-extensions-manage-extensions.label }” para começar.'),
  ],
}


def l10n():
  """Baixa (ou atualiza) as traduções do Firefox ao lado do código e aplica os textos do Nium."""
  base = FIREFOX.parent / 'firefox-l10n'
  git = lambda *a: subprocess.run(['git', '-C', str(base), *a], capture_output=True, text=True, encoding='utf-8')
  try:
    if not (base / '.git').exists():
      say('baixando as traduções (pt-BR), só na primeira vez…')
      r = subprocess.run(['git', 'clone', '--depth', '1', '--filter=blob:none', '--sparse', L10N_REPO, str(base)],
                         capture_output=True, text=True, encoding='utf-8')
      if r.returncode:
        raise RuntimeError(r.stderr.strip()[-300:])
      git('sparse-checkout', 'set', *L10N_LOCALES)
    else:
      git('checkout', '--', '.')
      f = git('fetch', '--depth', '1', 'origin', 'main')
      if f.returncode == 0:
        git('reset', '--hard', 'origin/main')
  except Exception as e:
    say(f'AVISO: não consegui baixar as traduções ({e}); o Nium fica em inglês por enquanto')
    return
  ok = miss = 0
  for loc, items in L10N_PATCHES.items():
    for rel, old, new in items:
      p = base / loc / rel
      if not p.exists():
        miss += 1; continue
      text = p.read_text(encoding='utf-8')
      if new in text:
        ok += 1
      elif old in text:
        write_if_changed(p, text.replace(old, new, 1)); ok += 1
      else:
        say(f'AVISO: tradução mudou em {loc}/{rel} — pulei: {old[:50]!r}'); miss += 1
  say(f'traduções prontas ({ok} textos do Nium, {miss} pulados)')


def langpack():
  """Depois de ./mach build langpack-pt-BR: instala o pacote de idioma no perfil de teste."""
  import zipfile
  import json as _json
  dist = FIREFOX / 'obj-nium' / 'dist'
  profile = FIREFOX / 'obj-nium' / 'tmp' / 'profile-default'
  if not dist.exists() or not profile.exists():
    return
  for loc in L10N_LOCALES:
    found = sorted(dist.glob(f'**/*{loc}.langpack.xpi'), key=lambda p: p.stat().st_mtime)
    if not found:
      say(f'(pacote {loc} ainda não feito: rode ./mach build langpack-{loc} e depois o apply.py de novo)')
      continue
    xpi = found[-1]
    try:
      with zipfile.ZipFile(xpi) as z:
        manifest = _json.loads(z.read('manifest.json'))
      gecko = (manifest.get('browser_specific_settings') or manifest.get('applications') or {}).get('gecko', {})
      addon_id = gecko['id']
    except Exception as e:
      say(f'AVISO: não consegui ler {xpi.name} ({e})')
      continue
    dest = profile / 'extensions' / (addon_id + '.xpi')
    dest.parent.mkdir(exist_ok=True)
    if not dest.exists() or dest.read_bytes() != xpi.read_bytes():
      shutil.copyfile(xpi, dest)
    say(f'idioma {loc} instalado no perfil de teste')


def revert():
  shutil.rmtree(FIREFOX / 'browser' / 'branding' / 'nium', ignore_errors=True)
  shutil.rmtree(FIREFOX / 'browser' / 'themes' / 'addons' / 'nium', ignore_errors=True)
  shutil.rmtree(FIREFOX / 'browser' / 'extensions' / 'newtab' / 'data' / 'content' / 'nium', ignore_errors=True)
  shutil.rmtree(FIREFOX / 'browser' / 'base' / 'content' / 'nium', ignore_errors=True)
  subprocess.call(['git', 'checkout', '--', 'browser/app/profile/firefox.js',
                   'browser/themes/addons/jar.mn', 'browser/themes/BuiltInThemeConfig.sys.mjs',
                   'browser/themes/ThemesList.sys.mjs',
                   'toolkit/themes/shared/design-system/dist/tokens-shared.css',
                   'browser/themes/shared/browser-shared.css',
                   'browser/extensions/newtab/prerendered/activity-stream.html',
                   'browser/extensions/newtab/addon-jar.mn']
                  + sorted({r for r, _, _ in PATCHES}) + _mascots() + list(LOGO_ICONS) + list(PRIVATE_ICONS), cwd=FIREFOX)
  m = FIREFOX / 'mozconfig'
  if m.exists() and 'Nium' in m.read_text(encoding='utf-8'):
    m.unlink()
  backup = FIREFOX / 'mozconfig.antes-do-nium'
  if backup.exists():
    backup.rename(m)
  base = FIREFOX.parent / 'firefox-l10n'
  if (base / '.git').exists():
    subprocess.call(['git', '-C', str(base), 'checkout', '--', '.'])
  say('Nium desfeito')


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument('--revert', action='store_true')
  args = parser.parse_args()
  if not (FIREFOX / 'mach').exists() or not (FIREFOX / 'browser' / 'branding').exists():
    sys.exit('[nium] Rode dentro da pasta do código do Firefox (onde fica o arquivo mach).')
  if args.revert:
    return revert()
  branding()
  theme()
  tokens()
  chrome_css()
  newtab()
  chrome_scripts()
  art()
  patches()
  prefs()
  ublock()
  l10n()
  langpack()
  mozconfig()
  say('pronto. Agora: ./mach build && ./mach build langpack-pt-BR && python3 ../nium-browser/nium/scripts/apply.py && ./mach run')


if __name__ == '__main__':
  main()
