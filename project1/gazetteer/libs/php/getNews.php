<?php

	$url='https://newsapi.org/v2/top-headlines?q=' . $_REQUEST['country'] . '&pageSize=10&sortBy=relevancy&apiKey=527711db59f84ad99164680f94a74fe5';
	
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json; charset=UTF-8'
	]);
	//curl_setopt( $ch, CURLOPT_USERAGENT, $userAgent);
	$opts = array(
		'http'=>array(
			'method'=>"GET",
			'header'=>"User-Agent: Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion"
		)
	);

	$context = stream_context_create($opts);
	// Open the file using the HTTP headers set above
	$file = file_get_contents($url, false, $context);

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