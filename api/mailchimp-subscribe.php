<?php
/**
 * ═══════════════════════════════════════════════════════════════
 * 📧 MAILCHIMP SUBSCRIBE - Sala Geek API
 * ═══════════════════════════════════════════════════════════════
 * 
 * Endpoint para suscripción al newsletter via Mailchimp.
 * Incluye verificación de reCAPTCHA v3.
 * 
 * Reemplaza: /.netlify/functions/mailchimp-subscribe
 * Nueva ruta: /api/mailchimp-subscribe.php
 * 
 * ═══════════════════════════════════════════════════════════════
 */

require_once __DIR__ . '/config.php';

// Configurar CORS y manejar preflight
setCorsHeaders();
handlePreflight();

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

// Rate limiting (3 requests por minuto por IP)
if (!checkRateLimit(RATE_LIMIT_WINDOW, RATE_LIMIT_MAX_REQUESTS, 'newsletter')) {
    jsonResponse(['error' => 'Demasiadas solicitudes. Intenta en 1 minuto.'], 429);
}

// Obtener datos del body
$body = getRequestBody();
$email = $body['email'] ?? '';
$recaptchaToken = $body['recaptchaToken'] ?? '';

// Validar email
if (empty($email)) {
    jsonResponse(['error' => 'El email es requerido'], 400);
}

if (!isValidEmail($email)) {
    jsonResponse(['error' => 'Email inválido'], 400);
}

// Sanitizar email
$email = sanitize($email);

// Verificar reCAPTCHA
$recaptchaResult = verifyRecaptcha($recaptchaToken, 0.5);
if (!$recaptchaResult['success']) {
    logError('reCAPTCHA failed', ['email' => $email, 'error' => $recaptchaResult['error']]);
    jsonResponse([
        'error' => $recaptchaResult['error'] ?? 'Verificación de seguridad fallida. Por favor, intenta nuevamente.'
    ], 400);
}

// ─── Suscribir a Mailchimp ───
$mailchimpUrl = 'https://' . MAILCHIMP_DC . '.api.mailchimp.com/3.0/lists/' . MAILCHIMP_AUDIENCE_ID . '/members';

$subscriberData = [
    'email_address' => $email,
    'status' => 'subscribed',
    'tags' => ['Website Subscriber', 'Newsletter'],
    'merge_fields' => [
        'SOURCE' => 'Website'
    ]
];

$mailchimpHeaders = [
    'Authorization: Basic ' . base64_encode('anystring:' . MAILCHIMP_API_KEY),
    'Content-Type: application/json'
];

$result = httpRequest($mailchimpUrl, 'POST', $subscriberData, $mailchimpHeaders);

// Procesar respuesta de Mailchimp
if ($result['success']) {
    // Suscripción exitosa
    jsonResponse([
        'success' => true,
        'message' => '¡Gracias por suscribirte! Revisa tu correo para el mensaje de bienvenida.'
    ]);
}

// Manejar errores específicos de Mailchimp
$mailchimpData = $result['data'];

if (is_array($mailchimpData)) {
    $detail = $mailchimpData['detail'] ?? '';
    $title = $mailchimpData['title'] ?? '';
    
    // Usuario ya existe
    if (strpos($detail, 'already a list member') !== false || 
        strpos($title, 'Member Exists') !== false) {
        jsonResponse([
            'success' => true,
            'message' => '¡Ya estás suscrito! Revisa tu correo para las últimas novedades.'
        ]);
    }
    
    // Email inválido según Mailchimp
    if (strpos($detail, 'looks fake or invalid') !== false) {
        jsonResponse([
            'error' => 'El email parece ser inválido. Por favor, verifica e intenta de nuevo.'
        ], 400);
    }
    
    // Compliance - usuario se dio de baja previamente
    if (strpos($detail, 'compliance') !== false || 
        strpos($title, 'Forgotten Email Not Subscribed') !== false) {
        jsonResponse([
            'error' => 'Este email no puede ser suscrito. Por favor, usa otro correo electrónico.'
        ], 400);
    }
}

// Error genérico
logError('Mailchimp subscription failed', [
    'email' => $email,
    'httpCode' => $result['httpCode'],
    'response' => $mailchimpData
]);

jsonResponse([
    'error' => 'Error al procesar la suscripción. Por favor, intenta más tarde.'
], 500);
