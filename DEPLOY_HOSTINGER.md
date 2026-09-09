# DEPLOY_HOSTINGER.md
### Kit Cravejado Lucrativo — guia de publicação na Hostinger

Documento gerado em 2026-09-06. Cobre análise técnica, correções feitas,
testes realizados e o passo a passo exato para colocar no ar.

---

## 0. Resumo executivo

Este projeto é uma **landing page 100% estática** (HTML + CSS). Não tem
servidor Node, banco de dados, autenticação, API nem webhook próprios.

**Publicar = enviar arquivos para a pasta `public_html/` da Hostinger.**
Não é preciso "rodar" nada em produção. O plano de **Hospedagem de Sites**
compartilhada da Hostinger (o mais barato) já atende.

O único serviço externo é o **checkout da Cakto** (link em 2 botões) e as
**Google Fonts** (carregadas via `<link>`, sem chave).

---

## 1. Análise do projeto (as 10 perguntas)

| # | Pergunta | Resposta |
|---|---|---|
| 1 | **Framework e tecnologias** | HTML5 + CSS3 puro. CSS embutido no `<style>`. **Zero JavaScript em runtime.** Fontes: Google Fonts (Fraunces + Nunito). Imagens: WebP/PNG. Nenhum framework (sem React/Next/Vue/etc.). |
| 2 | **Versão recomendada do Node.js** | **Node 18 LTS ou superior** — usado **apenas em desenvolvimento** para rodar `build.mjs`. **Produção não usa Node.** (testado com Node 22.17.0) |
| 3 | **Gerenciador de pacotes** | **npm**. Única dependência de dev: `serve` (servidor estático local). |
| 4 | **Comando de instalação** | `npm install` |
| 5 | **Comando de build** | `npm run build`  (executa `node build.mjs`) |
| 6 | **Comando de inicialização em produção** | **Nenhum.** O servidor web da Hostinger (LiteSpeed) serve os arquivos diretamente. Para preview local: `npm run preview`. |
| 7 | **Diretório de saída do build** | **`dist/`** |
| 8 | **Variáveis de ambiente** | **Nenhuma.** Ver `.env.example` (existe só para documentar isso). O que é "configurável" fica no código: o link do checkout e o domínio (placeholders). |
| 9 | **Serviços externos / APIs / banco / auth / storage / webhooks** | **Banco:** nenhum. **Auth:** nenhuma. **Storage:** nenhum. **APIs:** nenhuma. **Webhooks:** nenhum no site (o rastreio de vendas, se houver, é configurado no painel da Cakto). **Externos:** (a) Google Fonts — `fonts.googleapis.com` / `fonts.gstatic.com`, sem chave; (b) Checkout Cakto — `https://pay.cakto.com.br/uf88doo_1089889`, apenas link `<a href>`. |
| 10 | **Estático ou Node?** | **100% estático.** Pode ser publicado como site estático em qualquer hospedagem. **Não precisa rodar como aplicação Node.js.** |

---

## 2. Correções feitas para produção

| Item | O que foi feito |
|---|---|
| Peso da página | A versão fonte tinha **1,3 MB** num único HTML (imagens em base64) — ruim para celular. O build passou a **externalizar as 14 imagens** para `dist/assets/`. Resultado: `dist/index.html` = **34 KB (8,8 KB gzip)**, imagens carregam depois e ficam em cache 1 ano. |
| SEO / compartilhamento | Adicionadas as meta tags que **faltavam**: `description`, `canonical`, **Open Graph** e **Twitter Card** + imagem de compartilhamento `og-image.jpg` (1200×630). Antes, ao colar o link no WhatsApp, não aparecia prévia. |
| Favicon | Criados `favicon.ico`, `favicon-32.png` e `apple-touch-icon.png` a partir da marca. |
| `.htaccess` | Criado com: redirecionamento **HTTPS**, **compressão** (gzip/brotli), **cache** de estáticos (1 ano) e cabeçalhos de segurança (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`). |
| Página 404 | Criada `404.html` com a identidade visual, registrada no `.htaccess`. |
| `robots.txt` / `sitemap.xml` | Criados (com placeholder de domínio). |
| `.gitignore` | Criado — bloqueia `node_modules/`, `dist/`, `.env*`, `*.zip`, logs e lixo de SO. |
| `.env.example` | Criado — deixa explícito que **não há variáveis de ambiente** e onde ficam os valores configuráveis. |
| `package.json` | Criado com scripts `build`, `dev`, `preview`, `start` e `engines.node >= 18`. |
| Validação automática | `build.mjs` **falha o build** se detectar: imagem base64 remanescente, `<script>`/`<iframe>`, número errado de links de checkout/âncora, ou asset quebrado. |

**Nenhuma funcionalidade foi removida.** Conteúdo, textos, imagens, animação
das receitas, seções e comportamento dos botões estão idênticos.

---

## 3. Como buildar (local)

```bash
cd kit-cravejado-lucrativo
npm install
npm run build
```

Saída esperada (build sem erros):

```
✅ BUILD OK — pasta dist/ pronta para upload.

   src/index.html   1308.3 KB  (fonte, imagens embutidas)
   dist/index.html  33.6 KB    (produção, imagens externas)
   dist/assets/     14 imagens
   dist/ total      ~1150 KB
```

> ⚠ O build mostra um **aviso** enquanto o placeholder `COLOQUE-SEU-DOMINIO-AQUI`
> não for trocado. É só aviso — o build conclui com sucesso (exit 0).

---

## 4. Variáveis de ambiente

**Não há.** O arquivo `.env.example` existe apenas para documentar.

Valores configuráveis (ficam no código, versionados):

| O quê | Onde | Valor atual |
|---|---|---|
| Link do checkout | `src/index.html` (2×: botão do recibo + CTA final) | `https://pay.cakto.com.br/uf88doo_1089889` |
| Domínio (SEO) | `src/index.html`, `src/robots.txt`, `src/sitemap.xml` | `COLOQUE-SEU-DOMINIO-AQUI` (trocar) |

Depois de editar qualquer um → `npm run build`.

---

## 5. Configuração do banco de dados

**Não se aplica.** O projeto não tem banco de dados, ORM, migrations nem seed.
Não há nada a configurar.

---

## 6. Configuração de domínio (Hostinger)

1. **hPanel → Sites**. Se o domínio já é da Hostinger, ele aparece aqui.
2. **Domínio registrado em outro lugar?** Duas opções:
   - **Nameservers (recomendado):** no registrador, aponte para
     `ns1.dns-parking.com` e `ns2.dns-parking.com` (confirme os NS exatos no
     hPanel → Domínios). Propagação: até 24 h (geralmente < 1 h).
   - **Registro A:** crie um registro `A` de `@` (e `www`) apontando para o
     **IP do seu plano** (hPanel → Hospedagem → Detalhes do plano → Endereço IP).
3. **www vs sem www:** o `.htaccess` não força uma versão. Se quiser padronizar,
   configure o redirecionamento em **hPanel → Avançado → Redirecionamentos**.
4. **SSL (obrigatório antes de usar o `.htaccess`):**
   **hPanel → Segurança → SSL → Instalar** (Let's Encrypt, grátis, ~15 min).
   O `.htaccess` força HTTPS — **se o SSL ainda não estiver ativo, o site fica
   fora do ar**. Nesse caso, comente as 3 linhas do bloco `RewriteRule ^ https://`
   no `.htaccess`, publique, ative o SSL e depois descomente.
5. Depois que o domínio resolver e o SSL estiver ativo, troque o placeholder
   `COLOQUE-SEU-DOMINIO-AQUI` pelo domínio real, rode `npm run build` e
   re-suba o `index.html`, `robots.txt` e `sitemap.xml`.

---

## 7. Configuração de webhooks

**O site não tem webhook.** É uma página estática.

Se você quiser **rastrear as vendas** (ex.: enviar a conversão para um Pixel do
Facebook/TikTok, Google Ads ou um CRM), isso é feito **no painel da Cakto**, não
neste projeto:

- **Cakto → Configurações → Integrações / Webhooks (Postback):** cadastre a URL
  de destino do seu rastreador. A Cakto dispara o evento quando o pagamento é
  aprovado.
- **Pixel na página:** se quiser o Pixel disparando já no carregamento da LP,
  será preciso **adicionar um `<script>` no `<head>`** de `src/index.html`
  (hoje a página é livre de JS). Peça essa alteração separadamente — ela muda a
  natureza "sem script" do projeto e precisa de teste.

---

## 8. Passo a passo — publicar na Hostinger (upload manual do ZIP)

> Use o arquivo **`kit-cravejado-lucrativo-hostinger.zip`** (entregue junto).
> Ele contém o **conteúdo de `dist/`** já na raiz (não dentro de subpasta).

1. **Ative o SSL primeiro:** hPanel → **Segurança → SSL** → instalar no domínio.
   Aguarde ficar "Ativo".
2. hPanel → **Arquivos → Gerenciador de Arquivos**.
3. Entre em **`public_html/`**.
4. **Apague o conteúdo atual** de `public_html/` (arquivos de exemplo como
   `default.php`, `index.html` padrão da Hostinger etc.).
   - Ative **"Mostrar arquivos ocultos"** (ícone de engrenagem / configurações
     do gerenciador) para ver `.htaccess`.
5. Clique em **Upload (⬆)** e envie `kit-cravejado-lucrativo-hostinger.zip`.
6. Clique com o botão direito no ZIP → **Extrair** → destino `public_html/`.
7. **Apague o ZIP** de dentro de `public_html/` depois de extrair.
8. Confira que a raiz de `public_html/` ficou assim:
   ```
   public_html/
   ├── index.html
   ├── 404.html
   ├── .htaccess          <- precisa estar aqui (arquivos ocultos)
   ├── favicon.ico
   ├── favicon-32.png
   ├── apple-touch-icon.png
   ├── og-image.jpg
   ├── robots.txt
   ├── sitemap.xml
   └── assets/            (14 imagens)
   ```
9. Abra **`https://seudominio.com.br`** no navegador (janela anônima, para
   evitar cache).
10. **Teste rápido (checklist):**
    - [ ] Página carrega, fontes aplicadas, imagens aparecem.
    - [ ] Redireciona `http://` → `https://`.
    - [ ] Botões **Cabeçalho / Hero / Prova / "Como funciona"** rolam até
          "Veja o que vai receber".
    - [ ] Botão **dentro do recibo** e **CTA final** abrem
          `https://pay.cakto.com.br/uf88doo_1089889`.
    - [ ] Uma URL inexistente (`/xyz`) mostra a `404.html`.
    - [ ] Colar o link no WhatsApp mostra a prévia (título + `og-image.jpg`).
          Se não aparecer de primeira, force o rescan em
          <https://developers.facebook.com/tools/debug/>.

### Alternativa: publicar pelo Git (opcional)
A Hostinger tem **hPanel → Avançado → Git**. Como o build roda localmente e o
`dist/` é ignorado pelo Git, o deploy por Git exigiria buildar antes e commitar
`dist/`, ou usar a automação de deploy da Hostinger. Para este projeto, o
**upload manual do ZIP é mais simples e é o recomendado.**

---

## 9. Testes realizados

Ambiente: Windows 11, Node 22.17.0, Chrome headless (mesma engine dos
navegadores dos visitantes).

| Teste | Resultado |
|---|---|
| `npm install` | OK — 26 pacotes, 0 vulnerabilidades |
| `npm run build` (1ª vez) | OK — exit 0, `dist/` gerado |
| `npm run build` (2ª vez, confirmação) | OK — exit 0, resultado idêntico |
| Validação interna do build | OK — sem `<script>`, sem `<iframe>`, sem base64 remanescente, 4 âncoras `#oferta`, 2 links de checkout, 14/14 assets referenciados e existentes, 0 assets órfãos |
| Render `dist/index.html` @ 360 px | OK — sem rolagem horizontal, 14/14 imagens carregadas |
| Render @ 390 px | OK — sem rolagem horizontal, 14/14 imagens |
| Render @ 768 px | OK — sem rolagem horizontal, 14/14 imagens |
| Render @ 1280 px | OK — sem rolagem horizontal, 14/14 imagens |
| Console do navegador | Sem erros |
| Requisições de rede | Sem falhas (fora as Google Fonts, que exigem internet) |
| `href` dos botões | 4× `#oferta` + 2× checkout Cakto — conforme especificado |
| Peso `dist/index.html` | 34 KB (8,8 KB com gzip) |
| Peso total `dist/` | ~1,2 MB (imagens em cache de 1 ano após a 1ª visita) |

---

## 10. Possíveis limitações / observações

1. **Google Fonts externas.** As fontes vêm de `fonts.gstatic.com`. Se o
   navegador do visitante não conseguir baixá-las, o texto usa a fonte de
   fallback (serif/sans do sistema) — o layout continua funcional. Para
   independência total, dá para baixar os `.woff2` e servir localmente
   (melhoria opcional, não feita para não alterar o visual).
2. **Sem analytics / sem Pixel.** A página não tem Google Analytics, Meta Pixel
   nem TikTok Pixel. Para rastrear tráfego/conversão é preciso adicionar o
   script no `<head>` (ver seção 7).
3. **Checkout é externo (Cakto).** Qualquer indisponibilidade ou mudança de
   link do lado da Cakto exige editar `src/index.html` (2 lugares) e rebuildar.
4. **Placeholder de domínio.** Enquanto `COLOQUE-SEU-DOMINIO-AQUI` não for
   trocado, as tags `og:*`/`canonical` ficam com URL inválida e a prévia em
   redes sociais não funciona corretamente.
5. **`.htaccess` e HTTPS.** O redirect force-HTTPS depende do SSL estar ativo
   antes. Ver seção 6, item 4.
6. **`.htaccess` no LiteSpeed.** A Hostinger usa LiteSpeed, que lê `.htaccess`.
   Os módulos `mod_deflate`, `mod_expires`, `mod_headers` e `mod_rewrite` são
   suportados. Se algum diretório `<IfModule>` não for suportado no seu plano,
   ele é simplesmente ignorado (não quebra o site).
7. **Imagens das reportagens (prova social).** São prints de matérias (g1,
   Exame, Diário Online) e um frame de reportagem do SBT. Uso jornalístico/de
   citação — avalie com seu jurídico se for veicular em mídia paga em larga
   escala.
8. **Cache após atualização.** Ao trocar uma imagem, gere um novo build (o nome
   do arquivo em `assets/` muda por conter o hash do conteúdo → o cache velho é
   invalidado automaticamente). O `index.html` tem cache curto (`must-revalidate`).

---

## 11. Entregáveis

| Arquivo | O que é |
|---|---|
| Pasta `kit-cravejado-lucrativo/` (este repositório) | Projeto completo, pronto para subir no GitHub (`git init` + commit inicial já feitos). |
| `kit-cravejado-lucrativo-hostinger.zip` | Conteúdo de `dist/` — **pronto para upload manual** em `public_html/`. |
| `DEPLOY_HOSTINGER.md` | Este documento. |
| `README.md` | Visão geral e comandos. |
| `.env.example` | Documentação (não há variáveis). |

---

## 12. Comandos — referência rápida

```bash
npm install                 # instala dependências de dev (serve)
npm run build               # gera dist/  (diretório de saída)
npm run preview             # build + serve dist/ em http://localhost:3000
npm run dev                 # serve src/ direto (preview rápido, sem build)

# Publicar: subir o conteúdo de dist/ para public_html/ na Hostinger
```

| Pergunta | Resposta curta |
|---|---|
| Tecnologia | HTML + CSS estático (sem framework, sem JS de runtime) |
| Versão do Node | 18+ (só para o build; produção não usa Node) |
| Instalação | `npm install` |
| Build | `npm run build` |
| Inicialização (produção) | nenhuma — servidor web serve os arquivos |
| Diretório de saída | `dist/` |
| Variáveis de ambiente | nenhuma |
| Banco de dados | nenhum |
| Domínio | apontar DNS para a Hostinger + ativar SSL (seção 6) |
| Webhooks | nenhum no site (rastreio fica na Cakto — seção 7) |
