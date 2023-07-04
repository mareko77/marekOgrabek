<?php

	$url='https://travel-advisor.p.rapidapi.com/restaurants/list-in-boundary?bl_latitude=' . $_REQUEST['blLat'] . '&tr_latitude=' . $_REQUEST['trLat'] . '&bl_longitude=' . $_REQUEST['blLng'] . '&tr_longitude=' . $_REQUEST['trLng'] . '&open_now=false&lang=en_US';
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
		"x-rapidapi-host: travel-advisor.p.rapidapi.com",
		"x-rapidapi-key: ***",
        'Content-Type: application/json; charset=UTF-8'
	]);
	curl_setopt($ch, CURLOPT_URL, $url);

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