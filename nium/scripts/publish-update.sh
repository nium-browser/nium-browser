#!/bin/bash
# Nium — Fase 7, parte 2: publica uma versão nova como atualização automática.
#
# Rode no MozillaBuild, dentro da pasta do código do Firefox, DEPOIS do build-release.sh:
#     cd /e/mozilla-source/firefox/firefox
#     bash ../nium-browser/nium/scripts/publish-update.sh 1.0.0
#
# O que faz, nesta ordem (a ordem importa: o site só anuncia depois que o arquivo existe):
#   1. junta o instalador e o pacote .mar com o número da versão;
#   2. cria a versão no GitHub Releases (nium-browser/nium-browser) com os dois arquivos
#      (usa o "gh" se estiver instalado; senão explica como subir pelo site do GitHub e espera);
#   3. confere que o .mar já pode ser baixado;
#   4. gera o update.xml e coloca no site (pasta do niumsite, firebase.json acertado).
# Depois é só rodar o "firebase deploy" que ele mostra no final. Os Niums instalados procuram
# atualização uma vez por dia (ou na hora, em Ajuda > Sobre o Nium).
#
# Pasta do site diferente? NIUM_SITE=/e/caminho/do/site bash .../publish-update.sh 1.0.0
set -e
KIT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="nium-browser/nium-browser"
say() { printf '\n\033[1;32m[nium]\033[0m %s\n' "$*"; }

VERSION="$1"
if ! printf '%s' "$VERSION" | grep -qE '^[0-9]+\.[0-9]+(\.[0-9]+)?$'; then
  echo "[nium] Diga a versão do Nium. Exemplo: bash .../publish-update.sh 1.0.0"
  exit 1
fi
if [ ! -f mach ]; then
  echo "[nium] Rode dentro da pasta do código do Firefox (onde fica o arquivo mach)."
  exit 1
fi

DIST="obj-nium-release/dist"
UPD="$DIST/update"
ZIP="$(ls -t $DIST/nium-*.win64.zip 2>/dev/null | head -1)"
INST="$(ls -t $DIST/install/sea/*.exe 2>/dev/null | head -1)"
if [ -z "$ZIP" ] || [ -z "$INST" ] || [ ! -f "$UPD/nium.complete.mar" ]; then
  echo "[nium] Falta o pacote, o instalador ou o .mar. Rode antes o build-release.sh."
  exit 1
fi
if [ "$UPD/nium.complete.mar" -ot "$ZIP" ]; then
  echo "[nium] O .mar é mais velho que o pacote .zip. Rode: NIUM_ONLY_INSTALLER=1 bash .../build-release.sh"
  exit 1
fi

TAG="v$VERSION"
MAR="nium-$VERSION.complete.mar"
SETUP="nium-$VERSION-setup.exe"
URL="https://github.com/$REPO/releases/download/$TAG/$MAR"

say "1/4 Preparando os arquivos da versão $VERSION"
OUT="$UPD/$TAG"
mkdir -p "$OUT"
cp -f "$UPD/nium.complete.mar" "$OUT/$MAR"
cp -f "$INST" "$OUT/$SETUP"
python "$KIT/scripts/nium-update.py" conferir "$OUT/$MAR"
python "$KIT/scripts/nium-update.py" xml --zip "$ZIP" --mar "$OUT/$MAR" --url "$URL" \
  --versao "$VERSION" --saida "$OUT/update.xml"

say "2/4 Publicando no GitHub Releases ($REPO, $TAG)"
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  if gh release view "$TAG" --repo "$REPO" >/dev/null 2>&1; then
    gh release upload "$TAG" "$OUT/$MAR" "$OUT/$SETUP" --repo "$REPO" --clobber
  else
    gh release create "$TAG" "$OUT/$MAR" "$OUT/$SETUP" --repo "$REPO" \
      --title "Nium $VERSION" --notes "Nium $VERSION para Windows (64 bits). Baixe o $SETUP para instalar; quem já tem o Nium recebe sozinho."
  fi
else
  WIN_OUT="$(cygpath -w "$PWD/$OUT" 2>/dev/null || echo "$PWD/$OUT")"
  echo "O GitHub CLI (gh) não está instalado ou logado. Faça pelo site:"
  echo "  1. abra https://github.com/$REPO/releases/new"
  echo "  2. em \"Choose a tag\" escreva $TAG (Create new tag); título: Nium $VERSION"
  echo "  3. arraste estes dois arquivos da pasta $WIN_OUT :"
  echo "       $MAR"
  echo "       $SETUP"
  echo "  4. clique em Publish release"
  read -r -p "Quando publicar, aperte Enter para continuar... " _
fi

say "3/4 Conferindo se o pacote já pode ser baixado"
SIZE_OK=""
for i in 1 2 3 4 5 6; do
  CODE="$(curl -sL -o /dev/null -w '%{http_code}' -r 0-0 "$URL" || true)"
  if [ "$CODE" = "206" ] || [ "$CODE" = "200" ]; then SIZE_OK=1; break; fi
  echo "  ainda não (HTTP $CODE); tentando de novo em 10 s..."
  sleep 10
done
if [ -z "$SIZE_OK" ]; then
  echo "[nium] O GitHub ainda não entrega $URL. Confira a versão no GitHub e rode este script de novo."
  exit 1
fi

say "4/4 Anunciando a versão no site (update.xml)"
SITE="${NIUM_SITE:-/e/Programacaoprojetos/niumsite/y}"
if [ -f "$SITE/firebase.json" ]; then
  python "$KIT/scripts/nium-update.py" site "$SITE" --xml "$OUT/update.xml"
  say "Falta só publicar o site:  cd \"$SITE\" && firebase deploy --only hosting"
else
  echo "[nium] Não achei o site em $SITE (firebase.json). Use NIUM_SITE=/caminho/do/site e rode de novo."
  echo "O update.xml está em $OUT/update.xml"
  exit 1
fi
