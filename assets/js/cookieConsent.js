/**
 * Cookie Consent System - Audiotext (audiotext.com.br)
 * Baseado no sistema React do app.audiotext.com.br
 * Versão: HTML/JS Puro para Vercel
 * Data: 2026-02-04
 */

(function() {
  'use strict';

  // ============================================================================
  // CONFIGURAÇÃO
  // ============================================================================

  const CONFIG = {
    storageKey: 'audiotext_cookie_preferences',
    
    // IDs de tracking - SUBSTITUIR PELOS REAIS
    metaPixelId: 'METAADS_PIXEL_ID',
    googleAdsId: 'GOOGLEADS_TAG_ID',
    gtmId: 'GTM_CONTAINER_ID',
    
    // URLs
    privacyPolicyUrl: '/legal#privacidade',
    
    // Delay inicial do banner (ms)
    bannerDelay: 500,
  };

  // ============================================================================
  // FUNÇÕES DE STORAGE (mesmas do React)
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

  function hasMarketingConsent() {
    const prefs = getStoredPreferences();
    return prefs?.marketing ?? false;
  }

  function hasAnalyticsConsent() {
    const prefs = getStoredPreferences();
    return prefs?.analytics ?? false;
  }

  function acceptAll() {
    savePreferences({
      analytics: true,
      marketing: true
    });
  }

  function rejectNonEssential() {
    savePreferences({
      analytics: false,
      marketing: false
    });
  }

  // ============================================================================
  // CARREGAMENTO DE SCRIPTS DE TRACKING
  // ============================================================================

  function loadMetaPixel() {
    if (window.fbq) {
      console.log('[CookieConsent] Meta Pixel já carregado');
      return;
    }

    const pixelId = CONFIG.metaPixelId;
    if (!pixelId || pixelId === 'METAADS_PIXEL_ID') {
      console.warn('[CookieConsent] Meta Pixel ID não configurado');
      return;
    }

    // Código oficial do Meta Pixel
    !function(f,b,e,v,n,t,s) {
      if(f.fbq) return;
      n=f.fbq=function(){
        n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)
      };
      if(!f._fbq) f._fbq=n;
      n.push=n;
      n.loaded=!0;
      n.version='2.0';
      n.queue=[];
      t=b.createElement(e);
      t.async=!0;
      t.src=v;
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');

    console.log('[CookieConsent] Meta Pixel carregado');
  }

  function loadGoogleAds() {
    if (document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
      console.log('[CookieConsent] Google Ads já carregado');
      return;
    }

    const adsId = CONFIG.googleAdsId;
    if (!adsId || adsId === 'GOOGLEADS_TAG_ID') {
      console.warn('[CookieConsent] Google Ads ID não configurado');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', adsId);

    console.log('[CookieConsent] Google Ads carregado');
  }

  function loadGTM() {
    if (document.querySelector('script[src*="googletagmanager.com/gtm"]')) {
      console.log('[CookieConsent] GTM já carregado');
      return;
    }

    const gtmId = CONFIG.gtmId;
    if (!gtmId || gtmId === 'GTM_CONTAINER_ID') {
      console.warn('[CookieConsent] GTM ID não configurado');
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
    })(window,document,'script','dataLayer',gtmId);

    console.log('[CookieConsent] GTM carregado');
  }

  function loadConsentedScripts() {
    console.log('[CookieConsent] Carregando scripts consentidos...');
    
    if (hasMarketingConsent()) {
      loadMetaPixel();
      loadGoogleAds();
    }

    if (hasAnalyticsConsent()) {
      loadGTM();
    }
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

  // ============================================================================
  // CRIAÇÃO DO HTML - MODAL DE PREFERÊNCIAS
  // ============================================================================

  function createModalHTML() {
    const prefs = getStoredPreferences() || { analytics: false, marketing: false };
    
    return `
      <div id="cookie-modal" class="cookie-modal" role="dialog" aria-labelledby="modal-title" aria-modal="true" style="display: none;">
        <div class="cookie-modal-overlay" id="modal-overlay"></div>
        <div class="cookie-modal-content">
          <div class="cookie-modal-header">
            <h2 id="modal-title" class="cookie-modal-title">Preferências de Cookies</h2>
            <p class="cookie-modal-description">
              Personalize quais cookies você deseja permitir. Suas preferências serão salvas e respeitadas.
            </p>
          </div>

          <div class="cookie-modal-body">
            <!-- Essential Cookies -->
            <div class="cookie-preference-item">
              <div class="cookie-preference-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div class="cookie-preference-content">
                <div class="cookie-preference-header">
                  <label class="cookie-preference-label">Cookies Essenciais</label>
                  <label class="cookie-toggle cookie-toggle-disabled">
                    <input type="checkbox" checked disabled>
                    <span class="cookie-toggle-slider"></span>
                  </label>
                </div>
                <p class="cookie-preference-description">
                  Necessários para o funcionamento básico da plataforma (autenticação, segurança, preferências). Não podem ser desativados.
                </p>
                <p class="cookie-preference-examples">
                  Exemplos: Sessão de login, proteção CSRF, idioma
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
                  Exemplos: Google Tag Manager, análise de uso
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
    window.location.reload();
  }

  function handleRejectNonEssential() {
    rejectNonEssential();
    hideBanner();
  }

  function handleCustomize() {
    showModal();
  }

  function handleModalAcceptAll() {
    acceptAll();
    hideModal();
    hideBanner();
    window.location.reload();
  }

  function handleModalSave() {
    const analyticsToggle = document.getElementById('analytics-toggle');
    const marketingToggle = document.getElementById('marketing-toggle');
    
    savePreferences({
      analytics: analyticsToggle ? analyticsToggle.checked : false,
      marketing: marketingToggle ? marketingToggle.checked : false
    });
    
    hideModal();
    hideBanner();
    window.location.reload();
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
    console.log('[CookieConsent] Inicializando...');
    
    if (hasConsent()) {
      console.log('[CookieConsent] Consentimento já existe, carregando scripts...');
      loadConsentedScripts();
      return;
    }
    
    injectHTML();
    
    setTimeout(() => {
      showBanner();
    }, CONFIG.bannerDelay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AudiotextCookieConsent = {
    hasConsent,
    hasMarketingConsent,
    hasAnalyticsConsent,
    acceptAll,
    rejectNonEssential,
    getStoredPreferences,
    showModal: function() {
      if (!document.getElementById('cookie-consent-container')) {
        injectHTML();
      }
      showModal();
    }
  };

})();
