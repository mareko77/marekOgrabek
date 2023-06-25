<?php

    $executionStartTime = microtime(true) / 1000;
    $apiKey = "RL0bjZct9wXeOqsC72coF_H1UaZr_7EJZvDMPWY6hao";

    $url = "https://api.unsplash.com/search/photos?page=1&query=" . urlencode($_REQUEST['query']) . "&client_id=" . $apiKey;

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

    $result = curl_exec($ch);

        if($result === FALSE) {
            echo "cURL Error: " . curl_error($ch);
        }

    curl_close($ch);
    
    $decode = json_decode($result, true);

    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = $decode;
    
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);

?>