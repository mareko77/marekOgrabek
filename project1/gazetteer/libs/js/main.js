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

// button to show Modal with Country flag
const countryFlagButton = new L.easyButton('<i class="fa fa-flag"></i>', function() {
    $("#flagModal").modal("show");
}, "Country Flag");
countryFlagButton.addTo(map);

// Get User Location
function userLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser!");
    }

    function success(position) {

        $.ajax({
            url: "libs/php/getUserIsoA2.php",
            type: 'POST',
            dataType: 'json',
            data: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
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
               color: blue,
               weight: 14,
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
            country: $('#select-country option:selected').val()
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

$("#select-country").change(function(){
    $.ajax({
        url: "libs/php/getOpencage.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: encodeURI($('#select-country option:selected').text())
        }, 
        success: function(result) {
            console.log(result);
            if (result.status.name == "ok") {
                $.ajax({
                    url: "libs/php/getWeather.php",
                    type: 'GET',
                    dataType: "json",
                    data: {
                        capitalLat: result.data[0].geometry.lat,
                        capitalLng: result.data[0].geometry.lng
            
                        
                    },
                    beforeSend: function () {
                        $("#loader").removeClass("hidden");
                    },
                    success: function(result1) {
                        console.log(result1);
                        $("#weatherTable tbody tr td").html("&nbsp;"); 
                        let weatherIconCurrent = result1.data.weather.current.weather[0].icon;

                        $('#capitalWeatherIcon').html( `<img src="https://openweathermap.org/img/wn/${weatherIconCurrent}@2x.png" width="120px">`);
                        $('#txtCapitalWeatherName').html(result1.data.weather.timezone);
                        $('#txtCapitalWeatherCurrent').html( Math.round(result1.data.weather.current.temp) +'&#8451<br>');
                        $('#txtCapitalWeatherDescription').html( result1.data.weather.current.weather[0].description);
                        $('#txtCapitalWeatherWindspeed').html(result1.data.weather.current.wind_speed + ' km/h');
                        $('#txtCapitalWeatherHumidity').html( Math.round(result1.data.weather.current.humidity) +'&#37');
                        $('#txtCapitalWeatherLo').html( Math.round(result1.data.weather.daily[0].temp.min) +'&#8451<br>');
                        $('#txtCapitalWeatherHi').html( Math.round(result1.data.weather.daily[0].temp.max) +'&#8451<br>');

                        var sunrise = moment( result1.data.weather.current.sunrise*1000).format("HH:mm");
                        $('#txtCapitalSunrise').html(sunrise);
                        var sunset = moment( result1.data.weather.current.sunset*1000).format("HH:mm");
                        $('#txtCapitalSunset').html(sunset);
                        $('.capitalSunriseIcon').html('<img src="images/icons/sunrise.png" width="24px">');
                        $('.capitalSunsetIcon').html('<img src="images/icons/sunset.png" width="24px">');

                        $('#txtCapitalTomorrowsWeatherLo').html( Math.round(result1.data.weather.daily[1].temp.min) +'&#8451<br>');
                        $('#txtCapitalTomorrowsWeatherHi').html( Math.round(result1.data.weather.daily[1].temp.max) +'&#8451<br>');
                       
                        $('#weatherIcon').html('<img src="images/icons/weather.svg" width="24px">');
                        $('#capitalHumidityIcon').html('<img src="images/icons/humidity.svg" width="24px">');
                        $('#capitalWindIcon').html('<img src="images/icons/007-windy.svg" width="24px">');
                        $('.capitalHiTempIcon').html('<img src="images/icons/thermometer.svg" width="24px">');
                        $('.capitalLoTempIcon').html('<img src="images/icons/thermometer-colder.svg" width="24px">');

                        
                        
            
                        //$('#weatherModal').modal('show');
            
                    },
                    complete: function () {
                        $("#loader").addClass("hidden")
                    },
                    error: function(jqXHR,textStatus, errorThrown) {
                        console.error(jqXHR);
                    }
                });        
            } 
        }
    });    
});

//Flag
$("#select-country").change(function() {
    $.ajax({
        url: "libs/php/getFlag.php",
        type: 'POST',
        dataType: 'json',
        data: {
            code: $('#select-country option:selected').val()
        },
        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {

            let countryFlag = $("#country-flag");
            countryFlag.html("");

                countryFlag.append($(
                    `<div class="card h-100 country">
                            <img src="${result.flag}" alt="${result.name}"/>
                    </div>
                    <div class="card-body country">
                        <h4><a href="https://en.wikipedia.org/wiki/${result.name}" target="_blank">${result.name}</a></h4>
                    </div>`
                ));
                $("#countryFlagModal").modal("show");
                
        },
        complete: function () {
            $("#loader").addClass("hidden")
        },
        error: function(textStatus, errorThrown) {
            alert("Error: " + errorThrown);
        }
    });    
});



//earthquake 

let earthquakeM = L.markerClusterGroup();
map.addLayer(earthquakeM);

const earthquakeIcon = L.icon({
    iconUrl: 'images/earthquakeIcon.png',
    iconSize: [50, 50],
    iconAnchor: [25, 45],
    popupAnchor: [0, -40]
});

function getEarthquakes(north, south, east, west) {
    earthquakeM.clearLayers();
    $.ajax({
        url: "libs/php/getEarthquake.php",
        type: 'POST',
        dataType: 'json',
        data: {
            north: north,
            south: south,
            east: east,
            west: west
        },
        success: function(result) {    
            const earthquakes = result.data;
            
            earthquakes.forEach(earthquake => {
                const earthquakeMarker = L.marker([`${earthquake.lat}`, `${earthquake.lng}`], {icon: earthquakeIcon})
                    .bindPopup(`
                            <div class="container card h-100">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th><strong>Earthquake</strong></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th scope="row">Magnitude:</th> <td class="text-end"><strong>${earthquake.magnitude}</strong></td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Date and Time:</th> <td class="text-end">${window.moment(earthquake.datetime).format('MMMM Do YYYY, h:mm:ss A')}<td>
                                        </tr>
                                    </tbody>
                                </table>
                            <div>`
                );
                earthquakesM.addLayer(earthquakeMarker);
            });
        },
        error: function(textStatus, errorThrown) {
            // console.log(textStatus, errorThrown);
        }
    });    
}





