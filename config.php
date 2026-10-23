<?php
declare(strict_types=1);

function loadMathPlayEnv(): void
{
    $envFile = __DIR__ . DIRECTORY_SEPARATOR . '.env';
    if (is_file($envFile)) {
        $settings = @parse_ini_file($envFile, false, INI_SCANNER_RAW);
        if ($settings === false) {
            $error = error_get_last();
            error_log('MathPlay .env could not be loaded: ' . ($error['message'] ?? 'invalid configuration'));
            throw new RuntimeException('Não foi possível carregar a configuração do servidor.');
        }

        foreach ($settings as $name => $value) {
            if (getenv($name) === false) {
                putenv($name . '=' . (string) $value);
            }
        }
    }
}

loadMathPlayEnv();
