<?php
declare(strict_types=1);

final class Response
{
    public static function json(array $payload, int $httpStatus = 200): void
    {
        http_response_code($httpStatus);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(array $data = [], string $message = ''): void
    {
        self::json([
            'success' => true,
            'data' => (object) $data,
            'message' => $message,
        ], 200);
    }

    public static function successData(mixed $data, string $message = ''): void
    {
        self::json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], 200);
    }

    public static function error(string $message, int $code = 400, int $httpStatus = 400): void
    {
        self::json([
            'success' => false,
            'error' => $message,
            'code' => $code,
        ], $httpStatus);
    }
}

