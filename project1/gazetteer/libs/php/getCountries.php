<?php

    $countryData = json_decode(file_get_contents("../../vendors/json/countryBorders.geo.json"), true);

    $countries = [];

    foreach ($countryData['features'] as $feature) {

        $country = null;
        $country['iso3'] = $feature['properties']['iso_a3'];
        $country['name'] = $feature['properties']['name'];

        array_push($countries, $country); 
   };

    usort($countries, function ($item1, $item2) {

        return $item1['name'] <=> $item2['name'];
    });

    $output['data'] = $countries;

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>
