<?php
declare(strict_types=1);

final class Auth
{
    public static function issueToken(array $user): string
    {
        $config = require __DIR__ . '/../config/config.php';
        $secret = $config['auth']['jwt_secret'];
        $ttl = (int) $config['auth']['jwt_ttl_seconds'];
        $issuer = (string) $config['auth']['jwt_issuer'];

        $now = time();
        $payload = [
            'iss' => $issuer,
            'iat' => $now,
            'exp' => $now + $ttl,
            'sub' => (string) $user['id'],
            'role' => (string) $user['role'],
            'tv' => (int) $user['token_version'],
        ];

        return self::jwtEncode($payload, (string) $secret);
    }

    public static function user(): array
    {
        $token = self::bearerToken() ?? self::cookieToken();
        if ($token === null) {
            Response::error('Unauthorized', 401, 401);
        }

        $payload = self::jwtDecode($token);
        if ($payload === null) {
            Response::error('Invalid or expired token', 401, 401);
        }

        $userId = $payload['sub'] ?? null;
        if (!is_string($userId) || $userId === '') {
            Response::error('Invalid token payload', 401, 401);
        }

        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT id, name, email, role, phone, address, lat, lng, is_verified, is_active, token_version, created_at FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        if (!is_array($user)) {
            Response::error('Unauthorized', 401, 401);
        }
        if ((int) $user['is_active'] !== 1) {
            Response::error('Account deactivated', 403, 403);
        }

        if ((int) ($payload['tv'] ?? -1) !== (int) $user['token_version']) {
            Response::error('Token revoked', 401, 401);
        }

        return $user;
    }

    public static function requireRole(array $user, array $roles): void
    {
        if (!in_array($user['role'], $roles, true)) {
            Response::error('Forbidden', 403, 403);
        }
    }

    public static function requireVerified(array $user): void
    {
        if ($user['role'] !== 'admin' && (int) $user['is_verified'] !== 1) {
            Response::error('Account not verified', 403, 403);
        }
    }

    private static function bearerToken(): ?string
    {
        $header = Request::header('Authorization');
        if ($header === null) {
            return null;
        }
        if (preg_match('/^Bearer\\s+(.*)$/i', $header, $m) !== 1) {
            return null;
        }
        $token = trim($m[1]);
        return $token === '' ? null : $token;
    }

    private static function cookieToken(): ?string
    {
        $token = $_COOKIE['token'] ?? null;
        return is_string($token) && trim($token) !== '' ? trim($token) : null;
    }

    private static function jwtEncode(array $payload, string $secret): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $segments = [
            self::base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES)),
            self::base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES)),
        ];
        $signingInput = implode('.', $segments);
        $signature = hash_hmac('sha256', $signingInput, $secret, true);
        $segments[] = self::base64UrlEncode($signature);
        return implode('.', $segments);
    }

    private static function jwtDecode(string $jwt): ?array
    {
        $config = require __DIR__ . '/../config/config.php';
        $secret = (string) $config['auth']['jwt_secret'];
        $issuer = (string) $config['auth']['jwt_issuer'];

        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            return null;
        }
        [$h64, $p64, $s64] = $parts;
        $headerJson = self::base64UrlDecode($h64);
        $payloadJson = self::base64UrlDecode($p64);
        $sig = self::base64UrlDecode($s64);
        if ($headerJson === null || $payloadJson === null || $sig === null) {
            return null;
        }
        $header = json_decode($headerJson, true);
        $payload = json_decode($payloadJson, true);
        if (!is_array($header) || !is_array($payload)) {
            return null;
        }
        if (($header['alg'] ?? null) !== 'HS256') {
            return null;
        }
        $expected = hash_hmac('sha256', $h64 . '.' . $p64, $secret, true);
        if (!hash_equals($expected, $sig)) {
            return null;
        }
        if (($payload['iss'] ?? null) !== $issuer) {
            return null;
        }
        $exp = $payload['exp'] ?? null;
        if (!is_int($exp) && !is_numeric($exp)) {
            return null;
        }
        if (time() >= (int) $exp) {
            return null;
        }
        return $payload;
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): ?string
    {
        $remainder = strlen($data) % 4;
        if ($remainder > 0) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        $decoded = base64_decode(strtr($data, '-_', '+/'), true);
        return $decoded === false ? null : $decoded;
    }
}

