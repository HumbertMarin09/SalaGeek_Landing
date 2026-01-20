/**
 * ═══════════════════════════════════════════════════════════════
 * 🎛️ SALA GEEK ADMIN - Panel de Administración
 * ═══════════════════════════════════════════════════════════════
 * 
 * Sistema de administración con Netlify Identity
 * Gestiona artículos, multimedia y contenido del blog
 * 
 * ═══════════════════════════════════════════════════════════════
 */

class SalaGeekAdmin {
  constructor() {
    this.user = null;
    this.articles = [];
    this.categories = [];
    this.currentSection = 'dashboard';
    this.editingArticle = null;
    this.tags = [];
    
    // Image modal states
    this.currentImageSource = 'url';
    this.uploadedImageData = null;
    
    // Grid modal states
    this.gridImages = [];
    this.gridCols = 2;
    this.gridGap = 8;
    
    this.init();
  }

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════
  
  async init() {
    // Initialize Netlify Identity
    this.initNetlifyIdentity();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup image modals
    this.setupImageModals();
    
    // Setup image resize modal
    this.setupImageResizeModal();
    
    // Check if user is already logged in
    const user = netlifyIdentity.currentUser();
    if (user) {
      this.handleLogin(user);
    }
  }

  initNetlifyIdentity() {
    netlifyIdentity.on('init', user => {
      if (user) {
        this.handleLogin(user);
      }
    });

    netlifyIdentity.on('login', user => {
      this.handleLogin(user);
      netlifyIdentity.close();
    });

    netlifyIdentity.on('logout', () => {
      this.handleLogout();
    });

    netlifyIdentity.on('error', err => {
      console.error('Netlify Identity Error:', err);
      this.showToast('Error de autenticación', 'error');
    });

    // Initialize the widget
    netlifyIdentity.init({
      locale: 'es'
    });
  }

  handleLogin(user) {
    this.user = user;
    
    // Update UI
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    
    // Update user info
    const name = user.user_metadata?.full_name || user.email.split('@')[0];
    document.getElementById('user-name').textContent = name;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
    
    // Load data
    this.loadArticles();
    
    this.showToast(`¡Bienvenido, ${name}!`, 'success');
  }

  handleLogout() {
    this.user = null;
    this.articles = [];
    
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
  }

  changePassword() {
    if (confirm('Para cambiar tu contraseña necesitas cerrar sesión. ¿Continuar?')) {
      // Cerrar sesión
      netlifyIdentity.logout();
      
      // Esperar un momento y abrir el widget en modo login
      setTimeout(() => {
        netlifyIdentity.open('login');
        this.showToast('Haz click en "Forgot password?" para cambiar tu contraseña', 'info');
      }, 500);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════════

  setupEventListeners() {
    // Login button
    document.getElementById('login-btn')?.addEventListener('click', () => {
      netlifyIdentity.open('login');
    });

    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      netlifyIdentity.logout();
    });

    // Change password button
    document.getElementById('change-password-btn')?.addEventListener('click', () => {
      this.changePassword();
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        this.navigateTo(section);
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

    // Article form
    document.getElementById('article-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveArticle();
    });

    // Atajo Ctrl+S para guardar artículo
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (this.currentSection === 'new-article') {
          e.preventDefault();
          this.saveArticle();
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

    // Tags input
    document.getElementById('tags-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addTag(e.target.value);
        e.target.value = '';
      }
    });

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

    // Word count update on input
    editor?.addEventListener('input', () => {
      this.updateWordCount();
      
      // Limpiar completamente el editor si está vacío para que el placeholder vuelva a aparecer
      const text = editor.innerText.trim();
      if (text === '' || text === '\n') {
        editor.innerHTML = '';
      }
    });

    // Actualizar estado del toolbar al cambiar selección
    editor?.addEventListener('mouseup', () => this.updateToolbarState());
    editor?.addEventListener('keyup', () => this.updateToolbarState());

    // Keyboard shortcuts
    editor?.addEventListener('keydown', (e) => {
      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
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
          
          // Crear indicador visual de posición
          const rect = target.getBoundingClientRect();
          const editorRect = editor.getBoundingClientRect();
          const dropX = e.clientX;
          const midX = rect.left + rect.width / 2;
          
          const indicator = document.createElement('div');
          indicator.className = 'drop-indicator';
          indicator.style.position = 'absolute';
          indicator.style.width = '4px';
          indicator.style.height = rect.height + 'px';
          indicator.style.top = (rect.top - editorRect.top + editor.scrollTop) + 'px';
          indicator.style.backgroundColor = '#00c8ff';
          indicator.style.borderRadius = '2px';
          indicator.style.zIndex = '1000';
          indicator.style.pointerEvents = 'none';
          
          if (dropX < midX) {
            indicator.style.left = (rect.left - editorRect.left - 4) + 'px';
            indicator.dataset.position = 'before';
          } else {
            indicator.style.left = (rect.right - editorRect.left) + 'px';
            indicator.dataset.position = 'after';
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
      // Click fuera - deseleccionar
      else {
        this.deselectEditorImages();
        this.deselectEditorGrids();
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
  }

  deleteSelectedGrid(grid) {
    grid.remove();
    this.showToast('Galería eliminada', 'success');
  }

  // ═══════════════════════════════════════════════════════════════
  // Manejar cuando se arrastra una imagen sobre otra
  // ═══════════════════════════════════════════════════════════════
  handleImageDropOnImage(draggedImg, targetImg, event) {
    const editor = document.getElementById('article-editor');
    
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
    
    // Calcular la posición (antes o después del target)
    const rect = targetImg.getBoundingClientRect();
    const dropX = event.clientX;
    const midX = rect.left + rect.width / 2;
    const insertBefore = dropX < midX;
    
    // CASO 1: Ambas imágenes están en el mismo grid - reordenar
    if (draggedParentGrid && targetParentGrid && draggedParentGrid === targetParentGrid) {
      if (insertBefore) {
        targetParentGrid.insertBefore(draggedElement, targetElement);
      } else {
        targetParentGrid.insertBefore(draggedElement, targetElement.nextSibling);
      }
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
      
      this.showToast('Imagen agregada a la galería', 'success');
      return;
    }
    
    // CASO 4: Ambas imágenes están fuera de grids - crear nuevo grid
    if (!draggedParentGrid && !targetParentGrid) {
      // Crear nuevo grid
      const grid = document.createElement('div');
      grid.className = 'image-grid-container cols-2 gap-md';
      
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
      
      // Encontrar el contenedor del target
      let targetContainer = targetElement;
      while (targetContainer.parentElement && targetContainer.parentElement !== editor) {
        targetContainer = targetContainer.parentElement;
      }
      
      // Insertar el grid
      targetContainer.parentElement.insertBefore(grid, targetContainer);
      
      // Eliminar las imágenes originales
      targetContainer.remove();
      
      let draggedContainer = draggedElement;
      while (draggedContainer.parentElement && draggedContainer.parentElement !== editor) {
        if (draggedContainer.parentElement.childNodes.length === 1) {
          draggedContainer = draggedContainer.parentElement;
        } else {
          break;
        }
      }
      draggedContainer.remove();
      
      this.showToast('Galería creada con 2 imágenes', 'success');
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
      
      this.showToast('Imagen movida entre galerías', 'success');
    }
  }

  // Helper para crear imagen limpia desde otra imagen
  createCleanImage(sourceImg) {
    const newImg = document.createElement('img');
    newImg.src = sourceImg.src;
    newImg.alt = sourceImg.alt || '';
    newImg.className = 'editor-image resizable';
    newImg.draggable = true;
    newImg.style.maxWidth = '100%';
    newImg.style.height = 'auto';
    return newImg;
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
    
    this.showToast('Imagen insertada', 'success');
  }

  selectEditorImage(img) {
    // Deseleccionar otras
    this.deselectEditorImages();
    this.deselectEditorGrids();
    
    // Marcar como seleccionada
    img.classList.add('selected');
    
    // Crear handles de redimensionamiento si no existen
    if (!img.parentElement.classList.contains('image-resize-wrapper')) {
      const wrapper = document.createElement('span');
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
      img.parentElement.classList.add('has-selected');
    }
  }

  deselectEditorImages() {
    const editor = document.getElementById('article-editor');
    editor?.querySelectorAll('img.selected').forEach(img => {
      img.classList.remove('selected');
      if (img.parentElement.classList.contains('image-resize-wrapper')) {
        img.parentElement.classList.remove('has-selected');
      }
    });
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
    editor.focus();

    switch (command) {
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
      case 'quote':
        document.execCommand('formatBlock', false, 'blockquote');
        break;
      case 'link':
        const url = prompt('URL del enlace:');
        if (url) {
          // Validar URL
          if (!/^https?:\/\//i.test(url)) {
            this.showToast('La URL debe comenzar con http:// o https://', 'warning');
            return;
          }
          document.execCommand('createLink', false, url);
        }
        break;
      case 'justifyLeft':
        document.execCommand('justifyLeft', false, null);
        break;
      case 'justifyCenter':
        document.execCommand('justifyCenter', false, null);
        break;
      case 'justifyRight':
        document.execCommand('justifyRight', false, null);
        break;
      case 'image':
        this.openImageModal();
        break;
      case 'image-grid':
        this.openGridModal();
        break;
      case 'hr':
        document.execCommand('insertHTML', false, '<hr>');
        break;
      case 'clear':
        document.execCommand('removeFormat', false, null);
        // También limpiar estilos inline
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const content = range.cloneContents();
          const text = content.textContent;
          range.deleteContents();
          range.insertNode(document.createTextNode(text));
        }
        this.showToast('Formato limpiado', 'success');
        break;
    }
    
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
      }
      
      btn.classList.toggle('active', isActive);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // IMAGE MODALS - Enhanced
  // ═══════════════════════════════════════════════════════════════

  openImageModal() {
    const modal = document.getElementById('image-modal');
    modal.classList.remove('hidden');
    
    // Reset form
    document.getElementById('modal-image-url').value = '';
    document.getElementById('modal-image-alt').value = '';
    document.getElementById('image-width').value = '';
    document.getElementById('image-height').value = '';
    document.getElementById('image-caption').checked = false;
    
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

  parseGridTextarea() {
    const textarea = document.getElementById('grid-images');
    if (!textarea) return;
    
    const urls = textarea.value.split('\n')
      .map(u => u.trim())
      .filter(u => u && (u.startsWith('http') || u.startsWith('data:')));
    
    this.gridImages = urls;
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

    // Close modals with ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
          modal.classList.add('hidden');
        });
      }
    });

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
    // Insert Image - Enhanced
    // ═══════════════════════════════════════════════════════════════
    document.getElementById('insert-image-btn')?.addEventListener('click', () => {
      let imageUrl = '';
      
      // Get image source
      if (this.currentImageSource === 'url') {
        imageUrl = document.getElementById('modal-image-url')?.value.trim();
      } else if (this.uploadedImageData) {
        imageUrl = this.uploadedImageData;
      }

      if (!imageUrl) {
        this.showToast('Selecciona o ingresa una imagen', 'error');
        return;
      }

      const alt = document.getElementById('modal-image-alt')?.value.trim() || '';
      const width = document.getElementById('image-width')?.value.trim();
      const height = document.getElementById('image-height')?.value.trim();
      const addCaption = document.getElementById('image-caption')?.checked;
      const alignment = document.querySelector('.align-btn.active')?.dataset.align || 'center';

      // Build style
      let style = '';
      if (width) style += `width: ${width}px; `;
      if (height) style += `height: ${height}px; `;

      // Build class based on alignment
      let wrapperClass = 'resizable-image';
      if (alignment === 'float-left') wrapperClass += ' float-left';
      else if (alignment === 'float-right') wrapperClass += ' float-right';
      else if (alignment === 'center') wrapperClass += ' align-center';

      // Generate HTML
      let html = '';
      if (addCaption && alt) {
        html = `<figure class="${wrapperClass}" style="${style}">
  <img src="${imageUrl}" alt="${alt}" style="max-width: 100%;">
  <figcaption>${alt}</figcaption>
</figure>`;
      } else {
        html = `<span class="${wrapperClass}" style="${style}">
  <img src="${imageUrl}" alt="${alt}" style="max-width: 100%;">
</span>`;
      }

      document.getElementById('article-editor').focus();
      document.execCommand('insertHTML', false, html);
      document.getElementById('image-modal').classList.add('hidden');
      
      // Setup resize handles on new image
      this.setupEditorImageHandlers();
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
</div>`;

      document.getElementById('article-editor').focus();
      document.execCommand('insertHTML', false, grid);
      document.getElementById('grid-modal').classList.add('hidden');
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

    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImageData = e.target.result;
      uploadedImg.src = e.target.result;
      dropZone.style.display = 'none';
      uploadPreview?.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  setupEditorImageHandlers() {
    const editor = document.getElementById('article-editor');
    if (!editor) return;

    // Make images selectable
    editor.querySelectorAll('.resizable-image, figure').forEach(wrapper => {
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        // Remove selection from others
        editor.querySelectorAll('.resizable-image.selected, figure.selected').forEach(w => {
          w.classList.remove('selected');
        });
        wrapper.classList.add('selected');
      });
    });

    // Deselect on editor click
    editor.addEventListener('click', (e) => {
      if (e.target === editor) {
        editor.querySelectorAll('.resizable-image.selected, figure.selected').forEach(w => {
          w.classList.remove('selected');
        });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  navigateTo(section) {
    // Verificar si hay cambios sin guardar al salir del editor
    if (this.currentSection === 'new-article' && section !== 'new-article') {
      const editor = document.getElementById('article-editor');
      const title = document.getElementById('article-title')?.value;
      const hasContent = editor && editor.innerHTML.trim() !== '' && editor.innerHTML !== '<br>';
      
      if ((title || hasContent) && !this.editingArticle) {
        if (!confirm('¿Tienes cambios sin guardar. ¿Estás seguro de que deseas salir?')) {
          return;
        }
      }
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

  async loadArticles() {
    try {
      const response = await fetch('/blog/data/articles.json?t=' + Date.now());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      this.articles = data.articles || [];
      this.categories = data.categories || [];
      
      this.updateDashboardStats();
      this.renderArticlesTable();
      this.renderRecentArticles();
    } catch (error) {
      console.error('Error loading articles:', error);
      this.showToast('Error al cargar artículos. Verifica tu conexión.', 'error');
      this.articles = [];
      this.categories = [];
    }
  }

  updateDashboardStats() {
    document.getElementById('stat-articles').textContent = this.articles.length;
    document.getElementById('stat-categories').textContent = this.categories.length;
    document.getElementById('stat-featured').textContent = 
      this.articles.filter(a => a.featured).length;
    document.getElementById('stat-trending').textContent = 
      this.articles.filter(a => a.trending).length;
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

  renderRecentArticles() {
    const container = document.getElementById('recent-articles-list');
    if (!container) return;

    const recent = this.articles.slice(0, 5);

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
          <span>${this.formatDate(article.publishDate)}</span>
        </div>
      </div>
    `).join('');
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
    const article = this.articles.find(a => a.id === id);
    if (!article) return;

    this.editingArticle = article;
    this.populateArticleForm(article);
    this.navigateTo('new-article');
    document.getElementById('section-title').textContent = 'Editar Artículo';
  }

  populateArticleForm(article) {
    document.getElementById('article-id').value = article.id;
    document.getElementById('article-title').value = article.title;
    document.getElementById('article-slug').value = article.slug;
    document.getElementById('article-excerpt').value = article.excerpt;
    document.getElementById('excerpt-count').textContent = article.excerpt.length;
    
    // Category
    const categoryRadio = document.querySelector(`input[name="category"][value="${article.category}"]`);
    if (categoryRadio) categoryRadio.checked = true;

    // Status
    document.getElementById('article-status').value = article.status || 'published';

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
      const response = await fetch(contentPath);
      const html = await response.text();
      
      // Extract content from article HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const content = doc.querySelector('.article-content');
      
      if (content) {
        document.getElementById('article-editor').innerHTML = content.innerHTML;
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

    document.getElementById('article-form')?.reset();
    document.getElementById('article-id').value = '';
    document.getElementById('article-slug').value = '';
    document.getElementById('excerpt-count').textContent = '0';
    document.getElementById('article-editor').innerHTML = '';
    
    // Reset image
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('upload-placeholder').classList.remove('hidden');
    document.getElementById('preview-img').src = '';
    document.getElementById('image-url').value = '';

    // Reset tags
    this.renderTags();

    // Reset date to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('article-date').value = now.toISOString().slice(0, 16);

    // Default category
    document.querySelector('input[name="category"][value="series"]').checked = true;
  }

  async saveArticle() {
    const form = document.getElementById('article-form');
    const btn = document.getElementById('btn-publish');
    
    // Gather form data
    const id = document.getElementById('article-id').value || this.generateId();
    const title = document.getElementById('article-title').value.trim();
    const slug = document.getElementById('article-slug').value.trim() || this.generateSlug(title);
    const excerpt = document.getElementById('article-excerpt').value.trim();
    const category = document.querySelector('input[name="category"]:checked').value;
    const status = document.getElementById('article-status').value;
    const publishDate = new Date(document.getElementById('article-date').value).toISOString();
    const featured = document.getElementById('article-featured').checked;
    const trending = document.getElementById('article-trending').checked;
    const readTime = document.getElementById('read-time').value;
    const image = document.getElementById('image-url').value || document.getElementById('preview-img').src;
    const content = document.getElementById('article-editor').innerHTML;

    // Validation
    if (!title) {
      this.showToast('El título es requerido', 'error');
      document.getElementById('article-title').focus();
      return;
    }
    if (!excerpt) {
      this.showToast('El extracto es requerido', 'error');
      document.getElementById('article-excerpt').focus();
      return;
    }
    if (!content || content.trim() === '' || content === '<br>') {
      this.showToast('El contenido del artículo es requerido', 'error');
      document.getElementById('article-editor').focus();
      return;
    }
    if (excerpt.length > CONFIG.MAX_EXCERPT_LENGTH) {
      this.showToast(`El extracto es demasiado largo (máx ${CONFIG.MAX_EXCERPT_LENGTH} caracteres)`, 'warning');
      return;
    }

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
      content: `/blog/articulos/${slug}.html`,
      image,
      category,
      categoryDisplay: categoryNames[category],
      tags: this.tags,
      author: 'Sala Geek',
      publishDate,
      modifiedDate: new Date().toISOString(),
      readTime,
      views: this.editingArticle?.views || 0,
      featured,
      trending,
      status
    };

    // Save
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Guardando...';

    try {
      const response = await fetch('/.netlify/functions/save-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.user.token.access_token}`
        },
        body: JSON.stringify({
          article: articleData,
          htmlContent: this.generateArticleHTML(articleData, content),
          isNew: !this.editingArticle
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar');
      }

      const result = await response.json();

      this.showToast('¡Artículo guardado exitosamente!', 'success');
      
      // Reload articles
      await this.loadArticles();
      
      // Navigate to articles list
      this.editingArticle = null;
      this.navigateTo('articles');

    } catch (error) {
      console.error('Error saving article:', error);
      this.showToast('Error al guardar el artículo. Intenta de nuevo.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        Guardar
      `;
    }
  }

  async deleteArticle(id) {
    const article = this.articles.find(a => a.id === id);
    if (!article) return;

    if (!confirm(`¿Estás seguro de eliminar "${article.title}"?`)) {
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/save-article', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.user.token.access_token}`
        },
        body: JSON.stringify({ id, slug: article.slug })
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      this.showToast('Artículo eliminado', 'success');
      await this.loadArticles();

    } catch (error) {
      console.error('Error deleting article:', error);
      this.showToast('Error al eliminar el artículo', 'error');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TAGS
  // ═══════════════════════════════════════════════════════════════

  addTag(tag) {
    tag = tag.trim().toLowerCase();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.renderTags();
    }
  }

  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    this.renderTags();
  }

  renderTags() {
    const container = document.getElementById('tags-list');
    if (!container) return;

    container.innerHTML = this.tags.map(tag => `
      <span class="tag-item">
        ${this.escapeHtml(tag)}
        <button type="button" onclick="admin.removeTag('${tag}')">&times;</button>
      </span>
    `).join('');
  }

  // ═══════════════════════════════════════════════════════════════
  // PREVIEW
  // ═══════════════════════════════════════════════════════════════

  showPreview() {
    const title = document.getElementById('article-title').value || 'Sin título';
    const excerpt = document.getElementById('article-excerpt').value || '';
    const content = document.getElementById('article-editor').innerHTML;
    const category = document.querySelector('input[name="category"]:checked')?.value || '';
    const image = document.getElementById('image-url').value || document.getElementById('preview-img')?.src;

    const previewHTML = this.generateArticlePreviewHTML(title, excerpt, content, category, image);
    
    const iframe = document.getElementById('preview-frame');
    iframe.srcdoc = previewHTML;
    
    document.getElementById('preview-modal').classList.remove('hidden');
    
    // Set default device to desktop
    this.setPreviewDevice('desktop');
  }

  generateArticlePreviewHTML(title, excerpt, content, category, image) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.escapeHtml(title)} | Sala Geek</title>
        <link rel="stylesheet" href="/src/css/normalize.css">
        <link rel="stylesheet" href="/src/css/style.min.css">
        <link rel="stylesheet" href="/src/css/blog.css">
        <style>
          body { padding: 2rem; background: var(--sg-bg-primary, #0a0a0f); }
          .article-full { max-width: 800px; margin: 0 auto; }
          .resizable-image, .resizable-image img { max-width: 100%; }
          .resizable-image.float-left { float: left; margin: 0 1rem 1rem 0; }
          .resizable-image.float-right { float: right; margin: 0 0 1rem 1rem; }
          .resizable-image.align-center { display: block; margin: 1rem auto; text-align: center; }
          .image-grid-container { display: grid; margin: 1rem 0; }
          .image-grid-container.cols-2 { grid-template-columns: repeat(2, 1fr); }
          .image-grid-container.cols-3 { grid-template-columns: repeat(3, 1fr); }
          .image-grid-container.cols-4 { grid-template-columns: repeat(4, 1fr); }
          .image-grid-container img { width: 100%; height: auto; object-fit: cover; border-radius: 0.375rem; }
          figcaption { text-align: center; font-size: 0.85rem; color: #888; margin-top: 0.5rem; font-style: italic; }
        </style>
      </head>
      <body class="article-page">
        <article class="article-full">
          <header class="article-header">
            <div class="article-meta-top">
              <span class="article-category category-${category}">${category}</span>
              <time>${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
            </div>
            <h1 class="article-title">${this.escapeHtml(title)}</h1>
            <p class="article-excerpt">${this.escapeHtml(excerpt)}</p>
          </header>
          ${image ? `<figure class="article-featured-image"><img src="${image}" alt=""></figure>` : ''}
          <div class="article-content">${content}</div>
        </article>
      </body>
      </html>
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // HTML GENERATION
  // ═══════════════════════════════════════════════════════════════

  generateArticleHTML(article, content) {
    const categoryIcons = {
      series: '<rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline>',
      peliculas: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>',
      gaming: '<rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="6.01" y2="12"/><line x1="10" y1="12" x2="18" y2="12"/>',
      anime: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
      tecnologia: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>'
    };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="google-adsense-account" content="ca-pub-3884162231581435" />
  
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3884162231581435" crossorigin="anonymous"></script>
  
  <title>${this.escapeHtml(article.title)} | Sala Geek</title>
  <meta name="description" content="${this.escapeHtml(article.excerpt)}" />
  <meta name="keywords" content="${article.tags.join(', ')}" />
  <meta name="author" content="Sala Geek" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="https://salageek.com/blog/articulos/${article.slug}.html" />
  
  <meta name="article:published_time" content="${article.publishDate}" />
  <meta name="article:modified_time" content="${article.modifiedDate}" />
  <meta name="article:section" content="${article.categoryDisplay}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${this.escapeHtml(article.title)}" />
  <meta property="og:description" content="${this.escapeHtml(article.excerpt)}" />
  <meta property="og:image" content="${article.image}" />
  <meta property="og:url" content="https://salageek.com/blog/articulos/${article.slug}.html" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${this.escapeHtml(article.title)}" />
  <meta name="twitter:description" content="${this.escapeHtml(article.excerpt)}" />
  <meta name="twitter:image" content="${article.image}" />

  <link rel="icon" href="/src/images/Icono_SG.ico" type="image/x-icon" />
  <link rel="apple-touch-icon" href="/src/images/SalaGeek_LOGO.webp" />
  <meta name="theme-color" content="#1a1f3a" />

  <link rel="stylesheet" href="/src/css/normalize.css" />
  <link rel="stylesheet" href="/src/css/style.min.css" />
  <link rel="stylesheet" href="/src/css/blog.css" />
  
  <script src="/src/js/blog-engine.js" defer></script>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">${categoryIcons[article.category]}</svg>
            ${article.categoryDisplay}
          </a>
        </li>
        <li aria-current="page">${this.escapeHtml(article.title.substring(0, 30))}...</li>
      </ol>
    </nav>

    <article class="article-full">
      <header class="article-header">
        <div class="article-meta-top">
          <a href="/blog/?categoria=${article.category}" class="article-category category-${article.category}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${categoryIcons[article.category]}</svg>
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
            <span id="view-count">${article.views}</span> vistas
          </span>
        </div>
      </header>

      <figure class="article-featured-image">
        <img 
          src="${article.image}" 
          alt="${this.escapeHtml(article.title)}"
          loading="eager"
          width="1200"
          height="630"
        />
      </figure>

      <div class="article-content">
        ${content}
      </div>

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
          <button class="share-btn share-twitter" onclick="window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent(document.title), '_blank')" aria-label="Compartir en Twitter">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </button>
          <button class="share-btn share-facebook" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank')" aria-label="Compartir en Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </button>
          <button class="share-btn share-whatsapp" onclick="window.open('https://wa.me/?text=' + encodeURIComponent(document.title + ' ' + window.location.href), '_blank')" aria-label="Compartir en WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </button>
          <button class="share-btn share-copy" onclick="navigator.clipboard.writeText(window.location.href).then(() => alert('¡Enlace copiado!'))" aria-label="Copiar enlace">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
      </aside>

      <section class="article-tags">
        <h4>Tags:</h4>
        <div class="tags-list">
          ${article.tags.map(tag => `<a href="/blog/?tag=${tag}" class="tag">${tag}</a>`).join('')}
        </div>
      </section>
    </article>

    <section class="related-articles">
      <h2>Artículos Relacionados</h2>
      <div class="related-grid" id="related-articles"></div>
    </section>
  </main>

  <div id="footer-container"></div>

  <script src="/src/js/script.min.js" defer></script>
  <script>
    // Load header and footer
    fetch('/src/pages/partials/header.html')
      .then(r => r.text())
      .then(html => document.getElementById('header-container').innerHTML = html);
    fetch('/src/pages/partials/footer.html')
      .then(r => r.text())
      .then(html => document.getElementById('footer-container').innerHTML = html);
  </script>
</body>
</html>`;
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  updateWordCount() {
    const editor = document.getElementById('article-editor');
    const countEl = document.getElementById('word-count');
    if (!editor || !countEl) return;
    
    const text = editor.innerText || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    countEl.textContent = words.length;
  }

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

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

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
}

// Initialize admin
const admin = new SalaGeekAdmin();
