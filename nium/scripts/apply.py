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


def prefs():
  p = FIREFOX / 'browser' / 'app' / 'profile' / 'firefox.js'
  text = p.read_text(encoding='utf-8')
  if BEGIN in text:
    text = text[:text.index(BEGIN)].rstrip('\n') + '\n'
  block = (KIT / 'prefs' / 'nium-prefs.js').read_text(encoding='utf-8').strip('\n')
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
  subprocess.call(['git', 'checkout', '--', 'browser/app/profile/firefox.js'], cwd=FIREFOX)
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
  prefs()
  mozconfig()
  say('pronto. Agora: ./mach build && ./mach run')


if __name__ == '__main__':
  main()
