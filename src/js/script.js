/* ============================================
   SALA GEEK - MAIN JAVASCRIPT
   Version: 1.59.0
   Description: Stats Counter Animation (segundo momento WOW)
   Last Modified: 2025-11-01
   ============================================ */

/* ============================================
   UTILIDADES GLOBALES
   ============================================ */

// Estado responsivo
const responsiveState = {
  isMobile: window.innerWidth <= 768,
  isTablet: window.innerWidth > 768 && window.innerWidth <= 968,
  isDesktop: window.innerWidth > 968
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
  document.documentElement.setAttribute('data-theme', 'dark');
  // Limpiar cualquier preferencia guardada del modo claro
  localStorage.removeItem('sg_theme');
}

// Actualizar estado responsivo
function updateResponsiveState() {
  responsiveState.isMobile = window.innerWidth <= 768;
  responsiveState.isTablet = window.innerWidth > 768 && window.innerWidth <= 968;
  responsiveState.isDesktop = window.innerWidth > 968;
}

// Inicializar manejador responsivo
function initResponsiveHandler() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateResponsiveState();
      
      // Cerrar el menú móvil si se cambia a desktop
      if (responsiveState.isDesktop) {
        const nav = document.querySelector('.main-nav');
        const toggle = document.querySelector('.nav-toggle');
        const searchDropdown = document.querySelector('.search-dropdown');
        
        if (nav && nav.classList.contains('open')) {
          nav.classList.remove('open');
          toggle?.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
        
        if (searchDropdown && searchDropdown.classList.contains('active')) {
          searchDropdown.classList.remove('active');
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
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
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
      loadPartial('#header-placeholder', '/src/pages/partials/header.html'),
      loadPartial('#footer-placeholder', '/src/pages/partials/footer.html')
    ]);
    
    // Actualizar año en el footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
    
    // Inicializar navegación después de cargar el header
    initNavigation();
  } catch (error) {
    console.error('Error loading includes:', error);
  }
}

/* ============================================
   NAVEGACIÓN
   ============================================ */

/**
 * Inicializa la navegación principal con menú móvil y scroll activo
 */
function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  const menuLinks = document.querySelectorAll('.menu a');

  if (!toggle || !nav) {
    console.warn('Navigation elements not found');
    return;
  }

  // Toggle del menú móvil con mejoras de accesibilidad
  const toggleMenu = () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen.toString());
    
    // Prevenir scroll del body cuando el menú está abierto
    document.body.style.overflow = isOpen ? 'hidden' : '';
    
    // Gestión de foco para accesibilidad
    if (isOpen) {
      const firstLink = nav.querySelector('a');
      firstLink?.focus();
    }
  };

  toggle.addEventListener('click', toggleMenu);

  // Botón de cerrar en móvil
  const closeBtn = document.querySelector('.nav-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  }

  // Cerrar menú al hacer clic en un enlace
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Si es un enlace de ancla interno
      if (link.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          // Cerrar menú móvil
          if (responsiveState.isMobile) {
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          }
          
          // Scroll suave al elemento
          const headerOffset = 100; // Altura del header sticky
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // El scroll automático activará highlightActiveSection después
        }
      }
    });
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && 
        !nav.contains(e.target) && 
        !toggle.contains(e.target)) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Marcar enlace activo según scroll
  const sections = document.querySelectorAll('section[id]');
  
  if (sections.length > 0) {
    function updateActiveLink() {
      const scrollPosition = window.scrollY + 150; // Offset del header
      
      let currentSection = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = section.id;
        }
      });
      
      // Actualizar enlaces activos
      menuLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
        }
      });
    }
    
    // Usar throttle con requestAnimationFrame para mejor rendimiento
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveLink();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Llamar al cargar la página
    updateActiveLink();
  }
  
  // Cerrar menú con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      toggleMenu();
      toggle.focus();
    }
  });
}

/* ============================================
   BUSCADOR
   ============================================ */

function initSearch() {
  const searchToggle = document.querySelector('.search-toggle');
  const searchDropdown = document.querySelector('.search-dropdown');
  const searchInput = document.querySelector('.search-input');
  const searchSubmit = document.querySelector('.search-submit');
  
  if (!searchToggle || !searchDropdown || !searchInput) return;

  // Toggle del dropdown de búsqueda
  searchToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    searchDropdown.classList.toggle('active');
    
    if (searchDropdown.classList.contains('active')) {
      // Enfocar el input cuando se abre
      setTimeout(() => searchInput.focus(), 100);
    }
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!searchDropdown.contains(e.target) && !searchToggle.contains(e.target)) {
      searchDropdown.classList.remove('active');
    }
  });

  // Manejar el submit de búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if (query) {
      // Por ahora solo mostramos una notificación
      // Aquí puedes integrar con tu sistema de búsqueda real
      showNotification(`Buscando: "${query}"`, 'info');
      
      // Cerrar el dropdown
      searchDropdown.classList.remove('active');
      
      // Limpiar el input
      searchInput.value = '';
      
      // En un caso real, aquí harías la búsqueda o redirigirías a una página de resultados
      // window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  // Submit al hacer clic en el botón
  if (searchSubmit) {
    searchSubmit.addEventListener('click', handleSearch);
  }

  // Submit con Enter
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  });

  // Cerrar con Escape
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchDropdown.classList.remove('active');
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
    rootMargin: '0px 0px -50px 0px'
  };

  // Crear el observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Usar requestAnimationFrame para asegurar que el cambio se aplique
        requestAnimationFrame(() => {
          entry.target.classList.add('reveal');
          
          // FORZAR REPAINT para fix de webkit gradient rendering
          const computedStyle = window.getComputedStyle(entry.target);
          const background = computedStyle.backgroundImage;
          entry.target.style.backgroundImage = 'none';
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
    const scrollElements = document.querySelectorAll('[data-scroll]');
    
    if (scrollElements.length === 0) {
      return;
    }
    
    // Observar todos los elementos
    scrollElements.forEach((element) => {
      observer.observe(element);
    });
  };

  // Inicializar después de un pequeño delay para asegurar que todo esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
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
  if ('loading' in HTMLImageElement.prototype) {
    // El navegador soporta loading="lazy" nativamente
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  } else {
    // Fallback con Intersection Observer para navegadores antiguos
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Cargar imagen
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // Cargar srcset si existe
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          // Agregar clase loaded para animaciones
          img.classList.add('lazy-loaded');
          
          // Dejar de observar
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observar todas las imágenes con data-src
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // Lazy loading para iframes (videos de YouTube, etc)
  const iframeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target;
        if (iframe.dataset.src) {
          iframe.src = iframe.dataset.src;
          iframe.removeAttribute('data-src');
          observer.unobserve(iframe);
        }
      }
    });
  }, {
    rootMargin: '100px 0px'
  });

  const lazyIframes = document.querySelectorAll('iframe[data-src]');
  lazyIframes.forEach(iframe => iframeObserver.observe(iframe));
}

/* ============================================
   HERO PARALLAX EFFECT
   ============================================ */

function initHeroParallax() {
  // Only enable on desktop
  if (window.innerWidth <= 768) return;
  
  const badges = document.querySelectorAll('.hero-badge');
  const heroSection = document.querySelector('.hero-section');
  
  if (!badges.length || !heroSection) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  // Track mouse movement
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
    mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
  });

  // Reset on mouse leave
  heroSection.addEventListener('mouseleave', () => {
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
  const statNumbers = document.querySelectorAll('.about-stat-number[data-count]');
  
  if (statNumbers.length === 0) return;

  let hasAnimated = false;

  // Función de easing para animación suave (easeOutExpo)
  const easeOutExpo = (t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  // Función para animar un contador individual
  const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-count'));
    const suffix = element.getAttribute('data-suffix') || '';
    const duration = 2000; // 2 segundos
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
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
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        
        // Animar cada contador con un pequeño delay
        statNumbers.forEach((stat, index) => {
          setTimeout(() => {
            animateCounter(stat);
          }, index * 100); // 100ms de delay entre cada uno
        });

        // Dejar de observar después de animar
        observer.disconnect();
      }
    });
  }, observerOptions);

  // Observar el contenedor de stats
  const statsContainer = document.querySelector('.about-stats');
  if (statsContainer) {
    observer.observe(statsContainer);
  }
}

/* ============================================
   HERO ANIMATIONS
   ============================================ */

function initHeroAnimations() {
  const typewriterElement = document.querySelector('.typewriter');
  
  if (!typewriterElement) return;
  
  // Solución JavaScript universal - Mostrar letra por letra
  const fullText = typewriterElement.textContent;
  const chars = fullText.split('');
  const duration = 1500; // 1.5 segundos (más rápido y fluido)
  const charDuration = duration / chars.length; // ~115ms por carácter
  
  // Vaciar el elemento inicialmente
  typewriterElement.textContent = '';
  typewriterElement.style.width = 'auto';
  
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
          typewriterElement.classList.add('typing-complete');
        }, 200);
      }
    }, charDuration);
  }, 500); // Delay inicial
  
  // Sistema inteligente: Hover rápido = sutil, Hover mantenido = explosión
  const badges = document.querySelectorAll('.hero-badge');
  badges.forEach((badge) => {
    let hoverStartTime = null;
    let explodeTimeout = null;
    
    badge.addEventListener('mouseenter', () => {
      // Guardar el tiempo de inicio del hover
      hoverStartTime = Date.now();
      
      // Limpiar cualquier timeout de explosión pendiente
      if (explodeTimeout) {
        clearTimeout(explodeTimeout);
        explodeTimeout = null;
      }
      
      // Remover clase de explosión si estaba
      badge.classList.remove('badge-explode');
      
      // Añadir clase de hover (animación sutil, NO desaparece)
      badge.classList.add('badge-hover');
    });
    
    badge.addEventListener('mouseleave', () => {
      // Calcular duración del hover
      const hoverDuration = Date.now() - hoverStartTime;
      
      // Quitar la animación de hover
      badge.classList.remove('badge-hover');
      
      // Solo hacer explosión si el hover fue MANTENIDO (≥ 300ms)
      if (hoverDuration >= 300) {
        explodeTimeout = setTimeout(() => {
          badge.classList.add('badge-explode');
          
          // Limpiar la clase después de la animación
          setTimeout(() => {
            badge.classList.remove('badge-explode');
          }, 1000);
        }, 150);
      }
      // Si fue hover rápido (< 300ms), no hacer nada especial
    });
  });
  
  // Easter egg: Efecto especial al hacer triple click en "Sala Geek"
  const heroBrand = document.querySelector('.hero-brand');
  if (heroBrand) {
    let clickCount = 0;
    let clickTimer = null;
    
    heroBrand.addEventListener('click', () => {
      clickCount++;
      
      if (clickTimer) clearTimeout(clickTimer);
      
      if (clickCount === 3) {
        // Efecto arcoíris especial
        heroBrand.style.animation = 'none';
        heroBrand.style.background = 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)';
        heroBrand.style.backgroundSize = '200% 100%';
        heroBrand.style.animation = 'gradientFlow 1s ease-in-out infinite';
        
        setTimeout(() => {
          heroBrand.style.animation = '';
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
  const track = document.querySelector('.carousel-track');
  const cards = document.querySelectorAll('.testimonial-card');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const indicators = document.querySelectorAll('.carousel-indicators .indicator');
  
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
      card.classList.remove('active');
      if (index === currentIndex) {
        card.classList.add('active');
      }
    });

    // Mover el track
    const offset = -currentIndex * 100;
    if (animate) {
      track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
      track.style.transition = 'none';
    }
    track.style.transform = `translateX(${offset}%)`;

    // Actualizar indicadores
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === currentIndex);
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
    startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    track.style.transition = 'none';
    stopAutoSlide();
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
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
  if (prevBtn) prevBtn.addEventListener('click', goToPrev);
  if (nextBtn) nextBtn.addEventListener('click', goToNext);

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => goToSlide(index));
  });

  // Touch events
  const container = document.querySelector('.carousel-container');
  if (container) {
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    
    // Mouse events para desktop
    container.addEventListener('mousedown', handleTouchStart);
    container.addEventListener('mousemove', handleTouchMove);
    container.addEventListener('mouseup', handleTouchEnd);
    container.addEventListener('mouseleave', () => {
      if (isDragging) handleTouchEnd();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToPrev();
    if (e.key === 'ArrowRight') goToNext();
  });

  // Pausar auto-slide en hover
  const carousel = document.querySelector('.testimonials-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', stopAutoSlide);
    carousel.addEventListener('mouseleave', startAutoSlide);
  }

  // Inicializar
  updateCarousel(false);
  startAutoSlide();
}

/* ============================================
   NEWSLETTER FORM
   ============================================ */

function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();
    
    if (!email) return;

    // Deshabilitar el botón durante el proceso
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Procesando...';
    
    try {
      // Aquí iría la integración con tu servicio de newsletter
      // Por ahora, simulamos una petición
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mostrar mensaje de éxito
      submitBtn.innerHTML = '✓ ¡Suscrito!';
      submitBtn.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
      
      // Limpiar el formulario
      emailInput.value = '';
      
      // Mostrar notificación
      showNotification('¡Gracias por suscribirte! Pronto recibirás nuestras últimas noticias.', 'success');
      
      // Restaurar el botón después de 3 segundos
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        submitBtn.style.background = '';
      }, 3000);
      
    } catch (error) {
      console.error('Error al suscribir:', error);
      submitBtn.innerHTML = '✗ Error';
      submitBtn.style.background = 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)';
      
      showNotification('Hubo un error al procesar tu suscripción. Por favor, intenta nuevamente.', 'error');
      
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        submitBtn.style.background = '';
      }, 3000);
    }
  });
}

/* ============================================
   NOTIFICACIONES
   ============================================ */

function showNotification(message, type = 'info') {
  // Definir el color según el tipo
  let background;
  switch(type) {
    case 'success':
      background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
      break;
    case 'error':
      background = 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)';
      break;
    case 'info':
    default:
      background = 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)';
      break;
  }
  
  // Crear elemento de notificación
  const notification = document.createElement('div');
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
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Agregar estilos de animación si no existen
if (!document.getElementById('notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
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
  const COOKIE_NAME = 'sg_cookie_consent';
  const cookieBanner = document.querySelector('.cookie-consent');
  
  if (!cookieBanner) return;

  // Verificar si ya se aceptaron las cookies
  const hasConsent = localStorage.getItem(COOKIE_NAME);
  
  if (!hasConsent) {
    // Mostrar banner después de un pequeño delay
    setTimeout(() => {
      cookieBanner.classList.add('show');
    }, 1000);
  }

  // Botón de aceptar
  const acceptBtn = cookieBanner.querySelector('.cookie-btn.accept');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem(COOKIE_NAME, 'accepted');
      cookieBanner.classList.remove('show');
      setTimeout(() => cookieBanner.remove(), 400);
    });
  }

  // Botón de rechazar
  const rejectBtn = cookieBanner.querySelector('.cookie-btn.reject');
  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      localStorage.setItem(COOKIE_NAME, 'rejected');
      cookieBanner.classList.remove('show');
      setTimeout(() => cookieBanner.remove(), 400);
    });
  }
}

/* ============================================
   SMOOTH SCROLL PARA TODOS LOS ENLACES DE ANCLA
   ============================================ */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      // Ignorar enlaces vacíos o solo "#"
      if (!href || href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        
        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ============================================
   HEADER SCROLL EFFECT
   ============================================ */

function initHeaderScroll() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const header = document.querySelector('.site-header');
  if (!header || !headerPlaceholder) return;

  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Agregar clase scrolled cuando se hace scroll hacia abajo
    if (currentScroll > 50) {
      headerPlaceholder.classList.add('scrolled');
      header.classList.add('scrolled');
    } else {
      headerPlaceholder.classList.remove('scrolled');
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
}

/* ============================================
   MENÚ ADAPTATIVO
   ============================================ */

/**
 * Detecta el tipo de página y muestra el menú apropiado
 */
function initAdaptiveMenu() {
  const menuLanding = document.querySelector('.menu-landing');
  const menuLegal = document.querySelector('.menu-legal');
  
  if (!menuLanding || !menuLegal) {
    return;
  }

  // Detectar si estamos en una página legal
  const isLegalPage = window.location.pathname.includes('/legal/');
  
  if (isLegalPage) {
    menuLanding.style.display = 'none';
    menuLegal.style.display = 'flex';
    
    // Marcar el link activo según la página actual
    const currentPage = window.location.pathname;
    const legalLinks = menuLegal.querySelectorAll('.nav-link');
    
    legalLinks.forEach(link => {
      const linkPath = new URL(link.href).pathname;
      if (currentPage.includes(linkPath) && !link.classList.contains('nav-link-home')) {
        link.classList.add('active');
      }
    });
  } else {
    menuLanding.style.display = 'flex';
    menuLegal.style.display = 'none';
  }
}

/* ============================================
   PÁGINAS LEGALES
   ============================================ */

/**
 * Inicializa funcionalidades específicas de páginas legales
 */
function initLegalPages() {
  const legalPage = document.querySelector('.legal-page');
  if (!legalPage) return;

  // Animar elementos iniciales
  setTimeout(() => {
    const header = document.querySelector('.legal-header');
    const toc = document.querySelector('.legal-toc');
    
    if (header) header.classList.add('animate-in');
    if (toc) toc.classList.add('animate-in');
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
  const tocLinks = document.querySelectorAll('.legal-toc nav a');
  const sections = document.querySelectorAll('.legal-section[id]');
  
  if (tocLinks.length === 0 || sections.length === 0) return;

  // Función para actualizar enlaces activos
  function updateActiveTOCLink() {
    const scrollPosition = window.scrollY + 200; // Ajustado para mejor precisión
    
    let currentSection = '';
    let maxTop = -Infinity;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      
      // Encontrar la sección más cercana por encima del scroll actual
      if (sectionTop <= scrollPosition && sectionTop > maxTop) {
        maxTop = sectionTop;
        currentSection = section.id;
      }
    });
    
    // Actualizar clases activas con animación suave
    tocLinks.forEach(link => {
      const href = link.getAttribute('href');
      const shouldBeActive = href === `#${currentSection}`;
      
      if (shouldBeActive && !link.classList.contains('active')) {
        link.classList.add('active');
      } else if (!shouldBeActive && link.classList.contains('active')) {
        link.classList.remove('active');
      }
    });
  }

  // Scroll suave al hacer clic en enlaces del TOC
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerOffset = 130; // Ajustado para mejor posicionamiento
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        // Remover active temporalmente durante el scroll
        tocLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Usar throttle con requestAnimationFrame
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveTOCLink();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Actualizar al cargar después de un delay
  setTimeout(updateActiveTOCLink, 100);
}

/**
 * Animaciones de entrada para secciones legales
 */
function initLegalSectionAnimations() {
  const sections = document.querySelectorAll('.legal-section');
  
  if (sections.length === 0) return;

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        // Dejar de observar después de animar
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });
}

/**
 * Barra de progreso de lectura
 */
function initReadingProgress() {
  // Verificar si ya existe
  if (document.querySelector('.reading-progress')) return;
  
  // Crear barra de progreso
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
  
  // Estilos inline para la barra de progreso
  const style = document.createElement('style');
  style.id = 'reading-progress-styles';
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
  
  if (!document.getElementById('reading-progress-styles')) {
    document.head.appendChild(style);
  }
  document.body.appendChild(progressBar);

  const progressBarFill = progressBar.querySelector('.reading-progress-bar');

  function updateReadingProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / documentHeight) * 100;
    
    // Mostrar barra solo después de scrollear un poco
    if (scrolled > 100) {
      progressBar.classList.add('visible');
    } else {
      progressBar.classList.remove('visible');
    }
    
    progressBarFill.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
  }

  // Throttle con requestAnimationFrame
  let progressTicking = false;
  window.addEventListener('scroll', () => {
    if (!progressTicking) {
      window.requestAnimationFrame(() => {
        updateReadingProgress();
        progressTicking = false;
      });
      progressTicking = true;
    }
  }, { passive: true });

  // Actualizar al cargar
  setTimeout(updateReadingProgress, 100);
}

/* ============================================
   INICIALIZACIÓN GLOBAL
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
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
  initSearch();
  initHeaderScroll();
  
  // Inicializar páginas legales si estamos en una
  initLegalPages();
});

// Prevenir FOUC (Flash of Unstyled Content)
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
