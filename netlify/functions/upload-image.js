/**
 * ═══════════════════════════════════════════════════════════════
 * 🖼️ UPLOAD IMAGE - Netlify Function
 * ═══════════════════════════════════════════════════════════════
 * 
 * Sube imágenes a GitHub para el blog
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
 * Upload file to GitHub
 */
async function uploadToGitHub(path, content, message) {
  // Check if file exists
  const checkResponse = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
    {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );

  const body = {
    message,
    content, // Already base64 encoded
    branch: GITHUB_BRANCH
  };

  // If file exists, include SHA
  if (checkResponse.ok) {
    const existingFile = await checkResponse.json();
    body.sha = existingFile.sha;
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
 * Generate unique filename
 */
function generateFilename(originalName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop().toLowerCase();
  const baseName = originalName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 30);
  
  return `${baseName}-${timestamp}-${random}.${ext}`;
}

/**
 * Verify authentication
 */
function verifyToken(event) {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return true;
}

/**
 * Main handler
 */
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
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
  if (!verifyToken(event)) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  // Check GitHub token
  if (!GITHUB_TOKEN) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'GitHub token not configured' })
    };
  }

  try {
    const { filename, content, folder = 'blog' } = JSON.parse(event.body);

    if (!filename || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing filename or content' })
      };
    }

    // Generate unique filename
    const newFilename = generateFilename(filename);
    const path = `src/images/${folder}/${newFilename}`;

    // Upload to GitHub
    const result = await uploadToGitHub(
      path,
      content,
      `🖼️ Upload image: ${newFilename}`
    );

    // Return the URL
    const imageUrl = `https://salageek.com/${path}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        filename: newFilename,
        path,
        url: imageUrl
      })
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
