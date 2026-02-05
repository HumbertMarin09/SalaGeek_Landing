<?php
/**
 * ═══════════════════════════════════════════════════════════════
 * 🔐 AUTH - Sala Geek Admin API
 * ═══════════════════════════════════════════════════════════════
 * 
 * Sistema de autenticación para el panel de administración.
 * Reemplaza Netlify Identity con sesiones PHP.
 * 
 * Endpoints:
 * - POST /api/auth.php?action=login
 * - POST /api/auth.php?action=logout
 * - GET  /api/auth.php?action=check
 * - POST /api/auth.php?action=change-password
 * - POST /api/auth.php?action=forgot-password
 * - POST /api/auth.php?action=reset-password
 * 
 * ═══════════════════════════════════════════════════════════════
 */

require_once __DIR__ . '/config.php';

// Configurar CORS y manejar preflight
setCorsHeaders();
handlePreflight();

// Obtener acción
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check':
        checkSession();
        break;
    case 'change-password':
        handleChangePassword();
        break;
    case 'forgot-password':
        handleForgotPassword();
        break;
    case 'reset-password':
        handleResetPassword();
        break;
    default:
        jsonResponse(['error' => 'Acción no válida'], 400);
}

/**
 * Maneja el login
 */
function handleLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Método no permitido'], 405);
    }
    
    // Rate limiting para login (5 intentos por 5 minutos)
    if (!checkRateLimit(300, 5, 'login')) {
        jsonResponse([
            'error' => 'Demasiados intentos de inicio de sesión. Intenta en 5 minutos.'
        ], 429);
    }
    
    $body = getRequestBody();
    $email = sanitize($body['email'] ?? '');
    $password = $body['password'] ?? '';
    
    // Validaciones
    if (empty($email) || empty($password)) {
        jsonResponse(['error' => 'Email y contraseña son requeridos'], 400);
    }
    
    if (!isValidEmail($email)) {
        jsonResponse(['error' => 'Email inválido'], 400);
    }
    
    // Verificar credenciales
    if ($email === ADMIN_EMAIL && password_verify($password, ADMIN_PASSWORD_HASH)) {
        initSecureSession();
        
        // Regenerar ID de sesión para prevenir session fixation
        session_regenerate_id(true);
        
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_email'] = $email;
        $_SESSION['admin_name'] = ADMIN_NAME;
        $_SESSION['admin_login_time'] = time();
        $_SESSION['admin_ip'] = $_SERVER['REMOTE_ADDR'] ?? '';
        
        // Generar un token simple para las peticiones (similar a JWT pero más simple)
        $token = bin2hex(random_bytes(32));
        $_SESSION['admin_token'] = $token;
        
        jsonResponse([
            'success' => true,
            'user' => [
                'email' => $email,
                'name' => ADMIN_NAME
            ],
            'token' => $token
        ]);
    }
    
    // Login fallido
    logError('Failed login attempt', ['email' => $email, 'ip' => $_SERVER['REMOTE_ADDR'] ?? '']);
    
    jsonResponse(['error' => 'Credenciales inválidas'], 401);
}

/**
 * Maneja el logout
 */
function handleLogout() {
    initSecureSession();
    
    // Limpiar todas las variables de sesión
    $_SESSION = [];
    
    // Destruir la cookie de sesión
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }
    
    // Destruir la sesión
    session_destroy();
    
    jsonResponse(['success' => true, 'message' => 'Sesión cerrada correctamente']);
}

/**
 * Verifica el estado de la sesión
 */
function checkSession() {
    $user = getCurrentUser();
    
    if ($user) {
        // También devolver el token si está disponible
        initSecureSession();
        $token = $_SESSION['admin_token'] ?? null;
        
        jsonResponse([
            'authenticated' => true,
            'user' => $user,
            'token' => $token
        ]);
    }
    
    jsonResponse(['authenticated' => false]);
}

/**
 * Maneja el cambio de contraseña
 */
function handleChangePassword() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Método no permitido'], 405);
    }
    
    // Requiere estar autenticado
    requireAuth();
    
    $body = getRequestBody();
    $currentPassword = $body['currentPassword'] ?? '';
    $newPassword = $body['newPassword'] ?? '';
    
    // Validaciones
    if (empty($currentPassword) || empty($newPassword)) {
        jsonResponse(['error' => 'Ambas contraseñas son requeridas'], 400);
    }
    
    if (strlen($newPassword) < 8) {
        jsonResponse(['error' => 'La nueva contraseña debe tener al menos 8 caracteres'], 400);
    }
    
    // Verificar contraseña actual
    if (!password_verify($currentPassword, ADMIN_PASSWORD_HASH)) {
        jsonResponse(['error' => 'Contraseña actual incorrecta'], 400);
    }
    
    // Generar nuevo hash
    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // En un sistema real, guardaríamos esto en base de datos
    // Por ahora, instruimos al usuario a actualizar manualmente
    jsonResponse([
        'success' => true,
        'message' => 'Para completar el cambio, actualiza ADMIN_PASSWORD_HASH en las variables de entorno de Hostinger.',
        'newHash' => $newHash,
        'instructions' => 'Copia este hash y pégalo en: Panel Hostinger > Sitios > Tu sitio > Configuración avanzada > Variables de entorno > ADMIN_PASSWORD_HASH'
    ]);
}

/**
 * Genera token de recuperación de contraseña
 */
function handleForgotPassword() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Método no permitido'], 405);
    }
    
    // Rate limiting (3 intentos por hora)
    if (!checkRateLimit(3600, 3, 'forgot-password')) {
        jsonResponse([
            'error' => 'Demasiados intentos de recuperación. Intenta en 1 hora.'
        ], 429);
    }
    
    // Generar token único y seguro
    $token = bin2hex(random_bytes(32));
    $expiresAt = time() + (15 * 60); // Expira en 15 minutos
    
    // Iniciar sesión para almacenar el token
    initSecureSession();
    
    // Guardar token en sesión
    $_SESSION['recovery_token'] = $token;
    $_SESSION['recovery_expires'] = $expiresAt;
    
    jsonResponse([
        'success' => true,
        'token' => $token,
        'expiresIn' => 900, // 15 minutos en segundos
        'message' => 'Token generado exitosamente. Válido por 15 minutos.'
    ]);
}

/**
 * Resetea contraseña usando token de recuperación
 */
function handleResetPassword() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Método no permitido'], 405);
    }
    
    // Rate limiting (5 intentos por 10 minutos)
    if (!checkRateLimit(600, 5, 'reset-password')) {
        jsonResponse([
            'error' => 'Demasiados intentos de reseteo. Intenta en 10 minutos.'
        ], 429);
    }
    
    $body = getRequestBody();
    $token = sanitize($body['token'] ?? '');
    $newPassword = $body['newPassword'] ?? '';
    
    // Validaciones
    if (empty($token) || empty($newPassword)) {
        jsonResponse(['error' => 'Token y contraseña son requeridos'], 400);
    }
    
    if (strlen($newPassword) < 8) {
        jsonResponse(['error' => 'La contraseña debe tener al menos 8 caracteres'], 400);
    }
    
    // Iniciar sesión para verificar el token
    initSecureSession();
    
    // Verificar que existe un token de recuperación
    if (!isset($_SESSION['recovery_token']) || !isset($_SESSION['recovery_expires'])) {
        jsonResponse(['error' => 'Token inválido o no generado'], 400);
    }
    
    // Verificar que el token coincide
    if (!hash_equals($_SESSION['recovery_token'], $token)) {
        jsonResponse(['error' => 'Token incorrecto'], 400);
    }
    
    // Verificar que el token no ha expirado
    if (time() > $_SESSION['recovery_expires']) {
        // Limpiar token expirado
        unset($_SESSION['recovery_token']);
        unset($_SESSION['recovery_expires']);
        jsonResponse(['error' => 'Token expirado. Genera uno nuevo.'], 400);
    }
    
    // Generar nuevo hash de contraseña
    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Limpiar token usado
    unset($_SESSION['recovery_token']);
    unset($_SESSION['recovery_expires']);
    
    // Instruir al usuario a actualizar manualmente
    jsonResponse([
        'success' => true,
        'message' => 'Para completar el reseteo, actualiza ADMIN_PASSWORD_HASH en las variables de entorno de Hostinger.',
        'newHash' => $newHash,
        'instructions' => 'Copia este hash y pégalo en: Panel Hostinger > Sitios > Tu sitio > Configuración avanzada > Variables de entorno > ADMIN_PASSWORD_HASH'
    ]);
}
