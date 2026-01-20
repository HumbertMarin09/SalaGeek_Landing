/**
 * ═══════════════════════════════════════════════════════════════
 * 📤 UPLOAD IMAGE - Netlify Function
 * ═══════════════════════════════════════════════════════════════
 * 
 * Sube imágenes al directorio src/images/blog en GitHub
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
 * Create file in GitHub
 */
async function createFile(path, content, message) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        content, // Already base64 encoded
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
 * Generate unique filename
 */
function generateFilename(originalName) {
  const timestamp = Date.now();
  const ext = originalName.slice(originalName.lastIndexOf('.'));
  const baseName = originalName.slice(0, originalName.lastIndexOf('.'))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);
  return `${timestamp}-${baseName}${ext}`;
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
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
    const { filename, content, folder } = JSON.parse(event.body);
    
    if (!filename || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Filename and content are required' })
      };
    }

    // Validate content is base64
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(content.replace(/\s/g, ''))) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Content must be base64 encoded' })
      };
    }

    // Generate unique filename and path
    const uniqueFilename = generateFilename(filename);
    const basePath = folder || 'src/images/blog';
    const filePath = `${basePath}/${uniqueFilename}`;

    // Upload to GitHub
    const result = await createFile(
      filePath,
      content,
      `📸 Upload image: ${uniqueFilename}`
    );

    const imageUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        filename: uniqueFilename,
        path: filePath,
        url: imageUrl,
        sha: result.content.sha
      })
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error uploading image',
        message: error.message
      })
    };
  }
};
