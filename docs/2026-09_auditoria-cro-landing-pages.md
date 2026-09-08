# Auditoria CRO das landing pages, 2026-09-08

Read-only. Nada implementado. Medições em produção, desktop 1366x768 e mobile 390x844.

## Sumário executivo

1. Nenhuma das quatro páginas avaliadas tem **visual de resultado no hero**. Todas abrem com texto puro.
2. Nas duas páginas-dinheiro, a **dobra do desktop não tem nenhum sinal de confiança**: zero logo, zero estrela. O hero sozinho ocupa 1.142px contra uma dobra de 768px.
3. O site usa **quatro rótulos diferentes** para o mesmo CTA: "Ver meu orçamento", "Calcular meu preço", "Simular orçamento" e "Calcule seu orçamento em 1 minuto".
4. A `/degravacao-judicial` é um **deserto de confiança e de CTA**: sem logos, sem avaliações, sem case, sem garantia, e apenas 3 CTAs em 12.434px de página.
5. O funil do `/budget` exige **7 campos obrigatórios, incluindo nome, e-mail e telefone, antes de mostrar qualquer preço**. É o maior atrito medido.
6. Performance **não é problema**: `load` entre 342ms e 525ms nas quatro páginas.
7. Alvos de toque abaixo de 44px: 16 na degravacao, 14 na home e na judicial, 8 na audio.
8. A garantia de 30 dias **não aparece na `/degravacao-judicial`**. (Corrigido em 08/09: eu havia dito que também faltava na `/transcricao-de-audio`, e estava errado. Ver a nota de correção no fim.)
9. O cruzamento com os RSAs do Ads **não pôde ser feito**: o conector do Google Ads pediu reautenticação.
10. Notas: degravacao 72, transcricao-de-audio 70, home 68, legendagem 70, degravacao-judicial 52, funil do /budget 58.

---

## Pendência de medição que bloqueia um item do escopo

O bloco pedia comparar as headlines dos RSAs com o H1 e o hero de cada landing, para testar a hipótese da "experiência de página abaixo da média". **Não consegui**: a chamada ao conector do Google Ads retornou `503 Reauthentication is needed`. Fica como pendência do dono: reautenticar e reexecutar só esse cruzamento. É o único item do escopo que ficou sem resposta, e é justamente o que testaria a hipótese mais cara da conta.

Também não rodei Lighthouse ou PSI: não há binário local disponível. Os números de performance abaixo vêm da Navigation Timing API do navegador real, em rede de banda larga. **Carga em 3G continua sem medição.**

---

## /degravacao

### Above-the-fold

| Elemento | Existe | Nota |
|---|---|---|
| Headline com proposta de valor | sim | 7/10 |
| Subheadline explicando o como | sim | 9/10 |
| Visual de resultado | **não** | 0/10 |
| CTA primário acima da dobra | sim | 9/10 |
| Sinal de confiança acima da dobra | parcial | 4/10 |
| Navegação mínima | sim | 9/10 |

Desktop: 2 CTAs na dobra (header em y=16, hero em y=593). **Zero logo e zero estrela na dobra.** O hero mede 1.142px, ou seja, 1,5 vez a dobra de 768px. Mobile: 3 CTAs acima da dobra, incluindo a banda de preço.

### Headline

**Atual:** "Degravação de Áudio Profissional"
**Subheadline:** "Degravação de audiências, depoimentos e oitivas: ipsis litteris, com marcação de tempo, para apresentação como prova em processos judiciais."

| Framework | Aderência |
|---|---|
| 4U's | Útil sim, ultraespecífico **não** (H1), único **não**, urgente **não** |
| AIDA | Atenção fraca no H1, interesse forte na subheadline |
| PAS | Ausente no hero; o PAS existe, mas só na seção 2 |
| BAB | Ausente |

**Problema central:** o H1 é genérico e a subheadline carrega sozinha toda a especificidade. Quem lê só o H1 não sabe o que diferencia. A subheadline é excelente e está subaproveitada.

**Reescrita sugerida** (não implementada, sujeita ao rito de aprovação): "Degravação de áudio aceita como prova em processo".

### Conversion killers

| Problema | Severidade | Impacto | Conserto |
|---|---|---|---|
| Sem visual de resultado no hero | 🟡 | Médio | Mostrar o documento entregue, trecho de degravação com marcação de tempo |
| Zero prova social na dobra do desktop | 🔴 | Alto | Subir uma linha de logos ou o selo de avaliações para o hero |
| 13 CTAs com texto idêntico | 🟡 | Médio | Variar por contexto, mantendo um verbo de ação |
| Página de 22.731px no mobile | 🟡 | Médio | Avaliar recolher seções de meio |
| 16 alvos de toque abaixo de 44px | 🟡 | Médio | Elevar para 44px |
| 7 campos antes de qualquer preço | 🔴 | Alto | Ver seção do funil |
| Carga | 🟢 | Nenhum | `load` 449ms, sem ação |

### CTAs

| Posição recomendada | Existe | Observação |
|---|---|---|
| Hero | sim | y=537, 60px de altura |
| Pós-proposta de valor | sim | y=1552 |
| Pós-prova social | sim | y=5401 |
| Pós-benefícios | sim | y=8445 e y=9672 |
| Sticky | **não** | Lacuna, em página de 22.7k px |

Todos com o texto "Ver meu orçamento". Header com 48px.

### Sinais de confiança

| Sinal | Estado |
|---|---|
| Logos de clientes | existe, **abaixo da dobra** |
| Depoimentos | existe, 16 avaliações mais 4 corporativas |
| Estrelas e avaliações | existe, com selo "5.0 · 35 avaliações no Google" |
| Case | existe, Lava Jato e UOL |
| Garantia | existe, 30 dias |
| NDA e sigilo | existe, inclusive na dobra |
| Certificações | **falta** |
| Selos de segurança | **falta** |

### Mobile

Layout responsivo sim, `overflowX` 0. Texto legível, menor fonte de corpo 12px, no limite. 16 alvos abaixo de 44px. Formulário: ver funil. Carga em 3G sem medição.

### Plano priorizado

| # | Conserto | Impacto | Esforço |
|---|---|---|---|
| 1 | Prova social na dobra do desktop | Alto | Baixo |
| 2 | Preço antes do lead no funil | Alto | Médio |
| 3 | Alvos de toque para 44px | Médio | Baixo |
| 4 | CTA sticky no mobile | Médio | Baixo |
| 5 | Visual de resultado no hero | Médio | Médio |

**Nota: 72/100. Confiança: alta.** Não avaliado: carga em 3G, casamento com RSA.

---

## /transcricao-de-audio

### Above-the-fold

| Elemento | Existe | Nota |
|---|---|---|
| Headline | sim | 7/10 |
| Subheadline | sim | 7/10 |
| Visual de resultado | **não** | 0/10 |
| CTA acima da dobra | sim | 9/10 |
| Confiança acima da dobra | parcial | 4/10 |
| Navegação mínima | sim | 10/10, zero link no header |

### Headline

**Atual:** "Transcrição de Áudio e Vídeo para Texto"
**Subheadline:** "Transcrição profissional revisada por transcritores. Precisão próxima a 100%."

O H1 descreve **a categoria**, não a oferta. Serve para SEO e não vende. 4U's: só o útil. O número forte, 99%, está no title mas não no H1.

**Reescrita sugerida:** "Transcrição de áudio revisada por humanos, com precisão próxima a 100%".

### Conversion killers

| Problema | Severidade | Impacto | Conserto |
|---|---|---|---|
| ~~Garantia ausente~~ **achado retirado** | - | - | A página tem seção própria de garantia. Ver nota de correção |
| Zero prova social na dobra | 🔴 | Alto | Subir logos ou selo |
| Sem visual de resultado | 🟡 | Médio | Amostra de transcrição |
| 25.943px no mobile, a maior do site | 🟡 | Médio | Enxugar meio |
| CTA com rótulo diferente do resto | 🟡 | Médio | Padronizar |
| Carga | 🟢 | Nenhum | `load` 379ms |

### CTAs

9 CTAs "Calcular meu preço", nas 4 posições recomendadas. **Sem sticky.** O rótulo diverge de todas as outras páginas.

### Sinais de confiança

Logos sim, depoimentos sim (12), avaliações sim, case sim, NDA sim, **garantia sim**. Certificações e selos: ausentes.

### Mobile

`overflowX` 0, menor fonte 14px, 8 alvos abaixo de 44px, o melhor resultado entre as páginas-dinheiro.

### Plano priorizado

| # | Conserto | Impacto | Esforço |
|---|---|---|---|
| 1 | Prova social na dobra | Alto | Baixo |
| 2 | Padronizar rótulo do CTA | Médio | Baixo |
| 3 | CTA sticky | Médio | Baixo |

**Nota: 70/100. Confiança: alta.**

---

## /degravacao-judicial

A página mais frágil do conjunto.

### Above-the-fold

| Elemento | Existe | Nota |
|---|---|---|
| Headline | sim | 8/10 |
| Subheadline | sim | 6/10, 263 caracteres, densa demais |
| Visual | **não** | 0/10 |
| CTA acima da dobra | sim | 6/10, **37px de altura** |
| Confiança acima da dobra | **não** | 2/10 |
| Navegação mínima | sim | 9/10 |

### Headline

**Atual:** "Degravação Judicial: transcrição ipsis litteris para processos". Boa para busca, fria para conversão. É a única do conjunto que já nomeia o público e o uso.

### Conversion killers

| Problema | Severidade | Impacto | Conserto |
|---|---|---|---|
| **Nenhum sinal de confiança na página inteira** | 🔴 | Alto | Trazer logos, avaliações e o case UOL |
| **Só 3 CTAs em 12.434px** | 🔴 | Alto | Inserir CTA pós-prova e pós-benefícios |
| CTA do header com 37px | 🟡 | Médio | 44px |
| Rótulo antigo "Simular orçamento" | 🟡 | Médio | Padronizar |
| Subheadline de 263 caracteres | 🟡 | Médio | Quebrar em duas |
| 14 alvos abaixo de 44px | 🟡 | Médio | Elevar |

### Sinais de confiança

| Sinal | Estado |
|---|---|
| Logos | **falta** |
| Depoimentos | **falta** |
| Avaliações | **falta** |
| Case Lava Jato e UOL | **falta** |
| Garantia | **falta** |
| NDA | existe |

Uma página que vende para advogado, Ministério Público e tribunal, **sem uma única prova**.

### Plano priorizado

| # | Conserto | Impacto | Esforço |
|---|---|---|---|
| 1 | Bloco de prova social completo | Alto | Médio |
| 2 | CTAs no meio da página | Alto | Baixo |
| 3 | Case UOL e Lava Jato | Alto | Baixo |
| 4 | Alvos de toque e rótulo do CTA | Médio | Baixo |

**Nota: 52/100. Confiança: alta.**

---

## Home

### Above-the-fold

| Elemento | Existe | Nota |
|---|---|---|
| Headline | sim | 6/10 |
| Subheadline | sim | 7/10 |
| Visual de resultado | **não** | 0/10 |
| CTA acima da dobra | sim | 8/10, header com 40px |
| Confiança acima da dobra | parcial | 6/10, números sim |
| Navegação mínima | **não** | 4/10, 6 links no header |

### Headline

**Atual:** "Transcrição de Áudio, Degravação e Legendagem Profissional". É uma lista de serviços, não uma promessa. Nenhum framework atendido. A linha seguinte, "14 Anos Convertendo Conhecimento Falado em Documentação Precisa", é bem mais forte e está em segundo plano.

**Observação de ordem:** a home tem title e description novos já aprovados e retidos até a leitura. Qualquer proposta de H1 deve entrar no mesmo lote, não antes.

### Conversion killers

| Problema | Severidade | Impacto | Conserto |
|---|---|---|---|
| 6 links de navegação competindo | 🟡 | Médio | Reduzir |
| H1 é lista, não promessa | 🟡 | Médio | Trocar com a linha de 14 anos |
| Sem visual de resultado | 🟡 | Médio | Visual único |
| CTA do header com 40px | 🟡 | Médio | 44px |
| 14 alvos abaixo de 44px | 🟡 | Médio | Elevar |

### Sinais de confiança

Todos presentes: logos, 29 avaliações, selo, case, garantia, NDA. **É a página mais bem servida de prova, e a que menos precisa.**

**Nota: 68/100. Confiança: alta.**

---

## /legendagem (modo leitura, página congelada)

Diagnóstico apenas.

- CTA **consistente** nas 6 ocorrências: "Calcule seu orçamento em 1 minuto". É a única página com rótulo coerente de ponta a ponta.
- CTA do hero em y=545, acima da dobra de 844. Sem CTA no header.
- **Sem logos de clientes e sem garantia visível.** Avaliações presentes.
- Sem visual de resultado, e é a página onde mais faria falta, porque legenda é produto visual.
- 6 alvos abaixo de 44px, o melhor número do site.
- `overflowX` 0, `load` 361ms.

**Nota: 70/100. Confiança: média**, porque a página está congelada e não abri o formulário para não interferir na medição do piloto.

---

## Funil do /budget

### Estrutura medida

| Etapa | Campos | Obrigatórios |
|---|---|---|
| 1, Serviço | serviceCode, amount, finalityCode, languageCode | 4 |
| 2, Seus dados | username, email, phone, company, howDidMeetUs, observation | 3 de 6 |
| 3, Orçamento | resultado com os planos | 0 |

Barra de progresso presente, com rótulos "Serviço", "Seus dados", "Orçamento".

### O killer principal

**`precoAntesDoLead: false`.** O usuário entrega nome, e-mail e telefone **antes** de ver qualquer valor. O modal se chama orçamento e a barra promete "Orçamento" na etapa 3, mas o preço só aparece depois do lead. Para quem chegou de anúncio comparando fornecedores, é o ponto de maior abandono provável, e é onde a `/legendagem` acerta: ela mostra estimativa ao vivo antes do envio.

Ordem de grandeza: em funis de cotação, mover o valor para antes da captura costuma render ganho de dois dígitos percentuais em conclusão, com queda na qualidade do lead. É trade-off, não melhoria pura, e por isso entra como teste, não como certeza.

### Outros achados

| Problema | Severidade | Conserto |
|---|---|---|
| Preço só após o lead | 🔴 | Estimativa por faixa na etapa 1, como na legendagem |
| Botão "Avançar" com 40px | 🟡 | 44px |
| 4 campos na etapa 1 | 🟡 | `finalityCode` e `languageCode` têm padrão dominante, poderiam ser opcionais |
| Campo morto `participantsAmount` | 🟢 | Remover do DOM |

**Nota: 58/100. Confiança: alta** na estrutura, **baixa** no impacto estimado, que só um teste resolve.

---

## Achado transversal: quatro rótulos para o mesmo CTA

| Página | Rótulo | Ocorrências |
|---|---|---|
| `/degravacao` | Ver meu orçamento | 9 |
| `/transcricao-de-audio` | Calcular meu preço | 9 |
| Home e `/degravacao-judicial` | Simular orçamento | 4 e 3 |
| `/legendagem` | Calcule seu orçamento em 1 minuto | 6 |

Cada um veio de um ciclo diferente e nenhum foi revisto depois. Não é erro de nenhum ciclo isolado, é dívida acumulada. Padronizar é barato e some com uma variável de ruído em qualquer teste futuro de CTA. **É mudança de copy visível: exige o rito de aprovação do dono.**


---

## Nota de correção, 2026-09-08

**Um achado deste relatório estava errado e é retirado: a garantia da `/transcricao-de-audio`.**

O que eu afirmei: que a garantia de 30 dias não aparecia na página, com severidade alta e prioridade 1 no plano de ação.

O que é verdade: a página tem **seção dedicada**, com o H2 "Garantia de Qualidade da Transcrição de Áudio", mais o texto "Garantia de 30 dias: se encontrar erro factual" e a linha "Garantia: 30 dias para correções sem custo".

Causa do erro: a verificação leu `document.body.innerText` procurando a string exata "Garantia de 30 dias", e o trecho estava em bloco recolhido no momento da medição. **Falha do método, não da página.** Refiz a checagem sobre o HTML servido, que é a fonte certa para presença de conteúdo.

**O que muda:** a `/transcricao-de-audio` perde o item de prioridade 1 e passa a ter "prova social na dobra" como primeiro. A nota da página não muda: 70 continua válida, porque já estava dominada pela ausência de prova na dobra e pela falta de visual no hero.

**O que continua valendo:** na `/degravacao-judicial` a garantia realmente **não existe**, verificado agora sobre o HTML. O achado dela está mantido e continua sendo parte do bloco de prova social que aquela página inteira não tem.

Na `/legendagem` existe "garantia de qualidade" sem menção aos 30 dias. Como a página está congelada, fica só como registro.
