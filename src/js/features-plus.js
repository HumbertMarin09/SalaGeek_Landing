/**
 * ============================================================================
 * ✨ SALA GEEK - FEATURES PLUS
 * ============================================================================
 * 
 * Características adicionales premium:
 * 
 * 1. Skeleton Loaders - Placeholders animados mientras carga contenido
 * 2. Reading Progress Bar - Barra de progreso de lectura en artículos
 * 3. Web Share API - Compartir nativo en móviles
 * 4. Print Styles - Estilos optimizados para impresión
 * 5. PWA Install Prompt - Banner para instalar la app
 * 
 * @version 1.0.0
 * @author Sala Geek
 * ============================================================================
 */

(function() {
  'use strict';

  // ============================================================================
  // 1. SKELETON LOADERS
  // ============================================================================
  
  const SkeletonLoader = {
    /**
     * Crea un skeleton loader para diferentes tipos de contenido
     * @param {string} type - card, text, avatar, image
     * @param {number} count - Número de skeletons a crear
     */
    create(type = 'card', count = 1) {
      const container = document.createElement('div');
      container.className = 'skeleton-container';
      
      for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = `skeleton skeleton-${type}`;
        
        switch (type) {
          case 'card':
            skeleton.innerHTML = `
              <div class="skeleton-image"></div>
              <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
              </div>
            `;
            break;
          case 'text':
            skeleton.innerHTML = `
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            `;
            break;
          case 'avatar':
            skeleton.innerHTML = `
              <div class="skeleton-avatar"></div>
              <div class="skeleton-info">
                <div class="skeleton-name"></div>
                <div class="skeleton-meta"></div>
              </div>
            `;
            break;
          case 'image':
            skeleton.innerHTML = `<div class="skeleton-img"></div>`;
            break;
        }
        
        container.appendChild(skeleton);
      }
      
      return container;
    },
    
    /**
     * Reemplaza un elemento con su skeleton mientras carga
     */
    show(element) {
      if (!element) return;
      
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-wrapper';
      skeleton.innerHTML = element.innerHTML;
      skeleton.querySelectorAll('*').forEach(el => {
        el.classList.add('skeleton-loading');
      });
      
      element.dataset.originalContent = element.innerHTML;
      element.innerHTML = '';
      element.appendChild(skeleton);
    },
    
    /**
     * Restaura el contenido original
     */
    hide(element) {
      if (!element || !element.dataset.originalContent) return;
      
      element.innerHTML = element.dataset.originalContent;
      delete element.dataset.originalContent;
    }
  };

  // ============================================================================
  // 2. READING PROGRESS BAR
  // ============================================================================
  
  const ReadingProgress = {
    bar: null,
    
    init() {
      // Solo en páginas de artículos/blog
      if (!document.querySelector('article, .blog-article, .article-content')) {
        return;
      }
      
      this.createBar();
      this.setupListener();
      console.log('[📖 Progress] Reading progress bar inicializado');
    },
    
    createBar() {
      this.bar = document.createElement('div');
      this.bar.className = 'reading-progress-bar';
      this.bar.innerHTML = '<div class="reading-progress-fill"></div>';
      this.bar.setAttribute('role', 'progressbar');
      this.bar.setAttribute('aria-valuemin', '0');
      this.bar.setAttribute('aria-valuemax', '100');
      this.bar.setAttribute('aria-valuenow', '0');
      this.bar.setAttribute('aria-label', 'Progreso de lectura');
      
      document.body.appendChild(this.bar);
    },
    
    setupListener() {
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateProgress();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    },
    
    updateProgress() {
      const article = document.querySelector('article, .blog-article, .article-content');
      if (!article || !this.bar) return;
      
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Calcular progreso solo dentro del artículo
      const scrollableHeight = articleHeight - windowHeight;
      const articleScrollStart = articleTop;
      const currentScroll = scrollTop - articleScrollStart;
      
      let progress = 0;
      
      if (currentScroll > 0 && scrollableHeight > 0) {
        progress = Math.min(100, Math.max(0, (currentScroll / scrollableHeight) * 100));
      }
      
      const fill = this.bar.querySelector('.reading-progress-fill');
      if (fill) {
        fill.style.width = `${progress}%`;
      }
      
      this.bar.setAttribute('aria-valuenow', Math.round(progress));
      
      // Mostrar/ocultar basado en posición
      if (scrollTop > articleTop - 100) {
        this.bar.classList.add('visible');
      } else {
        this.bar.classList.remove('visible');
      }
    }
  };

  // ============================================================================
  // 3. WEB SHARE API
  // ============================================================================
  
  const WebShare = {
    isSupported() {
      return navigator.share !== undefined;
    },
    
    /**
     * Comparte contenido usando la API nativa
     */
    async share(data = {}) {
      const shareData = {
        title: data.title || document.title,
        text: data.text || document.querySelector('meta[name="description"]')?.content || '',
        url: data.url || window.location.href
      };
      
      if (this.isSupported()) {
        try {
          await navigator.share(shareData);
          console.log('[📤 Share] Contenido compartido exitosamente');
          this.trackShare('native');
          return true;
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('[📤 Share] Error al compartir:', err);
          }
          return false;
        }
      } else {
        // Fallback: mostrar modal con opciones
        this.showFallbackModal(shareData);
        return false;
      }
    },
    
    /**
     * Crear botón de compartir
     */
    createButton(options = {}) {
      const button = document.createElement('button');
      button.className = `share-button ${options.className || ''}`;
      button.setAttribute('aria-label', 'Compartir');
      button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        <span>${options.text || 'Compartir'}</span>
      `;
      
      button.addEventListener('click', () => {
        this.share(options.data);
      });
      
      return button;
    },
    
    /**
     * Modal de fallback para navegadores sin Web Share API
     */
    showFallbackModal(data) {
      const existingModal = document.getElementById('share-fallback-modal');
      if (existingModal) existingModal.remove();
      
      const encodedUrl = encodeURIComponent(data.url);
      const encodedTitle = encodeURIComponent(data.title);
      const encodedText = encodeURIComponent(data.text);
      
      const modal = document.createElement('div');
      modal.id = 'share-fallback-modal';
      modal.className = 'share-modal';
      modal.innerHTML = `
        <div class="share-modal-backdrop"></div>
        <div class="share-modal-content">
          <div class="share-modal-header">
            <h3>📤 Compartir</h3>
            <button class="share-modal-close" aria-label="Cerrar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="share-modal-body">
            <div class="share-options">
              <a href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}" 
                 target="_blank" rel="noopener" class="share-option twitter" data-platform="twitter">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span>X (Twitter)</span>
              </a>
              <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" 
                 target="_blank" rel="noopener" class="share-option facebook" data-platform="facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>Facebook</span>
              </a>
              <a href="https://wa.me/?text=${encodedText}%20${encodedUrl}" 
                 target="_blank" rel="noopener" class="share-option whatsapp" data-platform="whatsapp">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span>WhatsApp</span>
              </a>
              <a href="https://t.me/share/url?url=${encodedUrl}&text=${encodedText}" 
                 target="_blank" rel="noopener" class="share-option telegram" data-platform="telegram">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                <span>Telegram</span>
              </a>
              <button class="share-option copy-link" data-platform="copy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copiar enlace</span>
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Animación
      requestAnimationFrame(() => {
        modal.classList.add('visible');
      });
      
      // Event listeners
      modal.querySelector('.share-modal-close').addEventListener('click', () => this.hideModal(modal));
      modal.querySelector('.share-modal-backdrop').addEventListener('click', () => this.hideModal(modal));
      
      modal.querySelector('.copy-link').addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(data.url);
          const btn = modal.querySelector('.copy-link span');
          btn.textContent = '¡Copiado!';
          setTimeout(() => btn.textContent = 'Copiar enlace', 2000);
          this.trackShare('copy');
        } catch (err) {
          console.error('Error al copiar:', err);
        }
      });
      
      // Track clicks en opciones
      modal.querySelectorAll('.share-option[data-platform]').forEach(option => {
        option.addEventListener('click', () => {
          this.trackShare(option.dataset.platform);
        });
      });
    },
    
    hideModal(modal) {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 300);
    },
    
    trackShare(platform) {
      if (window.gtag) {
        gtag('event', 'share', {
          method: platform,
          content_type: 'article',
          item_id: window.location.pathname
        });
      }
    }
  };

  // ============================================================================
  // 4. PWA INSTALL PROMPT
  // ============================================================================
  
  const PWAInstall = {
    deferredPrompt: null,
    
    init() {
      // Capturar el evento beforeinstallprompt
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        
        // Mostrar botón de instalación si no se ha instalado
        if (!this.isInstalled()) {
          this.showInstallButton();
        }
        
        console.log('[📱 PWA] Install prompt disponible');
      });
      
      // Detectar si se instaló
      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.hideInstallButton();
        console.log('[📱 PWA] App instalada exitosamente');
      });
    },
    
    isInstalled() {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true;
    },
    
    showInstallButton() {
      // No mostrar si ya se mostró y el usuario lo cerró
      if (sessionStorage.getItem('sg_pwa_banner_dismissed')) return;
      
      const banner = document.createElement('div');
      banner.id = 'pwa-install-banner';
      banner.className = 'pwa-install-banner';
      banner.innerHTML = `
        <div class="pwa-install-content">
          <div class="pwa-install-icon">
            <img src="/src/images/SalaGeek_LOGO.webp" alt="Sala Geek" width="48" height="48">
          </div>
          <div class="pwa-install-text">
            <strong>¡Instala Sala Geek!</strong>
            <span>Accede más rápido desde tu pantalla de inicio</span>
          </div>
          <button class="pwa-install-btn" id="pwa-install-btn">Instalar</button>
          <button class="pwa-install-close" id="pwa-install-close" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;
      
      document.body.appendChild(banner);
      
      setTimeout(() => banner.classList.add('visible'), 3000);
      
      document.getElementById('pwa-install-btn').addEventListener('click', () => {
        this.promptInstall();
      });
      
      document.getElementById('pwa-install-close').addEventListener('click', () => {
        this.hideInstallButton();
        sessionStorage.setItem('sg_pwa_banner_dismissed', 'true');
      });
    },
    
    hideInstallButton() {
      const banner = document.getElementById('pwa-install-banner');
      if (banner) {
        banner.classList.remove('visible');
        setTimeout(() => banner.remove(), 300);
      }
    },
    
    async promptInstall() {
      if (!this.deferredPrompt) return;
      
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log('[📱 PWA] Usuario eligió:', outcome);
      this.deferredPrompt = null;
      this.hideInstallButton();
    }
  };

  // ============================================================================
  // 5. INYECTAR ESTILOS CSS
  // ============================================================================
  
  function injectStyles() {
    const styles = document.createElement('style');
    styles.textContent = `
      /* ============================================
         SKELETON LOADERS
         ============================================ */
      .skeleton {
        background: #1a1f3a;
        border-radius: 12px;
        overflow: hidden;
      }

      .skeleton-card {
        padding: 16px;
      }

      .skeleton-image,
      .skeleton-img {
        width: 100%;
        height: 180px;
        background: linear-gradient(90deg, #2d3748 25%, #3d4a5c 50%, #2d3748 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s infinite;
        border-radius: 8px;
      }

      .skeleton-content {
        padding-top: 16px;
      }

      .skeleton-title,
      .skeleton-line,
      .skeleton-name {
        height: 20px;
        background: linear-gradient(90deg, #2d3748 25%, #3d4a5c 50%, #2d3748 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 12px;
      }

      .skeleton-text,
      .skeleton-meta {
        height: 14px;
        background: linear-gradient(90deg, #2d3748 25%, #3d4a5c 50%, #2d3748 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 8px;
      }

      .skeleton-text.short,
      .skeleton-line.short {
        width: 60%;
      }

      .skeleton-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(90deg, #2d3748 25%, #3d4a5c 50%, #2d3748 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s infinite;
      }

      @keyframes skeleton-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      .skeleton-loading {
        background: linear-gradient(90deg, #2d3748 25%, #3d4a5c 50%, #2d3748 75%) !important;
        background-size: 200% 100% !important;
        animation: skeleton-shimmer 1.5s infinite !important;
        color: transparent !important;
        border-radius: 4px;
      }

      /* ============================================
         READING PROGRESS BAR
         ============================================ */
      .reading-progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.1);
        z-index: 99999;
        opacity: 0;
        transform: translateY(-100%);
        transition: all 0.3s ease;
      }

      .reading-progress-bar.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .reading-progress-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #ffd166 0%, #e76f51 100%);
        transition: width 0.1s ease-out;
        border-radius: 0 2px 2px 0;
        box-shadow: 0 0 10px rgba(255, 209, 102, 0.5);
      }

      /* ============================================
         SHARE BUTTON
         ============================================ */
      .share-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: #f0f2f7;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: inherit;
      }

      .share-button:hover {
        background: rgba(255, 209, 102, 0.1);
        border-color: rgba(255, 209, 102, 0.3);
        color: #ffd166;
      }

      .share-button svg {
        flex-shrink: 0;
      }

      /* ============================================
         SHARE MODAL
         ============================================ */
      .share-modal {
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

      .share-modal.visible {
        opacity: 1;
        visibility: visible;
      }

      .share-modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
      }

      .share-modal-content {
        position: relative;
        background: linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%);
        border: 1px solid rgba(255, 209, 102, 0.2);
        border-radius: 16px;
        max-width: 360px;
        width: 100%;
        transform: scale(0.95) translateY(20px);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .share-modal.visible .share-modal-content {
        transform: scale(1) translateY(0);
      }

      .share-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .share-modal-header h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #f0f2f7;
      }

      .share-modal-close {
        background: none;
        border: none;
        color: #718096;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .share-modal-close:hover {
        color: #f0f2f7;
        background: rgba(255, 255, 255, 0.1);
      }

      .share-modal-body {
        padding: 16px 20px 20px;
      }

      .share-options {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .share-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        color: #f0f2f7;
        text-decoration: none;
        font-size: 0.8rem;
        transition: all 0.2s ease;
        cursor: pointer;
        font-family: inherit;
      }

      .share-option:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }

      .share-option svg {
        width: 24px;
        height: 24px;
      }

      .share-option.twitter:hover { border-color: #1DA1F2; color: #1DA1F2; }
      .share-option.facebook:hover { border-color: #1877F2; color: #1877F2; }
      .share-option.whatsapp:hover { border-color: #25D366; color: #25D366; }
      .share-option.telegram:hover { border-color: #0088cc; color: #0088cc; }
      .share-option.copy-link:hover { border-color: #ffd166; color: #ffd166; }

      /* ============================================
         PWA INSTALL BANNER
         ============================================ */
      .pwa-install-banner {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        max-width: 400px;
        margin: 0 auto;
        background: linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%);
        border: 1px solid rgba(255, 209, 102, 0.2);
        border-radius: 16px;
        padding: 16px;
        z-index: 99998;
        opacity: 0;
        transform: translateY(100%);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      }

      .pwa-install-banner.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .pwa-install-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .pwa-install-icon {
        flex-shrink: 0;
      }

      .pwa-install-icon img {
        border-radius: 10px;
      }

      .pwa-install-text {
        flex: 1;
        min-width: 0;
      }

      .pwa-install-text strong {
        display: block;
        font-size: 0.95rem;
        color: #f0f2f7;
        margin-bottom: 2px;
      }

      .pwa-install-text span {
        font-size: 0.8rem;
        color: #a0aec0;
      }

      .pwa-install-btn {
        padding: 10px 16px;
        background: linear-gradient(135deg, #ffd166 0%, #e76f51 100%);
        border: none;
        border-radius: 8px;
        color: #0a0e27;
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.3s ease;
        flex-shrink: 0;
        font-family: inherit;
      }

      .pwa-install-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 20px rgba(255, 209, 102, 0.3);
      }

      .pwa-install-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: #718096;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .pwa-install-close:hover {
        color: #f0f2f7;
        background: rgba(255, 255, 255, 0.1);
      }

      /* ============================================
         PRINT STYLES
         ============================================ */
      @media print {
        /* Ocultar elementos no imprimibles */
        header,
        footer,
        nav,
        .navigation,
        .nav-menu,
        .mobile-menu,
        .back-to-top,
        #back-to-top,
        .cookie-banner,
        .cookie-modal,
        .share-modal,
        .share-button,
        .pwa-install-banner,
        .easter-egg-tracker,
        .ad-container,
        .adblocker-notice,
        .reading-progress-bar,
        .social-section,
        .newsletter-section,
        video,
        audio,
        iframe,
        .no-print {
          display: none !important;
        }

        /* Reset de estilos base */
        * {
          background: white !important;
          color: black !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }

        body {
          font-size: 12pt;
          line-height: 1.5;
          margin: 0;
          padding: 20px;
        }

        /* Contenido principal */
        main,
        article,
        .article-content,
        .container {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Tipografía */
        h1 { font-size: 24pt; margin-bottom: 12pt; }
        h2 { font-size: 18pt; margin-top: 18pt; margin-bottom: 8pt; }
        h3 { font-size: 14pt; margin-top: 14pt; margin-bottom: 6pt; }
        p { margin-bottom: 10pt; orphans: 3; widows: 3; }

        /* Links */
        a {
          text-decoration: underline;
          color: #000 !important;
        }

        a[href^="http"]:after {
          content: " (" attr(href) ")";
          font-size: 9pt;
          color: #666 !important;
        }

        /* Imágenes */
        img {
          max-width: 100% !important;
          page-break-inside: avoid;
        }

        /* Evitar cortes en elementos importantes */
        h1, h2, h3, h4, h5, h6,
        blockquote,
        pre,
        table,
        figure {
          page-break-inside: avoid;
          page-break-after: avoid;
        }

        /* Header de impresión */
        body::before {
          content: "Sala Geek - salageek.com";
          display: block;
          font-size: 10pt;
          color: #666 !important;
          border-bottom: 1px solid #ccc;
          padding-bottom: 8pt;
          margin-bottom: 20pt;
        }

        /* Footer de impresión */
        body::after {
          content: "Impreso desde Sala Geek | © 2026";
          display: block;
          font-size: 9pt;
          color: #666 !important;
          border-top: 1px solid #ccc;
          padding-top: 8pt;
          margin-top: 20pt;
          text-align: center;
        }
      }

      /* ============================================
         RESPONSIVE
         ============================================ */
      @media (max-width: 640px) {
        .share-options {
          grid-template-columns: 1fr 1fr;
        }

        .pwa-install-banner {
          left: 12px;
          right: 12px;
          bottom: 12px;
        }

        .pwa-install-content {
          flex-wrap: wrap;
        }

        .pwa-install-btn {
          width: 100%;
          margin-top: 8px;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================
  
  function init() {
    injectStyles();
    
    // Reading Progress - solo en artículos
    ReadingProgress.init();
    
    // PWA Install Prompt
    PWAInstall.init();
    
    // Exponer APIs públicas
    window.SalaGeekFeatures = {
      SkeletonLoader,
      ReadingProgress,
      WebShare,
      PWAInstall
    };
    
    console.log('[✨ Features] Sistema de features Plus inicializado');
  }

  // Auto-inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
