/**
 * ═══════════════════════════════════════════════════════════════
 * 💾 SAVE ARTICLE - Netlify Function
 * ═══════════════════════════════════════════════════════════════
 * 
 * @description Gestión de artículos vía GitHub API
 * @author SalaGeek Team
 * @version 1.1.0
 * 
 * ENDPOINTS:
 * ──────────
 * POST   → Crear/actualizar artículo
 * DELETE → Eliminar artículo
 * 
 * REQUISITOS:
 * ───────────
 * - Netlify Identity para autenticación
 * - Variables de entorno:
 *   • GITHUB_TOKEN: Token con permisos de escritura
 *   • GITHUB_REPO: usuario/repositorio
 *   • GITHUB_BRANCH: rama (default: main)
 * 
 * FLUJO DE GUARDADO:
 * ──────────────────
 * 1. Verifica token de autenticación
 * 2. Obtiene articles.json actual
 * 3. Actualiza/agrega artículo
 * 4. Guarda articles.json actualizado
 * 5. Guarda/actualiza archivo HTML del artículo
 * 
 * ═══════════════════════════════════════════════════════════════
 */

const fetch = require('node-fetch');

// ─── Configuración de GitHub ───
// Establecer en Netlify Environment Variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'usuario/sala-geek';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

/**
 * Obtiene un archivo de GitHub
 * 
 * @param {string} path - Ruta del archivo en el repositorio
 * @returns {Object|null} Contenido del archivo o null si no existe
 */
async function getFile(path) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
    {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ GitHub API Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      url: response.url
    });
    throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create or update file in GitHub
 */
async function saveFile(path, content, message, sha = null) {
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: GITHUB_BRANCH
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GitHub API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Delete file from GitHub
 */
async function deleteFile(path, sha, message) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        sha,
        branch: GITHUB_BRANCH
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GitHub API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Verify Netlify Identity token
 */
function verifyToken(event, context) {
  // First, check if we have a user from Netlify Identity context
  if (context.clientContext?.user) {
    return true;
  }
  
  // Fallback: check Authorization header exists
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  // Check token is not empty
  const token = authHeader.split(' ')[1];
  return token && token.length > 0;
}

/**
 * Main handler
 */
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Verify authentication
  if (!verifyToken(event, context)) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized - No valid token provided' })
    };
  }

  // Check GitHub token
  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN not set in environment variables');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server configuration error: GitHub token not configured',
        hint: 'Set GITHUB_TOKEN in Netlify Site Settings > Environment Variables'
      })
    };
  }

  // Log configuration (without exposing token)
  console.log('🔧 GitHub Config:', {
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    tokenSet: !!GITHUB_TOKEN,
    tokenLength: GITHUB_TOKEN ? GITHUB_TOKEN.length : 0,
    tokenPrefix: GITHUB_TOKEN ? GITHUB_TOKEN.substring(0, 4) + '...' : 'none'
  });

  try {
    // DELETE - Remove article
    if (event.httpMethod === 'DELETE') {
      const { id, slug } = JSON.parse(event.body);

      // Get current articles.json
      const articlesFile = await getFile('blog/data/articles.json');
      const articles = JSON.parse(Buffer.from(articlesFile.content, 'base64').toString());

      // Remove article from array
      articles.articles = articles.articles.filter(a => a.id !== id);

      // Save updated articles.json
      await saveFile(
        'blog/data/articles.json',
        JSON.stringify(articles, null, 2),
        `🗑️ Delete article: ${slug}`,
        articlesFile.sha
      );

      // Delete HTML file
      const htmlFile = await getFile(`blog/articulos/${slug}.html`);
      if (htmlFile) {
        await deleteFile(
          `blog/articulos/${slug}.html`,
          htmlFile.sha,
          `🗑️ Delete article HTML: ${slug}`
        );
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Article deleted' })
      };
    }

    // POST - Create/Update article
    if (event.httpMethod === 'POST') {
      const { article, htmlContent, isNew } = JSON.parse(event.body);

      // Get current articles.json
      const articlesFile = await getFile('blog/data/articles.json');
      let articles;
      let articlesSha = null;

      if (articlesFile) {
        articles = JSON.parse(Buffer.from(articlesFile.content, 'base64').toString());
        articlesSha = articlesFile.sha;
      } else {
        articles = { articles: [], categories: [] };
      }

      // Update or add article
      const existingIndex = articles.articles.findIndex(a => a.id === article.id);
      if (existingIndex >= 0) {
        articles.articles[existingIndex] = article;
      } else {
        articles.articles.unshift(article);
      }

      // Sort by date (newest first)
      articles.articles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

      // Save articles.json
      await saveFile(
        'blog/data/articles.json',
        JSON.stringify(articles, null, 2),
        isNew ? `📝 New article: ${article.title}` : `✏️ Update article: ${article.title}`,
        articlesSha
      );

      // Save HTML file
      const htmlPath = `blog/articulos/${article.slug}.html`;
      const existingHtml = await getFile(htmlPath);
      
      await saveFile(
        htmlPath,
        htmlContent,
        isNew ? `📄 Create article HTML: ${article.slug}` : `📄 Update article HTML: ${article.slug}`,
        existingHtml?.sha
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: isNew ? 'Article created' : 'Article updated',
          article 
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
