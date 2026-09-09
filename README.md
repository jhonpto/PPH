# Kit Cravejado Lucrativo — Landing Page

Página de vendas (landing page) do produto digital **Kit Cravejado Lucrativo**.
Site **100% estático**: HTML + CSS, sem JavaScript de runtime, sem backend, sem
banco de dados. Roda em qualquer hospedagem de arquivos estáticos (Hostinger,
Netlify, GitHub Pages, etc.).

> **Vai publicar na Hostinger?** Leia o [`DEPLOY_HOSTINGER.md`](./DEPLOY_HOSTINGER.md) —
> tem o passo a passo completo.

---

## Estrutura

```
kit-cravejado-lucrativo/
├── src/                      # FONTE (o que você edita)
│   ├── index.html            # a landing page (imagens embutidas em base64)
│   ├── .htaccess             # regras do servidor (HTTPS, cache, compressão)
│   ├── 404.html              # página de erro
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── favicon.ico / favicon-32.png / apple-touch-icon.png
│   └── og-image.jpg          # imagem de compartilhamento (WhatsApp/redes)
├── build.mjs                 # script de build (Node puro, sem dependências)
├── package.json
├── .env.example              # (não há variáveis de ambiente — só documentação)
├── .gitignore
├── DEPLOY_HOSTINGER.md
└── dist/                     # SAÍDA do build (gerada, não versionada)
    ├── index.html            # ~34 KB, imagens apontando para assets/
    ├── assets/               # 14 imagens .webp/.png
    └── (demais arquivos copiados de src/)
```

## Tecnologia

| Item | Valor |
|---|---|
| Linguagem | HTML5 + CSS3 (CSS embutido no `<style>`) |
| JavaScript | Nenhum em runtime |
| Fontes | Google Fonts (Fraunces + Nunito) via `<link>` |
| Build | Node.js 18+ (script próprio, sem framework) |
| Gerenciador de pacotes | npm |
| Backend / Banco / Auth | Nenhum |

## Rodar localmente

```bash
npm install          # instala só o "serve" (servidor estático de dev)
npm run dev          # abre src/ em http://localhost:3000 (preview rápido)
npm run build        # gera dist/
npm run preview      # faz o build e serve dist/ em http://localhost:3000
```

Também dá para simplesmente **abrir `src/index.html` no navegador** (clique duplo).

## O que o build faz

1. Lê `src/index.html` (imagens embutidas em base64, ~1,3 MB).
2. Extrai cada imagem para `dist/assets/*.webp|png` (arquivos reais, cacheáveis).
3. Gera `dist/index.html` enxuto (~34 KB) apontando para `assets/`.
4. Copia `.htaccess`, favicons, `og-image.jpg`, `robots.txt`, `sitemap.xml`, `404.html`.
5. **Valida** o resultado (links, imagens, ausência de `<script>`/`<iframe>`, etc.)
   e falha se achar qualquer problema.

## Antes de publicar

1. **Domínio:** troque `COLOQUE-SEU-DOMINIO-AQUI` pelo seu domínio real em
   `src/index.html`, `src/robots.txt` e `src/sitemap.xml`. Rode `npm run build`.
2. **Checkout:** o link da Cakto (`https://pay.cakto.com.br/uf88doo_1089889`)
   já está configurado nos 2 botões finais. Para trocar, edite `src/index.html`
   (2 ocorrências) e rode `npm run build`.

## Fluxo dos botões (intencional)

- **Cabeçalho, Hero, Prova, "Como funciona"** → rolam até a seção **"Veja o que
  vai receber"** (`#oferta`), para o visitante ver as entregas e a ancoragem de
  preço antes de comprar.
- **Botão do recibo** e **CTA final do rodapé** → vão direto para o **checkout**.

## Licença / uso

Material proprietário do produto Kit Cravejado Lucrativo. Uso restrito ao titular.
