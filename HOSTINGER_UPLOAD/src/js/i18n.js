/**
 * ============================================================================
 * 🌍 SALA GEEK - SISTEMA DE INTERNACIONALIZACIÓN (i18n)
 * ============================================================================
 * 
 * Sistema de traducción multi-idioma para Sala Geek
 * 
 * Idiomas soportados:
 * - Español (es) - Idioma base
 * - English (en) - Inglés
 * - Português (pt) - Portugués
 * 
 * Características:
 * - Detección automática del idioma del navegador
 * - Persistencia en localStorage
 * - Traducciones dinámicas sin recargar página
 * - Soporte para pluralización
 * - Fallback a español si no existe traducción
 * 
 * @version 1.0.0
 * @author Sala Geek
 * @license MIT
 * ============================================================================
 */

const SalaGeekI18n = (function() {
  'use strict';

  // ============================================================================
  // CONFIGURACIÓN
  // ============================================================================
  
  const DEBUG = false; // Cambiar a true para logs de desarrollo

  // ============================================================================
  // TRADUCCIONES
  // ============================================================================

  const translations = {
    // ═══════════════════════════════════════════════════════════════════════
    // ESPAÑOL (Idioma base)
    // ═══════════════════════════════════════════════════════════════════════
    es: {
      // Navegación
      nav: {
        home: 'Inicio',
        blog: 'Blog',
        categories: 'Categorías',
        about: 'Nosotros',
        contact: 'Contacto',
        search: 'Buscar',
        searchPlaceholder: 'Buscar artículos...',
        noResults: 'No se encontraron resultados',
        menu: 'Menú'
      },

      // Categorías
      categories: {
        all: 'Todas',
        movies: 'Películas',
        series: 'Series',
        anime: 'Anime',
        gaming: 'Gaming',
        tech: 'Tecnología',
        comics: 'Cómics'
      },

      // Hero Section
      hero: {
        title: 'Tu Espacio',
        titleBrand: 'Geek',
        titleEnd: 'Definitivo',
        subtitle: 'Noticias, reseñas y análisis de películas, series, anime, videojuegos y tecnología.',
        cta: 'Explorar Contenido',
        ctaSecondary: 'Suscribirse',
        joinCommunity: 'Únete a +50K geeks'
      },

      // Blog
      blog: {
        title: 'Últimos Artículos',
        readMore: 'Leer más',
        readTime: 'min de lectura',
        views: 'vistas',
        share: 'Compartir',
        shareArticle: 'Compartir artículo',
        relatedArticles: 'Artículos Relacionados',
        comments: 'Comentarios',
        noArticles: 'No hay artículos disponibles',
        loadMore: 'Cargar más',
        featured: 'Destacado',
        trending: 'Tendencia',
        latest: 'Más recientes',
        popular: 'Más populares',
        publishedOn: 'Publicado el',
        updatedOn: 'Actualizado el',
        author: 'Por',
        tags: 'Etiquetas'
      },

      // Footer
      footer: {
        description: 'La comunidad geek de habla hispana más grande. Contenido diario sobre películas, series, anime, videojuegos y tecnología.',
        quickLinks: 'Enlaces Rápidos',
        categories: 'Categorías',
        legal: 'Legal',
        followUs: 'Síguenos',
        newsletter: 'Newsletter',
        newsletterDesc: 'Recibe las mejores noticias geek en tu correo',
        subscribe: 'Suscribirse',
        emailPlaceholder: 'tu@email.com',
        privacyPolicy: 'Política de Privacidad',
        termsOfService: 'Términos de Servicio',
        cookies: 'Política de Cookies',
        copyright: '© 2017-2026 Sala Geek. Todos los derechos reservados.',
        madeWith: 'Hecho con',
        forGeeks: 'para geeks'
      },

      // Newsletter
      newsletter: {
        title: '¡No te pierdas nada!',
        subtitle: 'Únete a nuestra newsletter semanal',
        description: 'Recibe cada domingo un resumen con las mejores noticias, reseñas exclusivas y contenido especial.',
        placeholder: 'Tu correo electrónico',
        button: 'Suscribirme',
        success: '¡Gracias por suscribirte!',
        error: 'Error al suscribirse. Intenta de nuevo.',
        privacy: 'Respetamos tu privacidad. Sin spam.'
      },

      // Formulario de Contacto
      contact: {
        title: 'Contáctanos',
        name: 'Nombre',
        email: 'Correo electrónico',
        subject: 'Asunto',
        message: 'Mensaje',
        send: 'Enviar mensaje',
        sending: 'Enviando...',
        success: '¡Mensaje enviado correctamente!',
        error: 'Error al enviar. Intenta de nuevo.'
      },

      // Acciones comunes
      actions: {
        close: 'Cerrar',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        save: 'Guardar',
        delete: 'Eliminar',
        edit: 'Editar',
        copy: 'Copiar',
        copied: '¡Copiado!',
        share: 'Compartir',
        download: 'Descargar',
        loading: 'Cargando...',
        seeMore: 'Ver más',
        seeLess: 'Ver menos',
        goBack: 'Volver',
        scrollTop: 'Ir arriba'
      },

      // Cookies
      cookies: {
        title: '🍪 Usamos cookies',
        message: 'Utilizamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra',
        policy: 'política de cookies',
        accept: 'Aceptar',
        reject: 'Rechazar',
        settings: 'Configurar'
      },

      // PWA Install
      pwa: {
        installTitle: '📱 Instalar App',
        installMessage: 'Instala Sala Geek en tu dispositivo para una mejor experiencia',
        installButton: 'Instalar',
        later: 'Más tarde'
      },

      // Errores
      errors: {
        notFound: 'Página no encontrada',
        notFoundMessage: 'Lo sentimos, la página que buscas no existe.',
        serverError: 'Error del servidor',
        offline: 'Sin conexión',
        offlineMessage: 'Parece que estás sin conexión. Verifica tu internet.',
        tryAgain: 'Intentar de nuevo'
      },

      // Fechas
      dates: {
        today: 'Hoy',
        yesterday: 'Ayer',
        daysAgo: 'hace {n} días',
        weeksAgo: 'hace {n} semanas',
        monthsAgo: 'hace {n} meses',
        yearsAgo: 'hace {n} años',
        months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      },

      // Accesibilidad
      a11y: {
        skipToContent: 'Saltar al contenido',
        mainNavigation: 'Navegación principal',
        openMenu: 'Abrir menú',
        closeMenu: 'Cerrar menú',
        darkMode: 'Modo oscuro',
        lightMode: 'Modo claro',
        language: 'Idioma',
        readingProgress: 'Progreso de lectura'
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ENGLISH
    // ═══════════════════════════════════════════════════════════════════════
    en: {
      // Navigation
      nav: {
        home: 'Home',
        blog: 'Blog',
        categories: 'Categories',
        about: 'About Us',
        contact: 'Contact',
        search: 'Search',
        searchPlaceholder: 'Search articles...',
        noResults: 'No results found',
        menu: 'Menu'
      },

      // Categories
      categories: {
        all: 'All',
        movies: 'Movies',
        series: 'TV Shows',
        anime: 'Anime',
        gaming: 'Gaming',
        tech: 'Technology',
        comics: 'Comics'
      },

      // Hero Section
      hero: {
        title: 'Your Ultimate',
        titleBrand: 'Geek',
        titleEnd: 'Space',
        subtitle: 'News, reviews and analysis of movies, TV shows, anime, video games and technology.',
        cta: 'Explore Content',
        ctaSecondary: 'Subscribe',
        joinCommunity: 'Join +50K geeks'
      },

      // Blog
      blog: {
        title: 'Latest Articles',
        readMore: 'Read more',
        readTime: 'min read',
        views: 'views',
        share: 'Share',
        shareArticle: 'Share article',
        relatedArticles: 'Related Articles',
        comments: 'Comments',
        noArticles: 'No articles available',
        loadMore: 'Load more',
        featured: 'Featured',
        trending: 'Trending',
        latest: 'Latest',
        popular: 'Most popular',
        publishedOn: 'Published on',
        updatedOn: 'Updated on',
        author: 'By',
        tags: 'Tags'
      },

      // Footer
      footer: {
        description: 'The largest Spanish-speaking geek community. Daily content about movies, TV shows, anime, video games and technology.',
        quickLinks: 'Quick Links',
        categories: 'Categories',
        legal: 'Legal',
        followUs: 'Follow Us',
        newsletter: 'Newsletter',
        newsletterDesc: 'Get the best geek news in your inbox',
        subscribe: 'Subscribe',
        emailPlaceholder: 'your@email.com',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        cookies: 'Cookie Policy',
        copyright: '© 2017-2026 Sala Geek. All rights reserved.',
        madeWith: 'Made with',
        forGeeks: 'for geeks'
      },

      // Newsletter
      newsletter: {
        title: "Don't miss anything!",
        subtitle: 'Join our weekly newsletter',
        description: 'Every Sunday, receive a summary with the best news, exclusive reviews and special content.',
        placeholder: 'Your email address',
        button: 'Subscribe',
        success: 'Thanks for subscribing!',
        error: 'Error subscribing. Please try again.',
        privacy: 'We respect your privacy. No spam.'
      },

      // Contact Form
      contact: {
        title: 'Contact Us',
        name: 'Name',
        email: 'Email',
        subject: 'Subject',
        message: 'Message',
        send: 'Send message',
        sending: 'Sending...',
        success: 'Message sent successfully!',
        error: 'Error sending. Please try again.'
      },

      // Common actions
      actions: {
        close: 'Close',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        copy: 'Copy',
        copied: 'Copied!',
        share: 'Share',
        download: 'Download',
        loading: 'Loading...',
        seeMore: 'See more',
        seeLess: 'See less',
        goBack: 'Go back',
        scrollTop: 'Back to top'
      },

      // Cookies
      cookies: {
        title: '🍪 We use cookies',
        message: 'We use cookies to improve your experience. By continuing to browse, you accept our',
        policy: 'cookie policy',
        accept: 'Accept',
        reject: 'Reject',
        settings: 'Settings'
      },

      // PWA Install
      pwa: {
        installTitle: '📱 Install App',
        installMessage: 'Install Sala Geek on your device for a better experience',
        installButton: 'Install',
        later: 'Later'
      },

      // Errors
      errors: {
        notFound: 'Page not found',
        notFoundMessage: "Sorry, the page you're looking for doesn't exist.",
        serverError: 'Server error',
        offline: 'Offline',
        offlineMessage: "You seem to be offline. Check your internet connection.",
        tryAgain: 'Try again'
      },

      // Dates
      dates: {
        today: 'Today',
        yesterday: 'Yesterday',
        daysAgo: '{n} days ago',
        weeksAgo: '{n} weeks ago',
        monthsAgo: '{n} months ago',
        yearsAgo: '{n} years ago',
        months: ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },

      // Accessibility
      a11y: {
        skipToContent: 'Skip to content',
        mainNavigation: 'Main navigation',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
        darkMode: 'Dark mode',
        lightMode: 'Light mode',
        language: 'Language',
        readingProgress: 'Reading progress'
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PORTUGUÊS
    // ═══════════════════════════════════════════════════════════════════════
    pt: {
      // Navegação
      nav: {
        home: 'Início',
        blog: 'Blog',
        categories: 'Categorias',
        about: 'Sobre Nós',
        contact: 'Contato',
        search: 'Buscar',
        searchPlaceholder: 'Buscar artigos...',
        noResults: 'Nenhum resultado encontrado',
        menu: 'Menu'
      },

      // Categorias
      categories: {
        all: 'Todas',
        movies: 'Filmes',
        series: 'Séries',
        anime: 'Anime',
        gaming: 'Games',
        tech: 'Tecnologia',
        comics: 'Quadrinhos'
      },

      // Hero Section
      hero: {
        title: 'Seu Espaço',
        titleBrand: 'Geek',
        titleEnd: 'Definitivo',
        subtitle: 'Notícias, resenhas e análises de filmes, séries, anime, videogames e tecnologia.',
        cta: 'Explorar Conteúdo',
        ctaSecondary: 'Inscrever-se',
        joinCommunity: 'Junte-se a +50K geeks'
      },

      // Blog
      blog: {
        title: 'Últimos Artigos',
        readMore: 'Ler mais',
        readTime: 'min de leitura',
        views: 'visualizações',
        share: 'Compartilhar',
        shareArticle: 'Compartilhar artigo',
        relatedArticles: 'Artigos Relacionados',
        comments: 'Comentários',
        noArticles: 'Nenhum artigo disponível',
        loadMore: 'Carregar mais',
        featured: 'Destaque',
        trending: 'Tendência',
        latest: 'Mais recentes',
        popular: 'Mais populares',
        publishedOn: 'Publicado em',
        updatedOn: 'Atualizado em',
        author: 'Por',
        tags: 'Tags'
      },

      // Footer
      footer: {
        description: 'A maior comunidade geek de língua espanhola. Conteúdo diário sobre filmes, séries, anime, videogames e tecnologia.',
        quickLinks: 'Links Rápidos',
        categories: 'Categorias',
        legal: 'Legal',
        followUs: 'Siga-nos',
        newsletter: 'Newsletter',
        newsletterDesc: 'Receba as melhores notícias geek no seu e-mail',
        subscribe: 'Inscrever-se',
        emailPlaceholder: 'seu@email.com',
        privacyPolicy: 'Política de Privacidade',
        termsOfService: 'Termos de Serviço',
        cookies: 'Política de Cookies',
        copyright: '© 2017-2026 Sala Geek. Todos os direitos reservados.',
        madeWith: 'Feito com',
        forGeeks: 'para geeks'
      },

      // Newsletter
      newsletter: {
        title: 'Não perca nada!',
        subtitle: 'Junte-se à nossa newsletter semanal',
        description: 'Todo domingo, receba um resumo com as melhores notícias, resenhas exclusivas e conteúdo especial.',
        placeholder: 'Seu endereço de e-mail',
        button: 'Inscrever-se',
        success: 'Obrigado por se inscrever!',
        error: 'Erro ao se inscrever. Tente novamente.',
        privacy: 'Respeitamos sua privacidade. Sem spam.'
      },

      // Formulário de Contato
      contact: {
        title: 'Entre em Contato',
        name: 'Nome',
        email: 'E-mail',
        subject: 'Assunto',
        message: 'Mensagem',
        send: 'Enviar mensagem',
        sending: 'Enviando...',
        success: 'Mensagem enviada com sucesso!',
        error: 'Erro ao enviar. Tente novamente.'
      },

      // Ações comuns
      actions: {
        close: 'Fechar',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        save: 'Salvar',
        delete: 'Excluir',
        edit: 'Editar',
        copy: 'Copiar',
        copied: 'Copiado!',
        share: 'Compartilhar',
        download: 'Baixar',
        loading: 'Carregando...',
        seeMore: 'Ver mais',
        seeLess: 'Ver menos',
        goBack: 'Voltar',
        scrollTop: 'Voltar ao topo'
      },

      // Cookies
      cookies: {
        title: '🍪 Usamos cookies',
        message: 'Usamos cookies para melhorar sua experiência. Ao continuar navegando, você aceita nossa',
        policy: 'política de cookies',
        accept: 'Aceitar',
        reject: 'Rejeitar',
        settings: 'Configurar'
      },

      // PWA Install
      pwa: {
        installTitle: '📱 Instalar App',
        installMessage: 'Instale o Sala Geek no seu dispositivo para uma melhor experiência',
        installButton: 'Instalar',
        later: 'Mais tarde'
      },

      // Erros
      errors: {
        notFound: 'Página não encontrada',
        notFoundMessage: 'Desculpe, a página que você procura não existe.',
        serverError: 'Erro do servidor',
        offline: 'Sem conexão',
        offlineMessage: 'Parece que você está sem conexão. Verifique sua internet.',
        tryAgain: 'Tentar novamente'
      },

      // Datas
      dates: {
        today: 'Hoje',
        yesterday: 'Ontem',
        daysAgo: 'há {n} dias',
        weeksAgo: 'há {n} semanas',
        monthsAgo: 'há {n} meses',
        yearsAgo: 'há {n} anos',
        months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      },

      // Acessibilidade
      a11y: {
        skipToContent: 'Pular para o conteúdo',
        mainNavigation: 'Navegação principal',
        openMenu: 'Abrir menu',
        closeMenu: 'Fechar menu',
        darkMode: 'Modo escuro',
        lightMode: 'Modo claro',
        language: 'Idioma',
        readingProgress: 'Progresso de leitura'
      }
    }
  };

  // ============================================================================
  // CONFIGURACIÓN
  // ============================================================================

  const CONFIG = {
    defaultLang: 'es',
    supportedLangs: ['es', 'en', 'pt'],
    storageKey: 'sg_language',
    langAttribute: 'data-i18n',
    langAttrParams: 'data-i18n-params'
  };

  // Estado actual
  let currentLang = CONFIG.defaultLang;

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  /**
   * Obtiene el idioma del navegador
   */
  function getBrowserLang() {
    const browserLang = navigator.language || navigator.userLanguage;
    const lang = browserLang.split('-')[0].toLowerCase();
    return CONFIG.supportedLangs.includes(lang) ? lang : CONFIG.defaultLang;
  }

  /**
   * Obtiene el idioma guardado o detecta del navegador
   */
  function getSavedLang() {
    try {
      const saved = localStorage.getItem(CONFIG.storageKey);
      if (saved && CONFIG.supportedLangs.includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('[i18n] localStorage no disponible');
    }
    return getBrowserLang();
  }

  /**
   * Guarda el idioma seleccionado
   */
  function saveLang(lang) {
    try {
      localStorage.setItem(CONFIG.storageKey, lang);
    } catch (e) {
      console.warn('[i18n] No se pudo guardar el idioma');
    }
  }

  /**
   * Obtiene una traducción por path (ej: 'nav.home')
   */
  function getTranslation(path, lang = currentLang) {
    const keys = path.split('.');
    let value = translations[lang];
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Fallback a español
        if (lang !== CONFIG.defaultLang) {
          return getTranslation(path, CONFIG.defaultLang);
        }
        console.warn(`[i18n] Traducción no encontrada: ${path}`);
        return path;
      }
    }
    
    return value;
  }

  /**
   * Reemplaza parámetros en una cadena (ej: {n} -> 5)
   */
  function interpolate(text, params = {}) {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params.hasOwnProperty(key) ? params[key] : match;
    });
  }

  /**
   * Actualiza todos los elementos con data-i18n
   */
  function updateDOM() {
    // Actualizar atributo lang del HTML
    document.documentElement.lang = currentLang;
    
    // Actualizar elementos con data-i18n
    document.querySelectorAll(`[${CONFIG.langAttribute}]`).forEach(el => {
      const key = el.getAttribute(CONFIG.langAttribute);
      const params = el.getAttribute(CONFIG.langAttrParams);
      let translation = getTranslation(key);
      
      if (params) {
        try {
          const paramsObj = JSON.parse(params);
          translation = interpolate(translation, paramsObj);
        } catch (e) {
          console.warn('[i18n] Error parsing params:', params);
        }
      }
      
      // Determinar si actualizar innerHTML o un atributo
      if (el.hasAttribute('data-i18n-attr')) {
        const attr = el.getAttribute('data-i18n-attr');
        el.setAttribute(attr, translation);
      } else {
        el.textContent = translation;
      }
    });
    
    // Actualizar placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = getTranslation(key);
    });
    
    // Actualizar aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', getTranslation(key));
    });
    
    // Actualizar titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = getTranslation(key);
    });

    // Disparar evento personalizado
    document.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: currentLang } 
    }));
    
    if (DEBUG) console.log(`[i18n] Idioma cambiado a: ${currentLang}`);
  }

  /**
   * Crea el selector de idioma
   */
  function createLanguageSelector() {
    // Si ya existe, no crear otro
    if (document.getElementById('language-selector')) return;

    const langNames = {
      es: { name: 'Español', flag: '🇪🇸' },
      en: { name: 'English', flag: '🇺🇸' },
      pt: { name: 'Português', flag: '🇧🇷' }
    };

    const selector = document.createElement('div');
    selector.id = 'language-selector';
    selector.className = 'language-selector';
    selector.innerHTML = `
      <button class="lang-toggle" aria-label="Cambiar idioma" aria-expanded="false">
        <span class="lang-flag">${langNames[currentLang].flag}</span>
        <span class="lang-code">${currentLang.toUpperCase()}</span>
        <svg class="lang-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="lang-dropdown" role="menu">
        ${CONFIG.supportedLangs.map(lang => `
          <button class="lang-option ${lang === currentLang ? 'active' : ''}" 
                  data-lang="${lang}" 
                  role="menuitem"
                  aria-current="${lang === currentLang ? 'true' : 'false'}">
            <span class="lang-flag">${langNames[lang].flag}</span>
            <span class="lang-name">${langNames[lang].name}</span>
            ${lang === currentLang ? '<svg class="lang-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          </button>
        `).join('')}
      </div>
    `;

    // Insertar después de la navegación o al final del header
    const nav = document.querySelector('.main-nav, .site-header .container');
    if (nav) {
      nav.appendChild(selector);
    }

    // Event listeners
    const toggle = selector.querySelector('.lang-toggle');
    const dropdown = selector.querySelector('.lang-dropdown');

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open');
      toggle.setAttribute('aria-expanded', !isOpen);
    });

    selector.querySelectorAll('.lang-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = btn.dataset.lang;
        if (lang !== currentLang) {
          setLanguage(lang);
          // Actualizar UI del selector
          selector.querySelectorAll('.lang-option').forEach(opt => {
            opt.classList.remove('active');
            opt.setAttribute('aria-current', 'false');
            opt.querySelector('.lang-check')?.remove();
          });
          btn.classList.add('active');
          btn.setAttribute('aria-current', 'true');
          btn.insertAdjacentHTML('beforeend', '<svg class="lang-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>');
          toggle.querySelector('.lang-flag').textContent = langNames[lang].flag;
          toggle.querySelector('.lang-code').textContent = lang.toUpperCase();
        }
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Inicializa el sistema i18n
   */
  function init() {
    currentLang = getSavedLang();
    document.documentElement.lang = currentLang;
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        updateDOM();
        createLanguageSelector();
      });
    } else {
      updateDOM();
      createLanguageSelector();
    }
    
    if (DEBUG) console.log(`[i18n] Inicializado con idioma: ${currentLang}`);
  }

  /**
   * Cambia el idioma
   */
  function setLanguage(lang) {
    if (!CONFIG.supportedLangs.includes(lang)) {
      console.warn(`[i18n] Idioma no soportado: ${lang}`);
      return false;
    }
    
    currentLang = lang;
    saveLang(lang);
    updateDOM();
    return true;
  }

  /**
   * Obtiene el idioma actual
   */
  function getLanguage() {
    return currentLang;
  }

  /**
   * Traduce una clave
   */
  function t(key, params = {}) {
    const translation = getTranslation(key);
    return Object.keys(params).length > 0 ? interpolate(translation, params) : translation;
  }

  /**
   * Obtiene idiomas soportados
   */
  function getSupportedLanguages() {
    return [...CONFIG.supportedLangs];
  }

  // ============================================================================
  // INICIALIZACIÓN AUTOMÁTICA
  // ============================================================================

  // Auto-init cuando el script se carga
  init();

  // ============================================================================
  // EXPORTAR API PÚBLICA
  // ============================================================================

  return {
    init,
    setLanguage,
    getLanguage,
    t,
    getSupportedLanguages,
    translations // Exponer para extensiones
  };

})();

// Alias global para conveniencia
window.__ = SalaGeekI18n.t;
window.i18n = SalaGeekI18n;
