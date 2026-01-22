const fetch = require('node-fetch');

// Rate limiting simple en memoria (resetea cada vez que se reinicia la función)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 3; // 3 solicitudes por minuto por IP

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // Limpiar solicitudes antiguas
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Rate limiting por IP
  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  if (!checkRateLimit(ip)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Demasiadas solicitudes. Intenta en 1 minuto.' })
    };
  }

  try {
    const { email, recaptchaToken } = JSON.parse(event.body);

    // Validar email
    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email inválido' })
      };
    }

    // Validar reCAPTCHA token
    if (!recaptchaToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Token de reCAPTCHA requerido' })
      };
    }

    // Verificar reCAPTCHA con Google
    const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    });

    const recaptchaData = await recaptchaResponse.json();

    // Validar resultado de reCAPTCHA
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      console.error('reCAPTCHA validation failed:', recaptchaData);
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Verificación de seguridad fallida. Por favor, intenta nuevamente.' 
        })
      };
    }

    // Configuración de Mailchimp desde variables de entorno
    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    const MAILCHIMP_DC = process.env.MAILCHIMP_DC || 'us5'; // Datacenter
    
    const url = `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

    // Llamada a la API de Mailchimp
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        tags: ['Website'],
        merge_fields: {
          RECAPTCHA: recaptchaData.score.toFixed(2) // Guardar el score para referencia
        }
      })
    });

    const data = await response.json();

    // Manejar respuesta de Mailchimp
    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          message: '¡Gracias por suscribirte! Revisa tu correo.' 
        })
      };
    } else if (data.title === 'Member Exists') {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          message: 'Ya estás suscrito a nuestro newsletter.' 
        })
      };
    } else {
      console.error('Mailchimp error:', data);
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Error al suscribirse. Intenta de nuevo.' 
        })
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error del servidor. Intenta más tarde.' 
      })
    };
  }
};
