<?php
declare(strict_types=1);

/**
 * Dev router for PHP built-in server (php -S).
 * This replaces Apache .htaccess rewrite rules in local development.
 */

$uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$uriPath = is_string($uriPath) ? $uriPath : '/';

$publicRoot = __DIR__;
$candidate = realpath($publicRoot . $uriPath);

// Serve static files directly when they exist under backend/
if ($candidate !== false && str_starts_with($candidate, $publicRoot . DIRECTORY_SEPARATOR) && is_file($candidate)) {
    return false;
}

// Route API calls
if (str_starts_with($uriPath, '/api')) {
    require __DIR__ . '/api/index.php';
    exit;
}

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo "Not Found\n";

