# Atualizações do Nium

- `certs/primary.der` e `certs/secondary.der`: certificados **públicos** da chave de atualização.
  O `apply.py --release` coloca os dois dentro do updater (no lugar dos da Mozilla), então o Nium
  só instala pacotes `.mar` assinados por nós. Criados uma vez com `scripts/nium-update.py chaves`.
- As chaves **privadas** ficam só no computador de quem lança versões, em `~/nium-chaves`
  (fora do repositório; o `.gitignore` bloqueia `*.pem`). Guarde um backup: sem elas não dá para
  atualizar quem já instalou o Nium.
- O Nium pergunta em `https://niumbrowser.web.app/update/6/Nium/<versão>/.../update.xml`; o site
  responde sempre com `update/release.xml` (a versão mais nova). O Nium ignora o que não for mais
  novo que ele.
- O pacote `.mar` e o instalador ficam no GitHub Releases deste repositório.
- Lançar: `scripts/build-release.sh` e depois `scripts/publish-update.sh <versão>`.
