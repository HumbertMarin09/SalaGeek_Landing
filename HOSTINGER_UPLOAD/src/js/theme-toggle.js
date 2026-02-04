/**
 * ============================================================================
 * ☀️🌙 SALA GEEK - THEME TOGGLE SYSTEM
 * ============================================================================
 * 
 * Sistema de cambio de tema claro/oscuro con:
 * - Persistencia en localStorage
 * - Detección de preferencia del sistema
 * - Transiciones suaves
 * - Accesibilidad completa
 * 
 * @version 1.0.0
 * @author Sala Geek
 * ============================================================================
 */

const SalaGeekTheme = (function() {
  'use strict';

  // ===========================================================================
  // CONFIGURACIÓN
  // ===========================================================================
  
  const DEBUG = false; // Cambiar a true para logs de desarrollo

  const CONFIG = {
    storageKey: 'sala-geek-theme',
    themes: ['dark', 'light'],
    defaultTheme: 'dark', // Por defecto oscuro (el diseño original)
    transitionDuration: 300
  };

  // ===========================================================================
  // ESTADO
  // ===========================================================================

  let currentTheme = CONFIG.defaultTheme;
  let toggleButton = null;

  // ===========================================================================
  // FUNCIONES DE UTILIDAD
  // ===========================================================================

  /**
   * Detecta la preferencia de tema del sistema operativo
   * @returns {string} 'light' o 'dark'
   */
  function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  /**
   * Obtiene el tema guardado en localStorage o la preferencia del sistema
   * @returns {string} Tema a aplicar
   */
  function getSavedTheme() {
    const saved = localStorage.getItem(CONFIG.storageKey);
    if (saved && CONFIG.themes.includes(saved)) {
      return saved;
    }
    return getSystemPreference();
  }

  /**
   * Guarda el tema en localStorage
   * @param {string} theme - Tema a guardar
   */
  function saveTheme(theme) {
    try {
      localStorage.setItem(CONFIG.storageKey, theme);
    } catch (e) {
      console.warn('Unable to save theme preference:', e);
    }
  }

  // ===========================================================================
  // APLICACIÓN DEL TEMA
  // ===========================================================================

  /**
   * Aplica el tema al documento con transición suave
   * @param {string} theme - 'light' o 'dark'
   * @param {boolean} animate - Si debe animar la transición
   */
  function applyTheme(theme, animate = true) {
    if (!CONFIG.themes.includes(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      theme = CONFIG.defaultTheme;
    }

    // Añadir clase de transición para animación suave
    if (animate) {
      document.documentElement.classList.add('theme-transitioning');
    }

    // Aplicar tema
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('light-mode');
      document.documentElement.classList.add('dark-mode');
    }

    currentTheme = theme;

    // Actualizar botón toggle si existe
    updateToggleButton();

    // Actualizar meta theme-color para móviles
    updateMetaThemeColor(theme);

    // Remover clase de transición después de la animación
    if (animate) {
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, CONFIG.transitionDuration);
    }

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme } 
    }));

    if (DEBUG) console.log(`[SalaGeekTheme] Applied theme: ${theme}`);
  }

  /**
   * Actualiza el color del tema para la barra del navegador en móviles
   * @param {string} theme - Tema actual
   */
  function updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.content = theme === 'light' ? '#FFFFFF' : '#0A0A0F';
  }

  /**
   * Actualiza el estado visual del botón toggle
   */
  function updateToggleButton() {
    if (!toggleButton) return;

    const isLight = currentTheme === 'light';
    
    // Actualizar aria-label para accesibilidad
    toggleButton.setAttribute('aria-label', 
      isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'
    );
    toggleButton.setAttribute('title',
      isLight ? 'Modo oscuro' : 'Modo claro'
    );

    // Actualizar data attribute
    toggleButton.setAttribute('data-theme', currentTheme);
  }

  // ===========================================================================
  // CAMBIO DE TEMA
  // ===========================================================================

  /**
   * Alterna entre tema claro y oscuro
   */
  function toggle() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme, true);
    saveTheme(newTheme);
  }

  /**
   * Establece un tema específico
   * @param {string} theme - 'light' o 'dark'
   */
  function setTheme(theme) {
    if (CONFIG.themes.includes(theme)) {
      applyTheme(theme, true);
      saveTheme(theme);
    }
  }

  // ===========================================================================
  // UI - CREAR BOTÓN TOGGLE
  // ===========================================================================

  /**
   * Crea e inserta el botón de cambio de tema en el DOM
   */
  function createToggleButton() {
    // Verificar si ya existe
    if (document.querySelector('.theme-toggle')) {
      toggleButton = document.querySelector('.theme-toggle');
      return;
    }

    // Crear el botón
    toggleButton = document.createElement('button');
    toggleButton.className = 'theme-toggle';
    toggleButton.type = 'button';
    toggleButton.setAttribute('aria-label', 'Cambiar tema');
    toggleButton.setAttribute('title', currentTheme === 'light' ? 'Modo oscuro' : 'Modo claro');
    
    // Iconos SVG para sol y luna
    toggleButton.innerHTML = `
      <!-- Sol (mostrado en modo oscuro para cambiar a claro) -->
      <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      <!-- Luna (mostrado en modo claro para cambiar a oscuro) -->
      <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;

    // Event listener
    toggleButton.addEventListener('click', toggle);

    // Insertar en la página
    insertToggleButton();
  }

  /**
   * Inserta el botón en la ubicación apropiada del DOM
   */
  function insertToggleButton() {
    if (!toggleButton) return;

    // Buscar posibles contenedores en orden de preferencia
    const possibleContainers = [
      // 1. Contenedor específico para utilidades del header
      '.header-utils',
      '.header-actions',
      '.nav-utils',
      // 2. Junto al selector de idioma si existe
      '.language-selector',
      // 3. Dentro del header
      '.site-header .container',
      '.site-header nav',
      '.main-nav .menu',
      '.site-header',
      // 4. Fallback - al principio del body
      'body'
    ];

    for (const selector of possibleContainers) {
      const container = document.querySelector(selector);
      if (container) {
        // Si es el selector de idioma, insertar antes
        if (selector === '.language-selector') {
          container.parentNode.insertBefore(toggleButton, container);
        } else if (selector === '.main-nav .menu' || selector.includes('nav')) {
          // Si es la navegación, añadir al final
          container.appendChild(toggleButton);
        } else if (selector === 'body') {
          // Fallback: posición fija en pantalla
          toggleButton.style.position = 'fixed';
          toggleButton.style.bottom = '80px';
          toggleButton.style.right = '20px';
          toggleButton.style.zIndex = '9999';
          container.appendChild(toggleButton);
        } else {
          // Añadir al final del contenedor
          container.appendChild(toggleButton);
        }
        if (DEBUG) console.log(`[SalaGeekTheme] Toggle button inserted in: ${selector}`);
        return;
      }
    }

    if (DEBUG) console.warn('[SalaGeekTheme] Could not find suitable container for toggle button');
  }

  // ===========================================================================
  // LISTENERS DE SISTEMA
  // ===========================================================================

  /**
   * Configura el listener para cambios de preferencia del sistema
   */
  function setupSystemPreferenceListener() {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const handler = (e) => {
      // Solo aplicar si no hay preferencia guardada por el usuario
      const saved = localStorage.getItem(CONFIG.storageKey);
      if (!saved) {
        applyTheme(e.matches ? 'light' : 'dark', true);
      }
    };

    // Usar el método correcto según soporte del navegador
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handler);
    }
  }

  // ===========================================================================
  // INICIALIZACIÓN
  // ===========================================================================

  /**
   * Inicializa el sistema de temas
   */
  function init() {
    // Obtener tema guardado o preferencia del sistema
    const savedTheme = getSavedTheme();
    
    // Aplicar tema sin animación en la carga inicial
    applyTheme(savedTheme, false);

    // Crear botón toggle cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createToggleButton);
    } else {
      createToggleButton();
    }

    // Escuchar cambios de preferencia del sistema
    setupSystemPreferenceListener();

    if (DEBUG) console.log(`[SalaGeekTheme] Initialized with theme: ${savedTheme}`);
  }

  // ===========================================================================
  // API PÚBLICA
  // ===========================================================================

  return {
    init,
    toggle,
    setTheme,
    getTheme: () => currentTheme,
    isLight: () => currentTheme === 'light',
    isDark: () => currentTheme === 'dark'
  };

})();

// ===========================================================================
// AUTO-INICIALIZACIÓN
// ===========================================================================

// Iniciar inmediatamente para evitar parpadeo
SalaGeekTheme.init();

// Exponer globalmente
window.SalaGeekTheme = SalaGeekTheme;

// También permitir acceso rápido
window.toggleTheme = SalaGeekTheme.toggle;
