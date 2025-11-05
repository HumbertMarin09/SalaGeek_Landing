/* ============================================
   SALA GEEK - MAIN JAVASCRIPT
   Version: 1.69.0
   Description: Hero brand aparece después de typewriter animation
   Last Modified: 2025-11-03
   ============================================ */

/* ============================================
   UTILIDADES GLOBALES
   ============================================ */

// Estado responsivo
const responsiveState = {
  isMobile: window.innerWidth <= 768,
  isTablet: window.innerWidth > 768 && window.innerWidth <= 968,
  isDesktop: window.innerWidth > 968,
};

/* ============================================
   THEME SWITCHER
   ============================================ */

/**
 * Inicializa el sistema de cambio de tema (claro/oscuro)
 */
// Tema oscuro permanente - modo claro eliminado
function initDarkMode() {
  // Forzar modo oscuro siempre
  document.documentElement.setAttribute("data-theme", "dark");
  // Limpiar cualquier preferencia guardada del modo claro
  localStorage.removeItem("sg_theme");
}

// Actualizar estado responsivo
function updateResponsiveState() {
  responsiveState.isMobile = window.innerWidth <= 768;
  responsiveState.isTablet =
    window.innerWidth > 768 && window.innerWidth <= 968;
  responsiveState.isDesktop = window.innerWidth > 968;
}

// Inicializar manejador responsivo
function initResponsiveHandler() {
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateResponsiveState();

      // Cerrar el menú móvil si se cambia a desktop
      if (responsiveState.isDesktop) {
        const nav = document.querySelector(".main-nav");
        const toggle = document.querySelector(".nav-toggle");
        const searchDropdown = document.querySelector(".search-dropdown");

        if (nav && nav.classList.contains("open")) {
          nav.classList.remove("open");
          toggle?.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        }

        if (searchDropdown && searchDropdown.classList.contains("active")) {
          searchDropdown.classList.remove("active");
        }
      }
    }, 150);
  });
}

/* ============================================
   CARGA DE PARTIALS (HEADER Y FOOTER)
   ============================================ */

/**
 * Carga un partial HTML de forma dinámica con cache-busting
 * @param {string} selector - Selector CSS del elemento donde inyectar el HTML
 * @param {string} path - Ruta al archivo HTML a cargar
 * @returns {Promise<boolean>} - True si se cargó exitosamente
 */
async function loadPartial(selector, path) {
  try {
    const timestamp = Date.now();
    const response = await fetch(`${path}?v=${timestamp}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
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
    console.error(`Error loading partial ${path}:`, error);
    return false;
  }
}

async function loadIncludes() {
  try {
    await Promise.all([
      loadPartial("#header-placeholder", "/src/pages/partials/header.html"),
      loadPartial("#footer-placeholder", "/src/pages/partials/footer.html"),
    ]);

    // Actualizar año en el footer
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }

    // Inicializar navegación después de cargar el header
    initNavigation();
  } catch (error) {
    console.error("Error loading includes:", error);
  }
}

/* ============================================
   NAVEGACIÓN
   ============================================ */

/**
 * Inicializa la navegación principal con menú móvil y scroll activo
 */
function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  const menuLinks = document.querySelectorAll(".menu a");

  if (!toggle || !nav) {
    console.warn("Navigation elements not found");
    return;
  }

  // Toggle del menú móvil con mejoras de accesibilidad
  const toggleMenu = () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen.toString());

    // Prevenir scroll del body cuando el menú está abierto
    document.body.style.overflow = isOpen ? "hidden" : "";

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
          }

          // Scroll suave al elemento
          const headerOffset = 100; // Altura del header sticky
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

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
    if (
      nav.classList.contains("open") &&
      !nav.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
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

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
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
      { passive: true },
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
   BUSCADOR
   ============================================ */

function initSearch() {
  const searchToggle = document.querySelector(".search-toggle");
  const searchDropdown = document.querySelector(".search-dropdown");
  const searchInput = document.querySelector(".search-input");
  const searchSubmit = document.querySelector(".search-submit");

  if (!searchToggle || !searchDropdown || !searchInput) return;

  // Toggle del dropdown de búsqueda
  searchToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    searchDropdown.classList.toggle("active");

    if (searchDropdown.classList.contains("active")) {
      // Enfocar el input cuando se abre
      setTimeout(() => searchInput.focus(), 100);
    }
  });

  // Cerrar al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (
      !searchDropdown.contains(e.target) &&
      !searchToggle.contains(e.target)
    ) {
      searchDropdown.classList.remove("active");
    }
  });

  // Manejar el submit de búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();

    if (query) {
      // Por ahora solo mostramos una notificación
      // Aquí puedes integrar con tu sistema de búsqueda real
      showNotification(`Buscando: "${query}"`, "info");

      // Cerrar el dropdown
      searchDropdown.classList.remove("active");

      // Limpiar el input
      searchInput.value = "";

      // En un caso real, aquí harías la búsqueda o redirigirías a una página de resultados
      // window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  // Submit al hacer clic en el botón
  if (searchSubmit) {
    searchSubmit.addEventListener("click", handleSearch);
  }

  // Submit con Enter
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  });

  // Cerrar con Escape
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchDropdown.classList.remove("active");
    }
  });
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
      },
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
    },
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
  const statNumbers = document.querySelectorAll(
    ".about-stat-number[data-count]",
  );

  if (statNumbers.length === 0) return;

  let hasAnimated = false;

  // Función de easing para animación suave (easeOutCubic)
  // Desacelera suavemente sin freno evidente - Usado en Material Design
  const easeOutCubic = (t) => {
    return 1 - Math.pow(1 - t, 3);
  };

  // Función para animar un contador individual
  const animateCounter = (element) => {
    const target = parseInt(element.getAttribute("data-count"));
    const suffix = element.getAttribute("data-suffix") || "";
    const duration = 2500; // 2.5 segundos (timing óptimo)
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentValue = Math.floor(easedProgress * target);

      // Actualizar el texto
      element.textContent = currentValue + suffix;

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
    threshold: 0.3, // Activar cuando 30% sea visible
    rootMargin: "0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;

        // Animar cada contador con un pequeño delay
        statNumbers.forEach((stat, index) => {
          setTimeout(() => {
            animateCounter(stat);
          }, index * 150); // 150ms de delay entre cada uno (más escalonado)
        });

        // Dejar de observar después de animar
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
  const duration = 1500; // 1.5 segundos (más rápido y fluido)
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
            heroBrand.style.transition = "opacity 0.6s ease, transform 0.6s ease";
            heroBrand.style.opacity = "1";
            heroBrand.style.transform = "translateY(0)";
          }
        }, 200);
      }
    }, charDuration);
  }, 500); // Delay inicial

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

  // Easter egg: Efecto especial al hacer triple click en "Sala Geek"
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
}

/* ============================================
   TESTIMONIALS CAROUSEL
   ============================================ */

function initTestimonialsCarousel() {
  const track = document.querySelector(".carousel-track");
  const cards = document.querySelectorAll(".testimonial-card");
  const prevBtn = document.querySelector(".carousel-prev");
  const nextBtn = document.querySelector(".carousel-next");
  const indicators = document.querySelectorAll(
    ".carousel-indicators .indicator",
  );

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
      showNewsletterMessage(
        "Por favor, ingresa un correo electrónico válido",
        "error",
      );
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
      // Enviar a Netlify Function que conecta con Mailchimp
      const response = await fetch("/.netlify/functions/mailchimp-subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Éxito
        showNewsletterMessage(
          data.message || "¡Gracias por suscribirte! Revisa tu correo para el mensaje de bienvenida.",
          "success",
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
        "error",
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
   NOTIFICACIONES
   ============================================ */

function showNotification(message, type = "info") {
  // Definir el color según el tipo
  let background;
  switch (type) {
    case "success":
      background = "linear-gradient(135deg, #48bb78 0%, #38a169 100%)";
      break;
    case "error":
      background = "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)";
      break;
    case "info":
    default:
      background = "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)";
      break;
  }

  // Crear elemento de notificación
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 120px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${background};
    color: white;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 400px;
    animation: slideInRight 0.3s ease;
    font-weight: 500;
  `;

  notification.textContent = message;
  document.body.appendChild(notification);

  // Eliminar después de 5 segundos
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
   COOKIE CONSENT
   ============================================ */

function initCookieConsent() {
  const COOKIE_NAME = "sg_cookie_consent";
  const cookieBanner = document.querySelector(".cookie-consent");

  if (!cookieBanner) return;

  // Verificar si ya se aceptaron las cookies
  const hasConsent = localStorage.getItem(COOKIE_NAME);

  if (!hasConsent) {
    // Mostrar banner después de un pequeño delay
    setTimeout(() => {
      cookieBanner.classList.add("show");
    }, 1000);
  }

  // Botón de aceptar
  const acceptBtn = cookieBanner.querySelector(".cookie-btn.accept");
  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      localStorage.setItem(COOKIE_NAME, "accepted");
      cookieBanner.classList.remove("show");
      setTimeout(() => cookieBanner.remove(), 400);
    });
  }

  // Botón de rechazar
  const rejectBtn = cookieBanner.querySelector(".cookie-btn.reject");
  if (rejectBtn) {
    rejectBtn.addEventListener("click", () => {
      localStorage.setItem(COOKIE_NAME, "rejected");
      cookieBanner.classList.remove("show");
      setTimeout(() => cookieBanner.remove(), 400);
    });
  }
}

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

  // Función para actualizar el progreso
  function updateScrollProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Calcular porcentaje de scroll
    const scrollPercent = scrollTop / (documentHeight - windowHeight);
    const offset = circumference - scrollPercent * circumference;

    progressCircle.style.strokeDashoffset = offset;

    // Mostrar/ocultar botón
    if (scrollTop > 300) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  }

  // Event listeners
  window.addEventListener("scroll", updateScrollProgress);
  window.addEventListener("resize", updateScrollProgress);

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
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

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

      lastScroll = currentScroll;
    },
    { passive: true },
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

  if (!menuLanding || !menuLegal) {
    return;
  }

  // Detectar si estamos en una página legal
  const isLegalPage = window.location.pathname.includes("/legal/");

  if (isLegalPage) {
    menuLanding.style.display = "none";
    menuLegal.style.display = "flex";

    // Marcar el link activo según la página actual
    const currentPage = window.location.pathname;
    const legalLinks = menuLegal.querySelectorAll(".nav-link");

    legalLinks.forEach((link) => {
      const linkPath = new URL(link.href).pathname;
      if (
        currentPage.includes(linkPath) &&
        !link.classList.contains("nav-link-home")
      ) {
        link.classList.add("active");
      }
    });
  } else {
    menuLanding.style.display = "flex";
    menuLegal.style.display = "none";
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

  // Animar elementos iniciales
  setTimeout(() => {
    const header = document.querySelector(".legal-header");
    const toc = document.querySelector(".legal-toc");

    if (header) header.classList.add("animate-in");
    if (toc) toc.classList.add("animate-in");
  }, 100);

  // Inicializar navegación del TOC
  initLegalTOC();

  // Inicializar animaciones de secciones
  initLegalSectionAnimations();

  // Inicializar progress bar de lectura
  initReadingProgress();
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
    // Iniciar colapsado en móvil
    if (window.innerWidth <= 992) {
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
        if (window.innerWidth > 992) {
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
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

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
    { passive: true },
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
    { passive: true },
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
    initAdaptiveMenu();
  });

  // Inicializar funcionalidades
  initResponsiveHandler();
  initHeroAnimations();
  initHeroParallax();
  initStatsCounter();
  initScrollAnimations();
  initLazyLoading();
  initTestimonialsCarousel();
  initNewsletterForm();
  initCookieConsent();
  initSmoothScroll();
  initBackToTop();
  initSearch();
  initHeaderScroll();

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

// 🔊 SISTEMA DE SONIDOS 8-BIT
const soundLibrary = {
  powerup: () => playBeep([440, 554, 659, 880], [100, 100, 100, 300]),
  coin: () => playBeep([988, 1319], [100, 300]),
  glitch: () => playBeep([200, 150, 100, 200], [50, 50, 50, 100]),
  snap: () => playBeep([800, 600, 400, 200, 100], [100, 100, 100, 100, 200]),
  levelup: () => playBeep([523, 659, 784, 1047], [150, 150, 150, 400]),
  success: () => playBeep([523, 587, 659, 784], [100, 100, 100, 300]),
  error: () => playBeep([392, 349, 294], [150, 150, 300]),
};

// Motor de audio usando Web Audio API
function playBeep(frequencies, durations) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let startTime = audioContext.currentTime;

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "square"; // Onda cuadrada para sonido 8-bit
      oscillator.frequency.value = freq;

      // Envelope para sonido más natural
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        startTime + durations[index] / 1000
      );

      oscillator.start(startTime);
      oscillator.stop(startTime + durations[index] / 1000);

      startTime += durations[index] / 1000;
    });
  } catch (error) {
    console.log("Audio no disponible:", error);
  }
}

// Función helper para reproducir sonidos
function playSound(soundName) {
  if (soundLibrary[soundName]) {
    soundLibrary[soundName]();
  }
}

// EASTER EGG 1: CÓDIGO KONAMI (↑↑↓↓←→←→BA)
function initKonamiCode() {
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
    const key = e.key.toLowerCase();

    if (key === konamiCode[konamiIndex]) {
      konamiIndex++;

      if (konamiIndex === konamiCode.length) {
        activateMatrixMode();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
}

function activateMatrixMode() {
  playSound("powerup");
  showNotification("🎮 ¡CÓDIGO KONAMI DESBLOQUEADO! NES Mode Activated", "success");

  // Crear overlay con efecto NES retro
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
    transition: opacity 0.3s ease;
    background: linear-gradient(
      0deg,
      rgba(255, 0, 0, 0.1) 0%,
      rgba(255, 128, 0, 0.1) 16.66%,
      rgba(255, 255, 0, 0.1) 33.33%,
      rgba(0, 255, 0, 0.1) 50%,
      rgba(0, 128, 255, 0.1) 66.66%,
      rgba(128, 0, 255, 0.1) 83.33%,
      rgba(255, 0, 255, 0.1) 100%
    );
    animation: rainbowShift 2s linear infinite;
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
  document.body.style.filter = "contrast(1.3) saturate(1.5) hue-rotate(5deg)";

  // Crear efecto de scanlines NES
  const scanlines = document.createElement("div");
  scanlines.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0.1) 2px,
      transparent 2px,
      transparent 4px
    );
    pointer-events: none;
    z-index: 999998;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  document.body.appendChild(scanlines);

  // Crear mensaje estilo NES
  const nesMessage = document.createElement("div");
  nesMessage.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000000;
    background: #000;
    color: #fff;
    padding: 2rem 3rem;
    border: 4px solid #fff;
    font-family: 'Press Start 2P', 'Courier New', monospace;
    font-size: 1.5rem;
    text-align: center;
    box-shadow: 
      0 0 0 4px #000,
      0 0 0 8px #fff,
      0 0 20px rgba(255, 255, 255, 0.5);
    opacity: 0;
    animation: blink 0.5s step-end infinite, fadeIn 0.5s ease forwards;
  `;
  nesMessage.innerHTML = `
    <div style="color: #ff6b6b; margin-bottom: 1rem;">★ POWER UP! ★</div>
    <div style="color: #ffd166; font-size: 1rem;">+1000 POINTS</div>
    <div style="color: #06ffa5; font-size: 0.8rem; margin-top: 1rem;">KONAMI CODE UNLOCKED</div>
  `;
  document.body.appendChild(nesMessage);

  // Crear sprites flotantes estilo NES
  const sprites = ["★", "♥", "●", "■", "▲", "♦"];
  const spriteElements = [];

  for (let i = 0; i < 20; i++) {
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
        font-size: ${20 + Math.random() * 30}px;
        color: ${randomColor};
        z-index: 999997;
        pointer-events: none;
        animation: nesFloat ${3 + Math.random() * 2}s linear;
        text-shadow: 
          2px 2px 0px #000,
          -2px -2px 0px #000,
          2px -2px 0px #000,
          -2px 2px 0px #000;
      `;
      sprite.textContent = randomSprite;
      document.body.appendChild(sprite);
      spriteElements.push(sprite);

      setTimeout(() => sprite.remove(), 5000);
    }, i * 100);
  }

  // Fade in effects
  setTimeout(() => {
    overlay.style.opacity = "0.3";
    scanlines.style.opacity = "0.6";
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

// EASTER EGG 2: DOBLE CLICK EN EL LOGO
function initLogoEasterEgg() {
  const logo = document.querySelector(".site-logo");
  if (!logo) return;

  let clickCount = 0;
  let clickTimer = null;

  logo.addEventListener("click", (e) => {
    clickCount++;

    if (clickTimer) clearTimeout(clickTimer);

    if (clickCount === 2) {
      e.preventDefault();
      activateGlitchStats();
      clickCount = 0;
    }

    clickTimer = setTimeout(() => {
      clickCount = 0;
    }, 500);
  });
}

function activateGlitchStats() {
  const logo = document.querySelector(".site-logo");
  if (!logo) return;

  playSound("glitch");

  // Efecto glitch en el logo
  logo.style.animation = "glitch 0.5s ease";

  setTimeout(() => {
    logo.style.animation = "";
  }, 500);

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
  let typedWord = "";
  const secretWords = {
    matrix: activateMatrixMode,
    retro: activate8BitMode,
    thanos: activateSnapEffect,
  };

  document.addEventListener("keypress", (e) => {
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

function activate8BitMode() {
  playSound("coin");
  showNotification("🕹️ MODO RETRO 8-BIT ACTIVADO!", "info");

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

  const elements = document.querySelectorAll(
    "section > *, .hero-badge, .testimonial-card, .about-stat",
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

// EASTER EGG 4: HORA ESPECÍFICA (3:33 AM)
function initTimeEasterEgg() {
  setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (
      (hours === 3 && minutes === 33) ||
      (hours === 15 && minutes === 33)
    ) {
      showNotification(
        "⏰ Son las 3:33... Hora mágica detectada 👻",
        "info",
      );
    }
  }, 60000); // Verificar cada minuto
}

// EASTER EGG 5: CLICK EN ESQUINAS EN SECUENCIA
function initCornerClicks() {
  const corners = [];
  const sequence = ["top-left", "top-right", "bottom-right", "bottom-left"];
  let currentStep = 0;

  document.addEventListener("click", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const threshold = 50;

    let corner = null;

    if (x < threshold && y < threshold) corner = "top-left";
    else if (x > w - threshold && y < threshold) corner = "top-right";
    else if (x > w - threshold && y > h - threshold) corner = "bottom-right";
    else if (x < threshold && y > h - threshold) corner = "bottom-left";

    if (corner && corner === sequence[currentStep]) {
      currentStep++;

      if (currentStep === sequence.length) {
        activateDeveloperConsole();
        currentStep = 0;
      }
    } else if (corner) {
      currentStep = 0;
    }
  });
}

function activateDeveloperConsole() {
  playSound("levelup");
  showNotification(
    "💻 DEVELOPER CONSOLE DESBLOQUEADO! Check F12",
    "success",
  );

  console.log("%c🎮 SALA GEEK - DEVELOPER MODE", "font-size: 24px; color: #ffd166; font-weight: bold;");
  console.log("%c¡Felicidades! Has desbloqueado el Developer Console", "font-size: 14px; color: #48bb78;");
  console.log("%cEstadísticas del sitio:", "font-size: 12px; color: #4299e1; font-weight: bold;");
  console.table({
    "Versión": "1.69.0",
    "Easter Eggs": "9 implementados",
    "Nivel Geek": "LEGENDARY",
    "Framework": "Vanilla JS",
    "Líneas de código": "~2000+",
  });
  console.log("%c¿Quieres ver todos los Easter Eggs?", "font-size: 12px; color: #f6ad55;");
  console.log("showAllEasterEggs()");

  // Función global para mostrar todos los Easter Eggs
  window.showAllEasterEggs = function () {
    console.log("%c🎯 LISTA DE EASTER EGGS:", "font-size: 16px; color: #ffd166; font-weight: bold;");
    console.log("1. Código Konami: ↑↑↓↓←→←→BA (NES Mode)");
    console.log("2. Doble click en el logo");
    console.log("3. Escribir: 'matrix', 'retro', 'thanos'");
    console.log("4. Hora mágica: 3:33 AM/PM");
    console.log("5. Click en esquinas: TL→TR→BR→BL");
    console.log("6. Shake del mouse (mover rápido)");
    console.log("7. Ctrl + Shift + G (Geek Mode)");
    console.log("8. Fechas especiales (Mayo 4, Pi Day)");
    console.log("9. Scroll al 100% (mensaje secreto)");
  };
}

// EASTER EGG 6: SHAKE DEL MOUSE
function initMouseShake() {
  let lastX = 0;
  let lastY = 0;
  let shakeCount = 0;
  let shakeTimer = null;

  document.addEventListener("mousemove", (e) => {
    const deltaX = Math.abs(e.clientX - lastX);
    const deltaY = Math.abs(e.clientY - lastY);

    if (deltaX > 50 || deltaY > 50) {
      shakeCount++;

      if (shakeCount > 10) {
        activateMouseDodge();
        shakeCount = 0;
      }
    }

    if (shakeTimer) clearTimeout(shakeTimer);
    shakeTimer = setTimeout(() => {
      shakeCount = 0;
    }, 500);

    lastX = e.clientX;
    lastY = e.clientY;
  });
}

function activateMouseDodge() {
  showNotification("🏃 Los elementos te esquivan! Mueve el mouse", "info");

  const elements = document.querySelectorAll(".hero-badge, .btn, .testimonial-card");

  elements.forEach((el) => {
    el.style.transition = "transform 0.2s ease";
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

      if (distance < 150) {
        const angle = Math.atan2(deltaY, deltaX);
        const force = Math.max(0, 150 - distance) / 3;
        const offsetX = -Math.cos(angle) * force;
        const offsetY = -Math.sin(angle) * force;

        el.style.transform = `translate(${offsetX}px, ${offsetY}px) ${el.dataset.originalTransform}`;
      } else {
        el.style.transform = el.dataset.originalTransform;
      }
    });
  };

  document.addEventListener("mousemove", mouseMoveHandler);

  setTimeout(() => {
    document.removeEventListener("mousemove", mouseMoveHandler);
    elements.forEach((el) => {
      el.style.transform = el.dataset.originalTransform;
      delete el.dataset.originalTransform;
    });
  }, 5000);
}

// EASTER EGG 7: COMBO DE TECLADO (Ctrl + Shift + G)
function initKeyboardCombo() {
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "G") {
      e.preventDefault();
      activateGeekMode();
    }
  });
}

function activateGeekMode() {
  playSound("levelup");
  showNotification("🤓 GEEK MODE ACTIVADO! Terminal Style", "success");

  // Agregar overlay de terminal
  const terminal = document.createElement("div");
  terminal.id = "geek-mode-terminal";
  terminal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    color: #00ff00;
    font-family: 'Courier New', monospace;
    padding: 2rem;
    z-index: 999999;
    overflow-y: auto;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  const commands = [
    "$ iniciando sistema...",
    "$ cargando módulos geek...",
    "$ [OK] Anime Database",
    "$ [OK] Gaming News",
    "$ [OK] Tech Updates",
    "$ [OK] Pop Culture Feed",
    "$ ================================",
    "$ SALA GEEK v1.69.0",
    "$ Sistema: OPERATIONAL",
    "$ Nivel Geek: LEGENDARY",
    "$ Easter Eggs: 9/9 disponibles",
    "$ ================================",
    "$ Presiona ESC para salir...",
  ];

  let output = "";
  commands.forEach((cmd, index) => {
    setTimeout(() => {
      output += cmd + "<br>";
      terminal.innerHTML = output;
    }, index * 200);
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

// EASTER EGG 8: FECHAS ESPECIALES
function initSpecialDates() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // Mayo 4 (Star Wars Day)
  if (month === 5 && day === 4) {
    setTimeout(() => {
      showNotification("🌟 May the 4th be with you! Happy Star Wars Day!", "info");
    }, 2000);
  }

  // Pi Day (14 marzo)
  if (month === 3 && day === 14) {
    setTimeout(() => {
      showNotification("🥧 Happy Pi Day! π = 3.14159265...", "info");
      rainPiNumbers();
    }, 2000);
  }

  // Halloween (31 octubre)
  if (month === 10 && day === 31) {
    setTimeout(() => {
      showNotification("🎃 Happy Halloween! Boo! 👻", "info");
    }, 2000);
  }
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
  let hasTriggered = false;

  window.addEventListener("scroll", () => {
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
  playSound("success");
  showNotification(
    "🎉 ¡MENSAJE SECRETO DESBLOQUEADO! Mira el footer...",
    "success",
  );

  const footer = document.querySelector(".site-footer");
  if (footer) {
    const secret = document.createElement("div");
    secret.style.cssText = `
      text-align: center;
      padding: 1rem;
      margin-top: 1rem;
      background: linear-gradient(135deg, rgba(255, 209, 102, 0.1), rgba(239, 71, 111, 0.1));
      border-radius: 8px;
      border: 2px solid var(--accent-primary);
      animation: pulse 2s ease-in-out infinite;
    `;
    secret.innerHTML = `
      <p style="margin: 0; color: var(--accent-primary); font-weight: bold;">
        🏆 ¡FELICIDADES! Llegaste hasta el final
      </p>
      <p style="margin: 0.5rem 0 0; color: var(--text-secondary); font-size: 0.9rem;">
        Eres un verdadero geek. Has desbloqueado TODOS los secretos 🎮
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

// INICIALIZAR TODOS LOS EASTER EGGS
function initAllEasterEggs() {
  initKonamiCode();
  initLogoEasterEgg();
  initSecretWords();
  initTimeEasterEgg();
  initCornerClicks();
  initMouseShake();
  initKeyboardCombo();
  initSpecialDates();
  initScrollSecret();

  console.log(
    "%c🎮 EASTER EGGS ACTIVADOS",
    "color: #ffd166; font-size: 14px; font-weight: bold;",
  );
  console.log(
    "%c9 secretos esperando ser descubiertos...",
    "color: #48bb78; font-size: 12px;",
  );
}

// Inicializar Easter Eggs después de que todo cargue
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initAllEasterEggs, 1000);
});
