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

// Satellite
const SatelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
});

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

// button to show Modal with Currency Exchange
const currencyButton = new L.easyButton('<i class="fas fa-donate"></i>', function() {
    $("#exchangeModal").modal("show");
}, "Currency Exchange");
currencyButton.addTo(map);


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
            //console.log(result);
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
            addAirport(north, south, east, west);
            addMuseum(north, south, east, west);
            addUniversity(north, south, east, west);
            addFerry(north, south, east, west);
        },

        error: function(jqXHR,textStatus, errorThrown) {
           // console.error(jqXHR);
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
           // console.log(result);

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
                        //console.log(result1);

                        $("#weatherTable tbody tr td").html("&nbsp;"); 
                        let weatherIconCurrent = result1.data.weather.current.weather[0].icon;
                        let weatherIconTomorrow = result1.data.weather.daily[0].weather[0].icon;
                        let weatherIcon2ndDay = result1.data.weather.daily[1].weather[0].icon;
                        $('#capitalWeatherIcon').html( `<img src="https://openweathermap.org/img/wn/${weatherIconCurrent}@2x.png" width="60px">`);
                        $('#capitalWeatherIconTomorrow').html( `<img src="https://openweathermap.org/img/wn/${weatherIconTomorrow}@2x.png" width="60px">`);
                        $('#capitalWeatherIcon2ndDay').html( `<img src="https://openweathermap.org/img/wn/${weatherIcon2ndDay}@2x.png" width="60px">`);
                        $('#txtCapitalWeatherCurrent').html( Math.round(result1.data.weather.current.temp) +'&#8451<br>');
                        $('#txtCapitalWeatherDescription').html( result1.data.weather.current.weather[0].description);
                        $('#txtCapitalWeatherDescriptionTomorrow').html( result1.data.weather.daily[0].weather[0].description);
                        $('#txtCapitalWeatherLo').html( Math.round(result1.data.weather.daily[0].temp.min) +'&#8451<br>');
                        $('#txtCapitalWeatherHi').html( Math.round(result1.data.weather.daily[0].temp.max) +'&#8451<br>');
                        $('#txtCapitalTomorrowsWeatherLo').html( Math.round(result1.data.weather.daily[1].temp.min) +'&#8451<br>');
                        $('#txtCapitalTomorrowsWeatherHi').html( Math.round(result1.data.weather.daily[1].temp.max) +'&#8451<br>');
                        $('#txtCapital2ndDayWeatherLo').html( Math.round(result1.data.weather.daily[2].temp.min) +'&#8451<br>');
                        $('#txtCapital2ndDayWeatherHi').html( Math.round(result1.data.weather.daily[2].temp.max) +'&#8451<br>');

                        let day1Date  = moment().add(1,'days').format('ddd Do').toLocaleString();
                        let day2Date = moment().add(2,'days').format('ddd Do').toLocaleString();
                        $('#day1Date').html(day1Date );
                        $('#day2Date').html(day2Date );
                    },
                    complete: function () {
                        $("#loader").addClass("hidden")
                    },
                    error: function(jqXHR,textStatus, errorThrown) {
                     //   console.error(jqXHR);
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
            country: $('#select-country option:selected').val()
        },

        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },

        success: function(result) {
   
          //  console.log(result);
            let countryInformation = $("#country-info");

            countryInformation .html("");
            countryInformation .append($(
                

                    `<div class='country-body'>
                    <div id = 'countryContainer' style='display:flex'> 
                        <div class="card h-100 pe-3 country" id='coatOfArms' style='float:left; max-width: 100px'>
                            <img src="${result[0].coatOfArms.png}"/>
                        </div> 
                        <div class="card-body country" style='float:center'>
                            <h3 id='flag-country'><strong>${result[0].name.common}</strong></h3>
                        </div>
                        <div class="card h-100 country" id='countryFlag' style='float:right; max-width: 100px'>
                                <img src="${result[0].flags.png}" alt="${result[0].flags.alt}"/><br>
                        </div> 
                    </div>
                        <table class="table flex table-striped table-sm" id='country-info-image'>
                            <tbody>
                                <tr>
                                    <th scope="row">Capital:</th><td>${result[0].capital}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Population:</th><td>${(result[0].population / 1000000).toFixed(1) + 'M'}</td>
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
                                    <th scope="row">Demonyms:</th><td>${result[0].demonyms[Object.keys(result[0].demonyms)[0]].m}</td>
                                </tr>
                                <tr>
                                <th scope="row">Languages:</th><td>${Object.values(result[0].languages)[0]}</td>
                                </tr>
                                <tr>
                                <th scope="row">Currencies:</th><td>${result[0].currencies[Object.keys(result[0].currencies)[0]].name + ' ' + result[0].currencies[Object.keys(result[0].currencies)[0]].symbol}</td>
                                </tr>
                                <tr>
                                <th scope="row">Driving side:</th><td>${result[0].car.side}</td>
                                </tr>                    
                            </tbody>
                        </table>                     
                    </div>`
                ));


                $('#currency-header').html();
                $('#countryCurrencyLabel').html(result[0].name.common + ' currency and rate');

                $('#newsModalTitle').html(' News - ' + result[0].name.common);
                $('#weatherCountry').html(result[0].capital + ', ' + result[0].name.common);
                $('#imagesModalCountry').html('Images of ' + result[0].name.common);

                
                
            },
            complete: function () {
                $("#loader").addClass("hidden")
            },
            error: function(jqXHR, textStatus, errorThrown) {
               // console.log(textStatus, errorThrown);
            }
    }); 
    
    
    $.ajax({
        url: "libs/php/getRestCountries.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: $('#select-country option:selected').val()
        },

        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },

        success: function(result) {
                currencyCode = Object.keys(result[0].currencies)[0];
                currencySymbol = result[0].currencies[currencyCode].symbol;
                currencyName = result[0].currencies[currencyCode].name; 
                $('#currencyCode').html(currencyCode);
                $('#exchangeInputLabel').html('Convert from ' + currencyCode + ' to USD');
       
              // Exchange Rates
              $.ajax({
                url: "libs/php/getExchangeRates.php",
                type: 'GET',
                dataType: 'json',
                
                beforeSend: function () {
                    $("#loader").removeClass("hidden");
                },
                success: function(result) {
                   // console.log(result);
                    if (result.status.name == "ok") {
                    
                    exchangeRate = result.exchangeRate.rates[currencyCode];
                    $('#nav-currency').html();
                    $('#exchangeRate').html(exchangeRate.toFixed(2) + ' '+  currencyCode + ' = 1 USD. <br>');                  
                    }
                },
                complete: function () {
                    $("#loader").addClass("hidden")
                },
                error: function(jqXHR, textStatus, errorThrown) {
                  //  console.log(textStatus, errorThrown);
                }
            });
        }
    });  

      //Location Images:
      $.ajax({
        url: "libs/php/getLocationImages.php",
        type: 'POST',
        dataType: 'json',
        data: {
            query: $('#select-country option:selected').text()
        },
        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {

           // console.log(result);
            $("#countryImages").empty();
            
            if (result.status.name == "ok") {
                

                for(var i = 0; i < result['data']['results'].length; i++){
                     
                    $("#countryImages").append("<img src='' alt='' id='image" + i +"'class='countryImages'><br><br>")
                    $("#countryImages").append("<p style='text-align: center; padding-bottom: 40px; font-weight: bold' id='description" + i +"'class='countryDescription'>")
                    $("#image" + i).attr('src', result['data']['results'][i]['urls']['regular']);
                    $("#image" + i).attr('alt', result['data']['results'][i]['alt_description']);
                    $("#description" + i).append(result['data']['results'][i]['alt_description']);
                }
            }
        
        },

        complete: function () {
            $("#loader").addClass("hidden")
        },

        error: function(jqXHR,textStatus, errorThrown) {
            alert("Error: " + errorThrown);
          //  console.log(jqXHR);
        }
    });

     //wikiApi-
     $.ajax({
        url: "libs/php/getWikiInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: $('#select-country option:selected').text()
        },
        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {            
          //  console.log(result);

            if (result.status.name == "ok") {
                $("#sumTitle").empty();
                $("#sumTitle").append(result['data']['0']['title']);
                $("#summary").html(result['data']['0']['summary']);
                $("#wikipediaUrl").attr('href', `https://${result.data[0].wikipediaUrl}`);
                $("#wikipediaUrl").html(result['data']['0']['wikipediaUrl']); 
                
            }
        },
        complete: function () {
            $("#loader").addClass("hidden")
        },

        error: function(jqXHR,textStatus, errorThrown) {
            alert("Error: " + errorThrown);
          //  console.log(jqXHR);
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
           // console.log(result);

        let newsInfo = $("#news-body");

            newsInfo.html("");

        for (var i=0; i<result.articles.length; i++) {
                newsInfo.append($(
                    `<table class="table table-borderless">
                    <tr>
                        <td rowspan="2" width="50%">
                          <img class="img-fluid rounded" src="${result.articles[i].urlToImage}" alt="News Image">
                        </td>                       
                        <td>
                          <a href="${result.articles[i].url}" class="fw-bold fs-6 text-black" target="_blank">${result.articles[i].title}</a>
                        </td>                       
                    </tr>  
                    <tr>                      
                    <td class="align-bottom pb-0">                     
                      <p class="fw-light fs-6 mb-1">${result.articles[i].source.name}</p>                     
                    </td>                               
                    </tr>
                    </table>
                    <hr>`               
                ));
                }
    },

        complete: function () {
            $("#loader").addClass("hidden")
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Error: " + errorThrown);
          //  console.log(jqXHR);
        }
    });

 }); 


// Currency Exchange

$("#exchangeInput").on('keyup', function(){   
    $.ajax({
      url: "libs/php/getExchangeRates.php",
      type: 'GET',
      dataType: 'json',
      base: $('#currencyCode').text(),
      beforeSend: function () {
          $("#loader").removeClass("hidden");
      },
      success: function(result) {
         // console.log(result);
          if (result.status.name == "ok") {

              var conversion = Number($('#exchangeInput').val() / result.exchangeRate.rates[$('#currencyCode').text()]);
              $("#toAmount").html(conversion.toFixed(2) + " $");
          }
      },
      complete: function () {
          $("#loader").addClass("hidden")
      },
      error: function(jqXHR, textStatus, errorThrown) {
         // console.log(textStatus, errorThrown);
      }
  });
});

//function to clear currency exchange result button

function clearContent(){
document.getElementById('toAmount').innerHTML = '';
}


//earthquake 
var earthquakesM = L.markerClusterGroup({
    polygonOptions: {
      fillColor: '#fff',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }}).addTo(map);

var earthquakeIcon = L.ExtraMarkers.icon({
    prefix: 'fa',
    icon: 'fa-house-crack',
    iconColor: 'black',
    markerColor: 'red',
    shape: 'star'
    });

map.addLayer(earthquakesM);

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
           // console.log(result);  
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

           // console.log(jqXHR);
        }
    });    
}


//Cities
var citiesM = L.markerClusterGroup({
    polygonOptions: {
      fillColor: '#fff',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }}).addTo(map);

var cityIcon = L.ExtraMarkers.icon({
    prefix: 'fa',
    icon: 'fa-city',
    iconColor: 'black',
    markerColor: 'pink',
    shape: 'square'
    });

map.addLayer(citiesM);

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
           // console.log(result)
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

           // console.log(jqXHR);
        }
    });    
}


//Universities
var universities = L.markerClusterGroup({
    polygonOptions: {
      fillColor: '#fff',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }}).addTo(map);

var universityIcon = L.ExtraMarkers.icon({
    prefix: 'fa',
    icon: 'fa-building-columns',
    iconColor: 'black',
    markerColor: 'yellow',
    shape: 'star'
    });

    function addUniversity(north, south, east, west) {
                         
        $.ajax({
          url: "libs/php/getUniversities.php",
          type: 'POST',
          dataType: 'json',
          data: {
            north: north,
            south: south,
            east: east,
            west: west
          },
          success: function (result) {
           // console.log(result);
              
              result.data.geonames.forEach(function(items) {
                
                L.marker([items.lat, items.lng], {icon: universityIcon})
                  .bindTooltip(items.name, {direction: 'top', sticky: true})
                  .addTo(universities);
                
              })
      
          },
          error: function (jqXHR, textStatus, errorThrown) {
            alert("Error: " + errorThrown);

            // console.log(jqXHR);
          }
        });      
    };
    

//Ferries
var ferries = L.markerClusterGroup({
    polygonOptions: {
      fillColor: '#fff',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }}).addTo(map);

var ferryIcon = L.ExtraMarkers.icon({
    prefix: 'fa',
    icon: 'fa-ferry',
    iconColor: 'black',
    markerColor: 'green',
    shape: 'penta'
    });

    function addFerry(north, south, east, west) {
                         
        $.ajax({
          url: "libs/php/getFerry.php",
          type: 'POST',
          dataType: 'json',
          data: {
            north: north,
            south: south,
            east: east,
            west: west
          },
          success: function (result) {
           // console.log(result);
              
              result.data.geonames.forEach(function(items) {
                
                L.marker([items.lat, items.lng], {icon: ferryIcon})
                  .bindTooltip(items.name, {direction: 'top', sticky: true})
                  .addTo(ferries);
                
              })
      
          },
          error: function (jqXHR, textStatus, errorThrown) {
            alert("Error: " + errorThrown);

            // console.log(jqXHR);
          }
        });      
    };


//Airports
var airports = L.markerClusterGroup({
    polygonOptions: {
      fillColor: '#fff',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }}).addTo(map);

var airportIcon = L.ExtraMarkers.icon({
    prefix: 'fa',
    icon: 'fa-plane',
    iconColor: 'black',
    markerColor: 'blue',
    shape: 'circle'
    });

    function addAirport(north, south, east, west) {
                         
        $.ajax({
          url: "libs/php/getAirports.php",
          type: 'POST',
          dataType: 'json',
          data: {
            north: north,
            south: south,
            east: east,
            west: west
          },
          success: function (result) {
           // console.log(result);
              
              result.data.geonames.forEach(function(items) {
                
                L.marker([items.lat, items.lng], {icon: airportIcon})
                  .bindTooltip(items.name, {direction: 'top', sticky: true})
                  .addTo(airports);
                
              })
      
          },
          error: function (jqXHR, textStatus, errorThrown) {
            alert("Error: " + errorThrown);

            // console.log(jqXHR);
          }
        });      
    };


//Museums
var museums = L.markerClusterGroup({
    polygonOptions: {
      fillColor: '#fff',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }}).addTo(map);

var museumIcon = L.ExtraMarkers.icon({
    prefix: 'fa',
    icon: 'fa-landmark',
    iconColor: 'black',
    markerColor: 'white',
    shape: 'square'
    });

    function addMuseum(north, south, east, west) {

        showToast("Getting museums, cities, earthquakes, universities and airports", 3500, false);
                         
        $.ajax({
          url: "libs/php/getMuseums.php",
          type: 'POST',
          dataType: 'json',
          data: {
            north: north,
            south: south,
            east: east,
            west: west
          },
          success: function (result) {
           // console.log(result);
              
              result.data.geonames.forEach(function(items) {
                
                L.marker([items.lat, items.lng], {icon: museumIcon})
                  .bindTooltip(items.name, {direction: 'top', sticky: true})
                  .addTo(museums);
                
              })
      
          },
          error: function (jqXHR, textStatus, errorThrown) {
            showToast("Airports - server error", 4000, false);

            // console.log(jqXHR);
          }
        });      
    };

    // functions

function showToast(message, duration, close) {

    Toastify({
      text: message,
      duration: duration,
      newWindow: true,
      close: close,
      gravity: "top", // `top` or `bottom`
      position: "center", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "#004687"
      },
      onClick: function () {} // Callback after click
    }).showToast();
    
    }



// Layer Controller
const baseMaps = {
    "SatelliteMap": SatelliteMap,
    "WSM": wsm,
    "NatGeoWorldMap": Esri_NatGeoWorldMap
};

const markerLayers = {
    "Airports": airports,
    "Museums": museums,
    "Cities": citiesM,
    "Universities": universities,
    "Earthquakes": earthquakesM
};

L.control.layers(baseMaps, markerLayers).addTo(map)
    .setPosition("topright");

L.control.scale().addTo(map);


