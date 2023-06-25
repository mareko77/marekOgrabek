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


// Satellite
const SatelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
});

SatelliteMap.addTo(map); 

//Esri_NatGeoWorldMap
var Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; National Geographic. Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> and <a href="https://smashicons.com/" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>', maxZoom: 12});
    
getCountries();
    
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

// button to show Modal with News Info
const newsButton = new L.easyButton('<i class="far fa-newspaper"></i>', function() {
    $("#newsModal").modal("show");
}, "Country News");
newsButton.addTo(map);

// button to show Modal with Images
const imageButton = new L.easyButton('<i class="fas fa-camera-retro"></i>', function() {
    $("#imagesModalScrollable").modal("show");
}, "Images");
imageButton.addTo(map);


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



$("#select-country").change(function(){

// Get Borders
    $.ajax({
        url: "libs/php/getCountryBorder.php",
        type: 'POST',
        dataType: 'json',
        data: {
           isoA2: $('#select-country option:selected').val()
        },
        
        success: function(result) {
            console.log(result);
            const countryBorders = result.data;

            if(border){
                border.clearLayers();
            }

           border = L.geoJSON(countryBorders, {
               color: 'blue',
               weight: 4,
               opacity: 1,
               fillOpacity: 0.1
           }).addTo(map);

            map.fitBounds(border.getBounds());  
            const bounds = border.getBounds();
            const north = bounds.getNorth();
            const south = bounds.getSouth();
            const east = bounds.getEast();
            const west = bounds.getWest();
           
            getCities(north, south, east, west);
            getEarthquakes(north, south, east, west);
        },

        error: function(jqXHR,textStatus, errorThrown) {
            console.error(jqXHR);
        }
    });  
    

    //Weather


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
                        let weatherIconTomorrow = result1.data.weather.daily[0].weather[0].icon;

                        $('#capitalWeatherIcon').html( `<img src="https://openweathermap.org/img/wn/${weatherIconCurrent}@2x.png" width="120px">`);
                        $('#capitalWeatherIconTomorrow').html( `<img src="https://openweathermap.org/img/wn/${weatherIconTomorrow}@2x.png" width="120px">`);
                        $('#txtCapitalWeatherName').html(result1.data.weather.timezone);
                        $('#txtCapitalWeatherCurrent').html( Math.round(result1.data.weather.current.temp) +'&#8451<br>');
                        $('#txtCapitalWeatherDescription').html( result1.data.weather.current.weather[0].description);
                        $('#txtCapitalWeatherDescriptionTomorrow').html( result1.data.weather.daily[0].weather[0].description);
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

    //Country Info

    $.ajax({
        url: "libs/php/getCountryInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            code: $('#select-country option:selected').val()
        },

        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },

        success: function(result) {
           
            console.log(result);

            let countryInformation = $("#country-info");

            countryInformation .html("");
            countryInformation .append($(
                

                    `<div class="card-body country">
                        <h3 id='flag-country'><strong>${result[0].altSpellings[1]}</strong></h3>
                    </div>
                    <div class="card h-100 country">
                            <img src="${result[0].flags.png}" alt="${result[0].flags.alt}"/>
                    </div> 
                        <table class="table table-striped table-sm">
                            <tbody>
                                <tr>
                                    <th scope="row">Capital:</th><td>${result[0].capital}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Population:</th><td>${result[0].population.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Area:</th><td>${result[0].area.toLocaleString()} Km<sup>2</sup></td>
                                </tr>
                                <tr>
                                    <th scope="row">Region:</th><td>${result[0].region}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Subregion:</th><td>${result[0].subregion}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Timezone:</th><td>${result[0].timezones}</td>
                                </tr>
                            </tbody>
                        </table>`


                ));
        
        },

        complete: function () {

            $("#loader").addClass("hidden")

        },

        error: function(jqXHR,textStatus, errorThrown) {

            alert("Error: " + errorThrown);

            console.log(jqXHR);

        }

    });  

    //Country info 1

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

            let countryInformation1 = $("#country-info1");

            countryInformation1 .html("");
            countryInformation1 .append($(
                

                    
                        `<table class="table table-striped table-sm">
                            <tbody>
                                <tr>
                                    <th scope="row">Languages:</th><td>${result.data[0].languages}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Currencies:</th><td>${result.data[0].currencyCode}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Country Code:</th><td>${result.data[0].countryCode}</td>
                                </tr>
                            </tbody>
                        </table>`


                ));
        
        },

        complete: function () {

            $("#loader").addClass("hidden")

        },

        error: function(jqXHR,textStatus, errorThrown) {

            alert("Error: " + errorThrown);

            console.log(jqXHR);

        }

    });  

      //Location Images:
      $.ajax({
        url: "php/getLocationImages.php",
        type: 'POST',
        dataType: 'json',
        data: {
            query: $('#select-country option:selected').text()
        },
        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {

            console.log(result);
            $("#countryImages").empty();
            
            if (result.status.name == "ok") {
                    
                    $("#countryImages").append("<p style='color:white' id='description' class='countryDescription'>")
                    $("#countryImages").append("<img src='' alt='' id='image' class='countryImages'><br><br>")
                    $("#image").attr('src', result['data']['results']['urls']['regular']);
                    $("#image").attr('alt', result['data']['results']['description']);
                    $("#description").append(result['data']['results']['description']);
            }
        
        },

        complete: function () {
            $("#loader").addClass("hidden")
        },

        error: function(jqXHR,textStatus, errorThrown) {
            alert("Error: " + errorThrown);
            console.log(jqXHR);
        }
    });

     //wikiApi-
     $.ajax({
        url: "php/getWikiinfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: $('#select-country option:selected').text()
        },
        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {            
            console.log(result);

            if (result.status.name == "ok") {
                $("#sumTitle").empty();
                $("#sumTitle").append(result['data']['0']['title']);
                $("#summary").html(result['data']['0']['summary']);
                $("#wikipediaUrl").attr('href', result['data']['0']['wikipediaUrl']);
                $("#wikipediaUrl").html(result['data']['0']['wikipediaUrl']);                
            }
        
        },
        complete: function () {
            $("#loader").addClass("hidden")
        },

        error: function(jqXHR,textStatus, errorThrown) {
            alert("Error: " + errorThrown);
            console.log(jqXHR);
        }
    }); 



    //News 

    $.ajax({
        url: "libs/php/getNews.php",
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

        let newsInfo = $("#news-info-card");

            newsInfo.html("");
          
                newsInfo.append($(
                   `<div class="col p-2">
                        <div id="card-news">
                            <div class="d-flex flex-column justify-content-end">                      
                                <a href="${result.articles[0].url}" target="_blank">${result.articles[0].title}</a><br>                               
                            </div>
                        </div>
                        <div class="row infoPanel p-0 m-0" aria-labelledby="headingThree">
                            <strong><span id='news-source'>${result.articles[0].source.Name}</span></strong> 
                        </div>
                        <div class="row infoPanel p-0 m-0" aria-labelledby="headingThree">
                            <strong><p>Author: <span id="articleAuthor">${result.articles[0].author}</span></p></strong>
                        </div>
                        <div class="row infoPanel p-0 m-0" aria-labelledby="headingThree">
                            <strong><p>Published at: <span id="published">${result.articles[0].publishedAt}</span></p></strong>
                        </div>
                    </div>`

                ));
    },

        complete: function () {
            $("#loader").addClass("hidden")
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Error: " + errorThrown);
            console.log(jqXHR);
        }
    }); 

});


//earthquake 

let earthquakesM;
earthquakesM = L.markerClusterGroup();
map.addLayer(earthquakesM);

const earthquakeIcon = L.icon({
    iconUrl: 'images/earthquakeIcon.png',
    iconSize: [50, 50],
    iconAnchor: [25, 45],
    popupAnchor: [0, -40]
});

function getEarthquakes(north, south, east, west) {
    earthquakesM.clearLayers();
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
            console.log(result);  
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
                                        <tr>
                                            <th scope="row">Depth:</th> <td class="text-end">${Math.round(earthquake.depth)} Km</td>
                                        </tr>
                                    </tbody>
                                </table>
                            <div>`
                );
                earthquakesM.addLayer(earthquakeMarker);
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Error: " + errorThrown);

            console.log(jqXHR);
        }
    });    
}

//Cities

let citiesM;
citiesM = L.markerClusterGroup();
map.addLayer(citiesM);

const cityIcon = L.icon({
    iconUrl: 'images/cityIcon.png',
    iconSize: [50, 50],
    iconAnchor: [25, 45],
    popupAnchor: [0, -40]
});

function getCities(north, south, east, west) {
    citiesM.clearLayers();
    $.ajax({
        url: "libs/php/getCities.php",
        type: 'POST',
        dataType: 'json',
        data: {
            north: north,
            south: south,
            east: east,
            west: west
        },
        success: function(result) {   
            console.log(result)
            const nearByCities = result.data;
            nearByCities.forEach(city => {
                const cityMarker = L.marker([`${city.lat}`, `${city.lng}`], {icon: cityIcon})
                    .bindPopup(`
                            <div class="container card h-100">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th><strong>City</strong></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th scope="row">Name:</th> <td class="text-end"> <strong>${city.name}</strong></td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Population:</th> <td class="text-end"> ${city.population.toLocaleString("en-US")}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            `);
                citiesM.addLayer(cityMarker);
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Error: " + errorThrown);

            console.log(jqXHR);
        }
    });    
}


// Layer Controller
const baseMaps = {
    "SatelliteMap": SatelliteMap,
    "WSM": wsm,
    "NatGeoWorldMap": Esri_NatGeoWorldMap
};

const markerLayers = {
    "Cities": citiesM,
    "Earthquakes": earthquakesM
};

L.control.layers(baseMaps, markerLayers).addTo(map)
    .setPosition("bottomright");

L.control.scale().addTo(map);


