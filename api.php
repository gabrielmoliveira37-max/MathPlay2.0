<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

function respond(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function parsePlayedDate(string $value): ?string
{
    foreach (['!d/m/Y', '!Y-m-d'] as $format) {
        $date = DateTimeImmutable::createFromFormat($format, $value);
        $errors = DateTimeImmutable::getLastErrors();
        if ($date !== false && ($errors === false || ($errors['warning_count'] === 0 && $errors['error_count'] === 0))) {
            return $date->format('Y-m-d');
        }
    }

    return null;
}

function loadUser(PDO $pdo, int $userId): ?array
{
    $statement = $pdo->prepare('SELECT id, name, email, provider, total_score FROM users WHERE id = ?');
    $statement->execute([$userId]);
    $user = $statement->fetch();
    if (!$user) {
        return null;
    }

    $playedStatement = $pdo->prepare(
        "SELECT m.game_id AS id, g.title, m.score, m.accuracy, DATE_FORMAT(m.played_at, '%d/%m/%Y') AS date
         FROM matches m JOIN games g ON g.id = m.game_id
         WHERE m.user_id = ? ORDER BY m.id"
    );
    $playedStatement->execute([$userId]);
    $played = $playedStatement->fetchAll();
    foreach ($played as &$match) {
        $match['score'] = (int) $match['score'];
        $match['accuracy'] = (int) $match['accuracy'];
    }
    unset($match);

    $badgesStatement = $pdo->prepare('SELECT badge_id FROM user_badges WHERE user_id = ? ORDER BY earned_at');
    $badgesStatement->execute([$userId]);

    return [
        'name' => $user['name'],
        'email' => $user['email'],
        'provider' => $user['provider'],
        'totalScore' => (int) $user['total_score'],
        'played' => $played,
        'badges' => $badgesStatement->fetchAll(PDO::FETCH_COLUMN),
    ];
}

function currentUserId(PDO $pdo): ?int
{
    if (isset($_SESSION['user_id'])) {
        return (int) $_SESSION['user_id'];
    }

    $email = $_SESSION['email'] ?? null;
    if (!$email) {
        return null;
    }

    $statement = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $statement->execute([$email]);
    $userId = $statement->fetchColumn();
    if ($userId === false) {
        return null;
    }

    $_SESSION['user_id'] = (int) $userId;
    return (int) $userId;
}

function migrateLegacyUsers(PDO $pdo): void
{
    $dataFile = __DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'users.json';
    if (!is_file($dataFile)) {
        return;
    }

    $legacyUsers = json_decode((string) file_get_contents($dataFile), true);
    if (!is_array($legacyUsers)) {
        return;
    }

    $findUser = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $insertUser = $pdo->prepare(
        'INSERT INTO users (name, email, password_hash, provider, total_score) VALUES (?, ?, ?, ?, ?)'
    );
    $findGame = $pdo->prepare('SELECT id FROM games WHERE id = ?');
    $insertMatch = $pdo->prepare(
        'INSERT INTO matches (user_id, game_id, score, accuracy, played_at) VALUES (?, ?, ?, ?, ?)'
    );
    $findBadge = $pdo->prepare('SELECT id FROM badges WHERE id = ?');
    $insertBadge = $pdo->prepare('INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)');

    foreach ($legacyUsers as $legacyUser) {
        if (!is_array($legacyUser)) {
            continue;
        }

        $email = strtolower(trim((string) ($legacyUser['email'] ?? '')));
        $passwordHash = (string) ($legacyUser['password'] ?? '');
        if ($email === '' || $passwordHash === '') {
            continue;
        }

        $findUser->execute([$email]);
        if ($findUser->fetchColumn() !== false) {
            continue;
        }

        $pdo->beginTransaction();
        try {
            $insertUser->execute([
                (string) ($legacyUser['name'] ?? $email),
                $email,
                $passwordHash,
                (string) ($legacyUser['provider'] ?? 'local'),
                max(0, (int) ($legacyUser['totalScore'] ?? 0)),
            ]);
            $userId = (int) $pdo->lastInsertId();

            foreach (($legacyUser['played'] ?? []) as $match) {
                if (!is_array($match)) {
                    continue;
                }
                $gameId = (string) ($match['id'] ?? '');
                $playedAt = parsePlayedDate((string) ($match['date'] ?? ''));
                $score = max(0, (int) ($match['score'] ?? 0));
                $accuracy = (int) ($match['accuracy'] ?? 0);
                if ($playedAt === null || $accuracy < 0 || $accuracy > 100) {
                    continue;
                }
                $findGame->execute([$gameId]);
                if ($findGame->fetchColumn() !== false) {
                    $insertMatch->execute([$userId, $gameId, $score, $accuracy, $playedAt]);
                }
            }

            foreach (($legacyUser['badges'] ?? []) as $badgeId) {
                $findBadge->execute([(string) $badgeId]);
                if ($findBadge->fetchColumn() !== false) {
                    $insertBadge->execute([$userId, (string) $badgeId]);
                }
            }

            $pdo->commit();
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $error;
        }
    }
}

$dbHost = getenv('MATHPLAY_DB_HOST') ?: '127.0.0.1';
$dbPort = getenv('MATHPLAY_DB_PORT') ?: '3308';
$dbName = getenv('MATHPLAY_DB_NAME') ?: 'mathplay';
$dbUser = getenv('MATHPLAY_DB_USER') ?: 'root';
$dbPassword = getenv('MATHPLAY_DB_PASSWORD') ?: '';

try {
    $pdo = new PDO(
        "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4",
        $dbUser,
        $dbPassword,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    migrateLegacyUsers($pdo);
} catch (Throwable $error) {
    error_log($error->getMessage());
    respond(['error' => 'Não foi possível conectar ao MySQL. Confira o servidor na porta 3308, o banco mathplay, as credenciais e a extensão pdo_mysql do PHP.'], 503);
}

$action = $_GET['action'] ?? '';

if ($action === 'me') {
    $userId = currentUserId($pdo);
    respond(['user' => $userId === null ? null : loadUser($pdo, $userId)]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Ação inválida.'], 405);
}

$input = json_decode((string) file_get_contents('php://input'), true);
$input = is_array($input) ? $input : [];

if ($action === 'register') {
    $name = trim((string) ($input['name'] ?? ''));
    $email = strtolower(trim((string) ($input['email'] ?? '')));
    $password = (string) ($input['password'] ?? '');

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 4) {
        respond(['error' => 'Preencha os dados corretamente.'], 422);
    }

    try {
        $statement = $pdo->prepare(
            "INSERT INTO users (name, email, password_hash, provider) VALUES (?, ?, ?, 'local')"
        );
        $statement->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
    } catch (PDOException $error) {
        if ($error->getCode() === '23000') {
            respond(['error' => 'Este e-mail já está cadastrado.'], 409);
        }
        throw $error;
    }

    $userId = (int) $pdo->lastInsertId();
    $_SESSION['user_id'] = $userId;
    $_SESSION['email'] = $email;
    respond(['user' => loadUser($pdo, $userId)]);
}

if ($action === 'login') {
    $email = strtolower(trim((string) ($input['email'] ?? '')));
    $password = (string) ($input['password'] ?? '');
    $statement = $pdo->prepare('SELECT id, password_hash FROM users WHERE email = ?');
    $statement->execute([$email]);
    $user = $statement->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        respond(['error' => 'E-mail ou senha não conferem.'], 401);
    }

    $_SESSION['user_id'] = (int) $user['id'];
    $_SESSION['email'] = $email;
    respond(['user' => loadUser($pdo, (int) $user['id'])]);
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

    $tokenData = json_decode((string) @file_get_contents(
        'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential)
    ), true);
    if (!is_array($tokenData) || ($tokenData['aud'] ?? '') !== $googleClientId || ($tokenData['email_verified'] ?? '') !== 'true') {
        respond(['error' => 'Não foi possível validar essa conta Google.'], 401);
    }

    $email = strtolower(trim((string) ($tokenData['email'] ?? '')));
    $name = trim((string) ($tokenData['name'] ?? $email));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(['error' => 'A conta Google não forneceu um e-mail válido.'], 422);
    }

    $statement = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $statement->execute([$email]);
    $userId = $statement->fetchColumn();
    if ($userId === false) {
        $statement = $pdo->prepare(
            "INSERT INTO users (name, email, password_hash, provider) VALUES (?, ?, ?, 'google')"
        );
        $statement->execute([$name, $email, password_hash(bin2hex(random_bytes(24)), PASSWORD_DEFAULT)]);
        $userId = $pdo->lastInsertId();
    }

    $_SESSION['user_id'] = (int) $userId;
    $_SESSION['email'] = $email;
    respond(['user' => loadUser($pdo, (int) $userId)]);
}

if ($action === 'save') {
    $userId = currentUserId($pdo);
    if ($userId === null || loadUser($pdo, $userId) === null) {
        respond(['error' => 'Sessão expirada.'], 401);
    }

    $matches = is_array($input['played'] ?? null) ? $input['played'] : [];
    $validMatches = [];
    foreach ($matches as $match) {
        if (!is_array($match)) {
            respond(['error' => 'O histórico de partidas é inválido.'], 422);
        }
        $gameId = (string) ($match['id'] ?? '');
        $playedAt = parsePlayedDate((string) ($match['date'] ?? ''));
        $score = (int) ($match['score'] ?? 0);
        $accuracy = (int) ($match['accuracy'] ?? 0);
        if ($playedAt === null || $score < 0 || $accuracy < 0 || $accuracy > 100) {
            respond(['error' => 'Os dados de uma partida são inválidos.'], 422);
        }
        $validMatches[] = [$gameId, $score, $accuracy, $playedAt];
    }

    $availableBadges = $pdo->query('SELECT id FROM badges')->fetchAll(PDO::FETCH_COLUMN);
    $badgeIds = [];
    foreach (($input['badges'] ?? []) as $badgeId) {
        if (is_string($badgeId) && in_array($badgeId, $availableBadges, true)) {
            $badgeIds[] = $badgeId;
        }
    }
    $badgeIds = array_values(array_unique($badgeIds));

    $pdo->beginTransaction();
    try {
        $pdo->prepare('DELETE FROM matches WHERE user_id = ?')->execute([$userId]);
        $findGame = $pdo->prepare('SELECT id FROM games WHERE id = ?');
        $insertMatch = $pdo->prepare(
            'INSERT INTO matches (user_id, game_id, score, accuracy, played_at) VALUES (?, ?, ?, ?, ?)'
        );
        foreach ($validMatches as [$gameId, $score, $accuracy, $playedAt]) {
            $findGame->execute([$gameId]);
            if ($findGame->fetchColumn() === false) {
                throw new InvalidArgumentException('O histórico contém um jogo desconhecido.');
            }
            $insertMatch->execute([$userId, $gameId, $score, $accuracy, $playedAt]);
        }

        $pdo->prepare('DELETE FROM user_badges WHERE user_id = ?')->execute([$userId]);
        $insertBadge = $pdo->prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)');
        foreach ($badgeIds as $badgeId) {
            $insertBadge->execute([$userId, $badgeId]);
        }

        $pdo->prepare(
            'UPDATE users SET total_score = (SELECT COALESCE(SUM(score), 0) FROM matches WHERE user_id = ?) WHERE id = ?'
        )->execute([$userId, $userId]);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        if ($error instanceof InvalidArgumentException) {
            respond(['error' => $error->getMessage()], 422);
        }
        throw $error;
    }

    respond(['user' => loadUser($pdo, $userId)]);
}

if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    respond(['user' => null]);
}

respond(['error' => 'Ação não encontrada.'], 404);