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


def revert():
  shutil.rmtree(FIREFOX / 'browser' / 'branding' / 'nium', ignore_errors=True)
  shutil.rmtree(FIREFOX / 'browser' / 'themes' / 'addons' / 'nium', ignore_errors=True)
  subprocess.call(['git', 'checkout', '--', 'browser/app/profile/firefox.js',
                   'browser/themes/addons/jar.mn', 'browser/themes/BuiltInThemeConfig.sys.mjs',
                   'browser/themes/ThemesList.sys.mjs'], cwd=FIREFOX)
  m = FIREFOX / 'mozconfig'
  if m.exists() and 'Nium' in m.read_text(encoding='utf-8'):
    m.unlink()
  backup = FIREFOX / 'mozconfig.antes-do-nium'
  if backup.exists():
    backup.rename(m)
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
  prefs()
  mozconfig()
  say('pronto. Agora: ./mach build && ./mach run')


if __name__ == '__main__':
  main()
