// API client simples para https://api.audiotext.com.br/v1

// IMPORTANTE: não usar "/" inicial no path para o new URL não descartar o /v1
const AT_API_BASE = "https://api.audiotext.com.br/v1/";

async function atApiGet(path, params = {}) {
  const url = new URL(path, AT_API_BASE);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`GET ${path} falhou (${res.status})`);
  }
  return res.json();
}

async function atApiPatch(path, body) {
  const url = new URL(path, AT_API_BASE);
  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH ${path} falhou (${res.status}): ${text}`);
  }
  return res.json();
}

async function atApiPost(path, body) {
  const url = new URL(path, AT_API_BASE);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} falhou (${res.status}): ${text}`);
  }
  return res.json();
}

// Wrapper no estilo antigo app.api.*
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

    const params = {
      sessionCode: sessionCode || "",
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    };

    const data = await atApiGet("budget", params);

    if (data && data.sessionCode) {
      app.cookies.set("audiotext-budget-session", data.sessionCode, 7);
    }

    return data;
  },

  async patch(budget) {
    return atApiPatch("budget", budget);
  },
};

app.api.services = {
  async get() {
    return atApiGet("services", { enabled: true });
  },
};

app.api.finalities = {
  async get() {
    return atApiGet("finalities");
  },
};

app.api.languages = {
  async get() {
    return atApiGet("languages");
  },
};

app.api.meetingChannels = {
  async get() {
    return atApiGet("meeting-channels");
  },
};

app.api.proposals = {
  async generate(budget) {
    return atApiPost("budget/proposals", budget);
  },
  async get(sessionCode) {
    return atApiGet("budget/proposals", { sessionCode });
  },
};

app.api.content = {
  async get() {
    return atApiGet("contents");
  },
};

