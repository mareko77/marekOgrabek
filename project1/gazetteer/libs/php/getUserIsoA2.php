<?php

	$url='https://api.opencagedata.com/geocode/v1/json?q='. $_REQUEST['lat'] . '+'. $_REQUEST['lng'] .'&key=bb3d7a9bbca044eab82ddfc4be120946';
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result=curl_exec($ch);
	$err = curl_error($ch);
	curl_close($ch);
	
	header('Content-Type: application/json; charset=UTF-8');
	
	if ($err) {
		echo "cURL Error #:" . $err;
	} else {
		$decode = json_decode($result, true);
		$output['isoA3'] = $decode['results'][0]['components']['ISO_3166-1_alpha-3'];
    	$output['isoA2'] = $decode['results'][0]['components']['ISO_3166-1_alpha-2'];
		echo json_encode($output); 
	} 

?>