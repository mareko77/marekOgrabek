<?php
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);
    $executionStartTime = microtime(true);
    
   //Weather Api
   $url='api.openweathermap.org/data/2.5/onecall?lat='. $_REQUEST['capitalLat'] . '&lon='. $_REQUEST['capitalLng'] .'&exclude=minutely,hourly,alerts&units=metric&appid=c64df7a25ba41cc7c2044abe6a8564fe';
   $ch = curl_init();

   curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   curl_setopt($ch, CURLOPT_URL,$url);

   $result=curl_exec($ch);

   curl_close($ch);

   $weather = json_decode($result,true);

    //output status
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    
    $output['data']['weather'] = $weather;

    echo json_encode($output);
?>