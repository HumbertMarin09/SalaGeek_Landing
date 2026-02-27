/**
 * BLOG ENGINE - Sistema de carga dinámica de artículos
 * Gestiona carga, filtrado, búsqueda y renderizado de artículos del blog
 */

class BlogEngine {
  constructor() {
    this.articles = [];
    this.categories = [];
    this.filteredArticles = [];
    this.currentFilter = "all";
    this.currentSort = "newest";
    this.searchQuery = "";
    this.articlesPerPage = 6;
    this.currentPage = 1;
  }

  /**
   * Inicializa el blog cargando los datos
   */
  async init() {
    try {
      const response = await fetch("/blog/data/articles.json");
      if (!response.ok) {
        throw new Error(`Error cargando artículos: ${response.status}`);
      }
      const data = await response.json();

      // Validar estructura de datos
      if (!data?.articles || !Array.isArray(data.articles)) {
        throw new Error("Formato de datos inválido en articles.json");
      }

      this.articles = data.articles;
      this.categories = data.categories || {};
      this.filteredArticles = [...this.articles];
      return true;
    } catch (error) {
      console.error("❌ Error cargando artículos:", error);
      return false;
    }
  }

  /**
   * Filtra artículos por categoría
   */
  filterByCategory(category) {
    this.currentFilter = category;
    this.currentPage = 1;

    if (category === "all") {
      this.filteredArticles = [...this.articles];
    } else {
      this.filteredArticles = this.articles.filter((article) => article.category === category);
    }

    this.applySearch();
    this.sortArticles();
  }

  /**
   * Busca artículos por texto
   */
  search(query) {
    this.searchQuery = query.toLowerCase();
    this.currentPage = 1;
    this.applySearch();
    this.sortArticles();
  }

  /**
   * Aplica búsqueda sobre artículos filtrados
   */
  applySearch() {
    if (!this.searchQuery) {
      this.filteredArticles =
        this.currentFilter === "all"
          ? [...this.articles]
          : this.articles.filter((a) => a.category === this.currentFilter);
      return;
    }

    const baseArticles =
      this.currentFilter === "all"
        ? this.articles
        : this.articles.filter((a) => a.category === this.currentFilter);

    this.filteredArticles = baseArticles.filter((article) => {
      return (
        article.title.toLowerCase().includes(this.searchQuery) ||
        article.excerpt.toLowerCase().includes(this.searchQuery) ||
        article.tags.some((tag) => tag.toLowerCase().includes(this.searchQuery))
      );
    });
  }

  /**
   * Ordena artículos
   */
  sortArticles() {
    switch (this.currentSort) {
      case "newest":
        this.filteredArticles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        break;
      case "oldest":
        this.filteredArticles.sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate));
        break;
      case "popular":
        this.filteredArticles.sort((a, b) => b.views - a.views);
        break;
    }
  }

  /**
   * Cambia el orden
   */
  changeSort(sortType) {
    this.currentSort = sortType;
    this.sortArticles();
  }

  /**
   * Obtiene artículos para la página actual
   */
  getArticlesForCurrentPage() {
    const start = (this.currentPage - 1) * this.articlesPerPage;
    const end = start + this.articlesPerPage;
    return this.filteredArticles.slice(start, end);
  }

  /**
   * Calcula total de páginas
   */
  getTotalPages() {
    return Math.ceil(this.filteredArticles.length / this.articlesPerPage);
  }

  /**
   * Cambia de página
   */
  goToPage(page) {
    const totalPages = this.getTotalPages();
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      return true;
    }
    return false;
  }

  /**
   * Obtiene artículos destacados (featured)
   */
  getFeaturedArticles(limit = 3) {
    return this.articles.filter((a) => a.featured).slice(0, limit);
  }

  /**
   * Obtiene artículos trending
   */
  getTrendingArticles(limit = 6) {
    return this.articles.filter((a) => a.trending).slice(0, limit);
  }

  /**
   * Obtiene artículos relacionados (misma categoría, excluyendo el actual)
   */
  getRelatedArticles(currentArticleId, limit = 3) {
    const currentArticle = this.articles.find((a) => a.id === currentArticleId);
    if (!currentArticle) return [];

    return this.articles
      .filter((a) => a.category === currentArticle.category && a.id !== currentArticleId)
      .slice(0, limit);
  }

  /**
   * Formatea fecha para mostrar
   */
  formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = date.getDate();
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  /**
   * Genera HTML de card de artículo
   */
  generateArticleCard(article) {
    const categoryIcon = this.getCategoryIcon(article.category);
    const formattedDate = this.formatDate(article.publishDate);

    return `
      <article class="article-card" data-category="${article.category}" data-date="${article.publishDate}">
        <a href="${article.content}" class="article-link">
          <div class="article-image">
            <img src="${article.image}" alt="${article.title}" loading="lazy" />
            <span class="article-category">${article.categoryDisplay}</span>
          </div>
          <div class="article-content">
            <h3 class="article-title">${article.title}</h3>
            <p class="article-excerpt">${article.excerpt}</p>
            <div class="article-meta">
              <span class="meta-date">${formattedDate}</span>
              <span class="meta-reading">${article.readTime}</span>
            </div>
          </div>
        </a>
      </article>
    `;
  }

  /**
   * Obtiene icono SVG de categoría
   */
  getCategoryIcon(category) {
    const icons = {
      series: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
        <polyline points="17 2 12 7 7 2"></polyline>
      </svg>`,
      peliculas: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
        <line x1="7" y1="2" x2="7" y2="22"></line>
        <line x1="17" y1="2" x2="17" y2="22"></line>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <line x1="2" y1="7" x2="7" y2="7"></line>
        <line x1="2" y1="17" x2="7" y2="17"></line>
        <line x1="17" y1="17" x2="22" y2="17"></line>
        <line x1="17" y1="7" x2="22" y2="7"></line>
      </svg>`,
      gaming: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="6" y1="12" x2="10" y2="12"></line>
        <line x1="8" y1="10" x2="8" y2="14"></line>
        <line x1="15" y1="13" x2="15.01" y2="13"></line>
        <line x1="18" y1="11" x2="18.01" y2="11"></line>
        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
      </svg>`,
      anime: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>`,
      tecnologia: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>`,
    };
    return icons[category] || "";
  }

  /**
   * Renderiza la grilla de artículos con animaciones
   */
  renderArticles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Marcar como inicializado para que CSS permita mostrar todos los artículos
    container.classList.add("js-initialized");

    const articles = this.getArticlesForCurrentPage();

    if (articles.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>No se encontraron artículos</h3>
          <p>Intenta con otra búsqueda o categoría</p>
        </div>
      `;
      return;
    }

    // Fade out actual content
    const existingCards = container.querySelectorAll(".article-card");
    existingCards.forEach((card) => card.classList.add("filtering-out"));

    // Pequeño delay para permitir animación de salida
    setTimeout(
      () => {
        container.innerHTML = articles.map((article) => this.generateArticleCard(article)).join("");

        // Aplicar animación de entrada con stagger
        const newCards = container.querySelectorAll(".article-card");
        newCards.forEach((card, index) => {
          card.style.opacity = "0";
          card.style.transform = "translateY(20px)";

          setTimeout(() => {
            card.classList.add("fade-in");
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, index * 50);
        });
      },
      existingCards.length > 0 ? 200 : 0
    );
  }

  /**
   * Renderiza la paginación
   */
  renderPagination(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPages = this.getTotalPages();
    if (totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    let html = '<div class="pagination">';

    // Botón anterior
    if (this.currentPage > 1) {
      html += `<button class="pagination-btn pagination-prev" data-page="${this.currentPage - 1}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Anterior
      </button>`;
    }

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        html += `<button class="pagination-btn ${i === this.currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        html += '<span class="pagination-dots">...</span>';
      }
    }

    // Botón siguiente
    if (this.currentPage < totalPages) {
      html += `<button class="pagination-btn pagination-next" data-page="${this.currentPage + 1}">
        Siguiente
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>`;
    }

    html += "</div>";
    container.innerHTML = html;
  }
}

// Exportar para uso global
window.BlogEngine = BlogEngine;

// ── Related Articles Carousel (mobile auto-play) ──
function initRelatedCarousel(container, cardCount) {
  if (cardCount < 2) return;
  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;
  if (!isMobile()) {
    window.addEventListener(
      "resize",
      () => {
        if (isMobile()) initRelatedCarousel(container, cardCount);
      },
      { once: true }
    );
    return;
  }
  const section = container.closest(".related-articles");
  if (!section || section.querySelector(".related-carousel-dots")) return;

  const dotsWrap = document.createElement("div");
  dotsWrap.className = "related-carousel-dots";
  for (let i = 0; i < cardCount; i++) {
    const dot = document.createElement("button");
    dot.className = "related-carousel-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Ir a articulo " + (i + 1));
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  }
  section.appendChild(dotsWrap);

  let cur = 0,
    timer = null;
  const cards = container.querySelectorAll(".related-card");
  const dots = dotsWrap.querySelectorAll(".related-carousel-dot");

  function goTo(i) {
    cur = i;
    const cardWidth = container.offsetWidth;
    container.scrollTo({ left: i * cardWidth, behavior: "smooth" });
    dots.forEach((d, j) => d.classList.toggle("active", j === i));
  }
  function next() {
    goTo((cur + 1) % cardCount);
  }
  function play() {
    stop();
    timer = setInterval(next, 4000);
  }
  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  let st;
  let isAutoScrolling = false;
  const origGoTo = goTo;
  goTo = function (i) {
    isAutoScrolling = true;
    origGoTo(i);
    // Reset flag after scroll animation settles
    setTimeout(() => { isAutoScrolling = false; }, 600);
  };

  container.addEventListener(
    "scroll",
    () => {
      if (isAutoScrolling) return;
      clearTimeout(st);
      st = setTimeout(() => {
        const idx = Math.round(container.scrollLeft / container.offsetWidth);
        if (idx !== cur && idx >= 0 && idx < cardCount) {
          cur = idx;
          dots.forEach((d, j) => d.classList.toggle("active", j === cur));
          // Reset timer so next auto-advance waits full 4s
          if (timer) { stop(); setTimeout(play, 4000); }
        }
      }, 100);
    },
    { passive: true }
  );
  container.addEventListener("touchstart", stop, { passive: true });
  container.addEventListener("touchend", () => setTimeout(play, 3000), { passive: true });
  container.addEventListener("mouseenter", stop);
  container.addEventListener("mouseleave", () => setTimeout(play, 2000));
  play();
  new IntersectionObserver(
    (e) => {
      e[0].isIntersecting ? play() : stop();
    },
    { threshold: 0.3 }
  ).observe(section);
}
window.initRelatedCarousel = initRelatedCarousel;

// Auto-detectar e inicializar carousel cuando se cargan artículos relacionados
(function autoInitCarousel() {
  const grid = document.getElementById("related-articles");
  if (!grid) return;

  const observer = new MutationObserver(() => {
    const cards = grid.querySelectorAll(".related-card");
    if (cards.length > 0) {
      observer.disconnect();
      initRelatedCarousel(grid, cards.length);
    }
  });
  observer.observe(grid, { childList: true });

  // Fallback: si ya están cargados al momento de ejecutar
  const existing = grid.querySelectorAll(".related-card");
  if (existing.length > 0) {
    observer.disconnect();
    initRelatedCarousel(grid, existing.length);
  }
})();
