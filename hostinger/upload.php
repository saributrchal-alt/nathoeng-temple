<?php
declare(strict_types=1);
// Server-to-server only. Keep upload_key in the calling app's backend secrets.
// POST multipart/form-data: file=<image>, folder=gears|library|temple|nathoeng
// Header: X-Upload-Key: <config.php upload_key>
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

try {
    $config = require __DIR__ . '/config.php';
    $key = $config['upload_key'] ?? null;
    $base = $config['base_url'] ?? null;
    $limit = $config['max_bytes'] ?? null;
    if (!is_string($key) || strlen($key) < 32 || !is_string($base)
        || strpos($base, 'https://') !== 0 || !is_int($limit) || $limit < 1) {
        respond(500, ['ok' => false, 'error' => 'invalid_server_configuration']);
    }
    $provided = $_SERVER['HTTP_X_UPLOAD_KEY'] ?? '';
    if (!is_string($provided) || !hash_equals($key, $provided)) {
        respond(401, ['ok' => false, 'error' => 'unauthorized']);
    }
    $folder = $_POST['folder'] ?? '';
    if (!in_array($folder, ['gears', 'library', 'temple', 'nathoeng'], true)) {
        respond(400, ['ok' => false, 'error' => 'unsupported_project_folder']);
    }
    $file = $_FILES['file'] ?? null;
    if (!is_array($file) || !isset($file['error']) || !is_int($file['error'])) {
        respond(400, ['ok' => false, 'error' => 'missing_file']);
    }
    if (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
        respond(413, ['ok' => false, 'error' => 'file_too_large']);
    }
    if ($file['error'] !== UPLOAD_ERR_OK || !is_string($file['tmp_name'] ?? null)
        || !is_uploaded_file($file['tmp_name'])) {
        respond(400, ['ok' => false, 'error' => 'upload_failed']);
    }
    $tmp = $file['tmp_name'];
    $bytes = filesize($tmp);
    if ($bytes === false || $bytes < 1 || $bytes > $limit) {
        respond(413, ['ok' => false, 'error' => 'file_too_large_or_empty']);
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmp);
    $types = ['image/jpeg' => IMAGETYPE_JPEG, 'image/png' => IMAGETYPE_PNG, 'image/webp' => IMAGETYPE_WEBP];
    $info = @getimagesize($tmp);
    if (!isset($types[$mime]) || !$info || $info[2] !== $types[$mime]) {
        respond(415, ['ok' => false, 'error' => 'only_jpeg_png_webp']);
    }
    $width = $info[0];
    $height = $info[1];
    if ($width < 1 || $height < 1 || $width > 8000 || $height > 8000 || $width * $height > 12000000) {
        respond(422, ['ok' => false, 'error' => 'image_dimensions_too_large']);
    }
    // Decode and re-encode: never publish the original uploaded bytes or filename.
    $source = @imagecreatefromstring(file_get_contents($tmp));
    if (!$source) {
        respond(422, ['ok' => false, 'error' => 'invalid_image']);
    }
    $scale = min(1, 1920 / max($width, $height));
    $outWidth = max(1, (int) round($width * $scale));
    $outHeight = max(1, (int) round($height * $scale));
    $output = imagecreatetruecolor($outWidth, $outHeight);
    imagealphablending($output, false);
    imagesavealpha($output, true);
    imagefill($output, 0, 0, imagecolorallocatealpha($output, 0, 0, 0, 127));
    if (!imagecopyresampled($output, $source, 0, 0, 0, 0, $outWidth, $outHeight, $width, $height)) {
        throw new RuntimeException('Resize failed');
    }
    imagedestroy($source);
    $relativeDir = 'uploads/' . $folder . '/' . gmdate('Y/m');
    $directory = __DIR__ . '/' . $relativeDir;
    if (!is_dir($directory) && !@mkdir($directory, 0755, true) && !is_dir($directory)) {
        throw new RuntimeException('Storage unavailable');
    }
    $filename = bin2hex(random_bytes(16)) . '.webp';
    $destination = $directory . '/' . $filename;
    $staging = tempnam($directory, '.pending-');
    if ($staging === false) {
        throw new RuntimeException('Temporary storage unavailable');
    }
    try {
        if (!imagewebp($output, $staging, 82)) {
            throw new RuntimeException('Encoding failed');
        }
        clearstatcache(true, $staging);
        $savedBytes = filesize($staging);
        if (!$savedBytes || $savedBytes > $limit) {
            @unlink($staging);
            respond(422, ['ok' => false, 'error' => 'encoded_image_too_large']);
        }
        if (!chmod($staging, 0644) || !rename($staging, $destination)) {
            throw new RuntimeException('Saving failed');
        }
    } finally {
        if (is_file($staging)) { @unlink($staging); }
        imagedestroy($output);
    }
    respond(201, [
        'ok' => true,
        'url' => rtrim($base, '/') . '/' . $relativeDir . '/' . $filename,
        'path' => $relativeDir . '/' . $filename,
        'mime' => 'image/webp', 'bytes' => $savedBytes,
        'width' => $outWidth, 'height' => $outHeight,
    ]);
} catch (Throwable $e) {
    error_log('Nathoeng Media upload failed: ' . get_class($e));
    respond(500, ['ok' => false, 'error' => 'server_error']);
}
