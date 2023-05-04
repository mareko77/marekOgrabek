$('#btnRun1').click(function() {
    $.ajax({
        url: "libs/php/ocean.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#selLatitude').val(),
            lng: $('#selLongitude').val()
        },
        success: function(result) {
            console.log(JSON.stringify(result));
            console.log(JSON.stringify(result.data));
           
            if (result.status.name == "ok") {
                $('#result1').html(result['data']['name']);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#result1').html("There isn't any ocean or sea here!");
        }
    }); 
});

$('#btnRun2').click(function() {
    $.ajax({
        url: "libs/php/weather.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat1: $('#selLatitude1').val(),
            lng1: $('#selLongitude1').val()
        },
        success: function(result) {
            console.log(JSON.stringify(result));
            console.log(JSON.stringify(result.data));
           
            if (result.status.name == "ok") {
                $('#stationNameResult').html(result['data']['stationName']);
                $('#countryCodeResult').html(result['data']['countryCode']);
                $('#temperatureResult').html(result['data']['temperature']);
                $('#humidityResult').html(result['data']['humidity']);
                $('#cloudsResult').html(result['data']['clouds']);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#stationNameResult').html("There is no data for this location!");
        }
    }); 
});

$('#btnRun3').click(function() {
    $.ajax({
        url: "libs/php/currency.php",
        type: 'POST',
        dataType: 'json',
        data: {
            currency: $('#currency').val(),
            lang: $('#language').val()
        },
        success: function(result) {
            console.log(JSON.stringify(result));
            console.log(JSON.stringify(result.data));


            if (result.status.name == "ok") {
                $('#currencyResult').html(result['data'][0]['currencyCode']);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#currencyResult').html("There is an error! Try again!");
        }
    }); 
});


	