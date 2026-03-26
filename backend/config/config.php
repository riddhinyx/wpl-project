<?php
declare(strict_types=1);

/**
 * App configuration.
 * Prefer environment variables in production.
 */

if (!function_exists('env')) {
    function env(string $key, ?string $default = null): ?string
    {
        $value = getenv($key);
        if ($value === false || $value === '') {
            return $default;
        }
        return $value;
    }
}

return [
    'app' => [
        'env' => env('APP_ENV', 'development'),
        'timezone' => env('APP_TIMEZONE', 'Asia/Kolkata'),
    ],
    'db' => [
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => (int) (env('DB_PORT', '3306') ?? '3306'),
        'name' => env('DB_NAME', 'wpl_food_platform'),
        'user' => env('DB_USER', 'root'),
        'pass' => env('DB_PASS', ''),
        'charset' => env('DB_CHARSET', 'utf8mb4'),
    ],
    'auth' => [
        // Generate a strong random secret for production.
        'jwt_secret' => env('JWT_SECRET', 'dev-change-me'),
        'jwt_issuer' => env('JWT_ISSUER', 'wpl-food-platform'),
        'jwt_ttl_seconds' => (int) (env('JWT_TTL_SECONDS', '86400') ?? '86400'),
    ],
    'cors' => [
        // Comma-separated list of allowed origins OR "*" to allow any origin.
        // For production, prefer explicit origins.
        'allowed_origins' => env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173'),
        'allowed_methods' => 'GET,POST,PUT,DELETE,OPTIONS',
        'allowed_headers' => 'Content-Type, Authorization',
        'max_age' => '600',
    ],
    'donations' => [
        // Default radius for notifying verified NGOs (km)
        'notify_radius_km' => (float) (env('NOTIFY_RADIUS_KM', '20') ?? '20'),
    ],
];

