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
        <div class="cookie-banner-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="rgba(255,209,102,0.1)"/>
            <circle cx="7" cy="9" r="1.5" fill="currentColor"/>
            <circle cx="15" cy="7" r="1" fill="currentColor"/>
            <circle cx="10" cy="14" r="1.8" fill="currentColor"/>
            <circle cx="16" cy="12" r="1.2" fill="currentColor"/>
            <circle cx="12" cy="18" r="1" fill="currentColor"/>
            <circle cx="5" cy="13" r="0.8" fill="currentColor"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 3"/>
          </svg>
        </div>
        <div class="cookie-banner-text">
          <h3 id="cookie-banner-title">Usamos cookies</h3>
          <p id="cookie-banner-desc">
            Para mejorar tu experiencia y mostrarte contenido relevante. 
            Puedes aceptar todas o <button class="cookie-link-btn" id="cookie-customize-btn">personalizar</button>.
          </p>
        </div>
        <div class="cookie-banner-actions">
          <button id="cookie-reject-btn" class="cookie-btn cookie-btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            Solo necesarias
          </button>
          <button id="cookie-accept-btn" class="cookie-btn cookie-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Aceptar todas
          </button>
        </div>
      </div>
      <a href="/src/pages/legal/cookies.html" class="cookie-policy-link" target="_blank">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
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
          <h3 id="cookie-modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Preferencias de Cookies
          </h3>
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
         COOKIE BANNER - DISEÑO PREMIUM
         ============================================ */
      .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, rgba(26, 31, 58, 0.98) 0%, rgba(10, 14, 39, 0.98) 100%);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid rgba(255, 209, 102, 0.15);
        padding: 20px 24px;
        z-index: 99999;
        transform: translateY(100%);
        transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.4), 
                    0 -4px 20px rgba(255, 209, 102, 0.05);
      }

      .cookie-banner.visible {
        transform: translateY(0);
      }

      .cookie-banner-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .cookie-banner-icon {
        flex-shrink: 0;
        color: #ffd166;
        animation: cookieFloat 3s ease-in-out infinite;
      }

      @keyframes cookieFloat {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-4px) rotate(5deg); }
      }

      .cookie-banner-text {
        flex: 1;
        min-width: 0;
      }

      .cookie-banner-text h3 {
        margin: 0 0 6px;
        font-size: 1.05rem;
        color: #f0f2f7;
        font-weight: 700;
        letter-spacing: -0.01em;
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
        text-decoration: none;
        cursor: pointer;
        font-size: inherit;
        padding: 0;
        font-family: inherit;
        font-weight: 500;
        border-bottom: 1px dashed rgba(255, 209, 102, 0.4);
        transition: all 0.2s ease;
      }

      .cookie-link-btn:hover {
        color: #e76f51;
        border-bottom-color: rgba(231, 111, 81, 0.6);
      }

      .cookie-banner-actions {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
      }

      .cookie-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: 10px;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border: none;
        font-family: inherit;
        white-space: nowrap;
      }

      .cookie-btn svg {
        flex-shrink: 0;
      }

      .cookie-btn-primary {
        background: linear-gradient(135deg, #ffd166 0%, #e76f51 100%);
        color: #0a0e27;
        box-shadow: 0 4px 15px rgba(255, 209, 102, 0.25);
      }

      .cookie-btn-primary:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 8px 25px rgba(255, 209, 102, 0.35);
      }

      .cookie-btn-primary:active {
        transform: translateY(0) scale(0.98);
      }

      .cookie-btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        color: #e2e8f0;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }

      .cookie-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.25);
        transform: translateY(-1px);
      }

      .cookie-policy-link {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin-top: 14px;
        font-size: 0.75rem;
        color: #718096;
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .cookie-policy-link:hover {
        color: #a0aec0;
      }

      .cookie-policy-link svg {
        opacity: 0.7;
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
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
        font-size: 1.15rem;
        color: #f0f2f7;
      }

      .cookie-modal-header h3 svg {
        color: #ffd166;
        flex-shrink: 0;
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
      
      /* Tablets y pantallas medianas */
      @media (max-width: 960px) {
        .cookie-banner-content {
          display: grid;
          grid-template-columns: auto 1fr;
          grid-template-rows: auto auto;
          gap: 12px 16px;
          align-items: center;
        }
        
        .cookie-banner-icon {
          grid-row: 1;
          grid-column: 1;
        }
        
        .cookie-banner-text {
          grid-row: 1;
          grid-column: 2;
        }
        
        .cookie-banner-actions {
          grid-row: 2;
          grid-column: 2;
        }
        
        .cookie-policy-link {
          margin-top: 8px;
        }
      }

      /* Móviles */
      @media (max-width: 768px) {
        .cookie-banner {
          padding: 18px 16px 14px;
        }

        .cookie-banner-content {
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
        }

        .cookie-banner-icon {
          display: block;
        }

        .cookie-banner-icon svg {
          width: 36px;
          height: 36px;
        }

        .cookie-banner-text {
          flex: none;
          min-width: 0;
          width: 100%;
          text-align: center;
        }

        .cookie-banner-text h3 {
          font-size: 1rem;
          margin-bottom: 6px;
        }

        .cookie-banner-text p {
          font-size: 0.85rem;
          line-height: 1.45;
        }

        .cookie-banner-actions {
          display: flex;
          flex-direction: row;
          gap: 10px;
          width: 100%;
          max-width: 360px;
        }

        .cookie-btn {
          flex: 1;
          padding: 12px 16px;
          font-size: 0.85rem;
          justify-content: center;
        }

        .cookie-btn svg {
          width: 15px;
          height: 15px;
        }

        .cookie-policy-link {
          margin-top: 2px;
          font-size: 0.72rem;
        }

        .cookie-modal-content {
          max-height: 90vh;
          margin: 10px;
        }

        .cookie-modal-body {
          padding: 16px;
        }

        .cookie-category {
          padding: 12px;
        }
      }

      @media (max-width: 380px) {
        .cookie-banner-actions {
          flex-direction: column;
          max-width: 280px;
        }

        .cookie-btn {
          width: 100%;
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
