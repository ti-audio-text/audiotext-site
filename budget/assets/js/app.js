// Controle da UI e fluxo do orçamento — versão HTML pura v2.1
// Etapa 1: Dados do serviço | Etapa 2: Dados pessoais | Etapa 3: Resultado
// v2.1: Carousel mobile, cards redesenhados, aviso spam, logo centralizada

(function () {
  /* ====== DOM REFS ====== */
  var step1Section = document.getElementById("step-1-service");
  var step2Section = document.getElementById("step-2-personal");
  var budgetResultSection = document.getElementById("budget-result");
  var progressBar = document.getElementById("progress-bar");
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

  /* Step 1 fields (service data) */
  var pf = {
    serviceCode: document.getElementById("serviceCode"),
    participantsAmount: document.getElementById("participantsAmount"),
    amount: document.getElementById("amount"),
    finalityCode: document.getElementById("finalityCode"),
    languageCode: document.getElementById("languageCode"),
  };

  /* Step 2 fields (personal data) */
  var uf = {
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
      var field = document.getElementById(fieldId);
      if (field) {
        field.classList.remove("valid");
        field.classList.add("invalid");
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
    document.querySelectorAll(".at-input, .at-select").forEach(function (el) {
      el.classList.remove("valid", "invalid");
    });
  }

  function markFieldValid(fieldId) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.remove("invalid");
    field.classList.add("valid");
    showFieldError(fieldId, null);
  }

  function markFieldInvalid(fieldId, msg) {
    showFieldError(fieldId, msg);
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

  uf.phone.addEventListener("input", function () {
    var cursorPos = this.selectionStart;
    var oldLen = this.value.length;
    this.value = formatPhone(this.value);
    var newLen = this.value.length;
    var newPos = cursorPos + (newLen - oldLen);
    this.setSelectionRange(newPos, newPos);
  });

  /* ====== INLINE VALIDATION ====== */
  var blurredFields = {};

  function setupInlineValidation() {
    var step1Required = [
      { id: "serviceCode", msg: "Selecione um serviço", type: "select" },
      { id: "amount", msg: "Informe a quantidade de minutos", type: "number" },
      { id: "finalityCode", msg: "Selecione a finalidade", type: "select" },
      { id: "languageCode", msg: "Selecione o idioma", type: "select" },
    ];

    var step2Required = [
      { id: "username", msg: "Nome completo é obrigatório", type: "text" },
      { id: "email", msg: "E-mail é obrigatório", type: "email" },
      { id: "phone", msg: "Telefone é obrigatório", type: "tel" },
    ];

    var allFields = step1Required.concat(step2Required);

    allFields.forEach(function (fieldDef) {
      var el = document.getElementById(fieldDef.id);
      if (!el) return;

      el.addEventListener("blur", function () {
        blurredFields[fieldDef.id] = true;
        validateSingleField(fieldDef);
      });

      var eventType = fieldDef.type === "select" ? "change" : "input";
      el.addEventListener(eventType, function () {
        if (blurredFields[fieldDef.id]) {
          validateSingleField(fieldDef);
        }
      });
    });
  }

  function validateSingleField(fieldDef) {
    var el = document.getElementById(fieldDef.id);
    if (!el) return true;

    var value = el.value.trim();

    if (
      !value ||
      (fieldDef.type === "number" && (Number(value) < 1 || isNaN(Number(value))))
    ) {
      markFieldInvalid(fieldDef.id, fieldDef.msg);
      return false;
    }

    if (
      fieldDef.type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      markFieldInvalid(fieldDef.id, "E-mail inválido");
      return false;
    }

    markFieldValid(fieldDef.id);
    return true;
  }

  /* ====== PROGRESS BAR ====== */
  function updateProgressBar(currentStep) {
    var steps = progressBar.querySelectorAll(".progress-step");
    var line1 = document.getElementById("progress-line-1");
    var line2 = document.getElementById("progress-line-2");

    steps.forEach(function (stepEl) {
      var stepNum = parseInt(stepEl.getAttribute("data-step"));
      stepEl.classList.remove("active", "completed");

      if (stepNum < currentStep) {
        stepEl.classList.add("completed");
      } else if (stepNum === currentStep) {
        // Step 3 (results) shows as completed/green since it's the final state
        stepEl.classList.add(currentStep === 3 ? "completed" : "active");
      }
    });

    if (currentStep >= 2) {
      line1.classList.add("filled");
    } else {
      line1.classList.remove("filled");
    }

    if (currentStep >= 3) {
      line2.classList.add("filled");
    } else {
      line2.classList.remove("filled");
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

  /* ====== SAVE & RESUME (localStorage) ====== */
  var STORAGE_KEY = "at-budget-session";

  function saveSession() {
    if (sessionCode) {
      try {
        localStorage.setItem(STORAGE_KEY, sessionCode);
      } catch (e) {
        // localStorage not available
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

  /* ====== FILL FORM FROM BUDGET DATA ====== */
  function fillProjectFromBudget(budget) {
    if (!budget) return;
    if (budget.serviceCode) pf.serviceCode.value = budget.serviceCode;
    if (budget.amount) pf.amount.value = budget.amount;
    if (budget.finalityCode) pf.finalityCode.value = budget.finalityCode;
    if (budget.languageCode) pf.languageCode.value = budget.languageCode;
  }

  function fillPersonalFromBudget(budget) {
    if (!budget) return;
    uf.username.value = budget.username || "";
    uf.email.value = budget.email || "";
    uf.phone.value = budget.phone || "";
    uf.company.value = budget.company || "";
    if (budget.howDidMeetUs) uf.howDidMeetUs.value = budget.howDidMeetUs;
    uf.observation.value = budget.observation || "";
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
      pf.serviceCode.innerHTML =
        '<option value="">Selecione o serviço*</option>';
      var services =
        servicesRes.status === "fulfilled" ? servicesRes.value : null;
      if (Array.isArray(services) && services.length) {
        services.forEach(function (s) {
          var opt = document.createElement("option");
          opt.value = s.code;
          opt.textContent = s.name;
          pf.serviceCode.appendChild(opt);
        });
      } else {
        var opt = document.createElement("option");
        opt.value = "transcricao";
        opt.textContent = "Transcrição";
        pf.serviceCode.appendChild(opt);
      }
      // Sempre adicionar Degravação (front-only, mapeia para transcricao + juridica)
      var degOpt = document.createElement("option");
      degOpt.value = "degravacao";
      degOpt.textContent = "Degravação (Transcrição Jurídica)";
      pf.serviceCode.appendChild(degOpt);
        });
      }

      // Finalidades
      pf.finalityCode.innerHTML =
        '<option value="">Selecione a finalidade*</option>';
      var finalities =
        finalitiesRes.status === "fulfilled" ? finalitiesRes.value : null;
      if (Array.isArray(finalities) && finalities.length) {
        finalities.forEach(function (item) {
          var opt = document.createElement("option");
          opt.value = item.code;
          opt.textContent = item.name;
          pf.finalityCode.appendChild(opt);
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
          pf.finalityCode.appendChild(opt);
        });
      }

      // Idiomas
      pf.languageCode.innerHTML =
        '<option value="">Selecione o idioma*</option>';
      var languages =
        languagesRes.status === "fulfilled" ? languagesRes.value : null;
      if (Array.isArray(languages) && languages.length) {
        languages.forEach(function (item) {
          var opt = document.createElement("option");
          opt.value = item.code;
          opt.textContent = item.name;
          pf.languageCode.appendChild(opt);
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
          pf.languageCode.appendChild(opt);
        });
      }

      // Canais
      uf.howDidMeetUs.innerHTML =
        '<option value="">Como nos conheceu? (opcional)</option>';
      var channels =
        meetingChannelsRes.status === "fulfilled"
          ? meetingChannelsRes.value
          : null;
      if (Array.isArray(channels) && channels.length) {
        channels.forEach(function (m) {
          var opt = document.createElement("option");
          opt.value = typeof m === "string" ? m : m.code || m.name || m;
          opt.textContent = typeof m === "string" ? m : m.name || m;
          uf.howDidMeetUs.appendChild(opt);
        });
      } else {
        ["Já sou cliente", "Indicação", "Google", "Outro"].forEach(function (
          m
        ) {
          var opt = document.createElement("option");
          opt.value = m;
          opt.textContent = m;
          uf.howDidMeetUs.appendChild(opt);
        });
      }
    } catch (e) {
      console.error(e);
      showError("Erro ao carregar dados iniciais. Tente novamente.");
    } finally {
      setLoading(false);
    }
    
      // Degravação: auto-setar finalidade jurídica e travar campo
    pf.serviceCode.addEventListener("change", function () {
      var isDegravacao = pf.serviceCode.value === "degravacao";
      if (isDegravacao) {
        pf.finalityCode.value = "juridica";
        pf.finalityCode.disabled = true;
        pf.finalityCode.style.opacity = "0.6";
      } else {
        pf.finalityCode.disabled = false;
        pf.finalityCode.style.opacity = "1";
      }
    });
  }

  /* ====== LOAD BUDGET (session) ====== */
  async function loadBudget() {
    try {
      setLoading(true);
      var data = await app.api.budget.get();
      if (data) {
        sessionCode =
          data.sessionCode ||
          (data.budget && data.budget.sessionCode) ||
          "";
        csrfToken = data.csrfToken || "";
        var budget = data.budget || data;
        console.log(
          "[Budget] GET /budget response - sessionCode:",
          sessionCode,
          "csrfToken:",
          csrfToken
        );
        fillProjectFromBudget(budget);
        fillPersonalFromBudget(budget);
        saveSession();
      }
    } catch (e) {
      console.error(e);
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

  /* ====== FALLBACK howDidMeetUs ====== */
  function getHowDidMeetUsFallback() {
    var utms = app.cookies.get("audiotext-budget-tracking");
    if (utms) {
      var parts = utms.split("|");
      var source = (parts[0] || "").toLowerCase();
      if (source && source !== "direct") {
        if (source.indexOf("google") >= 0) return "Google";
        if (
          source.indexOf("facebook") >= 0 ||
          source.indexOf("instagram") >= 0
        )
          return "Redes sociais";
        if (source.indexOf("linkedin") >= 0) return "LinkedIn";
        return "Outro";
      }
    }
    return "Outro";
  }

  /* ====== STEP 1 SUBMIT — SERVICE DATA ====== */
  step1Form.addEventListener("submit", async function (event) {
    event.preventDefault();
    showError("");
    clearFieldErrors();

    var serviceCodeRaw = pf.serviceCode.value;
    var serviceCode = serviceCodeRaw === "degravacao" ? "transcricao" : serviceCodeRaw;
    var amount = Number(pf.amount.value) || 0;
    var finalityCode = serviceCodeRaw === "degravacao" ? "juridica" : pf.finalityCode.value;
    var languageCode = pf.languageCode.value;

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

    var participantsVal = pf.participantsAmount.value;

    var payload = {
      serviceCode: serviceCode,
      participantsAmount: participantsVal ? Number(participantsVal) : 1,
      amount: amount,
      finalityCode: finalityCode,
      languageCode: languageCode,
      sessionCode:
        sessionCode ||
        app.cookies.get("audiotext-budget-session") ||
        getSavedSession(),
      _csrf: csrfToken || null,
    };

    try {
      setLoading(true);
      var res = await app.api.budget.patch(payload);
      var budget = res.budget || res;
      sessionCode = budget.sessionCode || sessionCode;
      saveSession();
      fillProjectFromBudget(budget);
      goToStep(2);

      // Notificar página pai que step 1 foi concluído (para GTM)
      window.parent.postMessage(
        { type: 'budget_step1_complete', service: payload.serviceCode },
        "https://www.audiotext.com.br/"
      );
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

  /* ====== STEP 2 SUBMIT — PERSONAL DATA + GENERATE PROPOSALS ====== */
  step2Form.addEventListener("submit", async function (event) {
    event.preventDefault();
    showError("");
    clearFieldErrors();

    var username = uf.username.value.trim();
    var email = uf.email.value.trim();
    var phone = uf.phone.value.trim();

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

    if (hasError) return;

    var howDidMeetUs = uf.howDidMeetUs.value || getHowDidMeetUsFallback();

    var payloadPersonal = {
      username: username,
      email: email,
      phone: phone,
      company: uf.company.value.trim() || null,
      howDidMeetUs: howDidMeetUs,
      observation: uf.observation.value || null,
      isWhatsApp: true,
      sessionCode:
        sessionCode ||
        app.cookies.get("audiotext-budget-session") ||
        getSavedSession(),
      _csrf: csrfToken || null,
    };

    try {
      setLoading(true);
      resultsText.innerHTML = "";
      resultsTable.innerHTML = "";

      var saved = await app.api.budget.patch(payloadPersonal);
      var budgetSaved = saved.budget || saved;
      sessionCode = budgetSaved.sessionCode || sessionCode;
      saveSession();

      console.log(
        "[Budget] PATCH response (budgetSaved):",
        JSON.stringify(budgetSaved, null, 2)
      );

      goToStep(3);
      spinnerLoad.classList.remove("hidden");

      // Enviar dados ricos para GTM (Enhanced Conversions + tracking)
      window.parent.postMessage(
        {
          type: 'budget_submitted',
          email: email,
          phone: phone,
          name: username,
          service: budgetSaved.serviceCode || ''
        },
        "https://www.audiotext.com.br/"
      );

      // Legado (manter para compatibilidade com handlers existentes)
      window.parent.postMessage(
        "gerarPropostas",
        "https://www.audiotext.com.br/"
      );

      var proposalPayload = {
        budget: budgetSaved,
        sessionCode: sessionCode,
        csrfToken: csrfToken,
      };

      var proposalsResponse = await app.api.proposals.generate(
        proposalPayload
      );

      if (proposalsResponse.hasErrors) {
        spinnerLoad.classList.add("hidden");
        console.error(proposalsResponse.errors);
        showError("Ocorreram erros ao gerar propostas.");
        return;
      }

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

  /* ====== RENDER RESULTS — v2.1 redesigned cards + carousel ====== */

  /**
   * Extract installment count from installmentValue string.
   * installmentValue: "2x de R$138,00" → count: "2"
   * installmentPrice: "R$276,00" (total to pay in installments)
   *
   * Display: "ou R$276,00 em 2x" (total, not per-installment)
   */
  function parseInstallment(installmentValue, installmentPrice) {
    if (!installmentPrice) return null;
    // Extract count from installmentValue (e.g. "3x de R$331,00" → "3")
    var count = "3"; // default
    if (installmentValue) {
      var match = installmentValue.match(/(\d+)x/i);
      if (match) count = match[1];
    }
    return {
      count: count,
      totalPrice: installmentPrice,
    };
  }

  /**
   * Sort proposals: INSTANT first (lowest deadline), then FAST, then FLEX.
   * This ensures the anchoring effect (highest price first).
   */
  function sortProposals(proposals) {
    var planOrder = { INSTANT: 0, FAST: 1, FLEX: 2 };
    return proposals.slice().sort(function (a, b) {
      var orderA =
        planOrder[a.plan] !== undefined ? planOrder[a.plan] : 99;
      var orderB =
        planOrder[b.plan] !== undefined ? planOrder[b.plan] : 99;
      return orderA - orderB;
    });
  }

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

    // Sort: INSTANT → FAST → FLEX
    proposals = sortProposals(proposals);

    // Build cards wrapper
    var wrapper = document.createElement("div");
    wrapper.className = "proposal-cards-wrapper";

    proposals.forEach(function (p, index) {
      var card = document.createElement("div");
      card.className = "proposal-card";

      // FAST gets recommended badge
      var isFast = (p.plan || "").toUpperCase() === "FAST";
      if (isFast) {
        card.classList.add("recommended");
      }

      // Add plan-specific class for colored divider
      var planLower = (p.plan || "").toLowerCase();
      card.classList.add("plan-" + planLower);

      // Parse installment (total price + count)
      var inst = parseInstallment(p.installmentValue, p.installmentPrice);

      // Build card HTML
      var html = "";

      // Badge for FAST
      if (isFast) {
        html +=
          '<span class="proposal-badge">⭐ Melhor custo-benefício</span>';
      }

      // Plan name
      html +=
        '<div class="proposal-card-plan">' +
        escapeHtml(p.plan) +
        "</div>";

      // Deadline
      html +=
        '<div class="proposal-card-deadline">' +
        "<strong>Prazo:</strong> " +
        escapeHtml(String(p.deadline || "")) +
        " dias úteis</div>";

      // Divider (colored per plan via CSS)
      html += '<div class="proposal-card-divider"></div>';

      // Cash price (main highlight)
      html +=
        '<div class="proposal-card-price">' +
        escapeHtml(p.cashPirce || p.cashPrice || "") +
        "</div>";

      // "à vista" label
      html += '<div class="proposal-card-price-label">à vista</div>';

      // Installment: "ou R$1.215,00 em 3x" (total, not per-installment)
      if (inst) {
        html +=
          '<div class="proposal-card-installment">ou ' +
          escapeHtml(inst.totalPrice) +
          " em " +
          escapeHtml(inst.count) +
          "x</div>";
      }

      // CTA button
      html +=
        '<button class="proposal-card-btn" type="button">Enviar arquivos</button>';

      card.innerHTML = html;

      // Button click → open transfer
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

    // Force carousel to start at first card (INSTANT) — mobile only
        (function forceFirstCard() {
          if (window.innerWidth >= 768) return;
          // Disable smooth scroll and snap so scrollLeft takes effect immediately
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
        })();

    // Carousel dots (for mobile)
    if (proposals.length > 1) {
      var dotsContainer = document.createElement("div");
      dotsContainer.className = "carousel-dots";

      proposals.forEach(function (p, i) {
        var dot = document.createElement("button");
        dot.className = "carousel-dot" + (i === 0 ? " active" : "");
        dot.type = "button";
        dot.setAttribute("aria-label", "Ver plano " + (i + 1));
        dot.addEventListener("click", function () {
          var cards = wrapper.querySelectorAll(".proposal-card");
          if (cards[i]) {
            cards[i].scrollIntoView({
              behavior: "smooth",
              inline: "start",
              block: "nearest",
            });
          }
        });
        dotsContainer.appendChild(dot);
      });

      resultsTable.appendChild(dotsContainer);

      // Update active dot on scroll
      var scrollTimeout;
      wrapper.addEventListener("scroll", function () {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function () {
          var cards = wrapper.querySelectorAll(".proposal-card");
          var wrapperRect = wrapper.getBoundingClientRect();
          var wrapperCenter = wrapperRect.left + wrapperRect.width / 2;

          var closestIndex = 0;
          var closestDist = Infinity;

          cards.forEach(function (card, idx) {
            var cardRect = card.getBoundingClientRect();
            var cardCenter = cardRect.left + cardRect.width / 2;
            var dist = Math.abs(cardCenter - wrapperCenter);
            if (dist < closestDist) {
              closestDist = dist;
              closestIndex = idx;
            }
          });

          var dots = dotsContainer.querySelectorAll(".carousel-dot");
          dots.forEach(function (d, di) {
            d.classList.toggle("active", di === closestIndex);
          });
        }, 80);
      });
    }

    // Show return link and spam warning
    linkReturn.style.display = "block";
    var spamWarning = document.getElementById("spam-warning");
    if (spamWarning) spamWarning.style.display = "";
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ====== AUTO-RESIZE IFRAME ====== */
function notifyParentHeight() {
  var height = document.querySelector(".App .container").scrollHeight;
  window.parent.postMessage(
    { type: "budgetResize", height: height },
    "https://www.audiotext.com.br/"
  );
}

// Notificar ao trocar de step, ao carregar, e ao redimensionar
  var _originalGoToStep = goToStep;
  goToStep = function (step) {
    _originalGoToStep(step);
    setTimeout(notifyParentHeight, 100);
  };
  
  window.addEventListener("resize", notifyParentHeight);
  new MutationObserver(notifyParentHeight).observe(
    document.querySelector(".App .container"),
    { childList: true, subtree: true, attributes: true }
  );
  setTimeout(notifyParentHeight, 500);

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
