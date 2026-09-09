# SEO Top 3: degravação e transcrição de áudio

## Auditoria técnica 1, read-only (2026-09-07)

Nenhuma alteração feita. Nenhuma branch criada. Todos os fatos abaixo têm evidência de `curl`, view-source ou arquivo e linha.

---

## Aviso de método que muda a leitura de tudo

`curl` com User-Agent padrão recebe **403 `X-Vercel-Mitigated: deny` em todas as URLs dos dois hosts, inclusive na home**. Com User-Agent de navegador, as mesmas URLs respondem normalmente.

```
curl -I https://www.audiotext.com.br/            -> 403  X-Vercel-Mitigated: deny
curl -A "Mozilla/5.0 ... Chrome/128" .../        -> 200
curl -A "...compatible; Googlebot/2.1..." .../   -> 200
curl -A "...bingbot/2.0..." .../                 -> 200
```

Toda a auditoria foi refeita com UA de navegador. Fica o alerta: qualquer ferramenta de SEO que não se identifique como navegador vê o site inteiro como 403, o que sozinho pode explicar diagnósticos externos errados. **O que só o dono responde:** se o Googlebot real (verificado por IP, não por UA) também passa. O UA falsificado passou, o que é indício bom, mas não é prova. Confirmar em Search Console, Configurações, Estatísticas de rastreamento, procurando respostas 403.

---

## 1. Subdomínio legado: PARCIALMENTE CONFIRMADO

**Confirmado:** `https://wp.audiotext.com.br/` responde **200** e serve o site, sem redirect.

**Refutado:** não é WordPress nem site antigo. É o **site novo, byte a byte idêntico ao www**:

```
wp-home.html  154236 bytes
www-home.html 154236 bytes
cmp -s        identicos
grep -c "wp-content|wp-includes|wp-json"  ->  0
```

**Temos controle:** sim. DNS aponta para `b390fdc67ef1caee.vercel-dns-017.com`, e a resposta do wp traz `Server: Vercel` com o **mesmo header de CSP deste repo, já com `*.analytics.google.com`** (adicionado no PR #17, mergeado em 02/09). É alias do mesmo projeto.

**Canonical que ele emite:** `<link rel="canonical" href="https://www.audiotext.com.br/">` e `og:url` também para www. O duplicado está canonicalizado.

**Links internos:** 0 links para `wp.audiotext`, 30 relativos e 1 absoluto para www. O duplicado não se propaga.

**A falha real, e é específica:** a regra do `vercel.json` existe e funciona para todo caminho **menos a raiz**.

```
wp /                              200  (sem redirect)
wp /degravacao                    308 -> www/degravacao
wp /transcricao-de-audio          308 -> www/transcricao-de-audio
wp /sitemap.xml                   308 -> www/sitemap.xml
wp /robots.txt                    308 -> www/robots.txt
wp /nao-existe-1788819159         308 -> www/nao-existe-1788819159
```

Regra em `vercel.json`: `{"source": "/:path*", "has": [{"type":"host","value":"wp.audiotext.com.br"}], "destination": "https://www.audiotext.com.br/:path*", "permanent": true}`. O `:path*` não está casando com o caminho vazio. Resultado: **uma única URL duplicada, a home**, protegida por canonical.

Severidade: baixa para conteúdo duplicado (canonical resolve), média para dispersão de sinais e para a confiança do índice.

---

## 2. URLs legadas: hipótese REFUTADA no essencial, com lacunas pontuais

O mapa de 301 **já existe**: 73 regras no `vercel.json`. Todas as URLs citadas no bloco resolvem para o destino correto.

| URL legada | Saltos | Destino final | Status |
|---|---|---|---|
| `/degravacao-de-audio-em-texto/` | 2 | `/degravacao` | 200 |
| `/degravacao-de-audio-em-texto` | 1 | `/degravacao` | 200 |
| `/transcricao-automatica-2/` | 2 | `/transcricao-automatica` | 200 |
| `/degravacao-de-audio-em-texto-advogados/` | 2 | `/degravacao-judicial` | 200 |
| `/canal-do-texter/o-que-e-transcricao-de-audio/` | 2 | `/transcricao-de-audio` | 200 |
| `/transcricao-de-audio-para-texto/` | 2 | `/transcricao-de-audio` | 200 |
| `/contato/` | 2 | `/` | 200 |
| `/vagas/` | 2 | `/texter` | 200 |
| `/lava-jato-case-de-sucesso-audiotext/` | 2 | `/sobre` | 200 |

**Achado A, cadeia de dois saltos.** Toda legada com barra final gasta 2 saltos: primeiro a normalização de `trailingSlash: false` tira a barra, só depois a regra de destino roda. Ou seja, as 36 regras do `vercel.json` escritas **com** barra final nunca são alcançadas: são código morto. Não quebra nada, mas dilui e atrasa.

**Achado B, lacunas que retornam 404:**

| URL | Hoje | Destino 301 proposto |
|---|---|---|
| `/blog` e `/blog/` | 404 | `/` (ou manter 404 se nunca existiu blog) |
| `/politica-de-privacidade/` | 404 | `/legal` |
| `/termos-de-uso/` | 404 | `/legal` |
| `/servicos/` | 404 | `/` |
| `/precos/` | 404 | `/` mais simulador |
| `/orcamento/` | 404 | `/` |
| `/quem-somos/` e `/sobre-nos/` | 404 | `/sobre` |
| `/feed/`, `/amp/`, `/categoria/` | 404 | 410 ou 404 mesmo |
| `/transcricao-de-video` | 404 | `/transcricao-de-audio` (há item de fila avaliando criar a página) |

**Ressalva importante:** essa lista é hipótese minha a partir de padrões de WordPress. **A lista real de legadas com backlink e impressão só sai do Search Console** (Páginas, filtro "Não encontrada (404)") e do export do sitemap antigo. Propor 301 para URL que nunca existiu é ruído.

---

## 3. Renderização: hipótese CONFIRMADA em uma página, refutada nas outras

O site **não** é CSR. As 4 páginas entregam H1, H2 e corpo no HTML inicial. Mas a distribuição é muito desigual.

| Página | Texto no HTML inicial | Texto após JS | Só existe com JS |
|---|---|---|---|
| `/` | 13.314 | 13.884 | FAQ (14 perguntas) |
| **`/degravacao`** | **6.974** | **19.289** | **34 blocos: 6 casos de uso, 4 pilares, 8 diferenciais, 16 avaliações, mais a FAQ** |
| `/transcricao-de-audio` | 23.185 | 17.425 (menor porque respostas de FAQ ficam recolhidas) | só as 12 avaliações |
| `/degravacao-judicial` | 8.784 | 9.671 | FAQ (10 perguntas), `<div id="faq-container"></div>` vazio no fonte |

**O achado central desta auditoria:** a `/degravacao`, que é a página-alvo de "degravação", entrega **cerca de um terço** do próprio conteúdo no response inicial. Casos de uso ("Ministério Público", "Poder Judiciário"), os 4 pilares, os 8 diferenciais, as avaliações, a FAQ de LGPD e o depoimento nominal do Kinchen: nada disso está no HTML servido. Tudo é injetado por JS em divs vazias (`use-cases-grid`, `pillars-grid`, `why-audiotext-grid`, `reviews-grid`).

O Google renderiza JS, então isso não é invisibilidade absoluta. Mas custa orçamento de renderização, atrasa a indexação do conteúdo novo e deixa a primeira passada com uma página fina justamente no termo que se quer disputar. Comparação interna que fecha o argumento: a `/transcricao-de-audio`, que ranqueia melhor, entrega **3,3 vezes mais texto** no HTML inicial.

---

## 4. Schema: presente, válido e rico nas 4 páginas

| Página | Blocos | Tipos |
|---|---|---|
| `/` | 6 | WebSite, Organization/LocalBusiness/ProfessionalService, WebPage, Service, Product, FAQPage (14q) |
| `/degravacao` | 8 | WebSite, Service, Organization, FAQPage (14q), BreadcrumbList, WebPage, HowTo, Product |
| `/transcricao-de-audio` | 8 | WebSite, Organization, WebPage, Service, HowTo, Product, FAQPage (19q), BreadcrumbList |
| `/degravacao-judicial` | 5 | Article, FAQPage (10q), DefinedTerm, BreadcrumbList, Organization |

0 blocos inválidos em 27. A Onda 1 de schema está aplicada.

**Dois riscos:**

1. **`Product` com `aggregateRating` 5.0 e 36 avaliações em três páginas.** O CLAUDE.md registra 36 avaliações no Google e uma pendência aberta (T1.1) para aplicar a **média real do GMB**, que o dono ainda não passou. Nota 5.0 cheia é improvável e, pior, **não há lastro visível na página**: nenhuma estrela renderizada correspondente. Rich snippet de review sem conteúdo visível equivalente é violação de diretriz e pode custar o snippet inteiro, não só o rating.
2. **FAQPage declara perguntas que só existem depois do JS** na `/degravacao` e na `/degravacao-judicial`. Se a renderização falhar ou atrasar, sobra schema sem conteúdo visível correspondente.

---

## 5. Sitemap e robots: LIMPOS, com duas lacunas

**`sitemap.xml`:** 12 URLs, todas `www`, todas novas. **Zero legadas, zero `wp.*`.** Nada a corrigir aqui.

**Lacuna:** `/texter` responde 200, não tem `noindex` e é decisão selada que permaneça indexável, mas **não está no sitemap**.

**`robots.txt` (www):** `Allow: /` geral, `Disallow` em `/legal`, `/termos-e-condicoes-app` e `/selecao-temp`, bots de IA liberados explicitamente, e `Sitemap:` apontando para www. Coerente.

**`robots.txt` (wp):** 308 para o do www. Correto.

**`noindex` no HTML:** presente em `404.html`, `legal.html`, `selecao-temp.html` e `termos-e-condicoes-app.html`. Coerente com o robots.

**Achado C, os espelhos `.md`.** O `vercel.json` serve todo `/(.*).md` como `text/plain` com **`X-Robots-Tag: index, follow` explícito**:

```
/degravacao.md            200  text/plain  X-Robots: index, follow
/transcricao-de-audio.md  200  text/plain  X-Robots: index, follow
/index.md                 200  text/plain  X-Robots: index, follow
/llms.txt, /llms-full.txt 200  text/plain  (sem X-Robots)
/docs/AUDITORIAS-CRO.md   404  (o .vercelignore funciona)
```

São cópias em texto do conteúdo das páginas, explicitamente convidadas ao índice, fora do sitemap e **desatualizadas**: `/degravacao.md` traz `last_updated: "2026-04-23"` e ainda promete "entrega em até 48h", prazo que foi padronizado para dias úteis em agosto. É duplicação com fato divergente competindo com a página canônica.

---

## 6. Canibalização interna: NÃO EXECUTADO

**O export do Search Console não foi anexado.** Sem ele não dá para dizer qual URL o Google serve para cada query, e qualquer afirmação seria memória, não evidência.

O que preciso, e o formato:

1. **Desempenho, Consultas mais Páginas**, últimos 3 e 12 meses, export CSV com as duas dimensões cruzadas. É o cruzamento que revela canibalização.
2. As 5 queries-alvo isoladas: "degravação", "degravação de áudio", "degravação de audiências", "transcrição de áudio", "empresa de transcrição".
3. **Páginas, filtro "Não encontrada (404)"** e **"Página com redirecionamento"**, para fechar o item 2 com a lista real.
4. Se a propriedade `wp.audiotext.com.br` estiver verificada, o mesmo export dela.
5. **Estatísticas de rastreamento**, para checar 403 no Googlebot.

Com isso, entrego o mapa query por URL, a lista de pares que competem e a recomendação por par (consolidar, diferenciar intenção ou canonicalizar).

---

## 7. Plano da Onda Técnica, uma branch mergeável

Ordem por relação entre impacto e risco. Tudo em **uma branch**, com as paradas condicionais sinalizadas antes de cada bloco.

### Bloco 1, conteúdo servido na /degravacao (maior impacto, sem parada condicional)

Passar para o HTML os 34 blocos e a FAQ hoje injetados por JS. O JS pode continuar existindo para interação, mas o conteúdo nasce no fonte. Vale o mesmo para a FAQ da home e a da `/degravacao-judicial`.
**Risco:** médio. Mexe em página com campanha ativa, então exige o gate de 375x667 e o reteste de `generate_lead`. Não toca funil nem medição.
**Esforço:** M, meio período. É o item que eu faria primeiro.

### Bloco 2, redirect da raiz do wp (PARADA CONDICIONAL: vercel.json e painel Vercel)

Acrescentar regra explícita para `source: "/"` com `has host wp`, ou remover o domínio do projeto e configurá-lo como redirect no painel. A segunda opção é mais limpa e não depende de `vercel.json`.
**Risco:** baixo no efeito, mas mexe em roteamento de host. Precisa de decisão sua antes.
**Esforço:** P.

### Bloco 3, lacunas de 301 (PARADA CONDICIONAL: vercel.json)

Adicionar as legadas que hoje dão 404, **com a lista confirmada pelo Search Console**, não pela minha hipótese.
**Risco:** baixo. Regras aditivas.
**Esforço:** P depois do export, e é bloqueado por ele.

### Bloco 4, espelhos .md (PARADA CONDICIONAL: vercel.json, header)

Três saídas: `X-Robots-Tag: noindex` nos `.md`, ou atualizá-los junto das páginas, ou removê-los. Recomendo **noindex**: eles servem consumo por LLM, que não depende de índice de busca, e hoje competem com fato divergente.
**Risco:** baixo, mas é header, então é parada.
**Esforço:** P.

### Bloco 5, sitemap e rating

`/texter` no sitemap. E o `aggregateRating`: ou entra a média real do GMB com estrelas visíveis na página, ou o `aggregateRating` sai do schema. Depende do valor que só você tem.
**Risco:** baixo.
**Esforço:** P, bloqueado pelo valor do GMB.

### Bloco 6, limpeza das regras mortas

Remover ou reescrever as 36 regras com barra final que nunca são alcançadas, eliminando o segundo salto.
**Risco:** baixo, mas é `vercel.json`, então é parada. Puramente higiene.
**Esforço:** P.

### Fora da Onda, ação sua no painel

Revisar a regra de firewall que devolve 403 a agentes não-navegador e confirmar, em Estatísticas de rastreamento, que o Googlebot verificado não é atingido. Nenhuma linha de código resolve isso, e é o item de maior risco sistêmico da lista.

**Esforço total do que não está bloqueado:** um dia de trabalho, dominado pelo Bloco 1. Blocos 3 e 5 ficam parados até o export do Search Console e o número do GMB.

---

# Consolidado de 2026-09-07: export do GSC, crawl stats e execução da Onda Técnica

## Correções de narrativa (registradas por decisão do orquestrador)

1. A hipótese externa de "site duplicado no wp" fica **reduzida a uma única URL**, a raiz. Todo o resto do host redireciona corretamente para www.
2. As URLs legadas estavam **99% mapeadas** desde antes, com 73 regras no `vercel.json`.
3. O diagnóstico externo é **provável artefato do firewall**, que devolve 403 a agentes não-navegador, incluindo a maioria dos crawlers de ferramenta de SEO.
4. **Firewall: caso encerrado.** Crawl stats sem 403 de Googlebot. Distribuição: 200 em 52,9%, 301 em 33,1%, 404 em 8,7%, erro de DNS em 2,1%, outros 4xx em 1,9%. Regra mantida por decisão do dono.

## Fatos novos do export

### Canibalização em "degravação": confirmada

`/degravacao` está em posição média 3,69 no cluster, com 3.653 impressões. `/o-que-e-degravacao` está em 5,62 com **4.894 impressões**: a página informacional recebe mais impressões que a página comercial. Na query exata "degravação", posição 5,75 e CTR de 0,11%.

Comparação temporal: 5,6 em 12 meses contra 5,75 em 3 meses. **A perda não é recente, está consolidada há mais de um ano.** O trabalho é de reconquista, não de recuperação de queda.

### Canibalização em "transcrição de áudio": grave e de outra natureza

Para o cluster da query, o Google serve nesta ordem: `/texter` (recrutamento, posição 9,77), a home (6,93), `wp./vagas/transcritor/` (7,62) e só em quarto a `/transcricao-de-audio`, em **posição 21,38**. Metade das queries do cluster é do tipo "trabalhar com transcrição".

Diagnóstico: **problema de identidade de intenção**. O Google lê o site como destino de quem quer **trabalhar** com transcrição, não de quem quer **contratar**. Não se resolve com title.

### Ativo descoberto

`/degravacao-ipsis-litteris` acumula **61.040 impressões em 3 meses** e 117 mil em 12, por queries de "ipsis litteris", com CTR de 0,07%. É a maior superfície de impressão do cluster e está subaproveitada.

### Redirect prioritário

`wp./vagas/transcritor/` ainda traz **41 cliques em 3 meses** e 328 em 12. O 301 dela precisa apontar para `www/vagas/transcritor`, que já existe e performa.

### Hosts no crawl: investigados, nada a conter

`site.dev.audiotext.com.br` (72 requisições), `audiotext.audiotext.com.br` (98) e `ww.audiotext.com.br` (1) **não resolvem em DNS**: os três retornam NXDOMAIN, e a conexão falha antes de qualquer resposta. Não há ambiente de desenvolvimento exposto nem vazamento; são apenas nomes que o Googlebot ainda tenta. **São também a origem dos 2,1% de erro de DNS** do crawl stats, o que fecha os dois itens de uma vez. Nada a bloquear, nada a redirecionar: envelhecem sozinhos. O Bloco 8 fica sem escopo.

### 404s e redirects

37 URLs em 404, quase todas legado WordPress. 168 URLs em estado de redirect no índice, sendo 93 no host wp, 71 no www e 4 no apex, o que confirma o achado da cadeia de dois saltos.

## Adendo do item 12: razão HTML inicial contra pós-JS no resto do cluster

| Página | HTML inicial | Pós-JS | Só com JS |
|---|---|---|---|
| `/degravacao` | 6.974 | 18.196 | 34 blocos mais a FAQ |
| `/degravacao-judicial` | 8.784 | 9.671 | FAQ, 10 perguntas |
| `/o-que-e-degravacao` | 8.179 | 8.940 | FAQ, 10 perguntas |
| `/degravacao-ipsis-litteris` | 6.684 | 7.462 | FAQ, 8 perguntas |
| `/transcricao-de-audio-por-ia` | 6.711 | 7.403 | FAQ, 10 perguntas |
| `/transcricao-automatica` | 12.230 | 8.723 | nada |
| `/legendagem` | 14.791 | 10.627 | nada |
| `/transcricao-de-audio` | 23.185 | 17.425 | nada |

**Veredito: nenhuma outra página comercial tem déficit do tipo da `/degravacao`.** Ela é única em grau. Mas outras três páginas do cluster têm o mesmo padrão de FAQ por JS e ficaram fora do escopo aprovado: `/o-que-e-degravacao` (a canibalizadora), `/degravacao-ipsis-litteris` (o ativo de 61 mil impressões) e `/transcricao-de-audio-por-ia`. O conserto é o mesmo mecanismo já validado. Proposta de extensão registrada, não executada.

**Correção de um dado do meu próprio relatório anterior:** eu havia registrado que a FAQ da home era renderizada por JS. Está errado. A home traz **14 itens de acordeão estáticos no HTML** desde antes. O que era renderizado por JS na home eram as **avaliações**, e é isso que entrou no Bloco 1.

## Execução: Bloco 1 e Bloco 5

### Bloco 1, paridade entre HTML inicial e pós-JS

Método: o HTML gerado pelo JS foi extraído do DOM já renderizado e gravado no arquivo, byte a byte igual ao que o navegador produzia. As funções de render continuam no código, mas passam a rodar **apenas se o container estiver vazio** (`renderSeVazio`), o que preserva o comportamento antigo e mantém o `showAllReviews` funcionando.

| Página | Antes | Agora | Blocos trazidos |
|---|---|---|---|
| `/degravacao` | 6.974 | **18.899** | casos de uso (6), pilares (4), diferenciais (8), serviços (5), avaliações (16), depoimentos corporativos (4), FAQ (15) |
| `/degravacao-judicial` | 8.784 | **12.527** | FAQ (10) |
| `/` | 13.314 | **16.493** | avaliações (29) |

Peso: `degravacao.html` 131 KB para 199 KB, `index.html` 157 KB para 203 KB, `degravacao-judicial.html` 68 KB para 75 KB.

### Bloco 5, rating lastreado

`reviewCount` corrigido de 36 para **35** em 5 blocos de schema, nas 3 páginas que declaram `aggregateRating`. Mantida a propriedade `reviewCount` em vez de trocar para `ratingCount`: as 35 são avaliações com texto, exibidas na página, que é exatamente o que `reviewCount` descreve.

Selo visível com a redação exata **"5.0 · 35 avaliações no Google"**, substituindo o texto anterior "Baseado nas avaliações no Google", na mesma posição, ao lado das cinco estrelas já existentes.

**Origem do número, para registro:** 35 avaliações, todas de 5 estrelas, **soma dos 3 perfis do Google My Business**, confirmada pelo dono em 2026-09-07. Por isso a redação não diz "neste perfil". **Regra:** consolidação ou remoção de qualquer um dos 3 perfis exige atualizar selo e schema **juntos**, nas 3 páginas.

`/texter` entrou no `sitemap.xml`, que passa de 12 para 13 URLs.

**Pendência:** o selo ainda não tem link. A URL do perfil principal do GMB é do dono e será aplicada quando ele confirmar. Não foi colocado href de placeholder para não publicar link quebrado.

### Nota sobre o gate de classes-fantasma

A contagem da `/degravacao` foi de 6 para 8. **Não são fantasmas novos.** São `hover:text-primary` e `pb-4`, que o scan anterior já listava como "via JS, sem definição no CSS": eram aplicadas em tempo de execução pelo mesmo markup e agora estão no HTML, onde o scan enxerga. O efeito é idêntico antes e depois, ou seja, nulo nas duas situações. Não foram definidas porque defini-las mudaria o visual, e o gate deste bloco é de zero mudança visual. Ficam para triagem.

## Extensão do Bloco 1 e fechamento do selo (2026-09-07, mesmo ciclo)

Extensão aprovada pelo orquestrador, mesmo mecanismo e mesmos gates:

| Página | HTML inicial antes | Agora | FAQ trazida |
|---|---|---|---|
| `/o-que-e-degravacao` | 8.179 | 14.783 | 10 perguntas |
| `/degravacao-ipsis-litteris` | 6.684 | 11.913 | 8 perguntas |
| `/transcricao-de-audio-por-ia` | 6.711 | 13.907 | 10 perguntas |

Texto renderizado idêntico ao de antes nas três (8.940, 7.462 e 7.403), acordeão abrindo, `overflowX` 0 a 375x667, zero elemento da FAQ estourando a largura, JSON-LD válido e sem classe-fantasma nova.

**Selo com link.** A URL do perfil foi confirmada pelo dono e aplicada nas 3 páginas com `aggregateRating`: `https://www.google.com/search?kgmid=/g/11b5pj3r3y`, com `target="_blank"`, `rel="noopener"` e sublinhado por estilo inline, para não depender de classe que poderia não existir no CSS da página. Usada a URL estavel do painel em vez do encurtador share.google, descartado por mortalidade de shortlink e por carregar parametros de tracking.

## Fechamentos registrados

- **Bloco 8 encerrado sem escopo.** `site.dev`, `audiotext.audiotext` e `ww` retornam NXDOMAIN. Não há host indevido servindo nada, e eram eles os 2,1% de erro de DNS do crawl stats.
- **Item 8 corrigido.** `wp./vagas/transcritor/` já chega em `/texter` com 200, em 3 saltos. `www/vagas/transcritor` não é página, é redirect. Não há destino a corrigir, só cadeia a encurtar.
- **Item 10 corrigido.** Dos 37 404s do export, **só 9 continuam 404** hoje; o restante já foi coberto pelas 73 regras depois do último rastreamento.
- **Item 11 corrigido.** São 29 regras mortas com barra final, não 36.
- **Classes-fantasma `hover:text-primary` e `pb-4`** na `/degravacao`: registradas para triagem futura, fora deste escopo. Não são novas, apenas migraram de JS para HTML.

## T0-SEO, marco de medição

Régua definida pelo orquestrador: leitura quinzenal no Search Console, posição média de 28 dias, para a query "degravação" e para o cluster "transcrição de áudio". Expectativa de sinal em 4 a 8 semanas.

Baseline no momento do corte, do export de 2026-09-07:

| Métrica | Valor |
|---|---|
| "degravação", posição exata | 5,75 (3m) e 5,6 (12m) |
| `/degravacao`, posição no cluster | 3,69 com 3.653 impressões |
| `/o-que-e-degravacao`, posição no cluster | 5,62 com 4.894 impressões |
| `/transcricao-de-audio`, posição no cluster | 21,38 |
| `/texter`, posição no cluster de transcrição | 9,77 |
| `/degravacao-ipsis-litteris` | 61.040 impressões em 3m, CTR 0,07% |

**T0-SEO = 2026-09-07, 21:19 (BRT).** PR #24 (paridade de HTML servido, selo e sitemap) e PR #25 (redirects e noindex dos espelhos) mergeados no mesmo minuto, com deploy automatico na sequencia.

Smoke test rodado logo apos o deploy, com User-Agent de navegador, porque o firewall devolve 403 a agente generico:

| URL | Resultado |
|---|---|
| `wp.audiotext.com.br/` | **1 salto para www, 200** (era 200 direto no wp) |
| `/clientes/` | 2 saltos para `/sobre`, 200 |
| `/blog/` | 2 saltos para `/`, 200 |
| `/quem-somos/` | 2 saltos para `/sobre`, 200 |
| `/degravacao` | 0 saltos, 200 |
| `/transcricao-de-audio` | 0 saltos, 200 |
| `X-Robots-Tag` de `/degravacao.md` | `noindex, follow` |

Nota sobre os 2 saltos: URL digitada **com** barra final gasta um salto so para a normalizacao do `trailingSlash`, e depois o redirect de destino. Sem a barra, e **1 salto**, confirmado em `/clientes`, `/quem-somos`, `/blog` e `/transcricao-de-ata`. A remocao das 29 regras nao acrescentou salto nenhum: elas eram inalcancaveis, e quem gera o primeiro salto e a normalizacao, que roda antes de qualquer regra.

## Item 6, opção B: separação de intenção (branch `feat/seo-intencao`)

**Aplicado nesta branch:** o link "Trabalhe Conosco" do rodapé unificado deixa de apontar para `/vagas/transcritor/`, URL legada que gastava 2 saltos, e passa a apontar direto para `/texter` com `rel="nofollow"`. Nas **14 páginas**, com o texto da âncora inalterado.

Corrige duas coisas de uma vez: as 14 páginas deixam de alimentar o funil de recrutamento com sinal de link, e some uma cadeia de redirect interna.

**Autorização registrada:** a mudança inclui a **/legendagem, congelada**, por autorização explícita do orquestrador. É troca de `href` e `rel` no rodapé, não toca copy visível, funil, marcador nem GTM. Verificado após a mudança: `abrirFormLegendagem` e `enviarOrcamentoLegendagem` intactos, `overflowX` 0.

**Invariante do rodapé preservada:** uma única variante nas 14 páginas, `len` 4972 (era 4969, mais 3 pela troca de `/vagas/transcritor/` por `/texter` somada ao `rel="nofollow"`).

**Selo do GMB:** o encurtador `share.google` foi descartado por mortalidade de shortlink e por carregar parâmetros de tracking. O href passa a ser a URL estável do painel, `https://www.google.com/search?kgmid=/g/11b5pj3r3y`.

### Régua de escalada

Se a `/transcricao-de-audio` não sair da segunda página para o cluster "transcrição de áudio" em **60 dias do deploy desta branch**, escalar para a opção A: `noindex` no funil de recrutamento. Baseline no corte: posição 21,38, atrás de `/texter` (9,77), da home (6,93) e de `wp./vagas/transcritor/` (7,62).

## REGRA SELADA: aprovação de copy

**Toda mudança de copy visível, title, H1 ou âncora exige aprovação EXPLÍCITA do dono antes de implementar. Aprovação do orquestrador não basta.**

Vale a partir de 2026-09-07. Na prática: bloco que traga redação nova entra como proposta, não como execução, até o dono confirmar o texto exato.

**Primeira aplicação da regra:** as redações do item 3 (title e H1 da `/texter`, âncoras da home e da `/degravacao-ipsis-litteris`) ficaram **retidas** neste ciclo. O campo de confirmação do dono chegou como `[confirmar/ajustar aqui]`, ou seja, em branco. O que não é copy, a troca de `href` e `rel` do rodapé e a URL do selo, foi aplicado.

## Item 6, opção B: copy de intenção (branch `feat/seo-intencao-copy`)

**Redações aprovadas EXPLICITAMENTE pelo dono em 2026-09-08**, conforme a regra selada. Primeira vez que a regra é cumprida na forma prevista: o ciclo anterior reteve estas mesmas redações porque o campo de confirmação veio em branco.

| Onde | Antes | Agora |
|---|---|---|
| `/texter` title | Trabalhe como Transcritor \| Processo Seletivo Online - Audiotext | **Vaga de Transcritor: trabalhe de casa \| Audiotext** |
| `/texter` H1 | Torne-se Transcritor da Audiotext | **Vaga de transcritor freelancer na Audiotext** |

A lógica: "vaga" e "transcritor" são as palavras do candidato; "transcrição" sai da posição de destaque do title, que é onde disputava com a intenção comercial.

**Posicionamento das duas âncoras**, para validação no preview:

1. **Home**, seção de missão, no parágrafo que começa com "Seja uma entrevista de mestrado". A frase nova fecha o parágrafo: *"Você pode contratar transcrição de áudio profissional em poucos minutos."*
2. **`/degravacao-ipsis-litteris`**, no bloco "Use Transcrição Padrão para conteúdo editorial e pesquisa", fechando o parágrafo: *"Para esses casos, o indicado é o nosso serviço profissional de transcrição de áudio."* É o ponto mais natural da página: o texto acabou de dizer que ali a fluência importa mais que a fidelidade, então o encaminhamento é consequência do argumento, não enxerto.

**Ajuste de contraste, registrado por transparência:** a âncora da home caiu numa seção de fundo azul escuro e, sem estilo, renderizou no azul padrão do navegador (`rgb(0,0,238)`), ilegível. Recebeu `color:inherit` com sublinhado, por estilo inline, mesmo padrão do selo do GMB e pelo mesmo motivo: não criar classe que poderia não existir no CSS da página. Na `/degravacao-ipsis-litteris` não foi preciso, o CSS da página já resolve.

Com o merge desta branch, a **Onda Técnica está encerrada**. Próxima etapa é a Onda On-page, com o T0-SEO já correndo desde 07/09 21:19.

---

# Onda On-page

Aberta em 2026-09-08. **Etapa 1 cobre apenas os satélites.** As páginas-dinheiro `/degravacao` e `/transcricao-de-audio` ficam **CONGELADAS** até a leitura quinzenal de aproximadamente 21 a 22 de setembro, para não contaminar a medição do T0-SEO, que corre desde 07/09 21:19.

## Fila da Etapa 2, para executar só depois da leitura

Registrada agora, sem execução:

1. **Seção "Quanto custa a degravação" na `/degravacao`.** Respeitando os invariantes de preço: degravação é transcrição vezes 1,6, piso de R$ 3,20 por minuto, nunca R$ 2,00 como piso de degravação, prazos sempre em dias úteis, e sempre com encaminhamento ao simulador.
2. **FAQ ampliada com PAA** nas páginas-dinheiro, a partir das perguntas que o Google exibe para o cluster.
3. **Bloco E-E-A-T do case UOL 2016 e Lava Jato** nas duas páginas-dinheiro. O material já existe na `/sobre` e na seção de reconhecimento da `/degravacao`; a proposta é dar a ele peso de sinal de autoridade, com lastro de link para a matéria.
4. **Reforço de "empresa" e "serviço" na `/transcricao-de-audio`**, endereçando o gap de "empresa de transcrição de áudio" que já estava na fila de SEO Ondas 2-4.
5. **Bloco 7, espelhos `.md` regenerados** a partir das páginas finais, como fechamento da onda. Hoje estão `noindex` desde o PR #25, mas seguem defasados: `/degravacao.md` ainda traz `last_updated: 2026-04-23` e o prazo de 48h que saiu do site em agosto.

## Restrição permanente desta onda

Nenhuma copy visível, title, H1, meta ou âncora vai a produção sem **aprovação explícita do dono sobre o texto exato**. Vale para satélites e para páginas-dinheiro, na Etapa 1 e na Etapa 2.
## Etapa 1, branch 1: `/degravacao-ipsis-litteris` (itens 5 e 6)

Textos aprovados explicitamente pelo dono em 2026-09-08.

| | Antes | Agora |
|---|---|---|
| Title | Degravação Ipsis Litteris: O Que É e Quando Usar \| Audiotext | **Ipsis litteris: significado, tradução e como usar na prática** (60 caracteres) |
| Description | Degravação ipsis litteris transcreve o áudio nas próprias letras, sem edição alguma. Entenda o que significa, por que é exigida em processos judiciais e como se diferencia de outras modalidades. | **Ipsis litteris significa "nas próprias letras": reproduzir exatamente o que foi dito, sem corrigir nada. Veja a tradução, exemplos e quando usar.** (145 caracteres) |

H1 **mantido** de propósito, para proteger a posição 2,13 da query "ipsis litteris como usar". As aspas da description foram escritas como `&quot;` no atributo, senão o HTML quebraria; renderizam como aspas normais.

### Reclassificação da página

**De "ativo de CTR" para "ativo de autoridade e funil"**, por decisão do dono e do orquestrador.

Fundamentação: o cluster "ipsis" soma cerca de 42 mil impressões em 3 meses e rendeu 20 cliques. A intenção é de dicionário, não de compra, e nenhuma otimização de title muda isso de forma relevante. O valor real da página é autoridade de entidade no termo central da degravação, doação de link interno e citação em AI Overview.

Consequências registradas:
1. Os itens 5 e 6 entram assim mesmo, porque o custo é zero, mas **sem investimento adicional de conteúdo nesta página na Etapa 2**. O esforço vai para as páginas-dinheiro.
2. **A métrica de sucesso da página deixa de ser CTR orgânico** e passa a ser navegação interna para `/transcricao-de-audio` e `/degravacao`, medida no GA4 por caminho de página. Entra na régua quinzenal.
3. Queries de exceção a vigiar: **"transcrição ipsis litteris"**, hoje em posição 1,62, que é para defender, e "ipsis litteris significado jurídico". Se a âncora comercial inserida no ciclo anterior provar escoamento na leitura de 21 a 22/09, avaliar um segundo funil, um bloco jurídico apontando para `/degravacao`, como mudança única da janela seguinte.

## Etapa 1, branch 2: `/o-que-e-degravacao` (itens 1 a 4)

Textos aprovados explicitamente pelo dono em 2026-09-08.

| | Antes | Agora |
|---|---|---|
| Title | O que é Degravação? Significado, Diferenças e Quando Usar [2026] | **O que é degravação? Significado, exemplos e quando é exigida** (60) |
| H1 | O que é Degravação? | **O que é degravação de áudio: significado e quando é exigida** |
| Description | Degravação é a transcrição literal de áudio para texto, usada em processos judiciais. Inclui hesitações, pausas e vícios de linguagem. Entenda o significado, quando usar e por que advogados precisam. | **Degravação é a transcrição literal do áudio, preservando hesitações, pausas e vícios de linguagem. Veja um exemplo real e quando ela é exigida no processo.** (155) |

**Encaminhamento comercial** inserido como parágrafo próprio logo abaixo do primeiro, ainda no hero: *"Se você já sabe o que é e precisa contratar, veja nosso serviço de degravação de áudio com prazo e preço na hora."*, com o link em "serviço de degravação de áudio" apontando para `/degravacao`.

Mesmo princípio da separação de intenção aplicado na `/texter`: quem chegou para entender continua lendo, quem chegou para contratar sai daqui em um clique, e a página informacional passa a doar sinal para a página comercial em vez de reter.

**Ajuste de apresentação, registrado:** o CSS desta página remove sublinhado de `a`, então o link nascia com a mesma cor e o mesmo traço do texto ao redor, indistinguível. Recebeu `text-decoration: underline` por estilo inline, mesmo padrão do selo do GMB e da âncora da home, e pelo mesmo motivo de não criar classe que poderia não existir no CSS da página. A cor segue a do parágrafo.

## Marcos da Etapa 1 (data e hora reais de merge)

| Marco | Quando | PR | O que entrou |
|---|---|---|---|
| Abertura da onda e fila da Etapa 2 | **08/09/2026 00:10** | #28 | log, sem mudança de página |
| **T0-ONPAGE-1** | **08/09/2026 00:15** | #30 | title e description da `/degravacao-ipsis-litteris`; title, H1, description e encaminhamento comercial da `/o-que-e-degravacao` |

**Deploy confirmado em produção** logo após o merge, com User-Agent de navegador: as duas páginas servem os titles e as descriptions novos, e o parágrafo de encaminhamento aparece no HTML inicial da `/o-que-e-degravacao`.

**Nota de execução, para o histórico ficar correto:** a ordem planejada era três merges (`docs`, depois `ipsis`, depois `o-que-e`). Na prática foram **dois**: a de docs sozinha e, em seguida, uma branch única (`feat/onpage-etapa1`) com as duas de copy juntas, criada para resolver o conflito no log que as branches empilhadas causariam. O conteúdo é idêntico ao aprovado, item por item.

**Consequência para a leitura de 21 a 22/09:** o relógio da Etapa 1 começa em 08/09 00:15, ou seja, a leitura acontece com **13 a 14 dias** de exposição. É prazo curto para movimento de posição e suficiente para sinal de CTR, já que o title entra no índice na primeira recontagem. O T0-SEO da Onda Técnica continua valendo em separado, desde 07/09 21:19.

### Ajustes de apresentação aceitos e registrados

Aceitos pelo orquestrador, sem alteração do texto aprovado:
1. **Aspas em entidade.** A description da `/degravacao-ipsis-litteris` carrega aspas no texto aprovado; no atributo HTML elas foram escritas como `&quot;`, senão o atributo fecharia no lugar errado. Renderizam como aspas normais.
2. **Sublinhado por estilo inline** no link do encaminhamento da `/o-que-e-degravacao`, porque o CSS da página remove sublinhado de `a` e o link nascia indistinguível do texto ao redor. Mesmo padrão já usado no selo do GMB e na âncora da home, e pelo mesmo motivo de não criar classe-fantasma.
3. **Triagem dos 7 travessões** da `/o-que-e-degravacao`: todos em comentário de HTML ou de JS (rótulos de schema, "Related Links", "FAQ Data"), nenhum em copy visível, e o número é idêntico ao de antes do bake da FAQ. Copy visível segue em zero.

### Estado da onda

Etapa 1 **completa**, exceto a home (itens 8 e 9), retida até a leitura de 21 a 22/09 mais ok explícito do orquestrador. Páginas-dinheiro seguem congeladas. Nenhuma tarefa nova de copy até a leitura.

---

# Decisões sobre as auditorias e execução dos consertos estruturais

Registrado em 2026-09-08.

## Reclassificação do orquestrador

**Ação de ranking**, e só isso: os 3 consertos estruturais (malha de links do hub `/transcricao-de-audio`, adoção das 2 órfãs, breadcrumb mais BreadcrumbList) e o `JobPosting` da `/texter`.

**Todo o resto do relatório de CRO é fila de conversão, não de posição.** Entra no ICE da Etapa 2 com essa etiqueta e **sem promessa de SERP**. Vale para: visual de resultado no hero, prova social na dobra, garantia ausente na `/transcricao-de-audio`, CTAs da `/degravacao-judicial`, alvos de toque e rótulo único de CTA.

## Executado agora: breadcrumb visível

Aplicado em **3 páginas de serviço**: `/degravacao`, `/transcricao-de-audio` e `/transcricao-automatica`. O `BreadcrumbList` já existia no schema das quatro; o que faltava era a trilha visível que ele declara.

Detalhes: `.breadcrumb` **não existia** no CSS de nenhuma delas, então a definição entrou junto, senão seriam quatro classes-fantasma. O contêiner usa estilo inline, para não depender de classe de largura que pode não existir na página. O primeiro item do schema foi alinhado de "Home" para **"Audiotext"** em duas páginas, que era a divergência com as 6 páginas de definição.

**`/legendagem` ficou de fora.** É página de serviço e estava no escopo aprovado, mas está sob **congelamento formal desde 02/09**, fechada para qualquer mudança, visível ou invisível. O bloco autorizou nominalmente a exceção da `/transcricao-de-audio` e não mencionou a `/legendagem`, então não estendi a exceção por conta própria. Fica aguardando autorização explícita.

## Retido: JobPosting da /texter

Não implementei, e o motivo é de dado, não de esforço. O `JobPosting` do Google exige **`datePosted`**, e não existe fonte para essa data na página nem no repositório. Inventar data em rich result de vaga é declarar como fato algo que não sei, com risco real: o Google despublica vaga vencida e trata data incorreta como má prática.

**Preciso do dono:** a data de publicação da vaga, a confirmação de que ela está aberta hoje, e se há prazo de validade. Com isso o schema sai em minutos, e é o item de melhor relação entre impacto e esforço de toda a auditoria, já que a `/texter` tem o maior CTR do site, 11,39%.

## Retido: adoção das 2 órfãs

O próprio bloco manda submeter os textos das âncoras antes de implementar. As propostas estão na mensagem de entrega deste ciclo, aguardando aprovação explícita do dono.

Registro da exceção autorizada: a inserção acontecerá na `/transcricao-de-audio`, **congelada**, autorizada pelo orquestrador por ser a correção do achado central, o hub que recebe de 8 páginas e doa 1 link. Terá **data e hora próprias no log** para a leitura de 21 a 22/09 poder segregar o efeito.

## Mortos, registrados

1. **Página "quanto custa degravação".** Morta. "quanto custa" soma 3 impressões em 12 meses nos nossos dados. Vira **seção-teste** dentro da `/degravacao`, na Etapa 2, e a decisão sobre página própria fica condicionada ao que essa seção capturar.
2. **Página "degravação de audiências".** Morta. Canibalizaria a `/degravacao-judicial`, que já traz audiências no H1, e já ranqueamos entre 6,5 e 7,9 para as 9 variantes da query.
3. **Avenida programática inteira.** Morta. Veredito artesanal aceito: não há dataset, o volume por variante é baixo, e já ranqueamos para quase tudo que seria alvo.

## Pendência de decisão de negócio, fora da Etapa 2

**Preço antes do lead no funil do `/budget`**, no padrão que a `/legendagem` já usa. Não executar nada. É decisão do dono, com trade-off explícito: tende a subir a conclusão do funil e a baixar a qualificação do lead. Grande demais para entrar de carona em qualquer branch.

## Aguardando a leitura de 21 a 22/09

- As 2 candidatas novas de spoke: página de comparação "degravação vs transcrição" e o `JobPosting` como hub de vagas. Entram no ICE junto com o resto.
- **Rótulo único de CTA**, hoje com 4 variantes no site. Entra no ICE como item de copy, sujeito ao rito de aprovação do dono.

## Consertos estruturais, segunda leva (branch `feat/breadcrumb-servico`, aplicado em 2026-09-09)

### Breadcrumb na /legendagem, exceção ao congelamento

Autorizado nominalmente pelo orquestrador. Mesma trilha e mesmo estilo das outras três: `Audiotext › Legendagem`, 48px de altura, e o `.breadcrumb` definido no CSS da própria página, que não existia. Schema alinhado de "Home" para "Audiotext".

**Natureza da exceção, para o registro da página congelada:** é adição de trilha de navegação e da definição de estilo correspondente. **Não toca formulário, marcador nem GTM.** Conferido depois da mudança: `abrirFormLegendagem` e `enviarOrcamentoLegendagem` intactos, `overflowX` 0, H1 na mesma posição.

Com isso, as **4 páginas de serviço** passam a exibir a trilha que o `BreadcrumbList` já declarava.

### JobPosting na /texter

Dados fornecidos pelo dono: publicação em **03/08/2026**, vaga **aberta hoje**.

Sobre a validade, tomei a via evergreen do bloco: a `/texter` é a página de recrutamento permanente do site, por decisão selada, e não uma vaga com data de encerramento. Então `validThrough` ficou em **2026-11-01**, ou seja, 90 dias a partir da publicação, e não os 60 mencionados. **Se a intenção era mesmo encerrar em 60 dias, é trocar uma linha.**

**REGRA DE RENOVAÇÃO, para não expirar o rich result:** o `validThrough` precisa ser empurrado para frente **antes de 01/11/2026**. Vaga com `validThrough` vencido some do Google Empregos. Sugiro renovar a cada 90 dias, atualizando também o `datePosted` se a vaga for republicada de fato. **Próxima renovação: até 25/10/2026.**

Campos declarados: `title`, `description` em HTML, `datePosted`, `validThrough`, `employmentType: CONTRACTOR`, `hiringOrganization` com nome, site e logo iguais aos do `Organization` das outras páginas, `jobLocationType: TELECOMMUTE`, `applicantLocationRequirements: BR`, `directApply` e `url`. É o conjunto que o Google exige para vaga remota.

**Pendência:** a validação no Rich Results Test só roda sobre URL pública, então precisa acontecer **depois do deploy**. Fica com o dono.

### Adoção das 2 órfãs, exceção na /transcricao-de-audio

Duas âncoras em prosa corrente, com os textos aprovados pelo dono:

1. Na seção que compara IA e humano: *"Para gravações simples, com áudio limpo e um só interlocutor, a **transcrição de áudio por IA** resolve com ótimo custo."* Redação ajustada pelo orquestrador, porque a minha proposta original rebaixava o produto de IA.
2. No fim do parágrafo de abertura: *"Para entrevistas de pesquisa e jornalismo, veja a **transcrição de entrevista**."*

**Ajuste de posicionamento que fiz durante a execução:** a segunda âncora tinha sido inserida no meio do parágrafo e atropelava a frase seguinte, que já falava de pesquisadores e jornalistas. Movi para o fim do mesmo parágrafo. O texto aprovado não mudou, só a posição.

**Efeito sobre o achado central:** a `/transcricao-de-audio` passa de **1 para 3 links de corpo doados**. Deixa de ser hub que só recebe. As duas páginas órfãs passam a ter link de corpo apontando para elas.

Os dois links usam sublinhado por estilo inline, sem classe, pelo mesmo motivo de sempre.

### Datas para a leitura de 21 a 22/09

Esta leva é **posterior ao T0-ONPAGE-1** (08/09 00:15) e precisa ser segregada na leitura. Commits de 09/09; a data e hora de merge entram aqui quando o dono mergear, como nas levas anteriores.

Efeitos esperados por página, para a leitura saber o que olhar:
- `/transcricao-de-audio`: os 2 links novos são a correção do hub. Efeito esperado em **posição no cluster**, lento.
- `/transcricao-de-audio-por-ia` e `/transcricao-de-entrevista`: primeira vez com link de corpo. Efeito esperado em **impressões**.
- 4 páginas de serviço: breadcrumb. Efeito esperado em **apresentação na SERP**, não em posição.
- `/texter`: `JobPosting`. Efeito esperado em **elegibilidade a rich result de vaga**.

## Aprendizado de método, registrado

**Medição de presença de conteúdo sempre sobre o HTML servido, nunca sobre `innerText` de estado colapsado.**

Origem: afirmei que a `/transcricao-de-audio` não tinha garantia de 30 dias, com severidade alta e prioridade 1. A página tem seção dedicada com H2 próprio. O teste lia `document.body.innerText` procurando string exata, e o trecho estava recolhido no momento da medição.

Vale para qualquer auditoria futura: `innerText` responde "o que está visível agora", que é útil para dobra, contraste e alvo de toque. Para "este conteúdo existe na página", a fonte é o HTML servido.
