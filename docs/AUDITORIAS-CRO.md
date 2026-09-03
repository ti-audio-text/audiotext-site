# Histórico de Auditorias CRO — Audiotext

> Log evolutivo das auditorias de conversão das landing pages de tráfego pago.
> **Atenção:** arquivos `.md` do repo são servidos como `text/plain` e indexáveis (regra em `vercel.json`). Se este log não deve ser público, adicione `docs/` ao `.gitignore` ou mantenha fora do deploy.

---

## 2026-08-06 — Auditoria 2 (CRO / framework landing-page-audit)

**Escopo:** 3 páginas de tráfego pago, versão pós-lotes A/B/C (hero `py-10`, cookie banner não-bloqueante, scripts com `defer`, carrossel lazy). Avaliação mobile-first. Janela de medição dos fixes de infra até ~20/08 — auditoria é diagnóstico para a "onda 2".

**Relação com a Auditoria 1:** a auditoria 1 cobriu o achado-raiz (camadas de infra compartilhada: cookie modal bloqueante, funil iframe `/budget`, scripts render-blocking, carrossel eager, floats fixos) + problemas por página (message-match, conteúdo JS-dependente na degravacao, funil off-domain do automatica). Esta rodada cobre o que faltou: frameworks de headline, qualidade de copy (benefício vs feature), inventário de trust signals, análise de CTA copy/placement e scoring 0-100.

### Scores

| Página | Gasto/mês | Score | ATF (25) | Copy (20) | Trust (20) | CTA (15) | Mobile (10) | Fluxo (10) |
|--------|-----------|-------|----------|-----------|------------|----------|-------------|------------|
| /transcricao-de-audio | R$1.549 | **64** | 16 | 13 | 13 | 10 | 6 | 6,5 |
| /degravacao | R$426 | **73** | 20 | 16 | 13 | 10 | 8 | 6 |
| /transcricao-automatica | R$53 (pausada) | **54** | 13 | 12 | 11 | 6 | 6 | 6 |

Nota degravacao: 73 é o teto "JS-on"; sem JS a página perde FAQ, depoimentos, use-cases, pilares e o único preço visível (render em `DOMContentLoaded`, divs vazias) → ~55. Ver fix #6 (SSR/noscript).

### Achados novos principais

**Cross-cutting:**
- **[🔴 vazamento de verba] Cross-sell de IA nas páginas pagas do serviço humano** — audio `:2336` (→ `app.audiotext.com.br`, `_blank`) e degravacao `:1954` (array services → `/transcricao-automatica`). Manda tráfego pago do serviço premium para o produto mais barato; na degravacao ainda mina a promessa ipsis litteris com "93% de acurácia".
- **[🟡 confiança] Preço inconsistente dentro de cada página e vs schema** — audio (R$90-120 vs R$207 vs R$2-5,50/min; schema R$0,26-12); degravacao (schema R$3,20-5,52 vs R$0,26-12 vs pilar R$120-150; reviewCount 36 vs 16 reais); automatica (Product reviewCount 3 vs Org 36; "milhares" vs isso).
- **[🟡 polish] Bug do footer** (label "Telefones" sobre o e-mail + `<div>` não fechado) ainda em audio `:2685/:2694`, degravacao `:1730/:1740`, automatica `:1467/:1476` — só a home foi corrigida no Lote A.
- **[🟡 CTA] Copy de CTA fraca** — "Simular orçamento" genérico repetido (audio 8×, degravacao 9×); sem variante orientada a benefício.
- **[🟢 markup] `<section>` aninhada inválida** — audio `:1367`, degravacao `:1223`, automatica `:615`.

**/transcricao-de-audio (64):**
- [🔴] Seção "Quanto Custa a Transcrição..." (`:2183`) promete preço e entrega 8 cards de feature, zero R$.
- [🟡] Sem visual no hero (só texto) `:978-1036`.
- [🟡] Prova social chega depois de 5 CTAs; comparação IA×humano é o 2º bloco e abre com "Por que pagar mais?"/"quando usar IA" (`:1166`,`:1333`) — moldura anti-conversão antes de qualquer prova.
- [🟡] 3 links "Saiba mais" autorreferentes → `/transcricao-de-audio` (`:2352`,`:2368`,`:2384`).
- [🟡] Redundância: Pilares + Why-cards + Use-cases repetem os mesmos 4 temas; copy do meio é company-centric (`:1695`,`:1793`,`:1812`).

**/degravacao (73):**
- [🔴] Nenhum depoimento nominal de advogado/escritório, apesar do público jurídico e do claim "+5 mil advogados". Prova social genérica ou não-jurídica (CAU/BR, Petrobrás, Globo).
- [🟡] Medo "e se a contraparte contestar?" é levantado (`:1143`) e nunca respondido no FAQ; sem declaração de fidelidade, cadeia de custódia, LGPD/segurança no corpo.
- [🟡] Fatos contraditórios: 1M vs 2M minutos (`:1429` vs `:1935`); "Fidelidade 100%" vs "próxima a 100%" (`:1635` vs `:1459`); garantia "3 dias úteis" vs "30 dias" (`:1487` vs `:1331`).
- [🟡] Sem CTA consultivo/NDA-first para caso confidencial de alto valor.

**/transcricao-automatica (54, reposicionamento):**
- [🔴] Zero CTA de compra; todas → `/signup` grátis; 4 variantes de rótulo, nenhuma diz "comprar/assinar".
- [🔴] Depoimentos provam o produto ERRADO (atendimento/prazo, `:1189/:1202/:1215`); "dentro do prazo" não faz sentido para IA instantânea.
- [🔴] Plano de entrada (Essencial R$47) é só Pix (`:866`); os outros aceitam cartão — muro de pagamento no tier de maior tráfego.
- [🟡] "% de economia" sem preço-âncora de referência (`:849/:890/:928/:982`).
- [🟡] Sem amostra/demo do output; sem garantia/reembolso; caixa créditos-vs-assinatura mistura $/R$ com câmbio velho (`:1028-1029`); hero CTA na/abaixo da dobra mobile.

### Backlog onda 2 (resumo — detalhe no chat da auditoria)
Já redigidos: #4 (hero audio vídeo/para-texto), #7 (hero jurídico degravacao), #8 (preço above-the-fold), #5 (reposição automatica), #6 (SSR degravacao).
Novos T1 (P): matar cross-sell IA, footer bug 3 páginas, Seção 9 audio (título+banda de preço), remover links autorreferentes, variante de CTA por benefício.
Novos T2 (M): depoimento jurídico nominal, reconciliar preços/schema, re-sequenciar audio (prova antes da comparação), FAQ "contestação" + LGPD degravacao, reconciliar fatos contraditórios.
Novos T3: visual no hero audio, enxugar redundância, CTA consultivo degravacao, demo/garantia/sticky CTA automatica, rating numérico, markup `<section>`.

**Dependências:** Seção 9 audio e #8 dependem da reconciliação de preço (definir 1 fonte de verdade). Itens do automatica pertencem ao #5. Re-sequenciamento do audio deve vir junto/depois do #4.

---

## 2026-08-06 — Trilho 1: correções factuais aplicadas (branch `fix/correcoes-fatuais`)

Correções de fato/bug aplicadas AGORA (compatíveis com a janela de medição por serem consertos, não mudanças de estrutura/CTA). Melhorias (Trilho 2) ficam nas variantes B, sem deploy até 20/08.

### Fonte de verdade de preços (tabela oficial da empresa)
- 0–59 min = **preço fixo** (R$ 120–197 por faixa/prazo).
- Transcrição padrão/min: 60–719 min = **R$ 2,20 (Flex) a R$ 3,50 (Instant)**; 720+ min = R$ 2,00 a R$ 3,10 (piso R$ 2,00 só em 720+).
- Degravação (finalidade jurídica) = transcrição **× 1,6**: piso R$ 3,20 (720+); 60–719 min = **R$ 3,52 a R$ 5,60/min**.
- Faixa antiga "R$ 2,00–5,50/min" (mistura dos dois serviços): **DESCONTINUADA**.

### Memorial de cálculo dos exemplos recalculados
| Exemplo | Base (faixa 60–719 min) | Cálculo | Resultado | Substituiu |
|---------|--------------------------|---------|-----------|------------|
| 60 min, transcrição padrão | R$ 2,20 (Flex) → R$ 3,50 (Instant) | 60×2,20=132 ; 60×3,50=210 | **R$ 132 a R$ 210** | "~R$ 90-120" (abaixo do piso) e "~R$ 207" |
| 60 min, ipsis litteris/degravação | R$ 3,52 → R$ 5,60 (×1,6) | 60×3,52=211,20 ; 60×5,60=336 | **R$ 211 a R$ 336** | "~R$ 150-180", "~R$ 120-150", "~R$ 180-240" |
| Degravação Pilar 2 (bullets) | Flex/Instant | idem acima | R$ 211 (Flex) / R$ 336 (Instant) | limiar de desconto "100+ horas" → "720+ minutos" |

### Schemas corrigidos
- audio: `priceRange` R$0,26-12 → **R$ 2,00-3,50/minuto**; Service `price` R$2,00-5,50 → **R$ 2,00-3,50**; `highPrice` 5.50 → **3.50**.
- degravacao: Service `price` R$3,20-5,52 → **R$ 3,20-5,60**; `priceRange` R$0,26-12 → **R$ 3,20-5,60/minuto**.
- home: card transcrição R$2,00-3,45 → **R$ 2,00-3,50**; card degravação R$3,20-5,52 → **R$ 3,20-5,60**.

### Fatos (D3)
- Minutos: degravacao "1 milhão" → **2 milhões** (:1940). (⚠️ HOME segue "2,5 milhões" — decisão pendente: alinhar tudo a 2M ou subir os outros a 2,5M.)
- Precisão/fidelidade: removido "Fidelidade 100%" e "fidelidade 100%" da degravacao (:1934 → "Fidelidade Ipsis Litteris"; :1635; :1942; :1167 "100% literal" → "Literal (íntegra)"). Mantido "próxima a 100%". ("100% online" e a citação de cliente "avalizo 100%" preservados.)
- Garantia vs revisão: degrav :1487 explicitado "Garantia de 30 dias… reenviamos em até 3 dias úteis". audio/home já estavam corretos.

### Posicionamento
- PAS da degravacao (:1142-1145) reescrito removendo a figura da contestação/parte contrária; mantido o problema ("juiz não vai ouvir 3h") e a solução (ipsis litteris + marcação de tempo). Regra vale para toda a copy daqui em diante.

### Bugs
- CC3 footer (label "Telefones" no e-mail + `<div>` aberta): corrigido em audio, degravacao, automatica (home já corrigida no Lote A).
- A4: 3 links "Saiba mais" autorreferentes removidos da audio.
- CC5: `<section>` órfã (`id="como-funciona"` sem fechamento) fundida no section real nas 4 páginas → tags balanceadas.

### Prazos em horas — PENDENTE mapeamento exato (não convertido para evitar compromisso de entrega errado)
audio :1320 "24-96h"; home :1556/:1618 "24h a 10 dias úteis" (unidades misturadas); degrav meta :24 "entrega em até 48h". (Cancelamento "24h" e exemplos narrativos de cliente foram mantidos — não são prazos de entrega.)

### NÃO tocado (é Trilho 2)
CC1 (remoção do cross-sell de IA — vira variante B), heros #4/#7, A1 banda de preço, reposicionamento automatica, etc.

### Fechamento — decisões validadas (2026-08-06)
1. **Minutos:** padronizado **"2,5 milhões"** em todas as páginas (audio/degravacao subidos de 2M; home já estava). Claim comprovável. **Adendo (2026-08-07):** um stat-tile da degravacao mostrava "+1 milhão" (número e "minutos degravados" em elementos separados, escapou da varredura por regex) — corrigido para "+2,5 milhões". Varredura ampla `milh(ão|ões)` confirmou zero resíduo nas 4 páginas.
2. **Prazos:** menções mistas em horas substituídas por dias úteis. Formulação oficial (na FAQ de prazo): **Instant: a partir de 1 dia útil · Fast: a partir de 2 dias úteis · Flex: a partir de 8 dias úteis**, sempre com direcionamento ao simulador. Campos compactos (cards/tabela) exibem "1 a 8 dias úteis". Exceções mantidas: cancelamento "24h" e narrativas de cliente (não são prazo de entrega).
3. **Garantia:** resolvido e final — garantia de **30 dias** (simples, sem úteis/corridos) = janela para solicitar revisão; revisão entregue em **2–3 dias úteis** após o pedido. O par "3 vs 30 dias" do D3 foi leitura imprecisa da auditoria (string literal nunca existiu).
4. **docs/ fora do ar:** criado `.vercelignore` excluindo `docs/` do deploy (arquivo segue versionado no git, mas não é servido/indexado). Verificar no preview: `…/docs/AUDITORIAS-CRO.md` deve retornar **404**.

---

## 2026-08-07 — Auditoria: /legendagem (pré-lançamento de campanha paga B2B)

**Contexto:** campanha de Ads dedicada a legendagem (em desenho). LP recebe tráfego pago comercial B2B pela 1ª vez. **Desafio (CRM):** quem PAGA é B2B/profissional (ticket ~R$518, recorrente); o DIY (legenda de vídeo social) fechou ZERO. A página deve falar com o B2B e desqualificar o DIY naturalmente. **Diagnóstico apenas — nada implementado.**

**Score skill:** **68/100** (ATF 16/25 · Copy 15/20 · Trust 13/20 · CTA 11/15 · Mobile 6/10 · Fluxo 7/10).

**Funil:** legendagem **NÃO usa /budget** — form inline dedicado (tipo PT R$6/EN-ES R$9-12, formato SRT/embutida, estimativa ao vivo) com handoff **WhatsApp** (`api.whatsapp.com/send`). Purpose-built e correto para o serviço.

**Preços citados (validar contra a tabela REAL de legendagem — não assumir a de transcrição):**
- R$ 6,00/min — legenda PT (FAQ `:1627`, form `:2093/:2096`, schema-ish `:578`)
- R$ 9,00–12,00/min — legenda + tradução EN/ES (FAQ `:1628`, form `:2101/:2104/:2109/:2112`)
- R$ 2,00/min — **adicional** legendas embutidas/hardcoded (FAQ `:1750`)
- Referência cruzada desatualizada: "transcrição (R$ 2-5/min)" (`:1825`) → deveria ser R$ 2-3,50 (tabela corrigida no Trilho 1)
- IA cross-sell "R$ 0,30/min" (`:1586`); schema `priceRange` "R$ 0,26-R$ 12/minuto" (`:517`, company-wide); Product lowPrice/highPrice 120/1500 (`:794-795`)

**TRILHO 1 (bloqueante do lançamento):**
1. [🔴 fato] Hero "+1.000 clientes" (`:907`) contradiz "+15 mil" do resto da página (`:518/:1460/:1848`) → +15 mil.
2. [🔴 congruência] IA cross-sell no corpo (`:1580-1590` → /transcricao-automatica, "R$ 0,30/min · rascunhos") numa LP B2B de R$6-12/min: vaza para o produto barato e convida o DIY — remover/reframar.
3. [🟡 fato] "transcrição (R$ 2-5/min)" (`:1825`) → "R$ 2-3,50/min".
4. [🟡 bug] Footer "Telefones" sobre o e-mail + `<div>` aberta (`:1928/:1937`).
5. [🟡 bug] `<section>` órfã `como-funciona` (`:1023-1024`) → 11/10 desbalanceado.
6. [🟢 congruência] Schema prazos em horas (`:586` "24-48h…") vs FAQ visível em dias úteis (`:1643-1646`) — alinhar schema.
7. [ação do cliente] Validar TODOS os preços acima contra a tabela real de legendagem antes do go-live.

**TRILHO 2 (conversão, pós-lançamento):**
- Desqualificar DIY: "criadores de conteúdo" (`:916`) + seção hardcoded focada em "Redes sociais/TikTok/anúncios" (`:1745-1748`) atraem o segmento que converte zero — reframar para produtoras/agências/empresas/instituições.
- Hero mobile `py-20`→`py-10` (legendagem não recebeu o #9) — CTA na dobra 375×667.
- CTA "Fale Conosco pelo WhatsApp" (`:886`) → orientado a ação/orçamento.
- Trust B2B: nota fiscal/CNPJ explícito, depoimento de produtora/agência nominal.
- Message-match: incluir "closed caption/acessibilidade/corporativo" no hero/H2 p/ as intenções da campanha (hoje "closed caption" só no meta `:22`).
- Sem hero visual (só texto).

**Congruência OK:** garantia 30 dias (`:1515/:1809`) ✓; sem ângulo de contestação ✓; "100% Humana/manual" é método (não precisão) — aceitável; legendagem não usa "+2,5 milhões" (usa "+500 mil palavras", métrica própria) ✓.

### 2026-08-07 — Aplicado (branch `fix/legendagem-pre-lancamento`)
**Bloqueante nº1 (medição):** `enviarOrcamentoLegendagem()` agora dispara `dataLayer.push({event:'generate_lead', form_name:'legendagem', service_type, leg_formato, leg_estimativa, leg_duracao, user_email, user_name})` (padrão /budget) **antes** de abrir o WhatsApp. Anti-corrida via `eventCallback` + `eventTimeout:1500` + `setTimeout(1500)` fallback + guard `navegou` (abre 1×). **Validado no preview** (javascript_tool): push síncrono presente em 100% dos envios, `window.open` só no callback (não na hora), estimativa 60min×R$6 = R$360,00. A mensagem do WhatsApp já carregava tipo/formato/estimativa (mantida).
**Trilho 1:** "+1.000"→"+15 mil clientes" (`:907`); card IA removido (comentado); "transcrição R$ 2-5/min"→"R$ 2-3,50/min"; footer E-mail+`</div>`; `<section>` órfã fundida (10/10); schema de prazos → dias úteis.
**Promovidos do T2:** hero `py-20`→`py-10`; CTA "Fale Conosco"→**"Calcule seu orçamento em 1 minuto"** (7 botões); "closed caption" + "empresas/produtoras/instituições" no hero; trust box "criadores de conteúdo"→"empresas". Reframe completo da seção redes sociais fica no T2 pós-lançamento.
**Preços de legendagem:** confirmados e **inalterados** (R$ 6/min PT · R$ 9-12/min tradução · R$ 2/min embutida adicional).

### 2026-08-07 — Regressão visual mobile /legendagem (branch `fix/legendagem-mobile-regressao`)

**Sintomas (produção, mobile):** H1 colado no topo; "Como funciona", "Por que escolher" e rodapé com blocos ilegíveis.

**CAUSA-RAIZ (validada antes do fix — NÃO foi o markup do merge):**
- Balanceamento de tags da página inteira verificado com analisador de pilha (div/section, ignorando script/style/comentários): **0 problemas de aninhamento, pilha final vazia** — ou seja, os fixes de markup do merge (section órfã, footer, remoção do card IA) **estão corretos**, não desbalancearam nada.
- **Causa 1 — grids ilegíveis (pré-existente, não do merge):** no `<style>`, dentro de um bloco `/* === Footer fix === */`, havia um **`.lg\:grid-cols-4` FORA de `@media`** → forçava `grid-template-columns: repeat(4,...)` em **todas as larguras**. No mobile os grids `grid md:grid-cols-2 lg:grid-cols-4` viravam 4 colunas de ~68px (cards 68×722px). A home usa `grid grid-cols-1 md:… lg:…` e mantém a regra `lg:grid-cols-4` **dentro** do `@media (min-width:1024px)` — por isso não quebra. Só apareceu agora por ser o 1º tráfego pago mobile da página.
- **Causa 2 — "H1 colado no topo" (essa SIM veio do merge):** o hero passou a usar `py-10`, mas **`.py-10` não existe** no CSS compilado (só `.py-20`) → `padding-top:0`. Afeta legendagem **e home** (que recebeu `py-10` no Lote A).

**Correção (home como referência canônica):**
- Removido o `.lg\:grid-cols-4` fora de `@media` (a definição correta permanece no `@media 1024px`). Grids voltam a 1 coluna no mobile.
- Adicionado `.py-10 { padding: 2.5rem 0 }` em **legendagem e home** (item único p/ as duas) — hero com padding-top adequado no mobile.

**Validação (programática, 375×667 — screenshot indisponível no ambiente por painel não-composto):** scan seção-a-seção → **todos os grids = 1 coluna, 0 elementos estourando a largura, overflow horizontal da página = 0px**, hero `padding-top` 40px (H1 top 65→105). `generate_lead` **re-testado e intacto** (não regrediu). Confirmação visual final = preview real da Vercel.

**NOVO ITEM PERMANENTE DO CHECKLIST (todos os PRs futuros):** scroll completo em 375×667 com screenshot/scan de CADA seção (hero → rodapé) antes de entregar o preview — pegar quebras de layout mobile que a validação funcional não vê.

---

## 2026-08-07 — Re-audit /legendagem (BASELINE OFICIAL PRÉ-CAMPANHA)

Mesma rubrica da auditoria de 07/08 (68/100). Estado: pós 13 fixes (6 Trilho 1 + 4 promovidos T2 + generate_lead + regressão mobile) + card de modalidade neutralizado.

**Score: 79/100** (era 68 — delta **+11**):
| Dimensão | Antes | Agora | Δ | Motor |
|---|---|---|---|---|
| Above-the-fold /25 | 16 | **19** | +3 | CTA "Calcule seu orçamento em 1 min" (benefício), closed caption + B2B no hero, CTA na dobra 375 |
| Copy /20 | 15 | **16** | +1 | closed caption/corporativo; DIY-copy ainda presente (T2) |
| Trust /20 | 13 | **14** | +1 | +1.000→+15 mil (consistência); falta depoimento de produtora (T2) |
| CTA /15 | 11 | **13** | +2 | copy orientada a orçamento + estimativa ao vivo |
| Mobile /10 | 6 | **9** | +3 | regressão resolvida: grids 1-col, 0 overflow, hero padding 40px, form usável |
| Fluxo /10 | 7 | **8** | +1 | cross-sell IA removido; section fundida |

**Validação mobile 375×667 (programática):** H1 top 105 (hero padding 40px), CTA na dobra (bottom 633<667), **todas as seções 1 coluna, 0 overflow horizontal**, form usável (rádios 59px, submit 74px, duração type=number). `generate_lead` intacto (eventCallback + fallback — **não é sendBeacon**). `.py-10` rende 40px em legendagem **e** home.

**13 fixes:** todos vivos e corretos, **sem conflito**.

**VEREDITO: PRONTA para clique pago B2B. Zero bloqueante funcional restante.** A medição (generate_lead) — que era o bloqueante nº1 — funciona; mobile corrigido; preços corretos; message-match B2B ok.

**T2 remanescente (otimização, não bloqueia):**
- **Pré-campanha se der (reduz spend desperdiçado):** desqualificar DIY — remover 2× "criadores de conteúdo" restantes + reframar seção redes-sociais (TikTok/Instagram) para produtoras/agências/empresas. P/M.
- **Pós-lançamento medido:** depoimento de produtora/agência nominal (M); hero visual (M); prova social numérica no ATF (P); nota fiscal/CNPJ explícito (P); inputs do form 38→44px + inputmode=numeric (P).

**Apêndice (home):** o grid que computa `repeat(4,...)` a 375 é o layout **desktop** da "Como Funciona" (`display:none` no mobile, layout mobile separado renderiza ok) — **não quebra visualmente**, falso positivo. Sem ação.

### 2026-08-07 — Reframe desqualificação DIY (branch `fix/legendagem-desqualificar-diy`) — PÁGINA CONGELADA
Último ajuste de copy antes do clique 1 (piloto B2B com checkpoints de 2-4 semanas; página congela para teste de demanda limpo).
- **3× "criadores de conteúdo"** (schemas `:499/:708/:787`) → "produtoras, agências, empresas e instituições".
- **Seção redes-sociais reframada DIY→B2B:** FAQ "Ideais para" visível (`:1740`) + mirror JSON-LD (`:639`) → comunicação institucional/corporativa, treinamentos e EAD, **campanhas e anúncios de agências e produtoras** (anúncios mantidos, enquadramento B2B), acessibilidade por norma, vídeos sem som (feiras/mídia indoor). Cards `:1577/:970/:1013` e caso de agência `:1140` (leve) alinhados. `twitter:description` `:42` reescrito.
- **Mantidos** (não são DIY-signal): FAQ de compatibilidade de formatos por plataforma; links sociais da própria Audiotext.
- **Validação:** 8/8 JSON-LD válidos; scan integral 375×667 sem problema (layout intacto, reframe é copy-only); `generate_lead` reconfirmado. **Nenhum "criadores"/"TikTok"/"redes sociais" residual.**
- **Congelamento:** após o merge desta branch, a página não recebe mais mudança até o 1º checkpoint do piloto — qualquer T2 restante só entra pós-checkpoint com dado.

---

## 2026-08-28 — Hotfix grid/py-10 (branch `fix/grid-mobile-hotfix`)
`.lg\:grid-cols-4` estava FORA de `@media` no bloco `/* Footer fix */` → footer + seção de cards renderizavam 4 colunas no mobile em PROD (audio/degrav/automatica). `.py-10` também não estava definido nessas 3 (hero mobile com padding 0). Correções: audio/automatica → def de grid-cols-4 envolvida em `@media (min-width:1024px)`; degrav → stray removida (a correta em @media já existia); `.py-10 {padding 2.5rem 0}` definido nas 3. **Datação da regressão:** a stray entrou em `bf4bac3 "Update transcricao-de-audio.html"` (commit manual de edição), **PREDATA o Trilho 1** — não entrou pelo merge dele. Legendagem+home já estavam corretas.

---

## 2026-08-28 — Rodapé unificado (branch `fix/rodape-unificado`, encadeada no hotfix)
Rodapé único e auto-contido (estilos inline + flex-wrap; empilha no mobile sem depender do CSS de cada página — lição do py-10) aplicado às **14 páginas** com footer. Design: fundo claro, Col1 identidade/empresa (logo, tagline, CNPJ+NAP consistente com schema Organization, "100% online", Sobre/Como Funciona/Trabalhe Conosco), Col2 Serviços (4), Col3 Contato (2 tels + WhatsApp + e-mail, sem rótulos soltos), base © + Privacidade/Cookies/Termos. SEM cluster de degravação (silo permanece nos links do corpo). Elimina o bug antigo do footer ("Telefones" sobre e-mail + `<div>` aberta). Limpeza: removidas defs órfãs `.mb-0\.5` e `.lg\:gap-12` (0 usos no site); demais classes do bloco `/* Footer fix */` (space-y, grid-cols-1, lg:grid-cols-4) são compartilhadas com o corpo → mantidas. Gates: 14/14 parse · footer byte-idêntico (len 4970) · empilha no mobile, cabe em 375 (maxRight 284), 14 links todos ≥44px, 0 overflow · links resolvem · generate_lead intacto (audio cta_click→modal; legendagem form R$120). **Legendagem congela APÓS este merge** (piloto B2B).

---

## 2026-09-02 — INCIDENTE ABERTO: funil /budget (iframe) — 2 bugs

**Status:** diagnóstico entregue; correção AGUARDANDO ok do dono (parada condicional total — funil de conversão de 3 campanhas). Nenhuma alteração aplicada ao código do budget. Arquivos: `budget/index.html`, `budget/assets/js/{app.js,api.js,tracking.js}`, `budget/assets/css/style.css`; embed pai nas 14 páginas (`iframe.src='/budget/'`, same-origin); `assets/js/gtm-bridge.js`; `vercel.json`.

**Arquitetura (confirmada):** iframe `/budget/` é **same-origin** ao pai (não é third-party). API = `location.origin + /api/v1/` com `credentials:"omit"` → cookies nunca são enviados; auth viaja no corpo (`sessionCode` + `_csrf`), ambos obtidos do GET inicial e mantidos em memória. `vercel.json` faz rewrite `/api → api.audiotext.com.br` e redirect canônico **apenas de `wp.` → www** (o apex `audiotext.com.br` não é coberto no arquivo).

**BUG 1 — "Erro ao salvar dados" (intermitente por máquina, mesma rede/momento).**
- Mensagem real no código: `showError("Erro ao salvar dados. Tente novamente.")` (`app.js:579`, step 1) — a frase relatada é paráfrase. O erro técnico real vem do backend: `PATCH budget falhou (STATUS): text` (`api.js:34`), só no `console.error`.
- **Causa-raiz (enabler, confirmada):** o catch do init `loadBudget()` **engole a falha** (`app.js:471`, só `console.error`). Se o GET `/budget` falhar, `sessionCode` e `csrfToken` ficam `""`; o form renderiza normalmente; o usuário preenche e o PATCH sai com `sessionCode:"" / _csrf:null` → backend rejeita → mensagem genérica. Storage bloqueado NÃO é a causa (same-origin + `credentials:omit` + acessos a `localStorage` guardados em try/catch, `document.cookie` degrada para "").
- **Gatilhos por-máquina (hipóteses ranqueadas):** (1) cookie `audiotext-budget-session` (7 dias) stale/inválido → GET não-2xx só na máquina que tem o cookie; (2) extensão/adblock/proxy corporativo bloqueando `/api` ou o iframe; (3) corrida: submit antes do init assíncrono resolver; (4) transiente de edge/POP no proxy p/ `api.audiotext.com.br`. O status HTTP no console isola qual.

**BUG 2 — etapa 2 sem rolagem, botão de envio inalcançável (por resolução/zoom).**
- **Causa-raiz (confirmada):** iframe de **altura fixa** (`.budget-modal-iframe height:600px` desktop / `min-height:70vh` mobile, sem resize por postMessage) + dentro do iframe `.App{height:100%;overflow:hidden}` (`style.css:48/54`) e reset `overflow:hidden` (`style.css:25`) + `.budget-modal-content{overflow:hidden}` no pai. Conteúdo mais alto que a caixa é **clipado sem scrollbar**. Zoom 110-125% (padrão em notebook corporativo) ou viewport baixo (laptop 768px, mobile landscape) aumenta o conteúdo em px e estoura os 600px. Zoom-out reduz abaixo do limite e "resolve".
- **Impacto CVR:** usuário que não alcança o botão da etapa 2 não converte; candidato a explicar parte da CVR mobile inferior (viewports curtos e zoom são comuns).

**Achado colateral (tracking, desacoplado):** `app.js` posta ao pai com alvo fixo `"https://www.audiotext.com.br/"` (`:575/:664/:670`); o listener (`gtm-bridge.js:52`) exige `e.origin===location.origin` (ok em same-origin). Como o `vercel.json` só redireciona `wp.`→www (não o apex), **usuário no apex `audiotext.com.br` tem o postMessage descartado → `generate_lead form_name:'orcamento'` pode não disparar** (o save funciona no apex; só o tracking cai). Verificar se o apex→www está forçado no painel da Vercel.

**Correções propostas (não aplicadas; risco ao funil):** ver bloco entregue ao dono. BUG 2 tem fix CSS-only de baixo risco (scroll interno) sem tocar postMessage/generate_lead; BUG 1 depende do status HTTP real (matriz de reprodução) e mexe no núcleo do funil (init/save) → risco médio, re-teste da cadeia inteira obrigatório.

---

## 2026-09-02 (2) INCIDENTE /budget: Bug 1 ENCERRADO, Bug 2 com causa-raiz confirmada

### BUG 1 (RESOLVIDO): "Não foi possível salvar" = Vercel Bot Protection

**Causa-raiz confirmada** (console F12 + dashboard Vercel): o **Bot Protection da Vercel em modo "Challenge"** interceptava os `fetch()` do `/budget`. O challenge é interativo e insolúvel por `fetch()`, então a requisição voltava **429 com a página "Vercel Security Checkpoint"** em vez de JSON. O **Attack Mode estava OFF**; o mecanismo era o Bot Protection.

- **Perfil afetado:** IP/fingerprint classificados como suspeitos. Caso real reproduzido: IP da Digi Spain via edge `cdg1` (VPN/proxy).
- **Volume:** **781 requisições desafiadas/dia** no painel Traffic. Usuário real em VPN, proxy ou rede corporativa era bloqueado **em silêncio**, possivelmente há semanas.
- **Hipótese vinculada:** co-autor provável do sub-registro de conversões da Degravação (ver seção de 20/08). Não é causa única, mas entra como fator.
- **Correção:** ação do dono no dashboard (Bot Protection de "Challenge" para **"Log"**). **Nenhuma mudança de código.** As hipóteses de cookie stale, extensão/adblock e corrida de init, levantadas no diagnóstico de abertura, ficam descartadas como causa principal.

**BACKLOG (registrado, não implementado):** o app trata o challenge como erro genérico e os GETs iniciais falham em silêncio (`app.js:471`, catch só com `console.error`). Item futuro: detectar resposta de challenge (status 429, ou corpo HTML onde se espera JSON) e exibir mensagem acionável ao usuário em vez de "Erro ao salvar dados".

### CSP: hits do GA4 bloqueados (corrigido, branch `fix/csp-analytics-google`)

Evidência: hit do GA4 `/g/collect` (evento `cta_click`) bloqueado pelo CSP. O `connect-src` liberava `region1.google-analytics.com` mas **não** `region1.analytics.google.com`, que é **domínio diferente**. Eventos GA4 perdidos em parte dos usuários (o endpoint regional varia por sessão).

Correção de uma linha em `vercel.json:30`: adicionado `https://*.analytics.google.com` ao `connect-src` (cobre todas as regiões; mesmo padrão já usado para `*.google-analytics.com`). Nenhuma outra diretiva tocada.

**Outros endpoints que o padrão atual pode bloquear igual (levantados, NÃO corrigidos):**

| # | Endpoint ausente | Diretiva | Efeito provável | Evidência |
|---|---|---|---|---|
| 1 | `https://script.google.com` | connect-src | `fetch()` do form de legendagem para a planilha do Google seria bloqueado | `legendagem.html:2108/2217` |
| 2 | `https://cdn.tailwindcss.com` | script-src | Tailwind da página de termos do app não carrega (página sem estilo) | `termos-e-condicoes-app.html:31` |
| 3 | `https://www.google.com.br` (e demais ccTLDs) | connect-src | pings de remarketing e user-list do Google Ads vão para o domínio local do usuário; só `www.google.com` está liberado, e o público é 100% BR | padrão do gtag |
| 4 | `https://td.doubleclick.net` | connect-src | está em `frame-src` mas não em `connect-src`; conversion linker e Google signals também fazem XHR/beacon | comparação das diretivas |
| 5 | `https://bid.g.doubleclick.net` | connect-src | idem, presente só em `frame-src` | comparação das diretivas |
| 6 | `https://graph.facebook.com` | connect-src | CAPI e pixel avançado. O beacon de imagem do pixel passa (`img-src https:`) e `www.facebook.com` já está liberado, então o item "CSP bloqueando CAPI" da fila precisa de evidência de console para ser fechado | fila aberta |

**Achado colateral (fora do escopo, não corrigido):** em `legendagem.html:2217` a guarda do envio para a planilha é `if (SHEET_URL && SHEET_URL !== '<a própria URL real>')`, comparação sempre falsa, então o `fetch()` **nunca executa**. A guarda foi escrita para testar contra a URL placeholder, mas o placeholder foi substituído pela URL real no mesmo arquivo. Leads de legendagem não chegam à planilha (WhatsApp e `generate_lead` seguem funcionando).

### BUG 2 (causa-raiz CONFIRMADA, correção NÃO aplicada): etapa 2 sem rolagem

**O mecanismo é o auto-resize do iframe, não a altura fixa.** O diagnóstico de abertura atribuiu o problema à altura fixa de 600px; a reprodução mostrou o contrário: existe resize por `postMessage` e é justamente ele que remove a rolagem.

Cadeia, com arquivo e linha:

1. `budget/assets/js/app.js:938-956` (`notifyParentHeight`): o filho mede `.App .container` (`scrollHeight`) e posta `{type:'budgetResize', height}` ao pai a cada troca de etapa, resize e mutação de DOM.
2. Pai, exemplo `index.html:2608-2611`: `iframe.style.height = data.height + 'px'`. O iframe **cresce até a altura total do conteúdo**, então o documento filho passa a caber inteiro e **para de ter rolagem própria**.
3. `index.html:1128-1139`, `.budget-modal-content`: `max-height: 90vh` mais `overflow: hidden`. A caixa **corta** o iframe que cresceu e, por ser `hidden`, **não gera barra de rolagem**.
4. O overlay `.budget-modal` tem `overflow-y:auto`, mas a caixa nunca ultrapassa 90vh, então o overlay também não rola.

Resultado: nenhuma superfície rolável em lugar nenhum. O conteúdo cortado fica inacessível.

**Medição** (harness local reproduzindo o modal do pai e a etapa 2 do filho, sem depender da API):

- Altura do conteúdo da etapa 2 a 780px de largura: **676px** (`container.scrollHeight` = 680).
- Base do botão "Ver meu orçamento" dentro do filho: **606,6px**.
- Condição de visibilidade: `0,9 × innerHeight >= 607`, ou seja **altura útil do navegador >= ~675px CSS**.

| Viewport (px CSS) | Altura do iframe | Caixa (90vh) | Cortado | Botão de envio |
|---|---|---|---|---|
| 1920×945 (FHD, 100%) | 676 | 850 | 0px | visível |
| 1536×721 (1536×864, 100%) | 676 | 649 | 31px | visível, no limite |
| 1000×674 | 676 | 607 | 69px | **cortado** |
| 1366×625 (1366×768, 100%) | 676 | 563 | 113px | **cortado** |
| 1366×500 (1366×768, zoom 125%) | 676 | 450 | 230px | **cortado** |
| 844×390 (celular em paisagem) | 676 | 351 | 329px | **cortado** |
| 769×600 | 676 | 540 | 136px | **cortado** |
| 768×600 e abaixo | 676 | caixa `overflow-y:auto` | 0 | visível, rola normalmente |
| 375×667 (mobile retrato) | 676 | caixa `overflow-y:auto` | 0 | visível, rola normalmente |

**Recorte do problema:** ocorre **acima de 768px de largura** (abaixo disso o `@media (max-width:768px)` troca a caixa para `overflow-y:auto` e tudo rola) **e com altura útil menor que ~675px CSS**.

**Viewports reais atingidos** (derivado da regra acima, não de dado do GA4):
- **1366×768 maximizado a 100%**: altura útil entre 600 e 640px CSS. **Sempre quebrado.** É a resolução de notebook mais comum no Brasil.
- 1536×864 e 1440×900: passam a 100%, **quebram a partir de ~110% de zoom**.
- 1920×1080: só quebra acima de ~135% de zoom.
- **Qualquer celular ou tablet em paisagem** (largura acima de 768px): sempre quebrado.
- Zoom-out resolve porque aumenta o `innerHeight` em px CSS, o que bate com o relato original.

**Páginas afetadas (9, todas com o handler de `budgetResize`):** `index.html:2608`, `transcricao-de-audio.html:2722`, `degravacao.html:1760`, `sobre.html:1075`, `degravacao-judicial.html:918`, `degravacao-de-video.html:898`, `degravacao-ipsis-litteris.html:792`, `o-que-e-degravacao.html:1041`, `transcricao-de-entrevista.html:835`. O CSS do modal é idêntico nas 10 páginas que têm o modal.

**`texter.html` NÃO é afetada:** tem o modal (`:404/:414`) mas não tem o handler, então o iframe fica nos 600px fixos e o documento filho rola por dentro (medido: 84px de rolagem disponível a 1366×625). A única página que funciona é justamente a que não recebeu o auto-resize.

**Impacto no funil:** quem não alcança o botão da etapa 2 não converte e não dispara `generate_lead`. Candidato forte a explicar parte da CVR inferior em telas baixas, ao lado do Bug 1 (Bot Protection), que cobre outra fatia.

**Propostas testadas no harness (nenhuma aplicada):**

- **Proposta B (recomendada):** limitar a altura no handler do pai, `iframe.style.height = Math.min(data.height, Math.round(window.innerHeight * 0.9)) + 'px'`. O iframe passa a caber na caixa e o **documento filho volta a rolar por dentro**. Validado: a 1366×625 o filho ganha 117px de rolagem, a roda do mouse sobre o iframe rola naturalmente e o botão fica visível. Complemento necessário: re-aplicar o limite no `resize` do pai, guardando a última altura recebida, porque mudança de zoom altera o `innerHeight` do pai sem disparar `resize` no filho. Toca 9 páginas, no mesmo bloco `<script>` do listener de `generate_lead`, mas **não toca no `postMessage` nem no push do dataLayer**.
- **Proposta A (CSS puro):** `overflow-y: auto` em `.budget-modal-content` no ramo desktop. Funciona no sentido de tornar o botão alcançável, mas **a roda do mouse sobre o iframe não rola o contêiner do pai**: a propagação de rolagem não atravessa a fronteira do iframe quando o documento filho não é rolável, então sobra ao usuário arrastar a barra. Medido. Efeito colateral: a barra de rolagem reduz a largura do iframe para 765px e dispara o `@media (max-width:767px)` **dentro** do iframe, trocando o layout da etapa 2 para o modo mobile.
- **Descartada:** aumentar os 600px fixos. Não resolve, porque o handler sobrescreve a altura logo em seguida.

**Risco:** a Proposta B mexe em bloco inline de 9 páginas que também contém o listener do `generate_lead`. Gate obrigatório no preview: cadeia consent, `gtm.js`, `cta_click`, `generate_lead` (`form_name:'orcamento'`), mais scan 375×667 e conferência da etapa 2 em 1366×768 a 100% e a 125%.

---

## 2026-09-02 (3) INCIDENTE /budget ENCERRADO: Bug 2 corrigido

**Merges do dia:** PR #17 (`fix/csp-analytics-google`, CSP do GA4) e PR #18 (`docs/incidente-budget`, log do incidente) mergeados na `main` em **2026-09-02**.

### Bug 2 fechado (branch `fix/budget-modal-scroll`)

**Causa-raiz (confirmada por reprodução, retifica o diagnóstico de abertura):** não era a altura fixa de 600px, era o **auto-resize**. O handler de `budgetResize` aplicava a altura total do conteúdo no iframe, o documento filho passava a caber inteiro e **perdia a rolagem própria**, enquanto `.budget-modal-content` (`max-height:90vh` + `overflow:hidden`) cortava o excedente **sem gerar barra**. Nenhuma superfície rolável.

**Correção (Proposta B, autorizada):** `fitBudgetIframe()` aplica `Math.min(altura do conteúdo, Math.round(innerHeight * 0.9))` e guarda a última altura recebida para reaplicar no `resize` do pai, porque mudança de zoom altera o `innerHeight` sem disparar `resize` no filho. Bloco idêntico nas 9 páginas com handler. `postMessage` e o push de `generate_lead` não foram tocados.

**Gates (servidor local replicando o roteamento da Vercel, páginas reais):**

| Verificação | Resultado |
|---|---|
| `generate_lead` (`form_name:'orcamento'`) por página | **9/9** disparam, com `service_type`, `user_email`, `user_phone`, `user_name` |
| Altura aplicada a 1366×625 | 563px em 9/9, igual ao `max-height` computado de 90vh |
| 1366×625, etapa 2 real | filho volta a rolar 117px, roda do mouse sobre o iframe funciona, botão de envio visível |
| Zoom 125% (1366×500) | reaplica para 450px no `resize`, filho rola 230px |
| Tela alta (1920×945) | iframe em 680px, sem limite ativo, botão visível sem rolar. Comportamento igual ao anterior |
| Mobile 375×667 | iframe 600px, caixa `overflow-y:auto` intacta, sem overflow horizontal |
| `node --check` nos blocos inline | 10/10 sem erro de sintaxe |
| JSON-LD | 47 blocos válidos nas 9 páginas |
| Scan 375×667 | `overflowX = 0` nas 9 páginas |

**Ressalva para validação em preview:** o filho posta com `targetOrigin` fixo em `https://www.audiotext.com.br/` (`app.js:941`), então **em preview da Vercel (e em qualquer host que não seja www) a mensagem `budgetResize` é descartada** e o iframe fica nos 600px fixos, com o filho rolando por dentro. O preview não exercita o caminho corrigido sozinho: é preciso simular a mensagem pelo console. O mesmo vale para o apex `audiotext.com.br`, já anotado na seção anterior.

**Efeito colateral pré-existente observado (não corrigido):** `.budget-modal-iframe` não declara `display:block`, então sobra a folga de linha de ~5px abaixo do iframe. É espaço vazio, não corta conteúdo.

---

## 2026-09-02 (4) Merges do dia e Variante B da /degravacao

**Mergeados em 2026-09-02:** PR #17 (CSP do GA4), #18 (log do incidente), **#19** (`fix/budget-modal-scroll`, Bug 2 do funil), **#20** (`fix/travessoes-e-cta`), **#21** (`fix/legendagem-remove-sheet-morto`).

### Lote de travessões (PR #20)

15 pontos de copy visível em 6 arquivos: atribuições de depoimento passam a mostrar só o nome; FAQ de prazo da degravacao troca o travessão por ponto; aposto e cláusula principal da sobre viram vírgula; rótulo da ipsis-litteris, badge da o-que-e-degravacao e o `name` do JSON-LD da selecao-temp viram dois-pontos. Inclui as strings renderizadas por JS. Re-scan: **zero em texto visível** fora de legal.html (64, lote próprio) e legendagem.html (3 mais 2 meia-riscas, congeladas até o checkpoint).

No mesmo PR, as duas classes-fantasma de CTA: `.px-5` definida em degravacao e index e `.min-h-\[48px\]` na degravacao, mesmo padrão do PR #12. Medição na página ao vivo, desligando as regras: o CTA do topo da degravacao ia de **121×44 com padding-left 0** para **161×48 com 20px**. No index a definição não muda nada visualmente, porque `.btn { height: 2.5rem; padding: 0 1rem }` vem depois no arquivo e vence `.px-5` e `.h-12` por ordem de fonte; foi mantida só para eliminar a classe-fantasma.

### Legendagem (PR #21)

Removido o envio morto para a planilha do Google: a guarda `SHEET_URL !== '<a própria URL real>'` era sempre falsa, então nenhum lead jamais chegou à planilha. Saíram a declaração, o banner de comentário, o bloco de `fetch` e o `URLSearchParams`, lido só dentro daquele corpo. **As UTMs coletadas ali não iam a lugar nenhum**, então não houve perda de medição: a atribuição segue por GTM/GA4. Gate: push síncrono confirmado, `generate_lead` com `form_name:'legendagem'` e estimativa de R$ 360,00 (60 min × R$ 6), WhatsApp aberto 1×. A página recongela após este merge.

### Variante B da /degravacao (branch `variante-b/degravacao-final`)

**Rebase único** do commit da variante sobre a main final, com as resoluções decididas pelo dono: stat tile de minutos e os dois hunks de FAQ resolvidos a favor da main (o travessão do PR #20 **não** foi reintroduzido); rodapé unificado da main preservado, já que a variante não o toca.

**Sete ajustes da validação de copy, aplicados por cima:**

1. CTA único **"Ver meu orçamento"** em 14 pontos: 10 botões, as 2 FAQs que citam o nome do botão e os 2 espelhos JSON-LD. Substitui o "Ver meu preço" da variante. O item da fila no CLAUDE.md dizia "Calcular meu orçamento" e foi atualizado para o rótulo decidido.
2. Subheadline do hero sem travessão e com claim suavizado: *"Degravação de audiências, depoimentos e oitivas: ipsis litteris, com marcação de tempo, para apresentação como prova em processos judiciais."* O "aceita como prova" prometia admissibilidade, que é decisão do juízo.
3. Âncora de preço reduzida de 3 para 2 aparições acima da dobra: sai da linha de público, fica na microcopy do hero e na banda.
4. Comentário de 19 linhas do `<head>` removido: nota interna de teste A/B não vai ao view-source de produção.
5. Comentário de slot vazio de depoimento jurídico removido do array `googleReviews`. O destaque do Kinchen, que já vinha da main, encerra o item da fila. **Backlog do dono:** captar quote nominal de advogado com nome e OAB.
6. Gate classe-fantasma pegou um caso novo: a banda usava `bg-[hsl(220,13%,95%)]/40`, sem definição no CSS da página, ou seja, fundo nulo. Trocado pela `/30`, já definida e visualmente equivalente.
7. Os dois comentários que ainda carregavam o marcador de variante foram neutralizados, um deles porque continha travessão indo a produção.

**Gates:** 0 ocorrências de "Ver meu preço" e de "Simular orçamento" · 14 de "Ver meu orçamento" · 0 de "R$ 2,00" · piso R$ 3,20 em 5 pontos · prazos "a partir de 1/2/8 dias úteis" intactos · 8 JSON-LD válidos · tags balanceadas, pilha final vazia · classes-fantasma **6, exatamente as mesmas da main** (nenhuma nova) · 375×667 com `overflowX` 0, 10 CTAs todos com 48px ou mais, banda com padding de 40px e largura 343 · `cta_click` disparando e modal abrindo com `/budget/`.

**Travessões remanescentes no arquivo (2, fora do escopo, pré-existentes na main):** comentários HTML `<!-- GTM Bridge ... — depois do cookieConsent -->` (`:13`) e `<!-- Cluster Degravação — Links Internos -->` (`:1663`). Não corrigidos.

---

## 2026-09-02 (5) MARCO: Variante B da /degravacao no ar + congelamento formal da /legendagem

### Marco de before/after da /degravacao

**PR #22 (`variante-b/degravacao-final`) mergeado na `main` em 2026-09-02, 19:24 (BRT).** Esta é a **data de corte** para leitura de before/after da página: tudo medido até 2026-09-02 é controle, tudo a partir de 2026-09-03 é variante B.

O que mudou de fato na página, para consulta rápida na hora de ler os números: hero com vocabulário jurídico (audiências, depoimentos, oitivas) e claim de prova suavizado para "para apresentação como prova"; banda de preço nova logo abaixo do hero, com o piso de R$ 3,20/min e encaminhamento ao simulador; CTA de "Simular orçamento" para **"Ver meu orçamento"** em 10 botões; FAQ de segurança e LGPD (de 14 para 15 perguntas); card de transcrição por IA removido da seção de serviços.

**Cuidado na leitura:** no mesmo dia entraram três correções que também tocam a página ou o funil dela, e que **não** fazem parte da hipótese da variante. O PR #19 corrigiu o Bug 2 do funil (etapa 2 inalcançável em telas com menos de ~675px de altura útil), o que sozinho tende a **subir a conversão** em desktop de 1366×768 e em paisagem. O PR #20 definiu `.px-5` e `.min-h-\[48px\]` no CTA do topo, que antes renderizava 121×44 com padding horizontal zero. Ou seja, o delta observado na /degravacao a partir de 03/09 é **variante B mais dois consertos de funil**, e não deve ser atribuído só à copy.

### Congelamento formal da /legendagem

**A partir de 2026-09-02, a /legendagem está FECHADA para qualquer mudança**, visível ou invisível, até decisão explícita do dono. Substitui o congelamento parcial anterior, que liberava schema e alterações invisíveis.

Motivo: a página entra em piloto de campanha paga B2B com checkpoints de 2 e 4 semanas, e a janela de medição só é limpa se a página não se mexer. Estado congelado: pós PR #21 (remoção do envio morto para a planilha do Google), com os 13 fixes do pré-lançamento, o reframe de desqualificação DIY e o rodapé unificado.

**Pendências que ficam explicitamente represadas até o checkpoint:** os 3 travessões e 2 meia-riscas da página (`:884`, `:897`, `:1248` mais duas meia-riscas), o depoimento nominal de produtora ou agência, o hero visual, a prova social numérica no ATF, o CNPJ e nota fiscal explícitos e o aumento dos inputs do form de 38 para 44px.

**Exceção única:** incidente que quebre o funil ou a medição (`generate_lead` de `form_name:'legendagem'`). Nesse caso, corrigir e registrar aqui, sem tomar carona para nenhuma outra mudança.

---

## 2026-09-02 (6) /budget/v2: variante "uma pergunta por tela" (branch `feat/budget-v2-one-per-screen`)

Teste restrito à **home**. As outras 8 páginas com o modal seguem no `/budget` controle, intocadas. Desenho aprovado pelo dono antes da implementação; decisões e ajustes registrados no bloco daquela rodada.

### O que foi construído

Cópia independente em `/budget/v2/`, com HTML, CSS e JS próprios: `index.html`, `assets/css/style.css` (base do controle mais o bloco da v2), `assets/js/{api,tracking,app}.js`. Caminhos de asset **absolutos**, não relativos: o controle só funciona porque o redirect de barra final faz `./budget/assets/...` resolver, e essa dependência não sobrevive a um subdiretório.

**Fluxo de 6 telas:** serviço, minutagem, finalidade, idioma, contato, resultado. Avanço automático nas três telas de clique único (serviço, finalidade, idioma). A tela de finalidade é **pulada na degravação** e a contagem se ajusta: "Passo 2 de 4" em vez de "2 de 5". Voltar é botão na tela, preservando as respostas em memória, sem refetch. Os dados de contato são **um grupo, uma tela**, com empresa, "como nos conheceu" e observações atrás de "Adicionar detalhes (opcional)".

**Sem estimativa de preço antes do contato** (opção (a) do desenho): a rodada 1 mede só o formato. O controle também não tem, então a variável fica isolada.

**Duas chamadas de API, como no controle.** O PATCH dos dados da gravação dispara ao escolher o idioma, com **avanço otimista**: a tela de contato abre na hora e o salvamento corre atrás. O botão "Ver meu orçamento" só habilita com o PATCH confirmado. Em falha, até 3 tentativas silenciosas (imediata, 1,5s, 4s) e, só então, mensagem acionável na tela com botão "Tentar de novo". Payload preservado byte a byte: `degravacao` traduzido para `serviceCode:'transcricao'` mais `finalityCode:'juridica'`, `participantsAmount: 1`, `isWhatsApp: true`.

**Erro de challenge nasce tratado:** o `api.js` da v2 classifica 429 ou corpo HTML onde se espera JSON como `kind:'challenge'` e a UI troca a mensagem genérica por uma acionável, que fala de VPN e rede corporativa e oferece o WhatsApp. É o item de backlog aberto no incidente de 2026-09-02, resolvido dentro da v2.

### Duas decisões técnicas que fogem do "idêntico ao controle"

1. **`targetOrigin` do `postMessage`.** O controle usa `https://www.audiotext.com.br/` fixo, o que faz a mensagem ser descartada no apex e **em qualquer preview**. A v2 usa `window.location.origin`. O iframe é sempre same-origin com o pai e o listener do pai já exige `e.origin === location.origin`, então é estritamente mais correto, e sem isso **não daria para validar a conversão no preview da Vercel**.
2. **`form_step_view` vai direto ao `dataLayer` do pai**, não por `postMessage`. O guardrail permitia uma única linha aditiva no `gtm-bridge.js`, gasta com o `form_variant`. Como o iframe é same-origin, `window.parent.dataLayer.push` resolve sem handler novo no arquivo compartilhado. Envolvido em try/catch: medição secundária não pode derrubar o funil. O `generate_lead` **continua pelo caminho de sempre**, `postMessage` mais bridge.

### Medição

`gtm-bridge.js` ganhou **uma linha**: `'form_variant': data.variant || 'v1'`. A v2 se identifica com `variant:'v2'` no `budget_submitted`; o controle, que não manda nada, cai no `'v1'` e passa a ser rotulado explicitamente. Nenhuma chave existente mudou de nome ou valor.

`form_step_view` carrega `step_name`, `step_number`, `step_total`, `form_variant` e `form_name`, uma vez por tela por sessão.

### Gates

| Verificação | Resultado |
|---|---|
| `generate_lead` na v2 | `form_name:'orcamento'` inalterado, `form_variant:'v2'`, mais `service_type`, `user_email`, `user_phone`, `user_name`. **1 evento, sem duplicata** do legado `gerarPropostas` |
| `generate_lead` no controle | `form_variant:'v1'` em `/degravacao`, com o iframe ainda em `/budget/` |
| `form_step_view` | 5 de 5 telas no caminho comum; 4 de 4 na degravação |
| Payload PATCH 1 | `serviceCode:'transcricao'`, `finalityCode:'juridica'`, `participantsAmount:1` na degravação |
| Payload PATCH 2 | `isWhatsApp:true`; `howDidMeetUs` **inferido do cookie de UTM sem abrir os detalhes** (`utm_source=google` resultou em "Google") |
| Chamadas de API | 2 PATCH mais 1 POST mais 1 GET, mesma contagem do controle |
| Altura das telas, 375×667 | 400, 460, 517, 460, 545. Todas abaixo de 600 |
| Altura das telas, 1366×625 | 507, 543, 507, 555. Iframe em 555 contra limite de 562,5. **Nada cortado** |
| Alvos de toque | todos com 48px ou mais, o X incluído (subiu de 43 para 48) |
| Voltar | preserva minutagem e seleção de idioma; refaz o caminho sem repetir perguntas |
| Falha do PATCH 1 | 3 tentativas silenciosas, mensagem específica de challenge, botão travado, **nenhum lead fantasma** |
| Classes-fantasma | **0** no HTML e 0 via JS |
| Parse | tags balanceadas, pilha final vazia |
| Sintaxe | `node --check` em 4 de 4 arquivos |
| Roteamento | `index.html` na v2, **8 páginas no controle**, confirmado por grep |

**Duas exceções conhecidas ao gate dos 600px**, ambas em estado que o usuário provoca: com "Adicionar detalhes" **aberto** a tela de contato vai a 729px, e com a caixa de falha visível vai a 739px. Nos dois casos o iframe é limitado a 90vh e o documento filho passa a rolar por dentro, com o botão alcançável (verificado). É o comportamento correto pós-PR #19, não o bug: uma tela de 729px num viewport de 667px rola em qualquer página. O estado padrão da tela, que é o que a maioria vê, fica em 545px.

### Custos assumidos e pendências

- A cópia carrega **CSS morto** do controle, como os estilos da barra de progresso de 3 etapas, que a v2 não usa. É o preço do isolamento total; some quando o teste terminar, com a v2 virando única ou sendo deletada.
- Duplicação de manutenção enquanto o teste durar: bug no funil precisa ser corrigido nos dois apps.
- **Correção de um registro anterior deste log:** a seção do Bug 2 diz que `texter.html` "tem o modal mas não tem o handler". A página tem apenas **CSS remanescente** do modal, sem markup, sem `iframe.src` e sem `openBudgetModal`. A conclusão de lá não muda (a página nunca foi afetada pelo Bug 2), mas o motivo é outro: não há modal nenhum, só folha de estilo órfã. Fora do escopo, não corrigido.
