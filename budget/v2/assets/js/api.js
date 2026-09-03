// API client do /budget/v2 — mesma superficie do controle (app.api.*),
// com uma diferenca: classifica a resposta de challenge do Bot Protection
// em vez de deixar virar erro generico. Ver incidente de 2026-09-02 no log.

const AT_API_BASE = window.location.origin + "/api/v1/";

// Erro com causa identificada, para a UI escolher a mensagem certa.
function atApiError(message, kind, status) {
  var err = new Error(message);
  err.kind = kind; // "challenge" | "http" | "network" | "parse"
  err.status = status || 0;
  return err;
}

// 429, ou corpo HTML onde se espera JSON, e challenge interativo
// (Vercel Security Checkpoint) — insoluvel por fetch.
function isChallenge(status, contentType, body) {
  if (status === 429) return true;
  var ct = (contentType || "").toLowerCase();
  if (ct.indexOf("text/html") > -1) return true;
  var head = (body || "").slice(0, 200).trim().toLowerCase();
  return head.indexOf("<!doctype") === 0 || head.indexOf("<html") === 0;
}

async function atApiRequest(method, path, params, body) {
  const url = new URL(path, AT_API_BASE);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  let res;
  try {
    res = await fetch(url.toString(), {
      method: method,
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      body: body === undefined ? undefined : JSON.stringify(body || {}),
    });
  } catch (e) {
    throw atApiError(method + " " + path + " falhou (rede)", "network", 0);
  }

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (isChallenge(res.status, contentType, text)) {
    throw atApiError(
      method + " " + path + ": desafio de seguranca (" + res.status + ")",
      "challenge",
      res.status
    );
  }

  if (!res.ok) {
    throw atApiError(
      method + " " + path + " falhou (" + res.status + "): " + text.slice(0, 200),
      "http",
      res.status
    );
  }

  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    throw atApiError(method + " " + path + ": resposta nao e JSON", "parse", res.status);
  }
}

function atApiGet(path, params) {
  return atApiRequest("GET", path, params || {}, undefined);
}
function atApiPatch(path, body) {
  return atApiRequest("PATCH", path, {}, body || {});
}
function atApiPost(path, body) {
  return atApiRequest("POST", path, {}, body || {});
}

window.app = window.app || {};

app.cookies = app.cookies || {
  get: function (name) {
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    return value ? decodeURIComponent(value.split("=")[1]) : null;
  },
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
  remove: function (name) {
    document.cookie =
      name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
  },
};

app.api = app.api || {};
app.api.endpoint = AT_API_BASE;

app.api.budget = {
  async get() {
    const sessionCode = app.cookies.get("audiotext-budget-session");
    const utms = app.cookies.get("audiotext-budget-tracking");

    let utmSource = "";
    let utmMedium = "";
    let utmCampaign = "";
    let utmTerm = "";
    let utmContent = "";

    if (utms) {
      const parts = utms.split("|");
      utmSource = parts[0] || "Direct";
      utmMedium = parts[1] || "none";
      utmCampaign = parts[2] || "none";
      utmTerm = parts[3] || "none";
      utmContent = parts[4] || "none";
    }

    const data = await atApiGet("budget", {
      sessionCode: sessionCode || "",
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    });

    if (data && data.sessionCode) {
      app.cookies.set("audiotext-budget-session", data.sessionCode, 7);
    }

    return data;
  },

  async patch(budget) {
    return atApiPatch("budget", budget);
  },
};

app.api.services = { get: () => atApiGet("services", { enabled: true }) };
app.api.finalities = { get: () => atApiGet("finalities") };
app.api.languages = { get: () => atApiGet("languages") };
app.api.meetingChannels = { get: () => atApiGet("meeting-channels") };

app.api.proposals = {
  generate: (budget) => atApiPost("budget/proposals", budget),
  get: (sessionCode) => atApiGet("budget/proposals", { sessionCode }),
};

app.api.content = { get: () => atApiGet("contents") };
