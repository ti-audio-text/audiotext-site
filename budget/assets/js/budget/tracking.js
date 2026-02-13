// Tracking de UTMs no estilo do antigo app.tracking.js

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
    app.tracking.agent.utm_source =
      utmSource || app.tracking.agent.utm_source || "Direct";

    var query = url.replace(/^\?/, "");
    var pairs = query ? query.split("&") : [];

    pairs.forEach(function (p) {
      if (!p) return;
      var parts = p.split("=");
      if (parts.length < 2) return;

      var key = parts[0];
      var rawValue = parts[1];

      if (app.tracking.queryParams.indexOf(key) > -1) {
        var valueDecoded = decoderUtm(rawValue);
        if (typeof valueDecoded === "string" && valueDecoded.length > 0) {
          app.tracking.agent[key] = valueDecoded;
        }
      }

      if (utmSource === "Google") {
        app.tracking.agent.utm_source = "Google";
        if (!app.tracking.agent.utm_medium || app.tracking.agent.utm_medium === "none") {
          app.tracking.agent.utm_medium = "Organic";
        }
      }

      if (utmSource === "Google" && p.indexOf("gclid") > -1) {
        app.tracking.agent.utm_medium = "Google Ads";
      }
    });

    if (app.tracking.agent.utm_source === "Referrer" && referrer) {
      app.tracking.agent.utm_source = app.tracking.extractHostname(referrer);
    }

    if (
      (app.tracking.agent.referrer &&
        app.tracking.agent.utm_source.trim() !== "Direct") ||
      (!app.tracking.agent.referrer &&
        app.tracking.agent.utm_source.trim() !== "Direct") ||
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
      app.cookies.set(app.tracking.cookieKey, joinUtms());
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

