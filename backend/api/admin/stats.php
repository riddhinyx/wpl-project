<?php
declare(strict_types=1);

Middleware::requireRole(['admin'], false);
$pdo = Database::pdo();

$totalDonations = (int) $pdo->query('SELECT COUNT(*) AS c FROM food_donations')->fetch()['c'];
$totalCollected = (int) $pdo->query("SELECT COUNT(*) AS c FROM food_donations WHERE status IN ('collected','distributed')")->fetch()['c'];
$totalDistributed = (int) $pdo->query("SELECT COUNT(*) AS c FROM food_donations WHERE status = 'distributed'")->fetch()['c'];
$activeDonors = (int) $pdo->query("SELECT COUNT(*) AS c FROM users WHERE role = 'donor' AND is_active = 1")->fetch()['c'];
$activeNgos = (int) $pdo->query("SELECT COUNT(*) AS c FROM users WHERE role = 'ngo' AND is_active = 1")->fetch()['c'];

Response::successData([
    'total_donations' => $totalDonations,
    'total_collected' => $totalCollected,
    'total_distributed' => $totalDistributed,
    'active_donors' => $activeDonors,
    'active_ngos' => $activeNgos,
]);

