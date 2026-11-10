#!/usr/bin/env python3
"""Nium — Fase 7, parte 2: atualizações automáticas.

Python puro (não precisa instalar nada). Comandos:

  chaves                  cria o par de chaves de atualização do Nium (só uma vez na vida).
                          As chaves PRIVADAS ficam em ~/nium-chaves (fora do repositório; faça
                          backup num pendrive). Os certificados PÚBLICOS (.der) vão para
                          nium/update/certs/ e entram no nium.exe (o apply.py --release copia).
  assinar ENTRADA SAIDA   assina um pacote .mar com a chave principal.
  conferir ARQUIVO.mar    confere a assinatura com os certificados do repositório.
  xml ...                 gera o update.xml que o Nium lê no site (veja --help do comando).
  site PASTA_DO_SITE      põe o update.xml no site (Firebase) e acerta o firebase.json.

Formato do .mar e da assinatura: o mesmo do Firefox (modules/libmar/sign/mar_sign.c):
RSA PKCS#1 v1.5 com SHA-384, algoritmo 2, sobre o arquivo inteiro menos os bytes da assinatura.
"""
import argparse
import base64
import datetime
import hashlib
import json
import os
import random
import struct
import sys
from pathlib import Path

KIT = Path(__file__).resolve().parents[1]          # .../nium-browser/nium
CERTS = KIT / 'update' / 'certs'
KEYS = Path(os.environ.get('NIUM_CHAVES') or (Path.home() / 'nium-chaves'))
NAMES = ('primary', 'secondary')


def say(msg):
  print(f'[nium] {msg}', flush=True)


# ---- DER (só o necessário para chaves RSA e um certificado simples) ---------------------------

def _len(n):
  if n < 0x80:
    return bytes([n])
  b = n.to_bytes((n.bit_length() + 7) // 8, 'big')
  return bytes([0x80 | len(b)]) + b


def tlv(tag, body):
  return bytes([tag]) + _len(len(body)) + body


def der_int(v):
  b = v.to_bytes(max(1, (v.bit_length() + 8) // 8), 'big')   # sempre com bit de sinal livre
  return tlv(0x02, b)


def der_seq(*items):
  return tlv(0x30, b''.join(items))


def der_oid(dotted):
  parts = [int(x) for x in dotted.split('.')]
  out = bytearray([40 * parts[0] + parts[1]])
  for p in parts[2:]:
    chunk = [p & 0x7f]
    p >>= 7
    while p:
      chunk.append(0x80 | (p & 0x7f))
      p >>= 7
    out += bytes(reversed(chunk))
  return tlv(0x06, bytes(out))


NULL = b'\x05\x00'
RSA_ENC = der_seq(der_oid('1.2.840.113549.1.1.1'), NULL)
SHA256_RSA = der_seq(der_oid('1.2.840.113549.1.1.11'), NULL)
SHA384_PREFIX = bytes.fromhex('3041300d060960864801650304020205000430')
SHA256_PREFIX = bytes.fromhex('3031300d060960864801650304020105000420')


def der_read(buf, pos=0):
  """Lê um TLV; devolve (tag, conteúdo, próxima posição)."""
  tag = buf[pos]
  n = buf[pos + 1]
  pos += 2
  if n & 0x80:
    k = n & 0x7f
    n = int.from_bytes(buf[pos:pos + k], 'big')
    pos += k
  return tag, buf[pos:pos + n], pos + n


def der_ints(seq_body):
  out, pos = [], 0
  while pos < len(seq_body):
    tag, body, pos = der_read(seq_body, pos)
    if tag == 0x02:
      out.append(int.from_bytes(body, 'big'))
  return out


# ---- RSA ---------------------------------------------------------------------------------

_SMALL = [p for p in range(3, 2000, 2) if all(p % q for q in range(3, int(p ** 0.5) + 1, 2))]


def _probable_prime(n, rounds=40):
  for p in _SMALL:
    if n % p == 0:
      return n == p
  d, s = n - 1, 0
  while d % 2 == 0:
    d //= 2
    s += 1
  rng = random.SystemRandom()
  for _ in range(rounds):
    x = pow(rng.randrange(2, n - 2), d, n)
    if x in (1, n - 1):
      continue
    for _ in range(s - 1):
      x = pow(x, 2, n)
      if x == n - 1:
        break
    else:
      return False
  return True


def _prime(bits, e):
  rng = random.SystemRandom()
  while True:
    c = rng.getrandbits(bits) | (3 << (bits - 2)) | 1
    if (c - 1) % e and _probable_prime(c):
      return c


def rsa_generate(bits=4096, e=65537):
  while True:
    p, q = _prime(bits // 2, e), _prime(bits // 2, e)
    n = p * q
    if p != q and n.bit_length() == bits:
      break
  d = pow(e, -1, (p - 1) * (q - 1))
  return dict(n=n, e=e, d=d, p=p, q=q)


def key_to_pem(k):
  body = der_seq(der_int(0), *(der_int(k[x]) for x in ('n', 'e', 'd', 'p', 'q')),
                 der_int(k['d'] % (k['p'] - 1)), der_int(k['d'] % (k['q'] - 1)),
                 der_int(pow(k['q'], -1, k['p'])))
  b64 = base64.encodebytes(body).decode().replace('\n', '')
  lines = [b64[i:i + 64] for i in range(0, len(b64), 64)]
  return '-----BEGIN RSA PRIVATE KEY-----\n' + '\n'.join(lines) + '\n-----END RSA PRIVATE KEY-----\n'


def key_from_pem(text):
  b64 = ''.join(l for l in text.splitlines() if l and not l.startswith('-----'))
  if 'BEGIN RSA PRIVATE KEY' not in text:
    sys.exit('[nium] chave em formato desconhecido (esperava "BEGIN RSA PRIVATE KEY")')
  _, body, _ = der_read(base64.b64decode(b64))
  v = der_ints(body)
  return dict(n=v[1], e=v[2], d=v[3], p=v[4], q=v[5])


def rsa_sign(k, prefix, digest):
  size = (k['n'].bit_length() + 7) // 8
  t = prefix + digest
  em = b'\x00\x01' + b'\xff' * (size - len(t) - 3) + b'\x00' + t
  m = int.from_bytes(em, 'big')
  # CRT (mais rápido) e conferência contra erro
  p, q = k['p'], k['q']
  s1, s2 = pow(m, k['d'] % (p - 1), p), pow(m, k['d'] % (q - 1), q)
  s = s2 + q * ((pow(q, -1, p) * (s1 - s2)) % p)
  if pow(s, k['e'], k['n']) != m:
    sys.exit('[nium] erro interno na assinatura')
  return s.to_bytes(size, 'big')


def rsa_verify(n, e, prefix, digest, sig):
  size = (n.bit_length() + 7) // 8
  if len(sig) != size:
    return False
  em = pow(int.from_bytes(sig, 'big'), e, n).to_bytes(size, 'big')
  t = prefix + digest
  return em == b'\x00\x01' + b'\xff' * (size - len(t) - 3) + b'\x00' + t


def make_cert(k, cn):
  """Certificado X.509 autoassinado: só serve para levar a chave pública até o updater."""
  name = der_seq(tlv(0x31, der_seq(der_oid('2.5.4.3'), tlv(0x0c, cn.encode()))))
  spki = der_seq(RSA_ENC, tlv(0x03, b'\x00' + der_seq(der_int(k['n']), der_int(k['e']))))
  now = datetime.datetime.now(datetime.timezone.utc)
  start = tlv(0x17, now.strftime('%y%m%d000000Z').encode())
  end = tlv(0x18, (now.replace(year=now.year + 30)).strftime('%Y%m%d000000Z').encode())
  serial = random.SystemRandom().getrandbits(63) | 1
  tbs = der_seq(tlv(0xa0, der_int(2)), der_int(serial), SHA256_RSA, name,
                der_seq(start, end), name, spki)
  sig = rsa_sign(k, SHA256_PREFIX, hashlib.sha256(tbs).digest())
  return der_seq(tbs, SHA256_RSA, tlv(0x03, b'\x00' + sig))


def cert_pubkey(der):
  """(n, e) do certificado."""
  _, cert, _ = der_read(der)
  _, tbs, _ = der_read(cert)
  pos, fields = 0, []
  while pos < len(tbs):
    tag, body, pos = der_read(tbs, pos)
    fields.append((tag, body))
  if fields[0][0] == 0xa0:
    fields = fields[1:]
  spki = fields[5][1]            # serial, alg, issuer, validity, subject, spki
  _, _, p = der_read(spki)       # AlgorithmIdentifier
  _, bits, _ = der_read(spki, p)
  _, rsa, _ = der_read(bits[1:])
  n, e = der_ints(rsa)
  return n, e


# ---- MAR -------------------------------------------------------------------------------

SIG_ALGO = 2   # RSA-PKCS1-SHA384


def _mar_layout(data):
  if data[:4] != b'MAR1':
    sys.exit('[nium] isso não é um pacote .mar')
  off_index, = struct.unpack('>I', data[4:8])
  size, nsig = struct.unpack('>QI', data[8:20])
  if size != len(data):
    sys.exit('[nium] .mar sem o bloco de assinatura (formato antigo) ou corrompido')
  return off_index, nsig


def mar_sign(src, dst, key):
  data = Path(src).read_bytes()
  off_index, nsig = _mar_layout(data)
  if nsig:
    sys.exit('[nium] este .mar já está assinado')
  siglen = (key['n'].bit_length() + 7) // 8
  section = 8 + siglen
  head = bytearray(b'MAR1')
  head += struct.pack('>I', off_index + section)
  head += struct.pack('>QI', len(data) + section, 1)
  head += struct.pack('>II', SIG_ALGO, siglen)
  sig_at = len(head)
  head += b'\0' * siglen
  body = data[20:off_index]
  ilen, = struct.unpack('>I', data[off_index:off_index + 4])
  index = bytearray(data[off_index + 4:off_index + 4 + ilen])
  pos = 0
  while pos < len(index):        # cada item: posição, tamanho, flags, nome\0
    o, = struct.unpack('>I', index[pos:pos + 4])
    index[pos:pos + 4] = struct.pack('>I', o + section)
    pos = index.index(b'\0', pos + 12) + 1
  out = bytes(head) + body + data[off_index:off_index + 4] + bytes(index) + data[off_index + 4 + ilen:]
  digest = hashlib.sha384(out[:sig_at] + out[sig_at + siglen:]).digest()
  sig = rsa_sign(key, SHA384_PREFIX, digest)
  out = out[:sig_at] + sig + out[sig_at + siglen:]
  Path(dst).write_bytes(out)
  return out


def mar_verify(path, certs):
  data = Path(path).read_bytes()
  _mar_layout(data)
  nsig, = struct.unpack('>I', data[16:20])
  pos, sigs, skip = 20, [], []
  for _ in range(nsig):
    algo, ln = struct.unpack('>II', data[pos:pos + 8])
    sigs.append((algo, data[pos + 8:pos + 8 + ln]))
    skip.append((pos + 8, pos + 8 + ln))
    pos += 8 + ln
  h = hashlib.sha384()
  last = 0
  for a, b in skip:
    h.update(data[last:a])
    last = b
  h.update(data[last:])
  digest = h.digest()
  for name, der in certs:
    n, e = cert_pubkey(der)
    for algo, sig in sigs:
      if algo == SIG_ALGO and rsa_verify(n, e, SHA384_PREFIX, digest, sig):
        return name
  return None


def mar_info(data):
  """Canal e versão gravados no bloco de informações do .mar."""
  pos = 20
  nsig, = struct.unpack('>I', data[16:20])
  for _ in range(nsig):
    _, ln = struct.unpack('>II', data[pos:pos + 8])
    pos += 8 + ln
  nblocks, = struct.unpack('>I', data[pos:pos + 4])
  pos += 4
  for _ in range(nblocks):
    size, bid = struct.unpack('>II', data[pos:pos + 8])
    if bid == 1:
      parts = data[pos + 8:pos + size].split(b'\0')
      return parts[0].decode(), parts[1].decode()
    pos += size
  return None, None


# ---- comandos ----------------------------------------------------------------------------

def cmd_chaves(a):
  KEYS.mkdir(parents=True, exist_ok=True)
  CERTS.mkdir(parents=True, exist_ok=True)
  for name in NAMES:
    pem = KEYS / f'nium-update-{name}.pem'
    if pem.exists():
      say(f'{pem} já existe: não vou trocar (trocar as chaves quebra a atualização de quem já instalou)')
      continue
    say(f'criando a chave {name} (RSA 4096; pode levar um minuto)...')
    k = rsa_generate()
    pem.write_text(key_to_pem(k), encoding='ascii')
    try:
      os.chmod(pem, 0o600)
    except OSError:
      pass
    (CERTS / f'{name}.der').write_bytes(make_cert(k, f'Nium update {name}'))
    say(f'chave privada: {pem}')
  say(f'certificados públicos em {CERTS} (esses podem ir para o GitHub)')
  say(f'FAÇA BACKUP da pasta {KEYS} (pendrive ou gerenciador de senhas). Sem ela não dá para lançar '
      'atualizações para quem já instalou o Nium. Nunca mande essa pasta para o GitHub.')


def _key():
  pem = KEYS / 'nium-update-primary.pem'
  if not pem.exists():
    sys.exit(f'[nium] não achei {pem}. Rode primeiro: python nium-update.py chaves')
  return key_from_pem(pem.read_text(encoding='ascii'))


def _certs():
  out = [(n, (CERTS / f'{n}.der').read_bytes()) for n in NAMES if (CERTS / f'{n}.der').exists()]
  if not out:
    sys.exit(f'[nium] sem certificados em {CERTS}')
  return out


def cmd_assinar(a):
  mar_sign(a.entrada, a.saida, _key())
  who = mar_verify(a.saida, _certs())
  if not who:
    sys.exit('[nium] a assinatura não confere com os certificados do repositório!')
  say(f'assinado e conferido ({who}): {a.saida}')


def cmd_conferir(a):
  who = mar_verify(a.arquivo, _certs())
  data = Path(a.arquivo).read_bytes()
  chan, ver = mar_info(data)
  if not who:
    sys.exit(f'[nium] assinatura NÃO confere ({a.arquivo})')
  say(f'assinatura ok ({who}); canal {chan}, versão {ver}')


def _ini(text, section, key):
  cur = None
  for line in text.splitlines():
    line = line.strip()
    if line.startswith('['):
      cur = line[1:-1]
    elif cur == section and line.split('=', 1)[0] == key:
      return line.split('=', 1)[1]
  return None


def cmd_xml(a):
  import zipfile
  with zipfile.ZipFile(a.zip) as z:
    ini = next(n for n in z.namelist() if n.count('/') == 1 and n.endswith('/application.ini'))
    text = z.read(ini).decode('utf-8')
  version = _ini(text, 'App', 'Version')
  build = _ini(text, 'App', 'BuildID')
  mar = Path(a.mar).read_bytes()
  if not mar_verify(a.mar, _certs()):
    sys.exit('[nium] o .mar não está assinado com a chave do Nium')
  from xml.sax.saxutils import quoteattr as q
  details = a.detalhes or 'https://niumbrowser.web.app/'
  xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<updates>\n'
         f'  <update type="minor" displayVersion={q(a.versao)} appVersion={q(version)} '
         f'platformVersion={q(version)} buildID={q(build)} detailsURL={q(details)}>\n'
         f'    <patch type="complete" URL={q(a.url)} size="{len(mar)}" hashFunction="sha512" '
         f'hashValue="{hashlib.sha512(mar).hexdigest()}"/>\n'
         '  </update>\n</updates>\n')
  Path(a.saida).write_text(xml, encoding='utf-8')
  say(f'update.xml: Nium {a.versao} (Firefox {version}, build {build}) -> {a.saida}')


UPDATE_DEST = '/update/release.xml'
UPDATE_REWRITE = {'source': '/update/**', 'destination': UPDATE_DEST}
UPDATE_HEADERS = {'source': '/update/**', 'headers': [
  {'key': 'Cache-Control', 'value': 'no-cache, max-age=0'}]}   # versão nova aparece na hora


def cmd_site(a):
  site = Path(a.pasta)
  cfg_path = site / 'firebase.json'
  if not cfg_path.exists():
    sys.exit(f'[nium] não achei {cfg_path}')
  cfg = json.loads(cfg_path.read_text(encoding='utf-8'))
  hosting = cfg.get('hosting')
  if isinstance(hosting, list):
    hosting = hosting[0]
  if not hosting:
    sys.exit('[nium] o firebase.json não tem "hosting"')
  public = site / hosting.get('public', 'public')
  dest = public / UPDATE_DEST.lstrip('/')
  dest.parent.mkdir(parents=True, exist_ok=True)
  dest.write_bytes(Path(a.xml).read_bytes())
  rewrites = hosting.setdefault('rewrites', [])
  rewrites[:] = [r for r in rewrites if r.get('source') != UPDATE_REWRITE['source']]
  rewrites.insert(0, UPDATE_REWRITE)      # antes de qualquer "**" do site
  headers = hosting.setdefault('headers', [])
  headers[:] = [h for h in headers if h.get('source') != UPDATE_HEADERS['source']]
  headers.append(UPDATE_HEADERS)
  cfg_path.write_text(json.dumps(cfg, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
  say(f'site pronto: {dest} e firebase.json. Agora: cd "{site}" && firebase deploy --only hosting')


def main():
  p = argparse.ArgumentParser(description='Atualizações do Nium')
  sub = p.add_subparsers(dest='cmd', required=True)
  sub.add_parser('chaves').set_defaults(f=cmd_chaves)
  s = sub.add_parser('assinar')
  s.add_argument('entrada')
  s.add_argument('saida')
  s.set_defaults(f=cmd_assinar)
  s = sub.add_parser('conferir')
  s.add_argument('arquivo')
  s.set_defaults(f=cmd_conferir)
  s = sub.add_parser('xml')
  s.add_argument('--zip', required=True, help='o pacote nium-*.win64.zip da compilação')
  s.add_argument('--mar', required=True, help='o .mar assinado')
  s.add_argument('--url', required=True, help='endereço do .mar no GitHub Releases')
  s.add_argument('--versao', required=True, help='versão do Nium (ex.: 1.0.1)')
  s.add_argument('--detalhes', help='página "o que há de novo"')
  s.add_argument('--saida', default='update.xml')
  s.set_defaults(f=cmd_xml)
  s = sub.add_parser('site')
  s.add_argument('pasta', help='pasta do site (onde fica o firebase.json)')
  s.add_argument('--xml', default='update.xml')
  s.set_defaults(f=cmd_site)
  a = p.parse_args()
  a.f(a)


if __name__ == '__main__':
  main()
