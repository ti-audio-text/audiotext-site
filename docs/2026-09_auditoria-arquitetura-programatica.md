# Auditoria de arquitetura e viabilidade programática, 2026-09-08

Read-only. Nenhuma página criada. Dados de estrutura vindos do repositório e de volume do export do Search Console de 07/09.

## Sumário executivo

1. O hub and spoke **existe e funciona na entrada**: `/degravacao` e `/transcricao-de-audio` recebem 8 links de corpo cada.
2. O modelo **quebra na saída**: `/transcricao-de-audio` doa **1 único link de corpo**. É hub que recebe e não distribui.
3. Três páginas são **órfãs de corpo**: `/transcricao-de-audio-por-ia`, `/transcricao-de-entrevista` e `/texter`. Só recebem link de rodapé.
4. Breadcrumb: correto e visível nas 6 páginas de definição. **Ausente nas 4 de serviço** e na home.
5. `/sobre` tem **475 palavras e nenhum JSON-LD**. É a única página abaixo do piso de 500 e a única sem schema.
6. Os padrões de title são consistentes **dentro** de cada tipo, mas os tipos não seguem fórmula comum.
7. **"Quanto custa degravação" não tem demanda mensurável nos nossos dados**: "quanto custa" aparece com 3 impressões em 12 meses.
8. "Degravação de audiências" soma cerca de 580 impressões em 12 meses, espalhadas em 9 variantes, e já ranqueamos entre 6 e 8 para elas.
9. O gap de "empresa e serviço" **não é página faltando**: já ranqueamos em 3,62 para "serviço de transcrição de áudio" com a página existente.
10. **Veredito: o site não comporta SEO programático.** Não há dataset. O jogo aqui é hub and spoke artesanal.

---

# A) Auditoria da estrutura atual

## A1. Mapa real do hub and spoke

| Página | Palavras | Links de corpo que doa | Recebe de |
|---|---|---|---|
| `/degravacao` | 2.672 | 6 | **8 páginas** |
| `/transcricao-de-audio` | 3.340 | **1** | **8 páginas** |
| `/` | 2.309 | 5 | rodapé |
| `/legendagem` | 1.879 | 2 | rodapé |
| `/o-que-e-degravacao` | 1.764 | 4 | 2 |
| `/transcricao-automatica` | 1.753 | 1 | rodapé |
| `/degravacao-judicial` | 1.727 | 4 | 2 |
| `/degravacao-ipsis-litteris` | 1.426 | 5 | 2 |
| `/transcricao-de-audio-por-ia` | 1.430 | 4 | **0, órfã** |
| `/degravacao-de-video` | 1.188 | 4 | 2 |
| `/transcricao-de-entrevista` | 1.168 | 4 | **0, órfã** |
| `/texter` | 1.002 | 0 | **0, órfã por decisão** |
| `/sobre` | **475** | 1 | 1 |

**Hubs reais:** `/degravacao` e `/transcricao-de-audio`. A home não funciona como hub: doa 5 links mas quase não recebe link interno de corpo, só de rodapé.

**Onde o modelo quebra:**

1. **`/transcricao-de-audio` doa 1 link.** Recebe autoridade de 8 páginas e não devolve para nenhum spoke. O cluster de transcrição não tem circulação, e isso é coerente com ela estar em posição 21 no cluster: o Google vê uma página que ninguém sai.
2. **Duas órfãs de conteúdo.** `/transcricao-de-audio-por-ia` e `/transcricao-de-entrevista` doam 4 links cada e não recebem nenhum de corpo. São spokes sem hub.
3. **`/texter` órfã por decisão**, e está correto depois do `nofollow` do rodapé.
4. **O cluster de degravação é saudável.** Cinco páginas circulando entre si e apontando para o hub. O de transcrição não tem equivalente.

## A2. Padrões de title por tipo

| Tipo | Páginas | Padrão atual | Fórmula de referência | Situação |
|---|---|---|---|---|
| Serviço | degravacao, transcricao-de-audio, legendagem, automatica | `[Serviço] [qualificador] \| Audiotext` | `[Serviço] em [contexto] - [Marca]` | consistente |
| Definição | o-que-e-degravacao, ipsis-litteris | `O que é X? Significado, exemplos e...` / `X: significado, tradução e como usar` | `O que é [Termo]? Definição + Guia` | **inconsistente entre as duas**, cada uma com uma fórmula |
| Guia por vertical | judicial, de-video, entrevista | `[Vertical]: [descrição longa]` | sem fórmula definida | sem padrão |
| Recrutamento | texter | `Vaga de [cargo]: [benefício] \| Marca` | n/a | ok |

**Lacuna real:** não existe nenhuma página de **comparação** (`X vs Y`), embora a `/degravacao` e a `/degravacao-ipsis-litteris` tenham seções internas de comparação com boa profundidade. É o tipo mais fácil de justificar com o conteúdo que já existe.

## A3. Schema por tipo

| Tipo | Schema esperado | Situação real |
|---|---|---|
| Serviço | Service ou LocalBusiness + BreadcrumbList | Service, HowTo, FAQPage, Product, Organization presentes. **BreadcrumbList em JSON existe, breadcrumb visível não** |
| Definição | FAQPage ou Article + BreadcrumbList | Article, DefinedTerm, FAQPage, BreadcrumbList **e breadcrumb visível**. Correto |
| Home | WebSite, Organization | presentes, **sem BreadcrumbList**, aceitável para raiz |
| `/sobre` | qualquer | **nenhum JSON-LD** |
| `/texter` | JobPosting | só FAQPage. **JobPosting ausente**, e é a página com 439 cliques em 3 meses |

**Duas lacunas estruturais:**
1. **Breadcrumb visível ausente nas 4 páginas de serviço.** O JSON-LD declara a trilha que a página não mostra.
2. **`/texter` sem JobPosting.** É a página de maior CTR do site, 11,39%, e não declara o schema do seu tipo. Rich result de vaga é elegível e está sendo deixado na mesa.

## A4. Risco de thin content no que já existe

| Página | Palavras | Risco |
|---|---|---|
| `/sobre` | 475 | **Alto.** Abaixo do piso de 500, sem schema, e é página institucional que recebe link do rodapé de 14 páginas |
| `/texter` | 1.002 | Baixo |
| `/transcricao-de-entrevista` | 1.168 | Baixo, mas é órfã |
| `/degravacao-de-video` | 1.188 | Baixo |

**Seções repetidas entre páginas:** o rodapé é idêntico por decisão, e o bloco de avaliações se repete em 3 páginas. Nenhum caso de página que seja só troca de nome. **O conteúdo existente não é thin.**

---

# B) Especificação da expansão

## Avaliação das candidatas da fila

### 1. "Degravação de audiências", spoke jurídico

**Dado:** 9 variantes de query, a maior com 324 impressões em 12 meses, o conjunto somando cerca de 580. Posições entre 6,5 e 7,9, ou seja, **já ranqueamos com as páginas atuais**.

**Veredito: NÃO criar página.** Volume não sustenta, e criar uma página nova canibalizaria a `/degravacao-judicial`, que já cobre audiências no H1. O ganho está em **fortalecer a judicial**, que hoje é a mais fraca do site em CRO (nota 52), não em fatiar mais.

### 2. "Quanto custa degravação"

**Dado:** "quanto custa" aparece com **3 impressões em 12 meses**. "valor", 4. **Não há demanda mensurável nos nossos dados.**

**Veredito: NÃO criar página, e revisar o item da fila.** A intenção de preço é real no mercado, mas não temos evidência dela. O caminho barato é a **seção de preço dentro da `/degravacao`**, que já está na fila da Etapa 2, e medir se ela captura query de preço. Se capturar, aí sim se discute página própria. Criar a página antes é apostar sem dado.

### 3. "Transcrição para pesquisa qualitativa", spoke acadêmico

**Dado:** o cluster acadêmico inteiro soma menos de 60 impressões em 12 meses. A maior, "transcrição de entrevista", tem 24.

**Veredito: NÃO criar página.** Já existe `/transcricao-de-entrevista`, com 1.168 palavras, **órfã de link de corpo**. O ganho está em adotá-la no interlinking, não em criar uma irmã.

### 4. Spokes por ICP ou vertical

**Veredito: NÃO, como programático.** Não há dataset. Cada vertical exigiria pesquisa de caso real, e aí é conteúdo artesanal, não template.

## Até 3 candidatas adicionais que o dado justifica

### Candidata A: página de comparação "Degravação vs Transcrição Padrão"

**Justificativa:** é o conteúdo que já existe, disperso em seções dentro de 3 páginas, e o único tipo de fórmula que falta na arquitetura. As queries de definição do cluster ("o que é degravação" 676 impressões, "degravação significado" 689) mostram intenção de entender a diferença.

- **URL:** `/degravacao-vs-transcricao`
- **Title:** `Degravação ou transcrição? Diferença, exemplos e quando usar cada uma`
- **Seções:** introdução variável, tabela comparativa (já existe, seria movida), o mesmo trecho nas duas modalidades (já existe na ipsis-litteris), quando usar cada uma, preço comparado, FAQ
- **Schema:** Article + FAQPage + BreadcrumbList
- **Interlinking:** hub `/degravacao` sempre, mais `/o-que-e-degravacao` e `/transcricao-de-audio`
- **Unicidade:** exige mover conteúdo, não duplicar. Se as seções ficarem nos dois lugares, vira canibalização

### Candidata B: JobPosting e hub de vagas em `/texter`

**Justificativa:** 439 cliques em 3 meses e CTR de 11,39%, o melhor do site, sem o schema do seu tipo. Não é página nova, é schema faltando.

- **Ação:** adicionar `JobPosting` e manter `noindex` fora de questão
- **Esforço:** baixíssimo, e é o único item desta auditoria que não depende de aprovação de copy

### Candidata C: nenhuma

Não proponho uma terceira. **Sinalizo isso de propósito:** o bloco autorizava até 3, e forçar uma terceira sem dado seria exatamente o erro que a salvaguarda anti-thin existe para evitar.

## Especificação de template, para o caso de a candidata A ser aprovada

- **Tipo:** comparação
- **Padrão de URL:** `/[termo-a]-vs-[termo-b]`
- **Título:** `[A] ou [B]? Diferença, exemplos e quando usar cada uma`
- **Meta:** `Entenda a diferença entre [A] e [B]: o que muda no texto final, quando cada uma é exigida e quanto custa cada modalidade.`
- **Seções:** introdução **variável** por par, tabela comparativa **variável**, exemplo lado a lado **variável**, quando usar cada uma **variável**, preço **variável**, sobre a Audiotext **estático**, FAQ **variável**
- **Interlinking:** link ao hub sempre, mais 2 a 3 spokes relacionados
- **Schema:** Article + FAQPage + BreadcrumbList
- **Salvaguardas:** mínimo de 1.200 palavras únicas, pelo menos 3 seções únicas por variante, exemplo real obrigatório, **nunca publicar variante que seja o mesmo texto com nomes trocados**

**Escala realista deste template: 1 a 2 páginas.** Não existe terceiro par com demanda.

---

# C) Veredito

**O site não comporta SEO programático de verdade.** A justificativa é de dado, não de gosto:

1. **Não há dataset.** SEO programático precisa de eixo com dezenas ou centenas de valores: cidades, produtos, integrações. Aqui há 4 serviços e um punhado de verticais jurídicas. O produto de qualquer combinação é dezenas de páginas, não milhares.
2. **O volume por variante é baixo.** A maior candidata da fila soma 580 impressões em 12 meses, espalhadas em 9 grafias. Uma página programática precisa de volume por variante que justifique existir.
3. **Já ranqueamos para quase tudo que seria alvo.** Entre 3,6 e 8 nas queries candidatas. O problema não é cobertura, é **CTR e força das páginas que já existem**.
4. **O maior ativo do site é uma página só.** `/degravacao-ipsis-litteris` faz 61 mil impressões sozinha. Concentração, não distribuição.

**O jogo aqui é hub and spoke artesanal**, e ele tem três consertos estruturais claros, todos sem criar página:

| # | Conserto | Por quê | Esforço |
|---|---|---|---|
| 1 | `/transcricao-de-audio` passa a doar links para spokes | Hub que não distribui, e está em posição 21 no cluster | Baixo |
| 2 | Adotar as 2 órfãs no interlinking de corpo | Spokes sem hub não acumulam autoridade | Baixo |
| 3 | Breadcrumb visível nas 4 de serviço e `JobPosting` na `/texter` | Lacunas estruturais declaradas mas não entregues | Baixo |

Os três valem mais que qualquer página nova, custam menos e **nenhum deles mexe em copy visível**, o que os torna executáveis sem o rito de aprovação.

**Recomendação para a priorização ICE da Etapa 2:** entrar com estes três antes de qualquer item de conteúdo novo. São impacto médio, confiança alta, esforço baixo. A seção de preço na `/degravacao`, já na fila, vira também o **teste** que decide o futuro da página "quanto custa".
