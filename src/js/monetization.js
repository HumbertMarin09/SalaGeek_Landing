/**
 * ============================================================================
 * 💰 SALA GEEK - SISTEMA DE MONETIZACIÓN
 * ============================================================================
 * 
 * Sistema inteligente de monetización que:
 * - Carga ads de forma lazy (no bloquea la página)
 * - Respeta las preferencias de cookies del usuario
 * - Detecta adblockers y muestra mensaje amigable
 * - Implementa refresh de ads para mayor revenue
 * - Incluye analytics de rendimiento
 * 
 * Slots de Ads implementados:
 * 1. Header Banner (728x90 / responsive)
 * 2. In-Article (entre secciones)
 * 3. Sidebar (300x250 / sticky)
 * 4. Footer Banner (728x90)
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
  
  const ADS_CONFIG = {
    // Tu ID de publisher de Google AdSense
    publisherId: 'ca-pub-3884162231581435',
    
    // Slots de anuncios (configurar cuando crees los ad units en AdSense)
    slots: {
      headerBanner: {
        slotId: '2669096526', // SG - Header Banner (Adaptable)
        format: 'auto',
        sizes: [[728, 90], [970, 90], [320, 50]],
        responsive: true
      },
      inArticle: {
        slotId: '4301548877', // SG - In-Article (Fluid)
        format: 'fluid',
        layout: 'in-article',
        responsive: true
      },
      sidebar: {
        slotId: '8439286191', // SG - Sidebar (Fixed 300x250)
        format: 'rectangle',
        sizes: [[300, 250], [336, 280]],
        responsive: false
      },
      footerBanner: {
        slotId: '6440627054', // SG - Footer (Adaptable)
        format: 'auto',
        sizes: [[728, 90], [320, 50]],
        responsive: true
      }
    },
    
    // Configuración de comportamiento
    lazyLoadOffset: 200, // Píxeles antes de que el ad entre en viewport
    refreshInterval: 60000, // Refresh cada 60 segundos (si está visible)
    enableRefresh: false, // Desactivado por defecto para cumplir políticas
    showAdBlockerMessage: true,
    debugMode: false
  };

  // ============================================================================
  // ESTADO GLOBAL
  // ============================================================================
  
  const state = {
    adsLoaded: false,
    adBlockerDetected: false,
    cookiesAccepted: false,
    visibleAds: new Set(),
    adRefreshTimers: new Map()
  };

  // ============================================================================
  // UTILIDADES
  // ============================================================================
  
  function log(...args) {
    if (ADS_CONFIG.debugMode) {
      console.log('[💰 Monetization]', ...args);
    }
  }

  function checkCookieConsent() {
    try {
      const raw = localStorage.getItem('sg_cookie_consent');
      if (!raw) return false;
      const consent = JSON.parse(raw);
      return consent?.categories?.marketing === true;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // DETECCIÓN DE ADBLOCKER
  // ============================================================================
  
  async function detectAdBlocker() {
    return new Promise((resolve) => {
      // Método 1: Crear elemento bait
      const bait = document.createElement('div');
      bait.className = 'adsbox ad-banner textad banner-ad pub_300x250';
      bait.style.cssText = 'width:1px!important;height:1px!important;position:absolute!important;left:-10000px!important;top:-1000px!important;';
      document.body.appendChild(bait);
      
      // Esperar un momento para que el adblocker actúe
      setTimeout(() => {
        const isBlocked = bait.offsetHeight === 0 || 
                         bait.offsetWidth === 0 ||
                         bait.clientHeight === 0 ||
                         getComputedStyle(bait).display === 'none';
        bait.remove();
        
        state.adBlockerDetected = isBlocked;
        log('AdBlocker detectado:', isBlocked);
        resolve(isBlocked);
      }, 100);
    });
  }

  function showAdBlockerMessage() {
    // Solo mostrar si está configurado y no se ha mostrado antes en esta sesión
    if (!ADS_CONFIG.showAdBlockerMessage || sessionStorage.getItem('sg_adblocker_notice_shown')) {
      return;
    }

    const message = document.createElement('div');
    message.className = 'adblocker-notice';
    message.innerHTML = `
      <div class="adblocker-notice-content">
        <div class="adblocker-notice-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h3>¡Hola, Geek! 👋</h3>
        <p>Notamos que usas un bloqueador de anuncios. Lo entendemos, pero nuestros anuncios nos ayudan a crear contenido gratis para ti.</p>
        <p>Considera desactivarlo para Sala Geek. ¡Prometemos no ser molestos! 🎮</p>
        <div class="adblocker-notice-actions">
          <button class="adblocker-btn-dismiss" onclick="this.closest('.adblocker-notice').remove(); sessionStorage.setItem('sg_adblocker_notice_shown', 'true');">
            Entendido, continuar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(message);
    
    // Animación de entrada
    requestAnimationFrame(() => {
      message.classList.add('visible');
    });
  }

  // ============================================================================
  // CARGA DE GOOGLE ADSENSE
  // ============================================================================
  
  function loadAdSenseScript() {
    return new Promise((resolve, reject) => {
      // Si ya está cargado
      if (window.adsbygoogle) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.publisherId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        log('AdSense script cargado');
        state.adsLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        log('Error cargando AdSense');
        state.adBlockerDetected = true;
        reject(new Error('AdSense blocked'));
      };
      
      document.head.appendChild(script);
    });
  }

  // ============================================================================
  // CREACIÓN DE AD CONTAINERS
  // ============================================================================
  
  function createAdContainer(slotName, config) {
    const container = document.createElement('div');
    container.className = `ad-container ad-${slotName}`;
    container.setAttribute('data-ad-slot', slotName);
    
    // Label de transparencia
    const label = document.createElement('span');
    label.className = 'ad-label';
    label.textContent = 'Publicidad';
    container.appendChild(label);
    
    // Contenedor del ad
    const adWrapper = document.createElement('div');
    adWrapper.className = 'ad-wrapper';
    
    // Placeholder mientras carga
    const placeholder = document.createElement('div');
    placeholder.className = 'ad-placeholder';
    placeholder.innerHTML = `
      <div class="ad-placeholder-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
        <span>Cargando...</span>
      </div>
    `;
    adWrapper.appendChild(placeholder);
    
    // Elemento de AdSense (comentado hasta tener cuenta aprobada)
    const adElement = document.createElement('ins');
    adElement.className = 'adsbygoogle';
    adElement.style.display = 'block';
    adElement.setAttribute('data-ad-client', ADS_CONFIG.publisherId);
    adElement.setAttribute('data-ad-slot', config.slotId);
    
    if (config.responsive) {
      adElement.setAttribute('data-ad-format', 'auto');
      adElement.setAttribute('data-full-width-responsive', 'true');
    }
    
    if (config.layout) {
      adElement.setAttribute('data-ad-layout', config.layout);
    }
    
    adWrapper.appendChild(adElement);
    container.appendChild(adWrapper);
    
    return container;
  }

  // ============================================================================
  // LAZY LOADING DE ADS
  // ============================================================================
  
  function setupLazyLoadAds() {
    const adContainers = document.querySelectorAll('.ad-container[data-ad-slot]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const container = entry.target;
          const slotName = container.getAttribute('data-ad-slot');
          
          loadAd(container, slotName);
          observer.unobserve(container);
        }
      });
    }, {
      rootMargin: `${ADS_CONFIG.lazyLoadOffset}px`
    });
    
    adContainers.forEach(container => observer.observe(container));
  }

  function loadAd(container, slotName) {
    log(`Cargando ad: ${slotName}`);
    
    const placeholder = container.querySelector('.ad-placeholder');
    const adElement = container.querySelector('.adsbygoogle');
    
    if (!adElement) return;
    
    // Verificar si AdSense está disponible
    if (window.adsbygoogle && !state.adBlockerDetected) {
      try {
        (adsbygoogle = window.adsbygoogle || []).push({});
        
        // Remover placeholder después de un delay
        setTimeout(() => {
          if (placeholder) {
            placeholder.style.display = 'none';
          }
          container.classList.add('ad-loaded');
        }, 1000);
        
        state.visibleAds.add(slotName);
      } catch (e) {
        log('Error al cargar ad:', e);
        container.classList.add('ad-error');
      }
    } else {
      // Mostrar fallback si hay adblocker
      showFallbackContent(container, slotName);
    }
  }

  function showFallbackContent(container, slotName) {
    const placeholder = container.querySelector('.ad-placeholder');
    if (placeholder) {
      placeholder.innerHTML = `
        <div class="ad-fallback">
          <a href="https://salageek.com/src/pages/media-kit.html" class="ad-fallback-link">
            <span class="ad-fallback-icon">📢</span>
            <span class="ad-fallback-text">¿Quieres anunciarte aquí?</span>
            <span class="ad-fallback-cta">Ver Media Kit →</span>
          </a>
        </div>
      `;
    }
  }

  // ============================================================================
  // INSERCIÓN DE ADS EN LA PÁGINA
  // ============================================================================
  
  function insertAds() {
    // 1. Header Banner - después del hero
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      const headerAd = createAdContainer('headerBanner', ADS_CONFIG.slots.headerBanner);
      heroSection.after(headerAd);
      log('Header banner insertado');
    }
    
    // 2. In-Article Ads - entre secciones principales
    const sections = document.querySelectorAll('main section');
    const inArticlePositions = [2, 4]; // Después de la sección 2 y 4
    
    inArticlePositions.forEach((pos, index) => {
      if (sections[pos]) {
        const inArticleAd = createAdContainer(`inArticle${index + 1}`, ADS_CONFIG.slots.inArticle);
        sections[pos].after(inArticleAd);
        log(`In-article ad ${index + 1} insertado`);
      }
    });
    
    // 3. Footer Banner - antes del footer
    const footer = document.querySelector('footer') || document.querySelector('#footer-placeholder');
    if (footer) {
      const footerAd = createAdContainer('footerBanner', ADS_CONFIG.slots.footerBanner);
      footer.before(footerAd);
      log('Footer banner insertado');
    }
  }

  // ============================================================================
  // ESTILOS CSS PARA ADS
  // ============================================================================
  
  function injectAdStyles() {
    const styles = document.createElement('style');
    styles.textContent = `
      /* ============================================
         AD CONTAINER STYLES
         ============================================ */
      .ad-container {
        width: 100%;
        max-width: 100%;
        margin: 2rem auto;
        padding: 0;
        background: linear-gradient(135deg, rgba(26, 31, 58, 0.6) 0%, rgba(10, 14, 39, 0.8) 100%);
        border: 1px solid rgba(255, 209, 102, 0.1);
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        min-height: 90px;
      }

      .ad-container.ad-headerBanner,
      .ad-container.ad-footerBanner {
        max-width: 970px;
      }

      .ad-container.ad-inArticle1,
      .ad-container.ad-inArticle2 {
        max-width: 800px;
      }

      /* Ad Label */
      .ad-label {
        position: absolute;
        top: 4px;
        left: 8px;
        font-size: 10px;
        color: rgba(160, 174, 192, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 500;
        z-index: 1;
      }

      /* Ad Wrapper */
      .ad-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 90px;
        padding: 20px 16px 16px;
      }

      /* Placeholder mientras carga */
      .ad-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 60px;
      }

      .ad-placeholder-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: rgba(160, 174, 192, 0.4);
        animation: adPulse 2s ease-in-out infinite;
      }

      @keyframes adPulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.7; }
      }

      /* Fallback cuando hay AdBlocker */
      .ad-fallback {
        width: 100%;
        padding: 12px;
      }

      .ad-fallback-link {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 16px 24px;
        background: linear-gradient(135deg, rgba(255, 209, 102, 0.1) 0%, rgba(231, 111, 81, 0.1) 100%);
        border: 1px dashed rgba(255, 209, 102, 0.3);
        border-radius: 8px;
        text-decoration: none;
        transition: all 0.3s ease;
      }

      .ad-fallback-link:hover {
        background: linear-gradient(135deg, rgba(255, 209, 102, 0.2) 0%, rgba(231, 111, 81, 0.2) 100%);
        border-color: rgba(255, 209, 102, 0.5);
        transform: translateY(-2px);
      }

      .ad-fallback-icon {
        font-size: 24px;
      }

      .ad-fallback-text {
        color: #f0f2f7;
        font-weight: 500;
      }

      .ad-fallback-cta {
        color: #ffd166;
        font-weight: 600;
      }

      /* Ad loaded state */
      .ad-container.ad-loaded .ad-placeholder {
        display: none;
      }

      .ad-container.ad-loaded {
        background: transparent;
        border-color: transparent;
      }

      /* AdSense container */
      .adsbygoogle {
        display: block;
        width: 100%;
      }

      /* ============================================
         ADBLOCKER NOTICE
         ============================================ */
      .adblocker-notice {
        position: fixed;
        bottom: 20px;
        right: 20px;
        max-width: 380px;
        background: linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%);
        border: 1px solid rgba(255, 209, 102, 0.2);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .adblocker-notice.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      .adblocker-notice-content {
        text-align: center;
      }

      .adblocker-notice-icon {
        margin-bottom: 16px;
        color: #ffd166;
      }

      .adblocker-notice h3 {
        margin: 0 0 12px;
        color: #f0f2f7;
        font-size: 1.25rem;
      }

      .adblocker-notice p {
        margin: 0 0 12px;
        color: #a0aec0;
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .adblocker-notice-actions {
        margin-top: 20px;
      }

      .adblocker-btn-dismiss {
        width: 100%;
        padding: 12px 24px;
        background: linear-gradient(135deg, #ffd166 0%, #e76f51 100%);
        border: none;
        border-radius: 8px;
        color: #0a0e27;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .adblocker-btn-dismiss:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(255, 209, 102, 0.3);
      }

      /* ============================================
         RESPONSIVE
         ============================================ */
      @media (max-width: 768px) {
        .ad-container {
          margin: 1.5rem auto;
          border-radius: 8px;
        }

        .ad-wrapper {
          padding: 16px 12px 12px;
          min-height: 60px;
        }

        .ad-fallback-link {
          flex-wrap: wrap;
          text-align: center;
          gap: 8px;
        }

        .adblocker-notice {
          left: 16px;
          right: 16px;
          bottom: 16px;
          max-width: none;
        }
      }

      /* ============================================
         PRINT - Ocultar ads al imprimir
         ============================================ */
      @media print {
        .ad-container,
        .adblocker-notice {
          display: none !important;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  // ============================================================================
  // ANALYTICS DE ADS
  // ============================================================================
  
  function trackAdEvent(eventName, slotName, data = {}) {
    // Google Analytics 4
    if (window.gtag) {
      gtag('event', eventName, {
        event_category: 'Ads',
        event_label: slotName,
        ...data
      });
    }
    
    log(`Ad Event: ${eventName}`, slotName, data);
  }

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================
  
  async function init() {
    log('Inicializando sistema de monetización...');
    
    // Inyectar estilos
    injectAdStyles();
    
    // Verificar consentimiento de cookies
    state.cookiesAccepted = checkCookieConsent();
    
    if (!state.cookiesAccepted) {
      log('Esperando consentimiento de cookies para cargar ads');
      // Escuchar evento de consentimiento
      document.addEventListener('cookieConsentAccepted', () => {
        state.cookiesAccepted = true;
        initAds();
      });
      return;
    }
    
    await initAds();
  }

  async function initAds() {
    // Detectar adblocker
    await detectAdBlocker();
    
    if (state.adBlockerDetected) {
      log('AdBlocker detectado - mostrando contenido alternativo');
      showAdBlockerMessage();
    }
    
    // Insertar contenedores de ads
    insertAds();
    
    // Cargar AdSense script (solo si no hay adblocker)
    if (!state.adBlockerDetected) {
      try {
        await loadAdSenseScript();
      } catch (e) {
        log('No se pudo cargar AdSense');
      }
    }
    
    // Configurar lazy loading
    setupLazyLoadAds();
    
    log('Sistema de monetización inicializado ✅');
  }

  // ============================================================================
  // EXPORTAR API PÚBLICA
  // ============================================================================
  
  window.SalaGeekAds = {
    init,
    detectAdBlocker,
    trackAdEvent,
    getState: () => ({ ...state }),
    config: ADS_CONFIG
  };

  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
