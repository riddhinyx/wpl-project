<?php
declare(strict_types=1);

final class Database
{
    private static ?PDO $pdo = null;

    /**
     * @param array<string, mixed> $db
     * @return array<int, string>
     */
    private static function buildDsnCandidates(array $db): array
    {
        $host = (string) ($db['host'] ?? '127.0.0.1');
        $port = (int) ($db['port'] ?? 3306);
        $name = (string) ($db['name'] ?? '');
        $charset = (string) ($db['charset'] ?? 'utf8mb4');

        $dsns = [
            sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $host, $port, $name, $charset),
        ];

        // If configured for TCP loopback, also try local socket-style host.
        if ($host === '127.0.0.1') {
            $dsns[] = sprintf('mysql:host=localhost;dbname=%s;charset=%s', $name, $charset);
        }

        // Try common Linux MySQL socket paths.
        $socketPaths = [
            '/var/run/mysqld/mysqld.sock',
            '/run/mysqld/mysqld.sock',
            '/var/lib/mysql/mysql.sock',
        ];

        foreach ($socketPaths as $sock) {
            if (is_readable($sock)) {
                $dsns[] = sprintf('mysql:unix_socket=%s;dbname=%s;charset=%s', $sock, $name, $charset);
            }
        }

        return array_values(array_unique($dsns));
    }

    public static function pdo(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        $config = require __DIR__ . '/../config/config.php';
        $db = $config['db'];

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        $lastException = null;
        foreach (self::buildDsnCandidates($db) as $dsn) {
            try {
                $pdo = new PDO($dsn, (string) $db['user'], (string) $db['pass'], $options);
                self::$pdo = $pdo;
                return self::$pdo;
            } catch (PDOException $e) {
                $lastException = $e;
            }
        }

        if ($lastException instanceof PDOException) {
            $code = (string) $lastException->getCode();
            $rawMessage = $lastException->getMessage();
            $hint = 'Database connection failed.';

            if ($code === '2002' || str_contains($rawMessage, '[2002]')) {
                $hint = 'Database connection failed (2002: connection refused). Ensure MySQL/MariaDB service is running and DB_HOST/DB_PORT are correct.';
            } elseif ($code === '1045' || str_contains($rawMessage, '[1045]') || str_contains($rawMessage, '[1698]')) {
                $hint = 'Database connection failed (access denied). Check DB_USER and DB_PASS in backend/.env, or create a dedicated MySQL user for this app.';
            }

            throw new RuntimeException($hint, 0, $lastException);
        }

        throw new RuntimeException('Database connection failed.');
    }
}

