<?php

    $geoJSON = json_decode(file_get_contents("../../vendors/json/countryBorders.geo.json"), true);
    $countries = $geoJSON['features'];

    $countryBorder = null;

    foreach ($countries as $country) {
        if($country['properties']['iso_a2'] == $_REQUEST['isoA2']) {
            $countryBorder = $country['geometry'];
        }
        
    }

    $output['data'] = $countryBorder;

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>