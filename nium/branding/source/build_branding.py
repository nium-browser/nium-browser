#!/usr/bin/env python3
# Gera nium/branding/nium (marca Nium para o Firefox) a partir da marca "unofficial" do Firefox.
import shutil, sys
from pathlib import Path
from PIL import Image

SRC = Path(sys.argv[1])      # .../browser/branding/unofficial
OUT = Path(sys.argv[2])      # .../nium/branding/nium
ART = Path(sys.argv[3])      # pasta com os PNGs renderizados
WORD = Path(sys.argv[4])     # wordmark.svg
if OUT.exists(): shutil.rmtree(OUT)
shutil.copytree(SRC, OUT)
png = lambda n, s: Image.open(ART / f'{n}-{s}.png').convert('RGBA')
def fit(n, size, w=None, h=None, pad=0.0, bg=None):
    w, h = w or size, h or size
    base = Image.new('RGBA', (w, h), bg or (0, 0, 0, 0))
    s = int(min(w, h) * (1 - pad))
    big = png(n, 512 if n != 'doc' else 256).resize((s, s), Image.LANCZOS)
    base.alpha_composite(big, ((w - s) // 2, (h - s) // 2))
    return base
def ico(path, n, sizes):
    imgs = [png(n, s) if (ART / f'{n}-{s}.png').exists() else fit(n, s) for s in sizes]
    imgs[-1].save(path, format='ICO', sizes=[(s, s) for s in sizes], append_images=imgs[:-1])

for s in (16, 22, 24, 32, 48, 64, 128, 256):
    (fit('icon', s) if not (ART / f'icon-{s}.png').exists() else png('icon', s)).save(OUT / f'default{s}.png')
ico(OUT / 'firefox.ico', 'icon', [16, 32, 48, 256])
ico(OUT / 'firefox64.ico', 'icon', [16, 32, 48, 64])
ico(OUT / 'newtab.ico', 'icon', [16, 32])
ico(OUT / 'newwindow.ico', 'icon', [16, 32])
ico(OUT / 'pbmode.ico', 'private', [16, 32, 48, 256])
ico(OUT / 'document.ico', 'doc', [16, 32, 48, 256])
fit('icon', 300, pad=0.22).save(OUT / 'VisualElements_150.png')
fit('icon', 142, pad=0.22).save(OUT / 'VisualElements_70.png')
fit('private', 300, pad=0.22).save(OUT / 'PrivateBrowsing_150.png')
fit('private', 142, pad=0.22).save(OUT / 'PrivateBrowsing_70.png')
c = OUT / 'content'
fit('icon', 192).save(c / 'about-logo.png'); fit('icon', 384).save(c / 'about-logo@2x.png')
fit('private', 192).save(c / 'about-logo-private.png'); fit('private', 384).save(c / 'about-logo-private@2x.png')
fit('icon', 0, w=300, h=236, pad=0.15).save(c / 'about.png')
shutil.copy(ART.parent / 'icon.svg', c / 'about-logo.svg')
word = WORD.read_text()
(c / 'about-wordmark.svg').write_text(word)
(c / 'firefox-wordmark.svg').write_text(word.replace('stroke="context-fill"', 'stroke="context-fill light-dark(#1f2b2e, #e9f1ed)"')
                                         .replace('fill="context-fill"', 'fill="context-fill light-dark(#1f2b2e, #e9f1ed)"'))
for f in (OUT / 'msix' / 'Assets').glob('*.png'):
    w, h = Image.open(f).size
    fit('doc' if f.name.startswith('Document') else 'icon', 0, w=w, h=h, pad=0.2 if w != h else 0.1).save(f)
# instalador (NSIS): cabeçalho branco e marca d'água verde
hdr = Image.new('RGB', (150, 57), 'white'); hdr.paste(png('icon', 48).convert('RGB'), (96, 4), png('icon', 48)); hdr.save(OUT / 'wizHeader.bmp')
hdr.transpose(Image.FLIP_LEFT_RIGHT).save(OUT / 'wizHeaderRTL.bmp')
wm = Image.new('RGB', (164, 314), (74, 109, 91)); ic = fit('icon', 96); wm.paste(ic.convert('RGB'), (34, 109), ic); wm.save(OUT / 'wizWatermark.bmp')

(OUT / 'configure.sh').write_text('''# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

MOZ_APP_DISPLAYNAME=Nium
MOZ_MACBUNDLE_ID=app.nium.browser
''')
ftl = (OUT / 'locales/en-US/brand.ftl').read_text()
for k, v in {'-brand-shorter-name = Nightly': '-brand-shorter-name = Nium', '-brand-short-name = Nightly': '-brand-short-name = Nium',
             '-brand-shortcut-name = Nightly': '-brand-shortcut-name = Nium', '-brand-full-name = Nightly': '-brand-full-name = Nium',
             '-brand-product-name = Firefox': '-brand-product-name = Nium', '-vendor-short-name = Mozilla': '-vendor-short-name = Nium'}.items():
    assert k in ftl, k; ftl = ftl.replace(k, v)
(OUT / 'locales/en-US/brand.ftl').write_text(ftl)
(OUT / 'locales/en-US/brand.properties').write_text((OUT / 'locales/en-US/brand.properties').read_text().replace('Nightly', 'Nium'))
nsi = (OUT / 'branding.nsi').read_text()
for k, v in {'"Mozilla Developer Preview"': '"Nium"', '"mozilla.org"': '"Nium"', '"https://www.mozilla.org"': '"https://niumbrowser.web.app"',
             '"https://support.mozilla.org"': '"https://niumbrowser.web.app"', '!define Channel "unofficial"': '!define Channel "release"'}.items():
    nsi = nsi.replace(k, v)
(OUT / 'branding.nsi').write_text(nsi)
for f in ('firefox.VisualElementsManifest.xml', 'private_browsing.VisualElementsManifest.xml'):
    p = OUT / f; p.write_text(p.read_text().replace("#14171a", "#0f181c"))
css = (c / 'aboutDialog.css').read_text().replace('#130829', '#0f181c').replace('hsla(235, 43%, 10%, 0.5)', 'hsla(195, 30%, 8%, 0.6)')
(c / 'aboutDialog.css').write_text(css)
print('ok', OUT)
