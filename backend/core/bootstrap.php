<?php
declare(strict_types=1);

final class DotEnv
{
    public static function load(string $path): void
    {
        static $loaded = false;
        if ($loaded) {
            return;
        }
        $loaded = true;

        if (!is_file($path) || !is_readable($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES);
        if (!is_array($lines)) {
            return;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || str_starts_with($line, ';')) {
                continue;
            }
            if (str_starts_with($line, 'export ')) {
                $line = trim(substr($line, 7));
            }

            $pos = strpos($line, '=');
            if ($pos === false) {
                continue;
            }

            $key = trim(substr($line, 0, $pos));
            $value = trim(substr($line, $pos + 1));

            if ($key === '' || preg_match('/^[A-Z0-9_]+$/', $key) !== 1) {
                continue;
            }

            // Do not override real environment variables.
            $alreadySet = getenv($key);
            if ($alreadySet !== false && $alreadySet !== '') {
                continue;
            }

            if ($value !== '' && (($value[0] === '"' && str_ends_with($value, '"')) || ($value[0] === "'" && str_ends_with($value, "'")))) {
                $value = substr($value, 1, -1);
            }

            putenv($key . '=' . $value);
            $_ENV[$key] = $value;
        }
    }
}

// Basic hardening
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');

// Autoload core classes (simple)
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Request.php';
require_once __DIR__ . '/Validator.php';
require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/Middleware.php';
require_once __DIR__ . '/Notifications.php';

// Load backend/.env if present (no external dependencies).
DotEnv::load(__DIR__ . '/../.env');

$config = require __DIR__ . '/../config/config.php';
date_default_timezone_set($config['app']['timezone']);

// CORS
$allowedOrigins = array_map('trim', explode(',', (string) $config['cors']['allowed_origins']));
$origin = $_SERVER['HTTP_ORIGIN'] ?? null;
if (is_string($origin) && $origin !== '') {
    if (in_array('*', $allowedOrigins, true) || in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . (in_array('*', $allowedOrigins, true) ? '*' : $origin));
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: ' . $config['cors']['allowed_methods']);
        header('Access-Control-Allow-Headers: ' . $config['cors']['allowed_headers']);
        header('Access-Control-Max-Age: ' . $config['cors']['max_age']);
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Error handling (never expose stack traces in production)
$isProd = ($config['app']['env'] === 'production');
ini_set('display_errors', $isProd ? '0' : '0');
ini_set('log_errors', '1');

set_exception_handler(static function (Throwable $e) use ($isProd): void {
    error_log((string) $e);
    $message = $isProd ? 'Server error' : $e->getMessage();
    Response::error($message, 500, 500);
});

set_error_handler(static function (int $errno, string $errstr, string $errfile, int $errline) use ($isProd): bool {
    if (!(error_reporting() & $errno)) {
        return true;
    }
    $msg = $isProd ? 'Server error' : 'Server error';
    error_log("PHP error {$errno}: {$errstr} in {$errfile}:{$errline}");
    Response::error($msg, 500, 500);
    return true;
});
