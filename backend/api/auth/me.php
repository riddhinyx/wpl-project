<?php
declare(strict_types=1);

$user = Middleware::requireAuth();

Response::successData([
    'id' => (int) $user['id'],
    'name' => (string) $user['name'],
    'email' => (string) $user['email'],
    'role' => (string) $user['role'],
    'phone' => (string) $user['phone'],
    'address' => $user['address'],
    'lat' => $user['lat'] !== null ? (float) $user['lat'] : null,
    'lng' => $user['lng'] !== null ? (float) $user['lng'] : null,
    'is_verified' => (int) $user['is_verified'],
    'is_active' => (int) $user['is_active'],
    'created_at' => (string) $user['created_at'],
]);

