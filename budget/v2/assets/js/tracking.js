// Tracking de UTMs no estilo do antigo app.tracking.js
// VERSÃO CORRIGIDA - Prioriza UTMs da URL

window.app = window.app || {};

app.tracking = {
  cookieKey: "audiotext-budget-tracking",
  queryParams: ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"],
  agent: {
    referrer: "",
    utm_source: "Direct",
    utm_medium: "none",
    utm_campaign: "none",
    utm_term: "none",
    utm_content: "none",
  },

  run: function () {
    var referrer = document.referrer || "";
    var url = window.location.search || "";

    console.log('[Budget Tracking] Iniciando...');
    console.log('[Budget Tracking] Referrer:', referrer);
    console.log('[Budget Tracking] URL params:', url);

    if (!referrer.trim()) {
      return app.tracking.buildUtms(referrer, "Direct", url);
    } else if (referrer.match(/google\./)) {
      return app.tracking.buildUtms(referrer, "Google", url);
    } else if (referrer.match(/facebook\./)) {
      return app.tracking.buildUtms(referrer, "Facebook", url);
    } else if (referrer.match(/instagram\./)) {
      return app.tracking.buildUtms(referrer, "Instagram", url);
    } else if (referrer.match(/pinterest\./)) {
      return app.tracking.buildUtms(referrer, "Pinterest", url);
    } else if (referrer.match(/twitter\./)) {
      return app.tracking.buildUtms(referrer, "Twitter", url);
    } else if (referrer.match(/slack\./)) {
      return app.tracking.buildUtms(referrer, "Slack", url);
    } else {
      return app.tracking.buildUtms(referrer, "Referrer", url);
    }
  },

  buildUtms: function (referrer, utmSource, url) {
    url = typeof url === "string" ? url : "";

    app.tracking.agent.referrer = referrer || "";

    // PRIORIDADE 1: Ler UTMs da URL PRIMEIRO
    var query = url.replace(/^\?/, "");
    var pairs = query ? query.split("&") : [];
    var hasUtmsInUrl = false;

    pairs.forEach(function (p) {
      if (!p) return;
      var parts = p.split("=");
      if (parts.length < 2) return;

      var key = parts[0];
      var rawValue = parts[1];

      // Capturar UTMs da URL
      if (app.tracking.queryParams.indexOf(key) > -1) {
        var valueDecoded = decoderUtm(rawValue);
        if (typeof valueDecoded === "string" && valueDecoded.length > 0) {
          app.tracking.agent[key] = valueDecoded;
          if (key === 'utm_source') hasUtmsInUrl = true;
        }
      }

      // Detectar Google Ads (gclid)
      if (p.indexOf("gclid") > -1) {
        app.tracking.agent.utm_source = "Google";
        app.tracking.agent.utm_medium = "Google Ads";
        hasUtmsInUrl = true;
      }
    });

    // PRIORIDADE 2: Se NÃO tem UTMs na URL, usar referrer
    if (!hasUtmsInUrl) {
      if (utmSource === "Google") {
        app.tracking.agent.utm_source = "Google";
        if (!app.tracking.agent.utm_medium || app.tracking.agent.utm_medium === "none") {
          app.tracking.agent.utm_medium = "Organic";
        }
      } else if (utmSource === "Referrer" && referrer) {
        app.tracking.agent.utm_source = app.tracking.extractHostname(referrer);
      } else {
        app.tracking.agent.utm_source = utmSource || "Direct";
      }
    }

    console.log('[Budget Tracking] UTMs capturadas:', app.tracking.agent);

    // Salvar cookie
    if (
      (app.tracking.agent.referrer && app.tracking.agent.utm_source.trim() !== "Direct") ||
      (!app.tracking.agent.referrer && app.tracking.agent.utm_source.trim() !== "Direct") ||
      !app.cookies.get(app.tracking.cookieKey)
    ) {
      app.cookies.remove(app.tracking.cookieKey);
      var joinUtms = function () {
        return (
          app.tracking.agent.utm_source +
          "|" +
          app.tracking.agent.utm_medium +
          "|" +
          app.tracking.agent.utm_campaign +
          "|" +
          app.tracking.agent.utm_term +
          "|" +
          app.tracking.agent.utm_content
        );
      };
      var cookieValue = joinUtms();
      app.cookies.set(app.tracking.cookieKey, cookieValue);
      console.log('[Budget Tracking] Cookie criado:', cookieValue);
    } else {
      console.log('[Budget Tracking] Cookie já existe:', app.cookies.get(app.tracking.cookieKey));
    }
  },

  extractHostname: function (url) {
    var hostname = "";
    if (url.indexOf("//") > -1) {
      hostname = url.split("/")[2];
    } else {
      hostname = url.split("/")[0];
    }
    hostname = hostname.split(":")[0];
    hostname = hostname.split("?")[0];
    return hostname;
  },
};

function decoderUtm(uncodedUtm) {
  if (typeof uncodedUtm !== "string") {
    return uncodedUtm;
  }
  var normalized = uncodedUtm.replace(/\+/g, " ").replace(/%20/g, " ");
  try {
    return decodeURIComponent(normalized);
  } catch (e) {
    return uncodedUtm;
  }
}
