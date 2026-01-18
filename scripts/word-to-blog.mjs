#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 WORD TO BLOG CONVERTER - Sala Geek
 * ═══════════════════════════════════════════════════════════════
 * 
 * Convierte documentos Word (.docx) al formato HTML del blog
 * 
 * USO:
 *   node scripts/word-to-blog.mjs articulo.docx
 *   npm run convert-article articulo.docx
 * 
 * ═══════════════════════════════════════════════════════════════
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}\n`)
};

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE CATEGORÍAS
// ═══════════════════════════════════════════════════════════════

const CATEGORIES = {
  series: {
    id: 'series',
    name: 'Series',
    svg: '<rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline>'
  },
  peliculas: {
    id: 'peliculas',
    name: 'Películas',
    svg: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>'
  },
  gaming: {
    id: 'gaming',
    name: 'Gaming',
    svg: '<rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="6.01" y2="12"/><line x1="10" y1="12" x2="18" y2="12"/>'
  },
  anime: {
    id: 'anime',
    name: 'Anime',
    svg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
  },
  tecnologia: {
    id: 'tecnologia',
    name: 'Tecnología',
    svg: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>'
  }
};

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE PARSING
// ═══════════════════════════════════════════════════════════════

/**
 * Parsea la metadata del documento Word (formato texto)
 */
function parseMetadata(content) {
  const metadata = {
    title: '',
    slug: '',
    excerpt: '',
    category: 'series',
    categoryDisplay: 'Series',
    tags: [],
    publishDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    readTime: '5 min',
    image: '',
    featured: false,
    trending: false
  };

  // Extraer título
  const titleMatch = content.match(/Título:\s*\n([^\n]+)/i);
  if (titleMatch) metadata.title = titleMatch[1].trim();

  // Extraer slug
  const slugMatch = content.match(/Slug\s*\(URL\):\s*\n([^\n]+)/i);
  if (slugMatch) metadata.slug = slugMatch[1].trim().toLowerCase().replace(/\s+/g, '-');

  // Extraer excerpt/descripción
  const excerptMatch = content.match(/Descripción Corta\s*\(Excerpt\):\s*\n([^\n]+)/i);
  if (excerptMatch) metadata.excerpt = excerptMatch[1].trim();

  // Extraer categoría
  const categoryPatterns = [
    { pattern: /☑\s*Series/i, id: 'series', name: 'Series' },
    { pattern: /☑\s*Pel[íi]culas/i, id: 'peliculas', name: 'Películas' },
    { pattern: /☑\s*Gaming/i, id: 'gaming', name: 'Gaming' },
    { pattern: /☑\s*Anime/i, id: 'anime', name: 'Anime' },
    { pattern: /☑\s*Tecnolog[íi]a/i, id: 'tecnologia', name: 'Tecnología' }
  ];
  
  for (const cat of categoryPatterns) {
    if (cat.pattern.test(content)) {
      metadata.category = cat.id;
      metadata.categoryDisplay = cat.name;
      break;
    }
  }

  // Extraer tags
  const tagsMatch = content.match(/Tags\s*\(separados por comas\):\s*\n([^\n]+)/i);
  if (tagsMatch) {
    metadata.tags = tagsMatch[1].split(',').map(t => t.trim().toLowerCase()).filter(t => t);
  }

  // Extraer fecha
  const dateMatch = content.match(/Fecha de Publicaci[óo]n:\s*\n(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (dateMatch) {
    const [day, month, year] = dateMatch[1].split('/');
    metadata.publishDate = new Date(year, month - 1, day).toISOString();
    metadata.modifiedDate = metadata.publishDate;
  }

  // Extraer tiempo de lectura
  const readTimeMatch = content.match(/Tiempo de Lectura[^:]*:\s*\n(\d+)\s*min/i);
  if (readTimeMatch) metadata.readTime = `${readTimeMatch[1]} min`;

  // Extraer imagen
  const imageMatch = content.match(/Imagen Principal:\s*\n([^\n]+)/i);
  if (imageMatch) {
    const img = imageMatch[1].trim();
    if (img.startsWith('http')) {
      metadata.image = img;
    } else {
      metadata.image = `/src/images/blog/${img}`;
    }
  }

  // Extraer estados
  metadata.featured = /☑\s*Featured/i.test(content);
  metadata.trending = /☑\s*Trending/i.test(content);

  return metadata;
}

/**
 * Extrae el contenido del artículo entre los marcadores
 */
function extractArticleContent(content) {
  const startMarker = '[INICIO DE CONTENIDO]';
  const endMarker = '[FIN DE CONTENIDO]';
  
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);
  
  if (startIdx === -1 || endIdx === -1) {
    // Intentar extraer contenido después de "CONTENIDO DEL ARTÍCULO"
    const altStart = content.indexOf('CONTENIDO DEL ARTÍCULO');
    if (altStart !== -1) {
      const afterHeader = content.substring(altStart + 50);
      const checklistIdx = afterHeader.indexOf('CHECKLIST');
      if (checklistIdx !== -1) {
        return afterHeader.substring(0, checklistIdx).trim();
      }
      return afterHeader.trim();
    }
    return '';
  }
  
  return content.substring(startIdx + startMarker.length, endIdx).trim();
}

/**
 * Convierte Markdown a HTML
 */
function markdownToHtml(markdown) {
  let html = markdown;
  
  // Limpiar líneas de separadores decorativos
  html = html.replace(/═{3,}/g, '');
  html = html.replace(/─{3,}/g, '');
  
  // Convertir headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  
  // Convertir negritas y cursivas
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Convertir enlaces
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  
  // Convertir blockquotes
  html = html.replace(/^>\s*"([^"]+)"\s*\n>\s*-\s*(.+)$/gm, '<blockquote>\n  <p>"$1"</p>\n  <cite>— $2</cite>\n</blockquote>');
  html = html.replace(/^>\s*(.+)$/gm, '<blockquote><p>$1</p></blockquote>');
  
  // Convertir bloques especiales (💡, ⚠️, ✨)
  html = html.replace(/💡\s*\*\*([^*]+)\*\*:\s*([^\n]+)/g, '<div class="info-box tip">\n  <strong>💡 $1:</strong> $2\n</div>');
  html = html.replace(/⚠️\s*\*\*([^*]+)\*\*:\s*([^\n]+)/g, '<div class="info-box warning">\n  <strong>⚠️ $1:</strong> $2\n</div>');
  html = html.replace(/✨\s*\*\*([^*]+)\*\*:\s*([^\n]+)/g, '<div class="info-box tip">\n  <strong>✨ $1:</strong> $2\n</div>');
  
  // Convertir listas con viñetas
  const ulRegex = /^- (.+)$/gm;
  let inList = false;
  const lines = html.split('\n');
  const processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const listMatch = line.match(/^- (.+)$/);
    
    if (listMatch) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(`  <li>${listMatch[1]}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(line);
    }
  }
  if (inList) processedLines.push('</ul>');
  html = processedLines.join('\n');
  
  // Convertir listas numeradas
  const olRegex = /^\d+\.\s+(.+)$/gm;
  inList = false;
  const lines2 = html.split('\n');
  const processedLines2 = [];
  
  for (let i = 0; i < lines2.length; i++) {
    const line = lines2[i];
    const listMatch = line.match(/^\d+\.\s+(.+)$/);
    
    if (listMatch) {
      if (!inList) {
        processedLines2.push('<ol>');
        inList = true;
      }
      processedLines2.push(`  <li>${listMatch[1]}</li>`);
    } else {
      if (inList) {
        processedLines2.push('</ol>');
        inList = false;
      }
      processedLines2.push(line);
    }
  }
  if (inList) processedLines2.push('</ol>');
  html = processedLines2.join('\n');
  
  // Convertir separadores
  html = html.replace(/^---$/gm, '<hr />');
  
  // Convertir párrafos (líneas no vacías que no son ya HTML)
  const lines3 = html.split('\n');
  const processedLines3 = [];
  
  for (const line of lines3) {
    const trimmed = line.trim();
    if (trimmed === '') {
      processedLines3.push('');
    } else if (
      trimmed.startsWith('<') || 
      trimmed.startsWith('</') ||
      trimmed === ''
    ) {
      processedLines3.push(line);
    } else {
      processedLines3.push(`<p>${trimmed}</p>`);
    }
  }
  
  html = processedLines3.join('\n');
  
  // Limpiar múltiples líneas vacías
  html = html.replace(/\n{3,}/g, '\n\n');
  
  // Limpiar párrafos vacíos
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>\s*<\/p>/g, '');
  
  return html.trim();
}

/**
 * Formatea fecha para mostrar
 */
function formatDisplayDate(isoDate) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const date = new Date(isoDate);
  return `${date.getDate()} de ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

/**
 * Genera el HTML completo del artículo
 */
function generateArticleHtml(metadata, contentHtml) {
  const category = CATEGORIES[metadata.category] || CATEGORIES.series;
  const dateOnly = metadata.publishDate.split('T')[0];
  
  // Extraer primer párrafo para el lead
  const leadMatch = contentHtml.match(/<p>([^<]+)<\/p>/);
  const leadText = leadMatch ? leadMatch[1] : metadata.excerpt;
  
  // Remover el primer párrafo del contenido si se usó como lead
  let mainContent = contentHtml;
  if (leadMatch) {
    mainContent = contentHtml.replace(leadMatch[0], '');
  }

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  <!-- SEO Meta Tags -->
  <title>${metadata.title} | Sala Geek</title>
  <meta name="description" content="${metadata.excerpt}" />
  <meta name="keywords" content="${metadata.tags.join(', ')}" />
  <meta name="author" content="Sala Geek" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="https://salageek.com/blog/articulos/${metadata.slug}.html" />
  
  <meta name="article:published_time" content="${metadata.publishDate}" />
  <meta name="article:modified_time" content="${metadata.modifiedDate}" />
  <meta name="article:section" content="${metadata.categoryDisplay}" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${metadata.title}" />
  <meta property="og:description" content="${metadata.excerpt}" />
  <meta property="og:image" content="https://salageek.com${metadata.image}" />
  <meta property="og:url" content="https://salageek.com/blog/articulos/${metadata.slug}.html" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${metadata.title}" />
  <meta name="twitter:description" content="${metadata.excerpt}" />
  <meta name="twitter:image" content="https://salageek.com${metadata.image}" />

  <!-- Favicons -->
  <link rel="icon" href="/src/images/Icono_SG.ico" type="image/x-icon" />
  <link rel="apple-touch-icon" href="/src/images/SalaGeek_LOGO.webp" />
  <meta name="theme-color" content="#1a1f3a" />

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/src/css/normalize.css" />
  <link rel="stylesheet" href="/src/css/style.min.css?v=220" />
  <link rel="stylesheet" href="/src/css/blog.css?v=253" />
  
  <!-- Blog Engine para artículos relacionados -->
  <script src="/src/js/blog-engine.js?v=5" defer></script>
</head>

<body class="article-page">
  <!-- Header inyectado -->
  <div id="header-container"></div>

  <main class="blog-article-page">
    <!-- Breadcrumbs -->
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
          <a href="/blog/?categoria=${metadata.category}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              ${category.svg}
            </svg>
            ${metadata.categoryDisplay}
          </a>
        </li>
        <li aria-current="page">${metadata.title.substring(0, 50)}${metadata.title.length > 50 ? '...' : ''}</li>
      </ol>
    </nav>

    <article class="article-full">
      <!-- HEADER DEL ARTÍCULO -->
      <header class="article-header">
        <div class="article-meta-top">
          <a href="/blog/?categoria=${metadata.category}" class="article-category category-${metadata.category}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${category.svg}
            </svg>
            ${metadata.categoryDisplay}
          </a>
          <time datetime="${dateOnly}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${formatDisplayDate(metadata.publishDate)}
          </time>
        </div>

        <h1 class="article-title">${metadata.title}</h1>

        <p class="article-excerpt">
          ${metadata.excerpt}
        </p>

        <div class="article-meta-bottom">
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${metadata.readTime} de lectura
          </span>
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span id="view-count">0</span> vistas
          </span>
        </div>
      </header>

      <!-- IMAGEN DESTACADA -->
      <figure class="article-featured-image">
        <img 
          src="${metadata.image}" 
          alt="${metadata.title}"
          loading="eager"
          width="1200"
          height="630"
        />
      </figure>

      <!-- CONTENIDO DEL ARTÍCULO -->
      <div class="article-content">
        
        <p class="lead">
          ${leadText}
        </p>

        ${mainContent}

      </div>

      <!-- Compartir en redes -->
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>Twitter</span>
          </button>
          <button class="share-btn share-facebook" onclick="shareOnFacebook()" aria-label="Compartir en Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </button>
          <button class="share-btn share-whatsapp" onclick="shareOnWhatsApp()" aria-label="Compartir en WhatsApp">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>WhatsApp</span>
          </button>
          <button class="share-btn share-copy" onclick="copyLink(this)" aria-label="Copiar enlace">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        ${metadata.tags.map(tag => `<a href="/blog/#tag-${tag.replace(/\s+/g, '-')}" class="article-tag">${tag}</a>`).join('\n        ')}
      </div>

      <!-- Artículos Relacionados (carga dinámica) -->
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

      <!-- Comentarios con Giscus -->
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
          </script>
        </div>
      </section>

    </article>
  </main>

  <!-- Footer inyectado -->
  <div id="footer-container"></div>

  <!-- Scripts -->
  <script src="/src/js/script.min.js?v=145" defer></script>
  
  <!-- Funciones de compartir -->
  <script>
    function shareOnTwitter() {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(document.title);
      window.open(\`https://twitter.com/intent/tweet?url=\${url}&text=\${text}\`, '_blank', 'width=550,height=420');
    }
    
    function shareOnFacebook() {
      const url = encodeURIComponent(window.location.href);
      window.open(\`https://www.facebook.com/sharer/sharer.php?u=\${url}\`, '_blank', 'width=550,height=420');
    }
    
    function shareOnWhatsApp() {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(document.title);
      window.open(\`https://wa.me/?text=\${text}%20\${url}\`, '_blank');
    }
    
    function copyLink(btn) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        btn.classList.add('copied');
        const span = btn.querySelector('span');
        const originalText = span.textContent;
        span.textContent = '¡Copiado!';
        btn.querySelector('svg').innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
        setTimeout(() => {
          btn.classList.remove('copied');
          span.textContent = originalText;
          btn.querySelector('svg').innerHTML = '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>';
        }, 2000);
      });
    }
  </script>

  <!-- Cargar artículos relacionados -->
  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      const blogEngine = new BlogEngine();
      await blogEngine.init();
      
      // Obtener ID del artículo actual desde el slug
      const currentSlug = window.location.pathname.split('/').pop().replace('.html', '');
      const currentArticle = blogEngine.articles.find(a => a.slug === currentSlug);
      
      if (currentArticle) {
        // Cargar artículos relacionados
        const related = blogEngine.getRelatedArticles(currentArticle.id, 3);
        const relatedContainer = document.getElementById('related-articles');
        
        if (related.length > 0 && relatedContainer) {
          relatedContainer.innerHTML = related.map(article => \`
            <article class="related-card">
              <a href="\${article.content}" class="related-card-link">
                <div class="related-card-image">
                  <img src="\${article.image}" alt="\${article.title}" loading="lazy" />
                  <span class="related-card-category category-\${article.category}">\${article.categoryDisplay}</span>
                </div>
                <div class="related-card-content">
                  <h4 class="related-card-title">\${article.title}</h4>
                  <span class="related-card-date">\${blogEngine.formatDate(article.publishDate)}</span>
                </div>
              </a>
            </article>
          \`).join('');
        } else if (relatedContainer) {
          relatedContainer.innerHTML = '<p class="no-related">No hay artículos relacionados disponibles.</p>';
        }
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Genera la entrada JSON para articles.json
 */
function generateArticleJson(metadata) {
  return {
    id: metadata.slug,
    title: metadata.title,
    slug: metadata.slug,
    excerpt: metadata.excerpt,
    content: `/blog/articulos/${metadata.slug}.html`,
    image: metadata.image,
    category: metadata.category,
    categoryDisplay: metadata.categoryDisplay,
    tags: metadata.tags,
    author: "Sala Geek",
    publishDate: metadata.publishDate,
    modifiedDate: metadata.modifiedDate,
    readTime: metadata.readTime,
    views: 0,
    featured: metadata.featured,
    trending: metadata.trending
  };
}

// ═══════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════

async function main() {
  log.title('📝 WORD TO BLOG CONVERTER - Sala Geek');
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log.info('Uso: node scripts/word-to-blog.mjs <archivo.txt>');
    log.info('     npm run convert-article <archivo.txt>');
    log.info('');
    log.info('El archivo debe ser texto plano exportado desde Word.');
    log.info('Usa la plantilla de PLANTILLA-ARTICULO-WORD.md');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const inputPath = path.isAbsolute(inputFile) ? inputFile : path.resolve(process.cwd(), inputFile);
  
  // Verificar que el archivo existe
  try {
    await fs.access(inputPath);
  } catch {
    log.error(`Archivo no encontrado: ${inputPath}`);
    process.exit(1);
  }
  
  log.info(`Leyendo archivo: ${inputPath}`);
  
  // Leer contenido del archivo
  const content = await fs.readFile(inputPath, 'utf-8');
  
  // Parsear metadata
  log.info('Extrayendo metadata...');
  const metadata = parseMetadata(content);
  
  if (!metadata.title || !metadata.slug) {
    log.error('No se pudo extraer título o slug del documento.');
    log.info('Asegúrate de usar el formato correcto de la plantilla.');
    process.exit(1);
  }
  
  log.success(`Título: ${metadata.title}`);
  log.success(`Slug: ${metadata.slug}`);
  log.success(`Categoría: ${metadata.categoryDisplay}`);
  log.success(`Tags: ${metadata.tags.join(', ')}`);
  
  // Extraer y convertir contenido
  log.info('Extrayendo contenido del artículo...');
  const articleContent = extractArticleContent(content);
  
  if (!articleContent) {
    log.warn('No se encontró contenido entre [INICIO DE CONTENIDO] y [FIN DE CONTENIDO]');
    log.info('Intentando extraer contenido automáticamente...');
  }
  
  log.info('Convirtiendo Markdown a HTML...');
  const contentHtml = markdownToHtml(articleContent);
  
  // Generar HTML completo
  log.info('Generando archivo HTML...');
  const fullHtml = generateArticleHtml(metadata, contentHtml);
  
  // Guardar archivo HTML
  const outputPath = path.join(ROOT_DIR, 'blog', 'articulos', `${metadata.slug}.html`);
  await fs.writeFile(outputPath, fullHtml, 'utf-8');
  log.success(`HTML guardado: ${outputPath}`);
  
  // Generar entrada JSON
  const jsonEntry = generateArticleJson(metadata);
  
  // Leer articles.json actual
  const articlesPath = path.join(ROOT_DIR, 'blog', 'data', 'articles.json');
  let articlesData;
  
  try {
    const articlesContent = await fs.readFile(articlesPath, 'utf-8');
    articlesData = JSON.parse(articlesContent);
  } catch {
    articlesData = { articles: [], categories: [] };
  }
  
  // Verificar si ya existe el artículo
  const existingIndex = articlesData.articles.findIndex(a => a.id === metadata.slug);
  
  if (existingIndex >= 0) {
    articlesData.articles[existingIndex] = jsonEntry;
    log.warn(`Artículo actualizado en articles.json (ya existía)`);
  } else {
    articlesData.articles.unshift(jsonEntry); // Agregar al inicio
    log.success(`Artículo agregado a articles.json`);
  }
  
  // Guardar articles.json
  await fs.writeFile(articlesPath, JSON.stringify(articlesData, null, 2), 'utf-8');
  log.success(`articles.json actualizado`);
  
  // Resumen final
  log.title('✅ CONVERSIÓN COMPLETADA');
  console.log(`
  ${colors.cyan}Archivos generados:${colors.reset}
  • HTML: blog/articulos/${metadata.slug}.html
  • JSON: blog/data/articles.json (actualizado)
  
  ${colors.cyan}Próximos pasos:${colors.reset}
  1. Verifica el artículo en: http://localhost:5173/blog/articulos/${metadata.slug}.html
  2. Agrega la imagen: src/images/blog/[nombre-imagen].webp
  3. Revisa el contenido HTML generado
  4. Haz commit y push para publicar
  `);
}

// Ejecutar
main().catch(err => {
  log.error(`Error: ${err.message}`);
  process.exit(1);
});
