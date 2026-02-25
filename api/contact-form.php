<?php
/**
 * ═══════════════════════════════════════════════════════════════
 * 📧 API DE FORMULARIO DE CONTACTO - Sala Geek
 * ═══════════════════════════════════════════════════════════════
 * 
 * Procesa el formulario de contacto del Media Kit.
 * Envía emails usando la función mail() de PHP o SMTP si se configura.
 * 
 * Reemplaza: Netlify Forms (data-netlify="true")
 * 
 * ═══════════════════════════════════════════════════════════════
 */

require_once __DIR__ . '/config.php';

// Configurar CORS y manejar preflight
setCorsHeaders();
handlePreflight();

// Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Rate limiting (más estricto para formularios)
if (!checkRateLimit(300, 5, 'contact_form')) { // 5 solicitudes por 5 minutos
    jsonResponse(['error' => 'Demasiadas solicitudes. Intenta en unos minutos.'], 429);
}

try {
    // Obtener datos del formulario
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    if (strpos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
    } else {
        $input = $_POST;
    }
    
    // Validar campos requeridos
    $required = ['company', 'name', 'email', 'service', 'message'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            jsonResponse(['error' => "El campo '$field' es requerido"], 400);
        }
    }
    
    // Validar email
    $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        jsonResponse(['error' => 'Email inválido'], 400);
    }
    
    // Verificar honeypot (anti-spam)
    if (!empty($input['bot-field'])) {
        // Es un bot, fingir éxito
        jsonResponse(['success' => true, 'message' => 'Mensaje enviado correctamente']);
    }
    
    // Sanitizar datos
    $company = htmlspecialchars(strip_tags($input['company']), ENT_QUOTES, 'UTF-8');
    $name = htmlspecialchars(strip_tags($input['name']), ENT_QUOTES, 'UTF-8');
    $phone = htmlspecialchars(strip_tags($input['phone'] ?? 'No proporcionado'), ENT_QUOTES, 'UTF-8');
    $service = htmlspecialchars(strip_tags($input['service']), ENT_QUOTES, 'UTF-8');
    $message = htmlspecialchars(strip_tags($input['message']), ENT_QUOTES, 'UTF-8');
    
    // Mapear servicios a nombres legibles
    $serviceNames = [
        'post' => 'Post Patrocinado',
        'stories' => 'Historias/Reels',
        'newsletter' => 'Newsletter',
        'review' => 'Review/Unboxing',
        'event' => 'Cobertura de Evento',
        'campaign' => 'Campaña Mensual',
        'ambassador' => 'Embajador de Marca',
        'banner' => 'Banner en Sitio Web',
        'article' => 'Artículo Patrocinado',
        'custom' => 'Propuesta Personalizada'
    ];
    $serviceName = $serviceNames[$service] ?? $service;
    
    // Preparar email
    $to = defined('CONTACT_EMAIL') ? CONTACT_EMAIL : ADMIN_EMAIL;
    $subject = "🎮 Nueva Solicitud Media Kit - $company";
    
    $emailBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #6366f1; }
        .value { background: white; padding: 10px; border-radius: 5px; margin-top: 5px; }
        .footer { text-align: center; padding: 15px; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0;">📬 Nueva Solicitud de Media Kit</h1>
            <p style="margin:5px 0 0;">Sala Geek - Formulario de Contacto</p>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">🏢 Empresa / Marca</div>
                <div class="value">{$company}</div>
            </div>
            <div class="field">
                <div class="label">👤 Nombre</div>
                <div class="value">{$name}</div>
            </div>
            <div class="field">
                <div class="label">📧 Email</div>
                <div class="value"><a href="mailto:{$email}">{$email}</a></div>
            </div>
            <div class="field">
                <div class="label">📱 Teléfono</div>
                <div class="value">{$phone}</div>
            </div>
            <div class="field">
                <div class="label">🎯 Servicio de Interés</div>
                <div class="value">{$serviceName}</div>
            </div>
            <div class="field">
                <div class="label">💬 Mensaje</div>
                <div class="value">{$message}</div>
            </div>
        </div>
        <div class="footer">
            Enviado desde salageek.com • {$_SERVER['HTTP_HOST']}
        </div>
    </div>
</body>
</html>
HTML;

    // Headers del email
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: Sala Geek <noreply@salageek.com>',
        'Reply-To: ' . $email,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    // Enviar email
    $sent = mail($to, $subject, $emailBody, implode("\r\n", $headers));
    
    if ($sent) {
        jsonResponse([
            'success' => true,
            'message' => '¡Mensaje enviado! Te contactaremos pronto.'
        ]);
    } else {
        // Log del error para debugging
        error_log("Error enviando email de contacto desde: $email");
        jsonResponse([
            'error' => 'Error al enviar el mensaje. Por favor, intenta de nuevo o escríbenos directamente.'
        ], 500);
    }
    
} catch (Exception $e) {
    error_log("Error en contact-form.php: " . $e->getMessage());
    jsonResponse(['error' => 'Error interno del servidor'], 500);
}
