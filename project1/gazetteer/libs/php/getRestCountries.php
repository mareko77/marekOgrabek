<?php

	$url='https://restcountries.com/v3.1/alpha/' . $_REQUEST['country'];
	
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
		echo json_encode($decode); 
	}	
?>