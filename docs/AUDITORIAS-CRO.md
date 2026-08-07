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
