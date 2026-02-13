// Controle da UI e fluxo do orçamento — versão HTML pura
// Compatível com a estrutura do original React (PersonData / BudgetData / BudgetResult)

(function () {
  /* ====== DOM REFS ====== */
  const personDataSection = document.getElementById("person-data");
  const budgetDataSection = document.getElementById("budget-data");
  const budgetResultSection = document.getElementById("budget-result");
  const stepIndicator = document.getElementById("step-indicator");
  const stepIndicator2 = document.getElementById("step-indicator-2");
  const loader = document.getElementById("loader");
  const errorBox = document.getElementById("error-box");
  const resultsText = document.getElementById("results-text");
  const resultsTable = document.getElementById("results-table");
  const spinnerLoad = document.getElementById("spinner-load");
  const linkReturn = document.getElementById("link-return");
  const textFirstStep = document.getElementById("text-first-step");
  const textSecondStep = document.getElementById("text-second-step");

  const step1Form = document.getElementById("form-step-1");
  const step2Form = document.getElementById("form-step-2");

  /* Step 1 fields */
  const f = {
    username: document.getElementById("username"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    company: document.getElementById("company"),
    serviceCode: document.getElementById("serviceCode"),
    participantsAmount: document.getElementById("participantsAmount"),
  };

  /* Step 2 fields */
  const g = {
    amount: document.getElementById("amount"),
    finalityCode: document.getElementById("finalityCode"),
    languageCode: document.getElementById("languageCode"),
    howDidMeetUs: document.getElementById("howDidMeetUs"),
    observation: document.getElementById("observation"),
  };

  let csrfToken = "";
  let sessionCode = "";

  /* ====== HELPERS ====== */
  function setLoading(isLoading) {
    if (isLoading) {
      loader.classList.remove("hidden");
    } else {
      loader.classList.add("hidden");
    }
  }

  function showError(message) {
    if (!message) {
      errorBox.classList.add("hidden");
      errorBox.textContent = "";
    } else {
      errorBox.classList.remove("hidden");
      errorBox.textContent = message;
    }
  }

  function showFieldError(fieldId, msg) {
    const el = document.getElementById("err-" + fieldId);
    if (!el) return;
    if (msg) {
      el.textContent = msg;
      el.classList.remove("hidden");
    } else {
      el.textContent = "";
      el.classList.add("hidden");
    }
  }

  function clearFieldErrors() {
    document.querySelectorAll(".form-error").forEach(function (el) {
      if (!el.classList.contains("form-error-global")) {
        el.classList.add("hidden");
        el.textContent = "";
      }
    });
  }

  /* ====== PHONE FORMATTING (matches original FormatPhone) ====== */
  function formatPhone(value) {
    if (!value) return "";
    var digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return "(" + digits;
    if (digits.length <= 6)
      return "(" + digits.substring(0, 2) + ") " + digits.substring(2);
    if (digits.length <= 10)
      return (
        "(" +
        digits.substring(0, 2) +
        ") " +
        digits.substring(2, 6) +
        "-" +
        digits.substring(6)
      );
    return (
      "(" +
      digits.substring(0, 2) +
      ") " +
      digits.substring(2, 7) +
      "-" +
      digits.substring(7, 11)
    );
  }

  f.phone.addEventListener("input", function () {
    var cursorPos = this.selectionStart;
    var oldLen = this.value.length;
    this.value = formatPhone(this.value);
    var newLen = this.value.length;
    var newPos = cursorPos + (newLen - oldLen);
    this.setSelectionRange(newPos, newPos);
  });

  /* ====== NAVIGATION ====== */
  function goToStep(step) {
    personDataSection.classList.add("hidden");
    budgetDataSection.classList.add("hidden");
    budgetResultSection.classList.add("hidden");

    if (step === 1) {
      personDataSection.classList.remove("hidden");
      stepIndicator.textContent = "Etapa 1 de 2";
    } else if (step === 2) {
      budgetDataSection.classList.remove("hidden");
    } else if (step === 3) {
      budgetResultSection.classList.remove("hidden");
    }
  }

  /* ====== CLOSE BUTTON ====== */
  document.getElementById("btn-close").addEventListener("click", function () {
    goToStep(1);
    window.parent.postMessage(
      "closePopUpAppReact",
      "https://www.audiotext.com.br/"
    );
  });

  /* ====== NEW BUDGET LINK ====== */
  document
    .getElementById("btn-new-budget")
    .addEventListener("click", function () {
      goToStep(1);
    });

  /* ====== FILL FORM FROM BUDGET DATA ====== */
  function fillStep1FromBudget(budget) {
    if (!budget) return;
    f.username.value = budget.username || "";
    f.email.value = budget.email || "";
    f.phone.value = budget.phone || "";
    f.company.value = budget.company || "";
    if (budget.serviceCode) f.serviceCode.value = budget.serviceCode;
  }

  function fillStep2FromBudget(budget) {
    if (!budget) return;
    g.amount.value = budget.amount || "";
    if (budget.finalityCode) g.finalityCode.value = budget.finalityCode;
    if (budget.languageCode) g.languageCode.value = budget.languageCode;
    if (budget.howDidMeetUs) g.howDidMeetUs.value = budget.howDidMeetUs;
    g.observation.value = budget.observation || "";
  }

  /* ====== LOAD STATIC DATA (services, finalities, languages, channels) ====== */
  async function loadStaticData() {
    try {
      setLoading(true);

      const [servicesRes, finalitiesRes, languagesRes, meetingChannelsRes] =
        await Promise.allSettled([
          app.api.services.get(),
          app.api.finalities.get(),
          app.api.languages.get(),
          app.api.meetingChannels.get(),
        ]);

      // Serviços
      f.serviceCode.innerHTML = '<option value="">Selecione o serviço</option>';
      var services =
        servicesRes.status === "fulfilled" ? servicesRes.value : null;
      if (Array.isArray(services) && services.length) {
        services.forEach(function (s) {
          var opt = document.createElement("option");
          opt.value = s.code;
          opt.textContent = s.name;
          f.serviceCode.appendChild(opt);
        });
      } else {
        // Fallback do original
        var opt = document.createElement("option");
        opt.value = "transcricao";
        opt.textContent = "Transcrição";
        f.serviceCode.appendChild(opt);
      }

      // Finalidades
      g.finalityCode.innerHTML =
        '<option value="">Selecione a Finalidade</option>';
      var finalities =
        finalitiesRes.status === "fulfilled" ? finalitiesRes.value : null;
      if (Array.isArray(finalities) && finalities.length) {
        finalities.forEach(function (item) {
          var opt = document.createElement("option");
          opt.value = item.code;
          opt.textContent = item.name;
          g.finalityCode.appendChild(opt);
        });
      } else {
        // Fallback do original (hardcoded options from BudgetData)
        [
          { code: "juridica", name: "Jurídica" },
          { code: "academica", name: "Acadêmica" },
          { code: "elaboracao-de-ata", name: "Ata de assembleia/reunião" },
          { code: "relatorio", name: "Relatório" },
          { code: "livro", name: "Livro" },
          { code: "legendagem", name: "Legendagem" },
          { code: "outro", name: "Outro" },
        ].forEach(function (item) {
          var opt = document.createElement("option");
          opt.value = item.code;
          opt.textContent = item.name;
          g.finalityCode.appendChild(opt);
        });
      }

      // Idiomas
      g.languageCode.innerHTML =
        '<option value="">Selecione o idioma</option>';
      var languages =
        languagesRes.status === "fulfilled" ? languagesRes.value : null;
      if (Array.isArray(languages) && languages.length) {
        languages.forEach(function (item) {
          var opt = document.createElement("option");
          opt.value = item.code;
          opt.textContent = item.name;
          g.languageCode.appendChild(opt);
        });
      } else {
        // Fallback
        [
          { code: "pt-BR", name: "Português" },
          { code: "en-US", name: "Inglês" },
          { code: "es-ES", name: "Espanhol" },
          { code: "other", name: "Outro" },
        ].forEach(function (item) {
          var opt = document.createElement("option");
          opt.value = item.code;
          opt.textContent = item.name;
          g.languageCode.appendChild(opt);
        });
      }

      // Canais — Como nos conheceu
      g.howDidMeetUs.innerHTML =
        '<option value="">Como nos conheceu?</option>';
      var channels =
        meetingChannelsRes.status === "fulfilled"
          ? meetingChannelsRes.value
          : null;
      if (Array.isArray(channels) && channels.length) {
        channels.forEach(function (m) {
          var opt = document.createElement("option");
          opt.value = typeof m === "string" ? m : m.code || m.name || m;
          opt.textContent = typeof m === "string" ? m : m.name || m;
          g.howDidMeetUs.appendChild(opt);
        });
      } else {
        // Fallback
        ["Já sou cliente", "Indicação", "Google", "Outro"].forEach(function (
          m
        ) {
          var opt = document.createElement("option");
          opt.value = m;
          opt.textContent = m;
          g.howDidMeetUs.appendChild(opt);
        });
      }
    } catch (e) {
      console.error(e);
      showError("Erro ao carregar dados iniciais. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  /* ====== LOAD BUDGET (session) ====== */
  async function loadBudget() {
    try {
      setLoading(true);
      var data = await app.api.budget.get();
      if (data) {
        sessionCode = data.sessionCode || (data.budget && data.budget.sessionCode) || "";
        csrfToken = data.csrfToken || "";
        var budget = data.budget || data;
        console.log('[Budget] GET /budget response - sessionCode:', sessionCode, 'csrfToken:', csrfToken);
        fillStep1FromBudget(budget);
        fillStep2FromBudget(budget);
      }
    } catch (e) {
      console.error(e);
      // Não mostra erro — pode ser primeira visita sem sessão
    } finally {
      setLoading(false);
    }
  }

  /* ====== LOAD CMS CONTENT (text views) ====== */
  async function loadContent() {
    try {
      var res = await app.api.content.get();
      if (res) {
        if (res.textFirstView && textFirstStep) {
          textFirstStep.innerHTML = res.textFirstView;
        }
        if (res.textSecondView && textSecondStep) {
          textSecondStep.innerHTML = res.textSecondView;
        }
      }
    } catch (e) {
      console.warn("Conteúdo CMS indisponível, usando textos padrão.", e);
    }
  }

  /* ====== STEP 1 SUBMIT ====== */
  step1Form.addEventListener("submit", async function (event) {
    event.preventDefault();
    showError("");
    clearFieldErrors();

    var username = f.username.value.trim();
    var email = f.email.value.trim();
    var phone = f.phone.value.trim();
    var serviceCode = f.serviceCode.value;

    // Validação
    var hasError = false;

    if (!username) {
      showFieldError("username", "Nome completo é obrigatório");
      hasError = true;
    }
    if (!email) {
      showFieldError("email", "E-mail é obrigatório");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError("email", "E-mail inválido");
      hasError = true;
    }
    if (!phone) {
      showFieldError("phone", "Telefone é obrigatório");
      hasError = true;
    }
    if (!serviceCode) {
      showFieldError("serviceCode", "Selecione um serviço");
      hasError = true;
    }

    if (hasError) return;

    var payload = {
      username: username,
      email: email,
      phone: phone,
      company: f.company.value.trim() || null,
      serviceCode: serviceCode,
      participantsAmount: 1,
      isWhatsApp: true,
      sessionCode: sessionCode || app.cookies.get("audiotext-budget-session"),
      _csrf: csrfToken || null,
    };

    try {
      setLoading(true);
      var res = await app.api.budget.patch(payload);
      var budget = res.budget || res;
      sessionCode = budget.sessionCode || sessionCode;
      fillStep1FromBudget(budget);
      goToStep(2);
    } catch (e) {
      console.error(e);
      showError("Erro ao salvar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  });

  /* ====== STEP 2 — PREV ====== */
  document.getElementById("btn-prev").addEventListener("click", function () {
    goToStep(1);
  });

  /* ====== STEP 2 SUBMIT ====== */
  step2Form.addEventListener("submit", async function (event) {
    event.preventDefault();
    showError("");
    clearFieldErrors();

    var amount = Number(g.amount.value) || 0;
    var finalityCode = g.finalityCode.value;
    var languageCode = g.languageCode.value;
    var howDidMeetUs = g.howDidMeetUs.value;

    // Validação
    var hasError = false;

    if (!amount || amount < 1) {
      showFieldError("amount", "Informe a quantidade de minutos");
      hasError = true;
    }
    if (!finalityCode) {
      showFieldError("finalityCode", "Selecione a finalidade");
      hasError = true;
    }
    if (!languageCode) {
      showFieldError("languageCode", "Selecione o idioma");
      hasError = true;
    }
    if (!howDidMeetUs) {
      showFieldError("howDidMeetUs", "Selecione como nos conheceu");
      hasError = true;
    }

    if (hasError) return;

    var payloadBudget = {
      amount: amount,
      finalityCode: finalityCode,
      languageCode: languageCode,
      howDidMeetUs: howDidMeetUs,
      observation: g.observation.value || null,
      sessionCode: sessionCode || app.cookies.get("audiotext-budget-session"),
      _csrf: csrfToken || null,
    };

    try {
      setLoading(true);
      resultsText.innerHTML = "";
      resultsTable.innerHTML = "";

      // Salvar budget
      var saved = await app.api.budget.patch(payloadBudget);
      var budgetSaved = saved.budget || saved;
      sessionCode = budgetSaved.sessionCode || sessionCode;

      console.log('[Budget] PATCH response (budgetSaved):', JSON.stringify(budgetSaved, null, 2));
      console.log('[Budget] sessionCode:', sessionCode, 'csrfToken:', csrfToken);

      // Ir para Step 3 mostrando spinner
      goToStep(3);
      spinnerLoad.classList.remove("hidden");

      // Sinalizar para o site pai
      window.parent.postMessage(
        "gerarPropostas",
        "https://www.audiotext.com.br/"
      );

      // Gerar propostas — usar dados direto da resposta do PATCH (já validados pela API)
      var proposalPayload = {
        budget: budgetSaved,
        sessionCode: sessionCode,
        csrfToken: csrfToken,
      };

      console.log('[Budget] POST /budget/proposals payload:', JSON.stringify(proposalPayload, null, 2));

      var proposalsResponse = await app.api.proposals.generate(proposalPayload);

      if (proposalsResponse.hasErrors) {
        spinnerLoad.classList.add("hidden");
        console.error(proposalsResponse.errors);
        showError("Ocorreram erros ao gerar propostas.");
        return;
      }

      // Buscar propostas geradas (mesmo fluxo do original React saga)
      var proposalData = await app.api.proposals.get(sessionCode);
      spinnerLoad.classList.add("hidden");

      renderResults(proposalData);
    } catch (e) {
      console.error(e);
      spinnerLoad.classList.add("hidden");
      showError("Erro ao gerar propostas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  });

  /* ====== RENDER RESULTS ====== */
  function renderResults(budget) {
    if (!budget) return;

    // Text
    if (budget.text) {
      resultsText.innerHTML =
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
      linkReturn.style.display = "block";
      return;
    }

    // Build proposal cards
    var wrapper = document.createElement("div");
    wrapper.className = "proposal-cards-wrapper";

    proposals.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "proposal-card";

      card.innerHTML =
        '<div class="proposal-card-plan">' +
        escapeHtml(p.plan) +
        "</div>" +
        '<div class="proposal-card-line"><strong>Prazo:</strong> ' +
        escapeHtml(String(p.deadline || "")) +
        " dias úteis</div>" +
        '<div class="proposal-card-price">' +
        escapeHtml(p.cashPirce || p.cashPrice || "") +
        "</div>" +
        '<div class="proposal-card-line">à vista</div>' +
        '<div class="proposal-card-line"><strong>Parcelado:</strong> ' +
        escapeHtml(p.installmentValue || "") +
        "</div>" +
        '<div class="proposal-card-line">' +
        escapeHtml(p.installmentPrice || "") +
        "</div>" +
        '<button class="proposal-card-btn" type="button">Enviar arquivos</button>';

      var btn = card.querySelector(".proposal-card-btn");
      btn.addEventListener("click", function () {
        window.parent.postMessage(
          "openTransfer",
          "https://www.audiotext.com.br/"
        );
      });

      wrapper.appendChild(card);
    });

    resultsTable.innerHTML = "";
    resultsTable.appendChild(wrapper);

    // Show return link
    linkReturn.style.display = "block";
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ====== INIT ====== */
  (async function init() {
    try {
      showError("");
      setLoading(true);

      if (
        window.app &&
        app.tracking &&
        typeof app.tracking.run === "function"
      ) {
        app.tracking.run();
      }

      await loadStaticData();
      await loadBudget();
      await loadContent();

      goToStep(1);
    } catch (e) {
      console.error(e);
      showError("Erro ao inicializar o simulador.");
    } finally {
      setLoading(false);
    }
  })();
})();
