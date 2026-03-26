<?php
declare(strict_types=1);

require_once __DIR__ . '/../core/bootstrap.php';

final class Router
{
    /**
     * @param array<int, array{method:string, pattern:string, file:string}> $routes
     */
    public static function dispatch(array $routes): void
    {
        $method = Request::method();
        $path = Request::path();

        // Normalize: keep only the part after "/api"
        $apiPos = strpos($path, '/api');
        if ($apiPos === false) {
            Response::error('Not found', 404, 404);
        }
        $path = substr($path, $apiPos);
        $path = rtrim($path, '/');
        if ($path === '') {
            $path = '/api';
        }

        foreach ($routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            $matches = [];
            if (preg_match($route['pattern'], $path, $matches) === 1) {
                $params = [];
                foreach ($matches as $k => $v) {
                    if (is_string($k)) {
                        $params[$k] = $v;
                    }
                }
                $GLOBALS['routeParams'] = $params;
                require __DIR__ . '/' . $route['file'];
                return;
            }
        }

        Response::error('Not found', 404, 404);
    }
}

$routes = [
    // Auth
    // TODO: Add rate limiting (e.g., per IP) for auth endpoints in production.
    ['method' => 'POST', 'pattern' => '#^/api/auth/register$#', 'file' => 'auth/register.php'],
    ['method' => 'POST', 'pattern' => '#^/api/auth/login$#', 'file' => 'auth/login.php'],
    ['method' => 'POST', 'pattern' => '#^/api/auth/logout$#', 'file' => 'auth/logout.php'],
    ['method' => 'GET',  'pattern' => '#^/api/auth/me$#', 'file' => 'auth/me.php'],

    // Donor + NGO
    ['method' => 'POST', 'pattern' => '#^/api/donations$#', 'file' => 'donations/index.php'],
    ['method' => 'GET',  'pattern' => '#^/api/donations$#', 'file' => 'donations/index.php'],
    ['method' => 'GET',  'pattern' => '#^/api/donations/available$#', 'file' => 'donations/index.php'],
    ['method' => 'GET',  'pattern' => '#^/api/donations/my$#', 'file' => 'donations/my.php'],
    ['method' => 'PUT',  'pattern' => '#^/api/donations/(?P<id>[0-9]+)$#', 'file' => 'donations/[id].php'],
    ['method' => 'DELETE','pattern' => '#^/api/donations/(?P<id>[0-9]+)$#', 'file' => 'donations/[id].php'],

    // Pickups
    ['method' => 'POST', 'pattern' => '#^/api/pickups$#', 'file' => 'pickups/index.php'],
    ['method' => 'GET',  'pattern' => '#^/api/pickups/my$#', 'file' => 'pickups/my.php'],
    ['method' => 'PUT',  'pattern' => '#^/api/pickups/(?P<id>[0-9]+)/complete$#', 'file' => 'pickups/[id]/complete.php'],

    // Admin
    ['method' => 'GET',  'pattern' => '#^/api/admin/users$#', 'file' => 'admin/users.php'],
    ['method' => 'PUT',  'pattern' => '#^/api/admin/users/(?P<id>[0-9]+)/verify$#', 'file' => 'admin/users.php'],
    ['method' => 'DELETE','pattern' => '#^/api/admin/users/(?P<id>[0-9]+)$#', 'file' => 'admin/users.php'],
    ['method' => 'GET',  'pattern' => '#^/api/admin/donations$#', 'file' => 'admin/donations.php'],
    ['method' => 'GET',  'pattern' => '#^/api/admin/stats$#', 'file' => 'admin/stats.php'],

    // Notifications
    ['method' => 'GET',  'pattern' => '#^/api/notifications$#', 'file' => 'notifications/index.php'],
    ['method' => 'PUT',  'pattern' => '#^/api/notifications/(?P<id>[0-9]+)/read$#', 'file' => 'notifications/[id]/read.php'],
];

Router::dispatch($routes);
