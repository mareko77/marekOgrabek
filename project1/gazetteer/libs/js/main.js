let map;
let border;

$(window).on('load', function () {
    $(".loader-wrapper").fadeOut("slow");
    userLocation();
});

// Map Initialization
map = L.map('map').setView([51.50, 0.13], 3);

// Map Layers
const wsm = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    minZoom: 2,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});
wsm.addTo(map); 

const stadiaDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    minZoom: 2,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});
    
getCountries();
    


// Layer Controller
const baseMaps = {
    "WSM": wsm,
    "Stadia Dark": stadiaDark
};


L.control.layers(baseMaps).addTo(map)
    .setPosition("bottomright");

L.control.scale().addTo(map);

// L.easyButtons
// button to show Modal with Country Info
const countryInfoButton = new L.easyButton('<i class="fas fa-info"></i>', function() {
    $("#countryModal").modal("show");
}, "Country Info");
countryInfoButton.addTo(map);

// button to show Modal with Weather Info
const weatherInfoButton = new L.easyButton('<i class="fas fa-cloud-sun"></i>', function() {
    $("#weatherModal").modal("show");
}, "Weather Info");
weatherInfoButton.addTo(map);

// Get User Location
function userLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser!");
    }

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        $.ajax({
            url: "libs/php/getUserIsoA2.php",
            type: 'POST',
            dataType: 'json',
            data: {
                lat: latitude,
                lng: longitude
            },
            success: function(result) {
                $("#select-country").val(result.isoA2).change();
            },
            error: function(err) {
                alert("Error: " + err);
            }
        });
    }
    
    function error() {
        alert("Unable to find your location!");
    }
    navigator.geolocation.getCurrentPosition(success, error);
}



// Populate Select/Search Bar
function getCountries() {
    $.ajax({
        url: "libs/php/getCountries.php",
        type: 'POST',
        dataType: 'json',
        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {    
            let selectSearchBar = $("#select-country");
            const countries = result.data;
            countries.forEach(country => {
            
                if (country.iso2 != "-99") {
                    selectSearchBar.append($(
                        `<option value="${country.iso2}">
                            ${country.name}
                        </option>`
                    ));
                }   
            });
        },
        complete: function () {
            $("#loader").addClass("hidden")
        },
        error: function(err) {
            alert("Error: " + err);
        }
    });
}

// Get Borders
function addBorders(country) {
    $.ajax({
        url: "libs/php/getCountryBorder.php",
        type: 'POST',
        dataType: 'json',
        data: {
            isoA2: country
        },
        success: function(result) {
            const countryBorders = result.data;
            
            if (map.hasLayer(border)) {
                map.removeLayer(border);
            }
           border = L.geoJSON(countryBorders, {
               color: "#361999",
               wheight: 14,
               opacity: 1,
               fillOpacity: 0.1
           }).addTo(map);
            map.fitBounds(border.getBounds());  
            
            const bounds = border.getBounds();
            const north = bounds.getNorth();
            const south = bounds.getSouth();
            const east = bounds.getEast();
            const west = bounds.getWest();

            const blLat = bounds._southWest.lat;
            const trLat = bounds._northEast.lat;
            const blLng = bounds._southWest.lng;
            const trLng = bounds._northEast.lng;
            
            nearByCities(north, south, east, west);
            getEarthquakes(north, south, east, west);
            addRestaurants(blLat, trLat, blLng, trLng);
        },
        error: function(textStatus, errorThrown) {
            // console.log(textStatus, errorThrown);
        }
    });    
}

// Country Info
$("#select-country").change(function(){
    $.ajax({
        url: "libs/php/getCountryInfo1.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: $('#select-country').val()
        },
        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {
            console.log(result);
            if (result.status.name == "ok") {

                    $('#countryName').html(result['data'][0]['countryName']);
                    $('#continentName').html(result['data'][0]['continentName']);
					$('#txtCapital').html(result['data'][0]['capital']);
					$('#txtLanguages').html(result['data'][0]['languages']);
                    $('#currencyCode').html(result['data'][0]['currencyCode']);
					$('#txtPopulation').html(result['data'][0]['population']);
					$('#txtArea').html(result['data'][0]['areaInSqKm']);
            }
                
            $("#countryModal").modal("show");
        },
        complete: function () {
            $("#loader").addClass("hidden")
        },
        error: function(jqXHR,textStatus, errorThrown) {
            console.error(jqXHR);
        }
    });    
});

//Weather
let capitalLat;
let capitalLng;

$("#select-country").change(function(){
    $.ajax({
        url: "libs/php/getWeather.php",
        type: 'GET',
        dataType: "json",
        data: {
           /* capitalLat: capitalLat,
            capitalLng: capitalLng*/

            capitalLat: $('#select-country').val(),
            capitalLng: $('#select-country').val()
        },
        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {
            console.log(result);
            /*$("#weatherTable tbody tr td").html("&nbsp;"); 
            let weatherIcon = result.data.weather.current.weather[0].icon;
                
            $('.txtCapitalWeatherName').html(capitalCityName);
            $('#txtCapitalWeatherCurrent').html( Math.round(result.data.weather.current.temp) +'&#8451<br>');
            $('#txtCapitalWeatherDescription').html( result.data.weather.current.weather[0].description);
            $('#txtCapitalWeatherWindspeed').html(result.data.weather.current.wind_speed + ' km/h');
            $('#txtCapitalWeatherHumidity').html( Math.round(result.data.weather.current.humidity) +'&#37');
            $('#txtCapitalWeatherLo').html( Math.round(result.data.weather.daily[0].temp.min) +'&#8451<br>');
            $('#txtCapitalWeatherHi').html( Math.round(result.data.weather.daily[0].temp.max) +'&#8451<br>');
            $('#txtCapitalTomorrowsWeatherLo').html( Math.round(result.data.weather.daily[1].temp.min) +'&#8451<br>');
            $('#txtCapitalTomorrowsWeatherHi').html( Math.round(result.data.weather.daily[1].temp.max) +'&#8451<br>');
            $('#CapitalWeatherIcon').html( `<img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" width="24px">`);
            $('#CapitalHumidityIcon').html('<img src="assets/img/icons/humidity.svg" width="24px">');
            $('#CapitalWindIcon').html('<img src="assets/img/icons/007-windy.svg" width="24px">');
            $('.CapitalHiTempIcon').html('<img src="assets/img/icons/temperatureHi.svg" width="24px">');
            $('.CapitalLoTempIcon').html('<img src="assets/img/icons/temperatureLo.svg" width="24px">');*/

           
            $('#txtCapitalWeatherCurrent').html( result['data']['weather']['current']['temp']);
           

            $('#weatherModal').modal('show');

        },
        complete: function () {
            $("#loader").addClass("hidden")
        },
        error: function(jqXHR,textStatus, errorThrown) {
            console.error(jqXHR);
        }
    });
    
});






