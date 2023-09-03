<?php

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];

    mysqli_close($conn);

    echo json_encode($output);

    exit;
}

$id = $_POST['id'];
$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$email = $_POST['email'];
$jobTitle = $_POST['jobTitle'];
$departmentID = $_POST['departmentID'];

$query = "UPDATE personnel SET firstName = ?, lastName = ?, email = ?, jobTitle = ?, departmentID = ? WHERE id = ?";
$stmt = $conn->prepare($query);

if ($stmt) {
    $stmt->bind_param("ssssii", $firstName, $lastName, $email, $jobTitle, $departmentID, $id);

    // Execute the query
    $result = $stmt->execute();

    if ($result) {
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
    } else {
        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "query failed";
    }

    $stmt->close();
} else {
    $output['status']['code'] = "400";
    $output['status']['name'] = "preparation";
    $output['status']['description'] = "prepare query failed";
}

$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];

error_log(json_encode($output));


mysqli_close($conn);

echo json_encode($output);



?>

