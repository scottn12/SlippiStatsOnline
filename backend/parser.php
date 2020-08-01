<?php

// Error display
// ini_set('display_errors', 'On');
// error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    include('../../backend/404.php');
    exit();
}

const TO_EMAIL = 'scott.norton12@gmail.com';

// Forward request to server.js
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:3000/slippi");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 100);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($_POST));
$data = curl_exec($ch);
curl_close($ch);

header("Access-Control-Allow-Origin: *");
header('Content-type: application/json');

// Display to frontend
echo json_encode($data);