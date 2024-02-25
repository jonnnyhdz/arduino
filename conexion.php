<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'sm52_arduino';
$username = 'root';
$password = 'root';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password, [PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"]);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Asegúrate de que las columnas y las tablas existen en tu base de datos
    $sql1 = "SELECT mensaje, dato_sensor, hora, color_led FROM detecciones ORDER BY id DESC LIMIT 100";
    $stmt1 = $pdo->query($sql1);
    $data1 = $stmt1->fetchAll(PDO::FETCH_ASSOC);

    $sql2 = "SELECT mensaje, led_color, fecha, distancia FROM tb_puerto_serial ORDER BY id DESC LIMIT 100";
    $stmt2 = $pdo->query($sql2);
    $data2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['detecciones' => $data1, 'puertoSerial' => $data2]);
} catch (PDOException $e) {
    echo json_encode(["error" => "Could not connect. " . $e->getMessage()]);
}
?>
