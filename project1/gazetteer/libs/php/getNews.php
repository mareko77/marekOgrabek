<?php

	
	$url='https://newsapi.org/v2/top-headlines?country=' . $_REQUEST['country'] . '&apiKey=527711db59f84ad99164680f94a74fe5';
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json; charset=UTF-8'
	]);

	$result=curl_exec($ch);
	$err = curl_error($ch);
	
	curl_close($ch);


	if ($err) {
		echo "cURL Error #:" . $err;
	} else {
		$decode = json_decode($result, true);
		echo json_encode($decode); 
	}	
?>