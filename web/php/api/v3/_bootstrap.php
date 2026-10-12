<?php
declare(strict_types=1);

function sg_config(): array {
    $envFile = __DIR__ . '/_env.php';
    $path = getenv('SG_CONFIG') ?: '';
    if ($path === '' && is_file($envFile)) {
        $meta = include $envFile;
        $path = is_array($meta) ? (string) ($meta['config'] ?? '') : '';
    }
    if ($path === '' || !is_file($path)) {
        sg_json(['error' => 'Falta la configuración'], 500);
    }
    $config = json_decode((string) file_get_contents($path), true);
    if (!is_array($config)) {
        sg_json(['error' => 'Configuración ilegible'], 500);
    }
    return $config;
}

function sg_json(array $payload, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function sg_body(): array {
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') {
        return $_POST;
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function sg_db(array $config): PDO {
    $db = $config['db'];
    $pdo = new PDO(
        sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $db['host'], $db['name']),
        $db['user'],
        $db['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    return $pdo;
}

function sg_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name('sg_admin_v3');
    session_set_cookie_params([
        'lifetime' => 86400,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function sg_user(): ?array {
    sg_session();
    return isset($_SESSION['admin']) && is_array($_SESSION['admin']) ? $_SESSION['admin'] : null;
}

function sg_require_user(): array {
    $user = sg_user();
    if (!$user) {
        sg_json(['error' => 'No autorizado'], 401);
    }
    return $user;
}

function sg_csrf(): string {
    sg_session();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return (string) $_SESSION['csrf'];
}

function sg_require_csrf(): void {
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!hash_equals(sg_csrf(), (string) $sent)) {
        sg_json(['error' => 'CSRF inválido'], 403);
    }
}

function sg_rate_limit(PDO $pdo, string $key, int $limit, int $windowSeconds): void {
    $now = new DateTimeImmutable('now');
    $stmt = $pdo->prepare('SELECT window_start, hits FROM rate_limits WHERE `key` = ?');
    $stmt->execute([$key]);
    $row = $stmt->fetch();
    if ($row) {
        $start = new DateTimeImmutable($row['window_start']);
        if ($now->getTimestamp() - $start->getTimestamp() > $windowSeconds) {
            $update = $pdo->prepare('UPDATE rate_limits SET window_start = ?, hits = 1 WHERE `key` = ?');
            $update->execute([$now->format('Y-m-d H:i:s.v'), $key]);
            return;
        }
        if ((int) $row['hits'] >= $limit) {
            sg_json(['error' => 'Demasiados intentos'], 429);
        }
        $update = $pdo->prepare('UPDATE rate_limits SET hits = hits + 1 WHERE `key` = ?');
        $update->execute([$key]);
        return;
    }
    $insert = $pdo->prepare('INSERT INTO rate_limits (`key`, window_start, hits) VALUES (?, ?, 1)');
    $insert->execute([$key, $now->format('Y-m-d H:i:s.v')]);
}

function sg_audit(PDO $pdo, string $actor, string $action, string $entity, string $entityId): void {
    $stmt = $pdo->prepare('INSERT INTO audit_log (actor, action, entity, entity_id) VALUES (?, ?, ?, ?)');
    $stmt->execute([$actor, $action, $entity, $entityId]);
}

function sg_dispatch(array $config): string {
    if (!empty($config['dryRun'])) {
        return 'queued';
    }
    $token = (string) ($config['dispatchToken'] ?? '');
    if ($token === '') {
        return 'skipped';
    }
    $ch = curl_init('https://api.github.com/repos/HumbertMarin09/SalaGeek_Landing/dispatches');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Accept: application/vnd.github+json',
            'Authorization: Bearer ' . $token,
            'User-Agent: salageek-v3',
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode([
            'event_type' => 'content-published',
            'client_payload' => ['env' => $config['env'] ?? 'staging'],
        ]),
    ]);
    curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return $status >= 200 && $status < 300 ? 'queued' : 'failed';
}
