<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// SMTP Configuration voor info@suripost.nl
// Vul hieronder jouw eigen SMTP gegevens in:

$smtp_config = array(
    "host" => "mail.suripost.nl",        // Vervang met jouw SMTP server
    "port" => 587,                       // Meestal 587 (TLS) of 465 (SSL) of 25
    "secure" => false,                   // true voor SSL (port 465), false voor TLS (port 587)
    "user" => "info@suripost.nl",        // Jouw e-mail gebruikersnaam
    "password" => "VANG_HIER_JOUW_SMTP_WACHTWOORD_IN"  // Vervang met jouw SMTP wachtwoord
);

// Stuur de configuratie terug als JSON
echo json_encode($smtp_config);
?>