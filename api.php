<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'users.json';
$dataDirectory = dirname($dataFile);

if (!is_dir($dataDirectory)) {
    mkdir($dataDirectory, 0755, true);
}

function respond(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function readUsers(string $dataFile): array
{
    if (!is_file($dataFile)) {
        return [];
    }

    $users = json_decode((string) file_get_contents($dataFile), true);
    return is_array($users) ? $users : [];
}

function writeUsers(string $dataFile, array $users): void
{
    file_put_contents($dataFile, json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
}

function publicUser(array $user): array
{
    unset($user['password']);
    return $user;
}

$action = $_GET['action'] ?? '';
$users = readUsers($dataFile);

if ($action === 'me') {
    $email = $_SESSION['email'] ?? null;
    respond(['user' => $email && isset($users[$email]) ? publicUser($users[$email]) : null]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Ação inválida.'], 405);
}

$input = json_decode((string) file_get_contents('php://input'), true) ?: [];

if ($action === 'register') {
    $name = trim((string) ($input['name'] ?? ''));
    $email = strtolower(trim((string) ($input['email'] ?? '')));
    $password = (string) ($input['password'] ?? '');

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 4) {
        respond(['error' => 'Preencha os dados corretamente.'], 422);
    }
    if (isset($users[$email])) {
        respond(['error' => 'Este e-mail já está cadastrado.'], 409);
    }

    $users[$email] = [
        'name' => $name,
        'email' => $email,
        'password' => password_hash($password, PASSWORD_DEFAULT),
        'totalScore' => 0,
        'played' => [],
        'badges' => [],
    ];
    writeUsers($dataFile, $users);
    $_SESSION['email'] = $email;
    respond(['user' => publicUser($users[$email])]);
}

if ($action === 'login') {
    $email = strtolower(trim((string) ($input['email'] ?? '')));
    $password = (string) ($input['password'] ?? '');
    $user = $users[$email] ?? null;

    if (!$user || !password_verify($password, $user['password'])) {
        respond(['error' => 'E-mail ou senha não conferem.'], 401);
    }

    $_SESSION['email'] = $email;
    respond(['user' => publicUser($user)]);
}

if ($action === 'google-login') {
    $credential = (string) ($input['credential'] ?? '');
    $googleClientId = trim((string) getenv('MATHPLAY_GOOGLE_CLIENT_ID'));
    if ($googleClientId === '') {
        respond(['error' => 'Configure MATHPLAY_GOOGLE_CLIENT_ID para ativar o login Google.'], 503);
    }
    if ($credential === '') {
        respond(['error' => 'Credencial Google ausente.'], 422);
    }

    $tokenData = json_decode((string) @file_get_contents('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential)), true);
    if (!is_array($tokenData) || ($tokenData['aud'] ?? '') !== $googleClientId || ($tokenData['email_verified'] ?? '') !== 'true') {
        respond(['error' => 'Não foi possível validar essa conta Google.'], 401);
    }

    $email = strtolower(trim((string) ($tokenData['email'] ?? '')));
    $name = trim((string) ($tokenData['name'] ?? $email));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(['error' => 'A conta Google não forneceu um e-mail válido.'], 422);
    }
    if (!isset($users[$email])) {
        $users[$email] = [
            'name' => $name,
            'email' => $email,
            'password' => password_hash(bin2hex(random_bytes(24)), PASSWORD_DEFAULT),
            'totalScore' => 0,
            'played' => [],
            'badges' => [],
            'provider' => 'google',
        ];
        writeUsers($dataFile, $users);
    }

    $_SESSION['email'] = $email;
    respond(['user' => publicUser($users[$email])]);
}

if ($action === 'save') {
    $email = $_SESSION['email'] ?? null;
    if (!$email || !isset($users[$email])) {
        respond(['error' => 'Sessão expirada.'], 401);
    }

    $user = $users[$email];
    $user['totalScore'] = (int) ($input['totalScore'] ?? 0);
    $user['played'] = is_array($input['played'] ?? null) ? $input['played'] : [];
    $user['badges'] = is_array($input['badges'] ?? null) ? $input['badges'] : [];
    $users[$email] = $user;
    writeUsers($dataFile, $users);
    respond(['user' => publicUser($user)]);
}

if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    respond(['user' => null]);
}

respond(['error' => 'Ação não encontrada.'], 404);