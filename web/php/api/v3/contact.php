<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$config = sg_config();
$pdo = sg_db($config);
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') sg_json(['error' => 'Método no permitido'], 405);
$body = sg_body();
if (!empty($body['bot-field'])) sg_json(['success' => true]);
foreach (['company', 'name', 'email', 'service', 'message'] as $field) {
    if (trim((string) ($body[$field] ?? '')) === '') sg_json(['error' => 'Falta ' . $field], 422);
}
$ip = $_SERVER['REMOTE_ADDR'] ?? 'local';
sg_rate_limit($pdo, 'contact:' . $ip, 5, 300);
$subject = (($config['env'] ?? '') === 'staging' ? '[STAGING] ' : '') . 'Colaboración Sala Geek';
$letter = "Empresa: {$body['company']}\nNombre: {$body['name']}\nCorreo: {$body['email']}\nTeléfono: " . ($body['phone'] ?? '') . "\nServicio: {$body['service']}\n\n{$body['message']}";
$to = (string) ($config['contactEmail'] ?? 'contacto@salageek.com');
if (getenv('SG_MAIL_FILE')) {
    file_put_contents((string) getenv('SG_MAIL_FILE'), $subject . "\n" . $letter);
} else {
    mail($to, $subject, $letter, 'From: Sala Geek <noreply@salageek.com>');
}
sg_json(['success' => true]);
