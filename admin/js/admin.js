/**
 * ═══════════════════════════════════════════════════════════════
 * 🎛️ SALA GEEK ADMIN - Panel de Administración
 * ═══════════════════════════════════════════════════════════════
 * 
 * @description Sistema de administración completo para SalaGeek
 * @author SalaGeek Team
 * @version 2.4.0
 * @lastUpdate 2026-01-22
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * ─────────────────────────────
 * • Autenticación segura con sesiones PHP
 * • Editor WYSIWYG con formato completo
 * • Drag & drop de imágenes con posicionamiento inteligente
 * • Sistema de grids/galerías (1-4 columnas)
 * • Redimensionamiento de imágenes (arrastre + modal)
 * • Sistema Undo/Redo (historial de 50 estados)
 * • Vista previa responsive (desktop/tablet/mobile)
 * • Gestión completa de artículos (CRUD)
 * • Inserción de videos de YouTube
 * • SEO avanzado (meta tags, canonical, Open Graph)
 * • Galería de imágenes subidas
 * 
 * ATAJOS DE TECLADO:
 * ──────────────────
 * Ctrl+S         → Guardar artículo
 * Ctrl+Z         → Deshacer última acción
 * Ctrl+Y/Shift+Z → Rehacer acción
 * Ctrl+B         → Negrita
 * Ctrl+I         → Cursiva
 * Ctrl+U         → Subrayado
 * Ctrl+K         → Insertar enlace
 * ESC            → Cerrar modales
 * Delete/Supr   → Eliminar imagen/grid seleccionado
 * Doble clic    → Abrir modal de redimensionamiento
 * 
 * ESTRUCTURA DEL CÓDIGO:
 * ──────────────────────
 * 1. Configuración Global (CONFIG)
 * 2. Clase Principal (SalaGeekAdmin)
 *    - Inicialización y Autenticación
 *    - Sistema Undo/Redo
 *    - Event Listeners
 *    - Editor y Toolbar
 *    - Manejo de Imágenes y Grids
 *    - Modales (imagen, grid, galería, resize)
 *    - YouTube Embed
 *    - Navegación
 *    - CRUD de Artículos
 *    - Tags y SEO
 *    - Vista Previa
 *    - Generación de HTML
 *    - Utilidades
 * 
 * ═══════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN GLOBAL
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  // ─── UI & Notificaciones ───
  TOAST_DURATION: 5000,           // Duración de notificaciones (ms)
  
  // ─── Imágenes ───
  MIN_IMAGE_SIZE: 50,             // Tamaño mínimo de imagen (px)
  MAX_GRID_COLUMNS: 4,            // Máximo columnas en grid
  DEFAULT_GRID_GAP: 8,            // Espaciado por defecto en grid (px)
  
  // ─── Extracto del artículo ───
  MAX_EXCERPT_LENGTH: 250,        // Máximo caracteres permitidos
  EXCERPT_WARNING_LENGTH: 150,    // Umbral de advertencia (amarillo)
  EXCERPT_DANGER_LENGTH: 200,     // Umbral de peligro (rojo)
  
  // ─── Meta Description (SEO) ───
  META_DESC_OPTIMAL: 160,         // Longitud óptima para SEO
  META_DESC_WARNING: 140,         // Umbral de advertencia
  
  // ─── URL/Slug ───
  MAX_SLUG_LENGTH: 60,            // Máximo caracteres en slug
  
  // ─── Editor - Undo/Redo ───
  MAX_HISTORY_SIZE: 50,           // Estados máximos en historial
  DEBOUNCE_SAVE_STATE: 300,       // Delay para guardar estado (ms)
  
  // ─── Artículos Recientes ───
  RECENT_ARTICLES_LIMIT: 5        // Artículos mostrados en dashboard
};

// ═══════════════════════════════════════════════════════════════
// CLASE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

class SalaGeekAdmin {
  /**
   * Constructor - Inicializa el estado de la aplicación
   * 
   * @description Configura todas las propiedades iniciales del admin:
   * - Estado de autenticación (user)
   * - Datos de artículos y categorías
   * - Estado de navegación y edición
   * - Configuración de modales
   * - Sistema de historial para Undo/Redo
   */
  constructor() {
    // ─── Estado de Autenticación ───
    /** @type {Object|null} Usuario autenticado vía sesión PHP */
    this.user = null;
    
    // ─── Datos Principales ───
    /** @type {Array} Lista de artículos publicados */
    this.articles = [];
    /** @type {Array} Lista de borradores */
    this.drafts = [];
    /** @type {Array} Categorías disponibles */
    this.categories = [];
    /** @type {Array} Tags del artículo actual */
    this.tags = [];
    
    // ─── Estado de Navegación ───
    /** @type {string} Sección actual del admin */
    this.currentSection = 'dashboard';
    /** @type {Object|null} Artículo en edición */
    this.editingArticle = null;
    /** @type {boolean} Indica si el contenido ha sido guardado */
    this.contentSaved = false;
    
    // Auto-guardado eliminado - Se guarda manualmente
    
    // ─── Cursor Save/Restore para Modales ───
    /** @type {Range|null} Rango guardado antes de abrir modal */
    this.savedEditorRange = null;
    
    // ─── Modal de Imagen Individual ───
    /** @type {string} Fuente actual: 'url' o 'upload' */
    this.currentImageSource = 'url';
    /** @type {string|null} Datos de imagen subida (base64) */
    this.uploadedImageData = null;
    /** @type {HTMLElement|null} Imagen siendo arrastrada en editor */
    this.draggedEditorImage = null;
    /** @type {HTMLElement|null} Imagen seleccionada en el editor */
    this.selectedImage = null;
    
    // ─── Modal de Grid/Galería ───
    /** @type {Array} URLs de imágenes para el grid */
    this.gridImages = [];
    /** @type {number} Columnas del grid (1-4) */
    this.gridCols = 2;
    /** @type {number} Espaciado entre imágenes (px) */
    this.gridGap = CONFIG.DEFAULT_GRID_GAP;
    
    // ─── Galería de Imágenes Subidas ───
    /** @type {Array} Imágenes disponibles en la galería */
    this.galleryImages = [];
    /** @type {Object|null} Datos de imagen pendiente de subir */
    this.galleryUploadData = null;
    /** @type {boolean} Modo selección de galería para grid */
    this.gallerySelectMode = false;
    
    // ─── Sistema Undo/Redo ───
    /** @type {Array} Historial de estados del editor */
    this.editorHistory = [];
    /** @type {number} Índice actual en el historial */
    this.historyIndex = -1;
    /** @type {boolean} Flag para evitar guardar durante undo/redo */
    this.isUndoRedo = false;
    
    // ─── Cache de elementos DOM ───
    /** @type {HTMLElement|null} Referencia cacheada al editor */
    this._editorElement = null;
    
    // ─── Inicializar Aplicación ───
    this.init();
  }

  /**
   * Obtiene el elemento del editor (con cache)
   * @returns {HTMLElement|null} El elemento del editor o null si no existe
   */
  get editorElement() {
    if (!this._editorElement || !document.body.contains(this._editorElement)) {
      this._editorElement = document.getElementById('article-editor');
    }
    return this._editorElement;
  }

  // ═══════════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Inicializa todos los componentes de la aplicación
   */
  async init() {
    this.initAuth();
    this.setupEventListeners();
    this.setupImageModals();
    this.setupImageResizeModal();
    this.setupGalleryModal();
    this.setupSEOPreview();
    this.setupCollapsibleSections();
    this.setupCategoryMultiSelect();
    this.setupEditorImageHandlers(); // Delegación de eventos para imágenes
    this.setupForgotPasswordModal(); // Modal de recuperación de contraseña
    this.setupResetPasswordModal(); // Modal de reseteo de contraseña
    
    // Verificar si hay sesión activa
    await this.checkSession();
  }

  /**
   * Configura el sistema de autenticación PHP
   * 
   * @description Maneja el login/logout con el backend PHP
   */
  initAuth() {
    // Setup login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLoginSubmit(e);
      });
    }
  }

  /**
   * Verifica si hay una sesión activa
   */
  async checkSession() {
    try {
      const response = await fetch('/api/auth.php?action=check', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        this.user = data.user;
        this.authToken = data.token;
        this.handleLogin(data.user);
      }
    } catch (error) {
      // Sesión no activa - comportamiento esperado en primer acceso
    }
  }

  /**
   * Maneja el envío del formulario de login
   */
  async handleLoginSubmit(e) {
    const form = e.target;
    const email = form.querySelector('#login-email').value;
    const password = form.querySelector('#login-password').value;
    const submitBtn = form.querySelector('#login-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const errorDiv = document.getElementById('login-error');
    
    // UI: mostrar loading
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    
    try {
      const response = await fetch('/api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        this.user = data.user;
        this.authToken = data.token;
        this.handleLogin(data.user);
      } else {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
    }
  }

  /**
   * Maneja el login exitoso
   * 
   * @param {Object} user - Objeto de usuario
   * @description Actualiza la UI, muestra info del usuario y carga datos
   */
  handleLogin(user) {
    this.user = user;
    
    // Update UI
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    
    // Update user info - compatible con el nuevo formato de usuario
    const name = user.name || user.user_metadata?.full_name || user.email.split('@')[0];
    document.getElementById('user-name').textContent = name;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
    
    // Load data
    this.loadArticles();
    
    this.showToast(`¡Bienvenido, ${name}!`, 'success');
  }

  /**
   * Maneja el cierre de sesión
   * 
   * @description Limpia el estado y muestra la pantalla de login
   */
  async handleLogout() {
    try {
      await fetch('/api/auth.php?action=logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    
    this.user = null;
    this.authToken = null;
    this.articles = [];
    
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    
    // Limpiar formulario de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.reset();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // AUTENTICACIÓN Y TOKENS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene el token de acceso para llamadas a la API
   * 
   * @description Con el sistema PHP, usamos cookies de sesión.
   * Este método es para compatibilidad con el código existente.
   * 
   * @returns {Promise<string>} Token de sesión
   * @throws {Error} Si no hay sesión activa
   */
  async getAccessToken() {
    if (!this.user) {
      throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
    }

    // Con PHP usamos cookies de sesión, no tokens JWT
    // Retornamos el token almacenado o un placeholder
    return this.authToken || 'session-auth';
  }

  /**
   * Inicia el flujo de cambio de contraseña
   * 
   * @description Muestra un modal para cambiar la contraseña
   */
  async changePassword() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.setupChangePasswordModal();
    }
  }

  /**
   * Cierra el modal de cambio de contraseña
   */
  closePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.getElementById('change-password-form')?.reset();
      document.getElementById('password-error')?.classList.add('hidden');
      // Reset strength indicator
      const strengthFill = document.querySelector('.strength-fill');
      const strengthText = document.querySelector('.strength-text');
      if (strengthFill) strengthFill.className = 'strength-fill';
      if (strengthText) {
        strengthText.className = 'strength-text';
        strengthText.textContent = 'Ingresa una contraseña';
      }
    }
  }

  /**
   * Configura el modal de cambio de contraseña
   */
  setupChangePasswordModal() {
    const form = document.getElementById('change-password-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-new-password');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    const errorDiv = document.getElementById('password-error');
    const modal = document.getElementById('change-password-modal');

    // Close button handler
    modal.querySelector('[data-close="change-password-modal"]')?.addEventListener('click', () => {
      this.closePasswordModal();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closePasswordModal();
    });

    // Close on Escape key
    const escHandler = (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        this.closePasswordModal();
      }
    };
    document.addEventListener('keydown', escHandler);

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.onclick = () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        const eyeOpen = btn.querySelector('.eye-open');
        const eyeClosed = btn.querySelector('.eye-closed');
        
        if (input.type === 'password') {
          input.type = 'text';
          eyeOpen.style.display = 'none';
          eyeClosed.style.display = 'block';
        } else {
          input.type = 'password';
          eyeOpen.style.display = 'block';
          eyeClosed.style.display = 'none';
        }
      };
    });

    // Password strength checker
    newPasswordInput.oninput = () => {
      const password = newPasswordInput.value;
      const strength = this.checkPasswordStrength(password);
      
      strengthFill.className = 'strength-fill ' + strength.level;
      strengthText.className = 'strength-text ' + strength.level;
      strengthText.textContent = strength.text;
    };

    // Form submission
    form.onsubmit = async (e) => {
      e.preventDefault();
      
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      // Validations
      if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Las contraseñas no coinciden';
        errorDiv.classList.remove('hidden');
        return;
      }

      if (newPassword.length < 8) {
        errorDiv.textContent = 'La contraseña debe tener al menos 8 caracteres';
        errorDiv.classList.remove('hidden');
        return;
      }

      errorDiv.classList.add('hidden');

      // Show loading state
      const saveBtn = document.getElementById('save-password-btn');
      const btnText = saveBtn.querySelector('span:not(.btn-loader)');
      const btnLoader = saveBtn.querySelector('.btn-loader');
      btnText.style.display = 'none';
      btnLoader.classList.remove('hidden');
      saveBtn.disabled = true;

      try {
        const response = await fetch('/api/auth.php?action=change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al cambiar la contraseña');
        }

        // Success - show the hash and instructions
        this.closePasswordModal();
        
        // Show success modal with instructions
        this.showPasswordChangeSuccess(data.newHash);
        
      } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
      } finally {
        btnText.style.display = '';
        btnLoader.classList.add('hidden');
        saveBtn.disabled = false;
      }
    };
  }

  /**
   * Check password strength
   */
  checkPasswordStrength(password) {
    if (!password) return { level: '', text: 'Ingresa una contraseña' };
    
    let score = 0;
    
    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character types
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', text: 'Débil - Agrega más caracteres' };
    if (score <= 3) return { level: 'fair', text: 'Regular - Usa mayúsculas y números' };
    if (score <= 4) return { level: 'good', text: 'Buena - Agrega símbolos' };
    return { level: 'strong', text: 'Excelente' };
  }

  /**
   * Show success modal with password hash instructions
   */
  showPasswordChangeSuccess(newHash) {
    // Create a custom success modal
    const modal = document.getElementById('confirm-modal');
    if (!modal) {
      alert('Contraseña verificada. Nuevo hash: ' + newHash);
      return;
    }

    const icon = modal.querySelector('.confirm-icon');
    const titleEl = modal.querySelector('h3');
    const messageEl = modal.querySelector('p');
    const acceptBtn = document.getElementById('confirm-accept');
    const cancelBtn = document.getElementById('confirm-cancel');

    // Configure icon
    icon.className = 'confirm-icon info';
    const iconDanger = icon.querySelector('.icon-danger');
    const iconWarning = icon.querySelector('.icon-warning');
    const iconInfo = icon.querySelector('.icon-info');
    if (iconDanger) iconDanger.style.display = 'none';
    if (iconWarning) iconWarning.style.display = 'none';
    if (iconInfo) iconInfo.style.display = 'block';

    // Set content
    titleEl.textContent = '¡Contraseña verificada!';
    messageEl.innerHTML = `
      <p style="margin-bottom: 1rem; text-align: left;">Tu contraseña actual fue verificada. Para completar el cambio:</p>
      <ol style="text-align: left; margin-bottom: 1rem; padding-left: 1.25rem; font-size: 0.85rem;">
        <li>Ve al panel de Hostinger</li>
        <li>Sitios → Tu sitio → Configuración avanzada</li>
        <li>Variables de entorno → ADMIN_PASSWORD_HASH</li>
        <li>Pega el nuevo hash (abajo)</li>
      </ol>
      <div style="background: var(--admin-bg); padding: 0.75rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.7rem; word-break: break-all; margin-bottom: 1rem; text-align: left;">
        ${newHash}
      </div>
      <button type="button" class="btn-secondary" style="width: 100%;" onclick="navigator.clipboard.writeText('${newHash}'); this.textContent='¡Copiado!';">
        📋 Copiar Hash
      </button>
    `;

    // Configure buttons
    acceptBtn.textContent = 'Entendido';
    acceptBtn.className = 'btn-primary';
    cancelBtn.style.display = 'none';

    // Show modal
    modal.classList.remove('hidden');

    // Handler
    const cleanup = () => {
      modal.classList.add('hidden');
      cancelBtn.style.display = '';
      messageEl.innerHTML = '';
      acceptBtn.removeEventListener('click', onAccept);
    };

    const onAccept = () => {
      cleanup();
      this.showToast('Recuerda actualizar el hash en Hostinger', 'info');
    };

    acceptBtn.addEventListener('click', onAccept);
  }

  // ═══════════════════════════════════════════════════════════════
  // RECUPERACIÓN DE CONTRASEÑA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Configura el modal de "Olvidaste tu contraseña"
   */
  setupForgotPasswordModal() {
    const forgotLink = document.getElementById('forgot-password-link');
    const modal = document.getElementById('forgot-password-modal');
    const generateBtn = document.getElementById('generate-token-btn');
    const tokenDisplay = document.getElementById('recovery-token-display');
    const tokenCode = document.getElementById('recovery-token-code');
    const copyBtn = document.getElementById('copy-recovery-token');

    if (!forgotLink || !modal) return;

    // Open modal cuando se hace clic en el enlace
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.remove('hidden');
      // Reset modal state
      tokenDisplay.classList.add('hidden');
      tokenCode.textContent = '';
      generateBtn.disabled = false;
      generateBtn.querySelector('span').textContent = 'Generar Token';
    });

    // Close modal handlers
    const closeButtons = modal.querySelectorAll('[data-close="forgot-password-modal"]');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
      }
    });

    // Generate token
    generateBtn.addEventListener('click', async () => {
      try {
        generateBtn.disabled = true;
        generateBtn.querySelector('span').textContent = 'Generando...';

        const response = await fetch('/api/auth.php?action=forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al generar token');
        }

        // Show token
        tokenCode.textContent = data.token;
        tokenDisplay.classList.remove('hidden');
        generateBtn.querySelector('span').textContent = '✓ Token Generado';

        this.showToast('Token generado exitosamente', 'success');

        // Setup copy button
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(data.token);
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> ¡Copiado!';
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
          }, 2000);
        });

        // Auto-open reset modal after 2 seconds
        setTimeout(() => {
          modal.classList.add('hidden');
          document.getElementById('reset-password-modal').classList.remove('hidden');
          document.getElementById('reset-token').value = data.token;
        }, 2000);

      } catch (error) {
        console.error('Error:', error);
        this.showToast(error.message, 'error');
        generateBtn.disabled = false;
        generateBtn.querySelector('span').textContent = 'Generar Token';
      }
    });
  }

  /**
   * Configura el modal de reseteo de contraseña con token
   */
  setupResetPasswordModal() {
    const modal = document.getElementById('reset-password-modal');
    const form = document.getElementById('reset-password-form');
    const submitBtn = document.getElementById('reset-password-btn');
    const errorDiv = document.getElementById('reset-error');
    const newPasswordInput = document.getElementById('reset-new-password');
    const confirmPasswordInput = document.getElementById('reset-confirm-password');
    const strengthContainer = document.getElementById('reset-password-strength');

    if (!modal || !form) return;

    // Close modal handlers
    const closeButtons = modal.querySelectorAll('[data-close="reset-password-modal"]');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.add('hidden');
        form.reset();
        errorDiv.classList.add('hidden');
      });
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        form.reset();
        errorDiv.classList.add('hidden');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        form.reset();
        errorDiv.classList.add('hidden');
      }
    });

    // Toggle password visibility
    modal.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        const eyeOpen = btn.querySelector('.eye-open');
        const eyeClosed = btn.querySelector('.eye-closed');

        if (input.type === 'password') {
          input.type = 'text';
          eyeOpen.style.display = 'none';
          eyeClosed.style.display = 'block';
        } else {
          input.type = 'password';
          eyeOpen.style.display = 'block';
          eyeClosed.style.display = 'none';
        }
      });
    });

    // Password strength indicator
    newPasswordInput.addEventListener('input', () => {
      const strength = this.checkPasswordStrength(newPasswordInput.value);
      const strengthFill = strengthContainer.querySelector('.strength-fill');
      const strengthText = strengthContainer.querySelector('.strength-text');

      strengthFill.className = 'strength-fill ' + strength.level;
      strengthText.className = 'strength-text ' + strength.level;
      strengthText.textContent = strength.text;
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.classList.add('hidden');

      const token = document.getElementById('reset-token').value.trim();
      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      // Validations
      if (!token) {
        errorDiv.textContent = 'Ingresa el token de recuperación';
        errorDiv.classList.remove('hidden');
        return;
      }

      if (newPassword.length < 8) {
        errorDiv.textContent = 'La contraseña debe tener al menos 8 caracteres';
        errorDiv.classList.remove('hidden');
        return;
      }

      if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Las contraseñas no coinciden';
        errorDiv.classList.remove('hidden');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = 'Reseteando...';

        const response = await fetch('/api/auth.php?action=reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            token: token,
            newPassword: newPassword
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al resetear contraseña');
        }

        // Close modal and show success
        modal.classList.add('hidden');
        form.reset();
        this.showToast('Contraseña reseteada exitosamente', 'success');
        
        // Show hash instructions
        this.showPasswordChangeSuccess(data.newHash);

      } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Resetear Contraseña';
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // AUTO-GUARDADO (deshabilitado - guardado manual únicamente)
  // ═══════════════════════════════════════════════════════════════

  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // UNDO/REDO SYSTEM
  // ═══════════════════════════════════════════════════════════════

  /**
   * Guarda el estado actual del editor en el historial
   */
  saveEditorState() {
    const editor = document.getElementById('article-editor');
    if (!editor || this.isUndoRedo) return;
    
    const currentState = editor.innerHTML;
    
    // Si el nuevo estado es igual al actual, no guardar
    if (this.historyIndex >= 0 && this.editorHistory[this.historyIndex] === currentState) {
      return;
    }
    
    // Eliminar estados futuros si estamos en medio del historial
    if (this.historyIndex < this.editorHistory.length - 1) {
      this.editorHistory = this.editorHistory.slice(0, this.historyIndex + 1);
    }
    
    // Agregar nuevo estado
    this.editorHistory.push(currentState);
    
    // Limitar tamaño del historial
    if (this.editorHistory.length > CONFIG.MAX_HISTORY_SIZE) {
      this.editorHistory.shift();
    } else {
      this.historyIndex++;
    }
    
    this.updateUndoRedoButtons();
  }

  /**
   * Deshace la última acción (Ctrl+Z)
   */
  undo() {
    if (this.historyIndex <= 0) {
      this.showToast('No hay más acciones para deshacer', 'info');
      return;
    }
    
    this.isUndoRedo = true;
    this.historyIndex--;
    
    const editor = this.editorElement;
    if (editor) {
      editor.innerHTML = this.editorHistory[this.historyIndex];
      this.setupEditorImages();
      this.updateWordCount();
    }
    
    this.isUndoRedo = false;
    this.updateUndoRedoButtons();
  }

  /**
   * Rehace la última acción deshecha (Ctrl+Y)
   */
  redo() {
    if (this.historyIndex >= this.editorHistory.length - 1) {
      this.showToast('No hay más acciones para rehacer', 'info');
      return;
    }
    
    this.isUndoRedo = true;
    this.historyIndex++;
    
    const editor = this.editorElement;
    if (editor) {
      editor.innerHTML = this.editorHistory[this.historyIndex];
      this.setupEditorImages();
      this.updateWordCount();
    }
    
    this.isUndoRedo = false;
    this.updateUndoRedoButtons();
  }

  /**
   * Actualiza el estado visual de los botones Undo/Redo
   */
  updateUndoRedoButtons() {
    const undoBtn = document.querySelector('[data-command="undo"]');
    const redoBtn = document.querySelector('[data-command="redo"]');
    
    if (undoBtn) {
      undoBtn.classList.toggle('disabled', this.historyIndex <= 0);
      undoBtn.title = this.historyIndex > 0 
        ? `Deshacer (Ctrl+Z) - ${this.historyIndex} acciones disponibles` 
        : 'Nada que deshacer';
    }
    
    if (redoBtn) {
      const redoCount = this.editorHistory.length - 1 - this.historyIndex;
      redoBtn.classList.toggle('disabled', redoCount <= 0);
      redoBtn.title = redoCount > 0 
        ? `Rehacer (Ctrl+Y) - ${redoCount} acciones disponibles` 
        : 'Nada que rehacer';
    }
  }

  /**
   * Limpia el historial del editor
   */
  clearEditorHistory() {
    this.editorHistory = [];
    this.historyIndex = -1;
    this.updateUndoRedoButtons();
  }

  // ═══════════════════════════════════════════════════════════════
  // EVENT LISTENERS - Configuración de eventos globales
  // ═══════════════════════════════════════════════════════════════

  /**
   * Configura todos los event listeners de la aplicación
   * Incluye: navegación, formularios, atajos de teclado, etc.
   */
  setupEventListeners() {
    // ─── Autenticación ───
    // El login ahora se maneja con el formulario en initAuth()
    
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      this.handleLogout();
    });

    document.getElementById('change-password-btn')?.addEventListener('click', () => {
      this.changePassword();
    });

    // ─── Navegación ───
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(item.dataset.section);
      });
    });

    // View all links
    document.querySelectorAll('[data-section]').forEach(item => {
      if (!item.classList.contains('nav-item')) {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const section = item.dataset.section;
          this.navigateTo(section);
        });
      }
    });

    // Action buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleAction(action);
      });
    });

    // Mobile menu
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.querySelector('.admin-sidebar').classList.toggle('open');
    });

    // Article form - Publicar (no si el foco está en tags-input u otros campos no-submit)
    document.getElementById('article-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      // No publicar si el usuario está escribiendo tags
      if (document.activeElement?.id === 'tags-input') return;
      this.saveArticle(false); // false = no es borrador
    });

    // Botón Guardar Borrador
    document.getElementById('btn-draft')?.addEventListener('click', () => {
      this.saveArticle(true); // true = es borrador
    });

    // Atajo Ctrl+S para guardar artículo
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (this.currentSection === 'new-article') {
          e.preventDefault();
          this.saveArticle(true); // Ctrl+S guarda como borrador
        }
      }
    });

    // Title to slug
    document.getElementById('article-title')?.addEventListener('input', (e) => {
      const slug = this.generateSlug(e.target.value);
      document.getElementById('article-slug').value = slug;
    });

    // Excerpt character count with visual feedback
    document.getElementById('article-excerpt')?.addEventListener('input', (e) => {
      const count = e.target.value.length;
      const countEl = document.getElementById('excerpt-count');
      const charCount = countEl.parentElement;
      countEl.textContent = count;
      
      // Cambiar color según límite
      if (count > CONFIG.EXCERPT_DANGER_LENGTH) {
        charCount.style.color = 'var(--admin-danger)';
      } else if (count > CONFIG.EXCERPT_WARNING_LENGTH) {
        charCount.style.color = 'var(--admin-warning)';
      } else {
        charCount.style.color = 'var(--admin-text-muted)';
      }
    });

    // Meta description character count
    document.getElementById('meta-description')?.addEventListener('input', (e) => {
      const count = e.target.value.length;
      const countEl = document.getElementById('meta-description-count');
      if (countEl) {
        const charCount = countEl.parentElement;
        countEl.textContent = count;
        
        // Cambiar color según límite óptimo para SEO
        if (count > CONFIG.META_DESC_OPTIMAL) {
          charCount.style.color = 'var(--admin-danger)';
        } else if (count > CONFIG.META_DESC_WARNING) {
          charCount.style.color = 'var(--admin-warning)';
        } else {
          charCount.style.color = 'var(--admin-text-muted)';
        }
      }
    });

    // Tags input - soporta Enter y coma para separar tags
    const tagsInputEl = document.getElementById('tags-input');
    if (tagsInputEl) {
      tagsInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation(); // Evitar que el form haga submit
          const value = e.target.value;
          if (value.trim()) {
            // Separar por comas si hay múltiples tags
            const tags = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
            tags.forEach(tag => this.addTag(tag));
            e.target.value = '';
          }
        } else if (e.key === ',') {
          e.preventDefault();
          const value = e.target.value;
          if (value.trim()) {
            this.addTag(value.trim());
            e.target.value = '';
          }
        }
      });
      
      // También procesar tags al perder el foco (blur)
      tagsInputEl.addEventListener('blur', (e) => {
        const value = e.target.value.trim();
        if (value) {
          const tags = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
          tags.forEach(tag => this.addTag(tag));
          e.target.value = '';
        }
      });
    }

    // Image upload
    this.setupImageUpload();

    // Editor toolbar
    this.setupEditorToolbar();

    // Preview button
    document.getElementById('btn-preview')?.addEventListener('click', () => {
      this.showPreview();
    });

    // Close preview
    document.getElementById('close-preview')?.addEventListener('click', () => {
      document.getElementById('preview-modal').classList.add('hidden');
    });

    // Search articles
    document.getElementById('search-articles')?.addEventListener('input', (e) => {
      this.filterArticlesTable(e.target.value);
    });

    // Filter dropdowns
    document.getElementById('filter-category')?.addEventListener('change', () => {
      this.filterArticlesTable();
    });

    // Set default date
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('article-date').value = now.toISOString().slice(0, 16);
  }

  setupImageUpload() {
    const uploadArea = document.getElementById('image-upload');
    const fileInput = document.getElementById('featured-image');
    const placeholder = document.getElementById('upload-placeholder');
    const preview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const removeBtn = document.getElementById('remove-image');
    const urlInput = document.getElementById('image-url');

    placeholder?.addEventListener('click', () => fileInput.click());

    uploadArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--admin-primary)';
    });

    uploadArea?.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '';
    });

    uploadArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.handleImageFile(file);
      }
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleImageFile(file);
      }
    });

    removeBtn?.addEventListener('click', () => {
      preview.classList.add('hidden');
      placeholder.classList.remove('hidden');
      fileInput.value = '';
      previewImg.src = '';
      urlInput.value = '';
    });

    urlInput?.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url) {
        // Validar que sea una URL válida de imagen
        const isValidUrl = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) || 
                          /^https?:\/\/.+/i.test(url);
        if (isValidUrl) {
          previewImg.src = url;
          previewImg.onerror = () => {
            this.showToast('No se pudo cargar la imagen desde esa URL', 'error');
            preview.classList.add('hidden');
            placeholder.classList.remove('hidden');
          };
          previewImg.onload = () => {
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
          };
        }
      } else {
        preview.classList.add('hidden');
        placeholder.classList.remove('hidden');
      }
    });
  }

  handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('preview-img').src = e.target.result;
      document.getElementById('image-preview').classList.remove('hidden');
      document.getElementById('upload-placeholder').classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }

  setupEditorToolbar() {
    const editor = document.getElementById('article-editor');
    
    document.querySelectorAll('.editor-toolbar button').forEach(btn => {
      btn.addEventListener('click', () => {
        const command = btn.dataset.command;
        this.executeEditorCommand(command);
      });
    });

    // Word count update on input + guardar estado para Undo/Redo
    let saveStateTimeout;
    editor?.addEventListener('input', () => {
      this.updateWordCount();
      
      // Limpiar completamente el editor si está vacío (sin texto NI imágenes)
      // para que el placeholder vuelva a aparecer
      const text = editor.innerText.trim();
      const hasImages = editor.querySelector('img, .resizable-image, figure, .image-grid-container');
      const hasMedia = editor.querySelector('iframe, .youtube-embed, .video-container');
      
      if ((text === '' || text === '\n') && !hasImages && !hasMedia) {
        editor.innerHTML = '';
      }
      
      // Guardar estado con debounce (evita guardar cada keystroke)
      clearTimeout(saveStateTimeout);
      saveStateTimeout = setTimeout(() => {
        this.saveEditorState();
      }, CONFIG.DEBOUNCE_SAVE_STATE);
    });

    // Actualizar estado del toolbar al cambiar selección
    editor?.addEventListener('mouseup', () => {
      this.updateToolbarState();
      // Mostrar floating toolbar si hay texto seleccionado
      setTimeout(() => this.showFloatingToolbar(), 10);
    });
    editor?.addEventListener('keyup', (e) => {
      this.updateToolbarState();
      // Mostrar en selección con Shift+flechas
      if (e.shiftKey) {
        setTimeout(() => this.showFloatingToolbar(), 10);
      } else {
        this.hideFloatingToolbar();
      }
    });

    // Ocultar floating toolbar al hacer clic fuera o al perder selección
    document.addEventListener('mousedown', (e) => {
      const floatingToolbar = document.getElementById('floating-toolbar');
      if (floatingToolbar && !floatingToolbar.contains(e.target)) {
        // Dar tiempo por si se hizo clic en el editor (nueva selección)
        setTimeout(() => {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed) {
            this.hideFloatingToolbar();
          }
        }, 200);
      }
    });

    // Keyboard shortcuts
    editor?.addEventListener('keydown', (e) => {
      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              this.redo(); // Ctrl+Shift+Z = Redo
            } else {
              this.undo(); // Ctrl+Z = Undo
            }
            break;
          case 'y':
            e.preventDefault();
            this.redo(); // Ctrl+Y = Redo
            break;
          case 'b':
            e.preventDefault();
            this.executeEditorCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            this.executeEditorCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            this.executeEditorCommand('underline');
            break;
          case 'k':
            e.preventDefault();
            this.executeEditorCommand('link');
            break;
        }
      }
      
      // Delete/Backspace para eliminar imágenes seleccionadas
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedImg = editor.querySelector('img.selected');
        if (selectedImg) {
          e.preventDefault();
          this.deleteSelectedImage(selectedImg);
        }
        
        // También eliminar grids seleccionados
        const selectedGrid = editor.querySelector('.image-grid-container.selected');
        if (selectedGrid) {
          e.preventDefault();
          this.deleteSelectedGrid(selectedGrid);
        }

        // También eliminar contenedores de video seleccionados
        const selectedVideo = editor.querySelector('.video-container.selected, .youtube-embed.selected');
        if (selectedVideo) {
          e.preventDefault();
          selectedVideo.remove();
          this.showToast('Video eliminado', 'success');
          this.saveEditorState();
        }
      }
    });

    // ═══════════════════════════════════════════════════════════════
    // Drag & Drop de imágenes directamente en el editor
    // ═══════════════════════════════════════════════════════════════
    
    // Hacer imágenes del editor arrastrables
    editor?.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG') {
        e.dataTransfer.setData('text/editor-image', 'true');
        e.dataTransfer.effectAllowed = 'move';
        this.draggedEditorImage = e.target;
        e.target.classList.add('dragging');
      }
    });

    editor?.addEventListener('dragend', (e) => {
      if (e.target.tagName === 'IMG') {
        e.target.classList.remove('dragging');
        this.draggedEditorImage = null;
        // Remover todos los indicadores de drop
        editor.querySelectorAll('.drop-indicator').forEach(el => el.remove());
        editor.querySelectorAll('.drop-zone-active').forEach(el => el.classList.remove('drop-zone-active'));
      }
    });

    editor?.addEventListener('dragover', (e) => {
      e.preventDefault();
      
      // Si es imagen del editor siendo arrastrada
      if (this.draggedEditorImage) {
        const target = e.target.closest('img:not(.dragging)');
        
        // Remover indicadores anteriores
        editor.querySelectorAll('.drop-indicator').forEach(el => el.remove());
        editor.querySelectorAll('.drop-zone-active').forEach(el => el.classList.remove('drop-zone-active'));
        
        if (target && target !== this.draggedEditorImage) {
          // Mostrar indicador de que se puede soltar aquí
          target.classList.add('drop-zone-active');
          
          // Crear indicador visual de posición (horizontal Y vertical)
          const rect = target.getBoundingClientRect();
          const editorRect = editor.getBoundingClientRect();
          const dropX = e.clientX;
          const dropY = e.clientY;
          const midX = rect.left + rect.width / 2;
          const midY = rect.top + rect.height / 2;
          
          // Determinar si estamos en un grid
          const parentGrid = target.closest('.image-grid-container');
          
          const indicator = document.createElement('div');
          indicator.className = 'drop-indicator';
          indicator.style.position = 'absolute';
          indicator.style.backgroundColor = '#00c8ff';
          indicator.style.borderRadius = '2px';
          indicator.style.zIndex = '1000';
          indicator.style.pointerEvents = 'none';
          
          if (parentGrid) {
            // Dentro de un grid: detectar las 4 direcciones
            const isLeft = dropX < midX;
            const isTop = dropY < midY;
            
            // Calcular posición relativa dentro de la imagen (0-1)
            // Zonas: si estamos en el 25% superior o inferior, usar posicionamiento vertical
            const relativeY = (dropY - rect.top) / rect.height;
            const relativeX = (dropX - rect.left) / rect.width;
            
            // Usar vertical si estamos en el 30% superior o 30% inferior de la imagen
            const useVertical = relativeY < 0.30 || relativeY > 0.70;
            
            if (!useVertical) {
              // Movimiento horizontal (izquierda/derecha)
              indicator.style.width = '4px';
              indicator.style.height = rect.height + 'px';
              indicator.style.top = (rect.top - editorRect.top + editor.scrollTop) + 'px';
              if (isLeft) {
                indicator.style.left = (rect.left - editorRect.left - 4) + 'px';
                indicator.dataset.position = 'before';
                indicator.dataset.axis = 'horizontal';
              } else {
                indicator.style.left = (rect.right - editorRect.left) + 'px';
                indicator.dataset.position = 'after';
                indicator.dataset.axis = 'horizontal';
              }
            } else {
              // Movimiento vertical (arriba/abajo)
              indicator.style.height = '4px';
              indicator.style.width = rect.width + 'px';
              indicator.style.left = (rect.left - editorRect.left) + 'px';
              if (isTop) {
                indicator.style.top = (rect.top - editorRect.top + editor.scrollTop - 4) + 'px';
                indicator.dataset.position = 'before';
                indicator.dataset.axis = 'vertical';
              } else {
                indicator.style.top = (rect.bottom - editorRect.top + editor.scrollTop) + 'px';
                indicator.dataset.position = 'after';
                indicator.dataset.axis = 'vertical';
              }
            }
          } else {
            // Fuera de grid: solo horizontal
            indicator.style.width = '4px';
            indicator.style.height = rect.height + 'px';
            indicator.style.top = (rect.top - editorRect.top + editor.scrollTop) + 'px';
            
            if (dropX < midX) {
              indicator.style.left = (rect.left - editorRect.left - 4) + 'px';
              indicator.dataset.position = 'before';
            } else {
              indicator.style.left = (rect.right - editorRect.left) + 'px';
              indicator.dataset.position = 'after';
            }
          }
          
          editor.style.position = 'relative';
          editor.appendChild(indicator);
        }
      } else {
        editor.classList.add('drag-over');
      }
    });

    editor?.addEventListener('dragleave', (e) => {
      // Solo remover si realmente salimos del editor
      if (!editor.contains(e.relatedTarget)) {
        editor.classList.remove('drag-over');
        editor.querySelectorAll('.drop-indicator').forEach(el => el.remove());
        editor.querySelectorAll('.drop-zone-active').forEach(el => el.classList.remove('drop-zone-active'));
      }
    });

    editor?.addEventListener('drop', (e) => {
      e.preventDefault();
      editor.classList.remove('drag-over');
      editor.querySelectorAll('.drop-indicator').forEach(el => el.remove());
      editor.querySelectorAll('.drop-zone-active').forEach(el => el.classList.remove('drop-zone-active'));
      
      // Si es una imagen del editor siendo movida
      if (this.draggedEditorImage) {
        const targetImg = e.target.closest('img:not(.dragging)');
        
        if (targetImg && targetImg !== this.draggedEditorImage) {
          this.handleImageDropOnImage(this.draggedEditorImage, targetImg, e);
        }
        
        this.draggedEditorImage = null;
        return;
      }
      
      // Verificar si es un archivo de imagen
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          this.insertImageFromFile(file);
          return;
        }
      }
      
      // Verificar si es una URL de imagen arrastrada
      const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
      if (url && (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || url.startsWith('data:image'))) {
        this.insertImageAtCursor(url);
      }
    });

    // Click en imágenes del editor para seleccionar/redimensionar
    editor?.addEventListener('click', (e) => {
      const target = e.target;
      
      // Click en imagen (incluso dentro de grids)
      if (target.tagName === 'IMG') {
        // Siempre seleccionar la imagen individual, incluso en grids
        this.selectEditorImage(target);
      } 
      // Click en grid container (pero no en una imagen)
      else if (target.classList.contains('image-grid-container')) {
        this.selectEditorGrid(target);
      }
      // Click en video container (para poder seleccionarlo y eliminarlo)
      else if (target.closest('.video-container') || target.closest('.youtube-embed')) {
        const videoContainer = target.closest('.video-container') || target.closest('.youtube-embed');
        // No actuar si se hizo clic en el toolbar
        if (target.closest('.video-toolbar')) return;
        this.deselectEditorImages();
        this.deselectEditorGrids();
        editor.querySelectorAll('.video-container.selected, .youtube-embed.selected').forEach(el => {
          el.classList.remove('selected');
          el.style.outline = '';
          el.style.outlineOffset = '';
          const tb = el.querySelector('.video-toolbar');
          if (tb) tb.remove();
        });
        videoContainer.classList.add('selected');
        videoContainer.style.outline = '2px solid var(--admin-primary, #ffd166)';
        videoContainer.style.outlineOffset = '-2px';
        this.createVideoToolbar(videoContainer);
      }
      // Click fuera - deseleccionar
      else {
        this.deselectEditorImages();
        this.deselectEditorGrids();
        editor.querySelectorAll('.video-container.selected, .youtube-embed.selected').forEach(el => {
          el.classList.remove('selected');
          el.style.outline = '';
          el.style.outlineOffset = '';
          const tb = el.querySelector('.video-toolbar');
          if (tb) tb.remove();
        });
      }
    });

    // Doble clic en imagen para abrir modal de redimensionamiento manual
    editor?.addEventListener('dblclick', (e) => {
      const target = e.target;
      if (target.tagName === 'IMG') {
        e.preventDefault();
        this.openImageResizeModal(target);
      }
    });
  }

  deleteSelectedImage(img) {
    // Verificar si la imagen está dentro de un grid
    const parentGrid = img.closest('.image-grid-container');
    
    if (parentGrid) {
      // La imagen está en un grid - eliminar solo esta imagen
      let elementToRemove = img;
      
      // Buscar el contenedor inmediato de la imagen dentro del grid
      if (img.parentElement.classList.contains('image-resize-wrapper')) {
        elementToRemove = img.parentElement;
      }
      if (elementToRemove.parentElement && elementToRemove.parentElement !== parentGrid) {
        // Puede estar en un figure o div adicional
        if (['FIGURE', 'DIV'].includes(elementToRemove.parentElement.tagName) && 
            elementToRemove.parentElement.parentElement === parentGrid) {
          elementToRemove = elementToRemove.parentElement;
        }
      }
      
      elementToRemove.remove();
      
      // Contar imágenes restantes en el grid
      const remainingImages = parentGrid.querySelectorAll('img');
      
      if (remainingImages.length === 0) {
        // No quedan imágenes - eliminar el grid completo
        parentGrid.remove();
        this.showToast('Galería eliminada', 'success');
      } else if (remainingImages.length === 1) {
        // Solo queda 1 imagen - deshacer el grid y dejar la imagen suelta
        const lastImg = remainingImages[0];
        
        // Crear nueva imagen limpia (sin wrapper de resize)
        const newImg = document.createElement('img');
        newImg.src = lastImg.src;
        newImg.alt = lastImg.alt || '';
        newImg.className = 'editor-image resizable';
        newImg.draggable = true;
        newImg.style.maxWidth = '100%';
        newImg.style.height = 'auto';
        // Preservar dimensiones si las tenía
        if (lastImg.style.width) {
          newImg.style.width = lastImg.style.width;
        }
        
        // Crear nuevo párrafo con la imagen
        const newP = document.createElement('p');
        newP.appendChild(newImg);
        parentGrid.parentElement.insertBefore(newP, parentGrid);
        parentGrid.remove();
        
        this.showToast('Imagen eliminada, galería deshecha', 'success');
      } else {
        // Quedan varias imágenes - ajustar columnas si es necesario
        const currentCols = parseInt(parentGrid.className.match(/cols-(\d+)/)?.[1] || 2);
        if (remainingImages.length < currentCols) {
          // Reducir columnas
          parentGrid.className = parentGrid.className.replace(/cols-\d+/, `cols-${remainingImages.length}`);
        }
        this.showToast('Imagen eliminada de la galería', 'success');
      }
    } else {
      // Imagen suelta - eliminar normalmente
      let elementToRemove = img;
      
      if (img.parentElement.classList.contains('image-resize-wrapper')) {
        elementToRemove = img.parentElement;
      }
      if (elementToRemove.parentElement.tagName === 'FIGURE') {
        elementToRemove = elementToRemove.parentElement;
      }
      if (elementToRemove.parentElement.tagName === 'P' && elementToRemove.parentElement.childNodes.length === 1) {
        elementToRemove = elementToRemove.parentElement;
      }
      
      elementToRemove.remove();
      this.showToast('Imagen eliminada', 'success');
    }
    
    // Guardar estado para Undo/Redo
    this.saveEditorState();
  }

  deleteSelectedGrid(grid) {
    grid.remove();
    this.showToast('Galería eliminada', 'success');
    
    // Guardar estado para Undo/Redo
    this.saveEditorState();
  }

  // ═══════════════════════════════════════════════════════════════
  // Manejar cuando se arrastra una imagen sobre otra
  // ═══════════════════════════════════════════════════════════════
  handleImageDropOnImage(draggedImg, targetImg, event) {
    const editor = document.getElementById('article-editor');
    
    // Obtener información del indicador antes de que se elimine
    const indicator = editor.querySelector('.drop-indicator');
    const indicatorPosition = indicator?.dataset.position || 'after';
    const indicatorAxis = indicator?.dataset.axis || 'horizontal';
    
    // Obtener el contenedor de la imagen arrastrada
    let draggedElement = draggedImg;
    if (draggedImg.parentElement.classList.contains('image-resize-wrapper')) {
      draggedElement = draggedImg.parentElement;
    }
    const draggedParentGrid = draggedImg.closest('.image-grid-container');
    
    // Obtener el contenedor de la imagen objetivo
    let targetElement = targetImg;
    if (targetImg.parentElement.classList.contains('image-resize-wrapper')) {
      targetElement = targetImg.parentElement;
    }
    const targetParentGrid = targetImg.closest('.image-grid-container');
    
    // Usar la posición del indicador
    const insertBefore = indicatorPosition === 'before';
    
    // CASO 1: Ambas imágenes están en el mismo grid - reordenar
    if (draggedParentGrid && targetParentGrid && draggedParentGrid === targetParentGrid) {
      if (insertBefore) {
        targetParentGrid.insertBefore(draggedElement, targetElement);
      } else {
        targetParentGrid.insertBefore(draggedElement, targetElement.nextSibling);
      }
      this.saveEditorState();
      this.showToast('Imagen reordenada', 'success');
      return;
    }
    
    // CASO 2: Imagen arrastrada está en un grid, target está fuera - sacarla del grid
    if (draggedParentGrid && !targetParentGrid) {
      // Crear imagen limpia para insertar fuera
      const newImg = this.createCleanImage(draggedImg);
      const newP = document.createElement('p');
      newP.appendChild(newImg);
      
      // Encontrar el párrafo/contenedor del target
      let targetContainer = targetElement;
      while (targetContainer.parentElement && targetContainer.parentElement !== editor) {
        targetContainer = targetContainer.parentElement;
      }
      
      // Insertar antes o después
      if (insertBefore) {
        targetContainer.parentElement.insertBefore(newP, targetContainer);
      } else {
        targetContainer.parentElement.insertBefore(newP, targetContainer.nextSibling);
      }
      
      // Eliminar del grid original
      draggedElement.remove();
      
      // Verificar si el grid original necesita ajustes
      const remainingImages = draggedParentGrid.querySelectorAll('img');
      if (remainingImages.length === 0) {
        draggedParentGrid.remove();
      } else if (remainingImages.length === 1) {
        // Deshacer el grid - crear imagen limpia
        const lastImg = remainingImages[0];
        const newLastImg = this.createCleanImage(lastImg);
        const newPara = document.createElement('p');
        newPara.appendChild(newLastImg);
        draggedParentGrid.parentElement.insertBefore(newPara, draggedParentGrid);
        draggedParentGrid.remove();
      } else {
        // Ajustar columnas
        const currentCols = parseInt(draggedParentGrid.className.match(/cols-(\d+)/)?.[1] || 2);
        if (remainingImages.length < currentCols) {
          draggedParentGrid.className = draggedParentGrid.className.replace(/cols-\d+/, `cols-${Math.min(remainingImages.length, 4)}`);
        }
      }
      
      this.saveEditorState();
      this.showToast('Imagen sacada de la galería', 'success');
      return;
    }
    
    // CASO 3: Imagen arrastrada está fuera, target está en un grid - agregarla al grid
    if (!draggedParentGrid && targetParentGrid) {
      // Crear imagen limpia para agregar al grid
      const newImg = this.createCleanImage(draggedImg);
      
      // Insertar en el grid
      if (insertBefore) {
        targetParentGrid.insertBefore(newImg, targetElement);
      } else {
        targetParentGrid.insertBefore(newImg, targetElement.nextSibling);
      }
      
      // Ajustar columnas del grid (máximo 4)
      const newTotal = targetParentGrid.querySelectorAll('img').length;
      const newCols = Math.min(newTotal, 4);
      targetParentGrid.className = targetParentGrid.className.replace(/cols-\d+/, `cols-${newCols}`);
      
      // Eliminar imagen original
      let originalContainer = draggedElement;
      while (originalContainer.parentElement && originalContainer.parentElement !== editor) {
        if (originalContainer.parentElement.childNodes.length === 1) {
          originalContainer = originalContainer.parentElement;
        } else {
          break;
        }
      }
      originalContainer.remove();
      
      this.saveEditorState();
      this.showToast('Imagen agregada a la galería', 'success');
      return;
    }
    
    // CASO 4: Ambas imágenes están fuera de grids
    if (!draggedParentGrid && !targetParentGrid) {
      // Encontrar el contenedor del target
      let targetContainer = targetElement;
      while (targetContainer.parentElement && targetContainer.parentElement !== editor) {
        targetContainer = targetContainer.parentElement;
      }
      
      // Encontrar el contenedor del dragged
      let draggedContainer = draggedElement;
      while (draggedContainer.parentElement && draggedContainer.parentElement !== editor) {
        if (draggedContainer.parentElement.childNodes.length === 1) {
          draggedContainer = draggedContainer.parentElement;
        } else {
          break;
        }
      }
      
      if (indicatorAxis === 'vertical') {
        // VERTICAL: Poner imágenes en párrafos separados (una encima de otra)
        const newImg = this.createCleanImage(draggedImg);
        const newP = document.createElement('p');
        newP.appendChild(newImg);
        
        if (insertBefore) {
          targetContainer.parentElement.insertBefore(newP, targetContainer);
        } else {
          targetContainer.parentElement.insertBefore(newP, targetContainer.nextSibling);
        }
        
        // Eliminar imagen original
        draggedContainer.remove();
        
        this.saveEditorState();
        this.showToast('Imagen movida', 'success');
      } else {
        // HORIZONTAL: Crear grid de 2 columnas (lado a lado)
        const grid = document.createElement('div');
        grid.className = 'image-grid-container cols-2';
        grid.style.gap = '8px';
        
        // Crear imágenes limpias
        const img1 = this.createCleanImage(targetImg);
        const img2 = this.createCleanImage(draggedImg);
        
        // Ordenar según posición
        if (insertBefore) {
          grid.appendChild(img2);
          grid.appendChild(img1);
        } else {
          grid.appendChild(img1);
          grid.appendChild(img2);
        }
        
        // Insertar el grid
        targetContainer.parentElement.insertBefore(grid, targetContainer);
        
        // Eliminar las imágenes originales
        targetContainer.remove();
        draggedContainer.remove();
        
        this.saveEditorState();
        this.showToast('Galería creada con 2 imágenes', 'success');
      }
      return;
    }
    
    // CASO 5: Ambas están en grids diferentes - mover de un grid a otro
    if (draggedParentGrid && targetParentGrid && draggedParentGrid !== targetParentGrid) {
      // Crear imagen limpia para agregar al grid destino
      const newImg = this.createCleanImage(draggedImg);
      
      if (insertBefore) {
        targetParentGrid.insertBefore(newImg, targetElement);
      } else {
        targetParentGrid.insertBefore(newImg, targetElement.nextSibling);
      }
      
      // Ajustar columnas del grid destino
      const newTotal = targetParentGrid.querySelectorAll('img').length;
      targetParentGrid.className = targetParentGrid.className.replace(/cols-\d+/, `cols-${Math.min(newTotal, 4)}`);
      
      // Eliminar del grid origen
      draggedElement.remove();
      
      // Verificar grid origen
      const remainingImages = draggedParentGrid.querySelectorAll('img');
      if (remainingImages.length === 0) {
        draggedParentGrid.remove();
      } else if (remainingImages.length === 1) {
        // Crear imagen limpia para la última imagen
        const lastImg = remainingImages[0];
        const newLastImg = this.createCleanImage(lastImg);
        const newPara = document.createElement('p');
        newPara.appendChild(newLastImg);
        draggedParentGrid.parentElement.insertBefore(newPara, draggedParentGrid);
        draggedParentGrid.remove();
      } else {
        const currentCols = parseInt(draggedParentGrid.className.match(/cols-(\d+)/)?.[1] || 2);
        if (remainingImages.length < currentCols) {
          draggedParentGrid.className = draggedParentGrid.className.replace(/cols-\d+/, `cols-${Math.min(remainingImages.length, 4)}`);
        }
      }
      
      this.saveEditorState();
      this.showToast('Imagen movida entre galerías', 'success');
    }
  }

  /**
   * Crea una imagen limpia desde otra imagen
   * 
   * @param {HTMLImageElement} sourceImg - Imagen fuente
   * @returns {HTMLImageElement} Nueva imagen con clases y atributos correctos
   * @description Usado al mover imágenes entre grids o al editor.
   * Preserva src, alt, y dimensiones si existen.
   */
  createCleanImage(sourceImg) {
    const newImg = document.createElement('img');
    newImg.src = sourceImg.src;
    newImg.alt = sourceImg.alt || '';
    newImg.className = 'editor-image resizable';
    newImg.draggable = true;
    newImg.style.maxWidth = '100%';
    newImg.style.height = 'auto';
    // Preservar dimensiones si existen
    if (sourceImg.style.width) newImg.style.width = sourceImg.style.width;
    if (sourceImg.style.height && sourceImg.style.height !== 'auto') {
      newImg.style.height = sourceImg.style.height;
    }
    return newImg;
  }

  /**
   * Reconfigura las imágenes del editor después de restaurar el HTML
   * (necesario para Undo/Redo y cargar contenido)
   */
  setupEditorImages() {
    const editor = document.getElementById('article-editor');
    if (!editor) return;
    
    // Asegurar que todas las imágenes sean arrastrables
    editor.querySelectorAll('img').forEach(img => {
      img.draggable = true;
      if (!img.classList.contains('editor-image')) {
        img.classList.add('editor-image');
      }
      if (!img.classList.contains('resizable')) {
        img.classList.add('resizable');
      }
    });
    
    // Limpiar cualquier estado de selección o wrapper de resize huérfano
    editor.querySelectorAll('.image-resize-wrapper').forEach(wrapper => {
      const img = wrapper.querySelector('img');
      if (img) {
        wrapper.parentElement.insertBefore(img, wrapper);
      }
      wrapper.remove();
    });
    
    // Limpiar contenedores de video vacíos (iframes eliminados por sanitización anterior)
    editor.querySelectorAll('.video-container, .youtube-embed').forEach(container => {
      if (!container.querySelector('iframe')) {
        container.remove();
      }
    });

    // Deseleccionar todo
    this.deselectEditorImages();
    this.deselectEditorGrids();
  }

  selectEditorGrid(grid) {
    // Deseleccionar otras cosas
    this.deselectEditorImages();
    this.deselectEditorGrids();
    
    // Marcar grid como seleccionado
    grid.classList.add('selected');
  }

  deselectEditorGrids() {
    const editor = document.getElementById('article-editor');
    editor?.querySelectorAll('.image-grid-container.selected').forEach(grid => {
      grid.classList.remove('selected');
    });
  }

  insertImageFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.insertImageAtCursor(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  insertImageAtCursor(url) {
    const editor = document.getElementById('article-editor');
    editor.focus();
    
    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.className = 'editor-image resizable';
    img.draggable = true; // Hacer la imagen arrastrable
    
    // Insertar en la posición del cursor
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      // Envolver en un párrafo si es necesario
      const wrapper = document.createElement('p');
      wrapper.appendChild(img);
      range.insertNode(wrapper);
      
      // Mover cursor después de la imagen
      range.setStartAfter(wrapper);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editor.appendChild(img);
    }
    
    // Guardar estado para Undo/Redo
    this.saveEditorState();
    
    this.showToast('Imagen insertada', 'success');
  }

  selectEditorImage(img) {
    // Deseleccionar otras
    this.deselectEditorImages();
    this.deselectEditorGrids();
    
    // Marcar como seleccionada
    img.classList.add('selected');
    
    // Verificar si la imagen está dentro de un grid
    const isInGrid = img.closest('.image-grid-container') !== null;
    
    // NO crear handles de redimensionamiento para imágenes en grids
    // El grid CSS maneja el tamaño automáticamente
    if (isInGrid) {
      // Solo marcar como seleccionada, sin wrapper
      return;
    }
    
    // Crear handles de redimensionamiento si no existen (solo para imágenes fuera de grids)
    let wrapper;
    if (!img.parentElement.classList.contains('image-resize-wrapper')) {
      wrapper = document.createElement('span');
      wrapper.className = 'image-resize-wrapper has-selected';
      wrapper.contentEditable = 'false';
      img.parentElement.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      
      // Agregar handles
      ['nw', 'ne', 'sw', 'se'].forEach(pos => {
        const handle = document.createElement('span');
        handle.className = `resize-handle ${pos}`;
        handle.dataset.position = pos;
        wrapper.appendChild(handle);
        
        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          this.startImageResize(img, pos, e);
        });
      });
    } else {
      wrapper = img.parentElement;
      wrapper.classList.add('has-selected');
    }
    
    // Crear toolbar de alineación sobre la imagen
    wrapper.classList.add('selected');
    this.selectedImage = wrapper;
    this.createImageToolbar(wrapper);
  }

  deselectEditorImages() {
    const editor = document.getElementById('article-editor');
    // Remover toolbars y estado de selección de wrappers
    editor?.querySelectorAll('.image-resize-wrapper.selected, .image-resize-wrapper.has-selected').forEach(w => {
      w.classList.remove('selected', 'has-selected');
      const toolbar = w.querySelector('.image-toolbar');
      if (toolbar) toolbar.remove();
    });
    editor?.querySelectorAll('img.selected').forEach(img => {
      img.classList.remove('selected');
    });
    this.selectedImage = null;
  }

  startImageResize(img, position, startEvent) {
    const startWidth = img.offsetWidth;
    const startHeight = img.offsetHeight;
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;
    const aspectRatio = startWidth / startHeight;

    const onMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth, newHeight;
      
      if (position.includes('e')) {
        newWidth = startWidth + deltaX;
      } else {
        newWidth = startWidth - deltaX;
      }
      
      // Mantener aspect ratio
      newHeight = newWidth / aspectRatio;
      
      // Mínimo 50px
      if (newWidth >= 50) {
        img.style.width = newWidth + 'px';
        img.style.height = 'auto';
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // ═══════════════════════════════════════════════════════════════
  // MODAL DE REDIMENSIONAMIENTO MANUAL
  // ═══════════════════════════════════════════════════════════════

  openImageResizeModal(img) {
    const modal = document.getElementById('image-resize-modal');
    const previewImg = document.getElementById('resize-preview-img');
    const widthInput = document.getElementById('resize-width');
    const heightInput = document.getElementById('resize-height');
    const originalSize = document.getElementById('original-size');
    
    // Guardar referencia a la imagen que estamos editando
    this.resizingImage = img;
    
    // Obtener dimensiones originales (natural) y actuales
    this.originalImageWidth = img.naturalWidth;
    this.originalImageHeight = img.naturalHeight;
    this.aspectRatio = this.originalImageWidth / this.originalImageHeight;
    this.lockAspectRatio = true;
    
    // Mostrar vista previa
    previewImg.src = img.src;
    
    // Mostrar dimensiones originales
    originalSize.textContent = `${this.originalImageWidth} x ${this.originalImageHeight}`;
    
    // Poner dimensiones actuales en los inputs
    const currentWidth = img.offsetWidth || img.naturalWidth;
    const currentHeight = img.offsetHeight || img.naturalHeight;
    widthInput.value = Math.round(currentWidth);
    heightInput.value = Math.round(currentHeight);
    
    // Asegurar que el botón de lock esté activo
    document.getElementById('lock-aspect-ratio').classList.add('active');
    
    // Mostrar modal
    modal.classList.remove('hidden');
    
    // Focus en el input de ancho
    setTimeout(() => widthInput.select(), 100);
  }

  setupImageResizeModal() {
    const modal = document.getElementById('image-resize-modal');
    const widthInput = document.getElementById('resize-width');
    const heightInput = document.getElementById('resize-height');
    const lockBtn = document.getElementById('lock-aspect-ratio');
    const resetBtn = document.getElementById('reset-size-btn');
    const applyBtn = document.getElementById('apply-resize-btn');
    
    // Toggle lock aspect ratio
    lockBtn?.addEventListener('click', () => {
      this.lockAspectRatio = !this.lockAspectRatio;
      lockBtn.classList.toggle('active', this.lockAspectRatio);
      
      // Si se activa el lock, recalcular altura basada en el ancho actual
      if (this.lockAspectRatio && widthInput.value) {
        heightInput.value = Math.round(parseInt(widthInput.value) / this.aspectRatio);
      }
    });
    
    // Cambio de ancho - actualizar altura si está bloqueado
    widthInput?.addEventListener('input', () => {
      if (this.lockAspectRatio && widthInput.value) {
        const newWidth = parseInt(widthInput.value);
        if (newWidth >= CONFIG.MIN_IMAGE_SIZE) {
          heightInput.value = Math.round(newWidth / this.aspectRatio);
        }
      }
    });
    
    // Cambio de altura - actualizar ancho si está bloqueado
    heightInput?.addEventListener('input', () => {
      if (this.lockAspectRatio && heightInput.value) {
        const newHeight = parseInt(heightInput.value);
        if (newHeight >= CONFIG.MIN_IMAGE_SIZE) {
          widthInput.value = Math.round(newHeight * this.aspectRatio);
        }
      }
    });
    
    // Restablecer tamaño original
    resetBtn?.addEventListener('click', () => {
      widthInput.value = this.originalImageWidth;
      heightInput.value = this.originalImageHeight;
    });
    
    // Aplicar redimensionamiento
    applyBtn?.addEventListener('click', () => {
      this.applyImageResize();
    });
    
    // Enter para aplicar
    widthInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.applyImageResize();
      }
    });
    
    heightInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.applyImageResize();
      }
    });
  }

  applyImageResize() {
    const widthInput = document.getElementById('resize-width');
    const heightInput = document.getElementById('resize-height');
    const modal = document.getElementById('image-resize-modal');
    
    const newWidth = parseInt(widthInput.value);
    const newHeight = parseInt(heightInput.value);
    
    // Validar dimensiones
    if (!newWidth || newWidth < CONFIG.MIN_IMAGE_SIZE) {
      this.showToast(`El ancho mínimo es ${CONFIG.MIN_IMAGE_SIZE}px`, 'warning');
      return;
    }
    
    if (!newHeight || newHeight < CONFIG.MIN_IMAGE_SIZE) {
      this.showToast(`El alto mínimo es ${CONFIG.MIN_IMAGE_SIZE}px`, 'warning');
      return;
    }
    
    // Aplicar dimensiones a la imagen
    if (this.resizingImage) {
      this.resizingImage.style.width = newWidth + 'px';
      this.resizingImage.style.height = this.lockAspectRatio ? 'auto' : newHeight + 'px';
      
      this.showToast('Imagen redimensionada', 'success');
    }
    
    // Cerrar modal
    modal.classList.add('hidden');
    this.resizingImage = null;
  }

  executeEditorCommand(command) {
    const editor = document.getElementById('article-editor');
    
    // Guardar selección antes de focus para no perderla
    const sel = window.getSelection();
    let savedRange = null;
    if (sel && sel.rangeCount > 0) {
      savedRange = sel.getRangeAt(0).cloneRange();
    }
    
    editor.focus();
    
    // Restaurar la selección si se perdió (ej: desde floating toolbar)
    if (savedRange && editor.contains(savedRange.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }

    switch (command) {
      case 'undo':
        this.undo();
        return; // No guardar estado después de undo
      case 'redo':
        this.redo();
        return; // No guardar estado después de redo
      case 'bold':
        document.execCommand('bold', false, null);
        break;
      case 'italic':
        document.execCommand('italic', false, null);
        break;
      case 'underline':
        document.execCommand('underline', false, null);
        break;
      case 'h2':
        document.execCommand('formatBlock', false, 'h2');
        break;
      case 'h3':
        document.execCommand('formatBlock', false, 'h3');
        break;
      case 'p':
        document.execCommand('formatBlock', false, 'p');
        break;
      case 'ul':
        document.execCommand('insertUnorderedList', false, null);
        break;
      case 'quote': {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
          let node = sel.getRangeAt(0).commonAncestorContainer;
          if (node.nodeType === 3) node = node.parentNode;
          const bq = node.closest('blockquote');
          if (bq) {
            // Ya está en blockquote → sacar el contenido
            const parent = bq.parentNode;
            while (bq.firstChild) {
              parent.insertBefore(bq.firstChild, bq);
            }
            parent.removeChild(bq);
          } else {
            document.execCommand('formatBlock', false, 'blockquote');
          }
        }
        break;
      }
      case 'link':
        this.saveEditorSelection();
        this.showLinkModal();
        return; // No guardar estado aquí, se guarda al insertar
      case 'justifyLeft':
        if (this.selectedImage) {
          this.setImageAlignment(this.selectedImage, 'left');
        } else {
          document.execCommand('justifyLeft', false, null);
        }
        break;
      case 'justifyCenter':
        if (this.selectedImage) {
          this.setImageAlignment(this.selectedImage, 'center');
        } else {
          document.execCommand('justifyCenter', false, null);
        }
        break;
      case 'justifyRight':
        if (this.selectedImage) {
          this.setImageAlignment(this.selectedImage, 'right');
        } else {
          document.execCommand('justifyRight', false, null);
        }
        break;
      case 'justifyFull':
        document.execCommand('justifyFull', false, null);
        break;
      case 'image':
        this.openImageModal();
        return; // No guardar estado aquí, se guarda al insertar la imagen
      case 'image-grid':
        this.openGridModal();
        return; // No guardar estado aquí, se guarda al insertar el grid
      case 'gallery':
        this.openGalleryModal();
        return; // Solo abre la galería para ver/copiar URLs
      case 'youtube':
        this.insertYouTube();
        return; // Maneja su propia lógica
      case 'hr':
        document.execCommand('insertHTML', false, '<hr>');
        break;
      case 'clear':
        document.execCommand('removeFormat', false, null);
        // Limpiar estilos inline y bloques (blockquote, headings)
        const clearSel = window.getSelection();
        if (clearSel.rangeCount > 0) {
          let node = clearSel.getRangeAt(0).commonAncestorContainer;
          if (node.nodeType === 3) node = node.parentNode;
          // Sacar de blockquote si aplica
          const bq = node.closest('blockquote');
          if (bq) {
            const parent = bq.parentNode;
            while (bq.firstChild) {
              parent.insertBefore(bq.firstChild, bq);
            }
            parent.removeChild(bq);
          }
          // Convertir headings a párrafo
          const heading = node.closest('h1, h2, h3, h4, h5, h6');
          if (heading) {
            document.execCommand('formatBlock', false, 'p');
          }
        }
        this.showToast('Formato limpiado', 'success');
        break;
    }
    
    // Guardar estado después de comandos de formato
    this.saveEditorState();
    
    // Actualizar estado de botones del toolbar
    this.updateToolbarState();
  }

  updateToolbarState() {
    // Actualizar botones de formato según estado actual
    const toolbarBtns = document.querySelectorAll('.editor-toolbar button[data-command]');
    
    toolbarBtns.forEach(btn => {
      const command = btn.dataset.command;
      let isActive = false;
      
      switch (command) {
        case 'bold':
          isActive = document.queryCommandState('bold');
          break;
        case 'italic':
          isActive = document.queryCommandState('italic');
          break;
        case 'underline':
          isActive = document.queryCommandState('underline');
          break;
        case 'justifyLeft':
          isActive = document.queryCommandState('justifyLeft');
          break;
        case 'justifyCenter':
          isActive = document.queryCommandState('justifyCenter');
          break;
        case 'justifyRight':
          isActive = document.queryCommandState('justifyRight');
          break;
        case 'justifyFull':
          isActive = document.queryCommandState('justifyFull');
          break;
      }
      
      btn.classList.toggle('active', isActive);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // FLOATING TOOLBAR - Mini toolbar al seleccionar texto
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crea el floating toolbar HTML si no existe
   */
  createFloatingToolbar() {
    if (document.getElementById('floating-toolbar')) return;

    const toolbar = document.createElement('div');
    toolbar.id = 'floating-toolbar';
    toolbar.className = 'floating-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Herramientas de formato de texto');
    toolbar.innerHTML = `
      <button data-cmd="bold" title="Negrita (Ctrl+B)" aria-label="Negrita">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
        </svg>
      </button>
      <button data-cmd="italic" title="Cursiva (Ctrl+I)" aria-label="Cursiva">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>
        </svg>
      </button>
      <button data-cmd="underline" title="Subrayado (Ctrl+U)" aria-label="Subrayado">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>
        </svg>
      </button>
      <span class="floating-toolbar-divider"></span>
      <button data-cmd="h2" title="Título H2" aria-label="Título H2">
        <span class="ft-text">H2</span>
      </button>
      <button data-cmd="h3" title="Subtítulo H3" aria-label="Subtítulo H3">
        <span class="ft-text">H3</span>
      </button>
      <button data-cmd="p" title="Párrafo" aria-label="Párrafo">
        <span class="ft-text">P</span>
      </button>
      <span class="floating-toolbar-divider"></span>
      <button data-cmd="justifyLeft" title="Alinear izquierda" aria-label="Alinear izquierda">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>
        </svg>
      </button>
      <button data-cmd="justifyCenter" title="Centrar" aria-label="Centrar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/>
        </svg>
      </button>
      <button data-cmd="justifyRight" title="Alinear derecha" aria-label="Alinear derecha">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/>
        </svg>
      </button>
      <button data-cmd="justifyFull" title="Justificar" aria-label="Justificar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/>
        </svg>
      </button>
      <span class="floating-toolbar-divider"></span>
      <button data-cmd="link" title="Enlace (Ctrl+K)" aria-label="Enlace">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </button>
      <button data-cmd="quote" title="Cita" aria-label="Cita">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
        </svg>
      </button>
      <button data-cmd="clear" title="Limpiar formato" aria-label="Limpiar formato">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="floating-toolbar-arrow"></div>
    `;

    // Event listeners para los botones
    toolbar.querySelectorAll('button[data-cmd]').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Evitar que pierda la selección del texto
        e.stopPropagation();
        const cmd = btn.dataset.cmd;
        this.executeEditorCommand(cmd);
        // Actualizar estado activo de los botones del floating toolbar
        this.updateFloatingToolbarState();
        // Ocultar si fue un comando de bloque o link
        if (['h2', 'h3', 'p', 'quote', 'clear'].includes(cmd)) {
          this.hideFloatingToolbar();
        }
      });
    });

    document.body.appendChild(toolbar);
  }

  /**
   * Muestra el floating toolbar sobre el texto seleccionado
   */
  showFloatingToolbar() {
    const editor = document.getElementById('article-editor');
    const selection = window.getSelection();
    
    if (!editor || !selection || selection.isCollapsed || selection.toString().trim() === '') {
      this.hideFloatingToolbar();
      return;
    }

    // Verificar que la selección está dentro del editor
    if (!editor.contains(selection.anchorNode) || !editor.contains(selection.focusNode)) {
      this.hideFloatingToolbar();
      return;
    }

    // Crear toolbar si no existe
    this.createFloatingToolbar();
    const toolbar = document.getElementById('floating-toolbar');
    if (!toolbar) return;

    // Obtener posición de la selección
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Calcular posición centrada sobre la selección
    const toolbarWidth = 360;
    let left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
    let top = rect.top - 52; // Encima de la selección

    // Ajustar si se sale de pantalla por los lados
    const margin = 8;
    if (left < margin) left = margin;
    if (left + toolbarWidth > window.innerWidth - margin) {
      left = window.innerWidth - toolbarWidth - margin;
    }

    // Si no hay espacio arriba, mostrar debajo
    if (top < margin) {
      top = rect.bottom + 10;
      toolbar.classList.add('arrow-top');
      toolbar.classList.remove('arrow-bottom');
    } else {
      toolbar.classList.add('arrow-bottom');
      toolbar.classList.remove('arrow-top');
    }

    toolbar.style.left = `${left}px`;
    toolbar.style.top = `${top + window.scrollY}px`;
    toolbar.classList.add('visible');
    
    // Actualizar estado activo
    this.updateFloatingToolbarState();
  }

  /**
   * Oculta el floating toolbar
   */
  hideFloatingToolbar() {
    const toolbar = document.getElementById('floating-toolbar');
    if (toolbar) {
      toolbar.classList.remove('visible');
    }
  }

  /**
   * Actualiza el estado activo/inactivo de los botones del floating toolbar
   */
  updateFloatingToolbarState() {
    const toolbar = document.getElementById('floating-toolbar');
    if (!toolbar || !toolbar.classList.contains('visible')) return;

    toolbar.querySelectorAll('button[data-cmd]').forEach(btn => {
      const cmd = btn.dataset.cmd;
      let isActive = false;
      switch (cmd) {
        case 'bold': isActive = document.queryCommandState('bold'); break;
        case 'italic': isActive = document.queryCommandState('italic'); break;
        case 'underline': isActive = document.queryCommandState('underline'); break;
        case 'justifyLeft': isActive = document.queryCommandState('justifyLeft'); break;
        case 'justifyCenter': isActive = document.queryCommandState('justifyCenter'); break;
        case 'justifyRight': isActive = document.queryCommandState('justifyRight'); break;
        case 'justifyFull': isActive = document.queryCommandState('justifyFull'); break;
      }
      btn.classList.toggle('active', isActive);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // LINK MODAL - Modal personalizado para insertar enlaces
  // ═══════════════════════════════════════════════════════════════

  /**
   * Muestra un modal personalizado para insertar un enlace
   */
  showLinkModal() {
    this.hideFloatingToolbar();

    // Remover modal anterior si existe
    const existing = document.getElementById('link-modal');
    if (existing) existing.remove();

    // Obtener texto seleccionado como texto por defecto del enlace
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString().trim() : '';

    const modal = document.createElement('div');
    modal.id = 'link-modal';
    modal.className = 'link-modal-overlay';
    modal.innerHTML = `
      <div class="link-modal-content">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          Insertar enlace
        </h3>
        <div class="link-modal-field">
          <label for="link-url-input">URL</label>
          <input type="url" id="link-url-input" placeholder="https://ejemplo.com" autocomplete="off" spellcheck="false" />
        </div>
        <div class="link-modal-field">
          <label for="link-text-input">Texto del enlace</label>
          <input type="text" id="link-text-input" placeholder="${selectedText || 'Texto visible'}" value="${this.escapeHtml(selectedText)}" />
        </div>
        <label class="link-modal-checkbox">
          <input type="checkbox" id="link-new-tab" checked />
          <span>Abrir en nueva pestaña</span>
        </label>
        <div class="link-modal-actions">
          <button type="button" class="link-modal-btn cancel" id="link-cancel">Cancelar</button>
          <button type="button" class="link-modal-btn confirm" id="link-confirm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            Insertar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Animación de entrada
    requestAnimationFrame(() => modal.classList.add('visible'));

    const urlInput = document.getElementById('link-url-input');
    const textInput = document.getElementById('link-text-input');
    const newTabCheck = document.getElementById('link-new-tab');
    const confirmBtn = document.getElementById('link-confirm');
    const cancelBtn = document.getElementById('link-cancel');

    // Focus en URL input
    setTimeout(() => urlInput.focus(), 100);

    const closeLinkModal = () => {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 200);
    };

    const insertLink = () => {
      const url = urlInput.value.trim();
      if (!url) {
        this.showToast('La URL es requerida', 'warning');
        urlInput.focus();
        return;
      }
      if (!/^https?:\/\//i.test(url) && !url.startsWith('/') && !url.startsWith('#') && !url.startsWith('mailto:')) {
        this.showToast('URL inválida. Usa http://, https://, / o mailto:', 'warning');
        urlInput.focus();
        return;
      }

      closeLinkModal();

      // Restaurar selección del editor
      this.restoreEditorSelection();

      const linkText = textInput.value.trim() || selectedText || url;
      const target = newTabCheck.checked ? ' target="_blank" rel="noopener noreferrer"' : '';
      
      // Si hay texto seleccionado, crear link sobre él
      const sel2 = window.getSelection();
      if (sel2 && !sel2.isCollapsed) {
        document.execCommand('createLink', false, url);
        // Añadir target si es nueva pestaña
        if (newTabCheck.checked) {
          const links = document.getElementById('article-editor').querySelectorAll(`a[href="${url}"]`);
          links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          });
        }
      } else {
        // Insertar como HTML si no hay selección
        document.execCommand('insertHTML', false, `<a href="${this.escapeHtml(url)}"${target}>${this.escapeHtml(linkText)}</a>`);
      }

      this.showToast('Enlace insertado', 'success');
      this.saveEditorState();
    };

    confirmBtn.addEventListener('click', insertLink);
    cancelBtn.addEventListener('click', closeLinkModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLinkModal();
    });

    // Enter para confirmar, Escape para cancelar
    const handleKeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        insertLink();
      }
      if (e.key === 'Escape') {
        closeLinkModal();
      }
    };
    urlInput.addEventListener('keydown', handleKeydown);
    textInput.addEventListener('keydown', handleKeydown);
  }

  // ═══════════════════════════════════════════════════════════════
  // CURSOR SAVE/RESTORE - Para modales que roban el foco
  // ═══════════════════════════════════════════════════════════════

  /**
   * Guarda la selección/cursor actual del editor antes de abrir un modal
   */
  saveEditorSelection() {
    const editor = document.getElementById('article-editor');
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // Verificar que el cursor está dentro del editor
      if (editor && editor.contains(range.commonAncestorContainer)) {
        this.savedEditorRange = range.cloneRange();
        return;
      }
    }
    this.savedEditorRange = null;
  }

  /**
   * Restaura la selección/cursor guardada e inserta HTML en esa posición
   * @param {string} html - HTML a insertar en la posición guardada
   * @returns {boolean} true si se insertó en la posición guardada, false si se usó fallback
   */
  insertAtSavedPosition(html) {
    const editor = document.getElementById('article-editor');
    if (!editor) return false;
    
    // Si hay un rango guardado y el editor contiene ese rango
    if (this.savedEditorRange) {
      editor.focus();
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this.savedEditorRange);
      
      // Insertar HTML en la posición del cursor
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const frag = document.createDocumentFragment();
      let lastNode;
      while (tempDiv.firstChild) {
        lastNode = frag.appendChild(tempDiv.firstChild);
      }
      
      this.savedEditorRange.deleteContents();
      this.savedEditorRange.insertNode(frag);
      
      // Mover cursor después del contenido insertado
      if (lastNode) {
        const newRange = document.createRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
      
      this.savedEditorRange = null;
      return true;
    }
    
    // Fallback: insertar al final
    editor.focus();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    while (tempDiv.firstChild) {
      editor.appendChild(tempDiv.firstChild);
    }
    
    // Mover cursor al final
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    return false;
  }

  // ═══════════════════════════════════════════════════════════════
  // IMAGE MODALS - Enhanced
  // ═══════════════════════════════════════════════════════════════

  openImageModal() {
    // Guardar posición del cursor antes de que el modal robe el foco
    this.saveEditorSelection();
    
    const modal = document.getElementById('image-modal');
    modal.classList.remove('hidden');
    
    // Reset form
    document.getElementById('modal-image-url').value = '';
    document.getElementById('modal-image-alt').value = '';
    document.getElementById('image-width').value = '';
    document.getElementById('image-height').value = '';
    document.getElementById('image-caption').checked = false;
    document.getElementById('image-caption-text').value = '';
    document.getElementById('image-caption-text').classList.add('hidden');
    
    // Reset tabs to URL
    this.switchImageTab('url');
    
    // Reset alignment
    document.querySelectorAll('.align-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.align === 'center');
    });
    
    // Clear upload preview
    const dropZone = document.getElementById('drop-zone');
    const uploadPreview = document.getElementById('upload-preview');
    if (dropZone) dropZone.style.display = 'block';
    if (uploadPreview) uploadPreview.classList.add('hidden');
    
    this.currentImageSource = 'url';
    this.uploadedImageData = null;
  }

  switchImageTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tab}`);
    });
    
    this.currentImageSource = tab;
  }

  openGridModal() {
    // Guardar posición del cursor antes de que el modal robe el foco
    this.saveEditorSelection();
    
    const modal = document.getElementById('grid-modal');
    modal.classList.remove('hidden');
    
    // Reset
    document.getElementById('grid-images').value = '';
    this.gridImages = [];
    
    // Reset selectors
    document.querySelectorAll('.col-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cols === '2');
    });
    document.querySelectorAll('.gap-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.gap === '8');
    });
    
    this.gridCols = 2;
    this.gridGap = 8;
    
    // Clear previews
    this.updateGridImagesList();
    this.updateGridLivePreview();
  }

  /**
   * Inserta un video de YouTube en el editor
   * 
   * @description Solicita URL al usuario, extrae el ID del video
   * y genera un iframe responsivo con aspect ratio 16:9.
   * Soporta formatos:
   * - youtube.com/watch?v=VIDEO_ID
   * - youtu.be/VIDEO_ID
   * - youtube.com/embed/VIDEO_ID
   */
  insertYouTube() {
    // Guardar posición del cursor antes de que el modal robe el foco
    this.saveEditorSelection();
    
    // Abrir modal de YouTube
    const modal = document.getElementById('youtube-modal');
    const urlInput = document.getElementById('youtube-url');
    const previewArea = document.getElementById('youtube-preview');
    
    if (!modal) return;
    
    // Limpiar estado anterior
    urlInput.value = '';
    previewArea.innerHTML = '';
    previewArea.classList.add('hidden');
    
    modal.classList.remove('hidden');
    urlInput.focus();
    
    // Escuchar cambios en el input para mostrar preview con video reproducible
    const handleInput = () => {
      const videoId = this.extractYouTubeId(urlInput.value);
      if (videoId) {
        previewArea.innerHTML = `
          <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0" 
            title="Vista previa del video"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        `;
        previewArea.classList.remove('hidden');
      } else {
        previewArea.innerHTML = '';
        previewArea.classList.add('hidden');
      }
    };
    
    urlInput.removeEventListener('input', urlInput._handler);
    urlInput._handler = handleInput;
    urlInput.addEventListener('input', handleInput);

    // Configurar botones de tamaño
    this.selectedVideoSize = 'large'; // default
    document.querySelectorAll('.video-size-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === 'large');
      btn.addEventListener('click', () => {
        document.querySelectorAll('.video-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedVideoSize = btn.dataset.size;
      });
    });
  }
  
  confirmYouTubeInsert() {
    const modal = document.getElementById('youtube-modal');
    const urlInput = document.getElementById('youtube-url');
    const url = urlInput.value;
    
    if (!url) {
      this.showToast('Ingresa una URL de YouTube', 'warning');
      return;
    }
    
    const videoId = this.extractYouTubeId(url);
    
    if (!videoId) {
      this.showToast('URL de YouTube no válida', 'error');
      return;
    }
    
    // Cerrar modal
    modal.classList.add('hidden');
    
    // Determinar clase de tamaño
    const sizeClass = this.selectedVideoSize ? `video-${this.selectedVideoSize}` : 'video-large';
    
    // Crear el embed responsivo
    const embed = `<div class="video-container youtube-embed ${sizeClass}">
  <iframe 
    src="https://www.youtube.com/embed/${videoId}" 
    title="YouTube video" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    allowfullscreen>
  </iframe>
</div>`;
    
    const editor = document.getElementById('article-editor');
    
    // Insertar en la posición guardada del cursor (o al final como fallback)
    this.insertAtSavedPosition(embed + '<p><br></p>');
    
    // Guardar estado para Undo/Redo
    this.saveEditorState();
    
    this.showToast('Video de YouTube insertado', 'success');
  }
  
  closeYouTubeModal() {
    const modal = document.getElementById('youtube-modal');
    if (modal) modal.classList.add('hidden');
  }

  /**
   * Crea una barra de herramientas flotante sobre un contenedor de video seleccionado
   * Permite cambiar el tamaño y eliminar el video
   */
  createVideoToolbar(container) {
    // Remover toolbar anterior si existe
    const existing = container.querySelector('.video-toolbar');
    if (existing) existing.remove();

    const toolbar = document.createElement('div');
    toolbar.className = 'video-toolbar';
    toolbar.contentEditable = 'false';

    // Detectar tamaño actual
    const currentSize = container.classList.contains('video-small') ? 'small' :
                        container.classList.contains('video-medium') ? 'medium' :
                        container.classList.contains('video-large') ? 'large' : 'full';

    const sizes = [
      { size: 'small', label: 'S', title: 'Pequeño (400px)' },
      { size: 'medium', label: 'M', title: 'Mediano (560px)' },
      { size: 'large', label: 'L', title: 'Grande (750px)' },
      { size: 'full', label: '▢', title: 'Completo (100%)' }
    ];

    sizes.forEach(({ size, label, title }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.title = title;
      if (size === currentSize) btn.classList.add('active');
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.classList.remove('video-small', 'video-medium', 'video-large', 'video-full');
        container.classList.add(`video-${size}`);
        toolbar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.saveEditorState();
        const sizeLabels = { small: 'pequeño', medium: 'mediano', large: 'grande', full: 'completo' };
        this.showToast(`Video: tamaño ${sizeLabels[size]}`, 'success');
      });
      toolbar.appendChild(btn);
    });

    // Divider
    const divider = document.createElement('span');
    divider.className = 'vt-divider';
    toolbar.appendChild(divider);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.title = 'Eliminar video';
    deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    deleteBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.remove();
      this.showToast('Video eliminado', 'success');
      this.saveEditorState();
    });
    toolbar.appendChild(deleteBtn);

    container.appendChild(toolbar);
  }

  /**
   * Extrae el ID de un video de YouTube de varios formatos de URL
   * 
   * @param {string} url - URL de YouTube o ID directo
   * @returns {string|null} ID de 11 caracteres o null si no es válido
   */
  extractYouTubeId(url) {
    if (!url) return null;
    
    // Patrones para diferentes formatos de URL de YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/ // Solo el ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  updateGridImagesList() {
    const list = document.getElementById('grid-images-list');
    const countEl = document.getElementById('grid-count');
    
    if (!list) return;
    
    if (this.gridImages.length === 0) {
      list.innerHTML = '';
      if (countEl) countEl.textContent = '0 imágenes';
      return;
    }
    
    list.innerHTML = this.gridImages.map((url, index) => `
      <div class="grid-image-item" data-index="${index}">
        <img src="${url}" alt="" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><rect fill=%22%23333%22 width=%2260%22 height=%2260%22/><text x=%2230%22 y=%2235%22 fill=%22%23666%22 text-anchor=%22middle%22 font-size=%2210%22>Error</text></svg>'">
        <button type="button" class="remove-btn" data-index="${index}">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `).join('');
    
    if (countEl) countEl.textContent = `${this.gridImages.length} imagen${this.gridImages.length !== 1 ? 'es' : ''}`;
    
    // Add remove handlers
    list.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        this.gridImages.splice(index, 1);
        this.syncGridTextarea();
        this.updateGridImagesList();
        this.updateGridLivePreview();
      });
    });
  }

  updateGridLivePreview() {
    const preview = document.getElementById('grid-live-preview');
    if (!preview) return;
    
    preview.className = `grid-live-preview cols-${this.gridCols}`;
    preview.style.gap = `${this.gridGap}px`;
    
    if (this.gridImages.length === 0) {
      preview.innerHTML = `
        <div class="preview-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span>Agrega imágenes para ver la vista previa</span>
        </div>
      `;
      return;
    }
    
    preview.innerHTML = this.gridImages.map(url => 
      `<img src="${url}" alt="" onerror="this.style.background='#333'">`
    ).join('');
  }

  syncGridTextarea() {
    const textarea = document.getElementById('grid-images');
    if (textarea) {
      textarea.value = this.gridImages.join('\n');
    }
  }

  /**
   * Parsea el contenido del textarea de URLs de imágenes
   * 
   * @description Usa regex para extraer URLs (http/https y data:image)
   * de forma robusta, incluso si están en la misma línea.
   * Elimina duplicados automáticamente.
   */
  parseGridTextarea() {
    const textarea = document.getElementById('grid-images');
    if (!textarea) return;
    
    // Obtener texto y dividir por líneas
    let text = textarea.value;
    
    // Primero, separar por URLs http/https claramente
    const urls = [];
    
    // Regex para encontrar URLs http/https
    const httpRegex = /(https?:\/\/[^\s\n]+)/gi;
    let match;
    while ((match = httpRegex.exec(text)) !== null) {
      urls.push(match[1].trim());
    }
    
    // También buscar data URLs (pueden ser muy largas, en una sola línea)
    const dataRegex = /(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)/gi;
    while ((match = dataRegex.exec(text)) !== null) {
      urls.push(match[1].trim());
    }
    
    // Si no encontramos nada con regex, intentar el método tradicional de líneas
    if (urls.length === 0) {
      const lines = text.split('\n')
        .map(u => u.trim())
        .filter(u => u && (u.startsWith('http') || u.startsWith('data:')));
      urls.push(...lines);
    }
    
    // Eliminar duplicados
    this.gridImages = [...new Set(urls)];
    this.updateGridImagesList();
    this.updateGridLivePreview();
  }

  addGridImageFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.gridImages.push(e.target.result);
      this.syncGridTextarea();
      this.updateGridImagesList();
      this.updateGridLivePreview();
    };
    reader.readAsDataURL(file);
  }

  setPreviewDevice(device) {
    const container = document.querySelector('.preview-frame-container');
    const buttons = document.querySelectorAll('.device-btn');
    
    if (!container) return;
    
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.device === device);
    });
    
    container.className = 'preview-frame-container';
    if (device !== 'desktop') {
      container.classList.add(device);
    }
  }

  setupImageModals() {
    // Close modals
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.close;
        document.getElementById(modalId).classList.add('hidden');
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    });

    // Close modals with ESC key + Focus trapping con Tab
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
          modal.classList.add('hidden');
        });
      }
      // Focus trapping: mantener el foco dentro del modal abierto
      if (e.key === 'Tab') {
        const openModal = document.querySelector('.modal:not(.hidden):not(.modal-confirm)');
        if (openModal) {
          const focusable = openModal.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href]'
          );
          if (focusable.length) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
              if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
              if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
          }
        }
      }
    });
    
    // YouTube modal - Insert button
    const insertYouTubeBtn = document.getElementById('insert-youtube-btn');
    if (insertYouTubeBtn) {
      insertYouTubeBtn.addEventListener('click', () => this.confirmYouTubeInsert());
    }
    
    // YouTube modal - Enter key to insert
    const youtubeUrlInput = document.getElementById('youtube-url');
    if (youtubeUrlInput) {
      youtubeUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.confirmYouTubeInsert();
        }
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // Image Modal - Tabs
    // ═══════════════════════════════════════════════════════════════
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchImageTab(btn.dataset.tab);
      });
    });

    // ═══════════════════════════════════════════════════════════════
    // Image Modal - Drag & Drop
    // ═══════════════════════════════════════════════════════════════
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('modal-file-input');
    const uploadPreview = document.getElementById('upload-preview');
    const uploadedImg = document.getElementById('uploaded-img');

    dropZone?.addEventListener('click', () => fileInput?.click());

    dropZone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone?.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.handleModalImageUpload(file);
      }
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleModalImageUpload(file);
      }
    });

    // Remove uploaded image
    document.getElementById('remove-upload')?.addEventListener('click', () => {
      dropZone.style.display = 'block';
      uploadPreview?.classList.add('hidden');
      this.uploadedImageData = null;
    });

    // ═══════════════════════════════════════════════════════════════
    // Image Modal - Preset Sizes
    // ═══════════════════════════════════════════════════════════════
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const widthInput = document.getElementById('image-width');
        const heightInput = document.getElementById('image-height');
        const preset = btn.dataset.preset;
        
        switch (preset) {
          case 'small':
            widthInput.value = '300';
            heightInput.value = '';
            break;
          case 'medium':
            widthInput.value = '600';
            heightInput.value = '';
            break;
          case 'large':
            widthInput.value = '900';
            heightInput.value = '';
            break;
          case 'full':
            widthInput.value = '100';
            // Change unit to %
            break;
        }
      });
    });

    // ═══════════════════════════════════════════════════════════════
    // Image Modal - Alignment Buttons
    // ═══════════════════════════════════════════════════════════════
    document.querySelectorAll('.align-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // ═══════════════════════════════════════════════════════════════
    // Image Modal - Caption Toggle
    // ═══════════════════════════════════════════════════════════════
    const captionCheckbox = document.getElementById('image-caption');
    const captionTextInput = document.getElementById('image-caption-text');
    captionCheckbox?.addEventListener('change', () => {
      if (captionCheckbox.checked) {
        captionTextInput?.classList.remove('hidden');
        captionTextInput?.focus();
      } else {
        captionTextInput?.classList.add('hidden');
      }
    });

    // ═══════════════════════════════════════════════════════════════
    // Insert Image - Enhanced
    // ═══════════════════════════════════════════════════════════════
    document.getElementById('insert-image-btn')?.addEventListener('click', () => {
      try {
        let imageUrl = '';
        
        // Get image source - priorizar imagen subida si existe
        if (this.currentImageSource === 'upload' && this.uploadedImageData) {
          imageUrl = this.uploadedImageData;
        } else if (this.currentImageSource === 'url') {
          imageUrl = document.getElementById('modal-image-url')?.value.trim();
        } else if (this.uploadedImageData) {
          // Fallback: si hay imagen subida pero el tab es url
          imageUrl = this.uploadedImageData;
        }

        if (!imageUrl) {
          this.showToast('Selecciona o ingresa una imagen primero', 'error');
          return;
        }

        const alt = document.getElementById('modal-image-alt')?.value.trim() || '';
        const width = document.getElementById('image-width')?.value.trim();
        const height = document.getElementById('image-height')?.value.trim();
        const addCaption = document.getElementById('image-caption')?.checked;
        const captionText = document.getElementById('image-caption-text')?.value.trim() || alt;
        const alignment = document.querySelector('.align-btn.active')?.dataset.align || 'center';

        // Build style para la imagen (no el wrapper)
        // Usar max-width para que sea redimensionable después
        let imgStyle = 'max-width: 100%;';
        if (width) imgStyle += ` width: ${width}px;`;
        if (height) imgStyle += ` height: ${height}px;`;

        // Build class based on alignment
        let wrapperClass = 'resizable-image';
        if (alignment === 'left') wrapperClass += ' align-left';
        else if (alignment === 'right') wrapperClass += ' align-right';
        else if (alignment === 'float-left') wrapperClass += ' float-left';
        else if (alignment === 'float-right') wrapperClass += ' float-right';
        else wrapperClass += ' align-center'; // Default to center

        // Generate HTML
        let html = '';
        if (addCaption && captionText) {
          html = `<figure class="${wrapperClass}">
  <img src="${imageUrl}" alt="${alt}" style="${imgStyle}">
  <figcaption>${captionText}</figcaption>
</figure>`;
        } else {
          html = `<span class="${wrapperClass}">
  <img src="${imageUrl}" alt="${alt}" style="${imgStyle}">
</span>`;
        }

        const editor = document.getElementById('article-editor');
        if (!editor) {
          this.showToast('Error: No se encontró el editor', 'error');
          console.error('[Image Insert] Editor element not found');
          return;
        }
        
        // Insertar en la posición guardada del cursor (o al final como fallback)
        this.insertAtSavedPosition(html + '<p><br></p>');
        
        // Cerrar modal y resetear estado
        document.getElementById('image-modal').classList.add('hidden');
        
        // Resetear completamente el estado del modal
        this.uploadedImageData = null;
        this.currentImageSource = 'url';
        const dropZone = document.getElementById('drop-zone');
        const uploadPreview = document.getElementById('upload-preview');
        const fileInput = document.getElementById('modal-file-input');
        if (dropZone) dropZone.style.display = 'block';
        if (uploadPreview) uploadPreview.classList.add('hidden');
        if (fileInput) fileInput.value = ''; // Resetear file input para permitir subir de nuevo
        
        // Guardar estado para Undo
        this.saveEditorState();
        
        // Setup resize handles on new image
        this.setupEditorImageHandlers();
        
        this.showToast('Imagen insertada', 'success');
      } catch (error) {
        console.error('[Image Insert] Error:', error);
        this.showToast(`Error al insertar imagen: ${error.message}`, 'error');
      }
    });

    // ═══════════════════════════════════════════════════════════════
    // Grid Modal v2 - Improved
    // ═══════════════════════════════════════════════════════════════
    
    // Drop zone for grid
    const gridDropZone = document.getElementById('grid-drop-zone');
    const gridFileInput = document.getElementById('grid-file-input');
    
    gridDropZone?.addEventListener('click', () => gridFileInput?.click());
    
    gridDropZone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      gridDropZone.classList.add('drag-over');
    });
    
    gridDropZone?.addEventListener('dragleave', () => {
      gridDropZone.classList.remove('drag-over');
    });
    
    gridDropZone?.addEventListener('drop', (e) => {
      e.preventDefault();
      gridDropZone.classList.remove('drag-over');
      
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      files.forEach(file => this.addGridImageFromFile(file));
      
      // Also check for URLs
      const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
      if (url && (url.startsWith('http') || url.startsWith('data:'))) {
        this.gridImages.push(url);
        this.syncGridTextarea();
        this.updateGridImagesList();
        this.updateGridLivePreview();
      }
    });
    
    gridFileInput?.addEventListener('change', (e) => {
      Array.from(e.target.files).forEach(file => {
        if (file.type.startsWith('image/')) {
          this.addGridImageFromFile(file);
        }
      });
      gridFileInput.value = '';
    });
    
    // Textarea change
    document.getElementById('grid-images')?.addEventListener('input', () => {
      this.parseGridTextarea();
    });

    // Add URL button
    document.getElementById('add-url-btn')?.addEventListener('click', () => {
      const textarea = document.getElementById('grid-images');
      const url = prompt('Ingresa la URL de la imagen:');
      if (url && url.trim() && (url.startsWith('http') || url.startsWith('data:'))) {
        const currentValue = textarea.value.trim();
        textarea.value = currentValue ? `${currentValue}\n${url.trim()}` : url.trim();
        this.parseGridTextarea();
      } else if (url) {
        this.showToast('URL inválida. Debe comenzar con http o https', 'error');
      }
    });

    // Open gallery from grid modal
    document.getElementById('open-gallery-from-grid-btn')?.addEventListener('click', () => {
      this.openGalleryForGrid();
    });
    
    // Column selector buttons
    document.querySelectorAll('.col-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.col-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gridCols = parseInt(btn.dataset.cols);
        this.updateGridLivePreview();
      });
    });
    
    // Gap selector buttons
    document.querySelectorAll('.gap-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gap-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gridGap = parseInt(btn.dataset.gap);
        this.updateGridLivePreview();
      });
    });

    // ═══════════════════════════════════════════════════════════════
    // Insert Grid - Enhanced
    // ═══════════════════════════════════════════════════════════════
    document.getElementById('insert-grid-btn')?.addEventListener('click', () => {
      if (this.gridImages.length === 0) {
        this.showToast('Agrega al menos una imagen', 'error');
        return;
      }

      const images = this.gridImages.map(url => `<img src="${url}" alt="" draggable="true" class="editor-image resizable">`).join('\n  ');
      const grid = `<div class="image-grid-container cols-${this.gridCols}" style="gap: ${this.gridGap}px;">
  ${images}
</div><p><br></p>`;

      // Cerrar el modal primero
      document.getElementById('grid-modal').classList.add('hidden');
      
      // Insertar en la posición guardada del cursor (o al final como fallback)
      this.insertAtSavedPosition(grid);
      
      // Guardar estado para Undo/Redo
      this.saveEditorState();
      
      this.showToast(`Galería de ${this.gridImages.length} imágenes insertada`, 'success');
    });

    // ═══════════════════════════════════════════════════════════════
    // Preview Modal - Device Selector
    // ═══════════════════════════════════════════════════════════════
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setPreviewDevice(btn.dataset.device);
      });
    });

    document.getElementById('close-preview-modal')?.addEventListener('click', () => {
      document.getElementById('preview-modal').classList.add('hidden');
    });
  }

  handleModalImageUpload(file) {
    const dropZone = document.getElementById('drop-zone');
    const uploadPreview = document.getElementById('upload-preview');
    const uploadedImg = document.getElementById('uploaded-img');

    if (!file || !file.type.startsWith('image/')) {
      this.showToast('Por favor selecciona una imagen válida', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImageData = e.target.result;
      if (uploadedImg) uploadedImg.src = e.target.result;
      if (dropZone) dropZone.style.display = 'none';
      if (uploadPreview) uploadPreview.classList.remove('hidden');
      
      // Switch to upload tab automatically
      this.switchImageTab('upload');
    };
    reader.onerror = () => {
      this.showToast('Error al leer el archivo', 'error');
    };
    reader.readAsDataURL(file);
  }

  /**
   * Configura handlers para imágenes en el editor
   * Usa delegación de eventos para manejar imágenes dinámicas
   */
  setupEditorImageHandlers() {
    const editor = document.getElementById('article-editor');
    if (!editor) return;
    
    // Solo configurar una vez usando delegación de eventos
    if (editor.dataset.imageHandlersSetup) return;
    editor.dataset.imageHandlersSetup = 'true';

    // Delegación de eventos para selección de imágenes
    editor.addEventListener('click', (e) => {
      // Ignorar clicks en la toolbar de imagen para no deseleccionar
      if (e.target.closest('.image-toolbar')) return;

      const wrapper = e.target.closest('.resizable-image, .image-resize-wrapper, figure');
      
      // Deseleccionar todas las imágenes y remover toolbars
      editor.querySelectorAll('.resizable-image.selected, .image-resize-wrapper.selected, .image-resize-wrapper.has-selected, figure.selected').forEach(w => {
        w.classList.remove('selected', 'has-selected');
        const oldToolbar = w.querySelector('.image-toolbar');
        if (oldToolbar) oldToolbar.remove();
      });
      
      // Si se hizo click en una imagen, seleccionarla y agregar toolbar
      if (wrapper) {
        e.stopPropagation();
        wrapper.classList.add('selected');
        this.selectedImage = wrapper;
        this.createImageToolbar(wrapper);
      } else {
        this.selectedImage = null;
      }
    });

    // Eliminar imagen con Delete o Backspace
    editor.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedImage) {
        e.preventDefault();
        this.selectedImage.remove();
        this.selectedImage = null;
        this.showToast('Imagen eliminada', 'success');
        this.saveEditorState();
      }
    });
  }

  /**
   * Crea la toolbar flotante de alineación sobre una imagen seleccionada
   * @param {HTMLElement} wrapper - El wrapper .resizable-image o figure
   */
  createImageToolbar(wrapper) {
    // Remover toolbar existente si hay
    const existing = wrapper.querySelector('.image-toolbar');
    if (existing) existing.remove();

    const toolbar = document.createElement('div');
    toolbar.className = 'image-toolbar';
    toolbar.contentEditable = 'false';

    // Determinar alineación actual
    const currentAlign = wrapper.classList.contains('align-left') ? 'left'
      : wrapper.classList.contains('align-right') ? 'right'
      : wrapper.classList.contains('float-left') ? 'left'
      : wrapper.classList.contains('float-right') ? 'right'
      : 'center';

    const buttons = [
      { align: 'left', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>', title: 'Alinear izquierda' },
      { align: 'center', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="18" y1="14" x2="6" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>', title: 'Centrar' },
      { align: 'right', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="7" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>', title: 'Alinear derecha' },
      { align: 'delete', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>', title: 'Eliminar imagen' }
    ];

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = btn.icon;
      button.title = btn.title;
      if (btn.align === currentAlign) button.classList.add('active');

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (btn.align === 'delete') {
          wrapper.remove();
          this.selectedImage = null;
          this.showToast('Imagen eliminada', 'success');
          this.saveEditorState();
          return;
        }

        this.setImageAlignment(wrapper, btn.align);
        // Actualizar estado activo de botones
        toolbar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
      });

      // Prevenir que mousedown deseleccione la imagen
      button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      toolbar.appendChild(button);
    });

    wrapper.appendChild(toolbar);
  }

  /**
   * Cambia la alineación de una imagen en el editor
   * @param {HTMLElement} imageWrapper - El wrapper de la imagen (.resizable-image o figure)
   * @param {string} alignment - La alineación: 'left', 'center', 'right'
   */
  setImageAlignment(imageWrapper, alignment) {
    if (!imageWrapper) return;
    
    // Remover todas las clases de alineación existentes
    imageWrapper.classList.remove('align-left', 'align-center', 'align-right', 'float-left', 'float-right');
    
    // Agregar la nueva clase de alineación
    switch (alignment) {
      case 'left':
        imageWrapper.classList.add('align-left');
        break;
      case 'center':
        imageWrapper.classList.add('align-center');
        break;
      case 'right':
        imageWrapper.classList.add('align-right');
        break;
    }
    
    this.showToast(`Imagen alineada ${alignment === 'left' ? 'a la izquierda' : alignment === 'right' ? 'a la derecha' : 'al centro'}`, 'success');
    this.saveEditorState();
  }

  // ═══════════════════════════════════════════════════════════════
  // GALERÍA DE IMÁGENES SUBIDAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Configura el modal de galería y sus eventos
   */
  setupGalleryModal() {
    // Search input
    document.getElementById('gallery-search')?.addEventListener('input', (e) => {
      this.filterGalleryImages(e.target.value);
    });

    // Refresh button
    document.getElementById('gallery-refresh-btn')?.addEventListener('click', () => {
      this.loadGalleryImages();
    });

    // Upload button opens upload modal
    document.getElementById('gallery-upload-btn')?.addEventListener('click', () => {
      this.openGalleryUploadModal();
    });

    // Upload modal setup
    this.setupGalleryUploadModal();
  }

  /**
   * Configura el modal de subida de imágenes
   */
  setupGalleryUploadModal() {
    const dropzone = document.getElementById('gallery-dropzone');
    const fileInput = document.getElementById('gallery-file-input');
    const previewContainer = document.getElementById('upload-preview-container');
    const previewImg = document.getElementById('upload-preview-img');
    const removeBtn = document.getElementById('remove-upload-preview');
    const confirmBtn = document.getElementById('confirm-upload-btn');

    // Click to select file
    dropzone?.addEventListener('click', () => fileInput?.click());

    // Drag and drop
    dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });

    dropzone?.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });

    dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.handleGalleryUploadPreview(file);
      }
    });

    // File input change
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleGalleryUploadPreview(file);
      }
      fileInput.value = '';
    });

    // Remove preview
    removeBtn?.addEventListener('click', () => {
      this.galleryUploadData = null;
      dropzone.style.display = '';
      previewContainer?.classList.add('hidden');
      confirmBtn.disabled = true;
    });

    // Confirm upload
    confirmBtn?.addEventListener('click', () => {
      this.uploadImageToGallery();
    });
  }

  /**
   * Maneja la previsualización de imagen antes de subir
   */
  handleGalleryUploadPreview(file) {
    const dropzone = document.getElementById('gallery-dropzone');
    const previewContainer = document.getElementById('upload-preview-container');
    const previewImg = document.getElementById('upload-preview-img');
    const confirmBtn = document.getElementById('confirm-upload-btn');

    const reader = new FileReader();
    reader.onload = (e) => {
      this.galleryUploadData = {
        filename: file.name,
        content: e.target.result.split(',')[1], // Remove data:image/xxx;base64,
        type: file.type
      };
      
      previewImg.src = e.target.result;
      dropzone.style.display = 'none';
      previewContainer?.classList.remove('hidden');
      confirmBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Sube una imagen a la galería via GitHub
   */
  async uploadImageToGallery() {
    if (!this.galleryUploadData) {
      this.showToast('Error: datos de imagen no disponibles', 'error');
      return;
    }

    // Verificar sesión
    if (!this.user) {
      this.showToast('Sesión expirada. Por favor, vuelve a iniciar sesión.', 'error');
      return;
    }

    const confirmBtn = document.getElementById('confirm-upload-btn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="spinner"></span> Subiendo...';

    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch('/api/upload-image.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify(this.galleryUploadData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir imagen');
      }

      this.showToast(`Imagen subida: ${result.filename}`, 'success');
      
      // Close upload modal and refresh gallery
      document.getElementById('gallery-upload-modal').classList.add('hidden');
      this.resetGalleryUploadModal();
      this.loadGalleryImages();

    } catch (error) {
      console.error('Error uploading image:', error);
      this.showToast('Error al subir imagen: ' + error.message, 'error');
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Subir
      `;
    }
  }

  /**
   * Resetea el modal de subida
   */
  resetGalleryUploadModal() {
    this.galleryUploadData = null;
    const dropzone = document.getElementById('gallery-dropzone');
    const previewContainer = document.getElementById('upload-preview-container');
    const confirmBtn = document.getElementById('confirm-upload-btn');
    
    if (dropzone) dropzone.style.display = '';
    previewContainer?.classList.add('hidden');
    if (confirmBtn) confirmBtn.disabled = true;
  }

  /**
   * Abre el modal de galería
   */
  openGalleryModal() {
    document.getElementById('gallery-modal').classList.remove('hidden');
    document.getElementById('gallery-search').value = '';
    this.gallerySelectMode = false; // Modo solo vista/copia
    this.loadGalleryImages();
  }

  /**
   * Abre el modal de galería en modo selección para el grid
   */
  openGalleryForGrid() {
    document.getElementById('gallery-modal').classList.remove('hidden');
    document.getElementById('gallery-search').value = '';
    this.gallerySelectMode = true; // Modo selección
    this.loadGalleryImages();
  }

  /**
   * Abre el modal de subida de imágenes
   */
  openGalleryUploadModal() {
    this.resetGalleryUploadModal();
    document.getElementById('gallery-upload-modal').classList.remove('hidden');
  }

  /**
   * Carga las imágenes de la galería desde GitHub
   */
  async loadGalleryImages() {
    const grid = document.getElementById('gallery-grid');
    const countEl = document.getElementById('gallery-count');

    grid.innerHTML = `
      <div class="gallery-loading">
        <span class="spinner"></span>
        <span>Cargando imágenes...</span>
      </div>
    `;

    try {
      // Obtener token de acceso
      const accessToken = await this.getAccessToken();
      
      const response = await fetch('/api/list-images.php', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar imágenes');
      }

      this.galleryImages = result.images || [];
      this.renderGalleryImages(this.galleryImages);
      
      if (countEl) {
        const modeText = this.gallerySelectMode ? ' • Modo selección (clic para agregar)' : '';
        countEl.textContent = `${this.galleryImages.length} imagen${this.galleryImages.length !== 1 ? 'es' : ''}${modeText}`;
      }

    } catch (error) {
      console.error('Error loading gallery:', error);
      grid.innerHTML = `
        <div class="gallery-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>Error al cargar imágenes</p>
          <span>${error.message}</span>
        </div>
      `;
    }
  }

  /**
   * Renderiza las imágenes en la galería
   */
  renderGalleryImages(images) {
    const grid = document.getElementById('gallery-grid');

    if (!images || images.length === 0) {
      grid.innerHTML = `
        <div class="gallery-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <p>No hay imágenes</p>
          <span>Sube tu primera imagen para empezar</span>
        </div>
      `;
      return;
    }

    grid.innerHTML = images.map(img => `
      <div class="gallery-item" data-url="${img.url}" data-name="${img.name}">
        <img src="${img.url}" alt="${img.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><rect fill=%22%23333%22 width=%2260%22 height=%2260%22/><text x=%2230%22 y=%2235%22 fill=%22%23666%22 text-anchor=%22middle%22 font-size=%2210%22>Error</text></svg>'">
        <div class="item-overlay">
          <span class="item-name">${img.name}</span>
        </div>
        <span class="copy-indicator">¡URL Copiada!</span>
      </div>
    `).join('');

    // Add click handlers to copy URL or select for grid
    grid.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        
        if (this.gallerySelectMode) {
          // Modo selección: agregar al grid
          this.gridImages.push(url);
          this.syncGridTextarea();
          this.updateGridImagesList();
          this.updateGridLivePreview();
          this.showToast('Imagen agregada al grid', 'success');
          
          // Visual feedback
          item.classList.add('copied');
          setTimeout(() => item.classList.remove('copied'), 500);
        } else {
          // Modo normal: copiar URL
          navigator.clipboard.writeText(url).then(() => {
            item.classList.add('copied');
            setTimeout(() => item.classList.remove('copied'), 1500);
            this.showToast('URL copiada al portapapeles', 'success');
          }).catch(() => {
            this.showToast('Error al copiar URL', 'error');
          });
        }
      });
    });
  }

  /**
   * Filtra las imágenes de la galería por nombre
   */
  filterGalleryImages(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      this.renderGalleryImages(this.galleryImages);
      return;
    }

    const filtered = this.galleryImages.filter(img => 
      img.name.toLowerCase().includes(normalizedQuery)
    );
    
    this.renderGalleryImages(filtered);
  }

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Navega a una sección del admin
   * 
   * @param {string} section - ID de sección: 'dashboard', 'articles', 'new-article'
   * @description Verifica cambios sin guardar antes de navegar,
   * actualiza nav activa, título y visibilidad de secciones
   */
  async navigateTo(section) {
    // Verificar si hay cambios sin guardar al salir del editor
    if (this.currentSection === 'new-article' && section !== 'new-article') {
      const editor = document.getElementById('article-editor');
      const title = document.getElementById('article-title')?.value;
      const hasContent = editor && editor.innerHTML.trim() !== '' && editor.innerHTML !== '<br>';
      
      // Solo mostrar advertencia si hay contenido Y no se ha guardado aún
      if ((title || hasContent) && !this.editingArticle && !this.contentSaved) {
        const confirmed = await this.showConfirmModal(
          'Cambios sin guardar',
          'Tienes cambios que no se han guardado. ¿Estás seguro de que deseas salir?',
          'Salir sin guardar',
          'warning'
        );
        if (!confirmed) {
          return;
        }
      }
      
      // Detener auto-guardado al salir del editor
      this.stopAutoSave();
      
      // Resetear flag de guardado al salir
      this.contentSaved = false;
    }
    
    this.currentSection = section;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
    });

    // Update sections
    document.querySelectorAll('.content-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `section-${section}`);
    });

    // Update title
    const titles = {
      'dashboard': 'Dashboard',
      'articles': 'Artículos',
      'drafts': 'Borradores',
      'new-article': this.editingArticle ? 'Editar Artículo' : 'Nuevo Artículo',
      'media': 'Multimedia'
    };
    document.getElementById('section-title').textContent = titles[section] || 'Dashboard';

    // Close mobile menu
    document.querySelector('.admin-sidebar')?.classList.remove('open');

    // Reset form if navigating to new article
    if (section === 'new-article' && !this.editingArticle) {
      this.resetArticleForm();
    }
    
    // Auto-guardado eliminado - Se guarda manualmente
  }

  handleAction(action) {
    switch (action) {
      case 'new-article':
        this.editingArticle = null;
        this.resetArticleForm();
        this.navigateTo('new-article');
        break;
      case 'upload-media':
        this.navigateTo('media');
        document.getElementById('upload-media-btn')?.click();
        break;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ARTICLES MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Carga los artículos desde el archivo JSON
   * 
   * @async
   * @description Obtiene articles.json con cache-busting,
   * actualiza stats del dashboard y renderiza tablas
   */
  async loadArticles() {
    try {
      // Load published articles
      const response = await fetch('/blog/data/articles.json?t=' + Date.now());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const allArticles = data.articles || [];
      
      // Published articles from articles.json
      this.articles = allArticles.filter(a => a.status !== 'draft');
      this.categories = data.categories || [];
      
      // Load drafts from separate drafts.json
      await this.loadDrafts();
      
      this.updateDashboardStats();
      this.renderArticlesTable();
      this.renderDraftsTable();
      this.renderRecentArticles();
      this.renderRecentDrafts();
      this.renderActivityLog();
      this.renderPublishChart();
      this.renderCategoriesBreakdown();
      this.renderBlogHealth();
      this.updateDraftsCount();
    } catch (error) {
      console.error('Error loading articles:', error);
      this.showToast('Error al cargar artículos. Verifica tu conexión.', 'error');
      this.articles = [];
      this.drafts = [];
      this.categories = [];
    }
  }

  /**
   * Carga los borradores desde drafts.json
   */
  async loadDrafts() {
    try {
      const response = await fetch('/api/get-drafts.php?t=' + Date.now(), {
        credentials: 'include'
      });
      if (!response.ok) {
        // If drafts endpoint fails, try direct file
        const fallback = await fetch('/blog/data/drafts.json?t=' + Date.now());
        if (fallback.ok) {
          const data = await fallback.json();
          this.drafts = data.drafts || [];
        } else {
          this.drafts = [];
        }
        return;
      }
      const data = await response.json();
      this.drafts = data.drafts || [];
    } catch (error) {
      console.warn('Could not load drafts:', error);
      this.drafts = [];
    }
  }

  updateDraftsCount() {
    const countEl = document.getElementById('drafts-count');
    if (countEl) {
      countEl.textContent = this.drafts.length;
      countEl.style.display = this.drafts.length > 0 ? 'inline-flex' : 'none';
    }
  }

  updateDashboardStats() {
    const statArticles = document.getElementById('stat-articles');
    const statDrafts = document.getElementById('stat-drafts');
    const statFeatured = document.getElementById('stat-featured');
    const statTrending = document.getElementById('stat-trending');
    
    if (statArticles) statArticles.textContent = this.articles.length;
    if (statDrafts) statDrafts.textContent = this.drafts.length;
    if (statFeatured) statFeatured.textContent = this.articles.filter(a => a.featured).length;
    if (statTrending) statTrending.textContent = this.articles.filter(a => a.trending).length;
  }

  renderArticlesTable() {
    const tbody = document.getElementById('articles-table-body');
    if (!tbody) return;

    if (this.articles.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No hay artículos</td></tr>';
      return;
    }

    tbody.innerHTML = this.articles.map(article => `
      <tr data-id="${article.id}">
        <td>
          <div class="article-cell">
            <img src="${article.image}" alt="" class="article-thumb" 
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 40%22><rect fill=%22%232d3142%22 width=%2260%22 height=%2240%22/></svg>'">
            <div class="article-info">
              <strong>${this.escapeHtml(article.title)}</strong>
              <span>${article.slug}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="category-badge category-${article.category}">
            ${article.categoryDisplay || article.category}
          </span>
        </td>
        <td>${this.formatDate(article.publishDate)}</td>
        <td>
          <div class="table-actions">
            <button class="edit-btn" onclick="admin.editArticle('${article.id}')" title="Editar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="delete-btn" onclick="admin.deleteArticle('${article.id}')" title="Eliminar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  renderDraftsTable() {
    const tbody = document.getElementById('drafts-table-body');
    if (!tbody) return;

    if (this.drafts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.3; margin-bottom: 1rem;">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <p>No hay borradores</p>
            <span>Los artículos que guardes como borrador aparecerán aquí</span>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = this.drafts.map(draft => `
      <tr data-id="${draft.id}" class="draft-row">
        <td>
          <div class="article-cell">
            <div class="draft-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div class="article-info">
              <strong>${this.escapeHtml(draft.title)}</strong>
              <span>${draft.slug || 'sin-slug'}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="category-badge category-${draft.category}">
            ${draft.categoryDisplay || draft.category}
          </span>
        </td>
        <td>${this.formatDate(draft.lastModified || draft.publishDate)}</td>
        <td>
          <div class="table-actions">
            <button class="publish-btn" onclick="admin.publishDraft('${draft.id}')" title="Publicar borrador">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13"/>
                <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
            <button class="edit-btn" onclick="admin.editArticle('${draft.id}')" title="Continuar editando">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="delete-btn" onclick="admin.deleteArticle('${draft.id}')" title="Eliminar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  renderRecentArticles() {
    const container = document.getElementById('recent-articles-list');
    if (!container) return;

    const recent = this.articles.slice(0, CONFIG.RECENT_ARTICLES_LIMIT);

    if (recent.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay artículos aún</p>';
      return;
    }

    container.innerHTML = recent.map(article => `
      <div class="recent-article-item">
        <img src="${article.image}" alt="" 
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 50 35%22><rect fill=%22%232d3142%22 width=%2250%22 height=%2235%22/></svg>'">
        <div class="recent-article-info">
          <strong>${this.escapeHtml(article.title)}</strong>
          <div class="recent-article-meta">
            <span class="recent-article-date">${this.formatDate(article.publishDate)}</span>
            <span class="recent-article-category">${article.category || 'Sin categoría'}</span>
          </div>
        </div>
        <div class="recent-article-actions">
          <a href="${article.content}" target="_blank" class="action-icon" title="Ver artículo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
          <button class="action-icon" title="Editar" onclick="admin.editArticle('${article.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-icon danger" title="Eliminar" onclick="admin.deleteArticle('${article.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  renderRecentDrafts() {
    const container = document.getElementById('recent-drafts-list');
    if (!container) return;

    // Actualizar stat de borradores
    const statDrafts = document.getElementById('stat-drafts');
    if (statDrafts) statDrafts.textContent = this.drafts.length;

    if (this.drafts.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay borradores</p>';
      return;
    }

    const recent = this.drafts.slice(0, 5);
    container.innerHTML = recent.map(draft => `
      <div class="draft-item" onclick="admin.editArticle('${draft.id}')">
        <div class="draft-item-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
        <div class="draft-item-info">
          <strong>${this.escapeHtml(draft.title)}</strong>
          <span>${this.formatDate(draft.modifiedDate || draft.publishDate)}</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render activity log with recent actions
   */
  renderActivityLog() {
    const container = document.getElementById('activity-log-list');
    if (!container) return;

    // Collect activities from articles (published and drafts)
    const activities = [];
    
    // Add published articles
    this.articles.forEach(article => {
      activities.push({
        type: 'publish',
        title: article.title,
        date: new Date(article.publishDate),
        icon: 'publish'
      });
      if (article.modifiedDate && article.modifiedDate !== article.publishDate) {
        activities.push({
          type: 'edit',
          title: article.title,
          date: new Date(article.modifiedDate),
          icon: 'edit'
        });
      }
    });
    
    // Add drafts
    this.drafts.forEach(draft => {
      activities.push({
        type: 'draft',
        title: draft.title,
        date: new Date(draft.modifiedDate || draft.publishDate),
        icon: 'draft'
      });
    });

    // Sort by date descending and take top 8
    activities.sort((a, b) => b.date - a.date);
    const recentActivities = activities.slice(0, 8);

    if (recentActivities.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay actividad reciente</p>';
      return;
    }

    const icons = {
      publish: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>`,
      edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>`,
      draft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>`
    };

    const labels = {
      publish: 'Publicado',
      edit: 'Editado',
      draft: 'Borrador guardado'
    };

    container.innerHTML = recentActivities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon ${activity.icon}">${icons[activity.icon]}</div>
        <div class="activity-info">
          <span class="activity-title">${labels[activity.type]}: <strong>${this.escapeHtml(activity.title.substring(0, 40))}${activity.title.length > 40 ? '...' : ''}</strong></span>
          <span class="activity-time">${this.getRelativeTime(activity.date)}</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Get relative time string (e.g., "hace 2 horas")
   */
  getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return this.formatDate(date);
  }

  /**
   * Render publish chart showing articles per month
   */
  renderPublishChart() {
    const chartContainer = document.getElementById('publish-chart');
    const legendContainer = document.getElementById('chart-legend');
    if (!chartContainer || !legendContainer) return;

    // Get last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        label: date.toLocaleDateString('es', { month: 'short' }),
        count: 0
      });
    }

    // Count articles per month
    this.articles.forEach(article => {
      const pubDate = new Date(article.publishDate);
      const monthData = months.find(m => 
        m.month === pubDate.getMonth() && m.year === pubDate.getFullYear()
      );
      if (monthData) monthData.count++;
    });

    const maxCount = Math.max(...months.map(m => m.count), 1);

    // Render bars
    chartContainer.innerHTML = months.map(m => {
      const height = (m.count / maxCount) * 100;
      return `<div class="chart-bar" style="height: ${Math.max(height, 4)}%" data-count="${m.count}"></div>`;
    }).join('');

    // Render legend
    legendContainer.innerHTML = months.map(m => `<span>${m.label}</span>`).join('');
  }

  /**
   * Render categories breakdown
   */
  renderCategoriesBreakdown() {
    const container = document.getElementById('categories-breakdown');
    if (!container) return;

    // Count articles per category
    const categoryCounts = {};
    this.articles.forEach(article => {
      const cat = article.category || 'sin-categoria';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const entries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    const total = this.articles.length || 1;

    if (entries.length === 0) {
      container.innerHTML = '<p class="empty-state">Sin datos de categorías</p>';
      return;
    }

    // Category colors
    const colors = ['#ffd166', '#e76f51', '#10b981', '#8b5cf6', '#06b6d4', '#f59e0b'];

    container.innerHTML = entries.slice(0, 6).map(([ cat, count], i) => {
      const percentage = Math.round((count / total) * 100);
      const color = colors[i % colors.length];
      return `
        <div class="category-item">
          <div class="category-info">
            <span class="category-dot" style="background: ${color}"></span>
            <span class="category-name">${cat.replace(/-/g, ' ')}</span>
          </div>
          <div class="category-bar">
            <div class="category-bar-fill" style="width: ${percentage}%; background: ${color}"></div>
          </div>
          <span class="category-count">${count}</span>
        </div>
      `;
    }).join('');
  }

  /**
   * Render blog health metrics
   */
  renderBlogHealth() {
    const thisMonthEl = document.getElementById('health-this-month');
    const avgWordsEl = document.getElementById('health-avg-words');
    const lastPublishEl = document.getElementById('health-last-publish');
    const categoriesEl = document.getElementById('health-categories');

    if (!thisMonthEl) return;

    // Articles this month
    const now = new Date();
    const thisMonth = this.articles.filter(a => {
      const pubDate = new Date(a.publishDate);
      return pubDate.getMonth() === now.getMonth() && pubDate.getFullYear() === now.getFullYear();
    }).length;
    thisMonthEl.textContent = thisMonth;
    thisMonthEl.className = 'health-value ' + (thisMonth >= 4 ? 'good' : thisMonth >= 2 ? 'warning' : 'danger');

    // Average word count
    if (this.articles.length > 0) {
      const totalWords = this.articles.reduce((sum, a) => {
        // Use stored wordCount, fallback to readTime estimate
        const wc = a.wordCount || (parseInt(a.readTime) || 3) * 200;
        return sum + wc;
      }, 0);
      const avg = Math.round(totalWords / this.articles.length);
      avgWordsEl.textContent = `~${avg} palabras`;
    } else {
      avgWordsEl.textContent = '-';
    }

    // Last publish
    if (this.articles.length > 0) {
      const sorted = [...this.articles].sort((a, b) => 
        new Date(b.publishDate) - new Date(a.publishDate)
      );
      lastPublishEl.textContent = this.getRelativeTime(new Date(sorted[0].publishDate));
    } else {
      lastPublishEl.textContent = 'Nunca';
    }

    // Active categories
    const uniqueCategories = new Set(this.articles.map(a => a.category).filter(Boolean));
    categoriesEl.textContent = uniqueCategories.size;
  }

  filterArticlesTable(searchQuery = '') {
    const query = searchQuery || document.getElementById('search-articles')?.value || '';
    const category = document.getElementById('filter-category')?.value || 'all';

    const filtered = this.articles.filter(article => {
      const matchesQuery = !query || 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.slug.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = category === 'all' || article.category === category;

      return matchesQuery && matchesCategory;
    });

    const tbody = document.getElementById('articles-table-body');
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No se encontraron artículos</td></tr>';
    } else {
      // Temporarily replace articles and render
      const original = this.articles;
      this.articles = filtered;
      this.renderArticlesTable();
      this.articles = original;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ARTICLE CRUD
  // ═══════════════════════════════════════════════════════════════

  editArticle(id) {
    // Buscar en artículos publicados y en borradores
    let article = this.articles.find(a => a.id === id);
    if (!article) {
      article = this.drafts.find(a => a.id === id);
    }
    if (!article) {
      this.showToast('Artículo no encontrado', 'error');
      return;
    }

    // 1. Marcar como editando ANTES de navegar (evita que navigateTo resetee el form)
    this.editingArticle = article;
    
    // 2. Navegar primero para que la sección sea visible
    this.navigateTo('new-article');
    
    // 3. Rellenar el formulario DESPUÉS de que la sección esté visible
    this.populateArticleForm(article);
    
    // 4. Re-render tags y SEO después de que el DOM esté actualizado
    requestAnimationFrame(() => {
      this.renderTags();
      this.updateSEOScore();
    });

    const titleText = article.status === 'draft' ? 'Editar Borrador' : 'Editar Artículo';
    document.getElementById('section-title').textContent = titleText;
  }

  populateArticleForm(article) {
    document.getElementById('article-id').value = article.id;
    document.getElementById('article-title').value = article.title;
    document.getElementById('article-slug').value = article.slug;
    document.getElementById('article-excerpt').value = article.excerpt;
    document.getElementById('excerpt-count').textContent = article.excerpt.length;
    
    // Author
    if (document.getElementById('article-author')) {
      document.getElementById('article-author').value = article.author || 'Sala Geek';
    }
    
    // Category
    const categoryRadio = document.querySelector(`input[name="category"][value="${article.category}"]`);
    if (categoryRadio) categoryRadio.checked = true;

    // Date
    if (article.publishDate) {
      const date = new Date(article.publishDate);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      document.getElementById('article-date').value = date.toISOString().slice(0, 16);
    }

    // Options
    document.getElementById('article-featured').checked = article.featured || false;
    document.getElementById('article-trending').checked = article.trending || false;

    // Read time
    document.getElementById('read-time').value = article.readTime || '5 min';

    // SEO fields
    if (document.getElementById('meta-description')) {
      document.getElementById('meta-description').value = article.metaDescription || '';
      const metaCounter = document.getElementById('meta-description-count');
      if (metaCounter) metaCounter.textContent = (article.metaDescription || '').length;
    }
    if (document.getElementById('meta-keywords')) {
      document.getElementById('meta-keywords').value = article.metaKeywords || '';
    }
    if (document.getElementById('canonical-url')) {
      document.getElementById('canonical-url').value = article.canonicalUrl || '';
    }
    if (document.getElementById('og-image')) {
      document.getElementById('og-image').value = article.ogImage || '';
    }
    if (document.getElementById('no-index')) {
      document.getElementById('no-index').checked = article.noIndex || false;
    }

    // Tags
    this.tags = article.tags || [];
    this.renderTags();

    // Image
    if (article.image) {
      document.getElementById('image-url').value = article.image;
      document.getElementById('preview-img').src = article.image;
      document.getElementById('image-preview').classList.remove('hidden');
      document.getElementById('upload-placeholder').classList.add('hidden');
    }

    // Load content from HTML file
    this.loadArticleContent(article.content);
  }

  async loadArticleContent(contentPath) {
    try {
      // Asegurar extensión .html en la ruta
      const url = contentPath.endsWith('.html') ? contentPath : contentPath + '.html';
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      
      // Extract content from article HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const content = doc.querySelector('.article-content');
      
      if (content) {
        document.getElementById('article-editor').innerHTML = content.innerHTML;
        
        // Guardar estado inicial del editor para Undo/Redo
        this.clearEditorHistory();
        this.saveEditorState();
        this.setupEditorImages();
        
        // Actualizar word count y SEO score después de cargar contenido
        this.updateWordCount();
        this.updateSEOScore();
      }
    } catch (error) {
      console.error('Error loading article content:', error);
    }
  }

  resetArticleForm() {
    this.editingArticle = null;
    this.tags = [];

    // Limpiar auto-guardado
    localStorage.removeItem('admin_draft_article');
    
    // Limpiar historial del editor
    this.clearEditorHistory();

    document.getElementById('article-form')?.reset();
    document.getElementById('article-id').value = '';
    document.getElementById('article-slug').value = '';
    document.getElementById('excerpt-count').textContent = '0';
    document.getElementById('article-editor').innerHTML = '';
    
    // Reset author to default
    const authorField = document.getElementById('article-author');
    if (authorField) authorField.value = 'Sala Geek';
    
    // Reset image
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('upload-placeholder').classList.remove('hidden');
    document.getElementById('preview-img').src = '';
    document.getElementById('image-url').value = '';

    // Reset SEO fields
    const metaDesc = document.getElementById('meta-description');
    if (metaDesc) metaDesc.value = '';
    const metaCount = document.getElementById('meta-description-count');
    if (metaCount) metaCount.textContent = '0';
    const metaKeywords = document.getElementById('meta-keywords');
    if (metaKeywords) metaKeywords.value = '';
    const canonicalUrl = document.getElementById('canonical-url');
    if (canonicalUrl) canonicalUrl.value = '';
    const ogImage = document.getElementById('og-image');
    if (ogImage) ogImage.value = '';
    const noIndex = document.getElementById('no-index');
    if (noIndex) noIndex.checked = false;

    // Reset tags
    this.renderTags();

    // Reset date to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('article-date').value = now.toISOString().slice(0, 16);

    // Default category
    const firstCategory = document.querySelector('input[name="category"]');
    if (firstCategory) firstCategory.checked = true;
  }

  /**
   * Guarda el artículo actual (crear o actualizar)
   * 
   * @async
   * @param {boolean} asDraft - Si true, guarda como borrador
   * @description Flujo completo de guardado:
   * 1. Recopila datos del formulario
   * 2. Valida campos requeridos (más flexible para borradores)
   * 3. Construye objeto articleData con SEO
   * 4. Envía a la API PHP del servidor
   * 5. Genera HTML del artículo
   * 6. Actualiza articles.json vía GitHub API + escritura local
   */
  async saveArticle(asDraft = false) {
    const form = document.getElementById('article-form');
    const btn = asDraft ? document.getElementById('btn-draft') : document.getElementById('btn-publish');
    
    // Gather form data
    const id = document.getElementById('article-id').value || this.generateId();
    const rawTitle = document.getElementById('article-title').value.trim();
    // Para borradores, usar "Sin título" si está vacío
    const title = rawTitle || (asDraft ? 'Sin título' : '');
    const slug = document.getElementById('article-slug').value.trim() || this.generateSlug(title || 'borrador');
    const excerpt = document.getElementById('article-excerpt').value.trim();
    const categories = this.getSelectedCategories();
    const category = this.getPrimaryCategory(); // Categoría principal para compatibilidad
    // Forzar status según el botón presionado
    const status = asDraft ? 'draft' : 'published';
    const dateInput = document.getElementById('article-date').value;
    const publishDate = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString();
    const featured = document.getElementById('article-featured').checked;
    const trending = document.getElementById('article-trending').checked;
    const readTime = document.getElementById('read-time').value;
    const image = document.getElementById('image-url').value || document.getElementById('preview-img')?.src || '';
    const content = document.getElementById('article-editor').innerHTML;
    
    // SEO fields
    const metaDescription = document.getElementById('meta-description')?.value.trim() || '';
    const metaKeywords = document.getElementById('meta-keywords')?.value.trim() || '';
    const canonicalUrl = document.getElementById('canonical-url')?.value.trim() || '';
    const ogImage = document.getElementById('og-image')?.value.trim() || '';
    const noIndex = document.getElementById('no-index')?.checked || false;

    const isDraft = asDraft;

    // Validation - más flexible para borradores
    // Para borradores, no se requiere nada (se puede guardar vacío)
    // Para publicar, se requiere título, extracto y contenido
    if (!isDraft) {
      if (!title) {
        this.showToast('El título es requerido para publicar', 'error');
        document.getElementById('article-title').focus();
        return;
      }
      if (!excerpt) {
        this.showToast('El extracto es requerido para publicar', 'error');
        document.getElementById('article-excerpt').focus();
        return;
      }
      if (!content || content.trim() === '' || content === '<br>') {
        this.showToast('El contenido del artículo es requerido para publicar', 'error');
        document.getElementById('article-editor').focus();
        return;
      }
    }
    
    if (excerpt.length > CONFIG.MAX_EXCERPT_LENGTH) {
      this.showToast(`El extracto es demasiado largo (máx ${CONFIG.MAX_EXCERPT_LENGTH} caracteres)`, 'warning');
      return;
    }

    // Count words from editor content
    const wordCountText = (content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = wordCountText.split(' ').filter(w => w.length > 0).length;

    // Category display names
    const categoryNames = {
      series: 'Series',
      peliculas: 'Películas',
      gaming: 'Gaming',
      anime: 'Anime',
      tecnologia: 'Tecnología'
    };

    const articleData = {
      id,
      title,
      slug,
      excerpt,
      content: `/blog/articulos/${slug}`,
      image,
      category,
      categories, // Array de categorías múltiples
      categoryDisplay: categoryNames[category] || category,
      tags: this.tags,
      author: document.getElementById('article-author')?.value?.trim() || 'Sala Geek',
      publishDate,
      modifiedDate: new Date().toISOString(),
      readTime,
      wordCount,
      views: this.editingArticle?.views || 0,
      featured,
      trending,
      status,
      // SEO fields
      metaDescription: metaDescription || excerpt.substring(0, 160),
      metaKeywords,
      canonicalUrl,
      ogImage: ogImage || image,
      noIndex
    };

    // Save
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Guardando...';

    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch('/api/save-article.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify({
          article: articleData,
          htmlContent: this.generateArticleHTML(articleData, content),
          isNew: !this.editingArticle
        })
      });

      if (!response.ok) {
        let errorData = {};
        let rawText = '';
        try {
          rawText = await response.text();
          errorData = JSON.parse(rawText);
        } catch (parseErr) {
          console.error('Save error: non-JSON response body:', rawText);
        }
        const errorMsg = errorData.error || `HTTP ${response.status}`;
        const hint = errorData.hint ? ` (${errorData.hint})` : '';
        const fileInfo = errorData.file ? ` [${errorData.file}:${errorData.line}]` : '';
        console.error('Save error:', errorMsg + hint + fileInfo, errorData);
        throw new Error(errorMsg + hint);
      }

      const result = await response.json();

      const successMsg = isDraft 
        ? '¡Borrador guardado exitosamente!'
        : this.editingArticle ? '¡Artículo actualizado exitosamente!' : '¡Artículo publicado exitosamente!';
      this.showToast(successMsg, 'success');
      
      // Marcar como guardado para evitar mensaje de cambios sin guardar
      this.contentSaved = true;
      
      // ═══════════════════════════════════════════════════════════
      // ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
      // El PHP guarda en GitHub pero el servidor local puede tardar
      // en sincronizar. Actualizamos arrays locales para que la UI
      // refleje los cambios al instante sin depender del servidor.
      // ═══════════════════════════════════════════════════════════
      if (isDraft) {
        // Actualizar/agregar en borradores
        const draftIdx = this.drafts.findIndex(d => d.id === articleData.id);
        if (draftIdx >= 0) {
          this.drafts[draftIdx] = articleData;
        } else {
          this.drafts.unshift(articleData);
        }
        // Remover de publicados si existía ahí
        this.articles = this.articles.filter(a => a.id !== articleData.id);
      } else {
        // Actualizar/agregar en publicados
        const artIdx = this.articles.findIndex(a => a.id === articleData.id);
        if (artIdx >= 0) {
          this.articles[artIdx] = articleData;
        } else {
          this.articles.unshift(articleData);
        }
        // Remover de borradores si existía ahí
        this.drafts = this.drafts.filter(d => d.id !== articleData.id);
      }

      // Re-renderizar toda la UI con los datos actualizados
      this.updateDashboardStats();
      this.renderArticlesTable();
      this.renderDraftsTable();
      this.renderRecentArticles();
      this.renderRecentDrafts();
      this.renderActivityLog();
      this.renderPublishChart();
      this.renderCategoriesBreakdown();
      this.renderBlogHealth();
      this.updateDraftsCount();
      
      // Navigate to appropriate section
      this.editingArticle = null;
      this.navigateTo(isDraft ? 'drafts' : 'articles');
      
      // Recargar desde servidor en background (por si hay otros cambios)
      // Se ejecuta después de navegar para no bloquear la UI
      setTimeout(() => this.loadArticles().catch(() => {}), 8000);

    } catch (error) {
      console.error('Error saving article:', error);
      this.showToast(`Error al guardar: ${error.message}`, 'error');
    } finally {
      btn.disabled = false;
      const btnLabel = asDraft ? 'Guardar Borrador' : 'Publicar';
      const btnIcon = asDraft 
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>`;
      btn.innerHTML = `${btnIcon} ${btnLabel}`;
    }
  }

  /**
   * Elimina un artículo
   * 
   * @async
   * @param {string} id - ID del artículo a eliminar
   * @description Solicita confirmación, elimina de articles.json
   * y borra el archivo HTML correspondiente
   */
  /**
   * Elimina un artículo o borrador
   * 
   * @async
   * @param {string} id - ID del artículo/borrador a eliminar
   * @description Solicita confirmación, elimina del JSON correspondiente
   * (articles.json o drafts.json) y borra el archivo HTML
   * 
   * @bugfix v2.1.0 - Ahora envía isDraft al API para eliminar del archivo correcto
   */
  async deleteArticle(id) {
    // Buscar en artículos publicados y en borradores
    let article = this.articles.find(a => a.id === id);
    const isDraft = !article;
    if (!article) {
      article = this.drafts.find(a => a.id === id);
    }
    if (!article) {
      this.showToast('Artículo no encontrado', 'error');
      return;
    }

    const itemType = isDraft ? 'borrador' : 'artículo';
    
    // Usar modal de confirmación personalizado
    const confirmed = await this.showConfirmModal(
      `¿Eliminar ${itemType}?`,
      `"${article.title}" será eliminado permanentemente. Esta acción no se puede deshacer.`,
      'Eliminar',
      'danger'
    );
    
    if (!confirmed) return;

    try {
      const accessToken = await this.getAccessToken();
      
      // BUGFIX: Enviar isDraft al API para eliminar del archivo JSON correcto
      const response = await fetch('/api/save-article.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify({ 
          id, 
          slug: article.slug,
          isDraft // Indica si eliminar de drafts.json o articles.json
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al eliminar');
      }

      // Mostrar toast con el título
      const type = isDraft ? 'Borrador' : 'Artículo';
      this.showToast(`${type} "${article.title}" eliminado correctamente`, 'success');
      
      // Actualizar estado local inmediatamente
      if (isDraft) {
        this.drafts = this.drafts.filter(d => d.id !== id);
      } else {
        this.articles = this.articles.filter(a => a.id !== id);
      }
      
      this.updateDashboardStats();
      this.renderArticlesTable();
      this.renderDraftsTable();
      this.renderRecentArticles();
      this.renderRecentDrafts();
      this.renderActivityLog();
      this.renderPublishChart();
      this.renderCategoriesBreakdown();
      this.renderBlogHealth();
      this.updateDraftsCount();

      // Recargar desde servidor en background
      setTimeout(() => this.loadArticles().catch(() => {}), 8000);

    } catch (error) {
      console.error('Error deleting article:', error);
      this.showToast(`Error: ${error.message}`, 'error');
    }
  }

  /**
   * Publica un borrador directamente sin abrir el editor
   * 
   * @async
   * @param {string} id - ID del borrador a publicar
   * @description Carga el borrador, cambia su estado a published y lo guarda
   * @since v2.1.0
   */
  async publishDraft(id) {
    const draft = this.drafts.find(d => d.id === id);
    if (!draft) {
      this.showToast('Borrador no encontrado', 'error');
      return;
    }

    // Validar que tenga los campos mínimos para publicar
    if (!draft.title || !draft.slug || !draft.excerpt) {
      this.showToast('El borrador necesita título, slug y extracto para publicar. Edítalo primero.', 'warning');
      this.editArticle(id);
      return;
    }

    const confirmed = await this.showConfirmModal(
      '¿Publicar borrador?',
      `"${draft.title}" será publicado y visible para todos los visitantes.`,
      'Publicar',
      'info'
    );

    if (!confirmed) return;

    try {
      // Cargar el contenido HTML del borrador
      const htmlResponse = await fetch(`/blog/articulos/${draft.slug}.html`);
      if (!htmlResponse.ok) {
        throw new Error('No se pudo cargar el contenido del borrador');
      }
      
      const htmlContent = await htmlResponse.text();
      
      // Extraer el contenido del artículo del HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const articleContent = doc.querySelector('.article-content');
      
      if (!articleContent) {
        throw new Error('Estructura del artículo inválida');
      }

      // Actualizar datos del borrador para publicación
      const articleData = {
        ...draft,
        status: 'published',
        publishDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString()
      };

      const accessToken = await this.getAccessToken();
      
      const response = await fetch('/api/save-article.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify({
          article: articleData,
          htmlContent: this.generateArticleHTML(articleData, articleContent.innerHTML),
          isNew: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al publicar');
      }

      this.showToast(`¡"${draft.title}" publicado exitosamente!`, 'success');
      
      // Actualizar estado local inmediatamente
      this.articles.unshift(articleData);
      this.drafts = this.drafts.filter(d => d.id !== articleData.id);
      
      this.updateDashboardStats();
      this.renderArticlesTable();
      this.renderDraftsTable();
      this.renderRecentArticles();
      this.renderRecentDrafts();
      this.renderActivityLog();
      this.renderPublishChart();
      this.renderCategoriesBreakdown();
      this.renderBlogHealth();
      this.updateDraftsCount();
      this.navigateTo('articles');

      // Recargar desde servidor en background
      setTimeout(() => this.loadArticles().catch(() => {}), 8000);

    } catch (error) {
      console.error('Error publishing draft:', error);
      this.showToast(`Error: ${error.message}`, 'error');
    }
  }
  
  /**
   * Muestra un modal de confirmación personalizado
   * @param {string} title - Título del modal
   * @param {string} message - Mensaje descriptivo
   * @param {string} confirmText - Texto del botón de confirmar
   * @param {string} type - Tipo: 'danger', 'warning', 'info'
   * @returns {Promise<boolean>} - True si confirma, false si cancela
   */
  showConfirmModal(title, message, confirmText = 'Confirmar', type = 'danger') {
    return new Promise((resolve) => {
      const modal = document.getElementById('confirm-modal');
      if (!modal) {
        // Fallback al confirm nativo si no existe el modal
        resolve(confirm(message));
        return;
      }
      
      const icon = modal.querySelector('.confirm-icon');
      const titleEl = modal.querySelector('h3');
      const messageEl = modal.querySelector('p');
      const acceptBtn = document.getElementById('confirm-accept');
      const cancelBtn = document.getElementById('confirm-cancel');
      
      // Configurar icono según tipo
      icon.className = 'confirm-icon' + (type !== 'danger' ? ` ${type}` : '');
      
      // Mostrar/ocultar íconos según tipo
      const iconDanger = icon.querySelector('.icon-danger');
      const iconWarning = icon.querySelector('.icon-warning');
      const iconInfo = icon.querySelector('.icon-info');
      
      if (iconDanger) iconDanger.style.display = type === 'danger' ? 'block' : 'none';
      if (iconWarning) iconWarning.style.display = type === 'warning' ? 'block' : 'none';
      if (iconInfo) iconInfo.style.display = type === 'info' ? 'block' : 'none';
      
      // Configurar contenido
      titleEl.textContent = title;
      messageEl.textContent = message;
      acceptBtn.textContent = confirmText;
      
      // Configurar estilo del botón según tipo
      acceptBtn.className = type === 'danger' ? 'btn-danger' : 'btn-primary';
      
      // Mostrar modal
      modal.classList.remove('hidden');
      
      // Focus en el botón de cancelar para evitar aceptar accidentalmente
      setTimeout(() => cancelBtn.focus(), 100);
      
      // Handlers
      const cleanup = () => {
        modal.classList.add('hidden');
        acceptBtn.removeEventListener('click', onAccept);
        cancelBtn.removeEventListener('click', onCancel);
        modal.removeEventListener('click', onBackdrop);
        document.removeEventListener('keydown', onKeydown);
      };
      
      const onAccept = () => {
        cleanup();
        resolve(true);
      };
      
      const onCancel = () => {
        cleanup();
        resolve(false);
      };
      
      const onBackdrop = (e) => {
        if (e.target === modal) {
          cleanup();
          resolve(false);
        }
      };
      
      const onKeydown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        } else if (e.key === 'Enter' && document.activeElement === acceptBtn) {
          e.preventDefault();
          onAccept();
        } else if (e.key === 'Tab') {
          // Focus trapping dentro del modal
          const focusable = modal.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
          } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
        }
      };
      
      acceptBtn.addEventListener('click', onAccept);
      cancelBtn.addEventListener('click', onCancel);
      modal.addEventListener('click', onBackdrop);
      document.addEventListener('keydown', onKeydown);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // TAGS
  // ═══════════════════════════════════════════════════════════════

  addTag(tag) {
    tag = tag.trim().toLowerCase();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.renderTags();
      this.updateSEOScore();
    }
  }

  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    this.renderTags();
    this.updateSEOScore();
  }

  renderTags() {
    const container = document.getElementById('tags-list');
    if (!container) return;

    container.innerHTML = '';
    this.tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag-item';
      span.textContent = tag;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = '&times;';
      btn.title = 'Eliminar tag';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.removeTag(tag);
      });

      span.appendChild(btn);
      container.appendChild(span);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PREVIEW
  // ═══════════════════════════════════════════════════════════════

  showPreview() {
    const title = document.getElementById('article-title').value || 'Sin título';
    const excerpt = document.getElementById('article-excerpt').value || '';
    const content = document.getElementById('article-editor').innerHTML;
    const category = this.getPrimaryCategory();
    const image = document.getElementById('image-url').value || document.getElementById('preview-img')?.src;

    const tags = this.tags || [];
    const previewHTML = this.generateArticlePreviewHTML(title, excerpt, content, category, image, tags);
    
    const iframe = document.getElementById('preview-frame');
    
    // Use srcdoc with base tag to resolve relative URLs
    iframe.srcdoc = previewHTML;
    
    document.getElementById('preview-modal').classList.remove('hidden');
    
    // Set default device to desktop
    this.setPreviewDevice('desktop');
  }

  generateArticlePreviewHTML(title, excerpt, content, category, image, tags = []) {
    // Get current origin for base URL
    const baseUrl = window.location.origin;
    const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);
    const dateFormatted = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Get reading time from form
    const readingTime = document.getElementById('article-reading-time')?.value || '5';
    
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <base href="${baseUrl}/">
        <title>${this.escapeHtml(title)} | Sala Geek</title>
        <link rel="stylesheet" href="${baseUrl}/src/css/normalize.css">
        <link rel="stylesheet" href="${baseUrl}/src/css/style.min.css">
        <link rel="stylesheet" href="${baseUrl}/src/css/blog.css">
        <style>
          /* Variables del sitio */
          :root {
            --bg-primary: #0a0e27;
            --bg-secondary: #0f1433;
            --text-primary: #e4e6eb;
            --text-secondary: #8b8fa3;
            --text-tertiary: #6c7086;
            --accent-primary: #ffd166;
            --accent-secondary: #ff9f1c;
            --border-color: rgba(255, 209, 102, 0.1);
          }
          
          body { 
            background: var(--bg-primary); 
            color: var(--text-primary);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
          }
          
          .preview-wrapper {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
          }
          
          /* Breadcrumbs */
          .breadcrumbs {
            background: linear-gradient(180deg, rgba(10, 14, 39, 0.95) 0%, rgba(10, 14, 39, 0.7) 100%);
            border-bottom: 1px solid rgba(255, 209, 102, 0.08);
            padding: 0.875rem 2rem;
            margin: -2rem -2rem 2rem -2rem;
          }
          .breadcrumbs ol {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            list-style: none;
            margin: 0;
            padding: 0;
            font-size: 0.85rem;
          }
          .breadcrumbs li {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-secondary);
          }
          .breadcrumbs li a {
            color: var(--text-secondary);
            text-decoration: none;
          }
          .breadcrumbs li:not(:last-child)::after {
            content: "›";
            margin-left: 0.6rem;
            color: var(--accent-primary);
            font-weight: 600;
          }
          .breadcrumbs li.active {
            color: var(--accent-primary);
            font-weight: 500;
          }
          
          /* Article header */
          .article-full { max-width: 800px; margin: 0 auto; }
          .article-header { margin-bottom: 2rem; }
          
          .article-meta-top { 
            display: flex; 
            flex-wrap: wrap;
            align-items: center; 
            gap: 0.75rem 1rem; 
            margin-bottom: 1rem;
          }
          
          .article-category { 
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1.25rem;
            background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
            color: var(--bg-primary);
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.75px;
            border-radius: 50px;
            text-decoration: none;
            box-shadow: 0 4px 15px rgba(255, 209, 102, 0.25);
          }
          .article-category svg { width: 16px; height: 16px; }
          
          time {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            color: var(--text-tertiary);
            font-size: 0.9rem;
          }
          time svg { width: 14px; height: 14px; opacity: 0.7; }
          
          .article-title { 
            font-size: 2.25rem; 
            font-weight: 800;
            margin: 1rem 0 1.25rem;
            line-height: 1.25;
            color: var(--text-primary);
            letter-spacing: -0.02em;
          }
          
          .article-excerpt { 
            color: var(--text-secondary);
            font-size: 1.125rem;
            line-height: 1.7;
            margin-bottom: 1.5rem;
          }
          
          .article-meta-bottom {
            display: flex;
            gap: 1.5rem;
            padding: 1rem 0;
            border-top: 1px solid var(--border-color);
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 2rem;
          }
          .article-meta-bottom span {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.875rem;
            color: var(--text-tertiary);
          }
          .article-meta-bottom svg { width: 16px; height: 16px; opacity: 0.7; }
          
          /* Featured image */
          .article-featured-image { 
            margin: 0 0 2rem;
            border-radius: 12px;
            overflow: hidden;
            background: var(--bg-secondary);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          .article-featured-image img { 
            width: 100%; 
            display: block;
            aspect-ratio: 16/9;
            object-fit: cover;
          }
          .article-featured-image figcaption {
            background: var(--bg-secondary);
            padding: 0.75rem 1rem;
            font-size: 0.85rem;
            color: var(--text-tertiary);
            font-style: italic;
            text-align: center;
          }
          
          /* Article content */
          .article-content { 
            font-size: 1.0625rem;
            line-height: 1.8;
            color: var(--text-primary);
          }
          .article-content .lead {
            font-size: 1.25rem;
            line-height: 1.75;
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border-color);
          }
          .article-content p { margin-bottom: 1.5rem; }
          .article-content strong { color: var(--accent-primary); font-weight: 600; }
          
          .article-content h2 { 
            font-size: 1.75rem;
            font-weight: 700;
            margin: 3rem 0 1.25rem;
            padding: 1rem 0 1rem 1.25rem;
            position: relative;
            border-left: 3px solid var(--accent-primary);
            background: linear-gradient(90deg, rgba(255, 209, 102, 0.08) 0%, transparent 50%);
            border-radius: 0 8px 8px 0;
          }
          
          .article-content h3 { 
            font-size: 1.375rem;
            font-weight: 600;
            margin: 2rem 0 1rem;
            padding-left: 0.75rem;
            border-left: 2px solid rgba(255, 209, 102, 0.4);
          }
          
          .article-content ul, .article-content ol {
            margin: 1.5rem 0;
            padding-left: 0;
            list-style: none;
          }
          .article-content li {
            position: relative;
            padding-left: 1.75rem;
            margin-bottom: 0.75rem;
          }
          .article-content ul li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0.6em;
            width: 8px;
            height: 8px;
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            border-radius: 50%;
          }
          
          .article-content blockquote { 
            margin: 2rem 0;
            padding: 1.5rem 2rem;
            background: linear-gradient(135deg, rgba(255, 209, 102, 0.05) 0%, rgba(255, 159, 28, 0.08) 100%);
            border-left: 4px solid var(--accent-primary);
            border-radius: 0 12px 12px 0;
            font-style: italic;
          }
          .article-content blockquote p { margin-bottom: 0.75rem; font-size: 1.125rem; }
          .article-content blockquote p:last-child { margin-bottom: 0; }
          
          .article-content a {
            color: var(--accent-primary);
            text-decoration: underline;
            text-underline-offset: 3px;
          }
          
          .article-content img { 
            max-width: 100%; 
            border-radius: 8px;
            margin: 1rem 0;
          }
          
          /* Resizable images */
          .resizable-image, .resizable-image img { max-width: 100%; }
          .resizable-image.float-left { float: left; margin: 0 1.5rem 1rem 0; }
          .resizable-image.float-right { float: right; margin: 0 0 1rem 1.5rem; }
          .resizable-image.align-left { 
            display: block; 
            margin: 1.5rem auto 1.5rem 0;
            width: fit-content;
          }
          .resizable-image.align-center { 
            display: block; 
            margin: 1.5rem auto; 
            text-align: center;
            width: fit-content;
          }
          .resizable-image.align-right { 
            display: block; 
            margin: 1.5rem 0 1.5rem auto;
            width: fit-content;
          }
          
          /* Figure alignment */
          figure.align-left {
            display: block;
            margin: 1.5rem auto 1.5rem 0;
            width: fit-content;
          }
          figure.align-center {
            display: block;
            margin: 1.5rem auto;
            width: fit-content;
          }
          figure.align-right {
            display: block;
            margin: 1.5rem 0 1.5rem auto;
            width: fit-content;
          }
          
          /* Image grids */
          .image-grid-container { display: grid; gap: 0.75rem; margin: 1.5rem 0; }
          .image-grid-container.cols-2 { grid-template-columns: repeat(2, 1fr); }
          .image-grid-container.cols-3 { grid-template-columns: repeat(3, 1fr); }
          .image-grid-container.cols-4 { grid-template-columns: repeat(4, 1fr); }
          .image-grid-container img { width: 100%; height: auto; object-fit: cover; border-radius: 8px; }
          
          /* Figure and figcaption */
          figure.resizable-image {
            display: block;
          }
          figure.resizable-image img {
            display: block;
            width: 100%;
          }
          figcaption { 
            display: block;
            text-align: center; 
            font-size: 0.85rem; 
            color: var(--text-tertiary); 
            margin-top: 0.5rem; 
            font-style: italic; 
          }
          
          /* Video containers */
          .video-container, .youtube-embed {
            position: relative;
            width: 100%;
            padding-bottom: 56.25%;
            margin: 2rem auto;
            background: var(--bg-secondary);
            border-radius: 12px;
            overflow: hidden;
          }
          .video-container.video-small, .youtube-embed.video-small { max-width: 400px; }
          .video-container.video-medium, .youtube-embed.video-medium { max-width: 560px; }
          .video-container.video-large, .youtube-embed.video-large { max-width: 750px; }
          .video-container.video-full, .youtube-embed.video-full { max-width: 100%; }
          .video-container iframe, .youtube-embed iframe {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            border: none;
          }
          
          /* Preview badge */
          .preview-badge {
            position: fixed;
            top: 0.5rem;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            color: #0a0e27;
            padding: 0.35rem 0.75rem;
            border-radius: 2rem;
            font-size: 0.65rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            box-shadow: 0 4px 15px rgba(255, 209, 102, 0.3);
            z-index: 100;
            white-space: nowrap;
          }
          
          /* Responsive para móvil */
          @media (max-width: 500px) {
            .preview-wrapper {
              padding: 1rem;
              padding-top: 2.5rem;
            }
            .breadcrumbs {
              padding: 0.5rem 1rem;
              margin: -1rem -1rem 1rem -1rem;
              font-size: 0.75rem;
              overflow-x: auto;
              white-space: nowrap;
            }
            .breadcrumbs ol {
              flex-wrap: nowrap;
            }
            .article-meta-top {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }
            .article-title {
              font-size: 1.5rem;
            }
            .article-excerpt {
              font-size: 1rem;
            }
            .article-category {
              padding: 0.5rem 1rem;
              font-size: 0.7rem;
            }
            .article-meta-bottom {
              flex-direction: column;
              gap: 0.75rem;
            }
          }
        </style>
      </head>
      <body class="article-page">
        <div class="preview-badge">Vista Previa</div>
        
        <div class="preview-wrapper">
          <nav class="breadcrumbs">
            <ol>
              <li><a href="#">Inicio</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">${categoryDisplay}</a></li>
              <li class="active">${this.escapeHtml(title).substring(0, 30)}${title.length > 30 ? '...' : ''}</li>
            </ol>
          </nav>
          
          <article class="article-full">
            <header class="article-header">
              <div class="article-meta-top">
                <a class="article-category category-${category}">
                  ${this.getCategoryIconForPreview(category)}
                  ${categoryDisplay}
                </a>
                <time>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  ${dateFormatted}
                </time>
              </div>
              
              <h1 class="article-title">${this.escapeHtml(title)}</h1>
              <p class="article-excerpt">${this.escapeHtml(excerpt)}</p>
              
              <div class="article-meta-bottom">
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  ${readingTime} min de lectura
                </span>
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  0 vistas
                </span>
              </div>
            </header>
            
            ${image && image !== '' && !image.includes('data:,') ? `
            <figure class="article-featured-image">
              <img src="${image}" alt="${this.escapeHtml(title)}" onerror="this.parentElement.style.display='none'">
            </figure>
            ` : ''}
            
            <div class="article-content">${content}</div>

            ${tags.length > 0 ? `
            <section class="article-tags">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              <h4>Tags</h4>
              ${tags.map(t => `<a class="article-tag">${this.escapeHtml(t)}</a>`).join('')}
            </section>
            ` : ''}
          </article>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Obtiene el icono SVG de la categoría para la preview
   */
  getCategoryIconForPreview(category) {
    const icons = {
      series: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>',
      peliculas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
      gaming: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="6.01" y2="12"/><line x1="10" y1="12" x2="18" y2="12"/></svg>',
      anime: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8 2 4 6 4 10c0 2.5 1 4.5 2.5 6l-1 4 3-2c1 .6 2.2 1 3.5 1s2.5-.4 3.5-1l3 2-1-4c1.5-1.5 2.5-3.5 2.5-6 0-4-4-8-8-8z"></path></svg>',
      tecnologia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>'
    };
    return icons[category] || icons.series;
  }

  // ═══════════════════════════════════════════════════════════════
  // HTML GENERATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Genera el HTML completo del artículo para guardar
   * 
   * @param {Object} article - Datos del artículo (metadata)
   * @param {string} content - Contenido HTML del editor
   * @returns {string} HTML completo listo para guardar como archivo
   * 
   * @description Genera una página HTML completa con:
   * - Meta tags SEO (description, keywords, robots, canonical)
   * - Open Graph para redes sociales
   * - Twitter Cards
   * - Estructura de artículo con breadcrumbs
   * - Botones de compartir
   * - Sección de artículos relacionados
   */
  /**
   * Sanitiza HTML eliminando tags y atributos peligrosos.
   * Whitelist de tags seguros para contenido de artículos.
   */
  sanitizeHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;

    // Tags peligrosos a eliminar completamente (incluyendo su contenido)
    // NOTA: 'iframe' se maneja por separado para preservar embeds de YouTube
    const dangerousTags = ['script', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button', 'link', 'meta', 'style', 'applet', 'base', 'basefont'];
    dangerousTags.forEach(tag => {
      div.querySelectorAll(tag).forEach(el => el.remove());
    });

    // Manejar iframes: preservar solo YouTube embeds legítimos, eliminar el resto
    div.querySelectorAll('iframe').forEach(iframe => {
      const src = (iframe.getAttribute('src') || '').toLowerCase().replace(/\s/g, '');
      const isYouTube = src.startsWith('https://www.youtube.com/embed/') || 
                        src.startsWith('https://youtube.com/embed/') ||
                        src.startsWith('https://www.youtube-nocookie.com/embed/');
      if (!isYouTube) {
        iframe.remove();
      }
    });

    // Eliminar atributos peligrosos de TODOS los elementos
    div.querySelectorAll('*').forEach(el => {
      const attrsToRemove = [];
      for (const attr of el.attributes) {
        const name = attr.name.toLowerCase();
        // Eliminar event handlers (on*)
        if (name.startsWith('on')) {
          attrsToRemove.push(attr.name);
        }
        // Eliminar javascript: URLs
        if ((name === 'href' || name === 'src' || name === 'action') &&
            attr.value.replace(/\s/g, '').toLowerCase().startsWith('javascript:')) {
          attrsToRemove.push(attr.name);
        }
        // Eliminar data: URLs en src (excepto imágenes data: legítimas)
        if (name === 'src' && attr.value.replace(/\s/g, '').toLowerCase().startsWith('data:') &&
            !attr.value.replace(/\s/g, '').toLowerCase().startsWith('data:image/')) {
          attrsToRemove.push(attr.name);
        }
      }
      attrsToRemove.forEach(a => el.removeAttribute(a));
    });

    // Añadir loading="lazy" a todas las imágenes que no lo tengan
    div.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });

    return div.innerHTML;
  }

  generateArticleHTML(article, content) {
    // Sanitizar HTML: eliminar tags/atributos peligrosos
    content = this.sanitizeHTML(content);

    // Limpiar toolbars y clases de editor del contenido antes de generar HTML
    const cleanDiv = document.createElement('div');
    cleanDiv.innerHTML = content;
    cleanDiv.querySelectorAll('.image-toolbar').forEach(el => el.remove());
    cleanDiv.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    // Eliminar contenedores de video vacíos (sin iframe) y limpiar toolbars de video
    cleanDiv.querySelectorAll('.video-container, .youtube-embed').forEach(container => {
      if (!container.querySelector('iframe')) {
        container.remove();
        return;
      }
      // Limpiar toolbars de video del editor
      const vtb = container.querySelector('.video-toolbar');
      if (vtb) vtb.remove();
      // Limpiar estilos de selección del editor
      container.style.outline = '';
      container.style.outlineOffset = '';
    });
    cleanDiv.querySelectorAll('.image-resize-wrapper').forEach(wrapper => {
      // Remover resize handles y dejar solo la imagen
      wrapper.querySelectorAll('.resize-handle').forEach(h => h.remove());
      wrapper.classList.remove('has-selected');
    });
    content = cleanDiv.innerHTML;

    const categoryIcons = {
      series: '<rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline>',
      peliculas: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>',
      gaming: '<rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="6.01" y2="12"/><line x1="10" y1="12" x2="18" y2="12"/>',
      anime: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
      tecnologia: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>'
    };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Count words for schema
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const wordCount = (tempDiv.textContent || '').trim().split(/\s+/).filter(w => w.length > 0).length;

    // Conditional featured image
    const featuredImageHTML = article.image ? `
      <figure class="article-featured-image">
        <img 
          src="${article.image}" 
          alt="${this.escapeHtml(article.title)}"
          loading="eager"
          width="1200"
          height="630"
        />
      </figure>` : '';

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="google-adsense-account" content="ca-pub-3884162231581435" />
  
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3884162231581435" crossorigin="anonymous"><\/script>
  
  <title>${this.escapeHtml(article.title)} | Sala Geek</title>
  <meta name="description" content="${this.escapeHtml(article.metaDescription || article.excerpt)}" />
  <meta name="keywords" content="${this.escapeHtml(article.metaKeywords || (article.tags || []).join(', '))}" />
  <meta name="author" content="${this.escapeHtml(article.author || 'Sala Geek')}" />
  <meta name="robots" content="${article.noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}" />
  <link rel="canonical" href="${this.escapeHtml(article.canonicalUrl || `https://salageek.com/blog/articulos/${article.slug}`)}" />
  
  <meta name="article:published_time" content="${article.publishDate}" />
  <meta name="article:modified_time" content="${article.modifiedDate}" />
  <meta name="article:section" content="${article.categoryDisplay}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${this.escapeHtml(article.title)}" />
  <meta property="og:description" content="${this.escapeHtml(article.metaDescription || article.excerpt)}" />
  <meta property="og:image" content="${article.ogImage || article.image}" />
  <meta property="og:url" content="https://salageek.com/blog/articulos/${article.slug}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${this.escapeHtml(article.title)}" />
  <meta name="twitter:description" content="${this.escapeHtml(article.excerpt)}" />
  <meta name="twitter:image" content="${article.ogImage || article.image}" />

  <link rel="icon" href="/src/images/Icono_SG.ico" type="image/x-icon" />
  <link rel="apple-touch-icon" href="/src/images/SalaGeek_LOGO.webp" />
  <meta name="theme-color" content="#1a1f3a" />

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${this.escapeHtml(article.title)}",
    "description": "${this.escapeHtml(article.metaDescription || article.excerpt)}",
    "image": {
      "@type": "ImageObject",
      "url": "${article.ogImage || article.image}",
      "width": 1200,
      "height": 630
    },
    "author": {
      "@type": "Organization",
      "name": "Sala Geek",
      "url": "https://salageek.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://salageek.com/src/images/SalaGeek_LOGO.webp"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sala Geek",
      "logo": {
        "@type": "ImageObject",
        "url": "https://salageek.com/src/images/SalaGeek_LOGO.webp",
        "width": 512,
        "height": 512
      }
    },
    "datePublished": "${article.publishDate}",
    "dateModified": "${article.modifiedDate}",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://salageek.com/blog/articulos/${article.slug}"
    },
    "articleSection": "${this.escapeHtml(article.categoryDisplay)}",
    "keywords": "${this.escapeHtml(article.metaKeywords || (article.tags || []).join(', '))}",
    "wordCount": "${wordCount}",
    "inLanguage": "es"
  }
  <\/script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://salageek.com"},
      {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://salageek.com/blog"},
      {"@type": "ListItem", "position": 3, "name": "${article.categoryDisplay}", "item": "https://salageek.com/blog/?categoria=${article.category}"},
      {"@type": "ListItem", "position": 4, "name": "${this.escapeHtml(article.title.substring(0, 50))}"}
    ]
  }
  <\/script>

  <link rel="stylesheet" href="/src/css/normalize.css" />
  <link rel="stylesheet" href="/src/css/style.min.css?v=300" />
  <link rel="stylesheet" href="/src/css/blog.min.css?v=300" />
  
  <script src="/src/js/blog-engine.min.js?v=300" defer><\/script>
</head>

<body class="article-page">
  <div id="header-container"></div>

  <main class="blog-article-page">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <a href="/">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Inicio
          </a>
        </li>
        <li>
          <a href="/blog/">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <rect x="2" y="3" width="20" height="14" rx="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            Blog
          </a>
        </li>
        <li>
          <a href="/blog/?categoria=${article.category}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">${categoryIcons[article.category] || ''}</svg>
            ${article.categoryDisplay}
          </a>
        </li>
        <li aria-current="page">${this.escapeHtml(article.title.substring(0, 40))}${article.title.length > 40 ? '...' : ''}</li>
      </ol>
    </nav>

    <article class="article-full">
      <header class="article-header">
        <div class="article-meta-top">
          <a href="/blog/?categoria=${article.category}" class="article-category category-${article.category}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${categoryIcons[article.category] || ''}</svg>
            ${article.categoryDisplay}
          </a>
          <time datetime="${article.publishDate.split('T')[0]}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${formatDate(article.publishDate)}
          </time>
        </div>

        <h1 class="article-title">${this.escapeHtml(article.title)}</h1>

        <p class="article-excerpt">${this.escapeHtml(article.excerpt)}</p>

        <div class="article-meta-bottom">
          <span class="article-author">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Por ${this.escapeHtml(article.author || 'Sala Geek')}
          </span>
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${article.readTime} de lectura
          </span>
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span id="view-count">${article.views || 0}</span> vistas
          </span>
        </div>
      </header>

      ${featuredImageHTML}

      <div class="article-content">
        ${content}
      </div>

      <!-- Share buttons -->
      <aside class="article-share">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          Compartir artículo
        </h3>
        <div class="share-buttons">
          <button class="share-btn share-twitter" onclick="shareOnTwitter()" aria-label="Compartir en Twitter">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            <span>Twitter</span>
          </button>
          <button class="share-btn share-facebook" onclick="shareOnFacebook()" aria-label="Compartir en Facebook">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span>Facebook</span>
          </button>
          <button class="share-btn share-whatsapp" onclick="shareOnWhatsApp()" aria-label="Compartir en WhatsApp">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <span>WhatsApp</span>
          </button>
          <button class="share-btn share-copy" onclick="copyLink(this)" aria-label="Copiar enlace">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span>Copiar</span>
          </button>
        </div>
      </aside>

      <!-- Tags -->
      <div class="article-tags">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
        ${(article.tags || []).map(tag => `<a href="/blog/?tag=${encodeURIComponent(tag)}" class="article-tag">${tag}</a>`).join('\n        ')}
      </div>

      <!-- Related articles -->
      <section class="related-articles">
        <h2 class="related-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          También te puede interesar
        </h2>
        <div class="related-grid" id="related-articles">
          <div class="loading-spinner">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </div>
        </div>
      </section>

      <!-- Comments with Giscus -->
      <section class="comments-section">
        <h2 class="comments-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Comentarios
        </h2>
        <div class="giscus-container">
          <script src="https://giscus.app/client.js"
            data-repo="HumbertMarin09/SalaGeek_Landing"
            data-repo-id="R_kgDOQN3OMw"
            data-category="Announcements"
            data-category-id="DIC_kwDOQN3OM84C1Dzm"
            data-mapping="pathname"
            data-strict="0"
            data-reactions-enabled="1"
            data-emit-metadata="0"
            data-input-position="top"
            data-theme="dark"
            data-lang="es"
            data-loading="lazy"
            crossorigin="anonymous"
            async>
          <\/script>
        </div>
      </section>
    </article>
  </main>

  <div id="footer-container"></div>

  <script src="/src/js/script.min.js?v=300" defer><\/script>
  
  <!-- Share functions -->
  <script>
    function shareOnTwitter() {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(document.title);
      window.open('https://twitter.com/intent/tweet?url=' + url + '&text=' + text, '_blank', 'width=550,height=420');
    }
    function shareOnFacebook() {
      const url = encodeURIComponent(window.location.href);
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank', 'width=550,height=420');
    }
    function shareOnWhatsApp() {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(document.title);
      window.open('https://wa.me/?text=' + text + '%20' + url, '_blank');
    }
    function copyLink(btn) {
      navigator.clipboard.writeText(window.location.href).then(function() {
        btn.classList.add('copied');
        var span = btn.querySelector('span');
        var orig = span.textContent;
        span.textContent = '¡Copiado!';
        btn.querySelector('svg').innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
        setTimeout(function() {
          btn.classList.remove('copied');
          span.textContent = orig;
          btn.querySelector('svg').innerHTML = '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>';
        }, 2000);
      });
    }
  <\/script>

  <!-- Load header, footer and related articles -->
  <script>
    // Load header and footer partials
    fetch('/src/pages/partials/header.html')
      .then(function(r) { return r.text(); })
      .then(function(html) { document.getElementById('header-container').innerHTML = html; });
    fetch('/src/pages/partials/footer.html')
      .then(function(r) { return r.text(); })
      .then(function(html) { document.getElementById('footer-container').innerHTML = html; });

    // Track article view
    (function() {
      var slug = window.location.pathname.split('/').pop().replace('.html', '');
      if (slug) {
        fetch('/api/track-view.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: slug })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var el = document.getElementById('view-count');
          if (el && data.views !== undefined) {
            el.textContent = data.views;
          }
        })
        .catch(function() {});
      }
    })();

    // Load related articles
    document.addEventListener('DOMContentLoaded', async function() {
      const blogEngine = new BlogEngine();
      await blogEngine.init();
      
      const currentSlug = window.location.pathname.split('/').pop().replace('.html', '');
      const currentArticle = blogEngine.articles.find(function(a) { return a.slug === currentSlug; });
      
      if (currentArticle) {
        const related = blogEngine.getRelatedArticles(currentArticle.id, 3);
        const relatedContainer = document.getElementById('related-articles');
        
        if (related.length > 0 && relatedContainer) {
          relatedContainer.innerHTML = related.map(function(article) {
            return '<article class="related-card">' +
              '<a href="' + article.content + '" class="related-card-link">' +
                '<div class="related-card-image">' +
                  '<img src="' + article.image + '" alt="' + article.title + '" loading="lazy" />' +
                  '<span class="related-card-category category-' + article.category + '">' + article.categoryDisplay + '</span>' +
                '</div>' +
                '<div class="related-card-content">' +
                  '<h4 class="related-card-title">' + article.title + '</h4>' +
                  '<p class="related-card-excerpt">' + (article.excerpt || '') + '</p>' +
                  '<div class="related-card-meta">' +
                    '<span class="related-card-date">' +
                      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
                      blogEngine.formatDate(article.publishDate) +
                    '</span>' +
                    '<span class="related-card-arrow">' +
                      'Leer' +
                      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
                    '</span>' +
                  '</div>' +
                '</div>' +
              '</a>' +
            '</article>';
          }).join('');
        } else if (relatedContainer) {
          relatedContainer.innerHTML = '<p class="no-related">No hay artículos relacionados disponibles.</p>';
        }
      }
    });
  <\/script>
</body>
</html>`;
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  generateId() {
    const timestamp = Date.now().toString(36);
    const randomPart = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
    return timestamp + randomPart;
  }

  updateWordCount() {
    const editor = document.getElementById('article-editor');
    const countEl = document.getElementById('word-count');
    if (!editor || !countEl) return;
    
    const text = editor.innerText || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    countEl.textContent = words.length;
  }

  /**
   * Genera un slug URL-friendly a partir de texto
   * 
   * @param {string} text - Título o texto fuente
   * @returns {string} Slug normalizado (max 60 chars)
   * @description Convierte a minúsculas, remueve acentos,
   * reemplaza espacios por guiones, elimina caracteres especiales
   */
  generateSlug(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/ñ/g, 'n') // Manejar ñ
      .replace(/[^a-z0-9\s-]/g, '') // Solo alfanuméricos, espacios y guiones
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno
      .replace(/(^-|-$)/g, '') // Eliminar guiones al inicio/final
      .substring(0, 60);
  }

  /**
   * Estima el tiempo de lectura basado en el contenido
   * 
   * @param {string} content - Contenido HTML del artículo
   * @returns {string} Tiempo estimado (ej: "5 min")
   */
  estimateReadTime(content) {
    // Remover HTML tags y contar palabras
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = text.split(' ').filter(w => w.length > 0).length;
    // Promedio de lectura: 200 palabras por minuto
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} min`;
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Escapa caracteres HTML para prevenir XSS
   * 
   * @param {string} text - Texto a escapar
   * @returns {string} Texto con caracteres HTML escapados
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Muestra una notificación toast
   * 
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
   * @description Crea un toast animado que se auto-elimina
   * después de CONFIG.TOAST_DURATION milisegundos
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const icons = {
      success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    container.appendChild(toast);

    // Auto remove after configured duration
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
  }

  // ═══════════════════════════════════════════════════════════════
  // SEO PREVIEW & COLLAPSIBLE SECTIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Configura la vista previa SEO en tiempo real
   */
  setupSEOPreview() {
    const titleInput = document.getElementById('article-title');
    const slugInput = document.getElementById('article-slug');
    const metaDescInput = document.getElementById('meta-description');
    const excerptInput = document.getElementById('article-excerpt');

    const updateSEOPreview = () => {
      const title = titleInput?.value?.trim() || 'Título del artículo';
      const slug = slugInput?.value?.trim() || this.generateSlug(title);
      const metaDesc = metaDescInput?.value?.trim() || excerptInput?.value?.trim() || 'La meta descripción aparecerá aquí. Escribe una descripción atractiva de 150-160 caracteres...';

      const previewTitle = document.getElementById('seo-preview-title');
      const previewUrl = document.getElementById('seo-preview-url');
      const previewDesc = document.getElementById('seo-preview-desc');

      if (previewTitle) previewTitle.textContent = `${title} | Sala Geek`;
      if (previewUrl) previewUrl.textContent = `salageek.com › blog › ${slug || 'articulos'}`;
      if (previewDesc) previewDesc.textContent = metaDesc;
      
      // Update SEO Score
      this.updateSEOScore();
    };

    titleInput?.addEventListener('input', updateSEOPreview);
    slugInput?.addEventListener('input', updateSEOPreview);
    metaDescInput?.addEventListener('input', updateSEOPreview);
    excerptInput?.addEventListener('input', updateSEOPreview);
    
    // Also listen to other relevant inputs
    document.getElementById('article-editor')?.addEventListener('input', () => this.updateSEOScore());
    document.getElementById('image-url')?.addEventListener('change', () => this.updateSEOScore());
    document.getElementById('tags-input')?.addEventListener('keydown', () => setTimeout(() => this.updateSEOScore(), 100));

    // Initial update
    updateSEOPreview();
  }

  // ═══════════════════════════════════════════════════════════════
  // SISTEMA SEO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Calcula el score SEO sin actualizar el UI
   * 
   * @description Evalúa 6 criterios SEO:
   * 1. Título (50-60 chars ideal)
   * 2. Meta descripción (150-160 chars ideal)
   * 3. Extracto (mín 50 chars)
   * 4. Imagen destacada (URL válida)
   * 5. Contenido (+300 palabras)
   * 6. Tags (mín 3)
   * 
   * @returns {{ checks: Object, passed: number, total: number, percentage: number }}
   */
  calculateSEOScore() {
    const checks = {
      title: false,
      description: false,
      excerpt: false,
      image: false,
      content: false,
      tags: false
    };

    // 1. Título (50-60 caracteres ideal)
    const title = document.getElementById('article-title')?.value?.trim() || '';
    const titleLen = title.length;
    if (titleLen >= 30 && titleLen <= 70) {
      checks.title = titleLen >= 50 && titleLen <= 60 ? 'pass' : 'warn';
    } else if (titleLen > 0) {
      checks.title = 'fail';
    }

    // 2. Meta descripción (150-160 caracteres ideal)
    const metaDesc = document.getElementById('meta-description')?.value?.trim() || '';
    const excerpt = document.getElementById('article-excerpt')?.value?.trim() || '';
    const descLen = metaDesc.length || excerpt.length;
    if (descLen >= 120 && descLen <= 160) {
      checks.description = descLen >= 150 ? 'pass' : 'warn';
    } else if (descLen > 0) {
      checks.description = descLen < 120 ? 'warn' : 'fail';
    }

    // 3. Extracto definido
    if (excerpt.length >= 50) {
      checks.excerpt = 'pass';
    } else if (excerpt.length > 0) {
      checks.excerpt = 'warn';
    }

    // 4. Imagen destacada - acepta http, data: URIs, y rutas relativas
    const imageUrlInput = document.getElementById('image-url')?.value?.trim() || '';
    const previewImg = document.getElementById('preview-img');
    const previewSrc = previewImg?.getAttribute('src') || '';
    const hasValidImage = (imageUrlInput && (imageUrlInput.startsWith('http') || imageUrlInput.startsWith('data:image/') || imageUrlInput.startsWith('/'))) || 
                         (previewSrc && (previewSrc.startsWith('http') || previewSrc.startsWith('data:image/') || previewSrc.startsWith('/')) && previewSrc.length > 10);
    if (hasValidImage) {
      checks.image = 'pass';
    }

    // 5. Contenido (+300 palabras)
    const content = document.getElementById('article-editor')?.innerText || '';
    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount >= 300) {
      checks.content = 'pass';
    } else if (wordCount >= 150) {
      checks.content = 'warn';
    } else if (wordCount > 0) {
      checks.content = 'fail';
    }

    // 6. Tags definidos (2+ es pass, 1 es warn)
    const tagsCount = this.tags?.length || 0;
    if (tagsCount >= 2) {
      checks.tags = 'pass';
    } else if (tagsCount > 0) {
      checks.tags = 'warn';
    }

    // Calculate totals
    let passed = 0;
    let total = 0;
    Object.values(checks).forEach(val => {
      total++;
      if (val === 'pass') passed++;
    });

    return {
      checks,
      passed,
      total,
      percentage: Math.round((passed / total) * 100)
    };
  }

  /**
   * Renderiza el score SEO en el UI
   * 
   * @description Actualiza el círculo de score, etiqueta y checks individuales.
   * Clases CSS aplicadas:
   * - score-good (>=80%): Verde
   * - score-medium (>=50%): Amarillo  
   * - score-bad (<50%): Rojo
   * 
   * @param {Object} seoData - Datos del cálculo SEO
   * @param {Object} seoData.checks - Estado de cada check (pass/warn/fail/false)
   * @param {number} seoData.passed - Número de checks pasados
   * @param {number} seoData.total - Total de checks
   * @param {number} seoData.percentage - Porcentaje de score (0-100)
   */
  renderSEOScore({ checks, passed, total, percentage }) {
    const scoreCircle = document.getElementById('seo-score-circle');
    const scoreValue = document.getElementById('seo-score-value');
    const scoreLabel = document.getElementById('seo-score-label');

    if (scoreCircle && scoreValue && scoreLabel) {
      scoreValue.textContent = `${passed}/${total}`;
      
      // Remove old classes
      scoreCircle.classList.remove('score-bad', 'score-medium', 'score-good');
      scoreLabel.classList.remove('score-bad', 'score-medium', 'score-good');
      
      // Add new class based on score
      if (percentage >= 80) {
        scoreCircle.classList.add('score-good');
        scoreLabel.classList.add('score-good');
        scoreLabel.textContent = 'Excelente';
      } else if (percentage >= 50) {
        scoreCircle.classList.add('score-medium');
        scoreLabel.classList.add('score-medium');
        scoreLabel.textContent = 'Mejorable';
      } else {
        scoreCircle.classList.add('score-bad');
        scoreLabel.classList.add('score-bad');
        scoreLabel.textContent = 'Necesita trabajo';
      }
    }

    // Update individual checks
    Object.entries(checks).forEach(([key, status]) => {
      const checkEl = document.querySelector(`.seo-check[data-check="${key}"]`);
      if (checkEl) {
        checkEl.classList.remove('check-pass', 'check-fail', 'check-warn');
        const icon = checkEl.querySelector('.seo-check-icon');
        if (status === 'pass') {
          checkEl.classList.add('check-pass');
          if (icon) icon.textContent = '';
        } else if (status === 'warn') {
          checkEl.classList.add('check-warn');
          if (icon) icon.textContent = '';
        } else if (status === 'fail') {
          checkEl.classList.add('check-fail');
          if (icon) icon.textContent = '';
        } else {
          if (icon) icon.textContent = '○';
        }
      }
    });
  }

  /**
   * Calcula y actualiza el score SEO (método principal)
   */
  updateSEOScore() {
    const seoData = this.calculateSEOScore();
    this.renderSEOScore(seoData);
  }

  /**
   * Configura las secciones colapsables
   */
  setupCollapsibleSections() {
    document.querySelectorAll('.collapsible-header').forEach(header => {
      header.addEventListener('click', () => {
        const card = header.closest('.sidebar-card-collapsible');
        card?.classList.toggle('collapsed');
      });
    });
  }

  /**
   * Configura el sistema de categorías y subcategorías
   */
  setupCategoryMultiSelect() {
    // ===== SUBCATEGORÍAS =====
    const addBtn = document.getElementById('add-subcategory-btn');
    const inputWrapper = document.getElementById('new-subcategory-input');
    const nameInput = document.getElementById('new-subcategory-name');
    const confirmBtn = document.getElementById('confirm-new-subcategory');
    const cancelBtn = document.getElementById('cancel-new-subcategory');
    const iconPicker = document.getElementById('subcategory-icon-picker');
    const iconDropdown = document.getElementById('subcategory-icon-dropdown');

    // Variable para almacenar el icono seleccionado
    this.selectedSubcategoryIcon = 'tag';

    addBtn?.addEventListener('click', () => {
      inputWrapper?.classList.remove('hidden');
      addBtn.classList.add('hidden');
      nameInput?.focus();
    });

    cancelBtn?.addEventListener('click', () => {
      this.resetSubcategoryInput();
    });

    confirmBtn?.addEventListener('click', () => {
      this.addNewSubcategory();
    });

    nameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addNewSubcategory();
      } else if (e.key === 'Escape') {
        this.resetSubcategoryInput();
      }
    });

    // Icon picker functionality
    iconPicker?.addEventListener('click', () => {
      iconDropdown?.classList.toggle('hidden');
    });

    // Selección de iconos
    iconDropdown?.querySelectorAll('.icon-picker-option').forEach(option => {
      option.addEventListener('click', () => {
        iconDropdown.querySelectorAll('.icon-picker-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        this.selectedSubcategoryIcon = option.dataset.icon;
        
        // Actualizar el icono del botón picker
        const iconSvg = option.querySelector('svg').cloneNode(true);
        iconSvg.setAttribute('width', '14');
        iconSvg.setAttribute('height', '14');
        iconPicker.innerHTML = '';
        iconPicker.appendChild(iconSvg);
      });
    });

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!iconPicker?.contains(e.target) && !iconDropdown?.contains(e.target)) {
        iconDropdown?.classList.add('hidden');
      }
    });
  }

  /**
   * Resetea el formulario de nueva subcategoría
   */
  resetSubcategoryInput() {
    const inputWrapper = document.getElementById('new-subcategory-input');
    const addBtn = document.getElementById('add-subcategory-btn');
    const nameInput = document.getElementById('new-subcategory-name');
    const iconDropdown = document.getElementById('subcategory-icon-dropdown');
    const iconPicker = document.getElementById('subcategory-icon-picker');

    inputWrapper?.classList.add('hidden');
    addBtn?.classList.remove('hidden');
    iconDropdown?.classList.add('hidden');
    if (nameInput) nameInput.value = '';

    // Reset icon picker to tag (default for subcategories)
    this.selectedSubcategoryIcon = 'tag';
    iconDropdown?.querySelectorAll('.icon-picker-option').forEach(o => o.classList.remove('selected'));
    iconDropdown?.querySelector('[data-icon="tag"]')?.classList.add('selected');
    if (iconPicker) {
      iconPicker.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`;
    }
  }

  /**
   * Agrega una nueva subcategoría
   */
  addNewSubcategory() {
    const nameInput = document.getElementById('new-subcategory-name');
    const subcategoriesList = document.getElementById('subcategories-list');

    const name = nameInput?.value?.trim();
    if (!name) {
      this.showToast('Ingresa un nombre para la subcategoría', 'warning');
      return;
    }

    const value = this.generateSlug(name);
    
    // Verificar que no exista
    if (document.querySelector(`input[name="subcategories"][value="${value}"]`)) {
      this.showToast('Esta subcategoría ya existe', 'warning');
      return;
    }

    // Obtener el SVG del icono seleccionado
    const iconSvg = this.getSubcategoryIconSvg(this.selectedSubcategoryIcon || 'tag');

    // Crear nueva opción con botón de eliminar
    const newOption = document.createElement('label');
    newOption.className = 'category-option subcategory-item';
    newOption.innerHTML = `
      <input type="checkbox" name="subcategories" value="${value}" checked>
      <span class="category-badge">
        ${iconSvg}
        ${this.escapeHtml(name)}
      </span>
      <button type="button" class="category-delete-btn" title="Eliminar subcategoría">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    // Event listener para eliminar
    newOption.querySelector('.category-delete-btn').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.deleteSubcategory(newOption, name);
    });

    subcategoriesList?.appendChild(newOption);

    // Limpiar y resetear
    this.resetSubcategoryInput();

    this.showToast(`Subcategoría "${name}" agregada`, 'success');
  }

  /**
   * Obtiene el SVG del icono de subcategoría
   */
  getSubcategoryIconSvg(iconName) {
    const icons = {
      tag: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
      star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      heart: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      zap: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      music: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
      book: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
      globe: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
      plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'
    };
    return icons[iconName] || icons.tag;
  }

  /**
   * Elimina una subcategoría
   */
  deleteSubcategory(element, name) {
    element.remove();
    this.showToast(`Subcategoría "${name}" eliminada`, 'success');
  }

  /**
   * Obtiene las subcategorías seleccionadas
   * @returns {Array<string>} Array de valores de subcategorías seleccionadas
   */
  getSelectedSubcategories() {
    const checkboxes = document.querySelectorAll('input[name="subcategories"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }

  /**
   * Obtiene la categoría principal seleccionada
   * @returns {string} Valor de la categoría principal o 'series' por defecto
   */
  getPrimaryCategory() {
    const selected = document.querySelector('input[name="category"]:checked');
    return selected?.value || 'series';
  }

  /**
   * Obtiene las categorías seleccionadas (categoría principal + tags)
   * @returns {string[]} Array de categorías
   */
  getSelectedCategories() {
    const primaryCategory = this.getPrimaryCategory();
    const categories = [primaryCategory];
    
    // Los tags ahora funcionan como subcategorías
    if (this.tags && this.tags.length > 0) {
      categories.push(...this.tags);
    }
    
    return categories;
  }
}

// Initialize admin (global for onclick handlers)
window.admin = new SalaGeekAdmin();
