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

As datas exatas de merge e de deploy entram aqui assim que o dono mergear.

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
