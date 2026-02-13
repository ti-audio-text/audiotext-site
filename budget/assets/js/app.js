// Controle da UI e fluxo do orçamento — v2.0
// Etapas invertidas: 1) Serviço → 2) Dados pessoais → 3) Resultado
// Inclui: progress bar, validação inline, save & resume

(function () {
  /* ====== DOM REFS ====== */
  var step1Section = document.getElementById("step-1-service");
  var step2Section = document.getElementById("step-2-personal");
  var budgetResultSection = document.getElementById("budget-result");
  var loader = document.getElementById("loader");
  var errorBox = document.getElementById("error-box");
  var resultsText = document.getElementById("results-text");
  var resultsTable = document.getElementById("results-table");
  var spinnerLoad = document.getElementById("spinner-load");
  var linkReturn = document.getElementById("link-return");
  var textFirstStep = document.getElementById("text-first-step");
  var textSecondStep = document.getElementById("text-second-step");

  var step1Form = document.getElementById("form-step-1");
  var step2Form = document.getElementById("form-step-2");

  /* Progress bar refs */
  var progressSteps = document.querySelectorAll(".progress-step");
  var progressLine1 = document.getElementById("progress-line-1");
  var progressLine2 = document.getElementById("progress-line-2");

  /* Step 1 fields — service/budget data */
  var svc = {
    serviceCode: document.getElementById("serviceCode"),
    participantsAmount: document.getElementById("participantsAmount"),
    amount: document.getElementById("amount"),
    finalityCode: document.getElementById("finalityCode"),
    languageCode: document.getElementById("languageCode"),
  };

  /* Step 2 fields — personal data */
  var usr = {
    username: document.getElementById("username"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    company: document.getElementById("company"),
    howDidMeetUs: document.getElementById("howDidMeetUs"),
    observation: document.getElementById("observation"),
  };

  var csrfToken = "";
  var sessionCode = "";

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
    var el = document.getElementById("err-" + fieldId);
    if (!el) return;
    if (msg) {
      el.textContent = msg;
      el.classList.remove("hidden");
      // Also mark the field as invalid
      var field = document.getElementById(fieldId);
      if (field) {
        field.classList.add("invalid");
        field.classList.remove("valid");
      }
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
    // Clear all validation states
    document.querySelectorAll(".valid, .invalid").forEach(function (el) {
      el.classList.remove("valid", "invalid");
    });
  }

  function markValid(field) {
    field.classList.add("valid");
    field.classList.remove("invalid");
    // Clear error message if exists
    var errEl = document.getElementById("err-" + field.id);
    if (errEl) {
      errEl.classList.add("hidden");
      errEl.textContent = "";
    }
  }

  function markInvalid(field) {
    field.classList.add("invalid");
    field.classList.remove("valid");
  }

  function markNeutral(field) {
    field.classList.remove("valid", "invalid");
  }

  /* ====== PHONE FORMATTING ====== */
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

  usr.phone.addEventListener("input", function () {
    var cursorPos = this.selectionStart;
    var oldLen = this.value.length;
    this.value = formatPhone(this.value);
    var newLen = this.value.length;
    var newPos = cursorPos + (newLen - oldLen);
    this.setSelectionRange(newPos, newPos);
  });

  /* ====== INLINE VALIDATION ====== */
  function setupInlineValidation() {
    // --- Step 1 fields ---
    svc.serviceCode.addEventListener("change", function () {
      if (this.value) markValid(this);
      else markNeutral(this);
    });

    svc.amount.addEventListener("blur", function () {
      var val = Number(this.value);
      if (val >= 1) markValid(this);
      else if (this.value !== "") markInvalid(this);
      else markNeutral(this);
    });

    svc.finalityCode.addEventListener("change", function () {
      if (this.value) markValid(this);
      else markNeutral(this);
    });

    svc.languageCode.addEventListener("change", function () {
      if (this.value) markValid(this);
      else markNeutral(this);
    });

    // --- Step 2 fields ---
    usr.username.addEventListener("blur", function () {
      var val = this.value.trim();
      if (val.length >= 2) markValid(this);
      else if (val.length > 0) markInvalid(this);
      else markNeutral(this);
    });

    usr.email.addEventListener("blur", function () {
      var val = this.value.trim();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) markValid(this);
      else if (val.length > 0) markInvalid(this);
      else markNeutral(this);
    });

    usr.phone.addEventListener("blur", function () {
      var digits = this.value.replace(/\D/g, "");
      if (digits.length >= 10) markValid(this);
      else if (digits.length > 0) markInvalid(this);
      else markNeutral(this);
    });

    usr.howDidMeetUs.addEventListener("change", function () {
      if (this.value) markValid(this);
      else markNeutral(this);
    });
  }

  /* ====== PROGRESS BAR ====== */
  function updateProgressBar(currentStep) {
    progressSteps.forEach(function (step, index) {
      var stepNum = index + 1;
      step.classList.remove("active", "completed");

      if (stepNum < currentStep) {
        step.classList.add("completed");
      } else if (stepNum === currentStep) {
        step.classList.add("active");
      }
    });

    // Line fills
    if (currentStep > 1) {
      progressLine1.classList.add("filled");
    } else {
      progressLine1.classList.remove("filled");
    }

    if (currentStep > 2) {
      progressLine2.classList.add("filled");
    } else {
      progressLine2.classList.remove("filled");
    }
  }

  /* ====== NAVIGATION ====== */
  function goToStep(step) {
    step1Section.classList.add("hidden");
    step2Section.classList.add("hidden");
    budgetResultSection.classList.add("hidden");

    if (step === 1) {
      step1Section.classList.remove("hidden");
    } else if (step === 2) {
      step2Section.classList.remove("hidden");
    } else if (step === 3) {
      budgetResultSection.classList.remove("hidden");
    }

    updateProgressBar(step);
    showError("");
  }

  /* ====== SAVE & RESUME ====== */
  var STORAGE_KEY = "at_budget_session";

  function saveSession() {
    if (sessionCode) {
      try {
        localStorage.setItem(STORAGE_KEY, sessionCode);
      } catch (e) {
        // localStorage not available — silently ignore
      }
    }
  }

  function getSavedSession() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function clearSavedSession() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
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
      clearSavedSession();
      sessionCode = "";
      csrfToken = "";
      clearFieldErrors();
      // Clear all form fields
      step1Form.reset();
      step2Form.reset();
      goToStep(1);
    });

  /* ====== FILL FORM FROM BUDGET DATA ====== */
  function fillStep1FromBudget(budget) {
    if (!budget) return;
    if (budget.serviceCode) svc.serviceCode.value = budget.serviceCode;
    if (budget.amount) svc.amount.value = budget.amount;
    if (budget.finalityCode) svc.finalityCode.value = budget.finalityCode;
    if (budget.languageCode) svc.languageCode.value = budget.languageCode;
  }

  function fillStep2FromBudget(budget) {
    if (!budget) return;
    usr.username.value = budget.username || "";
    usr.email.value = budget.email || "";
    usr.phone.value = budget.phone || "";
    usr.company.value = budget.company || "";
    if (budget.howDidMeetUs) usr.howDidMeetUs.value = budget.howDidMeetUs;
    usr.observation.value = budget.observation || "";
  }

  /* ====== LOAD STATIC DATA ====== */
  async function loadStaticData() {
    try {
      setLoading(true);

      var results = await Promise.allSettled([
        app.api.services.get(),
        app.api.finalities.get(),
        app.api.languages.get(),
        app.api.meetingChannels.get(),
      ]);

      var servicesRes = results[0];
      var finalitiesRes = results[1];
      var languagesRes = results[2];
      var meetingChannelsRes = results[3];

      // Serviços
      svc.serviceCode.innerHTML =
        '<option value="">Selecione o serviço*</option>';
      var services =
        servicesRes.status === "fulfilled" ? servicesRes.value : null;
      if (Array.isArray(services) && services.length) {
        services.forEach(function (s) {
          var opt = document.createElement("option");
          opt.value = s.code;
          opt.textContent = s.name;
          svc.serviceCode.appendChild(opt);
        });
      } else {
        var opt = document.createElement("option");
        opt.value = "transcricao";
        opt.textContent = "Transcrição";
        svc.serviceCode.appendChild(opt);
      }

      // Finalidades
      svc.finalityCode.innerHTML =
        '<option value="">Selecione a finalidade*</option>';
      var finalities =
        finalitiesRes.status === "fulfilled" ? finalitiesRes.value : null;
      if (Array.isArray(finalities) && finalities.length) {
        finalities.forEach(function (item) {
          var opt = document.createElement("option");
          opt.value = item.code;
          opt.textContent = item.name;
          svc.finalityCode.appendChild(opt);
        });
      } else {
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
          svc.finalityCode.appendChild(opt);
        });
      }

      // Idiomas
      svc.languageCode.innerHTML =
        '<option value="">Selecione o idioma*</option>';
      var languages =
        languagesRes.status === "fulfilled" ? languagesRes.value : null;
      if (Array.isArray(languages) && languages.length) {
        languages.forEach(function (item) {
          var opt = document.createElement("option");
          opt.value = item.code;
          opt.textContent = item.name;
          svc.languageCode.appendChild(opt);
        });
      } else {
        [
          { code: "pt-BR", name: "Português" },
          { code: "en-US", name: "Inglês" },
          { code: "es-ES", name: "Espanhol" },
          { code: "other", name: "Outro" },
        ].forEach(function (item) {
          var opt = document.createElement("option");
          opt.value = item.code;
          opt.textContent = item.name;
          svc.languageCode.appendChild(opt);
        });
      }

      // Canais — Como nos conheceu
      usr.howDidMeetUs.innerHTML =
        '<option value="">Como nos conheceu?*</option>';
      var channels =
        meetingChannelsRes.status === "fulfilled"
          ? meetingChannelsRes.value
          : null;
      if (Array.isArray(channels) && channels.length) {
        channels.forEach(function (m) {
          var opt = document.createElement("option");
          opt.value = typeof m === "string" ? m : m.code || m.name || m;
          opt.textContent = typeof m === "string" ? m : m.name || m;
          usr.howDidMeetUs.appendChild(opt);
        });
      } else {
        ["Já sou cliente", "Indicação", "Google", "Outro"].forEach(function (
          m
        ) {
          var opt = document.createElement("option");
          opt.value = m;
          opt.textContent = m;
          usr.howDidMeetUs.appendChild(opt);
        });
      }
    } catch (e) {
      console.error(e);
      showError("Erro ao carregar dados iniciais. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  /* ====== LOAD BUDGET (session restore) ====== */
  async function loadBudget() {
    try {
      // Try to restore sessionCode from localStorage
      var savedSession = getSavedSession();
      if (savedSession) {
        sessionCode = savedSession;
      }

      setLoading(true);
      var data = await app.api.budget.get();
      if (data) {
        sessionCode =
          data.sessionCode ||
          (data.budget && data.budget.sessionCode) ||
          sessionCode;
        csrfToken = data.csrfToken || "";
        var budget = data.budget || data;
        console.log(
          "[Budget] GET /budget response - sessionCode:",
          sessionCode,
          "csrfToken:",
          csrfToken
        );
        fillStep1FromBudget(budget);
        fillStep2FromBudget(budget);
        saveSession();
      }
    } catch (e) {
      console.error(e);
      // Not an error — may be first visit
    } finally {
      setLoading(false);
    }
  }

  /* ====== LOAD CMS CONTENT ====== */
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

  /* ====== STEP 1 SUBMIT — Service/Budget Data ====== */
  step1Form.addEventListener("submit", async function (event) {
    event.preventDefault();
    showError("");
    clearFieldErrors();

    var serviceCode = svc.serviceCode.value;
    var amount = Number(svc.amount.value) || 0;
    var finalityCode = svc.finalityCode.value;
    var languageCode = svc.languageCode.value;

    // Validação
    var hasError = false;

    if (!serviceCode) {
      showFieldError("serviceCode", "Selecione um serviço");
      hasError = true;
    }
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

    if (hasError) return;

    var payload = {
      serviceCode: serviceCode,
      amount: amount,
      finalityCode: finalityCode,
      languageCode: languageCode,
      participantsAmount: 1,
      sessionCode: sessionCode || app.cookies.get("audiotext-budget-session"),
      _csrf: csrfToken || null,
    };

    try {
      setLoading(true);
      var res = await app.api.budget.patch(payload);
      var budget = res.budget || res;
      sessionCode = budget.sessionCode || sessionCode;
      saveSession();
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

  /* ====== STEP 2 SUBMIT — Personal Data + Generate Proposals ====== */
  step2Form.addEventListener("submit", async function (event) {
    event.preventDefault();
    showError("");
    clearFieldErrors();

    var username = usr.username.value.trim();
    var email = usr.email.value.trim();
    var phone = usr.phone.value.trim();
    var howDidMeetUs = usr.howDidMeetUs.value;

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
    if (!howDidMeetUs) {
      showFieldError("howDidMeetUs", "Selecione como nos conheceu");
      hasError = true;
    }

    if (hasError) return;

    var payloadPersonal = {
      username: username,
      email: email,
      phone: phone,
      company: usr.company.value.trim() || null,
      howDidMeetUs: howDidMeetUs,
      observation: usr.observation.value || null,
      isWhatsApp: true,
      sessionCode: sessionCode || app.cookies.get("audiotext-budget-session"),
      _csrf: csrfToken || null,
    };

    try {
      setLoading(true);
      resultsText.innerHTML = "";
      resultsTable.innerHTML = "";

      // Save personal data
      var saved = await app.api.budget.patch(payloadPersonal);
      var budgetSaved = saved.budget || saved;
      sessionCode = budgetSaved.sessionCode || sessionCode;
      saveSession();

      console.log(
        "[Budget] PATCH response (budgetSaved):",
        JSON.stringify(budgetSaved, null, 2)
      );
      console.log(
        "[Budget] sessionCode:",
        sessionCode,
        "csrfToken:",
        csrfToken
      );

      // Go to Step 3 showing spinner
      goToStep(3);
      spinnerLoad.classList.remove("hidden");

      // Signal parent page
      window.parent.postMessage(
        "gerarPropostas",
        "https://www.audiotext.com.br/"
      );

      // Generate proposals
      var proposalPayload = {
        budget: budgetSaved,
        sessionCode: sessionCode,
        csrfToken: csrfToken,
      };

      console.log(
        "[Budget] POST /budget/proposals payload:",
        JSON.stringify(proposalPayload, null, 2)
      );

      var proposalsResponse = await app.api.proposals.generate(proposalPayload);

      if (proposalsResponse.hasErrors) {
        spinnerLoad.classList.add("hidden");
        console.error(proposalsResponse.errors);
        showError("Ocorreram erros ao gerar propostas.");
        return;
      }

      // Fetch generated proposals
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

      setupInlineValidation();
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
