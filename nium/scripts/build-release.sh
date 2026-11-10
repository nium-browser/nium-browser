#!/bin/bash
# Nium — Fase 7, parte 1: compila o nium.exe completo e gera o instalador do Windows.
#
# Rode no MozillaBuild, dentro da pasta do código do Firefox:
#     cd /e/mozilla-source/firefox/firefox
#     bash ../nium-browser/nium/scripts/build-release.sh
#
# Na primeira vez leva de 1 a 3 horas e uns 40 GB de disco (as seguintes são bem mais rápidas).
# Pode parar com Ctrl+C e rodar de novo: ele continua de onde parou.
# Só refazer o instalador (sem compilar de novo): NIUM_ONLY_INSTALLER=1 bash .../build-release.sh
# Se os compiladores travarem (0xC0000409, falta de memória), use menos tarefas:
#     NIUM_JOBS=4 bash ../nium-browser/nium/scripts/build-release.sh
set -e
KIT="$(cd "$(dirname "$0")/.." && pwd)"
say() { printf '\n\033[1;32m[nium]\033[0m %s\n' "$*"; }

if [ ! -f mach ]; then
  echo "[nium] Rode dentro da pasta do código do Firefox (onde fica o arquivo mach)."
  exit 1
fi

# O Git recusa pastas criadas por outro usuário do Windows ("dubious ownership"); o bootstrap
# precisa dele. Libera só as pastas do Firefox e das traduções.
for dir in "$PWD" "$PWD/../firefox-l10n"; do
  [ -d "$dir" ] || continue
  win="$(cd "$dir" && pwd -W 2>/dev/null || pwd)"
  git config --global --get-all safe.directory 2>/dev/null | grep -qxF "$win" || git config --global --add safe.directory "$win"
done

if [ -z "$NIUM_ONLY_INSTALLER" ]; then
say "1/6 Aplicando o Nium no código (modo lançamento)"
python "$KIT/scripts/apply.py" --release

export MOZCONFIG="$PWD/mozconfig-nium-release"

if [ ! -f "$HOME/.mozbuild/.nium-full-toolchain" ]; then
  say "2/6 Baixando as ferramentas da compilação completa (só na primeira vez)"
  ./mach --no-interactive bootstrap --application-choice "Firefox for Desktop"
  mkdir -p "$HOME/.mozbuild" && touch "$HOME/.mozbuild/.nium-full-toolchain"
else
  say "2/6 Ferramentas já instaladas"
fi

# Tarefas em paralelo: metade dos núcleos (todos de uma vez esgotam a memória e os compiladores
# travam com 0xC0000409). Para usar menos: NIUM_JOBS=4 bash .../build-release.sh
CORES="$(nproc 2>/dev/null || echo 8)"
JOBS="${NIUM_JOBS:-$(( CORES / 2 > 2 ? CORES / 2 : 2 ))}"
say "3/6 Compilando o Nium inteiro (a parte demorada) com $JOBS tarefas em paralelo"
./mach build -j"$JOBS"

say "4/6 Juntando o uBlock Origin e as regras do Nium (pasta distribution)"
python "$KIT/scripts/apply.py" --release

say "5/6 Empacotando com inglês e português"
./mach package
./mach package-multi-locale --locales en-US pt-BR

fi

export MOZCONFIG="$PWD/mozconfig-nium-release"
say "6/6 Gerando o instalador do Windows"
# O instalador é montado a partir do pacote .zip (com inglês e português) que o passo 5 gerou.
ZIP="$(ls -t obj-nium-release/dist/nium-*.win64.zip 2>/dev/null | head -1)"
if [ -z "$ZIP" ]; then
  echo "[nium] Não achei o pacote .zip em obj-nium-release/dist. O passo 5 terminou?"
  exit 1
fi
ZIP_WIN="$(cygpath -m "$PWD/$ZIP" 2>/dev/null || echo "$PWD/$ZIP")"
MAKE="$HOME/.mozbuild/mozmake/mozmake.exe"
[ -x "$MAKE" ] || MAKE="mozmake"
"$MAKE" -C obj-nium-release/browser/installer/windows installer ZIP_IN="$ZIP_WIN"

INST="$(ls -t obj-nium-release/dist/install/sea/*.exe 2>/dev/null | head -1)"
[ -n "$INST" ] || INST="$(find obj-nium-release/dist -maxdepth 3 -name '*installer*.exe' -newer "$ZIP" 2>/dev/null | head -1)"
if [ -n "$INST" ]; then
  say "Pronto! Instalador do Nium: $(cygpath -w "$PWD/$INST" 2>/dev/null || echo "$PWD/$INST")"
  ls -lh "$INST"
else
  echo "[nium] O instalador não apareceu. Mande um print das últimas linhas."
  exit 1
fi
