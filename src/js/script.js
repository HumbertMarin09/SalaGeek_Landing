/* ============================================
   SALA GEEK - MAIN JAVASCRIPT
   Version: 1.75.0 (Performance Boost + Cleanup Final)
   Last Modified: 2025-11-06
   
   📋 ARQUITECTURA DEL PROYECTO:
   
   1. UTILIDADES GLOBALES
      - Estado responsivo
      - Helpers de tema
      - Handlers de resize
   
   2. CARGA DE COMPONENTES
      - Partials (header/footer)
      - Lazy loading
   
   3. NAVEGACIÓN
      - Menú móvil/desktop
      - Scroll activo
      - Accesibilidad
   
   4. ANIMACIONES & EFECTOS
      - Typewriter
      - Parallax
      - Glitch effects
      - Scroll reveals
   
   5. FORMULARIOS
      - Newsletter
      - Validaciones
   
   6. SISTEMA DE EASTER EGGS
      - Achievement Tracker
      - 9 Easter Eggs (6 móvil + 3 desktop)
      - Sistema de niveles dinámico
      - Persistencia en localStorage
   
   7. SISTEMA DE AUDIO
      - Sound manager
      - Preload de sonidos
   
   ✅ FUNCIONALIDADES: 100% Operativas
   🎯 OPTIMIZACIÓN: Código reorganizado y documentado
   
   ============================================ */

/* ============================================
   SECCIÓN 1: UTILIDADES GLOBALES
   ============================================ */

/**
 * Estado responsivo global de la aplicación
 * Se actualiza automáticamente con los eventos de resize
 * @constant {Object}
 */
const responsiveState = {
  isMobile: window.innerWidth <= 768,
  isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
  isDesktop: window.innerWidth > 1024,
};

// ═══════════════════════════════════════════════════════════════
// 🎨 FIRMA DE DESARROLLADORES - Console Signature
// ═══════════════════════════════════════════════════════════════
(function showDeveloperSignature() {
  // Esperar a que la página cargue para mostrar la firma
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", displaySignature);
  } else {
    displaySignature();
  }

  function displaySignature() {
    // Estilos para la firma
    const titleStyle =
      "font-size: 20px; font-weight: bold; color: #ffd166; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);";
    const lineStyle = "color: #ffd166;";
    const infoStyle = "font-size: 13px; color: #4ecdc4;";
    const highlightStyle = "font-size: 13px; color: #06ffa5; font-weight: bold;";
    const subtleStyle = "font-size: 12px; color: #a8dadc;";

    console.log("%c🎮 SALA GEEK", titleStyle);
    console.log("%c════════════════════════════════════════", lineStyle);
    console.log("%c ", "");
    console.log("%c👨‍💻 Desarrollado por:", infoStyle);
    console.log("%c   Humberto Marin - Fundador & Lead Developer", highlightStyle);
    console.log("%c   GitHub Copilot - AI Assistant & Code Architect", highlightStyle);
    console.log("%c ", "");
    console.log("%c📦 Versión: 2.0.0 | Noviembre 2025", subtleStyle);
    console.log("%c⚡ Stack: Vanilla JS + CSS3 + HTML5", subtleStyle);
    console.log("%c🎯 Easter Eggs: 15 ocultos (9 Desktop + 6 Mobile)", subtleStyle);
    console.log("%c ", "");
    console.log("%c💡 ¿Eres desarrollador?", infoStyle);
    console.log("%c   Presiona Ctrl+Shift+G para desbloquear el Developer Console", highlightStyle);
    console.log("%c ", "");
    console.log("%c════════════════════════════════════════", lineStyle);
    console.log(
      "%cHecho con 💙 por geeks, para geeks",
      "font-size: 12px; color: #ff6b6b; font-style: italic;"
    );
    console.log("%c ", "");
  }
})();

/**
 * Inicializa el tema oscuro permanente
 * Fuerza el modo oscuro y elimina cualquier preferencia previa de tema claro
 */
function initDarkMode() {
  document.documentElement.setAttribute("data-theme", "dark");
  localStorage.removeItem("sg_theme");
}

/**
 * Actualiza el estado responsivo global
 * Se llama automáticamente en resize events
 */
function updateResponsiveState() {
  responsiveState.isMobile = window.innerWidth <= 768;
  responsiveState.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
  responsiveState.isDesktop = window.innerWidth > 1024;
}

/* ============================================
   PAGE TRANSITIONS - Transiciones entre páginas
   ============================================ */

/**
 * Sistema de transiciones suaves entre páginas
 * Usa View Transitions API si está disponible, con fallback CSS
 */
const PageTransitions = {
  supportsViewTransitions: 'startViewTransition' in document,
  
  init() {
    // Fade-in al cargar la página
    this.fadeInOnLoad();
    
    // Interceptar clicks en enlaces internos
    this.interceptLinks();
  },
  
  fadeInOnLoad() {
    // Solo aplicar si no hay View Transitions nativas
    if (this.supportsViewTransitions) return;
    
    document.body.classList.add('page-entering');
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.remove('page-entering');
        document.body.classList.add('page-entered');
        
        // Limpiar clase después de la transición
        setTimeout(() => {
          document.body.classList.remove('page-entered');
        }, 350);
      });
    });
  },
  
  interceptLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      
      // Ignorar si no es un enlace válido
      if (!link) return;
      
      const href = link.getAttribute('href');
      
      // Ignorar enlaces externos, anclas, javascript:, mailto:, tel:
      if (!href || 
          href.startsWith('#') || 
          href.startsWith('javascript:') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:') ||
          link.target === '_blank' ||
          link.hasAttribute('download') ||
          href.startsWith('http') && !href.includes(window.location.hostname)) {
        return;
      }
      
      // Si el navegador soporta View Transitions, dejar que funcione nativamente
      if (this.supportsViewTransitions) return;
      
      // Fallback: transición manual
      e.preventDefault();
      this.navigateTo(href);
    });
  },
  
  navigateTo(url) {
    // Aplicar fade-out
    document.body.classList.add('page-transitioning');
    
    // Navegar después de la animación de salida
    setTimeout(() => {
      window.location.href = url;
    }, 250);
  }
};

// Inicializar transiciones de página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PageTransitions.init());
} else {
  PageTransitions.init();
}

/**
 * Inicializa el manejador de resize con debounce
 * Cierra elementos del UI que no deberían estar abiertos al cambiar de móvil a desktop
 */
function initResponsiveHandler() {
  let resizeTimer;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      updateResponsiveState();

      // Auto-cerrar elementos móviles al cambiar a desktop
      if (responsiveState.isDesktop) {
        const nav = document.querySelector(".main-nav");
        const toggle = document.querySelector(".nav-toggle");
        const searchDropdown = document.querySelector(".search-dropdown");

        if (nav?.classList.contains("open")) {
          nav.classList.remove("open");
          toggle?.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        }

        if (searchDropdown?.classList.contains("active")) {
          searchDropdown.classList.remove("active");
        }
      }
    }, 150); // Debounce de 150ms
  });
}

/* ============================================
   SECCIÓN 1.5: SISTEMA DE LOGO ESTACIONAL
   ============================================ */

/**
 * Sistema de logo estacional que cambia automáticamente según la fecha
 * Logo navideño: Activo desde el 1 de diciembre hasta el 10 de enero
 * Logo normal: Resto del año
 */
function initSeasonalLogo() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0-11 (0 = Enero, 11 = Diciembre)
  const currentDay = currentDate.getDate();

  // Determinar si estamos en temporada navideña
  // Diciembre (mes 11) o Enero 1-10 (mes 0, días 1-10)
  const isChristmasSeason = currentMonth === 11 || (currentMonth === 0 && currentDay <= 10);

  // Usar solo .ico que es el que existe
  const seasonalCandidates = isChristmasSeason
    ? ["/src/images/Icono_SG_Navidad.ico", "/src/images/Icono_SG.ico"]
    : ["/src/images/Icono_SG.ico"];

  chooseAvailableLogo(seasonalCandidates).then((logoPath) => {
    updateLogoSource(logoPath);
    updateFooterLogo(seasonalCandidates);
    updateSeasonalFavicon(isChristmasSeason);
  });
}

/**
 * Elige la primera ruta de imagen disponible (onload) haciendo fallback por orden
 * @param {string[]} candidates
 * @returns {Promise<string>} Ruta elegida
 */
function chooseAvailableLogo(candidates) {
  return new Promise((resolve) => {
    let resolved = false;

    const tryLoad = (index) => {
      if (index >= candidates.length) {
        // Último fallback: logo normal ICO
        resolve("/src/images/Icono_SG.ico");
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (!resolved) {
          resolved = true;
          resolve(candidates[index]);
        }
      };
      img.onerror = () => tryLoad(index + 1);
      img.src = candidates[index] + `?v=${Date.now()}`; // evitar cache
    };

    tryLoad(0);
  });
}

/**
 * Actualiza la fuente del logo en el header
 * @param {string} logoPath - Ruta del logo a mostrar
 */
function updateLogoSource(logoPath) {
  // Intentar actualizar inmediatamente si el logo ya está en el DOM
  const logoImg = document.querySelector(".logo img");
  if (logoImg) {
    logoImg.src = logoPath;
  }

  // También observar cambios en el DOM por si el header se carga después
  const observer = new MutationObserver((mutations, obs) => {
    const logo = document.querySelector(".logo img");
    if (logo) {
      logo.src = logoPath;
      obs.disconnect(); // Dejar de observar una vez actualizado
    }
  });

  // Observar cambios en el body
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Timeout de seguridad para desconectar el observer después de 5 segundos
  setTimeout(() => observer.disconnect(), 5000);
}

/**
 * Actualiza el logo del footer si existe
 * @param {string[]} candidates - posibles rutas (PNG/ICO)
 */
function updateFooterLogo(candidates) {
  chooseAvailableLogo(candidates).then((logoPath) => {
    const applyFooterLogo = () => {
      const footerImg = document.querySelector(".footer-logo");
      const footerSource = document.querySelector(".footer-brand picture source");
      if (footerImg) {
        // Actualizar <img>
        footerImg.src = logoPath;
        // Si existe <source> dentro de <picture>, también actualizar su srcset
        if (footerSource) {
          footerSource.srcset = logoPath;
          footerSource.type = "image/png";
        }
        return true;
      }
      return false;
    };

    // Intento inmediato
    if (applyFooterLogo()) return;

    // Observar hasta que el footer se inyecte
    const observer = new MutationObserver((mutations, obs) => {
      if (applyFooterLogo()) {
        obs.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => observer.disconnect(), 5000);
  });
}

/**
 * Actualiza favicon y apple-touch-icon según temporada
 * @param {boolean} isChristmasSeason
 */
function updateSeasonalFavicon(isChristmasSeason) {
  const christmasIco = "/src/images/Icono_SG_Navidad.ico";
  const normalIco = "/src/images/Icono_SG.ico";

  const targetIco = isChristmasSeason ? christmasIco : normalIco;

  // Eliminar existentes para evitar cache duro del navegador y recrear
  const head = document.head;
  const existing = document.querySelectorAll(
    "link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']"
  );
  existing.forEach((el) => el.parentNode.removeChild(el));

  const ts = `?v=${Date.now()}`;

  // Favicon ICO
  const fav = document.createElement("link");
  fav.setAttribute("rel", "icon");
  fav.setAttribute("type", "image/x-icon");
  fav.setAttribute("href", targetIco + ts);
  head.appendChild(fav);

  // Shortcut icon (compatibilidad)
  const shFav = document.createElement("link");
  shFav.setAttribute("rel", "shortcut icon");
  shFav.setAttribute("type", "image/x-icon");
  shFav.setAttribute("href", targetIco + ts);
  head.appendChild(shFav);

  // Apple touch icon (usar ICO también)
  const apple = document.createElement("link");
  apple.setAttribute("rel", "apple-touch-icon");
  apple.setAttribute("sizes", "180x180");
  apple.setAttribute("href", targetIco + ts);
  head.appendChild(apple);
}

/* ============================================
   SECCIÓN 2: CARGA DE COMPONENTES DINÁMICOS
   ============================================ */

/**
 * Carga un partial HTML usando caché del navegador
 * @param {string} selector - Selector CSS donde inyectar el contenido
 * @param {string} path - Ruta relativa al archivo HTML
 * @returns {Promise<boolean>} True si la carga fue exitosa
 */
async function loadPartial(selector, path) {
  try {
    const response = await fetch(path, {
      cache: "force-cache", // Usar caché del navegador
      headers: {
        "Cache-Control": "public, max-age=3600", // 1 hora
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const element = document.querySelector(selector);

    if (!element) {
      throw new Error(`Element "${selector}" not found in DOM`);
    }

    element.innerHTML = html;
    return true;
  } catch (error) {
    console.error(`❌ Error loading partial ${path}:`, error);
    return false;
  }
}

/**
 * Carga header y footer de forma paralela
 * Inicializa la navegación una vez cargados
 * Soporta múltiples selectores para compatibilidad
 */
async function loadIncludes() {
  try {
    // Selectores compatibles (blog usa header-container, resto usa header-placeholder)
    const headerSelector = document.querySelector("#header-placeholder") 
      ? "#header-placeholder" 
      : "#header-container";
    const footerSelector = document.querySelector("#footer-placeholder") 
      ? "#footer-placeholder" 
      : "#footer-container";
    
    // Carga paralela para mejor performance (sin cache busters innecesarios)
    await Promise.all([
      loadPartial(headerSelector, "/src/pages/partials/header.html"),
      loadPartial(footerSelector, "/src/pages/partials/footer.html"),
    ]);

    // Actualizar año dinámicamente en el footer
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }

    // NOTA: El fix de z-index ahora se maneja puramente con CSS
    // El CSS de article-page solo aplica position:fixed en móvil (≤1024px)
    // ya no es necesario mover elementos al body con JavaScript

    // Inicializar navegación y búsqueda después de que el header esté cargado
    initNavigation();
    
    // Pequeño delay para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
      initSearch();
    }, 100);
  } catch (error) {
    console.error("❌ Error loading includes:", error);
  }
}

/* ============================================
   SECCIÓN 3: SISTEMA DE NAVEGACIÓN
   ============================================ */

/**
 * Inicializa el sistema de navegación completo
 * - Toggle del menú móvil con accesibilidad
 * - Smooth scroll a secciones
 * - Highlight de enlaces activos según scroll
 * - Cierre automático del menú en desktop
 */
function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  const menuLinks = document.querySelectorAll(".menu a");

  if (!toggle || !nav) {
    // Navigation elements not found - silent return
    return;
  }

  // Toggle del menú móvil con mejoras de accesibilidad
  const toggleMenu = () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen.toString());

    // Prevenir scroll del body cuando el menú está abierto
    document.body.style.overflow = isOpen ? "hidden" : "";
    
    // Clase para overlay CSS
    document.body.classList.toggle("menu-open", isOpen);

    // Gestión de foco para accesibilidad
    if (isOpen) {
      const firstLink = nav.querySelector("a");
      firstLink?.focus();
    }
  };

  toggle.addEventListener("click", toggleMenu);

  // Botón de cerrar en móvil
  const closeBtn = document.querySelector(".nav-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");
    });
  }

  // Cerrar menú al hacer clic en un enlace
  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Si es un enlace de ancla interno
      if (link.getAttribute("href")?.startsWith("#")) {
        e.preventDefault();

        const targetId = link.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          // Cerrar menú móvil
          if (responsiveState.isMobile) {
            nav.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
            document.body.classList.remove("menu-open");
          }

          // Scroll suave al elemento
          const headerOffset = 100; // Altura del header sticky
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });

          // El scroll automático activará highlightActiveSection después
        }
      }
    });
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");
    }
  });

  // Marcar enlace activo según scroll
  const sections = document.querySelectorAll("section[id]");

  if (sections.length > 0) {
    function updateActiveLink() {
      const scrollPosition = window.scrollY + 150; // Offset del header

      let currentSection = "";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = section.id;
        }
      });

      // Actualizar enlaces activos
      menuLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentSection}`) {
          link.classList.add("active");
        }
      });
    }

    // Usar throttle con requestAnimationFrame para mejor rendimiento
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateActiveLink();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );

    // Llamar al cargar la página
    updateActiveLink();
  }

  // Cerrar menú con tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      toggleMenu();
      toggle.focus();
    }
  });
}

/* ============================================
   SISTEMA DE BÚSQUEDA - Simplificado
   ============================================ */

function initSearch() {
  // Esperar a que el DOM esté listo
  const init = () => {
    const searchToggle = document.querySelector(".search-toggle");
    const modal = document.getElementById("searchModal");
    const backdrop = document.getElementById("searchBackdrop");
    const closeBtn = document.getElementById("searchClose");
    const input = document.getElementById("searchInput");
    const clearBtn = document.getElementById("searchClear");
    const resultsContainer = document.getElementById("searchResults");

    // Si no existen los elementos, reintentar
    if (!searchToggle || !modal || !input) {
      setTimeout(init, 150);
      return;
    }

    console.log("✅ Búsqueda inicializada");

    // ═══════════════════════════════════════════════════════════
    // 🔄 CARGA DINÁMICA DE ARTÍCULOS DESDE articles.json
    // ═══════════════════════════════════════════════════════════
    let articles = [];
    
    // Cargar artículos dinámicamente
    const loadArticles = async () => {
      try {
        const response = await fetch("/blog/data/articles.json");
        const data = await response.json();
        articles = data.articles.map(article => ({
          title: article.title,
          url: article.content,
          category: article.categoryDisplay,
          excerpt: article.excerpt,
          tags: article.tags || []
        }));
        console.log(`✅ Búsqueda: ${articles.length} artículos cargados`);
      } catch (error) {
        console.error("❌ Error cargando artículos para búsqueda:", error);
        articles = [];
      }
    };
    
    // Cargar artículos al iniciar
    loadArticles();

    // Abrir modal
    const openModal = () => {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      setTimeout(() => input.focus(), 100);
    };

    // Cerrar modal
    const closeModal = () => {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      input.value = "";
      clearBtn.classList.remove("visible");
      resultsContainer.innerHTML = "";
    };

    // Buscar artículos
    const search = (query) => {
      const q = query.toLowerCase().trim();
      if (!q) {
        resultsContainer.innerHTML = "";
        return;
      }

      const results = articles.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.category.toLowerCase().includes(q) ||
        (a.tags && a.tags.some(tag => tag.toLowerCase().includes(q))) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q))
      );

      if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="search-no-results">No se encontraron resultados</p>';
        return;
      }

      resultsContainer.innerHTML = results.map(r => `
        <a href="${r.url}" class="search-result-item">
          <div class="search-result-title">${r.title}</div>
          <div class="search-result-category">${r.category}</div>
        </a>
      `).join("");
    };

    // Event: Abrir
    searchToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal();
    });

    // Event: Cerrar con botón X
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeModal();
      });
    }

    // Event: Cerrar con backdrop (solo si el clic fue directamente en el backdrop)
    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          closeModal();
        }
      });
    }

    // Event: Cerrar al hacer clic en el modal padre (fuera del contenido)
    modal.addEventListener("click", (e) => {
      // Solo cerrar si el clic fue directamente en el modal (no en sus hijos)
      if (e.target === modal) {
        closeModal();
      }
    });

    // Event: Evitar que clics en el contenido cierren el modal
    const modalContent = modal.querySelector(".search-modal-content");
    if (modalContent) {
      modalContent.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    // Event: Cerrar con ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        closeModal();
      }
    });

    // Event: Input de búsqueda
    input.addEventListener("input", (e) => {
      e.stopPropagation();
      const value = e.target.value;
      clearBtn.classList.toggle("visible", value.length > 0);
      search(value);
    });

    // Event: Evitar que clics en el input cierren el modal
    input.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Event: Mantener foco en el input
    input.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });

    // Event: Enter para ir al primer resultado
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const firstResult = resultsContainer.querySelector(".search-result-item");
        if (firstResult) {
          window.location.href = firstResult.href;
        }
      }
    });

    // Event: Limpiar input
    if (clearBtn) {
      clearBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        input.value = "";
        clearBtn.classList.remove("visible");
        resultsContainer.innerHTML = "";
        input.focus();
      });
    }
  };

  init();
}

/* ============================================
   ANIMACIONES DE SCROLL
   ============================================ */

function initScrollAnimations() {
  // Configuración del Intersection Observer
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  // Crear el observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Usar requestAnimationFrame para asegurar que el cambio se aplique
        requestAnimationFrame(() => {
          entry.target.classList.add("reveal");

          // FORZAR REPAINT para fix de webkit gradient rendering
          const computedStyle = window.getComputedStyle(entry.target);
          const background = computedStyle.backgroundImage;
          entry.target.style.backgroundImage = "none";
          // Forzar reflow
          void entry.target.offsetHeight;
          entry.target.style.backgroundImage = background;
        });

        // Dejar de observar después de animar
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Función para inicializar cuando el DOM esté listo
  const initObserver = () => {
    const scrollElements = document.querySelectorAll("[data-scroll]");

    if (scrollElements.length === 0) {
      return;
    }

    // Observar todos los elementos
    scrollElements.forEach((element) => {
      observer.observe(element);
    });
  };

  // Inicializar después de un pequeño delay para asegurar que todo esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(initObserver, 150);
    });
  } else {
    setTimeout(initObserver, 150);
  }
}

/* ============================================
   LAZY LOADING DE IMÁGENES
   ============================================ */

function initLazyLoading() {
  // Verificar soporte nativo de lazy loading
  if ("loading" in HTMLImageElement.prototype) {
    // El navegador soporta loading="lazy" nativamente
    const images = document.querySelectorAll("img[data-src]");
    images.forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  } else {
    // Fallback con Intersection Observer para navegadores antiguos
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;

            // Cargar imagen
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            }

            // Cargar srcset si existe
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute("data-srcset");
            }

            // Agregar clase loaded para animaciones
            img.classList.add("lazy-loaded");

            // Dejar de observar
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.01,
      }
    );

    // Observar todas las imágenes con data-src
    const lazyImages = document.querySelectorAll("img[data-src]");
    lazyImages.forEach((img) => imageObserver.observe(img));
  }

  // Lazy loading para iframes (videos de YouTube, etc)
  const iframeObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          if (iframe.dataset.src) {
            iframe.src = iframe.dataset.src;
            iframe.removeAttribute("data-src");
            observer.unobserve(iframe);
          }
        }
      });
    },
    {
      rootMargin: "100px 0px",
    }
  );

  const lazyIframes = document.querySelectorAll("iframe[data-src]");
  lazyIframes.forEach((iframe) => iframeObserver.observe(iframe));
}

/* ============================================
   HERO PARALLAX EFFECT
   ============================================ */

function initHeroParallax() {
  // Only enable on desktop
  if (window.innerWidth <= 768) return;

  const badges = document.querySelectorAll(".hero-badge");
  const heroSection = document.querySelector(".hero-section");

  if (!badges.length || !heroSection) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  // Track mouse movement
  heroSection.addEventListener("mousemove", (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
    mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
  });

  // Reset on mouse leave
  heroSection.addEventListener("mouseleave", () => {
    mouseX = 0;
    mouseY = 0;
  });

  // Smooth animation loop
  function animate() {
    // Smooth interpolation
    targetX += (mouseX - targetX) * 0.1;
    targetY += (mouseY - targetY) * 0.1;

    badges.forEach((badge, index) => {
      // Different movement intensity for each badge
      const intensity = (index + 1) * 8;
      const offsetX = targetX * intensity;
      const offsetY = targetY * intensity;

      badge.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ============================================
   STATS COUNTER ANIMATION
   ============================================ */

function initStatsCounter() {
  const statNumbers = document.querySelectorAll(".about-stat-number[data-count]");

  if (statNumbers.length === 0) return;

  let hasAnimated = false;

  // Función de easing más fluida (easeOutExpo)
  // Desacelera de forma exponencial - muy suave al final
  const easeOutExpo = (t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  // Función para animar un contador individual
  const animateCounter = (element) => {
    const target = parseInt(element.getAttribute("data-count"));
    const suffix = element.getAttribute("data-suffix") || "";
    const duration = 2000; // 2 segundos
    const startTime = performance.now();
    let lastValue = -1;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      
      // Usar interpolación más precisa
      const currentValue = Math.round(easedProgress * target);

      // Solo actualizar DOM si el valor cambió (optimización)
      if (currentValue !== lastValue) {
        element.textContent = currentValue + suffix;
        lastValue = currentValue;
      }

      // Continuar animación si no ha terminado
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // Asegurar valor final exacto
        element.textContent = target + suffix;
      }
    };

    requestAnimationFrame(updateCounter);
  };

  // Intersection Observer para activar cuando sea visible
  const observerOptions = {
    threshold: 0.3,
    rootMargin: "0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;

        // Animar cada contador con delay escalonado
        statNumbers.forEach((stat, index) => {
          setTimeout(() => {
            animateCounter(stat);
          }, index * 100); // 100ms entre cada uno
        });

        observer.disconnect();
      }
    });
  }, observerOptions);

  // Observar el contenedor de stats
  const statsContainer = document.querySelector(".about-stats");
  if (statsContainer) {
    observer.observe(statsContainer);
  }
}

/* ============================================
   HERO ANIMATIONS
   ============================================ */

function initHeroAnimations() {
  const typewriterElement = document.querySelector(".typewriter");
  const heroBrand = document.querySelector(".hero-brand");

  if (!typewriterElement) return;

  // Ocultar "Sala Geek" inicialmente
  if (heroBrand) {
    heroBrand.style.opacity = "0";
    heroBrand.style.transform = "translateY(20px)";
  }

  // Solución JavaScript universal - Mostrar letra por letra
  const fullText = typewriterElement.textContent;
  const chars = fullText.split("");
  const duration = 1500; // 1.5 segundos - rápido y fluido
  const charDuration = duration / chars.length; // ~115ms por carácter

  // Vaciar el elemento inicialmente
  typewriterElement.textContent = "";
  typewriterElement.style.width = "auto";

  // Animar mostrando caracteres después del delay
  setTimeout(() => {
    let currentChar = 0;

    const interval = setInterval(() => {
      if (currentChar < chars.length) {
        typewriterElement.textContent += chars[currentChar];
        currentChar++;
      } else {
        clearInterval(interval);
        // Remover cursor después de completar
        setTimeout(() => {
          typewriterElement.classList.add("typing-complete");

          // Mostrar "Sala Geek" con animación después de completar typewriter
          if (heroBrand) {
            heroBrand.style.transition = "opacity 0.8s ease, transform 0.8s ease";
            heroBrand.style.opacity = "1";
            heroBrand.style.transform = "translateY(0)";
          }

          // Mostrar Achievement Tracker después del typewriter
          // Se ejecuta 800ms después de "Sala Geek" para animación secuencial elegante
          if (typeof easterEggTracker !== "undefined" && easterEggTracker.show) {
            easterEggTracker.show();
          }
        }, 300);
      }
    }, charDuration);
  }, 800); // Delay inicial más pausado

  // Sistema inteligente: Hover rápido = sutil, Hover mantenido = explosión
  const badges = document.querySelectorAll(".hero-badge");
  badges.forEach((badge) => {
    let hoverStartTime = null;
    let explodeTimeout = null;

    badge.addEventListener("mouseenter", () => {
      // Guardar el tiempo de inicio del hover
      hoverStartTime = Date.now();

      // Limpiar cualquier timeout de explosión pendiente
      if (explodeTimeout) {
        clearTimeout(explodeTimeout);
        explodeTimeout = null;
      }

      // Remover clase de explosión si estaba
      badge.classList.remove("badge-explode");

      // Añadir clase de hover (animación sutil, NO desaparece)
      badge.classList.add("badge-hover");
    });

    badge.addEventListener("mouseleave", () => {
      // Calcular duración del hover
      const hoverDuration = Date.now() - hoverStartTime;

      // Quitar la animación de hover
      badge.classList.remove("badge-hover");

      // Solo hacer explosión si el hover fue MANTENIDO (≥ 300ms)
      if (hoverDuration >= 300) {
        explodeTimeout = setTimeout(() => {
          badge.classList.add("badge-explode");

          // Limpiar la clase después de la animación
          setTimeout(() => {
            badge.classList.remove("badge-explode");
          }, 1000);
        }, 150);
      }
      // Si fue hover rápido (< 300ms), no hacer nada especial
    });
  });

  // ❌ DESACTIVADO - Triple click en "Sala Geek" para efecto arcoíris removido
  /*
  const heroBrandEasterEgg = document.querySelector(".hero-brand");
  if (heroBrandEasterEgg) {
    let clickCount = 0;
    let clickTimer = null;

    heroBrandEasterEgg.addEventListener("click", () => {
      clickCount++;

      if (clickTimer) clearTimeout(clickTimer);

      if (clickCount === 3) {
        // Efecto arcoíris especial
        heroBrandEasterEgg.style.animation = "none";
        heroBrandEasterEgg.style.background =
          "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)";
        heroBrandEasterEgg.style.backgroundSize = "200% 100%";
        heroBrandEasterEgg.style.animation = "gradientFlow 1s ease-in-out infinite";

        setTimeout(() => {
          heroBrandEasterEgg.style.animation = "";
        }, 3000);

        clickCount = 0;
      }

      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 500);
    });
  }
  */
}

/* ============================================
   NEWS HUB ANIMATIONS - Epic Entrance
   ============================================ */

function initNewsHubAnimations() {
  const newsHub = document.querySelector(".news-hub-section");
  const latestNews = document.querySelector(".latest-news-section");
  const newsCta = document.querySelector(".news-cta-section");
  
  if (!newsHub) return;

  // Force initial hidden state
  newsHub.classList.remove("in-view");
  if (latestNews) latestNews.classList.remove("in-view");
  if (newsCta) newsCta.classList.remove("in-view");

  // Observer options
  const observerOptions = {
    root: null,
    rootMargin: "-50px 0px",
    threshold: 0.15
  };

  // Create observer for News Hub header section
  const newsHubObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          entry.target.classList.add("in-view");
        });
        newsHubObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Create observer for Latest News section
  const latestNewsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          entry.target.classList.add("in-view");
        });
        latestNewsObserver.unobserve(entry.target);
      }
    });
  }, { ...observerOptions, threshold: 0.1 });

  // Create observer for CTA section
  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          entry.target.classList.add("in-view");
        });
        ctaObserver.unobserve(entry.target);
      }
    });
  }, { ...observerOptions, threshold: 0.2 });

  // Start observing all sections
  newsHubObserver.observe(newsHub);
  if (latestNews) latestNewsObserver.observe(latestNews);
  if (newsCta) ctaObserver.observe(newsCta);

  // Check initial visibility for elements already in viewport
  setTimeout(() => {
    const checkAndTrigger = (element, observer) => {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight - 100 && rect.bottom > 0;
      if (isVisible && !element.classList.contains("in-view")) {
        element.classList.add("in-view");
        observer.unobserve(element);
      }
    };

    checkAndTrigger(newsHub, newsHubObserver);
    checkAndTrigger(latestNews, latestNewsObserver);
    checkAndTrigger(newsCta, ctaObserver);
  }, 200);
}

/* ============================================
   FEATURED NEWS CAROUSEL
   ============================================ */

function initFeaturedNewsCarousel() {
  const track = document.querySelector(".featured-carousel-track");
  const slides = document.querySelectorAll(".featured-slide");
  const prevBtn = document.querySelector(".featured-prev");
  const nextBtn = document.querySelector(".featured-next");
  const dots = document.querySelectorAll(".featured-dot");
  const indicators = document.querySelector(".featured-indicators");

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayInterval = null;
  let autoplayTimeout = null;
  let isAnimating = false;
  let isPaused = false;
  
  const AUTOPLAY_DELAY = 8000; // Tiempo entre slides automáticos
  const PAUSE_AFTER_INTERACTION = 12000; // Pausa más larga después de interacción del usuario

  // Initialize first slide
  slides[0].classList.add("active");
  dots[0]?.classList.add("active");

  // Restart progress animation on active dot
  function restartDotProgress(dotIndex) {
    dots.forEach(dot => dot.classList.remove("active"));
    const activeDot = dots[dotIndex];
    if (activeDot) {
      // Force animation restart
      activeDot.style.animation = 'none';
      activeDot.offsetHeight; // Trigger reflow
      activeDot.style.animation = '';
      activeDot.classList.add("active");
    }
  }

  function updateSlide(direction = 'next') {
    if (isAnimating) return;
    isAnimating = true;

    const currentSlide = slides[currentIndex];
    
    // Calculate next index based on direction
    let nextIndex;
    if (direction === 'next') {
      nextIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
    } else if (direction === 'prev') {
      nextIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    } else {
      nextIndex = direction; // Direct index
    }

    if (nextIndex === currentIndex) {
      isAnimating = false;
      return;
    }

    const nextSlide = slides[nextIndex];

    // Update dots with progress restart
    restartDotProgress(nextIndex);

    // Animate out current slide
    currentSlide.style.animation = 'carouselFadeOut 0.4s ease-out forwards';
    
    // Wait for fade out, then switch
    setTimeout(() => {
      currentSlide.classList.remove("active");
      currentSlide.style.animation = '';
      
      // Show next slide with animation
      nextSlide.classList.add("active");
      nextSlide.style.animation = 'carouselFadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards';
      
      currentIndex = nextIndex;
      
      // Clear animation after it completes
      setTimeout(() => {
        nextSlide.style.animation = '';
        isAnimating = false;
      }, 600);
    }, 350);
  }

  function setPausedState(paused) {
    isPaused = paused;
    if (indicators) {
      if (paused) {
        indicators.classList.add("paused");
      } else {
        indicators.classList.remove("paused");
        // Restart the current dot's animation when resuming
        restartDotProgress(currentIndex);
      }
    }
  }

  function goToPrev() {
    if (isAnimating) return;
    updateSlide('prev');
    pauseAndResumeAutoplay();
  }

  function goToNext() {
    if (isAnimating) return;
    updateSlide('next');
    pauseAndResumeAutoplay();
  }

  function goToSlide(index) {
    if (index === currentIndex || isAnimating) return;
    updateSlide(index);
    pauseAndResumeAutoplay();
  }

  function startAutoplay() {
    if (isPaused) return;
    stopAutoplay();
    autoplayInterval = setInterval(() => {
      if (!isAnimating && !isPaused) {
        updateSlide('next');
      }
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
    if (autoplayTimeout) {
      clearTimeout(autoplayTimeout);
      autoplayTimeout = null;
    }
  }

  // Pausa el autoplay por un tiempo más largo después de interacción del usuario
  function pauseAndResumeAutoplay() {
    stopAutoplay();
    setPausedState(true);
    
    autoplayTimeout = setTimeout(() => {
      setPausedState(false);
      startAutoplay();
    }, PAUSE_AFTER_INTERACTION);
  }

  // Event listeners
  if (prevBtn) prevBtn.addEventListener("click", goToPrev);
  if (nextBtn) nextBtn.addEventListener("click", goToNext);

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goToSlide(index));
  });

  // Touch support
  let touchStartX = 0;

  track.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
    setPausedState(true);
  }, { passive: true });

  track.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50 && !isAnimating) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    } else {
      // Si no hubo swipe, reanudar autoplay después de pausa
      pauseAndResumeAutoplay();
    }
  }, { passive: true });

  // Pause on hover
  const carouselWrapper = document.querySelector(".carousel-wrapper");
  if (carouselWrapper) {
    carouselWrapper.addEventListener("mouseenter", () => {
      stopAutoplay();
      setPausedState(true);
    });
    carouselWrapper.addEventListener("mouseleave", () => {
      setPausedState(false);
      startAutoplay();
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    const newsSection = document.querySelector(".news-hub-section");
    if (!newsSection) return;
    
    const rect = newsSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible && !isAnimating) {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    }
  });

  // Pause when tab is not visible (performance optimization)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
      isPaused = true;
    } else {
      isPaused = false;
      startAutoplay();
    }
  });

  // Start autoplay
  startAutoplay();
}

/* ============================================
   TESTIMONIALS CAROUSEL
   ============================================ */

function initTestimonialsCarousel() {
  const track = document.querySelector(".carousel-track");
  const cards = document.querySelectorAll(".testimonial-card");
  const prevBtn = document.querySelector(".carousel-prev");
  const nextBtn = document.querySelector(".carousel-next");
  const indicators = document.querySelectorAll(".carousel-indicators .indicator");

  if (!track || cards.length === 0) return;

  let currentIndex = 0;
  let isTransitioning = false;
  let autoSlideInterval;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  // Función para actualizar el carrusel
  function updateCarousel(animate = true) {
    if (isTransitioning) return;
    isTransitioning = true;

    // Actualizar cards
    cards.forEach((card, index) => {
      card.classList.remove("active");
      if (index === currentIndex) {
        card.classList.add("active");
      }
    });

    // Mover el track
    const offset = -currentIndex * 100;
    if (animate) {
      track.style.transition = "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    } else {
      track.style.transition = "none";
    }
    track.style.transform = `translateX(${offset}%)`;

    // Actualizar indicadores
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentIndex);
    });

    setTimeout(() => {
      isTransitioning = false;
    }, 600);
  }

  // Navegación anterior
  function goToPrev() {
    if (isTransitioning) return;
    currentIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
    updateCarousel();
    resetAutoSlide();
  }

  // Navegación siguiente
  function goToNext() {
    if (isTransitioning) return;
    currentIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;
    updateCarousel();
    resetAutoSlide();
  }

  // Ir a slide específico
  function goToSlide(index) {
    if (isTransitioning || index === currentIndex) return;
    currentIndex = index;
    updateCarousel();
    resetAutoSlide();
  }

  // Auto-slide
  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      goToNext();
    }, 5000); // 5 segundos
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
    }
  }

  function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
  }

  // Touch/Swipe support
  function handleTouchStart(e) {
    isDragging = true;
    startX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
    track.style.transition = "none";
    stopAutoSlide();
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    currentX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
    const diff = currentX - startX;
    const offset = -currentIndex * 100 + (diff / track.offsetWidth) * 100;
    track.style.transform = `translateX(${offset}%)`;
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    const diff = currentX - startX;
    const threshold = track.offsetWidth * 0.2; // 20% del ancho

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToPrev();
      } else {
        goToNext();
      }
    } else {
      updateCarousel();
    }
    resetAutoSlide();
  }

  // Event Listeners
  if (prevBtn) prevBtn.addEventListener("click", goToPrev);
  if (nextBtn) nextBtn.addEventListener("click", goToNext);

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => goToSlide(index));
  });

  // Touch events
  const container = document.querySelector(".carousel-container");
  if (container) {
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    // Mouse events para desktop
    container.addEventListener("mousedown", handleTouchStart);
    container.addEventListener("mousemove", handleTouchMove);
    container.addEventListener("mouseup", handleTouchEnd);
    container.addEventListener("mouseleave", () => {
      if (isDragging) handleTouchEnd();
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goToPrev();
    if (e.key === "ArrowRight") goToNext();
  });

  // Pausar auto-slide en hover
  const carousel = document.querySelector(".testimonials-carousel");
  if (carousel) {
    carousel.addEventListener("mouseenter", stopAutoSlide);
    carousel.addEventListener("mouseleave", startAutoSlide);
  }

  // Inicializar
  updateCarousel(false);
  startAutoSlide();
}

/* ============================================
   NEWSLETTER FORM
   ============================================ */

function initNewsletterForm() {
  const form = document.getElementById("newsletter-form");
  const messageContainer = document.getElementById("newsletter-message");

  if (!form) return;

  // Función helper para esperar a que reCAPTCHA esté listo
  const waitForRecaptcha = () => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30; // 15 segundos máximo

      const checkRecaptcha = () => {
        // Verificar si grecaptcha existe y está listo
        if (typeof grecaptcha !== "undefined" && grecaptcha.ready) {
          console.log("✅ reCAPTCHA detectado, esperando ready()...");
          grecaptcha.ready(() => {
            console.log("✅ reCAPTCHA ready!");
            resolve();
          });
        } else if (attempts >= maxAttempts) {
          console.error("❌ reCAPTCHA no se cargó después de", maxAttempts, "intentos");
          reject(
            new Error(
              "No se pudo cargar el sistema de seguridad. Por favor, recarga la página o desactiva tu bloqueador de anuncios."
            )
          );
        } else {
          attempts++;
          console.log(`⏳ Esperando reCAPTCHA... intento ${attempts}/${maxAttempts}`);
          setTimeout(checkRecaptcha, 500);
        }
      };

      checkRecaptcha();
    });
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = document.getElementById("newsletter-submit");
    const btnText = submitBtn.querySelector(".btn-text");
    const btnLoader = submitBtn.querySelector(".btn-loader");
    const email = emailInput.value.trim();

    if (!email) return;

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNewsletterMessage("Por favor, ingresa un correo electrónico válido", "error");
      return;
    }

    // Deshabilitar el botón y mostrar loader
    submitBtn.disabled = true;
    btnText.style.display = "none";
    btnLoader.style.display = "inline-flex";

    // Ocultar mensaje anterior si existe
    if (messageContainer) {
      messageContainer.style.display = "none";
    }

    try {
      // Esperar a que reCAPTCHA esté listo
      await waitForRecaptcha();

      // Obtener token de reCAPTCHA v3
      const recaptchaToken = await grecaptcha.execute("6LcJzwUsAAAAAC-ecsG89N36b8nnVCt64UOTHKqB", {
        action: "newsletter_subscribe",
      });

      // Enviar a Netlify Function que conecta con Mailchimp
      const response = await fetch("/.netlify/functions/mailchimp-subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          recaptchaToken, // Incluir el token de reCAPTCHA
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Éxito
        showNewsletterMessage(
          data.message ||
            "¡Gracias por suscribirte! Revisa tu correo para el mensaje de bienvenida.",
          "success"
        );

        // Limpiar el formulario
        emailInput.value = "";

        // Guardar en localStorage
        localStorage.setItem("newsletter_subscribed", "true");
      } else {
        // Error del servidor
        throw new Error(data.error || "Error al procesar la suscripción");
      }
    } catch (error) {
      console.error("Error al suscribir:", error);
      showNewsletterMessage(
        error.message || "Hubo un error al procesar tu suscripción. Por favor, intenta nuevamente.",
        "error"
      );
    } finally {
      // Restaurar el botón
      submitBtn.disabled = false;
      btnText.style.display = "inline";
      btnLoader.style.display = "none";
    }
  });

  // Función helper para mostrar mensajes
  function showNewsletterMessage(text, type) {
    if (!messageContainer) return;

    const messageText = messageContainer.querySelector(".message-text");
    messageText.textContent = text;

    messageContainer.className = "newsletter-message " + type;
    messageContainer.style.display = "block";

    // Auto-ocultar después de 8 segundos
    setTimeout(() => {
      messageContainer.style.display = "none";
    }, 8000);
  }
}

/* ============================================
   NEWS CTA SUBSCRIBE FORM
   ============================================ */

function initNewsSubscribeForm() {
  const form = document.getElementById("news-subscribe-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector("span");
    const email = emailInput.value.trim();

    if (!email) return;

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Por favor, ingresa un correo electrónico válido", "error");
      return;
    }

    // Estado de carga
    const originalText = btnText.textContent;
    submitBtn.disabled = true;
    btnText.textContent = "Enviando...";

    try {
      // Esperar a que reCAPTCHA esté listo
      if (typeof grecaptcha !== "undefined") {
        await new Promise((resolve) => grecaptcha.ready(resolve));
        
        const recaptchaToken = await grecaptcha.execute("6LcJzwUsAAAAAC-ecsG89N36b8nnVCt64UOTHKqB", {
          action: "newsletter_subscribe",
        });

        const response = await fetch("/.netlify/functions/mailchimp-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, recaptchaToken }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Éxito
          form.classList.add("success");
          btnText.textContent = "¡Suscrito!";
          emailInput.value = "";
          showNotification("¡Gracias por suscribirte! Revisa tu correo.", "success");
          localStorage.setItem("newsletter_subscribed", "true");
          
          // Restaurar después de 3s
          setTimeout(() => {
            form.classList.remove("success");
            btnText.textContent = originalText;
            submitBtn.disabled = false;
          }, 3000);
          return;
        } else {
          throw new Error(data.error || "Error al procesar la suscripción");
        }
      } else {
        throw new Error("Sistema de seguridad no disponible");
      }
    } catch (error) {
      console.error("Error al suscribir:", error);
      showNotification(error.message || "Error al suscribir. Intenta de nuevo.", "error");
    }

    // Restaurar botón
    btnText.textContent = originalText;
    submitBtn.disabled = false;
  });
}

/* ============================================
   BLOG SUBSCRIBE FORM
   ============================================ */

function initBlogSubscribeForm() {
  const form = document.getElementById("blog-subscribe-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector("span");
    const email = emailInput.value.trim();

    if (!email) return;

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Por favor, ingresa un correo electrónico válido", "error");
      return;
    }

    // Estado de carga
    const originalText = btnText.textContent;
    submitBtn.disabled = true;
    btnText.textContent = "Enviando...";

    try {
      // Esperar a que reCAPTCHA esté listo
      if (typeof grecaptcha !== "undefined") {
        await new Promise((resolve) => grecaptcha.ready(resolve));
        
        const recaptchaToken = await grecaptcha.execute("6LcJzwUsAAAAAC-ecsG89N36b8nnVCt64UOTHKqB", {
          action: "newsletter_subscribe",
        });

        const response = await fetch("/.netlify/functions/mailchimp-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, recaptchaToken }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Éxito
          form.classList.add("success");
          btnText.textContent = "¡Suscrito!";
          emailInput.value = "";
          showNotification("¡Gracias por suscribirte! Revisa tu correo.", "success");
          localStorage.setItem("newsletter_subscribed", "true");
          
          // Restaurar después de 3s
          setTimeout(() => {
            form.classList.remove("success");
            btnText.textContent = originalText;
            submitBtn.disabled = false;
          }, 3000);
          return;
        } else {
          throw new Error(data.error || "Error al procesar la suscripción");
        }
      } else {
        throw new Error("Sistema de seguridad no disponible");
      }
    } catch (error) {
      console.error("Error al suscribir:", error);
      showNotification(error.message || "Error al suscribir. Intenta de nuevo.", "error");
    }

    // Restaurar botón
    btnText.textContent = originalText;
    submitBtn.disabled = false;
  });
}

/* ============================================
   SECCIÓN 4: SISTEMA DE NOTIFICACIONES
   ============================================ */

/**
 * Configuración de colores por tipo de notificación
 * @constant {Object}
 */
const NOTIFICATION_STYLES = {
  success: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
  error: "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
  info: "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
};

/**
 * Muestra una notificación toast con estilo responsive
 * @param {string} message - Mensaje a mostrar
 * @param {('success'|'error'|'info')} type - Tipo de notificación
 */
function showNotification(message, type = "info") {
  // Bloquear notificaciones si los Easter Eggs están desactivados
  if (window.areEasterEggsDisabled?.()) return;

  const isMobile = /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
  const background = NOTIFICATION_STYLES[type] || NOTIFICATION_STYLES.info;

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Estilos responsive optimizados
  notification.style.cssText = `
    position: fixed;
    top: ${isMobile ? "90px" : "120px"};
    right: ${isMobile ? "10px" : "20px"};
    left: ${isMobile ? "10px" : "auto"};
    padding: ${isMobile ? "0.75rem 1rem" : "1rem 1.5rem"};
    background: ${background};
    color: white;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 100000;
    max-width: ${isMobile ? "100%" : "400px"};
    animation: slideInRight 0.3s ease;
    font-weight: 500;
    font-size: ${isMobile ? "0.875rem" : "1rem"};
    line-height: 1.4;
  `;

  document.body.appendChild(notification);

  // Auto-remover después de 5 segundos con animación
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Agregar estilos de animación si no existen
if (!document.getElementById("notification-styles")) {
  const style = document.createElement("style");
  style.id = "notification-styles";
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

/* ============================================
   COOKIE CONSENT - DEPRECATED
   Ahora manejado por cookie-consent.js (banner premium)
   ============================================ */

// function initCookieConsent() { ... } // REMOVIDO - Ver cookie-consent.js

/* ============================================
   BACK TO TOP BUTTON + SCROLL PROGRESS
   ============================================ */

function initBackToTop() {
  const backToTopBtn = document.getElementById("back-to-top");
  if (!backToTopBtn) return;

  const progressCircle = backToTopBtn.querySelector(".progress-ring-progress");
  const circumference = 2 * Math.PI * 20; // r=20

  // Configurar el círculo de progreso
  progressCircle.style.strokeDasharray = circumference;
  progressCircle.style.strokeDashoffset = circumference;

  // Función para actualizar el progreso y posición
  function updateScrollProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Calcular porcentaje de scroll
    const scrollPercent = scrollTop / (documentHeight - windowHeight);
    const offset = circumference - scrollPercent * circumference;

    progressCircle.style.strokeDashoffset = offset;

    // Detectar modo Upside Down
    const isUpsideDown = document.body.classList.contains("upside-down-mode");

    // Mostrar/ocultar botón (lógica del Index sin cambios)
    if (scrollTop > 300) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }

    // Solo agregamos rotación visual en modo Upside Down
    if (isUpsideDown && backToTopBtn.classList.contains("visible")) {
      // Combinar la transformación visible del CSS con la rotación
      backToTopBtn.style.transform = "translateY(0) rotate(180deg)";
    } else if (isUpsideDown && !backToTopBtn.classList.contains("visible")) {
      // Combinar la transformación oculta del CSS con la rotación
      backToTopBtn.style.transform = "translateY(20px) rotate(180deg)";
    } else {
      // Modo normal: limpiar transform inline para que use el CSS
      backToTopBtn.style.transform = "";
    }
  }

  // Event listeners
  window.addEventListener("scroll", updateScrollProgress);
  window.addEventListener("resize", updateScrollProgress);

  // Observer para detectar cambios en modo Upside Down
  const observer = new MutationObserver(() => {
    updateScrollProgress();
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // Click para volver arriba
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Inicializar
  updateScrollProgress();
}

/* ============================================
   SMOOTH SCROLL PARA TODOS LOS ENLACES DE ANCLA
   ============================================ */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Ignorar enlaces vacíos o solo "#"
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();

        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

/* ============================================
   HEADER SCROLL EFFECT
   ============================================ */

function initHeaderScroll() {
  const headerPlaceholder = document.getElementById("header-placeholder");
  const header = document.querySelector(".site-header");
  if (!header || !headerPlaceholder) return;

  let lastScroll = 0;

  window.addEventListener(
    "scroll",
    () => {
      const currentScroll = window.pageYOffset;

      // Agregar clase scrolled cuando se hace scroll hacia abajo
      if (currentScroll > 50) {
        headerPlaceholder.classList.add("scrolled");
        header.classList.add("scrolled");
      } else {
        headerPlaceholder.classList.remove("scrolled");
        header.classList.remove("scrolled");
      }

      // Actualizar barra de progreso de scroll
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollProgress = (currentScroll / windowHeight) * 100;
      header.style.setProperty('--scroll-progress', `${scrollProgress}%`);

      lastScroll = currentScroll;
    },
    { passive: true }
  );
}

/* ============================================
   MENÚ ADAPTATIVO
   ============================================ */

/**
 * Detecta el tipo de página y muestra el menú apropiado
 */
function initAdaptiveMenu() {
  const menuLanding = document.querySelector(".menu-landing");
  const menuLegal = document.querySelector(".menu-legal");
  const menuMediaKit = document.querySelector(".menu-mediakit");
  const menuBlog = document.querySelector(".menu-blog");

  if (!menuLanding || !menuLegal || !menuMediaKit) {
    return;
  }

  // Detectar tipo de página por body class y ruta
  const isMediaKitPage = document.body.classList.contains("media-kit-page") || 
                         window.location.pathname.includes("media-kit.html") ||
                         window.location.pathname.includes("/media-kit");
  const isLegalPage = window.location.pathname.includes("/legal/") ||
                      window.location.pathname.includes("/privacidad") ||
                      window.location.pathname.includes("/terminos") ||
                      window.location.pathname.includes("/cookies");
  const isBlogPage = window.location.pathname.includes("/blog/") || 
                     document.body.classList.contains("blog-page");

  // Ocultar todos los menús primero
  menuLanding.style.display = "none";
  menuLegal.style.display = "none";
  menuMediaKit.style.display = "none";
  if (menuBlog) menuBlog.style.display = "none";

  if (isBlogPage && menuBlog) {
    // Mostrar menú Blog
    menuBlog.style.display = "flex";

    // Marcar el link activo según la página actual
    const currentPath = window.location.pathname;
    const blogLinks = menuBlog.querySelectorAll(".nav-link");

    blogLinks.forEach((link) => {
      link.classList.remove("active");
      const linkPath = new URL(link.href).pathname;
      
      // Coincidencia exacta para /blog/ o incluir para categorías
      if ((currentPath === "/blog/" && linkPath === "/blog/") ||
          (currentPath.includes(linkPath) && linkPath !== "/index.html" && linkPath !== "/blog/")) {
        link.classList.add("active");
      }
    });
  } else if (isMediaKitPage) {
    // Mostrar menú Media Kit
    menuMediaKit.style.display = "flex";
  } else if (isLegalPage) {
    // Mostrar menú Legal
    menuLegal.style.display = "flex";

    // Marcar el link activo según la página actual
    const currentPage = window.location.pathname;
    const legalLinks = menuLegal.querySelectorAll(".nav-link");

    legalLinks.forEach((link) => {
      const linkPath = new URL(link.href).pathname;
      if (currentPage.includes(linkPath) && !link.classList.contains("nav-link-home")) {
        link.classList.add("active");
      }
    });
  } else {
    // Mostrar menú Landing
    menuLanding.style.display = "flex";
  }
}

/* ============================================
   PÁGINAS LEGALES
   ============================================ */

/**
 * Inicializa funcionalidades específicas de páginas legales
 */
function initLegalPages() {
  const legalPage = document.querySelector(".legal-page");
  if (!legalPage) return;

  // Animar TOC con delay
  setTimeout(() => {
    const toc = document.querySelector(".legal-toc");
    if (toc) toc.classList.add("animate-in");
  }, 100);

  // Inicializar navegación del TOC
  initLegalTOC();

  // Inicializar animaciones de secciones
  initLegalSectionAnimations();
}

/**
 * Tabla de contenidos interactiva con scroll spy
 */
function initLegalTOC() {
  const tocLinks = document.querySelectorAll(".legal-toc nav a");
  const sections = document.querySelectorAll(".legal-section[id]");
  const toc = document.querySelector(".legal-toc");
  const tocTitle = document.querySelector(".legal-toc-title");

  if (tocLinks.length === 0 || sections.length === 0) return;

  // Funcionalidad de collapse para móvil
  if (tocTitle && toc) {
    // Iniciar colapsado en móvil y tablet
    if (window.innerWidth <= 1024) {
      toc.classList.add("collapsed");
    }

    // Toggle al hacer click en el título
    tocTitle.addEventListener("click", () => {
      toc.classList.toggle("collapsed");
    });

    // Manejar resize de ventana
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 1024) {
          toc.classList.remove("collapsed");
        } else if (!toc.classList.contains("collapsed")) {
          toc.classList.add("collapsed");
        }
      }, 250);
    });
  }

  // Función para actualizar enlaces activos
  function updateActiveTOCLink() {
    const scrollPosition = window.scrollY + 200; // Ajustado para mejor precisión

    let currentSection = "";
    let maxTop = -Infinity;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;

      // Encontrar la sección más cercana por encima del scroll actual
      if (sectionTop <= scrollPosition && sectionTop > maxTop) {
        maxTop = sectionTop;
        currentSection = section.id;
      }
    });

    // Actualizar clases activas con animación suave
    tocLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const shouldBeActive = href === `#${currentSection}`;

      if (shouldBeActive && !link.classList.contains("active")) {
        link.classList.add("active");
      } else if (!shouldBeActive && link.classList.contains("active")) {
        link.classList.remove("active");
      }
    });
  }

  // Scroll suave al hacer clic en enlaces del TOC
  tocLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerOffset = 130; // Ajustado para mejor posicionamiento
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        // Remover active temporalmente durante el scroll
        tocLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Usar throttle con requestAnimationFrame
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveTOCLink();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  // Actualizar al cargar después de un delay
  setTimeout(updateActiveTOCLink, 100);
}

/**
 * Animaciones de entrada para secciones legales
 */
function initLegalSectionAnimations() {
  const sections = document.querySelectorAll(".legal-section");

  if (sections.length === 0) return;

  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -80px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
        // Dejar de observar después de animar
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });
}

/**
 * Barra de progreso de lectura
 */
function initReadingProgress() {
  // Verificar si ya existe
  if (document.querySelector(".reading-progress")) return;

  // Crear barra de progreso
  const progressBar = document.createElement("div");
  progressBar.className = "reading-progress";
  progressBar.innerHTML = '<div class="reading-progress-bar"></div>';

  // Estilos inline para la barra de progreso
  const style = document.createElement("style");
  style.id = "reading-progress-styles";
  style.textContent = `
    .reading-progress {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: rgba(255, 209, 102, 0.08);
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .reading-progress.visible {
      opacity: 1;
    }
    
    .reading-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      width: 0%;
      transition: width 0.15s ease-out;
      box-shadow: 0 0 10px rgba(255, 209, 102, 0.5);
    }
  `;

  if (!document.getElementById("reading-progress-styles")) {
    document.head.appendChild(style);
  }
  document.body.appendChild(progressBar);

  const progressBarFill = progressBar.querySelector(".reading-progress-bar");

  function updateReadingProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / documentHeight) * 100;

    // Mostrar barra solo después de scrollear un poco
    if (scrolled > 100) {
      progressBar.classList.add("visible");
    } else {
      progressBar.classList.remove("visible");
    }

    progressBarFill.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
  }

  // Throttle con requestAnimationFrame
  let progressTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!progressTicking) {
        window.requestAnimationFrame(() => {
          updateReadingProgress();
          progressTicking = false;
        });
        progressTicking = true;
      }
    },
    { passive: true }
  );

  // Actualizar al cargar
  setTimeout(updateReadingProgress, 100);
}

/* ============================================
   INICIALIZACIÓN GLOBAL
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Forzar modo oscuro
  initDarkMode();

  // Cargar componentes
  loadIncludes().then(() => {
    // Después de cargar el header, configurar el menú apropiado
    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      initAdaptiveMenu();
    }, 50);
  });

  // Inicializar funcionalidades
  initResponsiveHandler();
  initHeroAnimations();
  initHeroParallax();
  initStatsCounter();
  initScrollAnimations();
  initLazyLoading();
  initNewsHubAnimations();
  initFeaturedNewsCarousel();
  initTestimonialsCarousel();
  initNewsletterForm();
  initNewsSubscribeForm();
  initBlogSubscribeForm();
  // initCookieConsent(); // DEPRECATED - Ahora manejado por cookie-consent.js
  initSmoothScroll();
  initBackToTop();
  initHeaderScroll();

  // initSearch() se llama en loadIncludes() después de cargar el header

  // Inicializar páginas legales si estamos en una
  initLegalPages();
});

// Prevenir FOUC (Flash of Unstyled Content)
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

/* ============================================
   🎮 EASTER EGGS - FULL GEEK MODE
   ============================================ */

/* ============================================
   SECCIÓN 5: SISTEMA DE AUDIO 8-BIT
   ============================================ */

/**
 * Flag global para prevenir solapamiento de sonidos
 * @type {boolean}
 */
let isSoundPlaying = false;

/**
 * Biblioteca de efectos de sonido 8-bit
 * Cada sonido está definido por frecuencias (Hz) y duraciones (ms)
 * @constant {Object}
 */
const soundLibrary = {
  powerup: () => playBeep([440, 554, 659, 880], [100, 100, 100, 300]),
  coin: () => playBeep([988, 1319], [100, 300]),
  glitch: () => playBeep([200, 150, 100, 200], [50, 50, 50, 100]),
  snap: () => playBeep([800, 600, 400, 200, 100], [100, 100, 100, 100, 200]),
  levelup: () => playBeep([523, 659, 784, 1047], [150, 150, 150, 400]),
  success: () => playBeep([523, 587, 659, 784], [100, 100, 100, 300]),
  error: () => playBeep([392, 349, 294], [150, 150, 300]),
};

/**
 * Motor de audio usando Web Audio API
 * Genera tonos 8-bit con onda cuadrada y envelope ADSR
 * @param {number[]} frequencies - Array de frecuencias en Hz
 * @param {number[]} durations - Array de duraciones en ms
 */
function playBeep(frequencies, durations) {
  try {
    isSoundPlaying = true;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let startTime = audioContext.currentTime;
    let totalDuration = 0;

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "square"; // Onda cuadrada para efecto retro
      oscillator.frequency.value = freq;

      // Envelope ADSR para sonido más natural
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01); // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + durations[index] / 1000); // Decay/Release

      oscillator.start(startTime);
      oscillator.stop(startTime + durations[index] / 1000);

      startTime += durations[index] / 1000;
      totalDuration += durations[index];
    });

    // Resetear flag cuando termine
    setTimeout(() => {
      isSoundPlaying = false;
    }, totalDuration);
  } catch (error) {
    // console.log("⚠️ Audio no disponible:", error);
    isSoundPlaying = false;
  }
}

/**
 * Helper para reproducir sonidos de la biblioteca
 * @param {string} soundName - Nombre del sonido en soundLibrary
 */
function playSound(soundName) {
  // 🚫 No reproducir sonidos si Easter Eggs están desactivados
  if (window.areEasterEggsDisabled?.()) {
    return;
  }

  if (soundLibrary[soundName]) {
    soundLibrary[soundName]();
  } else {
    // console.warn(`⚠️ Sonido "${soundName}" no encontrado`);
  }
}

/* ============================================
   SECCIÓN 6: SISTEMA DE EASTER EGGS
   ============================================
   
   Total: 9 Easter Eggs
   Móvil: 6 (konami, logo, retro, thanos, combo, scroll)
   Desktop Only: 3 (matrix, corners, shake)
   
   Sistema de Achievement Tracker:
   - localStorage para persistencia
   - Niveles dinámicos por plataforma
   - UI responsive con auto-hide
   - Confetti celebration al completar todos
   
   ============================================ */

/**
 * Helper para crear interacciones de Long Press
 * Reduce código duplicado en Easter Eggs móviles
 * 
 * @param {HTMLElement} element - Elemento al que añadir long press
 * @param {Object} options - Configuración
 * @param {Function} options.onActivate - Callback al completar long press
 * @param {number} options.duration - Milisegundos para activar (default: 600)
 * @param {boolean} options.mobileOnly - Solo activar en móvil (default: true)
 * @param {Object} options.feedback - Configuración de feedback visual
 */
function createLongPressHandler(element, options = {}) {
  if (!element) return null;
  
  const {
    onActivate,
    duration = 600,
    mobileOnly = true,
    feedback = {}
  } = options;
  
  const {
    scaleDown = 0.95,
    scaleUp = 1.1,
    glowColor = 'var(--accent-primary)'
  } = feedback;
  
  let timer = null;
  let activated = false;
  
  const handleStart = (e) => {
    if (mobileOnly && window.innerWidth > 1024) return;
    if (window.areEasterEggsDisabled?.()) return;
    
    activated = false;
    element.style.transform = `scale(${scaleDown})`;
    element.style.transition = 'transform 0.1s ease';
    
    timer = setTimeout(() => {
      activated = true;
      if (onActivate) onActivate();
      
      // Feedback visual
      element.style.transform = `scale(${scaleUp})`;
      element.style.boxShadow = `0 0 20px ${glowColor}`;
      if (navigator.vibrate) navigator.vibrate(200);
      
      setTimeout(() => {
        element.style.transform = '';
        element.style.boxShadow = '';
      }, 500);
    }, duration);
  };
  
  const handleEnd = (e) => {
    clearTimeout(timer);
    element.style.transform = '';
    
    if (activated) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      activated = false;
      return false;
    }
  };
  
  const handleMove = () => {
    clearTimeout(timer);
    element.style.transform = '';
  };
  
  // Touch events
  element.addEventListener('touchstart', handleStart, { passive: true });
  element.addEventListener('touchend', handleEnd);
  element.addEventListener('touchmove', handleMove);
  
  // Mouse events (for responsive testing)
  element.addEventListener('mousedown', handleStart);
  element.addEventListener('mouseup', handleEnd);
  element.addEventListener('mouseleave', handleEnd);
  
  return { destroy: () => {
    element.removeEventListener('touchstart', handleStart);
    element.removeEventListener('touchend', handleEnd);
    element.removeEventListener('touchmove', handleMove);
    element.removeEventListener('mousedown', handleStart);
    element.removeEventListener('mouseup', handleEnd);
    element.removeEventListener('mouseleave', handleEnd);
  }};
}

/**
 * EASTER EGG #1: Código Konami
 * Plataforma: Móvil + Desktop
 * Acción: ↑↑↓↓←→←→BA
 * Efecto: Activa Matrix Rain effect
 */
function initKonamiCode() {
  // Solo funciona en el index (home)
  if (!document.body.classList.contains("home")) return;

  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let konamiIndex = 0;

  document.addEventListener("keydown", (e) => {
    if (window.areEasterEggsDisabled?.()) return;

    // Validar que e.key existe
    if (!e.key) return;

    const key = e.key.toLowerCase();
    const expectedKey = konamiCode[konamiIndex];
    const isMatch = e.key === expectedKey || key === expectedKey;

    if (isMatch) {
      konamiIndex++;
      // console.log(`🎮 Konami: ${konamiIndex}/${konamiCode.length}`);

      if (konamiIndex === konamiCode.length) {
        activateNESMode();
        easterEggTracker.unlock("konami");
        konamiIndex = 0;
      }
    } else {
      if (konamiIndex > 0) {
        // console.log("❌ Konami reset");
      }
      konamiIndex = 0;
    }
  });
}

function activateNESMode() {
  playSound("powerup");
  showNotification("🎮 ¡CÓDIGO KONAMI DESBLOQUEADO! NES Mode Activated", "success");

  // Crear overlay con efecto NES retro (más sutil y elegante)
  const overlay = document.createElement("div");
  overlay.id = "nes-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
    background: linear-gradient(
      0deg,
      rgba(255, 0, 0, 0.08) 0%,
      rgba(255, 128, 0, 0.08) 16.66%,
      rgba(255, 255, 0, 0.08) 33.33%,
      rgba(0, 255, 0, 0.08) 50%,
      rgba(0, 128, 255, 0.08) 66.66%,
      rgba(128, 0, 255, 0.08) 83.33%,
      rgba(255, 0, 255, 0.08) 100%
    );
    animation: rainbowShift 3s linear infinite;
  `;
  document.body.appendChild(overlay);

  // Aplicar efectos retro al body
  const originalBodyStyle = {
    imageRendering: document.body.style.imageRendering,
    filter: document.body.style.filter,
    transform: document.body.style.transform,
  };

  document.body.style.transition = "all 0.5s ease";
  document.body.style.imageRendering = "pixelated";
  document.body.style.filter = "contrast(1.2) saturate(1.2) hue-rotate(3deg)";

  // Crear efecto de scanlines NES (más sutil)
  const scanlines = document.createElement("div");
  scanlines.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.08),
      rgba(0, 0, 0, 0.08) 2px,
      transparent 2px,
      transparent 4px
    );
    pointer-events: none;
    z-index: 999998;
    opacity: 0;
    transition: opacity 0.4s ease;
  `;
  document.body.appendChild(scanlines);

  // Detectar móvil para responsive
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Crear mensaje estilo NES - aparece donde está el viewport con diseño mejorado
  const nesMessage = document.createElement("div");

  // Calcular posición del viewport actual
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight;
  const centerY = scrollTop + viewportHeight / 2;

  nesMessage.style.cssText = `
    position: absolute;
    top: ${centerY}px;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000000;
    background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
    color: #fff;
    padding: ${isMobile ? "1.5rem 2rem" : "2.5rem 3.5rem"};
    border: 3px solid #fff;
    border-radius: 4px;
    font-family: 'Press Start 2P', 'Courier New', monospace;
    font-size: ${isMobile ? "1rem" : "1.5rem"};
    text-align: center;
    box-shadow: 
      0 0 0 6px #000,
      0 0 0 9px #fff,
      0 0 30px rgba(6, 255, 165, 0.4),
      inset 0 0 20px rgba(6, 255, 165, 0.1);
    opacity: 0;
    animation: blink 0.5s step-end infinite, fadeIn 0.6s ease forwards;
  `;
  nesMessage.innerHTML = `
    <div style="color: #ff6b6b; margin-bottom: 1rem; text-shadow: 2px 2px 0 rgba(0,0,0,0.5);">★ POWER UP! ★</div>
    <div style="color: #ffd166; font-size: ${isMobile ? "0.85rem" : "1rem"}; text-shadow: 2px 2px 0 rgba(0,0,0,0.5);">+1000 POINTS</div>
    <div style="color: #06ffa5; font-size: ${isMobile ? "0.7rem" : "0.8rem"}; margin-top: 1rem; text-shadow: 1px 1px 0 rgba(0,0,0,0.5);">KONAMI CODE UNLOCKED</div>
  `;
  document.body.appendChild(nesMessage);

  // Crear sprites flotantes estilo NES (menos cantidad, más elegante)
  const sprites = ["★", "♥", "●", "■", "▲", "♦"];
  const spriteElements = [];
  const spriteCount = isMobile ? 8 : 12;

  for (let i = 0; i < spriteCount; i++) {
    setTimeout(() => {
      const sprite = document.createElement("div");
      const randomSprite = sprites[Math.floor(Math.random() * sprites.length)];
      const randomColor = ["#ff6b6b", "#ffd166", "#06ffa5", "#4ecdc4", "#a8dadc"][
        Math.floor(Math.random() * 5)
      ];

      sprite.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}vw;
        top: -50px;
        font-size: ${isMobile ? 15 + Math.random() * 20 : 20 + Math.random() * 25}px;
        color: ${randomColor};
        z-index: 999997;
        pointer-events: none;
        animation: nesFloat ${4 + Math.random() * 2}s ease-in-out;
        text-shadow: 
          1px 1px 0px rgba(0, 0, 0, 0.8),
          -1px -1px 0px rgba(0, 0, 0, 0.8),
          1px -1px 0px rgba(0, 0, 0, 0.8),
          -1px 1px 0px rgba(0, 0, 0, 0.8);
        filter: drop-shadow(0 0 8px ${randomColor});
      `;
      sprite.textContent = randomSprite;
      document.body.appendChild(sprite);
      spriteElements.push(sprite);

      setTimeout(() => sprite.remove(), 6000);
    }, i * 150);
  }

  // Fade in effects con valores más sutiles y elegantes
  setTimeout(() => {
    overlay.style.opacity = "0.15";
    scanlines.style.opacity = "0.4";
  }, 100);

  // Agregar estilos de animación
  if (!document.getElementById("nes-animations")) {
    const style = document.createElement("style");
    style.id = "nes-animations";
    style.textContent = `
      @keyframes rainbowShift {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
      @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0.8; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes nesFloat {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        50% {
          opacity: 0.8;
        }
        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Desactivar después de 7 segundos
  setTimeout(() => {
    overlay.style.opacity = "0";
    scanlines.style.opacity = "0";
    nesMessage.style.animation = "fadeOut 0.5s ease forwards";

    // Restaurar estilos del body
    document.body.style.imageRendering = originalBodyStyle.imageRendering;
    document.body.style.filter = originalBodyStyle.filter;
    document.body.style.transform = originalBodyStyle.transform;

    setTimeout(() => {
      overlay.remove();
      scanlines.remove();
      nesMessage.remove();
      spriteElements.forEach((s) => s.remove());
    }, 500);
  }, 7000);
}

// EASTER EGG 2: DOBLE CLICK EN "SALA GEEK" DEL HERO
function initLogoEasterEgg() {
  // Solo funciona en el index (home)
  if (!document.body.classList.contains("home")) return;

  // Esperar a que el hero se cargue
  setTimeout(() => {
    const heroTitle = document.querySelector(".hero-content h1");
    if (!heroTitle) return;

    let clickCount = 0;
    let clickTimer = null;

    heroTitle.addEventListener("click", (e) => {
      if (window.areEasterEggsDisabled?.()) return;
      // Solo en desktop (> 1024px)
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      if (isMobile || window.innerWidth <= 1024) return;

      e.preventDefault();
      clickCount++;

      if (clickTimer) clearTimeout(clickTimer);

      if (clickCount === 2) {
        activateGlitchStats();
        easterEggTracker.unlock("logo");
        clickCount = 0;
      }

      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 500);
    });

    // Agregar cursor pointer para indicar que es clickeable
    heroTitle.style.cursor = "pointer";
    heroTitle.style.userSelect = "none";
  }, 1000);
}

function activateGlitchStats() {
  playSound("glitch");

  // Asegurar que los estilos de glitch existen primero
  if (!document.getElementById("glitch-styles")) {
    const style = document.createElement("style");
    style.id = "glitch-styles";
    style.textContent = `
      @keyframes glitch {
        0%, 100% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(2px, -2px); }
        60% { transform: translate(-2px, -2px); }
        80% { transform: translate(2px, 2px); }
      }
    `;
    document.head.appendChild(style);
  }

  // Aplicar efecto glitch al título del hero
  const heroTitle = document.querySelector(".hero-content h1");
  if (heroTitle) {
    const originalText = heroTitle.textContent;
    heroTitle.style.animation = "glitch 0.5s ease";
    heroTitle.style.color = "var(--accent-primary)";

    // Glitch en el texto
    let glitchCount = 0;
    const glitchInterval = setInterval(() => {
      const glitchChars = "!@#$%^&*()_+{}|:<>?[];',./`~";
      const glitched = originalText
        .split("")
        .map((char) =>
          Math.random() > 0.7 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
        )
        .join("");
      heroTitle.textContent = glitched;
      glitchCount++;

      if (glitchCount > 10) {
        clearInterval(glitchInterval);
        heroTitle.textContent = originalText;
        heroTitle.style.animation = "";
        heroTitle.style.color = "";
      }
    }, 50);
  }

  // Aplicar efecto glitch al logo también
  const logo = document.querySelector(".site-logo");
  if (logo) {
    logo.style.animation = "glitch 0.5s ease";
    setTimeout(() => {
      logo.style.animation = "";
    }, 500);
  }

  // Mostrar stats aleatorios
  const stats = [
    `👾 Geeks conectados: ${Math.floor(Math.random() * 9000) + 1000}`,
    `🎮 Easter Eggs encontrados: ${Math.floor(Math.random() * 9) + 1}/9`,
    `⚡ Nivel Geek: ${Math.floor(Math.random() * 100)}%`,
    `🔥 Racha actual: ${Math.floor(Math.random() * 50)} días`,
  ];

  const randomStat = stats[Math.floor(Math.random() * stats.length)];
  showNotification(randomStat, "info");

  // Agregar estilos de glitch si no existen
  if (!document.getElementById("glitch-styles")) {
    const style = document.createElement("style");
    style.id = "glitch-styles";
    style.textContent = `
      @keyframes glitch {
        0%, 100% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
      }
    `;
    document.head.appendChild(style);
  }
}

// EASTER EGG 3: PALABRAS SECRETAS (matrix, retro, thanos)
function initSecretWords() {
  // Solo funciona en el index (home)
  if (!document.body.classList.contains("home")) return;

  let typedWord = "";
  const secretWords = {
    matrix: activateMatrixRainMode,
    retro: activate8BitMode,
    thanos: activateSnapEffect,
  };

  document.addEventListener("keypress", (e) => {
    // No activar en modo Upside Down
    if (window.areEasterEggsDisabled && window.areEasterEggsDisabled()) return;
    
    // Validar que e.key existe
    if (!e.key) return;

    // Solo letras
    if (/^[a-z]$/i.test(e.key)) {
      typedWord += e.key.toLowerCase();

      // Mantener solo los últimos 10 caracteres
      if (typedWord.length > 10) {
        typedWord = typedWord.slice(-10);
      }

      // Verificar si coincide con alguna palabra secreta
      Object.keys(secretWords).forEach((word) => {
        if (typedWord.endsWith(word)) {
          secretWords[word]();
          typedWord = "";
        }
      });
    }
  });
}

// NUEVO: Efecto Matrix real (diferente del Konami)
function activateMatrixRainMode() {
  playSound("glitch");
  showNotification("🟢 MATRIX MODE: Follow the white rabbit...", "success");
  easterEggTracker.unlock("matrix");

  // Crear canvas para lluvia Matrix
  const canvas = document.createElement("canvas");
  canvas.id = "matrix-rain-canvas";
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s ease;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars =
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01";
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops = Array(Math.floor(columns)).fill(1);

  // Fade in
  setTimeout(() => (canvas.style.opacity = "0.9"), 100);

  let matrixInterval = setInterval(() => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 33);

  // Mensaje "Wake up, Neo..."
  setTimeout(() => {
    const message = document.createElement("div");
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000000;
      color: #0F0;
      font-family: 'Courier New', monospace;
      font-size: 2rem;
      text-align: center;
      text-shadow: 0 0 10px #0F0;
      opacity: 0;
      animation: fadeIn 1s ease forwards;
    `;
    message.innerHTML = `
      <div>Wake up, Neo...</div>
      <div style="font-size: 1rem; margin-top: 1rem;">The Matrix has you.</div>
    `;
    document.body.appendChild(message);

    setTimeout(() => {
      message.style.animation = "fadeOut 1s ease forwards";
      setTimeout(() => message.remove(), 1000);
    }, 3000);
  }, 2000);

  // Desactivar después de 10 segundos
  setTimeout(() => {
    canvas.style.opacity = "0";
    setTimeout(() => {
      clearInterval(matrixInterval);
      canvas.remove();
    }, 500);
  }, 10000);
}

function activate8BitMode() {
  playSound("coin");
  showNotification("🕹️ MODO RETRO 8-BIT ACTIVADO!", "info");
  easterEggTracker.unlock("retro");

  document.body.style.transition = "all 0.5s ease";
  document.body.style.imageRendering = "pixelated";
  document.body.style.filter = "contrast(1.2) saturate(1.5)";

  // Agregar efecto scanlines
  const scanlines = document.createElement("div");
  scanlines.id = "scanlines-overlay";
  scanlines.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15),
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    );
    pointer-events: none;
    z-index: 999998;
    opacity: 0;
    transition: opacity 0.5s ease;
  `;
  document.body.appendChild(scanlines);

  setTimeout(() => (scanlines.style.opacity = "0.5"), 100);

  // Desactivar después de 6 segundos
  setTimeout(() => {
    document.body.style.imageRendering = "";
    document.body.style.filter = "";
    scanlines.style.opacity = "0";
    setTimeout(() => scanlines.remove(), 500);
  }, 6000);
}

function activateSnapEffect() {
  playSound("snap");
  showNotification("💎 THANOS SNAP ACTIVADO! *chasquido*", "error");
  easterEggTracker.unlock("thanos");

  // Selectores actualizados: usar clases actuales del DOM
  const elements = document.querySelectorAll(
    "section > *, .hero-badge, .about-stat, .about-card, .feature-card, .featured-slide"
  );
  const elementsArray = Array.from(elements);

  // Seleccionar 50% aleatorio
  const toDisintegrate = elementsArray
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(elementsArray.length / 2));

  toDisintegrate.forEach((el, index) => {
    setTimeout(() => {
      el.style.transition = "all 1s ease";
      el.style.opacity = "0";
      el.style.transform = "scale(0.8) translateY(20px)";
      el.style.filter = "blur(5px)";
    }, index * 50);
  });

  // Restaurar después de 4 segundos
  setTimeout(() => {
    toDisintegrate.forEach((el) => {
      el.style.transition = "all 1s ease";
      el.style.opacity = "";
      el.style.transform = "";
      el.style.filter = "";

      setTimeout(() => {
        el.style.transition = "";
      }, 1000);
    });
  }, 4000);
}

// EASTER EGG 4: HORA ESPECÍFICA (3:33 AM) + JUMPSCARE
function initTimeEasterEgg() {
  // Solo funciona en el index (home)
  if (!document.body.classList.contains("home")) return;

  let hasTriggered = false;

  setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (((hours === 3 && minutes === 33) || (hours === 15 && minutes === 33)) && !hasTriggered) {
      hasTriggered = true;
      activateJumpScare();

      // Reset después de 2 minutos
      setTimeout(() => {
        hasTriggered = false;
      }, 120000);
    }
  }, 60000); // Verificar cada minuto
}

function activateJumpScare() {
  // console.log("🚨 JUMPSCARE ACTIVADO!");
  playSound("error");

  // Overlay negro que aparece súbitamente
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
    z-index: 99999999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
  `;
  document.body.appendChild(overlay);

  // Imagen/texto de jumpscare
  const scare = document.createElement("div");
  scare.style.cssText = `
    font-size: 10rem;
    animation: glitchScare 0.1s infinite;
    text-shadow: 0 0 30px #ff0000;
    z-index: 100000000;
  `;
  scare.textContent = "👻";
  overlay.appendChild(scare);

  // Mensaje
  const message = document.createElement("div");
  message.style.cssText = `
    position: absolute;
    bottom: 30%;
    color: #ff0000;
    font-size: 2.5rem;
    font-family: 'Courier New', monospace;
    text-align: center;
    animation: blink 0.3s infinite;
    z-index: 100000000;
    text-shadow: 0 0 10px #ff0000;
    font-weight: bold;
  `;
  message.textContent = "3:33... LA HORA DEL DIABLO";
  overlay.appendChild(message);

  // Agregar estilos de animación
  if (!document.getElementById("jumpscare-styles")) {
    const style = document.createElement("style");
    style.id = "jumpscare-styles";
    style.textContent = `
      @keyframes glitchScare {
        0% { transform: translate(0) scale(1); filter: hue-rotate(0deg); }
        20% { transform: translate(-10px, 10px) scale(1.1); filter: hue-rotate(90deg); }
        40% { transform: translate(10px, -10px) scale(0.9); filter: hue-rotate(180deg); }
        60% { transform: translate(-10px, -10px) scale(1.1); filter: hue-rotate(270deg); }
        80% { transform: translate(10px, 10px) scale(0.9); filter: hue-rotate(360deg); }
        100% { transform: translate(0) scale(1); filter: hue-rotate(0deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // Desaparecer después de 3 segundos
  setTimeout(() => {
    overlay.style.transition = "opacity 0.5s ease";
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 500);

    showNotification("⏰ ¿Te asusté? 😈 Son las 3:33... hora mágica", "error");
  }, 3000);
}

// EASTER EGG 5: CLICK EN ESQUINAS EN SECUENCIA (Desktop only)
function initCornerClicks() {
  // Solo funciona en el index (home)
  if (!document.body.classList.contains("home")) return;

  const sequence = ["top-left", "top-right", "bottom-right", "bottom-left"];
  let currentStep = 0;
  let lastClickTime = Date.now();

  document.addEventListener("click", (e) => {
    if (window.areEasterEggsDisabled?.()) return;

    // Solo en desktop (> 1024px)
    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobileDevice || window.innerWidth <= 1024) return;

    const x = e.clientX;
    const y = e.clientY;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const threshold = 120; // Área generosa para facilitar

    let corner = null;

    if (x < threshold && y < threshold) corner = "top-left";
    else if (x > w - threshold && y < threshold) corner = "top-right";
    else if (x > w - threshold && y > h - threshold) corner = "bottom-right";
    else if (x < threshold && y > h - threshold) corner = "bottom-left";

    // Reset si pasa más de 6 segundos
    if (Date.now() - lastClickTime > 6000) {
      currentStep = 0;
    }

    if (corner && corner === sequence[currentStep]) {
      currentStep++;
      lastClickTime = Date.now();

      // Feedback visual mejorado en la esquina
      const indicator = document.createElement("div");
      const cornerLabels = {
        "top-left": "↖️",
        "top-right": "↗️",
        "bottom-right": "↘️",
        "bottom-left": "↙️",
      };

      indicator.textContent = cornerLabels[corner];
      indicator.style.cssText = `
        position: fixed;
        ${corner.includes("top") ? "top: 20px" : "bottom: 20px"};
        ${corner.includes("left") ? "left: 20px" : "right: 20px"};
        font-size: 3rem;
        z-index: 10001;
        animation: pulseCorner 0.5s ease;
        pointer-events: none;
      `;
      document.body.appendChild(indicator);
      setTimeout(() => indicator.remove(), 500);

      playSound("coin");

      if (currentStep === sequence.length) {
        activateDeveloperConsole();
        easterEggTracker.unlock("corners");
        currentStep = 0;
      }
    } else if (corner) {
      // Feedback visual de error
      const errorIndicator = document.createElement("div");
      errorIndicator.textContent = "❌";
      errorIndicator.style.cssText = `
        position: fixed;
        ${corner.includes("top") ? "top: 20px" : "bottom: 20px"};
        ${corner.includes("left") ? "left: 20px" : "right: 20px"};
        font-size: 2rem;
        z-index: 10001;
        animation: pulseCorner 0.3s ease;
        pointer-events: none;
      `;
      document.body.appendChild(errorIndicator);
      setTimeout(() => errorIndicator.remove(), 300);
      currentStep = 0;
    }
  });

  // Agregar estilo de animación
  if (!document.getElementById("corner-pulse-style")) {
    const style = document.createElement("style");
    style.id = "corner-pulse-style";
    style.textContent = `
      @keyframes pulseCorner {
        0% { transform: scale(0); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.8; }
        100% { transform: scale(0); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

function activateDeveloperConsole() {
  playSound("levelup");
  showNotification("💻 ¡DEVELOPER CONSOLE DESBLOQUEADO! Revisa F12", "success");
  easterEggTracker.unlock("corners");

  console.clear();
  console.log(
    "%c🎮 SALA GEEK - DEVELOPER MODE",
    "font-size: 28px; color: #ffd166; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);"
  );
  console.log("%c════════════════════════════════════════", "color: #ffd166;");
  console.log(
    "%c¡Felicidades! Has desbloqueado el Developer Console",
    "font-size: 16px; color: #48bb78; font-weight: bold;"
  );
  console.log("%c ", "");
  console.log("%cEstadísticas del sitio:", "font-size: 14px; color: #4299e1; font-weight: bold;");
  console.table({
    "🎯 Versión": "2.0.0",
    "🎮 Easter Eggs": "9 Desktop + 6 Mobile",
    "⚡ Nivel Geek": "LEGENDARY",
    "💻 Framework": "Vanilla JS",
    "📦 Líneas de código": "~3500+",
    "🎨 Tema": "Dark/Light Mode",
  });
  console.log("%c ", "");
  console.log(
    "%c💡 ¿Quieres ver todos los Easter Eggs?",
    "font-size: 12px; color: #f6ad55; font-weight: bold;"
  );
  console.log("%cEjecuta: showAllEasterEggs()", "color: #06ffa5; font-style: italic;");
  console.log("%c════════════════════════════════════════", "color: #ffd166;");

  // Función global para mostrar todos los Easter Eggs
  window.showAllEasterEggs = function () {
    console.clear();
    console.log(
      "%c🎯 LISTA COMPLETA DE EASTER EGGS",
      "font-size: 20px; color: #ffd166; font-weight: bold;"
    );
    console.log("%c════════════════════════════════════════", "color: #ffd166;");
    console.log(
      "%c💻 DESKTOP (9 Easter Eggs):",
      "font-size: 14px; color: #4ecdc4; font-weight: bold;"
    );
    console.log("%c1. 🎮 Código Konami: ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA", "color: #fff;");
    console.log("%c2. ✨ Doble click en 'Sala Geek' del hero", "color: #fff;");
    console.log("%c3. 🟢 Escribir: 'matrix' (Matrix Rain)", "color: #fff;");
    console.log("%c4. 🕹️ Escribir: 'retro' (8-Bit Mode)", "color: #fff;");
    console.log("%c5. 💎 Escribir: 'thanos' (Snap Effect)", "color: #fff;");
    console.log("%c6. 🔲 Click en esquinas: ↖️↗️↘️↙️", "color: #fff;");
    console.log("%c7. 🖱️ Shake del mouse (mover rápido)", "color: #fff;");
    console.log("%c8. ⌨️ Ctrl + Shift + G (Geek Mode)", "color: #fff;");
    console.log("%c9. 📜 Scroll al 100% (mensaje secreto)", "color: #fff;");
    console.log("%c ", "");
    console.log(
      "%c📱 MOBILE (6 Easter Eggs):",
      "font-size: 14px; color: #ff6b6b; font-weight: bold;"
    );
    console.log("%c1. 🎮 Triple tap en 'Sala Geek'", "color: #fff;");
    console.log("%c2. ✨ Long press en email newsletter", "color: #fff;");
    console.log("%c3. 🕹️ Long press en botón 'Únete Ahora'", "color: #fff;");
    console.log("%c4. 💎 Double tap en copyright", "color: #fff;");
    console.log("%c5. ⌨️ Long press en 'Sala Geek' del footer", "color: #fff;");
    console.log("%c6. 📜 Scroll al 100% (mensaje secreto)", "color: #fff;");
    console.log("%c════════════════════════════════════════", "color: #ffd166;");
    console.log(
      "%c🏆 ¡Desbloqueálos todos para ser un DIOS GEEK!",
      "font-size: 14px; color: #06ffa5; font-weight: bold;"
    );
  };
}

// EASTER EGG 6: SHAKE DEL MOUSE (Desktop only - MEJORADO)
function initMouseShake() {
  // Solo funciona en el index (home)
  if (!document.body.classList.contains("home")) return;

  let lastX = 0;
  let lastY = 0;
  let shakeCount = 0;
  let shakeTimer = null;
  let shakeActivated = false;
  let movementHistory = [];
  const requiredShakes = 15; // Aumentado para más consistencia

  document.addEventListener("mousemove", (e) => {
    // Solo en desktop (> 1024px)
    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobileDevice || window.innerWidth <= 1024) return;

    // No activar si ya se activó
    if (shakeActivated) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    // Calcular velocidad del movimiento
    const deltaX = currentX - lastX;
    const deltaY = currentY - lastY;
    const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Solo contar movimientos rápidos (velocidad > 30px)
    if (speed > 30) {
      movementHistory.push({
        x: currentX,
        y: currentY,
        time: Date.now(),
      });

      // Mantener solo los últimos 20 movimientos
      if (movementHistory.length > 20) {
        movementHistory.shift();
      }

      // Detectar cambios de dirección (zigzag)
      if (movementHistory.length >= 3) {
        const recent = movementHistory.slice(-3);
        const dir1 = recent[1].x - recent[0].x;
        const dir2 = recent[2].x - recent[1].x;

        // Si cambia de dirección (shake/zigzag)
        if ((dir1 > 0 && dir2 < 0) || (dir1 < 0 && dir2 > 0)) {
          shakeCount++;
        }
      }

      // Activar cuando se detecten suficientes shakes en poco tiempo
      if (shakeCount >= requiredShakes) {
        const timeRange =
          movementHistory[movementHistory.length - 1].time - movementHistory[0].time;

        // Debe ser en menos de 2 segundos
        if (timeRange < 2000) {
          activateMouseDodge();
          shakeCount = 0;
          shakeActivated = true;
          movementHistory = [];
        }
      }
    }

    // Reset después de 1 segundo de inactividad
    if (shakeTimer) clearTimeout(shakeTimer);
    shakeTimer = setTimeout(() => {
      shakeCount = 0;
      movementHistory = [];
    }, 1000);

    lastX = currentX;
    lastY = currentY;
  });
}

function activateMouseDodge() {
  playSound("coin");
  showNotification("🏃 ¡Los elementos te esquivan! Mueve el mouse rápido", "success");
  easterEggTracker.unlock("shake");

  // Selectores actualizados: usar clases actuales del DOM
  const elements = document.querySelectorAll(".hero-badge, .btn, .about-stat, .about-card, .feature-card");

  elements.forEach((el) => {
    el.style.transition = "transform 0.15s ease-out";
    el.dataset.originalTransform = el.style.transform || "";
  });

  const mouseMoveHandler = (e) => {
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < 180) {
        const angle = Math.atan2(deltaY, deltaX);
        const force = Math.max(0, 180 - distance) / 2.5;
        const offsetX = -Math.cos(angle) * force;
        const offsetY = -Math.sin(angle) * force;

        el.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.05) ${el.dataset.originalTransform}`;
      } else {
        el.style.transform = el.dataset.originalTransform;
      }
    });
  };

  document.addEventListener("mousemove", mouseMoveHandler);

  // Desactivar después de 6 segundos
  setTimeout(() => {
    document.removeEventListener("mousemove", mouseMoveHandler);
    elements.forEach((el) => {
      el.style.transform = el.dataset.originalTransform;
      el.style.transition = "";
      delete el.dataset.originalTransform;
    });
    showNotification("🎯 Mouse Dodge desactivado", "info");
  }, 6000);
}

// EASTER EGG 7: COMBO DE TECLADO (Ctrl + Shift + G)
function initKeyboardCombo() {
  // Solo funciona en el index (home)
  if (!document.body.classList.contains("home")) return;

  document.addEventListener("keydown", (e) => {
    // Solo en desktop (> 1024px)
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobile || window.innerWidth <= 1024) return;

    if (e.ctrlKey && e.shiftKey && e.key === "G") {
      e.preventDefault();
      activateGeekMode();
    }
  });
}

function activateGeekMode() {
  playSound("levelup");
  showNotification("🤓 ¡GEEK MODE ACTIVADO! Terminal Hacker Style", "success");
  easterEggTracker.unlock("combo");

  // Agregar overlay de terminal mejorado
  const terminal = document.createElement("div");
  terminal.id = "geek-mode-terminal";
  terminal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0, 20, 0, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%);
    color: #00ff00;
    font-family: 'Courier New', monospace;
    padding: 2rem;
    z-index: 999999;
    overflow-y: auto;
    opacity: 0;
    transition: opacity 0.3s ease;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  `;

  const commands = [
    "$ iniciando sistema...",
    "$ autenticando credenciales geek...",
    "$ [<span style='color:#00ff00'>OK</span>] Anime Database",
    "$ [<span style='color:#00ff00'>OK</span>] Gaming News Feed",
    "$ [<span style='color:#00ff00'>OK</span>] Tech Updates Stream",
    "$ [<span style='color:#00ff00'>OK</span>] Pop Culture Monitor",
    "$ [<span style='color:#00ff00'>OK</span>] Easter Egg Tracker",
    "$ <span style='color:#ffd166'>================================</span>",
    "$ <span style='color:#06ffa5'>SALA GEEK</span> v2.0.0",
    "$ Sistema: <span style='color:#00ff00'>OPERATIONAL</span>",
    "$ Nivel Geek: <span style='color:#ff6b6b'>LEGENDARY</span>",
    "$ Easter Eggs: <span style='color:#ffd166'>15/15</span> disponibles",
    "$ Uptime: <span style='color:#4ecdc4'>∞</span> días",
    "$ <span style='color:#ffd166'>================================</span>",
    "$ <span style='color:#ff6b6b'>ACCESO COMPLETO OTORGADO</span>",
    "$ Presiona <span style='color:#ffd166'>ESC</span> para salir...",
  ];

  let output =
    "<div style='margin-bottom: 1rem; border-bottom: 2px solid #00ff00; padding-bottom: 0.5rem;'><span style='color:#ffd166'>┌─[</span><span style='color:#ff6b6b'>root</span><span style='color:#ffd166'>@</span><span style='color:#06ffa5'>sala-geek</span><span style='color:#ffd166'>]</span><br><span style='color:#ffd166'>└──╼ $</span></div>";

  commands.forEach((cmd, index) => {
    setTimeout(() => {
      output += cmd + "<br>";
      terminal.innerHTML = output;

      // Scroll automático al final
      terminal.scrollTop = terminal.scrollHeight;
    }, index * 150);
  });

  document.body.appendChild(terminal);
  setTimeout(() => (terminal.style.opacity = "1"), 100);

  const escHandler = (e) => {
    if (e.key === "Escape") {
      terminal.style.opacity = "0";
      setTimeout(() => terminal.remove(), 300);
      document.removeEventListener("keydown", escHandler);
    }
  };

  document.addEventListener("keydown", escHandler);
}

// EASTER EGG 8: FECHAS ESPECIALES CON TEMAS
function initSpecialDates() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // Mayo 4 (Star Wars Day)
  if (month === 5 && day === 4) {
    setTimeout(() => {
      showNotification("🌟 May the 4th be with you! Happy Star Wars Day!", "info");
      applyStarWarsTheme();
    }, 2000);
  }

  // Pi Day (14 marzo)
  if (month === 3 && day === 14) {
    setTimeout(() => {
      showNotification("🥧 Happy Pi Day! π = 3.14159265...", "info");
      rainPiNumbers();
      applyMathTheme();
    }, 2000);
  }

  // Halloween (31 octubre)
  if (month === 10 && day === 31) {
    setTimeout(() => {
      showNotification("🎃 Happy Halloween! Boo! 👻", "info");
      applyHalloweenTheme();
    }, 2000);
  }

  // Navidad (24-25 diciembre)
  if (month === 12 && (day === 24 || day === 25)) {
    setTimeout(() => {
      showNotification("🎄 ¡Feliz Navidad! Ho Ho Ho! 🎅", "success");
      applyChristmasTheme();
    }, 2000);
  }

  // Año Nuevo (31 dic - 1 ene) - Año dinámico
  if ((month === 12 && day === 31) || (month === 1 && day === 1)) {
    setTimeout(() => {
      const year = new Date().getFullYear();
      showNotification(`🎆 ¡Feliz Año Nuevo! ${year} 🎉`, "success");
      applyNewYearTheme();
    }, 2000);
  }
}

// TEMAS ESPECIALES

function applyStarWarsTheme() {
  console.log("🌟 Aplicando tema Star Wars");
  playSound("powerup");

  // Overlay con estrellas
  const overlay = document.createElement("div");
  overlay.id = "starwars-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(180deg, #000000 0%, #0a0a2e 100%);
    z-index: 9998;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1s ease;
  `;
  document.body.appendChild(overlay);

  setTimeout(() => (overlay.style.opacity = "0.8"), 100);

  // Estrellas de fondo
  for (let i = 0; i < 150; i++) {
    setTimeout(() => {
      const star = document.createElement("div");
      star.className = "starwars-star";
      star.style.cssText = `
        position: fixed;
        width: ${1 + Math.random() * 3}px;
        height: ${1 + Math.random() * 3}px;
        background: white;
        border-radius: 50%;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        z-index: 9999;
        pointer-events: none;
        animation: twinkle ${1 + Math.random() * 2}s infinite;
        box-shadow: 0 0 ${2 + Math.random() * 4}px white;
      `;
      document.body.appendChild(star);
    }, i * 20);
  }

  // Texto "May the 4th be with you"
  setTimeout(() => {
    const text = document.createElement("div");
    text.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #FFE81F;
      font-size: 3rem;
      font-weight: bold;
      text-align: center;
      z-index: 10000;
      text-shadow: 0 0 20px #FFE81F;
      animation: fadeIn 2s ease;
    `;
    text.textContent = "May the 4th be with you";
    document.body.appendChild(text);

    setTimeout(() => {
      text.style.animation = "fadeOut 1s ease";
      setTimeout(() => text.remove(), 1000);
    }, 4000);
  }, 1000);

  // Limpiar después de 12 segundos
  setTimeout(() => {
    overlay.style.opacity = "0";
    const stars = document.querySelectorAll(".starwars-star");
    stars.forEach((star) => star.remove());
    setTimeout(() => overlay.remove(), 1000);
  }, 12000);
}

function applyMathTheme() {
  console.log("🥧 Aplicando tema matemático");

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 209, 102, 0.1);
    z-index: 9998;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1s ease;
  `;
  document.body.appendChild(overlay);

  setTimeout(() => (overlay.style.opacity = "1"), 100);

  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 1000);
  }, 12000);
}

function applyHalloweenTheme() {
  console.log("🎃 Aplicando tema Halloween");
  playSound("error");

  // Agregar animación fall si no existe
  if (!document.getElementById("fall-animation")) {
    const style = document.createElement("style");
    style.id = "fall-animation";
    style.textContent = `
      @keyframes fall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Overlay oscuro
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 102, 0, 0.15);
    z-index: 9998;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1s ease;
  `;
  document.body.appendChild(overlay);

  setTimeout(() => (overlay.style.opacity = "1"), 100);

  // Calabazas flotantes
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const pumpkin = document.createElement("div");
      pumpkin.textContent = ["🎃", "👻", "🦇", "💀"][Math.floor(Math.random() * 4)];
      pumpkin.style.cssText = `
        position: fixed;
        font-size: ${30 + Math.random() * 40}px;
        left: ${Math.random() * 100}vw;
        top: -100px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${5 + Math.random() * 3}s linear forwards;
        filter: drop-shadow(0 0 10px orange);
      `;
      document.body.appendChild(pumpkin);
      setTimeout(() => pumpkin.remove(), 8000);
    }, i * 400);
  }

  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 1000);
  }, 12000);
}

function applyChristmasTheme() {
  console.log("🎄 Aplicando tema Navidad");
  playSound("success");

  // Agregar animación fall si no existe
  if (!document.getElementById("fall-animation")) {
    const style = document.createElement("style");
    style.id = "fall-animation";
    style.textContent = `
      @keyframes fall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Overlay azul navideño
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(135, 206, 250, 0.1);
    z-index: 9998;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1s ease;
  `;
  document.body.appendChild(overlay);

  setTimeout(() => (overlay.style.opacity = "1"), 100);

  // Nieve cayendo
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const snow = document.createElement("div");
      snow.textContent = ["❄️", "⛄", "🎄", "🎅"][
        Math.floor(Math.random() * 10) < 7 ? 0 : Math.floor(Math.random() * 4)
      ];
      snow.style.cssText = `
        position: fixed;
        font-size: ${10 + Math.random() * 25}px;
        left: ${Math.random() * 100}vw;
        top: -50px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${3 + Math.random() * 3}s linear forwards;
        opacity: ${0.6 + Math.random() * 0.4};
        filter: drop-shadow(0 0 5px white);
      `;
      document.body.appendChild(snow);
      setTimeout(() => snow.remove(), 6000);
    }, i * 80);
  }

  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 1000);
  }, 15000);
}

function applyNewYearTheme() {
  console.log("🎆 Aplicando tema Año Nuevo");
  playSound("success");

  // Overlay festivo
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(180deg, rgba(255,215,0,0.1) 0%, rgba(255,20,147,0.1) 100%);
    z-index: 9998;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1s ease;
  `;
  document.body.appendChild(overlay);

  setTimeout(() => (overlay.style.opacity = "1"), 100);

  // Fuegos artificiales
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const firework = document.createElement("div");
      firework.textContent = ["🎆", "🎇", "✨", "💥", "🎉"][Math.floor(Math.random() * 5)];
      firework.style.cssText = `
        position: fixed;
        font-size: ${40 + Math.random() * 50}px;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 60}vh;
        z-index: 9999;
        pointer-events: none;
        animation: explode 1.5s ease-out;
        filter: drop-shadow(0 0 10px gold);
      `;
      document.body.appendChild(firework);
      setTimeout(() => firework.remove(), 1500);
    }, i * 250);
  }

  // Agregar estilo de explosión
  if (!document.getElementById("explode-animation")) {
    const style = document.createElement("style");
    style.id = "explode-animation";
    style.textContent = `
      @keyframes explode {
        0% { transform: scale(0) rotate(0deg); opacity: 1; }
        50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
        100% { transform: scale(0) rotate(360deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 1000);
  }, 12000);
}

function rainPiNumbers() {
  const pi = "31415926535897932384626433832795028841971693993751";
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 999997;
    overflow: hidden;
  `;
  document.body.appendChild(container);

  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const digit = document.createElement("div");
      digit.textContent = pi[Math.floor(Math.random() * pi.length)];
      digit.style.cssText = `
        position: absolute;
        top: -50px;
        left: ${Math.random() * 100}%;
        font-size: ${20 + Math.random() * 30}px;
        color: #ffd166;
        font-weight: bold;
        animation: fall ${3 + Math.random() * 2}s linear;
        opacity: 0.8;
      `;
      container.appendChild(digit);

      setTimeout(() => digit.remove(), 5000);
    }, i * 100);
  }

  // Agregar animación de caída
  if (!document.getElementById("fall-animation")) {
    const style = document.createElement("style");
    style.id = "fall-animation";
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => container.remove(), 6000);
}

// EASTER EGG 9: SCROLL AL 100%
function initScrollSecret() {
  // Solo funciona en el index (home)
  if (!document.body.classList.contains("home")) return;

  let hasTriggered = false;

  window.addEventListener("scroll", () => {
    if (window.areEasterEggsDisabled?.()) return;
    if (hasTriggered) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const clientHeight = window.innerHeight;

    if (scrollTop + clientHeight >= scrollHeight - 10) {
      hasTriggered = true;
      revealFooterSecret();
    }
  });
}

function revealFooterSecret() {
  if (window.areEasterEggsDisabled?.()) return;

  playSound("success");
  showNotification("🎉 ¡MENSAJE SECRETO DESBLOQUEADO! Mira el footer...", "success");
  easterEggTracker.unlock("scroll");

  const footer = document.querySelector(".site-footer");
  if (footer) {
    const secret = document.createElement("div");
    secret.className = "footer-secret-message";
    secret.style.cssText = `
      text-align: center;
      padding: 1rem;
      margin-top: 1rem;
      margin-bottom: 0;
      background: linear-gradient(135deg, rgba(255, 209, 102, 0.1), rgba(239, 71, 111, 0.1));
      border-radius: 8px;
      border: 2px solid var(--accent-primary);
      animation: pulse 2s ease-in-out infinite;
      z-index: 1;
      position: relative;
    `;
    secret.innerHTML = `
      <p style="margin: 0; color: var(--accent-primary); font-weight: bold;">
        🏆 ¡FELICIDADES! Llegaste hasta el final
      </p>
      <p style="margin: 0.5rem 0 0; color: var(--text-secondary); font-size: 0.9rem;">
        Eres un verdadero geek. Sigue explorando para más secretos 🎮
      </p>
    `;

    footer.appendChild(secret);

    // Agregar animación pulse
    if (!document.getElementById("pulse-animation")) {
      const style = document.createElement("style");
      style.id = "pulse-animation";
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.8; }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// ============================================
// SISTEMA DE ACHIEVEMENT TRACKER
// ============================================
/**
 * Sistema de seguimiento de Easter Eggs
 *
 * Características:
 * - Guarda progreso en localStorage
 * - Sistema de niveles dinámico (móvil: 6 eggs, desktop: 9 eggs)
 * - Auto-hide cuando el footer es visible
 * - Animación de confetti al completar todos los eggs
 * - Responsive: muestra solo eggs disponibles según plataforma
 *
 * Easter Eggs disponibles:
 * - MÓVIL & DESKTOP: konami, logo, retro, thanos, combo, scroll (6)
 * - SOLO DESKTOP: matrix, corners, shake (3 adicionales = 9 total)
 */
const easterEggTracker = {
  // Estado de cada Easter Egg (false = bloqueado, true = desbloqueado)
  eggs: {
    konami: false, // Código Konami (↑↑↓↓←→←→BA)
    logo: false, // Long press en newsletter input (móvil) o hover en logo (desktop)
    matrix: false, // Click en Matrix Rain (desktop only)
    retro: false, // Long press en CTA button (móvil) o doble click (desktop)
    thanos: false, // Triple click en CTA button
    corners: false, // Click en las 4 esquinas (desktop only)
    shake: false, // Zigzag con el mouse (desktop only)
    combo: false, // Long press en "Sala Geek" del footer (móvil) o doble click (desktop)
    scroll: false, // Scroll hasta el final de la página
  },

  // Detección de plataforma móvil (dispositivo táctil O pantalla ≤ 1024px)
  isMobile:
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 1024,

  /**
   * Retorna el total de Easter Eggs disponibles según la plataforma
   * @returns {number} 6 para móvil/tablet, 9 para desktop
   */
  getTotalEggs() {
    // MÓVIL: 6 eggs (konami, logo, retro, thanos, combo, scroll)
    // DESKTOP: 9 eggs (todos los anteriores + matrix, corners, shake)
    return this.isMobile ? 6 : 9;
  },

  /**
   * Calcula el nivel de "Geek" basado en eggs desbloqueados
   * Sistema de progresión proporcional para mantener misma experiencia en ambas plataformas
   * @returns {Object} {name: string, min: number, max: number}
   */
  getLevel() {
    const count = this.getUnlockedCount();

    // Niveles dinámicos según plataforma (progresión % similar)
    if (this.isMobile) {
      // MÓVIL: 6 Easter Eggs totales
      const levels = [
        { name: "Novato", min: 0, max: 0 }, // 0/6 = 0%
        { name: "Explorador", min: 1, max: 1 }, // 1/6 = 16%
        { name: "Cazador", min: 2, max: 3 }, // 2-3/6 = 33-50%
        { name: "Maestro", min: 4, max: 4 }, // 4/6 = 66%
        { name: "Leyenda", min: 5, max: 5 }, // 5/6 = 83%
        { name: "Dios Geek", min: 6, max: Infinity }, // 6+/6 = 100% ✅
      ];
      return levels.find((level) => count >= level.min && count <= level.max) || levels[0];
    } else {
      // DESKTOP: 9 Easter Eggs totales
      const levels = [
        { name: "Novato", min: 0, max: 0 }, // 0/9 = 0%
        { name: "Explorador", min: 1, max: 2 }, // 1-2/9 = 11-22%
        { name: "Cazador", min: 3, max: 4 }, // 3-4/9 = 33-44%
        { name: "Maestro", min: 5, max: 6 }, // 5-6/9 = 55-66%
        { name: "Leyenda", min: 7, max: 8 }, // 7-8/9 = 77-88%
        { name: "Dios Geek", min: 9, max: Infinity }, // 9+/9 = 100% ✅
      ];
      return levels.find((level) => count >= level.min && count <= level.max) || levels[0];
    }
  },

  /**
   * Inicializa el Achievement Tracker
   * - Carga progreso guardado
   * - Oculta eggs desktop-only en móvil
   * - Configura toggle y auto-hide
   * - Registra event listeners
   * - Tracker oculto inicialmente (CSS), se muestra después del typewriter
   */
  init() {
    // Cargar progreso guardado desde localStorage
    const saved = localStorage.getItem("easterEggProgress");
    if (saved) {
      this.eggs = JSON.parse(saved);
    }

    // SIEMPRE actualizar UI al inicio (aunque no haya progreso guardado)
    this.updateUI();

    // En móvil: inyectar CSS para ocultar achievements desktop-only
    if (this.isMobile) {
      const style = document.createElement("style");
      style.id = "tracker-mobile-styles";
      style.textContent = `
        .achievement.desktop-only {
          display: none !important;
        }
      `;
      // Solo agregar si no existe ya
      if (!document.getElementById("tracker-mobile-styles")) {
        document.head.appendChild(style);
      }
    }

    // Configurar estado inicial del tracker: SIEMPRE colapsado al inicio
    const tracker = document.getElementById("easter-egg-tracker");

    if (tracker) {
      // SIEMPRE inicia colapsado, sin importar la preferencia previa
      tracker.classList.add("collapsed");
      localStorage.setItem("trackerCollapsed", "true");
    }

    // Configurar botón de toggle (expandir/colapsar)
    const toggle = document.getElementById("tracker-toggle");

    if (toggle && tracker) {
      toggle.addEventListener("click", () => {
        tracker.classList.toggle("collapsed");

        // Guardar preferencia del usuario
        const isCollapsed = tracker.classList.contains("collapsed");
        localStorage.setItem("trackerCollapsed", isCollapsed);
      });
    }

    // Reset button
    const resetBtn = document.getElementById("reset-achievements");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("¿Seguro que quieres resetear todos los logros?")) {
          this.reset();
        }
      });
    }

    // Mostrar hint flotante
    setTimeout(() => {
      if (this.getUnlockedCount() === 0) {
        this.showFloatingHint();
      }
    }, 3000);

    // Ajustar posición del tracker según scroll para no cubrir el footer
    this.initTrackerPositioning();

    // Listener de resize para actualizar detección de plataforma dinámicamente
    this.initResizeListener();
  },

  /**
   * Muestra el Achievement Tracker con animación
   * Llamado después de que termina el typewriter
   * Usa Web Animations API para compatibilidad con Android Chrome
   */
  show() {
    const tracker = document.getElementById("easter-egg-tracker");

    if (!tracker) {
      console.error("Easter Egg Tracker: elemento #easter-egg-tracker no encontrado");
      return;
    }

    // Delay de 800ms para secuencia elegante después del hero-brand
    setTimeout(() => {
      // Hacer visible el tracker
      tracker.style.visibility = "visible";
      tracker.style.display = "block";
      tracker.style.zIndex = "9999";

      // Detectar viewport móvil para animación apropiada
      const isMobileView = window.innerWidth <= 480;

      // Usar Web Animations API para animación suave y elegante
      const animation = tracker.animate(
        [
          {
            opacity: 0,
            transform: isMobileView ? "translateY(400px)" : "translateX(400px)",
          },
          {
            opacity: 1,
            transform: isMobileView ? "translateY(0)" : "translateX(0)",
          },
        ],
        {
          duration: 800, // Animación más elegante y pausada
          easing: "cubic-bezier(0.4, 0, 0.2, 1)", // Curva más suave
          fill: "forwards",
        }
      );

      // Al finalizar animación, fijar estado final
      animation.onfinish = () => {
        tracker.style.opacity = "1";
        tracker.style.transform = "translate(0, 0)";
      };

      // Fallback en caso de error: mostrar sin animación
      animation.onerror = () => {
        tracker.style.opacity = "1";
        tracker.style.transform = "translate(0, 0)";
      };
    }, 800);
  },

  /**
   * Actualiza la detección de plataforma y el UI cuando cambia el tamaño de ventana
   */
  updatePlatformDetection() {
    const wasMode = this.isMobile;

    // Re-detectar plataforma
    this.isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 1024;

    // Si cambió el modo (desktop <-> mobile)
    if (wasMode !== this.isMobile) {
      console.log(
        `📱 Cambio de plataforma detectado: ${this.isMobile ? "Mobile/Tablet (≤1024px)" : "Desktop (>1024px)"}`
      );

      // Actualizar estilos CSS para ocultar/mostrar eggs desktop-only
      const style = document.getElementById("tracker-mobile-styles");
      if (this.isMobile && !style) {
        const newStyle = document.createElement("style");
        newStyle.id = "tracker-mobile-styles";
        newStyle.textContent = `
          .achievement.desktop-only {
            display: none !important;
          }
        `;
        document.head.appendChild(newStyle);
      } else if (!this.isMobile && style) {
        style.remove();
      }

      // Actualizar UI con nuevo total de eggs
      this.updateUI();
    }
  },

  /**
   * Inicializa listener de resize para detectar cambios de plataforma
   */
  initResizeListener() {
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.updatePlatformDetection();
      }, 250); // Debounce de 250ms
    });
  },

  initTrackerPositioning() {
    const tracker = document.getElementById("easter-egg-tracker");
    if (!tracker) return;

    let isHidden = false; // Estado para evitar múltiples llamadas
    let animationInProgress = false; // Evitar animaciones simultáneas

    const adjustTrackerPosition = () => {
      const footer = document.querySelector(".site-footer");
      if (!footer || animationInProgress) return;

      const footerRect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calcular distancia del footer al viewport
      const footerDistanceFromBottom = viewportHeight - footerRect.top;

      // Si el footer está entrando al viewport
      if (footerDistanceFromBottom > 0 && !isHidden) {
        isHidden = true;
        animationInProgress = true;

        // OCULTAR tracker con animación de slide
        const isMobile = window.innerWidth <= 480;
        const hideAnimation = tracker.animate(
          [
            {
              opacity: 1,
              transform: "translate(0, 0)",
            },
            {
              opacity: 0,
              transform: isMobile ? "translateY(100px)" : "translateX(100px)",
            },
          ],
          {
            duration: 300,
            easing: "ease-out",
            fill: "forwards",
          }
        );

        hideAnimation.onfinish = () => {
          tracker.style.visibility = "hidden";
          tracker.style.pointerEvents = "none";
          animationInProgress = false;
        };
      } else if (footerDistanceFromBottom <= 0 && isHidden) {
        isHidden = false;
        animationInProgress = true;

        // MOSTRAR tracker con animación de slide
        tracker.style.visibility = "visible";
        tracker.style.pointerEvents = "auto";

        const isMobile = window.innerWidth <= 480;
        const showAnimation = tracker.animate(
          [
            {
              opacity: 0,
              transform: isMobile ? "translateY(100px)" : "translateX(100px)",
            },
            {
              opacity: 1,
              transform: "translate(0, 0)",
            },
          ],
          {
            duration: 300,
            easing: "ease-out",
            fill: "forwards",
          }
        );

        showAnimation.onfinish = () => {
          tracker.style.opacity = "1";
          tracker.style.transform = "translate(0, 0)";
          animationInProgress = false;
        };
      }
    };

    // Ajustar en scroll
    window.addEventListener("scroll", adjustTrackerPosition, { passive: true });

    // Ajustar en resize
    window.addEventListener("resize", adjustTrackerPosition);

    // Ajustar al inicio (después de que el tracker se haya mostrado)
    setTimeout(() => {
      adjustTrackerPosition();
    }, 1500);
  },

  unlock(eggName) {
    if (!this.eggs[eggName]) {
      this.eggs[eggName] = true;
      this.save();
      this.updateUI();
      this.showUnlockAnimation(eggName);

      // Solo reproducir sonido de éxito si no hay otro sonido activo
      // Esperar un poco para que termine el sonido del Easter Egg
      setTimeout(() => {
        if (!isSoundPlaying) {
          playSound("success");
        }
      }, 100);

      // La celebración se maneja en showUnlockAnimation
    }
  },

  save() {
    localStorage.setItem("easterEggProgress", JSON.stringify(this.eggs));
  },

  reset() {
    Object.keys(this.eggs).forEach((key) => {
      this.eggs[key] = false;
    });
    this.save();
    this.updateUI();
    showNotification("🔄 Logros reseteados. ¡Vuelve a cazarlos todos!", "info");
  },

  getUnlockedCount() {
    // Lista de eggs disponibles según plataforma
    const mobileEggs = ["konami", "logo", "retro", "thanos", "combo", "scroll"];
    const desktopOnlyEggs = ["matrix", "corners", "shake"];

    // Si es móvil, solo contar los eggs de mobile
    if (this.isMobile) {
      return mobileEggs.filter((eggName) => this.eggs[eggName]).length;
    } else {
      // Si es desktop, contar todos los eggs (mobile + desktop)
      return Object.values(this.eggs).filter(Boolean).length;
    }
  },

  updateUI() {
    const count = this.getUnlockedCount();
    const total = this.getTotalEggs();
    const countEl = document.getElementById("tracker-count");
    const progressBar = document.getElementById("progress-bar");
    const levelEl = document.getElementById("geek-level");

    // Actualizar contador (ahora tiene SVG + span)
    if (countEl) {
      const countSpan = countEl.querySelector("span");
      if (countSpan) {
        countSpan.textContent = `${count}/${total}`;
      } else {
        countEl.textContent = `${count}/${total}`;
      }
    }
    if (progressBar) progressBar.style.width = `${(count / total) * 100}%`;
    if (levelEl) {
      const level = this.getLevel();
      levelEl.textContent = `Nivel Geek: ${level.name}`;
    }

    // Actualizar achievements
    Object.keys(this.eggs).forEach((eggName) => {
      const achievement = document.querySelector(`[data-egg="${eggName}"]`);
      if (achievement) {
        if (this.eggs[eggName]) {
          achievement.classList.remove("locked");
          achievement.classList.add("unlocked");
        } else {
          achievement.classList.add("locked");
          achievement.classList.remove("unlocked");
        }
      }
    });
  },

  showUnlockAnimation(eggName) {
    const achievement = document.querySelector(`[data-egg="${eggName}"]`);
    if (achievement) {
      achievement.classList.add("unlocked");
    }

    // Animación sutil en el icono del tracker (sin expandir)
    const trackerIcon = document.querySelector(".tracker-icon");
    if (trackerIcon) {
      trackerIcon.style.animation = "none";
      setTimeout(() => {
        trackerIcon.style.animation = "iconSpin 0.6s ease";
      }, 10);
    }

    // Pulso en el contador
    const counter = document.getElementById("tracker-count");
    if (counter) {
      counter.style.animation = "none";
      setTimeout(() => {
        counter.style.animation = "pulseCounter 0.6s ease";
      }, 10);
    }

    // Notificación (no invasiva)
    const level = this.getLevel();
    const total = this.getTotalEggs();
    showNotification(
      `🎉 ¡Logro desbloqueado! ${this.getUnlockedCount()}/${total} - Nivel: ${level.name}`,
      "success"
    );

    // Check si completó todos (según plataforma)
    if (this.getUnlockedCount() === total) {
      setTimeout(() => this.showCompletionCelebration(), 500);
    }
  },

  /**
   * Celebración de completado - Se activa al desbloquear todos los Easter Eggs
   *
   * Efecto especial:
   * - Lluvia de confetti (100 piezas)
   * - Posicionado en viewport actual del usuario (no en top:0)
   * - Auto-cleanup después de 3 segundos
   * - Mensaje diferente según plataforma (móvil/desktop)
   *
   * Fix aplicado: position absolute + scrollY para que confetti sea visible
   * donde esté el usuario (antes estaba en top:0 y no se veía si estaba scrolleado)
   */
  showCompletionCelebration() {
    playSound("levelup");

    // Mensaje personalizado según plataforma
    const message = this.isMobile
      ? "🏆 ¡INCREÍBLE! ¡Has encontrado todos los Easter Eggs móviles! ¡Eres un DIOS GEEK! 🎮"
      : "🏆 ¡INCREÍBLE! ¡Has encontrado todos los Easter Eggs! ¡Eres un DIOS GEEK! 🎮";
    showNotification(message, "success");

    // Crear o reutilizar contenedor de confetti
    let confettiContainer = document.getElementById("confetti-container");
    if (!confettiContainer) {
      confettiContainer = document.createElement("div");
      confettiContainer.id = "confetti-container";
      document.body.appendChild(confettiContainer);
    }

    // IMPORTANTE: Posicionar en viewport ACTUAL del usuario (no en top:0)
    // Esto asegura que el confetti sea visible donde esté scrolleado
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    confettiContainer.style.cssText = `
      position: absolute;
      top: ${scrollY}px;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 99999;
      pointer-events: none;
      overflow: hidden;
    `;

    // Confetti effect - más rápido y pronunciado
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement("div");
        confetti.textContent = ["🎉", "🎊", "⭐", "🏆", "👑"][Math.floor(Math.random() * 5)];
        confetti.className = "celebration-confetti";

        const startX = Math.random() * 100;
        const duration = 1 + Math.random() * 1.5;
        const fontSize = 25 + Math.random() * 35;
        const rotation = Math.random() * 360;
        const drift = (Math.random() - 0.5) * 3;

        confetti.style.cssText = `
          position: absolute;
          left: ${startX}vw;
          top: -80px;
          font-size: ${fontSize}px;
          transform: rotate(${rotation}deg);
          pointer-events: none;
        `;

        confettiContainer.appendChild(confetti);

        // Animar con JavaScript
        let top = -80;
        let currentX = startX;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = elapsed / (duration * 1000);

          // Caída rápida con aceleración
          top = -80 + (window.innerHeight + 100) * Math.pow(progress, 1.5);
          currentX = startX + drift * progress;

          confetti.style.top = `${top}px`;
          confetti.style.left = `${currentX}vw`;
          confetti.style.transform = `rotate(${rotation + elapsed * 0.5}deg)`;

          if (top < window.innerHeight + 50 && elapsed < duration * 1000) {
            requestAnimationFrame(animate);
          } else {
            confetti.remove();
          }
        };

        requestAnimationFrame(animate);
      }, i * 30);
    }

    // Limpiar contenedor después de la animación
    setTimeout(() => {
      confettiContainer.remove();
    }, 3000);
  },

  showFloatingHint() {
    const hint = document.createElement("div");
    hint.className = "easter-egg-hint";

    // Mensaje dinámico según plataforma
    const message = this.isMobile
      ? "📱 6 secretos móviles ocultos... ¿Puedes encontrarlos todos?"
      : "🎮 9 secretos ocultos... ¿Puedes encontrarlos todos?";

    hint.textContent = message;
    document.body.appendChild(hint);

    setTimeout(() => {
      hint.style.animation = "fadeOut 0.5s ease";
      setTimeout(() => hint.remove(), 500);
    }, 8000);
  },
};

// ============================================
// EASTER EGGS MÓVILES (TOUCH-FRIENDLY)
// ============================================

function initMobileEasterEggs() {
  // Solo funciona en el index (home)
  if (!document.body.classList.contains("home")) return;

  const hero = document.querySelector(".hero");
  const mobileHeroTitle = document.querySelector(".hero-content h1");

  // console.log("📱 Inicializando Easter Eggs Mobile...");

  // 1. TRIPLE TAP/CLICK en el TÍTULO "Sala Geek" -> Konami alternativo
  let titleTapCount = 0;
  let titleTapTimer = null;

  const handleTitleTap = (e) => {
    if (window.areEasterEggsDisabled?.()) return;

    // Solo funciona en móvil/tablet (≤ 1024px)
    if (window.innerWidth > 1024) return;

    // console.log(`Tap/Click en título - width: ${window.innerWidth}, count: ${titleTapCount + 1}`);
    e.preventDefault();
    titleTapCount++;

    if (titleTapTimer) clearTimeout(titleTapTimer);

    if (titleTapCount === 3) {
      // console.log("✅ Triple tap completado! Activando NES Mode");
      activateNESMode();
      easterEggTracker.unlock("konami");
      titleTapCount = 0;
    }

    titleTapTimer = setTimeout(() => {
      titleTapCount = 0;
    }, 600);
  };

  if (mobileHeroTitle) {
    // Soporte para touch Y click (para funcionar en responsive mode)
    mobileHeroTitle.addEventListener("touchend", handleTitleTap);
    mobileHeroTitle.addEventListener("click", handleTitleTap);
  }

  // 2. LONG PRESS/HOLD en botón CTA "Únete Ahora" -> Modo 8-bit
  let ctaLongPressTimer = null;
  let ctaLongPressActivated = false;
  const ctaButton = document.querySelector(".hero-cta .btn-primary");

  const handleCtaStart = (e) => {
    if (window.innerWidth > 1024) return;

    // console.log("🔘 Long press iniciado en CTA");
    ctaLongPressActivated = false;

    // Feedback visual INMEDIATO
    ctaButton.style.transform = "scale(0.95)";
    ctaButton.style.transition = "transform 0.1s ease";

    ctaLongPressTimer = setTimeout(() => {
      // console.log("✅ Long press completado! Activando 8-bit Mode");
      ctaLongPressActivated = true;
      activate8BitMode();
      easterEggTracker.unlock("retro");

      // Feedback visual y haptic
      ctaButton.style.transform = "scale(1.1)";
      ctaButton.style.boxShadow = "0 0 20px var(--accent-primary)";
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

      setTimeout(() => {
        ctaButton.style.transform = "";
        ctaButton.style.boxShadow = "";
      }, 500);
    }, 600);
  };

  const handleCtaEnd = (e) => {
    clearTimeout(ctaLongPressTimer);
    ctaButton.style.transform = "";

    if (ctaLongPressActivated) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      ctaLongPressActivated = false;
      return false;
    }
  };

  const handleCtaMove = (e) => {
    clearTimeout(ctaLongPressTimer);
  };

  if (ctaButton) {
    // Soporte para touch
    ctaButton.addEventListener("touchstart", handleCtaStart, { passive: false });
    ctaButton.addEventListener("touchend", handleCtaEnd, { passive: false });
    ctaButton.addEventListener("touchmove", handleCtaMove);

    // Soporte para click/hold (responsive mode)
    ctaButton.addEventListener("mousedown", handleCtaStart);
    ctaButton.addEventListener("mouseup", handleCtaEnd);
    ctaButton.addEventListener("mouseleave", handleCtaEnd);

    // Prevenir click si long press fue activado
    ctaButton.addEventListener("click", (e) => {
      if (ctaLongPressActivated) {
        e.preventDefault();
        e.stopPropagation();
        ctaLongPressActivated = false;
        return false;
      }
    });
  } else {
    // console.log("❌ CTA Button NO encontrado");
  }

  // 3. LONG PRESS en email input del Newsletter -> Glitch Stats
  let newsletterLongPressTimer = null;
  // Selector actualizado: buscar en múltiples formularios de newsletter
  const newsletterInput = document.querySelector(".news-subscribe-form input[type='email']") || 
                          document.querySelector("#news-subscribe-form input[type='email']") ||
                          document.querySelector(".newsletter-form input[type='email']");

  const handleNewsletterStart = (e) => {
    if (window.innerWidth > 1024) return;

    // console.log("📧 Long press iniciado en Newsletter");
    newsletterInput.style.borderColor = "var(--accent-secondary)";
    newsletterInput.style.transform = "scale(0.98)";
    newsletterInput.style.transition = "all 0.1s ease";

    newsletterLongPressTimer = setTimeout(() => {
      // console.log("✅ Long press completado! Activando Glitch Stats");
      activateGlitchStats();
      easterEggTracker.unlock("logo");
      newsletterInput.style.borderColor = "var(--accent-primary)";
      newsletterInput.style.transform = "scale(1.02)";
      if (navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => {
        newsletterInput.style.borderColor = "";
        newsletterInput.style.transform = "";
      }, 500);
    }, 600);
  };

  const handleNewsletterEnd = () => {
    clearTimeout(newsletterLongPressTimer);
    newsletterInput.style.borderColor = "";
    newsletterInput.style.transform = "";
  };

  if (newsletterInput) {
    // Soporte para touch
    newsletterInput.addEventListener("touchstart", handleNewsletterStart);
    newsletterInput.addEventListener("touchend", handleNewsletterEnd);
    newsletterInput.addEventListener("touchmove", handleNewsletterEnd);

    // Soporte para mouse (responsive mode)
    newsletterInput.addEventListener("mousedown", handleNewsletterStart);
    newsletterInput.addEventListener("mouseup", handleNewsletterEnd);
    newsletterInput.addEventListener("mouseleave", handleNewsletterEnd);
  }

  // 4. DOBLE TAP/CLICK en copyright del footer -> Thanos Snap
  let copyrightTapCount = 0;
  let copyrightTapTimer = null;
  // Selector actualizado: usar .footer-copyright o fallback a .footer-bottom p
  const copyright = document.querySelector(".footer-copyright") || 
                    document.querySelector(".footer-bottom-left p") ||
                    document.querySelector(".footer-bottom p");

  const handleCopyrightTap = (e) => {
    if (window.areEasterEggsDisabled?.()) return;

    if (window.innerWidth > 1024) return;

    // console.log(
    //   `Tap/Click en copyright - width: ${window.innerWidth}, count: ${copyrightTapCount + 1}`
    // );
    e.preventDefault();
    copyrightTapCount++;

    if (copyrightTapTimer) clearTimeout(copyrightTapTimer);

    if (copyrightTapCount === 2) {
      console.log("✅ Doble tap completado! Activando Thanos Snap");
      activateSnapEffect();
      easterEggTracker.unlock("thanos");
      copyrightTapCount = 0;
    }

    copyrightTapTimer = setTimeout(() => {
      copyrightTapCount = 0;
    }, 500);
  };

  if (copyright) {
    // Soporte para touch Y click
    copyright.addEventListener("touchend", handleCopyrightTap);
    copyright.addEventListener("click", handleCopyrightTap);
  }

  // ============================================
  // 5. COMBO BREAKER - Long press en "Sala Geek" del footer
  // ============================================
  /**
   * Easter Egg: Combo Breaker (MÓVIL)
   *
   * Acción: Mantener presionado "Sala Geek" en el footer por 600ms
   * Efecto: Invierte colores de toda la página (modo inverso geek)
   *
   * Debugging:
   * - Espera 1s para que el footer (partial) se cargue
   * - Intenta múltiples selectores de respaldo
   * - Console logs en cada paso para diagnóstico
   * - Área de toque ampliada (12px padding/margin)
   * - Feedback visual inmediato (escala, color, borde)
   *
   * ESTADO ACTUAL: En debugging
   * - Touch detection: ✅ Funcionando
   * - Visual feedback: ✅ Funcionando
   * - Effect activation: ❌ No se activa (causa desconocida)
   * - Logs agregados para diagnóstico remoto
   */
  setTimeout(() => {
    let footerBrandLongPress = null;

    // PASO 1: Intentar selectores actualizados (estructura 2026)
    let footerBrand = document.querySelector(".footer-copyright strong") ||
                      document.querySelector(".footer-bottom-left strong") ||
                      document.querySelector(".footer-brand-name") ||
                      document.querySelector(".footer-bottom strong");

    // PASO 2: Fallback - buscar por contenido de texto
    if (!footerBrand) {
      const allStrong = document.querySelectorAll("strong");
      allStrong.forEach((el) => {
        if (el.textContent.includes("Sala Geek")) {
          footerBrand = el;
        }
      });
    }

    // LOG: Confirmar si encontramos el elemento
    console.log("🔍 Footer Brand encontrado:", footerBrand ? "✅ SÍ" : "❌ NO");

    if (footerBrand) {
      console.log("✅ Configurando Easter Egg en:", footerBrand.textContent);

      // Ampliar área de toque para móviles (12px = ~1cm en la mayoría de pantallas)
      footerBrand.style.padding = "12px";
      footerBrand.style.margin = "-12px";
      footerBrand.style.display = "inline-block";
      footerBrand.style.cursor = "pointer";
      footerBrand.style.border = "2px solid transparent"; // Cambiará a azul al tocar (debugging visual)

      /**
       * Función que activa el efecto Combo Breaker
       * Separada para mejor debugging y claridad
       */
      const activateCombo = () => {
        console.log("🎮 COMBO BREAKER ACTIVADO!");

        // Sonido y notificación
        playSound("levelup");
        easterEggTracker.unlock("combo");
        showNotification("🤓 ¡COMBO BREAKER! Modo inverso activado", "success");

        // EFECTO VISUAL: Invertir colores + rotación de matiz
        document.body.style.filter = "invert(1) hue-rotate(180deg)";
        document.body.style.transition = "filter 0.5s ease";

        // Feedback en el elemento mismo
        footerBrand.style.transform = "scale(1.3) rotate(360deg)";
        footerBrand.style.color = "#00ff00";
        footerBrand.style.textShadow = "0 0 20px #00ff00";

        // Vibración (si disponible)
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);

        // Restaurar todo después de 4 segundos
        setTimeout(() => {
          document.body.style.filter = "none";
          footerBrand.style.transform = "";
          footerBrand.style.color = "";
          footerBrand.style.textShadow = "";
        }, 4000);
      };

      // HANDLER: Long Press Start (touch o mouse)
      const handleFooterStart = (e) => {
        if (window.areEasterEggsDisabled?.()) return;

        // Solo funciona en móvil/tablet (≤ 1024px)
        if (window.innerWidth > 1024) return;

        console.log("👆 Long press iniciado en Footer - width:", window.innerWidth); // DEBUG LOG

        // Feedback visual INMEDIATO
        footerBrand.style.transform = "scale(0.95)";
        footerBrand.style.color = "var(--accent-primary)";
        footerBrand.style.border = "2px solid var(--accent-primary)";
        footerBrand.style.transition = "all 0.1s ease";

        // Iniciar temporizador de 600ms
        footerBrandLongPress = setTimeout(() => {
          console.log("✅ Long press completado! Activando Combo Breaker"); // DEBUG LOG
          activateCombo();
        }, 600);
      };

      // HANDLER: Long Press End
      const handleFooterEnd = () => {
        console.log("👆 Long press terminado"); // DEBUG LOG
        clearTimeout(footerBrandLongPress);

        // Restaurar estilos
        footerBrand.style.transform = "";
        footerBrand.style.color = "";
        footerBrand.style.border = "2px solid transparent";
      };

      // HANDLER: Touch/Mouse Move - Cancela
      const handleFooterMove = () => {
        console.log("👆 Movimiento detectado - cancelando"); // DEBUG LOG
        clearTimeout(footerBrandLongPress);
        footerBrand.style.transform = "";
        footerBrand.style.color = "";
        footerBrand.style.border = "2px solid transparent";
      };

      // EVENT: Touch events
      footerBrand.addEventListener("touchstart", handleFooterStart, { passive: true });
      footerBrand.addEventListener("touchend", handleFooterEnd, { passive: true });
      footerBrand.addEventListener("touchmove", handleFooterMove, { passive: true });

      // EVENT: Mouse events (para responsive mode)
      footerBrand.addEventListener("mousedown", handleFooterStart);
      footerBrand.addEventListener("mouseup", handleFooterEnd);
      footerBrand.addEventListener("mouseleave", handleFooterEnd);
    } else {
      console.log("❌ Footer Brand (strong) NO encontrado después de timeout");

      // Selector alternativo: toda la línea de copyright
      const footerCopyright = document.querySelector(".footer-copyright");
      if (footerCopyright) {
        console.log("✅ Usando selector alternativo: .footer-copyright");
        footerCopyright.style.cursor = "pointer";
        footerCopyright.style.userSelect = "none";

        footerCopyright.addEventListener(
          "touchstart",
          (e) => {
            footerCopyright.style.opacity = "0.7";

            footerBrandLongPress = setTimeout(() => {
              // EFECTO GEEK MODE - MUY VISIBLE
              playSound("levelup");
              easterEggTracker.unlock("combo");
              showNotification("🤓 ¡GEEK MODE ACTIVADO! Modo inverso activado", "success");

              // Efecto visual SUPER llamativo
              document.body.style.filter = "invert(1) hue-rotate(180deg)";
              document.body.style.transition = "filter 0.5s ease";

              if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);

              setTimeout(() => {
                document.body.style.filter = "none";
                footerCopyright.style.opacity = "1";
              }, 4000);
            }, 600);
          },
          { passive: true }
        );

        footerCopyright.addEventListener(
          "touchend",
          () => {
            clearTimeout(footerBrandLongPress);
            footerCopyright.style.opacity = "1";
          },
          { passive: true }
        );

        footerCopyright.addEventListener(
          "touchmove",
          () => {
            clearTimeout(footerBrandLongPress);
            footerCopyright.style.opacity = "1";
          },
          { passive: true }
        );
      }
    }
  }, 1000); // Esperar 1 segundo a que el footer se cargue

  // Notificación de ayuda móvil - SOLO en dispositivos móviles/tablet
  setTimeout(() => {
    if (window.innerWidth <= 1024) {
      showNotification("📱 Tip: Explora con taps y long press en botones!", "info");
    }
  }, 5000);
}

// Variable global para verificar el modo actual dinámicamente
function isMobileMode() {
  const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  return isMobileDevice || window.innerWidth <= 1024;
}

// INICIALIZAR TODOS LOS EASTER EGGS
function initAllEasterEggs() {
  // 🚫 NO ejecutar Easter Eggs en:
  // - Páginas legales (privacy, terms, cookies)
  // - Media Kit
  // - Modo Upside Down activo
  const isLegalPage = window.location.pathname.includes("/legal/");
  const isMediaKitPage = window.location.pathname.includes("/media-kit");
  const isUpsideDown = document.body.classList.contains("upside-down");

  if (isLegalPage || isMediaKitPage || isUpsideDown) {
    console.log(
      `🚫 Easter Eggs desactivados en: ${isLegalPage ? "página legal" : isMediaKitPage ? "Media Kit" : "modo Upside Down"}`
    );
    document.body.setAttribute("data-easter-eggs-disabled", "true");
    return;
  }

  // Helper para verificar si Easter Eggs están desactivados
  window.areEasterEggsDisabled = () => {
    const isUpsideDownActive = document.body.classList.contains("upside-down");
    return document.body.hasAttribute("data-easter-eggs-disabled") || isUpsideDownActive;
  };

  // Easter Eggs universales (siempre activos en index.html)
  initKonamiCode(); // ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA
  initSecretWords(); // matrix, retro, thanos
  initScrollSecret(); // Scroll al 100%
  initSpecialDates(); // Fechas especiales

  // Inicializar TODOS los eventos (con verificación interna de modo)
  initLogoEasterEgg(); // ✅ Doble clic en "Sala Geek" para efecto Glitch (desktop)
  initTimeEasterEgg();
  initCornerClicks();
  initMouseShake();
  initKeyboardCombo();
  initMobileEasterEggs();

  // Actualizar tracker cuando cambia el tamaño
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      easterEggTracker.updatePlatformDetection();
    }, 250);
  });

  // console.log(`🎮 Easter Eggs inicializados - Modo: ${isMobileMode() ? 'Mobile/Tablet (≤1024px)' : 'Desktop (>1024px)'}`);

  // Inicializar tracker (universal)
  easterEggTracker.init();
}

// Inicializar Easter Eggs después de que todo cargue
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initAllEasterEggs, 1000);

  // Inicializar contador de actualización de noticias
  updateNewsTime();

  // Inicializar sistema de logo estacional (Navidad)
  initSeasonalLogo();
});

/* ============================================
   📰 WEEKLY NEWS - UPDATE TIME COUNTER
   ============================================ */

/**
 * Actualiza el badge de tiempo mostrando cuándo se actualizaron las noticias
 * Muestra: "HOY", "AYER", "HACE X DÍAS"
 */
function updateNewsTime() {
  const updateTimeElement = document.getElementById("update-time");
  if (!updateTimeElement) return;

  // Fecha de última actualización (7 de noviembre de 2025)
  const lastUpdate = new Date("2025-11-07T00:00:00");
  const now = new Date();

  // Calcular diferencia en días
  const diffTime = Math.abs(now - lastUpdate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let timeText = "";

  if (diffDays === 0) {
    timeText = "HOY";
  } else if (diffDays === 1) {
    timeText = "AYER";
  } else if (diffDays <= 7) {
    timeText = `HACE ${diffDays} DÍAS`;
  } else {
    timeText = "SEMANALMENTE";
  }

  updateTimeElement.textContent = timeText;

  // Actualizar cada hora
  setTimeout(updateNewsTime, 3600000);
}

/* ============================================
   📰 BLOG - FILTRADO Y PAGINACIÓN
   ============================================ */

/**
 * Sistema de filtrado por categorías y paginación para el blog
 * Funcionalidades:
 * - Filtrado dinámico por categorías
 * - Paginación con 6 artículos por página
 * - Animaciones de transición
 * - Estado en URL para compartir filtros
 */
const BlogFilterSystem = {
  // Configuración
  articlesPerPage: 6,
  currentPage: 1,
  currentCategory: 'all',
  isInitialized: false,
  
  // Carrusel de destacados
  carousel: {
    section: null,
    track: null,
    dots: null,
    prevBtn: null,
    nextBtn: null,
    currentSlide: 0,
    featuredArticles: [],
    autoplayInterval: null
  },
  
  // Elementos del DOM
  elements: {
    grid: null,
    filters: null,
    pagination: null,
    paginationNumbers: null,
    prevBtn: null,
    nextBtn: null,
    visibleCount: null,
    totalCount: null,
    noResults: null
  },

  /**
   * Inicializar el sistema de filtrado
   */
  init() {
    // Solo ejecutar en la página del blog
    if (!document.body.classList.contains('blog-page')) {
      console.log('BlogFilterSystem: No es página de blog, saltando inicialización');
      return;
    }

    // Evitar doble inicialización
    if (this.isInitialized) {
      console.log('BlogFilterSystem: Ya inicializado');
      return;
    }

    console.log('BlogFilterSystem: Iniciando...');

    // Obtener elementos del DOM
    this.elements.grid = document.getElementById('articles-grid');
    this.elements.filters = document.getElementById('category-filters');
    this.elements.pagination = document.getElementById('pagination');
    this.elements.paginationNumbers = document.getElementById('pagination-numbers');
    this.elements.prevBtn = document.getElementById('prev-page');
    this.elements.nextBtn = document.getElementById('next-page');
    this.elements.visibleCount = document.getElementById('visible-count');
    this.elements.totalCount = document.getElementById('total-count');
    this.elements.noResults = document.getElementById('no-results');
    
    // Elementos del carrusel
    this.carousel.section = document.getElementById('featured-carousel-section');
    this.carousel.track = document.getElementById('featured-carousel-track');
    this.carousel.dots = document.getElementById('carousel-dots');

    // Verificar que los elementos críticos existan
    if (!this.elements.grid) {
      console.error('BlogFilterSystem: No se encontró #articles-grid');
      return;
    }
    
    if (!this.elements.filters) {
      console.error('BlogFilterSystem: No se encontró #category-filters');
      return;
    }

    console.log('BlogFilterSystem: Elementos encontrados');
    
    // Inicializar carrusel de destacados
    this.initFeaturedCarousel();

    // Obtener parámetros de URL
    this.parseURLParams();

    // Configurar event listeners
    this.setupEventListeners();

    // Marcar grid como inicializado por JS (para CSS)
    this.elements.grid.classList.add('js-initialized');

    // Renderizar estado inicial
    this.filterArticles(this.currentCategory);
    
    this.isInitialized = true;
    console.log('BlogFilterSystem: Inicialización completa');
  },
  
  /**
   * Inicializar carrusel de artículos destacados
   */
  initFeaturedCarousel() {
    if (!this.carousel.section || !this.carousel.track) {
      console.log('BlogFilterSystem: Carrusel no encontrado');
      return;
    }
    
    // Si el carrusel ya tiene slides generados por el blog (featured-slide), no interferir
    const blogFeaturedSlides = this.carousel.track.querySelectorAll('.featured-slide');
    if (blogFeaturedSlides.length > 0) {
      console.log('BlogFilterSystem: Carrusel del blog detectado, no interferir');
      this.carousel.section.classList.remove('hidden');
      return;
    }
    
    // Encontrar todos los artículos destacados en el grid
    const featuredArticles = Array.from(
      this.elements.grid.querySelectorAll('.article-card[data-featured="true"]')
    );
    
    if (featuredArticles.length === 0) {
      this.carousel.section.classList.add('hidden');
      return;
    }
    
    console.log('BlogFilterSystem: Artículos destacados encontrados:', featuredArticles.length);
    
    // Guardar referencia a los artículos destacados (los originales)
    this.carousel.featuredArticles = featuredArticles;
    
    // Guardar la posición original de cada destacado para poder restaurarlos
    this.carousel.originalPositions = featuredArticles.map(article => ({
      article,
      nextSibling: article.nextElementSibling
    }));
    
    // MOVER artículos destacados al carrusel (no clonar)
    featuredArticles.forEach(article => {
      // Limpiar cualquier estilo inline previo
      article.style.display = '';
      article.style.opacity = '';
      article.style.transform = '';
      article.style.visibility = '';
      article.classList.remove('filtering', 'filtering-out', 'fade-in');
      article.classList.add('in-carousel');
      this.carousel.track.appendChild(article);
    });
    
    // Configurar dimensiones del carrusel
    this.setupCarouselDimensions();
    
    // Crear dots de navegación
    this.createCarouselDots(featuredArticles.length);
    
    // Configurar botones de navegación
    this.setupCarouselNavigation();
    
    // Ocultar navegación si solo hay un destacado
    const navContainer = document.getElementById('carousel-nav');
    if (navContainer && featuredArticles.length <= 1) {
      navContainer.style.display = 'none';
    }
    
    // Iniciar autoplay (cambiar cada 6 segundos)
    this.startCarouselAutoplay();
  },
  
  /**
   * Mover destacados al carrusel (cuando filtro es "Todos")
   */
  moveFeaturedToCarousel() {
    if (!this.carousel.track || !this.carousel.featuredArticles) return;
    
    this.carousel.featuredArticles.forEach(article => {
      // Limpiar estilos y clases de animación del grid
      article.style.display = '';
      article.style.opacity = '';
      article.style.transform = '';
      article.style.visibility = '';
      article.classList.remove('filtering', 'filtering-out', 'fade-in');
      article.classList.add('in-carousel');
      this.carousel.track.appendChild(article);
    });
    
    // Re-configurar dimensiones después de mover
    this.setupCarouselDimensions();
  },
  
  /**
   * Devolver destacados al grid (cuando se filtra por categoría)
   */
  moveFeaturedToGrid() {
    if (!this.carousel.originalPositions) return;
    
    this.carousel.originalPositions.forEach(({ article, nextSibling }) => {
      article.classList.remove('in-carousel');
      // Limpiar estilos inline del carrusel
      article.style.width = '';
      article.style.flex = '';
      
      // Restaurar a posición original
      if (nextSibling && nextSibling.parentNode === this.elements.grid) {
        this.elements.grid.insertBefore(article, nextSibling);
      } else {
        // Si no hay siguiente, agregar al principio del grid
        this.elements.grid.insertBefore(article, this.elements.grid.firstChild);
      }
    });
  },
  
  /**
   * Configurar dimensiones del carrusel dinámicamente
   */
  setupCarouselDimensions() {
    if (!this.carousel.track || !this.carousel.featuredArticles) return;
    
    const count = this.carousel.featuredArticles.length;
    if (count === 0) return;
    
    // El track debe tener ancho = 100% * número de slides
    this.carousel.track.style.width = `${count * 100}%`;
    
    // Cada card debe tener ancho = 100% / número de slides (para ocupar su espacio)
    const cardWidth = 100 / count;
    this.carousel.featuredArticles.forEach(article => {
      article.style.width = `${cardWidth}%`;
      article.style.flex = `0 0 ${cardWidth}%`;
    });
    
    console.log(`BlogFilterSystem: Carrusel configurado - ${count} slides, track: ${count * 100}%, cards: ${cardWidth}%`);
  },
  
  /**
   * Crear dots de navegación del carrusel
   */
  createCarouselDots(count) {
    if (!this.carousel.dots) return;
    
    this.carousel.dots.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Ir al artículo ${i + 1}`);
      dot.addEventListener('click', () => this.goToSlide(i));
      this.carousel.dots.appendChild(dot);
    }
  },
  
  /**
   * Configurar navegación del carrusel
   */
  setupCarouselNavigation() {
    const prevBtn = this.carousel.section.querySelector('.carousel-prev');
    const nextBtn = this.carousel.section.querySelector('.carousel-next');
    
    if (prevBtn) {
      this.carousel.prevBtn = prevBtn;
      prevBtn.addEventListener('click', () => this.prevSlide());
    }
    
    if (nextBtn) {
      this.carousel.nextBtn = nextBtn;
      nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    // Touch/swipe support
    let startX = 0;
    let endX = 0;
    
    this.carousel.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      this.stopCarouselAutoplay();
    }, { passive: true });
    
    this.carousel.track.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
      
      this.startCarouselAutoplay();
    }, { passive: true });
    
    // Pausar autoplay al hover
    this.carousel.section.addEventListener('mouseenter', () => this.stopCarouselAutoplay());
    this.carousel.section.addEventListener('mouseleave', () => this.startCarouselAutoplay());
  },
  
  /**
   * Ir al slide anterior
   */
  prevSlide() {
    const total = this.carousel.featuredArticles.length;
    this.carousel.currentSlide = (this.carousel.currentSlide - 1 + total) % total;
    this.updateCarousel();
  },
  
  /**
   * Ir al siguiente slide
   */
  nextSlide() {
    const total = this.carousel.featuredArticles.length;
    this.carousel.currentSlide = (this.carousel.currentSlide + 1) % total;
    this.updateCarousel();
  },
  
  /**
   * Ir a un slide específico
   */
  goToSlide(index) {
    this.carousel.currentSlide = index;
    this.updateCarousel();
  },
  
  /**
   * Actualizar posición del carrusel
   */
  updateCarousel() {
    if (!this.carousel.track || !this.carousel.featuredArticles) return;
    
    const count = this.carousel.featuredArticles.length;
    // Cada slide ocupa (100 / count)% del track
    // Para ir al slide N, movemos N * (100 / count)% hacia la izquierda
    const slideWidth = 100 / count;
    const offset = -this.carousel.currentSlide * slideWidth;
    this.carousel.track.style.transform = `translateX(${offset}%)`;
    
    // Actualizar dots
    const dots = this.carousel.dots?.querySelectorAll('.carousel-dot');
    dots?.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.carousel.currentSlide);
    });
    
    // Actualizar estado de botones
    this.updateCarouselButtons();
  },
  
  /**
   * Actualizar estado de botones prev/next
   */
  updateCarouselButtons() {
    // En modo circular, los botones siempre están habilitados
    // Si quisieras modo lineal, descomenta:
    // if (this.carousel.prevBtn) {
    //   this.carousel.prevBtn.disabled = this.carousel.currentSlide === 0;
    // }
    // if (this.carousel.nextBtn) {
    //   this.carousel.nextBtn.disabled = this.carousel.currentSlide === this.carousel.featuredArticles.length - 1;
    // }
  },
  
  /**
   * Iniciar autoplay del carrusel
   */
  startCarouselAutoplay() {
    if (this.carousel.featuredArticles.length <= 1) return;
    
    this.stopCarouselAutoplay();
    this.carousel.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, 6000);
  },
  
  /**
   * Detener autoplay del carrusel
   */
  stopCarouselAutoplay() {
    if (this.carousel.autoplayInterval) {
      clearInterval(this.carousel.autoplayInterval);
      this.carousel.autoplayInterval = null;
    }
  },
  
  /**
   * Mostrar/ocultar carrusel según el filtro
   * También mueve los artículos destacados entre carrusel y grid
   */
  toggleCarousel(show) {
    if (!this.carousel.section) return;
    
    // Si el carrusel tiene slides del blog (.featured-slide), solo mostrar/ocultar
    const blogSlides = this.carousel.track?.querySelectorAll('.featured-slide');
    if (blogSlides && blogSlides.length > 0) {
      if (show) {
        this.carousel.section.classList.remove('hidden');
      } else {
        this.carousel.section.classList.add('hidden');
      }
      return;
    }
    
    // Sistema original para el landing page
    if (!this.carousel.featuredArticles) return;
    
    if (show && this.carousel.featuredArticles.length > 0) {
      // Mostrar carrusel y mover destacados al carrusel
      this.moveFeaturedToCarousel();
      this.carousel.section.classList.remove('hidden');
      this.carousel.currentSlide = 0;
      this.updateCarousel();
      this.startCarouselAutoplay();
    } else {
      // Ocultar carrusel y devolver destacados al grid
      this.carousel.section.classList.add('hidden');
      this.stopCarouselAutoplay();
      this.moveFeaturedToGrid();
    }
  },

  /**
   * Parsear parámetros de la URL para mantener estado
   */
  parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('categoria');
    const page = parseInt(params.get('pagina')) || 1;

    if (category && this.isValidCategory(category)) {
      this.currentCategory = category;
    }
    this.currentPage = page;
  },

  /**
   * Verificar si una categoría es válida
   */
  isValidCategory(category) {
    const validCategories = ['all', 'peliculas', 'series', 'anime', 'gaming', 'tecnologia'];
    return validCategories.includes(category);
  },

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Filtros de categoría - usar event delegation
    this.elements.filters.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (pill && pill.dataset.category) {
        e.preventDefault();
        const category = pill.dataset.category;
        console.log('BlogFilterSystem: Filtro clickeado -', category);
        this.filterArticles(category);
      }
    });

    // Botones de paginación
    if (this.elements.prevBtn) {
      this.elements.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToPage(this.currentPage - 1);
      });
    }
    
    if (this.elements.nextBtn) {
      this.elements.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToPage(this.currentPage + 1);
      });
    }

    // Números de página - event delegation
    if (this.elements.paginationNumbers) {
      this.elements.paginationNumbers.addEventListener('click', (e) => {
        const pageBtn = e.target.closest('.page-number');
        if (pageBtn && pageBtn.dataset.page) {
          e.preventDefault();
          const page = parseInt(pageBtn.dataset.page);
          this.goToPage(page);
        }
      });
    }
  },

  /**
   * Filtrar artículos por categoría
   */
  filterArticles(category) {
    console.log('BlogFilterSystem: Filtrando por categoría -', category);
    
    this.currentCategory = category;
    this.currentPage = 1;

    // Actualizar estado de los filtros
    this.updateFilterState();

    // Toggle clase 'filtered' en el grid (para CSS del destacado)
    // Toggle carrusel de destacados
    if (category === 'all') {
      this.elements.grid.classList.remove('filtered');
      this.toggleCarousel(true); // Mostrar carrusel
    } else {
      this.elements.grid.classList.add('filtered');
      this.toggleCarousel(false); // Ocultar carrusel
    }

    // Obtener artículos filtrados (excluyendo destacados si es "todos")
    const allArticles = this.getAllArticles();
    const filteredArticles = this.getFilteredArticles(allArticles, category);

    console.log('BlogFilterSystem: Total artículos:', allArticles.length, '| Filtrados:', filteredArticles.length);

    // Actualizar visibilidad y paginación
    this.updateArticlesVisibility(filteredArticles);
    this.updatePagination(filteredArticles.length);
    this.updateCounts(filteredArticles.length);
    this.updateURL();

    // Mostrar mensaje si no hay resultados
    this.toggleNoResults(filteredArticles.length === 0);

    // Scroll suave al grid solo cuando se filtra por categoría específica (no "Todos")
    if (category !== 'all') {
      const gridRect = this.elements.grid.getBoundingClientRect();
      if (gridRect.top < 0 || gridRect.top > window.innerHeight * 0.5) {
        const gridTop = this.elements.grid.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: gridTop, behavior: 'smooth' });
      }
    }
  },

  /**
   * Obtener todos los artículos del grid
   * Nota: Los destacados siempre se incluyen aquí, el filtrado determina cuáles mostrar
   */
  getAllArticles() {
    return Array.from(this.elements.grid.querySelectorAll('.article-card'));
  },
  
  /**
   * Obtener artículos NO destacados del grid
   */
  getNonFeaturedArticles() {
    return Array.from(this.elements.grid.querySelectorAll('.article-card:not([data-featured="true"])'));
  },
  
  /**
   * Obtener artículos destacados del grid
   */
  getFeaturedArticles() {
    return Array.from(this.elements.grid.querySelectorAll('.article-card[data-featured="true"]'));
  },

  /**
   * Obtener artículos filtrados por categoría
   * Cuando es "todos", excluye destacados (están en el carrusel)
   * Cuando es categoría específica, incluye destacados de esa categoría
   */
  getFilteredArticles(articles, category) {
    if (category === 'all') {
      // Excluir destacados - están en el carrusel
      return articles.filter(article => article.dataset.featured !== 'true');
    }
    // Filtrar por categoría (incluye destacados de esa categoría)
    return articles.filter(article => article.dataset.category === category);
  },

  /**
   * Actualizar visibilidad de artículos con paginación
   * Animación suave: primero sale lo viejo, luego entra lo nuevo
   */
  updateArticlesVisibility(filteredArticles) {
    const allArticles = this.getAllArticles();
    const start = (this.currentPage - 1) * this.articlesPerPage;
    const end = start + this.articlesPerPage;
    const articlesToShow = filteredArticles.slice(start, end);
    
    // Marcar grid como en transición
    this.elements.grid.classList.add('is-transitioning');

    // Paso 1: Animar salida de artículos visibles
    const visibleArticles = allArticles.filter(article => 
      article.style.display !== 'none' && article.classList.contains('fade-in')
    );
    
    visibleArticles.forEach(article => {
      article.classList.remove('fade-in');
      article.classList.add('filtering-out');
    });

    // Paso 2: Después de la animación de salida, ocultar y mostrar nuevos
    const exitDuration = visibleArticles.length > 0 ? 200 : 0;
    
    setTimeout(() => {
      // Ocultar todos y limpiar clases
      allArticles.forEach(article => {
        article.style.display = 'none';
        article.classList.remove('fade-in', 'filtering', 'filtering-out');
      });

      // Paso 3: Mostrar artículos nuevos con animación de entrada
      articlesToShow.forEach((article, index) => {
        article.style.display = 'block';
        article.classList.add('filtering');
        
        // Forzar reflow para que la transición funcione
        article.offsetHeight;
        
        // Animación escalonada de entrada (más suave)
        requestAnimationFrame(() => {
          setTimeout(() => {
            article.classList.remove('filtering');
            article.classList.add('fade-in');
          }, index * 50);
        });
      });

      // Quitar clase de transición después de que terminen las animaciones
      setTimeout(() => {
        this.elements.grid.classList.remove('is-transitioning');
      }, articlesToShow.length * 50 + 350);

      console.log('BlogFilterSystem: Mostrando artículos', start + 1, '-', start + articlesToShow.length);
    }, exitDuration);
  },

  /**
   * Actualizar estado visual de los filtros
   */
  updateFilterState() {
    const pills = this.elements.filters.querySelectorAll('.pill');
    pills.forEach(pill => {
      const isActive = pill.dataset.category === this.currentCategory;
      pill.classList.toggle('active', isActive);
    });
  },

  /**
   * Actualizar paginación
   */
  updatePagination(totalFilteredArticles) {
    const totalPages = Math.ceil(totalFilteredArticles / this.articlesPerPage);

    console.log('BlogFilterSystem: Páginas totales:', totalPages, '| Página actual:', this.currentPage);

    // Ocultar paginación si solo hay una página o ningún artículo
    if (this.elements.pagination) {
      this.elements.pagination.style.display = totalPages <= 1 ? 'none' : 'flex';
    }

    // Actualizar botones prev/next
    if (this.elements.prevBtn) {
      this.elements.prevBtn.disabled = this.currentPage <= 1;
    }
    if (this.elements.nextBtn) {
      this.elements.nextBtn.disabled = this.currentPage >= totalPages;
    }

    // Generar números de página
    this.renderPageNumbers(totalPages);
  },

  /**
   * Renderizar números de página
   */
  renderPageNumbers(totalPages) {
    if (!this.elements.paginationNumbers || totalPages === 0) return;

    let html = '';
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    // Ajustar inicio si estamos cerca del final
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    // Primera página si no está visible
    if (start > 1) {
      html += `<button type="button" class="page-number" data-page="1">1</button>`;
      if (start > 2) {
        html += `<span class="page-ellipsis">...</span>`;
      }
    }

    // Páginas visibles
    for (let i = start; i <= end; i++) {
      const isActive = i === this.currentPage ? 'active' : '';
      html += `<button type="button" class="page-number ${isActive}" data-page="${i}">${i}</button>`;
    }

    // Última página si no está visible
    if (end < totalPages) {
      if (end < totalPages - 1) {
        html += `<span class="page-ellipsis">...</span>`;
      }
      html += `<button type="button" class="page-number" data-page="${totalPages}">${totalPages}</button>`;
    }

    this.elements.paginationNumbers.innerHTML = html;
  },

  /**
   * Ir a una página específica
   */
  goToPage(page) {
    const filteredArticles = this.getFilteredArticles(this.getAllArticles(), this.currentCategory);
    const totalPages = Math.ceil(filteredArticles.length / this.articlesPerPage);

    if (page < 1 || page > totalPages) return;

    console.log('BlogFilterSystem: Navegando a página', page);

    this.currentPage = page;
    this.updateArticlesVisibility(filteredArticles);
    this.updatePagination(filteredArticles.length);
    this.updateCounts(filteredArticles.length);
    this.updateURL();

    // Scroll suave a la sección de artículos
    const gridTop = this.elements.grid.getBoundingClientRect().top + window.pageYOffset - 100;
    window.scrollTo({ top: gridTop, behavior: 'smooth' });
  },

  /**
   * Actualizar contadores
   */
  updateCounts(totalFiltered) {
    const start = (this.currentPage - 1) * this.articlesPerPage;
    const currentPageCount = Math.min(this.articlesPerPage, totalFiltered - start);
    
    if (this.elements.visibleCount) {
      this.elements.visibleCount.textContent = currentPageCount > 0 ? currentPageCount : 0;
    }
    if (this.elements.totalCount) {
      this.elements.totalCount.textContent = totalFiltered;
    }
  },

  /**
   * Actualizar URL con parámetros de estado
   */
  updateURL() {
    const params = new URLSearchParams();
    
    if (this.currentCategory !== 'all') {
      params.set('categoria', this.currentCategory);
    }
    if (this.currentPage > 1) {
      params.set('pagina', this.currentPage);
    }

    const newURL = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newURL);
  },

  /**
   * Mostrar/ocultar mensaje de sin resultados
   */
  toggleNoResults(show) {
    if (this.elements.noResults) {
      this.elements.noResults.style.display = show ? 'flex' : 'none';
    }
    // Ocultar el grid si no hay resultados
    if (this.elements.grid) {
      this.elements.grid.style.display = show ? 'none' : 'grid';
    }
  }
};

// NOTA: BlogFilterSystem DESHABILITADO - Ahora usamos BlogEngine de blog-engine.js
// El sistema dinámico de blog-engine.js maneja filtros, paginación y carrusel
// document.addEventListener('DOMContentLoaded', () => {
//   if (document.body.classList.contains('blog-page')) {
//     setTimeout(() => {
//       BlogFilterSystem.init();
//     }, 150);
//   }
// });
