<?php
/*
 * Endpoint de health check pour le monitoring.
 * Renvoie 200 OK si :
 *   - PHP repond
 *   - La base MySQL d'AlwaysData est joignable
 *
 * Utilisation :
 *   curl https://matteocb-uor.alwaysdata.net/php/health.php
 *   -> { "ok": true, "checks": {...} }
 */

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$checks = [
    'php'   => true,
    'mysql' => false,
];

// Test MySQL via PDO (lit la config dans ~/config/db.php hors www)
try {
    $configFile = __DIR__ . '/../../config/db.php';
    if (is_readable($configFile)) {
        $config = require $configFile;
        $dsn    = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4',
                          $config['host'], $config['dbname']);
        $pdo = new PDO($dsn, $config['user'], $config['password'], [
            PDO::ATTR_TIMEOUT => 2,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
        $pdo->query('SELECT 1');
        $checks['mysql'] = true;
    }
} catch (Throwable $e) {
    $checks['mysql'] = false;
}

$ok = $checks['php'] && $checks['mysql'];
http_response_code($ok ? 200 : 503);

echo json_encode([
    'ok'     => $ok,
    'checks' => $checks,
    'time'   => date('c'),
], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
