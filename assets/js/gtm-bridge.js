/**
 * GTM Bridge — Audiotext
 * Recebe postMessages do iframe do budget e empurra para o dataLayer do GTM.
 * Adicionar em TODAS as páginas que têm o modal de orçamento.
 * 
 * Uso: <script src="/assets/js/gtm-bridge.js"></script> (antes do </body>)
 */

(function() {
  'use strict';

  window.dataLayer = window.dataLayer || [];

  // ============================================================================
  // 1. RASTREAR ABERTURA DO MODAL (CTA Click)
  // ============================================================================

  var _originalOpenBudgetModal = window.openBudgetModal;
  
  // Espera o openBudgetModal ser definido, depois faz override
  function wrapOpenBudgetModal() {
    if (typeof window.openBudgetModal === 'function' && !window._gtmBridgeWrapped) {
      var original = window.openBudgetModal;
      window.openBudgetModal = function() {
        // Push CTA click para o dataLayer
        window.dataLayer.push({
          'event': 'cta_click',
          'button_text': 'Simular orçamento',
          'page_location': window.location.href,
          'page_title': document.title
        });
        console.log('[GTM Bridge] cta_click pushed');
        
        // Chamar função original
        original.apply(this, arguments);
      };
      window._gtmBridgeWrapped = true;
    }
  }

  // Tentar wrapping imediatamente e como fallback
  wrapOpenBudgetModal();
  document.addEventListener('DOMContentLoaded', wrapOpenBudgetModal);
  setTimeout(wrapOpenBudgetModal, 1000);

  // ============================================================================
  // 2. ESCUTAR postMessages DO IFRAME DO BUDGET
  // ============================================================================

  window.addEventListener('message', function(e) {
    // Segurança: só aceitar mensagens da mesma origem
    if (e.origin !== window.location.origin) return;

    var data = e.data;

    // --- CONVERSÃO PRINCIPAL: Orçamento enviado ---
    if (data && data.type === 'budget_submitted') {
      window.dataLayer.push({
        'event': 'generate_lead',
        'form_name': 'orcamento',
        'service_type': data.service || '',
        'page_location': window.location.href,
        // Dados para Enhanced Conversions (Google Ads)
        'user_email': data.email || '',
        'user_phone': data.phone || '',
        'user_name': data.name || ''
      });
      console.log('[GTM Bridge] generate_lead pushed', data);
    }

    // --- Step 1 concluído (dados do serviço preenchidos) ---
    if (data && data.type === 'budget_step1_complete') {
      window.dataLayer.push({
        'event': 'form_step1_complete',
        'form_name': 'orcamento',
        'service_type': data.service || '',
        'page_location': window.location.href
      });
      console.log('[GTM Bridge] form_step1_complete pushed');
    }

    // --- Proposta escolhida (clicou no botão de enviar arquivos) ---
    if (data === 'openTransfer') {
      window.dataLayer.push({
        'event': 'proposal_accepted',
        'form_name': 'orcamento',
        'page_location': window.location.href
      });
      console.log('[GTM Bridge] proposal_accepted pushed');
    }

    // --- Modal fechado ---
    if (data === 'closePopUpAppReact') {
      window.dataLayer.push({
        'event': 'budget_modal_closed',
        'page_location': window.location.href
      });
      console.log('[GTM Bridge] budget_modal_closed pushed');
    }

    // Fallback: string legada "gerarPropostas" (caso app.js antigo)
    if (data === 'gerarPropostas') {
      // Só empurrar se NÃO recebeu budget_submitted (evitar duplicata)
      if (!window._gtmBridgeBudgetSubmitted) {
        window.dataLayer.push({
          'event': 'generate_lead',
          'form_name': 'orcamento',
          'page_location': window.location.href
        });
        console.log('[GTM Bridge] generate_lead pushed (fallback)');
      }
    }

    // Marcar que budget foi submetido (para evitar duplicata)
    if (data && data.type === 'budget_submitted') {
      window._gtmBridgeBudgetSubmitted = true;
      // Reset após 5s para permitir novo orçamento
      setTimeout(function() { window._gtmBridgeBudgetSubmitted = false; }, 5000);
    }

  });

  console.log('[GTM Bridge] Inicializado');

})();
