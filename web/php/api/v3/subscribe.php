<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$config = sg_config();
$pdo = sg_db($config);
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') sg_json(['error' => 'Método no permitido'], 405);
$body = sg_body();
$email = strtolower(trim((string) ($body['email'] ?? '')));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) sg_json(['error' => 'Correo inválido'], 422);
$ip = $_SERVER['REMOTE_ADDR'] ?? 'local';
sg_rate_limit($pdo, 'sub:' . $ip, 3, 60);
if (!empty($config['dryRun'])) sg_json(['success' => true, 'dryRun' => true]);
$token = (string) ($body['recaptchaToken'] ?? '');
$secret = (string) ($config['recaptchaSecret'] ?? '');
if ($secret !== '' && $token !== '') {
    $verify = file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret=' . urlencode($secret) . '&response=' . urlencode($token));
    $decoded = json_decode((string) $verify, true);
    if (empty($decoded['success']) || (float) ($decoded['score'] ?? 0) < 0.5) {
        sg_json(['error' => 'No se pudo verificar el envío'], 403);
    }
}
$dc = $config['mailchimp']['dc'] ?? 'us5';
$audience = $config['mailchimp']['audienceId'] ?? '';
$key = $config['mailchimp']['apiKey'] ?? '';
$ch = curl_init("https://{$dc}.api.mailchimp.com/3.0/lists/{$audience}/members");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_USERPWD => 'user:' . $key,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode([
        'email_address' => $email,
        'status' => 'subscribed',
        'tags' => ['Website Subscriber', 'Newsletter'],
        'merge_fields' => ['SOURCE' => 'Website'],
    ]),
]);
$response = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);
if ($status === 400 && str_contains((string) $response, 'Member Exists')) {
    sg_json(['success' => true, 'message' => 'Ya estabas en la lista']);
}
if ($status < 200 || $status >= 300) sg_json(['error' => 'Mailchimp no aceptó el correo'], 502);
sg_json(['success' => true]);
