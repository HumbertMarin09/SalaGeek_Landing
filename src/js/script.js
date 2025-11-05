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

  // Detectar móvil para ajustar tamaño
  const isMobile = /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
  
  // Crear elemento de notificación
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: ${isMobile ? '90px' : '120px'};
    right: ${isMobile ? '10px' : '20px'};
    left: ${isMobile ? '10px' : 'auto'};
    padding: ${isMobile ? '0.75rem 1rem' : '1rem 1.5rem'};
    background: ${background};
    color: white;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 100000;
    max-width: ${isMobile ? '100%' : '400px'};
    animation: slideInRight 0.3s ease;
    font-weight: 500;
    font-size: ${isMobile ? '0.875rem' : '1rem'};
    line-height: 1.4;
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

  // Función para actualizar el progreso y posición
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

    // Back-to-Top siempre en posición fija (puede flotar sobre el footer)
    // No necesita ajuste de posición
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
let isSoundPlaying = false; // Variable global para controlar sonidos simultáneos

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
    isSoundPlaying = true; // Marcar que hay un sonido reproduciéndose
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let startTime = audioContext.currentTime;
    let totalDuration = 0;

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
      totalDuration += durations[index];
    });

    // Resetear flag cuando termine el sonido
    setTimeout(() => {
      isSoundPlaying = false;
    }, totalDuration);
    
  } catch (error) {
    console.log("Audio no disponible:", error);
    isSoundPlaying = false;
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
    const expectedKey = konamiCode[konamiIndex];

    // Comparar correctamente (sin lowercase para flechas)
    const isMatch = e.key === expectedKey || key === expectedKey;

    if (isMatch) {
      konamiIndex++;
      console.log(`Konami progress: ${konamiIndex}/${konamiCode.length}`);

      if (konamiIndex === konamiCode.length) {
        activateNESMode();
        easterEggTracker.unlock("konami");
        konamiIndex = 0;
      }
    } else {
      if (konamiIndex > 0) {
        console.log("Konami code reset!");
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
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Crear mensaje estilo NES - aparece donde está el viewport con diseño mejorado
  const nesMessage = document.createElement("div");
  
  // Calcular posición del viewport actual
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight;
  const centerY = scrollTop + (viewportHeight / 2);
  
  nesMessage.style.cssText = `
    position: absolute;
    top: ${centerY}px;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000000;
    background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
    color: #fff;
    padding: ${isMobile ? '1.5rem 2rem' : '2.5rem 3.5rem'};
    border: 3px solid #fff;
    border-radius: 4px;
    font-family: 'Press Start 2P', 'Courier New', monospace;
    font-size: ${isMobile ? '1rem' : '1.5rem'};
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
    <div style="color: #ffd166; font-size: ${isMobile ? '0.85rem' : '1rem'}; text-shadow: 2px 2px 0 rgba(0,0,0,0.5);">+1000 POINTS</div>
    <div style="color: #06ffa5; font-size: ${isMobile ? '0.7rem' : '0.8rem'}; margin-top: 1rem; text-shadow: 1px 1px 0 rgba(0,0,0,0.5);">KONAMI CODE UNLOCKED</div>
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
  // Solo en desktop - deshabilitado en móvil
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) return;
  
  // Esperar a que el hero se cargue
  setTimeout(() => {
    const heroTitle = document.querySelector(".hero-content h1");
    if (!heroTitle) return;

    let clickCount = 0;
    let clickTimer = null;

    heroTitle.addEventListener("click", (e) => {
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
          Math.random() > 0.7
            ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
            : char
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
  let typedWord = "";
  const secretWords = {
    matrix: activateMatrixRainMode,
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

  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01";
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

// EASTER EGG 4: HORA ESPECÍFICA (3:33 AM) + JUMPSCARE
function initTimeEasterEgg() {
  let hasTriggered = false;
  
  setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (
      ((hours === 3 && minutes === 33) || (hours === 15 && minutes === 33)) &&
      !hasTriggered
    ) {
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
  console.log("🚨 JUMPSCARE ACTIVADO!");
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
  // Solo en desktop
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) return;

  const sequence = ["top-left", "top-right", "bottom-right", "bottom-left"];
  let currentStep = 0;
  let lastClickTime = Date.now();

  document.addEventListener("click", (e) => {
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
        "bottom-left": "↙️"
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
  showNotification(
    "💻 ¡DEVELOPER CONSOLE DESBLOQUEADO! Revisa F12",
    "success",
  );
  easterEggTracker.unlock("corners");

  console.clear();
  console.log("%c🎮 SALA GEEK - DEVELOPER MODE", "font-size: 28px; color: #ffd166; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);");
  console.log("%c════════════════════════════════════════", "color: #ffd166;");
  console.log("%c¡Felicidades! Has desbloqueado el Developer Console", "font-size: 16px; color: #48bb78; font-weight: bold;");
  console.log("%c ", "");
  console.log("%cEstadísticas del sitio:", "font-size: 14px; color: #4299e1; font-weight: bold;");
  console.table({
    "🎯 Versión": "2.0.0",
    "🎮 Easter Eggs": "9 Desktop + 6 Mobile",
    "⚡ Nivel Geek": "LEGENDARY",
    "💻 Framework": "Vanilla JS",
    "📦 Líneas de código": "~3500+",
    "🎨 Tema": "Dark/Light Mode"
  });
  console.log("%c ", "");
  console.log("%c💡 ¿Quieres ver todos los Easter Eggs?", "font-size: 12px; color: #f6ad55; font-weight: bold;");
  console.log("%cEjecuta: showAllEasterEggs()", "color: #06ffa5; font-style: italic;");
  console.log("%c════════════════════════════════════════", "color: #ffd166;");

  // Función global para mostrar todos los Easter Eggs
  window.showAllEasterEggs = function () {
    console.clear();
    console.log("%c🎯 LISTA COMPLETA DE EASTER EGGS", "font-size: 20px; color: #ffd166; font-weight: bold;");
    console.log("%c════════════════════════════════════════", "color: #ffd166;");
    console.log("%c💻 DESKTOP (9 Easter Eggs):", "font-size: 14px; color: #4ecdc4; font-weight: bold;");
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
    console.log("%c📱 MOBILE (6 Easter Eggs):", "font-size: 14px; color: #ff6b6b; font-weight: bold;");
    console.log("%c1. 🎮 Triple tap en 'Sala Geek'", "color: #fff;");
    console.log("%c2. ✨ Long press en email newsletter", "color: #fff;");
    console.log("%c3. 🕹️ Long press en botón 'Únete Ahora'", "color: #fff;");
    console.log("%c4. 💎 Double tap en copyright", "color: #fff;");
    console.log("%c5. ⌨️ Long press en 'Sala Geek' del footer", "color: #fff;");
    console.log("%c6. 📜 Scroll al 100% (mensaje secreto)", "color: #fff;");
    console.log("%c════════════════════════════════════════", "color: #ffd166;");
    console.log("%c🏆 ¡Desbloqueálos todos para ser un DIOS GEEK!", "font-size: 14px; color: #06ffa5; font-weight: bold;");
  };
}

// EASTER EGG 6: SHAKE DEL MOUSE (Desktop only - MEJORADO)
function initMouseShake() {
  // Solo en desktop
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) return;

  let lastX = 0;
  let lastY = 0;
  let shakeCount = 0;
  let shakeTimer = null;
  let shakeActivated = false;
  let movementHistory = [];
  const requiredShakes = 15; // Aumentado para más consistencia

  document.addEventListener("mousemove", (e) => {
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
        time: Date.now()
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
        const timeRange = movementHistory[movementHistory.length - 1].time - movementHistory[0].time;
        
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

  const elements = document.querySelectorAll(".hero-badge, .btn, .testimonial-card, .stat-card");

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
  document.addEventListener("keydown", (e) => {
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

  let output = "<div style='margin-bottom: 1rem; border-bottom: 2px solid #00ff00; padding-bottom: 0.5rem;'><span style='color:#ffd166'>┌─[</span><span style='color:#ff6b6b'>root</span><span style='color:#ffd166'>@</span><span style='color:#06ffa5'>sala-geek</span><span style='color:#ffd166'>]</span><br><span style='color:#ffd166'>└──╼ $</span></div>";
  
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

  // Año Nuevo (31 dic - 1 ene)
  if ((month === 12 && day === 31) || (month === 1 && day === 1)) {
    setTimeout(() => {
      showNotification("🎆 ¡Feliz Año Nuevo! 2025 🎉", "success");
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
  
  setTimeout(() => overlay.style.opacity = "0.8", 100);
  
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
    stars.forEach(star => star.remove());
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
  
  setTimeout(() => overlay.style.opacity = "1", 100);
  
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
  
  setTimeout(() => overlay.style.opacity = "1", 100);
  
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
  
  setTimeout(() => overlay.style.opacity = "1", 100);
  
  // Nieve cayendo
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const snow = document.createElement("div");
      snow.textContent = ["❄️", "⛄", "🎄", "🎅"][Math.floor(Math.random() * 10) < 7 ? 0 : Math.floor(Math.random() * 4)];
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
  
  setTimeout(() => overlay.style.opacity = "1", 100);
  
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

const easterEggTracker = {
  eggs: {
    konami: false,
    logo: false,
    matrix: false,
    retro: false,
    thanos: false,
    corners: false,
    shake: false,
    combo: false,
    scroll: false,
  },
  
  isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  
  levels: [
    { name: "Novato", min: 0, max: 0 },
    { name: "Explorador", min: 1, max: 2 },
    { name: "Cazador", min: 3, max: 4 },
    { name: "Maestro", min: 5, max: 6 },
    { name: "Leyenda", min: 7, max: 8 },
    { name: "Dios Geek", min: 9, max: 9 },
  ],
  
  getTotalEggs() {
    // En móvil: 6 eggs (konami, logo, retro, thanos, combo, scroll)
    // En desktop: 9 eggs (todos)
    return this.isMobile ? 6 : 9;
  },

  init() {
    // Cargar progreso desde localStorage
    const saved = localStorage.getItem("easterEggProgress");
    if (saved) {
      this.eggs = JSON.parse(saved);
      this.updateUI();
    }

    // Ocultar achievements desktop-only en móvil
    if (this.isMobile) {
      const style = document.createElement('style');
      style.id = 'tracker-mobile-styles';
      style.textContent = `
        .achievement.desktop-only {
          display: none !important;
        }
      `;
      if (!document.getElementById('tracker-mobile-styles')) {
        document.head.appendChild(style);
      }
    }

    // Iniciar colapsado por defecto
    const tracker = document.getElementById("easter-egg-tracker");
    if (tracker) {
      tracker.classList.add("collapsed");
    }

    // Toggle tracker
    const toggle = document.getElementById("tracker-toggle");
    
    if (toggle && tracker) {
      toggle.addEventListener("click", () => {
        tracker.classList.toggle("collapsed");
        
        // Guardar preferencia del usuario
        const isCollapsed = tracker.classList.contains("collapsed");
        localStorage.setItem("trackerCollapsed", isCollapsed);
      });
    }

    // Restaurar estado del tracker
    const trackerCollapsed = localStorage.getItem("trackerCollapsed");
    if (trackerCollapsed === "false" && tracker) {
      tracker.classList.remove("collapsed");
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
  },

  initTrackerPositioning() {
    const tracker = document.getElementById("easter-egg-tracker");
    if (!tracker) return;

    const adjustTrackerPosition = () => {
      const header = document.querySelector(".site-header");
      const footer = document.querySelector(".site-footer");
      if (!header || !footer) return;

      const headerRect = header.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const trackerRect = tracker.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // VALIDACIÓN CRÍTICA: Si el tracker está cubriendo el header en position fixed
      if (tracker.style.position === "fixed" || !tracker.style.position || tracker.style.position === "") {
        const headerBottom = headerRect.bottom;
        
        // Si el tracker está sobre el header
        if (trackerRect.top < headerBottom) {
          // Calcular nuevo bottom para que no cubra el header
          const overlap = headerBottom - trackerRect.top;
          const currentBottom = parseInt(getComputedStyle(tracker).bottom) || 20;
          const newBottom = currentBottom - overlap - 10;
          
          // Solo ajustar si es necesario (no valores negativos)
          if (newBottom < 20) {
            // Cambiar temporalmente la posición
            tracker.style.bottom = "20px";
          }
        }
      }
      
      // Si el tracker está a punto de chocar con el footer
      if (trackerRect.bottom > footerRect.top && footerRect.top < viewportHeight) {
        const distanceToFooter = footerRect.top - trackerRect.bottom;
        
        if (distanceToFooter < 20) {
          // Cambiar a position absolute y posicionarlo justo arriba del footer
          tracker.style.position = "absolute";
          tracker.style.bottom = "auto";
          
          // Calcular posición top para quedar arriba del footer
          const footerOffsetTop = footer.offsetTop;
          const headerOffsetBottom = header.offsetTop + header.offsetHeight;
          
          let newTop = footerOffsetTop - tracker.offsetHeight - 10;
          
          // VALIDAR: No debe quedar arriba del header
          const minTop = headerOffsetBottom + 20; // 20px debajo del header
          if (newTop < minTop) {
            newTop = minTop; // Forzar a quedar debajo del header
          }
          
          tracker.style.top = `${newTop}px`;
          tracker.style.transition = "none";
        }
      } else if (footerRect.top > viewportHeight) {
        // Footer fuera del viewport, volver a fixed position
        tracker.style.position = "fixed";
        tracker.style.bottom = "20px";
        tracker.style.top = "auto";
        tracker.style.transition = "bottom 0.3s ease";
      }
    };

    // Ajustar en scroll
    window.addEventListener("scroll", adjustTrackerPosition);
    
    // Ajustar en resize
    window.addEventListener("resize", adjustTrackerPosition);
    
    // Ajustar al inicio
    adjustTrackerPosition();
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
    Object.keys(this.eggs).forEach(key => {
      this.eggs[key] = false;
    });
    this.save();
    this.updateUI();
    showNotification("🔄 Logros reseteados. ¡Vuelve a cazarlos todos!", "info");
  },

  getUnlockedCount() {
    return Object.values(this.eggs).filter(Boolean).length;
  },

  getLevel() {
    const count = this.getUnlockedCount();
    return this.levels.find(level => count >= level.min && count <= level.max);
  },

  updateUI() {
    const count = this.getUnlockedCount();
    const total = this.getTotalEggs();
    const countEl = document.getElementById("tracker-count");
    const progressBar = document.getElementById("progress-bar");
    const levelEl = document.getElementById("geek-level");

    if (countEl) countEl.textContent = `${count}/${total}`;
    if (progressBar) progressBar.style.width = `${(count / total) * 100}%`;
    if (levelEl) {
      const level = this.getLevel();
      levelEl.textContent = `Nivel Geek: ${level.name}`;
    }

    // Actualizar achievements
    Object.keys(this.eggs).forEach(eggName => {
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

  showCompletionCelebration() {
    playSound("levelup");
    const message = this.isMobile 
      ? "🏆 ¡INCREÍBLE! ¡Has encontrado todos los Easter Eggs móviles! ¡Eres un DIOS GEEK! 🎮"
      : "🏆 ¡INCREÍBLE! ¡Has encontrado todos los Easter Eggs! ¡Eres un DIOS GEEK! 🎮";
    showNotification(message, "success");

    // Crear contenedor de confetti en el viewport ACTUAL (no en top: 0)
    let confettiContainer = document.getElementById('confetti-container');
    if (!confettiContainer) {
      confettiContainer = document.createElement('div');
      confettiContainer.id = 'confetti-container';
      document.body.appendChild(confettiContainer);
    }
    
    // Posicionar en viewport actual del usuario
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
          currentX = startX + (drift * progress);
          
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
  }
};

// ============================================
// EASTER EGGS MÓVILES (TOUCH-FRIENDLY)
// ============================================

function initMobileEasterEggs() {
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) return; // Solo ejecutar en móvil

  console.log("📱 Modo móvil detectado - Easter Eggs táctiles activados (versión optimizada)");

  const hero = document.querySelector(".hero");
  const mobileHeroTitle = document.querySelector(".hero-content h1");

  // 1. TRIPLE TAP en el TÍTULO "Sala Geek" -> Konami alternativo
  let titleTapCount = 0;
  let titleTapTimer = null;
  
  if (mobileHeroTitle) {
    mobileHeroTitle.addEventListener("touchend", (e) => {
      e.preventDefault();
      titleTapCount++;
      
      if (titleTapTimer) clearTimeout(titleTapTimer);
      
      if (titleTapCount === 3) {
        activateNESMode();
        easterEggTracker.unlock("konami");
        titleTapCount = 0;
      }
      
      titleTapTimer = setTimeout(() => {
        titleTapCount = 0;
      }, 600);
    });
  }

  // 2. LONG PRESS en botón CTA "Únete Ahora" -> Modo 8-bit
  let ctaLongPressTimer = null;
  let ctaLongPressActivated = false;
  const ctaButton = document.querySelector(".hero-cta .btn-primary");
  
  if (ctaButton) {
    ctaButton.addEventListener("touchstart", (e) => {
      ctaLongPressActivated = false;
      
      // Feedback visual INMEDIATO al tocar
      ctaButton.style.transform = "scale(0.95)";
      ctaButton.style.transition = "transform 0.1s ease";
      
      ctaLongPressTimer = setTimeout(() => {
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
      }, 600); // Reducido de 800ms a 600ms
    }, { passive: false });
    
    ctaButton.addEventListener("touchend", (e) => {
      clearTimeout(ctaLongPressTimer);
      
      // Restaurar feedback visual
      ctaButton.style.transform = "";
      
      // Si se activó el long press, prevenir navegación
      if (ctaLongPressActivated) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        ctaLongPressActivated = false;
        return false;
      }
    }, { passive: false });
    
    ctaButton.addEventListener("touchmove", (e) => {
      clearTimeout(ctaLongPressTimer);
    });
    
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
    console.log("❌ CTA Button NO encontrado");
  }

  // 3. LONG PRESS en email input del Newsletter -> Glitch Stats
  let newsletterLongPressTimer = null;
  const newsletterInput = document.querySelector(".newsletter-form input[type='email']");
  
  if (newsletterInput) {
    newsletterInput.addEventListener("touchstart", (e) => {
      // Feedback visual INMEDIATO
      newsletterInput.style.borderColor = "var(--accent-secondary)";
      newsletterInput.style.transform = "scale(0.98)";
      newsletterInput.style.transition = "all 0.1s ease";
      
      newsletterLongPressTimer = setTimeout(() => {
        activateGlitchStats();
        easterEggTracker.unlock("logo");
        // Feedback visual de éxito
        newsletterInput.style.borderColor = "var(--accent-primary)";
        newsletterInput.style.transform = "scale(1.02)";
        if (navigator.vibrate) navigator.vibrate(200);
        setTimeout(() => {
          newsletterInput.style.borderColor = "";
          newsletterInput.style.transform = "";
        }, 500);
      }, 600); // Reducido de 1000ms a 600ms
    });
    
    newsletterInput.addEventListener("touchend", () => {
      clearTimeout(newsletterLongPressTimer);
      // Restaurar estilos
      newsletterInput.style.borderColor = "";
      newsletterInput.style.transform = "";
    });
    
    newsletterInput.addEventListener("touchmove", () => {
      clearTimeout(newsletterLongPressTimer);
      // Restaurar estilos
      newsletterInput.style.borderColor = "";
      newsletterInput.style.transform = "";
    });
  }

  // 4. DOBLE TAP en copyright del footer -> Thanos Snap
  let copyrightTapCount = 0;
  let copyrightTapTimer = null;
  const copyright = document.querySelector(".footer-bottom p");
  
  if (copyright) {
    copyright.addEventListener("touchend", (e) => {
      e.preventDefault();
      copyrightTapCount++;
      
      if (copyrightTapTimer) clearTimeout(copyrightTapTimer);
      
      if (copyrightTapCount === 2) {
        activateSnapEffect();
        easterEggTracker.unlock("thanos");
        copyrightTapCount = 0;
      }
      
      copyrightTapTimer = setTimeout(() => {
        copyrightTapCount = 0;
      }, 500);
    });
  }

  // 5. LONG PRESS en "Sala Geek" del footer -> Combo mode
  let footerBrandLongPress = null;
  const footerBrand = document.querySelector(".footer-bottom strong");
  
  if (footerBrand) {
    footerBrand.addEventListener("touchstart", (e) => {
      e.preventDefault();
      
      // Feedback visual INMEDIATO
      footerBrand.style.transform = "scale(0.95)";
      footerBrand.style.color = "var(--accent-secondary)";
      footerBrand.style.transition = "all 0.1s ease";
      
      footerBrandLongPress = setTimeout(() => {
        // Modo ligero: solo CSS sin Matrix pesado
        document.body.style.filter = "hue-rotate(180deg)";
        playSound("coin");
        easterEggTracker.unlock("combo");
        
        // Feedback visual y haptic de éxito
        footerBrand.style.transform = "scale(1.2)";
        footerBrand.style.color = "var(--accent-primary)";
        if (navigator.vibrate) navigator.vibrate(200);
        
        setTimeout(() => {
          document.body.style.filter = "none";
          footerBrand.style.transform = "";
          footerBrand.style.color = "";
        }, 3000);
      }, 600); // Reducido de 1000ms a 600ms
    });
    
    footerBrand.addEventListener("touchend", () => {
      clearTimeout(footerBrandLongPress);
      // Restaurar estilos
      footerBrand.style.transform = "";
      footerBrand.style.color = "";
    });
    
    footerBrand.addEventListener("touchmove", () => {
      clearTimeout(footerBrandLongPress);
      // Restaurar estilos
      footerBrand.style.transform = "";
      footerBrand.style.color = "";
    });
    
    footerBrand.addEventListener("touchmove", () => {
      clearTimeout(footerBrandLongPress);
    });
  }

  // Notificación de ayuda móvil
  setTimeout(() => {
    showNotification("📱 Tip: Explora con taps y long press en botones!", "info");
  }, 5000);
}

// INICIALIZAR TODOS LOS EASTER EGGS
function initAllEasterEggs() {
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Easter Eggs universales (Desktop + Mobile)
  initKonamiCode(); // ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA
  initSecretWords(); // matrix, retro, thanos
  initScrollSecret(); // Scroll al 100%
  initSpecialDates(); // Fechas especiales
  
  // Easter Eggs solo Desktop
  if (!isMobile) {
    initLogoEasterEgg(); // Doble click en logo
    initTimeEasterEgg(); // Hora 3:33
    initCornerClicks(); // 4 esquinas
    initMouseShake(); // Shake mouse
    initKeyboardCombo(); // Ctrl+Shift+G
    
    console.log(
      "%c🖥️ EASTER EGGS DESKTOP ACTIVADOS",
      "color: #ffd166; font-size: 14px; font-weight: bold; background: #1a1a2e; padding: 5px 10px; border-radius: 5px;",
    );
    console.log(
      "%c9 secretos esperando ser descubiertos...",
      "color: #48bb78; font-size: 12px;",
    );
  }
  
  // Easter Eggs solo Mobile
  if (isMobile) {
    initMobileEasterEggs();
    
    console.log(
      "%c📱 EASTER EGGS MOBILE ACTIVADOS",
      "color: #ff6b6b; font-size: 14px; font-weight: bold; background: #1a1a2e; padding: 5px 10px; border-radius: 5px;",
    );
    console.log(
      "%c6 secretos optimizados para touch...",
      "color: #48bb78; font-size: 12px;",
    );
  }
  
  // Inicializar tracker (universal)
  easterEggTracker.init();
}

// Inicializar Easter Eggs después de que todo cargue
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initAllEasterEggs, 1000);
});
