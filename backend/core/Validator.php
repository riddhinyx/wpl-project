<?php
declare(strict_types=1);

final class Validator
{
    public static function requireString(array $input, string $key, int $min = 1, int $max = 255): string
    {
        $value = $input[$key] ?? null;
        if (!is_string($value)) {
            Response::error("Missing or invalid field: {$key}", 400, 400);
        }
        $value = trim($value);
        if ($value === '' || mb_strlen($value) < $min || mb_strlen($value) > $max) {
            Response::error("Invalid field length: {$key}", 400, 400);
        }
        return $value;
    }

    public static function optionalString(array $input, string $key, int $max = 500): ?string
    {
        $value = $input[$key] ?? null;
        if ($value === null) {
            return null;
        }
        if (!is_string($value)) {
            Response::error("Invalid field: {$key}", 400, 400);
        }
        $value = trim($value);
        if ($value === '') {
            return null;
        }
        if (mb_strlen($value) > $max) {
            Response::error("Field too long: {$key}", 400, 400);
        }
        return $value;
    }

    public static function email(array $input, string $key = 'email'): string
    {
        $email = self::requireString($input, $key, 3, 190);
        $email = mb_strtolower($email);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email', 400, 400);
        }
        return $email;
    }

    public static function password(array $input, string $key = 'password'): string
    {
        $password = self::requireString($input, $key, 8, 200);
        return $password;
    }

    public static function enum(array $input, string $key, array $allowed): string
    {
        $value = self::requireString($input, $key, 1, 64);
        if (!in_array($value, $allowed, true)) {
            Response::error("Invalid value for {$key}", 400, 400);
        }
        return $value;
    }

    public static function phone(array $input, string $key = 'phone'): string
    {
        $phone = self::requireString($input, $key, 7, 32);
        // Basic phone validation rule
        if (!preg_match('/^\\+?[0-9][0-9\\-\\s]{6,18}$/', $phone)) {
            Response::error('Invalid phone number', 400, 400);
        }
        return $phone;
    }

    public static function optionalFloat(array $input, string $key): ?float
    {
        if (!array_key_exists($key, $input) || $input[$key] === null || $input[$key] === '') {
            return null;
        }
        $value = $input[$key];
        if (is_string($value)) {
            $value = trim($value);
        }
        if (!is_numeric($value)) {
            Response::error("Invalid field: {$key}", 400, 400);
        }
        return (float) $value;
    }

    public static function requireFloat(array $input, string $key): float
    {
        $value = self::optionalFloat($input, $key);
        if ($value === null) {
            Response::error("Missing field: {$key}", 400, 400);
        }
        return $value;
    }

    public static function requireDateTime(array $input, string $key): string
    {
        $value = self::requireString($input, $key, 8, 25);
        $dt = date_create($value);
        if ($dt === false) {
            Response::error("Invalid datetime: {$key}", 400, 400);
        }
        return $dt->format('Y-m-d H:i:s');
    }
}

