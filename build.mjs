/**
 * build.mjs — build do site estático "Kit Cravejado Lucrativo"
 *
 * O que faz:
 *  1. Lê src/index.html (versão única, com imagens embutidas em base64).
 *  2. Extrai cada imagem para dist/assets/ (arquivos .webp/.png reais, com cache).
 *  3. Gera dist/index.html "enxuto" (~30 KB) apontando para dist/assets/.
 *  4. Copia .htaccess, favicons, og-image, robots.txt, sitemap.xml, 404.html.
 *  5. Valida o resultado e falha (exit 1) se encontrar qualquer problema.
 *
 * Sem dependências externas. Requer Node.js 18+.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const ASSETS = path.join(DIST, 'assets');

const CHECKOUT = 'https://pay.cakto.com.br/uf88doo_1089889';
const STATIC_FILES = [
  '.htaccess', 'robots.txt', 'sitemap.xml', '404.html',
  'favicon.ico', 'favicon-32.png', 'apple-touch-icon.png', 'og-image.jpg',
];

const log = (...a) => console.log(...a);
const fail = (msg) => { console.error('\n❌ BUILD FALHOU: ' + msg + '\n'); process.exit(1); };

// ---- 1. limpar dist/ ----
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(ASSETS, { recursive: true });

// ---- 2. ler fonte ----
const srcHtmlPath = path.join(SRC, 'index.html');
if (!fs.existsSync(srcHtmlPath)) fail('src/index.html não encontrado.');
let html = fs.readFileSync(srcHtmlPath, 'utf8');

// ---- 3. extrair imagens base64 -> arquivos ----
const EXT = { webp: 'webp', png: 'png', jpeg: 'jpg', gif: 'gif', 'svg+xml': 'svg' };
const seen = new Map();          // hash -> filename
let idx = 0;
let extracted = 0;
let reused = 0;

html = html.replace(
  /(src|href)="data:image\/([a-z+]+);base64,([^"]+)"/g,
  (_m, attr, mime, b64) => {
    const ext = EXT[mime] || 'bin';
    const buf = Buffer.from(b64, 'base64');
    const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8);
    let name = seen.get(hash);
    if (!name) {
      idx += 1;
      name = `img-${String(idx).padStart(2, '0')}-${hash}.${ext}`;
      fs.writeFileSync(path.join(ASSETS, name), buf);
      seen.set(hash, name);
      extracted += 1;
    } else {
      reused += 1;
    }
    return `${attr}="assets/${name}"`;
  }
);

// ---- 4. gravar HTML final ----
fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');

// ---- 5. copiar estáticos ----
for (const f of STATIC_FILES) {
  const from = path.join(SRC, f);
  if (!fs.existsSync(from)) fail(`arquivo estático ausente em src/: ${f}`);
  fs.copyFileSync(from, path.join(DIST, f));
}

// ================= VALIDAÇÃO =================
const out = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const problems = [];

if (!out.trimStart().startsWith('<!DOCTYPE html')) problems.push('HTML não começa com <!DOCTYPE html>');
if (!out.trimEnd().endsWith('</html>')) problems.push('HTML não termina com </html>');
if (/data:image\//.test(out)) problems.push('ainda restam imagens base64 no HTML final');
if (/<script[\s>]/i.test(out)) problems.push('há <script> no HTML (deveria ser 100% estático)');
if (/<iframe[\s>]/i.test(out)) problems.push('há <iframe> no HTML');

const checkoutCount = (out.match(new RegExp(CHECKOUT.replace(/[.]/g, '\\.'), 'g')) || []).length;
if (checkoutCount !== 2) problems.push(`esperava 2 links de checkout, encontrou ${checkoutCount}`);

const anchorCount = (out.match(/href="#oferta"/g) || []).length;
if (anchorCount !== 4) problems.push(`esperava 4 âncoras #oferta, encontrou ${anchorCount}`);

// todos os assets referenciados existem?
const refs = [...out.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)].map((m) => m[1]);
for (const r of new Set(refs)) {
  if (!fs.existsSync(path.join(DIST, r))) problems.push(`asset referenciado não existe: ${r}`);
}
// todos os assets gerados são usados?
for (const f of fs.readdirSync(ASSETS)) {
  if (!refs.includes(`assets/${f}`)) problems.push(`asset órfão (não referenciado): assets/${f}`);
}

if (problems.length) fail('\n  - ' + problems.join('\n  - '));

// ---- avisos (não bloqueiam) ----
if (out.includes('COLOQUE-SEU-DOMINIO-AQUI')) {
  log('\n⚠  AVISO: o placeholder "COLOQUE-SEU-DOMINIO-AQUI" ainda está no HTML.');
  log('   Troque pelo seu domínio real (og:url, og:image, canonical) antes de publicar.');
  log('   Veja DEPLOY_HOSTINGER.md > "Configuração de domínio".');
}

// ================= RESUMO =================
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
const distSize = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce((s, d) => {
    const p = path.join(dir, d.name);
    return s + (d.isDirectory() ? distSize(p) : fs.statSync(p).size);
  }, 0);

log('\n✅ BUILD OK — pasta dist/ pronta para upload.\n');
log(`   src/index.html   ${kb(fs.statSync(srcHtmlPath).size)}  (fonte, imagens embutidas)`);
log(`   dist/index.html  ${kb(fs.statSync(path.join(DIST, 'index.html')).size)}  (produção, imagens externas)`);
log(`   dist/assets/     ${extracted} imagens (${reused} duplicadas reaproveitadas)`);
log(`   dist/ total      ${kb(distSize(DIST))}`);
log('');
