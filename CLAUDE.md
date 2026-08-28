# CLAUDE.md — Site Audiotext (audiotext.com.br)

Registro vivo do projeto. O CC lê este arquivo na abertura de cada sessão.
Decisões aqui são SELADAS e prevalecem sobre qualquer bloco, salvo revogação
explícita do dono. Escopo deste arquivo: SITE apenas (Ads tem contexto próprio).

## Papéis e canal
- **Dono (Jonathan):** valida previews, faz merges, aplica em produção, dá o aceite humano.
- **Orquestrador (Claude chat):** decide produto/estratégia, redige os blocos.
- **CC (você):** executa. Canal único = blocos de copiar-e-colar; nada é decidido fora deles.
- Se vir algo errado FORA do escopo do bloco: reporte em 1 frase, NÃO corrija.

## Stack e deploy
- HTML estático por página, CSS Tailwind COMPILADO por página (classe sem definição = silenciosamente sem efeito — já causou padding 0 via `py-10` inexistente; sempre confira que a classe existe no CSS da página).
- Deploy: GitHub → Vercel. `main` = produção (deploy automático no merge). Branch pushada = Preview Deployment isolado.
- `docs/` está FORA do deploy (`.vercelignore`) — auditorias internas, nunca expor. Log vivo: `docs/AUDITORIAS-CRO.md`.

## Rito de git/entrega (sempre)
1. Branch por ciclo (`fix/…`, `variante-b/…`), criada da main ATUAL (confirmar via `git fetch` antes de branchear).
2. Commits em PT-BR. Autoria: `Audiotext TI <ti@audiotext.com.br>`. PUSH sempre; MERGE nunca (merge é do dono).
3. Entrega: link de Compare/PR + checklist de preview.
4. Checklist mínimo de preview: **scan visual integral 375×667 seção a seção (hero → rodapé)** — validação funcional não vê quebra de layout; + re-teste do `generate_lead` no dataLayer quando tocar página com evento; + parse/balanceamento de tags.
5. Relatório no formato: desfecho primeiro → diff resumido → gates/números → pendências. Sem prosa longa.

## Medição (não quebrar NUNCA)
- `dataLayer` `generate_lead` — `form_name: 'orcamento'` (/budget, iframe+postMessage) e `form_name: 'legendagem'` (form inline, push síncrono + eventCallback/timeout antes do WhatsApp).
- Ordem no head: consent default ANTES de `gtm.js` (ambos em `cookieConsent.js`/`gtm-bridge.js` com `defer` — a ordem dos arquivos garante; não reordenar).
- Toda mudança que toque head/scripts/funil: validar a cadeia no preview (consent → gtm.js → cta_click → generate_lead).

## Invariantes de conteúdo (fonte de verdade)
**Preços** (tabela oficial da empresa; NUNCA outros valores):
- Transcrição: 0-59 min = FIXO R$120-197; por minuto 60-719 = R$2,20-3,50; 720+ = R$2,00-3,10. "A partir de R$2,00/min" é válido (volume), nunca apresentar como típico; sempre apontar ao simulador.
- Degravação/jurídica: transcrição ×1,6 → piso R$3,20/min. NUNCA R$2,00 como piso de degravação.
- Legendagem: R$6/min PT · R$9-12/min c/ tradução · +R$2/min embutida.
- IA (/transcricao-automatica): preço do app (não é regido pela tabela).
- Faixa antiga "R$2,00-5,50/min" está DESCONTINUADA.

**Fatos:** +15 mil clientes · +2,5 milhões de minutos · precisão "próxima a 100%"/"99%+" (NUNCA "100%") · garantia 30 dias (janela p/ pedir revisão) ≠ revisão entregue em 2-3 dias úteis · prazos SEMPRE em dias úteis (Instant a partir de 1 · Fast 2 · Flex 8) · avaliações: 36 no Google (GMB), schema deve ser consistente e com lastro visível.

**Vetos de copy:**
- Ângulo de "contestação pela parte contrária" VETADO em qualquer página (não criar nem responder cenário de disputa; atributos — ipsis litteris, marcação de tempo, NDA — afirmados como qualidade, nunca como defesa).
- Cross-sell do produto de IA fora das páginas premium (audio/degravacao/legendagem) — remove, não adiciona.
- /legendagem é B2B: sem "criadores de conteúdo"/enquadramento de rede social-DIY (produtoras, agências, empresas, instituições).

**Decisões de negócio seladas:** `texter.html` permanece indexável (recrutamento legítimo) · metas "grátis" de automatica/por-ia permanecem (intenção grátis é tóxica no pago, não no orgânico freemium).

## Congelamentos ativos
- **/legendagem CONGELADA** durante o piloto da campanha paga (checkpoints de 2 e 4 semanas): mudança VISÍVEL só nos checkpoints; schema/invisível pode.
- Páginas com campanha ativa: mudanças visíveis exigem decisão do orquestrador (janela de medição).

## Como trabalhar comigo (Opus 5)
- Spec completa de uma vez → sessão única quando as decisões já vêm fechadas no bloco; fases (read-only → proposta → validação) só com decisão em aberto.
- Escopo fechado do bloco é literal. Auditorias: reportar TUDO, sem filtrar por severidade — a triagem é do orquestrador.
- Parada condicional: caminho que extrapole o escopo (trocar componente central, mexer em consent/GTM, redirect/vercel.json) → PARE e reporte em ≤5 linhas antes de continuar.
- Bug: bloco só-diagnóstico primeiro (nenhuma alteração), causa-raiz com evidência (arquivo/linha), correção em bloco próprio.
- Esforço: copy/config/triagem pequena = baixo/médio; refactor multi-arquivo/incidente = padrão; xhigh só excepcional.
- Documentos gravados: tamanho calibrado, sem enchimento.

## Pendências vivas (atualizar a cada ciclo)
- [ ] T1.1 reviews: aplicar 36 + média real GMB (aguardando valor do dono) + lastro visível.
- [ ] Variante B /transcricao-de-audio: rebase sobre main atual → preview → merge (contém: hero vídeo/para-texto, banda de preço, re-sequência prova→comparação, CTAs benefício, cross-sell IA removido).
- [ ] Verificar `.py-10` definido em /transcricao-de-audio e /degravacao (definição entrou só em legendagem+home).
- [ ] Variante B /degravacao: status/conclusão (hero jurídico #7, FAQ LGPD, slot depoimento real).
- [ ] SEO Ondas 2-4: gap "empresa de transcrição de áudio" · de-canibalização /por-ia + órfã · "quanto custa degravação" · home título hub · avaliar /transcricao-de-video.
- [ ] CSP bloqueando CAPI/facebook (achado real, desacoplado — corrigir quando priorizado).
- [ ] Depoimentos nominais reais (jurídico p/ degravacao; produtora p/ legendagem) — captação é do dono.
- [ ] Auditoria dedicada de canibalização pós-Onda 3 (idealmente com Search Console conectado).
