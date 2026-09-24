/**
 * click-id.js
 * Captura o identificador de clique de anuncio na chegada e guarda em cookie
 * proprio, para que o /budget consiga enviar o valor junto do lead.
 *
 * Por que existe: o iframe do /budget so carrega quando o visitante abre o
 * modal. Quem chega por anuncio e navega antes disso perdia o identificador,
 * porque ele so vive na query string da primeira pagina.
 *
 * Regras:
 * - captura gclid, gbraid e wbraid (campanhas em iOS nao mandam gclid)
 * - last click ganha: uma chegada nova por anuncio sobrescreve a anterior
 * - cookie proprio de 1st party, path=/, 90 dias, SameSite=Lax
 * - em producao o cookie sobe para .audiotext.com.br, para que o app
 *   (app.audiotext.com.br) enxergue o identificador; fora do dominio real,
 *   em preview e em localhost, ele continua host-only
 * - se o visitante rejeitar cookies de marketing no banner, o cookie e apagado
 *
 * Nao altera o cookieConsent.js. A integracao e por leitura da preferencia que
 * ele ja grava em localStorage.
 */
(function () {
  "use strict";

  var COOKIE_NAME = "at_click_id";
  var COOKIE_DAYS = 90;
  var CONSENT_KEY = "audiotext_cookie_preferences";

  // Ordem de precedencia: o primeiro encontrado na URL ganha.
  var CLICK_PARAMS = ["gclid", "gbraid", "wbraid"];

  // Escopo do cookie. No dominio real ele sobe para o dominio pai, senao o app
  // em app.audiotext.com.br nao o enxerga. Em preview (*.vercel.app) e em
  // localhost o navegador REJEITA esse Domain em silencio, e o cookie nao
  // chegaria a ser gravado, entao ali ele segue host-only, como antes.
  var ATRIBUTO_DOMINIO = /(^|\.)audiotext\.com\.br$/i.test(
    window.location.hostname
  )
    ? "; domain=.audiotext.com.br"
    : "";

  // Um cookie e identificado por nome, dominio e path. As duas variantes
  // possiveis do mesmo nome precisam ser tratadas juntas, senao sobra uma viva.
  var EXPIRA_NO_PASSADO =
    "; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; SameSite=Lax";

  // Ids dos controles do banner de cookies. Servem apenas como gatilho para
  // reavaliar a preferencia salva, nunca para alterar o comportamento dele.
  var CONSENT_CONTROLS = [
    "cookie-accept",
    "cookie-reject",
    "modal-accept-all",
    "modal-save"
  ];

  // Identificadores de clique sao alfanumericos. Validar evita que um valor
  // forjado na URL injete atributos no cookie.
  var VALID_VALUE = /^[A-Za-z0-9._-]{1,256}$/;

  function setCookie(name, value, days) {
    try {
      var expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      // Apaga a variante host-only gravada antes de o cookie subir para o
      // dominio pai. Sem isso o navegador guarda as duas ao mesmo tempo e a
      // leitura pode devolver o clique antigo, porque a ordem em que
      // document.cookie lista os valores nao e garantida.
      if (ATRIBUTO_DOMINIO) {
        document.cookie = name + "=" + EXPIRA_NO_PASSADO;
      }
      document.cookie =
        name +
        "=" +
        value +
        "; expires=" +
        expires.toUTCString() +
        "; path=/; SameSite=Lax" +
        ATRIBUTO_DOMINIO;
      return true;
    } catch (e) {
      return false;
    }
  }

  function deleteCookie(name) {
    try {
      // Host-only primeiro, depois a de dominio. Apagar so uma deixaria a
      // outra viva, e a recusa de marketing no banner precisa remover as duas.
      document.cookie = name + "=" + EXPIRA_NO_PASSADO;
      if (ATRIBUTO_DOMINIO) {
        document.cookie = name + "=" + EXPIRA_NO_PASSADO + ATRIBUTO_DOMINIO;
      }
    } catch (e) {
      // sem acao: navegador bloqueou o acesso a cookies
    }
  }

  function getCookie(name) {
    try {
      var row = document.cookie.split("; ").filter(function (item) {
        return item.indexOf(name + "=") === 0;
      })[0];
      return row ? row.split("=").slice(1).join("=") : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Le a preferencia gravada pelo banner.
   * Retorna true somente quando o visitante decidiu e recusou marketing.
   * Enquanto nao houver decisao, retorna false: a captura acontece com base em
   * legitimo interesse, conforme declarado na politica de privacidade.
   */
  function marketingRejected() {
    try {
      var stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) return false;
      var prefs = JSON.parse(stored);
      return prefs && prefs.marketing === false;
    } catch (e) {
      return false;
    }
  }

  function readFromQuery() {
    var search = window.location.search || "";
    if (!search) return null;

    var query = search.replace(/^\?/, "");
    var pairs = query ? query.split("&") : [];
    var found = {};

    pairs.forEach(function (pair) {
      if (!pair) return;
      var parts = pair.split("=");
      if (parts.length < 2) return;
      var key = parts[0];
      if (CLICK_PARAMS.indexOf(key) === -1) return;
      if (found[key]) return;

      var value;
      try {
        value = decodeURIComponent(parts.slice(1).join("="));
      } catch (e) {
        value = parts.slice(1).join("=");
      }
      if (VALID_VALUE.test(value)) {
        found[key] = value;
      }
    });

    for (var i = 0; i < CLICK_PARAMS.length; i++) {
      var name = CLICK_PARAMS[i];
      if (found[name]) {
        return { value: found[name], type: name };
      }
    }
    return null;
  }

  function capture() {
    var clickId = readFromQuery();
    if (!clickId) return;
    // Formato: valor|tipo|timestamp
    setCookie(
      COOKIE_NAME,
      clickId.value + "|" + clickId.type + "|" + Date.now(),
      COOKIE_DAYS
    );
  }

  /**
   * Reavalia a decisao de cookies e alinha o estado do cookie a ela.
   * Recusou marketing: apaga. Aceitou ou ainda nao decidiu: captura, caso a
   * URL corrente ainda traga um identificador.
   */
  function reconcile() {
    if (marketingRejected()) {
      if (getCookie(COOKIE_NAME)) {
        deleteCookie(COOKIE_NAME);
      }
      return;
    }
    capture();
  }

  function onConsentClick(event) {
    var target = event.target;
    while (target && target !== document) {
      if (target.id && CONSENT_CONTROLS.indexOf(target.id) > -1) {
        // O banner grava a preferencia no proprio handler do clique. O timeout
        // garante que a leitura aconteca depois dessa gravacao.
        window.setTimeout(reconcile, 0);
        return;
      }
      target = target.parentNode;
    }
  }

  reconcile();

  document.addEventListener("click", onConsentClick, true);

  // Decisao tomada em outra aba do mesmo site.
  window.addEventListener("storage", function (event) {
    if (event && event.key === CONSENT_KEY) {
      reconcile();
    }
  });
})();
