<?php
declare(strict_types=1);

final class Middleware
{
    public static function requireAuth(): array
    {
        return Auth::user();
    }

    public static function requireRole(array $roles, bool $verified = true): array
    {
        $user = Auth::user();
        Auth::requireRole($user, $roles);
        if ($verified) {
            Auth::requireVerified($user);
        }
        return $user;
    }
}

