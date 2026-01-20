/**
 * ═══════════════════════════════════════════════════════════════
 * 🖼️ LIST IMAGES - Netlify Function
 * ═══════════════════════════════════════════════════════════════
 * 
 * Lista las imágenes del directorio src/images/blog en GitHub
 * Requiere Netlify Identity para autenticación
 * 
 * ═══════════════════════════════════════════════════════════════
 */

const fetch = require('node-fetch');

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'usuario/sala-geek';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

/**
 * Get directory contents from GitHub
 */
async function getDirectoryContents(path) {
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
    return [];
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Verify authentication
  const user = context.clientContext?.user;
  if (!user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    // Get images from src/images/blog directory
    const contents = await getDirectoryContents('src/images/blog');
    
    // Filter only image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const images = contents
      .filter(item => {
        if (item.type !== 'file') return false;
        const ext = item.name.toLowerCase().slice(item.name.lastIndexOf('.'));
        return imageExtensions.includes(ext);
      })
      .map(item => ({
        name: item.name,
        path: item.path,
        url: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${item.path}`,
        size: item.size,
        sha: item.sha
      }))
      .sort((a, b) => b.name.localeCompare(a.name)); // Newest first (assuming date-based naming)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        images,
        count: images.length
      })
    };
  } catch (error) {
    console.error('Error listing images:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error listing images',
        message: error.message
      })
    };
  }
};
