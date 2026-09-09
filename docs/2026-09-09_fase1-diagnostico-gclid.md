# Fase 1 do Plano de Transição de Sinal: diagnóstico de GCLID

Diagnóstico read-only executado em 2026-09-09. Nenhuma alteração de código.
Aprovado pelo orquestrador no mesmo dia. Escopo: mapear se e como capturar o
`gclid` na chegada, persistir por 90 dias e entregar ao Pipedrive junto do lead
do `/budget`.

**Estado da frente:** Prompt 2 RETIDO. Depende de três confirmações do dono,
listadas em "Retenções" no fim deste documento.

---

## Desfecho

O caminho é viável e mais curto do que parecia, porque metade da infraestrutura
já existe. O `/budget` já detecta `gclid` hoje (`budget/assets/js/tracking.js:73`),
mas descarta o valor: usa só para rotular `utm_source` como "Google".

O bloqueio real não está no front. Está em três pontos:

1. A captura só acontece dentro do iframe, que só carrega quando o usuário abre
   o modal. O `gclid` morre se ele navegar antes.
2. A persistência atual é cookie de sessão, não 90 dias.
3. O campo no payload depende de `api.audiotext.com.br`, que não está neste
   repositório.

**Parada condicional não disparada.** O desenho mínimo não exige tocar GTM, CSP
nem `vercel.json`. Exige uma decisão do dono sobre a política de cookies e uma
mudança no backend.

---

## 1. Entrada: onde o tráfego pago chega e o que roda em todas as páginas

Landings de campanha: `transcricao-de-audio.html` (TN), `degravacao.html` (DN),
`index.html` (marca). São páginas estáticas independentes.

**Não existe layout nem partial comum.** Cada HTML é autocontido. O que funciona
como global é uma linha de `<script defer>` repetida página a página:

| Script | Cobertura | Evidência |
|---|---|---|
| `/assets/js/cookieConsent.js` | 15 de 17 páginas (todas as públicas) | `index.html:12`, `transcricao-de-audio.html:35`, `degravacao.html:11`, `legendagem.html:11` |
| `/components/site-notices/notices.js` | 15 páginas | `index.html:13` |
| `/assets/js/gtm-bridge.js` | 10 páginas (só as que têm modal) | `index.html:16`; ausente em `legendagem.html`, `transcricao-automatica.html`, `transcricao-de-audio-por-ia.html` |

**Nenhum desses scripts lê a query string hoje.** O grep por
`gclid|gbraid|wbraid|URLSearchParams|location.search` em todo o repositório
retorna apenas `budget/assets/js/tracking.js` (dentro do iframe) e as 9 linhas
`iframe.src = '/budget/' + window.location.search`. Fora do iframe, a página pai
não captura nada.

**Ponto de captura recomendado:** arquivo novo `/assets/js/click-id.js`, com a
linha adicionada nas mesmas 15 páginas. O `cookieConsent.js` é o único arquivo
presente em todas, mas é território selado (a ordem consent antes de `gtm.js` é
invariante do CLAUDE.md), então não se toca nele.

**Ressalva de cobertura:** o `gclid` só viaja para o iframe nas 9 páginas que têm
o modal. `legendagem.html`, `transcricao-automatica.html` e
`transcricao-de-audio-por-ia.html` não têm iframe nenhum.

---

## 2. Iframe do /budget: mesma origem, e as duas vias estão abertas

**É same-origin, não é terceiro.** `iframe.src = '/budget/' + window.location.search`
em `transcricao-de-audio.html:2746`, `degravacao.html:1798`, `index.html:2923` e
mais 6 páginas. Documento e pai rodam em `https://www.audiotext.com.br`.

Existe um `budget.audiotext.com.br` que responde 200, mas é outra aplicação,
legada: serve `<title>Audiotext Orçamento</title>` e carrega reCAPTCHA, enquanto
o `/budget` do site serve `<title>Orçamento Audiotext</title>` e os três scripts
deste repositório. O CSP ainda lista o subdomínio em `frame-src` (`vercel.json`,
header `/(.*)`), resíduo sem uso no funil atual.

**Via (a), query string propaga.** Confirmado em produção com User-Agent de
navegador:

```
GET /budget/?gclid=TESTE123&utm_source=teste
  308 -> Location: /budget?gclid=TESTE123&utm_source=teste
  final: /budget?gclid=TESTE123&utm_source=teste  HTTP 200
```

O `trailingSlash: false` gera um 308 e a query sobrevive intacta. Confirma a §17
do log do Ads pelo código e pela rede.

**Via (b), cookies e localStorage do pai são legíveis.** Sim, e já está em uso em
produção: o `tracking.js` grava `document.cookie` com `path=/` de dentro do
iframe (`budget/assets/js/api.js:71`), e o `app.js` lê esse mesmo cookie depois
(`budget/assets/js/app.js:497`). Mesma origem, mesmo jar. O `localStorage` também
é compartilhado (`budget/assets/js/app.js:274`).

**Qual via é viável: as duas, e o desenho precisa das duas.** Não é escolha, é
redundância necessária:

- **Query string** é a única via que funciona no primeiro clique, quando o cookie
  ainda não existe.
- **Cookie do pai** é a única via que funciona quando o visitante chega pelo
  anúncio, navega para outra página (perdendo `?gclid=` da URL) e só então abre o
  modal. Hoje esse caso perde o `gclid` inteiro.

---

## 3. Payload do lead: onde entra, e o campo livre não existe no front

O lead nasce em dois PATCH para a mesma API:

| Etapa | Onde | Campos enviados hoje |
|---|---|---|
| Step 1, projeto | `budget/assets/js/app.js:550-562` | `serviceCode`, `participantsAmount`, `amount`, `finalityCode`, `languageCode`, `sessionCode`, `_csrf` |
| Step 2, dados pessoais (o lead) | `budget/assets/js/app.js:622-634` | `username`, `email`, `phone`, `company`, `howDidMeetUs`, `observation`, `isWhatsApp`, `sessionCode`, `_csrf` |

Endpoint: `AT_API_BASE = window.location.origin + "/api/v1/"`
(`budget/assets/js/api.js:4`), com rewrite em `vercel.json:85`:

```json
{ "source": "/api/:path*", "destination": "https://api.audiotext.com.br/:path*" }
```

**Os UTMs não viajam no PATCH.** Entram no GET inicial
(`budget/assets/js/api.js:104-113`), lidos do cookie `audiotext-budget-tracking`
e enviados como `utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent`.
A associação campanha/lead acontece no servidor, na criação da sessão. Confirmado
na rede: o GET devolve `Set-Cookie: audiotext-budget-session-values=... HttpOnly`,
ou seja, o backend guarda os valores da sessão do lado dele.

**Existe campo livre? No front, não.** Os payloads são objetos literais fixos. E o
contrato do endpoint é do backend, que não está neste repositório: não há pasta
`api/` nem `functions/`, e `grep -i pipedrive` no repositório inteiro retorna
zero. A integração com o Pipedrive vive em `api.audiotext.com.br`.

**Consequência prática:** o front consegue enviar `gclid` no dia seguinte à
decisão. Se o backend ignorar o parâmetro desconhecido, o valor se perde
silenciosamente. É a dependência crítica de toda a Fase 1.

Detalhe que ajuda: `credentials: "omit"` nos três verbos
(`budget/assets/js/api.js:16`, `29`, `45`). O app não depende de cookie de
servidor, a identidade viaja explícita no corpo (`sessionCode` mais `_csrf`). Um
parâmetro a mais entra por caminho já trilhado, sem risco de sessão.

---

## 4. Consent: o nó é jurídico, não técnico

Configuração atual (`assets/js/cookieConsent.js:29-41`):

```js
gtag('consent', 'default', {
  'ad_storage': 'denied',  'ad_user_data': 'denied',
  'ad_personalization': 'denied', 'analytics_storage': 'denied',
  'functionality_storage': 'granted', 'security_storage': 'granted',
  'wait_for_update': 500
});
gtag('set', 'url_passthrough', true);
gtag('set', 'ads_data_redaction', true);
```

**Tecnicamente, o consent mode não bloqueia nada do desenho.** Ele governa tags
do GTM (`GTM-K8PJKT6`, injetado em `assets/js/cookieConsent.js:75`). Um cookie
1st-party gravado por script próprio está fora do alcance do `gtag('consent')`. O
`gclid` seria gravado antes do consentimento, no primeiro paint, e o desenho
funcionaria.

**Fator a favor, já ativo:** `url_passthrough: true` faz o Google anexar o `gclid`
aos links internos quando `ad_storage` está negado. Mitiga parcialmente a perda em
navegação interna, com a ressalva de que depende de o GTM ter carregado e de o
clique ser em link processado pela tag.

**O problema é o texto da política.** `legal.html:578` declara ao usuário:

> "Cookies de marketing (com seu consentimento): usados pelo Google Ads e Meta
> Pixel para medir campanhas publicitárias e veicular anúncios. Só ligam se você
> aceitar no banner."

Gravar um identificador de clique de anúncio antes do aceite é finalidade de
mensuração de campanha publicitária. Não está coberto por "essenciais" e
contradiz a frase acima. `legal.html:385` reforça: "identificadores online
(cookies), conforme sua escolha no banner de cookies".

**Três saídas, decisão do dono:**

| Opção | Efeito na cobertura | Custo |
|---|---|---|
| **A. Gravar sempre, ajustar a política** | Cobertura máxima. Captura 100% dos cliques pagos | Exige revisar `legal.html` (copy visível, aprovação do dono) e assumir a leitura de que atribuição própria é interesse legítimo |
| **B. Gravar só após aceite de marketing** | Perde todo visitante que ignora ou rejeita o banner. Na prática, perde a maioria | Zero risco jurídico. Sinal fica parcial e enviesado |
| **C. Gravar sempre, sem cookie: só `sessionStorage` mais query** | Não persiste 90 dias. Só resolve a sessão atual | Menor exposição, mas não entrega o objetivo do plano |

Leitura técnica do CC: **A** é o que atende o objetivo, e o ajuste de política é
pequeno e honesto. Rascunho da copy na seção "Rascunho da opção A" deste
documento, não aplicado e não aprovado.

---

## 5. Legendagem: o gclid tem como viajar, por duas vias

O funil é `abrirFormLegendagem()` e depois `enviarOrcamentoLegendagem()`
(`legendagem.html:2168`), sem `/budget` e sem iframe. O envio monta uma mensagem
e abre o WhatsApp:

```js
msg += '• Formato: ' + formato + '\n';                       // linha 2215
window.open('https://api.whatsapp.com/send?phone=5541997990622&text='
            + encodeURIComponent(msg), '_blank');            // linha 2225
```

**Via 1, mensagem pré-preenchida.** Uma linha a mais no bloco 2209-2218 carrega o
`gclid` até o atendente. Tecnicamente trivial. Porém é texto que o cliente lê,
então é copy visível, exige aprovação do dono, e um `gclid` cru no meio do
orçamento é ruído para o cliente. Se for por aqui, o formato precisa ser discreto.

**Via 2, dataLayer.** O push já existe e já carrega campos customizados
(`legendagem.html:2234-2246`, com `leg_formato`, `leg_estimativa`,
`leg_duracao`). Adicionar `gclid` ali é invisível ao usuário, não é copy, e
alimenta o Google Ads pela tag. Mas não chega ao Pipedrive, porque esse funil não
cria lead por API: o lead nasce quando o atendente registra a conversa.

**Ressalvas.** A `/legendagem` está congelada, e a página não carrega
`gtm-bridge.js` nem teria de onde capturar o `gclid` hoje. Mapeado, não
implementado.

---

## 6. Proposta de implementação mínima

### Desenho

```
1. CAPTURA    /assets/js/click-id.js, novo, nas 15 páginas públicas
              lê gclid, gbraid, wbraid da query no primeiro paint
              grava cookie at_click_id, path=/, 90 dias, SameSite=Lax
              regra de sobrescrita: last-click ganha (padrão do Google Ads)

2. TRAVESSIA  já funciona: iframe.src = '/budget/' + window.location.search
              mais fallback: tracking.js lê o cookie do pai quando a query
              vier vazia

3. PAYLOAD    tracking.js passa a preservar o valor (hoje descarta, linha 73)
              api.js:104 acrescenta gclid aos params do GET
              app.js:622 acrescenta gclid ao payload do lead (redundância)

4. BACKEND    api.audiotext.com.br aceita o campo e grava no Pipedrive
              FORA DESTE REPOSITÓRIO
```

### Arquivos a tocar

| Arquivo | Mudança | Copy visível? |
|---|---|---|
| `assets/js/click-id.js` | novo, cerca de 40 linhas | não |
| 15 HTMLs públicos | 1 linha de `<script defer>` cada | não |
| `budget/assets/js/tracking.js` | preservar o valor em `buildUtms`, linhas 72-77 | não |
| `budget/assets/js/api.js` | `gclid` nos params do GET, linha 104 | não |
| `budget/assets/js/app.js` | `gclid` no `payloadPersonal`, linha 622 | não |
| `legal.html` | política de cookies, só se opção A | **sim, exige aprovação do dono** |

Não toca: `cookieConsent.js`, `gtm-bridge.js`, `vercel.json`, CSP, `gtm.js`. O
`connect-src` já libera `api.audiotext.com.br`.

### Riscos

1. **Backend silencioso.** Se a API descartar o parâmetro, o front funciona e o
   Pipedrive não recebe nada, sem erro visível. Mitigação: validar o contrato
   antes de escrever qualquer linha.
2. **Cookie de UTM de sessão.** Ver "Conserto candidato pós-gate" abaixo.
3. **Cobertura desigual.** Três páginas não têm o modal. Se receberem tráfego
   pago, capturam o `gclid` mas não têm por onde entregá-lo.
4. **`gbraid` e `wbraid`.** Campanhas em iOS não mandam `gclid`. Capturar os três
   desde o início custa a mesma linha.
5. **Jurídico**, seção 4.

### Esforço

| Frente | Estimativa |
|---|---|
| Front completo, itens 1 a 3 do desenho | baixo, uma sessão, uma branch |
| Ajuste da política, se A | baixo, gargalo é a aprovação do dono |
| Backend e Pipedrive | fora do alcance do CC, não estimado |
| Validação ponta a ponta em preview | médio, exige lead de teste real chegando ao Pipedrive |

O front é a parte fácil. O caminho crítico é o backend.

---

## CONSERTO CANDIDATO PÓS-GATE: cookie de UTM sem prazo

**Classificação: fora do escopo da Fase 1 por decisão do orquestrador.** Não
alterar comportamento de atribuição durante o Cenário 1. Entra na fila para
depois do gate.

**O achado.** O cookie que carrega os UTMs até o lead é gravado sem prazo de
expiração, ou seja, é cookie de sessão: morre quando o visitante fecha o
navegador.

Evidência, dois arquivos:

`budget/assets/js/tracking.js:117`, a chamada omite o terceiro argumento:

```js
app.cookies.set(app.tracking.cookieKey, cookieValue);
```

`budget/assets/js/api.js:64-72`, a função só monta `expires` se `days` vier:

```js
set: function (name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie =
    name + "=" + encodeURIComponent(value || "") + expires + "; path=/";
},
```

Para contraste, no mesmo arquivo o cookie de sessão do orçamento recebe prazo
explícito de 7 dias (`budget/assets/js/api.js:116`):

```js
app.cookies.set("audiotext-budget-session", data.sessionCode, 7);
```

**Efeito provável.** Visitante que chega pelo anúncio, fecha o navegador e volta
depois para fechar o orçamento entra como `Direct`. A atribuição de qualquer
campanha, paga ou orgânica, subestima o que traz lead com ciclo maior que uma
sessão. Também afeta o `howDidMeetUs` de fallback
(`budget/assets/js/app.js:496-513`), que lê esse mesmo cookie.

**Por que não corrigir agora.** Corrigir muda o comportamento de atribuição no
meio da janela de medição do Cenário 1: leads que hoje entram como `Direct`
passariam a entrar com a campanha, e a série histórica quebraria no meio. A
correção é de uma linha, e o custo de esperar é baixo perto do custo de
contaminar a leitura.

**Quando executar.** Depois do gate do Cenário 1, idealmente no mesmo ciclo em
que o `gclid` entrar, para que a mudança de atribuição tenha uma data única no
log.

---

## Rascunho da opção A: texto novo da seção de cookies

**NÃO APLICADO. NÃO APROVADO. NÃO COMMITADO EM PÁGINA.** Rascunho preparado a
pedido do orquestrador para a hipótese de o dono escolher a opção A. Entra em
`legal.html` só depois de aprovação explícita do dono sobre o texto exato,
conforme a REGRA SELADA de aprovação de copy.

Premissas do texto: cookie próprio, 1st-party, sem compartilhamento com
terceiros antes do aceite, sem travessão.

### Peça 1: nova subseção 3.4, depois da 3.3 (`legal.html:645`)

```html
<h5>3.4) Cookie próprio de atribuição de campanha</h5>
<p>Quando você chega ao nosso site por um anúncio, o endereço da página traz um
código que identifica o anúncio clicado. Guardamos esse código em um cookie
próprio, gravado pelo nosso site e lido somente por ele.</p>
<p>Usamos esse código para uma única finalidade: saber quais anúncios geram
pedidos de orçamento de verdade, e assim parar de investir nos que não geram.
O código identifica o anúncio, não identifica você.</p>
<ul>
  <li><strong>O que é guardado:</strong> apenas o código do anúncio clicado.</li>
  <li><strong>Por quanto tempo:</strong> 90 dias.</li>
  <li><strong>Com quem é compartilhado:</strong> com ninguém, enquanto você não
  aceitar os cookies de marketing. O código fica no seu navegador e só é enviado
  aos nossos próprios sistemas quando você envia um pedido de orçamento, junto
  com os dados que você mesmo preencheu no formulário.</li>
  <li><strong>Se você aceitar os cookies de marketing:</strong> o código passa a
  ser usado também pelas ferramentas descritas na Seção 3.3, e valem as regras
  daquela seção, inclusive quanto à transferência internacional de dados.</li>
</ul>
<p>Você pode apagar esse cookie a qualquer momento pelas configurações do seu
navegador, sem qualquer prejuízo ao funcionamento do site.</p>
```

### Peça 2: item novo no Resumo Executivo, depois de `legal.html:578`

```html
<li>🟢 <strong>Cookie próprio de atribuição (sempre ativo):</strong> quando você
chega por um anúncio, guardamos o código do anúncio por 90 dias para saber quais
campanhas funcionam. É um cookie nosso, lido só por nós, e não é compartilhado
com outras empresas enquanto você não aceitar os cookies de marketing.</li>
```

### Notas de aplicação, se aprovado

1. A subseção 3.4 usa a mesma marcação das 3.1 a 3.3 (`h5`, `p`, `ul`), então
   não cria classe nova e não há risco de classe-fantasma.
2. O item do Resumo usa o círculo verde e não o amarelo de propósito: sinaliza
   que é sempre ativo, na mesma convenção que a página já aplica aos essenciais
   em `legal.html:576`.
3. O rascunho evita a palavra "essencial" para o cookie de atribuição. Chamá-lo
   de essencial seria esticar a categoria; o texto assume a natureza dele e
   explica a finalidade, que é a defesa mais sólida.
4. Se o dono escolher B ou C, este rascunho é descartado e nada muda em
   `legal.html`.

---

## Achado fora de escopo, reportado e não corrigido

Há travessões em copy visível da `legal.html`, entre outros em
`legal.html:608-610`, `legal.html:628` e `legal.html:664`. Já estão cobertos pela
"Varredura de travessões" da fila do CLAUDE.md. Não corrigidos aqui, por estarem
fora do escopo deste bloco.

---

## Retenções

Prompt 2 da Fase 1 fica retido até o dono confirmar:

| # | O que | Bloqueia |
|---|---|---|
| a | Contrato da `api.audiotext.com.br` para o campo `gclid`: o GET `/v1/budget` e o PATCH aceitam campo novo, e com qual nome | Tudo. É o caminho crítico |
| b | Campo customizado no Pipedrive, criado, e a chave informada | A entrega final do sinal |
| c | Decisão de consent: opção A, B ou C da seção 4 | O desenho da captura e o texto da `legal.html` |

Com (a) e (c) respondidos, o front sai em uma sessão. Sem (a), qualquer
implementação é envio para o vazio.
