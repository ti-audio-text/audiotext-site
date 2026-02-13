// Controle da UI e fluxo do orçamento no projeto puro

(function () {
  const step1Form = document.getElementById("form-step-1");
  const step2Form = document.getElementById("form-step-2");
  const stepIndicator = document.getElementById("step-indicator");
  const loader = document.getElementById("loader");
  const errorBox = document.getElementById("error-box");
  const resultsSection = document.getElementById("results-section");
  const resultsText = document.getElementById("results-text");
  const resultsTable = document.getElementById("results-table");

  const step1Fields = {
    username: document.getElementById("username"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    company: document.getElementById("company"),
    serviceCode: document.getElementById("serviceCode"),
    participantsAmount: document.getElementById("participantsAmount"),
    isWhatsApp: document.getElementById("isWhatsApp"),
  };

  const step2Fields = {
    amount: document.getElementById("amount"),
    finalityCode: document.getElementById("finalityCode"),
    languageCode: document.getElementById("languageCode"),
    howDidMeetUs: document.getElementById("howDidMeetUs"),
    observation: document.getElementById("observation"),
  };

  let csrfToken = "";
  let sessionCode = "";

  function setLoading(isLoading, message) {
    if (isLoading) {
      loader.classList.remove("hidden");
      loader.textContent = message || "Carregando...";
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

  function goToStep(step) {
    if (step === 1) {
      step1Form.classList.add("active");
      step2Form.classList.remove("active");
      stepIndicator.textContent = "Etapa 1 de 2";
    } else {
      step1Form.classList.remove("active");
      step2Form.classList.add("active");
      stepIndicator.textContent = "Etapa 2 de 2";
    }
  }

  function fillStep1FromBudget(budget) {
    if (!budget) return;

    step1Fields.username.value = budget.username || "";
    step1Fields.email.value = budget.email || "";
    step1Fields.phone.value = budget.phone || "";
    step1Fields.company.value = budget.company || "";
    step1Fields.serviceCode.value = budget.serviceCode || "";
    step1Fields.participantsAmount.value =
      budget.participantsAmount || step1Fields.participantsAmount.value || 1;
    step1Fields.isWhatsApp.checked = !!budget.isWhatsApp;
  }

  function fillStep2FromBudget(budget) {
    if (!budget) return;
    step2Fields.amount.value = budget.amount || "";
    step2Fields.finalityCode.value = budget.finalityCode || "";
    step2Fields.languageCode.value = budget.languageCode || "";
    step2Fields.howDidMeetUs.value = budget.howDidMeetUs || "";
    step2Fields.observation.value = budget.observation || "";
  }

  async function loadStaticData() {
    try {
      setLoading(true, "Carregando opções...");

      const [servicesRes, finalitiesRes, languagesRes, meetingChannelsRes] =
        await Promise.all([
          app.api.services.get(),
          app.api.finalities.get(),
          app.api.languages.get(),
          app.api.meetingChannels.get(),
        ]);

      // Serviços
      step1Fields.serviceCode.innerHTML =
        '<option value="">Selecione o serviço</option>';
      (servicesRes || []).forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.code;
        opt.textContent = s.name;
        step1Fields.serviceCode.appendChild(opt);
      });

      // Finalidades
      step2Fields.finalityCode.innerHTML =
        '<option value="">Selecione a finalidade</option>';
      (finalitiesRes || []).forEach((f) => {
        const opt = document.createElement("option");
        opt.value = f.code;
        opt.textContent = f.name;
        step2Fields.finalityCode.appendChild(opt);
      });

      // Idiomas
      step2Fields.languageCode.innerHTML =
        '<option value="">Selecione o idioma</option>';
      (languagesRes || []).forEach((l) => {
        const opt = document.createElement("option");
        opt.value = l.code;
        opt.textContent = l.name;
        step2Fields.languageCode.appendChild(opt);
      });

      // Canais de como nos conheceu
      step2Fields.howDidMeetUs.innerHTML =
        '<option value="">Como nos conheceu?</option>';
      if (Array.isArray(meetingChannelsRes) && meetingChannelsRes.length) {
        meetingChannelsRes.forEach((m) => {
          const opt = document.createElement("option");
          opt.value = m;
          opt.textContent = m;
          step2Fields.howDidMeetUs.appendChild(opt);
        });
      } else {
        ["Já sou cliente", "Indicação", "Google", "Outro"].forEach((m) => {
          const opt = document.createElement("option");
          opt.value = m;
          opt.textContent = m;
          step2Fields.howDidMeetUs.appendChild(opt);
        });
      }
    } catch (e) {
      console.error(e);
      showError("Erro ao carregar dados iniciais. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function loadBudget() {
    try {
      setLoading(true, "Carregando orçamento...");
      const data = await app.api.budget.get();
      if (data) {
        sessionCode = data.sessionCode || data.budget?.sessionCode || "";
        csrfToken = data.csrfToken || "";
        const budget = data.budget || data;
        fillStep1FromBudget(budget);
        fillStep2FromBudget(budget);
      }
    } catch (e) {
      console.error(e);
      showError("Erro ao carregar orçamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  step1Form.addEventListener("submit", async function (event) {
    event.preventDefault();
    showError("");

    const payload = {
      username: step1Fields.username.value.trim(),
      email: step1Fields.email.value.trim(),
      phone: step1Fields.phone.value.trim(),
      company: step1Fields.company.value.trim() || null,
      serviceCode: step1Fields.serviceCode.value,
      participantsAmount:
        Number(step1Fields.participantsAmount.value) || 1,
      isWhatsApp: step1Fields.isWhatsApp.checked,
      sessionCode: sessionCode || app.cookies.get("audiotext-budget-session"),
      _csrf: csrfToken || null,
    };

    if (!payload.username || !payload.email || !payload.phone || !payload.serviceCode) {
      showError("Preencha todos os campos obrigatórios da etapa 1.");
      return;
    }

    try {
      setLoading(true, "Salvando dados...");
      const res = await app.api.budget.patch(payload);
      const budget = res.budget || res;
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

  document
    .getElementById("btn-prev")
    .addEventListener("click", function () {
      goToStep(1);
    });

  step2Form.addEventListener("submit", async function (event) {
    event.preventDefault();
    showError("");
    resultsSection.classList.add("hidden");
    resultsText.innerHTML = "";
    resultsTable.innerHTML = "";

    const payloadBudget = {
      amount: Number(step2Fields.amount.value) || null,
      finalityCode: step2Fields.finalityCode.value,
      languageCode: step2Fields.languageCode.value,
      howDidMeetUs: step2Fields.howDidMeetUs.value,
      observation: step2Fields.observation.value || null,
      sessionCode: sessionCode || app.cookies.get("audiotext-budget-session"),
      _csrf: csrfToken || null,
    };

    if (
      !payloadBudget.amount ||
      !payloadBudget.finalityCode ||
      !payloadBudget.languageCode ||
      !payloadBudget.howDidMeetUs
    ) {
      showError("Preencha todos os campos obrigatórios da etapa 2.");
      return;
    }

    try {
      setLoading(true, "Gerando propostas...");

      const saved = await app.api.budget.patch(payloadBudget);
      const budgetSaved = saved.budget || saved;
      sessionCode = budgetSaved.sessionCode || sessionCode;

      const proposalsResponse = await app.api.proposals.generate({
        budget: {
          ...budgetSaved,
          sessionCode,
        },
        sessionCode,
        csrfToken,
      });

      if (proposalsResponse.hasErrors) {
        console.error(proposalsResponse.errors);
        showError("Ocorreram erros ao gerar propostas.");
        return;
      }

      const finalBudget = proposalsResponse.budget || proposalsResponse;
      renderResults(finalBudget);
    } catch (e) {
      console.error(e);
      showError("Erro ao gerar propostas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  });

  function renderResults(budget) {
    if (!budget) return;
    resultsSection.classList.remove("hidden");

    if (budget.text) {
      resultsText.innerHTML = budget.text;
    } else {
      resultsText.textContent =
        "Confira abaixo as opções de prazo e pagamento para o seu orçamento.";
    }

    const proposals = budget.proposals || [];
    if (!proposals.length) {
      resultsTable.textContent =
        "Nenhuma proposta foi gerada para os dados informados.";
      return;
    }

    resultsTable.innerHTML = "";

    proposals.forEach((p) => {
      const card = document.createElement("div");
      card.className = "at-proposal-card";

      const plan = document.createElement("div");
      plan.className = "at-proposal-plan";
      plan.textContent = p.plan;

      const cash = document.createElement("div");
      cash.className = "at-proposal-line";
      cash.textContent = "À vista: " + (p.cashPirce || p.cashPrice || "");

      const installment = document.createElement("div");
      installment.className = "at-proposal-line";
      installment.textContent =
        "Parcelado: " + (p.installmentPrice || p.installmentValue || "");

      const deadline = document.createElement("div");
      deadline.className = "at-proposal-line";
      deadline.textContent = "Prazo: " + (p.deadline || "") + " dias úteis";

      card.appendChild(plan);
      card.appendChild(cash);
      card.appendChild(installment);
      card.appendChild(deadline);
      resultsTable.appendChild(card);
    });
  }

  (async function init() {
    try {
      showError("");
      setLoading(true, "Inicializando...");
      if (window.app && app.tracking && typeof app.tracking.run === "function") {
        app.tracking.run();
      }
      await loadStaticData();
      await loadBudget();
      goToStep(1);
    } catch (e) {
      console.error(e);
      showError("Erro ao inicializar o simulador.");
    } finally {
      setLoading(false);
    }
  })();
})();

