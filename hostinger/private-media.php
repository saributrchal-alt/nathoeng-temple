<?php
declare(strict_types=1);
// Server-to-server private images. Never serves unauthenticated GET requests.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: private, no-store');
header('X-Content-Type-Options: nosniff');
function reply(int $status, array $data): void {
    http_response_code($status); echo json_encode($data, JSON_UNESCAPED_SLASHES); exit;
}
try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') reply(405, ['ok'=>false]);
    $config = require __DIR__.'/config.php';
    $key = $config['upload_key'] ?? '';
    if (!is_string($key) || strlen($key) < 32) reply(503, ['ok'=>false]);
    if (!hash_equals($key, $_SERVER['HTTP_X_UPLOAD_KEY'] ?? '')) reply(401, ['ok'=>false]);
    $project = $_POST['project'] ?? '';
    if (!in_array($project, ['temple', 'nathoeng'], true)) reply(400, ['ok'=>false]);
    $root = realpath($_SERVER['DOCUMENT_ROOT'] ?? '');
    if (!$root || $root === '/') reply(503, ['ok'=>false]);
    while (basename($root) !== 'public_html' && dirname($root) !== $root) $root = dirname($root);
    if (basename($root) !== 'public_html') reply(503, ['ok'=>false]);
    $dir = dirname($root).'/nathoeng-private-media/'.$project;
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) reply(503, ['ok'=>false]);
    $resolved = realpath($dir);
    if (!$resolved || strpos($resolved.'/', $root.'/') === 0) reply(503, ['ok'=>false]);
    $operation = $_POST['operation'] ?? '';
    if ($operation === 'health') {
        $ok = is_writable($dir) && function_exists('imagewebp') && class_exists('finfo');
        reply($ok ? 200 : 503, ['ok'=>$ok]);
    }
    if ($operation === 'read') {
        $id = $_POST['id'] ?? '';
        if (!is_string($id) || !preg_match('/^[a-f0-9]{32}$/D', $id)) reply(400, ['ok'=>false]);
        $path = $dir.'/'.$id.'.webp';
        if (!is_file($path)) reply(404, ['ok'=>false]);
        header('Content-Type: image/webp');
        header('Content-Length: '.filesize($path));
        readfile($path); exit;
    }
    if ($operation !== 'upload') reply(400, ['ok'=>false]);
    $file = $_FILES['file'] ?? null;
    if (!is_array($file) || ($file['error'] ?? -1) !== UPLOAD_ERR_OK || !is_string($file['tmp_name'] ?? null)
        || !is_uploaded_file($file['tmp_name'])) reply(400, ['ok'=>false]);
    $limit = min(2097152, (int)($config['max_bytes'] ?? 2097152));
    $bytes = filesize($file['tmp_name']);
    if (!$bytes || $bytes > $limit) reply(413, ['ok'=>false]);
    $types = ['image/jpeg'=>IMAGETYPE_JPEG, 'image/png'=>IMAGETYPE_PNG, 'image/webp'=>IMAGETYPE_WEBP];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $info = @getimagesize($file['tmp_name']);
    if (!isset($types[$mime]) || !$info || $info[2] !== $types[$mime]) reply(415, ['ok'=>false]);
    if ($info[0] < 1 || $info[1] < 1 || $info[0] > 8000 || $info[1] > 8000 || $info[0]*$info[1] > 12000000) reply(422, ['ok'=>false]);
    $source = @imagecreatefromstring(file_get_contents($file['tmp_name']));
    if (!$source) reply(422, ['ok'=>false]);
    $scale = min(1, 1920/max($info[0], $info[1]));
    $w = max(1, (int)round($info[0]*$scale)); $h = max(1, (int)round($info[1]*$scale));
    $output = imagecreatetruecolor($w, $h);
    imagealphablending($output, false); imagesavealpha($output, true);
    imagefill($output, 0, 0, imagecolorallocatealpha($output, 0, 0, 0, 127));
    if (!imagecopyresampled($output, $source, 0, 0, 0, 0, $w, $h, $info[0], $info[1])) throw new RuntimeException();
    imagedestroy($source);
    $id = bin2hex(random_bytes(16));
    $staging = tempnam($dir, '.pending-');
    if ($staging === false) throw new RuntimeException();
    try {
        if (!imagewebp($output, $staging, 82)) throw new RuntimeException();
        clearstatcache(true, $staging); $size = filesize($staging);
        if (!$size || $size > $limit) throw new RuntimeException();
        if (!chmod($staging, 0600) || !rename($staging, $dir.'/'.$id.'.webp')) throw new RuntimeException();
    } finally {
        if (is_file($staging)) unlink($staging);
        imagedestroy($output);
    }
    reply(201, ['ok'=>true, 'id'=>$id, 'bytes'=>$size, 'mime'=>'image/webp']);
} catch (Throwable $e) {
    error_log('Private media: '.get_class($e)); reply(503, ['ok'=>false]);
}
