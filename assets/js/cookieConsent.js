/**
 * Cookie Consent System - Audiotext (audiotext.com.br)
 * Versão: 2.0 — Consent Mode v2 + GTM como controlador único
 * Data: 2026-02-16
 * 
 * ARQUITETURA:
 * 1. Este script define o Consent Mode v2 ANTES de qualquer tag Google
 * 2. O GTM é carregado SEMPRE (com consent mode restritivo por padrão)
 * 3. O GTM controla GA4, Google Ads, Meta Pixel — tudo via suas tags internas
 * 4. Quando o usuário consente, atualizamos o consent mode e o GTM reage automaticamente
 * 5. NÃO carregamos Meta Pixel nem Google Ads fora do GTM
 */

(function() {
  'use strict';

  // ============================================================================
  // CONFIGURAÇÃO
  // ============================================================================

  const CONFIG = {
    storageKey: 'audiotext_cookie_preferences',
    gtmId: 'GTM-K8PJKT6',
    privacyPolicyUrl: '/legal#cookies',
    bannerDelay: 500,
  };

  // ============================================================================
  // CONSENT MODE v2 — DEVE RODAR ANTES DE QUALQUER TAG GOOGLE
  // ============================================================================

  // Inicializa dataLayer e gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  // Define consent padrão RESTRITIVO (antes do GTM carregar)
  // Isso garante que nenhuma tag Google dispare sem consentimento
  function setDefaultConsent() {
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'functionality_storage': 'granted',  // Essenciais sempre permitidos
      'security_storage': 'granted',       // Segurança sempre permitida
      'wait_for_update': 500               // Espera 500ms por atualização do consent
    });

    // Ativa URL passthrough para manter atribuição mesmo sem cookies
    gtag('set', 'url_passthrough', true);
    
    // Ativa redação de dados de anúncios
    gtag('set', 'ads_data_redaction', true);
  }

  // Atualiza consent com base nas preferências do usuário
  function updateConsent(prefs) {
    gtag('consent', 'update', {
      'ad_storage': prefs.marketing ? 'granted' : 'denied',
      'ad_user_data': prefs.marketing ? 'granted' : 'denied',
      'ad_personalization': prefs.marketing ? 'granted' : 'denied',
      'analytics_storage': prefs.analytics ? 'granted' : 'denied',
    });
    console.log('[CookieConsent] Consent Mode atualizado:', {
      analytics: prefs.analytics ? 'granted' : 'denied',
      marketing: prefs.marketing ? 'granted' : 'denied'
    });
  }

  // ============================================================================
  // CARREGAMENTO DO GTM — SEMPRE CARREGA (consent mode controla as tags)
  // ============================================================================

  function loadGTM() {
    // Não duplicar se já existe no HTML
    if (document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) {
      console.log('[CookieConsent] GTM já presente no HTML');
      return;
    }

    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),
          dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',CONFIG.gtmId);

    console.log('[CookieConsent] GTM carregado:', CONFIG.gtmId);
  }

  // ============================================================================
  // FUNÇÕES DE STORAGE
  // ============================================================================

  function getStoredPreferences() {
    try {
      const stored = localStorage.getItem(CONFIG.storageKey);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error('[CookieConsent] Erro ao carregar preferências:', error);
      return null;
    }
  }

  function savePreferences(prefs) {
    const data = {
      essential: true,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      timestamp: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
      console.log('[CookieConsent] Preferências salvas:', data);
      return true;
    } catch (error) {
      console.error('[CookieConsent] Erro ao salvar preferências:', error);
      return false;
    }
  }

  function hasConsent() {
    return getStoredPreferences() !== null;
  }

  function acceptAll() {
    const prefs = { analytics: true, marketing: true };
    savePreferences(prefs);
    updateConsent(prefs);
  }

  function rejectNonEssential() {
    const prefs = { analytics: false, marketing: false };
    savePreferences(prefs);
    updateConsent(prefs);
  }

  // ============================================================================
  // CRIAÇÃO DO HTML - BANNER
  // ============================================================================

  function createBannerHTML() {
    return `
      <div id="cookie-banner" class="cookie-banner" role="dialog" aria-label="Consentimento de cookies" aria-modal="true">
        <div class="cookie-banner-content">
          <div class="cookie-banner-text">
            <div class="cookie-banner-header">
              <span class="cookie-icon" role="img" aria-label="Cookie">🍪</span>
              <div>
                <h2 class="cookie-banner-title">Cookies e Privacidade</h2>
                <span class="cookie-banner-description">
                  Usamos cookies para melhorar sua experiência. 
                  <a href="${CONFIG.privacyPolicyUrl}" target="_blank" rel="noopener noreferrer" class="cookie-link">
                    Saiba mais
                    <svg class="cookie-link-icon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </a>
                </span>
              </div>
            </div>
          </div>
          
          <div class="cookie-banner-buttons">
            <button id="cookie-accept" class="cookie-btn cookie-btn-primary" aria-label="Aceitar todos os cookies">
              Aceitar
            </button>
            <button id="cookie-reject" class="cookie-btn cookie-btn-secondary" aria-label="Rejeitar cookies não essenciais">
              Rejeitar
            </button>
            <button id="cookie-customize" class="cookie-btn cookie-btn-ghost" aria-label="Personalizar preferências de cookies">
              Personalizar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function createModalHTML() {
    const prefs = getStoredPreferences() || { analytics: false, marketing: false };
    
    return `
      <div id="cookie-modal" class="cookie-modal" style="display:none;">
        <div id="modal-overlay" class="cookie-modal-overlay"></div>
        <div class="cookie-modal-container" role="dialog" aria-label="Preferências de cookies" aria-modal="true">
          <div class="cookie-modal-header">
            <h2 class="cookie-modal-title">Preferências de Cookies</h2>
            <p class="cookie-modal-subtitle">
              Escolha quais cookies deseja aceitar. Cookies essenciais são necessários para o funcionamento do site.
            </p>
          </div>

          <div class="cookie-preferences">
            <!-- Essential Cookies -->
            <div class="cookie-preference-item">
              <div class="cookie-preference-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-essential"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div class="cookie-preference-content">
                <div class="cookie-preference-header">
                  <label class="cookie-preference-label">Essenciais</label>
                  <label class="cookie-toggle cookie-toggle-disabled">
                    <input type="checkbox" checked disabled>
                    <span class="cookie-toggle-slider"></span>
                  </label>
                </div>
                <p class="cookie-preference-description">
                  Necessários para o funcionamento básico do site. Não podem ser desativados.
                </p>
                <p class="cookie-preference-examples">
                  Exemplos: sessão, preferências de cookies
                </p>
              </div>
            </div>

            <div class="cookie-divider"></div>

            <!-- Analytics Cookies -->
            <div class="cookie-preference-item">
              <div class="cookie-preference-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-analytics"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
              </div>
              <div class="cookie-preference-content">
                <div class="cookie-preference-header">
                  <label for="analytics-toggle" class="cookie-preference-label">Análise e Performance</label>
                  <label class="cookie-toggle">
                    <input type="checkbox" id="analytics-toggle" ${prefs.analytics ? 'checked' : ''}>
                    <span class="cookie-toggle-slider"></span>
                  </label>
                </div>
                <p class="cookie-preference-description">
                  Nos ajudam a entender como você usa a plataforma para melhorarmos a experiência.
                </p>
                <p class="cookie-preference-examples">
                  Exemplos: Google Analytics (GA4), análise de uso
                </p>
              </div>
            </div>

            <div class="cookie-divider"></div>

            <!-- Marketing Cookies -->
            <div class="cookie-preference-item">
              <div class="cookie-preference-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-marketing"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
              </div>
              <div class="cookie-preference-content">
                <div class="cookie-preference-header">
                  <label for="marketing-toggle" class="cookie-preference-label">Marketing e Publicidade</label>
                  <label class="cookie-toggle">
                    <input type="checkbox" id="marketing-toggle" ${prefs.marketing ? 'checked' : ''}>
                    <span class="cookie-toggle-slider"></span>
                  </label>
                </div>
                <p class="cookie-preference-description">
                  Permitem exibir anúncios personalizados e rastrear conversões.
                </p>
                <p class="cookie-preference-examples">
                  Exemplos: Meta Pixel (Facebook Ads), Google Ads Tag
                </p>
                <div class="cookie-warning">
                  <span class="cookie-warning-icon">⚠️</span>
                  <p class="cookie-warning-text">
                    Se desabilitado, você ainda verá anúncios, mas eles não serão personalizados.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="cookie-modal-footer">
            <a href="${CONFIG.privacyPolicyUrl}" target="_blank" rel="noopener noreferrer" class="cookie-privacy-link">
              Política de Privacidade
              <svg class="cookie-link-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
            <div class="cookie-modal-actions">
              <button id="modal-accept-all" class="cookie-btn cookie-btn-secondary">
                Aceitar Todos
              </button>
              <button id="modal-save" class="cookie-btn cookie-btn-primary">
                Salvar Preferências
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // FUNÇÕES DE UI
  // ============================================================================

  function showBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.classList.add('cookie-banner-visible');
    }
  }

  function hideBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.classList.remove('cookie-banner-visible');
      setTimeout(() => {
        if (banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
      }, 500);
    }
  }

  function showModal() {
    const modal = document.getElementById('cookie-modal');
    if (modal) {
      modal.style.display = 'block';
      modal.offsetHeight;
      modal.classList.add('cookie-modal-visible');
      document.body.style.overflow = 'hidden';
    }
  }

  function hideModal() {
    const modal = document.getElementById('cookie-modal');
    if (modal) {
      modal.classList.remove('cookie-modal-visible');
      document.body.style.overflow = '';
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  function handleAcceptAll() {
    acceptAll();
    hideBanner();
    hideModal();
    // Não precisa de reload — o Consent Mode atualiza as tags em tempo real
  }

  function handleRejectNonEssential() {
    rejectNonEssential();
    hideBanner();
    // Não precisa de reload
  }

  function handleCustomize() {
    showModal();
  }

  function handleModalAcceptAll() {
    acceptAll();
    hideModal();
    hideBanner();
  }

  function handleModalSave() {
    const analyticsToggle = document.getElementById('analytics-toggle');
    const marketingToggle = document.getElementById('marketing-toggle');
    
    const prefs = {
      analytics: analyticsToggle ? analyticsToggle.checked : false,
      marketing: marketingToggle ? marketingToggle.checked : false
    };
    
    savePreferences(prefs);
    updateConsent(prefs);
    hideModal();
    hideBanner();
  }

  function handleModalClose() {
    hideModal();
  }

  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================

  function attachEventListeners() {
    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');
    const customizeBtn = document.getElementById('cookie-customize');
    
    if (acceptBtn) acceptBtn.addEventListener('click', handleAcceptAll);
    if (rejectBtn) rejectBtn.addEventListener('click', handleRejectNonEssential);
    if (customizeBtn) customizeBtn.addEventListener('click', handleCustomize);
    
    const modalAcceptBtn = document.getElementById('modal-accept-all');
    const modalSaveBtn = document.getElementById('modal-save');
    const modalOverlay = document.getElementById('modal-overlay');
    
    if (modalAcceptBtn) modalAcceptBtn.addEventListener('click', handleModalAcceptAll);
    if (modalSaveBtn) modalSaveBtn.addEventListener('click', handleModalSave);
    if (modalOverlay) modalOverlay.addEventListener('click', handleModalClose);
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        hideModal();
      }
    });
  }

  function injectHTML() {
    const container = document.createElement('div');
    container.id = 'cookie-consent-container';
    container.innerHTML = createBannerHTML() + createModalHTML();
    document.body.appendChild(container);
    attachEventListeners();
  }

  function init() {
    console.log('[CookieConsent] Inicializando v2.0...');
    
    // PASSO 1: Definir consent padrão RESTRITIVO (sempre, antes de tudo)
    setDefaultConsent();
    
    // PASSO 2: Se já tem consentimento salvo, atualizar o consent mode
    const storedPrefs = getStoredPreferences();
    if (storedPrefs) {
      console.log('[CookieConsent] Consentimento encontrado, aplicando...');
      updateConsent(storedPrefs);
    }
    
    // PASSO 3: Carregar GTM SEMPRE (consent mode controla o que dispara)
    loadGTM();
    
    // PASSO 4: Se NÃO tem consentimento, mostrar banner
    if (!storedPrefs) {
      injectHTML();
      setTimeout(() => {
        showBanner();
      }, CONFIG.bannerDelay);
    }
  }

  // Executar o mais cedo possível
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // API pública
  window.AudiotextCookieConsent = {
    hasConsent,
    hasMarketingConsent: function() {
      const prefs = getStoredPreferences();
      return prefs?.marketing ?? false;
    },
    hasAnalyticsConsent: function() {
      const prefs = getStoredPreferences();
      return prefs?.analytics ?? false;
    },
    acceptAll,
    rejectNonEssential,
    getStoredPreferences,
    // Permite reabrir o modal de preferências (ex: link no footer)
    showPreferences: function() {
      if (!document.getElementById('cookie-consent-container')) {
        injectHTML();
      }
      showModal();
    },
    // Permite resetar consentimento (útil para testes)
    reset: function() {
      localStorage.removeItem(CONFIG.storageKey);
      console.log('[CookieConsent] Consentimento resetado. Recarregue a página.');
    }
  };

})();
