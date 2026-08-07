# Experimento A/B — /transcricao-de-audio (onda 2, para ~20/08)

> Documento interno (fora do deploy via `.vercelignore`). Página de maior gasto pago (R$1.549/mês, 64%). Mobile = 89% do gasto; mobile converte 1,7–3,6× pior que desktop.

## Hipótese
A variante B (message-match "vídeo"/"para texto" no hero + banda de preço + re-sequência com prova antes da comparação + CTA por benefício + remoção do cross-sell de IA) eleva a conversão mobile e a nota de LP experience vs. o controle (produção pós-correções do Trilho 1).

## Braços
- **A (controle):** `/transcricao-de-audio` — produção após merge do Trilho 1.
- **B (variante):** o bundle da branch `variante-b/transcricao-de-audio`. CC1 (remoção do cross-sell de IA) está **dentro** da B de propósito — o teste mede o bundle inteiro, com atribuição limpa contra o controle.

## Mecanismo (recomendado)
**Experimento de campanha do Google Ads (Drafts & Experiments)**, split 50/50 do tráfego pago entre a URL de controle e a URL da variante (ex.: `/transcricao-de-audio` vs `/transcricao-de-audio-b`).
- Vantagem: atribuição nativa no Ads, sem infra de A/B no site, mede exatamente o tráfego pago que importa.
- Alternativa (se preferir 1 URL só): split por Vercel Edge Middleware ou GTM, mas exige paridade de tracking cuidadosa.

## Métricas
- **Primária:** taxa de `generate_lead` (envio do orçamento `/budget`), **segmentada por device** (decisão pelo mobile).
- **Secundárias:** `cta_click` (abertura do modal), scroll depth, bounce, CPL, e a nota de LP experience / Quality Score das keywords (transcrição de áudio QS7, transcritor de vídeo QS5, transcrição de áudio para texto QS0).

## Tamanho de amostra e duração
- Poder 80%, confiança 95%, detectar **+20% relativo no mobile** (9,1% → ~11%): **~4.000 sessões/braço (~8.000 no total)**.
  Fórmula: n ≈ 16·p̄(1−p̄)/δ² com p̄≈0,10 e δ=0,019 → ~3.990. Desktop precisa de menos (base 16%).
- **Duração:** até atingir a amostra **e** no mínimo 2–4 semanas (cobrir ciclos de dia da semana).

## Guarda-corpos
- Tracking idêntico nas duas variantes (o `generate_lead` do `gtm-bridge` deve disparar igual). Conferir paridade no preview antes de subir.
- **Sem peeking / sem parada antecipada.** Decidir só ao fim da amostra planejada.
- Rodar semanas inteiras (evitar viés de dia da semana).
- Analisar **mobile e desktop separados** — a divergência é o problema central; a decisão é pela primária mobile.

## Observações
- Nunca reportar lift exato antes do fim; usar intervalos.
- Se a nota de LP experience / QS subir mas a conversão não, ainda há valor (CPC menor) — registrar ambos.
