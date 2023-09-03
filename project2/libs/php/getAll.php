<?php

// example use from browser
// http://localhost/companydirectory/libs/php/getAll.php

// remove next two lines for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

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

// Retrieve filter parameters from the query string
$selectedDepartments = $_GET['departments'] ?? [];
$selectedLocations = $_GET['locations'] ?? [];

// Construct the SQL query with filter parameters
$query = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, p.departmentID, d.name as department, d.locationID, l.name as location FROM personnel p LEFT JOIN department d ON (d.id = p.departmentID) LEFT JOIN location l ON (l.id = d.locationID)';

if (!empty($selectedDepartments)) {
    // Convert department IDs to integers
    $departmentIDs = array_map('intval', $selectedDepartments);
    $query .= ' WHERE d.id IN (' . implode(',', $departmentIDs) . ')';
}

if (!empty($selectedLocations)) {
    if (!empty($selectedDepartments)) {
        $query .= ' AND';
    } else {
        $query .= ' WHERE';
    }
    
    // Convert location IDs to integers
    $locationIDs = array_map('intval', $selectedLocations);
    $query .= ' l.id IN (' . implode(',', $locationIDs) . ')';
}

$query .= ' ORDER BY p.lastName, p.firstName, d.name, l.name';

// $output['debugQuery'] = $query;

$result = $conn->query($query);

if (!$result) {
    // Log the SQL error
    echo "SQL Error: " . $conn->error;
    // ...
}



if (!$result) {

    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";
    $output['data'] = [];

    mysqli_close($conn);

    echo json_encode($output);

    exit;

}

$data = [];

while ($row = mysqli_fetch_assoc($result)) {

    array_push($data, $row);

}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $data;

mysqli_close($conn);

echo json_encode($output);

?>
