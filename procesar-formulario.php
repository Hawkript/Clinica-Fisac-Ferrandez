<?php
/**
 * Procesador de Formularios - Clínica Veterinaria Fisac Ferrández
 * Con medidas de seguridad avanzadas
 * Versión: 2.0
 * Fecha: 21/10/2025
 */

// ============================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================

// Deshabilitar reporte de errores en producción
error_reporting(0);
ini_set('display_errors', 0);

// Iniciar sesión segura
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_only_cookies', 1);
session_start();

// Configuración de zona horaria
date_default_timezone_set('Europe/Madrid');

// Headers de seguridad
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Content-Security-Policy: default-src \'self\'');

// ============================================
// CONFIGURACIÓN DE EMAIL
// ============================================

define('DESTINATARIO_EMAIL', 'info@clinicafisacferrandez.com');
define('NOMBRE_EMPRESA', 'Clínica Veterinaria Fisac Ferrández');
define('MAX_INTENTOS', 5);
define('TIEMPO_BLOQUEO', 3600); // 1 hora en segundos

// ============================================
// FUNCIÓN DE LOGGING SEGURO
// ============================================

function logError($mensaje) {
    $log_file = __DIR__ . '/logs/errores.log';
    $log_dir = dirname($log_file);

    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0750, true);
    }

    $fecha = date('Y-m-d H:i:s');
    $ip = obtenerIPReal();
    $log_mensaje = "[{$fecha}] IP: {$ip} - {$mensaje}\n";

    error_log($log_mensaje, 3, $log_file);
}

// ============================================
// OBTENER IP REAL DEL CLIENTE
// ============================================

function obtenerIPReal() {
    $headers = [
        'HTTP_CF_CONNECTING_IP', // Cloudflare
        'HTTP_X_REAL_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_CLIENT_IP',
        'REMOTE_ADDR'
    ];

    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ip = $_SERVER[$header];
            // Si hay múltiples IPs, tomar la primera
            if (strpos($ip, ',') !== false) {
                $ips = explode(',', $ip);
                $ip = trim($ips[0]);
            }
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }

    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// ============================================
// VERIFICACIÓN DE RATE LIMITING
// ============================================

function verificarRateLimiting() {
    $ip = obtenerIPReal();
    $archivo_intentos = __DIR__ . '/logs/rate_limit.json';

    if (!file_exists($archivo_intentos)) {
        file_put_contents($archivo_intentos, json_encode([]));
    }

    $intentos = json_decode(file_get_contents($archivo_intentos), true);
    $tiempo_actual = time();

    // Limpiar intentos antiguos
    foreach ($intentos as $key => $datos) {
        if ($tiempo_actual - $datos['tiempo'] > TIEMPO_BLOQUEO) {
            unset($intentos[$key]);
        }
    }

    // Verificar IP actual
    if (isset($intentos[$ip])) {
        if ($intentos[$ip]['contador'] >= MAX_INTENTOS) {
            if ($tiempo_actual - $intentos[$ip]['tiempo'] < TIEMPO_BLOQUEO) {
                logError("IP bloqueada por exceso de intentos: {$ip}");
                return false;
            } else {
                // Resetear contador si pasó el tiempo de bloqueo
                $intentos[$ip] = ['contador' => 1, 'tiempo' => $tiempo_actual];
            }
        } else {
            $intentos[$ip]['contador']++;
            $intentos[$ip]['tiempo'] = $tiempo_actual;
        }
    } else {
        $intentos[$ip] = ['contador' => 1, 'tiempo' => $tiempo_actual];
    }

    file_put_contents($archivo_intentos, json_encode($intentos));
    return true;
}

// ============================================
// VERIFICACIÓN CSRF TOKEN
// ============================================

function verificarCSRFToken() {
    if (!isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token'])) {
        return false;
    }

    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        return false;
    }

    // Token de un solo uso
    unset($_SESSION['csrf_token']);
    return true;
}

// Generar nuevo token para próxima petición
function generarCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// ============================================
// SANITIZACIÓN DE DATOS
// ============================================

function sanitizarTexto($texto) {
    $texto = trim($texto);
    $texto = stripslashes($texto);
    $texto = htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
    return $texto;
}

function sanitizarEmail($email) {
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);
    return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : false;
}

function sanitizarTelefono($telefono) {
    $telefono = preg_replace('/[^0-9]/', '', $telefono);
    return preg_match('/^[6-9]\d{8}$/', $telefono) ? $telefono : false;
}

// ============================================
// VERIFICACIÓN DE HONEYPOT
// ============================================

function verificarHoneypot() {
    // Campo honeypot (debe estar vacío)
    if (isset($_POST['website']) && !empty($_POST['website'])) {
        logError("Bot detectado - honeypot: " . $_POST['website']);
        return false;
    }

    // Verificar tiempo mínimo de envío (3 segundos)
    if (isset($_POST['timestamp'])) {
        $tiempo_formulario = (int)$_POST['timestamp'];
        $tiempo_actual = time();
        if (($tiempo_actual - $tiempo_formulario) < 3) {
            logError("Envío demasiado rápido - posible bot");
            return false;
        }
    }

    return true;
}

// ============================================
// VERIFICACIÓN DE DATOS REQUERIDOS
// ============================================

function verificarCamposRequeridos() {
    $campos_requeridos = ['nombre', 'email', 'telefono', 'motivo', 'mensaje'];

    foreach ($campos_requeridos as $campo) {
        if (!isset($_POST[$campo]) || empty(trim($_POST[$campo]))) {
            return false;
        }
    }

    return true;
}

// ============================================
// ENVÍO DE EMAIL SEGURO
// ============================================

function enviarEmail($datos) {
    $para = DESTINATARIO_EMAIL;
    $asunto = '[Web Contacto] ' . sanitizarTexto($datos['motivo']);

    // Construir mensaje HTML
    $mensaje_html = '
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #012d6a; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #012d6a; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Nuevo mensaje de contacto</h2>
            </div>
            <div class="content">
                <div class="field">
                    <span class="label">Nombre:</span><br>
                    ' . $datos['nombre'] . '
                </div>
                <div class="field">
                    <span class="label">Email:</span><br>
                    ' . $datos['email'] . '
                </div>
                <div class="field">
                    <span class="label">Teléfono:</span><br>
                    ' . $datos['telefono'] . '
                </div>
                <div class="field">
                    <span class="label">Nombre mascota:</span><br>
                    ' . ($datos['mascota'] ?? 'No especificado') . '
                </div>
                <div class="field">
                    <span class="label">Tipo de mascota:</span><br>
                    ' . ($datos['tipo_mascota'] ?? 'No especificado') . '
                </div>
                <div class="field">
                    <span class="label">Motivo:</span><br>
                    ' . $datos['motivo'] . '
                </div>
                <div class="field">
                    <span class="label">Mensaje:</span><br>
                    ' . nl2br($datos['mensaje']) . '
                </div>
                <div class="field">
                    <span class="label">Newsletter:</span><br>
                    ' . ($datos['newsletter'] ? 'Sí' : 'No') . '
                </div>
                <div class="field">
                    <span class="label">Fecha y hora:</span><br>
                    ' . date('d/m/Y H:i:s') . '
                </div>
                <div class="field">
                    <span class="label">IP:</span><br>
                    ' . obtenerIPReal() . '
                </div>
            </div>
            <div class="footer">
                <p>Este mensaje fue enviado desde el formulario de contacto de<br>
                <strong>' . NOMBRE_EMPRESA . '</strong></p>
            </div>
        </div>
    </body>
    </html>
    ';

    // Headers del email
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: " . NOMBRE_EMPRESA . " <noreply@clinicafisacferrandez.com>\r\n";
    $headers .= "Reply-To: " . $datos['email'] . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "X-Priority: 1\r\n";

    // Enviar email
    $enviado = mail($para, $asunto, $mensaje_html, $headers);

    if ($enviado) {
        logError("Email enviado correctamente a {$para}");
    } else {
        logError("Error al enviar email a {$para}");
    }

    return $enviado;
}

// ============================================
// ENVÍO DE EMAIL DE CONFIRMACIÓN AL CLIENTE
// ============================================

function enviarEmailConfirmacion($datos) {
    $para = $datos['email'];
    $asunto = 'Confirmación de recepción - ' . NOMBRE_EMPRESA;

    $mensaje_html = '
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #012d6a; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .btn { background: #00a8e8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>¡Gracias por contactarnos!</h1>
            </div>
            <div class="content">
                <p>Hola <strong>' . $datos['nombre'] . '</strong>,</p>
                <p>Hemos recibido correctamente tu mensaje y nos pondremos en contacto contigo lo antes posible.</p>
                <p><strong>Resumen de tu consulta:</strong></p>
                <ul>
                    <li><strong>Motivo:</strong> ' . $datos['motivo'] . '</li>
                    <li><strong>Mascota:</strong> ' . ($datos['mascota'] ?? 'No especificado') . '</li>
                </ul>
                <p>Nuestro equipo revisará tu mensaje y te responderá en un plazo máximo de 24-48 horas laborables.</p>
                <p>Si necesitas atención urgente, puedes llamarnos a:</p>
                <ul>
                    <li><strong>Cita previa:</strong> 947 20 07 35</li>
                    <li><strong>Urgencias 24h:</strong> 689 56 91 71</li>
                </ul>
                <p>Gracias por confiar en nosotros para el cuidado de tu mascota.</p>
            </div>
            <div class="footer">
                <p><strong>' . NOMBRE_EMPRESA . '</strong><br>
                C/ Las Calzadas, 4 - 09004 Burgos<br>
                info@clinicafisacferrandez.com</p>
            </div>
        </div>
    </body>
    </html>
    ';

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: " . NOMBRE_EMPRESA . " <noreply@clinicafisacferrandez.com>\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

    return mail($para, $asunto, $mensaje_html, $headers);
}

// ============================================
// PROCESAMIENTO PRINCIPAL
// ============================================

// Verificar que sea petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logError("Intento de acceso no autorizado - Método: " . $_SERVER['REQUEST_METHOD']);
    header('HTTP/1.1 405 Method Not Allowed');
    die('Método no permitido');
}

// Verificar rate limiting
if (!verificarRateLimiting()) {
    header('Location: contacto.html?error=rate_limit');
    exit;
}

// Verificar honeypot
if (!verificarHoneypot()) {
    header('Location: contacto.html?error=bot');
    exit;
}

// Verificar campos requeridos
if (!verificarCamposRequeridos()) {
    logError("Campos requeridos faltantes");
    header('Location: contacto.html?error=campos');
    exit;
}

// Sanitizar y validar datos
$datos = [
    'nombre' => sanitizarTexto($_POST['nombre']),
    'email' => sanitizarEmail($_POST['email']),
    'telefono' => sanitizarTelefono($_POST['telefono']),
    'mascota' => isset($_POST['mascota']) ? sanitizarTexto($_POST['mascota']) : '',
    'tipo_mascota' => isset($_POST['tipo-mascota']) ? sanitizarTexto($_POST['tipo-mascota']) : '',
    'motivo' => sanitizarTexto($_POST['motivo']),
    'mensaje' => sanitizarTexto($_POST['mensaje']),
    'newsletter' => isset($_POST['newsletter'])
];

// Validar email
if ($datos['email'] === false) {
    logError("Email inválido: " . $_POST['email']);
    header('Location: contacto.html?error=email');
    exit;
}

// Validar teléfono
if ($datos['telefono'] === false) {
    logError("Teléfono inválido: " . $_POST['telefono']);
    header('Location: contacto.html?error=telefono');
    exit;
}

// Enviar emails
$enviado = enviarEmail($datos);
if ($enviado) {
    enviarEmailConfirmacion($datos);
    logError("Formulario procesado correctamente - Email: " . $datos['email']);
    header('Location: contacto.html?success=true');
} else {
    logError("Error al enviar email - Email: " . $datos['email']);
    header('Location: contacto.html?error=true');
}

exit;
?>
