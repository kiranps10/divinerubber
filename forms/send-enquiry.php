<?php
/**
 * Divine Rubber — enquiry form handler (for cPanel / PHP hosting).
 *
 * The website forms POST here and expect JSON: {"ok": true} or {"ok": false, "message": "..."}.
 * It only reports success if PHP's mail() function accepted the message.
 *
 * BEFORE GOING LIVE:
 *  1. Set $TO_EMAIL to the inbox that should receive enquiries.
 *  2. Set $FROM_EMAIL to an address on the website's own domain (e.g. noreply@divinerubber.com),
 *     otherwise many mail servers will reject or spam-folder the message.
 *  3. Send a test enquiry from the live site and confirm it arrives.
 *  For better deliverability, consider SMTP (e.g. PHPMailer) instead of mail().
 */

$TO_EMAIL   = 'info@divinerubber.com';
$FROM_EMAIL = 'noreply@divinerubber.com';
$SUBJECT    = 'New website enquiry';
$MIN_SECONDS_BETWEEN_SUBMISSIONS = 30;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond($ok, $message = '', $status = 200) {
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

// Honeypot: real visitors never fill this hidden field
if (!empty($_POST['website'])) {
    respond(true); // pretend success to bots, send nothing
}

// Simple per-session rate limit (duplicate / rapid submissions)
session_start();
if (isset($_SESSION['last_enquiry']) && time() - $_SESSION['last_enquiry'] < $MIN_SECONDS_BETWEEN_SUBMISSIONS) {
    respond(false, 'Please wait a moment before sending another enquiry.', 429);
}

// Clean a single-line value (prevents e-mail header injection)
function clean_line($value, $max = 200) {
    $value = trim((string) $value);
    $value = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $value);
    return mb_substr(strip_tags($value), 0, $max);
}

$fields = [
    'enquiry_type'     => clean_line($_POST['enquiry_type'] ?? '', 80),
    'full_name'        => clean_line($_POST['full_name'] ?? '', 100),
    'company'          => clean_line($_POST['company'] ?? '', 150),
    'email'            => clean_line($_POST['email'] ?? '', 150),
    'phone'            => clean_line($_POST['phone'] ?? '', 25),
    'country'          => clean_line($_POST['country'] ?? '', 60),
    'product_category' => clean_line($_POST['product_category'] ?? '', 80),
    'product_name'     => clean_line($_POST['product_name'] ?? '', 150),
    'source'           => clean_line($_POST['source'] ?? '', 80),
];
$message = mb_substr(trim(strip_tags((string) ($_POST['message'] ?? ''))), 0, 3000);

// Country dialling code from the phone picker (e.g. "+91"): prefixed to the number unless
// the visitor already typed an international number starting with "+"
$phone_code = clean_line($_POST['phone_code'] ?? '', 6);
if (preg_match('/^\+\d{1,4}$/', $phone_code) && $fields['phone'] !== '' && $fields['phone'][0] !== '+') {
    $fields['phone'] = $phone_code . ' ' . $fields['phone'];
}

// Server-side validation (never trust the browser alone)
$errors = [];
if ($fields['full_name'] === '') $errors[] = 'name';
if (!filter_var($fields['email'], FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if (preg_match_all('/\d/', $fields['phone']) < 7) $errors[] = 'phone';
if ($fields['country'] === '') $errors[] = 'country';
if (mb_strlen($message) < 2) $errors[] = 'message';
if ($errors) {
    respond(false, 'Please check these fields: ' . implode(', ', $errors) . '.', 422);
}

$labels = [
    'enquiry_type' => 'Enquiry type', 'full_name' => 'Full name', 'company' => 'Company',
    'email' => 'Email', 'phone' => 'Phone', 'country' => 'Country',
    'product_category' => 'Product category', 'product_name' => 'Product name', 'source' => 'Form',
];
$body = "New enquiry from the Divine Rubber website\n\n";
foreach ($labels as $key => $label) {
    if ($fields[$key] !== '') $body .= str_pad($label . ':', 18) . $fields[$key] . "\n";
}
$body .= "\nMessage:\n" . $message . "\n\n---\nSent " . date('Y-m-d H:i') . ' from IP ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$subject = $SUBJECT . ($fields['enquiry_type'] ? ' – ' . $fields['enquiry_type'] : '') . ' – ' . $fields['full_name'];
$headers = [
    'From: Divine Rubber Website <' . $FROM_EMAIL . '>',
    'Reply-To: ' . $fields['full_name'] . ' <' . $fields['email'] . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$sent = mail($TO_EMAIL, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));

if (!$sent) {
    respond(false, 'The mail server could not send your enquiry.', 500);
}

$_SESSION['last_enquiry'] = time();
respond(true);
