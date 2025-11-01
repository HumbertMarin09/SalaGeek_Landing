/* ============================================
   UTILIDADES GLOBALES
   ============================================ */

// Estado responsivo
const responsiveState = {
  isMobile: window.innerWidth <= 768,
  isTablet: window.innerWidth > 768 && window.innerWidth <= 968,
  isDesktop: window.innerWidth > 968
};

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
    
    console.log('Partials loaded successfully');
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
  // Marcar que JavaScript está activo
  document.documentElement.classList.add('js');

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        // Opcional: dejar de observar después de animar
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar elementos con clases de animación
  const animatedElements = document.querySelectorAll(
    '.animate-fade, .animate-slide-up, .animate-slide-down'
  );
  
  animatedElements.forEach(el => observer.observe(el));
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
   INICIALIZACIÓN GLOBAL
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Sala Geek Landing Page - Initializing...');
  
  // Cargar componentes
  loadIncludes();
  
  // Inicializar funcionalidades
  initResponsiveHandler();
  initScrollAnimations();
  initNewsletterForm();
  initCookieConsent();
  initSmoothScroll();
  initSearch();
  initHeaderScroll();
  
  console.log('✅ Landing Page initialized successfully');
});

// Prevenir FOUC (Flash of Unstyled Content)
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
