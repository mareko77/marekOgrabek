<?php
// Include the database configuration file
include("config.php");

// Check if the location ID is provided in the POST request
if (isset($_POST['id'])) {
    $locationID = $_POST['id'];

    // Create a connection to the database
    $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

    if (mysqli_connect_errno()) {
        // Handle database connection error
        $output['status']['code'] = "300";
        $output['status']['name'] = "failure";
        $output['status']['description'] = "Database unavailable";
        $output['status']['returnedIn'] = 0 . " ms";
        $output['data'] = [];
        mysqli_close($conn);
        echo json_encode($output);
        exit;
    }

    // Prepare and execute a SQL query to check for dependencies
    $query = $conn->prepare('SELECT COUNT(id) AS departmentCount, (SELECT name FROM location WHERE id = ?) AS locationName FROM department WHERE locationID = ?');
    $query->bind_param("ii", $locationID, $locationID);
    $query->execute();

    if ($query === false) {
        // Handle query execution error
        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "Query failed";
        $output['data'] = [];
        mysqli_close($conn);
        echo json_encode($output);
        exit;
    }

    // Get the result of the query
    $result = $query->get_result();
    $data = [];

    while ($row = mysqli_fetch_assoc($result)) {
        array_push($data, $row);
    }

    // Prepare the response
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "Success";
    $output['status']['returnedIn'] = 0 . " ms";
    $output['data'] = $data;

    // Return the JSON response
    echo json_encode($output);

    // Close the database connection
    mysqli_close($conn);
} else {
    // Handle missing location ID in the POST request
    $output['status']['code'] = "400";
    $output['status']['name'] = "bad request";
    $output['status']['description'] = "Location ID not provided";
    $output['data'] = [];
    echo json_encode($output);
}
?>
