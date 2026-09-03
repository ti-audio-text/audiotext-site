// /budget/v2 — variante "uma pergunta por tela" (one-thing-per-page).
// Copia independente do controle: nada aqui e compartilhado com /budget.
//
// Fluxo: servico > minutos > finalidade > idioma > contato > resultado.
// A tela de finalidade e pulada na degravacao (ja e juridica por definicao).
// Duas chamadas de API, como no controle: PATCH dos dados da gravacao ao fim
// do bloco de servico, PATCH dos dados pessoais no submit final.

(function () {
  /* ====== ORIGEM DAS MENSAGENS AO PAI ======
     O controle usa targetOrigin fixo em www, o que faz a mensagem ser
     descartada no apex e em qualquer preview. Aqui usamos a origem real:
     o iframe e sempre same-origin com o pai, e o listener do pai ja exige
     e.origin === location.origin. */
  var PARENT_ORIGIN = window.location.origin;
  var VARIANT = "v2";

  /* ====== DOM ====== */
  var elLoader = document.getElementById("loader");
  var elErrorBox = document.getElementById("error-box");
  var elNav = document.getElementById("v2-nav");
  var elVoltar = document.getElementById("btn-voltar");
  var elProgressFill = document.getElementById("v2-progress-fill");
  var elProgressLabel = document.getElementById("v2-progress-label");
  var elProgress = document.getElementById("v2-progress");

  var elSalvando = document.getElementById("v2-salvando");
  var elFalha = document.getElementById("v2-falha");
  var elFalhaTexto = document.getElementById("v2-falha-texto");
  var elBtnRetentar = document.getElementById("btn-retentar");
  var elBtnGerar = document.getElementById("btn-gerar");

  var elResultsText = document.getElementById("results-text");
  var elResultsTable = document.getElementById("results-table");
  var elSpinner = document.getElementById("spinner-load");
  var elLinkReturn = document.getElementById("link-return");
  var elSpamWarning = document.getElementById("spam-warning");

  var uf = {
    username: document.getElementById("username"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    company: document.getElementById("company"),
    howDidMeetUs: document.getElementById("howDidMeetUs"),
    observation: document.getElementById("observation"),
  };
  var elAmount = document.getElementById("amount");

  /* ====== FLUXO ====== */
  var FLOW = ["servico", "minutos", "finalidade", "idioma", "contato", "resultado"];

  var state = {
    serviceCodeRaw: "",
    serviceLabel: "",
    amount: 0,
    finalityCode: "",
    languageCode: "",
  };

  var sessionCode = "";
  var csrfToken = "";
  var telaAtual = "servico";
  var pilhaVoltar = [];

  // PATCH dos dados da gravacao: idle | pending | ok | error
  var patch1 = { estado: "idle", tentativas: 0, sujo: true, ultimoErro: null };

  function ehDegravacao() {
    return state.serviceCodeRaw === "degravacao";
  }

  function telasVisiveis() {
    return FLOW.filter(function (t) {
      if (t === "resultado") return false;
      if (t === "finalidade" && ehDegravacao()) return false;
      return true;
    });
  }

  function proximaTela(atual) {
    var idx = FLOW.indexOf(atual);
    for (var i = idx + 1; i < FLOW.length; i++) {
      if (FLOW[i] === "finalidade" && ehDegravacao()) continue;
      return FLOW[i];
    }
    return null;
  }

  /* ====== MEDICAO ====== */
  // form_step_view vai direto ao dataLayer do pai (same-origin). O bridge
  // compartilhado nao ganhou handler novo de proposito: so o generate_lead
  // passa por ele, e por postMessage, exatamente como no controle.
  function pushPai(obj) {
    try {
      var w = window.parent;
      if (!w || w === window) return;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push(obj);
    } catch (e) {
      /* pai inacessivel: medicao secundaria e opcional, nao quebra o funil */
    }
  }

  function avisaPai(mensagem) {
    try {
      window.parent.postMessage(mensagem, PARENT_ORIGIN);
    } catch (e) {
      console.warn("[budget v2] postMessage falhou", e);
    }
  }

  var telasJaVistas = {};
  function registraStepView(tela) {
    if (telasJaVistas[tela]) return;
    telasJaVistas[tela] = true;
    var visiveis = telasVisiveis();
    pushPai({
      event: "form_step_view",
      form_name: "orcamento",
      form_variant: VARIANT,
      step_name: tela,
      step_number: visiveis.indexOf(tela) + 1,
      step_total: visiveis.length,
      page_location: window.location.href,
    });
  }

  /* ====== NAVEGACAO ====== */
  function mostraTela(tela, opts) {
    opts = opts || {};
    FLOW.forEach(function (t) {
      var el = document.getElementById("screen-" + t);
      if (el) el.classList.toggle("hidden", t !== tela);
    });
    telaAtual = tela;

    var ehResultado = tela === "resultado";
    elProgress.classList.toggle("hidden", ehResultado);
    elNav.classList.toggle("hidden", ehResultado || pilhaVoltar.length === 0);

    atualizaProgresso();
    mostraErroGlobal("");
    registraStepView(tela);

    if (!opts.semFoco) focoInicial(tela);
    if (tela === "contato") aoEntrarNoContato();
  }

  function focoInicial(tela) {
    var alvo = null;
    if (tela === "minutos") alvo = elAmount;
    else if (tela === "contato") alvo = uf.username;
    else {
      var container = document.getElementById("screen-" + tela);
      alvo = container ? container.querySelector(".v2-option") : null;
    }
    if (alvo) {
      try {
        alvo.focus({ preventScroll: true });
      } catch (e) {
        alvo.focus();
      }
    }
  }

  function vaiPara(tela) {
    if (!tela) return;
    pilhaVoltar.push(telaAtual);
    mostraTela(tela);
  }

  function voltar() {
    if (!pilhaVoltar.length) return;
    var anterior = pilhaVoltar.pop();
    mostraTela(anterior);
  }

  elVoltar.addEventListener("click", voltar);

  function atualizaProgresso() {
    var visiveis = telasVisiveis();
    var total = visiveis.length;
    var pos = visiveis.indexOf(telaAtual);
    if (pos < 0) return;
    elProgressLabel.textContent = "Passo " + (pos + 1) + " de " + total;
    elProgressFill.style.width = Math.round(((pos + 1) / total) * 100) + "%";
  }

  /* ====== HELPERS DE UI ====== */
  function setLoading(carregando) {
    elLoader.classList.toggle("hidden", !carregando);
  }

  function mostraErroGlobal(msg) {
    if (!msg) {
      elErrorBox.classList.add("hidden");
      elErrorBox.textContent = "";
    } else {
      elErrorBox.classList.remove("hidden");
      elErrorBox.textContent = msg;
    }
  }

  function mostraErroCampo(id, msg) {
    var el = document.getElementById("err-" + id);
    var campo = document.getElementById(id);
    if (!el) return;
    if (msg) {
      el.textContent = msg;
      el.classList.remove("hidden");
      if (campo) {
        campo.classList.remove("valid");
        campo.classList.add("invalid");
      }
    } else {
      el.textContent = "";
      el.classList.add("hidden");
      if (campo) {
        campo.classList.remove("invalid");
        campo.classList.add("valid");
      }
    }
  }

  function limpaErrosCampo(ids) {
    ids.forEach(function (id) {
      var el = document.getElementById("err-" + id);
      if (el) {
        el.textContent = "";
        el.classList.add("hidden");
      }
      var campo = document.getElementById(id);
      if (campo) campo.classList.remove("invalid", "valid");
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ====== OPCOES (cartoes de resposta) ====== */
  function renderOpcoes(containerId, itens, aoEscolher) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    itens.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "v2-option";
      btn.setAttribute("data-value", item.value);
      var titulo = document.createElement("span");
      titulo.className = "v2-option-titulo";
      titulo.textContent = item.label;
      btn.appendChild(titulo);
      if (item.desc) {
        var desc = document.createElement("span");
        desc.className = "v2-option-desc";
        desc.textContent = item.desc;
        btn.appendChild(desc);
      }
      btn.addEventListener("click", function () {
        var irmaos = container.querySelectorAll(".v2-option");
        for (var i = 0; i < irmaos.length; i++) irmaos[i].classList.remove("selecionada");
        btn.classList.add("selecionada");
        aoEscolher(item);
      });
      container.appendChild(btn);
    });
  }

  function marcaSelecionada(containerId, valor) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var opcoes = container.querySelectorAll(".v2-option");
    for (var i = 0; i < opcoes.length; i++) {
      opcoes[i].classList.toggle(
        "selecionada",
        opcoes[i].getAttribute("data-value") === String(valor)
      );
    }
  }

  /* ====== MASCARA DE TELEFONE ====== */
  function formatPhone(value) {
    if (!value) return "";
    var digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return "(" + digits;
    if (digits.length <= 6) return "(" + digits.substring(0, 2) + ") " + digits.substring(2);
    if (digits.length <= 10)
      return "(" + digits.substring(0, 2) + ") " + digits.substring(2, 6) + "-" + digits.substring(6);
    return "(" + digits.substring(0, 2) + ") " + digits.substring(2, 7) + "-" + digits.substring(7, 11);
  }

  uf.phone.addEventListener("input", function () {
    var pos = this.selectionStart;
    var antes = this.value.length;
    this.value = formatPhone(this.value);
    var depois = this.value.length;
    var nova = pos + (depois - antes);
    try {
      this.setSelectionRange(nova, nova);
    } catch (e) {
      /* input tel em alguns browsers nao aceita setSelectionRange */
    }
  });

  /* ====== SESSAO ====== */
  var STORAGE_KEY = "at-budget-session";

  function salvaSessao() {
    if (!sessionCode) return;
    try {
      localStorage.setItem(STORAGE_KEY, sessionCode);
    } catch (e) {
      /* storage indisponivel */
    }
  }

  function sessaoSalva() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function sessaoAtual() {
    return sessionCode || app.cookies.get("audiotext-budget-session") || sessaoSalva();
  }

  /* ====== CARGA DE DADOS ====== */
  var FALLBACK_FINALIDADES = [
    { code: "juridica", name: "Jurídica" },
    { code: "academica", name: "Acadêmica" },
    { code: "elaboracao-de-ata", name: "Ata de assembleia ou reunião" },
    { code: "relatorio", name: "Relatório" },
    { code: "livro", name: "Livro" },
    { code: "legendagem", name: "Legendagem" },
    { code: "outro", name: "Outro" },
  ];

  var FALLBACK_IDIOMAS = [
    { code: "pt-BR", name: "Português" },
    { code: "en-US", name: "Inglês" },
    { code: "es-ES", name: "Espanhol" },
    { code: "other", name: "Outro" },
  ];

  var FALLBACK_CANAIS = ["Já sou cliente", "Indicação", "Google", "Outro"];

  async function carregaDadosEstaticos() {
    setLoading(true);
    var res = await Promise.allSettled([
      app.api.services.get(),
      app.api.finalities.get(),
      app.api.languages.get(),
      app.api.meetingChannels.get(),
    ]);
    setLoading(false);

    var servicos = res[0].status === "fulfilled" ? res[0].value : null;
    var finalidades = res[1].status === "fulfilled" ? res[1].value : null;
    var idiomas = res[2].status === "fulfilled" ? res[2].value : null;
    var canais = res[3].status === "fulfilled" ? res[3].value : null;

    // Servicos: API + degravacao hardcoded (mesma regra do controle)
    var itensServico = [];
    if (Array.isArray(servicos) && servicos.length) {
      servicos.forEach(function (s) {
        itensServico.push({ value: s.code, label: s.name });
      });
    } else {
      itensServico.push({ value: "transcricao", label: "Transcrição" });
    }
    itensServico.push({
      value: "degravacao",
      label: "Degravação (Transcrição Jurídica)",
      desc: "Ipsis litteris, com marcação de tempo",
    });

    renderOpcoes("opt-servico", itensServico, function (item) {
      var mudou = state.serviceCodeRaw !== item.value;
      state.serviceCodeRaw = item.value;
      state.serviceLabel = item.label;
      if (mudou) patch1.sujo = true;
      if (ehDegravacao()) state.finalityCode = "juridica";
      vaiPara(proximaTela("servico"));
    });

    var itensFinalidade = (Array.isArray(finalidades) && finalidades.length
      ? finalidades
      : FALLBACK_FINALIDADES
    ).map(function (f) {
      return { value: f.code, label: f.name };
    });

    renderOpcoes("opt-finalidade", itensFinalidade, function (item) {
      if (state.finalityCode !== item.value) patch1.sujo = true;
      state.finalityCode = item.value;
      vaiPara(proximaTela("finalidade"));
    });

    var itensIdioma = (Array.isArray(idiomas) && idiomas.length ? idiomas : FALLBACK_IDIOMAS).map(
      function (l) {
        return { value: l.code, label: l.name };
      }
    );

    renderOpcoes("opt-idioma", itensIdioma, function (item) {
      if (state.languageCode !== item.value) patch1.sujo = true;
      state.languageCode = item.value;
      // Avanco otimista: a tela de contato abre na hora, o PATCH corre atras.
      vaiPara(proximaTela("idioma"));
    });

    // Canais (opcional, dentro de "Adicionar detalhes")
    uf.howDidMeetUs.innerHTML = '<option value="">Como nos conheceu?</option>';
    var listaCanais =
      Array.isArray(canais) && canais.length ? canais : FALLBACK_CANAIS;
    listaCanais.forEach(function (m) {
      var opt = document.createElement("option");
      opt.value = typeof m === "string" ? m : m.code || m.name || m;
      opt.textContent = typeof m === "string" ? m : m.name || m;
      uf.howDidMeetUs.appendChild(opt);
    });
  }

  async function carregaSessao() {
    try {
      var data = await app.api.budget.get();
      if (!data) return;
      sessionCode = data.sessionCode || (data.budget && data.budget.sessionCode) || "";
      csrfToken = data.csrfToken || "";
      var budget = data.budget || data;
      // Retomada: so os dados pessoais, para nao pular perguntas do fluxo.
      if (budget) {
        uf.username.value = budget.username || "";
        uf.email.value = budget.email || "";
        uf.phone.value = budget.phone || "";
        uf.company.value = budget.company || "";
        if (budget.howDidMeetUs) uf.howDidMeetUs.value = budget.howDidMeetUs;
        uf.observation.value = budget.observation || "";
      }
      salvaSessao();
    } catch (e) {
      console.error("[budget v2] GET /budget falhou:", e.kind, e.message);
      // Sem sessao o PATCH vai falhar. A tela de contato trata e avisa.
    }
  }

  /* ====== TELA 2 — MINUTAGEM ====== */
  document.getElementById("form-minutos").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var valor = Number(elAmount.value);
    if (!valor || valor < 1 || isNaN(valor)) {
      mostraErroCampo("amount", "Informe a quantidade de minutos");
      elAmount.focus();
      return;
    }
    mostraErroCampo("amount", null);
    if (state.amount !== valor) patch1.sujo = true;
    state.amount = valor;
    vaiPara(proximaTela("minutos"));
  });

  /* ====== PATCH DOS DADOS DA GRAVACAO ====== */
  function payloadGravacao() {
    var raw = state.serviceCodeRaw;
    // A API nao conhece "degravacao": vira transcricao + finalidade juridica.
    var serviceCode = raw === "degravacao" ? "transcricao" : raw;
    var finalityCode = raw === "degravacao" ? "juridica" : state.finalityCode;
    return {
      serviceCode: serviceCode,
      participantsAmount: 1,
      amount: state.amount,
      finalityCode: finalityCode,
      languageCode: state.languageCode,
      sessionCode: sessaoAtual(),
      _csrf: csrfToken || null,
    };
  }

  var ESPERA_RETENTATIVA = [0, 1500, 4000];

  function mensagemDeFalha(err) {
    if (err && err.kind === "challenge") {
      return (
        "Uma verificação de segurança da rede bloqueou o envio. " +
        "Se você estiver em VPN ou rede corporativa, tente desligar a VPN ou usar outra rede. " +
        "Se preferir, fale com a gente no WhatsApp que fazemos seu orçamento na hora."
      );
    }
    if (err && err.kind === "network") {
      return "Não conseguimos falar com o servidor. Verifique sua conexão e toque em Tentar de novo.";
    }
    return "Não conseguimos salvar os dados da sua gravação. Toque em Tentar de novo.";
  }

  function pintaEstadoPatch1() {
    var pendente = patch1.estado === "pending";
    var falhou = patch1.estado === "error";
    elSalvando.classList.toggle("hidden", !pendente);
    elFalha.classList.toggle("hidden", !falhou);
    if (falhou) elFalhaTexto.textContent = mensagemDeFalha(patch1.ultimoErro);
    elBtnGerar.disabled = patch1.estado !== "ok";
  }

  async function enviaGravacao() {
    if (patch1.estado === "pending") return;
    patch1.estado = "pending";
    patch1.tentativas = 0;
    patch1.ultimoErro = null;
    pintaEstadoPatch1();

    for (var i = 0; i < ESPERA_RETENTATIVA.length; i++) {
      if (ESPERA_RETENTATIVA[i]) {
        await new Promise(function (r) {
          setTimeout(r, ESPERA_RETENTATIVA[i]);
        });
      }
      patch1.tentativas++;
      try {
        var res = await app.api.budget.patch(payloadGravacao());
        var budget = (res && res.budget) || res || {};
        sessionCode = budget.sessionCode || sessionCode;
        salvaSessao();
        patch1.estado = "ok";
        patch1.sujo = false;
        pintaEstadoPatch1();
        avisaPai({
          type: "budget_step1_complete",
          service: payloadGravacao().serviceCode,
        });
        return;
      } catch (e) {
        patch1.ultimoErro = e;
        console.error(
          "[budget v2] PATCH gravacao tentativa " + patch1.tentativas + ":",
          e.kind,
          e.message
        );
      }
    }
    // Esgotou as retentativas: agora sim o usuario ve.
    patch1.estado = "error";
    pintaEstadoPatch1();
  }

  function aoEntrarNoContato() {
    if (patch1.estado === "ok" && !patch1.sujo) {
      pintaEstadoPatch1();
      return;
    }
    enviaGravacao();
  }

  elBtnRetentar.addEventListener("click", function () {
    enviaGravacao();
  });

  /* ====== DETALHES OPCIONAIS ====== */
  var elDetalhes = document.getElementById("v2-detalhes");
  var elBtnDetalhes = document.getElementById("btn-detalhes");
  elBtnDetalhes.addEventListener("click", function () {
    var aberto = !elDetalhes.classList.contains("hidden");
    elDetalhes.classList.toggle("hidden", aberto);
    elBtnDetalhes.setAttribute("aria-expanded", String(!aberto));
    elBtnDetalhes.querySelector(".v2-detalhes-sinal").textContent = aberto ? "+" : "−";
    if (!aberto) uf.company.focus();
  });

  /* ====== FALLBACK DE howDidMeetUs (identico ao controle) ====== */
  function howDidMeetUsFallback() {
    var utms = app.cookies.get("audiotext-budget-tracking");
    if (utms) {
      var origem = (utms.split("|")[0] || "").toLowerCase();
      if (origem && origem !== "direct") {
        if (origem.indexOf("google") >= 0) return "Google";
        if (origem.indexOf("facebook") >= 0 || origem.indexOf("instagram") >= 0)
          return "Redes sociais";
        if (origem.indexOf("linkedin") >= 0) return "LinkedIn";
        return "Outro";
      }
    }
    return "Outro";
  }

  /* ====== TELA 5 — CONTATO + GERACAO ====== */
  document.getElementById("form-contato").addEventListener("submit", async function (ev) {
    ev.preventDefault();
    mostraErroGlobal("");
    limpaErrosCampo(["username", "email", "phone"]);

    var username = uf.username.value.trim();
    var email = uf.email.value.trim();
    var phone = uf.phone.value.trim();
    var erro = false;
    var primeiro = null;

    if (!username) {
      mostraErroCampo("username", "Nome completo é obrigatório");
      primeiro = primeiro || uf.username;
      erro = true;
    }
    if (!email) {
      mostraErroCampo("email", "E-mail é obrigatório");
      primeiro = primeiro || uf.email;
      erro = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      mostraErroCampo("email", "E-mail inválido");
      primeiro = primeiro || uf.email;
      erro = true;
    }
    if (!phone) {
      mostraErroCampo("phone", "Telefone é obrigatório");
      primeiro = primeiro || uf.phone;
      erro = true;
    }
    if (erro) {
      if (primeiro) primeiro.focus();
      return;
    }

    if (patch1.estado !== "ok") {
      pintaEstadoPatch1();
      return;
    }

    var payloadPessoal = {
      username: username,
      email: email,
      phone: phone,
      company: uf.company.value.trim() || null,
      howDidMeetUs: uf.howDidMeetUs.value || howDidMeetUsFallback(),
      observation: uf.observation.value || null,
      isWhatsApp: true,
      sessionCode: sessaoAtual(),
      _csrf: csrfToken || null,
    };

    try {
      setLoading(true);
      elBtnGerar.disabled = true;
      elResultsText.innerHTML = "";
      elResultsTable.innerHTML = "";

      var salvo = await app.api.budget.patch(payloadPessoal);
      var budgetSalvo = (salvo && salvo.budget) || salvo || {};
      sessionCode = budgetSalvo.sessionCode || sessionCode;
      salvaSessao();

      vaiPara("resultado");
      elSpinner.classList.remove("hidden");

      // Conversao: mesmo formato do controle, mais o rotulo da variante.
      avisaPai({
        type: "budget_submitted",
        email: email,
        phone: phone,
        name: username,
        service: budgetSalvo.serviceCode || payloadGravacao().serviceCode || "",
        variant: VARIANT,
      });
      // Legado, igual ao controle (o bridge deduplica).
      avisaPai("gerarPropostas");

      var geracao = await app.api.proposals.generate({
        budget: budgetSalvo,
        sessionCode: sessionCode,
        csrfToken: csrfToken,
      });

      if (geracao && geracao.hasErrors) {
        elSpinner.classList.add("hidden");
        console.error(geracao.errors);
        mostraErroGlobal("Ocorreram erros ao gerar propostas.");
        return;
      }

      var propostas = await app.api.proposals.get(sessionCode);
      elSpinner.classList.add("hidden");
      renderResultados(propostas);
    } catch (e) {
      console.error("[budget v2] geracao falhou:", e.kind, e.message);
      elSpinner.classList.add("hidden");
      mostraErroGlobal(
        e && e.kind === "challenge"
          ? mensagemDeFalha(e)
          : "Erro ao gerar propostas. Tente novamente."
      );
    } finally {
      setLoading(false);
      elBtnGerar.disabled = patch1.estado !== "ok";
    }
  });

  /* ====== RESULTADO (identico ao controle) ====== */
  function parseInstallment(installmentValue, installmentPrice) {
    if (!installmentPrice) return null;
    var count = "3";
    if (installmentValue) {
      var match = installmentValue.match(/(\d+)x/i);
      if (match) count = match[1];
    }
    return { count: count, totalPrice: installmentPrice };
  }

  function sortProposals(proposals) {
    var planOrder = { INSTANT: 0, FAST: 1, FLEX: 2 };
    return proposals.slice().sort(function (a, b) {
      var oa = planOrder[a.plan] !== undefined ? planOrder[a.plan] : 99;
      var ob = planOrder[b.plan] !== undefined ? planOrder[b.plan] : 99;
      return oa - ob;
    });
  }

  function renderResultados(budget) {
    if (!budget) return;

    if (budget.text) {
      elResultsText.innerHTML =
        "<p>" +
        budget.text.replace(
          "[whatsAppIcon]",
          '<img class="wpp-icon" src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />'
        ) +
        "</p>";
    }

    var proposals = (budget.proposals || []).filter(function (p) {
      return p.plan !== "EXPRESS";
    });

    if (!proposals.length) {
      elLinkReturn.style.display = "block";
      return;
    }

    proposals = sortProposals(proposals);

    var wrapper = document.createElement("div");
    wrapper.className = "proposal-cards-wrapper";

    proposals.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "proposal-card";

      var isFast = (p.plan || "").toUpperCase() === "FAST";
      if (isFast) card.classList.add("recommended");
      card.classList.add("plan-" + (p.plan || "").toLowerCase());

      var inst = parseInstallment(p.installmentValue, p.installmentPrice);
      var html = "";

      if (isFast) html += '<span class="proposal-badge">⭐ Melhor custo-benefício</span>';
      html += '<div class="proposal-card-plan">' + escapeHtml(p.plan) + "</div>";
      html +=
        '<div class="proposal-card-deadline"><strong>Prazo:</strong> ' +
        escapeHtml(String(p.deadline || "")) +
        " dias úteis</div>";
      html += '<div class="proposal-card-divider"></div>';
      html +=
        '<div class="proposal-card-price">' +
        escapeHtml(p.cashPirce || p.cashPrice || "") +
        "</div>";
      html += '<div class="proposal-card-price-label">à vista</div>';
      if (inst) {
        html +=
          '<div class="proposal-card-installment">ou ' +
          escapeHtml(inst.totalPrice) +
          " em " +
          escapeHtml(inst.count) +
          "x</div>";
      }
      html += '<button class="proposal-card-btn" type="button">Enviar arquivos</button>';

      card.innerHTML = html;
      card.querySelector(".proposal-card-btn").addEventListener("click", function () {
        avisaPai("openTransfer");
      });
      wrapper.appendChild(card);
    });

    elResultsTable.innerHTML = "";
    elResultsTable.appendChild(wrapper);

    if (window.innerWidth < 768) {
      wrapper.style.scrollBehavior = "auto";
      wrapper.style.scrollSnapType = "none";
      wrapper.scrollLeft = 0;
      requestAnimationFrame(function () {
        wrapper.scrollLeft = 0;
        requestAnimationFrame(function () {
          wrapper.style.scrollSnapType = "x mandatory";
          wrapper.style.scrollBehavior = "";
        });
      });
    }

    elLinkReturn.style.display = "block";
    if (elSpamWarning) elSpamWarning.style.display = "";
  }

  /* ====== FECHAR E RECOMECAR ====== */
  document.getElementById("btn-close").addEventListener("click", function () {
    avisaPai("closePopUpAppReact");
  });

  document.getElementById("btn-new-budget").addEventListener("click", function () {
    pilhaVoltar = [];
    telasJaVistas = {};
    patch1 = { estado: "idle", tentativas: 0, sujo: true, ultimoErro: null };
    state.serviceCodeRaw = "";
    state.amount = 0;
    state.finalityCode = "";
    state.languageCode = "";
    elAmount.value = "";
    marcaSelecionada("opt-servico", "");
    marcaSelecionada("opt-finalidade", "");
    marcaSelecionada("opt-idioma", "");
    pintaEstadoPatch1();
    mostraTela("servico");
  });

  /* ====== ALTURA DO IFRAME ======
     O pai limita a 90vh (fitBudgetIframe). Aqui so informamos a altura real;
     como cada tela e curta, na pratica o limite raramente entra em acao. */
  function avisaAltura() {
    var alvo = document.querySelector(".App .container");
    if (!alvo) return;
    avisaPai({ type: "budgetResize", height: alvo.scrollHeight });
  }

  window.addEventListener("resize", avisaAltura);
  new MutationObserver(avisaAltura).observe(document.querySelector(".App .container"), {
    childList: true,
    subtree: true,
    attributes: true,
  });

  /* ====== INIT ====== */
  (async function init() {
    try {
      app.tracking.run();
    } catch (e) {
      console.warn("[budget v2] tracking falhou", e);
    }

    pintaEstadoPatch1();
    mostraTela("servico", { semFoco: true });

    await carregaDadosEstaticos();
    await carregaSessao();

    setTimeout(avisaAltura, 300);
  })();
})();
