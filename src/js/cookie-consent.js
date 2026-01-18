/**
 * ============================================================================
 * 🍪 SALA GEEK - COOKIE CONSENT BANNER
 * ============================================================================
 * 
 * Sistema de consentimiento de cookies que cumple con:
 * - GDPR (Europa)
 * - LOPD-GDD (España)
 * - LGPD (Brasil)
 * - CCPA (California)
 * 
 * Características:
 * - Banner minimalista y no intrusivo
 * - Opciones granulares de cookies
 * - Persistencia de preferencias
 * - Integración con Google Analytics y AdSense
 * - Accesible (WCAG 2.1)
 * 
 * @version 1.0.0
 * @author Sala Geek
 * ============================================================================
 */

(function() {
  'use strict';

  // ============================================================================
  // CONFIGURACIÓN
  // ============================================================================

  const COOKIE_CONFIG = {
    name: 'sg_cookie_consent',
    expiration: 365, // días
    version: '1.0', // Para forzar re-consentimiento si cambian las políticas
    
    // Categorías de cookies
    categories: {
      necessary: {
        name: 'Necesarias',
        description: 'Cookies esenciales para el funcionamiento del sitio',
        required: true,
        cookies: ['session', 'security', 'preferences']
      },
      analytics: {
        name: 'Analíticas',
        description: 'Nos ayudan a entender cómo usas el sitio',
        required: false,
        cookies: ['_ga', '_gid', '_gat']
      },
      marketing: {
        name: 'Marketing',
        description: 'Para mostrarte anuncios relevantes',
        required: false,
        cookies: ['_gcl_au', 'ads_preferences']
      },
      functional: {
        name: 'Funcionales',
        description: 'Mejoran tu experiencia (tema, idioma, etc.)',
        required: false,
        cookies: ['theme', 'language', 'easter_eggs']
      }
    }
  };

  // ============================================================================
  // ESTADO
  // ============================================================================

  const state = {
    consent: null,
    bannerShown: false
  };

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};${expires};path=/;SameSite=Lax;Secure`;
  }

  function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        try {
          return JSON.parse(decodeURIComponent(cookieValue));
        } catch {
          return cookieValue;
        }
      }
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }

  // ============================================================================
  // GESTIÓN DE CONSENTIMIENTO
  // ============================================================================

  function getConsent() {
    const consent = getCookie(COOKIE_CONFIG.name);
    
    if (!consent) return null;
    
    // Verificar versión
    if (consent.version !== COOKIE_CONFIG.version) {
      // Las políticas cambiaron, solicitar nuevo consentimiento
      deleteCookie(COOKIE_CONFIG.name);
      return null;
    }
    
    return consent;
  }

  function saveConsent(categories) {
    const consent = {
      version: COOKIE_CONFIG.version,
      timestamp: new Date().toISOString(),
      categories: categories
    };
    
    setCookie(COOKIE_CONFIG.name, consent, COOKIE_CONFIG.expiration);
    state.consent = consent;
    
    // También guardar en localStorage para acceso rápido
    localStorage.setItem('sg_cookie_consent', JSON.stringify(consent));
    
    // Disparar evento para que otros scripts reaccionen
    document.dispatchEvent(new CustomEvent('cookieConsentChanged', {
      detail: consent
    }));
    
    // Si aceptó marketing/analytics, disparar evento específico
    if (categories.analytics || categories.marketing) {
      document.dispatchEvent(new CustomEvent('cookieConsentAccepted', {
        detail: consent
      }));
    }
  }

  function hasConsent(category) {
    if (!state.consent) return false;
    if (COOKIE_CONFIG.categories[category]?.required) return true;
    return state.consent.categories?.[category] === true;
  }

  // ============================================================================
  // APLICAR CONSENTIMIENTO
  // ============================================================================

  function applyConsent(consent) {
    // Google Analytics
    if (consent.categories.analytics) {
      enableGoogleAnalytics();
    } else {
      disableGoogleAnalytics();
    }
    
    // Marketing / AdSense
    if (consent.categories.marketing) {
      enableMarketing();
    } else {
      disableMarketing();
    }
    
    console.log('[🍪 Cookies] Consentimiento aplicado:', consent.categories);
  }

  function enableGoogleAnalytics() {
    // Permitir que GA funcione normalmente
    window['ga-disable-G-XXXXXXXXXX'] = false;
    
    // Si GA ya está cargado, habilitar
    if (window.gtag) {
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  }

  function disableGoogleAnalytics() {
    // Desactivar GA
    window['ga-disable-G-XXXXXXXXXX'] = true;
    
    if (window.gtag) {
      gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
    
    // Eliminar cookies de GA
    ['_ga', '_gid', '_gat'].forEach(cookie => {
      deleteCookie(cookie);
    });
  }

  function enableMarketing() {
    if (window.gtag) {
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
    }
  }

  function disableMarketing() {
    if (window.gtag) {
      gtag('consent', 'update', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
  }

  // ============================================================================
  // UI - BANNER
  // ============================================================================

  function createBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cookie-banner-title');
    banner.setAttribute('aria-describedby', 'cookie-banner-desc');
    
    banner.innerHTML = `
      <div class="cookie-banner-content">
        <div class="cookie-banner-text">
          <h3 id="cookie-banner-title">🍪 Usamos cookies</h3>
          <p id="cookie-banner-desc">
            Para mejorar tu experiencia y mostrarte contenido relevante. 
            Puedes aceptar todas o <button class="cookie-link-btn" id="cookie-customize-btn">personalizar</button>.
          </p>
        </div>
        <div class="cookie-banner-actions">
          <button id="cookie-reject-btn" class="cookie-btn cookie-btn-secondary">
            Solo necesarias
          </button>
          <button id="cookie-accept-btn" class="cookie-btn cookie-btn-primary">
            Aceptar todas
          </button>
        </div>
      </div>
      <a href="/src/pages/legal/cookies.html" class="cookie-policy-link" target="_blank">
        Ver política de cookies
      </a>
    `;
    
    return banner;
  }

  function createModal() {
    const modal = document.createElement('div');
    modal.id = 'cookie-consent-modal';
    modal.className = 'cookie-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'cookie-modal-title');
    modal.setAttribute('aria-modal', 'true');
    
    let categoriesHTML = '';
    
    Object.entries(COOKIE_CONFIG.categories).forEach(([key, category]) => {
      categoriesHTML += `
        <div class="cookie-category">
          <div class="cookie-category-header">
            <label class="cookie-toggle">
              <input type="checkbox" 
                     id="cookie-cat-${key}" 
                     name="${key}" 
                     ${category.required ? 'checked disabled' : ''}
                     ${!category.required ? 'checked' : ''}>
              <span class="cookie-toggle-slider"></span>
            </label>
            <div class="cookie-category-info">
              <h4>${category.name}</h4>
              <p>${category.description}</p>
              ${category.required ? '<span class="cookie-required-badge">Siempre activas</span>' : ''}
            </div>
          </div>
        </div>
      `;
    });
    
    modal.innerHTML = `
      <div class="cookie-modal-backdrop"></div>
      <div class="cookie-modal-content">
        <div class="cookie-modal-header">
          <h3 id="cookie-modal-title">⚙️ Preferencias de Cookies</h3>
          <button class="cookie-modal-close" aria-label="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="cookie-modal-body">
          <p class="cookie-modal-intro">
            Elige qué cookies deseas permitir. Las cookies necesarias son imprescindibles 
            para el funcionamiento del sitio.
          </p>
          <div class="cookie-categories">
            ${categoriesHTML}
          </div>
        </div>
        <div class="cookie-modal-footer">
          <button id="cookie-save-preferences" class="cookie-btn cookie-btn-primary">
            Guardar preferencias
          </button>
        </div>
      </div>
    `;
    
    return modal;
  }

  function showBanner() {
    if (state.bannerShown) return;
    
    const banner = createBanner();
    document.body.appendChild(banner);
    
    // Animación de entrada
    requestAnimationFrame(() => {
      banner.classList.add('visible');
    });
    
    // Event listeners
    document.getElementById('cookie-accept-btn').addEventListener('click', () => {
      acceptAll();
      hideBanner();
    });
    
    document.getElementById('cookie-reject-btn').addEventListener('click', () => {
      rejectAll();
      hideBanner();
    });
    
    document.getElementById('cookie-customize-btn').addEventListener('click', () => {
      showModal();
    });
    
    state.bannerShown = true;
  }

  function hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.remove('visible');
      setTimeout(() => banner.remove(), 300);
    }
  }

  function showModal() {
    // Si ya existe, solo mostrar
    let modal = document.getElementById('cookie-consent-modal');
    
    if (!modal) {
      modal = createModal();
      document.body.appendChild(modal);
      
      // Event listeners
      modal.querySelector('.cookie-modal-close').addEventListener('click', hideModal);
      modal.querySelector('.cookie-modal-backdrop').addEventListener('click', hideModal);
      
      document.getElementById('cookie-save-preferences').addEventListener('click', () => {
        savePreferences();
        hideModal();
        hideBanner();
      });
      
      // Escape key
      document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
          hideModal();
          document.removeEventListener('keydown', escHandler);
        }
      });
    }
    
    requestAnimationFrame(() => {
      modal.classList.add('visible');
      document.body.style.overflow = 'hidden';
    });
  }

  function hideModal() {
    const modal = document.getElementById('cookie-consent-modal');
    if (modal) {
      modal.classList.remove('visible');
      document.body.style.overflow = '';
      setTimeout(() => modal.remove(), 300);
    }
  }

  // ============================================================================
  // ACCIONES
  // ============================================================================

  function acceptAll() {
    const categories = {};
    Object.keys(COOKIE_CONFIG.categories).forEach(key => {
      categories[key] = true;
    });
    
    saveConsent(categories);
    applyConsent({ categories });
    
    console.log('[🍪 Cookies] Todas las cookies aceptadas');
  }

  function rejectAll() {
    const categories = {};
    Object.keys(COOKIE_CONFIG.categories).forEach(key => {
      categories[key] = COOKIE_CONFIG.categories[key].required;
    });
    
    saveConsent(categories);
    applyConsent({ categories });
    
    console.log('[🍪 Cookies] Solo cookies necesarias aceptadas');
  }

  function savePreferences() {
    const categories = {};
    
    Object.keys(COOKIE_CONFIG.categories).forEach(key => {
      const checkbox = document.getElementById(`cookie-cat-${key}`);
      categories[key] = checkbox ? checkbox.checked : COOKIE_CONFIG.categories[key].required;
    });
    
    saveConsent(categories);
    applyConsent({ categories });
    
    console.log('[🍪 Cookies] Preferencias guardadas:', categories);
  }

  // ============================================================================
  // ESTILOS CSS
  // ============================================================================

  function injectStyles() {
    const styles = document.createElement('style');
    styles.textContent = `
      /* ============================================
         COOKIE BANNER
         ============================================ */
      .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%);
        border-top: 1px solid rgba(255, 209, 102, 0.2);
        padding: 16px 20px;
        z-index: 99999;
        transform: translateY(100%);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
      }

      .cookie-banner.visible {
        transform: translateY(0);
      }

      .cookie-banner-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        flex-wrap: wrap;
      }

      .cookie-banner-text {
        flex: 1;
        min-width: 280px;
      }

      .cookie-banner-text h3 {
        margin: 0 0 4px;
        font-size: 1rem;
        color: #f0f2f7;
        font-weight: 600;
      }

      .cookie-banner-text p {
        margin: 0;
        font-size: 0.9rem;
        color: #a0aec0;
        line-height: 1.5;
      }

      .cookie-link-btn {
        background: none;
        border: none;
        color: #ffd166;
        text-decoration: underline;
        cursor: pointer;
        font-size: inherit;
        padding: 0;
        font-family: inherit;
      }

      .cookie-link-btn:hover {
        color: #e76f51;
      }

      .cookie-banner-actions {
        display: flex;
        gap: 12px;
        flex-shrink: 0;
      }

      .cookie-btn {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
        font-family: inherit;
      }

      .cookie-btn-primary {
        background: linear-gradient(135deg, #ffd166 0%, #e76f51 100%);
        color: #0a0e27;
      }

      .cookie-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(255, 209, 102, 0.3);
      }

      .cookie-btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: #f0f2f7;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .cookie-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
      }

      .cookie-policy-link {
        display: block;
        text-align: center;
        margin-top: 12px;
        font-size: 0.75rem;
        color: #718096;
        text-decoration: none;
      }

      .cookie-policy-link:hover {
        color: #a0aec0;
        text-decoration: underline;
      }

      /* ============================================
         COOKIE MODAL
         ============================================ */
      .cookie-modal {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .cookie-modal.visible {
        opacity: 1;
        visibility: visible;
      }

      .cookie-modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
      }

      .cookie-modal-content {
        position: relative;
        background: linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%);
        border: 1px solid rgba(255, 209, 102, 0.2);
        border-radius: 16px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transform: scale(0.95) translateY(20px);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .cookie-modal.visible .cookie-modal-content {
        transform: scale(1) translateY(0);
      }

      .cookie-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .cookie-modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #f0f2f7;
      }

      .cookie-modal-close {
        background: none;
        border: none;
        color: #718096;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .cookie-modal-close:hover {
        color: #f0f2f7;
        background: rgba(255, 255, 255, 0.1);
      }

      .cookie-modal-body {
        padding: 20px 24px;
        overflow-y: auto;
      }

      .cookie-modal-intro {
        margin: 0 0 20px;
        font-size: 0.9rem;
        color: #a0aec0;
        line-height: 1.6;
      }

      .cookie-categories {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .cookie-category {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 16px;
      }

      .cookie-category-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .cookie-category-info h4 {
        margin: 0 0 4px;
        font-size: 0.95rem;
        color: #f0f2f7;
      }

      .cookie-category-info p {
        margin: 0;
        font-size: 0.8rem;
        color: #718096;
      }

      .cookie-required-badge {
        display: inline-block;
        margin-top: 6px;
        padding: 2px 8px;
        background: rgba(255, 209, 102, 0.2);
        color: #ffd166;
        font-size: 0.7rem;
        border-radius: 4px;
        font-weight: 500;
      }

      /* Toggle Switch */
      .cookie-toggle {
        position: relative;
        width: 44px;
        height: 24px;
        flex-shrink: 0;
      }

      .cookie-toggle input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .cookie-toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.2);
        transition: 0.3s;
        border-radius: 24px;
      }

      .cookie-toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background: white;
        transition: 0.3s;
        border-radius: 50%;
      }

      .cookie-toggle input:checked + .cookie-toggle-slider {
        background: linear-gradient(135deg, #ffd166 0%, #e76f51 100%);
      }

      .cookie-toggle input:checked + .cookie-toggle-slider:before {
        transform: translateX(20px);
      }

      .cookie-toggle input:disabled + .cookie-toggle-slider {
        cursor: not-allowed;
        opacity: 0.7;
      }

      .cookie-modal-footer {
        padding: 16px 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: flex-end;
      }

      /* ============================================
         RESPONSIVE
         ============================================ */
      @media (max-width: 640px) {
        .cookie-banner {
          padding: 16px;
        }

        .cookie-banner-content {
          flex-direction: column;
          text-align: center;
        }

        .cookie-banner-actions {
          width: 100%;
          flex-direction: column;
        }

        .cookie-btn {
          width: 100%;
          padding: 14px;
        }

        .cookie-modal-content {
          max-height: 90vh;
        }
      }

      /* ============================================
         PRINT - Ocultar
         ============================================ */
      @media print {
        .cookie-banner,
        .cookie-modal {
          display: none !important;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  function init() {
    // Inyectar estilos
    injectStyles();
    
    // Verificar consentimiento existente
    state.consent = getConsent();
    
    if (state.consent) {
      // Ya tiene consentimiento guardado
      console.log('[🍪 Cookies] Consentimiento encontrado:', state.consent.categories);
      applyConsent(state.consent);
    } else {
      // Mostrar banner
      console.log('[🍪 Cookies] Sin consentimiento, mostrando banner');
      
      // Esperar un momento para no interferir con la carga inicial
      setTimeout(showBanner, 1500);
    }
  }

  // ============================================================================
  // API PÚBLICA
  // ============================================================================

  window.SalaGeekCookies = {
    init,
    showBanner,
    showModal,
    acceptAll,
    rejectAll,
    hasConsent,
    getConsent: () => state.consent,
    resetConsent: () => {
      deleteCookie(COOKIE_CONFIG.name);
      localStorage.removeItem('sg_cookie_consent');
      state.consent = null;
      showBanner();
    }
  };

  // Auto-inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
