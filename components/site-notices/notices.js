/*
  Componente de avisos do site.

  Entrada única: uma linha de <script defer> nas páginas públicas. Este
  arquivo carrega sozinho a config e o CSS do próprio módulo.

  Não toca em dataLayer, GTM, consent, formulários nem no iframe do
  orçamento. Sem dependência externa. Fora da janela de datas o componente
  não renderiza nada e não registra listener nenhum.

  Para mudar o aviso, edite notices-config.js. Não é preciso mexer aqui.
*/

(function () {
  "use strict";

  var BASE = "/components/site-notices/";
  var PREFIXO_STORAGE = "at-notice-dismissed:";
  var Z_INDEX_ABAIXO_DO_CONSENT = 9000; // consent usa 9998/9999/10000

  /* ---------- storage tolerante ---------- */
  function jaFechou(id) {
    try {
      return localStorage.getItem(PREFIXO_STORAGE + id) === "1";
    } catch (e) {
      return false; // storage bloqueado: mostra, e o fechamento vale pela sessão
    }
  }

  function marcaFechado(id) {
    try {
      localStorage.setItem(PREFIXO_STORAGE + id, "1");
    } catch (e) {
      /* sem storage o aviso volta na próxima visita, e tudo bem */
    }
  }

  /* ---------- janela de datas ---------- */
  function dentroDaJanela(aviso, agora) {
    if (!aviso || !aviso.id || !aviso.inicio || !aviso.fim) return false;
    var inicio = Date.parse(aviso.inicio);
    var fim = Date.parse(aviso.fim);
    if (isNaN(inicio) || isNaN(fim)) return false;
    return agora >= inicio && agora <= fim;
  }

  function avisoAtivo() {
    var lista = window.AT_SITE_NOTICES;
    if (!Array.isArray(lista) || !lista.length) return null;
    var agora = Date.now();
    for (var i = 0; i < lista.length; i++) {
      if (dentroDaJanela(lista[i], agora)) return lista[i];
    }
    return null;
  }

  /* ---------- render ---------- */
  function carregaCss() {
    if (document.querySelector('link[data-at-notices="1"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = BASE + "notices.css";
    link.setAttribute("data-at-notices", "1");
    document.head.appendChild(link);
  }

  function renderiza(aviso) {
    if (document.getElementById("at-notice")) return;
    carregaCss();

    var caixa = document.createElement("aside");
    caixa.id = "at-notice";
    caixa.className = "at-notice";
    caixa.setAttribute("role", "status");
    caixa.setAttribute("aria-live", "polite");
    caixa.setAttribute("aria-label", aviso.titulo || "Aviso");

    var fechar = document.createElement("button");
    fechar.type = "button";
    fechar.className = "at-notice-x";
    fechar.setAttribute("aria-label", "Fechar aviso");
    fechar.textContent = "×";

    var titulo = document.createElement("p");
    titulo.className = "at-notice-titulo";
    titulo.textContent = aviso.titulo || "";

    var corpo = document.createElement("p");
    corpo.className = "at-notice-corpo";
    corpo.textContent = aviso.corpo || "";

    var ok = document.createElement("button");
    ok.type = "button";
    ok.className = "at-notice-botao";
    ok.textContent = aviso.botao || "Entendi";

    caixa.appendChild(fechar);
    caixa.appendChild(titulo);
    caixa.appendChild(corpo);
    caixa.appendChild(ok);
    caixa.style.zIndex = String(Z_INDEX_ABAIXO_DO_CONSENT);

    function encerra() {
      marcaFechado(aviso.id);
      caixa.classList.add("at-notice-saindo");
      document.removeEventListener("keydown", aoTeclar);
      setTimeout(function () {
        if (caixa.parentNode) caixa.parentNode.removeChild(caixa);
      }, 200);
    }

    function aoTeclar(ev) {
      // Não chama preventDefault nem stopPropagation: o Esc do modal do
      // orçamento e de qualquer outro componente continua funcionando.
      if (ev.key === "Escape" || ev.keyCode === 27) encerra();
    }

    fechar.addEventListener("click", encerra);
    ok.addEventListener("click", encerra);
    document.addEventListener("keydown", aoTeclar);

    document.body.appendChild(caixa);
    // A classe de entrada só entra no frame seguinte, para a transição rodar.
    requestAnimationFrame(function () {
      caixa.classList.add("at-notice-visivel");
    });
  }

  /* ---------- boot ---------- */
  function decide() {
    var aviso = avisoAtivo();
    if (!aviso) return; // fora de janela ou lista vazia: nada acontece
    if (jaFechou(aviso.id)) return;
    if (document.body) {
      renderiza(aviso);
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        renderiza(aviso);
      });
    }
  }

  function carregaConfigEDecide() {
    if (window.AT_SITE_NOTICES) {
      decide();
      return;
    }
    var s = document.createElement("script");
    s.src = BASE + "notices-config.js";
    s.defer = true;
    s.onload = decide;
    s.onerror = function () {
      /* sem config não há aviso: falha silenciosa, nada quebra */
    };
    document.head.appendChild(s);
  }

  carregaConfigEDecide();
})();
