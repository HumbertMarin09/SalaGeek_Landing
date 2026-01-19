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

    // Title to slug
    document.getElementById('article-title')?.addEventListener('input', (e) => {
      const slug = this.generateSlug(e.target.value);
      document.getElementById('article-slug').value = slug;
    });

    // Excerpt character count
    document.getElementById('article-excerpt')?.addEventListener('input', (e) => {
      document.getElementById('excerpt-count').textContent = e.target.value.length;
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

    document.getElementById('filter-status')?.addEventListener('change', () => {
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
      if (e.target.value) {
        previewImg.src = e.target.value;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
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

    // Keyboard shortcuts
    editor?.addEventListener('keydown', (e) => {
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
        }
      }
    });
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
      case 'h2':
        document.execCommand('formatBlock', false, 'h2');
        break;
      case 'h3':
        document.execCommand('formatBlock', false, 'h3');
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
          document.execCommand('createLink', false, url);
        }
        break;
      case 'image':
        const imgUrl = prompt('URL de la imagen:');
        if (imgUrl) {
          document.execCommand('insertImage', false, imgUrl);
        }
        break;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  navigateTo(section) {
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
      const response = await fetch('/blog/data/articles.json');
      const data = await response.json();
      this.articles = data.articles || [];
      this.categories = data.categories || [];
      
      this.updateDashboardStats();
      this.renderArticlesTable();
      this.renderRecentArticles();
    } catch (error) {
      console.error('Error loading articles:', error);
      this.showToast('Error al cargar artículos', 'error');
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
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay artículos</td></tr>';
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
          <span class="status-badge status-${article.status || 'published'}">
            ${article.status === 'draft' ? 'Borrador' : 'Publicado'}
          </span>
        </td>
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
    const status = document.getElementById('filter-status')?.value || 'all';

    const filtered = this.articles.filter(article => {
      const matchesQuery = !query || 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.slug.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = category === 'all' || article.category === category;
      const matchesStatus = status === 'all' || 
        (status === 'published' && article.status !== 'draft') ||
        (status === 'draft' && article.status === 'draft');

      return matchesQuery && matchesCategory && matchesStatus;
    });

    const tbody = document.getElementById('articles-table-body');
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No se encontraron artículos</td></tr>';
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

    document.getElementById('article-form')?.reset();
    document.getElementById('article-id').value = '';
    document.getElementById('article-slug').value = '';
    document.getElementById('excerpt-count').textContent = '0';
    document.getElementById('article-editor').innerHTML = '<p>Escribe tu artículo aquí...</p>';
    
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
    if (!title || !excerpt || !content) {
      this.showToast('Por favor completa todos los campos requeridos', 'error');
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
    const category = document.querySelector('input[name="category"]:checked').value;
    const image = document.getElementById('image-url').value || document.getElementById('preview-img').src;

    const previewHTML = this.generatePreviewHTML(title, excerpt, content, category, image);
    
    const iframe = document.getElementById('preview-iframe');
    iframe.srcdoc = previewHTML;
    
    document.getElementById('preview-modal').classList.remove('hidden');
  }

  generatePreviewHTML(title, excerpt, content, category, image) {
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
          body { padding: 2rem; }
          .article-full { max-width: 800px; margin: 0 auto; }
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

  generateSlug(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
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

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
}

// Initialize admin
const admin = new SalaGeekAdmin();
